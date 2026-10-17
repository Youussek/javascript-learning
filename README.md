# Cahier Code

Plateforme d’apprentissage interactive du développement web, construite en **HTML, CSS et JavaScript vanilla**.

Cahier Code regroupe **sept parcours**, organisés dans un ordre pédagogique logique :

> **HTML → CSS → JavaScript → React + Vite → TypeScript → Node.js → SQL**

L’objectif est de proposer plusieurs chemins cohérents : structure et présentation du Web avec HTML/CSS, interactivité avec JavaScript, interfaces modernes avec React, typage avec TypeScript, backend avec Node.js et données relationnelles avec SQL.

---

## Vue d’ensemble

| Parcours | Niveaux | Leçons | Exercices | Projets |
|---|---:|---:|---:|---:|
| HTML | 5 | 45 | 180 | 5 |
| CSS | 5 | 45 | 180 | 5 |
| JavaScript | 6 | 41 | 198 | 8 |
| TypeScript | 5 | 45 | 180 | 5 |
| Node.js | 5 | 45 | 180 | 5 |
| SQL | 5 | 45 | 180 | 5 |
| React + Vite | 5 | 38 | 152 | 5 |
| **Total disponible** | **36** | **304** | **1 250** | **38** |

La plateforme inclut également des évaluations de fin de niveau, des révisions ciblées, des indices progressifs, des corrections expliquées et des environnements de code interactifs.

---

## Lancer le projet

Aucune installation n’est nécessaire.

1. Télécharge ou décompresse le projet.
2. Ouvre `index.html` dans un navigateur moderne.
3. Choisis un parcours depuis l’accueil.

La progression est enregistrée localement avec `localStorage`.

> Le **SQL Studio** charge actuellement `sql.js 1.13.0` depuis cdnjs. Une connexion réseau est donc nécessaire au premier chargement du moteur SQL. Les autres parcours continuent de fonctionner sans cette ressource.

> Utilise de préférence le même navigateur pour conserver la même progression. Si `localStorage` est désactivé ou bloqué, la progression ne pourra pas être conservée.

---


## Accueil et navigation multi-parcours

La racine `#/` est désormais un **accueil neutre** : aucun langage n'est sélectionné automatiquement, y compris lors d'une première visite. Les sept parcours disponibles sont immédiatement visibles et utilisent directement les métadonnées de `LEARNING_PATHS`.

Chaque carte affiche notamment :

- catégorie et difficulté ;
- état `Disponible`, `En cours` ou `Terminé` ;
- progression ;
- niveau actuel ;
- nombre de cours et de projets ;
- dernière leçon connue ;
- action `Commencer`, `Continuer` ou `Revoir`.

Un **dashboard global** est disponible sur `#/dashboard` pour retrouver les parcours déjà commencés sans mélanger cet usage avec la découverte des langages.

Le dernier parcours ouvert peut être mémorisé dans `lastActiveLearningPath` uniquement pour proposer une reprise explicite sur l'accueil. Cette valeur **ne déclenche jamais de redirection automatique**. La progression propre à chaque parcours reste inchangée lorsqu'on passe d'un langage à un autre.

Un sélecteur global dans la barre latérale permet de changer de parcours à tout moment. Sur mobile, l'accès **Changer de parcours** reste directement disponible dans la barre supérieure.

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

### 4. TypeScript

Le parcours TypeScript est construit directement sur JavaScript et va du premier diagnostic jusqu’à l’architecture professionnelle d’une codebase stricte.

#### Niveau 1 — Découvrir TypeScript

- JavaScript vs TypeScript ;
- typage statique ;
- compilation `.ts` → `.js` ;
- terminal `tsc` pédagogique contrôlé ;
- `string`, `number`, `boolean` ;
- inférence vs annotations ;
- fonctions typées ;
- lecture des diagnostics ;
- tableaux `T[]` ;
- objets simples ;
- assemblage d’un premier programme typé.

Le Niveau 1 contient **9 leçons, 36 exercices, 10 questions d’évaluation, 9 presets du Playground TypeScript et 1 projet final**.

Le **TypeScript Studio** affiche simultanément :

- le code TypeScript ;
- les diagnostics réels du compilateur ;
- le JavaScript compilé ;
- une console d’exécution ;
- un terminal pédagogique pour `npm install -D typescript`, `npx tsc --init`, `npx tsc`, `npx tsc --noEmit` et `npx tsc -v`.

Le projet ne possédait auparavant **aucune dépendance TypeScript ni `package.json`**. Pour garantir un fonctionnement hors ligne sans changer la stack vanilla, le Niveau 1 embarque localement **TypeScript 5.8.3**, qui est utilisé pour les diagnostics et la transpilation. Le terminal reste simulé : aucune commande système n’est exécutée depuis le navigateur.

**Projet TypeScript Niveau 1 :** premier programme TypeScript typé, compilable sans diagnostic.

#### Niveau 2 — Types et structures

- tableaux `T[]` et `Array<T>` ;
- tuples ;
- objets et formes réutilisables ;
- `type` aliases ;
- `interface` et comparaison raisonnée avec `type` ;
- propriétés optionnelles `?` ;
- `readonly` ;
- union types et literal types ;
- `null` / `undefined` avec mode strict ;
- paramètres optionnels et valeurs par défaut ;
- assemblage d'un gestionnaire de données typé.

