
const BI = (globalThis as any).BL_INVITE;
const URL_ = Deno.env.get("SUPABASE_URL")!;
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const IK = Deno.env.get("INVITE_KEY") || "";
const sb = createClient(URL_, SRV, { auth: { persistSession: false } });
const es = sb.schema("es");
const H = { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const evKey = (id: string) => String(id).split(":")[0];
const iso = (d: string) => new Date(d).toISOString();
const first = (p: any) => String(p.display_name || p.name || p.email || "").trim().split(/\s+/)[0];

async function syncCal() {
  try {
    const r = await fetch(`${URL_}/functions/v1/gcal-sync`, { method: "POST", headers: { Authorization: `Bearer ${SRV}`, "x-invite-key": IK, "content-type": "application/json" }, body: "{}" });
    return await r.json().catch(() => ({ status: r.status }));
  } catch (e) { return { error: String(e) }; }
}

async function due(b: any) {
  const sync = b.nosync ? null : await syncCal();
  const now = Date.now(), ahead = (b.ahead_min || 25) * 60e3;
  const from = b.from ? iso(b.from) : new Date(now).toISOString(), to = b.to ? iso(b.to) : new Date(now + ahead).toISOString();
  const { data: ls } = await sb.from("lessons").select("id,user_id,title,start_at,end_at,meet_url,is_group").gte("start_at", from).lte("start_at", to).order("start_at");
  const uidsAll = [...new Set((ls || []).map((l: any) => l.user_id).filter(Boolean))];
  if (!uidsAll.length) return { sync, items: [], valid: [], problems: [] };
  const [{ data: profs }, ppA, ppB, plA, { data: cg }, { data: cgm }] = await Promise.all([
    sb.from("profiles").select("id,name,email,display_name,course,tz,birthdate,is_admin,wa_group").in("id", uidsAll),
    sb.from("plan_progress").select("user_id,stage,class_number,last_word,data").in("user_id", uidsAll),
    es.from("plan_progress").select("user_id,stage,class_number,last_word,data").in("user_id", uidsAll),
    sb.from("plan_links").select("user_id,sheet_name").in("user_id", uidsAll),
    sb.from("class_groups").select("id,name,wa_group"), sb.from("class_group_members").select("group_id,user_id"),
  ]);
  const P = new Map((profs || []).map((p: any) => [p.id, p]));
  const prog = new Map(); for (const x of [...(ppB.data || []), ...(ppA.data || [])]) prog.set(x.user_id, x);
  const links = new Map((plA.data || []).map((x: any) => [x.user_id, x.sheet_name]));
  const byEv = new Map<string, any>();
  for (const l of ls || []) {
    if (!l.user_id || !P.get(l.user_id) || P.get(l.user_id).is_admin) continue;
    const k = evKey(l.id) + "|" + iso(l.start_at);
    const e = byEv.get(k) || { k, start_at: iso(l.start_at), rows: [], uids: [] };
    e.rows.push(l); if (!e.uids.includes(l.user_id)) e.uids.push(l.user_id); byEv.set(k, e);
  }
  const keys = [...byEv.keys()];
  const { data: sent } = keys.length ? await sb.from("invite_sent").select("event_key,kind,status,via,text_sent").eq("kind", "rev").in("event_key", keys) : { data: [] };
  const S = new Map((sent || []).map((x: any) => [x.event_key, x]));
  const items: any[] = [], valid: string[] = [], problems: any[] = [];
  for (const e of byEv.values()) {
    const st = S.get(e.k);
    const p0 = P.get(e.uids[0]);
    let grp = p0.wa_group || "";
    if (e.uids.length > 1 || e.rows.some((r: any) => r.is_group)) {
      grp = "";
      for (const g of cg || []) { const m = (cgm || []).filter((x: any) => x.group_id === g.id).map((x: any) => x.user_id); if (g.wa_group && e.uids.every((u: string) => m.includes(u))) { grp = g.wa_group; break; } }
    }
    const title = e.rows[0].title || "Aula";
    if (st && (st.status === "sent" || st.status === "now" || st.status === "queued_now")) continue;
    if (st && st.status === "queued") { valid.push(e.k); items.push({ event_key: e.k, start_at: e.start_at, send_at: new Date(Date.parse(e.start_at) - 10 * 60e3).toISOString(), group: grp, title, text: st.text_sent, queued: true }); continue; }
    if (st && (st.status === "nogroup" || st.status === "missed") && !(st.status === "nogroup" && grp)) continue;
    if (!grp) { problems.push({ event_key: e.k, title, start_at: e.start_at, why: "sem nome de grupo do WhatsApp (wa_group)" }); if (!b.dry) await sb.from("invite_sent").upsert({ event_key: e.k, kind: "rev", via: "auto", status: "nogroup" }); continue; }
    const pg = prog.get(e.uids[0]) || null, fd = (pg && pg.data) || {};
    let cp = fd.currentPosition || {}, nx = fd.nextClass || null;
    if (e.uids.length > 1) for (const u of e.uids) { if (nx) break; const q = prog.get(u); if (q && q.data) { nx = q.data.nextClass || null; cp = q.data.currentPosition || cp; } }
    nx = BI.adjust(nx, cp, pg);
    const meet = (e.rows.filter((r: any) => r.meet_url)[0] || {}).meet_url || "https://us06web.zoom.us/j/2447679341?pwd=U0xuSmU0ek15MGlEd0phWHdoMllUUT09";
    const ms = (((pg && pg.data) || {}).me || {}).missed;
    const single = e.uids.length === 1 && !e.rows.some((r: any) => r.is_group);
    let streak = 0;
    if (single) { try { const r = await sb.rpc("streak_calc", { uid: e.uids[0] }); const row = Array.isArray(r.data) ? r.data[0] : r.data; streak = (row && row.cur) || 0; } catch (_) { /* sem streak */ } }
    const today = (p: any) => { try { return new Intl.DateTimeFormat("en-CA", { timeZone: p.tz || "America/Sao_Paulo" }).format(new Date()).slice(5, 10); } catch (_) { return ""; } };
    const bdays = e.uids.map((u: string) => P.get(u)).filter((p: any) => /^\d{4}-\d\d-\d\d$/.test(String(p.birthdate || "")) && String(p.birthdate).slice(5, 10) === today(p)).map(first);
    const { data: last } = await sb.from("invite_state").select("vkey,idx,updated_at").like("vkey", e.uids[0] + ":%");
    const lastMap: any = {}, nseen: any = {}; for (const x of last || []) { if (/:n:/.test(x.vkey)) nseen[x.vkey.split(":n:")[1]] = Date.parse(x.updated_at); else lastMap[x.vkey] = x.idx; }
    const d0 = new Date().toISOString().slice(0, 10), d10 = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10), u0 = e.uids[0];
    const [cr, ex, ce, bl] = await Promise.all([
      single ? sb.from("class_credits").select("id", { count: "exact", head: true }).eq("user_id", u0).is("made_up_at", null) : { count: 0 },
      single ? sb.from("exam_release").select("user_id").eq("user_id", u0).gte("released_at", new Date(Date.now() - 14 * 864e5).toISOString()).limit(1) : { data: [] },
      single ? sb.from("certificates").select("user_id").eq("user_id", u0).gte("completed_on", new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)).limit(1) : { data: [] },
      sb.from("availability_blocks").select("day").gte("day", d0).lte("day", d10).order("day"),
    ]);
    const notice = { makeup: (cr as any).count || 0, exam: !!((ex as any).data || []).length, cert: !!((ce as any).data || []).length,
      hol: ((bl as any).data || []).map((x: any) => String(x.day).slice(8, 10) + "/" + String(x.day).slice(5, 7)), seen: nseen };
    const stg = +(pg && pg.stage) || +((/(?:stage|stg|etapa)\s*(\d+)/i.exec(links.get(e.uids[0]) || "") || [])[1]) || 0;
    const r = BI.build({ es: p0.course === "es", tz: p0.tz, now: new Date(), names: e.uids.map((u: string) => first(P.get(u))), bdays, streak,
      classNumber: nx && nx.classNumber, kind: "rev", contents: nx && nx.contents, conversation: nx && nx.conversation, review: nx && nx.review, newWords: nx && nx.newWords,
      stage: stg, missedN: single && ms && ms.length ? (ms[0].classNumber || "") : "", isMeet: /meet\.google\.com/.test(meet), link: meet, last: lastMap, uid0: e.uids[0], notice });
    if (!b.dry) {
      const rows = Object.keys(r.picks).map((k) => ({ vkey: k, idx: r.picks[k], updated_at: new Date().toISOString() }));
      if (rows.length) await sb.from("invite_state").upsert(rows);
      await sb.from("invite_sent").upsert({ event_key: e.k, kind: "rev", via: "auto", status: "queued", text_sent: r.text, sent_at: new Date().toISOString() });
    }
    valid.push(e.k);
    items.push({ event_key: e.k, start_at: e.start_at, send_at: new Date(Date.parse(e.start_at) - 10 * 60e3).toISOString(), group: grp, title, text: r.text });
  }
  return { sync, items, valid, problems };
}

