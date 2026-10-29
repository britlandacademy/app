// pay-email: recebe e-mails de pagamento (Wise/XP) enviados pelo Apps Script do Gmail do professor.
// Deploy com "Verify JWT" DESLIGADO. Secret necessário: PAY_SECRET (o mesmo colado no Apps Script).
import { createClient } from "npm:@supabase/supabase-js@2";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const num = (s: string) => parseFloat(s.replace(/\./g, "").replace(",", "."));

function parse(subject: string, body: string) {
  const t = body.replace(/ /g, " ");
  // Wise Pix: "Você recebeu um Pix de 0,01 BRL de NOME." / "Valor recebido: 0,01 BRL" / "Nº da transferência: #123"
  let m = t.match(/recebeu um Pix de ([\d.,]+)\s*([A-Z]{3}) de ([^\n]+?)\.?\s*(?:\n|E j)/);
  const ref = t.match(/transfer[eê]ncia:?\s*#?(\d{6,})/i)?.[1];
  if (m && ref) return { source: "wise", amount: num(m[1]), currency: m[2], payer: m[3].trim(), ref: "wise-" + ref };
  // Wise internacional: "Dinheiro recebido de NOME" / "recebeu 100 USD de NOME"
  m = (subject + "\n" + t).match(/(?:recebeu|received)\s+([\d.,]+)\s*([A-Z]{3})\s+(?:de|from)\s+([^\n.]+)/i);
  if (m && ref) return { source: "wise", amount: num(m[1]), currency: m[2], payer: m[3].trim(), ref: "wise-" + ref };
  // XP (Pix recebido): "R$ 100,00" + nome do pagador
  m = t.match(/R\$\s*([\d.,]+)/); const n = t.match(/(?:de|origem|pagador)[:\s]+([A-ZÀ-Ú][^\n]{3,60})/);
  if (m && n && /xp/i.test(subject + t)) return { source: "xp", amount: num(m[1]), currency: "BRL", payer: n[1].trim(), ref: "xp-" + norm(n[1]) + "-" + m[1] + "-" + new Date().toISOString().slice(0, 13) };
  return null;
}

Deno.serve(async (req) => {
  if (req.headers.get("x-secret") !== Deno.env.get("PAY_SECRET")) return new Response("no", { status: 401 });
  const { subject = "", body = "" } = await req.json();
  const p = parse(subject, body);
  if (!p) return Response.json({ ok: false, reason: "formato não reconhecido" });
  const dup = await sb.from("pay_inbox").select("ref").eq("ref", p.ref).maybeSingle();
  if (dup.data) return Response.json({ ok: true, dup: true });
  const al = await sb.from("pay_aliases").select("user_id").eq("alias", norm(p.payer)).maybeSingle();
  const uid = al.data?.user_id || null;
  let row: any = { ...p, status: "conferir", user_id: uid };
  if (uid) {
    const ch = await sb.from("charges").select("id,sub_id,due_date,subs!inner(user_id)").is("paid_on", null)
      .eq("currency", p.currency).eq("amount", p.amount).eq("subs.user_id", uid).order("due_date").limit(2);
    if (ch.data?.length === 1 || (ch.data?.length === 2)) {
      const c = ch.data[0];
      await sb.from("charges").update({ paid_on: new Date().toISOString().slice(0, 10), note: "Baixa automática (" + p.source + " " + p.ref + ")" }).eq("id", c.id);
      row = { ...row, status: "baixado", charge_id: c.id };
    }
  }
  await sb.from("pay_inbox").insert(row);
  return Response.json({ ok: true, status: row.status });
});
