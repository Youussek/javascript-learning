// exercises.js — tous les exercices (uniquement des données).
//
// Champs communs à tous les exercices :
//   id, lesson (id du cours), notion (ce qu’on s’entraîne à maîtriser), type, difficulty (1 à 3),
//   question, hints (3 indices), explanation (correction expliquée), retain (la notion à retenir).
//
// Champs selon le type :
//   "qcm"     : options (liste), answer (index de la bonne réponse), why (explication par mauvaise option), code (optionnel)
//   "vf"      : statement (l’affirmation), answer (true ou false), why (explication si la réponse est fausse)
//   "predict" : code, answers (réponses acceptées), rows (nombre de lignes affichées), common (erreurs classiques)
//   "fill"    : template (le code avec ___ pour chaque trou), answers (une réponse ou une liste par trou), why
//               language (facultatif) : "html" ou "text" quand le modèle n’est pas du JavaScript
//   "code"    : starter (code de départ), tests (vérifications), expectLogs (lignes attendues dans la console), mustContain (règles), solution
//   "lab"     : files (les fichiers de la page), tests (expressions évaluées dans la page), expectLogs ({ level, text }),
//               mustContain / mustNotContain ({ file, re, msg }), solution (liste de fichiers). Les fichiers readOnly ne sont pas modifiables.
//               actions : ce que « fait » la personne dans la page (clics, saisies, touches…), jouées avant les vérifications.
//               forbidLogs : messages qui ne doivent PAS apparaître dans la console.
//               Une vérification avec afterAction: k est évaluée juste après la k-ième action (en partant de 0).
//   "predict" en navigateur : env: "browser" ; simulate (facultatif) : les actions à jouer pour vérifier la réponse.
//
// label (optionnel) remplace le nom du type, par exemple « Trouver l’erreur ».

// ─── Morceaux de pages réutilisés dans les exercices du niveau 5 ───
const ACCORDEON_BODY = `<div id="accordeon">
  <button class="titre" aria-expanded="false">Livraison</button>
  <div class="contenu" hidden>Colis expédié sous 48 h.</div>
  <button class="titre" aria-expanded="false">Retours</button>
  <div class="contenu" hidden>Retours gratuits pendant 30 jours.</div>
  <button class="titre" aria-expanded="false">Paiement</button>
  <div class="contenu" hidden>Carte bancaire ou virement.</div>
</div>`;
const ACCORDEON_CSS = `.titre { display: block; width: 100%; text-align: left; padding: 10px; margin-top: 6px; cursor: pointer; font-weight: bold; }
.titre[aria-expanded="true"] { background: gold; }
.contenu { padding: 8px 12px; background: #f4f4ff; }`;

const BURGER_BODY = `<header>
  <strong>Mon site</strong>
  <button id="burger" aria-expanded="false">☰ Menu</button>
</header>
<nav id="menu">
  <a href="#">Accueil</a>
  <a href="#">Contact</a>
</nav>
<p id="contenu">Le contenu de la page.</p>`;
const BURGER_CSS = `header { display: flex; justify-content: space-between; align-items: center; }
#menu { display: none; background: #eef; padding: 8px; }
#menu.ouvert { display: block; }
#menu a { display: block; padding: 6px; }`;
const BURGER_SCRIPT = `const bouton = document.getElementById("burger");
const menu = document.getElementById("menu");

function ouvrir() {
  menu.classList.add("ouvert");
  bouton.setAttribute("aria-expanded", "true");
}

function fermer() {
  menu.classList.remove("ouvert");
  bouton.setAttribute("aria-expanded", "false");
}

bouton.addEventListener("click", () => {
  if (menu.classList.contains("ouvert")) {
    fermer();
  } else {
    ouvrir();
  }
});
`;

const MODALE_BODY = `<button id="ouvrir">Ouvrir la modale</button>
<div id="fond" hidden>
  <div class="modale" role="dialog" aria-modal="true">
    <p>Une fenêtre modale.</p>
    <button id="fermer">Fermer</button>
  </div>
</div>`;
const MODALE_CSS = `#fond { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; }
#fond[hidden] { display: none; }
.modale { background: white; padding: 20px 28px; border-radius: 10px; }`;
const MODALE_SCRIPT = `const ouvrir = document.getElementById("ouvrir");
const fond = document.getElementById("fond");
const fermer = document.getElementById("fermer");

function ouvrirModale() {
  fond.hidden = false;
  fermer.focus();
}

function fermerModale() {
  fond.hidden = true;
  ouvrir.focus();
}

ouvrir.addEventListener("click", ouvrirModale);
fermer.addEventListener("click", fermerModale);
`;

const ONGLETS_BODY = `<div role="tablist">
  <button class="onglet" role="tab" data-cible="p1">Présentation</button>
  <button class="onglet" role="tab" data-cible="p2">Tarifs</button>
  <button class="onglet" role="tab" data-cible="p3">Contact</button>
</div>
<div class="panneau" id="p1" role="tabpanel" hidden>Nous fabriquons des sites web.</div>
<div class="panneau" id="p2" role="tabpanel" hidden>À partir de 500 €.</div>
<div class="panneau" id="p3" role="tabpanel" hidden>contact@exemple.fr</div>`;
const ONGLETS_CSS = `.onglet { padding: 8px 14px; border: 1px solid #99c; background: #eef; cursor: pointer; }
.onglet.actif { background: white; font-weight: bold; }
.panneau { border: 1px solid #99c; padding: 12px; margin-top: -1px; }`;

const TACHES_CSS = `li { display: flex; justify-content: space-between; padding: 6px 8px; margin: 3px 0; background: #eef; cursor: pointer; }
li.fait { text-decoration: line-through; color: gray; }
.supprimer { border: 0; background: transparent; color: crimson; cursor: pointer; }
ul { list-style: none; padding: 0; }`;

