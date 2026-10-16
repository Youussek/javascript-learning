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
function navIcon(name) {
  const icons = { home:"⌂", paths:"◇", dashboard:"◎", book:"▤", exercise:"✓", review:"↻", project:"◈", progress:"◎", react:"⚛", css:"CSS", html:"HTML", ts:"TS", node:"N", sql:"SQL", js:"JS", back:"←" };
  return h("span", { class:"nav-icon", "aria-hidden":"true" }, icons[name] || "•");
}

// Métadonnées d'interface : une seule configuration pour l'ordre, les catégories et les recommandations.
// Les titres, descriptions, URLs et contenus restent issus de LEARNING_PATHS.
const LEARNING_PATH_UI = {
  html:       { order:1, category:"Fondamentaux Web", difficulty:"Débutant", prerequisite:"Aucun prérequis" },
  css:        { order:2, category:"Fondamentaux Web", difficulty:"Débutant", prerequisite:"HTML recommandé" },
  javascript: { order:3, category:"Fondamentaux Web", difficulty:"Débutant → avancé", prerequisite:"HTML/CSS utiles" },
  react:      { order:4, category:"Frontend", difficulty:"Intermédiaire", prerequisite:"JavaScript recommandé" },
  typescript: { order:5, category:"Langage & qualité", difficulty:"Intermédiaire", prerequisite:"JavaScript recommandé" },
  node:       { order:6, category:"Backend", difficulty:"Intermédiaire", prerequisite:"JavaScript recommandé" },
  sql:        { order:7, category:"Données", difficulty:"Débutant → avancé", prerequisite:"Aucun prérequis" }
};

function orderedLearningPaths() {
  return LEARNING_PATHS.slice().sort((a,b)=>(LEARNING_PATH_UI[a.id]?.order||99)-(LEARNING_PATH_UI[b.id]?.order||99));
}

function routeLearningPathId(path) {
  if (path.startsWith("/react")) return "react";
  if (path.startsWith("/css")) return "css";
  if (path.startsWith("/html")) return "html";
  if (path.startsWith("/typescript")) return "typescript";
  if (path.startsWith("/node")) return "node";
  if (path.startsWith("/sql")) return "sql";
  if (path === "/javascript" || /^\/(cours|exercices|exercice|revision|projets|projet|progression)(\/|$)/.test(path)) return "javascript";
  return null;
}

function renderGlobalPathSwitcher(path) {
  const host=document.getElementById("path-switcher");
  if(!host) return;
  const currentId=routeLearningPathId(path);
  const current=LEARNING_PATHS.find(p=>p.id===currentId);
  const details=h("details",{class:"path-switcher"},
    h("summary",{},
      h("span",{class:"switcher-label"},current?"Parcours actuel":"Parcours"),
      h("strong",{},current?current.title:"Choisir un parcours"),
      h("span",{class:"switcher-chevron","aria-hidden":"true"},"⌄")
    ),
    h("div",{class:"path-switcher-menu"},orderedLearningPaths().map(p=>
      h("a",{href:"#"+p.href,class:"path-switcher-item"+(p.id===currentId?" active":""),"aria-current":p.id===currentId?"page":null},
        h("span",{class:"switcher-mark path-card--"+p.id},h("span",{class:"path-mark"},p.mark)),
        h("span",{},h("strong",{},p.title),h("small",{},LEARNING_PATH_UI[p.id]?.category||"Parcours"))
      )
    ))
  );
  host.replaceChildren(details);
  const topbarTitle=document.getElementById("topbar-title");
  const topbarPaths=document.getElementById("topbar-paths");
  if(topbarTitle) topbarTitle.textContent=current?current.title:"Cahier Code";
  if(topbarPaths) topbarPaths.textContent=current?"Changer de parcours":"Choisir un parcours";
}

function renderNav() {
  const nav = document.getElementById("nav");
  const path = location.hash.replace(/^#/, "") || "/";
  const isGlobal = path === "/" || path === "/dashboard";
  const inReact = path.startsWith("/react");
  const inCss = path.startsWith("/css");
  const inHtml = path.startsWith("/html");
  const inTypeScript = path.startsWith("/typescript");
  const inNode = path.startsWith("/node");
  const inSql = path.startsWith("/sql");
  const inJavascript = routeLearningPathId(path) === "javascript";
  renderGlobalPathSwitcher(path);
  const cssLessonForNav = inCss && path.startsWith("/css/cours/") ? CSS_LESSONS.find(l=>path.endsWith("/"+l.id)) : null;
  const cssLevelForNav = cssLessonForNav ? cssLessonForNav.level : (inCss && path.match(/^\/css\/niveau\/(\d+)/) ? Number(path.match(/^\/css\/niveau\/(\d+)/)[1]) : ((cssState().lastLesson && CSS_LESSONS.find(l=>l.id===cssState().lastLesson)) ? CSS_LESSONS.find(l=>l.id===cssState().lastLesson).level : 1));
  document.body.dataset.path = isGlobal ? "hub" : inReact ? "react" : inCss ? "css" : inHtml ? "html" : inTypeScript ? "typescript" : inNode ? "node" : inSql ? "sql" : inJavascript ? "javascript" : "hub";
  const items = isGlobal ? [
    { href: "/", text: "Accueil", icon:"home", prefix:null },
    { href: "/dashboard", text: "Mes parcours", icon:"dashboard", exact:true, prefix:"/dashboard" },
  ] : inReact ? [
    { href: "/", text: "Parcours", icon:"back", prefix: null },
    { href: "/react", text: "Vue d’ensemble", icon:"react", prefix: "/react" },
    { href: "/react/exercices", text: "Exercices", icon:"exercise", prefix: "/react/exercice" },
    { href: "/react/revision", text: "Révision", icon:"review", prefix: "/react/revision" },
    { href: "/react/projets", text: "Projets", icon:"project", prefix: "/react/proj" },
  ] : inCss ? [
    { href: "/", text: "Parcours", icon:"back", prefix: null },
    { href: "/css", text: "Vue d’ensemble", icon:"css", prefix: "/css" },
    { href: "/css/exercices", text: "Exercices", icon:"exercise", prefix: "/css/exercice" },
    { href: "/css/revision", text: "Révision", icon:"review", prefix: "/css/revision" },
    { href: "/css/projets", text: "Projets", icon:"project", prefix: "/css/proj" },
  ] : inHtml ? [
    { href: "/", text: "Parcours", icon:"back", prefix: null },
    { href: "/html", text: "Vue d’ensemble", icon:"html", prefix: "/html" },
    { href: "/html/exercices", text: "Exercices", icon:"exercise", prefix: "/html/exercice" },
    { href: "/html/revision", text: "Révision", icon:"review", prefix: "/html/revision" },
    { href: "/html/projets", text: "Projets", icon:"project", prefix: "/html/proj" },
  ] : inTypeScript ? [
    { href: "/", text: "Parcours", icon:"back", prefix: null },
    { href: "/typescript", text: "Vue d’ensemble", icon:"ts", prefix: "/typescript" },
    { href: "/typescript/exercices", text: "Exercices", icon:"exercise", prefix: "/typescript/exercice" },
    { href: "/typescript/revision", text: "Révision", icon:"review", prefix: "/typescript/revision" },
    { href: "/typescript/projets", text: "Projets", icon:"project", prefix: "/typescript/proj" },
  ] : inNode ? [
    { href: "/", text: "Parcours", icon:"back", prefix: null },
    { href: "/node", text: "Vue d’ensemble", icon:"node", prefix: "/node" },
    { href: "/node/exercices", text: "Exercices", icon:"exercise", prefix: "/node/exercice" },
    { href: "/node/revision", text: "Révision", icon:"review", prefix: "/node/revision" },
    { href: "/node/projets", text: "Projets", icon:"project", prefix: "/node/proj" },
  ] : inSql ? [
    { href: "/", text: "Parcours", icon:"back", prefix: null },
    { href: "/sql", text: "Vue d’ensemble", icon:"sql", prefix: "/sql" },
    { href: "/sql/exercices", text: "Exercices", icon:"exercise", prefix: "/sql/exercice" },
    { href: "/sql/revision", text: "Révision", icon:"review", prefix: "/sql/revision" },
    { href: "/sql/projets", text: "Projets", icon:"project", prefix: "/sql/proj" },
  ] : [
    { href: "/", text: "Parcours", icon:"paths", prefix: null },
    { href: "/javascript", text: "Vue d’ensemble", icon:"home", prefix: "/javascript" },
    { href: "/cours", text: "Cours", icon:"book", prefix: "/cours" },
    { href: "/exercices", text: "Exercices", icon:"exercise", prefix: "/exercice" },
    { href: "/revision", text: "Révision", icon:"review", prefix: "/revision" },
    { href: "/projets", text: "Projets", icon:"project", prefix: "/projet" },
    { href: "/progression", text: "Progression", icon:"progress", prefix: "/progression" },
  ];
  const mainLinks = items.map((item) => {
    const active = item.prefix === null ? path === item.href : item.exact ? path === item.href : (item.href === "/react" ? path === "/react" : item.href === "/css" ? path === "/css" : item.href === "/html" ? path === "/html" : item.href === "/typescript" ? path === "/typescript" : item.href === "/node" ? path === "/node" : item.href === "/sql" ? path === "/sql" : item.href === "/javascript" ? path === "/javascript" : path.startsWith(item.prefix));
    return h("a", { href: "#" + item.href, class: "nav-link", "aria-current": active ? "page" : null, title:item.text }, navIcon(item.icon), h("span",{class:"nav-label"},item.text));
  });
  if (isGlobal) {
    nav.replaceChildren(h("div", { class:"nav-main" }, mainLinks),
      h("p",{class:"nav-heading"},"ACCÈS RAPIDE"),
      h("div",{class:"nav-main"},
        h("a",{href:"#/",class:"nav-link"},navIcon("paths"),h("span",{class:"nav-label"},"Tous les parcours")),
        h("a",{href:"#/dashboard",class:"nav-link"},navIcon("progress"),h("span",{class:"nav-label"},"Progression globale"))
      ));
    return;
  }
  if (inReact) {
    const levels = REACT_LEVELS.map((level) => {
      const stats = reactLevelStats(level.number);
      const active = path === "/react/niveau/" + level.number || path.includes("/react/cours/") && REACT_LESSONS.some(l=>l.id===path.split('/').pop() && l.level===level.number);
      return h("li", { class: "level" + (level.available ? "" : " locked") + (active ? " active" : "") },
        level.available ? h("a", { href: "#/react/niveau/" + level.number }, h("span",{class:"level-dot"},stats.percent===100?"✓":String(level.number)), h("span",{class:"level-copy"},h("strong",{},level.title),h("small",{},stats.percent+" %"))) : h("span", {class:"level-locked"}, h("span",{class:"level-dot"},"🔒"), h("span",{class:"level-copy"},h("strong",{},level.title),h("small",{},"Bientôt"))));
    });
    nav.replaceChildren(h("div", { class: "nav-main" }, mainLinks), h("p", { class: "nav-heading" }, "PARCOURS REACT"), h("ul", { class: "levels" }, levels));
    return;
  }
  if (inCss) {
    const currentCssLesson = cssLessonForNav; const levels = CSS_LEVELS.map(level=>{const stats=cssLevelStats(level.number); const active=path==="/css/niveau/"+level.number || (currentCssLesson && currentCssLesson.level===level.number); return h("li",{class:"level"+(active?" active":"")},h("a",{href:"#/css/niveau/"+level.number},h("span",{class:"level-dot"},stats.percent===100?"✓":String(level.number)),h("span",{class:"level-copy"},h("strong",{},level.title),h("small",{},stats.percent+" %"))));});
    nav.replaceChildren(h("div",{class:"nav-main"},mainLinks),h("p",{class:"nav-heading"},"PARCOURS CSS"),h("ul",{class:"levels"},levels));
    return;
  }

  if (inHtml) {
    const currentLesson = path.startsWith("/html/cours/") ? HTML_LESSONS.find(l=>path.endsWith("/"+l.id)) : null;
    const levels=HTML_LEVELS.map(level=>{const stats=htmlLevelStats(level.number); const active=path==="/html/niveau/"+level.number || (currentLesson&&currentLesson.level===level.number); return h("li",{class:"level"+(active?" active":"")},h("a",{href:"#/html/niveau/"+level.number},h("span",{class:"level-dot"},stats.percent===100?"✓":String(level.number)),h("span",{class:"level-copy"},h("strong",{},level.title),h("small",{},stats.percent+" %"))));});
    nav.replaceChildren(h("div",{class:"nav-main"},mainLinks),h("p",{class:"nav-heading"},"PARCOURS HTML"),h("ul",{class:"levels"},levels));
    return;
  }
  if (inTypeScript) {
    const currentLesson = path.startsWith("/typescript/cours/") ? TYPESCRIPT_LESSONS.find(l=>path.endsWith("/"+l.id)) : null;
    const levels=TYPESCRIPT_LEVELS.map(level=>{const stats=typeScriptLevelStats(level.number); const active=path==="/typescript/niveau/"+level.number || (currentLesson&&currentLesson.level===level.number); return h("li",{class:"level"+(active?" active":"")},h("a",{href:"#/typescript/niveau/"+level.number},h("span",{class:"level-dot"},stats.percent===100?"✓":String(level.number)),h("span",{class:"level-copy"},h("strong",{},level.title),h("small",{},stats.percent+" %"))));});
    nav.replaceChildren(h("div",{class:"nav-main"},mainLinks),h("p",{class:"nav-heading"},"PARCOURS TYPESCRIPT"),h("ul",{class:"levels"},levels));
    return;
  }
  if (inNode) {
    const currentLesson = path.startsWith("/node/cours/") ? NODE_LESSONS.find(l=>path.endsWith("/"+l.id)) : null;
    const levels=NODE_LEVELS.map(level=>{const stats=nodeLevelStats(level.number); const active=path==="/node/niveau/"+level.number || (currentLesson&&currentLesson.level===level.number); return h("li",{class:"level"+(active?" active":"")},h("a",{href:"#/node/niveau/"+level.number},h("span",{class:"level-dot"},stats.percent===100?"✓":String(level.number)),h("span",{class:"level-copy"},h("strong",{},level.title),h("small",{},stats.percent+" %"))));});
    nav.replaceChildren(h("div",{class:"nav-main"},mainLinks),h("p",{class:"nav-heading"},"PARCOURS NODE.JS"),h("ul",{class:"levels"},levels));
    return;
  }
  if (inSql) {
    const currentLesson = path.startsWith("/sql/cours/") ? SQL_LESSONS.find(l=>path.endsWith("/"+l.id)) : null;
    const levels=SQL_LEVELS.map(level=>{const stats=sqlLevelStats(level.number); const active=path==="/sql/niveau/"+level.number || (currentLesson&&currentLesson.level===level.number); return h("li",{class:"level"+(active?" active":"")},h("a",{href:"#/sql/niveau/"+level.number},h("span",{class:"level-dot"},stats.percent===100?"✓":String(level.number)),h("span",{class:"level-copy"},h("strong",{},level.title),h("small",{},stats.percent+" %"))));});
    nav.replaceChildren(h("div",{class:"nav-main"},mainLinks),h("p",{class:"nav-heading"},"PARCOURS SQL"),h("ul",{class:"levels"},levels));
    return;
  }
  const levels = MODULES.map((module) => {
    const stats = moduleStats(module.id);
    return h("li", { class: "level" }, h("div", { class: "level-title" }, h("span", {class:"level-title-copy"}, h("span",{class:"level-dot"}, stats.percent===100?"✓":module.number), h("span",{},module.title)), h("small", {}, stats.percent + " %")),
      h("ul", { class: "lesson-links" }, lessonsOf(module.id).map((lesson) => { const st=lessonStats(lesson.id); return h("li", {}, h("a", { href: "#/cours/"+lesson.id, "aria-current": path === "/cours/"+lesson.id ? "page":null }, h("span",{},lesson.title), h("span",{class:"mark ok"}, st.done ? "✓":""))); })));
  });
  nav.replaceChildren(h("div", { class: "nav-main" }, mainLinks), h("p", { class: "nav-heading" }, "PROGRAMME JAVASCRIPT"), h("ul", { class: "levels" }, levels));
}

// ═══════════ Hub multi-parcours ═══════════
function reactState() {
  if (!state.react) state.react = { lessonsDone: {}, lastLesson: null, projects: {}, exercises: {}, notions: {}, evaluations: {} };
  if (!state.react.lessonsDone) state.react.lessonsDone = {};
  if (!state.react.projects) state.react.projects = {};
  if (!state.react.exercises) state.react.exercises = {};
  if (!state.react.notions) state.react.notions = {};
  if (!state.react.evaluations) state.react.evaluations = {};
  return state.react;
}
function reactLevelStats(level) {
  const lessons = reactLessonsForLevel(level);
  const done = lessons.filter((lesson) => reactState().lessonsDone[lesson.id]).length;
  return { lessons, done, percent: lessons.length ? Math.round(done / lessons.length * 100) : 0 };
}
function reactExerciseStatsForLevel(level) {
  const exercises = reactExercisesForLevel(level);
  const solved = exercises.filter((exercise) => getRecord(exercise.id).success).length;
  const review = exercises.filter((exercise) => getRecord(exercise.id).review).length;
  return { exercises, solved, review, percent: exercises.length ? Math.round((solved / exercises.length) * 100) : 0 };
}

function reactProgress() {
  const lessons = REACT_LESSONS.filter((lesson) => REACT_LEVELS.find((level) => level.number === lesson.level && level.available));
  const done = lessons.filter((lesson) => reactState().lessonsDone[lesson.id]).length;
  return lessons.length ? Math.round(done / lessons.length * 100) : 0;
}
function reactProjectState(id) {
  const projects = reactState().projects;
  if (!projects[id]) projects[id] = { done: false, draft: "" };
  return projects[id];
}
function metric(value, label) { return h("div",{class:"metric"},h("strong",{},String(value)),h("span",{},label)); }
function learningPathSummary(path) {
  const ui=LEARNING_PATH_UI[path.id]||{};
  let percent=0, lastLesson=null, currentLevel=1, levels=0, lessons=0, exercises=0, projects=0, projectsDone=0, resumeHref=path.href;
  if(path.id==="javascript"){
    percent=Math.round(availableModules().reduce((n,m)=>n+moduleStats(m.id).percent,0)/Math.max(1,availableModules().length));
    lastLesson=state.lastLesson?LESSONS.find(l=>l.id===state.lastLesson):null;
    const mod=lastLesson?MODULES.find(m=>m.id===lastLesson.module):(availableModules().find(m=>moduleStats(m.id).percent<100)||availableModules()[availableModules().length-1]);
    currentLevel=mod?.number||1; levels=MODULES.length; lessons=LESSONS.length; exercises=EXERCISES.length; projects=PROJECTS.length;
    projectsDone=PROJECTS.filter(p=>getProjectState(p.id).done).length;
    if(lastLesson) resumeHref="/cours/"+lastLesson.id;
  } else if(path.id==="react"){
    percent=reactProgress(); const st=reactState(); lastLesson=st.lastLesson?REACT_LESSONS.find(l=>l.id===st.lastLesson):null;
    currentLevel=lastLesson?.level||(REACT_LEVELS.find(l=>reactLevelStats(l.number).percent<100)||REACT_LEVELS[REACT_LEVELS.length-1]).number;
    levels=REACT_LEVELS.length; lessons=REACT_LESSONS.length; exercises=REACT_EXERCISES.length; projects=REACT_PROJECTS.length; projectsDone=REACT_PROJECTS.filter(p=>reactProjectState(p.id).done).length;
    if(lastLesson) resumeHref="/react/cours/"+lastLesson.id;
  } else if(path.id==="css"){
    percent=cssProgress(); const st=cssState(); lastLesson=st.lastLesson?CSS_LESSONS.find(l=>l.id===st.lastLesson):null;
    currentLevel=lastLesson?.level||(CSS_LEVELS.find(l=>cssLevelStats(l.number).percent<100)||CSS_LEVELS[CSS_LEVELS.length-1]).number;
    levels=CSS_LEVELS.length; lessons=CSS_LESSONS.length; exercises=CSS_EXERCISES.length; projects=CSS_PROJECTS.length; projectsDone=CSS_PROJECTS.filter(p=>cssProjectState(p.id).done).length;
    if(lastLesson) resumeHref="/css/cours/"+lastLesson.id;
  } else if(path.id==="html"){
    percent=htmlProgress(); const st=htmlState(); lastLesson=st.lastLesson?HTML_LESSONS.find(l=>l.id===st.lastLesson):null;
    currentLevel=lastLesson?.level||(HTML_LEVELS.find(l=>htmlLevelStats(l.number).percent<100)||HTML_LEVELS[HTML_LEVELS.length-1]).number;
    levels=HTML_LEVELS.length; lessons=HTML_LESSONS.length; exercises=HTML_EXERCISES.length; projects=HTML_PROJECTS.length; projectsDone=HTML_PROJECTS.filter(p=>htmlProjectState(p.id).done).length;
    if(lastLesson) resumeHref="/html/cours/"+lastLesson.id;
  } else if(path.id==="typescript"){
    percent=typeScriptProgress(); const st=typeScriptState(); lastLesson=st.lastLesson?TYPESCRIPT_LESSONS.find(l=>l.id===st.lastLesson):null;
    currentLevel=lastLesson?.level||(TYPESCRIPT_LEVELS.find(l=>typeScriptLevelStats(l.number).percent<100)||TYPESCRIPT_LEVELS[TYPESCRIPT_LEVELS.length-1]).number;
    levels=TYPESCRIPT_LEVELS.length; lessons=TYPESCRIPT_LESSONS.length; exercises=TYPESCRIPT_EXERCISES.length; projects=TYPESCRIPT_PROJECTS.length; projectsDone=TYPESCRIPT_PROJECTS.filter(p=>typeScriptProjectState(p.id).done).length;
    if(lastLesson) resumeHref="/typescript/cours/"+lastLesson.id;
  } else if(path.id==="node"){
    percent=nodeProgress(); const st=nodeState(); lastLesson=st.lastLesson?NODE_LESSONS.find(l=>l.id===st.lastLesson):null;
    currentLevel=lastLesson?.level||(NODE_LEVELS.find(l=>nodeLevelStats(l.number).percent<100)||NODE_LEVELS[NODE_LEVELS.length-1]).number;
    levels=NODE_LEVELS.length; lessons=NODE_LESSONS.length; exercises=NODE_EXERCISES.length; projects=NODE_PROJECTS.length; projectsDone=NODE_PROJECTS.filter(p=>nodeProjectState(p.id).done).length;
    if(lastLesson) resumeHref="/node/cours/"+lastLesson.id;
  } else if(path.id==="sql"){
    percent=sqlProgress(); const st=sqlState(); lastLesson=st.lastLesson?SQL_LESSONS.find(l=>l.id===st.lastLesson):null;
    currentLevel=lastLesson?.level||(SQL_LEVELS.find(l=>sqlLevelStats(l.number).percent<100)||SQL_LEVELS[SQL_LEVELS.length-1]).number;
    levels=SQL_LEVELS.length; lessons=SQL_LESSONS.length; exercises=SQL_EXERCISES.length; projects=SQL_PROJECTS.length; projectsDone=SQL_PROJECTS.filter(p=>sqlProjectState(p.id).done).length;
    if(lastLesson) resumeHref="/sql/cours/"+lastLesson.id;
  }
  const started=percent>0||!!lastLesson;
  const status=percent>=100?"Terminé":started?"En cours":"Disponible";
  return {...path,...ui,percent,lastLesson,currentLevel,levels,lessons,exercises,projects,projectsDone,resumeHref,started,status};
}

function allLearningPathSummaries(){ return orderedLearningPaths().map(learningPathSummary); }

function renderLearningPathCard(path, compact=false){
  const action=path.percent>=100?"Revoir":path.started?"Continuer":"Commencer";
  const statusClass=path.percent>=100?"done":path.started?"current":"available";
  return h("article",{class:"path-card path-card--"+path.id+(compact?" compact":"")},
    h("div",{class:"path-card-head"},
      h("span",{class:"path-mark","aria-hidden":"true"},path.mark),
      h("span",{class:"path-status "+statusClass},path.status)),
    h("div",{class:"path-meta-row"},h("span",{class:"path-category"},path.category),h("span",{class:"path-difficulty"},path.difficulty)),
    h("h2",{},path.title),
    para(path.description,"path-description"),
    h("div",{class:"path-progress"},h("div",{class:"progress-label"},h("span",{},path.started?"Progression":"Prêt à commencer"),h("strong",{},path.percent+" %")),bar(path.percent)),
    h("div",{class:"path-learning-state"},
      h("div",{},h("span",{},path.started?"Niveau":"Niveaux"),h("strong",{},path.started?path.currentLevel+" / "+path.levels:String(path.levels))),
      h("div",{},h("span",{},"Cours"),h("strong",{},String(path.lessons))),
      h("div",{},h("span",{},"Projets"),h("strong",{},path.projectsDone+" / "+path.projects))),
    path.lastLesson?h("p",{class:"path-last"},h("span",{},"Dernière leçon"),h("strong",{},path.lastLesson.title)):para(path.prerequisite,"path-prerequisite"),
    h("div",{class:"path-card-actions"},
      link(path.started?path.resumeHref:path.href,action+" →","btn primary path-cta"),
      path.started?link(path.href,"Voir le parcours","btn path-secondary"):null));
}

function renderResumePanel(path){
  if(!path) return h("div",{class:"welcome-overview"},
    h("div",{class:"welcome-logo","aria-hidden":"true"},h("img",{src:"assets/favicon.png",alt:""})),
    h("span",{class:"eyebrow"},"7 PARCOURS COMPLETS"),
    h("h2",{},"Choisis ton point de départ."),
    para("HTML, CSS, JavaScript, React, TypeScript, Node.js ou SQL : chaque parcours garde sa progression séparément.","muted"));
  return h("article",{class:"resume-panel path-card--"+path.id},
    h("span",{class:"eyebrow"},"REPRENDRE LÀ OÙ TU T'ES ARRÊTÉ"),
    h("div",{class:"resume-title"},h("span",{class:"path-mark","aria-hidden":"true"},path.mark),h("div",{},h("h2",{},path.title),para("Niveau "+path.currentLevel+" sur "+path.levels,"muted small"))),
    path.lastLesson?para(path.lastLesson.title,"resume-lesson"):para("Ton parcours est déjà commencé.","resume-lesson"),
    h("div",{class:"progress-label"},h("span",{},"Progression"),h("strong",{},path.percent+" %")),bar(path.percent),
    h("div",{class:"path-card-actions"},link(path.resumeHref,"Continuer →","btn primary"),link(path.href,"Voir le parcours","btn")));
}

function renderHub() {
  const paths=allLearningPathSummaries();
  const started=paths.filter(p=>p.started);
  const lastActive=(state.lastActiveLearningPath?paths.find(p=>p.id===state.lastActiveLearningPath&&p.started):null) || started.find(p=>p.lastLesson) || started[0] || null;
  const totalLessons=paths.reduce((n,p)=>n+p.lessons,0);
  const totalExercises=paths.reduce((n,p)=>n+p.exercises,0);
  return h("div",{class:"page path-hub home-v2"},
    h("section",{class:"hub-hero hub-hero-v2"},
      h("div",{class:"hub-copy"},
        h("span",{class:"eyebrow"},started.length?"BON RETOUR 👋":"BIENVENUE SUR CAHIER CODE"),
        h("h1",{},"Qu’est-ce que tu veux apprendre ?"),
        para("Choisis librement ton parcours. Cours interactifs, exercices, projets et progression : aucun langage n’est imposé.","lead"),
        h("div",{class:"hub-actions"},
          h("button",{class:"btn primary big",type:"button",onclick:()=>document.getElementById("learning-paths")?.scrollIntoView({behavior:"smooth",block:"start"})},"Choisir mon parcours ↓"),
          started.length?link("/dashboard","Voir mes parcours","btn big"):null),
        h("div",{class:"hub-metrics"},metric(paths.length,"parcours"),metric(totalLessons,"leçons"),metric(totalExercises,"exercices"))),
      renderResumePanel(lastActive)),
    h("section",{id:"learning-paths",class:"learning-paths-section","aria-labelledby":"learning-paths-title"},
      h("div",{class:"section-heading hub-heading"},h("div",{},h("span",{class:"eyebrow"},"TOUS LES PARCOURS"),h("h2",{id:"learning-paths-title"},"Choisis ce que tu veux apprendre")),para("Aucun prérequis n'est bloquant : les recommandations t'aident simplement à choisir un ordre confortable.","muted")),
      h("div",{class:"path-grid path-grid-v2"},paths.map(p=>renderLearningPathCard(p)))));
}

function renderGlobalDashboard(){
  const paths=allLearningPathSummaries();
  const started=paths.filter(p=>p.started);
  const completed=paths.filter(p=>p.percent>=100).length;
  const overall=started.length?Math.round(started.reduce((n,p)=>n+p.percent,0)/started.length):0;
  return h("div",{class:"page global-dashboard"},
    h("p",{class:"crumbs"},link("/","Accueil")," / Mes parcours"),
    h("section",{class:"global-dashboard-hero"},
      h("div",{},h("span",{class:"eyebrow"},"DASHBOARD GLOBAL"),h("h1",{},started.length?"Continue ton apprentissage":"Ton apprentissage commence ici"),para(started.length?"Retrouve chaque progression sans qu'un parcours prenne la priorité sur les autres.":"Tu n'as encore commencé aucun parcours. Choisis celui qui t'intéresse : ta progression sera enregistrée séparément.","lead")),
      h("div",{class:"global-dashboard-stats"},metric(started.length,"parcours commencés"),metric(completed,"terminés"),metric(overall+" %","moyenne"))),
    started.length?h("section",{class:"block"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"MES PARCOURS"),h("h2",{},"Reprendre exactement où tu t'es arrêté")),link("/","Découvrir un autre parcours →","btn small")),h("div",{class:"dashboard-path-list"},started.map(p=>h("article",{class:"dashboard-path-row path-card--"+p.id},h("span",{class:"path-mark","aria-hidden":"true"},p.mark),h("div",{class:"dashboard-path-copy"},h("div",{class:"dashboard-path-heading"},h("h3",{},p.title),h("strong",{},p.percent+" %")),p.lastLesson?para("Dernière leçon · "+p.lastLesson.title,"muted small"):para("Niveau "+p.currentLevel+" / "+p.levels,"muted small"),bar(p.percent)),h("div",{class:"dashboard-path-actions"},link(p.resumeHref,"Continuer","btn primary small"),link(p.href,"Vue d'ensemble","btn small")))))):h("section",{class:"empty-dashboard"},h("h2",{},"Choisis ton premier parcours"),para("Tous les langages restent visibles sur l'accueil. Rien n'est sélectionné automatiquement.","muted"),link("/","Voir les parcours →","btn primary big")));
}

