// contract-send: gera o PDF do contrato e envia ao Autentique (aluno + escola assinam).
// Chamada pelo painel (admin logado). Segredos: AUTENTIQUE_TOKEN, SCHOOL_EMAIL, SCHOOL_NAME, AUTENTIQUE_SANDBOX (opcional "1"),
// SMTP_USER, SMTP_PASS (Gmail da escola). O aluno entra no Autentique so por link (DELIVERY_METHOD_LINK) e o convite
// sai da escola, de contact@ (modelo A "Boas-vindas"); MAIL_FROM_CONTACT troca o remetente, se precisar.
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

// Tabela de preços mensais (centavos nao: valor inteiro) por plano e moeda. Fonte: claude/planos-e-precos.md
const PRICE: Record<string, Record<string, number>> = {
  Essential: { BRL: 260, EUR: 50 },
  "Fluency Club": { BRL: 790, EUR: 168 },
  "VIP Intensive": { BRL: 1800, EUR: 360 },
  Business: { BRL: 1200, EUR: 200, USD: 225 },
  VIP: { EUR: 120, BRL: 700, USD: 134 }, Turma: { EUR: 80, BRL: 480, USD: 90 }, Intensivo: { EUR: 200, BRL: 1200, USD: 225 },
};
const PERIODO: Record<string, { label: string; months: number }> = {
  mensal: { label: "Mensal, sem permanência mínima", months: 1 },
  cartao6: { label: "Cartão, cobrança mensal, com fidelidade de 6 meses", months: 6 },
  avista3: { label: "3 meses pagos de forma antecipada", months: 3 },
  avista6: { label: "6 meses pagos de forma antecipada", months: 6 },
};
function money(cur: string, v: number) {
  const s = v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (cur === "BRL" ? "R$ " : cur === "USD" ? "US$ " : "€") + s;
}

function fill(body: string, v: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => (v[k] ?? `{{${k}}}`));
}
const clean = (s: string) => s.replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ€–—‘’“”•]/g, "?");

/* ---------- e-mail do contrato (modelo A "Boas-vindas", mesmo visual da mensalidade) ---------- */
const SITE_LOGO = Deno.env.get("SUPABASE_URL") + "/storage/v1/object/public/pix-qr/brand/britland-shield-v1.png";
const esc = (x: unknown) => String(x ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]!));
function contractMail(first: string, link: string, es: boolean) {
  const n = esc(first);
  const T = es
    ? { sub: "Tu contrato con Britland Academy", h: `¡Bienvenido a Britland, ${n}!`, e: "Tu contrato está listo.", p1: "Preparamos el contrato de prestación de servicios educativos con todo lo que acordamos: curso, plan, valor y fecha de inicio.", p2: "Solo tienes que leerlo con calma y firmarlo en el móvil o en el ordenador. Tarda cerca de un minuto.", b: "Leer y firmar el contrato", note: "La firma es electrónica, hecha por Autentique, y tiene validez jurídica. Cuando las dos partes firmen, recibirás la copia firmada en PDF.", sig: "Secretaría · Inglés y español 100% online" }
    : { sub: "Seu contrato com a Britland Academy", h: `Bem-vindo à Britland, ${n}!`, e: "Seu contrato está pronto.", p1: "Preparamos o contrato de prestação de serviços educacionais com tudo o que combinamos: curso, plano, valor e data de início.", p2: "É só ler com calma e assinar pelo celular ou computador. Leva cerca de um minuto.", b: "Ler e assinar o contrato", note: "A assinatura é eletrônica, feita pelo Autentique, e tem validade jurídica. Depois que as duas partes assinarem, você recebe a cópia assinada em PDF.", sig: "Secretaria · Inglês e espanhol 100% online" };
  const L = esc(link);
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EFE9D9"><tr><td align="center" style="padding:20px 10px"><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#FAF8F3" style="width:100%;max-width:560px;border-radius:6px;overflow:hidden"><tr><td bgcolor="#0B1733" style="padding:22px 30px;border-bottom:4px solid #C9A13B"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:14px"><img src="${SITE_LOGO}" width="48" alt="Britland Academy" style="display:block;border:0"></td><td style="font-family:Georgia,serif;color:#F2F5FA"><div style="font-size:21px;font-weight:bold;letter-spacing:2px">BRITLAND</div><div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:5px;color:#EC4654;font-weight:bold">ACADEMY</div></td></tr></table></td></tr><tr><td style="padding:30px 30px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#17202F"><div style="font-family:Georgia,serif;font-size:26px;line-height:1.2;font-weight:bold;color:#0B1733;margin:0 0 6px">${T.h}</div><div style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:#B3202A;margin:0 0 18px">${T.e}</div><p style="margin:0 0 14px">${T.p1}</p><p style="margin:0 0 20px">${T.p2}</p><div style="text-align:center;margin:0 0 22px"><a href="${L}" style="display:inline-block;background:#C9A13B;color:#0B1733;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;text-decoration:none;padding:13px 28px;border-radius:999px">${T.b}</a></div><p style="margin:0 0 6px;font-size:13px;color:#5A6577">${T.note}</p></td></tr><tr><td style="padding:14px 30px 26px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#17202F"><div style="border-top:1px solid #d9d2bf;padding-top:14px"><div style="font-family:Georgia,serif;font-weight:bold;font-size:16px;color:#0B1733">Britland Academy</div><div style="color:#5A6577">${T.sig}</div></div></td></tr><tr><td bgcolor="#0B1733" style="padding:14px 30px;font-family:Arial,sans-serif;font-size:11px;line-height:1.5;color:#B4BFD6;text-align:center">Britland Academy · Cruz e Trento Cursos de Idiomas · Franca, SP</td></tr></table></td></tr></table>`;
  const text = `${T.h}\n${T.e}\n\n${T.p1}\n${T.p2}\n\n${T.b}: ${link}\n\n${T.note}\n\nBritland Academy · ${es ? "Secretaría" : "Secretaria"}`;
  return { subject: T.sub, html, text };
}
async function sendContractMail(to: string, first: string, link: string, es: boolean) {
  const pass = (Deno.env.get("SMTP_PASS") || "").replace(/\s/g, ""), user = Deno.env.get("SMTP_USER");
  if (!pass || !user) throw new Error("sem SMTP_PASS");
  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
  const client = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
  const m = contractMail(first, link, es);
  try { await client.send({ from: Deno.env.get("MAIL_FROM_CONTACT") || "Britland Academy <contact@britlandacademy.co.uk>", to, subject: m.subject, content: m.text, html: m.html }); }
  finally { try { await client.close(); } catch (_e) { /* ignora */ } }
}