Le Niveau 2 contient **9 leçons, 36 exercices, 10 questions d’évaluation, 9 presets interactifs et 1 projet final**.

**Projet TypeScript Niveau 2 :** gestionnaire de tâches typé avec `Status`, `Task`, `readonly`, propriété optionnelle et fonction `tasksByStatus`.

#### Niveau 3 — TypeScript intermédiaire

- narrowing avec `typeof`, `in` et `instanceof` ;
- unions discriminées ;
- type guards personnalisés ;
- `unknown` vs `any` ;
- `never` et exhaustivité ;
- enums et alternatives ;
- modules et `import type` ;
- classes, visibilité et `readonly` ;
- `Promise<T>` et fonctions `async` ;
- données externes : typage statique vs validation runtime.

Le Niveau 3 contient **9 leçons, 36 exercices, 10 questions d’évaluation, 9 presets interactifs et 1 projet final**.

**Projet TypeScript Niveau 3 :** gestionnaire d’états et de données externes avec union discriminée, `unknown`, type guard et `Promise<LoadState>`.

#### Niveau 4 — TypeScript avancé

- generics et inférence de paramètres de type ;
- contraintes génériques avec `extends` ;
- `keyof` et indexed access `T[K]` ;
- `typeof` dans le système de types ;
- mapped types ;
- conditional types et `infer` ;
- utility types (`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters`, etc.) ;
- assertions et `satisfies` ;
- overloads et fonctions avancées.

Le Niveau 4 contient **9 leçons, 36 exercices, 10 questions d’évaluation, 9 presets interactifs et 1 projet final**.

**Projet TypeScript Niveau 4 :** couche de données générique avec `Repository<T extends Entity>`, `keyof`, `T[K]`, `Partial`, `Omit` et `Pick`.

#### Niveau 5 — TypeScript professionnel

- `tsconfig.json`, `strict`, `target`, `module` et options de sûreté ;
- architecture des types et modèles de domaine ;
- frontières API avec `unknown` et validation runtime ;
- erreurs typées avec unions discriminées `Result<T>` ;
- migration progressive JavaScript → TypeScript ;
- complémentarité typecheck / tests runtime ;
- contrats de props et callbacks pour React ;
- lisibilité, inférence et maintenabilité ;
- assemblage d’une petite architecture TypeScript professionnelle.

Le Niveau 5 contient **9 leçons, 36 exercices, 10 questions d’évaluation, 9 presets interactifs et 1 projet final**.

**Projet TypeScript Niveau 5 :** service TypeScript professionnel avec modèle `User`, validation runtime, `Result<T>`, repository générique et fonctions métier sans `any` ni assertion forcée.

Le parcours TypeScript complet totalise **45 leçons, 180 exercices, 50 questions d’évaluation, 45 presets interactifs et 5 projets**.

---


### 5. Node.js

Node.js est présenté comme la continuité de JavaScript hors du navigateur. Le parcours complet va du premier script CLI à un backend structuré, testé, observable et préparé pour la production.

#### Niveau 1 — Découvrir Node.js

- Node.js, V8 et notion de runtime ;
- différences navigateur / Node.js ;
- terminal `node` / `npm` ;
- premier script avec `node app.js` ;
- `process.argv` ;
- `process.cwd()`, `process.env` et `process.exitCode` ;
- `npm init -y` et `package.json` ;
- scripts npm ;
- première introduction cohérente à ESM avec `import` / `export` ;
- construction d'un premier CLI.

Le Niveau 1 contient **9 leçons, 36 exercices, 10 questions d'évaluation, 9 Node Labs et 1 projet final**.

Le **Node Lab** réunit :

- un explorateur de fichiers virtuel ;
- un éditeur partagé avec les autres parcours ;
- un terminal pédagogique ;
- un répertoire courant réellement suivi dans la simulation ;
- les commandes `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat` ;
- `node --version`, `npm --version`, `npm init -y`, `npm run` ;
- l'exécution sandboxée de scripts JavaScript ;
- des arguments CLI cohérents via `process.argv`.

Les fichiers créés depuis le terminal apparaissent dans l'explorateur et les modifications faites dans l'éditeur sont utilisées par `node app.js`. Aucune commande système réelle et aucun fichier de la machine ne sont accessibles depuis le navigateur.

**Projet Node.js Niveau 1 :** CLI de bienvenue utilisant `process.argv`, conversion d'arguments et script npm `start`.

#### Niveau 2 — Modules, fichiers et asynchronisme

- ESM vs CommonJS ;
- `package.json` et `"type": "module"` ;
- `node:path` avec `join`, `resolve`, `basename`, `extname` ;
- lecture de fichiers avec `node:fs/promises` ;
- `writeFile`, `appendFile`, `mkdir`, `readdir` ;
- lecture et écriture JSON ;
- Promises et `async/await` appliqués aux fichiers ;
- gestion de `ENOENT` et des erreurs de parsing ;
- assemblage d'un CLI persistant.

Le Niveau 2 contient **9 leçons, 36 exercices, 10 questions d'évaluation, 9 Node Labs et 1 projet final**.

