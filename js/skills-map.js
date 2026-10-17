// skills-map.js — carte transversale des compétences calculée depuis la progression existante.
// Aucune nouvelle source de vérité : les scores viennent du moteur adaptatif et des leçons/exercices déjà enregistrés.

const SKILL_MAP_CONFIG = {
  html: [
    {id:'html-structure',title:'Structure HTML',icon:'<>',keywords:['structure','document','doctype','html','head','body','balise']},
    {id:'html-content',title:'Contenu & texte',icon:'¶',keywords:['texte','titre','paragraphe','liste','lien','image']},
    {id:'html-forms',title:'Formulaires',icon:'▣',keywords:['formulaire','form','input','label','button','select','validation']},
    {id:'html-semantics',title:'Sémantique',icon:'◇',keywords:['sémantique','header','main','section','article','nav','footer']},
    {id:'html-accessibility',title:'Accessibilité',icon:'A11y',keywords:['accessibilité','aria','alt','label','focus','clavier']},
    {id:'html-advanced',title:'HTML robuste',icon:'✓',keywords:['metadata','meta','seo','tableau','responsive','performance']}
  ],
  css: [
    {id:'css-basics',title:'Sélecteurs & cascade',icon:'#',keywords:['sélecteur','cascade','spécificité','héritage','couleur','font']},
    {id:'css-box',title:'Box model',icon:'□',keywords:['box','margin','padding','border','width','height']},
    {id:'css-layout',title:'Flexbox',icon:'↔',keywords:['flex','flexbox','justify','align']},
    {id:'css-grid',title:'Grid',icon:'▦',keywords:['grid','column','row','gap']},
    {id:'css-responsive',title:'Responsive',icon:'↕',keywords:['responsive','media','clamp','viewport']},
    {id:'css-polish',title:'UI & animations',icon:'✦',keywords:['animation','transition','transform','pseudo','variable','custom property']}
  ],
  javascript: [
    {id:'js-basics',title:'Variables & types',icon:'JS',keywords:['variable','let','const','type','string','number','boolean']},
    {id:'js-logic',title:'Logique & boucles',icon:'?',keywords:['condition','if','switch','boucle','for','while','opérateur']},
    {id:'js-functions',title:'Fonctions',icon:'ƒ',keywords:['fonction','function','paramètre','return','scope','portée']},
    {id:'js-data',title:'Tableaux & objets',icon:'[]',keywords:['tableau','array','objet','object','map','filter','reduce']},
    {id:'js-dom',title:'DOM & événements',icon:'DOM',keywords:['dom','queryselector','événement','event','listener','élément']},
    {id:'js-async',title:'Asynchrone & APIs',icon:'⏱',keywords:['promise','async','await','fetch','api','asynchrone']}
  ],
  react: [
    {id:'react-components',title:'Composants & JSX',icon:'⚛',keywords:['composant','jsx','component','vite']},
    {id:'react-props',title:'Props & composition',icon:'→',keywords:['props','composition','children']},
    {id:'react-state',title:'State & événements',icon:'◉',keywords:['state','usestate','état','événement','event']},
    {id:'react-effects',title:'Effects & cycle de vie',icon:'↻',keywords:['useeffect','effect','cycle','fetch']},
    {id:'react-data',title:'Listes & données',icon:'≡',keywords:['liste','key','map','formulaire','controlled']},
    {id:'react-architecture',title:'Architecture React',icon:'◇',keywords:['context','hook','custom','routing','performance','memo']}
  ],
  typescript: [
    {id:'ts-types',title:'Types fondamentaux',icon:'TS',keywords:['type','string','number','boolean','annotation','inférence']},
    {id:'ts-objects',title:'Objets & interfaces',icon:'{}',keywords:['interface','object','objet','property','propriété']},
    {id:'ts-unions',title:'Unions & narrowing',icon:'|',keywords:['union','narrowing','null','undefined','literal']},
    {id:'ts-generics',title:'Génériques',icon:'<T>',keywords:['générique','generic','type parameter']},
    {id:'ts-advanced',title:'Types avancés',icon:'◇',keywords:['keyof','utility','mapped','conditional','unknown','never']},
    {id:'ts-project',title:'TypeScript en projet',icon:'✓',keywords:['module','config','tsconfig','dom','api','projet']}
  ],
  node: [
    {id:'node-runtime',title:'Runtime & CLI',icon:'N',keywords:['node.js','runtime','terminal','process','argv','npm']},
    {id:'node-modules',title:'Modules & fichiers',icon:'▤',keywords:['module','esm','commonjs','fs','fichier','path']},
    {id:'node-async',title:'Asynchronisme',icon:'⏱',keywords:['async','await','promise','event loop']},
    {id:'node-http',title:'HTTP & API',icon:'⇄',keywords:['http','serveur','server','api','route','request','response']},
    {id:'node-architecture',title:'Architecture backend',icon:'◇',keywords:['controller','service','repository','middleware','validation','crud']},
    {id:'node-production',title:'Production & qualité',icon:'✓',keywords:['test','security','sécurité','stream','signal','health','production','typescript']}
  ],
  sql: [
    {id:'sql-read',title:'Lire les données',icon:'SELECT',keywords:['select','table','colonne','distinct','limit']},
    {id:'sql-filter',title:'Filtrer & trier',icon:'WHERE',keywords:['where','order','like','between','null','in']},
    {id:'sql-aggregate',title:'Agrégations',icon:'Σ',keywords:['count','sum','avg','group by','having','agrég']},
    {id:'sql-joins',title:'Relations & JOIN',icon:'⋈',keywords:['join','relation','clé étrangère','foreign key','inner','left']},
    {id:'sql-model',title:'CRUD & schéma',icon:'DB',keywords:['insert','update','delete','create table','constraint','transaction','alter']},
    {id:'sql-pro',title:'SQL avancé',icon:'⚙',keywords:['cte','window','index','explain','normalisation','injection','paramétr']}
  ]
};

