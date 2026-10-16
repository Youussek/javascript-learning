# Audit interactivité — React Niveau 3

## Objectif
Rendre le Niveau 3 React intermédiaire aussi manipulable que les niveaux 1 et 2 sans créer un second moteur pédagogique.

## Leçons interactives
- react-useeffect — useEffect et resynchronisation
- react-effect-deps — dépendances et cleanup
- react-fetch — fetch simulé et chargement de données
- react-loading-errors — états loading / success / error / empty
- react-custom-hooks — logique réutilisable et multi-fichiers
- react-context — partage de donnée, simulation pédagogique du besoin de Context
- react-routing — navigation SPA simulée sans rechargement
- react-debugging — console navigateur et observation des rendus
- react-advanced-forms — formulaire multi-champs et validation
- react-project-structure — explorateur multi-fichiers pages/components/hooks/services

## Projet
API Explorer dispose maintenant du React Studio avec :
- chargement d'utilisateurs via fetch simulé ;
- recherche contrôlée ;
- loading / error / empty ;
- sélection d'un utilisateur et vue détail ;
- preview interactive ;
- console navigateur ;
- validation structurelle existante conservée.

## Runtime étendu
Le runtime pédagogique prend désormais en charge un useEffect simplifié avec dépendances et cleanup, ainsi qu'un fetch mocké et isolé retournant des données pédagogiques. Les appels réseau externes réels ne sont pas nécessaires à ces activités.

## Limites assumées
Le projet ne possède toujours pas de bundler React réel embarqué (Sandpack, WebContainers, etc.). Context API et React Router sont donc enseignés avec une simulation interactive du comportement et les vrais concepts dans le cours, sans prétendre exécuter react-router-dom ou un package npm réellement installé.

## Non-régression
Les studios des niveaux 1 et 2 sont conservés. Le moteur JavaScript historique n'est pas modifié.
