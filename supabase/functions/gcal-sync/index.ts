// gcal-sync: copia as aulas da agenda para a tabela lessons. Deploy com "Verify JWT" LIGADO (qualquer usuario logado pode chamar; ha limite de 5 min).
import { createClient } from "npm:@supabase/supabase-js@2";
const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const SEC = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const db = createClient(URL_, KEY, { auth: { persistSession: false } });
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const norm = (s: string) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: usr } = await db.auth.getUser(jwt);
  if (!usr?.user) return json({ error: "login" }, 401);
  const body = await req.json().catch(() => ({}));
  const { data: link } = await db.from("gcal_link").select("*").eq("id", 1).maybeSingle();
  if (!link?.refresh_token) return json({ ok: false, reason: "not_connected" });
  let force = false;
  if (body.force) { const { data: p } = await db.from("profiles").select("is_admin").eq("id", usr.user.id).maybeSingle(); force = !!p?.is_admin; }
  if (!force && link.last_sync && Date.now() - new Date(link.last_sync).getTime() < 5 * 60 * 1000) return json({ ok: true, skipped: true });
  await db.from("gcal_link").update({ last_sync: new Date().toISOString() }).eq("id", 1); // reserva a janela

  try {
    const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CID, client_secret: SEC, refresh_token: link.refresh_token, grant_type: "refresh_token" }) });
    const t = await tr.json();
    if (!t.access_token) throw new Error("token: " + (t.error || "sem acesso"));
    const timeMin = new Date(Date.now() - 24 * 3600e3).toISOString();
    const timeMax = new Date(Date.now() + 60 * 24 * 3600e3).toISOString();
    const q = new URLSearchParams({ timeMin, timeMax, singleEvents: "true", orderBy: "startTime", maxResults: "250", conferenceDataVersion: "1" });
    const er = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(link.calendar_id || "primary")}/events?` + q, { headers: { Authorization: "Bearer " + t.access_token } });
    if (!er.ok) throw new Error("agenda: " + er.status);
    const ev = (await er.json()).items || [];
    const { data: profs } = await db.from("profiles").select("id,name,email").eq("is_admin", false);
    const byMail = new Map((profs || []).filter((p: any) => p.email).map((p: any) => [p.email.toLowerCase(), p.id]));
    const { data: gs } = await db.from("class_groups").select("id,name");
    const { data: gm } = await db.from("class_group_members").select("group_id,user_id");
    const groups = (gs || []).map((g: any) => ({ n: norm(g.name || ""), members: (gm || []).filter((m: any) => m.group_id === g.id).map((m: any) => m.user_id) })).filter((g: any) => g.members.length);
    const rows: any[] = [];
    for (const e of ev) {
      if (e.status === "cancelled" || !e.start?.dateTime) continue; // ignora cancelados e eventos de dia inteiro
      const ids = new Set<string>();
      for (const a of e.attendees || []) { const id = byMail.get((a.email || "").toLowerCase()); if (id) ids.add(id); }
      if (!ids.size) { // turmas: nome da turma contido no titulo
        const t = norm(e.summary || "");
        for (const g of groups) if (g.n.length >= 2 && t.includes(g.n)) for (const m of g.members) ids.add(m);
      }
      if (!ids.size) {
        const title = norm(e.summary || "");
        for (const p of profs || []) { const n = norm(p.name || ""); if (n.length >= 3 && title.includes(n)) ids.add(p.id); }
        if (!ids.size) { // primeiro nome como palavra inteira, só se identificar um único aluno
          const words = new Set(title.split(/[^a-z0-9]+/).filter((w: string) => w.length >= 3));
          const hit = (profs || []).filter((p: any) => { const f = norm(p.name || "").split(/[^a-z0-9]+/)[0] || ""; return f.length >= 3 && words.has(f); });
          if (hit.length === 1) ids.add(hit[0].id);
        }
      }
      const meet = e.hangoutLink || e.conferenceData?.entryPoints?.find((x: any) => x.entryPointType === "video")?.uri || null;
      const targets = ids.size ? [...ids] : [null];
      for (const uid of targets) rows.push({ id: e.id + ":" + (uid || "none"), user_id: uid, title: e.summary || "Aula", start_at: e.start.dateTime, end_at: e.end.dateTime, meet_url: meet, updated_at: new Date().toISOString() });
    }
    if (rows.length) { const { error } = await db.from("lessons").upsert(rows); if (error) throw new Error("banco: " + error.message); }
    const keep = rows.map((r) => r.id);
    let del = db.from("lessons").delete().gte("start_at", timeMin).lte("start_at", timeMax);
    if (keep.length) del = del.not("id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
    await del;
    await db.from("gcal_link").update({ last_error: null }).eq("id", 1);
    return json({ ok: true, count: rows.length });
  } catch (err) {
    await db.from("gcal_link").update({ last_error: String(err).slice(0, 300) }).eq("id", 1);
    return json({ ok: false, error: String(err) }, 500);
  }
});
