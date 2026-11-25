// payment-webhook: recebe os webhooks do Stripe (POST .../payment-webhook/stripe) e do Asaas (POST .../payment-webhook/asaas)
// e mantem as tabelas subscriptions e invoices em dia. Deploy com verify_jwt = false (a autenticacao e a assinatura/token do gateway).
// Segredos (Supabase > Edge Functions > Secrets): STRIPE_WEBHOOK_SECRET, ASAAS_WEBHOOK_TOKEN.
// Convencao para ligar o pagamento ao aluno:
//   Stripe: no Payment Link/Checkout use client_reference_id = id do aluno (profiles.id) e metadata.plan_slug = slug do plano.
//   Asaas : ao criar a assinatura use externalReference = "<id do aluno>" ou "<id do aluno>|<slug do plano>".
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const J = { "content-type": "application/json" };
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: J });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const iso = (sec?: number | null) => (sec ? new Date(sec * 1000).toISOString() : null);

function safeEq(a: string, b: string) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

/* Stripe-Signature: t=...,v1=... ; assinatura = HMAC-SHA256(secret, `${t}.${corpo}`) */
async function stripeValid(raw: string, header: string, secret: string) {
  const p: Record<string, string[]> = {};
  for (const part of header.split(",")) { const [k, v] = part.split("="); if (k && v) (p[k.trim()] ||= []).push(v.trim()); }
  const t = p.t?.[0];
  if (!t || !p.v1?.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${raw}`)));
  return p.v1.some((v) => safeEq(v, sig));
}

async function planBySlug(slug?: string | null) {
  if (!slug) return null;
  const { data } = await sb.from("billing_plans").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function upsertSub(row: { student_id?: string | null; plan_id?: number | null; gateway: string; customer?: string | null; sub_id: string; status: string; period_end?: string | null }) {
  const { data: ex } = await sb.from("subscriptions").select("id,student_id,plan_id").eq("gateway", row.gateway).eq("gateway_subscription_id", row.sub_id).maybeSingle();
  if (ex) {
    const upd: any = { status: row.status };
    if (row.customer) upd.gateway_customer_id = row.customer;
    if (row.period_end) upd.current_period_end = row.period_end;
    if (row.plan_id && !ex.plan_id) upd.plan_id = row.plan_id;
    const { error } = await sb.from("subscriptions").update(upd).eq("id", ex.id);
    if (error) throw error;
    return ex.id as number;
  }
  if (!row.student_id || !UUID.test(row.student_id)) return null; // sem aluno identificado: nao cria
  const { data, error } = await sb.from("subscriptions").insert({
    student_id: row.student_id, plan_id: row.plan_id ?? null, gateway: row.gateway, gateway_customer_id: row.customer ?? null,
    gateway_subscription_id: row.sub_id, status: row.status, current_period_end: row.period_end ?? null,
  }).select("id").single();
  if (error) throw error;
  return data.id as number;
}

async function subIdOf(gateway: string, subGw?: string | null) {
  if (!subGw) return null;
  const { data } = await sb.from("subscriptions").select("id").eq("gateway", gateway).eq("gateway_subscription_id", subGw).maybeSingle();
  return data?.id ?? null;
}

async function upsertInvoice(subscription_id: number, r: { id: string; valor: number; moeda: string; status: string; paid_at?: string | null; url?: string | null }) {
  const moeda = r.moeda.toUpperCase() === "BRL" ? "BRL" : "EUR";
  const { data: ex } = await sb.from("invoices").select("id").eq("subscription_id", subscription_id).eq("gateway_invoice_id", r.id).maybeSingle();
  const row: any = { valor_centavos: r.valor, moeda, status: r.status, paid_at: r.paid_at ?? null };
  if (r.url) row.invoice_url = r.url;
  const q = ex ? sb.from("invoices").update(row).eq("id", ex.id) : sb.from("invoices").insert({ ...row, subscription_id, gateway_invoice_id: r.id });
  const { error } = await q;
  if (error) throw error;
}

/* ---------------- checkout dentro do app ---------------- */
/* Pagamento confirmado: marca o checkout como pago, avisa o professor com um pedido ja pago e,
   no pagamento a vista (sem assinatura no gateway), cria a assinatura local ate o fim do periodo pago. */
async function markCheckout(gateway: string, ref?: string | null, oneOff = false) {
  if (!ref) return false;
  const { data: ck } = await sb.from("checkouts").select("*").eq("gateway", gateway).eq("gateway_ref", ref).maybeSingle();
  if (!ck) return false;
  if (ck.status !== "paid") await sb.from("checkouts").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", ck.id);
  if (ck.charge_id) { // mensalidade paga no app: baixa automatica da parcela
    const met = ck.metodo === "pix" ? "Pix" : "cartão";
    const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
    await sb.from("charges").update({ paid_on: hoje, note: `Pago no app por ${met} · checkout #${ck.id}` }).eq("id", ck.charge_id).is("paid_on", null);
    console.log("mensalidade paga", ck.charge_id, met);
    return true;
  }
  if (oneOff) {
    const end = new Date(); end.setMonth(end.getMonth() + (ck.meses || 1));
    await upsertSub({ student_id: ck.user_id, plan_id: await planBySlug(ck.slug), gateway, sub_id: ref, status: "active", period_end: end.toISOString() });
  }
  {
    const met = ck.metodo === "pix" ? "Pix" : "cartão";
    const { data: dup } = await sb.from("plan_requests").select("id").eq("user_id", ck.user_id).like("obs", `%checkout #${ck.id}`).maybeSingle();
    if (!dup) await sb.from("plan_requests").insert({
      user_id: ck.user_id, slug: ck.slug, plano: ck.plano, periodo: ck.periodo, moeda: ck.moeda, valor_centavos: ck.valor_centavos,
      desconto: ck.desconto, codigo: ck.codigo, tipo: "novo", status: "aberto", obs: `Pago no app por ${met} · checkout #${ck.id}`,
    });
    console.log("checkout pago", ck.id, met);
  }
  return true;
}
async function failCheckout(gateway: string, ref: string | null | undefined, status: string) {
  if (!ref) return;
  await sb.from("checkouts").update({ status }).eq("gateway", gateway).eq("gateway_ref", ref).eq("status", "pending");
}

