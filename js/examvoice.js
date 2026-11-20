/* Voz do simulado ("On my own, with voice"): toca os áudios pré-gerados (Supabase Storage) e, se um áudio não existir ou não tocar, usa a voz do aparelho (speechSynthesis).
   Velocidades: normal 0.8, lenta 0.4 (aplicadas aqui, no player). Cada leitura é cancelável: stop() invalida a sequência em andamento. */
(function(){
  'use strict';
  var S=window.speechSynthesis,tok=0,cur=null,bad={},voices=[];
  var NORMAL=0.8,SLOW=0.4;
  function loadVoices(){try{voices=(S&&S.getVoices?S.getVoices():[]).filter(function(v){return /^en/i.test(v.lang);});}catch(e){voices=[];}}
  loadVoices();try{if(S&&S.addEventListener)S.addEventListener('voiceschanged',loadVoices);}catch(e){}
  function pick(){
    var rank=function(v){var n=v.name,l=v.lang.replace('_','-');
      return (/Mark/i.test(n)?0:/(Ryan|George|Daniel|Oliver|Thomas)/i.test(n)?1:2)*10+(l==='en-GB'?0:l==='en-IE'?1:l==='en-US'?2:3);};
    return voices.slice().sort(function(a,b){return rank(a)-rank(b);})[0]||null;
  }
  var AB=function(s){return String(s).replace(/\b(Mr|Mrs|Ms|Dr)\./g,function(m,a){return {Mr:'Mister',Mrs:'Missus',Ms:'Miss',Dr:'Doctor'}[a];}).replace(/´/g,'’');};
  var SPOKEN=function(s){return AB(s).replace(/,/g,' comma,').replace(/;/g,' semicolon;').replace(/\./g,' full stop.').replace(/\?/g,' question mark.').replace(/!/g,' exclamation mark.');};
  var PLAIN=function(s){return AB(s).replace(/[,.?!;]/g,'');};
  function ttsSay(text,rate,my,done){
    if(!S||typeof SpeechSynthesisUtterance==='undefined'||my!==tok){done();return;}
    var u=new SpeechSynthesisUtterance(text),v=pick();if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-GB';
    u.rate=rate;u.onend=function(){done();};u.onerror=function(){done();};cur={tts:true};
    try{S.speak(u);}catch(e){done();}
  }
  function say(text,rate,url,my){
    return new Promise(function(res){
      if(my!==tok)return res();
      var fall=function(){ttsSay(text,rate,my,res);};
      if(!url||bad[url])return fall();
      var a=new Audio(url),used=false;a.preload='auto';a.playbackRate=rate;
      try{a.preservesPitch=true;}catch(e){}
      cur={a:a};
      a.onended=function(){res();};
      a.onerror=function(){bad[url]=1;if(!used){used=true;fall();}};
      var pr=a.play();if(pr&&pr.catch)pr.catch(function(){bad[url]=1;if(!used){used=true;fall();}});
    });
  }
  function wait(ms,my){return new Promise(function(r){setTimeout(r,ms);}).then(function(){return my===tok;});}
  function begin(){stop();return tok;}
  function stop(){tok++;try{if(cur&&cur.a){cur.a.pause();}if(S)S.cancel();}catch(e){}cur=null;}
  function pause(){try{if(cur&&cur.a)cur.a.pause();else if(S)S.pause();}catch(e){}}
  function resume(){try{if(cur&&cur.a)cur.a.play();else if(S)S.resume();}catch(e){}}
  /* Pergunta (Yes/No, Listening): lida 'times' vezes. spec={text,url}. step(i) avisa a leitura em andamento. */
  async function readQ(spec,times,step,my){
    for(var i=1;i<=times;i++){
      if(my!==tok)return false;if(step)step(i);
      await say(AB(spec.text),NORMAL,spec.url,my);
      if(my!==tok)return false;
      if(i<times&&!(await wait(1500,my)))return false;
    }
    return my===tok;
  }
  /* Trecho do ditado: 1) normal com pontuação falada, 2) lenta sem pontuação, 3) normal com pontuação. */
  async function readChunk(c,step,my){
    var plan=[[SPOKEN(c.text),NORMAL,c.urlP,700],[PLAIN(c.text),SLOW,c.urlS,1800],[SPOKEN(c.text),NORMAL,c.urlP,1400]];
    for(var i=0;i<3;i++){
      if(my!==tok)return false;if(step)step(i+1);
      await say(plan[i][0],plan[i][1],plan[i][2],my);
      if(my!==tok)return false;
      if(!(await wait(plan[i][3],my)))return false;
    }
    return true;
  }
  /* Quebra um ditado sem "/" em trechos curtos (igual a tools/build_voice.py, só para quando não há lista pronta). */
  function chunks(txt){
    var BRK='and but when who that with in on at of to by because if or so while where which'.split(' '),out=[];
    (String(txt).match(/[^.?!]+[.?!]+[”"’]*|[^.?!]+$/g)||[]).forEach(function(s){
      s=s.trim();if(!s)return;
      s.split(/(?<=,)\s+/).forEach(function(p){
        p=p.trim();if(!p)return;var w=p.split(/\s+/),cur2=[];
        w.forEach(function(x,i){
          if(cur2.length>=3&&(cur2.length>=6||(BRK.indexOf(x.toLowerCase())>-1&&w.length-i>=2))&&w.length>6){out.push(cur2.join(' '));cur2=[];}
          cur2.push(x);
        });
        if(cur2.length)out.push(cur2.join(' '));
      });
    });
    return out;
  }
  function info(){loadVoices();var v=pick();return {supported:!!(S&&typeof SpeechSynthesisUtterance!=='undefined'),count:voices.length,name:v?v.name:''};}
  function test(){var my=begin();return say('Hello. This is a test of the voice. Can you hear me?',NORMAL,null,my);}
  window.ExamVoice={begin:begin,stop:stop,pause:pause,resume:resume,readQ:readQ,readChunk:readChunk,chunks:chunks,info:info,test:test,NORMAL:NORMAL,SLOW:SLOW};
})();
