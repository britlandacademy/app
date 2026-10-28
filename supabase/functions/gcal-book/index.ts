// gcal-book: horarios livres, pedidos de remarcacao/aula nova, cancelamento e decisao do professor.
// Deploy com "Verify JWT" LIGADO. Acoes (POST {action,...}): slots, request, withdraw, cancel, decide.
import { createClient } from "npm:@supabase/supabase-js@2";
const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const SEC = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const db = createClient(URL_, KEY, { auth: { persistSession: false } });
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

// ---- regras (ajuste aqui) ----
const DUR = 50;            // minutos de aula
const GAP = 10;            // folga entre aulas
const STEP = 60;           // horarios oferecidos de hora em hora a partir do inicio da janela
const NOTICE_MIN = 60;     // aluno so remarca/cancela/pede com mais de 1 h de antecedencia
const HORIZON_DAYS = 30;   // quantos dias a frente oferecer
const HOLD_HOURS = 24;     // pedido pendente reserva o horario por 24 h
const MAX_PENDING_NEW = 3; // pedidos de aula nova pendentes por aluno
const TZ_OFFSET = "-03:00"; // horario do professor (Brasilia, sem horario de verao)

const MIN = 60000;
const dayStr = (ms: number) => new Date(ms - 3 * 3600e3).toISOString().slice(0, 10); // data em Brasilia

type Iv = { s: number; e: number };
// ---- inicio computeSlots ----
function computeSlots(opts: { now: number; windows: { weekday: number; start: string; end: string }[]; blocks: string[]; busy: Iv[] }): string[] {
  const { now, windows, blocks, busy } = opts;
  const out: string[] = [];
  for (let d = 0; d <= HORIZON_DAYS; d++) {
    const day = dayStr(now + d * 86400e3);
    if (blocks.includes(day)) continue;
    const wd = new Date(day + "T12:00:00Z").getUTCDay();
    for (const w of windows) {
      if (w.weekday !== wd) continue;
      const base = Date.parse(day + "T00:00:00" + TZ_OFFSET);
      const t = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return base + (h * 60 + m) * MIN; };
      const ws = t(w.start), we = t(w.end);
      for (let s = ws; s + DUR * MIN <= we; s += STEP * MIN) {
        if (s < now + NOTICE_MIN * MIN) continue;
        const e = s + DUR * MIN;
        if (busy.some((b) => s < b.e + GAP * MIN && e + GAP * MIN > b.s)) continue;
        out.push(new Date(s).toISOString());
      }
    }
  }
  return out;
}
// ---- fim computeSlots ----

async function accessToken(link: any) {
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CID, client_secret: SEC, refresh_token: link.refresh_token, grant_type: "refresh_token" }) });
  const t = await tr.json();
  if (!t.access_token) throw new Error("token: " + (t.error || "sem acesso"));
  return t.access_token as string;
}
const calUrl = (link: any, path = "") => `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(link.calendar_id || "primary")}/events${path}`;

