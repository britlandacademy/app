// @ts-nocheck
// weekly-confirm: confirmacao semanal das aulas pelo WhatsApp.
// Quinta 14h (alunos fora do Brasil) e sexta 11h (alunos no Brasil) gera uma mensagem por aluno/turma com as aulas da proxima semana.
// Sexta 14h e sabado 10h pede ao Power Automate para ler as respostas; o Gemini classifica; o professor recebe aviso no app e e-mail.
// Chamada pelo Apps Script "Semanal.gs" a cada 5 min com o cabecalho x-invite-key (INVITE_KEY ou teacher_cfg.weekly_key).
// Deploy com "Verify JWT" DESLIGADO (a autenticacao e a chave).
import { createClient } from "npm:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const IK = Deno.env.get("INVITE_KEY") || "";
const CID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const SEC = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const GEM = Deno.env.get("GEMINI_API_KEY") || "";
const MAIL_TO = Deno.env.get("WEEKLY_EMAIL") || "britlandacademy@gmail.com";
const ZOOM = "https://us06web.zoom.us/j/2447679341?pwd=U0xuSmU0ek15MGlEd0phWHdoMllUUT09";
const db = createClient(URL_, SRV, { auth: { persistSession: false } });
const H = { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const SP = "America/Sao_Paulo";
const DAY = 864e5;

// ---------- datas e fusos ----------
const BR_TZ = new Set(["America/Sao_Paulo", "America/Bahia", "America/Fortaleza", "America/Recife", "America/Belem", "America/Manaus", "America/Cuiaba", "America/Campo_Grande", "America/Porto_Velho", "America/Boa_Vista", "America/Rio_Branco", "America/Araguaina", "America/Maceio", "America/Noronha", "America/Santarem", "America/Eirunepe"]);
const tzOf = (p: any) => p?.tz || SP;
const isBR = (tz: string) => BR_TZ.has(tz);
const CITY: Record<string, string> = { "America/Sao_Paulo": "Brasília", "Europe/Lisbon": "Lisboa", "Europe/Dublin": "Dublin", "Europe/London": "Londres", "Europe/Madrid": "Madri", "Europe/Paris": "Paris", "Europe/Berlin": "Berlim", "Europe/Rome": "Roma", "Europe/Amsterdam": "Amsterdã", "Europe/Brussels": "Bruxelas", "Europe/Zurich": "Zurique", "America/New_York": "Nova York", "America/Chicago": "Chicago", "America/Los_Angeles": "Los Angeles", "America/Toronto": "Toronto", "Asia/Tokyo": "Tóquio", "Australia/Sydney": "Sydney" };
const city = (tz: string) => isBR(tz) && tz !== "America/Sao_Paulo" ? tz.split("/").pop()!.replace(/_/g, " ") : (CITY[tz] || tz.split("/").pop()!.replace(/_/g, " "));
function parts(ms: number, tz: string) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(new Date(ms));
  const g = (t: string) => p.find((x) => x.type === t)?.value || "";
  return { y: g("year"), m: g("month"), d: g("day"), h: +g("hour"), mi: +g("minute"), wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")) };
}
const spDate = (ms: number) => { const x = parts(ms, SP); return `${x.y}-${x.m}-${x.d}`; };
const spMidnight = (date: string) => Date.parse(date + "T00:00:00-03:00"); // Brasil sem horario de verao
function nextMonday(ms: number) { const x = parts(ms, SP); const add = ((8 - x.wd) % 7) || 7; return spDate(spMidnight(spDate(ms)) + add * DAY + 12 * 3600e3); }
const WD = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hh = (h: number, m: number) => h + "h" + (m ? String(m).padStart(2, "0") : "");
const dayLabel = (ms: number, tz: string) => { const x = parts(ms, tz); return `${WD[x.wd]} (${x.d}/${x.m})`; };
const timeLabel = (ms: number, tz: string) => { const x = parts(ms, tz); return hh(x.h, x.mi); };
function joinPt(a: string[]) { return a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " e " + a[a.length - 1]; }
// primeiro horario >= ms em que o fuso esta entre 9h e 19h
function inWindow(ms: number, tz: string) { let t = ms; for (let i = 0; i < 48; i++) { const h = parts(t, tz).h; if (h >= 9 && h < 19) return t; t = Math.ceil((t + 1) / 3600e3) * 3600e3; } return ms; }
const first = (p: any) => String(p?.display_name || p?.name || "").trim().split(/\s+/)[0] || "";
const hash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

// ---------- textos ----------
function listText(slots: { s: number }[], tzs0: string[]) {
  const tzs = [...tzs0].sort((a, b) => (isBR(b) ? 1 : 0) - (isBR(a) ? 1 : 0));
  const sorted = [...slots].sort((a, b) => a.s - b.s);
  // junta as aulas do mesmo dia (aula dupla): "Terca (01/12), as 19h e as 20h"
  const days: { d: string; ss: number[] }[] = [];
  const ref0 = tzs.length > 1 ? SP : tzs[0];
  for (const x of sorted) { const d = dayLabel(x.s, ref0), l = days[days.length - 1]; if (l && l.d === d) l.ss.push(x.s); else days.push({ d, ss: [x.s] }); }
  if (tzs.length > 1) {
    const tl = (s: number) => joinPt(tzs.map((tz) => timeLabel(s, tz) + " em " + city(tz)));
    return days.map((x) => "• " + cap(x.d) + ": " + x.ss.map(tl).join(" / ")).join("\n");
  }
  const tz = tzs[0], ref = isBR(tz) ? "horário de Brasília" : "horário de " + city(tz);
  const at = (ss: number[]) => joinPt(ss.map((s) => "às " + timeLabel(s, tz)));
  const pat = [...new Set(days.map((x) => at(x.ss)))];
  if (pat.length === 1) return cap(joinPt(days.map((x) => x.d))) + ", " + pat[0] + " (" + ref + ").";
  return days.map((x) => "• " + cap(x.d) + ", " + at(x.ss)).join("\n") + "\n(" + ref + ")";
}
function greet(names: string[]) { return names.length === 1 ? "Olá, " + names[0] + "! Tudo bem?" : names.length === 2 ? "Olá, " + names[0] + " e " + names[1] + "! Tudo bem?" : "Olá, pessoal! Tudo bem?"; }
function buildText(kind: string, names: string[], slots: any[], tzs: string[], seed: number) {
  const g = names.length > 1, L = listText(slots, tzs);
  if (kind === "none") {
    const I = [
      "Vi que ainda não temos aulas marcadas para a próxima semana. Podemos manter os mesmos horários da última?",
      "Ainda não há aulas na agenda para a próxima semana. Que tal mantermos os horários da última semana?",
      "Estou organizando a agenda da próxima semana e vi que " + (g ? "vocês ainda não têm" : "você ainda não tem") + " aulas marcadas. Podemos repetir os horários da última?",
    ];
    return greet(names) + "\n" + I[seed % I.length] + " 📅\n\n" + L + "\n\nPosso confirmar esses horários?";
  }
  const I = g ? ["Passando para confirmar as aulas da próxima semana", "As aulas da próxima semana ficam assim", "Já organizei a agenda da próxima semana", "Aqui estão os horários das aulas da próxima semana"]
    : ["Passando para confirmar suas aulas da próxima semana", "Suas aulas da próxima semana ficam assim", "Já organizei a sua agenda da próxima semana", "Aqui estão os horários das suas aulas na próxima semana"];
  return greet(names) + "\n" + I[seed % I.length] + " 📅\n\n" + L + "\n\n" + (g ? "Posso confirmar esses horários com vocês?" : "Posso confirmar esses horários?");
}
function remindText(names: string[], seed: number) {
  const g = names.length > 1, who = names.length === 1 ? names[0] : names.length === 2 ? names[0] + " e " + names[1] : "pessoal";
  const R = g ? ["Oi, " + who + "! Conseguiram ver a mensagem sobre as aulas da próxima semana? 😊", "Oi, " + who + "! Só para lembrar: posso confirmar os horários da próxima semana?"]
    : ["Oi, " + who + "! Conseguiu ver a mensagem sobre as aulas da próxima semana? 😊", "Oi, " + who + "! Só para lembrar: posso confirmar os horários da próxima semana?"];
  return R[seed % R.length];
}
const thanksText = (course: string) => course === "es" ? "¡Gracias por tu mensaje!" : "Thanks for your message!";

// ---------- agenda do Google ----------
async function gToken() {
  const { data: link } = await db.from("gcal_link").select("*").eq("id", 1).maybeSingle();
  if (!link?.refresh_token) return null;
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CID, client_secret: SEC, refresh_token: link.refresh_token, grant_type: "refresh_token" }) });
  const t = await tr.json();
  return t.access_token ? { tok: t.access_token as string, cal: link.calendar_id || "primary" } : null;
}
// dias de folga: availability_blocks + eventos de dia inteiro "Folga", "Ferias" ou "Feriado" no calendario
async function blockedDays(ws: string) {
  const end = spDate(spMidnight(ws) + 7 * DAY + 12 * 3600e3), set = new Set<string>();
  const { data: bl } = await db.from("availability_blocks").select("day").gte("day", ws).lt("day", end);
  for (const b of bl || []) set.add(String(b.day));
  try {
    const g = await gToken();
    if (g) {
      const q = new URLSearchParams({ timeMin: new Date(spMidnight(ws)).toISOString(), timeMax: new Date(spMidnight(end)).toISOString(), singleEvents: "true", maxResults: "250" });
      const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(g.cal)}/events?` + q, { headers: { Authorization: "Bearer " + g.tok } });
      for (const e of r.ok ? ((await r.json()).items || []) : []) {
        if (!e.start?.date || e.status === "cancelled" || !/folga|f[eé]rias|feriado/i.test(e.summary || "")) continue;
        for (let t = Date.parse(e.start.date + "T12:00:00Z"); t < Date.parse(e.end.date + "T00:00:00Z"); t += DAY) set.add(new Date(t).toISOString().slice(0, 10));
      }
    }
  } catch (_) { /* sem agenda: vale so o painel */ }
  return set;
}

// ---------- montagem da semana ----------
async function note(label: string, uid: string | null = null) { try { await db.from("teacher_events").insert({ student_id: uid, kind: "msg", label }); } catch (_) { /* opcional */ } }

async function targets() {
  const [{ data: profs }, { data: cg }, { data: cgm }] = await Promise.all([
    db.from("profiles").select("id,name,display_name,email,tz,course,wa_group,status,is_admin,confirm_paused_until").eq("status", "approved"),
    db.from("class_groups").select("id,name,wa_group"), db.from("class_group_members").select("group_id,user_id")]);
  const P = new Map((profs || []).filter((p: any) => !p.is_admin).map((p: any) => [p.id, p]));
  const T: any[] = [], inGroup = new Set<string>();
  for (const g of cg || []) {
    const m = (cgm || []).filter((x: any) => x.group_id === g.id).map((x: any) => P.get(x.user_id)).filter(Boolean);
    m.forEach((p: any) => inGroup.add(p.id));
    if (g.wa_group && m.length) T.push({ target: g.wa_group, label: g.name, members: m });
  }
  for (const p of P.values()) if (!inGroup.has(p.id) && p.wa_group) T.push({ target: p.wa_group, label: p.name, members: [p] });
  return T;
}
const evKey = (l: any) => String(l.id).split(":")[0] + "|" + Date.parse(l.start_at);

async function build(phase: "thu" | "fri", dry = false, onlyTarget?: string) {
  const now = Date.now(), ws = nextMonday(now), wsMs = spMidnight(ws), weMs = wsMs + 7 * DAY;
  const blocked = await blockedDays(ws);
  const weekDays = [0, 1, 2, 3, 4, 5].map((i) => spDate(wsMs + i * DAY + 12 * 3600e3));
  if (weekDays.every((d) => blocked.has(d))) return { ws, skipped: "semana de folga", items: [] };
  const T = (await targets()).filter((t) => !onlyTarget || t.target === onlyTarget);
  const uids = T.flatMap((t) => t.members.map((p: any) => p.id));
  const { data: ls } = uids.length ? await db.from("lessons").select("id,user_id,title,start_at,end_at,is_group").in("user_id", uids).gte("start_at", new Date(now - 35 * DAY).toISOString()).lt("start_at", new Date(weMs).toISOString()) : { data: [] };
  const { data: done } = await db.from("weekly_confirm").select("target").eq("week_start", ws);
  const had = new Set((done || []).map((x: any) => x.target));
  const items: any[] = [];
  let k = 0;
  for (const t of T) {
    const tzs = [...new Set(t.members.map(tzOf))] as string[];
    const br = tzs.every(isBR);
    if ((phase === "thu") === br && !onlyTarget) continue;
    if (had.has(t.target) && !dry) continue;
    const active = t.members.filter((p: any) => !(p.confirm_paused_until && String(p.confirm_paused_until) >= ws));
    if (!active.length) continue;
    const ids = new Set(t.members.map((p: any) => p.id));
    const mine = (ls || []).filter((l: any) => ids.has(l.user_id));
    const seen = new Set<string>(), next: any[] = [];
    for (const l of mine) { const s = Date.parse(l.start_at); if (s < wsMs || s >= weMs || seen.has(evKey(l))) continue; seen.add(evKey(l)); if (!blocked.has(spDate(s))) next.push({ s, e: Date.parse(l.end_at), title: l.title }); }
    let kind = "lessons", slots = next;
    if (!next.length) {
      const past = mine.filter((l: any) => Date.parse(l.start_at) < now);
      if (!past.length) { if (!dry) await note("Confirmação semanal: " + t.label + " não teve aulas nas últimas 5 semanas e não tem aula na próxima. Não enviei mensagem."); continue; }
      const lastMs = Math.max(...past.map((l: any) => Date.parse(l.start_at)));
      const lwMs = spMidnight(spDate(lastMs)) - ((parts(lastMs, SP).wd + 6) % 7) * DAY; // segunda da semana da ultima aula
      const shift = Math.round((wsMs - lwMs) / (7 * DAY)) * 7 * DAY;
      const s2 = new Set<string>();
      for (const l of past) { const s = Date.parse(l.start_at); if (s < lwMs || s >= lwMs + 7 * DAY || s2.has(evKey(l))) continue; s2.add(evKey(l)); const ns = s + shift; if (!blocked.has(spDate(ns))) next.push({ s: ns, e: Date.parse(l.end_at) + shift, title: l.title }); }
      if (!next.length) continue;
      kind = "none"; slots = next;
    }
    const names = t.members.map(first).filter(Boolean);
    const seed = hash(t.target) + Math.floor(wsMs / (7 * DAY));
    const text = buildText(kind, names, slots, tzs, seed);
    const tz0 = tzs.find((z) => !isBR(z)) || tzs[0];
    const sendAt = inWindow(now + (k++) * 60e3, tz0);
    const row = { week_start: ws, target: t.target, uids: t.members.map((p: any) => p.id), kind, course: t.members[0].course || "en", text, tz: tz0,
      slots: kind === "none" ? slots.map((x: any) => ({ start: new Date(x.s).toISOString(), end: new Date(x.e).toISOString(), title: x.title })) : null, send_at: new Date(sendAt).toISOString() };
    items.push(row);
    if (!dry) await db.from("weekly_confirm").upsert(row, { onConflict: "week_start,target", ignoreDuplicates: true });
  }
  return { ws, blocked: [...blocked], items };
}

// ---------- leitura das respostas ----------
async function classify(sent: string, replies: string[]) {
  const txt = replies.join("\n");
  if (GEM) {
    try {
      const prompt = "Um professor de idiomas mandou esta mensagem num grupo de WhatsApp com aluno(s):\n\"\"\"" + sent + "\"\"\"\n\nRespostas recebidas depois (em ordem):\n\"\"\"" + txt + "\"\"\"\n\n" +
        "Classifique as respostas. \"confirmed\": aceitam todos os horários. \"declined\": não podem em algum dia/horário, pedem para mudar, cancelar ou remarcar. \"unclear\": não dá para saber (pergunta, assunto diferente, resposta ambígua). " +
        "Responda só JSON: {\"class\":\"confirmed|declined|unclear\",\"note\":\"resumo curto em português do que o aluno disse, se não for só uma confirmação\"}";
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEM, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }) });
      const j = await r.json();
      const o = JSON.parse(j.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      if (["confirmed", "declined", "unclear"].includes(o.class)) return { class: o.class, note: String(o.note || "").slice(0, 300) };
    } catch (_) { /* cai na regra simples */ }
  }
  const t = txt.toLowerCase();
  if (/(n[aã]o (posso|consigo|vou)|remarc|cancel|outro hor|mudar|can'?t|cannot)/.test(t)) return { class: "declined", note: "" };
  if (/(sim|pode|confirm|ok|certo|combinado|perfeito|beleza|yes|sure|claro|👍|✅)/.test(t)) return { class: "confirmed", note: "" };
  return { class: "unclear", note: "" };
}

async function createLessons(c: any) {
  const g = await gToken();
  if (!g) return "agenda do Google não conectada";
  const { data: profs } = await db.from("profiles").select("id,email").in("id", c.uids);
  const { data: busy } = await db.from("lessons").select("start_at,end_at").gte("start_at", c.slots[0].start).lte("start_at", new Date(Date.parse(c.slots[c.slots.length - 1].end) + DAY).toISOString());
  const Hh = { Authorization: "Bearer " + g.tok, "Content-Type": "application/json" };
  const fails: string[] = [];
  for (const s of c.slots) {
    const a = Date.parse(s.start), b = Date.parse(s.end);
    if ((busy || []).some((x: any) => a < Date.parse(x.end_at) && b > Date.parse(x.start_at))) { fails.push(dayLabel(a, SP) + " " + timeLabel(a, SP) + " (horário ocupado)"); continue; }
    const ev: any = { summary: s.title || c.target, start: { dateTime: s.start }, end: { dateTime: s.end }, location: ZOOM, reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 10 }] },
      attendees: (profs || []).filter((p: any) => p.email).map((p: any) => ({ email: p.email })) };
    const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(g.cal)}/events?sendUpdates=none`, { method: "POST", headers: Hh, body: JSON.stringify(ev) });
    if (!r.ok) { fails.push(dayLabel(a, SP) + " (erro " + r.status + ")"); continue; }
    const e = await r.json();
    for (const u of c.uids) await db.from("lessons").upsert({ id: e.id + ":" + u, user_id: u, title: ev.summary, start_at: s.start, end_at: s.end, meet_url: ZOOM, is_group: c.uids.length > 1, updated_at: new Date().toISOString() });
  }
  return fails.length ? "não criei: " + fails.join(", ") : "";
}

