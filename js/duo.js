/* "One question at a time" practice mode (Duolingo style).
   Duo.start({groups:[{title,pre:()=>[nodes],items:[{make:()=>({nodes,get,lock}),why}],save:(right,total)=>Promise}],onDone:fn})
   Duo.cta(onclick) -> a block with the button that starts it.
   Works on top of the page's own item builders, so every exercise type keeps its checking rules. */
(function(){
  var W=window,D=document;
  var S={
    cta:['Practise one question at a time','Praticar uma pergunta por vez','Practicar una pregunta a la vez'],
    ctaHint:['Same questions, one screen each, with a progress bar and sounds.','As mesmas perguntas, uma por tela, com barra de progresso e sons.','Las mismas preguntas, una por pantalla, con barra de progreso y sonidos.'],
    check:['Check','Verificar','Comprobar'],
    cont:['Continue','Continuar','Continuar'],
    fin:['Finish','Concluir','Terminar'],
    ok:['Correct!','Correto!','¡Correcto!'],
    bad:['Not quite','Não foi dessa vez','Casi'],
    model:['Model answer','Resposta certa','Respuesta correcta'],
    why:['Why?','Por quê?','¿Por qué?'],
    q:['Question {a} of {b}','Pergunta {a} de {b}','Pregunta {a} de {b}'],
    done:['Well done!','Muito bem!','¡Muy bien!'],
    score:['You got {r} of {t} right','Você acertou {r} de {t}','Has acertado {r} de {t}'],
    saved:['Your score was saved.','Sua pontuação foi salva.','Tu puntuación se guardó.'],
    nosave:['Your score could not be saved. Check your connection.','Não foi possível salvar. Verifique sua conexão.','No se pudo guardar. Revisa tu conexión.'],
    quit:['Leave this practice? Finished exercises are already saved.','Sair desta prática? Os exercícios concluídos já estão salvos.','¿Salir de esta práctica? Los ejercicios terminados ya están guardados.'],
    close:['Close','Fechar','Cerrar'],
    map:['Back to the map','Voltar ao mapa','Volver al mapa'],
    snd:['Sound on/off','Som ligado/desligado','Sonido activado/desactivado'],
    gdone:['Activity complete!','Atividade concluída!','¡Actividad completada!'],
    gnext:['Next activity','Próxima atividade','Siguiente actividad'],
    gscore:['{r} of {t} correct','{r} de {t} certas','{r} de {t} correctas'],
    over:['Game over','Fim de jogo','Fin del juego'],
    lostall:['You lost all your lions.','Você perdeu todos os leões.','Perdiste todos los leones.'],
    retry:['Try again','Tentar de novo','Intentar de nuevo'],
    back:['A lion is back!','Um leão voltou!','¡Un león volvió!'],
    bankHint:['Tap the words in order.','Toque nas palavras na ordem.','Toca las palabras en orden.'],
    lives:['Lions left: {n}','Leões restantes: {n}','Leones restantes: {n}'],
    combo:['{n} of 5 in a row for a new lion','{n} de 5 seguidas para ganhar um leão','{n} de 5 seguidas para ganar un león']
  };
  function ix(){var h=W.I18N&&W.I18N.hint;return h==='pt'?1:h==='es'?2:0;}
  function T(k,v){var s=S[k][ix()];if(v)for(var p in v)s=s.replace('{'+p+'}',v[p]);return s;}
  function el(tag,cls,txt){var e=D.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

  /* ---------- sounds (synthesised, no files) ---------- */
  var ac;
  function sndOn(){try{return localStorage.getItem('bl-duo-snd')!=='0';}catch(e){return true;}}
  function actx(){try{ac=ac||new (W.AudioContext||W.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(e){}return ac;}
  function tone(f,t0,d,type,g){var c=actx();if(!c)return;var o=c.createOscillator(),v=c.createGain(),t=c.currentTime+t0;
    o.type=type||'sine';o.frequency.value=f;v.gain.setValueAtTime(0.0001,t);v.gain.linearRampToValueAtTime(g,t+.012);v.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(v);v.connect(c.destination);o.start(t);o.stop(t+d+.05);}

  /* Short piano-style tunes played with the flag of the celebration character (melodies only, synthesised, no files) */
  var NT={G3:55,A3:57,B3:59,C4:60,D4:62,E4:64,F4:65,Fs4:66,G4:67,A4:69,B4:71,C5:72,D5:74,E5:76,G5:79,A5:81};
  var TUNE={
   england:[200,'G4 .75,A4 .25,G4 .5,F4 .5,E4 .5,F4 .5,G4 1,D4 .5,E4 .5,F4 1,E4 .5,F4 .5,G4 1,G4 .75,A4 .25,G4 .5,F4 .5,E4 .5,F4 .5,G4 1,D4 1,G4 1,E4 1,C4 2'],
   scotland:[150,'G4 1,C5 1.5,C5 .5,C5 1,E5 1,D5 1.5,C5 .5,D5 1,E5 1,C5 1.5,C5 .5,E5 1,G5 1,A5 3'],
   usa:[150,'G4 .75,E4 .25,C4 1,E4 1,G4 1,C5 2,E5 .75,D5 .25,C5 1,E4 1,Fs4 1,G4 2'],
   uk:[176,'G4 1,G4 1,A4 1,Fs4 1.5,G4 .5,A4 1,B4 1,B4 1,C5 1,B4 1.5,A4 .5,G4 2'],
   ireland:[170,'G4 1,G4 1,B4 1,D5 2,D5 1,C5 1,B4 1,A4 2,G4 1,G4 1,B4 1,D5 2,E5 1,D5 1,B4 2'],
   mx:[200,'C4 .5,C4 .5,C4 .5,F4 1.5,A4 1,C4 .5,C4 .5,C4 .5,F4 1.5,A4 1,F4 .5,F4 .5,E4 .5,E4 .5,D4 .5,D4 .5,C4 2']
  };
  function playTune(key){
    if(!sndOn()||!TUNE[key])return;var c=actx();if(!c)return;
    var t=c.currentTime+.05,b=60/TUNE[key][0];
    TUNE[key][1].split(',').forEach(function(x){
      var q=x.split(' '),fr=440*Math.pow(2,(NT[q[0]]-69)/12),d=parseFloat(q[1])*b,dec=Math.max(d*3.6,1.1),out=c.createGain();out.gain.value=.15;out.connect(c.destination);
      [[1,1],[2,.5],[3,.25],[4,.12],[5,.06]].forEach(function(p){var o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=fr*p[0]*(1+p[0]*.0004);
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(p[1],t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+dec/(1+p[0]*.25));
        o.connect(g);g.connect(out);o.start(t);o.stop(t+dec+.1);});
      t+=d;});
  }
  function tuneKey(flag){var m=/flags\/(england|scotland|usa|uk|ireland)\.svg$/.exec(flag);if(m)return m[1];return /flag-mx\.png$/.test(flag)?'mx':'';}
  function bell(){if(!sndOn())return;tone(1318.5,0,1.1,'sine',.2);tone(2637,0,.5,'sine',.06);tone(1760,.13,1.3,'sine',.2);tone(3520,.13,.5,'sine',.05);}
  function buzz(){if(!sndOn())return;tone(233,0,.26,'triangle',.16);tone(175,.13,.34,'triangle',.15);}
  function tick(){if(!sndOn())return;tone(523,0,.11,'sine',.035);tone(784,0,.07,'sine',.01);}
  function fanfare(){if(!sndOn())return;[523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,i*.12,.7,'sine',.16);});}

  /* ---------- styles ---------- */
  function css(){
    if(D.getElementById('bl-duo-css'))return;
    var s=el('style');s.id='bl-duo-css';
    s.textContent=
'.duo-cta{margin:0 0 16px;padding:12px 14px;border:1px solid var(--line,#bbb);border-radius:6px;background:var(--surface,#fff);display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center}'+
'.duo-cta p{margin:0;flex:1 1 220px;min-width:0;color:var(--muted,#555);font-size:.95rem}'+
'#bl-duo{position:fixed;inset:0;z-index:99990;display:flex;flex-direction:column;background:var(--bg,#fff);color:var(--ink,#111);font-family:inherit}'+
'#bl-duo .dz-top{display:flex;align-items:center;gap:12px;padding:12px max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px));padding-top:max(12px,env(safe-area-inset-top,0px))}'+
'#bl-duo .dz-x,#bl-duo .dz-snd{flex:none;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:var(--muted,#555);font-size:1.4rem;cursor:pointer;line-height:1}'+
'#bl-duo .dz-snd.off{opacity:.4}'+
'#bl-duo .dz-bar{flex:1;height:16px;border-radius:99px;background:var(--chip,#ddd);overflow:hidden}'+
'#bl-duo .dz-fill{height:100%;width:0;border-radius:99px;background:var(--ok,#1d7a36);transition:width .35s ease}'+
'#bl-duo .dz-main{flex:1;overflow:auto;padding:8px max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px))}'+
'#bl-duo .dz-in{max-width:640px;margin:0 auto;min-width:0}'+
'#bl-duo .dz-q img,#bl-duo .dz-pre img{display:block;max-width:100%;width:auto;height:auto;max-height:34vh;object-fit:contain;margin:0 auto 10px;background:#fff;border-radius:6px}'+
'#bl-duo .pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}'+
'#bl-duo .pgrid .pcell{padding:4px}#bl-duo .pgrid .pcell img{width:100%;max-height:96px;aspect-ratio:1;margin:0 0 2px}'+
'#bl-duo .dz-q select,#bl-duo .dz-q input.txt{max-width:100%}'+
'#bl-duo .dz-lab{margin:6px 0 4px;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#555)}'+
'#bl-duo .dz-pre{margin:0 0 10px}'+
'#bl-duo .dz-pre .instr{margin:0 0 8px}'+
'#bl-duo .dz-q{margin-top:8px;font-size:1.1rem}'+
'#bl-duo .dz-q .q{font-size:1.3rem;line-height:1.3}'+
'#bl-duo .dz-foot{padding:14px max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));border-top:2px solid var(--line,#bbb);background:var(--bg,#fff)}'+
'#bl-duo .dz-foot.ok{background:var(--ok-bg,#e3efe5);border-color:var(--ok,#1d7a36)}'+
'#bl-duo .dz-foot.bad{background:var(--bad-bg,#f6e4e2);border-color:var(--bad,#9c2a22)}'+
'#bl-duo .dz-fbw{max-width:640px;margin:0 auto}'+
'#bl-duo .dz-fb{margin:0 0 12px}'+
'#bl-duo .dz-fb h3{margin:0 0 4px;font-size:1.25rem}'+
'#bl-duo .dz-foot.ok .dz-fb h3{color:var(--ok,#1d7a36)}'+
'#bl-duo .dz-foot.bad .dz-fb h3{color:var(--bad,#9c2a22)}'+
'#bl-duo .dz-fb p{margin:2px 0}'+
'#bl-duo .dz-fb .why-txt{margin:6px 0 0;padding:8px 10px;border-left:3px solid var(--accent,#111);background:var(--surface,#fff);border-radius:6px}'+
'#bl-duo .dz-btn{display:block;width:100%;max-width:640px;margin:0 auto;min-height:52px;font:inherit;font-size:1.05rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;border-radius:12px;border:2px solid var(--accent,#111);background:var(--accent,#111);color:var(--accent-ink,#fff);cursor:pointer}'+
'#bl-duo .dz-btn:disabled{opacity:.4;cursor:not-allowed}'+
'#bl-duo .dz-foot.ok .dz-btn{background:var(--ok,#1d7a36);border-color:var(--ok,#1d7a36);color:#fff}'+
'#bl-duo .dz-foot.bad .dz-btn{background:var(--bad,#9c2a22);border-color:var(--bad,#9c2a22);color:#fff}'+
'#bl-duo .dz-end{max-width:640px;margin:8vh auto 0;text-align:center}'+
'#bl-duo .dz-end .em{font-size:4rem;line-height:1}'+
'#bl-duo .dz-end h2{margin:10px 0 6px;font-size:1.8rem}'+
'#bl-duo .dz-end p{margin:4px 0;color:var(--muted,#555)}'+
'#bl-duo .dz-end .big{font-size:1.4rem;color:var(--ink,#111)}'+
'#bl-duo .dz-pop{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,10,25,.7)}'+
'#bl-duo .dz-card{width:100%;max-width:380px;text-align:center;padding:22px 20px 20px;border-radius:20px;background:var(--surface,#fff);color:var(--ink,#111);border:2px solid var(--accent,#c9a233);box-shadow:0 20px 60px rgba(0,0,0,.45);animation:dz-in .35s ease-out both}'+
'#bl-duo .dz-card h2{margin:6px 0 4px;font-size:1.6rem}'+
'#bl-duo .dz-card p{margin:4px 0}#bl-duo .dz-card .big{font-size:1.2rem;font-weight:700}#bl-duo .dz-card .sv{font-size:.85rem;color:var(--muted,#555)}'+
'#bl-duo .dz-lion{width:150px;height:auto;max-width:60%;animation:dz-roar 1.6s ease-in-out .15s both;transform-origin:50% 80%}'+
'#bl-duo .dz-stars{font-size:2.2rem;letter-spacing:.1em;line-height:1.1}'+
'#bl-duo .dz-stars span{display:inline-block;opacity:0;animation:dz-star .45s ease-out both}'+
'#bl-duo .dz-stars .on{color:#e8b923;text-shadow:0 0 12px rgba(232,185,35,.6)}#bl-duo .dz-stars .off{color:var(--line,#bbb)}'+
'#bl-duo .dz-row{display:flex;flex-direction:column;gap:10px;margin-top:14px}'+
'#bl-duo .dz-row .dz-btn{max-width:none}#bl-duo .dz-ghost{background:transparent;color:var(--ink,#111)}'+
'@keyframes dz-in{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}'+
'@keyframes dz-roar{0%{transform:scale(.6)}25%{transform:scale(1.25) rotate(-4deg)}40%{transform:scale(1.2) rotate(4deg)}55%{transform:scale(1.25) rotate(-3deg)}75%{transform:scale(1.1)}100%{transform:scale(1)}}'+
'@keyframes dz-star{from{transform:scale(.2) rotate(-40deg);opacity:0}to{transform:none;opacity:1}}'+
'#bl-duo .dz-lives{flex:none;display:flex;gap:2px;align-items:center}'+
'#bl-duo .dz-life{position:relative;display:inline-block;width:30px;height:34px}'+
'#bl-duo .dz-life img{width:100%;height:100%;object-fit:contain;display:block;transition:filter .3s}'+
'#bl-duo .dz-life.gold img{animation:dz-glow 1.8s ease-in-out infinite}'+
'#bl-duo .dz-life.gold::after{content:"\\2726";position:absolute;top:-4px;right:-3px;font-size:.8rem;color:#fff3b0;text-shadow:0 0 6px #ffd54a;animation:dz-tw 1.6s ease-in-out infinite}'+
'#bl-duo .dz-life.gold:nth-child(2)::after{animation-delay:.5s}#bl-duo .dz-life.gold:nth-child(3)::after{animation-delay:1s}'+
'#bl-duo .dz-life .fire{position:absolute;inset:-6px -4px 0;display:none;align-items:flex-end;justify-content:center;font-size:1.9rem;line-height:1;pointer-events:none}'+
'#bl-duo .dz-life.burn .fire{display:flex;animation:dz-flame .45s ease-in-out infinite alternate}'+
'#bl-duo .dz-life.burn img{filter:sepia(1) saturate(4) hue-rotate(-15deg) brightness(.9)}'+
'#bl-duo .dz-life.gain{animation:dz-pop .6s ease-out}'+
'#bl-duo .dz-combo{max-width:640px;margin:0 auto 6px;font-size:.8rem;color:var(--muted,#555);text-align:center}'+
'#bl-duo .dz-bank-hint{margin:8px 0 6px;font-size:.85rem;color:var(--muted,#555)}'+
'#bl-duo .dz-over .dz-lion{filter:none;animation:none}'+
'@keyframes dz-glow{0%,100%{filter:drop-shadow(0 0 2px rgba(255,200,60,.6)) brightness(1)}50%{filter:drop-shadow(0 0 8px rgba(255,215,90,.95)) brightness(1.2)}}'+
'@keyframes dz-tw{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}'+
'@keyframes dz-flame{from{transform:translateY(0) scale(1) rotate(-4deg)}to{transform:translateY(-3px) scale(1.15) rotate(4deg)}}'+
'@keyframes dz-pop{0%{transform:scale(.4)}60%{transform:scale(1.35)}100%{transform:scale(1)}}'+
'.dz-conf{position:fixed;top:-20px;font-size:1.6rem;pointer-events:none;z-index:99995;animation:dz-fall 2.6s ease-in forwards}'+
'@keyframes dz-fall{to{transform:translateY(110vh) rotate(540deg);opacity:.9}}'+
'#bl-duo.game .dz-bar{height:18px;position:relative;background:rgba(127,127,127,.28)}'+
'#bl-duo.game .dz-fill{position:relative;background:#58cc02}'+
'#bl-duo.game .dz-fill::after{content:"";position:absolute;left:8px;right:8px;top:4px;height:4px;border-radius:4px;background:rgba(255,255,255,.38)}'+
'#bl-duo.game .dz-scene{display:flex;align-items:center;gap:14px;margin:6px 0 16px}'+
'#bl-duo.game .dz-peep{flex:none;width:84px;height:84px;border-radius:18px;overflow:hidden;border:3px solid #e8b923;box-shadow:0 4px 0 #a8820f;background:#e9e2cf}'+
'#bl-duo.game .dz-peep img{width:100%;height:100%;display:block;object-fit:cover;max-height:none;margin:0;background:none;border-radius:0}'+
'#bl-duo.game .dz-chip{display:inline-block;align-self:flex-start;margin:0 0 8px;padding:3px 10px;border:1px solid var(--line,#bbb);border-radius:10px;background:var(--surface,#fff);font:700 .68rem/1.3 system-ui,sans-serif;letter-spacing:.07em;color:var(--mu,#667)}'+
'#bl-duo.game .dz-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'+
'#bl-duo.game .dz-bub{position:relative;flex:1;min-width:0;border:2px solid var(--line,#bbb);border-radius:16px;padding:10px 14px;background:var(--surface,#fff)}'+
'#bl-duo.game .dz-bub::before{content:"";position:absolute;left:-10px;top:50%;margin-top:-8px;border:8px solid transparent;border-right:10px solid var(--line,#bbb);border-left:0}'+
'#bl-duo.game .dz-bub::after{content:"";position:absolute;left:-7px;top:50%;margin-top:-6px;border:6px solid transparent;border-right:8px solid var(--surface,#fff);border-left:0}'+
'#bl-duo.game .dz-bub b{display:block;font-size:1.15rem;line-height:1.25}#bl-duo.game .dz-bub .dz-lab{margin:3px 0 0;letter-spacing:.06em}'+
'#bl-duo.game .dz-foot{border-top:0;box-shadow:0 -2px 0 var(--line,#bbb)}'+
'#bl-duo.game .dz-foot.ok{box-shadow:none}#bl-duo.game .dz-foot.bad{box-shadow:none}'+
'#bl-duo.game .dz-foot.ok{background:rgba(88,204,2,.14)}#bl-duo.game .dz-foot.bad{background:rgba(255,91,91,.14)}'+
'#bl-duo.game .dz-fb h3{display:flex;align-items:center;gap:10px;font-size:1.4rem}'+
'#bl-duo .dz-ic{display:none}#bl-duo.game .dz-ic{display:inline-flex;flex:none;width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:1.05rem}'+
'#bl-duo.game .dz-foot.ok .dz-ic{background:#58cc02}#bl-duo.game .dz-foot.bad .dz-ic{background:#ff5b5b}'+
'#bl-duo.game .dz-foot.ok .dz-fb h3{color:#58cc02}#bl-duo.game .dz-foot.bad .dz-fb h3,#bl-duo.game .dz-foot.bad .dz-fb p{color:#ff5b5b}'+
'#bl-duo.game .dz-btn{border-radius:16px;border-width:0 0 5px;border-style:solid;border-color:rgba(0,0,0,.35);min-height:54px;letter-spacing:.07em}'+
'#bl-duo.game .dz-btn:active:not(:disabled){transform:translateY(3px);border-bottom-width:2px}'+
'#bl-duo.game .dz-foot.ok .dz-btn{background:#58cc02;border-color:#3f9a00;color:#0b2a00}'+
'#bl-duo.game .dz-foot.bad .dz-btn{background:#ff5b5b;border-color:#c23b3b;color:#3a0b0b}'+
'#bl-duo.game .dz-hero{display:flex;align-items:center;justify-content:center;gap:16px;margin:2px 0 6px}'+
'#bl-duo.game .dz-fam{position:relative;width:112px;height:112px;border-radius:22px;border:3px solid #e8b923;box-shadow:0 5px 0 #a8820f;background:#e9e2cf;animation:dz-bounce 1.1s ease-in-out infinite}'+
'#bl-duo.game .dz-fam img{width:100%;height:100%;object-fit:cover;display:block;border-radius:18px}'+
'#bl-duo.game .dz-fam .cl{position:absolute;bottom:-8px;font-size:1.7rem;animation:dz-clap .5s ease-in-out infinite alternate}'+
'#bl-duo.game .dz-fam .cl.l{left:-14px}#bl-duo.game .dz-fam .cl.r{right:-14px;animation-delay:.25s;transform:scaleX(-1)}'+
'#bl-duo.game .dz-medal{animation:dz-drop .9s cubic-bezier(.3,1.6,.5,1) .2s both;transform-origin:50% 0}'+
'#bl-duo.game .dz-flagrow{display:flex;justify-content:center;margin:0 0 12px}'+
'#bl-duo.game .dz-flagw{display:flex;align-items:flex-start}#bl-duo.game .dz-pole{width:4px;height:74px;border-radius:2px;background:#b9b09a}'+
'#bl-duo.game .dz-flag{width:104px;height:64px;position:relative;overflow:hidden;transform-origin:0 50%;animation:dz-wave 1.5s ease-in-out infinite;box-shadow:0 2px 6px rgba(0,0,0,.35)}'+
'#bl-duo.game .dz-flag img{width:100%;height:100%;object-fit:cover;display:block;max-height:none;margin:0;background:none;border-radius:0}'+
'#bl-duo.game .dz-flag::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,0) 0,rgba(255,255,255,.28) 14px,rgba(0,0,0,.2) 28px,rgba(255,255,255,0) 40px);background-size:80px 100%;animation:dz-ripple 1.1s linear infinite}'+
'#bl-duo.game .dz-fw{position:absolute;inset:0;width:100%;height:100%;z-index:6;pointer-events:none}'+
'.dz-say{margin:6px 6px 0;padding:8px 12px;border-radius:14px;background:#fff;color:#10224a;font-weight:600;font-size:.92rem;line-height:1.35;position:relative}#bl-duo.game .dz-say::before{content:"";position:absolute;top:-6px;left:50%;margin-left:-6px;border:6px solid transparent;border-top:0;border-bottom-color:#fff}'+
'.dz-halo{position:fixed;z-index:99995;pointer-events:none;border-radius:50%;background:radial-gradient(circle,rgba(255,213,74,0) 40%,rgba(255,213,74,.55) 58%,rgba(255,213,74,0) 72%)}'+
'.dz-tw{position:fixed;z-index:99997;pointer-events:none;font-size:1.4rem;color:#ffe27a;text-shadow:0 0 8px #ffd54a;opacity:0}'+
'.dz-flyav .dz-sh{position:absolute;inset:0;border-radius:50%;overflow:hidden;pointer-events:none}.dz-flyav .dz-sh i{position:absolute;top:-20%;left:-70%;width:45%;height:140%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);transform:rotate(20deg)}'+
'.dz-flyav{position:fixed;z-index:99996;margin:0;pointer-events:none;border-radius:50%;overflow:visible}'+
'.dz-spark{position:fixed;z-index:99997;pointer-events:none;font-size:1.6rem;color:#fff3b0;text-shadow:0 0 10px #ffd54a,0 0 20px #ffb300;opacity:0;animation:dz-sp 1.3s ease-out both}'+
'@keyframes dz-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}'+
'@keyframes dz-clap{from{transform:rotate(-14deg) scale(.9)}to{transform:rotate(14deg) scale(1.15)}}'+
'#bl-duo.game .dz-fam .cl.r{animation-name:dz-clapr}@keyframes dz-clapr{from{transform:scaleX(-1) rotate(-14deg) scale(.9)}to{transform:scaleX(-1) rotate(14deg) scale(1.15)}}'+
'@keyframes dz-drop{from{transform:translateY(-70px) rotate(-25deg) scale(.4);opacity:0}to{transform:none;opacity:1}}'+
'@keyframes dz-ripple{to{background-position:80px 0}}'+
'@keyframes dz-wave{0%,100%{transform:perspective(220px) rotateY(-9deg) skewY(-2deg)}50%{transform:perspective(220px) rotateY(9deg) skewY(2deg)}}'+
'@keyframes dz-sp{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(0)}30%{opacity:1}100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(1.3) rotate(200deg)}}'+
'#bl-duo.game .dz-q .opt,#bl-duo.game .dz-q .chip,#bl-duo.game .dz-q button.cho,#bl-duo.game .dz-q .pcell{animation:dz-casc .38s cubic-bezier(.3,1.5,.5,1) both}'+
'#bl-duo.game .dz-q .opt:nth-child(2),#bl-duo.game .dz-q .chip:nth-child(2),#bl-duo.game .dz-q .pcell:nth-child(2){animation-delay:.06s}#bl-duo.game .dz-q .opt:nth-child(3),#bl-duo.game .dz-q .chip:nth-child(3),#bl-duo.game .dz-q .pcell:nth-child(3){animation-delay:.12s}#bl-duo.game .dz-q .opt:nth-child(4),#bl-duo.game .dz-q .chip:nth-child(4),#bl-duo.game .dz-q .pcell:nth-child(4){animation-delay:.18s}#bl-duo.game .dz-q .opt:nth-child(n+5),#bl-duo.game .dz-q .chip:nth-child(n+5),#bl-duo.game .dz-q .pcell:nth-child(n+5){animation-delay:.24s}'+
'#bl-duo.game .dz-q .opt,#bl-duo.game .dz-q .chip,#bl-duo.game .dz-q button.cho{border-bottom-width:4px;transition:transform .08s}#bl-duo.game .dz-q .opt:active,#bl-duo.game .dz-q .chip:active,#bl-duo.game .dz-q button.cho:active{transform:translateY(3px);border-bottom-width:1px}'+
'#bl-duo.game .dz-peep{animation:dz-casc .45s cubic-bezier(.3,1.5,.5,1) both}'+
'#bl-duo.game .dz-foot.ok .dz-fb,#bl-duo.game .dz-foot.bad .dz-fb{animation:dz-up .3s ease-out both}'+
'#bl-duo.game .dz-foot.ok .dz-ic{animation:dz-pop .5s ease-out}'+
'#bl-duo .dz-logo{text-align:center;line-height:1;margin:0 0 12px}#bl-duo .dz-logo img{height:50px;display:block;margin:0 auto 6px;max-height:none;background:none;border-radius:0}#bl-duo .dz-logo b{display:block;font:700 1.15rem Georgia,"Noto Serif",serif;letter-spacing:.04em;color:var(--ink,#fff)}#bl-duo .dz-logo i{display:block;font:600 .6rem Arial,sans-serif;letter-spacing:.5em;padding-left:.5em;color:#e8506a;margin-top:4px;font-style:normal}#bl-duo .dz-logo u{display:block;width:120px;height:2px;background:#e8b923;margin:7px auto 0}'+
'#bl-duo .dz-stars .on{animation:dz-star .45s ease-out both,dz-shine 1.6s ease-in-out 1.4s infinite}'+
'@keyframes dz-casc{from{transform:translateY(14px) scale(.85);opacity:0}to{transform:none;opacity:1}}'+
'@keyframes dz-up{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}'+
'@keyframes dz-shine{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5) drop-shadow(0 0 8px #ffd54a)}}'+
'@media (prefers-reduced-motion:reduce){#bl-duo .dz-life img,#bl-duo .dz-life::after,#bl-duo .dz-life .fire{animation:none!important}#bl-duo .dz-fill{transition:none}.dz-conf{display:none}#bl-duo .dz-lion,#bl-duo .dz-card,#bl-duo .dz-stars span,#bl-duo .dz-fam,#bl-duo .dz-fam .cl,#bl-duo .dz-medal,#bl-duo.game .dz-q .opt,#bl-duo.game .dz-q .chip,#bl-duo.game .dz-q button.cho,#bl-duo.game .dz-q .pcell,#bl-duo.game .dz-peep,#bl-duo.game .dz-fb,#bl-duo .dz-stars .on,#bl-duo .dz-flag,#bl-duo .dz-flag::after{animation:none;opacity:1}.dz-spark{display:none}}';
    D.head.appendChild(s);
  }

  function confetti(){
    if(W.matchMedia&&W.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    var E=['🎉','⭐','✨','🎊','🟡'];
    for(var i=0;i<28;i++){var c=el('span','dz-conf',E[i%E.length]);c.style.left=(Math.random()*100)+'vw';c.style.animationDelay=(Math.random()*.9)+'s';c.style.fontSize=(1.1+Math.random()*1.2)+'rem';D.body.appendChild(c);
      (function(n){setTimeout(function(){if(n.parentNode)n.parentNode.removeChild(n);},4200);})(c);}
  }


  /* ---------- celebration assets ---------- */
  var B=W.BL_BASE||'';
  var PEEPS=[1,2,3,4,5,6,7,8].map(function(n){return B+'img/peeps/p'+n+'.svg';});
  /* Celebration characters: portrait, flag of their country and a playful (not a real quote) congratulation, by score: [3 stars, 2 stars, 1 star], each [main language, Portuguese] */
  var CH=B?[
   ['cervantes','es','flag-es.png',[['¡Venciste los molinos de viento de la gramática!','Você venceu os moinhos de vento da gramática!'],['Buen camino, valiente. ¡La próxima aventura será aún mejor!','Bom caminho, valente. A próxima aventura será ainda melhor!'],['Hasta Don Quijote se cayó muchas veces. ¡Inténtalo otra vez!','Até Dom Quixote caiu muitas vezes. Tente de novo!']]],
   ['frida','es','flag-mx.png',[['¡Pintaste esta lección con todos los colores!','Você pintou esta lição com todas as cores!'],['Hay color en tu progreso. ¡Sigue pintando!','Há cor no seu progresso. Continue pintando!'],['Cada pincelada cuenta. ¡Inténtalo de nuevo!','Cada pincelada conta. Tente de novo!']]],
   ['goya','es','flag-es.png',[['Ni mis fantasmas encontraron un error. ¡Qué lección luminosa!','Nem meus fantasmas acharam erro. Que lição luminosa!'],['Buen trazo. Con un poco más de luz saldrá perfecto.','Bom traço. Com um pouco mais de luz fica perfeito.'],['Hasta las sombras enseñan algo. ¡Vuelve a intentarlo!','Até as sombras ensinam algo. Tente de novo!']]],
   ['picasso','es','flag-es.png',[['Cada acierto es un trazo tuyo. ¡Hoy pintaste una obra maestra!','Cada acerto é um traço seu. Hoje você pintou uma obra-prima!'],['Tu cuadro va tomando forma. ¡Sigue!','Seu quadro está tomando forma. Siga!'],['Los grandes cuadros empiezan con un borrador. ¡Otra vez!','Grandes quadros começam com um rascunho. De novo!']]],
   ['velazquez','es','flag-es.png',[['Este retrato de alumno dedicado merece un lugar en el museo.','Este retrato de aluno dedicado merece um lugar no museu.'],['Buena composición. Con más práctica será una obra maestra.','Boa composição. Com mais prática será uma obra-prima.'],['Un buen pintor retoca su obra. ¡Inténtalo otra vez!','Um bom pintor retoca sua obra. Tente de novo!']]],
   ['bolivar','es','flag-ve.png',[['Te liberaste de las dudas y la victoria es tuya. ¡Adelante!','Você se libertou das dúvidas e a vitória é sua. Adiante!'],['Vas ganando terreno. ¡Sigue la marcha!','Você está ganhando terreno. Siga em frente!'],['Toda libertad cuesta esfuerzo. ¡Vuelve a la batalla!','Toda liberdade exige esforço. Volte à batalha!']]],
   ['isabel','es','flag-es.png',[['¡Excelente! Tu esfuerzo merece un reino entero.','Excelente! Seu esforço merece um reino inteiro.'],['Buen rumbo, como el de las carabelas. ¡Sigue!','Bom rumo, como o das caravelas. Siga!'],['Todo reino se construye paso a paso. ¡Otra vez!','Todo reino se constrói passo a passo. De novo!']]],
   ['sanmartin','es','flag-ar.png',[['Cruzaste los Andes de las lecciones. ¡Felicitaciones!','Você atravessou os Andes das lições. Parabéns!'],['Ya estás subiendo la cordillera. ¡Un poco más!','Você já está subindo a cordilheira. Mais um pouco!'],['Hasta el mejor ejército se reagrupa. ¡Inténtalo otra vez!','Até o melhor exército se reagrupa. Tente de novo!']]]
  ].map(function(c){return {img:B+'img/es/'+c[0]+'.jpg',flag:B+'img/es/'+c[2],say:c[3]};})
  :[
   ['shakespeare','england','A five-act triumph! Your English deserves a standing ovation.','Triunfo em cinco atos! Seu inglês merece aplausos de pé.','Well played! The next act will be even better.','Muito bem! O próximo ato será ainda melhor.','Every great play has a rough first draft. Try again!','Toda grande peça tem um primeiro rascunho difícil. Tente de novo!'],
   ['curie','poland','Radiant result! Your dedication glows.','Resultado radiante! Sua dedicação brilha.','Good reaction! A little more practice and you will glow.','Boa reação! Mais um pouco de prática e você vai brilhar.','Every experiment teaches something. Run it again!','Todo experimento ensina algo. Repita!'],
   ['newton','england','Your progress has force, mass and plenty of acceleration!','Seu progresso tem força, massa e muita aceleração!','You are gaining speed. Keep going!','Você está ganhando velocidade. Continue!','Even apples fall a few times before a big idea. Try again!','Até as maçãs caem algumas vezes antes de uma grande ideia. Tente de novo!'],
   ['darwin','england','Some creatures evolve fast, but you are amazing!','Algumas criaturas evoluem rápido, mas você é demais!','You are adapting well. Evolving takes practice!','Você está se adaptando bem. Evoluir exige prática!','Even the fittest survive by trying again. Go on!','Até os mais fortes sobrevivem tentando de novo. Vá em frente!'],
   ['lincoln','usa','Great work! Your English stands tall.','Ótimo trabalho! Seu inglês está de cabeça erguida.','A house united by practice stands strong. Keep going!','Uma casa unida pela prática fica firme. Continue!','Every long journey starts with one step. Try again!','Toda longa jornada começa com um passo. Tente de novo!'],
   ['franklin','usa','A brilliant idea beats a thousand sparks. Yours was to study every day!','Uma ideia brilhante vale mais que mil faíscas. A sua foi estudar todo dia!','Your kite is flying high. A little more and lightning strikes!','Sua pipa está voando alto. Mais um pouco e vem o raio!','Time well spent is never lost. Try again!','Tempo bem gasto nunca se perde. Tente de novo!'],
   ['mlk','usa','Your dedication inspires. Keep dreaming big and practising!','Sua dedicação inspira. Continue sonhando alto e praticando!','Step by step, you are getting closer to your goal.','Passo a passo, você chega mais perto do seu objetivo.','Do not stop now. Every effort moves you forward!','Não pare agora. Cada esforço leva você adiante!'],
   ['austen','england','A perfect score! Even Mr Darcy would be impressed.','Nota perfeita! Até o Sr. Darcy ficaria impressionado.','Charming progress! The next chapter will be even better.','Progresso encantador! O próximo capítulo será ainda melhor.','Every good story has a difficult chapter. Try again!','Toda boa história tem um capítulo difícil. Tente de novo!'],
   ['christie','england','Mystery solved: the one behind your success is your effort!','Mistério resolvido: o responsável pelo seu sucesso é o seu esforço!','You are on the right trail. One more clue and you have it!','Você está na pista certa. Mais uma pista e chega lá!','A good detective never gives up. Look again!','Um bom detetive nunca desiste. Procure de novo!'],
   ['angelou','usa','Like poetry, you rise with every lesson. You flew high today!','Como a poesia, você se levanta a cada lição. Hoje voou alto!','You are rising nicely. Keep your head up!','Você está subindo bem. Cabeça erguida!','Every try is a verse. Write the next one!','Cada tentativa é um verso. Escreva o próximo!'],
   ['parks','usa','You stood your ground and it paid off. Proud of you!','Você manteve seu lugar e valeu a pena. Orgulho de você!','Steady and strong. Keep going on the road to fluency!','Firme e forte. Siga no caminho da fluência!','Courage is trying again. You can do it!','Coragem é tentar de novo. Você consegue!'],
   ['alice','england','What a wonderful day in Wonderland: you got everything right!','Que dia maravilhoso no País das Maravilhas: você acertou tudo!','You are tumbling down the rabbit hole of English. Keep going!','Você está caindo na toca do coelho do inglês. Continue!','Even in Wonderland you need a few tries. Go again!','Até no País das Maravilhas são precisas algumas tentativas. Vá de novo!'],
   ['sherlock','england','Elementary! A perfect score needs no deduction.','Elementar! Nota perfeita dispensa dedução.','I deduce you are close. One more clue!','Deduzo que você está perto. Mais uma pista!','A good detective checks the evidence again. Try again!','Um bom detetive revê as provas. Tente de novo!'],
   ['peter','scotland','You flew straight to Neverland with full marks!','Você voou direto para a Terra do Nunca com nota máxima!','Think happy thoughts and you will fly even higher!','Pense em coisas boas e você voa ainda mais alto!','Even Peter Pan needed a few tries to fly. Again!','Até Peter Pan precisou de algumas tentativas para voar. De novo!'],
   ['arthur','wales','A true knight of English! Take your seat at the Round Table.','Um verdadeiro cavaleiro do inglês! Sente-se à Távola Redonda.','The sword is almost out of the stone. Pull a little more!','A espada quase saiu da pedra. Puxe só mais um pouco!','Every knight trains before the quest. Try again!','Todo cavaleiro treina antes da missão. Tente de novo!'],
   ['wilde','ireland','Wonderfully witty! Even I could not have said it better.','Maravilhosamente espirituoso! Nem eu diria melhor.','Quite charming! A little more practice and you will sparkle.','Encantador! Mais um pouco de prática e você brilha.','Even a great wit rewrites a line or two. Try again!','Até um grande espírito reescreve uma frase ou duas. Tente de novo!'],
   ['joyce','ireland','Yes! Full marks, and not a word out of place.','Sim! Nota máxima e nenhuma palavra fora do lugar.','A fine chapter. The next one will flow even better.','Um ótimo capítulo. O próximo vai fluir ainda melhor.','Every long novel has many drafts. Try again!','Todo romance longo tem muitos rascunhos. Tente de novo!'],
   ['yeats','ireland','A poet of grammar! Your English shines like a golden apple.','Poeta da gramática! Seu inglês brilha como uma maçã dourada.','Lovely verses! A few more and the poem will be complete.','Belos versos! Mais alguns e o poema estará completo.','Every poem needs a few revisions. Try again!','Todo poema precisa de algumas revisões. Tente de novo!'],
   ['elizabeth2','uk','By royal decree: excellent work!','Por decreto real: excelente trabalho!','Very good indeed. A touch more practice and you will be a champion!','Muito bem! Um pouco mais de prática e você será campeão!','Keep calm and try again. You will get there!','Mantenha a calma e tente de novo. Você vai chegar lá!']
  ].map(function(c){return {img:'img/people/'+c[0]+'.jpg',flag:'img/flags/'+c[1]+'.svg',say:[[c[2],c[3]],[c[4],c[5]],[c[6],c[7]]]};});
  var lastCh=-1;
  function pickCh(){var k;do{k=Math.floor(Math.random()*CH.length);}while(k===lastCh&&CH.length>1);lastCh=k;return CH[k];}
  var lastPeep=-1;
  function pick(a){return a[Math.floor(Math.random()*a.length)];}
  function nextPeep(){var k;do{k=Math.floor(Math.random()*PEEPS.length);}while(k===lastPeep&&PEEPS.length>1);lastPeep=k;return PEEPS[k];}
  function reduced(){return W.matchMedia&&W.matchMedia('(prefers-reduced-motion:reduce)').matches;}
  function medal(k){
    var C=[['#e0a070','#8a4f1a'],['#e6eaf0','#8b95a5'],['#ffe082','#b8860b']][k-1];
    var n=el('div','dz-medal');
    n.innerHTML='<svg viewBox="0 0 80 100" width="76" height="95" aria-hidden="true"><path d="M20 0h16l10 34H30z" fill="#c8102e"/><path d="M60 0H44L34 34h16z" fill="#1d3f8a"/><circle cx="40" cy="62" r="30" fill="'+C[1]+'"/><circle cx="40" cy="62" r="25" fill="'+C[0]+'"/><path d="M40 44l5.3 11 12 1.7-8.7 8.4 2.1 12-10.7-5.7-10.7 5.7 2.1-12-8.7-8.4 12-1.7z" fill="'+C[1]+'" opacity=".85"/></svg>';
    return n;
  }
  function famBox(ch){
    var b=el('div','dz-fam'),i=el('img');i.src=ch.img;i.alt='';b.appendChild(i);
    b.appendChild(el('span','cl l','👏'));b.appendChild(el('span','cl r','👏'));return b;
  }
  function flagRow(ch){
    var r=el('div','dz-flagrow'),w=el('div','dz-flagw'),pl=el('div','dz-pole'),f=el('div','dz-flag'),i=el('img');
    i.src=ch.flag;i.alt='';f.appendChild(i);w.appendChild(pl);w.appendChild(f);r.appendChild(w);return r;
  }
  function fireworks(host){
    if(reduced())return;
    var cv=el('canvas','dz-fw');host.appendChild(cv);
    var w=cv.width=host.clientWidth||innerWidth,h=cv.height=host.clientHeight||innerHeight,cx=cv.getContext('2d'),P=[],t0=Date.now(),last=0;
    var COL=['#ffd54a','#ff5b5b','#58cc02','#4fc3f7','#ff8ad8','#ffffff'];
    function burst(){var x=w*(.15+Math.random()*.7),y=h*(.12+Math.random()*.4),c=pick(COL);for(var i=0;i<46;i++){var a=Math.PI*2*i/46,v=2+Math.random()*3.2;P.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:c});}}
    (function tick(){
      var now=Date.now()-t0;if(!cv.parentNode)return;
      if(now<2600&&now-last>420){last=now;burst();}
      cx.clearRect(0,0,w,h);
      P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=.045;p.vx*=.992;p.l-=.011;if(p.l>0){cx.globalAlpha=p.l;cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x,p.y,2.4,0,7);cx.fill();}});
      P=P.filter(function(p){return p.l>0;});
      if(now<2600||P.length)requestAnimationFrame(tick);else if(cv.parentNode)cv.parentNode.removeChild(cv);
    })();
  }
  function avatarFly(){
    if(reduced())return false;
    var src=null,all=D.querySelectorAll('[data-pf-av]');
    for(var i=0;i<all.length;i++){var r0=all[i].getBoundingClientRect();if(r0.width>8&&r0.height>8&&r0.bottom>0&&r0.top<innerHeight){src=all[i];break;}}
    if(!src||!src.animate)return false;
    var r=src.getBoundingClientRect(),c=src.cloneNode(true);
    c.removeAttribute('data-pf-av');c.classList.add('dz-flyav');
    c.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';
    D.body.appendChild(c);
    var dx=innerWidth/2-(r.left+r.width/2),dy=innerHeight/2-(r.top+r.height/2),sc=Math.min(170/r.width,innerWidth*.5/r.width);
    var T1='translate('+dx+'px,'+dy+'px) scale('+sc+')',G0='drop-shadow(0 0 6px #ffd54a)',G1='drop-shadow(0 0 22px #ffd54a) brightness(1.2)';
    /* 0.6 s up, 0.5 s one spin, 0.9 s hold with the effects, 0.9 s back (no spin): 2.9 s */
    var sh=el('span','dz-sh');sh.appendChild(el('i',''));c.appendChild(sh);
    c.animate([
      {transform:'none',filter:'none',offset:0,easing:'cubic-bezier(.2,.8,.3,1)'},
      {transform:T1+' rotate(0deg)',filter:G0,offset:.207,easing:'ease-in-out'},
      {transform:T1+' rotate(360deg)',filter:G1,offset:.379},
      {transform:T1+' rotate(360deg)',filter:G1,offset:.69,easing:'ease-in-out'},
      {transform:'translate(0px,0px) scale(1) rotate(360deg)',filter:'none',offset:1}
    ],{duration:2900});
    var cx=innerWidth/2,cy=innerHeight/2,R=sc*r.width/2;
    var halo=el('span','dz-halo');halo.style.cssText='left:'+(cx-R*1.5)+'px;top:'+(cy-R*1.5)+'px;width:'+(R*3)+'px;height:'+(R*3)+'px';D.body.appendChild(halo);
    halo.animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1)',offset:.3},{opacity:.6,transform:'scale(1.12)',offset:.6},{opacity:1,transform:'scale(1)',offset:.85},{opacity:0,transform:'scale(1.35)'}],{duration:900,delay:1100,fill:'both'});
    sh.firstChild.animate([{left:'-70%'},{left:'130%'}],{duration:600,delay:1200,easing:'ease-in-out',fill:'both'});
    for(var k=0;k<12;k++){(function(k){
      var s=el('span','dz-tw',k%3?'\u2726':'\u2727'),a=Math.PI*2*k/12,d=R*1.25+(k%3)*14;
      s.style.left=(cx+Math.cos(a)*d-9)+'px';s.style.top=(cy+Math.sin(a)*d-11)+'px';D.body.appendChild(s);
      s.animate([{opacity:0,transform:'scale(.2) rotate(0)'},{opacity:1,transform:'scale(1.3) rotate(60deg)',offset:.4},{opacity:.25,transform:'scale(.7) rotate(120deg)',offset:.7},{opacity:1,transform:'scale(1.2) rotate(180deg)',offset:.88},{opacity:0,transform:'scale(.2) rotate(220deg)'}],{duration:800,delay:1100+(k%6)*20,fill:'both'});
      setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},2100);
    })(k);}
    setTimeout(bell,1100);
    setTimeout(function(){if(halo.parentNode)halo.parentNode.removeChild(halo);},2100);
    setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c);},2950);
    return true;
  }

  function whyBtn(w){
    var p=el('p','why-txt');p.hidden=true;
    var b=el('button','small why-btn',T('why'));b.type='button';b.setAttribute('aria-expanded','false');
    b.addEventListener('click',function(){var open=p.hidden;if(open)p.textContent=w[ix()]||w[0];p.hidden=!open;b.setAttribute('aria-expanded',open?'true':'false');});
    var d=el('div','why');d.appendChild(b);d.appendChild(p);return d;
  }

  function gameOn(){try{return localStorage.getItem('bl-game')==='1';}catch(e){return false;}}
  function roar(){if(!sndOn())return;try{var a=new Audio((W.BL_BASE||'')+'js/sfx/roar.mp3');a.volume=.9;var pr=a.play();if(pr&&pr.catch)pr.catch(function(){});}catch(e){}}
  function flame(){if(!sndOn())return;try{var a=new Audio((W.BL_BASE||'')+'js/sfx/crepitar.mp3');a.volume=.85;var pr=a.play();if(pr&&pr.catch)pr.catch(function(){});}catch(e){}}
  function shuf(a){var r=a.slice();for(var i=r.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=r[i];r[i]=r[j];r[j]=t;}return r;}
  function bare(w){return String(w).replace(/^[^\w\u00C0-\u024F]+|[^\w\u00C0-\u024F]+$/g,'').toLowerCase();}
  var GEN_EN=['do','does','not','the','a','is','are','was','to','of','in','my'],GEN_ES=['no','es','el','la','un','de','que','se','en','mi'];
  /* Game mode: typed answers become a bank of words to tap. */
  function bankify(cur,s,steps){
    var nodes=cur.nodes||[],inp=null,top=-1,i;
    for(i=0;i<nodes.length&&!inp;i++){var n=nodes[i];if(!n||!n.querySelector)continue;
      var f=(n.matches&&n.matches('input.txt'))?n:n.querySelector('input.txt');if(f){inp=f;top=i;}}
    if(!inp||s.it.nobank)return;
    for(i=0;i<nodes.length;i++){if(nodes[i]&&nodes[i].querySelector&&(nodes[i].querySelector('.tokline')||(nodes[i].classList&&nodes[i].classList.contains('tokline'))))return;}
    var model=(s.it.ans&&s.it.ans[0]!=null)?String(s.it.ans[0]):null;
    var rwn=nodes[top]&&nodes[top].classList&&nodes[top].classList.contains('rwtxt')?nodes[top]:null;
    if(rwn){if(s.it.ok){rwn.style.display='none';return;}if(s.it.fix&&s.it.fix[0])model=String(s.it.fix[0]);}
    if(model==null){try{model=cur.get().model;}catch(e){}}
    if(!model)return;
    var toks=String(model).trim().split(/\s+/).filter(Boolean);
    if(!toks.length||toks.length>16)return;
    var have={};toks.forEach(function(t){have[bare(t)]=1;});
    var pool=[];
    steps.forEach(function(o){if(o.g===s.g&&o!==s&&o.it.ans&&o.it.ans[0]!=null)String(o.it.ans[0]).split(/\s+/).forEach(function(w){var b=bare(w);if(b&&!have[b]&&pool.indexOf(w.replace(/[.,;:?!]+$/,''))<0)pool.push(w.replace(/[.,;:?!]+$/,''));});});
    var gen=(W.BL_COURSE&&W.BL_COURSE.id==='es')?GEN_ES:GEN_EN;
    gen.forEach(function(w){if(!have[w]&&pool.indexOf(w)<0)pool.push(w);});
    pool=shuf(pool);
    var nEx=toks.length===1?3:(Math.random()<.5?1:0);
    var words=toks.map(function(t,k){return {t:t,k:k};});
    pool.slice(0,nEx).forEach(function(w,k){words.push({t:w,k:100+k});});
    var avail=shuf(words),built=[],locked=false,cap=toks.length;
    var area=el('div','area'),poolEl=el('div','pool');area.setAttribute('role','group');poolEl.setAttribute('role','group');
    var clear=el('button','small',{'en':'Clear','pt':'Limpar','es':'Borrar'}[['en','pt','es'][ix()]]);clear.type='button';
    function draw(){
      area.textContent='';poolEl.textContent='';
      built.forEach(function(o,k){var b=el('button','chip',o.t);b.type='button';b.disabled=locked;b.addEventListener('click',function(){built.splice(k,1);avail.push(o);draw();});area.appendChild(b);});
      avail.forEach(function(o,k){var b=el('button','chip',o.t);b.type='button';b.disabled=locked||built.length>=cap;b.addEventListener('click',function(){if(built.length>=cap)return;avail.splice(k,1);built.push(o);draw();});poolEl.appendChild(b);});
      if(!built.length)area.appendChild(el('span','hint',T('bankHint')));
    }
    clear.addEventListener('click',function(){if(locked)return;avail=shuf(words);built=[];draw();});
    draw();
    inp.style.display='none';inp.setAttribute('aria-hidden','true');inp.tabIndex=-1;
    var wrap=el('div','dz-bank');wrap.appendChild(area);wrap.appendChild(poolEl);wrap.appendChild(clear);
    nodes.splice(top+1,0,wrap);cur.nodes=nodes;
    var og=cur.get,ol=cur.lock;
    cur.get=function(){inp.value=built.map(function(o){return o.t;}).join(' ');return og();};
    cur.lock=function(){locked=true;clear.disabled=true;try{ol();}catch(e){}draw();};
  }

  function start(o){
    if(D.getElementById('bl-duo'))return;
    css();
    var groups=(o.groups||[]).filter(function(g){return g.items&&g.items.length;});
    if(!groups.length)return;
    var steps=[];groups.forEach(function(g){g.right=0;g.n=0;g.pre_=null;g.items.forEach(function(it){steps.push({g:g,it:it});});});
    var total=steps.length,idx=0,right=0,cur=null,state='ask',anySaved=false,failed=false,pending=[];
    var game=gameOn(),lives=3,combo=0,over=false,lifeEls=[],comboEl=null;
    var prevOverflow=D.body.style.overflow;D.body.style.overflow='hidden';
    var root=el('div');root.id='bl-duo';if(game)root.className='game';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',T('cta'));
    var top=el('div','dz-top'),x=el('button','dz-x','✕');x.type='button';x.setAttribute('aria-label',T('close'));
    var bar=el('div','dz-bar'),fill=el('div','dz-fill');bar.appendChild(fill);
    bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');
    var sb=el('button','dz-snd','🔔');sb.type='button';sb.setAttribute('aria-label',T('snd'));if(!sndOn())sb.className+=' off';
    top.appendChild(x);top.appendChild(bar);
    if(game){var lv=el('div','dz-lives');lv.setAttribute('role','img');
      for(var li=0;li<3;li++){var sp=el('span','dz-life gold'),im=el('img');im.src='img/lion-gold.png';im.alt='';sp.appendChild(im);sp.appendChild(el('span','fire','🔥'));lv.appendChild(sp);lifeEls.push(sp);}
      top.appendChild(lv);}
    top.appendChild(sb);
    var main=el('div','dz-main'),inn=el('div','dz-in');main.appendChild(inn);
    var foot=el('div','dz-foot'),fbw=el('div','dz-fbw'),fb=el('div','dz-fb');fb.setAttribute('aria-live','polite');fb.hidden=true;
    var btn=el('button','dz-btn',T('check'));btn.type='button';
    if(game){comboEl=el('div','dz-combo');comboEl.setAttribute('aria-live','polite');}
    fbw.appendChild(fb);if(comboEl)foot.appendChild(comboEl);foot.appendChild(fbw);foot.appendChild(btn);
    root.appendChild(top);root.appendChild(main);root.appendChild(foot);
    D.body.appendChild(root);

    function lifeLabel(){var l=top.querySelector('.dz-lives');if(l)l.setAttribute('aria-label',T('lives',{n:lives}));}
    function setLife(k,gold){var sp=lifeEls[k],im=sp.firstChild;sp.className='dz-life '+(gold?'gold':'dead');im.src=gold?'img/lion-gold.png':'img/lion-off.png';}
    function lose(){
      if(lives<=0)return;lives--;var k=lives;var sp=lifeEls[k];
      sp.className='dz-life burn';flame();
      setTimeout(function(){setLife(k,false);},1400);
      lifeLabel();if(lives<=0)over=true;
    }
    function gain(){
      for(var k=0;k<3;k++){if(!lifeEls[k].classList.contains('gold')&&!lifeEls[k].classList.contains('burn')){setLife(k,true);lifeEls[k].classList.add('gain');lives++;break;}}
      lifeLabel();bell();
    }
    function updCombo(){if(!comboEl)return;comboEl.textContent=(game&&lives<3&&lives>0)?T('combo',{n:combo}):'';}
    function setBar(n){var p=Math.round(n/total*100);fill.style.width=p+'%';bar.setAttribute('aria-valuenow',String(p));}
    function touched(){if(state==='ask')btn.disabled=false;}
    inn.addEventListener('input',touched);inn.addEventListener('change',touched);inn.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('button,label,input,select,.opt,.chip'))setTimeout(touched,0);});
    function onKey(e){
      if(e.key==='Escape'){e.preventDefault();quit();}
      else if(e.key==='Enter'&&!e.shiftKey&&!btn.disabled&&D.activeElement&&D.activeElement.tagName!=='BUTTON'&&D.activeElement.tagName!=='TEXTAREA'){e.preventDefault();btn.click();}
    }
    D.addEventListener('keydown',onKey,true);
    if(game)root.addEventListener('pointerdown',function(e){var t=e.target.closest&&e.target.closest('button,.opt,.chip,label');if(t&&!t.disabled)tick();});

    function close(){
      D.removeEventListener('keydown',onKey,true);
      if(root.parentNode)root.parentNode.removeChild(root);
      D.body.style.overflow=prevOverflow;
      Promise.all(pending).then(function(){if(o.onDone)o.onDone(anySaved);},function(){if(o.onDone)o.onDone(anySaved);});
    }
    function quit(){var done=idx>=total;if(done||W.confirm(T('quit')))close();}
    x.addEventListener('click',quit);
    sb.addEventListener('click',function(){var on=!sndOn();try{localStorage.setItem('bl-duo-snd',on?'1':'0');}catch(e){}sb.className='dz-snd'+(on?'':' off');if(on)bell();});

    function show(){
      state='ask';foot.className='dz-foot';fb.hidden=true;fb.textContent='';
      btn.textContent=T('check');btn.disabled=true;
      inn.textContent='';
      var s=steps[idx],g=s.g;
      if(game){var sc=el('div','dz-scene'),pw=el('div','dz-peep'),pi=el('img');pi.src=nextPeep();pi.alt='';pw.appendChild(pi);
      var bub=el('div','dz-bub'),chip=el('div','dz-chip',((g.title?g.title+' · ':'')+T('q',{a:idx+1,b:total})).toUpperCase());
      sc.appendChild(pw);sc.appendChild(bub);inn.appendChild(chip);inn.appendChild(sc);}else inn.appendChild(el('p','dz-lab',(g.title?g.title+' · ':'')+T('q',{a:idx+1,b:total})));
      if(g.pre){if(!g.pre_)g.pre_=g.pre()||[];if(g.pre_.length){var pw=el('div','dz-pre');g.pre_.forEach(function(n){if(n)pw.appendChild(n);});inn.appendChild(pw);}}
      cur=s.it.make();
      if(game){var qe=null,ns=cur.nodes||[];for(var qi=0;qi<ns.length&&!qe;qi++){var nn=ns[qi];if(!nn||!nn.querySelector)continue;qe=(nn.classList&&nn.classList.contains('q'))?nn:nn.querySelector('.q');}
        if(qe&&qe.textContent.trim()){bub.appendChild(el('b','',qe.textContent.trim()));qe.className+=' dz-sr';bub.setAttribute('aria-hidden','true');}
        else{if(g.title)bub.appendChild(el('b','',g.title));bub.appendChild(el('p','dz-lab',T('q',{a:idx+1,b:total})));}}
      if(game)bankify(cur,s,steps);
      var q=el('div','dz-q');(cur.nodes||[]).forEach(function(n){if(n)q.appendChild(n);});inn.appendChild(q);
      main.scrollTop=0;setBar(idx);
      var f=inn.querySelector('input:not([type=radio]),select');if(f){try{f.focus({preventScroll:true});}catch(e){}}
    }
    function doCheck(){
      var s=steps[idx],g=s.g,r=cur.get();
      try{cur.lock();}catch(e){}
      state='done';btn.disabled=false;
      g.n++;if(r.ok){g.right++;right++;}
      foot.className='dz-foot '+(r.ok?'ok':'bad');
      fb.hidden=false;fb.textContent='';
      var h3=el('h3','');h3.appendChild(el('span','dz-ic',r.ok?'✓':'✕'));h3.appendChild(D.createTextNode(r.ok?T('ok'):T('bad')));fb.appendChild(h3);
      if(!r.ok&&r.msg&&!/model answer/i.test(r.msg))fb.appendChild(el('p','',r.msg));
      if(r.ok&&r.warn)fb.appendChild(el('p','',r.warn));
      if(r.model&&!r.ok)fb.appendChild(el('p','',T('model')+': '+r.model));
      if(!r.ok&&s.it.why)fb.appendChild(whyBtn(s.it.why));
      if(game){
        if(r.ok){combo++;if(lives<3&&lives>0&&combo>=5){combo=0;gain();fb.appendChild(el('p','',T('back')));}else bell();}
        else{combo=0;lose();buzz();}
        updCombo();
      }else (r.ok?bell:buzz)();
      setBar(idx+1);
      var last=g.n===g.items.length;
      if(last&&g.save){
        var pr;try{pr=Promise.resolve(g.save(g.right,g.items.length));}catch(e){pr=Promise.reject(e);}
        anySaved=true;pending.push(pr.catch(function(){failed=true;}));
      }
      btn.textContent=(over||idx+1>=total)?(over?T('over'):T('fin')):T('cont');
      try{btn.focus();}catch(e){}
    }
    function gameOver(){
      inn.textContent='';fb.hidden=true;foot.style.display='none';state='end';
      var pop=el('div','dz-pop dz-over'),card=el('div','dz-card');pop.setAttribute('role','alertdialog');pop.setAttribute('aria-label',T('over'));
      var img=el('img','dz-lion');img.src='img/lion-off.png';img.alt='';img.width=150;img.height=175;card.appendChild(img);
      card.appendChild(el('h2','',T('over')));
      card.appendChild(el('p','',T('lostall')));
      card.appendChild(el('p','big',T('gscore',{r:right,t:idx+1})));
      var sv=el('p','sv',anySaved?T('saved'):'');card.appendChild(sv);
      var row=el('div','dz-row');
      var rb=el('button','dz-btn',T('retry'));rb.type='button';rb.addEventListener('click',function(){close();setTimeout(function(){start(o);},80);});
      var cb=el('button','dz-btn dz-ghost',T('close'));cb.type='button';cb.addEventListener('click',close);
      row.appendChild(rb);row.appendChild(cb);card.appendChild(row);pop.appendChild(card);root.appendChild(pop);
      Promise.all(pending).then(function(){if(failed)sv.textContent=T('nosave');});
      try{rb.focus();}catch(e){}
    }
    function next(){if(over){gameOver();return;}idx++;if(idx>=total)end();else show();}
    function popup(){
      var fly=avatarFly();
      if(!game)fanfare();else roar();
      confetti();
      setTimeout(function(){if(root.parentNode)buildPop();},fly?2950:0);
    }
    function buildPop(){
      var pct=total?right/total:0,stars=pct>=.9?3:pct>=.6?2:1;
      var nx=null;try{nx=o.next?o.next():null;}catch(e){}
      var pop=el('div','dz-pop'),card=el('div','dz-card');pop.setAttribute('role','alertdialog');pop.setAttribute('aria-label',T('gdone'));
      var lg=el('div','dz-logo'),li=el('img');li.src='img/britland-shield.png';li.alt='';lg.appendChild(li);lg.appendChild(el('b','','BRITLAND'));lg.appendChild(el('i','','ACADEMY'));lg.appendChild(el('u',''));card.appendChild(lg);
      var ch=pickCh();card.appendChild(flagRow(ch));setTimeout(function(){if(root.parentNode)playTune(tuneKey(ch.flag));},300);
      var hero=el('div','dz-hero');hero.appendChild(famBox(ch));hero.appendChild(medal(stars));card.appendChild(hero);
      var say=ch.say[3-stars],sy=el('p','dz-say',say[1]);card.appendChild(sy);
      var st=el('div','dz-stars');st.setAttribute('aria-label',stars+' / 3');
      for(var i=0;i<3;i++){var sp=el('span',i<stars?'on':'off','★');sp.style.animationDelay=(.5+i*.25)+'s';st.appendChild(sp);}
      card.appendChild(st);
      for(var q=0;q<stars;q++)(function(q){setTimeout(function(){if(root.parentNode)tone(1046.5*Math.pow(1.122,q*2),0,.5,'sine',.14);},500+q*250);})(q);
      card.appendChild(el('h2','',T('gdone')));
      card.appendChild(el('p','big',T('gscore',{r:right,t:total})));
      var sv=el('p','sv',T('saved'));card.appendChild(sv);
      var row=el('div','dz-row');
      if(nx){var nb=el('button','dz-btn',T('gnext'));nb.type='button';nb.addEventListener('click',function(){close();setTimeout(nx,60);});row.appendChild(nb);}
      var home=game&&!/(^|\/)index\.html$|\/$/.test(W.location.pathname);
      var mb=null;
      if(home){mb=el('button','dz-btn',T('map'));mb.type='button';mb.addEventListener('click',function(){mb.disabled=true;Promise.all(pending).then(function(){},function(){}).then(function(){W.location.href='index.html';});});row.insertBefore(mb,row.firstChild);if(nb)nb.className='dz-btn dz-ghost';}
      var cb=el('button',nx||mb?'dz-btn dz-ghost':'dz-btn',T('close'));cb.type='button';cb.addEventListener('click',close);row.appendChild(cb);
      card.appendChild(row);pop.appendChild(card);root.appendChild(pop);
      if(right===total&&total>0)fireworks(root);
      Promise.all(pending).then(function(){if(failed)sv.textContent=T('nosave');});
      try{(mb||nb||cb).focus();}catch(e){}
    }
    function end(){
      setBar(total);
      if(game){inn.textContent='';fb.hidden=true;foot.className='dz-foot';foot.style.display='none';state='end';popup();return;}
      inn.textContent='';fb.hidden=true;foot.className='dz-foot';
      var w=el('div','dz-end');
      var pct=total?right/total:0;
      w.appendChild(el('div','em',pct>=.8?'🏆':pct>=.5?'🎉':'💪'));
      w.appendChild(el('h2','',T('done')));
      w.appendChild(el('p','big',T('score',{r:right,t:total})));
      var st=el('p','',''+T('saved'));w.appendChild(st);
      inn.appendChild(w);
      btn.textContent=T('fin');btn.disabled=false;state='end';
      if(pct>=.5){confetti();fanfare();}
      Promise.all(pending).then(function(){if(failed)st.textContent=T('nosave');});
    }
    btn.addEventListener('click',function(){
      if(state==='ask')doCheck();
      else if(state==='done')next();
      else if(state==='end')close();
    });
    show();
  }

  function cta(onclick){
    var d=el('div','duo-cta');
    var b=el('button','btn primary','▶ '+T('cta'));b.type='button';b.addEventListener('click',function(){actx();onclick();});
    d.appendChild(b);d.appendChild(el('p','',T('ctaHint')));
    return d;
  }
  W.Duo={start:start,cta:cta,T:T,game:gameOn};
})();