async function makePdf(text: string, title: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595, H = 842, M = 48, maxW = W - 2 * M;
  let page = pdf.addPage([W, H]), y = H - M;
  const line = (t: string, f: typeof font, size: number, gap: number) => {
    if (y < M + size) { page = pdf.addPage([W, H]); y = H - M; }
    page.drawText(t, { x: M, y, size, font: f, color: rgb(0.1, 0.1, 0.1) }); y -= size + gap;
  };
  const wrap = (t: string, f: typeof font, size: number, gap: number) => {
    const words = clean(t).split(/\s+/); let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > maxW && cur) { line(cur, f, size, gap); cur = w; } else cur = test;
    }
    if (cur) line(cur, f, size, gap);
  };
  for (const raw of text.split("\n")) {
    const l = raw.trimEnd();
    if (!l.trim()) { y -= 3; continue; }
    if (l.startsWith("# ")) { y -= 2; wrap(l.slice(2), bold, 14, 5); y -= 2; }
    else if (l.startsWith("## ")) { y -= 3; wrap(l.slice(3), bold, 11, 3); }
    else wrap(l.replace(/\*\*/g, ""), font, 9.5, 2.5);
  }
  pdf.setTitle(title); pdf.setAuthor("Britland Academy");
  return await pdf.save();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // 1) só admin logado
    const auth = req.headers.get("Authorization") || "";
    const { data: u } = await db.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
    if (!u?.user) return json({ ok: false, error: "not_signed_in" }, 401);
    const { data: me } = await db.from("profiles").select("is_admin").eq("id", u.user.id).maybeSingle();
    if (!me?.is_admin) return json({ ok: false, error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    // teste: manda o convite (PT e ES) so para o e-mail do proprio admin, sem criar documento no Autentique
    if (body.test) {
      const to = u.user.email || "";
      const out: Record<string, string> = {};
      for (const es of [false, true]) {
        try { await sendContractMail(to, "Paulo", "https://assina.ae/exemplo", es); out[es ? "es" : "pt"] = "sent"; }
        catch (e) { out[es ? "es" : "pt"] = "erro: " + String((e as Error).message).slice(0, 160); }
      }
      return json({ ok: true, test: true, to, from: Deno.env.get("MAIL_FROM_CONTACT") || "Britland Academy <contact@britlandacademy.co.uk>", out });
    }
    const uid = String(body.user_id || "");
    if (!uid) return json({ ok: false, error: "user_id" }, 400);

    // 2) texto precisa estar liberado
    const { data: tpl } = await db.from("contract_template").select("ready,body").eq("id", 1).maybeSingle();
    if (!tpl?.ready || !tpl.body.trim()) return json({ ok: false, error: "template_not_ready" });

    // 3) dados
    const { data: c } = await db.from("contracts").select("*").eq("user_id", uid).maybeSingle();
    if (!c) return json({ ok: false, error: "no_terms" });
    if (c.status === "sent" || c.status === "signed") return json({ ok: false, error: "already_" + c.status });
    const miss = ["country", "course", "plan", "currency", "pay_method", "due_day", "start_date"].filter((k) => !c[k]);
    if (miss.length) return json({ ok: false, error: "missing_fields", fields: miss });
    const { data: p } = await db.from("profiles").select("*").eq("id", uid).maybeSingle();
    let email = p?.email as string | undefined;
    if (!email) { const { data: au } = await db.auth.admin.getUserById(uid); email = au?.user?.email; }
    const nome = (p?.full_name || p?.name || "").trim();
    if (!email || !nome) return json({ ok: false, error: "missing_student_name_or_email" });

    // 4) texto + PDF
    const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const ini = new Date(c.start_date + "T12:00:00").toLocaleDateString("pt-BR");
    const full = PRICE[c.plan]?.[c.currency];
    if (full == null) return json({ ok: false, error: "no_price_for_plan_currency" });
    const per = PERIODO[c.periodo || "mensal"] || PERIODO.mensal;
    const off = Math.max(0, Math.min(50, Number(c.desconto) || 0));
    const net = Math.round(full * (100 - off)) / 100;
    const text = fill(tpl.body, {
      nome, email, pais: c.country, curso: c.course, plano: c.plan, valor: money(c.currency, net),
      valor_tabela: money(c.currency, full), desconto: off ? off + "%" : "sem desconto",
      periodo: per.label, total_periodo: (c.periodo || "mensal") === "mensal" ? "não se aplica (cobrança mensal)" : money(c.currency, Math.round(net * per.months * 100) / 100),
      moeda: c.currency, pagamento: c.pay_method, vencimento: String(c.due_day), inicio: ini, data: hoje,
    });
    if (/\{\{\w+\}\}|\[[^\]]{2,40}\]/.test(text)) return json({ ok: false, error: "template_has_placeholders" });
    const pdf = await makePdf(text, "Contrato de Prestação de Serviços Educacionais");

    // 5) Autentique
    const token = Deno.env.get("AUTENTIQUE_TOKEN");
    if (!token) return json({ ok: false, error: "no_autentique_token" });
    const schoolEmail = Deno.env.get("SCHOOL_EMAIL") || "";
    const schoolName = Deno.env.get("SCHOOL_NAME") || "Paulo Sérgio Cruz";
    const signers: Record<string, string>[] = [{ name: nome, action: "SIGN", delivery_method: "DELIVERY_METHOD_LINK" }]; // aluno: so o link; o e-mail sai da escola
    if (schoolEmail) signers.push({ email: schoolEmail, name: schoolName, action: "SIGN" });
    const sandbox = Deno.env.get("AUTENTIQUE_SANDBOX") === "1";
    const query = `mutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
      createDocument(document: $document, signers: $signers, file: $file${sandbox ? ", sandbox: true" : ""}) {
        id signatures { public_id name email link { short_link } } } }`;
    const fd = new FormData();
    fd.append("operations", JSON.stringify({ query, variables: { document: { name: `Contrato - ${nome}` }, signers, file: null } }));
    fd.append("map", JSON.stringify({ file: ["variables.file"] }));
    fd.append("file", new Blob([pdf], { type: "application/pdf" }), "contrato.pdf");
    const r = await fetch("https://api.autentique.com.br/v2/graphql", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    const j = await r.json().catch(() => ({}));
    const doc = j?.data?.createDocument;
    if (!doc?.id) {
      const msg = JSON.stringify(j?.errors || j).slice(0, 400);
      await db.from("contracts").update({ status: "error", error: msg, updated_at: new Date().toISOString() }).eq("user_id", uid);
      return json({ ok: false, error: "autentique", detail: msg });
    }
    const sigs = (doc.signatures || []) as { email?: string; name?: string; link?: { short_link?: string } }[];
    // aluno = a assinatura sem e-mail (entrou por link); o dono da conta Autentique tambem pode aparecer na lista
    const mine = sigs.find((s) => !s.email && s.link?.short_link) || sigs.find((s) => s.name === nome && s.link?.short_link);
    const link = mine?.link?.short_link || null;
    // convite ao aluno, saindo de contact@ (se falhar, o painel ainda tem o botao "Copiar link do aluno")
    let mail: string | null = null;
    if (link) {
      try { await sendContractMail(email, nome.split(/\s+/)[0], link, (p?.course || c.course || "") === "es" || /espa/i.test(String(c.course || ""))); mail = "sent"; }
      catch (e) { mail = "erro: " + String((e as Error).message).slice(0, 120); }
    } else mail = "sem link";
    await db.from("contracts").update({
      status: "sent", doc_id: doc.id, sign_link: link, error: mail === "sent" ? null : "e-mail ao aluno: " + mail,
      sent_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("user_id", uid);
    return json({ ok: true, doc_id: doc.id, mail });
  } catch (e) {
    return json({ ok: false, error: "exception", detail: String(e).slice(0, 300) }, 500);
  }
});
