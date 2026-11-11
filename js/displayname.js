/* Britland: display name ("nome de exibição") editor on My Profile. Shared by EN and ES.
   DisplayName.mount({sb, me, el}) puts a pencil next to the name; tapping it opens an inline editor.
   The server (RPC set_my_display_name) enforces 2-20 characters, allowed characters, a word filter and 1 change per 30 days.
   The real name (profiles.name) is never changed: certificates and contracts keep using it. */
(function(){
'use strict';
if(window.DisplayName)return;
var ES=/\/espanol\//.test(location.pathname);
var TX={
 en:{edit:'Edit display name',lb:'Display name',save:'Save',cancel:'Cancel',reset:'Use my real name',hint:'Shown in the class ranking and on your public profile. You can change it once every 30 days.',locked:'You can choose a new name again on {d}.',length:'Use 2 to 20 characters.',chars:'Use only letters, numbers, spaces and . - _',blocked:'This name is not allowed. Please choose another.',fail:'Could not save. Please try again.',ok:'Saved.'},
 pt:{edit:'Editar nome de exibição',lb:'Nome de exibição',save:'Salvar',cancel:'Cancelar',reset:'Usar meu nome real',hint:'Aparece no ranking da turma e no seu perfil público. Você pode trocar 1 vez a cada 30 dias.',locked:'Você poderá escolher um novo nome em {d}.',length:'Use de 2 a 20 caracteres.',chars:'Use só letras, números, espaços e . - _',blocked:'Este nome não é permitido. Escolha outro.',fail:'Não foi possível salvar. Tente de novo.',ok:'Salvo.'},
 es:{edit:'Editar nombre para mostrar',lb:'Nombre para mostrar',save:'Guardar',cancel:'Cancelar',reset:'Usar mi nombre real',hint:'Aparece en el ranking de la clase y en tu perfil público. Puedes cambiarlo 1 vez cada 30 días.',locked:'Podrás elegir un nuevo nombre el {d}.',length:'Usa de 2 a 20 caracteres.',chars:'Usa solo letras, números, espacios y . - _',blocked:'Este nombre no está permitido. Elige otro.',fail:'No se pudo guardar. Inténtalo de nuevo.',ok:'Guardado.'}};
function lang(){if(ES)return 'es';var l=(window.I18N&&window.I18N.lang)||'';return TX[l]?l:'en';}
function T(k,o){var s=TX[lang()][k]||'';if(o)Object.keys(o).forEach(function(x){s=s.replace('{'+x+'}',o[x]);});return s;}
function loc(){return {en:'en-GB',pt:'pt-BR',es:'es'}[lang()];}
function e(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined&&x!==null)n.textContent=x;return n;}
function css(){if(document.getElementById('dn-css'))return;var s=e('style');s.id='dn-css';s.textContent=
'.dn-pen{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;min-height:0;margin:0 0 0 8px;padding:0;border-radius:50%;border:1px solid var(--line,#26376a);background:var(--surface,transparent);color:var(--accent,#c9a13b);cursor:pointer;vertical-align:middle}'+
'.dn-pen svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}'+
'.dn-box{margin:10px 0 4px;padding:12px;border:1px solid var(--line,#26376a);border-radius:14px;background:var(--surface,transparent);animation:dnin .22s ease both}@keyframes dnin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}html.fx-off .dn-box{animation:none}'+
'.dn-box label{display:block;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#8d9bbd);font-weight:700;margin:0 0 6px}'+
'.dn-in{display:flex;align-items:center;gap:8px;border:2px solid var(--accent,#c9a13b);border-radius:12px;padding:0 12px;background:var(--bg,#fff)}.dn-in input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;font-weight:600;font-size:16px;min-height:44px}.dn-in small{color:var(--muted,#8d9bbd)}'+
'.dn-box p{margin:8px 0 0;font-size:.85rem;color:var(--muted,#8d9bbd)}.dn-box p.dn-m{font-weight:700;color:var(--bad,#ff9e94)}.dn-box p.dn-m.ok{color:var(--ok,#7fd29a)}'+
'.dn-act{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}.dn-act button{min-height:40px}.dn-rs{background:none;border:0;color:var(--muted,#8d9bbd);text-decoration:underline;font:inherit;font-size:.85rem;cursor:pointer;padding:4px 6px;margin-left:auto}';
document.head.appendChild(s);}
function mount(o){
  if(!o||!o.el||!o.sb)return;css();
  var me=o.me||{},h=o.el,pen=e('button','dn-pen');pen.type='button';pen.setAttribute('aria-label',T('edit'));
  pen.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>';
  h.style.display='inline-block';h.after(pen);
  var box=null;
  function shown(){h.textContent=me.display_name||me.name||'';}
  function close(){if(box){box.remove();box=null;}pen.setAttribute('aria-expanded','false');}
  function lockedUntil(){if(!me.display_name_at)return null;var t=new Date(me.display_name_at).getTime()+30*864e5;return t>Date.now()?new Date(t):null;}
  function open(){
    if(box){close();return;}
    pen.setAttribute('aria-expanded','true');
    box=e('div','dn-box');var lb=e('label','',T('lb'));lb.htmlFor='dn-in';box.appendChild(lb);
    var wr=e('div','dn-in'),inp=e('input');inp.id='dn-in';inp.type='text';inp.maxLength=20;inp.autocomplete='off';inp.value=me.display_name||'';inp.placeholder=(me.name||'').split(' ')[0];
    var cnt=e('small','',(inp.value.length)+'/20');wr.appendChild(inp);wr.appendChild(cnt);box.appendChild(wr);
    var msg=e('p','',T('hint'));box.appendChild(msg);
    var act=e('div','dn-act'),sv=e('button','btn',T('save')),cc=e('button','btn ghost',T('cancel'));sv.type=cc.type='button';act.appendChild(sv);act.appendChild(cc);
    var rs=null;if(me.display_name){rs=e('button','dn-rs',T('reset'));rs.type='button';act.appendChild(rs);}
    box.appendChild(act);
    var lk=lockedUntil();
    if(lk){inp.disabled=true;sv.disabled=true;msg.className='dn-m';msg.textContent=T('locked',{d:lk.toLocaleDateString(loc(),{day:'2-digit',month:'long'})});}
    var host=h.closest('.hi')||h.parentNode;host.insertBefore(box,pen.nextSibling);
    inp.addEventListener('input',function(){cnt.textContent=inp.value.length+'/20';});
    inp.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();go(inp.value);}if(ev.key==='Escape')close();});
    sv.addEventListener('click',function(){go(inp.value);});cc.addEventListener('click',close);
    if(rs)rs.addEventListener('click',function(){go('');});
    try{if(!lk)inp.focus();}catch(x){}
    function go(v){
      v=String(v||'').trim();sv.disabled=true;if(rs)rs.disabled=true;
      Promise.resolve(o.sb.rpc('set_my_display_name',{p_name:v})).then(function(r){
        var d=r&&r.data;sv.disabled=false;if(rs)rs.disabled=false;
        if(!d||r.error){msg.className='dn-m';msg.textContent=T('fail');return;}
        if(d.ok){me.display_name=d.name||null;if(d.name)me.display_name_at=new Date().toISOString();shown();msg.className='dn-m ok';msg.textContent=T('ok');setTimeout(close,700);return;}
        msg.className='dn-m';
        if(d.error==='locked'){var nx=d.next_at?new Date(d.next_at).toLocaleDateString(loc(),{day:'2-digit',month:'long'}):'';msg.textContent=T('locked',{d:nx});}
        else msg.textContent=T(d.error==='length'||d.error==='chars'||d.error==='blocked'?d.error:'fail');
      },function(){sv.disabled=false;if(rs)rs.disabled=false;msg.className='dn-m';msg.textContent=T('fail');});
    }
  }
  pen.addEventListener('click',open);
  shown();
}
window.DisplayName={mount:mount};
})();
