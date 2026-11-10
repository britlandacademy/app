/* Britland Academy: student profile helpers (avatar painting, avatar picker, saved preferences).
   Loaded by gate.js. Needs js/avatars.js and js/facts.js (loaded on demand). */
(function(){
'use strict';
var CFG=window.CALLAN_CFG||{};
var loaded=null;
function loadScript(src){return new Promise(function(ok){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ok;document.head.append(s);});}
function ready(){
  if(loaded)return loaded;
  loaded=loadScript((window.BL_BASE||'')+'js/avatars.js').then(function(){return loadScript((window.BL_BASE||'')+'js/facts.js');}).then(function(){return loadScript((window.BL_BASE||'')+'js/facts_i18n.js');});
  return loaded;
}
function find(id){var A=window.BL_AVATARS_ALL||window.BL_AVATARS||[],i;for(i=0;i<A.length;i++)if(A[i].id===id)return A[i];return null;}
function photoUrl(uid,id){return CFG.url+'/storage/v1/object/public/avatars/'+uid+'/'+id.slice(6);}
/* Fill an element with the avatar (id is profiles.avatar; empty = school lion) */
function paint(node,id,uid){
  node.textContent='';
  if(id&&id.indexOf('photo:')===0&&uid){
    var im=document.createElement('img');im.src=photoUrl(uid,id);im.alt='';im.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
    node.append(im);return;
  }
  var a=find(id||'lion-navy')||find('lion-navy');
  if(a)node.innerHTML=a.svg;
}
var CSS=
'.pf-av{width:44px;height:44px;border-radius:50%;border:2px solid var(--accent,#c9a13b);background:var(--chip,#1a3366);display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden;padding:0}'+
'.pf-av svg{width:100%;height:100%;display:block}.pf-av.xl{width:104px;height:104px;border-width:4px}'+
'.pf-ov{position:fixed;inset:0;z-index:10000;background:rgba(5,10,25,.65);display:flex;align-items:center;justify-content:center;padding:16px}'+
'.pf-dlg{background:var(--card,#fff);color:var(--ink,#111);border-top:6px solid var(--accent,#c9a13b);border-radius:14px;max-width:520px;width:100%;padding:20px;max-height:92vh;overflow:auto;box-sizing:border-box}'+
'.pf-dlg h3{margin:0 0 12px}.pf-up{border:2px dashed var(--line,#999);border-radius:12px;padding:14px;text-align:center;margin-bottom:6px;background:var(--surface,transparent)}'+
'.pf-cats{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.pf-cats button{border:1.5px solid var(--line,#999);background:var(--card,#fff);border-radius:99px;padding:6px 12px;font:inherit;font-size:.88rem;color:var(--muted,#555);cursor:pointer;min-height:36px}'+
'.pf-cats button.on{background:var(--chip,#eee);color:var(--ink,#111);border-color:var(--accent,#c9a13b)}'+
'.pf-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:10px 0;min-height:120px;align-content:start}'+
'.pf-opts button{border:3px solid transparent;background:none;border-radius:50%;padding:0;aspect-ratio:1;cursor:pointer}.pf-opts button.on{border-color:var(--accent,#c9a13b)}.pf-opts .pf-av{width:100%;height:100%;border-width:2px}'+
'.pf-fact{background:var(--surface,#f4f1ea);border-left:5px solid var(--accent,#c9a13b);border-radius:10px;padding:10px 14px;margin:6px 0 10px}.pf-fact b{display:block}.pf-fact span{display:block;font-size:.92rem;margin-top:3px;line-height:1.45}'+
'.pf-row{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:12px}.pf-err{color:var(--bad,#b00);font-weight:700;min-height:1.2em}';
var cssDone=false;function css(){if(cssDone)return;cssDone=true;var s=document.createElement('style');s.textContent=CSS;document.head.append(s);}

/* Photo editor (1.12): drag to move, pinch / slider to zoom, rotate, live preview as shown in the ranking and on the public profile.
   Resolves with a 256x256 JPEG blob; rejects with Error('cancel') when the student cancels, Error('photo') when the file cannot be read. */
function squarePhoto(file){
  return new Promise(function(ok,bad){
    var url=URL.createObjectURL(file),im=new Image();
    im.onerror=function(){URL.revokeObjectURL(url);bad(new Error('photo'));};
    im.onload=function(){
      var S=250,rot=0,z=1,ox=0,oy=0,done=false;
      var el=function(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n;};
      if(!document.getElementById('pf-crop-css')){var st=el('style');st.id='pf-crop-css';st.textContent=
        '.pc-ov{position:fixed;inset:0;z-index:10001;background:rgba(4,9,24,.8);display:flex;align-items:center;justify-content:center;padding:12px}'+
        '.pc{background:#0f1f45;color:#e9edf7;border:1px solid #26376a;border-radius:20px;width:100%;max-width:400px;max-height:96vh;overflow:auto;padding:16px;box-sizing:border-box;font:14px/1.35 system-ui,sans-serif}'+
        '.pc h3{margin:0 0 2px;font-size:19px}.pc .mu{color:#8d9bbd;font-size:12px}'+
        '.pc .stage{width:'+S+'px;height:'+S+'px;max-width:100%;margin:12px auto;border-radius:50%;border:3px solid #e6c56a;overflow:hidden;touch-action:none;cursor:grab;background:#1b2a55;position:relative}'+
        '.pc .stage canvas{display:block;width:100%;height:100%}.pc .stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 33%,#fff3 33%,#fff3 calc(33% + 1px),transparent calc(33% + 1px),transparent 66%,#fff3 66%,#fff3 calc(66% + 1px),transparent calc(66% + 1px)),linear-gradient(transparent 33%,#fff3 33%,#fff3 calc(33% + 1px),transparent calc(33% + 1px),transparent 66%,#fff3 66%,#fff3 calc(66% + 1px),transparent calc(66% + 1px))}'+
        '.pc .zr{display:flex;align-items:center;gap:10px}.pc input[type=range]{flex:1;accent-color:#e6c56a}'+
        '.pc .tools{display:flex;gap:12px;justify-content:center;margin:12px 0}.pc .ic{width:40px;height:40px;border-radius:50%;border:1px solid #26376a;background:#16295a;color:#e9edf7;font-size:18px;cursor:pointer;display:flex!important;align-items:center;justify-content:center;padding:0!important}'+
        '.pc .pv{background:#16295a;border:1px solid #26376a;border-radius:14px;padding:10px;margin-top:6px}.pc .pr{display:flex;align-items:center;gap:10px}.pc .pr+.pr{margin-top:10px}.pc .pr b{flex:1}.pc .pa{flex:none;border-radius:50%;overflow:hidden;border:3px solid #c9a23c;background:#1b2a55}.pc .pa canvas{display:block;width:100%;height:100%}'+
        '.pc .lbl{font-size:11px;letter-spacing:.16em;color:#8d9bbd;font-weight:700;margin:12px 0 6px}.pc .row{display:flex;gap:10px;margin-top:14px}.pc .row button{flex:1;border-radius:12px;padding:12px;font-weight:700;cursor:pointer;font-size:15px}.pc .gh{background:none;border:1px solid #c9a23c;color:#e6c56a}.pc .pri{background:#e6c56a;border:0;color:#0a1330}';
        document.head.appendChild(st);}
      var ov=el('div','pc-ov'),box=el('div','pc');ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
      box.appendChild(el('h3','',T('Adjust your photo')));box.appendChild(el('div','mu',T('Drag to move. Pinch or use the slider to zoom.')));
      var stage=el('div','stage'),cv=el('canvas');cv.width=cv.height=S;stage.appendChild(cv);box.appendChild(stage);
      var zr=el('div','zr'),zi=el('input');zi.type='range';zi.min='1';zi.max='4';zi.step='0.01';zi.value='1';zi.setAttribute('aria-label',T('Zoom'));zr.appendChild(document.createTextNode('−'));zr.appendChild(zi);zr.appendChild(document.createTextNode('+'));box.appendChild(zr);
      var tools=el('div','tools');function tb(t,l,f){var b=el('button','ic',t);b.type='button';b.setAttribute('aria-label',l);b.title=l;b.onclick=f;tools.appendChild(b);}
      tb('⟲',T('Rotate left'),function(){rot=(rot+3)%4;fix();draw();});tb('⟳',T('Rotate right'),function(){rot=(rot+1)%4;fix();draw();});tb('↺',T('Reset'),function(){rot=0;z=1;ox=oy=0;zi.value='1';draw();});box.appendChild(tools);
      box.appendChild(el('div','lbl',T('Preview')));var pv=el('div','pv'),r1=el('div','pr'),r2=el('div','pr');
      function pa(sz){var d=el('div','pa'),c=el('canvas');c.width=c.height=sz*2;d.style.width=d.style.height=sz+'px';d.appendChild(c);return [d,c];}
      var p1=pa(34),p2=pa(64);r1.appendChild(p1[0]);r1.appendChild(el('b','',T('Your name')));r2.appendChild(p2[0]);r2.appendChild(el('b','',T('Your name')));pv.appendChild(r1);pv.appendChild(r2);box.appendChild(pv);
      var row=el('div','row'),cb=el('button','gh',T('Cancel')),sb=el('button','pri',T('Save photo'));cb.type=sb.type='button';row.appendChild(cb);row.appendChild(sb);box.appendChild(row);
      ov.appendChild(box);document.body.appendChild(ov);var prevOv=document.body.style.overflow;document.body.style.overflow='hidden';
      function dims(){return (rot%2)?[im.height,im.width]:[im.width,im.height];}
      function render(c,size){var d=dims(),k=size/Math.min(d[0],d[1])*z,f=size/S,x=c.getContext('2d');x.fillStyle='#1b2a55';x.fillRect(0,0,size,size);x.save();x.translate(size/2+ox*f,size/2+oy*f);x.rotate(rot*Math.PI/2);x.scale(k,k);x.drawImage(im,-im.width/2,-im.height/2);x.restore();}
      function fix(){var d=dims(),k=S/Math.min(d[0],d[1])*z,mx=Math.max(0,d[0]*k/2-S/2),my=Math.max(0,d[1]*k/2-S/2);ox=Math.max(-mx,Math.min(mx,ox));oy=Math.max(-my,Math.min(my,oy));}
      function draw(){fix();render(cv,S);[p1,p2].forEach(function(p){var c=p[1],x=c.getContext('2d');x.drawImage(cv,0,0,S,S,0,0,c.width,c.height);});}
      zi.oninput=function(){z=parseFloat(zi.value);draw();};
      var ptr={},last=null,d0=0,z0=1;
      stage.addEventListener('pointerdown',function(e){stage.setPointerCapture(e.pointerId);ptr[e.pointerId]=[e.clientX,e.clientY];var ks=Object.keys(ptr);if(ks.length===2){var a=ptr[ks[0]],b=ptr[ks[1]];d0=Math.hypot(a[0]-b[0],a[1]-b[1]);z0=z;}stage.style.cursor='grabbing';});
      stage.addEventListener('pointermove',function(e){if(!ptr[e.pointerId])return;var p=ptr[e.pointerId],ks=Object.keys(ptr),k=stage.getBoundingClientRect().width/S;
        if(ks.length===1){ox+=(e.clientX-p[0])/k;oy+=(e.clientY-p[1])/k;ptr[e.pointerId]=[e.clientX,e.clientY];}
        else{ptr[e.pointerId]=[e.clientX,e.clientY];var a=ptr[ks[0]],b=ptr[ks[1]],dd=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d0>0){z=Math.max(1,Math.min(4,z0*dd/d0));zi.value=String(z);}}
        draw();});
      function up(e){delete ptr[e.pointerId];stage.style.cursor='';}
      stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
      stage.addEventListener('wheel',function(e){e.preventDefault();z=Math.max(1,Math.min(4,z*(e.deltaY<0?1.06:1/1.06)));zi.value=String(z);draw();},{passive:false});
      function fin(){if(done)return;done=true;document.removeEventListener('keydown',kd);ov.remove();document.body.style.overflow=prevOv;URL.revokeObjectURL(url);}
      function kd(e){if(e.key==='Escape'){fin();bad(new Error('cancel'));}}document.addEventListener('keydown',kd);
      cb.onclick=function(){fin();bad(new Error('cancel'));};
      sb.onclick=function(){var c=document.createElement('canvas');c.width=c.height=256;render(c,256);c.toBlob(function(b){fin();b?ok(b):bad(new Error('photo'));},'image/jpeg',0.86);};
      draw();try{sb.focus();}catch(e){}
    };
    im.src=url;
  });
}
function savePrefs(sb,p){
  return sb.rpc('set_my_prefs',{p_avatar:p.avatar===undefined?null:p.avatar,p_theme:p.theme===undefined?null:p.theme,p_lang:p.lang===undefined?null:p.lang}).then(function(r){if(r.error)throw r.error;});
}
var T=function(s){return window.I18N&&I18N.t?I18N.t(s):s;};
/* o: {sb, uid, current, lang, onSaved(id)} */
function openPicker(o){
  css();
  return ready().then(function(){
    var A=window.BL_AVATARS||[],cats=window.BL_AVATAR_CATS||[],cat='school',pick=find(o.current)||find('lion-navy'),photo=null,oldPhoto=(o.current||'').indexOf('photo:')===0?o.current:null;
    if(oldPhoto&&o.uid){photo={blob:null,url:photoUrl(o.uid,oldPhoto)};pick=null;}var lastPhoto=photo;
    var cur=find(o.current);if(cur)cat=cur.cat;
    var ov=document.createElement('div');ov.className='pf-ov';
    var dlg=document.createElement('div');dlg.className='pf-dlg';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label','Profile picture');ov.append(dlg);
    var h=document.createElement('h3');h.textContent='Profile picture';
    var up=document.createElement('div');up.className='pf-up';
    var ub=document.createElement('b');ub.textContent='Upload your photo';
    var uh=document.createElement('small');uh.style.cssText='display:block;color:var(--muted,#555)';uh.textContent='JPG or PNG. We will crop it into a circle.';
    var file=document.createElement('input');file.type='file';file.accept='image/*';file.style.display='none';
    var fb=document.createElement('button');fb.type='button';fb.className='btn';fb.style.marginTop='10px';fb.textContent='Choose a photo';fb.onclick=function(){file.click();};
    up.append(ub,uh,fb,file);
    var or=document.createElement('p');or.style.cssText='margin:14px 0 0;color:var(--muted,#555)';or.innerHTML='<b></b>';or.firstChild.textContent='or choose an avatar';
    var cb=document.createElement('div');cb.className='pf-cats';var ob=document.createElement('div');ob.className='pf-opts';
    var fact=document.createElement('div');fact.className='pf-fact';var fl=document.createElement('b'),ft=document.createElement('span'),fc=document.createElement('small');fc.style.cssText='display:block;margin-top:5px;opacity:.75;font-size:.78rem';fact.append(fl,ft,fc);
    var err=document.createElement('div');err.className='pf-err';err.setAttribute('aria-live','polite');
    var row=document.createElement('div');row.className='pf-row';
    var cancel=document.createElement('button');cancel.type='button';cancel.className='btn';cancel.textContent='Cancel';
    var save=document.createElement('button');save.type='button';save.className='btn primary';save.textContent='Save';
    row.append(cancel,save);dlg.append(h,up,or,cb,ob,fact,err,row);
    function lang(){return (window.I18N&&I18N.lang)||o.lang||'en';}
    function showFact(a){
      if(!a){fl.textContent='Your photo';ft.textContent='';fc.textContent='';return;}
      var L=(window.BL_FACTS_I18N||{})[lang()]||{},f=L[a.id]||(window.BL_FACTS||{})[a.id]||[a.name,''];
      fl.textContent=f[0];ft.textContent=f[1];fc.textContent=f[2]||'';
    }
    function draw(){
      Array.prototype.forEach.call(cb.children,function(x){x.classList.toggle('on',!photo&&x.dataset.k===cat);});
      ob.textContent='';
      if(photo||lastPhoto){var pb=document.createElement('button');pb.type='button';pb.className=photo?'on':'';pb.onclick=function(){photo=lastPhoto;pick=null;showFact(null);draw();};var pa=document.createElement('span');pa.className='pf-av';var im=document.createElement('img');im.src=(photo||lastPhoto).url;im.alt='Your photo';im.style.cssText='width:100%;height:100%;object-fit:cover';pa.append(im);pb.append(pa);ob.append(pb);}
      A.filter(function(a){return a.cat===cat;}).forEach(function(a){
        var b=document.createElement('button');b.type='button';b.title=a.name;b.setAttribute('aria-label',a.name);
        var s=document.createElement('span');s.className='pf-av';s.innerHTML=a.svg;b.append(s);
        b.classList.toggle('on',!photo&&pick&&pick.id===a.id);
        b.onclick=function(){pick=a;photo=null;showFact(a);draw();};ob.append(b);
      });
    }
    cats.forEach(function(c){var b=document.createElement('button');b.type='button';b.textContent=c[1];b.dataset.k=c[0];b.onclick=function(){cat=c[0];draw();};cb.append(b);});
    file.onchange=function(){
      var f=file.files&&file.files[0];if(!f)return;err.textContent='';
      squarePhoto(f).then(function(b){photo=lastPhoto={blob:b,url:URL.createObjectURL(b)};pick=null;showFact(null);draw();},function(e){if(!e||e.message!=='cancel')err.textContent=T('Could not read this photo. Try another one.');});
    };
    function close(){document.removeEventListener('keydown',key);ov.remove();}
    function key(e){if(e.key==='Escape')close();}
    document.addEventListener('keydown',key);
    cancel.onclick=close;ov.addEventListener('click',function(e){if(e.target===ov)close();});
    save.onclick=function(){
      err.textContent='';save.disabled=true;
      var p;
      if(photo&&!photo.blob){close();if(o.onSaved)o.onSaved(oldPhoto);return;}
      if(photo){
        var name=(window.crypto&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)).replace(/[^a-z0-9-]/gi,'').toLowerCase()+'.jpg';
        p=o.sb.storage.from('avatars').upload(o.uid+'/'+name,photo.blob,{contentType:'image/jpeg',upsert:false}).then(function(r){
          if(r.error)throw r.error;
          return savePrefs(o.sb,{avatar:'photo:'+name}).then(function(){
            if(oldPhoto)try{o.sb.storage.from('avatars').remove([o.uid+'/'+oldPhoto.slice(6)]);}catch(e){}
            return 'photo:'+name;});
        });
      }else{
        p=savePrefs(o.sb,{avatar:pick.id}).then(function(){
          if(oldPhoto)try{o.sb.storage.from('avatars').remove([o.uid+'/'+oldPhoto.slice(6)]);}catch(e){}
          return pick.id;});
      }
      p.then(function(id){close();if(o.onSaved)o.onSaved(id);},function(e){save.disabled=false;var m=e&&(e.message||e.error_description||e.error)||'';err.textContent=T('Could not save. Try again.')+(m?' ('+String(m).slice(0,120)+')':'');try{console.error('avatar save',e);}catch(x){}});
    };
    document.body.append(ov);showFact(pick);draw();save.focus({preventScroll:true});
    window.addEventListener('langchange',function f(){if(!ov.isConnected){window.removeEventListener('langchange',f);return;}showFact(pick);});
  });
}
window.Profile={ready:ready,paint:paint,openPicker:openPicker,savePrefs:savePrefs,css:css,find:find};
})();
