/* Britland: registra, para o painel do professor, como o aluno usa o app (PWA ou navegador, aparelho, versão,
   notificações) e quais telas ele abre. Só funciona depois de stats_setup.sql; sem a tabela, falha em silêncio. */
(function () {
  'use strict';
  var V = window.BL_VERSION || '', done = 0;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} return null; }
  function devId() {
    var d = ls('bl_dev');
    if (!d) { d = (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)); ls('bl_dev', d); }
    return d;
  }
  function info() {
    var ua = navigator.userAgent || '', p = 'Computador', b = 'Outro';
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) p = 'iPhone/iPad';
    else if (/Android/.test(ua)) p = 'Android';
    if (/Edg\//.test(ua)) b = 'Edge'; else if (/OPR\/|Opera/.test(ua)) b = 'Opera';
    else if (/Firefox|FxiOS/.test(ua)) b = 'Firefox'; else if (/Chrome|CriOS/.test(ua)) b = 'Chrome';
    else if (/Safari/.test(ua)) b = 'Safari';
    var pwa = false;
    try { pwa = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; } catch (e) {}
    return { platform: p, browser: b, mode: pwa ? 'pwa' : 'browser' };
  }
  function notif(cb) {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return cb(false);
      if (!navigator.serviceWorker || !navigator.serviceWorker.ready) return cb(true);
      navigator.serviceWorker.ready.then(function (r) { return r.pushManager ? r.pushManager.getSubscription() : null; })
        .then(function (s) { cb(!!s); }, function () { cb(false); });
    } catch (e) { cb(false); }
  }
  function send(sb, uid) {
    var i = info(), page = location.pathname.split('/').pop() || 'index.html';
    notif(function (n) {
      try {
        sb.from('app_devices').upsert({ user_id: uid, device: devId(), mode: i.mode, platform: i.platform, browser: i.browser, version: V, notif: n, game: ls('bl-game') === '1', last_seen: new Date().toISOString() }, { onConflict: 'user_id,device' }).then(function () {}, function () {});
        var last = parseInt(ss('bl_pv_' + page) || '0', 10);
        if (!last || Date.now() - last > 30 * 60 * 1000) { ss('bl_pv_' + page, String(Date.now())); sb.from('page_views').insert({ user_id: uid, page: page }).then(function () {}, function () {}); }
      } catch (e) {}
    });
  }
  function tick() {
    var sb = window.Gate && Gate.sb; if (!sb || !sb.auth) return false;
    sb.auth.getSession().then(function (r) {
      var u = r && r.data && r.data.session && r.data.session.user; if (u && !done) { done = 1; send(sb, u.id); }
    }, function () {});
    return true;
  }
  var n = 0, iv = setInterval(function () { if (done || ++n > 20) return clearInterval(iv); tick(); }, 2000);
})();
