// ui.js — les petits composants réutilisables : création d’éléments, éditeur, exercices.
// Ici, on construit la page avec le DOM (document.createElement…) : c’est un bon terrain d’étude !

// ─── h() : crée un élément HTML ───
// h("p", { class: "intro" }, "Bonjour")  →  <p class="intro">Bonjour</p>
// Les attributs qui commencent par "on" (onclick…) deviennent des écouteurs d’événements.
function h(tag, attrs, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (key === "class") element.className = value;
    else if (key === "html") element.innerHTML = value;
    else if (key.startsWith("on")) element.addEventListener(key.slice(2), value);
    else if (value === true) element.setAttribute(key, "");
    else if (value !== false && value != null) element.setAttribute(key, value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    element.append(child.nodeType ? child : document.createTextNode(child));
  }
  return element;
}

// ─── rich() : sécurise un texte et transforme `code` en <code>code</code> ───
function rich(text) {
  const safe = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return safe.replace(/`([^`]+)`/g, "<code>$1</code>");
}

function para(text, cls) {
  return h("p", { class: cls || "", html: rich(text) });
}

// Affiche une liste de blocs : paragraphes, listes { list }, ou code { code }.
function renderBlocks(blocks) {
  return blocks.map((block) => {
    if (typeof block === "string") return para(block);
    if (block.list) return h("ul", {}, block.list.map((item) => h("li", { html: rich(item) })));
    if (block.code) return codeBlock(block.code);
    return null;
  });
}

// ─── Bloc de code (lecture seule) ───
function codeBlock(code, numbered) {
  const pre = h("pre", { class: "code" + (numbered ? " numbered" : "") });
  code.split("\n").forEach((line) => {
    pre.append(h("span", { class: "line" }, line === "" ? " " : line));
  });
  return pre;
}

// ─── Éditeur de code ───
// Un <textarea> amélioré par editor.js : fermeture automatique des guillemets et parenthèses,
// suggestions, modèles de code, indentation. Ctrl + Entrée exécute le code.
function makeEditor(value, rows, onRun, language) {
  const editor = h("textarea", {
    class: "editor", rows: rows || 6, spellcheck: "false", autocapitalize: "off",
    autocomplete: "off", "aria-label": "Éditeur de code JavaScript",
  });
  editor.value = value;
  return enhanceEditor(editor, onRun, language);
}

// Petit aide-mémoire des raccourcis de l'éditeur.
function editorTips() {
  return h("details", { class: "tips" },
    h("summary", {}, "Raccourcis de l’éditeur"),
    h("ul", {},
      h("li", { html: rich("Tape un seul `\"`, `(`, `[` ou `{` : le caractère fermant s’ajoute tout seul. Retape-le pour passer par-dessus.") }),
      h("li", { html: rich("Des suggestions apparaissent en tapant : tes variables et fonctions, les mots-clés, les commandes de base.") }),
      h("li", { html: rich("Modèles : tape `log`, `for`, `if`, `fn`, `const`… puis Tab ou Entrée. Tab passe ensuite au champ suivant.") }),
      h("li", { html: rich("Après un point (`tableau.`, `console.`, `Math.`), la liste des méthodes s’affiche.") }),
      h("li", { html: rich("↑ ↓ choisissent une suggestion, Échap la ferme, Ctrl + Espace la rouvre.") }),
      h("li", { html: rich("Ctrl + Entrée exécute le code. Ctrl + / (clavier AZERTY : Ctrl + :) commente la ligne. Maj + Tab désindente.") }),
      h("li", { html: rich("Pour quitter l’éditeur au clavier : Échap, puis Tab.") })));
}

