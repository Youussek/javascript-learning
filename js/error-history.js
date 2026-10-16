// error-history.js — « Mes erreurs utiles ».
// Les erreurs restent dans le même état local que la progression : pas de compte, pas de stockage parallèle.

const ERROR_HISTORY_MAX = 300;
const ERROR_HISTORY_DEDUP_MS = 2 * 60 * 1000;

const ERROR_HISTORY_PATHS = {
  html: { title: "HTML", mark: "HTML", href: (id) => "/html/exercice/" + id },
  css: { title: "CSS", mark: "CSS", href: (id) => "/css/exercice/" + id },
  javascript: { title: "JavaScript", mark: "JS", href: (id) => "/exercice/" + id },
  react: { title: "React", mark: "⚛", href: (id) => "/react/exercice/" + id },
  typescript: { title: "TypeScript", mark: "TS", href: (id) => "/typescript/exercice/" + id },
  node: { title: "Node.js", mark: "N", href: (id) => "/node/exercice/" + id },
  sql: { title: "SQL", mark: "SQL", href: (id) => "/sql/exercice/" + id },
};

function ensureErrorHistoryStore() {
  if (!Array.isArray(state.errorHistory)) state.errorHistory = [];
  return state.errorHistory;
}

function errorHistoryPath(exercise) {
  const id = exercise && exercise.id ? exercise.id : "";
  const path = exercise && exercise.path ? exercise.path : (typeof exercisePathFromId === "function" ? exercisePathFromId(id) : "javascript");
  return ERROR_HISTORY_PATHS[path] ? path : "javascript";
}

function errorHistoryPlainText(value, max) {
  const text = String(value == null ? "" : value).replace(/\r/g, "").trim();
  const limit = max || 1800;
  return text.length > limit ? text.slice(0, limit) + "\n…" : text;
}

function captureAttemptFromNode(node) {
  if (!node || !node.querySelectorAll) return "";
  const chunks = [];
  const checked = [...node.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked')];
  checked.forEach((input) => {
    const label = input.closest("label");
    chunks.push(label ? label.textContent.trim() : input.value);
  });
  const fields = [...node.querySelectorAll('textarea, input:not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"])')];
  fields.forEach((field) => {
    const value = String(field.value || "").trim();
    if (value) chunks.push(value);
  });
  return errorHistoryPlainText(chunks.join("\n\n"));
}

function errorHistoryFingerprint(exerciseId, attempt, message) {
  return [exerciseId, errorHistoryPlainText(attempt, 500), errorHistoryPlainText(message, 300)].join("|").toLowerCase();
}

function recordUsefulError(exercise, result, bodyNode) {
  if (!exercise || !exercise.id || !result || result.invalid) return null;
  const history = ensureErrorHistoryStore();
  const now = Date.now();
  const attempt = captureAttemptFromNode(bodyNode);
  const message = errorHistoryPlainText(result.message || "La réponse n’est pas encore correcte.", 700);
  const details = Array.isArray(result.details) ? result.details.map((x) => errorHistoryPlainText(x, 500)).filter(Boolean) : [];
  const fingerprint = errorHistoryFingerprint(exercise.id, attempt, message);
  const recent = history.find((entry) => entry.fingerprint === fingerprint && now - Number(entry.lastSeenAt || entry.createdAt || 0) <= ERROR_HISTORY_DEDUP_MS && !entry.resolvedAt);

  if (recent) {
    recent.lastSeenAt = now;
    recent.repeatCount = (Number(recent.repeatCount) || 1) + 1;
    recent.message = message;
    recent.details = details;
    commit();
    return recent;
  }

  const path = errorHistoryPath(exercise);
  const entry = {
    id: "err-" + now.toString(36) + "-" + Math.random().toString(36).slice(2, 7),
    exerciseId: exercise.id,
    path,
    notion: exercise.notion || "Notion à consolider",
    type: exercise.type || "exercise",
    question: errorHistoryPlainText(exercise.question || exercise.statement || "", 700),
    attempt,
    message,
    details,
    explanation: errorHistoryPlainText(exercise.explanation || exercise.retain || "", 1200),
    solution: errorHistoryPlainText(typeof exercise.solution === "string" ? exercise.solution : "", 1800),
    createdAt: now,
    lastSeenAt: now,
    repeatCount: 1,
    correctionSeen: false,
    resolvedAt: null,
    resolvedWithHelp: false,
    fingerprint,
  };
  history.unshift(entry);
  if (history.length > ERROR_HISTORY_MAX) history.length = ERROR_HISTORY_MAX;
  commit();
  return entry;
}

function markErrorCorrectionSeen(exercise) {
  if (!exercise || !exercise.id) return;
  const entry = ensureErrorHistoryStore().find((x) => x.exerciseId === exercise.id && !x.resolvedAt);
  if (!entry) return;
  entry.correctionSeen = true;
  entry.explanation = errorHistoryPlainText(exercise.explanation || exercise.retain || entry.explanation || "", 1200);
  if (!entry.solution && typeof exercise.solution === "string") entry.solution = errorHistoryPlainText(exercise.solution, 1800);
  commit();
}

function resolveUsefulErrors(exercise, session) {
  if (!exercise || !exercise.id) return;
  const now = Date.now();
  let changed = false;
  ensureErrorHistoryStore().forEach((entry) => {
    if (entry.exerciseId !== exercise.id || entry.resolvedAt) return;
    entry.resolvedAt = now;
    entry.resolvedWithHelp = Boolean(session && (session.correctionSeen || session.hints > 0 || session.fails > 0));
    changed = true;
  });
  if (changed) commit();
}

function errorHistoryEntries() {
  return ensureErrorHistoryStore().slice().sort((a, b) => Number(b.lastSeenAt || b.createdAt || 0) - Number(a.lastSeenAt || a.createdAt || 0));
}

function errorHistoryStats() {
  const all = errorHistoryEntries();
  const open = all.filter((x) => !x.resolvedAt);
  const resolved = all.filter((x) => x.resolvedAt);
  const repeated = all.filter((x) => (Number(x.repeatCount) || 1) >= 2);
  const notions = new Map();
  all.forEach((x) => notions.set(x.notion, (notions.get(x.notion) || 0) + (Number(x.repeatCount) || 1)));
  const topNotion = [...notions.entries()].sort((a, b) => b[1] - a[1])[0] || null;
  return { all, open, resolved, repeated, topNotion };
}

function removeUsefulError(id) {
  const history = ensureErrorHistoryStore();
  const index = history.findIndex((x) => x.id === id);
  if (index < 0) return false;
  history.splice(index, 1);
  commit();
  return true;
}

function clearResolvedUsefulErrors() {
  const history = ensureErrorHistoryStore();
  state.errorHistory = history.filter((x) => !x.resolvedAt);
  commit();
}
