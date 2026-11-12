/* Indice paragrafo -> pagina do Teacher's Book (2a edicao). So numeros de pagina; o texto do livro nao esta aqui.
   BL_TBOOK.data[stage] = {f: arquivo no armazenamento privado "teacher-books", p0: 1a pagina do Stage, m: {paragrafo: pagina}} */
(function(){
var D={"1":{"f":"2nd/stages-1-2.pdf","p0":7,"m":{"1":7,"3":8,"4":9,"5":11,"7":12,"9":15,"10":16,"11":17,"12":18,"13":18,"15":20,"16":22,"17":23,"18":24,"19":25,"21":27,"22":28,"24":30,"25":31,"26":31,"27":32,"29":35,"32":38,"33":39,"35":41,"36":42,"38":44,"39":45,"40":46,"43":49,"45":51,"46":52,"48":54,"50":56,"51":57,"52":58}},"2":{"f":"2nd/stages-1-2.pdf","p0":66,"m":{"54":66,"62":75,"63":76,"64":77,"66":79,"67":80,"68":81,"69":82,"74":87,"75":88,"76":89,"78":91,"82":95,"84":97,"88":101,"89":102,"90":103,"91":104,"94":107,"95":108,"97":110,"99":112,"101":114,"104":116,"106":119,"107":120,"109":122,"110":123,"111":124,"112":125,"113":126,"114":127,"115":127,"116":129,"117":130,"118":131,"119":132,"120":133,"121":133,"122":135,"124":137,"125":138,"126":139,"127":140,"128":141}}};
function pageFor(stage,par){var s=D[stage];if(!s)return null;par=Number(par);if(!par)return s.p0;var ks=Object.keys(s.m).map(Number).sort(function(a,b){return a-b;}),best=null;
  for(var i=0;i<ks.length;i++){if(ks[i]<=par)best=ks[i];else break;}
  return best==null?s.p0:s.m[best];}
window.BL_TBOOK={data:D,pageFor:pageFor,file:function(stage){var s=D[stage];return s?s.f:null;}};
})();
