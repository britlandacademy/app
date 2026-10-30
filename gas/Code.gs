/* Britland Academy — Planos de Aula -> Supabase.
   Script do Google Sheets (Extensões > Apps Script). Propriedades do script (Configurações do projeto):
   PLAN_KEY = chave secreta (a mesma de PLAN_SECRET no Supabase), SB_URL = https://<projeto>.supabase.co,
   SB_ANON = chave anon do projeto.  Lê UMA aba por vez, nunca a planilha inteira. */
var P_ = PropertiesService.getScriptProperties();

/* Web App: ?key=...&sheetName=NOME  ->  JSON da aba pedida (somente ela). */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!P_.getProperty('PLAN_KEY') || p.key !== P_.getProperty('PLAN_KEY')) return json_({ ok: false, error: 'forbidden' });
  if (!p.sheetName) return json_({ ok: false, error: 'sheetName-required' });
  return json_(readTab_(p.sheetName));
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function readTab_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return { ok: false, error: 'tab-not-found', sheetName: name };
  return parsePlanTab(sh.getDataRange().getDisplayValues(), name);
}
function call_(body) {
  var r = UrlFetchApp.fetch(P_.getProperty('SB_URL') + '/functions/v1/plan-sync', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: P_.getProperty('SB_ANON'), Authorization: 'Bearer ' + P_.getProperty('SB_ANON') },
    payload: JSON.stringify(Object.assign({ secret: P_.getProperty('PLAN_KEY') }, body))
  });
  return JSON.parse(r.getContentText() || '{}');
}
/* Sincroniza: pede ao Supabase a lista aba->aluno e envia o progresso, uma aba por vez. */
function tabsInfo_() {
  return SpreadsheetApp.getActive().getSheets().map(function (sh) {
    var students = [];
    try {
      var rows = Math.min(15, sh.getLastRow()), cols = sh.getLastColumn();
      if (rows && cols) {
        var v = sh.getRange(1, 1, rows, cols).getDisplayValues();
        for (var i = 0; i < v.length; i++) {
          var d = -1, s = -1;
          v[i].forEach(function (c, k) { c = String(c).trim(); if (/^done$/i.test(c)) d = k; if (/^status$/i.test(c)) s = k; });
          if (d >= 0 && s > d) { for (var j = d + 1; j < s; j++) { var n = String(v[i][j]).trim(); if (n) students.push(n); } break; }
        }
      }
    } catch (e) {}
    return { name: sh.getName(), students: students };
  });
}
function syncAll() {
  var tr = call_({ action: 'tabs', tabs: tabsInfo_() });
  if (tr.error) Logger.log('Erro abas: ' + tr.error);
  var resp = call_({ action: 'links' });
  if (resp.error) Logger.log('Erro links: ' + resp.error);
  var links = resp.links || [], ok = 0, bad = [];
  /* Fim de cada lição (por etapa), colhido de todas as abas: serve para abas sem "LC n" preenchido. */
  var SB = {};
  SpreadsheetApp.getActive().getSheets().forEach(function (sh) {
    try {
      var r0 = readTab_(sh.getName());
      if (r0 && r0.ok && r0.stage && r0.bounds) r0.bounds.forEach(function (b) {
        var m = SB[r0.stage] = SB[r0.stage] || {};
        if (m[b.lesson] == null) m[b.lesson] = b.endWord;
      });
    } catch (e) {}
  });
  Logger.log('Abas ligadas: ' + links.length);
  links.forEach(function (l) {
    var res = readTab_(l.sheet_name);
    if (!res.ok || !res.currentPosition) { bad.push(l.sheet_name + ': ' + (res.error || 'sem aula dada')); return; }
    /* each student only gets his own column (never the other students' attendance) */
    if (l.student_col && res.students && res.students[l.student_col]) { res.me = res.students[l.student_col]; res.studentCol = l.student_col; }
    if (res.currentPosition) { var lp = lessonByPar_(res.currentPosition.paragraph, res.stage); if (lp) { res.currentPosition.lesson = lp; res.currentPosition.lessonFinished = false; } }
    if (res.currentPosition && res.currentPosition.lesson == null) fillLesson_(res.currentPosition, res.stage && SB[res.stage]);
    if (res.me && res.me.missed) res.me.missed.forEach(function (x) { if (x.lesson == null && x.newWords) { var t = { lastNewWord: x.newWords.to }; fillLesson_(t, res.stage && SB[res.stage]); x.lesson = t.lesson; } });
    delete res.bounds;
    delete res.students;
    var pr = call_({ action: 'push', user_id: l.user_id, progress: res });
    if (pr.error) bad.push(l.sheet_name + ': push ' + pr.error); else ok++;
  });
  Logger.log('Sincronizadas: ' + ok + (bad.length ? ' | Ignoradas: ' + bad.join('; ') : ''));
}
/* Primeiro parágrafo de cada lição (Teacher's Book Callan, numeração contínua) e primeira lição de cada etapa. */
var LESSON_PAR_ = [1,11,18,25,31,37,44,50,56,62,69,78,83,89,96,101,106,112,117,123,129,135,141,147,153,160,166,172,178,184,190,196,201,207,213,219,225,230,236,242,248,254,260,266,271,277,283,288,294,301,307,313,320,326,333,340,346,353,360,366,372,379,386,392,399,405,410,416,423,430,436,441,447,453,459,465,471,476,483,489,496,503,509,515,522,528,535,541,547,553,559,566,571,577,583,589,595,602,608,614,620,626,633,640,645,651,656,662,669,675,681,687,694,700,707,714,720,726,733,740,748,754,762,769,775,782,789,795,802,809,815,821,827,834,841,847,854,861,868,875,882,889,896,902,908,915,922,928,934,942,948,955,962,970,977,985,992,998,1006,1013,1020,1026,1033,1040,1047,1053,1059,1066,1073,1079,1085,1092,1099,1105,1112,1118,1129,1136,1144,1152,1161,1170,1179,1186,1196,1205,1214,1221,1230,1240,1248,1255,1264,1274,1283,1291,1300,1307,1316,1326,1334,1345,1354,1363,1371,1380];
var STAGE_LESSON_ = [1,13,28,45,64,83,102,121,139,157,175,191];
/* Lição pelo número do parágrafo; só vale se cair dentro da etapa da aba. */
function lessonByPar_(par, stage) {
  if (par == null || !stage || stage < 1 || stage > 12) return null;
  var k = 0;
  for (var i = 0; i < LESSON_PAR_.length; i++) if (LESSON_PAR_[i] <= par) k = i + 1;
  if (!k) return null;
  var a = STAGE_LESSON_[stage - 1], b = stage < 12 ? STAGE_LESSON_[stage] - 1 : 206;
  return (k >= a && k <= b) ? k : null;
}
/* Descobre a lição pela última palavra nova, usando o fim de cada lição conhecido na etapa. */
function fillLesson_(pos, map) {
  if (!map || pos.lastNewWord == null) return;
  var ls = Object.keys(map).map(Number).sort(function (a, b) { return a - b; });
  if (!ls.length) return;
  for (var k = 0; k < ls.length; k++) if (map[ls[k]] >= pos.lastNewWord) { pos.lesson = ls[k]; pos.lessonFinished = map[ls[k]] === pos.lastNewWord; return; }
  pos.lesson = ls[ls.length - 1] + 1; pos.lessonFinished = false;
}
/* Rode UMA vez: agenda a sincronização a cada 30 min. */
function installTrigger() {
  ScriptApp.newTrigger('syncAll').timeBased().everyMinutes(30).create();
}

