// editor.js — rend les éditeurs de code agréables, comme dans VSCode :
//   • fermeture automatique des ( ) [ ] { } " ' `  (tu tapes un seul caractère)
//   • indentation automatique avec Entrée, Tab / Maj+Tab, commentaire avec Ctrl + /
//   • suggestions : variables et fonctions que tu as créées, mots-clés, commandes de base
//   • modèles de code (« snippets ») : tape  log  puis Tab  →  console.log();
//
// Le fichier est organisé en deux parties :
//   1. des fonctions « pures » (elles calculent une modification, sans toucher à la page) ;
//   2. enhanceEditor(), qui branche tout ça sur un <textarea>.

const EDITOR_PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
const EDITOR_CLOSERS = [")", "]", "}"];
const EDITOR_QUOTES = ['"', "'", "`"];
const INDENT = "  ";

// ═══════════════ 1. Le catalogue de suggestions ═══════════════
// Dans `text` : $0 = position finale du curseur, ${1:mot} = champ à remplir (Tab passe au suivant).

const SNIPPETS = [
  { label: "log", aliases: ["cl", "clg", "console"], detail: "console.log()", text: "console.log($0);" },
  { label: "for", aliases: ["boucle"], detail: "boucle for", text: "for (let i = 0; i < ${1:10}; i++) {\n  $0\n}" },
  { label: "forof", aliases: ["for of", "parcourir"], detail: "parcourir un tableau", text: "for (const ${1:element} of ${2:tableau}) {\n  $0\n}" },
  { label: "while", aliases: [], detail: "boucle while", text: "while (${1:condition}) {\n  $0\n}" },
  { label: "if", aliases: ["si"], detail: "condition", text: "if (${1:condition}) {\n  $0\n}" },
  { label: "ifelse", aliases: ["else", "sinon"], detail: "if / else", text: "if (${1:condition}) {\n  $2\n} else {\n  $0\n}" },
  { label: "elseif", aliases: [], detail: "else if", text: "else if (${1:condition}) {\n  $0\n}" },
  { label: "function", aliases: ["fn", "fonction"], detail: "déclarer une fonction", text: "function ${1:nom}(${2:parametre}) {\n  $0\n}" },
  { label: "arrow", aliases: ["af", "fleche"], detail: "fonction fléchée", text: "const ${1:nom} = (${2:parametre}) => {\n  $0\n};" },
  { label: "const", aliases: ["cst"], detail: "constante", text: "const ${1:nom} = $0;" },
  { label: "let", aliases: [], detail: "variable", text: "let ${1:nom} = $0;" },
  { label: "return", aliases: ["ret"], detail: "renvoyer une valeur", text: "return $0;" },
  { label: "foreach", aliases: [], detail: "tableau.forEach(...)", text: "${1:tableau}.forEach((${2:element}) => {\n  $0\n});" },
];

const KEYWORDS = ["break", "continue", "true", "false", "null", "undefined", "typeof", "new", "this"];

const GLOBALS = [
  { label: "console", detail: "afficher / déboguer" },
  { label: "Math", detail: "fonctions mathématiques" },
  { label: "Number", detail: "convertir en nombre" },
  { label: "String", detail: "convertir en texte" },
  { label: "Boolean", detail: "convertir en booléen" },
  { label: "Array", detail: "tableaux" },
  { label: "Object", detail: "objets" },
  { label: "JSON", detail: "texte ↔ objet" },
  { label: "parseInt", detail: "texte → entier" },
  { label: "parseFloat", detail: "texte → décimal" },
  { label: "isNaN", detail: "est-ce NaN ?" },
];

