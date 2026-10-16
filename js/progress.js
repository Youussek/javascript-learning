// progress.js — calcule et enregistre la progression.
// Toutes les données vivent dans l’objet `state` (voir storage.js).

let state = loadState();

// Enregistre l’état, puis prévient le reste du site (la barre latérale se met à jour).
function commit() {
  saveState(state);
  window.dispatchEvent(new Event("progress-changed"));
}

// ─── Dossier d’un exercice ───
function emptyRecord() {
  return { attempts: 0, fails: 0, success: false, review: false, correctionSeen: false, points: 0 };
}

function exercisePathFromId(exerciseId) {
  const id = String(exerciseId);
  if (/^rx-|^reval-/.test(id)) return "react";
  if (/^cx-|^ceval-/.test(id)) return "css";
  if (/^hx-|^heval-/.test(id)) return "html";
  return "javascript";
}

function ensureReactProgressStores() {
  if (!state.react) state.react = { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} };
  if (!state.react.exercises) state.react.exercises = {};
  if (!state.react.notions) state.react.notions = {};
  if (!state.react.evaluations) state.react.evaluations = {};
}

function ensureCssProgressStores() {
  if (!state.css) state.css = { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} };
  if (!state.css.exercises) state.css.exercises = {};
  if (!state.css.notions) state.css.notions = {};
  if (!state.css.evaluations) state.css.evaluations = {};
  if (!state.css.projects) state.css.projects = {};
  if (!state.css.lessonsDone) state.css.lessonsDone = {};
}


function ensureHtmlProgressStores() {
  if (!state.html) state.html = { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} };
  if (!state.html.exercises) state.html.exercises = {};
  if (!state.html.notions) state.html.notions = {};
  if (!state.html.evaluations) state.html.evaluations = {};
  if (!state.html.projects) state.html.projects = {};
  if (!state.html.lessonsDone) state.html.lessonsDone = {};
}

function exerciseStore(exerciseId) {
  const path = exercisePathFromId(exerciseId);
  if (path === "react") { ensureReactProgressStores(); return state.react.exercises; }
  if (path === "css") { ensureCssProgressStores(); return state.css.exercises; }
  if (path === "html") { ensureHtmlProgressStores(); return state.html.exercises; }
  return state.exercises;
}

function getRecord(exerciseId) {
  const store = exerciseStore(exerciseId);
  return store[exerciseId] || emptyRecord();
}

function ensureRecord(exerciseId) {
  const store = exerciseStore(exerciseId);
  if (!store[exerciseId]) store[exerciseId] = emptyRecord();
  return store[exerciseId];
}

function ensureNotion(name, path) {
  if (path === "react") {
    ensureReactProgressStores();
    if (!state.react.notions[name]) state.react.notions[name] = { ok: 0, ko: 0 };
    return state.react.notions[name];
  }
  if (path === "css") {
    ensureCssProgressStores();
    if (!state.css.notions[name]) state.css.notions[name] = { ok: 0, ko: 0 };
    return state.css.notions[name];
  }
  if (path === "html") {
    ensureHtmlProgressStores();
    if (!state.html.notions[name]) state.html.notions[name] = { ok: 0, ko: 0 };
    return state.html.notions[name];
  }
  if (!state.notions[name]) state.notions[name] = { ok: 0, ko: 0 };
  return state.notions[name];
}

// ─── Enregistrer ce que fait l’élève ───
function setLastLesson(lessonId) {
  state.lastLesson = lessonId;
  commit();
}

function markLessonDone(lessonId) {
  state.lessonsDone[lessonId] = true;
  commit();
}

// `session` décrit la tentative en cours : { fails, hints, correctionSeen }
function recordResult(exercise, ok, session) {
  const record = ensureRecord(exercise.id);
  const notion = ensureNotion(exercise.notion, exercise.path);
  record.attempts++;

  if (!ok) {
    record.fails++;
    record.review = true;     // un échec → l’exercice passe dans « À revoir »
    notion.ko++;
    commit();
    return {};
  }

  record.success = true;
  notion.ok++;
  // Réussite « propre » : aucune erreur et pas de correction vue pendant cette session.
  const clean = session.fails === 0 && !session.correctionSeen;
  if (clean) record.review = false;

  // 3 points au maximum, un point perdu par erreur ou par indice, 0 si la correction a été vue.
  const points = session.correctionSeen ? 0 : Math.max(1, 3 - session.fails - session.hints);
  record.points = Math.max(record.points || 0, points);
  commit();
  return { points: points, clean: clean };
}

function recordCorrection(exercise) {
  const record = ensureRecord(exercise.id);
  record.correctionSeen = true;
  record.review = true;
  commit();
}

// ─── Statistiques ───
function exerciseStatus(exercise) {
  const record = getRecord(exercise.id);
  if (record.review) return { key: "review", symbol: "!", label: "À revoir" };
  if (record.success) return { key: "ok", symbol: "✓", label: "Réussi" };
  if (record.fails > 0) return { key: "ko", symbol: "✗", label: "Échoué" };
  return { key: "todo", symbol: "○", label: "À faire" };
}

