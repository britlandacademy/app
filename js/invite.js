/* Gerador unico dos convites de aula (WhatsApp). Usado pelo painel (nextclass.js) e pela funcao invite-text do Supabase:
   o arquivo e copiado para a funcao por tools/build_invite_fn.py, entao nao use nada de navegador aqui. */
(function(G){
  var ZOOM_REV='https://us06web.zoom.us/j/2447679341?pwd=U0xuSmU0ek15MGlEd0phWHdoMllUUT09',
      ZOOM_NW='https://us05web.zoom.us/j/5570483003?pwd=ChsyesNjuUJ598ysbcNtwynWBLzxEv.1';

  /* ajusta a proxima aula pela ultima palavra registrada (cp.paragraph): revisao de 11 paragrafos + 3 de New Work;
     adiantado vira revisao de 20 sem New Work. Le tambem o formato novo do Contents quando o servidor nao entendeu. */
  function adjust(nx,cp,first){
    cp=cp||{};
    if(nx&&!(nx.review&&nx.review.from!=null)&&nx.contents){
      var c=String(nx.contents),r=/(?:REV|REP)\s+(\d+)\s*[-–]\s*(\d+)\s*(?:\/|$)/i.exec(c),
          n=/(?:NW|NP)\s+(.+?)\s+[-–]\s+(.+?)\s*\[\s*(\d+)\s*[-–]\s*(\d+)\s*\]/i.exec(c);
      if(r||n){nx=Object.assign({},nx);if(r)nx.review={from:+r[1],to:+r[2],fromWord:'',toWord:''};
        if(n)nx.newWords={from:+n[3],to:+n[4],fromWord:n[1].trim(),toWord:n[2].trim()};}
    }
    var P=Number(cp.paragraph),rv=nx&&nx.review,nw=nx&&nx.newWords;
    if(!(P>0)||!rv||rv.from==null||!nw||nw.from==null)return nx;
    var LAG=(Number(nw.from)-1)-P;/* >0 atras do plano, 0 em dia, <0 adiantado */
    if(LAG===0)return Object.assign({},nx,{lag:0});
    var wd=cp.lastWord||(first&&first.last_word)||'';
    if(P>=Number(nw.to))return Object.assign({},nx,{adj:true,ahead:true,lag:LAG,planOk:false,contents:'Só REV · 20 par. (adiantado)',
      review:{from:Math.max(1,P-19),to:P,fromWord:'',toWord:wd},newWords:null});
    /* atras do plano: ensina ate 5 paragrafos para voltar ao plano (o fim do plano e o limite); em dia ou adiantado: 3 */
    var to=LAG>0?Math.max(P+3,Math.min(Number(nw.to),P+5)):P+3;
    return Object.assign({},nx,{adj:true,lag:LAG,planTo:Number(nw.to),planOk:false,review:{from:Math.max(1,P-10),to:P,fromWord:'',toWord:wd},
      newWords:{from:P+1,to:to,fromWord:'',toWord:''}});
  }

  function kindOf(ctx){
    var c=String(ctx.contents||'');
    if(/ONBOARDING/i.test(c))return 'first';
    if(ctx.conversation)return 'conv';
    if(/OFFICIAL.*EXAM|MOCK\s*EXAM/i.test(c))return 'exam';
    if(/FULL\s+REVISION/i.test(c))return 'fullrev';
    if(ctx.missedN)return 'makeup';
    return 'normal';
  }
  function themeOf(contents){
    var m=/conversa\w*\s*[-:–]?\s*(.+)$/i.exec(String(contents||'')),t=m?m[1].replace(/\[.*?\]/g,'').trim():'';
    return /^(class|lesson|aula|clase)?$/i.test(t)?'':t;
  }
  function rg(x){return x&&x.from!=null?(x.from===x.to||x.to==null?String(x.from):x.from+'–'+x.to):'';}

  /* ctx: {es,tz,now(Date),names[],bdays[],streak,classNumber,kind('rev'|'nw'),contents,conversation,review,newWords,stage,
           missedN,isMeet,link,last{vkey:idx},uid0,rand()}  ->  {text,picks{vkey:idx},type}  */
  function build(ctx){
    var es=!!ctx.es,rand=ctx.rand||Math.random,last=ctx.last||{},picks={},kind=ctx.kind==='nw'?'nw':'rev',
        B=function(x){return '*'+x+'*';};
    function pick(arr,key){var l=last[key];if(l==null||isNaN(l))l=-1;var ix=[];for(var i=0;i<arr.length;i++)if(i!==l)ix.push(i);
      var k=ix[Math.floor(rand()*ix.length)];picks[key]=k;return arr[k];}
    var h;try{h=+new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hourCycle:'h23',timeZone:ctx.tz||'America/Sao_Paulo'}).format(ctx.now||new Date());}catch(e){h=(ctx.now||new Date()).getHours();}
    var gr=es?(h<12?'Buenos días':h<19?'Buenas tardes':'Hola'):(h<12?'Good morning':h<18?'Good afternoon':'Hello'),
        ns=ctx.names||[],grp=ns.length>1,
        who=ns.length<2?(ns[0]||''):ns.length===2?ns[0]+(es?' y ':' and ')+ns[1]:(es?'chicos':'guys'),
        k=kindOf(ctx),r=rg(ctx.review),n=rg(ctx.newWords),th=themeOf(ctx.contents),mn=ctx.missedN||'',st=ctx.streak||0,
        vk=ctx.uid0+':'+k+':'+(es?'es':'en')+(kind==='nw'?'2':'1'),
        RV=r?(es?' de los párrafos '+B(r):' of paragraphs '+B(r)):'',NW=n?(es?', párrafos '+B(n):', paragraphs '+B(n)):'',
        STGL=es?'Etapa '+(ctx.stage||''):'Stage '+(ctx.stage||''),
        pm=/PART\s*(\d+)/i.exec(String(ctx.contents||'')),pre=/PRE-?\s*EXAM/i.test(String(ctx.contents||'')),
        FR=es?STGL+(pm?' \u2013 Parte '+pm[1]:''):STGL+(pm?' \u2013 Part '+pm[1]:'');
    var E=es?{
      normal:['¿'+(grp?'Listos':'Listo')+' para la clase de hoy? 📚\nEmpezamos con un '+B('repaso')+RV+'.','¡Vamos a empezar! 🚀\nPrimero, un '+B('repaso')+RV+'.','¡Hora de nuestra clase! 📖\nComenzamos con un '+B('repaso')+RV+'.'],
      first:grp?['¡Bienvenidos a vuestra primera clase en Britland Academy! 🎉\nHoy veremos cómo funciona el curso y daremos los primeros pasos juntos.','¡La primera clase ya está aquí! 🎉\nLes mostraré cómo funciona el curso y empezaremos a aprender.','¡Bienvenidos a bordo! 🎉\nEn la primera clase conocerán el curso y empezarán a hablar enseguida.']
        :['¡Bienvenido a tu primera clase en Britland Academy! 🎉\nHoy veremos cómo funciona el curso y daremos los primeros pasos juntos.','¡Tu primera clase ya está aquí! 🎉\nTe mostraré cómo funciona el curso y empezaremos a aprender.','¡Bienvenido a bordo! 🎉\nEn la primera clase conocerás el curso y empezarás a hablar enseguida.'],
      conv:[th?'Hoy es clase de conversación: '+B(th)+' 💬\nSin palabras nuevas, ¡solo práctica!':'Hoy es clase de conversación 💬\nSin palabras nuevas, ¡solo práctica!',th?'¡Hora de hablar! 💬 Tema de hoy: '+B(th)+'.':'¡Hora de hablar! 💬','¡Día de conversación! 💬\n'+(th?'Hablaremos de '+B(th)+'. ':'')+(grp?'Disfruten.':'Relájate y disfruta.')],
      exam:['Hoy es el '+B('examen de la '+STGL)+'. ¡Mucha suerte! 🍀','¡Día de examen! 📝\nCon calma y confianza, todo saldrá bien.','Hoy tenemos el '+B('examen de la '+STGL)+'. ¡Suerte! 🍀'],
      fullrev:['Hoy hacemos un '+B('repaso completo')+' de la '+B(FR)+(pre?' y la preparación para el examen':'')+'. 🔄\n¡Vamos a repasar todo lo aprendido!','¡Hora de repasar! 🔄\nHoy es el '+B('repaso completo')+' de la '+B(FR)+(pre?', con preparación para el examen':'')+'.','¡Día de repaso completo! 🔄\nRepasaremos la '+B(FR)+(pre?' y nos prepararemos para el examen':'')+' juntos.'],
      makeup:['Hoy es la clase de reposición de la clase '+mn+'. 🔁\nEmpezamos con un '+B('repaso')+RV+'.','¡Vamos a ponernos al día! 🔁\nClase de reposición de la clase '+mn+': '+B('repaso')+RV+'.','Hoy, reposición de la clase '+mn+'. 🔁\nPrimero, un '+B('repaso')+RV+'.'],
      nw:['¡Buen trabajo con el repaso! 👏\n\nAhora las '+B('PALABRAS NUEVAS')+NW+' ✏️','¡Repaso terminado! ✅\n\nSigue: las '+B('PALABRAS NUEVAS')+NW+' ✏️','¡Bien hecho! 💪\n\nPasemos a las '+B('PALABRAS NUEVAS')+NW+' ✏️'],
      gen:['¡Hora de la segunda parte de la clase! ✏️','¡Llega la segunda parte de la clase! 💪','Continuamos con la segunda parte de la clase. ✨'],
      st:['¡Llevas '+st+' días seguidos estudiando, muy bien! 🔥','¡'+st+' días seguidos de estudio! ¡Sigue así! 🔥','¡Gran racha: '+st+' días! 🔥']
    }:{
      normal:['Ready for today\'s lesson? 📚\nWe\'ll start with a '+B('Revision')+RV+'.','Let\'s get started! 🚀\nFirst, a '+B('Revision')+RV+'.','Time for our lesson! 📖\nWe begin with a '+B('Revision')+RV+'.'],
      first:['Welcome to your first lesson at Britland Academy! 🎉\nToday we\'ll see how the course works and take our first steps together.','Your first lesson is here! 🎉\nI\'ll show you how the course works, and we\'ll start learning.','Welcome aboard! 🎉\nIn our first lesson you\'ll get to know the course and start speaking right away.'],
      conv:[th?'Today is a conversation class: '+B(th)+' 💬\nNo new words, just practice!':'Today is a conversation class 💬\nNo new words, just practice!',th?'Time to talk! 💬 Today\'s topic: '+B(th)+'.':'Time to talk! 💬','Conversation day! 💬\n'+(th?'We\'ll talk about '+B(th)+'. ':'')+'Relax and enjoy it.'],
      exam:['Today is your '+B(STGL+' exam')+'. You\'re ready, good luck! 🍀','Exam day! 📝\nTake a deep breath, you\'ve prepared well.','Today we have your '+B(STGL+' exam')+'. Good luck! 🍀'],
      fullrev:['Today we have a '+B('full revision')+' of '+B(FR)+(pre?' and exam preparation':'')+'. 🔄\nLet\'s review everything you\'ve learned!','Time to review! 🔄\nToday is the '+B('full revision')+' of '+B(FR)+(pre?', with exam preparation':'')+'.','Full revision day! 🔄\nWe\'ll go over '+B(FR)+(pre?' and prepare for the exam':'')+' together.'],
      makeup:['Today is the make-up lesson for class '+mn+'. 🔁\nWe\'ll start with a '+B('Revision')+RV+'.','Let\'s catch up! 🔁\nMake-up lesson for class '+mn+': '+B('Revision')+RV+'.','Make-up lesson for class '+mn+' today. 🔁\nFirst, a '+B('Revision')+RV+'.'],
      nw:['Great job on the revision! 👏\n\nNow for the '+B('NEW WORK')+NW+' ✏️','Revision done! ✅\n\nNext up: the '+B('NEW WORK')+NW+' ✏️','Well done! 💪\n\nLet\'s move on to the '+B('NEW WORK')+NW+' ✏️'],
      gen:['Time for the second part of the lesson! ✏️','Second part of the lesson is up! 💪','Let\'s continue with the second part of the lesson! ✨'],
      st:['You\'ve studied '+st+' days in a row, well done! 🔥',st+' days of study in a row! Keep it up! 🔥','Great streak: '+st+' days! 🔥']
    };
    var hasNW=!!n&&(k==='normal'||k==='makeup'),link=ctx.isMeet?ctx.link:(kind==='nw'?ZOOM_NW:ZOOM_REV),
        join=(es?'🎥 Entra aquí:\n':'🎥 Join here:\n')+link;
    /* recado automatico (no maximo 1 por convite): urgentes primeiro; os leves so em ~1 de cada 2 convites; nunca repete antes do intervalo.
       ctx.notice={makeup:n,exam:bool,cert:bool,hol:['25/12'],seen:{chave:ms da ultima vez}}; individuais so para aluno unico */
    function noticeLine(){var nt=ctx.notice;if(!nt)return '';var seen=nt.seen||{},nowMs=(ctx.now||new Date()).getTime(),DAY=864e5,single=!grp;
      function ok(key,days){var t=+seen[key];return !t||nowMs-t>=days*DAY;}
      var hol=nt.hol||[],C=[];
      if(hol.length&&ok('hol',4))C.push(['hol',es?(hol.length>1?'Aviso: no tendremos clase los días '+hol.join(', ')+'.':'Aviso: no tendremos clase el día '+hol[0]+'.'):(hol.length>1?'Aviso: não teremos aula nos dias '+hol.join(', ')+'.':'Aviso: não teremos aula no dia '+hol[0]+'.')]);
      if(single&&nt.exam&&ok('exam',7))C.push(['exam',es?'Tu simulacro ya está disponible en la app 📝':'Seu simulado já está liberado no app. Faça com calma, sem pressa 📝']);
      if(single&&nt.cert&&ok('cert',30))C.push(['cert',es?'¡Felicidades! Tu certificado ya está disponible en la app 🎓':'Parabéns! Seu certificado já está disponível no app 🎓']);
      if(single&&nt.makeup>0&&ok('makeup',7))C.push(['makeup',es?(nt.makeup>1?'Tienes '+nt.makeup+' clases para recuperar. Elige el mejor horario en la app 📅':'Tienes 1 clase para recuperar. Elige el mejor horario en la app 📅'):(nt.makeup>1?'Você tem '+nt.makeup+' aulas a repor. Escolha o melhor horário no app 📅':'Você tem 1 aula a repor. Escolha o melhor horário no app 📅')]);
      if(C.length){picks[ctx.uid0+':n:'+C[0][0]]=0;return C[0][1];}
      if(rand()>=0.5)return '';
      var L=[['review',es?'Si estás disfrutando de las clases, ¿qué tal dejar una reseña del curso en la app? Toma 1 minuto 💛':'Se você está gostando das aulas, que tal deixar uma avaliação do curso no app? Leva 1 minuto 💛'],
        ['goal',es?'Meta de la semana: haz tus Lesson Checks y mantén la racha 🔥':'Meta da semana: faça seus exercícios do dia no app e mantenha a ofensiva 🔥'],
        ['mock1',es?'':'Antes da prova, que tal um simulado? Ele está no app, no card Stage Exam, com a nota e as respostas certas no final 💪'],
        ['mock2',es?'':'Novidade no app: simulados de todos os Stages, no card Stage Exam. Faça com calma e veja onde errou 📝'],
        ['refer',es?'¿Conoces a alguien que quiera aprender? ¡Recomienda Britland Academy! 🤝':'Conhece alguém que queira aprender? Indique a Britland Academy! 🤝']]
        .filter(function(x){return x[1]&&ok(x[0],21);}).sort(function(a,b){return (+seen[a[0]]||0)-(+seen[b[0]]||0);});
      if(!L.length)return '';picks[ctx.uid0+':n:'+L[0][0]]=0;return L[0][1];}
    if(kind==='nw'&&!ctx.isMeet){var nl=noticeLine();return {type:k,picks:picks,text:pick(hasNW?E.nw:E.gen,vk)+(nl?'\n\n'+nl:'')+'\n\n'+join};}
    var bn=ctx.bdays||[],ex=[];
    if(bn.length){var bl=bn.length>1?bn.slice(0,-1).join(', ')+(es?' y ':' and ')+bn[bn.length-1]:bn[0];
      ex.push(grp?(es?'¡Y feliz cumpleaños a '+bl+'! 🎂':'And happy birthday to '+bl+'! 🎂'):(es?'¡Feliz cumpleaños, '+bl+'! 🎂':'Happy birthday, '+bl+'! 🎂'));}
    if(!grp&&st>=3&&(+ctx.classNumber||0)%3===0)ex.push(pick(E.st,vk+'s'));
    var mid=pick(E[k],vk),nl2=noticeLine();
    if(ctx.isMeet&&hasNW)mid+=(es?'\nDespués, las '+B('palabras nuevas')+NW+' ✏️':'\nThen the '+B('NEW WORK')+NW+' ✏️');
    return {type:k,picks:picks,text:gr+', '+who+'! 👋'+(ex.length?'\n'+ex.join('\n'):'')+'\n\n'+mid+(nl2?'\n\n'+nl2:'')+'\n\n'+join};
  }
  G.BL_INVITE={adjust:adjust,build:build,kindOf:kindOf,ZOOM_REV:ZOOM_REV,ZOOM_NW:ZOOM_NW};
})(typeof window!=='undefined'?window:globalThis);
