# Audit — Interactivité React Niveau 2

## Objectif

Rendre le Niveau 2 React réellement manipulable dans le même React Studio que le Niveau 1, sans créer une seconde interface pédagogique.

## Leçons couvertes

- `react-conditions` — rendu conditionnel : ternaire, `&&`, changement d’état par clic.
- `react-lists` — rendu de listes avec `map()` et `key`.
- `react-controlled-forms` — input contrôlé, `onChange`, `onSubmit`, feedback immédiat.
- `react-state-arrays` — ajout et suppression dans un tableau stocké dans le state.
- `react-lifting-state` — state dans le parent et callbacks transmis à plusieurs enfants.
- `react-component-organization` — projet multi-fichiers avec `TaskForm`, `TaskList` et `App`.

## Projet final

`r2-task-manager` dispose maintenant d'un atelier interactif complet :

- ajout de tâche ;
- suppression ;
- bascule terminé / actif ;
- filtres Toutes / Actives / Terminées ;
- composants séparés ;
- explorateur multi-fichiers ;
- preview interactive ;
- validation structurelle conservée en complément.

## Extension du runtime

Le runtime pédagogique du React Studio a été étendu pour prendre en charge les besoins du Niveau 2 :

- expressions conditionnelles JSX ;
- rendu `condition && <Element />` ;
- ternaires JSX ;
- rendu de collections avec `.map()` ;
- tableaux et variables locales simples ;
- formulaires et événements `onChange` / `onSubmit` ;
- callbacks passés en props ;
- plusieurs fichiers JSX dans l'explorateur.

Le terminal Vite reste simulé et limité à une liste contrôlée de commandes. Le rendu React pédagogique reste isolé dans une iframe sandboxée.

## Non-régression

- Les moteurs JavaScript existants n'ont pas été remplacés.
- Le Niveau 1 React interactif reste branché au même studio.
- Les exercices, évaluations et progressions enrichis des niveaux 1 à 3 sont conservés.
