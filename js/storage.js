// storage.js — stockage local et séparation des profils.
// Chaque profil possède sa propre clé de progression afin qu'aucune donnée
// pédagogique ne puisse se mélanger avec celle d'un autre profil local.

const LEGACY_STORAGE_KEY = "cahierJS.v1";
const PROFILE_REGISTRY_KEY = "cahierJS.profiles.v1";
const ACTIVE_PROFILE_KEY = "cahierJS.activeProfile.v1";
const DEFAULT_PROFILE_ID = "principal";

function profileStateStorageKey(profileId) {
  return `cahierJS.profile.${String(profileId || DEFAULT_PROFILE_ID)}.v1`;
}

function readProfileRegistry() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_REGISTRY_KEY) || "null");
    if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.length) return parsed;
  } catch (error) {
    console.warn("Impossible de lire les profils locaux :", error);
  }
  const now = new Date().toISOString();
  return { version: 1, profiles: [{ id: DEFAULT_PROFILE_ID, name: "Profil principal", createdAt: now, lastUsedAt: now }] };
}

function writeProfileRegistry(registry) {
  try { localStorage.setItem(PROFILE_REGISTRY_KEY, JSON.stringify(registry)); }
  catch (error) { console.warn("Impossible d’enregistrer les profils locaux :", error); }
}

function ensureLocalProfiles() {
  const registry = readProfileRegistry();
  if (!registry.profiles.some(p => p.id === DEFAULT_PROFILE_ID)) {
    const now = new Date().toISOString();
    registry.profiles.unshift({ id: DEFAULT_PROFILE_ID, name: "Profil principal", createdAt: now, lastUsedAt: now });
  }
  writeProfileRegistry(registry);

  let active = null;
  try { active = localStorage.getItem(ACTIVE_PROFILE_KEY); } catch (_) {}
  if (!registry.profiles.some(p => p.id === active)) active = registry.profiles[0].id;
  try { localStorage.setItem(ACTIVE_PROFILE_KEY, active); } catch (_) {}

  // Migration transparente de l'ancienne progression vers le profil principal.
  try {
    const mainKey = profileStateStorageKey(DEFAULT_PROFILE_ID);
    if (!localStorage.getItem(mainKey)) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) localStorage.setItem(mainKey, legacy);
    }
  } catch (error) {
    console.warn("Migration de l’ancienne progression impossible :", error);
  }
  return { registry, active };
}

ensureLocalProfiles();

function getActiveProfileId() {
  const registry = readProfileRegistry();
  let id = null;
  try { id = localStorage.getItem(ACTIVE_PROFILE_KEY); } catch (_) {}
  return registry.profiles.some(p => p.id === id) ? id : registry.profiles[0].id;
}

function getActiveProfileMeta() {
  const registry = readProfileRegistry();
  const id = getActiveProfileId();
  return registry.profiles.find(p => p.id === id) || registry.profiles[0];
}

function activeStorageKey() { return profileStateStorageKey(getActiveProfileId()); }

// L'état de départ : ce que le site sait de toi quand tu arrives pour la première fois.
function defaultState() {
  return {
    version: 1,
    theme: "dark",
    learningMode: "normal",
    predictionMode: false,
    predictionStats: { total:0, exact:0, close:0, different:0, history:[] },
    focusMode: false,
    lastActiveLearningPath: null,
    errorHistory: [],
    gamification: null,
    threadProjects: {},
    playground: { selected: "web", drafts: {} },
    timedChallenges: { history: [], best: {}, totalSessions: 0, totalCorrect: 0, totalAnswered: 0 },
    technicalInterview: { history: [], totalSessions: 0, bestScore: 0 },
    ticketSimulator: { tickets: {} },
    gitPedagogical: null,
    examMode: { history: [], totalSessions: 0, bestScore: 0 },
    learningJournal: { entries: [] },
    sessionSummaries: { history: [] },
    progressionHistory: { version:1, startedAt:null, snapshots:[] },
    lastLesson: null,
    lessonsDone: {},
    exercises: {},
    notions: {},
    react: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} },
    css: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} },
    html: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} },
    typescript: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} },
    node: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} },
    sql: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} },
    git: { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {}, workspaces: {} },
    projects: {}
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(activeStorageKey());
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (error) {
    console.warn("Impossible de lire la sauvegarde du profil :", error);
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(activeStorageKey(), JSON.stringify(state));
    const registry = readProfileRegistry();
    const id = getActiveProfileId();
    const profile = registry.profiles.find(p => p.id === id);
    if (profile) profile.lastUsedAt = new Date().toISOString();
    writeProfileRegistry(registry);
  } catch (error) {
    console.warn("Impossible d’enregistrer la progression :", error);
  }
}

function clearSavedState() {
  try { localStorage.removeItem(activeStorageKey()); }
  catch (error) { console.warn("Impossible d’effacer la sauvegarde :", error); }
}
