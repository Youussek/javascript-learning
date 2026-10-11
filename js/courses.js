// courses.js — le contenu des cours (uniquement des données, pas de logique).
//
// Chaque cours suit toujours le même plan :
//   1. explanation     : une explication simple
//   2. example         : un exemple (que tu peux modifier et exécuter)
//   3. codeExplanation : le code expliqué ligne par ligne
//   4. concrete        : un exemple concret
//   5. mistakes        : les erreurs fréquentes
//   6. summary         : un résumé
//   7. les exercices   : ils sont dans exercises.js
//
// Dans les textes, `comme ça` s’affiche en code.
// Un paragraphe est une chaîne ; { list: [...] } est une liste ; { code: "..." } est un bloc de code.


// Raccourci pour écrire les fichiers d'un atelier : une page HTML complète (le corps + la balise script),
// le fichier script.js, et un fichier style.css si on donne options.cssCode.
// options : { cssCode, title, lockHtml, lockCss }
function labFiles(body, script, options) {
  const o = options || {};
  const indented = body.split("\n").map((line) => (line === "" ? line : "  " + line)).join("\n");
  const html = '<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8">\n  <title>' + (o.title || "Page") + "</title>\n" +
    (o.cssCode ? '  <link rel="stylesheet" href="style.css">\n' : "") +
    "</head>\n<body>\n" + indented + '\n  <script src="script.js"></script>\n</body>\n</html>';
  const files = [{ name: "index.html", code: html, readOnly: o.lockHtml === true }];
  if (o.cssCode) files.push({ name: "style.css", code: o.cssCode, readOnly: o.lockCss === true });
  files.push({ name: "script.js", code: script });
  return files;
}

const MODULES = [
  { id: "n1", number: 1, title: "Fondamentaux JavaScript", available: true,
    description: "Variables, types, conditions, boucles, fonctions, tableaux, objets et portée." },
  { id: "n2", number: 2, title: "JavaScript dans le navigateur", available: true,
    description: "Relier JavaScript à une page HTML, console, window et document." },
  { id: "n3", number: 3, title: "Le DOM", available: true,
    description: "Sélectionner, modifier, créer et supprimer des éléments de la page." },
  { id: "n4", number: 4, title: "Les événements", available: true,
    description: "addEventListener, click, submit, input, clavier, souris, preventDefault." },
  { id: "n5", number: 5, title: "Interactivité", available: false,
    description: "Compteur, thème, accordéon, menu, modale, onglets, formulaire, to-do list." },
  { id: "n6", number: 6, title: "JavaScript asynchrone", available: false,
    description: "setTimeout, callbacks, Promises, async/await, fetch, JSON et API." },
];

