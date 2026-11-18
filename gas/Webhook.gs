/* Britland - webhook do sheet-push (v6, bilíngue: Inglês + Espanhol).
   Substitui o script antigo (doPost/newStudent/repararAbas). Cole como arquivo próprio no Apps Script
   (o Code.gs com o parser continua separado) e publique de novo a implantação do app da Web.

   v6 (18/11/2026):
   - Cabeçalho e rótulos em inglês OU espanhol (Lesson/Lección, Date/Fecha, Done/Hecho, Status/Estado, ULTIMA PALABRA...).
   - A linha do cabeçalho é detectada (não é mais fixa na 9) e o rodapé pode começar com STAGE/ETAPA/STG/ETP.
   - Modelos oficiais: "Template - Inglês" e "Template - Espanhol" (copyTo). Logo em B2:C4; texto do cabeçalho a partir da coluna D.
   - Status e % Attendance continuam sendo fórmula: copiadas do modelo; se a célula do modelo não tiver fórmula, usa a fórmula padrão.
   - A resposta de newStudent traz "avisos" com o que não foi encontrado no cabeçalho do modelo. */

const SEGREDO = 'COLE_AQUI_O_SEGREDO';   // o mesmo valor do script antigo (não versionar o segredo real)
const AMARELO = '#fff2cc';
const TPL_EN = 'Template - Inglês';
const TPL_ES = 'Template - Espanhol';

/* Nomes aceitos para cada coluna (minúsculas). */
const ALIAS = {
  lesson: ['lesson', 'lección', 'leccion'],
  date: ['date', 'fecha'],
  para: ['paragraph', 'párrafo', 'parrafo'],
  last: ['last word taught', 'ultima palabra', 'última palabra', 'ultima palabra enseñada', 'última palabra enseñada'],
  read: ['read.', 'read', 'lect.', 'lect'],
  dict: ['dict.', 'dict'],
  lc: ['lc', 'er'],
  cont: ['contents', 'contenido', 'contenido / materia'],
  done: ['done', 'hecho'],
  status: ['status', 'estado'],
  pct: ['% attendance', '% asistencia'],
  notes: ['notes / callan method', 'notes', 'notas', 'notas / método callan', 'notas / metodo callan']
};

