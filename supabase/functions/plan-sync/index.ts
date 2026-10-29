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
    const { data, error } = await sb.from("plan_links").select("user_id,sheet_name,student_col");
    return error ? out({ error: error.message }, 500) : out({ links: data });
  }
  if (b.action === "tabs" && Array.isArray(b.tabs)) {
    const rows = b.tabs.filter((t: any) => t && t.name).map((t: any) => ({ sheet_name: String(t.name), students: Array.isArray(t.students) ? t.students.map(String) : [], updated_at: new Date().toISOString() }));
    const { error } = rows.length ? await sb.from("plan_tabs").upsert(rows) : { error: null };
    if (error) return out({ error: error.message }, 500);
    const keep = rows.map((r: any) => r.sheet_name);
    if (keep.length) await sb.from("plan_tabs").delete().not("sheet_name", "in", "(" + keep.map((k: string) => '"' + k.replace(/"/g, '""') + '"').join(",") + ")");
    return out({ ok: true, n: rows.length });
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
