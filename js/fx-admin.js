/* Britland: aba "Efeitos" do painel do professor (efeitos de carregamento por data).
   Usa public.app_settings (loading_fx_setup.sql). Sem a tabela, mostra aviso. */
(function () {
  'use strict';
  var MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var AUTO = {
    carnaval: 'Sexta a terça de Carnaval (automático)', pascoa: 'Quinta antes a segunda depois da Páscoa (automático)',
    'feria-abril': 'Semana da Feria de Abril (automático)', thanksgiving: 'Semana do Thanksgiving (automático)',
    'aniversario-aluno': 'No aniversário de cada aluno (1 vez por dia)', 'aniversario-escola': 'No aniversário da escola',
    'stage-concluido': 'Ao concluir um Stage (em breve)'
  };
  var CUR = { en: 'Inglês', es: 'Espanhol', 'en,es': 'Inglês e espanhol' };
  var st = document.createElement('style'); st.textContent = '.fxr{display:grid;grid-template-columns:1fr auto;gap:6px 10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}.fxr label{display:flex;gap:8px;align-items:center;font-weight:700;min-width:0}.fxr .fxl{grid-column:1/-1;display:flex;gap:6px;align-items:center;flex-wrap:wrap;white-space:nowrap}.fxr .fxl input{width:52px;min-height:36px;padding:2px 4px;font:inherit;text-align:center;-moz-appearance:textfield}.fxr .fxl input::-webkit-outer-spin-button,.fxr .fxl input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.fxr .fxc{color:var(--mut);font-size:.8rem;font-weight:600}.fxr button{white-space:nowrap;flex:none}'; document.head.append(st);
  function pad(n) { return ('0' + n).slice(-2); }
  function mount(box, o) {
    var sb = o.sb, el = o.el, B = window.BLLoad;
    box.textContent = '';
    if (!B) { box.append(el('p', { class: 'hint' }, 'O módulo de efeitos não carregou. Recarregue a página.')); return; }
    var cfg = { off: [], dates: {}, school: '04-26' }, ok = true;
    var msg = el('p', { class: 'msg', 'aria-live': 'polite' });
    var list = el('div');
    function draw() {
      list.textContent = '';
      B.EFFECTS.forEach(function (e) {
        var on = cfg.off.indexOf(e.id) < 0, r = cfg.dates[e.id] || e.d;
        var sw = el('input', { type: 'checkbox', 'aria-label': 'Ativar ' + e.n });
        sw.checked = on;
        sw.addEventListener('change', function () { var i = cfg.off.indexOf(e.id); if (sw.checked && i > -1) cfg.off.splice(i, 1); if (!sw.checked && i < 0) cfg.off.push(e.id); });
        var when;
        if (e.d && !AUTO[e.id]) {
          var f = ['d1', 'm1', 'd2', 'm2'].map(function (k, i) {
            var n = el('input', { type: 'number', min: 1, max: (i % 2 ? 12 : 31), value: r[i % 2 ? i : i], 'aria-label': k, inputmode: 'numeric' });
            return n;
          });
          // ordem dos campos: dia início, mês início, dia fim, mês fim; r = [m1,d1,m2,d2]
          f[0].value = r[1]; f[1].value = r[0]; f[2].value = r[3]; f[3].value = r[2];
          var upd = function () { var v = [+f[1].value, +f[0].value, +f[3].value, +f[2].value]; if (v.every(function (x) { return x > 0; })) { if (v.join() === e.d.join()) delete cfg.dates[e.id]; else cfg.dates[e.id] = v; } };
          f.forEach(function (n) { n.addEventListener('input', upd); });
          when = el('span', { class: 'fxl' }, 'de ', f[0], '/', f[1], ' até ', f[2], '/', f[3], el('span', { class: 'hint', style: 'margin:0' }, '(dia/mês)'));
        } else when = el('span', { class: 'hint fxl', style: 'margin:0;white-space:normal' }, AUTO[e.id] || '');
        var see = el('button', { type: 'button', class: 'ghost' }, 'Ver');
        see.addEventListener('click', function () { preview(e.id); });
        list.append(el('div', { class: 'fxr' },
          el('label', {}, sw, e.n, el('span', { class: 'fxc' }, '· ' + (CUR[e.c] || e.c))), see, when));
      });
    }
    function preview(id) {
      var ov = el('div', { style: 'position:fixed;inset:0;background:rgba(5,10,25,.94);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center' });
      var close = el('button', { type: 'button', class: 'ghost', style: 'margin-top:12px' }, 'Fechar');
      var host = el('div'); ov.append(host, close); document.body.append(ov);
      var ld = B.mount(host, { effect: id, course: (B.EFFECTS.filter(function (x) { return x.id === id; })[0] || {}).c === 'es' ? 'es' : 'en', year: new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0) }), t0 = performance.now();
      var iv = setInterval(function () { var u = (performance.now() - t0) / 4500; ld.progress(Math.min(1, u)); if (u >= 1) clearInterval(iv); }, 50);
      close.addEventListener('click', function () { clearInterval(iv); ld.destroy(); ov.remove(); });
    }
    var sd = el('input', { type: 'number', min: 1, max: 31, style: 'width:56px;min-height:36px;font:inherit', 'aria-label': 'Dia' }), sm = el('input', { type: 'number', min: 1, max: 12, style: 'width:56px;min-height:36px;font:inherit', 'aria-label': 'Mês' });
    var save = el('button', { type: 'button' }, 'Salvar');
    save.addEventListener('click', function () {
      var d = +sd.value, m = +sm.value; cfg.school = (d > 0 && m > 0) ? pad(m) + '-' + pad(d) : '04-26';
      msg.textContent = 'Salvando…'; msg.className = 'msg';
      sb.from('app_settings').upsert({ key: 'loading_fx', value: cfg, updated_at: new Date().toISOString() }).then(function (r) {
        if (r.error) { msg.textContent = 'Erro: ' + r.error.message + (ok ? '' : ' (rode loading_fx_setup.sql no Supabase)'); msg.className = 'msg bad'; return; }
        B.cfg = cfg; try { localStorage.setItem('bl-fxcfg', JSON.stringify(cfg)); } catch (e) { }
        msg.textContent = 'Salvo. Os alunos veem a mudança na próxima abertura do app.'; msg.className = 'msg ok';
      });
    });
    box.append(el('p', { class: 'hint' }, 'Efeitos que aparecem sobre o logo na tela de carregamento. Desligue os que não quiser e ajuste as datas. O aluno também pode desligar tudo em “Animations and sounds” no menu do perfil.'),
      el('div', { class: 'row', style: 'align-items:center;gap:8px;margin:8px 0' }, el('b', {}, 'Aniversário da escola: '), sd, '/', sm, el('span', { class: 'hint' }, '(dia/mês)')),
      list, el('div', { class: 'row', style: 'margin-top:10px' }, save), msg);
    sb.from('app_settings').select('value').eq('key', 'loading_fx').maybeSingle().then(function (r) {
      if (r.error) { ok = false; msg.textContent = 'Tabela app_settings ainda não existe: rode loading_fx_setup.sql no Supabase para poder salvar.'; msg.className = 'msg bad'; }
      else if (r.data && r.data.value) { var v = r.data.value; cfg = { off: v.off || [], dates: v.dates || {}, school: v.school || '04-26' }; }
      sd.value = +cfg.school.slice(3, 5); sm.value = +cfg.school.slice(0, 2); draw();
    });
  }
  window.FxTab = { mount: mount };
})();