function colLetra(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

/* Layout da aba: linha do cabeçalho, mapa de colunas, idioma. */
function layout(sh) {
  const nCols = sh.getLastColumn(), maxR = Math.min(sh.getLastRow(), 25);
  if (!nCols || !maxR) return null;
  const vals = sh.getRange(1, 1, maxR, nCols).getValues();
  for (let r = 0; r < vals.length; r++) {
    const head = vals[r].map(h => String(h).trim().toLowerCase());
    if (head.some(h => ALIAS.cont.indexOf(h) >= 0) && head.some(h => ALIAS.lesson.indexOf(h) >= 0)) {
      const col = k => { for (let i = 0; i < head.length; i++) if (ALIAS[k].indexOf(head[i]) >= 0) return i + 1; return 0; };
      const c = {}; Object.keys(ALIAS).forEach(k => c[k] = col(k));
      return { CAB: r + 1, head: head, c: c, nCols: nCols, es: head.indexOf('contenido') >= 0 || head.indexOf('contenido / materia') >= 0 };
    }
  }
  return null;
}

const ROT = /^(stage|etapa|stg|etp)\b/i;                 // rodapé "STAGE N PROGRESS" / "ETAPA N ..."

function fStatus(L, r) {
  return '=IF(' + colLetra(L.c.date) + r + '="","' + (L.es ? 'Programada' : 'Scheduled') + '","' + (L.es ? 'Completada' : 'Completed') + '")';
}
function fPct(L, r, a, b) {
  const S = colLetra(L.c.status) + r, A = colLetra(a), B = colLetra(b), cab = A + '$' + L.CAB + ':' + B + '$' + L.CAB,
        lab = L.es ? 'Alumno *' : 'Student *', ok = L.es ? 'Completada' : 'Completed';
  return '=IF(' + S + '="' + ok + '", IFERROR(COUNTIF(' + A + r + ':' + B + r + ', TRUE)/(COUNTIF(' + cab + ', "?*")-COUNTIF(' + cab + ', "' + lab + '")), 0), "")';
}
/* Só grava a fórmula padrão se a célula não tiver fórmula (o modelo oficial já traz a dele). */
function garantirFormulas(sh, L, r, stuCols) {
  if (L.c.status && L.c.date && !sh.getRange(r, L.c.status).getFormula()) sh.getRange(r, L.c.status).setFormula(fStatus(L, r));
  if (L.c.pct && L.c.status && stuCols.length && !sh.getRange(r, L.c.pct).getFormula())
    sh.getRange(r, L.c.pct).setFormula(fPct(L, r, stuCols[0], stuCols[stuCols.length - 1]));
}
function colunasAlunos(L) { const a = []; if (L.c.done && L.c.status) for (let c = L.c.done + 1; c < L.c.status; c++) a.push(c); return a; }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.token !== SEGREDO) return out({ok:false, error:'forbidden'});
    if (d.action === 'newStudent') return out(newStudent(d));
    const sh = SpreadsheetApp.getActive().getSheetByName(d.sheetName);
    if (!sh) return out({ok:false, error:'aba_nao_encontrada'});

    const L = layout(sh);
    if (!L || !L.c.lesson) return out({ok:false, error:'cabecalho_nao_encontrado'});
    const CAB = L.CAB, nCols = L.nCols, c = L.c;

    const lastRow = sh.getLastRow();
    const bVals = sh.getRange(CAB + 1, c.lesson, Math.max(lastRow - CAB, 1), 1).getValues();
    let row = -1;
    for (let i = 0; i < bVals.length; i++)
      if (String(bVals[i][0]).trim() !== '' && Number(bVals[i][0]) === Number(d.lesson)) { row = CAB + 1 + i; break; }
    if (row < 0) return out({ok:false, error:'licao_nao_encontrada'});

    const stuCols = colunasAlunos(L);

    // 1) nova linha (cópia da linha atual, ANTES de gravar nela)
    let inserted = false;
    if (d.insert) {
      const newRow = row + 1;
      sh.insertRowAfter(row);
      sh.getRange(row, 1, 1, nCols).copyTo(sh.getRange(newRow, 1, 1, nCols));   // copia também as fórmulas de Status e %
      sh.getRange(newRow, c.lesson).setValue(Number(d.lesson) + 1);
      if (c.date) sh.getRange(newRow, c.date).clearContent();
      if (c.para) sh.getRange(newRow, c.para).clearContent();
      if (c.last) sh.getRange(newRow, c.last).clearContent();
      if (c.done) sh.getRange(newRow, c.done).setValue(false);
      stuCols.forEach(k => { const r = sh.getRange(newRow, k); r.setValue(false); r.clearNote(); r.setBackground(null); });
      garantirFormulas(sh, L, newRow, stuCols);
      if (d.readingGiven && c.read)   sh.getRange(newRow, c.read).setValue('—');
      if (d.dictationGiven && c.dict) sh.getRange(newRow, c.dict).setValue('—');
      // renumera as aulas seguintes (+1)
      const total = sh.getLastRow();
      if (total > newRow) {
        const rg = sh.getRange(newRow + 1, c.lesson, total - newRow, 1), v = rg.getValues();
        for (let i = 0; i < v.length; i++) if (String(v[i][0]).trim() !== '' && !isNaN(Number(v[i][0]))) v[i][0] = Number(v[i][0]) + 1;
        rg.setValues(v);
      }
      inserted = true;
    }

    // 2) grava na linha atual
    if (d.conversation) {
      [c.read, c.dict, c.lc].forEach(k => { if (k) sh.getRange(row, k).setValue('—'); });
      const th = String(d.theme || '').trim();
      if (th && c.cont) {
        const cc = sh.getRange(row, c.cont), old = String(cc.getValue());
        cc.setValue((L.es ? 'Conversación "' : 'Conversation "') + th + '"' + (old ? ' · ' + old : ''));
      }
    }
    if (d.date && c.date) sh.getRange(row, c.date).setNumberFormat('dd/mm/yyyy').setValue(new Date(d.date + 'T12:00:00'));
    if (d.paragraph != null && c.para) sh.getRange(row, c.para).setNumberFormat('@').setValue(String(d.paragraph));
    if (d.lastWord != null && c.last)  sh.getRange(row, c.last).setValue(d.lastWord);
    if (d.done && c.done)   sh.getRange(row, c.done).setValue(true);
    if (d.lessonCheck != null && c.lc) sh.getRange(row, c.lc).setValue(isNaN(Number(d.lessonCheck)) ? String(d.lessonCheck) : Number(d.lessonCheck));
    // sugestões da aula (Song / Video / Film / Activity): acrescenta nas notas sem apagar o que já existe
    if (d.notes && c.notes) {
      const nc = sh.getRange(row, c.notes), old = String(nc.getValue() || '').trim();
      const novos = String(d.notes).split(' | ').map(x => x.trim()).filter(x => x && old.indexOf(x) < 0);
      if (novos.length) nc.setValue((old ? old + ' | ' : '') + novos.join(' | '));
    }
    if (d.status && c.status) {                                  // só grava Status se a célula NÃO for fórmula
      const sc = sh.getRange(row, c.status);
      if (!sc.getFormula()) sc.setValue(d.status);
    }

    // 3) presença (TRUE/FALSE); atraso vira nota + fundo amarelo
    if (d.attendance) {
      for (const nome in d.attendance) {
        const alvo = nome.trim().toLowerCase();
        const k = stuCols.find(x => L.head[x - 1] === alvo);
        if (!k) continue;
        const cell = sh.getRange(row, k);
        cell.setValue(!!d.attendance[nome]);
        const min = d.late && d.late[nome];
        if (min) { cell.setNote('Atrasou ' + min + ' min'); cell.setBackground(AMARELO); }
        else if (String(cell.getNote()).indexOf('Atrasou') === 0) { cell.clearNote(); cell.setBackground(null); }
      }
    }
    SpreadsheetApp.flush();
    return out({ok:true, row:row, inserted:inserted, notes: !!(d.notes && c.notes)});
  } catch (err) {
    return out({ok:false, error:String(err)});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}


