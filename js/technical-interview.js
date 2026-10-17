// technical-interview.js — simulation d'entretien technique, séparée de la progression pédagogique.

const TECH_INTERVIEW_CONFIG = {
  questionsPerSession: 5,
  timers: [0, 900, 1500],
  paths: [
    {id:"all",label:"Tous les parcours"},{id:"javascript",label:"JavaScript"},{id:"react",label:"React"},
    {id:"html",label:"HTML"},{id:"css",label:"CSS"},{id:"typescript",label:"TypeScript"},
    {id:"node",label:"Node.js"},{id:"sql",label:"SQL"}
  ],
  levels:[{id:"junior",label:"Junior"},{id:"mixed",label:"Junior + intermédiaire"}]
};

const TECH_INTERVIEW_QUESTIONS = [
  {id:"js-scope",path:"javascript",difficulty:1,type:"theory",title:"Portée de let et const",prompt:"Quelle différence fais-tu entre var, let et const ? Dans un projet moderne, pourquoi privilégier let/const ?",expected:["let et const ont une portée de bloc","const empêche la réaffectation de la variable, pas forcément la mutation d'un objet","var a une portée de fonction et un comportement de hoisting plus piégeux","const par défaut, let si une réaffectation est nécessaire"],followUp:"Est-ce qu'un objet déclaré avec const peut être modifié ?"},
  {id:"js-read",path:"javascript",difficulty:1,type:"reading",title:"Lire une fermeture",prompt:"Que va afficher ce code et pourquoi ?",code:"function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next());\nconsole.log(next());",expected:["affiche 1 puis 2","la fonction retournée conserve l'accès à count","count n'est pas recréé à chaque appel de next","c'est un exemple de closure/fermeture"],followUp:"Que se passerait-il si makeCounter() était rappelée avant chaque console.log ?"},
  {id:"js-async",path:"javascript",difficulty:2,type:"reading",title:"Ordre asynchrone",prompt:"Explique l'ordre d'affichage sans exécuter le code.",code:"console.log('A');\nPromise.resolve().then(() => console.log('B'));\nsetTimeout(() => console.log('C'), 0);\nconsole.log('D');",expected:["A puis D sont synchrones","B arrive ensuite via la file des microtasks","C arrive après via la tâche du timer","ordre final A, D, B, C"],followUp:"Pourquoi Promise.then passe-t-il avant setTimeout(..., 0) ?"},
  {id:"js-debug",path:"javascript",difficulty:2,type:"debug",title:"Déboguer un tableau",prompt:"Ce code veut doubler chaque nombre mais le résultat est incorrect. Identifie le problème et propose une correction.",code:"const values = [1, 2, 3];\nconst doubled = values.forEach(v => v * 2);\nconsole.log(doubled);",expected:["forEach retourne undefined","map est adapté quand on veut construire un nouveau tableau","correction : values.map(v => v * 2)","forEach sert surtout aux effets de bord/itérations sans résultat collecté"],followUp:"Quand choisirais-tu forEach plutôt que map ?"},

  {id:"react-props-state",path:"react",difficulty:1,type:"theory",title:"Props vs state",prompt:"Comment expliquerais-tu la différence entre props et state dans React ?",expected:["les props sont reçues depuis le parent","le state appartient au composant qui le gère","les props sont en lecture seule du point de vue du composant enfant","une mise à jour du state peut provoquer un nouveau rendu"],followUp:"Quand remonterais-tu un state dans un composant parent ?"},
  {id:"react-key",path:"react",difficulty:1,type:"debug",title:"Clés de listes",prompt:"Pourquoi utiliser l'index comme key peut-il devenir problématique ici ?",code:"items.map((item, index) => (\n  <Todo key={index} item={item} />\n))",expected:["React utilise key pour identifier les éléments entre les rendus","un index change de signification lors d'insertion/suppression/réordonnancement","cela peut réutiliser le mauvais état local ou le mauvais DOM","préférer un identifiant stable issu des données"],followUp:"Dans quel cas l'index peut-il rester acceptable ?"},
  {id:"react-effect",path:"react",difficulty:2,type:"debug",title:"useEffect et dépendances",prompt:"Quel risque vois-tu dans cet effet ?",code:"useEffect(() => {\n  fetchUser(userId).then(setUser);\n}, []);",expected:["userId est utilisé dans l'effet mais absent des dépendances","si userId change, l'effet ne se relance pas","ajouter userId dans le tableau de dépendances","évoquer éventuellement l'annulation/gestion des réponses obsolètes"],followUp:"Pourquoi supprimer simplement le tableau de dépendances n'est-il pas toujours une bonne correction ?"},
  {id:"react-derived",path:"react",difficulty:2,type:"scenario",title:"État dérivé",prompt:"Un composant stocke firstName, lastName et fullName dans trois states. Que changerais-tu ?",expected:["fullName est dérivable des deux autres valeurs","éviter un state redondant réduit les risques de désynchronisation","calculer fullName pendant le rendu ou via useMemo seulement si nécessaire","garder une source de vérité minimale"],followUp:"Quand useMemo serait-il justifié ici ?"},

  {id:"html-semantic",path:"html",difficulty:1,type:"theory",title:"HTML sémantique",prompt:"Pourquoi préférer <button> à un <div onClick=...> pour une action ?",expected:["button porte la bonne sémantique","il est focusable et activable au clavier par défaut","les technologies d'assistance comprennent son rôle","cela réduit le JavaScript/accessibilité à recréer manuellement"],followUp:"Quand utiliserais-tu plutôt un lien <a> ?"},
  {id:"html-form",path:"html",difficulty:1,type:"debug",title:"Formulaire accessible",prompt:"Quel problème d'accessibilité vois-tu dans ce formulaire ?",code:"<input type=\"email\" placeholder=\"Ton email\">",expected:["le placeholder ne remplace pas un label","ajouter un <label> associé via for/id ou envelopper l'input","conserver type=email pour la sémantique/validation","un nom accessible doit rester disponible même quand l'utilisateur saisit"],followUp:"À quoi sert l'attribut autocomplete dans ce contexte ?"},
  {id:"html-headings",path:"html",difficulty:2,type:"scenario",title:"Structure de titres",prompt:"Une page saute de <h1> à <h4> uniquement pour obtenir une taille plus petite. Que recommandes-tu ?",expected:["choisir les niveaux de titre selon la structure du document","ne pas utiliser le niveau de heading comme outil visuel","styliser la taille avec CSS","maintenir une hiérarchie compréhensible"],followUp:"Peut-on avoir plusieurs h1 dans un document HTML moderne ?"},
  {id:"html-img",path:"html",difficulty:2,type:"scenario",title:"Texte alternatif",prompt:"Comment déciderais-tu du contenu de alt pour une image ?",expected:["décrire la fonction/contenu utile de l'image dans son contexte","alt vide pour une image purement décorative","éviter 'image de...' inutilement","ne pas dupliquer un texte adjacent si cela n'apporte rien"],followUp:"Que fais-tu pour une image qui sert de bouton ou de lien ?"},

  {id:"css-box",path:"css",difficulty:1,type:"theory",title:"Box model",prompt:"Explique le box model et l'intérêt de box-sizing: border-box.",expected:["contenu, padding, bordure, marge","par défaut width/height ciblent la boîte de contenu","border-box inclut padding et bordure dans la dimension déclarée","cela rend les dimensions souvent plus prévisibles"],followUp:"La marge est-elle incluse dans border-box ?"},
  {id:"css-flex",path:"css",difficulty:1,type:"debug",title:"Centrage Flexbox",prompt:"Pourquoi justify-content ne centre-t-il pas verticalement ici ?",code:".box {\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n}",expected:["avec flex-direction: row, l'axe principal est horizontal","justify-content agit sur l'axe principal","align-items agit sur l'axe transversal donc vertical ici","ajouter align-items:center et disposer d'une hauteur si un centrage vertical visible est attendu"],followUp:"Que change flex-direction: column ?"},
  {id:"css-specificity",path:"css",difficulty:2,type:"theory",title:"Spécificité CSS",prompt:"Comment raisonnes-tu lorsqu'une règle CSS semble ignorée ?",expected:["vérifier que le sélecteur cible bien l'élément","inspecter cascade, ordre des règles et spécificité","vérifier héritage et propriétés surchargées","éviter de résoudre systématiquement avec !important"],followUp:"Pourquoi !important peut-il rendre une base CSS plus difficile à maintenir ?"},
  {id:"css-responsive",path:"css",difficulty:2,type:"scenario",title:"Responsive",prompt:"Une carte a width: 600px et déborde sur mobile. Donne plusieurs corrections possibles et explique ton choix.",expected:["préférer une largeur fluide ou max-width","exemple width:100%; max-width:600px","tenir compte du padding/border-box","media query uniquement si une adaptation spécifique est réellement nécessaire"],followUp:"Pourquoi une approche mobile-first peut-elle simplifier les media queries ?"},

  {id:"ts-union",path:"typescript",difficulty:1,type:"theory",title:"Union et narrowing",prompt:"À quoi sert un type union comme string | null et comment l'utiliser sans erreur ?",expected:["la valeur peut réellement être de plusieurs types","TypeScript oblige à traiter le cas null avant les opérations réservées à string","utiliser un test/narrowing explicite","cela rend un état absent visible dans le contrat de type"],followUp:"Quelle différence avec utiliser as string pour forcer le type ?"},
  {id:"ts-any",path:"typescript",difficulty:1,type:"scenario",title:"any vs unknown",prompt:"Pourquoi unknown est-il généralement plus sûr que any pour une donnée externe ?",expected:["any désactive largement les vérifications","unknown oblige à vérifier/narrower avant utilisation","les données externes ne sont pas garanties","on peut valider puis obtenir un type précis"],followUp:"Donne un exemple simple de narrowing d'un unknown."},
  {id:"ts-interface",path:"typescript",difficulty:2,type:"theory",title:"Type ou interface",prompt:"Comment répondrais-tu à 'type ou interface, lequel choisir ?' sans donner une règle absolue ?",expected:["les deux décrivent souvent des formes d'objets","interface est extensible et supporte declaration merging","type est pratique pour unions, intersections et alias variés","la cohérence du projet compte plus qu'un dogme"],followUp:"Qu'est-ce que le declaration merging ?"},
  {id:"ts-generic",path:"typescript",difficulty:2,type:"reading",title:"Générique simple",prompt:"Que garantit cette fonction générique ?",code:"function first<T>(items: T[]): T | undefined {\n  return items[0];\n}",expected:["T représente le type des éléments fourni à l'appel","le retour conserve ce même type","undefined est possible si le tableau est vide","le générique évite de perdre l'information de type avec any"],followUp:"Quel serait le type de retour pour first([1,2,3]) ?"},

  {id:"node-event-loop",path:"node",difficulty:1,type:"theory",title:"Node et I/O",prompt:"Pourquoi Node.js est-il souvent adapté aux applications avec beaucoup d'I/O réseau ?",expected:["modèle asynchrone/non bloquant pour de nombreuses opérations I/O","event loop orchestre les callbacks/promesses","évite de bloquer le thread principal pendant une attente réseau/fichier","ne signifie pas que tout calcul CPU devient automatiquement rapide"],followUp:"Quel type de charge pourrait poser problème sur le thread principal Node ?"},
  {id:"node-http",path:"node",difficulty:1,type:"scenario",title:"Codes HTTP",prompt:"Une API reçoit GET /users/42 mais aucun utilisateur 42 n'existe. Quel status renvoyer et pourquoi ?",expected:["404 Not Found est approprié","la requête est comprise mais la ressource demandée n'existe pas","ne pas renvoyer 200 avec une fausse réussite","réponse d'erreur structurée utile côté client"],followUp:"Quand utiliserais-tu 400, 401 et 403 ?"},
  {id:"node-async",path:"node",difficulty:2,type:"debug",title:"Gestion d'erreur async",prompt:"Quel problème vois-tu dans cette route ?",code:"app.get('/data', async (req, res) => {\n  const data = await loadData();\n  res.json(data);\n});",expected:["loadData peut rejeter/lever une erreur","il faut une stratégie de gestion d'erreurs async","try/catch ou middleware/wrapper selon le framework","éviter une requête pendante ou une fuite d'information interne"],followUp:"Que journaliserais-tu côté serveur sans exposer de détails sensibles au client ?"},
  {id:"node-modules",path:"node",difficulty:2,type:"theory",title:"Séparer les responsabilités",prompt:"Pourquoi séparer route, service et accès aux données dans une API plutôt que tout écrire dans le handler HTTP ?",expected:["responsabilités plus claires","code plus facile à tester","réutilisation de la logique métier indépendamment du transport HTTP","maintenance et évolution facilitées"],followUp:"Que mettrais-tu typiquement dans un service ?"},

  {id:"sql-null",path:"sql",difficulty:1,type:"debug",title:"Comparer NULL",prompt:"Pourquoi cette requête ne fait-elle pas ce qu'on attend ?",code:"SELECT * FROM users WHERE deleted_at = NULL;",expected:["NULL représente l'absence/valeur inconnue","une comparaison avec = NULL ne retourne pas vrai","utiliser IS NULL","utiliser IS NOT NULL pour l'inverse"],followUp:"Pourquoi SQL utilise-t-il une logique à trois valeurs avec NULL ?"},
  {id:"sql-join",path:"sql",difficulty:1,type:"theory",title:"INNER vs LEFT JOIN",prompt:"Explique la différence entre INNER JOIN et LEFT JOIN avec un exemple métier.",expected:["INNER JOIN ne garde que les lignes avec correspondance","LEFT JOIN garde toutes les lignes de la table de gauche","les colonnes de droite valent NULL sans correspondance","exemple clients avec ou sans commandes"],followUp:"Que peut-il se passer si la table de droite contient plusieurs correspondances ?"},
  {id:"sql-group",path:"sql",difficulty:2,type:"debug",title:"Agrégation",prompt:"Cette requête cherche le nombre de commandes par client. Que manque-t-il ?",code:"SELECT customer_id, COUNT(*)\nFROM orders;",expected:["il faut GROUP BY customer_id","COUNT(*) est calculé par groupe","customer_id non agrégé doit correspondre au regroupement dans ce besoin","requête : SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id"],followUp:"Quelle différence entre WHERE et HAVING dans une requête agrégée ?"},
  {id:"sql-index",path:"sql",difficulty:2,type:"scenario",title:"Index",prompt:"Une requête filtre très souvent sur email dans une grosse table users. Que proposerais-tu et quelles limites mentionnerais-tu ?",expected:["envisager un index sur email","l'index peut accélérer les recherches sélectives","il consomme de l'espace et ajoute un coût aux écritures","vérifier avec le plan d'exécution et le vrai profil des requêtes"],followUp:"Pourquoi indexer toutes les colonnes n'est-il pas une bonne stratégie ?"}
];