function renderReactHome() {
  const percent=reactProgress(), rs=reactState();
  const last=REACT_LESSONS.find(l=>l.id===rs.lastLesson);
  const done=REACT_LESSONS.filter(l=>rs.lessonsDone[l.id]).length;
  return h("div", {class:"page dashboard-page react-dashboard"}, h("p",{class:"crumbs"},link("/","Parcours")," / React.js + Vite"),
    h("section",{class:"dashboard-hero"},h("div",{class:"dashboard-copy"},h("span",{class:"eyebrow"},"REACT + VITE"),h("h1",{},"De tes premiers composants à une application professionnelle."),para("Progresse par niveaux, valide les notions essentielles et transforme-les en projets concrets.","lead"),h("div",{class:"toolbar"},link(last?"/react/cours/"+last.id:"/react/niveau/1",last?"Reprendre : "+last.title:"Commencer le niveau 1","btn primary big"),link("/react/projets","Voir les projets","btn big"))),
      h("div",{class:"progress-orbit"},h("div",{class:"progress-ring",style:"--progress:"+percent},h("strong",{},percent+"%"),h("span",{},"global")),h("div",{class:"orbit-stats"},metric(done,"leçons terminées"),metric(REACT_PROJECTS.filter(p=>reactProjectState(p.id).done).length,"projets terminés")))),
    h("section",{class:"block roadmap-section"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ROADMAP"),h("h2",{},"Ton parcours React")),link("/react/projets","Roadmap des projets →","btn small")),
      h("ol",{class:"learning-roadmap"},REACT_LEVELS.map(l=>{const stats=reactLevelStats(l.number); const stateClass=!l.available?"locked":stats.percent===100?"done":stats.percent>0?"current":"available"; return h("li",{class:"roadmap-node "+stateClass},h("div",{class:"roadmap-marker"},stateClass==="done"?"✓":stateClass==="locked"?"🔒":String(l.number)),h("article",{class:"roadmap-card"},h("div",{class:"roadmap-card-top"},h("span",{class:"eyebrow"},"NIVEAU "+l.number),h("span",{class:"badge "+(stateClass==="locked"?"soon":"")},stateClass==="done"?"TERMINÉ":stateClass==="current"?"EN COURS":stateClass==="locked"?"BIENTÔT":"DISPONIBLE")),h("h3",{},l.title),para(l.description,"muted"),l.available?h("div",{class:"roadmap-progress"},bar(stats.percent),h("small",{},stats.done+" / "+stats.lessons.length+" leçons · "+stats.percent+" %")):para("Ce niveau se débloquera dans la suite du parcours.","muted small"),l.available?link("/react/niveau/"+l.number,"Ouvrir le niveau →","btn small"):null));})))
  );
}
function renderReactLevel(levelNumber) {
  const level=REACT_LEVELS.find((item)=>item.number===Number(levelNumber)); if(!level || !level.available) return renderNotFound();
  const lessons=reactLessonsForLevel(level.number), project=reactProjectForLevel(level.number), stats=reactLevelStats(level.number), practice=reactExerciseStatsForLevel(level.number);
  const evaluation=reactEvaluationForLevel(level.number);
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/react","React.js")," / Niveau "+level.number),pageTitle("Niveau "+level.number+" · "+level.title,level.description),
    h("section",{class:"dashboard-grid react-level-overview"},
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"COURS"),h("h2",{},stats.percent+" %"),para(stats.done+" / "+stats.lessons.length+" leçons terminées","muted"),bar(stats.percent)),
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE"),h("h2",{},practice.percent+" %"),para(practice.solved+" / "+practice.exercises.length+" exercices réussis"+(practice.review?" · "+practice.review+" à revoir":""),"muted"),bar(practice.percent))),
    level.number<=2?h("div",{class:"callout"},h("strong",{},"Niveau "+level.number+" enrichi sur le modèle JavaScript"),para("Chaque leçon contient des exercices variés avec indices progressifs et correction expliquée. La progression historique des leçons est conservée ; les exercices ajoutent une mesure de maîtrise séparée.")):null,
    project?h("div",{class:"callout"},h("strong",{},"Projet de fin de niveau · "+project.title),para(project.description),link("/react/projet/"+project.id,"Voir le projet","btn small")):null,
    evaluation.length?h("div",{class:"callout evaluation-callout"},h("strong",{},"Évaluation de fin de niveau"),para(evaluation.length+" questions pour valider les compétences essentielles de ce niveau."),link("/react/evaluation/"+level.number,"Passer l’évaluation","btn primary small")):null,
    h("ol",{class:"rows lessons"},lessons.map((l,i)=>{const exs=reactExercisesForLesson(l.id), solved=exs.filter(ex=>getRecord(ex.id).success).length; return h("li",{class:"row"},h("span",{class:"num"},i+1),h("div",{class:"row-main"},link("/react/cours/"+l.id,l.title,"row-title"),para(l.objective,"muted small"),exs.length?para(solved+" / "+exs.length+" exercices réussis","muted small"):null),h("span",{class:"status "+(reactState().lessonsDone[l.id]?"ok":"todo")},reactState().lessonsDone[l.id]?"✓ Terminé":"○ À faire"));})));
}

function renderReactLesson(id) {
  const l=REACT_LESSONS.find((item)=>item.id===id); if(!l) return renderNotFound();
  const rs=reactState(); rs.lastLesson=id; commit(); const lessons=reactLessonsForLevel(l.level), index=lessons.indexOf(l), next=lessons[index+1];
  const exercises=reactExercisesForLesson(l.id);
  const firstTodo=exercises.find(ex=>!getRecord(ex.id).success)||exercises[0];
  const exerciseList=exercises.length?h("ul",{class:"rows compact"},exercises.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/react/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.type)+(ex.label?" · "+ex.label:""),"row-title"),para(ex.notion,"muted small")),h("span",{class:"badge d"+ex.difficulty},DIFFICULTY_LABELS[ex.difficulty]),statusBadge(exerciseStatus(ex))))):null;
  const studio=l.level<=5?renderReactLessonStudio(l):null;
  return h("div",{class:"page lesson"},h("p",{class:"crumbs"},link("/react","React.js")," / ",link("/react/niveau/"+l.level,"Niveau "+l.level)," / ",l.title),h("header",{class:"page-head"},h("h1",{},l.title),h("div",{class:"ex-meta"},h("span",{class:"badge level-badge"},"React · Niveau "+l.level),h("span",{class:"muted small"},l.minutes+" minutes")),para(l.objective,"lead")),
    h("div",{class:"sheet"},
      section(1,"L’explication",...renderBlocks(l.explanation)),
      section(2,"Un exemple",codeBlock(l.code,true)),
      section(3,"Le code expliqué",h("ul",{class:"walk"},l.details.map(x=>h("li",{},h("p",{html:rich(x)}))))),
      studio?section(4,"Laboratoire interactif React + Vite",para("Manipule maintenant la notion dans un mini environnement de développement intégré au cours. Le terminal est simulé ; le rendu, les clics, le state et la console réagissent dans une iframe isolée."),studio):null,
      section(studio?5:4,"Les erreurs fréquentes",h("ul",{},l.mistakes.map(x=>h("li",{},x)))),
      section(studio?6:5,"Astuce VS Code",h("div",{class:"hint"},h("strong",{},l.shortcut.text),para("Windows/Linux : "+l.shortcut.win+" · macOS : "+l.shortcut.mac))),
      section(studio?7:6,"Le résumé",h("ul",{class:"summary"},[l.objective].concat(l.details.slice(0,3)).map(x=>h("li",{html:rich(x)})))),
      exercises.length?section(studio?8:7,"Les exercices",para("Tu as "+exercises.length+" exercices pour cette leçon. Comme en JavaScript, les indices s’ouvrent progressivement et la correction se débloque après deux essais ratés."),exerciseList,h("div",{class:"toolbar"},h("button",{class:"btn primary big",type:"button",onclick:()=>{reactState().lessonsDone[id]=true;commit();location.hash="#/react/exercice/"+firstTodo.id;}},"Terminer le cours et pratiquer"))):section(studio?8:7,"Terminer la leçon",h("button",{class:"btn primary",type:"button",onclick:()=>{reactState().lessonsDone[id]=true;commit();location.hash=next?"#/react/cours/"+next.id:"#/react/niveau/"+l.level;}},next?"Terminer et continuer":"Terminer la leçon"))),
    h("nav",{class:"pager","aria-label":"Cours React précédent et suivant"},index>0?link("/react/cours/"+lessons[index-1].id,"← "+lessons[index-1].title):h("span"),next?link("/react/cours/"+next.id,next.title+" →"):link("/react/niveau/"+l.level,"Retour au niveau →")));
}

