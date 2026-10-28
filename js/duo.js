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
    snd:['Sound on/off','Som ligado/desligado','Sonido activado/desactivado'],
    gdone:['Activity complete!','Atividade concluída!','¡Actividad completada!'],
    gnext:['Next activity','Próxima atividade','Siguiente actividad'],
    gscore:['{r} of {t} correct','{r} de {t} certas','{r} de {t} correctas']
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
  function bell(){if(!sndOn())return;tone(1318.5,0,1.1,'sine',.2);tone(2637,0,.5,'sine',.06);tone(1760,.13,1.3,'sine',.2);tone(3520,.13,.5,'sine',.05);}
  function buzz(){if(!sndOn())return;tone(233,0,.26,'triangle',.16);tone(175,.13,.34,'triangle',.15);}
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
'.dz-conf{position:fixed;top:-20px;font-size:1.6rem;pointer-events:none;z-index:99995;animation:dz-fall 2.6s ease-in forwards}'+
'@keyframes dz-fall{to{transform:translateY(110vh) rotate(540deg);opacity:.9}}'+
'@media (prefers-reduced-motion:reduce){#bl-duo .dz-fill{transition:none}.dz-conf{display:none}#bl-duo .dz-lion,#bl-duo .dz-card,#bl-duo .dz-stars span{animation:none;opacity:1}}';
    D.head.appendChild(s);
  }

  function confetti(){
    if(W.matchMedia&&W.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    var E=['🎉','⭐','✨','🎊','🟡'];
    for(var i=0;i<28;i++){var c=el('span','dz-conf',E[i%E.length]);c.style.left=(Math.random()*100)+'vw';c.style.animationDelay=(Math.random()*.9)+'s';c.style.fontSize=(1.1+Math.random()*1.2)+'rem';D.body.appendChild(c);
      (function(n){setTimeout(function(){if(n.parentNode)n.parentNode.removeChild(n);},4200);})(c);}
  }

  function whyBtn(w){
    var p=el('p','why-txt');p.hidden=true;
    var b=el('button','small why-btn',T('why'));b.type='button';b.setAttribute('aria-expanded','false');
    b.addEventListener('click',function(){var open=p.hidden;if(open)p.textContent=w[ix()]||w[0];p.hidden=!open;b.setAttribute('aria-expanded',open?'true':'false');});
    var d=el('div','why');d.appendChild(b);d.appendChild(p);return d;
  }

  function gameOn(){try{return localStorage.getItem('bl-game')==='1';}catch(e){return false;}}
  function roar(){if(!sndOn())return;try{var a=new Audio((W.BL_BASE||'')+'js/sfx/roar.mp3');a.volume=.9;var pr=a.play();if(pr&&pr.catch)pr.catch(function(){});}catch(e){}}
  function start(o){
    if(D.getElementById('bl-duo'))return;
    css();
    var groups=(o.groups||[]).filter(function(g){return g.items&&g.items.length;});
    if(!groups.length)return;
    var steps=[];groups.forEach(function(g){g.right=0;g.n=0;g.pre_=null;g.items.forEach(function(it){steps.push({g:g,it:it});});});
    var total=steps.length,idx=0,right=0,cur=null,state='ask',anySaved=false,failed=false,pending=[];
    var prevOverflow=D.body.style.overflow;D.body.style.overflow='hidden';
    var root=el('div');root.id='bl-duo';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',T('cta'));
    var top=el('div','dz-top'),x=el('button','dz-x','✕');x.type='button';x.setAttribute('aria-label',T('close'));
    var bar=el('div','dz-bar'),fill=el('div','dz-fill');bar.appendChild(fill);
    bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');
    var sb=el('button','dz-snd','🔔');sb.type='button';sb.setAttribute('aria-label',T('snd'));if(!sndOn())sb.className+=' off';
    top.appendChild(x);top.appendChild(bar);top.appendChild(sb);
    var main=el('div','dz-main'),inn=el('div','dz-in');main.appendChild(inn);
    var foot=el('div','dz-foot'),fbw=el('div','dz-fbw'),fb=el('div','dz-fb');fb.setAttribute('aria-live','polite');fb.hidden=true;
    var btn=el('button','dz-btn',T('check'));btn.type='button';
    fbw.appendChild(fb);foot.appendChild(fbw);foot.appendChild(btn);
    root.appendChild(top);root.appendChild(main);root.appendChild(foot);
    D.body.appendChild(root);

    function setBar(n){var p=Math.round(n/total*100);fill.style.width=p+'%';bar.setAttribute('aria-valuenow',String(p));}
    function touched(){if(state==='ask')btn.disabled=false;}
    inn.addEventListener('input',touched);inn.addEventListener('change',touched);inn.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('button,label,input,select,.opt,.chip'))setTimeout(touched,0);});
    function onKey(e){
      if(e.key==='Escape'){e.preventDefault();quit();}
      else if(e.key==='Enter'&&!e.shiftKey&&!btn.disabled&&D.activeElement&&D.activeElement.tagName!=='BUTTON'&&D.activeElement.tagName!=='TEXTAREA'){e.preventDefault();btn.click();}
    }
    D.addEventListener('keydown',onKey,true);

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
      var lab=el('p','dz-lab',(g.title?g.title+' · ':'')+T('q',{a:idx+1,b:total}));inn.appendChild(lab);
      if(g.pre){if(!g.pre_)g.pre_=g.pre()||[];if(g.pre_.length){var pw=el('div','dz-pre');g.pre_.forEach(function(n){if(n)pw.appendChild(n);});inn.appendChild(pw);}}
      cur=s.it.make();
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
      fb.appendChild(el('h3','',r.ok?T('ok'):T('bad')));
      if(!r.ok&&r.msg&&!/model answer/i.test(r.msg))fb.appendChild(el('p','',r.msg));
      if(r.ok&&r.warn)fb.appendChild(el('p','',r.warn));
      if(r.model&&!r.ok)fb.appendChild(el('p','',T('model')+': '+r.model));
      if(!r.ok&&s.it.why)fb.appendChild(whyBtn(s.it.why));
      (r.ok?bell:buzz)();
      setBar(idx+1);
      var last=g.n===g.items.length;
      if(last&&g.save){
        var pr;try{pr=Promise.resolve(g.save(g.right,g.items.length));}catch(e){pr=Promise.reject(e);}
        anySaved=true;pending.push(pr.catch(function(){failed=true;}));
      }
      btn.textContent=(idx+1>=total)?T('fin'):T('cont');
      try{btn.focus();}catch(e){}
    }
    function next(){idx++;if(idx>=total)end();else show();}
    function popup(){
      var pct=total?right/total:0,stars=pct>=.9?3:pct>=.6?2:1;
      var nx=null;try{nx=o.next?o.next():null;}catch(e){}
      var pop=el('div','dz-pop'),card=el('div','dz-card');pop.setAttribute('role','alertdialog');pop.setAttribute('aria-label',T('gdone'));
      var img=el('img','dz-lion');img.src='img/lion-gold.png';img.alt='';img.width=150;img.height=175;
      card.appendChild(img);
      var st=el('div','dz-stars');st.setAttribute('aria-label',stars+' / 3');
      for(var i=0;i<3;i++){var sp=el('span',i<stars?'on':'off','★');sp.style.animationDelay=(.5+i*.25)+'s';st.appendChild(sp);}
      card.appendChild(st);
      card.appendChild(el('h2','',T('gdone')));
      card.appendChild(el('p','big',T('gscore',{r:right,t:total})));
      var sv=el('p','sv',T('saved'));card.appendChild(sv);
      var row=el('div','dz-row');
      if(nx){var nb=el('button','dz-btn',T('gnext'));nb.type='button';nb.addEventListener('click',function(){close();setTimeout(nx,60);});row.appendChild(nb);}
      var cb=el('button',nx?'dz-btn dz-ghost':'dz-btn',T('close'));cb.type='button';cb.addEventListener('click',close);row.appendChild(cb);
      card.appendChild(row);pop.appendChild(card);root.appendChild(pop);
      Promise.all(pending).then(function(){if(failed)sv.textContent=T('nosave');});
      roar();confetti();
      try{(nb||cb).focus();}catch(e){}
    }
    function end(){
      setBar(total);
      if(gameOn()){inn.textContent='';fb.hidden=true;foot.className='dz-foot';foot.style.display='none';state='end';popup();return;}
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
