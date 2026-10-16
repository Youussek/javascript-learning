# Audit interactivité — React Niveau 4

## Objectif
Rendre le Niveau 4 — React avancé manipulable dans le même React Studio que les niveaux 1 à 3, sans créer un second moteur pédagogique.

## Leçons couvertes
- Architecture de composants à grande échelle
- useRef
- memo / useMemo / useCallback
- Gestion des erreurs et limites de panne
- Tests de composants
- Accessibilité
- Configuration avancée de Vite
- Refactorisation

## Extensions du runtime pédagogique
- `useRef` persistant entre rendus
- liaison d'une ref à un élément DOM virtuel (`ref={...}`)
- `useMemo` pédagogique avec dépendances
- `useCallback` pédagogique basé sur le même mécanisme
- `memo` en passthrough pédagogique
- commande simulée `npm run test` / `npm test`
- prise en charge d'un fichier `*.test.jsx` dans l'explorateur

## Interactions par leçon
### Architecture
Explorateur multi-fichiers, composants réutilisables et flux de données visible.

### useRef
Focus réel sur un input dans la preview et valeur mutable conservée entre rendus.

### Mémoïsation
Filtrage interactif avec `useMemo`, callback mémoïsé et compteur indépendant.

### Erreurs
Déclenchement d'une panne pédagogique et interface de secours récupérable.

### Tests
Fichier `App.test.jsx` visible + simulation contrôlée de `npm run test` dans le terminal.

### Accessibilité
Navigation clavier, labels, `aria-live`, rôle `dialog` et focus.

### Vite avancé
Exploration de `vite.config.js`, `.env.example`, `npm run build` et `npm run preview` simulés.

### Refactorisation
Application fonctionnelle à transformer sans casser le comportement observable.

## Projet final
`Dashboard multi-pages` possède désormais son propre preset interactif avec :
- navigation Dashboard / Paramètres ;
- recherche contrôlée ;
- `useRef` pour le focus ;
- `useMemo` pour les données dérivées ;
- composant `StatCard` séparé ;
- fichier de test ;
- terminal de test/build/preview.

## Limites assumées
Le studio reste un runtime pédagogique isolé et non un bundler React complet. React Router, Vitest ou Vite ne sont pas réellement lancés sur la machine de l'utilisateur : leurs comportements pertinents sont simulés lorsqu'un vrai package/runtime n'est pas disponible. Aucune commande système libre n'est exécutée.