async function replies(b: any) {
  const id = String(b.key || "").split("|")[1];
  const { data: rd } = await db.from("weekly_confirm_reads").select("*").eq("id", id).maybeSingle();
  if (!rd) return { error: "leitura não encontrada" };
  await db.from("weekly_confirm_reads").update({ status: b.error ? "error" : "done", done_at: new Date().toISOString() }).eq("id", id);
  const { data: c } = await db.from("weekly_confirm").select("*").eq("id", rd.confirm_id).maybeSingle();
  if (!c || b.error) return { ok: true, error: b.error || null };
  const ins = (b.msgs || []).filter((m: any) => m && m.dir === "in" && String(m.text || "").trim()).map((m: any) => String(m.text).trim());
  if (!ins.length) return { ok: true, replies: 0 };
  const all = ins.join("\n");
  if (c.reply_text && c.reply_text === all) return { ok: true, same: true };
  const k = await classify(c.text, ins);
  const status = k.class === "confirmed" ? "confirmed" : k.class === "declined" ? "declined" : "unclear";
  const upd: any = { reply_text: all, reply_class: k.class, reply_note: k.note, replied_at: new Date().toISOString(), status };
  if (!c.thanked) {
    upd.thanked = true;
    await db.from("weekly_confirm_out").insert({ confirm_id: c.id, kind: "thanks", target: c.target, text: thanksText(c.course), send_at: new Date(inWindow(Date.now(), c.tz || SP)).toISOString() });
  }
  let extra = "";
  if (status === "confirmed" && c.kind === "none" && !c.created_lessons) { extra = await createLessons(c); upd.created_lessons = true; if (extra) await note("Confirmação semanal: " + c.target + " confirmou, mas " + extra + "."); }
  await db.from("weekly_confirm").update(upd).eq("id", c.id);
  const short = all.length > 140 ? all.slice(0, 137) + "…" : all;
  if (status === "declined") await note(c.target + " não pode em algum horário da próxima semana: \"" + short + "\"", c.uids[0]);
  if (status === "unclear") await note(c.target + " respondeu a confirmação, confira: \"" + short + "\"", c.uids[0]);
  return { ok: true, class: k.class };
}