Le Node Lab prend désormais en charge des versions sandboxées de `node:path`, `node:fs` et `node:fs/promises`. Les lectures et écritures modifient uniquement le système de fichiers virtuel du cours ; aucun fichier réel de la machine n'est accessible.

**Projet Node.js Niveau 2 :** gestionnaire de tâches en ligne de commande avec persistance dans `data/tasks.json`, commandes `add` / `list`, `async/await` et gestion des erreurs.

#### Niveau 3 — Serveurs HTTP et API

- `node:http` et `http.createServer()` ;
- requête, réponse, méthode, URL et headers ;
- GET, POST, PUT, PATCH et DELETE ;
- routage manuel et fallback 404 ;
- status codes 200, 201, 204, 400, 404 et 500 ;
- réponses JSON avec `Content-Type` et `JSON.stringify()` ;
- parsing des URL et query strings ;
- lecture du body via les événements `data` / `end` ;
- assemblage d’une petite API REST.

Le Niveau 3 contient **9 leçons, 36 exercices, 10 questions d’évaluation, 9 Node Labs et 1 projet final**. Le Node Lab ajoute un **client HTTP pédagogique** séparé du terminal : méthode, URL, body, status, headers et réponse.

**Projet Node.js Niveau 3 :** API REST utilisateurs native avec GET/POST, validation du body, JSON et codes HTTP cohérents.

#### Niveau 4 — Backend structuré et données

- architecture routes / controllers / services / repositories ;
- configuration avec `process.env` ;
- middleware et traitements transversaux ;
- validation des données entrantes ;
- repository JSON et séparation du stockage ;
- CRUD ;
- gestion centralisée des erreurs ;
- logs et sécurité de base ;
- assemblage d’une API backend structurée.

**Projet Node.js Niveau 4 :** API utilisateurs structurée avec service, repository JSON, validation, erreurs HTTP cohérentes, logs sobres et persistance.

#### Niveau 5 — Node.js professionnel

- architecture professionnelle et composition des dépendances ;
- pont Node.js + TypeScript strict ;
- tests avec `node:test` et `node:assert/strict` ;
- validation, secrets, CORS et erreurs sobres ;
- event loop et travail non bloquant ;
- streams, buffers et gestion de gros volumes ;
- `SIGINT`, `SIGTERM` et graceful shutdown ;
- health checks, logs, monitoring et configuration de production ;
- dépendances, lockfile, `npm audit` et maintenance.

Le Niveau 5 contient **9 leçons, 36 exercices, 10 questions d’évaluation, 9 Node Labs et 1 projet final**.

Le Node Lab prend également en charge au niveau professionnel `node:test`, `node:assert/strict`, `Buffer`, `createReadStream()`, les signaux pédagogiques, `npm test`, l’installation/désinstallation sandboxée de dépendances et `npm audit`.

**Projet Node.js Niveau 5 :** backend utilisateurs avec health check, validation, contrat TypeScript strict, tests natifs Node, gestion d’erreurs sobre, shutdown propre et scripts npm.

---

### 6. SQL

SQL est enseigné comme un langage de requêtes et de gestion de données relationnelles. Les niveaux sont développés verticalement : seuls les niveaux entièrement fonctionnels sont exposés.

#### Niveau 1 — Découvrir SQL et lire des données

- base relationnelle, SGBD, table, ligne, colonne et schéma ;
- types de données et clé primaire ;
- `SELECT *` ;
- sélection ciblée de colonnes ;
- alias avec `AS` ;
- `DISTINCT` ;
- `LIMIT` ;
- lecture des résultats ;
- diagnostics SQLite et debugging ;
- exploration métier d'une petite base utilisateurs.

Le Niveau 1 contient **9 leçons, 36 exercices, 10 questions d'évaluation, 9 SQL Studios et 1 projet final**.

Le **SQL Studio** utilise **SQLite via sql.js 1.13.0** et propose :

- une vue des tables ;
- le schéma d'une table (`PRAGMA table_info`) ;
- un aperçu de ses données ;
- un éditeur SQL ;
- exécution avec `Ctrl/Cmd + Entrée` ;
- un tableau de résultat généré par SQLite ;
- les erreurs SQLite visibles ;
- un bouton de réinitialisation de la base.

Les exercices SQL de code sont validés prioritairement par **résultat** (colonnes, nombre de lignes et valeurs attendues) plutôt que par comparaison textuelle de la requête.

**Projet SQL Niveau 1 :** explorateur de la base utilisateurs avec sélection ciblée, alias et limite de résultat.

#### Niveau 2 — Filtrer, trier et agréger

Le Niveau 2 approfondit l'analyse des données avec :

- `WHERE` et les opérateurs de comparaison ;
- `AND`, `OR`, `NOT` et les parenthèses ;
- `IN` et `BETWEEN` ;
- `LIKE` et les motifs texte ;
- `IS NULL` / `IS NOT NULL` ;
- `ORDER BY` ;
- `LIMIT` + `OFFSET` pour la pagination ;
- `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` ;
- `GROUP BY` et `HAVING`.

Le dataset ajoute une table `sales` afin de travailler sur des besoins métier réalistes : chiffre d'affaires, nombre de ventes, moyenne, classement et analyse par ville.