function renderReactExerciseList() {
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/react","React.js")," / Exercices"),pageTitle("Exercices React","Même logique que le parcours JavaScript : pratique régulière, difficultés progressives, indices et corrections."),
    REACT_LEVELS.filter(l=>l.available).map(level=>{const levelExercises=reactExercisesForLevel(level.number); if(!levelExercises.length) return null; return h("section",{class:"block"},h("h2",{},"Niveau "+level.number+" · "+level.title),reactLessonsForLevel(level.number).map(lesson=>{const exs=reactExercisesForLesson(lesson.id); if(!exs.length) return null; return h("div",{class:"exercise-group"},h("h3",{},link("/react/cours/"+lesson.id,lesson.title)),h("ul",{class:"rows compact"},exs.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/react/exercice/"+ex.id,TYPE_LABELS[ex.type]||ex.type,"row-title"),para(ex.notion,"muted small")),h("span",{class:"badge d"+ex.difficulty},DIFFICULTY_LABELS[ex.difficulty]),statusBadge(exerciseStatus(ex))))));}));}));
}

function renderReactExercisePage(id) {
  const ex=getReactExercise(id); if(!ex || ex.evaluationLevel) return renderNotFound();
  const lesson=REACT_LESSONS.find(l=>l.id===ex.lesson); if(!lesson) return renderNotFound();
  const siblings=reactExercisesForLesson(ex.lesson), position=siblings.indexOf(ex), previous=siblings[position-1], following=siblings[position+1];
  const nextBox=h("div",{class:"next-box"});
  const exercise=renderExercise(ex,{onFinish:()=>{nextBox.replaceChildren(following?link("/react/exercice/"+following.id,"Exercice suivant →","btn primary big"):link("/react/cours/"+lesson.id,"Retour au cours","btn primary big"));}});
  const studio=ex.studio?renderReactLessonStudio({id:ex.studio}):null;
  const studioSection=studio?h("section",{class:"block exercise-studio"},h("span",{class:"eyebrow"},"ATELIER INTERACTIF"),h("h2",{},"Expérimente avant de valider"),para("Manipule la notion dans le React Studio : modifie les fichiers, utilise la preview ou le terminal, puis reviens à la validation de l’exercice. Le studio et la correction utilisent la même notion mais restent deux étapes complémentaires.","muted"),studio):null;
  const record=getRecord(ex.id);
  return h("div",{class:"page exercise-page"},h("p",{class:"crumbs"},link("/react/cours/"+lesson.id,lesson.title)," / Exercice "+(position+1)+" sur "+siblings.length),record.attempts?para("Déjà tenté "+record.attempts+" fois"+(record.success?" · déjà réussi":"")+(record.review?" · à revoir":"")+".","muted small"):null,studioSection,exercise,nextBox,h("nav",{class:"pager"},previous?link("/react/exercice/"+previous.id,"← Exercice précédent"):link("/react/cours/"+lesson.id,"← Revoir le cours"),following?link("/react/exercice/"+following.id,"Exercice suivant →"):h("span")));
}

function renderReactRevision() {
  const all=REACT_EXERCISES;
  const rs=reactState();
  const priority=all.filter(ex=>getRecord(ex.id).review).sort((a,b)=>(getRecord(b.id).fails||0)-(getRecord(a.id).fails||0));
  const incomplete=all.filter(ex=>!getRecord(ex.id).success && !getRecord(ex.id).review);
  const fragileNotions=Object.entries(rs.notions||{}).filter(([,s])=>(s.ko||0)>0).sort((a,b)=>((b[1].ko||0)-(b[1].ok||0))-((a[1].ko||0)-(a[1].ok||0)));
  const levelSummaries=REACT_LEVELS.filter(level=>level.available).map(level=>{
    const exs=reactExercisesForLevel(level.number);
    const todo=exs.filter(ex=>!getRecord(ex.id).success && !getRecord(ex.id).review);
    const review=exs.filter(ex=>getRecord(ex.id).review);
    const evalState=(rs.evaluations&&rs.evaluations[level.number])||{};
    const best=evalState.bestPercent||0;
    const project=REACT_PROJECTS.find(project=>project.level===level.number && project.status==="available");
    const projectDone=project?reactProjectState(project.id).done:false;
    return {level,exs,todo,review,best,project,projectDone};
  });
  const weakLevels=levelSummaries.filter(row=>row.best<80 || !row.projectDone || row.review.length || row.todo.length);
  const totalPending=incomplete.length+priority.length;
  return h("div",{class:"page"},
    h("p",{class:"crumbs"},link("/react","React.js")," / Révision"),
    pageTitle("Révision React","Une vue complète de ce qu'il faut consolider : exercices, notions fragiles, évaluations, projets et activités encore non maîtrisées."),
    h("section",{class:"dashboard-grid"},
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},priority.length),para("exercice"+(priority.length>1?"s":"")+" marqué"+(priority.length>1?"s":"")+" à revoir","muted")),
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"À PRATIQUER"),h("h2",{},totalPending),para("activité"+(totalPending>1?"s":"")+" non maîtrisée"+(totalPending>1?"s":""),"muted")),
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"NOTIONS FRAGILES"),h("h2",{},fragileNotions.length),para("notion"+(fragileNotions.length>1?"s":"")+" avec au moins une erreur enregistrée","muted"))
    ),
    h("section",{class:"block review-zone"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},"À revoir en premier"))),
      priority.length?h("div",{class:"review-grid"},priority.map(ex=>{const rec=getRecord(ex.id),lesson=REACT_LESSONS.find(l=>l.id===ex.lesson);return h("article",{class:"review-card"},h("span",{class:"review-alert"},"↻"),h("div",{class:"row-main"},h("strong",{},ex.notion),para((lesson?"Niveau "+lesson.level+" · ":"")+(lesson?lesson.title:"React"),"muted small"),para((rec.fails||0)+" erreur"+((rec.fails||0)>1?"s":"")+(rec.correctionSeen?" · correction consultée":""),"muted small")),link("/react/exercice/"+ex.id,"Refaire","btn small primary"))})) : empty("Aucun exercice React n'est actuellement marqué « à revoir ».")),
    h("section",{class:"block"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"DIAGNOSTIC"),h("h2",{},"Notions fragiles"))),
      fragileNotions.length?h("ul",{class:"rows compact"},fragileNotions.map(([name,s])=>{const candidates=all.filter(ex=>ex.notion===name);const target=candidates.find(ex=>getRecord(ex.id).review)||candidates.find(ex=>!getRecord(ex.id).success)||candidates[0];return h("li",{class:"row"},h("div",{class:"row-main"},h("strong",{},name),para((s.ok||0)+" réussite"+((s.ok||0)>1?"s":"")+" · "+(s.ko||0)+" erreur"+((s.ko||0)>1?"s":""),"muted small")),target?link("/react/exercice/"+target.id,"Réviser","btn small"):null);})) : empty("Aucune notion fragile détectée dans ta progression React.")),
    h("section",{class:"block"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"VALIDATION"),h("h2",{},"Évaluations et projets"))),
      h("div",{class:"project-roadmap"},levelSummaries.map(row=>h("article",{class:"path-card project-card"},h("div",{class:"project-meta"},h("span",{class:"badge"},"Niveau "+row.level.number),h("span",{class:"status "+(row.best>=80&&row.projectDone?"ok":"todo")},row.best>=80&&row.projectDone?"✓ Validé":"À consolider")),h("h3",{},row.level.title),para("Évaluation : "+row.best+" %"+(row.best>=80?" · seuil atteint":" · objectif 80 %"),"muted small"),para("Projet : "+(row.projectDone?"terminé":"à faire / à valider"),"muted small"),h("div",{class:"toolbar"},link("/react/evaluation/"+row.level.number,row.best>=80?"Repasser l'évaluation":"Passer l'évaluation","btn small"),row.project?link("/react/projet/"+row.project.id,row.projectDone?"Revoir le projet":"Ouvrir le projet","btn small primary"):null))))),
    h("section",{class:"block"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"PAR NIVEAU"),h("h2",{},"Tout ce qu'il reste à pratiquer"))),
      weakLevels.length?weakLevels.map(row=>h("div",{class:"exercise-group"},h("h3",{},"Niveau "+row.level.number+" · "+row.level.title),para((row.review.length+row.todo.length)+" exercice"+((row.review.length+row.todo.length)>1?"s":"")+" à consolider","muted small"),row.review.length+row.todo.length?h("ul",{class:"rows compact"},[...row.review,...row.todo].map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/react/exercice/"+ex.id,ex.notion,"row-title"),para((TYPE_LABELS[ex.type]||ex.type)+" · "+(getRecord(ex.id).review?"à revoir":"à faire"),"muted small")),statusBadge(exerciseStatus(ex))))):empty("Tous les exercices de ce niveau sont maîtrisés."))) : empty("Tout le parcours React est maîtrisé. Tu peux utiliser les projets pour entretenir tes acquis."))
  );
}

function renderReactEvaluation(levelNumber) {
  const level=Number(levelNumber), questions=reactEvaluationForLevel(level); if(!questions.length) return renderNotFound();
  const rs=reactState(); if(!rs.evaluations) rs.evaluations={};
  const best=rs.evaluations[level]&&rs.evaluations[level].bestPercent||0;
  let finished=0, correct=0;
  const scoreText=h("strong",{},"0 / "+questions.length+" terminées");
  const scoreBar=bar(0);
  const result=h("div",{class:"feedback info","aria-live":"polite"},para("Score minimum conseillé : 80 %. Ton meilleur score est "+best+" %."));
  function update(ok){finished++; if(ok) correct++; const percent=Math.round((correct/questions.length)*100); scoreText.textContent=finished+" / "+questions.length+" terminées · "+correct+" correctes"; scoreBar.querySelector("span").style.width=Math.round((finished/questions.length)*100)+"%"; scoreBar.setAttribute("aria-valuenow",Math.round((finished/questions.length)*100)); if(finished===questions.length){if(!rs.evaluations[level]) rs.evaluations[level]={bestPercent:0}; rs.evaluations[level].bestPercent=Math.max(rs.evaluations[level].bestPercent||0,percent); commit(); result.className="feedback "+(percent>=80?"ok":"ko"); result.replaceChildren(h("strong",{},percent>=80?"Évaluation validée !":"Encore un effort."),para("Score : "+percent+" %. "+(percent>=80?"Tu maîtrises les objectifs principaux du niveau.":"Reviens sur les exercices à revoir puis retente l’évaluation.")));}}
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/react/niveau/"+level,"Niveau "+level)," / Évaluation"),pageTitle("Évaluation · Niveau "+level,"Une vraie validation des compétences du niveau : compréhension, lecture de code, correction et mise en pratique."),h("section",{class:"block evaluation-status"},scoreText,scoreBar,result),h("div",{class:"evaluation-list"},questions.map((q,index)=>h("section",{class:"block"},h("span",{class:"eyebrow"},"QUESTION "+(index+1)+" / "+questions.length),renderExercise(q,{quick:true,onFinish:update})))));
}

function renderReactProjects() {
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/react","React.js")," / Projets"),pageTitle("Projets React", "Chaque niveau mène à un projet plus autonome. Les projets futurs sont annoncés sans être artificiellement considérés comme développés."),
    h("div",{class:"project-roadmap"},REACT_PROJECTS.map((project)=>{
      const level=REACT_LEVELS.find((item)=>item.number===project.level), available=project.status==="available" && level && level.available, record=reactProjectState(project.id);
      return h("article",{class:"path-card project-card"+(available?"":" locked")},h("div",{class:"project-meta"},h("span",{class:"badge"},"Niveau "+project.level),h("span",{class:"status "+(record.done?"ok":"todo")},record.done?"✓ Terminé":available?"Disponible":"Planifié")),h("h2",{},project.title),para(project.description),h("ul",{class:"tag-list"},project.skills.map(skill=>h("li",{},skill))),available?link("/react/projet/"+project.id,record.done?"Revoir le projet":"Ouvrir le projet","btn primary"):para("Ce projet sera développé avec son niveau afin de conserver une progression verticale et fonctionnelle.","muted small"));
    })));
}
function renderReactProject(id) {
  const project=REACT_PROJECTS.find((item)=>item.id===id); if(!project) return renderNotFound();
  const level=REACT_LEVELS.find((item)=>item.number===project.level); if(project.status!=="available" || !level || !level.available) return renderNotFound();
  const record=reactProjectState(id);
  const header=h("div",{class:"page"},h("p",{class:"crumbs"},link("/react","React.js")," / ",link("/react/projets","Projets")," / ",project.title),pageTitle(project.title,project.description),h("div",{class:"callout"},h("strong",{},"Compétences visées"),h("ul",{},project.skills.map(skill=>h("li",{},skill)))));
  if(!project.starter){
    header.append(h("section",{class:"block"},h("h2",{},"Cahier des charges"),para("Construis l’application dans un projet React + Vite. Réutilise plusieurs composants, passe des données avec les props et ajoute au moins une interaction gérée avec useState."),h("button",{class:"btn primary",type:"button",onclick:()=>{record.done=true;commit();router();}},record.done?"✓ Projet terminé":"Marquer le projet comme terminé")));
    return header;
  }
  const projectStudio=project.level<=5?renderReactLessonStudio(project):null;
  if(projectStudio) header.append(h("section",{class:"block"},h("h2",{},"Atelier interactif · application complète"),para("Teste le projet directement dans le navigateur simulé, manipule ses interactions puis modifie les fichiers depuis l’explorateur. Utilise ensuite la validation structurelle comme contrôle final."),projectStudio));
  const result=h("div",{class:"project-checks","aria-live":"polite"},para("Écris ton implémentation puis lance la vérification structurelle. Le studio ci-dessus permet de tester les interactions ; cette vérification contrôle en complément les éléments attendus dans ton code.","muted small"));
  const editor=makeEditor(record.draft||project.starter,20,null,"react");
  function saveDraft(){record.draft=editor.value;commit();result.replaceChildren(para("Brouillon sauvegardé localement.","muted small"));}
  function verify(){
    const checks=project.checks.map(check=>({label:check.label,ok:check.test(editor.value)}));
    const all=checks.every(check=>check.ok);
    if(all){record.done=true;record.draft=editor.value;commit();}
    result.replaceChildren(
      h("ul",{class:"check-list"},checks.map(check=>h("li",{class:check.ok?"check-ok":"check-ko"},(check.ok?"✓ ":"○ ")+check.label))),
      all ? h("p",{class:"success"},"Projet validé : les critères structurels principaux sont présents.") : h("p",{class:"muted"},"Certains critères manquent encore. La validation vérifie la structure, pas le comportement complet de React.")
    );
  }
  header.append(h("section",{class:"block"},h("h2",{},"Atelier"),para(project.workshop || project.description),editor,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:verify},"Vérifier le projet"),h("button",{class:"btn ghost",type:"button",onclick:saveDraft},"Sauvegarder le brouillon"),h("button",{class:"btn ghost",type:"button",onclick:()=>{editor.value=project.starter;result.replaceChildren(para("Code de départ restauré.","muted small"));}},"Réinitialiser")),result),h("section",{class:"block"},h("h2",{},"Critères de réussite"),h("ul",{},project.checks.map(check=>h("li",{},check.label)))));
  return header;
}


// ═══════════ Parcours CSS ═══════════
function cssState(){
  if(!state.css) state.css={lessonsDone:{},lastLesson:null,projects:{},exercises:{},notions:{},evaluations:{}};
  if(!state.css.lessonsDone) state.css.lessonsDone={}; if(!state.css.projects) state.css.projects={}; if(!state.css.exercises) state.css.exercises={}; if(!state.css.notions) state.css.notions={}; if(!state.css.evaluations) state.css.evaluations={};
  return state.css;
}
function cssLevelStats(level){const lessons=cssLessonsForLevel(level),done=lessons.filter(l=>cssState().lessonsDone[l.id]).length; return {lessons,done,percent:lessons.length?Math.round(done/lessons.length*100):0};}
function cssExerciseStatsForLevel(level){const exercises=cssExercisesForLevel(level),solved=exercises.filter(e=>getRecord(e.id).success).length,review=exercises.filter(e=>getRecord(e.id).review).length; return {exercises,solved,review,percent:exercises.length?Math.round(solved/exercises.length*100):0};}
function cssProgress(){const lessons=CSS_LESSONS,done=lessons.filter(l=>cssState().lessonsDone[l.id]).length; return lessons.length?Math.round(done/lessons.length*100):0;}
function cssProjectState(id){const st=cssState(); if(!st.projects[id]) st.projects[id]={done:false,draft:null}; return st.projects[id];}

