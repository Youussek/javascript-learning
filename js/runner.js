// runner.js — exécute le code que tu écris dans les éditeurs.
//
// Pourquoi un « Worker » ? C’est un petit programme qui tourne à part, dans son propre fil.
// Avantage : si ton code contient une boucle infinie, la page ne se fige pas.
// On attend 2 secondes, puis on arrête le Worker (terminate).
//
// Les exercices de ce niveau ne touchent pas à la page (pas de DOM) :
// on exécute simplement du JavaScript et on récupère ce que console.log() affiche.

// Affichage « lisible » d’une valeur, comme dans une console.
function showValue(value) {
  if (typeof value === "string") return value;
  if (typeof value === "function") return String(value);
  if (value === undefined) return "undefined";
  if (typeof value === "number" && !Number.isFinite(value)) return String(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

// Version « précise » : garde les guillemets pour distinguer "5" (texte) de 5 (nombre).
function preciseValue(value) {
  if (typeof value === "function") return "[fonction]";
  return showValue(typeof value === "string" ? JSON.stringify(value) : value);
}

// Ce code s’exécute DANS le Worker (il n’a pas accès à la page).
// Il utilise showValue() et preciseValue(), qu’on copie dans le Worker en même temps.
function workerMain() {
  self.onmessage = function (event) {
    const code = event.data.code;
    const tests = event.data.tests;
    const logs = [];

    // On remplace console par une version qui range les messages dans une liste.
    function record() {
      if (logs.length < 500) logs.push(Array.prototype.map.call(arguments, showValue).join(" "));
    }
    const fakeConsole = { log: record, info: record, warn: record, error: record };

    const reply = { logs: logs, error: null, results: [] };
    try {
      // On colle le code de l’élève et les tests dans une seule fonction,
      // pour que les tests puissent lire les variables créées par l’élève.
      const body =
        '"use strict";\n' + code + "\n;" +
        "return __tests.map(function (__t) {" +
        "  try { return { value: eval(__t.expr) }; }" +
        "  catch (__e) { return { error: String(__e) }; }" +
        "});";
      const run = new Function("console", "__tests", body);
      const raw = run(fakeConsole, tests);

      if (Array.isArray(raw)) {
        reply.results = raw.map(function (item, index) {
          const test = tests[index];
          const got = item.error ? item.error : preciseValue(item.value);
          const expected = preciseValue(test.expect);
          return {
            expr: test.expr,
            label: test.label || test.expr,
            pass: !item.error && got === expected,
            got: got,
            expected: expected,
          };
        });
      }
    } catch (error) {
      reply.error = String(error);
    }
    self.postMessage(reply);
  };
}

// Ce code s’exécute dans la page : il crée le Worker et attend sa réponse.
function runCode(code, tests, timeoutMs) {
  return new Promise(function (resolve) {
    let worker;
    let url;
    try {
      const source = showValue.toString() + "\n" + preciseValue.toString() + "\n(" + workerMain.toString() + ")()";
      url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
      worker = new Worker(url);
    } catch (error) {
      resolve({ logs: [], error: "Ce navigateur ne permet pas d’exécuter le code ici.", results: [] });
      return;
    }

    function finish(result) {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(result);
    }

    const timer = setTimeout(function () {
      finish({ logs: [], error: "Le code a tourné trop longtemps (plus de 2 secondes).", results: [], timeout: true });
    }, timeoutMs || 2000);

    worker.onmessage = function (event) { finish(event.data); };
    worker.onerror = function (event) {
      finish({ logs: [], error: event.message || "Erreur inconnue.", results: [] });
    };
    worker.postMessage({ code: code, tests: tests || [] });
  });
}
