# Audit — Interactivité React Niveau 5

Le Niveau 5 utilise désormais le même React Studio que les niveaux précédents.

## Leçons interactives

1. React + TypeScript — fichiers TSX éditables + preview comportementale JS.
2. Dépendances / package.json — exploration des scripts et terminal npm simulé.
3. Tests d’intégration — fichier de test éditable + `npm run test` simulé.
4. Résilience — états loading/error/empty/success réellement manipulables.
5. Sécurité frontend — saisie utilisateur, échappement pédagogique, `.env.example` et notes sécurité.
6. Performance de production — chargement différé pédagogique + build simulé.
7. Build / preview / déploiement — terminal Vite simulé et notes de déploiement.
8. Maintenance — documentation, tests et refactorisation progressive.

## Projet final

`Application React de production` dispose d’un studio avec :
- fichiers TypeScript de référence ;
- états d’erreur récupérables ;
- tests ;
- checklist de production ;
- `npm run test` ;
- `npm run build` ;
- `npm run preview`.

## Limites explicites

Le mini-runtime ne compile pas réellement TypeScript et ne publie aucun fichier sur Internet. Les fichiers TS/TSX sont éditables et servent à l’apprentissage structurel, tandis que la preview interactive exécute une version JavaScript compatible du comportement. Les commandes npm/Vite restent simulées et contrôlées ; aucune commande système utilisateur n’est exécutée.

## Vérifications

- 8/8 leçons Niveau 5 avec preset React Studio.
- Projet final avec preset interactif.
- Niveau 5 activé dans la page de leçon et la page projet.
- Tous les fichiers JavaScript passent `node --check`.