function renderCssHome(){
  const percent=cssProgress(),cs=cssState(),last=CSS_LESSONS.find(l=>l.id===cs.lastLesson);
  const currentLevel = last ? last.level : ((CSS_LEVELS.find(level => cssLevelStats(level.number).percent < 100) || CSS_LEVELS[CSS_LEVELS.length - 1] || {number:1}).number);
  const current=CSS_LEVELS.find(l=>l.number===currentLevel)||CSS_LEVELS[0];
  const totalPractice={exercises:CSS_EXERCISES,solved:CSS_EXERCISES.filter(e=>getRecord(e.id).success).length,review:CSS_EXERCISES.filter(e=>getRecord(e.id).review).length};
  totalPractice.percent=totalPractice.exercises.length?Math.round(totalPractice.solved/totalPractice.exercises.length*100):0;
  return h("div",{class:"page dashboard-page css-dashboard"},h("p",{class:"crumbs"},link("/","Parcours")," / CSS"),
    h("section",{class:"dashboard-hero"},h("div",{class:"dashboard-copy"},h("span",{class:"eyebrow"},"PARCOURS CSS"),h("h1",{},"Apprends le style en le voyant changer."),para("Un parcours visuel : modifie HTML/CSS, observe la preview en temps réel, puis valide le résultat calculé par le navigateur.","lead"),h("div",{class:"toolbar"},link(last?"/css/cours/"+last.id:"/css/niveau/1",last?"Reprendre : "+last.title:"Commencer le Niveau 1","btn primary big"),link("/css/exercices","Pratiquer","btn big"))),
      h("div",{class:"progress-orbit"},h("div",{class:"progress-ring",style:"--progress:"+percent},h("strong",{},percent+"%"),h("span",{},"cours")),h("div",{class:"orbit-stats"},metric(totalPractice.solved,"exercices réussis"),metric(totalPractice.review,"à revoir")))),
    h("section",{class:"dashboard-grid"},h("article",{class:"resume-card"},h("span",{class:"eyebrow"},"NIVEAU "+current.number),h("h2",{},current.title),para(current.description,"muted"),link("/css/niveau/"+current.number,"Ouvrir le niveau →","btn primary")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE GLOBALE"),h("h2",{},totalPractice.percent+" %"),para(totalPractice.solved+" / "+totalPractice.exercises.length+" exercices réussis","muted"),bar(totalPractice.percent))),
    h("section",{class:"block roadmap-section"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ROADMAP CSS"),h("h2",{},"Construis tes compétences niveau par niveau"))),h("ol",{class:"learning-roadmap"},CSS_LEVELS.map(level=>{const stats=cssLevelStats(level.number),practice=cssExerciseStatsForLevel(level.number),stateClass=stats.percent===100?"done":level.number===currentLevel?"current":"available"; return h("li",{class:"roadmap-node "+stateClass},h("div",{class:"roadmap-marker"},stateClass==="done"?"✓":String(level.number)),h("article",{class:"roadmap-card"},h("div",{class:"roadmap-card-top"},h("span",{class:"eyebrow"},"NIVEAU "+level.number),h("span",{class:"badge"},stateClass==="done"?"TERMINÉ":stateClass==="current"?"EN COURS":"DISPONIBLE")),h("h3",{},level.title),para(level.description,"muted"),para(stats.lessons.length+" leçons · "+practice.exercises.length+" exercices · 1 projet · 1 évaluation","muted small"),h("div",{class:"roadmap-progress"},bar(stats.percent),h("small",{},stats.percent+" % des leçons")),link("/css/niveau/"+level.number,stateClass==="done"?"Revoir →":"Continuer →","btn small")));}))),
    h("div",{class:"callout"},h("strong",{},"Parcours CSS complet"),para("Le parcours couvre maintenant 5 niveaux : bases, mise en page, responsive, composants avancés et CSS professionnel, toujours avec preview live, indices progressifs et validations visuelles.")));
}
function renderCssLevel(levelNumber) {
  const level = CSS_LEVELS.find((item) => item.number === Number(levelNumber));
  if (!level) return renderNotFound();
  const lessons = cssLessonsForLevel(level.number);
  const stats = cssLevelStats(level.number);
  const practice = cssExerciseStatsForLevel(level.number);
  const evaluation = cssEvaluationForLevel(level.number);
  const project = cssProjectForLevel(level.number);
  return h("div", { class:"page" },
    h("p", { class:"crumbs" }, link("/css","CSS"), " / Niveau " + level.number),
    pageTitle("Niveau " + level.number + " · " + level.title, level.description),
    h("section", { class:"dashboard-grid react-level-overview" },
      h("article", { class:"stats-card" }, h("span",{class:"eyebrow"},"COURS"), h("h2",{},stats.percent+" %"), para(stats.done+" / "+stats.lessons.length+" leçons terminées","muted"), bar(stats.percent)),
      h("article", { class:"stats-card" }, h("span",{class:"eyebrow"},"PRATIQUE"), h("h2",{},practice.percent+" %"), para(practice.solved+" / "+practice.exercises.length+" exercices réussis"+(practice.review?" · "+practice.review+" à revoir":""),"muted"), bar(practice.percent))
    ),
    project ? h("div", { class:"callout" }, h("strong",{},"Projet final · "+project.title), para(project.description), link("/css/projet/"+project.id,"Ouvrir le projet","btn small")) : null,
    evaluation.length ? h("div", { class:"callout evaluation-callout" }, h("strong",{},"Évaluation de fin de niveau"), para(evaluation.length+" questions pour valider les fondamentaux."), link("/css/evaluation/"+level.number,"Passer l'évaluation","btn primary small")) : null,
    h("ol", { class:"rows lessons" }, lessons.map((lesson,index) => {
      const exercises = cssExercisesForLesson(lesson.id);
      const solved = exercises.filter((exercise) => getRecord(exercise.id).success).length;
      return h("li", { class:"row" },
        h("span", { class:"num" }, index + 1),
        h("div", { class:"row-main" }, link("/css/cours/"+lesson.id,lesson.title,"row-title"), para(lesson.objective,"muted small"), para(solved+" / "+exercises.length+" exercices réussis","muted small")),
        h("span", { class:"status "+(cssState().lessonsDone[lesson.id]?"ok":"todo") }, cssState().lessonsDone[lesson.id]?"✓ Terminé":"○ À faire")
      );
    }))
  );
}
function renderCssLesson(id){
  const l=CSS_LESSONS.find(x=>x.id===id);
  if(!l) return renderNotFound();
  const cs=cssState();
  cs.lastLesson=id;
  commit();
  const lessons=cssLessonsForLevel(l.level);
  const idx=lessons.indexOf(l);
  const next=lessons[idx+1];
  const exs=cssExercisesForLesson(l.id);
  const firstTodo=exs.find(ex=>!getRecord(ex.id).success)||exs[0];
  const project=cssProjectForLevel(l.level);
  const practiceList=h("section",{class:"block"},
    h("h2",{},"À toi de pratiquer"),
    h("ul",{class:"rows compact"},exs.map(ex=>h("li",{class:"row"},
      h("div",{class:"row-main"},link("/css/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.type)+" · "+ex.notion,"row-title")),
      statusBadge(exerciseStatus(ex))
    ))),
    firstTodo?link("/css/exercice/"+firstTodo.id,"Commencer les exercices →","btn primary"):null
  );
  const nextLink=next
    ? link("/css/cours/"+next.id,"Leçon suivante →","btn")
    : project
      ? link("/css/projet/"+project.id,"Projet final →","btn")
      : link("/css","Retour au parcours","btn");
  const toolbar=h("div",{class:"toolbar"},
    h("button",{class:"btn primary",type:"button",onclick:()=>{cssState().lessonsDone[l.id]=true;commit();router();}},cssState().lessonsDone[l.id]?"✓ Leçon terminée":"Marquer comme terminée"),
    nextLink
  );
  return h("div",{class:"page"},
    h("p",{class:"crumbs"},link("/css","CSS")," / ",link("/css/niveau/"+l.level,"Niveau "+l.level)," / ",l.title),
    pageTitle(l.title,l.objective),
    h("article",{class:"sheet"},
      section(1,"Comprendre",...l.explanation.map(x=>para(x))),
      section(2,"Observer",codeBlock(l.code,true),h("ul",{},l.details.map(x=>h("li",{html:rich(x)})))),
      section(3,"Erreurs fréquentes",h("ul",{},l.mistakes.map(x=>h("li",{},x)))),
      l.shortcut?section(4,"Astuce VS Code",h("div",{class:"callout"},h("strong",{},l.shortcut.win+" · "+l.shortcut.mac),para(l.shortcut.text))):null
    ),
    renderCssStudio(l.studio),
    practiceList,
    toolbar
  );
}
function renderCssExerciseList(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/css","CSS")," / Exercices"),pageTitle("Exercices CSS",CSS_EXERCISES.length+" activités variées : compréhension, debugging, layout et objectifs visuels."),CSS_LESSONS.map(l=>h("section",{class:"block exercise-group"},h("h2",{},link("/css/cours/"+l.id,l.title)),h("ul",{class:"rows compact"},cssExercisesForLesson(l.id).map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/css/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.type)+" · "+ex.notion,"row-title")),h("span",{class:"badge d"+ex.difficulty},DIFFICULTY_LABELS[ex.difficulty]),statusBadge(exerciseStatus(ex))))))));}
function renderCssExercisePage(id){const ex=CSS_EXERCISES.find(e=>e.id===id); if(!ex) return renderNotFound(); const lesson=CSS_LESSONS.find(l=>l.id===ex.lesson),siblings=cssExercisesForLesson(ex.lesson),idx=siblings.indexOf(ex),next=siblings[idx+1]; const finish=h("div",{}); return h("div",{class:"page"},h("p",{class:"crumbs"},link("/css","CSS")," / ",link("/css/cours/"+lesson.id,lesson.title)," / Exercice"),pageTitle(ex.notion,ex.question),renderExercise(ex,{onFinish:()=>finish.replaceChildren(next?link("/css/exercice/"+next.id,"Exercice suivant →","btn primary big"):link("/css/cours/"+lesson.id,"Retour au cours","btn primary big"))}),finish);}
function renderCssRevision(){
  const all=CSS_EXERCISES;
  const st=cssState();
  const priority=all.filter(ex=>getRecord(ex.id).review).sort((a,b)=>(getRecord(b.id).fails||0)-(getRecord(a.id).fails||0));
  const incomplete=all.filter(ex=>!getRecord(ex.id).success && !getRecord(ex.id).review);
  const fragileNotions=Object.entries(st.notions||{}).filter(([,s])=>(s.ko||0)>0).sort((a,b)=>((b[1].ko||0)-(b[1].ok||0))-((a[1].ko||0)-(a[1].ok||0)));
  const levelSummaries=CSS_LEVELS.map(level=>{
    const exs=cssExercisesForLevel(level.number);
    const todo=exs.filter(ex=>!getRecord(ex.id).success && !getRecord(ex.id).review);
    const review=exs.filter(ex=>getRecord(ex.id).review);
    const evalState=(st.evaluations&&st.evaluations[level.number])||{};
    const best=evalState.best||0;
    const project=cssProjectForLevel(level.number);
    const projectDone=project?cssProjectState(project.id).done:false;
    return {level,exs,todo,review,best,project,projectDone};
  });
  const weakLevels=levelSummaries.filter(row=>row.best<80 || !row.projectDone || row.review.length || row.todo.length);
  const totalPending=incomplete.length+priority.length;
  return h("div",{class:"page"},
    h("p",{class:"crumbs"},link("/css","CSS")," / Révision"),
    pageTitle("Révision CSS","Une vue complète de ce qu'il faut consolider : erreurs, notions fragiles, évaluations, projets et exercices encore non maîtrisés."),
    h("section",{class:"dashboard-grid"},
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},priority.length),para("exercice"+(priority.length>1?"s":"")+" marqué"+(priority.length>1?"s":"")+" à revoir","muted")),
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"À PRATIQUER"),h("h2",{},totalPending),para("activité"+(totalPending>1?"s":"")+" non maîtrisée"+(totalPending>1?"s":""),"muted")),
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"NOTIONS FRAGILES"),h("h2",{},fragileNotions.length),para("notion"+(fragileNotions.length>1?"s":"")+" avec au moins une erreur enregistrée","muted"))
    ),
    h("section",{class:"block review-zone"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},"À revoir en premier"))),
      priority.length?h("div",{class:"review-grid"},priority.map(ex=>{const rec=getRecord(ex.id),lesson=CSS_LESSONS.find(l=>l.id===ex.lesson);return h("article",{class:"review-card"},h("span",{class:"review-alert"},"↻"),h("div",{class:"row-main"},h("strong",{},ex.notion),para((lesson?"Niveau "+lesson.level+" · ":"")+(lesson?lesson.title:"CSS"),"muted small"),para((rec.fails||0)+" erreur"+((rec.fails||0)>1?"s":"")+(rec.correctionSeen?" · correction consultée":""),"muted small")),link("/css/exercice/"+ex.id,"Refaire","btn small primary"))})) : empty("Aucun exercice n'est actuellement marqué « à revoir ».")),
    h("section",{class:"block"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"DIAGNOSTIC"),h("h2",{},"Notions fragiles"))),
      fragileNotions.length?h("ul",{class:"rows compact"},fragileNotions.map(([name,s])=>{const candidates=all.filter(ex=>ex.notion===name);const target=candidates.find(ex=>getRecord(ex.id).review)||candidates.find(ex=>!getRecord(ex.id).success)||candidates[0];return h("li",{class:"row"},h("div",{class:"row-main"},h("strong",{},name),para((s.ok||0)+" réussite"+((s.ok||0)>1?"s":"")+" · "+(s.ko||0)+" erreur"+((s.ko||0)>1?"s":""),"muted small")),target?link("/css/exercice/"+target.id,"Réviser","btn small"):null);})) : empty("Aucune notion fragile détectée dans ta progression.")),
    h("section",{class:"block"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"VALIDATION"),h("h2",{},"Évaluations et projets"))),
      h("div",{class:"project-roadmap"},levelSummaries.map(row=>h("article",{class:"path-card project-card"},h("div",{class:"project-meta"},h("span",{class:"badge"},"Niveau "+row.level.number),h("span",{class:"status "+(row.best>=80&&row.projectDone?"ok":"todo")},row.best>=80&&row.projectDone?"✓ Validé":"À consolider")),h("h3",{},row.level.title),para("Évaluation : "+row.best+" %"+(row.best>=80?" · seuil atteint":" · objectif 80 %"),"muted small"),para("Projet : "+(row.projectDone?"terminé":"à faire / à valider"),"muted small"),h("div",{class:"toolbar"},link("/css/evaluation/"+row.level.number,row.best>=80?"Repasser l'évaluation":"Passer l'évaluation","btn small"),row.project?link("/css/projet/"+row.project.id,row.projectDone?"Revoir le projet":"Ouvrir le projet","btn small primary"):null))))),
    h("section",{class:"block"},
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"PAR NIVEAU"),h("h2",{},"Tout ce qu'il reste à pratiquer"))),
      weakLevels.length?weakLevels.map(row=>h("div",{class:"exercise-group"},h("h3",{},"Niveau "+row.level.number+" · "+row.level.title),para((row.review.length+row.todo.length)+" exercice"+((row.review.length+row.todo.length)>1?"s":"")+" à consolider","muted small"),row.review.length+row.todo.length?h("ul",{class:"rows compact"},[...row.review,...row.todo].map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/css/exercice/"+ex.id,ex.notion,"row-title"),para((TYPE_LABELS[ex.type]||ex.type)+" · "+(getRecord(ex.id).review?"à revoir":"à faire"),"muted small")),statusBadge(exerciseStatus(ex))))):empty("Tous les exercices de ce niveau sont maîtrisés."))) : empty("Tout le parcours CSS est maîtrisé. Tu peux utiliser les projets pour entretenir tes acquis."))
  );
}
function renderCssEvaluation(level){const questions=cssEvaluationForLevel(level); if(!questions.length) return renderNotFound(); const st=cssState(); if(!st.evaluations[level]) st.evaluations[level]={best:0}; const status=h("div",{class:"evaluation-status"}); function update(){const solved=questions.filter(q=>getRecord(q.id).success).length,score=Math.round(solved/questions.length*100); st.evaluations[level].best=Math.max(st.evaluations[level].best||0,score);commit();status.replaceChildren(h("strong",{},"Score actuel : "+score+" % · meilleur : "+st.evaluations[level].best+" %"),bar(score),para(score>=80?"✓ Seuil conseillé de 80 % atteint.":"Continue : 80 % est le seuil conseillé.","muted"));} update(); return h("div",{class:"page"},h("p",{class:"crumbs"},link("/css/niveau/"+level,"Niveau "+level)," / Évaluation"),pageTitle("Évaluation · Niveau "+level,level===1?"Compréhension, syntaxe, box model, couleurs, typographie et unités.":level===2?"Display, positionnement, z-index et Flexbox en situation.":level===3?"Grid, responsive design, media queries, unités modernes et composition adaptative.":"Sélecteurs avancés, états interactifs, variables, transitions, transforms, animations et composants."),status,h("div",{class:"evaluation-list"},questions.map((q,i)=>h("section",{class:"block"},h("span",{class:"eyebrow"},"QUESTION "+(i+1)+" / "+questions.length),renderExercise(q,{quick:true,onFinish:update})))));}
function renderCssProjects(){
  const ordered=CSS_PROJECTS.slice().sort((a,b)=>a.level-b.level);
  return h("div",{class:"page"},
    h("p",{class:"crumbs"},link("/css","CSS")," / Projets"),
    pageTitle("Projets CSS","Choisis librement le projet que tu veux réaliser ou revoir. Chaque projet correspond à un niveau du parcours et réutilise le même atelier HTML/CSS avec preview live."),
    h("div",{class:"project-roadmap"},ordered.map(project=>{
      const level=CSS_LEVELS.find(item=>item.number===project.level);
      const record=cssProjectState(project.id);
      return h("article",{class:"path-card project-card"},
        h("div",{class:"project-meta"},
          h("span",{class:"badge"},"Niveau "+project.level),
          h("span",{class:"status "+(record.done?"ok":"todo")},record.done?"✓ Terminé":"Disponible")
        ),
        h("h2",{},project.title),
        para(project.description,"muted"),
        level?para(level.title,"muted small"):null,
        link("/css/projet/"+project.id,record.done?"Revoir le projet":"Ouvrir le projet","btn primary")
      );
    }))
  );
}

function renderCssProject(id){const project=CSS_PROJECTS.find(p=>p.id===id); if(!project) return renderNotFound(); const record=cssProjectState(id); const lab=renderLab({files:(record.draft||project.files).map(f=>({...f})),previewHeight:340,tips:true,live:true,previewModes:true,resetButton:true}); const result=h("div",{class:"project-checks","aria-live":"polite"},para("La validation mesure des styles calculés dans la preview, pas une égalité de texte.","muted small")); async function verify(){const files=lab.getFiles(); const run=await lab.run(project.tests,[]); const problems=checkLab(project,files,run); if(!problems.length){record.done=true;record.draft=files;commit();result.replaceChildren(h("p",{class:"success"},"✓ Projet validé. Les critères visuels principaux sont respectés."));}else result.replaceChildren(h("p",{class:"muted"},"Encore quelques points à corriger :"),h("ul",{},problems.map(x=>h("li",{},x))));} return h("div",{class:"page"},h("p",{class:"crumbs"},link("/css","CSS")," / ",link("/css/projets","Projets")," / ",project.title),pageTitle(project.title,project.description),h("div",{class:"callout"},h("strong",{},"Cahier des charges"),para(project.brief)),lab.node,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:verify},"Valider le projet")),result,h("div",{class:"callout"},h("strong",{},"À retenir"),para(project.retain)));}

// ═══════════ Accueil ═══════════
const HERO_CODE = `const prenom = "toi";
console.log("Bonjour " + prenom + " !");

for (let i = 1; i <= 3; i++) {
  console.log("Tour " + i);
}`;

function renderJavascriptHome() {
  const module = currentModule();
  const stats = moduleStats(module.id);
  const last = state.lastLesson ? getLesson(state.lastLesson) : null;
  const next = nextLesson();
  const toReview = reviewExercises().slice(0, 4);
  const overall = Math.round(availableModules().reduce((n,m)=>n+moduleStats(m.id).percent,0)/Math.max(1,availableModules().length));
  const solved = EXERCISES.filter(ex=>getRecord(ex.id).success).length;
  const doneLessons = LESSONS.filter(l=>state.lessonsDone[l.id]).length;
  const resumeHref = last ? "/cours/"+last.id : "/cours/"+LESSONS[0].id;
  const resumeText = last ? "Reprendre : "+last.title : "Commencer par les variables";
  return h("div", { class: "page dashboard-page js-dashboard" },
    h("section", { class: "dashboard-hero" },
      h("div", { class: "dashboard-copy" },h("span",{class:"eyebrow"},"PARCOURS JAVASCRIPT"),h("h1", {}, "Continue à construire tes réflexes JavaScript."),para("Cours courts, pratique immédiate, révisions ciblées et projets : tout ton apprentissage au même endroit.", "lead"),h("div",{class:"toolbar"},link(resumeHref,resumeText,"btn primary big"),link("/cours","Voir tous les cours","btn big"))),
      h("div",{class:"progress-orbit"},h("div",{class:"progress-ring",style:"--progress:"+overall},h("strong",{},overall+"%"),h("span",{},"global")),h("div",{class:"orbit-stats"},metric(doneLessons,"cours terminés"),metric(solved,"exercices réussis")))),
    h("section",{class:"dashboard-grid"},
      h("article",{class:"resume-card"},h("span",{class:"eyebrow"},"À REPRENDRE"),h("div",{class:"resume-icon"},"▶"),h("h2",{},last?last.title:"Les variables"),para("Niveau "+module.number+" · "+module.title+" · "+stats.percent+" %","muted"),next?para("Prochaine étape conseillée : "+next.title+".","muted small"):null,link(resumeHref,"Continuer →","btn primary")),
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"APERÇU"),h("div",{class:"stat-grid"},metric(stats.points,"points"),metric(solved,"exercices"),metric(doneLessons,"cours"),metric(toReview.length,"à revoir"))),
    ),
    h("section", { class: "block review-zone" },h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"RÉVISION INTELLIGENTE"),h("h2", {}, "À refaire")),link("/revision","Tout voir →","btn small")),
      toReview.length === 0 ? empty("Rien à refaire pour l’instant. Les exercices ratés ou réussis avec de l’aide apparaîtront ici.") : h("div", { class: "review-grid" }, toReview.map((ex) => h("article", { class: "review-card" },h("span",{class:"review-alert"},"↻"),h("div",{class:"row-main"},h("strong",{},ex.notion),h("p",{class:"muted small"},TYPE_LABELS[ex.type]+" · "+getLesson(ex.lesson).title)),link("/exercice/"+ex.id,"Refaire","btn small"))))),
    h("section", { class: "block roadmap-section" },h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ROADMAP"),h("h2", {}, "Les 6 niveaux JavaScript")),h("span",{class:"muted small"},"Niveau actuel · "+module.number)),
      h("ol", { class: "learning-roadmap" }, MODULES.map((m) => {
        const st = m.available ? moduleStats(m.id) : null; const stateClass=!m.available?"locked":st.percent===100?"done":m.id===module.id?"current":"available";
        return h("li", { class: "roadmap-node "+stateClass },h("div",{class:"roadmap-marker"},stateClass==="done"?"✓":stateClass==="locked"?"🔒":String(m.number)),h("article",{class:"roadmap-card"},h("div",{class:"roadmap-card-top"},h("span",{class:"eyebrow"},"NIVEAU "+m.number),h("span",{class:"badge "+(stateClass==="locked"?"soon":"")},stateClass==="done"?"TERMINÉ":stateClass==="current"?"EN COURS":stateClass==="locked"?"VERROUILLÉ":"DISPONIBLE")),h("h3",{},m.title),para(m.description,"muted"),m.available?h("div",{class:"roadmap-progress"},bar(st.percent),h("small",{},st.percent+" % · "+st.solved+" exercices réussis")):para("Termine les niveaux précédents pour poursuivre ton parcours.","muted small"),m.available?link("/cours","Ouvrir →","btn small"):null));
      })))
  );
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

