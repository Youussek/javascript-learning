// projects.js — la liste des projets (ils seront jouables dans une prochaine version).
// Les projets demandent le DOM : ils s’ouvriront à partir du niveau 3.

const PROJECTS = [
  { id: "compteur", title: "Compteur", difficulty: 1, needs: "Niveaux 3 et 4",
    goal: "Un bouton + et un bouton − qui modifient un nombre affiché dans la page." },
  { id: "dark-mode", title: "Mode sombre", difficulty: 1, needs: "Niveaux 3 et 4",
    goal: "Un bouton qui bascule le thème de la page, avec mémorisation du choix." },
  { id: "todo", title: "To-do list", difficulty: 2, needs: "Niveaux 3 à 5",
    goal: "Ajouter, cocher et supprimer des tâches dans une liste." },
  { id: "quiz", title: "Quiz interactif", difficulty: 2, needs: "Niveaux 3 à 5",
    goal: "Poser des questions une à une, compter le score, afficher le résultat." },
  { id: "calculatrice", title: "Calculatrice", difficulty: 2, needs: "Niveaux 3 à 5",
    goal: "Des touches, un écran et les quatre opérations de base." },
  { id: "formulaire", title: "Validation de formulaire", difficulty: 3, needs: "Niveaux 3 à 5",
    goal: "Vérifier les champs d’un formulaire et afficher des messages d’erreur clairs." },
  { id: "meteo", title: "Application météo", difficulty: 3, needs: "Niveau 6",
    goal: "Récupérer des données depuis une API avec fetch et les afficher." },
];