const CALLBACK = "(${1:n}) => $0";
const GENERIC_MEMBERS = [
  { label: "length", detail: "longueur / nombre d’éléments", text: "length" },
  { label: "push", detail: "ajoute à la fin", text: "push($0)" },
  { label: "pop", detail: "retire le dernier", text: "pop()" },
  { label: "shift", detail: "retire le premier", text: "shift()" },
  { label: "unshift", detail: "ajoute au début", text: "unshift($0)" },
  { label: "includes", detail: "contient ?", text: "includes($0)" },
  { label: "indexOf", detail: "position d’un élément", text: "indexOf($0)" },
  { label: "join", detail: "tableau → texte", text: "join($0)" },
  { label: "slice", detail: "extrait une partie", text: "slice($0)" },
  { label: "reverse", detail: "inverse l’ordre", text: "reverse()" },
  { label: "sort", detail: "trie", text: "sort()" },
  { label: "map", detail: "transforme chaque élément", text: "map(" + CALLBACK + ")" },
  { label: "filter", detail: "garde les éléments qui passent le test", text: "filter(" + CALLBACK + ")" },
  { label: "find", detail: "premier élément qui passe le test", text: "find(" + CALLBACK + ")" },
  { label: "some", detail: "au moins un passe le test ?", text: "some(" + CALLBACK + ")" },
  { label: "every", detail: "tous passent le test ?", text: "every(" + CALLBACK + ")" },
  { label: "forEach", detail: "fait quelque chose pour chaque élément", text: "forEach((${1:element}) => {\n  $0\n})" },
  { label: "toUpperCase", detail: "en majuscules", text: "toUpperCase()" },
  { label: "toLowerCase", detail: "en minuscules", text: "toLowerCase()" },
  { label: "trim", detail: "retire les espaces autour", text: "trim()" },
  { label: "split", detail: "texte → tableau", text: "split($0)" },
  { label: "replace", detail: "remplace du texte", text: "replace($0)" },
  { label: "startsWith", detail: "commence par ?", text: "startsWith($0)" },
  { label: "endsWith", detail: "finit par ?", text: "endsWith($0)" },
  { label: "repeat", detail: "répète un texte", text: "repeat($0)" },
  { label: "toFixed", detail: "nombre de décimales", text: "toFixed($0)" },
  { label: "toString", detail: "en texte", text: "toString()" },
];
const CONSOLE_MEMBERS = [
  { label: "log", detail: "affiche une valeur", text: "log($0)" },
  { label: "warn", detail: "avertissement", text: "warn($0)" },
  { label: "error", detail: "erreur", text: "error($0)" },
];
const MATH_MEMBERS = [
  { label: "floor", detail: "arrondi vers le bas", text: "floor($0)" },
  { label: "ceil", detail: "arrondi vers le haut", text: "ceil($0)" },
  { label: "round", detail: "arrondi", text: "round($0)" },
  { label: "random", detail: "nombre aléatoire entre 0 et 1", text: "random()" },
  { label: "max", detail: "le plus grand", text: "max($0)" },
  { label: "min", detail: "le plus petit", text: "min($0)" },
  { label: "abs", detail: "valeur absolue", text: "abs($0)" },
  { label: "sqrt", detail: "racine carrée", text: "sqrt($0)" },
  { label: "pow", detail: "puissance", text: "pow($0)" },
  { label: "PI", detail: "3,14159…", text: "PI" },
];


// ─── Catalogues pour les pages web (atelier) ───
const BROWSER_SNIPPETS = [
  { label: "listen", aliases: ["ael", "ecouter", "evt"], detail: "addEventListener", text: '${1:element}.addEventListener("${2:click}", (event) => {\n  $0\n});' },
  { label: "queryselector", aliases: ["qs", "select"], detail: "document.querySelector()", text: 'const ${1:element} = document.querySelector("${2:.classe}");$0' },
  { label: "byid", aliases: ["id", "gid"], detail: "document.getElementById()", text: 'const ${1:element} = document.getElementById("${2:id}");$0' },
];

const BROWSER_GLOBALS = [
  { label: "window", detail: "la fenêtre du navigateur" },
  { label: "document", detail: "la page HTML" },
  { label: "alert", detail: "boîte de message", text: "alert($0)" },
  { label: "confirm", detail: "boîte OK / Annuler", text: "confirm($0)" },
  { label: "prompt", detail: "boîte de saisie", text: "prompt($0)" },
  { label: "location", detail: "adresse de la page" },
  { label: "setTimeout", detail: "exécuter plus tard", text: "setTimeout(() => {\n  $0\n}, ${1:1000})" },
];
const DOCUMENT_MEMBERS = [
  { label: "title", detail: "titre de la page", text: "title" },
  { label: "body", detail: "l’élément <body>", text: "body" },
  { label: "head", detail: "l’élément <head>", text: "head" },
  { label: "documentElement", detail: "l’élément <html>", text: "documentElement" },
  { label: "readyState", detail: "état du chargement", text: "readyState" },
  { label: "getElementById", detail: "trouver un élément par son id", text: 'getElementById("$0")' },
  { label: "querySelector", detail: "trouver un élément (sélecteur CSS)", text: 'querySelector("$0")' },
  { label: "querySelectorAll", detail: "trouver plusieurs éléments", text: 'querySelectorAll("$0")' },
  { label: "createElement", detail: "créer un élément", text: 'createElement("$0")' },
  { label: "createTextNode", detail: "créer un nœud de texte", text: 'createTextNode("$0")' },
];
const WINDOW_MEMBERS = [
  { label: "innerWidth", detail: "largeur de la zone d’affichage", text: "innerWidth" },
  { label: "innerHeight", detail: "hauteur de la zone d’affichage", text: "innerHeight" },
  { label: "location", detail: "adresse de la page", text: "location" },
  { label: "document", detail: "la page HTML", text: "document" },
  { label: "console", detail: "la console", text: "console" },
  { label: "alert", detail: "boîte de message", text: "alert($0)" },
  { label: "confirm", detail: "boîte OK / Annuler", text: "confirm($0)" },
  { label: "prompt", detail: "boîte de saisie", text: "prompt($0)" },
  { label: "setTimeout", detail: "exécuter plus tard", text: "setTimeout(() => {\n  $0\n}, ${1:1000})" },
  { label: "scrollTo", detail: "faire défiler la page", text: "scrollTo(0, 0)" },
];
const LOCATION_MEMBERS = [
  { label: "href", detail: "adresse complète", text: "href" },
  { label: "pathname", detail: "chemin de la page", text: "pathname" },
  { label: "reload", detail: "recharger la page", text: "reload()" },
];
const STYLE_MEMBERS = ["backgroundColor", "color", "fontSize", "fontFamily", "display", "border", "padding", "margin", "width", "height", "textAlign"]
  .map((name) => ({ label: name, detail: "propriété CSS", text: name }));


