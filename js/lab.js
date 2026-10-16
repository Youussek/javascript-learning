// lab.js — « l’atelier » : de vraies pages HTML + CSS + JavaScript, exécutées dans un aperçu.
//
// L’aperçu est une <iframe> « sandbox » : c’est une page web isolée du reste du site.
// allow-forms est nécessaire pour que l’événement submit existe ; l'envoi réel est toujours bloqué par pageCapture().
// Le code de la page ne peut donc rien casser ici. Elle nous envoie ce qu’elle affiche
// (console.log, erreurs…) avec postMessage, et on affiche tout dans la « console » de l’atelier.
//
// L’atelier lit les fichiers comme un vrai navigateur : <script src="script.js"> et
// <link rel="stylesheet" href="style.css"> sont remplacés par le contenu des fichiers correspondants.

// ─── Ce code s’exécute DANS la page de l’aperçu ───
function pageCapture(id, problems, tests, actions) {
  // On garde une référence à la fenêtre du site dès maintenant : si ton code déclare lui-même
  // une variable globale nommée « parent » (très courant !), elle masquerait window.parent.
  var host = window.parent;
  function send(type, data) {
    host.postMessage({ cahierjs: true, id: id, type: type, data: data }, "*");
  }
  // Protection contre les boucles infinies : guardLoops() ajoute un appel à __lp() dans la condition
  // de chaque boucle. Si une boucle tourne plus de 1,5 seconde sans s'arrêter, on lance une erreur.
  var loopCount = 0, loopStart = 0, loopLast = 0;
  window.__lp = function () {
    var now = Date.now();
    if (now - loopLast > 300) { loopStart = now; loopCount = 0; }
    loopLast = now;
    if (++loopCount > 2000 && now - loopStart > 1500) {
      loopLast = 0;
      throw new Error("Le code a tourné trop longtemps (plus de 2 secondes) : boucle infinie ?");
    }
  };
  ["log", "info", "warn", "error"].forEach(function (level) {
    console[level] = function () {
      send("log", { level: level, text: Array.prototype.map.call(arguments, showValue).join(" ") });
    };
  });
  // Les boîtes de dialogue sont bloquées dans l’aperçu : on les affiche dans la console.
  window.alert = function (message) { send("log", { level: "alert", text: "alert : " + showValue(message) }); };
  window.confirm = function (message) { send("log", { level: "alert", text: "confirm : " + showValue(message) + " (réponse automatique : OK)" }); return true; };
  window.prompt = function (message) { send("log", { level: "alert", text: "prompt : " + showValue(message) + " (réponse automatique : texte vide)" }); return ""; };
  window.addEventListener("error", function (event) {
    var text = event.error && event.error.name ? event.error.name + ": " + event.error.message : event.message;
    send("error", { text: text });
  });
  problems.forEach(function (text) { send("error", { text: text }); });
  // ─── Une « API » simulée : l'atelier n'a pas accès à Internet ───
  // fetch() est remplacé par une version qui répond comme un petit serveur, après un court délai.
  // Adresse de base : https://api.cahierjs.test
  var API_HOTE = "api.cahierjs.test";
  var VILLES = {
    paris: { ville: "Paris", temperature: 18, ciel: "nuageux", vent: 12 },
    lyon: { ville: "Lyon", temperature: 15, ciel: "pluie", vent: 20 },
    marseille: { ville: "Marseille", temperature: 24, ciel: "ensoleillé", vent: 30 },
    lille: { ville: "Lille", temperature: 11, ciel: "brouillard", vent: 8 }
  };
  var UTILISATEURS = [
    { id: 1, nom: "Léa", ville: "Paris" },
    { id: 2, nom: "Sam", ville: "Lyon" },
    { id: 3, nom: "Inès", ville: "Lille" }
  ];
  function reponseJson(donnees, statut) {
    return new Response(JSON.stringify(donnees), { status: statut || 200, headers: { "Content-Type": "application/json" } });
  }
  window.fetch = function (adresse, options) {
    return new Promise(function (resolve, reject) {
      var url;
      try { url = new URL(String(adresse), "https://" + API_HOTE + "/"); }
      catch (erreur) { reject(new TypeError("Failed to fetch")); return; }
      var methode = String((options && options.method) || "GET").toUpperCase();
      var delai = url.pathname === "/lent" ? 1200 : 250;
      setTimeout(function () {
        if (url.hostname !== API_HOTE) { reject(new TypeError("Failed to fetch")); return; }
        var chemin = url.pathname;
        var morceaux = chemin.split("/").filter(Boolean);
        if (methode === "GET" && chemin === "/utilisateurs") { resolve(reponseJson(UTILISATEURS)); return; }
        if (methode === "GET" && morceaux[0] === "utilisateurs" && morceaux.length === 2) {
          var trouve = UTILISATEURS.filter(function (u) { return String(u.id) === morceaux[1]; })[0];
          resolve(trouve ? reponseJson(trouve) : reponseJson({ erreur: "Utilisateur introuvable" }, 404));
          return;
        }
        if (methode === "GET" && chemin === "/meteo") {
          var ville = url.searchParams.get("ville");
          if (!ville) { resolve(reponseJson({ erreur: "Paramètre ville manquant" }, 400)); return; }
          var cle = ville.trim().toLowerCase();
          if (cle === "panne") { reject(new TypeError("Failed to fetch")); return; }
          resolve(VILLES[cle] ? reponseJson(VILLES[cle]) : reponseJson({ erreur: "Ville inconnue" }, 404));
          return;
        }
        if (methode === "GET" && chemin === "/lent") { resolve(reponseJson({ message: "Enfin !" })); return; }
        if (methode === "GET" && chemin === "/erreur") { resolve(reponseJson({ erreur: "Erreur serveur" }, 500)); return; }
        if (methode === "GET" && chemin === "/texte") {
          resolve(new Response("Bonjour depuis le serveur", { status: 200, headers: { "Content-Type": "text/plain" } }));
          return;
        }
        if (methode === "GET" && chemin === "/invalide") {
          resolve(new Response("ceci n'est pas du JSON", { status: 200, headers: { "Content-Type": "application/json" } }));
          return;
        }
        if (methode === "POST" && chemin === "/messages") {
          var corps;
          try { corps = JSON.parse(options.body); }
          catch (erreur) { resolve(reponseJson({ erreur: "Corps JSON invalide" }, 400)); return; }
          corps.id = 42;
          resolve(reponseJson(corps, 201));
          return;
        }
        resolve(reponseJson({ erreur: "Route inconnue" }, 404));
      }, delai);
    });
  };
  // Une promesse rejetée que personne n'attrape est une erreur à signaler.
  window.addEventListener("unhandledrejection", function (event) {
    var raison = event.reason;
    send("error", { text: "Promesse rejetée non gérée : " + (raison && raison.message ? raison.message : String(raison)) });
  });

  // Garde-fous : un formulaire envoyé ou un lien suivi sans preventDefault() changerait de page.
  // Dans l'aperçu, on l'empêche et on prévient. On écoute sur window : ce code passe en dernier.
  window.addEventListener("submit", function (event) {
    if (!event.defaultPrevented) {
      send("log", { level: "warn", text: "Le formulaire a été envoyé : dans un vrai navigateur, la page se rechargerait. Appelle event.preventDefault() dans le gestionnaire de submit." });
    }
    event.preventDefault();
  });
  window.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link || event.defaultPrevented) return;
    if (link.getAttribute("href").charAt(0) !== "#") {
      send("log", { level: "warn", text: "Le lien a été suivi : dans un vrai navigateur, la page aurait changé. Appelle event.preventDefault() pour l’en empêcher." });
    }
    event.preventDefault();
  });

  // Les actions de l'exercice simulent une personne qui utilise la page. L'action { do: "wait", ms } laisse passer du temps
  // (pour les minuteurs et les requêtes).
  function find(selector) {
    if (selector === "document") return document;
    if (selector === "window") return window;
    var element = document.querySelector(selector);
    if (!element) throw new Error("Élément introuvable dans la page : " + selector);
    return element;
  }
  function perform(action) {
    if (action.do === "wait") return new Promise(function (resolve) { setTimeout(resolve, action.ms || 100); });
    var target = find(action.target);
    if (action.do === "click") {
      for (var i = 0; i < (action.times || 1); i++) target.click();
    } else if (action.do === "input" || action.do === "change") {
      target.value = action.value;
      target.dispatchEvent(new Event(action.do, { bubbles: true }));
    } else if (action.do === "key") {
      target.dispatchEvent(new KeyboardEvent(action.type || "keydown", {
        key: action.key, bubbles: true, shiftKey: !!action.shiftKey, ctrlKey: !!action.ctrlKey, altKey: !!action.altKey,
      }));
    } else if (action.do === "mouse") {
      target.dispatchEvent(new MouseEvent(action.type, {
        bubbles: action.type !== "mouseenter" && action.type !== "mouseleave",
        clientX: action.x || 0, clientY: action.y || 0, button: action.button || 0,
      }));
    } else if (action.do === "focus") {
      target.focus();
    } else if (action.do === "event") {
      target.dispatchEvent(new Event(action.type, { bubbles: action.bubbles === true }));
    } else if (action.do === "submit") {
      if (target.requestSubmit) target.requestSubmit();
      else target.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
  }

  // Une fois la page chargée : on joue les actions, puis on évalue les vérifications de l'exercice.
  // Une vérification avec afterAction: k est évaluée juste après la k-ième action (en partant de 0) ; afterAction: -1, avant toute action.
  window.addEventListener("load", function () {
    setTimeout(async function () {
      var results = [];
      function check(test) {
        try { return { value: preciseValue((0, eval)(test.expr)) }; }
        catch (error) { return { error: String(error) }; }
      }
      tests.forEach(function (test, position) { if (test.afterAction === -1) results[position] = check(test); });
      for (var index = 0; index < (actions || []).length; index++) {
        try { await perform(actions[index]); } catch (error) { send("error", { text: String(error) }); }
        tests.forEach(function (test, position) { if (test.afterAction === index) results[position] = check(test); });
      }
      tests.forEach(function (test, position) { if (test.afterAction === undefined) results[position] = check(test); });
      send("results", results);
    }, 30);
  });
}

