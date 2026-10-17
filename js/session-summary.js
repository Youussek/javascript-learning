// session-summary.js — résumé automatique d'une session d'apprentissage.
// Les données sont dérivées des sources existantes : progression/gamification, erreurs, journal et modes d'entraînement.

const SESSION_SUMMARY_IDLE_MS = 45 * 60 * 1000;
const SESSION_SUMMARY_ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const SESSION_SUMMARY_MAX_HISTORY = 40;
const SESSION_SUMMARY_STORAGE_KEY = "cahierCode.session.v1";

function sessionSummaryState(){
  if(!state.sessionSummaries || typeof state.sessionSummaries !== "object") state.sessionSummaries={history:[]};
  if(!Array.isArray(state.sessionSummaries.history)) state.sessionSummaries.history=[];
  return state.sessionSummaries;
}

function sessionRuntimeRead(){
  try{
    const raw=sessionStorage.getItem(SESSION_SUMMARY_STORAGE_KEY);
    const parsed=raw?JSON.parse(raw):null;
    if(parsed && Number(parsed.startedAt)>0) return parsed;
  }catch{}
  const now=Date.now();
  return {id:"session-"+now.toString(36),startedAt:now,lastSeenAt:now,lastInteractionAt:now,activeMs:0};
}

let sessionRuntime=sessionRuntimeRead();
function sessionRuntimeSave(){
  try{sessionStorage.setItem(SESSION_SUMMARY_STORAGE_KEY,JSON.stringify(sessionRuntime));}catch{}
}

function sessionPathMeta(id){
  const p=(typeof LEARNING_PATHS!=="undefined"?LEARNING_PATHS:[]).find(x=>x.id===id);
  const fallback={javascript:"JavaScript",html:"HTML",css:"CSS",react:"React",typescript:"TypeScript",node:"Node.js",sql:"SQL",git:"Git"};
  return {id:id||"general",title:p?.title||fallback[id]||"Général",mark:p?.mark||id?.toUpperCase?.()||"•"};
}

function sessionIsoMs(value){
  if(value==null) return 0;
  if(typeof value==="number") return value;
  const n=Date.parse(value); return Number.isFinite(n)?n:0;
}
function sessionInRange(value,start,end){const t=sessionIsoMs(value);return t>=start&&t<=end;}

function sessionExerciseMap(){
  const rows=typeof gamificationAllExercises==="function"?gamificationAllExercises():[];
  return new Map(rows.map(ex=>[String(ex.id),ex]));
}