// ═══════════ Parcours HTML ═══════════
function htmlState(){
  if(!state.html) state.html={lessonsDone:{},lastLesson:null,projects:{},exercises:{},notions:{},evaluations:{}};
  if(!state.html.lessonsDone) state.html.lessonsDone={};
  if(!state.html.projects) state.html.projects={};
  if(!state.html.exercises) state.html.exercises={};
  if(!state.html.notions) state.html.notions={};
  if(!state.html.evaluations) state.html.evaluations={};
  return state.html;
}
function htmlLevelStats(level){
  const lessons=htmlLessonsForLevel(level), lessonDone=lessons.filter(l=>htmlState().lessonsDone[l.id]).length;
  const exercises=htmlExercisesForLevel(level), exerciseDone=exercises.filter(e=>getRecord(e.id).success).length;
  const evaluation=htmlState().evaluations[level]||{}, evaluationDone=(evaluation.best||0)>=80?1:0;
  const project=htmlProjectForLevel(level), projectDone=project&&htmlProjectState(project.id).done?1:0;
  const total=lessons.length+exercises.length+(htmlEvaluationForLevel(level).length?1:0)+(project?1:0);
  const completed=lessonDone+exerciseDone+evaluationDone+projectDone;
  return{lessons,done:lessonDone,coursePercent:lessons.length?Math.round(lessonDone/lessons.length*100):0,percent:total?Math.round(completed/total*100):0,completed,total};
}
function htmlExerciseStatsForLevel(level){const exercises=htmlExercisesForLevel(level),solved=exercises.filter(e=>getRecord(e.id).success).length,review=exercises.filter(e=>getRecord(e.id).review).length;return{exercises,solved,review,percent:exercises.length?Math.round(solved/exercises.length*100):0};}
function htmlProgress(){const totals=HTML_LEVELS.map(l=>htmlLevelStats(l.number));const completed=totals.reduce((n,x)=>n+x.completed,0),total=totals.reduce((n,x)=>n+x.total,0);return total?Math.round(completed/total*100):0;}
function htmlProjectState(id){const st=htmlState();if(!st.projects[id])st.projects[id]={done:false,draft:null};return st.projects[id];}

function renderHtmlHome(){
  const percent=htmlProgress(),st=htmlState(),last=HTML_LESSONS.find(l=>l.id===st.lastLesson);
  const currentLevel=last?last.level:((HTML_LEVELS.find(level=>htmlLevelStats(level.number).percent<100)||HTML_LEVELS[HTML_LEVELS.length-1]||{number:1}).number);
  const current=HTML_LEVELS.find(level=>level.number===currentLevel)||HTML_LEVELS[0];
  const totalSolved=HTML_EXERCISES.filter(ex=>getRecord(ex.id).success).length,totalProjects=HTML_PROJECTS.filter(project=>htmlProjectState(project.id).done).length;
  return h("div",{class:"page dashboard-page html-dashboard"},h("p",{class:"crumbs"},link("/","Parcours")," / HTML"),
    h("section",{class:"dashboard-hero"},h("div",{class:"dashboard-copy"},h("span",{class:"eyebrow"},"PARCOURS HTML"),h("h1",{},"Structure le Web avant de le styliser."),para("Écris du vrai HTML, observe immédiatement le rendu et le DOM, puis valide la structure et l'accessibilité sans comparaison textuelle stricte.","lead"),h("div",{class:"toolbar"},link(last?"/html/cours/"+last.id:"/html/niveau/1",last?"Reprendre : "+last.title:"Commencer le Niveau 1","btn primary big"),link("/html/exercices","Pratiquer","btn big"))),
      h("div",{class:"progress-orbit"},h("div",{class:"progress-ring",style:"--progress:"+percent},h("strong",{},percent+"%"),h("span",{},"parcours")),h("div",{class:"orbit-stats"},metric(totalSolved,"exercices réussis"),metric(totalProjects,"projets terminés")))),
    h("section",{class:"dashboard-grid"},h("article",{class:"resume-card"},h("span",{class:"eyebrow"},"NIVEAU "+current.number),h("h2",{},current.title),para(current.description,"muted"),link("/html/niveau/"+current.number,"Ouvrir le niveau →","btn primary")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE GLOBALE"),h("h2",{},totalSolved+" / "+HTML_EXERCISES.length),para("exercices HTML réussis","muted"),bar(HTML_EXERCISES.length?Math.round(totalSolved/HTML_EXERCISES.length*100):0))),
    h("section",{class:"block roadmap-section"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ROADMAP HTML"),h("h2",{},"Construis tes compétences niveau par niveau"))),h("ol",{class:"learning-roadmap"},HTML_LEVELS.map(level=>{const stats=htmlLevelStats(level.number),pr=htmlExerciseStatsForLevel(level.number),stateClass=stats.percent===100?"done":level.number===currentLevel?"current":"available";return h("li",{class:"roadmap-node "+stateClass},h("div",{class:"roadmap-marker"},stateClass==="done"?"✓":String(level.number)),h("article",{class:"roadmap-card"},h("div",{class:"roadmap-card-top"},h("span",{class:"eyebrow"},"NIVEAU "+level.number),h("span",{class:"badge"},stateClass==="done"?"TERMINÉ":stateClass==="current"?"EN COURS":"DISPONIBLE")),h("h3",{},level.title),para(level.description,"muted"),para(stats.lessons.length+" leçons · "+pr.exercises.length+" exercices · 1 projet · 1 évaluation","muted small"),h("div",{class:"roadmap-progress"},bar(stats.percent),h("small",{},stats.percent+" % du niveau")),link("/html/niveau/"+level.number,stateClass==="done"?"Revoir →":"Continuer →","btn small")));}))),
    h("div",{class:"callout"},h("strong",{},"Parcours HTML complet · 5 niveaux"),para("Le Niveau 5 finalise HTML avec métadonnées, SEO, intégration CSS/JavaScript, performance, validation et bonnes pratiques professionnelles, toujours avec ateliers live et validation DOM."))
  );
}

function renderHtmlLevel(levelNumber){
  const level=HTML_LEVELS.find(x=>x.number===Number(levelNumber));if(!level)return renderNotFound();
  const lessons=htmlLessonsForLevel(level.number),stats=htmlLevelStats(level.number),practice=htmlExerciseStatsForLevel(level.number),evaluation=htmlEvaluationForLevel(level.number),project=htmlProjectForLevel(level.number);
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/html","HTML")," / Niveau "+level.number),pageTitle("Niveau "+level.number+" · "+level.title,level.description),
    h("section",{class:"dashboard-grid react-level-overview"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"COURS"),h("h2",{},stats.coursePercent+" %"),para(stats.done+" / "+stats.lessons.length+" leçons terminées","muted"),bar(stats.coursePercent)),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE"),h("h2",{},practice.percent+" %"),para(practice.solved+" / "+practice.exercises.length+" exercices réussis"+(practice.review?" · "+practice.review+" à revoir":""),"muted"),bar(practice.percent))),
    project?h("div",{class:"callout"},h("strong",{},"Projet final · "+project.title),para(project.description),link("/html/projet/"+project.id,"Ouvrir le projet","btn small")):null,
    evaluation.length?h("div",{class:"callout evaluation-callout"},h("strong",{},"Évaluation de fin de niveau"),para(evaluation.length+" questions pour vérifier structure, attributs, sémantique et accessibilité."),link("/html/evaluation/"+level.number,"Passer l'évaluation","btn primary small")):null,
    h("ol",{class:"rows lessons"},lessons.map((lesson,index)=>{const exs=htmlExercisesForLesson(lesson.id),solved=exs.filter(ex=>getRecord(ex.id).success).length;return h("li",{class:"row"},h("span",{class:"num"},index+1),h("div",{class:"row-main"},link("/html/cours/"+lesson.id,lesson.title,"row-title"),para(lesson.objective,"muted small"),para(solved+" / "+exs.length+" exercices réussis","muted small")),h("span",{class:"status "+(htmlState().lessonsDone[lesson.id]?"ok":"todo")},htmlState().lessonsDone[lesson.id]?"✓ Terminé":"○ À faire"));}))
  );
}

function renderHtmlLesson(id){
  const l=HTML_LESSONS.find(x=>x.id===id);if(!l)return renderNotFound();const st=htmlState();st.lastLesson=id;commit();
  const lessons=htmlLessonsForLevel(l.level),idx=lessons.indexOf(l),next=lessons[idx+1],exs=htmlExercisesForLesson(l.id),firstTodo=exs.find(ex=>!getRecord(ex.id).success)||exs[0],project=htmlProjectForLevel(l.level);
  const practice=h("section",{class:"block"},h("h2",{},"À toi de pratiquer"),h("ul",{class:"rows compact"},exs.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/html/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.type)+" · "+ex.notion,"row-title")),statusBadge(exerciseStatus(ex))))),firstTodo?link("/html/exercice/"+firstTodo.id,"Commencer les exercices →","btn primary"):null);
  const nextLink=next?link("/html/cours/"+next.id,"Leçon suivante →","btn"):project?link("/html/projet/"+project.id,"Projet final →","btn"):link("/html","Retour au parcours","btn");
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/html","HTML")," / ",link("/html/niveau/"+l.level,"Niveau "+l.level)," / ",l.title),pageTitle(l.title,l.objective),
    h("article",{class:"sheet"},section(1,"Comprendre",...l.explanation.map(x=>para(x))),section(2,"Observer",codeBlock(l.code,true),h("ul",{},l.details.map(x=>h("li",{html:rich(x)})))),section(3,"Erreurs fréquentes",h("ul",{},l.mistakes.map(x=>h("li",{},x)))),l.shortcut?section(4,"Astuce VS Code / Emmet",h("div",{class:"callout"},h("strong",{},l.shortcut.win+" · "+l.shortcut.mac),para(l.shortcut.text))):null),
    renderHtmlStudio(l.studio),practice,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:()=>{htmlState().lessonsDone[l.id]=true;commit();router();}},htmlState().lessonsDone[l.id]?"✓ Leçon terminée":"Marquer comme terminée"),nextLink));
}