function lessonStats(lessonId) {
  const exercises = exercisesOf(lessonId);
  let solved = 0, failed = 0, review = 0, points = 0;
  for (const exercise of exercises) {
    const record = getRecord(exercise.id);
    if (record.success) solved++;
    else if (record.fails > 0) failed++;
    if (record.review) review++;
    points += record.points || 0;
  }
  const done = state.lessonsDone[lessonId] ? 1 : 0;
  const steps = exercises.length + 1;      // le cours lui-même compte pour une étape
  return {
    total: exercises.length,
    solved: solved,
    failed: failed,
    review: review,
    points: points,
    maxPoints: exercises.length * 3,
    done: done === 1,
    percent: Math.round(((solved + done) / steps) * 100),
  };
}

function moduleStats(moduleId) {
  const lessons = lessonsOf(moduleId);
  const sum = { total: 0, solved: 0, failed: 0, review: 0, points: 0, maxPoints: 0, doneLessons: 0, lessons: lessons.length };
  let steps = 0, finished = 0;
  for (const lesson of lessons) {
    const s = lessonStats(lesson.id);
    sum.total += s.total;
    sum.solved += s.solved;
    sum.failed += s.failed;
    sum.review += s.review;
    sum.points += s.points;
    sum.maxPoints += s.maxPoints;
    if (s.done) sum.doneLessons++;
    steps += s.total + 1;
    finished += s.solved + (s.done ? 1 : 0);
  }
  sum.percent = steps === 0 ? 0 : Math.round((finished / steps) * 100);
  return sum;
}

function levelName(percent) {
  if (percent >= 100) return "Fondamentaux maîtrisés";
  if (percent >= 75) return "Avancé";
  if (percent >= 40) return "Intermédiaire";
  if (percent >= 10) return "Apprenti";
  return "Débutant";
}

// Les notions : on regroupe les exercices par notion et on déduit un statut.
function notionRows() {
  const map = new Map();
  for (const exercise of EXERCISES) {
    if (!map.has(exercise.notion)) {
      map.set(exercise.notion, { name: exercise.notion, lessonId: exercise.lesson, exercises: [] });
    }
    map.get(exercise.notion).exercises.push(exercise);
  }
  return Array.from(map.values()).map((row) => {
    const records = row.exercises.map((e) => getRecord(e.id));
    const attempted = records.some((r) => r.attempts > 0);
    const needsReview = records.some((r) => r.review);
    const allClean = records.every((r) => r.success && !r.review);
    row.status = needsReview ? "review" : allClean ? "mastered" : attempted ? "progress" : "todo";
    row.reviewExercises = row.exercises.filter((e) => getRecord(e.id).review);
    return row;
  });
}

function reviewExercises() {
  return EXERCISES.filter((exercise) => getRecord(exercise.id).review);
}

// Taux de réussite global (sur toutes les tentatives).
function accuracy() {
  let ok = 0, ko = 0;
  for (const name in state.notions) {
    ok += state.notions[name].ok;
    ko += state.notions[name].ko;
  }
  return ok + ko === 0 ? null : ok / (ok + ko);
}

function nextLesson() {
  return LESSONS.find((lesson) => !state.lessonsDone[lesson.id]) || null;
}

// ─── Projets ───
function emptyProjectState() {
  return { steps: {}, fails: 0, done: false, correctionSeen: false, draft: null };
}

function getProjectState(projectId) {
  return (state.projects && state.projects[projectId]) || emptyProjectState();
}

function ensureProjectState(projectId) {
  if (!state.projects) state.projects = {};
  if (!state.projects[projectId]) state.projects[projectId] = emptyProjectState();
  return state.projects[projectId];
}

// Enregistre le résultat de la vérification d'une étape. Renvoie true si le projet est terminé.
function recordProjectCheck(project, stepIndex, ok) {
  const record = ensureProjectState(project.id);
  if (ok) record.steps[stepIndex] = true;
  else record.fails++;
  record.done = project.steps.every((step, index) => record.steps[index] === true);
  commit();
  return record.done;
}

function recordProjectCorrection(projectId) {
  ensureProjectState(projectId).correctionSeen = true;
  commit();
}

// Le brouillon (le code de l'élève) est sauvegardé sans prévenir le reste du site.
function saveProjectDraft(projectId, files) {
  const record = ensureProjectState(projectId);
  record.draft = {};
  files.forEach((file) => { record.draft[file.name] = file.code; });
  saveState(state);
}

function resetProject(projectId) {
  if (state.projects) delete state.projects[projectId];
  commit();
}

function projectStepsDone(project) {
  const record = getProjectState(project.id);
  return project.steps.filter((step, index) => record.steps[index] === true).length;
}

// ─── Préférences et remise à zéro ───
function setTheme(theme) {
  state.theme = theme;
  commit();
}

function resetProgress() {
  const theme = state.theme;
  clearSavedState();
  state = defaultState();
  state.theme = theme;
  commit();
}
