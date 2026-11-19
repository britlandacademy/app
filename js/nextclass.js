/* Teacher panel · "Próxima aula" card: review, where they stopped, what is taught today, difficulties, reinforcement, attendance. */
(function(W){
'use strict';
var D=document,ZOOM='https://us06web.zoom.us/j/2447679341',ZOOM_REV='https://us06web.zoom.us/j/2447679341?pwd=U0xuSmU0ek15MGlEd0phWHdoMllUUT09',ZOOM_NW='https://us05web.zoom.us/j/5570483003?pwd=ChsyesNjuUJ598ysbcNtwynWBLzxEv.1',TZ='America/Sao_Paulo',CACHE={};
function el(t,c,x){var e=D.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function add(p){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c==null)continue;p.appendChild(typeof c==='string'?D.createTextNode(c):c);}return p;}
function css(){if(D.getElementById('nc-css'))return;var s=el('style');s.id='nc-css';s.textContent=
'.nc{display:grid;gap:12px}.nc .nc-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.nc .nc-top .sp{flex:1}'+
'.nc .nc-who{font-size:1.25rem;font-weight:700;margin:2px 0 0}.nc .nc-sub{color:var(--muted);font-size:.88rem}'+
'.nc .nc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}@media(max-width:760px){.nc .nc-grid{grid-template-columns:1fr}}'+
'.nc .nc-box{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px 12px;min-width:0}.nc .nc-box.today{border-color:var(--accent)}'+
'.nc .nc-k{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}.nc .nc-v{font-weight:700;margin-top:4px}.nc .nc-m{color:var(--muted);font-size:.86rem;margin-top:2px}'+
'.nc-pill{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:1px 9px;font-size:.78rem;font-weight:700;margin:2px 4px 2px 0}.nc-pill.bad{background:var(--bad-bg);color:var(--bad);border-color:transparent}.nc-pill.warn{background:var(--warn-bg);color:var(--warn);border-color:transparent}.nc-pill.ok{background:var(--ok-bg);color:var(--ok);border-color:transparent}'+
'.nc .nc-st{display:grid;grid-template-columns:1.1fr 1.3fr 1.3fr 1.7fr;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line);font-size:.92rem}.nc .nc-st.h{border-top:0;padding:2px 0}@media(max-width:760px){.nc .nc-st{grid-template-columns:1fr}.nc .nc-st.h{display:none}}'+
'.nc .nc-tg{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.nc .nc-tg button{min-height:34px;padding:2px 12px;border-radius:10px;font-size:.84rem;background:transparent;color:var(--ink);border:2px solid var(--line)}.nc .nc-tg button.on{background:var(--ok);color:var(--surface,#fff);border-color:var(--ok)}.nc .nc-tg button.late.on{background:var(--warn);border-color:var(--warn)}.nc .nc-tg button.ns.on{background:var(--bad);border-color:var(--bad)}'+
'.nc .nc-tg input{width:92px;min-height:38px;border:2px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);padding:0 4px 0 10px;font:700 1rem inherit;text-align:center}'+
'.nc .nc-chip{display:inline-block;border:2px solid var(--line);border-radius:12px;padding:6px 12px;margin:3px 6px 3px 0;background:var(--surface);color:var(--ink);font-weight:700;font-size:.86rem;min-height:0}.nc .nc-chip.on{border-color:var(--accent);background:var(--card)}'+
'.nc .nc-foot{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px}.nc .nc-foot .sp{flex:1}.nc .nc-msg{color:var(--muted);font-size:.84rem}'+
'.nc-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;display:flex;align-items:center;gap:10px;max-width:min(92vw,420px);padding:12px 18px;border-radius:99px;background:var(--card,#10224a);color:var(--ink,#f2f5fa);border:1px solid var(--line,#27407a);border-top:3px solid var(--accent,#c9a13b);box-shadow:0 12px 36px rgba(0,0,0,.5);font-weight:700;cursor:pointer;transition:opacity .3s}.nc-toast.out{opacity:0}.nc-toast-ic{display:inline-flex;width:30px;height:30px;border-radius:50%;background:var(--accent,#c9a13b);color:var(--accent-ink,#1a1405);align-items:center;justify-content:center;flex:none}'+
'.nc a.nc-btn.go{border-radius:999px;gap:8px;padding:0 20px;transition:transform .12s,background .15s}.nc a.nc-btn.ic{border-radius:999px;width:40px;padding:0}html:not(.fx-off) .nc a.nc-btn:active{transform:scale(.98)}'+
'.nc a.nc-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 16px;border-radius:12px;font-weight:700;text-decoration:none;border:2px solid var(--accent);color:var(--accent)}.nc a.nc-btn.go{background:var(--accent);color:var(--accent-ink)}';
s.textContent+='.nc-atr{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn);border-radius:12px;padding:8px 12px;margin:0 0 10px;font-size:.88rem}.nc-atr b{font-weight:800}.nc-atr span{opacity:.9}.nc-reg{margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);display:grid;gap:8px}.nc-rw{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.nc-reg input[type=text],.nc-reg input[type=number]{min-height:38px;padding:4px 10px;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit;font:inherit;min-width:0}.nc-ck{display:flex;align-items:center;gap:4px;font-size:.88rem}';
s.textContent+='.ag2 .ag2-it.ag2-hol{border:2px solid var(--warn);border-left-width:4px}.ag2 .ag2-holband{background:var(--warn-bg);color:var(--warn);font-weight:800;font-size:.82rem;padding:6px 12px;border-bottom:1px solid var(--warn)}';
s.textContent+='.ag2 .ag2-crrow{padding:0 12px 10px}.ag2 .ag2-crpill{min-height:30px;padding:2px 10px;border-radius:999px;background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn);font:inherit;font-size:.78rem;font-weight:800;cursor:pointer}.ag-ovb .ag2-crow{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}';
s.textContent+='.ag2-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.ag2-acts .ag-btn{margin:0}.ag2-danger{color:#c0392b;border-color:#c0392b}.ag-inp{width:100%;min-height:44px;font:inherit;padding:6px 10px;border-radius:10px;border:1px solid currentColor;background:transparent;color:inherit}';
s.textContent+='.ag2 .ag2-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 4px}.ag2 .ag2-tab{min-height:36px;padding:2px 14px;border-radius:999px;border:2px solid var(--line);background:transparent;color:var(--muted);font-weight:700;font-size:.85rem}.ag2 .ag2-tab.on{border-color:var(--accent);color:var(--accent);background:var(--card)}'+
'.ag2 .ag2-day{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:800;margin:16px 0 4px}'+
'.ag2 .ag2-it{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:14px;background:var(--card);margin:8px 0;overflow:hidden}.ag2 .ag2-it.bad{border-left-color:var(--bad)}.ag2 .ag2-it.ok{border-left-color:var(--ok)}'+
'.ag2 .ag2-hd{display:flex;gap:10px;align-items:center;padding:10px 12px}.ag2 .ag2-main{flex:1;min-width:0;display:flex;gap:12px;align-items:center;text-align:left;background:transparent;border:0;color:var(--ink);padding:0;min-height:44px;font:inherit;cursor:pointer}'+
'.ag2 .ag2-tm{font-weight:700;font-size:1.1rem;min-width:56px}.ag2 .ag2-tt{font-weight:700}.ag2 .ag2-sub{color:var(--muted);font-size:.86rem;margin-top:2px}.ag2 .ag2-chev{margin-left:auto;color:var(--muted)}'+
'.ag2 a.ag2-q{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border-radius:10px;border:2px solid var(--accent);color:var(--accent);font-weight:700;font-size:.84rem;text-decoration:none;white-space:nowrap}.ag2 a.ag2-q.go{background:var(--accent);color:var(--accent-ink)}'+
'.ag2 .ag2-det{padding:4px 14px 14px;border-top:1px solid var(--line)}.ag2 .ag2-det .nc{margin-top:10px}';
s.textContent+='.nc .nc-box.c-blue{background:rgba(55,138,221,.12);border:1.5px solid #378add}.nc .nc-box.c-ok{background:var(--ok-bg);border:1.5px solid var(--ok)}.nc .nc-box.c-ok .nc-k,.nc .nc-box.c-ok .nc-m{color:var(--ok)}.nc .nc-box.c-warn{background:var(--warn-bg);border:1.5px solid var(--warn)}.nc .nc-box.c-warn .nc-k,.nc .nc-box.c-warn .nc-m{color:var(--warn)}.nc .nc-box.c-bad{background:var(--bad-bg);border:1.5px solid var(--bad)}.nc .nc-box.c-bad .nc-k,.nc .nc-box.c-bad .nc-m{color:var(--bad)}.nc .nc-box.c-gold{background:color-mix(in srgb,#c9a13b 14%,var(--surface));border:1.5px solid #c9a13b}';
s.textContent+='.nc-pend .nc-tm,.nc-pend a.nc-btn.go,.nc-pend a.nc-btn.ic{display:none!important}.nc-pb{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn);border-radius:12px;padding:8px 12px;margin:0 0 10px;font-size:.88rem}.nc-pb b{font-weight:800}';
s.textContent+='.nc .nc-cr{display:inline-block;background:color-mix(in srgb,#c9a13b 18%,var(--surface));border:1px solid #c9a13b;color:var(--ink);border-radius:99px;padding:1px 10px;font-size:.78rem;font-weight:800}';
s.textContent+='.nc .nc-tm{display:inline-flex;align-items:center;gap:8px;background:#0b1733;color:#fff;border-radius:10px;padding:4px 12px;min-width:116px;justify-content:center}.nc .nc-tm small{display:block;font-size:.66rem;text-transform:uppercase;letter-spacing:.08em;color:#cfd7e6;line-height:1.1}.nc .nc-tm b{font-size:1.25rem;font-weight:700;font-variant-numeric:tabular-nums}.nc .nc-tm.run{background:#1d5e2e}.nc-tm.alarm{position:relative;background:#8c1d18}.nc-tm.alarm:before,.nc-tm.alarm:after{content:\'\';position:absolute;inset:-4px;border-radius:14px;border:2px solid #e5484d;pointer-events:none;animation:ncWave 1s ease-out infinite}.nc-tm.alarm:after{animation-delay:.5s}@keyframes ncWave{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.22,1.5);opacity:0}}html.fx-off .nc-tm.alarm:before,html.fx-off .nc-tm.alarm:after{animation:none;opacity:.5}@media (prefers-reduced-motion:reduce){.nc-tm.alarm:before,.nc-tm.alarm:after{animation:none;opacity:.5}}.nc .nc-tm.extra{background:#854f0b}';
D.head.appendChild(s);}
var LAGMAX=6,LAGEDIT=30;
function lagOf(d){d=d||{};var cp=d.currentPosition||{},nw=d.nextClass&&d.nextClass.newWords,reg=Number(cp.paragraph),pl=nw&&Number(nw.from);
  if(!reg||!pl)return null;var lag=pl-1-reg;return lag>LAGMAX?{lag:lag,reg:reg,plan:pl,edit:lag>=LAGEDIT}:null;}
function pf(x){return x&&x.from!=null?(x.from===x.to?'par. '+x.from:'par. '+x.from+'–'+x.to):'';}
function pw(x){return x&&x.fromWord?(x.fromWord===x.toWord||!x.toWord?x.fromWord:x.fromWord+' → '+x.toWord):'';}
function when(d){var s=d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:TZ})+' · '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:TZ}),m=d-Date.now();
  if(m>0){var h=Math.floor(m/36e5),mi=Math.round((m%36e5)/6e4);s+=' · em '+(h>=24?Math.floor(h/24)+' d '+(h%24)+' h':h>0?h+' h'+(mi?' '+mi+' min':''):mi+' min');}else s+=' · em andamento';return s;}
