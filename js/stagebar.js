/* Stage button (main control) for Exercises, Lesson Checks and Workbook.
   One big button shows the Stage; tapping it opens the Stage list (it reuses the page's hidden #g-stage select,
   so goStage() and locked Stages keep working). When the Stage is finished, a notice offers review or the next Stage. */
(function(){
  var W=window,D=document,css=D.createElement('style');
  css.textContent=
    '.g-stagebox{display:none!important}'+
    '.tabs.sbar{display:flex;flex-direction:column;align-items:stretch;gap:6px;margin:0 0 12px}'+
    '.sbar .sb-main{width:100%;min-height:64px;padding:8px 16px;font:inherit;font-size:1.3rem;font-weight:800;color:var(--accent-ink,#111);background:var(--accent,#f5c542);border:2px solid var(--accent,#f5c542);border-radius:10px;box-shadow:0 4px 0 rgba(0,0,0,.35);cursor:pointer}'+
    '.sbar .sb-main span{font-weight:700;opacity:.75}'+
    '.sbar .sb-main:focus-visible{outline:3px solid var(--ink,#fff);outline-offset:2px}'+
    '.sb-sheet{position:fixed;inset:0;z-index:2000;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.55)}'+
    '.sb-sheet[hidden]{display:none}'+
    '.sb-card{width:min(100%,480px);max-height:80vh;overflow:auto;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));background:var(--card,#181b22);color:var(--ink,#f3f4f6);border:1px solid var(--line,#2e3441);border-radius:16px 16px 0 0}'+
    '.sb-card h3{margin:0 0 10px;font-size:1.05rem}'+
    '.sb-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 10px}'+
    '.sb-list button{min-height:50px;font:inherit;font-weight:700;color:var(--ink,#f3f4f6);background:var(--surface,#1d212a);border:2px solid var(--line,#2e3441);border-radius:10px;cursor:pointer}'+
    '.sb-list button.cur{background:var(--accent,#f5c542);color:var(--accent-ink,#111);border-color:var(--accent,#f5c542)}'+
    '.sb-list button:disabled{opacity:.45;cursor:not-allowed}'+
    '.sb-close{width:100%;min-height:46px;font:inherit;font-weight:700;color:var(--muted,#a3aab7);background:transparent;border:2px solid var(--line,#2e3441);border-radius:10px;cursor:pointer}'+
    '.sb-done{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:2px solid var(--ok,#7fd29a);border-radius:12px;background:var(--ok-bg,#16301f)}'+
    '.sb-done b{font-size:1.05rem}'+
    '.sb-done div{display:flex;flex-wrap:wrap;gap:8px}'+
    '.sb-done button{min-height:46px;padding:6px 14px;font:inherit;font-weight:700;border-radius:10px;cursor:pointer;color:var(--ink,#fff);background:transparent;border:2px solid var(--line,#2e3441)}'+
    '.sb-done button.go{background:var(--accent,#f5c542);color:var(--accent-ink,#111);border-color:var(--accent,#f5c542)}'+
    '.sb-back{margin:0 0 12px;min-height:46px;padding:6px 14px;font:inherit;font-weight:700;color:var(--ink,#fff);background:var(--surface,#1d212a);border:2px solid var(--line,#2e3441);border-radius:10px;cursor:pointer}';
  D.head.appendChild(css);
  function T(s){try{return W.I18N&&W.I18N.t?W.I18N.t(s):s;}catch(e){return s;}}
  function el(tag,cls,txt){var e=D.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  function stageSel(){return D.getElementById('g-stage');}
  function pick(v){var s=stageSel();if(!s)return;s.value=String(v);s.dispatchEvent(new Event('change',{bubbles:true}));}
  var sheet=null;
  function openSheet(curN){
    var s=stageSel();if(!s)return;
    if(sheet)sheet.remove();
    sheet=el('div','sb-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label',T('Choose the Stage to load'));
    var card=el('div','sb-card');card.appendChild(el('h3','',T('Choose the Stage to load')));
    var list=el('div','sb-list');
    Array.prototype.forEach.call(s.options,function(o){
      var b=el('button',o.value===String(curN)?'cur':'',o.textContent);b.type='button';b.disabled=o.disabled;
      b.addEventListener('click',function(){sheet.remove();sheet=null;if(o.value!==String(curN))pick(o.value);});
      list.appendChild(b);});
    card.appendChild(list);
    var c=el('button','sb-close',T('Close'));c.type='button';c.addEventListener('click',function(){sheet.remove();sheet=null;});
    card.appendChild(c);sheet.appendChild(card);
    sheet.addEventListener('click',function(e){if(e.target===sheet){sheet.remove();sheet=null;}});
    D.addEventListener('keydown',function k(e){if(e.key==='Escape'&&sheet){sheet.remove();sheet=null;D.removeEventListener('keydown',k);}});
    D.body.appendChild(sheet);
    var cur=card.querySelector('button.cur')||card.querySelector('button:not(:disabled)');if(cur)cur.focus();
  }
  /* o: {n, label, done, total, hist (true while the history panel is open)} */
  W.StageBar={
    render:function(tabsEl,o){
      tabsEl.textContent='';tabsEl.classList.add('sbar');
      var b=el('button','sb-main');b.type='button';
      b.appendChild(D.createTextNode(o.label+' '));b.appendChild(el('span','','· '+o.done+'/'+o.total+' ▾'));
      b.setAttribute('aria-haspopup','dialog');
      b.addEventListener('click',function(){openSheet(o.n);});
      tabsEl.appendChild(b);
      if(o.total&&o.done>=o.total&&!o.hist){
        var nx=stageSel()&&Array.prototype.find.call(stageSel().options,function(x){return x.value===String(o.n+1)&&!x.disabled;});
        var box=el('div','sb-done');box.appendChild(el('b','',T('Stage completed')));
        var row=el('div');
        var rv=el('button','',T('Review the lessons'));rv.type='button';rv.addEventListener('click',function(){box.remove();});row.appendChild(rv);
        if(nx){var go=el('button','go',T('Go to the next Stage'));go.type='button';go.addEventListener('click',function(){pick(nx.value);});row.appendChild(go);}
        box.appendChild(row);tabsEl.appendChild(box);
      }
    },
    back:function(panel,fn){var b=el('button','sb-back','← '+T('Back to the lessons'));b.type='button';b.addEventListener('click',fn);panel.appendChild(b);}
  };
})();
