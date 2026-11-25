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
    var LAG=(Number(nw.from)-1)-P;/* >0 atras do plano, 0 em dia, <0 adiantado */
    if(LAG===0)return Object.assign({},nx,{lag:0});
    var wd=cp.lastWord||(first&&first.last_word)||'';
    if(P>=Number(nw.to))return Object.assign({},nx,{adj:true,ahead:true,lag:LAG,planOk:false,contents:'Só REV · 20 par. (adiantado)',
      review:{from:Math.max(1,P-19),to:P,fromWord:'',toWord:wd},newWords:null});
    /* atras do plano: ensina ate 5 paragrafos para voltar ao plano (o fim do plano e o limite); em dia ou adiantado: 3 */
    var to=LAG>0?Math.max(P+3,Math.min(Number(nw.to),P+5)):P+3;
    return Object.assign({},nx,{adj:true,lag:LAG,planTo:Number(nw.to),planOk:false,review:{from:Math.max(1,P-10),to:P,fromWord:'',toWord:wd},
      newWords:{from:P+1,to:to,fromWord:'',toWord:''}});
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
      makeup:['Hoje é a aula de reposição da aula '+mn+'. 🔁\nWe\'ll start with a '+B('Revision')+RV+'.','Let\'s catch up! 🔁\nAula de reposição da aula '+mn+': '+B('Revision')+RV+'.','Aula de reposição da aula '+mn+' hoje. 🔁\nFirst, a '+B('Revision')+RV+'.'],
      nw:['Great job on the revision! 👏\n\nNow for the '+B('NEW WORK')+NW+' ✏️','Revision done! ✅\n\nNext up: the '+B('NEW WORK')+NW+' ✏️','Well done! 💪\n\nLet\'s move on to the '+B('NEW WORK')+NW+' ✏️'],
      gen:['Time for the second part of the lesson! ✏️','Second part of the lesson is up! 💪','Let\'s continue with the second part of the lesson! ✨'],
      st:['You\'ve studied '+st+' days in a row, well done! 🔥',st+' days of study in a row! Keep it up! 🔥','Great streak: '+st+' days! 🔥']
    };
    var hasNW=!!n&&(k==='normal'||k==='makeup'),link=ctx.isMeet?ctx.link:(kind==='nw'?ZOOM_NW:ZOOM_REV),
        join=(es?'🎥 Entra aquí:\n':'🎥 Join here:\n')+link;
    /* recado automatico (no maximo 1 por convite): urgentes primeiro; os leves so em ~1 de cada 2 convites; nunca repete antes do intervalo.
       ctx.notice={makeup:n,exam:bool,cert:bool,hol:['25/12'],seen:{chave:ms da ultima vez}}; individuais so para aluno unico */
    function noticeLine(){var nt=ctx.notice;if(!nt)return '';var seen=nt.seen||{},nowMs=(ctx.now||new Date()).getTime(),DAY=864e5,single=!grp;
      function ok(key,days){var t=+seen[key];return !t||nowMs-t>=days*DAY;}
      var hol=nt.hol||[],C=[];
      if(hol.length&&ok('hol',4))C.push(['hol',es?(hol.length>1?'Aviso: no tendremos clase los días '+hol.join(', ')+'.':'Aviso: no tendremos clase el día '+hol[0]+'.'):(hol.length>1?'Aviso: não teremos aula nos dias '+hol.join(', ')+'.':'Aviso: não teremos aula no dia '+hol[0]+'.')]);
      if(single&&nt.exam&&ok('exam',7))C.push(['exam',es?'Tu simulacro ya está disponible en la app 📝':'Seu simulado já está liberado no app. Faça com calma, sem pressa 📝']);
      if(single&&nt.cert&&ok('cert',30))C.push(['cert',es?'¡Felicidades! Tu certificado ya está disponible en la app 🎓':'Parabéns! Seu certificado já está disponível no app 🎓']);
      if(single&&nt.makeup>0&&ok('makeup',7))C.push(['makeup',es?(nt.makeup>1?'Tienes '+nt.makeup+' clases para recuperar. Elige el mejor horario en la app 📅':'Tienes 1 clase para recuperar. Elige el mejor horario en la app 📅'):(nt.makeup>1?'Você tem '+nt.makeup+' aulas a repor. Escolha o melhor horário no app 📅':'Você tem 1 aula a repor. Escolha o melhor horário no app 📅')]);
      if(C.length){picks[ctx.uid0+':n:'+C[0][0]]=0;return C[0][1];}
      if(rand()>=0.5)return '';
      var L=[['review',es?'Si estás disfrutando de las clases, ¿qué tal dejar una reseña del curso en la app? Toma 1 minuto 💛':'Se você está gostando das aulas, que tal deixar uma avaliação do curso no app? Leva 1 minuto 💛'],
        ['goal',es?'Meta de la semana: haz tus Lesson Checks y mantén la racha 🔥':'Meta da semana: faça seus exercícios do dia no app e mantenha a ofensiva 🔥'],
        ['mock1',es?'':'Antes da prova, que tal um simulado? Ele está no app, no card Stage Exam, com a nota e as respostas certas no final 💪'],
        ['mock2',es?'':'Novidade no app: simulados de todos os Stages, no card Stage Exam. Faça com calma e veja onde errou 📝'],
        ['refer',es?'¿Conoces a alguien que quiera aprender? ¡Recomienda Britland Academy! 🤝':'Conhece alguém que queira aprender? Indique a Britland Academy! 🤝']]
        .filter(function(x){return x[1]&&ok(x[0],21);}).sort(function(a,b){return (+seen[a[0]]||0)-(+seen[b[0]]||0);});
      if(!L.length)return '';picks[ctx.uid0+':n:'+L[0][0]]=0;return L[0][1];}
    if(kind==='nw'&&!ctx.isMeet){var nl=noticeLine();return {type:k,picks:picks,text:pick(hasNW?E.nw:E.gen,vk)+(nl?'\n\n'+nl:'')+'\n\n'+join};}
    var bn=ctx.bdays||[],ex=[];
    if(bn.length){var bl=bn.length>1?bn.slice(0,-1).join(', ')+(es?' y ':' and ')+bn[bn.length-1]:bn[0];
      ex.push(grp?(es?'¡Y feliz cumpleaños a '+bl+'! 🎂':'And happy birthday to '+bl+'! 🎂'):(es?'¡Feliz cumpleaños, '+bl+'! 🎂':'Happy birthday, '+bl+'! 🎂'));}
    if(!grp&&st>=3&&(+ctx.classNumber||0)%3===0)ex.push(pick(E.st,vk+'s'));
    var mid=pick(E[k],vk),nl2=noticeLine();
    if(ctx.isMeet&&hasNW)mid+=(es?'\nDespués, las '+B('palabras nuevas')+NW+' ✏️':'\nThen the '+B('NEW WORK')+NW+' ✏️');
    return {type:k,picks:picks,text:gr+', '+who+'! 👋'+(ex.length?'\n'+ex.join('\n'):'')+'\n\n'+mid+(nl2?'\n\n'+nl2:'')+'\n\n'+join};
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
  const hSP = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }).format(new Date())) % 24;
  for (const x of q || []) {
    if ((x.kind === "repo" || x.kind === "nudge") && (hSP < 9 || hSP >= 19)) continue;
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
