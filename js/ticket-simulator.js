// ticket-simulator.js — entraînement à la lecture et à la résolution de tickets produit.
// Les tickets restent séparés de la progression pédagogique : aucun XP, badge ou exercice n'est validé ici.

const TICKET_SIMULATOR_TICKETS = [
  {id:'html-a11y-form',pathId:'html',level:1,type:'Bug',priority:'Haute',skillId:'html-forms',title:'Le formulaire de contact est difficile à utiliser au clavier',context:'Le support signale que certains utilisateurs ne savent pas à quel champ correspond chaque saisie et que le focus est peu clair.',acceptance:['Chaque champ possède un label explicite','L’ordre de tabulation reste logique','Les erreurs sont compréhensibles sans dépendre uniquement de la couleur'],concepts:['label','focus','accessibilité'],hint:'Commence par vérifier la relation label/input et la visibilité du focus.',deliverable:'Décris les changements HTML nécessaires et les contrôles que tu effectuerais.'},
  {id:'html-semantic-page',pathId:'html',level:2,type:'Refactor',priority:'Moyenne',skillId:'html-semantics',title:'Remplacer une page composée uniquement de div',context:'Une page marketing fonctionne visuellement mais sa structure est difficile à comprendre pour l’équipe et les technologies d’assistance.',acceptance:['Les grandes zones utilisent des éléments sémantiques adaptés','La hiérarchie des titres reste cohérente','Aucun changement visuel n’est imposé par le ticket'],concepts:['main','section','article'],hint:'Cherche les zones qui ont un rôle : navigation, contenu principal, section, pied de page.',deliverable:'Propose une structure sémantique et justifie les principaux éléments choisis.'},
  {id:'css-card-overflow',pathId:'css',level:1,type:'Bug',priority:'Haute',skillId:'css-box',title:'Les cartes débordent sur mobile',context:'À 320 px de largeur, les cartes du catalogue provoquent un scroll horizontal. Le problème apparaît après l’ajout d’un padding et d’une bordure.',acceptance:['Aucun débordement horizontal à 320 px','Le padding et la bordure sont conservés','La correction reste générique pour toutes les cartes'],concepts:['box-sizing','width','padding'],hint:'Compare la largeur déclarée à la largeur réellement occupée par le box model.',deliverable:'Explique la cause probable et écris la règle CSS corrective.'},
  {id:'css-dashboard-layout',pathId:'css',level:3,type:'Feature',priority:'Moyenne',skillId:'css-grid',title:'Créer une grille responsive pour le dashboard',context:'Le dashboard doit afficher 3 colonnes sur grand écran, 2 sur tablette et 1 sur mobile sans dupliquer le markup.',acceptance:['3 colonnes sur grand écran','2 colonnes sur tablette','1 colonne sur mobile','Les espacements restent constants'],concepts:['grid','media','gap'],hint:'Une grille CSS avec des media queries simples suffit ; inutile de modifier le HTML.',deliverable:'Propose le CSS de mise en page et explique les points de rupture choisis.'},
  {id:'js-filter-bug',pathId:'javascript',level:2,type:'Bug',priority:'Haute',skillId:'js-data',title:'Le filtre “terminées” retourne les mauvaises tâches',context:'Une liste de tâches contient des objets { title, done }. Le bouton “Terminées” affiche parfois aussi les tâches ouvertes.',acceptance:['Seules les tâches done === true sont retournées','Le tableau source n’est pas modifié','Le résultat reste un tableau'],concepts:['filter','boolean','array'],hint:'Tu cherches une méthode de tableau qui retourne un nouveau tableau en fonction d’un prédicat.',deliverable:'Écris ou décris la fonction de filtrage puis indique un cas de test.'},
  {id:'js-fetch-errors',pathId:'javascript',level:4,type:'Feature',priority:'Haute',skillId:'js-async',title:'Gérer les erreurs lors du chargement des utilisateurs',context:'L’interface appelle /api/users avec fetch mais reste bloquée sur “Chargement…” si le serveur répond 500.',acceptance:['Le chargement se termine aussi en cas d’erreur','Une erreur HTTP est distinguée d’un succès','Un message utilisateur est prévu'],concepts:['fetch','response.ok','try'],hint:'fetch ne rejette pas automatiquement la Promise pour une réponse HTTP 500.',deliverable:'Propose le flux async/await complet : succès, erreur HTTP et erreur réseau.'},
  {id:'react-state-mutation',pathId:'react',level:2,type:'Bug',priority:'Haute',skillId:'react-state',title:'La liste ne se met pas toujours à jour après modification',context:'Le composant modifie directement un tableau stocké dans le state puis appelle le setter avec la même référence.',acceptance:['Le state n’est jamais muté directement','Une nouvelle référence est fournie au setter','Le rendu reflète immédiatement la modification'],concepts:['state','spread','immutabilité'],hint:'React détecte mieux le changement lorsque tu construis un nouveau tableau au lieu de modifier l’ancien.',deliverable:'Montre la correction et explique pourquoi la mutation directe pose problème.'},
  {id:'react-fetch-effect',pathId:'react',level:3,type:'Feature',priority:'Moyenne',skillId:'react-effects',title:'Charger les tickets au montage du composant',context:'La page Issues doit récupérer une liste depuis une API une seule fois au chargement et afficher les états loading/error/success.',acceptance:['La requête part au montage','Les trois états UI sont distingués','L’effet ne se relance pas en boucle'],concepts:['useEffect','loading','dependency'],hint:'Vérifie le tableau de dépendances de useEffect et sépare les états de données, chargement et erreur.',deliverable:'Décris le composant ou écris son squelette avec useEffect.'},
  {id:'ts-status-union',pathId:'typescript',level:2,type:'Refactor',priority:'Moyenne',skillId:'ts-unions',title:'Empêcher les statuts de ticket invalides',context:'Le champ status est actuellement typé string, ce qui permet d’enregistrer “donee” ou n’importe quelle autre valeur.',acceptance:['Seuls les statuts autorisés compilent','Le type est réutilisable','Le code existant peut typer Ticket.status avec ce nouveau type'],concepts:['union','literal','type'],hint:'Un union type de littéraux chaîne modélise bien un ensemble fermé de valeurs.',deliverable:'Définis le type et montre son utilisation dans une interface Ticket.'},
  {id:'ts-api-model',pathId:'typescript',level:3,type:'Feature',priority:'Haute',skillId:'ts-objects',title:'Typer la réponse de l’API /tickets',context:'L’équipe veut arrêter de manipuler des any pour les tickets reçus du backend.',acceptance:['La forme d’un ticket est explicite','Les champs obligatoires et optionnels sont distingués','Le tableau retourné possède un type précis'],concepts:['interface','optional','array'],hint:'Décris d’abord un Ticket, puis utilise Ticket[] pour la collection.',deliverable:'Propose les types/interfaces nécessaires et un exemple de fonction typée.'},
  {id:'node-route-validation',pathId:'node',level:3,type:'Bug',priority:'Haute',skillId:'node-http',title:'POST /tickets accepte des payloads incomplets',context:'Le serveur crée un ticket même si title est absent. Le front reçoit ensuite des objets impossibles à afficher.',acceptance:['Les données sont validées avant création','Une requête invalide reçoit un code 4xx','Une requête valide continue de fonctionner'],concepts:['validation','400','request'],hint:'La validation doit se faire avant d’appeler la logique de création.',deliverable:'Décris le contrôle de la route et la réponse HTTP en cas d’erreur.'},
  {id:'node-service-split',pathId:'node',level:4,type:'Refactor',priority:'Moyenne',skillId:'node-architecture',title:'Sortir la logique métier du contrôleur HTTP',context:'Le contrôleur GET /tickets filtre, trie et enrichit les tickets directement. Les tests deviennent difficiles à écrire.',acceptance:['Le contrôleur gère surtout HTTP entrée/sortie','La logique métier devient testable sans serveur','Les responsabilités sont nommées clairement'],concepts:['controller','service','separation'],hint:'Imagine une fonction de service que le contrôleur pourrait appeler avec de simples paramètres.',deliverable:'Propose une séparation controller/service et le rôle de chaque couche.'},
  {id:'sql-open-tickets',pathId:'sql',level:1,type:'Feature',priority:'Moyenne',skillId:'sql-filter',title:'Lister les tickets ouverts les plus récents',context:'Le support veut afficher les 20 tickets dont status = open, du plus récent au plus ancien.',acceptance:['Seuls les tickets ouverts sont retournés','Le tri est décroissant sur created_at','Le résultat est limité à 20 lignes'],concepts:['where','order by','limit'],hint:'Le ticket demande trois clauses très classiques après SELECT.',deliverable:'Écris la requête SQL correspondante.'},
  {id:'sql-ticket-count',pathId:'sql',level:3,type:'Feature',priority:'Basse',skillId:'sql-aggregate',title:'Compter les tickets par statut',context:'Le dashboard doit afficher combien de tickets sont open, in_progress et done.',acceptance:['Une ligne est produite par statut','Chaque ligne contient le nombre de tickets','Le calcul est réalisé côté SQL'],concepts:['count','group by','status'],hint:'Tu dois regrouper les lignes qui partagent le même statut avant de compter.',deliverable:'Écris la requête d’agrégation et explique le résultat attendu.'}
];