// ---------- resumo ----------
async function summary(ws: string, round: number) {
  const { data: rows } = await db.from("weekly_confirm").select("target,status,reply_text,reply_note,kind").eq("week_start", ws).order("target");
  const R = rows || [], by = (s: string[]) => R.filter((r: any) => s.includes(r.status));
  const ok = by(["confirmed"]), no = by(["declined"]), un = by(["unclear"]), none = by(["sent"]), miss = by(["queued", "out", "missed"]);
  const head = `Confirmações da semana de ${ws.slice(8, 10)}/${ws.slice(5, 7)}: ${ok.length} confirmaram, ${no.length} não podem, ${un.length} para conferir, ${none.length} sem resposta` + (miss.length ? `, ${miss.length} não enviadas` : "");
  await note(head);
  const li = (r: any) => `<li><b>${r.target}</b>${r.reply_text ? ': "' + String(r.reply_text).replace(/</g, "&lt;").slice(0, 300) + '"' : ""}${r.reply_note ? " <i>(" + String(r.reply_note).replace(/</g, "&lt;") + ")</i>" : ""}</li>`;
  const sec = (t: string, a: any[]) => a.length ? `<h3 style="margin:16px 0 6px;color:#10224a">${t} (${a.length})</h3><ul>${a.map(li).join("")}</ul>` : "";
  const html = `<div style="font-family:Arial,sans-serif;color:#17202f"><h2 style="color:#10224a">${head}</h2>${sec("Não podem", no)}${sec("Para conferir", un)}${sec("Sem resposta", none)}${sec("Não enviadas", miss)}${sec("Confirmaram", ok)}<p style="color:#5a6577;font-size:12px">Leitura ${round} de 2 · Britland Academy</p></div>`;
  const pass = (Deno.env.get("SMTP_PASS") || "").replace(/\s/g, ""), user = Deno.env.get("SMTP_USER");
  if (!pass || !user) return { head, mail: "sem SMTP" };
  try {
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
    const cl = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
    await cl.send({ from: Deno.env.get("MAIL_FROM") || user, to: MAIL_TO, subject: "[Britland] " + head, content: head, html });
    await cl.close();
    return { head, mail: "ok" };
  } catch (e) { return { head, mail: String(e).slice(0, 200) }; }
}

