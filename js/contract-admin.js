/* Britland: contrato de prestação de serviços (Autentique) no painel do professor.
   Só aparece depois que contract_setup.sql foi rodado (tabela public.contracts). */
(function () {
  var CT = {}, ON = false, CSS = false;
  var OPT = {
    pais: ['Portugal', 'Irlanda', 'Brasil', 'Outro'],
    plano: ['VIP', 'Turma', 'Intensivo', 'Business'],
    moeda: ['EUR', 'BRL', 'USD'],
    pagto: ['Wise', 'Revolut'],
    dia: [10, 15, 25]
  };
  var ERR = {
    template_not_ready: 'O texto do contrato ainda não foi liberado. Os dados ficaram salvos como rascunho.',
    missing_fields: 'Faltam dados no contrato.',
    already_sent: 'Este contrato já foi enviado.', already_signed: 'Este contrato já foi assinado.',
    no_autentique_token: 'A chave do Autentique ainda não foi cadastrada no Supabase.',
    missing_student_name_or_email: 'O aluno está sem nome completo ou e-mail no cadastro.',
    template_has_placeholders: 'O texto do contrato ainda tem campos em branco, como [endereço] ou [CPF].',
    autentique: 'O Autentique recusou o envio.', forbidden: 'Só o professor pode enviar contratos.'
  };
  function css() {
    if (CSS) return; CSS = true;
    var s = document.createElement('style');
    s.textContent = '.ct-ov{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;padding:5vh 16px;overflow:auto}' +
      '.ct-md{background:var(--surface,#fff);color:var(--ink,#111);border:2px solid var(--accent,#111);border-radius:3px;padding:18px;width:100%;max-width:640px}' +
      '.ct-md h2{margin:0 0 6px}.ct-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:12px 0}' +
      '.ct-g label{display:flex;flex-direction:column;gap:4px;font-weight:700;font-size:.9rem}' +
      '.ct-g select,.ct-g input{min-height:42px;padding:6px 8px;font:inherit;font-size:16px;color:var(--ink,#111);background:var(--surface,#fff);border:2px solid var(--line,#b8b8b8);border-radius:3px}' +
      '.ct-m{font-weight:700;min-height:1.4em}.ct-m.bad{color:var(--bad,#9c2a22)}.ct-m.ok{color:var(--ok,#1d5e2e)}';
    document.head.appendChild(s);
  }
  function load(sb) {
    return sb.from('contracts').select('*').then(function (r) {
      CT = {}; if (r.error) { ON = false; return; }
      ON = true; (r.data || []).forEach(function (c) { CT[c.user_id] = c; });
    }, function () { ON = false; CT = {}; });
  }
  function sel(el, name, label, list, val, fmt) {
    var s = el('select', { name: name });
    list.forEach(function (o) { var op = el('option', { value: String(o) }, fmt ? fmt(o) : String(o)); if (String(o) === String(val)) op.selected = true; s.append(op); });
    return el('label', {}, label, s);
  }
  function open(o) {
    css();
    var el = o.el, sb = o.sb, p = o.profile, c = CT[p.id] || {};
    var defCourse = /\/espanol\//.test(location.pathname) ? 'Espanhol' : 'Inglês';
    var start = c.start_date || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    var g = el('div', { class: 'ct-g' },
      sel(el, 'country', 'País de residência', OPT.pais, c.country || 'Portugal'),
      sel(el, 'course', 'Curso', ['Inglês', 'Espanhol'], c.course || defCourse),
      sel(el, 'plan', 'Plano', OPT.plano, c.plan || 'VIP'),
      sel(el, 'currency', 'Moeda', OPT.moeda, c.currency || 'EUR'),
      sel(el, 'pay_method', 'Meio de pagamento', OPT.pagto, c.pay_method || 'Wise'),
      sel(el, 'due_day', 'Vencimento', OPT.dia, c.due_day || 10, function (d) { return 'Dia ' + d; }),
      el('label', {}, 'Início das aulas', el('input', { type: 'date', name: 'start_date', value: start })));
    var msg = el('p', { class: 'ct-m', 'aria-live': 'polite' }, '');
    var ov = el('div', { class: 'ct-ov', role: 'dialog', 'aria-modal': 'true' });
    function close() { ov.remove(); }
    function val() {
      var v = {}; g.querySelectorAll('select,input').forEach(function (x) { v[x.name] = x.value; });
      v.due_day = parseInt(v.due_day, 10); return v;
    }
    function say(t, cls) { msg.textContent = t; msg.className = 'ct-m' + (cls ? ' ' + cls : ''); }
    function btns(list, on) { list.forEach(function (b) { b.disabled = on; }); }
    function send(withApprove) {
      var all = [bSend, bPlain, bCancel].filter(Boolean); btns(all, true); say('Enviando…');
      var chain = Promise.resolve();
      if (withApprove && o.approve) chain = chain.then(function () { return o.approve(); });
      chain.then(function () {
        var row = Object.assign({ user_id: p.id, status: 'draft', error: null, updated_at: new Date().toISOString() }, val());
        return sb.from('contracts').upsert(row, { onConflict: 'user_id' });
      }).then(function (r) {
        if (r && r.error) throw new Error(r.error.message);
        return sb.functions.invoke('contract-send', { body: { user_id: p.id } });
      }).then(function (r) {
        var d = r && r.data, e = r && r.error;
        if (e && !d) throw new Error(e.message || 'falha ao chamar a função');
        if (d && d.ok) { say('Contrato enviado. O aluno recebe o link por e-mail.', 'ok'); setTimeout(function () { close(); o.reload(); }, 1400); return; }
        var k = d && d.error, t = ERR[k] || ('Erro: ' + (k || 'desconhecido'));
        if (k === 'missing_fields' && d.fields) t += ' (' + d.fields.join(', ') + ')';
        if (d && d.detail) t += ' ' + d.detail;
        say(t, 'bad'); btns(all, false); o.reload();
      }).catch(function (e) { say('Erro: ' + e.message, 'bad'); btns(all, false); });
    }
    var bSend = el('button', { type: 'button', onclick: function () { send(!!o.approve); } }, o.approve ? 'Aprovar e enviar contrato' : 'Enviar contrato');
    var bPlain = o.approve ? el('button', { type: 'button', class: 'ghost', onclick: function () { btns([bSend, bPlain, bCancel], true); o.approve().then(function () { close(); o.reload(); }, function () { btns([bSend, bPlain, bCancel], false); }); } }, 'Aprovar sem contrato') : null;
    var bCancel = el('button', { type: 'button', class: 'ghost', onclick: close }, 'Cancelar');
    var md = el('div', { class: 'ct-md' },
      el('h2', {}, (o.approve ? 'Aprovar ' : 'Contrato de ') + (p.name || p.email)),
      el('p', { class: 'hint' }, 'Nome e e-mail vêm do cadastro. O aluno assina e depois você assina; os e-mails saem do Autentique.'),
      g, msg, el('div', { class: 'row' }, bSend, bPlain, bCancel));
    ov.append(md); document.body.append(ov);
  }
  function cell(o) {
    var el = o.el, p = o.profile, c = CT[p.id], st = c ? c.status : 'none', box = el('div', { class: 'row', style: 'margin:0' });
    var chip = function (t, cls) { return el('span', { class: 'st ' + cls }, t); };
    if (st === 'signed') {
      box.append(chip('Assinado', 'approved'));
      if (c.signed_url) box.append(el('a', { class: 'btn ghost', href: c.signed_url, target: '_blank', rel: 'noopener', style: 'background:transparent;color:var(--accent)' }, 'Ver PDF'));
    } else if (st === 'sent') {
      box.append(chip('Aguardando assinatura', 'pending'));
      if (c.sign_link) box.append(el('button', { type: 'button', class: 'ghost', onclick: function (e) { var b = e.currentTarget; try { navigator.clipboard.writeText(c.sign_link); b.textContent = 'Link copiado'; } catch (x) { b.textContent = c.sign_link; } } }, 'Copiar link do aluno'));
    } else {
      box.append(chip(st === 'error' ? 'Erro no envio' : (st === 'draft' ? 'Rascunho' : 'Sem contrato'), st === 'error' ? 'blocked' : 'pending'));
      if (st === 'error' && c.error) box.firstChild.title = c.error;
      box.append(el('button', { type: 'button', class: 'ghost', onclick: function () { open({ el: el, sb: o.sb, profile: p, reload: o.reload }); } }, st === 'error' ? 'Tentar de novo' : 'Preparar contrato'));
    }
    return box;
  }
  window.ContractAdmin = { load: load, on: function () { return ON; }, open: open, cell: cell };
})();
