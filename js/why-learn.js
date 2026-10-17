// why-learn.js — explique le rôle concret des compétences dans le parcours et les projets.
// Vue strictement en lecture seule : aucune progression n'est créée ou modifiée ici.

const WHY_LEARN_SKILLS = {
  'html-structure':{real:'Structurer une page pour que navigateur, moteurs de recherche et technologies d’assistance comprennent son organisation.',reuse:['CSS cible cette structure','React réexprime cette structure en JSX'],jobs:'Base de toute intégration front-end.',project:'Construire le squelette d’une interface avant le style et la logique.'},
  'html-content':{real:'Présenter textes, liens, listes et médias de façon claire et robuste.',reuse:['CSS améliore la présentation','React rend ce contenu dynamique'],jobs:'Indispensable pour toute page web ou CMS.',project:'Afficher les données que ton application manipule.'},
  'html-forms':{real:'Collecter des données utilisateur de manière exploitable et accessible.',reuse:['JavaScript valide et réagit aux saisies','React contrôle les champs','Node reçoit les données'],jobs:'Connexion, recherche, paiement, création de compte, back-office.',project:'Créer un formulaire de tâche, de recherche ou de connexion.'},
  'html-semantics':{real:'Donner du sens au contenu au lieu d’empiler des div.',reuse:['CSS profite d’une structure lisible','JS/React manipulent des zones plus claires'],jobs:'Qualité front-end, SEO et accessibilité.',project:'Construire une interface maintenable avant même d’écrire du JavaScript.'},
  'html-accessibility':{real:'Rendre l’interface utilisable au clavier, avec lecteur d’écran et dans davantage de situations.',reuse:['CSS gère les focus','React doit préserver la sémantique'],jobs:'Attendu dans les produits sérieux et services publics.',project:'Éviter qu’une interface correcte visuellement soit inutilisable pour certains utilisateurs.'},
  'html-advanced':{real:'Rendre une page plus robuste, descriptive et prête pour la production.',reuse:['CSS responsive','Performance front','SEO'],jobs:'Passage d’un exercice scolaire à une page exploitable.',project:'Préparer une vraie livraison web.'},
  'css-basics':{real:'Contrôler précisément comment les règles de style s’appliquent.',reuse:['React réutilise les mêmes règles CSS','Design systems'],jobs:'Déboguer les conflits de style rapidement.',project:'Éviter les styles qui se contredisent dans une interface qui grandit.'},
  'css-box':{real:'Comprendre l’espace occupé par chaque élément.',reuse:['Flexbox et Grid reposent dessus','Responsive'],jobs:'Corriger les débordements et alignements.',project:'Construire des cartes et panneaux aux dimensions prévisibles.'},
  'css-layout':{real:'Aligner et répartir des éléments sur un axe avec Flexbox.',reuse:['Composants React','Interfaces responsive'],jobs:'Navbar, cartes, formulaires, toolbars.',project:'Mettre en page une application sans bricolage de marges.'},
  'css-grid':{real:'Créer des mises en page bidimensionnelles complexes.',reuse:['Dashboards','Responsive avancé'],jobs:'Interfaces de données et landing pages.',project:'Organiser plusieurs zones d’un dashboard.'},
  'css-responsive':{real:'Adapter l’interface aux téléphones, tablettes et grands écrans.',reuse:['React ne remplace pas le responsive','UI produit'],jobs:'Compétence attendue sur tout projet front moderne.',project:'Faire fonctionner le même produit sur plusieurs tailles d’écran.'},
  'css-polish':{real:'Ajouter feedback visuel, transitions et cohérence graphique.',reuse:['États React','Design systems'],jobs:'Finition produit et expérience utilisateur.',project:'Rendre les interactions compréhensibles et agréables.'},
  'js-basics':{real:'Stocker et transformer les informations utilisées par ton programme.',reuse:['TypeScript part de ces mêmes types','Node utilise le même langage'],jobs:'Fondation de tout développement JavaScript.',project:'Manipuler tâches, utilisateurs, scores ou données API.'},
  'js-logic':{real:'Faire prendre des décisions à ton programme et répéter des traitements.',reuse:['TypeScript','React','Node'],jobs:'Présent dans presque toute logique métier.',project:'Filtrer, valider, calculer ou traiter une liste de données.'},
  'js-functions':{real:'Découper un problème en blocs réutilisables et testables.',reuse:['Composants React','Handlers Node','Fonctions TypeScript'],jobs:'Compétence centrale de maintenance et de test.',project:'Séparer ajout, suppression, calcul et rendu dans une application.'},
  'js-data':{real:'Manipuler des collections et objets comme le font les applications réelles.',reuse:['React affiche des listes','SQL manipule des collections côté base','Node transforme des réponses'],jobs:'Omniprésent en front, backend et data légère.',project:'Trier, filtrer et agréger les données d’un dashboard.'},
  'js-dom':{real:'Relier la logique JavaScript aux éléments visibles dans le navigateur.',reuse:['React automatise une partie de ce travail'],jobs:'Comprendre ce que les frameworks abstraient.',project:'Créer une interface interactive sans framework.'},
  'js-async':{real:'Gérer les opérations qui prennent du temps sans bloquer l’application.',reuse:['React fetch des données','Node gère I/O et API'],jobs:'APIs, fichiers, réseau, base de données.',project:'Charger des données depuis un serveur et gérer succès/erreur.'},
  'react-components':{real:'Découper une interface en unités autonomes et réutilisables.',reuse:['TypeScript type les props','CSS habille les composants'],jobs:'Base du développement React moderne.',project:'Transformer une page en TaskForm, TaskList, Stats, etc.'},
  'react-props':{real:'Faire circuler des données explicitement entre composants.',reuse:['TypeScript sécurise ces contrats'],jobs:'Architecture front claire et maintenable.',project:'Envoyer une tâche ou un callback au bon composant.'},
  'react-state':{real:'Faire évoluer l’interface en fonction des actions utilisateur.',reuse:['JavaScript events','APIs Node'],jobs:'Formulaires, filtres, panier, dashboards.',project:'Ajouter une tâche et voir l’interface se mettre à jour.'},
  'react-effects':{real:'Synchroniser un composant avec le monde extérieur.',reuse:['Fetch API','Backend Node'],jobs:'Chargement de données, timers, abonnements.',project:'Charger les tâches depuis une API.'},
  'react-data':{real:'Afficher et mettre à jour des collections de données efficacement.',reuse:['JavaScript map/filter','TypeScript types'],jobs:'Listes, tableaux, dashboards.',project:'Afficher une liste de tâches ou de résultats API.'},
  'react-architecture':{real:'Organiser une application React qui grandit sans devenir confuse.',reuse:['TypeScript','Routing','Tests'],jobs:'Nécessaire sur les projets d’équipe.',project:'Séparer données, contexte, hooks et vues.'},
  'ts-types':{real:'Détecter des incohérences avant l’exécution du programme.',reuse:['React props','Node APIs'],jobs:'Réduit les bugs dans les gros projets JS.',project:'Garantir qu’un id reste un id et qu’un statut reste valide.'},
  'ts-objects':{real:'Décrire clairement la forme des objets échangés.',reuse:['API Node','React props','Données SQL'],jobs:'Contrats de données entre modules.',project:'Définir précisément un objet Task ou User.'},
  'ts-unions':{real:'Limiter une valeur à des cas connus et traiter chaque cas correctement.',reuse:['États UI','Réponses API'],jobs:'Modéliser des statuts métier fiables.',project:'Limiter une tâche à todo | doing | done.'},
  'ts-generics':{real:'Créer du code réutilisable sans perdre l’information de type.',reuse:['Bibliothèques','Hooks','Services'],jobs:'Codebase TypeScript avancée.',project:'Créer des helpers utilisables sur plusieurs types de données.'},
  'ts-advanced':{real:'Exprimer des relations complexes entre types sans dupliquer les modèles.',reuse:['SDKs','APIs typées'],jobs:'Bibliothèques et grandes applications.',project:'Faire évoluer les modèles sans multiplier les types manuels.'},
  'ts-project':{real:'Appliquer le typage dans une vraie architecture multi-fichiers.',reuse:['React','Node'],jobs:'Passage de l’exercice à un projet professionnel.',project:'Configurer et maintenir une base de code typée.'},
  'node-runtime':{real:'Exécuter JavaScript hors du navigateur et automatiser des tâches.',reuse:['npm','CLI','Backend'],jobs:'Serveurs, scripts et tooling.',project:'Lancer un serveur ou un script de traitement.'},
  'node-modules':{real:'Découper un backend en fichiers et responsabilités claires.',reuse:['TypeScript','Architecture backend'],jobs:'Maintenabilité côté serveur.',project:'Séparer routes, services et utilitaires.'},
  'node-async':{real:'Gérer fichiers, réseau et base de données sans bloquer le serveur.',reuse:['Promises JS','SQL'],jobs:'Essentiel en backend Node.',project:'Attendre une requête SQL ou une API externe.'},
  'node-http':{real:'Recevoir des requêtes et renvoyer des réponses via une API.',reuse:['React consomme cette API','SQL fournit les données'],jobs:'Fondation d’un backend web.',project:'Créer GET /tasks et POST /tasks.'},
  'node-architecture':{real:'Séparer HTTP, validation, métier et accès aux données.',reuse:['TypeScript','SQL'],jobs:'Backend testable et évolutif.',project:'Éviter de mettre toute la logique dans une seule route.'},
  'node-production':{real:'Rendre un service fiable, observable et plus sûr.',reuse:['Tests','Sécurité','Déploiement'],jobs:'Ce qui distingue une démo d’un service exploitable.',project:'Préparer un backend avant mise en production.'},
  'sql-read':{real:'Extraire uniquement les données utiles depuis une base.',reuse:['Node expose ces résultats via API'],jobs:'Base du travail avec données relationnelles.',project:'Afficher une liste de tâches ou d’utilisateurs.'},
  'sql-filter':{real:'Trouver précisément les lignes pertinentes et les trier.',reuse:['Filtres d’API','Dashboards'],jobs:'Recherche, reporting, back-office.',project:'Récupérer uniquement les tâches ouvertes d’un utilisateur.'},
  'sql-aggregate':{real:'Calculer directement des métriques dans la base.',reuse:['Dashboards JS/React','API Node'],jobs:'Reporting et analytique.',project:'Compter les tâches par statut ou totaliser des ventes.'},
  'sql-joins':{real:'Relier des données réparties dans plusieurs tables.',reuse:['Node transforme le résultat'],jobs:'Indispensable avec une base relationnelle réelle.',project:'Associer tâches et utilisateurs.'},
  'sql-model':{real:'Créer et faire évoluer un schéma qui protège les données.',reuse:['API Node doit respecter ces contraintes'],jobs:'CRUD et conception de base.',project:'Définir tables, clés et règles métier.'},
  'sql-pro':{real:'Optimiser, sécuriser et analyser des requêtes complexes.',reuse:['Production Node','Data'],jobs:'Performance et qualité en base.',project:'Éviter les requêtes lentes ou vulnérables.'}
};