function skillMapHaystack(lesson,path){
  const parts=[lesson.title,lesson.objective,lesson.description,lesson.code,lesson.shortcut];
  ['explanation','explanations','details','mistakes'].forEach(k=>{ if(Array.isArray(lesson[k])) parts.push(...lesson[k]); });
  adaptiveExercisesForLesson(path,lesson.id).forEach(ex=>parts.push(ex.notion,ex.question,ex.statement,ex.label));
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function skillMapLessons(pathId,skill){
  const path=ADAPTIVE_PATHS[pathId]; if(!path) return [];
  const keys=skill.keywords.map(k=>String(k).toLowerCase());
  return path.lessons().filter(l=>{const text=skillMapHaystack(l,path);return keys.some(k=>text.includes(k));});
}

function skillMapAnalyze(pathId,skill,index){
  const lessons=skillMapLessons(pathId,skill);
  const analyses=lessons.map(l=>adaptiveLessonAnalysis(pathId,l)).filter(Boolean);
  const touched=analyses.some(a=>a.done||a.attempted>0);
  const score=analyses.length?Math.round(analyses.reduce((n,a)=>n+a.score,0)/analyses.length):0;
  const weak=analyses.reduce((n,a)=>n+(a.status==='reinforce'?1:0),0);
  const due=analyses.reduce((n,a)=>n+a.due,0);
  let status='unseen',label='Non vue';
  if(touched){status='learning';label='En cours';}
  if(touched && (score<55||weak>0)){status='reinforce';label='À renforcer';}
  else if(touched && score>=82 && analyses.length && analyses.every(a=>a.score>=70)){status='mastered';label='Maîtrisée';}
  const target=analyses.slice().sort((a,b)=>a.score-b.score)[0]||null;
  return {...skill,index,lessons,analyses,touched,score,weak,due,status,label,target};
}

function skillMapPath(pathId){
  const path=ADAPTIVE_PATHS[pathId];
  const config=SKILL_MAP_CONFIG[pathId]||[];
  const skills=config.map((s,i)=>skillMapAnalyze(pathId,s,i));
  const started=skills.some(s=>s.touched);
  const score=skills.length?Math.round(skills.reduce((n,s)=>n+s.score,0)/skills.length):0;
  const mastered=skills.filter(s=>s.status==='mastered').length;
  const reinforce=skills.filter(s=>s.status==='reinforce').length;
  return {path,skills,started,score,mastered,reinforce};
}

function skillMapAll(){ return adaptivePathList().map(p=>skillMapPath(p.id)); }

function skillMapSummary(){
  const paths=skillMapAll();
  const all=paths.flatMap(p=>p.skills);
  return {paths,total:all.length,mastered:all.filter(s=>s.status==='mastered').length,reinforce:all.filter(s=>s.status==='reinforce').length,learning:all.filter(s=>s.status==='learning').length};
}

function skillMapStatusClass(status){return status==='mastered'?'ok':status==='reinforce'?'review':status==='learning'?'todo':'locked';}

function skillMapAction(pathId,skill){
  const path=ADAPTIVE_PATHS[pathId];
  if(skill.target){
    const ex=adaptiveBestExercise(skill.target);
    if((skill.status==='reinforce'||skill.status==='learning')&&ex) return {href:path.exerciseHref(ex.id),label:skill.status==='reinforce'?'Renforcer':'Pratiquer'};
    return {href:path.lessonHref(skill.target.lesson.id),label:'Voir la leçon'};
  }
  return {href:path.home,label:'Ouvrir le parcours'};
}
