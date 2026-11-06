/* Britland: tarja (lower third) + logo no canto. Desenha em canvas 1080x1920; usado pelo app (gravação) e para PNGs. */
(function (W) {
  'use strict';
  var SERIF = '"Noto Serif",serif', SANS = 'Montserrat,sans-serif', CW = 1080, CH = 1920;
  var SX = 135, CY = 1772, SWD = 150, X0 = 40, X1 = 1040, BH = 200;
  var PAL = {
    en: { bar: 'rgba(11,23,51,.9)', line: '#C9A13B', t: '#F2F5FA', t2: '#E4C06A', acc: '#EC4654', bg: '#0B1733', sh: 'img/britland-shield.png' },
    es: { bar: 'rgba(58,10,16,.92)', line: '#F1BF00', t: '#FFF6DD', t2: '#FFD43B', acc: '#FF5C5F', bg: '#3A0A10', sh: 'img/britland-shield-es.png' }
  };
  function ez(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  /* tempos: entrada 2.6 s, saída 1.9 s */
  var DUR = { 'in': 2.6, out: 1.9 };
  function state(kind, t) {
    if (kind === 'in') return { name: 1 - ez((t - .4) / .5), bar: ez((t - .7) / .8), txt: ez((t - 1.3) / .5) };
    if (kind === 'out') return { name: 0, bar: 1 - ez((t - .3) / .6), txt: 1 - ez(t / .3) };
    if (kind === 'full') return { name: 0, bar: 1, txt: 1 };
    if (kind === 'corner') return { name: 1, bar: 0, txt: 0 };
    if (kind === 'shield') return { name: 0, bar: 0, txt: 0 };
    return { name: 0, bar: 1, txt: 0 };
  }
  function fit(ctx, text, font, size, min, maxW) { var s = size; for (; s > min; s -= 2) { ctx.font = font.replace('#', s); if (ctx.measureText(text).width <= maxW) break; } return s; }
  /* o: {mode:'alpha'|'green'|'blue', lang:'en'|'es', l1, l2, sh:Image, state:{name,bar,txt}} */
  function draw(cv, o) {
    var p = PAL[o.lang === 'es' ? 'es' : 'en'], st = o.state, c = cv.getContext('2d');
    cv.width = CW; cv.height = CH; c.clearRect(0, 0, CW, CH);
    if (o.mode === 'green') { c.fillStyle = '#00FF00'; c.fillRect(0, 0, CW, CH); }
    else if (o.mode === 'blue') { var g = c.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, o.lang === 'es' ? '#7A141B' : '#16356f'); g.addColorStop(1, o.lang === 'es' ? '#2E060B' : '#0a1530'); c.fillStyle = g; c.fillRect(0, 0, CW, CH); }
    var x0 = SX - SWD / 2 - 20, x1 = x0 + (X1 - x0) * st.bar;
    if (st.bar > 0) { c.fillStyle = p.bar; c.fillRect(x0, CY - BH / 2, x1 - x0, BH); c.fillStyle = p.line; c.fillRect(x0, CY - BH / 2, x1 - x0, 6); }
    var sh = o.sh, h = SWD * sh.height / sh.width;
    c.drawImage(sh, SX - SWD / 2, CY - h / 2, SWD, h);
    if (st.name > 0) {
      c.save(); c.globalAlpha = st.name; c.textAlign = 'left'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 14; c.shadowOffsetY = 3;
      c.font = '700 66px ' + SERIF; var w1 = c.measureText('BRITLAND').width, tx = SX + SWD / 2 + 26;
      c.fillStyle = p.t; c.fillText('BRITLAND', tx, CY - 8);
      c.font = '500 100px ' + SANS; var f2 = 100 * w1 * .79 / c.measureText('ACADEMY').width; c.font = '500 ' + f2 + 'px ' + SANS; c.fillStyle = p.acc; c.fillText('ACADEMY', tx, CY + f2 * .7 + 22); c.restore();
    }
    if (st.txt > 0 && (o.l1 || o.l2)) {
      var tx2 = SX + SWD / 2 + 34, mw = X1 - tx2 - 36;
      c.save(); c.globalAlpha = st.txt; c.textAlign = 'left';
      if (o.l1) { var s1 = fit(c, o.l1, '700 #px ' + SERIF, 56, 30, mw); c.font = '700 ' + s1 + 'px ' + SERIF; c.fillStyle = p.t; c.fillText(o.l1, tx2, o.l2 ? CY - 6 : CY + s1 * .35); }
      if (o.l2) { var s2 = fit(c, o.l2, '500 #px ' + SANS, 34, 22, mw); c.font = '500 ' + s2 + 'px ' + SANS; c.fillStyle = p.t2; c.fillText(o.l2, tx2, o.l1 ? CY + 46 : CY + s2 * .35); }
      c.restore();
    }
  }

  /* encerramento: logo sobe do canto para o centro; proporções do logo oficial, ACADEMY centralizado */
  DUR.end = 3.4;
  function drawEnd(cv, o) {
    var p = PAL[o.lang === 'es' ? 'es' : 'en'], t = o.t, c = cv.getContext('2d'), sh = o.sh;
    cv.width = CW; cv.height = CH; c.clearRect(0, 0, CW, CH);
    if (o.mode === 'green') { c.fillStyle = '#00FF00'; c.fillRect(0, 0, CW, CH); }
    else if (o.mode === 'blue') { var g = c.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, o.lang === 'es' ? '#7A141B' : '#16356f'); g.addColorStop(1, o.lang === 'es' ? '#2E060B' : '#0a1530'); c.fillStyle = g; c.fillRect(0, 0, CW, CH); }
    var sw = 520, shh = sw * sh.height / sh.width, m = document.createElement('canvas').getContext('2d');
    m.font = '700 100px ' + SERIF; var bw = 1.486 * sw, fs = 100 * bw / m.measureText('BRITLAND').width, cap = fs * .714;
    m.font = '500 100px ' + SANS; var aw = .745 * bw, f2 = 100 * aw / m.measureText('ACADEMY').width, cap2 = f2 * .7;
    var g1 = .111 * sw, g2 = .0293 * bw, tot = shh + g1 + cap + g2 + cap2, y0 = (o.handle ? 900 : 960) - tot / 2 - 40, fcy = y0 + shh / 2, tb = y0 + shh + g1 + cap, ab = tb + g2 + cap2;
    var e = ez((t - .5) / 1.2), w = SWD + (sw - SWD) * e, cx = SX + (540 - SX) * e, cy = CY + (fcy - CY) * e, h = w * sh.height / sh.width;
    c.drawImage(sh, cx - w / 2, cy - h / 2, w, h);
    var a1 = 1 - ez((t - .5) / .4);
    if (a1 > 0 && !o.noName) { c.save(); c.globalAlpha = a1; c.textAlign = 'left'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 14; c.shadowOffsetY = 3; c.font = '700 66px ' + SERIF; var w1 = c.measureText('BRITLAND').width, tx = SX + SWD / 2 + 26; c.fillStyle = p.t; c.fillText('BRITLAND', tx, CY - 8); c.font = '500 100px ' + SANS; var ff = 100 * w1 * .79 / c.measureText('ACADEMY').width; c.font = '500 ' + ff + 'px ' + SANS; c.fillStyle = p.acc; c.fillText('ACADEMY', tx, CY + ff * .7 + 22); c.restore(); }
    var a2 = ez((t - 1.7) / .6);
    if (a2 > 0) {
      c.save(); c.globalAlpha = a2; c.textAlign = 'center'; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 12; c.fillStyle = p.t; c.font = '700 ' + fs + 'px ' + SERIF; var bx = 540 - bw / 2; c.textAlign = 'left'; c.fillText('BRITLAND', bx + (bw - c.measureText('BRITLAND').width) / 2, tb + 24 * (1 - a2));
      c.font = '500 ' + f2 + 'px ' + SANS; c.fillStyle = p.acc; c.textAlign = 'center'; c.fillText('ACADEMY', 540, ab + 24 * (1 - a2)); c.restore();
    }
    var a3 = ez((t - 2.3) / .6);
    if (o.handle && a3 > 0) { c.save(); c.globalAlpha = a3; c.textAlign = 'center'; c.fillStyle = p.line; c.fillRect(440, ab + 70, 200, 6); c.fillStyle = p.t; c.font = '600 44px ' + SANS; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 10; c.fillText('@britlandacademy', 540, ab + 160); c.restore(); }
  }

  /* abertura: escudo desenhado em faíscas (BLLoad) no centro, desce ao canto e o nome aparece */
  DUR.intro = 5.2;
  function drawIntro(cv, o) {
    var p = PAL[o.lang === 'es' ? 'es' : 'en'], t = o.t, c = cv.getContext('2d'), lc = o.lc;
    cv.width = CW; cv.height = CH; c.clearRect(0, 0, CW, CH);
    if (o.mode === 'green') { c.fillStyle = '#00FF00'; c.fillRect(0, 0, CW, CH); }
    else if (o.mode === 'blue') { var g = c.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, o.lang === 'es' ? '#7A141B' : '#16356f'); g.addColorStop(1, o.lang === 'es' ? '#2E060B' : '#0a1530'); c.fillStyle = g; c.fillRect(0, 0, CW, CH); }
    var mv = ez((t - 3.0) / .9), k = 1 - .75 * mv, cx = 540 + (SX - 540) * mv, cy = 715 + (CY - 715) * mv;
    c.save(); c.translate(cx, cy); c.scale(k, k); c.translate(-540, -955); c.drawImage(lc, 0, 0, lc.width, lc.width * 365 / 300, 0, 0, CW, CW * 365 / 300); c.restore();
    var ta = ez((t - 3.6) / .7);
    if (ta > 0) {
      c.save(); c.globalAlpha = ta; c.textAlign = 'left'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 14; c.shadowOffsetY = 3;
      var tx = SX + SWD / 2 + 26 - 30 * (1 - ta); c.font = '700 66px ' + SERIF; var w1 = c.measureText('BRITLAND').width;
      c.fillStyle = p.t; c.fillText('BRITLAND', tx, cy - 8); c.font = '500 100px ' + SANS; var f2 = 100 * w1 * .79 / c.measureText('ACADEMY').width; c.font = '500 ' + f2 + 'px ' + SANS; c.fillStyle = p.acc; c.fillText('ACADEMY', tx, cy + f2 * .7 + 22 - 8 + 8); c.restore();
    }
  }
  function loadShield(lang) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = (W.BL_BASE || '') + PAL[lang === 'es' ? 'es' : 'en'].sh; }); }
  W.TarjaFx = { draw: draw, drawEnd: drawEnd, drawIntro: drawIntro, state: state, DUR: DUR, loadShield: loadShield, PAL: PAL, W: CW, H: CH };
})(window);
