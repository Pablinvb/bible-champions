/* ============================ host drawer ============================ */
/* The teacher's own controls. Anything that cannot be undone asks first. */
function Drawer(props){
  var m=props.match, setM=props.setMatch, s=m.settings, au=props.audio;
  var cf=useState(null), confirm=cf[0], setConfirm=cf[1];
  function patchSettings(k,v){
    setM(function(p){ var ns=Object.assign({},p.settings); ns[k]=v;
      var np=Object.assign({},p,{settings:ns});
      if(k==="timer"&&p.phase!=="question"){ np.timeLeft=v; np.timeMax=v; }
      return np; });
  }
  function bump(i,d){
    setM(function(p){ var ts=clone(p.teams); ts[i].score=Math.max(0,ts[i].score+d); return Object.assign({},p,{teams:ts}); });
  }
  function toggleChar(i,cid){
    setM(function(p){
      var ts=clone(p.teams), tm=ts[i], k=tm.unlocked.indexOf(cid);
      if(k>=0){ tm.unlocked.splice(k,1); tm.progress[cid]=0; }
      else { tm.unlocked.push(cid); tm.progress[cid]=p.settings.needed; }
      return Object.assign({},p,{teams:ts});
    });
  }
  function ask(msg,fn){ sfx("click"); setConfirm({msg:msg,fn:fn}); }
  return html`<aside class="drawer" role="dialog" aria-label=${T.teacher}>
    <div class="row between">
      <strong style=${{fontFamily:"var(--f-display)",fontSize:"19px"}}>${T.teacher}</strong>
      <button class="icon-btn" onClick=${props.onClose} aria-label=${T.close}>✕</button>
    </div>

    ${confirm?html`<div class="confirm">
      <div style=${{marginBottom:"9px"}}>${confirm.msg}</div>
      <div class="row">
        <button class="btn sm danger" onClick=${function(){ var f=confirm.fn; setConfirm(null); f(); }}>${T.yes}</button>
        <button class="btn sm ghost" onClick=${function(){ setConfirm(null); }}>${T.no}</button>
      </div></div>`:null}

    <h3>${T.pause}</h3>
    <div class="row">
      <button class=${"btn sm"+(m.paused?"":" ghost")}
        onClick=${function(){ sfx("click"); setM(function(p){return Object.assign({},p,{paused:!p.paused});}); }}>
        ${m.paused?T.unpause:T.pause}</button>
      <button class="btn sm ghost" disabled=${m.phase!=="question"}
        onClick=${function(){ sfx("click"); props.onSkip(); }}>${T.skip}</button>
    </div>

    <h3>${T.activeTeam}</h3>
    <${Seg} value=${m.turn} onChange=${function(v){ setM(function(p){ return Object.assign({},p,{turn:v}); }); }}
      items=${m.teams.map(function(tm,i){ return {v:i,l:tm.name}; })}/>

    <h3>${T.sound}</h3>
    <div class="row">
      <button class=${"btn sm"+(au.sfx?"":" ghost")} onClick=${function(){ props.setAudio({sfx:!au.sfx}); }}>
        ${T.sound}: ${au.sfx?T.on:T.off}</button>
      <button class=${"btn sm"+(au.music?"":" ghost")} onClick=${function(){ props.setAudio({music:!au.music}); }}>
        ${T.music}: ${au.music?T.on:T.off}</button>
    </div>
    <div class="field" style=${{marginTop:"10px"}}><span class="label">${T.volume}</span>
      <${Seg} value=${au.vol} onChange=${function(v){ props.setAudio({vol:v}); }}
        items=${[{v:0.35,l:T.low},{v:0.75,l:T.medium},{v:1,l:T.high}]}/></div>

    <h3>${T.adjust}</h3>
    ${m.teams.map(function(tm,i){ return html`<div key=${tm.id} class="row between" style=${{marginBottom:"8px"}}>
      <span class="row" style=${{gap:"8px",minWidth:0}}>
        <span style=${{width:"10px",height:"10px",borderRadius:"50%",background:tm.color,display:"inline-block"}}></span>
        <b style=${{fontSize:"13.5px"}}>${tm.name}</b>
        <span class="tnum muted" style=${{fontSize:"13px"}}>${tm.score}</span>
      </span>
      <span class="row" style=${{gap:"6px"}}>
        <button class="btn sm ghost" onClick=${function(){bump(i,-100);}}>−100</button>
        <button class="btn sm ghost" onClick=${function(){bump(i,100);}}>+100</button>
      </span></div>`; })}

    <h3>${T.chars}</h3>
    ${m.teams.map(function(tm,i){ return html`<div key=${tm.id} style=${{marginBottom:"12px"}}>
      <div class="row between" style=${{marginBottom:"6px"}}>
        <b style=${{fontSize:"13.5px"}}>${tm.name}</b>
        <span class="tnum muted" style=${{fontSize:"12px"}}>${tm.unlocked.length}/${CATS.length}</span>
      </div>
      <div class="row" style=${{gap:"6px"}}>
        ${CATS.map(function(c){ var got=tm.unlocked.indexOf(c.id)>=0;
          return html`<button key=${c.id} class="icon-btn" title=${cname(c)+" — "+(got?T.revoke:T.grant)}
            onClick=${function(){ if(got){ ask(T.revoke+": "+cname(c)+" — "+tm.name+"?",function(){ toggleChar(i,c.id); }); }
                                  else { sfx("click"); toggleChar(i,c.id); } }}
            style=${{padding:"2px",overflow:"hidden",width:"42px",height:"42px",
              borderColor:got?"var(--c-"+c.id+")":"var(--line)"}}>
            <${Tile} cat=${c.id} dim=${!got} style=${{width:"100%"}}/>
          </button>`; })}
      </div></div>`; })}

    <h3>${T.lifelines}</h3>
    ${m.teams.map(function(tm,i){ return html`<div key=${tm.id} class="row between" style=${{marginBottom:"8px"}}>
      <b style=${{fontSize:"13.5px"}}>${tm.name}</b>
      <span class="row" style=${{gap:"5px"}}>
        ${LIFELINES.map(function(l){
          /* one tap hands this team another one; the arrow puts the whole set back to one each */
          var n=llCount(tm,l.id);
          return html`<button key=${l.id} class=${"btn sm"+(n?"":" ghost")} style=${{padding:"7px 9px",gap:"5px"}}
            title=${llName(l.id)+" ×"+n+" — "+T.llGiveBack}
            onClick=${function(){ sfx("click"); setM(function(p){
              var ts=clone(p.teams);
              migrateLifelines(ts[i]);
              ts[i].lifelines[l.id]=Math.min(LL_CAP,llCount(ts[i],l.id)+1);
              return Object.assign({},p,{teams:ts});
            }); }}><${LLIcon} id=${l.id} size=${15}/><span class="tnum">${n}</span></button>`;
        })}
        <button class="btn sm ghost" style=${{padding:"7px 10px"}} title=${T.llReset}
          onClick=${function(){ sfx("click"); setM(function(p){
            var ts=clone(p.teams); ts[i].lifelines=freshLifelines();
            return Object.assign({},p,{teams:ts});
          }); }}>↺</button>
      </span></div>`; })}

    <h3>${T.setup}</h3>
    <div class="field"><span class="label">${T.timeLimit}</span>
      <${Seg} value=${s.timer} onChange=${function(v){patchSettings("timer",v);}}
        items=${[15,20,30,45,60].map(function(v){return {v:v,l:v+T.sec};})}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.needed}</span>
      <${Seg} value=${s.needed} onChange=${function(v){patchSettings("needed",v);}}
        items=${[1,2,3].map(function(v){return {v:v,l:String(v)};})}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.difficulty}</span>
      <${Seg} value=${s.difficulty} onChange=${function(v){patchSettings("difficulty",v);}}
        items=${[{v:"easy",l:T.easy},{v:"medium",l:T.medium},{v:"hard",l:T.hard},{v:"mixed",l:T.mixed}]}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.chain}</span>
      <${Seg} value=${s.chain||1} onChange=${function(v){patchSettings("chain",v);}}
        items=${[{v:1,l:T.chainOff},{v:2,l:"2"},{v:3,l:"3"},{v:5,l:"5"}]}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.earn}</span>
      <${Seg} value=${s.earn!==false} onChange=${function(v){patchSettings("earn",v);}}
        items=${[{v:true,l:T.on},{v:false,l:T.off}]}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.language}</span>
      <${Seg} value=${s.language} onChange=${function(v){patchSettings("language",v);}}
        items=${LANGS.map(function(l){return {v:l.id,l:l.name};})}/></div>

    <h3>${T.review}</h3>
    ${m.log.length?m.log.slice(0,14).map(function(L,i){
      return html`<div key=${i} class="log-item" style=${{"--lc":L.ok?"var(--good)":"var(--bad)"}}>
        <b>${L.team}</b> · ${subj(catOf(L.cat))}${L.crown?" ♛":""} · ${L.ok?T.correct:(L.timeout?T.timeup:T.incorrect)}<br/>
        <span class="muted">${L.q}</span></div>`;
    }):html`<p class="muted" style=${{fontSize:"13.5px"}}>${T.noLog}</p>`}

    <h3>${T.restart}</h3>
    <div class="row">
      <button class="btn sm ghost" onClick=${function(){ ask(T.restart+" — "+T.confirmSure,props.onRestart); }}>${T.restart}</button>
      <button class="btn sm ghost" onClick=${function(){ ask(T.exit+" — "+T.confirmSure,props.onExit); }}>${T.exit}</button>
    </div>
  </aside>`;
}