/* Britland: reads ONE tab of the "Planos de Aula" sheet and returns the pedagogical position of the student.
   Pure function of the tab's values (2D array) + the tab name, so it can be tested without Google. */
function parsePlanTab(values, sheetName) {
  var norm = function (v) { return String(v == null ? '' : v).trim(); };
  var num = function (v) { var m = norm(v).match(/^\d+$/); return m ? parseInt(m[0], 10) : null; };
  var dash = /^[—–-]?$/;

  /* 1. Header row: the row that has a "Contents" cell (it moves between tabs, row 7 or 8). */
  var h = -1, i, j;
  for (i = 0; i < values.length && h < 0; i++)
    for (j = 0; j < values[i].length; j++) if (/^contents$/i.test(norm(values[i][j]))) { h = i; break; }
  if (h < 0) return parseOldLayout_(values, sheetName);
  var col = {};
  values[h].forEach(function (c, k) {
    c = norm(c);
    if (/^date$/i.test(c)) { col.date = k; col.cls = k - 1; }
    else if (/^contents$/i.test(c)) col.contents = k;
    else if (/^paragraph$/i.test(c)) col.par = k;
    else if (/^last word/i.test(c)) col.word = k;
    else if (/^read/i.test(c)) col.read = k;
    else if (/^dict/i.test(c)) col.dict = k;
    else if (/^lc$/i.test(c)) col.lc = k;
    else if (/^status$/i.test(c)) col.status = k;
    else if (/^done$/i.test(c)) col.done = k;
  });
  if (col.contents == null || col.status == null) return { ok: false, error: 'columns-not-found', sheetName: sheetName };
  /* Student columns: between "Done" and "Status" (a checked box = the student came to that class). */
  var scols = [];
  if (col.done != null) for (j = col.done + 1; j < col.status; j++) { var nm = norm(values[h][j]); if (nm) scols.push({ name: nm, k: j }); }

  /* 2. Stage: from the tab name (Stage 1 / Stg 2 / Etapa 3), then from the "STAGE N PROGRESS" label. */
  var stage = null, m = String(sheetName).match(/(?:stage|stg|etapa)\s*(\d+)/i);
  if (m) stage = parseInt(m[1], 10);
  for (i = 0; i < h && stage == null; i++)
    for (j = 0; j < values[i].length; j++) { m = norm(values[i][j]).match(/STAGE\s*(\d+)\s*PROGRESS/i); if (m) { stage = parseInt(m[1], 10); break; } }

  /* 3. Class rows: from the header down while there is a status. */
  var rows = [];
  for (i = h + 1; i < values.length; i++) {
    var r = values[i], status = norm(r[col.status]), contents = norm(r[col.contents]);
    if (!contents || !status) { if (rows.length) break; else continue; }
    if (/^(lançamento|nota|pontua|b[oô]nus|resultado)/i.test(contents)) break;
    var word = col.word != null ? norm(r[col.word]) : '', par = col.par != null ? norm(r[col.par]) : '';
    var noShow = /no.?show/i.test(word) || /^ns$/i.test(par);
    rows.push({
      row: i + 1, cls: col.cls != null ? num(r[col.cls]) : null, contents: contents,
      att: scols.map(function (sc) { return { name: sc.name, here: /^true$/i.test(norm(r[sc.k])) }; }),
      conv: /^e$/i.test(par) || /conversation/i.test(contents),
      status: status, noShow: noShow, done: /^completed$/i.test(status) && !noShow,
      paragraph: num(par), word: noShow ? '' : word,
      read: col.read != null ? norm(r[col.read]) : '', dict: col.dict != null ? norm(r[col.dict]) : '',
      lc: col.lc != null ? norm(r[col.lc]) : ''
    });
  }

  /* 4. Contents: "REV 1 hello - 9 number / NW 10 on - 12 where" */
  var rng = function (txt, tag) {
    var rx = new RegExp(tag + '\\s+(\\d+)\\s+(.+?)\\s+[-–]\\s+(\\d+)\\s+(.+?)\\s*(?:/|$)', 'i'), q = txt.match(rx);
    return q ? { from: parseInt(q[1], 10), fromWord: q[2], to: parseInt(q[3], 10), toWord: q[4] } : null;
  };
  rows.forEach(function (x) { x.rev = rng(x.contents, 'REV'); x.nw = rng(x.contents, 'NW'); });

  /* 5. Where the student stopped = last taught class; next = first class after it that is not done. */
  var last = -1;
  rows.forEach(function (x, k) { if (x.done) last = k; });
  var lastRow = last >= 0 ? rows[last] : null, nextRow = null;
  for (k = last + 1; k < rows.length; k++) if (!rows[k].done && !rows[k].noShow) { nextRow = rows[k]; break; }
  var k;

  /* 6. Callan lesson (same numbering as the app): each Lesson Check row ends one lesson. Lesson k holds
        the words up to the last new word of the class where "LC k" is scheduled. */
  var bounds = [];
  rows.forEach(function (x) { var n = num(x.lc); if (n != null && x.nw) bounds.push({ lesson: n, endWord: x.nw.to }); });
  bounds.sort(function (a, b) { return a.lesson - b.lesson; });
  var lastNW = null;
  rows.forEach(function (x) { if (x.done && x.nw) lastNW = x.nw.to; });
  var current = null, finished = false;
  if (bounds.length && lastNW != null) {
    for (k = 0; k < bounds.length; k++) if (bounds[k].endWord >= lastNW) { current = bounds[k].lesson; finished = bounds[k].endWord === lastNW; break; }
    if (current == null) { current = bounds[bounds.length - 1].lesson; finished = true; }
  }

  var lessonOf = function (x) { if (!x.nw) return null; for (var q = 0; q < bounds.length; q++) if (bounds[q].endWord >= x.nw.to) return bounds[q].lesson; return null; };
  var students = {};
  scols.forEach(function (sc) {
    var me = { lastWord: '', lastNewWord: null, missed: [] };
    rows.forEach(function (x) {
      if (!x.done) return;
      var a = x.att.filter(function (y) { return y.name === sc.name; })[0];
      if (!a) return;
      if (a.here) { if (!x.conv && x.word && !/^[—–-]+$/.test(x.word)) me.lastWord = x.word; if (x.nw) me.lastNewWord = x.nw.to; }
      else me.missed.push({ classNumber: x.cls, lesson: lessonOf(x), conversation: !!x.conv, review: x.rev, newWords: x.nw });
    });
    me.missed = me.missed.slice(-3);
    students[sc.name] = me;
  });
  var wordRow = null;
  var parRow = null;
  rows.forEach(function (x) { if (x.done && !x.conv && x.word && !/^[—–-]+$/.test(x.word)) wordRow = x; if (x.done && x.paragraph != null) parRow = x; });
  var pending = function (v) { return v !== '' && !dash.test(v); };
  return {
    ok: true, sheetName: sheetName, stage: stage, students: students,
    currentPosition: lastRow ? {
      classNumber: lastRow.cls, lesson: current, lessonFinished: finished, paragraph: parRow ? parRow.paragraph : null,
      lastWord: wordRow ? wordRow.word : '', lastNewWord: lastNW,
      reading: lastRow.read, dictation: lastRow.dict, lessonCheck: lastRow.lc
    } : null,
    nextClass: nextRow ? {
      classNumber: nextRow.cls, contents: nextRow.contents, conversation: !!nextRow.conv, activity: (!nextRow.conv && !nextRow.rev && !nextRow.nw) ? nextRow.contents : '',
      review: nextRow.rev, newWords: nextRow.nw,
      hasReading: pending(nextRow.read), hasDictation: pending(nextRow.dict), hasQuiz: pending(nextRow.lc),
      reading: nextRow.read, dictation: nextRow.dict, lessonCheck: nextRow.lc
    } : null,
    classesDone: rows.filter(function (x) { return x.done; }).length, classesTotal: rows.length,
    bounds: bounds
  };
}