// ─── Protection contre les boucles infinies ───
// Transforme  while (cond)  en  while (__lp(), (cond))  et  for (a; cond; c)  en  for (a; __lp(), (cond); c).
// On parcourt le code en sautant les textes entre guillemets et les commentaires.
function skipString(code, start) {
  const quote = code[start];
  let i = start + 1;
  while (i < code.length && code[i] !== quote) { if (code[i] === "\\") i++; i++; }
  return i + 1;
}

// Renvoie la position de la parenthèse fermante qui correspond à celle de `open`.
function matchParen(code, open) {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(code, i) - 1; }
    else if (c === "(") depth++;
    else if (c === ")") { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// Positions des « ; » au premier niveau d'un en-tête de boucle for.
function topLevelSemicolons(header) {
  const found = [];
  let depth = 0;
  for (let i = 0; i < header.length; i++) {
    const c = header[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(header, i) - 1; }
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === ";" && depth === 0) found.push(i);
  }
  return found;
}

function guardLoops(code) {
  let out = "";
  let i = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i];
    const d = code[i + 1];
    if (c === "/" && d === "/") {
      const end = code.indexOf("\n", i) === -1 ? n : code.indexOf("\n", i);
      out += code.slice(i, end); i = end; continue;
    }
    if (c === "/" && d === "*") {
      const end = code.indexOf("*/", i + 2) === -1 ? n : code.indexOf("*/", i + 2) + 2;
      out += code.slice(i, end); i = end; continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const end = Math.min(skipString(code, i), n);
      out += code.slice(i, end); i = end; continue;
    }
    if (/[A-Za-z_$]/.test(c) && (i === 0 || (!/[\w$.]/.test(code[i - 1])))) {
      let j = i;
      while (j < n && /[\w$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      out += word; i = j;
      if (word === "while" || word === "for") {
        let k = i;
        while (k < n && /\s/.test(code[k])) k++;
        if (code[k] === "(") {
          const close = matchParen(code, k);
          if (close !== -1) {
            const header = code.slice(k + 1, close);
            if (word === "while") {
              out += code.slice(i, k + 1) + "__lp(), (" + header + "))"; i = close + 1;
            } else {
              const semis = topLevelSemicolons(header);
              if (semis.length === 2) {
                const middle = header.slice(semis[0] + 1, semis[1]).trim();
                out += code.slice(i, k + 1) + header.slice(0, semis[0] + 1) + " __lp(), " +
                  (middle === "" ? "true" : "(" + middle + ")") + header.slice(semis[1]) + ")";
                i = close + 1;
              }
            }
          }
        }
      }
      continue;
    }
    out += c; i++;
  }
  // Sécurité : si le code transformé n'est plus valide, on garde l'original.
  try { new Function(out); } catch (error) { return code; }
  return out;
}

