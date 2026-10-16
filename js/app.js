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
  const icons = { home:"⌂", paths:"◇", book:"▤", exercise:"✓", review:"↻", project:"◈", progress:"◎", react:"⚛", js:"JS", back:"←" };
  return h("span", { class:"nav-icon", "aria-hidden":"true" }, icons[name] || "•");
}

function renderNav() {
  const nav = document.getElementById("nav");
  const path = location.hash.replace(/^#/, "") || "/";
  const inReact = path.startsWith("/react");
  document.body.dataset.path = path === "/" ? "hub" : inReact ? "react" : "javascript";
  const items = inReact ? [
    { href: "/", text: "Parcours", icon:"back", prefix: null },
    { href: "/react", text: "Vue d’ensemble", icon:"react", prefix: "/react" },
    { href: "/react/exercices", text: "Exercices", icon:"exercise", prefix: "/react/exercice" },
    { href: "/react/revision", text: "Révision", icon:"review", prefix: "/react/revision" },
    { href: "/react/projets", text: "Projets", icon:"project", prefix: "/react/proj" },
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
    const active = item.prefix === null ? path === "/" : (item.href === "/react" ? path === "/react" : path.startsWith(item.prefix));
    return h("a", { href: "#" + item.href, class: "nav-link", "aria-current": active ? "page" : null, title:item.text }, navIcon(item.icon), h("span",{class:"nav-label"},item.text));
  });
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
function renderHub() {
  const jsPercent = Math.round(availableModules().reduce((n,m)=>n+moduleStats(m.id).percent,0)/Math.max(1,availableModules().length));
  const reactPercent = reactProgress();
  const pathData = LEARNING_PATHS.map(path => ({...path, percent:path.id==="javascript"?jsPercent:reactPercent}));
  return h("div", { class:"page path-hub" },
    h("section",{class:"hub-hero"},
      h("div",{class:"hub-copy"},h("span",{class:"eyebrow"},"PLATEFORME D’APPRENTISSAGE"),h("h1",{},"Construis tes compétences. Une ligne de code à la fois."),para("Des parcours progressifs, des exercices pratiques et de vrais projets pour passer de la théorie au code.","lead"),h("div",{class:"hub-metrics"},metric(LEARNING_PATHS.length,"parcours"),metric(LESSONS.length + REACT_LESSONS.length,"cours"),metric(EXERCISES.length + REACT_EXERCISES.length,"exercices"))),
      h("div",{class:"terminal-card","aria-hidden":"true"},h("div",{class:"terminal-top"},h("span",{},"●"),h("span",{},"●"),h("span",{},"●"),h("small",{},"learning.js")),h("pre",{},'const skills = [\n  "JavaScript",\n  "React",\n  "Vite"\n];\n\nskills.forEach(learn);',h("span",{class:"terminal-cursor"},"▍")))),
    h("div",{class:"section-heading hub-heading"},h("div",{},h("span",{class:"eyebrow"},"TES PARCOURS"),h("h2",{},"Que veux-tu apprendre ?")),para("Chaque parcours garde sa propre progression.","muted")),
    h("div", { class:"path-grid" }, pathData.map((path) => {
      const isJs=path.id==="javascript";
      const current = path.percent>0;
      const totalLevels=isJs?MODULES.length:REACT_LEVELS.length;
      const courseCount=isJs?LESSONS.length:REACT_LESSONS.length;
      return h("article", { class:"path-card path-card--"+path.id },
        h("div",{class:"path-card-head"},h("span", {class:"path-mark", "aria-hidden":"true"}, path.mark),current?h("span",{class:"badge path-current"},"EN COURS"):h("span",{class:"badge notion"},"À DÉCOUVRIR")),
        h("div",{class:"path-visual","aria-hidden":"true"}, isJs?h("pre",{},"{ }   =>   []\n console.log()") : h("pre",{},"<App />\n ├─ <Header />\n └─ <Module />")),
        h("h2",{},path.title),para(path.subtitle,"path-subtitle"),para(path.description,"muted"),
        h("div",{class:"path-progress"},h("div",{class:"progress-label"},h("span",{},"Progression"),h("strong",{},path.percent+" %")),bar(path.percent)),
        h("div",{class:"path-facts"},h("span",{},totalLevels+" niveaux"),h("span",{},courseCount+" cours")),
        link(path.href, current ? "Continuer le parcours →" : "Commencer le parcours →", "btn primary path-cta"));
    })),
    h("section",{class:"future-paths"},h("span",{class:"eyebrow"},"BIENTÔT DISPONIBLE"),h("div",{class:"future-grid"},["TypeScript","Python","Node.js"].map((name)=>h("div",{class:"future-card"},h("span",{class:"future-icon"},"◇"),h("strong",{},name),h("span",{class:"badge soon"},"Bientôt")))))
  );
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
  const exercises=REACT_EXERCISES;
  const toReview=exercises.filter(ex=>getRecord(ex.id).review);
  const incomplete=exercises.filter(ex=>!getRecord(ex.id).success && !getRecord(ex.id).review);
  return h("div",{class:"page"},h("p",{class:"crumbs"},link("/react","React.js")," / Révision"),pageTitle("Révision React","Retrouve en priorité les exercices ratés ou réussis avec de l’aide."),
    h("section",{class:"block review-zone"},h("h2",{},"À revoir"),toReview.length?h("div",{class:"review-grid"},toReview.map(ex=>h("article",{class:"review-card"},h("span",{class:"review-alert"},"↻"),h("div",{class:"row-main"},h("strong",{},ex.notion),para((REACT_LESSONS.find(l=>l.id===ex.lesson)||{}).title||"React","muted small")),link("/react/exercice/"+ex.id,"Refaire","btn small")))):empty("Aucun exercice React à revoir pour le moment.")),
    h("section",{class:"block"},h("h2",{},"Continuer à pratiquer"),incomplete.length?h("ul",{class:"rows compact"},incomplete.slice(0,12).map(ex=>h("li",{class:"row"},h("div",{class:"row-main"},link("/react/exercice/"+ex.id,ex.notion,"row-title"),para(TYPE_LABELS[ex.type],"muted small")),statusBadge(exerciseStatus(ex))))):empty("Tous les exercices disponibles sont réussis.")));
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

function renderNotFound() {
  return h("div", { class: "page" }, pageTitle("Page introuvable", "Cette page n’existe pas."), link("/", "Retour à l’accueil", "btn primary"));
}

// ═══════════ Routeur ═══════════
const routes = [
  { re: /^\/$/, view: renderHub },
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