// ─── Éléments du DOM (niveau 3) ───
const ELEMENT_MEMBERS = [
  { label: "textContent", detail: "texte de l’élément", text: "textContent" },
  { label: "innerHTML", detail: "HTML à l’intérieur", text: "innerHTML" },
  { label: "classList", detail: "les classes (add, remove, toggle…)", text: "classList" },
  { label: "style", detail: "styles en ligne", text: "style" },
  { label: "className", detail: "toutes les classes (texte)", text: "className" },
  { label: "id", detail: "l’identifiant", text: "id" },
  { label: "value", detail: "valeur d’un champ", text: "value" },
  { label: "disabled", detail: "désactivé ?", text: "disabled" },
  { label: "dataset", detail: "attributs data-*", text: "dataset" },
  { label: "children", detail: "éléments enfants", text: "children" },
  { label: "firstElementChild", detail: "premier enfant", text: "firstElementChild" },
  { label: "lastElementChild", detail: "dernier enfant", text: "lastElementChild" },
  { label: "parentElement", detail: "élément parent", text: "parentElement" },
  { label: "nextElementSibling", detail: "frère suivant", text: "nextElementSibling" },
  { label: "getAttribute", detail: "lire un attribut", text: 'getAttribute("$0")' },
  { label: "setAttribute", detail: "modifier un attribut", text: 'setAttribute("${1:nom}", "${2:valeur}")' },
  { label: "removeAttribute", detail: "retirer un attribut", text: 'removeAttribute("$0")' },
  { label: "hasAttribute", detail: "attribut présent ?", text: 'hasAttribute("$0")' },
  { label: "append", detail: "ajouter à la fin", text: "append($0)" },
  { label: "prepend", detail: "ajouter au début", text: "prepend($0)" },
  { label: "before", detail: "ajouter avant l’élément", text: "before($0)" },
  { label: "after", detail: "ajouter après l’élément", text: "after($0)" },
  { label: "remove", detail: "supprimer l’élément", text: "remove()" },
  { label: "replaceWith", detail: "remplacer l’élément", text: "replaceWith($0)" },
  { label: "replaceChildren", detail: "remplacer / vider le contenu", text: "replaceChildren($0)" },
  { label: "querySelector", detail: "chercher dans l’élément", text: 'querySelector("$0")' },
  { label: "querySelectorAll", detail: "chercher plusieurs éléments", text: 'querySelectorAll("$0")' },
  { label: "cloneNode", detail: "copier l’élément", text: "cloneNode(true)" },
  { label: "addEventListener", detail: "réagir à un événement", text: 'addEventListener("${1:click}", (event) => {\n  $0\n})' },
  { label: "removeEventListener", detail: "arrêter d’écouter", text: 'removeEventListener("${1:click}", $0)' },
  { label: "closest", detail: "plus proche ancêtre (sélecteur)", text: 'closest("$0")' },
  { label: "matches", detail: "correspond au sélecteur ?", text: 'matches("$0")' },
  { label: "checked", detail: "case cochée ?", text: "checked" },
  { label: "reset", detail: "vider un formulaire", text: "reset()" },
  { label: "hidden", detail: "caché ? (true / false)", text: "hidden" },
  { label: "contains", detail: "contient cet élément ?", text: "contains($0)" },
  { label: "focus", detail: "donner le focus", text: "focus()" },
  { label: "previousElementSibling", detail: "frère précédent", text: "previousElementSibling" },
  { label: "checkValidity", detail: "champ valide ?", text: "checkValidity()" },
  { label: "validity", detail: "détails de validité", text: "validity" },
  { label: "test", detail: "expression régulière : correspond ?", text: "test($0)" },
  { label: "splice", detail: "retirer / insérer dans un tableau", text: "splice(${1:index}, ${2:1})" },
  { label: "findIndex", detail: "position du premier élément qui passe le test", text: "findIndex(" + CALLBACK + ")" },
];
const EVENT_MEMBERS = [
  { label: "key", detail: "la touche (clavier)", text: "key" },
  { label: "code", detail: "la touche physique", text: "code" },
  { label: "target", detail: "l’élément touché", text: "target" },
  { label: "currentTarget", detail: "l’élément qui écoute", text: "currentTarget" },
  { label: "type", detail: "le type d’événement", text: "type" },
  { label: "preventDefault", detail: "annuler le comportement par défaut", text: "preventDefault()" },
  { label: "stopPropagation", detail: "arrêter la propagation", text: "stopPropagation()" },
  { label: "clientX", detail: "position horizontale du pointeur", text: "clientX" },
  { label: "clientY", detail: "position verticale du pointeur", text: "clientY" },
  { label: "button", detail: "bouton de la souris", text: "button" },
  { label: "shiftKey", detail: "Maj enfoncée ?", text: "shiftKey" },
  { label: "ctrlKey", detail: "Ctrl enfoncée ?", text: "ctrlKey" },
  { label: "altKey", detail: "Alt enfoncée ?", text: "altKey" },
  { label: "repeat", detail: "touche maintenue ?", text: "repeat" },
];
const CLASSLIST_MEMBERS = [
  { label: "add", detail: "ajouter une classe", text: 'add("$0")' },
  { label: "remove", detail: "retirer une classe", text: 'remove("$0")' },
  { label: "toggle", detail: "ajouter ou retirer", text: 'toggle("$0")' },
  { label: "contains", detail: "a cette classe ?", text: 'contains("$0")' },
];

