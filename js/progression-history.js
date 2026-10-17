// progression-history.js — historique visuel de la progression pédagogique.
// Source de vérité : progression existante + activité de gamification. Aucun score parallèle.

const PROGRESSION_HISTORY_MAX_SNAPSHOTS = 720;
const PROGRESSION_HISTORY_PATHS = ["html","css","javascript","react","typescript","node","sql","git"];

function emptyProgressionHistoryState(){
  return { version:1, startedAt:Date.now(), snapshots:[] };
}

function progressionHistoryState(){
  if(!state.progressionHistory || typeof state.progressionHistory!=="object") state.progressionHistory=emptyProgressionHistoryState();
  const store=state.progressionHistory;
  if(!Array.isArray(store.snapshots)) store.snapshots=[];
  if(!store.startedAt) store.startedAt=Date.now();
  return store;
}

function progressionHistoryPathMeta(id){
  const path=(typeof LEARNING_PATHS!=="undefined"?LEARNING_PATHS:[]).find(p=>p.id===id);
  const fallback={html:["HTML","HTML"],css:["CSS","CSS"],javascript:["JavaScript","JS"],react:["React.js + Vite","⚛"],typescript:["TypeScript","TS"],node:["Node.js","N"],sql:["SQL","SQL"],git:["Git","Git"]}[id]||[id,id];
  return {id,title:path?.title||fallback[0],mark:path?.mark||fallback[1],href:path?.href||"/"};
}

function progressionHistoryCurrentSnapshot(){
  const paths={};
  let sum=0;
  PROGRESSION_HISTORY_PATHS.forEach(id=>{
    const path=(typeof LEARNING_PATHS!=="undefined"?LEARNING_PATHS:[]).find(p=>p.id===id);
    let percent=0;
    if(path && typeof learningPathSummary==="function"){
      try{ percent=Math.max(0,Math.min(100,Number(learningPathSummary(path).percent)||0)); }catch{}
    }
    paths[id]=percent; sum+=percent;
  });
  const started=Object.values(paths).filter(v=>v>0).length;
  const completed=Object.values(paths).filter(v=>v>=100).length;
  const g=(typeof ensureGamificationState==="function")?ensureGamificationState():{totalXp:0};
  return {
    at:Date.now(),
    overall:Math.round(sum/PROGRESSION_HISTORY_PATHS.length),
    paths,
    started,
    completed,
    xp:Number(g.totalXp)||0
  };
}

function progressionHistorySignature(snapshot){
  return [snapshot.overall,snapshot.started,snapshot.completed,...PROGRESSION_HISTORY_PATHS.map(id=>snapshot.paths[id]||0)].join("|");
}

function progressionHistoryCapture(options={}){
  if(typeof learningPathSummary!=="function") return null;
  const store=progressionHistoryState();
  const next=progressionHistoryCurrentSnapshot();
  const previous=store.snapshots[store.snapshots.length-1];
  if(previous && progressionHistorySignature(previous)===progressionHistorySignature(next) && !options.force) return previous;
  store.snapshots.push(next);
  if(store.snapshots.length>PROGRESSION_HISTORY_MAX_SNAPSHOTS) store.snapshots=store.snapshots.slice(-PROGRESSION_HISTORY_MAX_SNAPSHOTS);
  saveState(state);
  return next;
}

function progressionHistoryEnsureBaseline(){
  const store=progressionHistoryState();
  if(!store.snapshots.length) progressionHistoryCapture({force:true});
}

function progressionHistoryFormatDate(ts,compact=false){
  try{return new Intl.DateTimeFormat("fr-FR",compact?{day:"2-digit",month:"short"}:{dateStyle:"medium",timeStyle:"short"}).format(new Date(ts));}catch{return "";}
}

