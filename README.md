# Cahier JS — apprendre JavaScript en pratiquant

Un site d’apprentissage et de révision de JavaScript, écrit en HTML, CSS et JavaScript « vanilla » (aucun framework, aucune installation).

## Lancer le site

Ouvre simplement `index.html` dans ton navigateur (double-clic). Ta progression est enregistrée dans le navigateur (`localStorage`) : tu peux fermer la page et revenir plus tard.

> Les polices viennent de Google Fonts. Sans connexion, le site utilise les polices de ton système : tout fonctionne quand même.
> Utilise toujours le même navigateur : la sauvegarde est propre à chaque navigateur.

## Ce que contient le site

**Six niveaux, 41 cours et 198 exercices**

| Niveau | Contenu | Cours | Exercices |
|---|---|---|---|
| 1 — Fondamentaux JavaScript | variables, types, opérateurs, conditions, boucles, fonctions, tableaux, objets, portée | 9 | 35 |
| 2 — JavaScript dans le navigateur | le navigateur, relier JavaScript à HTML, la console, `window`, `document` | 5 | 20 |
| 3 — Le DOM | sélectionner, texte et HTML, attributs, classes et styles, parcourir, créer, supprimer | 8 | 40 |
| 4 — Les événements | `addEventListener`, souris, clavier, `input` et `change`, objet `event`, `submit` et `preventDefault` | 6 | 36 |
| 5 — Interactivité | état de l’interface, accordéon, menu, modale, onglets, validation en direct, données et affichage | 7 | 35 |
| 6 — JavaScript asynchrone | `setTimeout`, promesses, `async` / `await`, JSON, `fetch`, applications avec API | 6 | 32 |

**8 projets guidés** : compteur, mode sombre, to-do list, quiz, calculatrice, validation de formulaire, mini-site interactif (se débloque à 70 % du niveau 5) et application météo (se débloque à 70 % du niveau 6). Chaque projet est découpé en étapes avec indices progressifs et vérification automatique de la page (clics, saisies et touches simulés). La correction finale est débloquée une fois le projet terminé, ou après 3 vérifications ratées. Ton code est sauvegardé automatiquement.

**Fonctionnement**

- **Chaque cours** : explication, exemple exécutable, code expliqué ligne par ligne, exemple concret, erreurs fréquentes (exécutables), résumé, exercices.
- **6 types d’exercices** : QCM (dont « trouver l’erreur »), vrai/faux, prédire le résultat, compléter le code, écrire du code, et **atelier** (plusieurs fichiers HTML / CSS / JS, aperçu de la page et console).
- **Aide progressive** : un premier échec ouvre l’indice 1, un deuxième ouvre l’indice 2 et débloque la correction. L’indice 3 est à la demande.
- **Éditeur façon VSCode** : guillemets et parenthèses fermés automatiquement, suggestions (tes variables et fonctions, mots-clés, méthodes après un point), modèles de code (`log`, `for`, `if`, `fn`, `listen`…, puis Tab), indentation automatique, Ctrl + / pour commenter.
- **Progression** : pourcentage par chapitre, exercices réussis et échoués, score, notions maîtrisées ou à revoir, et une page **Révision** (notions à revoir, résumés, révision rapide de 5 à 10 questions).
- **Thème sombre**, et bouton de **réinitialisation** (page Progression).

## Organisation du code

```text
javascript-learning/
├── index.html          La page unique : la barre latérale et la zone <main>
├── css/
│   └── style.css       Le design (thème clair et sombre avec des variables CSS)
├── js/
│   ├── storage.js      Lire et écrire dans localStorage
│   ├── runner.js       Exécuter le code de l’élève dans un Worker (protège des boucles infinies)
│   ├── courses.js      Les cours (données)
│   ├── exercises.js    Les exercices (données)
│   ├── projects.js     Les projets guidés : page prête, étapes, indices, vérifications, correction (données)
│   ├── progress.js     Calcul et enregistrement de la progression
│   ├── editor.js       L’éditeur « façon VSCode » : fermeture automatique, suggestions, modèles
│   ├── lab.js          L’atelier : assemble une page HTML/CSS/JS, l’exécute dans un aperçu isolé (iframe) et lit sa console
│   ├── ui.js           Composants : h(), éditeur, exercice, aide progressive
│   └── app.js          Le routeur et toutes les pages
└── README.md
```

Les fichiers sont chargés dans cet ordre dans `index.html`. Chaque fichier peut utiliser ce qui est défini dans les fichiers chargés avant lui.

## Pour étudier le code du site

Ce code est fait pour être lu. Quelques pistes, de la plus simple à la plus avancée :

1. `storage.js` : `localStorage.setItem` / `getItem` et `JSON.stringify` / `JSON.parse` en 30 lignes.
2. `ui.js`, fonction `h()` : comment créer un élément avec `document.createElement`, lui donner des attributs, des enfants et des écouteurs d’événements (`addEventListener`). C’est exactement ce que tu apprendras aux niveaux 3 et 4.
3. `app.js`, `router()` : comment une page change selon l’adresse (`location.hash`) et l’événement `hashchange`.
4. `ui.js`, `renderExercise()` : une machine à états (essais, indices, correction).
5. `runner.js` : un Web Worker (un programme qui tourne en parallèle) et une Promise.
6. `lab.js`, fonction `guardLoops()` : comment on protège une page contre les boucles infinies en réécrivant le code. Et `buildPage()` : comment le site reproduit ce que fait un navigateur (remplacer `<script src>` par le fichier, exécuter les scripts `defer` en dernier), et `runPage()` : une `<iframe>` isolée qui renvoie sa console avec `postMessage`.

## Ajouter un cours ou un exercice

- **Un exercice** : ajoute un objet dans la liste `EXERCISES` de `exercises.js`, en suivant les exemples. Le champ `lesson` doit être l’`id` d’un cours existant.
- **Un cours** : ajoute un objet dans `LESSONS` de `courses.js`. Il apparaît automatiquement dans la barre latérale, la liste des cours et la progression.

Aucune autre modification n’est nécessaire : les pages se construisent à partir de ces données.

## Limites connues

- Dans l’atelier, un formulaire envoyé ou un lien suivi sans `event.preventDefault()` est bloqué et la console te prévient (dans un vrai navigateur, la page se rechargerait ou changerait).
- Dans l’atelier, `alert`, `confirm` et `prompt` sont bloqués : ils s’écrivent dans la console avec une réponse automatique.
- Protection contre les boucles infinies : avant d’exécuter la page, `guardLoops()` (dans `lab.js`) ajoute un compteur dans la condition de chaque boucle. Une boucle qui dépasse 1,5 seconde est arrêtée avec un message d’erreur, au lieu de figer le navigateur.
- Si `localStorage` est bloqué par le navigateur (certains modes de navigation privée), la progression n’est pas conservée.
- Dans l’atelier, `fetch` n’atteint pas Internet : il s’adresse à une API simulée (`https://api.cahierjs.test`). Pour essayer une vraie API, copie ton code dans tes propres fichiers (et vérifie que l’API autorise les appels depuis un navigateur, la règle CORS).
- L’aperçu de l’atelier bloque `localStorage` : pour l’essayer, utilise tes propres fichiers.