function ticketSimulatorState(){
  const st=loadState();
  st.ticketSimulator=st.ticketSimulator&&typeof st.ticketSimulator==='object'?st.ticketSimulator:{tickets:{}};
  st.ticketSimulator.tickets=st.ticketSimulator.tickets||{};
  return {st,data:st.ticketSimulator};
}
function ticketSimulatorEntry(data,id){return data.tickets[id]||{status:'backlog',notes:'',checks:[],hintShown:false,evaluations:[]};}
function ticketSimulatorSave(id,patch){const {st,data}=ticketSimulatorState();data.tickets[id]={...ticketSimulatorEntry(data,id),...patch};st.ticketSimulator=data;saveState(st);}
function ticketPathLabel(pathId){const p=ADAPTIVE_PATHS[pathId];return p?p.title:pathId;}
function ticketSkill(ticket){return skillMapPath(ticket.pathId).skills.find(s=>s.id===ticket.skillId)||null;}
function ticketStatusLabel(status){return ({backlog:'À faire',doing:'En cours',review:'À relire',done:'Terminé'})[status]||'À faire';}
function ticketStatusOrder(status){return ({doing:0,review:1,backlog:2,done:3})[status]??4;}
function ticketRecommended(ticket){const s=ticketSkill(ticket);return s?(s.status==='reinforce'?100:s.status==='learning'?70:s.due?60:s.status==='mastered'?20:5):5;}
function ticketSimulatorList(){const {data}=ticketSimulatorState();return TICKET_SIMULATOR_TICKETS.map(t=>({...t,entry:ticketSimulatorEntry(data,t.id),skill:ticketSkill(t),recommendation:ticketRecommended(t)}));}
function ticketSimulatorStats(){const list=ticketSimulatorList();return {total:list.length,started:list.filter(x=>x.entry.status!=='backlog').length,done:list.filter(x=>x.entry.status==='done').length,doing:list.filter(x=>x.entry.status==='doing'||x.entry.status==='review').length};}
function ticketEvaluation(ticket,entry){
  const notes=String(entry.notes||'').toLocaleLowerCase('fr');
  const concepts=ticket.concepts.filter(c=>notes.includes(String(c).toLocaleLowerCase('fr'))).length;
  const checks=ticket.acceptance.length?entry.checks.filter(Boolean).length:0;
  const detail=Math.min(1,notes.trim().length/180);
  const score=Math.round(((checks/Math.max(1,ticket.acceptance.length))*55+(concepts/Math.max(1,ticket.concepts.length))*30+detail*15));
  return {score,concepts,checks,label:score>=80?'Prêt pour une review':score>=55?'Bonne base, à préciser':'Solution encore incomplète'};
}
function ticketRecommendedReason(ticket){const s=ticketSkill(ticket);if(!s)return 'Bon exercice de mise en situation.';if(s.status==='reinforce')return `Recommandé : ${s.title} est à renforcer (${s.score} %).`;if(s.due)return `Recommandé : ${s.title} comporte ${s.due} révision${s.due>1?'s':''} due${s.due>1?'s':''}.`;if(s.status==='learning')return `Utile maintenant : ${s.title} est en cours d’acquisition.`;if(s.status==='mastered')return `Mise en pratique : applique ${s.title} dans un contexte proche du travail.`;return `Découverte guidée de ${s.title}.`;}