// ─── Traduire les messages d’erreur en conseils ───
function explainError(message) {
  if (/Cannot (read|set) properties of (null|undefined)/.test(message)) return "Tu utilises quelque chose qui n’existe pas (`null` ou `undefined`). Si c’est un élément de la page : id ou sélecteur incorrect, ou script exécuté avant que la page soit construite (place-le en bas du `<body>` ou ajoute `defer`).";
  if (/Failed to fetch/.test(message)) return "La requête n’a pas abouti (service injoignable, ou panne de réseau). Dans l’atelier, seule l’API simulée `https://api.cahierjs.test` répond : vérifie l’adresse.";
  if (/Promesse rejetée non gérée/.test(message)) return "Une promesse a été rejetée et personne ne l’a attrapée. Ajoute `.catch(...)`, ou entoure les `await` d’un `try / catch`.";
  if (/await is only valid/.test(message)) return "`await` ne s’utilise que dans une fonction déclarée avec `async`.";
  if (/Unexpected token|in JSON|JSON at position/.test(message)) return "Le texte n’est pas du JSON valide : clés et textes entre guillemets doubles, pas de virgule en trop.";
  if (/Impossible de charger/.test(message)) return "Vérifie le nom du fichier : il doit être écrit exactement pareil dans l’attribut `src` ou `href` et dans la liste des fichiers.";
  if (/trop longtemps/.test(message)) return "Vérifie ta boucle : sa condition devient-elle un jour fausse ?";
  if (/Assignment to constant/.test(message)) return "Tu essaies de changer une constante. Si la valeur doit changer, déclare-la avec `let`.";
  if (/before initialization/.test(message)) return "Tu utilises la variable avant de l’avoir créée. Crée-la plus haut dans le code.";
  if (/is not defined/.test(message)) return "Ce nom n’existe pas à cet endroit : faute de frappe, majuscule, oubli de déclaration, ou variable hors de sa portée ?";
  if (/is not a function/.test(message)) return "Tu essaies d’appeler quelque chose qui n’est pas une fonction.";
  if (/SyntaxError/.test(message)) return "Erreur d’écriture : il manque peut-être une parenthèse, une accolade, un guillemet ou un `;`.";
  return "Lis le message : il indique le type d’erreur et souvent le nom concerné.";
}

// Affiche le résultat d’une exécution : sorties console, erreur éventuelle.
function renderOutput(box, result) {
  box.replaceChildren();
  if (result.error) {
    box.append(h("div", { class: "out-error" },
      h("strong", {}, "Erreur : "), result.error,
      h("p", { class: "small", html: rich(explainError(result.error)) })));
  }
  if (result.logs && result.logs.length) {
    box.append(h("pre", { class: "out-logs" }, result.logs.join("\n")));
  } else if (!result.error) {
    box.append(h("p", { class: "muted small", html: rich("Aucune sortie. Utilise `console.log()` pour afficher une valeur.") }));
  }
}

// ─── Mini terrain de jeu : un éditeur + un bouton Exécuter ───
function renderPlayground(code, options) {
  const settings = options || {};
  const output = h("div", { class: "output", "aria-live": "polite" },
    h("p", { class: "muted small" }, "Clique sur Exécuter pour voir le résultat."));
  const rows = settings.rows || Math.min(14, code.split("\n").length + 1);

  async function run() {
    output.replaceChildren(h("p", { class: "muted small" }, "Exécution…"));
    renderOutput(output, await runCode(editor.value, []));
  }

  const editor = makeEditor(code, rows, run);
  return h("div", { class: "playground" },
    editor,
    h("div", { class: "toolbar" },
      h("button", { class: "btn primary", type: "button", onclick: run }, "Exécuter"),
      h("button", { class: "btn ghost", type: "button", onclick: () => {
        editor.value = code;
        output.replaceChildren(h("p", { class: "muted small" }, "Code remis à zéro."));
      } }, "Réinitialiser")),
    output,
    settings.tips ? editorTips() : null);
}

// ═══════════════════════════════════════════════════════════
//   Les exercices
// ═══════════════════════════════════════════════════════════

const TYPE_LABELS = {
  qcm: "QCM", vf: "Vrai ou faux", predict: "Prédire le résultat",
  fill: "Compléter le code", code: "Écrire du code", reactcode: "Atelier React", lab: "Atelier page web",
};
const DIFFICULTY_LABELS = { 1: "Facile", 2: "Moyen", 3: "Difficile" };
const HINT_TITLES = ["aide légère", "la notion à utiliser", "une partie de la solution"];

