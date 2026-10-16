// frequent-errors.js — tendances personnalisées à partir de « Mes erreurs utiles ».
// Aucun historique parallèle : l'analyse lit state.errorHistory et le catalogue réel des exercices.

const FREQUENT_ERROR_PATTERNS = [
  {
    id:"html-structure", path:"html", title:"Structure HTML et balises sémantiques",
    match:/\b(main|section|article|header|footer|nav|aside|semantic|sémanti|structure|balise|nesting|imbriqu|fermeture)\b/i,
    target:/\b(main|section|article|header|footer|nav|structure|sémanti|balise)\b/i,
    why:"Tu sembles parfois hésiter sur le rôle ou l’imbrication des balises qui structurent une page.",
    reflex:"Avant d’écrire, demande-toi : « quelle est la fonction de ce bloc dans la page ? » puis choisis la balise la plus descriptive.",
    drill:"Reprends un petit document et identifie d’abord ses zones : en-tête, navigation, contenu principal, sections et pied de page."
  },
  {
    id:"html-accessibility", path:"html", title:"Attributs et accessibilité HTML",
    match:/\b(alt|label|aria|for|accessib|attribut|required|placeholder|input|form|formulaire)\b/i,
    target:/\b(alt|label|aria|accessib|attribut|form|input)\b/i,
    why:"Les erreurs reviennent autour des attributs qui donnent du sens ou rendent un formulaire compréhensible.",
    reflex:"Pour chaque élément interactif ou média, vérifie : nom accessible, relation avec son label et information non portée uniquement par le visuel.",
    drill:"Relis un formulaire en imaginant que tu navigues uniquement au clavier et avec un lecteur d’écran."
  },
  {
    id:"css-layout", path:"css", title:"Flexbox, Grid et mise en page",
    match:/\b(flex|grid|display|justify|align|gap|template|column|row|layout|mise en page)\b/i,
    target:/\b(flex|grid|justify|align|gap|layout)\b/i,
    why:"Tes difficultés se concentrent sur la répartition et l’alignement des éléments.",
    reflex:"Sépare toujours le problème en deux : direction/structure d’abord, alignement/espacement ensuite.",
    drill:"Dessine mentalement l’axe principal et l’axe secondaire avant de choisir justify-* ou align-*."
  },
  {
    id:"css-selectors", path:"css", title:"Sélecteurs, cascade et spécificité",
    match:/\b(selector|sélecteur|specific|spécific|cascade|class|id|pseudo|hover|nth|inherit|hérit)\b/i,
    target:/\b(sélecteur|specific|cascade|pseudo|class|id)\b/i,
    why:"Plusieurs erreurs indiquent que la règle correcte n’est pas toujours appliquée à l’élément attendu.",
    reflex:"Quand un style ne s’applique pas, vérifie dans cet ordre : sélecteur → priorité → ordre dans la feuille → propriété héritée ou non.",
    drill:"Prends deux règles concurrentes et prédis laquelle gagne avant de regarder le résultat."
  },
  {
    id:"css-responsive", path:"css", title:"Responsive et dimensions",
    match:/\b(media|responsive|breakpoint|viewport|clamp|rem|em|vw|vh|width|height|min-width|max-width)\b/i,
    target:/\b(media|responsive|viewport|clamp|width|breakpoint)\b/i,
    why:"Les erreurs récurrentes concernent les tailles et le comportement de la page selon l’espace disponible.",
    reflex:"Évite de raisonner en une seule largeur fixe : pense contenu fluide, limites min/max, puis breakpoint seulement si nécessaire.",
    drill:"Teste la même interface mentalement à 360 px, 768 px et grand écran avant d’ajouter une media query."
  },
  {
    id:"js-equality", path:"javascript", title:"Comparaisons et types JavaScript",
    match:/===|==|!==|!=|\b(coerc|compar|égalité|egalite|boolean|booléen|typeof|type)\b/i,
    target:/===|\b(compar|type|boolean|typeof)\b/i,
    why:"Tu rencontres plusieurs erreurs liées aux comparaisons ou au type réel des valeurs.",
    reflex:"Avant une condition, identifie le type des deux valeurs. Utilise === par défaut et convertis explicitement quand c’est nécessaire.",
    drill:"Pour chaque comparaison, prédis d’abord le type et la valeur de chaque côté."
  },
  {
    id:"js-scope", path:"javascript", title:"Variables, portée et mutations",
    match:/\b(let|const|scope|portée|variable|undefined|déclar|declar|mutation|assign|réassign|reassign)\b/i,
    target:/\b(let|const|variable|portée|scope)\b/i,
    why:"Les erreurs semblent revenir sur l’endroit où une variable existe ou sur la manière dont sa valeur peut changer.",
    reflex:"Demande-toi toujours : où la variable est-elle déclarée, dans quel bloc est-elle visible, et dois-je réassigner la variable elle-même ?",
    drill:"Entoure mentalement chaque bloc { } et liste les variables accessibles à l’intérieur."
  },
  {
    id:"js-functions", path:"javascript", title:"Fonctions, paramètres et return",
    match:/\b(function|fonction|return|param|argument|callback|retour|arrow|fléchée|flechee)\b/i,
    target:/\b(function|fonction|return|param|callback)\b/i,
    why:"Les difficultés reviennent dans le passage de valeurs aux fonctions ou dans la valeur qu’elles renvoient.",
    reflex:"Lis une fonction comme une machine : entrées (paramètres) → traitement → sortie (return).",
    drill:"Écris en commentaire l’entrée et la sortie attendues avant le corps de la fonction."
  },
  {
    id:"js-arrays", path:"javascript", title:"Tableaux et transformations",
    match:/\b(array|tableau|map|filter|reduce|find|push|slice|splice|index|length|boucle|loop)\b/i,
    target:/\b(tableau|array|map|filter|reduce|find|boucle)\b/i,
    why:"Plusieurs erreurs concernent le choix de l’opération à appliquer à une collection.",
    reflex:"Choisis l’intention avant la méthode : transformer → map, garder certains éléments → filter, trouver → find, accumuler → reduce.",
    drill:"Pour chaque exercice de tableau, formule d’abord l’objectif en un verbe."
  },
  {
    id:"js-dom", path:"javascript", title:"DOM, sélecteurs et événements",
    match:/\b(dom|querySelector|queryselectorall|addEventListener|event|événement|click|classList|textContent|innerHTML|element)\b/i,
    target:/\b(dom|querySelector|event|classList|textContent)\b/i,
    why:"Tes erreurs reviennent dans la chaîne « trouver un élément → écouter une action → modifier le DOM ».",
    reflex:"Découpe en trois lignes de pensée : je sélectionne quoi ? j’écoute quel événement ? je modifie quoi ensuite ?",
    drill:"Vérifie d’abord que le sélecteur renvoie bien un élément avant d’ajouter l’événement."
  },
  {
    id:"js-async", path:"javascript", title:"Asynchronisme, Promise et async/await",
    match:/\b(async|await|promise|fetch|then|catch|asynchron|resolve|reject)\b/i,
    target:/\b(async|await|promise|fetch|asynchron)\b/i,
    why:"Les erreurs indiquent une confusion répétée entre une valeur disponible maintenant et une valeur disponible plus tard.",
    reflex:"Repère chaque Promise. Si tu as besoin de sa valeur, attends-la avec await dans une fonction async ou traite-la avec then.",
    drill:"Pour chaque ligne, note si elle produit une valeur directe ou une Promise."
  },
  {
    id:"react-state", path:"react", title:"State, props et flux de données React",
    match:/\b(useState|state|props|prop|setState|setter|état|etat|immutable|mutation)\b/i,
    target:/\b(useState|state|props|état|setter)\b/i,
    why:"Tes erreurs reviennent autour de la différence entre données reçues (props) et données qui évoluent dans le composant (state).",
    reflex:"Avant de créer un state, demande-toi qui possède réellement la donnée et qui doit pouvoir la modifier.",
    drill:"Pour chaque donnée affichée, marque-la comme prop, state local ou valeur calculée."
  },
  {
    id:"react-hooks", path:"react", title:"Hooks et cycle de rendu",
    match:/\b(useEffect|hook|hooks|dependency|dependencies|dépendance|dependance|render|rendu|effect|effet)\b/i,
    target:/\b(useEffect|hook|dépendance|render|effet)\b/i,
    why:"Plusieurs erreurs concernent quand un hook s’exécute et quelles valeurs il utilise.",
    reflex:"Un effet doit synchroniser React avec quelque chose d’extérieur. Liste explicitement les valeurs lues par l’effet.",
    drill:"Explique en une phrase ce qui doit déclencher l’effet avant d’écrire son tableau de dépendances."
  },
  {
    id:"react-lists", path:"react", title:"Listes, key et rendu conditionnel",
    match:/\b(key|liste|list|map|condition|conditional|&&|ternaire|render|rendu)\b/i,
    target:/\b(key|liste|map|condition|rendu)\b/i,
    why:"Les erreurs se répètent dans le rendu de collections ou la stabilité des éléments React.",
    reflex:"Une key doit identifier durablement l’élément dans les données, pas simplement sa position si l’ordre peut changer.",
    drill:"Cherche d’abord un id métier stable avant d’utiliser l’index d’un tableau."
  },
  {
    id:"ts-basic-types", path:"typescript", title:"Types, assignations et signatures TypeScript",
    match:/\b(type|number|string|boolean|assign|assignable|argument|parameter|paramètre|signature|annotation)\b/i,
    target:/\b(type|number|string|boolean|assign|signature|annotation)\b/i,
    why:"Les diagnostics reviennent sur une valeur dont le type ne correspond pas au contrat attendu.",
    reflex:"Lis les erreurs TypeScript comme « type reçu → type attendu ». Remonte ensuite jusqu’à la source de la mauvaise valeur.",
    drill:"Avant de corriger, écris sur papier le type attendu et le type réellement produit."
  },
  {
    id:"ts-narrowing", path:"typescript", title:"Unions, null et narrowing",
    match:/\b(union|narrow|narrowing|null|undefined|possibly|possibly undefined|possibly null|guard|type guard|optional)\b/i,
    target:/\b(union|narrow|null|undefined|guard|optional)\b/i,
    why:"Tu sembles rencontrer plusieurs cas où TypeScript ne peut pas encore garantir quel type est présent.",
    reflex:"Avant d’utiliser une valeur union/null, prouve son type au compilateur avec un test ou un type guard.",
    drill:"Liste les différentes formes possibles de la valeur puis élimine-les une par une avec des conditions."
  },
  {
    id:"ts-objects", path:"typescript", title:"Objets, interfaces et génériques",
    match:/\b(interface|object|objet|property|propriété|propriete|generic|générique|generique|keyof|extends)\b/i,
    target:/\b(interface|objet|property|generic|keyof|extends)\b/i,
    why:"Les erreurs concernent le contrat d’un objet ou la façon de rendre un type réutilisable.",
    reflex:"Commence par décrire précisément la forme minimale de l’objet avant d’ajouter unions ou génériques.",
    drill:"Compare propriété par propriété le type attendu et l’objet réellement fourni."
  },
  {
    id:"node-modules", path:"node", title:"Modules Node.js et imports",
    match:/\b(import|export|module|modules|esm|commonjs|require|package.json|type module)\b/i,
    target:/\b(import|export|module|esm|commonjs|require)\b/i,
    why:"Les erreurs reviennent dans le chargement ou l’export de code entre fichiers.",
    reflex:"Vérifie trois choses : dialecte ESM/CommonJS, chemin du fichier, puis nom réellement exporté.",
    drill:"Trace chaque import jusqu’au fichier qui l’exporte avant d’exécuter le programme."
  },
  {
    id:"node-files-async", path:"node", title:"Fichiers, chemins et asynchronisme Node.js",
    match:/\b(fs|readFile|writeFile|appendFile|path|ENOENT|file|fichier|async|await|promise)\b/i,
    target:/\b(fs|readFile|writeFile|path|ENOENT|async|fichier)\b/i,
    why:"Tes erreurs se concentrent sur les chemins de fichiers ou sur l’attente d’opérations asynchrones.",
    reflex:"Résous d’abord le chemin, puis vérifie l’existence/erreur possible, puis await l’opération avant d’utiliser son résultat.",
    drill:"Affiche mentalement cwd + chemin final et demande-toi à quel moment la Promise est résolue."
  },
  {
    id:"node-http", path:"node", title:"HTTP, routes et codes de statut Node.js",
    match:/\b(http|createServer|request|response|req|res|route|routing|status|statusCode|header|json|method|GET|POST|PUT|DELETE)\b/i,
    target:/\b(http|route|status|request|response|GET|POST)\b/i,
    why:"Plusieurs erreurs apparaissent dans l’association méthode + URL + statut + réponse.",
    reflex:"Traite une requête dans cet ordre : méthode → chemin → validation → action → statut → corps de réponse.",
    drill:"Écris la table des routes attendues avant le code du serveur."
  },
  {
    id:"sql-null", path:"sql", title:"NULL et logique SQL",
    match:/=\s*NULL|!=\s*NULL|<>\s*NULL|\b(IS NULL|IS NOT NULL|NULL|valeur nulle)\b/i,
    target:/\b(NULL|IS NULL|IS NOT NULL)\b/i,
    why:"Tu rencontres plusieurs erreurs autour de NULL, qui ne se compare pas comme une valeur classique.",
    reflex:"Pour tester l’absence de valeur, utilise IS NULL ou IS NOT NULL — jamais = NULL.",
    drill:"Remplace mentalement NULL par « valeur inconnue » et demande-toi si une égalité classique a encore du sens."
  },
  {
    id:"sql-where", path:"sql", title:"Filtres WHERE et sécurité des modifications",
    match:/\b(filtre|filter|UPDATE|DELETE|sans where|toutes les lignes|condition)\b/i,
    target:/\b(WHERE|UPDATE|DELETE|filtre|condition)\b/i,
    why:"Les erreurs reviennent sur la sélection des lignes à lire ou à modifier.",
    reflex:"Avant UPDATE ou DELETE, écris et exécute d’abord le SELECT avec le même WHERE pour voir exactement les lignes ciblées.",
    drill:"Transforme chaque modification en SELECT de prévisualisation avant de l’exécuter."
  },
  {
    id:"sql-joins", path:"sql", title:"JOIN et relations entre tables",
    match:/\b(JOIN|INNER JOIN|LEFT JOIN|foreign key|clé étrangère|cle etrangere|relation|ON|ambigu|ambiguous)\b/i,
    target:/\b(JOIN|foreign key|clé étrangère|relation|ON)\b/i,
    why:"Plusieurs erreurs concernent le choix des tables ou de la clé qui les relie.",
    reflex:"Avant le JOIN, formule la relation : table A.colonneFK → table B.cléPrimaire. Ensuite seulement écris ON.",
    drill:"Dessine les deux tables et relie visuellement les colonnes avant de coder."
  },
  {
    id:"sql-grouping", path:"sql", title:"Agrégations, GROUP BY et HAVING",
    match:/\b(COUNT|SUM|AVG|MIN|MAX|GROUP BY|HAVING|aggregate|agrég|groupe|groupement)\b/i,
    target:/\b(COUNT|SUM|AVG|GROUP BY|HAVING|agrég)\b/i,
    why:"Les erreurs reviennent quand plusieurs lignes doivent devenir un résultat par groupe.",
    reflex:"Décide d’abord ce que représente UNE ligne du résultat final. Cette réponse détermine généralement le GROUP BY.",
    drill:"Dis à voix haute : « je veux une ligne par … » puis place cette dimension dans GROUP BY."
  },
  {
    id:"sql-constraints", path:"sql", title:"Contraintes et intégrité des données",
    match:/\b(PRIMARY KEY|FOREIGN KEY|UNIQUE|NOT NULL|CHECK|constraint|contrainte|integrity|intégrité|duplicate)\b/i,
    target:/\b(PRIMARY KEY|FOREIGN KEY|UNIQUE|NOT NULL|CHECK|contrainte)\b/i,
    why:"Plusieurs erreurs sont liées aux règles que la base impose pour protéger les données.",
    reflex:"Quand une écriture échoue, lis le nom de la contrainte puis vérifie la valeur concernée et la ligne référencée.",
    drill:"Pour chaque colonne, demande-toi quelles valeurs doivent être impossibles à enregistrer."
  },
  {
    id:"generic-syntax", path:"all", title:"Syntaxe et ponctuation du code",
    match:/\b(syntax|syntaxe|unexpected|expected|manquant|missing|fermeture|parenth|accolade|crochet|semicolon|point-virgule|virgule|quote|guillemet)\b/i,
    target:/\b(syntax|syntaxe|parenth|accolade|crochet)\b/i,
    why:"Une partie de tes erreurs récurrentes semble venir de petits éléments de syntaxe plutôt que de la logique elle-même.",
    reflex:"Quand le message parle de syntaxe, remonte juste avant l’endroit signalé et vérifie les paires (), {}, [], guillemets et séparateurs.",
    drill:"Relis le code par structure plutôt que par sens : ouvertures/fermetures, séparateurs, puis seulement logique."
  }
];