const HTML_SNIPPETS = [
  { label: "html", aliases: ["doc", "html5"], detail: "page HTML complète", doc: true,
    text: '<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8">\n  <title>${1:Titre}</title>\n</head>\n<body>\n  $0\n</body>\n</html>' },
  { label: "script", aliases: [], detail: '<script src="…"></script>', tag: true, text: '<script src="${1:script.js}"></script>$0' },
  { label: "scriptdefer", aliases: ["defer"], detail: "script avec defer", tag: true, text: '<script src="${1:script.js}" defer></script>$0' },
  { label: "link", aliases: ["css"], detail: "lier une feuille de style", tag: true, text: '<link rel="stylesheet" href="${1:style.css}">$0' },
  { label: "h1", aliases: [], detail: "titre", tag: true, text: "<h1>$0</h1>" },
  { label: "h2", aliases: [], detail: "sous-titre", tag: true, text: "<h2>$0</h2>" },
  { label: "section", aliases: [], detail: "section", tag: true, text: "<section>\n  $0\n</section>" },
  { label: "ol", aliases: [], detail: "liste numérotée", tag: true, text: "<ol>\n  <li>$0</li>\n</ol>" },
  { label: "label", aliases: [], detail: "étiquette de champ", tag: true, text: '<label for="${1:champ}">$0</label>' },
  { label: "p", aliases: [], detail: "paragraphe", tag: true, text: "<p>$0</p>" },
  { label: "div", aliases: [], detail: "bloc", tag: true, text: "<div>$0</div>" },
  { label: "span", aliases: [], detail: "texte en ligne", tag: true, text: "<span>$0</span>" },
  { label: "button", aliases: [], detail: "bouton", tag: true, text: '<button id="${1:bouton}">$0</button>' },
  { label: "form", aliases: ["formulaire"], detail: "formulaire", tag: true, text: '<form id="${1:formulaire}">\n  $0\n</form>' },
  { label: "select", aliases: ["liste-deroulante"], detail: "liste déroulante", tag: true, text: '<select id="${1:choix}">\n  <option value="${2:a}">$0</option>\n</select>' },
  { label: "option", aliases: [], detail: "choix d’une liste", tag: true, text: '<option value="${1:valeur}">$0</option>' },
  { label: "textarea", aliases: [], detail: "zone de texte", tag: true, text: '<textarea id="${1:texte}"></textarea>$0' },
  { label: "checkbox", aliases: ["case"], detail: "case à cocher", tag: true, text: '<input id="${1:case}" type="checkbox">$0' },
  { label: "ul", aliases: ["liste"], detail: "liste à puces", tag: true, text: "<ul>\n  <li>$0</li>\n</ul>" },
  { label: "li", aliases: [], detail: "élément de liste", tag: true, text: "<li>$0</li>" },
  { label: "a", aliases: ["lien"], detail: "lien", tag: true, text: '<a href="${1:#}">$0</a>' },
  { label: "img", aliases: ["image"], detail: "image", tag: true, text: '<img src="${1:image.png}" alt="${2:description}">$0' },
  { label: "input", aliases: [], detail: "champ de saisie", tag: true, text: '<input id="${1:champ}" type="text">$0' },
];

// ═══════════════ 2. Fonctions pures ═══════════════

// Le curseur est-il dans un texte entre guillemets ou dans un commentaire ?
function insideStringOrComment(lineBeforeCaret) {
  let quote = null;
  for (let i = 0; i < lineBeforeCaret.length; i++) {
    const c = lineBeforeCaret[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
    } else if (EDITOR_QUOTES.includes(c)) quote = c;
    else if (c === "/" && lineBeforeCaret[i + 1] === "/") return true;
  }
  return quote !== null;
}

// Trouve les noms créés dans le code : variables, fonctions, paramètres.
function declaredNames(code) {
  const names = new Map();
  const add = (name, kind) => { if (name && !names.has(name)) names.set(name, kind); };
  const addParams = (list) => list.split(",").forEach((p) => {
    const name = p.split("=")[0].trim();
    if (/^[A-Za-z_$][\w$]*$/.test(name)) add(name, "variable");
  });

  for (const m of code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g)) { add(m[1], "function"); addParams(m[2]); }
  for (const m of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>/g)) {
    add(m[1], "function");
    addParams(m[2] !== undefined ? m[2] : m[3]);
  }
  for (const m of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) add(m[1], "variable");
  return names;
}

