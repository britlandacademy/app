// gcal-admin: o professor cancela ou remarca aulas (individuais ou em turma) direto pela Agenda.
// Deploy com "Verify JWT" LIGADO. Acoes (POST {action,...}): cancel {event,notify,credit}, ask {event} (aluno escolhe novo horario), move {event,start,notify,force}
import { createClient } from "npm:@supabase/supabase-js@2";
const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const SEC = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const db = createClient(URL_, KEY, { auth: { persistSession: false } });
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const MIN = 60000, GAP = 10;
const fmtP = (v: string | number) => { const p = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", hourCycle: "h23" }).formatToParts(new Date(v)); const g = (t: string) => p.find((x) => x.type === t)?.value || ""; return g("weekday").replace(".", "") + " " + g("day") + "/" + g("month") + " " + g("hour") + ":" + g("minute"); };
const sNote = async (uid: string, text: string) => { try { await db.from("student_msgs").insert({ user_id: uid, body: text }); } catch (_) { /* opcional */ } };
async function accessToken(link: any) {
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CID, client_secret: SEC, refresh_token: link.refresh_token, grant_type: "refresh_token" }) });
  const t = await tr.json();
  if (!t.access_token) throw new Error("token: " + (t.error || "sem acesso"));
  return t.access_token as string;
}
const calUrl = (link: any, path = "") => "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(link.calendar_id || "primary") + "/events" + path;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: usr } = await db.auth.getUser(jwt);
  const uid = usr?.user?.id;
  if (!uid) return json({ error: "login" }, 401);
  const { data: me } = await db.from("profiles").select("is_admin").eq("id", uid).maybeSingle();
  if (!me?.is_admin) return json({ error: "forbidden" }, 403);
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || ""), ev = String(body.event || "");
  if (!ev || ev.includes(":") || ev.includes("%")) return json({ ok: false, error: "bad_request" }, 400);
  const { data: link } = await db.from("gcal_link").select("*").eq("id", 1).maybeSingle();
  if (!link?.refresh_token) return json({ ok: false, error: "not_connected" });
  try {
    const { data: ls } = await db.from("lessons").select("id,user_id,title,start_at,end_at").like("id", ev + ":%");
    if (!ls || !ls.length) return json({ ok: false, error: "not_found" });
    const tok = await accessToken(link), H = { Authorization: "Bearer " + tok, "Content-Type": "application/json" };
    const oldStart = ls[0].start_at, now = new Date().toISOString();
    if (action === "cancel" || action === "ask") {
      const dr = await fetch(calUrl(link, "/" + encodeURIComponent(ev)) + "?sendUpdates=none", { method: "DELETE", headers: H });
      if (!dr.ok && dr.status !== 404 && dr.status !== 410) throw new Error("agenda: " + dr.status);
      await db.from("lessons").delete().like("id", ev + ":%");
      await db.from("lesson_requests").update({ status: "rejected", decided_at: now }).eq("status", "pending").in("lesson_id", ls.map((l: any) => l.id));
      const ask = action === "ask";
      if (ask || body.credit === true) {
        await db.from("class_credits").insert(ls.map((l: any) => ({ user_id: l.user_id, event_id: ev, title: l.title || "Aula", class_at: l.start_at, note: ask ? "remarcação" : "professor" })));
      }
      if (ask) for (const l of ls) await sNote(l.user_id, "O professor precisa remarcar sua aula de " + fmtP(oldStart) + ". Abra o app, vá em Minhas aulas e escolha um novo horário em aulas a repor.");
      else if (body.notify !== false) for (const l of ls) await sNote(l.user_id, "Sua aula de " + fmtP(oldStart) + " foi cancelada." + (body.credit === true ? " Você ganhou uma aula a repor: escolha o novo horário em Minhas aulas." : " Em breve combinamos um novo horário."));
      return json({ ok: true, n: ls.length });
    }
    if (action === "move") {
      const s = Date.parse(String(body.start || ""));
      if (!s || s < Date.now()) return json({ ok: false, error: "bad_time" });
      const dur = Date.parse(ls[0].end_at) - Date.parse(ls[0].start_at), e = s + dur;
      if (!body.force) {
        const { data: all } = await db.from("lessons").select("id,start_at,end_at").gte("end_at", new Date(s - 86400e3).toISOString());
        const hit = (all || []).find((b: any) => !b.id.startsWith(ev + ":") && s < Date.parse(b.end_at) + GAP * MIN && e + GAP * MIN > Date.parse(b.start_at));
        if (hit) return json({ ok: false, error: "conflict", at: hit.start_at });
      }
      const pr = await fetch(calUrl(link, "/" + encodeURIComponent(ev)) + "?sendUpdates=none", { method: "PATCH", headers: H, body: JSON.stringify({ start: { dateTime: new Date(s).toISOString() }, end: { dateTime: new Date(e).toISOString() } }) });
      if (!pr.ok) throw new Error("agenda: " + pr.status);
      await db.from("lessons").update({ start_at: new Date(s).toISOString(), end_at: new Date(e).toISOString(), updated_at: now }).like("id", ev + ":%");
      if (body.notify !== false) for (const l of ls) await sNote(l.user_id, "Sua aula de " + fmtP(oldStart) + " foi remarcada ✅ Novo horário: " + fmtP(s));
      return json({ ok: true, n: ls.length });
    }
    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (err) { return json({ ok: false, error: String(err) }, 500); }
});
