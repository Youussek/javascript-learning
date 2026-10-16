// storage.js — tout ce qui touche à localStorage.
// localStorage garde des textes dans le navigateur, même après la fermeture de la page.
// On y range tout notre état sous forme de JSON (un objet transformé en texte).

const STORAGE_KEY = "cahierJS.v1";

// L'état de départ : ce que le site sait de toi quand tu arrives pour la première fois.
function defaultState() {
  return {
    version: 1,
    theme: "dark",
    learningMode: "normal", // "normal" ou "beginner" : couche pédagogique optionnelle globale
    focusMode: false, // mode concentration : masque la navigation uniquement sur les pages d’apprentissage
    lastActiveLearningPath: null, // dernier parcours explicitement ouvert ; ne provoque jamais de redirection automatique
    errorHistory: [], // erreurs utiles rencontrées dans les exercices, tous parcours confondus
    gamification: null, // XP, niveau utilisateur, badges, streaks et objectifs (initialisé/migré par gamification.js)
    lastLesson: null,   // dernier cours ouvert, ex. "variables"
    lessonsDone: {},    // cours terminés, ex. { variables: true }
    exercises: {},      // un dossier par exercice : { "var-1": { attempts, fails, success, review, correctionSeen, points } }
    notions: {},        // compteurs par notion : { "let et const": { ok: 3, ko: 1 } }
    react: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} }, // progression du parcours React
    css: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} }, // progression du parcours CSS
    html: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} }, // progression du parcours HTML
    typescript: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} }, // progression du parcours TypeScript
    node: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} }, // progression du parcours Node.js
    sql: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} }, // progression du parcours SQL
    projects: {},       // un dossier par projet : { steps: {0: true}, fails: 2, done: false, correctionSeen: false, draft: {...} }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    // On fusionne avec l'état par défaut : si on ajoute un champ plus tard, il existera quand même.
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (error) {
    console.warn("Impossible de lire la sauvegarde :", error);
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Impossible d’enregistrer la progression :", error);
  }
}

function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Impossible d’effacer la sauvegarde :", error);
  }
}