function renderHtmlExerciseList(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/html","HTML")," / Exercices"),pageTitle("Exercices HTML",HTML_EXERCISES.length+" activités : compréhension, correction, structure DOM et accessibilité."),HTML_LESSONS.map(l=>h("section",{class:"block exercise-group"},h("h2",{},link("/html/cours/"+l.id,l.title)),h("ul",{class:"rows compact"},htmlExercisesForLesson(l.id).map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/html/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.type)+" · "+ex.notion,"row-title")),h("span",{class:"badge d"+ex.difficulty},DIFFICULTY_LABELS[ex.difficulty]),statusBadge(exerciseStatus(ex))))))));}
function renderHtmlExercisePage(id){const ex=HTML_EXERCISES.find(e=>e.id===id);if(!ex)return renderNotFound();const lesson=HTML_LESSONS.find(l=>l.id===ex.lesson),siblings=htmlExercisesForLesson(ex.lesson),idx=siblings.indexOf(ex),next=siblings[idx+1],finish=h("div",{});return h("div",{class:"page"},h("p",{class:"crumbs"},link("/html","HTML")," / ",link("/html/cours/"+lesson.id,lesson.title)," / Exercice"),pageTitle(ex.notion,ex.question||ex.statement),renderExercise(ex,{onFinish:()=>finish.replaceChildren(next?link("/html/exercice/"+next.id,"Exercice suivant →","btn primary big"):link("/html/cours/"+lesson.id,"Retour au cours","btn primary big"))}),finish);}

function renderHtmlRevision(){
  const all=HTML_EXERCISES,st=htmlState(),priority=all.filter(ex=>getRecord(ex.id).review).sort((a,b)=>(getRecord(b.id).fails||0)-(getRecord(a.id).fails||0)),incomplete=all.filter(ex=>!getRecord(ex.id).success&&!getRecord(ex.id).review),fragile=Object.entries(st.notions||{}).filter(([,x])=>(x.ko||0)>0).sort((a,b)=>(b[1].ko||0)-(a[1].ko||0));
  const rows=HTML_LEVELS.map(level=>{const exs=htmlExercisesForLevel(level.number),todo=exs.filter(ex=>!getRecord(ex.id).success&&!getRecord(ex.id).review),review=exs.filter(ex=>getRecord(ex.id).review),ev=(st.evaluations&&st.evaluations[level.number])||{},best=ev.best||0,project=htmlProjectForLevel(level.number),projectDone=project?htmlProjectState(project.id).done:false;return{level,todo,review,best,project,projectDone};});
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/html","HTML")," / Révision"),pageTitle("Révision HTML","Tout ce qui mérite d'être consolidé est regroupé ici : exercices, notions fragiles, évaluation et projet."),
    h("section",{class:"dashboard-grid"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},priority.length),para("exercices marqués à revoir","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"À PRATIQUER"),h("h2",{},priority.length+incomplete.length),para("activités non maîtrisées","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"NOTIONS FRAGILES"),h("h2",{},fragile.length),para("notions avec erreurs","muted"))),
    h("section",{class:"block"},h("h2",{},"À revoir en premier"),priority.length?h("ul",{class:"rows compact"},priority.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/html/exercice/"+ex.id,ex.notion,"row-title"),para((getRecord(ex.id).fails||0)+" erreur(s)","muted small")),statusBadge(exerciseStatus(ex))))):empty("Aucun exercice marqué à revoir.")),
    h("section",{class:"block"},h("h2",{},"Notions fragiles"),fragile.length?h("ul",{class:"rows compact"},fragile.map(([name,x])=>{const target=all.find(ex=>ex.notion===name&&!getRecord(ex.id).success)||all.find(ex=>ex.notion===name);return h("li",{class:"row"},h("div",{class:"row-main"},h("strong",{},name),para((x.ok||0)+" réussite(s) · "+(x.ko||0)+" erreur(s)","muted small")),target?link("/html/exercice/"+target.id,"Réviser","btn small"):null);})):empty("Aucune notion fragile détectée.")),
    h("section",{class:"block"},h("h2",{},"Évaluation et projet"),h("div",{class:"project-roadmap"},rows.map(row=>h("article",{class:"path-card project-card"},h("span",{class:"badge"},"Niveau "+row.level.number),h("h3",{},row.level.title),para("Évaluation : "+row.best+" % · objectif 80 %","muted small"),para("Projet : "+(row.projectDone?"terminé":"à faire / à valider"),"muted small"),h("div",{class:"toolbar"},link("/html/evaluation/"+row.level.number,"Passer l'évaluation","btn small"),row.project?link("/html/projet/"+row.project.id,row.projectDone?"Revoir le projet":"Ouvrir le projet","btn small primary"):null))))),
    h("section",{class:"block"},h("h2",{},"Tout ce qu'il reste à pratiquer"),rows.map(row=>{const list=[...row.review,...row.todo];return h("div",{class:"exercise-group"},h("h3",{},"Niveau "+row.level.number+" · "+row.level.title),list.length?h("ul",{class:"rows compact"},list.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/html/exercice/"+ex.id,ex.notion,"row-title"),para(TYPE_LABELS[ex.type]||ex.type,"muted small")),statusBadge(exerciseStatus(ex))))):empty("Tous les exercices de ce niveau sont maîtrisés."));}))
  );
}

function renderHtmlEvaluation(level){
  const questions=htmlEvaluationForLevel(level);if(!questions.length)return renderNotFound();const st=htmlState(),scoreText=h("p",{class:"muted"}),scoreBar=h("div",{}),result=h("div",{});let finished=0,success=0;
  function update(ok){finished++;if(ok)success++;const percent=Math.round(success/questions.length*100);scoreText.textContent=finished+" / "+questions.length+" questions terminées · "+percent+" %";scoreBar.replaceChildren(bar(Math.round(finished/questions.length*100)));if(finished===questions.length){if(!st.evaluations[level])st.evaluations[level]={best:0};st.evaluations[level].best=Math.max(st.evaluations[level].best||0,percent);commit();result.className="feedback "+(percent>=80?"ok":"ko");result.replaceChildren(h("strong",{},percent>=80?"Évaluation validée !":"À consolider."),para("Score : "+percent+" %. "+(percent>=80?"Les objectifs essentiels sont maîtrisés.":"Utilise l'onglet Révision puis retente l'évaluation.")));}}
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/html/niveau/"+level,"Niveau "+level)," / Évaluation"),pageTitle("Évaluation HTML · Niveau "+level,"Validation des fondamentaux : structure, attributs, sémantique et accessibilité."),h("section",{class:"block evaluation-status"},scoreText,scoreBar,result),h("div",{class:"evaluation-list"},questions.map((q,index)=>h("section",{class:"block"},h("span",{class:"eyebrow"},"QUESTION "+(index+1)+" / "+questions.length),renderExercise(q,{quick:true,onFinish:update})))));
}

function renderHtmlProjects(){
  return h("div",{class:"page"},
    h("p",{class:"crumbs"},link("/html","HTML")," / Projets"),
    pageTitle("Projets HTML","Choisis librement le projet du niveau disponible. La page de sélection existe dès le départ pour éviter la navigation figée rencontrée sur d'autres parcours."),
    h("div",{class:"project-roadmap"},HTML_PROJECTS.map(project=>{
      const rec=htmlProjectState(project.id);
      return h("article",{class:"path-card project-card"},
        h("div",{class:"project-meta"},
          h("span",{class:"badge"},"Niveau "+project.level),
          h("span",{class:"status "+(rec.done?"ok":"todo")},rec.done?"✓ Terminé":"Disponible")
        ),
        h("h2",{},project.title),
        para(project.description),
        link("/html/projet/"+project.id,rec.done?"Revoir le projet":"Ouvrir le projet","btn primary")
      );
    }))
  );
}

function renderHtmlProject(id){
  const project=HTML_PROJECTS.find(p=>p.id===id);if(!project)return renderNotFound();const record=htmlProjectState(id),lab=renderLab({files:(record.draft||project.files).map(f=>({...f})),previewHeight:340,tips:true,live:true,previewModes:true,resetButton:true}),result=h("div",{class:"project-checks","aria-live":"polite"},para("La validation inspecte le DOM rendu : plusieurs textes et structures équivalentes peuvent être acceptés.","muted small"));
  let saveTimer=null; lab.node.addEventListener("input",()=>{clearTimeout(saveTimer);saveTimer=setTimeout(()=>{record.draft=lab.getFiles();commit();},350);});
  async function verify(){const files=lab.getFiles();const run=await lab.run(project.tests,[]);const problems=checkLab(project,files,run);record.draft=files;if(!problems.length){record.done=true;commit();result.replaceChildren(h("p",{class:"success"},"✓ Projet validé. La structure essentielle et les attributs demandés sont présents."));}else{commit();result.replaceChildren(h("p",{class:"muted"},"Encore quelques points à corriger :"),h("ul",{},problems.map(x=>h("li",{},x))));}}
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/html","HTML")," / ",link("/html/projets","Projets")," / ",project.title),pageTitle(project.title,project.description),h("div",{class:"callout"},h("strong",{},"Cahier des charges"),para(project.brief)),lab.node,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:verify},"Valider le projet")),result,h("div",{class:"callout"},h("strong",{},"À retenir"),para(project.retain)));
}


// ═══════════ Parcours TypeScript ═══════════
function typeScriptState(){
  if(!state.typescript) state.typescript={lessonsDone:{},lastLesson:null,projects:{},exercises:{},notions:{},evaluations:{}};
  if(!state.typescript.lessonsDone)state.typescript.lessonsDone={}; if(!state.typescript.projects)state.typescript.projects={}; if(!state.typescript.exercises)state.typescript.exercises={}; if(!state.typescript.notions)state.typescript.notions={}; if(!state.typescript.evaluations)state.typescript.evaluations={}; return state.typescript;
}
function typeScriptProjectState(id){const st=typeScriptState();if(!st.projects[id])st.projects[id]={done:false,draft:null};return st.projects[id];}
function typeScriptLevelStats(level){const lessons=typeScriptLessonsForLevel(level),ld=lessons.filter(l=>typeScriptState().lessonsDone[l.id]).length,exs=typeScriptExercisesForLevel(level),ed=exs.filter(e=>getRecord(e.id).success).length,ev=(typeScriptState().evaluations[level]||{}).best||0,project=typeScriptProjectForLevel(level),pd=project&&typeScriptProjectState(project.id).done?1:0,total=lessons.length+exs.length+(typeScriptEvaluationForLevel(level).length?1:0)+(project?1:0),completed=ld+ed+(ev>=80?1:0)+pd;return{lessons,done:ld,coursePercent:lessons.length?Math.round(ld/lessons.length*100):0,percent:total?Math.round(completed/total*100):0,completed,total};}
function typeScriptExerciseStatsForLevel(level){const exercises=typeScriptExercisesForLevel(level),solved=exercises.filter(e=>getRecord(e.id).success).length,review=exercises.filter(e=>getRecord(e.id).review).length;return{exercises,solved,review,percent:exercises.length?Math.round(solved/exercises.length*100):0};}
function typeScriptProgress(){const rows=TYPESCRIPT_LEVELS.map(l=>typeScriptLevelStats(l.number)),done=rows.reduce((n,x)=>n+x.completed,0),total=rows.reduce((n,x)=>n+x.total,0);return total?Math.round(done/total*100):0;}

function renderTypeScriptHome(){
  const percent=typeScriptProgress(),st=typeScriptState(),last=TYPESCRIPT_LESSONS.find(l=>l.id===st.lastLesson),currentLevel=last?last.level:((TYPESCRIPT_LEVELS.find(level=>typeScriptLevelStats(level.number).percent<100)||TYPESCRIPT_LEVELS[TYPESCRIPT_LEVELS.length-1]||{number:1}).number),practiceSolved=TYPESCRIPT_EXERCISES.filter(e=>getRecord(e.id).success).length,doneProjects=TYPESCRIPT_PROJECTS.filter(p=>typeScriptProjectState(p.id).done).length;
  return h("div",{class:"page dashboard-page typescript-dashboard"},h("p",{class:"crumbs"},link("/","Parcours")," / TypeScript"),
    h("section",{class:"dashboard-hero"},h("div",{class:"dashboard-copy"},h("span",{class:"eyebrow"},"PARCOURS TYPESCRIPT"),h("h1",{},"Ajoute des types à ton JavaScript — et comprends vraiment les erreurs."),para("Compare JavaScript et TypeScript, lis de vrais diagnostics du compilateur, observe le JavaScript produit et corrige le code avant l'exécution.","lead"),h("div",{class:"callout prerequisite-callout"},h("strong",{},"Prérequis recommandé : JavaScript"),para("Variables, fonctions, objets et tableaux doivent déjà être familiers. Le parcours reste accessible, mais TypeScript est enseigné comme une couche construite sur JavaScript.","muted small")),h("div",{class:"toolbar"},link(last?"/typescript/cours/"+last.id:"/typescript/niveau/"+currentLevel,last?"Reprendre : "+last.title:"Commencer le Niveau "+currentLevel,"btn primary big"),link("/typescript/exercices","Pratiquer","btn big"))),
      h("div",{class:"progress-orbit"},h("div",{class:"progress-ring",style:"--progress:"+percent},h("strong",{},percent+"%"),h("span",{},"parcours")),h("div",{class:"orbit-stats"},metric(practiceSolved,"exercices réussis"),metric(doneProjects,"projets terminés")))),
    h("section",{class:"block roadmap-section"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ROADMAP TYPESCRIPT"),h("h2",{},TYPESCRIPT_LEVELS.length+" niveaux disponibles"))),h("ol",{class:"learning-roadmap"},TYPESCRIPT_LEVELS.map(level=>{const stats=typeScriptLevelStats(level.number);return h("li",{class:"roadmap-node "+(stats.percent===100?"done":level.number===currentLevel?"current":"")},h("div",{class:"roadmap-marker"},stats.percent===100?"✓":String(level.number)),h("article",{class:"roadmap-card"},h("div",{class:"roadmap-card-top"},h("span",{class:"eyebrow"},"NIVEAU "+level.number),h("span",{class:"badge"},stats.percent===100?"TERMINÉ":"DISPONIBLE")),h("h3",{},level.title),para(level.description,"muted"),para(typeScriptLessonsForLevel(level.number).length+" leçons · "+typeScriptExercisesForLevel(level.number).length+" exercices · "+typeScriptEvaluationForLevel(level.number).length+" questions · "+(typeScriptProjectForLevel(level.number)?1:0)+" projet","muted small"),h("div",{class:"roadmap-progress"},bar(stats.percent),h("small",{},stats.percent+" % du niveau")),link("/typescript/niveau/"+level.number,"Ouvrir le niveau →","btn small")));}))),
    h("div",{class:"callout"},h("strong",{},"Parcours TypeScript complet"),para("Les 5 niveaux sont disponibles : des premiers diagnostics jusqu'à l'architecture TypeScript professionnelle, avec exercices, évaluations et projets à chaque étape.")));
}
function renderTypeScriptLevel(levelNumber){const level=TYPESCRIPT_LEVELS.find(x=>x.number===Number(levelNumber));if(!level)return renderNotFound();const lessons=typeScriptLessonsForLevel(level.number),stats=typeScriptLevelStats(level.number),practice=typeScriptExerciseStatsForLevel(level.number),project=typeScriptProjectForLevel(level.number),evaluation=typeScriptEvaluationForLevel(level.number);return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript","TypeScript")," / Niveau "+level.number),pageTitle("Niveau "+level.number+" · "+level.title,level.description),h("section",{class:"dashboard-grid react-level-overview"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"COURS"),h("h2",{},stats.coursePercent+" %"),para(stats.done+" / "+lessons.length+" leçons terminées","muted"),bar(stats.coursePercent)),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE"),h("h2",{},practice.percent+" %"),para(practice.solved+" / "+practice.exercises.length+" exercices réussis"+(practice.review?" · "+practice.review+" à revoir":""),"muted"),bar(practice.percent))),h("div",{class:"callout"},h("strong",{},"Compilateur TypeScript réel · terminal contrôlé"),para("Les diagnostics et le JavaScript compilé proviennent du compilateur local embarqué. Les commandes npm/tsc du terminal sont simulées pour rester sûres.")),project?h("div",{class:"callout"},h("strong",{},"Projet final · "+project.title),para(project.description),link("/typescript/projet/"+project.id,"Ouvrir le projet","btn small")):null,evaluation.length?h("div",{class:"callout evaluation-callout"},h("strong",{},"Évaluation de fin de niveau"),para(evaluation.length+" questions pour vérifier compréhension des types, diagnostics, inférence et compilation."),link("/typescript/evaluation/"+level.number,"Passer l'évaluation","btn primary small")):null,h("ol",{class:"rows lessons"},lessons.map((lesson,index)=>{const exs=typeScriptExercisesForLesson(lesson.id),solved=exs.filter(ex=>getRecord(ex.id).success).length;return h("li",{class:"row"},h("span",{class:"num"},index+1),h("div",{class:"row-main"},link("/typescript/cours/"+lesson.id,lesson.title,"row-title"),para(lesson.objective,"muted small"),para(solved+" / "+exs.length+" exercices réussis","muted small")),h("span",{class:"status "+(typeScriptState().lessonsDone[lesson.id]?"ok":"todo")},typeScriptState().lessonsDone[lesson.id]?"✓ Terminé":"○ À faire"));})));}
function renderTypeScriptLesson(id){const l=TYPESCRIPT_LESSONS.find(x=>x.id===id);if(!l)return renderNotFound();const st=typeScriptState();st.lastLesson=id;commit();const lessons=typeScriptLessonsForLevel(l.level),idx=lessons.indexOf(l),next=lessons[idx+1],exs=typeScriptExercisesForLesson(l.id),firstTodo=exs.find(ex=>!getRecord(ex.id).success)||exs[0],project=typeScriptProjectForLevel(l.level);const practice=h("section",{class:"block"},h("h2",{},"À toi de pratiquer"),h("ul",{class:"rows compact"},exs.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/typescript/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.label||ex.type)+" · "+ex.notion,"row-title")),statusBadge(exerciseStatus(ex))))),firstTodo?link("/typescript/exercice/"+firstTodo.id,"Commencer les exercices →","btn primary"):null);const nextLink=next?link("/typescript/cours/"+next.id,"Leçon suivante →","btn"):project?link("/typescript/projet/"+project.id,"Projet final →","btn"):link("/typescript","Retour au parcours","btn");return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript","TypeScript")," / ",link("/typescript/niveau/"+l.level,"Niveau "+l.level)," / ",l.title),pageTitle(l.title,l.objective),h("article",{class:"sheet"},section(1,"Comprendre",...l.explanations.map(x=>para(x))),section(2,"Comparer et observer",codeBlock(l.code,true),h("ul",{},l.details.map(x=>h("li",{html:rich(x)})))),section(3,"Erreurs fréquentes",h("ul",{},l.mistakes.map(x=>h("li",{},x)))),section(4,"Réflexe TypeScript",h("div",{class:"callout"},para(l.shortcut)))),renderTypeScriptStudio(l.studio),practice,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:()=>{typeScriptState().lessonsDone[l.id]=true;commit();router();}},typeScriptState().lessonsDone[l.id]?"✓ Leçon terminée":"Marquer comme terminée"),nextLink));}
function renderTypeScriptExerciseList(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript","TypeScript")," / Exercices"),pageTitle("Exercices TypeScript",TYPESCRIPT_EXERCISES.length+" activités : diagnostics, inférence, correction de types et petits programmes compilables."),TYPESCRIPT_LESSONS.map(l=>h("section",{class:"block exercise-group"},h("h2",{},link("/typescript/cours/"+l.id,l.title)),h("ul",{class:"rows compact"},typeScriptExercisesForLesson(l.id).map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/typescript/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.label||ex.type)+" · "+ex.notion,"row-title")),h("span",{class:"badge d"+ex.difficulty},DIFFICULTY_LABELS[ex.difficulty]),statusBadge(exerciseStatus(ex))))))));}
function renderTypeScriptExercisePage(id){const ex=TYPESCRIPT_EXERCISES.find(e=>e.id===id);if(!ex)return renderNotFound();const lesson=TYPESCRIPT_LESSONS.find(l=>l.id===ex.lesson),siblings=typeScriptExercisesForLesson(ex.lesson),idx=siblings.indexOf(ex),next=siblings[idx+1],finish=h("div",{});return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript","TypeScript")," / ",link("/typescript/cours/"+lesson.id,lesson.title)," / Exercice"),pageTitle(ex.notion,ex.question||ex.statement),renderExercise(ex,{onFinish:()=>finish.replaceChildren(next?link("/typescript/exercice/"+next.id,"Exercice suivant →","btn primary big"):link("/typescript/cours/"+lesson.id,"Retour au cours","btn primary big"))}),finish);}
function renderTypeScriptRevision(){
  const all=TYPESCRIPT_EXERCISES,st=typeScriptState(),priority=all.filter(ex=>getRecord(ex.id).review).sort((a,b)=>(getRecord(b.id).fails||0)-(getRecord(a.id).fails||0)),incomplete=all.filter(ex=>!getRecord(ex.id).success&&!getRecord(ex.id).review),fragile=Object.entries(st.notions||{}).filter(([,x])=>(x.ko||0)>0).sort((a,b)=>(b[1].ko||0)-(a[1].ko||0));
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript","TypeScript")," / Révision"),pageTitle("Révision TypeScript","Diagnostics ratés, notions fragiles, évaluations, projets et exercices non maîtrisés des niveaux disponibles sont regroupés ici."),
    h("section",{class:"dashboard-grid"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},priority.length),para("exercices marqués à revoir","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"À PRATIQUER"),h("h2",{},priority.length+incomplete.length),para("activités non maîtrisées","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"NOTIONS FRAGILES"),h("h2",{},fragile.length),para("notions avec erreurs","muted"))),
    h("section",{class:"block"},h("h2",{},"À revoir en premier"),priority.length?h("ul",{class:"rows compact"},priority.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/typescript/exercice/"+ex.id,ex.notion,"row-title"),para("Niveau "+ex.level+" · "+(getRecord(ex.id).fails||0)+" erreur(s)","muted small")),statusBadge(exerciseStatus(ex))))):empty("Aucun exercice marqué à revoir.")),
    h("section",{class:"block"},h("h2",{},"Notions fragiles"),fragile.length?h("ul",{class:"rows compact"},fragile.map(([name,x])=>{const target=all.find(ex=>ex.notion===name&&!getRecord(ex.id).success)||all.find(ex=>ex.notion===name);return h("li",{class:"row"},h("div",{class:"row-main"},h("strong",{},name),para((x.ok||0)+" réussite(s) · "+(x.ko||0)+" erreur(s)","muted small")),target?link("/typescript/exercice/"+target.id,"Réviser","btn small"):null);})):empty("Aucune notion fragile détectée.")),
    h("section",{class:"block"},h("h2",{},"Évaluations et projets"),h("div",{class:"project-roadmap"},TYPESCRIPT_LEVELS.map(level=>{const ev=(st.evaluations&&st.evaluations[level.number])||{},project=typeScriptProjectForLevel(level.number),projectDone=project?typeScriptProjectState(project.id).done:false;return h("article",{class:"path-card project-card"},h("span",{class:"badge"},"Niveau "+level.number),h("h3",{},level.title),para("Évaluation : "+(ev.best||0)+" % · objectif 80 %","muted small"),para("Projet : "+(projectDone?"terminé":"à faire / à valider"),"muted small"),h("div",{class:"toolbar"},link("/typescript/evaluation/"+level.number,"Passer l'évaluation","btn small"),project?link("/typescript/projet/"+project.id,projectDone?"Revoir le projet":"Ouvrir le projet","btn small primary"):null));}))),
    h("section",{class:"block"},h("h2",{},"Tout ce qu'il reste à pratiquer"),[...priority,...incomplete].length?h("div",{},TYPESCRIPT_LEVELS.map(level=>{const rows=[...priority,...incomplete].filter(ex=>ex.level===level.number);return rows.length?h("div",{class:"exercise-group"},h("h3",{},"Niveau "+level.number+" · "+level.title),h("ul",{class:"rows compact"},rows.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/typescript/exercice/"+ex.id,ex.notion,"row-title"),para(TYPE_LABELS[ex.type]||ex.label||ex.type,"muted small")),statusBadge(exerciseStatus(ex)))))):null;})):empty("Tous les exercices des niveaux disponibles sont maîtrisés.")));
}
function renderTypeScriptEvaluation(level){const questions=typeScriptEvaluationForLevel(level);if(!questions.length)return renderNotFound();const st=typeScriptState(),scoreText=h("p",{class:"muted"}),scoreBar=h("div",{}),result=h("div",{});let finished=0,success=0;function update(ok){finished++;if(ok)success++;const percent=Math.round(success/questions.length*100);scoreText.textContent=finished+" / "+questions.length+" questions terminées · "+percent+" %";scoreBar.replaceChildren(bar(Math.round(finished/questions.length*100)));if(finished===questions.length){if(!st.evaluations[level])st.evaluations[level]={best:0};st.evaluations[level].best=Math.max(st.evaluations[level].best||0,percent);commit();result.className="feedback "+(percent>=80?"ok":"ko");result.replaceChildren(h("strong",{},percent>=80?"Évaluation validée !":"À consolider."),para("Score : "+percent+" %. "+(percent>=80?"Les fondamentaux TypeScript sont maîtrisés.":"Utilise Révision puis retente l'évaluation.")));}}return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript/niveau/"+level,"Niveau "+level)," / Évaluation"),pageTitle("Évaluation TypeScript · Niveau "+level,(TYPESCRIPT_LEVELS.find(x=>x.number===Number(level))||{}).description||"Évaluation du niveau TypeScript."),h("section",{class:"block evaluation-status"},scoreText,scoreBar,result),h("div",{class:"evaluation-list"},questions.map((q,index)=>h("section",{class:"block"},h("span",{class:"eyebrow"},"QUESTION "+(index+1)+" / "+questions.length),renderExercise(q,{quick:true,onFinish:update})))));}
function renderTypeScriptProjects(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript","TypeScript")," / Projets"),pageTitle("Projets TypeScript","Choisis le projet disponible. Cette page de sélection est présente dès le Niveau 1."),h("div",{class:"project-roadmap"},TYPESCRIPT_PROJECTS.map(project=>{const rec=typeScriptProjectState(project.id);return h("article",{class:"path-card project-card"},h("div",{class:"project-meta"},h("span",{class:"badge"},"Niveau "+project.level),h("span",{class:"status "+(rec.done?"ok":"todo")},rec.done?"✓ Terminé":"Disponible")),h("h2",{},project.title),para(project.description),link("/typescript/projet/"+project.id,rec.done?"Revoir le projet":"Ouvrir le projet","btn primary"));})));}
function renderTypeScriptProject(id){const project=TYPESCRIPT_PROJECTS.find(p=>p.id===id);if(!project)return renderNotFound();const record=typeScriptProjectState(id),wb=renderTypeScriptWorkbench({code:record.draft||project.code,terminal:true}),result=h("div",{class:"project-checks","aria-live":"polite"},para("Validation : compilation réelle + structure TypeScript minimale. Les noms/textes libres restent libres.","muted small"));let saveTimer=null;wb.editor.addEventListener("input",()=>{clearTimeout(saveTimer);saveTimer=setTimeout(()=>{record.draft=wb.getCode();commit();},350);});async function verify(){const code=wb.getCode(),analysis=wb.analyze(),problems=analysis.diagnostics.map(d=>"TS"+d.code+" · ligne "+d.line+" : "+d.message);if(!problems.length)problems.push(...(project.validate(code,analysis)||[]));record.draft=code;if(!problems.length){record.done=true;commit();result.replaceChildren(h("p",{class:"success"},"✓ Projet validé : zéro diagnostic et contrats essentiels présents."));}else{commit();result.replaceChildren(h("p",{class:"muted"},"Encore quelques points à corriger :"),h("ul",{},problems.map(x=>h("li",{},x))));}}return h("div",{class:"page"},h("p",{class:"crumbs"},link("/typescript","TypeScript")," / ",link("/typescript/projets","Projets")," / ",project.title),pageTitle(project.title,project.description),h("div",{class:"callout"},h("strong",{},"Cahier des charges"),para(project.brief)),wb.node,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:verify},"Valider le projet")),result,h("div",{class:"callout"},h("strong",{},"À retenir"),para(project.retain)));}


// ═══════════ Parcours Node.js ═══════════
function nodeState(){
  if(!state.node)state.node={lessonsDone:{},lastLesson:null,projects:{},exercises:{},notions:{},evaluations:{}};
  if(!state.node.lessonsDone)state.node.lessonsDone={}; if(!state.node.projects)state.node.projects={}; if(!state.node.exercises)state.node.exercises={}; if(!state.node.notions)state.node.notions={}; if(!state.node.evaluations)state.node.evaluations={}; return state.node;
}
function nodeProjectState(id){const st=nodeState();if(!st.projects[id])st.projects[id]={done:false,draft:null};return st.projects[id];}
function nodeLevelStats(level){const lessons=nodeLessonsForLevel(level),ld=lessons.filter(l=>nodeState().lessonsDone[l.id]).length,exs=nodeExercisesForLevel(level),ed=exs.filter(e=>getRecord(e.id).success).length,ev=(nodeState().evaluations[level]||{}).best||0,project=nodeProjectForLevel(level),pd=project&&nodeProjectState(project.id).done?1:0,total=lessons.length+exs.length+(nodeEvaluationForLevel(level).length?1:0)+(project?1:0),completed=ld+ed+(ev>=80?1:0)+pd;return{lessons,done:ld,coursePercent:lessons.length?Math.round(ld/lessons.length*100):0,percent:total?Math.round(completed/total*100):0,completed,total};}
function nodeExerciseStatsForLevel(level){const exercises=nodeExercisesForLevel(level),solved=exercises.filter(e=>getRecord(e.id).success).length,review=exercises.filter(e=>getRecord(e.id).review).length;return{exercises,solved,review,percent:exercises.length?Math.round(solved/exercises.length*100):0};}
function nodeProgress(){const rows=NODE_LEVELS.map(l=>nodeLevelStats(l.number)),done=rows.reduce((n,x)=>n+x.completed,0),total=rows.reduce((n,x)=>n+x.total,0);return total?Math.round(done/total*100):0;}

function renderNodeHome(){
  const percent=nodeProgress(),st=nodeState(),last=NODE_LESSONS.find(l=>l.id===st.lastLesson),currentLevel=last?last.level:((NODE_LEVELS.find(level=>nodeLevelStats(level.number).percent<100)||NODE_LEVELS[NODE_LEVELS.length-1]||{number:1}).number),practiceSolved=NODE_EXERCISES.filter(e=>getRecord(e.id).success).length,doneProjects=NODE_PROJECTS.filter(p=>nodeProjectState(p.id).done).length;
  return h("div",{class:"page dashboard-page node-dashboard"},h("p",{class:"crumbs"},link("/","Parcours")," / Node.js"),
    h("section",{class:"dashboard-hero"},h("div",{class:"dashboard-copy"},h("span",{class:"eyebrow"},"PARCOURS NODE.JS"),h("h1",{},"Fais sortir JavaScript du navigateur."),para("Travaille avec un terminal, des fichiers virtuels, des scripts sandboxés et un client HTTP pour progresser du CLI jusqu’à un backend Node.js professionnel.","lead"),h("div",{class:"callout prerequisite-callout"},h("strong",{},"Prérequis recommandé : JavaScript"),para("Variables, fonctions, objets, tableaux, Promises et JSON doivent être familiers. Le parcours reste consultable librement.","muted small")),h("div",{class:"toolbar"},link(last?"/node/cours/"+last.id:"/node/niveau/"+currentLevel,last?"Reprendre : "+last.title:"Commencer le Niveau "+currentLevel,"btn primary big"),link("/node/exercices","Pratiquer","btn big"))),
      h("div",{class:"progress-orbit"},h("div",{class:"progress-ring",style:"--progress:"+percent},h("strong",{},percent+"%"),h("span",{},"parcours")),h("div",{class:"orbit-stats"},metric(practiceSolved,"exercices réussis"),metric(doneProjects,"projets terminés")))),
    h("section",{class:"block roadmap-section"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ROADMAP NODE.JS"),h("h2",{},NODE_LEVELS.length+" niveaux disponibles"))),h("ol",{class:"learning-roadmap"},NODE_LEVELS.map(level=>{const stats=nodeLevelStats(level.number);return h("li",{class:"roadmap-node "+(stats.percent===100?"done":level.number===currentLevel?"current":"")},h("div",{class:"roadmap-marker"},stats.percent===100?"✓":String(level.number)),h("article",{class:"roadmap-card"},h("div",{class:"roadmap-card-top"},h("span",{class:"eyebrow"},"NIVEAU "+level.number),h("span",{class:"badge"},stats.percent===100?"TERMINÉ":"DISPONIBLE")),h("h3",{},level.title),para(level.description,"muted"),para(nodeLessonsForLevel(level.number).length+" leçons · "+nodeExercisesForLevel(level.number).length+" exercices · "+nodeEvaluationForLevel(level.number).length+" questions · "+(nodeProjectForLevel(level.number)?1:0)+" projet","muted small"),h("div",{class:"roadmap-progress"},bar(stats.percent),h("small",{},stats.percent+" % du niveau")),link("/node/niveau/"+level.number,"Ouvrir le niveau →","btn small")));}))),
    h("div",{class:"callout"},h("strong",{},"Parcours Node.js complet"),para(NODE_LEVELS.length+" niveaux complets sont disponibles : runtime, fichiers, asynchronisme, HTTP, architecture backend et pratiques de production.")));
}
function renderNodeLevel(levelNumber){const level=NODE_LEVELS.find(x=>x.number===Number(levelNumber));if(!level)return renderNotFound();const lessons=nodeLessonsForLevel(level.number),stats=nodeLevelStats(level.number),practice=nodeExerciseStatsForLevel(level.number),project=nodeProjectForLevel(level.number),evaluation=nodeEvaluationForLevel(level.number);return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node","Node.js")," / Niveau "+level.number),pageTitle("Niveau "+level.number+" · "+level.title,level.description),h("section",{class:"dashboard-grid react-level-overview"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"COURS"),h("h2",{},stats.coursePercent+" %"),para(stats.done+" / "+lessons.length+" leçons terminées","muted"),bar(stats.coursePercent)),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE"),h("h2",{},practice.percent+" %"),para(practice.solved+" / "+practice.exercises.length+" exercices réussis"+(practice.review?" · "+practice.review+" à revoir":""),"muted"),bar(practice.percent))),h("div",{class:"callout"},h("strong",{},"Terminal + système de fichiers virtuel"),para("Les commandes Node/npm sont contrôlées et le terminal partage réellement les mêmes fichiers que l'éditeur. Les scripts JavaScript s'exécutent dans un Worker sandboxé.")),project?h("div",{class:"callout"},h("strong",{},"Projet final · "+project.title),para(project.description),link("/node/projet/"+project.id,"Ouvrir le projet","btn small")):null,evaluation.length?h("div",{class:"callout evaluation-callout"},h("strong",{},"Évaluation de fin de niveau"),para(evaluation.length+" questions pour valider les compétences essentielles de ce niveau Node.js."),link("/node/evaluation/"+level.number,"Passer l'évaluation","btn primary small")):null,h("ol",{class:"rows lessons"},lessons.map((lesson,index)=>{const exs=nodeExercisesForLesson(lesson.id),solved=exs.filter(ex=>getRecord(ex.id).success).length;return h("li",{class:"row"},h("span",{class:"num"},index+1),h("div",{class:"row-main"},link("/node/cours/"+lesson.id,lesson.title,"row-title"),para(lesson.objective,"muted small"),para(solved+" / "+exs.length+" exercices réussis","muted small")),h("span",{class:"status "+(nodeState().lessonsDone[lesson.id]?"ok":"todo")},nodeState().lessonsDone[lesson.id]?"✓ Terminé":"○ À faire"));})))}
function renderNodeLesson(id){const l=NODE_LESSONS.find(x=>x.id===id);if(!l)return renderNotFound();const st=nodeState();st.lastLesson=id;commit();const lessons=nodeLessonsForLevel(l.level),idx=lessons.indexOf(l),next=lessons[idx+1],exs=nodeExercisesForLesson(l.id),firstTodo=exs.find(ex=>!getRecord(ex.id).success)||exs[0],project=nodeProjectForLevel(l.level);const practice=h("section",{class:"block"},h("h2",{},"À toi de pratiquer"),h("ul",{class:"rows compact"},exs.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/node/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.label||ex.type)+" · "+ex.notion,"row-title")),statusBadge(exerciseStatus(ex))))),firstTodo?link("/node/exercice/"+firstTodo.id,"Commencer les exercices →","btn primary"):null);const nextLink=next?link("/node/cours/"+next.id,"Leçon suivante →","btn"):project?link("/node/projet/"+project.id,"Projet final →","btn"):link("/node","Retour au parcours","btn");return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node","Node.js")," / ",link("/node/niveau/"+l.level,"Niveau "+l.level)," / ",l.title),pageTitle(l.title,l.objective),h("article",{class:"sheet"},section(1,"Comprendre",...l.explanations.map(x=>para(x))),section(2,"Observer",codeBlock(l.code,true),h("ul",{},l.details.map(x=>h("li",{html:rich(x)})))),section(3,"Erreurs fréquentes",h("ul",{},l.mistakes.map(x=>h("li",{},x)))),section(4,"Réflexe Node.js",h("div",{class:"callout"},para(l.shortcut)))),renderNodeStudio(l.studio),practice,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:()=>{nodeState().lessonsDone[l.id]=true;commit();router();}},nodeState().lessonsDone[l.id]?"✓ Leçon terminée":"Marquer comme terminée"),nextLink));}
function renderNodeExerciseList(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node","Node.js")," / Exercices"),pageTitle("Exercices Node.js",NODE_EXERCISES.length+" activités : terminal, fichiers, asynchronisme, HTTP, API, architecture, tests, sécurité et production."),NODE_LESSONS.map(l=>h("section",{class:"block exercise-group"},h("h2",{},link("/node/cours/"+l.id,l.title)),h("ul",{class:"rows compact"},nodeExercisesForLesson(l.id).map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/node/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.label||ex.type)+" · "+ex.notion,"row-title")),h("span",{class:"badge d"+ex.difficulty},DIFFICULTY_LABELS[ex.difficulty]),statusBadge(exerciseStatus(ex))))))));}
function renderNodeExercisePage(id){const ex=NODE_EXERCISES.find(e=>e.id===id);if(!ex)return renderNotFound();const lesson=NODE_LESSONS.find(l=>l.id===ex.lesson),siblings=nodeExercisesForLesson(ex.lesson),idx=siblings.indexOf(ex),next=siblings[idx+1],finish=h("div",{});return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node","Node.js")," / ",link("/node/cours/"+lesson.id,lesson.title)," / Exercice"),pageTitle(ex.notion,ex.question||ex.statement),renderExercise(ex,{onFinish:()=>finish.replaceChildren(next?link("/node/exercice/"+next.id,"Exercice suivant →","btn primary big"):link("/node/cours/"+lesson.id,"Retour au cours","btn primary big"))}),finish);}
function renderNodeRevision(){const all=NODE_EXERCISES,st=nodeState(),priority=all.filter(ex=>getRecord(ex.id).review).sort((a,b)=>(getRecord(b.id).fails||0)-(getRecord(a.id).fails||0)),incomplete=all.filter(ex=>!getRecord(ex.id).success&&!getRecord(ex.id).review),fragile=Object.entries(st.notions||{}).filter(([,x])=>(x.ko||0)>0).sort((a,b)=>(b[1].ko||0)-(a[1].ko||0));return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node","Node.js")," / Révision"),pageTitle("Révision Node.js","Exercices ratés, notions fragiles, évaluation, projet et activités non maîtrisées sont regroupés ici."),h("section",{class:"dashboard-grid"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},priority.length),para("exercices à revoir","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"À PRATIQUER"),h("h2",{},priority.length+incomplete.length),para("activités non maîtrisées","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"NOTIONS FRAGILES"),h("h2",{},fragile.length),para("notions avec erreurs","muted"))),h("section",{class:"block"},h("h2",{},"À revoir en premier"),priority.length?h("ul",{class:"rows compact"},priority.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/node/exercice/"+ex.id,ex.notion,"row-title"),para((getRecord(ex.id).fails||0)+" erreur(s)","muted small")),statusBadge(exerciseStatus(ex))))):empty("Aucun exercice marqué à revoir.")),h("section",{class:"block"},h("h2",{},"Notions fragiles"),fragile.length?h("ul",{class:"rows compact"},fragile.map(([name,x])=>{const target=all.find(ex=>ex.notion===name&&!getRecord(ex.id).success)||all.find(ex=>ex.notion===name);return h("li",{class:"row"},h("div",{class:"row-main"},h("strong",{},name),para((x.ok||0)+" réussite(s) · "+(x.ko||0)+" erreur(s)","muted small")),target?link("/node/exercice/"+target.id,"Réviser","btn small"):null);})):empty("Aucune notion fragile détectée.")),h("section",{class:"block"},h("h2",{},"Évaluation et projet"),h("div",{class:"project-roadmap"},NODE_LEVELS.map(level=>{const ev=(st.evaluations&&st.evaluations[level.number])||{},project=nodeProjectForLevel(level.number),done=project?nodeProjectState(project.id).done:false;return h("article",{class:"path-card project-card"},h("span",{class:"badge"},"Niveau "+level.number),h("h3",{},level.title),para("Évaluation : "+(ev.best||0)+" % · objectif 80 %","muted small"),para("Projet : "+(done?"terminé":"à faire / à valider"),"muted small"),h("div",{class:"toolbar"},link("/node/evaluation/"+level.number,"Passer l'évaluation","btn small"),project?link("/node/projet/"+project.id,done?"Revoir le projet":"Ouvrir le projet","btn small primary"):null));}))),h("section",{class:"block"},h("h2",{},"Tout ce qu'il reste à pratiquer"),[...priority,...incomplete].length?h("div",{},NODE_LEVELS.map(level=>{const rows=[...priority,...incomplete].filter(ex=>ex.level===level.number);return rows.length?h("div",{class:"exercise-group"},h("h3",{},"Niveau "+level.number+" · "+level.title),h("ul",{class:"rows compact"},rows.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/node/exercice/"+ex.id,ex.notion,"row-title"),para(TYPE_LABELS[ex.type]||ex.label||ex.type,"muted small")),statusBadge(exerciseStatus(ex)))))):null;})):empty("Tous les exercices disponibles sont maîtrisés.")));}
function renderNodeEvaluation(level){const questions=nodeEvaluationForLevel(level);if(!questions.length)return renderNotFound();const st=nodeState(),scoreText=h("p",{class:"muted"}),scoreBar=h("div",{}),result=h("div",{});let finished=0,success=0;function update(ok){finished++;if(ok)success++;const percent=Math.round(success/questions.length*100);scoreText.textContent=finished+" / "+questions.length+" questions terminées · "+percent+" %";scoreBar.replaceChildren(bar(Math.round(finished/questions.length*100)));if(finished===questions.length){if(!st.evaluations[level])st.evaluations[level]={best:0};st.evaluations[level].best=Math.max(st.evaluations[level].best||0,percent);commit();result.className="feedback "+(percent>=80?"ok":"ko");result.replaceChildren(h("strong",{},percent>=80?"Évaluation validée !":"À consolider."),para("Score : "+percent+" %. "+(percent>=80?"Les bases Node.js du niveau sont maîtrisées.":"Utilise Révision puis retente l'évaluation.")));}}return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node/niveau/"+level,"Niveau "+level)," / Évaluation"),pageTitle("Évaluation Node.js · Niveau "+level,(NODE_LEVELS.find(x=>x.number===Number(level))||{}).description||"Évaluation Node.js."),h("section",{class:"block evaluation-status"},scoreText,scoreBar,result),h("div",{class:"evaluation-list"},questions.map((q,index)=>h("section",{class:"block"},h("span",{class:"eyebrow"},"QUESTION "+(index+1)+" / "+questions.length),renderExercise(q,{quick:true,onFinish:update})))));}
function renderNodeProjects(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node","Node.js")," / Projets"),pageTitle("Projets Node.js","Choisis le projet disponible. Cette page de sélection existe dès le premier niveau."),h("div",{class:"project-roadmap"},NODE_PROJECTS.map(project=>{const rec=nodeProjectState(project.id);return h("article",{class:"path-card project-card"},h("div",{class:"project-meta"},h("span",{class:"badge"},"Niveau "+project.level),h("span",{class:"status "+(rec.done?"ok":"todo")},rec.done?"✓ Terminé":"Disponible")),h("h2",{},project.title),para(project.description),link("/node/projet/"+project.id,rec.done?"Revoir le projet":"Ouvrir le projet","btn primary"));})));}
function renderNodeProject(id){const project=NODE_PROJECTS.find(p=>p.id===id);if(!project)return renderNotFound();const record=nodeProjectState(id),wb=renderNodeWorkbench({files:record.draft||project.files,guide:project.level===1?"Construis le CLI puis valide son comportement avec des arguments réels.":"Construis le projet dans le système de fichiers virtuel puis valide son comportement.",httpClient:project.httpClient===true,serverEntry:project.serverEntry}),result=h("div",{class:"project-checks","aria-live":"polite"},para(project.level>=3?"Validation comportementale : routes, status, headers et réponses HTTP sont testés via le client simulé.":"Validation comportementale : fichiers, script npm et sortie CLI. Les noms internes libres restent libres.","muted small"));let saveTimer=null;wb.editor.addEventListener("input",()=>{clearTimeout(saveTimer);saveTimer=setTimeout(()=>{record.draft=wb.getFiles();commit();},350);});async function verify(){if(project.validateCommand)await wb.executeCommand(project.validateCommand);const ctx={files:wb.getFiles(),readFile:n=>wb.readFile(n),fileExists:n=>wb.fileExists(n),dirExists:n=>wb.dirExists(n),history:wb.history,lastRun:wb.lastRun,sendHttpRequest:(method,url,body,headers)=>wb.sendHttpRequest(method,url,body,headers),packageJson(){const raw=wb.readFile("package.json");if(!raw)return null;try{return JSON.parse(raw);}catch(_){return null;}}};const problems=await project.validate(ctx)||[];record.draft=wb.getFiles();if(!problems.length){record.done=true;commit();result.replaceChildren(h("p",{class:"success"},project.level>=3?"✓ Projet validé : l’API répond correctement aux critères HTTP.":"✓ Projet validé : le CLI répond correctement aux critères."));}else{commit();result.replaceChildren(h("p",{class:"muted"},"Encore quelques points à corriger :"),h("ul",{},problems.map(x=>h("li",{},x))));}}return h("div",{class:"page"},h("p",{class:"crumbs"},link("/node","Node.js")," / ",link("/node/projets","Projets")," / ",project.title),pageTitle(project.title,project.description),h("div",{class:"callout"},h("strong",{},"Cahier des charges"),para(project.brief)),wb.node,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:verify},"Valider le projet")),result,h("div",{class:"callout"},h("strong",{},"À retenir"),para(project.retain)));}


// ═══════════ Parcours SQL ═══════════
function sqlState(){
  if(!state.sql) state.sql={lessonsDone:{},lastLesson:null,projects:{},exercises:{},notions:{},evaluations:{}};
  if(!state.sql.lessonsDone)state.sql.lessonsDone={}; if(!state.sql.projects)state.sql.projects={}; if(!state.sql.exercises)state.sql.exercises={}; if(!state.sql.notions)state.sql.notions={}; if(!state.sql.evaluations)state.sql.evaluations={}; return state.sql;
}
function sqlProjectState(id){const st=sqlState();if(!st.projects[id])st.projects[id]={done:false,draft:null};return st.projects[id];}
function sqlExerciseStatsForLevel(level){const exercises=sqlExercisesForLevel(level),solved=exercises.filter(e=>getRecord(e.id).success).length,review=exercises.filter(e=>getRecord(e.id).review).length;return{exercises,solved,review,percent:exercises.length?Math.round(solved/exercises.length*100):0};}
function sqlLevelStats(level){const lessons=sqlLessonsForLevel(level),ld=lessons.filter(l=>sqlState().lessonsDone[l.id]).length,exs=sqlExercisesForLevel(level),ed=exs.filter(e=>getRecord(e.id).success).length,ev=(sqlState().evaluations[level]||{}).best||0,project=sqlProjectForLevel(level),pd=project&&sqlProjectState(project.id).done?1:0,total=lessons.length+exs.length+(sqlEvaluationForLevel(level).length?1:0)+(project?1:0),completed=ld+ed+(ev>=80?1:0)+pd;return{lessons,done:ld,coursePercent:lessons.length?Math.round(ld/lessons.length*100):0,percent:total?Math.round(completed/total*100):0,completed,total};}
function sqlProgress(){const rows=SQL_LEVELS.map(l=>sqlLevelStats(l.number)),done=rows.reduce((n,x)=>n+x.completed,0),total=rows.reduce((n,x)=>n+x.total,0);return total?Math.round(done/total*100):0;}
function renderSqlHome(){const st=sqlState(),last=st.lastLesson?SQL_LESSONS.find(l=>l.id===st.lastLesson):null,currentLevel=last?last.level:((SQL_LEVELS.find(l=>sqlLevelStats(l.number).percent<100)||SQL_LEVELS[SQL_LEVELS.length-1]||{number:1}).number),practice=sqlExerciseStatsForLevel(currentLevel);return h("div",{class:"page"},
  h("section",{class:"dashboard-hero"},h("div",{class:"dashboard-copy"},h("span",{class:"eyebrow"},"PARCOURS SQL · SQLITE"),h("h1",{},"Apprends SQL en interrogeant de vraies données."),para("Observe les tables, écris une requête, exécute-la dans SQLite et lis réellement le résultat ou l'erreur.","lead"),h("div",{class:"callout prerequisite-callout"},h("strong",{},"Moteur pédagogique : SQLite"),para("Le SQL Studio utilise sql.js pour exécuter de vraies requêtes SQLite dans le navigateur. Les différences de dialecte sont signalées lorsqu'elles deviennent importantes.","muted small")),h("div",{class:"toolbar"},link(last?"/sql/cours/"+last.id:"/sql/niveau/"+currentLevel,last?"Reprendre : "+last.title:"Commencer le Niveau "+currentLevel,"btn primary big"),link("/sql/exercices","Pratiquer","btn big")))),
  h("section",{class:"dashboard-grid"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PROGRESSION"),h("h2",{},sqlProgress()+" %"),para(SQL_LEVELS.length+" niveaux complets","muted"),bar(sqlProgress())),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE"),h("h2",{},practice.percent+" %"),para(practice.solved+" / "+practice.exercises.length+" exercices réussis","muted"),bar(practice.percent))),
  h("section",{class:"block roadmap-section"},h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ROADMAP SQL"),h("h2",{},SQL_LEVELS.length+" niveaux complets"))),h("ol",{class:"learning-roadmap"},SQL_LEVELS.map(level=>{const stats=sqlLevelStats(level.number);return h("li",{class:"roadmap-node "+(stats.percent===100?"done":level.number===currentLevel?"current":"")},h("div",{class:"roadmap-marker"},stats.percent===100?"✓":String(level.number)),h("article",{class:"roadmap-card"},h("div",{class:"roadmap-card-top"},h("span",{class:"eyebrow"},"NIVEAU "+level.number),h("span",{class:"badge"},stats.percent===100?"TERMINÉ":"DISPONIBLE")),h("h3",{},level.title),para(level.description,"muted"),para(sqlLessonsForLevel(level.number).length+" leçons · "+sqlExercisesForLevel(level.number).length+" exercices · "+sqlEvaluationForLevel(level.number).length+" questions · "+(sqlProjectForLevel(level.number)?1:0)+" projet","muted small"),h("div",{class:"roadmap-progress"},bar(stats.percent),h("small",{},stats.percent+" % du niveau")),link("/sql/niveau/"+level.number,"Ouvrir le niveau →","btn small")));}))),
  h("div",{class:"callout"},h("strong",{},"Parcours SQL complet"),para("Les 5 niveaux sont disponibles : lecture, filtres et agrégations, relations et JOIN, CRUD et schémas, puis SQL professionnel, optimisation et sécurité.")))}
function renderSqlLevel(levelNumber){const level=SQL_LEVELS.find(x=>x.number===Number(levelNumber));if(!level)return renderNotFound();const lessons=sqlLessonsForLevel(level.number),stats=sqlLevelStats(level.number),practice=sqlExerciseStatsForLevel(level.number),project=sqlProjectForLevel(level.number),evaluation=sqlEvaluationForLevel(level.number);return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql","SQL")," / Niveau "+level.number),pageTitle("Niveau "+level.number+" · "+level.title,level.description),h("section",{class:"dashboard-grid react-level-overview"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"COURS"),h("h2",{},stats.coursePercent+" %"),para(stats.done+" / "+lessons.length+" leçons terminées","muted"),bar(stats.coursePercent)),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRATIQUE"),h("h2",{},practice.percent+" %"),para(practice.solved+" / "+practice.exercises.length+" exercices réussis"+(practice.review?" · "+practice.review+" à revoir":""),"muted"),bar(practice.percent))),h("div",{class:"callout"},h("strong",{},"SQL Studio · SQLite réel"),para("Les requêtes sont exécutées dans une base isolée. La validation observe le résultat généré, pas une égalité textuelle avec la correction.")),project?h("div",{class:"callout"},h("strong",{},"Projet final · "+project.title),para(project.description),link("/sql/projet/"+project.id,"Ouvrir le projet","btn small")):null,evaluation.length?h("div",{class:"callout evaluation-callout"},h("strong",{},"Évaluation de fin de niveau"),para(evaluation.length+" questions pour vérifier les fondamentaux SQL."),link("/sql/evaluation/"+level.number,"Passer l'évaluation","btn primary small")):null,h("ol",{class:"rows lessons"},lessons.map((lesson,index)=>{const exs=sqlExercisesForLesson(lesson.id),solved=exs.filter(ex=>getRecord(ex.id).success).length;return h("li",{class:"row"},h("span",{class:"num"},index+1),h("div",{class:"row-main"},link("/sql/cours/"+lesson.id,lesson.title,"row-title"),para(lesson.objective,"muted small"),para(solved+" / "+exs.length+" exercices réussis","muted small")),h("span",{class:"status "+(sqlState().lessonsDone[lesson.id]?"ok":"todo")},sqlState().lessonsDone[lesson.id]?"✓ Terminé":"○ À faire"));}))) }
function renderSqlLesson(id){const l=SQL_LESSONS.find(x=>x.id===id);if(!l)return renderNotFound();const st=sqlState();st.lastLesson=id;commit();const lessons=sqlLessonsForLevel(l.level),idx=lessons.indexOf(l),next=lessons[idx+1],exs=sqlExercisesForLesson(l.id),firstTodo=exs.find(ex=>!getRecord(ex.id).success)||exs[0],project=sqlProjectForLevel(l.level);const practice=h("section",{class:"block"},h("h2",{},"À toi de pratiquer"),h("ul",{class:"rows compact"},exs.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/sql/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.label||ex.type)+" · "+ex.notion,"row-title")),statusBadge(exerciseStatus(ex))))),firstTodo?link("/sql/exercice/"+firstTodo.id,"Commencer les exercices →","btn primary"):null);const nextLink=next?link("/sql/cours/"+next.id,"Leçon suivante →","btn"):project?link("/sql/projet/"+project.id,"Projet final →","btn"):link("/sql","Retour au parcours","btn");return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql","SQL")," / ",link("/sql/niveau/"+l.level,"Niveau "+l.level)," / ",l.title),pageTitle(l.title,l.objective),h("article",{class:"sheet"},section(1,"Comprendre",...l.explanations.map(x=>para(x))),section(2,"Observer",codeBlock(l.code,true),h("ul",{},l.details.map(x=>h("li",{html:rich(x)})))),section(3,"Erreurs fréquentes",h("ul",{},l.mistakes.map(x=>h("li",{},x)))),section(4,"Réflexe SQL",h("div",{class:"callout"},para(l.shortcut)))),renderSqlStudio(l.studio),practice,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:()=>{sqlState().lessonsDone[l.id]=true;commit();router();}},sqlState().lessonsDone[l.id]?"✓ Leçon terminée":"Marquer comme terminée"),nextLink));}
function renderSqlExerciseList(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql","SQL")," / Exercices"),pageTitle("Exercices SQL",SQL_EXERCISES.length+" activités : lecture de schéma, requêtes, filtres, agrégations, résultats et debugging SQLite."),SQL_LESSONS.map(l=>h("section",{class:"block exercise-group"},h("h2",{},link("/sql/cours/"+l.id,l.title)),h("ul",{class:"rows compact"},sqlExercisesForLesson(l.id).map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/sql/exercice/"+ex.id,(TYPE_LABELS[ex.type]||ex.label||ex.type)+" · "+ex.notion,"row-title")),h("span",{class:"badge d"+ex.difficulty},DIFFICULTY_LABELS[ex.difficulty]),statusBadge(exerciseStatus(ex))))))));}
function renderSqlExercisePage(id){const ex=SQL_EXERCISES.find(e=>e.id===id);if(!ex)return renderNotFound();const lesson=SQL_LESSONS.find(l=>l.id===ex.lesson),siblings=sqlExercisesForLesson(ex.lesson),idx=siblings.indexOf(ex),next=siblings[idx+1],finish=h("div",{});return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql","SQL")," / ",link("/sql/cours/"+lesson.id,lesson.title)," / Exercice"),pageTitle(ex.notion,ex.question||ex.statement),renderExercise(ex,{onFinish:()=>finish.replaceChildren(next?link("/sql/exercice/"+next.id,"Exercice suivant →","btn primary big"):link("/sql/cours/"+lesson.id,"Retour au cours","btn primary big"))}),finish);}
function renderSqlRevision(){const st=sqlState(),all=SQL_EXERCISES,priority=all.filter(ex=>getRecord(ex.id).review).sort((a,b)=>(getRecord(b.id).fails||0)-(getRecord(a.id).fails||0)),incomplete=all.filter(ex=>!getRecord(ex.id).success&&!getRecord(ex.id).review),fragile=Object.entries(st.notions||{}).filter(([,x])=>(x.ko||0)>0).sort((a,b)=>(b[1].ko||0)-(a[1].ko||0));return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql","SQL")," / Révision"),pageTitle("Révisions SQL","Tout ce qui reste à consolider, sans liste arbitrairement tronquée."),h("section",{class:"dashboard-grid"},h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"PRIORITÉ"),h("h2",{},priority.length),para("exercices à revoir","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"À PRATIQUER"),h("h2",{},priority.length+incomplete.length),para("activités non maîtrisées","muted")),h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"NOTIONS FRAGILES"),h("h2",{},fragile.length),para("notions avec erreurs","muted"))),h("section",{class:"block"},h("h2",{},"À revoir en premier"),priority.length?h("ul",{class:"rows compact"},priority.map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/sql/exercice/"+ex.id,ex.notion,"row-title"),para((getRecord(ex.id).fails||0)+" erreur(s)","muted small")),statusBadge(exerciseStatus(ex))))):empty("Aucun exercice marqué à revoir.")),h("section",{class:"block"},h("h2",{},"Évaluation et projet"),h("div",{class:"project-roadmap"},SQL_LEVELS.map(level=>{const ev=(st.evaluations&&st.evaluations[level.number])||{},project=sqlProjectForLevel(level.number),done=project?sqlProjectState(project.id).done:false;return h("article",{class:"path-card project-card"},h("span",{class:"badge"},"Niveau "+level.number),h("h3",{},level.title),para("Évaluation : "+(ev.best||0)+" % · objectif 80 %","muted small"),para("Projet : "+(done?"terminé":"à faire / à valider"),"muted small"),h("div",{class:"toolbar"},link("/sql/evaluation/"+level.number,"Passer l'évaluation","btn small"),project?link("/sql/projet/"+project.id,done?"Revoir le projet":"Ouvrir le projet","btn small primary"):null));}))),h("section",{class:"block"},h("h2",{},"Tout ce qu'il reste à pratiquer"),[...priority,...incomplete].length?h("ul",{class:"rows compact"},[...priority,...incomplete].map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/sql/exercice/"+ex.id,ex.notion,"row-title"),para(TYPE_LABELS[ex.type]||ex.label||ex.type,"muted small")),statusBadge(exerciseStatus(ex))))):empty("Tous les exercices disponibles sont maîtrisés.")));}
function renderSqlEvaluation(level){const questions=sqlEvaluationForLevel(level);if(!questions.length)return renderNotFound();const st=sqlState(),scoreText=h("p",{class:"muted"}),scoreBar=h("div",{}),result=h("div",{});let finished=0,success=0;function update(ok){finished++;if(ok)success++;const percent=Math.round(success/questions.length*100);scoreText.textContent=finished+" / "+questions.length+" questions terminées · "+percent+" %";scoreBar.replaceChildren(bar(Math.round(finished/questions.length*100)));if(finished===questions.length){if(!st.evaluations[level])st.evaluations[level]={best:0};st.evaluations[level].best=Math.max(st.evaluations[level].best||0,percent);commit();result.className="feedback "+(percent>=80?"ok":"ko");result.replaceChildren(h("strong",{},percent>=80?"Évaluation validée !":"À consolider."),para("Score : "+percent+" %. "+(percent>=80?"Les fondamentaux SQL sont maîtrisés.":"Utilise Révision puis retente l'évaluation.")));}}return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql/niveau/"+level,"Niveau "+level)," / Évaluation"),pageTitle("Évaluation SQL · Niveau "+level,(SQL_LEVELS.find(x=>x.number===Number(level))||{}).description||"Évaluation SQL."),h("section",{class:"block evaluation-status"},scoreText,scoreBar,result),h("div",{class:"evaluation-list"},questions.map((q,index)=>h("section",{class:"block"},h("span",{class:"eyebrow"},"QUESTION "+(index+1)+" / "+questions.length),renderExercise(q,{quick:true,onFinish:update})))));}
function renderSqlProjects(){return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql","SQL")," / Projets"),pageTitle("Projets SQL","Choisis le projet disponible."),h("div",{class:"project-roadmap"},SQL_PROJECTS.map(project=>{const rec=sqlProjectState(project.id);return h("article",{class:"path-card project-card"},h("div",{class:"project-meta"},h("span",{class:"badge"},"Niveau "+project.level),h("span",{class:"status "+(rec.done?"ok":"todo")},rec.done?"✓ Terminé":"Disponible")),h("h2",{},project.title),para(project.description),link("/sql/projet/"+project.id,rec.done?"Revoir le projet":"Ouvrir le projet","btn primary"));})));}
function renderSqlProject(id){const project=SQL_PROJECTS.find(p=>p.id===id);if(!project)return renderNotFound();const record=sqlProjectState(id),wb=renderSqlWorkbench({setup:project.setup,query:record.draft||project.query,guide:"Explore la base puis construis la requête finale demandée."}),result=h("div",{class:"project-checks","aria-live":"polite"},para("Validation par résultat SQLite, complétée par des critères structurels uniquement lorsque la notion l’exige : les variantes équivalentes restent acceptées.","muted small"));wb.editor.addEventListener("input",()=>{record.draft=wb.getQuery();commit();});async function verify(){const execution=await wb.run();if(!execution.ok){result.replaceChildren(h("p",{class:"error"},execution.error));return;}const problems=await project.validate({query:execution.query,result:execution.result,error:null})||[];record.draft=wb.getQuery();if(!problems.length){record.done=true;commit();result.replaceChildren(h("p",{class:"success"},"✓ Projet validé : le résultat SQL correspond au besoin métier."));}else{commit();result.replaceChildren(h("p",{class:"muted"},"Encore quelques points à corriger :"),h("ul",{},problems.map(x=>h("li",{},x))));}}return h("div",{class:"page"},h("p",{class:"crumbs"},link("/sql","SQL")," / ",link("/sql/projets","Projets")," / ",project.title),pageTitle(project.title,project.description),h("div",{class:"callout"},h("strong",{},"Cahier des charges"),para(project.brief)),wb.node,h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:verify},"Valider le projet")),result,h("div",{class:"callout"},h("strong",{},"À retenir"),para(project.retain)));}


