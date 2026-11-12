/* Teacher panel · "Próxima aula" card: review, where they stopped, what is taught today, difficulties, reinforcement, attendance. */
(function(W){
'use strict';
var D=document,ZOOM='https://us06web.zoom.us/j/2447679341',TZ='America/Sao_Paulo',CACHE={};
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
'.nc .nc-tg input{width:58px;min-height:34px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);padding:0 6px}'+
'.nc .nc-chip{display:inline-block;border:2px solid var(--line);border-radius:12px;padding:6px 12px;margin:3px 6px 3px 0;background:var(--surface);color:var(--ink);font-weight:700;font-size:.86rem;min-height:0}.nc .nc-chip.on{border-color:var(--accent);background:var(--card)}'+
'.nc .nc-foot{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px}.nc .nc-foot .sp{flex:1}.nc .nc-msg{color:var(--muted);font-size:.84rem}'+
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
      sb.from('teacher_cfg').select('key,value').in('key',['plans_sheet','plans_gids'])
    ].map(function(q){return Promise.resolve(q).then(function(x){return x&&!x.error?x.data||[]:[];},function(){return [];});})).then(function(a){
      a[0].forEach(function(x){out.prog[x.user_id]=x;});a[1].forEach(function(x){out.links[x.user_id]=x;});out.errs=a[2];
      a[3].forEach(function(x){out.att[x.user_id]=x;});a[4].forEach(function(x){if(!out.prev[x.user_id])out.prev[x.user_id]=x.start_at;});
      var c={};a[5].forEach(function(x){c[x.key]=x.value;});out.cfg=c;return out;});
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
function render(box,ev,deps,opts){opts=opts||{};
  css();box.textContent='';var wrap=el('div','nc');box.appendChild(wrap);
  var name=function(id){var p=deps.profiles().filter(function(x){return x.id===id;})[0];return p?(p.display_name||p.name||p.email):'Aluno';};
  var start=new Date(ev.start_at);
  loadData(deps.sb,ev,deps).then(function(d){
    if(!d.uids||!d.uids.length){var t=el('div','nc-top');add(t,el('div','nc-who',ev.title||'Aula'));wrap.appendChild(t);wrap.appendChild(el('div','nc-sub','Esta aula ainda não está ligada a nenhum aluno. Escolha o aluno na Agenda.'));return;}
    var group=d.uids.length>1||d.rows.some(function(r){return r.is_group;}),first=d.prog[d.uids[0]]||null,fd=first&&first.data||{},cp=fd.currentPosition||{},nx=fd.nextClass||null;
    if(group){for(var i=0;i<d.uids.length&&!nx;i++){var q=d.prog[d.uids[i]];if(q&&q.data){nx=q.data.nextClass||null;cp=q.data.currentPosition||cp;}}}
    var meet=(d.rows.filter(function(r){return r.meet_url;})[0]||{}).meet_url||ZOOM;
    var cfg=d.cfg||{},sid=cfg.plans_sheet&&cfg.plans_sheet.id,gids=cfg.plans_gids||{},ln=d.links[d.uids[0]],gid=ln&&gids[ln.sheet_name];
    var lg=lagOf({currentPosition:cp,nextClass:nx});
    if(lg&&!opts.past){var ab=el('div','nc-atr');ab.appendChild(el('b',null,'\u26A0 '+(lg.edit?'Registro e plano em edições diferentes?':lg.lag+' parágrafos atrás do plano')));
      ab.appendChild(el('span',null,lg.edit?'Registro par. '+lg.reg+', plano par. '+lg.plan+' · confira o nome da aba (2nd ou 3rd)':'Parou no par. '+lg.reg+' · o plano da aula de hoje começa no par. '+lg.plan));wrap.appendChild(ab);}
    /* header */
    var top=el('div','nc-top'),hd=el('div');if(!opts.compact)add(hd,el('div','mu','PRÓXIMA AULA · '+when(start).toUpperCase()),el('div','nc-who',ev.title||'Aula'));
    var sub=[];if(nx&&nx.classNumber)sub.push('aula nº '+nx.classNumber);if(fd.classesDone!=null&&fd.classesTotal)sub.push(fd.classesDone+' de '+fd.classesTotal+' aulas feitas');if(group)sub.push(d.uids.length+' alunos');
    if(sub.length)hd.appendChild(el('div','nc-sub',sub.join(' · ')));
    top.appendChild(hd);top.appendChild(el('span','sp'));
    if(sid){var sa=el('a','nc-btn','Abrir planilha');sa.href='https://docs.google.com/spreadsheets/d/'+sid+'/edit'+(gid?'#gid='+gid:'');sa.target='_blank';sa.rel='noopener';top.appendChild(sa);}
    var za=el('a','nc-btn go','Entrar na aula');za.href=meet;za.target='_blank';za.rel='noopener';top.appendChild(za);wrap.appendChild(top);
    /* three boxes */
    var g3=el('div','nc-grid'),b1=el('div','nc-box'),b2=el('div','nc-box'),b3=el('div','nc-box today');
    add(b1,el('div','nc-k','Revisão de hoje'));
    if(nx&&nx.review&&nx.review.from!=null){add(b1,el('div','nc-v',pf(nx.review)),el('div','nc-m',pw(nx.review)));}else add(b1,el('div','nc-m','Sem revisão indicada na planilha'));
    d.uids.forEach(function(u){var pd=(d.prog[u]||{}).data||{},ms=(pd.me&&pd.me.missed)||[];ms.forEach(function(m){var t='Reposição'+(m.classNumber?' da aula '+m.classNumber:'')+(group?' · '+name(u):'')+(m.review&&m.review.from!=null?' · '+pf(m.review):'');b1.appendChild(el('span','nc-pill warn',t));});});
    add(b2,el('div','nc-k',group?'Onde a turma parou':'Onde parou'));
    var lw=cp.lastWord||(first&&first.last_word),pn=cp.paragraph||cp.lastNewWord;
    if(lw||cp.lesson){add(b2,el('div','nc-v',(cp.lesson?'Lição '+cp.lesson:'')+(pn?' · par. '+pn:'')),el('div','nc-m',lw?'Última palavra: '+lw:''));}else add(b2,el('div','nc-m','Sem leitura da planilha ainda'));
    if(cp.classNumber)b2.appendChild(el('div','nc-m','Aula nº '+cp.classNumber));
    /* registro da aula: grava na planilha (Apps Script via sheet-push) */
    (function(){var sh=ln&&ln.sheet_name;if(!sh||!nx||!nx.classNumber||opts.past)return;
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
      var cI=isExam?null:ck('Não deu tempo de terminar (adicionar nova linha)',false),cF=isRev?ck('Terminei a revisão do Stage (liberar a prova)',false):null,cC=ck('Marcar como Completed',true),cV=isExam?null:ck('Aula de conversação (conta como dada)',false),th=el('input');th.type='text';th.placeholder='Tema da conversação';th.setAttribute('aria-label','Tema da conversação');th.style.cssText='display:none;flex:1;min-width:160px';opt.appendChild(th);
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
      var nw=nx.newWords||{};add(b3,el('div','nc-v',tl.join(' · ')||(nx.contents||'—')));if(nw.from!=null){b3.appendChild(el('div','nc-m','Primeira palavra: '+(nw.fromWord||'—')+' (par. '+nw.from+')'));b3.appendChild(el('div','nc-m','Última palavra: '+(nw.toWord||'—')+' (par. '+nw.to+')'));}
      var ex=[];if(nx.hasReading)ex.push('Leitura');if(nx.hasDictation)ex.push('Ditado');if(nx.hasQuiz)ex.push('Quiz');if(nx.lessonCheck)ex.push('Lesson Check');if(nx.conversation)ex.push('Conversation');if(nx.activity)ex.push(nx.activity);
      if(ex.length)b3.appendChild(el('div','nc-m','+ '+ex.join(' · ')));}else add(b3,el('div','nc-m','Sem próxima aula indicada na planilha'));
    add(g3,b1,b2,b3);wrap.appendChild(g3);
    /* per-student table */
    var tb=el('div'),h=el('div','nc-st h');['Aluno','Estudou desde a última aula','Dificuldades (21 dias)','Presença hoje'].forEach(function(x){h.appendChild(el('span','nc-k',x));});tb.appendChild(h);
    var errsBy={},reinf={};d.uids.forEach(function(u){errsBy[u]={};});
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
      add(row,c1,c2,c3,c4);tb.appendChild(row);paint();});
    wrap.appendChild(tb);
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
W.NextClass={lag:lagOf,render:render,css:css,summaries:summaries,sheetUrl:sheetUrl,zoom:ZOOM,pf:pf,pw:pw};
})(window);