/* envio manual pelo botao do painel: o app grava invite_sent com status "now" (kind rev ou nw) e o texto; aqui viram itens para o Apps Script/Power Automate */
async function nowDue() {
  const { data: q } = await sb.from("invite_sent").select("event_key,kind,text_sent").eq("status", "now");
  const items: any[] = [], problems: any[] = [];
  for (const x of q || []) {
    const [ek, startIso] = String(x.event_key).split("|");
    const { data: ls } = await sb.from("lessons").select("id,user_id,title,start_at,is_group").eq("start_at", startIso);
    const rows = (ls || []).filter((l: any) => evKey(l.id) === ek && l.user_id);
    if (!rows.length || !x.text_sent) { await sb.from("invite_sent").upsert({ event_key: x.event_key, kind: x.kind, via: "app", status: "missed", sent_at: new Date().toISOString() }); continue; }
    const uids = [...new Set(rows.map((r: any) => r.user_id))];
    const [{ data: profs }, { data: cg }, { data: cgm }] = await Promise.all([sb.from("profiles").select("id,wa_group").in("id", uids), sb.from("class_groups").select("id,wa_group"), sb.from("class_group_members").select("group_id,user_id")]);
    let grp = ((profs || [])[0] || {}).wa_group || "";
    if (uids.length > 1 || rows.some((r: any) => r.is_group)) {
      grp = "";
      for (const g of cg || []) { const m = (cgm || []).filter((y: any) => y.group_id === g.id).map((y: any) => y.user_id); if (g.wa_group && uids.every((u: string) => m.includes(u))) { grp = g.wa_group; break; } }
    }
    const title = rows[0].title || "Aula";
    if (!grp) { problems.push({ event_key: x.event_key, title }); await sb.from("invite_sent").upsert({ event_key: x.event_key, kind: x.kind, via: "app", status: "missed", sent_at: new Date().toISOString() }); continue; }
    await sb.from("invite_sent").upsert({ event_key: x.event_key, kind: x.kind, via: "app", status: "queued_now", text_sent: x.text_sent, sent_at: new Date().toISOString() });
    items.push({ event_key: x.event_key, kind: x.kind, start_at: new Date(startIso).toISOString(), group: grp, title, text: x.text_sent });
  }
  return { items, problems };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  const b = await req.json().catch(() => ({}));
  if (!IK || req.headers.get("x-invite-key") !== IK) return out({ error: "forbidden" }, 403);
  if (b.action === "due") return out(await due(b));
  if (b.action === "now") return out(await nowDue());
  if (b.action === "mark" && b.event_key && b.status) {
    const { error } = await sb.from("invite_sent").upsert({ event_key: b.event_key, kind: b.kind || "rev", via: b.via || "auto", status: b.status, sent_at: new Date().toISOString() }, { ignoreDuplicates: false });
    return error ? out({ error: error.message }, 500) : out({ ok: true });
  }
  return out({ error: "acao desconhecida" }, 400);
});
