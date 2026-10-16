# Cahier Code

Plateforme d’apprentissage interactive du développement web, construite en **HTML, CSS et JavaScript vanilla**.

Cahier Code regroupe quatre parcours complets, organisés dans un ordre pédagogique logique :

> **HTML → CSS → JavaScript → React + Vite**

L’objectif est de passer progressivement de la structure d’une page web à sa présentation, son interactivité, puis au développement d’interfaces modernes avec React.

---

## Vue d’ensemble

| Parcours | Niveaux | Leçons | Exercices | Projets |
|---|---:|---:|---:|---:|
| HTML | 5 | 45 | 180 | 5 |
| CSS | 5 | 45 | 180 | 5 |
| JavaScript | 6 | 41 | 198 | 8 |
| React + Vite | 5 | 38 | 152 | 5 |
| **Total** | **21** | **169** | **710** | **23** |

La plateforme inclut également des évaluations de fin de niveau, des révisions ciblées, des indices progressifs, des corrections expliquées et des environnements de code interactifs.

---

## Lancer le projet

Aucune installation n’est nécessaire.

1. Télécharge ou décompresse le projet.
2. Ouvre `index.html` dans un navigateur moderne.
3. Choisis un parcours depuis l’accueil.

La progression est enregistrée localement avec `localStorage`.

> Utilise de préférence le même navigateur pour conserver la même progression. Si `localStorage` est désactivé ou bloqué, la progression ne pourra pas être conservée.

---

## Parcours d’apprentissage

### 1. HTML

Le parcours HTML apprend à construire des documents structurés, sémantiques, accessibles et prêts à recevoir du CSS et du JavaScript.

