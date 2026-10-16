// glossary.js — glossaire intelligent global, construit depuis le dictionnaire de l'aide contextuelle.

const GLOSSARY_PATHS = {
  HTML: {id:"html",label:"HTML"},
  CSS: {id:"css",label:"CSS"},
  JavaScript: {id:"javascript",label:"JavaScript"},
  DOM: {id:"javascript",label:"JavaScript / DOM"},
  "Web API": {id:"javascript",label:"JavaScript / Web API"},
  React: {id:"react",label:"React"},
  "React / JSX": {id:"react",label:"React / JSX"},
  Vite: {id:"react",label:"Vite"},
  TypeScript: {id:"typescript",label:"TypeScript"},
  "TypeScript / JS": {id:"typescript",label:"TypeScript"},
  "Node.js": {id:"node",label:"Node.js"},
  SQL: {id:"sql",label:"SQL"},
  SQLite: {id:"sql",label:"SQLite"},
  Accessibilité: {id:"html",label:"Accessibilité"}
};

const GLOSSARY_ERROR_TIPS = [
  [/^(==|===|const|let|number|string|boolean)$/i,"Vérifie le type réel des valeurs et évite les conversions implicites quand elles ne sont pas voulues."],
  [/^(map|filter|find|reduce)$/i,"Regarde ce que la méthode renvoie : nouveau tableau, élément unique ou valeur accumulée."],
  [/^(async|await|Promise|fetch)$/i,"Vérifie où la Promise est créée, où elle est attendue et où une erreur peut être interceptée."],
  [/^(querySelector|addEventListener|classList|textContent|innerHTML)$/i,"Vérifie d'abord que l'élément DOM existe réellement avant de le manipuler."],
  [/^(useState|useEffect|useMemo|useCallback|useRef|useContext)$/i,"N'appelle les Hooks qu'au niveau supérieur d'un composant ou d'un Hook personnalisé et vérifie leurs dépendances."],
  [/^(interface|type|keyof|Record|Partial|Pick|Omit|any)$/i,"Distingue le type attendu à la compilation de la valeur réellement présente à l'exécution."],
  [/^(readFile|writeFile|mkdir|readdir|createServer|process\.argv|process\.env)$/i,"Vérifie le chemin, les erreurs asynchrones et le contexte d'exécution Node.js."],
  [/^(SELECT|FROM|WHERE|JOIN|INNER|LEFT|GROUP|HAVING|ORDER|LIMIT|INSERT|UPDATE|DELETE)$/i,"Lis la requête dans l'ordre logique : source des lignes, filtrage, regroupement, projection puis tri/limite."],
  [/^(NULL|IS)$/i,"En SQL, NULL ne se compare pas avec = : utilise IS NULL ou IS NOT NULL."],
  [/^(PRIMARY|FOREIGN|UNIQUE|CHECK|NOT NULL)$/i,"Une contrainte protège l'intégrité des données : lis le message d'erreur avant de modifier le schéma."],
  [/^(display|flex|grid|position|margin|padding|gap|width)$/i,"Inspecte d'abord le parent, puis l'enfant : beaucoup de problèmes CSS viennent du contexte de mise en page."],
  [/^(alt|aria-|label|button|main|nav|section)$/i,"Ne te fie pas seulement au rendu visuel : vérifie aussi le sens sémantique et l'usage clavier/lecteur d'écran."]
];

function glossaryEntries(){
  const source = typeof CODE_HELP !== "undefined" ? CODE_HELP : (window.CODE_HELP || {});
  return Object.entries(source).map(([key,entry])=>({key,...entry})).sort((a,b)=>a.title.localeCompare(b.title,"fr",{sensitivity:"base"}));
}

function glossaryPathForEntry(entry){
  const kind=String(entry.kind||"");
  const direct=GLOSSARY_PATHS[kind];
  if(direct)return direct;
  if(/React/.test(kind))return GLOSSARY_PATHS.React;
  if(/TypeScript/.test(kind))return GLOSSARY_PATHS.TypeScript;
  if(/Node/.test(kind))return GLOSSARY_PATHS["Node.js"];
  if(/SQL|SQLite/.test(kind))return GLOSSARY_PATHS.SQL;
  if(/CSS/.test(kind))return GLOSSARY_PATHS.CSS;
  if(/HTML|Accessibilité/.test(kind))return GLOSSARY_PATHS.HTML;
  return GLOSSARY_PATHS.JavaScript;
}