function normalizeOutput(text) {
  return text.split("\n").map((line) => line.trim().replace(/\s+/g, " ")).filter(Boolean).join("\n");
}

// Chaque « corps » d’exercice renvoie : node (l’affichage), reset(), lock(), evaluate().
// evaluate() renvoie : { invalid, ok, message, details }.

function buildChoiceBody(ex, labels, correctIndex, whyFor) {
  const name = "choice-" + ex.id + "-" + Math.random().toString(36).slice(2, 6);
  const list = h("div", { class: "options", role: "radiogroup", "aria-label": "Réponses possibles" });
  labels.forEach((label, index) => {
    list.append(h("label", { class: "option" },
      h("input", { type: "radio", name: name, value: index }),
      h("span", { html: rich(label) })));
  });
  return {
    node: list,
    reset() { list.querySelectorAll("input").forEach((input) => { input.checked = false; }); },
    lock() { list.querySelectorAll("input").forEach((input) => { input.disabled = true; }); },
    async evaluate() {
      const picked = list.querySelector("input:checked");
      if (!picked) return { invalid: true, message: "Choisis une réponse avant de valider." };
      const index = Number(picked.value);
      if (index === correctIndex) return { ok: true };
      return { ok: false, message: whyFor(index) || "Ce n’est pas la bonne réponse." };
    },
  };
}

