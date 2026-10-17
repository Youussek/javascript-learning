// adaptive-path.js — recommandations d'apprentissage calculées à partir de la progression réelle.
// Ne remplace jamais la progression existante : il la lit et propose la prochaine action utile.

const ADAPTIVE_PATHS = {
  javascript:{ id:"javascript", title:"JavaScript", mark:"JS", lessons:()=>LESSONS, exercises:()=>EXERCISES, lessonLevel:l=>Number(String(l.module||"n1").replace(/\D/g,""))||1, lessonHref:id=>"/cours/"+id, exerciseHref:id=>"/exercice/"+id, home:"/javascript", state:()=>state },
  react:{ id:"react", title:"React.js + Vite", mark:"⚛", lessons:()=>REACT_LESSONS, exercises:()=>REACT_EXERCISES, lessonLevel:l=>Number(l.level)||1, lessonHref:id=>"/react/cours/"+id, exerciseHref:id=>"/react/exercice/"+id, home:"/react", state:()=>state.react||{} },
  css:{ id:"css", title:"CSS", mark:"CSS", lessons:()=>CSS_LESSONS, exercises:()=>CSS_EXERCISES, lessonLevel:l=>Number(l.level)||1, lessonHref:id=>"/css/cours/"+id, exerciseHref:id=>"/css/exercice/"+id, home:"/css", state:()=>state.css||{} },
  html:{ id:"html", title:"HTML", mark:"HTML", lessons:()=>HTML_LESSONS, exercises:()=>HTML_EXERCISES, lessonLevel:l=>Number(l.level)||1, lessonHref:id=>"/html/cours/"+id, exerciseHref:id=>"/html/exercice/"+id, home:"/html", state:()=>state.html||{} },
  typescript:{ id:"typescript", title:"TypeScript", mark:"TS", lessons:()=>TYPESCRIPT_LESSONS, exercises:()=>TYPESCRIPT_EXERCISES, lessonLevel:l=>Number(l.level)||1, lessonHref:id=>"/typescript/cours/"+id, exerciseHref:id=>"/typescript/exercice/"+id, home:"/typescript", state:()=>state.typescript||{} },
  node:{ id:"node", title:"Node.js", mark:"N", lessons:()=>NODE_LESSONS, exercises:()=>NODE_EXERCISES, lessonLevel:l=>Number(l.level)||1, lessonHref:id=>"/node/cours/"+id, exerciseHref:id=>"/node/exercice/"+id, home:"/node", state:()=>state.node||{} },
  sql:{ id:"sql", title:"SQL", mark:"SQL", lessons:()=>SQL_LESSONS, exercises:()=>SQL_EXERCISES, lessonLevel:l=>Number(l.level)||1, lessonHref:id=>"/sql/cours/"+id, exerciseHref:id=>"/sql/exercice/"+id, home:"/sql", state:()=>state.sql||{} }
};

function adaptivePathList(){
  return Object.values(ADAPTIVE_PATHS);
}

function adaptiveExercisesForLesson(path, lessonId){
  return path.exercises().filter(ex=>ex.lesson===lessonId);
}

function adaptiveLessonAnalysis(pathId, lesson){
  const path=ADAPTIVE_PATHS[pathId];
  if(!path) return null;
  const exs=adaptiveExercisesForLesson(path,lesson.id);
  const records=exs.map(ex=>({ex,record:getRecord(ex.id)}));
  const attempted=records.filter(x=>(x.record.attempts||0)>0).length;
  const solved=records.filter(x=>x.record.success).length;
  const reviews=records.filter(x=>x.record.review).length;
  const due=records.filter(x=>x.record.reviewDueAt && x.record.reviewDueAt<=Date.now()).length;
  const fails=records.reduce((n,x)=>n+(Number(x.record.fails)||0),0);
  const points=records.reduce((n,x)=>n+(Number(x.record.points)||0),0);
  const maxPoints=Math.max(1,exs.length*3);
  const cleanStrength=Math.min(1,points/maxPoints);
  const successRatio=exs.length?solved/exs.length:0;
  const done=Boolean((path.state().lessonsDone||{})[lesson.id]);
  const recall=records.length?records.reduce((n,x)=>n+Math.min(3,Number(x.record.reviewStreak)||0),0)/(records.length*3):0;
  let score=Math.round((successRatio*.58 + cleanStrength*.17 + (done?1:0)*.1 + recall*.15)*100);
  score-=Math.min(22,reviews*5 + due*4 + Math.min(10,fails));
  score=Math.max(0,Math.min(100,score));
  const untouched=!done && attempted===0;
  let status="continue", label="Continuer";
  if(!untouched && (score<55 || reviews>=2 || due>=2)){status="reinforce";label="Renforcer";}
  else if(!untouched && (score<78 || reviews>0 || due>0)){status="consolidate";label="Consolider";}
  else if(score>=85 && solved===exs.length && done){status="mastered";label="Maîtrisé";}
  const reasons=[];
  if(due) reasons.push(due+" révision"+(due>1?"s":"")+" due"+(due>1?"s":""));
  if(reviews) reasons.push(reviews+" exercice"+(reviews>1?"s":"")+" à revoir");
  if(fails>=2) reasons.push(fails+" erreurs enregistrées");
  if(done && solved<exs.length) reasons.push("leçon lue mais pratique incomplète");
  if(score>=85 && solved===exs.length) reasons.push("réussites solides sur toute la leçon");
  if(untouched) reasons.push("prochaine notion encore non commencée");
  return {path,lesson,level:path.lessonLevel(lesson),exs,records,attempted,solved,reviews,due,fails,points,score,status,label,reasons,done,untouched};
}

