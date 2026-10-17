// next-step.js — une recommandation concrète et transparente pour savoir quoi faire maintenant.
// Réutilise la progression, le parcours adaptatif, les révisions et les projets fil rouge.

const NEXT_STEP_PREREQUISITES = {
  react: { paths:["javascript","html","css"], minScore:60, label:"JavaScript + bases Web" },
  typescript: { paths:["javascript"], minScore:60, label:"JavaScript" },
  node: { paths:["javascript"], minScore:60, label:"JavaScript" },
  css: { paths:["html"], minScore:35, label:"HTML" }
};

function nextStepPathAnalysis(id){
  try { return typeof adaptivePathAnalysis === "function" ? adaptivePathAnalysis(id) : null; }
  catch(_) { return null; }
}

function nextStepPathProgress(id){
  const a=nextStepPathAnalysis(id);
  if(!a) return {id,score:0,started:false,completed:false};
  const total=a.lessons.length||1;
  const completed=a.lessons.filter(x=>x.done && x.solved===x.exs.length).length;
  return {id,score:a.score||0,started:Boolean(a.started),completed:completed===total,analysis:a};
}

function nextStepPrerequisitesReady(pathId){
  const req=NEXT_STEP_PREREQUISITES[pathId];
  if(!req) return {ready:true,reason:"Aucun prérequis strict recommandé."};
  const rows=req.paths.map(nextStepPathProgress);
  const ready=rows.every(r=>r.started && r.score>=req.minScore);
  return {ready,reason:ready?req.label+" suffisamment consolidé.":"Consolide d’abord "+req.label+"."};
}

function nextStepReviewCandidate(){
  if(typeof spacedReviewStats!=="function" || typeof spacedReviewQueue!=="function") return null;
  const stats=spacedReviewStats();
  const first=spacedReviewQueue(1)[0];
  if(!stats.dueCount || !first) return null;
  const path=ADAPTIVE_PATHS[first.path?.id||first.pathId||first.exercise?.path] || first.path;
  const href=path && first.exercise ? path.exerciseHref(first.exercise.id) : "/revisions";
  return {id:"review",kind:"review",priority:125,title:"Fais ton rappel le plus urgent",subtitle:stats.dueCount+" révision"+(stats.dueCount>1?"s":"")+" arrivée"+(stats.dueCount>1?"s":"")+" à échéance",reason:"La répétition espacée a identifié une notion qui risque d’être oubliée si tu attends davantage.",href,label:"Réviser maintenant",pathId:path?.id||null,icon:"↻"};
}

function nextStepAdaptiveCandidates(){
  if(typeof adaptiveSession!=="function") return [];
  return adaptiveSession(5).map((item,index)=>{
    const action=adaptiveAction(item);
    const isWeak=item.status==="reinforce";
    const isConsolidate=item.status==="consolidate";
    return {
      id:"adaptive:"+item.path.id+":"+item.lesson.id,
      kind:isWeak?"reinforce":isConsolidate?"consolidate":"continue",
      priority:(isWeak?112:isConsolidate?86:64)-index,
      title:(isWeak?"Renforce ":isConsolidate?"Consolide ":"Continue avec ")+item.lesson.title,
      subtitle:item.path.title+" · Niveau "+item.level+" · maîtrise "+item.score+" %",
      reason:adaptiveReasonText(item),href:action.href,label:action.label,pathId:item.path.id,icon:isWeak?"!":isConsolidate?"◇":"→"
    };
  });
}

