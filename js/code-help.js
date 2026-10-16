// code-help.js — aide contextuelle façon VS Code pour les notions de code.
// Desktop : survol/focus d'un token dans les exemples. Mobile : tap pour épingler.
// Dans les éditeurs textarea : clic/tap (ou déplacement du curseur) affiche l'aide du token courant.

const CODE_HELP = {
  // HTML
  html:{title:"<html>",kind:"HTML",description:"Élément racine d'un document HTML. L'attribut lang indique la langue principale de la page.",example:'<html lang="fr">'},
  head:{title:"<head>",kind:"HTML",description:"Contient les métadonnées du document : title, meta, liens CSS, favicon, etc.",example:"<head>…</head>"},
  body:{title:"<body>",kind:"HTML",description:"Contient tout le contenu visible et interactif de la page.",example:"<body>…</body>"},
  main:{title:"<main>",kind:"HTML",description:"Contenu principal unique de la page. Il aide la sémantique et les technologies d'assistance.",example:"<main>…</main>"},
  span:{title:"<span>",kind:"HTML",description:"Conteneur en ligne sans signification sémantique propre. Utile pour cibler une petite portion de contenu avec CSS ou JavaScript.",example:'<span class="label">Texte</span>'},
  div:{title:"<div>",kind:"HTML",description:"Conteneur générique de type bloc, sans sémantique propre. À utiliser quand aucun élément HTML plus précis ne convient.",example:'<div class="card">…</div>'},
  section:{title:"<section>",kind:"HTML",description:"Regroupe une section thématique du document, généralement avec un titre.",example:"<section><h2>Titre</h2>…</section>"},
  article:{title:"<article>",kind:"HTML",description:"Contenu autonome pouvant être compris ou réutilisé séparément : article, carte, commentaire, etc.",example:"<article>…</article>"},
  nav:{title:"<nav>",kind:"HTML",description:"Zone dédiée aux liens de navigation principaux ou structurants.",example:"<nav><a href=\"/\">Accueil</a></nav>"},
  header:{title:"<header>",kind:"HTML",description:"En-tête d'une page ou d'une section. Peut contenir titre, logo, navigation, actions…",example:"<header>…</header>"},
  footer:{title:"<footer>",kind:"HTML",description:"Pied d'une page ou d'une section, souvent utilisé pour les informations secondaires et liens complémentaires.",example:"<footer>…</footer>"},
  aside:{title:"<aside>",kind:"HTML",description:"Contenu complémentaire au contenu principal : sommaire, encadré, liens connexes…",example:"<aside>…</aside>"},
  button:{title:"<button>",kind:"HTML",description:"Contrôle interactif pour déclencher une action. À préférer à un div cliquable.",example:'<button type="button">Ouvrir</button>'},
  label:{title:"<label>",kind:"HTML",description:"Libellé accessible d'un champ de formulaire. Utilise for pour cibler l'id du contrôle.",example:'<label for="email">Email</label>'},
  input:{title:"<input>",kind:"HTML",description:"Champ de saisie. Son comportement dépend notamment de l'attribut type.",example:'<input id="email" type="email">'},
  form:{title:"<form>",kind:"HTML",description:"Regroupe les contrôles permettant de saisir et soumettre des données.",example:"<form>…</form>"},
  img:{title:"<img>",kind:"HTML",description:"Affiche une image. alt décrit une image informative ou reste vide pour une image purement décorative.",example:'<img src="photo.jpg" alt="Description">'},
  href:{title:"href",kind:"HTML",description:"Attribut qui définit la destination d'un lien.",example:'<a href="/cours">Cours</a>'},
  alt:{title:"alt",kind:"HTML",description:"Alternative textuelle d'une image. Essentielle pour l'accessibilité quand l'image transmet une information.",example:'<img src="chat.jpg" alt="Chat noir">'},
  "aria-describedby":{title:"aria-describedby",kind:"Accessibilité",description:"Associe un contrôle à un ou plusieurs éléments qui fournissent une description complémentaire.",example:'aria-describedby="email-help"'},

  // CSS
  margin:{title:"margin",kind:"CSS",description:"Définit l'espace extérieur autour de la bordure d'un élément.",example:"margin: 1rem;"},
  padding:{title:"padding",kind:"CSS",description:"Définit l'espace intérieur entre le contenu d'un élément et sa bordure.",example:"padding: 1rem;"},
  width:{title:"width",kind:"CSS",description:"Définit la largeur d'un élément. Peut utiliser px, %, rem, vw et d'autres unités.",example:"width: 100%;"},
  color:{title:"color",kind:"CSS",description:"Définit la couleur du texte et fournit souvent la valeur currentColor aux éléments descendants.",example:"color: #1d4ed8;"},
  display:{title:"display",kind:"CSS",description:"Définit le mode de mise en page principal d'un élément : block, flex, grid, none…",example:"display: flex;"},
  flex:{title:"flex",kind:"CSS",description:"Active ou configure la participation d'un élément à une mise en page Flexbox.",example:"display: flex;"},
  grid:{title:"grid",kind:"CSS",description:"Active une mise en page CSS Grid en lignes et colonnes.",example:"display: grid;"},
  gap:{title:"gap",kind:"CSS",description:"Définit l'espacement entre les éléments d'une grille ou d'un conteneur flex.",example:"gap: 1rem;"},
  position:{title:"position",kind:"CSS",description:"Contrôle le mode de positionnement : static, relative, absolute, fixed ou sticky.",example:"position: relative;"},
  "z-index":{title:"z-index",kind:"CSS",description:"Contrôle l'ordre d'empilement des éléments positionnés dans un contexte d'empilement.",example:"z-index: 10;"},
  "box-sizing":{title:"box-sizing",kind:"CSS",description:"Avec border-box, width/height incluent padding et bordure, ce qui simplifie les dimensions.",example:"box-sizing: border-box;"},
  "@media":{title:"@media",kind:"CSS",description:"Applique des règles CSS uniquement lorsque certaines conditions média sont remplies.",example:"@media (max-width: 700px) { … }"},
  clamp:{title:"clamp()",kind:"CSS",description:"Produit une valeur fluide limitée par un minimum et un maximum.",example:"font-size: clamp(1rem, 2vw, 2rem);"},
  "var":{title:"var()",kind:"CSS",description:"Lit la valeur d'une propriété personnalisée CSS.",example:"color: var(--text);"},

  // JavaScript / TypeScript
  const:{title:"const",kind:"JavaScript",description:"Déclare une variable dont la liaison ne peut pas être réassignée.",example:"const score = 42;"},
  let:{title:"let",kind:"JavaScript",description:"Déclare une variable locale qui peut être réassignée.",example:"let score = 0;"},
  function:{title:"function",kind:"JavaScript",description:"Déclare une fonction réutilisable pouvant recevoir des paramètres et renvoyer une valeur.",example:"function add(a, b) { return a + b; }"},
  return:{title:"return",kind:"JavaScript",description:"Termine l'exécution d'une fonction et renvoie éventuellement une valeur.",example:"return total;"},
  async:{title:"async",kind:"JavaScript",description:"Déclare une fonction asynchrone. Elle renvoie toujours une Promise et permet d'utiliser await.",example:"async function load() { … }"},
  await:{title:"await",kind:"JavaScript",description:"Attend le règlement d'une Promise dans une fonction async ou un contexte qui autorise top-level await.",example:"const data = await load();"},
  Promise:{title:"Promise",kind:"JavaScript",description:"Représente le résultat futur d'une opération asynchrone : pending, fulfilled ou rejected.",example:"Promise.resolve(42)"},
  "console.log":{title:"console.log()",kind:"JavaScript",description:"Affiche une valeur dans la console. Très utile pour observer et déboguer un programme.",example:'console.log("Bonjour");'},
  querySelector:{title:"querySelector()",kind:"DOM",description:"Retourne le premier élément du document correspondant à un sélecteur CSS.",example:'document.querySelector(".card")'},
  "document.querySelector":{title:"document.querySelector()",kind:"DOM",description:"Recherche le premier élément du document correspondant à un sélecteur CSS.",example:'document.querySelector("#app")'},
  addEventListener:{title:"addEventListener()",kind:"DOM",description:"Enregistre une fonction à exécuter lorsqu'un événement se produit.",example:'button.addEventListener("click", handler)'},
  fetch:{title:"fetch()",kind:"Web API",description:"Effectue une requête HTTP et renvoie une Promise contenant la réponse.",example:'const response = await fetch("/api");'},
  map:{title:"map()",kind:"JavaScript",description:"Crée un nouveau tableau en transformant chaque élément du tableau d'origine.",example:"items.map(item => item.name)"},
  filter:{title:"filter()",kind:"JavaScript",description:"Crée un nouveau tableau contenant uniquement les éléments qui passent un test.",example:"items.filter(item => item.active)"},
  find:{title:"find()",kind:"JavaScript",description:"Retourne le premier élément qui satisfait la fonction de test.",example:"users.find(user => user.id === id)"},
  JSON:{title:"JSON",kind:"JavaScript",description:"Objet global permettant de convertir entre texte JSON et valeurs JavaScript.",example:"JSON.parse(text) / JSON.stringify(value)"},
  "JSON.parse":{title:"JSON.parse()",kind:"JavaScript",description:"Transforme une chaîne JSON valide en valeur JavaScript.",example:"const data = JSON.parse(text);"},
  "JSON.stringify":{title:"JSON.stringify()",kind:"JavaScript",description:"Transforme une valeur JavaScript sérialisable en texte JSON.",example:"JSON.stringify(data, null, 2)"},
  try:{title:"try",kind:"JavaScript",description:"Délimite du code susceptible de lever une erreur afin de pouvoir la traiter avec catch.",example:"try { … } catch (error) { … }"},
  catch:{title:"catch",kind:"JavaScript",description:"Intercepte une erreur levée dans le bloc try associé.",example:"catch (error) { console.error(error); }"},
  interface:{title:"interface",kind:"TypeScript",description:"Décrit la forme attendue d'un objet et peut être étendue ou fusionnée.",example:"interface User { name: string }"},
  type:{title:"type",kind:"TypeScript",description:"Crée un alias de type : objet, union, littéral, tuple, type calculé…",example:'type Status = "idle" | "done";'},
  keyof:{title:"keyof",kind:"TypeScript",description:"Produit une union des clés connues d'un type objet.",example:"type UserKey = keyof User;"},
  unknown:{title:"unknown",kind:"TypeScript",description:"Type sûr pour une valeur dont on ne connaît pas encore la forme. Il faut la vérifier avant de l'utiliser.",example:"function parse(value: unknown) { … }"},
  never:{title:"never",kind:"TypeScript",description:"Représente une valeur qui ne peut jamais exister, utile notamment pour vérifier l'exhaustivité.",example:"const impossible: never = value;"},
  satisfies:{title:"satisfies",kind:"TypeScript",description:"Vérifie qu'une valeur respecte un type sans remplacer inutilement le type précis inféré de cette valeur.",example:"const config = { … } satisfies Config;"},
  readonly:{title:"readonly",kind:"TypeScript",description:"Empêche la réaffectation d'une propriété via le système de types.",example:"readonly id: number;"},

  // Node.js
  node:{title:"node",kind:"Terminal Node.js",description:"Commande qui lance le runtime Node.js. Elle peut exécuter un fichier JavaScript ou afficher des informations sur la version installée.",example:"node app.js"},
  npm:{title:"npm",kind:"Terminal Node.js",description:"Gestionnaire de paquets livré avec Node.js. Il sert notamment à initialiser un projet, installer des dépendances et lancer des scripts.",example:"npm run start"},
  process:{title:"process",kind:"Node.js",description:"Objet global Node.js donnant accès au processus courant : arguments, variables d'environnement, répertoire courant, signaux…",example:"process.argv / process.env / process.cwd()"},
  "process.argv":{title:"process.argv",kind:"Node.js",description:"Tableau contenant les arguments de ligne de commande. Les arguments utilisateur commencent généralement à l'index 2.",example:"const name = process.argv[2];"},
  "process.env":{title:"process.env",kind:"Node.js",description:"Objet donnant accès aux variables d'environnement du processus. Les valeurs sont des chaînes ou undefined.",example:"const port = process.env.PORT ?? 3000;"},
  "process.cwd":{title:"process.cwd()",kind:"Node.js",description:"Retourne le répertoire de travail courant depuis lequel le processus a été lancé.",example:"console.log(process.cwd());"},
  import:{title:"import",kind:"JavaScript / Node.js",description:"Importe une valeur ou un module en syntaxe ESM.",example:'import { readFile } from "node:fs/promises";'},
  export:{title:"export",kind:"JavaScript / Node.js",description:"Rend une valeur disponible pour d'autres modules ESM.",example:"export function greet() { … }"},
  require:{title:"require()",kind:"Node.js",description:"Charge un module avec le système CommonJS. À ne pas mélanger avec ESM sans comprendre la configuration.",example:'const fs = require("node:fs");'},
  readFile:{title:"readFile()",kind:"Node.js",description:"Lit le contenu d'un fichier. Avec node:fs/promises, la fonction renvoie une Promise.",example:'const text = await readFile("data.json", "utf8");'},
  writeFile:{title:"writeFile()",kind:"Node.js",description:"Écrit ou remplace le contenu d'un fichier.",example:'await writeFile("data.json", JSON.stringify(data));'},
  appendFile:{title:"appendFile()",kind:"Node.js",description:"Ajoute du contenu à la fin d'un fichier sans remplacer ce qui existe déjà.",example:'await appendFile("log.txt", "ligne\\n");'},
  "path.join":{title:"path.join()",kind:"Node.js",description:"Assemble des segments de chemin en utilisant les séparateurs adaptés à la plateforme.",example:'path.join("data", "users.json")'},
  "path.resolve":{title:"path.resolve()",kind:"Node.js",description:"Construit un chemin absolu à partir de segments et du répertoire courant.",example:'path.resolve("data", "users.json")'},
  createServer:{title:"createServer()",kind:"Node.js",description:"Crée un serveur HTTP Node.js et reçoit une fonction appelée pour chaque requête.",example:"http.createServer((req, res) => { … })"},
  "http.createServer":{title:"http.createServer()",kind:"Node.js",description:"Crée un serveur HTTP bas niveau. La callback reçoit la requête entrante et la réponse à construire.",example:"http.createServer((req, res) => { res.end('OK'); })"},
  listen:{title:"listen()",kind:"Node.js",description:"Démarre l'écoute d'un serveur sur un port donné.",example:"server.listen(3000);"},
  "res.end":{title:"res.end()",kind:"Node.js",description:"Termine la réponse HTTP et peut envoyer les derniers octets du body.",example:'res.end("Hello");'},
  "res.setHeader":{title:"res.setHeader()",kind:"Node.js",description:"Définit un header HTTP sur la réponse avant son envoi.",example:'res.setHeader("Content-Type", "application/json");'},
  Buffer:{title:"Buffer",kind:"Node.js",description:"Représente des données binaires brutes en mémoire dans Node.js.",example:'const buf = Buffer.from("Bonjour");'},
  createReadStream:{title:"createReadStream()",kind:"Node.js",description:"Crée un flux de lecture pour traiter progressivement un fichier sans tout charger en mémoire.",example:'createReadStream("big.log").pipe(destination);'},
  "node:test":{title:"node:test",kind:"Node.js",description:"Module de tests natif de Node.js pour définir et exécuter des tests sans framework externe.",example:'import test from "node:test";'},

  // SQL / SQLite
  SELECT:{title:"SELECT",kind:"SQL",description:"Choisit les colonnes ou expressions à renvoyer dans le résultat d'une requête.",example:"SELECT name, age FROM users;"},
  FROM:{title:"FROM",kind:"SQL",description:"Indique la table source lue par la requête.",example:"SELECT * FROM users;"},
  DISTINCT:{title:"DISTINCT",kind:"SQL",description:"Supprime les doublons du résultat SELECT pour la combinaison de colonnes sélectionnée.",example:"SELECT DISTINCT city FROM users;"},
  AS:{title:"AS",kind:"SQL",description:"Donne un alias temporaire à une colonne ou une expression dans le résultat.",example:"SELECT name AS username FROM users;"},
  LIMIT:{title:"LIMIT",kind:"SQLite / SQL",description:"Limite le nombre maximal de lignes renvoyées par SQLite.",example:"SELECT * FROM users LIMIT 5;"},
  WHERE:{title:"WHERE",kind:"SQL",description:"Filtre les lignes avant le tri ou le regroupement selon une condition.",example:"SELECT * FROM users WHERE age >= 18;"},
  AND:{title:"AND",kind:"SQL",description:"Combine des conditions qui doivent toutes être vraies pour conserver une ligne.",example:"WHERE active = 1 AND age >= 18"},
  OR:{title:"OR",kind:"SQL",description:"Combine des conditions dont au moins une doit être vraie.",example:"WHERE city = 'Paris' OR city = 'Lyon'"},
  IN:{title:"IN",kind:"SQL",description:"Teste si une valeur appartient à une liste de valeurs.",example:"WHERE city IN ('Paris', 'Lyon')"},
  BETWEEN:{title:"BETWEEN",kind:"SQL",description:"Teste si une valeur se trouve dans un intervalle inclusif.",example:"WHERE age BETWEEN 20 AND 30"},
  LIKE:{title:"LIKE",kind:"SQL",description:"Compare du texte à un motif. % remplace zéro ou plusieurs caractères et _ exactement un caractère.",example:"WHERE name LIKE 'A%'"},
  ORDER:{title:"ORDER BY",kind:"SQL",description:"Définit explicitement l'ordre des lignes d'un résultat.",example:"ORDER BY amount DESC"},
  OFFSET:{title:"OFFSET",kind:"SQLite / SQL",description:"Ignore un nombre de lignes avant de commencer à renvoyer le résultat, souvent avec LIMIT.",example:"LIMIT 10 OFFSET 20"},
  COUNT:{title:"COUNT()",kind:"SQL",description:"Compte les lignes ou les valeurs non NULL selon l'expression utilisée.",example:"SELECT COUNT(*) FROM users;"},
  SUM:{title:"SUM()",kind:"SQL",description:"Additionne les valeurs numériques d'un ensemble de lignes.",example:"SELECT SUM(amount) FROM sales;"},
  AVG:{title:"AVG()",kind:"SQL",description:"Calcule la moyenne des valeurs numériques non NULL.",example:"SELECT AVG(amount) FROM sales;"},
  MIN:{title:"MIN()",kind:"SQL",description:"Retourne la plus petite valeur d'un ensemble.",example:"SELECT MIN(amount) FROM sales;"},
  MAX:{title:"MAX()",kind:"SQL",description:"Retourne la plus grande valeur d'un ensemble.",example:"SELECT MAX(amount) FROM sales;"},
  GROUP:{title:"GROUP BY",kind:"SQL",description:"Regroupe des lignes partageant une même valeur afin de calculer des agrégats par groupe.",example:"GROUP BY city"},
  HAVING:{title:"HAVING",kind:"SQL",description:"Filtre les groupes après GROUP BY, notamment selon COUNT, SUM ou d'autres agrégats.",example:"HAVING SUM(amount) >= 100"},
  JOIN:{title:"JOIN / INNER JOIN",kind:"SQL",description:"Relie deux tables et conserve les lignes qui satisfont la condition ON.",example:"JOIN orders o ON o.user_id = u.id"},
  LEFT:{title:"LEFT JOIN",kind:"SQL",description:"Conserve toutes les lignes de la table de gauche, même sans correspondance à droite.",example:"LEFT JOIN orders o ON o.user_id = u.id"},
  ON:{title:"ON",kind:"SQL",description:"Décrit la condition qui relie les lignes de deux tables dans une jointure.",example:"ON orders.user_id = users.id"},
  FOREIGN:{title:"FOREIGN KEY",kind:"SQL",description:"Contrainte qui référence une clé d'une autre table et matérialise une relation.",example:"FOREIGN KEY (user_id) REFERENCES users(id)"},
  REFERENCES:{title:"REFERENCES",kind:"SQL",description:"Indique la table et la colonne ciblées par une clé étrangère.",example:"REFERENCES users(id)"},
  COALESCE:{title:"COALESCE()",kind:"SQL",description:"Retourne la première valeur non NULL de ses arguments, utile pour fournir une valeur de remplacement.",example:"COALESCE(SUM(total), 0)"},
  PRIMARY:{title:"PRIMARY KEY",kind:"SQL",description:"Contrainte qui identifie chaque ligne de façon unique.",example:"id INTEGER PRIMARY KEY"},
  NULL:{title:"NULL",kind:"SQL",description:"Représente l'absence de valeur. NULL n'est ni zéro ni une chaîne vide.",example:"SELECT NULL;"},
  INSERT:{title:"INSERT INTO",kind:"SQL",description:"Ajoute une ou plusieurs lignes dans une table en respectant ses contraintes.",example:"INSERT INTO users (name) VALUES ('Ada');"},
  VALUES:{title:"VALUES",kind:"SQL",description:"Introduit les valeurs à insérer dans une instruction INSERT.",example:"INSERT INTO users (name) VALUES ('Ada');"},
  UPDATE:{title:"UPDATE",kind:"SQL",description:"Modifie des lignes existantes. Utilise généralement WHERE pour cibler précisément les lignes concernées.",example:"UPDATE users SET city='Paris' WHERE id=1;"},
  SET:{title:"SET",kind:"SQL",description:"Décrit les nouvelles valeurs affectées aux colonnes dans un UPDATE.",example:"UPDATE users SET active=0 WHERE id=2;"},
  DELETE:{title:"DELETE FROM",kind:"SQL",description:"Supprime des lignes. Sans WHERE, toutes les lignes de la table peuvent être supprimées.",example:"DELETE FROM users WHERE id=4;"},
  CREATE:{title:"CREATE TABLE",kind:"SQL",description:"Crée une nouvelle structure de table avec ses colonnes et contraintes.",example:"CREATE TABLE users (id INTEGER PRIMARY KEY);"},
  ALTER:{title:"ALTER TABLE",kind:"SQLite / SQL",description:"Fait évoluer une table existante, par exemple en ajoutant ou renommant une colonne selon les capacités du dialecte.",example:"ALTER TABLE users ADD COLUMN role TEXT;"},
  DROP:{title:"DROP",kind:"SQL",description:"Supprime un objet de schéma comme une table. Opération destructive à utiliser avec prudence.",example:"DROP TABLE IF EXISTS temp_users;"},
  UNIQUE:{title:"UNIQUE",kind:"SQL",description:"Contrainte qui interdit les doublons pour la colonne ou combinaison de colonnes concernée.",example:"email TEXT UNIQUE"},
  CHECK:{title:"CHECK",kind:"SQL",description:"Contrainte qui impose une condition lors des écritures.",example:"age INTEGER CHECK(age >= 18)"},
  DEFAULT:{title:"DEFAULT",kind:"SQL",description:"Fournit une valeur lorsqu'une colonne est omise dans une insertion.",example:"active INTEGER DEFAULT 1"},
  BEGIN:{title:"BEGIN",kind:"SQL",description:"Démarre explicitement une transaction regroupant plusieurs opérations.",example:"BEGIN; UPDATE ...; COMMIT;"},
  COMMIT:{title:"COMMIT",kind:"SQL",description:"Confirme les modifications effectuées dans la transaction courante.",example:"COMMIT;"},
  ROLLBACK:{title:"ROLLBACK",kind:"SQL",description:"Annule les modifications non confirmées de la transaction courante.",example:"ROLLBACK;"},

  WITH:{title:"WITH / CTE",kind:"SQL",description:"Introduit une Common Table Expression : un résultat intermédiaire nommé réutilisable dans la requête principale.",example:"WITH totals AS (...) SELECT * FROM totals;"},
  CASE:{title:"CASE",kind:"SQL",description:"Expression conditionnelle qui retourne une valeur selon une ou plusieurs conditions.",example:"CASE WHEN total >= 100 THEN 'high' ELSE 'low' END"},
  WHEN:{title:"WHEN",kind:"SQL",description:"Décrit une condition à tester dans une expression CASE.",example:"CASE WHEN active=1 THEN 'Actif' END"},
  THEN:{title:"THEN",kind:"SQL",description:"Indique la valeur renvoyée lorsqu'une condition WHEN est vraie.",example:"WHEN total > 100 THEN 'VIP'"},
  OVER:{title:"OVER",kind:"SQL",description:"Définit la fenêtre utilisée par une window function comme ROW_NUMBER, RANK ou SUM.",example:"ROW_NUMBER() OVER (ORDER BY total DESC)"},
  PARTITION:{title:"PARTITION BY",kind:"SQL",description:"Découpe une fenêtre analytique en groupes indépendants sans réduire les lignes.",example:"SUM(total) OVER (PARTITION BY user_id)"},
  ROW_NUMBER:{title:"ROW_NUMBER()",kind:"SQL",description:"Attribue un numéro unique à chaque ligne selon l'ordre défini dans OVER.",example:"ROW_NUMBER() OVER (ORDER BY total DESC)"},
  RANK:{title:"RANK()",kind:"SQL",description:"Classe les lignes et laisse des trous dans les rangs en cas d'ex æquo.",example:"RANK() OVER (ORDER BY score DESC)"},
  DENSE_RANK:{title:"DENSE_RANK()",kind:"SQL",description:"Classe les lignes sans laisser de trou après les ex æquo.",example:"DENSE_RANK() OVER (ORDER BY score DESC)"},
  INDEX:{title:"INDEX",kind:"SQL",description:"Structure auxiliaire qui peut accélérer certains accès au prix d'espace et de travail supplémentaire lors des écritures.",example:"CREATE INDEX idx_users_email ON users(email);"},
  EXPLAIN:{title:"EXPLAIN QUERY PLAN",kind:"SQLite",description:"Affiche la stratégie prévue par SQLite pour accéder aux tables et index d'une requête.",example:"EXPLAIN QUERY PLAN SELECT * FROM users WHERE email=?;"},

  // React
  useState:{title:"useState()",kind:"React",description:"Hook React qui ajoute un état local à un composant fonctionnel.",example:"const [count, setCount] = useState(0);"},
  useEffect:{title:"useEffect()",kind:"React",description:"Hook qui synchronise un composant avec un système externe après le rendu.",example:"useEffect(() => { … }, [dependency]);"},
  props:{title:"props",kind:"React",description:"Données reçues par un composant depuis son parent.",example:"function Card(props) { … }"}
};