| Niveau | Contenu |
|---|---|
| 1 — Les bases du HTML | document HTML, balises, attributs, titres, paragraphes, liens, images, listes |
| 2 — Structurer une vraie page | `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, figures et navigation |
| 3 — Formulaires, tableaux et médias | formulaires accessibles, contraintes natives, tableaux, audio, vidéo, iframe |
| 4 — HTML sémantique & accessibilité | landmarks, hiérarchie, boutons vs liens, ARIA raisonné, `lang`, skip links |
| 5 — HTML professionnel & intégration | métadonnées, SEO, Open Graph, chemins, fichiers, CSS/JS, performance et validation |

**Projets HTML :**

1. Page de présentation personnelle
2. Page de blog structurée
3. Page avec formulaire, tableau et média
4. Page accessible et sémantique
5. Structure complète d’un site professionnel

Les ateliers HTML utilisent une **preview réelle** et une validation basée sur le DOM : plusieurs solutions différentes peuvent être acceptées si leur structure est correcte.

---

### 2. CSS

Le parcours CSS part des bases visuelles et va jusqu’à l’architecture CSS professionnelle.

| Niveau | Contenu |
|---|---|
| 1 — Les bases de CSS | syntaxe, sélecteurs, couleurs, typographie, dimensions, box model, unités |
| 2 — Mise en page | `display`, `box-sizing`, positionnement, `z-index`, Flexbox |
| 3 — Grid & Responsive Design | Grid, `fr`, `repeat()`, `minmax()`, media queries, mobile-first, `clamp()` |
| 4 — CSS intermédiaire / avancé | pseudo-classes, pseudo-éléments, variables, transitions, transforms, animations |
| 5 — CSS professionnel | cascade, spécificité, héritage, `@layer`, design tokens, accessibilité, performance |

**Projets CSS :**

1. Carte de profil complète
2. Page complète avec Flexbox
3. Landing page responsive Grid + Flexbox
4. Bibliothèque de composants interactifs
5. Dashboard professionnel thémable

Les exercices CSS utilisent le navigateur simulé commun avec **preview live**, modes **mobile / tablette / desktop** et validation via les styles calculés lorsque c’est pertinent.

---

### 3. JavaScript

JavaScript reste le parcours pédagogique de référence historique de Cahier Code.

| Niveau | Contenu | Leçons | Exercices |
|---|---|---:|---:|
| 1 — Fondamentaux JavaScript | variables, types, opérateurs, conditions, boucles, fonctions, tableaux, objets, portée | 9 | 35 |
| 2 — JavaScript dans le navigateur | navigateur, liaison HTML/JS, console, `window`, `document` | 5 | 20 |
| 3 — Le DOM | sélection, contenu, attributs, classes, styles, création et suppression d’éléments | 8 | 40 |
| 4 — Les événements | `addEventListener`, souris, clavier, formulaires, objet `event` | 6 | 36 |
| 5 — Interactivité | état d’interface, accordéon, menu, modale, onglets, validation dynamique | 7 | 35 |
| 6 — JavaScript asynchrone | timers, promesses, `async/await`, JSON, `fetch`, API | 6 | 32 |

**Projets JavaScript :** compteur, mode sombre, to-do list, quiz interactif, calculatrice, validation de formulaire, mini-site interactif et application météo.

L’exécution du code JavaScript utilisateur est isolée afin d’éviter qu’une boucle infinie bloque toute l’application.

---

### 4. React + Vite

Le parcours React apprend progressivement JSX, composants, state, effets, architecture et pratiques de production.

| Niveau | Contenu |
|---|---|
| 1 — Découvrir React | React vs Vite, JSX, composants, props, événements, `useState` |
| 2 — Fondamentaux React | rendu conditionnel, listes, formulaires contrôlés, lifting state |
| 3 — React intermédiaire | `useEffect`, fetch, loading/error, hooks personnalisés, Context, routage |
| 4 — React avancé | architecture, `useRef`, mémoïsation, erreurs, tests, accessibilité, Vite avancé |
| 5 — React professionnel | TypeScript, dépendances, intégration, résilience, sécurité, performance, build |

**Projets React :**

1. Mini application de profils
2. Task Manager React
3. API Explorer
4. Dashboard multi-pages
5. Application React de production

Le **React Studio** reproduit pédagogiquement plusieurs comportements d’un environnement React/Vite : fichiers virtuels, terminal contrôlé, navigateur, console et interactions React prises en charge par le runtime pédagogique.

> Ce studio n’est pas un bundler Vite complet. Les notions avancées comme TypeScript, certains outils de test ou le build de production peuvent être validées structurellement lorsqu’elles dépassent les capacités du runtime embarqué.

---

## Expérience pédagogique

Tous les parcours réutilisent autant que possible les mêmes composants et conventions.

### Cours

Une leçon peut contenir :

- objectif clair ;
- explications progressives ;
- exemples de code ;
- erreurs fréquentes ;
- raccourcis VS Code ;
- atelier interactif ;
- exercices directement liés à la notion ;
- navigation vers la suite du niveau.

### Exercices

La plateforme prend en charge plusieurs formats :

- QCM ;
- vrai / faux ;
- compléter du code ;
- prédire ou analyser un résultat ;
- debugging ;
- écriture de code ;
- ateliers multi-fichiers ;
- challenges visuels ou structurels.

Les exercices disposent d’**indices progressifs** et de **corrections expliquées**.

### Validation

La validation cherche à vérifier le résultat plutôt qu’une copie exacte de la correction :

- DOM et attributs pour HTML ;
- styles calculés et structure CSS pour CSS ;
- sortie et comportement pour JavaScript ;
- structure et interactions prises en charge pour React.

Cette approche permet d’accepter plusieurs solutions correctes lorsque le problème le permet.

---

## Environnements interactifs

### Lab partagé

`js/lab.js` fournit l’environnement interactif commun :

- éditeur multi-fichiers ;
- iframe sandboxée ;
- preview live ;
- console ;
- validation automatique ;
- reset ;
- modes de largeur pour les exercices responsive.

HTML et CSS réutilisent directement ce moteur. JavaScript l’utilise également pour les exercices nécessitant une vraie page.

### Éditeur

`js/editor.js` fournit plusieurs aides inspirées de VS Code :

- fermeture automatique de certains caractères ;
- indentation ;
- suggestions ;
- snippets ;
- raccourcis utiles selon les exercices.

### React Studio

`js/react-studio.js` ajoute les besoins spécifiques au parcours React :

- système de fichiers virtuel ;
- terminal Vite pédagogique ;
- preview ;
- console ;
- interactions React simulées ou exécutées selon la notion.

---

## Progression et révisions

Chaque parcours conserve sa progression indépendamment.

La plateforme suit notamment :

- leçons terminées ;
- exercices réussis ;
- exercices à revoir ;
- erreurs par notion ;
- évaluations ;
- projets terminés ;
- progression globale et par niveau.

Les pages **Révisions** de React, CSS et HTML centralisent les éléments réellement à retravailler : exercices échoués ou non maîtrisés, notions fragiles, évaluations et projets.

Les pages **Projets** permettent de choisir librement le projet à ouvrir au lieu de renvoyer systématiquement vers le premier.

---

## Interface et thèmes

Le hub présente les parcours dans l’ordre :

```text
HTML → CSS → JavaScript → React
```

Sur desktop, les quatre cartes sont disposées dans une grille 2 × 2. L’interface s’adapte ensuite aux écrans plus étroits.

Le site possède :

- un **mode sombre** ;
- un **mode clair** ;
- une palette adaptée séparément à chaque thème ;
- une couleur d’accent propre à chaque parcours ;
- des contrastes de boutons adaptés au thème ;
- une navigation responsive.

---

## Architecture du projet

```text
cahier-code/
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── storage.js
│   ├── runner.js
│   ├── courses.js
│   ├── exercises.js
│   ├── projects.js
│   ├── progress.js
│   │
│   ├── react-course.js
│   ├── react-studio.js
│   │
│   ├── css-course.js
│   ├── css-level3.js
│   ├── css-level4.js
│   ├── css-level5.js
│   ├── css-studio.js
│   │
│   ├── html-course.js
│   ├── html-level2.js
│   ├── html-level3.js
│   ├── html-level4.js
│   ├── html-level5.js
│   ├── html-studio.js
│   │
│   ├── editor.js
│   ├── lab.js
│   ├── ui.js
│   └── app.js
│
├── AUDIT-*.md
└── README.md
```

### Rôle des principaux fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | point d’entrée et ordre de chargement des scripts |
| `css/style.css` | design global, thèmes clair/sombre et responsive |
| `js/app.js` | routeur, dashboard, pages de cours, projets, révisions et progression |
| `js/ui.js` | composants UI et rendu des exercices |
| `js/lab.js` | environnement multi-fichiers, preview et console |
| `js/editor.js` | comportement de l’éditeur de code |
| `js/storage.js` | sauvegarde locale de la progression |
| `js/runner.js` | exécution JavaScript isolée et protection contre les boucles infinies |
| `js/courses.js` | données pédagogiques JavaScript |
| `js/exercises.js` | exercices JavaScript |
| `js/projects.js` | projets JavaScript |
| `js/react-course.js` | parcours, exercices, évaluations et projets React |
| `js/css-course.js` + `css-level*.js` | parcours CSS |
| `js/html-course.js` + `html-level*.js` | parcours HTML |
| `js/*-studio.js` | environnements interactifs spécialisés |

Les fichiers sont chargés directement par `index.html`. L’ordre de chargement est important, car certains modules étendent des structures déclarées dans les fichiers chargés avant eux.

---

## Données et sauvegarde

La progression est stockée côté navigateur via `localStorage`.

Les parcours HTML, CSS et React possèdent leurs propres branches de progression afin d’éviter qu’un parcours ne modifie les résultats d’un autre.

Les brouillons de certains projets ou ateliers peuvent également être sauvegardés localement selon le parcours.

Aucun compte utilisateur ni serveur n’est nécessaire pour utiliser le projet.

---

## Limites connues

- Le projet fonctionne entièrement côté navigateur : la sauvegarde dépend donc de `localStorage`.
- L’iframe des ateliers est volontairement sandboxée.
- `alert`, `confirm` et `prompt` sont neutralisés ou redirigés dans l’environnement pédagogique lorsque nécessaire.
- Les navigations ou soumissions susceptibles de faire quitter l’atelier peuvent être interceptées.
- Le `fetch` utilisé dans certains exercices JavaScript peut cibler une API pédagogique simulée plutôt qu’Internet.
- La protection contre les boucles infinies transforme le code avant exécution pour éviter de figer l’application.
- Le React Studio est un environnement pédagogique contrôlé, pas une installation complète de Vite/Node dans le navigateur.

---

## Audits et contrôles

Le dépôt contient plusieurs fichiers `AUDIT-*.md` retraçant les contrôles effectués lors de la construction des parcours :

- richesse pédagogique ;
- interactivité ;
- cohérence des exercices ;
- IDs dupliqués ou exercices orphelins ;
- progression ;
- projets et évaluations ;
- régressions entre parcours ;
- évolutions du design.

Ils servent de documentation technique complémentaire au README, mais ne sont pas nécessaires pour utiliser la plateforme.

---

## Étudier le code de Cahier Code

Pour comprendre progressivement le fonctionnement interne du projet :

1. commence par `js/storage.js` pour la persistance avec `localStorage` ;
2. lis `js/ui.js` et la fonction de création d’éléments ;
3. regarde le routeur dans `js/app.js` ;
4. étudie le rendu des exercices dans `js/ui.js` ;
5. inspecte `js/lab.js` pour comprendre la preview sandboxée ;
6. termine par `js/runner.js` et les studios spécialisés.

Le projet lui-même peut donc aussi servir d’exemple d’application JavaScript vanilla relativement importante.

---

## Ajouter ou modifier du contenu

Avant d’ajouter un nouveau cours ou exercice, respecte les conventions du parcours concerné :

- IDs uniques ;
- niveau et leçon correctement reliés ;
- indices progressifs ;
- solution expliquée ;
- validation sémantique ou comportementale lorsque possible ;
- aucun nouveau moteur si un composant partagé répond déjà au besoin.

Après une modification, vérifie au minimum :

```bash
node --check js/*.js
```

Puis contrôle les routes, la progression, les projets, les révisions et les ateliers concernés dans le navigateur.

---

## État du projet

Les quatre parcours principaux sont complets :

- ✅ HTML
- ✅ CSS
- ✅ JavaScript
- ✅ React + Vite

Le projet contient actuellement **169 leçons, 710 exercices et 23 projets** répartis sur **21 niveaux**.