function adaptivePathAnalysis(pathId){
  const path=ADAPTIVE_PATHS[pathId];
  if(!path) return null;
  const lessons=path.lessons().map(l=>adaptiveLessonAnalysis(pathId,l));
  const started=lessons.some(x=>x.done||x.attempted>0);
  const mastered=lessons.filter(x=>x.status==="mastered").length;
  const weak=lessons.filter(x=>x.status==="reinforce");
  const consolidate=lessons.filter(x=>x.status==="consolidate");
  const current=weak[0] || consolidate[0] || lessons.find(x=>!x.done || x.solved<x.exs.length) || lessons[lessons.length-1];
  const score=lessons.length?Math.round(lessons.reduce((n,x)=>n+x.score,0)/lessons.length):0;
  return {path,lessons,started,mastered,weak,consolidate,current,score};
}

function adaptiveAllAnalyses(){
  return adaptivePathList().map(p=>adaptivePathAnalysis(p.id));
}

function adaptivePriority(item){
  let p=0;
  if(item.status==="reinforce") p+=100;
  if(item.status==="consolidate") p+=60;
  if(item.due) p+=Math.min(30,item.due*8);
  if(item.reviews) p+=Math.min(20,item.reviews*5);
  p+=Math.min(15,item.fails*2);
  p+=(100-item.score)*.15;
  return p;
}

function adaptiveSession(limit,pathId){
  const analyses=(pathId?[adaptivePathAnalysis(pathId)]:adaptiveAllAnalyses()).filter(Boolean);
  const candidates=[];
  analyses.forEach(a=>a.lessons.forEach(l=>{
    if(l.status!=="mastered") candidates.push(l);
  }));
  candidates.sort((a,b)=>adaptivePriority(b)-adaptivePriority(a));
  const max=Math.max(1,limit||5), chosen=[];
  const used=new Set();
  // D'abord diversifier les parcours lorsque plusieurs sont concernés.
  for(const item of candidates){
    if(chosen.length>=max) break;
    if(!used.has(item.path.id)) { chosen.push(item); used.add(item.path.id); }
  }
  for(const item of candidates){
    if(chosen.length>=max) break;
    if(!chosen.includes(item)) chosen.push(item);
  }
  return chosen;
}

function adaptiveBestExercise(item){
  if(!item) return null;
  const due=item.records.find(x=>x.record.reviewDueAt && x.record.reviewDueAt<=Date.now());
  if(due) return due.ex;
  const review=item.records.find(x=>x.record.review);
  if(review) return review.ex;
  const failed=item.records.find(x=>(x.record.fails||0)>0 && !x.record.success);
  if(failed) return failed.ex;
  return item.records.find(x=>!x.record.success)?.ex || item.exs[0] || null;
}

function adaptiveAction(item){
  const ex=adaptiveBestExercise(item);
  if(item.status==="reinforce" && ex) return {href:item.path.exerciseHref(ex.id),label:"Renforcer cette notion",kind:"exercise"};
  if(item.status==="consolidate" && ex) return {href:item.path.exerciseHref(ex.id),label:"Consolider maintenant",kind:"exercise"};
  return {href:item.path.lessonHref(item.lesson.id),label:item.untouched?"Découvrir la notion":"Continuer la leçon",kind:"lesson"};
}

function adaptiveReasonText(item){
  if(item.reasons.length) return item.reasons.slice(0,2).join(" · ");
  return "Recommandation calculée à partir de ta progression réelle.";
}

function adaptiveSummary(){
  const analyses=adaptiveAllAnalyses();
  const weak=analyses.reduce((n,a)=>n+a.weak.length,0);
  const consolidate=analyses.reduce((n,a)=>n+a.consolidate.length,0);
  const mastered=analyses.reduce((n,a)=>n+a.mastered,0);
  const started=analyses.filter(a=>a.started).length;
  return {analyses,weak,consolidate,mastered,started,session:adaptiveSession(5)};
}
