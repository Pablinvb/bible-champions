/* ============================ shared chrome ============================ */
function TopBar(props){
  return html`<div class="topbar">
    ${props.back?html`<button class="btn sm ghost" onClick=${function(){ sfx("click"); props.back(); }}>← ${T.backHome}</button>`
               :html`<span class="brand">Bible <span>Champions</span></span>`}
    <span class="spacer"></span>
    ${props.title?html`<span class="eyebrow">${props.title}</span>`:null}
    <button class="icon-btn" title=${T.music}
      onClick=${function(){ props.setAudio({music:!props.audio.music}); }}>${props.audio.music?"♪":"𝄽"}</button>
  </div>`;
}
function toggleFullscreen(){
  try{
    if(document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }catch(e){}
}

/* ============================ home ============================ */
function Home(props){
  return html`<div class="wrap">
    <${TopBar} audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="home">
      <h1 class="logo"><span class="l1">BIBLE</span><span class="l2">CHAMPIONS</span></h1>
      <p class="tagline">${T.tagline}</p>
      <${Tile} cat="crown" cls="crown-hero"/>
      <div class="cast">
        ${CATS.map(function(c){ return html`<figure key=${c.id} style=${catVars(c.id)}>
          <${Tile} cat=${c.id} on=${true}/>
          <figcaption>${c.short}<small>${subj(c)}</small></figcaption>
        </figure>`; })}
      </div>
      <div class="home-actions">
        <button class="btn lg" onClick=${function(){ audioResume(); sfx("click"); props.go("setup"); }}>${T.start}</button>
        ${props.hasMatch?html`<button class="btn lg ghost" onClick=${function(){ audioResume(); sfx("click"); props.go("game"); }}>${T.resume}</button>`:null}
        <button class="btn lg ghost" onClick=${function(){ sfx("click"); props.go("howto"); }}>${T.howto}</button>
        <button class="btn lg ghost" onClick=${function(){ sfx("click"); props.go("bank"); }}>${T.bank}</button>
        <button class="btn lg ghost" onClick=${function(){ sfx("click"); props.go("settings"); }}>${T.settings}</button>
      </div>
      <p class="home-note">${T.homeNote}</p>
    </div>
  </div>`;
}

/* ============================ how to play ============================ */
function steps(){
  if(LANG==="en") return [
    ["Form the teams","Two to four teams, each with a name and a colour. They sit around the wheel."],
    ["Spin the wheel","Eight slots: the seven champions and Crown."],
    ["Answer in time","Four options, one correct. Running out of time counts as a wrong answer."],
    ["Right answer, spin again","The turn only passes when you miss. Three in a row is worth a bonus and earns a lifeline."],
    ["Spend a lifeline","Five of them: more time, a pause to ask another team, a bomb that clears wrong options, a second chance, and a skip to a different question."],
    ["Collect a champion","Enough correct answers in a subject and that champion joins your collection."],
    ["Crown is a shortcut, not a gift","Land on Crown and you choose any champion you are missing — then answer one special question from that subject. Right, it is yours at once. Wrong, you lose the turn."],
    ["Win the match","The first team holding all seven champions wins."]
  ];
  return [
    ["Formen los equipos","De dos a cuatro equipos, cada uno con nombre y color. Se sientan alrededor de la ruleta."],
    ["Giren la ruleta","Ocho secciones: los siete campeones y Crown."],
    ["Respondan a tiempo","Cuatro opciones, una correcta. Quedarse sin tiempo cuenta como fallo."],
    ["Si aciertan, vuelven a girar","El turno solo pasa cuando fallan. Tres aciertos seguidos dan puntos extra y un comodín."],
    ["Usen un comodín","Son cinco: más tiempo, una pausa para consultar a otro equipo, una bomba que quita opciones incorrectas, una doble chance y un salto a otra pregunta."],
    ["Consigan un campeón","Con suficientes aciertos en una categoría, ese campeón se une a su colección."],
    ["Crown es un atajo, no un regalo","Si caen en Crown eligen cualquier campeón que les falte y responden una pregunta especial de esa categoría. Si aciertan, es suyo de inmediato. Si fallan, pierden el turno."],
    ["Ganen la partida","El primer equipo que reúna los siete campeones gana."]
  ];
}
function HowTo(props){
  return html`<div class="wrap" style=${{paddingBottom:"48px"}}>
    <${TopBar} back=${function(){props.go("home");}} title=${T.rulesTitle}
      audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="card" style=${{marginBottom:"18px"}}>
      <div class="steps">
        ${steps().map(function(s,i){ return html`<div key=${i} class="step">
          <span class="n">${i+1}</span>
          <div><h4>${s[0]}</h4><p>${s[1]}</p></div></div>`; })}
      </div>
    </div>
    <div class="grid2">
      <div class="card">
        <div class="eyebrow">${T.score}</div>
        <table style=${{marginTop:"10px",minWidth:0}}><tbody>
          <tr><td>${T.easy}</td><td class="num">100</td></tr>
          <tr><td>${T.medium}</td><td class="num">200</td></tr>
          <tr><td>${T.hard}</td><td class="num">300</td></tr>
          <tr><td><b>${T.streak}</b></td><td class="num">+${STREAK_BONUS} … +${STREAK_MAX_BONUS}</td></tr>
          <tr><td><b>${T.collect}</b></td><td class="num">+${UNLOCK_BONUS}</td></tr>
          <tr><td><b>${T.crownQuestion}</b></td><td class="num">+${CROWN_BONUS}</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <div class="eyebrow">${T.lifelines}</div>
        <div style=${{display:"grid",gap:"12px",marginTop:"12px"}}>
          ${LIFELINES.map(function(l){ return html`<div key=${l.id} class="row" style=${{gap:"12px",flexWrap:"nowrap"}}>
            <span style=${{color:"var(--gold)",flex:"0 0 auto"}}><${LLIcon} id=${l.id} size=${26}/></span>
            <b style=${{fontSize:"15px"}}>${llName(l.id)}
              <br/><span class="muted" style=${{fontWeight:600,fontSize:"13px"}}>${llHint(l.id)}</span></b>
          </div>`; })}
        </div>
        <p class="hint" style=${{marginTop:"12px"}}>${T.llOnce}</p>
      </div>
      <div class="card">
        <div class="eyebrow">${T.characters}</div>
        <div style=${{display:"grid",gap:"10px",marginTop:"10px"}}>
          ${WHEEL.map(function(c){ return html`<div key=${c.id} class="row" style=${{gap:"12px",flexWrap:"nowrap"}}>
            <${Tile} cat=${c.id} on=${true} style=${{width:"48px",flex:"0 0 auto"}}/>
            <b style=${{color:"var(--c-"+c.id+")",fontSize:"15px"}}>${cname(c)}
              <br/><span class="muted" style=${{fontWeight:600,fontSize:"13px"}}>${subj(c)}</span></b>
          </div>`; })}
        </div>
      </div>
    </div>
    <p class="muted" style=${{marginTop:"16px",fontSize:"14px",fontWeight:600}}>
      <span class="kbd">space</span> · <span class="kbd">A</span>–<span class="kbd">D</span>
      · <span class="kbd">1</span>–<span class="kbd">4</span> · ⚙ ${T.teacher}</p>
    <div style=${{marginTop:"18px"}}>
      <button class="btn lg" onClick=${function(){ sfx("click"); props.go("home"); }}>${T.gotIt}</button></div>
  </div>`;
}

/* ============================ settings ============================ */
function Settings(props){
  var s=props.settings, au=props.audio;
  function patch(k,v){ props.setSettings(function(p){ var n=Object.assign({},p); n[k]=v; return n; }); }
  return html`<div class="wrap" style=${{paddingBottom:"48px"}}>
    <${TopBar} back=${function(){props.go("home");}} title=${T.settings}
      audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="card grid2">
      <div class="field"><span class="label">${T.language}</span>
        <${Seg} value=${s.language} onChange=${function(v){patch("language",v);}}
          items=${LANGS.map(function(l){return {v:l.id,l:l.name};})}/>
        <span class="hint">${T.langHint}</span></div>
      <div class="field"><span class="label">${T.sound}</span>
        <${Seg} value=${au.sfx} onChange=${function(v){ props.setAudio({sfx:v}); }}
          items=${[{v:true,l:T.on},{v:false,l:T.off}]}/></div>
      <div class="field"><span class="label">${T.music}</span>
        <${Seg} value=${au.music} onChange=${function(v){ props.setAudio({music:v}); }}
          items=${[{v:true,l:T.on},{v:false,l:T.off}]}/></div>
      <div class="field"><span class="label">${T.volume}</span>
        <${Seg} value=${au.vol} onChange=${function(v){ props.setAudio({vol:v}); }}
          items=${[{v:0.35,l:T.low},{v:0.75,l:T.medium},{v:1,l:T.high}]}/></div>
      <div class="field"><span class="label">${T.motion}</span>
        <${Seg} value=${!!s.calm} onChange=${function(v){patch("calm",v);}}
          items=${[{v:false,l:T.motionFull},{v:true,l:T.motionCalm}]}/></div>
      <div class="field"><span class="label">${T.fullscreen}</span>
        <div><button class="btn sm ghost" onClick=${function(){ sfx("click"); toggleFullscreen(); }}>
          ${document.fullscreenElement?T.exitFs:T.enterFs}</button></div></div>
    </div>
    <p class="hint" style=${{marginTop:"14px"}}>${T.settingsNote}</p>
    <div style=${{marginTop:"18px"}}>
      <button class="btn lg" onClick=${function(){ sfx("click"); props.go("home"); }}>${T.gotIt}</button></div>
  </div>`;
}

/* ============================ setup ============================ */
function Setup(props){
  var bank=props.bank;
  var cs=useState(clone(props.settings)), cfg=cs[0], setCfg=cs[1];
  function patch(k,v){ setCfg(function(p){ var n=Object.assign({},p); n[k]=v; return n; }); }
  function setCount(n){
    setCfg(function(p){
      var ts=p.teams.slice(0,n);
      while(ts.length<n) ts.push({name:(LANG==="en"?"Team ":"Equipo ")+(ts.length+1),color:TEAM_COLORS[ts.length]});
      return Object.assign({},p,{teams:ts});
    });
  }
  function setTeam(i,k,v){ setCfg(function(p){ var ts=clone(p.teams); ts[i][k]=v; return Object.assign({},p,{teams:ts}); }); }
  var pool=useMemo(function(){ return poolFor(bank,cfg); },[bank,cfg.difficulty,cfg.language,cfg.verifiedOnly]);
  var perCat=CATS.map(function(c){ return {c:c,n:pool.filter(function(q){return q.cat===c.id;}).length}; });
  var thin=perCat.some(function(x){ return x.n<3; });
  return html`<div class="wrap" style=${{paddingBottom:"48px"}}>
    <${TopBar} back=${function(){props.go("home");}} title=${T.setup}
      audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="card" style=${{marginBottom:"18px"}}>
      <div class="field"><span class="label">${T.numTeams}</span>
        <${Seg} value=${cfg.teams.length} onChange=${setCount}
          items=${[2,3,4].map(function(n){return {v:n,l:n+" "+T.howManyTeams};})}/></div>
      <div style=${{display:"grid",gap:"11px",marginTop:"16px"}}>
        ${cfg.teams.map(function(tm,i){ return html`<div key=${i} class="team-row" style=${{"--tc":tm.color}}>
          <div class="field"><span class="label">${T.teamName} ${i+1}</span>
            <input type="text" id=${"team-name-"+i} value=${tm.name} maxLength="22"
              onChange=${function(e){ setTeam(i,"name",e.target.value); }}/></div>
          <div class="field" style=${{flex:"2 1 250px"}}><span class="label">${T.color}</span>
            <div class="swatches">${TEAM_COLORS.map(function(col){
              return html`<button key=${col} class="swatch" style=${{background:col}} aria-label=${col}
                aria-pressed=${String(tm.color===col)} onClick=${function(){ sfx("click"); setTeam(i,"color",col); }}></button>`;
            })}</div></div>
        </div>`; })}
      </div>
    </div>
    <div class="card grid2" style=${{marginBottom:"18px"}}>
      <div class="field"><span class="label">${T.language}</span>
        <${Seg} value=${cfg.language} onChange=${function(v){patch("language",v);}}
          items=${LANGS.map(function(l){return {v:l.id,l:l.name};})}/>
        <span class="hint">${T.langHint}</span></div>
      <div class="field"><span class="label">${T.difficulty}</span>
        <${Seg} value=${cfg.difficulty} onChange=${function(v){patch("difficulty",v);}}
          items=${[{v:"easy",l:T.easy},{v:"medium",l:T.medium},{v:"hard",l:T.hard},{v:"mixed",l:T.mixed}]}/></div>
      <div class="field"><span class="label">${T.timeLimit}</span>
        <${Seg} value=${cfg.timer} onChange=${function(v){patch("timer",v);}}
          items=${[15,20,30,45,60].map(function(v){return {v:v,l:v+" "+T.sec};})}/></div>
      <div class="field"><span class="label">${T.needed}</span>
        <${Seg} value=${cfg.needed} onChange=${function(v){patch("needed",v);}}
          items=${[1,2,3].map(function(v){return {v:v,l:String(v)};})}/>
        <span class="hint">${T.neededHint}</span></div>
      <div class="field"><span class="label">${T.chain}</span>
        <${Seg} value=${cfg.chain||1} onChange=${function(v){patch("chain",v);}}
          items=${[{v:1,l:T.chainOff},{v:2,l:"2"},{v:3,l:"3"},{v:5,l:"5"}]}/>
        <span class="hint">${T.chainHint}</span></div>
      <div class="field"><span class="label">${T.earn}</span>
        <${Seg} value=${cfg.earn!==false} onChange=${function(v){patch("earn",v);}}
          items=${[{v:true,l:T.on},{v:false,l:T.off}]}/>
        <span class="hint">${T.earnHint}</span></div>
      <div class="field"><span class="label">${T.options}</span>
        <${Seg} value=${cfg.shuffleOpts} onChange=${function(v){patch("shuffleOpts",v);}}
          items=${[{v:true,l:T.shuffleOpts},{v:false,l:T.fixedOpts}]}/></div>
      <div class="field"><span class="label">${T.verified}</span>
        <${Seg} value=${!!cfg.verifiedOnly} onChange=${function(v){patch("verifiedOnly",v);}}
          items=${[{v:true,l:T.onlyVerified},{v:false,l:T.anyQ}]}/></div>
    </div>
    <div class="card flat" style=${{marginBottom:"18px"}}>
      <div class="eyebrow">${pool.length} ${T.available}</div>
      <div class="row" style=${{marginTop:"11px",gap:"7px"}}>
        ${perCat.map(function(x){ return html`<span key=${x.c.id} class="tag cat" style=${catVars(x.c.id)}>
          ${subj(x.c)} ${x.n}</span>`; })}
      </div>
      ${thin?html`<p class="hint" style=${{marginTop:"11px"}}>${T.shortBank}</p>`:null}
    </div>
    <button class="btn lg block" disabled=${pool.length===0}
      onClick=${function(){ audioResume(); sfx("click"); props.onStart(cfg); }}>${T.startMatch}</button>
  </div>`;
}

/* ============================ question bank ============================ */
function blankQ(){
  return {cat:"prophecy",dif:"easy",a:0,verified:false,
    en:{q:"",o:["","","",""],e:"",ref:""},
    es:{q:"",o:["","","",""],e:"",ref:""}};
}
function QForm(props){
  var st=useState(props.value), v=st[0], setV=st[1];
  function p(k,val){ setV(function(o){ var n=clone(o); n[k]=val; return n; }); }
  function ps(lang,k,val){ setV(function(o){ var n=clone(o); n[lang][k]=val; return n; }); }
  function po(lang,i,val){ setV(function(o){ var n=clone(o); n[lang].o[i]=val; return n; }); }
  var valid=(fullSide(v.en)||fullSide(v.es));
  function langBlock(lang,label){
    var sd=v[lang];
    return html`<div class="card flat" style=${{marginTop:"16px"}}>
      <div class="eyebrow">${label}</div>
      <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.question}</span>
        <input type="text" id=${"qf-q-"+lang} value=${sd.q} onChange=${function(e){ ps(lang,"q",e.target.value); }}/></div>
      <div class="field" style=${{marginTop:"14px"}}><span class="label">${T.options}</span>
        ${[0,1,2,3].map(function(i){ return html`<div key=${i} class="row" style=${{gap:"9px",marginBottom:"7px",flexWrap:"nowrap"}}>
          <span style=${{width:"30px",height:"30px",display:"grid",placeItems:"center",borderRadius:"50%",flex:"0 0 auto",
            background:v.a===i?"var(--good)":"rgba(255,255,255,.14)",color:v.a===i?"#02331c":"#fff",
            fontWeight:900,fontSize:"13px"}}>${"ABCD".charAt(i)}</span>
          <input type="text" id=${"qf-o-"+lang+"-"+i} value=${sd.o[i]} onChange=${function(e){ po(lang,i,e.target.value); }}/></div>`; })}
      </div>
      <div class="field" style=${{marginTop:"14px"}}><span class="label">${T.scripture}</span>
        <input type="text" id=${"qf-ref-"+lang} value=${sd.ref} onChange=${function(e){ ps(lang,"ref",e.target.value); }}/></div>
      <div class="field" style=${{marginTop:"14px"}}><span class="label">${T.explanation}</span>
        <input type="text" id=${"qf-e-"+lang} value=${sd.e} onChange=${function(e){ ps(lang,"e",e.target.value); }}/></div>
    </div>`;
  }
  return html`<div class="card" style=${{marginBottom:"16px",borderColor:"var(--gold)"}}>
    <div class="grid2">
      <div class="field"><span class="label">${T.category}</span>
        <${Seg} value=${v.cat} onChange=${function(x){p("cat",x);}} items=${CATS.map(function(c){return {v:c.id,l:subj(c)};})}/></div>
      <div class="field"><span class="label">${T.difficulty}</span>
        <${Seg} value=${v.dif} onChange=${function(x){p("dif",x);}} items=${DIFFS.map(function(d){return {v:d,l:T[d]};})}/></div>
      <div class="field"><span class="label">${T.answer}</span>
        <${Seg} value=${v.a} onChange=${function(x){p("a",x);}} items=${[0,1,2,3].map(function(i){return {v:i,l:"ABCD".charAt(i)};})}/></div>
      <div class="field"><span class="label">${T.verified}</span>
        <${Seg} value=${!!v.verified} onChange=${function(x){p("verified",x);}}
          items=${[{v:true,l:T.verified},{v:false,l:T.unverified}]}/>
        <span class="hint">${T.verifyHint}</span></div>
    </div>
    ${langBlock("es",T.esText)}
    ${langBlock("en",T.bothLangs)}
    <div class="row" style=${{marginTop:"18px"}}>
      <button class="btn" disabled=${!valid} onClick=${function(){ sfx("click"); props.onSave(v); }}>${T.save}</button>
      <button class="btn ghost" onClick=${function(){ sfx("click"); props.onCancel(); }}>${T.cancel}</button>
    </div>
  </div>`;
}

function Bank(props){
  var bank=props.bank, setBank=props.setBank;
  var f=useState({cat:"all",dif:"all",ver:"all",q:""}), flt=f[0], setFlt=f[1];
  var e=useState(null), editing=e[0], setEditing=e[1];
  var io=useState(null), ioMode=io[0], setIoMode=io[1];
  var tx=useState(""), text=tx[0], setText=tx[1];
  var ts=useState(null), toast=ts[0], setToast=ts[1];
  var fm=useState("json"), fmt=fm[0], setFmt=fm[1];
  var cf=useState(null), confirm=cf[0], setConfirm=cf[1];
  function patch(k,v){ setFlt(function(p){ var n=Object.assign({},p); n[k]=v; return n; }); }
  var list=useMemo(function(){
    var needle=flt.q.trim().toLowerCase();
    return bank.filter(function(q){
      if(flt.cat!=="all"&&q.cat!==flt.cat) return false;
      if(flt.dif!=="all"&&q.dif!==flt.dif) return false;
      if(flt.ver==="yes"&&!q.verified) return false;
      if(flt.ver==="no"&&q.verified) return false;
      if(needle){
        var a=side(q,"en"), b=side(q,"es");
        var hay=(a.q+" "+a.o.join(" ")+" "+a.ref+" "+b.q+" "+b.o.join(" ")+" "+b.ref).toLowerCase();
        if(hay.indexOf(needle)<0) return false;
      }
      return true;
    });
  },[bank,flt]);
  var pending=bank.filter(function(q){ return !q.verified; }).length;
  function save(v){
    var n=normalize(v); if(!n){ setToast(T.badData); return; }
    setBank(function(b){
      if(v.id){ return b.map(function(q){ return q.id===v.id?Object.assign(n,{id:v.id}):q; }); }
      return b.concat([Object.assign(n,{id:uid("BIB-")})]);
    });
    setEditing(null); setToast(T.saved);
  }
  function del(id){ setBank(function(b){ return b.filter(function(q){ return q.id!==id; }); }); }
  function doExport(kind){ setFmt(kind); setIoMode("export"); setText(kind==="json"?JSON.stringify(bank,null,1):toCSV(bank)); }
  function doImport(replace){
    var parsed; try{ parsed=parseImport(text); }catch(err){ parsed=null; }
    if(!parsed||!parsed.length){ setToast(T.badData); return; }
    setBank(function(b){ return replace?parsed:b.concat(parsed); });
    setToast(parsed.length+" "+T.imported); setIoMode(null); setText("");
  }
  function selectArea(){ var a=document.getElementById("io-area"); if(a){ a.focus(); a.select(); } }
  function copyOut(){
    try{ navigator.clipboard.writeText(text).then(function(){ setToast(T.copied); },selectArea); }
    catch(err){ selectArea(); }
  }
  return html`<div class="wrap" style=${{paddingBottom:"48px"}}>
    <${TopBar} back=${function(){props.go("home");}} title=${T.bank}
      audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="card">
      <div class="toolbar">
        <div class="field"><span class="label">${T.search}</span>
          <input type="text" id="bank-search" value=${flt.q} placeholder="…" onChange=${function(ev){patch("q",ev.target.value);}}/></div>
        <div class="field"><span class="label">${T.category}</span>
          <select id="bank-cat" value=${flt.cat} onChange=${function(ev){patch("cat",ev.target.value);}}>
            <option value="all">${T.all}</option>
            ${CATS.map(function(c){ return html`<option key=${c.id} value=${c.id}>${subj(c)}</option>`; })}
          </select></div>
        <div class="field"><span class="label">${T.difficulty}</span>
          <select id="bank-dif" value=${flt.dif} onChange=${function(ev){patch("dif",ev.target.value);}}>
            <option value="all">${T.all}</option>
            ${DIFFS.map(function(d){ return html`<option key=${d} value=${d}>${T[d]}</option>`; })}
          </select></div>
        <div class="field"><span class="label">${T.verified}</span>
          <select id="bank-ver" value=${flt.ver} onChange=${function(ev){patch("ver",ev.target.value);}}>
            <option value="all">${T.all}</option>
            <option value="yes">${T.verified}</option>
            <option value="no">${T.unverified}</option>
          </select></div>
      </div>
      <div class="row" style=${{marginTop:"14px"}}>
        <button class="btn sm" onClick=${function(){ sfx("click"); setEditing(blankQ()); setIoMode(null); }}>+ ${T.addQ}</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); setIoMode("import"); setText(""); setEditing(null); }}>${T.importT}</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); doExport("json"); setEditing(null); }}>${T.exportT} JSON</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); doExport("csv"); setEditing(null); }}>${T.exportT} CSV</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); setConfirm("restore"); }}>${T.restoreDefaults}</button>
        <span class="spacer"></span><span class="chip tnum">${list.length} / ${bank.length}</span>
      </div>
      ${pending?html`<p class="hint" style=${{marginTop:"10px"}}>${pending} ${T.reviewFlag}</p>`:null}
      ${confirm==="restore"?html`<div class="confirm" style=${{marginTop:"12px"}}>
        <div style=${{marginBottom:"9px"}}>${T.restoreDefaults} — ${T.confirmSure}</div>
        <div class="row">
          <button class="btn sm danger" onClick=${function(){ setBank(defaultBank()); setConfirm(null); setToast(T.saved); }}>${T.yes}</button>
          <button class="btn sm ghost" onClick=${function(){ setConfirm(null); }}>${T.no}</button>
        </div></div>`:null}
    </div>

    ${ioMode==="export"?html`<div class="card" style=${{marginTop:"16px"}}>
      <div class="row between"><span class="eyebrow">${T.exportT} · ${fmt.toUpperCase()}</span>
        <button class="icon-btn" onClick=${function(){setIoMode(null);}} aria-label=${T.close}>✕</button></div>
      <p class="hint" style=${{margin:"8px 0 10px"}}>${T.exportHint}</p>
      <textarea id="io-area" readOnly value=${text}></textarea>
      <div class="row" style=${{marginTop:"12px"}}>
        <button class="btn sm" onClick=${copyOut}>${T.copy}</button>
        <button class="btn sm ghost" onClick=${function(){ doExport(fmt==="json"?"csv":"json"); }}>${fmt==="json"?"CSV":"JSON"}</button>
      </div></div>`:null}

    ${ioMode==="import"?html`<div class="card" style=${{marginTop:"16px"}}>
      <div class="row between"><span class="eyebrow">${T.importT}</span>
        <button class="icon-btn" onClick=${function(){setIoMode(null);}} aria-label=${T.close}>✕</button></div>
      <p class="hint" style=${{margin:"8px 0 10px"}}>${T.importHint}</p>
      <textarea id="io-area" value=${text} onChange=${function(ev){ setText(ev.target.value); }}></textarea>
      <div class="row" style=${{marginTop:"12px"}}>
        <button class="btn sm" onClick=${function(){ doImport(false); }}>${T.merge}</button>
        <button class="btn sm ghost" onClick=${function(){ doImport(true); }}>${T.replaceAll}</button>
      </div></div>`:null}

    ${editing?html`<div style=${{marginTop:"16px"}}>
      <${QForm} value=${editing} onSave=${save} onCancel=${function(){setEditing(null);}}/></div>`:null}

    <div class="bank-list">
      ${list.length?list.map(function(q){
        var c=catOf(q.cat), v=side(q);
        return html`<div key=${q.id} class="qrow" style=${catVars(q.cat)}>
          <div class="meta">
            <span class="tag cat">${subj(c)}</span>
            <span class="tag">${T[q.dif]}</span>
            ${v.ref?html`<span class="tag ref">${v.ref}</span>`:null}
            <span class=${"tag"+(q.verified?"":" warn")}>${q.verified?T.verified:T.unverified}</span>
            <span class="tag">${q.id}</span>
            <span class="spacer"></span>
            <button class="btn sm ghost" onClick=${function(){ sfx("click"); setEditing(clone(q)); setIoMode(null); window.scrollTo({top:0,behavior:"smooth"}); }}>${T.edit}</button>
            <button class="btn sm ghost" onClick=${function(){ sfx("click"); del(q.id); }}>${T.del}</button>
          </div>
          <div class="qq">${v.q}</div>
          <div class="ans">${"ABCD".charAt(q.a)}. ${v.o[q.a]}</div>
          <div class="exp">${v.e}</div>
        </div>`;
      }):html`<div class="empty">${T.noQuestions}</div>`}
    </div>
    ${toast?html`<${Toast} msg=${toast} onDone=${function(){setToast(null);}}/>`:null}
  </div>`;
}

/* ============================ app ============================ */
var DEFAULT_SETTINGS={
  teams:[{name:"Equipo 1",color:TEAM_COLORS[0]},{name:"Equipo 2",color:TEAM_COLORS[1]}],
  language:"es", difficulty:"mixed", timer:30, needed:2,
  shuffleOpts:true, verifiedOnly:true, calm:false,
  chain:3, earn:true
};
function App(){
  var sc=useState("home"), screen=sc[0], setScreen=sc[1];
  var bs=useState(loadBank), bank=bs[0], setBank=bs[1];
  var ss=useState(function(){ return Object.assign({},DEFAULT_SETTINGS,lsGet("bc.settings",{})); }), settings=ss[0], setSettings=ss[1];
  var ad=useState(function(){ return Object.assign({sfx:true,music:true,vol:0.75},lsGet("bc.audio",{})); }), audio=ad[0], setAudioState=ad[1];
  var ms=useState(function(){
    var saved=lsGet("bc.match",null);
    /* a saved match from an older shape is better dropped than opened broken */
    if(saved&&saved.teams&&saved.teams.length&&saved.teams[0].progress&&saved.settings){
      if(saved.phase==="spinning"||saved.phase==="reveal") saved.phase="spin";
      saved.teams.forEach(function(t){
        migrateLifelines(t);
        if(t.crownWins===undefined) t.crownWins=0;
        if(t.streak===undefined) t.streak=0;
        if(t.best===undefined) t.best=0;
      });
      if(saved.timeMax===undefined) saved.timeMax=saved.settings.timer||30;
      if(!saved.settings.language) saved.settings.language="es";
      if(!saved.settings.chain) saved.settings.chain=1;
      if(saved.settings.earn===undefined) saved.settings.earn=false;
      if(!saved.chain) saved.chain=1;
      saved.consult=null; saved.paused=false;
      saved.hidden=null; saved.second=false; saved.strike=null;
      return saved;
    }
    return null;
  }), match=ms[0], setMatch=ms[1];

  /* the language in play: a running match keeps the one it was started with */
  var lang=(screen==="game"&&match&&match.settings.language)||settings.language;
  setLang(lang);

  function setAudio(patch){
    setAudioState(function(p){ var n=Object.assign({},p,patch); applyAudio(n); audioResume(); return n; });
  }
  useEffect(function(){ lsSet("bc.bank",bank); },[bank]);
  useEffect(function(){ lsSet("bc.settings",settings); },[settings]);
  useEffect(function(){ lsSet("bc.audio",audio); applyAudio(audio); },[audio]);
  useEffect(function(){ if(match) lsSet("bc.match",match); else lsDel("bc.match"); },[match]);
  useEffect(function(){ document.documentElement.lang=lang; },[lang]);
  useEffect(function(){
    document.documentElement.classList.toggle("calm",!!settings.calm);
  },[settings.calm]);
  useEffect(function(){
    function once(){ audioResume(); }
    window.addEventListener("pointerdown",once,{once:true});
    window.addEventListener("keydown",once,{once:true});
    return function(){ window.removeEventListener("pointerdown",once); window.removeEventListener("keydown",once); };
  },[]);
  useEffect(function(){ if(screen!=="game") musicStart("menu"); },[screen]);

  function start(cfg){
    setSettings(cfg);
    var teams=cfg.teams.map(function(tm,i){
      return {id:"t"+i+"_"+Date.now().toString(36),
        name:(tm.name||((LANG==="en"?"Team ":"Equipo ")+(i+1))).trim(),
        color:tm.color,score:0,correct:0,wrong:0,unlocked:[],progress:{},crownWins:0,
        streak:0,best:0,lifelines:freshLifelines()};
    });
    setMatch({settings:clone(cfg),teams:teams,turn:0,chain:1,used:{},log:[],phase:"spin",q:null,cat:null,
      pick:null,ok:null,gained:0,streakBonus:0,gotLL:null,again:false,
      pendingUnlock:null,crownMissed:false,hidden:null,second:false,strike:null,
      fromWheel:false,winner:null,paused:false,timeLeft:cfg.timer,timeMax:cfg.timer,startedAt:Date.now()});
    setScreen("game");
  }
  function newGame(){ setMatch(null); setScreen("setup"); }
  function exitHome(){ setScreen("home"); }

  var common={audio:audio,setAudio:setAudio,go:setScreen};
  var view;
  if(screen==="game"&&match){
    view=html`<${Game} match=${match} setMatch=${setMatch} bank=${bank}
      audio=${audio} setAudio=${setAudio} onExit=${exitHome} onNewGame=${newGame}/>`;
  } else if(screen==="setup"){
    view=html`<${Setup} ...${common} settings=${settings} bank=${bank} onStart=${start}/>`;
  } else if(screen==="howto"){
    view=html`<${HowTo} ...${common}/>`;
  } else if(screen==="settings"){
    view=html`<${Settings} ...${common} settings=${settings} setSettings=${setSettings}/>`;
  } else if(screen==="bank"){
    view=html`<${Bank} ...${common} bank=${bank} setBank=${setBank}/>`;
  } else {
    view=html`<${Home} ...${common} hasMatch=${!!(match&&match.phase!=="victory")}/>`;
  }
  return html`<${React.Fragment}><${Stars}/><div class="app">${view}</div><//>`;
}

var root=ReactDOM.createRoot(document.getElementById("root"));
function boot(){ root.render(html`<${App}/>`); }
if(window.claude&&window.claude.hot&&window.claude.hot.ready){ window.claude.hot.ready(boot); } else { boot(); }
})();
</script>
