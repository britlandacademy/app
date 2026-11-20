// gcal-book: horarios livres, pedidos de remarcacao/aula nova, cancelamento e decisao do professor.
// Deploy com "Verify JWT" LIGADO. Acoes (POST {action,...}): slots, request (aula avulsa confirma na hora; weekly:true pede aprovacao), withdraw, cancel, decide, end_series.
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
const NOTICE_MIN = 60;     // horarios novos so com mais de 1 h de antecedencia
const CHANGE_MIN = 120;    // aluno remarca / cancela com credito so com mais de 2 h de antecedencia; depois disso o cancelamento conta como aula dada
const HORIZON_DAYS = 30;   // quantos dias a frente oferecer
const HOLD_HOURS = 24;     // pedido pendente reserva o horario por 24 h
const MAX_PENDING_NEW = 3; // pedidos de aula nova pendentes por aluno
const TZ_OFFSET = "-03:00"; // horario do professor (Brasilia, sem horario de verao)
const ZOOM = "https://us06web.zoom.us/j/2447679341?pwd=U0xuSmU0ek15MGlEd0phWHdoMllUUT09"; // sala fixa do professor: toda aula marcada usa o Zoom

// ---- titulo, descricao e lembrete dos eventos (bandeira + nome + Stg) ----
const PANEL = "https://www.britlandacademy.co.uk/app/admin.html";
const TZC: Record<string, string> = {"Africa/Johannesburg":"ZA","America/Argentina/Buenos_Aires":"AR","America/Asuncion":"PY","America/Bogota":"CO","America/Chicago":"US","America/Denver":"US","America/Lima":"PE","America/Los_Angeles":"US","America/Mexico_City":"MX","America/Montevideo":"UY","America/New_York":"US","America/Santiago":"CL","America/Sao_Paulo":"BR","America/Toronto":"CA","America/Vancouver":"CA","Asia/Dubai":"AE","Asia/Tokyo":"JP","Atlantic/Azores":"PT","Atlantic/Canary":"ES","Atlantic/Madeira":"PT","Australia/Melbourne":"AU","Australia/Perth":"AU","Australia/Sydney":"AU","Europe/Andorra":"AD","Europe/Astrakhan":"RU","Europe/Athens":"GR","Europe/Belgrade":"RS","Europe/Berlin":"DE","Europe/Brussels":"BE","Europe/Bucharest":"RO","Europe/Budapest":"HU","Europe/Chisinau":"MD","Europe/Dublin":"IE","Europe/Gibraltar":"GI","Europe/Helsinki":"FI","Europe/Istanbul":"TR","Europe/Kaliningrad":"RU","Europe/Kirov":"RU","Europe/Kyiv":"UA","Europe/Lisbon":"PT","Europe/London":"GB","Europe/Madrid":"ES","Europe/Malta":"MT","Europe/Minsk":"BY","Europe/Moscow":"RU","Europe/Paris":"FR","Europe/Prague":"CZ","Europe/Riga":"LV","Europe/Rome":"IT","Europe/Samara":"RU","Europe/Saratov":"RU","Europe/Simferopol":"RU","Europe/Sofia":"BG","Europe/Tallinn":"EE","Europe/Tirane":"AL","Europe/Ulyanovsk":"RU","Europe/Vienna":"AT","Europe/Vilnius":"LT","Europe/Volgograd":"RU","Europe/Warsaw":"PL","Europe/Zurich":"CH","Pacific/Auckland":"NZ","Europe/Kiev":"UA"};
const STG_EN = [12, 27, 44, 63, 82, 101, 120, 138, 156, 174, 190, 206];
const STG_ES = [16, 32, 52, 72, 92, 112];
const PT_COUNTRY: Record<string, string> = { GB: "Reino Unido", IE: "Irlanda", PT: "Portugal", ES: "Espanha", US: "EUA", CA: "Canadá", FR: "França", DE: "Alemanha", IT: "Itália", CH: "Suíça", NL: "Holanda", BE: "Bélgica", LU: "Luxemburgo", AU: "Austrália", NZ: "Nova Zelândia", JP: "Japão", AE: "Emirados", AR: "Argentina", CL: "Chile", MX: "México", PY: "Paraguai", UY: "Uruguai", BR: "Brasil" };
function flagCode(p: any): string {
  let c = String(p?.country || "").toUpperCase();
  if (!c && p?.tz) c = TZC[p.tz] || "";
  if (p?.course === "es") return "ES"; // todo aluno de espanhol: bandeira da Espanha
  return !c || c === "BR" ? "GB" : c;
}
const flagEmoji = (c: string) => c.length === 2 ? String.fromCodePoint(...[...c].map((x) => 127397 + x.charCodeAt(0))) : "";
function stageOf(p: any): number {
  const u = Number(p?.lessons_upto) || 0;
  const cap = (p?.auto_release !== false && p?.lessons_auto != null) ? Math.min(u, Number(p.lessons_auto)) : u;
  const T = p?.course === "es" ? STG_ES : STG_EN;
  if (cap <= 0) return 0;
  const i = T.findIndex((e) => cap <= e);
  return i < 0 ? T.length : i + 1;
}
function evName(p: any): string {
  const w = String(p?.name || "").trim().split(/\s+/).filter(Boolean);
  if (!w.length) return "Aluno";
  return w.length > 1 ? w[0] + " " + w[w.length - 1] : w[0];
}
function evTitle(p: any, kind: string): string {
  const n = stageOf(p);
  const stg = n ? " - " + (p?.course === "es" ? "Etapa " : "Stg ") + n : "";
  return flagEmoji(flagCode(p)) + " " + evName(p) + " VIP" + stg + (kind === "makeup" ? " (reposição)" : "");
}
function evDesc(p: any, kind: string, startIso: string): string {
  const L = ["Aula online pelo Zoom: " + ZOOM];
  if (p?.tz && p.tz !== "America/Sao_Paulo") {
    try {
      const t = new Intl.DateTimeFormat("pt-BR", { timeZone: p.tz, hour: "numeric", minute: "2-digit", hourCycle: "h23" }).format(new Date(startIso));
      const c = String(p.country || TZC[p.tz] || "").toUpperCase();
      L.push("Aluno: " + t.replace(":00", "h").replace(/^(\d+):(\d+)$/, "$1h$2") + (PT_COUNTRY[c] ? " (" + PT_COUNTRY[c] + ")" : " (" + p.tz + ")"));
    } catch (_) { /* fuso invalido */ }
  }
  if (kind === "makeup") L.push("Tipo: reposição");
  if (p?.name) L.push("Painel: " + PANEL + "#students?q=" + encodeURIComponent(p.name));
  return L.join("\n");
}
const REMINDER = { useDefault: false, overrides: [{ method: "popup", minutes: 10 }] };