/* ---------------- Stripe ---------------- */
const STRIPE_SUB: Record<string, string> = { active: "active", trialing: "active", past_due: "past_due", unpaid: "past_due", canceled: "canceled", paused: "paused", incomplete: "incomplete", incomplete_expired: "canceled" };

async function stripeEvent(ev: any) {
  const o = ev.data?.object || {};
  switch (ev.type) {
    case "checkout.session.completed": {
      if (o.mode !== "subscription" || !o.subscription) return "ignored";
      const student = o.client_reference_id || o.metadata?.student_id;
      const plan = await planBySlug(o.metadata?.plan_slug);
      const id = await upsertSub({ student_id: student, plan_id: plan, gateway: "stripe", customer: o.customer, sub_id: o.subscription, status: "active" });
      return id ? "ok" : "no-student";
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const pe = o.current_period_end ?? o.items?.data?.[0]?.current_period_end;
      const status = ev.type.endsWith("deleted") ? "canceled" : (STRIPE_SUB[o.status] || "pending");
      const plan = await planBySlug(o.metadata?.plan_slug);
      const id = await upsertSub({ student_id: o.metadata?.student_id, plan_id: plan, gateway: "stripe", customer: o.customer, sub_id: o.id, status, period_end: iso(pe) });
      return id ? "ok" : "no-student";
    }
    case "invoice.created": case "invoice.finalized": case "invoice.paid": case "invoice.payment_succeeded":
    case "invoice.payment_failed": case "invoice.voided": case "invoice.marked_uncollectible": {
      const subGw = o.subscription || o.parent?.subscription_details?.subscription;
      const sid = await subIdOf("stripe", subGw);
      if (!sid) return "no-subscription";
      const paid = ev.type === "invoice.paid" || ev.type === "invoice.payment_succeeded" || o.status === "paid";
      const status = paid ? "paid" : ev.type === "invoice.payment_failed" ? "failed" : o.status === "void" ? "void" : o.status === "uncollectible" ? "failed" : "open";
      await upsertInvoice(sid, { id: o.id, valor: paid ? (o.amount_paid ?? o.total ?? 0) : (o.amount_due ?? o.total ?? 0), moeda: o.currency || "eur", status, paid_at: paid ? iso(o.status_transitions?.paid_at) || new Date().toISOString() : null, url: o.hosted_invoice_url });
      if (paid) { await sb.from("subscriptions").update({ status: "active" }).eq("id", sid).in("status", ["past_due", "incomplete", "pending"]); await markCheckout("stripe", subGw); }
      if (ev.type === "invoice.payment_failed") await sb.from("subscriptions").update({ status: "past_due" }).eq("id", sid).eq("status", "active");
      return "ok";
    }
    case "payment_intent.succeeded": {
      if (o.invoice) return "ignored"; // pagamento de fatura de assinatura: tratado em invoice.paid
      return (await markCheckout("stripe", o.id, true)) ? "ok" : "ignored";
    }
    case "payment_intent.payment_failed": {
      if (!o.invoice) await failCheckout("stripe", o.id, "failed");
      return "ok";
    }
    default: return "ignored";
  }
}

