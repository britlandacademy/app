/* Britland option sheet: replaces the phone's native <select> list with an app-styled bottom sheet (opt-out: data-native). */
(function(){
if(window.__bsheet)return;window.__bsheet=1;
var ES=/\/espanol\//.test(location.pathname);
var T=ES?{t:'ELIGE UNA OPCIÓN',w:'ELIGE UNA PALABRA',x:'Cerrar'}:{t:'ESCOLHA UMA OPÇÃO',w:'ESCOLHA UMA PALAVRA',x:'Fechar'};
var css='#bsh{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(3,8,24,.6);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);animation:bshf .18s ease-out}'
+'#bsh .p{width:100%;max-width:560px;max-height:78vh;display:flex;flex-direction:column;background:var(--card,#12285c);color:var(--ink,#fff);border-radius:26px 26px 0 0;border-top:1px solid var(--accent,#e6c56a);padding:10px 16px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -12px 40px rgba(0,0,0,.45);animation:bshu .2s ease-out}'
+'#bsh .gr{width:42px;height:4px;border-radius:3px;background:var(--line,#3b4d86);margin:0 auto 12px;flex:none}'
+'#bsh .tt{font:700 11px system-ui,sans-serif;letter-spacing:.14em;color:var(--accent,#e6c56a);text-align:center;margin-bottom:4px;flex:none}'
+'#bsh .ps{font:700 16px Georgia,serif;text-align:center;margin-bottom:14px;line-height:1.45;flex:none}#bsh .ps u{text-decoration:none;color:var(--accent,#e6c56a);border-bottom:2px solid var(--accent,#e6c56a);padding:0 14px}'
+'#bsh .ls{overflow:auto;display:grid;gap:10px;grid-template-columns:1fr 1fr;padding:2px}#bsh .ls.one{grid-template-columns:1fr;gap:8px}'
+'#bsh .o{font:600 18px system-ui,sans-serif;padding:17px 10px;border-radius:16px;border:1px solid var(--line,#26376a);background:var(--chip,#16295a);color:inherit;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}'
+'#bsh .one .o{text-align:left;padding:15px 16px;font-size:16px;font-weight:500;border-radius:14px}#bsh .o:active{transform:scale(.97)}'
+'#bsh .o.on{background:var(--accent,#e6c56a);color:var(--accent-ink,#10224f);border-color:var(--accent,#e6c56a);font-weight:700}'
+'@keyframes bshf{from{opacity:0}to{opacity:1}}@keyframes bshu{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}'
+'#bsh.out{animation:bsho .15s ease-in forwards}#bsh.out .p{animation:bshd .15s ease-in forwards}@keyframes bsho{to{opacity:0}}@keyframes bshd{to{transform:translateY(40px)}}'
+'html.fx-off #bsh,html.fx-off #bsh .p{animation:none!important}@media(prefers-reduced-motion:reduce){#bsh,#bsh .p{animation:none!important}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var cur=null;
function close(){var b=document.getElementById('bsh');if(!b)return;document.removeEventListener('keydown',kd,true);
  if(document.documentElement.classList.contains('fx-off')||matchMedia('(prefers-reduced-motion:reduce)').matches){b.remove();}else{b.classList.add('out');setTimeout(function(){b.remove();},160);}
  if(cur){try{cur.focus({preventScroll:true});}catch(e){}}}
function kd(e){if(e.key==='Escape'){e.preventDefault();close();}}
function open(sel){
  if(document.getElementById('bsh'))return;cur=sel;
  var opts=[].filter.call(sel.options,function(o){return !o.disabled&&o.value!==''&&o.value!=null;});
  if(!opts.length)return;
  var inl=sel.classList.contains('inl');
  var b=document.createElement('div');b.id='bsh';b.setAttribute('role','dialog');b.setAttribute('aria-modal','true');
  var p=document.createElement('div');p.className='p';
  p.innerHTML='<div class=gr></div><div class=tt></div>';
  p.querySelector('.tt').textContent=inl?T.w:T.t;
  if(inl&&sel.parentNode){ /* sentence with the blank */
    var par=sel.closest('.q,.item,p,div')||sel.parentNode,clone=par.cloneNode(true),all=par.querySelectorAll('select'),cl=clone.querySelectorAll('select'),i;
    [].forEach.call(clone.querySelectorAll('br'),function(r){r.replaceWith(document.createTextNode(' '));});
    for(i=0;i<all.length;i++)cl[i].replaceWith(document.createTextNode(all[i]===sel?'\u0001':'____'));
    var segs=(clone.textContent||'').replace(/\s+/g,' ').trim().split('\u0001');
    if(segs.length===2&&segs[0].length+segs[1].length<220){var ps=document.createElement('div');ps.className='ps';
      ps.appendChild(document.createTextNode(segs[0]));var uu=document.createElement('u');uu.textContent='\u00a0\u00a0';ps.appendChild(uu);ps.appendChild(document.createTextNode(segs[1]));p.appendChild(ps);}
  }
  var long=opts.some(function(o){return o.text.length>14;})||opts.length>12;
  var ls=document.createElement('div');ls.className='ls'+(long?' one':'');ls.setAttribute('role','listbox');
  opts.forEach(function(o){var bt=document.createElement('button');bt.type='button';bt.className='o'+(o.value===sel.value?' on':'');bt.textContent=o.text;bt.setAttribute('role','option');
    bt.onclick=function(){sel.value=o.value;sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}));close();};ls.appendChild(bt);});
  p.appendChild(ls);b.appendChild(p);
  b.addEventListener('click',function(e){if(e.target===b)close();});
  document.body.appendChild(b);document.addEventListener('keydown',kd,true);
  var on=ls.querySelector('.on');if(on)on.scrollIntoView({block:'center'});
}
function isSel(t){return t&&t.tagName==='SELECT'&&!t.multiple&&!t.hasAttribute('data-native')&&!t.disabled;}
document.addEventListener('mousedown',function(e){var t=e.target.closest&&e.target.closest('select');if(isSel(t)){e.preventDefault();t.focus({preventScroll:true});open(t);}},true);
document.addEventListener('touchstart',function(e){var t=e.target.closest&&e.target.closest('select');if(isSel(t)){t.__tt=Date.now();}},{capture:true,passive:true});
document.addEventListener('keydown',function(e){var t=e.target;if(isSel(t)&&(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'&&e.altKey)){e.preventDefault();open(t);}},true);
})();