function sessionSummaryCollect(startAt=sessionRuntime.startedAt,endAt=Date.now(),activeMs=sessionRuntime.activeMs){
  const xpEvents=(typeof ensureGamificationState==="function"?ensureGamificationState().xpEvents:[])
    .filter(e=>!e.backfill && e.type!=="dailyBonus" && sessionInRange(e.at,startAt,endAt));
  const activityEvents=xpEvents.filter(e=>e.type!=="firstTry");
  const firstTries=xpEvents.filter(e=>e.type==="firstTry").length;
  const totalXp=xpEvents.reduce((n,e)=>n+Number(e.xp||0),0);
  const byType={}; const byPath={};
  activityEvents.forEach(e=>{byType[e.type]=(byType[e.type]||0)+1;if(e.path)byPath[e.path]=(byPath[e.path]||0)+1;});

  const errors=(Array.isArray(state.errorHistory)?state.errorHistory:[]).filter(e=>sessionInRange(e.lastSeenAt||e.createdAt,startAt,endAt));
  const openErrors=errors.filter(e=>!e.resolvedAt || sessionIsoMs(e.resolvedAt)>endAt);
  const resolvedErrors=(Array.isArray(state.errorHistory)?state.errorHistory:[]).filter(e=>sessionInRange(e.resolvedAt,startAt,endAt));

  const journals=(state.learningJournal?.entries||[]).filter(e=>sessionInRange(e.createdAt,startAt,endAt));
  const challenges=(state.timedChallenges?.history||[]).filter(e=>sessionInRange(e.at,startAt,endAt));
  const interviews=(state.technicalInterview?.history||[]).filter(e=>sessionInRange(e.at,startAt,endAt));
  const exams=(state.examMode?.history||[]).filter(e=>sessionInRange(e.at,startAt,endAt));

  const exMap=sessionExerciseMap();
  const notions=new Map();
  activityEvents.filter(e=>e.type==="exercise").forEach(e=>{
    const ex=exMap.get(String(e.resourceId));
    const notion=ex?.notion;
    if(notion) notions.set(notion,(notions.get(notion)||0)+1);
  });
  resolvedErrors.forEach(e=>{if(e.notion)notions.set(e.notion,(notions.get(e.notion)||0)+1);});
  const strengthened=[...notions.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>({name,count}));

  const difficulties=new Map();
  errors.forEach(e=>{const k=e.notion||e.title||"Notion à revoir";difficulties.set(k,(difficulties.get(k)||0)+(Number(e.repeatCount)||1));});
  journals.forEach(e=>{if(String(e.unclear||"").trim()){const k=e.contextTitle||sessionPathMeta(e.pathId).title;difficulties.set(k,(difficulties.get(k)||0)+1);}});
  const weak=[...difficulties.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([name,count])=>({name,count}));

  const paths=[...new Set([...Object.keys(byPath),...errors.map(e=>e.path).filter(Boolean),...journals.map(e=>e.pathId).filter(Boolean)])];
  const meaningful=activityEvents.length+errors.length+journals.length+challenges.length+interviews.length+exams.length;
  const durationMs=Math.max(0,endAt-startAt);

  let next="Continue avec la prochaine activité recommandée par ton parcours adaptatif.";
  if(weak.length) next="Priorité : renforcer « "+weak[0].name+" » avant d'enchaîner.";
  else if(typeof adaptiveSummary==="function"){
    try{const a=adaptiveSummary();if(a?.weak) next="Ton parcours adaptatif détecte encore "+a.weak+" priorité"+(a.weak>1?"s":"")+" à renforcer.";}catch{}
  }

  return {
    id:sessionRuntime.id,startAt,endAt,activeMs:Number(activeMs)||0,durationMs,meaningful,totalXp,firstTries,
    byType,byPath,paths,strengthened,weak,next,
    errors:errors.length,openErrors:openErrors.length,resolvedErrors:resolvedErrors.length,journalEntries:journals.length,
    challenges:challenges.length,interviews:interviews.length,exams:exams.length,
    challengeBest:challenges.length?Math.max(...challenges.map(x=>Number(x.accuracy||x.score||0))):null,
    interviewBest:interviews.length?Math.max(...interviews.map(x=>Number(x.score||0))):null,
    examBest:exams.length?Math.max(...exams.map(x=>Number(x.score||0))):null,
    createdAt:new Date(endAt).toISOString()
  };
}

function sessionSummaryHasActivity(summary){return Boolean(summary&&summary.meaningful>0);}
function sessionFormatDuration(ms){
  const min=Math.max(0,Math.round(Number(ms||0)/60000));
  if(min<1) return "< 1 min";
  if(min<60) return min+" min";
  const h=Math.floor(min/60),m=min%60; return h+" h"+(m?" "+m+" min":"");
}
function sessionFormatDate(ms){try{return new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(ms));}catch{return "";}}

function sessionSummaryNarrative(s){
  if(!sessionSummaryHasActivity(s)) return "Aucune activité pédagogique significative n’a encore été détectée dans cette session.";
  const bits=[];
  if(s.byType.lesson) bits.push(s.byType.lesson+" leçon"+(s.byType.lesson>1?"s":"")+" terminée"+(s.byType.lesson>1?"s":""));
  if(s.byType.exercise) bits.push(s.byType.exercise+" exercice"+(s.byType.exercise>1?"s":"")+" réussi"+(s.byType.exercise>1?"s":""));
  if(s.byType.evaluation) bits.push(s.byType.evaluation+" évaluation"+(s.byType.evaluation>1?"s":"")+" validée"+(s.byType.evaluation>1?"s":""));
  if(s.byType.project||s.byType.threadStage||s.byType.threadProject) bits.push((Number(s.byType.project||0)+Number(s.byType.threadStage||0)+Number(s.byType.threadProject||0))+" étape/projet validé");
  if(s.challenges) bits.push(s.challenges+" challenge"+(s.challenges>1?"s":"")+" chronométré"+(s.challenges>1?"s":""));
  if(s.interviews) bits.push(s.interviews+" entretien"+(s.interviews>1?"s":"")+" simulé"+(s.interviews>1?"s":""));
  if(s.exams) bits.push(s.exams+" examen"+(s.exams>1?"s":"")+" rendu"+(s.exams>1?"s":""));
  const pathText=s.paths.length?s.paths.map(id=>sessionPathMeta(id).title).join(", "):"plusieurs activités";
  return "Tu as travaillé sur "+pathText+(bits.length?" : "+bits.join(", ")+".":".");
}

