/* BLCoin: moeda 3D de metal escovado com relevo, brilho que corre ao inclinar e giro livre.
 *
 * Uso:
 *   BLCoin.make(elemento, {
 *     size: 150,                         // px da moeda (CSS)
 *     tone: 'gold' | 'silver' | 'bronze',
 *     intensity: 'med' | 'strong',       // intensidade do relevo
 *     front: {text:'B1'},                // texto gravado no metal (baixo-relevo afundado)
 *     back:  {src:'img/x.png', gold:true}// imagem em alto-relevo; gold:true = so as partes douradas sobem
 *   }) -> controle {coin, host, layers(face), live(on), destroy()}
 *   Cada face aceita {text} (gravado), {src} (silhueta pelo alfa sobe) ou {src, gold:true}.
 *   BLCoin.requestMotion() deve ser chamado dentro de um toque (iOS pede permissao do acelerometro).
 * Giro livre com inercia nos dois eixos; 1 s depois de soltar volta devagar para a frente. Sons: js/sfx/coin-stamp.mp3 (BLCoin.sound("stamp")) e coin-spin.mp3 (automatico em giro forte).
 * O relevo e calculado uma vez em canvas (luz do alto-esquerda) e aplicado por cima do metal.
 */
(function(){
var TONES={
  gold:{m:['#8d6c1c','#f3d37e','#b48a2a','#fff0b0','#9a7621','#efcf76','#a98023','#fbe6a0'],e:['#7d5f17','#b8902f','#5f470f']},
  silver:{m:['#7d838c','#e9edf3','#a3a9b3','#ffffff','#8a9099','#dfe4ec','#9aa0aa','#f4f6fa'],e:['#6b717a','#a3a9b3','#4f555e']},
  bronze:{m:['#6e3f1c','#d59a63','#9b6232','#f0c08e','#7e4a22','#d9a06b','#8f5a2c','#f2c697'],e:['#5e3414','#9b6232','#472608']}
};
var INT={med:{k:13,fd:.62},strong:{k:22,fd:.62}};
var SZ=320,motion={ok:false,asked:false,g:0,b:40,has:false};
var BASE=(function(){try{return document.currentScript.src.replace(/[^\/]*$/,'');}catch(e){return '';}})();
var snd={cache:{},last:0};
function sfx(n,vol,rate){
  try{
    if(localStorage.getItem('callan-mute')==='1'||localStorage.getItem('bl-fx')==='0')return;
    var a=snd.cache[n]||(snd.cache[n]=new Audio(BASE+'sfx/coin-'+n+'.mp3'));
    a=a.paused?a:a.cloneNode();a.volume=clamp(vol,0,1);a.playbackRate=rate||1;a.currentTime=0;
    var p=a.play();if(p&&p.catch)p.catch(function(){});
  }catch(e){}
}
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

function box(a,w,h,r){
  var t=new Float32Array(a.length),o=new Float32Array(a.length),x,y,s,n=2*r+1;
  for(y=0;y<h;y++){s=0;for(x=-r;x<=r;x++)s+=a[y*w+Math.min(w-1,Math.max(0,x))];
    for(x=0;x<w;x++){t[y*w+x]=s/n;s+=a[y*w+Math.min(w-1,x+r+1)]-a[y*w+Math.max(0,x-r)];}}
  for(x=0;x<w;x++){s=0;for(y=-r;y<=r;y++)s+=t[Math.min(h-1,Math.max(0,y))*w+x];
    for(y=0;y<h;y++){o[y*w+x]=s/n;s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x];}}
  return o;
}
function gb(a,w,h,sig){var r=Math.max(1,Math.round(sig*.9));return box(box(box(a,w,h,r),w,h,r),w,h,r);}
function cv(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

/* fonte -> {a: alfa 0..1, hi: partes altas 0..1} */
function fromCanvas(c,gold){
  var w=c.width,h=c.height,d=c.getContext('2d').getImageData(0,0,w,h).data,a=new Float32Array(w*h),hi=new Float32Array(w*h),i,p;
  for(i=0;i<w*h;i++){
    p=i*4;a[i]=d[p+3]/255;
    if(gold){
      var r=d[p]/255,g=d[p+1]/255,b=d[p+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx?(mx-mn)/mx:0;
      hi[i]=(a[i]>.5&&r>g&&g>b&&sat>.28&&mx>.45&&r-b>.25&&g>.3)?1:0;
    }else hi[i]=a[i];
  }
  if(gold){ /* a borda do escudo tambem e alta */
    var m=gb(a,w,h,2.4),e=new Float32Array(w*h);
    for(i=0;i<w*h;i++)e[i]=clamp((a[i]-m[i])*3.2,0,1)*a[i];
    var hb=gb(hi,w,h,.5);for(i=0;i<w*h;i++)hi[i]=clamp(hb[i]+e[i],0,1)*a[i];
  }
  return {a:a,hi:hi,w:w,h:h};
}
function drawText(text){
  var c=cv(SZ,SZ),x=c.getContext('2d'),fs=SZ*.62,ff=getComputedStyle(document.body).fontFamily||'sans-serif';
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#000';
  do{x.font='800 '+fs+'px '+ff;fs-=6;}while(x.measureText(text).width>SZ*.84&&fs>20);
  x.fillText(text,SZ/2,SZ/2+SZ*.03);
  return c;
}
function drawImg(img){
  var c=cv(SZ,SZ),x=c.getContext('2d'),s=Math.min(SZ/img.naturalWidth,SZ/img.naturalHeight);
  var w=img.naturalWidth*s,h=img.naturalHeight*s;x.drawImage(img,(SZ-w)/2,(SZ-h)/2,w,h);return c;
}
function toUrl(w,h,fill){var c=cv(w,h),x=c.getContext('2d'),id=x.createImageData(w,h);fill(id.data);x.putImageData(id,0,0);return c.toDataURL('image/png');}

/* gera camadas de relevo. engr = afundado (texto); senao alto-relevo */
function layersFor(src,engr,k,fdOp){
  var a=src.a,hi=src.hi,w=src.w,h=src.h,n=w*h,i,hg=new Float32Array(n);
  if(engr){var b=gb(a,w,h,2.4);for(i=0;i<n;i++)hg[i]=-b[i];}
  else{var p=gb(a,w,h,3.4),hb=gb(hi,w,h,1.2);for(i=0;i<n;i++)hg[i]=p[i]+1.0*hb[i];}
  hg=gb(hg,w,h,.9);
  var rel=new Uint8ClampedArray(n*4),lx=-.62,ly=-.62,lz=.48,hz=lz+1,hn=Math.sqrt(lx*lx+ly*ly+hz*hz),x,y,gx,gy,nx,ny,nn,d,sp,g;
  for(y=0;y<h;y++)for(x=0;x<w;x++){
    i=y*w+x;
    gx=(hg[y*w+Math.min(w-1,x+1)]-hg[y*w+Math.max(0,x-1)])/2;gy=(hg[Math.min(h-1,y+1)*w+x]-hg[Math.max(0,y-1)*w+x])/2;
    nx=-gx*k;ny=-gy*k;nn=Math.sqrt(nx*nx+ny*ny+1);
    d=(nx*lx+ny*ly+lz)/nn-lz;
    sp=Math.pow(clamp((nx*lx+ny*ly+hz)/nn/hn,0,1),30);
    g=clamp(.5+d*.95+sp*.3,0,1)*255;
    rel[i*4]=rel[i*4+1]=rel[i*4+2]=g;rel[i*4+3]=255;
  }
  var out={};
  out.rel=toUrl(w,h,function(dd){dd.set(rel);});
  var mask;
  if(engr){var e=gb(a,w,h,1.6);mask=new Float32Array(n);for(i=0;i<n;i++)mask[i]=clamp(Math.abs(a[i]-e[i])*3.2,0,1);}
  else mask=hi;
  out.hi=toUrl(w,h,function(dd){for(var j=0;j<n;j++){dd[j*4]=dd[j*4+1]=dd[j*4+2]=255;dd[j*4+3]=mask[j]*255;}});
  if(engr){ /* texto: miolo bronze escuro, como estampado no metal */
    out.fd=toUrl(w,h,function(dd){for(var j=0;j<n;j++){dd[j*4]=78;dd[j*4+1]=54;dd[j*4+2]=10;dd[j*4+3]=clamp(a[j]*1.4,0,1)*255*.93;}});
  }else if(src.gold){
    var fd=new Float32Array(n);for(i=0;i<n;i++)fd[i]=clamp(a[i]-hi[i],0,1);
    out.fd=toUrl(w,h,function(dd){for(var j=0;j<n;j++){dd[j*4]=dd[j*4+1]=dd[j*4+2]=10;dd[j*4+3]=fd[j]*255*fdOp;}});
  }
  return out;
}

function div(cls,st){var d=document.createElement('div');d.className=cls;if(st)d.style.cssText=st;return d;}

function buildFace(face,spec,o){
  var arts=[],cfg=INT[o.intensity]||INT.med;
  face.append(div('bc-rg'));
  function apply(src,engr){
    var L=layersFor(src,engr,engr?cfg.k*.45:cfg.k*.6,cfg.fd);
    if(L.fd){var f=div('bc-art bc-fd');f.style.backgroundImage='url('+L.fd+')';face.append(f);arts.push(f);}
    var r=div('bc-art bc-rel');r.style.backgroundImage='url('+L.rel+')';face.append(r);arts.push(r);
    var g=div('bc-art bc-glint');g.style.webkitMaskImage=g.style.maskImage='url('+L.hi+')';face.append(g);arts.push(g);
    if(o.onArt)o.onArt(arts);
  }
  if(spec.text){var s=fromCanvas(drawText(spec.text),false);apply(s,true);}
  else if(spec.src){
    var im=new Image();
    im.onload=function(){var s=fromCanvas(drawImg(im),!!spec.gold);s.gold=!!spec.gold;apply(s,false);};
    im.src=spec.src;
  }
  face.append(div('bc-sheen'));
  face.append(div('bc-shine'));
  return arts;
}

function make(host,opts){
  opts=opts||{};
  var tone=TONES[opts.tone]||TONES.gold,o={intensity:opts.intensity||'med'};
  host.classList.add('bc');host.style.setProperty('--bc',(opts.size||150)+'px');
  var coin=div('bc-coin');
  coin.style.setProperty('--bc-metal','conic-gradient(from 20deg,'+tone.m.concat(tone.m[0]).join(',')+')');
  coin.style.setProperty('--bc-e1',tone.e[0]);coin.style.setProperty('--bc-e2',tone.e[1]);coin.style.setProperty('--bc-e3',tone.e[2]);
  for(var k=-5;k<=5;k++)coin.append(div('bc-edge','transform:translateZ('+k+'px)'));
  var back=div('bc-face bc-back'),front=div('bc-face bc-front');
  coin.append(back,front);host.append(coin);
  var layers={front:[],back:[]},hooks={front:null,back:null};
  if(opts.back)layers.back=buildFace(back,opts.back,{intensity:o.intensity,onArt:function(a){if(hooks.back)hooks.back(a);}});
  if(opts.front)layers.front=buildFace(front,opts.front,{intensity:o.intensity,onArt:function(a){if(hooks.front)hooks.front(a);}});
  var ry=0,rx=0,vy=0,vx=0,drag=false,lx0=0,ly0=0,idleAt=0,raf=0,isLive=false,onOri=null,sh=null;
  function apply(){
    coin.style.transform='rotateY('+ry.toFixed(2)+'deg) rotateX('+rx.toFixed(2)+'deg)';
    var rel=ry-Math.round(ry/180)*180,rr=rx-Math.round(rx/180)*180;coin.style.setProperty('--bc-p',(60-rel*2.2+rr*1.2).toFixed(1)+'%');
  }
  function tick(){
    if(!isLive||!host.isConnected){raf=0;return;}
    var now=Date.now();
    if(!drag){
      var back=now>idleAt; /* 1 s depois de soltar, volta devagar para a frente (nivel), pelo caminho mais curto */
      if(Math.abs(vy)>.05||Math.abs(vx)>.05){ry+=vy;rx+=vx;var f=back?.9:.985;vy*=f;vx*=f;}
      if(back){
        var m=motion.ok&&motion.has,
          ty=Math.round(ry/360)*360+(m?clamp(motion.g,-30,30)*.9:0),tx=Math.round(rx/360)*360+(m?clamp((motion.b-40)*-.6,-20,20):0),
          sp=function(c,t){var d=t-c,st=d*.03;return c+(Math.abs(d)<.3?d:Math.abs(st)<.35?.35*(d<0?-1:1):st);};
        ry=sp(ry,ty);rx=sp(rx,tx);
      }
    }
    apply();raf=requestAnimationFrame(tick);
  }
  function down(e){if(!isLive)return;drag=true;vy=vx=0;lx0=e.clientX;ly0=e.clientY;try{host.setPointerCapture(e.pointerId);}catch(x){}}
  function move(e){if(!drag)return;var dx=e.clientX-lx0,dy=e.clientY-ly0;lx0=e.clientX;ly0=e.clientY;
    ry+=dx*.7;rx-=dy*.55;vy=dx*.7;vx=-dy*.55;spinSnd(Math.max(Math.abs(vy),Math.abs(vx)));}
  function spinSnd(v){ /* giro forte: som da moeda girando, volume pelo impulso */
    var n=Date.now();if(v<16||n-snd.last<3000)return;snd.last=n;sfx('spin',.3+Math.min(.6,(v-16)/40),1);}
  function up(){if(!drag)return;drag=false;idleAt=Date.now()+1000;spinSnd(Math.max(Math.abs(vy),Math.abs(vx)));}
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);
  host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  var ctl={coin:coin,host:host,front:front,back:back,
    layers:function(f){return layers[f];},
    onLayers:function(f,fn){hooks[f]=fn;if(layers[f].length)fn(layers[f]);},
    live:function(on){
      if(on&&!isLive){
        isLive=true;coin.style.animation='none';coin.style.transform='';
        host.querySelectorAll('.bc-shine').forEach(function(e){e.style.animation='none';e.style.opacity=0;});
        ry=0;rx=0;vy=vx=0;idleAt=Date.now()+600;
        onOri=function(e){if(e.gamma==null)return;motion.has=true;motion.g=e.gamma;motion.b=e.beta==null?40:e.beta;};
        window.addEventListener('deviceorientation',onOri);
        if(!raf)raf=requestAnimationFrame(tick);
      }else if(!on){isLive=false;if(onOri)window.removeEventListener('deviceorientation',onOri);}
    },
    destroy:function(){ctl.live(false);host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);}
  };
  return ctl;
}

/* iOS 13+ exige um toque do usuario para liberar o acelerometro; no Android nao pede nada */
function requestMotion(){
  if(motion.asked)return Promise.resolve(motion.ok);
  motion.asked=true;
  var D=window.DeviceOrientationEvent;
  if(D&&typeof D.requestPermission==='function'){
    return D.requestPermission().then(function(r){motion.ok=(r==='granted');return motion.ok;}).catch(function(){return false;});
  }
  motion.ok=!!D;return Promise.resolve(motion.ok);
}

window.BLCoin={make:make,requestMotion:requestMotion,TONES:TONES,sound:function(n,v){sfx(n,v==null?.6:v,1);}};
})();
