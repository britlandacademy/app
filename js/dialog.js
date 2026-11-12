/* Caixas de dialogo no padrao Britland (substituem confirm() e alert() do navegador).
   BL_DLG.confirm(texto, {title, ok, cancel, danger}) -> Promise<boolean>
   BL_DLG.alert(texto, {title, ok})                   -> Promise<void>
   danger: true/false; se omitido, e detectado pelas palavras (apagar, excluir, bloquear...). */
(function(){
var SC=document.currentScript,LANG=((SC&&SC.getAttribute('data-lang'))||document.documentElement.lang||'pt').slice(0,2).toLowerCase();
var TX={pt:{c:'Confirmar',s:'Tem certeza?',ok:'Confirmar',okd:'Sim, continuar',no:'Cancelar',a:'Aviso',okA:'Entendi'},
 en:{c:'Confirm',s:'Are you sure?',ok:'Confirm',okd:'Yes, continue',no:'Cancel',a:'Notice',okA:'OK'},
 es:{c:'Confirmar',s:'¿Seguro?',ok:'Confirmar',okd:'Sí, continuar',no:'Cancelar',a:'Aviso',okA:'Entendido'}};
var T=TX[LANG]||TX.pt,DANGER=/APAGAR|Excluir|Revogar|Bloquear|Dispensar|Remover|Cancelar a libera|Reverter|Zerar|Delete|Remove|Eliminar/i;
var css='.bld-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,10,24,.66);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}'
+'.bld-b{box-sizing:border-box;width:min(460px,100%);margin-top:30px;background:var(--card,#10224a);color:var(--ink,#f2f5fa);border:1px solid var(--line,#27407a);border-top:4px solid var(--accent,#c9a13b);border-radius:16px;padding:24px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.5);font-family:inherit}'
+'.bld-ic{width:54px;height:54px;border-radius:50%;margin:-52px auto 12px;background:var(--accent,#c9a13b);color:var(--accent-ink,#1a1405);display:flex;align-items:center;justify-content:center;font:800 1.7rem Georgia,serif;border:5px solid var(--card,#10224a)}'
+'.bld-t{margin:0 0 6px;font-family:Georgia,serif;font-size:1.2rem;font-weight:700;color:var(--ink,#f2f5fa)}'
+'.bld-m{margin:0;max-height:45vh;overflow:auto;color:var(--muted,#b4bfd6);line-height:1.45;white-space:pre-line;overflow-wrap:anywhere;font-size:1rem}'
+'.bld-a{display:flex;gap:10px;justify-content:center;margin-top:20px}.bld-a button{flex:1;font:inherit;font-weight:700;min-height:44px;padding:0 22px;border-radius:99px;cursor:pointer;border:2px solid var(--accent,#c9a13b);background:var(--accent,#c9a13b);color:var(--accent-ink,#1a1405)}'
+'.bld-a button:hover{background:var(--gold2,#e4c06a);border-color:var(--gold2,#e4c06a)}'
+'.bld-a button.bld-no{background:transparent;color:var(--ink,#f2f5fa);border-color:var(--line,#27407a)}.bld-a button.bld-no:hover{background:transparent;border-color:var(--accent,#c9a13b)}'
+'.bld-d .bld-b{border-top-color:#b3202a}.bld-d .bld-ic{background:#b3202a;color:#fff}.bld-d .bld-a button:not(.bld-no){background:#b3202a;border-color:#b3202a;color:#fff}.bld-d .bld-a button:not(.bld-no):hover{background:#c92d38;border-color:#c92d38}'
+'.bld-a button:focus-visible{outline:3px solid var(--gold2,#e4c06a);outline-offset:2px}';
function ensureCss(){if(document.getElementById('bld-css'))return;var s=document.createElement('style');s.id='bld-css';s.textContent=css;document.head.appendChild(s);}
function reduced(){try{return window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function open(msg,o,isConfirm){
  return new Promise(function(res){
    ensureCss();o=o||{};
    var danger=isConfirm&&(o.danger!=null?!!o.danger:DANGER.test(String(msg)));
    var prev=document.activeElement,ov=mk('div','bld-ov'+(danger?' bld-d':'')),b=mk('div','bld-b'),ic=mk('div','bld-ic',danger?'!':(isConfirm?'?':'i'));
    var tid='bld'+Math.random().toString(36).slice(2,8);
    var t=mk('h3','bld-t',o.title||(isConfirm?(danger?T.s:T.c):T.a));t.id=tid;
    var m=mk('p','bld-m',String(msg==null?'':msg));
    var ac=mk('div','bld-a'),no=null,ok=mk('button',null,o.ok||(isConfirm?(danger?T.okd:T.ok):T.okA));ok.type='button';
    if(isConfirm){no=mk('button','bld-no',o.cancel||T.no);no.type='button';ac.appendChild(no);}
    ac.appendChild(ok);b.appendChild(ic);b.appendChild(t);b.appendChild(m);b.appendChild(ac);ov.appendChild(b);
    ov.setAttribute('role',isConfirm?'alertdialog':'dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby',tid);ov.setAttribute('data-noi18n','1');
    document.body.appendChild(ov);
    var rm=reduced(),done=false;
    function anim(){if(rm||!ov.animate)return;
      ov.animate([{opacity:0},{opacity:1}],{duration:250,easing:'ease-out'});
      b.animate([{opacity:0,transform:'translateY(16px) scale(.94)'},{opacity:1,transform:'none'}],{duration:250,easing:'cubic-bezier(.2,.8,.2,1)'});
      ic.animate([{transform:'scale(0)',offset:0},{transform:'scale(0)',offset:.3},{transform:'scale(1.15)',offset:.7},{transform:'scale(1)',offset:1}],{duration:420,easing:'ease-out'});
      if(danger)b.animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(6px)'},{transform:'translateX(-4px)'},{transform:'translateX(2px)'},{transform:'translateX(0)'}],{duration:300,delay:100,easing:'ease-out'});}
    function close(v){if(done)return;done=true;document.removeEventListener('keydown',key,true);
      function fin(){if(ov.parentNode)ov.parentNode.removeChild(ov);try{if(prev&&prev.focus)prev.focus();}catch(e){}res(v);}
      if(rm||!ov.animate){fin();return;}
      var a=ov.animate([{opacity:1},{opacity:0}],{duration:150,easing:'ease-in',fill:'forwards'});b.animate([{transform:'none'},{transform:'scale(.95)'}],{duration:150,fill:'forwards'});a.onfinish=fin;setTimeout(fin,260);}
    function key(e){
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(isConfirm?false:undefined);return;}
      if(e.key==='Tab'){var f=no?[no,ok]:[ok],i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();}}
    document.addEventListener('keydown',key,true);
    ok.addEventListener('click',function(){close(isConfirm?true:undefined);});
    if(no)no.addEventListener('click',function(){close(false);});
    ov.addEventListener('mousedown',function(e){if(e.target===ov)close(isConfirm?false:undefined);});
    anim();(no||ok).focus();
  });
}
window.BL_DLG={confirm:function(msg,o){return open(msg,o,true);},alert:function(msg,o){return open(msg,o,false);}};
})();