/* ============================ game ============================ */
/* Seats ring the wheel: two face each other, a third sits below, a fourth set takes the corners. */
function seatStyle(i,n){
  var maps={
    2:[{gridColumn:1,gridRow:2},{gridColumn:3,gridRow:2}],
    3:[{gridColumn:1,gridRow:2},{gridColumn:3,gridRow:2},{gridColumn:2,gridRow:3}],
    4:[{gridColumn:1,gridRow:1},{gridColumn:3,gridRow:1},{gridColumn:1,gridRow:3},{gridColumn:3,gridRow:3}]
  };
  var m=maps[n]||maps[2];
  return m[i]||{gridColumn:1,gridRow:2};
}
function Sparks(){
  var bits=[];
  for(var i=0;i<18;i++){
    var a=i/18*6.283, d=120+Math.random()*120;
    bits.push(html`<i key=${i} style=${{"--dx":(Math.cos(a)*d).toFixed(0)+"px",
      "--dy":(Math.sin(a)*d).toFixed(0)+"px",animationDelay:(i*0.03)+"s"}}></i>`);
  }
  return html`<span class="sparks" aria-hidden="true">${bits}</span>`;
}
function Game(props){
  var m=props.match, setM=props.setMatch, bank=props.bank;
  var s=m.settings, team=m.teams[m.turn];
  var st=useState(0), rot=st[0], setRot=st[1];
  var du=useState(5.2), dur=du[0], setDur=du[1];
  var sp=useState(false), spinning=sp[0], setSpinning=sp[1];
  var tc=useState(false), turnCard=tc[0], setTurnCard=tc[1];
  var seat=useRef(-1);
  var ld=useState(false), landed=ld[0], setLanded=ld[1];
  var dr=useState(false), drawer=dr[0], setDrawer=dr[1];
  var to=useState(null), toast=to[0], setToast=to[1];
  var fl=useState(false), flash=fl[0], setFlash=fl[1];
  var timers=useRef([]);
  useEffect(function(){ return function(){ timers.current.forEach(clearTimeout); }; },[]);
  function later(fn,ms){ var id=setTimeout(fn,ms); timers.current.push(id); return id; }

  /* the wheel passing from one team to the next is the beat of the game: announce it */
  useEffect(function(){
    if(m.phase==="victory"){ seat.current=-1; return; }
    if(seat.current===m.turn) return;
    seat.current=m.turn;
    setTurnCard(true);
    later(function(){ setTurnCard(false); },1700);
  },[m.turn,m.phase]);

  useEffect(function(){
    if(m.phase==="question") musicStart("quiz");
    else if(m.phase==="victory") musicStart("victory");
    else musicStart("board");
  },[m.phase]);

  useEffect(function(){
    if(m.phase!=="question"||m.paused||m.consult) return;
    var iv=setInterval(function(){
      setM(function(p){
        if(p.phase!=="question"||p.paused||p.consult) return p;
        return Object.assign({},p,{timeLeft:Math.max(0,Math.round((p.timeLeft-0.25)*100)/100)});
      });
    },250);
    return function(){ clearInterval(iv); };
  },[m.phase,m.paused,!!m.consult]);
  useEffect(function(){ if(m.phase==="question"&&m.timeLeft<=0) answer(null); },[m.phase,m.timeLeft]);
  useEffect(function(){
    if(m.phase==="question"&&!m.paused&&!m.consult&&m.timeLeft>0&&m.timeLeft<=5&&m.timeLeft%1===0) sfx("tick");
  },[m.timeLeft]);

  /* the "ask a team" window runs on its own clock while the question clock waits */
  useEffect(function(){
    if(!m.consult||m.paused) return;
    var iv=setInterval(function(){
      setM(function(p){
        if(!p.consult||p.paused) return p;
        var left=Math.max(0,Math.round((p.consult.left-0.25)*100)/100);
        return Object.assign({},p,{consult:left<=0?null:{left:left,total:p.consult.total}});
      });
    },250);
    return function(){ clearInterval(iv); };
  },[!!m.consult,m.paused]);
  useEffect(function(){
    if(m.consult&&!m.paused&&m.consult.left>0&&m.consult.left<=5&&m.consult.left%1===0) sfx("tick");
  },[m.consult&&m.consult.left]);

  /* a match never runs on past a full collection, however the champion was granted */
  useEffect(function(){
    if(m.phase==="victory"||m.phase==="unlock"||m.pendingUnlock) return;
    for(var i=0;i<m.teams.length;i++){
      if(m.teams[i].unlocked.length>=CATS.length){
        sfx("win"); confetti(11000);
        setM(function(p){ return Object.assign({},p,{phase:"victory",winner:i,endedAt:Date.now()}); });
        return;
      }
    }
  },[m.teams,m.phase]);

  useEffect(function(){
    function onKey(ev){
      var tag=(ev.target&&ev.target.tagName)||"";
      if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT") return;
      if(m.paused) return;
      if(m.phase==="question"){
        var k=String(ev.key).toLowerCase();
        var i="abcd".indexOf(k); if(i<0) i="1234".indexOf(k);
        if(i>=0){ ev.preventDefault(); answer(i); }
      } else if(ev.key===" "||ev.key==="Enter"){
        if(m.phase==="spin"){ ev.preventDefault(); spin(); }
        else if(m.phase==="feedback"){ ev.preventDefault(); cont(); }
        else if(m.phase==="unlock"){ ev.preventDefault(); collect(); }
        else if(m.phase==="crownIntro"){ ev.preventDefault(); toPick(); }
      }
    }
    window.addEventListener("keydown",onKey);
    return function(){ window.removeEventListener("keydown",onKey); };
  },[m,rot,spinning]);

  /* One place decides what an answer is worth: points by difficulty, the streak bonus, the
     crown bonus, the unlock bonus, whether this answer completes a champion, whether it earns
     a lifeline, and whether the team keeps the wheel. */
  function resolveAnswer(p,pick){
    var q=p.q, ok=(pick!==null&&pick===q.a);
    var teams=clone(p.teams), tm=teams[p.turn];
    var gained=0, unlock=null, crownMissed=false, bonus=0, got=null;
    if(ok){
      gained=POINTS[q.dif]||100;
      tm.correct++;
      tm.streak=(tm.streak||0)+1;
      if(tm.streak>(tm.best||0)) tm.best=tm.streak;
      bonus=streakBonus(tm.streak);
      gained+=bonus;
      if(q.crown){ gained+=CROWN_BONUS; tm.crownWins=(tm.crownWins||0)+1; }
      if(tm.unlocked.indexOf(q.cat)<0){
        if(q.crown){
          /* the crown challenge wins the champion outright, whatever `needed` says */
          tm.progress[q.cat]=p.settings.needed; tm.unlocked.push(q.cat); unlock=q.cat;
        } else {
          tm.progress[q.cat]=(tm.progress[q.cat]||0)+1;
          if(tm.progress[q.cat]>=p.settings.needed){ tm.unlocked.push(q.cat); unlock=q.cat; }
        }
        if(unlock) gained+=UNLOCK_BONUS;
      }
      tm.score+=gained;
      /* a prize for the streak, and one for the crown — never two from the same answer */
      if(p.settings.earn){
        if(tm.streak%STREAK_STEP===0) got=grantLifeline(tm);
        else if(q.crown) got=grantLifeline(tm);
      }
    } else {
      tm.wrong++;
      tm.streak=0;
      if(q.crown) crownMissed=true;
    }
    var log=p.log.slice(0,59);
    log.unshift({team:tm.name,cat:q.cat,ok:ok,timeout:pick===null,crown:!!q.crown,q:q.q});
    return Object.assign({},p,{phase:"feedback",teams:teams,pick:pick,ok:ok,gained:gained,
      streakBonus:bonus,gotLL:got,again:ok&&(p.chain||1)<(p.settings.chain||1),
      pendingUnlock:unlock,crownMissed:crownMissed,log:log,consult:null,second:false});
  }
  function answer(pick){
    if(m.phase!=="question") return;
    /* a second chance swallows the first wrong answer: that option is struck out and the
       team carries on against the same clock */
    if(pick!==null&&pick!==m.q.a&&m.second){
      sfx("bad");
      setM(function(p){ return Object.assign({},p,{second:false,strike:pick}); });
      return;
    }
    var next=resolveAnswer(m,pick);
    sfx(next.ok?"good":"bad");
    setM(next);
  }
  function cont(){
    sfx("click");
    if(m.pendingUnlock){ sfx("unlock"); confetti(3000); setM(Object.assign({},m,{phase:"unlock"})); return; }
    setM(Object.assign({},m,{crownMissed:false}));
    later(m.again?sameTeam:nextTurn,10);
  }
  function collect(){
    sfx("click");
    var next=Object.assign({},m,{pendingUnlock:null,crownMissed:false});
    if(m.teams[m.turn].unlocked.length>=CATS.length){
      sfx("win"); confetti(11000);
      setM(Object.assign(next,{phase:"victory",winner:m.turn,endedAt:Date.now()}));
      return;
    }
    setM(next);
    later(m.again?sameTeam:nextTurn,10);
  }
  /* A lifeline is spent from the team's own stock. Five of them, and each one changes the
     question in a different way: more time, a pause to consult, fewer wrong options, a second
     attempt, or a different question from the same subject. */
  function llOff(l){
    return llCount(team,l.id)<1||!!m.consult
      ||(l.mode==="fifty"&&!!m.hidden)
      ||(l.mode==="second"&&!!m.second);
  }
  function useLifeline(id){
    if(m.phase!=="question"||m.paused||m.consult) return;
    var spec=llSpec(id);
    if(!spec||llOff(spec)) return;
    sfx(spec.mode==="fifty"?"land":"unlock");
    setM(function(p){
      var teams=clone(p.teams), tm=teams[p.turn];
      var left=llCount(tm,id)-1;
      if(left<0) return p;
      tm.lifelines[id]=left;
      if(spec.mode==="extend")
        return Object.assign({},p,{teams:teams,
          timeLeft:p.timeLeft+spec.secs,
          timeMax:(p.timeMax||p.settings.timer)+spec.secs});
      if(spec.mode==="consult")
        return Object.assign({},p,{teams:teams,consult:{left:spec.secs,total:spec.secs}});
      if(spec.mode==="second")
        return Object.assign({},p,{teams:teams,second:true});
      if(spec.mode==="fifty"){
        /* clear away the wrong options but always leave one standing beside the answer, so a
           bomb after a second chance is still a choice and not a free point */
        var wrongs=[0,1,2,3].filter(function(i){ return i!==p.q.a&&i!==p.strike; });
        return Object.assign({},p,{teams:teams,hidden:shuffle(wrongs).slice(0,Math.max(0,wrongs.length-1))});
      }
      /* swap: a new question from the same subject, on a fresh clock */
      var d=drawQuestion(p,p.q.cat,!!p.q.crown);
      if(!d) return p;
      return Object.assign({},p,{teams:teams,q:d.q,used:d.used,recycled:d.recycled,
        timeLeft:p.settings.timer,timeMax:p.settings.timer,
        pick:null,ok:null,hidden:null,second:false,strike:null});
    });
  }
  function toPick(){ sfx("click"); setM(function(p){ return Object.assign({},p,{phase:"crownPick"}); }); }
  /* A turn ends the same way whether the team keeps the wheel after a correct answer or
     hands it on; only the seat and the spin counter differ. */
  function freshTurn(p,same){
    return Object.assign({},p,{phase:"spin",
      turn:same?p.turn:(p.turn+1)%p.teams.length,
      chain:same?(p.chain||1)+1:1,
      q:null,cat:null,pick:null,ok:null,gained:0,streakBonus:0,gotLL:null,again:false,
      pendingUnlock:null,crownMissed:false,fromWheel:false,
      timeLeft:p.settings.timer,timeMax:p.settings.timer,
      consult:null,recycled:false,hidden:null,second:false,strike:null});
  }
  function nextTurn(){ setLanded(false); setM(function(p){ return freshTurn(p,false); }); }
  function sameTeam(){ setLanded(false); setM(function(p){ return freshTurn(p,true); }); }
  function drawQuestion(p,catId,isCrown){
    var pool=poolFor(bank,p.settings).filter(function(q){ return q.cat===catId; });
    if(!pool.length) return null;
    var used=p.used||{};
    var avail=pool.filter(function(q){ return !used[q.id]; });
    var recycled=false;
    /* never block a match for running out: the subject's questions come back round */
    if(!avail.length){ used=Object.assign({},used); pool.forEach(function(q){ delete used[q.id]; }); avail=pool; recycled=true; }
    var row=avail[Math.floor(Math.random()*avail.length)];
    var v=side(row,p.settings.language);
    var order=p.settings.shuffleOpts?shuffle([0,1,2,3]):[0,1,2,3];
    var nu=Object.assign({},used); nu[row.id]=1;
    return {used:nu,recycled:recycled,q:{
      id:row.id,cat:row.cat,dif:row.dif,crown:!!isCrown,verified:!!row.verified,
      q:v.q,o:order.map(function(k){return v.o[k];}),a:order.indexOf(row.a),e:v.e,ref:v.ref}};
  }
  function loadQuestion(catId,isCrown){
    setM(function(p){
      var d=drawQuestion(p,catId,isCrown);
      if(!d) return Object.assign({},p,{phase:isCrown?"crownPick":"spin",noPool:true});
      return Object.assign({},p,{phase:"question",q:d.q,used:d.used,
        timeLeft:p.settings.timer,timeMax:p.settings.timer,consult:null,
        pick:null,ok:null,recycled:d.recycled,noPool:false,
        hidden:null,second:false,strike:null});
    });
  }
  useEffect(function(){ if(m.noPool){ setToast(T.noQuestions); setM(function(p){return Object.assign({},p,{noPool:false});}); } },[m.noPool]);
  useEffect(function(){ if(m.recycled){ setToast(T.recycled); setM(function(p){return Object.assign({},p,{recycled:false});}); } },[m.recycled]);

  function spin(){
    if(spinning||m.phase!=="spin"||m.paused) return;
    audioResume(); setLanded(false);
    var i=Math.floor(Math.random()*WHEEL.length);
    /* no two spins alike: between five and seven turns, and never quite the same length */
    var turns=5+Math.floor(Math.random()*3);
    var secs=calmMode()?1.2:(4.6+Math.random()*1.2);
    var target=(360-(i*SEG+SEG/2)+360)%360;
    var delta=(((target-(rot%360))%360)+360)%360;
    setDur(secs);
    setRot(rot+360*turns+delta); setSpinning(true); sfx("whoosh");
    later(function(){
      setSpinning(false); setLanded(true); sfx("land");
      var hit=WHEEL[i];
      setM(function(p){ return Object.assign({},p,{phase:"reveal",cat:hit.id}); });
      later(function(){
        if(hit.id==="crown"){
          sfx("crown");
          setFlash(true); later(function(){ setFlash(false); },1100);
          setM(function(p){ return Object.assign({},p,{phase:"crownIntro",fromWheel:true}); });
        } else {
          loadQuestion(hit.id,false);
        }
      },1500);
    },secs*1000+60);
  }
  function skip(){ setDrawer(false); nextTurn(); }
  function restart(){
    setDrawer(false); setLanded(false);
    setM(function(p){
      var ts=p.teams.map(function(tm){ var n=clone(tm);
        n.score=0; n.correct=0; n.wrong=0; n.unlocked=[]; n.progress={}; n.crownWins=0;
        n.streak=0; n.best=0; n.lifelines=freshLifelines(); return n; });
      return Object.assign({},p,{teams:ts,turn:0,chain:1,used:{},log:[],phase:"spin",q:null,cat:null,
        pick:null,ok:null,gained:0,streakBonus:0,gotLL:null,again:false,
        pendingUnlock:null,crownMissed:false,hidden:null,second:false,strike:null,
        fromWheel:false,winner:null,paused:false,timeLeft:p.settings.timer,timeMax:p.settings.timer});
    });
  }

  if(m.phase==="victory"){
    var w=m.teams[m.winner];
    var ranked=m.teams.slice().sort(function(a,b){ return (b.unlocked.length-a.unlocked.length)||(b.score-a.score); });
    return html`<div class="wrap victory">
      <div style=${{fontSize:"58px",lineHeight:1}}>🏆</div>
      <div class="eyebrow">${T.winner}</div>
      <h2 class="winner-name">${w.name}</h2>
      <span class="chip gold tnum" style=${{fontSize:"16px"}}>${T.finalScore}: ${w.score} ${T.pts}</span>
      <div class="winner-cast">${CATS.map(function(c){ return html`<${Tile} key=${c.id} cat=${c.id} on=${true}/>`; })}</div>
      <${Tile} cat="crown" style=${{width:"120px"}}/>
      <div class="card results">
        <div class="eyebrow" style=${{marginBottom:"12px"}}>${T.summary}</div>
        <table><thead><tr>
          <th>${T.team}</th><th>${T.characters}</th><th>${T.crowns}</th>
          <th>${T.hits}</th><th>${T.misses}</th><th>${T.bestStreak}</th>
          <th style=${{textAlign:"right"}}>${T.score}</th>
        </tr></thead><tbody>
        ${ranked.map(function(tm){ return html`<tr key=${tm.id}>
          <td><span style=${{display:"inline-block",width:"9px",height:"9px",borderRadius:"50%",
            background:tm.color,marginRight:"9px"}}></span>${tm.name}</td>
          <td class="tnum">${tm.unlocked.length}/${CATS.length}</td>
          <td class="tnum">${tm.crownWins||0}</td>
          <td class="tnum">${tm.correct}</td><td class="tnum">${tm.wrong}</td>
          <td class="tnum">${tm.best||0}</td>
          <td class="num">${tm.score}</td>
        </tr>`; })}
        </tbody></table>
      </div>
      <div class="row" style=${{justifyContent:"center"}}>
        <button class="btn lg" onClick=${function(){ sfx("click"); restart(); }}>${T.playAgain}</button>
        <button class="btn lg ghost" onClick=${function(){ sfx("click"); props.onNewGame(); }}>${T.newGame}</button>
      </div>
    </div>`;
  }

  var middle;
  if(m.phase==="question"||m.phase==="feedback"){
    var q=m.q, c=catOf(q.cat), done=m.phase==="feedback";
    var tmax=m.timeMax||s.timer;
    var pct=clamp(m.timeLeft/tmax*100,0,100);
    var prog=(team.progress&&team.progress[q.cat])||0;
    middle=html`<div class=${"qcard"+(q.crown?" crown":"")} style=${catVars(q.cat)}>
      <div class="qhead">
        <${Tile} cat=${q.cat}/>
        <span class="cat">${cname(c)}</span>
        <span class="tag cat">${subj(c)}</span>
        ${q.crown?html`<span class="chip gold">♛ ${T.crownQuestion}</span>`:null}
        <span class="tag">${T[q.dif]} · ${POINTS[q.dif]}</span>
        ${!q.crown&&team.unlocked.indexOf(q.cat)<0
          ?html`<span class="tag">${T.progress} ${Math.min(prog,s.needed)}/${s.needed}</span>`:null}
        ${!q.verified?html`<span class="tag warn">${T.unverified}</span>`:null}
      </div>
      <div class="timer-track"><div class=${"timer-fill"+(m.timeLeft<=5?" warn":"")} style=${{width:pct+"%"}}></div></div>
      <h2 class="qtext">${q.q}</h2>
      <div class="opts">
        ${q.o.map(function(txt,i){
          var gone=!!(m.hidden&&m.hidden.indexOf(i)>=0), struck=(m.strike===i);
          var cls="opt";
          if(gone) cls+=" gone";
          if(struck&&!done) cls+=" struck";
          if(done){ cls+= i===q.a?" correct":(i===m.pick?" wrong":" dim"); }
          return html`<button key=${i} class=${cls} disabled=${done||m.paused||gone||struck}
            onClick=${function(){ answer(i); }}>
            <span class="key">${"ABCD".charAt(i)}</span><span>${txt}</span></button>`;
        })}
      </div>
      ${!done?html`<div class="lifelines">
        ${LIFELINES.map(function(l){
          var n=llCount(team,l.id), armed=(l.mode==="second"&&m.second);
          return html`<button key=${l.id} class=${"ll"+(armed?" armed":"")} disabled=${llOff(l)}
            title=${llHint(l.id)} onClick=${function(){ useLifeline(l.id); }}>
            <${LLIcon} id=${l.id}/>
            <span class="nm">${llName(l.id)}</span>
            <span class="secs">${armed?T.llArmed:(n?"×"+n:T.llUsed)}</span></button>`;
        })}
      </div>`:null}
      ${done?html`<div class=${"verdict "+(m.ok?"ok":"no")}>
          <span class="big">${m.ok?T.correct:(m.pick===null?T.timeup:T.incorrect)}</span>
          ${m.ok?html`<span class="chip tnum">+${m.gained} ${T.pts}</span>`:null}
          ${m.streakBonus?html`<span class="chip flame tnum">🔥 ${team.streak} · +${m.streakBonus}</span>`:null}
          ${m.gotLL?html`<span class="chip gold">${T.llEarned}: ${llName(m.gotLL)}</span>`:null}
          ${m.crownMissed?html`<span class="chip">${T.crownMissed}</span>`:null}
          ${m.again?html`<span class="chip">${T.keepPlaying}</span>`:null}
        </div>
        <div class="explain">
          ${q.ref?html`<span class="tag ref scripture">${q.ref}</span><br/>`:null}
          ${!m.ok?html`<b>${T.answerWas}: ${"ABCD".charAt(q.a)}. ${q.o[q.a]}</b><br/>`:null}
          ${q.e}
          ${m.ok&&!m.pendingUnlock&&!q.crown&&team.unlocked.indexOf(q.cat)>=0
            ?html`<div style=${{marginTop:"7px",fontSize:"13.5px"}}>${T.already}</div>`:null}
        </div>
        <button class="btn block" onClick=${cont}>${m.pendingUnlock?T.collect:(m.again?T.keepTurn:T.next)}</button>`:null}
    </div>`;
  } else if(m.phase==="crownPick"){
    var mine=m.teams[m.turn];
    middle=html`<div style=${{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px",width:"100%"}}>
      <div style=${{textAlign:"center"}}>
        <div class="eyebrow">♛ ${T.crownQuestion}</div>
        <h2 style=${{fontSize:"clamp(20px,2.8vw,28px)",marginTop:"5px"}}>${T.crownPick}</h2>
      </div>
      <div class="crown-pick">
        ${CATS.map(function(c){
          var got=mine.unlocked.indexOf(c.id)>=0;
          return html`<button key=${c.id} class="pick-btn" style=${catVars(c.id)} disabled=${got}
            onClick=${function(){ sfx("click"); loadQuestion(c.id,true); }}>
            <${Tile} cat=${c.id} dim=${got} on=${!got}/>
            <span class="nm">${c.short}</span>
            <span class="got">${got?T.collected:subj(c)}</span>
          </button>`;
        })}
      </div>
    </div>`;
  } else if(m.phase==="reveal"){
    var rc=catOf(m.cat);
    middle=html`<${React.Fragment}>
      <${Wheel} rot=${rot} dur=${dur} spinning=${false} landed=${landed} disabled=${true} onSpin=${function(){}}/>
      <div class="cat-reveal" style=${catVars(m.cat)}>
        <${Tile} cat=${m.cat} on=${true}/>
        <span class="nm">${rc.short}<small>${subj(rc)}</small></span></div>
    <//>`;
  } else {
    /* the hub stays dead unless it really is this team's moment to spin: an overlay on top of
       it (unlock, crown) must not leave a live button underneath */
    middle=html`<${Wheel} rot=${rot} dur=${dur} spinning=${spinning} landed=${landed}
      disabled=${m.paused||m.phase!=="spin"} onSpin=${spin}/>`;
  }

  return html`<div class="wrap">
    <div class="topbar">
      <span class="brand">Bible <span>Champions</span></span>
      <span class="spacer"></span>
      ${m.paused?html`<span class="chip">⏸ ${T.paused}</span>`:null}
      <button class="icon-btn" title=${T.music}
        onClick=${function(){ props.setAudio({music:!props.audio.music}); }}>${props.audio.music?"♪":"𝄽"}</button>
      <button class="icon-btn" title=${T.teacher} onClick=${function(){ sfx("click"); setDrawer(true); }}>⚙</button>
    </div>
    <div class="turn-bar" style=${{"--tc":team.color}}>
      <span class="eyebrow">${T.turn}</span>
      <span class="who">${team.name}</span>
      ${s.chain>1?html`<span class="chip tnum">${T.spinOf} ${m.chain||1}/${s.chain}</span>`:null}
      <span class="spacer"></span>
      ${team.streak>=2?html`<span class="chip flame tnum">🔥 ${team.streak}</span>`:null}
      <span class="chip tnum">${team.score} ${T.pts}</span>
      <span class="chip tnum">${team.unlocked.length}/${CATS.length}</span>
    </div>
    <${Standings} teams=${m.teams} turn=${m.turn}/>
    <div class="arena">
      <div class="center">${middle}</div>
      ${m.teams.map(function(tm,i){
        return html`<div key=${tm.id} class="seat" style=${seatStyle(i,m.teams.length)}>
          <${TeamCard} team=${tm} settings=${s} active=${i===m.turn}/></div>`;
      })}
    </div>

    ${flash?html`<div class="goldflash" aria-hidden="true"></div>`:null}

    ${turnCard&&m.phase==="spin"?html`<div class="turn-card" style=${{"--tc":team.color}} aria-hidden="true">
      <div class="inner">
        <span class="eyebrow">${T.turnOf}</span>
        <span class="nm">${team.name}</span>
        <span class="row" style=${{justifyContent:"center"}}>
          <span class="chip tnum">${team.score} ${T.pts}</span>
          <span class="chip tnum">${team.unlocked.length}/${CATS.length}</span>
        </span>
      </div></div>`:null}

    ${m.consult?html`<div class="overlay">
      <div class="sheet">
        <div class="eyebrow">${T.consultTitle}</div>
        <div style=${{color:"var(--gold)"}}><${LLIcon} id="ask" size=${54}/></div>
        <div class="consult-num tnum">${Math.ceil(m.consult.left)}</div>
        <div class="consult-ring"><i style=${{width:(m.consult.left/m.consult.total*100)+"%"}}></i></div>
        <p class="muted" style=${{fontWeight:700}}>${T.consultSub}</p>
        <button class="btn lg block" onClick=${function(){ sfx("click"); setM(function(p){ return Object.assign({},p,{consult:null}); }); }}>${T.consultDone}</button>
      </div></div>`:null}

    ${m.phase==="unlock"&&m.pendingUnlock?html`<div class="overlay">
      <div class="rays"></div>
      <div class="sheet" style=${catVars(m.pendingUnlock)}>
        <${Sparks}/>
        <div class="eyebrow">${T.unlocked}</div>
        <${Tile} cat=${m.pendingUnlock} cls="hero" on=${true}/>
        <h2 style=${{color:"var(--cc)",fontSize:"clamp(21px,3.4vw,30px)"}}>${cname(catOf(m.pendingUnlock))}</h2>
        <span class="chip gold tnum">${team.name} · +${UNLOCK_BONUS} ${T.pts}</span>
        <button class="btn lg block" onClick=${collect}>${T.collect}</button>
      </div></div>`:null}

    ${m.phase==="crownIntro"?html`<div class="overlay">
      <div class="rays"></div>
      <div class="sheet">
        <${Sparks}/>
        <div class="eyebrow">${m.fromWheel?T.crownLanded:T.crownQuestion}</div>
        <${Tile} cat="crown" cls="hero"/>
        <h2 class="crown-title">${T.crownPower}</h2>
        <span class="chip gold">${team.name}</span>
        <p class="muted" style=${{fontWeight:600,fontSize:"14.5px"}}>${T.crownIntro}</p>
        <button class="btn lg block" onClick=${toPick}>${T.continueB}</button>
      </div></div>`:null}

    ${drawer?html`<${Drawer} match=${m} setMatch=${setM} audio=${props.audio} setAudio=${props.setAudio}
      onClose=${function(){setDrawer(false);}} onSkip=${skip} onRestart=${restart} onExit=${props.onExit}/>`:null}
    ${toast?html`<${Toast} msg=${toast} onDone=${function(){setToast(null);}}/>`:null}
  </div>`;
}