function sessionSummaryArchive(options={}){
  const endAt=Number(options.endAt)||Date.now();
  const summary=sessionSummaryCollect(sessionRuntime.startedAt,endAt,sessionRuntime.activeMs);
  if(sessionSummaryHasActivity(summary)){
    const store=sessionSummaryState();
    if(!store.history.some(x=>x.id===summary.id)){
      summary.automatic=Boolean(options.automatic);
      store.history.unshift(summary); store.history=store.history.slice(0,SESSION_SUMMARY_MAX_HISTORY);
      saveState(state);
    }
  }
  const now=Date.now();
  sessionRuntime={id:"session-"+now.toString(36),startedAt:now,lastSeenAt:now,lastInteractionAt:now,activeMs:0};
  sessionRuntimeSave();
  return summary;
}

function sessionSummaryStats(){
  const history=sessionSummaryState().history;
  const current=sessionSummaryCollect();
  const total=history.length;
  const activeMinutes=Math.round(history.reduce((n,s)=>n+Number(s.activeMs||0),0)/60000);
  return {history,current,total,activeMinutes,last:history[0]||null};
}

function sessionSummaryEndAndOpen(){
  const done=sessionSummaryArchive({automatic:false});
  try{sessionStorage.setItem("cahierCode.session.lastFinished",done.id);}catch{}
  location.hash="#/session";
  setTimeout(()=>{if(typeof router==="function")router();},0);
}

function sessionSummaryCard(summary,full=false){
  const s=summary;
  const typeLabels={lesson:"leçons",exercise:"exercices",learningLevel:"niveaux",evaluation:"évaluations",project:"projets",threadStage:"étapes fil rouge",threadProject:"fils rouges"};
  const activityRows=Object.entries(s.byType||{}).filter(([,n])=>n>0).map(([k,n])=>h("li",{},h("strong",{},String(n))," "+(typeLabels[k]||k)));
  const strengthened=s.strengthened?.length
    ? h("div",{class:"session-summary-section"},h("h3",{},"Notions renforcées"),h("div",{class:"session-tags"},...s.strengthened.map(x=>h("span",{class:"chip"},x.name))))
    : null;
  const weak=s.weak?.length
    ? h("div",{class:"session-summary-section warning"},h("h3",{},"À consolider"),h("div",{class:"session-tags"},...s.weak.map(x=>h("span",{class:"chip"},x.name))))
    : null;
  const paths=full&&s.paths?.length
    ? h("div",{class:"session-summary-section"},h("h3",{},"Parcours travaillés"),h("div",{class:"session-tags"},...s.paths.map(id=>h("span",{class:"chip"},sessionPathMeta(id).title))))
    : null;
  return h("article",{class:"session-summary-card"},
    h("div",{class:"session-summary-card-head"},h("div",{},h("span",{class:"eyebrow"},s.automatic?"SESSION ARCHIVÉE AUTOMATIQUEMENT":"SESSION"),h("h2",{},sessionFormatDate(s.startAt))),h("span",{class:"status "+(s.meaningful?"ok":"todo")},sessionFormatDuration(s.activeMs)+" actif")),
    para(sessionSummaryNarrative(s),"lead"),
    h("div",{class:"session-summary-metrics"},metric(s.totalXp+" XP","gagnés"),metric(s.firstTries,"premiers essais"),metric(s.errors,"erreurs rencontrées"),metric(s.resolvedErrors,"erreurs résolues")),
    activityRows.length?h("div",{class:"session-summary-section"},h("h3",{},"Activité"),h("ul",{class:"session-chip-list"},...activityRows)):null,
    strengthened,
    weak,
    h("div",{class:"session-summary-next"},h("strong",{},"Prochaine priorité"),para(s.next,"muted")),
    paths
  );
}

