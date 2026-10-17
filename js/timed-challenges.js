// timed-challenges.js — challenges chronométrés optionnels, séparés de la progression pédagogique.

const TIMED_CHALLENGE_CONFIG = {
  durations: [180, 300, 600],
  questionsByDuration: { 180: 5, 300: 8, 600: 12 },
  paths: [
    { id:"all", label:"Tous les parcours" },
    { id:"javascript", label:"JavaScript" },
    { id:"react", label:"React" },
    { id:"css", label:"CSS" },
    { id:"html", label:"HTML" },
    { id:"typescript", label:"TypeScript" },
    { id:"node", label:"Node.js" },
    { id:"sql", label:"SQL" }
  ]
};

function timedChallengeState(){
  if(!state.timedChallenges || typeof state.timedChallenges !== "object"){
    state.timedChallenges={ history:[], best:{}, totalSessions:0, totalCorrect:0, totalAnswered:0 };
  }
  state.timedChallenges.history = Array.isArray(state.timedChallenges.history)?state.timedChallenges.history:[];
  state.timedChallenges.best = state.timedChallenges.best || {};
  return state.timedChallenges;
}

function timedChallengeSources(){
  return [
    ["javascript", typeof EXERCISES!=="undefined"?EXERCISES:[]],
    ["react", typeof REACT_EXERCISES!=="undefined"?REACT_EXERCISES:[]],
    ["css", typeof CSS_EXERCISES!=="undefined"?CSS_EXERCISES:[]],
    ["html", typeof HTML_EXERCISES!=="undefined"?HTML_EXERCISES:[]],
    ["typescript", typeof TYPESCRIPT_EXERCISES!=="undefined"?TYPESCRIPT_EXERCISES:[]],
    ["node", typeof NODE_EXERCISES!=="undefined"?NODE_EXERCISES:[]],
    ["sql", typeof SQL_EXERCISES!=="undefined"?SQL_EXERCISES:[]]
  ];
}

function timedChallengePool(path="all", difficulty="all"){
  const supported=new Set(["qcm","vf"]);
  return timedChallengeSources().flatMap(([pathId,items])=>items.map(ex=>({ ...ex, challengePath:pathId })))
    .filter(ex=>supported.has(ex.type))
    .filter(ex=>path==="all" || ex.challengePath===path)
    .filter(ex=>difficulty==="all" || Number(ex.difficulty||1)===Number(difficulty));
}

function timedShuffle(list){
  const out=[...list];
  for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}

function timedChallengeAnswer(ex,value){
  if(ex.type==="qcm") return Number(value)===Number(ex.answer);
  if(ex.type==="vf") return String(value)===String(Boolean(ex.answer));
  return false;
}

function timedChallengeKey(session){return [session.path,session.difficulty,session.duration].join(":");}
function timedFormat(seconds){seconds=Math.max(0,Math.ceil(seconds));const m=Math.floor(seconds/60),s=seconds%60;return `${m}:${String(s).padStart(2,"0")}`;}
function timedPathLabel(id){return (TIMED_CHALLENGE_CONFIG.paths.find(p=>p.id===id)||{label:id}).label;}

function timedChallengeStats(){
  const st=timedChallengeState(), sessions=st.history.length;
  const accuracy=st.totalAnswered?Math.round(st.totalCorrect/st.totalAnswered*100):0;
  const bestScore=Object.values(st.best).reduce((m,x)=>Math.max(m,Number(x.score||0)),0);
  return { sessions, accuracy, bestScore };
}

function timedChallengeSaveResult(session){
  const st=timedChallengeState();
  const result={
    at:new Date().toISOString(), path:session.path, difficulty:session.difficulty, duration:session.duration,
    correct:session.correct, answered:session.answered, total:session.questions.length,
    score: session.answered?Math.round(session.correct/session.answered*100):0,
    finished:Boolean(session.finished), expired:Boolean(session.expired)
  };
  st.history.unshift(result); st.history=st.history.slice(0,30);
  st.totalSessions=(st.totalSessions||0)+1;
  st.totalCorrect=(st.totalCorrect||0)+session.correct;
  st.totalAnswered=(st.totalAnswered||0)+session.answered;
  const key=timedChallengeKey(session), prev=st.best[key];
  if(!prev || result.correct>prev.correct || (result.correct===prev.correct && result.score>prev.score)) st.best[key]=result;
  saveState(state);
  return result;
}