function frequentErrorText(entry) {
  return [entry.notion, entry.question, entry.message, ...(entry.details||[]), entry.attempt, entry.explanation, entry.solution]
    .filter(Boolean).join("\n");
}

function frequentErrorCatalog() {
  if (typeof spacedReviewCatalog === "function") return spacedReviewCatalog();
  return [];
}

function frequentErrorPatternEntries(pattern) {
  const history = typeof errorHistoryEntries === "function" ? errorHistoryEntries() : [];
  return history.filter((entry) => {
    if (pattern.path !== "all" && entry.path !== pattern.path) return false;
    return pattern.match.test(frequentErrorText(entry));
  });
}

function frequentErrorPatternScore(pattern) {
  const entries = frequentErrorPatternEntries(pattern);
  if (!entries.length) return null;
  const exerciseIds = new Set();
  const openIds = new Set();
  let occurrences = 0;
  let openOccurrences = 0;
  let correctionSeen = 0;
  let lastSeenAt = 0;
  entries.forEach((entry) => {
    const count = Math.max(1, Number(entry.repeatCount)||1);
    occurrences += count;
    exerciseIds.add(entry.exerciseId);
    if (!entry.resolvedAt) { openOccurrences += count; openIds.add(entry.exerciseId); }
    if (entry.correctionSeen) correctionSeen += 1;
    lastSeenAt = Math.max(lastSeenAt, Number(entry.lastSeenAt||entry.createdAt||0));
  });

  // Il faut une vraie répétition : 2 occurrences ou 2 exercices distincts.
  if (occurrences < 2 && exerciseIds.size < 2) return null;
  const severity = openOccurrences >= 4 || openIds.size >= 3 ? "high" : openOccurrences >= 2 || openIds.size >= 2 ? "medium" : "low";
  const status = openOccurrences > 0 ? "active" : "improving";
  const confidence = occurrences >= 6 || exerciseIds.size >= 4 ? "Élevée" : occurrences >= 3 || exerciseIds.size >= 2 ? "Bonne" : "À confirmer";
  return { pattern, entries, occurrences, openOccurrences, distinct:exerciseIds.size, openDistinct:openIds.size, correctionSeen, lastSeenAt, severity, status, confidence };
}