function codeHelpEntry(key) {
  if (!key) return null;
  return CODE_HELP[key] || CODE_HELP[String(key).replace(/\(\)$/g, "")] || null;
}

const CODE_HELP_TOKEN_RE = /[A-Za-z_$][\w$-]*(?:\.[A-Za-z_$][\w$-]*)*|@[A-Za-z-]+|::?[A-Za-z-]+/g;

function renderCodeHelpText(text) {
  const frag = document.createDocumentFragment();
  let last = 0;
  String(text).replace(CODE_HELP_TOKEN_RE, (token, offset) => {
    if (offset > last) frag.append(document.createTextNode(text.slice(last, offset)));
    const direct = codeHelpEntry(token);
    const tail = token.includes(".") ? codeHelpEntry(token.split(".").pop()) : null;
    const entry = direct || tail;
    if (entry) {
      const key = direct ? token : token.split(".").pop();
      frag.append(h("span", {
        class: "code-help-token",
        tabindex: "0",
        role: "button",
        "data-code-help": key,
        "aria-label": token + " — afficher l'explication"
      }, token));
    } else frag.append(document.createTextNode(token));
    last = offset + token.length;
    return token;
  });
  if (last < text.length) frag.append(document.createTextNode(text.slice(last)));
  return frag;
}

