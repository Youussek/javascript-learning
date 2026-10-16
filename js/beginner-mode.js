// beginner-mode.js — couche pédagogique optionnelle commune à tous les parcours.
// Le mode débutant ne remplace jamais les cours : il ajoute des repères simples,
// un plan d'action et un mini-vocabulaire basé sur les notions réellement visibles.

const BEGINNER_LANGUAGE_GUIDES = {
  html: {
    label: "HTML",
    question: "Demande-toi d'abord : quel rôle joue chaque balise dans la structure de la page ?",
    method: ["Repère la balise ouvrante et fermante.", "Lis ses attributs éventuels.", "Observe ce qu'elle contient.", "Modifie une seule chose puis regarde le résultat."]
  },
  css: {
    label: "CSS",
    question: "Commence par séparer le sélecteur de la propriété : qui est ciblé, puis qu'est-ce qui change ?",
    method: ["Repère le sélecteur.", "Trouve la propriété modifiée.", "Observe sa valeur.", "Change une valeur à la fois et compare visuellement."]
  },
  javascript: {
    label: "JavaScript",
    question: "Suis le trajet des données : quelle valeur entre, quelle instruction la transforme, quel résultat sort ?",
    method: ["Repère les variables importantes.", "Lis le code de haut en bas.", "Prédis le résultat avant d'exécuter.", "Teste une petite modification puis compare."]
  },
  react: {
    label: "React",
    question: "Repère les données du composant : props, state, événements, puis regarde ce qui est rendu à l'écran.",
    method: ["Identifie le composant.", "Repère ses props et son state.", "Cherche l'événement qui déclenche un changement.", "Observe ce que le JSX affiche après ce changement."]
  },
  typescript: {
    label: "TypeScript",
    question: "Demande-toi toujours : quelle forme de donnée est autorisée, et qu'est-ce que TypeScript essaie d'empêcher ?",
    method: ["Repère la valeur manipulée.", "Lis son type attendu.", "Compare type attendu et type reçu.", "Utilise le diagnostic pour corriger l'écart."]
  },
  node: {
    label: "Node.js",
    question: "Repère l'entrée, le traitement et la sortie : argument terminal, fichier, requête HTTP ou donnée retournée.",
    method: ["Repère ce qui lance le programme.", "Identifie les données d'entrée.", "Suis les opérations dans l'ordre.", "Observe la sortie terminal, fichier ou HTTP."]
  },
  sql: {
    label: "SQL",
    question: "Avant d'écrire la requête : quelles tables, quelles colonnes et quelles lignes veux-tu obtenir ?",
    method: ["Choisis les tables utiles.", "Détermine les colonnes attendues.", "Ajoute les filtres ou relations nécessaires.", "Exécute puis compare le résultat à ton objectif."]
  }
};

function beginnerModeEnabled() {
  return !!(state && state.learningMode === "beginner");
}

function setBeginnerMode(enabled) {
  state.learningMode = enabled ? "beginner" : "normal";
  commit();
  applyBeginnerMode();
  window.dispatchEvent(new CustomEvent("learning-mode-changed", { detail: { mode: state.learningMode } }));
}

function toggleBeginnerMode() {
  setBeginnerMode(!beginnerModeEnabled());
}