function renderSessionSummary(){
  const stats=sessionSummaryStats();
  let lastFinished=null;
  try{const id=sessionStorage.getItem("cahierCode.session.lastFinished");if(id)lastFinished=stats.history.find(x=>x.id===id)||null;sessionStorage.removeItem("cahierCode.session.lastFinished");}catch{}
  const current=stats.current;
  const page=h("div",{class:"page session-summary-page"},
    h("p",{class:"crumbs"},link("/","Accueil")," / Résumé de session"),
    h("section",{class:"session-summary-hero"},h("div",{},h("span",{class:"eyebrow"},"RÉSUMÉ AUTOMATIQUE DE SESSION"),h("h1",{},lastFinished?"Session terminée":"Ce que tu as accompli aujourd’hui"),para("Le résumé croise uniquement tes activités déjà enregistrées par Cahier Code. Il n’ajoute aucun XP et ne modifie jamais ta progression.","lead")),h("div",{class:"session-summary-hero-stats"},metric(stats.total,"sessions archivées"),metric(stats.activeMinutes+" min","temps actif archivé")))
  );
  if(lastFinished){page.append(sessionSummaryCard(lastFinished,true),h("div",{class:"toolbar"},h("button",{class:"btn primary",onclick:()=>{location.hash="#/adaptatif";}},"Voir mes prochaines priorités →"),h("button",{class:"btn",onclick:()=>{if(typeof journalOpenFromCurrent==="function"){pendingJournalContext={pathId:null,route:"/session",title:"Résumé de session"};location.hash="#/journal";}}},"Écrire dans mon journal")));}
  page.append(h("section",{class:"session-current block"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"SESSION EN COURS"),h("h2",{},sessionSummaryHasActivity(current)?"Résumé en direct":"Commence à apprendre, je m’occupe du résumé")),sessionSummaryHasActivity(current)?h("button",{class:"btn primary",onclick:sessionSummaryEndAndOpen},"Terminer la session"):null),sessionSummaryCard(current,true)));
  const history=stats.history.slice(0,12);
  page.append(h("section",{class:"session-history"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"HISTORIQUE"),h("h2",{},history.length?"Tes dernières sessions":"Aucune session archivée"))),history.length?h("div",{class:"session-history-list"},...history.map(s=>sessionSummaryCard(s,false))):empty("Une session apparaîtra ici après avoir utilisé « Terminer la session » ou après une longue pause.")));
  return page;
}

function installSessionRuntime(){
  const now=Date.now();
  if(now-Number(sessionRuntime.lastSeenAt||now)>SESSION_SUMMARY_IDLE_MS){sessionSummaryArchive({automatic:true,endAt:Number(sessionRuntime.lastSeenAt)||now});}
  sessionRuntime.lastSeenAt=now; sessionRuntime.lastInteractionAt=now; sessionRuntimeSave();
  const touch=()=>{
    const t=Date.now();
    if(t-Number(sessionRuntime.lastInteractionAt||t)>SESSION_SUMMARY_IDLE_MS) sessionSummaryArchive({automatic:true,endAt:Number(sessionRuntime.lastSeenAt)||t});
    sessionRuntime.lastInteractionAt=t; sessionRuntime.lastSeenAt=t; sessionRuntimeSave();
  };
  ["pointerdown","keydown","touchstart"].forEach(ev=>window.addEventListener(ev,touch,{passive:true}));
  window.addEventListener("hashchange",touch);
  window.addEventListener("beforeunload",()=>{sessionRuntime.lastSeenAt=Date.now();sessionRuntimeSave();});
  setInterval(()=>{
    const t=Date.now();
    if(document.visibilityState==="visible" && t-Number(sessionRuntime.lastInteractionAt||0)<=SESSION_SUMMARY_ACTIVE_WINDOW_MS) sessionRuntime.activeMs+=30000;
    sessionRuntime.lastSeenAt=t; sessionRuntimeSave();
  },30000);
}

document.addEventListener("DOMContentLoaded",installSessionRuntime);
window.sessionSummaryStats=sessionSummaryStats;
window.renderSessionSummary=renderSessionSummary;