let codeHelpPopup = null;
let codeHelpPinned = false;
let codeHelpHideTimer = null;

function ensureCodeHelpPopup() {
  if (codeHelpPopup) return codeHelpPopup;
  codeHelpPopup = h("aside", {class:"code-help-popup", role:"dialog", "aria-live":"polite", hidden:true});
  document.body.append(codeHelpPopup);
  codeHelpPopup.addEventListener("pointerenter", () => clearTimeout(codeHelpHideTimer));
  codeHelpPopup.addEventListener("pointerleave", () => { if (!codeHelpPinned) hideCodeHelp(); });
  return codeHelpPopup;
}

function positionCodeHelp(anchor) {
  const popup = ensureCodeHelpPopup();
  const rect = anchor.getBoundingClientRect();
  const pad = 12;
  popup.style.left = Math.min(Math.max(pad, rect.left), window.innerWidth - Math.min(420, window.innerWidth - pad * 2) - pad) + "px";
  popup.style.top = "0px";
  const popupRect = popup.getBoundingClientRect();
  let top = rect.bottom + 10;
  if (top + popupRect.height > window.innerHeight - pad) top = Math.max(pad, rect.top - popupRect.height - 10);
  popup.style.top = top + "px";
}

function showCodeHelp(anchor, key, pinned) {
  const entry = codeHelpEntry(key);
  if (!entry) return;
  clearTimeout(codeHelpHideTimer);
  codeHelpPinned = !!pinned;
  const popup = ensureCodeHelpPopup();
  popup.hidden = false;
  popup.replaceChildren(
    h("div",{class:"code-help-head"},
      h("div",{},h("strong",{class:"code-help-title"},entry.title),h("span",{class:"code-help-kind"},entry.kind || "Code")),
      h("button",{class:"code-help-close",type:"button","aria-label":"Fermer l'aide",onclick:hideCodeHelp},"×")
    ),
    h("p",{class:"code-help-description"},entry.description),
    entry.example ? h("pre",{class:"code-help-example"},entry.example) : null,
    h("p",{class:"code-help-hint"}, codeHelpPinned ? "Appuie ailleurs ou sur × pour fermer." : "Clique pour garder cette aide ouverte.")
  );
  positionCodeHelp(anchor);
}