function progressionHistoryRangeSnapshots(days){
  const rows=progressionHistoryState().snapshots.slice().sort((a,b)=>a.at-b.at);
  if(!days) return rows;
  const cutoff=Date.now()-days*86400000;
  const inside=rows.filter(x=>x.at>=cutoff);
  const before=rows.filter(x=>x.at<cutoff).pop();
  return before?[before,...inside]:inside;
}

function progressionHistoryDailySeries(days=30){
  const snapshots=progressionHistoryState().snapshots.slice().sort((a,b)=>a.at-b.at);
  const byDay={};
  snapshots.forEach(s=>{ const key=typeof localDayKey==="function"?localDayKey(s.at):new Date(s.at).toISOString().slice(0,10); byDay[key]=s; });
  const rows=[]; let last=null;
  for(let i=days-1;i>=0;i--){
    const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-i);
    const key=typeof localDayKey==="function"?localDayKey(d):d.toISOString().slice(0,10);
    if(byDay[key]) last=byDay[key];
    rows.push({key,date:d,overall:last?last.overall:0,paths:last?last.paths:{}});
  }
  return rows;
}

function progressionHistoryActivityDays(days=84){
  if(typeof gamificationActivityDays==="function") return gamificationActivityDays(days);
  return Array.from({length:days},(_,i)=>({key:"",xp:0,events:0,index:i}));
}

function progressionHistoryRecentMilestones(limit=24){
  const rows=[];
  if(typeof ensureGamificationState==="function"){
    const g=ensureGamificationState();
    (g.xpEvents||[]).filter(e=>!e.backfill && ["lesson","exercise","evaluation","project","learningLevel","threadStage","threadProject"].includes(e.type)).forEach(e=>rows.push({
      at:Number(e.at)||0,
      path:e.path||null,
      icon:e.type==="project"||e.type==="threadProject"?"◈":e.type==="learningLevel"?"★":e.type==="evaluation"?"▣":e.type==="exercise"?"✓":"▤",
      title:e.title||"Progression",
      detail:(e.xp?`+${e.xp} XP · `:"")+({lesson:"Leçon terminée",exercise:"Exercice réussi",evaluation:"Évaluation validée",project:"Projet terminé",learningLevel:"Niveau terminé",threadStage:"Étape fil rouge",threadProject:"Projet fil rouge terminé"}[e.type]||"Progression")
    }));
    if(typeof GAMIFICATION_BADGES!=="undefined"){
      (GAMIFICATION_BADGES||[]).forEach(b=>{const unlock=g.badges?.[b.id]; if(unlock?.unlockedAt && !unlock.backfill) rows.push({at:Number(unlock.unlockedAt),path:null,icon:b.icon||"◆",title:b.title,detail:"Badge débloqué"});});
    }
  }
  const sessions=state.sessionSummaries?.history||[];
  sessions.forEach(s=>{if(s?.createdAt) rows.push({at:new Date(s.createdAt).getTime(),path:null,icon:"◫",title:"Session terminée",detail:(s.totalXp?`+${s.totalXp} XP · `:"")+((s.meaningful||0)+" activité"+((s.meaningful||0)>1?"s":""))});});
  return rows.filter(x=>Number.isFinite(x.at)&&x.at>0).sort((a,b)=>b.at-a.at).slice(0,limit);
}

function progressionHistoryStats(){
  progressionHistoryEnsureBaseline();
  const snapshots=progressionHistoryState().snapshots;
  const current=snapshots[snapshots.length-1]||progressionHistoryCurrentSnapshot();
  const first=snapshots[0]||current;
  const activity=progressionHistoryActivityDays(30);
  const activeDays=activity.filter(d=>Number(d.events)>0||Number(d.xp)>0).length;
  const gains={}; PROGRESSION_HISTORY_PATHS.forEach(id=>gains[id]=(current.paths[id]||0)-(first.paths?.[id]||0));
  return {current,first,activeDays,gain:current.overall-first.overall,gains,snapshots:snapshots.length};
}

