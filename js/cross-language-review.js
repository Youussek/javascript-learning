// cross-language-review.js — révisions croisées entre parcours à partir des compétences réelles.
// Ne modifie aucune progression : cette vue lit les scores existants et relie des notions équivalentes/complementaires.

const CROSS_LANGUAGE_LINKS = [
  {id:'html-css-structure',from:'html',to:'css',fromSkills:['html-structure','html-semantics'],toSkills:['css-basics','css-box'],title:'Structure HTML ↔ sélection CSS',prompt:'Relie la structure du document aux sélecteurs et au box model.',why:'Le CSS dépend directement de la structure HTML qu’il cible.'},
  {id:'html-react-semantics',from:'html',to:'react',fromSkills:['html-semantics','html-forms'],toSkills:['react-components','react-data'],title:'HTML sémantique ↔ JSX',prompt:'Retrouve les mêmes intentions sémantiques dans un composant React.',why:'JSX reprend les éléments HTML, mais ajoute la logique des composants.'},
  {id:'css-react-ui',from:'css',to:'react',fromSkills:['css-layout','css-responsive','css-polish'],toSkills:['react-components','react-state'],title:'CSS ↔ composants React',prompt:'Associe mise en page, état visuel et composants réutilisables.',why:'Un composant React utile combine souvent structure, état et styles.'},
  {id:'js-ts-types',from:'javascript',to:'typescript',fromSkills:['js-basics','js-data','js-functions'],toSkills:['ts-types','ts-objects','ts-unions'],title:'JavaScript ↔ TypeScript',prompt:'Transforme une logique JavaScript connue en version typée et plus sûre.',why:'TypeScript renforce des concepts JavaScript déjà appris au lieu de les remplacer.'},
  {id:'js-react-state',from:'javascript',to:'react',fromSkills:['js-functions','js-data','js-dom'],toSkills:['react-components','react-state','react-data'],title:'JavaScript ↔ React',prompt:'Relie fonctions, tableaux, événements et DOM au modèle composant/state de React.',why:'React réutilise les fondamentaux JavaScript dans une architecture déclarative.'},
  {id:'js-node-runtime',from:'javascript',to:'node',fromSkills:['js-functions','js-data','js-async'],toSkills:['node-runtime','node-modules','node-async'],title:'JavaScript navigateur ↔ Node.js',prompt:'Compare la même logique JavaScript dans le navigateur et côté serveur.',why:'Le langage reste JavaScript, mais l’environnement et les API disponibles changent.'},
  {id:'ts-node-quality',from:'typescript',to:'node',fromSkills:['ts-objects','ts-generics','ts-project'],toSkills:['node-modules','node-architecture','node-production'],title:'TypeScript ↔ Node.js',prompt:'Relie contrats de types et architecture backend.',why:'Les types deviennent particulièrement utiles aux frontières d’une API et entre modules.'},
  {id:'node-sql-data',from:'node',to:'sql',fromSkills:['node-http','node-architecture'],toSkills:['sql-read','sql-filter','sql-joins','sql-model'],title:'Node.js ↔ SQL',prompt:'Relie une route backend aux requêtes et données qu’elle manipule.',why:'Une API backend transforme souvent une requête HTTP en lecture ou écriture SQL.'},
  {id:'js-sql-thinking',from:'javascript',to:'sql',fromSkills:['js-data','js-functions'],toSkills:['sql-filter','sql-aggregate'],title:'Tableaux JavaScript ↔ requêtes SQL',prompt:'Compare filter/map/reduce avec WHERE, SELECT et GROUP BY.',why:'Les deux mondes manipulent des collections, mais avec des modèles d’exécution différents.'}
];