function renderNotFound() {
  return h("div", { class: "page" }, pageTitle("Page introuvable", "Cette page n’existe pas."), link("/", "Retour à l’accueil", "btn primary"));
}

// ═══════════ Routeur ═══════════
const routes = [
  { re: /^\/$/, view: renderHub },
  { re: /^\/dashboard$/, view: renderGlobalDashboard },
  { re: /^\/javascript$/, view: renderJavascriptHome },
  { re: /^\/react$/, view: renderReactHome },
  { re: /^\/react\/niveau\/(\d+)$/, view: renderReactLevel },
  { re: /^\/react\/cours\/([\w-]+)$/, view: renderReactLesson },
  { re: /^\/react\/exercices$/, view: renderReactExerciseList },
  { re: /^\/react\/exercice\/([\w-]+)$/, view: renderReactExercisePage },
  { re: /^\/react\/revision$/, view: renderReactRevision },
  { re: /^\/react\/evaluation\/(\d+)$/, view: renderReactEvaluation },
  { re: /^\/react\/projets$/, view: renderReactProjects },
  { re: /^\/react\/projet\/([\w-]+)$/, view: renderReactProject },
  { re: /^\/css$/, view: renderCssHome },
  { re: /^\/css\/niveau\/(\d+)$/, view: renderCssLevel },
  { re: /^\/css\/cours\/([\w-]+)$/, view: renderCssLesson },
  { re: /^\/css\/exercices$/, view: renderCssExerciseList },
  { re: /^\/css\/exercice\/([\w-]+)$/, view: renderCssExercisePage },
  { re: /^\/css\/revision$/, view: renderCssRevision },
  { re: /^\/css\/evaluation\/(\d+)$/, view: renderCssEvaluation },
  { re: /^\/css\/projets$/, view: renderCssProjects },
  { re: /^\/css\/projet\/([\w-]+)$/, view: renderCssProject },
  { re: /^\/html$/, view: renderHtmlHome },
  { re: /^\/html\/niveau\/(\d+)$/, view: renderHtmlLevel },
  { re: /^\/html\/cours\/([\w-]+)$/, view: renderHtmlLesson },
  { re: /^\/html\/exercices$/, view: renderHtmlExerciseList },
  { re: /^\/html\/exercice\/([\w-]+)$/, view: renderHtmlExercisePage },
  { re: /^\/html\/revision$/, view: renderHtmlRevision },
  { re: /^\/html\/evaluation\/(\d+)$/, view: renderHtmlEvaluation },
  { re: /^\/html\/projets$/, view: renderHtmlProjects },
  { re: /^\/html\/projet\/([\w-]+)$/, view: renderHtmlProject },
  { re: /^\/typescript$/, view: renderTypeScriptHome },
  { re: /^\/typescript\/niveau\/(\d+)$/, view: renderTypeScriptLevel },
  { re: /^\/typescript\/cours\/([\w-]+)$/, view: renderTypeScriptLesson },
  { re: /^\/typescript\/exercices$/, view: renderTypeScriptExerciseList },
  { re: /^\/typescript\/exercice\/([\w-]+)$/, view: renderTypeScriptExercisePage },
  { re: /^\/typescript\/revision$/, view: renderTypeScriptRevision },
  { re: /^\/typescript\/evaluation\/(\d+)$/, view: renderTypeScriptEvaluation },
  { re: /^\/typescript\/projets$/, view: renderTypeScriptProjects },
  { re: /^\/typescript\/projet\/([\w-]+)$/, view: renderTypeScriptProject },
  { re: /^\/sql$/, view: renderSqlHome },
  { re: /^\/sql\/niveau\/(\d+)$/, view: renderSqlLevel },
  { re: /^\/sql\/cours\/([\w-]+)$/, view: renderSqlLesson },
  { re: /^\/sql\/exercices$/, view: renderSqlExerciseList },
  { re: /^\/sql\/exercice\/([\w-]+)$/, view: renderSqlExercisePage },
  { re: /^\/sql\/revision$/, view: renderSqlRevision },
  { re: /^\/sql\/evaluation\/(\d+)$/, view: renderSqlEvaluation },
  { re: /^\/sql\/projets$/, view: renderSqlProjects },
  { re: /^\/sql\/projet\/([\w-]+)$/, view: renderSqlProject },
  { re: /^\/node$/, view: renderNodeHome },
  { re: /^\/node\/niveau\/(\d+)$/, view: renderNodeLevel },
  { re: /^\/node\/cours\/([\w-]+)$/, view: renderNodeLesson },
  { re: /^\/node\/exercices$/, view: renderNodeExerciseList },
  { re: /^\/node\/exercice\/([\w-]+)$/, view: renderNodeExercisePage },
  { re: /^\/node\/revision$/, view: renderNodeRevision },
  { re: /^\/node\/evaluation\/(\d+)$/, view: renderNodeEvaluation },
  { re: /^\/node\/projets$/, view: renderNodeProjects },
  { re: /^\/node\/projet\/([\w-]+)$/, view: renderNodeProject },
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
  const activePathId=routeLearningPathId(path);
  if(activePathId && state.lastActiveLearningPath!==activePathId){ state.lastActiveLearningPath=activePathId; commit(); }
  let view = null;
  for (const route of routes) {
    const match = path.match(route.re);
    if (match) { view = route.view(...match.slice(1)); break; }
  }
  main.replaceChildren(view || renderNotFound());
  renderNav();
  closeMenu();
  window.scrollTo(0, 0);
  document.title = (main.querySelector("h1") ? main.querySelector("h1").textContent + " · " : "") + "Cahier Code";
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

const collapseButton = document.getElementById("sidebar-collapse");
const savedSidebar = localStorage.getItem("cahier-sidebar-compact") === "1";
document.body.classList.toggle("sidebar-compact", savedSidebar);
function syncCollapseButton(){
  const compact=document.body.classList.contains("sidebar-compact");
  collapseButton.innerHTML = compact ? "⇥ <span>Déployer</span>" : "⇤ <span>Réduire</span>";
  collapseButton.setAttribute("aria-label", compact ? "Déployer la barre latérale" : "Réduire la barre latérale");
}
collapseButton.addEventListener("click",()=>{
  document.body.classList.toggle("sidebar-compact");
  localStorage.setItem("cahier-sidebar-compact",document.body.classList.contains("sidebar-compact")?"1":"0");
  syncCollapseButton();
});
syncCollapseButton();

window.addEventListener("hashchange", router);
window.addEventListener("progress-changed", renderNav);

applyTheme();
router();
