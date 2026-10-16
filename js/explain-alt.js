// explain-alt.js — aide "Explique-moi autrement" commune à tous les parcours.
// Elle s'appuie uniquement sur le contenu déjà affiché et le dictionnaire d'aide contextuelle.

const EXPLAIN_ALT_LABELS = {
  html: "HTML", css: "CSS", javascript: "JavaScript", react: "React",
  typescript: "TypeScript", node: "Node.js", sql: "SQL"
};

const EXPLAIN_ALT_ANALOGIES = {
  html: {
    default: "Imagine une page comme un bâtiment : les balises sont les pièces et les éléments de structure. Leur ordre et leur imbrication indiquent où chaque contenu se trouve.",
    form: "Un formulaire ressemble à une fiche à remplir : chaque champ pose une question, son label indique quoi renseigner et le bouton envoie l'ensemble des réponses.",
    semantic: "Les balises sémantiques ressemblent aux panneaux d'un bâtiment : elles ne changent pas forcément son apparence, mais elles indiquent clairement le rôle de chaque zone.",
    attribute: "Une balise est l'objet, ses attributs sont ses réglages : ils ajoutent un nom, une destination, un comportement ou une information complémentaire."
  },
  css: {
    default: "Pense au CSS comme à une fiche de décoration : le sélecteur dit quel élément décorer, la propriété dit ce que tu modifies et la valeur indique comment.",
    flex: "Flexbox ressemble à une étagère intelligente : tu choisis comment les objets s'alignent, s'espacent et se répartissent sur un axe.",
    grid: "CSS Grid ressemble à un quadrillage : tu définis des lignes et des colonnes, puis tu places les éléments dans cette grille.",
    responsive: "Le responsive ressemble à un meuble modulable : la même structure s'adapte à l'espace disponible au lieu d'imposer une taille unique."
  },
  javascript: {
    default: "Imagine JavaScript comme une suite d'instructions données à un assistant : il reçoit des valeurs, prend des décisions, répète certaines actions et produit un résultat.",
    variable: "Une variable ressemble à une boîte étiquetée : son nom permet de retrouver la valeur stockée et, avec let, de la remplacer plus tard.",
    function: "Une fonction ressemble à une recette : tu lui donnes éventuellement des ingrédients (paramètres), elle suit des étapes puis peut rendre un résultat.",
    loop: "Une boucle ressemble à une chaîne de traitement : la même action est répétée pour plusieurs éléments jusqu'à ce que la condition d'arrêt soit atteinte.",
    async: "L'asynchrone ressemble à une commande au restaurant : tu lances la demande, tu continues autre chose, puis tu reprends quand le résultat est prêt.",
    dom: "Le DOM ressemble au plan interactif de la page : JavaScript peut y retrouver un élément puis lire ou modifier son contenu, ses classes ou ses attributs."
  },
  react: {
    default: "Imagine React comme un assemblage de briques d'interface : chaque composant reçoit des données et décrit ce qui doit apparaître à l'écran.",
    state: "Le state ressemble au tableau de bord interne d'un composant : quand une valeur change, React recalcule ce qui doit être affiché.",
    props: "Les props ressemblent à des paramètres envoyés à un composant : le parent fournit les données, le composant les utilise pour se rendre.",
    effect: "Un effet ressemble à une tâche déclenchée après l'affichage : synchroniser une donnée, lancer une requête ou écouter quelque chose d'extérieur au rendu."
  },
  typescript: {
    default: "TypeScript ressemble à un contrôleur qualité placé avant l'exécution : il vérifie que les données utilisées correspondent aux formes annoncées.",
    type: "Un type ressemble à un contrat : il décrit ce qu'une valeur est autorisée à contenir avant même que le programme s'exécute.",
    generic: "Un générique ressemble à un moule dont la matière reste à choisir : la structure est la même, mais le type précis est fourni au moment de l'utilisation.",
    interface: "Une interface ressemble à une fiche technique : elle décrit les propriétés et méthodes qu'un objet doit posséder."
  },
  node: {
    default: "Imagine Node.js comme JavaScript installé côté serveur : au lieu de manipuler directement une page, il peut lire des fichiers, recevoir des requêtes et produire des réponses.",
    http: "Un serveur HTTP ressemble à un guichet : il reçoit une demande, regarde son adresse et sa méthode, puis prépare une réponse avec un statut et des données.",
    file: "Le système de fichiers ressemble à une armoire : ton programme peut ouvrir, lire, créer ou modifier des fichiers en utilisant leur chemin.",
    module: "Un module ressemble à une boîte à outils : il expose certaines fonctions ou valeurs pour qu'un autre fichier puisse les importer et les utiliser.",
    async: "L'asynchrone côté Node ressemble à plusieurs dossiers en attente : le programme peut lancer une opération lente sans bloquer tout le reste pendant son attente."
  },
  sql: {
    default: "Imagine SQL comme une conversation très précise avec une base de données : tu indiques quelles données tu veux lire, filtrer, regrouper ou modifier.",
    select: "SELECT ressemble à une liste de courses : tu précises les colonnes dont tu as besoin au lieu de prendre toute la réserve.",
    join: "Un JOIN ressemble à deux listes que l'on rapproche grâce à un identifiant commun, comme relier une commande à la personne qui l'a passée.",
    group: "GROUP BY ressemble à trier des objets dans des paniers : chaque panier représente un groupe, puis les fonctions d'agrégation calculent quelque chose pour chaque panier.",
    transaction: "Une transaction ressemble à un brouillon sécurisé : plusieurs changements sont préparés ensemble, puis soit tous sont confirmés, soit tout est annulé.",
    index: "Un index ressemble à l'index d'un livre : il accélère certaines recherches, mais il faut aussi le maintenir lorsque les données changent."
  }
};

