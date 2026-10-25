<div id="root"></div>
<canvas id="confetti" hidden></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.js"></script>
<script>
(function(){
"use strict";
var React=window.React, ReactDOM=window.ReactDOM;
var html=window.htm.bind(React.createElement);
var useState=React.useState, useEffect=React.useEffect, useRef=React.useRef, useMemo=React.useMemo;

/* ============================ the cast ============================ */
/* Seven collectable champions, one per subject, plus Crown — the wildcard that never gives a
   character away: it only lets a team choose which question it wants to be asked. */
var CATS=[
  {id:"prophecy",  short:"Ezra",
   name:{en:"Ezra, the Vision Keeper",    es:"Ezra, el Guardián de las Visiones"},
   subject:{en:"Bible Prophecies",        es:"Profecías Bíblicas"},  img:"art/prophecy.webp"},
  {id:"history",   short:"Caleb",
   name:{en:"Caleb, the Time Guardian",   es:"Caleb, el Guardián del Tiempo"},
   subject:{en:"Bible History",           es:"Historia Bíblica"},    img:"art/history.webp"},
  {id:"geography", short:"Jordan",
   name:{en:"Jordan, the Explorer",       es:"Jordan, el Explorador"},
   subject:{en:"Geography",               es:"Geografía"},           img:"art/geography.webp"},
  {id:"art",       short:"Miriam",
   name:{en:"Miriam, the Melody Maker",   es:"Miriam, la Creadora de Melodías"},
   subject:{en:"Art",                     es:"Arte"},                img:"art/art.webp"},
  {id:"sports",    short:"Asher",
   name:{en:"Asher, the Champion",        es:"Asher, el Campeón"},
   subject:{en:"Sports",                  es:"Deportes"},            img:"art/sports.webp"},
  {id:"economics", short:"Levi",
   name:{en:"Levi, the Merchant",         es:"Levi, el Mercader"},
   subject:{en:"Economics",               es:"Economía"},            img:"art/economics.webp"},
  {id:"riddles",   short:"Eli",
   name:{en:"Eli, the Wise One",          es:"Eli, el Sabio"},
   subject:{en:"Riddles",                 es:"Acertijos"},           img:"art/riddles.webp"}
];
var CROWN={id:"crown", short:"Crown",
  name:{en:"Crown, the Golden Wildcard", es:"Crown, el Comodín Dorado"},
  subject:{en:"Crown", es:"Corona"}, img:"art/crown.webp"};
/* eight wheel slots: the seven subjects and the crown */
var WHEEL=CATS.concat([CROWN]);
var CAT_BY_ID={}; CATS.forEach(function(c){CAT_BY_ID[c.id]=c;}); CAT_BY_ID.crown=CROWN;

var LANGS=[{id:"es",name:"Español"},{id:"en",name:"English"}];
var DIFFS=["easy","medium","hard"];
var POINTS={easy:100,medium:200,hard:300};
var UNLOCK_BONUS=150;   /* winning a champion */
var CROWN_BONUS=200;    /* answering a crown challenge correctly */
var TEAM_COLORS=["#7428e8","#08c9cf","#ff624f","#19c97d","#ff4eb8","#2563eb","#ff9f1c","#b14ad8"];
/* Lifelines. Every team starts with one of each and earns more by playing well; no team ever
   holds more than LL_CAP of the same one, so they get spent instead of hoarded. */
var LIFELINES=[
  {id:"scroll", secs:30, mode:"extend"},
  {id:"ask",    secs:15, mode:"consult"},
  {id:"bomb",            mode:"fifty"},
  {id:"double",          mode:"second"},
  {id:"skip",            mode:"swap"}
];
var LL_CAP=3;
/* The streak. Two right in a row is worth +50, three +100, and the bonus stops climbing at
   +150 so a runaway team cannot put the match out of reach. Every STREAK_STEP in a row also
   earns a lifeline, as does winning a crown challenge. */
var STREAK_BONUS=50, STREAK_MAX_BONUS=150, STREAK_STEP=3;
function streakBonus(n){ return n>=2?Math.min(STREAK_MAX_BONUS,(n-1)*STREAK_BONUS):0; }

/* ============================ strings ============================ */
/* Every player-facing string lives here in both languages. `T` is rebuilt whenever the
   language changes, so components keep reading plain `T.key`. */
var STR={
  start:{en:"PLAY GAME",es:"JUGAR"}, howto:{en:"HOW TO PLAY",es:"CÓMO JUGAR"},
  bank:{en:"QUESTION BANK",es:"BANCO DE PREGUNTAS"}, settings:{en:"SETTINGS",es:"AJUSTES"},
  resume:{en:"CONTINUE MATCH",es:"CONTINUAR PARTIDA"},
  tagline:{en:"Explore the Bible. Collect the Champions. Win the Crown!",
           es:"Explora la Biblia. Reúne a los Campeones. ¡Gana la Corona!"},
  homeNote:{en:"A team Bible contest. Spin the wheel, answer from the Scriptures and collect all seven champions. Crown is the wildcard: it lets you choose, but you still have to answer.",
            es:"Un concurso bíblico por equipos. Gira la ruleta, responde con las Escrituras y reúne a los siete campeones. Crown es el comodín: te deja elegir, pero igual tienes que responder."},
  setup:{en:"Match setup",es:"Configuración de la partida"},
  numTeams:{en:"Number of teams",es:"Número de equipos"},
  teamName:{en:"Team name",es:"Nombre del equipo"}, color:{en:"Colour",es:"Color"},
  language:{en:"Language",es:"Idioma"},
  langHint:{en:"Changes the interface and the questions that are shown.",
            es:"Cambia la interfaz y las preguntas que se muestran."},
  difficulty:{en:"Difficulty",es:"Dificultad"},
  timeLimit:{en:"Time per question",es:"Tiempo por pregunta"},
  needed:{en:"Correct answers per champion",es:"Aciertos para conseguir un campeón"},
  neededHint:{en:"How many correct answers in a subject win that champion. A crown challenge always wins it with one.",
              es:"Cuántos aciertos en una categoría consiguen ese campeón. El reto de Crown lo consigue siempre con uno."},
  available:{en:"questions available",es:"preguntas disponibles"},
  startMatch:{en:"Start match",es:"Empezar partida"}, backHome:{en:"Home",es:"Inicio"},
  spin:{en:"SPIN",es:"GIRAR"}, spinning:{en:"…",es:"…"},
  turn:{en:"Turn",es:"Turno"}, score:{en:"Score",es:"Puntos"}, pts:{en:"pts",es:"pts"},
  turnOf:{en:"Now playing",es:"Juega ahora"}, rank:{en:"Standings",es:"Clasificación"},
  easy:{en:"Easy",es:"Fácil"}, medium:{en:"Medium",es:"Media"}, hard:{en:"Hard",es:"Difícil"},
  mixed:{en:"Mixed",es:"Mixta"}, all:{en:"All",es:"Todas"},
  correct:{en:"Correct!",es:"¡Correcto!"}, incorrect:{en:"Not quite",es:"Incorrecto"},
  timeup:{en:"Time's up",es:"Se acabó el tiempo"},
  answerWas:{en:"The answer was",es:"La respuesta era"},
  next:{en:"Next team",es:"Siguiente equipo"}, continueB:{en:"Continue",es:"Continuar"},
  unlocked:{en:"NEW CHAMPION UNLOCKED!",es:"¡NUEVO CAMPEÓN DESBLOQUEADO!"},
  collect:{en:"Collect",es:"Reclamar"}, collected:{en:"Collected",es:"Conseguido"},
  crownPower:{en:"CROWN POWER ACTIVATED!",es:"¡PODER DE CROWN ACTIVADO!"},
  crownLanded:{en:"The wheel landed on Crown",es:"La ruleta cayó en Crown"},
  crownPick:{en:"Choose the champion you want to win",es:"Elige el campeón que quieres conseguir"},
  crownIntro:{en:"Answer one special question from that subject. Right, the champion is yours. Wrong, you lose the turn.",
              es:"Responde una pregunta especial de esa categoría. Si aciertas, el campeón es tuyo. Si fallas, pierdes el turno."},
  crownQuestion:{en:"Crown challenge",es:"Reto de Crown"},
  crownMissed:{en:"The crown opportunity is lost",es:"Se pierde la oportunidad de Crown"},
  winner:{en:"Champions",es:"Campeones"}, finalScore:{en:"Final score",es:"Puntuación final"},
  summary:{en:"Match summary",es:"Resumen de la partida"},
  playAgain:{en:"Play again",es:"Jugar otra vez"}, newGame:{en:"New game",es:"Partida nueva"},
  teacher:{en:"Host panel",es:"Panel del anfitrión"},
  pause:{en:"Pause",es:"Pausar"}, unpause:{en:"Resume",es:"Reanudar"}, paused:{en:"Paused",es:"En pausa"},
  skip:{en:"Skip question",es:"Saltar pregunta"}, adjust:{en:"Adjust score",es:"Corregir puntuación"},
  chars:{en:"Champions",es:"Campeones"}, activeTeam:{en:"Active team",es:"Equipo activo"},
  review:{en:"Answer log",es:"Historial"}, restart:{en:"Restart match",es:"Reiniciar partida"},
  exit:{en:"Exit to home",es:"Salir al inicio"},
  sound:{en:"Sound effects",es:"Efectos de sonido"}, music:{en:"Music",es:"Música"},
  volume:{en:"Volume",es:"Volumen"}, low:{en:"Low",es:"Bajo"}, high:{en:"High",es:"Alto"},
  close:{en:"Close",es:"Cerrar"}, noLog:{en:"No answers yet.",es:"Todavía no hay respuestas."},
  team:{en:"Team",es:"Equipo"}, characters:{en:"Champions",es:"Campeones"},
  hits:{en:"Correct",es:"Aciertos"}, misses:{en:"Wrong",es:"Fallos"},
  crowns:{en:"Crown wins",es:"Retos de Crown"},
  addQ:{en:"New question",es:"Nueva pregunta"}, edit:{en:"Edit",es:"Editar"}, del:{en:"Delete",es:"Eliminar"},
  save:{en:"Save",es:"Guardar"}, cancel:{en:"Cancel",es:"Cancelar"},
  importT:{en:"Import",es:"Importar"}, exportT:{en:"Export",es:"Exportar"},
  copy:{en:"Copy",es:"Copiar"}, copied:{en:"Copied",es:"Copiado"},
  search:{en:"Search",es:"Buscar"}, category:{en:"Category",es:"Categoría"},
  question:{en:"Question",es:"Pregunta"}, options:{en:"Options",es:"Opciones"},
  answer:{en:"Correct answer",es:"Respuesta correcta"},
  explanation:{en:"Explanation",es:"Explicación"}, scripture:{en:"Scripture",es:"Texto bíblico"},
  verified:{en:"Verified",es:"Verificada"}, unverified:{en:"Needs review",es:"Por revisar"},
  verifyHint:{en:"Mark a question as verified only after checking it against the Bible.",
              es:"Marca una pregunta como verificada solo después de comprobarla con la Biblia."},
  bothLangs:{en:"English text",es:"Texto en inglés"}, esText:{en:"Spanish text",es:"Texto en español"},
  importHint:{en:"Paste JSON or CSV and press Import. CSV uses the same header as the export. Rows with one language are copied into both.",
              es:"Pega JSON o CSV y pulsa Importar. El CSV usa la misma cabecera que la exportación. Las filas con un solo idioma se copian a los dos."},
  exportHint:{en:"Copy this text and save it as a .json or .csv file.",
              es:"Copia este texto y guárdalo como archivo .json o .csv."},
  replaceAll:{en:"Replace whole bank",es:"Reemplazar todo el banco"},
  merge:{en:"Add to bank",es:"Añadir al banco"},
  restoreDefaults:{en:"Restore original bank",es:"Restaurar banco original"},
  imported:{en:"questions imported",es:"preguntas importadas"},
  badData:{en:"That text could not be read.",es:"No se pudo leer ese texto."},
  saved:{en:"Saved",es:"Guardado"},
  noQuestions:{en:"No questions match these filters.",es:"Ninguna pregunta coincide con estos filtros."},
  shortBank:{en:"Few questions with this setup. Add more or change the difficulty.",
             es:"Hay pocas preguntas con esta configuración. Añade más o cambia la dificultad."},
  recycled:{en:"Reshuffled this subject's questions.",es:"Se barajaron de nuevo las preguntas de esta categoría."},
  already:{en:"Already collected — this one only scores points.",
           es:"Ya lo tienes — esta pregunta solo suma puntos."},
  rulesTitle:{en:"How to play",es:"Cómo jugar"}, gotIt:{en:"Got it",es:"Entendido"},
  howManyTeams:{en:"teams",es:"equipos"}, sec:{en:"s",es:"s"},
  grant:{en:"Give",es:"Dar"}, revoke:{en:"Remove",es:"Quitar"},
  shuffleOpts:{en:"Shuffle the options",es:"Barajar las opciones"},
  fixedOpts:{en:"Keep A·B·C·D order",es:"Mantener el orden A·B·C·D"},
  allWon:{en:"Every champion is already collected.",es:"Ya se consiguieron todos los campeones."},
  lifelines:{en:"Lifelines",es:"Comodines"},
  llOnce:{en:"One of each to start — the rest are earned by playing well",
          es:"Uno de cada uno para empezar; los demás se ganan jugando bien"},
  llUsed:{en:"Used",es:"Usado"},
  llScroll:{en:"Scroll",es:"Rollo"},
  llScrollHint:{en:"Look it up in the Bible — 30 seconds more",es:"Búscalo en la Biblia: 30 segundos más"},
  llAsk:{en:"Ask a team",es:"Consultar"},
  llAskHint:{en:"15 seconds to ask another team",es:"15 segundos para consultar a otro equipo"},
  llBomb:{en:"Bomb",es:"Bomba"},
  llBombHint:{en:"Blows away the wrong options until only one is left",
              es:"Vuela las opciones incorrectas hasta dejar solo una"},
  llDouble:{en:"Second chance",es:"Doble chance"},
  llDoubleHint:{en:"One more try if the first answer is wrong",es:"Un intento más si fallas el primero"},
  llSkip:{en:"Skip",es:"Saltar"},
  llSkipHint:{en:"Another question from the same subject",es:"Otra pregunta de la misma categoría"},
  llArmed:{en:"Ready",es:"Listo"},
  llEarned:{en:"Lifeline earned",es:"Comodín ganado"},
  llReset:{en:"Reset lifelines",es:"Reiniciar comodines"},
  streak:{en:"Streak",es:"Racha"},
  bestStreak:{en:"Best streak",es:"Mejor racha"},
  keepTurn:{en:"Spin again",es:"Girar otra vez"},
  keepPlaying:{en:"The turn stays with you",es:"El turno sigue siendo tuyo"},
  spinOf:{en:"Spin",es:"Giro"},
  chain:{en:"Spins in a row",es:"Giros seguidos al acertar"},
  chainHint:{en:"How many times a team may spin again after a correct answer. One turns it off.",
             es:"Cuántas veces puede volver a girar un equipo tras acertar. Uno lo desactiva."},
  chainOff:{en:"One",es:"Uno"},
  earn:{en:"Earn lifelines",es:"Ganar comodines"},
  earnHint:{en:"A lifeline for every three correct answers in a row, and one for every crown challenge won.",
            es:"Un comodín por cada tres aciertos seguidos y otro por cada reto de Crown ganado."},
  consultTitle:{en:"Ask another team",es:"Consulta a otro equipo"},
  consultSub:{en:"The clock is paused. Answer when you are ready.",
              es:"El reloj está en pausa. Responde cuando estés listo."},
  consultDone:{en:"Done",es:"Listo"}, llGiveBack:{en:"Return",es:"Devolver"},
  motion:{en:"Animations",es:"Animaciones"}, motionFull:{en:"Full",es:"Completas"},
  motionCalm:{en:"Reduced",es:"Reducidas"},
  fullscreen:{en:"Full screen",es:"Pantalla completa"},
  enterFs:{en:"Enter full screen",es:"Entrar en pantalla completa"},
  exitFs:{en:"Leave full screen",es:"Salir de pantalla completa"},
  settingsNote:{en:"These settings are remembered on this device.",
                es:"Estos ajustes se recuerdan en este dispositivo."},
  on:{en:"on",es:"sí"}, off:{en:"off",es:"no"},
  confirmSure:{en:"Are you sure? This cannot be undone.",es:"¿Seguro? Esto no se puede deshacer."},
  yes:{en:"Yes, do it",es:"Sí, hacerlo"}, no:{en:"No",es:"No"},
  toUnlock:{en:"to the champion",es:"para el campeón"},
  progress:{en:"Progress",es:"Progreso"},
  reviewFlag:{en:"questions still need review",es:"preguntas siguen pendientes de revisión"},
  onlyVerified:{en:"Only verified questions",es:"Solo preguntas verificadas"},
  anyQ:{en:"All questions",es:"Todas las preguntas"}
};
var LANG="es";
var T={};
function setLang(l){
  LANG=(l==="en"||l==="es")?l:"es";
  var o={}; Object.keys(STR).forEach(function(k){ o[k]=STR[k][LANG]||STR[k].en; }); T=o;
}
setLang("es");
/* a cast member's localized name / subject */
function cname(c){ return (c&&c.name&&(c.name[LANG]||c.name.en))||""; }
function subj(c){ return (c&&c.subject&&(c.subject[LANG]||c.subject.en))||""; }

/* ============================ question bank ============================ */
/* B(category, difficulty, answerIndex,
     EN[question, A, B, C, D, explanation, scripture],
     ES[question, A, B, C, D, explanation, scripture])
   The answer index is the same in both languages, so the two option lists must stay in step.
   `verified:true` means the wording was checked against the Bible text it cites. A question
   that still needs checking gets `verified:false`, and a match set to "only verified
   questions" — the default — never draws it. */
function B(cat,dif,a,en,es){
  return {cat:cat,dif:dif,a:a,verified:true,
    en:{q:en[0],o:[en[1],en[2],en[3],en[4]],e:en[5],ref:en[6]||""},
    es:{q:es[0],o:[es[1],es[2],es[3],es[4]],e:es[5],ref:es[6]||""}};
}
var SEED=[