// ---------- relogio (Apps Script a cada 5 min) ----------
async function step(ws: string, s: string) { const { error } = await db.from("weekly_confirm_runs").insert({ week_start: ws, step: s }); return !error; }
async function hasStep(ws: string, s: string) { const { data } = await db.from("weekly_confirm_runs").select("step").eq("week_start", ws).eq("step", s).maybeSingle(); return !!data; }
async function tick(b: any) {
  // teacher_cfg.weekly_mode = {"on":true|false,"test_group":"Teste Britland"|null}; desligado = nada acontece; test_group = tudo vai para o grupo de teste
  const { data: md } = await db.from("teacher_cfg").select("value").eq("key", "weekly_mode").maybeSingle();
  const mode = md?.value || { on: false };
  if (!mode.on) return { off: true, send: [], read: [] };
  return await tick2(b, mode.test_group || "");
}
// modo teste: nao roda o calendario (quinta/sexta/leituras) e so entrega a fila do grupo de teste
async function tick2(b: any, test: string) {
  const now = Date.now(), x = parts(now, SP), ws = nextMonday(now), log: any = {};
  if (!test) {
  const mins = x.h * 60 + x.mi, after = (wd: number, h: number) => (x.wd === wd && mins >= h * 60) || (x.wd > wd && x.wd <= 6);
  if (x.wd >= 4 && after(4, 14) && await step(ws, "build_thu")) log.thu = (await build("thu")).items.length;
  if (x.wd >= 5 && after(5, 11) && await step(ws, "build_fri")) log.fri = (await build("fri")).items.length;
  for (const [r, wd, h] of [[1, 5, 14], [2, 6, 10]] as [number, number, number][]) {
    if (x.wd >= wd && after(wd, h) && await step(ws, "read" + r)) {
      const { data: open } = await db.from("weekly_confirm").select("id").eq("week_start", ws).in("status", ["sent", "unclear"]);
      for (const c of open || []) await db.from("weekly_confirm_reads").insert({ confirm_id: c.id, round: r });
      log["read" + r] = (open || []).length;
    }
    if (await hasStep(ws, "read" + r) && !(await hasStep(ws, "sum" + r))) {
      const { data: rr } = await db.from("weekly_confirm_runs").select("done_at").eq("week_start", ws).eq("step", "read" + r).maybeSingle();
      const { data: pend } = await db.from("weekly_confirm_reads").select("id,confirm_id").eq("round", r).in("status", ["queued", "out"]);
      const { data: mine } = await db.from("weekly_confirm").select("id").eq("week_start", ws);
      const ids = new Set((mine || []).map((m: any) => m.id)), left = (pend || []).filter((p: any) => ids.has(p.confirm_id));
      if (!left.length || now - Date.parse(rr.done_at) > 45 * 60e3) {
        if (await step(ws, "sum" + r)) {
          if (r === 1) {
            const { data: silent } = await db.from("weekly_confirm").select("*").eq("week_start", ws).eq("status", "sent").is("reminded_at", null);
            for (const c of silent || []) {
              const { data: ps } = await db.from("profiles").select("name,display_name").in("id", c.uids);
              await db.from("weekly_confirm_out").insert({ confirm_id: c.id, kind: "remind", target: c.target, text: remindText((ps || []).map(first).filter(Boolean), hash(c.target)), send_at: new Date(inWindow(now, c.tz || SP)).toISOString() });
              await db.from("weekly_confirm").update({ reminded_at: new Date().toISOString() }).eq("id", c.id);
            }
          }
          log["sum" + r] = await summary(ws, r);
        }
      }
    }
  }
  } // fim do calendario
  // o que o Power Automate deve fazer agora
  const iso = new Date(now).toISOString(), send: any[] = [], read: any[] = [];
  const { data: q1 } = await db.from("weekly_confirm").select("id,target,text,send_at").eq("status", "queued").lte("send_at", iso).order("send_at").limit(20);
  const okT = (t: string) => !test || t === test;
  for (const c of (q1 || []).filter((c: any) => okT(c.target))) { await db.from("weekly_confirm").update({ status: "out" }).eq("id", c.id); send.push({ key: "c|" + c.id, group: c.target, text: c.text }); }
  const { data: q2 } = await db.from("weekly_confirm_out").select("id,target,text").eq("status", "queued").lte("send_at", iso).order("send_at").limit(20);
  for (const o of (q2 || []).filter((o: any) => okT(o.target))) { await db.from("weekly_confirm_out").update({ status: "out" }).eq("id", o.id); send.push({ key: "o|" + o.id, group: o.target, text: o.text }); }
  const { data: q3 } = await db.from("weekly_confirm_reads").select("id,confirm_id").eq("status", "queued").limit(30);
  for (const r of q3 || []) {
    const { data: c } = await db.from("weekly_confirm").select("target,text,sent_at").eq("id", r.confirm_id).maybeSingle();
    if (!c || !okT(c.target)) continue;
    await db.from("weekly_confirm_reads").update({ status: "out" }).eq("id", r.id);
    const { data: rm } = await db.from("weekly_confirm_out").select("text").eq("confirm_id", r.confirm_id);
    read.push({ key: "r|" + r.id, group: c.target, marks: [c.text, ...(rm || []).map((m: any) => m.text)].map((t: string) => t.split("\n")[1] || t.split("\n")[0]).map((t: string) => t.slice(0, 40)) });
  }
  return { ws, log, send, read };
}

