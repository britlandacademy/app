// gcal-sync: copia as aulas da agenda para a tabela lessons. Deploy com "Verify JWT" LIGADO (qualquer usuario logado pode chamar; ha limite de 5 min).
import { createClient } from "npm:@supabase/supabase-js@2";
const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const SEC = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const db = createClient(URL_, KEY, { auth: { persistSession: false } });
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const fmtP = (v: string | number) => { const p = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", hourCycle: "h23" }).formatToParts(new Date(v)); const g = (t: string) => p.find((x) => x.type === t)?.value || ""; return g("weekday").replace(".", "") + " " + g("day") + "/" + g("month") + " " + g("hour") + ":" + g("minute"); };
const norm = (s: string) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const ik = Deno.env.get("INVITE_KEY");
  const byKey = !!ik && req.headers.get("x-invite-key") === ik; // chamada da automacao de convites (invite-text)
  const { data: usr } = byKey ? { data: { user: { id: "invite-key" } } } : await db.auth.getUser(jwt);
  if (!usr?.user) return json({ error: "login" }, 401);
  const body = await req.json().catch(() => ({}));
  const { data: link } = await db.from("gcal_link").select("*").eq("id", 1).maybeSingle();
  if (!link?.refresh_token) return json({ ok: false, reason: "not_connected" });
  let force = false;
  if (byKey) force = true; else if (body.force) { const { data: p } = await db.from("profiles").select("is_admin").eq("id", usr.user.id).maybeSingle(); force = !!p?.is_admin; }
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
    const { data: asg } = await db.from("lesson_assign").select("event_id,user_ids");
    const manual = new Map((asg || []).map((a: any) => [a.event_id, a.user_ids as string[]]));
    const rows: any[] = [];
    for (const e of ev) {
      if (e.status === "cancelled" || !e.start?.dateTime) continue; // ignora cancelados e eventos de dia inteiro
      const ids = new Set<string>();
      const man = manual.get(e.id) || manual.get(String(e.id).replace(/_\d{8}T\d{6}Z$/, "")); // aula avulsa tem prioridade; senão vale a série
      if (man && man.length) for (const u of man) if ((profs || []).some((p: any) => p.id === u)) ids.add(u);
      for (const a of e.attendees || []) { const id = byMail.get((a.email || "").toLowerCase()); if (id) ids.add(id); }
      let viaGroup = false;
      if (!ids.size) { // turmas: nome da turma contido no titulo
        const t = norm(e.summary || "");
        for (const g of groups) if (g.n.length >= 2 && t.includes(g.n)) { viaGroup = true; for (const m of g.members) ids.add(m); }
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
      const zin = String(e.location || "").match(/https?:\/\/[^\s]*zoom\.us\/[^\s]+/i) || String(e.description || "").match(/https?:\/\/[^\s]*zoom\.us\/[^\s]+/i);
      const meet = zin ? zin[0] : (e.hangoutLink || e.conferenceData?.entryPoints?.find((x: any) => x.entryPointType === "video")?.uri || "https://us06web.zoom.us/j/2447679341"); // sem link de video: usa o Zoom fixo do professor
      const targets = ids.size ? [...ids] : [null];
      for (const uid of targets) rows.push({ id: e.id + ":" + (uid || "none"), user_id: uid, title: e.summary || "Aula", start_at: e.start.dateTime, end_at: e.end.dateTime, meet_url: meet, is_group: viaGroup || ids.size > 1, updated_at: new Date().toISOString() });
    }
    // guarda as aulas futuras de antes para avisar o aluno se o professor remarcou ou cancelou no Google Agenda
    const { data: before } = await db.from("lessons").select("id,user_id,start_at").not("user_id", "is", null).gte("start_at", new Date().toISOString()).lte("start_at", timeMax);
    if (rows.length) { const { error } = await db.from("lessons").upsert(rows); if (error) throw new Error("banco: " + error.message); }
    const keep = rows.map((r) => r.id);
    let del = db.from("lessons").delete().gte("start_at", timeMin).lte("start_at", timeMax);
    if (keep.length) del = del.not("id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
    await del;
    try { // avisos ao aluno (ignora o que veio de um pedido decidido ha pouco, que ja gerou o proprio aviso)
      const since = new Date(Date.now() - 20 * 60e3).toISOString();
      const { data: dec } = await db.from("lesson_requests").select("lesson_id").eq("status", "approved").gte("decided_at", since);
      const skip = new Set((dec || []).map((d: any) => String(d.lesson_id || "").split(":")[0]));
      const byId = new Map(rows.map((r) => [r.id, r]));
      const evs = new Set(rows.map((r) => String(r.id).split(":")[0]));
      for (const o of before || []) {
        const evId = String(o.id).split(":")[0];
        if (skip.has(evId)) continue;
        const n = byId.get(o.id);
        if (n && Math.abs(Date.parse(n.start_at) - Date.parse(o.start_at)) >= 60000) await db.from("student_msgs").insert({ user_id: o.user_id, body: "Sua aula de " + fmtP(o.start_at) + " foi remarcada para " + fmtP(n.start_at) + "." });
        else if (!n && !evs.has(evId)) await db.from("student_msgs").insert({ user_id: o.user_id, body: "Sua aula de " + fmtP(o.start_at) + " foi cancelada." });
      }
    } catch (_) { /* aviso e opcional */ }
    try { // aula fixa semanal: se o horario de uma semana ficou ocupado, so aquela aula e cancelada, o aluno ganha 1 aula a repor e a serie continua
      const { data: ser } = await db.from("lesson_series").select("gcal_event_id,created_at,user_id").eq("status", "active");
      if (ser && ser.length) {
        const baseOf = (id: string) => String(id).split(":")[0].replace(/_\d{8}T\d{6}Z$/, "");
        const sMap = new Map(ser.map((x: any) => [x.gcal_event_id, x]));
        const { data: bl } = await db.from("availability_blocks").select("day");
        const blocked = new Set((bl || []).map((b: any) => String(b.day)));
        const now = Date.now();
        const seen = new Set<string>();
        for (const r of rows) {
          const evId = String(r.id).split(":")[0];
          const se = sMap.get(baseOf(r.id));
          if (!se || evId === se.gcal_event_id || seen.has(evId) || Date.parse(r.start_at) <= now) continue; // so instancias futuras da serie
          const s0 = Date.parse(r.start_at), e0 = Date.parse(r.end_at);
          const day = new Date(s0 - 3 * 3600e3).toISOString().slice(0, 10);
          let clash = blocked.has(day);
          if (!clash) for (const o of rows) {
            const oe = String(o.id).split(":")[0];
            if (oe === evId) continue;
            if (!(s0 < Date.parse(o.end_at) && e0 > Date.parse(o.start_at))) continue;
            const os = sMap.get(baseOf(o.id));
            if (os && os !== se && new Date(os.created_at) < new Date(se.created_at)) { clash = true; break; } // duas series: a mais nova cede
            if (!os) { clash = true; break; } // outra aula ou compromisso na agenda
          }
          if (!clash) continue;
          seen.add(evId);
          const dr = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(link.calendar_id || "primary")}/events/${encodeURIComponent(evId)}?sendUpdates=none`, { method: "DELETE", headers: { Authorization: "Bearer " + t.access_token } });
          if (!dr.ok && dr.status !== 404 && dr.status !== 410) continue;
          await db.from("lessons").delete().like("id", evId + ":%");
          const { count: dup } = await db.from("class_credits").select("id", { count: "exact", head: true }).eq("event_id", evId);
          if (!dup) {
            await db.from("class_credits").insert({ user_id: se.user_id, event_id: evId, title: r.title, class_at: r.start_at, note: "série" });
            await db.from("student_msgs").insert({ user_id: se.user_id, body: "Sua aula fixa de " + fmtP(r.start_at) + " foi cancelada porque o horário ficou ocupado. Você ganhou 1 aula a repor. As próximas semanas continuam." });
            await db.from("teacher_events").insert({ student_id: se.user_id, kind: "msg", label: "Aula fixa de " + fmtP(r.start_at) + " cancelada por conflito de horário (aluno ganhou 1 aula a repor)" });
          }
        }
      }
    } catch (_) { /* a guarda e opcional: o proximo sync tenta de novo */ }
    await db.from("gcal_link").update({ last_error: null }).eq("id", 1);
    return json({ ok: true, count: rows.length });
  } catch (err) {
    await db.from("gcal_link").update({ last_error: String(err).slice(0, 300) }).eq("id", 1);
    return json({ ok: false, error: String(err) }, 500);
  }
});