function explainAltRouteInfo() {
  const raw = (location.hash || "#/").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  let language = "javascript";
  let type = "other";
  if (["react", "css", "html", "typescript", "node", "sql"].includes(parts[0])) {
    language = parts[0];
    if (parts[1] === "cours") type = "lesson";
    else if (parts[1] === "exercice") type = "exercise";
  } else {
    if (parts[0] === "cours") type = "lesson";
    else if (parts[0] === "exercice") type = "exercise";
  }
  return { language, type, path: raw };
}

function explainAltClean(text, max) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!max || cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "));
  return (last > max * 0.55 ? cut.slice(0, last + 1) : cut.trimEnd() + "…");
}

function explainAltSourceText(page) {
  const paragraphs = Array.from(page.querySelectorAll("p"))
    .filter(p => !p.closest("[data-explain-alt-generated], [data-beginner-generated], .feedback, .code-help-popup"))
    .map(p => explainAltClean(p.textContent, 420))
    .filter(text => text.length >= 30);
  return paragraphs.slice(0, 2).join(" ");
}

function explainAltVocabulary(page, language, limit) {
  if (!page || typeof codeHelpEntry !== "function") return [];
  if (typeof enhanceCodeHelpTree === "function") enhanceCodeHelpTree(page);
  const out = [];
  const seen = new Set();
  page.querySelectorAll(".code-help-token[data-code-help]").forEach(token => {
    if (out.length >= (limit || 4)) return;
    const key = token.dataset.codeHelp;
    if (!key || seen.has(key)) return;
    const entry = codeHelpEntry(key, language);
    if (!entry) return;
    seen.add(key);
    out.push({ key, entry });
  });
  return out;
}

function explainAltConceptKey(language, title, vocab) {
  const hay = (title + " " + vocab.map(v => v.key + " " + (v.entry.title || "")).join(" ")).toLowerCase();
  const tests = {
    html: [["form", /form|input|label|button/], ["semantic", /sémanti|semantic|main|header|footer|article|section/], ["attribute", /attribut|href|src|class|id|aria/]],
    css: [["flex", /flex/], ["grid", /grid/], ["responsive", /responsive|media|clamp|viewport/]],
    javascript: [["variable", /variable|\blet\b|\bconst\b/], ["function", /fonction|function|return|param/], ["loop", /boucle|\bfor\b|while|foreach/], ["async", /async|await|promise|fetch/], ["dom", /dom|queryselector|addeventlistener|document/]],
    react: [["state", /state|usestate/], ["props", /props|propriété/], ["effect", /effect|useeffect/]],
    typescript: [["generic", /généri|generic|<t>|keyof/], ["interface", /interface/], ["type", /type|union|strict|unknown|never/]],
    node: [["http", /http|serveur|request|response|api/], ["file", /fichier|\bfs\b|readfile|writefile|path/], ["module", /module|import|export|esm|commonjs/], ["async", /async|await|promise|event loop/]],
    sql: [["join", /join|relation|clé étrang|foreign/], ["group", /group by|having|count|sum|avg|agrég/], ["transaction", /transaction|rollback|commit|begin/], ["index", /index|explain|optim/], ["select", /select|where|order by|limit/]]
  };
  const found = (tests[language] || []).find(([, re]) => re.test(hay));
  return found ? found[0] : "default";
}

