// mastery-index.js — indice de maîtrise calculé uniquement depuis la progression existante.
// Il ne crée aucune source de vérité parallèle et ne modifie jamais les validations.

function masteryClamp(value){ return Math.max(0,Math.min(100,Math.round(Number(value)||0))); }

function masteryLevel(score,started){
  if(!started) return {key:'unseen',label:'Non commencé'};
  if(score<35) return {key:'beginner',label:'Bases en construction'};
  if(score<55) return {key:'progress',label:'En progression'};
  if(score<75) return {key:'solid',label:'Maîtrise solide'};
  if(score<90) return {key:'strong',label:'Très bonne maîtrise'};
  return {key:'advanced',label:'Maîtrise avancée'};
}

function masteryRetention(records){
  if(!records.length) return 0;
  const practiced=records.filter(x=>(x.record.attempts||0)>0 || x.record.success);
  if(!practiced.length) return 0;
  const scores=practiced.map(({record})=>{
    if(!record.success) return Math.max(0,25-Math.min(25,(Number(record.fails)||0)*5));
    const streak=Math.min(3,Number(record.reviewStreak)||0);
    let value=68+streak*10;
    if(record.review) value-=18;
    if(record.reviewDueAt && record.reviewDueAt<=Date.now()) value-=15;
    return masteryClamp(value);
  });
  return masteryClamp(scores.reduce((n,x)=>n+x,0)/scores.length);
}

function masteryPathDetail(pathId){
  const analysis=adaptivePathAnalysis(pathId);
  if(!analysis) return null;
  const touched=analysis.lessons.filter(x=>!x.untouched);
  const started=touched.length>0;
  const allRecords=touched.flatMap(x=>x.records||[]);
  const attempted=allRecords.filter(x=>(x.record.attempts||0)>0).length;
  const solved=allRecords.filter(x=>x.record.success).length;
  const due=allRecords.filter(x=>x.record.reviewDueAt && x.record.reviewDueAt<=Date.now()).length;
  const review=allRecords.filter(x=>x.record.review).length;
  const fails=allRecords.reduce((n,x)=>n+(Number(x.record.fails)||0),0);
  const understanding=started?masteryClamp(touched.reduce((n,x)=>n+x.score,0)/touched.length):0;
  const practice=attempted?masteryClamp((solved/attempted)*100):0;
  const retention=masteryRetention(allRecords);
  const coverage=analysis.lessons.length?masteryClamp((touched.length/analysis.lessons.length)*100):0;
  // La couverture a volontairement un poids limité : l'indice mesure surtout la solidité de ce qui a été travaillé.
  const score=started?masteryClamp(understanding*.40 + practice*.25 + retention*.20 + coverage*.15):0;
  const level=masteryLevel(score,started);
  const skillPath=typeof skillMapPath==='function'?skillMapPath(pathId):null;
  const fragileSkills=skillPath?skillPath.skills.filter(s=>s.status==='reinforce').sort((a,b)=>a.score-b.score):[];
  const strongSkills=skillPath?skillPath.skills.filter(s=>s.status==='mastered').sort((a,b)=>b.score-a.score):[];
  const priority=analysis.weak[0] || analysis.consolidate[0] || analysis.current || null;
  return {pathId,path:analysis.path,analysis,started,score,level,understanding,practice,retention,coverage,touched:touched.length,totalLessons:analysis.lessons.length,attempted,solved,due,review,fails,fragileSkills,strongSkills,priority};
}

function masteryAll(){ return adaptivePathList().map(p=>masteryPathDetail(p.id)).filter(Boolean); }

function masterySummary(){
  const paths=masteryAll();
  const started=paths.filter(p=>p.started);
  const weightTotal=started.reduce((n,p)=>n+Math.max(1,p.touched),0);
  const score=weightTotal?masteryClamp(started.reduce((n,p)=>n+p.score*Math.max(1,p.touched),0)/weightTotal):0;
  const fragile=started.reduce((n,p)=>n+p.fragileSkills.length,0);
  const due=started.reduce((n,p)=>n+p.due,0);
  const strongest=started.slice().sort((a,b)=>b.score-a.score)[0]||null;
  const weakest=started.slice().sort((a,b)=>a.score-b.score)[0]||null;
  return {paths,started,score,level:masteryLevel(score,started.length>0),fragile,due,strongest,weakest};
}

function masteryAction(detail){
  const item=detail&&detail.priority;
  if(!item) return {href:detail?.path?.home||'/',label:'Ouvrir le parcours'};
  if(typeof adaptiveAction==='function') return adaptiveAction(item);
  return {href:detail.path.lessonHref(item.lesson.id),label:'Continuer'};
}

function masteryGauge(score,label){
  return h('div',{class:'mastery-gauge',style:`--mastery:${masteryClamp(score)}`},
    h('div',{class:'mastery-gauge-core'},h('strong',{},score+' %'),h('span',{},label||'maîtrise'))
  );
}

function masteryFactor(title,value,detail){
  return h('article',{class:'mastery-factor'},h('div',{class:'mastery-factor-head'},h('strong',{},title),h('span',{},value+' %')),bar(value),para(detail,'muted small'));
}