function renderTimedChallenges(){
  timedChallengeState();
  let session=null, timerId=null;
  const host=h("div",{class:"timed-challenge-host"});

  function stopTimer(){ if(timerId){clearInterval(timerId);timerId=null;} }
  function setup(){
    stopTimer();
    const stats=timedChallengeStats();
    const pathSelect=h("select",{class:"timed-select","aria-label":"Parcours"},TIMED_CHALLENGE_CONFIG.paths.map(p=>h("option",{value:p.id},p.label)));
    const difficulty=h("select",{class:"timed-select","aria-label":"Difficulté"},
      h("option",{value:"all"},"Toutes difficultés"),h("option",{value:"1"},"Facile"),h("option",{value:"2"},"Normal"),h("option",{value:"3"},"Difficile"));
    const duration=h("select",{class:"timed-select","aria-label":"Durée"},
      h("option",{value:"180"},"3 minutes"),h("option",{value:"300",selected:true},"5 minutes"),h("option",{value:"600"},"10 minutes"));
    const msg=h("p",{class:"muted small","aria-live":"polite"});
    const start=h("button",{class:"btn primary big",type:"button",onclick:()=>{
      const dur=Number(duration.value), pool=timedChallengePool(pathSelect.value,difficulty.value), wanted=TIMED_CHALLENGE_CONFIG.questionsByDuration[dur]||8;
      if(!pool.length){msg.textContent="Aucun challenge compatible avec ces filtres.";return;}
      session={path:pathSelect.value,difficulty:difficulty.value,duration:dur,questions:timedShuffle(pool).slice(0,Math.min(wanted,pool.length)),index:0,correct:0,answered:0,answers:[],startedAt:Date.now(),deadline:Date.now()+dur*1000,finished:false,expired:false,saved:false};
      drawQuestion(); startTimer();
    }},"Démarrer le challenge");
    host.replaceChildren(
      h("div",{class:"page timed-challenge-page"},
        h("p",{class:"crumbs"},link("/","Accueil")," / Challenges chronométrés"),
        h("section",{class:"timed-hero"},h("div",{},h("span",{class:"eyebrow"},"CHALLENGES CHRONOMÉTRÉS"),h("h1",{},"Teste tes réflexes, sans pression"),para("Choisis un parcours, une difficulté et une durée. Le chrono est optionnel : aucune erreur ne retire d’XP et le temps écoulé ne bloque jamais ton apprentissage.","lead")),h("div",{class:"timed-stats"},metric(stats.sessions,"sessions"),metric(stats.accuracy+" %","précision"),metric(stats.bestScore+" %","meilleur score"))),
        h("section",{class:"block timed-setup"},h("h2",{},"Préparer une session"),h("div",{class:"timed-form"},h("label",{},h("span",{},"Parcours"),pathSelect),h("label",{},h("span",{},"Difficulté"),difficulty),h("label",{},h("span",{},"Durée"),duration)),h("div",{class:"toolbar"},start,link("/dashboard","Retour au dashboard","btn")),msg),
        h("section",{class:"callout"},h("strong",{},"Règle du mode"),para("Les questions sont tirées des exercices existants, mais les réponses données ici n’écrasent pas ta progression normale. Le mode mesure seulement ta performance dans les challenges.","muted")),
        renderTimedHistory()
      )
    );
  }

  function startTimer(){
    stopTimer();
    timerId=setInterval(()=>{
      if(!session)return stopTimer();
      const remaining=Math.max(0,(session.deadline-Date.now())/1000);
      const el=document.querySelector("[data-timed-clock]"); if(el)el.textContent=timedFormat(remaining);
      if(remaining<=0){session.expired=true;finish();}
    },250);
  }

  function drawQuestion(){
    const ex=session.questions[session.index]; if(!ex)return finish();
    const remaining=Math.max(0,(session.deadline-Date.now())/1000);
    const feedback=h("div",{class:"timed-feedback","aria-live":"polite"});
    const form=h("div",{class:"timed-answer-list"});
    let selected=null;
    if(ex.type==="qcm") ex.options.forEach((opt,i)=>{
      const input=h("input",{type:"radio",name:"timed-answer",value:String(i)}); input.addEventListener("change",()=>selected=input.value);
      form.append(h("label",{class:"timed-answer"},input,h("span",{},opt)));
    });
    else ["true","false"].forEach(v=>{
      const input=h("input",{type:"radio",name:"timed-answer",value:v}); input.addEventListener("change",()=>selected=input.value);
      form.append(h("label",{class:"timed-answer"},input,h("span",{},v==="true"?"Vrai":"Faux")));
    });
    const validate=h("button",{class:"btn primary",type:"button",onclick:()=>{
      if(selected===null){feedback.replaceChildren(h("p",{class:"error"},"Choisis une réponse avant de valider."));return;}
      const ok=timedChallengeAnswer(ex,selected); session.answered++; if(ok)session.correct++;
      session.answers.push({id:ex.id,ok,path:ex.challengePath});
      feedback.replaceChildren(h("p",{class:ok?"success":"error"},ok?"✓ Bonne réponse":"✗ Pas cette fois"),ex.explanation?para(ex.explanation,"muted small"):null);
      form.querySelectorAll("input").forEach(x=>x.disabled=true); validate.disabled=true;
      const next=h("button",{class:"btn",type:"button",onclick:()=>{session.index++;drawQuestion();}},session.index===session.questions.length-1?"Voir le résultat":"Question suivante →");
      feedback.append(next);
    }},"Valider");
    host.replaceChildren(h("div",{class:"page timed-challenge-page"},
      h("p",{class:"crumbs"},link("/challenges","Challenges")," / Session"),
      h("section",{class:"timed-session-head"},h("div",{},h("span",{class:"eyebrow"},timedPathLabel(session.path)),h("h1",{},"Question "+(session.index+1)+" / "+session.questions.length)),h("div",{class:"timed-clock","data-timed-clock":""},timedFormat(remaining))),
      h("section",{class:"block timed-question"},h("div",{class:"timed-question-meta"},h("span",{class:"badge"},ex.challengePath.toUpperCase()),h("span",{class:"badge"},"Difficulté "+(ex.difficulty||1))),h("h2",{},ex.question||ex.statement||ex.notion),ex.code?h("pre",{},h("code",{},ex.code)):null,form,h("div",{class:"toolbar"},validate,h("button",{class:"btn",type:"button",onclick:()=>finish(true)},"Arrêter la session")),feedback),
      h("section",{class:"callout"},h("strong",{},"Aucune pénalité"),para("Une mauvaise réponse ou un chrono écoulé ne retire jamais d’XP et ne marque pas l’exercice original comme échoué.","muted"))
    ));
  }

  function finish(abandoned=false){
    stopTimer(); if(!session)return setup(); session.finished=!abandoned&&!session.expired&&session.index>=session.questions.length-1;
    if(!session.saved){timedChallengeSaveResult(session);session.saved=true;}
    const score=session.answered?Math.round(session.correct/session.answered*100):0;
    const title=session.expired?"Temps écoulé":abandoned?"Session arrêtée":"Challenge terminé";
    host.replaceChildren(h("div",{class:"page timed-challenge-page"},
      h("p",{class:"crumbs"},link("/challenges","Challenges")," / Résultat"),
      h("section",{class:"timed-result-hero"},h("span",{class:"eyebrow"},"RÉSULTAT"),h("h1",{},title),para(session.expired?"Le chrono est terminé. Ton résultat est conservé sans aucune pénalité.":"Voici ta performance sur cette session.","lead"),h("div",{class:"timed-result-grid"},metric(session.correct+" / "+session.answered,"bonnes réponses"),metric(score+" %","précision"),metric(session.questions.length,"questions prévues"))),
      h("section",{class:"block"},h("h2",{},score>=80?"Très bons réflexes":"Ce mode sert à progresser, pas à te noter"),para(score>=80?"Tu réponds vite tout en restant précis. Essaie une difficulté supérieure ou un autre parcours.":"Rejoue plus tard, change de durée ou entraîne-toi sans chrono dans les exercices normaux.","muted"),h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:setup},"Nouveau challenge"),link("/adaptatif","Voir mon parcours adaptatif","btn"),link("/dashboard","Dashboard","btn")))
    ));
  }

  setup(); return host;
}

function renderTimedHistory(){
  const rows=timedChallengeState().history.slice(0,6);
  return h("section",{class:"block"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"HISTORIQUE"),h("h2",{},"Tes dernières sessions"))),
    rows.length?h("ul",{class:"rows compact"},rows.map(r=>h("li",{class:"row"},h("div",{class:"row-main"},h("strong",{},timedPathLabel(r.path)+" · "+Math.round(r.duration/60)+" min"),para(r.correct+" bonne(s) réponse(s) sur "+r.answered+" · "+r.score+" %","muted small")),h("span",{class:"status "+(r.score>=80?"ok":r.score>=50?"review":"todo")},r.score+" %")))):empty("Aucune session chronométrée pour le moment."));
}