Le Niveau 2 contient **9 leçons, 36 exercices, 10 questions d'évaluation, 9 SQL Studios et 1 projet final**.

**Projet SQL Niveau 2 :** analyser les ventes payées par ville avec `WHERE`, `COUNT`, `SUM`, `GROUP BY`, `HAVING` et `ORDER BY`.

#### Niveau 3 — Relations et JOIN

Le Niveau 3 apprend à raisonner sur plusieurs tables reliées :

- clés primaires et clés étrangères ;
- relations 1:1, 1:N et N:N ;
- `INNER JOIN` ;
- `LEFT JOIN` ;
- alias de tables et colonnes qualifiées ;
- JOIN multiples via une table d'association ;
- `JOIN` + `WHERE` ;
- `JOIN` + `GROUP BY` ;
- requêtes métier multi-tables.

Le dataset e-commerce contient `users`, `orders`, `products` et `order_items`. Le SQL Studio détecte aussi les clés étrangères avec SQLite et affiche une vue relationnelle telle que `orders.user_id → users.id`.

Le Niveau 3 contient **9 leçons, 36 exercices, 10 questions d'évaluation, 9 SQL Studios et 1 projet final**.

**Projet SQL Niveau 3 :** analyser les commandes payées en reliant utilisateurs, commandes, lignes de commande et produits, avec `COUNT(DISTINCT ...)`, agrégations et tri métier.

#### Niveau 4 — Modifier et structurer les données

Le Niveau 4 passe de la lecture à l'écriture et à la conception de schémas :

- `INSERT` et insertions multiples ;
- `UPDATE` ciblé avec `WHERE` ;
- `DELETE` et sécurité des suppressions ;
- `CREATE TABLE` et types SQLite ;
- contraintes `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT` ;
- `ALTER TABLE` et évolution du schéma ;
- transactions `BEGIN`, `COMMIT`, `ROLLBACK` ;
- intégrité référentielle ;
- assemblage d'un CRUD relationnel complet.

Les ateliers restent isolés dans SQLite et peuvent être remis à leur état initial avec **Réinitialiser la base**, ce qui permet d'expérimenter sans casser les exercices suivants. Les exercices d'écriture se terminent par une lecture de contrôle afin de valider l'état réellement obtenu dans la base.

Le Niveau 4 contient **9 leçons, 36 exercices, 10 questions d'évaluation, 9 SQL Studios et 1 projet final**.

**Projet SQL Niveau 4 :** concevoir un schéma `teams` / `members` avec clés, contraintes et relation, puis appliquer INSERT, UPDATE et DELETE avant de vérifier l'état final par JOIN.

#### Niveau 5 — SQL professionnel et optimisation

Le Niveau 5 termine le parcours avec des outils utilisés dans de vraies analyses et codebases :

