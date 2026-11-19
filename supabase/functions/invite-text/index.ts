// @ts-nocheck
// invite-text: gera os convites das aulas que comecam em breve (usado pelo Apps Script) e registra o que foi enviado.
// ARQUIVO GERADO por tools/build_invite_fn.py (junta js/invite.js + este cabecalho + invite_fn_body.ts). Nao edite o index.ts.
import { createClient } from "npm:@supabase/supabase-js@2";

/* Gerador unico dos convites de aula (WhatsApp). Usado pelo painel (nextclass.js) e pela funcao invite-text do Supabase:
   o arquivo e copiado para a funcao por tools/build_invite_fn.py, entao nao use nada de navegador aqui. */
(function(G){
  var ZOOM_REV='https://us06web.zoom.us/j/2447679341?pwd=U0xuSmU0ek15MGlEd0phWHdoMllUUT09',
      ZOOM_NW='https://us05web.zoom.us/j/5570483003?pwd=ChsyesNjuUJ598ysbcNtwynWBLzxEv.1';

  /* ajusta a proxima aula pela ultima palavra registrada (cp.paragraph): revisao de 11 paragrafos + 3 de New Work;
     adiantado vira revisao de 20 sem New Work. Le tambem o formato novo do Contents quando o servidor nao entendeu. */
  function adjust(nx,cp,first){
    cp=cp||{};
    if(nx&&!(nx.review&&nx.review.from!=null)&&nx.contents){
      var c=String(nx.contents),r=/(?:REV|REP)\s+(\d+)\s*[-–]\s*(\d+)\s*(?:\/|$)/i.exec(c),
          n=/(?:NW|NP)\s+(.+?)\s+[-–]\s+(.+?)\s*\[\s*(\d+)\s*[-–]\s*(\d+)\s*\]/i.exec(c);
      if(r||n){nx=Object.assign({},nx);if(r)nx.review={from:+r[1],to:+r[2],fromWord:'',toWord:''};
        if(n)nx.newWords={from:+n[3],to:+n[4],fromWord:n[1].trim(),toWord:n[2].trim()};}
    }
    var P=Number(cp.paragraph),rv=nx&&nx.review,nw=nx&&nx.newWords;
    if(!(P>0)||!rv||rv.from==null||!nw||nw.from==null)return nx;
    if(Number(nw.from)===P+1)return nx;
    var wd=cp.lastWord||(first&&first.last_word)||'';
    if(P>=Number(nw.to))return Object.assign({},nx,{adj:true,ahead:true,planOk:false,contents:'Só REV · 20 par. (adiantado)',
      review:{from:Math.max(1,P-19),to:P,fromWord:'',toWord:wd},newWords:null});
    return Object.assign({},nx,{adj:true,planOk:false,review:{from:Math.max(1,P-10),to:P,fromWord:'',toWord:wd},
      newWords:{from:P+1,to:P+3,fromWord:'',toWord:''}});
  }

  function kindOf(ctx){
    var c=String(ctx.contents||'');
    if(/ONBOARDING/i.test(c))return 'first';
    if(ctx.conversation)return 'conv';
    if(/OFFICIAL.*EXAM|MOCK\s*EXAM/i.test(c))return 'exam';
    if(/FULL\s+REVISION/i.test(c))return 'fullrev';
    if(ctx.missedN)return 'makeup';
    return 'normal';
  }
  function themeOf(contents){
    var m=/conversa\w*\s*[-:–]?\s*(.+)$/i.exec(String(contents||'')),t=m?m[1].replace(/\[.*?\]/g,'').trim():'';
    return /^(class|lesson|aula|clase)?$/i.test(t)?'':t;
  }
  function rg(x){return x&&x.from!=null?(x.from===x.to||x.to==null?String(x.from):x.from+'–'+x.to):'';}

  /* ctx: {es,tz,now(Date),names[],bdays[],streak,classNumber,kind('rev'|'nw'),contents,conversation,review,newWords,stage,
           missedN,isMeet,link,last{vkey:idx},uid0,rand()}  ->  {text,picks{vkey:idx},type}  */
  function build(ctx){
    var es=!!ctx.es,rand=ctx.rand||Math.random,last=ctx.last||{},picks={},kind=ctx.kind==='nw'?'nw':'rev',
        B=function(x){return '*'+x+'*';};
    function pick(arr,key){var l=last[key];if(l==null||isNaN(l))l=-1;var ix=[];for(var i=0;i<arr.length;i++)if(i!==l)ix.push(i);
      var k=ix[Math.floor(rand()*ix.length)];picks[key]=k;return arr[k];}
    var h;try{h=+new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hourCycle:'h23',timeZone:ctx.tz||'America/Sao_Paulo'}).format(ctx.now||new Date());}catch(e){h=(ctx.now||new Date()).getHours();}
    var gr=es?(h<12?'Buenos días':h<19?'Buenas tardes':'Hola'):(h<12?'Good morning':h<18?'Good afternoon':'Hello'),
        ns=ctx.names||[],grp=ns.length>1,
        who=ns.length<2?(ns[0]||''):ns.length===2?ns[0]+(es?' y ':' and ')+ns[1]:(es?'chicos':'guys'),
        k=kindOf(ctx),r=rg(ctx.review),n=rg(ctx.newWords),th=themeOf(ctx.contents),mn=ctx.missedN||'',st=ctx.streak||0,
        vk=ctx.uid0+':'+k+':'+(es?'es':'en')+(kind==='nw'?'2':'1'),
        RV=r?(es?' de los párrafos '+B(r):' of paragraphs '+B(r)):'',NW=n?(es?', párrafos '+B(n):', paragraphs '+B(n)):'',
        STGL=es?'Etapa '+(ctx.stage||''):'Stage '+(ctx.stage||''),
        pm=/PART\s*(\d+)/i.exec(String(ctx.contents||'')),pre=/PRE-?\s*EXAM/i.test(String(ctx.contents||'')),
        FR=es?STGL+(pm?' \u2013 Parte '+pm[1]:''):STGL+(pm?' \u2013 Part '+pm[1]:'');
    var E=es?{
      normal:['¿'+(grp?'Listos':'Listo')+' para la clase de hoy? 📚\nEmpezamos con un '+B('repaso')+RV+'.','¡Vamos a empezar! 🚀\nPrimero, un '+B('repaso')+RV+'.','¡Hora de nuestra clase! 📖\nComenzamos con un '+B('repaso')+RV+'.'],
      first:grp?['¡Bienvenidos a vuestra primera clase en Britland Academy! 🎉\nHoy veremos cómo funciona el curso y daremos los primeros pasos juntos.','¡La primera clase ya está aquí! 🎉\nLes mostraré cómo funciona el curso y empezaremos a aprender.','¡Bienvenidos a bordo! 🎉\nEn la primera clase conocerán el curso y empezarán a hablar enseguida.']
        :['¡Bienvenido a tu primera clase en Britland Academy! 🎉\nHoy veremos cómo funciona el curso y daremos los primeros pasos juntos.','¡Tu primera clase ya está aquí! 🎉\nTe mostraré cómo funciona el curso y empezaremos a aprender.','¡Bienvenido a bordo! 🎉\nEn la primera clase conocerás el curso y empezarás a hablar enseguida.'],
      conv:[th?'Hoy es clase de conversación: '+B(th)+' 💬\nSin palabras nuevas, ¡solo práctica!':'Hoy es clase de conversación 💬\nSin palabras nuevas, ¡solo práctica!',th?'¡Hora de hablar! 💬 Tema de hoy: '+B(th)+'.':'¡Hora de hablar! 💬','¡Día de conversación! 💬\n'+(th?'Hablaremos de '+B(th)+'. ':'')+(grp?'Disfruten.':'Relájate y disfruta.')],
      exam:['Hoy es el '+B('examen de la '+STGL)+'. ¡Mucha suerte! 🍀','¡Día de examen! 📝\nCon calma y confianza, todo saldrá bien.','Hoy tenemos el '+B('examen de la '+STGL)+'. ¡Suerte! 🍀'],
      fullrev:['Hoy hacemos un '+B('repaso completo')+' de la '+B(FR)+(pre?' y la preparación para el examen':'')+'. 🔄\n¡Vamos a repasar todo lo aprendido!','¡Hora de repasar! 🔄\nHoy es el '+B('repaso completo')+' de la '+B(FR)+(pre?', con preparación para el examen':'')+'.','¡Día de repaso completo! 🔄\nRepasaremos la '+B(FR)+(pre?' y nos prepararemos para el examen':'')+' juntos.'],
      makeup:['Hoy es la clase de reposición de la clase '+mn+'. 🔁\nEmpezamos con un '+B('repaso')+RV+'.','¡Vamos a ponernos al día! 🔁\nClase de reposición de la clase '+mn+': '+B('repaso')+RV+'.','Hoy, reposición de la clase '+mn+'. 🔁\nPrimero, un '+B('repaso')+RV+'.'],
      nw:['¡Buen trabajo con el repaso! 👏\n\nAhora las '+B('PALABRAS NUEVAS')+NW+' ✏️','¡Repaso terminado! ✅\n\nSigue: las '+B('PALABRAS NUEVAS')+NW+' ✏️','¡Bien hecho! 💪\n\nPasemos a las '+B('PALABRAS NUEVAS')+NW+' ✏️'],
      gen:['¡Hora de la segunda parte de la clase! ✏️','¡Llega la segunda parte de la clase! 💪','Continuamos con la segunda parte de la clase. ✨'],
      st:['¡Llevas '+st+' días seguidos estudiando, muy bien! 🔥','¡'+st+' días seguidos de estudio! ¡Sigue así! 🔥','¡Gran racha: '+st+' días! 🔥']
    }:{
      normal:['Ready for today\'s lesson? 📚\nWe\'ll start with a '+B('Revision')+RV+'.','Let\'s get started! 🚀\nFirst, a '+B('Revision')+RV+'.','Time for our lesson! 📖\nWe begin with a '+B('Revision')+RV+'.'],
      first:['Welcome to your first lesson at Britland Academy! 🎉\nToday we\'ll see how the course works and take our first steps together.','Your first lesson is here! 🎉\nI\'ll show you how the course works, and we\'ll start learning.','Welcome aboard! 🎉\nIn our first lesson you\'ll get to know the course and start speaking right away.'],
      conv:[th?'Today is a conversation class: '+B(th)+' 💬\nNo new words, just practice!':'Today is a conversation class 💬\nNo new words, just practice!',th?'Time to talk! 💬 Today\'s topic: '+B(th)+'.':'Time to talk! 💬','Conversation day! 💬\n'+(th?'We\'ll talk about '+B(th)+'. ':'')+'Relax and enjoy it.'],
      exam:['Today is your '+B(STGL+' exam')+'. You\'re ready, good luck! 🍀','Exam day! 📝\nTake a deep breath, you\'ve prepared well.','Today we have your '+B(STGL+' exam')+'. Good luck! 🍀'],
      fullrev:['Today we have a '+B('full revision')+' of '+B(FR)+(pre?' and exam preparation':'')+'. 🔄\nLet\'s review everything you\'ve learned!','Time to review! 🔄\nToday is the '+B('full revision')+' of '+B(FR)+(pre?', with exam preparation':'')+'.','Full revision day! 🔄\nWe\'ll go over '+B(FR)+(pre?' and prepare for the exam':'')+' together.'],
      makeup:['Today is the make-up lesson for class '+mn+'. 🔁\nWe\'ll start with a '+B('Revision')+RV+'.','Let\'s catch up! 🔁\nMake-up lesson for class '+mn+': '+B('Revision')+RV+'.','Make-up lesson for class '+mn+' today. 🔁\nFirst, a '+B('Revision')+RV+'.'],
      nw:['Great job on the revision! 👏\n\nNow for the '+B('NEW WORK')+NW+' ✏️','Revision done! ✅\n\nNext up: the '+B('NEW WORK')+NW+' ✏️','Well done! 💪\n\nLet\'s move on to the '+B('NEW WORK')+NW+' ✏️'],
      gen:['Time for the second part of the lesson! ✏️','Second part of the lesson is up! 💪','Let\'s continue with the second part of the lesson! ✨'],
      st:['You\'ve studied '+st+' days in a row, well done! 🔥',st+' days of study in a row! Keep it up! 🔥','Great streak: '+st+' days! 🔥']
    };
    var hasNW=!!n&&(k==='normal'||k==='makeup'),link=ctx.isMeet?ctx.link:(kind==='nw'?ZOOM_NW:ZOOM_REV),
        join=(es?'🎥 Entra aquí:\n':'🎥 Join here:\n')+link;
    if(kind==='nw'&&!ctx.isMeet)return {type:k,picks:picks,text:pick(hasNW?E.nw:E.gen,vk)+'\n\n'+join};
    var bn=ctx.bdays||[],ex=[];
    if(bn.length){var bl=bn.length>1?bn.slice(0,-1).join(', ')+(es?' y ':' and ')+bn[bn.length-1]:bn[0];
      ex.push(grp?(es?'¡Y feliz cumpleaños a '+bl+'! 🎂':'And happy birthday to '+bl+'! 🎂'):(es?'¡Feliz cumpleaños, '+bl+'! 🎂':'Happy birthday, '+bl+'! 🎂'));}
    if(!grp&&st>=3&&(+ctx.classNumber||0)%3===0)ex.push(pick(E.st,vk+'s'));
    var mid=pick(E[k],vk);
    if(ctx.isMeet&&hasNW)mid+=(es?'\nDespués, las '+B('palabras nuevas')+NW+' ✏️':'\nThen the '+B('NEW WORK')+NW+' ✏️');
    return {type:k,picks:picks,text:gr+', '+who+'! 👋'+(ex.length?'\n'+ex.join('\n'):'')+'\n\n'+mid+'\n\n'+join};
  }
  G.BL_INVITE={adjust:adjust,build:build,kindOf:kindOf,ZOOM_REV:ZOOM_REV,ZOOM_NW:ZOOM_NW};
})(typeof window!=='undefined'?window:globalThis);


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
    if (st && st.status === "sent") continue;
    if (st && st.status === "queued") { valid.push(e.k); items.push({ event_key: e.k, start_at: e.start_at, send_at: new Date(Date.parse(e.start_at) - 10 * 60e3).toISOString(), group: grp, title, text: st.text_sent, queued: true }); continue; }
    if (st && (st.status === "nogroup" || st.status === "missed") && !(st.status === "nogroup" && grp)) continue;
    if (!grp) { problems.push({ event_key: e.k, title, start_at: e.start_at, why: "sem nome de grupo do WhatsApp (wa_group)" }); if (!b.dry) await sb.from("invite_sent").upsert({ event_key: e.k, kind: "rev", via: "auto", status: "nogroup" }); continue; }
    const pg = prog.get(e.uids[0]) || null, fd = (pg && pg.data) || {};
    let cp = fd.currentPosition || {}, nx = fd.nextClass || null;
    if (e.uids.length > 1) for (const u of e.uids) { if (nx) break; const q = prog.get(u); if (q && q.data) { nx = q.data.nextClass || null; cp = q.data.currentPosition || cp; } }
    nx = BI.adjust(nx, cp, pg);
    const meet = (e.rows.filter((r: any) => r.meet_url)[0] || {}).meet_url || "https://us06web.zoom.us/j/2447679341";
    const ms = (((pg && pg.data) || {}).me || {}).missed;
    const single = e.uids.length === 1 && !e.rows.some((r: any) => r.is_group);
    let streak = 0;
    if (single) { try { const r = await sb.rpc("streak_calc", { uid: e.uids[0] }); const row = Array.isArray(r.data) ? r.data[0] : r.data; streak = (row && row.cur) || 0; } catch (_) { /* sem streak */ } }
    const today = (p: any) => { try { return new Intl.DateTimeFormat("en-CA", { timeZone: p.tz || "America/Sao_Paulo" }).format(new Date()).slice(5, 10); } catch (_) { return ""; } };
    const bdays = e.uids.map((u: string) => P.get(u)).filter((p: any) => /^\d{4}-\d\d-\d\d$/.test(String(p.birthdate || "")) && String(p.birthdate).slice(5, 10) === today(p)).map(first);
    const { data: last } = await sb.from("invite_state").select("vkey,idx").like("vkey", e.uids[0] + ":%");
    const lastMap: any = {}; for (const x of last || []) lastMap[x.vkey] = x.idx;
    const stg = +(pg && pg.stage) || +((/(?:stage|stg|etapa)\s*(\d+)/i.exec(links.get(e.uids[0]) || "") || [])[1]) || 0;
    const r = BI.build({ es: p0.course === "es", tz: p0.tz, now: new Date(), names: e.uids.map((u: string) => first(P.get(u))), bdays, streak,
      classNumber: nx && nx.classNumber, kind: "rev", contents: nx && nx.contents, conversation: nx && nx.conversation, review: nx && nx.review, newWords: nx && nx.newWords,
      stage: stg, missedN: single && ms && ms.length ? (ms[0].classNumber || "") : "", isMeet: /meet\.google\.com/.test(meet), link: meet, last: lastMap, uid0: e.uids[0] });
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  const b = await req.json().catch(() => ({}));
  if (!IK || req.headers.get("x-invite-key") !== IK) return out({ error: "forbidden" }, 403);
  if (b.action === "due") return out(await due(b));
  if (b.action === "mark" && b.event_key && b.status) {
    const { error } = await sb.from("invite_sent").upsert({ event_key: b.event_key, kind: b.kind || "rev", via: b.via || "auto", status: b.status, sent_at: new Date().toISOString() }, { ignoreDuplicates: false });
    return error ? out({ error: error.message }, 500) : out({ ok: true });
  }
  return out({ error: "acao desconhecida" }, 400);
});
