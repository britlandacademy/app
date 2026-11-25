// pay-ocr: lê o comprovante anexado pelo aluno (Gemini), grava valor/pagador/ID em pay_claims e tenta cruzar com o e-mail.
// Deploy com "Verify JWT" LIGADO. Secret necessário: GEMINI_API_KEY.
import { createClient } from "npm:@supabase/supabase-js@2";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const b64 = (u: Uint8Array) => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
  const u = await sb.auth.getUser(jwt);
  if (u.error || !u.data.user) return J({ ok: false, error: "auth" }, 401);
  const { claim_id } = await req.json().catch(() => ({}));
  const cl = await sb.from("pay_claims").select("*").eq("id", claim_id).eq("user_id", u.data.user.id).maybeSingle();
  if (!cl.data || !cl.data.proof_path) return J({ ok: true, skipped: "sem comprovante" });
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) { await sb.rpc("pay_match_claims"); return J({ ok: false, error: "GEMINI_API_KEY ausente" }, 503); }
  const f = await sb.storage.from("proofs").download(cl.data.proof_path);
  if (f.error) return J({ ok: false, error: "download" }, 500);
  const mime = f.data.type || (cl.data.proof_path.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
  const data = b64(new Uint8Array(await f.data.arrayBuffer()));
  const prompt = 'Este é um comprovante de transferência (Pix ou Wise). Responda SOMENTE um JSON: {"amount": número do valor transferido, "currency": "BRL"|"EUR"|"USD"|outro código ISO, "payer": nome de quem PAGOU/enviou, "ref": código/ID da transação ou null, "date": "AAAA-MM-DD" ou null}. Use null se não achar. Não invente.';
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data } }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }),
  });
  if (!r.ok) { await sb.rpc("pay_match_claims"); return J({ ok: false, error: "gemini " + r.status }, 502); }
  let o: any = {};
  try { o = JSON.parse((await r.json()).candidates[0].content.parts[0].text); } catch (_) {}
  const amt = typeof o.amount === "number" ? o.amount : parseFloat(String(o.amount ?? "").replace(",", "."));
  await sb.from("pay_claims").update({
    ocr_amount: isFinite(amt) ? amt : null, ocr_currency: typeof o.currency === "string" ? o.currency.toUpperCase().slice(0, 3) : null,
    ocr_payer: typeof o.payer === "string" ? o.payer.slice(0, 120) : null, ocr_ref: o.ref ? String(o.ref).slice(0, 80) : null, ocr_at: new Date().toISOString(),
  }).eq("id", cl.data.id);
  const m = await sb.rpc("pay_match_claims");
  return J({ ok: true, matched: m.data || 0 });
});