- sous-requêtes ;
- CTE avec `WITH` ;
- `CASE` et `COALESCE` ;
- window functions : `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `OVER`, `PARTITION BY` ;
- index et compromis lecture / écriture ;
- `EXPLAIN QUERY PLAN` avec le plan SQLite réel ;
- normalisation et anti-patterns de modélisation ;
- transactions métier et concurrence conceptuelle ;
- requêtes paramétrées et défense contre l'injection SQL ;
- pont avec Node.js sans transformer SQL en cours backend.

Le SQL Studio peut désormais afficher un panneau **PARAMÈTRES JSON** lorsqu'un atelier travaille avec des placeholders `?`. Les valeurs sont liées séparément du texte SQL au lieu d'être concaténées dans la requête.

Le Niveau 5 contient **9 leçons, 36 exercices, 10 questions d'évaluation, 9 SQL Studios et 1 projet final**.

**Projet SQL Niveau 5 :** construire une analyse professionnelle des clients payants avec index, CTE, `CASE`, `COALESCE` et classement par window function.

Le parcours SQL complet totalise **45 leçons, 180 exercices, 50 questions d'évaluation, 45 SQL Studios et 5 projets**.

> Dialecte pédagogique actuel : **SQLite**. Le moteur `sql-asm.js` est chargé depuis cdnjs au démarrage du SQL Studio. Les différences avec PostgreSQL ou d'autres dialectes seront signalées lorsqu'elles deviennent pertinentes.

---

### 7. React + Vite

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
- diagnostics du compilateur, AST et compilation pour TypeScript ;
- terminal, fichiers virtuels et comportement CLI pour Node.js ;
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

### TypeScript Studio

`js/typescript-studio.js` ajoute uniquement les capacités absentes du Lab générique :

- analyse sémantique TypeScript ;
- diagnostics avec code TS et numéro de ligne ;
- JavaScript compilé visible ;
- exécution du JavaScript compilé dans l’environnement sandboxé existant ;
- terminal `tsc` contrôlé ;
- reset ;
- validations d’exercices basées sur la compilation et, lorsque pertinent, l’AST TypeScript plutôt que sur une simple comparaison textuelle.

Le compilateur est chargé depuis `vendor/typescript-5.8.3.js`. Sa licence est conservée dans `vendor/TYPESCRIPT-LICENSE.txt`.

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
│   ├── typescript-course.js
│   ├── typescript-studio.js
│   │
│   ├── node-course.js
│   ├── node-studio.js
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
├── vendor/
│   ├── typescript-5.8.3.js
│   └── TYPESCRIPT-LICENSE.txt
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
| `js/typescript-course.js` | Niveau 1 TypeScript : leçons, exercices, évaluation, projet et presets |
| `js/typescript-level2.js` | Niveau 2 TypeScript : types structurés, 36 exercices, évaluation, projet et presets |
| `js/typescript-level3.js` | Niveau 3 TypeScript : narrowing, guards, `unknown`, `never`, classes, async/API, 36 exercices, évaluation, projet et presets |
| `js/typescript-level4.js` | Niveau 4 TypeScript : generics, `keyof`, types dérivés, utilities, `satisfies`, overloads, 36 exercices, évaluation, projet et presets |
| `js/typescript-level5.js` | Niveau 5 TypeScript : configuration stricte, architecture, API/runtime, erreurs, migration, tests, React et qualité professionnelle |
| `js/typescript-studio.js` | diagnostics TypeScript, compilation JS, terminal pédagogique et validation AST |
| `vendor/typescript-5.8.3.js` | compilateur TypeScript embarqué pour fonctionnement hors ligne |
| `js/node-course.js` | Socle Node.js et Niveau 1 : runtime, terminal, process, npm, CLI |
| `js/node-level2.js` | Niveau 2 Node.js : modules, path, fichiers, JSON, async/await, erreurs et projet persistant |
| `js/node-level3.js` | Niveau 3 Node.js : serveur HTTP, routage, JSON API, URL, body et projet REST |
| `js/node-level4.js` | Niveau 4 Node.js : architecture backend, configuration, validation, CRUD, erreurs, logs et sécurité |
| `js/node-level5.js` | Niveau 5 Node.js : architecture pro, TypeScript, tests, sécurité, event loop, streams, signaux, production et dépendances |
| `js/sql-course.js` | Parcours SQL et Niveau 1 : dataset SQLite, leçons, exercices, évaluation, projet et presets |
| `js/sql-level2.js` | Niveau 2 SQL : filtres, tris, agrégats, GROUP BY/HAVING, dataset analytique, exercices et projet |
| `js/sql-level3.js` | Niveau 3 SQL : relations, clés étrangères, JOIN, dataset e-commerce, exercices et projet multi-tables |
| `js/sql-level4.js` | Niveau 4 SQL : INSERT/UPDATE/DELETE, schémas, contraintes, ALTER TABLE, transactions, intégrité référentielle et projet CRUD |
| `js/sql-level5.js` | Niveau 5 SQL : sous-requêtes, CTE, CASE/COALESCE, window functions, index, EXPLAIN, normalisation, transactions et sécurité |
| `js/sql-studio.js` | SQL Studio : SQLite via sql.js, tables, schéma, relations, exécution, résultats, diagnostics, reset et paramètres liés |
| `js/node-studio.js` | système de fichiers virtuel, terminal Node/npm, exécution sandboxée et client HTTP pédagogique |
| `js/react-course.js` | parcours, exercices, évaluations et projets React |
| `js/css-course.js` + `css-level*.js` | parcours CSS |
| `js/html-course.js` + `html-level*.js` | parcours HTML |
| `js/*-studio.js` | environnements interactifs spécialisés |

Les fichiers sont chargés directement par `index.html`. L’ordre de chargement est important, car certains modules étendent des structures déclarées dans les fichiers chargés avant eux.

---

## Données et sauvegarde

La progression est stockée côté navigateur via `localStorage`.

Les parcours HTML, CSS, TypeScript, Node.js, SQL et React possèdent leurs propres branches de progression afin d’éviter qu’un parcours ne modifie les résultats d’un autre.

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

Les parcours HTML, CSS, JavaScript, TypeScript, Node.js, SQL et React + Vite sont complets.

Le projet contient actuellement **304 leçons, 1 250 exercices et 38 projets** répartis sur **36 niveaux**.

Le parcours TypeScript est lui aussi finalisé : **5 niveaux, 45 leçons, 180 exercices, 50 questions d’évaluation, 45 presets interactifs et 5 projets**.


### Aide contextuelle de code façon VS Code

L’aide contextuelle est globale sur les sept parcours : HTML, CSS, JavaScript, React, TypeScript, Node.js et SQL. Elle analyse automatiquement tous les `<pre>` et `<code>` créés dans les cours (exemples, code expliqué, corrections, exercices à trous, snippets et sorties de code pertinentes), y compris ceux ajoutés après un changement de route. Sur desktop, le survol ou le focus d’un token reconnu affiche sa fiche ; sur mobile, un tap l’épingle. Tous les éditeurs utilisant `enhanceEditor()` reçoivent aussi l’aide au survol sur desktop, au clic/tap et via `F1`, ce qui couvre notamment les Labs et le SQL Studio. Le dictionnaire inclut les balises/attributs HTML, propriétés CSS, APIs JavaScript/DOM, React/Vite, TypeScript, commandes terminal/npm, Node.js et les mots-clés SQL du parcours.


## Mode débutant

Cahier Code possède désormais un mode débutant global et optionnel. Il est mémorisé dans l'état local et fonctionne sur tous les parcours (HTML, CSS, JavaScript, React, TypeScript, Node.js et SQL). Lorsqu'il est activé, les pages de cours ajoutent un objectif reformulé, une méthode en quatre étapes propre au langage et un mini-vocabulaire construit depuis les commandes réellement présentes dans la leçon. Les pages d'exercices ajoutent une méthode guidée sans révéler la solution. Le mode normal reste inchangé.

## Mode focus

Cahier Code propose un **Mode focus** global, compatible avec tous les parcours et avec le Mode débutant. Il est mémorisé dans la progression locale mais ne s'applique visuellement qu'aux pages d'apprentissage (leçons, exercices, projets et évaluations).

En Mode focus :
- la sidebar et la topbar sont masquées ;
- les breadcrumbs disparaissent ;
- le contenu est recentré sur une largeur de lecture confortable ;
- les éditeurs, Labs, Studios, aides contextuelles et aides du Mode débutant restent disponibles ;
- un contrôle flottant permet de quitter immédiatement le mode ;
- le raccourci `Alt + Shift + F` active ou désactive le mode.

L'accueil et le dashboard global restent toujours affichés normalement, même si le Mode focus est mémorisé comme actif.

## Révision espacée intelligente

Cahier Code possède désormais une file globale `#/revisions` commune aux sept parcours. Elle réutilise directement les enregistrements d'exercices existants : aucune progression parallèle n'est créée.

Après chaque tentative, l'exercice mémorise `lastReviewedAt`, `reviewDueAt`, `reviewIntervalDays` et `reviewStreak`. Le rythme est adaptatif : une erreur rapproche l'échéance, une réussite avec aide/correction programme environ un jour, et les réussites propres font progresser l'intervalle vers 3, 7, 14, 30 puis 60 jours.

La page **Révisions du jour** construit une session courte (jusqu'à six exercices) et mélange les parcours lorsque plusieurs technologies ont une échéance. Le dashboard global signale également les rappels dus. Les anciennes progressions restent compatibles : quelques exercices déjà réussis mais antérieurs à cette fonctionnalité servent progressivement à amorcer le planning.


## Mes erreurs utiles

Cahier Code conserve désormais localement un historique pédagogique des validations incorrectes dans les exercices.

- l’erreur est enregistrée uniquement au moment de la validation ;
- les erreurs identiques rapprochées sont regroupées avec un compteur ;
- la tentative, le diagnostic, la notion et la correction consultée peuvent être retrouvés ;
- une réussite ultérieure marque l’erreur comme résolue sans l’effacer ;
- la page globale `#/erreurs` permet de filtrer par statut et par parcours ;
- le dashboard global affiche le nombre d’erreurs encore à comprendre ;
- toutes les données restent dans le même état `localStorage` que la progression.

Cette fonctionnalité complète la révision espacée : la première répond à « qu’est-ce que j’ai mal compris ? », la seconde à « quand dois-je le revoir ? ».

## Explique-moi autrement

Une aide pédagogique globale est disponible dans les leçons et exercices des sept parcours. Le bouton **Explique-moi autrement** reformule la notion courante selon quatre angles : **Simple**, **Analogie**, **Exemple concret** et **Technique**. Le système réutilise le titre, les explications et les commandes réellement présentes dans la page ainsi que le dictionnaire d'aide contextuelle ; il ne crée pas une copie séparée des cours. Le dernier angle choisi est mémorisé. Cette aide reste compatible avec le Mode débutant, le Mode focus et les info-bulles de code.

## Système d’erreurs fréquentes personnalisé

Cahier Code possède désormais une vue globale **Mes tendances** (`#/erreurs-frequentes`) qui analyse l’historique réel de **Mes erreurs utiles** sans créer de stockage ou de progression parallèle.

Le système ne conclut jamais à partir d’une seule erreur. Une tendance doit être observée au moins deux fois ou sur plusieurs exercices distincts. Les erreurs encore ouvertes, répétées et réparties sur plusieurs exercices pèsent davantage dans la priorité.

Les tendances couvrent les sept parcours et regroupent notamment : structure/accessibilité HTML, sélecteurs et mise en page CSS, comparaisons/portée/tableaux/DOM/asynchronisme JavaScript, state/hooks/listes React, types/narrowing/objets TypeScript, modules/fichiers/HTTP Node.js, et NULL/WHERE/JOIN/agrégations/contraintes SQL.

Chaque carte indique :

- le nombre d’occurrences et d’exercices concernés ;
- le niveau de confiance du diagnostic ;
- le statut (actif ou en amélioration) ;
- un réflexe concret à adopter ;
- un mini-entraînement ;
- jusqu’à trois exercices ciblés issus du vrai catalogue du parcours ;
- les erreurs qui ont servi à détecter la tendance.

Le dashboard global affiche également le nombre de tendances encore actives. Ce système complète **Mes erreurs utiles** : l’historique conserve les erreurs individuelles, tandis que **Mes tendances** repère les schémas qui se répètent.

## Glossaire intelligent global

La plateforme dispose maintenant d'un glossaire commun à HTML, CSS, JavaScript, React, TypeScript, Node.js et SQL. Il réutilise exactement le dictionnaire de l'aide contextuelle afin d'éviter deux sources de définitions divergentes. La page `#/glossaire` permet la recherche et le filtrage par parcours ; chaque fiche affiche définition, exemple, piège fréquent, notions liées et leçons où le terme est réellement détecté. Les info-bulles de code proposent aussi un accès direct à la fiche complète.

## Gamification globale

La plateforme possède désormais une progression personnelle globale distincte des niveaux pédagogiques des parcours.

- **XP global** : attribué uniquement à des accomplissements pédagogiques réels (leçons terminées, exercices réussis, évaluations, projets et niveaux pédagogiques achevés).
- **Idempotence** : chaque récompense possède une clé stable ; recharger ou refaire une ressource déjà récompensée ne redonne pas d'XP.
- **Niveau utilisateur** : calculé depuis l'XP global avec une courbe progressive (`N2=100`, `N3=250`, `N4=450`, `N5=700` XP cumulés).
- **Bonus premier essai** : accordé seulement si l'exercice a été réussi sans échec ni correction préalable.
- **Streak** : une journée n'est active qu'après une vraie action récompensée. Plusieurs activités le même jour ne comptent que pour un seul jour de streak.
- **Objectif quotidien** : léger (20 XP), normal (40 XP) ou intensif (80 XP), au choix de l'utilisateur.
- **Badges data-driven** : progression, régularité, performance, projets, exploration, langages et maîtrise.
- **Journal XP** : historique des gains pour rendre le système vérifiable.
- **Profil global** : niveau, XP, streak, record, objectif, calendrier d'activité, XP par parcours et activité récente.
- **Migration silencieuse** : les anciennes progressions reçoivent rétroactivement leur XP et leurs badges sans notifications historiques. Aucun ancien streak n'est inventé.

La configuration principale vit dans `js/gamification.js` (`GAMIFICATION_CONFIG`, catalogue de badges et moteur de synchronisation). La progression pédagogique reste la source de vérité ; la gamification ne stocke que les récompenses déjà attribuées et les statistiques globales.

Cette version étant une application locale sans authentification ni backend, les garanties anti-triche sont limitées au calcul à partir des événements pédagogiques et à l'idempotence locale. Une sécurité forte contre la modification volontaire du `localStorage` nécessiterait une validation serveur.

## Parcours adaptatif

La plateforme possède désormais une couche de recommandations adaptatives commune aux 7 parcours. Elle ne remplace pas la progression pédagogique et ne verrouille aucun contenu. Le moteur lit les données déjà disponibles (réussites, erreurs, points, corrections, statut À revoir, échéances de révision espacée et leçons terminées) pour calculer un indice de maîtrise par leçon.

La page `#/adaptatif` classe les recommandations en trois actions : **Renforcer**, **Consolider** et **Continuer**. Une session courte sélectionne au maximum cinq actions et diversifie les parcours lorsque plusieurs technologies nécessitent de l'attention. Chaque recommandation expose sa justification afin que la décision du moteur reste compréhensible.

## Projets fil rouge

Cahier Code propose désormais une couche de projets transversaux via `#/fil-rouge`.

Deux fils rouges sont fournis :

- **DevBoard Full Stack** : HTML → CSS → JavaScript → React → TypeScript → Node.js → SQL → intégration finale ;
- **DataPulse** : JavaScript → TypeScript → Node.js → SQL → intégration analytique.

Chaque étape possède un cahier des charges, une checklist, un brouillon sauvegardé localement, un parcours recommandé et un état persistant. Les prérequis sont indicatifs et ne verrouillent pas artificiellement le contenu. Les étapes terminées alimentent aussi le moteur de gamification de manière idempotente.


## Carte visuelle des compétences

Une vue globale `#/competences` transforme la progression en carte de maîtrise. Elle couvre 42 compétences (6 par parcours) et réutilise les scores du parcours adaptatif plutôt que de créer une nouvelle progression. Chaque nœud peut être **Non vu**, **En cours**, **À renforcer** ou **Maîtrisé**, avec accès direct à une leçon ou un exercice ciblé. Les flèches représentent un ordre pédagogique recommandé et ne verrouillent jamais les contenus.

## Mode « Prédire avant d’exécuter »

Cahier Code propose désormais un mode optionnel de métacognition avant l’exécution du code. Il est disponible sur l’ensemble des environnements interactifs : Playground JavaScript, Labs HTML/CSS/JS, React Studio, TypeScript Studio, Node Lab (terminal et client HTTP) et SQL Studio.

Lorsqu’il est actif, une exécution volontaire suit le flux : prédiction → exécution réelle/sandboxée → comparaison. L’utilisateur qualifie ensuite son raisonnement comme Exact, Presque ou Différent. Les exécutions automatiques et les validations internes ne déclenchent pas ce panneau afin de ne pas interrompre les live previews ou les tests pédagogiques.

Le réglage est mémorisé dans l’état global (`predictionMode`) et les verdicts sont conservés dans `predictionStats`. Le raccourci `Alt + Shift + P` permet d’activer ou désactiver rapidement le mode. Cette fonctionnalité n’altère ni la validation des exercices ni la progression pédagogique.


## Explication ligne par ligne

Cahier Code propose désormais une aide **« Expliquer ligne par ligne »** sur les blocs de code et les éditeurs des parcours HTML, CSS, JavaScript, React, TypeScript, Node.js et SQL.

Pour chaque ligne, l’outil détaille :

- ce que fait la ligne ;
- pourquoi elle est présente ;
- ce qui peut changer si on la modifie ;
- les notions techniques reconnues, à partir du même dictionnaire que les info-bulles et le glossaire.

L’analyse s’adapte au langage (balises HTML, déclarations CSS, structures JS/React/TS/Node, clauses SQL) et utilise le code courant de l’éditeur lorsque l’apprenant a modifié l’exemple. Les panneaux sont repliables, responsive et respectent `prefers-reduced-motion`.

## Playground libre global

Route `#/playground`. Espace d'expérimentation indépendant de la progression, avec six environnements : Web (HTML/CSS/JS), JavaScript, React/Vite pédagogique, TypeScript 5.8.3, Node Lab pédagogique et SQLite réel. Les brouillons sont sauvegardés dans `state.playground` et ne donnent ni XP ni validation pédagogique.

## Challenges chronométrés optionnels

La route `#/challenges` ajoute des sessions de 3, 5 ou 10 minutes basées sur les QCM/Vrai-Faux existants des sept parcours. Ce mode possède son propre historique dans `state.timedChallenges` et ne modifie ni les résultats d'exercices, ni la maîtrise, ni les streaks, ni l'XP. Une expiration du chrono n'applique aucune pénalité. Les filtres permettent de choisir le parcours et la difficulté.

## Mode entretien technique

Nouvelle route `#/entretien`. Simulation indépendante de la progression : questions ouvertes de théorie, lecture de code, débogage et mise en situation sur les 7 parcours. L'utilisateur rédige d'abord sa réponse, découvre ensuite une grille de points attendus et s'auto-évalue (Solide / Partiel / À retravailler). Chrono optionnel (15 ou 25 minutes), historique local, score moyen, meilleur score et bilan par type de question. Aucune attribution d'XP, aucun échec pédagogique et aucune modification de l'indice de maîtrise.

## Mode examen

La route `#/examen` ajoute des examens blancs stricts et totalement séparés de la progression pédagogique.

- Parcours : JavaScript, React, HTML, CSS, TypeScript, Node.js, SQL ou session mixte.
- 10 ou 20 questions ; chrono facultatif de 10, 20 ou 30 minutes.
- Banque issue des évaluations déjà présentes (et des exercices auto-corrigeables JavaScript), sans seconde vérité pédagogique.
- Types utilisés : QCM, vrai/faux, prédiction et texte à compléter.
- Pendant l'épreuve : aucune correction, aucun indice, aucun glossaire, aucune aide contextuelle ni explication ligne par ligne.
- Navigation entre questions autorisée avant rendu ; expiration du chrono = rendu automatique.
- Après rendu : note, résultat par parcours, notions faibles et correction complète question par question.
- Historique local des 30 dernières copies, meilleure note et moyenne.
- Aucun XP, streak, badge, erreur utile, maîtrise ou exercice de cours n'est modifié par un examen.

## Portfolio automatique

La route `#/portfolio` détecte uniquement les projets réellement validés dans les sept parcours et les projets fil rouge terminés. La progression pédagogique reste la source de vérité : le portfolio ne peut pas marquer un projet comme terminé.

L'utilisateur peut masquer un projet, le mettre en avant, personnaliser sa description et renseigner un nom, un titre professionnel et une bio locale. `#/portfolio/apercu` fournit une vue propre du résultat. Deux exports locaux sont disponibles : une page HTML autonome et un fichier JSON des données publiées. Aucune publication réseau automatique n'est effectuée.

## Journal d’apprentissage

La route `#/journal` ajoute un journal personnel séparé de la progression. Chaque entrée peut conserver le parcours, le contexte, ce qui a été compris, ce qui reste flou, ce qui doit être revu, une note libre et un niveau de confiance. Les pages d’apprentissage proposent également un raccourci « Journal » qui préremplit le contexte courant. Le journal n’attribue pas d’XP et ne modifie ni la maîtrise ni les résultats des exercices.

## Résumé automatique de session

Le fichier `js/session-summary.js` ajoute une synthèse locale des sessions d’apprentissage. La synthèse réutilise les événements XP non historiques, les erreurs utiles, le journal d’apprentissage et les historiques des modes challenge/entretien/examen. Elle ne modifie aucune progression et n’attribue aucune récompense.

- Route : `#/session`
- Fin manuelle via « Terminer la session ».
- Archivage silencieux après une pause de 45 minutes lorsqu’une nouvelle activité reprend.
- Temps actif compté uniquement lorsque la page est visible et qu’une interaction récente a eu lieu.
- Historique limité aux 40 dernières sessions.

## Suggestions de prochaine étape

La route `#/prochaine-etape` fournit une recommandation concrète distincte du parcours adaptatif. Elle combine les révisions espacées dues, les fragilités détectées par le moteur adaptatif, les parcours déjà commencés, les projets fil rouge actifs et les prérequis conseillés pour ouvrir un nouveau parcours. Une seule action principale est mise en avant, avec quelques alternatives et une justification visible. Les suggestions sont uniquement informatives : elles ne verrouillent aucun contenu et ne modifient ni XP, ni progression, ni maîtrise.