// ---------- cria a aba de um aluno novo copiando o modelo oficial ----------
// d: {action:'newStudent', tabName, template ('Template - Inglês' | 'Template - Espanhol'), firstName, vip, start:'YYYY-MM-DDTHH:mm' (Brasília),
//     fee:'120 € / 10th of every month', stage, lessonsText:'Lessons 45 to 63' | 'Lecciones 1 a 16', plan:[{c, read, dict, lc, notes}]}
function newStudent(d) {
  const ss = SpreadsheetApp.getActive(), avisos = [];
  if (!d.tabName || !d.plan || !d.plan.length) return {ok:false, error:'dados_incompletos'};
  if (ss.getSheetByName(d.tabName)) return {ok:false, error:'ja_existe'};
  const tpl = ss.getSheetByName(d.template || TPL_EN);
  if (!tpl) return {ok:false, error:'modelo_nao_encontrado'};
  const sh = tpl.copyTo(ss);
  sh.setName(d.tabName);
  const L = layout(sh);
  if (!L || !L.c.lesson || !L.c.cont) { ss.deleteSheet(sh); return {ok:false, error:'cabecalho_nao_encontrado'}; }
  const CAB = L.CAB, nCols = L.nCols, c = L.c;

  // linhas de aulas = da linha CAB+1 até a linha antes do rodapé (STAGE / ETAPA / STG / ETP na coluna Lesson)
  const colB = sh.getRange(CAB + 1, c.lesson, Math.max(sh.getLastRow() - CAB, 1), 1).getValues().map(r => String(r[0]).trim());
  let foot = colB.findIndex(v => ROT.test(v));
  foot = foot < 0 ? sh.getLastRow() + 1 : CAB + 1 + foot;      // primeira linha do rodapé
  const have = foot - (CAB + 1), need = d.plan.length;
  if (need > have) {
    sh.insertRowsAfter(CAB + 1, need - have);
    const src = sh.getRange(CAB + 1, 1, 1, nCols), dst = sh.getRange(CAB + 2, 1, need - have, nCols);
    src.copyTo(dst, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    src.copyTo(dst, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    [c.status, c.pct].forEach(k => { if (k) sh.getRange(CAB + 1, k).copyTo(sh.getRange(CAB + 2, k, need - have, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false); });
  } else if (need < have) {
    sh.deleteRows(CAB + 1 + need, have - need);
  }
  const stuCols = colunasAlunos(L);
  const first = String(d.firstName || '').trim();
  const mine = stuCols.length ? stuCols[0] : 0;                 // 1ª coluna de aluno = o aluno novo
  // o cabeçalho do aluno pode ser fórmula (nome vem da tabela lateral): só escreve texto se NÃO for fórmula
  if (mine && first && !sh.getRange(CAB, mine).getFormula()) sh.getRange(CAB, mine).setValue(first);
  for (let i = 0; i < need; i++) {
    const r = CAB + 1 + i, p = d.plan[i];
    sh.getRange(r, c.lesson).setValue(i + 1);
    if (c.date) sh.getRange(r, c.date).clearContent();
    sh.getRange(r, c.cont).setValue(p.c || '');
    if (c.para) sh.getRange(r, c.para).clearContent();
    if (c.last) sh.getRange(r, c.last).clearContent();
    if (c.read) sh.getRange(r, c.read).setValue(p.read || '—');
    if (c.dict) sh.getRange(r, c.dict).setValue(p.dict || '—');
    if (c.lc)   sh.getRange(r, c.lc).setValue(p.lc == null ? '—' : p.lc);
    if (c.done) sh.getRange(r, c.done).setValue(false);
    stuCols.forEach(k => { const g = sh.getRange(r, k); g.setValue(false); g.clearNote(); g.setBackground(null); });
    garantirFormulas(sh, L, r, stuCols);
    if (c.notes) sh.getRange(r, c.notes).setValue(p.notes || '');
  }
  // 1ª aula com data e hora do TN (horário de Brasília)
  if (d.start && c.date) {
    const m = String(d.start).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (m) sh.getRange(CAB + 1, c.date).setNumberFormat('dd/mm/yyyy HH:mm').setValue(new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  }
  // cabeçalho (linhas acima da tabela): título, início, horário, mensalidade, progresso
  const top = sh.getRange(1, 1, CAB - 1, nCols).getValues();
  const put = (re, fn, nome) => {
    for (let r = 0; r < top.length; r++) for (let k = 0; k < top[r].length; k++)
      if (typeof top[r][k] === 'string' && re.test(top[r][k])) { sh.getRange(r + 1, k + 1).setValue(fn(top[r][k])); return true; }
    avisos.push('não achei: ' + nome); return false;
  };
  put(/\((Lessons?|Lecci[oó]n(es)?) \d+ (to|a) \d+\)/i, () => d.tabName + (d.lessonsText ? ' (' + d.lessonsText + ')' : ''), 'título (Lessons/Lecciones N a M)');
  if (d.start) { const m = String(d.start).match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) put(/^(Start Date|Fecha de inicio|Inicio):/i, s => s.replace(/:.*$/, ': ' + m[3] + '/' + m[2] + '/' + m[1]), 'Start Date'); }
  put(/^(Schedule|Horario):/i, s => s.replace(/:.*$/, ': ' + (L.es ? 'Flexible' : 'Flexible')), 'Schedule');
  if (d.fee) put(/^(Fee|Mensualidad|Cuota):/i, s => s.replace(/:.*$/, ': ' + d.fee), 'Fee');
  put(/^(STAGE|ETAPA|ETP|STG)\s*\d+\s*(PROGRESS|PROGRESO)$|^PROGRESO\s*(ETAPA|ETP)\s*\d+$/i, s => s.replace(/\d+/, String(d.stage)), 'STAGE N PROGRESS');
  // tabela de presença lateral: aluno novo na 1ª linha
  const hdrRow = (() => { for (let r = 0; r < top.length; r++) for (let k = 0; k < top[r].length; k++) if (/^(student|alumno)$/i.test(String(top[r][k]).trim())) return [r + 1, k + 1]; return null; })();
  if (hdrRow && first) {
    sh.getRange(hdrRow[0] + 1, hdrRow[1]).setValue(first);
    sh.getRange(hdrRow[0] + 1, hdrRow[1] + 1).setValue(d.vip ? 'VIP' : 'Individual');
  } else if (!hdrRow) avisos.push('não achei: tabela lateral Student/Alumno');
  SpreadsheetApp.flush();
  return {ok:true, gid:sh.getSheetId(), name:d.tabName, rows:need, avisos:avisos};
}


// ---------- conserta abas JÁ existentes (rode UMA vez, no editor: repararAbas) ----------
// Reescreve Status e % Attendance como fórmula em todas as aulas, só onde a célula não tem fórmula.
function repararAbas() {
  const ss = SpreadsheetApp.getActive(), rel = [];
  ss.getSheets().forEach(sh => {
    const L = layout(sh);
    if (!L || !L.c.lesson || !L.c.date || !L.c.done || !L.c.status || !L.c.pct) { rel.push(sh.getName() + ': pulada'); return; }
    const stu = colunasAlunos(L);
    if (!stu.length) { rel.push(sh.getName() + ': sem colunas de alunos'); return; }
    const vals = sh.getRange(L.CAB + 1, L.c.lesson, Math.max(sh.getLastRow() - L.CAB, 1), 1).getValues();
    let n = 0;
    for (let i = 0; i < vals.length; i++) {
      const v = String(vals[i][0]).trim();
      if (ROT.test(v)) break;
      if (v === '' || isNaN(Number(v))) continue;
      const r = L.CAB + 1 + i;
      if (!sh.getRange(r, L.c.status).getFormula()) sh.getRange(r, L.c.status).setFormula(fStatus(L, r));
      if (!sh.getRange(r, L.c.pct).getFormula()) sh.getRange(r, L.c.pct).setFormula(fPct(L, r, stu[0], stu[stu.length - 1]));
      n++;
    }
    rel.push(sh.getName() + ': ' + n + ' aulas');
  });
  SpreadsheetApp.flush();
  Logger.log(rel.join('\n'));
}