function explainAltModel(page) {
  const info = explainAltRouteInfo();
  const language = info.language;
  const title = explainAltClean(page.querySelector("h1")?.textContent || "Cette notion", 140);
  const source = explainAltSourceText(page);
  const vocab = explainAltVocabulary(page, language, 5);
  const concept = vocab[0]?.entry?.title || vocab[0]?.key || title;
  const conceptKey = explainAltConceptKey(language, title, vocab);
  const analogy = EXPLAIN_ALT_ANALOGIES[language]?.[conceptKey] || EXPLAIN_ALT_ANALOGIES[language]?.default || "Imagine cette notion comme une étape précise dans une suite d'instructions : elle reçoit quelque chose, agit dessus et produit un effet observable.";
  return { info, language, title, source, vocab, concept, analogy };
}

function explainAltSimple(model) {
  const intro = model.source
    ? `En clair : ${model.source}`
    : `En clair : cette partie du cours t'apprend à utiliser « ${model.title} » sans avoir besoin de tout mémoriser d'un coup.`;
  const notions = model.vocab.slice(0, 3).map(v => v.entry.title || v.key);
  return h("div", { class: "explain-alt-body" },
    h("p", { class: "explain-alt-lead" }, intro),
    h("div", { class: "explain-alt-retain" },
      h("strong", {}, "À retenir maintenant"),
      h("p", {}, notions.length
        ? `Concentre-toi d'abord sur ${notions.join(", ")}. Comprends leur rôle avant d'essayer de retenir leur syntaxe exacte.`
        : "Cherche d'abord ce que cette notion reçoit, ce qu'elle fait et quel résultat elle produit.")),
    h("p", { class: "muted" }, "Tu peux revenir au cours original à tout moment : cette version ne le remplace pas."));
}

function explainAltAnalogy(model) {
  return h("div", { class: "explain-alt-body" },
    h("p", { class: "explain-alt-lead" }, model.analogy),
    h("div", { class: "explain-alt-bridge" },
      h("strong", {}, "Fais le lien avec le code"),
      h("p", {}, `Dans cette leçon, « ${model.concept} » représente la partie concrète de cette comparaison. Reviens ensuite au premier exemple du cours et repère exactement où elle intervient.`)));
}

function explainAltConcrete(model) {
  const examples = model.vocab.filter(v => v.entry.example).slice(0, 3);
  if (!examples.length) {
    return h("div", { class: "explain-alt-body" },
      h("p", { class: "explain-alt-lead" }, `Prends l'exemple principal de « ${model.title} » et change une seule valeur. Avant d'exécuter, prédis ce qui devrait changer.`),
      h("ol", { class: "explain-alt-steps" },
        h("li", {}, "Repère l'entrée ou la donnée de départ."),
        h("li", {}, "Modifie une seule chose."),
        h("li", {}, "Prédis le résultat."),
        h("li", {}, "Exécute et compare avec ta prédiction.")));
  }
  return h("div", { class: "explain-alt-body" },
    h("p", { class: "explain-alt-lead" }, "Voici des exemples courts provenant des notions déjà utilisées dans cette leçon."),
    h("div", { class: "explain-alt-examples" }, examples.map(item =>
      h("article", { class: "explain-alt-example" },
        h("strong", {}, item.entry.title || item.key),
        h("p", {}, item.entry.description || "Notion utilisée dans la leçon."),
        h("pre", { class: "code" }, item.entry.example)))));
}

function explainAltTechnical(model) {
  const vocab = model.vocab.slice(0, 5);
  return h("div", { class: "explain-alt-body" },
    h("p", { class: "explain-alt-lead" }, `Vue technique de « ${model.title} » (${EXPLAIN_ALT_LABELS[model.language] || model.language}).`),
    vocab.length
      ? h("dl", { class: "explain-alt-definitions" }, vocab.flatMap(item => [
          h("dt", {}, item.entry.title || item.key),
          h("dd", {}, item.entry.description || "Élément syntaxique utilisé dans cette leçon.")
        ]))
      : h("p", {}, model.source || "Relis la signature, les entrées, les sorties et les effets de la notion étudiée."),
    h("div", { class: "explain-alt-check" },
      h("strong", {}, "Pour vérifier que tu maîtrises"),
      h("p", {}, "Essaie de l'expliquer avec trois éléments : ce que la notion reçoit, la règle qu'elle applique, et le résultat ou l'effet qu'elle produit.")));
}

