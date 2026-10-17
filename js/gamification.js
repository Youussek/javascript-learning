// gamification.js — progression personnelle globale de Cahier Code.
// La progression pédagogique reste la source de vérité. Ce moteur ne fait que récompenser
// de façon idempotente les accomplissements déjà enregistrés par les parcours.

const GAMIFICATION_CONFIG = Object.freeze({
  version: 1,
  xp: Object.freeze({
    lessonCompleted: 10,
    exerciseByDifficulty: Object.freeze({ 1: 10, 2: 15, 3: 25, 4: 40 }),
    exerciseCompleted: 15,
    exerciseFirstTry: 5,
    learningLevelCompleted: 150,
    evaluationCompleted: 100,
    projectCompleted: 200,
    finalProjectCompleted: 400,
    threadStageCompleted: 75,
    threadProjectCompleted: 500,
    dailyActivityBonus: 10
  }),
  dailyGoals: Object.freeze({ light: 20, normal: 40, intense: 80 }),
  defaultDailyGoal: "normal"
});

const GAMIFICATION_PATH_META = Object.freeze({
  javascript: { title:"JavaScript", mark:"JS" }, react:{ title:"React", mark:"⚛" },
  css:{ title:"CSS", mark:"CSS" }, html:{ title:"HTML", mark:"HTML" },
  typescript:{ title:"TypeScript", mark:"TS" }, node:{ title:"Node.js", mark:"N" },
  sql:{ title:"SQL", mark:"SQL" }, git:{ title:"Git", mark:"Git" }
});

function emptyGamificationState() {
  return {
    version: GAMIFICATION_CONFIG.version,
    totalXp: 0,
    rewarded: {},
    xpEvents: [],
    badges: {},
    streak: { current:0, longest:0, lastActiveDate:null },
    dailyActivity: {},
    dailyGoal: GAMIFICATION_CONFIG.defaultDailyGoal,
    dailyGoalCelebrated: {},
    migratedAt: null
  };
}

function ensureGamificationState() {
  if (!state.gamification || typeof state.gamification !== "object") state.gamification = emptyGamificationState();
  const g = state.gamification;
  if (!g.rewarded) g.rewarded = {};
  if (!Array.isArray(g.xpEvents)) g.xpEvents = [];
  if (!g.badges) g.badges = {};
  if (!g.streak) g.streak = { current:0, longest:0, lastActiveDate:null };
  if (!g.dailyActivity) g.dailyActivity = {};
  if (!g.dailyGoal) g.dailyGoal = GAMIFICATION_CONFIG.defaultDailyGoal;
  if (!g.dailyGoalCelebrated) g.dailyGoalCelebrated = {};
  if (!Number.isFinite(Number(g.totalXp))) g.totalXp = 0;
  return g;
}

