#!/usr/bin/env python3
"""Builds the Spanish copies of the shared pages (account, payments, exam) from the English ones.
Run from the repo root after changing those pages:  python3 tools/make_spanish.py"""
import re

EXAM_ES=[
("PART_NAME={dictation:'Dictation',yesno:'Yes / No quiz',oral:'Listening',gap:'Gap fill',mc:'Multiple choice',err:'Error correction'}","PART_NAME={dictation:'Dictado',yesno:'Sí / No',oral:'Comprensión oral',gap:'Test de vocabulario',mc:'Opción múltiple',err:'Corrección de errores'}"),
("'Back to the activities'","'Volver a las actividades'"),
("'No exam is open yet'","'Todavía no hay ningún examen abierto'"),
("'Your teacher will open the Stage Exam for you when you have finished the Lesson Checks of your Stage.'","'Tu profesor abrirá el examen de etapa cuando hayas terminado los ejercicios de repaso de tu etapa.'"),
("'Stage '+n+' Exam'","'Examen de la Etapa '+n"),
("'Stage '+stage+' Exam'","'Examen de la Etapa '+stage"),
("'Submitted':(st.state==='running'?'In progress':'Ready')","'Enviado':(st.state==='running'?'En curso':'Listo')"),
("st.state==='done'?'Open':'Start'","st.state==='done'?'Abrir':'Empezar'"),
("'Your exams'","'Tus exámenes'"),
("'Could not load the exam'","'No se pudo cargar el examen'"),
("'This exam is not open'","'Este examen no está abierto'"),
("'Please ask your teacher.'","'Pregunta a tu profesor.'"),
("'Start the exam'","'Empezar el examen'"),
("st.minutes+' minutes'),' in total. The timer starts when you press the button.'","st.minutes+' minutos'),' en total. El tiempo empieza a contar cuando pulsas el botón.'"),
("'The exam has parts. You go from one part to the next and ',el('b',{},'you cannot go back'),' to a finished part.'","'El examen tiene varias partes. Pasas de una parte a la siguiente y ',el('b',{},'no puedes volver'),' a una parte terminada.'"),
("'Your teacher reads the dictation and the listening questions aloud, so stay with your teacher.'","'Tu profesor lee en voz alta el dictado y las preguntas, así que quédate con tu profesor.'"),
("'You can do the exam only once. Your answers are saved automatically. When you reach the last part, the ',el('b',{},'End exam'),' button appears. Press it when you finish.'","'Solo puedes hacer el examen una vez. Tus respuestas se guardan automáticamente. Cuando llegues a la última parte, aparecerá el botón ',el('b',{},'Terminar examen'),'. Púlsalo cuando termines.'"),
("'Do not close this page, press Back or reload.'","'No cierres esta página, no pulses Atrás ni la recargues.'"),
("'I am with my teacher and ready to start.'","'Estoy con mi profesor y listo para empezar.'"),
("'Could not start the exam'","'No se pudo empezar el examen'"),
("'Time is up':'Time left'","'Se acabó el tiempo':'Tiempo restante'"),
("'Not saved: check your connection':'Saved'","'No guardado: revisa tu conexión':'Guardado'"),
("'aria-label':'Smaller text'","'aria-label':'Texto más pequeño'"),
("'aria-label':'Larger text'","'aria-label':'Texto más grande'"),
("'aria-label':'Normal text size'","'aria-label':'Tamaño de texto normal'"),
("'aria-live':'polite'},'Saved')","'aria-live':'polite'},'Guardado')"),
("'aria-label':'Text size'","'aria-label':'Tamaño del texto'"),
("'aria-label':'Time left'},el('div',{},el('small',{id:'tlab'},'Time left')","'aria-label':'Tiempo restante'},el('div',{},el('small',{id:'tlab'},'Tiempo restante')"),
("hidden:true},'End exam')","hidden:true},'Terminar examen')"),
("'aria-label':'Parts'","'aria-label':'Partes'"),
("['the text box']","['el cuadro de texto']"),
("'Saving…'","'Guardando…'"),
("'Part '+(part+1)+' of '+items.parts.length+' · '","'Parte '+(part+1)+' de '+items.parts.length+' · '"),
("'aria-label':'Dictation: write what your teacher reads'","'aria-label':'Dictado: escribe lo que lee tu profesor'"),
("el('span',{},'0 words')","el('span',{},'0 palabras')"),
("words()+' words'","words()+' palabras'"),
("'Write everything you hear.'","'Escribe todo lo que oigas.'"),
("aria-label':'Question '+n","aria-label':'Pregunta '+n"),
("[['Yes','Yes'],['No','No'],['?','?']]","[['Yes','Sí'],['No','No'],['?','?']]"),
("'I did not understand the question'","'No entendí la pregunta'"),
("'Listen to question '+n+' and choose the answer.'","'Escucha la pregunta '+n+' y elige la respuesta.'"),
("'Answer for question '+n","'Respuesta a la pregunta '+n"),
("'One word only.'","'Solo una palabra.'"),
("'Find the mistake and correct the sentence.'","'Busca el error y corrige la frase.'"),
("'Corrected sentence '+n","'Frase corregida '+n"),
("'Start again with the original sentence'","'Empezar de nuevo con la frase original'"),
("'Questions'","'Preguntas'"),
("'Go to question '+n","'Ir a la pregunta '+n"),
("'Write the whole dictation in the box.'","'Escribe todo el dictado en el cuadro.'"),
("last?'End exam':'Next part →'","last?'Terminar examen':'Siguiente parte →'"),
("'Blank: '+s.blank.join(', '):'All answered'","'Sin responder: '+s.blank.join(', '):'Todo respondido'"),
("' · Marked ?: '","' · Marcadas con ?: '"),
("'Go back to the questions'","'Volver a las preguntas'"),
("'Answer every question'","'Responde todas las preguntas'"),
("'In this part you must choose Yes, No or ? for every question. Missing: '","'En esta parte debes elegir Sí, No o ? en cada pregunta. Faltan: '"),
("'Press ? if you did not understand the question.'","'Pulsa ? si no entendiste la pregunta.'"),
("'Stay in this part'","'Quedarme en esta parte'"),
("'Go to Part '+(part+2)","'Ir a la Parte '+(part+2)"),
("'Finish Part '+(part+1)+'?'","'¿Terminar la Parte '+(part+1)+'?'"),
("s.done+' of '+s.total),' answered. '","s.done+' de '+s.total),' respondidas. '"),
("'All answered.'","'Todo respondido.'"),
("'You cannot come back to this part.'","'No podrás volver a esta parte.'"),
("'Next: '","'Siguiente: '"),
("'Finished'","'Terminada'"),
("'Not started'","'Sin empezar'"),
("'Keep working'","'Seguir trabajando'"),
("'End and send the exam'","'Terminar y enviar el examen'"),
("'End the exam?'","'¿Terminar el examen?'"),
("'The time is up.'","'Se acabó el tiempo.'"),
("el('th',{},'Part'),el('th',{class:'r'},'Answered'),el('th',{},'Status')","el('th',{},'Parte'),el('th',{class:'r'},'Respondidas'),el('th',{},'Estado')"),
("'After you send, you cannot change anything.'","'Después de enviar, no podrás cambiar nada.'"),
("'Could not send the exam: '+r.error.message+'\\nCheck your connection and try again.'","'No se pudo enviar el examen: '+r.error.message+'\\nRevisa tu conexión e inténtalo de nuevo.'"),
("<title>Stage Exam · Britland Academy</title>","<title>Examen de etapa · Britland Academy</title>"),
("'Exam submitted'","'Examen enviado'"),
("'Your teacher will talk to you about the result.'","'Tu profesor hablará contigo sobre el resultado.'"),
("'Thank you! Your answers were sent. Your teacher will check the exam and give you the result.'","'¡Gracias! Tus respuestas fueron enviadas. Tu profesor corregirá el examen y te dará el resultado.'"),
]

