// contract-send: gera o PDF do contrato e envia ao Autentique (aluno + escola assinam).
// Chamada pelo painel (admin logado). Segredos: AUTENTIQUE_TOKEN, SCHOOL_EMAIL, SCHOOL_NAME, AUTENTIQUE_SANDBOX (opcional "1")
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

const PRICE_EUR: Record<string, string> = { VIP: "€120,00", Turma: "€80,00", Intensivo: "€200,00", Business: "€200,00" };

function fill(body: string, v: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => (v[k] ?? `{{${k}}}`));
}
const clean = (s: string) => s.replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ€–—‘’“”•]/g, "?");

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
    const text = fill(tpl.body, {
      nome, email, pais: c.country, curso: c.course, plano: c.plan, valor: PRICE_EUR[c.plan] || "",
      moeda: c.currency, pagamento: c.pay_method, vencimento: String(c.due_day), inicio: ini, data: hoje,
    });
    if (/\{\{\w+\}\}|\[[^\]]{2,40}\]/.test(text)) return json({ ok: false, error: "template_has_placeholders" });
    const pdf = await makePdf(text, "Contrato de Prestação de Serviços Educacionais");

    // 5) Autentique
    const token = Deno.env.get("AUTENTIQUE_TOKEN");
    if (!token) return json({ ok: false, error: "no_autentique_token" });
    const schoolEmail = Deno.env.get("SCHOOL_EMAIL") || "";
    const schoolName = Deno.env.get("SCHOOL_NAME") || "Paulo Sérgio Cruz";
    const signers: Record<string, string>[] = [{ email, name: nome, action: "SIGN" }];
    if (schoolEmail) signers.push({ email: schoolEmail, name: schoolName, action: "SIGN" });
    const sandbox = Deno.env.get("AUTENTIQUE_SANDBOX") === "1";
    const query = `mutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
      createDocument(document: $document, signers: $signers, file: $file${sandbox ? ", sandbox: true" : ""}) {
        id signatures { public_id email link { short_link } } } }`;
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
    const mine = (doc.signatures || []).find((s: { email: string }) => s.email === email);
    await db.from("contracts").update({
      status: "sent", doc_id: doc.id, sign_link: mine?.link?.short_link || null, error: null,
      sent_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("user_id", uid);
    return json({ ok: true, doc_id: doc.id });
  } catch (e) {
    return json({ ok: false, error: "exception", detail: String(e).slice(0, 300) }, 500);
  }
});
