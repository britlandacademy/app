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
  const docId = obj.id || ev?.event?.data?.document || null;
  console.log("webhook", type, docId);
  if (docId && /^(document\.finished|document\.updated|signature\.accepted)$/.test(type)) {
    let signedUrl: string | null = typeof obj?.files?.signed === "string" ? obj.files.signed : null;
    let done = type === "document.finished";
    if (!done) {
      try {
        const r = await fetch("https://api.autentique.com.br/v2/graphql", {
          method: "POST",
          headers: { Authorization: `Bearer ${Deno.env.get("AUTENTIQUE_TOKEN")}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query: `query($id:UUID!){document(id:$id){signatures{signed{created_at}} files{signed}}}`, variables: { id: docId } }),
        });
        const d = (await r.json())?.data?.document;
        if (d?.signatures?.length && d.signatures.every((x: any) => x?.signed?.created_at)) { done = true; signedUrl = d?.files?.signed || signedUrl; }
        else console.log("pending", JSON.stringify(d));
      } catch (e) { console.log("gql error", String(e)); }
    }
    if (done) {
      const { error } = await db.from("contracts").update({
        status: "signed", signed_at: new Date().toISOString(), signed_url: signedUrl, updated_at: new Date().toISOString(),
      }).eq("doc_id", docId);
      if (error) console.log("db error", error.message);
    }
  }
  return new Response("ok");
});
