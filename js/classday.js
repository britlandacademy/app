/* Britland: "YOUR CLASS TODAY" card (post-class) + "I have a suggestion" gold sheet + class rating card.
   Public API: ClassDay.mount(box,{sb,es,onMedal})  (Home)   ClassDay.suggest({sb,es,from,to,onSent})  (Lessons, Home). */
(function(){
'use strict';
if(window.ClassDay)return;
var ES=/\/espanol\//.test(location.pathname),L=ES?1:0;
var RM=false;try{RM=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){}
var TX={
 next:['YOUR NEXT CLASS','TU PRÓXIMA CLASE'],stopped:['WHERE YOU STOPPED','DONDE TE QUEDASTE'],stopT:['Last paragraph and last word of the previous class','Último párrafo y última palabra de la clase anterior'],study:['WHAT WE WILL STUDY','LO QUE ESTUDIAREMOS'],rev:['Revision','Repaso'],revT:['The 10 paragraphs before your last word','Los 10 párrafos antes de tu última palabra'],newl:['New','Nuevo'],lesson:['Lesson','Lección'],prep:['PREPARE BEFORE CLASS','PREPÁRATE ANTES DE LA CLASE'],readL:['Read Lesson','Lee la lección'],audio:['Listen to the audio','Escucha el audio'],lchk:['Lesson Check','Lesson Check'],join:['Join the class','Entrar a la clase'],today:['Today','Hoy'],tmrw:['Tomorrow','Mañana'],
 tag:['YOUR CLASS TODAY','TU CLASE DE HOY'],studied:['WHAT WE STUDIED','LO QUE ESTUDIAMOS'],listen:['LISTEN AT HOME','ESCUCHA EN CASA'],
 btn:['I have a suggestion','Tengo una sugerencia'],forx:['For','Para'],par:['Par.','Párr.'],cls:['Class','Clase'],stage:['Stage','Etapa'],
 link:['LINK OR NAME','ENLACE O NOMBRE'],ph:['Paste a link or write the name','Pega un enlace o escribe el nombre'],cancel:['Cancel','Cancelar'],send:['Send','Enviar'],
 your:['your suggestion','tu sugerencia'],pend:['PENDING','PENDIENTE'],sent:['Sent. It will be reviewed before others see it.','Enviado. Lo revisaremos antes de que otros lo vean.'],
 medalK:['NEW MEDAL · BRONZE','NUEVA MEDALLA · BRONCE'],medalN:['Co-Teacher','Co-profesor'],medalT:['Your first suggestion. Thanks for helping us make the class more interesting!','Tu primera sugerencia. ¡Gracias por ayudarnos a hacer la clase más interesante!'],great:['Great!','¡Genial!']
};
var KINDS=[['song',['Song','Canción']],['video',['Video','Vídeo']],['film',['Film','Película']],['series',['Series','Serie']],['podcast',['Podcast','Pódcast']],['text',['Reading','Lectura']],['game',['Game','Juego']],['activity',['Activity','Actividad']]];
function t(k){return TX[k][L];}
var IC={
 song:'<svg class="i" viewBox="0 0 24 24"><path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>',
 video:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M10.2 9.4v5.2l4.4-2.6z"/></svg>',
 film:'<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="9.5" width="17" height="10" rx="2"/><path d="M3.8 9.5l-.6-3.8 15.4-2.4.6 3.8M8 7.1l1.6 2.4M12.6 6.3l1.6 2.4"/></svg>',
 series:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="12" rx="2.5"/><path d="M8 21h8M12 17.5V21"/></svg>',
 podcast:'<svg class="i" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/></svg>',
 text:'<svg class="i" viewBox="0 0 24 24"><path d="M6 3.5h9l3 3v14H6z"/><path d="M9 8h3M9 11.5h6M9 15h6"/></svg>',
 game:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 10.8v3.4M6.3 12.5h3.4"/><circle cx="15.5" cy="11.8" r=".8"/><circle cx="17.5" cy="13.6" r=".8"/></svg>',
 activity:'<svg class="i" viewBox="0 0 24 24"><path d="M4 20.5h16"/><path d="M4 18l1-3.5L15.5 4a2 2 0 013 3L8 17.5z"/><path d="M13.5 6l3 3"/></svg>',
 warn:'<svg class="i" viewBox="0 0 24 24"><path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.5v.1"/></svg>',
 bm:'<svg class="i" viewBox="0 0 24 24"><path d="M6.5 3.5h11v17L12 16.5l-5.5 4z"/></svg>',
 rf:'<svg class="i" viewBox="0 0 24 24"><path d="M19 11a7 7 0 00-12.5-3.5M5 4v4h4"/><path d="M5 13a7 7 0 0012.5 3.5M19 20v-4h-4"/></svg>',
 bk:'<svg class="i" viewBox="0 0 24 24"><path d="M12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5z"/><path d="M12 6C9.5 4.5 6.5 4.5 4 5.5V19c2.5-1 5.5-1 8 .5z"/></svg>',
 hp:'<svg class="i" viewBox="0 0 24 24"><path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/></svg>',
 ckb:'<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M7.5 12.5l3.2 3.2L17 8.5"/></svg>',
 plus:'<svg class="i" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M12 5v14M5 12h14"/></svg>',
 ck:'<svg class="i" viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg>',
 star:'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 16.7 6.6 19.6l1.2-6L3.3 9.4l6.1-.8z"/></svg>',
 coin:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 9.5v5M10.2 11h2.6a1 1 0 010 2h-2"/></svg>',
 bulb:'<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z"/><path d="M12 8v3M10.5 9.5H13.5" stroke-width="1.6"/></svg>'};
var CSS='.cd{position:relative;overflow:hidden;margin:0 0 14px;padding:20px;border:1px solid var(--line,#32457a);border-radius:16px;background:#1a2a52;color:#f3f4f6;isolation:isolate}'+
'.cd *{box-sizing:border-box}.cd svg.i,.cdsheet svg.i{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}'+
'.cd .fcv{position:absolute;top:0;right:0;width:68%;height:52%;z-index:0;pointer-events:none;-webkit-mask-image:radial-gradient(120% 120% at 100% 0,#000 25%,transparent 72%);mask-image:radial-gradient(120% 120% at 100% 0,#000 25%,transparent 72%);opacity:.95}'+
'.cd>*:not(.fcv){position:relative;z-index:1}'+
'.cd .tag{display:inline-block;background:#c4414f;color:#fff;border-radius:99px;padding:3px 12px;font-size:.74rem;font-weight:800;letter-spacing:.08em}.cd .tag.gold{background:#d9ae3a;color:#12234a}'+
'.cd h3{font-family:Georgia,serif;font-size:1.35rem;margin:12px 0 4px}'+
'.cd .wn{display:flex;gap:10px;align-items:flex-start;border-left:4px solid #d9ae3a;background:rgba(217,174,58,.12);border-radius:0 12px 12px 0;padding:10px 12px;margin:12px 0 0;font-size:.93rem;line-height:1.4}.cd .wn svg.i{width:22px;height:22px;color:#d9ae3a}.cd .act{margin:10px 0 0;color:#cdd5ea;font-size:.92rem;line-height:1.4}.cd .act b{color:#f0c36a}'+
'.cd .pl{display:flex;align-items:center;gap:12px;background:#223566;border:1px solid #32457a;border-radius:14px;padding:10px 12px;margin:6px 0}.cd .pl button{width:44px;height:44px;border-radius:50%;border:0;background:#d9ae3a;color:#12234a;display:grid;place-items:center;flex:none;cursor:pointer;padding:0}.cd .pl button svg{width:20px;height:20px;fill:currentColor;stroke:none}.cd .pl b{font-family:Georgia,serif}.cd .pl .pm{color:#a9b4cf}.cd .pl .tr{height:5px;border-radius:9px;background:#32457a;margin-top:6px;overflow:hidden}.cd .pl .tr div{height:100%;width:0;background:#d9ae3a}'+
'.cd .cdf{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid #32457a;color:#a9b4cf;font-size:.9rem}.cd .cdf b{color:#f0c36a;font-size:1.1rem}.cd .cdf .bl-red,.cd .cdf .bl-gold{display:flex;align-items:center;justify-content:center;gap:8px;box-sizing:border-box;border-radius:99px;font:800 .85rem/1 system-ui,sans-serif;padding:0 16px;cursor:pointer;text-decoration:none}.cd .cdf .bl-gold{min-height:46px;border:0;background:#d9ae3a;color:#12234a;box-shadow:none}.cd .cdf .bl-red{width:auto;min-height:38px;background:transparent;border:2px solid #d9ae3a;color:#f3f4f6;box-shadow:none;text-transform:none;letter-spacing:0;font-size:.85rem}.cd .cdf .bl-gold{flex-basis:100%;width:100%}'+
'.cd .sec{border-top:1px solid #32457a;margin-top:14px;padding-top:12px}.cd .k{font-size:.72rem;letter-spacing:.1em;color:#a9b4cf;font-weight:700;margin-bottom:6px}'+
'.cd .song{display:flex;align-items:center;gap:12px;background:#223566;border:1px solid #32457a;border-radius:14px;padding:10px 12px;margin:6px 0;text-decoration:none;color:inherit;width:100%;font:inherit;text-align:left}'+
'.cd a.song{cursor:pointer}.cd .song .ic2{width:42px;height:42px;border-radius:12px;background:#2a3d73;display:grid;place-items:center;color:#d9ae3a;flex:none}'+
'.cd a.song,.cd .song b,.cd .pin b,.cd .pl b,.cd h3{color:#f3f4f6}.cd .song b{display:block;font-family:Georgia,serif;font-size:1.05rem;overflow-wrap:anywhere}.cd .song small{color:#a9b4cf}.cd .song .pd{margin-left:auto;font-size:.72rem;font-weight:800;color:#f0c36a;background:rgba(240,195,106,.14);border-radius:99px;padding:2px 9px}'+
'.cd .pin{display:flex;align-items:center;gap:12px;background:rgba(217,174,58,.14);border:1px solid #d9ae3a;border-radius:14px;padding:10px 12px;margin:6px 0}.cd .pin .ic2{width:42px;height:42px;border-radius:12px;background:#2a3d73;display:grid;place-items:center;color:#d9ae3a;flex:none}.cd .pin b{display:block;font-family:Georgia,serif;font-size:1.05rem}.cd .pin small{color:#a9b4cf}.cd a.go{text-decoration:none;width:100%;margin-top:12px;min-height:52px}'+
'.cd .row,.cdsheet .row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}'+
'.cd .btn,.cdsheet .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:46px;padding:0 22px;border-radius:99px;border:2px solid #d9ae3a;background:transparent;color:#f3f4f6;font:inherit;font-weight:800;cursor:pointer}'+
'.cd .btn.g{background:#d9ae3a;color:#12234a}.cd .btn:disabled,.cdsheet .btn:disabled{opacity:.45;cursor:default}'+
'.cd .btn.glow{position:relative;overflow:hidden;background:rgba(217,174,58,.14);animation:cdpulse 2s infinite}'+
'.cd .btn.glow::after{content:"";position:absolute;top:-30%;left:-60%;width:40%;height:160%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:rotate(20deg);animation:cdshn 3.2s ease-in-out infinite}'+
'@keyframes cdpulse{0%,100%{box-shadow:0 0 0 0 rgba(217,174,58,.5)}50%{box-shadow:0 0 0 9px rgba(217,174,58,0)}}@keyframes cdshn{0%,55%{left:-60%}100%{left:130%}}'+
'.cdr{position:relative;overflow:hidden;border-radius:20px;padding:22px 18px;margin:0 0 14px;background:linear-gradient(150deg,#2b4290 0%,#1a2a52 55%,#3a2f63 100%);border:2px solid #d9ae3a;color:#f3f4f6;animation:cdglow 3s infinite}'+
'@keyframes cdglow{0%,100%{box-shadow:0 0 0 0 rgba(217,174,58,0),0 10px 30px rgba(0,0,0,.35)}50%{box-shadow:0 0 22px 2px rgba(217,174,58,.35),0 10px 30px rgba(0,0,0,.35)}}'+
'.cdr *{box-sizing:border-box}.cdr .tag{display:inline-block;background:#d9ae3a;color:#12234a;border-radius:99px;padding:3px 12px;font-size:.74rem;font-weight:800;letter-spacing:.08em}'+
'.cdr h3{font-family:Georgia,serif;font-size:1.6rem;margin:10px 0 0}.cdr .hint{color:#a9b4cf;font-size:.88rem;margin:2px 0 0}'+
'.cdr .prog{display:flex;gap:6px;margin:10px 0 12px}.cdr .prog i{flex:1;height:6px;border-radius:9px;background:#32457a;transition:background .3s}.cdr .prog i.on{background:#d9ae3a}'+
'.cdr .k{font-size:.72rem;letter-spacing:.1em;color:#a9b4cf;font-weight:700;margin:12px 0 6px}'+
'.cdr .chip{display:flex;align-items:center;gap:8px;width:100%;min-height:52px;padding:0 14px;border-radius:99px;border:2px solid #32457a;background:rgba(255,255,255,.06);color:#f3f4f6;font:inherit;font-weight:700;font-size:1rem;margin:6px 0;cursor:pointer;text-align:left}'+
'.cdr .chip.on{background:rgba(217,174,58,.25);border-color:#d9ae3a}.cdr .chip svg.i{width:18px;height:18px;color:#d9ae3a;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.cdr .chip .dot{width:20px;height:20px;border-radius:50%;border:2px solid #a9b4cf;flex:none}'+
'.cdr .frow{display:flex;justify-content:space-between;gap:4px;margin:6px 0 2px}.cdr .fb{flex:1;aspect-ratio:1;max-width:68px;border:0;background:transparent;padding:2px;cursor:pointer;transition:transform .25s cubic-bezier(.3,1.7,.5,1),opacity .2s,filter .2s}'+
'.cdr .fb svg{width:100%;height:100%;display:block}.cdr .fb:hover{transform:translateY(-4px) scale(1.08)}.cdr .fb.dim{opacity:.4;filter:grayscale(.5);transform:scale(.88)}.cdr .fb.sel{transform:scale(1.28);animation:cdsel .9s ease-in-out infinite}'+
'@keyframes cdsel{0%,100%{rotate:0deg}30%{rotate:-8deg}70%{rotate:8deg}}'+
'.cdr .flab{text-align:center;min-height:30px;margin-top:8px}.cdr .flab b{font-family:Georgia,serif;font-size:1.3rem;color:#d9ae3a;display:inline-block}.cdr .mu2{color:#a9b4cf;font-size:.88rem}'+
'.cdr .rw{margin-top:14px;padding:10px 12px;border-radius:14px;background:rgba(0,0,0,.25);font-size:.85rem}.cdr .rw span{float:right;color:#d9ae3a;font-weight:700}.cdr .rw .bar{height:7px;border-radius:9px;background:#32457a;margin-top:8px;overflow:hidden}.cdr .rw .bar i{display:block;height:100%;background:#d9ae3a;border-radius:9px}'+
'.cdr .btn{display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:54px;margin-top:14px;padding:0 22px;border-radius:99px;border:2px solid #d9ae3a;background:#d9ae3a;color:#12234a;font:inherit;font-weight:800;font-size:1.05rem;cursor:pointer}.cdr .btn:disabled{opacity:.45;cursor:default}.cdr .btn:not(:disabled){animation:cdpulse 2s infinite}'+
'.cdr .thx{text-align:center;padding:6px 0 4px}.cdr .thx svg{width:92px;height:92px}.cdr .thx h3{margin:8px 0 2px}'+
'.cdr .stp .chip.in{animation:cdslide .35s ease both}@keyframes cdslide{from{opacity:0;transform:translateY(8px)}}'+
'.cdr .f1 svg{animation:cdf1 1.6s ease-in-out infinite}.cdr .f2 svg{animation:cdf2 2.2s ease-in-out infinite}.cdr .f3 svg{animation:cdf3 2.4s ease-in-out infinite}.cdr .f4 svg{animation:cdf4 1.2s ease-in-out infinite}.cdr .f5 svg{animation:cdf5 1s ease-in-out infinite}'+
'@keyframes cdf1{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateX(-3px) rotate(-4deg)}75%{transform:translateX(3px) rotate(4deg)}50%{transform:translateY(3px)}}@keyframes cdf2{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg) translateY(2px)}}@keyframes cdf3{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}@keyframes cdf4{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-7px) scale(1.07)}}@keyframes cdf5{0%,100%{transform:translateY(0) scale(1) rotate(0)}30%{transform:translateY(-12px) scale(1.15) rotate(-8deg)}60%{transform:translateY(-4px) scale(1.08) rotate(8deg)}}'+
'.cdcf{position:absolute;top:30%;width:9px;height:14px;border-radius:2px;opacity:0;animation:cdcf 1.3s ease-out forwards;pointer-events:none;z-index:5}@keyframes cdcf{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--x),var(--y)) rotate(var(--r))}}'+
/* gold sheet */
'.cdov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center;z-index:200}'+
'.cdsheet{position:relative;overflow:hidden;width:100%;max-width:440px;max-height:92vh;overflow-y:auto;border-radius:22px 22px 0 0;padding:92px 18px calc(22px + env(safe-area-inset-bottom,0px));text-align:center;color:#2a1a02;border-top:2px solid #fff3b0;box-shadow:0 -10px 40px rgba(217,174,58,.35);animation:cdup .25s ease;'+
'background:repeating-linear-gradient(90deg,rgba(255,255,255,0) 0 2px,rgba(255,255,255,.13) 2px 3px,rgba(60,35,0,.07) 3px 4px),radial-gradient(120% 90% at 50% 0,#fff2b8 0%,#e5b948 35%,#a8741a 100%)}'+
'@keyframes cdup{from{transform:translateY(40px);opacity:0}}'+
'.cdsheet::before{content:"";position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.012 0.9\' numOctaves=\'3\' seed=\'4\'/><feColorMatrix values=\'0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .75  0 0 0 .55 0\'/></filter><rect width=\'300\' height=\'300\' filter=\'url(%23n)\'/></svg>");mix-blend-mode:soft-light;opacity:.9}'+
'.cdsheet *{box-sizing:border-box}.cdsheet>*{position:relative}.cdsheet h3{margin:0;font-family:Georgia,serif;font-size:1.3rem;color:#2a1a02}.cdsheet .hint{color:#4a3208;font-size:.95rem;line-height:1.45;margin:6px 0 0}.cdsheet .k{font-size:.72rem;letter-spacing:.1em;font-weight:700;color:#4a3208;margin:10px 0 4px;text-align:left}'+
'.cdsheet .seal{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:74px;height:74px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff2b8,#c8921f);border:3px solid #fff3b0;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0,0,0,.35);color:#12234a}'+
'.cdsheet .seal svg{width:36px;height:36px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'+
'.cdsheet .sp{position:absolute;width:10px;height:10px;background:#fff;clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);animation:cdtw 2.2s ease-in-out infinite;opacity:0}@keyframes cdtw{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1) rotate(90deg)}}'+
'.cdsheet .worth{display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0 2px;font-weight:800;font-size:.9rem;color:#12234a}.cdsheet .worth svg{width:22px;height:22px;fill:none;stroke:#12234a;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'+
'.cdsheet .for{margin:6px 0 0;font-size:.88rem;color:#4a3208}'+
'.cdsheet .ty{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.cdsheet .ty button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 2px;border:2px solid rgba(42,26,2,.45);border-radius:14px;background:rgba(255,255,255,.18);color:#2a1a02;font:inherit;font-weight:700;font-size:.78rem;cursor:pointer}'+
'.cdsheet .ty button.on{background:#12234a;border-color:#12234a;color:#f6d27a}'+
'.cdsheet input.f{display:block;width:100%;min-height:48px;border:2px solid rgba(42,26,2,.45);border-radius:12px;background:rgba(255,248,220,.55);color:#2a1a02;padding:0 12px;font:inherit;margin:6px 0}.cdsheet input.f::placeholder{color:#6b5320}.cdsheet input.f:focus{outline:none;border-color:#12234a}'+
'.cdsheet .row{justify-content:center}.cdsheet .btn{border-color:#12234a;color:#12234a;background:transparent}.cdsheet .btn.g{background:#12234a;color:#f6d27a}'+
'.cdmd{position:fixed;inset:0;background:rgba(0,0,0,.65);display:grid;place-items:center;z-index:300;padding:16px}.cdmc{width:100%;max-width:340px;text-align:center;background:linear-gradient(160deg,#2b4290,#1a2a52 60%,#3a2f63);border:2px solid #d9ae3a;border-radius:22px;padding:26px 20px;position:relative;overflow:hidden;color:#f3f4f6}'+
'.cdmc .k{color:#d9ae3a;font-size:.72rem;letter-spacing:.1em;font-weight:700}.cdmb{width:104px;height:104px;margin:10px auto;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#f6d27a,#b9791f);box-shadow:0 0 0 6px rgba(217,174,58,.25),0 0 40px rgba(217,174,58,.55);color:#12234a}'+
'.cdmb svg{width:54px;height:54px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.cdmc h3{font-family:Georgia,serif;font-size:1.6rem;margin:6px 0 4px}.cdmc p{margin:0 0 16px;color:#a9b4cf}'+
'.cdmc .btn{min-height:46px;padding:0 22px;border-radius:99px;border:2px solid #d9ae3a;background:#d9ae3a;color:#12234a;font:inherit;font-weight:800;cursor:pointer}'+
'.cdtoast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#0b1733;border:1px solid #d9ae3a;color:#f3f4f6;padding:10px 18px;border-radius:99px;font-weight:700;z-index:400;max-width:calc(100% - 32px);text-align:center}'+
'@media(prefers-reduced-motion:reduce){.cd *,.cdr *,.cdsheet *,.cdsheet,.cdr{animation:none!important;transition:none!important}}';
function css(){if(document.getElementById('cd-css'))return;var s=document.createElement('style');s.id='cd-css';s.textContent=CSS;document.head.appendChild(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function toast(m){var e=document.createElement('div');e.className='cdtoast';e.setAttribute('role','status');e.textContent=m;document.body.appendChild(e);setTimeout(function(){e.remove();},2600);}
function boom(c,n){if(RM||!c)return;var col=['#d9ae3a','#fff','#c4414f','#7fb2ff'];for(var i=0;i<(n||26);i++){var e=document.createElement('i');e.className='cdcf';e.style.left=(15+Math.random()*70)+'%';e.style.background=col[i%4];e.style.setProperty('--x',(Math.random()*200-100)+'px');e.style.setProperty('--y',(Math.random()*260+40)+'px');e.style.setProperty('--r',(Math.random()*720-360)+'deg');e.style.animationDelay=(Math.random()*.2)+'s';c.appendChild(e);}setTimeout(function(){Array.prototype.forEach.call(c.querySelectorAll('.cdcf'),function(x){x.remove();});},2200);}
/* ---------- lion faces ---------- */
var FM={1:'Poxa…',2:'Podia ser melhor',3:'Foi ok',4:'Gostei!',5:'Adorei!'};
function lion(r){
 var id='cdl'+r,sc='';
 for(var i=0;i<12;i++){var a=i*Math.PI/6;sc+='<circle cx="'+(64+47*Math.cos(a)).toFixed(1)+'" cy="'+(68+47*Math.sin(a)).toFixed(1)+'" r="15" fill="url(#'+id+'m)"/>';}
 var star=function(x){return '<path transform="translate('+x+' 62)" d="M0-9l2.6 5.8 6.3.7-4.7 4.2 1.4 6.2L0 4.6-5.6 7.9l1.4-6.2-4.7-4.2 6.3-.7z" fill="#ef4444" stroke="#fbbf24" stroke-width="1.6" stroke-linejoin="round"/>';};
 var E={
 1:'<path d="M42 62q7-1 14-6M72 56q7 5 14 6" fill="none" stroke="#5a2e12" stroke-width="3" stroke-linecap="round"/><ellipse cx="49" cy="67" rx="5" ry="6" fill="#3a1d0b"/><ellipse cx="79" cy="67" rx="5" ry="6" fill="#3a1d0b"/><circle cx="47.5" cy="65" r="1.8" fill="#fff"/><circle cx="77.5" cy="65" r="1.8" fill="#fff"/><path d="M45 74q-4 7 0 10q4-3 0-10z" fill="#5bb8f5"/>',
 2:'<path d="M42 61q7 0 14-4M72 57q7 4 14 4" fill="none" stroke="#5a2e12" stroke-width="3" stroke-linecap="round"/><ellipse cx="49" cy="67" rx="5" ry="6" fill="#3a1d0b"/><ellipse cx="79" cy="67" rx="5" ry="6" fill="#3a1d0b"/><circle cx="47.5" cy="65" r="1.8" fill="#fff"/><circle cx="77.5" cy="65" r="1.8" fill="#fff"/>',
 3:'<ellipse cx="49" cy="67" rx="5" ry="6" fill="#3a1d0b"/><ellipse cx="79" cy="67" rx="5" ry="6" fill="#3a1d0b"/><circle cx="47.5" cy="65" r="1.8" fill="#fff"/><circle cx="77.5" cy="65" r="1.8" fill="#fff"/>',
 4:'<path d="M42 68q7-9 14 0M72 68q7-9 14 0" fill="none" stroke="#3a1d0b" stroke-width="4" stroke-linecap="round"/><ellipse cx="42" cy="80" rx="6" ry="4" fill="#ff8a7a" opacity=".55"/><ellipse cx="86" cy="80" rx="6" ry="4" fill="#ff8a7a" opacity=".55"/>',
 5:star(49)+star(79)+'<ellipse cx="42" cy="82" rx="6" ry="4" fill="#ff8a7a" opacity=".55"/><ellipse cx="86" cy="82" rx="6" ry="4" fill="#ff8a7a" opacity=".55"/>'};
 var M={
 1:'<path d="M54 95q10-10 20 0" fill="none" stroke="#5a2e12" stroke-width="3.2" stroke-linecap="round"/>',
 2:'<path d="M55 93q9-7 18 0" fill="none" stroke="#5a2e12" stroke-width="3.2" stroke-linecap="round"/>',
 3:'<path d="M56 90h16" fill="none" stroke="#5a2e12" stroke-width="3.2" stroke-linecap="round"/>',
 4:'<path d="M64 80v5M52 86q6 9 12 0q6 9 12 0" fill="none" stroke="#5a2e12" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
 5:'<path d="M64 80v4M50 85h28q0 20-14 20t-14-20z" fill="#7a2a1a" stroke="#5a2e12" stroke-width="2.6" stroke-linejoin="round"/><path d="M57 99q7-8 14 0q-7 6-14 0z" fill="#ff7a8a"/>'};
 return '<defs><radialGradient id="'+id+'m" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#d9822b"/><stop offset="1" stop-color="#8f4a14"/></radialGradient><radialGradient id="'+id+'f" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#f2a22a"/></radialGradient></defs>'
 +'<circle cx="28" cy="32" r="12" fill="#f2a22a"/><circle cx="100" cy="32" r="12" fill="#f2a22a"/><circle cx="28" cy="32" r="6" fill="#e88a5a"/><circle cx="100" cy="32" r="6" fill="#e88a5a"/>'
 +sc+'<circle cx="64" cy="68" r="43" fill="url(#'+id+'m)"/><circle cx="64" cy="70" r="36" fill="url(#'+id+'f)"/><ellipse cx="64" cy="86" rx="19" ry="14" fill="#fff3cf"/><path d="M57 74q7-5 14 0q-2 8-7 8t-7-8z" fill="#6b3a1e"/>'+E[r]+M[r];
}
var EM={};[1,2,3,4,5].forEach(function(r){EM[r]=lion(r);});
var RV={1:['Sentimos muito. O que aconteceu?',['Não entendi a aula','Ritmo muito rápido','Problema técnico','A aula não foi útil','Me senti perdido(a)'],'Que pena! Vamos conversar para melhorar.'],2:['O que podemos melhorar?',['Ritmo muito rápido','Ritmo muito lento','Conteúdo difícil','Pouca conversação','Problema técnico'],'Obrigado pelo retorno! Vamos melhorar.'],3:['O que deixaria a aula melhor?',['Mais conversação','Mais exemplos','Mais revisão','Outro ritmo','Mais material'],'Obrigado! Vamos ajustar a próxima aula.'],4:['O que foi bom?',['Explicações claras','Conversação','Ritmo bom','Material e sugestões','Correções úteis'],'Que bom que você gostou! Continue assim.'],5:['O que foi incrível?',['Entendi tudo','Me senti confiante','Aula divertida','Aprendi muito','Material e sugestões'],'Excelente! Você está evoluindo muito.']};
/* ---------- waving flag (vector, drawn on a canvas) ---------- */
var UK='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="1200" height="600"><clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>';
var SPAIN='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="1200" height="600"><rect width="60" height="30" fill="#AA151B"/><rect y="7.5" width="60" height="15" fill="#F1BF00"/></svg>';
var src=null,srcReady=false;
function loadFlag(){if(src)return;src=document.createElement('canvas');src.width=1200;src.height=600;var im=new Image();im.onload=function(){src.getContext('2d').drawImage(im,0,0,1200,600);srcReady=true;};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(ES?SPAIN:UK);}
function drawFlag(c,tm){
 var dpr=Math.min(2,window.devicePixelRatio||1),cw=c.clientWidth,ch=c.clientHeight;if(!cw||!ch)return;
 if(c.width!==Math.round(cw*dpr)||c.height!==Math.round(ch*dpr)){c.width=Math.round(cw*dpr);c.height=Math.round(ch*dpr);}
 var g=c.getContext('2d'),W=c.width,H=c.height;g.clearRect(0,0,W,H);
 var fh=H*1.25,fw=fh*2;if(fw<W*1.25){fw=W*1.25;fh=fw/2;}var ox=(W-fw)/2,oy=(H-fh)/2;
 var amp=(.02+.5*.07)*fh,step=Math.max(1,Math.round(dpr)),sw=src.width/fw*step,ph=2*Math.PI*tm/3.2;
 for(var x=0;x<fw;x+=step){
  var u=x/fw,a=amp*(.15+.85*u),k1=2*Math.PI*1.35,k2=2*Math.PI*2.7,p1=k1*u-ph,p2=k2*u-2*ph+1.2;
  var dy=a*(Math.sin(p1)+.35*Math.sin(p2)),slope=a*(k1*Math.cos(p1)+.35*k2*Math.cos(p2))/fw;
  var sc=1-Math.min(.06,Math.abs(slope)*.3)-.015*u*Math.sin(p1),h=fh*sc,y=oy+dy+(fh-h)/2;
  g.drawImage(src,x/fw*src.width,0,sw,src.height,ox+x,y,step+.6,h);
  var sh=-slope*2.6*(.35+u);g.fillStyle=sh>0?'rgba(255,255,255,'+Math.min(.22,sh*.35)+')':'rgba(0,0,20,'+Math.min(.34,-sh*.5)+')';g.fillRect(ox+x,y,step+.6,h);
 }
}
function animate(c){loadFlag();(function f(ms){if(!c.isConnected)return;if(srcReady)drawFlag(c,RM?.4:ms/1000);if(!RM)requestAnimationFrame(f);else if(!srcReady)setTimeout(function(){f(0);},120);})(0);}
/* ---------- gold sheet ---------- */
function suggest(o){
 css();var sb=o.sb,ti=0,ov=document.createElement('div');ov.className='cdov';
 var range=(o.from?((o.title?' · ':' ')+t('par')+' '+o.from+(o.to&&o.to!==o.from?'–'+o.to:'')):'');
 ov.innerHTML='<div class="cdsheet" role="dialog" aria-modal="true" aria-labelledby="cdh"><div class="seal" aria-hidden="true">'+IC.star+'</div><i class="sp" style="left:12%;top:20px"></i><i class="sp" style="left:84%;top:34px;animation-delay:.7s"></i><i class="sp" style="left:26%;top:80px;animation-delay:1.3s"></i><i class="sp" style="left:70%;top:90px;animation-delay:.3s"></i>'
 +'<h3 id="cdh">Sua ideia faz a aula melhor</h3><p class="hint">Você conhece a sua aula melhor do que ninguém. Conta pra gente uma música, um vídeo, um filme ou uma atividade que você gostaria de ver aqui. Obrigado por ajudar a construir a aula com a gente!</p>'
 +'<div class="worth">'+IC.coin+'Sua ideia vale ouro.</div>'+(range?'<p class="for">'+esc(t('forx')+(o.title?' '+o.title:'')+range)+'</p>':'')
 +'<div class="ty" id="cdty"></div><div class="k">'+t('link')+'</div><input class="f" id="cdln" maxlength="300" placeholder="'+esc(t('ph'))+'" autocomplete="off">'
 +'<div class="row"><button class="btn" id="cdcn" type="button">'+t('cancel')+'</button><button class="btn g" id="cdsn" type="button" disabled>'+t('send')+'</button></div></div>';
 document.body.appendChild(ov);
 var $=function(i){return ov.querySelector('#'+i);},prevFocus=document.activeElement;
 function close(){ov.remove();document.removeEventListener('keydown',kd);try{prevFocus&&prevFocus.focus&&prevFocus.focus();}catch(e){}}
 function kd(e){if(e.key==='Escape')close();}
 document.addEventListener('keydown',kd);
 function ty(){$('cdty').innerHTML=KINDS.map(function(k,i){return '<button type="button" data-t="'+i+'" aria-pressed="'+(i===ti)+'" class="'+(i===ti?'on':'')+'">'+IC[k[0]]+k[1][L]+'</button>';}).join('');Array.prototype.forEach.call($('cdty').querySelectorAll('button'),function(b){b.onclick=function(){ti=+b.dataset.t;ty();};});}
 ty();
 $('cdln').oninput=function(){$('cdsn').disabled=!$('cdln').value.trim();};
 $('cdcn').onclick=close;ov.onclick=function(e){if(e.target===ov)close();};
 $('cdsn').onclick=function(){var b=this,v=$('cdln').value.trim();if(!v)return;b.disabled=true;
  Promise.resolve(sb.rpc('submit_suggestion',{p_kind:KINDS[ti][0],p_title:v,p_lesson:null,p_from:o.from||0,p_to:o.to||o.from||0})).then(function(r){
   if(r&&r.error){b.disabled=false;toast(r.error.message||'Error');return;}
   close();countMine(sb).then(function(n){if(n===1)boom(document.body.appendChild(Object.assign(document.createElement('div'),{className:'cdfx',style:'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden'})),40),setTimeout(function(){var f=document.querySelector('.cdfx');f&&f.remove();},2600);else toast(t('sent'));medalsRefresh();if(o.onSent)o.onSent();});
  },function(){b.disabled=false;});};
 setTimeout(function(){try{$('cdln').focus();}catch(e){}},60);
}
function countMine(sb){return Promise.resolve(sb.from('class_suggestions').select('id',{count:'exact',head:true})).then(function(r){return (r&&r.count)||0;},function(){return 0;});}
function medalsRefresh(){try{if(window.Medals&&Medals.reload)Medals.reload();}catch(e){}}
function medal(){var m=document.createElement('div');m.className='cdmd';m.innerHTML='<div class="cdmc" role="dialog" aria-modal="true"><div class="k">'+t('medalK')+'</div><div class="cdmb" aria-hidden="true">'+IC.bulb+'</div><h3>'+t('medalN')+'</h3><p>'+t('medalT')+'</p><button class="btn" type="button">'+t('great')+'</button></div>';var b=m.querySelector('button');b.onclick=function(){m.remove();};document.body.appendChild(m);b.focus();boom(m.querySelector('.cdmc'),30);}
/* ---------- Home card ---------- */
/* shows for 48 h after a class; one-off: every class given since Mon 9 Nov 2026 stays visible until Sun 15 Nov (launch week) */
function isFresh(iso){var t=new Date(iso).getTime(),n=Date.now();return n-t<48*3600e3||(t>=Date.UTC(2026,10,9,3)&&n<Date.UTC(2026,10,16,3));}
function mount(box,o){
 if(!box||!o||!o.sb)return;css();var sb=o.sb;
 var P=function(q){return Promise.resolve(q).then(function(r){return r&&!r.error?r.data:null;},function(){return null;});};
 Promise.all([P(sb.rpc('my_last_class')),o.uid?P(sb.from('plan_progress').select('stage,lesson,data').eq('user_id',o.uid).maybeSingle()):null,o.uid?P(sb.from('lessons').select('start_at,end_at,meet_url').eq('user_id',o.uid).gte('end_at',new Date().toISOString()).order('start_at').limit(1)):null]).then(function(a){
  var c=a[0]&&a[0][0],fresh=!!c&&isFresh(c.given_at),pre=preOf(a[1],a[2]&&a[2][0],o);
  if(!pre&&!fresh)return;
  if(!fresh)c=null;
  var from=c?(c.par_from||c.par_to):0,to=c?(c.par_to||from):0;
  if(pre&&(pre.near||!fresh))return build(box,o,c,from,to,[],pre);
  Promise.resolve(sb.rpc('list_suggestions',{p_from:from,p_to:to})).then(function(s){build(box,o,c,from,to,(s&&s.data)||[],null,pre);},function(){build(box,o,c,from,to,[],null,pre);});
 });
}
/* next class (before it starts): data comes from the plan row (plan-sync) and the student's next lesson */
function todoOf(row,o,L,St){
 var d=row.data||{},me=d.me||{},ms=me.missed||[],up=(o&&o.upto)||0,done={lc:{},gr:{},wb:{}};
 ((o&&o.attempts)||[]).forEach(function(a){if(a.k==='check')done.lc[a.l]=1;else if(a.k==='ex'){if(/^wb/.test(String(a.e)))done.wb[a.l]=1;else done.gr[a.l]=1;}});
 var so=function(n){return (window.Covers&&Covers.stageOf)?Covers.stageOf(n):St;},it=[],ex=[],seen={};
 if(L>1)it.push({k:'lc',n:L-1,d:done.lc[L-1],h:'check.html?stage='+so(L-1)+'&lesson='+(L-1)});
 it.push({k:'lc',n:L,d:done.lc[L],h:'check.html?stage='+so(L)+'&lesson='+L});
 if(!ES){it.push({k:'gr',n:L,d:done.gr[L],h:'exercises.html?lesson='+L});it.push({k:'wb',n:L,d:done.wb[L],h:'workbook.html?lesson='+L});}
 ms.slice().reverse().forEach(function(m){var M=m.lesson;if(!M||m.conversation||M>=L||seen[M]||(up>0&&M>up))return;seen[M]=1;
  if(!ES&&!done.gr[M])ex.push({k:'gr',n:M,miss:1,h:'exercises.html?lesson='+M});if(!ES&&!done.wb[M])ex.push({k:'wb',n:M,miss:1,h:'workbook.html?lesson='+M});});
 var O={lc:0,gr:1,wb:2},r=ex.concat(it).filter(function(x){return !x.d;}).sort(function(a,b){return a.n-b.n||O[a.k]-O[b.k];}).slice(0,2);
 if(r.length<2)it.filter(function(x){return x.d;}).sort(function(a,b){return b.n-a.n||O[a.k]-O[b.k];}).slice(0,2-r.length).forEach(function(x){x.redo=1;r.push(x);});
 return r;
}
function preOf(row,ls,o){
 if(!row||!row.data)return null;var d=row.data,nx=d.nextClass,cp=d.currentPosition||{},me=d.me||{};ls=ls||null;
 var ms=ls?new Date(ls.start_at).getTime()-Date.now():1e12;if(!nx||!nx.classNumber||(ls&&new Date(ls.end_at)<new Date()))return null;
 var L=row.lesson||0;if(o&&o.upto>0&&L>o.upto)L=o.upto;var St=(window.Covers&&Covers.stageOf&&L)?Covers.stageOf(L):(row.stage||1);
 return {todo:L?todoOf(row,o,L,row.stage||1):[],row:row,near:ms<=24*3600e3,num:nx.classNumber,stage:row.stage||St,start:ls?ls.start_at:'',meet:ls?ls.meet_url||'':'',rev:nx.review&&nx.review.from!=null?nx.review:null,nw:nx.newWords&&nx.newWords.from!=null?nx.newWords:null,stopPar:cp.paragraph,stopWord:me.lastWord||cp.lastWord||'',L:L,St:St,
  Lc:(window.Covers&&Covers.stageOf&&L>1)?Covers.stageOf(L-1):St};
}
function when(iso){if(!iso)return '';var d=new Date(iso),n=new Date(),tm=d.toLocaleTimeString(ES?'es':'en',{hour:'numeric',minute:'2-digit'}),dd=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);return (dd<=0?t('today'):dd===1?t('tmrw'):d.toLocaleDateString(ES?'es':'en',{weekday:'short',day:'numeric',month:'short'}))+' · '+tm;}
function preTop(p){
 var h='<canvas class="fcv" aria-hidden="true"></canvas><span class="tag">'+t('next')+'</span><h3>'+t('cls')+' '+p.num+' · '+t('stage')+' '+p.stage+'</h3><p style="margin:0;color:#a9b4cf">'+esc(when(p.start))+'</p><div class="xwn"></div>';
 if(p.stopPar||p.stopWord)h+='<div class="sec"><div class="k">'+t('stopped')+'</div><div class="pin"><span class="ic2">'+IC.bm+'</span><span><b>'+(p.stopPar?t('par')+' '+esc(p.stopPar):'')+(p.stopPar&&p.stopWord?' · ':'')+(p.stopWord?'“'+esc(p.stopWord)+'”':'')+'</b><small>'+t('stopT')+'</small></span></div></div>';
 if(p.rev||p.nw){h+='<div class="sec"><div class="k">'+t('study')+'</div>';
  if(p.rev)h+='<div class="pin"><span class="ic2">'+IC.rf+'</span><span><b>'+t('rev')+' · '+t('par')+' '+p.rev.from+'–'+p.rev.to+'</b><small>'+t('revT')+'</small></span></div>';
  if(p.nw)h+='<p style="margin:8px 0 0">'+t('newl')+': '+(p.L?t('lesson')+' '+p.L+' · ':'')+t('par')+' '+p.nw.from+'–'+p.nw.to+'</p>';
  h+='<div class="xact"></div></div>';}
 else h+='<div class="xact"></div>';
 if(p.L){var tk=function(ic,tt,sm,hr){return '<a class="song" href="'+hr+'"><span class="ic2">'+ic+'</span><span><b>'+tt+'</b><small>'+sm+'</small></span></a>';},NM={lc:t('lchk'),gr:'Grammar',wb:'Workbook'},IK={lc:IC.ckb,gr:IC.activity,wb:IC.bk};
  h+='<div class="sec xs"><div class="k">'+(ES?'EJERCICIOS PARA TI':'EXERCISES FOR YOU')+'</div><div class="xau"></div>';
  if(p.todo&&p.todo.length)p.todo.forEach(function(x){h+=tk(IK[x.k],NM[x.k]+' · '+t('lesson')+' '+x.n,x.miss?(ES?'Clase perdida':'Missed class'):x.redo?(ES?'Repítelo':'Do it again'):'',x.h);});
  h+='</div>';}
 return h;}
/* merged "next class" card: missed-class warning, class activity, Listening player and countdown come from plan.js */
function decorate(card,p,uid){
 var X=null;try{X=window.Plan&&Plan.extras?Plan.extras(p.row,ES):null;}catch(e){}
 if(X){var w=card.querySelector('.xwn'),a=card.querySelector('.xact'),u=card.querySelector('.xau');
  if(w&&X.warn){w.className='wn';w.innerHTML=IC.warn+'<span></span>';w.lastChild.textContent=X.warn;}
  if(a&&X.act){a.className='act';if(X.actHead){var b=document.createElement('b');b.textContent=X.actHead+': ';a.appendChild(b);}a.appendChild(document.createTextNode(X.act));}
  if(u&&X.audio)u.appendChild(X.audio);}
 var xs=card.querySelector('.xs');if(xs&&!xs.querySelector('.song,.pl'))xs.remove();
 if(uid&&p.start&&window.Plan&&Plan.countdown){try{Plan.countdown(card,ES,uid);}catch(e){}}}
function build(box,o,c,from,to,list,pre,pre2){
 var sb=o.sb;c=c||{};var S={rating:c.rating||0,opt:null,cans:{},sent:!!c.rating,reviews:0};
 var st1=c.stage===1,showRate=!!c.event_key&&(!pre||!c.rating);
 var rng=from+(to!==from?'–'+to:'');
 function sugHtml(){var h='';list.forEach(function(x){var url=/^https?:\/\//i.test(x.title),k=(KINDS.filter(function(q){return q[0]===x.kind;})[0]||KINDS[0]);
  var inner='<span class="ic2">'+IC[x.kind]+'</span><span><b>'+esc(x.title)+'</b><small>'+k[1][L]+(x.mine&&x.status!=='approved'?' · '+t('your'):'')+(x.by_name&&x.status==='approved'&&!x.mine?' · '+esc(x.by_name):'')+'</small></span>'+(x.status!=='approved'?'<span class="pd">'+t('pend')+'</span>':'');
  h+=url?'<a class="song" target="_blank" rel="noopener" href="'+esc(x.title)+'">'+inner+'</a>':'<div class="song">'+inner+'</div>';});return h;}
 function top(){return '<canvas class="fcv" aria-hidden="true"></canvas><span class="tag">'+t('tag')+'</span><h3>'+t('cls')+' '+c.class_number+' · '+t('stage')+' '+c.stage+'</h3>'
  +'<div class="sec"><div class="k">'+t('studied')+'</div><p style="margin:0">'+t('par')+' '+rng+(c.last_word?' · “'+esc(c.last_word)+'”':'')+'</p></div>'
  +'<div class="sec"><div class="k">'+t('listen')+'</div>'+sugHtml()+'<div class="row"><button class="btn glow" id="cdsug" type="button">'+IC.plus+' '+t('btn')+'</button></div></div>';}
 var cans=st1?['Entendi o assunto da aula','Consigo usar o que aprendi']:['I understood today’s lesson','I can use what I learned'];
 function cansHtml(){var h='<div class="k">'+(st1?'EU CONSIGO…':'I CAN…')+'</div>';cans.forEach(function(x,i){h+='<button class="chip" type="button" data-c="'+i+'" aria-pressed="'+!!S.cans[i]+'"'+(S.cans[i]?' ':'')+'>'+(S.cans[i]?IC.ck:'<span class="dot"></span>')+esc(x)+'</button>';});return h;}
 function rate(){
  var done=S.sent,r=S.rating,h;
  if(done){h='<div class="thx">'+(r?'<span class="f'+r+'"><svg viewBox="0 0 128 128" aria-hidden="true">'+EM[r]+'</svg></span>':'')+'<h3>'+(r?RV[r][2]:'Obrigado!')+'</h3><p class="hint">'+(r>=4?'Sua avaliação ajuda a turma toda.':'Vamos usar o seu retorno para melhorar as próximas aulas.')+'</p></div>';
   return h;}
  var p=[(S.cans[0]||S.cans[1]),r,S.opt];
  h='<span class="tag">SUA VEZ</span><h3>Como foi a sua aula?</h3><p class="hint">Leva só 10 segundos.</p><div class="prog">'+p.map(function(d){return '<i class="'+(d?'on':'')+'"></i>';}).join('')+'</div><div class="stp">'+cansHtml()+'<div class="k">NOTA DA AULA</div><div class="frow">';
  for(var i=1;i<=5;i++)h+='<button class="fb'+(r===i?' sel':(r?' dim':''))+'" type="button" data-r="'+i+'" aria-label="'+i+' · '+FM[i]+'" aria-pressed="'+(r===i)+'"><svg viewBox="0 0 128 128" aria-hidden="true">'+EM[i]+'</svg></button>';
  h+='</div>'+(r?'<div class="flab f'+r+'"><b>'+FM[r]+'</b></div>':'<div class="flab"><span class="mu2">Toque no leãozinho</span></div>');
  if(r){h+='<div class="k">'+RV[r][0].toUpperCase()+'</div>';RV[r][1].forEach(function(x){h+='<button class="chip in'+(S.opt===x?' on':'')+'" type="button" data-w="'+esc(x)+'" aria-pressed="'+(S.opt===x)+'">'+(S.opt===x?IC.ck:'')+esc(x)+'</button>';});}
  h+='</div><button class="btn" id="cdsend" type="button"'+(r?'':' disabled')+'>Enviar e ganhar</button>';return h;}
 var card=document.createElement('div'),rc=document.createElement('div');
 card.className='cd';rc.className='cdr';
 box.textContent='';box.appendChild(card);if(showRate)box.appendChild(rc);box.hidden=false;
 if(pre2){var c2=document.createElement('div');c2.className='cd';c2.innerHTML=preTop(pre2);box.appendChild(c2);animate(c2.querySelector('.fcv'));decorate(c2,pre2,o.uid);}
 function paint(){if(pre){card.innerHTML=preTop(pre);animate(card.querySelector('.fcv'));decorate(card,pre,o.uid);return;}card.innerHTML=top();animate(card.querySelector('.fcv'));card.querySelector('#cdsug').onclick=function(){suggest({sb:sb,from:from,to:to,onSent:refresh});};}
 function paintRate(){rc.innerHTML=rate();
  Array.prototype.forEach.call(rc.querySelectorAll('[data-c]'),function(b){b.onclick=function(){S.cans[b.dataset.c]=!S.cans[b.dataset.c];paintRate();};});
  Array.prototype.forEach.call(rc.querySelectorAll('[data-r]'),function(b){b.onclick=function(){S.rating=+b.dataset.r;S.opt=null;paintRate();};});
  Array.prototype.forEach.call(rc.querySelectorAll('[data-w]'),function(b){b.onclick=function(){S.opt=b.dataset.w;paintRate();};});
  var sd=rc.querySelector('#cdsend');if(sd)sd.onclick=function(){sd.disabled=true;
   var can={};cans.forEach(function(x,i){if(S.cans[i])can[x]=true;});
   Promise.resolve(sb.rpc('submit_rating',{p_event:c.event_key,p_rating:S.rating,p_reason:S.opt||'',p_can:can})).then(function(r){
    if(r&&r.error){sd.disabled=false;toast(r.error.message||'Error');return;}
    S.sent=true;S.complete=!!(S.opt&&(S.cans[0]||S.cans[1]));
    Promise.resolve(sb.from('class_ratings').select('id',{count:'exact',head:true}).not('reason','is',null).not('can_do','is',null)).then(function(q){S.reviews=(q&&q.count)||0;},function(){}).then(function(){paintRate();if(S.rating>=4)boom(rc);medalsRefresh();});
   },function(){sd.disabled=false;});};}
 function refresh(){Promise.resolve(sb.rpc('list_suggestions',{p_from:from,p_to:to})).then(function(s){list=(s&&s.data)||list;paint();});}
 paint();if(showRate)paintRate();
 if(S.sent&&showRate)Promise.resolve(sb.from('class_ratings').select('id',{count:'exact',head:true}).not('reason','is',null).not('can_do','is',null)).then(function(q){S.reviews=(q&&q.count)||0;paintRate();},function(){});
}

/* ---------- Lessons: compact suggestion card A under the right paragraph + suggest entry ---------- */
var LCSS='.cdl{display:flex;align-items:center;gap:10px;margin:10px 0;padding:8px 10px;border:1px solid var(--line,#32457a);border-left:4px solid #d9ae3a;border-radius:12px;background:var(--card,#1a2a52);color:var(--ink,#f3f4f6)}'+
'.cdl svg.i{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;color:#d9ae3a;flex:none}.cdl .tt{min-width:0;flex:1}.cdl b{display:block;font-family:Georgia,serif;overflow-wrap:anywhere}.cdl small{color:var(--mut,#a9b4cf)}'+
'.cdl .op{flex:none;display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:99px;border:2px solid #d9ae3a;background:transparent;color:inherit;font:inherit;font-weight:800;font-size:.85rem;text-decoration:none}'+
'.cdl.sg{border-left-color:var(--line,#32457a)}.cdl.sg button.op{cursor:pointer}';
function searchUrl(x){if(/^https?:\/\//i.test(x.title))return x.title;var k=x.kind,q=encodeURIComponent(x.title);
 if(k==='song'||k==='video'||k==='film'||k==='series')return 'https://www.youtube.com/results?search_query='+(k==='film'||k==='series'?encodeURIComponent(x.title+' trailer'):q);
 if(k==='podcast'||k==='text'||k==='game')return 'https://www.google.com/search?q='+encodeURIComponent(x.title+(k==='podcast'?' podcast':k==='game'?' online game':''));return '';}
function lessonCards(out,o){
 if(!out||!o||!o.sb)return;css();
 if(!document.getElementById('cdl-css')){var st=document.createElement('style');st.id='cdl-css';st.textContent=LCSS;document.head.appendChild(st);}
 Array.prototype.forEach.call(out.querySelectorAll('.cdl'),function(x){x.remove();});
 var pars=Array.prototype.slice.call(out.querySelectorAll('.par')).map(function(p){var n=+((p.querySelector('.pn')||{}).textContent);return {p:p,n:n};}).filter(function(x){return x.n>0;});
 if(!pars.length)return;var lo=pars[0].n,hi=pars[pars.length-1].n;
 Promise.resolve(o.sb.rpc('list_suggestions',{p_from:lo,p_to:hi})).then(function(r){
  if(!out.isConnected)return;var list=(r&&r.data)||[];
  list.forEach(function(x){
   var target=pars.filter(function(q){return q.n<=x.par_to;}).pop()||pars[0];
   if(!target)return;
   var u=searchUrl(x),k=(KINDS.filter(function(q){return q[0]===x.kind;})[0]||KINDS[0]);
   var d=document.createElement('div');d.className='cdl';
   d.innerHTML=IC[x.kind]+'<span class="tt"><b>'+esc(x.title)+'</b><small>'+k[1][L]+' · '+t('par')+' '+x.par_from+(x.par_to!==x.par_from?'–'+x.par_to:'')+(x.status!=='approved'?' · '+t('pend'):'')+'</small></span>'+(u?'<a class="op" target="_blank" rel="noopener" href="'+esc(u)+'">'+(ES?'Abrir':'Open')+'</a>':'');
   var tp=target.p;while(tp.nextElementSibling&&tp.nextElementSibling.classList.contains('cdl'))tp=tp.nextElementSibling;tp.after(d);});
  var e=document.createElement('div');e.className='cdl sg';
  e.innerHTML=IC.bulb.replace('<svg ','<svg class="i" ')+'<span class="tt"><b>'+t('btn')+'</b><small>'+(ES?'Una canción, un vídeo, una película o una actividad':'A song, a video, a film or an activity')+'</small></span><button class="op" type="button">'+IC.plus+'</button>';
  e.querySelector('button').onclick=function(){suggest({sb:o.sb,from:lo,to:hi,onSent:function(){lessonCards(out,o);}});};
  out.appendChild(e);
 },function(){});
}
window.ClassDay={flag:animate,mount:mount,suggest:suggest,lessonCards:lessonCards,lion:lion,css:css};
})();
