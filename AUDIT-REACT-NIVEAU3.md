# Audit — React Niveau 3 enrichi

## Objectif
Mettre le Niveau 3 React au même format pédagogique que les Niveaux 1 et 2 enrichis, en réutilisant le moteur d'exercices commun inspiré du parcours JavaScript.

## Structure finale
- 10 leçons
- 40 exercices (4 par leçon)
- 10 questions d'évaluation finale
- 1 projet final renforcé : API Explorer
- 11 critères de validation pour le projet

## Leçons
1. useEffect : synchroniser avec l’extérieur
2. Dépendances et cleanup des effets
3. Récupérer des données avec fetch
4. Chargement, erreurs et états vides
5. Créer un hook personnalisé
6. Context API : partager une donnée
7. Routage dans une application Vite
8. Déboguer React efficacement
9. Formulaires avancés et validation
10. Organiser un projet React intermédiaire

## Exercices
Chaque leçon contient 4 activités avec difficulté progressive. Les formats utilisés incluent :
- QCM
- vrai/faux
- prédiction
- code à compléter
- correction / atelier React structurel

Tous les exercices possèdent 3 indices et une correction expliquée. Les ateliers React utilisent la validation structurelle commune : la plateforme ne prétend pas exécuter un runtime Vite/React complet.

## Projet — API Explorer
Le projet final vérifie désormais :
- hook personnalisé `useUsers`
- `useEffect`
- `fetch`
- `response.ok`
- loading / error
- recherche contrôlée
- filtrage
- état vide
- `map` + `key`
- React Router
- route dynamique `/users/:id`

## Progression
Le modèle de progression existant est conservé. Les nouveaux exercices alimentent la maîtrise pratique et la révision sans invalider brutalement les leçons déjà terminées.

## Vérifications exécutées
- `node --check` sur tous les fichiers JavaScript
- 40 exercices détectés au Niveau 3
- 4 exercices pour chacune des 10 leçons
- 10 questions d'évaluation
- 0 ID d'exercice dupliqué
- 0 exercice orphelin
- 0 exercice sans 3 indices
- 0 atelier React sans solution