function renderMasteryIndex(){
  const summary=masterySummary();
  const started=summary.started;
  return h('div',{class:'page mastery-page'},
    h('p',{class:'crumbs'},link('/dashboard','Mes parcours'),' / Indice de maîtrise'),
    h('section',{class:'mastery-hero'},
      h('div',{},h('span',{class:'eyebrow'},'INDICE DE MAÎTRISE'),h('h1',{},started.length?'Mesure ce que tu maîtrises vraiment':'Ton indice se construira avec ta pratique'),para('Cet indice ne récompense pas seulement les pages terminées. Il combine compréhension, exercices réussis, rétention dans le temps et couverture du parcours.','lead'),h('div',{class:'toolbar'},started.length&&summary.weakest?link(masteryAction(summary.weakest).href,'Renforcer ma maîtrise →','btn primary big'):link('/','Commencer un parcours →','btn primary big'),link('/competences','Voir la carte des compétences','btn big'))),
      masteryGauge(summary.score,summary.level.label)
    ),
    h('section',{class:'mastery-summary-grid'},
      h('article',{class:'block'},h('span',{class:'eyebrow'},'LECTURE GLOBALE'),h('h2',{},summary.level.label),para(started.length?`${started.length} parcours commencé${started.length>1?'s':''} sont inclus dans le calcul. Les parcours vierges ne font pas baisser la moyenne.`:'Aucun parcours commencé : le score reste neutre à 0 %.','muted')),
      h('article',{class:'block'},h('span',{class:'eyebrow'},'POINTS À RENFORCER'),h('h2',{},summary.fragile?summary.fragile+' compétence'+(summary.fragile>1?'s':'')+' fragile'+(summary.fragile>1?'s':''):'Aucune fragilité forte détectée'),para(summary.due?summary.due+' révision'+(summary.due>1?'s':'')+' arrivée'+(summary.due>1?'s':'')+' à échéance.':'Aucune révision due ne pèse actuellement sur l’indice.','muted')),
      h('article',{class:'block'},h('span',{class:'eyebrow'},'MEILLEUR PARCOURS'),h('h2',{},summary.strongest?summary.strongest.path.title:'—'),para(summary.strongest?summary.strongest.score+' % de maîtrise calculée.':'Commence à pratiquer pour obtenir une comparaison.','muted'))
    ),
    started.length?h('section',{class:'mastery-path-list'},...started.map(detail=>{
      const action=masteryAction(detail);
      return h('article',{class:'block mastery-path-card path-card--'+detail.pathId},
        h('div',{class:'mastery-path-head'},h('div',{},h('span',{class:'eyebrow'},detail.path.title),h('h2',{},detail.level.label),para(`${detail.touched} leçon${detail.touched>1?'s':''} travaillée${detail.touched>1?'s':''} sur ${detail.totalLessons} · ${detail.solved}/${detail.attempted||0} exercices pratiqués réussis`,'muted small')),masteryGauge(detail.score,'maîtrise')),
        h('div',{class:'mastery-factors'},
          masteryFactor('Compréhension',detail.understanding,'Qualité des résultats sur les notions déjà travaillées.'),
          masteryFactor('Pratique',detail.practice,'Part des exercices tentés qui sont réellement validés.'),
          masteryFactor('Rétention',detail.retention,detail.due?detail.due+' rappel(s) dû(s) réduisent temporairement ce facteur.':'Réussites consolidées et rappels mémoriels.'),
          masteryFactor('Couverture',detail.coverage,'Part du programme de ce parcours déjà réellement abordée.')
        ),
        detail.fragileSkills.length?h('div',{class:'mastery-skill-row'},h('strong',{},'À renforcer : '),...detail.fragileSkills.slice(0,4).map(s=>h('span',{class:'chip'},s.title+' · '+s.score+' %'))):h('div',{class:'mastery-skill-row'},h('strong',{},'Signal : '),h('span',{class:'chip ok'},detail.strongSkills.length?'Compétences solides détectées':'Continue à pratiquer pour affiner le diagnostic')),
        h('div',{class:'toolbar'},link(action.href,action.label+' →','btn primary'),link(detail.path.home,'Voir le parcours','btn'))
      );
    })):h('section',{class:'empty-dashboard'},h('h2',{},'Aucune donnée de maîtrise pour le moment'),para('Lis une leçon puis réalise quelques exercices : l’indice commencera immédiatement à distinguer progression et maîtrise.','muted'),link('/','Choisir un parcours →','btn primary big')),
    h('section',{class:'block mastery-method'},h('span',{class:'eyebrow'},'COMMENT IL EST CALCULÉ'),h('h2',{},'Un score explicable, pas une note magique'),h('div',{class:'mastery-method-grid'},
      h('article',{},h('strong',{},'40 % · Compréhension'),para('Score réel des leçons déjà abordées, incluant réussites, erreurs et rappels.','muted small')),
      h('article',{},h('strong',{},'25 % · Pratique'),para('Taux de réussite sur les exercices effectivement tentés.','muted small')),
      h('article',{},h('strong',{},'20 % · Rétention'),para('Réussites consolidées, séries de révision et rappels arrivés à échéance.','muted small')),
      h('article',{},h('strong',{},'15 % · Couverture'),para('Part du parcours déjà travaillée afin d’éviter qu’une seule notion réussie donne 100 %.','muted small'))
    ),para('L’indice est recalculé à la volée depuis ta progression. Il n’ajoute aucune validation et n’écrit aucun score artificiel dans ta sauvegarde.','muted'))
  );
}