async function loadBusy(excludeRequest?: string): Promise<Iv[]> {
  const from = new Date(Date.now() - 86400e3).toISOString();
  const { data: ls } = await db.from("lessons").select("start_at,end_at").gte("end_at", from);
  const hold = new Date(Date.now() - HOLD_HOURS * 3600e3).toISOString();
  const { data: rq } = await db.from("lesson_requests").select("id,new_start,new_end").eq("status", "pending").neq("kind", "cancel").gte("created_at", hold);
  const busy: Iv[] = (ls || []).map((l: any) => ({ s: Date.parse(l.start_at), e: Date.parse(l.end_at) }));
  for (const r of rq || []) if (r.id !== excludeRequest) busy.push({ s: Date.parse(r.new_start), e: Date.parse(r.new_end) });
  return busy;
}
async function freeSlots(excludeRequest?: string) {
  const { data: av } = await db.from("availability").select("weekday,start_time,end_time");
  const { data: bl } = await db.from("availability_blocks").select("day");
  return computeSlots({
    now: Date.now(),
    windows: (av || []).map((a: any) => ({ weekday: a.weekday, start: String(a.start_time).slice(0, 5), end: String(a.end_time).slice(0, 5) })),
    blocks: (bl || []).map((b: any) => String(b.day)),
    busy: await loadBusy(excludeRequest),
  });
}
const eventOf = (lessonId: string) => lessonId.split(":")[0];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: usr } = await db.auth.getUser(jwt);
  const uid = usr?.user?.id;
  if (!uid) return json({ error: "login" }, 401);
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");
  const { data: me } = await db.from("profiles").select("id,name,email,is_admin").eq("id", uid).maybeSingle();
  const { data: link } = await db.from("gcal_link").select("*").eq("id", 1).maybeSingle();
  if (!link?.refresh_token) return json({ ok: false, error: "not_connected" });

  // pedidos pendentes antigos viram expirados (o horario volta a ficar livre)
  await db.from("lesson_requests").update({ status: "expired" }).eq("status", "pending").lt("created_at", new Date(Date.now() - HOLD_HOURS * 3600e3).toISOString());

  try {
    if (action === "slots") {
      return json({ ok: true, slots: await freeSlots(), dur: DUR });
    }

    if (action === "request") {
      const kind = String(body.kind || "");
      const start = Date.parse(String(body.start || ""));
      if (!["reschedule", "new"].includes(kind) || !start) return json({ ok: false, error: "bad_request" }, 400);
      const slots = await freeSlots();
      if (!slots.some((s) => Date.parse(s) === start)) return json({ ok: false, error: "slot_taken" });
      let old_start: string | null = null, lesson_id: string | null = null;
      if (kind === "reschedule") {
        const { data: l } = await db.from("lessons").select("id,user_id,start_at,is_group").eq("id", String(body.lesson_id || "")).maybeSingle();
        if (!l || l.user_id !== uid) return json({ ok: false, error: "not_yours" });
        if (l.is_group) return json({ ok: false, error: "group" });
        if (Date.parse(l.start_at) - Date.now() <= NOTICE_MIN * MIN) return json({ ok: false, error: "too_late" });
        const { count } = await db.from("lesson_requests").select("id", { count: "exact", head: true }).eq("status", "pending").eq("lesson_id", l.id);
        if (count) return json({ ok: false, error: "already_pending" });
        old_start = l.start_at; lesson_id = l.id;
      } else {
        const { count } = await db.from("lesson_requests").select("id", { count: "exact", head: true }).eq("status", "pending").eq("kind", "new").eq("user_id", uid);
        if ((count || 0) >= MAX_PENDING_NEW) return json({ ok: false, error: "too_many" });
      }
      const { data: ins, error } = await db.from("lesson_requests").insert({ user_id: uid, kind, lesson_id, old_start, new_start: new Date(start).toISOString(), new_end: new Date(start + DUR * MIN).toISOString() }).select("id").single();
      if (error) throw new Error("banco: " + error.message);
      return json({ ok: true, id: ins.id });
    }

    if (action === "withdraw") { // aluno desiste de um pedido pendente (libera o horario)
      await db.from("lesson_requests").update({ status: "expired", decided_at: new Date().toISOString() }).eq("id", String(body.id || "")).eq("user_id", uid).eq("status", "pending");
      return json({ ok: true });
    }

    if (action === "cancel") {
      const { data: l } = await db.from("lessons").select("id,user_id,start_at,end_at,is_group").eq("id", String(body.lesson_id || "")).maybeSingle();
      if (!l || l.user_id !== uid) return json({ ok: false, error: "not_yours" });
      if (l.is_group) return json({ ok: false, error: "group" });
      if (Date.parse(l.start_at) - Date.now() <= NOTICE_MIN * MIN) return json({ ok: false, error: "too_late" });
      const tok = await accessToken(link);
      const dr = await fetch(calUrl(link, "/" + encodeURIComponent(eventOf(l.id))) + "?sendUpdates=none", { method: "DELETE", headers: { Authorization: "Bearer " + tok } });
      if (!dr.ok && dr.status !== 404 && dr.status !== 410) throw new Error("agenda: " + dr.status);
      await db.from("lessons").delete().eq("id", l.id);
      await db.from("lesson_requests").update({ status: "rejected", decided_at: new Date().toISOString() }).eq("status", "pending").eq("lesson_id", l.id);
      await db.from("lesson_requests").insert({ user_id: uid, kind: "cancel", lesson_id: l.id, old_start: l.start_at, new_start: l.start_at, new_end: l.end_at, status: "approved", decided_at: new Date().toISOString() });
      return json({ ok: true });
    }

    if (action === "decide") {
      if (!me?.is_admin) return json({ error: "forbidden" }, 403);
      const { data: r } = await db.from("lesson_requests").select("*").eq("id", String(body.id || "")).maybeSingle();
      if (!r || r.status !== "pending") return json({ ok: false, error: "not_pending" });
      const now = new Date().toISOString();
      if (!body.approve) { await db.from("lesson_requests").update({ status: "rejected", decided_at: now }).eq("id", r.id); return json({ ok: true }); }
      // o horario ainda precisa estar livre (ignorando a propria reserva deste pedido)
      const s = Date.parse(r.new_start), e = Date.parse(r.new_end);
      const busy = await loadBusy(r.id);
      const own = r.kind === "reschedule" ? (await db.from("lessons").select("start_at,end_at").eq("id", r.lesson_id).maybeSingle()).data : null;
      const others = busy.filter((b) => !(own && b.s === Date.parse(own.start_at) && b.e === Date.parse(own.end_at)));
      if (others.some((b) => s < b.e + GAP * MIN && e + GAP * MIN > b.s)) return json({ ok: false, error: "conflict" });
      const tok = await accessToken(link);
      const H = { Authorization: "Bearer " + tok, "Content-Type": "application/json" };
      if (r.kind === "reschedule") {
        const { data: ls } = await db.from("lessons").select("id").like("id", eventOf(r.lesson_id) + ":%");
        const pr = await fetch(calUrl(link, "/" + encodeURIComponent(eventOf(r.lesson_id))) + "?sendUpdates=none", { method: "PATCH", headers: H, body: JSON.stringify({ start: { dateTime: r.new_start }, end: { dateTime: r.new_end } }) });
        if (!pr.ok) throw new Error("agenda: " + pr.status);
        for (const l of ls || []) await db.from("lessons").update({ start_at: r.new_start, end_at: r.new_end, updated_at: now }).eq("id", l.id);
      } else {
        const { data: st } = await db.from("profiles").select("name,email").eq("id", r.user_id).maybeSingle();
        const ev: any = { summary: st?.name || "Aula", start: { dateTime: r.new_start }, end: { dateTime: r.new_end }, conferenceData: { createRequest: { requestId: r.id, conferenceSolutionKey: { type: "hangoutsMeet" } } } };
        if (st?.email) ev.attendees = [{ email: st.email }];
        const cr = await fetch(calUrl(link) + "?conferenceDataVersion=1&sendUpdates=none", { method: "POST", headers: H, body: JSON.stringify(ev) });
        if (!cr.ok) throw new Error("agenda: " + cr.status);
        const c = await cr.json();
        const meet = c.hangoutLink || c.conferenceData?.entryPoints?.find((x: any) => x.entryPointType === "video")?.uri || null;
        await db.from("lessons").upsert({ id: c.id + ":" + r.user_id, user_id: r.user_id, title: ev.summary, start_at: r.new_start, end_at: r.new_end, meet_url: meet, is_group: false, updated_at: now });
      }
      await db.from("lesson_requests").update({ status: "approved", decided_at: now }).eq("id", r.id);
      return json({ ok: true });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});
