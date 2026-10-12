// app.js — le chef d’orchestre : navigation (routeur) et pages du site.
//
// Le « routeur » regarde la partie de l’adresse après le # (par exemple #/cours/variables),
// choisit la bonne page, et la dessine dans <main>.

const main = document.getElementById("main");

// ─── Petits outils ───
function link(href, text, cls) {
  return h("a", { href: "#" + href, class: cls || "" }, text);
}

function bar(percent) {
  return h("div", { class: "bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent },
    h("span", { style: "width:" + percent + "%" }));
}

function statusBadge(status) {
  return h("span", { class: "status " + status.key }, h("span", { "aria-hidden": "true" }, status.symbol), " " + status.label);
}

function pageTitle(title, subtitle) {
  return h("header", { class: "page-head" }, h("h1", {}, title), subtitle ? para(subtitle, "lead") : null);
}

function empty(text) {
  return h("p", { class: "empty", html: rich(text) });
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


// Les modules ouverts, et celui sur lequel on travaille en ce moment (le premier pas encore terminé).
function availableModules() {
  return MODULES.filter((module) => module.available);
}

function currentModule() {
  const open = availableModules();
  return open.find((module) => moduleStats(module.id).percent < 100) || open[open.length - 1];
}

// Un exemple de cours : soit un éditeur JavaScript seul (code), soit un atelier de page web (files).
function demo(item) {
  if (item.files) return renderLab({ files: item.files, resetButton: true }).node;
  return renderPlayground(item.code);
}

// ─── Barre latérale ───
function renderNav() {
  const nav = document.getElementById("nav");
  const path = location.hash.replace(/^#/, "") || "/";
  const items = [
    { href: "/", text: "Accueil", prefix: null },
    { href: "/cours", text: "Cours", prefix: "/cours" },
    { href: "/exercices", text: "Exercices", prefix: "/exercice" },
    { href: "/revision", text: "Révision", prefix: "/revision" },
    { href: "/projets", text: "Projets", prefix: "/projet" },
    { href: "/progression", text: "Progression", prefix: "/progression" },
  ];

  const mainLinks = items.map((item) => {
    const active = item.prefix === null ? path === "/" : path.startsWith(item.prefix);
    return h("a", { href: "#" + item.href, class: "nav-link", "aria-current": active ? "page" : null }, item.text);
  });

  const levels = MODULES.map((module) => {
    if (!module.available) {
      return h("li", { class: "level locked" },
        h("span", {}, "Niveau " + module.number + " · " + module.title), h("small", {}, "Bientôt"));
    }
    const stats = moduleStats(module.id);
    return h("li", { class: "level" },
      h("div", { class: "level-title" }, h("span", {}, "Niveau " + module.number + " · " + module.title), h("small", {}, stats.percent + " %")),
      h("ul", { class: "lesson-links" }, lessonsOf(module.id).map((lesson) => {
        const s = lessonStats(lesson.id);
        const mark = s.review > 0 ? "!" : s.done && s.solved === s.total ? "✓" : "";
        return h("li", {},
          h("a", { href: "#/cours/" + lesson.id, "aria-current": path === "/cours/" + lesson.id ? "page" : null },
            h("span", {}, lesson.title), h("span", { class: "mark " + (s.review > 0 ? "review" : "ok") }, mark)));
      })));
  });

  nav.replaceChildren(
    h("div", { class: "nav-main" }, mainLinks),
    h("p", { class: "nav-heading" }, "Programme"),
    h("ul", { class: "levels" }, levels));
}

// ═══════════ Accueil ═══════════
const HERO_CODE = `const prenom = "toi";
console.log("Bonjour " + prenom + " !");

for (let i = 1; i <= 3; i++) {
  console.log("Tour " + i);
}`;

function renderHome() {
  const module = currentModule();
  const stats = moduleStats(module.id);
  const last = state.lastLesson ? getLesson(state.lastLesson) : null;
  const next = nextLesson();
  const toReview = reviewExercises().slice(0, 4);

  const resume = last
    ? link("/cours/" + last.id, "Reprendre : " + last.title, "btn primary big")
    : link("/cours/" + LESSONS[0].id, "Commencer par les variables", "btn primary big");

  return h("div", { class: "page home" },
    h("section", { class: "hero" },
      h("div", { class: "hero-text" },
        h("h1", {}, "Apprends JavaScript en l’écrivant."),
        para("Des cours courts, des exercices avec indices progressifs et un éditeur dans la page. Le site garde la trace de tes erreurs pour te les faire revoir.", "lead"),
        h("div", { class: "toolbar" }, resume, link("/cours", "Voir tous les cours", "btn big"))),
      h("div", { class: "hero-demo" },
        h("p", { class: "demo-title" }, "Essaie tout de suite : modifie le code, puis exécute-le."),
        renderPlayground(HERO_CODE, { rows: 7, tips: true }))),

    h("section", { class: "block" },
      h("h2", {}, "Ma progression"),
      h("div", { class: "panel progress-panel" },
        h("p", { class: "level-line", html: "Niveau en cours : <strong>Niveau " + module.number + " · " + rich(module.title) + "</strong> (" + levelName(stats.percent).toLowerCase() + ")" }),
        bar(stats.percent),
        para(stats.percent + " % du niveau " + module.number + " · " + stats.solved + " exercice" + (stats.solved > 1 ? "s" : "") + " réussi" + (stats.solved > 1 ? "s" : "") + " sur " + stats.total + " · " + stats.points + " point" + (stats.points > 1 ? "s" : "") + " sur " + stats.maxPoints, "muted"),
        next ? para("Prochain cours conseillé : " + next.title + ".", "muted") : null,
        next ? link("/cours/" + next.id, "Ouvrir ce cours", "btn small") : null)),

    h("section", { class: "block" },
      h("h2", {}, "À refaire"),
      toReview.length === 0
        ? empty("Rien à refaire pour l’instant. Les exercices ratés ou réussis avec de l’aide apparaîtront ici.")
        : h("ul", { class: "rows" }, toReview.map((ex) => h("li", { class: "row" },
            h("div", {}, h("strong", {}, ex.notion), h("p", { class: "muted small" }, TYPE_LABELS[ex.type] + " · " + getLesson(ex.lesson).title)),
            link("/exercice/" + ex.id, "Refaire", "btn small"))))),

    h("section", { class: "block" },
      h("h2", {}, "Les modules"),
      h("ol", { class: "modules" }, MODULES.map((m) => {
        const s = m.available ? moduleStats(m.id) : null;
        return h("li", { class: "module" + (m.available ? "" : " locked") },
          h("div", {},
            h("h3", {}, "Niveau " + m.number + " · " + m.title),
            para(m.description, "muted")),
          m.available
            ? h("div", { class: "module-side" }, bar(s.percent), h("span", { class: "muted small" }, s.percent + " %"), link("/cours", "Ouvrir", "btn small"))
            : h("span", { class: "badge soon" }, "Bientôt"));
      }))));
}

// ═══════════ Liste des cours ═══════════
function renderCourses() {
  return h("div", { class: "page" },
    pageTitle("Cours", "Suis les cours dans l’ordre : chacun s’appuie sur le précédent."),
    availableModules().map((module) => h("section", { class: "block" },
      h("h2", {}, "Niveau " + module.number + " · " + module.title),
      h("ol", { class: "rows lessons" }, lessonsOf(module.id).map((lesson, index) => {
        const s = lessonStats(lesson.id);
        return h("li", { class: "row" },
          h("span", { class: "num", "aria-hidden": "true" }, index + 1),
          h("div", { class: "row-main" },
            link("/cours/" + lesson.id, lesson.title, "row-title"),
            h("p", { class: "muted small" }, lesson.minutes + " min · " + s.solved + "/" + s.total + " exercices réussis" + (s.review ? " · " + s.review + " à revoir" : ""))),
          h("span", { class: "badge level-badge" }, lesson.level),
          h("div", { class: "row-bar" }, bar(s.percent)));
      })))));
}

// ═══════════ Un cours ═══════════
function section(number, title, ...content) {
  return h("section", { class: "lesson-section" }, h("h2", {}, h("span", { class: "step" }, number), title), content);
}

function renderLesson(id) {
  const lesson = getLesson(id);
  if (!lesson) return renderNotFound();
  setLastLesson(id);

  const exercises = exercisesOf(id);
  const index = LESSONS.indexOf(lesson);
  const previous = LESSONS[index - 1];
  const following = LESSONS[index + 1];
  const firstTodo = exercises.find((ex) => !getRecord(ex.id).success) || exercises[0];

  const exerciseList = h("ul", { class: "rows compact" }, exercises.map((ex) => h("li", { class: "row" },
    h("div", { class: "row-main" },
      link("/exercice/" + ex.id, TYPE_LABELS[ex.type] + (ex.label ? " · " + ex.label : ""), "row-title"),
      h("p", { class: "muted small" }, ex.notion)),
    h("span", { class: "badge d" + ex.difficulty }, DIFFICULTY_LABELS[ex.difficulty]),
    statusBadge(exerciseStatus(ex)))));

  return h("div", { class: "page lesson" },
    h("p", { class: "crumbs" }, link("/cours", "Cours"), " / ", lesson.title),
    h("header", { class: "page-head" },
      h("h1", {}, lesson.title),
      h("div", { class: "ex-meta" },
        h("span", { class: "badge level-badge" }, lesson.level),
        h("span", { class: "muted small" }, lesson.minutes + " minutes"))),

    h("div", { class: "sheet" },
      section(1, "L’explication", renderBlocks(lesson.explanation)),

      section(2, "Un exemple",
        para(lesson.example.intro || "Modifie le code si tu veux, puis exécute-le."),
        demo(lesson.example)),

      section(3, "Le code expliqué",
        h("ul", { class: "walk" }, lesson.codeExplanation.map((item) => h("li", {},
          h("code", {}, item.code), h("p", { html: rich(item.text) }))))),

      section(4, "Un exemple concret",
        para(lesson.concrete.intro),
        demo(lesson.concrete)),

      section(5, "Les erreurs fréquentes",
        para("Exécute chaque exemple pour voir ce qui se passe, puis lis l’explication."),
        lesson.mistakes.map((m) => h("div", { class: "mistake" },
          h("h3", {}, m.title),
          demo(m),
          para(m.text)))),

      section(6, "Le résumé",
        h("ul", { class: "summary" }, lesson.summary.map((line) => h("li", { html: rich(line) })))),

      section(7, "Les exercices",
        para("Tu as " + exercises.length + " exercices pour ce cours. Les indices s’ouvrent un par un, et la correction n’arrive qu’après deux essais."),
        exerciseList,
        h("div", { class: "toolbar" },
          h("button", { class: "btn primary big", type: "button", onclick: () => {
            markLessonDone(id);
            location.hash = "#/exercice/" + firstTodo.id;
          } }, "Commencer les exercices")))),

    h("nav", { class: "pager", "aria-label": "Cours précédent et suivant" },
      previous ? link("/cours/" + previous.id, "← " + previous.title) : h("span"),
      following ? link("/cours/" + following.id, following.title + " →") : h("span")));
}

// ═══════════ Liste des exercices ═══════════
function renderExerciseList() {
  return h("div", { class: "page" },
    pageTitle("Exercices", "Tous les exercices, regroupés par cours."),
    availableModules().flatMap((module) => lessonsOf(module.id)).map((lesson) => h("section", { class: "block" },
      h("h2", {}, link("/cours/" + lesson.id, lesson.title)),
      h("ul", { class: "rows compact" }, exercisesOf(lesson.id).map((ex) => h("li", { class: "row" },
        h("div", { class: "row-main" },
          link("/exercice/" + ex.id, TYPE_LABELS[ex.type] + (ex.label ? " · " + ex.label : ""), "row-title"),
          h("p", { class: "muted small" }, ex.notion)),
        h("span", { class: "badge d" + ex.difficulty }, DIFFICULTY_LABELS[ex.difficulty]),
        statusBadge(exerciseStatus(ex))))))));
}

// ═══════════ Un exercice ═══════════
function renderExercisePage(id) {
  const ex = getExercise(id);
  if (!ex) return renderNotFound();
  const lesson = getLesson(ex.lesson);
  const siblings = exercisesOf(ex.lesson);
  const position = siblings.indexOf(ex);
  const previous = siblings[position - 1];
  const following = siblings[position + 1];
  const nextBox = h("div", { class: "next-box" });

  const exercise = renderExercise(ex, {
    onFinish: () => {
      nextBox.replaceChildren(following
        ? link("/exercice/" + following.id, "Exercice suivant →", "btn primary big")
        : link("/cours/" + lesson.id, "Retour au cours", "btn primary big"));
    },
  });

  const record = getRecord(ex.id);
  const previousNote = record.attempts > 0
    ? para("Déjà tenté " + record.attempts + " fois" + (record.success ? " · déjà réussi" : "") + (record.review ? " · marqué « à revoir »" : "") + ".", "muted small")
    : null;

  return h("div", { class: "page exercise-page" },
    h("p", { class: "crumbs" }, link("/cours/" + lesson.id, lesson.title), " / Exercice " + (position + 1) + " sur " + siblings.length),
    previousNote,
    exercise,
    nextBox,
    h("nav", { class: "pager", "aria-label": "Exercice précédent et suivant" },
      previous ? link("/exercice/" + previous.id, "← Exercice précédent") : link("/cours/" + lesson.id, "← Revoir le cours"),
      following ? link("/exercice/" + following.id, "Exercice suivant →") : h("span")));
}

// ═══════════ Révision ═══════════
function renderRevision() {
  const rows = notionRows();
  const toReview = rows.filter((row) => row.status === "review");
  const notMastered = rows.filter((row) => row.status === "progress" || row.status === "todo");
  const hard = EXERCISES.filter((ex) => getRecord(ex.id).fails >= 2 || getRecord(ex.id).correctionSeen);

  return h("div", { class: "page" },
    pageTitle("Révision", "Reviens sur tes erreurs, relis les notions importantes et teste-toi."),

    h("section", { class: "block quick" },
      h("div", {},
        h("h2", {}, "Révision rapide"),
        para("Entre 5 et 10 questions tirées des notions déjà étudiées. Les notions à revoir passent en premier, et la difficulté s’adapte à tes résultats.", "muted")),
      link("/revision/rapide", "Lancer une session", "btn primary big")),

    h("section", { class: "block" },
      h("h2", {}, "À revoir"),
      toReview.length === 0
        ? empty("Aucune notion à revoir pour l’instant. Bien joué !")
        : h("ul", { class: "rows" }, toReview.map((row) => h("li", { class: "row review-row" },
            h("div", { class: "row-main" },
              h("p", { html: "Tu as eu des difficultés avec <strong>" + rich(row.name) + "</strong>." }),
              h("p", { class: "muted small" }, row.reviewExercises.length + " exercice" + (row.reviewExercises.length > 1 ? "s" : "") + " à refaire")),
            h("div", { class: "toolbar" },
              link("/cours/" + row.lessonId, "Revoir le cours", "btn small"),
              link("/exercice/" + row.reviewExercises[0].id, "Faire un exercice", "btn small primary")))))),

    h("section", { class: "block" },
      h("h2", {}, "Exercices difficiles"),
      hard.length === 0
        ? empty("Les exercices qui t’ont demandé deux essais ou la correction apparaîtront ici.")
        : h("ul", { class: "rows compact" }, hard.map((ex) => h("li", { class: "row" },
            h("div", { class: "row-main" }, link("/exercice/" + ex.id, ex.notion + " · " + TYPE_LABELS[ex.type], "row-title")),
            statusBadge(exerciseStatus(ex)))))),

    h("section", { class: "block" },
      h("h2", {}, "Notions pas encore maîtrisées"),
      notMastered.length === 0
        ? empty("Toutes les notions sont maîtrisées ou à revoir.")
        : h("ul", { class: "chips" }, notMastered.map((row) => h("li", {}, link("/cours/" + row.lessonId, row.name))))),

    h("section", { class: "block" },
      h("h2", {}, "Les notions importantes"),
      para("Le résumé de chaque cours, pour une relecture rapide.", "muted"),
      availableModules().flatMap((module) => lessonsOf(module.id)).map((lesson) => h("details", { class: "recap" },
        h("summary", {}, lesson.title),
        h("ul", { class: "summary" }, lesson.summary.map((line) => h("li", { html: rich(line) })))))));
}

// ═══════════ Révision rapide ═══════════
function pickQuickQuestions() {
  const studied = EXERCISES.filter((ex) => ex.type !== "code" && ex.type !== "lab" && (state.lessonsDone[ex.lesson] || getRecord(ex.id).attempts > 0));
  const rate = accuracy();
  const allowed = rate === null ? 2 : rate >= 0.85 ? 3 : rate >= 0.65 ? 2 : 1;

  const toReview = shuffle(studied.filter((ex) => getRecord(ex.id).review));
  const fitting = shuffle(studied.filter((ex) => !getRecord(ex.id).review && ex.difficulty <= allowed));
  const harder = shuffle(studied.filter((ex) => !getRecord(ex.id).review && ex.difficulty > allowed));
  return toReview.concat(fitting, harder).slice(0, Math.min(10, studied.length));
}

function renderQuickReview() {
  const questions = pickQuickQuestions();
  const page = h("div", { class: "page" }, pageTitle("Révision rapide"));

  if (questions.length === 0) {
    page.append(empty("Aucune question disponible. Ouvre un cours (ou fais un exercice) : les questions viennent des notions que tu as étudiées."));
    page.append(link("/cours", "Aller aux cours", "btn primary"));
    return page;
  }

  let index = 0;
  let score = 0;
  const missed = [];
  const area = h("div", {});
  page.append(area);

  function showQuestion() {
    const ex = questions[index];
    const nextBox = h("div", { class: "next-box" });
    area.replaceChildren(
      h("div", { class: "quick-progress" }, h("span", { class: "muted small" }, "Question " + (index + 1) + " sur " + questions.length), bar(Math.round((index / questions.length) * 100))),
      renderExercise(ex, {
        quick: true,
        onFinish: (ok) => {
          if (ok) score++; else missed.push(ex);
          const last = index === questions.length - 1;
          nextBox.replaceChildren(h("button", { class: "btn primary big", type: "button", onclick: () => {
            index++;
            if (last) showResult(); else showQuestion();
          } }, last ? "Voir mon résultat" : "Question suivante →"));
        },
      }),
      nextBox);
  }

  function showResult() {
    area.replaceChildren(
      h("div", { class: "panel result" },
        h("h2", {}, "Résultat : " + score + " sur " + questions.length),
        bar(Math.round((score / questions.length) * 100)),
        missed.length === 0
          ? para("Aucune erreur. Les notions de cette session sont solides.")
          : para("Voici ce que tu peux revoir :")),
      missed.length === 0 ? null : h("ul", { class: "rows compact" }, missed.map((ex) => h("li", { class: "row" },
        h("div", { class: "row-main" }, h("strong", {}, ex.notion)),
        link("/cours/" + ex.lesson, "Revoir le cours", "btn small"),
        link("/exercice/" + ex.id, "Refaire", "btn small")))),
      h("div", { class: "toolbar" },
        h("button", { class: "btn primary", type: "button", onclick: () => router() }, "Nouvelle session"),
        link("/revision", "Retour à la révision", "btn")));
  }

  showQuestion();
  return page;
}

// ═══════════ Projets ═══════════
// Certains projets se débloquent quand un niveau est assez avancé (project.unlock).
function projectLocked(project) {
  if (!project.unlock) return false;
  return moduleStats(project.unlock.module).percent < project.unlock.percent;
}

function unlockText(project) {
  const module = getModule(project.unlock.module);
  return "Niveau " + module.number + " : " + moduleStats(module.id).percent + " %. Le projet se débloque à " + project.unlock.percent + " %.";
}

function renderProjects() {
  const finished = PROJECTS.filter((p) => getProjectState(p.id).done).length;
  const open = PROJECTS.filter((p) => p.available && !projectLocked(p)).length;
  return h("div", { class: "page" },
    pageTitle("Projets", "Des projets de plus en plus difficiles, à construire étape par étape. Chaque étape se vérifie automatiquement, avec des indices progressifs ; la correction finale n’apparaît qu’une fois le projet terminé."),
    para(finished + " projet" + (finished > 1 ? "s" : "") + " terminé" + (finished > 1 ? "s" : "") + " sur " + open + " débloqué" + (open > 1 ? "s" : "") + ".", "muted"),
    h("ol", { class: "rows lessons" }, PROJECTS.map((project, index) => {
      const record = getProjectState(project.id);
      const locked = project.available && projectLocked(project);
      const done = project.available && !locked ? projectStepsDone(project) : 0;
      let note = project.goal;
      if (!project.available) note += " Disponible avec : " + project.needs + ".";
      else if (locked) note += " " + unlockText(project);
      return h("li", { class: "row" + (project.available && !locked ? "" : " locked") },
        h("span", { class: "num", "aria-hidden": "true" }, index + 1),
        h("div", { class: "row-main" },
          project.available && !locked ? link("/projet/" + project.id, project.title, "row-title") : h("p", { class: "row-title" }, project.title),
          h("p", { class: "muted small" }, note)),
        h("span", { class: "badge d" + project.difficulty }, DIFFICULTY_LABELS[project.difficulty]),
        !project.available
          ? h("span", { class: "badge soon" }, "Bientôt")
          : locked
            ? h("span", { class: "badge soon" }, "Verrouillé")
            : (record.done ? h("span", { class: "status ok" }, "✓ Terminé") : h("span", { class: "status todo" }, done + " / " + project.steps.length + " étapes")));
    })));
}

function renderProject(id) {
  const project = getProject(id);
  if (!project || !project.available) return renderNotFound();
  if (projectLocked(project)) {
    const module = getModule(project.unlock.module);
    const percent = moduleStats(module.id).percent;
    return h("div", { class: "page" },
      h("p", { class: "crumbs" }, link("/projets", "Projets"), " / " + project.title),
      pageTitle(project.title, project.goal),
      h("div", { class: "panel" },
        h("h2", {}, "Projet verrouillé"),
        para("Ce projet reprend ce que tu apprends au niveau " + module.number + " (" + module.title + "). Il se débloque quand tu as validé " + project.unlock.percent + " % de ce niveau."),
        bar(percent),
        para("Ta progression dans le niveau " + module.number + " : " + percent + " %.", "muted"),
        h("div", { class: "toolbar" }, link("/cours", "Aller aux cours", "btn primary"), link("/exercices", "Faire des exercices", "btn"))));
  }
  const lab = renderLab({ files: project.files, previewHeight: project.previewHeight, tips: true });
  const saved = getProjectState(id).draft;
  if (saved) Object.keys(saved).forEach((name) => lab.setCode(name, saved[name]));

  // Le code est sauvegardé pendant que tu écris (brouillon).
  let saveTimer = null;
  lab.node.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProjectDraft(id, lab.getFiles()), 400);
  });

  const progressText = h("p", { class: "muted" });
  const progressBar = h("div", {});
  const completion = h("div", {});
  const correctionBox = h("div", {});
  const correctionNote = h("p", { class: "muted small" });
  const correctionBtn = h("button", { class: "btn", type: "button", onclick: showCorrection }, "Voir la correction finale");
  const stepStatuses = [];

  function correctionUnlocked() {
    const record = getProjectState(id);
    return record.done || record.fails >= 3;
  }

  function refresh() {
    const done = projectStepsDone(project);
    progressText.textContent = done + " étape" + (done > 1 ? "s" : "") + " validée" + (done > 1 ? "s" : "") + " sur " + project.steps.length + ".";
    progressBar.replaceChildren(bar(Math.round((done / project.steps.length) * 100)));
    const record = getProjectState(id);
    project.steps.forEach((step, index) => {
      const ok = record.steps[index] === true;
      stepStatuses[index].className = "status " + (ok ? "ok" : "todo");
      stepStatuses[index].textContent = ok ? "✓ Validée" : "À faire";
    });
    const unlocked = correctionUnlocked();
    correctionBtn.disabled = !unlocked;
    correctionNote.textContent = unlocked
      ? ""
      : "La correction se débloque quand toutes les étapes sont validées, ou après 3 vérifications ratées.";
    completion.replaceChildren();
    if (record.done) {
      const index = PROJECTS.indexOf(project);
      const next = PROJECTS.slice(index + 1).find((p) => p.available);
      completion.append(h("div", { class: "feedback ok" },
        h("strong", {}, "Projet terminé, bravo !"),
        para("Toutes les étapes sont validées. Tu peux maintenant ouvrir la correction pour comparer avec ta solution."),
        next ? link("/projet/" + next.id, "Projet suivant : " + next.title, "btn small") : null));
    }
  }

  function showCorrection() {
    if (!correctionUnlocked()) return;
    recordProjectCorrection(id);
    correctionBox.replaceChildren(h("div", { class: "correction" },
      h("h4", {}, "Correction finale"),
      para("Ce n’est qu’une solution possible : si ton code fait la même chose, il est bon."),
      project.solution.map((file) => h("div", {}, h("p", { class: "muted small" }, file.name), codeBlock(file.code, true))),
      h("h4", {}, "La solution expliquée"),
      project.explanation.map((text) => para(text))));
  }

  const stepCards = project.steps.map((step, index) => {
    let shownHints = 0;
    let failsHere = 0;
    const feedback = h("div", { class: "feedback", "aria-live": "polite" });
    const hintsBox = h("div", { class: "hints" });
    const status = h("span", { class: "status todo" }, "À faire");
    stepStatuses.push(status);
    const checkBtn = h("button", { class: "btn primary", type: "button", onclick: check }, "Vérifier cette étape");
    const hintBtn = h("button", { class: "btn", type: "button", onclick: revealHint }, "Indice 1");

    function revealHint() {
      if (shownHints >= step.hints.length) return;
      hintsBox.append(h("div", { class: "hint" },
        h("strong", {}, "Indice " + (shownHints + 1) + " : " + HINT_TITLES[shownHints]),
        para(step.hints[shownHints])));
      shownHints++;
      hintBtn.textContent = shownHints < step.hints.length ? "Indice " + (shownHints + 1) : "Plus d’indice";
      hintBtn.disabled = shownHints >= step.hints.length;
    }

    async function check() {
      checkBtn.disabled = true;
      feedback.className = "feedback info";
      feedback.replaceChildren(h("p", {}, "Vérification…"));
      const files = lab.getFiles();
      saveProjectDraft(id, files);
      const result = await lab.run(step.tests || [], step.actions || []);
      let problems;
      if (result.timeout) problems = [result.error];
      else if (result.error) problems = ["La page produit une erreur : " + result.error + ". " + explainError(result.error)];
      else problems = checkLab(step, files, result);
      checkBtn.disabled = false;

      const ok = problems.length === 0;
      recordProjectCheck(project, index, ok);
      if (ok) {
        feedback.className = "feedback ok";
        feedback.replaceChildren(h("strong", {}, "Étape validée !"));
      } else {
        failsHere++;
        feedback.className = "feedback ko";
        feedback.replaceChildren(h("strong", {}, "Pas encore."), h("ul", {}, problems.map((line) => h("li", { html: rich(line) }))));
        // Aide progressive : 1er échec → indice 1, 2e échec → indice 2.
        if (failsHere === 1 && shownHints < 1) revealHint();
        if (failsHere === 2 && shownHints < 2) revealHint();
      }
      refresh();
    }

    return h("li", { class: "step-card" },
      h("div", { class: "step-head" }, h("h3", {}, step.title), status),
      renderBlocks(step.instruction),
      h("div", { class: "toolbar" }, checkBtn, hintBtn),
      feedback, hintsBox);
  });

  const page = h("div", { class: "page project-page" },
    h("p", { class: "crumbs" }, link("/projets", "Projets"), " / " + project.title),
    h("header", { class: "page-head" },
      h("h1", {}, project.title),
      h("div", { class: "ex-meta" },
        h("span", { class: "badge d" + project.difficulty }, DIFFICULTY_LABELS[project.difficulty]),
        h("span", { class: "muted small" }, project.steps.length + " étapes"))),
    para(project.goal, "lead"),
    para("Tu vas utiliser : " + project.skills + ".", "muted"),
    progressText, progressBar, completion,
    lab.node,
    h("section", { class: "block first" },
      h("h2", {}, "Les étapes"),
      para("Écris ton code dans l’éditeur ci-dessus, puis clique sur « Vérifier cette étape ». La page de l’aperçu est testée automatiquement : clics, saisies et touches sont simulés."),
      h("ol", { class: "project-steps" }, stepCards)),
    h("section", { class: "block" },
      h("h2", {}, "Correction"),
      correctionNote,
      h("div", { class: "toolbar" }, correctionBtn),
      correctionBox),
    h("section", { class: "block danger-zone" },
      h("button", { class: "btn danger", type: "button", onclick: () => {
        if (confirm("Recommencer ce projet ? Ton code et tes étapes validées seront effacés.")) {
          resetProject(id);
          router();
        }
      } }, "Recommencer le projet")));

  refresh();
  if (getProjectState(id).correctionSeen && correctionUnlocked()) showCorrection();
  return page;
}