const LESSONS = [
  // ─────────────────────────────────────────────────────────────
  {
    id: "variables",
    module: "n1",
    title: "Les variables : let et const",
    level: "Débutant",
    minutes: 10,
    explanation: [
      "Une variable, c’est une boîte avec une étiquette : on range une valeur dans la boîte (un texte, un nombre…) et on la retrouve plus tard grâce au nom de l’étiquette.",
      "On crée une variable avec un mot-clé :",
      { list: [
        "`let` : la valeur pourra changer plus tard (un score, un compteur…).",
        "`const` : la valeur ne changera jamais (un prénom, un taux…).",
      ] },
      "Bonne habitude : commence par `const`, et passe à `let` seulement si tu as besoin de changer la valeur.",
      "Le nom d’une variable ne contient pas d’espace et ne commence pas par un chiffre. On écrit en « camelCase » : `prixTotal`, `nombreDeVies`. Attention : `score` et `Score` sont deux noms différents.",
    ],
    example: {
      code: `let score = 0;
const prenom = "Léa";
score = score + 10;
console.log(prenom);
console.log(score);`,
    },
    codeExplanation: [
      { code: `let score = 0;`, text: "On crée une variable `score` et on y range `0`. Le `;` marque la fin de l’instruction." },
      { code: `const prenom = "Léa";`, text: "`prenom` contient le texte `Léa`. Un texte s’écrit entre guillemets." },
      { code: `score = score + 10;`, text: "On change la valeur : on prend l’ancienne (0), on ajoute 10, et on range le résultat (10) dans `score`. Pas de `let` ici : la variable existe déjà." },
      { code: `console.log(prenom);`, text: "`console.log()` affiche une valeur dans la console. C’est ton outil de base pour voir ce qui se passe dans ton code." },
    ],
    concrete: {
      intro: "Un panier de courses : le prix de la baguette ne change pas, mais la quantité oui.",
      code: `const prixBaguette = 1.5;
let quantite = 2;
quantite = quantite + 1;
console.log("Total :", prixBaguette * quantite);`,
    },
    mistakes: [
      { title: "Changer une constante",
        code: `const age = 20;
age = 21;
console.log(age);`,
        text: "Une `const` ne peut pas recevoir une nouvelle valeur : JavaScript affiche `TypeError: Assignment to constant variable`. Si la valeur doit changer, utilise `let`." },
      { title: "Se tromper de majuscule",
        code: `let score = 5;
console.log(Score);`,
        text: "JavaScript distingue les majuscules des minuscules : `Score` n’existe pas, seul `score` existe. C’est une erreur très courante." },
      { title: "Utiliser une variable avant de la créer",
        code: `console.log(message);
const message = "Salut";`,
        text: "Le code se lit de haut en bas. Crée toujours la variable avant de l’utiliser." },
    ],
    summary: [
      "Une variable range une valeur sous un nom.",
      "`const` : valeur fixe. `let` : valeur modifiable.",
      "On modifie une variable existante sans répéter `let` : `score = score + 10;`.",
      "Majuscules et minuscules comptent : `score` ≠ `Score`.",
      "`console.log()` affiche une valeur dans la console.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "types",
    module: "n1",
    title: "Types de données : texte, nombres, booléens",
    level: "Débutant",
    minutes: 12,
    explanation: [
      "Chaque valeur a un type, qui dit de quelle sorte de donnée il s’agit :",
      { list: [
        "`string` : du texte, entre guillemets (`\"Bonjour\"`).",
        "`number` : un nombre, entier ou décimal (`42`, `3.14`).",
        "`boolean` : vrai ou faux (`true` ou `false`).",
        "`undefined` : une variable créée sans valeur.",
        "`null` : « rien », une valeur vide mise volontairement.",
      ] },
      "L’opérateur `typeof` donne le type d’une valeur.",
      "Pour fabriquer une phrase avec des variables, on utilise des accents graves (backticks) et `${...}` : c’est un « template literal ». Exemple : `Bonjour ${prenom}`.",
    ],
    example: {
      code: [
        'const prenom = "Sam";',
        "const age = 25;",
        "const estEtudiant = true;",
        "console.log(typeof prenom);",
        "console.log(typeof age);",
        "console.log(typeof estEtudiant);",
        "console.log(`Salut ${prenom}, tu as ${age} ans`);",
        "console.log(prenom.length);",
        "console.log(prenom.toUpperCase());",
      ].join("\n"),
    },
    codeExplanation: [
      { code: `typeof prenom`, text: "Renvoie le type de la valeur : ici `\"string\"`." },
      { code: "`Salut ${prenom}, ...`", text: "Les accents graves permettent d’insérer des variables dans une phrase avec `${...}`." },
      { code: `prenom.length`, text: "Un texte a une propriété `length` : son nombre de caractères." },
      { code: `prenom.toUpperCase()`, text: "Une méthode (une fonction attachée à la valeur) qui renvoie le texte en majuscules." },
    ],
    concrete: {
      intro: "Quand on récupère une valeur depuis un formulaire, c’est toujours du texte. Voyons ce que ça change :",
      code: `const saisie = "5";
console.log(saisie + 3);
console.log(Number(saisie) + 3);`,
    },
    mistakes: [
      { title: "Oublier les guillemets",
        code: `const nom = Sam;`,
        text: "Sans guillemets, JavaScript cherche une variable nommée `Sam`. Pour du texte, écris `\"Sam\"`." },
      { title: "Additionner un texte et un nombre",
        code: `console.log("5" + 3);
console.log("5" - 3);`,
        text: "Avec `+`, un texte « colle » les valeurs (`\"53\"`). Avec `-`, JavaScript convertit en nombre (`2`). Pour être sûr, convertis toi-même avec `Number(\"5\")`." },
      { title: "Convertir quelque chose qui n’est pas un nombre",
        code: `console.log(Number("abc"));`,
        text: "`NaN` veut dire « Not a Number » : la conversion a échoué." },
    ],
    summary: [
      "Types de base : `string`, `number`, `boolean`, `undefined`, `null`.",
      "`typeof valeur` donne le type.",
      "Un texte s’écrit entre guillemets ; un nombre sans guillemets.",
      "`\"5\" + 3` donne `\"53\"` : le `+` colle les textes.",
      "Les backticks et `${...}` insèrent des variables dans une phrase.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "operateurs",
    module: "n1",
    title: "Les opérateurs",
    level: "Débutant",
    minutes: 10,
    explanation: [
      "Les opérateurs servent à calculer et à comparer.",
      "Pour calculer :",
      { list: [
        "`+` addition, `-` soustraction, `*` multiplication, `/` division.",
        "`%` le reste de la division : `7 % 2` vaut `1`.",
        "`**` la puissance : `2 ** 3` vaut `8`.",
        "Raccourci : `x += 5` signifie `x = x + 5` (même idée avec `-=`, `*=`), et `x++` ajoute 1.",
      ] },
      "Pour comparer (le résultat est toujours `true` ou `false`) :",
      { list: [
        "`===` égal (même valeur ET même type), `!==` différent.",
        "`>` plus grand, `<` plus petit, `>=` et `<=` avec égalité.",
      ] },
      "Pour combiner des conditions : `&&` (ET : les deux doivent être vraies), `||` (OU : au moins une vraie), `!` (NON : inverse).",
    ],
    example: {
      code: `const a = 7;
const b = 2;
console.log(a + b);
console.log(a % b);
console.log(a ** b);
console.log(a > b);
console.log(a === 7 && b === 2);
let total = 10;
total += 5;
console.log(total);`,
    },
    codeExplanation: [
      { code: `a % b`, text: "Le reste de 7 ÷ 2 : 7 = 2 × 3 + 1, donc le reste est 1." },
      { code: `a ** b`, text: "7 puissance 2 = 49." },
      { code: `a === 7 && b === 2`, text: "Les deux comparaisons sont vraies, donc le `&&` donne `true`." },
      { code: `total += 5;`, text: "Raccourci pour `total = total + 5;` : `total` passe de 10 à 15." },
    ],
    concrete: {
      intro: "Savoir si un nombre est pair : le reste de sa division par 2 vaut 0.",
      code: `const nombre = 14;
console.log(nombre % 2 === 0);
const autre = 15;
console.log(autre % 2 === 0);`,
    },
    mistakes: [
      { title: "Un seul = au lieu de ===",
        code: `let a = 3;
console.log(a = 5);
console.log(a);`,
        text: "Avec un seul `=`, on ne compare pas : on change la valeur de `a`. Pour comparer, il faut `===`." },
      { title: "== au lieu de ===",
        code: `console.log(5 == "5");
console.log(5 === "5");`,
        text: "`==` convertit les types avant de comparer, ce qui surprend. Prends l’habitude d’utiliser `===`." },
      { title: "Confondre && et ||",
        code: `console.log(true && false);
console.log(true || false);`,
        text: "`&&` demande que tout soit vrai ; `||` se contente d’un seul vrai." },
    ],
    summary: [
      "`+ - * /` calculent ; `%` donne le reste ; `**` la puissance.",
      "`+=`, `-=`, `++` sont des raccourcis.",
      "`===` compare ; `=` range une valeur.",
      "Une comparaison donne `true` ou `false`.",
      "`&&` = ET, `||` = OU, `!` = NON.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "conditions",
    module: "n1",
    title: "Les conditions : if / else",
    level: "Débutant",
    minutes: 12,
    explanation: [
      "Un programme peut prendre des décisions : exécuter un bloc de code seulement si une condition est vraie.",
      { code: `if (condition) {
  // exécuté si la condition est vraie
} else {
  // exécuté sinon
}` },
      "La condition entre parenthèses vaut `true` ou `false` (comme les comparaisons du cours précédent).",
      "On peut enchaîner plusieurs cas avec `else if`. JavaScript lit de haut en bas et s’arrête au premier cas vrai.",
    ],
    example: {
      code: `const note = 14;
if (note >= 16) {
  console.log("Très bien");
} else if (note >= 10) {
  console.log("Admis");
} else {
  console.log("Ajourné");
}`,
    },
    codeExplanation: [
      { code: `if (note >= 16) {`, text: "14 n’est pas ≥ 16 : on saute ce bloc." },
      { code: `} else if (note >= 10) {`, text: "14 est ≥ 10 : ce bloc s’exécute et affiche `Admis`." },
      { code: `} else {`, text: "Le `else` n’est lu que si aucune condition précédente n’était vraie. Ici, il est ignoré." },
    ],
    concrete: {
      intro: "Un tarif de cinéma qui dépend de l’âge :",
      code: `const age = 15;
let tarif;
if (age < 12) {
  tarif = "enfant";
} else if (age < 18) {
  tarif = "adolescent";
} else {
  tarif = "adulte";
}
console.log("Tarif " + tarif);`,
    },
    mistakes: [
      { title: "Utiliser = dans la condition",
        code: `let x = 3;
if (x = 5) {
  console.log("x vaut 5");
}
console.log(x);`,
        text: "`x = 5` n’est pas une comparaison : ça range 5 dans `x`, et la condition devient vraie. Il fallait `x === 5`." },
      { title: "Mal ordonner les conditions",
        code: `const note = 17;
if (note >= 10) {
  console.log("Admis");
} else if (note >= 16) {
  console.log("Très bien");
}`,
        text: "Le premier cas vrai gagne. 17 est ≥ 10, donc on n’arrive jamais au cas « Très bien ». Mets les conditions les plus précises en premier." },
      { title: "Un point-virgule après le if",
        code: `const n = 3;
if (n > 5);
{
  console.log("grand");
}`,
        text: "Le `;` termine le `if` : il ne contrôle rien. Le bloc suivant s’exécute toujours." },
    ],
    summary: [
      "`if (condition) { ... }` exécute le bloc si la condition est vraie.",
      "`else` : sinon. `else if` : un autre cas à tester.",
      "Le premier cas vrai est le seul exécuté.",
      "Pour comparer, `===` (jamais un seul `=`).",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "boucles",
    module: "n1",
    title: "Les boucles : for et while",
    level: "Facile",
    minutes: 12,
    explanation: [
      "Une boucle répète du code. Pratique pour ne pas recopier dix fois la même ligne.",
      "La boucle `for` s’utilise quand on sait combien de fois répéter :",
      { code: `for (let i = 0; i < 5; i++) {
  // répété 5 fois
}` },
      "Entre les parenthèses, trois parties séparées par `;` :",
      { list: [
        "le départ : `let i = 0` (on commence à 0) ;",
        "la condition : `i < 5` (on continue tant qu’elle est vraie) ;",
        "le pas : `i++` (après chaque tour, on ajoute 1 à `i`).",
      ] },
      "La boucle `while` répète tant qu’une condition est vraie (utile quand on ne sait pas combien de tours il faudra).",
      "Attention aux boucles infinies : si la condition ne devient jamais fausse, le programme ne s’arrête plus.",
    ],
    example: {
      code: `for (let i = 1; i <= 3; i++) {
  console.log("Tour numéro", i);
}
let n = 3;
while (n > 0) {
  console.log(n);
  n = n - 1;
}
console.log("Décollage !");`,
    },
    codeExplanation: [
      { code: `for (let i = 1; i <= 3; i++) {`, text: "`i` vaut 1, puis 2, puis 3. Dès que `i` vaut 4, la condition `i <= 3` est fausse et la boucle s’arrête." },
      { code: `while (n > 0) {`, text: "Tant que `n` est supérieur à 0, on répète le bloc." },
      { code: `n = n - 1;`, text: "Essentiel : `n` diminue à chaque tour. Sans cette ligne, `n` resterait à 3 et la boucle ne finirait jamais." },
    ],
    concrete: {
      intro: "Calculer la somme des nombres de 1 à 5 :",
      code: `let somme = 0;
for (let i = 1; i <= 5; i++) {
  somme = somme + i;
}
console.log(somme);`,
    },
    mistakes: [
      { title: "Oublier de faire évoluer la condition",
        code: `let n = 3;
while (n > 0) {
  console.log(n);
}`,
        text: "`n` ne change jamais : la boucle est infinie. Le site arrête ton code au bout de 2 secondes pour te protéger." },
      { title: "Utiliser const pour le compteur",
        code: `for (const i = 0; i < 3; i++) {
  console.log(i);
}`,
        text: "`i++` essaie de modifier `i`, ce qui est interdit pour une `const`. Dans un `for`, on utilise `let`." },
      { title: "L’erreur d’un tour (< au lieu de <=)",
        code: `for (let i = 1; i < 3; i++) {
  console.log(i);
}`,
        text: "On voulait afficher 1, 2 et 3, mais `i < 3` s’arrête avant 3. Il faut `i <= 3`." },
    ],
    summary: [
      "`for` : départ ; condition ; pas.",
      "`while` : répète tant que la condition est vraie.",
      "Le compteur d’un `for` se déclare avec `let`.",
      "Vérifie toujours que la condition finit par devenir fausse.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "fonctions",
    module: "n1",
    title: "Les fonctions : paramètres et return",
    level: "Facile",
    minutes: 15,
    explanation: [
      "Une fonction est un bloc de code auquel on donne un nom, pour le réutiliser autant de fois qu’on veut.",
      { code: `function nomDeLaFonction(parametre1, parametre2) {
  // instructions
  return resultat;
}` },
      { list: [
        "Les paramètres sont des variables qui reçoivent des valeurs au moment de l’appel.",
        "`return` renvoie un résultat à l’endroit où la fonction a été appelée, et arrête la fonction.",
        "Pour exécuter la fonction, on l’appelle avec des parenthèses : `nomDeLaFonction(3, 4)`. Les valeurs 3 et 4 s’appellent les arguments.",
      ] },
      "Attention : `console.log()` affiche une valeur à l’écran, alors que `return` renvoie une valeur au code qui a appelé la fonction. Ce n’est pas la même chose.",
      "Il existe une écriture plus courte, la fonction fléchée : `const doubler = (n) => n * 2;`. Elle fait la même chose ; on la retrouvera avec les tableaux.",
    ],
    example: {
      code: `function direBonjour(prenom) {
  return "Bonjour " + prenom + " !";
}
const message = direBonjour("Camille");
console.log(message);`,
    },
    codeExplanation: [
      { code: `function direBonjour(prenom) {`, text: "On définit une fonction `direBonjour` qui attend un paramètre : `prenom`." },
      { code: `return "Bonjour " + prenom + " !";`, text: "On construit une phrase et on la renvoie." },
      { code: `direBonjour("Camille")`, text: "On appelle la fonction : `prenom` vaut `\"Camille\"` pendant cet appel." },
      { code: `const message = ...`, text: "Le résultat renvoyé est rangé dans la variable `message`." },
    ],
    concrete: {
      intro: "Une fonction qui répond à la question « cette personne est-elle majeure ? » :",
      code: `function estMajeur(age) {
  return age >= 18;
}
console.log(estMajeur(20));
console.log(estMajeur(15));`,
    },
    mistakes: [
      { title: "Oublier le return",
        code: `function addition(a, b) {
  a + b;
}
console.log(addition(2, 3));`,
        text: "Sans `return`, la fonction calcule mais ne renvoie rien : le résultat est `undefined`." },
      { title: "Écrire du code après un return",
        code: `function test() {
  return "fini";
  console.log("jamais affiché");
}
console.log(test());`,
        text: "`return` arrête la fonction immédiatement. Tout ce qui est écrit après est ignoré." },
      { title: "Appeler sans parenthèses",
        code: `function salut() {
  return "salut";
}
console.log(salut);`,
        text: "Sans parenthèses, la fonction n’est pas exécutée : on affiche la fonction elle-même. Il faut `salut()`." },
    ],
    summary: [
      "Une fonction se définit avec `function nom(paramètres) { ... }`.",
      "On l’appelle avec des parenthèses : `nom(valeurs)`.",
      "`return` renvoie un résultat et arrête la fonction.",
      "Sans `return`, une fonction renvoie `undefined`.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "tableaux",
    module: "n1",
    title: "Les tableaux et leurs méthodes",
    level: "Moyen",
    minutes: 15,
    explanation: [
      "Un tableau (array) range plusieurs valeurs dans une seule variable, dans l’ordre. Il s’écrit entre crochets.",
      "Chaque élément a un index, sa position. Attention : on commence à compter à 0.",
      { code: `const fruits = ["pomme", "banane", "cerise"];
//  index :       0         1         2` },
      "Méthodes et outils utiles :",
      { list: [
        "`tableau.length` : le nombre d’éléments.",
        "`push(x)` : ajoute x à la fin. `pop()` : retire le dernier.",
        "`includes(x)` : `true` si x est dans le tableau.",
        "`for (const x of tableau)` : parcourt chaque élément.",
      ] },
      "Trois méthodes très utiles, qui prennent une petite fonction en argument :",
      { list: [
        "`forEach` : fait quelque chose pour chaque élément.",
        "`map` : crée un nouveau tableau en transformant chaque élément.",
        "`filter` : crée un nouveau tableau avec seulement les éléments qui passent un test.",
      ] },
      "`(n) => n * 2` est une fonction fléchée : « n donne n fois 2 ».",
    ],
    example: {
      code: `const fruits = ["pomme", "banane", "cerise"];
console.log(fruits[0]);
console.log(fruits.length);
fruits.push("kiwi");
console.log(fruits);
for (const fruit of fruits) {
  console.log(fruit);
}`,
    },
    codeExplanation: [
      { code: `fruits[0]`, text: "Le premier élément : l’index 0." },
      { code: `fruits.length`, text: "Le nombre d’éléments : 3. Le dernier index est donc `length - 1`." },
      { code: `fruits.push("kiwi");`, text: "Ajoute un élément à la fin. Le tableau est `const`, mais on peut le modifier : `const` interdit seulement de le remplacer par un autre." },
      { code: `for (const fruit of fruits) {`, text: "À chaque tour, `fruit` prend la valeur de l’élément suivant." },
    ],
    concrete: {
      intro: "Des notes : on veut les doubler, puis garder celles qui sont au moins égales à 10.",
      code: `const notes = [12, 8, 15, 10];
const doubles = notes.map((n) => n * 2);
const bonnes = notes.filter((n) => n >= 10);
console.log(doubles);
console.log(bonnes);`,
    },
    mistakes: [
      { title: "Compter à partir de 1",
        code: `const jours = ["lundi", "mardi", "mercredi"];
console.log(jours[3]);`,
        text: "Les index vont de 0 à 2. Il n’y a rien à l’index 3 : le résultat est `undefined`." },
      { title: "Oublier de récupérer le résultat de map",
        code: `const nombres = [1, 2, 3];
nombres.map((n) => n * 10);
console.log(nombres);`,
        text: "`map` ne modifie pas le tableau d’origine : il renvoie un nouveau tableau, qu’il faut ranger dans une variable." },
      { title: "Accéder au dernier élément",
        code: `const lettres = ["a", "b", "c"];
console.log(lettres[lettres.length]);
console.log(lettres[lettres.length - 1]);`,
        text: "`length` vaut 3 mais le dernier index est 2. Le dernier élément se trouve à `length - 1`." },
    ],
    summary: [
      "Un tableau s’écrit `[a, b, c]` ; le premier index est 0.",
      "`length`, `push`, `pop`, `includes` : les outils de base.",
      "`for...of` parcourt les éléments.",
      "`map` transforme, `filter` sélectionne : ils renvoient un nouveau tableau.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "objets",
    module: "n1",
    title: "Les objets",
    level: "Moyen",
    minutes: 15,
    explanation: [
      "Un objet regroupe plusieurs informations sur une même chose, sous forme de paires clé : valeur. Il s’écrit entre accolades.",
      { code: `const eleve = {
  prenom: "Inès",
  age: 17,
  notes: [12, 15]
};` },
      { list: [
        "Lire : `eleve.prenom` (avec un point) ou `eleve[\"prenom\"]` (avec des crochets).",
        "Modifier : `eleve.age = 18;`",
        "Ajouter : `eleve.ville = \"Lyon\";`",
        "Supprimer : `delete eleve.ville;`",
      ] },
      "Un objet peut contenir des tableaux ou d’autres objets, et on peut faire un tableau d’objets : très courant (liste de produits, de tâches, d’utilisateurs…).",
      "Même avec `const`, on peut modifier le contenu d’un objet. `const` empêche seulement de remplacer l’objet entier par un autre.",
    ],
    example: {
      code: `const eleve = { prenom: "Inès", age: 17, notes: [12, 15] };
console.log(eleve.prenom);
eleve.age = 18;
eleve.ville = "Lyon";
console.log(eleve);
console.log(eleve["notes"][1]);`,
    },
    codeExplanation: [
      { code: `eleve.prenom`, text: "Lit la valeur associée à la clé `prenom`." },
      { code: `eleve.age = 18;`, text: "Remplace la valeur de `age`." },
      { code: `eleve.ville = "Lyon";`, text: "La clé `ville` n’existait pas : elle est créée." },
      { code: `eleve["notes"][1]`, text: "On lit le tableau `notes`, puis son élément d’index 1 : 15." },
    ],
    concrete: {
      intro: "Une liste de produits (un tableau d’objets), qu’on parcourt pour calculer un total :",
      code: `const produits = [
  { nom: "Stylo", prix: 2 },
  { nom: "Cahier", prix: 4 }
];
let total = 0;
for (const produit of produits) {
  console.log(produit.nom + " : " + produit.prix + " €");
  total += produit.prix;
}
console.log("Total : " + total + " €");`,
    },
    mistakes: [
      { title: "Lire une propriété qui n’existe pas",
        code: `const chat = { nom: "Miso" };
console.log(chat.age);`,
        text: "Pas d’erreur, mais `undefined` : `age` n’a jamais été défini. Vérifie l’orthographe des clés." },
      { title: "Écrire = au lieu de : dans un objet",
        code: `const chat = { nom = "Miso" };`,
        text: "Dans un objet, la clé et la valeur sont séparées par `:`." },
      { title: "Croire que const bloque toute modification",
        code: `const chat = { nom: "Miso" };
chat.nom = "Félix";
console.log(chat.nom);`,
        text: "Aucune erreur : on modifie le contenu de l’objet, pas la variable `chat`." },
    ],
    summary: [
      "Un objet = des paires `clé: valeur` entre accolades.",
      "Lire : `objet.cle`. Modifier ou ajouter : `objet.cle = valeur`.",
      "Un objet peut contenir tableaux et objets.",
      "Un `const` objet peut être modifié, mais pas remplacé.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "portee",
    module: "n1",
    title: "La portée des variables",
    level: "Moyen",
    minutes: 12,
    explanation: [
      "La portée (scope) d’une variable, c’est l’endroit du code où on peut l’utiliser.",
      { list: [
        "Portée globale : une variable créée en dehors de tout bloc est visible partout.",
        "Portée de fonction : une variable créée dans une fonction n’est visible que dans cette fonction.",
        "Portée de bloc : avec `let` et `const`, une variable créée entre accolades `{ }` (un `if`, un `for`…) n’existe que dans ces accolades.",
      ] },
      "Pourquoi c’est utile ? Chaque morceau de code a ses propres variables : pas de mélange. En contrepartie, il faut déclarer à l’extérieur ce qu’on veut réutiliser après.",
      "Si une variable locale porte le même nom qu’une variable extérieure, la locale « cache » l’autre dans son bloc.",
    ],
    example: {
      code: `const globale = "visible partout";
function afficher() {
  const locale = "visible ici seulement";
  console.log(globale);
  console.log(locale);
}
afficher();
if (true) {
  let dansBloc = "dans le bloc";
  console.log(dansBloc);
}
console.log(globale);`,
    },
    codeExplanation: [
      { code: `const globale = ...`, text: "Créée hors de tout bloc : on peut la lire dans la fonction et après." },
      { code: `const locale = ...`, text: "Créée dans la fonction : elle disparaît quand la fonction se termine." },
      { code: `let dansBloc = ...`, text: "Créée dans le `if` : elle n’existe qu’entre ses accolades." },
    ],
    concrete: {
      intro: "On veut réutiliser `total` après la boucle : il doit être créé avant. Les variables `i` et `double` n’existent que dans la boucle.",
      code: `let total = 0;
for (let i = 1; i <= 3; i++) {
  const double = i * 2;
  total = total + double;
}
console.log(total);`,
    },
    mistakes: [
      { title: "Lire une variable locale en dehors de sa fonction",
        code: `function afficher() {
  const locale = "ici";
}
afficher();
console.log(locale);`,
        text: "`locale` n’existe que dans la fonction. En dehors, JavaScript répond `ReferenceError: locale is not defined`." },
      { title: "Lire une variable en dehors de son bloc",
        code: `if (true) {
  const secret = 42;
}
console.log(secret);`,
        text: "Avec `let` et `const`, la variable reste dans ses accolades." },
      { title: "Deux variables du même nom",
        code: `let x = 1;
if (true) {
  let x = 2;
  console.log(x);
}
console.log(x);`,
        text: "Ce sont deux variables différentes. Celle du bloc vaut 2 ; celle de l’extérieur reste à 1." },
    ],
    summary: [
      "La portée = où une variable est utilisable.",
      "`let` et `const` restent dans leur bloc `{ }`.",
      "Une variable de fonction n’est pas visible en dehors.",
      "Déclare à l’extérieur ce que tu veux réutiliser après un bloc.",
    ],
  },
  // ═════════════════ NIVEAU 2 : JavaScript dans le navigateur ═════════════════
  {
    id: "navigateur",
    module: "n2",
    title: "Le navigateur et la page web",
    level: "Débutant",
    minutes: 12,
    explanation: [
      "Quand tu ouvres une page web, ton navigateur (Chrome, Firefox, Safari, Edge…) fait tout ce travail pour toi :",
      { list: [
        "Il télécharge le fichier HTML : la structure de la page (titres, paragraphes, boutons…).",
        "Il lit le HTML de haut en bas et construit le DOM : un arbre qui représente chaque élément de la page.",
        "Quand il croise une balise `<link>` ou `<script>`, il charge le fichier CSS ou JavaScript indiqué.",
        "Il applique le CSS (l’apparence) et dessine la page à l’écran.",
        "Il exécute le JavaScript (le comportement), qui peut lire et modifier la page.",
        "Ensuite, il attend : un clic, une touche, un message… et il réagit.",
      ] },
      "Trois langages, trois rôles : le HTML décrit la structure, le CSS décrit l’apparence, le JavaScript décrit le comportement.",
      "Le JavaScript s’exécute dans le navigateur de la personne qui visite la page. Par sécurité, il ne peut ni lire ses fichiers, ni espionner les autres onglets.",
      "Le navigateur donne aussi à JavaScript des outils en plus du langage : `window`, `document`, `console`… Ce sont des objets du navigateur. Au niveau 1, ton code tournait sans page : ils n’existaient pas. Maintenant, ils sont là.",
    ],
    example: {
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Ma première page</title>
</head>
<body>
  <h1>Bonjour !</h1>
  <p>Cette page est construite par le navigateur.</p>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `console.log("Le navigateur a exécuté ce script.");
console.log("Titre de la page :", document.title);` },
      ],
    },
    codeExplanation: [
      { code: `<h1>Bonjour !</h1>`, text: "Le navigateur lit cette ligne et ajoute un titre à la page (un élément dans le DOM)." },
      { code: `<script src="script.js"></script>`, text: "En arrivant ici, le navigateur charge le fichier `script.js` et exécute son code." },
      { code: `console.log(...)`, text: "Écrit dans la console du navigateur (ici, la zone « Console » à droite)." },
      { code: `document.title`, text: "Le titre de la page (la balise `<title>`). `document` est fourni par le navigateur." },
    ],
    concrete: {
      intro: "JavaScript peut aussi changer la page. Ici, il modifie le titre et la couleur de fond (on étudiera tout le DOM au niveau 3).",
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Page de départ</title>
</head>
<body>
  <h1>Ma page</h1>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `document.title = "Page modifiée";
document.body.style.backgroundColor = "lightyellow";
console.log("Nouveau titre :", document.title);` },
      ],
    },
    mistakes: [
      { title: "Utiliser document sans page",
        code: `console.log(document.title);`,
        text: "Ici, le code tourne sans page web : `document` n’existe pas, d’où l’erreur. Dans une vraie page, c’est le navigateur qui le fournit." },
      { title: "Le script s’exécute avant que la page existe",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <title>Test</title>
  <script src="script.js"></script>
</head>
<body>
  <h1>Salut</h1>
</body>
</html>` },
          { name: "script.js", code: `document.body.style.backgroundColor = "lightblue";` },
        ],
        text: "Le navigateur lit de haut en bas. Quand ce script s’exécute (dans le `<head>`), le `<body>` n’a pas encore été lu : `document.body` vaut `null`. La leçon suivante montre comment régler ça." },
      { title: "Croire que JavaScript modifie le fichier HTML",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Original</title></head>
<body>
  <h1>Titre</h1>
  <script src="script.js"></script>
</body>
</html>` },
          { name: "script.js", code: `document.title = "Changé par JavaScript";
console.log(document.title);` },
        ],
        text: "Le titre change dans la page affichée, mais le fichier `index.html` reste identique. JavaScript modifie la page en mémoire (le DOM). Si tu recharges la page, tout repart du fichier HTML." },
    ],
    summary: [
      "Le navigateur lit le HTML, construit le DOM, charge CSS et JavaScript, affiche la page, puis réagit.",
      "HTML = structure, CSS = apparence, JavaScript = comportement.",
      "Le JavaScript tourne dans le navigateur du visiteur.",
      "`window`, `document` et `console` sont fournis par le navigateur.",
      "JavaScript modifie la page en mémoire (le DOM), pas le fichier HTML.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "integrer",
    module: "n2",
    title: "Connecter JavaScript à HTML",
    level: "Débutant",
    minutes: 14,
    explanation: [
      "Pour que le navigateur exécute ton JavaScript, la page HTML doit le lui indiquer avec la balise `<script>`. Il y a trois façons de s’y prendre :",
      { list: [
        "Dans le HTML : `<script> console.log(\"Salut\"); </script>`. Pratique pour un test rapide, mais le code se mélange à la page.",
        "Dans un fichier séparé (la bonne méthode) : `<script src=\"script.js\"></script>`. Le fichier `.js` ne contient que du JavaScript.",
        "Dans un attribut : `<button onclick=\"...\">`. À éviter : on utilisera les événements au niveau 4.",
      ] },
      "Où placer la balise ? Le navigateur lit de haut en bas et exécute le script dès qu’il le rencontre. Deux bonnes solutions :",
      { list: [
        "à la fin du `<body>`, juste avant `</body>` : la page est déjà construite quand le script s’exécute ;",
        "dans le `<head>`, avec l’attribut `defer` : `<script src=\"script.js\" defer></script>`. Le fichier est téléchargé pendant la lecture de la page, puis exécuté une fois la page lue.",
      ] },
      "Le chemin dans `src` est relatif au fichier HTML : `script.js` est dans le même dossier, `js/script.js` dans le dossier `js`. Si le nom est faux (une lettre en trop…), le fichier ne se charge pas.",
      "Une page peut avoir plusieurs scripts : ils partagent les mêmes variables et s’exécutent dans l’ordre où ils sont écrits.",
    ],
    example: {
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Script en bas</title>
</head>
<body>
  <h1>Bonjour</h1>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `const message = "Script chargé !";
console.log(message);
console.log("Le body existe ?", document.body !== null);` },
      ],
    },
    codeExplanation: [
      { code: `<script src="script.js"></script>`, text: "`src` donne le chemin du fichier. La balise se ferme toujours avec `</script>`, même sans contenu entre les deux." },
      { code: `…</script> avant </body>`, text: "Le script est placé en dernier : quand il s’exécute, le `<h1>` existe déjà." },
      { code: `document.body !== null`, text: "Vrai : le `<body>` a déjà été lu." },
    ],
    concrete: {
      intro: "Même résultat avec le script dans le `<head>`, grâce à `defer` :",
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Script avec defer</title>
  <script src="script.js" defer></script>
</head>
<body>
  <h1>Bonjour</h1>
</body>
</html>` },
        { name: "script.js", code: `document.body.style.backgroundColor = "lavender";
console.log("Page prête, titre :", document.title);` },
      ],
    },
    mistakes: [
      { title: "Script dans le head, sans defer",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head>
  <title>Test</title>
  <script src="script.js"></script>
</head>
<body>
  <h1>Salut</h1>
</body>
</html>` },
          { name: "script.js", code: `document.body.style.color = "red";` },
        ],
        text: "Le script s’exécute avant que le `<body>` existe : `document.body` vaut `null`. Ajoute `defer` à la balise, ou déplace-la à la fin du body." },
      { title: "Une faute dans le nom du fichier",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Test</title></head>
<body>
  <h1>Salut</h1>
  <script src="scrpit.js"></script>
</body>
</html>` },
          { name: "script.js", code: `console.log("Je ne serai jamais exécuté.");` },
        ],
        text: "Le fichier s’appelle `script.js`, mais la balise cherche `scrpit.js` : le navigateur ne le trouve pas. Le nom doit être identique, lettre pour lettre." },
      { title: "Deux scripts dans le mauvais ordre",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Test</title></head>
<body>
  <h1>Salut</h1>
  <script src="main.js"></script>
  <script src="outils.js"></script>
</body>
</html>` },
          { name: "outils.js", code: `function saluer(nom) {
  return "Bonjour " + nom;
}` },
          { name: "main.js", code: `console.log(saluer("Léa"));` },
        ],
        text: "`main.js` utilise `saluer`, définie dans `outils.js`, mais `outils.js` est chargé après. Inverse l’ordre des deux balises : le fichier qui définit doit venir avant celui qui utilise." },
    ],
    summary: [
      "`<script src=\"fichier.js\"></script>` relie un fichier JavaScript à la page.",
      "Place-le à la fin du `<body>`, ou dans le `<head>` avec `defer`.",
      "Le nom du fichier dans `src` doit être exact.",
      "Les scripts s’exécutent dans l’ordre des balises et partagent leurs variables.",
      "Un script lancé trop tôt voit `document.body` égal à `null`.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "console",
    module: "n2",
    title: "console.log() et les outils du navigateur",
    level: "Débutant",
    minutes: 12,
    explanation: [
      "La console est ton meilleur outil pour comprendre ce que fait ton code. Dans un vrai navigateur, ouvre les outils de développement avec F12 (ou Ctrl + Maj + I, ou Cmd + Option + I sur Mac), puis l’onglet « Console ». Dans l’atelier de ce site, la zone « Console » joue ce rôle.",
      "Les principales méthodes :",
      { list: [
        "`console.log(a, b)` : affiche une ou plusieurs valeurs, séparées par un espace.",
        "`console.info()` : un message d’information.",
        "`console.warn()` : un avertissement (affiché en jaune).",
        "`console.error()` : une erreur (affichée en rouge).",
      ] },
      "Les erreurs JavaScript s’affichent aussi en rouge, avec le type d’erreur, le message, le fichier et le numéro de ligne. Lis-les : elles disent presque toujours où chercher.",
      "Astuce de débogage : mets un texte devant la valeur, `console.log(\"total =\", total)`. Tu sais tout de suite de quelle variable il s’agit.",
      "Dans un vrai navigateur, tu peux aussi taper du JavaScript directement dans la console et voir le résultat. C’est pratique pour tester une idée.",
    ],
    example: {
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Console</title></head>
<body>
  <h1>Regarde la console</h1>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `console.log("Un message simple");
console.log("a =", 5, "et b =", true);
console.info("Information");
console.warn("Attention : batterie faible");
console.error("Erreur : fichier introuvable");` },
      ],
    },
    codeExplanation: [
      { code: `console.log("a =", 5, "et b =", true);`, text: "Plusieurs valeurs séparées par des virgules : elles s’affichent sur une ligne, séparées par un espace." },
      { code: `console.warn(...)`, text: "Même chose que `log`, mais affiché comme un avertissement." },
      { code: `console.error(...)`, text: "Affiché comme une erreur, en rouge. Cela ne stoppe pas le programme : c’est juste un message." },
    ],
    concrete: {
      intro: "Déboguer : on affiche les valeurs qui entrent et sortent d’une fonction pour vérifier qu’elles sont celles qu’on attend.",
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Débogage</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `function calculerPrix(prixHT, quantite) {
  console.log("prixHT =", prixHT, "| quantite =", quantite);
  const total = prixHT * quantite;
  console.log("total =", total);
  return total;
}
calculerPrix(12, 3);` },
      ],
    },
    mistakes: [
      { title: "Oublier les guillemets",
        code: `console.log(Bonjour);`,
        text: "Sans guillemets, JavaScript cherche une variable nommée `Bonjour`. Pour afficher du texte : `console.log(\"Bonjour\")`." },
      { title: "Une majuscule de trop",
        code: `console.Log("Salut");`,
        text: "La méthode s’appelle `log`, en minuscules. JavaScript distingue les majuscules des minuscules." },
      { title: "Oublier les parenthèses",
        code: `console.log;`,
        text: "Sans parenthèses, la méthode n’est pas appelée : rien ne s’affiche. Il faut `console.log()`." },
    ],
    summary: [
      "F12 ouvre les outils de développement ; l’onglet Console affiche les messages et les erreurs.",
      "`console.log()` affiche ; `warn` avertit ; `error` signale une erreur.",
      "Affiche un texte avec la valeur : `console.log(\"total =\", total)`.",
      "Une erreur rouge indique le type, le message et la ligne : commence par la lire.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "window",
    module: "n2",
    title: "window : la fenêtre du navigateur",
    level: "Facile",
    minutes: 14,
    explanation: [
      "`window` représente la fenêtre (l’onglet) du navigateur. C’est l’objet « global » : tout ce que le navigateur offre à JavaScript en est une propriété. `console`, `document`, `alert`, `setTimeout`… sont en réalité `window.console`, `window.document`, `window.alert`… On peut donc écrire `console.log()` ou `window.console.log()` : c’est la même chose.",
      "Quelques propriétés et méthodes utiles :",
      { list: [
        "`window.innerWidth` et `window.innerHeight` : taille de la zone d’affichage de la page, en pixels.",
        "`window.location` : l’adresse de la page. `location.href` donne l’adresse complète, `location.reload()` recharge la page.",
        "`alert(message)` : affiche une boîte de message.",
        "`confirm(question)` : affiche une boîte OK / Annuler et renvoie `true` ou `false`.",
        "`prompt(question)` : demande un texte à la personne et le renvoie (ou `null` si elle annule).",
      ] },
      "Les variables créées avec `var` au niveau global deviennent des propriétés de `window`. Ce n’est pas le cas de `let` et `const`, ce qui est une des raisons de les préférer.",
      "Dans l’atelier du site, les boîtes `alert`, `confirm` et `prompt` sont bloquées : elles s’écrivent dans la console, avec une réponse automatique (OK pour `confirm`, texte vide pour `prompt`). Dans un vrai navigateur, une fenêtre s’ouvre.",
    ],
    example: {
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>window</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `console.log(window.innerWidth > 0);
console.log(typeof window.document);
console.log(window.console === console);
var ancienne = 1;
let moderne = 2;
console.log(window.ancienne);
console.log(window.moderne);` },
      ],
    },
    codeExplanation: [
      { code: `window.innerWidth > 0`, text: "La largeur de la zone d’affichage est un nombre positif : `true`." },
      { code: `window.console === console`, text: "`console` est bien une propriété de `window` : c’est le même objet." },
      { code: `var ancienne = 1;`, text: "Une variable `var` globale devient une propriété de `window` : `window.ancienne` vaut 1." },
      { code: `let moderne = 2;`, text: "Avec `let`, ce n’est pas le cas : `window.moderne` vaut `undefined`." },
    ],
    concrete: {
      intro: "Les boîtes de dialogue : un message, une question OK / Annuler, une saisie.",
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Dialogues</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `alert("Bienvenue sur ma page !");
const veutContinuer = confirm("Veux-tu continuer ?");
console.log("Réponse :", veutContinuer);
const prenom = prompt("Ton prénom ?");
console.log("Prénom saisi :", prenom);` },
      ],
    },
    mistakes: [
      { title: "Une faute de frappe sur window",
        code: `console.log(windows.innerWidth);`,
        text: "`windows` avec un « s » n’existe pas. L’objet s’appelle `window`." },
      { title: "Croire que let crée une propriété de window",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Test</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
          { name: "script.js", code: `let compteur = 10;
console.log(compteur);
console.log(window.compteur);` },
        ],
        text: "`compteur` existe, mais elle n’est pas une propriété de `window` : `let` et `const` restent à l’écart de l’objet global." },
      { title: "Oublier que prompt renvoie du texte",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Test</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
          { name: "script.js", code: `const age = prompt("Ton âge ?");
console.log(typeof age);
console.log(Number(age) + 1);` },
        ],
        text: "`prompt` renvoie toujours du texte (ou `null`). Pour calculer, convertis avec `Number(...)`, comme au niveau 1." },
    ],
    summary: [
      "`window` est l’objet global du navigateur : `console`, `document`, `alert`… en font partie.",
      "`innerWidth` et `innerHeight` donnent la taille de la zone d’affichage.",
      "`location.href` donne l’adresse de la page.",
      "`alert`, `confirm` et `prompt` ouvrent des boîtes de dialogue ; `prompt` renvoie du texte.",
      "`var` global devient une propriété de `window`, pas `let` ni `const`.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "document",
    module: "n2",
    title: "document : la page HTML",
    level: "Facile",
    minutes: 14,
    explanation: [
      "`document` représente la page HTML chargée. C’est la porte d’entrée du DOM, que tu étudieras en détail au niveau 3. Il appartient à `window` : `document` est la même chose que `window.document`.",
      "Ne les confonds pas : `window` est la fenêtre du navigateur (taille, adresse, boîtes de dialogue), `document` est le contenu de la page à l’intérieur de cette fenêtre (titre, éléments).",
      "Quelques propriétés à connaître :",
      { list: [
        "`document.title` : le titre de la page (la balise `<title>`).",
        "`document.body` : l’élément `<body>` de la page.",
        "`document.head` : l’élément `<head>`.",
        "`document.documentElement` : l’élément `<html>`.",
      ] },
      "On peut lire ces propriétés, et souvent les modifier : `document.title = \"Nouveau titre\";`.",
      "Pour changer l’apparence d’un élément : `element.style.backgroundColor = \"lightblue\";`. Les propriétés CSS qui contiennent un tiret s’écrivent en camelCase : `background-color` devient `backgroundColor`, `font-size` devient `fontSize`.",
      "Un avant-goût du niveau 3 : `document.querySelector(\"h1\")` trouve un élément de la page à partir d’un sélecteur CSS.",
    ],
    example: {
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
</html>` },
        { name: "script.js", code: `console.log("Titre avant :", document.title);
document.title = "Titre modifié";
console.log("Titre après :", document.title);
document.body.style.backgroundColor = "lightyellow";` },
      ],
    },
    codeExplanation: [
      { code: `document.title`, text: "Lit le titre de la page : celui de la balise `<title>`." },
      { code: `document.title = "Titre modifié";`, text: "Change le titre. Dans un vrai navigateur, le texte de l’onglet change aussi." },
      { code: `document.body.style.backgroundColor`, text: "`document.body` est la page visible ; `.style` donne accès à son CSS ; `.backgroundColor` est la couleur de fond." },
    ],
    concrete: {
      intro: "Un avant-goût du niveau 3 : retrouver un élément de la page, lire son texte et le modifier.",
      files: [
        { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Avant-goût</title></head>
<body>
  <h1>Bienvenue</h1>
  <script src="script.js"></script>
</body>
</html>` },
        { name: "script.js", code: `const titre = document.querySelector("h1");
console.log("Texte du titre :", titre.textContent);
titre.style.color = "crimson";` },
      ],
    },
    mistakes: [
      { title: "Appeler une propriété comme une fonction",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Test</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
          { name: "script.js", code: `console.log(document.title());` },
        ],
        text: "`title` est une propriété (une valeur), pas une fonction : on écrit `document.title`, sans parenthèses." },
      { title: "Un tiret dans le nom d’une propriété CSS",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Test</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
          { name: "script.js", code: `document.body.style.background-color = "red";` },
        ],
        text: "JavaScript lit `background-color` comme « background moins color ». En JavaScript, les propriétés CSS s’écrivent en camelCase : `backgroundColor`." },
      { title: "Une faute de majuscule",
        files: [
          { name: "index.html", code: `<!DOCTYPE html>
<html lang="fr">
<head><title>Test</title></head>
<body>
  <script src="script.js"></script>
</body>
</html>` },
          { name: "script.js", code: `document.Body.style.color = "red";` },
        ],
        text: "`document.Body` n’existe pas (c’est `body`), donc sa valeur est `undefined`, et lire `.style` dessus provoque une erreur." },
    ],
    summary: [
      "`document` est la page HTML ; `window` est la fenêtre qui la contient.",
      "`document.title` se lit et se modifie ; `document.body` est le corps de la page.",
      "`element.style.backgroundColor = \"...\"` change le style, avec des propriétés en camelCase.",
      "`document.querySelector(\"h1\")` trouve un élément (à suivre au niveau 3).",
    ],
  },

  // ═════════════════ NIVEAU 3 : Le DOM ═════════════════
  {
    id: "dom",
    module: "n3",
    title: "Comprendre le DOM",
    level: "Débutant",
    minutes: 14,
    explanation: [
      "Le DOM (Document Object Model) est la représentation de ta page dans la mémoire du navigateur. C’est un arbre : chaque balise HTML devient un nœud (un objet JavaScript), et un nœud peut avoir des enfants.",
      { code: `<body>
  <h1>Titre</h1>
  <ul>
    <li>Un</li>
    <li>Deux</li>
  </ul>
</body>` },
      "Dans cet arbre, `body` a deux enfants : `h1` et `ul`. `ul` a deux enfants : les deux `li`. `h1` et `ul` sont frères (même parent). `body` est le parent de `ul`.",
      { list: [
        "Un élément est un nœud qui correspond à une balise : `h1`, `ul`, `li`…",
        "Un nœud de texte contient le texte à l’intérieur d’un élément (« Titre »).",
        "Les attributs (`id`, `class`, `src`…) sont rattachés à leur élément.",
      ] },
      "JavaScript peut lire le DOM, le modifier, y créer des éléments et en supprimer. Dès que le DOM change, le navigateur met l’affichage à jour tout seul.",
      "Pour voir le DOM d’une vraie page, ouvre les outils de développement (F12) puis l’onglet « Éléments » : tu vois l’arbre en direct, avec les changements faits par JavaScript.",
      "Le point d’entrée est `document`. À partir de là, on descend dans l’arbre : `document.body`, puis ses enfants avec `children`, `firstElementChild`… On peut aussi remonter (`parentElement`) ou aller de frère en frère (`nextElementSibling`).",
    ],
    example: {
      files: labFiles(`<h1>Titre</h1>
<ul>
  <li>Un</li>
  <li>Deux</li>
</ul>`, `const titre = document.body.firstElementChild;
console.log(titre.tagName);
const liste = titre.nextElementSibling;
console.log(liste.tagName);
console.log(liste.children.length);
console.log(liste.parentElement.tagName);`),
    },
    codeExplanation: [
      { code: `document.body.firstElementChild`, text: "Le premier élément enfant du `body` : ici le `h1`." },
      { code: `titre.tagName`, text: "Le nom de la balise, en majuscules : `\"H1\"`." },
      { code: `titre.nextElementSibling`, text: "Le frère suivant du `h1` : le `ul`." },
      { code: `liste.children.length`, text: "Le nombre d’éléments enfants du `ul` : 2 (les deux `li`)." },
      { code: `liste.parentElement`, text: "Le parent du `ul` : le `body`." },
    ],
    concrete: {
      intro: "Parcourir les enfants du `body`. Remarque : la balise `script` est aussi un élément de la page.",
      files: labFiles(`<h1>Mon site</h1>
<p>Bienvenue.</p>
<ul>
  <li>Accueil</li>
  <li>Contact</li>
</ul>`, `for (const enfant of document.body.children) {
  console.log(enfant.tagName);
}`),
    },
    mistakes: [
      { title: "Confondre children et childNodes",
        files: labFiles(`<h1>Titre</h1>
<p>Texte</p>`, `console.log(document.body.childNodes.length);
console.log(document.body.children.length);`),
        text: "`childNodes` compte tous les nœuds, y compris les retours à la ligne entre les balises (des nœuds de texte). `children` ne compte que les éléments. Le plus souvent, c’est `children` qu’on veut." },
      { title: "Prendre document pour un élément",
        files: labFiles(`<h1>Titre</h1>`, `console.log(document.tagName);
console.log(document.documentElement.tagName);`),
        text: "`document` est l’ensemble de la page, pas un élément : il n’a pas de `tagName`. L’élément `<html>` s’obtient avec `document.documentElement`." },
      { title: "Un index qui n’existe pas",
        files: labFiles(`<h1>Titre</h1>
<p>Texte</p>`, `const enfant = document.body.children[5];
console.log(enfant.tagName);`),
        text: "Le `body` n’a pas six enfants : `children[5]` vaut `undefined`, et lire `.tagName` dessus provoque une erreur." },
    ],
    summary: [
      "Le DOM est l’arbre des éléments de la page, en mémoire.",
      "Un élément a un parent, des enfants et des frères.",
      "`children`, `firstElementChild`, `parentElement`, `nextElementSibling` permettent de se déplacer dans l’arbre.",
      "Modifier le DOM met la page à jour ; le fichier HTML ne change pas.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "selectionner",
    module: "n3",
    title: "Sélectionner des éléments",
    level: "Débutant",
    minutes: 15,
    explanation: [
      "Avant de modifier un élément, il faut le retrouver. JavaScript propose trois outils principaux :",
      { list: [
        "`document.getElementById(\"titre\")` : renvoie l’élément qui a cet id, ou `null` s’il n’existe pas.",
        "`document.querySelector(\"h1\")` : renvoie le premier élément qui correspond au sélecteur CSS, ou `null`.",
        "`document.querySelectorAll(\"li\")` : renvoie tous les éléments qui correspondent (une NodeList, vide s’il n’y en a aucun).",
      ] },
      "Les sélecteurs sont ceux du CSS : `h1` (une balise), `.carte` (une classe), `#titre` (un id), `ul li` (un `li` dans un `ul`), `nav a`, `button.principal`…",
      "Attention : `getElementById` reçoit l’id sans `#`, alors que `querySelector` demande le sélecteur complet, donc avec `#`.",
      "Si rien ne correspond, tu obtiens `null`, et lire une propriété sur `null` provoque une erreur. Vérifie l’orthographe, et que le script s’exécute après la page (en bas du body, ou avec `defer`).",
      "Range le résultat dans une `const` pour pouvoir le réutiliser.",
    ],
    example: {
      files: labFiles(`<h1 id="titre">Mon blog</h1>
<p class="intro">Bienvenue sur ma page.</p>
<ul>
  <li>Un</li>
  <li>Deux</li>
  <li>Trois</li>
</ul>`, `const titre = document.getElementById("titre");
const intro = document.querySelector(".intro");
const items = document.querySelectorAll("li");
console.log(titre.textContent);
console.log(intro.textContent);
console.log(items.length);
console.log(document.querySelector("#inconnu"));`),
    },
    codeExplanation: [
      { code: `document.getElementById("titre")`, text: "Cherche l’élément dont l’id est `titre` (sans `#`)." },
      { code: `document.querySelector(".intro")`, text: "Le point désigne une classe : on obtient le premier élément qui a la classe `intro`." },
      { code: `document.querySelectorAll("li")`, text: "Tous les `li` de la page, dans l’ordre. `length` donne leur nombre." },
      { code: `document.querySelector("#inconnu")`, text: "Aucun élément avec cet id : le résultat est `null`." },
    ],
    concrete: {
      intro: "Retrouver les liens d’un menu, et celui qui est actif :",
      files: labFiles(`<nav>
  <a href="#">Accueil</a>
  <a href="#">Blog</a>
  <a href="#" class="actif">Contact</a>
</nav>`, `const liens = document.querySelectorAll("nav a");
console.log("Liens :", liens.length);
const actif = document.querySelector("nav a.actif");
console.log("Lien actif :", actif.textContent);`),
    },
    mistakes: [
      { title: "Mettre un # dans getElementById",
        files: labFiles(`<h1 id="titre">Mon blog</h1>`, `const titre = document.getElementById("#titre");
console.log(titre.textContent);`),
        text: "`getElementById` attend l’id seul : `\"titre\"`. Avec `\"#titre\"`, il cherche un id qui contient le caractère `#` : il ne trouve rien (`null`)." },
      { title: "Oublier le # ou le . dans querySelector",
        files: labFiles(`<h1 id="titre">Mon blog</h1>`, `const titre = document.querySelector("titre");
console.log(titre);`),
        text: "Sans `#`, `\"titre\"` désigne une balise `<titre>` : elle n’existe pas, donc `null`. Pour un id, écris `\"#titre\"` ; pour une classe, `\".nom\"`." },
      { title: "querySelector ne renvoie que le premier",
        files: labFiles(`<ul>
  <li>Un</li>
  <li>Deux</li>
  <li>Trois</li>
</ul>`, `console.log(document.querySelector("li").textContent);
console.log(document.querySelectorAll("li").length);`),
        text: "`querySelector` s’arrête au premier élément trouvé. Pour récupérer tous les `li`, il faut `querySelectorAll`." },
    ],
    summary: [
      "`getElementById(\"id\")` : un élément, par son id (sans `#`).",
      "`querySelector(\"sélecteur\")` : le premier élément qui correspond.",
      "`querySelectorAll(\"sélecteur\")` : tous les éléments qui correspondent.",
      "Aucun résultat : `null` (ou liste vide pour `querySelectorAll`).",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "texte",
    module: "n3",
    title: "Modifier le texte et le HTML",
    level: "Facile",
    minutes: 15,
    explanation: [
      "Une fois l’élément trouvé, on peut lire et modifier son contenu avec deux propriétés :",
      { list: [
        "`textContent` : le texte brut de l’élément. Si tu y écris des balises, elles s’affichent telles quelles : elles ne sont pas interprétées. C’est la méthode sûre pour du texte.",
        "`innerHTML` : le HTML à l’intérieur de l’élément. Les balises sont interprétées : `element.innerHTML = \"<strong>Gras</strong>\"` met du texte en gras.",
      ] },
      "Prudence avec `innerHTML` : n’y mets jamais un texte venu d’une personne (champ de saisie…), car elle pourrait y glisser du code. Pour afficher du texte, préfère `textContent`.",
      "Pour ajouter à un texte existant : `element.textContent += \" !\"`.",
      "Écrire dans `textContent` ou `innerHTML` remplace tout le contenu précédent, y compris les éléments enfants.",
      "Le changement est immédiat : la page se met à jour dès que la ligne est exécutée.",
    ],
    example: {
      files: labFiles(`<h1 id="titre">Bienvenue</h1>
<p id="message">Texte d'origine</p>`, `const titre = document.getElementById("titre");
const message = document.getElementById("message");
titre.textContent = "Bonjour tout le monde";
message.innerHTML = "Ceci est <strong>important</strong>";
console.log(titre.textContent);
console.log(message.innerHTML);`),
    },
    codeExplanation: [
      { code: `titre.textContent = "Bonjour tout le monde";`, text: "Remplace le texte du titre : la page change tout de suite." },
      { code: `message.innerHTML = "... <strong>...";`, text: "Le HTML est interprété : le mot « important » est affiché en gras." },
      { code: `console.log(message.innerHTML);`, text: "Lire `innerHTML` redonne le HTML sous forme de texte, balises comprises." },
    ],
    concrete: {
      intro: "Afficher le résultat d’un calcul dans la page :",
      files: labFiles(`<p id="resultat">Total : ...</p>`, `const resultat = document.querySelector("#resultat");
const prix = 12;
const quantite = 3;
resultat.textContent = "Total : " + prix * quantite + " €";
console.log(resultat.textContent);`),
    },
    mistakes: [
      { title: "Des balises dans textContent",
        files: labFiles(`<p id="p">Salut</p>`, `const p = document.getElementById("p");
p.textContent = "Un mot <strong>important</strong>";`),
        text: "Avec `textContent`, les balises sont affichées comme du texte, pas interprétées. Pour du gras, utilise `innerHTML`." },
      { title: "Écraser les éléments enfants",
        files: labFiles(`<ul id="liste">
  <li>Un</li>
  <li>Deux</li>
</ul>`, `const liste = document.getElementById("liste");
liste.textContent = "Liste vide";
console.log(liste.children.length);`),
        text: "Écrire dans `textContent` remplace tout le contenu, y compris les `li`. La liste n’a plus aucun enfant." },
      { title: "Changer la variable au lieu de l’élément",
        files: labFiles(`<h1>Ancien titre</h1>`, `let titre = document.querySelector("h1");
titre = "Nouveau titre";
console.log(document.querySelector("h1").textContent);`),
        text: "Ranger un texte dans la variable `titre` ne touche pas à la page : la variable ne contient plus l’élément, c’est tout. Il faut modifier la propriété de l’élément : `titre.textContent = ...`." },
    ],
    summary: [
      "`element.textContent` lit ou remplace le texte (balises non interprétées).",
      "`element.innerHTML` lit ou remplace le HTML (balises interprétées).",
      "Écrire dans l’une de ces propriétés efface le contenu précédent.",
      "Pour du texte venu d’une personne, utilise `textContent`, jamais `innerHTML`.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "attributs",
    module: "n3",
    title: "Modifier les attributs",
    level: "Facile",
    minutes: 15,
    explanation: [
      "Un attribut est une information donnée à une balise : `id`, `class`, `src`, `href`, `alt`, `disabled`, `value`…",
      "Les méthodes générales :",
      { list: [
        "`element.getAttribute(\"href\")` : lit la valeur d’un attribut (ou `null` s’il n’existe pas).",
        "`element.setAttribute(\"href\", \"https://example.com\")` : crée ou modifie un attribut.",
        "`element.removeAttribute(\"disabled\")` : supprime l’attribut.",
        "`element.hasAttribute(\"hidden\")` : `true` ou `false`.",
      ] },
      "Beaucoup d’attributs sont aussi des propriétés, plus courtes à écrire : `lien.href`, `image.src`, `champ.value`, `champ.placeholder`, `bouton.disabled`, `element.id`. Les attributs booléens (`disabled`, `checked`, `hidden`) valent `true` ou `false`.",
      "Les attributs `data-*` se lisent avec `dataset` : `<li data-prix=\"5\">` donne `li.dataset.prix`, qui vaut `\"5\"` (du texte).",
      "Le mot `class` est réservé en JavaScript : la propriété s’appelle `className`, et on préfère `classList` (leçon suivante).",
    ],
    example: {
      files: labFiles(`<a id="lien" href="#">Mon lien</a>
<button id="bouton" disabled>Valider</button>
<input id="nom" type="text" placeholder="Ton nom">`, `const lien = document.getElementById("lien");
lien.setAttribute("href", "https://example.com");
lien.textContent = "Aller sur example.com";
console.log(lien.getAttribute("href"));

const bouton = document.getElementById("bouton");
console.log(bouton.disabled);
bouton.disabled = false;
console.log(bouton.hasAttribute("disabled"));

const champ = document.getElementById("nom");
champ.value = "Léa";
champ.placeholder = "Écris ici";
console.log(champ.value);`),
    },
    codeExplanation: [
      { code: `lien.setAttribute("href", "...")`, text: "Donne une nouvelle valeur à l’attribut `href` du lien." },
      { code: `bouton.disabled`, text: "Vaut `true` tant que l’attribut `disabled` est présent." },
      { code: `bouton.disabled = false;`, text: "Active le bouton : l’attribut est retiré." },
      { code: `champ.value = "Léa";`, text: "Remplit le champ de saisie. `value` contient aussi ce que la personne a tapé." },
    ],
    concrete: {
      intro: "Désactiver un bouton et changer son texte :",
      files: labFiles(`<button>Envoyer</button>`, `const bouton = document.querySelector("button");
console.log("Désactivé ?", bouton.disabled);
bouton.disabled = true;
bouton.textContent = "Envoi impossible";
console.log("Désactivé ?", bouton.disabled);`),
    },
    mistakes: [
      { title: "setAttribute(\"disabled\", false)",
        files: labFiles(`<button id="b" disabled>OK</button>`, `const b = document.getElementById("b");
b.setAttribute("disabled", false);
console.log(b.disabled);`),
        text: "Pour un attribut booléen, c’est sa présence qui compte, pas sa valeur : `disabled=\"false\"` désactive quand même le bouton. Écris `b.disabled = false;` ou `b.removeAttribute(\"disabled\");`." },
      { title: "Écrire element.class",
        files: labFiles(`<p id="p">Texte</p>`, `const p = document.getElementById("p");
p.class = "rouge";
console.log(p.className);`),
        text: "`class` n’est pas une propriété : le mot est réservé. Utilise `className`, ou mieux `classList`." },
      { title: "Un attribut qui n’existe pas",
        files: labFiles(`<a id="lien" href="#">Lien</a>`, `const lien = document.getElementById("lien");
console.log(lien.getAttribute("title"));
console.log(lien.title);`),
        text: "`getAttribute` renvoie `null` quand l’attribut est absent. La propriété `title`, elle, renvoie un texte vide." },
    ],
    summary: [
      "`getAttribute`, `setAttribute`, `removeAttribute`, `hasAttribute` lisent et modifient les attributs.",
      "Beaucoup d’attributs sont aussi des propriétés : `href`, `src`, `value`, `placeholder`, `disabled`, `id`.",
      "Attributs booléens : seule leur présence compte ; utilise `element.disabled = false`.",
      "`dataset` donne accès aux attributs `data-*`.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "classes-styles",
    module: "n3",
    title: "Modifier les classes et les styles",
    level: "Facile",
    minutes: 15,
    explanation: [
      "Pour changer l’apparence d’un élément, il y a deux outils : les classes et le style direct.",
      "`classList` gère les classes d’un élément, une par une :",
      { list: [
        "`element.classList.add(\"actif\")` : ajoute une classe.",
        "`element.classList.remove(\"actif\")` : la retire.",
        "`element.classList.toggle(\"actif\")` : l’ajoute si elle est absente, la retire si elle est présente.",
        "`element.classList.contains(\"actif\")` : `true` si l’élément a cette classe.",
      ] },
      "Le style direct : `element.style.color = \"crimson\";`. Les propriétés CSS à plusieurs mots s’écrivent en camelCase (`backgroundColor`, `fontSize`), et les valeurs sont des textes avec leur unité : `\"20px\"`, pas `20`.",
      "Bonne pratique : définis l’apparence dans le CSS, sous forme de classes, et utilise JavaScript seulement pour ajouter ou retirer ces classes. Garde `style` pour les valeurs qui se calculent (une largeur, une position…).",
      "`element.style` ne montre que les styles écrits directement sur l’élément, pas ceux qui viennent d’une feuille de style.",
    ],
    example: {
      files: labFiles(`<h1 id="titre">Mon titre</h1>
<p id="texte">Un paragraphe.</p>`, `const texte = document.getElementById("texte");
texte.classList.add("actif");
console.log(texte.classList.contains("actif"));
texte.classList.remove("actif");
console.log(texte.classList.contains("actif"));
texte.classList.toggle("actif");
console.log(texte.classList.contains("actif"));

const titre = document.getElementById("titre");
titre.style.color = "crimson";
titre.style.fontSize = "40px";
console.log(titre.style.color);`, { css: true, cssCode: `.actif {
  background: gold;
  font-weight: bold;
}` }),
    },
    codeExplanation: [
      { code: `texte.classList.add("actif");`, text: "Ajoute la classe `actif` : les règles CSS de `.actif` s’appliquent." },
      { code: `texte.classList.toggle("actif");`, text: "Elle était retirée : `toggle` la remet. Un deuxième `toggle` la retirerait." },
      { code: `titre.style.fontSize = "40px";`, text: "En camelCase, avec l’unité, entre guillemets." },
    ],
    concrete: {
      intro: "Un interrupteur de thème : on bascule une classe sur le `body`, et le CSS fait le reste.",
      files: labFiles(`<h1>Mon site</h1>
<p>Le thème change en une seule instruction.</p>`, `document.body.classList.toggle("sombre");
console.log(document.body.classList.contains("sombre"));`, { css: true, cssCode: `body {
  font-family: sans-serif;
}
.sombre {
  background: #222;
  color: #eee;
}` }),
    },
    mistakes: [
      { title: "Une valeur sans unité",
        files: labFiles(`<p id="p">Texte</p>`, `const p = document.getElementById("p");
p.style.fontSize = 30;
console.log("[" + p.style.fontSize + "]");`),
        text: "`30` sans unité n’est pas une valeur CSS valide : le navigateur l’ignore et la taille ne change pas. Il faut `\"30px\"`." },
      { title: "Un point dans le nom de la classe",
        files: labFiles(`<p id="p">Texte</p>`, `const p = document.getElementById("p");
p.classList.add(".actif");
console.log(p.className);`, { css: true, cssCode: `.actif { background: gold; }` }),
        text: "Le point sert dans les sélecteurs CSS, pas dans le nom de la classe. Ici, la classe ajoutée s’appelle littéralement `.actif`, et le CSS ne s’applique pas. Écris `add(\"actif\")`." },
      { title: "className écrase les autres classes",
        files: labFiles(`<p id="p" class="a b">Texte</p>`, `const p = document.getElementById("p");
p.className = "c";
console.log(p.className);`),
        text: "`className = ...` remplace toutes les classes. `classList.add(\"c\")` ajoute `c` sans toucher à `a` et `b`." },
    ],
    summary: [
      "`classList.add`, `remove`, `toggle`, `contains` gèrent les classes.",
      "`element.style.propriete = \"valeur\"` change un style : camelCase, valeur en texte avec unité.",
      "Mets l’apparence dans le CSS (classes), et utilise JavaScript pour les ajouter ou les retirer.",
      "`className` remplace toutes les classes ; `classList` en change une seule.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "parcourir",
    module: "n3",
    title: "Parcourir plusieurs éléments",
    level: "Moyen",
    minutes: 16,
    explanation: [
      "`querySelectorAll` renvoie une NodeList : une liste d’éléments, dans l’ordre de la page. On peut lire sa `length`, accéder à un élément par son index (`liste[0]`) et la parcourir.",
      { code: `const items = document.querySelectorAll("li");

items.forEach((item, index) => {
  item.classList.add("vu");
});

for (const item of items) {
  item.textContent = item.textContent.toUpperCase();
}` },
      "À chaque tour, `item` est l’élément courant : on peut lire son texte, changer son style, tester une condition…",
      "Une NodeList n’a pas `map` ni `filter`. Pour les utiliser, on la convertit en vrai tableau avec `Array.from(items)` ou `[...items]`.",
      "Les propriétés comme `children` renvoient des listes similaires, qu’on parcourt de la même façon.",
      "Cela prépare la suite : une même action appliquée à chaque élément d’une liste (changer chaque ligne, cocher chaque case…).",
    ],
    example: {
      files: labFiles(`<ul>
  <li>Pomme</li>
  <li>Banane</li>
  <li>Kiwi</li>
  <li>Fraise</li>
</ul>`, `const items = document.querySelectorAll("li");
console.log("Nombre :", items.length);

items.forEach((item, index) => {
  item.textContent = (index + 1) + ". " + item.textContent;
});

const textes = Array.from(items).map((item) => item.textContent);
console.log(textes);`),
    },
    codeExplanation: [
      { code: `items.forEach((item, index) => {`, text: "Le deuxième paramètre, `index`, vaut 0, 1, 2… à chaque tour." },
      { code: `(index + 1) + ". " + item.textContent`, text: "On numérote à partir de 1, puis on remet le texte d’origine à la suite." },
      { code: `Array.from(items).map(...)`, text: "La NodeList devient un tableau : on peut alors utiliser `map`." },
    ],
    concrete: {
      intro: "Mettre en évidence les produits de plus de 10 € : le prix est lu dans un attribut `data-prix`.",
      files: labFiles(`<ul>
  <li data-prix="5">Stylo</li>
  <li data-prix="14">Sac</li>
  <li data-prix="8">Cahier</li>
  <li data-prix="25">Calculatrice</li>
</ul>`, `const produits = document.querySelectorAll("li");
let nombreChers = 0;
for (const produit of produits) {
  if (Number(produit.dataset.prix) > 10) {
    produit.classList.add("cher");
    nombreChers++;
  }
}
console.log("Produits chers :", nombreChers);`, { css: true, cssCode: `.cher {
  color: crimson;
  font-weight: bold;
}` }),
    },
    mistakes: [
      { title: "Utiliser map sur une NodeList",
        files: labFiles(`<ul>
  <li>Un</li>
  <li>Deux</li>
</ul>`, `const items = document.querySelectorAll("li");
const textes = items.map((item) => item.textContent);`),
        text: "Une NodeList n’est pas un tableau : elle n’a pas `map`. Convertis-la : `Array.from(items).map(...)`." },
      { title: "Oublier de parcourir la liste",
        files: labFiles(`<ul>
  <li>Un</li>
  <li>Deux</li>
</ul>`, `document.querySelectorAll("li").textContent = "X";
console.log(document.querySelector("li").textContent);`),
        text: "On a écrit une propriété sur la liste elle-même, pas sur chaque `li` : rien ne change dans la page. Il faut une boucle (`forEach` ou `for...of`)." },
      { title: "L’erreur d’un tour dans la boucle",
        files: labFiles(`<ul>
  <li>Un</li>
  <li>Deux</li>
</ul>`, `const items = document.querySelectorAll("li");
for (let i = 0; i <= items.length; i++) {
  items[i].classList.add("vu");
}`),
        text: "Les index vont de 0 à `length - 1`. Avec `<=`, le dernier tour lit `items[2]`, qui vaut `undefined`. Utilise `i < items.length`." },
    ],
    summary: [
      "`querySelectorAll` renvoie une NodeList qu’on parcourt avec `forEach` ou `for...of`.",
      "`item` est l’élément courant ; le deuxième paramètre de `forEach` est l’index.",
      "`Array.from(liste)` donne un vrai tableau (avec `map`, `filter`…).",
      "Les index vont de 0 à `length - 1`.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "creer",
    module: "n3",
    title: "Créer et ajouter des éléments",
    level: "Moyen",
    minutes: 18,
    explanation: [
      "JavaScript peut fabriquer de nouveaux éléments. Cela se fait en trois temps : créer, configurer, ajouter à la page.",
      { code: `const li = document.createElement("li");   // 1. créer
li.textContent = "Kiwi";                    // 2. configurer
liste.append(li);                           // 3. ajouter` },
      "Un élément créé n’est pas dans la page tant qu’on ne l’a pas ajouté. Pour l’ajouter :",
      { list: [
        "`parent.append(element)` : à la fin du parent.",
        "`parent.prepend(element)` : au début du parent.",
        "`reference.before(element)` et `reference.after(element)` : juste avant ou après un élément.",
        "`parent.appendChild(element)` : l’ancienne version de `append`, qui n’accepte qu’un élément.",
      ] },
      "Un élément ne peut être qu’à un seul endroit : l’ajouter ailleurs le déplace. Pour en obtenir une copie, utilise `element.cloneNode(true)`.",
      "Pour fabriquer plusieurs éléments à partir d’un tableau, on écrit une boucle qui crée et ajoute un élément à chaque tour.",
      "On peut aussi écrire du HTML avec `innerHTML`, mais `createElement` est plus sûr et plus clair, car chaque étape est explicite.",
    ],
    example: {
      files: labFiles(`<ul id="liste">
  <li>Pomme</li>
</ul>`, `const liste = document.getElementById("liste");

const banane = document.createElement("li");
banane.textContent = "Banane";
banane.classList.add("nouveau");
liste.append(banane);

const kiwi = document.createElement("li");
kiwi.textContent = "Kiwi";
liste.prepend(kiwi);

console.log(liste.children.length);
console.log(liste.firstElementChild.textContent);`, { css: true, cssCode: `.nouveau {
  color: seagreen;
}` }),
    },
    codeExplanation: [
      { code: `document.createElement("li")`, text: "Crée un élément `li` tout neuf, vide, qui n’est pas encore dans la page." },
      { code: `banane.textContent = "Banane";`, text: "On lui donne son contenu, comme pour n’importe quel élément." },
      { code: `liste.append(banane);`, text: "Ajoute à la fin de la liste : c’est maintenant visible." },
      { code: `liste.prepend(kiwi);`, text: "Ajoute au début : le kiwi devient le premier élément." },
    ],
    concrete: {
      intro: "Remplir une liste à partir d’un tableau :",
      files: labFiles(`<ul id="liste"></ul>`, `const fruits = ["Pomme", "Banane", "Kiwi"];
const liste = document.getElementById("liste");

for (const fruit of fruits) {
  const li = document.createElement("li");
  li.textContent = fruit;
  liste.append(li);
}
console.log(liste.children.length);`),
    },
    mistakes: [
      { title: "Créer sans ajouter",
        files: labFiles(`<ul id="liste"></ul>`, `const liste = document.getElementById("liste");
const li = document.createElement("li");
li.textContent = "Kiwi";
console.log(liste.children.length);`),
        text: "L’élément existe en mémoire, mais il n’a jamais été ajouté à la page : la liste est toujours vide. Il manque `liste.append(li)`." },
      { title: "Ajouter deux fois le même élément",
        files: labFiles(`<ul id="liste"></ul>`, `const liste = document.getElementById("liste");
const li = document.createElement("li");
li.textContent = "Kiwi";
liste.append(li);
liste.append(li);
console.log(liste.children.length);`),
        text: "Un élément ne peut être qu’à un endroit : le deuxième `append` le déplace au lieu de le copier. Pour deux éléments, il faut en créer deux (ou utiliser `cloneNode(true)`)." },
      { title: "appendChild avec du texte",
        files: labFiles(`<ul id="liste"></ul>`, `const liste = document.getElementById("liste");
liste.appendChild("Banane");`),
        text: "`appendChild` n’accepte qu’un élément, pas du texte. Crée d’abord un `li` avec `createElement`, ou utilise `append`, qui accepte aussi du texte." },
    ],
    summary: [
      "Créer (`createElement`), configurer (`textContent`, `classList`…), puis ajouter (`append`, `prepend`, `before`, `after`).",
      "Un élément créé n’apparaît dans la page qu’une fois ajouté.",
      "Un élément n’existe qu’à un endroit : l’ajouter ailleurs le déplace.",
      "Pour une liste de données : une boucle qui crée et ajoute un élément par tour.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "supprimer",
    module: "n3",
    title: "Supprimer des éléments",
    level: "Moyen",
    minutes: 16,
    explanation: [
      "Pour retirer un élément de la page, on appelle `remove()` dessus : `element.remove();`. Il disparaît du DOM, donc de l’affichage.",
      { list: [
        "`parent.removeChild(enfant)` : l’ancienne version, qui s’appelle sur le parent.",
        "`parent.replaceChildren()` : vide complètement le parent. `parent.innerHTML = \"\"` fait la même chose.",
        "`ancien.replaceWith(nouveau)` : remplace un élément par un autre.",
      ] },
      "Pour supprimer plusieurs éléments : `querySelectorAll`, puis une boucle qui appelle `remove()` sur chacun.",
      "Après `remove()`, l’élément existe toujours en mémoire dans la variable : on peut le relire, voire le remettre dans la page avec `append`.",
      "Attention aux listes vides : `liste.firstElementChild` vaut `null` s’il n’y a plus d’enfant, et `null.remove()` provoque une erreur. Vérifie d’abord.",
      "Tu connais maintenant le cycle complet du DOM : sélectionner, lire, modifier, créer, ajouter, supprimer.",
    ],
    example: {
      files: labFiles(`<ul id="liste">
  <li>A</li>
  <li>B</li>
  <li>C</li>
  <li>D</li>
</ul>`, `const liste = document.getElementById("liste");
liste.firstElementChild.remove();

const dernier = liste.lastElementChild;
dernier.remove();

console.log(liste.children.length);
console.log(dernier.textContent);`),
    },
    codeExplanation: [
      { code: `liste.firstElementChild.remove();`, text: "Supprime le premier `li` (« A »)." },
      { code: `dernier.remove();`, text: "Supprime le dernier `li` (« D »). Il reste « B » et « C »." },
      { code: `dernier.textContent`, text: "La variable garde l’élément : il n’est plus dans la page, mais son texte est toujours lisible." },
    ],
    concrete: {
      intro: "Supprimer toutes les tâches terminées :",
      files: labFiles(`<ul>
  <li>Courses</li>
  <li class="termine">Ménage</li>
  <li>Devoirs</li>
  <li class="termine">Sport</li>
</ul>`, `const terminees = document.querySelectorAll("li.termine");
terminees.forEach((tache) => tache.remove());
console.log(document.querySelectorAll("li").length);`),
    },
    mistakes: [
      { title: "remove() sur un élément introuvable",
        files: labFiles(`<p>Texte</p>`, `const pub = document.querySelector(".pub");
pub.remove();`),
        text: "Aucun élément n’a la classe `pub` : `querySelector` renvoie `null`, et `null.remove()` provoque une erreur. Vérifie le sélecteur, ou teste `if (pub)` avant." },
      { title: "Supprimer en parcourant children",
        files: labFiles(`<ul id="liste">
  <li>A</li>
  <li>B</li>
  <li>C</li>
  <li>D</li>
</ul>`, `const liste = document.getElementById("liste");
for (const li of liste.children) {
  li.remove();
}
console.log(liste.children.length);`),
        text: "`children` est une liste « vivante » : elle se met à jour pendant la boucle, et chaque suppression décale les éléments suivants. Résultat : un sur deux est sauté. Utilise `querySelectorAll` (liste figée), ou `liste.replaceChildren()` pour tout vider." },
      { title: "removeChild sur le mauvais parent",
        files: labFiles(`<ul id="liste">
  <li id="un">Un</li>
</ul>`, `const un = document.getElementById("un");
document.body.removeChild(un);`),
        text: "`removeChild` doit être appelé sur le vrai parent de l’élément (ici le `ul`, pas le `body`). Plus simple : `un.remove()`." },
    ],
    summary: [
      "`element.remove()` retire un élément de la page.",
      "`parent.replaceChildren()` vide un parent ; `replaceWith` remplace un élément.",
      "Pour supprimer plusieurs éléments, parcours `querySelectorAll` (une liste figée).",
      "Vérifie que l’élément existe avant de le supprimer : `null.remove()` provoque une erreur.",
    ],
  },

  // ═════════════════ NIVEAU 4 : Les événements ═════════════════
  {
    id: "evenements",
    module: "n4",
    title: "Réagir à un événement : addEventListener",
    level: "Facile",
    minutes: 16,
    explanation: [
      "Jusqu’ici, ton code s’exécutait une seule fois, au chargement de la page. Mais une page interactive doit réagir : un clic, une touche, un texte saisi… Chacune de ces actions est un événement.",
      "Pour réagir à un événement, on l’écoute sur un élément avec `addEventListener` :",
      { code: `element.addEventListener("click", () => {
  // exécuté à chaque clic sur element
});` },
      "On lui donne deux choses : le type d’événement (`\"click\"`) et une fonction, appelée « gestionnaire » (ou callback), que le navigateur exécute chaque fois que l’événement se produit.",
      "Le code de la fonction ne s’exécute pas tout de suite : il s’exécute plus tard, à chaque événement. Pendant ce temps, le reste du script continue.",
      "On peut passer une fonction fléchée (comme ci-dessus), ou une fonction nommée. Dans ce cas, on écrit son nom sans parenthèses : `bouton.addEventListener(\"click\", saluer);`. Avec `saluer()`, on l’appellerait tout de suite, et on donnerait son résultat au lieu de la fonction.",
      "Les variables créées dans le gestionnaire disparaissent à la fin de chaque appel (c’est la portée, niveau 1). Pour garder une valeur d’un clic à l’autre (un compteur…), déclare la variable à l’extérieur.",
      "`element.removeEventListener(\"click\", saluer)` arrête d’écouter (avec une fonction nommée). L’option `{ once: true }` en troisième argument n’écoute qu’une seule fois.",
    ],
    example: {
      intro: "Exécute le code, puis clique plusieurs fois sur le bouton dans l’aperçu : la console et le texte se mettent à jour.",
      files: labFiles(`<button id="bouton">Clique-moi</button>
<p id="message">Aucun clic pour l'instant.</p>`, `const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
let nombreDeClics = 0;

bouton.addEventListener("click", () => {
  nombreDeClics++;
  message.textContent = "Clics : " + nombreDeClics;
  console.log("Clic numéro", nombreDeClics);
});`),
    },
    codeExplanation: [
      { code: `let nombreDeClics = 0;`, text: "Déclaré à l’extérieur du gestionnaire : la valeur est conservée d’un clic à l’autre." },
      { code: `bouton.addEventListener("click", () => {`, text: "On demande au navigateur d’exécuter cette fonction à chaque clic sur le bouton." },
      { code: `nombreDeClics++;`, text: "À chaque clic, le compteur augmente de 1." },
      { code: `message.textContent = ...`, text: "On met la page à jour, comme au niveau 3 : mais cette fois, c’est un clic qui déclenche le changement." },
    ],
    concrete: {
      intro: "Un bouton qui ne marche qu’une seule fois, grâce à `{ once: true }`. Clique deux fois pour voir la différence.",
      files: labFiles(`<button id="bouton">Dire merci</button>`, `const bouton = document.getElementById("bouton");

bouton.addEventListener("click", () => {
  bouton.textContent = "Merci !";
  console.log("Gestionnaire exécuté");
}, { once: true });`),
    },
    mistakes: [
      { title: "Appeler la fonction au lieu de la donner",
        files: labFiles(`<button id="bouton">Clique-moi</button>`, `function saluer() {
  console.log("Bonjour !");
}

const bouton = document.getElementById("bouton");
bouton.addEventListener("click", saluer());`),
        text: "`saluer()` est exécutée tout de suite, au chargement : « Bonjour ! » s’affiche sans clic. Et `addEventListener` reçoit `undefined` (le résultat de la fonction), donc les clics ne font rien. Il faut écrire `saluer`, sans parenthèses." },
      { title: "Un compteur déclaré dans le gestionnaire",
        files: labFiles(`<button id="bouton">Compter</button>`, `const bouton = document.getElementById("bouton");

bouton.addEventListener("click", () => {
  let compteur = 0;
  compteur++;
  console.log(compteur);
});`),
        text: "Clique plusieurs fois : la console affiche toujours 1. `compteur` est recréée à 0 à chaque clic. Déclare-la en dehors du gestionnaire." },
      { title: "Écouter un élément qui n’existe pas",
        files: labFiles(`<button id="bouton">Clique-moi</button>`, `const bouton = document.getElementById("btn");
bouton.addEventListener("click", () => {
  console.log("Clic");
});`),
        text: "Aucun élément n’a l’id `btn` : `getElementById` renvoie `null`, et `null.addEventListener` provoque une erreur. Vérifie l’id." },
    ],
    summary: [
      "Un événement est quelque chose qui se produit : clic, touche, saisie…",
      "`element.addEventListener(\"type\", fonction)` exécute la fonction à chaque événement.",
      "On passe la fonction elle-même (`saluer`), pas son appel (`saluer()`).",
      "Une valeur à conserver d’un événement à l’autre se déclare à l’extérieur du gestionnaire.",
      "`removeEventListener` et `{ once: true }` permettent d’arrêter d’écouter.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "souris",
    module: "n4",
    title: "Les événements de la souris",
    level: "Facile",
    minutes: 14,
    explanation: [
      "La souris déclenche beaucoup d’événements. Les plus utiles :",
      { list: [
        "`click` : un clic (il marche aussi au doigt et au clavier sur un bouton).",
        "`dblclick` : un double-clic.",
        "`mouseenter` et `mouseleave` : le pointeur entre sur l’élément, puis en sort.",
        "`mouseover` et `mouseout` : presque pareil, mais déclenchés aussi quand on passe d’un enfant de l’élément à un autre. `mouseenter` / `mouseleave` sont plus simples à utiliser.",
        "`mousemove` : le pointeur bouge au-dessus de l’élément (très fréquent !).",
        "`mousedown` et `mouseup` : le bouton est enfoncé, puis relâché.",
        "`contextmenu` : un clic droit.",
      ] },
      "Le gestionnaire reçoit un objet `event` : `element.addEventListener(\"click\", (event) => { ... })`. Pour la souris, il contient notamment `event.clientX` et `event.clientY` (la position du pointeur dans la fenêtre) et `event.button` (0 : bouton gauche, 1 : milieu, 2 : droit).",
      "Cas typique : le survol. `mouseenter` ajoute une classe, `mouseleave` la retire, et le CSS fait le reste.",
    ],
    example: {
      intro: "Exécute le code, puis survole la carte, bouge la souris dessus et double-clique.",
      files: labFiles(`<div id="carte">Survole-moi</div>
<p id="position">Position : -</p>`, `const carte = document.getElementById("carte");
const position = document.getElementById("position");

carte.addEventListener("mouseenter", () => {
  carte.classList.add("survol");
});
carte.addEventListener("mouseleave", () => {
  carte.classList.remove("survol");
});
carte.addEventListener("mousemove", (event) => {
  position.textContent = "Position : " + event.clientX + ", " + event.clientY;
});
carte.addEventListener("dblclick", () => {
  console.log("Double-clic !");
});`, { cssCode: `#carte {
  padding: 24px;
  border: 2px solid #999;
  border-radius: 8px;
}
#carte.survol {
  background: gold;
  border-color: orange;
}` }),
    },
    codeExplanation: [
      { code: `carte.addEventListener("mouseenter", ...)`, text: "Déclenché quand le pointeur entre sur la carte : on ajoute la classe `survol`." },
      { code: `carte.addEventListener("mouseleave", ...)`, text: "Déclenché quand il sort : on retire la classe. Le CSS fait le changement visuel." },
      { code: `(event) => { ... event.clientX ... }`, text: "Le navigateur passe l’objet `event` au gestionnaire : on lit la position du pointeur." },
    ],
    concrete: {
      intro: "Quel bouton de la souris a été utilisé ? Clique dans la zone avec le bouton gauche, puis avec le droit.",
      files: labFiles(`<div id="zone">Clique ici (gauche ou droit)</div>`, `const zone = document.getElementById("zone");

zone.addEventListener("mousedown", (event) => {
  console.log("Bouton :", event.button);
});`, { cssCode: `#zone {
  padding: 30px;
  background: #eef;
  text-align: center;
}` }),
    },
    mistakes: [
      { title: "Écrire « onclick » comme type d’événement",
        files: labFiles(`<button id="bouton">Clique-moi</button>`, `const bouton = document.getElementById("bouton");
bouton.addEventListener("onclick", () => {
  console.log("Clic !");
});`),
        text: "Le type s’écrit sans « on » : `\"click\"`. Avec `\"onclick\"`, l’événement n’existe pas : le gestionnaire n’est jamais appelé, et aucune erreur n’apparaît. Clique sur le bouton pour t’en convaincre." },
      { title: "Utiliser event en dehors du gestionnaire",
        files: labFiles(`<button id="bouton">Clique-moi</button>`, `const bouton = document.getElementById("bouton");
console.log(event.clientX);
bouton.addEventListener("click", () => {
  console.log("Clic");
});`),
        text: "`event` n’existe que dans le gestionnaire, pendant l’événement. Ailleurs, la variable n’est pas définie." },
      { title: "mouseover se déclenche plusieurs fois",
        files: labFiles(`<div id="boite"><p>Un paragraphe</p><p>Un autre paragraphe</p></div>`, `const boite = document.getElementById("boite");
boite.addEventListener("mouseover", () => {
  console.log("mouseover");
});
boite.addEventListener("mouseenter", () => {
  console.log("mouseenter");
});`, { cssCode: `#boite { padding: 20px; background: #eef; }` }),
        text: "Passe la souris sur la boîte, puis d’un paragraphe à l’autre : `mouseover` s’affiche à chaque changement d’enfant, alors que `mouseenter` ne s’affiche qu’une seule fois, quand on entre dans la boîte." },
    ],
    summary: [
      "`click`, `dblclick`, `mouseenter`, `mouseleave`, `mousemove`, `mousedown`, `mouseup`, `contextmenu`.",
      "Le type d’événement s’écrit sans « on » : `\"click\"`.",
      "`event.clientX`, `event.clientY` : la position du pointeur ; `event.button` : le bouton utilisé.",
      "Pour le survol, `mouseenter` / `mouseleave` sont plus simples que `mouseover` / `mouseout`.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "clavier",
    module: "n4",
    title: "Les événements du clavier",
    level: "Facile",
    minutes: 14,
    explanation: [
      "Deux événements principaux pour le clavier : `keydown` (une touche est enfoncée, répété tant qu’on la maintient) et `keyup` (elle est relâchée). L’ancien `keypress` est obsolète : on ne l’utilise plus.",
      "Où écouter ? Sur un champ de saisie (`champ.addEventListener(\"keydown\", ...)`) pour réagir à ce qu’on y tape, ou sur `document` pour des raccourcis valables partout dans la page. Un élément doit pouvoir recevoir le focus (champ, bouton…) pour recevoir les touches directement.",
      "Dans l’objet `event` :",
      { list: [
        "`event.key` : la touche, comme un texte : `\"a\"`, `\"A\"`, `\"Enter\"`, `\"Escape\"`, `\"ArrowUp\"`, `\" \"` (espace), `\"Backspace\"`…",
        "`event.code` : la touche physique (`\"KeyA\"`, `\"Space\"`), indépendante de la disposition AZERTY ou QWERTY.",
        "`event.shiftKey`, `event.ctrlKey`, `event.altKey` : `true` si Maj, Ctrl ou Alt sont enfoncées en même temps.",
        "`event.repeat` : `true` si la touche est maintenue.",
      ] },
      "Attention à la casse : `event.key` vaut `\"Enter\"`, pas `\"enter\"`. On compare avec `===`.",
    ],
    example: {
      intro: "Exécute, clique dans le champ de l’aperçu, tape quelques touches, puis appuie sur Entrée.",
      files: labFiles(`<input id="champ" type="text" placeholder="Tape ici">
<p id="touche">Touche : -</p>`, `const champ = document.getElementById("champ");
const affichage = document.getElementById("touche");

champ.addEventListener("keydown", (event) => {
  affichage.textContent = "Touche : " + event.key;
  if (event.key === "Enter") {
    console.log("Tu as validé : " + champ.value);
  }
});`),
    },
    codeExplanation: [
      { code: `champ.addEventListener("keydown", ...)`, text: "On écoute les touches enfoncées dans le champ." },
      { code: `event.key`, text: "La touche pressée, comme un texte. Pour Entrée : `\"Enter\"`." },
      { code: `if (event.key === "Enter")`, text: "On ne réagit que pour cette touche : les autres sont ignorées." },
    ],
    concrete: {
      intro: "Déplacer un carré avec les flèches. Clique d’abord dans l’aperçu pour lui donner le focus, puis utilise les flèches gauche et droite.",
      files: labFiles(`<div id="carre"></div>`, `const carre = document.getElementById("carre");
let x = 20;

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    x += 10;
  }
  if (event.key === "ArrowLeft") {
    x -= 10;
  }
  carre.style.left = x + "px";
});`, { cssCode: `body { position: relative; height: 120px; }
#carre {
  position: absolute;
  top: 30px;
  left: 20px;
  width: 40px;
  height: 40px;
  background: tomato;
}` }),
    },
    mistakes: [
      { title: "Comparer avec « enter » en minuscules",
        files: labFiles(`<input id="champ" type="text" placeholder="Tape puis Entrée">`, `const champ = document.getElementById("champ");
champ.addEventListener("keydown", (event) => {
  if (event.key === "enter") {
    console.log("Validé");
  }
});`),
        text: "`event.key` vaut `\"Enter\"` avec une majuscule. Avec `\"enter\"`, la condition n’est jamais vraie : appuie sur Entrée, rien ne s’affiche." },
      { title: "Écouter les touches sur un élément sans focus",
        files: labFiles(`<div id="boite">Une boîte</div>`, `const boite = document.getElementById("boite");
boite.addEventListener("keydown", (event) => {
  console.log("Touche :", event.key);
});`, { cssCode: `#boite { padding: 20px; background: #eef; }` }),
        text: "Une simple `div` ne peut pas recevoir le focus : elle ne reçoit jamais les touches. Écoute sur `document`, ou sur un champ. (On peut aussi ajouter `tabindex=\"0\"` à la `div`.)" },
      { title: "La touche espace",
        files: labFiles(`<input id="champ" type="text" placeholder="Appuie sur Espace">`, `const champ = document.getElementById("champ");
champ.addEventListener("keydown", (event) => {
  console.log("[" + event.key + "]", event.code);
});`),
        text: "Pour la barre d’espace, `event.key` vaut `\" \"` (une espace), et `event.code` vaut `\"Space\"`. Pour viser une touche physique quelle que soit la langue du clavier, `event.code` est plus fiable." },
    ],
    summary: [
      "`keydown` : touche enfoncée ; `keyup` : touche relâchée.",
      "`event.key` donne la touche (`\"Enter\"`, `\"Escape\"`, `\"a\"`…) ; `event.code`, la touche physique.",
      "`shiftKey`, `ctrlKey`, `altKey` : touches de modification enfoncées.",
      "Écoute sur un champ, ou sur `document` pour des raccourcis globaux.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "saisie",
    module: "n4",
    title: "Champs de saisie : input et change",
    level: "Moyen",
    minutes: 16,
    explanation: [
      "Pour suivre ce que la personne écrit ou choisit, deux événements :",
      { list: [
        "`input` : déclenché à chaque modification du contenu (chaque lettre tapée, collée ou supprimée). Idéal pour un aperçu en direct.",
        "`change` : déclenché quand la valeur est validée. Pour un champ de texte, c’est quand on quitte le champ après l’avoir modifié. Pour une case à cocher, un bouton radio ou une liste déroulante, c’est tout de suite.",
      ] },
      "Pour lire la valeur : `champ.value`, ou `event.target.value` (l’élément qui a déclenché l’événement).",
      "Pour une case à cocher, on lit `case.checked`, qui vaut `true` ou `false`. Pour une liste déroulante (`select`), `liste.value` est la valeur de l’option choisie.",
      "`value` est toujours du texte, même pour un champ de nombre : on convertit avec `Number(champ.value)`.",
      "Pense à `champ.value.trim()` pour retirer les espaces autour, et à tester la valeur vide : `if (champ.value === \"\")`.",
      "Lis la valeur à l’intérieur du gestionnaire : si tu la lis en dehors, tu obtiens la valeur du moment où le script s’est exécuté, qui ne change plus.",
    ],
    example: {
      intro: "Exécute, tape dans le champ, coche la case et choisis une option dans l’aperçu.",
      files: labFiles(`<input id="nom" type="text" placeholder="Ton prénom">
<p id="apercu">Bonjour !</p>
<label><input id="cgu" type="checkbox"> J'accepte les conditions</label>
<select id="choix">
  <option value="pomme">Pomme</option>
  <option value="kiwi">Kiwi</option>
</select>`, `const champ = document.getElementById("nom");
const apercu = document.getElementById("apercu");
const cgu = document.getElementById("cgu");
const choix = document.getElementById("choix");

champ.addEventListener("input", () => {
  apercu.textContent = "Bonjour " + champ.value + " !";
});
cgu.addEventListener("change", () => {
  console.log("Accepté ?", cgu.checked);
});
choix.addEventListener("change", () => {
  console.log("Choix :", choix.value);
});`),
    },
    codeExplanation: [
      { code: `champ.addEventListener("input", ...)`, text: "À chaque lettre tapée, l’aperçu est mis à jour : on voit le résultat en direct." },
      { code: `cgu.checked`, text: "`true` si la case est cochée, `false` sinon." },
      { code: `choix.value`, text: "La valeur de l’option sélectionnée dans la liste." },
    ],
    concrete: {
      intro: "Un compteur de caractères avec une limite de 20. Tape plus de 20 caractères pour voir le texte changer.",
      files: labFiles(`<input id="message" type="text" placeholder="Écris un message">
<p id="reste">Il reste 20 caractères.</p>`, `const champ = document.getElementById("message");
const reste = document.getElementById("reste");
const limite = 20;

champ.addEventListener("input", () => {
  const caracteresRestants = limite - champ.value.length;
  reste.textContent = "Il reste " + caracteresRestants + " caractères.";
  reste.classList.toggle("depasse", caracteresRestants < 0);
});`, { cssCode: `.depasse {
  color: crimson;
  font-weight: bold;
}` }),
    },
    mistakes: [
      { title: "Lire la valeur en dehors du gestionnaire",
        files: labFiles(`<input id="champ" type="text" placeholder="Tape puis clique sur Valider">
<button id="bouton">Valider</button>`, `const champ = document.getElementById("champ");
const bouton = document.getElementById("bouton");
const texte = champ.value;

bouton.addEventListener("click", () => {
  console.log("Texte :", "[" + texte + "]");
});`),
        text: "`texte` a été lue au chargement, quand le champ était vide, et ne change plus. Tape quelque chose puis clique : toujours vide. Il faut lire `champ.value` dans le gestionnaire." },
      { title: "Oublier que value est du texte",
        files: labFiles(`<input id="nombre" type="number" value="5">
<button id="bouton">+ 1</button>`, `const champ = document.getElementById("nombre");
const bouton = document.getElementById("bouton");

bouton.addEventListener("click", () => {
  console.log(champ.value + 1);
  console.log(Number(champ.value) + 1);
});`),
        text: "`champ.value + 1` colle les textes : `\"5\"` + 1 donne `\"51\"`. Avec `Number(champ.value) + 1`, on additionne bien les nombres. Clique sur le bouton pour comparer." },
      { title: "change pour un aperçu en direct",
        files: labFiles(`<input id="champ" type="text" placeholder="Tape quelques lettres">
<p id="apercu"></p>`, `const champ = document.getElementById("champ");
const apercu = document.getElementById("apercu");

champ.addEventListener("change", () => {
  apercu.textContent = champ.value;
});`),
        text: "Avec `change`, l’aperçu ne se met à jour que lorsque tu quittes le champ (clic ailleurs, Entrée). Pour suivre chaque lettre, utilise `input`." },
    ],
    summary: [
      "`input` : à chaque modification ; `change` : quand la valeur est validée.",
      "`champ.value` (texte), `case.checked` (booléen), `liste.value` (option choisie).",
      "`value` est toujours du texte : `Number(champ.value)` pour calculer.",
      "Lis la valeur dans le gestionnaire, pas en dehors.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "objet-event",
    module: "n4",
    title: "L’objet event : target et propagation",
    level: "Moyen",
    minutes: 18,
    explanation: [
      "Chaque gestionnaire reçoit en paramètre un objet `event` qui décrit ce qui vient de se passer. Tu en as déjà lu des morceaux (`event.key`, `event.clientX`). Les propriétés communes à tous les événements :",
      { list: [
        "`event.type` : le type d’événement (`\"click\"`, `\"keydown\"`…).",
        "`event.target` : l’élément sur lequel l’événement s’est produit (celui qui a vraiment été cliqué).",
        "`event.currentTarget` : l’élément sur lequel l’écouteur est posé.",
        "`event.preventDefault()` : annule le comportement par défaut du navigateur.",
        "`event.stopPropagation()` : empêche l’événement de remonter vers les parents.",
      ] },
      "La propagation : un événement ne reste pas sur l’élément touché, il remonte vers ses parents (le `li`, puis le `ul`, puis le `body`, puis `document`). Les écouteurs de tous ces éléments se déclenchent, du plus profond au plus haut.",
      "Cela permet la délégation d’événements : au lieu de poser un écouteur sur chaque `li`, on en pose un seul sur le `ul`, puis on regarde `event.target` pour savoir quel `li` a été cliqué. C’est plus économique, et cela marche aussi pour les éléments ajoutés plus tard (niveau 3 : `createElement`).",
      "Pour tester la cible, `event.target.matches(\"li\")` répond `true` si l’élément correspond au sélecteur. Si la cible peut contenir des éléments (un `li` avec un `span`), `event.target.closest(\"li\")` remonte jusqu’au `li` le plus proche.",
    ],
    example: {
      intro: "Exécute, puis clique sur un élément de la liste, puis sur l’espace autour : compare `target` et `currentTarget`.",
      files: labFiles(`<ul id="liste">
  <li>Pomme</li>
  <li>Banane</li>
  <li>Kiwi</li>
</ul>
<p id="info">Aucun choix.</p>`, `const liste = document.getElementById("liste");
const info = document.getElementById("info");

liste.addEventListener("click", (event) => {
  console.log("type :", event.type);
  console.log("cible :", event.target.tagName);
  console.log("écouteur posé sur :", event.currentTarget.id);
  if (event.target.tagName === "LI") {
    info.textContent = "Tu as choisi : " + event.target.textContent;
  }
});`, { cssCode: `#liste { background: #eef; padding: 10px 10px 10px 30px; }` }),
    },
    codeExplanation: [
      { code: `liste.addEventListener("click", ...)`, text: "Un seul écouteur, posé sur le `ul`. Il reçoit aussi les clics faits sur les `li` (propagation)." },
      { code: `event.target`, text: "L’élément réellement cliqué : un `li`, ou le `ul` si on clique entre deux lignes." },
      { code: `event.currentTarget`, text: "Toujours le `ul`, puisque c’est lui qui porte l’écouteur." },
      { code: `if (event.target.tagName === "LI")`, text: "On vérifie que la cible est bien un `li` avant de s’en servir." },
    ],
    concrete: {
      intro: "La délégation avec des éléments ajoutés plus tard : clique sur « Ajouter », puis coche les tâches, y compris les nouvelles.",
      files: labFiles(`<button id="ajouter">Ajouter une tâche</button>
<ul id="liste">
  <li>Tâche 1</li>
  <li>Tâche 2</li>
</ul>`, `const liste = document.getElementById("liste");
const ajouter = document.getElementById("ajouter");
let numero = 3;

ajouter.addEventListener("click", () => {
  const li = document.createElement("li");
  li.textContent = "Tâche " + numero;
  liste.append(li);
  numero++;
});

liste.addEventListener("click", (event) => {
  if (event.target.matches("li")) {
    event.target.classList.toggle("fait");
  }
});`, { cssCode: `li { cursor: pointer; }
.fait {
  text-decoration: line-through;
  color: gray;
}` }),
    },
    mistakes: [
      { title: "Confondre target et currentTarget",
        files: labFiles(`<div id="parent"><button id="enfant">Clique-moi</button></div>`, `const parent = document.getElementById("parent");
parent.addEventListener("click", (event) => {
  console.log("target :", event.target.id);
  console.log("currentTarget :", event.currentTarget.id);
});`, { cssCode: `#parent { padding: 20px; background: #eef; }` }),
        text: "Clique sur le bouton : `target` est le bouton (l’élément cliqué), `currentTarget` est le `div` (l’élément qui écoute). Ils ne désignent pas la même chose." },
      { title: "Oublier que l’événement remonte",
        files: labFiles(`<div id="parent"><button id="enfant">Clique-moi</button></div>`, `const parent = document.getElementById("parent");
const enfant = document.getElementById("enfant");

parent.addEventListener("click", () => {
  console.log("parent");
});
enfant.addEventListener("click", () => {
  console.log("enfant");
});`, { cssCode: `#parent { padding: 20px; background: #eef; }` }),
        text: "Un clic sur le bouton affiche « enfant », puis « parent » : l’événement remonte. Pour l’arrêter à l’enfant, ajoute `event.stopPropagation()` dans son gestionnaire." },
      { title: "Utiliser target sans vérifier ce que c’est",
        files: labFiles(`<ul id="liste">
  <li>Pomme</li>
  <li>Banane</li>
</ul>`, `const liste = document.getElementById("liste");
liste.addEventListener("click", (event) => {
  event.target.classList.toggle("fait");
});`, { cssCode: `#liste { background: #eef; padding: 10px 10px 10px 30px; }
.fait { background: gold; }` }),
        text: "Clique sur la zone bleue, entre ou autour des lignes : c’est le `ul` lui-même qui reçoit la classe `fait`. Il faut tester la cible : `if (event.target.matches(\"li\")) { ... }`." },
    ],
    summary: [
      "`event` décrit l’événement : `type`, `target`, `currentTarget`, et des détails propres à chaque type.",
      "`target` est l’élément touché ; `currentTarget` celui qui porte l’écouteur.",
      "Un événement remonte vers les parents : `stopPropagation()` arrête cette remontée.",
      "La délégation : un écouteur sur le parent, et `event.target.matches(\"...\")` pour trier.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "formulaires",
    module: "n4",
    title: "Formulaires : submit et preventDefault",
    level: "Moyen",
    minutes: 18,
    explanation: [
      "Quand on valide un formulaire (clic sur le bouton d’envoi ou touche Entrée dans un champ), le navigateur envoie les données et recharge la page. C’est son comportement par défaut.",
      "Pour traiter les données avec JavaScript, on écoute l’événement `submit` du formulaire, et on annule l’envoi avec `event.preventDefault()` :",
      { code: `formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  // traiter les données ici
});` },
      "Pourquoi `submit` sur le formulaire, et pas `click` sur le bouton ? Parce que `submit` se déclenche aussi quand on valide avec la touche Entrée, et que la validation HTML (`required`, `type=\"email\"`…) a lieu avant lui.",
      "`preventDefault()` s’applique à plein d’autres événements : le clic sur un lien (`<a>`) qui changerait de page, le clic droit (`contextmenu`)… Mets-le au tout début du gestionnaire : si une erreur survient avant, le comportement par défaut aurait lieu quand même.",
      "Pour valider une saisie : lis la valeur, nettoie-la avec `trim()`, vérifie-la, et affiche un message clair si elle est incorrecte. `formulaire.reset()` vide le formulaire.",
      "Dans l’atelier du site, un formulaire envoyé ou un lien suivi sans `preventDefault()` est bloqué, et la console te prévient : dans un vrai navigateur, la page se rechargerait.",
    ],
    example: {
      intro: "Exécute, tape un nom puis appuie sur Entrée (ou clique sur Envoyer). Essaie aussi avec un champ vide.",
      files: labFiles(`<form id="inscription">
  <input id="nom" type="text" placeholder="Ton nom">
  <button type="submit">Envoyer</button>
</form>
<p id="message"></p>`, `const formulaire = document.getElementById("inscription");
const champ = document.getElementById("nom");
const message = document.getElementById("message");

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  const nom = champ.value.trim();
  if (nom === "") {
    message.textContent = "Écris ton nom.";
    return;
  }
  message.textContent = "Bienvenue, " + nom + " !";
  formulaire.reset();
});`),
    },
    codeExplanation: [
      { code: `formulaire.addEventListener("submit", ...)`, text: "Écoute la validation du formulaire, quelle qu’en soit la cause : bouton ou touche Entrée." },
      { code: `event.preventDefault();`, text: "Annule l’envoi et le rechargement de la page : on garde la main." },
      { code: `champ.value.trim()`, text: "Retire les espaces autour : un champ rempli d’espaces compte comme vide." },
      { code: `return;`, text: "Quitte le gestionnaire : la suite (message de bienvenue) n’est pas exécutée en cas d’erreur." },
    ],
    concrete: {
      intro: "Intercepter un lien : on décide nous-mêmes ce qui se passe au clic. Clique sur le lien dans l’aperçu.",
      files: labFiles(`<a id="lien" href="https://example.com">Aller sur example.com</a>`, `const lien = document.getElementById("lien");

lien.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("Lien intercepté :", lien.getAttribute("href"));
});`),
    },
    mistakes: [
      { title: "Oublier preventDefault",
        files: labFiles(`<form id="formulaire">
  <input type="text" placeholder="Ton nom">
  <button type="submit">Envoyer</button>
</form>`, `const formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", () => {
  console.log("Formulaire reçu");
});`),
        text: "Clique sur Envoyer : le message s’affiche, mais le formulaire est aussi envoyé. Dans un vrai navigateur, la page se rechargerait et tu perdrais tout. Ajoute `event.preventDefault()`." },
      { title: "Écouter le click du bouton plutôt que submit",
        files: labFiles(`<form id="formulaire">
  <input id="champ" type="text" placeholder="Tape puis appuie sur Entrée">
  <button id="envoyer" type="submit">Envoyer</button>
</form>`, `const bouton = document.getElementById("envoyer");
bouton.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("Formulaire traité");
});`),
        text: "Clique sur Envoyer : ça marche. Mais tape dans le champ et appuie sur Entrée : l’événement `click` n’a pas lieu, donc le formulaire est envoyé tel quel. `submit` couvre les deux cas." },
      { title: "preventDefault trop tard",
        files: labFiles(`<form id="formulaire">
  <button type="submit">Envoyer</button>
</form>`, `const formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", (event) => {
  console.log(variableInconnue);
  event.preventDefault();
});`),
        text: "La ligne 4 provoque une erreur : le gestionnaire s’arrête avant `preventDefault()`, et le formulaire est envoyé quand même. Mets `event.preventDefault()` en première ligne." },
    ],
    summary: [
      "Un formulaire envoyé recharge la page : c’est le comportement par défaut.",
      "On écoute `submit` sur le formulaire (pas `click` sur le bouton) et on appelle `event.preventDefault()`.",
      "`preventDefault()` en première ligne du gestionnaire.",
      "Valide la saisie : `trim()`, test de la valeur vide, message clair ; `reset()` vide le formulaire.",
      "`preventDefault()` empêche aussi un lien de changer de page.",
    ],
  },

];

// ─── Petites fonctions pour retrouver des cours ───
function getLesson(id) {
  return LESSONS.find((lesson) => lesson.id === id);
}

function lessonsOf(moduleId) {
  return LESSONS.filter((lesson) => lesson.module === moduleId);
}

function getModule(id) {
  return MODULES.find((module) => module.id === id);
}