function escapeScript(code) {
  return code.replace(/<\/script/gi, "<\\/script");
}

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

// Assemble la page à partir des fichiers : renvoie { doc, scripts }.
//   doc     : le HTML complet de la page (pour l’iframe)
//   scripts : le code de chaque <script>, dans l’ordre
function buildPage(files, tests, id, actions) {
  const byName = {};
  files.forEach((file) => { byName[file.name] = file.code; });
  const problems = [];
  const scripts = [];
  const deferred = [];
  const lookup = (path) => {
    const name = path.replace(/^\.\//, "");
    return Object.prototype.hasOwnProperty.call(byName, name) ? byName[name] : null;
  };

  let html = byName["index.html"] || "";

  // <link rel="stylesheet" href="style.css"> → <style>…</style>
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']stylesheet["']/i.test(tag)) return tag;
    const match = tag.match(/href=["']([^"']+)["']/i);
    if (!match) return tag;
    const css = lookup(match[1]);
    if (css === null) { problems.push("Impossible de charger " + match[1] + " : fichier introuvable."); return ""; }
    return "<style>" + css + "</style>";
  });

  // <script src="script.js"></script> → <script>…</script>
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (all, attrs, body) => {
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i);
    let code = body;
    if (src) {
      code = lookup(src[1]);
      if (code === null) { problems.push("Impossible de charger " + src[1] + " : fichier introuvable."); return ""; }
    }
    scripts.push(code);
    const tag = "<script>" + escapeScript(guardLoops(code)) + "</script>";
    // defer : le script s'exécute une fois la page lue, comme s'il était à la fin du body.
    if (src && /\bdefer\b/i.test(attrs)) { deferred.push(tag); return ""; }
    return tag;
  });
  if (deferred.length > 0) {
    html = /<\/body>/i.test(html)
      ? html.replace(/<\/body>/i, () => deferred.join("\n") + "\n</body>")
      : html + "\n" + deferred.join("\n");
  }

  // Le script de capture passe en premier.
  const capture = "<script>" + escapeScript(
    showValue.toString() + "\n" + preciseValue.toString() + "\n(" + pageCapture.toString() + ")(" +
    jsonForScript(id || "") + "," + jsonForScript(problems) + "," + jsonForScript(tests || []) + "," + jsonForScript(actions || []) + ");") + "</script>";
  if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (m) => m + capture);
  else if (/^\s*<!doctype[^>]*>/i.test(html)) html = html.replace(/^(\s*<!doctype[^>]*>)/i, (m) => m + capture);
  else html = capture + html;

  return { doc: html, scripts: scripts, problems: problems };
}

