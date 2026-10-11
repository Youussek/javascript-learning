// projects.js — les projets guidés (données).
//
// Un projet = une page prête (HTML + CSS non modifiables) + un fichier script.js à écrire,
// découpé en étapes. Chaque étape a ses vérifications (tests, actions simulées…), comme les exercices
// de type « lab » (voir exercises.js). La correction finale n'est visible qu'une fois le projet terminé,
// ou après 3 vérifications ratées.

function projectFiles(body, css, script) {
  return labFiles(body, script, { cssCode: css, lockHtml: true, lockCss: true });
}

const PROJECTS = [
  // ─────────────────────────────────────────────────────────────
  {
    id: "compteur", title: "Compteur", difficulty: 1, available: true, previewHeight: 190,
    goal: "Un compteur avec un bouton + et un bouton −, une remise à zéro, et un nombre qui devient vert quand il est positif.",
    skills: "sélectionner des éléments, addEventListener, variable à l’extérieur du gestionnaire, classList",
    files: projectFiles(`<h1>Compteur</h1>
<div class="compteur">
  <button id="moins" aria-label="Moins">−</button>
  <span id="valeur">0</span>
  <button id="plus" aria-label="Plus">+</button>
</div>
<button id="reset">Remise à zéro</button>`, `body { font-family: sans-serif; text-align: center; padding: 8px; }
.compteur { display: flex; gap: 16px; justify-content: center; align-items: center; margin: 12px 0; }
.compteur button { font-size: 1.4rem; width: 44px; height: 44px; cursor: pointer; }
#valeur { font-size: 2.4rem; min-width: 60px; }
#valeur.positif { color: seagreen; }`, `// Projet 1 : le compteur
// Suis les étapes dans l'ordre, sous l'éditeur.
`),
    steps: [
      {
        title: "Préparer les éléments et la variable",
        instruction: [
          "Sélectionne les quatre éléments de la page et range-les dans des constantes :",
          { list: ["`plus` : le bouton `#plus`", "`moins` : le bouton `#moins`", "`reinitialiser` : le bouton `#reset`", "`affichage` : le nombre `#valeur`"] },
          "Crée aussi une variable `compteur` qui vaut 0 (avec `let`, puisqu’elle va changer).",
        ],
        hints: [
          "Quatre fois la même méthode de `document`, avec l’id de chaque élément.",
          "`const plus = document.getElementById(\"plus\");` : à faire pour chacun. Attention : l’id du bouton de remise à zéro est `reset`.",
          "N’oublie pas `let compteur = 0;`.",
        ],
        tests: [
          { expr: "plus.id", expect: "plus", label: "`plus` doit être le bouton `#plus`" },
          { expr: "moins.id", expect: "moins", label: "`moins` doit être le bouton `#moins`" },
          { expr: "reinitialiser.id", expect: "reset", label: "`reinitialiser` doit être le bouton `#reset`" },
          { expr: "affichage.id", expect: "valeur", label: "`affichage` doit être l’élément `#valeur`" },
          { expr: "compteur", expect: 0, label: "`compteur` doit valoir 0 au départ" },
        ],
      },
      {
        title: "Le bouton +",
        instruction: ["Au clic sur `plus`, augmente `compteur` de 1 et affiche sa nouvelle valeur dans `affichage`."],
        hints: [
          "Écoute le clic sur `plus`. La variable `compteur` doit être déclarée en dehors du gestionnaire.",
          "Dans le gestionnaire : `compteur++;` puis `affichage.textContent = compteur;`.",
          "`plus.addEventListener(\"click\", () => { compteur++; affichage.textContent = compteur; });`",
        ],
        actions: [{ do: "click", target: "#plus", times: 2 }],
        tests: [
          { expr: "affichage.textContent", expect: "2", label: "Après 2 clics sur +, le nombre affiché doit être 2" },
          { expr: "compteur", expect: 2, label: "`compteur` doit valoir 2" },
        ],
      },
      {
        title: "Le bouton −, sans descendre sous 0",
        instruction: ["Au clic sur `moins`, retire 1 à `compteur` et affiche-le. Mais le compteur ne doit jamais devenir négatif : à 0, le bouton − ne fait rien."],
        hints: [
          "C’est le même principe que pour `plus`, avec une condition en plus.",
          "Ne retire 1 que si `compteur > 0`.",
          "`if (compteur > 0) { compteur--; }` puis mets à jour l’affichage (en dehors du `if`, ou dedans).",
        ],
        actions: [
          { do: "click", target: "#plus", times: 2 },
          { do: "click", target: "#moins" },
          { do: "click", target: "#moins", times: 2 },
        ],
        tests: [
          { expr: "affichage.textContent", expect: "1", afterAction: 1, label: "2 clics sur + puis 1 sur − : l’affichage doit être 1" },
          { expr: "affichage.textContent", expect: "0", label: "Deux clics de plus sur − : l’affichage doit s’arrêter à 0" },
          { expr: "compteur", expect: 0, label: "`compteur` ne doit pas être négatif" },
        ],
      },
      {
        title: "La remise à zéro",
        instruction: ["Au clic sur `reinitialiser`, remets `compteur` à 0 et mets l’affichage à jour."],
        hints: [
          "Un troisième écouteur, sur `reinitialiser`.",
          "Il faut modifier la variable ET l’affichage.",
          "`compteur = 0;` puis `affichage.textContent = compteur;`",
        ],
        actions: [{ do: "click", target: "#plus", times: 3 }, { do: "click", target: "#reset" }],
        tests: [
          { expr: "affichage.textContent", expect: "3", afterAction: 0, label: "Après 3 clics sur +, l’affichage doit être 3" },
          { expr: "affichage.textContent", expect: "0", label: "Après la remise à zéro, l’affichage doit être 0" },
        ],
      },
      {
        title: "Un nombre vert quand il est positif",
        instruction: [
          "Ajoute la classe `positif` à `affichage` quand `compteur` est supérieur à 0, et retire-la sinon (le CSS la colore en vert).",
          "Astuce de structure : crée une fonction `mettreAJour()` qui fait tout (afficher + gérer la classe) et appelle-la depuis les trois gestionnaires.",
        ],
        hints: [
          "Il faut tester `compteur > 0` à chaque mise à jour, pas seulement dans un bouton.",
          "`if (compteur > 0) { affichage.classList.add(\"positif\"); } else { affichage.classList.remove(\"positif\"); }`",
          "Mets ce code dans une fonction `mettreAJour()` appelée après chaque changement de `compteur`.",
        ],
        actions: [{ do: "click", target: "#plus" }, { do: "click", target: "#reset" }],
        tests: [
          { expr: `document.getElementById("valeur").classList.contains("positif")`, expect: true, afterAction: 0, label: "Après un clic sur +, le nombre doit avoir la classe `positif`" },
          { expr: `document.getElementById("valeur").classList.contains("positif")`, expect: false, label: "Après la remise à zéro, la classe `positif` doit être retirée" },
        ],
      },
    ],
    solution: [{ name: "script.js", code: `const plus = document.getElementById("plus");
const moins = document.getElementById("moins");
const reinitialiser = document.getElementById("reset");
const affichage = document.getElementById("valeur");
let compteur = 0;

function mettreAJour() {
  affichage.textContent = compteur;
  if (compteur > 0) {
    affichage.classList.add("positif");
  } else {
    affichage.classList.remove("positif");
  }
}

plus.addEventListener("click", () => {
  compteur++;
  mettreAJour();
});

moins.addEventListener("click", () => {
  if (compteur > 0) {
    compteur--;
  }
  mettreAJour();
});

reinitialiser.addEventListener("click", () => {
  compteur = 0;
  mettreAJour();
});` }],
    explanation: [
      "La variable `compteur` est déclarée en dehors des gestionnaires : sa valeur est conservée d’un clic à l’autre (niveau 4).",
      "La fonction `mettreAJour()` centralise l’affichage : les trois gestionnaires changent seulement la variable, puis l’appellent. Si tu veux changer l’affichage plus tard, il n’y a qu’un endroit à modifier.",
      "Pour aller plus loin : ajoute un pas réglable avec un champ `input`, ou une valeur maximale.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "dark-mode", title: "Mode sombre", difficulty: 1, available: true, previewHeight: 190,
    goal: "Un bouton qui bascule entre le thème clair et le thème sombre, avec un raccourci clavier.",
    skills: "classList.toggle, textContent, événements clavier, fonction réutilisée",
    files: projectFiles(`<header>
  <h1>Mon site</h1>
  <button id="theme">Mode sombre</button>
</header>
<p>Un texte pour tester les couleurs. Tu peux aussi appuyer sur la touche D.</p>`, `body { font-family: sans-serif; padding: 12px; background: #ffffff; color: #1b1f3a; }
header { display: flex; justify-content: space-between; align-items: center; }
button { padding: 8px 14px; cursor: pointer; }
body.sombre { background: #1b1f3a; color: #f0f2ff; }`, `// Projet 2 : le mode sombre
// Le CSS contient déjà la règle body.sombre : il te suffit d'ajouter ou de retirer la classe.
`),
    steps: [
      {
        title: "Basculer la classe",
        instruction: ["Au clic sur le bouton `#theme`, ajoute la classe `sombre` au `body` si elle est absente, ou retire-la si elle est présente."],
        hints: [
          "Une méthode de `classList` fait exactement cela en une seule instruction.",
          "Sélectionne le bouton, écoute le clic, et utilise `toggle` sur `document.body.classList`.",
          "`document.body.classList.toggle(\"sombre\");`",
        ],
        actions: [{ do: "click", target: "#theme" }],
        tests: [{ expr: `document.body.classList.contains("sombre")`, expect: true, label: "Après un clic, le `body` doit avoir la classe `sombre`" }],
      },
      {
        title: "Adapter le texte du bouton",
        instruction: ["Le bouton doit afficher « Mode clair » quand le thème sombre est actif, et « Mode sombre » sinon."],
        hints: [
          "Après avoir basculé la classe, regarde si le `body` contient `sombre`.",
          "`document.body.classList.contains(\"sombre\")` donne `true` ou `false` : utilise un `if` / `else`.",
          "Dans le `if` : `bouton.textContent = \"Mode clair\";`. Dans le `else` : `\"Mode sombre\"`.",
        ],
        actions: [{ do: "click", target: "#theme" }, { do: "click", target: "#theme" }],
        tests: [
          { expr: `document.getElementById("theme").textContent`, expect: "Mode clair", afterAction: 0, label: "Thème sombre actif : le bouton doit afficher « Mode clair »" },
          { expr: `document.getElementById("theme").textContent`, expect: "Mode sombre", label: "Thème clair : le bouton doit afficher « Mode sombre »" },
        ],
      },
      {
        title: "Un raccourci clavier",
        instruction: [
          "Appuyer sur la touche `d`, n’importe où dans la page, doit aussi basculer le thème (avec le même texte de bouton).",
          "Pour éviter de recopier le code, mets-le dans une fonction `basculer()` appelée par le clic et par la touche.",
        ],
        hints: [
          "Une touche, n’importe où : un écouteur `keydown` sur `document`.",
          "Teste `event.key === \"d\"` avant d’agir.",
          "Appelle la même fonction `basculer()` dans les deux écouteurs.",
        ],
        actions: [{ do: "key", target: "document", type: "keydown", key: "d" }, { do: "key", target: "document", type: "keydown", key: "d" }],
        tests: [
          { expr: `document.body.classList.contains("sombre")`, expect: true, afterAction: 0, label: "Après la touche D, le thème sombre doit être actif" },
          { expr: `document.body.classList.contains("sombre")`, expect: false, label: "Une deuxième fois, il doit être désactivé" },
          { expr: `document.getElementById("theme").textContent`, expect: "Mode sombre", label: "Le texte du bouton doit suivre aussi avec le clavier" },
        ],
      },
    ],
    solution: [{ name: "script.js", code: `const bouton = document.getElementById("theme");

function basculer() {
  document.body.classList.toggle("sombre");
  if (document.body.classList.contains("sombre")) {
    bouton.textContent = "Mode clair";
  } else {
    bouton.textContent = "Mode sombre";
  }
}

bouton.addEventListener("click", basculer);

document.addEventListener("keydown", (event) => {
  if (event.key === "d") {
    basculer();
  }
});` }],
    explanation: [
      "Le CSS fait tout le travail visuel : JavaScript n’ajoute ou ne retire qu’une classe. C’est la bonne pratique vue au niveau 3.",
      "La fonction `basculer()` est donnée telle quelle (sans parenthèses) à `addEventListener` : elle sert de gestionnaire pour le clic. Dans l’écouteur du clavier, on l’appelle dans un `if`.",
      "Pour aller plus loin : un vrai site mémoriserait le choix avec `localStorage` (c’est ce que fait ce site, voir `storage.js`) pour le retrouver au prochain chargement. L’aperçu de l’atelier bloque `localStorage`, mais tu peux essayer dans tes propres fichiers.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "todo", title: "To-do list", difficulty: 2, available: true, previewHeight: 300,
    goal: "Une liste de tâches : ajouter, cocher, supprimer, et un compteur de tâches restantes.",
    skills: "submit et preventDefault, createElement, délégation d’événements, closest, validation de saisie",
    files: projectFiles(`<h1>Mes tâches</h1>
<form id="formulaire">
  <input id="tache" type="text" placeholder="Nouvelle tâche">
  <button type="submit">Ajouter</button>
</form>
<ul id="liste"></ul>
<p id="compteur">0 tâche restante</p>`, `body { font-family: sans-serif; padding: 8px 12px; }
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; margin: 4px 0; background: #eef; border-radius: 6px; cursor: pointer; }
li.fait { text-decoration: line-through; color: gray; }
.supprimer { border: 0; background: transparent; cursor: pointer; color: crimson; }`, `// Projet 3 : la to-do list
// Suis les étapes dans l'ordre, sous l'éditeur.
`),
    steps: [
      {
        title: "Ajouter une tâche",
        instruction: [
          "Quand le formulaire est envoyé, empêche le rechargement, puis ajoute à `#liste` un nouvel élément `li` qui contient le texte du champ `#tache`. Vide ensuite le champ.",
          "Crée le `li` avec `createElement`, et écris son texte avec `textContent`.",
        ],
        hints: [
          "Écoute `submit` sur `#formulaire`, et commence par `event.preventDefault()`.",
          "`const li = document.createElement(\"li\");` puis `li.textContent = champ.value;` puis `liste.append(li);`.",
          "Termine par `champ.value = \"\";` pour vider le champ.",
        ],
        actions: [{ do: "input", target: "#tache", value: "Courses" }, { do: "submit", target: "#formulaire" }],
        tests: [
          { expr: `document.querySelectorAll("#liste li").length`, expect: 1, label: "Il doit y avoir 1 tâche dans la liste" },
          { expr: `document.querySelector("#liste li").firstChild.textContent`, expect: "Courses", label: "La tâche doit contenir « Courses »" },
          { expr: `document.getElementById("tache").value`, expect: "", label: "Le champ doit être vidé après l’ajout" },
        ],
        forbidLogs: [{ level: "warn", text: "formulaire a été envoyé", label: "Le formulaire est encore envoyé : appelle `event.preventDefault()`." }],
      },
      {
        title: "Refuser les tâches vides",
        instruction: ["Si le champ est vide (même s’il ne contient que des espaces), n’ajoute rien."],
        hints: [
          "Il faut retirer les espaces autour du texte avant de tester.",
          "`const texte = champ.value.trim();` puis `if (texte === \"\") { return; }`.",
          "Le `return` quitte le gestionnaire : la suite (création du `li`) n’est pas exécutée.",
        ],
        actions: [
          { do: "input", target: "#tache", value: "   " }, { do: "submit", target: "#formulaire" },
          { do: "input", target: "#tache", value: "Lire" }, { do: "submit", target: "#formulaire" },
        ],
        tests: [
          { expr: `document.querySelectorAll("#liste li").length`, expect: 0, afterAction: 1, label: "Un champ vide ne doit pas ajouter de tâche" },
          { expr: `document.querySelectorAll("#liste li").length`, expect: 1, label: "« Lire » doit être ajoutée : 1 tâche au total" },
        ],
      },
      {
        title: "Cocher une tâche",
        instruction: [
          "Un clic sur une tâche bascule la classe `fait` (le CSS la barre).",
          "Les tâches sont créées par JavaScript : utilise la délégation d’événements, avec un seul écouteur sur `#liste`.",
        ],
        hints: [
          "Écoute `click` sur la liste, pas sur chaque `li`.",
          "`event.target` est l’élément cliqué : vérifie avec `event.target.matches(\"li\")`.",
          "`event.target.classList.toggle(\"fait\");`",
        ],
        actions: [{ do: "input", target: "#tache", value: "A" }, { do: "submit", target: "#formulaire" }, { do: "click", target: "#liste li" }],
        tests: [{ expr: `document.querySelector("#liste li").classList.contains("fait")`, expect: true, label: "Après un clic, la tâche doit avoir la classe `fait`" }],
      },
      {
        title: "Supprimer une tâche",
        instruction: [
          "Ajoute dans chaque `li` un bouton « ✕ » de classe `supprimer`. Un clic dessus supprime la tâche (et ne la coche pas).",
          "Crée le bouton avec `createElement`, place-le dans le `li` après le texte (`li.append(bouton)`), et utilise `event.target.closest(\"li\")` pour retrouver la tâche à supprimer.",
        ],
        hints: [
          "Le bouton se crée comme le `li`. N’oublie pas sa classe : `bouton.classList.add(\"supprimer\")`.",
          "Dans l’écouteur de la liste, teste d’abord `event.target.matches(\".supprimer\")`, avant le test du `li`.",
          "`event.target.closest(\"li\").remove();`",
        ],
        actions: [
          { do: "input", target: "#tache", value: "A" }, { do: "submit", target: "#formulaire" },
          { do: "input", target: "#tache", value: "B" }, { do: "submit", target: "#formulaire" },
          { do: "click", target: "#liste li .supprimer" },
        ],
        tests: [
          { expr: `document.querySelectorAll("#liste li").length`, expect: 1, label: "Après la suppression de la première tâche, il doit en rester 1" },
          { expr: `document.querySelector("#liste li").firstChild.textContent`, expect: "B", label: "La tâche restante doit être « B »" },
        ],
      },
      {
        title: "Le compteur de tâches restantes",
        instruction: [
          "Dans `#compteur`, affiche le nombre de tâches non cochées : « 1 tâche restante », « 2 tâches restantes », « 0 tâche restante ».",
          "Crée une fonction `mettreAJourCompteur()` et appelle-la après chaque ajout, chaque suppression et chaque case cochée.",
        ],
        hints: [
          "Pour compter les tâches non cochées : `liste.querySelectorAll(\"li:not(.fait)\").length`.",
          "Utilise un `if` pour choisir entre « tâche restante » (0 ou 1) et « tâches restantes » (plus de 1).",
          "Pense à appeler la fonction dans le gestionnaire de `submit` ET dans celui du clic sur la liste.",
        ],
        actions: [
          { do: "input", target: "#tache", value: "A" }, { do: "submit", target: "#formulaire" },
          { do: "input", target: "#tache", value: "B" }, { do: "submit", target: "#formulaire" },
          { do: "click", target: "#liste li" },
        ],
        tests: [
          { expr: `document.getElementById("compteur").textContent`, expect: "2 tâches restantes", afterAction: 3, label: "Avec 2 tâches non cochées : « 2 tâches restantes »" },
          { expr: `document.getElementById("compteur").textContent`, expect: "1 tâche restante", label: "Après avoir coché une tâche : « 1 tâche restante »" },
        ],
      },
    ],
    solution: [{ name: "script.js", code: `const formulaire = document.getElementById("formulaire");
const champ = document.getElementById("tache");
const liste = document.getElementById("liste");
const compteur = document.getElementById("compteur");

function mettreAJourCompteur() {
  const restantes = liste.querySelectorAll("li:not(.fait)").length;
  if (restantes > 1) {
    compteur.textContent = restantes + " tâches restantes";
  } else {
    compteur.textContent = restantes + " tâche restante";
  }
}

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  const texte = champ.value.trim();
  if (texte === "") {
    return;
  }

  const li = document.createElement("li");
  li.textContent = texte;

  const supprimer = document.createElement("button");
  supprimer.textContent = "✕";
  supprimer.classList.add("supprimer");
  li.append(supprimer);

  liste.append(li);
  champ.value = "";
  mettreAJourCompteur();
});

liste.addEventListener("click", (event) => {
  if (event.target.matches(".supprimer")) {
    event.target.closest("li").remove();
  } else if (event.target.matches("li")) {
    event.target.classList.toggle("fait");
  }
  mettreAJourCompteur();
});` }],
    explanation: [
      "Le gestionnaire de `submit` enchaîne : annuler l’envoi, nettoyer et valider la saisie, créer les éléments, les ajouter, vider le champ. Le `return` précoce évite d’imbriquer tout le reste dans un `if`.",
      "Les `li` n’existent pas au chargement : un écouteur par `li` ne marcherait pas pour les suivants. La délégation (un seul écouteur sur `#liste`) fonctionne pour tous, présents et futurs. On trie ensuite avec `matches` (qui est cliqué ?) et `closest` (de quelle tâche s’agit-il ?).",
      "On teste `.supprimer` avant `li` : un clic sur le bouton ne doit pas cocher la tâche, et comme le bouton est dans le `li`, on traite le cas le plus précis en premier.",
      "Pour aller plus loin : sauvegarder la liste avec `localStorage`, ou éditer une tâche au double-clic.",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "quiz", title: "Quiz interactif", difficulty: 2, available: true, previewHeight: 300,
    goal: "Un quiz de 3 questions : affichage des réponses, correction immédiate, passage à la question suivante, score final.",
    skills: "tableaux d’objets, forEach, createElement, dataset, délégation, attribut hidden et disabled",
    files: projectFiles(`<div id="quiz">
  <p id="progression"></p>
  <h2 id="question"></h2>
  <div id="reponses"></div>
  <p id="retour"></p>
  <button id="suivant" hidden>Suivant</button>
</div>`, `body { font-family: sans-serif; padding: 8px 14px; }
#reponses button { display: block; width: 100%; margin: 6px 0; padding: 10px; text-align: left; cursor: pointer; }
#progression { color: gray; margin-bottom: 0; }
#retour { font-weight: bold; min-height: 1.4em; }`, `// Projet 4 : le quiz
// Les questions sont fournies. Chaque question a un texte, une liste de réponses,
// et « bonne » : la position (en partant de 0) de la bonne réponse.
const questions = [
  { texte: "Quel langage décrit la structure d'une page ?", reponses: ["CSS", "HTML", "JavaScript"], bonne: 1 },
  { texte: "Quel mot-clé crée une constante ?", reponses: ["const", "let", "var"], bonne: 0 },
  { texte: 'Que vaut typeof "5" ?', reponses: ["number", "boolean", "string"], bonne: 2 },
];

// Écris la suite ici
`),
    steps: [
      {
        title: "Afficher une question",
        instruction: [
          "Crée une variable `indice` (le numéro de la question en cours, 0 au départ) et une fonction `afficherQuestion()` qui :",
          { list: [
            "écrit « Question 1 / 3 » dans `#progression` (calculé avec `indice` et `questions.length`) ;",
            "écrit le texte de la question dans `#question` ;",
            "crée un bouton par réponse dans `#reponses`.",
          ] },
          "Appelle `afficherQuestion()` pour afficher la première question au chargement.",
        ],
        hints: [
          "La question en cours est `questions[indice]`. Range-la dans une variable.",
          "Pour les boutons : `courante.reponses.forEach((texte, position) => { ... })`, et dans la fonction, `createElement(\"button\")`, `textContent`, `reponses.append(...)`.",
          "Garde la position de la réponse sur le bouton : `bouton.dataset.position = position;`. Elle servira à l’étape suivante.",
        ],
        tests: [
          { expr: `document.getElementById("progression").textContent`, expect: "Question 1 / 3", label: "`#progression` doit afficher « Question 1 / 3 »" },
          { expr: `document.getElementById("question").textContent`, expect: "Quel langage décrit la structure d'une page ?", label: "`#question` doit afficher la première question" },
          { expr: `document.querySelectorAll("#reponses button").length`, expect: 3, label: "Il doit y avoir 3 boutons de réponse" },
        ],
      },
      {
        title: "Corriger la réponse",
        instruction: [
          "Quand on clique sur un bouton de réponse, affiche dans `#retour` « Bonne réponse ! » ou « Mauvaise réponse. ». Désactive ensuite tous les boutons de réponse (on ne peut répondre qu’une fois) et affiche le bouton `#suivant` (attribut `hidden`).",
          "Utilise la délégation : un seul écouteur sur `#reponses`.",
        ],
        hints: [
          "Écoute `click` sur `#reponses` et vérifie `event.target.matches(\"button\")`.",
          "Compare `Number(event.target.dataset.position)` avec `questions[indice].bonne`.",
          "`suivant.hidden = false;`, et pour désactiver : `reponses.querySelectorAll(\"button\").forEach((b) => { b.disabled = true; });`",
        ],
        actions: [{ do: "click", target: "#reponses button:nth-child(2)" }],
        tests: [
          { expr: `document.getElementById("retour").textContent`, expect: "Bonne réponse !", label: "Cliquer sur la bonne réponse doit afficher « Bonne réponse ! »" },
          { expr: `document.getElementById("suivant").hidden`, expect: false, label: "Le bouton « Suivant » doit être visible" },
          { expr: `document.querySelector("#reponses button").disabled`, expect: true, label: "Les boutons de réponse doivent être désactivés" },
        ],
      },
      {
        title: "Passer à la question suivante",
        instruction: [
          "Au clic sur `#suivant` : passe à la question suivante (`indice++`) et réaffiche-la.",
          "`afficherQuestion()` doit donc aussi vider `#reponses` (avec `replaceChildren()`), vider `#retour` et recacher `#suivant`.",
        ],
        hints: [
          "Dans `afficherQuestion()`, commence par nettoyer : `reponses.replaceChildren();`, `retour.textContent = \"\";`, `suivant.hidden = true;`.",
          "L’écouteur de `suivant` fait `indice++` puis appelle `afficherQuestion()`.",
          "Vérifie que la mauvaise réponse est bien détectée : clique sur la 2ᵉ réponse de la question 2 (la bonne est la 1ʳᵉ).",
        ],
        actions: [
          { do: "click", target: "#reponses button:nth-child(2)" },
          { do: "click", target: "#suivant" },
          { do: "click", target: "#reponses button:nth-child(2)" },
        ],
        tests: [
          { expr: `document.getElementById("question").textContent`, expect: "Quel mot-clé crée une constante ?", afterAction: 1, label: "Après « Suivant », la question 2 doit s’afficher" },
          { expr: `document.getElementById("retour").textContent`, expect: "Mauvaise réponse.", label: "Une mauvaise réponse doit afficher « Mauvaise réponse. »" },
          { expr: `document.getElementById("progression").textContent`, expect: "Question 2 / 3", label: "`#progression` doit afficher « Question 2 / 3 »" },
        ],
      },
      {
        title: "Le score final",
        instruction: [
          "Compte les bonnes réponses dans une variable `score`. Quand on clique sur « Suivant » après la dernière question, remplace tout le contenu de `#quiz` par « Score : X / 3 » (avec le vrai score et `questions.length`).",
        ],
        hints: [
          "Crée `let score = 0;` en dehors des fonctions et augmente-le à chaque bonne réponse.",
          "Dans l’écouteur de `suivant`, après `indice++`, teste `indice < questions.length`.",
          "S’il n’y a plus de question : `quiz.textContent = \"Score : \" + score + \" / \" + questions.length;` (avec `const quiz = document.getElementById(\"quiz\");`).",
        ],
        actions: [
          { do: "click", target: "#reponses button:nth-child(2)" }, { do: "click", target: "#suivant" },
          { do: "click", target: "#reponses button:nth-child(1)" }, { do: "click", target: "#suivant" },
          { do: "click", target: "#reponses button:nth-child(3)" }, { do: "click", target: "#suivant" },
        ],
        tests: [{ expr: `document.getElementById("quiz").textContent.includes("Score : 3 / 3")`, expect: true, label: "Avec 3 bonnes réponses, la page doit afficher « Score : 3 / 3 »" }],
      },
    ],
    solution: [{ name: "script.js", code: `const questions = [
  { texte: "Quel langage décrit la structure d'une page ?", reponses: ["CSS", "HTML", "JavaScript"], bonne: 1 },
  { texte: "Quel mot-clé crée une constante ?", reponses: ["const", "let", "var"], bonne: 0 },
  { texte: 'Que vaut typeof "5" ?', reponses: ["number", "boolean", "string"], bonne: 2 },
];

const quiz = document.getElementById("quiz");
const progression = document.getElementById("progression");
const question = document.getElementById("question");
const reponses = document.getElementById("reponses");
const retour = document.getElementById("retour");
const suivant = document.getElementById("suivant");

let indice = 0;
let score = 0;

function afficherQuestion() {
  const courante = questions[indice];
  progression.textContent = "Question " + (indice + 1) + " / " + questions.length;
  question.textContent = courante.texte;
  reponses.replaceChildren();
  retour.textContent = "";
  suivant.hidden = true;

  courante.reponses.forEach((texte, position) => {
    const bouton = document.createElement("button");
    bouton.textContent = texte;
    bouton.dataset.position = position;
    reponses.append(bouton);
  });
}

reponses.addEventListener("click", (event) => {
  if (!event.target.matches("button")) {
    return;
  }
  const choix = Number(event.target.dataset.position);
  if (choix === questions[indice].bonne) {
    retour.textContent = "Bonne réponse !";
    score++;
  } else {
    retour.textContent = "Mauvaise réponse.";
  }
  reponses.querySelectorAll("button").forEach((bouton) => {
    bouton.disabled = true;
  });
  suivant.hidden = false;
});

suivant.addEventListener("click", () => {
  indice++;
  if (indice < questions.length) {
    afficherQuestion();
  } else {
    quiz.textContent = "Score : " + score + " / " + questions.length;
  }
});

afficherQuestion();` }],
    explanation: [
      "Les données (le tableau `questions`) sont séparées de l’affichage : pour ajouter une question, il suffit d’ajouter un objet au tableau, sans toucher au reste.",
      "`afficherQuestion()` reconstruit l’écran à partir de `indice` : elle commence par tout nettoyer (`replaceChildren`), puis crée les boutons avec une boucle.",
      "Chaque bouton garde sa position dans `dataset.position` : le gestionnaire (délégation sur `#reponses`) sait ainsi quelle réponse a été choisie. `dataset` renvoie du texte, d’où `Number(...)`.",
      "Le score et l’indice sont des variables extérieures aux gestionnaires : elles conservent leur valeur entre deux événements.",
      "Pour aller plus loin : mélanger les questions, afficher la bonne réponse en vert, ajouter un chronomètre (niveau 6).",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "calculatrice", title: "Calculatrice", difficulty: 3, available: true, previewHeight: 330,
    goal: "Une calculatrice qui fait les quatre opérations sur deux nombres, avec effacement et gestion des erreurs.",
    skills: "dataset, délégation d’événements, expressions régulières (match), conditions, conversion Number",
    files: projectFiles(`<div id="calculatrice">
  <div id="ecran">0</div>
  <div id="touches">
    <button data-valeur="7">7</button>
    <button data-valeur="8">8</button>
    <button data-valeur="9">9</button>
    <button data-valeur="/">÷</button>
    <button data-valeur="4">4</button>
    <button data-valeur="5">5</button>
    <button data-valeur="6">6</button>
    <button data-valeur="*">×</button>
    <button data-valeur="1">1</button>
    <button data-valeur="2">2</button>
    <button data-valeur="3">3</button>
    <button data-valeur="-">−</button>
    <button id="effacer">C</button>
    <button data-valeur="0">0</button>
    <button id="egal">=</button>
    <button data-valeur="+">+</button>
  </div>
</div>`, `body { font-family: sans-serif; padding: 8px; }
#calculatrice { width: 240px; margin: 0 auto; }
#ecran { background: #1b1f3a; color: #fff; font-size: 1.6rem; text-align: right; padding: 12px; border-radius: 8px; margin-bottom: 8px; min-height: 1.6em; }
#touches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
#touches button { font-size: 1.2rem; padding: 10px 0; cursor: pointer; }`, `// Projet 5 : la calculatrice
// Chaque touche de chiffre ou d'opérateur porte un attribut data-valeur : "7", "+", "*", "/"…
// Les boutons C (#effacer) et = (#egal) n'en ont pas.
`),
    steps: [
      {
        title: "Écrire sur l’écran",
        instruction: [
          "Un clic sur une touche de chiffre ou d’opérateur ajoute son caractère à l’écran `#ecran`. Au départ, l’écran affiche « 0 » : le premier caractère le remplace (on veut « 7 », pas « 07 »).",
          "Utilise la délégation : un seul écouteur sur `#touches`, et lis `event.target.dataset.valeur`. Ignore les clics sur les boutons qui n’ont pas de `data-valeur` (la valeur est alors `undefined`).",
        ],
        hints: [
          "`event.target.dataset.valeur` donne le caractère de la touche cliquée (`\"7\"`, `\"+\"`…).",
          "Si cette valeur vaut `undefined`, fais un `return`.",
          "Si l’écran affiche `\"0\"`, remplace son texte ; sinon, ajoute à la suite avec `+=`.",
        ],
        actions: [
          { do: "click", target: "[data-valeur=\"7\"]" }, { do: "click", target: "[data-valeur=\"+\"]" }, { do: "click", target: "[data-valeur=\"3\"]" },
        ],
        tests: [{ expr: `document.getElementById("ecran").textContent`, expect: "7+3", label: "Les touches 7, +, 3 doivent afficher « 7+3 »" }],
      },
      {
        title: "Effacer",
        instruction: ["Un clic sur `#effacer` remet l’écran à « 0 »."],
        hints: [
          "Un écouteur sur le bouton `#effacer`.",
          "Il remet simplement le texte de l’écran à `\"0\"`.",
          "`ecran.textContent = \"0\";`",
        ],
        actions: [
          { do: "click", target: "[data-valeur=\"7\"]" }, { do: "click", target: "[data-valeur=\"+\"]" }, { do: "click", target: "#effacer" },
          { do: "click", target: "[data-valeur=\"3\"]" },
        ],
        tests: [
          { expr: `document.getElementById("ecran").textContent`, expect: "0", afterAction: 2, label: "Après 7, + puis C, l’écran doit afficher 0" },
          { expr: `document.getElementById("ecran").textContent`, expect: "3", label: "Puis la touche 3 doit afficher « 3 » : on repart bien de zéro" },
        ],
      },
      {
        title: "Calculer",
        instruction: [
          "Un clic sur `#egal` calcule l’opération affichée, de la forme « nombre opérateur nombre » (par exemple « 12+3 »), et affiche le résultat à la place.",
          "Pour découper l’expression, utilise `ecran.textContent.match(/^(\\d+)([+\\-*/])(\\d+)$/)` : le résultat est une liste dont les éléments 1, 2 et 3 sont le premier nombre, l’opérateur et le second nombre. Convertis les nombres avec `Number(...)`, puis choisis l’opération avec des `if` / `else if`.",
        ],
        hints: [
          "`const morceaux = ecran.textContent.match(/^(\\d+)([+\\-*/])(\\d+)$/);` puis `morceaux[1]`, `morceaux[2]`, `morceaux[3]`.",
          "`const a = Number(morceaux[1]);` et pareil pour `b`. Compare `morceaux[2]` avec `\"+\"`, `\"-\"`, `\"*\"`, `\"/\"`.",
          "Range le résultat dans `let resultat;` puis `ecran.textContent = resultat;`.",
        ],
        actions: [
          { do: "click", target: "[data-valeur=\"1\"]" }, { do: "click", target: "[data-valeur=\"2\"]" }, { do: "click", target: "[data-valeur=\"+\"]" },
          { do: "click", target: "[data-valeur=\"3\"]" }, { do: "click", target: "#egal" },
          { do: "click", target: "#effacer" },
          { do: "click", target: "[data-valeur=\"8\"]" }, { do: "click", target: "[data-valeur=\"/\"]" }, { do: "click", target: "[data-valeur=\"2\"]" }, { do: "click", target: "#egal" },
        ],
        tests: [
          { expr: `document.getElementById("ecran").textContent`, expect: "15", afterAction: 4, label: "12 + 3 doit afficher 15" },
          { expr: `document.getElementById("ecran").textContent`, expect: "4", label: "8 ÷ 2 doit afficher 4" },
        ],
      },
      {
        title: "Gérer les erreurs",
        instruction: [
          "Affiche « Erreur » quand le calcul est impossible : une division par zéro (« 5/0 »), ou une opération incomplète (« 7+ » : l’expression ne correspond pas au modèle, donc `match` renvoie `null`).",
          "Après une erreur, le chiffre suivant doit repartir de zéro (comme si l’écran affichait « 0 »).",
        ],
        hints: [
          "Si `morceaux === null`, affiche « Erreur » et fais un `return`.",
          "Dans le cas de la division, teste `b === 0` avant de diviser.",
          "Dans l’écouteur des touches, traite l’écran « Erreur » comme l’écran « 0 » : le premier caractère le remplace.",
        ],
        actions: [
          { do: "click", target: "[data-valeur=\"5\"]" }, { do: "click", target: "[data-valeur=\"/\"]" }, { do: "click", target: "[data-valeur=\"0\"]" }, { do: "click", target: "#egal" },
          { do: "click", target: "[data-valeur=\"7\"]" }, { do: "click", target: "[data-valeur=\"+\"]" }, { do: "click", target: "#egal" },
        ],
        tests: [
          { expr: `document.getElementById("ecran").textContent`, expect: "Erreur", afterAction: 3, label: "5 ÷ 0 doit afficher « Erreur »" },
          { expr: `document.getElementById("ecran").textContent`, expect: "Erreur", label: "Une opération incomplète (« 7+ ») doit afficher « Erreur »" },
        ],
      },
    ],
    solution: [{ name: "script.js", code: `const ecran = document.getElementById("ecran");
const touches = document.getElementById("touches");
const effacer = document.getElementById("effacer");
const egal = document.getElementById("egal");

touches.addEventListener("click", (event) => {
  const valeur = event.target.dataset.valeur;
  if (valeur === undefined) {
    return;
  }
  if (ecran.textContent === "0" || ecran.textContent === "Erreur") {
    ecran.textContent = valeur;
  } else {
    ecran.textContent += valeur;
  }
});

effacer.addEventListener("click", () => {
  ecran.textContent = "0";
});

egal.addEventListener("click", () => {
  const morceaux = ecran.textContent.match(/^(\\d+)([+\\-*/])(\\d+)$/);
  if (morceaux === null) {
    ecran.textContent = "Erreur";
    return;
  }

  const a = Number(morceaux[1]);
  const operateur = morceaux[2];
  const b = Number(morceaux[3]);
  let resultat;

  if (operateur === "+") {
    resultat = a + b;
  } else if (operateur === "-") {
    resultat = a - b;
  } else if (operateur === "*") {
    resultat = a * b;
  } else {
    if (b === 0) {
      ecran.textContent = "Erreur";
      return;
    }
    resultat = a / b;
  }
  ecran.textContent = resultat;
});` }],
    explanation: [
      "Une seule délégation sur `#touches` gère les 14 touches : le caractère de chaque touche est lu dans `data-valeur`. Les boutons `C` et `=` n’ont pas cet attribut : `dataset.valeur` vaut `undefined`, et le `return` les ignore.",
      "L’expression régulière `/^(\\d+)([+\\-*/])(\\d+)$/` décrit « un ou plusieurs chiffres, un opérateur, un ou plusieurs chiffres ». Les parenthèses créent des groupes : `morceaux[1]`, `[2]` et `[3]`. Si l’écran ne correspond pas, `match` renvoie `null`, ce qui permet d’afficher « Erreur » sans planter.",
      "Les morceaux sont du texte : on convertit les nombres avec `Number(...)` avant de calculer, sinon `\"12\" + \"3\"` donnerait `\"123\"`.",
      "Pour aller plus loin : les nombres décimaux (une touche « . »), enchaîner plusieurs opérations, ou le clavier (touches 0–9 et Entrée).",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "formulaire", title: "Validation de formulaire", difficulty: 3, available: true, previewHeight: 400,
    goal: "Un formulaire d’inscription qui vérifie chaque champ, affiche un message d’erreur sous le champ concerné, et confirme l’inscription quand tout est correct.",
    skills: "submit et preventDefault, validation, trim, includes, longueur d’un texte, checked, fonction réutilisable",
    files: projectFiles(`<h1>Inscription</h1>
<form id="inscription" novalidate>
  <label>Nom <input id="nom" type="text"></label>
  <small class="erreur" id="erreur-nom"></small>
  <label>Email <input id="email" type="text"></label>
  <small class="erreur" id="erreur-email"></small>
  <label>Mot de passe <input id="mdp" type="password"></label>
  <small class="erreur" id="erreur-mdp"></small>
  <label class="case"><input id="cgu" type="checkbox"> J'accepte les conditions</label>
  <small class="erreur" id="erreur-cgu"></small>
  <button type="submit">S'inscrire</button>
</form>
<p id="succes"></p>`, `body { font-family: sans-serif; padding: 8px 14px; }
label { display: block; margin-top: 8px; }
label.case { margin-top: 10px; }
input[type="text"], input[type="password"] { display: block; width: 100%; padding: 6px; box-sizing: border-box; }
.erreur { color: crimson; display: block; min-height: 1.2em; }
button { margin-top: 10px; padding: 8px 14px; cursor: pointer; }
#succes { color: seagreen; font-weight: bold; }`, `// Projet 6 : la validation de formulaire
// Chaque champ a un message d'erreur : #erreur-nom, #erreur-email, #erreur-mdp, #erreur-cgu.
// Le message de réussite s'écrit dans #succes.
`),
    steps: [
      {
        title: "Intercepter l’envoi et vérifier le nom",
        instruction: [
          "Quand le formulaire `#inscription` est envoyé, empêche le rechargement. Vérifie ensuite le champ `#nom` : s’il est vide (après `trim()`), écris « Nom obligatoire » dans `#erreur-nom` ; sinon, vide ce message.",
        ],
        hints: [
          "Écoute `submit` sur le formulaire, et commence par `event.preventDefault()`.",
          "`if (nom.value.trim() === \"\") { ... } else { ... }`",
          "Dans le `if` : `erreurNom.textContent = \"Nom obligatoire\";`. Dans le `else` : `erreurNom.textContent = \"\";`.",
        ],
        actions: [
          { do: "submit", target: "#inscription" },
          { do: "input", target: "#nom", value: "Léa" }, { do: "submit", target: "#inscription" },
        ],
        tests: [
          { expr: `document.getElementById("erreur-nom").textContent`, expect: "Nom obligatoire", afterAction: 0, label: "Nom vide : « Nom obligatoire » doit s’afficher" },
          { expr: `document.getElementById("erreur-nom").textContent`, expect: "", label: "Nom rempli : le message d’erreur doit disparaître" },
        ],
        forbidLogs: [{ level: "warn", text: "formulaire a été envoyé", label: "Le formulaire est encore envoyé : appelle `event.preventDefault()`." }],
      },
      {
        title: "Vérifier l’email",
        instruction: ["L’email doit contenir un « @ » et un « . ». Sinon, écris « Email invalide » dans `#erreur-email` ; s’il est correct, vide ce message."],
        hints: [
          "Un texte a une méthode `includes(...)` qui répond `true` ou `false`.",
          "`email.value.includes(\"@\") && email.value.includes(\".\")` : les deux conditions doivent être vraies.",
          "Garde le même schéma que pour le nom : un `if` / `else` qui écrit ou vide le message.",
        ],
        actions: [
          { do: "input", target: "#email", value: "abc" }, { do: "submit", target: "#inscription" },
          { do: "input", target: "#email", value: "a@b.fr" }, { do: "submit", target: "#inscription" },
        ],
        tests: [
          { expr: `document.getElementById("erreur-email").textContent`, expect: "Email invalide", afterAction: 1, label: "« abc » : « Email invalide » doit s’afficher" },
          { expr: `document.getElementById("erreur-email").textContent`, expect: "", label: "« a@b.fr » : le message d’erreur doit disparaître" },
        ],
      },
      {
        title: "Vérifier le mot de passe",
        instruction: ["Le mot de passe doit faire au moins 8 caractères. Sinon, écris « 8 caractères minimum » dans `#erreur-mdp`."],
        hints: [
          "La longueur d’un texte s’obtient avec `.length`.",
          "`mdp.value.length < 8` est vrai quand le mot de passe est trop court.",
          "Même schéma : un `if` qui écrit le message, un `else` qui le vide.",
        ],
        actions: [
          { do: "input", target: "#mdp", value: "1234" }, { do: "submit", target: "#inscription" },
          { do: "input", target: "#mdp", value: "12345678" }, { do: "submit", target: "#inscription" },
        ],
        tests: [
          { expr: `document.getElementById("erreur-mdp").textContent`, expect: "8 caractères minimum", afterAction: 1, label: "4 caractères : « 8 caractères minimum » doit s’afficher" },
          { expr: `document.getElementById("erreur-mdp").textContent`, expect: "", label: "8 caractères : le message d’erreur doit disparaître" },
        ],
      },
      {
        title: "Vérifier la case à cocher",
        instruction: ["La case `#cgu` doit être cochée. Sinon, écris « Acceptation obligatoire » dans `#erreur-cgu`."],
        hints: [
          "L’état d’une case se lit avec `cgu.checked` (`true` ou `false`).",
          "Le message s’affiche quand `cgu.checked` est faux : `if (!cgu.checked)`.",
          "Même schéma que pour les autres champs.",
        ],
        actions: [
          { do: "submit", target: "#inscription" },
          { do: "click", target: "#cgu" }, { do: "submit", target: "#inscription" },
        ],
        tests: [
          { expr: `document.getElementById("erreur-cgu").textContent`, expect: "Acceptation obligatoire", afterAction: 0, label: "Case décochée : « Acceptation obligatoire » doit s’afficher" },
          { expr: `document.getElementById("erreur-cgu").textContent`, expect: "", label: "Case cochée : le message d’erreur doit disparaître" },
        ],
      },
      {
        title: "Confirmer l’inscription",
        instruction: [
          "Si, et seulement si, tous les champs sont valides, écris « Inscription réussie ! » dans `#succes`. Sinon, `#succes` doit rester vide.",
          "Astuce : utilise une variable `valide`, mise à `true` au départ, et passée à `false` dès qu’une vérification échoue. À la fin, teste `valide`.",
        ],
        hints: [
          "Crée `let valide = true;` au début du gestionnaire, avant les vérifications.",
          "Dans chaque `if` qui écrit un message d’erreur, ajoute `valide = false;`.",
          "À la fin : `if (valide) { succes.textContent = \"Inscription réussie !\"; } else { succes.textContent = \"\"; }`",
        ],
        actions: [
          { do: "submit", target: "#inscription" },
          { do: "input", target: "#nom", value: "Léa" }, { do: "input", target: "#email", value: "a@b.fr" }, { do: "input", target: "#mdp", value: "12345678" },
          { do: "click", target: "#cgu" }, { do: "submit", target: "#inscription" },
        ],
        tests: [
          { expr: `document.getElementById("succes").textContent`, expect: "", afterAction: 0, label: "Formulaire vide : aucun message de réussite" },
          { expr: `document.getElementById("succes").textContent`, expect: "Inscription réussie !", label: "Tout est valide : « Inscription réussie ! » doit s’afficher" },
        ],
      },
    ],
    solution: [{ name: "script.js", code: `const formulaire = document.getElementById("inscription");
const nom = document.getElementById("nom");
const email = document.getElementById("email");
const mdp = document.getElementById("mdp");
const cgu = document.getElementById("cgu");
const succes = document.getElementById("succes");

function afficherErreur(champ, message) {
  document.getElementById("erreur-" + champ).textContent = message;
}

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  let valide = true;

  if (nom.value.trim() === "") {
    afficherErreur("nom", "Nom obligatoire");
    valide = false;
  } else {
    afficherErreur("nom", "");
  }

  if (!email.value.includes("@") || !email.value.includes(".")) {
    afficherErreur("email", "Email invalide");
    valide = false;
  } else {
    afficherErreur("email", "");
  }

  if (mdp.value.length < 8) {
    afficherErreur("mdp", "8 caractères minimum");
    valide = false;
  } else {
    afficherErreur("mdp", "");
  }

  if (!cgu.checked) {
    afficherErreur("cgu", "Acceptation obligatoire");
    valide = false;
  } else {
    afficherErreur("cgu", "");
  }

  if (valide) {
    succes.textContent = "Inscription réussie !";
  } else {
    succes.textContent = "";
  }
});` }],
    explanation: [
      "`preventDefault()` en première ligne : le formulaire n’est jamais envoyé, c’est JavaScript qui décide.",
      "Chaque champ suit le même schéma : on teste, on écrit le message d’erreur (et on passe `valide` à `false`), ou on efface le message. La fonction `afficherErreur(champ, message)` évite de répéter la sélection de l’élément d’erreur : l’id est construit avec `\"erreur-\" + champ`.",
      "La variable `valide` accumule le résultat : une seule vérification échouée suffit à la mettre à `false`. On ne l’affiche en succès qu’à la fin.",
      "Pour aller plus loin : valider pendant la saisie (événement `input`), afficher la force du mot de passe, ou utiliser la validation HTML intégrée (`required`, `type=\"email\"`, `minlength`).",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: "meteo", title: "Application météo", difficulty: 3, available: false,
    goal: "Récupérer des données depuis une API avec fetch et les afficher.",
    needs: "Niveau 6 (JavaScript asynchrone : Promises, async/await, fetch, JSON)",
    steps: [],
  },
];

function getProject(id) {
  return PROJECTS.find((project) => project.id === id);
}
