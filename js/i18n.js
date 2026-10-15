/* Callan site: language selector (English / Português / Español).
   Translates menus, headings, buttons, home and sign-in screens. Lesson and exercise content stays in English.
   Every text is looked up by its exact wording, in any of the three languages, so it works on every page. */
(function(){
'use strict';
var LANGS=[['en','English'],['pt','Português'],['es','Español']];
var KEY='callan-lang';
var D=[ /* [English, Português, Español] ; {0} {1} = values that stay as they are */
/* ---- sign in ---- */
['Sign in','Entrar','Iniciar sesión'],
['Request access','Pedir acesso','Solicitar acceso'],
['Student Area - Teacher Paulo Cruz','Área do Aluno - Prof. Paulo Cruz','Área del Alumno - Prof. Paulo Cruz'],
['Callan Method · Teacher: Paulo S. Cruz','Método Callan · Professor: Paulo S. Cruz','Método Callan · Profesor: Paulo S. Cruz'],
['First time here? Fill in the form. Your teacher will approve your access.','Primeira vez aqui? Preencha o formulário. Seu professor vai aprovar o seu acesso.','¿Primera vez aquí? Rellena el formulario. Tu profesor aprobará tu acceso.'],
['Your name','Seu nome','Tu nombre'],
['E-mail','E-mail','Correo electrónico'],
['Password','Senha','Contraseña'],
['Choose a password (at least 8 characters)','Escolha uma senha (mínimo de 8 caracteres)','Elige una contraseña (mínimo 8 caracteres)'],
['Send request','Enviar pedido','Enviar solicitud'],
['Loading…','Carregando…','Cargando…'],
['Please wait.','Aguarde um instante.','Espera un momento.'],
['Check your e-mail','Verifique seu e-mail','Revisa tu correo'],
['We sent a link to confirm your e-mail. After that, your teacher will approve your access.','Enviamos um link para confirmar seu e-mail. Depois disso, seu professor vai aprovar o seu acesso.','Enviamos un enlace para confirmar tu correo. Después, tu profesor aprobará tu acceso.'],
['Back','Voltar','Volver'],
['Wrong e-mail or password.','E-mail ou senha incorretos.','Correo o contraseña incorrectos.'],
['This e-mail is already registered. Use "Sign in".','Este e-mail já está cadastrado. Use "Entrar".','Este correo ya está registrado. Usa "Iniciar sesión".'],
['This e-mail is not confirmed yet. Ask your teacher.','Este e-mail ainda não foi confirmado. Fale com seu professor.','Este correo aún no está confirmado. Habla con tu profesor.'],
['Choose a longer password (at least 8 characters).','Escolha uma senha mais longa (mínimo de 8 caracteres).','Elige una contraseña más larga (mínimo 8 caracteres).'],
['Too many attempts. Wait a few minutes and try again.','Muitas tentativas. Espere alguns minutos e tente de novo.','Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'],
['No connection. Check your internet and try again.','Sem conexão. Verifique a internet e tente de novo.','Sin conexión. Revisa tu internet e inténtalo de nuevo.'],
['Something went wrong. Try again.','Algo deu errado. Tente de novo.','Algo salió mal. Inténtalo de nuevo.'],
['Type your name.','Digite seu nome.','Escribe tu nombre.'],
['Type a valid e-mail.','Digite um e-mail válido.','Escribe un correo válido.'],
['The password needs at least 8 characters.','A senha precisa ter no mínimo 8 caracteres.','La contraseña necesita al menos 8 caracteres.'],
['Type your password.','Digite sua senha.','Escribe tu contraseña.'],
['Account not ready','Conta não está pronta','Cuenta no lista'],
['We could not read your account. Try again in a moment.','Não foi possível ler a sua conta. Tente de novo em instantes.','No pudimos leer tu cuenta. Inténtalo de nuevo en un momento.'],
['Try again','Tentar de novo','Intentar de nuevo'],
['Sign out','Sair','Cerrar sesión'],
['Waiting for approval','Aguardando aprovação','Esperando aprobación'],
['Your request was sent, {0}. Your teacher needs to approve your access.','Seu pedido foi enviado, {0}. Seu professor precisa aprovar o seu acesso.','Tu solicitud fue enviada, {0}. Tu profesor debe aprobar tu acceso.'],
['Come back later and press "Check again".','Volte mais tarde e toque em "Verificar de novo".','Vuelve más tarde y pulsa "Verificar de nuevo".'],
['Check again','Verificar de novo','Verificar de nuevo'],
['Access closed','Acesso encerrado','Acceso cerrado'],
['Your access is not active. Talk to your teacher.','Seu acesso não está ativo. Fale com seu professor.','Tu acceso no está activo. Habla con tu profesor.'],
['Teachers only','Somente professor','Solo profesor'],
['This page is for the teacher.','Esta página é do professor.','Esta página es para el profesor.'],
['No lessons yet','Nenhuma lição ainda','Aún no hay lecciones'],
['Your access is approved, but no lesson has been released to you yet. Talk to your teacher.','Seu acesso foi aprovado, mas nenhuma lição foi liberada para você ainda. Fale com seu professor.','Tu acceso fue aprobado, pero aún no se te ha liberado ninguna lección. Habla con tu profesor.'],
['Could not load','Não foi possível carregar','No se pudo cargar'],
['No connection','Sem conexão','Sin conexión'],
['Could not load the sign-in system. Check your internet and reload the page.','Não foi possível carregar o sistema de acesso. Verifique a internet e recarregue a página.','No se pudo cargar el sistema de acceso. Revisa tu internet y recarga la página.'],
['Reload','Recarregar','Recargar'],
/* ---- top bar ---- */
['Signed in:','Conectado:','Sesión iniciada:'],
['Home','Início','Inicio'],
['Teacher panel','Painel do professor','Panel del profesor'],
['Text size {0}/{1}','Tamanho do texto {0}/{1}','Tamaño del texto {0}/{1}'],
['Smaller text','Texto menor','Texto más pequeño'],
['Larger text','Texto maior','Texto más grande'],
['Normal text size','Tamanho normal do texto','Tamaño normal del texto'],
['Text size','Tamanho do texto','Tamaño del texto'],
['☀ Light mode','☀ Modo claro','☀ Modo claro'],
['☾ Dark mode','☾ Modo escuro','☾ Modo oscuro'],
['Switch to light mode','Mudar para o modo claro','Cambiar al modo claro'],
['Switch to dark mode','Mudar para o modo escuro','Cambiar al modo oscuro'],
['Language','Idioma','Idioma'],
/* ---- home ---- */
['Callan English','Callan English','Callan English'],
['Callan English · Third Edition','Callan English · Terceira Edição','Callan English · Tercera Edición'],
['Teacher:','Professor:','Profesor:'],
['Teacher: {0}','Professor: {0}','Profesor: {0}'],
['Welcome','Bem-vindo','Bienvenido'],
['Welcome back','Bem-vindo de volta','Bienvenido de nuevo'],
['Welcome back, {0}','Bem-vindo de volta, {0}','Bienvenido de nuevo, {0}'],
['Choose an activity.','Escolha uma atividade.','Elige una actividad.'],
['Continue where you stopped','Continue de onde parou','Continúa donde lo dejaste'],
['Continue →','Continuar →','Continuar →'],
['lessons available','lições disponíveis','lecciones disponibles'],
['Lesson Checks done','Lesson Checks feitos','Lesson Checks hechos'],
['average score','nota média','nota media'],
['Lessons','Lições','Lecciones'],
['Read each lesson and listen to the audio','Leia cada lição e ouça o áudio','Lee cada lección y escucha el audio'],
['Exercises','Exercícios','Ejercicios'],
['Questions and answers in the Callan style','Perguntas e respostas no estilo Callan','Preguntas y respuestas al estilo Callan'],
['Workbook','Workbook','Workbook'],
['Pictures, matching, reading and dictation','Imagens, associação, leitura e ditado','Imágenes, emparejar, lectura y dictado'],
['Lesson Checks','Lesson Checks','Lesson Checks'],
['Answer the questions from the book','Responda às perguntas do livro','Responde las preguntas del libro'],
['Lesson Checks done','Lesson Checks feitos','Lesson Checks hechos'],
['Stage {0} · Lesson {1} Check','Etapa {0} · Lição {1} Check','Etapa {0} · Lección {1} Check'],
/* ---- page headers ---- */
['Third Edition','Terceira Edição','Tercera Edición'],
['Lessons · Britland Academy','Lições · Britland Academy','Lecciones · Britland Academy'],
['Lesson Checks · Britland Academy','Lesson Checks · Britland Academy','Lesson Checks · Britland Academy'],
['Exercises · Britland Academy','Exercícios · Britland Academy','Ejercicios · Britland Academy'],
['Workbook · Britland Academy','Workbook · Britland Academy','Workbook · Britland Academy'],
['Placement test · Britland Academy','Teste de nível · Britland Academy','Prueba de nivel · Britland Academy'],
['Teacher panel · Britland Academy','Painel do professor · Britland Academy','Panel del profesor · Britland Academy'],
['Callan Lessons','Callan · Lições','Callan · Lecciones'],
['Callan Lesson Checks','Callan · Lesson Checks','Callan · Lesson Checks'],
['Callan Exercises','Callan · Exercícios','Callan · Ejercicios'],
['Callan Workbook','Callan · Workbook','Callan · Workbook'],
['Choose a Stage and a lesson. Listen to the audio and read the lesson, as in the book.','Escolha uma etapa e uma lição. Ouça o áudio e leia a lição, como no livro.','Elige una etapa y una lección. Escucha el audio y lee la lección, como en el libro.'],
['Take the Lesson Check for each lesson, with the same questions as in the book.','Faça o Lesson Check de cada lição, com as mesmas perguntas do livro.','Haz el Lesson Check de cada lección, con las mismas preguntas del libro.'],
['Extra Exercises: Questions and Answers','Exercícios extras: perguntas e respostas','Ejercicios extra: preguntas y respuestas'],
['Practise with Callan Method questions. Each lesson uses only the vocabulary already taught.','Pratique com perguntas do Método Callan. Cada lição usa só o vocabulário já ensinado.','Practica con preguntas del Método Callan. Cada lección usa solo el vocabulario ya enseñado.'],
['Pictures, matching, reading and dictation for each lesson. Four short sections per lesson.','Imagens, associação, leitura e ditado para cada lição. Quatro seções curtas por lição.','Imágenes, emparejar, lectura y dictado para cada lección. Cuatro secciones cortas por lección.'],
['How to answer:','Como responder:','Cómo responder:'],
['choose A, B or C; choose one word from the list; choose Yes or No; or say if a sentence is right or wrong. Then press Check. Each Lesson Check opens only after the previous one.','escolha A, B ou C; escolha uma palavra da lista; escolha Yes ou No; ou diga se uma frase está certa ou errada. Depois toque em Check. Cada Lesson Check só abre depois do anterior.','elige A, B o C; elige una palabra de la lista; elige Yes o No; o di si una frase es correcta o incorrecta. Luego pulsa Check. Cada Lesson Check se abre solo después del anterior.'],
['Callan rule:','Regra Callan:','Regla Callan:'],
['always answer with a full sentence that repeats the words of the question. One-word answers do not count.','responda sempre com uma frase completa que repita as palavras da pergunta. Respostas de uma palavra não valem.','responde siempre con una frase completa que repita las palabras de la pregunta. Las respuestas de una palabra no cuentan.'],
['Your last score could not be saved. Check your internet connection and try again.','Sua última nota não pôde ser salva. Verifique a internet e tente de novo.','Tu última nota no pudo guardarse. Revisa tu conexión a internet e inténtalo de nuevo.'],
['Student:','Aluno:','Alumno:'],
['The order of the options changes at every attempt.','A ordem das opções muda a cada tentativa.','El orden de las opciones cambia en cada intento.'],
['Dictation uses your browser voice. Turn the sound on.','O ditado usa a voz do seu navegador. Ligue o som.','El dictado usa la voz de tu navegador. Activa el sonido.'],
['Callan English · Lesson Checks · {0}','Callan English · Lesson Checks · {0}','Callan English · Lesson Checks · {0}'],
/* ---- navigation ---- */
['Stage','Etapa','Etapa'],
['Stages','Etapas','Etapas'],
['Stage {0}','Etapa {0}','Etapa {0}'],
['Lesson','Lição','Lección'],
['Lesson {0}','Lição {0}','Lección {0}'],
['← Previous','← Anterior','← Anterior'],
['Next →','Próxima →','Siguiente →'],
['← Back to the start page','← Voltar à página inicial','← Volver a la página de inicio'],
['Check to unlock Lesson {0}','Faça o Check para liberar a Lição {0}','Haz el Check para desbloquear la Lección {0}'],
['History','Histórico','Historial'],
/* ---- admin ---- */
['Painel do professor','Painel do professor','Panel del profesor'],
['Callan Method · Third Edition','Método Callan · Terceira Edição','Método Callan · Tercera Edición'],
['Teacher panel','Painel do professor','Panel del profesor'],
['Access requests','Pedidos de acesso','Solicitudes de acceso'],
['Students and lesson release','Alunos e liberação das lições','Alumnos y liberación de lecciones'],
['"Released up to" is the number of the last Lesson the student can open (0 to 206). It applies to text, audio, Lesson Checks and exercises.','"Liberado até" é o número da última Lição que o aluno pode abrir (0 a 206). Vale para texto, áudio, Lesson Checks e exercícios.','"Liberado hasta" es el número de la última Lección que el alumno puede abrir (0 a 206). Vale para texto, audio, Lesson Checks y ejercicios.'],
['Release up to Lesson','Liberar até a Lição','Liberar hasta la Lección'],
['Apply to all approved students','Aplicar a todos os alunos aprovados','Aplicar a todos los alumnos aprobados'],
['Block closes access immediately (audio already opened may play for up to 2 hours). To delete an account for good: Supabase, Authentication, Users, Delete.','Bloquear fecha o acesso na hora (o áudio já aberto pode tocar por até 2 horas). Para apagar uma conta de vez: Supabase, Authentication, Users, Delete.','Bloquear cierra el acceso al instante (el audio ya abierto puede sonar hasta 2 horas). Para borrar una cuenta definitivamente: Supabase, Authentication, Users, Delete.'],
['Scores','Notas','Notas'],
['Show','Mostrar','Mostrar'],
['Export all attempts (CSV)','Exportar todas as tentativas (CSV)','Exportar todos los intentos (CSV)'],
['Choose the Stage to see its lessons. Each cell shows the student’s best score in the lesson (points / total). Green: 80% or more. Yellow: 50% to 79%. Red: below 50%.','Escolha a etapa para ver as lições dela. Cada célula mostra a melhor nota do aluno na lição (pontos / total). Verde: 80% ou mais. Amarelo: 50% a 79%. Vermelho: abaixo de 50%.','Elige la etapa para ver sus lecciones. Cada celda muestra la mejor nota del alumno en la lección (puntos / total). Verde: 80% o más. Amarillo: 50% a 79%. Rojo: menos de 50%.'],
['Details for one student','Detalhe de um aluno','Detalle de un alumno'],
['Content (text, checks and exercises)','Conteúdo (texto, checks e exercícios)','Contenido (texto, checks y ejercicios)'],
['Import content.json','Importar content.json','Importar content.json'],
['Importing again replaces the existing content with the same lesson number.','Importar de novo substitui o conteúdo existente com o mesmo número de lição.','Importar de nuevo reemplaza el contenido existente con el mismo número de lección.'],
['Audio files (MP3)','Áudios (MP3)','Audios (MP3)'],
['Upload audio files','Enviar áudios','Subir audios'],
['Choose several files at once (Ctrl+A in the folder). The names must stay as they are:','Escolha vários arquivos de uma vez (Ctrl+A na pasta). Os nomes devem ser como já estão:','Elige varios archivos a la vez (Ctrl+A en la carpeta). Los nombres deben quedar como están:'],
['. The site sorts them into the right folders by itself.','. O site organiza nas pastas certas sozinho.','. El sitio los organiza en las carpetas correctas por sí solo.'],
['Name','Nome','Nombre'],
['Student','Aluno','Alumno'],
['Status','Situação','Estado'],
['Released up to','Liberado até','Liberado hasta'],
['Action','Ação','Acción'],
['Requested on','Pedido em','Solicitado el'],
['Approve','Aprovar','Aprobar'],
['Decline','Recusar','Rechazar'],
['Block','Bloquear','Bloquear'],
['Reactivate','Reativar','Reactivar'],
['Approved','Aprovado','Aprobado'],
['Pending','Pendente','Pendiente'],
['Blocked','Bloqueado','Bloqueado'],
['No pending requests.','Nenhum pedido pendente.','Ninguna solicitud pendiente.'],
['No students yet.','Nenhum aluno ainda.','Ningún alumno todavía.'],
['No attempts yet.','Sem tentativas ainda.','Aún no hay intentos.'],
['Average','Média','Promedio'],
['Type','Tipo','Tipo'],
['Date','Data','Fecha'],
['Score','Nota','Nota'],
['Points','Pontos','Puntos'],
['Percentage','Percentual','Porcentaje'],
['Total','Total','Total'],
['Access requests ({0})','Pedidos de acesso ({0})','Solicitudes de acceso ({0})','Pedidos de acesso ({0})'],
['Stage {0} (Lessons {1} to {2})','Etapa {0} (Lições {1} a {2})','Etapa {0} (Lecciones {1} a {2})','Stage {0} (Lessons {1} a {2})'],
['Save','Salvar','Guardar'],
['(no name)','(sem nome)','(sin nombre)'],
['Released up to Lesson','Liberado até a Lição','Liberado hasta la Lección','Liberado até a Lesson'],
['On the server now: {0} lessons (text), {1} Lesson Checks, {2} exercise sets.','No servidor agora: {0} lições (texto), {1} Lesson Checks, {2} conjuntos de exercícios.','En el servidor ahora: {0} lecciones (texto), {1} Lesson Checks, {2} conjuntos de ejercicios.','No servidor agora: {0} lessons (texto), {1} Lesson Checks, {2} conjuntos de exercícios.'],
['On the server now: {0} audio files.','No servidor agora: {0} arquivos de áudio.','En el servidor ahora: {0} archivos de audio.'],
['Lesson audio','Áudios das lições','Audios de las lecciones','Áudios das lessons'],
['Dictations','Ditados','Dictados'],
['Done: approved students released up to Lesson {0}.','Pronto: alunos aprovados liberados até a Lição {0}.','Listo: alumnos aprobados liberados hasta la Lección {0}.','Pronto: alunos aprovados liberados até a Lesson {0}.'],
['Done: {0} items imported.','Pronto: {0} itens importados.','Listo: {0} elementos importados.'],
['Choose the content.json file.','Escolha o arquivo content.json.','Elige el archivo content.json.'],
['Choose the MP3 files.','Escolha os arquivos MP3.','Elige los archivos MP3.'],
['Uploading\u2026 {0} of {1}','Enviando\u2026 {0} de {1}','Subiendo\u2026 {0} de {1}'],
['Uploading {0} of {1}: {2}','Enviando {0} de {1}: {2}','Subiendo {0} de {1}: {2}'],
['Error: {0}','Erro: {0}','Error: {0}'],
['Error saving: {0}','Erro ao salvar: {0}','Error al guardar: {0}'],
['Error loading: {0}','Erro ao carregar: {0}','Error al cargar: {0}'],
['Exercise','Exercicio','Ejercicio'],
['My history','Meu histórico','Mi historial'],
['Stage {0} \u00b7 Third Edition','Etapa {0} \u00b7 Terceira Edição','Etapa {0} \u00b7 Tercera Edición'],
['Stages {0} to {1} \u00b7 Third Edition','Etapas {0} a {1} \u00b7 Terceira Edição','Etapas {0} a {1} \u00b7 Tercera Edición'],
['Placement test results','Resultados do teste de nível','Resultados de la prueba de nivel'],
['Public link to give to prospective students (no login needed):','Link público para passar a possíveis alunos (sem login):','Enlace público para dar a posibles alumnos (sin iniciar sesión):'],
['Contact','Contato','Contacto'],
['English level','Nível de inglês','Nivel de inglés'],
['Delete','Apagar','Borrar'],
['Confirm?','Confirmar?','¿Confirmar?'],
['No results yet.','Nenhum resultado ainda.','Aún no hay resultados.'],
['Accredited Callan Method school','Escola credenciada pelo Método Callan','Escuela acreditada del Método Callan'],
['Take the free placement test','Faça o teste de nível gratuito','Haz la prueba de nivel gratuita'],
['Take the free placement test','Faça o teste de nível gratuito','Haz la prueba de nivel gratuita'],
['Find your level (A1 to C2) and your Callan Stage','Descubra seu nível (A1 a C2) e sua etapa Callan','Descubre tu nivel (A1 a C2) y tu etapa Callan'],
['Placement test','Teste de nível','Prueba de nivel'],
['Placement test','Teste de nível','Prueba de nivel'],
['Find the best Stage for you. It takes about 10 minutes.','Descubra a melhor etapa para você. Leva cerca de 10 minutos.','Descubre la mejor etapa para ti. Lleva unos 10 minutos.'],
['Answer the questions to find the best Stage for you. Choose "I don\'t know" if you are not sure: do not guess.','Responda às perguntas para descobrir a melhor etapa para você. Escolha "Não sei" se não tiver certeza: não chute.','Responde las preguntas para descubrir la mejor etapa para ti. Elige "No lo sé" si no estás seguro: no adivines.'],
['This test is in English. The questions get harder step by step. The test stops when the questions become too difficult for you.','Este teste é em inglês. As perguntas ficam mais difíceis aos poucos. O teste termina quando as perguntas ficarem difíceis demais para você.','Esta prueba es en inglés. Las preguntas se vuelven más difíciles poco a poco. La prueba termina cuando las preguntas sean demasiado difíciles para ti.'],
['Your name and contact are saved only so that your teacher can talk to you about your level.','Seu nome e contato são guardados só para que seu professor possa conversar com você sobre o seu nível.','Tu nombre y contacto se guardan solo para que tu profesor pueda hablar contigo sobre tu nivel.'],
['WhatsApp or e-mail','WhatsApp ou e-mail','WhatsApp o correo electrónico'],
['Start the test','Começar o teste','Empezar la prueba'],
['Question {0}','Pergunta {0}','Pregunta {0}'],
['Listen','Ouvir','Escuchar'],
['\u25B6 Listen','\u25B6 Ouvir','\u25B6 Escuchar'],
['\u25B6 Slowly','\u25B6 Devagar','\u25B6 Despacio'],
["I don't know",'Não sei','No lo sé'],
['Next','Próxima','Siguiente'],
['Your result','Seu resultado','Tu resultado'],
['Your English level (approximate):','Seu nível de inglês (aproximado):','Tu nivel de inglés (aproximado):'],
['Suggested Stage:','Etapa sugerida:','Etapa sugerida:'],
['Suggested Callan Stage:','Etapa Callan sugerida:','Etapa Callan sugerida:'],
['Lessons {0} to {1}','Lições {0} a {1}','Lecciones {0} a {1}'],
['Score: {0}','Pontuação: {0}','Puntuación: {0}'],
['Your teacher, Paulo S. Cruz, will confirm your level. Talk to him to start your classes.','Seu professor, Paulo S. Cruz, vai confirmar o seu nível. Fale com ele para começar as aulas.','Tu profesor, Paulo S. Cruz, confirmará tu nivel. Habla con él para empezar las clases.'],
['Type your WhatsApp or e-mail.','Digite seu WhatsApp ou e-mail.','Escribe tu WhatsApp o correo electrónico.'],
['Choose an answer.','Escolha uma resposta.','Elige una respuesta.'],
['Your result was sent to your teacher.','Seu resultado foi enviado ao seu professor.','Tu resultado fue enviado a tu profesor.'],
['Your result could not be sent to your teacher. Take a screenshot of this page and send it to him.','Não foi possível enviar seu resultado ao professor. Tire uma captura de tela desta página e envie a ele.','No se pudo enviar tu resultado al profesor. Haz una captura de pantalla de esta página y envíasela.'],
['Choose the language you want to be tested in.','Escolha o idioma em que quer ser testado.','Elige el idioma en el que quieres hacer la prueba.'],
['Change language','Trocar de idioma','Cambiar de idioma'],
['Answer the questions to find the best level for you. Choose "I don\'t know" if you are not sure: do not guess.','Responda às perguntas para descobrir o melhor nível para você. Escolha "Não sei" se não tiver certeza: não chute.','Responde a las preguntas para descubrir el mejor nivel para ti. Elige "No lo sé" si no estás seguro: no adivines.'],
['This test is in {0}. The questions get harder step by step. The test stops when the questions become too difficult for you.','Este teste é em {0}. As perguntas ficam mais difíceis aos poucos. O teste termina quando as perguntas ficarem difíceis demais para você.','Esta prueba es en {0}. Las preguntas se hacen más difíciles poco a poco. La prueba termina cuando las preguntas sean demasiado difíciles para ti.'],
['Your {0} level (approximate):','Seu nível de {0} (aproximado):','Tu nivel de {0} (aproximado):'],
['Stage {0}','Etapa {0}','Etapa {0}'],
['Talk to Teacher Paulo to start at {0}.','Fale com o professor Paulo para começar na {0}.','Habla con el profesor Paulo para empezar en la {0}.'],
['Talk to Teacher Paulo to start your classes.','Fale com o professor Paulo para começar suas aulas.','Habla con el profesor Paulo para empezar tus clases.'],
['Your teacher, Paulo S. Cruz, will confirm your level.','Seu professor, Paulo S. Cruz, vai confirmar o seu nível.','Tu profesor, Paulo S. Cruz, confirmará tu nivel.'],
['Find your level. It takes about 10 minutes.','Descubra o seu nível. Leva cerca de 10 minutos.','Descubre tu nivel. Lleva unos 10 minutos.'],
['Congratulations! 🎉 You finished the test and you already have a base to build on. The hardest part is starting, and you have started.','Parabéns! 🎉 Você terminou o teste e já tem uma base para construir. O mais difícil é começar, e você começou.','¡Felicidades! 🎉 Terminaste la prueba y ya tienes una base sobre la que construir. Lo más difícil es empezar, y ya empezaste.'],
['Well done! 👏 You already communicate in everyday situations and have a good base. With a little guided practice, your fluency will grow fast.','Muito bem! 👏 Você já se comunica em situações do dia a dia e tem uma boa base. Com um pouco de prática orientada, sua fluência vai crescer rápido.','¡Muy bien! 👏 Ya te comunicas en situaciones cotidianas y tienes una buena base. Con un poco de práctica guiada, tu fluidez crecerá rápido.'],
['Excellent result! 🌟 You understand and express yourself with confidence. The next step is gaining precision and naturalness.','Excelente resultado! 🌟 Você entende e se expressa com confiança. O próximo passo é ganhar precisão e naturalidade.','¡Excelente resultado! 🌟 Entiendes y te expresas con confianza. El siguiente paso es ganar precisión y naturalidad.'],
['Impressive! 🏆 You have a very solid command of the language. Now the work is refining the details and getting closer to native speech.','Impressionante! 🏆 Você tem um domínio muito sólido do idioma. Agora o trabalho é refinar os detalhes e se aproximar da fala nativa.','¡Impresionante! 🏆 Tienes un dominio muy sólido del idioma. Ahora el trabajo es pulir los detalles y acercarte al habla nativa.'],
['Choose the Stage to load','Escolha a etapa para carregar','Elige la etapa que quieres cargar'],
['Only this Stage is downloaded, to save data.','Só esta etapa é baixada, para economizar dados.','Solo se descarga esta etapa, para ahorrar datos.'],
['Complete Lesson {0} Check to unlock Lesson {1} Check.','Complete o Lesson Check da Lição {0} para liberar o da Lição {1}.','Completa el Lesson Check de la Lección {0} para desbloquear el de la Lección {1}.']
];
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
var MAP={},TPL=[];
function add(entry){
  var i;
  for(i=0;i<entry.length;i++){
    var s=entry[i];
    if(s.indexOf('{0}')>=0){
      var re=new RegExp('^'+esc(s).replace(/\\\{(\d)\\\}/g,'(.+?)')+'$');
      TPL.push({re:re,entry:entry});
    }else if(!MAP.hasOwnProperty(s))MAP[s]=entry;
  }
}
D.forEach(add);
TPL.sort(function(a,b){return b.re.source.length-a.re.source.length;});
/* Portuguese wording already present in the admin page */
function alias(pt,en){var e=MAP[en];if(e&&!MAP.hasOwnProperty(pt))MAP[pt]=e;}
alias('Alunos e liberação das lessons','Students and lesson release');
alias('Liberar até a Lesson','Release up to Lesson');
alias('Liberar até a Lesson ','Release up to Lesson');
alias('"Liberado até" é o número da última Lesson que o aluno pode abrir (0 a 206). Vale para texto, áudio, Lesson Checks e exercícios.','"Released up to" is the number of the last Lesson the student can open (0 to 206). It applies to text, audio, Lesson Checks and exercises.');
alias('Bloquear fecha o acesso na hora (o áudio já aberto pode tocar por até 2 horas). Para apagar uma conta de vez: Supabase, Authentication, Users, Delete.','Block closes access immediately (audio already opened may play for up to 2 hours). To delete an account for good: Supabase, Authentication, Users, Delete.');
alias('Escolha o Stage para ver as lessons dele. Cada célula mostra a melhor nota do aluno na lesson (pontos / total). Verde: 80% ou mais. Amarelo: 50% a 79%. Vermelho: abaixo de 50%.','Choose the Stage to see its lessons. Each cell shows the student’s best score in the lesson (points / total). Green: 80% or more. Yellow: 50% to 79%. Red: below 50%.');
alias('Conteúdo (texto, checks e exercícios)','Content (text, checks and exercises)');
alias('Importar de novo substitui o conteúdo existente com o mesmo número de lesson.','Importing again replaces the existing content with the same lesson number.');
alias('Escolha vários arquivos de uma vez (Ctrl+A na pasta). Os nomes devem ser como já estão:','Choose several files at once (Ctrl+A in the folder). The names must stay as they are:');
alias('Painel do professor','Teacher panel');

var lang='en';
function detect(){
  var s=null;try{s=localStorage.getItem(KEY);}catch(e){}
  if(s==='en'||s==='pt'||s==='es')return s;
  return 'en';
}
var IDX={en:0,pt:1,es:2};
function tr(s){
  if(!s)return s;
  var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s),core=m[2];
  if(!core)return s;
  var e=MAP.hasOwnProperty(core)?MAP[core]:null,out=null;
  if(e)out=e[IDX[lang]];
  else{
    for(var i=0;i<TPL.length;i++){
      var r=TPL[i].re.exec(core);
      if(r){out=TPL[i].entry[IDX[lang]].replace(/\{(\d)\}/g,function(_,n){return r[+n+1]!==undefined?r[+n+1]:'';});break;}
    }
  }
  return out===null?s:m[1]+out+m[3];
}
function skip(n){
  var p=n.nodeType===1?n:n.parentNode;
  while(p&&p.nodeType===1){
    var t=p.tagName;
    if(t==='SCRIPT'||t==='STYLE'||t==='SVG'||t==='svg'||t==='TEXTAREA'||p.id==='panels'||p.id==='out'||p.hasAttribute('data-noi18n'))return true;
    p=p.parentNode;
  }
  return false;
}
var ATTRS=['aria-label','title','placeholder'];
function doEl(e){
  var i,a,v,t;
  if(e.nodeType!==1)return;
  for(i=0;i<ATTRS.length;i++){a=ATTRS[i];v=e.getAttribute(a);if(v){t=tr(v);if(t!==v)e.setAttribute(a,t);}}
}
function walk(root){
  if(!root||skip(root))return;
  if(root.nodeType===3){var v=root.data,t=tr(v);if(t!==v)root.data=t;return;}
  if(root.nodeType!==1)return;
  doEl(root);
  var c=root.firstChild;
  while(c){
    if(c.nodeType===3){var v2=c.data,t2=tr(v2);if(t2!==v2)c.data=t2;}
    else if(c.nodeType===1&&!skip(c))walk(c);
    c=c.nextSibling;
  }
}
function doTitle(){var t=document.title,n=tr(t);if(n!==t)document.title=n;}
var obs=null,pend=false,queue=[];
function flush(){
  pend=false;var q=queue;queue=[];
  q.forEach(function(n){if(n.isConnected!==false)walk(n);});
  doTitle();
}
function onMut(list){
  list.forEach(function(m){
    if(m.type==='childList')m.addedNodes.forEach(function(n){queue.push(n);});
    else if(m.type==='characterData')queue.push(m.target);
    else if(m.type==='attributes')queue.push(m.target);
  });
  if(!pend){pend=true;(window.requestAnimationFrame||setTimeout)(flush);}
}
function apply(){
  document.documentElement.setAttribute('lang',lang==='pt'?'pt-BR':lang);
  walk(document.body);doTitle();
}
function setLang(l){
  if(!IDX.hasOwnProperty(l))return;
  lang=l;try{localStorage.setItem(KEY,l);}catch(e){}
  apply();
  var bs=document.querySelectorAll('.lang-sel .lang-btn');
  for(var i=0;i<bs.length;i++)bs[i].setAttribute('aria-pressed',bs[i].getAttribute('data-l')===l?'true':'false');
  try{window.dispatchEvent(new CustomEvent('langchange',{detail:l}));}catch(e){}
}
function defLang(l){
  var s=null;try{s=localStorage.getItem(KEY);}catch(e){}
  if(s==='en'||s==='pt'||s==='es'||!IDX.hasOwnProperty(l)||l===lang)return;
  lang=l;apply();
  var bs=document.querySelectorAll('.lang-sel .lang-btn');
  for(var k=0;k<bs.length;k++)bs[k].setAttribute('aria-pressed',bs[k].getAttribute('data-l')===l?'true':'false');
  try{window.dispatchEvent(new CustomEvent('langchange',{detail:l}));}catch(e){}
}
var FL={
 gb:'<rect width="36" height="24" fill="#012169"/><path d="M0 0L36 24M36 0L0 24" stroke="#fff" stroke-width="4.5"/><path d="M0 0L36 24M36 0L0 24" stroke="#C8102E" stroke-width="2"/><path d="M18 0V24M0 12H36" stroke="#fff" stroke-width="8"/><path d="M18 0V24M0 12H36" stroke="#C8102E" stroke-width="4.8"/>',
 us:'<rect width="36" height="24" fill="#fff"/><g fill="#B22234"><rect y="0" width="36" height="1.85"/><rect y="3.7" width="36" height="1.85"/><rect y="7.4" width="36" height="1.85"/><rect y="11.1" width="36" height="1.85"/><rect y="14.8" width="36" height="1.85"/><rect y="18.5" width="36" height="1.85"/><rect y="22.15" width="36" height="1.85"/></g><rect width="14.4" height="12.9" fill="#3C3B6E"/>',
 br:'<rect width="36" height="24" fill="#009B3A"/><path d="M18 2.5L33 12L18 21.5L3 12Z" fill="#FEDF00"/><circle cx="18" cy="12" r="5.4" fill="#002776"/>',
 pt:'<rect width="36" height="24" fill="#FF0000"/><rect width="14.4" height="24" fill="#006600"/><circle cx="14.4" cy="12" r="5" fill="#FFCC00"/><circle cx="14.4" cy="12" r="3" fill="#FF0000"/><circle cx="14.4" cy="12" r="1.5" fill="#fff"/>',
 es:'<rect width="36" height="24" fill="#AA151B"/><rect y="6" width="36" height="12" fill="#F1BF00"/>',
 mx:'<rect width="36" height="24" fill="#fff"/><rect width="12" height="24" fill="#006847"/><rect x="24" width="12" height="24" fill="#CE1126"/><circle cx="18" cy="12" r="3.6" fill="#8C6B2F"/><circle cx="18" cy="12" r="2" fill="#006847"/>'
};
var PAIR={en:['gb','us',6,0],pt:['br','pt',6,8],es:['es','mx',6,9]};
function flagSVG(l,id){
  var P=PAIR[l];
  return '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false"><defs><clipPath id="c'+id+'"><circle cx="12" cy="12" r="11"/></clipPath><clipPath id="L'+id+'"><rect x="0" y="0" width="12" height="24"/></clipPath><clipPath id="R'+id+'"><rect x="12" y="0" width="12" height="24"/></clipPath></defs>'+
   '<g clip-path="url(#c'+id+')"><g clip-path="url(#L'+id+')"><g transform="translate(-'+P[2]+' 0)">'+FL[P[0]]+'</g></g><g clip-path="url(#R'+id+')"><g transform="translate('+(12-P[3])+' 0)">'+FL[P[1]]+'</g></g></g>'+
   '<line x1="12" y1="1" x2="12" y2="23" stroke="rgba(255,255,255,.85)" stroke-width=".6"/><circle cx="12" cy="12" r="11" fill="none" stroke="rgba(128,128,128,.8)" stroke-width="1"/></svg>';
}
var FLAGN=0;
function selector(){
  var g=document.createElement('div');
  g.className='lang-sel';g.setAttribute('role','group');g.setAttribute('aria-label','Language');g.setAttribute('data-noi18n','1');
  LANGS.forEach(function(x){
    var b=document.createElement('button');b.type='button';b.className='lang-btn';b.setAttribute('data-l',x[0]);
    b.setAttribute('aria-label',x[1]);b.title=x[1];b.setAttribute('aria-pressed',x[0]===lang?'true':'false');
    b.innerHTML=flagSVG(x[0],++FLAGN);
    b.addEventListener('click',function(){setLang(x[0]);});
    g.appendChild(b);
  });
  return g;
}
var css=document.createElement('style');
css.textContent='.lang-sel{display:inline-flex;gap:8px;align-items:center}'+
 '.lang-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:2px solid var(--line,#b8b8b8);border-radius:50%;background:var(--surface,var(--bg,#fff));cursor:pointer}'+
 '.lang-btn[aria-pressed="true"]{border-color:var(--accent,#111);box-shadow:0 0 0 2px var(--accent,#111)}'+
 '.lang-btn:not([aria-pressed="true"]){opacity:.9}.lang-btn:hover{opacity:1}'+
 '.lang-btn:focus-visible{outline:3px solid var(--accent,#111);outline-offset:2px}'+
 '.g-langrow{display:flex;justify-content:flex-end;margin:0 0 6px}';
document.head.appendChild(css);
lang=detect();
function start(){
  apply();
  obs=new MutationObserver(onMut);
  obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
window.I18N={def:defLang,t:tr,selector:selector,set:setLang,get lang(){return lang;}};
})();