// Exécute la page dans l’iframe et renvoie { logs, error, results } une fois la page chargée et les actions jouées.
// extra.actions : actions simulées (clics, saisies…)   extra.onLog(ligne) : appelé pour les messages qui arrivent plus tard
// (par exemple quand la personne clique dans l'aperçu). L'écoute continue jusqu'à la prochaine exécution.
function runPage(iframe, files, tests, timeoutMs, extra) {
  const options = extra || {};
  if (iframe.stopListening) iframe.stopListening();
  const id = Math.random().toString(36).slice(2);
  const page = buildPage(files, tests, id, options.actions);
  const waits = (options.actions || []).reduce((total, action) => total + (action.do === "wait" ? action.ms || 100 : 0), 0);
  return new Promise((resolve) => {
    const logs = [];
    let firstError = null;
    let finished = false;
    function stop() { window.removeEventListener("message", onMessage); }
    iframe.stopListening = stop;
    function finish(result) {
      finished = true;
      clearTimeout(timer);
      resolve(result);
    }
    function addLine(line) {
      if (finished) { if (options.onLog) options.onLog(line); } else logs.push(line);
    }
    function onMessage(event) {
      if (!iframe.isConnected) { stop(); return; }
      const message = event.data;
      if (!message || !message.cahierjs || message.id !== id || event.source !== iframe.contentWindow) return;
      if (message.type === "log") addLine(message.data);
      else if (message.type === "error") {
        addLine({ level: "error", text: message.data.text });
        if (!firstError && !finished) firstError = message.data.text;
      } else if (message.type === "results") {
        finish({ logs: logs, error: firstError, results: message.data });
      }
    }
    const timer = setTimeout(() => finish({ logs: logs, error: firstError || "La page n’a pas répondu à temps.", results: [], timeout: true }), timeoutMs || 4000);
    window.addEventListener("message", onMessage);
    iframe.srcdoc = page.doc;
  });
}