function beginnerRouteInfo() {
  const path = (location.hash || "#/ ").replace(/^#/, "");
  const segments = path.split("/").filter(Boolean);
  let language = "javascript";
  let type = "other";

  if (["react", "css", "html", "typescript", "node", "sql"].includes(segments[0])) {
    language = segments[0];
    if (segments[1] === "cours") type = "lesson";
    if (segments[1] === "exercice") type = "exercise";
  } else {
    if (segments[0] === "cours") type = "lesson";
    if (segments[0] === "exercice") type = "exercise";
  }

  return { path, language, type };
}

function beginnerModeButton(button) {
  if (!button) return;
  const enabled = beginnerModeEnabled();
  button.setAttribute("aria-pressed", String(enabled));
  button.classList.toggle("active", enabled);
  const label = button.querySelector(".learning-mode-label");
  if (label) label.textContent = enabled ? "Mode débutant : activé" : "Mode débutant";
  else button.textContent = enabled ? "Mode débutant : activé" : "Mode débutant";
  button.title = enabled ? "Désactiver les aides supplémentaires" : "Afficher davantage de repères et d'explications";
}

function syncBeginnerModeButtons() {
  beginnerModeButton(document.getElementById("beginner-mode-toggle"));
  beginnerModeButton(document.getElementById("beginner-mode-toggle-mobile"));
}

function beginnerVocabulary(root, limit) {
  if (!root || typeof codeHelpEntry !== "function") return [];
  if (typeof enhanceCodeHelpTree === "function") enhanceCodeHelpTree(root);
  const language = beginnerRouteInfo().language;
  const seen = new Set();
  const items = [];
  root.querySelectorAll(".code-help-token[data-code-help]").forEach(token => {
    if (items.length >= (limit || 5)) return;
    const key = token.dataset.codeHelp;
    if (!key || seen.has(key)) return;
    const entry = codeHelpEntry(key, language);
    if (!entry) return;
    seen.add(key);
    items.push({ key, entry });
  });
  return items;
}

function beginnerVocabularyCard(item) {
  return h("article", { class: "beginner-vocab-card" },
    h("code", { class: "beginner-vocab-token" }, item.entry.title || item.key),
    h("p", {}, item.entry.description || "Notion utilisée dans cet exemple."),
    item.entry.example ? h("pre", { class: "beginner-vocab-example" }, item.entry.example) : null
  );
}

function buildBeginnerLessonGuide(page, language) {
  const guide = BEGINNER_LANGUAGE_GUIDES[language] || BEGINNER_LANGUAGE_GUIDES.javascript;
  const title = page.querySelector("h1")?.textContent?.trim() || "cette leçon";
  const vocabulary = beginnerVocabulary(page, 5);

  return h("aside", { class: "beginner-guide", "data-beginner-generated": "1", "aria-label": "Aide du mode débutant" },
    h("div", { class: "beginner-guide-head" },
      h("div", {},
        h("span", { class: "beginner-pill" }, "MODE DÉBUTANT"),
        h("h2", {}, "Avant de commencer · " + title)),
      h("button", { class: "btn small ghost", type: "button", onclick: () => setBeginnerMode(false) }, "Quitter le mode")),
    h("div", { class: "beginner-guide-grid" },
      h("section", { class: "beginner-guide-card" },
        h("h3", {}, "Objectif en clair"),
        h("p", {}, "Comprends une seule idée à la fois. Tu n'as pas besoin de mémoriser tout le code : cherche d'abord ce qui change et pourquoi."),
        h("p", { class: "beginner-language-question" }, guide.question)),
      h("section", { class: "beginner-guide-card" },
        h("h3", {}, "Ta méthode en 4 étapes"),
        h("ol", { class: "beginner-steps" }, guide.method.map(step => h("li", {}, step))))),
    vocabulary.length ? h("details", { class: "beginner-vocabulary" },
      h("summary", {}, "Vocabulaire utile de cette leçon · " + vocabulary.length + " notions"),
      h("div", { class: "beginner-vocab-grid" }, vocabulary.map(beginnerVocabularyCard)),
      h("p", { class: "muted small" }, "Tu peux aussi survoler une commande dans le code — ou appuyer dessus sur mobile — pour obtenir son explication.")) : null
  );
}

function buildBeginnerExerciseGuide(page, language) {
  const guide = BEGINNER_LANGUAGE_GUIDES[language] || BEGINNER_LANGUAGE_GUIDES.javascript;
  return h("aside", { class: "beginner-exercise-guide", "data-beginner-generated": "1", "aria-label": "Méthode débutant pour l'exercice" },
    h("span", { class: "beginner-pill" }, "MODE DÉBUTANT"),
    h("div", {},
      h("strong", {}, "Avant de modifier le code"),
      h("p", {}, guide.question)),
    h("ol", { class: "beginner-exercise-steps" },
      h("li", {}, "Reformule la consigne avec tes propres mots."),
      h("li", {}, "Repère la notion ou la commande importante."),
      h("li", {}, "Change le minimum nécessaire."),
      h("li", {}, "Exécute, puis lis le résultat ou le message d'erreur avant de retoucher le code."))
  );
}

function removeBeginnerGenerated() {
  document.querySelectorAll("[data-beginner-generated='1']").forEach(node => node.remove());
}

function enhanceBeginnerPage() {
  removeBeginnerGenerated();
  if (!beginnerModeEnabled()) return;
  const page = document.querySelector("#main .page");
  if (!page) return;
  const info = beginnerRouteInfo();
  if (info.type === "lesson") {
    const anchor = page.querySelector(".page-head") || page.querySelector(".sheet");
    const guide = buildBeginnerLessonGuide(page, info.language);
    if (anchor && anchor.parentNode) anchor.insertAdjacentElement("afterend", guide);
    else page.prepend(guide);
  } else if (info.type === "exercise") {
    const exercise = page.querySelector(".exercise, .exercise-card, .block") || page.children[1];
    const guide = buildBeginnerExerciseGuide(page, info.language);
    if (exercise && exercise.parentNode) exercise.parentNode.insertBefore(guide, exercise);
    else page.prepend(guide);
  }
}

let beginnerEnhanceTimer = null;
function scheduleBeginnerEnhancement() {
  clearTimeout(beginnerEnhanceTimer);
  beginnerEnhanceTimer = setTimeout(enhanceBeginnerPage, 20);
}

function applyBeginnerMode() {
  const enabled = beginnerModeEnabled();
  document.documentElement.dataset.learningMode = enabled ? "beginner" : "normal";
  document.body && document.body.classList.toggle("beginner-mode", enabled);
  syncBeginnerModeButtons();
  scheduleBeginnerEnhancement();
}

function startBeginnerMode() {
  const desktop = document.getElementById("beginner-mode-toggle");
  const mobile = document.getElementById("beginner-mode-toggle-mobile");
  [desktop, mobile].forEach(button => {
    if (!button || button.dataset.learningModeBound) return;
    button.dataset.learningModeBound = "1";
    button.addEventListener("click", toggleBeginnerMode);
  });

  const main = document.getElementById("main");
  if (main && typeof MutationObserver !== "undefined") {
    new MutationObserver(scheduleBeginnerEnhancement).observe(main, { childList: true, subtree: false });
  }
  window.addEventListener("hashchange", scheduleBeginnerEnhancement);
  window.addEventListener("progress-changed", syncBeginnerModeButtons);
  applyBeginnerMode();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startBeginnerMode, { once: true });
else startBeginnerMode();