function crossSkill(pathId,skillId){
  const path=typeof skillMapPath==='function'?skillMapPath(pathId):null;
  return path?path.skills.find(s=>s.id===skillId):null;
}
function crossPathStarted(pathId){
  const a=typeof adaptivePathAnalysis==='function'?adaptivePathAnalysis(pathId):null;
  return Boolean(a&&a.started);
}
function crossAverage(skills){
  const valid=skills.filter(Boolean);
  return valid.length?Math.round(valid.reduce((n,s)=>n+(Number(s.score)||0),0)/valid.length):0;
}
function crossBestTarget(pathId,skills){
  const path=ADAPTIVE_PATHS[pathId];
  const candidates=skills.filter(Boolean).sort((a,b)=>a.score-b.score);
  for(const skill of candidates){
    const action=skillMapAction(pathId,skill);
    if(action) return {...action,skill};
  }
  return {href:path?.home||'/',label:'Ouvrir le parcours',skill:null};
}
function crossLinkAnalysis(link){
  const fromSkills=link.fromSkills.map(id=>crossSkill(link.from,id)).filter(Boolean);
  const toSkills=link.toSkills.map(id=>crossSkill(link.to,id)).filter(Boolean);
  const fromStarted=crossPathStarted(link.from), toStarted=crossPathStarted(link.to);
  const started=fromStarted||toStarted;
  const fromScore=crossAverage(fromSkills), toScore=crossAverage(toSkills);
  const weakest=[...fromSkills.map(s=>({pathId:link.from,skill:s})),...toSkills.map(s=>({pathId:link.to,skill:s}))].sort((a,b)=>a.skill.score-b.skill.score)[0]||null;
  const due=[...fromSkills,...toSkills].reduce((n,s)=>n+(Number(s.due)||0),0);
  const reinforce=[...fromSkills,...toSkills].filter(s=>s.status==='reinforce').length;
  const gap=Math.abs(fromScore-toScore);
  let priority=0;
  if(started) priority+=30;
  if(fromStarted&&toStarted) priority+=25;
  priority+=reinforce*18+Math.min(25,due*6)+Math.min(20,gap*.35);
  if(weakest) priority+=(100-weakest.skill.score)*.18;
  const direction=fromScore<=toScore?{weak:link.from,strong:link.to}:{weak:link.to,strong:link.from};
  const targetSkills=direction.weak===link.from?fromSkills:toSkills;
  const action=crossBestTarget(direction.weak,targetSkills);
  return {...link,fromSkills,toSkills,fromStarted,toStarted,started,fromScore,toScore,due,reinforce,gap,priority,direction,action,weakest};
}
function crossLanguageSummary(){
  const links=CROSS_LANGUAGE_LINKS.map(crossLinkAnalysis);
  const useful=links.filter(x=>x.started).sort((a,b)=>b.priority-a.priority);
  const activePaths=adaptivePathList().filter(p=>crossPathStarted(p.id));
  return {links,useful,activePaths,primary:useful[0]||null};
}
function crossPathLabel(id){ return ADAPTIVE_PATHS[id]?.title||id; }
function crossSkillChips(pathId,skills){
  return h('div',{class:'cross-skill-chips'},...skills.map(s=>h('span',{class:'chip '+(s.status==='reinforce'?'review':s.status==='mastered'?'ok':'')},s.title+' · '+s.score+' %')));
}
function crossReviewCard(item,index){
  return h('article',{class:'block cross-review-card'},
    h('div',{class:'cross-review-head'},
      h('div',{},h('span',{class:'eyebrow'},'CONNEXION '+String(index+1).padStart(2,'0')),h('h2',{},item.title),para(item.prompt,'muted')),
      h('span',{class:'status '+(item.reinforce?'review':item.fromStarted&&item.toStarted?'ok':'todo')},item.reinforce?item.reinforce+' point(s) fragile(s)':item.fromStarted&&item.toStarted?'Deux parcours actifs':'Pont à découvrir')
    ),
    h('div',{class:'cross-score-grid'},
      h('section',{class:'cross-score-panel path-card--'+item.from},h('strong',{},crossPathLabel(item.from)),h('span',{class:'cross-score'},item.fromScore+' %'),bar(item.fromScore),crossSkillChips(item.from,item.fromSkills)),
      h('div',{class:'cross-arrow','aria-hidden':'true'},'⇄'),
      h('section',{class:'cross-score-panel path-card--'+item.to},h('strong',{},crossPathLabel(item.to)),h('span',{class:'cross-score'},item.toScore+' %'),bar(item.toScore),crossSkillChips(item.to,item.toSkills))
    ),
    h('div',{class:'cross-why'},h('strong',{},'Pourquoi les relier ? '),h('span',{},item.why)),
    h('div',{class:'toolbar'},link(item.action.href,(item.action.label||'Réviser')+' →','btn primary'),link(ADAPTIVE_PATHS[item.from].home,'Ouvrir '+crossPathLabel(item.from),'btn small'),link(ADAPTIVE_PATHS[item.to].home,'Ouvrir '+crossPathLabel(item.to),'btn small'))
  );
}
function renderCrossLanguageReview(){
  const summary=crossLanguageSummary();
  const visible=summary.useful.length?summary.useful:summary.links.slice(0,5);
  return h('div',{class:'page cross-language-page'},
    h('p',{class:'crumbs'},link('/dashboard','Mes parcours'),' / Révision inter-langages'),
    h('section',{class:'cross-language-hero'},
      h('div',{},h('span',{class:'eyebrow'},'RÉVISION INTER-LANGAGES'),h('h1',{},'Relie les concepts au lieu de les apprendre en silos'),para('Cette vue repère les notions communes ou complémentaires entre tes parcours et te propose le pont le plus utile selon ta progression réelle.','lead'),h('div',{class:'toolbar'},summary.primary?link(summary.primary.action.href,'Commencer la révision prioritaire →','btn primary big'):link('/','Commencer un parcours →','btn primary big'),link('/competences','Voir les compétences','btn big'))),
      h('div',{class:'cross-language-summary'},metric(summary.activePaths.length,'parcours actifs'),metric(summary.useful.filter(x=>x.fromStarted&&x.toStarted).length,'ponts actifs'),metric(summary.useful.reduce((n,x)=>n+x.reinforce,0),'fragilités reliées'))
    ),
    summary.primary?h('section',{class:'block cross-primary'},h('span',{class:'eyebrow'},'À FAIRE EN PRIORITÉ'),h('h2',{},summary.primary.title),para((summary.primary.gap?`Écart de ${summary.primary.gap} points entre les deux côtés. `:'')+(summary.primary.due?summary.primary.due+' rappel(s) dû(s). ':'' )+summary.primary.why,'muted'),h('div',{class:'toolbar'},link(summary.primary.action.href,summary.primary.action.label+' →','btn primary'))):null,
    h('section',{class:'cross-review-list'},...visible.map(crossReviewCard)),
    h('section',{class:'callout'},h('strong',{},'Ce que cette fonctionnalité ne fait pas'),para('Elle ne fusionne jamais les scores de deux langages, ne valide aucun exercice automatiquement et ne copie aucune progression. Elle utilise seulement les compétences existantes pour montrer les connexions pédagogiques utiles.','muted'))
  );
}