// Compare les résultats d’une exécution avec les vérifications d’un exercice.
// Renvoie la liste des problèmes (vide si tout est bon).
function checkLab(exercise, files, result) {
  const problems = [];
  for (const rule of exercise.mustContain || []) {
    const file = files.find((f) => f.name === rule.file);
    if (!file || !new RegExp(rule.re, "i").test(file.code)) problems.push(rule.msg);
  }
  for (const rule of exercise.mustNotContain || []) {
    const file = files.find((f) => f.name === rule.file);
    if (file && new RegExp(rule.re, "i").test(file.code)) problems.push(rule.msg);
  }
  for (const forbidden of exercise.forbidLogs || []) {
    if (result.logs.some((line) => (!forbidden.level || line.level === forbidden.level) && line.text.includes(forbidden.text))) problems.push(forbidden.label);
  }
  (exercise.tests || []).forEach((test, index) => {
    const item = result.results[index];
    const expected = preciseValue(test.expect);
    if (!item || item.error || item.value !== expected) {
      problems.push(test.label + " — la page donne " + (item ? (item.error || item.value) : "rien") + ", attendu : " + expected + ".");
    }
  });
  for (const expected of exercise.expectLogs || []) {
    const found = result.logs.some((line) => line.text === expected.text && (!expected.level || line.level === expected.level));
    if (!found) problems.push(expected.label || ("La console devrait afficher « " + expected.text + " »."));
  }
  return problems;
}

// ─── L'affichage de la console de l'atelier ───
const LEVEL_PREFIX = { log: "", info: "ℹ ", warn: "⚠ ", error: "✖ ", alert: "▣ " };

function renderConsole(box, result) {
  box.replaceChildren(h("p", { class: "console-title" }, "Console"));
  const lines = result.logs.slice();
  if (result.error && !lines.some((line) => line.level === "error")) lines.push({ level: "error", text: result.error });
  if (lines.length === 0) {
    box.append(h("p", { class: "muted small empty-note" }, "Rien dans la console pour l’instant. Les clics et saisies dans l’aperçu s’affichent ici."));
    return;
  }
  lines.forEach((line) => box.append(h("div", { class: "con-line " + line.level }, (LEVEL_PREFIX[line.level] || "") + line.text)));
  if (result.error) box.append(h("p", { class: "small con-help", html: rich(explainError(result.error)) }));
}