// ═══════════ Progression ═══════════
function renderProgressPage() {
  const rows = notionRows();
  const statusText = { mastered: "Maîtrisée", review: "À revoir", progress: "En cours", todo: "Pas commencée" };

  function moduleTable(module) {
    return h("div", { class: "scroll" }, h("table", {},
      h("thead", {}, h("tr", {}, ["Chapitre", "Avancement", "Réussis", "Échoués", "À revoir", "Score", "Difficulté"].map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, lessonsOf(module.id).map((lesson) => {
        const s = lessonStats(lesson.id);
        return h("tr", {},
          h("th", { scope: "row" }, link("/cours/" + lesson.id, lesson.title)),
          h("td", {}, h("div", { class: "cell-bar" }, bar(s.percent), h("span", {}, s.percent + " %"))),
          h("td", {}, s.solved + " / " + s.total),
          h("td", {}, s.failed),
          h("td", {}, s.review),
          h("td", {}, s.points + " / " + s.maxPoints),
          h("td", {}, lesson.level));
      }))));
  }

  return h("div", { class: "page" },
    pageTitle("Progression", "Ton avancement dans chaque niveau."),
    availableModules().map((module) => {
      const total = moduleStats(module.id);
      return h("section", { class: "block first" },
        h("h2", {}, "Niveau " + module.number + " · " + module.title),
        para(total.percent + " % · " + levelName(total.percent) + " · " + total.points + " point" + (total.points > 1 ? "s" : "") + " sur " + total.maxPoints, "muted"),
        moduleTable(module));
    }),

    h("section", { class: "block" },
      h("h2", {}, "Les notions"),
      h("ul", { class: "rows compact" }, rows.map((row) => h("li", { class: "row" },
        h("div", { class: "row-main" }, link("/cours/" + row.lessonId, row.name, "row-title")),
        h("span", { class: "status " + (row.status === "mastered" ? "ok" : row.status === "review" ? "review" : "todo") }, statusText[row.status]))))),

    h("section", { class: "block" },
      h("h2", {}, "Les projets"),
      h("ul", { class: "rows compact" }, PROJECTS.filter((p) => p.available).map((project) => {
        const record = getProjectState(project.id);
        const locked = projectLocked(project);
        return h("li", { class: "row" },
          h("div", { class: "row-main" }, locked ? h("p", { class: "row-title" }, project.title) : link("/projet/" + project.id, project.title, "row-title")),
          h("span", { class: "status " + (record.done ? "ok" : "todo") }, locked ? "Verrouillé" : record.done ? "✓ Terminé" : projectStepsDone(project) + " / " + project.steps.length + " étapes"));
      }))),

    h("section", { class: "block danger-zone" },
      h("h2", {}, "Remettre à zéro"),
      para("Efface toute ta progression (cours terminés, exercices, scores, erreurs). Cette action est définitive.", "muted"),
      h("button", { class: "btn danger", type: "button", onclick: () => {
        if (confirm("Effacer toute ta progression ? Cette action est définitive.")) {
          resetProgress();
          router();
        }
      } }, "Réinitialiser ma progression")));
}

function renderNotFound() {
  return h("div", { class: "page" }, pageTitle("Page introuvable", "Cette page n’existe pas."), link("/", "Retour à l’accueil", "btn primary"));
}

// ═══════════ Routeur ═══════════
const routes = [
  { re: /^\/$/, view: renderHome },
  { re: /^\/cours$/, view: renderCourses },
  { re: /^\/cours\/([\w-]+)$/, view: renderLesson },
  { re: /^\/exercices$/, view: renderExerciseList },
  { re: /^\/exercice\/([\w-]+)$/, view: renderExercisePage },
  { re: /^\/revision$/, view: renderRevision },
  { re: /^\/revision\/rapide$/, view: renderQuickReview },
  { re: /^\/projets$/, view: renderProjects },
  { re: /^\/projet\/([\w-]+)$/, view: renderProject },
  { re: /^\/progression$/, view: renderProgressPage },
];

function router() {
  const path = location.hash.replace(/^#/, "") || "/";
  let view = null;
  for (const route of routes) {
    const match = path.match(route.re);
    if (match) { view = route.view(...match.slice(1)); break; }
  }
  main.replaceChildren(view || renderNotFound());
  renderNav();
  closeMenu();
  window.scrollTo(0, 0);
  document.title = (main.querySelector("h1") ? main.querySelector("h1").textContent + " · " : "") + "Cahier JS";
}

// ═══════════ Thème et menu mobile ═══════════
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const button = document.getElementById("theme-toggle");
  button.textContent = state.theme === "dark" ? "Thème clair" : "Thème sombre";
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
  applyTheme();
});

document.getElementById("menu-toggle").addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  document.getElementById("menu-toggle").setAttribute("aria-expanded", open ? "true" : "false");
});

window.addEventListener("hashchange", router);
window.addEventListener("progress-changed", renderNav);

applyTheme();
router();