function membersFor(objectName, language) {
  if (language === "js-browser") {
    if (objectName === "document") return DOCUMENT_MEMBERS;
    if (objectName === "window") return WINDOW_MEMBERS;
    if (objectName === "location") return LOCATION_MEMBERS;
    if (objectName === "style") return STYLE_MEMBERS;
    if (objectName === "classList") return CLASSLIST_MEMBERS;
    if (objectName === "event" || objectName === "e" || objectName === "evt") return EVENT_MEMBERS;
    if (objectName !== "console" && objectName !== "Math") return ELEMENT_MEMBERS.concat(GENERIC_MEMBERS);
  }
  if (objectName === "console") return CONSOLE_MEMBERS;
  if (objectName === "Math") return MATH_MEMBERS;
  return GENERIC_MEMBERS;
}

// Calcule la liste de suggestions pour un curseur en position `pos`.
// Renvoie { items, start } (start = début du mot à remplacer) ou null.
function computeSuggestions(code, pos, force, language) {
  if (language === "css") return null;
  if (language === "html") return computeHtmlSuggestions(code, pos);
  const before = code.slice(0, pos);
  const lineBefore = before.slice(before.lastIndexOf("\n") + 1);
  if (insideStringOrComment(lineBefore)) return null;

  const wordMatch = before.match(/[A-Za-z_$][\w$]*$/);
  const word = wordMatch ? wordMatch[0] : "";
  const start = pos - word.length;
  const previous = before[start - 1];
  if (/\d/.test(previous || "")) return null;            // un nombre, pas un nom : « 3x »

  const member = previous === ".";
  if (member && /\d/.test(before[start - 2] || "")) return null;   // « 3. » : un nombre décimal
  if (!word && !member && !force) return null;
  // Juste après const / let / function : on choisit un nouveau nom, on ne propose rien.
  if (!member && /\b(?:const|let|var|function)\s+$/.test(before.slice(0, start))) return null;

  let pool;
  if (member) {
    const owner = before.slice(0, start - 1).match(/([A-Za-z_$][\w$]*)$/);
    pool = membersFor(owner ? owner[1] : "", language).map((m) => ({ label: m.label, detail: m.detail, text: m.text, kind: "member", rank: 1 }));
  } else {
    pool = [];
    SNIPPETS.forEach((s) => pool.push({ label: s.label, aliases: s.aliases, detail: s.detail, text: s.text, kind: "snippet", rank: 0 }));
    declaredNames(code).forEach((kind, name) => {
      if (name !== word) pool.push({ label: name, detail: kind === "function" ? "fonction" : "variable", kind: kind, rank: 1 });
    });
    KEYWORDS.forEach((k) => pool.push({ label: k, detail: "mot-clé", kind: "keyword", rank: 2 }));
    GLOBALS.forEach((g) => pool.push({ label: g.label, detail: g.detail, kind: "global", rank: 3 }));
    if (language === "js-browser") BROWSER_SNIPPETS.forEach((b) => pool.push({ label: b.label, aliases: b.aliases, detail: b.detail, text: b.text, kind: "snippet", rank: 0 }));
    if (language === "js-browser") BROWSER_GLOBALS.forEach((g) => pool.push({ label: g.label, detail: g.detail, text: g.text, kind: "global", rank: 3 }));
  }

  const lower = word.toLowerCase();
  const scored = [];
  for (const item of pool) {
    const names = [item.label].concat(item.aliases || []).map((n) => n.toLowerCase());
    let score = null;
    if (lower === "") score = 1;
    else if (names.some((n) => n.startsWith(lower))) score = 0;
    else if (item.label.toLowerCase().includes(lower)) score = 1;
    if (score !== null) scored.push({ item, score });
  }
  scored.sort((a, b) =>
    a.score - b.score || a.item.rank - b.item.rank || a.item.label.length - b.item.label.length || a.item.label.localeCompare(b.item.label));

  const items = scored.slice(0, 8).map((s) => s.item);
  if (items.length === 0) return null;
  // Rien à proposer si le mot est déjà écrit en entier et que ce n'est pas un modèle.
  if (items.length === 1 && items[0].label === word && items[0].kind !== "snippet") return null;
  return { items, start };
}

// Suggestions pour le HTML : après « < » (balises) ou au tout début (page complète).
function computeHtmlSuggestions(code, pos) {
  const before = code.slice(0, pos);
  const match = before.match(/[A-Za-z][\w-]*$/);
  const word = match ? match[0] : "";
  const start = pos - word.length;
  const afterBracket = before[start - 1] === "<";
  const atStart = /^\s*$/.test(before.slice(0, start));
  let pool;
  if (afterBracket) pool = HTML_SNIPPETS.filter((item) => item.tag);
  else if (atStart && word) pool = HTML_SNIPPETS.filter((item) => item.doc);
  else return null;
  const lower = word.toLowerCase();
  const items = pool
    .filter((item) => lower === "" || [item.label].concat(item.aliases || []).some((n) => n.startsWith(lower)))
    .slice(0, 8)
    .map((item) => ({ label: item.label, detail: item.detail, text: item.text, kind: "snippet" }));
  if (items.length === 0) return null;
  return { items: items, start: afterBracket ? start - 1 : start };
}