function renderTicketSimulator(){
  const page=h('div',{class:'page ticket-simulator-page'});
  const list=ticketSimulatorList();
  const startedPaths=new Set(skillMapSummary().paths.filter(p=>p.started).map(p=>p.path.pathId||p.path.id));
  let pathFilter='all',typeFilter='all',selected=list.slice().sort((a,b)=>b.recommendation-a.recommendation||ticketStatusOrder(a.entry.status)-ticketStatusOrder(b.entry.status))[0]?.id||null;
  const board=h('div',{class:'ticket-board'}),detail=h('div',{class:'ticket-detail'}),flash=h('div',{class:'ticket-flash','aria-live':'polite'});
  const pathSelect=h('select',{'aria-label':'Filtrer par parcours'},h('option',{value:'all'},'Tous les parcours'),...Object.keys(ADAPTIVE_PATHS).map(id=>h('option',{value:id},ticketPathLabel(id))));
  const typeSelect=h('select',{'aria-label':'Filtrer par type'},h('option',{value:'all'},'Tous les types'),...['Bug','Feature','Refactor'].map(x=>h('option',{value:x},x)));
  pathSelect.addEventListener('change',()=>{pathFilter=pathSelect.value;drawBoard();});typeSelect.addEventListener('change',()=>{typeFilter=typeSelect.value;drawBoard();});

  function visible(){return ticketSimulatorList().filter(t=>(pathFilter==='all'||t.pathId===pathFilter)&&(typeFilter==='all'||t.type===typeFilter)).sort((a,b)=>ticketStatusOrder(a.entry.status)-ticketStatusOrder(b.entry.status)||b.recommendation-a.recommendation||a.level-b.level);}
  function drawBoard(){
    const rows=visible();
    if(rows.length&&!rows.some(x=>x.id===selected))selected=rows[0].id;
    board.replaceChildren(...rows.map(t=>h('button',{type:'button',class:'ticket-card'+(t.id===selected?' active':'')+(t.recommendation>=70?' recommended':''),onclick:()=>{selected=t.id;drawBoard();drawDetail();}},
      h('div',{class:'ticket-card-top'},h('span',{class:'ticket-type'},t.type),h('span',{class:'ticket-priority'},t.priority)),
      h('strong',{},t.title),
      para(ticketPathLabel(t.pathId)+' · Niveau '+t.level,'muted small'),
      h('div',{class:'ticket-card-bottom'},h('span',{class:'status todo'},ticketStatusLabel(t.entry.status)),t.recommendation>=70?h('span',{class:'chip'},'Recommandé'):null)
    )));
    if(!rows.length)board.replaceChildren(h('div',{class:'empty'},'Aucun ticket avec ces filtres.'));
  }
  function drawDetail(){
    const ticket=ticketSimulatorList().find(t=>t.id===selected);if(!ticket){detail.replaceChildren();return;}
    const entry=ticket.entry;
    const notes=h('textarea',{class:'ticket-notes',rows:10,placeholder:'Écris ici ton diagnostic, ta solution, du pseudo-code ou du vrai code…','aria-label':'Solution du ticket'},entry.notes||'');
    const checks=ticket.acceptance.map((text,i)=>{const input=h('input',{type:'checkbox',checked:!!entry.checks[i]});input.addEventListener('change',()=>{const next=(ticketSimulatorList().find(x=>x.id===ticket.id)?.entry.checks||[]).slice();next[i]=input.checked;ticketSimulatorSave(ticket.id,{checks:next});});return h('label',{class:'ticket-check'},input,h('span',{},text));});
    const hint=h('div',{class:'ticket-hint'+(entry.hintShown?'':' hidden')},h('strong',{},'Indice'),para(ticket.hint,'muted'));
    const saveBtn=h('button',{type:'button',class:'btn primary'},'Enregistrer la solution');saveBtn.addEventListener('click',()=>{ticketSimulatorSave(ticket.id,{notes:notes.value,status:entry.status==='backlog'?'doing':entry.status});flash.replaceChildren(h('p',{class:'success'},'✓ Solution enregistrée dans ce profil.'));drawBoard();});
    const evalHost=h('div',{class:'ticket-evaluation'});
    const evaluate=()=>{const current=ticketSimulatorList().find(x=>x.id===ticket.id);const ev=ticketEvaluation(ticket,{...current.entry,notes:notes.value});evalHost.replaceChildren(h('div',{class:'ticket-eval-score'},h('strong',{},ev.score+' %'),h('span',{},ev.label)),bar(ev.score),para(`${ev.checks}/${ticket.acceptance.length} critères cochés · ${ev.concepts}/${ticket.concepts.length} concepts clés repérés. Cette pré-évaluation ne remplace pas une vraie code review.`,'muted small'));return ev;};
    const evalBtn=h('button',{type:'button',class:'btn'},'Pré-évaluer ma réponse');evalBtn.addEventListener('click',()=>{ticketSimulatorSave(ticket.id,{notes:notes.value});evaluate();});
    const statusButtons=['backlog','doing','review','done'].map(status=>h('button',{type:'button',class:'btn small '+(entry.status===status?'primary':'ghost'),onclick:()=>{ticketSimulatorSave(ticket.id,{status,notes:notes.value});drawBoard();drawDetail();}},ticketStatusLabel(status)));
    detail.replaceChildren(
      h('div',{class:'ticket-detail-head'},h('div',{},h('span',{class:'eyebrow'},ticket.type+' · '+ticket.priority),h('h2',{},ticket.title),para(ticketPathLabel(ticket.pathId)+' · Niveau '+ticket.level+' · '+(ticket.skill?.title||ticket.skillId),'muted')),h('span',{class:'ticket-id'},'#'+ticket.id)),
      h('div',{class:'ticket-reason'},h('strong',{},'Pourquoi ce ticket ?'),para(ticketRecommendedReason(ticket),'muted small')),
      h('section',{},h('h3',{},'Contexte'),para(ticket.context)),
      h('section',{},h('h3',{},'Critères d’acceptation'),h('div',{class:'ticket-checks'},...checks)),
      h('section',{},h('h3',{},'Livrable attendu'),para(ticket.deliverable,'muted')),
      h('section',{},h('div',{class:'section-heading'},h('h3',{},'Ta résolution'),h('button',{type:'button',class:'btn ghost small',onclick:()=>{ticketSimulatorSave(ticket.id,{hintShown:true,notes:notes.value});hint.classList.remove('hidden');}},entry.hintShown?'Indice affiché':'Voir un indice')),hint,notes,h('div',{class:'toolbar'},saveBtn,evalBtn)),
      evalHost,
      h('section',{class:'ticket-workflow'},h('h3',{},'Workflow simulé'),h('div',{class:'toolbar'},...statusButtons)),
      h('div',{class:'callout'},h('strong',{},'Simulation uniquement'),para('Terminer un ticket n’accorde ni XP ni badge et ne valide aucun cours ou exercice. Le but est de pratiquer la lecture d’un besoin, les critères d’acceptation et la formulation d’une solution.','muted small'))
    );
    if(entry.notes||entry.checks.some(Boolean))evaluate();
  }
  const stats=ticketSimulatorStats();
  page.append(
    pageTitle('Tickets Jira / GitHub Issues','Entraîne-toi à traiter des demandes proches d’une équipe produit : comprendre le besoin, vérifier les critères d’acceptation, proposer une solution puis la préparer pour review.'),
    h('section',{class:'ticket-hero'},h('div',{},h('span',{class:'eyebrow'},'SIMULATION PROFESSIONNELLE'),h('h2',{},stats.doing?stats.doing+' ticket'+(stats.doing>1?'s':'')+' en cours':'Choisis un ticket et traite-le comme en équipe'),para('Les recommandations utilisent tes compétences actuelles, sans modifier ta progression.','muted')),h('div',{class:'ticket-stats'},metric(stats.total,'tickets'),metric(stats.started,'commencés'),metric(stats.done,'terminés'))),
    h('section',{class:'block ticket-controls'},h('div',{class:'ticket-filter'},h('label',{},h('span',{},'Parcours'),pathSelect),h('label',{},h('span',{},'Type'),typeSelect)),flash),
    h('section',{class:'ticket-workspace'},board,detail)
  );
  drawBoard();drawDetail();
  return page;
}