function explainAltRenderMode(panel, model, mode) {
  const content = panel.querySelector(".explain-alt-content");
  if (!content) return;
  content.replaceChildren();
  const builders = { simple: explainAltSimple, analogy: explainAltAnalogy, concrete: explainAltConcrete, technical: explainAltTechnical };
  content.append((builders[mode] || builders.simple)(model));
  panel.querySelectorAll("[data-explain-alt-mode]").forEach(button => {
    const active = button.dataset.explainAltMode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  panel.dataset.mode = mode;
  if (typeof state === "object" && state) {
    state.explainAltMode = mode;
    if (typeof commit === "function") commit();
  }
  if (typeof enhanceCodeHelpTree === "function") enhanceCodeHelpTree(content);
}

function explainAltPanel(page) {
  const model = explainAltModel(page);
  const preferred = (typeof state === "object" && state && state.explainAltMode) || "simple";
  const panel = h("section", { class: "explain-alt-panel", "data-explain-alt-generated": "1", "aria-label": "Explique-moi autrement" },
    h("div", { class: "explain-alt-head" },
      h("div", {}, h("span", { class: "explain-alt-kicker" }, "AIDE PÉDAGOGIQUE"), h("h2", {}, "Explique-moi autrement")),
      h("button", { class: "btn small ghost", type: "button", "aria-label": "Fermer Explique-moi autrement", onclick: () => panel.remove() }, "Fermer")),
    h("div", { class: "explain-alt-tabs", role: "tablist", "aria-label": "Choisir une autre façon d'expliquer" },
      [["simple", "Simple"], ["analogy", "Analogie"], ["concrete", "Exemple concret"], ["technical", "Technique"]].map(([key, label]) =>
        h("button", { type: "button", class: "explain-alt-tab", role: "tab", "data-explain-alt-mode": key, onclick: () => explainAltRenderMode(panel, model, key) }, label))),
    h("div", { class: "explain-alt-content", role: "tabpanel" })
  );
  queueMicrotask(() => explainAltRenderMode(panel, model, preferred));
  return panel;
}

function closeExplainAltPanels() {
  document.querySelectorAll("[data-explain-alt-generated='1']").forEach(node => node.remove());
}

function openExplainAlt(page) {
  if (!page) return;
  const existing = page.querySelector(".explain-alt-panel");
  if (existing) {
    existing.scrollIntoView({ behavior: "smooth", block: "nearest" });
    existing.querySelector(".explain-alt-tab.active")?.focus();
    return;
  }
  const panel = explainAltPanel(page);
  const head = page.querySelector(".page-head") || page.querySelector("h1")?.parentElement;
  if (head && head.parentNode) head.insertAdjacentElement("afterend", panel);
  else page.prepend(panel);
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function buildExplainAltButton(page) {
  const button = h("button", {
    type: "button",
    class: "btn small ghost explain-alt-trigger",
    "data-explain-alt-trigger": "1",
    title: "Voir cette notion expliquée d'une autre façon",
    onclick: () => openExplainAlt(page)
  }, "💡 Explique-moi autrement");
  return button;
}

function enhanceExplainAltPage() {
  const page = document.querySelector("#main .page");
  if (!page) return;
  const route = explainAltRouteInfo();
  if (!["lesson", "exercise"].includes(route.type)) {
    closeExplainAltPanels();
    document.querySelectorAll("[data-explain-alt-trigger='1']").forEach(n => n.remove());
    return;
  }
  if (page.querySelector("[data-explain-alt-trigger='1']")) return;
  const trigger = buildExplainAltButton(page);
  const head = page.querySelector(".page-head");
  const toolbar = head?.querySelector(".toolbar, .actions, .page-actions");
  if (toolbar) toolbar.append(trigger);
  else if (head) head.append(trigger);
  else page.prepend(trigger);
}

let explainAltTimer = null;
function scheduleExplainAltEnhancement() {
  clearTimeout(explainAltTimer);
  explainAltTimer = setTimeout(enhanceExplainAltPage, 25);
}

function startExplainAlt() {
  const main = document.getElementById("main");
  if (main && typeof MutationObserver !== "undefined") {
    new MutationObserver(scheduleExplainAltEnhancement).observe(main, { childList: true, subtree: false });
  }
  window.addEventListener("hashchange", () => {
    closeExplainAltPanels();
    scheduleExplainAltEnhancement();
  });
  scheduleExplainAltEnhancement();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startExplainAlt);
else startExplainAlt();