function diffKey(e){var cl=function(t){return String(t||'').trim().toLowerCase().replace(/[.,;:?!]+(\s|$)/g,'$1').trim();},g=cl(e.given),x=cl(e.expected);if(!x)return null;
  if(g&&g!==x){var gw=g.split(/\s+/),xw=x.split(/\s+/),i=0;while(i<gw.length&&i<xw.length&&gw[i]===xw[i])i++;var j=0;while(j<gw.length-i&&j<xw.length-i&&gw[gw.length-1-j]===xw[xw.length-1-j])j++;
    var a=gw.slice(i,gw.length-j).join(' '),b=xw.slice(i,xw.length-j).join(' ');if(a&&b&&a.length<24&&b.length<24)return a+' → '+b;}
  return x.length<28?x:null;}
function recent(){return new Date(Date.now()-21*864e5).toISOString();}

var STK=null,STKAT=0;
function loadStk(sb){if(STK&&Date.now()-STKAT<3e5)return;try{Promise.resolve(sb.rpc('admin_streaks')).then(function(r){var m={};((r&&r.data)||[]).forEach(function(x){if(x.email)m[String(x.email).toLowerCase()]=x.cur||0;});STK=m;STKAT=Date.now();},function(){});}catch(e){}}
function loadData(sb,ev,deps){
  var key=String(ev.id).split(':')[0],out={key:key,rows:[],prog:{},links:{},errs:[],att:{},prev:{},cfg:null};
  return sb.from('lessons').select('id,user_id,title,start_at,end_at,meet_url,is_group').eq('start_at',ev.start_at).then(function(r){
    out.rows=(r&&r.data)||[];var adm={};deps.profiles().forEach(function(p){adm[p.id]=p;});
    out.uids=[];out.rows.forEach(function(x){if(adm[x.user_id]&&!adm[x.user_id].is_admin&&out.uids.indexOf(x.user_id)<0)out.uids.push(x.user_id);});
    if(!out.uids.length)return out;var u=out.uids;
    return Promise.all([
      sb.from('plan_progress').select('user_id,stage,lesson,class_number,last_word,data').in('user_id',u),
      sb.from('plan_links').select('user_id,sheet_name,student_col').in('user_id',u),
      sb.from('attempt_errors').select('user_id,kind,lesson,ex,item,given,expected,created_at').in('user_id',u).gte('created_at',recent()).limit(600),
      sb.from('class_attendance').select('user_id,status,late_min').eq('event_key',key),
      sb.from('lessons').select('user_id,start_at').in('user_id',u).lt('end_at',new Date().toISOString()).order('end_at',{ascending:false}).limit(80),
      sb.from('teacher_cfg').select('key,value').in('key',['plans_sheet','plans_gids']),
      sb.from('invite_state').select('vkey,idx').like('vkey',u[0]+':%'),
      sb.from('invite_sent').select('status,via,kind').eq('event_key',key+'|'+new Date(ev.start_at).toISOString()),
      sb.from('lessons').select('start_at').eq('user_id',u[0]).gte('start_at',new Date().toISOString()).lt('start_at',new Date(Date.now()+35*864e5).toISOString()).limit(60),
      sb.from('class_credits').select('user_id').in('user_id',u).is('made_up_at',null)
    ].map(function(q){return Promise.resolve(q).then(function(x){return x&&!x.error?x.data||[]:[];},function(){return [];});})).then(function(a){
      a[0].forEach(function(x){out.prog[x.user_id]=x;});a[1].forEach(function(x){out.links[x.user_id]=x;});out.errs=a[2];
      a[3].forEach(function(x){out.att[x.user_id]=x;});a[4].forEach(function(x){if(!out.prev[x.user_id])out.prev[x.user_id]=x.start_at;});
      var c={};a[5].forEach(function(x){c[x.key]=x.value;});out.cfg=c;out.inv={};a[6].forEach(function(x){out.inv[x.vkey]=x.idx;});out.sentRev=(a[7].filter(function(x){return x.kind==='rev';})[0])||null;out.futN=a[8].length;var cm={};a[9].forEach(function(x){cm[x.user_id]=(cm[x.user_id]||0)+1;});out.crN=Math.max.apply(null,[0].concat(Object.keys(cm).map(function(k){return cm[k];})));var c28=Date.now()-28*864e5;out.pastN=a[4].filter(function(x){return x.user_id===u[0]&&new Date(x.start_at).getTime()>c28;}).length;return out;});
  });
}

