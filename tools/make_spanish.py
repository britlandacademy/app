#!/usr/bin/env python3
"""Builds the Spanish copies of the shared pages (account, payments, exam) from the English ones.
Run from the repo root after changing those pages:  python3 tools/make_spanish.py"""
import re
PAGES=['account.html','payments.html','exam.html','admin.html']
for f in PAGES:
    s=open(f,encoding='utf-8').read()
    s=s.replace('<html lang="pt-BR">','<html lang="es">').replace('<html lang="en">','<html lang="es">')
    s=re.sub(r'<link rel="manifest" href="manifest.webmanifest">','',s)
    s=s.replace('href="js/fonts.css"','href="../js/fonts.css"')
    s=s.replace('<link rel="stylesheet" href="js/theme.css">','<link rel="stylesheet" href="../js/theme.css"><link rel="stylesheet" href="js/palette.css">',1)
    s=s.replace('<script src="js/pwa.js" defer></script>','<script src="../js/pwa.js" defer></script>')
    s=re.sub(r'<script src="js/config\.js" charset="utf-8"></script>\s*','',s)
    cfg='<script src="js/config.js" charset="utf-8"></script>\n<script src="js/i18n-es.js" charset="utf-8"></script>\n'
    if '<script src="js/i18n.js" charset="utf-8"></script>' in s:
        s=s.replace('<script src="js/i18n.js" charset="utf-8"></script>',cfg+'<script src="../js/i18n.js" charset="utf-8"></script>')
    else:
        s=s.replace('<script src="js/gate.js" charset="utf-8"></script>',cfg+'<script src="js/gate.js" charset="utf-8"></script>',1)
    for n in ('gate','covers','streak','protect'):
        s=s.replace('<script src="js/%s.js" charset="utf-8"></script>'%n,'<script src="../js/%s.js" charset="utf-8"></script>'%n)
    if f=='admin.html':
        for a,b in [('<p>Callan Method · Third Edition</p>','<p>Callan Español</p>'),
            ('(0 a 206)','(0 a 112)'),('Lesson Checks e exercícios.','e Ejercicios de repaso.'),
            ('min="0" max="206" value="12"','min="0" max="112" value="16"'),
            ('<option value="check">Lesson Checks</option><option value="ex">Exercises</option><option value="wb">Workbook</option>','<option value="check">Ejercicios de repaso (nº = repaso)</option><option value="dele">DELE (nº 1–6 = A1…C2)</option>')]:
            assert a in s,a
            s=s.replace(a,b)
    open('espanol/'+f,'w',encoding='utf-8').write(s)
    print('espanol/'+f,len(s))
