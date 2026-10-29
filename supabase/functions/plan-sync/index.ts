import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const H = { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  const b = await req.json().catch(() => ({}));
  const secret = Deno.env.get("PLAN_SECRET") || Deno.env.get("PAY_SECRET");
  if (!secret || b.secret !== secret) return out({ error: "forbidden" }, 403);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (b.action === "links") {
    const { data, error } = await sb.from("plan_links").select("user_id,sheet_name");
    return error ? out({ error: error.message }, 500) : out({ links: data });
  }
  if (b.action === "push" && b.user_id && b.progress) {
    const p = b.progress, c = p.currentPosition || {};
    const { error } = await sb.from("plan_progress").upsert({
      user_id: b.user_id, stage: p.stage ?? null, lesson: c.lesson ?? null, class_number: c.classNumber ?? null,
      last_word: c.lastWord ?? null, data: p, updated_at: new Date().toISOString(),
    });
    return error ? out({ error: error.message }, 500) : out({ ok: true });
  }
  return out({ error: "bad-request" }, 400);
});