ADMIN_TERMS=[('Stage 1 Lesson 1.mp3','@@A1'),('Stage 1 Lesson 6 Dictation 1.mp3','@@A2'),('Workbook Lesson 005 J1.mp3','@@A3'),('Escolha o Stage','Escolha a Etapa'),('Escolher o Stage','Escolher a Etapa'),('ou escolha o Stage','ou escolha a Etapa'),
 ('Prova deste Stage','Prova desta Etapa'),('Liberar a nota de todos os que já enviaram este Stage','Liberar a nota de todos os que já enviaram esta Etapa'),
 ('Liberar a nota do Stage','Liberar a nota da Etapa'),('Lesson Checks do Stage','Ejercicios de repaso da Etapa'),
 ('Lesson Checks das lessons','Ejercicios de repaso das lecciones'),('os Lesson Checks','os Ejercicios de repaso'),('Lesson Checks','Ejercicios de repaso'),
 ('Lesson Check','Ejercicio de repaso'),('Liberar até a Lesson','Liberar até a Lección'),('Liberado até a Lesson','Liberado até a Lección'),
 ('último Lesson','última Lección'),('a última Lesson','a última Lección'),('da última Lesson','da última Lección'),
 ('Business (Lessons 1 a 17)','Business (Lecciones 1 a 17)'),(' (Lessons ',' (Lecciones '),
 ("'Lesson '+","'Lección '+"),("'Lesson ':","'Lección ':"),('Lesson ','Lección '),
 ('Áudios das lessons','Áudios das lecciones'),('as lessons','as lecciones'),('das lessons','das lecciones'),('ver as lessons','ver as lecciones'),
 ('lessons dele','lecciones dela'),('liberar lessons','liberar lecciones'),('lessons (texto)','lecciones (texto)'),('Faltam as lessons','Faltam as lecciones'),
 ("'Stage '+","'Etapa '+"),('Stages','Etapas'),('Stage ','Etapa '),('Placement tests','Pruebas de nivel'),
 ("'Lesson'","'Lección'"),("'Exercicio'","'Ejercicio'"),("'Nivel '+","'Nivel '+")]
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
    if f=='exam.html':
        miss=[a for a,b in EXAM_ES if a not in s]
        assert not miss,miss
        for a,b in EXAM_ES: s=s.replace(a,b)
    if f=='admin.html':
        for a,b in [('<p>Callan Method · Third Edition</p>','<p>Callan Español</p>'),
            ('(0 a 206)','(0 a 112)'),('Lesson Checks e exercícios.','e Ejercicios de repaso.'),
            ('min="0" max="206" value="12"','min="0" max="112" value="16"'),
            ('<option value="check">Lesson Checks</option><option value="ex">Exercises</option><option value="wb">Workbook</option>','<option value="check">Ejercicios de repaso (nº = repaso)</option><option value="dele">DELE (nº 1–6 = A1…C2)</option>')]:
            assert a in s,a
            s=s.replace(a,b)
        for a,b in ADMIN_TERMS: s=s.replace(a,b)
        s=s.replace('@@A1','Stage 1 Lesson 1.mp3').replace('@@A2','Stage 1 Lesson 6 Dictation 1.mp3').replace('@@A3','Workbook Lesson 005 J1.mp3')
    open('espanol/'+f,'w',encoding='utf-8').write(s)
    print('espanol/'+f,len(s))