function progressionHistoryLineChart(days){
  const points=progressionHistoryDailySeries(days);
  const width=900,height=250,padX=34,padY=24;
  const x=i=>points.length<=1?padX:padX+i*(width-padX*2)/(points.length-1);
  const y=v=>height-padY-(Math.max(0,Math.min(100,v))*(height-padY*2)/100);
  const poly=points.map((p,i)=>`${x(i).toFixed(1)},${y(p.overall).toFixed(1)}`).join(" ");
  const grid=[0,25,50,75,100].map(v=>h("g",{},h("line",{x1:padX,y1:y(v),x2:width-padX,y2:y(v),class:"history-chart-grid"}),h("text",{x:4,y:y(v)+4,class:"history-chart-label"},v+"%")));
  return h("div",{class:"history-chart-wrap"},h("svg",{class:"history-line-chart",viewBox:`0 0 ${width} ${height}`,role:"img","aria-label":"Évolution de la progression globale sur "+days+" jours"},...grid,h("polyline",{points:poly,class:"history-chart-line",fill:"none"}),...points.filter((_,i)=>i===0||i===points.length-1||i%Math.max(1,Math.floor(points.length/6))===0).map((p,i,arr)=>null),h("circle",{cx:x(points.length-1),cy:y(points[points.length-1]?.overall||0),r:5,class:"history-chart-dot"})),h("div",{class:"history-chart-axis"},h("span",{},progressionHistoryFormatDate(points[0]?.date||Date.now(),true)),h("span",{},progressionHistoryFormatDate(points[points.length-1]?.date||Date.now(),true))));
}

function progressionHistoryHeatmap(days=84){
  const rows=progressionHistoryActivityDays(days),max=Math.max(1,...rows.map(r=>Number(r.xp)||0));
  return h("div",{class:"history-heatmap","aria-label":"Activité des "+days+" derniers jours"},...rows.map(r=>{
    const xp=Number(r.xp)||0, level=xp===0?0:Math.max(1,Math.min(4,Math.ceil(xp/max*4)));
    return h("span",{class:"history-day level-"+level,title:(r.key||"")+" · "+xp+" XP · "+(Number(r.events)||0)+" activité"+((Number(r.events)||0)>1?"s":""),"aria-label":(r.key||"")+" "+xp+" XP"});
  }));
}

function progressionHistoryPathCard(id,stats){
  const meta=progressionHistoryPathMeta(id),current=stats.current.paths[id]||0,gain=stats.gains[id]||0;
  return h("article",{class:"history-path-card path-card--"+id},h("div",{class:"history-path-head"},h("span",{class:"path-mark"},meta.mark),h("div",{},h("h3",{},meta.title),h("span",{class:"history-delta "+(gain>0?"positive":"neutral")},gain>0?`+${gain} pts depuis le début de l’historique`:"Stable"))),h("div",{class:"progress-label"},h("span",{},"Progression actuelle"),h("strong",{},current+" %")),typeof bar==="function"?bar(current):null,link(meta.href,current?"Continuer →":"Commencer →","btn small"));
}

