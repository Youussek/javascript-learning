# Audit pédagogique — JavaScript vs React

## Référence JavaScript détectée

- 6 niveaux.
- 41 leçons.
- 198 exercices.
- Niveau 1 : 9 leçons et 35 exercices.
- 8 projets JavaScript, 37 étapes de projet au total.
- Types d'exercices existants : QCM, vrai/faux, compléter, prédire, code JavaScript, atelier page web.
- Chaque exercice peut fournir des indices progressifs, une correction après deux échecs, une explication et un rappel « À retenir ».
- Les erreurs alimentent la section de révision et la progression est conservée dans localStorage.

## React avant enrichissement

- 5 niveaux.
- 36 leçons.
- 5 projets.
- Les cours existaient, mais sans moteur d'exercices régulier comparable à JavaScript.
- Pas de vraie section d'exercices React, de révision React ni d'évaluation de fin de niveau.

## React Niveau 1 après enrichissement

- 6 leçons conservées : React/Vite, structure Vite, JSX, composants, props, événements + useState.
- 24 exercices intégrés aux leçons, soit 4 activités par leçon.
- 10 questions d'évaluation de fin de niveau.
- 1 projet final « Mini application de profils » avec starter et 6 critères structurels de réussite.
- Formats utilisés : QCM, vrai/faux, compléter, prédire, atelier JSX/React.
- Même système d'indices progressifs, corrections expliquées, statut « À revoir » et points que JavaScript.
- Nouvelle section React « Exercices ».
- Nouvelle section React « Révision ».
- Évaluation niveau 1 avec seuil conseillé de 80 % et meilleur score sauvegardé.
- Snippets React ajoutés à l'éditeur : composant, useState, onClick, expression JSX et fragment.

## Stratégie de progression

La progression existante n'est pas invalidée :

- le pourcentage historique des leçons React reste calculé comme avant ;
- la maîtrise des nouveaux exercices est affichée séparément ;
- les dossiers d'exercices React sont stockés dans `state.react.exercises` ;
- les notions React sont stockées dans `state.react.notions` ;
- les évaluations sont stockées dans `state.react.evaluations` ;
- les exercices JavaScript restent dans les structures existantes.

Cette séparation évite de transformer brutalement un niveau React déjà terminé en niveau incomplet.

## Extension du moteur

Le moteur d'exercices JavaScript n'a pas été dupliqué.

Un seul nouveau type, `reactcode`, a été ajouté au moteur générique pour les exercices JSX. Il réutilise :

- le même éditeur ;
- la même interface d'exercice ;
- les mêmes indices ;
- les mêmes corrections ;
- les mêmes tentatives ;
- les mêmes statuts ;
- le même système de points.

Sa validation est structurelle. La plateforme ne prétend pas exécuter un projet React/Vite complet dans la page.

## Vérifications exécutées

- `node --check` sur tous les fichiers JavaScript : OK.
- 24 exercices React niveau 1 détectés : OK.
- 10 questions d'évaluation détectées : OK.
- aucune collision d'identifiants avec les 198 exercices JavaScript : OK.
- aucune référence vers une leçon React inexistante : OK.
- tous les exercices possèdent au moins 3 indices : OK.
- tous les ateliers React possèdent une solution et des critères de validation : OK.

Le test Chromium headless de rendu DOM n'a pas abouti dans l'environnement (processus bloqué sur l'environnement système/DBus), il n'est donc pas compté comme un test réussi.

## Suite logique

Le niveau 1 est désormais la référence du nouveau format React enrichi. Le niveau 2 doit être enrichi de la même manière avant de passer au niveau 3 : exercices par notion, révision, évaluation et projet vérifiable.