// Découpe un modèle : renvoie le texte final, les champs à remplir (stops) et la position finale.
function parseSnippet(source) {
  const stops = [];
  let finalPos = null;
  let text = "";
  let last = 0;
  const pattern = /\$\{(\d+):([^}]*)\}|\$(\d+)/g;
  let match;
  while ((match = pattern.exec(source))) {
    text += source.slice(last, match.index);
    const number = Number(match[1] !== undefined ? match[1] : match[3]);
    const placeholder = match[2] !== undefined ? match[2] : "";
    const start = text.length;
    text += placeholder;
    if (number === 0) finalPos = start;
    else stops.push({ number: number, start: start, end: text.length });
    last = pattern.lastIndex;
  }
  text += source.slice(last);
  stops.sort((a, b) => a.number - b.number);
  return { text: text, stops: stops, finalPos: finalPos === null ? text.length : finalPos };
}

// Une « modification » est : { from, to, text, selStart, selEnd }
// (remplace value[from..to] par text, puis place la sélection).

// Tu tapes un caractère : faut-il fermer, sauter par-dessus, ou entourer la sélection ?
function pairEdit(value, start, end, key) {
  const next = value[end] || "";
  const prev = value[start - 1] || "";
  const hasSelection = start !== end;
  const isQuote = EDITOR_QUOTES.includes(key);

  // Tu retapes le caractère fermant déjà présent : on saute par-dessus.
  if (!hasSelection && next === key && (isQuote || EDITOR_CLOSERS.includes(key))) {
    return { from: start, to: start, text: "", selStart: start + 1, selEnd: start + 1 };
  }
  if (!(key in EDITOR_PAIRS)) return null;
  // Du texte est sélectionné : on l'entoure.
  if (hasSelection) {
    return { from: start, to: end, text: key + value.slice(start, end) + EDITOR_PAIRS[key], selStart: start + 1, selEnd: end + 1 };
  }
  // Une apostrophe dans un mot (l'erreur) ou un guillemet fermant : pas de paire.
  if (isQuote && /[\w$]/.test(prev)) return null;
  // On ne ferme pas juste avant un mot (comme VSCode).
  if (next && !/[\s)\]};:.,]/.test(next)) return null;
  return { from: start, to: start, text: key + EDITOR_PAIRS[key], selStart: start + 1, selEnd: start + 1 };
}

// Retour arrière entre deux caractères d'une paire vide : on supprime les deux.
function backspaceEdit(value, start, end) {
  if (start !== end || start === 0) return null;
  if (EDITOR_PAIRS[value[start - 1]] === value[start]) {
    return { from: start - 1, to: start + 1, text: "", selStart: start - 1, selEnd: start - 1 };
  }
  return null;
}

// Entrée : on garde l'indentation de la ligne, et on ouvre un bloc entre { }.
function enterEdit(value, start, end) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const indent = (value.slice(lineStart, start).match(/^[ \t]*/) || [""])[0];
  const prev = value[start - 1] || "";
  const next = value[end] || "";
  let text;
  let caret;
  if ("{([".includes(prev) && prev !== "") {
    if (EDITOR_PAIRS[prev] === next) {
      text = "\n" + indent + INDENT + "\n" + indent;
      caret = start + 1 + indent.length + INDENT.length;
    } else {
      text = "\n" + indent + INDENT;
      caret = start + text.length;
    }
  } else {
    text = "\n" + indent;
    caret = start + text.length;
  }
  return { from: start, to: end, text: text, selStart: caret, selEnd: caret };
}

// Renvoie les limites des lignes touchées par la sélection.
function lineRange(value, start, end) {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  let to = value.indexOf("\n", end);
  if (to === -1) to = value.length;
  if (end > start && value[end - 1] === "\n") to = end - 1;
  return { from: from, to: Math.max(from, to) };
}

function rewriteLines(value, start, end, transform) {
  const range = lineRange(value, start, end);
  const lines = value.slice(range.from, range.to).split("\n");
  const out = lines.map(transform);
  const text = out.join("\n");
  const firstDelta = out[0].length - lines[0].length;
  const totalDelta = text.length - (range.to - range.from);
  return {
    from: range.from, to: range.to, text: text,
    selStart: Math.max(range.from, start + firstDelta), selEnd: Math.max(range.from, end + totalDelta),
    changed: text !== value.slice(range.from, range.to),
  };
}