function glossaryLessonSources(){
  const sources=[];
  function add(path,label,lessons,href){
    if(!Array.isArray(lessons))return;
    lessons.forEach(lesson=>sources.push({path,label,lesson,href:href(lesson)}));
  }
  if(typeof LESSONS!=="undefined") add("javascript","JavaScript",LESSONS,l=>"/cours/"+l.id);
  if(typeof REACT_LESSONS!=="undefined") add("react","React",REACT_LESSONS,l=>"/react/cours/"+l.id);
  if(typeof CSS_LESSONS!=="undefined") add("css","CSS",CSS_LESSONS,l=>"/css/cours/"+l.id);
  if(typeof HTML_LESSONS!=="undefined") add("html","HTML",HTML_LESSONS,l=>"/html/cours/"+l.id);
  if(typeof TYPESCRIPT_LESSONS!=="undefined") add("typescript","TypeScript",TYPESCRIPT_LESSONS,l=>"/typescript/cours/"+l.id);
  if(typeof NODE_LESSONS!=="undefined") add("node","Node.js",NODE_LESSONS,l=>"/node/cours/"+l.id);
  if(typeof SQL_LESSONS!=="undefined") add("sql","SQL",SQL_LESSONS,l=>"/sql/cours/"+l.id);
  return sources;
}

function glossaryLessonText(lesson){
  try{return JSON.stringify(lesson).toLowerCase();}catch{return String(lesson?.title||"").toLowerCase();}
}

function glossarySearchTokens(entry){
  const raw=[entry.key,entry.title].filter(Boolean).flatMap(v=>String(v).match(/[A-Za-zÀ-ÿ_$][\wÀ-ÿ$.-]*/g)||[]);
  return [...new Set(raw.map(x=>x.toLowerCase()).filter(x=>x.length>1))].sort((a,b)=>b.length-a.length);
}

function glossaryOccurrences(entry){
  const terms=glossarySearchTokens(entry);
  if(!terms.length)return[];
  return glossaryLessonSources().filter(src=>{
    const text=glossaryLessonText(src.lesson);
    return terms.some(term=>text.includes(term));
  });
}

function glossaryTip(entry){
  const hay=entry.key+" "+entry.title;
  const match=GLOSSARY_ERROR_TIPS.find(([re])=>re.test(hay));
  return match?match[1]:"Quand cette notion pose problème, reviens à son rôle précis, observe une petite entrée et vérifie le résultat étape par étape.";
}

function glossaryRelated(entry, all, limit=6){
  const path=glossaryPathForEntry(entry).id;
  const words=new Set((entry.description||"").toLowerCase().match(/[a-zà-ÿ]{4,}/g)||[]);
  return all.filter(x=>x.key!==entry.key).map(x=>{
    let score=glossaryPathForEntry(x).id===path?2:0;
    ((x.description||"").toLowerCase().match(/[a-zà-ÿ]{4,}/g)||[]).forEach(w=>{if(words.has(w))score++;});
    return {x,score};
  }).filter(x=>x.score>1).sort((a,b)=>b.score-a.score||a.x.title.localeCompare(b.x.title,"fr")).slice(0,limit).map(x=>x.x);
}

function glossaryRecordVisit(key){
  try{
    const list=JSON.parse(localStorage.getItem("cahierCode.glossaryRecent")||"[]").filter(x=>x!==key);
    list.unshift(key); localStorage.setItem("cahierCode.glossaryRecent",JSON.stringify(list.slice(0,12)));
  }catch{}
}
function glossaryRecent(){try{return JSON.parse(localStorage.getItem("cahierCode.glossaryRecent")||"[]");}catch{return[];}}

function glossaryEntryHref(key){return "/glossaire/"+encodeURIComponent(key);}