const EXERCISES = [
  // ═════════════ Les variables ═════════════
  {
    id: "var-1", lesson: "variables", notion: "let et const", type: "qcm", label: "Trouver l’erreur", difficulty: 1,
    question: "Ce code provoque une erreur. Quelle ligne est en cause ?",
    code: `const a = 5;
let b = 5;
b = 6;
a = 6;`,
    options: ["Ligne 1", "Ligne 2", "Ligne 3", "Ligne 4"],
    answer: 3,
    why: [
      "La ligne 1 crée la constante `a` : l’écriture est correcte.",
      "La ligne 2 crée `b` avec `let` : aucun problème.",
      "`b` a été créée avec `let` : on a le droit de changer sa valeur.",
    ],
    hints: [
      "Cherche la ligne qui essaie de changer une variable qui existe déjà.",
      "Une variable créée avec `const` ne peut pas être modifiée. Lesquelles sont des `const` ?",
      "`a` est une `const`. Quelle ligne essaie de lui donner une nouvelle valeur ?",
    ],
    explanation: "La ligne 4 (`a = 6;`) essaie de changer une constante : JavaScript répond `TypeError: Assignment to constant variable`. La ligne 3 est valide car `b` a été créée avec `let`.",
    retain: "`const` = valeur fixe, `let` = valeur modifiable.",
  },
  {
    id: "var-2", lesson: "variables", notion: "let et const", type: "vf", difficulty: 1,
    statement: "Ce code fonctionne sans erreur : `let age = 20; age = 21;`",
    answer: true,
    why: "Avec `let`, on peut changer la valeur d’une variable autant de fois qu’on veut. Il suffit de ne pas répéter `let` à la deuxième ligne.",
    hints: [
      "Regarde avec quel mot-clé `age` est créée.",
      "`let` autorise le changement de valeur.",
      "La deuxième instruction n’a pas de `let` : elle modifie la variable qui existe déjà. C’est correct.",
    ],
    explanation: "`age` est créée avec `let` : on peut lui donner une nouvelle valeur. Après la deuxième ligne, `age` vaut 21.",
    retain: "Pour modifier une variable existante, on écrit juste `nom = nouvelleValeur;`.",
  },
  {
    id: "var-3", lesson: "variables", notion: "let et const", type: "fill", difficulty: 1,
    question: "Complète avec `let` ou `const` : `prix` ne changera jamais, `stock` va diminuer.",
    template: `___ prix = 10;
___ stock = 5;
stock = stock - 1;
console.log(stock);`,
    answers: ["const", "let"],
    why: ["Une valeur qui ne change jamais se déclare avec `const`.", "`stock` est modifié à la ligne 3 : il faut `let`."],
    hints: [
      "Pour chaque variable, demande-toi : est-ce que sa valeur va changer ?",
      "`prix` reste à 10. `stock` est modifié à la ligne 3.",
      "Le premier trou est `const`, le second est `let`.",
    ],
    explanation: "`prix` reste à 10 : `const`. `stock` passe de 5 à 4 : `let`. Avec `const stock`, la ligne 3 provoquerait une erreur.",
    retain: "Par défaut `const` ; `let` seulement si la valeur change.",
  },
  {
    id: "var-4", lesson: "variables", notion: "let et const", type: "code", difficulty: 2,
    question: "Écris le code demandé dans l’éditeur : une constante `ville` valant \"Paris\", une variable `compteur` valant 0, puis ajoute 1 à `compteur`.",
    starter: `// 1. Crée une constante ville qui vaut "Paris"
// 2. Crée une variable compteur qui vaut 0
// 3. Ajoute 1 à compteur
`,
    tests: [
      { expr: "ville", expect: "Paris", label: "`ville` doit valoir \"Paris\"" },
      { expr: "compteur", expect: 1, label: "`compteur` doit valoir 1 à la fin" },
    ],
    mustContain: [
      { re: "const\\s+ville", msg: "`ville` ne doit jamais changer : déclare-la avec `const`." },
      { re: "let\\s+compteur", msg: "`compteur` va changer : déclare-le avec `let`." },
    ],
    solution: `const ville = "Paris";
let compteur = 0;
compteur = compteur + 1;`,
    hints: [
      "Une variable se crée avec un mot-clé, un nom, `=` et une valeur. Pense à `let` pour ce qui doit changer.",
      "Pour l’étape 3, la variable existe déjà : écris `compteur = compteur + 1;` sans `let`.",
      "Ligne 1 : `const ville = \"Paris\";`. Ligne 2 : `let compteur = 0;`.",
    ],
    explanation: "`ville` ne change pas : `const`. `compteur` change : `let`. À la fin, il vaut 0 + 1 = 1.",
    retain: "Crée avec `const` ou `let`, modifie sans mot-clé.",
  },

  // ═════════════ Les types de données ═════════════
  {
    id: "typ-1", lesson: "types", notion: "Types de données", type: "qcm", difficulty: 1,
    question: "Que renvoie `typeof \"42\"` ?",
    options: ["`\"number\"`", "`\"string\"`", "`\"boolean\"`", "`\"undefined\"`"],
    answer: 1,
    why: [
      "Un nombre s’écrit sans guillemets. Ici, `\"42\"` est entouré de guillemets.",
      "",
      "Un booléen vaut seulement `true` ou `false`.",
      "`undefined` désigne une variable sans valeur.",
    ],
    hints: [
      "Regarde ce qu’il y a autour du 42.",
      "Des guillemets indiquent du texte.",
      "Le type « texte » s’appelle `string`.",
    ],
    explanation: "Entre guillemets, `42` est du texte, pas un nombre : `typeof \"42\"` renvoie `\"string\"`.",
    retain: "Guillemets = `string`. Pas de guillemets = `number`.",
  },
  {
    id: "typ-2", lesson: "types", notion: "Types de données", type: "predict", difficulty: 2,
    question: "Qu’affiche ce code dans la console ?",
    code: `console.log("10" + 5);`,
    answers: ["105"],
    common: { "15": "Tu as additionné comme des nombres. Mais `\"10\"` est un texte (il y a des guillemets) : le `+` colle les deux valeurs." },
    hints: [
      "Regarde les guillemets autour de 10.",
      "Un texte + un nombre : JavaScript « colle » les deux au lieu de les additionner.",
      "Le résultat est `10` suivi de `5`, collés l’un à l’autre.",
    ],
    explanation: "`\"10\"` est un texte. Avec `+`, JavaScript convertit `5` en texte et colle : `\"105\"`.",
    retain: "Texte + nombre = texte collé.",
  },
  {
    id: "typ-3", lesson: "types", notion: "Types de données", type: "vf", difficulty: 1,
    statement: "`typeof 3.14` renvoie `\"decimal\"`.",
    answer: false,
    why: "JavaScript n’a qu’un seul type pour tous les nombres (entiers et décimaux) : `number`.",
    hints: [
      "Pense à la liste des types de base vue dans le cours.",
      "Il n’existe pas de type « decimal » : les nombres entiers et à virgule ont le même type.",
      "`typeof 3.14` renvoie `\"number\"`.",
    ],
    explanation: "Entiers et décimaux sont tous de type `number`.",
    retain: "Un seul type pour les nombres : `number`.",
  },
  {
    id: "typ-4", lesson: "types", notion: "Chaînes de caractères", type: "code", difficulty: 2,
    question: "Crée une variable `message` qui contient exactement : Bonjour Lina, tu as 30 ans. Utilise les variables `prenom` et `age` (pas de texte écrit « en dur » pour le prénom et l’âge).",
    starter: `const prenom = "Lina";
const age = 30;

// Crée la constante message ici
`,
    tests: [
      { expr: "message", expect: "Bonjour Lina, tu as 30 ans", label: "`message` doit valoir \"Bonjour Lina, tu as 30 ans\"" },
    ],
    mustContain: [
      { re: "message\\s*=[^;]*prenom", msg: "Utilise la variable `prenom` dans ta phrase." },
      { re: "message\\s*=[^;]*age", msg: "Utilise la variable `age` dans ta phrase." },
    ],
    solution: "const prenom = \"Lina\";\nconst age = 30;\n\nconst message = `Bonjour ${prenom}, tu as ${age} ans`;",
    hints: [
      "Il faut mélanger du texte fixe et des variables dans une seule phrase.",
      "Deux outils possibles : coller avec `+`, ou les accents graves avec `${...}`.",
      "Avec des accents graves : `Bonjour ${prenom}, tu as ${age} ans`, rangé dans `const message = ...;`.",
    ],
    explanation: "Les accents graves permettent d’écrire la phrase d’un seul bloc et d’y insérer les variables avec `${...}`. Avec `+`, ça marche aussi : `\"Bonjour \" + prenom + \", tu as \" + age + \" ans\"`.",
    retain: "`${variable}` dans des accents graves insère la valeur dans le texte.",
  },

  // ═════════════ Les opérateurs ═════════════
  {
    id: "op-1", lesson: "operateurs", notion: "Opérateurs", type: "predict", difficulty: 1,
    question: "Qu’affiche ce code ?",
    code: `console.log(10 % 3);`,
    answers: ["1"],
    common: { "3": "Tu as peut-être calculé la division (10 ÷ 3 ≈ 3,33). Le `%` donne le reste, pas le résultat." },
    hints: [
      "Le symbole `%` n’est pas un pourcentage ici.",
      "`%` donne le reste de la division entière.",
      "10 = 3 × 3 + ?",
    ],
    explanation: "10 = 3 × 3 + 1. Le reste est 1.",
    retain: "`a % b` = reste de la division de a par b.",
  },
  {
    id: "op-2", lesson: "operateurs", notion: "Opérateurs", type: "qcm", difficulty: 1,
    question: "Quel opérateur vérifie que deux valeurs sont égales, en valeur ET en type ?",
    options: ["`=`", "`==`", "`===`", "`=>`"],
    answer: 2,
    why: [
      "Un seul `=` range une valeur dans une variable : il ne compare pas.",
      "`==` compare mais convertit les types avant : `5 == \"5\"` donne `true`. Ce n’est pas la comparaison stricte.",
      "",
      "`=>` sert à écrire des fonctions fléchées.",
    ],
    hints: [
      "Il y a trois possibilités pour comparer, une seule est « stricte ».",
      "L’opérateur strict utilise plus de symboles `=` que les autres.",
      "Trois signes égal.",
    ],
    explanation: "`===` compare la valeur et le type : `5 === \"5\"` est faux.",
    retain: "Compare avec `===`, jamais avec un seul `=`.",
  },
  {
    id: "op-3", lesson: "operateurs", notion: "Opérateurs", type: "predict", difficulty: 2,
    question: "Qu’affiche ce code ? (une ligne par `console.log`)",
    code: `const a = 5;
const b = 3;
console.log(a > b && b > 4);
console.log(a - b === 2);`,
    rows: 2,
    answers: ["false\ntrue"],
    hints: [
      "Évalue chaque comparaison séparément avant de combiner.",
      "Ligne 3 : `a > b` est vrai, `b > 4` est faux. Que donne vrai ET faux ?",
      "Ligne 3 : `false`. Ligne 4 : 5 − 3 = 2, donc la comparaison est vraie.",
    ],
    explanation: "`a > b` → `true`, `b > 4` → `false`, donc `true && false` → `false`. Ensuite `5 - 3 === 2` → `true`.",
    retain: "`&&` n’est vrai que si les deux côtés sont vrais.",
  },
  {
    id: "op-4", lesson: "operateurs", notion: "Opérateurs", type: "code", difficulty: 2,
    question: "Crée une constante `estPair` qui vaut `true` si `nombre` est pair et `false` sinon. Utilise le reste de la division par 2.",
    starter: `const nombre = 17;

// Crée estPair ici
`,
    tests: [
      { expr: "estPair", expect: false, label: "17 n’est pas pair : `estPair` doit valoir `false`" },
    ],
    mustContain: [
      { re: "nombre\\s*%\\s*2", msg: "Utilise `nombre % 2` pour obtenir le reste de la division par 2." },
    ],
    solution: `const nombre = 17;

const estPair = nombre % 2 === 0;`,
    hints: [
      "Un nombre pair a un reste de 0 quand on le divise par 2.",
      "Le reste s’obtient avec `nombre % 2`. Compare-le à 0.",
      "`const estPair = nombre % 2 === 0;`",
    ],
    explanation: "`nombre % 2` vaut 1 pour 17. `1 === 0` est faux, donc `estPair` vaut `false`. Pour 14, le reste serait 0 et le résultat `true`.",
    retain: "`% 2 === 0` teste la parité.",
  },

  // ═════════════ Les conditions ═════════════
  {
    id: "cond-1", lesson: "conditions", notion: "if / else", type: "predict", difficulty: 1,
    question: "Qu’affiche ce code ?",
    code: `const temperature = 25;
if (temperature > 30) {
  console.log("Chaud");
} else if (temperature > 20) {
  console.log("Doux");
} else {
  console.log("Froid");
}`,
    answers: ["Doux"],
    common: { "Chaud": "25 n’est pas supérieur à 30 : le premier bloc est ignoré.", "Froid": "Le `else` n’est lu que si aucune condition précédente n’est vraie, mais `25 > 20` est vrai." },
    hints: [
      "Teste les conditions dans l’ordre, de haut en bas.",
      "25 > 30 est faux. 25 > 20 est ... ?",
      "Le deuxième bloc s’exécute et JavaScript ignore le reste.",
    ],
    explanation: "25 n’est pas > 30. Mais 25 > 20 : on affiche `Doux` et on s’arrête là.",
    retain: "Le premier cas vrai est le seul exécuté.",
  },
  {
    id: "cond-2", lesson: "conditions", notion: "if / else", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "On veut afficher un message seulement si `age` vaut 18, mais le code ne se comporte pas bien. Quelle est l’erreur ?",
    code: `let age = 18;
if (age = 18) {
  console.log("Tu as 18 ans");
}`,
    options: [
      "Il manque un `else`.",
      "Il faut `age === 18` : `=` range une valeur, il ne compare pas.",
      "Les accolades sont inutiles.",
      "`let` est interdit dans un `if`.",
    ],
    answer: 1,
    why: [
      "Un `else` est facultatif : le problème est ailleurs.",
      "",
      "Les accolades sont correctes.",
      "Ici `let` est utilisé avant le `if`, ce qui est autorisé.",
    ],
    hints: [
      "Regarde la condition entre parenthèses, signe par signe.",
      "Dans une condition, on veut comparer. Quel signe sert à comparer ?",
      "Il faut remplacer `=` par `===`.",
    ],
    explanation: "`age = 18` range 18 dans `age` (et la condition est toujours vraie). Pour tester l’égalité, on écrit `age === 18`.",
    retain: "`=` range, `===` compare.",
  },
  {
    id: "cond-3", lesson: "conditions", notion: "if / else", type: "fill", difficulty: 1,
    question: "Complète la structure `if` / `else`.",
    template: `const age = 20;
___ (age >= 18) {
  console.log("Majeur");
} ___ {
  console.log("Mineur");
}`,
    answers: ["if", "else"],
    why: ["Le test commence par le mot-clé `if`.", "Le cas « sinon » s’écrit `else`."],
    hints: [
      "Le premier mot lance un test. Le second gère le cas contraire.",
      "Le test : « si ». Le cas contraire : « sinon », en anglais.",
      "`if` puis `else`.",
    ],
    explanation: "`if (condition) { ... } else { ... }` : le premier bloc si la condition est vraie, le second sinon.",
    retain: "`if` : si. `else` : sinon.",
  },
  {
    id: "cond-4", lesson: "conditions", notion: "if / else", type: "code", difficulty: 2,
    question: "Si `temperature` est inférieure à 10, `tenue` doit valoir \"manteau\" ; sinon, \"t-shirt\". Écris le `if` / `else`.",
    starter: `const temperature = 5;
let tenue;

// Écris le if / else ici
`,
    tests: [
      { expr: "tenue", expect: "manteau", label: "avec 5 degrés, `tenue` doit valoir \"manteau\"" },
    ],
    mustContain: [
      { re: "if\\s*\\(", msg: "Utilise un `if (...) { ... }`." },
    ],
    solution: `const temperature = 5;
let tenue;

if (temperature < 10) {
  tenue = "manteau";
} else {
  tenue = "t-shirt";
}`,
    hints: [
      "Il faut une condition qui compare `temperature` à 10.",
      "Dans chaque bloc, on range une valeur dans `tenue` (sans `let`, la variable existe déjà).",
      "`if (temperature < 10) { tenue = \"manteau\"; } else { tenue = \"t-shirt\"; }`",
    ],
    explanation: "5 < 10 est vrai, le premier bloc s’exécute : `tenue` vaut `\"manteau\"`.",
    retain: "On peut ranger une valeur différente dans une variable selon une condition.",
  },

  // ═════════════ Les boucles ═════════════
  {
    id: "loop-1", lesson: "boucles", notion: "Boucles for et while", type: "predict", difficulty: 1,
    question: "Qu’affiche ce code ? (une valeur par ligne)",
    code: `for (let i = 0; i < 3; i++) {
  console.log(i);
}`,
    rows: 3,
    answers: ["0\n1\n2"],
    common: { "1\n2\n3": "La boucle commence à `i = 0`, pas à 1. Et elle s’arrête avant 3 car `i < 3`." },
    hints: [
      "Regarde la valeur de départ de `i`.",
      "`i` vaut 0, puis 1, puis 2. Quand il vaut 3, la condition `i < 3` est fausse.",
      "Les trois lignes affichées sont 0, 1 et 2.",
    ],
    explanation: "Tour 1 : `i = 0`. Tour 2 : `i = 1`. Tour 3 : `i = 2`. Puis `i = 3` : la condition `i < 3` est fausse, on sort.",
    retain: "`i < 3` s’arrête avant 3.",
  },
  {
    id: "loop-2", lesson: "boucles", notion: "Boucles for et while", type: "qcm", difficulty: 2,
    question: "Combien de fois s’exécute le contenu de cette boucle : `for (let i = 1; i < 5; i++)` ?",
    options: ["3 fois", "4 fois", "5 fois", "Pour toujours"],
    answer: 1,
    why: [
      "Essaie de lister les valeurs de `i` : 1, 2, ... jusqu’à ce que la condition soit fausse.",
      "",
      "Pour 5 tours, il faudrait `i <= 5`. Ici, `i < 5` exclut 5.",
      "`i` augmente à chaque tour : la condition finit par être fausse.",
    ],
    hints: [
      "Liste les valeurs de `i` tour par tour.",
      "`i` vaut 1, 2, 3, 4, ... et la boucle s’arrête quand `i < 5` devient faux.",
      "Les valeurs possibles sont 1, 2, 3 et 4.",
    ],
    explanation: "`i` prend les valeurs 1, 2, 3, 4. Quand il vaut 5, `5 < 5` est faux : on s’arrête. Cela fait 4 tours.",
    retain: "De 1 à `< 5` : 4 tours. De 1 à `<= 5` : 5 tours.",
  },
  {
    id: "loop-3", lesson: "boucles", notion: "Boucles for et while", type: "fill", difficulty: 2,
    question: "Complète cette boucle pour afficher 1, 2 puis 3.",
    template: `for (let i = 1; ___ <= 3; ___) {
  console.log(i);
}`,
    answers: ["i", ["i++", "i += 1", "i = i + 1", "++i"]],
    why: ["La condition doit tester la variable `i`.", "Après chaque tour, `i` doit augmenter de 1."],
    hints: [
      "Il y a deux trous : la condition et le pas.",
      "La condition compare le compteur à 3. Le pas fait avancer le compteur.",
      "Premier trou : `i`. Second trou : `i++`.",
    ],
    explanation: "La condition `i <= 3` garde la boucle active tant que `i` ne dépasse pas 3. Le pas `i++` ajoute 1 à chaque tour.",
    retain: "`for (départ; condition; pas)`.",
  },
  {
    id: "loop-4", lesson: "boucles", notion: "Boucles for et while", type: "code", difficulty: 2,
    question: "Avec une boucle, calcule dans `total` la somme des nombres de 1 à 10.",
    starter: `let total = 0;

// Écris ta boucle ici
`,
    tests: [
      { expr: "total", expect: 55, label: "`total` doit valoir 55 (1 + 2 + ... + 10)" },
    ],
    mustContain: [
      { re: "for\\s*\\(|while\\s*\\(", msg: "Utilise une boucle `for` ou `while`." },
    ],
    solution: `let total = 0;

for (let i = 1; i <= 10; i++) {
  total = total + i;
}`,
    hints: [
      "Il faut répéter une addition 10 fois, avec un compteur qui va de 1 à 10.",
      "À chaque tour, ajoute le compteur à `total`.",
      "`for (let i = 1; i <= 10; i++) { total = total + i; }`",
    ],
    explanation: "Chaque tour ajoute `i` à `total` : 1, puis 1 + 2, puis 3 + 3… jusqu’à 55. On utilise `<= 10` pour inclure le 10.",
    retain: "Une variable créée avant la boucle peut accumuler un résultat.",
  },

  // ═════════════ Les fonctions ═════════════
  {
    id: "fn-1", lesson: "fonctions", notion: "Fonctions et return", type: "qcm", difficulty: 1,
    question: "Que renvoie une fonction qui n’a pas de `return` ?",
    options: ["`0`", "`null`", "`undefined`", "Une erreur"],
    answer: 2,
    why: [
      "JavaScript ne choisit pas `0` par défaut.",
      "`null` doit être écrit volontairement.",
      "",
      "Appeler une fonction sans `return` est autorisé : il n’y a pas d’erreur.",
    ],
    hints: [
      "La fonction s’exécute normalement, mais ne renvoie rien de précis.",
      "Une variable sans valeur vaut ... ?",
      "Le résultat est `undefined`.",
    ],
    explanation: "Sans `return`, la fonction renvoie `undefined` : « pas de valeur ».",
    retain: "Pas de `return` = `undefined`.",
  },
  {
    id: "fn-2", lesson: "fonctions", notion: "Fonctions et return", type: "predict", difficulty: 2,
    question: "Qu’affiche ce code ?",
    code: `function doubler(n) {
  return n * 2;
}
console.log(doubler(4) + 1);`,
    answers: ["9"],
    common: { "8": "Tu as oublié le `+ 1` : `doubler(4)` donne 8, puis on ajoute 1.", "10": "On double 4 (8) puis on ajoute 1, pas 2." },
    hints: [
      "Commence par calculer ce que renvoie `doubler(4)`.",
      "`doubler(4)` vaut 8. Ensuite, on ajoute 1.",
      "8 + 1 = ?",
    ],
    explanation: "`doubler(4)` renvoie 8. Puis `8 + 1` donne 9.",
    retain: "Un appel de fonction est remplacé par la valeur qu’elle renvoie.",
  },
  {
    id: "fn-3", lesson: "fonctions", notion: "Fonctions et return", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "On attend 5 dans la console, mais on obtient `undefined`. Pourquoi ?",
    code: `function addition(a, b) {
  a + b;
}
console.log(addition(2, 3));`,
    options: [
      "La fonction ne contient pas de `return` : elle ne renvoie rien.",
      "Il faut écrire `add` au lieu de `addition`.",
      "Les paramètres `a` et `b` sont interdits.",
      "`console.log` ne peut pas afficher une fonction.",
    ],
    answer: 0,
    why: [
      "",
      "Le nom d’une fonction est libre.",
      "Les paramètres sont tout à fait autorisés.",
      "Ici on n’affiche pas la fonction, mais le résultat de son appel.",
    ],
    hints: [
      "Regarde ce que fait la ligne 2 avec le résultat de `a + b`.",
      "Le calcul est fait, mais le résultat n’est transmis à personne.",
      "Il faut écrire `return a + b;`.",
    ],
    explanation: "`a + b;` calcule 5 puis jette le résultat. Pour le renvoyer au code qui appelle la fonction, il faut `return a + b;`.",
    retain: "`return` renvoie un résultat ; sans lui, la fonction renvoie `undefined`.",
  },
  {
    id: "fn-4", lesson: "fonctions", notion: "Fonctions et return", type: "code", difficulty: 2,
    question: "Écris une fonction `carre(n)` qui renvoie le carré de `n` (n multiplié par lui-même).",
    starter: `// Écris la fonction carre ici
`,
    tests: [
      { expr: "carre(3)", expect: 9, label: "`carre(3)` doit renvoyer 9" },
      { expr: "carre(5)", expect: 25, label: "`carre(5)` doit renvoyer 25" },
      { expr: "carre(0)", expect: 0, label: "`carre(0)` doit renvoyer 0" },
    ],
    mustContain: [],
    solution: `function carre(n) {
  return n * n;
}`,
    hints: [
      "Une fonction se définit avec `function nom(paramètre) { ... }`.",
      "Elle doit renvoyer un résultat avec `return`.",
      "`function carre(n) { return n * n; }`",
    ],
    explanation: "Le paramètre `n` reçoit la valeur de l’appel (3, 5, 0…). `return n * n;` renvoie son carré.",
    retain: "paramètre → calcul → `return`.",
  },

  // ═════════════ Les tableaux ═════════════
  {
    id: "arr-1", lesson: "tableaux", notion: "Tableaux", type: "predict", difficulty: 1,
    question: "Qu’affiche ce code ?",
    code: `const couleurs = ["rouge", "vert", "bleu"];
console.log(couleurs[1]);`,
    answers: ["vert"],
    common: { "rouge": "`couleurs[0]` donne le premier élément. Ici l’index est 1, donc le deuxième.", "bleu": "L’index 2 donnerait `bleu`. Ici l’index est 1." },
    hints: [
      "Rappelle-toi que les index commencent à 0.",
      "L’index 0 est `rouge`. L’index 1 est ... ?",
      "Le deuxième élément du tableau.",
    ],
    explanation: "Index 0 : `rouge`, index 1 : `vert`, index 2 : `bleu`.",
    retain: "Le premier index d’un tableau est 0.",
  },
  {
    id: "arr-2", lesson: "tableaux", notion: "Tableaux", type: "qcm", difficulty: 2,
    question: "Un tableau `jours` contient 5 éléments. Quel est l’index du dernier élément ?",
    options: ["`5`", "`4`", "`6`", "`jours.length`"],
    answer: 1,
    why: [
      "Les index vont de 0 à 4 pour 5 éléments : il n’y a rien à l’index 5.",
      "",
      "Ce serait un 7e élément.",
      "`jours.length` vaut 5, c’est le nombre d’éléments, pas un index valide.",
    ],
    hints: [
      "Les index commencent à 0.",
      "Pour 5 éléments, les index sont 0, 1, 2, 3 et ... ?",
      "Le dernier index est `length - 1`.",
    ],
    explanation: "Index 0, 1, 2, 3, 4 : cinq éléments. Le dernier index est 4, soit `jours.length - 1`.",
    retain: "Dernier index = `length - 1`.",
  },
  {
    id: "arr-3", lesson: "tableaux", notion: "Tableaux", type: "predict", difficulty: 1,
    question: "Qu’affiche ce code ?",
    code: `const nombres = [1, 2];
nombres.push(3);
console.log(nombres.length);`,
    answers: ["3"],
    common: { "2": "Tu as oublié le `push(3)` : il ajoute un élément, donc il y en a maintenant 3." },
    hints: [
      "Que fait `push` ?",
      "`push(3)` ajoute 3 à la fin du tableau.",
      "Le tableau est maintenant `[1, 2, 3]`. Combien d’éléments ?",
    ],
    explanation: "`push(3)` ajoute un élément : le tableau devient `[1, 2, 3]` et sa longueur est 3.",
    retain: "`push` ajoute à la fin, `length` compte les éléments.",
  },
  {
    id: "arr-4", lesson: "tableaux", notion: "Tableaux", type: "code", difficulty: 3,
    question: "Avec `filter`, crée un tableau `pairs` qui ne contient que les nombres pairs de `nombres`.",
    starter: `const nombres = [1, 2, 3, 4, 5];

// Crée pairs ici avec filter
`,
    tests: [
      { expr: "pairs", expect: [2, 4], label: "`pairs` doit valoir [2, 4]" },
    ],
    mustContain: [
      { re: "\\.filter\\(", msg: "Utilise la méthode `filter`." },
    ],
    solution: `const nombres = [1, 2, 3, 4, 5];

const pairs = nombres.filter((n) => n % 2 === 0);`,
    hints: [
      "`filter` garde seulement les éléments pour lesquels le test est vrai.",
      "Le test d’un nombre pair : `n % 2 === 0`. N’oublie pas de ranger le résultat dans `pairs`.",
      "`const pairs = nombres.filter((n) => n % 2 === 0);`",
    ],
    explanation: "`filter` appelle la fonction pour chaque élément et garde ceux pour lesquels elle renvoie `true`. Seuls 2 et 4 ont un reste de 0.",
    retain: "`filter` renvoie un nouveau tableau avec les éléments qui passent le test.",
  },

  // ═════════════ Les objets ═════════════
  {
    id: "obj-1", lesson: "objets", notion: "Objets", type: "predict", difficulty: 1,
    question: "Qu’affiche ce code ?",
    code: `const voiture = { marque: "Renault", annee: 2020 };
console.log(voiture.marque);`,
    answers: ["Renault"],
    hints: [
      "L’objet contient deux paires clé : valeur.",
      "On lit une propriété avec un point : `voiture.marque`.",
      "La valeur associée à la clé `marque`.",
    ],
    explanation: "`voiture.marque` lit la valeur de la clé `marque` : `Renault`.",
    retain: "`objet.cle` lit une propriété.",
  },
  {
    id: "obj-2", lesson: "objets", notion: "Objets", type: "vf", difficulty: 2,
    statement: "Avec `const eleve = { age: 17 };`, écrire `eleve.age = 18;` provoque une erreur.",
    answer: false,
    why: "`const` empêche de remplacer l’objet entier par un autre, mais on peut modifier ses propriétés.",
    hints: [
      "Que protège exactement `const` : la variable, ou le contenu ?",
      "`const` empêche de réaffecter `eleve = ...`, pas de modifier ce qu’il y a dedans.",
      "Changer `eleve.age` est autorisé.",
    ],
    explanation: "On ne remplace pas la variable `eleve` : on modifie une propriété de l’objet qu’elle contient. C’est autorisé.",
    retain: "Un `const` objet ou tableau peut être modifié, pas remplacé.",
  },
  {
    id: "obj-3", lesson: "objets", notion: "Objets", type: "fill", difficulty: 2,
    question: "Complète pour afficher le titre, puis changer l’année.",
    template: `const livre = { titre: "Dune", annee: 1965 };
console.log(livre___titre);
livre.annee ___ 1966;`,
    answers: [".", "="],
    why: ["Pour lire une propriété, on écrit `objet.propriete`.", "Pour donner une nouvelle valeur, on utilise `=`."],
    hints: [
      "Premier trou : un seul caractère pour accéder à une propriété. Second trou : un seul caractère pour ranger une valeur.",
      "On accède à une propriété avec un point.",
      "Premier trou : `.` Second trou : `=`.",
    ],
    explanation: "`livre.titre` lit la propriété ; `livre.annee = 1966;` la remplace.",
    retain: "Lire : `objet.cle`. Modifier : `objet.cle = valeur`.",
  },
  {
    id: "obj-4", lesson: "objets", notion: "Objets", type: "code", difficulty: 3,
    question: "Crée un objet `profil` avec `prenom: \"Alex\"` et `age: 20`, puis ajoute-lui une propriété `ville` qui vaut \"Nantes\".",
    starter: `// 1. Crée l’objet profil
// 2. Ajoute la propriété ville
`,
    tests: [
      { expr: "profil.prenom", expect: "Alex", label: "`profil.prenom` doit valoir \"Alex\"" },
      { expr: "profil.age", expect: 20, label: "`profil.age` doit valoir 20" },
      { expr: "profil.ville", expect: "Nantes", label: "`profil.ville` doit valoir \"Nantes\"" },
    ],
    mustContain: [],
    solution: `const profil = { prenom: "Alex", age: 20 };
profil.ville = "Nantes";`,
    hints: [
      "Un objet s’écrit avec des accolades et des paires `cle: valeur`.",
      "Pour ajouter une propriété : `profil.ville = ...;`",
      "`const profil = { prenom: \"Alex\", age: 20 };` puis `profil.ville = \"Nantes\";`",
    ],
    explanation: "On crée l’objet avec ses deux propriétés, puis on ajoute `ville` en lui donnant une valeur : la clé est créée automatiquement.",
    retain: "Affecter une propriété qui n’existe pas la crée.",
  },

  // ═════════════ La portée ═════════════
  {
    id: "scope-1", lesson: "portee", notion: "Portée des variables", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Quelle ligne provoque une erreur ?",
    code: `function afficher() {
  const secret = "42";
  console.log(secret);
}
afficher();
console.log(secret);`,
    options: ["Ligne 2", "Ligne 3", "Ligne 5", "Ligne 6"],
    answer: 3,
    why: [
      "La ligne 2 crée la variable dans la fonction : correct.",
      "À la ligne 3, on est encore dans la fonction : `secret` existe.",
      "L’appel de la fonction est correct.",
    ],
    hints: [
      "Où existe la variable `secret` ?",
      "Elle est créée dans la fonction : elle n’existe que dedans.",
      "La dernière ligne essaie de lire `secret` en dehors de la fonction.",
    ],
    explanation: "`secret` n’existe que dans la fonction. La ligne 6 est en dehors : `ReferenceError: secret is not defined`.",
    retain: "Une variable de fonction n’est pas visible en dehors.",
  },
  {
    id: "scope-2", lesson: "portee", notion: "Portée des variables", type: "predict", difficulty: 2,
    question: "Qu’affiche ce code ?",
    code: `let x = 1;
if (true) {
  let x = 2;
}
console.log(x);`,
    answers: ["1"],
    common: { "2": "Le `let x = 2` crée une autre variable, qui n’existe que dans le `if`. Celle de l’extérieur n’a pas changé." },
    hints: [
      "Combien de variables `x` existent ici ?",
      "Il y en a deux : une dehors, une dans le bloc `if`.",
      "Le `console.log` est en dehors du bloc : il lit la première.",
    ],
    explanation: "Le `x` du bloc `if` est une autre variable. Après le bloc, il disparaît. Le `console.log` lit le `x` extérieur : 1.",
    retain: "Une variable de bloc ne change pas une variable du même nom à l’extérieur.",
  },
  {
    id: "scope-3", lesson: "portee", notion: "Portée des variables", type: "vf", difficulty: 1,
    statement: "Une variable créée avec `let` dans un bloc `if` est accessible après ce bloc.",
    answer: false,
    why: "`let` et `const` ont une portée de bloc : la variable n’existe qu’entre les accolades du `if`.",
    hints: [
      "Pense aux accolades `{ }` du `if`.",
      "Avec `let` et `const`, la variable reste dans ses accolades.",
      "Après le bloc, elle n’existe plus.",
    ],
    explanation: "La variable est supprimée à la fermeture de l’accolade. Pour l’utiliser après, il faut la créer avant le `if`.",
    retain: "`let` et `const` : portée de bloc.",
  },
  // ═════════════ NIVEAU 2 — Le navigateur ═════════════
  {
    id: "nav-1", lesson: "navigateur", notion: "Le navigateur", type: "qcm", difficulty: 1,
    question: "Dans quel ordre le navigateur travaille-t-il quand il charge une page ?",
    options: [
      "Il affiche la page, puis il télécharge le HTML.",
      "Il télécharge le HTML, le lit de haut en bas (DOM), charge le CSS et le JavaScript demandés, puis réagit aux actions.",
      "Il exécute d’abord tout le JavaScript, puis il lit le HTML.",
      "Il lit seulement le CSS : le HTML est facultatif.",
    ],
    answer: 1,
    why: [
      "Sans HTML, il n’y a rien à afficher : il faut d’abord le télécharger.",
      "",
      "Le JavaScript est exécuté quand le navigateur rencontre la balise `<script>`, pas avant d’avoir commencé à lire le HTML.",
      "Le HTML est le point de départ : sans lui, il n’y a pas de page.",
    ],
    hints: [
      "Que faut-il avoir avant de pouvoir afficher quoi que ce soit ?",
      "Le point de départ est le fichier HTML. Il indique ensuite quels fichiers CSS et JavaScript charger.",
      "L’ordre : HTML téléchargé → lu de haut en bas (DOM) → CSS et JavaScript chargés → page affichée → réaction aux actions.",
    ],
    explanation: "Le HTML est le point de départ. En le lisant de haut en bas, le navigateur construit le DOM et charge au passage les fichiers CSS et JavaScript. Il affiche la page, puis attend les actions de la personne.",
    retain: "HTML d’abord : il décide de tout le reste.",
  },
  {
    id: "nav-2", lesson: "navigateur", notion: "Le navigateur", type: "fill", difficulty: 1, language: "text",
    question: "Complète le rôle de chaque langage avec un mot : structure, apparence ou comportement.",
    template: `HTML : la ___ de la page
CSS : l’___ de la page
JavaScript : le ___ de la page`,
    answers: [["structure", "contenu"], ["apparence", "aspect", "style"], ["comportement", "fonctionnement"]],
    why: [
      "Le HTML décrit ce que contient la page : titres, paragraphes, boutons… sa structure.",
      "Le CSS s’occupe des couleurs, des tailles, de la mise en page : l’apparence.",
      "JavaScript fait réagir la page : c’est son comportement.",
    ],
    hints: [
      "Trois mots à placer : structure, apparence, comportement.",
      "Le CSS donne les couleurs et les tailles. Le JavaScript fait réagir la page.",
      "HTML : structure. CSS : apparence. JavaScript : comportement.",
    ],
    explanation: "HTML = structure, CSS = apparence, JavaScript = comportement. Les trois travaillent ensemble sur la même page.",
    retain: "Structure, apparence, comportement.",
  },
  {
    id: "nav-3", lesson: "navigateur", notion: "Le navigateur", type: "qcm", difficulty: 2,
    question: "Qu’est-ce que le DOM ?",
    options: [
      "Un langage de programmation.",
      "Une représentation de la page sous forme d’arbre d’éléments, que JavaScript peut lire et modifier.",
      "Un fichier CSS.",
      "Le nom du serveur qui envoie la page.",
    ],
    answer: 1,
    why: [
      "Le DOM n’est pas un langage : c’est une structure construite par le navigateur.",
      "",
      "Le CSS est un langage de style. Le DOM, lui, représente les éléments de la page.",
      "Le serveur envoie le HTML. Le DOM est construit ensuite, dans le navigateur.",
    ],
    hints: [
      "Le navigateur le construit en lisant le HTML.",
      "Pense à un arbre : la page est la racine, les éléments sont les branches.",
      "C’est l’arbre des éléments de la page, que JavaScript peut lire et modifier.",
    ],
    explanation: "En lisant le HTML, le navigateur construit le DOM : un arbre où chaque élément est un nœud. JavaScript passe par le DOM pour lire et modifier la page.",
    retain: "DOM = l’arbre des éléments de la page.",
  },
  {
    id: "nav-4", lesson: "navigateur", notion: "Le navigateur", type: "vf", difficulty: 1,
    statement: "Le JavaScript d’une page web s’exécute dans le navigateur de la personne qui visite la page.",
    answer: true,
    why: "C’est bien le navigateur du visiteur qui exécute le code : on parle de JavaScript « côté client ».",
    hints: [
      "Qui télécharge la page et la lit ?",
      "Le navigateur de la personne qui visite la page lit le HTML… et exécute le JavaScript.",
      "Donc l’affirmation est vraie.",
    ],
    explanation: "Le serveur envoie les fichiers ; ensuite, c’est le navigateur du visiteur qui exécute le JavaScript.",
    retain: "Le JavaScript d’une page tourne chez le visiteur.",
  },

  // ═════════════ NIVEAU 2 — Relier JavaScript à HTML ═════════════
  {
    id: "int-1", lesson: "integrer", notion: "Relier un script", type: "fill", difficulty: 1, language: "html",
    question: "Complète la balise qui relie le fichier `script.js` à la page.",
    template: `<body>
  <h1>Salut</h1>
  <___ ___="script.js"></___>
</body>`,
    answers: ["script", "src", "script"],
    why: ["La balise s’appelle `script`.", "L’attribut qui donne le chemin du fichier s’appelle `src`.", "La balise ouvrante et la balise fermante portent le même nom."],
    hints: [
      "Il y a trois trous : le nom de la balise (deux fois) et le nom d’un attribut.",
      "L’attribut indique la source du fichier : trois lettres, comme dans « source ».",
      "`<script src=\"script.js\"></script>`",
    ],
    explanation: "`<script src=\"script.js\"></script>` : la balise `script`, avec l’attribut `src` qui donne le chemin du fichier, puis la balise fermante.",
    retain: "`<script src=\"fichier.js\"></script>`",
  },
  {
    id: "int-2", lesson: "integrer", notion: "Relier un script", type: "qcm", difficulty: 2,
    question: "Le script ci-dessous contient `document.body.style.color = \"red\";`. Il est placé dans le `<head>`, sans `defer`. Que se passe-t-il ?",
    code: `<head>
  <script src="script.js"></script>
</head>
<body>
  <h1>Salut</h1>
</body>`,
    options: [
      "Le texte devient rouge normalement.",
      "Une erreur : le body n’existe pas encore (il vaut null) quand le script s’exécute.",
      "Le navigateur attend automatiquement la fin de la page.",
      "Rien ne se passe : la balise est interdite dans le head.",
    ],
    answer: 1,
    why: [
      "Le navigateur lit de haut en bas : le `<body>` n’a pas encore été lu au moment où le script s’exécute.",
      "",
      "Il n’attend pas, sauf si on le lui demande avec `defer`.",
      "La balise est autorisée dans le head : c’est le moment d’exécution qui pose problème.",
    ],
    hints: [
      "Le navigateur lit le HTML de haut en bas. Où est le script par rapport au `<body>` ?",
      "Quand le script s’exécute, le `<body>` n’a pas encore été lu.",
      "`document.body` vaut `null`, et lire `.style` dessus provoque une erreur.",
    ],
    explanation: "Le script est exécuté dès qu’il est rencontré, donc avant le `<body>`. `document.body` vaut `null`, et `null.style` provoque une erreur. La solution : `defer`, ou placer le script en bas du body.",
    retain: "Un script lancé trop tôt ne voit pas encore la page.",
  },
  {
    id: "int-3", lesson: "integrer", notion: "Relier un script", type: "qcm", difficulty: 2,
    question: "Quel attribut permet de garder `<script src>` dans le `<head>`, tout en exécutant le script après la lecture de la page ?",
    options: ["`defer`", "`async`", "`wait`", "`after`"],
    answer: 0,
    why: [
      "",
      "`async` existe, mais il exécute le script dès qu’il est téléchargé, sans attendre la page : le problème reste possible.",
      "`wait` n’existe pas en HTML.",
      "`after` n’existe pas en HTML.",
    ],
    hints: [
      "Le nom signifie « différé » en anglais.",
      "Le script est téléchargé pendant la lecture de la page, puis exécuté à la fin.",
      "`<script src=\"script.js\" defer></script>`",
    ],
    explanation: "`defer` demande au navigateur de télécharger le fichier pendant la lecture de la page, mais de ne l’exécuter qu’une fois la page lue.",
    retain: "`defer` : exécuté après la lecture de la page.",
  },
  {
    id: "int-4", lesson: "integrer", notion: "Relier un script", type: "lab", difficulty: 2,
    question: "La page ne charge pas son script. Dans `index.html`, ajoute à la fin du body la balise qui relie `script.js`, puis exécute.",
    files: [
      { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Ma page</title>
</head>
<body>
  <h1>Bienvenue</h1>
  <!-- Ajoute la balise script ici -->
</body>
</html>` },
      { name: "script.js", code: `document.title = "Script relié !";
console.log("script.js est chargé");`, readOnly: true },
    ],
    tests: [
      { expr: "document.title", expect: "Script relié !", label: "Le titre de la page doit valoir \"Script relié !\"" },
    ],
    expectLogs: [
      { level: "log", text: "script.js est chargé", label: "La console doit afficher « script.js est chargé »." },
    ],
    mustContain: [
      { file: "index.html", re: "<script\\s+[^>]*src=[\"']script\\.js[\"']", msg: "Il manque la balise `<script src=\"script.js\"></script>` dans index.html." },
    ],
    solution: [
      { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Ma page</title>
</head>
<body>
  <h1>Bienvenue</h1>
  <script src="script.js"></script>
</body>
</html>` },
    ],
    hints: [
      "La balise qui relie un fichier JavaScript s’appelle `script`.",
      "Elle utilise l’attribut `src` pour donner le nom du fichier, et se ferme avec `</script>`.",
      "Remplace le commentaire par `<script src=\"script.js\"></script>`.",
    ],
    explanation: "Sans balise `<script>`, le navigateur ignore `script.js`. En la plaçant avant `</body>`, le script s’exécute une fois la page construite : il change le titre et écrit dans la console.",
    retain: "Un fichier JavaScript n’existe pour la page que s’il est relié avec `<script src>`.",
  },

  // ═════════════ NIVEAU 2 — La console ═════════════
  {
    id: "con-1", lesson: "console", notion: "Console du navigateur", type: "predict", difficulty: 1,
    question: "Qu’affiche ce code dans la console ?",
    code: `console.log("a =", 1 + 2, true);`,
    answers: ["a = 3 true"],
    common: { "a = 1 + 2 true": "`1 + 2` est calculé avant l’affichage : on voit son résultat, pas l’expression.", "a =3 true": "Les valeurs sont séparées par un espace : `a = 3 true`." },
    hints: [
      "`console.log` affiche toutes ses valeurs sur une seule ligne.",
      "`1 + 2` est calculé avant l’affichage. Les valeurs sont séparées par un espace.",
      "`a =`, puis 3, puis `true`.",
    ],
    explanation: "Les trois valeurs sont : le texte `a =`, le résultat de `1 + 2` (donc 3) et `true`. La console les affiche séparées par des espaces.",
    retain: "Plusieurs valeurs dans `console.log` = une ligne, séparées par des espaces.",
  },
  {
    id: "con-2", lesson: "console", notion: "Console du navigateur", type: "qcm", label: "Trouver l’erreur", difficulty: 1,
    question: "La console affiche `TypeError: console.Log is not a function`. Pourquoi ?",
    code: `const nom = "Léa";
console.Log("Bonjour " + nom);`,
    options: [
      "`console` n’existe pas dans un navigateur.",
      "JavaScript distingue les majuscules des minuscules : la méthode s’appelle `log`.",
      "Il manque un point-virgule.",
      "On ne peut pas afficher de texte dans la console.",
    ],
    answer: 1,
    why: [
      "`console` existe bien : l’erreur parle de `console.Log`, pas de `console`.",
      "",
      "Le point-virgule n’est pas le problème ici.",
      "On peut afficher du texte : c’est le rôle de `console.log`.",
    ],
    hints: [
      "Compare l’écriture de la méthode avec celle du cours.",
      "L’erreur dit que `console.Log` n’est pas une fonction. Regarde la première lettre de `Log`.",
      "Il faut écrire `console.log` avec un « l » minuscule.",
    ],
    explanation: "JavaScript distingue les majuscules des minuscules : `Log` n’existe pas, `log` oui. La méthode `console.Log` n’existe pas, d’où « is not a function ».",
    retain: "Majuscules et minuscules comptent : `console.log`.",
  },
  {
    id: "con-3", lesson: "console", notion: "Console du navigateur", type: "code", difficulty: 2,
    question: "Avec un seul `console.log`, affiche exactement : Total : 15. Utilise la variable `total`, sans écrire 15 à la main.",
    starter: `const total = 5 + 10;

// Affiche : Total : 15
`,
    tests: [],
    expectLogs: ["Total : 15"],
    mustContain: [
      { re: "console\\.log\\([^)]*total", msg: "Utilise la variable `total` dans ton `console.log`." },
    ],
    solution: `const total = 5 + 10;

console.log("Total :", total);`,
    hints: [
      "`console.log` accepte plusieurs valeurs séparées par des virgules.",
      "Une valeur est le texte `Total :`, l’autre est la variable `total`.",
      "`console.log(\"Total :\", total);`",
    ],
    explanation: "`console.log(\"Total :\", total)` affiche les deux valeurs séparées par un espace : `Total : 15`. On peut aussi concaténer : `\"Total : \" + total`.",
    retain: "`console.log(\"texte\", variable)` pour voir une valeur.",
  },
  {
    id: "con-4", lesson: "console", notion: "Console du navigateur", type: "lab", difficulty: 1,
    question: "Dans `script.js`, utilise `console.warn` pour afficher l’avertissement « Batterie faible », puis exécute.",
    files: [
      { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Console</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>`, readOnly: true },
      { name: "script.js", code: `// Écris ton console.warn ici
` },
    ],
    tests: [],
    expectLogs: [
      { level: "warn", text: "Batterie faible", label: "Il faut afficher « Batterie faible » avec `console.warn`." },
    ],
    mustContain: [],
    solution: [
      { name: "script.js", code: `console.warn("Batterie faible");` },
    ],
    hints: [
      "Il existe une méthode de `console` dédiée aux avertissements.",
      "Elle s’écrit comme `console.log`, mais avec un autre nom : un mot anglais qui signifie « avertir ».",
      "`console.warn(\"Batterie faible\");`",
    ],
    explanation: "`console.warn()` s’utilise comme `console.log()`, mais le message est présenté comme un avertissement (en jaune dans un vrai navigateur).",
    retain: "`log` pour afficher, `warn` pour avertir, `error` pour signaler une erreur.",
  },

  // ═════════════ NIVEAU 2 — window ═════════════
  {
    id: "win-1", lesson: "window", notion: "window", type: "vf", difficulty: 2,
    statement: "Si on écrit `let x = 1;` au niveau global d’un script, alors `window.x` vaut 1.",
    answer: false,
    why: "Seules les variables créées avec `var` (et les fonctions) deviennent des propriétés de `window`. `let` et `const` n’y sont pas ajoutées : `window.x` vaut `undefined`.",
    hints: [
      "Pense à la différence entre `var` et `let`.",
      "`var` au niveau global crée une propriété de `window`. Et `let` ?",
      "Avec `let`, `window.x` vaut `undefined`.",
    ],
    explanation: "`let` et `const` créent des variables globales qui ne sont pas des propriétés de `window`. Seul `var` (et les déclarations de fonction) y est ajouté.",
    retain: "`var` global → propriété de `window`. `let` et `const` → non.",
  },
  {
    id: "win-2", lesson: "window", notion: "window", type: "qcm", difficulty: 1,
    question: "Quelle instruction fait exactement la même chose que `console.log(\"a\")` ?",
    options: [
      "`window.console.log(\"a\")`",
      "`console.window.log(\"a\")`",
      "`document.console.log(\"a\")`",
      "`window.log(\"a\")`",
    ],
    answer: 0,
    why: [
      "",
      "`console` ne contient pas de `window` : c’est l’inverse.",
      "`console` appartient à `window`, pas à `document`.",
      "`log` est une méthode de `console`, pas de `window`.",
    ],
    hints: [
      "`console` est une propriété de l’objet global.",
      "Quel objet contient `console`, `document`, `alert`… ?",
      "`window.console.log(\"a\")`",
    ],
    explanation: "`console` est une propriété de `window`, donc `window.console.log(\"a\")` est identique à `console.log(\"a\")`.",
    retain: "Tout ce que fournit le navigateur est une propriété de `window`.",
  },
  {
    id: "win-3", lesson: "window", notion: "window", type: "predict", difficulty: 2, env: "browser",
    question: "Ce code est exécuté au niveau global d’une page web. Qu’affiche-t-il ?",
    code: `var a = 5;
let b = 6;
console.log(window.a, window.b);`,
    answers: ["5 undefined"],
    common: { "5 6": "Seul `var` crée une propriété de `window`. Pour `let b`, `window.b` n’existe pas.", "undefined undefined": "`var a` devient bien une propriété de `window` : `window.a` vaut 5." },
    hints: [
      "Compare `var a` et `let b`.",
      "`var` global devient une propriété de `window`, `let` non.",
      "`window.a` vaut 5 et `window.b` n’existe pas.",
    ],
    explanation: "`var a` crée la propriété `window.a` qui vaut 5. `let b` n’en crée pas : `window.b` vaut `undefined`. La console affiche donc `5 undefined`.",
    retain: "`var` global est visible dans `window` ; `let` non.",
  },
  {
    id: "win-4", lesson: "window", notion: "window", type: "lab", difficulty: 1,
    question: "Dans `script.js`, affiche une boîte de message qui dit « Bienvenue » avec `alert`, puis exécute.",
    files: [
      { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Alerte</title></head>
<body>
  <h1>Ma page</h1>
  <script src="script.js"></script>
</body>
</html>`, readOnly: true },
      { name: "script.js", code: `// Affiche un message de bienvenue avec alert
` },
    ],
    tests: [],
    expectLogs: [
      { level: "alert", text: "alert : Bienvenue", label: "Il faut afficher un `alert` avec le texte « Bienvenue »." },
    ],
    mustContain: [],
    solution: [
      { name: "script.js", code: `alert("Bienvenue");` },
    ],
    hints: [
      "Une fonction du navigateur affiche une boîte de message.",
      "Son nom est un mot anglais qui signifie « alerte ». Elle prend le texte à afficher entre parenthèses.",
      "`alert(\"Bienvenue\");`",
    ],
    explanation: "`alert(\"Bienvenue\")` demande au navigateur d’afficher une boîte de message. Dans l’atelier, elle s’écrit dans la console.",
    retain: "`alert(message)` affiche un message.",
  },

  // ═════════════ NIVEAU 2 — document ═════════════
  {
    id: "doc-1", lesson: "document", notion: "document", type: "qcm", difficulty: 1,
    question: "Quelle phrase est correcte ?",
    options: [
      "`window` est le contenu de la page, `document` est la fenêtre du navigateur.",
      "`document` est la page HTML chargée ; `window` est la fenêtre (l’onglet) qui la contient.",
      "`window` et `document` sont deux noms pour la même chose.",
      "`document` n’existe que dans les fichiers CSS.",
    ],
    answer: 1,
    why: [
      "C’est l’inverse : la fenêtre est `window`, la page est `document`.",
      "",
      "Ils sont liés (`window.document`), mais ils représentent deux choses différentes.",
      "`document` est un objet JavaScript du navigateur, pas du CSS.",
    ],
    hints: [
      "L’un est le contenant, l’autre est le contenu.",
      "`window` : taille, adresse, boîtes de dialogue. `document` : titre, éléments de la page.",
      "`document` est la page, `window` est la fenêtre qui la contient.",
    ],
    explanation: "`window` représente la fenêtre du navigateur ; `document` représente la page chargée à l’intérieur. On peut écrire `window.document`.",
    retain: "`window` = la fenêtre. `document` = la page.",
  },
  {
    id: "doc-2", lesson: "document", notion: "document", type: "predict", difficulty: 2, env: "browser",
    question: "Qu’affiche ce code dans une page web ?",
    code: `document.title = "Accueil";
const ancien = document.title;
document.title = "Contact";
console.log(ancien, document.title);`,
    answers: ["Accueil Contact"],
    common: { "Contact Contact": "`ancien` garde la valeur lue à la ligne 2 : `Accueil`. Changer le titre ensuite ne la modifie pas.", "Accueil Accueil": "Le titre est changé en `Contact` à la ligne 3, avant l’affichage." },
    hints: [
      "Suis la valeur de `document.title` ligne par ligne.",
      "`ancien` reçoit une copie du titre à la ligne 2. Elle ne change plus ensuite.",
      "`ancien` vaut `Accueil` et le titre vaut maintenant `Contact`.",
    ],
    explanation: "Ligne 1 : le titre devient `Accueil`. Ligne 2 : `ancien` en garde une copie. Ligne 3 : le titre devient `Contact`. On affiche donc `Accueil Contact`.",
    retain: "Une variable garde la valeur qu’elle a reçue, même si la propriété change ensuite.",
  },
  {
    id: "doc-3", lesson: "document", notion: "document", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Cette ligne provoque une erreur. Quelle est l’écriture correcte ?",
    code: `document.body.style.background-color = "red";`,
    options: [
      "`document.body.style.backgroundColor = \"red\";`",
      "`document.body.style.background_color = \"red\";`",
      "`document.body.style.BackgroundColor = \"red\";`",
      "`document.body.style[\"background color\"] = \"red\";`",
    ],
    answer: 0,
    why: [
      "",
      "Le tiret bas n’est pas utilisé dans les propriétés de style : cette propriété n’existerait pas.",
      "Les propriétés commencent par une minuscule : `backgroundColor`, pas `BackgroundColor`.",
      "Il n’y a pas d’espace dans le nom de la propriété.",
    ],
    hints: [
      "Le tiret est lu comme un signe moins : « background moins color ».",
      "En JavaScript, les propriétés CSS à plusieurs mots s’écrivent en camelCase.",
      "`backgroundColor` : minuscule au début, majuscule au début du deuxième mot.",
    ],
    explanation: "`background-color` serait lu comme `background - color`. En JavaScript, la propriété s’écrit `backgroundColor` (camelCase).",
    retain: "CSS `background-color` → JavaScript `backgroundColor`.",
  },
  {
    id: "doc-4", lesson: "document", notion: "document", type: "lab", difficulty: 2,
    question: "Dans `script.js`, change le titre de la page en \"Mon site\" et la couleur de fond du body en \"lightblue\", puis exécute.",
    files: [
      { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Titre d'origine</title>
</head>
<body>
  <h1>Ma page</h1>
  <script src="script.js"></script>
</body>
</html>`, readOnly: true },
      { name: "script.js", code: `// 1. Change document.title
// 2. Change la couleur de fond de document.body
` },
    ],
    tests: [
      { expr: "document.title", expect: "Mon site", label: "Le titre doit valoir \"Mon site\"" },
      { expr: "document.body.style.backgroundColor", expect: "lightblue", label: "La couleur de fond du body doit valoir \"lightblue\"" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [
      { name: "script.js", code: `document.title = "Mon site";
document.body.style.backgroundColor = "lightblue";` },
    ],
    hints: [
      "Deux modifications : une propriété de `document`, une propriété du style du body.",
      "Le titre se change avec `document.title = ...`. La couleur de fond avec `document.body.style.backgroundColor = ...`.",
      "`document.title = \"Mon site\";` puis `document.body.style.backgroundColor = \"lightblue\";`",
    ],
    explanation: "On affecte une nouvelle valeur à `document.title`, puis à la propriété `backgroundColor` du style du `body`.",
    retain: "`document.title = ...` et `element.style.propriete = ...` modifient la page.",
  },

  // ═════════════ NIVEAU 3 — Comprendre le DOM ═════════════
  {
    id: "dom-1", lesson: "dom", notion: "Arbre du DOM", type: "qcm", difficulty: 1,
    question: "Dans ce HTML, quel est le parent de chaque `<li>` ?",
    code: `<body>
  <h1>Titre</h1>
  <ul>
    <li>Un</li>
    <li>Deux</li>
  </ul>
</body>`,
    options: ["`body`", "`ul`", "`h1`", "`html`"],
    answer: 1,
    why: [
      "`body` est le parent du `ul`, pas du `li` : c’est son grand-parent.",
      "",
      "`h1` est le frère du `ul`, pas son parent.",
      "`html` est tout en haut de l’arbre : il est le parent de `body`.",
    ],
    hints: [
      "Le parent est la balise qui contient directement l’élément.",
      "Regarde l’indentation : dans quelle balise les `li` sont-ils écrits ?",
      "Les `li` sont à l’intérieur de la balise `ul`.",
    ],
    explanation: "Chaque `li` est écrit directement dans le `ul` : c’est son parent. Le `ul` lui-même a pour parent le `body`.",
    retain: "Le parent est la balise qui contient directement l’élément.",
  },
  {
    id: "dom-2", lesson: "dom", notion: "Arbre du DOM", type: "vf", difficulty: 1,
    statement: "Quand JavaScript modifie le DOM, le fichier HTML est modifié lui aussi.",
    answer: false,
    why: "JavaScript modifie la page en mémoire (le DOM). Le fichier HTML reste identique : si tu recharges la page, tout repart du fichier.",
    hints: [
      "Le DOM et le fichier HTML sont deux choses différentes.",
      "Le DOM est construit par le navigateur à partir du fichier, puis JavaScript le modifie.",
      "Le fichier n’est pas modifié : l’affirmation est fausse.",
    ],
    explanation: "Le navigateur lit le fichier HTML pour construire le DOM, en mémoire. JavaScript modifie ce DOM, jamais le fichier.",
    retain: "JavaScript change la page en mémoire, pas le fichier HTML.",
  },
  {
    id: "dom-3", lesson: "dom", notion: "Arbre du DOM", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ?",
    code: `<body>
  <h1>Titre</h1>
  <p>Texte</p>
  <script>
    const premier = document.body.firstElementChild;
    console.log(premier.tagName);
    console.log(premier.nextElementSibling.tagName);
  </script>
</body>`,
    rows: 2,
    answers: ["H1\nP"],
    common: { "h1\np": "`tagName` renvoie le nom de la balise en majuscules : `H1` et `P`." },
    hints: [
      "`firstElementChild` est le premier élément écrit dans le body.",
      "`nextElementSibling` est l’élément qui vient juste après lui.",
      "Le premier est le `h1`, le suivant est le `p`. Les noms s’écrivent en majuscules.",
    ],
    explanation: "Le premier élément du `body` est le `h1` : `tagName` vaut `\"H1\"`. Son frère suivant est le `p` : `\"P\"`.",
    retain: "`tagName` est en majuscules.",
  },
  {
    id: "dom-4", lesson: "dom", notion: "Arbre du DOM", type: "lab", difficulty: 2,
    question: "Le premier élément du `body` est un `ul`. Dans `script.js`, récupère-le avec `document.body.firstElementChild`, puis affiche son nombre d’enfants avec `console.log`.",
    files: labFiles(`<ul>
  <li>Un</li>
  <li>Deux</li>
  <li>Trois</li>
</ul>
<p>Fin de la liste.</p>`, `// Récupère le ul, puis affiche son nombre d'enfants
`, { lockHtml: true }),
    tests: [],
    expectLogs: [{ level: "log", text: "3", label: "La console doit afficher le nombre d’enfants du `ul` : 3." }],
    mustContain: [{ file: "script.js", re: "firstElementChild", msg: "Utilise `document.body.firstElementChild` pour récupérer le `ul`." }],
    solution: [{ name: "script.js", code: `const liste = document.body.firstElementChild;
console.log(liste.children.length);` }],
    hints: [
      "Range d’abord `document.body.firstElementChild` dans une variable.",
      "Les éléments enfants d’un élément sont dans sa propriété `children` : on peut lire sa `length`.",
      "`const liste = document.body.firstElementChild;` puis `console.log(liste.children.length);`",
    ],
    explanation: "`firstElementChild` du `body` est le `ul`. Sa propriété `children` contient ses trois `li` : sa `length` vaut 3.",
    retain: "`children.length` donne le nombre d’éléments enfants.",
  },

  // ═════════════ NIVEAU 3 — Sélectionner ═════════════
  {
    id: "sel-1", lesson: "selectionner", notion: "Sélection d’éléments", type: "qcm", difficulty: 1,
    question: "Quelle instruction sélectionne l’élément `<p id=\"message\">` ?",
    options: [
      "`document.getElementById(\"#message\")`",
      "`document.getElementById(\"message\")`",
      "`document.querySelector(\"message\")`",
      "`document.querySelectorAll(\"#message\")`",
    ],
    answer: 1,
    why: [
      "`getElementById` attend l’id seul, sans `#`.",
      "",
      "Sans `#`, `\"message\"` désigne une balise `<message>`, qui n’existe pas.",
      "Cette instruction fonctionne, mais renvoie une liste (NodeList) et non l’élément lui-même.",
    ],
    hints: [
      "Il y a deux façons de désigner un id selon la méthode : avec ou sans `#`.",
      "`getElementById` reçoit l’id seul. `querySelector` reçoit un sélecteur CSS complet.",
      "`document.getElementById(\"message\")`",
    ],
    explanation: "`getElementById(\"message\")` reçoit l’id sans `#` et renvoie directement l’élément. (`document.querySelector(\"#message\")` marcherait aussi.)",
    retain: "`getElementById` : sans `#`. `querySelector` : avec `#`.",
  },
  {
    id: "sel-2", lesson: "selectionner", notion: "Sélection d’éléments", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ? (une ligne par `console.log`)",
    code: `<ul>
  <li class="vert">Pomme</li>
  <li>Banane</li>
  <li class="vert">Kiwi</li>
</ul>
<script>
  console.log(document.querySelector(".vert").textContent);
  console.log(document.querySelectorAll(".vert").length);
</script>`,
    rows: 2,
    answers: ["Pomme\n2"],
    common: { "Pomme\nKiwi": "`querySelector` renvoie le premier élément. `querySelectorAll(...).length` est un nombre : combien d’éléments correspondent.", "Kiwi\n2": "`querySelector` s’arrête au premier élément trouvé : `Pomme`." },
    hints: [
      "Deux éléments ont la classe `vert`.",
      "`querySelector` renvoie le premier. `querySelectorAll(...).length` compte tous les éléments.",
      "Première ligne : `Pomme`. Deuxième ligne : 2.",
    ],
    explanation: "`querySelector(\".vert\")` renvoie le premier élément qui a la classe `vert` : « Pomme ». `querySelectorAll(\".vert\")` en trouve deux : sa `length` vaut 2.",
    retain: "`querySelector` : le premier. `querySelectorAll` : tous.",
  },
  {
    id: "sel-3", lesson: "selectionner", notion: "Sélection d’éléments", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "La page contient `<h1 id=\"titre\">Mon blog</h1>`. La console affiche `TypeError: Cannot read properties of null (reading 'textContent')`. Pourquoi ?",
    code: `const titre = document.querySelector("titre");
console.log(titre.textContent);`,
    options: [
      "`textContent` n’existe pas.",
      "Le sélecteur `\"titre\"` cherche une balise `<titre>` : il manque le `#` pour désigner l’id.",
      "Il faut utiliser `querySelectorAll`.",
      "Le script s’exécute avant la page, il faut toujours ajouter `defer`.",
    ],
    answer: 1,
    why: [
      "`textContent` existe bien : l’erreur vient du fait que `titre` vaut `null`.",
      "",
      "`querySelectorAll` renverrait une liste vide, pas l’élément voulu.",
      "Ce n’est pas la cause ici : le problème est dans le sélecteur.",
    ],
    hints: [
      "L’erreur dit que `titre` vaut `null` : rien n’a été trouvé.",
      "Regarde comment on désigne un id dans un sélecteur CSS.",
      "Il faut écrire `document.querySelector(\"#titre\")`.",
    ],
    explanation: "Sans `#`, `\"titre\"` désigne une balise `<titre>`. Aucun élément ne correspond : `querySelector` renvoie `null`, et `null.textContent` provoque l’erreur. Avec `\"#titre\"`, ça marche.",
    retain: "`#` pour un id, `.` pour une classe, rien pour une balise.",
  },
  {
    id: "sel-4", lesson: "selectionner", notion: "Sélection d’éléments", type: "lab", difficulty: 1,
    question: "Dans `script.js`, sélectionne le titre qui a l’id `titre` et range-le dans une constante nommée `titre`.",
    files: labFiles(`<h1 id="titre">Mon blog</h1>
<p>Bienvenue.</p>`, `// Crée la constante titre
`, { lockHtml: true }),
    tests: [{ expr: "titre.textContent", expect: "Mon blog", label: "`titre` doit contenir l’élément `h1` (son texte est « Mon blog »)" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "getElementById|querySelector", msg: "Utilise `getElementById` ou `querySelector`." }],
    solution: [{ name: "script.js", code: `const titre = document.getElementById("titre");` }],
    hints: [
      "Il faut une méthode de `document` qui cherche un élément par son id.",
      "`getElementById` reçoit l’id sans `#` ; `querySelector` avec `#`.",
      "`const titre = document.getElementById(\"titre\");`",
    ],
    explanation: "`getElementById(\"titre\")` renvoie l’élément `h1` : on le range dans la constante `titre`, qu’on pourra réutiliser pour le lire ou le modifier.",
    retain: "Range l’élément trouvé dans une `const`.",
  },
  {
    id: "sel-5", lesson: "selectionner", notion: "Sélection d’éléments", type: "lab", difficulty: 2,
    question: "Sélectionne le paragraphe qui a la classe `intro`, puis affiche son texte dans la console.",
    files: labFiles(`<h1>Mon blog</h1>
<p class="intro">Bienvenue sur ma page.</p>
<p>Un autre paragraphe.</p>`, `// Sélectionne le paragraphe .intro et affiche son texte
`, { lockHtml: true }),
    tests: [],
    expectLogs: [{ level: "log", text: "Bienvenue sur ma page.", label: "La console doit afficher « Bienvenue sur ma page. »." }],
    mustContain: [{ file: "script.js", re: "querySelector|getElementsByClassName", msg: "Utilise `querySelector(\".intro\")`." }],
    solution: [{ name: "script.js", code: `const intro = document.querySelector(".intro");
console.log(intro.textContent);` }],
    hints: [
      "Une classe se désigne avec un point dans un sélecteur.",
      "`document.querySelector(\".intro\")` renvoie l’élément ; son texte est dans `textContent`.",
      "`const intro = document.querySelector(\".intro\");` puis `console.log(intro.textContent);`",
    ],
    explanation: "`querySelector(\".intro\")` trouve le premier élément qui a la classe `intro`. Sa propriété `textContent` contient le texte à afficher.",
    retain: "`querySelector(\".classe\")` puis `.textContent` pour lire un texte.",
  },

  // ═════════════ NIVEAU 3 — Texte et HTML ═════════════
  {
    id: "txt-1", lesson: "texte", notion: "textContent et innerHTML", type: "qcm", difficulty: 1,
    question: "Quelle propriété interprète les balises HTML qu’on lui donne ?",
    options: ["`textContent`", "`innerHTML`", "`value`", "`tagName`"],
    answer: 1,
    why: [
      "`textContent` affiche les balises telles quelles, comme du texte.",
      "",
      "`value` sert pour les champs de saisie.",
      "`tagName` donne le nom de la balise : elle se lit seulement.",
    ],
    hints: [
      "Le nom d’une des deux propriétés parle de HTML.",
      "`innerHTML` : le HTML à l’intérieur de l’élément.",
      "`innerHTML`",
    ],
    explanation: "`innerHTML` lit et écrit du HTML : `<strong>` y est interprété. `textContent` traite tout comme du simple texte.",
    retain: "`innerHTML` : HTML interprété. `textContent` : texte brut.",
  },
  {
    id: "txt-2", lesson: "texte", notion: "textContent et innerHTML", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ?",
    code: `<p id="a">Salut</p>
<script>
  const p = document.getElementById("a");
  p.textContent += " Léa";
  console.log(p.textContent);
</script>`,
    answers: ["Salut Léa"],
    common: { "Léa": "`+=` ajoute à la suite du texte existant : il ne le remplace pas.", "Salut": "La ligne `p.textContent += \" Léa\"` est exécutée avant l’affichage." },
    hints: [
      "`+=` ajoute à ce qui existe déjà.",
      "Le texte de départ est `Salut`, et on lui ajoute ` Léa` (avec une espace).",
      "`Salut Léa`",
    ],
    explanation: "`p.textContent += \" Léa\"` équivaut à `p.textContent = p.textContent + \" Léa\"` : le texte devient `Salut Léa`.",
    retain: "`+=` ajoute à la suite du texte existant.",
  },
  {
    id: "txt-3", lesson: "texte", notion: "textContent et innerHTML", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Le texte du titre de la page ne change pas. Pourquoi ?",
    code: `let titre = document.querySelector("h1");
titre = "Nouveau titre";`,
    options: [
      "`querySelector` ne fonctionne pas avec `h1`.",
      "La ligne 2 remplace le contenu de la variable, pas le texte de l’élément : il faut `titre.textContent = ...`.",
      "Il faut utiliser `const` au lieu de `let`.",
      "Il faut écrire `titre.innerText()` avec des parenthèses.",
    ],
    answer: 1,
    why: [
      "`querySelector(\"h1\")` fonctionne très bien pour une balise.",
      "",
      "`const` n’y changerait rien : il empêcherait même la ligne 2.",
      "`innerText` est une propriété, pas une fonction : pas de parenthèses.",
    ],
    hints: [
      "Que contient la variable `titre` après la ligne 2 ?",
      "La variable ne contient plus l’élément, mais un texte. La page n’en sait rien.",
      "Pour changer ce qui est affiché, il faut modifier une propriété de l’élément : `titre.textContent = \"Nouveau titre\";`",
    ],
    explanation: "La ligne 2 range un texte dans la variable : elle ne touche pas à l’élément. La page ne change que si on modifie une propriété de l’élément, comme `textContent`.",
    retain: "Pour changer la page, modifie une propriété de l’élément, pas la variable.",
  },
  {
    id: "txt-4", lesson: "texte", notion: "textContent et innerHTML", type: "lab", difficulty: 1,
    question: "Remplace le texte du titre (`#titre`) par « Bonjour Léa ».",
    files: labFiles(`<h1 id="titre">Titre d'origine</h1>
<p id="message">Un message.</p>`, `// Change le texte du titre
`, { lockHtml: true }),
    tests: [{ expr: `document.getElementById("titre").textContent`, expect: "Bonjour Léa", label: "Le titre doit afficher « Bonjour Léa »" }],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const titre = document.getElementById("titre");
titre.textContent = "Bonjour Léa";` }],
    hints: [
      "Il faut d’abord sélectionner le titre.",
      "Ensuite, on modifie sa propriété `textContent`.",
      "`const titre = document.getElementById(\"titre\");` puis `titre.textContent = \"Bonjour Léa\";`",
    ],
    explanation: "On sélectionne l’élément, puis on affecte un nouveau texte à sa propriété `textContent` : la page se met à jour tout de suite.",
    retain: "`element.textContent = \"...\"` remplace le texte.",
  },
  {
    id: "txt-5", lesson: "texte", notion: "textContent et innerHTML", type: "lab", difficulty: 2,
    question: "Dans le paragraphe `#message`, affiche le mot « Merci » en gras, avec `innerHTML` et la balise `<strong>`.",
    files: labFiles(`<p id="message">Message d'origine</p>`, `// Mets <strong>Merci</strong> dans #message
`, { lockHtml: true }),
    tests: [{ expr: `document.getElementById("message").innerHTML`, expect: "<strong>Merci</strong>", label: "Le HTML du message doit être <strong>Merci</strong>" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "innerHTML", msg: "Utilise la propriété `innerHTML`." }],
    solution: [{ name: "script.js", code: `const message = document.getElementById("message");
message.innerHTML = "<strong>Merci</strong>";` }],
    hints: [
      "Pour que la balise soit interprétée, il faut `innerHTML` et non `textContent`.",
      "On affecte du HTML sous forme de texte : `\"<strong>...</strong>\"`.",
      "`message.innerHTML = \"<strong>Merci</strong>\";`",
    ],
    explanation: "`innerHTML` interprète les balises : le mot est affiché en gras. Avec `textContent`, on verrait les balises écrites.",
    retain: "Du gras, des listes, des liens… : `innerHTML`.",
  },

  // ═════════════ NIVEAU 3 — Attributs ═════════════
  {
    id: "att-1", lesson: "attributs", notion: "Attributs", type: "qcm", difficulty: 1,
    question: "Quelle instruction active un bouton qui a l’attribut `disabled` ?",
    options: [
      "`bouton.removeAttribute(\"disabled\")`",
      "`bouton.setAttribute(\"disabled\", false)`",
      "`bouton.disabled = \"non\"`",
      "`bouton.delete(\"disabled\")`",
    ],
    answer: 0,
    why: [
      "",
      "La valeur n’a pas d’importance : tant que l’attribut est présent, le bouton reste désactivé.",
      "Un texte non vide est considéré comme `true` : le bouton reste désactivé.",
      "`delete` n’est pas une méthode des éléments.",
    ],
    hints: [
      "Pour un attribut booléen, c’est sa présence qui compte.",
      "Il faut retirer l’attribut, ou mettre la propriété `disabled` à `false`.",
      "`bouton.removeAttribute(\"disabled\")` (ou `bouton.disabled = false`).",
    ],
    explanation: "Un attribut booléen est actif dès qu’il est présent. `removeAttribute(\"disabled\")` le retire, ce qui active le bouton.",
    retain: "Attribut booléen : retire-le, ou mets la propriété à `false`.",
  },
  {
    id: "att-2", lesson: "attributs", notion: "Attributs", type: "vf", difficulty: 1,
    statement: "Pour un champ de saisie, `champ.value` donne le texte actuellement écrit dans le champ.",
    answer: true,
    why: "`value` contient ce que la personne a tapé, et on peut aussi l’utiliser pour remplir le champ.",
    hints: [
      "Pense à la propriété que tu as utilisée pour remplir le champ dans le cours.",
      "`value` se lit et s’écrit.",
      "L’affirmation est vraie.",
    ],
    explanation: "`value` contient le texte du champ : on le lit pour récupérer la saisie, on l’écrit pour pré-remplir le champ.",
    retain: "`champ.value` : lire ou écrire le contenu d’un champ.",
  },
  {
    id: "att-3", lesson: "attributs", notion: "Attributs", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ?",
    code: `<a id="l" href="page.html">Lien</a>
<script>
  const l = document.getElementById("l");
  l.setAttribute("href", "contact.html");
  console.log(l.getAttribute("href"));
</script>`,
    answers: ["contact.html"],
    common: { "page.html": "L’attribut est modifié par `setAttribute` avant d’être lu : il vaut `contact.html`." },
    hints: [
      "Suis la valeur de l’attribut `href` ligne par ligne.",
      "`setAttribute` change la valeur avant la lecture.",
      "`contact.html`",
    ],
    explanation: "`setAttribute(\"href\", \"contact.html\")` remplace la valeur d’origine. `getAttribute(\"href\")` lit alors la nouvelle valeur.",
    retain: "`setAttribute(nom, valeur)` modifie ; `getAttribute(nom)` lit.",
  },
  {
    id: "att-4", lesson: "attributs", notion: "Attributs", type: "lab", difficulty: 2,
    question: "Change l’adresse du lien `#lien` en `https://example.com`, puis active le bouton `#bouton`.",
    files: labFiles(`<a id="lien" href="#">Mon lien</a>
<button id="bouton" disabled>Valider</button>`, `// 1. Change le href du lien
// 2. Active le bouton
`, { lockHtml: true }),
    tests: [
      { expr: `document.getElementById("lien").getAttribute("href")`, expect: "https://example.com", label: "Le `href` du lien doit être https://example.com" },
      { expr: `document.getElementById("bouton").disabled`, expect: false, label: "Le bouton ne doit plus être désactivé" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const lien = document.getElementById("lien");
lien.setAttribute("href", "https://example.com");
const bouton = document.getElementById("bouton");
bouton.disabled = false;` }],
    hints: [
      "Deux éléments à sélectionner, deux modifications.",
      "Lien : `setAttribute(\"href\", ...)`. Bouton : la propriété `disabled`.",
      "`lien.setAttribute(\"href\", \"https://example.com\");` et `bouton.disabled = false;`",
    ],
    explanation: "`setAttribute` change l’adresse du lien. Mettre `disabled` à `false` retire l’attribut : le bouton redevient cliquable.",
    retain: "`setAttribute` pour un attribut, la propriété pour un booléen.",
  },
  {
    id: "att-5", lesson: "attributs", notion: "Attributs", type: "lab", difficulty: 2,
    question: "Remplis le champ `#nom` avec « Léa », et change son `placeholder` en « Ton prénom ».",
    files: labFiles(`<input id="nom" type="text" placeholder="Ton nom">`, `// Remplis le champ et change son placeholder
`, { lockHtml: true }),
    tests: [
      { expr: `document.getElementById("nom").value`, expect: "Léa", label: "Le champ doit contenir « Léa »" },
      { expr: `document.getElementById("nom").placeholder`, expect: "Ton prénom", label: "Le placeholder doit être « Ton prénom »" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const champ = document.getElementById("nom");
champ.value = "Léa";
champ.placeholder = "Ton prénom";` }],
    hints: [
      "Sélectionne d’abord le champ avec son id.",
      "Deux propriétés à modifier : `value` et `placeholder`.",
      "`champ.value = \"Léa\";` et `champ.placeholder = \"Ton prénom\";`",
    ],
    explanation: "`value` est le contenu du champ, `placeholder` le texte grisé affiché quand il est vide : ce sont deux propriétés de l’élément `input`.",
    retain: "`value` et `placeholder` sont des propriétés des champs.",
  },

  // ═════════════ NIVEAU 3 — Classes et styles ═════════════
  {
    id: "cls-1", lesson: "classes-styles", notion: "Classes et styles", type: "qcm", difficulty: 1,
    question: "Quelle instruction ajoute la classe `actif` à un élément, sans toucher à ses autres classes ?",
    options: [
      "`element.classList.add(\"actif\")`",
      "`element.className = \"actif\"`",
      "`element.class = \"actif\"`",
      "`element.classList.add(\".actif\")`",
    ],
    answer: 0,
    why: [
      "",
      "`className = ...` remplace toutes les classes de l’élément.",
      "`class` n’est pas une propriété : le mot est réservé.",
      "Le point est inutile : la classe ajoutée s’appellerait `.actif`.",
    ],
    hints: [
      "Il existe un objet dédié à la gestion des classes une par une.",
      "`classList` a une méthode pour ajouter.",
      "`element.classList.add(\"actif\")`",
    ],
    explanation: "`classList.add` ajoute une classe en gardant les autres. `className` écrase tout, et `class` n’existe pas comme propriété.",
    retain: "`classList.add(\"nom\")`, sans point.",
  },
  {
    id: "cls-2", lesson: "classes-styles", notion: "Classes et styles", type: "predict", difficulty: 3, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ?",
    code: `<p id="p" class="a b"></p>
<script>
  const p = document.getElementById("p");
  p.classList.remove("a");
  p.classList.toggle("c");
  p.classList.toggle("b");
  console.log(p.className);
</script>`,
    answers: ["c"],
    common: { "b c": "Le deuxième `toggle` retire `b` : il était présent.", "a b c": "`remove(\"a\")` retire bien la classe `a`." },
    hints: [
      "Suis la liste des classes ligne par ligne : au départ, `a b`.",
      "`remove(\"a\")` retire `a`, `toggle(\"c\")` ajoute `c`, puis `toggle(\"b\")` retire `b` qui était présente.",
      "Il ne reste que `c`.",
    ],
    explanation: "`a b` → `remove(\"a\")` → `b` → `toggle(\"c\")` ajoute `c` → `b c` → `toggle(\"b\")` retire `b` → `c`.",
    retain: "`toggle` ajoute la classe si elle manque, la retire si elle est là.",
  },
  {
    id: "cls-3", lesson: "classes-styles", notion: "Classes et styles", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Le texte ne change pas de taille. Pourquoi ?",
    code: `const p = document.querySelector("p");
p.style.fontSize = 20;`,
    options: [
      "`fontSize` n’existe pas, il faut écrire `font-size`.",
      "La valeur doit être un texte avec son unité : `\"20px\"`.",
      "On ne peut pas changer la taille avec JavaScript.",
      "Il faut utiliser `p.style.size`.",
    ],
    answer: 1,
    why: [
      "En JavaScript, `fontSize` est bien le bon nom (camelCase) ; `font-size` serait lu comme une soustraction.",
      "",
      "Si : avec `style`, ou avec une classe CSS.",
      "La propriété s’appelle `fontSize`.",
    ],
    hints: [
      "Le nom de la propriété est correct. Regarde la valeur.",
      "En CSS, une taille s’écrit avec une unité : `20px`.",
      "`p.style.fontSize = \"20px\";`",
    ],
    explanation: "Un nombre seul n’est pas une valeur CSS valide pour une taille : le navigateur l’ignore. Il faut un texte avec l’unité : `\"20px\"`.",
    retain: "Valeur de style = texte avec unité : `\"20px\"`.",
  },
  {
    id: "cls-4", lesson: "classes-styles", notion: "Classes et styles", type: "lab", difficulty: 1,
    question: "Le CSS contient déjà une règle `.actif`. Ajoute cette classe au paragraphe `#texte`.",
    files: labFiles(`<p id="texte">Un paragraphe.</p>`, `// Ajoute la classe actif à #texte
`, { lockHtml: true, lockCss: true, cssCode: `.actif {
  background: gold;
  font-weight: bold;
}` }),
    tests: [{ expr: `document.getElementById("texte").classList.contains("actif")`, expect: true, label: "Le paragraphe doit avoir la classe `actif`" }],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const texte = document.getElementById("texte");
texte.classList.add("actif");` }],
    hints: [
      "Sélectionne le paragraphe, puis utilise `classList`.",
      "La méthode pour ajouter une classe s’appelle `add`.",
      "`texte.classList.add(\"actif\");`",
    ],
    explanation: "`classList.add(\"actif\")` ajoute la classe : le CSS déjà écrit s’applique tout de suite et le paragraphe devient doré.",
    retain: "JavaScript ajoute la classe, le CSS fait la mise en forme.",
  },
  {
    id: "cls-5", lesson: "classes-styles", notion: "Classes et styles", type: "lab", difficulty: 2,
    question: "Avec la propriété `style`, mets la couleur du titre `#titre` en `tomato` et sa taille de police à `32px`.",
    files: labFiles(`<h1 id="titre">Mon titre</h1>`, `// Change la couleur et la taille du titre
`, { lockHtml: true }),
    tests: [
      { expr: `document.getElementById("titre").style.color`, expect: "tomato", label: "La couleur du titre doit être « tomato »" },
      { expr: `document.getElementById("titre").style.fontSize`, expect: "32px", label: "La taille du titre doit être « 32px »" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const titre = document.getElementById("titre");
titre.style.color = "tomato";
titre.style.fontSize = "32px";` }],
    hints: [
      "Les styles directs se règlent avec `element.style.propriete`.",
      "Les noms s’écrivent en camelCase (`fontSize`) et les valeurs sont des textes avec leur unité.",
      "`titre.style.color = \"tomato\";` et `titre.style.fontSize = \"32px\";`",
    ],
    explanation: "On change deux propriétés de `style` : `color` et `fontSize`. La taille doit être un texte avec l’unité : `\"32px\"`.",
    retain: "`element.style.propriete = \"valeur\"` (camelCase, avec unité).",
  },

  // ═════════════ NIVEAU 3 — Parcourir ═════════════
  {
    id: "par-1", lesson: "parcourir", notion: "Parcourir une liste d’éléments", type: "qcm", difficulty: 2,
    question: "Quelle instruction convertit la NodeList `items` en vrai tableau, pour pouvoir utiliser `map` ou `filter` ?",
    options: ["`Array.from(items)`", "`items.toArray()`", "`Array(items.length)`", "`items.split()`"],
    answer: 0,
    why: [
      "",
      "`toArray` n’existe pas pour les NodeList.",
      "Cette instruction crée un tableau vide de la bonne longueur, sans les éléments.",
      "`split` est une méthode des textes, pas des listes d’éléments.",
    ],
    hints: [
      "Il existe une fonction de `Array` qui fabrique un tableau à partir d’une liste.",
      "Son nom signifie « à partir de », en anglais.",
      "`Array.from(items)`",
    ],
    explanation: "`Array.from(items)` crée un vrai tableau avec les éléments de la NodeList. On peut alors utiliser `map`, `filter`, etc. (`[...items]` fait la même chose.)",
    retain: "`Array.from(nodeList)` : NodeList → tableau.",
  },
  {
    id: "par-2", lesson: "parcourir", notion: "Parcourir une liste d’éléments", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ? (une ligne par `console.log`)",
    code: `<ul>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>
<script>
  document.querySelectorAll("li").forEach((li, i) => {
    console.log(i, li.textContent);
  });
</script>`,
    rows: 3,
    answers: ["0 A\n1 B\n2 C"],
    common: { "1 A\n2 B\n3 C": "L’index commence à 0, pas à 1." },
    hints: [
      "Le deuxième paramètre de `forEach` est l’index.",
      "L’index commence à 0.",
      "Trois lignes : 0 A, puis 1 B, puis 2 C.",
    ],
    explanation: "`forEach` appelle la fonction une fois par `li`, avec l’élément et son index (0, 1, 2). `console.log(i, texte)` affiche les deux séparés par une espace.",
    retain: "L’index de `forEach` commence à 0.",
  },
  {
    id: "par-3", lesson: "parcourir", notion: "Parcourir une liste d’éléments", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "La console affiche `TypeError: items.map is not a function`. Pourquoi ?",
    code: `const items = document.querySelectorAll("li");
const textes = items.map((li) => li.textContent);`,
    options: [
      "Une NodeList n’est pas un tableau : elle n’a pas `map`.",
      "`textContent` ne peut pas être utilisé dans `map`.",
      "Il faut utiliser `getElementById` au lieu de `querySelectorAll`.",
      "`map` n’existe pas en JavaScript.",
    ],
    answer: 0,
    why: [
      "",
      "`textContent` s’utilise très bien dans `map`.",
      "`getElementById` ne renvoie qu’un seul élément.",
      "`map` existe : c’est une méthode des tableaux (niveau 1).",
    ],
    hints: [
      "Que renvoie exactement `querySelectorAll` ?",
      "Il renvoie une NodeList, qui ressemble à un tableau sans en être un.",
      "Il faut la convertir : `Array.from(items).map(...)`.",
    ],
    explanation: "Une NodeList a `forEach` et `length`, mais pas `map` ni `filter`. On la convertit en tableau avec `Array.from(items)` avant d’utiliser `map`.",
    retain: "NodeList : `forEach` oui, `map` non (sauf après `Array.from`).",
  },
  {
    id: "par-4", lesson: "parcourir", notion: "Parcourir une liste d’éléments", type: "lab", difficulty: 2,
    question: "Ajoute la classe `vert` à tous les éléments `li` de la page.",
    files: labFiles(`<ul>
  <li>Pomme</li>
  <li>Banane</li>
  <li>Kiwi</li>
</ul>`, `// Ajoute la classe vert à chaque li
`, { lockHtml: true, lockCss: true, cssCode: `.vert {
  color: seagreen;
  font-weight: bold;
}` }),
    tests: [{ expr: `document.querySelectorAll("li.vert").length`, expect: 3, label: "Les 3 éléments `li` doivent avoir la classe `vert`" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "querySelectorAll", msg: "Utilise `querySelectorAll(\"li\")` pour récupérer tous les éléments." }],
    solution: [{ name: "script.js", code: `const items = document.querySelectorAll("li");
items.forEach((item) => {
  item.classList.add("vert");
});` }],
    hints: [
      "Il faut récupérer tous les `li`, puis agir sur chacun.",
      "`querySelectorAll(\"li\")` donne la liste ; `forEach` la parcourt.",
      "`document.querySelectorAll(\"li\").forEach((item) => { item.classList.add(\"vert\"); });`",
    ],
    explanation: "On récupère la liste de tous les `li`, puis on appelle `classList.add(\"vert\")` sur chacun grâce à `forEach`.",
    retain: "`querySelectorAll` + `forEach` = la même action sur chaque élément.",
  },
  {
    id: "par-5", lesson: "parcourir", notion: "Parcourir une liste d’éléments", type: "lab", difficulty: 3,
    question: "Mets le texte de chaque `li` en majuscules (avec `toUpperCase()`).",
    files: labFiles(`<ul>
  <li>Pomme</li>
  <li>Banane</li>
  <li>Kiwi</li>
</ul>`, `// Mets chaque li en majuscules
`, { lockHtml: true }),
    tests: [{ expr: `Array.from(document.querySelectorAll("li")).map((li) => li.textContent)`, expect: ["POMME", "BANANE", "KIWI"], label: "Les textes doivent être POMME, BANANE, KIWI" }],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const items = document.querySelectorAll("li");
for (const item of items) {
  item.textContent = item.textContent.toUpperCase();
}` }],
    hints: [
      "Il faut parcourir tous les `li` et modifier le texte de chacun.",
      "Le nouveau texte est l’ancien, passé par `toUpperCase()`.",
      "`item.textContent = item.textContent.toUpperCase();` dans une boucle sur `querySelectorAll(\"li\")`.",
    ],
    explanation: "À chaque tour, on lit le texte de l’élément, on le met en majuscules avec `toUpperCase()`, puis on le réécrit dans `textContent`.",
    retain: "Lire, transformer, réécrire : `el.textContent = el.textContent.toUpperCase()`.",
  },

  // ═════════════ NIVEAU 3 — Créer et ajouter ═════════════
  {
    id: "cre-1", lesson: "creer", notion: "Créer et ajouter des éléments", type: "qcm", difficulty: 1,
    question: "Quelle suite d’instructions ajoute `<li>Kiwi</li>` à la fin de la liste `liste` ?",
    options: [
      "`const li = document.createElement(\"li\"); li.textContent = \"Kiwi\"; liste.append(li);`",
      "`const li = document.createElement(\"li\"); li.textContent = \"Kiwi\";`",
      "`liste.append(document.createElement(\"Kiwi\"));`",
      "`liste.textContent = \"<li>Kiwi</li>\";`",
    ],
    answer: 0,
    why: [
      "",
      "L’élément est créé et rempli, mais jamais ajouté à la page.",
      "`createElement` attend un nom de balise (`\"li\"`), pas un texte.",
      "`textContent` affiche les balises comme du texte, et efface le contenu de la liste.",
    ],
    hints: [
      "Trois étapes : créer, configurer, ajouter.",
      "Sans la dernière étape, rien n’apparaît dans la page.",
      "Il faut `createElement(\"li\")`, `textContent`, puis `append`.",
    ],
    explanation: "On crée un `li`, on lui donne son texte, puis `liste.append(li)` l’ajoute à la fin de la liste. Sans `append`, l’élément reste en mémoire.",
    retain: "Créer, configurer, ajouter.",
  },
  {
    id: "cre-2", lesson: "creer", notion: "Créer et ajouter des éléments", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ? (une ligne par `console.log`)",
    code: `<ul id="l"></ul>
<script>
  const l = document.getElementById("l");
  for (const lettre of ["a", "b", "c"]) {
    const li = document.createElement("li");
    li.textContent = lettre;
    l.append(li);
  }
  console.log(l.children.length);
  console.log(l.lastElementChild.textContent);
</script>`,
    rows: 2,
    answers: ["3\nc"],
    common: { "3\na": "`append` ajoute à la fin : le dernier élément ajouté est `c`." },
    hints: [
      "La boucle ajoute un `li` pour chaque lettre du tableau.",
      "`append` ajoute à la fin de la liste.",
      "Trois éléments, et le dernier contient `c`.",
    ],
    explanation: "La boucle crée trois `li` (a, b, c) et les ajoute dans cet ordre. La liste a donc 3 enfants, et le dernier est celui du texte `c`.",
    retain: "`append` ajoute à la fin : le dernier ajouté est le dernier.",
  },
  {
    id: "cre-3", lesson: "creer", notion: "Créer et ajouter des éléments", type: "vf", difficulty: 1,
    statement: "`document.createElement(\"p\")` ajoute immédiatement un paragraphe dans la page.",
    answer: false,
    why: "`createElement` crée l’élément en mémoire seulement. Il n’apparaît dans la page qu’après `append`, `prepend`, `before` ou `after`.",
    hints: [
      "Que faut-il faire après avoir créé un élément ?",
      "L’élément doit être ajouté explicitement dans la page.",
      "L’affirmation est fausse.",
    ],
    explanation: "Un élément créé reste « en l’air » tant qu’on ne l’a pas inséré dans le DOM avec une méthode comme `append`.",
    retain: "Créer ≠ ajouter à la page.",
  },
  {
    id: "cre-4", lesson: "creer", notion: "Créer et ajouter des éléments", type: "lab", difficulty: 2,
    question: "Ajoute à la fin de la liste `#liste` un nouvel élément `<li>` qui contient « Kiwi ».",
    files: labFiles(`<ul id="liste">
  <li>Pomme</li>
  <li>Banane</li>
</ul>`, `// Crée un li « Kiwi » et ajoute-le à la fin de la liste
`, { lockHtml: true }),
    tests: [
      { expr: `document.querySelectorAll("#liste li").length`, expect: 3, label: "La liste doit contenir 3 éléments" },
      { expr: `document.getElementById("liste").lastElementChild.textContent`, expect: "Kiwi", label: "Le dernier élément doit contenir « Kiwi »" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "createElement", msg: "Utilise `document.createElement(\"li\")`." }],
    solution: [{ name: "script.js", code: `const liste = document.getElementById("liste");
const li = document.createElement("li");
li.textContent = "Kiwi";
liste.append(li);` }],
    hints: [
      "Trois étapes : créer le `li`, lui donner son texte, l’ajouter à la liste.",
      "Pour l’ajouter à la fin d’un parent, utilise `append`.",
      "`const li = document.createElement(\"li\");` `li.textContent = \"Kiwi\";` `liste.append(li);`",
    ],
    explanation: "On crée le `li`, on lui donne son texte, puis `liste.append(li)` l’ajoute après « Banane ».",
    retain: "`createElement`, `textContent`, `append`.",
  },
  {
    id: "cre-5", lesson: "creer", notion: "Créer et ajouter des éléments", type: "lab", difficulty: 3,
    question: "À partir du tableau `prenoms`, ajoute un `<li>` par prénom dans la liste `#liste`, avec une boucle.",
    files: labFiles(`<ul id="liste"></ul>`, `const prenoms = ["Léa", "Sam", "Inès"];
const liste = document.getElementById("liste");

// Crée un li par prénom et ajoute-le à la liste
`, { lockHtml: true }),
    tests: [{ expr: `Array.from(document.querySelectorAll("#liste li")).map((li) => li.textContent)`, expect: ["Léa", "Sam", "Inès"], label: "La liste doit contenir Léa, Sam, Inès (dans cet ordre)" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "createElement", msg: "Utilise `document.createElement(\"li\")`." }],
    solution: [{ name: "script.js", code: `const prenoms = ["Léa", "Sam", "Inès"];
const liste = document.getElementById("liste");

for (const prenom of prenoms) {
  const li = document.createElement("li");
  li.textContent = prenom;
  liste.append(li);
}` }],
    hints: [
      "Il faut répéter les trois étapes pour chaque prénom : une boucle.",
      "`for (const prenom of prenoms) { ... }` : à l’intérieur, crée un `li`, mets-lui le texte `prenom`, ajoute-le.",
      "`const li = document.createElement(\"li\"); li.textContent = prenom; liste.append(li);`",
    ],
    explanation: "À chaque tour, on crée un nouveau `li` (un seul par tour : un même élément ne peut être qu’à un endroit), on y met le prénom et on l’ajoute à la liste.",
    retain: "Une boucle qui crée et ajoute un élément par donnée.",
  },

  // ═════════════ NIVEAU 3 — Supprimer ═════════════
  {
    id: "sup-1", lesson: "supprimer", notion: "Supprimer des éléments", type: "qcm", difficulty: 1,
    question: "Quelle instruction supprime l’élément `pomme` de la page ?",
    options: ["`pomme.remove()`", "`pomme.delete()`", "`document.remove(pomme)`", "`pomme = null`"],
    answer: 0,
    why: [
      "",
      "`delete` n’est pas une méthode des éléments.",
      "`remove` s’appelle sur l’élément lui-même, pas sur `document`.",
      "Cela vide la variable, mais l’élément reste dans la page.",
    ],
    hints: [
      "La méthode porte un nom simple, qui signifie « retirer » en anglais.",
      "Elle s’appelle directement sur l’élément à supprimer.",
      "`pomme.remove()`",
    ],
    explanation: "`element.remove()` retire l’élément du DOM : il disparaît de la page.",
    retain: "`element.remove()` supprime un élément.",
  },
  {
    id: "sup-2", lesson: "supprimer", notion: "Supprimer des éléments", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ?",
    code: `<ul id="l">
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>
<script>
  const l = document.getElementById("l");
  l.firstElementChild.remove();
  l.lastElementChild.remove();
  console.log(l.children.length, l.firstElementChild.textContent);
</script>`,
    answers: ["1 B"],
    common: { "3 A": "Les deux suppressions sont exécutées avant l’affichage.", "1 A": "Le premier élément (A) est supprimé : il ne reste que B." },
    hints: [
      "Suis la liste après chaque suppression.",
      "Départ : A, B, C. On retire le premier (A), puis le dernier (C).",
      "Il reste un seul élément : B.",
    ],
    explanation: "Départ : A, B, C. On supprime le premier (A) puis le dernier (C). Il reste B : un enfant, dont le texte est `B`.",
    retain: "Après `remove()`, l’élément n’est plus dans la liste.",
  },
  {
    id: "sup-3", lesson: "supprimer", notion: "Supprimer des éléments", type: "qcm", label: "Trouver l’erreur", difficulty: 3,
    question: "On veut supprimer tous les `li`, mais il en reste quelques-uns. Pourquoi ?",
    code: `const liste = document.getElementById("liste");
for (const li of liste.children) {
  li.remove();
}`,
    options: [
      "`remove()` ne fonctionne pas dans une boucle.",
      "`children` est une liste « vivante » : elle change pendant la boucle, et un élément sur deux est sauté.",
      "Il faut utiliser `while` au lieu de `for`.",
      "`remove` n’existe pas pour les `li`.",
    ],
    answer: 1,
    why: [
      "`remove()` fonctionne très bien dans une boucle, avec une liste figée.",
      "",
      "Le type de boucle n’est pas en cause ici.",
      "`remove` existe pour tous les éléments.",
    ],
    hints: [
      "Que devient la liste `children` quand on supprime le premier élément ?",
      "La liste se met à jour tout de suite : les éléments suivants se décalent.",
      "Utilise une liste figée (`querySelectorAll`) ou `liste.replaceChildren()`.",
    ],
    explanation: "`children` est « vivante » : à chaque suppression, les éléments restants se décalent d’une place, et la boucle saute celui qui prend la place du supprimé. `querySelectorAll` renvoie une liste figée ; `replaceChildren()` vide d’un coup.",
    retain: "Pour tout supprimer : `querySelectorAll` + `remove`, ou `replaceChildren()`.",
  },
  {
    id: "sup-4", lesson: "supprimer", notion: "Supprimer des éléments", type: "lab", difficulty: 1,
    question: "Supprime le paragraphe `#pub` de la page.",
    files: labFiles(`<h1>Mon article</h1>
<p>Un texte intéressant.</p>
<p id="pub">Publicité !</p>`, `// Supprime #pub
`, { lockHtml: true }),
    tests: [{ expr: `document.getElementById("pub")`, expect: null, label: "L’élément `#pub` ne doit plus exister dans la page" }],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const pub = document.getElementById("pub");
pub.remove();` }],
    hints: [
      "Sélectionne d’abord l’élément.",
      "Puis appelle la méthode qui retire un élément.",
      "`document.getElementById(\"pub\").remove();`",
    ],
    explanation: "`remove()` retire l’élément de la page. Ensuite, `getElementById(\"pub\")` renvoie `null` : il n’existe plus.",
    retain: "`element.remove()`.",
  },
  {
    id: "sup-5", lesson: "supprimer", notion: "Supprimer des éléments", type: "lab", difficulty: 3,
    question: "Supprime tous les `li` qui ont la classe `termine`.",
    files: labFiles(`<ul>
  <li>Courses</li>
  <li class="termine">Ménage</li>
  <li>Devoirs</li>
  <li class="termine">Sport</li>
</ul>`, `// Supprime les tâches terminées
`, { lockHtml: true }),
    tests: [{ expr: `Array.from(document.querySelectorAll("li")).map((li) => li.textContent)`, expect: ["Courses", "Devoirs"], label: "Il doit rester « Courses » et « Devoirs »" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "querySelectorAll", msg: "Utilise `querySelectorAll(\"li.termine\")`." }],
    solution: [{ name: "script.js", code: `const terminees = document.querySelectorAll("li.termine");
terminees.forEach((tache) => tache.remove());` }],
    hints: [
      "Il faut sélectionner tous les `li` qui ont la classe `termine`, puis supprimer chacun.",
      "Le sélecteur est `li.termine`. `querySelectorAll` renvoie une liste figée : on peut la parcourir en supprimant.",
      "`document.querySelectorAll(\"li.termine\").forEach((tache) => tache.remove());`",
    ],
    explanation: "`querySelectorAll(\"li.termine\")` renvoie une liste figée des tâches terminées : on peut la parcourir en toute sécurité et appeler `remove()` sur chacune.",
    retain: "`querySelectorAll` + `forEach` + `remove`.",
  },
  {
    id: "sup-6", lesson: "supprimer", notion: "Supprimer des éléments", type: "lab", difficulty: 3,
    question: "Mini-projet : la liste `#liste` contient trois tâches. Supprime la première, puis ajoute à la fin une nouvelle tâche « Lire ».",
    files: labFiles(`<ul id="liste">
  <li>Courses</li>
  <li>Ménage</li>
  <li>Devoirs</li>
</ul>`, `// 1. Supprime la première tâche
// 2. Ajoute une tâche « Lire » à la fin
`, { lockHtml: true }),
    tests: [{ expr: `Array.from(document.querySelectorAll("#liste li")).map((li) => li.textContent)`, expect: ["Ménage", "Devoirs", "Lire"], label: "La liste doit être : Ménage, Devoirs, Lire" }],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const liste = document.getElementById("liste");
liste.firstElementChild.remove();

const nouvelle = document.createElement("li");
nouvelle.textContent = "Lire";
liste.append(nouvelle);` }],
    hints: [
      "Deux étapes : supprimer, puis créer et ajouter.",
      "Première tâche : `liste.firstElementChild.remove()`. Nouvelle tâche : `createElement`, `textContent`, `append`.",
      "`liste.firstElementChild.remove();` puis `const nouvelle = document.createElement(\"li\"); nouvelle.textContent = \"Lire\"; liste.append(nouvelle);`",
    ],
    explanation: "On retire le premier `li` avec `firstElementChild.remove()`, puis on crée un nouveau `li`, on lui donne son texte et on l’ajoute à la fin avec `append`.",
    retain: "Supprimer, créer et ajouter se combinent pour faire vivre une liste.",
  },

  // ═════════════ NIVEAU 4 — addEventListener ═════════════
  {
    id: "evt-1", lesson: "evenements", notion: "addEventListener", type: "qcm", difficulty: 1,
    question: "Quelle écriture exécute la fonction `saluer` à chaque clic sur `bouton` ?",
    options: [
      "`bouton.addEventListener(\"click\", saluer)`",
      "`bouton.addEventListener(\"click\", saluer())`",
      "`bouton.addEventListener(saluer, \"click\")`",
      "`bouton.addEventListener(\"clic\", saluer)`",
    ],
    answer: 0,
    why: [
      "",
      "Avec les parenthèses, `saluer` est appelée tout de suite, au chargement : on donne son résultat, pas la fonction.",
      "Les arguments sont dans le mauvais ordre : le type d’événement d’abord, la fonction ensuite.",
      "Le type d’événement s’appelle `\"click\"` en anglais : avec `\"clic\"`, rien ne se passe.",
    ],
    hints: [
      "`addEventListener` reçoit deux choses : un type d’événement, puis une fonction.",
      "On donne la fonction elle-même, sans l’appeler : pas de parenthèses.",
      "`bouton.addEventListener(\"click\", saluer)`",
    ],
    explanation: "On passe le type (`\"click\"`) puis la fonction `saluer` sans parenthèses : le navigateur l’appellera à chaque clic.",
    retain: "`addEventListener(\"type\", fonction)` : la fonction, pas son appel.",
  },
  {
    id: "evt-2", lesson: "evenements", notion: "addEventListener", type: "vf", difficulty: 1,
    statement: "Le code à l’intérieur d’un gestionnaire d’événement s’exécute immédiatement, au moment où on écrit `addEventListener`.",
    answer: false,
    why: "Le gestionnaire s’exécute plus tard, à chaque fois que l’événement se produit. `addEventListener` ne fait qu’enregistrer la fonction.",
    hints: [
      "`addEventListener` indique au navigateur quoi faire en cas d’événement.",
      "Tant qu’il n’y a pas de clic, il n’y a rien à exécuter.",
      "L’affirmation est fausse.",
    ],
    explanation: "On enregistre la fonction avec `addEventListener`. Elle est exécutée plus tard, et autant de fois qu’il y a d’événements.",
    retain: "Un gestionnaire s’exécute à chaque événement, pas à l’inscription.",
  },
  {
    id: "evt-3", lesson: "evenements", notion: "addEventListener", type: "predict", difficulty: 2, env: "browser",
    question: "La page est chargée, puis la personne clique deux fois sur le bouton. Qu’affiche la console ? (une ligne par affichage)",
    code: `<button id="b">Clique</button>
<script>
  let n = 0;
  document.getElementById("b").addEventListener("click", () => {
    n++;
    console.log(n);
  });
</script>`,
    rows: 2,
    simulate: [{ do: "click", target: "#b", times: 2 }],
    answers: ["1\n2"],
    common: { "1\n1": "`n` est déclarée en dehors du gestionnaire : sa valeur est conservée d’un clic à l’autre.", "2": "Le gestionnaire s’exécute à chaque clic : il y a deux affichages, un par clic." },
    hints: [
      "Le gestionnaire s’exécute une fois par clic.",
      "`n` est déclarée en dehors : elle garde sa valeur entre deux clics.",
      "Premier clic : 1. Deuxième clic : 2.",
    ],
    explanation: "`n` vaut 0 au départ. Au premier clic, elle passe à 1 et s’affiche. Au deuxième, elle passe à 2 et s’affiche.",
    retain: "Une variable extérieure garde sa valeur d’un clic à l’autre.",
  },
  {
    id: "evt-4", lesson: "evenements", notion: "addEventListener", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "On voudrait compter les clics, mais la console affiche toujours 1. Pourquoi ?",
    code: `bouton.addEventListener("click", () => {
  let compteur = 0;
  compteur++;
  console.log(compteur);
});`,
    options: [
      "`compteur` est recréée à 0 à chaque clic : elle doit être déclarée en dehors du gestionnaire.",
      "`addEventListener` ne peut écouter qu’un seul clic.",
      "Il faut remplacer `compteur++` par `compteur + 1`.",
      "Il faut utiliser `const` au lieu de `let`.",
    ],
    answer: 0,
    why: [
      "",
      "`addEventListener` écoute tous les clics, sans limite.",
      "`compteur + 1` ne modifierait pas la variable : ce serait pire.",
      "`const` interdirait même le `compteur++`.",
    ],
    hints: [
      "Quand la variable est-elle créée ?",
      "Chaque clic exécute le gestionnaire en entier, y compris la ligne `let compteur = 0;`.",
      "Déclare `let compteur = 0;` avant le `addEventListener`.",
    ],
    explanation: "Les variables locales d’une fonction sont recréées à chaque appel. Pour conserver une valeur d’un clic à l’autre, on déclare la variable à l’extérieur du gestionnaire.",
    retain: "Valeur à conserver = variable déclarée à l’extérieur.",
  },
  {
    id: "evt-5", lesson: "evenements", notion: "addEventListener", type: "lab", difficulty: 1,
    question: "Au clic sur le bouton `#bouton`, change le texte du paragraphe `#message` en « Bravo ! ».",
    files: labFiles(`<button id="bouton">Clique-moi</button>
<p id="message">En attente…</p>`, `// Au clic sur #bouton, change le texte de #message
`, { lockHtml: true }),
    actions: [{ do: "click", target: "#bouton" }],
    tests: [{ expr: `document.getElementById("message").textContent`, expect: "Bravo !", label: "Après un clic, le message doit afficher « Bravo ! »" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "addEventListener", msg: "Utilise `addEventListener(\"click\", ...)`." }],
    solution: [{ name: "script.js", code: `const bouton = document.getElementById("bouton");
const message = document.getElementById("message");

bouton.addEventListener("click", () => {
  message.textContent = "Bravo !";
});` }],
    hints: [
      "Sélectionne le bouton et le paragraphe, puis écoute le clic sur le bouton.",
      "Dans le gestionnaire, modifie `textContent` du paragraphe.",
      "`bouton.addEventListener(\"click\", () => { message.textContent = \"Bravo !\"; });`",
    ],
    explanation: "Le changement de texte est placé dans le gestionnaire : il n’a lieu qu’au clic, pas au chargement de la page.",
    retain: "Ce qui doit se produire au clic va dans le gestionnaire.",
  },
  {
    id: "evt-6", lesson: "evenements", notion: "addEventListener", type: "lab", difficulty: 2,
    question: "Crée un compteur : chaque clic sur `#plus` augmente de 1 le nombre affiché dans `#compteur`.",
    files: labFiles(`<p>Compteur : <span id="compteur">0</span></p>
<button id="plus">+1</button>`, `// À chaque clic sur #plus, ajoute 1 au nombre affiché dans #compteur
`, { lockHtml: true }),
    actions: [{ do: "click", target: "#plus", times: 3 }],
    tests: [{ expr: `document.getElementById("compteur").textContent`, expect: "3", label: "Après 3 clics, le compteur doit afficher 3" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "addEventListener", msg: "Utilise `addEventListener(\"click\", ...)`." }],
    solution: [{ name: "script.js", code: `const plus = document.getElementById("plus");
const compteur = document.getElementById("compteur");
let total = 0;

plus.addEventListener("click", () => {
  total++;
  compteur.textContent = total;
});` }],
    hints: [
      "Il faut mémoriser le nombre de clics dans une variable déclarée avant le gestionnaire.",
      "Dans le gestionnaire : augmente la variable, puis écris-la dans `textContent`.",
      "`let total = 0;` puis `plus.addEventListener(\"click\", () => { total++; compteur.textContent = total; });`",
    ],
    explanation: "La variable `total` est déclarée à l’extérieur : elle garde sa valeur d’un clic à l’autre. À chaque clic, on l’augmente et on l’affiche.",
    retain: "Compteur = variable extérieure + mise à jour de l’affichage dans le gestionnaire.",
  },

  // ═════════════ NIVEAU 4 — Souris ═════════════
  {
    id: "sou-1", lesson: "souris", notion: "Événements de la souris", type: "qcm", difficulty: 1,
    question: "Quel événement se déclenche quand le pointeur entre sur un élément (sans se redéclencher quand on passe d’un de ses enfants à un autre) ?",
    options: ["`mouseenter`", "`mouseover`", "`mousemove`", "`hover`"],
    answer: 0,
    why: [
      "",
      "`mouseover` se redéclenche à chaque passage d’un enfant à un autre.",
      "`mousemove` se déclenche à chaque déplacement du pointeur.",
      "`hover` n’existe pas comme événement (c’est une pseudo-classe CSS).",
    ],
    hints: [
      "Il existe un couple d’événements pour l’entrée et la sortie, qui ne tient pas compte des enfants.",
      "Les noms commencent par `mouse`.",
      "`mouseenter` (et `mouseleave` à la sortie).",
    ],
    explanation: "`mouseenter` et `mouseleave` ne tiennent pas compte des éléments enfants : ils sont plus simples pour gérer un survol.",
    retain: "Survol : `mouseenter` et `mouseleave`.",
  },
  {
    id: "sou-2", lesson: "souris", notion: "Événements de la souris", type: "vf", difficulty: 2,
    statement: "Dans un gestionnaire `mousedown`, `event.button` vaut 0 pour le bouton gauche de la souris.",
    answer: true,
    why: "C’est bien le cas : 0 pour le bouton gauche, 1 pour le milieu, 2 pour le droit.",
    hints: [
      "Les boutons sont numérotés en partant de zéro.",
      "0 : gauche, 1 : milieu, 2 : droit.",
      "L’affirmation est vraie.",
    ],
    explanation: "`event.button` vaut 0 (gauche), 1 (milieu) ou 2 (droit).",
    retain: "`event.button` : 0 gauche, 1 milieu, 2 droit.",
  },
  {
    id: "sou-3", lesson: "souris", notion: "Événements de la souris", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Cliquer sur le bouton n’affiche rien dans la console, et aucune erreur n’apparaît. Pourquoi ?",
    code: `bouton.addEventListener("onclick", () => {
  console.log("Clic !");
});`,
    options: [
      "Le type d’événement s’écrit `\"click\"`, sans « on ».",
      "Il faut utiliser `console.error`.",
      "`addEventListener` ne marche pas avec les boutons.",
      "Il faut une fonction nommée, pas une fonction fléchée.",
    ],
    answer: 0,
    why: [
      "",
      "`console.log` affiche très bien un message.",
      "`addEventListener` marche avec tous les éléments, boutons compris.",
      "Une fonction fléchée convient parfaitement comme gestionnaire.",
    ],
    hints: [
      "Regarde le premier argument de `addEventListener`.",
      "Les noms d’événements sont comme `click`, `keydown`, `submit` : sans préfixe.",
      "Remplace `\"onclick\"` par `\"click\"`.",
    ],
    explanation: "Avec `\"onclick\"`, le navigateur écoute un événement qui n’existe pas : il n’y a ni erreur, ni gestionnaire appelé. Le type correct est `\"click\"`.",
    retain: "Type d’événement sans « on » : `\"click\"`.",
  },
  {
    id: "sou-4", lesson: "souris", notion: "Événements de la souris", type: "lab", difficulty: 2,
    question: "Quand le pointeur entre sur `#bouton`, ajoute-lui la classe `survol` ; quand il en sort, retire-la.",
    files: labFiles(`<button id="bouton">Survole-moi</button>`, `// mouseenter : ajoute la classe survol
// mouseleave : retire la classe survol
`, { lockHtml: true, lockCss: true, cssCode: `.survol {
  background: gold;
  border-color: orange;
}` }),
    actions: [
      { do: "mouse", type: "mouseenter", target: "#bouton" },
      { do: "mouse", type: "mouseleave", target: "#bouton" },
    ],
    tests: [
      { expr: `document.getElementById("bouton").classList.contains("survol")`, expect: true, afterAction: 0, label: "À l’entrée du pointeur, le bouton doit avoir la classe `survol`" },
      { expr: `document.getElementById("bouton").classList.contains("survol")`, expect: false, label: "À la sortie du pointeur, la classe `survol` doit être retirée" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const bouton = document.getElementById("bouton");

bouton.addEventListener("mouseenter", () => {
  bouton.classList.add("survol");
});
bouton.addEventListener("mouseleave", () => {
  bouton.classList.remove("survol");
});` }],
    hints: [
      "Il faut deux écouteurs : un pour l’entrée, un pour la sortie.",
      "Les événements s’appellent `mouseenter` et `mouseleave`. Utilise `classList.add` et `classList.remove`.",
      "`bouton.addEventListener(\"mouseenter\", () => { bouton.classList.add(\"survol\"); });` puis la même chose avec `mouseleave` et `remove`.",
    ],
    explanation: "`mouseenter` ajoute la classe, `mouseleave` la retire : le CSS fait le changement visuel pendant le survol.",
    retain: "Survol = `mouseenter` + `mouseleave` + une classe.",
  },
  {
    id: "sou-5", lesson: "souris", notion: "Événements de la souris", type: "lab", difficulty: 2,
    question: "Au double-clic sur `#zone`, affiche « Double-clic ! » dans la console.",
    files: labFiles(`<div id="zone">Double-clique ici</div>`, `// Écoute le double-clic sur #zone
`, { lockHtml: true }),
    actions: [{ do: "mouse", type: "dblclick", target: "#zone" }],
    tests: [],
    expectLogs: [{ level: "log", text: "Double-clic !", label: "La console doit afficher « Double-clic ! » après un double-clic." }],
    mustContain: [],
    solution: [{ name: "script.js", code: `const zone = document.getElementById("zone");
zone.addEventListener("dblclick", () => {
  console.log("Double-clic !");
});` }],
    hints: [
      "Il existe un type d’événement spécifique au double-clic.",
      "Son nom est une abréviation de « double click ».",
      "`zone.addEventListener(\"dblclick\", () => { console.log(\"Double-clic !\"); });`",
    ],
    explanation: "Le type `\"dblclick\"` correspond au double-clic. Le gestionnaire affiche le message.",
    retain: "`dblclick` : double-clic.",
  },
  {
    id: "sou-6", lesson: "souris", notion: "Événements de la souris", type: "lab", difficulty: 3,
    question: "Quand le pointeur bouge sur `#zone` (`mousemove`), affiche dans `#position` ses coordonnées sous la forme « x, y » (par exemple « 120, 45 »), avec `event.clientX` et `event.clientY`.",
    files: labFiles(`<div id="zone">Bouge la souris ici</div>
<p id="position">-</p>`, `// Écoute mousemove sur #zone et affiche les coordonnées dans #position
`, { lockHtml: true }),
    actions: [{ do: "mouse", type: "mousemove", target: "#zone", x: 120, y: 45 }],
    tests: [{ expr: `document.getElementById("position").textContent`, expect: "120, 45", label: "`#position` doit afficher « 120, 45 »" }],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const zone = document.getElementById("zone");
const position = document.getElementById("position");

zone.addEventListener("mousemove", (event) => {
  position.textContent = event.clientX + ", " + event.clientY;
});` }],
    hints: [
      "Le gestionnaire doit recevoir l’objet `event` en paramètre.",
      "Les coordonnées sont dans `event.clientX` et `event.clientY`.",
      "`position.textContent = event.clientX + \", \" + event.clientY;`",
    ],
    explanation: "Le gestionnaire reçoit `event`, qui contient la position du pointeur. On construit le texte « x, y » et on l’écrit dans la page.",
    retain: "`event.clientX` et `event.clientY` : position du pointeur.",
  },

  // ═════════════ NIVEAU 4 — Clavier ═════════════
  {
    id: "cla-1", lesson: "clavier", notion: "Événements du clavier", type: "qcm", difficulty: 1,
    question: "Quelle valeur a `event.key` quand on appuie sur la touche Entrée ?",
    options: ["`\"Enter\"`", "`\"enter\"`", "`13`", "`\"Return\"`"],
    answer: 0,
    why: [
      "",
      "`event.key` respecte les majuscules : `\"Enter\"`, pas `\"enter\"`.",
      "Le code numérique 13 est celui de l’ancienne propriété `keyCode`, qu’on n’utilise plus.",
      "Pour cette touche, `event.key` vaut `\"Enter\"`.",
    ],
    hints: [
      "Le nom de la touche est en anglais, avec une majuscule.",
      "C’est le même mot que sur le clavier anglais.",
      "`\"Enter\"`",
    ],
    explanation: "`event.key` donne le nom de la touche : `\"Enter\"` pour Entrée (avec la majuscule).",
    retain: "`event.key === \"Enter\"`.",
  },
  {
    id: "cla-2", lesson: "clavier", notion: "Événements du clavier", type: "vf", difficulty: 2,
    statement: "`event.key` dépend de la disposition du clavier (AZERTY, QWERTY…), alors que `event.code` désigne la touche physique.",
    answer: true,
    why: "`event.key` renvoie le caractère produit (un « a » sur un AZERTY, un « q » à la même place sur un QWERTY), alors que `event.code` désigne l’emplacement physique de la touche.",
    hints: [
      "Pense à la touche A d’un clavier AZERTY, qui se trouve au même endroit que le Q d’un clavier QWERTY.",
      "`key` : ce que la touche produit. `code` : où se trouve la touche.",
      "L’affirmation est vraie.",
    ],
    explanation: "`event.key` suit la disposition du clavier, `event.code` désigne la position physique de la touche.",
    retain: "`key` : le caractère produit. `code` : la touche physique.",
  },
  {
    id: "cla-3", lesson: "clavier", notion: "Événements du clavier", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Appuyer sur Entrée dans le champ n’affiche rien. Pourquoi ?",
    code: `champ.addEventListener("keydown", (event) => {
  if (event.key === "enter") {
    console.log("Validé");
  }
});`,
    options: [
      "Il faut écrire `\"Enter\"` avec une majuscule.",
      "Il faut utiliser `keyup` à la place de `keydown`.",
      "`event.key` n’existe pas.",
      "Il faut comparer avec `==` et non `===`.",
    ],
    answer: 0,
    why: [
      "",
      "`keydown` et `keyup` fonctionnent tous les deux : ce n’est pas la cause.",
      "`event.key` existe bien : c’est la propriété qui donne la touche.",
      "`===` est la bonne comparaison : le problème est dans le texte comparé.",
    ],
    hints: [
      "La condition compare `event.key` à un texte. Les deux textes sont-ils identiques ?",
      "JavaScript distingue les majuscules des minuscules.",
      "Remplace `\"enter\"` par `\"Enter\"`.",
    ],
    explanation: "`event.key` vaut `\"Enter\"` avec une majuscule. `\"enter\"` ne lui est jamais égal, donc la condition est toujours fausse.",
    retain: "`\"Enter\"`, `\"Escape\"`, `\"ArrowUp\"` : avec majuscule.",
  },
  {
    id: "cla-4", lesson: "clavier", notion: "Événements du clavier", type: "predict", difficulty: 2, env: "browser",
    question: "La personne appuie sur la touche « a », puis sur la touche Échap (Escape). Qu’affiche la console ? (une ligne par affichage)",
    code: `<script>
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      console.log("fermé");
    } else {
      console.log("touche " + event.key);
    }
  });
</script>`,
    rows: 2,
    simulate: [
      { do: "key", target: "document", key: "a" },
      { do: "key", target: "document", key: "Escape" },
    ],
    answers: ["touche a\nfermé"],
    common: { "fermé\ntouche a": "Les touches sont traitées dans l’ordre où elles sont pressées : « a » d’abord." },
    hints: [
      "Le gestionnaire s’exécute une fois par touche.",
      "Première touche : `a`, qui n’est pas `\"Escape\"` : on passe dans le `else`.",
      "Première ligne : `touche a`. Deuxième ligne : `fermé`.",
    ],
    explanation: "Pour `a`, la condition est fausse : le `else` affiche `touche a`. Pour Échap, la condition est vraie : on affiche `fermé`.",
    retain: "Un gestionnaire de clavier teste `event.key` pour choisir quoi faire.",
  },
  {
    id: "cla-5", lesson: "clavier", notion: "Événements du clavier", type: "lab", difficulty: 2,
    question: "Quand on appuie sur Entrée dans le champ `#champ`, écris dans `#resultat` le texte « Validé : » suivi de la valeur du champ.",
    files: labFiles(`<input id="champ" type="text" placeholder="Ton texte">
<p id="resultat"></p>`, `// Écoute keydown sur #champ : si la touche est Entrée, affiche le résultat
`, { lockHtml: true }),
    actions: [
      { do: "input", target: "#champ", value: "Léa" },
      { do: "key", target: "#champ", type: "keydown", key: "Enter" },
    ],
    tests: [{ expr: `document.getElementById("resultat").textContent`, expect: "Validé : Léa", label: "`#resultat` doit afficher « Validé : Léa »" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "Enter", msg: "Compare `event.key` avec `\"Enter\"`." }],
    solution: [{ name: "script.js", code: `const champ = document.getElementById("champ");
const resultat = document.getElementById("resultat");

champ.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    resultat.textContent = "Validé : " + champ.value;
  }
});` }],
    hints: [
      "Écoute `keydown` sur le champ, et teste la touche.",
      "La touche Entrée correspond à `event.key === \"Enter\"`.",
      "`resultat.textContent = \"Validé : \" + champ.value;` dans le `if`.",
    ],
    explanation: "Le gestionnaire est appelé à chaque touche. Le `if` ne laisse passer que Entrée, et lit alors la valeur du champ.",
    retain: "`if (event.key === \"Enter\") { ... }`.",
  },
  {
    id: "cla-6", lesson: "clavier", notion: "Événements du clavier", type: "lab", difficulty: 3,
    question: "Quand on appuie sur Échap, n’importe où dans la page (écoute `document`), vide le champ `#champ`.",
    files: labFiles(`<input id="champ" type="text" value="Du texte à effacer">`, `// Écoute keydown sur document : Échap vide le champ
`, { lockHtml: true }),
    actions: [{ do: "key", target: "document", type: "keydown", key: "Escape" }],
    tests: [{ expr: `document.getElementById("champ").value`, expect: "", label: "Après Échap, le champ doit être vide" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "Escape", msg: "Compare `event.key` avec `\"Escape\"`." }],
    solution: [{ name: "script.js", code: `const champ = document.getElementById("champ");

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    champ.value = "";
  }
});` }],
    hints: [
      "L’écouteur se pose sur `document`, pas sur le champ.",
      "La touche Échap vaut `\"Escape\"`.",
      "`champ.value = \"\";` dans le `if`.",
    ],
    explanation: "Un écouteur sur `document` reçoit toutes les touches, où que soit le focus. Pour Échap, on vide le champ en lui donnant la valeur vide.",
    retain: "Raccourci global = écouteur sur `document`.",
  },

  // ═════════════ NIVEAU 4 — Saisie ═════════════
  {
    id: "sai-1", lesson: "saisie", notion: "input et change", type: "qcm", difficulty: 1,
    question: "Quel événement se déclenche à chaque lettre tapée dans un champ de texte ?",
    options: ["`input`", "`change`", "`submit`", "`focus`"],
    answer: 0,
    why: [
      "",
      "`change` se déclenche quand la valeur est validée (par exemple en quittant le champ), pas à chaque lettre.",
      "`submit` concerne l’envoi d’un formulaire.",
      "`focus` se déclenche quand le champ reçoit le focus.",
    ],
    hints: [
      "On cherche l’événement du « live » : à chaque modification.",
      "Son nom signifie « entrée » en anglais.",
      "`input`",
    ],
    explanation: "`input` est déclenché à chaque modification du contenu : lettre tapée, collée ou supprimée.",
    retain: "`input` : en direct. `change` : à la validation.",
  },
  {
    id: "sai-2", lesson: "saisie", notion: "input et change", type: "predict", difficulty: 3, env: "browser",
    question: "La personne remplace le contenu du champ par « 7 ». Qu’affiche la console ?",
    code: `<input id="c" type="text" value="5">
<script>
  const c = document.getElementById("c");
  c.addEventListener("input", () => {
    console.log(c.value + 1);
  });
</script>`,
    simulate: [{ do: "input", target: "#c", value: "7" }],
    answers: ["71"],
    common: { "8": "`c.value` est du texte : `\"7\" + 1` colle les deux, ce qui donne `\"71\"`. Pour additionner, il faudrait `Number(c.value) + 1`." },
    hints: [
      "Quel est le type de `c.value` ?",
      "`value` est toujours du texte. Que fait `+` entre un texte et un nombre ?",
      "Le `+` colle : `\"7\"` et `1` donnent `71`.",
    ],
    explanation: "`c.value` vaut le texte `\"7\"`. Avec `+ 1`, JavaScript colle les deux : `\"71\"`. Pour calculer, on convertit d’abord avec `Number(c.value)`.",
    retain: "`value` est du texte : `Number(...)` pour calculer.",
  },
  {
    id: "sai-3", lesson: "saisie", notion: "input et change", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Après avoir tapé du texte et cliqué sur le bouton, la console affiche toujours un texte vide. Pourquoi ?",
    code: `const texte = champ.value;

bouton.addEventListener("click", () => {
  console.log(texte);
});`,
    options: [
      "La valeur est lue au chargement de la page, quand le champ est vide : il faut la lire dans le gestionnaire.",
      "`console.log` ne peut pas afficher un texte.",
      "Il faut utiliser `champ.textContent`.",
      "Le bouton doit être de type `submit`.",
    ],
    answer: 0,
    why: [
      "",
      "`console.log` affiche très bien du texte.",
      "Pour un champ de saisie, la propriété est bien `value`, pas `textContent`.",
      "Le type du bouton n’a aucun rapport avec ce problème.",
    ],
    hints: [
      "À quel moment la ligne 1 est-elle exécutée ?",
      "Au chargement de la page : le champ est encore vide. La variable `texte` ne change plus ensuite.",
      "Déplace `const texte = champ.value;` à l’intérieur du gestionnaire.",
    ],
    explanation: "La ligne 1 s’exécute une seule fois, au chargement, et range un texte vide. Pour avoir la valeur actuelle, il faut lire `champ.value` au moment du clic, dans le gestionnaire.",
    retain: "Lis la valeur au moment où tu en as besoin : dans le gestionnaire.",
  },
  {
    id: "sai-4", lesson: "saisie", notion: "input et change", type: "lab", difficulty: 2,
    question: "Affiche en direct, dans `#apercu`, le texte tapé dans `#champ`.",
    files: labFiles(`<input id="champ" type="text" placeholder="Tape ici">
<p id="apercu"></p>`, `// À chaque modification de #champ, recopie son texte dans #apercu
`, { lockHtml: true }),
    actions: [{ do: "input", target: "#champ", value: "Salut" }],
    tests: [{ expr: `document.getElementById("apercu").textContent`, expect: "Salut", label: "`#apercu` doit afficher « Salut »" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "[\"']input[\"']", msg: "Utilise l’événement `\"input\"`." }],
    solution: [{ name: "script.js", code: `const champ = document.getElementById("champ");
const apercu = document.getElementById("apercu");

champ.addEventListener("input", () => {
  apercu.textContent = champ.value;
});` }],
    hints: [
      "L’événement qui se déclenche à chaque modification du champ s’appelle `input`.",
      "Dans le gestionnaire, lis `champ.value` et écris-le dans `apercu.textContent`.",
      "`champ.addEventListener(\"input\", () => { apercu.textContent = champ.value; });`",
    ],
    explanation: "À chaque modification, le gestionnaire lit la valeur actuelle du champ et la recopie dans l’aperçu.",
    retain: "Aperçu en direct = `input` + `champ.value`.",
  },
  {
    id: "sai-5", lesson: "saisie", notion: "input et change", type: "lab", difficulty: 3,
    question: "Le bouton `#envoyer` est désactivé au départ. Quand la case `#cgu` est cochée, active-le ; quand elle est décochée, désactive-le.",
    files: labFiles(`<label><input id="cgu" type="checkbox"> J'accepte les conditions</label>
<button id="envoyer" disabled>Envoyer</button>`, `// Quand la case change, active ou désactive le bouton
`, { lockHtml: true }),
    actions: [
      { do: "click", target: "#cgu" },
      { do: "click", target: "#cgu" },
    ],
    tests: [
      { expr: `document.getElementById("envoyer").disabled`, expect: false, afterAction: 0, label: "Case cochée : le bouton doit être activé" },
      { expr: `document.getElementById("envoyer").disabled`, expect: true, label: "Case décochée : le bouton doit être désactivé" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const cgu = document.getElementById("cgu");
const envoyer = document.getElementById("envoyer");

cgu.addEventListener("change", () => {
  envoyer.disabled = !cgu.checked;
});` }],
    hints: [
      "L’événement d’une case à cocher est `change` ; son état est dans `checked`.",
      "Le bouton est désactivé quand la case n’est PAS cochée.",
      "`envoyer.disabled = !cgu.checked;`",
    ],
    explanation: "`cgu.checked` vaut `true` quand la case est cochée. Le bouton doit être désactivé dans le cas contraire : `disabled` prend la valeur inverse (`!`).",
    retain: "`case.checked` donne l’état ; `!` l’inverse.",
  },
  {
    id: "sai-6", lesson: "saisie", notion: "input et change", type: "lab", difficulty: 2,
    question: "Quand on choisit une option dans la liste `#couleur`, change la couleur de fond du `body` avec la valeur de l’option choisie.",
    files: labFiles(`<select id="couleur">
  <option value="">Choisis une couleur</option>
  <option value="lightblue">Bleu</option>
  <option value="lightgreen">Vert</option>
  <option value="pink">Rose</option>
</select>`, `// Au changement de #couleur, colore le fond du body
`, { lockHtml: true }),
    actions: [{ do: "change", target: "#couleur", value: "lightblue" }],
    tests: [{ expr: `document.body.style.backgroundColor`, expect: "lightblue", label: "Le fond du body doit être « lightblue »" }],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const couleur = document.getElementById("couleur");

couleur.addEventListener("change", () => {
  document.body.style.backgroundColor = couleur.value;
});` }],
    hints: [
      "Pour une liste déroulante, l’événement est `change`.",
      "La valeur de l’option choisie est dans `couleur.value`.",
      "`document.body.style.backgroundColor = couleur.value;`",
    ],
    explanation: "Au changement, `couleur.value` contient la valeur de l’option choisie (`\"lightblue\"`…). On l’utilise directement comme couleur de fond.",
    retain: "`liste.value` : l’option choisie.",
  },

  // ═════════════ NIVEAU 4 — L'objet event ═════════════
  {
    id: "evo-1", lesson: "objet-event", notion: "Objet event et propagation", type: "qcm", difficulty: 1,
    question: "Quelle propriété donne l’élément sur lequel la personne a réellement cliqué ?",
    options: ["`event.target`", "`event.currentTarget`", "`event.type`", "`event.key`"],
    answer: 0,
    why: [
      "",
      "`currentTarget` est l’élément qui porte l’écouteur, pas forcément celui qui a été cliqué.",
      "`type` donne le type d’événement (`\"click\"`…).",
      "`key` concerne les événements du clavier.",
    ],
    hints: [
      "Le nom de la propriété signifie « cible ».",
      "Ne la confonds pas avec celle qui désigne l’élément qui écoute.",
      "`event.target`",
    ],
    explanation: "`event.target` est l’élément à l’origine de l’événement : celui qui a vraiment été cliqué.",
    retain: "`target` : l’élément touché. `currentTarget` : celui qui écoute.",
  },
  {
    id: "evo-2", lesson: "objet-event", notion: "Objet event et propagation", type: "vf", difficulty: 2,
    statement: "Un clic sur un `<li>` déclenche aussi les écouteurs de clic posés sur son parent `<ul>`.",
    answer: true,
    why: "C’est la propagation : l’événement remonte de l’élément cliqué vers ses parents, et déclenche leurs écouteurs.",
    hints: [
      "Pense à la propagation (bubbling) de l’événement.",
      "L’événement remonte vers les parents.",
      "L’affirmation est vraie.",
    ],
    explanation: "Par défaut, un événement remonte du `li` vers le `ul`, puis vers le `body`, puis `document`. Chaque écouteur de clic rencontré est exécuté.",
    retain: "Un événement remonte vers les parents.",
  },
  {
    id: "evo-3", lesson: "objet-event", notion: "Objet event et propagation", type: "predict", difficulty: 2, env: "browser",
    question: "La personne clique sur le bouton. Qu’affiche la console ? (une ligne par affichage)",
    code: `<div id="parent"><button id="enfant">Clique</button></div>
<script>
  document.getElementById("parent").addEventListener("click", () => {
    console.log("parent");
  });
  document.getElementById("enfant").addEventListener("click", () => {
    console.log("enfant");
  });
</script>`,
    rows: 2,
    simulate: [{ do: "click", target: "#enfant" }],
    answers: ["enfant\nparent"],
    common: { "parent\nenfant": "L’événement part de l’élément cliqué (l’enfant), puis remonte vers ses parents.", "enfant": "L’événement remonte : l’écouteur du parent est aussi exécuté." },
    hints: [
      "Un clic sur le bouton touche aussi son parent, par propagation.",
      "L’événement commence par l’élément cliqué, puis remonte.",
      "D’abord `enfant`, ensuite `parent`.",
    ],
    explanation: "L’écouteur du bouton s’exécute en premier. Puis l’événement remonte vers le `div` : son écouteur affiche `parent`.",
    retain: "Ordre de la remontée : de l’élément cliqué vers ses parents.",
  },
  {
    id: "evo-4", lesson: "objet-event", notion: "Objet event et propagation", type: "qcm", difficulty: 2,
    question: "Pourquoi utiliser la délégation d’événements (un seul écouteur sur le `ul`, plutôt qu’un par `li`) ?",
    options: [
      "Un seul écouteur suffit, et il fonctionne aussi pour les `li` ajoutés plus tard.",
      "Parce que les `li` ne peuvent pas recevoir de clic.",
      "Parce que `addEventListener` ne marche pas sur les `li`.",
      "Parce que cela empêche les clics de remonter.",
    ],
    answer: 0,
    why: [
      "",
      "Les `li` reçoivent très bien les clics : c’est même grâce à cela que l’événement remonte.",
      "`addEventListener` marche sur tous les éléments.",
      "C’est l’inverse : la délégation s’appuie sur la remontée des clics.",
    ],
    hints: [
      "Pense à ce qui se passe si on ajoute un nouveau `li` plus tard avec `createElement`.",
      "Un écouteur posé sur chaque `li` ne concerne que les `li` qui existaient à ce moment-là.",
      "Un seul écouteur sur le parent couvre aussi les futurs enfants.",
    ],
    explanation: "L’écouteur du `ul` reçoit les clics de tous ses `li`, présents ou futurs, grâce à la propagation. On repère le `li` avec `event.target`.",
    retain: "Délégation : un écouteur sur le parent, valable aussi pour les éléments ajoutés plus tard.",
  },
  {
    id: "evo-5", lesson: "objet-event", notion: "Objet event et propagation", type: "lab", difficulty: 3,
    question: "Avec UN SEUL écouteur posé sur `#liste`, ajoute la classe `fait` au `li` sur lequel on clique. Le code fourni ajoute une 4ᵉ tâche à la liste : elle doit marcher aussi.",
    files: labFiles(`<ul id="liste">
  <li>Courses</li>
  <li>Ménage</li>
  <li>Devoirs</li>
</ul>`, `const liste = document.getElementById("liste");

// Code fourni : une tâche ajoutée par JavaScript
const nouvelle = document.createElement("li");
nouvelle.textContent = "Tâche ajoutée";
liste.append(nouvelle);

// Ton code : un seul écouteur sur la liste
`, { lockHtml: true, lockCss: true, cssCode: `li { cursor: pointer; }
.fait {
  text-decoration: line-through;
  color: gray;
}` }),
    actions: [{ do: "click", target: "#liste li:last-child" }],
    tests: [{ expr: `Array.from(document.querySelectorAll("#liste li")).map((li) => li.classList.contains("fait"))`, expect: [false, false, false, true], label: "Seule la dernière tâche (celle sur laquelle on a cliqué) doit avoir la classe `fait`" }],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "matches|closest|tagName|nodeName", msg: "Teste la cible : `event.target.matches(\"li\")`." }],
    mustNotContain: [{ file: "script.js", re: "forEach|for\\s*\\(|for\\s+(const|let)", msg: "Un seul écouteur sur la liste suffit : pas besoin de boucle." }],
    solution: [{ name: "script.js", code: `const liste = document.getElementById("liste");

const nouvelle = document.createElement("li");
nouvelle.textContent = "Tâche ajoutée";
liste.append(nouvelle);

liste.addEventListener("click", (event) => {
  if (event.target.matches("li")) {
    event.target.classList.add("fait");
  }
});` }],
    hints: [
      "Pose l’écouteur sur `liste`, pas sur chaque `li`.",
      "Dans le gestionnaire, `event.target` est le `li` cliqué. Vérifie-le avec `event.target.matches(\"li\")`.",
      "`liste.addEventListener(\"click\", (event) => { if (event.target.matches(\"li\")) { event.target.classList.add(\"fait\"); } });`",
    ],
    explanation: "Le clic sur un `li` remonte jusqu’au `ul`, dont l’écouteur s’exécute. `event.target` désigne le `li` cliqué : on lui ajoute la classe, y compris pour la tâche ajoutée par JavaScript.",
    retain: "Délégation : `liste.addEventListener(...)` + `event.target.matches(\"li\")`.",
  },
  {
    id: "evo-6", lesson: "objet-event", notion: "Objet event et propagation", type: "lab", difficulty: 3,
    question: "L’écouteur du parent affiche « parent » à chaque clic. Ajoute un écouteur sur `#enfant` qui affiche « enfant », sans que « parent » s’affiche quand on clique sur le bouton.",
    files: labFiles(`<div id="parent"><button id="enfant">Clique-moi</button></div>`, `const parent = document.getElementById("parent");
const enfant = document.getElementById("enfant");

parent.addEventListener("click", () => {
  console.log("parent");
});

// Écris le gestionnaire de l'enfant
`, { lockHtml: true }),
    actions: [{ do: "click", target: "#enfant" }],
    tests: [],
    expectLogs: [{ level: "log", text: "enfant", label: "La console doit afficher « enfant »." }],
    forbidLogs: [{ level: "log", text: "parent", label: "« parent » s’affiche encore : arrête la propagation de l’événement." }],
    mustContain: [],
    solution: [{ name: "script.js", code: `const parent = document.getElementById("parent");
const enfant = document.getElementById("enfant");

parent.addEventListener("click", () => {
  console.log("parent");
});

enfant.addEventListener("click", (event) => {
  event.stopPropagation();
  console.log("enfant");
});` }],
    hints: [
      "Le clic remonte de l’enfant vers le parent : il faut l’arrêter dans le gestionnaire de l’enfant.",
      "Le gestionnaire reçoit `event` : une de ses méthodes arrête la remontée.",
      "`event.stopPropagation();` dans le gestionnaire de `enfant`.",
    ],
    explanation: "`event.stopPropagation()` empêche l’événement de continuer vers les parents : l’écouteur du `div` n’est pas exécuté.",
    retain: "`stopPropagation()` arrête la remontée vers les parents.",
  },

  // ═════════════ NIVEAU 4 — Formulaires ═════════════
  {
    id: "for-1", lesson: "formulaires", notion: "submit et preventDefault", type: "qcm", difficulty: 2,
    question: "Pourquoi écouter `submit` sur le formulaire plutôt que `click` sur le bouton d’envoi ?",
    options: [
      "`submit` se déclenche aussi quand on valide avec la touche Entrée dans un champ.",
      "`click` ne fonctionne pas sur les boutons d’un formulaire.",
      "`submit` est plus rapide que `click`.",
      "Parce que `submit` n’a pas besoin de `preventDefault()`.",
    ],
    answer: 0,
    why: [
      "",
      "`click` fonctionne sur ces boutons, mais ne couvre pas la validation avec Entrée.",
      "La vitesse n’est pas en cause.",
      "Au contraire : `submit` demande `preventDefault()` pour éviter le rechargement.",
    ],
    hints: [
      "Comment peut-on valider un formulaire, à part cliquer sur le bouton ?",
      "En appuyant sur Entrée dans un champ.",
      "`submit` couvre tous les cas de validation.",
    ],
    explanation: "L’événement `submit` est déclenché par le formulaire quelle que soit la façon de le valider (bouton ou Entrée), et après la validation HTML.",
    retain: "Formulaire : écoute `submit`, pas `click`.",
  },
  {
    id: "for-2", lesson: "formulaires", notion: "submit et preventDefault", type: "vf", difficulty: 1,
    statement: "`event.preventDefault()` annule le comportement par défaut de l’événement (par exemple l’envoi d’un formulaire ou la navigation d’un lien).",
    answer: true,
    why: "C’est bien son rôle : le navigateur ne fait pas ce qu’il ferait normalement, et on garde la main.",
    hints: [
      "Le nom signifie « empêcher le défaut » en anglais.",
      "Il évite par exemple le rechargement de la page à l’envoi d’un formulaire.",
      "L’affirmation est vraie.",
    ],
    explanation: "`preventDefault()` empêche le comportement par défaut du navigateur : envoi du formulaire, suivi d’un lien, menu du clic droit…",
    retain: "`preventDefault()` : annuler le comportement par défaut.",
  },
  {
    id: "for-3", lesson: "formulaires", notion: "submit et preventDefault", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "La page se recharge à chaque envoi du formulaire et le message disparaît aussitôt. Pourquoi ?",
    code: `formulaire.addEventListener("submit", () => {
  message.textContent = "Merci !";
});`,
    options: [
      "Le gestionnaire ne reçoit pas `event` ni n’appelle `event.preventDefault()`.",
      "`textContent` ne fonctionne pas sur un paragraphe.",
      "Il faut écouter `click` à la place de `submit`.",
      "Il faut remplacer `\"submit\"` par `\"envoyer\"`.",
    ],
    answer: 0,
    why: [
      "",
      "`textContent` fonctionne sur tous les éléments.",
      "`click` ne résoudrait pas le problème et ne couvrirait pas la touche Entrée.",
      "Le type d’événement s’appelle bien `\"submit\"`.",
    ],
    hints: [
      "Que fait le navigateur à l’envoi d’un formulaire, si on ne l’en empêche pas ?",
      "Il recharge la page : le message écrit disparaît.",
      "Ajoute le paramètre `event` et appelle `event.preventDefault();` en première ligne.",
    ],
    explanation: "Sans `preventDefault()`, le navigateur envoie le formulaire et recharge la page juste après l’exécution du gestionnaire : le message est effacé.",
    retain: "`event.preventDefault()` en première ligne du gestionnaire de `submit`.",
  },
  {
    id: "for-4", lesson: "formulaires", notion: "submit et preventDefault", type: "lab", difficulty: 2,
    question: "Intercepte l’envoi du formulaire `#formulaire` : empêche le rechargement et affiche « Merci ! » dans `#message`.",
    files: labFiles(`<form id="formulaire">
  <input type="text" placeholder="Ton nom">
  <button type="submit">Envoyer</button>
</form>
<p id="message"></p>`, `// Écoute submit sur #formulaire
`, { lockHtml: true }),
    actions: [{ do: "submit", target: "#formulaire" }],
    tests: [{ expr: `document.getElementById("message").textContent`, expect: "Merci !", label: "`#message` doit afficher « Merci ! »" }],
    expectLogs: [],
    forbidLogs: [{ level: "warn", text: "formulaire a été envoyé", label: "Le formulaire est encore envoyé : appelle `event.preventDefault()`." }],
    mustContain: [],
    solution: [{ name: "script.js", code: `const formulaire = document.getElementById("formulaire");
const message = document.getElementById("message");

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "Merci !";
});` }],
    hints: [
      "L’événement à écouter est `submit`, sur le formulaire.",
      "Le gestionnaire doit recevoir `event`, et appeler une de ses méthodes pour annuler l’envoi.",
      "`event.preventDefault();` puis `message.textContent = \"Merci !\";`",
    ],
    explanation: "On écoute `submit`, on annule l’envoi avec `preventDefault()`, et on affiche le message dans la page.",
    retain: "`submit` + `event.preventDefault()`.",
  },
  {
    id: "for-5", lesson: "formulaires", notion: "submit et preventDefault", type: "lab", difficulty: 3,
    question: "Valide le formulaire : si `#email` est vide (après `trim()`), affiche « Email obligatoire » dans `#erreur` ; sinon, affiche « Envoyé » dans `#resultat`. Dans les deux cas, empêche le rechargement.",
    files: labFiles(`<form id="formulaire">
  <input id="email" type="text" placeholder="Ton email">
  <button type="submit">S'inscrire</button>
</form>
<p id="erreur"></p>
<p id="resultat"></p>`, `// Écoute submit, vérifie #email, affiche le message adapté
`, { lockHtml: true }),
    actions: [
      { do: "submit", target: "#formulaire" },
      { do: "input", target: "#email", value: "a@b.fr" },
      { do: "submit", target: "#formulaire" },
    ],
    tests: [
      { expr: `document.getElementById("erreur").textContent`, expect: "Email obligatoire", afterAction: 0, label: "Champ vide : `#erreur` doit afficher « Email obligatoire »" },
      { expr: `document.getElementById("resultat").textContent`, expect: "Envoyé", label: "Champ rempli : `#resultat` doit afficher « Envoyé »" },
    ],
    expectLogs: [],
    forbidLogs: [{ level: "warn", text: "formulaire a été envoyé", label: "Le formulaire est encore envoyé : appelle `event.preventDefault()` dans tous les cas." }],
    mustContain: [],
    solution: [{ name: "script.js", code: `const formulaire = document.getElementById("formulaire");
const email = document.getElementById("email");
const erreur = document.getElementById("erreur");
const resultat = document.getElementById("resultat");

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  if (email.value.trim() === "") {
    erreur.textContent = "Email obligatoire";
    return;
  }
  erreur.textContent = "";
  resultat.textContent = "Envoyé";
});` }],
    hints: [
      "Commence le gestionnaire par `event.preventDefault()`, puis teste la valeur du champ.",
      "Teste `email.value.trim() === \"\"` : dans ce cas, affiche l’erreur et quitte avec `return`.",
      "Sinon, écris `\"Envoyé\"` dans `resultat.textContent`.",
    ],
    explanation: "`preventDefault()` est en première ligne : le formulaire n’est jamais envoyé. Si le champ est vide, on affiche l’erreur et on sort avec `return`. Sinon, on affiche le résultat.",
    retain: "`preventDefault()` d’abord, puis validation, `return` en cas d’erreur.",
  },
  {
    id: "for-6", lesson: "formulaires", notion: "submit et preventDefault", type: "lab", difficulty: 2,
    question: "Empêche le lien `#lien` de changer de page, et affiche « Lien bloqué » dans la console quand on clique dessus.",
    files: labFiles(`<a id="lien" href="https://example.com">Mon lien</a>`, `// Intercepte le clic sur #lien
`, { lockHtml: true }),
    actions: [{ do: "click", target: "#lien" }],
    tests: [],
    expectLogs: [{ level: "log", text: "Lien bloqué", label: "La console doit afficher « Lien bloqué »." }],
    forbidLogs: [{ level: "warn", text: "lien a été suivi", label: "Le lien est encore suivi : appelle `event.preventDefault()`." }],
    mustContain: [],
    solution: [{ name: "script.js", code: `const lien = document.getElementById("lien");

lien.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("Lien bloqué");
});` }],
    hints: [
      "Écoute le clic sur le lien, et récupère l’objet `event`.",
      "Annule le comportement par défaut du clic sur un lien : la navigation.",
      "`event.preventDefault();` puis `console.log(\"Lien bloqué\");`",
    ],
    explanation: "Le comportement par défaut d’un clic sur un lien est de changer de page. `preventDefault()` l’annule : on peut alors faire autre chose, comme afficher un message.",
    retain: "`preventDefault()` empêche aussi un lien de naviguer.",
  },

  // ═════════════ NIVEAU 5 — L'état de l'interface ═════════════
  {
    id: "eta-1", lesson: "etat", notion: "État de l’interface", type: "qcm", difficulty: 1,
    question: "Quelle instruction inverse la variable booléenne `actif` (`true` devient `false`, et inversement) ?",
    options: ["`actif = !actif;`", "`actif = actif;`", "`!actif;`", "`actif = false;`"],
    answer: 0,
    why: [
      "",
      "Cette instruction réaffecte la même valeur : rien ne change.",
      "`!actif` calcule l’inverse, mais ne le range nulle part : la variable ne change pas.",
      "Cette instruction met toujours `false`, quelle que soit la valeur de départ.",
    ],
    hints: [
      "Il faut calculer l’inverse de la valeur actuelle, puis la ranger dans la variable.",
      "L’opérateur `!` inverse un booléen.",
      "`actif = !actif;`",
    ],
    explanation: "`!actif` donne l’inverse de `actif`. On range ce résultat dans `actif` : la valeur bascule à chaque exécution.",
    retain: "`variable = !variable` inverse un booléen.",
  },
  {
    id: "eta-2", lesson: "etat", notion: "État de l’interface", type: "predict", difficulty: 2, env: "browser",
    question: "La personne clique trois fois sur le bouton. Qu’affiche la console ? (une ligne par affichage)",
    code: `<button id="b">Bascule</button>
<script>
  let actif = false;
  document.getElementById("b").addEventListener("click", () => {
    actif = !actif;
    console.log(actif);
  });
</script>`,
    rows: 3,
    simulate: [{ do: "click", target: "#b", times: 3 }],
    answers: ["true\nfalse\ntrue"],
    common: { "false\ntrue\nfalse": "L’état est inversé AVANT l’affichage : au premier clic, il passe de `false` à `true` et on affiche `true`." },
    hints: [
      "Suis la valeur de `actif` clic après clic. Au départ : `false`.",
      "Chaque clic inverse `actif`, puis l’affiche.",
      "Clic 1 : `true`. Clic 2 : `false`. Clic 3 : `true`.",
    ],
    explanation: "Au départ, `actif` vaut `false`. Chaque clic l’inverse puis l’affiche : `true`, `false`, `true`.",
    retain: "L’état est modifié avant d’être affiché.",
  },
  {
    id: "eta-3", lesson: "etat", notion: "État de l’interface", type: "lab", difficulty: 2,
    question: "Au clic sur `#bouton`, affiche ou cache le paragraphe `#details` (propriété `hidden`). Le bouton doit afficher « Masquer » quand les détails sont visibles, et « Afficher » quand ils sont cachés.",
    files: labFiles(`<button id="bouton">Afficher</button>
<p id="details" hidden>Voici les détails.</p>`, `// Au clic : bascule details.hidden et adapte le texte du bouton
`, { lockHtml: true }),
    actions: [{ do: "click", target: "#bouton" }, { do: "click", target: "#bouton" }],
    tests: [
      { expr: `document.getElementById("details").hidden`, expect: false, afterAction: 0, label: "Après un clic, les détails doivent être visibles" },
      { expr: `document.getElementById("bouton").textContent`, expect: "Masquer", afterAction: 0, label: "Après un clic, le bouton doit afficher « Masquer »" },
      { expr: `document.getElementById("details").hidden`, expect: true, label: "Après deux clics, les détails doivent être cachés" },
      { expr: `document.getElementById("bouton").textContent`, expect: "Afficher", label: "Après deux clics, le bouton doit afficher « Afficher »" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const bouton = document.getElementById("bouton");
const details = document.getElementById("details");

bouton.addEventListener("click", () => {
  details.hidden = !details.hidden;
  if (details.hidden) {
    bouton.textContent = "Afficher";
  } else {
    bouton.textContent = "Masquer";
  }
});` }],
    hints: [
      "L’état est déjà dans le DOM : la propriété `details.hidden`.",
      "`details.hidden = !details.hidden;` inverse l’état. Ensuite, lis-le avec un `if` pour choisir le texte.",
      "`if (details.hidden) { bouton.textContent = \"Afficher\"; } else { bouton.textContent = \"Masquer\"; }`",
    ],
    explanation: "On inverse `hidden`, puis on adapte le texte du bouton d’après le nouvel état.",
    retain: "Change l’état, puis mets l’affichage à jour d’après cet état.",
  },
  {
    id: "eta-4", lesson: "etat", notion: "État de l’interface", type: "lab", difficulty: 3,
    question: "Bouton « J’aime » : au clic, le texte passe de « ♡ J’aime » à « ♥ Aimé » (et inversement au clic suivant), et l’attribut `aria-pressed` vaut `\"true\"` ou `\"false\"`. Garde l’état dans une variable `aime` et utilise une fonction `afficher()`.",
    files: labFiles(`<button id="like" aria-pressed="false">♡ J'aime</button>`, `// État : let aime = false;
// Affichage : function afficher() { ... }
`, { lockHtml: true }),
    actions: [{ do: "click", target: "#like" }, { do: "click", target: "#like" }],
    tests: [
      { expr: `document.getElementById("like").getAttribute("aria-pressed")`, expect: "true", afterAction: 0, label: "Après un clic, `aria-pressed` doit valoir \"true\"" },
      { expr: `document.getElementById("like").textContent`, expect: "♥ Aimé", afterAction: 0, label: "Après un clic, le bouton doit afficher « ♥ Aimé »" },
      { expr: `document.getElementById("like").getAttribute("aria-pressed")`, expect: "false", label: "Après deux clics, `aria-pressed` doit valoir \"false\"" },
      { expr: `document.getElementById("like").textContent`, expect: "♡ J'aime", label: "Après deux clics, le bouton doit afficher « ♡ J'aime »" },
      { expr: `typeof aime`, expect: "boolean", label: "L’état doit être dans une variable booléenne `aime`" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "function\\s+afficher", msg: "Écris une fonction `afficher()`." }],
    solution: [{ name: "script.js", code: `const bouton = document.getElementById("like");
let aime = false;

function afficher() {
  if (aime) {
    bouton.textContent = "♥ Aimé";
  } else {
    bouton.textContent = "♡ J'aime";
  }
  bouton.setAttribute("aria-pressed", aime);
}

bouton.addEventListener("click", () => {
  aime = !aime;
  afficher();
});` }],
    hints: [
      "Trois éléments : une variable d’état `aime`, une fonction `afficher()` qui lit cet état, un écouteur qui l’inverse.",
      "Dans `afficher()` : un `if (aime)` pour le texte, et `bouton.setAttribute(\"aria-pressed\", aime)`.",
      "L’écouteur fait `aime = !aime;` puis appelle `afficher();`.",
    ],
    explanation: "L’état vit dans `aime`. `afficher()` en déduit le texte et l’attribut. Le clic ne fait qu’inverser l’état et redessiner. `setAttribute` convertit le booléen en texte `\"true\"` / `\"false\"`.",
    retain: "Événement → état → `afficher()`.",
  },
  {
    id: "eta-5", lesson: "etat", notion: "État de l’interface", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Malgré `boite.hidden = true;`, la boîte reste visible. Pourquoi ?",
    code: `/* style.css */
.boite { display: block; padding: 20px; }

/* script.js */
boite.hidden = true;`,
    options: [
      "La règle `display: block` l’emporte sur le style de `hidden` : il faut ajouter `.boite[hidden] { display: none; }`.",
      "`hidden` ne fonctionne pas sur les `div`.",
      "Il faut écrire `boite.hidden = \"hidden\";`.",
      "Il faut utiliser `boite.style = \"none\";`.",
    ],
    answer: 0,
    why: [
      "",
      "`hidden` fonctionne sur tous les éléments.",
      "Une valeur de texte n’y changerait rien : `true` convient.",
      "`style` ne s’affecte pas de cette façon, et `none` n’est pas une propriété.",
    ],
    hints: [
      "`hidden` repose sur une règle CSS du navigateur : `display: none`.",
      "Une règle du site peut écraser cette règle du navigateur.",
      "Ajoute `.boite[hidden] { display: none; }` au CSS.",
    ],
    explanation: "L’attribut `hidden` s’appuie sur un `display: none` par défaut du navigateur. Une règle plus spécifique du CSS (`.boite { display: block; }`) l’écrase. On rétablit le masquage avec `.boite[hidden] { display: none; }`.",
    retain: "Un CSS qui définit `display` peut neutraliser `hidden`.",
  },

  // ═════════════ NIVEAU 5 — Accordéon ═════════════
  {
    id: "acc-1", lesson: "accordeon", notion: "Accordéon", type: "qcm", difficulty: 2,
    question: "Pourquoi utilise-t-on `nextElementSibling` plutôt que `nextSibling` pour retrouver le panneau qui suit un titre ?",
    options: [
      "`nextSibling` peut renvoyer un nœud de texte (par exemple le retour à la ligne entre les balises), pas l’élément voulu.",
      "`nextSibling` n’existe plus en JavaScript.",
      "`nextElementSibling` est plus rapide.",
      "`nextSibling` renvoie toujours `null`.",
    ],
    answer: 0,
    why: [
      "",
      "`nextSibling` existe toujours : le problème est ce qu’il renvoie.",
      "La vitesse n’est pas en cause.",
      "Il renvoie un nœud, souvent un nœud de texte.",
    ],
    hints: [
      "Rappelle-toi la différence entre `children` et `childNodes`.",
      "Entre deux balises, un retour à la ligne forme un nœud de texte.",
      "`nextElementSibling` ignore les nœuds de texte.",
    ],
    explanation: "Dans le HTML, le retour à la ligne entre le bouton et le `div` est un nœud de texte : `nextSibling` renvoie ce nœud. `nextElementSibling` renvoie le prochain élément.",
    retain: "Les propriétés `...Element...` ignorent les nœuds de texte.",
  },
  {
    id: "acc-2", lesson: "accordeon", notion: "Accordéon", type: "vf", difficulty: 1,
    statement: "L’attribut `aria-expanded` indique aux lecteurs d’écran si une section est dépliée ou repliée.",
    answer: true,
    why: "Les valeurs sont `\"true\"` (dépliée) et `\"false\"` (repliée). Il doit être mis à jour en même temps que l’affichage.",
    hints: [
      "Le nom signifie « étendu » en anglais.",
      "C’est un attribut d’accessibilité (`aria-...`).",
      "L’affirmation est vraie.",
    ],
    explanation: "`aria-expanded` décrit l’état de la section pour les technologies d’assistance. On le met à jour dans le même gestionnaire que `hidden`.",
    retain: "`aria-expanded` = `\"true\"` ou `\"false\"`, à synchroniser avec l’affichage.",
  },
  {
    id: "acc-3", lesson: "accordeon", notion: "Accordéon", type: "lab", difficulty: 2,
    question: "Au clic sur un titre, affiche son panneau (propriété `hidden`) s’il était caché, ou cache-le s’il était visible. Mets aussi `aria-expanded` à jour. Utilise un seul écouteur sur `#accordeon`.",
    files: labFiles(ACCORDEON_BODY, `// Un seul écouteur sur #accordeon
`, { lockHtml: true, lockCss: true, cssCode: ACCORDEON_CSS }),
    actions: [
      { do: "click", target: "#accordeon .titre:nth-of-type(1)" },
      { do: "click", target: "#accordeon .titre:nth-of-type(1)" },
    ],
    tests: [
      { expr: `document.querySelector(".contenu").hidden`, expect: false, afterAction: 0, label: "Après un clic, le premier panneau doit être visible" },
      { expr: `document.querySelector(".titre").getAttribute("aria-expanded")`, expect: "true", afterAction: 0, label: "Après un clic, `aria-expanded` doit valoir \"true\"" },
      { expr: `document.querySelector(".contenu").hidden`, expect: true, label: "Après un deuxième clic, le panneau doit être caché" },
      { expr: `document.querySelector(".titre").getAttribute("aria-expanded")`, expect: "false", label: "Après un deuxième clic, `aria-expanded` doit valoir \"false\"" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "closest|matches", msg: "Retrouve le titre cliqué avec `event.target.closest(\".titre\")`." }],
    solution: [{ name: "script.js", code: `const accordeon = document.getElementById("accordeon");

accordeon.addEventListener("click", (event) => {
  const titre = event.target.closest(".titre");
  if (titre === null) {
    return;
  }
  const contenu = titre.nextElementSibling;
  const etaitOuvert = !contenu.hidden;
  contenu.hidden = etaitOuvert;
  titre.setAttribute("aria-expanded", !etaitOuvert);
});` }],
    hints: [
      "Écoute `click` sur `#accordeon`, puis retrouve le titre avec `event.target.closest(\".titre\")`. S’il vaut `null`, quitte avec `return`.",
      "Le panneau est `titre.nextElementSibling`. Lis son état avant de le changer.",
      "`const etaitOuvert = !contenu.hidden;` puis `contenu.hidden = etaitOuvert;` et `titre.setAttribute(\"aria-expanded\", !etaitOuvert);`",
    ],
    explanation: "On lit l’état avant le clic (`etaitOuvert`), puis on l’inverse pour le panneau (`hidden`) et pour l’attribut `aria-expanded`.",
    retain: "Délégation + `closest` + `nextElementSibling`.",
  },
  {
    id: "acc-4", lesson: "accordeon", notion: "Accordéon", type: "lab", difficulty: 3,
    question: "Une seule section ouverte à la fois : quand on ouvre une section, toutes les autres se referment (panneaux cachés et `aria-expanded=\"false\"`).",
    files: labFiles(ACCORDEON_BODY, `const accordeon = document.getElementById("accordeon");

// Ouvre la section cliquée et referme les autres
`, { lockHtml: true, lockCss: true, cssCode: ACCORDEON_CSS }),
    actions: [
      { do: "click", target: "#accordeon .titre:nth-of-type(1)" },
      { do: "click", target: "#accordeon .titre:nth-of-type(2)" },
    ],
    tests: [
      { expr: `Array.from(document.querySelectorAll(".contenu")).map((c) => c.hidden)`, expect: [false, true, true], afterAction: 0, label: "Après le 1er clic : seul le panneau 1 est visible" },
      { expr: `Array.from(document.querySelectorAll(".contenu")).map((c) => c.hidden)`, expect: [true, false, true], label: "Après le 2e clic : seul le panneau 2 est visible" },
      { expr: `Array.from(document.querySelectorAll(".titre")).map((t) => t.getAttribute("aria-expanded"))`, expect: ["false", "true", "false"], label: "`aria-expanded` doit suivre : false, true, false" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const accordeon = document.getElementById("accordeon");

accordeon.addEventListener("click", (event) => {
  const titre = event.target.closest(".titre");
  if (titre === null) {
    return;
  }
  const etaitOuvert = titre.getAttribute("aria-expanded") === "true";

  accordeon.querySelectorAll(".titre").forEach((t) => {
    t.setAttribute("aria-expanded", "false");
  });
  accordeon.querySelectorAll(".contenu").forEach((c) => {
    c.hidden = true;
  });

  if (!etaitOuvert) {
    titre.setAttribute("aria-expanded", "true");
    titre.nextElementSibling.hidden = false;
  }
});` }],
    hints: [
      "Avant d’ouvrir la section cliquée, referme toutes les sections avec `querySelectorAll`.",
      "Mémorise d’abord si la section cliquée était ouverte, sinon tu ne pourras plus le savoir après avoir tout refermé.",
      "Ferme tout (`forEach`), puis si `!etaitOuvert`, ouvre la section cliquée.",
    ],
    explanation: "On referme tout, puis on rouvre seulement la section cliquée (sauf si elle était déjà ouverte : un clic la referme).",
    retain: "« Une seule ouverte » : tout fermer, puis ouvrir la bonne.",
  },
  {
    id: "acc-5", lesson: "accordeon", notion: "Accordéon", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Cliquer sur le texte du titre ne fait rien, alors que cliquer sur le bord du bouton marche. Pourquoi ?",
    code: `<button class="titre"><span>Question</span></button>

accordeon.addEventListener("click", (event) => {
  if (event.target.matches(".titre")) {
    // ouvre ou ferme la section
  }
});`,
    options: [
      "Quand on clique sur le texte, `event.target` est le `span`, pas le bouton : `closest(\".titre\")` retrouverait le bouton.",
      "`matches` n’existe pas pour les boutons.",
      "Le `span` empêche les clics d’arriver jusqu’au conteneur.",
      "Il faut écouter `mousedown` au lieu de `click`.",
    ],
    answer: 0,
    why: [
      "",
      "`matches` existe pour tous les éléments : c’est ce qu’il teste qui pose problème.",
      "Les clics remontent normalement vers le conteneur.",
      "Le type d’événement n’est pas en cause.",
    ],
    hints: [
      "Sur quel élément le clic a-t-il vraiment lieu quand on clique sur le texte ?",
      "C’est l’élément le plus profond : le `span`.",
      "`event.target.closest(\".titre\")` remonte du `span` jusqu’au bouton.",
    ],
    explanation: "`event.target` est l’élément le plus précis touché : le `span`. `matches(\".titre\")` est faux pour lui. `closest(\".titre\")` remonte dans les parents et retrouve le bouton.",
    retain: "Délégation avec des éléments imbriqués : `closest`.",
  },

  // ═════════════ NIVEAU 5 — Menu ═════════════
  {
    id: "men-1", lesson: "menu", notion: "Menus", type: "qcm", difficulty: 1,
    question: "Que renvoie `menu.contains(event.target)` quand on clique sur un lien situé à l’intérieur du menu ?",
    options: ["`true`", "`false`", "`null`", "Une erreur"],
    answer: 0,
    why: [
      "",
      "`contains` est vrai pour l’élément lui-même et pour tous ses descendants, liens compris.",
      "`contains` renvoie toujours un booléen.",
      "Aucune erreur : la méthode existe sur tous les éléments.",
    ],
    hints: [
      "`contains` répond à la question « cet élément est-il à l’intérieur de moi ? ».",
      "Le lien est un descendant du menu.",
      "`true`",
    ],
    explanation: "`menu.contains(autre)` vaut `true` si `autre` est le menu ou l’un de ses descendants. Le lien cliqué est dedans : `true`.",
    retain: "`parent.contains(element)` : l’élément est-il dans le parent ?",
  },
  {
    id: "men-2", lesson: "menu", notion: "Menus", type: "vf", difficulty: 2,
    statement: "Un écouteur `keydown` posé sur un bouton reçoit la touche Échap même si le bouton n’a pas le focus.",
    answer: false,
    why: "Un événement clavier est envoyé à l’élément qui a le focus, puis remonte vers ses parents. Un bouton qui n’a pas le focus ne reçoit rien. Pour une touche valable partout, on écoute `document`.",
    hints: [
      "À quel élément le navigateur envoie-t-il les touches ?",
      "À celui qui a le focus.",
      "L’affirmation est fausse : il faut écouter `document`.",
    ],
    explanation: "Les touches sont envoyées à l’élément qui a le focus. Pour un raccourci global (fermer un menu avec Échap), on écoute `document`.",
    retain: "Raccourci global = écouteur sur `document`.",
  },
  {
    id: "men-3", lesson: "menu", notion: "Menus", type: "lab", difficulty: 2,
    question: "Le bouton `#burger` ouvre et ferme le menu `#menu` : il ajoute ou retire la classe `ouvert` sur le menu, et met `aria-expanded` à jour sur le bouton (`\"true\"` / `\"false\"`).",
    files: labFiles(BURGER_BODY, `// Un clic sur #burger ouvre ou ferme le menu
`, { lockHtml: true, lockCss: true, cssCode: BURGER_CSS }),
    actions: [{ do: "click", target: "#burger" }, { do: "click", target: "#burger" }],
    tests: [
      { expr: `document.getElementById("menu").classList.contains("ouvert")`, expect: true, afterAction: 0, label: "Après un clic, le menu doit avoir la classe `ouvert`" },
      { expr: `document.getElementById("burger").getAttribute("aria-expanded")`, expect: "true", afterAction: 0, label: "Après un clic, `aria-expanded` doit valoir \"true\"" },
      { expr: `document.getElementById("menu").classList.contains("ouvert")`, expect: false, label: "Après deux clics, le menu doit être fermé" },
      { expr: `document.getElementById("burger").getAttribute("aria-expanded")`, expect: "false", label: "Après deux clics, `aria-expanded` doit valoir \"false\"" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: BURGER_SCRIPT.trimEnd() }],
    hints: [
      "Deux actions à regrouper : changer la classe ET l’attribut. Mets-les dans des fonctions `ouvrir()` et `fermer()`.",
      "Dans l’écouteur : `if (menu.classList.contains(\"ouvert\")) { fermer(); } else { ouvrir(); }`.",
      "`menu.classList.add(\"ouvert\")` et `bouton.setAttribute(\"aria-expanded\", \"true\")` dans `ouvrir()`.",
    ],
    explanation: "On lit l’état dans la classe `ouvert`, et on appelle `ouvrir()` ou `fermer()` : chaque fonction met à jour la classe et l’attribut ensemble, pour qu’ils ne se contredisent jamais.",
    retain: "Regroupe classe et `aria-expanded` dans `ouvrir()` / `fermer()`.",
  },
  {
    id: "men-4", lesson: "menu", notion: "Menus", type: "lab", difficulty: 2,
    question: "Le bouton ouvre déjà le menu (code fourni). Ajoute la fermeture avec la touche Échap, où que soit le focus.",
    files: labFiles(BURGER_BODY, BURGER_SCRIPT + `
// Ajoute la fermeture avec Échap
`, { lockHtml: true, lockCss: true, cssCode: BURGER_CSS }),
    actions: [{ do: "click", target: "#burger" }, { do: "key", target: "document", type: "keydown", key: "Escape" }],
    tests: [
      { expr: `document.getElementById("menu").classList.contains("ouvert")`, expect: true, afterAction: 0, label: "Après un clic sur le bouton, le menu doit être ouvert" },
      { expr: `document.getElementById("menu").classList.contains("ouvert")`, expect: false, label: "Après Échap, le menu doit être fermé" },
      { expr: `document.getElementById("burger").getAttribute("aria-expanded")`, expect: "false", label: "Après Échap, `aria-expanded` doit valoir \"false\"" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "Escape", msg: "Compare `event.key` avec `\"Escape\"`." }],
    solution: [{ name: "script.js", code: BURGER_SCRIPT + `
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    fermer();
  }
});` }],
    hints: [
      "Une touche valable partout : écoute `keydown` sur `document`.",
      "Teste `event.key === \"Escape\"`.",
      "Appelle `fermer()` : elle met déjà à jour la classe et l’attribut.",
    ],
    explanation: "L’écouteur sur `document` reçoit toutes les touches. Quand c’est Échap, `fermer()` retire la classe et met `aria-expanded` à jour.",
    retain: "`document.addEventListener(\"keydown\", ...)` pour un raccourci global.",
  },
  {
    id: "men-5", lesson: "menu", notion: "Menus", type: "lab", difficulty: 3,
    question: "Ferme le menu quand on clique en dehors de lui. Un clic dans le menu (sur un lien) ou sur le bouton ne doit pas le fermer.",
    files: labFiles(BURGER_BODY, BURGER_SCRIPT + `
// Ferme le menu quand on clique en dehors
`, { lockHtml: true, lockCss: true, cssCode: BURGER_CSS }),
    actions: [
      { do: "click", target: "#burger" },
      { do: "click", target: "#menu a" },
      { do: "click", target: "#contenu" },
    ],
    tests: [
      { expr: `document.getElementById("menu").classList.contains("ouvert")`, expect: true, afterAction: 1, label: "Un clic sur un lien du menu ne doit pas le fermer" },
      { expr: `document.getElementById("menu").classList.contains("ouvert")`, expect: false, label: "Un clic sur le contenu doit fermer le menu" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "contains", msg: "Utilise `menu.contains(event.target)` pour savoir si le clic est dans le menu." }],
    solution: [{ name: "script.js", code: BURGER_SCRIPT + `
document.addEventListener("click", (event) => {
  if (!menu.contains(event.target) && !bouton.contains(event.target)) {
    fermer();
  }
});` }],
    hints: [
      "Écoute `click` sur `document`, et teste d’où vient le clic.",
      "Le clic est « en dehors » s’il n’est ni dans le menu, ni sur le bouton.",
      "`if (!menu.contains(event.target) && !bouton.contains(event.target)) { fermer(); }`",
    ],
    explanation: "Tous les clics remontent jusqu’à `document`. On ferme seulement si la cible n’est ni dans le menu ni sur le bouton : sinon le bouton fermerait le menu juste après l’avoir ouvert.",
    retain: "Clic en dehors : `!zone.contains(event.target)`, en excluant le bouton.",
  },

  // ═════════════ NIVEAU 5 — Modale ═════════════
  {
    id: "mod-1", lesson: "modale", notion: "Modales", type: "qcm", difficulty: 2,
    question: "Pourquoi tester `event.target === fond` dans l’écouteur de clic du fond ?",
    options: [
      "Un clic dans la fenêtre remonte jusqu’au fond : il faut distinguer un clic sur le fond d’un clic dans la fenêtre.",
      "Parce que `fond` n’accepte pas les clics autrement.",
      "Pour empêcher la touche Échap de fermer la modale.",
      "Parce que `event.target` est toujours le fond.",
    ],
    answer: 0,
    why: [
      "",
      "Le fond accepte les clics sans condition : c’est justement le problème.",
      "Le test n’a aucun rapport avec la touche Échap.",
      "`event.target` est l’élément le plus précis qui a été cliqué : fond ou élément de la fenêtre.",
    ],
    hints: [
      "La fenêtre est à l’intérieur du fond. Que devient un clic fait sur la fenêtre ?",
      "Il remonte jusqu’au fond, qui le reçoit aussi.",
      "On compare la cible au fond : elle n’est égale au fond que pour un clic en dehors de la fenêtre.",
    ],
    explanation: "Les événements remontent : un clic dans la fenêtre atteint aussi l’écouteur du fond. `event.target === fond` n’est vrai que si le clic a eu lieu directement sur le fond.",
    retain: "`event.target === fond` : clic en dehors de la fenêtre.",
  },
  {
    id: "mod-2", lesson: "modale", notion: "Modales", type: "vf", difficulty: 1,
    statement: "`role=\"dialog\"` et `aria-modal=\"true\"` aident les lecteurs d’écran à comprendre que la fenêtre est une boîte de dialogue modale.",
    answer: true,
    why: "Ces attributs décrivent la fenêtre : une boîte de dialogue qui bloque l’accès au reste de la page.",
    hints: [
      "Ce sont des attributs d’accessibilité (`aria-...`, `role`).",
      "Ils décrivent le rôle et le comportement de la fenêtre.",
      "L’affirmation est vraie.",
    ],
    explanation: "`role=\"dialog\"` précise le rôle de l’élément ; `aria-modal=\"true\"` indique que le reste de la page est inactif tant qu’elle est ouverte.",
    retain: "`role=\"dialog\"` + `aria-modal=\"true\"`.",
  },
  {
    id: "mod-3", lesson: "modale", notion: "Modales", type: "lab", difficulty: 2,
    question: "Au clic sur `#ouvrir`, affiche la modale (`#fond`) et place le focus sur `#fermer`. Au clic sur `#fermer`, cache-la et rends le focus à `#ouvrir`.",
    files: labFiles(MODALE_BODY, `// Ouvrir et fermer la modale
`, { lockHtml: true, lockCss: true, cssCode: MODALE_CSS }),
    actions: [{ do: "click", target: "#ouvrir" }, { do: "click", target: "#fermer" }],
    tests: [
      { expr: `document.getElementById("fond").hidden`, expect: false, afterAction: 0, label: "Après un clic sur « Ouvrir », la modale doit être visible" },
      { expr: `document.activeElement.id`, expect: "fermer", afterAction: 0, label: "Le focus doit être sur le bouton « Fermer »" },
      { expr: `document.getElementById("fond").hidden`, expect: true, label: "Après un clic sur « Fermer », la modale doit être cachée" },
      { expr: `document.activeElement.id`, expect: "ouvrir", label: "Le focus doit retourner au bouton « Ouvrir »" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: MODALE_SCRIPT.trimEnd() }],
    hints: [
      "Deux fonctions : une pour ouvrir, une pour fermer, appelées par les deux boutons.",
      "`fond.hidden = false;` puis `fermer.focus();` pour ouvrir. L’inverse pour fermer.",
      "`element.focus()` donne le focus à un élément.",
    ],
    explanation: "`hidden` affiche ou cache la modale. `focus()` déplace le focus dans la modale à l’ouverture, puis le rend au bouton d’ouverture à la fermeture.",
    retain: "`fond.hidden` + `focus()` à l’ouverture et à la fermeture.",
  },
  {
    id: "mod-4", lesson: "modale", notion: "Modales", type: "lab", difficulty: 2,
    question: "L’ouverture et la fermeture par bouton sont fournies. Ajoute la fermeture avec la touche Échap, seulement quand la modale est ouverte.",
    files: labFiles(MODALE_BODY, MODALE_SCRIPT + `
// Ajoute la fermeture avec Échap
`, { lockHtml: true, lockCss: true, cssCode: MODALE_CSS }),
    actions: [{ do: "click", target: "#ouvrir" }, { do: "key", target: "document", type: "keydown", key: "Escape" }],
    tests: [
      { expr: `document.getElementById("fond").hidden`, expect: false, afterAction: 0, label: "Après un clic sur « Ouvrir », la modale doit être visible" },
      { expr: `document.getElementById("fond").hidden`, expect: true, label: "Après Échap, la modale doit être cachée" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "Escape", msg: "Compare `event.key` avec `\"Escape\"`." }],
    solution: [{ name: "script.js", code: MODALE_SCRIPT + `
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !fond.hidden) {
    fermerModale();
  }
});` }],
    hints: [
      "Écoute `keydown` sur `document`.",
      "Deux conditions : la touche est `\"Escape\"` ET la modale est ouverte (`!fond.hidden`).",
      "Appelle `fermerModale()`, qui rend aussi le focus.",
    ],
    explanation: "Le test `!fond.hidden` évite d’exécuter la fermeture (et de déplacer le focus) quand la modale est déjà fermée.",
    retain: "Échap : `event.key === \"Escape\"` et la modale doit être ouverte.",
  },
  {
    id: "mod-5", lesson: "modale", notion: "Modales", type: "lab", difficulty: 3,
    question: "Ferme la modale par un clic sur le fond, mais pas par un clic dans la fenêtre elle-même (`.modale`).",
    files: labFiles(MODALE_BODY, MODALE_SCRIPT + `
// Ferme la modale par un clic sur le fond (mais pas dans la fenêtre)
`, { lockHtml: true, lockCss: true, cssCode: MODALE_CSS }),
    actions: [
      { do: "click", target: "#ouvrir" },
      { do: "click", target: ".modale" },
      { do: "click", target: "#fond" },
    ],
    tests: [
      { expr: `document.getElementById("fond").hidden`, expect: false, afterAction: 1, label: "Un clic dans la fenêtre ne doit pas fermer la modale" },
      { expr: `document.getElementById("fond").hidden`, expect: true, label: "Un clic sur le fond doit fermer la modale" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "event\\.target", msg: "Utilise `event.target` pour savoir où le clic a eu lieu." }],
    solution: [{ name: "script.js", code: MODALE_SCRIPT + `
fond.addEventListener("click", (event) => {
  if (event.target === fond) {
    fermerModale();
  }
});` }],
    hints: [
      "Écoute `click` sur `fond`. Un clic dans la fenêtre remonte jusqu’à lui.",
      "Compare `event.target` au fond.",
      "`if (event.target === fond) { fermerModale(); }`",
    ],
    explanation: "Un clic dans la fenêtre remonte jusqu’au fond, mais `event.target` désigne alors la fenêtre ou un de ses enfants : la condition est fausse et la modale reste ouverte.",
    retain: "`if (event.target === fond)`.",
  },

  // ═════════════ NIVEAU 5 — Onglets ═════════════
  {
    id: "ong-1", lesson: "onglets", notion: "Onglets", type: "qcm", difficulty: 2,
    question: "Que fait `element.classList.toggle(\"actif\", condition)` quand `condition` vaut `false` ?",
    options: [
      "Il retire la classe `actif` (ou la laisse absente).",
      "Il ajoute la classe `actif`.",
      "Il inverse la présence de la classe.",
      "Il provoque une erreur.",
    ],
    answer: 0,
    why: [
      "",
      "C’est ce qu’il fait quand la condition vaut `true`.",
      "L’inversion, c’est `toggle` sans second argument ; avec la condition, la classe est forcée.",
      "Aucune erreur : le second argument est prévu pour cela.",
    ],
    hints: [
      "Le second argument force le résultat : présente ou absente.",
      "Avec `true`, la classe est ajoutée.",
      "Avec `false`, elle est retirée.",
    ],
    explanation: "Avec un second argument, `toggle` ajoute la classe si la condition est vraie, la retire si elle est fausse. C’est un `if` / `else` condensé.",
    retain: "`classList.toggle(\"nom\", condition)` : présente si la condition est vraie.",
  },
  {
    id: "ong-2", lesson: "onglets", notion: "Onglets", type: "predict", difficulty: 2, env: "browser",
    question: "Ce script est exécuté en bas du body. Qu’affiche-t-il ? (une ligne par `console.log`)",
    code: `<button id="b" data-cible="panneau-2">Deux</button>
<script>
  const b = document.getElementById("b");
  console.log(b.dataset.cible);
  console.log("panneau-2" === b.dataset.cible);
</script>`,
    rows: 2,
    answers: ["panneau-2\ntrue"],
    common: { "cible\ntrue": "Le nom de l’attribut est `data-cible` : `dataset.cible` donne sa valeur, ici `panneau-2`." },
    hints: [
      "`dataset.cible` lit l’attribut `data-cible`.",
      "Sa valeur est du texte : `panneau-2`.",
      "Première ligne : `panneau-2`. Deuxième ligne : la comparaison est vraie.",
    ],
    explanation: "`b.dataset.cible` renvoie la valeur de l’attribut `data-cible`, soit `\"panneau-2\"`. La comparaison avec le même texte vaut `true`.",
    retain: "`element.dataset.nom` lit l’attribut `data-nom`.",
  },
  {
    id: "ong-3", lesson: "onglets", notion: "Onglets", type: "lab", difficulty: 3,
    question: "Au clic sur un onglet : donne-lui la classe `actif` (et retire-la aux autres), et n’affiche que son panneau (celui dont l’id est dans `data-cible`).",
    files: labFiles(ONGLETS_BODY, `const onglets = document.querySelectorAll(".onglet");
const panneaux = document.querySelectorAll(".panneau");

// Au clic sur un onglet : classe actif + bon panneau visible
`, { lockHtml: true, lockCss: true, cssCode: ONGLETS_CSS }),
    actions: [{ do: "click", target: ".onglet:nth-of-type(2)" }],
    tests: [
      { expr: `Array.from(document.querySelectorAll(".panneau")).map((p) => p.hidden)`, expect: [true, false, true], label: "Seul le panneau 2 doit être visible" },
      { expr: `Array.from(document.querySelectorAll(".onglet")).map((o) => o.classList.contains("actif"))`, expect: [false, true, false], label: "Seul l’onglet 2 doit avoir la classe `actif`" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "dataset", msg: "Utilise `onglet.dataset.cible` pour retrouver le panneau." }],
    solution: [{ name: "script.js", code: `const onglets = document.querySelectorAll(".onglet");
const panneaux = document.querySelectorAll(".panneau");

function activer(onglet) {
  onglets.forEach((o) => {
    o.classList.toggle("actif", o === onglet);
  });
  panneaux.forEach((p) => {
    p.hidden = p.id !== onglet.dataset.cible;
  });
}

onglets.forEach((onglet) => {
  onglet.addEventListener("click", () => {
    activer(onglet);
  });
});` }],
    hints: [
      "Parcours les onglets pour ajouter un écouteur à chacun, et écris une fonction `activer(onglet)`.",
      "Dans `activer`, parcours tous les onglets (`toggle(\"actif\", o === onglet)`) puis tous les panneaux.",
      "Un panneau est caché sauf si son id est égal à `onglet.dataset.cible` : `p.hidden = p.id !== onglet.dataset.cible;`",
    ],
    explanation: "`activer` met à jour tous les onglets et tous les panneaux : l’onglet cliqué est actif, son panneau est visible, les autres non.",
    retain: "Boucle sur tous les éléments, avec une condition pour l’élément actif.",
  },
  {
    id: "ong-4", lesson: "onglets", notion: "Onglets", type: "lab", difficulty: 2,
    question: "Le clic sur un onglet marche déjà (code fourni), mais au chargement aucun panneau n’est visible. Active le premier onglet dès le chargement.",
    files: labFiles(ONGLETS_BODY, `const onglets = document.querySelectorAll(".onglet");
const panneaux = document.querySelectorAll(".panneau");

function activer(onglet) {
  onglets.forEach((o) => {
    o.classList.toggle("actif", o === onglet);
  });
  panneaux.forEach((p) => {
    p.hidden = p.id !== onglet.dataset.cible;
  });
}

onglets.forEach((onglet) => {
  onglet.addEventListener("click", () => {
    activer(onglet);
  });
});

// Active le premier onglet au chargement
`, { lockHtml: true, lockCss: true, cssCode: ONGLETS_CSS }),
    tests: [
      { expr: `Array.from(document.querySelectorAll(".panneau")).map((p) => p.hidden)`, expect: [false, true, true], label: "Au chargement, seul le panneau 1 doit être visible" },
      { expr: `Array.from(document.querySelectorAll(".onglet")).map((o) => o.classList.contains("actif"))`, expect: [true, false, false], label: "Au chargement, seul l’onglet 1 doit être actif" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `const onglets = document.querySelectorAll(".onglet");
const panneaux = document.querySelectorAll(".panneau");

function activer(onglet) {
  onglets.forEach((o) => {
    o.classList.toggle("actif", o === onglet);
  });
  panneaux.forEach((p) => {
    p.hidden = p.id !== onglet.dataset.cible;
  });
}

onglets.forEach((onglet) => {
  onglet.addEventListener("click", () => {
    activer(onglet);
  });
});

activer(onglets[0]);` }],
    hints: [
      "Il suffit d’appeler la fonction `activer` une fois, au chargement.",
      "Avec quel onglet ? Le premier de la liste `onglets`.",
      "`activer(onglets[0]);`",
    ],
    explanation: "`onglets[0]` est le premier onglet de la liste. Appeler `activer(onglets[0])` à la fin du script lui donne la classe `actif` et affiche son panneau dès le départ.",
    retain: "Appelle la fonction d’affichage aussi au chargement.",
  },
  {
    id: "ong-5", lesson: "onglets", notion: "Onglets", type: "qcm", label: "Trouver l’erreur", difficulty: 2,
    question: "Cliquer sur l’onglet provoque `TypeError: Cannot set properties of null (setting 'hidden')`. Pourquoi ?",
    code: `<button class="onglet" data-cible="panneau2">Deux</button>
<div class="panneau" id="p2">...</div>

const panneau = document.getElementById(onglet.dataset.cible);
panneau.hidden = false;`,
    options: [
      "`data-cible` vaut \"panneau2\", mais aucun élément n’a cet id (le panneau s’appelle `p2`) : `getElementById` renvoie `null`.",
      "`hidden` n’existe pas pour un `div`.",
      "Il faut écrire `document.getElementById(\"onglet.dataset.cible\")`.",
      "Il faut utiliser `querySelector` à la place de `getElementById`.",
    ],
    answer: 0,
    why: [
      "",
      "`hidden` existe sur tous les éléments.",
      "Avec des guillemets, on chercherait un id contenant littéralement ce texte.",
      "`querySelector` aurait le même problème : l’élément n’existe pas sous ce nom.",
    ],
    hints: [
      "L’erreur indique que `panneau` vaut `null`.",
      "Compare la valeur de `data-cible` avec l’id du panneau.",
      "Ils doivent être identiques : `data-cible=\"p2\"`.",
    ],
    explanation: "`getElementById(\"panneau2\")` ne trouve rien : l’id du panneau est `p2`. Le résultat est `null`, et lire `.hidden` dessus provoque l’erreur. Les deux textes doivent être identiques.",
    retain: "`data-cible` doit correspondre exactement à l’id du panneau.",
  },

  // ═════════════ NIVEAU 5 — Validation en direct ═════════════
  {
    id: "val-1", lesson: "validation", notion: "Validation en direct", type: "qcm", difficulty: 2,
    question: "Pourquoi ajouter `^` au début et `$` à la fin d’une expression régulière de validation ?",
    options: [
      "Pour que tout le texte corresponde, et pas seulement un morceau.",
      "Pour que l’expression ne tienne pas compte des majuscules.",
      "Pour accélérer la vérification.",
      "Parce que `test()` ne marche pas sans eux.",
    ],
    answer: 0,
    why: [
      "",
      "Ce n’est pas leur rôle : l’option qui ignore la casse est le drapeau `i`.",
      "La vitesse n’est pas en cause.",
      "`test()` marche sans eux, mais accepte alors un texte qui contient seulement un morceau valide.",
    ],
    hints: [
      "Sans ces symboles, la regex peut correspondre à une partie du texte.",
      "`^` : début du texte. `$` : fin du texte.",
      "Ils exigent que le texte entier corresponde.",
    ],
    explanation: "`^` et `$` ancrent la regex au début et à la fin : « mon mail est a@b.fr, merci » ne passe plus.",
    retain: "`^...$` : tout le texte doit correspondre.",
  },
  {
    id: "val-2", lesson: "validation", notion: "Validation en direct", type: "vf", difficulty: 1,
    statement: "`champ.checkValidity()` renvoie `true` ou `false` selon les contraintes HTML du champ (`required`, `min`, `max`, `type=\"email\"`…).",
    answer: true,
    why: "Le navigateur évalue lui-même les contraintes écrites en HTML. `checkValidity()` répond par un booléen ; `champ.validity` donne le détail.",
    hints: [
      "Le navigateur sait valider un champ à partir de ses attributs HTML.",
      "La méthode répond par un booléen.",
      "L’affirmation est vraie.",
    ],
    explanation: "`checkValidity()` renvoie `true` si le champ respecte toutes ses contraintes, `false` sinon.",
    retain: "`checkValidity()` : la validation intégrée du navigateur.",
  },
  {
    id: "val-3", lesson: "validation", notion: "Validation en direct", type: "lab", difficulty: 3,
    question: "Valide l’email en direct. À chaque saisie : si le texte (sans espaces autour) ne ressemble pas à `x@y.z`, écris « Email invalide » dans `#erreur-email` ; sinon vide ce message. Le bouton `#envoyer` n’est activé que pour un email valide. Utilise une fonction `emailValide(texte)`.",
    files: labFiles(`<form id="formulaire" novalidate>
  <input id="email" type="text" placeholder="Ton email">
  <small id="erreur-email"></small>
  <button id="envoyer" type="submit" disabled>Envoyer</button>
</form>`, `// function emailValide(texte) { ... }  →  true ou false
// Réagis à l'événement input du champ
`, { lockHtml: true }),
    actions: [{ do: "input", target: "#email", value: "abc" }, { do: "input", target: "#email", value: "a@b.fr" }],
    tests: [
      { expr: `document.getElementById("erreur-email").textContent`, expect: "Email invalide", afterAction: 0, label: "« abc » : le message « Email invalide » doit s’afficher" },
      { expr: `document.getElementById("envoyer").disabled`, expect: true, afterAction: 0, label: "« abc » : le bouton doit rester désactivé" },
      { expr: `document.getElementById("erreur-email").textContent`, expect: "", label: "« a@b.fr » : le message d’erreur doit disparaître" },
      { expr: `document.getElementById("envoyer").disabled`, expect: false, label: "« a@b.fr » : le bouton doit être activé" },
      { expr: `emailValide(" x@y.zz ".trim())`, expect: true, label: "`emailValide(\"x@y.zz\")` doit renvoyer `true`" },
      { expr: `emailValide("x@y")`, expect: false, label: "`emailValide(\"x@y\")` doit renvoyer `false`" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "function\\s+emailValide", msg: "Écris une fonction `emailValide(texte)`." }],
    solution: [{ name: "script.js", code: `const champ = document.getElementById("email");
const erreur = document.getElementById("erreur-email");
const envoyer = document.getElementById("envoyer");

function emailValide(texte) {
  return /^\\S+@\\S+\\.\\S+$/.test(texte);
}

champ.addEventListener("input", () => {
  const valide = emailValide(champ.value.trim());
  if (valide) {
    erreur.textContent = "";
  } else {
    erreur.textContent = "Email invalide";
  }
  envoyer.disabled = !valide;
});` }],
    hints: [
      "Écris d’abord la fonction `emailValide(texte)`, qui renvoie `true` ou `false`. Ensuite, utilise-la dans un écouteur `input`.",
      "Une expression régulière simple : `/^\\S+@\\S+\\.\\S+$/.test(texte)`.",
      "Dans l’écouteur : `const valide = emailValide(champ.value.trim());`, puis le message avec `if` / `else`, puis `envoyer.disabled = !valide;`.",
    ],
    explanation: "La fonction `emailValide` ne fait que tester. L’écouteur lit la saisie, appelle la fonction, puis met à jour le message et le bouton d’après le résultat.",
    retain: "Sépare le test (fonction) de l’affichage (écouteur).",
  },
  {
    id: "val-4", lesson: "validation", notion: "Validation en direct", type: "lab", difficulty: 3,
    question: "Écris la fonction `motDePasseValide(texte)` : elle renvoie `true` si le texte fait au moins 8 caractères ET contient au moins un chiffre, sinon `false`.",
    files: labFiles(`<p>Fonction de validation : teste-la dans la console.</p>`, `// function motDePasseValide(texte) { ... }
`, { lockHtml: true }),
    tests: [
      { expr: `motDePasseValide("abcdefgh")`, expect: false, label: "« abcdefgh » (pas de chiffre) doit renvoyer `false`" },
      { expr: `motDePasseValide("abc12345")`, expect: true, label: "« abc12345 » doit renvoyer `true`" },
      { expr: `motDePasseValide("a1")`, expect: false, label: "« a1 » (trop court) doit renvoyer `false`" },
      { expr: `motDePasseValide("12345678")`, expect: true, label: "« 12345678 » doit renvoyer `true`" },
    ],
    expectLogs: [],
    mustContain: [],
    solution: [{ name: "script.js", code: `function motDePasseValide(texte) {
  const assezLong = texte.length >= 8;
  const aUnChiffre = /\\d/.test(texte);
  return assezLong && aUnChiffre;
}` }],
    hints: [
      "Deux conditions à combiner avec `&&`.",
      "La longueur : `texte.length >= 8`. Un chiffre : `/\\d/.test(texte)` (`\\d` désigne un chiffre).",
      "`return texte.length >= 8 && /\\d/.test(texte);`",
    ],
    explanation: "On combine deux tests booléens avec `&&` : la longueur, et la présence d’au moins un chiffre grâce à une expression régulière. La fonction renvoie directement le résultat.",
    retain: "Une fonction de validation renvoie un booléen.",
  },
  {
    id: "val-5", lesson: "validation", notion: "Validation en direct", type: "lab", difficulty: 3,
    question: "Quand on quitte le champ `#nom` (événement `blur`), affiche « Champ obligatoire » dans `#erreur` s’il est vide (après `trim()`), sinon vide le message.",
    files: labFiles(`<input id="nom" type="text" placeholder="Ton nom">
<small id="erreur" style="color: crimson"></small>`, `// Écoute blur sur #nom
`, { lockHtml: true }),
    actions: [
      { do: "event", type: "blur", target: "#nom" },
      { do: "input", target: "#nom", value: "Léa" },
      { do: "event", type: "blur", target: "#nom" },
    ],
    tests: [
      { expr: `document.getElementById("erreur").textContent`, expect: "Champ obligatoire", afterAction: 0, label: "Champ vide : « Champ obligatoire » doit s’afficher" },
      { expr: `document.getElementById("erreur").textContent`, expect: "", label: "Champ rempli : le message doit disparaître" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "blur", msg: "Utilise l’événement `\"blur\"`." }],
    solution: [{ name: "script.js", code: `const nom = document.getElementById("nom");
const erreur = document.getElementById("erreur");

nom.addEventListener("blur", () => {
  if (nom.value.trim() === "") {
    erreur.textContent = "Champ obligatoire";
  } else {
    erreur.textContent = "";
  }
});` }],
    hints: [
      "`blur` se déclenche quand un élément perd le focus.",
      "Dans le gestionnaire : teste `nom.value.trim() === \"\"`.",
      "Écris le message dans `erreur.textContent` dans le `if`, et vide-le dans le `else`.",
    ],
    explanation: "L’événement `blur` est envoyé quand on quitte le champ. On y vérifie la valeur, sans espaces, et on affiche ou efface le message.",
    retain: "`blur` : validation à la sortie du champ.",
  },

  // ═════════════ NIVEAU 5 — Données et affichage ═════════════
  {
    id: "tod-1", lesson: "todo", notion: "Données et affichage", type: "qcm", difficulty: 1,
    question: "Avec le schéma « données → affichage », quelle étape suit chaque modification du tableau de tâches ?",
    options: [
      "L’appel de `afficher()`, qui redessine la liste à partir du tableau.",
      "La suppression du tableau.",
      "Le rechargement de la page.",
      "Rien : la page se met à jour toute seule.",
    ],
    answer: 0,
    why: [
      "",
      "Le tableau est la source de vérité : on le garde.",
      "Aucun rechargement : on redessine seulement la liste.",
      "Modifier un tableau ne change pas la page : il faut redessiner explicitement.",
    ],
    hints: [
      "Le tableau et la page sont deux choses distinctes.",
      "Après avoir changé les données, il faut mettre la page à jour.",
      "La fonction qui reconstruit la liste : `afficher()`.",
    ],
    explanation: "Changer le tableau ne modifie pas la page. On appelle ensuite `afficher()`, qui reconstruit la liste d’après les données.",
    retain: "Modifier les données, puis `afficher()`.",
  },
  {
    id: "tod-2", lesson: "todo", notion: "Données et affichage", type: "predict", difficulty: 3,
    question: "Qu’affiche ce code ?",
    code: `const taches = [
  { texte: "A", fait: false },
  { texte: "B", fait: true },
  { texte: "C", fait: true },
];
taches.splice(0, 1);
const restantes = taches.filter((t) => !t.fait);
console.log(taches.length, restantes.length);`,
    answers: ["2 0"],
    common: { "3 1": "`splice(0, 1)` retire la tâche à la position 0 (A) : il reste 2 tâches.", "2 1": "La tâche non faite (A) a été retirée : parmi B et C, toutes deux faites, aucune n’est « restante »." },
    hints: [
      "`splice(0, 1)` retire 1 élément à partir de la position 0.",
      "Il reste B et C. `filter((t) => !t.fait)` garde celles qui ne sont PAS faites.",
      "Le tableau a 2 éléments, et 0 d’entre eux ne sont pas faits.",
    ],
    explanation: "`splice(0, 1)` retire la première tâche (A) : il reste B et C. Les deux sont faites, donc `filter` (qui garde les tâches non faites) renvoie un tableau vide : longueur 0.",
    retain: "`splice(index, 1)` retire un élément ; `filter` crée un nouveau tableau.",
  },
  {
    id: "tod-3", lesson: "todo", notion: "Données et affichage", type: "lab", difficulty: 3,
    question: "Écris la fonction `afficher()` qui vide `#liste`, puis crée un `<li>` par tâche du tableau, avec le texte de la tâche et la classe `fait` si la tâche est faite. Appelle-la une fois au chargement.",
    files: labFiles(`<ul id="liste"></ul>`, `const liste = document.getElementById("liste");
const taches = [
  { texte: "Courses", fait: false },
  { texte: "Ménage", fait: true },
  { texte: "Devoirs", fait: false },
];

// function afficher() { ... }
`, { lockHtml: true, lockCss: true, cssCode: TACHES_CSS }),
    tests: [
      { expr: `Array.from(document.querySelectorAll("#liste li")).map((li) => li.textContent)`, expect: ["Courses", "Ménage", "Devoirs"], label: "La liste doit contenir Courses, Ménage, Devoirs" },
      { expr: `Array.from(document.querySelectorAll("#liste li")).map((li) => li.classList.contains("fait"))`, expect: [false, true, false], label: "Seule la tâche « Ménage » doit avoir la classe `fait`" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "function\\s+afficher", msg: "Écris une fonction `afficher()`." }],
    solution: [{ name: "script.js", code: `const liste = document.getElementById("liste");
const taches = [
  { texte: "Courses", fait: false },
  { texte: "Ménage", fait: true },
  { texte: "Devoirs", fait: false },
];

function afficher() {
  liste.replaceChildren();
  taches.forEach((tache) => {
    const li = document.createElement("li");
    li.textContent = tache.texte;
    li.classList.toggle("fait", tache.fait);
    liste.append(li);
  });
}

afficher();` }],
    hints: [
      "Commence par vider la liste, puis parcours le tableau avec `forEach`.",
      "Pour chaque tâche : `createElement(\"li\")`, `textContent`, puis `classList.toggle(\"fait\", tache.fait)`.",
      "N’oublie pas `liste.append(li)` et l’appel final `afficher();`.",
    ],
    explanation: "`afficher()` reconstruit la liste à partir du tableau. `classList.toggle(\"fait\", tache.fait)` ajoute la classe seulement pour les tâches faites.",
    retain: "`afficher()` : vider, puis reconstruire à partir des données.",
  },
  {
    id: "tod-4", lesson: "todo", notion: "Données et affichage", type: "lab", difficulty: 3,
    question: "L’affichage est fourni. Écris l’ajout d’une tâche : à l’envoi du formulaire, empêche le rechargement, ajoute `{ texte, fait: false }` au tableau (si le champ n’est pas vide), vide le champ et redessine la liste.",
    files: labFiles(`<form id="formulaire">
  <input id="champ" type="text" placeholder="Nouvelle tâche">
  <button type="submit">Ajouter</button>
</form>
<ul id="liste"></ul>`, `const formulaire = document.getElementById("formulaire");
const champ = document.getElementById("champ");
const liste = document.getElementById("liste");
const taches = [
  { texte: "Courses", fait: false },
  { texte: "Ménage", fait: true },
  { texte: "Devoirs", fait: false },
];

function afficher() {
  liste.replaceChildren();
  taches.forEach((tache) => {
    const li = document.createElement("li");
    li.textContent = tache.texte;
    li.classList.toggle("fait", tache.fait);
    liste.append(li);
  });
}

afficher();

// Écris l'ajout d'une tâche
`, { lockHtml: true, lockCss: true, cssCode: TACHES_CSS }),
    actions: [{ do: "input", target: "#champ", value: "Lire" }, { do: "submit", target: "#formulaire" }],
    tests: [
      { expr: `document.querySelectorAll("#liste li").length`, expect: 4, label: "La liste doit contenir 4 tâches" },
      { expr: `document.querySelector("#liste li:last-child").textContent`, expect: "Lire", label: "La dernière tâche doit être « Lire »" },
      { expr: `taches.length`, expect: 4, label: "Le tableau `taches` doit contenir 4 éléments" },
      { expr: `document.getElementById("champ").value`, expect: "", label: "Le champ doit être vidé" },
    ],
    expectLogs: [],
    forbidLogs: [{ level: "warn", text: "formulaire a été envoyé", label: "Le formulaire est encore envoyé : appelle `event.preventDefault()`." }],
    mustContain: [{ file: "script.js", re: "taches\\.push", msg: "Ajoute la tâche au tableau avec `taches.push(...)`." }],
    solution: [{ name: "script.js", code: `const formulaire = document.getElementById("formulaire");
const champ = document.getElementById("champ");
const liste = document.getElementById("liste");
const taches = [
  { texte: "Courses", fait: false },
  { texte: "Ménage", fait: true },
  { texte: "Devoirs", fait: false },
];

function afficher() {
  liste.replaceChildren();
  taches.forEach((tache) => {
    const li = document.createElement("li");
    li.textContent = tache.texte;
    li.classList.toggle("fait", tache.fait);
    liste.append(li);
  });
}

afficher();

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  const texte = champ.value.trim();
  if (texte === "") {
    return;
  }
  taches.push({ texte: texte, fait: false });
  champ.value = "";
  afficher();
});` }],
    hints: [
      "Écoute `submit` sur le formulaire, et commence par `event.preventDefault()`.",
      "On ajoute des DONNÉES, pas un élément : `taches.push({ texte: texte, fait: false });`.",
      "Termine par `champ.value = \"\";` et `afficher();`.",
    ],
    explanation: "Le gestionnaire modifie seulement le tableau (`push`), puis appelle `afficher()`, qui redessine toute la liste. On ne crée aucun `li` ici : c’est le travail de `afficher()`.",
    retain: "Ajouter = `push` dans le tableau, puis `afficher()`.",
  },
  {
    id: "tod-5", lesson: "todo", notion: "Données et affichage", type: "lab", difficulty: 3,
    question: "L’affichage fournit un bouton « ✕ » dans chaque tâche (avec son index dans `data-index`). Écris la suppression avec un seul écouteur sur `#liste` : retire la tâche du tableau avec `splice`, puis redessine.",
    files: labFiles(`<ul id="liste"></ul>`, `const liste = document.getElementById("liste");
const taches = [
  { texte: "A", fait: false },
  { texte: "B", fait: false },
  { texte: "C", fait: false },
];

function afficher() {
  liste.replaceChildren();
  taches.forEach((tache, index) => {
    const li = document.createElement("li");
    li.textContent = tache.texte;
    li.dataset.index = index;

    const supprimer = document.createElement("button");
    supprimer.textContent = "✕";
    supprimer.classList.add("supprimer");
    li.append(supprimer);

    liste.append(li);
  });
}

afficher();

// Écris la suppression (un seul écouteur sur la liste)
`, { lockHtml: true, lockCss: true, cssCode: TACHES_CSS }),
    actions: [{ do: "click", target: "#liste li:nth-child(2) .supprimer" }],
    tests: [
      { expr: `Array.from(document.querySelectorAll("#liste li")).map((li) => li.firstChild.textContent)`, expect: ["A", "C"], label: "Après la suppression de « B », il doit rester A et C" },
      { expr: `taches.map((t) => t.texte)`, expect: ["A", "C"], label: "Le tableau `taches` doit aussi être mis à jour" },
    ],
    expectLogs: [],
    mustContain: [{ file: "script.js", re: "splice", msg: "Retire la tâche du tableau avec `taches.splice(index, 1)`." }],
    solution: [{ name: "script.js", code: `const liste = document.getElementById("liste");
const taches = [
  { texte: "A", fait: false },
  { texte: "B", fait: false },
  { texte: "C", fait: false },
];

function afficher() {
  liste.replaceChildren();
  taches.forEach((tache, index) => {
    const li = document.createElement("li");
    li.textContent = tache.texte;
    li.dataset.index = index;

    const supprimer = document.createElement("button");
    supprimer.textContent = "✕";
    supprimer.classList.add("supprimer");
    li.append(supprimer);

    liste.append(li);
  });
}

afficher();

liste.addEventListener("click", (event) => {
  if (!event.target.matches(".supprimer")) {
    return;
  }
  const index = Number(event.target.closest("li").dataset.index);
  taches.splice(index, 1);
  afficher();
});` }],
    hints: [
      "Écoute `click` sur `#liste` et ne traite que les clics sur `.supprimer`.",
      "L’index se lit dans `event.target.closest(\"li\").dataset.index`. C’est du texte : `Number(...)`.",
      "`taches.splice(index, 1);` puis `afficher();`",
    ],
    explanation: "Le bouton retrouve son `li` avec `closest`, qui porte l’index dans `data-index`. `splice(index, 1)` retire la tâche du tableau, puis `afficher()` redessine la liste (et recalcule les index).",
    retain: "Supprimer = `splice` dans le tableau, puis `afficher()`.",
  },

];

// ─── Petites fonctions pour retrouver des exercices ───
function getExercise(id) {
  return EXERCISES.find((exercise) => exercise.id === id);
}

function exercisesOf(lessonId) {
  return EXERCISES.filter((exercise) => exercise.lesson === lessonId);
}
