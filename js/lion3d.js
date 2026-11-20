/* Extruded 3D lion (spins continuously; mode:'sway' for a gentle swing): a stack of lion PNG copies in depth. BLLion.make(host,{src,tone,w,mode}) ; BLLion.upgrade(root) swaps flat .sk-li images. */
(function(){if(window.BLLion)return;
window.BLLow=window.BLLow||function(){try{if(localStorage.getItem('bl-low')==='1')return true;if(localStorage.getItem('bl-low')==='0')return false;}catch(e){}var n=navigator,c=n.connection||{};return !!(c.saveData||(n.deviceMemory&&n.deviceMemory<=3)||(n.hardwareConcurrency&&n.hardwareConcurrency<=4));};

var FXOFF=function(){return document.documentElement.classList.contains('fx-off')||(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);};
function make(host,o){
  o=o||{};var src=o.src||'img/lion-gold.png',N=o.layers||12,w=o.w||host.clientWidth||54,STEP=Math.max(.5,w*(o.depth||.011)),tone=o.tone||'gold',sh=o.shade||[.92,.45],bd=o.backDetail==null?.62:o.backDetail;
  var st=document.createElement('div'),fig=document.createElement('div');
  st.className='l3s';fig.className='l3f';
  st.style.cssText='position:relative;width:100%;perspective:'+Math.round(w*6)+'px;perspective-origin:50% 40%;';
  fig.style.cssText='position:relative;width:100%;transform-style:preserve-3d;will-change:transform;';
  for(var i=0;i<N;i++){var im=document.createElement('img');im.src=src;im.alt='';im.setAttribute('aria-hidden','true');im.draggable=false;
    im.style.cssText='display:block;width:100%;height:auto;'+(i?'position:absolute;left:0;top:0;':'position:relative;')+'transform:translateZ('+(-i*STEP+N*STEP/2).toFixed(2)+'px);'+
      (i===0?'':'filter:'+(tone==='gold'?'brightness(0) invert(.74) sepia(1) saturate(3.4) hue-rotate(-10deg) brightness('+(sh[1]+(sh[0]-sh[1])*(1-i/(N-1))).toFixed(2)+')':'brightness(0) invert('+(.5+.12*(1-i/(N-1))).toFixed(2)+')')+';');
    fig.appendChild(im);}
  if(bd){var bk=document.createElement('img');bk.src=src;bk.alt='';bk.setAttribute('aria-hidden','true');bk.draggable=false;
    bk.style.cssText='display:block;width:100%;height:auto;position:absolute;left:0;top:0;transform:translateZ('+(-(N-1)*STEP+N*STEP/2-.3).toFixed(2)+'px) scaleX(-1) rotateY(180deg);backface-visibility:hidden;filter:brightness('+bd+')'+(tone==='gold'?' sepia(.3)':'')+';';
    fig.insertBefore(bk,fig.lastChild);}
  st.appendChild(fig);host.appendChild(st);
  var t0=performance.now(),amp=o.amp==null?24:o.amp,per=o.period||7000,dead=false;
  function tick(t){if(dead||!st.isConnected){return;}
    var a=FXOFF()?-16:(o.mode==='sway'?Math.sin((t-t0)/per*6.2832)*amp:((t-t0)/per*360)%360);fig.style.transform='rotateY('+a.toFixed(2)+'deg)';
    if(!FXOFF())requestAnimationFrame(tick);}
  if(o.mode!=='static')requestAnimationFrame(tick);else fig.style.transform='rotateY(-16deg)';
  return {el:st,fig:fig,stop:function(){dead=true;}};}
function upgrade(root){if(BLLow())return;
  var l=(root||document).querySelectorAll('img.sk-li:not([data-l3])');
  Array.prototype.forEach.call(l,function(im){
    if(!/lion-(gold|on|off)\.png/.test(im.getAttribute('src')||''))return;
    var tone=/gold/.test(im.src)?'gold':/on\.png/.test(im.src)?'on':'off';
    var h=document.createElement('span');h.style.cssText='display:block;width:100%;position:relative;';
    im.parentNode.insertBefore(h,im);var src=im.getAttribute('src');im.setAttribute('data-l3','1');im.style.display='none';
    var w=h.parentNode.clientWidth||54;make(h,{src:src,tone:tone==='gold'?'gold':'on',w:w,layers:10});});}
window.BLLion={make:make,upgrade:upgrade};})();