function techInterviewState(){
  if(!state.technicalInterview || typeof state.technicalInterview!=="object") state.technicalInterview={history:[],totalSessions:0,bestScore:0};
  state.technicalInterview.history=Array.isArray(state.technicalInterview.history)?state.technicalInterview.history:[];
  state.technicalInterview.totalSessions=Number(state.technicalInterview.totalSessions)||0;
  state.technicalInterview.bestScore=Number(state.technicalInterview.bestScore)||0;
  return state.technicalInterview;
}
function techInterviewPathLabel(id){return (TECH_INTERVIEW_CONFIG.paths.find(x=>x.id===id)||{label:id}).label;}
function techInterviewTypeLabel(type){return ({theory:"Question conceptuelle",reading:"Lecture de code",debug:"Débogage",scenario:"Mise en situation"})[type]||type;}
function techInterviewPool(path,level){return TECH_INTERVIEW_QUESTIONS.filter(q=>(path==="all"||q.path===path)&&(level==="mixed"||q.difficulty<=1));}
function techShuffle(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function techInterviewStats(){const st=techInterviewState(),h=st.history;const avg=h.length?Math.round(h.reduce((n,x)=>n+x.score,0)/h.length):0;return {sessions:st.totalSessions||h.length,best:st.bestScore||0,average:avg};}
function techFormat(seconds){seconds=Math.max(0,Math.ceil(seconds));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;}
function techGradeLabel(v){return v===2?"Solide":v===1?"Partiel":"À retravailler";}

function techInterviewSave(session){
  const st=techInterviewState();
  const max=session.questions.length*2, points=session.responses.reduce((n,x)=>n+Number(x.grade||0),0), score=max?Math.round(points/max*100):0;
  const dimensions={};
  session.responses.forEach((r,i)=>{const type=session.questions[i]?.type||"theory";if(!dimensions[type])dimensions[type]={points:0,max:0};dimensions[type].points+=Number(r.grade||0);dimensions[type].max+=2;});
  const result={at:new Date().toISOString(),path:session.path,level:session.level,timer:session.timer,score,points,max,dimensions,questions:session.questions.map((q,i)=>({id:q.id,path:q.path,type:q.type,grade:session.responses[i]?.grade||0})),expired:Boolean(session.expired)};
  st.history.unshift(result);st.history=st.history.slice(0,20);st.totalSessions++;st.bestScore=Math.max(st.bestScore,score);saveState(state);return result;
}

function renderTechnicalInterview(){
  techInterviewState(); let session=null,timerId=null;
  const host=h("div",{class:"tech-interview-host"});
  function stopTimer(){if(timerId){clearInterval(timerId);timerId=null;}}
  function setup(){
    stopTimer();const stats=techInterviewStats();
    const path=h("select",{class:"interview-select"},TECH_INTERVIEW_CONFIG.paths.map(p=>h("option",{value:p.id},p.label)));
    const level=h("select",{class:"interview-select"},TECH_INTERVIEW_CONFIG.levels.map(x=>h("option",{value:x.id},x.label)));
    const timer=h("select",{class:"interview-select"},h("option",{value:"0"},"Sans chrono"),h("option",{value:"900"},"15 minutes"),h("option",{value:"1500"},"25 minutes"));
    const msg=h("p",{class:"muted small","aria-live":"polite"});
    const start=h("button",{class:"btn primary big",type:"button",onclick:()=>{
      const pool=techInterviewPool(path.value,level.value);if(pool.length<3){msg.textContent="Pas assez de questions pour cette sélection.";return;}
      const chosen=techShuffle(pool).slice(0,Math.min(TECH_INTERVIEW_CONFIG.questionsPerSession,pool.length));
      session={path:path.value,level:level.value,timer:Number(timer.value),questions:chosen,index:0,responses:[],startedAt:Date.now(),deadline:Number(timer.value)?Date.now()+Number(timer.value)*1000:null,expired:false,saved:false};drawQuestion();if(session.timer)startTimer();
    }},"Commencer l’entretien");
    host.replaceChildren(h("div",{class:"page tech-interview-page"},
      h("p",{class:"crumbs"},link("/","Accueil")," / Entretien technique"),
      h("section",{class:"interview-hero"},h("div",{},h("span",{class:"eyebrow"},"MODE ENTRETIEN TECHNIQUE"),h("h1",{},"Réponds comme face à un recruteur"),para("Questions conceptuelles, lecture de code, débogage et mises en situation. Tu réponds librement, puis tu compares ta réponse aux critères attendus.","lead")),h("div",{class:"interview-stats"},metric(stats.sessions,"sessions"),metric(stats.average+" %","moyenne"),metric(stats.best+" %","meilleur score"))),
      h("section",{class:"block"},h("h2",{},"Préparer la simulation"),h("div",{class:"interview-form"},h("label",{},h("span",{},"Parcours"),path),h("label",{},h("span",{},"Niveau"),level),h("label",{},h("span",{},"Chrono"),timer)),h("div",{class:"toolbar"},start),msg),
      h("section",{class:"interview-rules"},h("article",{},h("strong",{},"1. Réponds d’abord"),para("La correction reste masquée pour reproduire le raisonnement d’un entretien.","muted small")),h("article",{},h("strong",{},"2. Compare aux attentes"),para("Le site montre les points qu’un recruteur cherchait à entendre.","muted small")),h("article",{},h("strong",{},"3. Auto-évalue honnêtement"),para("Solide, Partiel ou À retravailler. Aucun impact sur tes cours ou ton XP.","muted small"))),
      renderTechnicalInterviewHistory()));
  }
  function startTimer(){stopTimer();timerId=setInterval(()=>{if(!session)return stopTimer();const left=Math.max(0,(session.deadline-Date.now())/1000);const el=document.querySelector("[data-interview-clock]");if(el)el.textContent=techFormat(left);if(left<=0){session.expired=true;finish();}},250);}
  function drawQuestion(){
    const q=session.questions[session.index];if(!q)return finish();
    const answer=h("textarea",{class:"interview-answer",rows:"8",placeholder:"Formule ta réponse comme si tu parlais au recruteur…"});
    const feedback=h("div",{class:"interview-feedback","aria-live":"polite"});
    const reveal=h("button",{class:"btn primary",type:"button",onclick:()=>{
      if(answer.value.trim().length<10){feedback.replaceChildren(h("p",{class:"error"},"Développe un peu ta réponse avant d’afficher les attentes."));return;}
      answer.disabled=true;reveal.disabled=true;
      feedback.replaceChildren(h("section",{class:"interview-rubric"},h("span",{class:"eyebrow"},"CE QU’UN RECRUTEUR ATTENDAIT"),h("ul",{},q.expected.map(x=>h("li",{},x))),h("div",{class:"callout"},h("strong",{},"Relance possible"),para(q.followUp,"muted")),h("h3",{},"Comment était ta réponse ?"),h("div",{class:"interview-grade-grid"},
        gradeButton(2,"Solide","J’ai couvert l’essentiel clairement."),gradeButton(1,"Partiel","J’avais l’idée mais il manquait des éléments."),gradeButton(0,"À retravailler","Je n’aurais pas su répondre correctement."))));
    }},"Afficher les attentes");
    function gradeButton(value,label,desc){return h("button",{class:"interview-grade",type:"button",onclick:()=>{session.responses[session.index]={answer:answer.value,grade:value};session.index++;drawQuestion();}},h("strong",{},label),h("span",{},desc));}
    const remaining=session.timer?Math.max(0,(session.deadline-Date.now())/1000):null;
    host.replaceChildren(h("div",{class:"page tech-interview-page"},h("p",{class:"crumbs"},link("/entretien","Entretien")," / Question "+(session.index+1)),
      h("section",{class:"interview-session-head"},h("div",{},h("span",{class:"eyebrow"},techInterviewPathLabel(q.path)+" · "+techInterviewTypeLabel(q.type)),h("h1",{},q.title),para("Question "+(session.index+1)+" / "+session.questions.length,"muted")),session.timer?h("div",{class:"interview-clock","data-interview-clock":""},techFormat(remaining)):h("div",{class:"interview-no-clock"},"Sans chrono")),
      h("section",{class:"block interview-question"},h("h2",{},q.prompt),q.code?h("pre",{class:"interview-code"},h("code",{},q.code)):null,h("label",{class:"interview-answer-label"},h("span",{},"Ta réponse"),answer),h("div",{class:"toolbar"},reveal,h("button",{class:"btn",type:"button",onclick:()=>finish(true)},"Arrêter")),feedback),
      h("section",{class:"callout"},h("strong",{},"Conseil entretien"),para("Explique ton raisonnement à voix haute : hypothèses, compromis et vérifications comptent souvent autant que la réponse finale.","muted"))));
  }
  function finish(abandoned=false){
    stopTimer();
    if(!session||session.saved){ setup(); return; }
    if(abandoned&&session.responses.length===0){ session=null; setup(); return; }
    while(session.responses.length<session.questions.length) session.responses.push({answer:"",grade:0});
    const result=techInterviewSave(session); session.saved=true;
    const dimRows=Object.entries(result.dimensions)
      .map(([type,row])=>({type,score:Math.round(row.points/row.max*100)}))
      .sort((a,b)=>a.score-b.score);
    const weakest=dimRows[0];
    const detailRows=session.questions.map((q,i)=>h("li",{class:"row"},
      h("div",{class:"row-main"},h("strong",{},q.title),para(techInterviewPathLabel(q.path)+" · "+techInterviewTypeLabel(q.type),"muted small")),
      h("span",{class:"status "+(session.responses[i].grade===2?"ok":session.responses[i].grade===1?"review":"todo")},techGradeLabel(session.responses[i].grade))
    ));
    const dimensionCards=dimRows.map(d=>h("article",{},
      h("div",{class:"interview-dim-head"},h("strong",{},techInterviewTypeLabel(d.type)),h("span",{},d.score+" %")),
      bar(d.score)
    ));
    const page=h("div",{class:"page tech-interview-page"},
      h("p",{class:"crumbs"},link("/entretien","Entretien")," / Bilan"),
      h("section",{class:"interview-result-hero"},
        h("div",{},h("span",{class:"eyebrow"},session.expired?"TEMPS ÉCOULÉ · BILAN":"ENTRETIEN TERMINÉ"),h("h1",{},result.score>=80?"Réponses globalement solides":result.score>=50?"Base intéressante, encore quelques réflexes à renforcer":"Bonne matière pour progresser"),para("Ce score reflète ton auto-évaluation face aux critères attendus, pas une certification de compétence.","lead")),
        h("div",{class:"interview-score-ring"},h("strong",{},result.score+" %"),h("span",{},result.points+" / "+result.max+" points"))
      ),
      h("section",{class:"block"},h("h2",{},"Lecture du bilan"),
        dimensionCards.length?h("div",{class:"interview-dimensions"},dimensionCards):null,
        weakest?h("div",{class:"callout"},h("strong",{},"Priorité suggérée"),para("Travaille surtout : "+techInterviewTypeLabel(weakest.type)+". Refaire une session ciblée permettra de vérifier si ton raisonnement devient plus fluide.","muted")):null
      ),
      h("section",{class:"block"},h("h2",{},"Détail des questions"),h("ul",{class:"rows"},detailRows)),
      h("div",{class:"toolbar"},
        h("button",{class:"btn primary",type:"button",onclick:()=>{session=null;setup();}},"Nouvel entretien"),
        link("/dashboard","Retour au dashboard","btn")
      )
    );
    host.replaceChildren(page);
  }
  setup();return host;
}

function renderTechnicalInterviewHistory(){
  const rows=techInterviewState().history.slice(0,6);
  return h("section",{class:"block interview-history"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"HISTORIQUE"),h("h2",{},"Tes dernières simulations"))),rows.length?h("ul",{class:"rows compact"},rows.map(r=>h("li",{class:"row"},h("div",{class:"row-main"},h("strong",{},techInterviewPathLabel(r.path)+" · "+(r.level==="junior"?"Junior":"Mixte")),para(new Date(r.at).toLocaleDateString("fr-FR")+(r.timer?" · "+Math.round(r.timer/60)+" min":" · sans chrono"),"muted small")),h("span",{class:"status "+(r.score>=80?"ok":r.score>=50?"review":"todo")},r.score+" %")))):empty("Aucune simulation d'entretien pour le moment."));
}
