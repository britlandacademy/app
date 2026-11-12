/* "One question at a time" practice mode (Duolingo style).
   Duo.start({groups:[{title,pre:()=>[nodes],items:[{make:()=>({nodes,get,lock}),why}],save:(right,total)=>Promise}],onDone:fn})
   Duo.cta(onclick) -> a block with the button that starts it.
   Works on top of the page's own item builders, so every exercise type keeps its checking rules. */
(function(){
  var W=window,D=document;
  var S={
    cta:['Practise one question at a time','Praticar uma pergunta por vez','Practicar una pregunta a la vez'],
    ctaOn:['Activate Game Mode','Ativar o Modo Jogo','Activar el Modo Juego'],
    ctaOnHint:['Game Mode turns the exercises into a game, one question at a time. The page will reload.','O Modo Jogo transforma os exercícios em um jogo, uma pergunta por vez. A página será recarregada.','El Modo Juego convierte los ejercicios en un juego, una pregunta a la vez. La página se recargará.'],
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
    qtitle:['Almost there!','Quase lá!','¡Casi lo logras!'],
    qprog:['{a} of {b} questions done','{a} de {b} perguntas feitas','{a} de {b} preguntas hechas'],
    qleft:['Questions left: {n}','Perguntas restantes: {n}','Preguntas restantes: {n}'],
    qkeep:['Keep going','Continuar','Continuar'],
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
    fixQ:['Correct the sentence.','Corrija a frase.','Corrige la frase.'],
    fixTap:['1. Tap the wrong word.','1. Toque na palavra errada.','1. Toca la palabra incorrecta.'],
    fixPick:['2. Choose what goes in its place:','2. Escolha o que fica no lugar:','2. Elige qué va en su lugar:'],
    fixA:['Which sentence is correct?','Qual frase está correta?','¿Qué frase es correcta?'],
    fixC:['Build the correct sentence.','Monte a frase correta.','Ordena la frase correcta.'],
    fixDel:['Delete the word','Apagar a palavra','Borrar la palabra'],
    bankHint:['Tap the words in order.','Toque nas palavras na ordem.','Toca las palabras en orden.'],
    lives:['Lions left: {n}','Leões restantes: {n}','Leones restantes: {n}'],
    xp:['+{n} XP','+{n} XP','+{n} XP'],
    pill:['Combo ×{n}','Combo ×{n}','Combo ×{n}'],
    rvTitle:['Fix your mistakes','Revisão dos erros','Repaso de errores'],
    rvIntro:['Let\'s try the ones you missed again.','Vamos tentar de novo as que você errou.','Intentemos otra vez las que fallaste.'],
    rvPerfect:['Perfect review! +20 XP','Revisão perfeita! +20 XP','¡Repaso perfecto! +20 XP'],
    lvl:['Level {n}','Nível {n}','Nivel {n}'],
    lvlUp:['Level up!','Subiu de nível!','¡Subiste de nivel!'],
    xpGot:['{n} XP in this practice','{n} XP nesta prática','{n} XP en esta práctica'],
    combo:['{n} of 5 in a row for a new lion','{n} de 5 seguidas para ganhar um leão','{n} de 5 seguidas para ganar un león']
  };
  function ix(){var h=W.I18N&&W.I18N.hint;return h==='pt'?1:h==='es'?2:0;}
  /* Labels (buttons, titles, counters) follow the language chosen in the menu; warnings, corrections, instructions and encouragement stay on the forced/hint language. */
  var FORCED={ctaOnHint:1,ok:1,bad:1,model:1,done:1,qtitle:1,saved:1,nosave:1,quit:1,lostall:1,back:1,fixQ:1,fixTap:1,fixPick:1,fixA:1,fixC:1,bankHint:1,rvIntro:1,rvPerfect:1,combo:1,ctaHint:1};
  function uix(){var l=W.I18N&&W.I18N.lang;return l==='pt'?1:l==='es'?2:l==='en'?0:ix();}
  function T(k,v){var s=S[k][FORCED[k]?ix():uix()];if(v)for(var p in v)s=s.replace('{'+p+'}',v[p]);return s;}
  /* Game Mode in the English course: footer buttons follow Verificar (Portuguese), never a mix */
  function TB(k,v){var i=ix();if(i===0&&!(W.BL_COURSE&&W.BL_COURSE.id==='es'))i=1;var s=S[k][i];if(v)for(var p in v)s=s.replace('{'+p+'}',v[p]);return s;}
  function el(tag,cls,txt){var e=D.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

  /* ---------- sounds (synthesised, no files) ---------- */
  var ac;
  function sndOn(){try{return localStorage.getItem('bl-duo-snd')!=='0';}catch(e){return true;}}
  function actx(){try{ac=ac||new (W.AudioContext||W.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(e){}return ac;}
  function tone(f,t0,d,type,g){var c=actx();if(!c)return;var o=c.createOscillator(),v=c.createGain(),t=c.currentTime+t0;
    o.type=type||'sine';o.frequency.value=f;v.gain.setValueAtTime(0.0001,t);v.gain.linearRampToValueAtTime(g,t+.012);v.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(v);v.connect(c.destination);o.start(t);o.stop(t+d+.05);}
  function noise(t0,d,g,f0,f1){var c=actx();if(!c)return;var n=Math.max(1,Math.floor(c.sampleRate*d)),b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0),i;for(i=0;i<n;i++)x[i]=Math.random()*2-1;var s=c.createBufferSource();s.buffer=b;var f=c.createBiquadFilter();f.type='bandpass';var t=c.currentTime+t0;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+d);var v=c.createGain();v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+d*.25);v.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(v);v.connect(c.destination);s.start(t);}

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
'#bl-duo.game .dz-nm{display:block;margin:0 0 3px;font:700 .68rem/1.2 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#c99a0c}'+
'#bl-duo.game .dz-scene.rev{flex-direction:row-reverse;margin-top:-4px}#bl-duo.game .dz-scene.rev .dz-bub::before{left:auto;right:-10px;border-right:0;border-left:10px solid var(--line,#bbb)}#bl-duo.game .dz-scene.rev .dz-bub::after{left:auto;right:-7px;border-right:0;border-left:8px solid var(--surface,#fff)}'+
'#bl-duo.game .dz-bub .cloze{margin:0;font-weight:700;font-size:1.15rem;line-height:1.35}'+
'#bl-duo.game .dz-pre .dz-gram{margin:8px 0 0;font-size:.78rem;font-weight:500;color:var(--mu,#8a93a8)}'+
'#bl-duo.game .dz-pre{margin:14px 0 4px;text-align:center}#bl-duo.game .dz-pre .instr{margin:0;font-weight:700;font-size:1.25rem;line-height:1.25;color:var(--ink,inherit)}#bl-duo.game .dz-pre .instr::after{content:"";display:block;width:50px;height:3px;margin:12px auto 0;border-radius:2px;background:#f5c542}'+
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
'#bl-duo .dz-xq .dz-lion{width:90px;animation:none}'+
'#bl-duo .dz-xpb{height:12px;border-radius:99px;background:var(--chip,#ddd);margin:10px 0;overflow:hidden}#bl-duo .dz-xpb i{display:block;height:100%;border-radius:99px;background:#58cc02}'+
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
'#bl-duo .dz-pill{position:absolute;left:50%;top:70px;transform:translateX(-50%);z-index:4;padding:7px 18px;border-radius:99px;background:linear-gradient(#f7d46b,#e0a81c);color:#1a1405;font-weight:800;font-size:1rem;box-shadow:0 0 22px rgba(245,197,66,.6);pointer-events:none;opacity:0;white-space:nowrap}'+
'#bl-duo .dz-pill.on{animation:dz-pill 1.6s ease-out both}'+
'@keyframes dz-pill{0%{opacity:0;transform:translateX(-50%) scale(.6)}15%{opacity:1;transform:translateX(-50%) scale(1.12)}30%{transform:translateX(-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1)}}'+
'#bl-duo .dz-xp{margin:2px 0 0;font-weight:700;color:#c99a0c}'+
'#bl-duo .dz-lvl{margin:10px auto 0;max-width:260px;font-weight:700}#bl-duo .dz-lvl i{display:block;height:6px;border-radius:3px;background:var(--chip,#ddd);margin-top:5px;overflow:hidden}#bl-duo .dz-lvl i b{display:block;height:100%;background:#e8b923}'+
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
'#bl-duo.game .dz-q .chip.on{border-color:#f5c542;background:rgba(245,197,66,.18)}'+
'#bl-duo.game .dz-q.fix{display:flex;flex-direction:column;gap:8px}#bl-duo.game .dz-q.fix .dz-wrong{margin:0;text-align:center;font-size:1.3rem;padding:12px 14px;border:2px solid #7a3a4a;border-radius:14px;background:rgba(122,58,74,.25);color:var(--ink,#fff)}#bl-duo.game .dz-q.fix .dz-wrong em{font-style:normal;color:#ff6b6b;border-bottom:3px solid #ff6b6b}#bl-duo.game .dz-q.fix .dz-arrow{text-align:center;color:var(--muted,#9fb0d6);font-size:1.3rem;line-height:1}'+
'#bl-duo.game .dz-bank.fix{display:flex;flex-direction:column;gap:8px;min-height:0}#bl-duo.game .dz-bank.fix .area{order:1;min-height:90px;border:2px solid #f5c542;border-radius:14px;padding:10px;margin:0;align-content:center}#bl-duo.game .dz-bank.fix .dz-undo{order:2;align-self:flex-end;min-height:40px;padding:0 14px;border:2px solid var(--line,#2b4a8c);border-radius:12px;background:transparent;color:#f5c542;font:inherit;font-size:.9rem}#bl-duo.game .dz-bank.fix .pool{order:3;margin:14px 0 0;display:flex;flex-wrap:wrap;justify-content:center;gap:10px}#bl-duo.game .dz-bank.fix .chip{min-height:48px;font-size:1.15rem;border-radius:14px;padding:10px 18px}'+
'#bl-duo.game .wdrow{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;margin:8px 0;padding:20px 12px;border:2px solid var(--line,#2b4a8c);border-radius:16px;background:var(--surface,#142a5c)}'+
'#bl-duo.game .wdrow .wd{font-size:1.4rem;line-height:1.2;padding:10px 14px;min-height:50px;border-radius:12px;border:2px solid transparent;background:transparent;color:var(--ink,#fff)}#bl-duo.game .wdrow .wd.x{background:rgba(122,58,74,.45);border-color:#c0505f;text-decoration:line-through;text-decoration-thickness:2px}'+
'#bl-duo.game .wdhint{text-align:center;font-size:.98rem;margin:2px 0 4px;color:var(--muted,#9fb0d0)}#bl-duo.game .wdbox{margin-top:10px}#bl-duo.game .wdlab{display:block;text-align:center;font-weight:700;margin:0 0 10px}'+
'#bl-duo.game .wdbox .pool{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}#bl-duo.game .wdbox .chip{font-size:1.2rem;padding:12px 18px;min-height:50px;border-radius:14px}#bl-duo.game .wdbox .chip.on{background:#f5c542;color:#1a1405;border-color:#f5c542}#bl-duo.game .wdbox .chip.del{border-style:dashed}'+
'#bl-duo.game .wdalt{display:block;margin:14px auto 0;font-size:.85rem;opacity:.8}'+
'#bl-duo.game .dz-q.fix .cloze{margin:0;padding:22px 16px;border:2px solid var(--line,#2b4a8c);border-radius:16px;background:var(--surface,#142a5c);text-align:center;font-size:1.5rem;line-height:2.1;color:var(--ink,#fff)}#bl-duo.game .dz-q.fix .dz-bl{display:inline-block;min-width:80px;height:36px;vertical-align:middle;border-bottom:3px solid #f5c542;background:rgba(245,197,66,.12);border-radius:8px 8px 0 0;color:transparent;overflow:hidden;margin:0 4px}#bl-duo.game .dz-q.fix .dz-bw{font-size:1.3rem}'+
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
'#bl-duo.game .dz-fam .dz-cl{position:absolute;bottom:-8px;font-size:1.7rem;animation:dz-clap .5s ease-in-out infinite alternate}'+
'#bl-duo.game .dz-fam .dz-cl.l{left:-14px}#bl-duo.game .dz-fam .dz-cl.r{right:-14px;animation-delay:.25s;transform:scaleX(-1)}'+
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
'#bl-duo .dz-blank{display:inline}#bl-duo .dz-bl{display:inline-block;min-width:2.2em;margin:0 2px;color:#a89968;letter-spacing:1px}#bl-duo .dz-bw{font:inherit;font-weight:700;color:#10224a;background:#efe7cf;border:0;border-bottom:3px solid #c9a23a;border-radius:6px;padding:0 8px;margin:0 2px;cursor:pointer}#bl-duo .dz-bw:disabled{cursor:default}'+
'@keyframes dz-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}'+
'@keyframes dz-clap{from{transform:rotate(-14deg) scale(.9)}to{transform:rotate(14deg) scale(1.15)}}'+
'#bl-duo.game .dz-fam .dz-cl.r{animation-name:dz-clapr}@keyframes dz-clapr{from{transform:scaleX(-1) rotate(-14deg) scale(.9)}to{transform:scaleX(-1) rotate(14deg) scale(1.15)}}'+
'@keyframes dz-drop{from{transform:translateY(-70px) rotate(-25deg) scale(.4);opacity:0}to{transform:none;opacity:1}}'+
'@keyframes dz-ripple{to{background-position:80px 0}}'+
'@keyframes dz-wave{0%,100%{transform:perspective(220px) rotateY(-9deg) skewY(-2deg)}50%{transform:perspective(220px) rotateY(9deg) skewY(2deg)}}'+
'@keyframes dz-sp{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(0)}30%{opacity:1}100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(1.3) rotate(200deg)}}'+
'#bl-duo.game .dz-q .opt,#bl-duo.game .dz-q .chip,#bl-duo.game .dz-q button.cho,#bl-duo.game .dz-q .pcell{animation:dz-casc .38s cubic-bezier(.3,1.5,.5,1) both}'+
'#bl-duo.game .dz-q .opt:nth-child(2),#bl-duo.game .dz-q .chip:nth-child(2),#bl-duo.game .dz-q .pcell:nth-child(2){animation-delay:.06s}#bl-duo.game .dz-q .opt:nth-child(3),#bl-duo.game .dz-q .chip:nth-child(3),#bl-duo.game .dz-q .pcell:nth-child(3){animation-delay:.12s}#bl-duo.game .dz-q .opt:nth-child(4),#bl-duo.game .dz-q .chip:nth-child(4),#bl-duo.game .dz-q .pcell:nth-child(4){animation-delay:.18s}#bl-duo.game .dz-q .opt:nth-child(n+5),#bl-duo.game .dz-q .chip:nth-child(n+5),#bl-duo.game .dz-q .pcell:nth-child(n+5){animation-delay:.24s}'+
'#bl-duo.game .dz-q .opt,#bl-duo.game .dz-q .chip,#bl-duo.game .dz-q button.cho{border-bottom-width:4px;transition:transform .08s}#bl-duo.game .dz-q .opt:active,#bl-duo.game .dz-q .chip:active,#bl-duo.game .dz-q button.cho:active{transform:translateY(3px);border-bottom-width:1px}'+
'#bl-duo.game .dz-q .opt.dz-right{border-color:#58cc02;background:#2e7d12;color:#fff;box-shadow:0 3px 0 #1f5a0c}#bl-duo.game .dz-q .opt.dz-wrongpick{border-color:#d94242;background:#7a2430;color:#fff;box-shadow:0 3px 0 #561a22}#bl-duo.game .dz-q .opt.dz-dim{opacity:.5}'+
'#bl-duo.game .dz-undo{display:block;width:max-content;margin:10px 0 0 auto;min-height:40px;padding:0 14px;border:2px solid var(--line,#2b4a8c);border-radius:12px;background:transparent;color:#f5c542;font:inherit;font-size:.9rem}#bl-duo.game .dz-bank.fix .dz-undo{margin:0;align-self:flex-end}'+
'#bl-duo.game .dz-peep{animation:dz-casc .45s cubic-bezier(.3,1.5,.5,1) both}'+
'#bl-duo.game .dz-foot.ok .dz-fb,#bl-duo.game .dz-foot.bad .dz-fb{animation:dz-up .3s ease-out both}'+
'#bl-duo.game .dz-foot.ok .dz-ic{animation:dz-pop .5s ease-out}'+
/* light Game Mode look (cream page, white cards, gold selection, green CHECK) */
':root[data-theme="light"] #bl-duo.game{--bg:#faf8f3;--card:#fff;--surface:#fff;--ink:#14213d;--muted:#4a5472;--mu:#7a8299;--line:#e4dfd2;--chip:#fbf3dc;--accent:#c9a13b;--accent-ink:#14213d;--ok:#2f6d00;--ok-bg:#e3f6cf;--bad:#c23b3b;--bad-bg:#fde6e3;--warn:#a07a1c;color-scheme:light}'+
'#bl-duo.game .dz-btn{background:#58cc02;border-color:#46a302;color:#0b1733}'+
'#bl-duo.game .dz-foot.ok .dz-btn{background:#58cc02;border-color:#46a302;color:#0b1733}'+
':root[data-theme="light"] #bl-duo.game .dz-btn,:root[data-theme="light"] #bl-duo.game .dz-foot.ok .dz-btn,:root[data-theme="light"] #bl-duo.game .dz-foot.bad .dz-btn{color:#fff}'+
':root[data-theme="light"] #bl-duo.game .dz-foot.ok .dz-fb h3{color:#2f6d00}:root[data-theme="light"] #bl-duo.game .dz-foot.bad .dz-fb h3,:root[data-theme="light"] #bl-duo.game .dz-foot.bad .dz-fb p{color:#c23b3b}'+
':root[data-theme="light"] #bl-duo.game .dz-nm,:root[data-theme="light"] #bl-duo.game .dz-xp{color:#a07a1c}'+
':root[data-theme="light"] #bl-duo.game .dz-q .opt,:root[data-theme="light"] #bl-duo.game .dz-q .chip,:root[data-theme="light"] #bl-duo.game .dz-q select.inl{border-color:#d9d3c3}'+
':root[data-theme="light"] #bl-duo.game .dz-q .opt:has(input:checked),:root[data-theme="light"] #bl-duo.game .dz-q .chip.on{border-color:#c9a13b;background:#fbf3dc}'+
'#bl-duo .dz-logo{text-align:center;line-height:1;margin:0 0 12px}#bl-duo .dz-logo img{height:50px;display:block;margin:0 auto 6px;max-height:none;background:none;border-radius:0}#bl-duo .dz-logo b{display:block;font:700 1.15rem Georgia,"Noto Serif",serif;letter-spacing:.04em;color:var(--ink,#fff)}#bl-duo .dz-logo i{display:block;font:600 .6rem Arial,sans-serif;letter-spacing:.5em;padding-left:.5em;color:#e8506a;margin-top:4px;font-style:normal}#bl-duo .dz-logo u{display:block;width:120px;height:2px;background:#e8b923;margin:7px auto 0}'+
'#bl-duo .dz-stars .on{animation:dz-star .45s ease-out both,dz-shine 1.6s ease-in-out 1.4s infinite}'+
'@keyframes dz-casc{from{transform:translateY(14px) scale(.85);opacity:0}to{transform:none;opacity:1}}'+
'@keyframes dz-up{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}'+
'@keyframes dz-shine{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5) drop-shadow(0 0 8px #ffd54a)}}'+
'#bl-duo .dz-card.tkc{background:transparent;border:0;box-shadow:none;max-width:360px;padding:6px 4px;animation:none;display:flex;flex-direction:column;align-items:center;gap:10px}'+
'#bl-duo .tkc .tk-logo{display:flex;flex-direction:column;align-items:center;font:700 .8rem Georgia,serif;letter-spacing:.14em;color:#f3f4f6}#bl-duo .tkc .tk-logo i{font:700 .45rem system-ui;letter-spacing:.3em;color:#d6455a;font-style:normal}'+
'#bl-duo .tkc .tk-w{width:100%;animation:tk-in .9s cubic-bezier(.2,.9,.25,1) both}#bl-duo .tkc .tk-x{position:relative}'+
'#bl-duo .tkc .tk-x::before,#bl-duo .tkc .tk-x::after{content:"";position:absolute;top:100px;width:20px;height:20px;border-radius:50%;background:#0a1530;z-index:2}#bl-duo .tkc .tk-x::before{left:-11px}#bl-duo .tkc .tk-x::after{right:-11px}'+
'#bl-duo .tkc .tk{position:relative;overflow:hidden;background:#fff;color:#14203f;border-radius:14px;padding:14px 14px 12px;text-align:left;animation:tk-shake .3s ease-out 2.05s both}'+
'#bl-duo .tkc .tk-hd{display:flex;justify-content:space-between;align-items:center;font:800 .6rem system-ui;letter-spacing:.18em;color:#5a6b8c}#bl-duo .tkc .tk-ln{display:flex;align-items:center;gap:7px}'+
'#bl-duo .tkc .tk-bdg{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;flex:none}#bl-duo .tkc .tk-bdg svg{width:15px;height:15px}'+
'#bl-duo .tkc .tk-fl{width:36px;height:18px;border-radius:2px;overflow:hidden;box-shadow:0 0 0 1px rgba(10,21,48,.2);display:block}#bl-duo .tkc .tk-fl svg,#bl-duo .tkc .tk-fl img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-duo .tkc .tk-st{font:700 1.25rem/1.1 Georgia,serif;margin:8px 0 2px}'+
'#bl-duo .tkc .tk-sp{display:inline-block;border:2px solid #1d7a36;color:#1d7a36;border-radius:6px;padding:2px 8px;font:800 .66rem system-ui;letter-spacing:.14em;margin-top:4px;position:relative;transform:rotate(-4deg);animation:tk-stamp .55s cubic-bezier(.2,.9,.3,1) 1.8s both}'+
'#bl-duo .tkc .tk-sp.no{border-color:#9c2a22;color:#9c2a22}'+
'#bl-duo .tkc .tk-sp::after{content:"";position:absolute;inset:-6px;border:2px solid currentColor;border-radius:10px;opacity:0;animation:tk-ink .7s ease-out 2.1s both}'+
'#bl-duo .tkc .tk hr{border:0;border-top:2px dashed #b9c2d6;margin:22px -14px 12px}'+
'#bl-duo .tkc .tk dl{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin:0}#bl-duo .tkc .tk dt{font:700 .56rem system-ui;letter-spacing:.14em;color:#5a6b8c;text-transform:uppercase}#bl-duo .tkc .tk dd{margin:0;font:700 1rem/1.2 Georgia,serif;font-variant-numeric:tabular-nums}'+
'#bl-duo .tkc .tk-stars{display:flex;gap:3px;font-size:1.25rem;line-height:1}#bl-duo .tkc .tk-stars span{color:#c9d0e0}#bl-duo .tkc .tk-stars span.on{animation:tk-star .2s linear both}'+
'#bl-duo .tkc .tk-sw{position:absolute;top:0;bottom:0;width:36%;left:-50%;background:linear-gradient(100deg,transparent,rgba(228,192,106,.75),transparent);transform:skewX(-18deg);pointer-events:none;opacity:0;animation:tk-sweep 1.1s ease-out 3.6s both}'+
'#bl-duo .tkc .tk-vd{margin:8px 0 0;font-size:.78rem;font-weight:700;color:#14203f;line-height:1.3}'+
'#bl-duo .tkc .tk-cur{display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;animation:tk-fade .9s ease-out 3.4s both}'+
'#bl-duo .tkc .tk-pw{display:flex;flex-direction:column;align-items:center;gap:4px;width:92px;flex:none}'+
'#bl-duo .tkc .tk-pt{width:58px;height:58px;border-radius:16px;border:3px solid #c9a13b;overflow:hidden;background:#cfe4e0}#bl-duo .tkc .tk-pt img{width:100%;height:100%;object-fit:cover;display:block}'+
'#bl-duo .tkc .tk-who{display:flex;flex-direction:column;align-items:center;gap:1px;text-align:center;color:#f3f4f6}#bl-duo .tkc .tk-who b{font:700 .82rem Georgia,serif}#bl-duo .tkc .tk-who small{font-size:.62rem;color:#a9b6d6;line-height:1.25}#bl-duo .tkc .tk-who .c{display:flex;align-items:center;gap:5px;font-size:.62rem;color:#a9b6d6}#bl-duo .tkc .tk-who .c img{width:18px;height:12px;object-fit:cover;border-radius:2px}'+
'#bl-duo .tkc .tk-say{flex:1;min-width:0;background:#fff;color:#14203f;border-radius:14px;padding:8px 12px;font-weight:600;font-size:.8rem;line-height:1.3}#bl-duo .tkc .tk-say em{display:block;margin-top:6px;padding-top:6px;border-top:1px solid #d5dbe8;font-style:normal;font-weight:500;font-size:.72rem;color:#5a6b8c}'+
'#bl-duo .tkc .sv{font-size:.8rem;color:#a9b6d6;margin:0;animation:tk-fade .9s ease-out 4.3s both}'+
'#bl-duo .tkc .dz-row{width:100%;animation:tk-fade .9s ease-out 4.3s both}'+
'@keyframes tk-in{from{opacity:0;transform:translateY(120%)}to{opacity:1;transform:none}}'+
'@keyframes tk-shake{0%,100%{transform:none}35%{transform:translateY(3px)}70%{transform:translateY(-1px)}}'+
'@keyframes tk-stamp{0%{opacity:0;transform:rotate(-14deg) scale(2.6)}70%{opacity:1;transform:rotate(-4deg) scale(.92)}100%{opacity:1;transform:rotate(-4deg) scale(1)}}'+
'@keyframes tk-ink{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.35)}}'+
'@keyframes tk-star{from{color:#c9d0e0}to{color:#e8b923}}'+
'@keyframes tk-sweep{0%{left:-50%;opacity:1}100%{left:130%;opacity:1}}'+
'@keyframes tk-fade{from{opacity:0}to{opacity:1}}'+
'@media (prefers-reduced-motion:reduce){#bl-duo .tkc *{animation:none!important}#bl-duo .tkc .tk-stars span.on{color:#e8b923}#bl-duo .tkc .tk-sw{display:none}}'+
'@media (prefers-reduced-motion:reduce){#bl-duo .dz-life img,#bl-duo .dz-life::after,#bl-duo .dz-life .fire{animation:none!important}#bl-duo .dz-fill{transition:none}.dz-conf{display:none}#bl-duo .dz-lion,#bl-duo .dz-card,#bl-duo .dz-stars span,#bl-duo .dz-fam,#bl-duo .dz-fam .dz-cl,#bl-duo .dz-medal,#bl-duo.game .dz-q .opt,#bl-duo.game .dz-q .chip,#bl-duo.game .dz-q button.cho,#bl-duo.game .dz-q .pcell,#bl-duo.game .dz-peep,#bl-duo.game .dz-fb,#bl-duo .dz-stars .on,#bl-duo .dz-flag,#bl-duo .dz-flag::after{animation:none;opacity:1}.dz-spark{display:none}}';
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
  ].map(function(c){return {id:c[0],cc:c[2],img:B+'img/es/'+c[0]+'.jpg',flag:B+'img/es/'+c[2],say:c[3]};})
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
  ].map(function(c){return {id:c[0],cc:c[1],img:'img/people/'+c[0]+'.jpg',flag:'img/flags/'+c[1]+'.svg',say:[[c[2],c[3]],[c[4],c[5]],[c[6],c[7]]]};});
  var lastCh=-1;
  function pickCh(){var k;do{k=Math.floor(Math.random()*CH.length);}while(k===lastCh&&CH.length>1);lastCh=k;return CH[k];}
  var lastPeep=-1;
  function pick(a){return a[Math.floor(Math.random()*a.length)];}
  var PBG=['#e9e2cf','#cfe8e0','#f3d3d0','#d4dcf3','#f3e6b8','#e0d0f0'];
  var NF='anna mum mom mother daughter sylvie yukiko elli sally amy petra marina larissa adriana kamila emma klara gina maria ana carmen lucia sofia laura isabel marta elena paula mama madre hija profesora sara julia eva lena nina lucy kate sue mary alice jane'.split(' '),
      NM='jack ben andy tomas josef david dan adam joe wiktor carlos juan pedro luis miguel jose pablo javier diego antonio papa padre hijo profesor tom john peter paul mark jan marek ivan bob'.split(' '),
      PF=[1,3,8],PM=[2,5,7],PN=[4,6];
  function nameHash(n){var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return h;}
  function plain(n){return n.toLowerCase().normalize?n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''):n.toLowerCase();}
  function peepNo(name,avoid){var k=plain(name),h=nameHash(k),g;
    if(k==='teacher')return avoid===2?7:2;
    if(NF.indexOf(k)>=0)g=PF;else if(NM.indexOf(k)>=0)g=PM;else g=PF.concat(PM,PN);
    var n=g[h%g.length];if(n===avoid)n=g[(h+1)%g.length];return n;}
  var DRE=/^\s*([A-ZÀ-Ý][A-Za-zÀ-ÿ]*):\s*[“"«]/;
  function dialogOf(cur,qe){var ns=cur.nodes||[],cl=null,i,n;
    for(i=0;i<ns.length&&!cl;i++){n=ns[i];if(!n||!n.classList)continue;if(n.classList.contains('cloze'))cl=n;else if(n.querySelector)cl=n.querySelector('.cloze');}
    if(!cl||!qe)return null;
    var m1=DRE.exec(qe.textContent),f=cl.firstChild;
    if(!m1||!f||f.nodeType!==3)return null;
    var m2=DRE.exec(f.nodeValue);if(!m2)return null;
    f.nodeValue=f.nodeValue.replace(DRE,'');
    var l=cl.lastChild;if(l&&l.nodeType===3)l.nodeValue=l.nodeValue.replace(/[”"»]\s*$/,'');
    var t1=qe.textContent.trim().replace(DRE,'').replace(/[”"»]/,'');
    var ct='',k;for(k=0;k<cl.childNodes.length;k++)if(cl.childNodes[k].nodeType===3)ct+=cl.childNodes[k].nodeValue;
    var sw=ct.indexOf('?')>=0&&t1.replace(/\(Hint[^)]*\)/i,'').indexOf('?')<0;
    return {n1:m1[1],t1:t1,n2:m2[1],cl:cl,sw:sw};}
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
    b.appendChild(el('span','dz-cl l','👏'));b.appendChild(el('span','dz-cl r','👏'));return b;
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
  /* "Correct the mistake" in game mode: 1) tap the wrong word, 2) choose what goes in its place (or delete it). */
  var fixN=Math.floor(Math.random()*3);
  /* Game mode, Stage "Correct the mistake": the same item is also offered as 1) choose the right sentence or 2) build the right sentence, so the stage is not all one format */
  function fixAlt(cur,s,fv,R,p,q,traps){
    var fx=cur.fx,model=String(s.it.ans[0]).trim(),ans=model.split(/\s+/),wrongS=fx.words.join(' ');
    var norm=function(t){return String(t).replace(/\s+/g,' ').trim();};
    var ev=function(v){var r;try{r=W.evalAns?W.evalAns(v,s.it.ans):null;}catch(e){r=null;}if(!r){var n2=function(t){return String(t).toLowerCase().replace(/[\u2018\u2019`\u00B4]/g,"'").replace(/[^a-z0-9\u00C0-\u024F'\s]/g,' ').replace(/\s+/g,' ').trim();},nv=n2(v);r={ok:(s.it.ans||[model]).some(function(x){return n2(x)===nv;})};}r.model=model;return r;};
    var opts=[];
    if(fv===1){
      opts=[model,wrongS];
      var tw=null;var gn=GEN_EN.concat(GEN_ES);for(var i=0;i<traps.length&&!tw;i++){if(R&&R.split(' ').length===1&&traps[i]!==R&&gn.indexOf(traps[i].toLowerCase())<0)tw=traps[i];}
      if(tw&&R){var a2=ans.slice();a2.splice(p,ans.length-p-q,tw);var alt=a2.join(' ');if(norm(alt)!==norm(model)&&norm(alt)!==norm(wrongS))opts.push(alt);}
      var seen={};opts=opts.filter(function(o){var k=norm(o).toLowerCase();if(seen[k])return false;seen[k]=1;return true;});
      if(opts.length<2)return false;
    }else{
      if(ans.length<2||ans.length>10)return false;
    }
    (cur.nodes||[]).forEach(function(n){if(n&&n.classList&&(n.classList.contains('wdhint')||n.classList.contains('wdrow')||n.classList.contains('wdbox')||n.classList.contains('wdalt')))n.style.display='none';});
    cur.altFix=true;cur.fixMode=true;cur.bubText=TB(fv===1?'fixA':'fixC');
    var wrap,og=cur.lock,locked=false;
    if(fv===1){
      var chosen=null,nm='fx'+Date.now()+Math.floor(Math.random()*999);wrap=el('div','dz-q-opts');wrap.style.cssText='display:flex;flex-direction:column;gap:10px';
      var inputs=[];shuf(opts).forEach(function(o){var l=el('label','opt'),ip=el('input');ip.type='radio';ip.name=nm;ip.addEventListener('change',function(){chosen=o;});inputs.push(ip);l.appendChild(ip);l.appendChild(D.createTextNode(' '+o));wrap.appendChild(l);});
      cur.canCheck=function(){return chosen!=null;};
      cur.get=function(){if(chosen==null)return {ok:false,msg:TB('fixA'),model:model};return ev(chosen);};
      cur.lock=function(){locked=true;inputs.forEach(function(x){x.disabled=true;});try{og();}catch(e){}};
    }else{
      var toks=ans.map(function(t,k){return {t:t,k:k};}),have={};ans.forEach(function(t){have[bare(t)]=1;});
      var extra=[];wrongS.split(/\s+/).forEach(function(w){var b=w.replace(/[.,;:?!]+$/,'');if(b&&!have[bare(b)]&&extra.indexOf(b)<0)extra.push(b);});
      traps.forEach(function(w){if(extra.length<2&&!have[bare(w)]&&extra.indexOf(w)<0)extra.push(w);});
      var words=toks.slice();extra.slice(0,2).forEach(function(w,k){words.push({t:w,k:100+k});});
      var avail=shuf(words),built=[],area=el('div','area'),poolEl=el('div','pool');area.setAttribute('role','group');poolEl.setAttribute('role','group');
      var clear=el('button','small dz-undo','↺ '+({'en':'Clear','pt':'Limpar','es':'Borrar'}[['en','pt','es'][ix()]]));clear.type='button';clear.setAttribute('data-noi18n','');
      var draw=function(){area.textContent='';poolEl.textContent='';
        built.forEach(function(o,k){var b=el('button','chip',o.t);b.type='button';b.disabled=locked;b.addEventListener('click',function(){built.splice(k,1);avail.push(o);draw();touchedFx();});area.appendChild(b);});
        avail.forEach(function(o,k){var b=el('button','chip',o.t);b.type='button';b.disabled=locked||built.length>=ans.length;b.addEventListener('click',function(){avail.splice(k,1);built.push(o);draw();touchedFx();});poolEl.appendChild(b);});
        if(!built.length)area.appendChild(el('span','hint',T('bankHint')));};
      var touchedFx=function(){try{wrap.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}};
      clear.addEventListener('click',function(){if(locked)return;avail=shuf(words);built=[];draw();touchedFx();});
      draw();wrap=el('div','dz-bank fix');wrap.appendChild(area);wrap.appendChild(poolEl);wrap.appendChild(clear);
      cur.canCheck=function(){return built.length===ans.length;};
      cur.get=function(){if(built.length!==ans.length)return {ok:false,msg:TB('fixC'),model:model};return ev(built.map(function(o){return o.t;}).join(' '));};
      cur.lock=function(){locked=true;clear.disabled=true;try{og();}catch(e){}draw();};
    }
    cur.nodes=(cur.nodes||[]).concat([wrap]);
    return true;
  }
  function fixPick(cur,s){
    var fx=cur.fx,words=fx.words,ans=String(s.it.ans[0]).trim().split(/\s+/),p=0,q=0,i;
    while(p<words.length&&p<ans.length&&words[p]===ans[p])p++;
    while(q<words.length-p&&q<ans.length-p&&words[words.length-1-q]===ans[ans.length-1-q])q++;
    var R=ans.slice(p,ans.length-q).join(' '),have={};
    ans.forEach(function(w){have[bare(w)]=1;});
    var traps=[],wrongB={};words.slice(p,words.length-q).forEach(function(w){wrongB[bare(w)]=1;});
    if(R&&R.split(' ').length===1&&!/^[A-Z]/.test(R)){var rb=R.replace(/[.,;:?!]+$/,'');var vv=/ing$/.test(rb)?[rb.slice(0,-3),rb.slice(0,-3)+'s']:/(o|ch|sh|ss|x|z)es$/.test(rb)?[rb.slice(0,-2)]:/s$/.test(rb)?[rb.slice(0,-1)]:/ed$/.test(rb)?[rb.slice(0,-2),rb.slice(0,-2)+'s']:[rb+'s',rb+'ing'];
      var IRR={are:['is','am'],is:['are','am'],am:['is','are'],was:['were'],were:['was'],has:['have'],have:['has'],does:['do'],do:['does'],goes:['go'],go:['goes'],doesn:['don'],can:['could'],could:['can']};
      if(IRR[rb.toLowerCase()])vv=IRR[rb.toLowerCase()];
      /* only offer a trap that is a real word: it must already appear somewhere in the app's text (never "ares" or "areing") */
      var voc=null;try{voc={};(D.body.innerText.toLowerCase().match(/[a-z\u00C0-\u024F']+/g)||[]).forEach(function(w){voc[w]=1;});}catch(e){}
      vv.forEach(function(v){if(v&&v.length>1&&v!==rb&&!wrongB[bare(v)]&&traps.indexOf(v)<0&&(!voc||voc[v.toLowerCase()]||IRR[rb.toLowerCase()]))traps.push(v);});}
    var isEs=!!(W.BL_COURSE&&W.BL_COURSE.id==='es'),gen=shuf((isEs?GEN_ES:GEN_EN).slice());
    gen.forEach(function(w){if(w!==R&&!have[w]&&!wrongB[w]&&traps.indexOf(w)<0)traps.push(w);});
    var fv=(fixN++)%3;if(fv&&fixAlt(cur,s,fv,R,p,q,traps))return;
    var opts=[];if(R)opts.push({t:R,v:R});else opts.push({t:'\u2702 '+T('fixDel'),v:'',del:1});
    traps.slice(0,R?3:4).forEach(function(w){opts.push({t:w,v:w});});
    if(R)opts.push({t:'\u2702 '+T('fixDel'),v:'',del:1});
    opts=shuf(opts);
    var chosen=null,locked=false,list=el('div','pool');list.setAttribute('role','group');
    var lab=fx.lab;if(lab)lab.textContent=T('fixPick');
    fx.hint.textContent=T('fixTap');
    function draw(){list.textContent='';opts.forEach(function(o){var b=el('button','chip'+(o.del?' del':''),o.t);b.type='button';b.disabled=locked;b.setAttribute('aria-pressed',chosen===o?'true':'false');
      if(chosen===o)b.classList.add('on');b.addEventListener('click',function(){if(locked)return;chosen=o;fx.inp.value=o.v;draw();});list.appendChild(b);});}
    draw();
    fx.inp.style.display='none';fx.inp.setAttribute('aria-hidden','true');fx.inp.tabIndex=-1;
    var lb=fx.box.querySelector('label');if(lb)lb.removeAttribute('for');
    fx.box.appendChild(list);
    var og=cur.get,ol=cur.lock;
    cur.canCheck=function(){return fx.sel.size>0&&!!chosen;};
    cur.get=function(){if(!chosen)return {ok:false,msg:T('fixPick'),model:s.it.ans[0]};return og();};
    cur.lock=function(){locked=true;try{ol();}catch(e){}draw();};
  }
  /* Game mode: a native <select> (one-word Lesson Check questions) becomes tappable word chips, like the cloze exercises. */
  function selPick(cur,sel){
    var opts=[].slice.call(sel.options).filter(function(o){return o.value;});if(!opts.length)return false;
    var blank=el('span','dz-blank'),bl=el('span','dz-bl','_____');blank.appendChild(bl);sel.parentNode.insertBefore(blank,sel);
    sel.style.display='none';sel.setAttribute('aria-hidden','true');sel.tabIndex=-1;
    var pool=el('div','pool'),locked=false,btns=[];pool.setAttribute('role','group');
    opts.forEach(function(o){var b=el('button','chip',o.text);b.type='button';b.setAttribute('aria-pressed','false');
      b.addEventListener('click',function(){if(locked)return;sel.value=o.value;sel.dispatchEvent(new Event('change',{bubbles:true}));bl.textContent=o.text;bl.style.cssText='color:inherit;letter-spacing:0;font-weight:700;border-bottom:3px solid #f5c542;padding:0 6px';
        btns.forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false');});});
      btns.push(b);pool.appendChild(b);});
    var wrap=el('div','dz-bank fix cz');wrap.appendChild(pool);
    var nodes=cur.nodes||[],top=-1;nodes.forEach(function(n,i){if(top<0&&n&&n.querySelector&&(n===sel||n.contains(sel)))top=i;});if(top<0)return false;nodes.splice(top+1,0,wrap);cur.nodes=nodes;cur.fixMode=true;
    var ol=cur.lock;cur.lock=function(){locked=true;btns.forEach(function(x){x.disabled=true;});try{ol();}catch(e){}};
    return true;
  }
  function bankify(cur,s,steps){
    try{var selN=null;(cur.nodes||[]).forEach(function(n){if(!selN&&n&&n.querySelector){selN=(n.matches&&n.matches('select.inl'))?n:n.querySelector('select.inl');}});if(selN&&selPick(cur,selN))return;}catch(e){}
    if(cur.fx&&s.it.shown&&s.it.ans&&s.it.ans[0]!=null&&!s.it.nobank){try{fixPick(cur,s);}catch(e){}return;}
    var nodes=cur.nodes||[],inp=null,top=-1,i;
    for(i=0;i<nodes.length&&!inp;i++){var n=nodes[i];if(!n||!n.querySelector)continue;
      var f=(n.matches&&n.matches('input.txt'))?n:n.querySelector('input.txt');if(f){inp=f;top=i;}}
    if(!inp||s.it.nobank)return;
    for(i=0;i<nodes.length;i++){if(nodes[i]&&nodes[i].querySelector&&(nodes[i].querySelector('.tokline')||(nodes[i].classList&&nodes[i].classList.contains('tokline'))))return;}
    var model=(s.it.ans&&s.it.ans[0]!=null)?String(s.it.ans[0]):null;
    var rwn=nodes[top]&&nodes[top].classList&&nodes[top].classList.contains('rwtxt')?nodes[top]:null;
    if(rwn){var ok0=s.it.ok,fx=s.it.fix&&s.it.fix[0];
      /* Duo items do not carry ok/fix: read them from the model answer ("Right" / "Wrong: a → b") so the bank holds only the corrected word */
      if(ok0===undefined||fx===undefined){var gm=null;try{gm=cur.get().model;}catch(e){}
        if(gm){gm=String(gm);if(/^(right|correcto)$/i.test(gm.trim())){ok0=true;}else{var mt=/(?:\u2192|->)\s*(.+)$/.exec(gm);ok0=false;if(mt)fx=mt[1].trim();}}}
      if(ok0){rwn.style.display='none';return;}if(fx)model=String(fx);}
    if(model==null){try{model=cur.get().model;}catch(e){}}
    if(!model)return;
    var toks=String(model).trim().split(/\s+/).filter(Boolean);
    if(!toks.length||toks.length>16)return;
    var have={};toks.forEach(function(t){have[bare(t)]=1;});
    var pool=[];
    steps.forEach(function(o){if(o.g===s.g&&o!==s&&o.it.ans&&o.it.ans[0]!=null)String(o.it.ans[0]).split(/\s+/).forEach(function(w){var b=bare(w);if(b&&!have[b]&&pool.indexOf(w.replace(/[.,;:?!]+$/,''))<0)pool.push(w.replace(/[.,;:?!]+$/,''));});});
    var gen=(W.BL_COURSE&&W.BL_COURSE.id==='es')?GEN_ES:GEN_EN,isEs=!!(W.BL_COURSE&&W.BL_COURSE.id==='es');
    var shownEl=null,shownTxt='';nodes.forEach(function(n){if(n&&n.classList&&n.classList.contains('shown')){var st=n.querySelector&&n.querySelector('s');if(st){shownEl=n;shownTxt=st.textContent;}}});
    var fixMode=!!(shownEl&&toks.length>1);
    var ansW={};(s.it.ans||[model]).concat([model]).forEach(function(a){String(a).split(/\s+/).forEach(function(w){ansW[bare(w)]=1;});});
    gen.forEach(function(w){if(!have[w]&&pool.indexOf(w)<0)pool.push(w);});
    pool=shuf(pool);
    var nEx=toks.length===1?3:(Math.random()<.5?1:0);
    if(fixMode){
      /* "Correct the mistake": the wrong words of the shown sentence and variants of the corrected ones are the best traps */
      var pri=[],sw={};String(shownTxt).split(/\s+/).forEach(function(w){sw[bare(w)]=1;var b=w.replace(/[.,;:?!]+$/,'');if(b&&!ansW[bare(b)]&&pri.indexOf(b)<0)pri.push(b);});
      if(!isEs)toks.forEach(function(t){var b=t.replace(/[.,;:?!]+$/,''),lb=bare(b);if(sw[lb]||lb.length<3||/^[A-Z]/.test(b))return;[b+'s',b.replace(/(ing|ed|es|s)$/,'')].forEach(function(v){if(v&&v.length>1&&!ansW[bare(v)]&&pri.indexOf(v)<0)pri.push(v);});});
      pool=pri.concat(pool.filter(function(w){return pri.indexOf(w)<0;}));
      nEx=4;
    }
    pool=pool.filter(function(w){return !ansW[bare(w)];});
    var words=toks.map(function(t,k){return {t:t,k:k};});
    pool.slice(0,nEx).forEach(function(w,k){words.push({t:w,k:100+k});});
    var avail=shuf(words),built=[],locked=false,cap=toks.length;
    var blank=null;if(inp.parentNode&&inp.parentNode.classList&&inp.parentNode.classList.contains('cloze')){blank=el('span','dz-blank');blank.setAttribute('role','group');inp.parentNode.insertBefore(blank,inp);}
    var area=el('div','area'),poolEl=el('div','pool');area.setAttribute('role','group');poolEl.setAttribute('role','group');
    var clear=el('button','small',{'en':'Clear','pt':'Limpar','es':'Borrar'}[['en','pt','es'][ix()]]);clear.type='button';
    function draw(){
      area.textContent='';poolEl.textContent='';
      built.forEach(function(o,k){var b=el('button','chip',o.t);b.type='button';b.disabled=locked;b.addEventListener('click',function(){built.splice(k,1);avail.push(o);draw();});area.appendChild(b);});
      avail.forEach(function(o,k){var b=el('button','chip',o.t);b.type='button';b.disabled=locked||built.length>=cap;b.addEventListener('click',function(){if(built.length>=cap)return;avail.splice(k,1);built.push(o);draw();});poolEl.appendChild(b);});
      if(!built.length)area.appendChild(el('span','hint',T('bankHint')));
      if(blank){blank.textContent='';for(var q=0;q<cap;q++){if(q)blank.appendChild(D.createTextNode(' '));
        if(q<built.length){(function(k,ob){var bw=el('button','dz-bw',ob.t);bw.type='button';bw.disabled=locked;bw.addEventListener('click',function(){built.splice(k,1);avail.push(ob);draw();});blank.appendChild(bw);})(q,built[q]);}
        else blank.appendChild(el('span','dz-bl','_____'));}}
    }
    clear.addEventListener('click',function(){if(locked)return;avail=shuf(words);built=[];draw();});
    draw();
    inp.style.display='none';inp.setAttribute('aria-hidden','true');inp.tabIndex=-1;
    clear.className='small dz-undo';clear.textContent='\u21BA '+({'en':'Clear','pt':'Limpar','es':'Borrar'}[['en','pt','es'][ix()]]);
    var wrap=el('div','dz-bank'+(fixMode?' fix':''));if(!blank)wrap.appendChild(area);wrap.appendChild(poolEl);wrap.appendChild(clear);
    if(blank){wrap.className='dz-bank fix cz';clear.className='small dz-undo';clear.textContent='\u21BA '+({'en':'Clear','pt':'Limpar','es':'Borrar'}[['en','pt','es'][ix()]]);cur.fixMode=true;}
    if(fixMode){
      clear.className='small dz-undo';clear.textContent='\u21BA '+({'en':'Clear','pt':'Limpar','es':'Borrar'}[['en','pt','es'][ix()]]);
      for(i=0;i<nodes.length;i++){var sh=nodes[i];if(sh===shownEl){
        sh.textContent='';sh.classList.add('dz-wrong');
        String(shownTxt).split(/(\s+)/).forEach(function(w){var b=bare(w);if(b&&!have[b]){var m=w.match(/^([^\w\u00C0-\u024F]*)(.*?)([^\w\u00C0-\u024F]*)$/);sh.appendChild(D.createTextNode(m[1]));sh.appendChild(el('em','',m[2]));sh.appendChild(D.createTextNode(m[3]));}else sh.appendChild(D.createTextNode(w));});
        nodes.splice(i+1,0,el('div','dz-arrow','\u2193'));top++;break;}}
      cur.fixMode=true;
    }
    nodes.splice(top+1,0,wrap);cur.nodes=nodes;
    var og=cur.get,ol=cur.lock;
    cur.get=function(){inp.value=built.map(function(o){return o.t;}).join(' ');return og();};
    cur.lock=function(){locked=true;clear.disabled=true;try{ol();}catch(e){}draw();};
  }

  function gm(fn){try{if(W.Medals&&Medals.game)Medals.game(fn);}catch(e){}}
  function xpKey(){return 'bl-xp'+((W.BL_COURSE&&W.BL_COURSE.id)?'-'+W.BL_COURSE.id:'');}
  function xpGet(){try{return parseInt(localStorage.getItem(xpKey()),10)||0;}catch(e){return 0;}}
  /* XP is kept on this device and mirrored in the student's row of game_xp (the larger value wins, so it never goes down) */
  var xpT=null;
  function xpSync(){try{if(!W.Gate||!Gate.sb)return;Gate.sb.auth.getSession().then(function(r){var u=r&&r.data&&r.data.session&&r.data.session.user;if(!u)return;
    Gate.sb.from('game_xp').select('xp').eq('user_id',u.id).maybeSingle().then(function(q){var rem=(q&&q.data&&q.data.xp)||0,loc=xpGet(),m=Math.max(rem,loc);
      if(m!==loc){try{localStorage.setItem(xpKey(),String(m));}catch(e){}}
      if(m!==rem)Gate.sb.from('game_xp').upsert({user_id:u.id,xp:m,updated_at:new Date().toISOString()}).then(function(){},function(){});
    },function(){});},function(){});}catch(e){}}
  function xpAdd(n){try{localStorage.setItem(xpKey(),String(xpGet()+n));}catch(e){}clearTimeout(xpT);xpT=setTimeout(xpSync,1500);}
  function lvlOf(x){var l=1;while(x>=l*(l+1)*25)l++;return l;}
  function lvlInfo(x){var l=lvlOf(x),a=(l-1)*l*25,b=l*(l+1)*25;return {l:l,p:Math.round((x-a)/(b-a)*100)};}

  function start(o){
    if(D.getElementById('bl-duo'))return;
    css();
    var groups=(o.groups||[]).filter(function(g){return g.items&&g.items.length;});
    if(!groups.length)return;
    var steps=[];groups.forEach(function(g){g.right=0;g.n=0;g.pre_=null;g.items.forEach(function(it){steps.push({g:g,it:it});});});
    var total=steps.length,idx=0,right=0,cur=null,state='ask',anySaved=false,failed=false,pending=[];
    xpSync();var game=gameOn(),lives=3,combo=0,over=false,wrongs=[],rv=false,mainTotal=0,sessXP=0,xp0=xpGet(),rvOk=0,pill=null,lifeEls=[],comboEl=null,noLives=!!o.nolives;
    var prevOverflow=D.body.style.overflow;D.body.style.overflow='hidden';
    var root=el('div');root.id='bl-duo';if(game)root.className='game';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',T('cta'));
    var top=el('div','dz-top'),x=el('button','dz-x','✕');x.type='button';x.setAttribute('aria-label',T('close'));
    var bar=el('div','dz-bar'),fill=el('div','dz-fill');bar.appendChild(fill);
    bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');
    var sb=el('button','dz-snd','🔔');sb.type='button';sb.setAttribute('aria-label',T('snd'));if(!sndOn())sb.className+=' off';
    top.appendChild(x);top.appendChild(bar);
    if(game&&!noLives){var lv=el('div','dz-lives');lv.setAttribute('role','img');
      for(var li=0;li<3;li++){var sp=el('span','dz-life gold'),im=el('img');im.src='img/lion-gold.png';im.alt='';sp.appendChild(im);sp.appendChild(el('span','fire','🔥'));lv.appendChild(sp);lifeEls.push(sp);}
      top.appendChild(lv);}
    top.appendChild(sb);
    var main=el('div','dz-main'),inn=el('div','dz-in');main.appendChild(inn);
    var foot=el('div','dz-foot'),fbw=el('div','dz-fbw'),fb=el('div','dz-fb');fb.setAttribute('aria-live','polite');fb.hidden=true;
    var btn=el('button','dz-btn',TB('check'));btn.type='button';btn.setAttribute('data-noi18n','');
    if(game){comboEl=el('div','dz-combo');comboEl.setAttribute('aria-live','polite');comboEl.setAttribute('data-noi18n','');pill=el('div','dz-pill');}
    fbw.appendChild(fb);if(comboEl)foot.appendChild(comboEl);foot.appendChild(fbw);foot.appendChild(btn);
    root.appendChild(top);root.appendChild(main);root.appendChild(foot);
    if(pill)root.appendChild(pill);
    D.body.appendChild(root);

    function lifeLabel(){var l=top.querySelector('.dz-lives');if(l)l.setAttribute('aria-label',T('lives',{n:lives}));}
    function setLife(k,gold){var sp=lifeEls[k],im=sp.firstChild;sp.className='dz-life '+(gold?'gold':'dead');im.src=gold?'img/lion-gold.png':'img/lion-off.png';}
    function lose(){
      if(noLives||lives<=0)return;lives--;var k=lives;var sp=lifeEls[k];
      sp.className='dz-life burn';flame();
      setTimeout(function(){setLife(k,false);},1400);
      lifeLabel();if(lives<=0){over=true;if(game)gm(function(d){d.l3=1;});}
    }
    function gain(){
      for(var k=0;k<3;k++){if(!lifeEls[k].classList.contains('gold')&&!lifeEls[k].classList.contains('burn')){setLife(k,true);lifeEls[k].classList.add('gain');lives++;break;}}
      lifeLabel();bell();
    }
    function updCombo(){if(!comboEl)return;comboEl.textContent=(game&&lives<3&&lives>0)?TB('combo',{n:combo}):'';}
    function setBar(n){var p=Math.round(n/total*100);fill.style.width=p+'%';bar.setAttribute('aria-valuenow',String(p));}
    function touched(){if(state!=='ask')return;btn.disabled=!!(cur&&cur.canCheck&&!cur.canCheck());}
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
    function leave(){close();var nv=function(){W.location.href='index.html';};Promise.all(pending).then(nv,nv);}
    function quit(){var done=idx>=total;if(done)return close();
      if(!game){var qd=function(a){return a[ix()];};if(W.BL_DLG)W.BL_DLG.confirm(T('quit'),{danger:false,title:qd(['Leave this practice?','Sair desta prática?','¿Salir de esta práctica?']),ok:qd(['Leave','Sair','Salir']),cancel:qd(['Keep going','Continuar','Seguir'])}).then(function(k){if(k)close();});else if(W.confirm(T('quit')))close();return;}
      var made=idx+(state==='ask'?0:1);if(made<1)return leave();
      if(root.querySelector('.dz-xq'))return;
      var pop=el('div','dz-pop dz-xq'),card=el('div','dz-card');pop.setAttribute('role','alertdialog');pop.setAttribute('data-noi18n','');pop.setAttribute('aria-label',T('qtitle'));
      var img=el('img','dz-lion');img.src='img/lion-off.png';img.alt='';img.width=90;img.height=105;card.appendChild(img);
      card.appendChild(el('h2','',T('qtitle')));
      card.appendChild(el('p','big',T('qprog',{a:made,b:total})));
      var pb=el('div','dz-xpb'),pf=el('i');pf.style.width=Math.round(made/total*100)+'%';pb.appendChild(pf);card.appendChild(pb);
      card.appendChild(el('p','sv',T('qleft',{n:total-made})));
      var kb=el('button','dz-btn',T('qkeep'));kb.type='button';kb.addEventListener('click',function(){if(pop.parentNode)pop.parentNode.removeChild(pop);});
      var mb=el('button','dz-btn dz-ghost',T('map'));mb.type='button';mb.addEventListener('click',function(){mb.disabled=true;leave();});
      var row=el('div','dz-row');row.appendChild(kb);row.appendChild(mb);card.appendChild(row);pop.appendChild(card);root.appendChild(pop);
      try{kb.focus();}catch(e){}}
    x.addEventListener('click',quit);
    sb.addEventListener('click',function(){var on=!sndOn();try{localStorage.setItem('bl-duo-snd',on?'1':'0');}catch(e){}sb.className='dz-snd'+(on?'':' off');if(on)bell();});

    function show(){
      state='ask';foot.className='dz-foot';fb.hidden=true;fb.textContent='';
      btn.textContent=TB('check');btn.disabled=true;
      inn.textContent='';
      var s=steps[idx],g=s.g;
      if(game){var sc=el('div','dz-scene'),pw=el('div','dz-peep'),pi=el('img');pi.src=nextPeep();pi.alt='';pw.style.background=PBG[Math.floor(Math.random()*PBG.length)];if(Math.random()<.5)pi.style.transform='scaleX(-1)';pw.appendChild(pi);
      var bub=el('div','dz-bub'),chip=el('div','dz-chip',((rv?T('rvTitle'):(g.title?g.title+' · ':''))+(rv?' · ':'')+T('q',{a:idx+1,b:total})).toUpperCase());
      sc.appendChild(pw);sc.appendChild(bub);inn.appendChild(chip);}else inn.appendChild(el('p','dz-lab',(g.title?g.title+' · ':'')+T('q',{a:idx+1,b:total})));
      if(g.pre){if(!g.pre_){g.pre_=g.pre()||[];if(game&&W.I18N&&W.I18N.ptx){var pn=[];g.pre_.forEach(function(n){pn.push(n);if(n&&n.className==='instr'){var tt=W.I18N.ptx(n.textContent),mm=/^([\s\S]*?)\s*(?:Gramática|Grammar):\s*([\s\S]+)$/.exec(tt);if(mm){n.textContent=mm[1];var gl=el('p','dz-gram','Gramática: '+mm[2]);gl.setAttribute('data-noi18n','');pn.push(gl);}else n.textContent=tt;n.setAttribute('data-noi18n','');}});g.pre_=pn;}}if(g.pre_.length){var pw=el('div','dz-pre');g.pre_.forEach(function(n){if(n)pw.appendChild(n);});inn.appendChild(pw);}}
      if(game)inn.appendChild(sc);
      cur=s.it.make();var skipN=null;
      if(game){var qe=null,ns=cur.nodes||[];for(var qi=0;qi<ns.length&&!qe;qi++){var nn=ns[qi];if(!nn||!nn.querySelector)continue;qe=(nn.classList&&nn.classList.contains('q'))?nn:nn.querySelector('.q');}
        if(qe&&qe.textContent.trim()){var dd=dialogOf(cur,qe);
          if(dd){var A=dd.sw?{n:dd.n2,cl:dd.cl}:{n:dd.n1,t:dd.t1},B=dd.sw?{n:dd.n1,t:dd.t1}:{n:dd.n2,cl:dd.cl};
            bub.appendChild(el('span','dz-nm',A.n));bub.appendChild(A.cl?A.cl:el('b','',A.t));
            var a1=peepNo(A.n,0),a2=peepNo(B.n,a1),i1=sc.querySelector('img');
            i1.src=PEEPS[a1-1];i1.style.transform='';i1.parentNode.style.background=PBG[nameHash(plain(A.n))%PBG.length];
            var sc2=el('div','dz-scene rev'),pw2=el('div','dz-peep'),pi2=el('img'),bub2=el('div','dz-bub');
            pi2.src=PEEPS[a2-1];pi2.alt='';pi2.style.transform='scaleX(-1)';pw2.style.background=PBG[nameHash(plain(B.n))%PBG.length];
            pw2.appendChild(pi2);bub2.appendChild(el('span','dz-nm',B.n));bub2.appendChild(B.cl?B.cl:el('b','',B.t));sc2.appendChild(pw2);sc2.appendChild(bub2);inn.appendChild(sc2);skipN=dd.cl;}
          else bub.appendChild(el('b','',(s.it.shown&&/^Correct the sentence\.?$/i.test(qe.textContent.trim()))?T('fixQ'):qe.textContent.trim()));qe.className+=' dz-sr';if(!(dd&&dd.sw))bub.setAttribute('aria-hidden','true');}
        else{var gt=g.title||'';if(/^Match the pictures with the words/i.test(gt))gt=['Choose the word that matches each picture.','Escolha a palavra que combina com a figura.','Elige la palabra que corresponde a cada imagen.'][(ix()===0&&!(W.BL_COURSE&&W.BL_COURSE.id==='es'))?1:ix()];
          if(gt){chip.textContent=T('q',{a:idx+1,b:total}).toUpperCase();bub.appendChild(el('b','',gt));}else bub.appendChild(el('p','dz-lab',T('q',{a:idx+1,b:total})));}}
      if(game){try{(cur.nodes||[]).forEach(function(n){if(!n||!n.querySelectorAll)return;var bs=(n.matches&&n.matches('button.small'))?[n]:[].slice.call(n.querySelectorAll('button.small'));bs.forEach(function(b){if(/^(clear|limpar|borrar)$/i.test(b.textContent.trim())&&!b.classList.contains('dz-undo')){b.classList.add('dz-undo');b.textContent='\u21BA '+({'en':'Clear','pt':'Limpar','es':'Borrar'}[['en','pt','es'][ix()]]);b.setAttribute('data-noi18n','');}});});}catch(e){}}
      if(game){try{var bb0=bub.querySelector('b'),gg0=inn.querySelector('.dz-gram');
        if(bb0&&gg0&&/^(complete a frase|corrija a frase|monte a frase|complete la frase|corrige la frase|ordena la frase|complete the sentence|correct the sentence|put the words in order|build the sentence)\.?$/i.test(bb0.textContent.trim())){bb0.textContent='\uD83D\uDCA1 '+gg0.textContent.replace(/\s*\(.*$/,'');bb0.setAttribute('data-noi18n','');gg0.style.display='none';}}catch(e){}}
      if(game)bankify(cur,s,steps);
      if(game&&cur.altFix){try{var bb1=bub.querySelector('b');if(bb1){bb1.textContent=cur.bubText;bb1.setAttribute('data-noi18n','');}var pp1=inn.querySelector('.dz-pre');if(pp1)pp1.style.display='none';}catch(e){}}
      var q=el('div','dz-q'+(cur.fixMode?' fix':''));(cur.nodes||[]).forEach(function(n){if(n&&n!==skipN)q.appendChild(n);});inn.appendChild(q);
      main.scrollTop=0;setBar(idx);
      var f=inn.querySelector('input:not([type=radio]),select');if(f){try{f.focus({preventScroll:true});}catch(e){}}
    }
    function markOpts(r){try{var labs=[].slice.call(root.querySelectorAll('.dz-q label.opt')),norm=function(t){return String(t).replace(/\s+/g,' ').trim();},mod=r.model?norm(r.model):'';
      labs.forEach(function(l){var inp=l.querySelector('input'),on=!!(inp&&inp.checked);
        if(r.ok){if(on)l.classList.add('dz-right');}
        else if(mod&&norm(l.textContent)===mod)l.classList.add('dz-right');
        else if(on)l.classList.add('dz-wrongpick');
        else l.classList.add('dz-dim');});}catch(e){}}
    function doCheck(){
      var s=steps[idx],g=s.g,r=cur.get();
      try{cur.lock();}catch(e){}
      if(game)markOpts(r);
      state='done';btn.disabled=false;
      if(!rv){g.n++;if(r.ok){g.right++;right++;}else wrongs.push(s);}else if(r.ok)rvOk++;
      foot.className='dz-foot '+(r.ok?'ok':'bad');
      fb.hidden=false;fb.textContent='';
      var h3=el('h3','');h3.appendChild(el('span','dz-ic',r.ok?'✓':'✕'));h3.appendChild(D.createTextNode(r.ok?T('ok'):T('bad')));fb.appendChild(h3);
      if(!r.ok&&r.msg&&!/model answer/i.test(r.msg))fb.appendChild(el('p','',r.msg));
      if(r.ok&&r.warn)fb.appendChild(el('p','',r.warn));
      if(r.model&&!r.ok)fb.appendChild(el('p','',T('model')+': '+r.model));
      if(!r.ok&&s.it.why)fb.appendChild(whyBtn(s.it.why));
      if(game){
        if(r.ok){combo++;if(game&&(combo===10||combo===25))gm(function(d){if((d.mc||0)<combo)d.mc=combo;});var gx=rv?5:(10+(combo>=3?5:0));sessXP+=gx;xpAdd(gx);fb.appendChild(el('p','dz-xp',T('xp',{n:gx})));
          if(combo>=3&&pill){pill.textContent=T('pill',{n:combo});pill.classList.remove('on');void pill.offsetWidth;pill.classList.add('on');}
          if(lives<3&&lives>0&&combo>=5){combo=0;gain();fb.appendChild(el('p','',T('back')));}else bell();}
        else{combo=0;if(!rv)lose();buzz();}
        updCombo();
      }else (r.ok?bell:buzz)();
      setBar(idx+1);
      var last=!rv&&g.n===g.items.length;
      if(last&&g.save){
        var pr;try{pr=Promise.resolve(g.save(g.right,g.items.length));}catch(e){pr=Promise.reject(e);}
        anySaved=true;pending.push(pr.catch(function(){failed=true;}));
      }
      btn.textContent=(over||idx+1>=total)?(over?TB('over'):((game&&!rv&&wrongs.length)?TB('cont'):TB('fin'))):TB('cont');
      try{btn.focus();}catch(e){}
    }
    function gameOver(){
      inn.textContent='';fb.hidden=true;foot.style.display='none';state='end';
      var pop=el('div','dz-pop dz-over'),card=el('div','dz-card');pop.setAttribute('role','alertdialog');pop.setAttribute('aria-label',T('over'));pop.setAttribute('data-noi18n','');
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
    function startReview(){
      rv=true;mainTotal=total;steps=wrongs.map(function(w){return {g:w.g,it:w.it};});total=steps.length;idx=0;
      inn.textContent='';fb.hidden=true;foot.className='dz-foot';
      var w=el('div','dz-end');var h2=el('h2','',T('rvTitle')),pp=el('p','',TB('rvIntro'));h2.setAttribute('data-noi18n','');pp.setAttribute('data-noi18n','');w.appendChild(h2);w.appendChild(pp);inn.appendChild(w);
      btn.textContent=TB('cont');btn.disabled=false;state='intro';
    }
    function next(){if(over){gameOver();return;}idx++;if(idx>=total){if(game&&!rv&&wrongs.length){startReview();}else end();}else show();}
    function popup(){
      var fly=avatarFly();
      if(!game)fanfare();else roar();
      confetti();
      setTimeout(function(){if(root.parentNode)buildPop();},fly?2950:0);
    }
    var TKT={pt:{done:'ESTAÇÃO COMPLETA',no:'AINDA NÃO',ok:'Acertos',of:'de',xp:'XP ganho',lv:'Nível',up:'subiu de nível!',st:'Estrelas',map:'Voltar ao mapa',close:'Fechar',next:'Próximo'},
      en:{done:'STATION COMPLETE',no:'NOT YET',ok:'Correct',of:'of',xp:'XP earned',lv:'Level',up:'level up!',st:'Stars',map:'Back to map',close:'Close',next:'Next'},
      es:{done:'ESTACIÓN COMPLETADA',no:'TODAVÍA NO',ok:'Aciertos',of:'de',xp:'XP ganado',lv:'Nivel',up:'¡subiste!',st:'Estrellas',map:'Volver al mapa',close:'Cerrar',next:'Siguiente'}};
    var WHO={shakespeare:['William Shakespeare','Playwright and poet'],curie:['Marie Curie','Physicist and chemist'],newton:['Isaac Newton','Physicist and mathematician'],darwin:['Charles Darwin','Naturalist'],lincoln:['Abraham Lincoln','16th US president'],franklin:['Benjamin Franklin','Inventor and statesman'],mlk:['Martin Luther King Jr.','Civil rights leader'],austen:['Jane Austen','Novelist'],christie:['Agatha Christie','Crime novelist'],angelou:['Maya Angelou','Poet and author'],parks:['Rosa Parks','Civil rights activist'],alice:['Alice','Girl from Wonderland'],sherlock:['Sherlock Holmes','Fictional detective'],peter:['Peter Pan','The boy who never grew up'],arthur:['King Arthur','Legendary king of Britain'],wilde:['Oscar Wilde','Playwright and wit'],joyce:['James Joyce','Novelist'],yeats:['W. B. Yeats','Poet'],elizabeth2:['Queen Elizabeth II','Queen of the United Kingdom'],
      cervantes:['Miguel de Cervantes','Escritor'],frida:['Frida Kahlo','Pintora'],goya:['Francisco de Goya','Pintor'],picasso:['Pablo Picasso','Pintor'],velazquez:['Diego Velázquez','Pintor'],bolivar:['Simón Bolívar','Libertador'],isabel:['Isabel la Católica','Reina de Castilla'],sanmartin:['José de San Martín','Libertador']};
    var CTRY={usa:'USA',england:'England',poland:'Poland',scotland:'Scotland',wales:'Wales',ireland:'Ireland',uk:'UK','flag-es.png':'España','flag-mx.png':'México','flag-ve.png':'Venezuela','flag-ar.png':'Argentina'};
    function buildTicketPop(){
      var X=TKT[B?'es':(uix()===1?'pt':uix()===2?'es':'en')],pct=total?right/total:0,stars=pct>=.9?3:pct>=.6?2:1,passMin=typeof o.passMin==='number'?o.passMin:0,passed=pct>=passMin;
      (function(){var si=o.station;if(!game||!passed)return;var k=si&&si.city&&si.station?si.city+'|'+si.station:null,hr=new Date().getHours(),td=new Date(),ds=td.getFullYear()+'-'+String(td.getMonth()+1).padStart(2,'0')+'-'+String(td.getDate()).padStart(2,'0'),clean=!noLives&&lives===3&&!rv;
        gm(function(d){if(k){d.st=d.st||{};d.st[k]=1;}if(clean&&k)d.fl=1;if(hr<5)d.mn=1;d.gd=d.gd||[];if(d.gd.indexOf(ds)<0){d.gd.push(ds);if(d.gd.length>90)d.gd.shift();}});})();
      var nx=null;try{nx=o.next?o.next():null;}catch(e){}
      var ch=pickCh(),who=WHO[ch.id]||[ch.id,''],ctry=CTRY[ch.cc]||'',inf=o.station||{};
      var pop=el('div','dz-pop'),card=el('div','dz-card tkc');pop.setAttribute('role','alertdialog');pop.setAttribute('aria-label',X.done);
      var lg=el('div','tk-logo');lg.appendChild(document.createTextNode('BRITLAND'));lg.appendChild(el('i','','ACADEMY'));card.appendChild(lg);
      var w=el('div','tk-w'),xx=el('div','tk-x'),tk=el('div','tk');
      var hd=el('div','tk-hd'),ln=el('span','tk-ln'),bd=el('span','tk-bdg');bd.style.background=inf.color||'#dc241f';
      bd.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="15" rx="4" fill="'+(inf.ink||'#fff')+'"/><rect x="7.3" y="4.6" width="9.4" height="5" rx="1.3" fill="'+(inf.color||'#dc241f')+'"/><circle cx="8.8" cy="13.2" r="1.2" fill="'+(inf.color||'#dc241f')+'"/><circle cx="15.2" cy="13.2" r="1.2" fill="'+(inf.color||'#dc241f')+'"/><path d="M7.5 21l2.2-3.4M16.5 21l-2.2-3.4" stroke="'+(inf.ink||'#fff')+'" stroke-width="1.8" stroke-linecap="round"/></svg>';
      ln.appendChild(bd);ln.appendChild(document.createTextNode(String(inf.line||'BRITLAND').toUpperCase()));hd.appendChild(ln);
      if(inf.flagHTML){var fl=el('span','tk-fl');fl.innerHTML=inf.flagHTML;hd.appendChild(fl);}
      tk.appendChild(hd);tk.appendChild(el('div','tk-st',inf.station||T('gdone')));
      tk.appendChild(el('span','tk-sp'+(passed?'':' no'),passed?X.done:X.no));tk.appendChild(el('hr'));
      var dl=el('dl');function cell(k,v){var d=el('div');d.appendChild(el('dt','',k));var dd=el('dd');if(typeof v==='string')dd.textContent=v;else dd.appendChild(v);d.appendChild(dd);dl.appendChild(d);}
      var l1=lvlInfo(xp0),l2=lvlInfo(xp0+sessXP),lvTxt=sessXP>0?(l2.l+(l2.l>l1.l?' · '+X.up:'')):String(l1.l);
      cell(X.ok,right+' '+X.of+' '+total);cell(X.xp,sessXP>0?'+'+sessXP:'—');cell(X.lv,lvTxt);
      var sw=el('span','tk-stars');sw.setAttribute('aria-label',stars+' / 3');for(var i=0;i<3;i++){var sp=el('span',i<stars?'on':'','★');if(i<stars)sp.style.animationDelay=(2.7+i*.45)+'s';sw.appendChild(sp);}cell(X.st,sw);
      tk.appendChild(dl);
      if(o.verdict){try{var vt=o.verdict(right,total);if(vt)tk.appendChild(el('p','tk-vd',vt));}catch(e){}}
      if(stars===3&&passed)tk.appendChild(el('div','tk-sw'));
      xx.appendChild(tk);w.appendChild(xx);card.appendChild(w);
      var cur=el('div','tk-cur'),pw=el('div','tk-pw'),pt=el('div','tk-pt'),im=el('img');im.src=ch.img;im.alt='';pt.appendChild(im);pw.appendChild(pt);
      var wh=el('div','tk-who');wh.appendChild(el('b','',who[0]));var cc=el('div','c'),fi=el('img');fi.src=ch.flag;fi.alt='';cc.appendChild(fi);cc.appendChild(document.createTextNode(ctry));wh.appendChild(cc);if(who[1])wh.appendChild(el('small','',who[1]));pw.appendChild(wh);cur.appendChild(pw);
      var say=ch.say[3-stars],sb=el('div','tk-say',say[0]);sb.appendChild(el('em','',say[1]));cur.appendChild(sb);card.appendChild(cur);
      var sv=el('p','sv',T('saved'));card.appendChild(sv);
      var row=el('div','dz-row');
      if(nx){var nb=el('button','dz-btn',X.next);nb.type='button';nb.addEventListener('click',function(){close();setTimeout(nx,60);});row.appendChild(nb);}
      var home=!/(^|\/)index\.html$|\/$/.test(W.location.pathname),mb=null;
      if(home){mb=el('button','dz-btn',X.map);mb.type='button';mb.addEventListener('click',function(){mb.disabled=true;Promise.all(pending).then(function(){},function(){}).then(function(){W.location.href='index.html';});});row.insertBefore(mb,row.firstChild);if(nb)nb.className='dz-btn dz-ghost';}
      var cb=el('button',nx||mb?'dz-btn dz-ghost':'dz-btn',X.close);cb.type='button';cb.addEventListener('click',close);row.appendChild(cb);
      card.appendChild(row);pop.appendChild(card);root.appendChild(pop);
      /* sounds: ticket whoosh, stamp thud, one chime per star, station ding-dong on 3 stars */
      if(sndOn()){try{noise(0,.8,.16,500,3000);var v=stars===1?.28:.5;tone(110,1.8,.22,'sine',v);noise(1.8,.08,v*.7,1800,300);
        for(var q=0;q<stars;q++)tone(1046.5*Math.pow(1.122,q*2),2.7+q*.45,.5,'sine',.14);
        if(stars===3&&passed){tone(660,4.3,.5,'sine',.18);tone(523,4.75,.8,'sine',.18);[1760,2093,2637].forEach(function(x,i){tone(x,3.1+i*.07,.4,'triangle',.05);});}}catch(e){}}
      if(right===total&&total>0)setTimeout(function(){if(root.parentNode)fireworks(root);},2700);
      Promise.all(pending).then(function(){if(failed)sv.textContent=T('nosave');});
      setTimeout(function(){try{(mb||nb||cb).focus();}catch(e){}},4300);
    }
    function buildPop(){
      if(game){buildTicketPop();return;}
      var pct=total?right/total:0,stars=pct>=.9?3:pct>=.6?2:1;
      var nx=null;try{nx=o.next?o.next():null;}catch(e){}
      var pop=el('div','dz-pop'),card=el('div','dz-card');pop.setAttribute('role','alertdialog');pop.setAttribute('aria-label',T('gdone'));pop.setAttribute('data-noi18n','');
      var lg=el('div','dz-logo'),li=el('img');li.src='img/britland-shield.png';li.alt='';lg.appendChild(li);lg.appendChild(el('b','','BRITLAND'));lg.appendChild(el('i','','ACADEMY'));lg.appendChild(el('u',''));card.appendChild(lg);
      var ch=pickCh();card.appendChild(flagRow(ch));setTimeout(function(){if(root.parentNode)playTune(tuneKey(ch.flag));},300);
      var hero=el('div','dz-hero');hero.appendChild(famBox(ch));hero.appendChild(medal(stars));card.appendChild(hero);
      var say=ch.say[3-stars],sy=el('p','dz-say',say[1]);card.appendChild(sy);
      var st=el('div','dz-stars');st.setAttribute('aria-label',stars+' / 3');
      for(var i=0;i<3;i++){var sp=el('span',i<stars?'on':'off','★');sp.style.animationDelay=(.5+i*.25)+'s';st.appendChild(sp);}
      card.appendChild(st);
      if(o.verdict){try{var vt=o.verdict(right,total);if(vt)card.appendChild(el('p','dz-say',vt));}catch(e){}}
      for(var q=0;q<stars;q++)(function(q){setTimeout(function(){if(root.parentNode)tone(1046.5*Math.pow(1.122,q*2),0,.5,'sine',.14);},500+q*250);})(q);
      card.appendChild(el('h2','',T('gdone')));
      card.appendChild(el('p','big',T('gscore',{r:right,t:total})));
      if(sessXP>0){card.appendChild(el('p','dz-xp',T('xpGot',{n:sessXP})));if(rv&&rvOk===steps.length)card.appendChild(el('p','dz-xp',T('rvPerfect')));
        var l1=lvlInfo(xp0),l2=lvlInfo(xp0+sessXP),lv2=el('div','dz-lvl',T('lvl',{n:l2.l})+(l2.l>l1.l?' · '+T('lvlUp'):''));var bb=el('i'),bi=el('b');bi.style.width=l2.p+'%';bb.appendChild(bi);lv2.appendChild(bb);card.appendChild(lv2);}
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
      if(rv){total=mainTotal;idx=total;if(rvOk===steps.length){sessXP+=20;xpAdd(20);if(game)gm(function(d){d.rv=1;});}}
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
      btn.textContent=TB('fin');btn.disabled=false;state='end';
      if(pct>=.5){confetti();fanfare();}
      Promise.all(pending).then(function(){if(failed)st.textContent=T('nosave');});
    }
    btn.addEventListener('click',function(){
      if(state==='ask')doCheck();
      else if(state==='intro')show();
      else if(state==='done')next();
      else if(state==='end')close();
    });
    show();
  }

  function cta(onclick){
    var d=el('div','duo-cta');
    if(!gameOn()){
      var a=el('button','btn primary','▶ '+T('ctaOn'));a.type='button';
      a.addEventListener('click',function(){try{localStorage.setItem('bl-game','1');localStorage.setItem('bl-tfx','in:'+Date.now());}catch(e){}location.reload();});
      d.appendChild(a);d.appendChild(el('p','',T('ctaOnHint')));return d;
    }
    var b=el('button','btn primary','▶ '+T('cta'));b.type='button';b.addEventListener('click',function(){actx();onclick();});
    d.appendChild(b);d.appendChild(el('p','',T('ctaHint')));
    return d;
  }
  W.Duo={start:start,cta:cta,T:T,game:gameOn};
})();