/* ---------------- Asaas ---------------- */
const ASAAS_SUB: Record<string, string> = { ACTIVE: "active", INACTIVE: "canceled", EXPIRED: "canceled" };
const ASAAS_PAY: Record<string, string> = {
  PENDING: "open", AWAITING_RISK_ANALYSIS: "open", CONFIRMED: "paid", RECEIVED: "paid", RECEIVED_IN_CASH: "paid", OVERDUE: "overdue",
  REFUNDED: "refunded", REFUND_REQUESTED: "refunded", CHARGEBACK_REQUESTED: "refunded", CHARGEBACK_DISPUTE: "refunded", DELETED: "void",
};
const split = (ref?: string | null) => { const [a, b] = String(ref || "").split("|"); return { student: a?.trim(), plan: b?.trim() }; };

async function asaasEvent(ev: any) {
  const t: string = ev.event || "";
  if (t.startsWith("SUBSCRIPTION_") && ev.subscription) {
    const s = ev.subscription, r = split(s.externalReference);
    const status = t === "SUBSCRIPTION_DELETED" || t === "SUBSCRIPTION_INACTIVATED" ? "canceled" : (ASAAS_SUB[s.status] || "pending");
    const id = await upsertSub({ student_id: r.student, plan_id: await planBySlug(r.plan), gateway: "asaas", customer: s.customer, sub_id: s.id, status, period_end: s.nextDueDate ? new Date(s.nextDueDate + "T12:00:00Z").toISOString() : null });
    return id ? "ok" : "no-student";
  }
  if (t.startsWith("PAYMENT_") && ev.payment) {
    const p = ev.payment;
    if (!p.subscription) { // cobranca avulsa: pagamento a vista feito no app
      const st = t === "PAYMENT_DELETED" ? "void" : (ASAAS_PAY[p.status] || "open");
      if (st === "paid") return (await markCheckout("asaas", p.id, true)) ? "ok" : "no-checkout";
      if (st === "void" || st === "overdue") await failCheckout("asaas", p.id, "expired");
      return "ok";
    }
    let sid = await subIdOf("asaas", p.subscription);
    if (!sid && p.subscription) { // pagamento chegou antes do evento da assinatura: cria se o aluno estiver no externalReference
      const r = split(p.externalReference);
      sid = await upsertSub({ student_id: r.student, plan_id: await planBySlug(r.plan), gateway: "asaas", customer: p.customer, sub_id: p.subscription, status: "active" });
    }
    if (!sid) return "no-subscription";
    const status = t === "PAYMENT_DELETED" ? "void" : (ASAAS_PAY[p.status] || "open");
    const paid = status === "paid";
    await upsertInvoice(sid, { id: p.id, valor: Math.round(Number(p.value || 0) * 100), moeda: "BRL", status, paid_at: paid ? new Date((p.clientPaymentDate || p.paymentDate || new Date().toISOString().slice(0, 10)) + (String(p.clientPaymentDate || p.paymentDate || "").length === 10 ? "T12:00:00Z" : "")).toISOString() : null, url: p.invoiceUrl });
    if (paid) { await sb.from("subscriptions").update({ status: "active" }).eq("id", sid).in("status", ["past_due", "pending", "incomplete"]); await markCheckout("asaas", p.subscription); }
    if (status === "overdue") await sb.from("subscriptions").update({ status: "past_due" }).eq("id", sid).eq("status", "active");
    return "ok";
  }
  return "ignored";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return out({ error: "method" }, 405);
  const route = new URL(req.url).pathname.replace(/\/+$/, "").split("/").pop();
  const raw = await req.text();
  try {
    if (route === "stripe") {
      const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!secret) return out({ error: "stripe-nao-configurado" }, 503);
      if (!(await stripeValid(raw, req.headers.get("stripe-signature") || "", secret))) return out({ error: "assinatura-invalida" }, 400);
      return out({ received: true, result: await stripeEvent(JSON.parse(raw)) });
    }
    if (route === "asaas") {
      const token = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
      if (!token) return out({ error: "asaas-nao-configurado" }, 503);
      if (!safeEq(req.headers.get("asaas-access-token") || "", token)) return out({ error: "token-invalido" }, 401);
      return out({ received: true, result: await asaasEvent(JSON.parse(raw)) });
    }
    return out({ error: "rota-desconhecida" }, 404);
  } catch (e) {
    console.error("payment-webhook", route, e);
    return out({ error: "erro-interno" }, 500); // o gateway tenta de novo
  }
});
