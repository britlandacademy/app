// checkout: pagamento dentro do app.
//   Pix (BRL, Asaas): cobranca avulsa (a vista) ou assinatura mensal por Pix; devolve QR Code e copia-e-cola.
//   Cartao (BRL, Asaas): assinatura mensal no cartao (mensal ou fidelidade de 6 meses), dados enviados uma vez e tokenizados pelo Asaas.
//   Cartao (EUR, Stripe): assinatura (mensal/fidelidade) ou PaymentIntent (a vista); devolve client_secret para o Payment Element.
// O preco e sempre recalculado aqui (o navegador nao decide valor). Dados de cartao nunca sao gravados nem registrados em log.
// Segredos: ASAAS_API_KEY, ASAAS_ENV (sandbox|production), STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY.
// Deploy com verify_jwt = true.
import { createClient } from "npm:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "content-type": "application/json" } });

const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY") || "";
const ASAAS_URL = (Deno.env.get("ASAAS_ENV") || "production") === "sandbox" ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const STRIPE_PK = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";

/* ---------- regras de preco (espelho de js/planpick.js) ---------- */
const PROMO_END = Date.UTC(2026, 11, 1, 3, 0, 0); // 30/11/2026 fim do dia em Brasilia
const promo = () => Date.now() < PROMO_END;
const fam = (slug: string) => slug.replace(/-(brl|eur)$/, "");
function periodOf(k: string, cur: string) {
  switch (k) {
    case "mensal": return { off: 0, months: 1 };
    case "cartao6": return { off: cur === "BRL" ? (promo() ? 20 : 5) : 10, months: 1 };
    case "avista3": return { off: 5, months: 3 };
    case "avista6": return { off: promo() ? 30 : 10, months: 6 };
  }
  return null;
}
/* formas aceitas por moeda e periodo */
function allowed(cur: string, per: string, metodo: string) {
  if (cur === "BRL") {
    if (metodo === "pix") return per === "mensal" || per === "avista3" || per === "avista6";
    if (metodo === "card") return per === "mensal" || per === "cartao6";
  } else {
    if (metodo === "card") return true;
  }
  return false;
}

/* ---------- utilidades ---------- */
const onlyDigits = (s: unknown) => String(s ?? "").replace(/\D/g, "");
function cpfOk(c: string) {
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const dv = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += +c[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === +c[9] && dv(10) === +c[10];
}
const todayBR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);

