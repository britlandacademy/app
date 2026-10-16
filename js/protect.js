/* Britland Academy · discourage printing/copying of lessons; watermark with the student's name */
(function(){
'use strict';
var MSG='Printing is not allowed. Use the lessons on the site.';
function T(s){try{return window.I18N&&I18N.t?I18N.t(s):s;}catch(e){return s;}}
function ok(t){return t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]');}
function wm(label){
  var txt=String(label||'').replace(/[<>&"]/g,'').slice(0,60);
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="520" height="340"><text x="40" y="200" transform="rotate(-24 260 170)" font-family="Arial,sans-serif" font-size="13" font-weight="400" fill="#808080" fill-opacity=".10">'+txt+'</text></svg>';
  var d=document.createElement('div');d.className='pr-wm';d.setAttribute('aria-hidden','true');
  d.style.backgroundImage='url("data:image/svg+xml;utf8,'+encodeURIComponent(svg)+'")';
  document.body.append(d);
}
function on(label){
  if(document.querySelector('.pr-wm'))return;
  var st=document.createElement('style');
  st.textContent='.pr-wm{position:fixed;inset:0;z-index:99980;pointer-events:none;background-repeat:repeat}'+
  'body.pr-on{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}body.pr-on input,body.pr-on textarea{-webkit-user-select:text;user-select:text}'+
  'body.pr-on img{-webkit-user-drag:none;user-drag:none}'+
  '@media print{html body>*{display:none!important}html body::before{content:"'+T(MSG).replace(/"/g,'')+'";display:block!important;font:700 20px Arial,sans-serif;padding:40px;color:#000}}';
  document.head.append(st);document.body.classList.add('pr-on');wm(label);
  document.addEventListener('contextmenu',function(e){if(!ok(e.target))e.preventDefault();});
  document.addEventListener('copy',function(e){if(!ok(e.target))e.preventDefault();});
  document.addEventListener('cut',function(e){if(!ok(e.target))e.preventDefault();});
  document.addEventListener('dragstart',function(e){e.preventDefault();});
  document.addEventListener('keydown',function(e){
    var k=(e.key||'').toLowerCase();
    if((e.ctrlKey||e.metaKey)&&(k==='p'||k==='s'||k==='u')){e.preventDefault();e.stopPropagation();}
  },true);
  window.addEventListener('beforeprint',function(){document.body.classList.add('pr-printing');});
}
window.Protect={on:on};
})();
