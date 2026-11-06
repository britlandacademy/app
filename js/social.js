/* Britland: aba "Redes sociais" do painel do professor.
   Gera imagens (feed, story, reels, WhatsApp) e legendas por ocasião. Só o professor usa.
   Tudo roda no navegador (canvas). Fontes do Brandbook (Noto Serif + Montserrat) carregadas só ao abrir a aba.
   API: SocialTab.mount(box,{sb,el,profiles:()=>[...]}) */
(function () {
  'use strict';
  var JS = (document.currentScript && document.currentScript.src) || '';
  var BASE = JS ? JS.replace(/js\/[^\/]*$/, '') : '';
  var ES_APP = /\/espanol\//.test(location.pathname);
  var C = { navy: '#0B1733', royal: '#10224A', gold: '#C9A13B', gl: '#E4C06A', red: '#B3202A', coral: '#EC4654', cream: '#FAF8F3', sand: '#EFE9D9', ink: '#17202F', grey: '#5A6577', mist: '#F2F5FA', dust: '#B4BFD6', gt: '#16356f', gb: '#0a1530', bl: '#2b4a8c' };
  var C_EN = Object.assign({}, C), C_ES = { navy: '#3A0A10', royal: '#561318', gold: '#F1BF00', gl: '#FFD43B', red: '#AA151B', coral: '#FF5C5F', cream: '#FFFBF0', sand: '#F8EBC4', ink: '#2A1215', grey: '#6B5A55', mist: '#FFF6DD', dust: '#E6C9A6', gt: '#7A141B', gb: '#2E060B', bl: '#9A3B2E' };
  var SERIF = '"Noto Serif",Georgia,serif', SANS = 'Montserrat,Arial,sans-serif';

  /* ---------- datas ---------- */
  function easter(y) { var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
  function nth(y, mo, dow, n) { var d = new Date(y, mo, 1); while (d.getDay() !== dow) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + 7 * (n - 1)); return d; }
  function fx(m, d) { return function (y) { return new Date(y, m - 1, d); }; }
  function addD(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

  /* Feriados e datas. c: en, es ou both. p: tipo de efeito (igual aos efeitos do app). */
  var HOL = [
    { id: 'natal', n: 'Natal', c: 'both', f: fx(12, 25), p: 'snow', col: ['#fff', '#dfefff', C.gl], en: ['Merry Christmas!', 'Feliz Natal!', 'Mande um “Merry Christmas” em inglês para alguém hoje. Vale ouvir de volta.'], es: ['¡Feliz Navidad!', 'Feliz Natal!', 'Que tal desejar “¡Feliz Navidad!” em espanhol para alguém hoje?'] },
    { id: 'anonovo', n: 'Ano Novo', c: 'both', f: fx(1, 1), p: 'stars', col: [C.gl, '#fff', C.gold], en: ['Happy New Year!', 'Feliz Ano Novo!', 'Que este ano venha cheio de conquistas, e de inglês.'], es: ['¡Feliz Año Nuevo!', 'Feliz Ano Novo!', 'Que este ano venha cheio de conquistas, e de espanhol.'] },
    { id: 'reis', n: 'Dia de Reis', c: 'es', f: fx(1, 6), p: 'stars', col: [C.gl, '#fff', C.gold], es: ['¡Feliz Día de Reyes!', 'Feliz Dia de Reis!', 'Em países de língua espanhola, 6 de janeiro é dia de presentes e de rosca de Reyes.'] },
    { id: 'valentines', n: "Valentine's Day", c: 'en', f: fx(2, 14), p: 'dots', col: [C.coral, '#ffb3c6', C.gl], en: ["Happy Valentine's Day!", 'Feliz Dia dos Namorados! (14/2, nos países de língua inglesa)', 'Em inglês, “sweetheart” é um jeito carinhoso de chamar quem a gente ama.'] },
    { id: 'carnaval', n: 'Carnaval', c: 'both', f: function (y) { return addD(easter(y), -47); }, p: 'confetti', col: [C.gl, C.coral, '#6FA8FF', '#3DB37A'], en: ['Happy Carnival!', 'Feliz Carnaval!', 'Carnaval em inglês é “Carnival”. Bom descanso e boa folia.'], es: ['¡Feliz Carnaval!', 'Feliz Carnaval!', 'Em espanhol é quase igual: “Carnaval”. Bom descanso e boa folia.'] },
    { id: 'stpatrick', n: "St Patrick's Day", c: 'en', f: fx(3, 17), p: 'leaf', col: ['#3DB37A', '#7be0a4', C.gl], en: ["Happy St. Patrick's Day!", 'Feliz Dia de São Patrício!', 'Celebrado em 17 de março, é a grande festa da Irlanda, toda de verde.'] },
    { id: 'pascoa', n: 'Páscoa', c: 'both', f: easter, p: 'dots', col: ['#ffb3c6', '#b8e0ff', '#fff3a3', '#c8f0c8'], en: ['Happy Easter!', 'Feliz Páscoa!', 'Easter egg = ovo de Páscoa. E “egg hunt” é a caça aos ovos.'], es: ['¡Felices Pascuas!', 'Feliz Páscoa!', 'Em espanhol, Páscoa é “Pascua” e ovo é “huevo”.'] },
    { id: 'idioma', n: 'Dia do Idioma (23/4)', c: 'both', f: fx(4, 23), p: 'stars', col: [C.gl, '#fff'], en: ['Happy English Language Day!', 'Feliz Dia do Idioma Inglês!', 'A ONU celebra o Dia da Língua Inglesa em 23 de abril. Que tal falar um pouco hoje?'], es: ['¡Feliz Día del Idioma Español!', 'Feliz Dia do Idioma Espanhol!', 'A ONU celebra o Dia da Língua Espanhola em 23 de abril. Que tal falar um pouco hoje?'] },
    { id: 'july4', n: '4 de Julho (EUA)', c: 'en', f: fx(7, 4), p: 'stars', col: ['#6FA8FF', '#fff', C.coral], en: ['Happy Fourth of July!', 'Feliz 4 de Julho!', 'É o Dia da Independência dos Estados Unidos.'] },
    { id: 'independencia', n: 'Independência do Brasil', c: 'both', f: fx(9, 7), p: 'confetti', col: ['#3DB37A', C.gl, '#fff', '#6FA8FF'], en: ["Brazil's Independence Day", 'Dia da Independência do Brasil, 7 de setembro', 'Em inglês: “independence” é independência. Feliz feriado!'], es: ['Día de la Independencia de Brasil', 'Dia da Independência do Brasil, 7 de setembro', 'Em espanhol: “independencia”. Feliz feriado!'] },
    { id: 'mexico', n: 'Independência do México', c: 'es', f: fx(9, 16), p: 'confetti', col: ['#3DB37A', '#fff', C.coral], es: ['¡Viva México!', 'Dia da Independência do México, 16 de setembro', 'Em 16 de setembro o México celebra sua independência.'] },
    { id: 'chile', n: 'Fiestas Patrias (Chile)', c: 'es', f: fx(9, 18), p: 'confetti', col: ['#2d6be0', '#fff', C.coral], es: ['¡Felices Fiestas Patrias!', 'Felizes Festas Pátrias!', 'Em 18 de setembro o Chile celebra sua independência.'] },
    { id: 'professor', n: 'Dia do Professor', c: 'both', f: fx(10, 15), p: 'stars', col: [C.gl, C.gold, '#fff'], en: ["Happy Teachers' Day!", 'Feliz Dia do Professor!', 'Um obrigado a quem ensina com paciência, e a quem ainda vai ensinar.'], es: ['¡Feliz Día del Profesor!', 'Feliz Dia do Professor!', 'Um obrigado a quem ensina com paciência, e a quem ainda vai ensinar.'] },
    { id: 'halloween', n: 'Halloween', c: 'en', f: fx(10, 31), p: 'dots', col: ['#B26BFF', '#ff9f1c', '#8a4fd6'], en: ['Happy Halloween!', 'Feliz Halloween!', '“Trick or treat?” quer dizer “doces ou travessuras?”.'] },
    { id: 'muertos', n: 'Día de Muertos', c: 'es', f: fx(11, 2), p: 'leaf', col: ['#ff9f1c', C.gl, '#ffb347'], es: ['Día de Muertos', 'Dia de Finados no México', 'Em 1 e 2 de novembro, o México homenageia quem já partiu, com altares, velas e flores de cempasúchil.'] },
    { id: 'thanksgiving', n: 'Thanksgiving', c: 'en', f: function (y) { return nth(y, 10, 4, 4); }, p: 'leaf', col: ['#d9631e', '#b3341f', C.gl], en: ['Happy Thanksgiving!', 'Feliz Dia de Ação de Graças!', 'Nos EUA, é celebrado na quarta quinta-feira de novembro. Em inglês: “I’m thankful for…”.'] },
    { id: 'navidad', n: 'Natal (espanhol)', c: 'es', f: fx(12, 25), p: 'snow', col: ['#fff', '#dfefff', C.gl], es: ['¡Feliz Navidad!', 'Feliz Natal!', 'Que tal desejar “¡Feliz Navidad!” em espanhol para alguém hoje?'], hide: 1 }
  ];

  /* ---------- bancos de conteúdo ---------- */
  var DICA = {
    en: [
      { t1: 'Falar inglês começa com', t2: 'uma frase.', big: 'Nice to meet you.', small: 'Prazer em conhecer você.', body: 'Diga em voz alta, três vezes. Sim, agora. A gente espera.' },
      { t1: 'Em inglês, a idade', t2: 'usa o verbo “ser”.', big: 'I am 20 years old.', small: 'Eu tenho 20 anos.', body: 'Nada de “I have 20 years”. Em inglês, a gente “é” velho de 20 anos.' },
      { t1: 'Não é “I am agree”.', t2: 'É só “agree”.', big: 'I agree with you.', small: 'Eu concordo com você.', body: '“Agree” já é verbo. Não precisa de “am” antes dele.' },
      { t1: '“Actually” não é', t2: '“atualmente”.', big: 'Actually, I disagree.', small: 'Na verdade, eu discordo.', body: '“Atualmente” em inglês é “currently”.' },
      { t1: 'Como cumprimentar', t2: 'como um nativo.', big: 'How’s it going?', small: 'Como vão as coisas?', body: 'Resposta curta: “Pretty good, and you?”.' },
      { t1: '“Thank you” tem', t2: 'mais de um jeito.', big: 'Thanks a lot!', small: 'Muito obrigado!', body: 'Mais formal: “I really appreciate it.”.' },
      { t1: 'Para pedir algo', t2: 'com educação.', big: 'Could you help me, please?', small: 'Você poderia me ajudar, por favor?', body: '“Could” soa mais gentil do que “can”.' },
      { t1: '“Make” ou', t2: '“do”?', big: 'make a decision · do homework', small: 'tomar uma decisão · fazer a lição de casa', body: 'Regra prática: “make” cria algo; “do” é tarefa ou ação.' }
    ],
    es: [
      { t1: 'Falar espanhol começa com', t2: 'uma frase.', big: 'Mucho gusto.', small: 'Muito prazer.', body: 'Diga em voz alta, três vezes. Sim, agora. A gente espera.' },
      { t1: 'Cuidado com', t2: '“embarazada”.', big: 'Estoy embarazada.', small: 'Estou grávida.', body: '“Embaraçada” (envergonhada) em espanhol é “avergonzada”.' },
      { t1: '“Exquisito” não é', t2: '“esquisito”.', big: '¡Qué exquisito!', small: 'Que delícia!', body: 'Falso amigo clássico: “exquisito” é delicioso ou requintado.' },
      { t1: 'Para perguntar', t2: 'como a pessoa está.', big: '¿Cómo estás?', small: 'Como você está?', body: 'Mais formal: “¿Cómo está usted?”.' },
      { t1: 'Para pedir algo', t2: 'com educação.', big: '¿Me puede ayudar, por favor?', small: 'Você pode me ajudar, por favor?', body: '“Por favor” abre portas, em qualquer idioma.' },
      { t1: 'Agradecer', t2: 'com mais força.', big: 'Muchas gracias.', small: 'Muito obrigado(a).', body: 'Para responder: “De nada” ou “No hay de qué”.' },
      { t1: '“Ser” ou', t2: '“estar”?', big: 'Soy profesor · Estoy cansado', small: 'Eu sou professor · Estou cansado', body: '“Ser” é identidade. “Estar” é estado ou lugar.' },
      { t1: 'A idade em espanhol', t2: 'usa “tener”.', big: 'Tengo veinte años.', small: 'Eu tenho vinte anos.', body: 'Aqui o verbo é “tener”, igual ao “ter” do português.' }
    ]
  };
  var PALAVRA = {
    en: [['borrow', 'pegar emprestado', 'Can I borrow your pen?', 'Posso pegar sua caneta emprestada?'], ['grateful', 'grato, agradecido', 'I am grateful for your help.', 'Sou grato pela sua ajuda.'], ['improve', 'melhorar', 'I want to improve my English.', 'Quero melhorar meu inglês.'], ['journey', 'jornada, viagem', 'Learning a language is a journey.', 'Aprender um idioma é uma jornada.'], ['achieve', 'alcançar, conquistar', 'You can achieve your goals.', 'Você pode alcançar seus objetivos.'], ['challenge', 'desafio', 'This is a fun challenge.', 'Este é um desafio divertido.'], ['enough', 'suficiente, já chega', 'That’s enough for today.', 'Por hoje é o suficiente.'], ['proud', 'orgulhoso', 'I am proud of you.', 'Tenho orgulho de você.']],
    es: [['ojalá', 'tomara, oxalá', 'Ojalá puedas venir.', 'Tomara que você possa vir.'], ['estrenar', 'usar ou estrear algo novo', 'Hoy estreno zapatos.', 'Hoje estou estreando sapatos.'], ['madrugar', 'acordar bem cedo', 'Mañana tengo que madrugar.', 'Amanhã preciso acordar bem cedo.'], ['aprovechar', 'aproveitar', 'Hay que aprovechar el día.', 'Temos que aproveitar o dia.'], ['cariño', 'carinho, querido(a)', 'Gracias, cariño.', 'Obrigado, querido.'], ['tarea', 'tarefa, lição de casa', 'Hice toda la tarea.', 'Fiz toda a lição de casa.'], ['sobremesa', 'sobremesa; conversa à mesa depois de comer', 'La sobremesa fue larga.', 'A conversa depois da refeição foi longa.'], ['mañana', 'amanhã; manhã', 'Nos vemos mañana.', 'A gente se vê amanhã.']]
  };
  /* curiosidades: título e dois cartões comparando. [rótulo, palavra, tradução] */
  var CURIO = {
    en: [
      { k: 'UK × EUA', t1: 'O que é', t2: '“biscuit”?', cmp: [['Reino Unido', 'biscuit', 'bolacha'], ['Estados Unidos', 'biscuit', 'pãozinho macio, com molho']], body: 'A mesma palavra, dois mundos. Qual você conhecia?' },
      { k: 'UK × EUA', t1: 'E “chips”,', t2: 'o que são?', cmp: [['Reino Unido', 'chips', 'batata frita'], ['Estados Unidos', 'chips', 'batata chips de pacote']], body: 'No Reino Unido, a chips americana é “crisps”.' },
      { k: 'UK × EUA', t1: '“Football” é', t2: 'futebol?', cmp: [['Reino Unido', 'football', 'futebol'], ['Estados Unidos', 'football', 'futebol americano']], body: 'Nos EUA, o nosso futebol é “soccer”.' },
      { k: 'UK × EUA', t1: 'Cuidado com', t2: '“pants”.', cmp: [['Reino Unido', 'pants', 'cueca'], ['Estados Unidos', 'pants', 'calça']], body: 'No Reino Unido, calça é “trousers”.' },
      { k: 'UK × EUA', t1: 'Onde fica o', t2: '“boot”?', cmp: [['Reino Unido', 'boot', 'porta-malas'], ['Estados Unidos', 'trunk', 'porta-malas']], body: 'Mesma peça do carro, palavras diferentes.' },
      { k: 'UK × EUA', t1: 'Calçada em', t2: 'dois sotaques.', cmp: [['Reino Unido', 'pavement', 'calçada'], ['Estados Unidos', 'sidewalk', 'calçada']], body: 'Nos EUA, “pavement” é o pavimento da rua.' },
      { k: 'Falso amigo', t1: '“Pretend” não é', t2: '“pretender”.', cmp: [['Em inglês', 'pretend', 'fingir'], ['Para “pretender”', 'intend', 'ter a intenção de']], body: '“I pretend to be a pirate.” = Eu finjo ser um pirata.' },
      { k: 'Falso amigo', t1: '“Library” não é', t2: '“livraria”.', cmp: [['Em inglês', 'library', 'biblioteca'], ['Livraria', 'bookstore', 'livraria']], body: 'Entrar na “library” e sair sem comprar nada é normal.' },
      { k: 'Falso amigo', t1: '“Parents” não são', t2: '“parentes”.', cmp: [['Em inglês', 'parents', 'pais (pai e mãe)'], ['Parentes', 'relatives', 'parentes']], body: 'Um jeito fácil de nunca mais errar.' },
      { k: 'Choque cultural', t1: 'Gorjeta nos EUA:', t2: 'é esperada.', cmp: [['Em restaurantes', 'tip', 'gorjeta'], ['Em geral', '15 a 20%', 'da conta']], body: 'Em muitos restaurantes dos EUA, a gorjeta faz parte do salário de quem atende.' }
    ],
    es: [
      { k: 'Espanha × América', t1: 'Como é', t2: '“abacate”?', cmp: [['Espanha, México', 'aguacate', 'abacate'], ['Chile, Peru, Argentina', 'palta', 'abacate']], body: 'Mesma fruta, dois nomes. Qual você já ouviu?' },
      { k: 'Espanha × América', t1: 'Como dizer', t2: '“computador”?', cmp: [['Espanha', 'ordenador', 'computador'], ['América Latina', 'computadora', 'computador']], body: 'Em alguns países, “el computador”.' },
      { k: 'Gíria regional', t1: 'Como dizem', t2: '“trabalho”?', cmp: [['México', 'chamba', 'trabalho'], ['Argentina', 'laburo', 'trabalho']], body: 'Na Espanha, “currar” é trabalhar.' },
      { k: 'Gíria regional', t1: 'Onde você', t2: 'nada?', cmp: [['Argentina e Uruguai', 'pileta', 'piscina'], ['México', 'alberca', 'piscina']], body: 'Na Espanha, é “piscina”.' },
      { k: 'Gíria regional', t1: '“Guagua” é', t2: 'ônibus ou bebê?', cmp: [['Caribe e Canárias', 'guagua', 'ônibus'], ['Chile e Equador', 'guagua', 'bebê']], body: 'Uma palavra, dois sentidos bem diferentes.' },
      { k: 'Falso amigo', t1: '“Oficina” não é', t2: '“oficina mecânica”.', cmp: [['Em espanhol', 'oficina', 'escritório'], ['Oficina mecânica', 'taller', 'oficina']], body: 'Fácil de confundir ao marcar uma reunião.' },
      { k: 'Falso amigo', t1: '“Vaso” é', t2: 'copo.', cmp: [['Em espanhol', 'vaso', 'copo'], ['Vaso de planta', 'maceta', 'vaso']], body: 'Peça “un vaso de agua”, e não um vaso de flores.' },
      { k: 'Falso amigo', t1: '“Cena” é', t2: 'jantar.', cmp: [['Em espanhol', 'cena', 'jantar'], ['Cena de filme', 'escena', 'cena']], body: 'Convite: “¿Vamos a cenar?”.' },
      { k: 'Choque cultural', t1: 'Jantar na Espanha:', t2: 'bem tarde.', cmp: [['Horário comum', '21h ou 22h', 'jantar'], ['Almoço', '14h ou 15h', 'almoço']], body: 'Quem chega às 19h para jantar pode encontrar o restaurante fechado.' }
    ]
  };
  var DIVULG = {
    exp: { k: 'Aulas online', t1: 'Bora', t2: 'falar?', big: '', small: '', body: 'Aulas 100% online de inglês e espanhol, no seu ritmo e com gente de verdade do outro lado.', cta: 'Peça sua aula experimental' },
    place: { k: 'Teste de nível', t1: 'Descubra o seu', t2: 'nível.', big: '', small: '', body: 'Faça o Placement Test e saiba por onde começar. Sem pressa, sem vergonha.', cta: 'Faça o teste de nível' },
    metodo: { k: 'Nosso jeito de ensinar', t1: 'Falar desde', t2: 'a primeira aula.', big: '', small: '', body: 'Perguntas e respostas curtas, repetição e correção na hora. Você fala o tempo todo.', cta: 'Conheça o método' },
    vagas: { k: 'Vagas abertas', t1: 'Turmas com', t2: 'vagas abertas.', big: '', small: '', body: 'Inglês e espanhol online, com horários que cabem na sua rotina.', cta: 'Fale com a gente' }
  };
  var AVISO = {
    recesso: { t1: 'Aviso:', t2: 'recesso.', body: 'Estaremos em recesso de [data] a [data]. As aulas voltam normalmente em [data]. Bons estudos e bom descanso.' },
    horario: { t1: 'Aviso:', t2: 'mudança de horário.', body: 'Passando para avisar que o horário das aulas de [turma] muda para [novo horário]. Qualquer dúvida, é só chamar.' },
    novidade: { t1: 'Novidade', t2: 'no app.', body: 'O aplicativo da Britland Academy está mais completo. Atualize e confira o que mudou.' }
  };
  var HOOKS = {
    hol: ['Hoje é dia de comemorar, e de treinar um pouquinho.', 'Uma data especial pede uma frase nova.', 'Quer aproveitar a data para aprender algo novo?'],
    dica: ['Uma dica rápida para você levar hoje.', 'Salve este post para treinar depois.', 'Pequena dica, grande diferença.'],
    palavra: ['A palavra de hoje para o seu vocabulário.', 'Palavra nova no ar.', 'Que tal usar esta palavra hoje?'],
    curio: ['Você sabia?', 'Curiosidade do dia.', 'Esta você precisa conhecer.'],
    conq: ['Olha o quanto você já fala!', 'Mais uma etapa vencida.', 'Orgulho de ver essa evolução.'],
    aniv: ['Hoje o dia é de festa.', 'Um dia especial merece um recado especial.'],
    divulg: ['Bora falar de verdade?', 'Sem pressa, sem vergonha.'],
    aviso: ['Passando para avisar.', 'Atenção, pessoal.']
  };
  var TAGS = { en: ['#InglesOnline', '#AprenderIngles'], es: ['#EspanholOnline', '#AprenderEspanhol'] };

  /* ---------- utilitários ---------- */
  function pick(a, i) { return a[i % a.length]; }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function seeded(seed) { var s = seed || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function nextDate(h, from) { var y = from.getFullYear(), d = h.f(y); if (d < new Date(from.getFullYear(), from.getMonth(), from.getDate())) d = h.f(y + 1); return d; }
  function fmtD(d) { var M = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']; return d.getDate() + ' de ' + M[d.getMonth()]; }
  function firstName(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
  function loadFonts() {
    if (document.getElementById('bl-soc-fonts')) return Promise.resolve();
    var l = document.createElement('link'); l.id = 'bl-soc-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,700;1,700&display=swap';
    document.head.appendChild(l);
    var t = [document.fonts.load('700 60px "Noto Serif"'), document.fonts.load('italic 700 60px "Noto Serif"'), document.fonts.load('400 30px Montserrat'), document.fonts.load('600 30px Montserrat'), document.fonts.load('700 30px Montserrat')];
    return Promise.race([Promise.all(t).catch(function () { }), new Promise(function (r) { setTimeout(r, 4000); })]);
  }
  var SHIELD = null, SHIELD_ES = null;
  function loadShield() {
    function ld(f) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = BASE + 'img/' + f; }); }
    return Promise.all([SHIELD ? SHIELD : ld('britland-shield.png'), SHIELD_ES ? SHIELD_ES : ld('britland-shield-es.png')]).then(function (a) { SHIELD = a[0]; SHIELD_ES = a[1]; return SHIELD; });
  }

  /* ---------- desenho ---------- */
  var FORMATS = { feed: { n: 'Feed', w: 1080, h: 1350 }, story: { n: 'Story', w: 1080, h: 1920 }, reels: { n: 'Reels (capa)', w: 1080, h: 1920 }, zap: { n: 'WhatsApp', w: 1080, h: 1080 } };
  var MODELS = { marinho: 'Marinho', creme: 'Creme', festivo: 'Festivo' };
  function theme(m) {
    if (m === 'creme') return { bg: C.cream, kick: C.red, t1: C.ink, t2: C.red, bar: C.gold, box: C.sand, boxL: '#e0d6bd', big: C.ink, small: C.grey, body: C.ink, ctaBg: C.gold, ctaFg: C.ink, hand: C.grey, lk: C.ink, lk2: C.red };
    return { bg: C.navy, kick: C.gl, t1: C.mist, t2: C.gl, bar: C.gold, box: C.royal, boxL: C.bl, big: C.gl, small: C.dust, body: C.mist, ctaBg: C.gold, ctaFg: C.navy, hand: C.dust, lk: C.mist, lk2: C.coral };
  }
  function wrap(ctx, text, maxW) {
    var words = String(text).split(/\s+/), out = [], l = '';
    words.forEach(function (w) { var t = l ? l + ' ' + w : w; if (ctx.measureText(t).width <= maxW || !l) l = t; else { out.push(l); l = w; } });
    if (l) out.push(l); return out;
  }
  function spaced(ctx, text, x, y, sp, center) {
    var w = 0, i; for (i = 0; i < text.length; i++) w += ctx.measureText(text[i]).width + sp; w -= sp;
    var cx = center ? x - w / 2 : x; for (i = 0; i < text.length; i++) { ctx.fillText(text[i], cx, y); cx += ctx.measureText(text[i]).width + sp; }
    return w;
  }
  function particles(ctx, W, H, kind, cols, seed) {
    var r = seeded(seed), n = kind === 'snow' ? 110 : kind === 'confetti' ? 70 : 60;
    for (var i = 0; i < n; i++) {
      var x = r() * W, y = r() * H, s = 4 + r() * 10, c = cols[Math.floor(r() * cols.length)];
      ctx.save(); ctx.globalAlpha = 0.15 + r() * 0.4; ctx.fillStyle = c; ctx.translate(x, y); ctx.rotate(r() * 6.28);
      if (kind === 'confetti') ctx.fillRect(-s, -s / 2, s * 2, s);
      else if (kind === 'leaf') { ctx.beginPath(); ctx.ellipse(0, 0, s * 1.6, s * .8, 0, 0, 6.28); ctx.fill(); }
      else if (kind === 'stars') { ctx.beginPath(); for (var k = 0; k < 10; k++) { var rr = k % 2 ? s * .45 : s * 1.2, a = k * Math.PI / 5; ctx.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr); } ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, 0, s * .6, 0, 6.28); ctx.fill(); }
      ctx.restore();
    }
  }
  function lockup(ctx, xr, y, tc, ac) {
    /* igual ao logotipo do site: escudo à esquerda; BRITLAND em serifa bold; ACADEMY em sans médio, sem espaçamento, alinhado à esquerda sob BRITLAND com ~79% da largura */
    var sz = 56, sw = 96, gap = 22, i;
    ctx.font = '700 ' + sz + 'px ' + SERIF; var w1 = ctx.measureText('BRITLAND').width;
    ctx.font = '500 100px ' + SANS; var f2 = 100 * (w1 * 0.79) / ctx.measureText('ACADEMY').width;
    var SH = (C === C_ES_ACTIVE && SHIELD_ES) ? SHIELD_ES : SHIELD;
    var x0 = xr - (sw + gap + w1), sh = SH ? sw * SH.height / SH.width : 112;
    if (SH) ctx.drawImage(SH, x0, y, sw, sh);
    var tx = x0 + sw + gap, cy = y + sh / 2, cap1 = sz * 0.714, cap2 = f2 * 0.7, g = cap1 * 0.5, top = cy - (cap1 + g + cap2) / 2;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillStyle = tc; ctx.font = '700 ' + sz + 'px ' + SERIF; ctx.fillText('BRITLAND', tx, top + cap1);
    ctx.fillStyle = ac; ctx.font = '500 ' + f2 + 'px ' + SANS; ctx.fillText('ACADEMY', tx, top + cap1 + g + cap2);
    return { x: x0, h: sh };
  }
  var C_ES_ACTIVE = null;
  function draw(cv, fmt, model, ct) {
    var es = ct && ct.lang === 'es', keep = Object.assign({}, C);
    if (es) { Object.assign(C, C_ES); C_ES_ACTIVE = C; } else { Object.assign(C, C_EN); C_ES_ACTIVE = null; }
    try { return draw0(cv, fmt, model, ct); } finally { Object.assign(C, keep); C_ES_ACTIVE = null; }
  }
  function draw0(cv, fmt, model, ct) {
    var F = FORMATS[fmt], W = F.w, H = F.h, ctx = cv.getContext('2d'), T = theme(model === 'festivo' ? 'marinho' : model), M = 90;
    cv.width = W; cv.height = H;
    var tall = H > 1500, topPad = tall ? 210 : 100, botPad = tall ? 250 : 80;
    if (fmt === 'zap') { topPad = 80; botPad = 70; }
    if (model === 'festivo') { var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.gt); g.addColorStop(1, C.gb); ctx.fillStyle = g; } else ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, W, H);
    if (model === 'festivo') {
      var dec = ct.deco || { p: 'stars', col: [C.gl, '#fff', C.gold] };
      particles(ctx, W, H, dec.p, dec.col, hash((ct.t1 || '') + (ct.big || '')));
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.strokeRect(34, 34, W - 68, H - 68);
    }
    var maxW = W - 2 * M, ys = [], y = topPad;
    var fsT = fmt === 'zap' ? 84 : tall ? 104 : 96;
    function titleLines(font, text, fs) { ctx.font = font.replace('#', fs); return wrap(ctx, text, maxW); }
    var f1 = '700 #px ' + SERIF, f2 = 'italic 700 #px ' + SERIF, fs = fsT, l1, l2;
    for (; fs >= 56; fs -= 4) { l1 = ct.t1 ? titleLines(f1, ct.t1, fs) : []; l2 = ct.t2 ? titleLines(f2, ct.t2, fs) : []; if (l1.length + l2.length <= (tall ? 4 : 3)) break; }
    var lh = fs * 1.2;
    // medir altura
    var kickH = ct.k ? 80 : 0, titleH = (l1.length + l2.length) * lh, barH = 60;
    var boxes = ct.cmp ? ct.cmp : (ct.big ? [[ct.kicker2 || '', ct.big, ct.small]] : []);
    ctx.font = '700 64px ' + SERIF;
    function bfs(t) { return t.length > 60 ? 44 : t.length > 34 ? 52 : (ct.cmp ? 66 : 64); }
    var boxHs = boxes.map(function (b) { var f = bfs(b[1]); ctx.font = '700 ' + f + 'px ' + SERIF; var n = wrap(ctx, b[1], maxW - 100).length; ctx.font = '400 32px ' + SANS; var s = b[2] ? wrap(ctx, b[2], maxW - 100).length : 0; return { n: n, s: s, f: f, h: 44 + (b[0] ? 40 : 0) + n * (f * 1.2) + (s ? s * 44 + 10 : 0) }; });
    var boxesH = boxHs.reduce(function (a, b) { return a + b.h + 24; }, 0);
    var bf = fmt === 'zap' ? 36 : 40; ctx.font = '400 ' + bf + 'px ' + SANS; var bl = ct.body ? wrap(ctx, ct.body, maxW) : []; var bodyH = bl.length * bf * 1.45;
    var used = kickH + titleH + barH + boxesH + (bodyH ? bodyH + 30 : 0), footH = 270, avail = H - topPad - botPad - footH;
    if (used > avail) { /* reduz espaçamentos mínimos, nada a fazer além */ }
    var start = topPad + Math.max(0, (avail - used) * (tall ? 0.4 : 0.28)); y = start;
    ctx.textBaseline = 'alphabetic';
    if (ct.k) { ctx.fillStyle = T.kick; ctx.font = '600 30px ' + SANS; spaced(ctx, ct.k.toUpperCase(), M, y + 30, 8, false); y += kickH; }
    ctx.fillStyle = T.t1; ctx.font = f1.replace('#', fs); l1.forEach(function (t) { y += lh; ctx.fillText(t, M, y - lh * .22); });
    ctx.fillStyle = T.t2; ctx.font = f2.replace('#', fs); l2.forEach(function (t) { y += lh; ctx.fillText(t, M, y - lh * .22); });
    y += 26; ctx.fillStyle = T.bar; ctx.fillRect(M, y, 100, 6); y += 34;
    boxes.forEach(function (b, i) {
      var bh = boxHs[i].h; ctx.fillStyle = T.box; rr(ctx, M, y, maxW, bh, 30); ctx.fill(); ctx.strokeStyle = T.boxL; ctx.lineWidth = 3; ctx.stroke();
      var ty = y + 36;
      if (b[0]) { ctx.fillStyle = T.small; ctx.font = '600 26px ' + SANS; spaced(ctx, b[0].toUpperCase(), M + 50, ty + 22, 4, false); ty += 40; }
      ctx.fillStyle = T.big; ctx.font = '700 ' + boxHs[i].f + 'px ' + SERIF;
      wrap(ctx, b[1], maxW - 100).forEach(function (t) { ty += boxHs[i].f * 1.2; ctx.fillText(t, M + 50, ty - boxHs[i].f * .26); });
      if (b[2]) { ctx.fillStyle = T.small; ctx.font = '400 32px ' + SANS; wrap(ctx, b[2], maxW - 100).forEach(function (t, j) { ctx.fillText(t, M + 50, ty + 34 + j * 44); }); }
      y += bh + 24;
    });
    if (bl.length) { y += 6; ctx.fillStyle = T.body; ctx.font = '400 ' + bf + 'px ' + SANS; bl.forEach(function (t) { y += bf * 1.45; ctx.fillText(t, M, y); }); }
    // rodapé: botão (uma linha, dourado como no Brandbook) acima; arroba à esquerda e escudo + nome à direita, na mesma linha
    var rowY = H - botPad - 112;
    if (ct.cta) {
      var cf = 34; ctx.font = '700 ' + cf + 'px ' + SANS; while (ctx.measureText(ct.cta).width + 96 > maxW && cf > 22) { cf -= 2; ctx.font = '700 ' + cf + 'px ' + SANS; }
      var cw = ctx.measureText(ct.cta).width + 96, chh = 84, cyy = rowY - 40 - chh;
      ctx.fillStyle = T.ctaBg; rr(ctx, M, cyy, cw, chh, chh / 2); ctx.fill();
      ctx.fillStyle = T.ctaFg; ctx.textBaseline = 'middle'; ctx.fillText(ct.cta, M + 48, cyy + chh / 2 + 2); ctx.textBaseline = 'alphabetic';
    }
    ctx.fillStyle = T.hand; ctx.font = '400 30px ' + SANS; ctx.textBaseline = 'middle'; ctx.fillText('@britlandacademy', M, rowY + 56); ctx.textBaseline = 'alphabetic';
    lockup(ctx, W - M, rowY, T.lk, T.lk2);
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* ---------- legendas ---------- */
  function captions(S, ct) {
    var lang = S.lang, hk = pick(HOOKS[S.occ] || HOOKS.dica, S.seed), tags = ['#BritlandAcademy'].concat(TAGS[lang].slice(0, 2 + (S.seed % 2)));
    if (S.occ === 'hol' && S.hol) tags.splice(1, 0, '#' + S.hol.id.replace(/[^a-z0-9]/gi, ''));
    var cta = ct.cta ? ct.cta + '.' : 'Quer praticar? Fale com a gente.';
    var head = (ct.t1 ? ct.t1 + ' ' : '') + (ct.t2 || '');
    var big = ct.big ? ct.big + (ct.small ? ' = ' + ct.small : '') : '';
    if (ct.cmp) big = ct.cmp.map(function (b) { return b[0] + ': ' + b[1] + ' (' + b[2] + ')'; }).join('\n');
    var tg = tags.join(' ');
    return {
      curta: [hk, big || head, cta].filter(Boolean).join('\n\n') + '\n\n' + tg,
      media: [hk, head.trim(), big, ct.body, cta].filter(Boolean).join('\n\n') + '\n\n' + tg,
      longa: [hk, head.trim(), big, ct.body, S.occ === 'dica' || S.occ === 'palavra' ? 'Salve este post e pratique em voz alta, três vezes.' : 'Marque alguém que também precisa ver isso.', cta, 'Britland Academy · inglês e espanhol online.'].filter(Boolean).join('\n\n') + '\n\n' + tg
    };
  }

  /* ---------- conteúdo por ocasião ---------- */
  function content(S) { var o = content0(S); o.lang = S.lang; return o; }
  function content0(S) {
    var lang = S.lang, i = S.seed, o = S.occ, k;
    if (o === 'hol') {
      var h = S.hol; if (!h) return { t1: 'Escolha uma', t2: 'data.', body: '' };
      var m = h[lang] || h.en || h.es; var yr = (h.f(new Date().getFullYear()) < new Date() ? new Date().getFullYear() + 1 : new Date().getFullYear());
      var body = m[2]; if (h.id === 'anonovo') body = body.replace('este ano', 'o ano de ' + yr);
      return { k: h.n, t1: m[0].split(' ').slice(0, Math.ceil(m[0].split(' ').length / 2)).join(' '), t2: m[0].split(' ').slice(Math.ceil(m[0].split(' ').length / 2)).join(' '), big: m[1], small: '', body: body, cta: 'Salve para treinar', deco: { p: h.p, col: h.col } };
    }
    if (o === 'dica') { k = pick(DICA[lang], i); return { k: 'Dica rápida · ' + (lang === 'en' ? 'Inglês' : 'Espanhol'), t1: k.t1, t2: k.t2, big: k.big, small: k.small, body: k.body, cta: 'Salve para treinar' }; }
    if (o === 'palavra') { k = pick(PALAVRA[lang], i); return { k: 'Palavra do dia · ' + (lang === 'en' ? 'Inglês' : 'Espanhol'), t1: 'Palavra do dia:', t2: '“' + k[0] + '”', big: k[0], small: k[1], body: k[2] + '\n' + k[3].replace(/^/, '= '), cta: 'Use em uma frase hoje' }; }
    if (o === 'curio') { k = pick(CURIO[lang], i); return { k: k.k, t1: k.t1, t2: k.t2, cmp: k.cmp, body: k.body, cta: 'Compartilhe' }; }
    if (o === 'conq') {
      var nm = S.name || 'Nome', t = S.conq;
      var big = t === 'stage' ? 'Stage ' + (S.num || '1') + ' concluído' : t === 'streak' ? (S.num || '7') + ' dias seguidos' : 'Aluno(a) do mês';
      var sm = t === 'stage' ? 'Mais uma etapa do curso.' : t === 'streak' ? 'Estudando todos os dias.' : 'Dedicação que inspira a turma.';
      return { k: 'Conquista', t1: 'Parabéns,', t2: nm + '!', big: big, small: sm, body: 'Olha o quanto você já fala!', cta: '', };
    }
    if (o === 'aniv') { var n2 = S.name || 'Nome'; return { k: 'Feliz aniversário', t1: 'Parabéns,', t2: n2 + '!', big: lang === 'en' ? 'Happy Birthday!' : '¡Feliz cumpleaños!', small: 'Feliz aniversário!', body: 'Muitas conquistas em ' + (lang === 'en' ? 'inglês' : 'espanhol') + ' e em tudo o que você sonhar.', cta: '', deco: { p: 'dots', col: [C.coral, C.gl, '#6FA8FF', '#3DB37A'] } }; }
    if (o === 'divulg') { var d = DIVULG[S.div]; return { k: d.k, t1: d.t1, t2: d.t2, big: '', small: '', body: d.body, cta: d.cta }; }
    if (o === 'aviso') { var a = AVISO[S.av]; return { k: 'Aviso', t1: a.t1, t2: a.t2, big: '', small: '', body: a.body, cta: '' }; }
    return {};
  }

  /* ---------- interface ---------- */
  var STYLE = '.sc-chip{min-height:38px;padding:4px 14px;border:2px solid var(--line);border-radius:99px;background:var(--surface);color:var(--ink);font:inherit;font-weight:600;cursor:pointer}.sc-chip.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}.sc-h{font-size:1rem;margin:14px 0 6px}.sc-cv{max-width:300px;width:100%;height:auto;border:1px solid var(--line);border-radius:8px;display:block}.sc-grid{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}.sc-cap{width:100%;min-height:210px;font:inherit;font-size:15px;padding:8px;border:2px solid var(--line);border-radius:3px;background:var(--surface);color:var(--ink)}.sc-next{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}.sc-ed input,.sc-ed textarea{width:100%;font:inherit;font-size:15px;padding:6px 8px;border:2px solid var(--line);border-radius:3px;background:var(--surface);color:var(--ink);margin:0 0 6px;box-sizing:border-box}';
  function mount(box, o) {
    var el = o.el;
    if (!document.getElementById('bl-soc-css')) { var st = document.createElement('style'); st.id = 'bl-soc-css'; st.textContent = STYLE; document.head.appendChild(st); }
    var S = { lang: ES_APP ? 'es' : 'en', occ: 'hol', hol: null, fmt: 'story', model: 'marinho', seed: rnd(50), div: 'exp', av: 'recesso', conq: 'stage', num: '', name: '', cap: 'media', edit: null };
    var holList = function () { return HOL.filter(function (h) { return !h.hide && (h.c === 'both' || h.c === S.lang); }); };
    box.textContent = '';
    box.append(el('p', { class: 'hint' }, 'Gere posts para Instagram e WhatsApp com o escudo, as cores e o tom de voz do Brandbook. A imagem e a legenda são criadas aqui, no seu navegador.'));
    var wrapBox = el('div'); box.append(wrapBox);
    var cv = el('canvas', { class: 'sc-cv' });
    function chips(list, cur, on) { return el('div', { class: 'row' }, ...list.map(function (x) { var b = el('button', { type: 'button', class: 'sc-chip' + (x[0] === cur ? ' on' : ''), 'aria-pressed': x[0] === cur ? 'true' : 'false' }, x[1]); b.addEventListener('click', function () { on(x[0]); }); return b; })); }
    function sel(opts, cur, on, label) { var s = el('select', { 'aria-label': label }); opts.forEach(function (x) { var op = el('option', { value: x[0] }, x[1]); if (x[0] === cur) op.selected = true; s.append(op); }); s.addEventListener('change', function () { on(s.value); }); return s; }
    var students = function () { return (o.profiles ? o.profiles() : []).filter(function (p) { return !p.is_admin && p.status === 'approved'; }); };
    var capBox, ctCur;
    function render() {
      wrapBox.textContent = '';
      // próximas datas
      var now = new Date(), nx = holList().map(function (h) { var d = nextDate(h, now); return { h: h, d: d, n: Math.round((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5) }; }).sort(function (a, b) { return a.n - b.n; }).slice(0, 4);
      var nr = el('div', { class: 'sc-next' });
      nx.forEach(function (x) { var b = el('button', { type: 'button', class: 'ghost' }, x.h.n + ' · ' + (x.n === 0 ? 'hoje' : x.n === 1 ? 'amanhã' : 'em ' + x.n + ' dias')); b.addEventListener('click', function () { S.occ = 'hol'; S.hol = x.h; S.seed = rnd(50); S.edit = null; render(); }); nr.append(b); });
      wrapBox.append(el('h3', { class: 'sc-h' }, 'Próximas datas'), nr);
      wrapBox.append(el('h3', { class: 'sc-h' }, 'Idioma do conteúdo'), chips([['en', 'Inglês'], ['es', 'Espanhol']], S.lang, function (v) { S.lang = v; S.hol = null; S.edit = null; render(); }));
      wrapBox.append(el('h3', { class: 'sc-h' }, '1  Ocasião'), chips([['hol', 'Feriado'], ['dica', 'Dica'], ['palavra', 'Palavra do dia'], ['curio', 'Curiosidade'], ['conq', 'Conquista'], ['aniv', 'Aniversário'], ['divulg', 'Divulgação'], ['aviso', 'Aviso']], S.occ, function (v) { S.occ = v; S.edit = null; S.seed = rnd(50); render(); }));
      // opções da ocasião
      var opt = el('div', { class: 'row' });
      if (S.occ === 'hol') { var hl = holList(); if (!S.hol || hl.indexOf(S.hol) < 0) S.hol = nx[0] ? nx[0].h : hl[0]; opt.append(sel(hl.map(function (h) { return [h.id, h.n + ' · ' + fmtD(nextDate(h, now))]; }), S.hol.id, function (v) { S.hol = hl.filter(function (h) { return h.id === v; })[0]; S.edit = null; render(); }, 'Data')); }
      if (S.occ === 'divulg') opt.append(sel([['exp', 'Aula experimental'], ['place', 'Teste de nível'], ['metodo', 'Falar desde a 1ª aula'], ['vagas', 'Vagas abertas']], S.div, function (v) { S.div = v; S.edit = null; render(); }, 'Tipo'));
      if (S.occ === 'aviso') opt.append(sel([['recesso', 'Recesso'], ['horario', 'Mudança de horário'], ['novidade', 'Novidade no app']], S.av, function (v) { S.av = v; S.edit = null; render(); }, 'Tipo'));
      if (S.occ === 'conq' || S.occ === 'aniv') {
        var st = students(), ns = el('select', { 'aria-label': 'Aluno' }); ns.append(el('option', { value: '' }, '— escolha o aluno —')); st.forEach(function (p) { var op = el('option', { value: firstName(p.name || p.email) }, p.name || p.email); if (firstName(p.name) === S.name) op.selected = true; ns.append(op); });
        ns.addEventListener('change', function () { S.name = ns.value; S.edit = null; render(); }); opt.append(ns);
        var nm = el('input', { type: 'text', placeholder: 'ou digite o nome', value: S.name, 'aria-label': 'Nome', style: 'min-height:38px' }); nm.addEventListener('change', function () { S.name = nm.value; S.edit = null; render(); }); opt.append(nm);
        el('span'); opt.append(el('span', { class: 'hint', style: 'margin:0' }, 'Só o primeiro nome vai na imagem. Sem foto.'));
        if (S.occ === 'conq') { opt.append(sel([['stage', 'Stage concluído'], ['streak', 'Sequência de dias'], ['mes', 'Aluno do mês']], S.conq, function (v) { S.conq = v; S.edit = null; render(); }, 'Tipo')); var nn = el('input', { type: 'number', min: 1, placeholder: 'nº', value: S.num, 'aria-label': 'Número', style: 'width:80px;min-height:38px' }); nn.addEventListener('change', function () { S.num = nn.value; S.edit = null; render(); }); opt.append(nn); }
      }
      wrapBox.append(opt);
      wrapBox.append(el('h3', { class: 'sc-h' }, '2  Rede e formato'), chips(Object.keys(FORMATS).map(function (k) { return [k, FORMATS[k].n]; }), S.fmt, function (v) { S.fmt = v; draw1(); render(); }));
      if (S.fmt === 'reels') wrapBox.append(el('p', { class: 'hint' }, 'Aqui sai a capa do Reels em imagem. O vídeo animado com os efeitos de feriado é a próxima etapa.'));
      wrapBox.append(el('h3', { class: 'sc-h' }, '3  Modelo'), chips(Object.keys(MODELS).map(function (k) { return [k, MODELS[k]]; }), S.model, function (v) { S.model = v; draw1(); render(); }));
      // prévia + legenda
      var ct = ctCur = Object.assign({}, content(S), S.edit || {});
      var ed = el('details', { class: 'sc-ed' }, el('summary', { style: 'cursor:pointer;font-weight:700;margin:8px 0' }, 'Editar textos'));
      [['k', 'Rótulo'], ['t1', 'Título'], ['t2', 'Título em destaque (dourado/itálico)'], ['big', 'Frase principal'], ['small', 'Tradução'], ['body', 'Texto'], ['cta', 'Botão']].forEach(function (f) {
        if (f[0] === 'body') { var ta = el('textarea', { rows: 3, 'aria-label': f[1] }); ta.value = ct.body || ''; ta.addEventListener('input', function () { S.edit = S.edit || {}; S.edit.body = ta.value; draw1(true); }); ed.append(el('label', {}, f[1]), ta); return; }
        var inp = el('input', { type: 'text', 'aria-label': f[1], value: ct[f[0]] || '' }); inp.addEventListener('input', function () { S.edit = S.edit || {}; S.edit[f[0]] = inp.value; draw1(true); }); ed.append(el('label', {}, f[1]), inp);
      });
      capBox = el('textarea', { class: 'sc-cap', 'aria-label': 'Legenda' });
      var msg = el('p', { class: 'msg', 'aria-live': 'polite' });
      var capNow = function () { var c = captions(S, ctCur); capBox.value = c[S.cap]; };
      var left = el('div', {}, cv), right = el('div', { style: 'flex:1;min-width:260px' });
      right.append(el('b', {}, 'Legenda'), chips([['curta', 'Curta'], ['media', 'Média'], ['longa', 'Longa']], S.cap, function (v) { S.cap = v; capNow(); render2(); }), capBox);
      var bar = el('div', { class: 'row', style: 'margin-top:10px' });
      var bdl = el('button', { type: 'button' }, 'Baixar PNG'), bcp = el('button', { type: 'button', class: 'ghost' }, 'Copiar legenda'), bsh = el('button', { type: 'button', class: 'ghost' }, 'Compartilhar'), bra = el('button', { type: 'button', class: 'ghost' }, 'Sortear outra'), bia = el('button', { type: 'button', class: 'ghost', disabled: 'disabled', title: 'Disponível quando a chave do Gemini for configurada' }, 'Reescrever com IA (em breve)');
      bdl.addEventListener('click', function () { cv.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'britland-' + S.occ + '-' + S.fmt + '.png'; document.body.append(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); msg.textContent = 'Imagem baixada.'; msg.className = 'msg ok'; }, 'image/png'); });
      bcp.addEventListener('click', function () { var t = capBox.value; (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { msg.textContent = 'Legenda copiada.'; msg.className = 'msg ok'; }, function () { capBox.select(); msg.textContent = 'Selecionei a legenda: use Copiar do aparelho.'; msg.className = 'msg'; }); });
      bsh.addEventListener('click', function () { cv.toBlob(function (b) { var f = new File([b], 'britland-' + S.occ + '.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], text: capBox.value }).catch(function () { }); else { msg.textContent = 'Este aparelho não abre o compartilhamento. Use Baixar PNG.'; msg.className = 'msg bad'; } }, 'image/png'); });
      bra.addEventListener('click', function () { S.seed = rnd(50); S.edit = null; render(); });
      bar.append(bdl, bcp, bsh, bra, bia); right.append(bar, msg);
      wrapBox.append(el('div', { class: 'sc-grid', style: 'margin-top:14px' }, left, right), ed, tarjaSection());
      draw1(); capNow();
    }

    /* ---------- vídeos: logo no canto e tarja ---------- */
    var TJ = { kind: 'in', mode: 'alpha', l1: '', l2: '', tab: 0, handle: false };
    function tarjaSection() {
      var T = window.TarjaFx; if (!T) return el('span');
      if (window.BL_BASE == null) window.BL_BASE = BASE;
      var d = el('details', { class: 'sc-ed', style: 'margin-top:18px' }, el('summary', { style: 'cursor:pointer;font-weight:700;margin:8px 0' }, 'Vídeos: logo no canto e tarja'));
      var pv = el('canvas', { class: 'sc-cv', style: 'max-width:260px;background:repeating-conic-gradient(#8a93a3 0 25%,#6f7889 0 50%) 0 0/24px 24px' });
      var msg = el('p', { class: 'msg', 'aria-live': 'polite' });
      var l1 = el('input', { type: 'text', 'aria-label': 'Linha 1 da tarja', placeholder: 'Linha 1 (ex.: Nome do professor)', value: TJ.l1 }), l2 = el('input', { type: 'text', 'aria-label': 'Linha 2 da tarja', placeholder: 'Linha 2 (opcional)', value: TJ.l2 });
      function prev() { Promise.all([loadFonts(), T.loadShield(S.lang)]).then(function (a) { T.draw(pv, { mode: 'alpha', lang: S.lang, l1: TJ.l1, l2: TJ.l2, sh: a[1], state: T.state('full', 0) }); }); }
      l1.addEventListener('input', function () { TJ.l1 = l1.value; prev(); }); l2.addEventListener('input', function () { TJ.l2 = l2.value; prev(); });
      function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
      function png(kind, name) { Promise.all([loadFonts(), T.loadShield(S.lang)]).then(function (a) { var c = document.createElement('canvas'); T.draw(c, { mode: 'alpha', lang: S.lang, l1: kind === 'full' ? TJ.l1 : '', l2: kind === 'full' ? TJ.l2 : '', sh: a[1], state: T.state(kind, 0) }); c.toBlob(function (b) { dl(b, 'britland-' + name + '-' + S.lang + '.png'); }); }); }
      function rec() {
        if (!window.MediaRecorder) { msg.textContent = 'Este navegador não grava vídeo. Use o Chrome no computador.'; msg.className = 'msg err'; return; }
        var mime = TJ.mode === 'alpha' ? 'video/webm;codecs=vp9' : (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ? 'video/mp4;codecs=avc1' : 'video/webm;codecs=vp9'), ext = mime.indexOf('mp4') > 0 ? 'mp4' : 'webm';
        if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';
        Promise.all([loadFonts(), T.loadShield(S.lang)]).then(function (a) {
          var c = document.createElement('canvas'), dur = T.DUR[TJ.kind], opts = function (t) { return { mode: TJ.mode, lang: S.lang, l1: TJ.l1, l2: TJ.l2, sh: a[1], state: TJ.kind === 'end' ? null : T.state(TJ.kind, t), t: t, handle: TJ.handle, noName: true }; }, fx = null, drw = function (t) { if (TJ.kind === 'end') T.drawEnd(c, opts(t)); else if (TJ.kind === 'intro') { fx.progress(Math.min(1, t / 2.6)); var oo = opts(t); oo.lc = fx.canvas; T.drawIntro(c, oo); } else T.draw(c, opts(t)); };
          if (TJ.kind === 'intro') { if (!window.BLLoad) { msg.textContent = 'A animação de faíscas não está disponível nesta tela.'; msg.className = 'msg err'; return; } var host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-9999px;top:0;width:300px'; document.body.append(host); fx = window.BLLoad.mount(host, { effect: null, course: S.lang, src: BASE + 'img/' + (S.lang === 'es' ? 'britland-shield-es.png' : 'britland-shield.png'), dpr: 3.6, clean: true }); fx.host = host; }
          drw(0); var st = c.captureStream(30), ch = [], mr = new MediaRecorder(st, { mimeType: mime, videoBitsPerSecond: 8e6 });
          mr.ondataavailable = function (e) { if (e.data && e.data.size) ch.push(e.data); };
          mr.onstop = function () { if (fx) { fx.destroy(); if (fx.host && fx.host.remove) fx.host.remove(); } dl(new Blob(ch, { type: mime.split(';')[0] }), 'britland-' + (TJ.kind === 'in' ? 'tarja-entrada' : TJ.kind === 'out' ? 'tarja-saida' : TJ.kind === 'intro' ? 'abertura' : 'encerramento') + '-' + S.lang + (TJ.mode === 'alpha' ? '-transparente' : TJ.mode === 'green' ? '-verde' : '-azul') + '.' + ext); msg.textContent = 'Pronto. Vídeo baixado.' + (TJ.mode !== 'alpha' && ext === 'webm' ? ' (Este navegador gravou em WebM; o Chrome atual grava MP4.)' : ''); msg.className = 'msg ok'; bg.disabled = false; };
          msg.textContent = 'Gravando em tempo real (' + dur.toFixed(1) + ' s)…'; msg.className = 'msg'; bg.disabled = true; mr.start();
          var t0 = performance.now(); (function tick() { var t = (performance.now() - t0) / 1000; drw(Math.min(t, dur)); if (t < dur + .25) requestAnimationFrame(tick); else mr.stop(); })();
        });
      }
      var bg = el('button', { type: 'button' }, 'Gerar e baixar vídeo');
      bg.addEventListener('click', rec);
      d.append(el('p', { class: 'hint' }, 'A tarja abre a partir do logo do canto (o nome Britland Academy some em fade) e fecha de volta. Deixe as linhas vazias para a tarja vazia. O encerramento começa só com o escudo no canto, que sobe ao centro, e o nome aparece no final. O vídeo é gravado em tempo real, com 1080x1920.'),
        el('div', { class: 'row' }, el('b', {}, 'Vídeo:'), chips([['in', 'Tarja: entrada'], ['out', 'Tarja: saída'], ['intro', 'Abertura (escudo em faíscas)'], ['end', 'Encerramento (logo sobe ao centro)']], TJ.kind, function (v) { TJ.kind = v; reopen(); })),
        el('div', { class: 'row' }, el('b', {}, 'Fundo:'), chips([['alpha', 'Transparente (WebM)'], ['blue', 'Azul (MP4)'], ['green', 'Verde chroma (MP4)']], TJ.mode, function (v) { TJ.mode = v; reopen(); })),
        el('div', { class: 'row' }, l1, l2), (function () { var cb = el('input', { type: 'checkbox', id: 'tjh' }); cb.checked = TJ.handle; cb.addEventListener('change', function () { TJ.handle = cb.checked; }); return el('label', { class: 'row', style: 'gap:8px;align-items:center' }, cb, 'Encerramento: incluir @britlandacademy'); })(), el('div', { class: 'sc-grid', style: 'margin-top:10px' }, pv, el('div', { style: 'flex:1;min-width:240px' },
          el('div', { class: 'row' }, bg), el('b', {}, 'Imagens PNG (fundo transparente, 1080x1920)'),
          el('div', { class: 'row' }, (function () { var b = el('button', { type: 'button', class: 'ghost' }, 'Logo no canto, com Britland'); b.addEventListener('click', function () { png('corner', 'logo-canto-com-britland'); }); return b; })(),
            (function () { var b = el('button', { type: 'button', class: 'ghost' }, 'Logo no canto, sem Britland'); b.addEventListener('click', function () { png('shield', 'logo-canto-sem-britland'); }); return b; })(),
            (function () { var b = el('button', { type: 'button', class: 'ghost' }, 'Logo e tarja (vazia)'); b.addEventListener('click', function () { png('bar', 'logo-e-tarja-vazia'); }); return b; })(),
            (function () { var b = el('button', { type: 'button', class: 'ghost' }, 'Logo e tarja (com texto)'); b.addEventListener('click', function () { png('full', 'logo-e-tarja-texto'); }); return b; })()), msg)));
      if (TJ.open) d.open = true; d.addEventListener('toggle', function () { TJ.open = d.open; if (d.open) prev(); });
      function reopen() { TJ.open = true; render(); }
      return d;
    }
    function render2() { var c = captions(S, ctCur); capBox.value = c[S.cap]; /* só atualiza chip visual */ var chs = capBox.parentNode.querySelectorAll('.sc-chip'); [].forEach.call(chs, function (b) { var on = b.textContent.toLowerCase().indexOf(S.cap === 'media' ? 'média' : S.cap) === 0; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
    function draw1(keepCap) {
      var ct = ctCur = Object.assign({}, content(S), S.edit || {});
      Promise.all([loadFonts(), loadShield()]).then(function () { draw(cv, S.fmt, S.model, ct); if (!keepCap && capBox) capBox.value = captions(S, ct)[S.cap]; });
    }
    render();
  }
  window.SocialTab = { mount: mount, _draw: draw, _content: content, _captions: captions, _HOL: HOL, _load: loadShield };
})();