async function asaas(path: string, init: { method?: string; body?: unknown } = {}) {
  const r = await fetch(ASAAS_URL + path, {
    method: init.method || "GET",
    headers: { "access_token": ASAAS_KEY, "content-type": "application/json", "user-agent": "BritlandAcademy" },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (j?.errors?.[0]?.description as string) || `asaas ${r.status}`;
    throw Object.assign(new Error(msg), { user: true });
  }
  return j;
}

function form(o: Record<string, unknown>, pre = "", acc: string[] = []) {
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    const key = pre ? `${pre}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) form(v as Record<string, unknown>, key, acc);
    else if (Array.isArray(v)) v.forEach((x, i) => typeof x === "object" ? form(x as Record<string, unknown>, `${key}[${i}]`, acc) : acc.push(`${encodeURIComponent(`${key}[]`)}=${encodeURIComponent(String(x))}`));
    else acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return acc.join("&");
}
async function stripe(path: string, body?: Record<string, unknown>) {
  const r = await fetch("https://api.stripe.com/v1" + path, {
    method: body ? "POST" : "GET",
    headers: { "authorization": `Bearer ${STRIPE_KEY}`, "content-type": "application/x-www-form-urlencoded", "stripe-version": "2024-06-20" },
    body: body ? form(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j?.error?.message || `stripe ${r.status}`), { user: true });
  return j;
}

/* ---------- handler ---------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return out({ error: "method" }, 405);

  const auth = req.headers.get("authorization") || "";
  const userSb = createClient(URL_, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { authorization: auth } }, auth: { persistSession: false } });
  const { data: u } = await userSb.auth.getUser();
  const user = u?.user;
  if (!user) return out({ error: "login" }, 401);

  let b: any = {};
  try { b = await req.json(); } catch { return out({ error: "json" }, 400); }

  /* o app pergunta o que esta ligado para mostrar ou apagar cada forma de pagamento */
  if (b.action === "config") return out({ asaas: !!ASAAS_KEY, stripe: !!(STRIPE_KEY && STRIPE_PK), stripePk: STRIPE_PK || null });

  if (b.action !== "start") return out({ error: "action" }, 400);

  const slug = String(b.slug || ""), per = String(b.periodo || ""), metodo = String(b.metodo || "");
  const { data: plan } = await admin.from("billing_plans").select("id,slug,nome,moeda,valor_centavos").eq("slug", slug).maybeSingle();
  if (!plan) return out({ error: "plano" }, 400);
  const cur = plan.moeda as string;
  const P = periodOf(per, cur);
  if (!P) return out({ error: "periodo" }, 400);
  if (!allowed(cur, per, metodo)) return out({ error: "forma" }, 400);
  if (cur === "BRL" && !ASAAS_KEY) return out({ error: "asaas-off" }, 503);
  if (cur === "EUR" && !(STRIPE_KEY && STRIPE_PK)) return out({ error: "stripe-off" }, 503);

  /* dupla: 10% so no Fluency Club; descontos nao acumulam, vale o maior */
  const dupla = !!b.dupla && fam(slug) === "fluency-club" ? 10 : 0;
  const off = Math.max(P.off, dupla);
  const via = dupla > P.off ? "dupla-10" : (P.off ? `${per}-${P.off}` : null);
  const mensal = Math.round(plan.valor_centavos * (1 - off / 100));
  const total = mensal * P.months;
  const ref = `${user.id}|${slug}|${per}`;
  const desc = `Britland Academy · ${plan.nome}` + (P.months > 1 ? ` · ${P.months} meses` : "");

  const { data: prof } = await admin.from("profiles").select("name,email").eq("id", user.id).maybeSingle();
  const name = String(b.holder?.name || prof?.name || user.email || "Aluno").slice(0, 100);
  const email = String(prof?.email || user.email || "");

  const { data: ck, error: e0 } = await admin.from("checkouts").insert({
    user_id: user.id, slug, plano: plan.nome, periodo: per, moeda: cur, meses: P.months,
    valor_centavos: mensal, total_centavos: total, desconto: via, codigo: b.codigo ? String(b.codigo).slice(0, 40) : null,
    metodo, gateway: cur === "BRL" ? "asaas" : "stripe",
  }).select("id").single();
  if (e0) return out({ error: "db" }, 500);
  const upd = (o: Record<string, unknown>) => admin.from("checkouts").update(o).eq("id", ck.id);

  try {
    /* ================= Asaas (BRL) ================= */
    if (cur === "BRL") {
      const cpf = onlyDigits(b.cpf || b.holder?.cpf);
      if (!cpfOk(cpf)) { await upd({ status: "failed", erro: "cpf" }); return out({ error: "cpf" }, 400); }
      // cliente: reaproveita o do aluno se ja existir
      const { data: prev } = await admin.from("checkouts").select("gateway_customer_id").eq("user_id", user.id).eq("gateway", "asaas").not("gateway_customer_id", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
      let customer = prev?.gateway_customer_id as string | undefined;
      if (!customer) {
        const c = await asaas("/customers", { method: "POST", body: { name, cpfCnpj: cpf, email: email || undefined, externalReference: user.id, notificationDisabled: true } });
        customer = c.id;
      } else {
        await asaas(`/customers/${customer}`, { method: "PUT", body: { cpfCnpj: cpf } }).catch(() => null);
      }
      await upd({ gateway_customer_id: customer });

      if (metodo === "pix") {
        let payId: string;
        if (per === "mensal") {
          const s = await asaas("/subscriptions", { method: "POST", body: { customer, billingType: "PIX", value: mensal / 100, nextDueDate: todayBR(), cycle: "MONTHLY", description: desc, externalReference: ref } });
          await upd({ gateway_ref: s.id });
          const ps = await asaas(`/subscriptions/${s.id}/payments`);
          payId = ps?.data?.[0]?.id;
          if (!payId) throw Object.assign(new Error("Cobrança ainda não gerada. Tente de novo em instantes."), { user: true });
        } else {
          const p = await asaas("/payments", { method: "POST", body: { customer, billingType: "PIX", value: total / 100, dueDate: todayBR(), description: desc, externalReference: ref } });
          payId = p.id;
          await upd({ gateway_ref: payId });
        }
        const q = await asaas(`/payments/${payId}/pixQrCode`);
        await upd({ pix_payload: q.payload, pix_image: q.encodedImage, pix_expires_at: q.expirationDate ? new Date(String(q.expirationDate).replace(" ", "T") + "-03:00").toISOString() : null });
        return out({ id: ck.id, kind: "pix", payload: q.payload, image: q.encodedImage, expires: q.expirationDate || null, total });
      }

      // cartao: sempre assinatura mensal (mensal ou fidelidade de 6 meses)
      const cc = b.card || {}, h = b.holder || {};
      const [mm, yy] = String(cc.exp || "").split("/").map((x: string) => x.trim());
      const s = await asaas("/subscriptions", {
        method: "POST",
        body: {
          customer, billingType: "CREDIT_CARD", value: mensal / 100, nextDueDate: todayBR(), cycle: "MONTHLY",
          description: desc + (per === "cartao6" ? " · fidelidade 6 meses" : ""), externalReference: ref,
          creditCard: { holderName: String(cc.name || name), number: onlyDigits(cc.number), expiryMonth: mm, expiryYear: yy && yy.length === 2 ? "20" + yy : yy, ccv: onlyDigits(cc.cvc) },
          creditCardHolderInfo: { name: String(cc.name || name), email, cpfCnpj: cpf, postalCode: onlyDigits(h.cep), addressNumber: String(h.number || "").slice(0, 10), phone: onlyDigits(h.phone), mobilePhone: onlyDigits(h.phone) },
          remoteIp: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined,
        },
      });
      await upd({ gateway_ref: s.id });
      // a primeira cobranca e feita na hora; o webhook confirma, mas ja respondemos com o que o Asaas diz
      const ps = await asaas(`/subscriptions/${s.id}/payments`).catch(() => null);
      const st = ps?.data?.[0]?.status as string | undefined;
      const paid = st === "CONFIRMED" || st === "RECEIVED";
      if (paid) await upd({ status: "paid", paid_at: new Date().toISOString() });
      return out({ id: ck.id, kind: "card", status: paid ? "paid" : "pending" });
    }

    /* ================= Stripe (EUR) ================= */
    const prevS = await admin.from("checkouts").select("gateway_customer_id").eq("user_id", user.id).eq("gateway", "stripe").not("gateway_customer_id", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    let customer = prevS.data?.gateway_customer_id as string | undefined;
    if (!customer) customer = (await stripe("/customers", { email: email || undefined, name, metadata: { student_id: user.id } })).id;
    await upd({ gateway_customer_id: customer });
    const meta = { student_id: user.id, plan_slug: slug, checkout_id: String(ck.id), periodo: per };

    if (per === "mensal" || per === "cartao6") {
      const price = await stripe("/prices", { currency: "eur", unit_amount: mensal, recurring: { interval: "month" }, product_data: { name: plan.nome } });
      const sub = await stripe("/subscriptions", {
        customer, items: [{ price: price.id }], payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"], metadata: meta, description: desc,
      });
      await upd({ gateway_ref: sub.id });
      return out({ id: ck.id, kind: "stripe", clientSecret: sub.latest_invoice?.payment_intent?.client_secret, pk: STRIPE_PK, total: mensal });
    }
    const pi = await stripe("/payment_intents", { amount: total, currency: "eur", customer, description: desc, metadata: meta, "automatic_payment_methods": { enabled: "true", allow_redirects: "never" } });
    await upd({ gateway_ref: pi.id });
    return out({ id: ck.id, kind: "stripe", clientSecret: pi.client_secret, pk: STRIPE_PK, total });
  } catch (e) {
    const user_ = (e as any)?.user;
    const msg = user_ ? String((e as Error).message).slice(0, 300) : "erro";
    console.error("checkout", ck.id, user_ ? msg : e); // nunca registra dados de cartao
    await upd({ status: "failed", erro: msg });
    return out({ error: user_ ? "gateway" : "interno", message: user_ ? msg : null }, user_ ? 402 : 500);
  }
});
