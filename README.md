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

## Parcours React + Vite

La plateforme est maintenant multi-parcours : l'accueil permet de choisir JavaScript ou React + Vite sans modifier le fonctionnement du parcours JavaScript.

Le parcours React contient actuellement :

- **Niveau 1 — Découvrir React** : React vs Vite, structure d'un projet Vite, JSX, composants, props, événements et `useState`.
- **Niveau 2 — Fondamentaux React** : rendu conditionnel, listes et `key`, formulaires contrôlés, tableaux dans le state, communication entre composants et organisation d'une petite application.
- **Projets React** : un projet par niveau est déclaré dans une roadmap commune. Les cinq projets sont désormais disponibles, du laboratoire de composants jusqu’à l’application React de production.
- **Task Manager React** : atelier du niveau 2 avec brouillon sauvegardé localement et vérification structurelle des notions attendues. Le React Studio exécute désormais les notions du Niveau 1 ; les projets plus avancés continuent d'utiliser une validation structurelle lorsqu'ils dépassent les capacités du runtime pédagogique.

Les données pédagogiques React et la roadmap de projets sont regroupées dans `js/react-course.js`. La progression React est enregistrée séparément dans `state.react` afin de ne pas interférer avec le parcours JavaScript.

## Mise à jour React — Niveau 3

Le niveau 3 « React intermédiaire » est désormais disponible avec :
- useEffect et synchronisation avec l’extérieur ;
- dépendances et cleanup ;
- fetch et données distantes ;
- états loading / error / vide ;
- hooks personnalisés ;
- Context API ;
- routage d’une application Vite ;
- débogage React / DevTools.

Projet de fin de niveau : **API Explorer**, avec brouillon local et validation structurelle des principaux critères React.

## React — Niveau 4 : React avancé

Cette version ajoute le quatrième niveau du parcours React + Vite sans modifier la logique des niveaux précédents.

Contenu ajouté :
- architecture de composants à grande échelle ;
- useRef ;
- memo, useMemo et useCallback ;
- gestion des erreurs et Error Boundaries ;
- tests avec Vitest / React Testing Library ;
- accessibilité ;
- configuration Vite, alias et variables d'environnement ;
- refactorisation progressive.

Projet de fin de niveau : **Dashboard multi-pages** avec validation structurelle du routage, de la mémoïsation, de useRef, du rendu de listes, de l'accessibilité et de la présence de tests orientés utilisateur.

## React — Niveau 5 : React professionnel

Le parcours React est désormais complet sur ses cinq niveaux. Le dernier niveau ajoute :
- React + TypeScript et typage des props/données ;
- gestion des dépendances et `package.json` ;
- tests d’intégration orientés utilisateur ;
- états de chargement, erreurs et résilience ;
- sécurité frontend et limites du code client ;
- performance de production et chargement différé ;
- build, preview et déploiement avec Vite ;
- qualité, maintenance et évolution du projet.

Projet final : **Application React de production**, avec validation structurelle de TypeScript, lazy/Suspense, récupération après erreur, rendu de liste, tests et commandes de build/preview. Le React Studio exécute les interactions fondamentales enseignées au Niveau 1. Le projet professionnel du Niveau 5 reste validé structurellement lorsqu'il mobilise TypeScript, lazy loading, outils de tests ou build réel, puis doit être confirmé dans un environnement React + Vite complet.

## Enrichissement pédagogique React — Niveau 1

Le niveau 1 React utilise désormais le moteur pédagogique de JavaScript : 24 exercices intégrés aux leçons, indices progressifs, corrections expliquées, révision, 10 questions d'évaluation et un projet final vérifiable. Voir `AUDIT-REACT-NIVEAU1.md` pour l'audit et la stratégie de migration de progression.


## React Niveau 2 enrichi

