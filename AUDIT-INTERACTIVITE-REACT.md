# Audit d’interactivité — parcours React

## Référence JavaScript observée

Le parcours JavaScript possède déjà deux moteurs complémentaires :

- `runner.js` pour l’exécution JavaScript isolée dans un Worker ;
- `lab.js` pour les ateliers HTML/CSS/JS multi-fichiers avec iframe sandboxée, preview interactive, console capturée, actions simulées et validation.

Le parcours React réutilise désormais les mêmes conventions UI (`makeEditor`, console, preview, boutons, iframe sandboxée) au lieu d’introduire une interface parallèle.

## État avant cette modification

Les 6 leçons du Niveau 1 React étaient riches en explications et exercices, mais leurs démonstrations principales restaient statiques : commandes Vite en bloc de code et exemples JSX sans rendu immédiat dans un navigateur.

## Niveau 1 après modification

| Leçon | Avant | Après | Environnement |
|---|---|---|---|
| React et Vite | ○ statique | ✓ interactive | terminal Vite + création de projet + preview liée au serveur |
| Anatomie d’un projet Vite | ○ statique | ✓ interactive | explorateur + éditeur multi-fichiers + terminal + navigateur |
| JSX | ○ statique | ✓ interactive | éditeur JSX + HMR pédagogique + navigateur + erreurs |
| Composants | ○ statique | ✓ interactive | éditeur + rendu de composants réutilisés |
| Props | ○ statique | ✓ interactive | éditeur + props + preview |
| Événements et useState | ○ statique | ✓ interactive | clics réels dans la preview + state + console navigateur |

## Terminal Vite simulé

Le terminal n’exécute aucune commande système de l’utilisateur. Il reconnaît uniquement une liste contrôlée de commandes pédagogiques :

- `pwd`, `ls`, `cd`, `mkdir` ;
- `npm create vite@latest` avec dialogue guidé ;
- `npm install`, `npm install <package>`, `npm uninstall <package>` ;
- `npm run`, `npm run dev`, `npm run build`, `npm run preview` ;
- erreur pédagogique pour `npm start` et commandes inconnues.

Le terminal est relié à un petit système de fichiers virtuel. `npm run dev` active la preview ; `npm run build` crée conceptuellement `dist/` ; `npm run preview` explique la différence avec le serveur de développement.

## React Studio

Nouveau fichier : `js/react-studio.js`.

Il fournit :

- explorateur de projet virtuel ;
- éditeur multi-fichiers basé sur `makeEditor()` ;
- terminal Vite simulé ;
- navigateur/preview ;
- console navigateur distincte du terminal ;
- HMR pédagogique après modification d’un fichier ;
- reset ;
- mode guidé par étapes ;
- runtime JSX pédagogique exécuté uniquement dans une iframe sandboxée.

Le runtime du Niveau 1 prend en charge les besoins déjà enseignés : composants fonctionnels, props, JSX simple, expressions JSX, événements et `useState`. Il ne prétend pas remplacer un bundler React/Vite complet pour les niveaux avancés.

## Audit des niveaux suivants

Les niveaux 2 à 5 conservent pour le moment leurs exercices enrichis et projets existants. Leur contenu est pédagogiquement riche mais les démonstrations de cours restent majoritairement statiques. La prochaine généralisation devra sélectionner l’environnement adapté par notion :

- Niveau 2 : listes, formulaires, state de tableaux → éditeur + preview interactive ;
- Niveau 3 : effets/API/routage → preview + console + API simulée + fichiers multiples ;
- Niveau 4 : performance/tests/Vite avancé → profiler pédagogique, terminal build/config, tests ;
- Niveau 5 : TypeScript/production/déploiement → terminal, build, diagnostics et simulations de production.

## Non-régression JavaScript

Aucun moteur JavaScript (`runner.js`, `lab.js`, données de cours/exercices/projets) n’a été modifié. L’intégration ajoute un script React dédié chargé avant `app.js`, des styles, et un point d’insertion dans les leçons React Niveau 1.