/* Older tabs (2025 and some 2026 ones) have no Contents/Status columns: the header row has
   "Last Word Taught" and "Read/Dict"; column before it holds the class number and paragraph. */
function parseOldLayout_(values, sheetName) {
  var norm = function (v) { return String(v == null ? '' : v).trim(); };
  var num = function (v) { var m = norm(v).match(/^\d+$/); return m ? parseInt(m[0], 10) : null; };
  var h = -1, w = -1, i, j;
  for (i = 0; i < values.length && h < 0; i++)
    for (j = 0; j < values[i].length; j++) if (/^last word taught$/i.test(norm(values[i][j]))) { h = i; w = j; break; }
  if (h < 0) return { ok: false, error: 'header-not-found', sheetName: sheetName };
  var stage = null, m = String(sheetName).match(/(?:stage|stg|etapa)\s*(\d+)/i);
  if (m) stage = parseInt(m[1], 10);
  if (stage == null) for (i = 0; i < h; i++) for (j = 0; j < values[i].length; j++) { m = norm(values[i][j]).match(/stage\s*(\d+)/i); if (m && stage == null) stage = parseInt(m[1], 10); }
  var rows = [];
  for (i = h + 1; i < values.length; i++) {
    var r = values[i], cls = num(r[w - 2]);
    if (cls == null) { if (rows.length) break; else continue; }
    var word = norm(r[w]);
    rows.push({ row: i + 1, cls: cls, paragraph: num(r[w - 3]), word: word, done: word !== '', readDict: norm(r[w + 2]) });
  }
  var last = -1, k;
  rows.forEach(function (x, n) { if (x.done) last = n; });
  var lastRow = last >= 0 ? rows[last] : null, nextRow = null;
  for (k = last + 1; k < rows.length; k++) if (!rows[k].done) { nextRow = rows[k]; break; }
  return { ok: true, layout: 'old', sheetName: sheetName, stage: stage,
    currentPosition: lastRow ? { classNumber: lastRow.cls, lesson: null, lessonFinished: false, paragraph: lastRow.paragraph, lastWord: lastRow.word, lastNewWord: null, reading: lastRow.readDict, dictation: '', lessonCheck: '' } : null,
    nextClass: nextRow ? { classNumber: nextRow.cls, contents: '', review: null, newWords: null, hasReading: false, hasDictation: false, hasQuiz: false, reading: '', dictation: '', lessonCheck: '' } : null,
    classesDone: rows.filter(function (x) { return x.done; }).length, classesTotal: rows.length };
}
