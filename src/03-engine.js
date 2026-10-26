];
SEED.forEach(function(q,i){ q.id="BIB-"+String(i+1).padStart(3,"0"); });

/* ============================ utilities ============================ */
function lsGet(k,d){ try{var v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch(e){return d;} }
function lsSet(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
function lsDel(k){ try{localStorage.removeItem(k);}catch(e){} }
function uid(p){ return (p||"BIB-x")+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function shuffle(a){ var r=a.slice(); for(var i=r.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=r[i];r[i]=r[j];r[j]=t;} return r; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function catOf(id){ return CAT_BY_ID[id]||CATS[0]; }
function mmss(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2); }
/* The order the game is settled in, everywhere it is settled: champions first, score as the
   tie-break, seat order only so the list never shuffles on its own. */
function rankTeams(teams){
  return teams.map(function(t,i){ return {t:t,i:i}; }).sort(function(a,b){
    return (b.t.unlocked.length-a.t.unlocked.length)||(b.t.score-a.t.score)||(a.i-b.i);
  });
}
/* everyone level at the top — one name means a winner, more means sudden death */
function tiedTop(teams){
  var r=rankTeams(teams), top=r[0], out=[top.i];
  for(var k=1;k<r.length;k++){
    if(r[k].t.unlocked.length!==top.t.unlocked.length||r[k].t.score!==top.t.score) break;
    out.push(r[k].i);
  }
  return out;
}
function catVars(id){ return {"--cc":"var(--c-"+id+")"}; }
/* the side of a bilingual row for the active language, falling back to the other one */
function side(q,lang){
  var l=lang||LANG;
  var s=q[l];
  if(s&&s.q) return s;
  return q.en&&q.en.q?q.en:(q.es||{q:"",o:["","","",""],e:"",ref:""});
}

/* ============================ audio ============================ */
/* Music comes from real files dropped into audio/ — see the README. Anything missing just
   stays silent. The short cues are synthesised so the game never waits on a download. */
var MUSIC_FILES={ menu:"audio/menu.mp3", board:"audio/board.mp3", quiz:"audio/question.mp3", victory:"audio/victory.mp3" };
var MUSIC_FALLBACK={ board:"menu", quiz:"board", victory:"menu" };
var A={ ctx:null, master:null, sfxOn:true, musicOn:true, vol:0.75, noise:null,
        players:{}, track:null, want:null, unlocked:false, preloaded:false };
function audioInit(){
  if(A.ctx!==null) return A.ctx;
  try{ A.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ A.ctx=false; return null; }
  A.master=A.ctx.createGain(); A.master.gain.value=A.vol; A.master.connect(A.ctx.destination);
  var len=A.ctx.sampleRate*0.5, buf=A.ctx.createBuffer(1,len,A.ctx.sampleRate), d=buf.getChannelData(0);
  for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
  A.noise=buf;
  return A.ctx;
}
function player(name){
  if(A.players[name]!==undefined) return A.players[name];
  var src=MUSIC_FILES[name]; if(!src){ A.players[name]=null; return null; }
  var el=new Audio(src);
  el.loop=(name!=="victory"); el.preload="auto"; el.volume=0;
  el.addEventListener("error",function(){
    A.players[name]=null;                       /* file is not there: fall back and keep playing */
    if(A.track===name){ A.track=null; if(A.want) musicStart(A.want); }
  });
  A.players[name]=el;
  return el;
}
function fade(el,to,ms){
  if(!el) return;
  var from=el.volume, t0=performance.now();
  (function step(){
    var p=Math.min(1,(performance.now()-t0)/ms);
    try{ el.volume=clamp(from+(to-from)*p,0,1); }catch(e){}
    if(p<1) requestAnimationFrame(step);
    else if(to===0){ try{ el.pause(); }catch(e){} }
  })();
}
function musicStart(name){
  A.want=name;
  if(!A.unlocked||!A.musicOn){ if(A.musicOn) preloadTrack(name); return; }
  var key=name;
  if(!player(key)) key=MUSIC_FALLBACK[name]||null;
  if(key&&!player(key)) key=null;
  if(A.track===key) return;
  if(A.track&&A.players[A.track]) fade(A.players[A.track],0,300);
  A.track=key;
  if(!key) return;
  var el=player(key);
  try{ if(!el.loop) el.currentTime=0; var p=el.play(); if(p&&p.catch) p.catch(function(){}); }catch(e){}
  fade(el,A.vol*0.55,260);
}
function musicStop(){
  if(A.track&&A.players[A.track]) fade(A.players[A.track],0,400);
  A.track=null; A.want=null;
}
function preloadTrack(name){
  var el=player(name);
  if(!el) return;
  if(el.readyState===0&&el.networkState!==2){ try{ el.load(); }catch(e){} }
}
function preloadAll(){
  if(A.preloaded) return;
  A.preloaded=true;
  if(A.want) preloadTrack(A.want);
  setTimeout(function(){
    Object.keys(MUSIC_FILES).forEach(function(n){ if(n!==A.want) preloadTrack(n); });
  },1500);
}
function audioResume(){
  audioInit();
  if(A.ctx&&A.ctx.state==="suspended"){ try{ A.ctx.resume(); }catch(e){} }
  if(!A.unlocked){
    A.unlocked=true;
    if(A.want) musicStart(A.want);
    preloadAll();
  }
}
function applyAudio(st){
  A.sfxOn=st.sfx; A.musicOn=st.music; A.vol=st.vol;
  if(A.master&&A.ctx) A.master.gain.setTargetAtTime(A.vol,A.ctx.currentTime,0.05);
  if(!A.musicOn){ if(A.track&&A.players[A.track]) fade(A.players[A.track],0,300); A.track=null; }
  else if(A.want) musicStart(A.want);
  else if(A.track&&A.players[A.track]) fade(A.players[A.track],A.vol*0.55,300);
}
function voice(type,f1,f2,t0,dur,peak,cutoff){
  var c=A.ctx; if(!c) return;
  var o=c.createOscillator(), g=c.createGain(), node=o;
  o.type=type; o.frequency.setValueAtTime(f1,t0);
  if(f2&&f2!==f1) o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  if(cutoff){ var f=c.createBiquadFilter(); f.type="lowpass"; f.frequency.setValueAtTime(cutoff,t0); o.connect(f); node=f; }
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  node.connect(g); g.connect(A.master);
  o.start(t0); o.stop(t0+dur+0.04);
}
function hiss(t0,dur,peak,hp){
  var c=A.ctx; if(!c||!A.noise) return;
  var s=c.createBufferSource(); s.buffer=A.noise;
  var f=c.createBiquadFilter(); f.type="highpass"; f.frequency.value=hp||5000;
  var g=c.createGain();
  g.gain.setValueAtTime(peak,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  s.connect(f); f.connect(g); g.connect(A.master);
  s.start(t0); s.stop(t0+dur+0.02);
}
function sfx(name){
  if(!A.sfxOn) return; var c=audioInit(); if(!c) return;
  var t=c.currentTime;
  if(name==="click")      voice("sine",680,920,t,0.07,0.06,4000);
  else if(name==="tick")  voice("sine",1500,1500,t,0.04,0.05);
  else if(name==="land"){ voice("sine",700,1050,t,0.14,0.12,6000); hiss(t,0.09,0.05,4000); }
  else if(name==="good"){ [784,988,1319].forEach(function(f,i){ voice("sine",f,f,t+i*0.065,0.26,0.1,6000); }); }
  else if(name==="bad"){  voice("sine",330,180,t,0.3,0.09,1400); }
  /* the wheel: one breath of air as it goes, then a notch for every slot the pointer crosses */
  else if(name==="whoosh"){ hiss(t,0.5,0.045,900); voice("sine",150,430,t,0.45,0.045,900); }
  else if(name==="notch"){ voice("square",760,610,t,0.026,0.028,2200); }
  else if(name==="unlock"){ [659,880,1175,1568].forEach(function(f,i){ voice("sine",f,f,t+i*0.085,0.4,0.1,8000); }); }
  /* the crown gets a longer, brighter fanfare than anything else in the game */
  else if(name==="crown"){ [1047,1319,1568,2093,2637].forEach(function(f,i){ voice("sine",f,f,t+i*0.075,0.5,0.1,10000); });
                           hiss(t,0.5,0.05,6000); }
  else if(name==="win"){ [523,659,784,1047,1319].forEach(function(f,i){ voice("sine",f,f,t+i*0.14,0.5,0.1,8000); }); }
}

/* ---- confetti ---- */
var confettiStop=0, confettiRunning=false;
function calmMode(){
  return (window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      || document.documentElement.classList.contains("calm");
}
function confetti(ms){
  var cv=document.getElementById("confetti"); if(!cv) return;
  if(calmMode()) return;
  cv.hidden=false;
  var ctx=cv.getContext("2d"), parts=[];
  function size(){ cv.width=window.innerWidth; cv.height=window.innerHeight; }
  size();
  var cols=["#ffc83d","#08c9cf","#19c97d","#ff4eb8","#7428e8","#ff624f","#fff5df"];
  for(var i=0;i<180;i++) parts.push({
    x:Math.random()*cv.width, y:-20-Math.random()*cv.height*0.6,
    w:5+Math.random()*8, h:7+Math.random()*10,
    vy:2.4+Math.random()*3.6, vx:-1.6+Math.random()*3.2,
    r:Math.random()*Math.PI, vr:-0.16+Math.random()*0.32,
    c:cols[(Math.random()*cols.length)|0]
  });
  confettiStop=Date.now()+(ms||4200);
  if(confettiRunning) return;
  confettiRunning=true;
  /* one listener per run, taken down with the animation — a long match fires this many times */
  window.addEventListener("resize",size);
  (function frame(){
    ctx.clearRect(0,0,cv.width,cv.height);
    for(var i=0;i<parts.length;i++){
      var p=parts[i]; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr;
      if(p.y>cv.height+30){ p.y=-20; p.x=Math.random()*cv.width; }
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle=p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    }
    if(Date.now()<confettiStop) requestAnimationFrame(frame);
    else {
      ctx.clearRect(0,0,cv.width,cv.height); cv.hidden=true; confettiRunning=false;
      window.removeEventListener("resize",size);
    }
  })();
}

/* ---- starfield ---- */
function Stars(){
  var ref=useRef(null);
  useEffect(function(){
    var cv=ref.current; if(!cv) return;
    var ctx=cv.getContext("2d"), stars=[], raf=0, reduce=calmMode();
    function build(){
      cv.width=window.innerWidth; cv.height=window.innerHeight; stars=[];
      var n=Math.min(180,Math.round(cv.width*cv.height/12000));
      for(var i=0;i<n;i++) stars.push({x:Math.random()*cv.width,y:Math.random()*cv.height,
        r:Math.random()*1.6+0.3,p:Math.random()*6.28,s:0.01+Math.random()*0.026});
    }
    build();
    function frame(){
      ctx.clearRect(0,0,cv.width,cv.height);
      for(var i=0;i<stars.length;i++){
        var s=stars[i]; s.p+=s.s;
        ctx.globalAlpha=0.25+Math.abs(Math.sin(s.p))*0.65;
        ctx.fillStyle=i%7===0?"#ffd97a":"#ffffff";
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.283); ctx.fill();
      }
      ctx.globalAlpha=1;
      if(!reduce) raf=requestAnimationFrame(frame);
    }
    frame();
    window.addEventListener("resize",build);
    return function(){ cancelAnimationFrame(raf); window.removeEventListener("resize",build); };
  },[]);
  return html`<canvas id="stars" ref=${ref} aria-hidden="true"></canvas>`;
}

/* ============================ bank helpers ============================ */
function defaultBank(){ return clone(SEED); }
function okRow(q){
  if(!q||!CAT_BY_ID[q.cat]||q.cat==="crown") return false;
  var s=side(q,"en"), s2=side(q,"es");
  return !!((s&&s.q&&s.o&&s.o.length===4)||(s2&&s2.q&&s2.o&&s2.o.length===4));
}
function loadBank(){
  var b=lsGet("bc.bank",null);
  if(!b||!b.length) return defaultBank();
  var ok=b.filter(okRow);
  return ok.length?ok:defaultBank();
}
/* The pool a match draws from: subject is chosen by the wheel, so only difficulty,
   language and the verified flag narrow it here. */
function poolFor(bank,s){
  return bank.filter(function(q){
    if(s.difficulty!=="mixed"&&q.dif!==s.difficulty) return false;
    if(s.verifiedOnly&&!q.verified) return false;
    var sd=q[s.language||LANG];
    if(!sd||!sd.q) return false;
    return true;
  });
}
var CSV_HEAD=["id","category","difficulty","answer","verified",
  "scripture_en","question_en","a_en","b_en","c_en","d_en","explanation_en",
  "scripture_es","question_es","a_es","b_es","c_es","d_es","explanation_es"];
function csvCell(v){ v=(v==null?"":String(v)); return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
function toCSV(bank){
  var rows=[CSV_HEAD.join(",")];
  bank.forEach(function(q){
    var en=q.en||{o:[]}, es=q.es||{o:[]};
    rows.push([q.id,q.cat,q.dif,"ABCD".charAt(q.a),q.verified?"yes":"no",
      en.ref,en.q,(en.o||[])[0],(en.o||[])[1],(en.o||[])[2],(en.o||[])[3],en.e,
      es.ref,es.q,(es.o||[])[0],(es.o||[])[1],(es.o||[])[2],(es.o||[])[3],es.e].map(csvCell).join(","));
  });
  return rows.join("\n");
}
function parseCSV(text){
  var rows=[],row=[],cur="",q=false,i=0;
  text=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
  for(;i<text.length;i++){
    var ch=text[i];
    if(q){ if(ch==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=ch; }
    else if(ch==='"'){ q=true; }
    else if(ch===","){ row.push(cur); cur=""; }
    else if(ch==="\n"){ row.push(cur); rows.push(row); row=[]; cur=""; }
    else cur+=ch;
  }
  if(cur!==""||row.length){ row.push(cur); rows.push(row); }
  return rows.filter(function(r){ return r.length>1||r[0]!==""; });
}
function packSide(q,o,e,ref){
  var opts=(o||[]).map(function(x){ return String(x==null?"":x).trim(); });
  return {q:String(q==null?"":q).trim(),o:opts,e:String(e==null?"":e).trim(),ref:String(ref==null?"":ref).trim()};
}
function fullSide(s){ return !!(s&&s.q&&s.o.length===4&&s.o.every(function(x){return x;})); }
/* Accepts three shapes: the bilingual row this game writes, the suffixed CSV columns it
   exports, and a plain single-language row like the one in the project brief. A row that
   carries one language is copied into both so the game never shows an empty question. */
/* A category may arrive as the internal id, or as the subject name in either language —
   an exported bank uses the id, a hand-written one usually does not. */
function resolveCat(raw){
  var s=String(raw==null?"":raw).toLowerCase().trim();
  if(!s) return null;
  if(CAT_BY_ID[s]&&s!=="crown") return s;
  for(var i=0;i<CATS.length;i++){
    var c=CATS[i];
    if(c.short.toLowerCase()===s) return c.id;
    if(String(c.subject.en).toLowerCase()===s) return c.id;
    if(String(c.subject.es).toLowerCase()===s) return c.id;
  }
  /* a couple of spellings the brief and older sheets use */
  if(s.indexOf("prophec")>=0||s.indexOf("profec")>=0) return "prophecy";
  if(s.indexOf("histor")>=0) return "history";
  if(s.indexOf("geogra")>=0) return "geography";
  if(s.indexOf("art")===0||s.indexOf("arte")===0||s.indexOf("music")>=0) return "art";
  if(s.indexOf("sport")>=0||s.indexOf("deport")>=0) return "sports";
  if(s.indexOf("econom")>=0) return "economics";
  if(s.indexOf("riddl")>=0||s.indexOf("acertij")>=0) return "riddles";
  return null;
}
function normalize(o){
  if(!o) return null;
  var cat=resolveCat(o.cat||o.category);
  if(!cat) return null;
  var dif=String(o.dif||o.difficulty||"medium").toLowerCase().trim();
  if(DIFFS.indexOf(dif)<0) dif="medium";
  var en=null, es=null, a;
  if(o.en&&(o.en.q||o.es)){
    en=packSide(o.en.q,o.en.o,o.en.e,o.en.ref);
    es=o.es?packSide(o.es.q,o.es.o,o.es.e,o.es.ref):null;
    a=(o.a!==undefined?o.a:o.answer);
  } else if(o.question_en!==undefined||o.question_es!==undefined){
    en=packSide(o.question_en,[o.a_en,o.b_en,o.c_en,o.d_en],o.explanation_en,o.scripture_en);
    es=packSide(o.question_es,[o.a_es,o.b_es,o.c_es,o.d_es],o.explanation_es,o.scripture_es);
    a=o.answer;
  } else {
    var opts=o.options&&o.options.length?o.options:[o.a,o.b,o.c,o.d];
    var flat=packSide(o.q||o.question,opts,o.e||o.explanation,o.scripture||o.ref);
    var lang=String(o.language||o.lang||LANG).toLowerCase().slice(0,2);
    if(lang==="en"){ en=flat; } else { es=flat; }
    a=(o.correctAnswer!==undefined?o.correctAnswer:o.answer);
  }
  if(typeof a==="string"){
    var l=a.trim().toUpperCase().charAt(0);
    a="ABCD".indexOf(l)>=0?"ABCD".indexOf(l):parseInt(a,10);
  }
  a=parseInt(a,10); if(isNaN(a)||a<0||a>3) return null;
  if(!fullSide(en)&&!fullSide(es)) return null;
  if(!fullSide(en)) en=clone(es);
  if(!fullSide(es)) es=clone(en);
  var v=o.verified;
  v=(v===true||v==="yes"||v==="true"||v==="1"||v===1);
  return {id:o.id||uid(),cat:cat,dif:dif,a:a,verified:v,en:en,es:es};
}
function parseImport(text){
  text=(text||"").trim(); if(!text) return [];
  var out=[];
  if(text.charAt(0)==="["||text.charAt(0)==="{"){
    var data=JSON.parse(text);
    if(!Array.isArray(data)) data=data.questions||data.bank||[data];
    data.forEach(function(o){ var n=normalize(o); if(n) out.push(n); });
  } else {
    var rows=parseCSV(text); if(rows.length<2) return [];
    var head=rows[0].map(function(h){ return String(h).trim().toLowerCase(); });
    for(var i=1;i<rows.length;i++){
      var obj={}; head.forEach(function(h,j){ obj[h]=rows[i][j]; });
      var n=normalize(obj); if(n) out.push(n);
    }
  }
  return out;
}

/* ============================ small components ============================ */
function Seg(props){
  return html`<div class="seg" role="group">${props.items.map(function(it){
    return html`<button key=${String(it.v)} type="button" aria-pressed=${String(props.value===it.v)}
      onClick=${function(){ sfx("click"); props.onChange(it.v); }}>${it.l}</button>`;
  })}</div>`;
}
function Tile(props){
  var c=catOf(props.cat);
  var cls="ctile"+(props.dim?" dim":"")+(props.on?" on":"")+(props.cls?" "+props.cls:"");
  return html`<div class=${cls} style=${Object.assign(catVars(props.cat),props.style||{})}>
    <img src=${c.img} alt=${cname(c)} draggable="false"/></div>`;
}
function llName(id){ return T["ll"+id.charAt(0).toUpperCase()+id.slice(1)]||id; }
function llHint(id){ return T["ll"+id.charAt(0).toUpperCase()+id.slice(1)+"Hint"]||""; }
function llSpec(id){ for(var i=0;i<LIFELINES.length;i++) if(LIFELINES[i].id===id) return LIFELINES[i]; return null; }
function freshLifelines(){ var o={}; LIFELINES.forEach(function(l){ o[l.id]=1; }); return o; }
/* How many of one lifeline a team is holding. Matches saved before the bank of five existed
   stored a plain true/false per lifeline, so both shapes have to read the same. */
function llCount(tm,id){
  var v=tm&&tm.lifelines?tm.lifelines[id]:0;
  if(v===true) return 1;
  if(v===false||v==null) return 0;
  return parseInt(v,10)||0;
}
function migrateLifelines(tm){
  var o={};
  LIFELINES.forEach(function(l){
    var v=tm.lifelines?tm.lifelines[l.id]:undefined;
    o[l.id]=(v===undefined?1:(v===true?1:(v===false?0:(parseInt(v,10)||0))));
  });
  tm.lifelines=o;
}
/* A reward is one random lifeline the team is not already full on, so the prize is a small
   surprise and nobody ends the match sitting on five bombs. */
function grantLifeline(tm){
  var pool=LIFELINES.filter(function(l){ return llCount(tm,l.id)<LL_CAP; });
  if(!pool.length) return null;
  var pick=pool[Math.floor(Math.random()*pool.length)];
  tm.lifelines[pick.id]=llCount(tm,pick.id)+1;
  return pick.id;
}
function LLIcon(props){
  var sz=props.size||18, id=props.id;
  var common={viewBox:"0 0 24 24",width:sz,height:sz,fill:"none",stroke:"currentColor",
    "stroke-width":1.9,"stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true"};
  if(id==="scroll") return html`<svg ...${common}>
    <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6"/>
    <path d="M6 3a2 2 0 0 0-2 2v2h4"/><path d="M6 21a2 2 0 0 0 2-2V7"/>
    <line x1="11" y1="9" x2="17" y2="9"/><line x1="11" y1="13" x2="17" y2="13"/></svg>`;
  if(id==="bomb") return html`<svg ...${common}>
    <circle cx="10.5" cy="15" r="6.2"/><path d="M15 10.5 17.6 7.9"/>
    <path d="M17.2 6.2a2.2 2.2 0 1 1 2.6 2.6"/>
    <path d="M20.6 3.4v1.6M22.8 5.6h-1.6"/></svg>`;
  if(id==="double") return html`<svg ...${common}>
    <path d="M3.5 9.5a7.5 7.5 0 0 1 12.8-4.3L20 8.5"/><path d="M20 3.8v4.7h-4.7"/>
    <path d="M20.5 14.5a7.5 7.5 0 0 1-12.8 4.3L4 15.5"/><path d="M4 20.2v-4.7h4.7"/></svg>`;
  if(id==="skip") return html`<svg ...${common}>
    <path d="M4.5 5.5 13 12l-8.5 6.5z"/><line x1="18" y1="5.5" x2="18" y2="18.5"/></svg>`;
  return html`<svg ...${common} stroke-width="2">
    <circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c0-3.4 2.8-6.2 6.2-6.2S15.2 16.6 15.2 20"/>
    <circle cx="17.6" cy="9.8" r="2.3"/><path d="M15.9 14.9c2.9.2 5.3 2.6 5.3 5.1"/></svg>`;
}
function Toast(props){
  useEffect(function(){ var t=setTimeout(props.onDone,2600); return function(){clearTimeout(t);}; },[]);
  return html`<div class="toast">${props.msg}</div>`;
}

/* ============================ wheel ============================ */
/* Eight slots. Each one carries a circular medallion of its champion, clipped in SVG so the
   portrait crop reads as a framed coin rather than a cut-out. */
var SEG=360/WHEEL.length;
function Wheel(props){
  var r=96, cx=100, cy=100, mr=61, rad=19;
  var rotor=useRef(null), ptr=useRef(null);
  /* The notches are read off the rotation the browser is actually painting rather than
     scheduled in advance, so one sounds the instant the pointer crosses a slot edge however
     the easing runs — and they thin out on their own as the wheel slows. */
  useEffect(function(){
    if(!props.spinning||calmMode()) return;
    var el=rotor.current; if(!el) return;
    var last=null, raf=0, heard=0;
    (function frame(){
      var tr=getComputedStyle(el).transform, deg=0;
      var m=tr&&tr.indexOf("matrix(")===0?tr.slice(7,-1).split(","):null;
      if(m) deg=Math.atan2(parseFloat(m[1]),parseFloat(m[0]))*180/Math.PI;
      var idx=Math.floor((((deg%360)+360)%360)/SEG);
      /* at full speed the edges go by faster than they can be heard apart, so the early
         ones are thinned to a rattle rather than a machine gun */
      var now=performance.now();
      if(last!==null&&idx!==last&&now-heard>38){ sfx("notch"); heard=now; }
      last=idx;
      raf=requestAnimationFrame(frame);
    })();
    return function(){ cancelAnimationFrame(raf); };
  },[props.spinning]);
  /* a flick across the wheel throws it, the way a real one is thrown */
  function down(e){ ptr.current={x:e.clientX,y:e.clientY,t:Date.now()}; }
  function up(e){
    var s=ptr.current; ptr.current=null;
    if(!s||props.spinning||props.disabled) return;
    var dx=e.clientX-s.x, dy=e.clientY-s.y;
    if(Math.sqrt(dx*dx+dy*dy)>42&&Date.now()-s.t<700) props.onSpin();
  }
  function pt(deg,rd){ var a=(deg-90)*Math.PI/180; return [cx+rd*Math.cos(a), cy+rd*Math.sin(a)]; }
  var clips=WHEEL.map(function(c,i){
    var mid=pt(i*SEG+SEG/2,mr);
    return html`<clipPath key=${c.id} id=${"clip-"+c.id}>
      <circle cx=${mid[0].toFixed(2)} cy=${mid[1].toFixed(2)} r=${rad}/></clipPath>`;
  });
  var sectors=WHEEL.map(function(c,i){
    var a1=i*SEG, a2=a1+SEG;
    var p1=pt(a1,r), p2=pt(a2,r), mid=pt(a1+SEG/2,mr);
    return html`<g key=${c.id}>
      <path d=${"M"+cx+","+cy+" L"+p1[0].toFixed(2)+","+p1[1].toFixed(2)+" A"+r+","+r+" 0 0 1 "+p2[0].toFixed(2)+","+p2[1].toFixed(2)+" Z"}
        fill=${"var(--c-"+c.id+")"} stroke="rgba(255,255,255,.92)" stroke-width="1.3"/>
      <image href=${c.img} x=${(mid[0]-rad).toFixed(2)} y=${(mid[1]-rad).toFixed(2)}
        width=${rad*2} height=${rad*2} preserveAspectRatio="xMidYMin slice"
        clip-path=${"url(#clip-"+c.id+")"}/>
      <circle cx=${mid[0].toFixed(2)} cy=${mid[1].toFixed(2)} r=${rad}
        fill="none" stroke="#fff" stroke-width="2"/>
    </g>`;
  });
  return html`<div class="wheel-stage" onPointerDown=${down} onPointerUp=${up}>
    <div class="wheel-glow"></div>
    <div class=${"pointer"+(props.landed?" hit":"")}></div>
    <div class=${"wheel-rotor"+(props.spinning?" spin":"")} ref=${rotor}
      style=${{transform:"rotate("+props.rot+"deg)",transitionDuration:(props.dur||5.2)+"s"}}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
        <defs>${clips}</defs>
        <circle cx="100" cy="100" r="99" fill="rgba(255,255,255,.95)"/>
        ${sectors}
        <circle cx="100" cy="100" r="96.5" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="5"/>
      </svg>
    </div>
    <button class="spin-hub" onClick=${props.onSpin} disabled=${props.spinning||props.disabled}
      aria-label=${T.spin}>${props.spinning?T.spinning:T.spin}</button>
  </div>`;
}

/* ============================ team seat ============================ */
/* A score that jumps is a number nobody watches, so it climbs instead. */
function useCountUp(value){
  var st=useState(value), shown=st[0], setShown=st[1];
  var from=useRef(value);
  useEffect(function(){
    var a=from.current, b=value;
    from.current=b;
    if(a===b) return;
    if(calmMode()){ setShown(b); return; }
    var t0=performance.now(), dur=650, raf=0;
    (function step(){
      var p=Math.min(1,(performance.now()-t0)/dur);
      setShown(Math.round(a+(b-a)*(1-Math.pow(1-p,3))));
      if(p<1) raf=requestAnimationFrame(step);
    })();
    return function(){ cancelAnimationFrame(raf); setShown(b); };
  },[value]);
  return shown;
}
function TeamCard(props){
  var team=props.team, s=props.settings;
  var shown=useCountUp(team.score);
  var po=useState(null), pop=po[0], setPop=po[1];
  var last=useRef(team.score);
  /* what the team just won, floating off its own card */
  useEffect(function(){
    var d=team.score-last.current; last.current=team.score;
    if(d<=0) return;
    setPop({n:d,k:Date.now()});
    var id=setTimeout(function(){ setPop(null); },1200);
    return function(){ clearTimeout(id); };
  },[team.score]);
  var need=(s&&s.needed)||1;
  return html`<div class=${"team-card"+(props.active?" active":"")} style=${{"--tc":team.color}}>
    ${pop?html`<span key=${pop.k} class="pop tnum">+${pop.n}</span>`:null}
    <div class="thead">
      <span class="tname">${team.name}</span>
      <span class="score tnum">${shown}</span>
    </div>
    <div class="slots">
      ${CATS.map(function(c){
        var got=team.unlocked.indexOf(c.id)>=0;
        var p=got?need:Math.min(need,(team.progress&&team.progress[c.id])||0);
        return html`<span key=${c.id} class="slot" style=${catVars(c.id)}>
          <${Tile} cat=${c.id} on=${got} dim=${!got}/>
          ${need>1?html`<i class="pbar"><b style=${{width:(p/need*100)+"%"}}></b></i>`:null}
        </span>`;
      })}
    </div>
    <div class="meter">
      <span class="ll-mini">${LIFELINES.map(function(l){
        var n=llCount(team,l.id);
        return html`<span key=${l.id} class=${n?"":"spent"} title=${llName(l.id)+" ×"+n}>
          <${LLIcon} id=${l.id} size=${12}/>${n>1?html`<b class="tnum">${n}</b>`:null}</span>`;
      })}</span>
      <span class="spacer"></span>
      ${team.streak>=2?html`<span class="flame tnum" title=${T.streak}>🔥${team.streak}</span>`:null}
      <span class="tnum">${team.unlocked.length}/${CATS.length}</span>
    </div>
  </div>`;
}

/* ============================ live standings ============================ */
/* Four teams sit in the four corners, so the race itself is hard to read off the seats.
   This strip puts them in order: champions first, points as the tie-break. */
function Standings(props){
  var order=rankTeams(props.teams);
  return html`<div class="standings" aria-label=${T.rank}>
    ${order.map(function(o,k){
      return html`<span key=${o.t.id} class=${"rchip"+(o.i===props.turn?" live":"")} style=${{"--tc":o.t.color}}>
        <b class="pos tnum">${k+1}</b>
        <span class="nm">${o.t.name}</span>
        <span class="tnum">${o.t.unlocked.length}/${CATS.length}</span>
        <span class="tnum sc">${o.t.score}</span>
      </span>`;
    })}
  </div>`;
}