function personalizedFrequentErrors() {
  return FREQUENT_ERROR_PATTERNS.map(frequentErrorPatternScore).filter(Boolean).sort((a,b) => {
    const aw=(a.openOccurrences*5)+(a.distinct*2)+a.occurrences;
    const bw=(b.openOccurrences*5)+(b.distinct*2)+b.occurrences;
    return bw-aw || b.lastSeenAt-a.lastSeenAt;
  });
}

function frequentErrorExercises(analysis, limit) {
  const pattern=analysis.pattern;
  const matchedExerciseIds=new Set(analysis.entries.map(e=>e.exerciseId));
  const candidates=frequentErrorCatalog().filter((item) => {
    if (pattern.path !== "all" && item.path.id !== pattern.path) return false;
    const text=[item.exercise.notion,item.exercise.question,item.exercise.statement,item.exercise.explanation].filter(Boolean).join(" ");
    return matchedExerciseIds.has(item.exercise.id) || pattern.target.test(text);
  });
  candidates.sort((a,b) => {
    const ar=a.record.review?100:0, br=b.record.review?100:0;
    const af=Number(a.record.fails)||0, bf=Number(b.record.fails)||0;
    const am=matchedExerciseIds.has(a.exercise.id)?30:0, bm=matchedExerciseIds.has(b.exercise.id)?30:0;
    return (br+bf*5+bm)-(ar+af*5+am);
  });
  const out=[];
  for(const item of candidates){ if(!out.some(x=>x.exercise.id===item.exercise.id)) out.push(item); if(out.length>=(limit||3)) break; }
  return out;
}

function frequentErrorGlobalStats() {
  const patterns=personalizedFrequentErrors();
  return {
    patterns,
    active:patterns.filter(x=>x.status==="active"),
    improving:patterns.filter(x=>x.status==="improving"),
    high:patterns.filter(x=>x.severity==="high"),
  };
}