function hideCodeHelp() {
  codeHelpPinned = false;
  if (codeHelpPopup) codeHelpPopup.hidden = true;
}

function scheduleHideCodeHelp() {
  clearTimeout(codeHelpHideTimer);
  codeHelpHideTimer = setTimeout(() => { if (!codeHelpPinned) hideCodeHelp(); }, 100);
}

function bindCodeHelpToken(token) {
  if (token.dataset.codeHelpBound) return;
  token.dataset.codeHelpBound = "1";
  const key = token.dataset.codeHelp;
  token.addEventListener("pointerenter", event => {
    if (event.pointerType !== "touch" && !codeHelpPinned) showCodeHelp(token, key, false);
  });
  token.addEventListener("pointerleave", event => {
    if (event.pointerType !== "touch" && !codeHelpPinned) scheduleHideCodeHelp();
  });
  token.addEventListener("focus", () => { if (!codeHelpPinned) showCodeHelp(token, key, false); });
  token.addEventListener("blur", () => { if (!codeHelpPinned) scheduleHideCodeHelp(); });
  token.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    showCodeHelp(token, key, true);
  });
}

function activateCodeHelp(root) {
  (root || document).querySelectorAll(".code-help-token").forEach(bindCodeHelpToken);
}

function tokenAtCaret(text, caret) {
  let best = null;
  CODE_HELP_TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = CODE_HELP_TOKEN_RE.exec(text))) {
    const start = match.index, end = start + match[0].length;
    if (caret >= start && caret <= end) { best = match[0]; break; }
    if (start > caret) break;
  }
  if (!best) return null;
  if (codeHelpEntry(best)) return best;
  const tail = best.includes(".") ? best.split(".").pop() : null;
  return tail && codeHelpEntry(tail) ? tail : null;
}