// Ctrl + / : commenter ou décommenter les lignes.
function toggleCommentEdit(value, start, end) {
  const range = lineRange(value, start, end);
  const lines = value.slice(range.from, range.to).split("\n");
  const allCommented = lines.every((l) => l.trim() === "" || /^\s*\/\//.test(l));
  return rewriteLines(value, start, end, (line) => {
    if (line.trim() === "") return line;
    return allCommented ? line.replace(/^(\s*)\/\/ ?/, "$1") : line.replace(/^(\s*)/, "$1// ");
  });
}

// Tab sur plusieurs lignes (indenter) ou Maj + Tab (désindenter).
function indentEdit(value, start, end, outdent) {
  const edit = rewriteLines(value, start, end, (line) => {
    if (outdent) return line.replace(/^( {1,2}|\t)/, "");
    return line.trim() === "" ? line : INDENT + line;
  });
  return edit.changed ? edit : null;
}

// ═══════════════ 3. Brancher tout ça sur un <textarea> ═══════════════

// Position du curseur à l'écran, pour placer la liste de suggestions.
// Astuce : on recopie le texte dans un <div> invisible de même style et on mesure.
function caretCoords(textarea) {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  ["fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing", "lineHeight", "tabSize",
    "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth",
    "borderBottomWidth", "borderLeftWidth", "boxSizing", "wordSpacing"].forEach((p) => { mirror.style[p] = style[p]; });
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.left = "-9999px";
  mirror.style.top = "0";
  mirror.style.whiteSpace = "pre";
  mirror.textContent = textarea.value.slice(0, textarea.selectionStart);
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  mirror.append(marker);
  document.body.append(mirror);
  const rect = textarea.getBoundingClientRect();
  const lineHeight = parseFloat(style.lineHeight) || 22;
  const x = rect.left + (parseFloat(style.borderLeftWidth) || 0) + marker.offsetLeft - textarea.scrollLeft;
  const top = rect.top + (parseFloat(style.borderTopWidth) || 0) + marker.offsetTop - textarea.scrollTop;
  mirror.remove();
  return { x: x, top: top, bottom: top + lineHeight };
}

// La liste de suggestions est partagée par tous les éditeurs (un seul est actif à la fois).
let suggestEl = null;
let closeActivePopup = null;

function getSuggestEl() {
  if (!suggestEl) {
    suggestEl = document.createElement("ul");
    suggestEl.className = "suggest";
    suggestEl.setAttribute("role", "listbox");
    suggestEl.style.display = "none";
    document.body.append(suggestEl);
    // Défiler la page ferme la liste (sa position ne serait plus bonne).
    window.addEventListener("scroll", () => { if (closeActivePopup) closeActivePopup(); }, true);
  }
  return suggestEl;
}

const KIND_ICONS = { snippet: "‹›", function: "ƒ", variable: "x", keyword: "k", global: "◆", member: "m" };

function enhanceEditor(editor, onRun, language) {
  let items = [];
  let active = 0;
  let replaceStart = 0;
  let popupOpen = false;
  let session = null;        // champs d'un modèle en cours : { stops, finalPos, index }
  let escaped = false;       // Échap puis Tab : on laisse le focus quitter l'éditeur
  let applying = false;
  let lastLength = editor.value.length;

  editor.setAttribute("aria-autocomplete", "list");

  // ─── Appliquer une modification en gardant l'historique (Ctrl + Z) ───
  function applyEdit(edit) {
    applying = true;
    editor.setSelectionRange(edit.from, edit.to);
    if (edit.text !== "" || edit.to !== edit.from) {
      let done = false;
      try {
        done = edit.text === "" ? document.execCommand("delete") : document.execCommand("insertText", false, edit.text);
      } catch (error) {
        done = false;
      }
      if (!done) {   // plan B si le navigateur refuse execCommand
        editor.setRangeText(edit.text, edit.from, edit.to, "end");
        editor.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
    editor.setSelectionRange(edit.selStart, edit.selEnd);
    applying = false;
    shiftStops(edit.from, edit.text.length - (edit.to - edit.from));
    lastLength = editor.value.length;
  }

  // ─── Champs de modèle (Tab pour passer au suivant) ───
  function shiftStops(position, delta) {
    if (!session || delta === 0) return;
    for (const stop of session.stops) {
      if (position < stop.start) { stop.start += delta; stop.end += delta; }
      else if (position <= stop.end) stop.end += delta;
    }
    if (position <= session.finalPos) session.finalPos += delta;
  }

  function selectStop() {
    const stop = session.stops[session.index];
    editor.setSelectionRange(stop.start, stop.end);
  }

  function nextStop() {
    session.index++;
    if (session.index < session.stops.length) { selectStop(); return; }
    editor.setSelectionRange(session.finalPos, session.finalPos);
    session = null;
  }

  // ─── Liste de suggestions ───
  function closePopup() {
    if (!popupOpen) return;
    popupOpen = false;
    getSuggestEl().style.display = "none";
    if (closeActivePopup === closePopup) closeActivePopup = null;
  }

  function renderPopup() {
    const list = getSuggestEl();
    list.replaceChildren();
    items.forEach((item, index) => {
      const row = document.createElement("li");
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", index === active ? "true" : "false");
      const icon = document.createElement("span");
      icon.className = "sg-kind " + item.kind;
      icon.textContent = KIND_ICONS[item.kind] || "·";
      const label = document.createElement("span");
      label.textContent = item.label;
      const detail = document.createElement("span");
      detail.className = "sg-detail";
      detail.textContent = item.detail || "";
      row.append(icon, label, detail);
      // mousedown (et pas click) : le textarea garde le focus.
      row.addEventListener("mousedown", (event) => { event.preventDefault(); accept(index); });
      list.append(row);
    });
    const current = list.children[active];
    if (current && current.scrollIntoView) current.scrollIntoView({ block: "nearest" });
  }

  function showPopup() {
    const list = getSuggestEl();
    popupOpen = true;
    closeActivePopup = closePopup;
    renderPopup();
    list.style.display = "block";
    const c = caretCoords(editor);
    const height = list.offsetHeight || 0;
    const width = list.offsetWidth || 320;
    list.style.left = Math.max(8, Math.min(c.x, window.innerWidth - width - 8)) + "px";
    list.style.top = (c.bottom + height > window.innerHeight && c.top - height > 0 ? c.top - height - 4 : c.bottom + 4) + "px";
  }

  function updateSuggestions(force) {
    // Pas de suggestions pendant qu'on remplit les champs d'un modèle (nom libre) ni quand du texte est sélectionné.
    if (editor.selectionStart !== editor.selectionEnd || (session && !force)) { closePopup(); return; }
    const result = computeSuggestions(editor.value, editor.selectionStart, force, language);
    if (!result) { closePopup(); return; }
    items = result.items;
    replaceStart = result.start;
    active = 0;
    showPopup();
  }

  function accept(index) {
    const item = items[index];
    closePopup();
    const value = editor.value;
    const caret = editor.selectionStart;
    let source = item.text || item.label;
    if (item.kind === "function" && value[caret] !== "(") source = item.label + "($0)";
    // Les lignes suivantes du modèle gardent l'indentation de la ligne courante.
    const lineStart = value.lastIndexOf("\n", replaceStart - 1) + 1;
    const indent = (value.slice(lineStart, replaceStart).match(/^[ \t]*/) || [""])[0];
    const parsed = parseSnippet(source.replace(/\n/g, "\n" + indent));
    session = null;
    applyEdit({
      from: replaceStart, to: caret, text: parsed.text,
      selStart: replaceStart + parsed.finalPos, selEnd: replaceStart + parsed.finalPos,
    });
    if (parsed.stops.length > 0) {
      session = {
        stops: parsed.stops.map((s) => ({ start: replaceStart + s.start, end: replaceStart + s.end })),
        finalPos: replaceStart + parsed.finalPos,
        index: 0,
      };
      selectStop();
    }
  }

  // ─── Événements ───
  function onInput(event) {
    if (!applying) {
      const delta = editor.value.length - lastLength;
      if (session && delta !== 0) shiftStops(delta > 0 ? editor.selectionStart - delta : editor.selectionStart, delta);
    }
    lastLength = editor.value.length;
    if (applying || editor.readOnly) return;
    updateSuggestions(false);
  }

  function onKeydown(event) {
    if (event.isComposing || editor.readOnly) return;
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const ctrl = event.ctrlKey || event.metaKey;

    // Ctrl + Entrée : exécuter
    if (event.key === "Enter" && ctrl) {
      if (onRun) { event.preventDefault(); closePopup(); onRun(); }
      return;
    }
    // Ctrl + Espace : afficher les suggestions
    if (ctrl && (event.code === "Space" || event.key === " ")) {
      event.preventDefault();
      updateSuggestions(true);
      return;
    }
    // Ctrl + /  (au clavier AZERTY : Ctrl + :) : commenter
    if (ctrl && !event.altKey && (event.key === "/" || event.key === ":" || event.code === "Slash")) {
      event.preventDefault();
      closePopup();
      applyEdit(toggleCommentEdit(value, start, end));
      return;
    }

    if (popupOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        active = (active + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
        renderPopup();
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") { event.preventDefault(); accept(active); return; }
      if (event.key === "Escape") { event.preventDefault(); closePopup(); return; }
      if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)) closePopup();
    }

    if (event.key === "Escape") { escaped = true; session = null; return; }

    if (event.key === "Tab") {
      if (event.shiftKey) {
        const edit = indentEdit(value, start, end, true);
        if (edit) { event.preventDefault(); applyEdit(edit); }
        escaped = false;
        return;
      }
      if (escaped) { escaped = false; return; }       // le focus quitte l'éditeur
      event.preventDefault();
      if (session) { nextStop(); return; }
      if (value.slice(start, end).includes("\n")) {
        const edit = indentEdit(value, start, end, false);
        if (edit) applyEdit(edit);
      } else {
        applyEdit({ from: start, to: end, text: INDENT, selStart: start + INDENT.length, selEnd: start + INDENT.length });
      }
      return;
    }

    if (event.key === "Enter" && !ctrl) {
      event.preventDefault();
      applyEdit(enterEdit(value, start, end));
      return;
    }

    if (event.key === "Backspace") {
      const edit = backspaceEdit(value, start, end);
      if (edit) { event.preventDefault(); closePopup(); applyEdit(edit); }
      escaped = false;
      return;
    }

    // Caractère normal. Sur un clavier AZERTY, { [ ] } s'écrivent avec AltGr (= Ctrl + Alt) :
    // on accepte donc ce cas.
    const altGr = event.getModifierState && event.getModifierState("AltGraph");
    const printable = event.key.length === 1 && (!ctrl || altGr || (event.ctrlKey && event.altKey));
    if (printable) {
      const edit = pairEdit(value, start, end, event.key);
      if (edit) { event.preventDefault(); closePopup(); applyEdit(edit); }
    }
    escaped = false;
  }

  editor.addEventListener("keydown", onKeydown);
  editor.addEventListener("input", onInput);
  editor.addEventListener("blur", () => { closePopup(); session = null; });
  editor.addEventListener("click", () => { closePopup(); session = null; });
  return editor;
}
