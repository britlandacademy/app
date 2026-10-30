// contract-webhook: o Autentique avisa aqui quando o documento é concluído.
// Publicar com "Verify JWT" DESLIGADO (quem chama é o Autentique). Segredo: AUTENTIQUE_WEBHOOK_SECRET
import { createClient } from "npm:@supabase/supabase-js@2";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

async function hmacHex(secret: string, data: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
  return [...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function same(a: string, b: string) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const raw = await req.text();
  const secret = Deno.env.get("AUTENTIQUE_WEBHOOK_SECRET");
  const sig = (req.headers.get("X-Autentique-Signature") || "").replace(/^sha256=/i, "").toLowerCase();
  if (!secret || !same(sig, await hmacHex(secret, raw))) return new Response("bad signature", { status: 401 });
  let ev: any; try { ev = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
  const type = ev?.event?.type || "";
  const obj = ev?.event?.data?.object || {};
  if (type === "document.finished" && obj.id) {
    const signed = obj?.files?.signed || obj?.files?.original || null;
    await db.from("contracts").update({
      status: "signed", signed_at: new Date().toISOString(), signed_url: typeof signed === "string" ? signed : null, updated_at: new Date().toISOString(),
    }).eq("doc_id", obj.id);
  }
  return new Response("ok");
});