function buildPredictBody(ex) {
  const input = h("textarea", { class: "answer", rows: ex.rows || 1, spellcheck: "false", "aria-label": "Ta réponse" });
  const help = ex.rows > 1 ? "Écris chaque ligne affichée sur une ligne séparée." : "Écris ce que le code affiche dans la console.";
  return {
    node: h("div", { class: "answer-wrap" }, h("p", { class: "muted small" }, help), input),
    reset() { input.value = ""; },
    lock() { input.disabled = true; },
    async evaluate() {
      const given = normalizeOutput(input.value);
      if (!given) return { invalid: true, message: "Écris ta réponse avant de valider." };
      const accepted = ex.answers.map(normalizeOutput);
      if (accepted.includes(given) || accepted.includes(given.replace(/["']/g, ""))) return { ok: true };
      const special = ex.common && ex.common[given];
      return { ok: false, message: special || "Ta réponse ne correspond pas à ce que le code affiche. Refais l’exécution ligne par ligne, comme le ferait JavaScript." };
    },
  };
}

function buildFillBody(ex) {
  const parts = ex.template.split("___");
  const inputs = [];
  const pre = h("pre", { class: "code fill" });
  parts.forEach((part, index) => {
    pre.append(part);
    if (index < parts.length - 1) {
      const input = h("input", { class: "blank", type: "text", size: 7, spellcheck: "false", autocomplete: "off", "aria-label": "Trou numéro " + (index + 1) });
      inputs.push(input);
      pre.append(input);
    }
  });
  return {
    node: pre,
    reset() { inputs.forEach((input) => { input.value = ""; input.classList.remove("ok", "ko"); }); },
    lock() { inputs.forEach((input) => { input.disabled = true; }); },
    async evaluate() {
      if (inputs.some((input) => input.value.trim() === "")) return { invalid: true, message: "Remplis tous les trous avant de valider." };
      const wrong = [];
      inputs.forEach((input, index) => {
        const accepted = [].concat(ex.answers[index]);
        const good = accepted.includes(input.value.trim());
        input.classList.toggle("ok", good);
        input.classList.toggle("ko", !good);
        if (!good) wrong.push(index);
      });
      if (wrong.length === 0) return { ok: true };
      return {
        ok: false,
        message: wrong.length === 1 ? "Un trou est incorrect." : wrong.length + " trous sont incorrects.",
        details: wrong.map((index) => "Trou " + (index + 1) + " : " + ((ex.why && ex.why[index]) || "ce n’est pas la bonne valeur.")),
      };
    },
  };
}

function buildCodeBody(ex) {
  const output = h("div", { class: "output", "aria-live": "polite" },
    h("p", { class: "muted small", html: rich("Exécuter affiche le résultat de ton code. Valider le vérifie.") }));

  async function run() {
    output.replaceChildren(h("p", { class: "muted small" }, "Exécution…"));
    renderOutput(output, await runCode(editor.value, []));
  }

  const editor = makeEditor(ex.starter, Math.max(8, ex.starter.split("\n").length + 4), run);
  return {
    node: h("div", { class: "playground" }, editor,
      h("div", { class: "toolbar" }, h("button", { class: "btn", type: "button", onclick: run }, "Exécuter")),
      output,
      editorTips()),
    reset() { editor.value = ex.starter; output.replaceChildren(); },
    lock() { editor.readOnly = true; },
    async evaluate() {
      const code = editor.value;
      if (code.trim() === "" || code.trim() === ex.starter.trim()) {
        return { invalid: true, message: "Écris ton code dans l’éditeur avant de valider." };
      }
      const result = await runCode(code, ex.tests, 2000);
      renderOutput(output, result);
      if (result.error) {
        return { ok: false, message: "Ton code produit une erreur : " + result.error, details: [explainError(result.error)] };
      }
      const problems = [];
      for (const rule of ex.mustContain || []) {
        if (!new RegExp(rule.re).test(code)) problems.push(rule.msg);
      }
      for (const expected of ex.expectLogs || []) {
        if (!result.logs.includes(expected)) problems.push("La console devrait afficher « " + expected + " ».");
      }
      for (const test of result.results) {
        if (!test.pass) {
          problems.push(test.label + " — ton code donne " + test.got + ", attendu : " + test.expected + ".");
        }
      }
      if (problems.length === 0) return { ok: true };
      return { ok: false, message: "Ton code ne fait pas encore ce qui est demandé.", details: problems };
    },
  };
}

function buildReactCodeBody(ex) {
  const editor = makeEditor(ex.starter || "", ex.rows || 14, null, "react");
  const note = para("Validation structurelle : la plateforme analyse ton JSX/React sans prétendre exécuter un projet Vite complet.", "muted small");
  return {
    node: h("div", { class: "playground react-playground" }, editor, note, editorTips()),
    reset() { editor.value = ex.starter || ""; },
    lock() { editor.readOnly = true; },
    async evaluate() {
      const code = editor.value;
      if (!code.trim() || code.trim() === String(ex.starter || "").trim()) {
        return { invalid: true, message: "Modifie le code avant de valider." };
      }
      const problems = [];
      for (const check of ex.checks || []) {
        const ok = check.re ? new RegExp(check.re, check.flags || "").test(code) : true;
        if (!ok) problems.push(check.msg || check.label || "Un critère n’est pas encore respecté.");
      }
      return problems.length === 0
        ? { ok: true }
        : { ok: false, message: "Ton code React n’est pas encore complet.", details: problems };
    },
  };
}

function buildLabBody(ex) {
  const lab = renderLab({ files: ex.files, previewHeight: ex.previewHeight, tips: true });
  return {
    node: lab.node,
    reset() { lab.reset(); },
    lock() { lab.lock(); },
    async evaluate() {
      const files = lab.getFiles();
      if (files.every((file, index) => file.code.trim() === lab.starter[index].code.trim())) {
        return { invalid: true, message: "Modifie le code avant de valider." };
      }
      const result = await lab.run(ex.tests || [], ex.actions || []);
      if (result.timeout) return { ok: false, message: result.error };
      if (result.error) {
        return { ok: false, message: "La page produit une erreur : " + result.error, details: [explainError(result.error)] };
      }
      const problems = checkLab(ex, files, result);
      if (problems.length === 0) return { ok: true };
      return { ok: false, message: "La page ne fait pas encore ce qui est demandé.", details: problems };
    },
  };
}

function buildBody(ex) {
  if (ex.type === "qcm") return buildChoiceBody(ex, ex.options, ex.answer, (i) => ex.why && ex.why[i]);
  if (ex.type === "vf") return buildChoiceBody(ex, ["Vrai", "Faux"], ex.answer ? 0 : 1, () => ex.why);
  if (ex.type === "predict") return buildPredictBody(ex);
  if (ex.type === "fill") return buildFillBody(ex);
  if (ex.type === "lab") return buildLabBody(ex);
  if (ex.type === "reactcode") return buildReactCodeBody(ex);
  return buildCodeBody(ex);
}

// La bonne réponse, affichée dans la correction.
function solutionNode(ex) {
  if (ex.type === "qcm") {
    return h("p", { html: "Bonne réponse : <strong>" + "ABCD"[ex.answer] + "</strong> — " + rich(ex.options[ex.answer]) });
  }
  if (ex.type === "vf") return h("p", { html: "Bonne réponse : <strong>" + (ex.answer ? "Vrai" : "Faux") + "</strong>" });
  if (ex.type === "predict") return codeBlock(ex.answers[0]);
  if (ex.type === "fill") {
    let index = 0;
    return codeBlock(ex.template.replace(/___/g, () => [].concat(ex.answers[index++])[0]));
  }
  if (ex.type === "lab") {
    return h("div", {}, ex.solution.map((file) => h("div", {}, h("p", { class: "muted small" }, file.name), codeBlock(file.code))));
  }
  if (ex.type === "reactcode") return codeBlock(ex.solution || "");
  return codeBlock(ex.solution);
}

function explanationBox(ex, withSolution) {
  const box = h("div", { class: "correction" }, h("h4", {}, withSolution ? "Correction" : "Explication"));
  if (withSolution) box.append(solutionNode(ex));
  box.append(para(ex.explanation));
  box.append(h("p", { class: "retain", html: "<strong>À retenir :</strong> " + rich(ex.retain) }));
  return box;
}

// ─── Le composant exercice ───
// options.quick : mode révision rapide (un seul essai, pas d’indices)
// options.onFinish(ok) : appelé quand l’exercice est terminé
function renderExercise(ex, options) {
  const settings = options || {};
  const quick = settings.quick === true;
  const session = { fails: 0, hints: 0, solved: false, correctionSeen: false, finished: false };
  const body = buildBody(ex);

  const feedback = h("div", { class: "feedback", "aria-live": "polite" });
  const hintsBox = h("div", { class: "hints" });
  const correctionBox = h("div", {});
  const note = h("p", { class: "muted small" });

  const checkBtn = h("button", { class: "btn primary", type: "button", onclick: submit }, "Valider");
  const hintBtn = h("button", { class: "btn", type: "button", onclick: revealHint }, "Indice 1");
  const correctionBtn = h("button", { class: "btn", type: "button", onclick: showCorrection }, "Voir la correction");
  const resetBtn = h("button", { class: "btn ghost", type: "button", onclick: () => { body.reset(); feedback.replaceChildren(); feedback.className = "feedback"; } }, "Réinitialiser");
  const actions = h("div", { class: "toolbar" }, checkBtn);
  if (!quick) actions.append(hintBtn, correctionBtn, resetBtn);

  const root = h("article", { class: "exercise" },
    h("div", { class: "ex-meta" },
      h("span", { class: "badge type" }, ex.label || TYPE_LABELS[ex.type]),
      h("span", { class: "badge d" + ex.difficulty }, DIFFICULTY_LABELS[ex.difficulty]),
      h("span", { class: "badge notion" }, ex.notion)),
    ex.type === "vf" ? h("p", { class: "question" }, "Vrai ou faux ?") : para(ex.question, "question"),
    ex.type === "vf" ? para(ex.statement, "statement") : null,
    ex.code && ex.type !== "code" && ex.type !== "lab" ? codeBlock(ex.code, true) : null,
    body.node,
    actions,
    note,
    feedback,
    hintsBox,
    correctionBox);

  refreshButtons();

  function refreshButtons() {
    if (quick) return;
    const left = ex.hints.length - session.hints;
    hintBtn.textContent = left > 0 ? "Indice " + (session.hints + 1) : "Plus d’indice";
    hintBtn.disabled = left <= 0 || session.solved;
    const unlocked = session.fails >= 2 || session.solved;
    correctionBtn.disabled = !unlocked || session.correctionSeen;
    note.textContent = unlocked ? "" : "La correction se débloque après 2 essais ratés. Tu peux ouvrir les indices à tout moment.";
  }

  function revealHint() {
    if (session.hints >= ex.hints.length || session.solved) return;
    const n = session.hints;
    hintsBox.append(h("div", { class: "hint" },
      h("strong", {}, "Indice " + (n + 1) + " : " + HINT_TITLES[n]),
      para(ex.hints[n])));
    session.hints++;
    refreshButtons();
  }

  function showCorrection() {
    // La correction n'est jamais disponible avant 2 essais ratés (sauf si l'exercice est déjà réussi).
    if (!(session.fails >= 2 || session.solved)) return;
    session.correctionSeen = true;
    recordCorrection(ex);
    correctionBox.replaceChildren(explanationBox(ex, true));
    refreshButtons();
  }

  function finish(ok) {
    session.finished = true;
    body.lock();
    checkBtn.disabled = true;
    if (settings.onFinish) settings.onFinish(ok);
  }

  async function submit() {
    if (session.finished) return;
    const result = await body.evaluate();
    if (result.invalid) {
      feedback.className = "feedback info";
      feedback.replaceChildren(para(result.message));
      return;
    }
    if (result.ok) {
      session.solved = true;
      const info = recordResult(ex, true, session);
      showSuccess(info);
      finish(true);
    } else {
      session.fails++;
      recordResult(ex, false, session);
      showFailure(result);
    }
    refreshButtons();
  }

  function showSuccess(info) {
    feedback.className = "feedback ok";
    feedback.replaceChildren(h("strong", {}, "Bravo, c’est correct !"));
    if (!quick) {
      if (info.clean) feedback.append(para("Réussi sans erreur : la notion avance bien. +" + info.points + " point" + (info.points > 1 ? "s" : "") + "."));
      else if (session.correctionSeen) feedback.append(para("Réussi après avoir vu la correction : 0 point. Refais cet exercice plus tard, sans aide, pour valider la notion."));
      else feedback.append(para("Réussi, mais avec de l’aide (+" + info.points + " point" + (info.points > 1 ? "s" : "") + "). Refais-le plus tard sans aide pour valider la notion."));
    }
    correctionBox.replaceChildren(explanationBox(ex, false));
    if (!quick) hintBtn.disabled = true;
    if (!quick) {
      feedback.append(h("button", { class: "btn small", type: "button", onclick: () => root.replaceWith(renderExercise(ex, settings)) }, "Refaire cet exercice"));
    }
  }

  function showFailure(result) {
    feedback.className = "feedback ko";
    feedback.replaceChildren(h("strong", {}, "Pas tout à fait."), para(result.message));
    if (result.details) feedback.append(h("ul", {}, result.details.map((line) => h("li", { html: rich(line) }))));

    if (quick) {
      correctionBox.replaceChildren(explanationBox(ex, true));
      finish(false);
      return;
    }
    // Aide progressive : 1er échec → indice 1, 2e échec → indice 2 + correction disponible.
    if (session.fails === 1) {
      if (session.hints < 1) revealHint();
      feedback.append(para("Relis l’indice, puis réessaie."));
    } else if (session.fails === 2) {
      if (session.hints < 2) revealHint();
      feedback.append(para("Un deuxième indice est apparu, et la correction est maintenant disponible. Essaie encore une fois si tu veux."));
    } else {
      feedback.append(para("Tu peux ouvrir l’indice suivant ou voir la correction."));
    }
  }

  return root;
}