// ─── Le composant atelier ───
// options.files : [{ name, code, readOnly }]   options.previewHeight : hauteur de l'aperçu
// options.resetButton : ajoute un bouton Réinitialiser   options.tips : aide-mémoire des raccourcis
function renderLab(options) {
  const settings = options || {};
  const starter = settings.files.map((f) => ({ name: f.name, code: f.code, readOnly: f.readOnly === true }));
  const editors = {};
  let liveTimer = null;
  const tabs = h("div", { class: "lab-tabs", role: "tablist", "aria-label": "Fichiers" });
  const panes = h("div", { class: "lab-panes" });
  const preview = h("iframe", {
    class: "lab-preview", sandbox: "allow-scripts allow-forms", title: "Aperçu de la page",
    style: "height:" + (settings.previewHeight || 170) + "px",
  });
  const consoleBox = h("div", { class: "lab-console", "aria-live": "polite" },
    h("p", { class: "console-title" }, "Console"),
    h("p", { class: "muted small" }, "Clique sur Exécuter : la page apparaît à gauche, la console à droite."));

  function getFiles() {
    return starter.map((f) => ({ name: f.name, code: editors[f.name].value }));
  }

  // Les messages qui arrivent après l'exécution (quand tu cliques dans l'aperçu) s'ajoutent à la console.
  function addLiveLine(line) {
    const note = consoleBox.querySelector(".empty-note");
    if (note) note.remove();
    consoleBox.append(h("div", { class: "con-line " + line.level }, (LEVEL_PREFIX[line.level] || "") + line.text));
  }

  async function run(tests, actions) {
    consoleBox.replaceChildren(h("p", { class: "console-title" }, "Console"), h("p", { class: "muted small" }, "Exécution…"));
    const result = await runPage(preview, getFiles(), tests || [], 4000, { actions: actions || [], onLog: addLiveLine });
    renderConsole(consoleBox, result);
    return result;
  }

  function select(name) {
    starter.forEach((f) => {
      const active = f.name === name;
      editors[f.name].parentNode.hidden = !active;
      editors[f.name].tab.setAttribute("aria-selected", active ? "true" : "false");
      editors[f.name].tab.classList.toggle("active", active);
    });
  }

  starter.forEach((file) => {
    const language = file.name.endsWith(".html") ? "html" : file.name.endsWith(".css") ? "css" : "js-browser";
    const rows = Math.max(5, Math.min(14, file.code.split("\n").length + 1));
    const editor = makeEditor(file.code, rows, () => run([]), language);
    editor.readOnly = file.readOnly;
    editor.tab = h("button", { class: "lab-tab", type: "button", role: "tab", onclick: () => select(file.name) },
      file.name + (file.readOnly ? " (lecture seule)" : ""));
    editors[file.name] = editor;
    if (settings.live && !file.readOnly) {
      editor.addEventListener("input", () => {
        clearTimeout(liveTimer);
        liveTimer = setTimeout(() => run([]), 180);
      });
    }
    tabs.append(editor.tab);
    panes.append(h("div", { class: "lab-pane", role: "tabpanel" }, editor));
  });
  // On ouvre le premier fichier modifiable.
  select((starter.find((f) => !f.readOnly) || starter[0]).name);

  const toolbar = h("div", { class: "toolbar" },
    h("button", { class: "btn primary", type: "button", onclick: () => run([]) }, settings.live ? "Actualiser" : "Exécuter"));
  if (settings.previewModes) {
    [{label:"📱 Mobile",w:"360px"},{label:"▣ Tablette",w:"700px"},{label:"🖥 Desktop",w:"100%"}].forEach(mode => {
      toolbar.append(h("button", { class:"btn small", type:"button", onclick:()=>{ preview.style.width=mode.w; preview.style.maxWidth="100%"; } }, mode.label));
    });
  }
  const node = h("div", { class: "lab" },
    tabs, panes, toolbar,
    h("div", { class: "lab-out" },
      h("div", { class: "lab-preview-wrap" }, h("p", { class: "console-title" }, "Aperçu"), preview),
      consoleBox),
    settings.tips ? editorTips() : null);

  function reset() {
    starter.forEach((f) => { editors[f.name].value = f.code; });
    preview.srcdoc = "";
    consoleBox.replaceChildren(h("p", { class: "console-title" }, "Console"), h("p", { class: "muted small" }, "Code remis à zéro."));
  }
  if (settings.resetButton) toolbar.append(h("button", { class: "btn ghost", type: "button", onclick: reset }, "Réinitialiser"));
  if (settings.live) setTimeout(() => run([]), 0);

  return {
    node: node, getFiles: getFiles, starter: starter, run: run, reset: reset, preview: preview,
    setCode(name, code) { if (editors[name]) editors[name].value = code; },
    lock() { starter.forEach((f) => { editors[f.name].readOnly = true; }); },
  };
}