function renderGlossary(){
  const all=glossaryEntries();
  const search=h("input",{class:"glossary-search",type:"search",placeholder:"Rechercher une commande, une notion, un langage…","aria-label":"Rechercher dans le glossaire"});
  const filter=h("select",{class:"glossary-filter","aria-label":"Filtrer par parcours"},h("option",{value:""},"Tous les parcours"),...orderedLearningPaths().map(p=>h("option",{value:p.id},p.title)));
  const count=h("p",{class:"muted small"});
  const grid=h("div",{class:"glossary-grid"});
  const recentKeys=glossaryRecent();
  const recent=recentKeys.map(k=>all.find(e=>e.key===k)).filter(Boolean).slice(0,5);
  function draw(){
    const q=search.value.trim().toLowerCase(),path=filter.value;
    const rows=all.filter(e=>{
      const p=glossaryPathForEntry(e).id;
      const text=[e.key,e.title,e.kind,e.description,e.example].join(" ").toLowerCase();
      return (!path||p===path)&&(!q||text.includes(q));
    });
    count.textContent=rows.length+" notion"+(rows.length>1?"s":"")+" trouvée"+(rows.length>1?"s":"");
    grid.replaceChildren(...rows.map(e=>{
      const p=glossaryPathForEntry(e),occ=glossaryOccurrences(e);
      return h("article",{class:"glossary-card"},
        h("div",{class:"glossary-card-top"},h("span",{class:"badge"},p.label),h("span",{class:"muted small"},occ.length?occ.length+" cours":"Référence")),
        h("h2",{},e.title),para(e.description,"muted"),
        e.example?h("pre",{class:"glossary-mini-code","data-code-help-ignore":"1"},e.example):null,
        link(glossaryEntryHref(e.key),"Ouvrir la fiche →","btn small")
      );
    }));
  }
  search.addEventListener("input",draw);filter.addEventListener("change",draw);draw();
  return h("div",{class:"page glossary-page"},h("p",{class:"crumbs"},link("/","Accueil")," / Glossaire"),pageTitle("Glossaire intelligent","Retrouve les notions des 7 parcours, leurs exemples, leurs pièges fréquents et les cours où elles apparaissent."),
    recent.length?h("section",{class:"block glossary-recent"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"RÉCEMMENT CONSULTÉ"),h("h2",{},"Reprendre une notion"))),h("div",{class:"glossary-chips"},recent.map(e=>link(glossaryEntryHref(e.key),e.title,"btn small")))):null,
    h("section",{class:"block glossary-tools"},h("div",{class:"glossary-controls"},search,filter),count),grid);
}

function renderGlossaryEntry(encodedKey){
  const key=decodeURIComponent(encodedKey||"");
  const all=glossaryEntries(),entry=all.find(e=>e.key===key)||all.find(e=>e.title===key);
  if(!entry)return renderNotFound();
  glossaryRecordVisit(entry.key);
  const p=glossaryPathForEntry(entry),occ=glossaryOccurrences(entry),related=glossaryRelated(entry,all);
  return h("div",{class:"page glossary-entry-page"},
    h("p",{class:"crumbs"},link("/glossaire","Glossaire")," / ",entry.title),
    h("header",{class:"glossary-entry-hero"},h("div",{},h("span",{class:"badge"},p.label),h("h1",{},entry.title),para(entry.description,"lead")),h("div",{class:"glossary-entry-count"},h("strong",{},occ.length),h("span",{},"cours concernés"))),
    h("div",{class:"glossary-entry-layout"},
      h("main",{class:"glossary-entry-main"},
        h("section",{class:"block"},h("span",{class:"eyebrow"},"EXEMPLE"),h("h2",{},"À quoi ça ressemble ?"),entry.example?h("pre",{class:"glossary-code","data-code-help-ignore":"1"},entry.example):para("Cette notion est surtout conceptuelle : observe les cours associés ci-dessous.")),
        h("section",{class:"block"},h("span",{class:"eyebrow"},"PIÈGE FRÉQUENT"),h("h2",{},"Le réflexe à garder"),h("div",{class:"callout"},para(glossaryTip(entry)))),
        h("section",{class:"block"},h("span",{class:"eyebrow"},"DANS TES COURS"),h("h2",{},occ.length?"Où retrouver cette notion":"Aucun cours détecté automatiquement"),occ.length?h("div",{class:"glossary-occurrences"},occ.slice(0,16).map(src=>h("article",{class:"glossary-occurrence"},h("span",{class:"badge"},src.label),h("div",{},link(src.href,src.lesson.title,"row-title"),para(src.lesson.objective||"Ouvrir la leçon pour revoir la notion.","muted small"))))):para("La notion reste disponible comme référence globale même si elle n'est pas détectée textuellement dans une leçon.","muted"))
      ),
      h("aside",{class:"glossary-entry-side"},h("section",{class:"block"},h("span",{class:"eyebrow"},"NOTIONS LIÉES"),h("h2",{},"À relier avec"),related.length?h("div",{class:"glossary-related"},related.map(x=>link(glossaryEntryHref(x.key),x.title,"btn small"))):para("Pas encore de relation automatique pertinente.","muted")),h("section",{class:"block"},h("span",{class:"eyebrow"},"PARCOURS"),h("h2",{},p.label),link((LEARNING_PATHS.find(x=>x.id===p.id)||{}).href||"/","Voir le parcours →","btn primary")))
    )
  );
}

window.glossaryEntryHref=glossaryEntryHref;
window.renderGlossary=renderGlossary;
window.renderGlossaryEntry=renderGlossaryEntry;
