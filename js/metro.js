/* Britland Academy: Game mode home as a metro map (shared by the English and Spanish sites).
   Window.Metro.mount(ctx,opts). Only used when Game mode is on (localStorage 'bl-game'==='1').
   - Each time the student opens the game, the city rotates (London, New York, Sydney, Toronto / Madrid, Mexico City, Buenos Aires, Santiago).
   - The route is drawn with 45-degree bends and is different every time.
   - Three tabs: Home (map), Trophies, Profile. One school logo only. */
(function(){
'use strict';
var W=window,D=document,NS='http://www.w3.org/2000/svg',B=W.BL_BASE||'';
var ES=!!W.BL_COURSE,KEY=(W.BL_COURSE&&W.BL_COURSE.langKey)||'callan-lang';
function lang(){try{var l=localStorage.getItem(KEY);return l==='en'||l==='es'||l==='pt'?l:'pt';}catch(e){return 'pt';}}

/* ---------- text ---------- */
var TX={en:{home:'Home',tro:'Trophies',pro:'Profile',lesson:'Lesson',here:'YOU ARE HERE',stars:'stars',welcome:'Welcome to',next:'NEXT STOP',locked:'Complete the current lesson first',tap:'Tap the lesson to open it',
 open:'Open lesson',medals:'Medals',streak:'Streak',stages:'My stages',days:'days in a row',lessons:'lessons',stars:'stars',pay:'Grades and payments',all:'All done! Ask your teacher for the next lessons.',
 m:['First lesson','3 lessons','10 lessons','7-day streak','Perfect score','30-day streak'],week:'SMTWTFS',stage:'Stage'},
 es:{home:'Inicio',tro:'Trofeos',pro:'Perfil',lesson:'Lección',here:'ESTÁS AQUÍ',stars:'estrellas',welcome:'Bienvenido a',next:'PRÓXIMA PARADA',locked:'Primero completa la lección actual',tap:'Toca la lección para abrirla',
 open:'Abrir lección',medals:'Medallas',streak:'Racha',stages:'Mis etapas',days:'días seguidos',lessons:'lecciones',stars:'estrellas',pay:'Notas y pagos',all:'¡Todo listo! Pide a tu profesor las próximas lecciones.',
 m:['Primera lección','3 lecciones','10 lecciones','Racha de 7 días','Nota perfecta','Racha de 30 días'],week:'LMXJVSD',stage:'Etapa'}};
function T(){return ES?TX.es:TX.en;}

/* ---------- flags (own simple drawings) ---------- */
var FL={
 uk:'<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" stroke-width="2"/><path d="M30 0V30M0 15H60" stroke="#fff" stroke-width="10"/><path d="M30 0V30M0 15H60" stroke="#C8102E" stroke-width="6"/></svg>',
 us:(function(){var s='<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#fff"/>';for(var i=0;i<13;i+=2)s+='<rect y="'+(i*30/13).toFixed(2)+'" width="60" height="'+(30/13).toFixed(2)+'" fill="#B22234"/>';s+='<rect width="26" height="16.15" fill="#3C3B6E"/>';for(var r=0;r<4;r++)for(var c=0;c<5;c++)s+='<circle cx="'+(3+c*5)+'" cy="'+(3+r*3.9)+'" r="1" fill="#fff"/>';return s+'</svg>';})(),
 au:'<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><path d="M0 0L30 15M30 0L0 15" stroke="#fff" stroke-width="3"/><path d="M15 0V15M0 7.5H30" stroke="#fff" stroke-width="5"/><path d="M15 0V15M0 7.5H30" stroke="#C8102E" stroke-width="3"/><circle cx="15" cy="23" r="3.5" fill="#fff"/><circle cx="44" cy="8" r="1.8" fill="#fff"/><circle cx="50" cy="15" r="1.8" fill="#fff"/><circle cx="44" cy="24" r="1.8" fill="#fff"/><circle cx="38" cy="15" r="1.8" fill="#fff"/></svg>',
 ie:'<svg viewBox="0 0 60 30"><rect width="20" height="30" fill="#169B62"/><rect x="20" width="20" height="30" fill="#fff"/><rect x="40" width="20" height="30" fill="#FF883E"/></svg>',
 ca:'<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#fff"/><rect width="15" height="30" fill="#D52B1E"/><rect x="45" width="15" height="30" fill="#D52B1E"/><path d="M30 6l2 4 3-1-1 6 3-2 1 3-6 2 1 4h-6l1-4-6-2 1-3 3 2-1-6 3 1z" fill="#D52B1E"/></svg>'
};
function flagHTML(c){return c.img?'<img alt="" src="'+B+c.img+'">':FL[c.flag];}

/* ---------- cities, real stations, line colours, landmark silhouettes ---------- */
var ARTS={
 lighthouse:'<path d="M60 146L66 50H84L90 146Z" fill="#fff"/><rect x="62" y="34" width="26" height="16" fill="#fff"/><path d="M60 34L75 18L90 34Z" fill="#fff"/><rect x="66" y="80" width="18" height="8" fill="@C"/><rect x="66" y="106" width="18" height="8" fill="@C"/><path d="M0 146H150" stroke="#fff" stroke-width="4"/>',
 harbour:'<path d="M20 100H130L116 128H34Z" fill="#fff"/><rect x="72" y="40" width="5" height="60" fill="#fff"/><path d="M77 44L112 96H77Z" fill="#fff"/><path d="M0 138Q20 130 40 138T80 138T120 138T150 138" stroke="#fff" stroke-width="3" fill="none"/>',
 boat:'<path d="M20 100H130L116 128H34Z" fill="#fff"/><rect x="72" y="30" width="5" height="70" fill="#fff"/><path d="M77 34L112 96H77Z" fill="#fff"/><path d="M70 50L36 96H70Z" fill="#fff" opacity=".8"/><path d="M0 138Q20 130 40 138T80 138T120 138T150 138" stroke="#fff" stroke-width="3" fill="none"/>',
 wave:'<circle cx="112" cy="36" r="14" fill="#fff"/><path d="M0 88Q19 68 38 88T75 88T112 88T150 88V150H0Z" fill="#fff"/><path d="M0 110Q19 94 38 110T75 110T112 110T150 110" stroke="@C" stroke-width="4" fill="none"/>',
 cliff:'<path d="M0 40H60Q70 40 72 60L74 150H0Z" fill="#fff"/><path d="M74 150L76 70H92L94 150Z" fill="#fff" opacity=".85"/><path d="M96 150L98 96H110L112 150Z" fill="#fff" opacity=".7"/><path d="M0 140Q30 130 60 140T120 140T150 140" stroke="#fff" stroke-width="3" fill="none"/>',
 rock:'<path d="M30 146V80H44V64H58V50H70V30L80 20L90 30V50H104V64H118V80H120V146Z" fill="#fff"/><rect x="66" y="100" width="18" height="46" rx="9" fill="@C"/>',
 sunset:'<path d="M30 110A45 45 0 0 1 120 110Z" fill="#fff"/><path d="M75 40V20M40 56L28 44M110 56L122 44M18 90H4M132 90H146" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M0 120H150M10 134H140" stroke="#fff" stroke-width="5"/>',
 kangaroo:'<path d="M52 140Q40 100 60 70Q58 50 72 40L80 22L88 40Q96 46 92 58L100 76Q116 100 108 140L96 140L90 110Q82 124 76 140Z" fill="#fff"/><path d="M108 120Q130 126 138 146" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M72 40L66 22L76 30ZM88 40L96 22L90 32Z" fill="#fff"/>',
 houses:'<rect x="10" y="80" width="40" height="70" fill="#fff"/><path d="M10 80L30 55L50 80Z" fill="#fff"/><rect x="55" y="70" width="40" height="80" fill="#fff"/><path d="M55 70L75 42L95 70Z" fill="#fff"/><rect x="100" y="85" width="40" height="65" fill="#fff"/><path d="M100 85L120 62L140 85Z" fill="#fff"/><rect x="22" y="100" width="12" height="14" fill="@C"/><rect x="67" y="94" width="12" height="14" fill="@C"/><rect x="112" y="104" width="12" height="14" fill="@C"/>',
 bag:'<path d="M35 55h80l8 95H27z" fill="#fff"/><path d="M55 55V40a20 20 0 0 1 40 0v15" stroke="#fff" stroke-width="6" fill="none"/><circle cx="62" cy="75" r="4" fill="@C"/><circle cx="88" cy="75" r="4" fill="@C"/>',
 cross:'<path d="M18 18L132 132M132 18L18 132" stroke="#fff" stroke-width="16" stroke-linecap="round"/><circle cx="75" cy="75" r="15" fill="@C" stroke="#fff" stroke-width="5"/>',
 museum:'<path d="M10 60L75 25L140 60Z" fill="#fff"/><rect x="14" y="64" width="122" height="8" fill="#fff"/><rect x="24" y="76" width="12" height="56" fill="#fff"/><rect x="48" y="76" width="12" height="56" fill="#fff"/><rect x="72" y="76" width="12" height="56" fill="#fff"/><rect x="96" y="76" width="12" height="56" fill="#fff"/><rect x="120" y="76" width="12" height="56" fill="#fff"/><rect x="10" y="134" width="130" height="10" fill="#fff"/>',
 scales:'<rect x="72" y="30" width="6" height="100" fill="#fff"/><rect x="40" y="124" width="70" height="10" fill="#fff"/><path d="M25 40H125" stroke="#fff" stroke-width="5"/><path d="M25 40L10 85M25 40L40 85M125 40L110 85M125 40L140 85" stroke="#fff" stroke-width="3"/><path d="M5 85Q25 108 45 85Z M105 85Q125 108 145 85Z" fill="#fff"/><circle cx="75" cy="26" r="7" fill="#fff"/>',
 dome:'<path d="M35 95Q35 35 75 35Q115 35 115 95Z" fill="#fff"/><rect x="30" y="95" width="90" height="12" fill="#fff"/><rect x="40" y="107" width="70" height="40" fill="#fff"/><rect x="73" y="10" width="4" height="26" fill="#fff"/><rect x="66" y="16" width="18" height="4" fill="#fff"/><path d="M50 107V147M65 107V147M85 107V147M100 107V147" stroke="@C" stroke-width="3"/>',
 coin:'<circle cx="75" cy="75" r="60" fill="#fff"/><circle cx="75" cy="75" r="50" fill="@C"/><text x="75" y="98" font-size="68" font-weight="800" text-anchor="middle" fill="#fff" font-family="Georgia,serif">£</text>',
 kilkenny:'<path d="M12 40v-10h6v6h6v-6h6v6h6v-6h6v10z M104 40v-10h6v6h6v-6h6v6h6v-6h6v10z M30 62v-8h8v4h8v-4h8v4h8v-4h8v4h8v-4h8v4h8v8z" fill="#fff"/><rect x="30" y="62" width="90" height="84" fill="#fff"/><rect x="12" y="40" width="34" height="106" fill="#fff"/><rect x="104" y="40" width="34" height="106" fill="#fff"/><rect x="62" y="106" width="26" height="40" rx="13" fill="@C"/><rect x="24" y="64" width="6" height="14" fill="@C"/><rect x="120" y="64" width="6" height="14" fill="@C"/>',
 reginald:'<rect x="48" y="60" width="54" height="88" fill="#fff"/><path d="M42 60L75 22L108 60Z" fill="#fff"/><rect x="66" y="80" width="6" height="18" fill="@C"/><rect x="80" y="104" width="6" height="18" fill="@C"/><rect x="62" y="128" width="26" height="20" rx="13" fill="@C"/>',
 blarney:'<path d="M46 50v-12h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v12z" fill="#fff"/><rect x="50" y="50" width="50" height="98" fill="#fff"/><rect x="66" y="88" width="18" height="30" rx="9" fill="@C"/><rect x="22" y="110" width="30" height="38" fill="#fff"/><rect x="98" y="110" width="30" height="38" fill="#fff"/><path d="M5 148H145" stroke="#fff" stroke-width="4"/>',
 mountains:'<path d="M0 130L40 60L70 100L100 40L150 130Z" fill="#fff"/><path d="M0 144Q30 134 60 144T120 144T150 142V150H0Z" fill="#fff" opacity=".7"/><circle cx="118" cy="26" r="10" fill="#fff"/>',
 kingjohn:'<rect x="40" y="82" width="70" height="64" fill="#fff"/><rect x="18" y="52" width="36" height="94" rx="4" fill="#fff"/><rect x="96" y="52" width="36" height="94" rx="4" fill="#fff"/><path d="M18 52v-10h7v6h7v-6h7v6h7v-6h7v10z M96 52v-10h7v6h7v-6h7v6h7v-6h7v10z" fill="#fff"/><rect x="62" y="108" width="26" height="38" rx="13" fill="@C"/>',
 spanisharch:'<path d="M20 148V70Q20 20 75 20Q130 20 130 70V148H105V72Q105 46 75 46Q45 46 45 72V148Z" fill="#fff"/><path d="M0 148H150" stroke="#fff" stroke-width="4"/>',
 parliament:'<rect x="20" y="95" width="110" height="40" fill="#fff"/><path d="M45 95Q75 50 105 95Z" fill="#fff"/><rect x="73" y="2" width="4" height="60" fill="#fff"/><path d="M77 6h24v12H77z" fill="@C" stroke="#fff" stroke-width="2"/><path d="M30 135v10M50 135v10M70 135v10M90 135v10M110 135v10" stroke="#fff" stroke-width="4"/>',
 tram:'<rect x="25" y="45" width="100" height="70" rx="12" fill="#fff"/><rect x="35" y="58" width="24" height="22" rx="3" fill="@C"/><rect x="63" y="58" width="24" height="22" rx="3" fill="@C"/><rect x="91" y="58" width="24" height="22" rx="3" fill="@C"/><path d="M75 45V20M50 20H100" stroke="#fff" stroke-width="4"/><circle cx="48" cy="124" r="8" fill="#fff"/><circle cx="102" cy="124" r="8" fill="#fff"/><path d="M0 134H150" stroke="#fff" stroke-width="4"/>',
 church:'<rect x="50" y="70" width="50" height="76" fill="#fff"/><path d="M50 70L75 20L100 70Z" fill="#fff"/><rect x="73" y="2" width="4" height="22" fill="#fff"/><rect x="68" y="8" width="14" height="4" fill="#fff"/><rect x="62" y="110" width="26" height="36" rx="13" fill="@C"/><rect x="20" y="100" width="30" height="46" fill="#fff"/><rect x="100" y="100" width="30" height="46" fill="#fff"/>',
 swan:'<path d="M40 110Q20 60 50 38Q66 26 62 48Q58 66 68 76Q96 70 118 96Q112 130 74 130Q50 130 40 110Z" fill="#fff"/><path d="M50 38Q54 22 40 22L30 26L42 34Z" fill="@C"/><path d="M0 138Q20 130 40 138T80 138T120 138T150 138" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>',
 uluru:'<path d="M5 125Q15 80 45 70Q75 56 105 70Q135 80 145 125Z" fill="#fff"/><path d="M0 134H150" stroke="#fff" stroke-width="4"/><path d="M40 125Q50 100 62 104" stroke="@C" stroke-width="3" fill="none"/>',
 storybridge:'<path d="M0 100H150" stroke="#fff" stroke-width="6"/><path d="M20 100L45 30L75 100L105 30L130 100" stroke="#fff" stroke-width="6" fill="none"/><path d="M45 30L75 100M105 30L75 100" stroke="#fff" stroke-width="3"/><path d="M45 30h60" stroke="#fff" stroke-width="5"/><path d="M0 128Q20 120 40 128T80 128T120 128T150 128" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>',
 bigben:'<rect x="62" y="40" width="26" height="110" fill="#fff"/><path d="M62 40L75 8L88 40Z" fill="#fff"/><rect x="58" y="36" width="34" height="8" fill="#fff"/><circle cx="75" cy="62" r="8" fill="@C"/><rect x="40" y="100" width="22" height="50" fill="#fff"/><rect x="88" y="100" width="40" height="50" fill="#fff"/>',
 bridge:'<rect x="30" y="50" width="14" height="100" fill="#fff"/><rect x="106" y="50" width="14" height="100" fill="#fff"/><path d="M0 135Q37 70 37 52Q75 120 113 52Q113 70 150 135" stroke="#fff" stroke-width="3" fill="none"/><path d="M37 52L10 135M37 52L60 135M113 52L90 135M113 52L140 135" stroke="#fff" stroke-width="1.5"/><rect x="0" y="135" width="150" height="6" fill="#fff"/>',
 opera:'<path d="M15 140Q25 70 70 70Q70 110 15 140Z" fill="#fff"/><path d="M60 140Q70 50 118 50Q118 100 60 140Z" fill="#fff"/><path d="M100 140Q108 90 138 92Q138 120 100 140Z" fill="#fff"/><rect x="5" y="140" width="140" height="8" fill="#fff"/>',
 halfpenny:'<path d="M8 118Q75 38 142 118" stroke="#fff" stroke-width="9" fill="none"/><rect x="4" y="116" width="142" height="7" fill="#fff"/><path d="M24 112V100M42 100V84M60 88V74M75 82V70M90 88V74M108 100V84M126 112V100" stroke="#fff" stroke-width="3"/><rect x="10" y="84" width="4" height="34" fill="#fff"/><circle cx="12" cy="80" r="6" fill="#fff"/><rect x="136" y="84" width="4" height="34" fill="#fff"/><circle cx="138" cy="80" r="6" fill="#fff"/><path d="M0 134Q19 126 38 134T75 134T112 134T150 134" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>',
 cn:'<rect x="72" y="30" width="6" height="120" fill="#fff"/><ellipse cx="75" cy="78" rx="22" ry="8" fill="#fff"/><rect x="73" y="8" width="4" height="30" fill="#fff"/><path d="M60 150L72 80M90 150L78 80" stroke="#fff" stroke-width="4"/>',
 alcala:'<rect x="20" y="70" width="110" height="14" fill="#fff"/><rect x="26" y="52" width="98" height="18" fill="#fff"/><rect x="62" y="36" width="26" height="16" fill="#fff"/><rect x="20" y="84" width="16" height="64" fill="#fff"/><rect x="60" y="84" width="8" height="64" fill="#fff"/><rect x="82" y="84" width="8" height="64" fill="#fff"/><rect x="114" y="84" width="16" height="64" fill="#fff"/><rect x="14" y="146" width="122" height="6" fill="#fff"/>',
 angel:'<rect x="68" y="50" width="14" height="60" fill="#fff"/><path d="M75 12l5 12-5 6-5-6z" fill="#fff"/><path d="M52 34Q64 22 75 30Q86 22 98 34Q86 36 75 40Q64 36 52 34Z" fill="#fff"/><rect x="58" y="108" width="34" height="10" fill="#fff"/><rect x="46" y="118" width="58" height="12" fill="#fff"/><rect x="34" y="130" width="82" height="18" fill="#fff"/>',
 obelisk:'<path d="M70 14L80 14L84 40L66 40Z" fill="#fff"/><path d="M66 40L84 40L90 140L60 140Z" fill="#fff"/><rect x="50" y="140" width="50" height="8" fill="#fff"/>',
 torre:'<rect x="62" y="22" width="26" height="126" fill="#fff"/><rect x="68" y="10" width="14" height="14" fill="#fff"/><rect x="74" y="0" width="2" height="12" fill="#fff"/><path d="M66 40h18M66 62h18M66 84h18M66 106h18" stroke="@C" stroke-width="2"/><path d="M0 148Q40 110 75 130Q110 100 150 148Z" fill="#fff" opacity=".6"/>'
};
var CITIES=ES?[
 {city:'Madrid',line:'Línea 1',color:'#2DBEF0',ink:'#10224a',img:'img/es/flag-es.png',art:'alcala',welcome:'Madrid',phrase:'¡Qué pasada!',tr:{pt:'Que demais!',en:'How amazing!'},sp:[["¡Empieza el viaje!", "A viagem começa!", "The journey begins!"], ["¡Qué torres tan inclinadas!", "Que torres inclinadas!", "What leaning towers!"], ["¿Por cuál vamos?", "Por qual vamos?", "Which way do we go?"], ["Un pintxo y seguimos.", "Um pintxo e seguimos.", "One pintxo and we go on."], ["¡La calle que nunca duerme!", "A rua que nunca dorme!", "The street that never sleeps!"], ["¡Kilómetro cero!", "Quilômetro zero!", "Kilometre zero!"], ["¡Última parada, a descansar!", "Última parada, hora de descansar!", "Last stop, time to rest!"]],stn:['Chamartín','Plaza de Castilla','Cuatro Caminos','Bilbao','Gran Vía','Sol','Atocha']},
 {city:'Ciudad de México',line:'Línea 3',color:'#B0B215',ink:'#10224a',img:'img/es/flag-mx.png',art:'angel',welcome:'Ciudad de México',phrase:'¡Ahorita vengo!',tr:{pt:'Já volto!',en:'Be right back!'},sp:[["¡Arrancamos con ganas!", "Partimos com vontade!", "Off we go, full of energy!"], ["¡Aquí hay buena onda!", "Aqui tem boa energia!", "Good vibes here!"], ["¡Aguas, no te distraigas!", "Atenção, não se distraia!", "Watch out, stay focused!"], ["¡Cerca de la Alameda!", "Pertinho da Alameda!", "Right by the Alameda!"], ["¡Un taco y seguimos!", "Um taco e seguimos!", "A taco and we carry on!"], ["¡Cuídate mucho!", "Cuide-se bem!", "Take good care!"], ["¡Goya, goya!", "O grito da UNAM!", "The UNAM cheer!"]],stn:['Indios Verdes','La Raza','Guerrero','Hidalgo','Juárez','Centro Médico','Universidad']},
 {city:'Buenos Aires',line:'Línea A',color:'#18B7E8',ink:'#10224a',img:'img/es/flag-ar.png',art:'obelisk',welcome:'Buenos Aires',phrase:'¡Dale, vamos!',tr:{pt:'Beleza, vamos!',en:'Okay, let’s go!'},sp:[["¡Casa Rosada a la vista!", "Casa Rosada à vista!", "Casa Rosada in sight!"], ["¡Qué lindo es caminar por acá!", "Que bom caminhar por aqui!", "Lovely to stroll here!"], ["¡Pasemos por un alfajor!", "Vamos passar num alfajor!", "Let’s grab an alfajor!"], ["¡Che, no te duermas!", "Ei, não durma!", "Hey, don’t doze off!"], ["¡Qué pinta tiene esta avenida!", "Que cara tem essa avenida!", "What a look this avenue has!"], ["¡Mate en mano!", "Chimarrão na mão!", "Mate in hand!"], ["¡Fin de línea, bárbaro!", "Fim da linha, que legal!", "End of the line, awesome!"]],stn:['Plaza de Mayo','Perú','Piedras','Lima','Sáenz Peña','Congreso','Primera Junta']},
 {city:'Santiago',line:'Línea 1',color:'#E3001B',ink:'#fff',img:'img/es/flag-cl.png',art:'torre',welcome:'Santiago',phrase:'¿Cachai?',tr:{pt:'Entendeu?',en:'Get it?'},sp:[["¡Partimos!", "Vamos!", "Off we go!"], ["¡Qué buena onda!", "Que legal!", "How cool!"], ["¡Fuerza, campeón!", "Força, campeão!", "Go, champ!"], ["¡Mira el palacio!", "Olhe o palácio!", "Look at the palace!"], ["¡A estudiar, po!", "Hora de estudar!", "Time to study!"], ["¡La plaza de las fiestas!", "A praça das festas!", "The square of celebrations!"], ["¡Final del trayecto, cachai!", "Fim do trajeto, entendeu?", "End of the ride, get it?"]],stn:['Estación Central','República','Los Héroes','La Moneda','Universidad de Chile','Baquedano','Tobalaba']}
]:[
 {city:'London',line:'Central line',color:'#dc241f',ink:'#fff',flag:'uk',art:'bigben',arts:['houses','bag','cross','museum','scales','dome','coin'],welcome:'London',phrase:'Mind the gap.',tr:{pt:'Cuidado com o vão.',es:'Cuidado con el hueco.'},sp:[["Bumped into a movie star? Lovely!", "Esbarrou numa estrela de cinema? Que ótimo!", "¿Te cruzaste con una estrella de cine? ¡Qué bien!"], ["Window shopping is free!", "Olhar vitrine é de graça!", "¡Mirar escaparates es gratis!"], ["Everyone crosses at once here.", "Aqui todo mundo atravessa ao mesmo tempo.", "Aquí todos cruzan a la vez."], ["Mind the gap.", "Cuidado com o vão.", "Cuidado con el hueco."], ["Law and order start here.", "A lei e a ordem começam aqui.", "Aquí empiezan la ley y el orden."], ["Look up at that dome!", "Olhe para cima, que cúpula!", "¡Mira esa cúpula!"], ["Money talks, but you walk!", "O dinheiro fala, mas você caminha!", "El dinero habla, ¡pero tú caminas!"]],stn:['Notting Hill Gate','Bond Street','Oxford Circus','Tottenham Court Road','Holborn','St Paul’s','Bank']},
 {city:'New York',line:'6 train',color:'#00933c',ink:'#fff',flag:'us',art:'bridge',welcome:'New York',phrase:'It’s on me.',tr:{pt:'Fica por minha conta.',es:'Invito yo.'},sp:[["Meet me under the clock!", "Me encontre embaixo do relógio!", "¡Nos vemos bajo el reloj!"], ["Keep walking, New Yorker!", "Siga andando, nova-iorquino!", "¡Sigue caminando, neoyorquino!"], ["Give the cube a spin!", "Dê um giro no cubo!", "¡Dale un giro al cubo!"], ["Jazz is in the air.", "Tem jazz no ar.", "Hay jazz en el aire."], ["SoHo: shop till you drop!", "SoHo: compre até cansar!", "SoHo: ¡compra hasta cansarte!"], ["A bargain around every corner!", "Uma pechincha em cada esquina!", "¡Una ganga en cada esquina!"], ["Walk across, it’s worth it!", "Atravesse a pé, vale a pena!", "¡Cruza a pie, vale la pena!"]],stn:['Grand Central–42 St','33 St','Astor Place','Bleecker St','Spring St','Canal St','Brooklyn Bridge']},
 {city:'Australia',line:'Grand Tour',color:'#f99d1c',ink:'#1a1a1a',flag:'au',art:'opera',arts:["opera", "wave", "mountains", "harbour", "lighthouse", "wave", "storybridge", "wave", "boat", "wave", "sunset", "sunset", "uluru", "uluru", "rock", "church", "houses", "kangaroo", "cliff", "tram", "houses", "kangaroo", "parliament", "mountains", "harbour", "kangaroo", "sunset", "houses", "swan"],welcome:'Australia',phrase:'No worries!',tr:{"pt": "Sem problemas!", "es": "¡Sin problema!"},sp:[["The Sydney Opera House opened in 1973.", "A Sydney Opera House foi inaugurada em 1973.", "La Ópera de Sídney se inauguró en 1973."], ["Bondi Beach is Sydney’s most famous beach.", "Bondi Beach é a praia mais famosa de Sydney.", "Bondi Beach es la playa más famosa de Sídney."], ["The Blue Mountains look blue because of eucalyptus mist.", "As Blue Mountains parecem azuis por causa da névoa dos eucaliptos.", "Las Blue Mountains parecen azules por la neblina de los eucaliptos."], ["Newcastle is one of the world’s biggest coal ports.", "Newcastle é um dos maiores portos de carvão do mundo.", "Newcastle es uno de los mayores puertos de carbón del mundo."], ["Byron Bay has the most easterly point of mainland Australia.", "Byron Bay fica no ponto mais a leste do continente australiano.", "Byron Bay está en el punto más oriental de la Australia continental."], ["The Gold Coast has about 70 kilometres of beaches.", "A Gold Coast tem cerca de 70 quilômetros de praias.", "La Gold Coast tiene unos 70 kilómetros de playas."], ["Brisbane has a city beach with a lagoon on the river.", "Brisbane tem uma praia na cidade, com lagoa à beira do rio.", "Brisbane tiene una playa urbana con laguna junto al río."], ["Fraser Island is the biggest sand island in the world.", "Fraser Island é a maior ilha de areia do mundo.", "Fraser Island es la isla de arena más grande del mundo."], ["The Whitsundays are 74 islands in the Coral Sea.", "As Whitsundays são 74 ilhas no Mar de Coral.", "Las Whitsundays son 74 islas en el Mar del Coral."], ["From Cairns you can dive in the Great Barrier Reef.", "De Cairns dá para mergulhar na Grande Barreira de Corais.", "Desde Cairns se puede bucear en la Gran Barrera de Coral."], ["Darwin has spectacular tropical sunsets.", "Darwin tem espetaculares pores do sol tropicais.", "Darwin tiene espectaculares atardeceres tropicales."], ["Kakadu has rock paintings more than 20,000 years old.", "Kakadu tem pinturas rupestres com mais de 20 mil anos.", "Kakadu tiene pinturas rupestres de más de 20.000 años."], ["Alice Springs is the heart of the Outback.", "Alice Springs é o coração do Outback.", "Alice Springs es el corazón del Outback."], ["Uluru is a sacred place for the Anangu people.", "Uluru é um lugar sagrado para o povo Anangu.", "Uluru es un lugar sagrado para el pueblo anangu."], ["In Coober Pedy, many people live in underground houses.", "Em Coober Pedy, muita gente mora em casas subterrâneas.", "En Coober Pedy, mucha gente vive en casas subterráneas."], ["Adelaide is called the City of Churches.", "Adelaide é chamada de Cidade das Igrejas.", "Adelaida se llama la Ciudad de las Iglesias."], ["The Barossa Valley is famous for its wine.", "O Vale Barossa é famoso por seus vinhos.", "El Valle de Barossa es famoso por sus vinos."], ["Kangaroo Island is full of kangaroos, koalas and sea lions.", "A Ilha dos Cangurus é cheia de cangurus, coalas e leões-marinhos.", "La Isla Canguro está llena de canguros, koalas y leones marinos."], ["The Great Ocean Road passes the Twelve Apostles rocks.", "A Great Ocean Road passa pelas rochas dos Doze Apóstolos.", "La Great Ocean Road pasa por las rocas de los Doce Apóstoles."], ["Melbourne has one of the biggest tram networks in the world.", "Melbourne tem uma das maiores redes de bondes do mundo.", "Melbourne tiene una de las mayores redes de tranvías del mundo."], ["Ballarat was a famous gold rush town in the 1850s.", "Ballarat foi uma famosa cidade da corrida do ouro nos anos 1850.", "Ballarat fue una famosa ciudad de la fiebre del oro en los años 1850."], ["On Phillip Island, little penguins walk home at sunset.", "Na Phillip Island, pequenos pinguins voltam para casa ao pôr do sol.", "En Phillip Island, los pequeños pingüinos vuelven a casa al atardecer."], ["Canberra is the capital, not Sydney or Melbourne!", "Canberra é a capital, não Sydney nem Melbourne!", "¡Canberra es la capital, no Sídney ni Melbourne!"], ["Australia has snow! The Snowy Mountains are great for skiing.", "A Austrália tem neve! As Snowy Mountains são ótimas para esquiar.", "¡Australia tiene nieve! Las Snowy Mountains son geniales para esquiar."], ["Hobart is the capital of Tasmania and Australia’s second-oldest city.", "Hobart é a capital da Tasmânia e a segunda cidade mais antiga da Austrália.", "Hobart es la capital de Tasmania y la segunda ciudad más antigua de Australia."], ["Tasmania is the home of the Tasmanian devil.", "A Tasmânia é a casa do diabo-da-tasmânia.", "Tasmania es el hogar del demonio de Tasmania."], ["Broome is famous for its pearls and the Staircase to the Moon.", "Broome é famosa por suas pérolas e pela Escada para a Lua.", "Broome es famosa por sus perlas y la Escalera a la Luna."], ["Margaret River is a surf and wine region.", "Margaret River é uma região de surfe e vinhos.", "Margaret River es una región de surf y vinos."], ["The black swan is the symbol of Western Australia.", "O cisne-negro é o símbolo da Austrália Ocidental.", "El cisne negro es el símbolo de Australia Occidental."]],stn:["Sydney", "Bondi", "Blue Mountains", "Newcastle", "Byron Bay", "Gold Coast", "Brisbane", "Fraser Island", "Whitsundays", "Cairns", "Darwin", "Kakadu", "Alice Springs", "Uluru", "Coober Pedy", "Adelaide", "Barossa Valley", "Kangaroo Island", "Great Ocean Road", "Melbourne", "Ballarat", "Phillip Island", "Canberra", "Snowy Mountains", "Hobart", "Tasmania", "Broome", "Margaret River", "Perth"]},
 {city:'Ireland',line:'Irish Tour',color:'#169B62',ink:'#fff',flag:'ie',art:'halfpenny',arts:["halfpenny", "lighthouse", "harbour", "wave", "mountains", "kilkenny", "boat", "reginald", "rock", "church", "harbour", "boat", "blarney", "houses", "mountains", "boat", "houses", "kingjohn", "church", "houses", "cliff", "spanisharch", "mountains", "houses", "mountains", "kingjohn", "houses", "rock", "rock", "church"],welcome:'Ireland',phrase:'It’ll be grand!',tr:{"pt": "Vai dar tudo certo!", "es": "¡Todo irá bien!"},sp:[["The Ha’penny Bridge opened in 1816 and cost a halfpenny to cross.", "A ponte Ha’penny abriu em 1816 e custava meio penny para atravessar.", "El puente Ha’penny abrió en 1816 y costaba medio penique cruzarlo."], ["Howth is a fishing village with a lighthouse, just 30 minutes from Dublin.", "Howth é uma vila de pescadores com farol, a 30 minutos de Dublin.", "Howth es un pueblo de pescadores con faro, a 30 minutos de Dublín."], ["Dún Laoghaire is a harbour town famous for its long stone piers.", "Dún Laoghaire é uma cidade portuária famosa pelos longos molhes de pedra.", "Dún Laoghaire es una ciudad portuaria famosa por sus largos muelles."], ["Bray is a seaside town with a famous cliff walk.", "Bray é uma cidade à beira-mar com uma famosa trilha nos penhascos.", "Bray es una ciudad costera con un famoso sendero en los acantilados."], ["Glendalough means “valley of two lakes”.", "Glendalough significa “vale dos dois lagos”.", "Glendalough significa «valle de los dos lagos»."], ["Kilkenny Castle dates back to the 12th century.", "O castelo de Kilkenny é do século XII.", "El castillo de Kilkenny es del siglo XII."], ["Wexford has a famous opera festival every autumn.", "Wexford tem um famoso festival de ópera todo outono.", "Wexford tiene un famoso festival de ópera cada otoño."], ["Waterford was founded by Vikings and is Ireland’s oldest city.", "Waterford foi fundada pelos vikings e é a cidade mais antiga da Irlanda.", "Waterford fue fundada por vikingos y es la ciudad más antigua de Irlanda."], ["The Rock of Cashel was home to the kings of Munster.", "A Rocha de Cashel foi a casa dos reis de Munster.", "La Roca de Cashel fue el hogar de los reyes de Munster."], ["Cork is called the rebel county and has a lively English Market.", "Cork é chamada de condado rebelde e tem o animado English Market.", "Cork se llama el condado rebelde y tiene el animado English Market."], ["Cobh was the Titanic’s last port of call in 1912.", "Cobh foi a última parada do Titanic, em 1912.", "Cobh fue la última escala del Titanic en 1912."], ["Kinsale is known as the gourmet capital of Ireland.", "Kinsale é conhecida como a capital gastronômica da Irlanda.", "Kinsale es conocida como la capital gastronómica de Irlanda."], ["They say that kissing the Blarney Stone gives you the gift of the gab!", "Dizem que beijar a Pedra de Blarney dá o dom da conversa!", "Dicen que besar la Piedra de Blarney da el don de la palabra."], ["Skibbereen is a lively market town in West Cork.", "Skibbereen é uma animada cidade de mercado no oeste de Cork.", "Skibbereen es un animado pueblo de mercado en el oeste de Cork."], ["Killarney National Park shelters Ireland’s native red deer.", "O Parque Nacional de Killarney abriga os cervos-vermelhos nativos da Irlanda.", "El Parque Nacional de Killarney alberga los ciervos rojos nativos de Irlanda."], ["Dingle’s harbour is home to a friendly dolphin called Fungie.", "O porto de Dingle era o lar de um golfinho simpático chamado Fungie.", "El puerto de Dingle era el hogar de un delfín simpático llamado Fungie."], ["Tralee hosts the Rose of Tralee festival every year.", "Tralee recebe todo ano o festival Rose of Tralee.", "Tralee celebra cada año el festival Rose of Tralee."], ["The funny five-line poem called a limerick is said to be named after this city.", "Dizem que o poema engraçado de cinco versos, o limerick, leva o nome desta cidade.", "Dicen que el poema gracioso de cinco versos, el limerick, lleva el nombre de esta ciudad."], ["Adare is often called the prettiest village in Ireland.", "Adare é frequentemente chamada de vilarejo mais bonito da Irlanda.", "Adare suele llamarse el pueblo más bonito de Irlanda."], ["Ennis is a lively town and a centre of traditional Irish music.", "Ennis é uma cidade animada e centro da música tradicional irlandesa.", "Ennis es una ciudad animada y centro de la música tradicional irlandesa."], ["The Cliffs of Moher rise 214 metres above the Atlantic.", "Os Penhascos de Moher se erguem 214 metros acima do Atlântico.", "Los Acantilados de Moher se elevan 214 metros sobre el Atlántico."], ["Galway was a European Capital of Culture in 2020.", "Galway foi Capital Europeia da Cultura em 2020.", "Galway fue Capital Europea de la Cultura en 2020."], ["Connemara is famous for its wild hills, lakes and small ponies.", "Connemara é famosa por colinas selvagens, lagos e pôneis pequenos.", "Connemara es famosa por sus colinas salvajes, lagos y ponis pequeños."], ["Westport is next to Croagh Patrick, Ireland’s holy mountain.", "Westport fica ao lado do Croagh Patrick, a montanha sagrada da Irlanda.", "Westport está junto al Croagh Patrick, la montaña sagrada de Irlanda."], ["Sligo is the land of the poet W. B. Yeats.", "Sligo é a terra do poeta W. B. Yeats.", "Sligo es la tierra del poeta W. B. Yeats."], ["County Donegal is known for its wool tweed.", "O condado de Donegal é conhecido por seu tweed de lã.", "El condado de Donegal es conocido por su tweed de lana."], ["Athlone sits in the middle of Ireland, on the River Shannon.", "Athlone fica no meio da Irlanda, no Rio Shannon.", "Athlone está en el centro de Irlanda, junto al río Shannon."], ["Kildare is the home of Irish horse racing.", "Kildare é o berço das corridas de cavalos da Irlanda.", "Kildare es la cuna de las carreras de caballos de Irlanda."], ["Newgrange is older than the Pyramids and Stonehenge.", "Newgrange é mais antigo que as Pirâmides e Stonehenge.", "Newgrange es más antiguo que las Pirámides y Stonehenge."], ["Drogheda is a historic town on the River Boyne.", "Drogheda é uma cidade histórica às margens do Rio Boyne.", "Drogheda es una ciudad histórica a orillas del río Boyne."]],stn:["Dublin", "Howth", "Dún Laoghaire", "Bray", "Glendalough", "Kilkenny", "Wexford", "Waterford", "Cashel", "Cork", "Cobh", "Kinsale", "Blarney", "Skibbereen", "Killarney", "Dingle", "Tralee", "Limerick", "Adare", "Ennis", "Cliffs of Moher", "Galway", "Connemara", "Westport", "Sligo", "Donegal", "Athlone", "Kildare", "Newgrange", "Drogheda"]}
];

/* ---------- sound (WebAudio, same flag as the exercises) ---------- */
var ac=null;
function sndOn(){try{return localStorage.getItem('bl-duo-snd')!=='0';}catch(e){return true;}}
function ctx(){try{ac=ac||new (W.AudioContext||W.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(e){}return ac;}
function tone(f,t0,dd,type,g,f2){var c=ctx();if(!c||!sndOn())return;try{var o=c.createOscillator(),v=c.createGain(),t=c.currentTime+t0;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dd);v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g||.15,t+.015);v.gain.exponentialRampToValueAtTime(.0001,t+dd);o.connect(v);v.connect(c.destination);o.start(t);o.stop(t+dd+.05);}catch(e){}}
function tick(){tone(523,0,.11,'sine',.05);tone(784,0,.07,'sine',.014);}
function dingdong(){tone(784,0,.9,'sine',.17);tone(1568,0,.4,'sine',.05);tone(587.3,.42,1.1,'sine',.17);tone(1174.6,.42,.45,'sine',.05);}
function whistle(){tone(880,0,.55,'triangle',.1,1250);tone(884,0,.55,'sine',.05,1260);tone(1320,.62,.35,'triangle',.07,1100);}
function chug(n){for(var i=0;i<n;i++)tone(120,i*.22,.1,'square',.035,60);}
function buzz(){tone(233,0,.2,'triangle',.12);tone(175,.1,.25,'triangle',.11);}

/* ---------- css ---------- */
var CSS=
'body.bl-mg main>:not(#bl-metro){display:none!important}body.bl-mg main{padding-bottom:96px}:root:root body.bl-mg,:root[data-theme="light"]:root body.bl-mg{background:var(--bg)!important}'+
'#bl-metro{--lc:#dc241f;--n0:#0b1733;--n1:#12214a;--n2:#2b4070;--cr:#f4f1e8;--mu:#9fb0d0;--go:#e8b923;max-width:440px;margin:0 auto;color:var(--cr);font-family:var(--font-body,system-ui,Arial,sans-serif);position:relative;background:#0b1733;border-radius:24px;padding:10px 12px 22px;box-shadow:0 0 0 2px #2b4070}'+
'#bl-metro *{box-sizing:border-box}'+
'#bl-metro .top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 2px 10px}'+
'#bl-metro .av{width:42px;height:42px;border-radius:50%;border:3px solid var(--go);overflow:hidden;background:#fff;padding:0;cursor:pointer;flex:none}#bl-metro .av svg,#bl-metro .av img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro .lk{display:flex;align-items:center;gap:8px}#bl-metro .lk img{height:34px;width:auto}#bl-metro .lk b{display:block;font:700 17px Georgia,serif;letter-spacing:.06em;line-height:1}#bl-metro .lk i{display:block;font:600 8px sans-serif;letter-spacing:.32em;color:#e0524c;font-style:normal;margin-top:3px}'+
'#bl-metro .fl{font:700 15px sans-serif;min-width:42px;text-align:right}'+
'#bl-metro .sheet .ss{margin-top:6px;font-size:1.3rem;letter-spacing:.08em;line-height:1}#bl-metro .sheet .ss .on{color:#e8b923;text-shadow:0 0 8px rgba(232,185,35,.5)}#bl-metro .sheet .ss .off{color:#2b4070}#bl-metro .sheet .ss em{font:700 .8rem sans-serif;font-style:normal;margin-left:10px;color:#9fb0d0;letter-spacing:0}#bl-metro .sum{margin:2px 2px 4px;font:600 12px sans-serif;color:#9fb0d0}#bl-metro .sum b{color:#e8b923}'+
'#bl-metro .hd{display:flex;align-items:center;gap:12px;background:var(--n1);border:2px solid var(--n2);border-radius:16px;padding:12px 14px;margin-bottom:6px}'+
'#bl-metro .flag{width:54px;height:36px;border-radius:5px;overflow:hidden;flex:none;box-shadow:0 0 0 2px #fff,0 3px 0 2px rgba(0,0,0,.4)}#bl-metro .flag svg,#bl-metro .flag img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro .hd .tx{flex:1;min-width:0}#bl-metro .hd small{display:block;font:700 10px sans-serif;letter-spacing:.14em;color:var(--go);text-transform:uppercase}#bl-metro .hd b{display:block;font:700 16px sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'#bl-metro .rnd{width:36px;height:36px;border-radius:50%;background:#fff;border:7px solid var(--lc);display:flex;align-items:center;justify-content:center;color:#10224a;font:800 13px sans-serif;flex:none}'+
'#bl-metro .map{display:block;width:100%;height:auto;margin-top:4px}'+
'#bl-metro .map text{font-family:system-ui,Arial,sans-serif}#bl-metro .stg{outline:none;cursor:pointer;-webkit-tap-highlight-color:transparent}#bl-metro .stg:focus-visible circle.hit{stroke:#4fc3f7;stroke-width:3}'+
'#bl-metro .in{animation:mt-casc .45s cubic-bezier(.3,1.5,.5,1) both;transform-box:fill-box;transform-origin:center}'+
'#bl-metro .pulse{transform-box:fill-box;transform-origin:center;animation:mt-ring 1.6s ease-in-out infinite}#bl-metro .lion{transform-box:fill-box;transform-origin:50% 90%;animation:mt-sway 1.6s ease-in-out infinite}'+
'#bl-metro .pop{animation:mt-pop .55s cubic-bezier(.3,1.7,.5,1);transform-box:fill-box;transform-origin:center}#bl-metro .shk{animation:mt-shk .4s;transform-box:fill-box;transform-origin:center}'+
'@keyframes mt-casc{from{opacity:0;transform:translateY(14px) scale(.7)}to{opacity:1;transform:none}}@keyframes mt-ring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.35);opacity:.12}}'+
'@keyframes mt-sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg) scale(1.06)}}@keyframes mt-pop{0%{transform:scale(.6)}60%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes mt-shk{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'+
'#bl-metro .toast{position:fixed;left:50%;bottom:90px;transform:translate(-50%,20px);background:#fff;color:#10224a;font:700 13px sans-serif;padding:9px 14px;border-radius:12px;opacity:0;pointer-events:none;transition:all .3s;z-index:60;max-width:86vw;text-align:center}#bl-metro .toast.on{opacity:1;transform:translate(-50%,0)}'+
'#bl-metro .sign{position:fixed;left:50%;bottom:84px;transform:translate(-50%,40px);opacity:0;transition:all .45s cubic-bezier(.3,1.4,.5,1);z-index:55;pointer-events:none;width:min(86vw,340px)}#bl-metro .sign.on{opacity:1;transform:translate(-50%,0)}'+
'#bl-metro .plate{background:#fff;border-radius:14px;padding:12px 14px 10px;text-align:center;box-shadow:0 8px 0 rgba(0,0,0,.35);color:#10224a}#bl-metro .plate small{display:block;font:700 9.5px sans-serif;letter-spacing:.16em;color:#5a6a8c;margin-bottom:6px}'+
'#bl-metro .plate .art{border-radius:9px;height:84px;display:flex;justify-content:center;overflow:hidden;margin-bottom:8px}#bl-metro .plate .art svg{height:84px;width:auto}'+
'#bl-metro .pbar{background:#1d3f8a;border-radius:4px;color:#fff;font:700 15px sans-serif;padding:7px}#bl-metro .plate .ph{margin-top:8px;font:700 13px sans-serif}#bl-metro .plate .pt{font:500 11px sans-serif;color:#5a6a8c}'+
'#bl-metro .wel{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;text-align:center;background:rgba(5,11,28,.94);animation:mt-fade .4s both;cursor:pointer}#bl-metro .wel.out{opacity:0;transition:opacity .5s;pointer-events:none}'+
'#bl-metro .wel .fw{width:190px;height:120px;margin:0 auto 18px;border-radius:8px;overflow:hidden;box-shadow:0 0 0 4px #fff,0 10px 0 4px rgba(0,0,0,.4);transform:rotate(-3deg);animation:mt-wave 1.8s ease-in-out infinite}#bl-metro .wel .fw svg,#bl-metro .wel .fw img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro .wel small{display:block;font:700 11px sans-serif;letter-spacing:.2em;color:var(--go)}#bl-metro .wel h2{margin:6px 0 8px;font:800 30px Georgia,serif;line-height:1.1;color:#fff}#bl-metro .wel .ln{display:inline-flex;align-items:center;gap:8px;font:700 12px sans-serif;color:#fff}#bl-metro .wel .ln i{width:30px;height:9px;border-radius:5px;background:var(--lc)}'+
'@keyframes mt-fade{from{opacity:0}to{opacity:1}}@keyframes mt-wave{0%,100%{transform:rotate(-3deg) skewY(0)}50%{transform:rotate(-1deg) skewY(2deg)}}'+
'#bl-metro .tabbar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;justify-content:center;gap:6px;background:#0e1c3f;border-top:2px solid var(--n2);padding:6px 10px calc(6px + env(safe-area-inset-bottom,0px))}'+
'#bl-metro .tab{flex:1;max-width:140px;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:52px;font:700 10px sans-serif;color:var(--mu);background:transparent;border:2px solid transparent;border-radius:12px;cursor:pointer;padding:4px 6px;transition:transform .12s}#bl-metro .tab b{font-size:22px;line-height:1.1}#bl-metro .tab:active{transform:translateY(3px) scale(.96)}#bl-metro .tab[aria-selected=true]{border-color:#4fc3f7;background:var(--n1);color:#fff}'+
'#bl-metro h3{font:700 11px sans-serif;letter-spacing:.14em;color:var(--mu);text-transform:uppercase;margin:16px 0 8px}'+
'#bl-metro .acts{display:flex;gap:6px;margin:10px 0 8px}#bl-metro .act{flex:1;min-width:0;position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:6px 8px;border:2px solid var(--n2);border-radius:12px;background:transparent;color:var(--cr);cursor:pointer;text-align:left;transition:transform .1s}#bl-metro .act i{position:absolute;bottom:8px;right:8px;width:8px;height:8px;border-radius:50%;background:var(--ac)}#bl-metro .act b{font:700 11.5px sans-serif;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#bl-metro .act small{font:600 9.5px sans-serif;color:var(--mu)}#bl-metro .act:active{transform:scale(.96)}#bl-metro .act.on{border-color:var(--ac);background:var(--n1)}'+
'#bl-metro .mapscroll{height:min(64vh,560px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border-radius:18px;scrollbar-width:none}#bl-metro .mapscroll::-webkit-scrollbar{display:none}#bl-metro .mapscroll svg{display:block}'+
'#bl-metro .ph0{text-align:center;margin-top:8px}#bl-metro .big{width:116px;height:116px;border-radius:50%;margin:0 auto;border:6px solid var(--lc);box-shadow:0 0 0 4px #fff,0 0 28px color-mix(in srgb,var(--lc) 55%,transparent);overflow:hidden;background:#fff;padding:0;display:block}#bl-metro .big svg,#bl-metro .big img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro h2.nm{margin:12px 0 0;font:700 21px Georgia,serif}#bl-metro .sub{font:700 10px sans-serif;letter-spacing:.14em;color:var(--go);margin-top:4px;text-transform:uppercase}'+
'#bl-metro .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}#bl-metro .stats div{background:var(--n1);border:2px solid var(--n2);border-radius:12px;padding:8px 4px;text-align:center}#bl-metro .stats b{display:block;font:800 20px sans-serif}#bl-metro .stats small{font:600 10px sans-serif;color:var(--mu)}'+
'#bl-metro .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}#bl-metro .md{text-align:center;animation:mt-casc .5s both}#bl-metro .md .c{width:54px;height:54px;border-radius:50%;margin:0 auto 4px;background:radial-gradient(circle at 35% 30%,#ffe68a,#e8b923);display:flex;align-items:center;justify-content:center;font-size:25px;box-shadow:0 3px 0 #9a7a10;position:relative;overflow:hidden}'+
'#bl-metro .md:not(.off) .c::after{content:"";position:absolute;top:-30%;left:-60%;width:40%;height:160%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);transform:rotate(20deg);animation:mt-shine 3.2s ease-in-out infinite}@keyframes mt-shine{0%,60%{left:-60%}100%{left:130%}}'+
'#bl-metro .md small{font:600 10px sans-serif;color:#cdd6ea}#bl-metro .md.off .c{background:var(--n1);box-shadow:none;filter:grayscale(1);opacity:.45}'+
'#bl-metro .week{display:flex;gap:6px}#bl-metro .d{flex:1;height:52px;border-radius:10px;background:var(--n1);border:2px solid var(--n2);text-align:center;font-size:17px;padding-top:4px}#bl-metro .d.f{border-color:var(--go)}#bl-metro .d small{display:block;font:700 9px sans-serif;color:var(--mu)}'+
'#bl-metro .row{display:flex;align-items:center;gap:10px;background:var(--n1);border:2px solid var(--n2);border-radius:12px;padding:9px 12px;margin-bottom:6px}#bl-metro .row i{width:8px;height:30px;border-radius:4px;background:var(--lc);flex:none}#bl-metro .row div{flex:1;min-width:0}#bl-metro .row b{display:block;font:700 13px sans-serif}#bl-metro .row small{font:500 10px sans-serif;color:var(--mu)}#bl-metro .row span{font:700 12px sans-serif;color:var(--go)}'+
'#bl-metro a.mb,#bl-metro button.mb{display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;width:100%;border:0;border-radius:14px;background:var(--go);color:#2a2000;font:700 15px sans-serif;text-decoration:none;box-shadow:0 4px 0 #9a7a10;cursor:pointer;margin-top:10px;transition:transform .1s,box-shadow .1s}#bl-metro a.mb:active,#bl-metro button.mb:active{transform:translateY(4px);box-shadow:0 0 0 #9a7a10}#bl-metro a.mb.alt{background:var(--n1);color:#fff;border:2px solid var(--n2);box-shadow:0 4px 0 #050b1c}'+
'#bl-metro .sheet{position:fixed;inset:0;z-index:70;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,11,28,.6)}#bl-metro .sheet>div{width:min(100%,440px);background:var(--n0);border:2px solid var(--n2);border-bottom:0;border-radius:22px 22px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));animation:mt-up .3s cubic-bezier(.3,1.2,.5,1)}@keyframes mt-up{from{transform:translateY(100%)}to{transform:none}}'+
'#bl-metro .sheet h4{margin:0 0 2px;font:700 18px sans-serif}#bl-metro .sheet p{margin:0 0 6px;font:600 11px sans-serif;letter-spacing:.1em;color:var(--go);text-transform:uppercase}'+
'@media (prefers-reduced-motion:reduce){#bl-metro *{animation:none!important;transition:none!important}}';

/* ---------- helpers ---------- */
function el(n,a,p){var e=D.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function h(tag,cls,html){var e=D.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e;}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var VH=520;
function genRoute(seed){
  var r=rng(seed),x=70+r()*200,y=34,pts=[[x,y],[x,y+46]],last='d',guard=0;y+=46;
  while(y<VH-6&&guard++<300){
    var ks=['d','se','sw','d','se','sw','e','w'].filter(function(k){return k!==last&&!((k==='e'||k==='w')&&(last==='e'||last==='w'));});
    var k=ks[Math.floor(r()*ks.length)],len=50+r()*60,nx=x,ny=y;
    if(k==='d')ny=y+len;else if(k==='se'){nx=x+len*.8;ny=y+len*.8;}else if(k==='sw'){nx=x-len*.8;ny=y+len*.8;}else if(k==='e')nx=x+len*.7;else nx=x-len*.7;
    if(nx<44||nx>296)continue;
    ny=Math.min(ny,VH);pts.push([+nx.toFixed(1),+ny.toFixed(1)]);x=nx;y=ny;last=k;
  }
  if(pts[pts.length-1][1]<VH-6)pts.push([pts[pts.length-1][0],VH]);
  return pts;
}
function pathD(r){return 'M'+r.map(function(p){return p[0]+' '+p[1];}).join(' L');}
function spaced(r,n){
  var pa=el('path',{d:pathD(r)}),L=pa.getTotalLength(),q=[];
  for(var i=0;i<n;i++)q.push(pa.getPointAtLength(L*(.02+.96*i/Math.max(1,n-1))));
  for(var i=0;i<n;i++)for(var j=i+1;j<n;j++){var dx=q[i].x-q[j].x,dy=q[i].y-q[j].y;if(Math.sqrt(dx*dx+dy*dy)<(j-i===1?44:78))return false;}
  return true;
}
function newRoute(n){var r,k=0;do{r=genRoute((Math.random()*1e9)|0);}while(!spaced(r,n)&&k++<400);return r;}

function pickCity(){
  var k='bl-metro-city',i=0;
  try{i=(parseInt(localStorage.getItem(k),10)+1);if(!(i>=0))i=0;i=i%CITIES.length;localStorage.setItem(k,String(i));}catch(e){i=Math.floor(Math.random()*CITIES.length);}
  return i;
}

/* ---------- long route: one continuous line, 45-degree bends, no horizontal runs ---------- */
function genRouteH(seed,H){
  var r=rng(seed),x=90+r()*160,y=34,pts=[[x,y],[x,y+50]],last='d',guard=0;y+=50;
  while(y<H-6&&guard++<6000){
    var ks=['d','se','sw','d','se','sw'].filter(function(k){return k!==last;});
    var k=ks[Math.floor(r()*ks.length)],len=60+r()*70,nx=x,ny=y;
    if(k==='d')ny=y+len;else if(k==='se'){nx=x+len*.8;ny=y+len*.8;}else{nx=x-len*.8;ny=y+len*.8;}
    if(nx<52||nx>288)continue;
    pts.push([+nx.toFixed(1),+ny.toFixed(1)]);x=nx;y=ny;last=k;
  }
  return pts;
}
function genLong(seed,need){
  var H=need*.78,pts,L=0,g=0;
  do{pts=genRouteH(seed,H);L=el('path',{d:pathD(pts)}).getTotalLength();H*=1.12;}while(L<need&&g++<12);
  return pts;
}
function cityIdx(name){for(var i=0;i<CITIES.length;i++)if(CITIES[i].city===name)return i;return -1;}

/* ---------- mount ---------- */
function mount(c,o){
  /* o: {upto,max,best,acts:[{key,label,city,done(l),links:[{t,href}],doneCount}] (one metro per activity), done(l)+links (single metro), stages:[[a,b]...]} */
  var tx=T(),upto=o.upto||0,max=o.max||206,best=o.best||{},profile=(c&&c.profile)||{};
  var acts=o.acts&&o.acts.length?o.acts:[{key:'main',label:'',city:null,done:o.done,links:o.links,doneCount:o.doneCount}];
  var multi=acts.length>1,ai=0,A,C,cur=0,dn,S=88;
  var st=D.createElement('style');st.textContent=CSS;D.head.append(st);
  D.body.classList.add('bl-mg');
  var main=D.querySelector('main')||D.body,root=h('div');root.id='bl-metro';main.append(root);
  var firstCity=-1;
  function curOf(a){for(var l=1;l<=Math.min(upto,max);l++){if(!a.done(l))return l;}return 0;}
  function useAct(i){
    ai=i;A=acts[i];var ci=A.city?cityIdx(A.city):-1;if(ci<0){if(firstCity<0)firstCity=pickCity();ci=firstCity;}
    C=CITIES[ci];dn=A.done;cur=curOf(A);root.style.setProperty('--lc',C.color);
    try{localStorage.setItem('bl-metro-act',A.key);}catch(e){}
  }
  var s0=0;try{var sa=localStorage.getItem('bl-metro-act');for(var q=0;q<acts.length;q++)if(acts[q].key===sa)s0=q;}catch(e){}
  useAct(s0);
  var streak={cur:0,best:0,last:''};
  var tab='home',busy=false,quick=false,routes={},mapEl,pathEl,fillEl,trainEl,Ltot=0,lens=[],signEl,toastEl,scEl,scale=1,VHL=0;
  var lessonsDone=A.doneCount||o.doneCount||0;
  function posKey(){return A.key==='main'?'bl-metro-pos':'bl-metro-pos-'+A.key;}
  function stn(i){return C.stn[i%C.stn.length];}

  function say(t){toastEl.textContent=t;toastEl.classList.add('on');clearTimeout(say.t);say.t=setTimeout(function(){toastEl.classList.remove('on');},1900);}
  var welDone=false,pend=null,wq=[];
  function onWel(fn){if(welDone)setTimeout(fn,350);else wq.push(fn);}
  function plateLater(i){if(welDone)plate(i);else pend=i;}
  function plate(i){
    var ink=C.ink==='#fff'?'#fff':'#1a1a1a',svg=ARTS[(C.arts&&C.arts[i%C.arts.length])||C.art].replace(/#fff/g,ink).replace(/@C/g,C.color),tr=C.tr[lang()]||C.tr.pt||'';
    signEl.innerHTML='<div class="plate"><small>'+C.city.toUpperCase()+' · '+tx.here+'</small><div class="art" style="background:'+C.color+'"><svg viewBox="0 0 150 150" aria-hidden="true">'+svg+'</svg></div><div class="pbar"></div><div class="ph"></div><div class="pt"></div></div>';
    signEl.querySelector('.pbar').textContent=stn(i);var sp=C.sp&&C.sp[i%C.stn.length];if(sp){var L=lang();tr=L==='pt'?sp[1]:sp[2];signEl.querySelector('.ph').textContent='“'+sp[0]+'”';}else signEl.querySelector('.ph').textContent='“'+C.phrase+'”';signEl.querySelector('.pt').textContent=tr;
    signEl.classList.add('on');clearTimeout(plate.t);plate.t=setTimeout(function(){signEl.classList.remove('on');},4200);
  }
  function pt(len){return pathEl.getPointAtLength(Math.max(0,Math.min(Ltot,len)));}
  function ang(len){var a=pt(len-3),b=pt(len+3);return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI-90;}
  function setProg(len){fillEl.style.strokeDashoffset=Ltot-len;var p=pt(len);trainEl.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+ang(len)+')');}
  function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
  function reduced(){return W.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;}
  /* camera: scroll the map so a point of the line sits near the middle of the window */
  function camY(y,smooth){if(!scEl)return;var top=Math.max(0,y*scale-scEl.clientHeight*.5);if(smooth&&!reduced())scEl.scrollTo({top:top,behavior:'smooth'});else scEl.scrollTop=top;}
  function sheet(l){
    var s=h('div','sheet'),b=h('div'),p=h('p'),t=h('h4');p.textContent=stn(l-1)+(A.label?' · '+A.label:'');t.textContent=tx.lesson+' '+l;b.append(p,t);
    var sn=A.stars?A.stars(l):0;if(sn>0){var ss=h('div','ss'),pc=A.pct?A.pct(l):null;ss.setAttribute('aria-label',sn+' / 3');ss.innerHTML='<span class="on">'+'★'.repeat(sn)+'</span><span class="off">'+'★'.repeat(3-sn)+'</span>'+(pc!=null?'<em>'+Math.round(pc*100)+'%</em>':'');b.append(ss);}
    var first=true;(A.links||[]).forEach(function(k){var a=h('a','mb'+(first?'':' alt'));a.href=k.href;a.textContent=k.t;a.addEventListener('click',tick);b.append(a);first=false;});
    s.append(b);s.addEventListener('click',function(e){if(e.target===s)s.remove();});root.append(s);
  }
  function tap(i){
    var l=i+1;if(busy)return;ctx();tick();
    if(l>upto||(cur&&l>cur)){var g=mapEl.querySelector('[data-i="'+i+'"] .in');g.classList.remove('shk');void g.getBoundingClientRect();g.classList.add('shk');buzz();say(tx.locked);return;}
    sheet(l);
  }
  function build(){
    mapEl.textContent='';
    var key=A.key;if(!routes[key]){var sd=0;for(var q=0;q<key.length;q++)sd=(sd*31+key.charCodeAt(q))|0;routes[key]=genLong(sd+7,max*S+120);}
    var route=routes[key];
    pathEl=el('path',{d:pathD(route),fill:'none'},mapEl);pathEl.style.display='none';Ltot=pathEl.getTotalLength();
    var ym=0;route.forEach(function(p){if(p[1]>ym)ym=p[1];});VHL=Math.ceil(Math.max(ym,Ltot*.6)+40);
    mapEl.setAttribute('viewBox','0 0 340 '+VHL);mapEl.setAttribute('height',Math.round(VHL*(mapEl.clientWidth||340)/340));
    lens=[];for(var i=0;i<max;i++)lens.push(40+S*i);
    var endLen=Math.min(Ltot,lens[max-1]+30);
    el('path',{d:pathD(route),fill:'none',stroke:'#2b4070','stroke-width':12,'stroke-linecap':'round','stroke-linejoin':'round'},mapEl);
    fillEl=el('path',{d:pathD(route),fill:'none',stroke:C.color,'stroke-width':12,'stroke-linecap':'round','stroke-linejoin':'round'},mapEl);
    fillEl.style.strokeDasharray=Ltot+' '+Ltot;fillEl.style.strokeDashoffset=Ltot;
    for(var i=0;i<max;i++){
      var l=i+1,p=pt(lens[i]),right=p.x<175,locked=l>upto||(cur&&l>cur),isCur=l===cur,isDone=!locked&&!isCur&&(cur?l<cur:true),rr=isCur?24:11;
      var g=el('g',{transform:'translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')','class':'stg',tabindex:0,role:'button','data-i':i},mapEl);
      g.setAttribute('aria-label',tx.lesson+' '+l+', '+stn(i)+(isDone?', ✓':isCur?', '+tx.here:', 🔒'));
      var inn=el('g',{'class':'in'},g);inn.style.animation='none';
      el('rect',{x:right?-(rr+10):-(rr+10)-150,y:-38,width:rr+10+150,height:64,fill:'transparent'},inn);el('circle',{'class':'hit',r:rr+10,fill:'transparent'},inn);
      if(isCur){el('circle',{r:rr+7,fill:'#fff','class':'pulse'},inn);el('circle',{r:rr,fill:C.color,stroke:'#fff','stroke-width':6},inn);el('image',{href:B+'img/lion-gold.png',x:-13,y:-15,width:26,height:30,'class':'lion'},inn);}
      else if(isDone){el('circle',{r:rr,fill:'#fff',stroke:C.color,'stroke-width':5},inn);el('path',{d:'M-4 0L-1 3.5L5 -4',stroke:'#10224a','stroke-width':2.4,fill:'none','stroke-linecap':'round'},inn);
        var sn=A.stars?A.stars(l):0;
        if(sn>0){var SP='M0-4.6L1.35-1.5L4.7-1.2L2.2 1L2.9 4.3L0 2.6L-2.9 4.3L-2.2 1L-4.7-1.2L-1.35-1.5Z';
          for(var q=0;q<3;q++){var pa=pt(Math.max(0,lens[i]-4)),pb=pt(lens[i]+4),tx2=pb.x-pa.x,ty2=pb.y-pa.y,nx=-ty2,ny=tx2;if(right?nx>0:nx<0){nx=-nx;ny=-ny;}var an2=Math.atan2(ny,nx)*180/Math.PI+(q-1)*40,rad=rr+9.5,sx=rad*Math.cos(an2*Math.PI/180),sy=rad*Math.sin(an2*Math.PI/180);
            el('path',{d:SP,transform:'translate('+sx.toFixed(1)+' '+sy.toFixed(1)+') scale(1.15)',fill:q<sn?'#e8b923':'#0b1733',stroke:q<sn?'#fff3b0':'#2b4070','stroke-width':1,'stroke-linejoin':'round'},inn);}}
      }
      else el('circle',{r:rr,fill:'#0b1733',stroke:'#2b4070','stroke-width':5},inn);
      var lx=right?rr+14:-(rr+14),an=right?'start':'end',dim=locked;
      var X=function(txt,y,sz,w,col,ls){var t=el('text',{x:lx,y:y,'text-anchor':an,'font-size':sz,'font-weight':w,fill:col,'letter-spacing':ls||0},inn);t.textContent=txt;};
      if(isCur){var tw=ES?104:96,rx=right?lx:lx-tw;el('rect',{x:rx,y:-34,width:tw,height:16,rx:8,fill:'#e8b923'},inn);var tg=el('text',{x:rx+tw/2,y:-22.5,'text-anchor':'middle','font-size':9,'font-weight':700,fill:'#2a2000','letter-spacing':'.8'},inn);tg.textContent=tx.here;}
      X(tx.lesson+' '+l,-6,13.5,700,dim?'#7d8db3':'#f4f1e8');
      X(stn(i).toUpperCase(),12,9,700,dim?'#5f6f96':(C.color==='#E3001B'||C.color==='#dc241f'?'#ff8a80':C.color),'.4');
      g.addEventListener('click',function(e){tap(+e.currentTarget.getAttribute('data-i'));});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tap(+e.currentTarget.getAttribute('data-i'));}});
    }
    trainEl=el('g',{opacity:0,'pointer-events':'none'},mapEl);
    el('rect',{x:-11,y:-16,width:22,height:32,rx:7,fill:C.color,stroke:'#fff','stroke-width':2.5},trainEl);el('rect',{x:-7,y:-12,width:14,height:8,rx:2,fill:'#1d3f8a'},trainEl);
    el('circle',{cx:-4,cy:9,r:2,fill:'#fff'},trainEl);el('circle',{cx:4,cy:9,r:2,fill:'#fff'},trainEl);
    var ci=cur?cur-1:Math.max(0,Math.min(upto,max)-1);setProg(lens[ci]);
  }
  function fillTo(idx,ms){fillEl.style.transition='stroke-dashoffset '+ms+'ms cubic-bezier(.45,.05,.4,1)';fillEl.style.strokeDashoffset=Ltot-lens[Math.max(0,Math.min(max-1,idx))];}
  function switchAct(i){if(busy||i===ai)return;ctx();tick();useAct(i);lessonsDone=A.doneCount||o.doneCount||0;quick=true;view();}

  /* ----- views ----- */
  function homeView(box){
    var hd=h('div','hd');
    var f=h('div','flag',flagHTML(C)),t=h('div','tx'),rn=h('div','rnd');
    t.innerHTML='<small></small><b></b>';t.firstChild.textContent=C.city+' · '+C.line;
    var stg=1;(o.stages||[]).forEach(function(r,k){if((cur||upto)>=r[0]&&(cur||upto)<=r[1])stg=k+1;});
    t.lastChild.textContent=tx.stage+' '+stg+' · '+tx.lesson+' '+(cur||Math.min(upto,max)||1);rn.textContent=stg;
    hd.append(f,t,rn);box.append(hd);
    if(multi){
      var ac=h('div','acts');ac.setAttribute('role','tablist');
      acts.forEach(function(a,i){var ci=a.city?cityIdx(a.city):0,cc=CITIES[ci>=0?ci:0];
        var b=h('button','act'+(i===ai?' on':''),'<i></i><b></b><small></small>');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(i===ai));
        b.style.setProperty('--ac',cc.color);b.querySelector('b').textContent=a.short||a.label;b.querySelector('small').textContent=cc.city;
        b.addEventListener('click',function(){switchAct(i);});ac.append(b);});
      box.append(ac);
      if(A.stars){var got=0,pos=0;for(var z=1;z<=max;z++){var zz=A.stars(z);if(zz>0){got+=zz;pos+=3;}}
        if(pos){var sm=h('div','sum');sm.innerHTML='<b>★ '+got+'</b> / '+pos+' '+tx.stars;box.append(sm);}}
    }
    if(!cur&&upto>0){var m=h('p');m.style.cssText='margin:6px 2px;font:600 13px sans-serif;color:#cdd6ea';m.textContent=tx.all;box.append(m);}
    var sc=h('div','mapscroll');scEl=sc;box.append(sc);
    var svg=el('svg',{'class':'map',width:'100%',viewBox:'0 0 340 '+(max*S+120),role:'group','aria-label':C.city});mapEl=svg;sc.append(svg);
    scale=Math.min(1.3,(sc.clientWidth||340)/340);
    build();
    var prev=0,pk=posKey();try{prev=parseInt(localStorage.getItem(pk),10)||0;localStorage.setItem(pk,String(cur||upto));}catch(e){}
    var ci=cur?cur-1:Math.max(0,Math.min(upto,max)-1);
    var qk=quick&&!reduced();quick=false;var startAt=qk?0:((cur&&prev&&prev<cur&&!reduced())?prev-1:ci);
    setTimeout(function(){scale=svg.getBoundingClientRect().width/340;camY(lens[startAt]?pt(lens[startAt]).y:0,false);},30);
    function startTrain(){
      scale=svg.getBoundingClientRect().width/340;
      if(cur&&prev&&prev<cur&&!reduced()){busy=true;fillTo(prev-1,10);whistle();setTimeout(function(){chug(6);},120);trainEl.setAttribute('opacity',1);
        var a=lens[prev-1],b=lens[ci],t0=null,dur=Math.min(4200,1500+(cur-prev)*500);
        (function fr(ts){if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/dur),len=a+(b-a)*ease(k);setProg(len);camY(pt(len).y,false);if(k<1)requestAnimationFrame(fr);else{dingdong();trainEl.setAttribute('opacity',0);plateLater(ci);busy=false;}})(performance.now());}
      else if(qk){var y0=0,y1=Math.max(0,pt(lens[ci]).y*scale-scEl.clientHeight*.5),q0=null,qd=Math.min(1100,350+ci*18);fillTo(ci,qd);
        (function qf(ts){if(q0===null)q0=ts;var k=Math.min(1,(ts-q0)/qd);scEl.scrollTop=y0+(y1-y0)*ease(k);if(k<1)requestAnimationFrame(qf);else if(cur)plateLater(ci);})(performance.now());}
      else{fillTo(ci,1200);camY(pt(lens[ci]).y,true);if(cur)plateLater(ci);}
    }
    onWel(startTrain);
  }
  function medals(){
    var s=streak,doneAll=o.stages&&o.stages[0]?(function(){for(var l=o.stages[0][0];l<=Math.min(o.stages[0][1],max);l++)if(!A.done(l)||l>upto)return false;return true;})():false;
    var perfect=false;for(var k in best)if(best[k]>=0.999)perfect=true;
    var sb=Math.max(s.best||0,s.cur||0),m=tx.m,L=lessonsDone;
    return [['⭐',m[0],L>=1],['🚇',m[1],L>=3],['🏅',m[2],L>=10],['🔥',m[3],sb>=7],['🦁',m[4],perfect],['🌟',m[5],sb>=30]];
  }
  function medalsHTML(list){return list.map(function(x,i){return '<div class="md'+(x[2]?'':' off')+'" style="animation-delay:'+(i*.07)+'s"><div class="c">'+x[0]+'</div><small>'+x[1]+'</small></div>';}).join('');}
  function trophiesView(box){
    var wk=h('div','week'),last=streak.last?new Date(streak.last+'T12:00:00'):null,today=new Date();today.setHours(12,0,0,0);
    var t=T().week.split('');
    var tl=ES?[1,2,3,4,5,6,0]:[0,1,2,3,4,5,6]; /* Monday first in Spanish, Sunday first in English */
    var ws=new Date(today);var dow=ES?(today.getDay()+6)%7:today.getDay();ws.setDate(today.getDate()-dow);
    for(var i=0;i<7;i++){var d=new Date(ws);d.setDate(ws.getDate()+i);var on=false;if(last&&streak.cur>0){var diff=Math.round((last-d)/864e5);on=diff>=0&&diff<streak.cur;}
      var e=h('div','d'+(on?' f':''),(on?'🔥':'')+'<small>'+t[i]+'</small>');wk.append(e);}
    var h1=h('h3');h1.textContent=tx.streak+' · '+streak.cur+' '+tx.days;box.append(h1,wk);
    var h2=h('h3');h2.textContent=tx.stages;box.append(h2);
    (o.stages||[]).forEach(function(r,k){if(r[0]>upto)return;var tot=0,dn=0;for(var l=r[0];l<=Math.min(r[1],upto);l++){tot++;if(A.done(l))dn++;}
      var row=h('div','row','<i></i><div><b></b><small></small></div><span></span>');row.querySelector('b').textContent=tx.stage+' '+(k+1);row.querySelector('small').textContent=r[0]+'–'+r[1];row.querySelector('span').textContent=dn+'/'+tot+(dn===tot&&tot?' ✓':'');box.append(row);});
    var h3=h('h3');h3.textContent=tx.medals;box.append(h3);var g=h('div','grid',medalsHTML(medals()));box.append(g);
  }
  function profileView(box){
    var p=h('div','ph0'),big=h('button','big');big.type='button';big.setAttribute('data-pf-av','1');big.setAttribute('aria-label',tx.pro);
    var nm=h('h2','nm');nm.className='nm';nm.textContent=profile.name||'';var sub=h('div','sub');sub.textContent=C.city+' · '+C.line;
    p.append(big,nm,sub);box.append(p);
    try{if(W.Profile&&W.Profile.paint)W.Profile.paint(big,profile.avatar,profile.id);}catch(e){}
    var stars=0;for(var k in best){var r=best[k];stars+=r>=.9?3:r>=.7?2:1;}
    var sts=h('div','stats','<div><b>'+streak.cur+'</b><small>'+tx.days+'</small></div><div><b>'+lessonsDone+'</b><small>'+tx.lessons+'</small></div><div><b>'+stars+'</b><small>'+tx.stars+'</small></div>');box.append(sts);
    var h3=h('h3');h3.textContent=tx.medals;box.append(h3,h('div','grid',medalsHTML(medals())));
    var a=h('a','mb alt');a.href='account.html';a.textContent=tx.pay;a.addEventListener('click',tick);box.append(a);
  }
  function view(){
    var box=D.getElementById('mt-view');box.textContent='';
    if(tab==='home')homeView(box);else if(tab==='tro')trophiesView(box);else profileView(box);
    Array.prototype.forEach.call(root.querySelectorAll('.tab'),function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-t')===tab));});
    var av=root.querySelector('.top .av');
    try{if(W.Profile&&av)W.Profile.paint(av,profile.avatar,profile.id);}catch(e){}
  }
  /* ----- skeleton ----- */
  var top=h('div','top');
  var av=h('button','av');av.type='button';av.setAttribute('data-pf-av','1');av.setAttribute('aria-label',tx.pro);av.addEventListener('click',function(){tick();tab='pro';view();});
  var lk=h('div','lk','<img alt="" src="'+B+'img/britland-shield.png"><div><b>BRITLAND</b><i>ACADEMY</i></div>');
  var fl=h('div','fl');fl.id='mt-fl';fl.textContent='🔥 0';
  top.append(av,lk,fl);
  var vw=h('div');vw.id='mt-view';
  signEl=h('div','sign');toastEl=h('div','toast');toastEl.setAttribute('role','status');
  var bar=h('nav','tabbar');bar.setAttribute('role','tablist');
  [['home','🏠',tx.home],['tro','🏆',tx.tro],['pro','👤',tx.pro]].forEach(function(x){var b=h('button','tab','<b>'+x[1]+'</b>'+x[2]);b.type='button';b.setAttribute('role','tab');b.setAttribute('data-t',x[0]);b.addEventListener('click',function(){if(busy)return;ctx();tick();tab=x[0];view();});bar.append(b);});
  root.append(top,vw,signEl,toastEl,bar);
  view();
  /* streak numbers (days in a row) */
  try{if(W.Gate&&Gate.sb)Gate.sb.rpc('my_streak').then(function(r){var s=r&&r.data;if(!s)return;streak={cur:s.cur||0,best:s.best||s.longest||0,last:s.last||''};D.getElementById('mt-fl').textContent='🔥 '+streak.cur;if(tab!=='home')view();}).catch(function(){});}catch(e){}
  /* welcome banner: flag + city, 2 seconds */
  var wel=h('div','wel','<div><div class="fw">'+flagHTML(C)+'</div><small>'+tx.next+'</small><h2></h2><div class="ln"><i></i><span></span></div></div>');
  wel.querySelector('h2').innerHTML=tx.welcome+'<br>';wel.querySelector('h2').append(D.createTextNode(C.welcome));wel.querySelector('.ln span').textContent=C.line;
  wel.setAttribute('role','status');root.append(wel);
  function endWel(){welDone=true;wq.splice(0).forEach(function(f){setTimeout(f,650);});if(pend!==null){var q=pend;pend=null;setTimeout(function(){plate(q);},750);}wel.classList.add('out');setTimeout(function(){wel.remove();},600);}
  wel.addEventListener('click',function(){ctx();endWel();});
  if(reduced())setTimeout(endWel,1200);else{setTimeout(function(){dingdong();},150);setTimeout(endWel,2200);}
}
W.Metro={mount:mount,gameOn:function(){try{return localStorage.getItem('bl-game')==='1';}catch(e){return false;}}};
})();