Le Niveau 2 — Fondamentaux React utilise maintenant le même moteur pédagogique enrichi que le Niveau 1 : 24 exercices (4 par leçon), indices progressifs, corrections expliquées, révision, évaluation finale de 10 questions et projet Task Manager renforcé. Voir `AUDIT-REACT-NIVEAU2.md`.

## Enrichissement React — Niveau 3

Le Niveau 3 React utilise désormais le même moteur pédagogique enrichi que les niveaux précédents :

- 10 leçons intermédiaires ;
- 40 exercices avec indices progressifs et corrections expliquées ;
- une évaluation finale de 10 questions ;
- un projet API Explorer renforcé avec 11 critères structurels ;
- révision et progression compatibles avec les données existantes.

Voir `AUDIT-REACT-NIVEAU3.md` pour le détail.

## React Niveau 1 — environnement interactif

Les six leçons du Niveau 1 possèdent maintenant un **React Studio** directement intégré au cours. Il reprend l’apparence et les conventions des ateliers JavaScript tout en ajoutant les besoins propres à React/Vite : terminal Vite simulé, système de fichiers virtuel, explorateur, éditeur multi-fichiers, navigateur, console et HMR pédagogique.

Le terminal n’exécute jamais de commande système réelle : seules des commandes pédagogiques contrôlées sont reconnues. Le JSX du Niveau 1 est interprété dans une iframe sandboxée et permet d’observer réellement les composants, props, clics, `useState`, `console.log` et erreurs de syntaxe prises en charge par ce runtime pédagogique.

Voir `AUDIT-INTERACTIVITE-REACT.md` pour les choix techniques, les limites et l’audit des niveaux suivants.

## React Niveau 2 — interactivité

Le Niveau 2 utilise désormais le React Studio dans ses 6 leçons : conditions, listes, formulaires contrôlés, tableaux dans le state, lifting state et organisation multi-fichiers. Le projet Task Manager possède également une preview réellement interactive en complément de sa validation structurelle.

## React Niveau 3 interactif
Le Niveau 3 utilise désormais React Studio pour useEffect, fetch/API, états asynchrones, hooks personnalisés, Context, routage, débogage, formulaires avancés, organisation multi-fichiers et le projet API Explorer. Les API réseau et le routage sont simulés de façon pédagogique dans l'iframe isolée lorsque le projet ne dispose pas d'un bundler React complet embarqué.

## React Niveau 4 interactif

Le Niveau 4 utilise désormais le React Studio pour architecture, useRef, mémoïsation, erreurs, tests, accessibilité, Vite avancé et refactorisation. Le projet Dashboard multi-pages possède lui aussi un atelier interactif. Voir `AUDIT-INTERACTIVITE-REACT-NIVEAU4.md`.

## React Niveau 5 interactif

Le dernier niveau utilise maintenant React Studio pour TypeScript, dépendances, tests d’intégration, résilience, sécurité, performance, build/déploiement et maintenance. Le projet final `Application React de production` est également disponible dans le studio avec tests, build et preview pédagogiques.

## Mise à jour — React Niveau 4 : exercices avancés

Le Niveau 4 contient maintenant 32 exercices (4 par leçon), une évaluation finale de 10 questions et des ateliers de code reliés au React Studio interactif. Les thèmes couverts sont l'architecture, useRef, la mémoïsation, la gestion des erreurs, les tests, l'accessibilité, Vite avancé et la refactorisation.

## React — parcours pédagogique finalisé

Le parcours React possède désormais des exercices et évaluations sur ses cinq niveaux :

- Niveau 1 : 24 exercices / 10 questions
- Niveau 2 : 24 exercices / 10 questions
- Niveau 3 : 40 exercices / 10 questions
- Niveau 4 : 32 exercices / 10 questions
- Niveau 5 : 32 exercices / 10 questions

Soit 152 exercices, 50 questions d’évaluation et 5 projets. Les ateliers pratiques avancés sont reliés au React Studio interactif lorsque la notion s’y prête.