function localDayKey(date) {
  const d = date instanceof Date ? date : new Date(date == null ? Date.now() : date);
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function dayOffsetKey(offset) { const d=new Date(); d.setDate(d.getDate()+offset); return localDayKey(d); }
function yesterdayOf(key) { const d=new Date(key+"T12:00:00"); d.setDate(d.getDate()-1); return localDayKey(d); }

function xpThresholdForLevel(level) {
  const n=Math.max(1,Number(level)||1);
  return n<=1 ? 0 : 25*(n-1)*(n+2);
}
function userLevelForXp(xp) {
  const total=Math.max(0,Number(xp)||0); let level=1;
  while (xpThresholdForLevel(level+1)<=total && level<200) level++;
  return level;
}
function gamificationLevelInfo() {
  const g=ensureGamificationState(), level=userLevelForXp(g.totalXp);
  const start=xpThresholdForLevel(level), next=xpThresholdForLevel(level+1);
  const within=Math.max(0,g.totalXp-start), needed=Math.max(1,next-start);
  return { level,totalXp:g.totalXp,start,next,within,needed,remaining:Math.max(0,next-g.totalXp),percent:Math.min(100,Math.round(within/needed*100)) };
}

function gamificationPathStore(pathId) {
  if (pathId==="javascript") return state;
  return state[pathId] || {};
}
function gamificationAllExercises() {
  return [
    ...(typeof EXERCISES!=="undefined"?EXERCISES:[]), ...(typeof REACT_EXERCISES!=="undefined"?REACT_EXERCISES:[]),
    ...(typeof CSS_EXERCISES!=="undefined"?CSS_EXERCISES:[]), ...(typeof HTML_EXERCISES!=="undefined"?HTML_EXERCISES:[]),
    ...(typeof TYPESCRIPT_EXERCISES!=="undefined"?TYPESCRIPT_EXERCISES:[]), ...(typeof NODE_EXERCISES!=="undefined"?NODE_EXERCISES:[]),
    ...(typeof SQL_EXERCISES!=="undefined"?SQL_EXERCISES:[]), ...(typeof GIT_COURSE_EXERCISES!=="undefined"?GIT_COURSE_EXERCISES:[])
  ];
}
function gamificationExercisePath(ex) { return ex.path || (typeof exercisePathFromId==="function"?exercisePathFromId(ex.id):"javascript"); }

function gamificationCatalog() {
  const rows=[];
  function addPath(pathId, lessons, exercises, levels, projects, evaluations) {
    const store=gamificationPathStore(pathId), lessonsDone=store.lessonsDone||{};
    (lessons||[]).forEach(l=>{ if(lessonsDone[l.id]) rows.push({key:`lesson:${pathId}:${l.id}`,type:"lesson",resourceId:l.id,path:pathId,title:l.title||"Leçon terminée",xp:pathId==="git"?8:GAMIFICATION_CONFIG.xp.lessonCompleted}); });
    (exercises||[]).forEach(ex=>{ const rec=typeof getRecord==="function"?getRecord(ex.id):null; if(rec&&rec.success){ const diff=Number(ex.difficulty)||2; rows.push({key:`exercise:${pathId}:${ex.id}`,type:"exercise",resourceId:ex.id,path:pathId,title:ex.notion||"Exercice réussi",xp:GAMIFICATION_CONFIG.xp.exerciseByDifficulty[diff]||GAMIFICATION_CONFIG.xp.exerciseCompleted,firstTry:rec.fails===0&&!rec.correctionSeen}); } });
    const evalStore=store.evaluations||{};
    Object.keys(evaluations||{}).forEach(level=>{ const rec=evalStore[level]||{}; const best=Number(rec.bestPercent!=null?rec.bestPercent:rec.best)||0; if(best>=80) rows.push({key:`evaluation:${pathId}:${level}`,type:"evaluation",resourceId:String(level),path:pathId,title:`Évaluation niveau ${level}`,xp:GAMIFICATION_CONFIG.xp.evaluationCompleted}); });
    const projectStore=store.projects||{}; const availableProjects=(projects||[]).filter(p=>p.available!==false); const maxProjectLevel=Math.max(0,...availableProjects.map(p=>Number(p.level||p.unlock?.module||0)));
    availableProjects.forEach((p,index)=>{ let done=false; if(pathId==="javascript") done=Boolean((state.projects||{})[p.id]?.done); else done=Boolean(projectStore[p.id]?.done); if(done){ const isFinal=(Number(p.level||0)===maxProjectLevel&&maxProjectLevel>0)||index===availableProjects.length-1; rows.push({key:`project:${pathId}:${p.id}`,type:"project",resourceId:p.id,path:pathId,title:p.title||"Projet terminé",xp:pathId==="git"?(isFinal?250:120):(isFinal?GAMIFICATION_CONFIG.xp.finalProjectCompleted:GAMIFICATION_CONFIG.xp.projectCompleted),final:isFinal}); } });
    (levels||[]).forEach(level=>{
      const num=Number(level.number||level); let levelLessons=[], levelExercises=[];
      if(pathId==="javascript") { const moduleId=level.id; levelLessons=(lessons||[]).filter(l=>l.module===moduleId); levelExercises=(exercises||[]).filter(ex=>levelLessons.some(l=>l.id===ex.lesson)); }
      else { levelLessons=(lessons||[]).filter(l=>Number(l.level)===num); levelExercises=(exercises||[]).filter(ex=>Number(ex.level)===num); }
      const lOk=levelLessons.length>0&&levelLessons.every(l=>Boolean(lessonsDone[l.id]));
      const eOk=levelExercises.length===0||levelExercises.every(ex=>getRecord(ex.id).success);
      const evalQuestions=evaluations&&evaluations[num]; const evalRequired=Array.isArray(evalQuestions)&&evalQuestions.length>0;
      const er=evalStore[num]||{}; const eb=Number(er.bestPercent!=null?er.bestPercent:er.best)||0; const evalOk=!evalRequired||eb>=80;
      const lp=(projects||[]).find(p=>Number(p.level||0)===num); const projectOk=!lp||(pathId==="javascript"?Boolean((state.projects||{})[lp.id]?.done):Boolean(projectStore[lp.id]?.done));
      if(lOk&&eOk&&evalOk&&projectOk) rows.push({key:`learning-level:${pathId}:${num}`,type:"learningLevel",resourceId:String(num),path:pathId,title:`Niveau ${num} terminé`,xp:pathId==="git"?75:GAMIFICATION_CONFIG.xp.learningLevelCompleted});
    });
  }
  addPath("javascript", typeof LESSONS!=="undefined"?LESSONS:[], typeof EXERCISES!=="undefined"?EXERCISES:[], typeof MODULES!=="undefined"?MODULES:[], typeof PROJECTS!=="undefined"?PROJECTS:[], {});
  addPath("react", typeof REACT_LESSONS!=="undefined"?REACT_LESSONS:[], typeof REACT_EXERCISES!=="undefined"?REACT_EXERCISES:[], typeof REACT_LEVELS!=="undefined"?REACT_LEVELS:[], typeof REACT_PROJECTS!=="undefined"?REACT_PROJECTS:[], typeof REACT_EVALUATIONS!=="undefined"?REACT_EVALUATIONS:{});
  addPath("css", typeof CSS_LESSONS!=="undefined"?CSS_LESSONS:[], typeof CSS_EXERCISES!=="undefined"?CSS_EXERCISES:[], typeof CSS_LEVELS!=="undefined"?CSS_LEVELS:[], typeof CSS_PROJECTS!=="undefined"?CSS_PROJECTS:[], typeof CSS_EVALUATIONS!=="undefined"?CSS_EVALUATIONS:{});
  addPath("html", typeof HTML_LESSONS!=="undefined"?HTML_LESSONS:[], typeof HTML_EXERCISES!=="undefined"?HTML_EXERCISES:[], typeof HTML_LEVELS!=="undefined"?HTML_LEVELS:[], typeof HTML_PROJECTS!=="undefined"?HTML_PROJECTS:[], typeof HTML_EVALUATIONS!=="undefined"?HTML_EVALUATIONS:{});
  addPath("typescript", typeof TYPESCRIPT_LESSONS!=="undefined"?TYPESCRIPT_LESSONS:[], typeof TYPESCRIPT_EXERCISES!=="undefined"?TYPESCRIPT_EXERCISES:[], typeof TYPESCRIPT_LEVELS!=="undefined"?TYPESCRIPT_LEVELS:[], typeof TYPESCRIPT_PROJECTS!=="undefined"?TYPESCRIPT_PROJECTS:[], typeof TYPESCRIPT_EVALUATIONS!=="undefined"?TYPESCRIPT_EVALUATIONS:{});
  addPath("node", typeof NODE_LESSONS!=="undefined"?NODE_LESSONS:[], typeof NODE_EXERCISES!=="undefined"?NODE_EXERCISES:[], typeof NODE_LEVELS!=="undefined"?NODE_LEVELS:[], typeof NODE_PROJECTS!=="undefined"?NODE_PROJECTS:[], typeof NODE_EVALUATIONS!=="undefined"?NODE_EVALUATIONS:{});
  addPath("sql", typeof SQL_LESSONS!=="undefined"?SQL_LESSONS:[], typeof SQL_EXERCISES!=="undefined"?SQL_EXERCISES:[], typeof SQL_LEVELS!=="undefined"?SQL_LEVELS:[], typeof SQL_PROJECTS!=="undefined"?SQL_PROJECTS:[], typeof SQL_EVALUATIONS!=="undefined"?SQL_EVALUATIONS:{});
  addPath("git", typeof GIT_COURSE_LESSONS!=="undefined"?GIT_COURSE_LESSONS:[], typeof GIT_COURSE_EXERCISES!=="undefined"?GIT_COURSE_EXERCISES:[], typeof GIT_COURSE_LEVELS!=="undefined"?GIT_COURSE_LEVELS:[], typeof GIT_COURSE_PROJECTS!=="undefined"?GIT_COURSE_PROJECTS:[], {});
  if(typeof THREAD_PROJECTS!=="undefined" && typeof threadProjectRecord==="function"){
    THREAD_PROJECTS.forEach(project=>{
      const pr=threadProjectRecord(project.id);
      project.stages.forEach(stage=>{const sr=threadStageRecord(project.id,stage.id);if(sr.completedAt) rows.push({key:`thread-stage:${project.id}:${stage.id}`,type:"threadStage",resourceId:`${project.id}:${stage.id}`,path:stage.path||null,title:`${project.title} · ${stage.title}`,xp:GAMIFICATION_CONFIG.xp.threadStageCompleted});});
      if(pr.completedAt) rows.push({key:`thread-project:${project.id}`,type:"threadProject",resourceId:project.id,path:null,title:`Fil rouge terminé · ${project.title}`,xp:GAMIFICATION_CONFIG.xp.threadProjectCompleted});
    });
  }
  return rows;
}

function gamificationMeaningfulDay(g, dateKey) {
  const s=g.streak; const last=s.lastActiveDate;
  if(last===dateKey) return false;
  if(last && last===yesterdayOf(dateKey)) s.current=(Number(s.current)||0)+1; else s.current=1;
  s.longest=Math.max(Number(s.longest)||0,s.current); s.lastActiveDate=dateKey; return true;
}

function gamificationAward(event, opts={}) {
  const g=ensureGamificationState(); if(g.rewarded[event.key]) return null;
  const before=userLevelForXp(g.totalXp); const now=Date.now(), backfill=Boolean(opts.backfill);
  const xp=Math.max(0,Number(event.xp)||0); g.rewarded[event.key]={at:now,xp,type:event.type,path:event.path||null,resourceId:event.resourceId||null,backfill};
  g.totalXp+=xp; g.xpEvents.push({id:event.key,at:now,xp,type:event.type,path:event.path||null,title:event.title||event.type,backfill});
  let firstTryBonus=0;
  if(event.type==="exercise"&&event.firstTry){ const bonusKey=`first-try:${event.path}:${event.resourceId}`; if(!g.rewarded[bonusKey]){ firstTryBonus=GAMIFICATION_CONFIG.xp.exerciseFirstTry; g.rewarded[bonusKey]={at:now,xp:firstTryBonus,type:"firstTry",path:event.path,resourceId:event.resourceId,backfill}; g.totalXp+=firstTryBonus; g.xpEvents.push({id:bonusKey,at:now,xp:firstTryBonus,type:"firstTry",path:event.path,title:"Réussi du premier coup",backfill}); } }
  let dailyBonus=0, goalReached=false;
  if(!backfill){ const day=localDayKey(now); const firstActive=gamificationMeaningfulDay(g,day); if(!g.dailyActivity[day]) g.dailyActivity[day]={xp:0,events:0}; g.dailyActivity[day].xp+=xp+firstTryBonus; g.dailyActivity[day].events++;
    if(firstActive){ dailyBonus=GAMIFICATION_CONFIG.xp.dailyActivityBonus; const key=`daily-bonus:${day}`; g.rewarded[key]={at:now,xp:dailyBonus,type:"dailyBonus",path:null,resourceId:day,backfill:false}; g.totalXp+=dailyBonus; g.xpEvents.push({id:key,at:now,xp:dailyBonus,type:"dailyBonus",path:null,title:"Bonus quotidien",backfill:false}); g.dailyActivity[day].xp+=dailyBonus; }
    const target=gamificationDailyGoalTarget(); if(g.dailyActivity[day].xp>=target&&!g.dailyGoalCelebrated[day]){ g.dailyGoalCelebrated[day]=true; goalReached=true; }
  }
  const after=userLevelForXp(g.totalXp); return {event,xp,firstTryBonus,dailyBonus,levelUps:Math.max(0,after-before),newLevel:after,goalReached};
}

function gamificationDailyGoalTarget() { const g=ensureGamificationState(); return GAMIFICATION_CONFIG.dailyGoals[g.dailyGoal]||GAMIFICATION_CONFIG.dailyGoals.normal; }
function gamificationToday() { const g=ensureGamificationState(), day=localDayKey(); const row=g.dailyActivity[day]||{xp:0,events:0}; const target=gamificationDailyGoalTarget(); return {day,xp:row.xp||0,events:row.events||0,target,percent:Math.min(100,Math.round((row.xp||0)/target*100)),done:(row.xp||0)>=target}; }
function gamificationCurrentStreak() { const g=ensureGamificationState(), last=g.streak.lastActiveDate; if(!last) return 0; const today=localDayKey(), yesterday=dayOffsetKey(-1); return (last===today||last===yesterday)?Number(g.streak.current)||0:0; }

const GAMIFICATION_BADGES = Object.freeze([
  {id:"first-lesson",icon:"◆",title:"Premier pas",description:"Termine ta première leçon.",category:"Progression",rarity:"Commun",metric:"lessons",target:1},
  {id:"first-exercise",icon:"✓",title:"Premier exercice",description:"Réussis ton premier exercice.",category:"Exercices",rarity:"Commun",metric:"exercises",target:1},
  {id:"first-project",icon:"◈",title:"Premier projet",description:"Termine ton premier projet.",category:"Projets",rarity:"Commun",metric:"projects",target:1},
  {id:"explorer",icon:"◇",title:"Explorateur",description:"Commence 3 parcours différents.",category:"Exploration",rarity:"Commun",metric:"pathsStarted",target:3},
  {id:"level-10",icon:"★",title:"Niveau 10",description:"Atteins le niveau utilisateur 10.",category:"Progression",rarity:"Rare",metric:"level",target:10},
  {id:"level-25",icon:"★",title:"Niveau 25",description:"Atteins le niveau utilisateur 25.",category:"Progression",rarity:"Épique",metric:"level",target:25},
  {id:"level-50",icon:"★",title:"Niveau 50",description:"Atteins le niveau utilisateur 50.",category:"Progression",rarity:"Légendaire",metric:"level",target:50},
  {id:"streak-3",icon:"🔥",title:"3 jours",description:"Maintiens une série de 3 jours.",category:"Régularité",rarity:"Commun",metric:"longestStreak",target:3},
  {id:"streak-7",icon:"🔥",title:"Une semaine",description:"Maintiens une série de 7 jours.",category:"Régularité",rarity:"Rare",metric:"longestStreak",target:7},
  {id:"streak-30",icon:"🔥",title:"30 jours",description:"Maintiens une série de 30 jours.",category:"Régularité",rarity:"Épique",metric:"longestStreak",target:30},
  {id:"streak-100",icon:"🔥",title:"100 jours",description:"Maintiens une série de 100 jours.",category:"Régularité",rarity:"Légendaire",metric:"longestStreak",target:100},
  {id:"first-try-10",icon:"⚡",title:"First Try",description:"Réussis 10 exercices du premier coup.",category:"Performance",rarity:"Rare",metric:"firstTry",target:10},
  {id:"perfect-run",icon:"100",title:"Perfect Run",description:"Obtiens 100 % à une évaluation.",category:"Performance",rarity:"Rare",metric:"perfectEvaluations",target:1},
  {id:"bug-hunter",icon:"🐞",title:"Bug Hunter",description:"Résous 25 erreurs enregistrées dans Mes erreurs utiles.",category:"Performance",rarity:"Épique",metric:"resolvedErrors",target:25},
  {id:"challenge-accepted",icon:"!",title:"Challenge Accepted",description:"Réussis 10 exercices de difficulté Challenge.",category:"Challenges",rarity:"Épique",metric:"challengeCount",target:10},
  {id:"builder",icon:"◈",title:"Builder",description:"Termine 5 projets.",category:"Projets",rarity:"Rare",metric:"projects",target:5},
  {id:"project-master",icon:"◆",title:"Project Master",description:"Termine 10 projets.",category:"Projets",rarity:"Épique",metric:"projects",target:10},
  {id:"sql-25",icon:"SQL",title:"SQL Explorer",description:"Réussis 25 exercices SQL.",category:"Langages",rarity:"Rare",metric:"pathExercises:sql",target:25},
  {id:"css-50",icon:"CSS",title:"CSS Artist",description:"Réussis 50 exercices CSS.",category:"Langages",rarity:"Rare",metric:"pathExercises:css",target:50},
  {id:"polyglotte",icon:"∞",title:"Polyglotte",description:"Progresse dans 5 parcours différents.",category:"Exploration",rarity:"Épique",metric:"pathsStarted",target:5},
  {id:"fullstack",icon:"FS",title:"Full Stack Explorer",description:"Progresse en HTML, CSS, JavaScript, Node.js et SQL.",category:"Exploration",rarity:"Épique",metric:"fullstack",target:5},
  {id:"git-first-commit",icon:"⑂",title:"First Commit",description:"Crée ton premier commit dans le parcours Git.",category:"Git",rarity:"Commun",metric:"gitFirstCommit",target:1},
  {id:"git-branch-explorer",icon:"⑂",title:"Branch Explorer",description:"Crée et fusionne ta première branche.",category:"Git",rarity:"Commun",metric:"gitBranchExplorer",target:1},
  {id:"git-conflict-resolver",icon:"!",title:"Conflict Resolver",description:"Résous ton premier conflit Git.",category:"Git",rarity:"Rare",metric:"gitConflictResolver",target:1},
  {id:"git-ready",icon:"Git",title:"Git Ready",description:"Termine le parcours Git rapide.",category:"Git",rarity:"Rare",metric:"pathComplete:git",target:1},
  ...Object.keys(GAMIFICATION_PATH_META).map(id=>({id:`master-${id}`,icon:GAMIFICATION_PATH_META[id].mark,title:`${GAMIFICATION_PATH_META[id].title} Master`,description:`Termine tout le parcours ${GAMIFICATION_PATH_META[id].title}.`,category:"Maîtrise",rarity:"Légendaire",metric:`pathComplete:${id}`,target:1}))
]);

function gamificationComputedStats() {
  const g=ensureGamificationState(), rewarded=Object.values(g.rewarded||{});
  const lessons=rewarded.filter(x=>x.type==="lesson").length, exercises=rewarded.filter(x=>x.type==="exercise").length, projects=rewarded.filter(x=>x.type==="project"||x.type==="threadProject").length, firstTry=rewarded.filter(x=>x.type==="firstTry").length;
  const pathExercise={}; rewarded.filter(x=>x.type==="exercise"&&x.path).forEach(x=>pathExercise[x.path]=(pathExercise[x.path]||0)+1);
  const pathStarted={}; rewarded.filter(x=>x.path&&["lesson","exercise","project","evaluation","learningLevel","threadStage"].includes(x.type)).forEach(x=>pathStarted[x.path]=true);
  const perfectEvaluations=Object.entries({javascript:state,react:state.react||{},css:state.css||{},html:state.html||{},typescript:state.typescript||{},node:state.node||{},sql:state.sql||{},git:state.git||{}}).reduce((count,[id,store])=>count+Object.values(store.evaluations||{}).filter(r=>Number(r.bestPercent!=null?r.bestPercent:r.best)>=100).length,0);
  const resolvedErrors=Array.isArray(state.errorHistory)?state.errorHistory.filter(e=>e&&e.resolvedAt).length:0;
  const challengeCount=gamificationAllExercises().filter(ex=>(Number(ex.difficulty)||0)>=4&&getRecord(ex.id).success).length;
  const completedLevels={}; rewarded.filter(x=>x.type==="learningLevel"&&x.path).forEach(x=>{if(!completedLevels[x.path])completedLevels[x.path]=0;completedLevels[x.path]++;});
  const maxLevels={javascript:typeof MODULES!=="undefined"?MODULES.length:6,react:5,css:5,html:5,typescript:5,node:5,sql:5,git:3};
  const pathComplete={}; Object.keys(maxLevels).forEach(id=>pathComplete[id]=(completedLevels[id]||0)>=maxLevels[id]?1:0);
  const fullstack=["html","css","javascript","node","sql"].filter(id=>pathStarted[id]).length;
  const gitFirstCommit=typeof getRecord==="function"&&getRecord("gx-commit").success?1:0;
  const gitBranchExplorer=typeof getRecord==="function"&&getRecord("gx-merge").success?1:0;
  const gitConflictResolver=typeof getRecord==="function"&&getRecord("gx-conflict").success?1:0;
  return {lessons,exercises,projects,firstTry,perfectEvaluations,resolvedErrors,challengeCount,pathExercise,pathsStarted:Object.keys(pathStarted).length,pathStarted,level:userLevelForXp(g.totalXp),longestStreak:Number(g.streak.longest)||0,pathComplete,fullstack,gitFirstCommit,gitBranchExplorer,gitConflictResolver};
}
function badgeMetricValue(badge,stats) {
  if(badge.metric.startsWith("pathExercises:")) return stats.pathExercise[badge.metric.split(":")[1]]||0;
  if(badge.metric.startsWith("pathComplete:")) return stats.pathComplete[badge.metric.split(":")[1]]||0;
  return Number(stats[badge.metric])||0;
}
function evaluateGamificationBadges(opts={}) {
  const g=ensureGamificationState(), stats=gamificationComputedStats(), unlocked=[];
  GAMIFICATION_BADGES.forEach(b=>{ const value=badgeMetricValue(b,stats); if(value>=b.target&&!g.badges[b.id]){g.badges[b.id]={unlockedAt:Date.now(),backfill:Boolean(opts.backfill)}; unlocked.push(b);} });
  return unlocked;
}
function gamificationBadgeRows() { const g=ensureGamificationState(), stats=gamificationComputedStats(); return GAMIFICATION_BADGES.map(b=>{const value=badgeMetricValue(b,stats);return {...b,value,percent:Math.min(100,Math.round(value/b.target*100)),unlocked:Boolean(g.badges[b.id]),unlockedAt:g.badges[b.id]?.unlockedAt||null};}); }

let gamificationSyncing=false;
function gamificationSync(opts={}) {
  if(gamificationSyncing) return {awards:[],badges:[]}; gamificationSyncing=true;
  try { const g=ensureGamificationState(); const backfill=Boolean(opts.backfill); const awards=[];
    gamificationCatalog().forEach(ev=>{ const result=gamificationAward(ev,{backfill}); if(result) awards.push(result); });
    const badges=evaluateGamificationBadges({backfill});
    if(backfill&&!g.migratedAt) g.migratedAt=Date.now();
    saveState(state);
    if(!backfill&&(awards.length||badges.length)){ window.dispatchEvent(new CustomEvent("gamification-changed",{detail:{awards,badges}})); }
    return {awards,badges};
  } finally {gamificationSyncing=false;}
}
function gamificationOnCommit() { gamificationSync({backfill:false}); }

function gamificationSetDailyGoal(preset) { const g=ensureGamificationState(); if(!GAMIFICATION_CONFIG.dailyGoals[preset]) return false; g.dailyGoal=preset; saveState(state); window.dispatchEvent(new Event("gamification-changed")); return true; }
function gamificationXpByPath() { const out={}; ensureGamificationState().xpEvents.forEach(e=>{if(e.path)out[e.path]=(out[e.path]||0)+Number(e.xp||0);}); return out; }
function gamificationWeekXp() { const cutoff=Date.now()-7*86400000; return ensureGamificationState().xpEvents.filter(e=>!e.backfill&&e.at>=cutoff).reduce((s,e)=>s+Number(e.xp||0),0); }
function gamificationActivityDays(limit=35) { const g=ensureGamificationState(), rows=[]; for(let i=limit-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=localDayKey(d);rows.push({key,xp:Number(g.dailyActivity[key]?.xp||0),events:Number(g.dailyActivity[key]?.events||0)});} return rows; }
function gamificationRecentXp(limit=12) { return ensureGamificationState().xpEvents.slice().sort((a,b)=>b.at-a.at).slice(0,limit); }

function gamificationStats() {
  const g=ensureGamificationState(), level=gamificationLevelInfo(), today=gamificationToday(), badges=gamificationBadgeRows(), core=gamificationComputedStats();
  return {...level,today,currentStreak:gamificationCurrentStreak(),longestStreak:Number(g.streak.longest)||0,badgesUnlocked:badges.filter(b=>b.unlocked).length,badgesTotal:badges.length,weekXp:gamificationWeekXp(),...core};
}

function gamificationShowToast(detail) {
  if(!detail) return; const awards=detail.awards||[], badges=detail.badges||[]; if(!awards.length&&!badges.length) return;
  const xp=awards.reduce((s,a)=>s+a.xp+a.firstTryBonus+a.dailyBonus,0), levelUps=awards.reduce((s,a)=>s+a.levelUps,0), goal=awards.some(a=>a.goalReached);
  const box=document.createElement("div"); box.className="gamification-toast"; box.setAttribute("role","status"); box.innerHTML=`<strong>${levelUps||badges.length||goal?"Belle progression !":"+"+xp+" XP"}</strong>${xp?`<span>+${xp} XP</span>`:""}${levelUps?`<span>★ Niveau ${gamificationLevelInfo().level} atteint</span>`:""}${badges.slice(0,2).map(b=>`<span>🏆 ${b.title}</span>`).join("")}${goal?`<span>🎯 Objectif quotidien terminé</span>`:""}`;
  document.body.append(box); setTimeout(()=>box.classList.add("show"),20); setTimeout(()=>{box.classList.remove("show");setTimeout(()=>box.remove(),250);},3600);
}

function gamificationUpdateHud() {
  const host=document.getElementById("gamification-mini"); if(!host) return; const s=gamificationStats();
  host.innerHTML=`<a href="#/profil" class="gamification-mini-link" aria-label="Profil : niveau ${s.level}, ${s.totalXp} XP, streak ${s.currentStreak} jours"><span>🔥 ${s.currentStreak}</span><span>★ ${s.totalXp} XP</span><strong>Niv. ${s.level}</strong></a>`;
}

window.addEventListener("gamification-changed",e=>{gamificationUpdateHud();gamificationShowToast(e.detail);});
window.addEventListener("progress-changed",()=>gamificationUpdateHud());
// Les données des parcours sont déjà chargées avant ce fichier : la migration peut donc être faite
// immédiatement, avant le premier rendu d'app.js. Cela évite un flash à 0 XP pour un ancien utilisateur.
{ const g=ensureGamificationState(); if(!g.migratedAt) gamificationSync({backfill:true}); else gamificationSync({backfill:false}); }
window.addEventListener("DOMContentLoaded",()=>gamificationUpdateHud());

// Exposé explicitement car progress.js appelle le hook via window afin de rester optionnel.
window.gamificationOnCommit = gamificationOnCommit;
