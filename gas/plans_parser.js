/* Britland: reads ONE tab of the "Planos de Aula" sheet and returns the pedagogical position of the student.
   Pure function of the tab's values (2D array) + the tab name, so it can be tested without Google. */
/* Callan Español: first paragraph of each lesson (1-112) and lessons of each Etapa. */
var ES_LESSON_PAR_ = [1,8,15,23,31,38,45,52,58,65,70,75,80,85,90,95,101,107,113,118,123,129,134,139,145,150,155,160,165,170,175,180,185,190,196,202,208,213,219,225,231,237,243,249,255,261,267,272,278,284,290,296,302,308,316,322,328,334,340,346,353,359,365,371,377,382,388,393,398,404,411,416,422,427,434,441,446,451,456,461,467,472,477,483,489,494,501,506,513,519,524,530,537,542,547,553,561,568,572,576,582,587,592,598,602,607,613,618,625,630,635,641];
var ES_STAGES_ = [[1, 16], [17, 32], [33, 52], [53, 72], [73, 92], [93, 112]];
function esLessonEnd_(L) { return L < ES_LESSON_PAR_.length ? ES_LESSON_PAR_[L] - 1 : 646; }
function parsePlanTab(values, sheetName) {
  var norm = function (v) { return String(v == null ? '' : v).trim(); };
  var num = function (v) { var m = norm(v).match(/^\d+$/); return m ? parseInt(m[0], 10) : null; };
  var dash = /^[—–-]?$/;

  /* 1. Header row: the row that has a "Contents" cell (it moves between tabs, row 7 or 8). */
  var h = -1, i, j;
  for (i = 0; i < values.length && h < 0; i++)
    for (j = 0; j < values[i].length; j++) if (/^(contents|contenido(\s*\/\s*materia)?)$/i.test(norm(values[i][j]))) { h = i; break; }
  if (h < 0) return parseOldLayout_(values, sheetName);
  var col = {}, es = false;
  values[h].forEach(function (c) { if (/^contenido/i.test(norm(c))) es = true; });
  values[h].forEach(function (c, k) {
    c = norm(c);
    if (/^(date|fecha)$/i.test(c)) { col.date = k; col.cls = k - 1; }
    else if (/^(contents|contenido(\s*\/\s*materia)?)$/i.test(c)) col.contents = k;
    else if (/^(paragraph|p[aá]rrafo)$/i.test(c)) col.par = k;
    else if (/^(last word|[uú]ltima palabra)/i.test(c)) col.word = k;
    else if (/^(read|lect)/i.test(c)) col.read = k;
    else if (/^dict/i.test(c)) col.dict = k;
    else if (/^(lc|er)$/i.test(c)) col.lc = k;
    else if (/^(status|estado)$/i.test(c)) col.status = k;
    else if (/^(done|hecho)$/i.test(c)) col.done = k;
  });
  if (col.contents == null || col.status == null) return { ok: false, error: 'columns-not-found', sheetName: sheetName };
  /* Student columns: between "Done" and "Status" (a checked box = the student came to that class). */
  var scols = [];
  if (col.done != null) for (j = col.done + 1; j < col.status; j++) { var nm = norm(values[h][j]); if (nm && !/^[—–-]+$/.test(nm)) scols.push({ name: nm, k: j }); }

  /* 2. Stage: from the tab name (Stage 1 / STG 2 / Etapa 3 / ETP 3), then from the "STAGE N PROGRESS" label. */
  var stage = null, m = String(sheetName).match(/(?:stage|stg|etapa|etp)\s*(\d+)/i);
  if (m) stage = parseInt(m[1], 10);
  for (i = 0; i < h && stage == null; i++)
    for (j = 0; j < values[i].length; j++) { m = norm(values[i][j]).match(/STAGE\s*(\d+)\s*PROGRESS/i) || norm(values[i][j]).match(/PROGRESO\s*ETAPA\s*(\d+)/i); if (m) { stage = parseInt(m[1], 10); break; } }

  /* 3. Class rows: from the header down while there is a status. */
  var rows = [];
  for (i = h + 1; i < values.length; i++) {
    var r = values[i], status = norm(r[col.status]), contents = norm(r[col.contents]);
    if (!contents || !status) { if (rows.length) break; else continue; }
    if (/^(lançamento|nota|pontua|b[oô]nus|resultado|bonificaci|conversaci[oó]n con)/i.test(contents)) break;
    var word = col.word != null ? norm(r[col.word]) : '', par = col.par != null ? norm(r[col.par]) : '';
    var noShow = /no.?show/i.test(word) || /^ns$/i.test(par) || /^falta$/i.test(status);
    rows.push({
      row: i + 1, cls: col.cls != null ? num(r[col.cls]) : null, contents: contents,
      att: scols.map(function (sc) { return { name: sc.name, here: /^true$/i.test(norm(r[sc.k])) }; }),
      conv: /^e$/i.test(par) || /conversation|conversaci[oó]n/i.test(contents),
      status: status, noShow: noShow, done: /^(completed|realizada|completada)$/i.test(status) && !noShow,
      paragraph: num(par), word: noShow ? '' : word,
      read: col.read != null ? norm(r[col.read]) : '', dict: col.dict != null ? norm(r[col.dict]) : '',
      lc: col.lc != null ? norm(r[col.lc]) : ''
    });
  }

  /* 4. Contents: "REV 1 hello - 9 number / NW 10 on - 12 where" */
  var rng = function (txt, tag) {
    var rx = new RegExp('(?:' + tag + ')\\s+(\\d+)(?:\\s+([^/]+?))?\\s+[-–]\\s+(\\d+)(?:\\s+([^/]+?))?\\s*(?:/|$)', 'i'), q = txt.match(rx);
    return q ? { from: parseInt(q[1], 10), fromWord: q[2] || '', to: parseInt(q[3], 10), toWord: q[4] || '' } : null;
  };
  /* Spanish: "REP 1 bolígrafo - 4 mesa / NP 5 silla - 9 largo"; whole-review class: "REPASO EXCLUSIVO 1 • Párrafos 1 a 50 (...)" */
  /* formato novo das abas: "REV 1-5 / NW large - Mrs [6-10]" (paragrafos; palavras sem numero; NW traz [de-ate]) */
  var rng2 = function (txt, tag) {
    var m;
    if (/^REV|REP/.test(tag)) { m = txt.match(/(?:REV|REP)\s+(\d+)\s*[-–]\s*(\d+)\s*(?:\/|$)/i); return m ? { from: parseInt(m[1], 10), fromWord: '', to: parseInt(m[2], 10), toWord: '' } : null; }
    m = txt.match(/(?:NW|NP)\s+(.+?)\s+[-–]\s+(.+?)\s*\[\s*(\d+)\s*[-–]\s*(\d+)\s*\]/i);
    return m ? { from: parseInt(m[3], 10), fromWord: m[1].trim(), to: parseInt(m[4], 10), toWord: m[2].trim() } : null;
  };
  rows.forEach(function (x) {
    x.rev = rng(x.contents, 'REV|REP') || rng2(x.contents, 'REV'); x.nw = rng(x.contents, 'NW|NP') || rng2(x.contents, 'NW');
    if (!x.rev && !x.nw) { var q = x.contents.match(/p[aá]rrafos\s+(\d+)\s+a\s+(\d+)/i); if (q) x.rev = { from: parseInt(q[1], 10), fromWord: '', to: parseInt(q[2], 10), toWord: '' }; }
  });

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
  /* Spanish tabs: the numbers in REP/NP are paragraphs, and the ER numbers do not follow the lessons, so the end of each lesson comes from the book's paragraph table. */
  if (es && stage >= 1 && stage <= ES_STAGES_.length) {
    bounds = [];
    for (var L = ES_STAGES_[stage - 1][0]; L <= ES_STAGES_[stage - 1][1]; L++) bounds.push({ lesson: L, endWord: esLessonEnd_(L) });
  }
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
    ok: true, sheetName: sheetName, stage: stage, lang: es ? 'es' : 'en', students: students,
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
  var stage = null, m = String(sheetName).match(/(?:stage|stg|etapa|etp)\s*(\d+)/i);
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
if (typeof module !== 'undefined') module.exports = { parsePlanTab: parsePlanTab };