function nextStepThreadCandidate(){
  if(typeof THREAD_PROJECTS==="undefined" || typeof threadProjectRecord!=="function" || typeof threadProjectStats!=="function") return null;
  const active=THREAD_PROJECTS.map(project=>({project,rec:threadProjectRecord(project.id),stats:threadProjectStats(project)}))
    .filter(x=>x.rec.startedAt && !x.stats.completed)
    .sort((a,b)=>(b.rec.updatedAt||b.rec.startedAt||0)-(a.rec.updatedAt||a.rec.startedAt||0))[0];
  if(!active) return null;
  const next=active.project.stages.find(stage=>!threadStageRecord(active.project.id,stage.id).completedAt);
  if(!next) return null;
  return {id:"thread:"+active.project.id,kind:"project",priority:76,title:"Continue ton fil rouge : "+next.title,subtitle:active.project.title+" · "+active.stats.percent+" % terminé",reason:"Tu as déjà commencé ce projet. Reprendre une étape ouverte permet de transformer les notions en livrable concret.",href:"/fil-rouge/"+active.project.id+"/etape/"+next.id,label:"Continuer le projet",pathId:next.path||null,icon:"↯"};
}

function nextStepNewPathCandidates(){
  const candidates=[];
  const all=adaptiveAllAnalyses();
  const started=all.filter(a=>a.started).map(a=>a.path.id);
  const add=(id,priority,why)=>{
    const a=nextStepPathAnalysis(id); if(!a || a.started) return;
    const ready=nextStepPrerequisitesReady(id); if(!ready.ready) return;
    const p=ADAPTIVE_PATHS[id]; if(!p) return;
    candidates.push({id:"new:"+id,kind:"explore",priority,title:"Tu peux commencer "+p.title,subtitle:"Nouveau parcours disponible au bon moment",reason:why+" "+ready.reason,href:p.home,label:"Découvrir "+p.title,pathId:id,icon:"+"});
  };
  if(started.includes("javascript")){
    add("typescript",59,"Ton socle JavaScript permet maintenant d’ajouter du typage sans repartir de zéro.");
    add("node",58,"Tu peux réutiliser JavaScript côté serveur pour découvrir le backend.");
  }
  if(started.includes("html") && started.includes("css") && started.includes("javascript")) add("react",61,"Tu as commencé les trois bases du frontend moderne.");
  if(started.some(id=>["javascript","node","react"].includes(id))) add("sql",52,"Ajouter SQL te permet de relier ton code à de vraies données structurées.");
  if(!started.length){
    const p=ADAPTIVE_PATHS.html;
    if(p) candidates.push({id:"start:web",kind:"explore",priority:45,title:"Commence par construire une page Web",subtitle:"HTML · premier socle recommandé",reason:"Tu n’as encore aucune progression. HTML donne un résultat visible immédiatement et prépare naturellement CSS puis JavaScript.",href:p.home,label:"Découvrir HTML",pathId:"html",icon:"+"});
  }
  return candidates;
}

function nextStepResumeCandidates(){
  return adaptiveAllAnalyses().filter(a=>a.started).map(a=>{
    const current=a.current; if(!current) return null;
    const action=adaptiveAction(current);
    const last=state.lastActiveLearningPath===a.path.id;
    return {id:"resume:"+a.path.id,kind:"resume",priority:last?72:62,title:"Reprends "+a.path.title,subtitle:"Indice moyen de maîtrise : "+a.score+" %",reason:last?"C’est le dernier parcours sur lequel tu travaillais.":"Ce parcours est déjà commencé et possède encore du contenu à terminer.",href:action.href,label:"Reprendre",pathId:a.path.id,icon:"→"};
  }).filter(Boolean);
}

function nextStepAllCandidates(){
  const rows=[];
  const review=nextStepReviewCandidate(); if(review) rows.push(review);
  rows.push(...nextStepAdaptiveCandidates());
  const thread=nextStepThreadCandidate(); if(thread) rows.push(thread);
  rows.push(...nextStepNewPathCandidates(),...nextStepResumeCandidates());
  const seen=new Set();
  return rows.sort((a,b)=>b.priority-a.priority).filter(row=>{const key=row.href+"|"+row.kind;if(seen.has(key))return false;seen.add(key);return true;});
}

function nextStepRecommendations(limit){
  return nextStepAllCandidates().slice(0,Math.max(1,limit||4));
}

function nextStepSummary(){
  const list=nextStepRecommendations(4);
  return {primary:list[0]||null,alternatives:list.slice(1),total:list.length};
}
