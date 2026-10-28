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

/* Resize a chosen photo to a 256x256 JPEG (centered square) */
function squarePhoto(file){
  return new Promise(function(ok,bad){
    var url=URL.createObjectURL(file),im=new Image();
    im.onload=function(){
      var s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=256;
      c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);
      URL.revokeObjectURL(url);c.toBlob(function(b){b?ok(b):bad(new Error('photo'));},'image/jpeg',0.86);
    };
    im.onerror=function(){URL.revokeObjectURL(url);bad(new Error('photo'));};
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
    var fact=document.createElement('div');fact.className='pf-fact';var fl=document.createElement('b'),ft=document.createElement('span');fact.append(fl,ft);
    var err=document.createElement('div');err.className='pf-err';err.setAttribute('aria-live','polite');
    var row=document.createElement('div');row.className='pf-row';
    var cancel=document.createElement('button');cancel.type='button';cancel.className='btn';cancel.textContent='Cancel';
    var save=document.createElement('button');save.type='button';save.className='btn primary';save.textContent='Save';
    row.append(cancel,save);dlg.append(h,up,or,cb,ob,fact,err,row);
    function lang(){return (window.I18N&&I18N.lang)||o.lang||'en';}
    function showFact(a){
      if(!a){fl.textContent='Your photo';ft.textContent='';return;}
      var L=(window.BL_FACTS_I18N||{})[lang()]||{},f=L[a.id]||(window.BL_FACTS||{})[a.id]||[a.name,''];
      fl.textContent=f[0];ft.textContent=f[1];
    }
    function draw(){
      Array.prototype.forEach.call(cb.children,function(x){x.classList.toggle('on',!photo&&x.dataset.k===cat);});
      ob.textContent='';
      if(photo){var pb=document.createElement('button');pb.type='button';pb.className='on';var pa=document.createElement('span');pa.className='pf-av';var im=document.createElement('img');im.src=photo.url;im.alt='Your photo';im.style.cssText='width:100%;height:100%;object-fit:cover';pa.append(im);pb.append(pa);ob.append(pb);}
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
      squarePhoto(f).then(function(b){photo={blob:b,url:URL.createObjectURL(b)};pick=null;showFact(null);draw();},function(){err.textContent=T('Could not read this photo. Try another one.');});
    };
    function close(){document.removeEventListener('keydown',key);ov.remove();}
    function key(e){if(e.key==='Escape')close();}
    document.addEventListener('keydown',key);
    cancel.onclick=close;ov.addEventListener('click',function(e){if(e.target===ov)close();});
    save.onclick=function(){
      err.textContent='';save.disabled=true;
      var p;
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
