/* Busca no texto das Lessons: lupa flutuante, busca na lição aberta e busca em todas as lições.
   LSearch.init({out, cur, show, fetchAll, para, stageOf, stages, t, lessonWord, parWord}) ; a página chama LSearch.after() ao fim de cada show(). */
(function(){
'use strict';
var ICON='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
function el(tag,p){var e=document.createElement(tag),k,i,c;p=p||{};for(k in p){if(p[k]===null||p[k]===undefined||p[k]===false)continue;if(k==='class')e.className=p[k];else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),p[k]);else e.setAttribute(k,p[k]===true?'':p[k]);}
  for(i=2;i<arguments.length;i++){c=arguments[i];if(c===null||c===undefined)continue;if(Array.isArray(c))c.forEach(function(x){e.append(x);});else e.append(c);}return e;}
function find(ns,nq,from){var i=from||0,c;while((i=ns.indexOf(nq,i))>=0){c=i?ns.charAt(i-1):' ';if(!/[a-z0-9\u00c0-\u024f]/.test(c))return i;i++;}return -1;}
function norm(s){return String(s).replace(/[’‘]/g,"'").toLowerCase();}
var CSS='.ls-fab[hidden],.ls-sheet[hidden],.ls-res[hidden],.ls-bar[hidden]{display:none!important}.ls-fab{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));width:52px;height:52px;border-radius:50%;border:0;background:var(--accent);color:var(--accent-ink);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer;z-index:40}'
+'.ls-sheet{position:fixed;left:0;right:0;bottom:0;z-index:60;background:var(--surface);color:var(--ink);border-top:2px solid var(--accent);border-radius:14px 14px 0 0;padding:14px max(16px,env(safe-area-inset-right,0px)) calc(14px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));box-shadow:0 -6px 18px rgba(0,0,0,.2)}'
+'.ls-in{display:flex;gap:8px;align-items:center;border:2px solid var(--accent);border-radius:3px;padding:2px 8px 2px 10px;background:var(--bg)}'
+'.ls-in svg{flex:none;color:var(--muted)}.ls-in input{flex:1;min-width:0;min-height:44px;border:0;background:transparent;color:var(--ink);font:inherit;font-size:1.05rem;outline:0}'
+'.ls-x{flex:none;min-width:44px;min-height:44px;border:0;background:transparent;color:var(--ink);font:inherit;font-weight:700;font-size:1.1rem;cursor:pointer}'
+'.ls-row{display:flex;gap:8px;align-items:center;margin:10px 0}.ls-row .ls-cnt{flex:1;font-size:.88rem;color:var(--muted);min-width:0}'
+'.ls-nb{flex:none;min-width:44px;min-height:44px;border:2px solid var(--line);border-radius:3px;background:var(--surface);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}.ls-nb:disabled{opacity:.4}'
+'.ls-big{width:100%;min-height:46px;border:2px solid var(--accent);border-radius:3px;background:var(--accent);color:var(--accent-ink);font:inherit;font-weight:700;cursor:pointer;padding:10px 14px}'
+'.ls-res{position:fixed;inset:0;z-index:70;background:var(--bg);color:var(--ink);overflow:auto;padding:14px max(16px,env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}'
+'.ls-res .in{max-width:760px;margin:0 auto}.ls-top{display:flex;gap:8px;align-items:center;margin:0 0 10px}.ls-top .ls-in{flex:1;min-width:0}'
+'.ls-chips{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 6px;align-items:center}.ls-chip{min-height:36px;border:2px solid var(--line);border-radius:99px;background:var(--surface);color:var(--ink);font:inherit;font-size:.86rem;padding:2px 12px;cursor:pointer}.ls-chip[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}'
+'.ls-sel{min-height:36px;border:2px solid var(--line);border-radius:3px;background:var(--surface);color:var(--ink);font:inherit;font-size:.86rem;padding:2px 8px}'
+'.ls-it{display:block;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;padding:11px 2px;min-height:48px;cursor:pointer}.ls-it small{display:block;color:var(--muted);font-size:.8rem;margin-bottom:2px}.ls-it span{overflow-wrap:anywhere}'
+'.ls-note{color:var(--muted);font-size:.9rem;margin:10px 0}'
+'.ls-bar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;gap:8px;align-items:center;background:var(--band);color:var(--band-ink);padding:8px max(12px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px));border-radius:14px 14px 0 0}'
+'.ls-bar b{flex:1;min-width:0;text-align:center;font-size:.9rem}.ls-bar small{display:block;font-weight:400;color:var(--band-muted);font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+'.ls-bar .ls-nb{background:transparent;color:var(--band-ink);border-color:var(--band-muted)}.ls-bar .ls-nb.t{padding:0 10px;font-size:.82rem}'
+'body.ls-pad{padding-bottom:96px}'
+'mark.sr{background:#c9a13b;color:#1a1405;padding:0 2px;border-radius:2px}mark.sr.cur{outline:2px solid var(--ink);outline-offset:1px}';
var LS={api:null};
LS.init=function(cfg){
  var T=cfg.t,out=cfg.out,q='',marks=[],mi=-1,results=[],ri=-1,index=null,loading=false,typeF='all',stageF=0,bar=false,tmr=null;
  var st=document.createElement('style');st.textContent=CSS;document.head.append(st);
  /* ---- elements ---- */
  var fab=el('button',{type:'button',class:'ls-fab','aria-label':T.open,onclick:function(){openSheet();}});fab.innerHTML=ICON;
  var inp=el('input',{type:'search',placeholder:T.ph,autocomplete:'off',autocapitalize:'off',spellcheck:'false','aria-label':T.ph});
  var cnt=el('span',{class:'ls-cnt'});
  var bUp=el('button',{type:'button',class:'ls-nb','aria-label':T.prev,onclick:function(){stepMark(-1);}},'↑'),bDn=el('button',{type:'button',class:'ls-nb','aria-label':T.next,onclick:function(){stepMark(1);}},'↓');
  var sheet=el('div',{class:'ls-sheet',hidden:true,role:'dialog','aria-label':T.ph},
    el('div',{class:'ls-in'},svg(),inp,el('button',{type:'button',class:'ls-x','aria-label':T.close,onclick:function(){closeSheet();}},'✕')),
    el('div',{class:'ls-row'},cnt,bUp,bDn),
    el('button',{type:'button',class:'ls-big',onclick:function(){openResults();}},T.all));
  function svg(){var s=el('span');s.innerHTML=ICON.replace('width="22" height="22"','width="20" height="20"');return s;}
  /* overlay */
  var inp2=el('input',{type:'search',placeholder:T.ph,autocomplete:'off',autocapitalize:'off',spellcheck:'false','aria-label':T.ph});
  var rcnt=el('p',{class:'ls-note'}),list=el('div'),chips=el('div',{class:'ls-chips'}),sel=el('select',{class:'ls-sel','aria-label':'Stage'});
  var types=[['all',T.fAll],['v',T.fWords],['qa',T.fQs],['s',T.fText],['d',T.fDict]];
  var chipEls=types.map(function(x){return el('button',{type:'button',class:'ls-chip','aria-pressed':x[0]==='all'?'true':'false',onclick:function(){typeF=x[0];chipEls.forEach(function(c,i){c.setAttribute('aria-pressed',types[i][0]===typeF?'true':'false');});render();}},x[1]);});
  sel.append(el('option',{value:'0'},T.allStages));cfg.stages.forEach(function(s){sel.append(el('option',{value:String(s.n)},(cfg.stageWord||'Stage')+' '+s.n));});
  sel.addEventListener('change',function(){stageF=+sel.value;render();});
  chips.append.apply(chips,chipEls);chips.append(sel);
  var res=el('div',{class:'ls-res',hidden:true,role:'dialog','aria-label':T.all},
    el('div',{class:'in'},el('div',{class:'ls-top'},el('div',{class:'ls-in'},svg(),inp2),el('button',{type:'button',class:'ls-x','aria-label':T.back,onclick:function(){closeResults();}},'✕')),chips,rcnt,list));
  /* reading bar */
  var barTxt=el('b'),bPrev=el('button',{type:'button',class:'ls-nb','aria-label':T.prev,onclick:function(){go(ri-1);}},'↑'),bNext=el('button',{type:'button',class:'ls-nb','aria-label':T.next,onclick:function(){go(ri+1);}},'↓');
  var barEl=el('div',{class:'ls-bar',hidden:true},el('button',{type:'button',class:'ls-nb t',onclick:function(){openResults();}},'☰ '+T.list),barTxt,bPrev,bNext,el('button',{type:'button',class:'ls-nb t','aria-label':T.end,onclick:function(){endBar();}},'✕'));
  document.body.append(fab,sheet,res,barEl);
  /* ---- in-lesson search ---- */
  function clearMarks(){
    var ms=out.querySelectorAll('mark.sr'),i,m,p;
    for(i=0;i<ms.length;i++){m=ms[i];p=m.parentNode;if(!p)continue;p.replaceChild(document.createTextNode(m.textContent),m);p.normalize();}
    marks=[];mi=-1;
  }
  function highlight(keepIdx){
    clearMarks();
    var nq=norm(q);if(nq.length<2){cnt.textContent='';sync();return;}
    var w=document.createTreeWalker(out,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;if(!n.nodeValue.trim()||!p)return NodeFilter.FILTER_REJECT;if(p.closest&&p.closest('summary,.audio,.pn,button,select,script,style,.chartnote'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});
    var nodes=[],n;while((n=w.nextNode()))nodes.push(n);
    nodes.forEach(function(tn){
      var s=tn.nodeValue,ns=norm(s),pos=0,idx,frag=null,last=0;
      while((idx=find(ns,nq,pos))>=0){
        if(!frag)frag=document.createDocumentFragment();
        if(idx>last)frag.append(document.createTextNode(s.slice(last,idx)));
        var m=el('mark',{class:'sr'},s.slice(idx,idx+nq.length));frag.append(m);marks.push(m);
        last=pos=idx+nq.length;
      }
      if(frag){if(last<s.length)frag.append(document.createTextNode(s.slice(last)));tn.parentNode.replaceChild(frag,tn);}
    });
    if(marks.length){mi=Math.min(keepIdx||0,marks.length-1);mark(false);}
    sync();
  }
  function mark(scroll){
    marks.forEach(function(m){m.classList.remove('cur');});
    var m=marks[mi];if(!m)return;m.classList.add('cur');
    var d=m.closest&&m.closest('details');if(d&&!d.open)d.open=true;
    if(scroll!==false)m.scrollIntoView({block:'center',behavior:'smooth'});
    sync();
  }
  function stepMark(d){if(!marks.length)return;mi=(mi+d+marks.length)%marks.length;mark(true);}
  function sync(){
    var nq=norm(q).length>=2;
    if(!nq)cnt.textContent='';else if(!marks.length)cnt.textContent=T.none;else cnt.textContent=T.inLesson(mi+1,marks.length);
    bUp.disabled=bDn.disabled=marks.length<2;
  }
  function openSheet(){sheet.hidden=false;fab.hidden=true;document.body.classList.add('ls-pad');inp.value=q;setTimeout(function(){inp.focus();},30);highlight(0);}
  function closeSheet(){sheet.hidden=true;if(!bar){fab.hidden=false;document.body.classList.remove('ls-pad');clearMarks();q='';inp.value='';}}
  inp.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(function(){q=inp.value.trim();highlight(0);},140);});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();stepMark(e.shiftKey?-1:1);}});
  /* ---- global search ---- */
  function ensureIndex(){
    if(index)return Promise.resolve(index);
    if(loading)return loading;
    loading=cfg.fetchAll().then(function(all){
      var arr=[],ids=Object.keys(all).map(Number).sort(function(a,b){return a-b;});
      ids.forEach(function(id){
        var data=all[id];if(!Array.isArray(data))return;var par=cfg.para?cfg.para(id,data):null,sn=cfg.stageOf(id);
        data.forEach(function(b,bi){
          var k=b[0],text='',disp='';
          if(k==='v'){disp=b[1].join(' · ');text=b[1].join(' ');}
          else if(k==='qa'){disp=b[2]?b[1]+' — '+b[2]:b[1];text=b[1]+' '+(b[2]||'');}
          else if(k==='s'){disp=text=b[1];}
          else if(k==='d'){disp=text=b[2]||'';}
          else return;
          if(!text)return;
          arr.push({id:id,bi:bi,k:k,stage:sn,par:par?par[bi]:null,disp:disp,n:norm(disp),dn:k==='d'?Number(b[1]):null});
        });
      });
      index=arr;loading=false;return arr;
    },function(){loading=false;index=[];return index;});
    return loading;
  }
  var rtmr=null;
  inp2.addEventListener('input',function(){clearTimeout(rtmr);rtmr=setTimeout(function(){q=inp2.value.trim();render();},160);});
  /* "d6", "dict 6", "dictation 6", "ditado 6" -> numero do ditado */
  function dictNum(t){var m=/^\s*(?:d|dict|dictation|ditado|dictado)\.?\s*(\d{1,3})\s*$/i.exec(String(t));return m?+m[1]:0;}
  function filtered(){
    var nq=norm(q);if(nq.length<2||!index)return [];
    var dm=dictNum(q);if(dm)return index.filter(function(r){return r.k==='d'&&r.dn===dm&&(!stageF||r.stage===stageF);});
    return index.filter(function(r){return (typeF==='all'||r.k===typeF)&&(!stageF||r.stage===stageF)&&find(r.n,nq)>=0;});
  }
  function snippet(r,nq){
    if(dictNum(q)&&r.k==='d')return ['Dictation '+r.dn+' \u2014 ',r.disp.length>150?r.disp.slice(0,150)+'\u2026':r.disp];
    var s=r.disp,i=find(r.n,nq),a=Math.max(0,i-50),b=Math.min(s.length,i+nq.length+90);
    var pre=(a>0?'…':'')+s.slice(a,i),mid=s.slice(i,i+nq.length),post=s.slice(i+nq.length,b)+(b<s.length?'…':'');
    return [pre,el('mark',{class:'sr'},mid),post];
  }
  function render(){
    list.textContent='';var nq=norm(q);
    if(nq.length<2){rcnt.textContent=T.type2;return;}
    if(!index){rcnt.textContent=T.loading;ensureIndex().then(render);return;}
    var fl=filtered();results=fl;
    if(!fl.length){rcnt.textContent=T.noRes;return;}
    rcnt.textContent=T.res(fl.length)+(fl.length>300?' · '+T.first(300):'');
    fl.slice(0,300).forEach(function(r,i){
      var meta=(cfg.stageWord||'Stage')+' '+r.stage+' · '+cfg.lessonWord+' '+r.id+(r.par?' · '+cfg.parWord+' '+r.par:'');
      list.append(el('button',{type:'button',class:'ls-it',onclick:function(){pick(i);}},el('small',{},meta),el('span',{},snippet(r,nq))));
    });
  }
  function openResults(){
    sheet.hidden=true;fab.hidden=true;barEl.hidden=true;res.hidden=false;document.body.style.overflow='hidden';
    inp2.value=q;render();if(!q)setTimeout(function(){inp2.focus();},30);
    ensureIndex().then(function(){if(!res.hidden)render();});
  }
  function closeResults(){
    res.hidden=true;document.body.style.overflow='';
    if(bar){barEl.hidden=false;}else{fab.hidden=false;document.body.classList.remove('ls-pad');clearMarks();q='';inp.value='';}
  }
  function pick(i){bar=true;res.hidden=true;document.body.style.overflow='';barEl.hidden=false;fab.hidden=true;document.body.classList.add('ls-pad');go(i);}
  function endBar(){bar=false;barEl.hidden=true;fab.hidden=false;document.body.classList.remove('ls-pad');clearMarks();q='';inp.value='';results=[];ri=-1;}
  function go(i){
    if(i<0||i>=results.length)return;ri=i;var r=results[i];
    bPrev.disabled=i<=0;bNext.disabled=i>=results.length-1;
    barTxt.textContent='';barTxt.append(T.of(i+1,results.length),el('small',{},'“'+q+'” · '+cfg.lessonWord+' '+r.id+(r.par?' · ¶ '+r.par:'')));
    if(cfg.cur()===r.id){focusResult();}else{cfg.show(r.id,true);}
  }
  function focusResult(){
    highlight(0);
    var r=results[ri];if(!r)return;
    var blk=out.querySelector('[data-bi="'+r.bi+'"]');if(!blk){return;}
    var det=blk.matches&&blk.matches('details')?blk:null;if(det&&!det.open)det.open=true;
    var m=blk.querySelector('mark.sr');if(m){mi=marks.indexOf(m);if(mi<0)mi=0;mark(true);}else blk.scrollIntoView({block:'center',behavior:'smooth'});
  }
  /* chamado pela página ao fim de cada show() */
  LS.api={after:function(){
    if(bar&&ri>=0){focusResult();}
    else if(!sheet.hidden&&norm(q).length>=2){highlight(0);}
    else{marks=[];mi=-1;}
  }};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!res.hidden)closeResults();else if(!sheet.hidden)closeSheet();}});
};
LS.after=function(){if(LS.api)LS.api.after();};
window.LSearch=LS;
})();