async function mark(b: any) {
  const [t, id] = String(b.key || "").split("|"), ok = b.status === "sent", now = new Date().toISOString();
  if (t === "c") {
    await db.from("weekly_confirm").update(ok ? { status: "sent", sent_at: now } : { status: "missed" }).eq("id", id).in("status", ["out", "queued"]);
    if (!ok) { const { data: c } = await db.from("weekly_confirm").select("target,uids").eq("id", id).maybeSingle(); if (c) await note("Confirmação semanal NÃO enviada para " + c.target + ". Confira o grupo do WhatsApp.", c.uids[0]); }
  }
  if (t === "o") await db.from("weekly_confirm_out").update(ok ? { status: "sent", sent_at: now } : { status: "missed" }).eq("id", id);
  if (t === "r" && !ok) await db.from("weekly_confirm_reads").update({ status: "error", done_at: now }).eq("id", id);
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  const b = await req.json().catch(() => ({}));
  const k = req.headers.get("x-invite-key") || "";
  let okKey = !!IK && k === IK;
  if (!okKey && k.length >= 24) { const { data: c } = await db.from("teacher_cfg").select("value").eq("key", "weekly_key").maybeSingle(); okKey = !!c && c.value?.k === k; }
  if (!okKey) return out({ error: "forbidden" }, 403);
  try {
    if (b.action === "tick") return out(await tick(b));
    if (b.action === "mark") return out(await mark(b));
    if (b.action === "replies") return out(await replies(b));
    if (b.action === "preview") return out(await build(b.phase === "fri" ? "fri" : "thu", true, b.target));
    if (b.action === "summary") return out(await summary(b.ws, b.round || 1));
    return out({ error: "acao desconhecida" }, 400);
  } catch (e) { return out({ error: String((e as Error).message || e) }, 500); }
});