// ---- avisos push (gravam em teacher_events / student_msgs; a super-processor envia) ----
const fmtP = (v: string | number) => { const p = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", hourCycle: "h23" }).formatToParts(new Date(v)); const g = (t: string) => p.find((x) => x.type === t)?.value || ""; return g("weekday").replace(".", "") + " " + g("day") + "/" + g("month") + " " + g("hour") + ":" + g("minute"); };
const tNote = async (uid: string, rest: string) => { try { const { data: p } = await db.from("profiles").select("name").eq("id", uid).maybeSingle(); const fn = String(p?.name || "").trim().split(/\s+/)[0] || "Aluno"; await db.from("teacher_events").insert({ student_id: uid, kind: "msg", label: fn + rest }); } catch (_) { /* aviso e opcional */ } };
const sNote = async (uid: string, text: string) => { try { await db.from("student_msgs").insert({ user_id: uid, body: text }); } catch (_) { /* aviso e opcional */ } };

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
const calUrl = (link: any, path = "") => "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(link.calendar_id || "primary") + "/events" + path;

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


// quantas aulas fixas por semana o aluno pode ter: profiles.classes_per_week, ou a media das ultimas 4 semanas (minimo 1)
async function weeklyInfo(uid: string) {
  const { data: p } = await db.from("profiles").select("classes_per_week").eq("id", uid).maybeSingle();
  let limit = Number(p?.classes_per_week) || 0;
  if (!limit) {
    const { count } = await db.from("lessons").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("start_at", new Date(Date.now() - 28 * 86400e3).toISOString()).lt("start_at", new Date().toISOString());
    limit = Math.max(1, Math.round((count || 0) / 4));
  }
  const { count: act } = await db.from("lesson_series").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "active");
  const { count: pen } = await db.from("lesson_requests").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("kind", "weekly").eq("status", "pending").gte("created_at", new Date(Date.now() - HOLD_HOURS * 3600e3).toISOString());
  return { limit, used: (act || 0) + (pen || 0) };
}
const brDay = (iso: string) => new Date(Date.parse(iso) - 3 * 3600e3);
const WDN = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// aplica um pedido (remarcar, aula nova, reposicao ou aula fixa) na agenda e no banco. Usado pela decisao do professor e pela confirmacao automatica.
async function applyRequest(r: any, link: any, reqId?: string): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  const s = Date.parse(r.new_start), e = Date.parse(r.new_end);
  const busy = await loadBusy(reqId);
  const own = r.kind === "reschedule" ? (await db.from("lessons").select("start_at,end_at").eq("id", r.lesson_id).maybeSingle()).data : null;
  const others = busy.filter((b) => !(own && b.s === Date.parse(own.start_at) && b.e === Date.parse(own.end_at)));
  if (others.some((b) => s < b.e + GAP * MIN && e + GAP * MIN > b.s)) return { ok: false, error: "conflict" };
  const tok = await accessToken(link);
  const H = { Authorization: "Bearer " + tok, "Content-Type": "application/json" };
  if (r.kind === "reschedule") {
    const { data: ls } = await db.from("lessons").select("id").like("id", eventOf(r.lesson_id) + ":%");
    const pr = await fetch(calUrl(link, "/" + encodeURIComponent(eventOf(r.lesson_id))) + "?sendUpdates=none", { method: "PATCH", headers: H, body: JSON.stringify({ start: { dateTime: r.new_start }, end: { dateTime: r.new_end } }) });
    if (!pr.ok) throw new Error("agenda: " + pr.status);
    for (const l of ls || []) await db.from("lessons").update({ start_at: r.new_start, end_at: r.new_end, updated_at: now }).eq("id", l.id);
    return { ok: true };
  }
  const { data: st } = await db.from("profiles").select("name,email,country,tz,course,lessons_upto,lessons_auto,auto_release").eq("id", r.user_id).maybeSingle();
  const ev: any = { summary: st ? evTitle(st, r.kind) : "Aula", start: { dateTime: r.new_start }, end: { dateTime: r.new_end }, location: ZOOM, description: evDesc(st, r.kind, r.new_start), reminders: REMINDER };
  if (st?.email) ev.attendees = [{ email: st.email }];
  if (r.kind === "weekly") { ev.start.timeZone = "America/Sao_Paulo"; ev.end.timeZone = "America/Sao_Paulo"; ev.recurrence = ["RRULE:FREQ=WEEKLY"]; }
  const cr = await fetch(calUrl(link) + "?sendUpdates=none", { method: "POST", headers: H, body: JSON.stringify(ev) });
  if (!cr.ok) throw new Error("agenda: " + cr.status);
  const c = await cr.json();
  if (r.kind === "weekly") {
    const bd = brDay(r.new_start);
    await db.from("lesson_series").insert({ user_id: r.user_id, gcal_event_id: c.id, weekday: bd.getUTCDay(), start_time: bd.toISOString().slice(11, 19), status: "active", decided_at: now });
    const iq = new URLSearchParams({ timeMin: new Date().toISOString(), timeMax: new Date(Date.now() + 60 * 86400e3).toISOString(), maxResults: "100" });
    const ir = await fetch(calUrl(link, "/" + encodeURIComponent(c.id) + "/instances") + "?" + iq, { headers: H });
    const inst = ir.ok ? ((await ir.json()).items || []) : [];
    for (const i of inst) if (i.status !== "cancelled" && i.start?.dateTime) await db.from("lessons").upsert({ id: i.id + ":" + r.user_id, user_id: r.user_id, title: ev.summary, start_at: i.start.dateTime, end_at: i.end.dateTime, meet_url: ZOOM, is_group: false, updated_at: now });
    return { ok: true };
  }
  await db.from("lessons").upsert({ id: c.id + ":" + r.user_id, user_id: r.user_id, title: ev.summary, start_at: r.new_start, end_at: r.new_end, meet_url: ZOOM, is_group: false, updated_at: now });
  if (r.kind === "makeup") { // a reposicao consome o credito mais antigo
    const { data: cc } = await db.from("class_credits").select("id").eq("user_id", r.user_id).is("made_up_at", null).order("cancelled_at").limit(1);
    if (cc && cc[0]) await db.from("class_credits").update({ made_up_at: now }).eq("id", cc[0].id);
  }
  return { ok: true };
}

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
      const wk = await weeklyInfo(uid);
      return json({ ok: true, slots: await freeSlots(), dur: DUR, weekly_limit: wk.limit, weekly_used: wk.used });
    }

    if (action === "request") {
      let kind = String(body.kind || "");
      const weekly = !!body.weekly && kind === "new";
      const start = Date.parse(String(body.start || ""));
      if (!["reschedule", "new", "makeup"].includes(kind) || !start) return json({ ok: false, error: "bad_request" }, 400);
      const slots = await freeSlots();
      if (!slots.some((s) => Date.parse(s) === start)) return json({ ok: false, error: "slot_taken" });
      let old_start: string | null = null, lesson_id: string | null = null;
      if (kind === "reschedule") {
        const { data: l } = await db.from("lessons").select("id,user_id,start_at,is_group").eq("id", String(body.lesson_id || "")).maybeSingle();
        if (!l || l.user_id !== uid) return json({ ok: false, error: "not_yours" });
        if (l.is_group) return json({ ok: false, error: "group" });
        if (Date.parse(l.start_at) - Date.now() <= CHANGE_MIN * MIN) return json({ ok: false, error: "too_late" });
        const { count } = await db.from("lesson_requests").select("id", { count: "exact", head: true }).eq("status", "pending").eq("lesson_id", l.id);
        if (count) return json({ ok: false, error: "already_pending" });
        old_start = l.start_at; lesson_id = l.id;
      } else {
        const { count } = await db.from("lesson_requests").select("id", { count: "exact", head: true }).eq("status", "pending").neq("kind", "reschedule").eq("user_id", uid);
        if ((count || 0) >= MAX_PENDING_NEW) return json({ ok: false, error: "too_many" });
        if (kind === "makeup") { // reposicao: precisa de credito livre (aulas a repor)
          const { count: cr } = await db.from("class_credits").select("id", { count: "exact", head: true }).eq("user_id", uid).is("made_up_at", null);
          const { count: pn } = await db.from("lesson_requests").select("id", { count: "exact", head: true }).eq("status", "pending").eq("kind", "makeup").eq("user_id", uid);
          if ((cr || 0) <= (pn || 0)) return json({ ok: false, error: "no_credit" });
        }
      }
      const row: any = { user_id: uid, kind, lesson_id, old_start, new_start: new Date(start).toISOString(), new_end: new Date(start + DUR * MIN).toISOString() };
      const bd = brDay(row.new_start), hh = bd.toISOString().slice(11, 16);
      if (weekly) { // aula fixa toda semana: precisa da aprovacao do professor
        const wk = await weeklyInfo(uid);
        if (wk.used >= wk.limit) return json({ ok: false, error: "weekly_limit", limit: wk.limit });
        const { data: ins, error } = await db.from("lesson_requests").insert({ ...row, kind: "weekly" }).select("id").single();
        if (error) throw new Error("banco: " + error.message);
        await tNote(uid, " pediu uma aula fixa toda " + WDN[bd.getUTCDay()] + " às " + hh + " (a partir de " + fmtP(start) + ")");
        return json({ ok: true, id: ins.id, auto: false, weekly: true });
      }
      // aula avulsa: confirma na hora se o horario estiver livre
      const res = await applyRequest(row, link);
      if (!res.ok) return json({ ok: false, error: "slot_taken" });
      await db.from("lesson_requests").insert({ ...row, status: "approved", decided_at: new Date().toISOString() });
      await tNote(uid, kind === "reschedule" ? " remarcou a aula de " + fmtP(old_start!) + " para " + fmtP(start) : kind === "makeup" ? " marcou uma reposição: " + fmtP(start) : " marcou uma aula nova: " + fmtP(start));
      return json({ ok: true, auto: true });
    }

    if (action === "withdraw") { // aluno desiste de um pedido pendente (libera o horario)
      await db.from("lesson_requests").update({ status: "expired", decided_at: new Date().toISOString() }).eq("id", String(body.id || "")).eq("user_id", uid).eq("status", "pending");
      return json({ ok: true });
    }

    if (action === "cancel") {
      const { data: l } = await db.from("lessons").select("id,user_id,title,start_at,end_at,is_group").eq("id", String(body.lesson_id || "")).maybeSingle();
      if (!l || l.user_id !== uid) return json({ ok: false, error: "not_yours" });
      if (l.is_group) return json({ ok: false, error: "group" });
      if (Date.parse(l.start_at) <= Date.now()) return json({ ok: false, error: "too_late" });
      const late = Date.parse(l.start_at) - Date.now() <= CHANGE_MIN * MIN; // fora do prazo: a aula fica na agenda e conta como dada, sem credito
      const { count: dup } = await db.from("lesson_requests").select("id", { count: "exact", head: true }).eq("kind", "cancel").eq("lesson_id", l.id).eq("user_id", uid);
      if (dup) return json({ ok: true, credit: false, late });
      if (!late) {
        const tok = await accessToken(link);
        const dr = await fetch(calUrl(link, "/" + encodeURIComponent(eventOf(l.id))) + "?sendUpdates=none", { method: "DELETE", headers: { Authorization: "Bearer " + tok } });
        if (!dr.ok && dr.status !== 404 && dr.status !== 410) throw new Error("agenda: " + dr.status);
        await db.from("lessons").delete().eq("id", l.id);
        await db.from("class_credits").insert({ user_id: uid, event_id: eventOf(l.id), title: l.title, class_at: l.start_at, note: "aluno" });
      }
      await db.from("lesson_requests").update({ status: "rejected", decided_at: new Date().toISOString() }).eq("status", "pending").eq("lesson_id", l.id);
      await db.from("lesson_requests").insert({ user_id: uid, kind: "cancel", lesson_id: l.id, old_start: l.start_at, new_start: l.start_at, new_end: l.end_at, status: "approved", decided_at: new Date().toISOString() });
      await tNote(uid, " cancelou a aula de " + fmtP(l.start_at) + (late ? " (fora do prazo de 2 h: conta como dada)" : " (ganhou uma aula a repor)"));
      return json({ ok: true, credit: !late, late });
    }

    if (action === "decide") {
      if (!me?.is_admin) return json({ error: "forbidden" }, 403);
      const { data: r } = await db.from("lesson_requests").select("*").eq("id", String(body.id || "")).maybeSingle();
      if (!r || r.status !== "pending") return json({ ok: false, error: "not_pending" });
      const now = new Date().toISOString();
      if (!body.approve) { await db.from("lesson_requests").update({ status: "rejected", decided_at: now }).eq("id", r.id); await sNote(r.user_id, "Seu pedido não pôde ser aprovado. Escolha outro horário."); return json({ ok: true }); }
      const ar = await applyRequest(r, link, r.id);
      if (!ar.ok) return json({ ok: false, error: ar.error });
      await db.from("lesson_requests").update({ status: "approved", decided_at: now }).eq("id", r.id);
      await sNote(r.user_id, r.kind === "reschedule" ? "Seu pedido foi aprovado ✅ Novo horário: " + fmtP(r.new_start) : r.kind === "weekly" ? "Sua aula fixa foi aprovada ✅ Toda semana, a partir de " + fmtP(r.new_start) : "Sua aula foi marcada ✅ " + fmtP(r.new_start));
      return json({ ok: true });
    }

    if (action === "end_series") { // o aluno para a repeticao semanal (a aula que comeca em menos de 2 h continua)
      const { data: se } = await db.from("lesson_series").select("*").eq("id", String(body.id || "")).maybeSingle();
      if (!se || se.user_id !== uid) return json({ ok: false, error: "not_yours" });
      if (se.status === "pending") { await db.from("lesson_series").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", se.id); return json({ ok: true }); }
      if (se.status !== "active") return json({ ok: true });
      const tok = await accessToken(link);
      const H = { Authorization: "Bearer " + tok, "Content-Type": "application/json" };
      const until = new Date(Date.now() + CHANGE_MIN * MIN);
      const u = until.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const pr = await fetch(calUrl(link, "/" + encodeURIComponent(se.gcal_event_id)) + "?sendUpdates=none", { method: "PATCH", headers: H, body: JSON.stringify({ recurrence: ["RRULE:FREQ=WEEKLY;UNTIL=" + u] }) });
      if (!pr.ok && pr.status !== 404 && pr.status !== 410) throw new Error("agenda: " + pr.status);
      await db.from("lesson_series").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", se.id);
      await db.from("lessons").delete().like("id", se.gcal_event_id + "_%").gt("start_at", until.toISOString());
      await tNote(uid, " encerrou a aula fixa de toda " + WDN[se.weekday]);
      return json({ ok: true });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});