function whyPathStarted(pathId){const a=typeof adaptivePathAnalysis==='function'?adaptivePathAnalysis(pathId):null;return Boolean(a&&a.started);}
function whyProjectMatches(pathId){
  if(typeof THREAD_PROJECTS==='undefined') return [];
  return THREAD_PROJECTS.map(project=>{
    const stages=project.stages.filter(s=>s.path===pathId);
    return stages.length?{project,stages}:null;
  }).filter(Boolean);
}
function whyRelatedSkills(pathId,skillId){
  if(typeof CROSS_LANGUAGE_LINKS==='undefined') return [];
  return CROSS_LANGUAGE_LINKS.filter(link=>
    (link.from===pathId&&link.fromSkills.includes(skillId)) || (link.to===pathId&&link.toSkills.includes(skillId))
  ).map(link=>({link,other:link.from===pathId?link.to:link.from}));
}
function whySkillPriority(pathId,skill){
  const info=WHY_LEARN_SKILLS[skill.id]||{};
  let value=0;
  if(skill.status==='reinforce') value+=60;
  if(skill.status==='learning') value+=35;
  if(skill.due) value+=Math.min(25,skill.due*7);
  value+=Math.max(0,100-skill.score)*.2;
  const related=whyRelatedSkills(pathId,skill.id).filter(x=>whyPathStarted(x.other)).length;
  value+=related*8;
  return {pathId,skill,info,priority:value,related:whyRelatedSkills(pathId,skill.id),projects:whyProjectMatches(pathId)};
}
function whyLearnSummary(){
  const paths=skillMapAll();
  const rows=paths.flatMap(p=>p.skills.map(s=>whySkillPriority(p.path.id,s)));
  const started=rows.filter(r=>whyPathStarted(r.pathId));
  const useful=started.slice().sort((a,b)=>b.priority-a.priority);
  return {paths,rows,started,useful,primary:useful[0]||null};
}
function whyPathLabel(id){return ADAPTIVE_PATHS[id]?.title||id;}
function whySkillCard(row){
  const {pathId,skill,info,related,projects}=row;
  const action=skillMapAction(pathId,skill);
  const relatedStarted=related.filter(x=>whyPathStarted(x.other));
  return h('article',{class:'block why-skill-card path-card--'+pathId},
    h('div',{class:'why-skill-head'},
      h('div',{},h('span',{class:'eyebrow'},whyPathLabel(pathId)),h('h2',{},skill.title),para(skill.label+' · '+skill.score+' %','muted small')),
      h('span',{class:'status '+skillMapStatusClass(skill.status)},skill.label)
    ),
    h('div',{class:'why-grid'},
      h('section',{},h('h3',{},'À quoi ça sert ?'),para(info.real||'Cette compétence consolide une partie importante du parcours.','muted')),
      h('section',{},h('h3',{},'Où tu la réutiliseras ?'),h('ul',{},...(info.reuse||[]).map(x=>h('li',{},x)))),
      h('section',{},h('h3',{},'Dans un vrai projet'),para(info.project||'Elle intervient dans des fonctionnalités réelles du parcours.','muted')),
      h('section',{},h('h3',{},'Pourquoi maintenant ?'),para(skill.status==='reinforce'?'Parce que tes résultats montrent que cette notion mérite d’être consolidée avant de construire davantage dessus.':skill.due?'Parce qu’un rappel est arrivé à échéance : le revoir maintenant favorise la rétention.':skill.status==='learning'?'Parce que tu l’as déjà commencée : la consolider maintenant évite une compréhension fragmentée.':skill.status==='mastered'?'Parce qu’elle sert désormais de fondation pour des notions plus avancées.':'Parce qu’elle constitue une prochaine brique logique du parcours.','muted'))
    ),
    h('div',{class:'why-meta-row'},
      h('span',{class:'chip'},'Métier · '+(info.jobs||'Développement web')),
      ...relatedStarted.slice(0,3).map(x=>h('span',{class:'chip ok'},'Pont vers '+whyPathLabel(x.other))),
      ...projects.slice(0,2).map(x=>h('span',{class:'chip'},'Projet · '+x.project.title))
    ),
    h('div',{class:'toolbar'},link(action.href,(action.label||'Voir la notion')+' →','btn primary'),projects[0]?link('/fil-rouge/'+projects[0].project.id,'Voir le projet associé','btn'):null)
  );
}
function renderWhyLearn(){
  const summary=whyLearnSummary();
  const visible=summary.useful.length?summary.useful.slice(0,12):summary.rows.slice(0,10);
  return h('div',{class:'page why-learn-page'},
    h('p',{class:'crumbs'},link('/dashboard','Mes parcours'),' / Pourquoi j’apprends ça ?'),
    h('section',{class:'why-hero'},
      h('div',{},h('span',{class:'eyebrow'},'POURQUOI J’APPRENDS ÇA ?'),h('h1',{},'Relie chaque notion à un usage concret'),para('Cette vue explique le rôle réel de chaque compétence, les autres technologies qui s’appuient dessus et les projets dans lesquels elle devient utile.','lead'),h('div',{class:'toolbar'},summary.primary?link(skillMapAction(summary.primary.pathId,summary.primary.skill).href,'Reprendre la notion prioritaire →','btn primary big'):link('/','Choisir un parcours →','btn primary big'),link('/fil-rouge','Voir les projets fil rouge','btn big'))),
      h('div',{class:'why-summary'},metric(new Set(summary.started.map(x=>x.pathId)).size,'parcours actifs'),metric(summary.started.filter(x=>x.skill.status==='reinforce').length,'notions à renforcer'),metric(summary.started.reduce((n,x)=>n+x.related.filter(r=>whyPathStarted(r.other)).length,0),'ponts utiles'))
    ),
    summary.primary?h('section',{class:'block why-primary'},h('span',{class:'eyebrow'},'POURQUOI MAINTENANT ?'),h('h2',{},summary.primary.skill.title+' · '+whyPathLabel(summary.primary.pathId)),para(summary.primary.info.real||'Cette notion joue un rôle central dans la suite du parcours.','muted'),para(summary.primary.skill.status==='reinforce'?'Tes résultats indiquent qu’elle doit être renforcée avant d’empiler de nouvelles notions dessus.':summary.primary.skill.due?'Un rappel est dû : c’est un bon moment pour consolider cette connaissance.':'Elle correspond à l’un des meilleurs points de continuité avec ta progression actuelle.','muted')):null,
    h('section',{class:'why-list'},...visible.map(whySkillCard)),
    h('section',{class:'callout'},h('strong',{},'Une vue explicative, pas une nouvelle progression'),para('Cette page ne crée aucun score, ne valide aucun exercice et ne modifie ni XP ni badges. Elle lit les compétences, projets et connexions déjà présents pour donner du sens à ce que tu apprends.','muted'))
  );
}