function renderProgressionHistory(){
  progressionHistoryCapture();
  const stats=progressionHistoryStats();
  const milestones=progressionHistoryRecentMilestones(24);
  const store=progressionHistoryState();
  const timeline = milestones.length
    ? h("div",{class:"history-timeline"},...milestones.map(m=>{
        const meta=m.path?progressionHistoryPathMeta(m.path):null;
        return h("article",{class:"history-timeline-item"},
          h("div",{class:"history-timeline-icon"},m.icon),
          h("div",{class:"history-timeline-copy"},
            h("div",{class:"history-timeline-head"},
              h("strong",{},m.title),
              h("time",{},progressionHistoryFormatDate(m.at))
            ),
            para((meta?meta.title+" · ":"")+m.detail,"muted small")
          )
        );
      }))
    : empty("Continue à apprendre : les prochaines réussites seront ajoutées automatiquement à cette chronologie.");

  return h("div",{class:"page progression-history-page"},
    h("p",{class:"crumbs"},link("/","Accueil")," / Historique de progression"),
    h("section",{class:"history-hero"},
      h("div",{},
        h("span",{class:"eyebrow"},"HISTORIQUE DE PROGRESSION VISUEL"),
        h("h1",{},"Vois ton évolution, pas seulement ton score actuel"),
        para("Cette vue transforme ta progression réelle en chronologie : évolution globale, activité, parcours et jalons. Elle n’ajoute aucun XP et ne modifie jamais tes validations.","lead")
      ),
      h("div",{class:"history-hero-metrics"},
        metric(stats.current.overall+" %","progression globale"),
        metric((stats.gain>=0?"+":"")+stats.gain+" pts","depuis le suivi"),
        metric(stats.activeDays,"jours actifs / 30"),
        metric(stats.current.completed,"parcours terminés")
      )
    ),
    h("section",{class:"block history-evolution"},
      h("div",{class:"section-heading"},
        h("div",{},h("span",{class:"eyebrow"},"ÉVOLUTION · 30 JOURS"),h("h2",{},"Ta courbe de progression")),
        para("Un point est enregistré uniquement lorsque ta progression pédagogique change.","muted")
      ),
      progressionHistoryLineChart(30)
    ),
    h("section",{class:"block"},
      h("div",{class:"section-heading"},
        h("div",{},h("span",{class:"eyebrow"},"RÉGULARITÉ · 12 SEMAINES"),h("h2",{},"Ton rythme d’apprentissage")),
        para("Plus une case est intense, plus tu as gagné d’XP ce jour-là.","muted")
      ),
      progressionHistoryHeatmap(84)
    ),
    h("section",{class:"history-path-section"},
      h("div",{class:"section-heading"},
        h("div",{},h("span",{class:"eyebrow"},"PAR PARCOURS"),h("h2",{},"Où tu as réellement avancé")),
        para("Chaque langage reste indépendant.","muted")
      ),
      h("div",{class:"history-path-grid"},...PROGRESSION_HISTORY_PATHS.map(id=>progressionHistoryPathCard(id,stats)))
    ),
    h("section",{class:"history-timeline-section"},
      h("div",{class:"section-heading"},
        h("div",{},h("span",{class:"eyebrow"},"CHRONOLOGIE"),h("h2",{},milestones.length?"Tes derniers jalons":"Tes prochains jalons apparaîtront ici")),
        para("Cours, exercices, niveaux, projets, badges et sessions terminées.","muted")
      ),
      timeline
    ),
    h("section",{class:"history-note callout"},
      h("strong",{},"À propos des données historiques"),
      para("Le suivi précis de la courbe commence à partir de l’activation de cette fonctionnalité. Les anciens accomplissements déjà connus de Cahier Code restent visibles lorsqu’ils possèdent une date fiable ; aucune date n’est inventée.","muted small")
    ),
    h("div",{class:"history-footnote muted small"},"Suivi commencé le "+progressionHistoryFormatDate(store.startedAt)+" · "+stats.snapshots+" instantané"+(stats.snapshots>1?"s":"")+" enregistré"+(stats.snapshots>1?"s":""))
  );
}

function progressionHistoryDashboardSummary(){
  progressionHistoryEnsureBaseline();
  const s=progressionHistoryStats();
  return {overall:s.current.overall,gain:s.gain,activeDays:s.activeDays};
}

window.addEventListener("progress-changed",()=>{try{progressionHistoryCapture();}catch(error){console.warn("Historique de progression : capture impossible",error);}});
document.addEventListener("DOMContentLoaded",()=>{try{progressionHistoryEnsureBaseline();}catch(error){console.warn("Historique de progression : initialisation impossible",error);}});
window.renderProgressionHistory=renderProgressionHistory;
window.progressionHistoryStats=progressionHistoryStats;
