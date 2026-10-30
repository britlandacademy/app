/* Britland: aba "Estatísticas" do painel do professor (erros explicados, uso, PWA x navegador, notificações,
   modo jogo, contratos, pagamentos e alertas). Usa as tabelas de stats_setup.sql; o que ainda não existir aparece como aviso. */
(function () {
  'use strict';
  var D = null, SUB = 'geral', BOX = null, X = null, FILTER = 'todos', LOADING = false;
  var DAY = 864e5;

  /* ---------- dicionário: o que cada erro significa ---------- */
  var GR = { alta: ['Alta', 'bad'], med: ['Média', 'wt'], bx: ['Baixa', 'ok'] };
  function explain(kind, msg, ref) {
    msg = String(msg || ''); ref = String(ref || '');
    var o;
    if (kind === 'NET') o = { t: 'Falha de conexão com o servidor', sig: 'O celular ou computador do aluno não conseguiu falar com o servidor do app (o pedido foi cortado).', aluno: 'A tela fica vazia, não salva ou mostra aviso de erro.', causa: 'Internet fraca ou instável, VPN, ou rede lenta no exterior. Normalmente não é falha do app.', fazer: 'Pedir para tentar de novo com Wi-Fi. Se repetir com a mesma pessoa em redes diferentes, é sinal de problema real.', g: 'bx' };
    else if (kind === 'DB') {
      if (/^(401|403|42501)$/.test(ref) || /permission|row-level|not allowed/i.test(msg)) o = { t: 'Sem permissão no banco de dados', sig: 'O servidor recusou salvar ou ler algo do aluno (regra de segurança).', aluno: 'O progresso daquele exercício pode não ter sido salvo.', causa: 'Cadastro pendente ou bloqueado, sessão que perdeu o acesso, ou regra de acesso faltando para essa tabela.', fazer: 'Conferir o status do aluno em Alunos. Se estiver aprovado, é falha de regra e precisa de correção no app.', g: 'alta' };
      else if (/PGRST301|jwt|expired|invalid token/i.test(ref + msg)) o = { t: 'Sessão do aluno expirou', sig: 'O login do aluno venceu enquanto ele usava o app.', aluno: 'O app pede para entrar de novo ou deixa de salvar.', causa: 'Aba aberta por muito tempo ou celular que ficou dias sem abrir o app.', fazer: 'Pedir para sair e entrar de novo. Se acontecer toda hora, avise.', g: 'bx' };
      else if (/^(404|42P01|PGRST205|PGRST202)$/.test(ref) || /does not exist|not find the (table|function)/i.test(msg)) o = { t: 'Tabela ou função não existe no banco', sig: 'O app pediu algo que ainda não foi criado no Supabase.', aluno: 'O recurso correspondente não funciona.', causa: 'Falta rodar um arquivo SQL de configuração nesse projeto (inglês ou espanhol).', fazer: 'Ver qual recurso falha (pela tela) e rodar o SQL correspondente.', g: 'alta' };
      else if (/^(23505|409)$/.test(ref)) o = { t: 'Registro duplicado', sig: 'O app tentou gravar algo que já existia.', aluno: 'Quase nunca percebe; o dado já estava salvo.', causa: 'Duplo clique ou envio repetido.', fazer: 'Em geral nada. Só investigar se aparecer em muitos alunos.', g: 'bx' };
      else if (/^(429)$/.test(ref)) o = { t: 'Muitos pedidos em pouco tempo', sig: 'O servidor limitou os pedidos do aluno.', aluno: 'Algumas telas demoram ou falham por alguns instantes.', causa: 'Muitas ações seguidas ou vários aparelhos ao mesmo tempo.', fazer: 'Pedir para aguardar um minuto.', g: 'bx' };
      else if (/^5\d\d$/.test(ref)) o = { t: 'Servidor com problema', sig: 'O Supabase respondeu com erro interno (' + ref + ').', aluno: 'Telas que dependem do servidor falham por um tempo.', causa: 'Instabilidade do serviço ou função com defeito.', fazer: 'Ver status.supabase.com e os logs da função. Costuma passar sozinho.', g: 'alta' };
      else o = { t: 'Erro do banco de dados (' + (ref || 'sem código') + ')', sig: 'O servidor recusou um pedido do app: ' + msg.slice(0, 140), aluno: 'O recurso daquela tela pode não funcionar ou não salvar.', causa: 'Dado fora do formato esperado ou regra do banco.', fazer: 'Guardar a mensagem técnica e me enviar para análise.', g: 'med' };
    }
    else if (kind === 'RES') o = { t: 'Arquivo do app não carregou', sig: 'Uma imagem, áudio, fonte ou script não foi encontrado ou falhou: ' + msg.slice(0, 120), aluno: 'Falta uma imagem ou um áudio na tela; o resto costuma funcionar.', causa: 'Arquivo ausente no site, atualização do app em andamento ou conexão que caiu no meio.', fazer: 'Se for sempre o mesmo arquivo, ele está faltando no site e precisa ser enviado.', g: 'med' };
    else {
      if (/Failed to fetch|NetworkError|Load failed|network/i.test(msg)) o = { t: 'Falha de conexão (detectada pelo navegador)', sig: 'Um pedido de internet falhou: ' + msg.slice(0, 100), aluno: 'A tela fica vazia ou não salva.', causa: 'Internet fraca ou instável do aluno.', fazer: 'Pedir para tentar de novo com Wi-Fi.', g: 'bx' };
      else if (/Cannot read|of null|of undefined|is undefined|is null/i.test(msg)) o = { t: 'Erro no código do app (item que não existe)', sig: 'O app tentou usar um dado que não estava lá: ' + msg.slice(0, 140), aluno: 'A tela trava ou fica em branco e ele precisa voltar.', causa: 'Bug do app, geralmente em uma versão específica, ou dado incompleto no cadastro.', fazer: 'Ver se todos estão na mesma versão. Se for versão antiga, pedir para atualizar; se for a atual, preciso corrigir.', g: 'alta' };
      else if (/is not a function|is not defined|not a constructor/i.test(msg)) o = { t: 'Erro no código do app (arquivo não carregou por completo)', sig: msg.slice(0, 140), aluno: 'Um botão ou recurso da tela não funciona.', causa: 'Versão misturada (arquivos novos e antigos) logo após uma atualização.', fazer: 'Pedir para fechar e abrir o app de novo. Se persistir, atualizar a página.', g: 'med' };
      else if (/JSON|Unexpected token|SyntaxError/i.test(msg)) o = { t: 'Resposta inesperada do servidor', sig: 'O app recebeu uma página ou texto em vez de dados: ' + msg.slice(0, 100), aluno: 'A tela não carrega o conteúdo.', causa: 'Rede de escola/empresa ou operadora interceptando a conexão, ou o site fora do ar por instantes.', fazer: 'Pedir para trocar de rede (4G/Wi-Fi).', g: 'med' };
      else if (/Quota|storage|SecurityError|localStorage|sessionStorage/i.test(msg)) o = { t: 'Navegador bloqueou o armazenamento', sig: 'O app não conseguiu guardar dados no aparelho (' + msg.slice(0, 80) + ').', aluno: 'Preferências (tema, modo jogo) não são lembradas.', causa: 'Navegação privada ou espaço do aparelho cheio.', fazer: 'Pedir para usar a janela normal ou liberar espaço.', g: 'bx' };
      else o = { t: 'Erro novo no código do app', sig: msg.slice(0, 200) || 'Sem mensagem.', aluno: 'Depende da tela; pode travar ou não fazer nada.', causa: 'Ainda não identificada.', fazer: 'Copiar o código e a mensagem e me enviar; eu acrescento a explicação.', g: 'med' };
    }
    o.kind = kind; return o;
  }
  function parts(code) { var p = String(code || '').split('-'); return { kind: p[0] || '?', ver: p[1] || '', ref: p.slice(2).join('-') }; }
  function gkey(code) { var p = parts(code); return p.kind + '|' + p.ref; }

  /* ---------- utilitários ---------- */
  function fmt(ts) { try { return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function ago(ts) { if (!ts) return 'nunca'; var d = Math.floor((Date.now() - new Date(ts).getTime()) / DAY); return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : 'há ' + d + ' dias'; }
  function vnum(v) { return String(v || '0').split('.').map(function (x) { return ('000' + (parseInt(x, 10) || 0)).slice(-4); }).join(''); }
  function nm(id) { var P = X.profiles(), p = P.find(function (x) { return x.id === id; }); return p ? (p.name || p.email || 'Aluno') : 'Aluno removido'; }
  function students() { return X.profiles().filter(function (p) { return !p.is_admin && p.status === 'approved'; }); }
  function badge(t, c) { return X.el('span', { class: 'badge ' + (c || 'gr'), style: 'display:inline-block;padding:2px 9px;border-radius:99px;font-size:.8rem;font-weight:700;background:var(--' + (c === 'ok' ? 'ok-bg' : c === 'wt' ? 'warn-bg' : c === 'bad' ? 'bad-bg' : 'line') + ');color:var(--' + (c === 'ok' ? 'ok' : c === 'wt' ? 'warn' : c === 'bad' ? 'bad' : 'ink') + ')' }, t); }
  function kp(items) { var el = X.el; return el('div', { class: 'kp' }, items.map(function (i) { return el('div', {}, el('small', {}, i[0]), el('b', i[2] ? { style: 'color:var(--bad)' } : {}, String(i[1]))); })); }
  function bars(rows) {
    var el = X.el; return rows.map(function (r) { return el('div', { style: 'display:flex;align-items:center;gap:10px;margin:6px 0' }, el('span', { style: 'width:96px;font-weight:700;font-size:.88rem' }, r[0]), el('div', { class: 'bar', style: 'flex:1;margin:0' }, el('i', { style: 'width:' + Math.max(2, r[1]) + '%' })), el('span', { style: 'width:84px;text-align:right;color:var(--muted);font-size:.8rem' }, r[2])); });
  }
  function table(head, rows) { var el = X.el; return el('div', { class: 'tw' }, el('table', {}, el('thead', {}, el('tr', {}, head.map(function (h) { return el('th', { scope: 'col' }, h); }))), el('tbody', {}, rows.map(function (r) { return el('tr', {}, r.map(function (c) { return el('td', {}, c); })); })))); }
  function flat(a) { return Array.isArray(a) ? a.reduce(function (r, x) { return r.concat(flat(x)); }, []) : (a === null || a === undefined || a === false ? [] : [a]); }
  function card(title, kids) { return X.el('div', { class: 'card', style: 'margin:0 0 12px' }, X.el('h2', {}, title), flat(kids)); }
  function note(t) { return X.el('p', { class: 'hint' }, t); }
  function missing(what) { return note('Ainda sem dados de ' + what + ': o arquivo stats_setup.sql ainda não foi rodado neste projeto, ou nenhum aluno abriu a versão nova do app.'); }
  function copyText(t, b) { try { navigator.clipboard.writeText(t).then(function () { b.textContent = 'Copiado ✓'; }, function () { b.textContent = 'Não consegui copiar'; }); } catch (e) { b.textContent = 'Não consegui copiar'; } }

  /* ---------- dados ---------- */
  function q(p) { return p.then(function (r) { return r && !r.error ? r.data || [] : null; }, function () { return null; }); }
  function load() {
    if (LOADING) return Promise.resolve(); LOADING = true;
    var sb = X.sb, since = new Date(Date.now() - 30 * DAY).toISOString(), m0 = new Date(); m0.setDate(1); m0.setMonth(m0.getMonth() - 1);
    var errs = sb.from('app_errors').select('id,created_at,user_id,code,kind,message,page,version,ua,resolved').gte('created_at', since).order('created_at', { ascending: false }).limit(3000);
    return Promise.all([
      q(errs).then(function (d) { return d || q(sb.from('app_errors').select('id,created_at,user_id,code,kind,message,page,version,ua').gte('created_at', since).order('created_at', { ascending: false }).limit(3000)); }),
      q(sb.from('app_devices').select('*')),
      q(sb.from('page_views').select('page,user_id,created_at').gte('created_at', since).limit(15000)),
      q(sb.from('contracts').select('user_id,status,sent_at,signed_at,updated_at')),
      q(sb.from('charges').select('id,due_date,paid_on,amount,currency,subs(student_name,user_id)').gte('due_date', m0.toISOString().slice(0, 10)).order('due_date', { ascending: true }).limit(500)),
      q(sb.from('pay_claims').select('charge_id,status').eq('status', 'pendente')),
      q(sb.from('stats_settings').select('*').eq('id', 1))
    ]).then(function (a) { D = { errs: a[0], devs: a[1], pv: a[2], ct: a[3], ch: a[4], cl: a[5], st: a[6] && a[6][0] }; LOADING = false; }, function () { LOADING = false; D = D || { errs: null }; });
  }
  function latest() { var v = window.BL_VERSION || '0'; (D.devs || []).forEach(function (d) { if (vnum(d.version) > vnum(v)) v = d.version; }); return v; }
  function devOf() { var m = {}; (D.devs || []).forEach(function (d) { var o = m[d.user_id]; if (!o || d.last_seen > o.last_seen) m[d.user_id] = d; }); return m; }

  /* ---------- visão geral ---------- */
  function groups() {
    var g = {}; (D.errs || []).forEach(function (e) {
      var k = gkey(e.code), o = g[k] || (g[k] = { k: k, rows: [], users: {}, vers: {}, open: 0 });
      o.rows.push(e); if (e.user_id) o.users[e.user_id] = 1; o.vers[parts(e.code).ver] = 1; if (!e.resolved) o.open++;
    });
    return Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.open - a.open || b.rows.length - a.rows.length; });
  }
  function explainGroup(g) { var e = g.rows[0], p = parts(e.code); return explain(p.kind, e.message, p.ref); }
  function devLabel(ua) { var i = String(ua || ''), p = /iPhone|iPad/.test(i) ? 'iPhone/iPad' : /Android/.test(i) ? 'Android' : /Windows|Macintosh|Linux/.test(i) ? 'Computador' : 'Aparelho'; var b = /Edg\//.test(i) ? 'Edge' : /Firefox|FxiOS/.test(i) ? 'Firefox' : /Chrome|CriOS/.test(i) ? 'Chrome' : /Safari/.test(i) ? 'Safari' : ''; return p + (b ? ' · ' + b : ''); }
  function resolveGroup(g, btn) {
    var p = parts(g.rows[0].code); btn.disabled = true; btn.textContent = 'Salvando…';
    X.sb.from('app_errors').update({ resolved: true }).like('code', p.kind + '-%-' + p.ref).eq('resolved', false).then(function (r) {
      if (r.error) { btn.disabled = false; btn.textContent = 'Não foi possível (rode stats_setup.sql)'; return; }
      D.errs.forEach(function (e) { if (gkey(e.code) === g.k) e.resolved = true; }); render();
    }, function () { btn.disabled = false; btn.textContent = 'Erro ao salvar'; });
  }
  function errorBlock(g) {
    var el = X.el, o = explainGroup(g), first = g.rows[0], gr = GR[o.g];
    var users = Object.keys(g.users), open = g.open > 0;
    var det = el('details', { style: 'margin:8px 0;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:8px 12px;' + (open ? '' : 'opacity:.6') });
    det.append(el('summary', { style: 'cursor:pointer;font-weight:700;padding:4px 0' }, o.t + '  ', badge(gr[0], gr[1]), '  ', badge(g.rows.length + '×', 'gr'), open ? '' : '  ✓ resolvido'));
    var dl = el('div', { style: 'display:grid;grid-template-columns:150px 1fr;gap:6px 12px;margin:10px 0;font-size:.93rem' });
    [['O que significa', o.sig], ['O que o aluno vê', o.aluno], ['Causa provável', o.causa], ['O que fazer', o.fazer], ['Código', first.code + (Object.keys(g.vers).length > 1 ? ' (versões: ' + Object.keys(g.vers).join(', ') + ')' : '')], ['Alunos', users.map(nm).join(', ') || '—']].forEach(function (r) {
      dl.append(el('div', { style: 'font-weight:700;color:var(--muted);text-transform:uppercase;font-size:.75rem;letter-spacing:.05em;padding-top:2px' }, r[0]), el('div', {}, r[1]));
    });
    det.append(dl);
    det.append(table(['Quando', 'Aluno', 'Tela', 'Versão', 'Aparelho'], g.rows.slice(0, 8).map(function (e) { return [fmt(e.created_at), nm(e.user_id), String(e.page || '').split('?')[0].split('/').pop(), parts(e.code).ver, devLabel(e.ua)]; })));
    var msg = 'Olá! Sobre o erro ' + first.code + ': ' + o.fazer;
    var b1 = el('button', { type: 'button', onclick: function (ev) { copyText(msg, ev.target); } }, 'Copiar mensagem para o aluno');
    var b2 = open ? el('button', { type: 'button', class: 'ghost', onclick: function (ev) { resolveGroup(g, ev.target); } }, 'Marcar como resolvido') : null;
    det.append(el('div', { class: 'row' }, b1, b2));
    return det;
  }
  function searchBlock() {
    var el = X.el, out = el('div', {}), inp = el('input', { type: 'text', placeholder: 'Código do erro que o aluno mandou (ex.: JS-1.9.15-91c0)', style: 'flex:1;min-width:240px', 'aria-label': 'Código do erro' });
    function go() {
      out.textContent = ''; var c = inp.value.trim(); if (!c) return;
      var p = parts(c), g = groups().find(function (x) { return (D.errs || []).some(function (e) { return e.code.toLowerCase() === c.toLowerCase() && gkey(e.code) === x.k; }); }) || groups().find(function (x) { return x.k.toLowerCase() === gkey(c).toLowerCase(); });
      if (g) { out.append(el('p', { class: 'hint' }, 'Encontrado nos registros dos últimos 30 dias.'), errorBlock(g)); out.querySelector('details').open = true; return; }
      var o = explain(p.kind, '', p.ref);
      out.append(el('div', { class: 'box', style: 'background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px;margin:8px 0' }, el('b', {}, 'Esse código não está nos registros dos últimos 30 dias.'), el('p', { class: 'hint' }, 'Pelo tipo (' + p.kind + '): ' + o.t + '. ' + o.sig), el('p', { class: 'hint' }, 'Peça ao aluno a mensagem completa do erro ou um print.')));
    }
    inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') go(); });
    return el('div', {}, el('div', { class: 'row' }, inp, el('button', { type: 'button', onclick: go }, 'Explicar')), out);
  }
  function pct(n, t) { return t ? Math.round(100 * n / t) : 0; }
  function panelUse(stu, dev) {
    var el = X.el, n = stu.length, have = stu.filter(function (s) { return dev[s.id]; }), t = have.length;
    if (!D.devs) return [card('Como usam o app', missing('aparelhos'))];
    var pwa = have.filter(function (s) { return dev[s.id].mode === 'pwa'; }).length, game = have.filter(function (s) { return dev[s.id].game; }).length, nt = have.filter(function (s) { return dev[s.id].notif; }).length;
    var plat = {}; have.forEach(function (s) { var p = dev[s.id].platform || 'Outro'; plat[p] = (plat[p] || 0) + 1; });
    var cols = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:12px' });
    cols.append(card('Como usam o app', [bars([['PWA', pct(pwa, t), pwa + ' · ' + pct(pwa, t) + '%'], ['Navegador', pct(t - pwa, t), (t - pwa) + ' · ' + pct(t - pwa, t) + '%']]), note('Aparelhos: ' + Object.keys(plat).map(function (k) { return k + ' ' + plat[k]; }).join(' · ') + '.')]));
    cols.append(card('Notificações', [bars([['Ligadas', pct(nt, t), nt + ' · ' + pct(nt, t) + '%'], ['Desligadas', pct(t - nt, t), (t - nt) + ' · ' + pct(t - nt, t) + '%']]), note('No iPhone, as notificações só funcionam com o app instalado (PWA).')]));
    cols.append(card('Modo de estudo', [bars([['Modo Jogo', pct(game, t), game + ' · ' + pct(game, t) + '%'], ['Modo normal', pct(t - game, t), (t - game) + ' · ' + pct(t - game, t) + '%']]), note('Baseado no último aparelho que cada aluno usou.')]));
    var out = [cols]; if (t < n) out.push(note(t + ' de ' + n + ' alunos já abriram a versão nova do app; os demais aparecem como "sem dados" na tabela.')); return out;
  }
  function overview() {
    var el = X.el, stu = students(), dev = devOf(), g = groups(), lat = latest(), now = Date.now();
    var e7 = (D.errs || []).filter(function (e) { return !e.resolved && now - new Date(e.created_at).getTime() < 7 * DAY; }), e24 = e7.filter(function (e) { return now - new Date(e.created_at).getTime() < DAY; });
    var out = [searchBlock()];
    out.push.apply(out, panelUse(stu, dev));
    var old = D.devs ? stu.filter(function (s) { return dev[s.id] && vnum(dev[s.id].version) < vnum(lat); }) : [];
    var last = {}; X.att().forEach(function (a) { if (!last[a.user_id] || a.created_at > last[a.user_id]) last[a.user_id] = a.created_at; });
    function seen(s) { var l = dev[s.id] && dev[s.id].last_seen, a = last[s.id]; return (l || '') > (a || '') ? l : a; }
    var today = stu.filter(function (s) { var l = seen(s); return l && now - new Date(l).getTime() < DAY; }), idle = stu.filter(function (s) { var l = seen(s); return !l || now - new Date(l).getTime() > 7 * DAY; });
    var two = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px' });
    two.append(card('Saúde do app', [kp([['Erros 24 h', e24.length, e24.length > 0], ['Erros 7 dias', e7.length, false]]), note('Versão atual ' + lat + (D.devs ? ' · ' + old.length + ' aluno(s) desatualizado(s)' + (old.length ? ': ' + old.slice(0, 6).map(function (s) { return (s.name || s.email || '').split(' ')[0]; }).join(', ') : '') : ''))]));
    two.append(card('Atividade', [kp([['Ativos hoje', today.length, false], ['Sem abrir há 7+ dias', idle.length, idle.length > 0]]), note(idle.length ? idle.slice(0, 8).map(function (s) { return (s.name || s.email || '').split(' ')[0]; }).join(', ') : 'Todos abriram o app na última semana.')]));
    out.push(two);
    /* erros */
    out.push(el('h2', { style: 'margin:16px 0 6px' }, 'Erros explicados · últimos 30 dias'));
    if (D.errs === null) out.push(note('Não consegui ler a tabela de erros.')); else if (!g.length) out.push(note('Nenhum erro registrado nos últimos 30 dias.')); else g.slice(0, 25).forEach(function (x) { out.push(errorBlock(x)); });
    /* alunos */
    out.push(el('h2', { style: 'margin:16px 0 6px' }, 'Alunos'));
    var sel = el('select', { 'aria-label': 'Filtrar alunos' }, [['todos', 'Todos'], ['nav', 'Só navegador'], ['nonot', 'Sem notificação'], ['old', 'Desatualizados'], ['game', 'Modo Jogo'], ['normal', 'Modo normal'], ['nodata', 'Sem dados do aparelho']].map(function (o) { return el('option', { value: o[0], selected: o[0] === FILTER }, o[1]); }));
    sel.addEventListener('change', function () { FILTER = sel.value; render(); }); out.push(el('div', { class: 'row' }, sel));
    var ec = {}; e7.forEach(function (e) { if (e.user_id) ec[e.user_id] = (ec[e.user_id] || 0) + 1; });
    var rows = stu.filter(function (s) { var d = dev[s.id]; return FILTER === 'todos' || (FILTER === 'nodata' ? !d : d && ((FILTER === 'nav' && d.mode !== 'pwa') || (FILTER === 'nonot' && !d.notif) || (FILTER === 'old' && vnum(d.version) < vnum(lat)) || (FILTER === 'game' && d.game) || (FILTER === 'normal' && !d.game))); })
      .map(function (s) { var d = dev[s.id]; return [s.name || s.email || '', d ? badge(d.mode === 'pwa' ? 'PWA instalado' : 'Navegador', d.mode === 'pwa' ? 'ok' : 'wt') : '—', d ? badge(d.game ? 'Jogo' : 'Normal', d.game ? 'ok' : 'gr') : '—', d ? badge(d.notif ? 'Ligadas' : 'Desligadas', d.notif ? 'ok' : 'bad') : '—', d ? (d.platform || '') + ' · ' + (d.browser || '') : 'sem dados', d ? badge(d.version || '?', vnum(d.version) < vnum(lat) ? 'wt' : 'gr') : '—', ago(seen(s)), String(ec[s.id] || 0)]; });
    out.push(table(['Aluno', 'Como usa', 'Modo', 'Notificações', 'Aparelho', 'Versão', 'Último acesso', 'Erros 7d'], rows));
    return out;
  }

  /* ---------- uso ---------- */
  var PG = { 'lessons': 'Aulas', 'index': 'Início', 'exercicios': 'Exercícios', 'exercises': 'Exercícios', 'gramatica': 'Gramática', 'grammar': 'Gramática', 'workbook': 'Workbook', 'check': 'Lesson Check', 'payments': 'Pagamentos', 'pagamentos': 'Pagamentos', 'account': 'Perfil', 'conta': 'Perfil', 'audio': 'Áudios', 'exam': 'Provas', 'placement': 'Placement', 'verify': 'Certificado', 'dele': 'DELE' };
  function pname(p) { var k = String(p || '').replace(/\.html$/, '').toLowerCase(); return PG[k] || k || 'Início'; }
  function exLabel(a) { var x = String(a.ex || ''); var t = a.kind === 'check' ? 'Lesson Check' : /^wb/.test(x) ? 'Workbook' : /^dele:/.test(x) ? 'DELE' : 'Exercise'; return t + ' · Lesson ' + a.lesson + (a.kind === 'check' ? '' : ' · ' + x.replace(/^(wb|dele):?/, '')); }
  function usage() {
    var el = X.el, out = [], since = Date.now() - 30 * DAY;
    out.push(el('h2', { style: 'margin:6px 0' }, 'Uso · últimos 30 dias'));
    var two = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px' });
    if (!D.pv) two.append(card('Telas mais usadas', missing('telas')));
    else { var c = {}; D.pv.forEach(function (v) { var k = pname(v.page); c[k] = (c[k] || 0) + 1; }); var ks = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 8), mx = ks.length ? c[ks[0]] : 1;
      two.append(card('Telas mais usadas', ks.length ? bars(ks.map(function (k) { return [k, pct(c[k], mx), c[k] + ' acessos']; })) : note('Ainda sem acessos registrados.'))); }
    var at = X.att().filter(function (a) { return new Date(a.created_at).getTime() >= since; }), m = {};
    at.forEach(function (a) { var k = a.kind + '|' + a.lesson + '|' + a.ex, o = m[k] || (m[k] = { a: a, n: 0, u: {}, s: 0, t: 0 }); o.n++; o.u[a.user_id] = 1; o.s += a.score; o.t += a.total; });
    var all = Object.keys(m).map(function (k) { return m[k]; });
    two.append(card('Exercícios mais feitos', all.length ? table(['Exercício', 'Vezes', 'Alunos'], all.sort(function (a, b) { return b.n - a.n; }).slice(0, 8).map(function (o) { return [exLabel(o.a), String(o.n), String(Object.keys(o.u).length)]; })) : note('Nenhum exercício feito nos últimos 30 dias.')));
    out.push(two);
    out.push(el('h2', { style: 'margin:16px 0 6px' }, 'Onde os alunos mais erram'));
    var hard = all.filter(function (o) { return o.n >= 5 && o.t; }).map(function (o) { o.p = Math.round(100 * o.s / o.t); return o; }).sort(function (a, b) { return a.p - b.p; }).slice(0, 10);
    out.push(hard.length ? table(['Exercício', 'Acerto', 'Tentativas', 'Alunos'], hard.map(function (o) { return [exLabel(o.a), el('span', { style: 'font-weight:700;color:var(--' + (o.p < 50 ? 'bad' : o.p < 70 ? 'warn' : 'ok') + ')' }, o.p + '%'), String(o.n), String(Object.keys(o.u).length)]; })) : note('Ainda não há exercícios com 5 ou mais tentativas.'));
    out.push(note('Acerto abaixo de 50% pode indicar enunciado confuso ou conteúdo que precisa de reforço em aula. O app guarda só a nota de cada tentativa, não a resposta errada, por isso não mostro o "erro mais comum".'));
    return out;
  }

  /* ---------- negócio ---------- */
  var CT = { draft: ['Rascunho', 'gr'], sent: ['Aguardando assinaturas', 'wt'], signed: ['Assinado', 'ok'], error: ['Erro no envio', 'bad'] };
  function business() {
    var el = X.el, out = [], two = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px' });
    if (!D.ct) two.append(card('Contratos', missing('contratos'))); else {
      var c = { sent: 0, signed: 0, draft: 0, error: 0 }; D.ct.forEach(function (x) { c[x.status] = (c[x.status] || 0) + 1; });
      var rows = D.ct.filter(function (x) { return x.status !== 'draft'; }).sort(function (a, b) { return String(b.sent_at || '').localeCompare(String(a.sent_at || '')); }).slice(0, 10).map(function (x) { var late = x.status === 'sent' && x.sent_at && Date.now() - new Date(x.sent_at).getTime() > 3 * DAY, s = CT[x.status] || [x.status, 'gr']; return [nm(x.user_id), badge(s[0], late ? 'bad' : s[1]), fmt(x.sent_at) + (late ? ' · parado há mais de 3 dias' : '')]; });
      two.append(card('Contratos', [kp([['Enviados', c.sent + c.signed], ['Assinados', c.signed], ['Pendentes', c.sent, c.sent > 0]]), rows.length ? table(['Aluno', 'Situação', 'Enviado'], rows) : note('Nenhum contrato enviado ainda.')]));
    }
    if (!D.ch) two.append(card('Pagamentos', missing('pagamentos'))); else {
      var today = new Date().toISOString().slice(0, 10), mo = today.slice(0, 7), claim = {}; (D.cl || []).forEach(function (x) { claim[x.charge_id] = 1; });
      var list = D.ch.map(function (x) { var s = x.paid_on ? 'ok' : claim[x.id] ? 'baixar' : x.due_date < today ? 'late' : 'open'; return { x: x, s: s }; });
      var cur = list.filter(function (r) { return r.x.due_date.slice(0, 7) === mo; }), over = list.filter(function (r) { return r.s === 'late'; }), bx = list.filter(function (r) { return r.s === 'baixar'; });
      var days = function (d) { return Math.floor((Date.now() - new Date(d + 'T12:00:00').getTime()) / DAY); };
      var rows2 = over.concat(bx).slice(0, 10).map(function (r) { var sub = r.x.subs || {}; return [sub.student_name || nm(sub.user_id), r.s === 'late' ? badge('Atrasado ' + days(r.x.due_date) + ' dias', 'bad') : badge('A baixar', 'wt'), r.x.due_date.split('-').reverse().slice(0, 2).join('/') + ' · ' + r.x.currency + ' ' + r.x.amount]; });
      two.append(card('Pagamentos · este mês', [kp([['Pagos', cur.filter(function (r) { return r.s === 'ok'; }).length], ['Atrasados', over.length, over.length > 0], ['A baixar', bx.length]]), rows2.length ? table(['Aluno', 'Situação', 'Vencimento'], rows2) : note('Nada atrasado nem aguardando baixa.'), note('"A baixar" = o aluno avisou que pagou e falta você confirmar em Pagamentos.')]));
    }
    out.push(two); return out;
  }

  /* ---------- alertas ---------- */
  function alerts() {
    var el = X.el, st = D.st || { alert_on: true, err_limit: 5, stu_on: true, stu_limit: 3 };
    if (!D.st) var warn = note('As configurações ainda não existem neste projeto: rode stats_setup.sql para ativar os avisos.');
    var on = el('input', { type: 'checkbox', checked: st.alert_on }), lim = el('input', { type: 'number', min: '1', value: String(st.err_limit), style: 'width:5.2em' }), son = el('input', { type: 'checkbox', checked: st.stu_on }), slim = el('input', { type: 'number', min: '1', value: String(st.stu_limit), style: 'width:5.2em' }), msg = el('span', { class: 'msg' });
    var save = el('button', { type: 'button', onclick: function () {
      msg.textContent = 'Salvando…'; msg.className = 'msg';
      X.sb.from('stats_settings').upsert({ id: 1, alert_on: on.checked, err_limit: Math.max(1, parseInt(lim.value, 10) || 5), stu_on: son.checked, stu_limit: Math.max(1, parseInt(slim.value, 10) || 3) }).then(function (r) { if (r.error) { msg.textContent = 'Não foi possível salvar (rode stats_setup.sql).'; msg.className = 'msg bad'; } else { msg.textContent = 'Salvo ✓'; msg.className = 'msg ok'; D.st = { alert_on: on.checked, err_limit: lim.value, stu_on: son.checked, stu_limit: slim.value }; } }, function () { msg.textContent = 'Erro ao salvar.'; msg.className = 'msg bad'; });
    } }, 'Salvar');
    return [card('Aviso de erro repetido', [warn, note('Você recebe uma notificação em português, no mesmo canal dos outros avisos do painel, quando o mesmo erro se repete. O aviso é enviado uma vez por erro (quando cruza o limite).'),
      el('div', { class: 'row' }, el('label', {}, on, ' Avisar quando o mesmo erro passar de '), lim, ' ocorrências em 24 horas'),
      el('div', { class: 'row' }, el('label', {}, son, ' Avisar também quando '), slim, ' ou mais alunos tiverem o mesmo erro'),
      el('div', { class: 'row' }, save, msg)]),
      card('Exemplo do aviso', el('div', { style: 'background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px' }, el('b', {}, 'Britland · Erro repetido'), el('br'), 'Erro repetido: NET-1.9.16-4f2a já aconteceu 11 vezes em 24 h (3 aluno(s)). Veja em Estatísticas.'))];
  }

  /* ---------- montagem ---------- */
  function render() {
    if (!BOX) return; var el = X.el; BOX.textContent = '';
    var tabs = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px', role: 'tablist' });
    [['geral', 'Visão geral'], ['uso', 'Uso'], ['neg', 'Negócio'], ['alerta', 'Alertas']].forEach(function (t) {
      tabs.append(el('button', { type: 'button', role: 'tab', 'aria-selected': String(SUB === t[0]), class: SUB === t[0] ? '' : 'ghost', style: 'border-radius:99px', onclick: function () { SUB = t[0]; render(); } }, t[1]));
    });
    tabs.append(el('button', { type: 'button', class: 'ghost', onclick: function () { D = null; run(); } }, 'Atualizar'));
    BOX.append(tabs);
    if (!D) { BOX.append(el('p', { class: 'hint' }, 'Carregando…')); return; }
    try { flat(SUB === 'uso' ? usage() : SUB === 'neg' ? business() : SUB === 'alerta' ? alerts() : overview()).forEach(function (n) { BOX.append(n); }); }
    catch (e) { BOX.append(el('p', { class: 'msg bad' }, 'Não consegui montar esta parte: ' + e.message)); }
  }
  function run() { render(); load().then(render); }
  window.StatsTab = {
    mount: function (box, ctx) { BOX = box; X = ctx; if (!D) run(); else render(); },
    explain: explain
  };
})();