function attachEditorCodeHelp(editor) {
  if (!editor || editor.dataset.codeHelpEditor) return editor;
  editor.dataset.codeHelpEditor = "1";
  const showAtCaret = () => {
    const key = tokenAtCaret(editor.value, editor.selectionStart || 0);
    if (key) showCodeHelp(editor, key, true);
  };
  editor.addEventListener("click", showAtCaret);
  editor.addEventListener("touchend", () => setTimeout(showAtCaret, 0), {passive:true});
  editor.addEventListener("keydown", event => {
    if (event.key === "F1") { event.preventDefault(); showAtCaret(); }
    if (event.key === "Escape" && codeHelpPinned) hideCodeHelp();
  });
  return editor;
}

document.addEventListener("click", event => {
  if (!codeHelpPinned) return;
  if (codeHelpPopup && codeHelpPopup.contains(event.target)) return;
  if (event.target.closest && event.target.closest(".code-help-token")) return;
  if (event.target.matches && event.target.matches("textarea.editor")) return;
  hideCodeHelp();
});
window.addEventListener("resize", () => { if (codeHelpPopup && !codeHelpPopup.hidden) hideCodeHelp(); });
window.addEventListener("scroll", () => { if (codeHelpPopup && !codeHelpPopup.hidden && !codeHelpPinned) hideCodeHelp(); }, true);