function studyInfo(uid,since,ATT){var seen={},n={ex:0,check:0,wb:0,other:0},last=0;
  ATT.forEach(function(a){if(a.user_id!==uid)return;var t=new Date(a.created_at).getTime();if(t>last)last=t;if(since&&t<since)return;var k=a.kind+'|'+a.lesson+'|'+a.ex;if(seen[k])return;seen[k]=1;
    var kk=/^ex/.test(a.kind)?'ex':/check/.test(a.kind)?'check':/^w/.test(a.kind)?'wb':'other';n[kk]++;});
  return {n:n,last:last};}

var IDXQ=null;
function loadIdx(cb){if(window.BL_WORDIDX)return cb(window.BL_WORDIDX);
  if(!IDXQ){IDXQ=[];var sc=document.querySelector('script[src*="nextclass.js"]'),base=sc?sc.src.replace(/nextclass\.js.*$/,''):'js/',t=document.createElement('script');
    t.src=base+'wordidx.js';t.onload=function(){var q=IDXQ;IDXQ=null;q.forEach(function(f){f(window.BL_WORDIDX);});};t.onerror=function(){var q=IDXQ;IDXQ=null;q.forEach(function(f){f(null);});};document.head.appendChild(t);}
  IDXQ.push(cb);}
function zoomApp(u){var m=/\/j\/(\d+)/.exec(String(u||''));if(!m)return u;var pw=/[?&]pwd=([^&#]+)/.exec(u);return 'zoommtg://zoom.us/join?confno='+m[1]+(pw?'&pwd='+pw[1]:'');}
/* monitor principal via Window Management API (pede permissao uma vez); null se indisponivel */
function screens(){
  if(!window.getScreenDetails)return Promise.resolve(null);
  return window.getScreenDetails().then(function(d){return d.screens.filter(function(x){return x.isPrimary;})[0]||null;},function(){return null;});}
/* etiqueta de fuso: so aparece quando o aluno esta com o relogio diferente do de Brasilia */
function tzTag(tz,iso){
  if(!tz||tz==='America/Sao_Paulo'||tz==='America/Fortaleza'||tz==='America/Bahia'||tz==='America/Recife'||tz==='America/Belem')return null;
  try{var d=new Date(iso||Date.now()),f=function(z){return new Intl.DateTimeFormat('en-US',{timeZone:z,hour:'numeric',minute:'numeric',hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(d).reduce(function(o,x){o[x.type]=x.value;return o;},{});},
    ms=function(o){return Date.UTC(+o.year,+o.month-1,+o.day,+o.hour,+o.minute);},df=(ms(f(tz))-ms(f('America/Sao_Paulo')))/36e5;
    if(Math.abs(df)<.01)return null;
    var city=tz.split('/').pop().replace(/_/g,' '),hm=new Intl.DateTimeFormat('pt-BR',{timeZone:tz,hour:'2-digit',minute:'2-digit'}).format(d),
      sg=(df>0?'+':'\u2212')+Math.abs(Math.round(df*2)/2).toString().replace('.',',')+' h';
    return {city:city,hm:hm,diff:sg,tz:tz};}catch(e){return null;}}
function render(box,ev,deps,opts){opts=opts||{};
  css();box.textContent='';var wrap=el('div','nc');box.appendChild(wrap);
  var name=function(id){var p=deps.profiles().filter(function(x){return x.id===id;})[0];return p?(p.display_name||p.name||p.email):'Aluno';};
  var start=new Date(ev.start_at);
  loadStk(deps.sb);
  loadData(deps.sb,ev,deps).then(function(d){
    if(!d.uids||!d.uids.length){var t=el('div','nc-top');add(t,el('div','nc-who',ev.title||'Aula'));wrap.appendChild(t);wrap.appendChild(el('div','nc-sub','Esta aula ainda não está ligada a nenhum aluno. Escolha o aluno na Agenda.'));return;}
    var group=d.uids.length>1||d.rows.some(function(r){return r.is_group;}),first=d.prog[d.uids[0]]||null,fd=first&&first.data||{},cp=fd.currentPosition||{},nx=fd.nextClass||null;
    if(group){for(var i=0;i<d.uids.length&&!nx;i++){var q=d.prog[d.uids[i]];if(q&&q.data){nx=q.data.nextClass||null;cp=q.data.currentPosition||cp;}}}
    /* o que baliza a aula e a ultima palavra registrada na planilha: revisao = 11 paragrafos terminando nela; new work comeca no seguinte (o fim segue o plano) */
    /* o que baliza a aula e a ultima palavra registrada na planilha (regra em js/invite.js, a mesma da automacao) */
    nx=BL_INVITE.adjust(nx,cp,first);
    var meet=(d.rows.filter(function(r){return r.meet_url;})[0]||{}).meet_url||ZOOM;
    var cfg=d.cfg||{},sid=cfg.plans_sheet&&cfg.plans_sheet.id,gids=cfg.plans_gids||{},ln=d.links[d.uids[0]],gid=ln&&gids[ln.sheet_name];
    var lg=lagOf({currentPosition:cp,nextClass:nx});
    if(lg&&!opts.past){var ab=el('div','nc-atr');ab.appendChild(el('b',null,'\u26A0 '+(lg.edit?'Registro e plano em edições diferentes?':lg.lag+' parágrafos atrás do plano')));
      ab.appendChild(el('span',null,lg.edit?'Registro par. '+lg.reg+', plano par. '+lg.plan+' · confira o nome da aba (2nd ou 3rd)':'Parou no par. '+lg.reg+' · o plano da aula de hoje começa no par. '+lg.plan));wrap.appendChild(ab);}
    if(opts.pending){wrap.className+=' nc-pend';var pb=el('div','nc-pb');pb.appendChild(el('b',null,'Aula terminada · falta fechar'));pb.appendChild(el('span',null,'Registre a aula abaixo para liberar a próxima.'));wrap.appendChild(pb);}
    /* header */
    var top=el('div','nc-top'),hd=el('div');if(!opts.compact)add(hd,el('div','mu',opts.pending?'AULA ATUAL · FALTA FECHAR · '+when(start).toUpperCase()+' · TERMINOU HÁ '+(function(){var m=Math.max(0,Math.round((Date.now()-new Date(ev.end_at||ev.start_at).getTime())/6e4));return m<60?m+' MIN':Math.floor(m/60)+' H '+(m%60)+' MIN';})():'PRÓXIMA AULA · '+when(start).toUpperCase()),el('div','nc-who',ev.title||'Aula'));
    var sub=[];if(nx&&nx.classNumber)sub.push('aula nº '+nx.classNumber);if(fd.classesDone!=null&&fd.classesTotal)sub.push(fd.classesDone+' de '+fd.classesTotal+' aulas feitas');if(group)sub.push(d.uids.length+' alunos');
    var tzs=d.uids.map(function(u){var pp=deps.profiles().filter(function(x){return x.id===u;})[0];return pp&&tzTag(pp.tz,ev.start_at);}).filter(Boolean);
    if(tzs.length&&d.uids.length===1)sub.push('\uD83C\uDF0D fuso: '+tzs[0].tz.replace(/_/g,' ')+' ('+tzs[0].diff+')');
    if(sub.length){var sd=el('div','nc-sub',sub.join(' · '));if(tzs.length&&d.uids.length===1){sd.textContent='';sd.appendChild(document.createTextNode(sub.slice(0,-1).join(' · ')+(sub.length>1?' · ':'')));var tb=el('b',null,sub[sub.length-1]);tb.style.color='var(--warn)';sd.appendChild(tb);}hd.appendChild(sd);}
    if(d.crN>0){var cp0=el('div','nc-sub');var cpl=el('span','nc-cr',d.crN+(d.crN===1?' aula a repor':' aulas a repor'));cp0.appendChild(cpl);hd.appendChild(cp0);}
    if(window.BL_FORECAST&&fd.classesTotal){var ms0=(d.prog[d.uids[0]]&&d.prog[d.uids[0]].data&&d.prog[d.uids[0]].data.me&&d.prog[d.uids[0]].data.me.missed)||[],dn=+fd.classesDone||0,
      fr=BL_FORECAST.calc({done:dn,total:+fd.classesTotal,freq:BL_FORECAST.freq(d.futN,d.pastN),lagPar:lg&&!lg.edit?lg.lag:0,missRate:ms0.length/Math.max(1,dn+ms0.length)});
      if(fr)hd.appendChild(el('div','nc-sub nc-fc',BL_FORECAST.fmt(fr,'pt','Stage '+(((d.prog[d.uids[0]]||{}).stage)||'?'))));}
    top.appendChild(hd);top.appendChild(el('span','sp'));
    function beep(){try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC||document.hidden||document.documentElement.classList.contains('fx-off'))return;var c=new AC(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.25,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.28);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.3);setTimeout(function(){try{c.close();}catch(e){}},600);}catch(e){}}
    /* cronometro: antes da aula conta o que falta; ao comecar, conta o tempo de aula (50 min) e depois o tempo extra */
    if(!opts.past){var tm=el('span','nc-tm'),tml=el('small'),tmb=el('b'),CLS=50*6e4;tm.setAttribute('role','timer');tm.appendChild(tml);tm.appendChild(tmb);top.appendChild(tm);
      var f2=function(n){return n<10?'0'+n:''+n;},fm=function(ms){var t=Math.floor(Math.abs(ms)/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),sc=t%60;return h>0?h+':'+f2(m)+':'+f2(sc):f2(m)+':'+f2(sc);};
      var tmi=null,tick=function(){if(!tm.isConnected){clearInterval(tmi);return;}var ms=start-Date.now(),el0=-ms;
        if(ms>24*36e5||el0>3*36e5){tm.style.display='none';return;}tm.style.display='';
        if(ms>0){var al=ms<=18e4;tm.className='nc-tm'+(al?' alarm':'');tml.textContent='Começa em';tmb.textContent=fm(ms);if(al&&!tm._beeped){tm._beeped=1;beep();}}
        else if(el0<=CLS){tm.className='nc-tm run';tml.textContent='Em aula';tmb.textContent=fm(el0)+' / 50:00';}
        else{tm.className='nc-tm extra';tml.textContent='Tempo extra';tmb.textContent='+'+fm(el0-CLS);}};
      tick();tmi=setInterval(tick,1000);}
    if(sid){var sa=el('a','nc-btn','Abrir planilha');sa.href='https://docs.google.com/spreadsheets/d/'+sid+'/edit'+(gid?'#gid='+gid:'');sa.target='_blank';sa.rel='noopener';top.appendChild(sa);}
    /* botao de 2 etapas: envia o convite da Revision (WhatsApp) -> entra -> (10 min de aula) envia o do New Work -> entra */
    var isMeet=/meet\.google\.com/.test(String(meet||'')),zRev=zoomApp(ZOOM_REV),zNw=zoomApp(ZOOM_NW),za=el('a','nc-btn go',''),cb=el('a','nc-btn ic'),skey='blnc:'+d.key+':'+ev.start_at,stt={s:0,t:0};
    try{stt=JSON.parse(localStorage.getItem(skey)||'')||stt;}catch(e){stt={s:0,t:0};}
    if(stt.s===0&&d.sentRev&&d.sentRev.status==='sent'){stt.s=1;try{localStorage.setItem(skey,JSON.stringify(stt));}catch(e){}}
    function saveSt(){try{localStorage.setItem(skey,JSON.stringify(stt));}catch(e){}}
    var IW='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4L3 21z"/><path d="M9.2 9.2c.3 2 2.6 4.4 5.2 5.3l1.3-1.3-1.8-1-.9.7c-.8-.4-1.5-1.1-1.9-1.9l.7-.9-1-1.8-1.6 1.2z"/></svg>',
        IC='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
    function setLab(t,wa){za.innerHTML=(wa?IW+' ':'')+'<span></span>';za.lastChild.textContent=t;}
    function lab2(){if(!isMeet&&stt.s===2&&Date.now()-start>=10*6e4){stt.s=3;saveSt();}
      var sd=stt.s===0||stt.s===3;
      if(isMeet)setLab(stt.s===0?'Enviar link da aula':'Entrar na aula',stt.s===0);
      else setLab(['Enviar 1º link (REV)','Entrar Revision','Entrar Revision','Enviar 2º link (NW)','Entrar New Work'][stt.s]||'Enviar 1º link (REV)',sd);
      cb.style.display='';}
    cb.innerHTML=IC;cb.href='#';cb.setAttribute('role','button');cb.setAttribute('aria-label','Copiar texto do convite');cb.title='Copiar texto do convite';
    za.href='#';za.setAttribute('role','button');lab2();
    var tk=setInterval(function(){if(!za.isConnected){clearInterval(tk);return;}lab2();},20000);
    var pc0=deps.profiles().filter(function(x){return x.id===d.uids[0];})[0],ES=(pc0&&pc0.course)==='es',
        STG=+(first&&first.stage)||((/(?:stage|stg|etapa)\s*(\d+)/i.exec((d.links[d.uids[0]]||{}).sheet_name||'')||[])[1]|0),
        EVK=d.key+'|'+new Date(ev.start_at).toISOString();
    function firstNames(u){return String(name(u)).trim().split(/\s+/)[0];}
    function bdToday(u){var p=deps.profiles().filter(function(x){return x.id===u;})[0],b=String((p&&p.birthdate)||'');if(!/^\d{4}-\d\d-\d\d$/.test(b))return false;
      var t;try{t=new Intl.DateTimeFormat('en-CA',{timeZone:(p&&p.tz)||TZ}).format(new Date());}catch(e){t=new Date().toISOString().slice(0,10);}return t.slice(5,10)===b.slice(5,10);}
    function invite(kind){
      var ms=((d.prog[d.uids[0]]||{}).data||{}).me;ms=ms&&ms.missed;
      return BL_INVITE.build({es:ES,tz:(pc0&&pc0.tz)||TZ,now:new Date(),names:d.uids.map(firstNames),bdays:d.uids.filter(bdToday).map(firstNames),
        streak:group||!STK?0:(STK[String((pc0&&pc0.email)||'').toLowerCase()]||0),classNumber:nx&&nx.classNumber,kind:kind,contents:nx&&nx.contents,
        conversation:nx&&nx.conversation,review:nx&&nx.review,newWords:nx&&nx.newWords,stage:STG,missedN:!group&&ms&&ms.length?(ms[0].classNumber||''):'',
        isMeet:isMeet,link:meet,last:d.inv||{},uid0:d.uids[0]});}
    /* guarda no banco as versoes sorteadas (a automacao nao repete) e que este convite ja saiu */
    function commit(kind,r){var rows=Object.keys(r.picks).map(function(k){d.inv=d.inv||{};d.inv[k]=r.picks[k];return {vkey:k,idx:r.picks[k],updated_at:new Date().toISOString()};});
      try{if(rows.length)Promise.resolve(deps.sb.from('invite_state').upsert(rows)).then(function(){},function(){});
        Promise.resolve(deps.sb.from('invite_sent').upsert({event_key:EVK,kind:kind,via:'app',status:'sent',text_sent:r.text,sent_at:new Date().toISOString()})).then(function(){},function(){});}catch(e){}}
    function copyTxt(t){
      if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
      return new Promise(function(ok,no){try{var ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();var r=document.execCommand('copy');ta.remove();r?ok():no();}catch(e){no(e);}});}
    function toast(msg){var o=document.querySelector('.nc-toast');if(o)o.remove();
      var t=el('div','nc-toast'),ic=el('span','nc-toast-ic');ic.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
      t.setAttribute('role','status');t.appendChild(ic);t.appendChild(el('span',null,msg||'Convite copiado para a área de transferência'));document.body.appendChild(t);
      t.addEventListener('click',function(){t.remove();});setTimeout(function(){t.classList.add('out');setTimeout(function(){t.remove();},300);},4000);}
    function launch(u){var h=document.createElement('a');h.href=u;h.style.display='none';document.body.appendChild(h);h.click();setTimeout(function(){h.remove();},500);}
    function advance(){stt.s=isMeet?1:stt.s===0?1:4;saveSt();lab2();}
    cb.addEventListener('click',function(e){e.preventDefault();var k=stt.s<3?'rev':'nw',first1=stt.s===0||stt.s===3;/* nos passos 0 e 3 o convite conta como enviado; nos demais so copia de novo */
      var r=invite(k);copyTxt(r.text).then(function(){if(first1){commit(k,r);advance();}toast();},function(){if(window.BL_DLG)BL_DLG.alert('Não consegui copiar o convite. Tente de novo.',{title:'Não copiou'});});});
    za.addEventListener('click',function(e){e.preventDefault();
      if(isMeet&&stt.s===1){screens().then(function(sc){if(sc){try{openRevision(sc);}catch(x){}}window.open(meet,'_blank','noopener');});return;}
      if(stt.s===0||stt.s===3){var kk=stt.s===0?'rev':'nw',r=invite(kk),go=function(){copyTxt(r.text).then(function(){commit(kk,r);advance();toast();},function(){if(window.BL_DLG)BL_DLG.alert('Não consegui copiar o convite. Tente de novo.',{title:'Não copiou'});});};
        if(kk==='rev'&&d.sentRev&&d.sentRev.status==='queued'&&window.BL_DLG&&BL_DLG.confirm){BL_DLG.confirm('O envio automático deste convite está programado. Se você enviar agora, o automático será cancelado. Enviar mesmo assim?',{title:'Envio automático programado',ok:'Enviar agora',cancel:'Deixar o automático'}).then(function(y){if(y)go();});return;}
        go();return;}
      if(stt.s===4){launch(zNw);return;}
      /* entrar na Revision: abre o livro de revisão no monitor principal e o Zoom pelo app */
      if(stt.s===1){stt.s=2;stt.t=Date.now();saveSt();lab2();}
      screens().then(function(sc){
        if(sc){try{openRevision(sc);}catch(x){}launch(zRev);}
        else{launch(zRev);if(window.BL_DLG)BL_DLG.alert('Não consegui posicionar o livro no monitor principal (o acesso à posição das janelas foi negado ou o navegador não oferece). Abri só o Zoom. Para o livro abrir sozinho no monitor principal, permita "Gerenciar janelas" quando o navegador perguntar.',{title:'Só o Zoom foi aberto'});}
      });
    });
    /* revisao do dia em outra aba: 3a edicao = Lessons do app (parágrafo); 2a edicao = livro do professor (PDF privado) na página */
    /* janela da revisão: metade esquerda da tela onde o painel está aberto (o Zoom fica na direita) */
    function revWin(url,ts){
      if(ts){/* monitor principal, no tamanho que a janela do livro já tinha (o navegador lembra); sem forçar tela cheia */
        return window.open(url,'blrev','popup=yes,left='+(ts.availLeft+40)+',top='+(ts.availTop+40));}
      var sc=window.screen||{},L=sc.availLeft||0,T=sc.availTop||0,W=Math.floor((sc.availWidth||1280)/2),H=sc.availHeight||800;
      return window.open(url,'blrev','popup=yes,left='+L+',top='+T+',width='+W+',height='+H);}
    function openRevision(ts){
      var rv=nx&&nx.review,sh=ln&&ln.sheet_name;if(!sh)return;
      var rl=null;
      if(!rv||rv.from==null){/* sem revisao por paragrafo: tenta "REV a-b" do conteudo (licoes) */
        var mm=/\bREV\s+(\d+)\s*-\s*(\d+)/i.exec(String((nx&&(nx.contents||nx.activity))||''));if(!mm||/2nd/i.test(sh))return;rl=mm[1]+'-'+mm[2];rv={from:0,to:0};}
      var pc0=deps.profiles().filter(function(x){return x.id===d.uids[0];})[0],crs=(pc0&&pc0.course)==='es'?'es':'en',sm=/(?:stage|stg|etapa)\s*(\d+)/i.exec(sh),stg=+(fd.stage||(sm?sm[1]:0)),from=+rv.from,to=rv.to!=null?+rv.to:from,
          who=String(name(d.uids[0])).trim().split(/\s+/)[0],enc=encodeURIComponent,w=cp.lastWord||(first&&first.last_word)||'',par=cp.paragraph||cp.lastNewWord||'';
      if(!/2nd/i.test(sh)){
        revWin((crs==='es'?'espanol/':'')+'lessons.html?stage='+stg+(rl?'&rl='+rl:'&rv='+from+'-'+to)+'&w='+enc(w)+'&p='+enc(par)+'&who='+enc(who)+'&n='+enc(nx.classNumber||''),ts);return;}
      var T=window.BL_TBOOK,file=T&&T.file(stg,crs),page=T&&T.pageFor(stg,from,crs);
      var win=revWin('about:blank',ts);if(!win)return;
      var say=function(t){try{win.document.body.style.cssText='font:16px system-ui;padding:24px;background:#0b1733;color:#f3f4f6';win.document.body.textContent=t;}catch(e){}};
      if(!file){say('O livro do professor da '+(crs==='es'?'Etapa ':'Stage ')+stg+(crs==='es'?'':' (2ª edição)')+' ainda não está disponível no app.');return;}
      say('Abrindo o livro do professor, p. '+page+'…');
      deps.sb.storage.from('teacher-books').createSignedUrl(file,3600).then(function(r){
        if(r&&r.data&&r.data.signedUrl){win.location.href=r.data.signedUrl+'#page='+page;}
        else say('O livro da '+(crs==='es'?'Etapa ':'Stage ')+stg+' ainda não foi enviado. Painel → Conteúdo → Livros do professor'+(crs==='es'?'.':' (2ª edição).'));
      },function(){say('Não consegui abrir o livro do professor agora.');});
    }top.appendChild(cb);top.appendChild(za);wrap.appendChild(top);
    /* three boxes */
    var g3=el('div','nc-grid'),b1=el('div','nc-box c-blue'),b2=el('div','nc-box'),b3=el('div','nc-box today c-gold');
    add(b1,el('div','nc-k','Revisão de hoje'));
    if(nx&&nx.review&&nx.review.from!=null){add(b1,el('div','nc-v',pf(nx.review)),el('div','nc-m',pw(nx.review)));if(nx.adj)add(b1,el('div','nc-m',(nx.ahead?'Adiante do plano · ajustada':'Atrás do plano · ajustada')+' pela última palavra registrada (par. '+cp.paragraph+')'));if(!nx.adj&&!(Number(cp.paragraph)>0)&&nx.review&&!opts.past)add(b1,el('div','nc-m','Atenção: última palavra ainda não registrada: mostrando o Contents da planilha'));}else add(b1,el('div','nc-m','Sem revisão indicada na planilha'));
    d.uids.forEach(function(u){var pd=(d.prog[u]||{}).data||{},ms=(pd.me&&pd.me.missed)||[];ms.forEach(function(m){var t='Reposição'+(m.classNumber?' da aula '+m.classNumber:'')+(group?' · '+name(u):'')+(m.review&&m.review.from!=null?' · '+pf(m.review):'');b1.appendChild(el('span','nc-pill warn',t));});});
    add(b2,el('div','nc-k',group?'Onde a turma parou':'Onde parou'));
    /* semaforo: em dia = verde; 1 a 3 par. atras = amarelo; 4 ou mais = vermelho; adiantado = azul (lag vem de BL_INVITE.adjust) */
    if(nx&&typeof nx.lag==='number'&&!opts.past){var LG=nx.lag;b2.className+=' '+(LG<0?'c-blue':LG===0?'c-ok':LG<=3?'c-warn':'c-bad');b2.firstChild.textContent+=' · '+(LG<0?'adiantado':LG===0?'em dia':LG+' atrás');}
    var lw=cp.lastWord||(first&&first.last_word),pn=cp.paragraph||cp.lastNewWord;
    if(lw||cp.lesson){add(b2,el('div','nc-v',(cp.lesson?'Lição '+cp.lesson:'')+(pn?' · par. '+pn:'')),el('div','nc-m',lw?'Última palavra: '+lw:''));}else add(b2,el('div','nc-m','Sem leitura da planilha ainda'));
    if(cp.classNumber)b2.appendChild(el('div','nc-m','Aula nº '+cp.classNumber));
    /* registro da aula: grava na planilha (Apps Script via sheet-push) */
    (function(){var sh=ln&&ln.sheet_name;if(!sh||!nx||!nx.classNumber||opts.past||window.BL_CLOSE)return;
      var ct=String(nx.contents||''),isExam=/OFFICIAL.*EXAM/i.test(ct),isMock=/MOCK\s*EXAM/i.test(ct),isRev=!isExam&&!isMock&&/FULL\s*REVISION|REVIS/i.test(ct);
      var sm=/(?:stage|stg)\s*(\d+)/i.exec(sh),stg=+(first&&first.stage)||(sm?+sm[1]:0);
      var f=el('div','nc-reg'),ip=el('input'),iw=el('input'),stSel=null,auto=true;
      ip.type='text';ip.inputMode='numeric';ip.setAttribute('aria-label','Parágrafo');ip.style.width='84px';ip.value=cp.paragraph||cp.lastNewWord||'';
      iw.type='text';iw.value=lw||'';iw.setAttribute('aria-label','Última palavra ensinada');iw.style.flex='1 1 150px';iw.style.minWidth='150px';
      if(!isExam){var r1=el('div','nc-rw');
        if(isRev&&stg){stSel=document.createElement('select');stSel.setAttribute('aria-label','Stage revisto');var ss=stg%2===0?[stg-1,stg]:[stg];ss.forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent='Stage '+n;stSel.appendChild(o);});stSel.value=stg;r1.appendChild(el('span','nc-m','Revisão'));r1.appendChild(stSel);}
        add(r1,el('span','nc-m','Parágrafo'),ip,el('span','nc-m','Palavra'),iw);f.appendChild(r1);
        var chips=el('div','nc-rw');f.appendChild(chips);
        var ed=/3rd/i.test(sh)?'e3':'e2',tgt=+(cp.paragraph||cp.lastNewWord)||0;
        function norm(x){return String(x).trim().toLowerCase().replace(/\u2019/g,"'");}
        function suggest(){chips.textContent='';var v=norm(iw.value);if(!v||!stg)return;
          loadIdx(function(X){var m=X&&X[ed]&&X[ed][String(stg)];if(!m)return;var c=m[v];
            if(!c){var k=Object.keys(m).filter(function(w){return w.indexOf(v)===0||(' '+w).indexOf(' '+v)>=0;}).slice(0,3);if(k.length===1)c=m[k[0]];}
            if(!c||!c.length){chips.appendChild(el('span','nc-m','Palavra não achada no índice do Stage '+stg+' ('+(ed==='e3'?'3ª':'2ª')+' edição): digite o parágrafo.'));return;}
            var best=c.slice().sort(function(a,b){return Math.abs(a-tgt)-Math.abs(b-tgt);})[0];
            if(auto||!ip.value){ip.value=best;auto=true;}
            if(c.length>1){chips.appendChild(el('span','nc-m','Parágrafo provável:'));c.slice(0,5).forEach(function(n){var b=el('button','nc-chip'+(String(n)===ip.value?' on':''),String(n));b.type='button';b.addEventListener('click',function(){ip.value=n;auto=true;suggest2(c);});chips.appendChild(b);});}
          });}
        function suggest2(c){Array.prototype.forEach.call(chips.querySelectorAll('.nc-chip'),function(b){b.classList.toggle('on',b.textContent===ip.value);});}
        var tm=null;iw.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(suggest,250);});
        ip.addEventListener('input',function(){auto=false;});}
      var opt=el('div','nc-rw');
      function ck(txt,on){var l=el('label','nc-ck'),c=document.createElement('input');c.type='checkbox';c.checked=on;l.appendChild(c);l.appendChild(document.createTextNode(' '+txt));opt.appendChild(l);return c;}
      var cR=nx.hasReading&&nx.reading?ck('Leitura '+nx.reading+' dada',false):null,cD=nx.hasDictation&&nx.dictation?ck('Ditado '+nx.dictation+' dado',false):null;
      var cI=isExam?null:ck('Não deu tempo de terminar (adicionar nova linha)',!!(nx&&nx.adj&&!nx.planOk)),cF=isRev?ck('Terminei a revisão do Stage (liberar a prova)',false):null,cC=ck('Marcar como Completed',true),cV=isExam?null:ck('Aula de conversação (conta como dada)',false),th=el('input');th.type='text';th.placeholder='Tema da conversação';th.setAttribute('aria-label','Tema da conversação');th.style.cssText='display:none;flex:1;min-width:160px';opt.appendChild(th);
      if(cV)cV.addEventListener('change',function(){th.style.display=cV.checked?'':'none';ip.disabled=iw.disabled=cV.checked;});
      f.appendChild(opt);
      var go=el('button','nc-btn go','Salvar e enviar para a planilha'),msg=el('div','nc-m','Grava na linha da aula nº '+nx.classNumber+' da aba "'+sh+'"'+(isMock?' · a prova do Stage '+stg+' será liberada':''));go.type='button';
      go.addEventListener('click',function(){
        var att={},late={},nsAll=d.uids.length===1&&d.att[d.uids[0]]&&d.att[d.uids[0]].status==='ns';
        d.uids.forEach(function(u){var a=d.att[u],fn=String(name(u)).trim().split(/\s+/)[0];if(a&&a.status){att[fn]=a.status!=='ns';if(a.status==='late')late[fn]=a.late_min||10;}});
        var pl={sheetName:sh,lesson:nx.classNumber,date:new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(start)};
        if(Object.keys(att).length)pl.attendance=att;if(Object.keys(late).length)pl.late=late;
        if(nsAll){pl.paragraph='NS';pl.lastWord='NO SHOW';pl.insert=true;}
        else if(!isExam){var pv=ip.value.trim();if(pv)pl.paragraph=(isRev&&stSel?'S'+stSel.value+' / ':'')+pv;if(iw.value.trim())pl.lastWord=iw.value.trim();if(cI&&cI.checked)pl.insert=true;}
        if(cR&&cR.checked)pl.readingGiven=true;if(cD&&cD.checked)pl.dictationGiven=true;if(pl.readingGiven||pl.dictationGiven)pl.done=true;
        if(cV&&cV.checked&&!nsAll){pl.conversation=true;pl.theme=th.value.trim();pl.insert=true;pl.paragraph='E';pl.lastWord='CONVERSATION';delete pl.readingGiven;delete pl.dictationGiven;delete pl.done;pl.status='Completed';}
        else if(cC.checked)pl.status='Completed';
        go.disabled=true;msg.textContent='Enviando…';
        deps.sb.functions.invoke('sheet-push',{body:pl}).then(function(r){go.disabled=false;var q=r&&r.data;
          if(q&&q.ok){msg.textContent='Enviado para a planilha ✓ '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+(q.inserted?' · nova linha adicionada':'');
            if(stg&&(isMock||(isRev&&cF&&cF.checked))){var rows=d.uids.map(function(u){return {user_id:u,stage:stg};});
              deps.sb.from('exam_release').upsert(rows,{onConflict:'user_id,stage',ignoreDuplicates:true}).then(function(x){msg.textContent+=x&&x.error?' · não consegui liberar a prova ('+x.error.message+')':' · prova do Stage '+stg+' liberada';});}
            return;}
          var e=q&&q.error,m={aba_nao_encontrada:'a aba não foi encontrada na planilha',licao_nao_encontrada:'a aula não foi achada na coluna Lesson',forbidden:'senha do script não confere',not_configured:'planilha não configurada'};
          msg.textContent='Não foi possível enviar'+(e?' ('+(m[e]||e)+')':'')+'.';},function(){go.disabled=false;msg.textContent='Sem conexão.';});});
      f.appendChild(go);f.appendChild(msg);b2.appendChild(f);})();
    add(b3,el('div','nc-k','Hoje será ensinado'));
    if(nx){var lm=/LESSON\s*(\d+)/i.exec(nx.contents||''),tl=[];if(lm)tl.push('Lição '+lm[1]);if(nx.newWords&&nx.newWords.from!=null)tl.push(pf(nx.newWords));
      var nw=nx.newWords||{};add(b3,el('div','nc-v',tl.join(' · ')||(nx.contents||'—')));if(nw.from!=null){if(nw.fromWord)b3.appendChild(el('div','nc-m','Primeira palavra: '+nw.fromWord+' (par. '+nw.from+')'));b3.appendChild(el('div','nc-m','Última palavra: '+(nw.toWord||'—')+' (par. '+nw.to+')'));
        var cnt=Number(nw.to)-Number(nw.from)+1,nt=cnt+(cnt===1?' parágrafo':' parágrafos');if(nx.lag>0&&nx.planTo){var rem=nx.planTo-Number(nw.to);nt+=rem>0?' · ainda '+rem+' atrás do plano':' · volta ao plano';}b3.appendChild(el('div','nc-m',nt));}
      var ex=[];if(nx.hasReading)ex.push('Leitura');if(nx.hasDictation)ex.push('Ditado');if(nx.hasQuiz)ex.push('Quiz');if(nx.lessonCheck)ex.push('Lesson Check');if(nx.conversation)ex.push('Conversation');if(nx.activity)ex.push(nx.activity);
      if(ex.length)b3.appendChild(el('div','nc-m','+ '+ex.join(' · ')));}else add(b3,el('div','nc-m','Sem próxima aula indicada na planilha'));
    add(g3,b1,b2,b3);wrap.appendChild(g3);
    var sgBox=el('div','nc-box');wrap.appendChild(sgBox);if(window.ClassDayAdmin&&nx&&nx.newWords&&nx.newWords.from!=null)ClassDayAdmin.panel(sgBox,{sb:deps.sb,from:nx.newWords.from,to:nx.newWords.to||nx.newWords.from});else sgBox.remove();
    /* per-student table */
    var tb=el('div'),h=el('div','nc-st h');['Aluno','Estudou desde a última aula','Dificuldades (21 dias)','Presença hoje'].forEach(function(x){h.appendChild(el('span','nc-k',x));});tb.appendChild(h);
    var rowEls={};var errsBy={},reinf={};d.uids.forEach(function(u){errsBy[u]={};});
    d.errs.forEach(function(e){var k=diffKey(e);if(!k||!errsBy[e.user_id])return;errsBy[e.user_id][k]=(errsBy[e.user_id][k]||0)+1;var rk=(e.kind||'ex')+'|'+e.lesson;(reinf[rk]=reinf[rk]||{kind:e.kind||'ex',lesson:e.lesson,n:0,who:{}});reinf[rk].n++;reinf[rk].who[e.user_id]=(reinf[rk].who[e.user_id]||0)+1;});
    var saveMsg=el('span','nc-msg','');
    function save(u,status,late,btns){var row={event_key:d.key,user_id:u,status:status,late_min:status==='late'?late:null,class_start:ev.start_at,updated_at:new Date().toISOString()};saveMsg.textContent='Salvando…';
      deps.sb.from('class_attendance').upsert(row).then(function(r){if(r&&r.error){saveMsg.textContent='Não foi possível salvar a presença ('+(r.error.message||'erro')+').';return;}d.att[u]=row;btns();saveMsg.textContent='Presença salva ✓';},function(){saveMsg.textContent='Sem conexão.';});}
    d.uids.forEach(function(u){
      var row=el('div','nc-st'),since=d.prev[u]?new Date(d.prev[u]).getTime():0,si=studyInfo(u,since,deps.att()),pr=d.prog[u]||{},pd=pr.data||{};
      var c1=el('span');add(c1,el('b',null,name(u)));var ms=(pd.me&&pd.me.missed)||[];if(ms.length)c1.appendChild(el('span','nc-pill bad','faltou aula '+(ms[0].classNumber||'')));
      var idle=si.last?Math.floor((Date.now()-si.last)/864e5):999;if(idle>=5)c1.appendChild(el('span','nc-pill warn',idle>=999?'ainda não estudou':idle+' dias sem estudar'));
      var c2=el('span'),n=si.n,tt=[];if(n.ex)tt.push('Exercises '+n.ex);if(n.check)tt.push('Check '+n.check);if(n.wb)tt.push('Workbook '+n.wb);
      c2.textContent=tt.length?tt.join(' · '):'nada desde a última aula';if(!tt.length)c2.className='nc-m';
      var c3=el('span'),eb=errsBy[u],ks=Object.keys(eb).sort(function(a,b){return eb[b]-eb[a];}).slice(0,3);
      if(ks.length)ks.forEach(function(k){c3.appendChild(el('span','nc-pill '+(eb[k]>=3?'bad':'warn'),k+' · '+eb[k]));});else{c3.textContent='sem erros relevantes';c3.className='nc-m';}
      var c4=el('span','nc-tg'),bs={};
      var mins=el('input');mins.type='number';mins.min='1';mins.max='90';mins.value=(d.att[u]&&d.att[u].late_min)||10;mins.setAttribute('aria-label','Minutos de atraso');mins.hidden=true;
      var paint=function(){var s=d.att[u]&&d.att[u].status;bs.came.classList.toggle('on',s==='came');bs.late.classList.toggle('on',s==='late');bs.ns.classList.toggle('on',s==='ns');mins.hidden=s!=='late';};
      [['came','✔ Veio',''],['late','⏱ Atrasou','late'],['ns','NS · faltou','ns']].forEach(function(x){var b=el('button',x[2],x[1]);b.type='button';b.addEventListener('click',function(){save(u,x[0],+mins.value||10,paint);});bs[x[0]]=b;c4.appendChild(b);});
      mins.addEventListener('change',function(){if(d.att[u]&&d.att[u].status==='late')save(u,'late',+mins.value||10,paint);});c4.appendChild(mins);c4._paint=paint;row._paint=paint;
      add(row,c1,c2,c3,c4);tb.appendChild(row);rowEls[u]=row;paint();});
    wrap.appendChild(tb);if(window.ClassDayAdmin)ClassDayAdmin.rates(rowEls,{sb:deps.sb,uids:d.uids,name:name});
    /* reinforcement */
    var rs=Object.keys(reinf).map(function(k){return reinf[k];}).sort(function(a,b){return b.n-a.n;}).slice(0,4);
    var sel={},rw=el('div'),rmsg=el('span','nc-msg','');
    add(rw,el('div','nc-k','Reforço gramatical · toque para escolher e envie como lembrete'));
    var page={ex:['exercises.html','Exercises'],check:['check.html','Check'],wb:['workbook.html','Workbook']};
    if(!rs.length)rw.appendChild(el('div','nc-m','Sem erros recentes para sugerir reforço.'));
    var chips=el('div');rs.forEach(function(r,i){var pg=page[/^ex/.test(r.kind)?'ex':/check/.test(r.kind)?'check':'wb']||page.ex,who=Object.keys(r.who),lab=pg[1]+' · Lição '+r.lesson+' ('+r.n+' erros'+(group?' · '+who.map(name).join(', '):'')+')';
      var c=el('button','nc-chip',lab);c.type='button';c.addEventListener('click',function(){sel[i]=!sel[i];c.classList.toggle('on',!!sel[i]);});chips.appendChild(c);});
    rw.appendChild(chips);wrap.appendChild(rw);
    var ft=el('div','nc-foot'),send=el('button','',"Enviar reforço aos alunos");send.type='button';
    send.addEventListener('click',function(){var pick=rs.filter(function(r,i){return sel[i];});if(!pick.length){rmsg.textContent='Escolha pelo menos um exercício.';return;}
      send.disabled=true;rmsg.textContent='Enviando…';var jobs=[];
      pick.forEach(function(r){var pg=page[/^ex/.test(r.kind)?'ex':/check/.test(r.kind)?'check':'wb']||page.ex;Object.keys(r.who).forEach(function(u){jobs.push(deps.sb.rpc('teacher_msg',{p_user:u,p_body:'Reforço para a próxima aula: refaça os '+pg[1]+' da Lição '+r.lesson+'.',p_url:pg[0]+'?lesson='+r.lesson}));});});
      Promise.all(jobs).then(function(rr){var bad=rr.filter(function(x){return x&&x.error;});send.disabled=false;rmsg.textContent=bad.length?'Não foi possível enviar ('+(bad[0].error.message||'erro')+').':'Enviado ✓ ('+jobs.length+' lembrete'+(jobs.length>1?'s':'')+')';},function(){send.disabled=false;rmsg.textContent='Sem conexão.';});});
    var all=el('button','ghost','Marcar todos: ✔ Veio');all.type='button';all.addEventListener('click',function(){var rows=[];d.uids.forEach(function(u){rows.push({event_key:d.key,user_id:u,status:'came',late_min:null,class_start:ev.start_at,updated_at:new Date().toISOString()});});
      saveMsg.textContent='Salvando…';deps.sb.from('class_attendance').upsert(rows).then(function(r){if(r&&r.error){saveMsg.textContent='Não foi possível salvar a presença.';return;}rows.forEach(function(x){d.att[x.user_id]=x;});tb.querySelectorAll('.nc-st').forEach(function(rw2){if(rw2._paint)rw2._paint();});saveMsg.textContent='Presença salva ✓';});});
    add(ft,send,rmsg,el('span','sp'),saveMsg,group||d.uids.length>1?all:null);wrap.appendChild(ft);
    if(window.BL_CLOSE&&!opts.past){var ch=el('div');wrap.appendChild(ch);window.BL_CLOSE.render(ch,{course:(function(){var q=deps.profiles().filter(function(x){return x.id===d.uids[0];})[0];return q&&q.course==='es'?'es':'en';})(),sb:deps.sb,ev:ev,key:d.key,uids:d.uids,prog:d.prog,att:d.att,name:name});}
  }).catch(function(e){wrap.textContent='';wrap.appendChild(el('div','nc-sub','Não foi possível carregar os detalhes da aula.'));});
}
function summaries(sb,evs,students){
  var ok={};(students||[]).forEach(function(x){ok[x.id]=1;});var uids=[],keys=[];
  evs.forEach(function(x){keys.push(x.k);x.ids.forEach(function(u){if(ok[u]&&uids.indexOf(u)<0)uids.push(u);});});
  var out={cfg:{},prog:{},links:{},att:{},attempts:[]};if(!uids.length&&!keys.length)return Promise.resolve(out);
  var P=function(q){return Promise.resolve(q).then(function(x){return x&&!x.error?x.data||[]:[];},function(){return [];});};
  return Promise.all([
    P(sb.from('plan_progress').select('user_id,stage,lesson,class_number,last_word,data').in('user_id',uids)),
    P(sb.from('plan_links').select('user_id,sheet_name').in('user_id',uids)),
    P(sb.from('class_attendance').select('event_key,user_id,status,late_min').in('event_key',keys)),
    P(sb.from('attempts').select('user_id,kind,lesson,ex,created_at').in('user_id',uids).order('created_at',{ascending:false}).limit(500)),
    P(sb.from('teacher_cfg').select('key,value').in('key',['plans_sheet','plans_gids']))
  ]).then(function(a){a[0].forEach(function(x){out.prog[x.user_id]=x;});a[1].forEach(function(x){out.links[x.user_id]=x.sheet_name;});
    a[2].forEach(function(x){(out.att[x.event_key]=out.att[x.event_key]||{})[x.user_id]=x;});out.attempts=a[3];
    a[4].forEach(function(x){out.cfg[x.key]=x.value;});out.sid=out.cfg.plans_sheet&&out.cfg.plans_sheet.id;out.gids=out.cfg.plans_gids||{};return out;});
}
function sheetUrl(S,uid){if(!S||!S.sid)return null;var g=S.gids[S.links[uid]];return 'https://docs.google.com/spreadsheets/d/'+S.sid+'/edit'+(g?'#gid='+g:'');}
W.NextClass={tzTag:tzTag,lag:lagOf,render:render,css:css,summaries:summaries,sheetUrl:sheetUrl,zoom:ZOOM,pf:pf,pw:pw};
})(window);
