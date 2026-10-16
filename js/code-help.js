// code-help.js — aide contextuelle façon VS Code pour les notions de code.
// Desktop : survol/focus d'un token dans les exemples. Mobile : tap pour épingler.
// Dans les éditeurs textarea : survol desktop, clic/tap mobile et F1 affichent l'aide du token courant.

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

// Extensions communes : ces entrées complètent le dictionnaire initial afin que
// les notions avancées restent expliquées dans tous les parcours.
Object.assign(CODE_HELP, {
  // HTML — structure, formulaires, média et accessibilité
  DOCTYPE:{title:"<!DOCTYPE html>",kind:"HTML",description:"Déclaration placée au début d'un document pour demander au navigateur le mode HTML moderne.",example:"<!DOCTYPE html>"},
  title:{title:"<title>",kind:"HTML",description:"Définit le titre du document affiché notamment dans l'onglet du navigateur.",example:"<title>Mon site</title>"},
  meta:{title:"<meta>",kind:"HTML",description:"Fournit une métadonnée du document, par exemple l'encodage ou le viewport responsive.",example:'<meta name="viewport" content="width=device-width, initial-scale=1">'},
  link:{title:"<link>",kind:"HTML",description:"Relie le document à une ressource externe, très souvent une feuille de style CSS.",example:'<link rel="stylesheet" href="style.css">'},
  script:{title:"<script>",kind:"HTML",description:"Charge ou contient du JavaScript. L'attribut src permet de charger un fichier externe.",example:'<script src="app.js"></script>'},
  a:{title:"<a>",kind:"HTML",description:"Crée un lien vers une autre ressource ou une autre partie de la page.",example:'<a href="/cours">Cours</a>'},
  p:{title:"<p>",kind:"HTML",description:"Représente un paragraphe de texte.",example:"<p>Un paragraphe.</p>"},
  h1:{title:"<h1>",kind:"HTML",description:"Titre principal du contenu. Il décrit généralement le sujet central de la page.",example:"<h1>Titre principal</h1>"},
  h2:{title:"<h2>",kind:"HTML",description:"Titre de niveau 2 utilisé pour structurer une grande section sous le h1.",example:"<h2>Une section</h2>"},
  h3:{title:"<h3>",kind:"HTML",description:"Titre de niveau 3, utilisé pour une sous-section d'un h2.",example:"<h3>Sous-section</h3>"},
  ul:{title:"<ul>",kind:"HTML",description:"Liste non ordonnée : l'ordre des éléments n'a pas de signification particulière.",example:"<ul><li>Un</li><li>Deux</li></ul>"},
  ol:{title:"<ol>",kind:"HTML",description:"Liste ordonnée : l'ordre des éléments a une importance.",example:"<ol><li>Étape 1</li><li>Étape 2</li></ol>"},
  li:{title:"<li>",kind:"HTML",description:"Élément d'une liste ul ou ol.",example:"<li>Élément</li>"},
  strong:{title:"<strong>",kind:"HTML",description:"Signale une forte importance sémantique ; le navigateur l'affiche souvent en gras.",example:"<strong>Important</strong>"},
  em:{title:"<em>",kind:"HTML",description:"Marque une emphase sémantique ; le navigateur l'affiche souvent en italique.",example:"<em>À retenir</em>"},
  figure:{title:"<figure>",kind:"HTML",description:"Regroupe un contenu autonome comme une image avec sa légende.",example:"<figure>…<figcaption>Légende</figcaption></figure>"},
  figcaption:{title:"<figcaption>",kind:"HTML",description:"Fournit la légende d'un élément figure.",example:"<figcaption>Vue du projet</figcaption>"},
  table:{title:"<table>",kind:"HTML",description:"Représente des données tabulaires organisées en lignes et colonnes.",example:"<table>…</table>"},
  thead:{title:"<thead>",kind:"HTML",description:"Regroupe les lignes d'en-tête d'un tableau.",example:"<thead><tr><th>Nom</th></tr></thead>"},
  tbody:{title:"<tbody>",kind:"HTML",description:"Regroupe les lignes principales de données d'un tableau.",example:"<tbody>…</tbody>"},
  tr:{title:"<tr>",kind:"HTML",description:"Représente une ligne de tableau.",example:"<tr><td>Ada</td></tr>"},
  th:{title:"<th>",kind:"HTML",description:"Cellule d'en-tête d'un tableau. scope aide à préciser ce qu'elle décrit.",example:'<th scope="col">Nom</th>'},
  td:{title:"<td>",kind:"HTML",description:"Cellule de données d'un tableau.",example:"<td>Ada</td>"},
  textarea:{title:"<textarea>",kind:"HTML",description:"Champ de formulaire destiné à la saisie de texte sur plusieurs lignes.",example:'<textarea name="bio" rows="5"></textarea>'},
  select:{title:"<select>",kind:"HTML",description:"Champ proposant une liste de choix définis avec des éléments option.",example:'<select name="city">…</select>'},
  option:{title:"<option>",kind:"HTML",description:"Choix disponible dans un élément select.",example:'<option value="paris">Paris</option>'},
  fieldset:{title:"<fieldset>",kind:"HTML",description:"Regroupe logiquement plusieurs contrôles d'un formulaire.",example:"<fieldset>…</fieldset>"},
  legend:{title:"<legend>",kind:"HTML",description:"Titre accessible d'un groupe fieldset.",example:"<legend>Coordonnées</legend>"},
  details:{title:"<details>",kind:"HTML",description:"Crée un bloc natif pouvant être ouvert et fermé.",example:"<details><summary>Aide</summary>…</details>"},
  summary:{title:"<summary>",kind:"HTML",description:"Libellé cliquable d'un élément details.",example:"<summary>Voir plus</summary>"},
  dialog:{title:"<dialog>",kind:"HTML",description:"Élément natif pour afficher une boîte de dialogue ou une modale.",example:'<dialog id="confirm">…</dialog>'},
  video:{title:"<video>",kind:"HTML",description:"Intègre une vidéo avec des sources et contrôles optionnels.",example:'<video controls src="demo.mp4"></video>'},
  audio:{title:"<audio>",kind:"HTML",description:"Intègre un contenu audio.",example:'<audio controls src="audio.mp3"></audio>'},
  source:{title:"<source>",kind:"HTML",description:"Déclare une source média alternative pour video, audio ou picture.",example:'<source src="film.webm" type="video/webm">'},
  iframe:{title:"<iframe>",kind:"HTML",description:"Intègre une autre page dans le document. Utilise-le avec prudence et des restrictions adaptées.",example:'<iframe src="/preview" title="Aperçu"></iframe>'},
  class:{title:"class",kind:"HTML / JSX",description:"Associe un élément à une ou plusieurs classes. En JSX, la propriété équivalente est className.",example:'<article class="card">…</article>'},
  id:{title:"id",kind:"HTML",description:"Identifiant unique d'un élément dans le document.",example:'<main id="app">…</main>'},
  lang:{title:"lang",kind:"HTML",description:"Indique la langue d'un document ou d'un élément, utile notamment pour l'accessibilité.",example:'<html lang="fr">'},
  src:{title:"src",kind:"HTML",description:"Adresse de la ressource à charger, par exemple pour une image ou un script.",example:'<img src="avatar.png" alt="Portrait">'},
  name:{title:"name",kind:"HTML",description:"Nom utilisé lors de la soumission d'un contrôle de formulaire.",example:'<input name="email" type="email">'},
  value:{title:"value",kind:"HTML / DOM",description:"Valeur d'un contrôle de formulaire ou valeur associée à une option.",example:'<option value="fr">France</option>'},
  required:{title:"required",kind:"HTML",description:"Indique qu'un champ doit être rempli avant la soumission du formulaire.",example:'<input name="email" required>'},
  placeholder:{title:"placeholder",kind:"HTML",description:"Affiche un exemple ou une indication temporaire dans un champ vide. Ce n'est pas un remplacement de label.",example:'<input placeholder="nom@example.com">'},
  defer:{title:"defer",kind:"HTML",description:"Demande d'exécuter un script externe après l'analyse du document HTML, sans bloquer son parsing.",example:'<script src="app.js" defer></script>'},
  "aria-label":{title:"aria-label",kind:"Accessibilité",description:"Fournit un nom accessible lorsqu'aucun texte visible approprié ne peut jouer ce rôle.",example:'<button aria-label="Fermer">×</button>'},
  role:{title:"role",kind:"Accessibilité",description:"Précise un rôle d'interface aux technologies d'assistance lorsque la sémantique native ne suffit pas.",example:'<div role="status">Chargement…</div>'},

  // CSS — propriétés et concepts très fréquents dans les cinq niveaux
  height:{title:"height",kind:"CSS",description:"Définit la hauteur d'un élément.",example:"height: 100px;"},
  "min-width":{title:"min-width",kind:"CSS",description:"Fixe la largeur minimale qu'un élément peut prendre.",example:"min-width: 12rem;"},
  "max-width":{title:"max-width",kind:"CSS",description:"Limite la largeur maximale d'un élément.",example:"max-width: 70rem;"},
  "min-height":{title:"min-height",kind:"CSS",description:"Fixe une hauteur minimale.",example:"min-height: 100vh;"},
  "max-height":{title:"max-height",kind:"CSS",description:"Limite la hauteur maximale d'un élément.",example:"max-height: 20rem;"},
  background:{title:"background",kind:"CSS",description:"Propriété raccourcie pour définir l'arrière-plan : couleur, image, position, taille, etc.",example:"background: #111827;"},
  "background-color":{title:"background-color",kind:"CSS",description:"Définit la couleur d'arrière-plan.",example:"background-color: #111827;"},
  border:{title:"border",kind:"CSS",description:"Propriété raccourcie pour la bordure : épaisseur, style et couleur.",example:"border: 1px solid #ccc;"},
  "border-radius":{title:"border-radius",kind:"CSS",description:"Arrondit les coins d'une boîte.",example:"border-radius: 12px;"},
  "box-shadow":{title:"box-shadow",kind:"CSS",description:"Ajoute une ou plusieurs ombres autour d'une boîte.",example:"box-shadow: 0 10px 30px rgba(0,0,0,.2);"},
  "font-size":{title:"font-size",kind:"CSS",description:"Définit la taille du texte.",example:"font-size: 1rem;"},
  "font-weight":{title:"font-weight",kind:"CSS",description:"Définit l'épaisseur visuelle des caractères.",example:"font-weight: 700;"},
  "font-family":{title:"font-family",kind:"CSS",description:"Définit la famille de polices utilisée.",example:'font-family: system-ui, sans-serif;'},
  "line-height":{title:"line-height",kind:"CSS",description:"Contrôle la hauteur de ligne et donc l'espacement vertical du texte.",example:"line-height: 1.6;"},
  "text-align":{title:"text-align",kind:"CSS",description:"Aligne le contenu textuel horizontalement.",example:"text-align: center;"},
  "text-decoration":{title:"text-decoration",kind:"CSS",description:"Ajoute ou configure une décoration de texte comme le soulignement.",example:"text-decoration: none;"},
  opacity:{title:"opacity",kind:"CSS",description:"Définit l'opacité globale d'un élément, de 0 à 1.",example:"opacity: .7;"},
  overflow:{title:"overflow",kind:"CSS",description:"Détermine quoi faire du contenu qui dépasse la boîte : visible, hidden, auto, scroll…",example:"overflow: auto;"},
  transform:{title:"transform",kind:"CSS",description:"Applique une transformation visuelle comme translate, rotate ou scale.",example:"transform: translateY(-2px);"},
  transition:{title:"transition",kind:"CSS",description:"Anime progressivement le changement d'une ou plusieurs propriétés CSS.",example:"transition: transform .2s ease;"},
  animation:{title:"animation",kind:"CSS",description:"Applique une animation définie avec @keyframes.",example:"animation: fade .3s ease;"},
  "@keyframes":{title:"@keyframes",kind:"CSS",description:"Définit les étapes d'une animation CSS.",example:"@keyframes fade { from { opacity: 0 } to { opacity: 1 } }"},
  "align-items":{title:"align-items",kind:"CSS",description:"Aligne les éléments sur l'axe transversal d'un conteneur flex ou grid.",example:"align-items: center;"},
  "justify-content":{title:"justify-content",kind:"CSS",description:"Répartit les éléments sur l'axe principal d'un conteneur flex ou grid.",example:"justify-content: space-between;"},
  "flex-direction":{title:"flex-direction",kind:"CSS",description:"Choisit l'axe principal d'un conteneur flex : row, column, etc.",example:"flex-direction: column;"},
  "flex-wrap":{title:"flex-wrap",kind:"CSS",description:"Autorise ou non les éléments flex à passer sur plusieurs lignes.",example:"flex-wrap: wrap;"},
  "grid-template-columns":{title:"grid-template-columns",kind:"CSS",description:"Définit les colonnes explicites d'une grille CSS.",example:"grid-template-columns: repeat(3, 1fr);"},
  "grid-template-rows":{title:"grid-template-rows",kind:"CSS",description:"Définit les lignes explicites d'une grille CSS.",example:"grid-template-rows: auto 1fr;"},
  "grid-column":{title:"grid-column",kind:"CSS",description:"Détermine les colonnes occupées par un élément de grille.",example:"grid-column: 1 / -1;"},
  "grid-row":{title:"grid-row",kind:"CSS",description:"Détermine les lignes occupées par un élément de grille.",example:"grid-row: 1 / 3;"},
  repeat:{title:"repeat()",kind:"CSS",description:"Fonction Grid qui répète une définition de piste.",example:"grid-template-columns: repeat(3, 1fr);"},
  minmax:{title:"minmax()",kind:"CSS",description:"Définit une taille de piste comprise entre un minimum et un maximum.",example:"grid-template-columns: minmax(12rem, 1fr) 2fr;"},
  calc:{title:"calc()",kind:"CSS",description:"Calcule une valeur CSS en combinant plusieurs unités.",example:"width: calc(100% - 2rem);"},
  "@supports":{title:"@supports",kind:"CSS",description:"Applique des règles uniquement si le navigateur prend en charge une fonctionnalité CSS.",example:"@supports (display: grid) { … }"},
  "@container":{title:"@container",kind:"CSS",description:"Applique des styles selon les dimensions d'un conteneur plutôt que du viewport.",example:"@container (min-width: 40rem) { … }"},
  hover:{title:":hover",kind:"CSS",description:"Pseudo-classe active lorsque le pointeur survole l'élément.",example:"button:hover { transform: translateY(-1px); }"},
  focus:{title:":focus",kind:"CSS",description:"Pseudo-classe active lorsqu'un élément possède le focus.",example:"input:focus { outline: 2px solid blue; }"},
  "focus-visible":{title:":focus-visible",kind:"CSS",description:"Cible le focus lorsqu'un indicateur visuel est pertinent, notamment au clavier.",example:"button:focus-visible { outline: 2px solid currentColor; }"},

  // JavaScript / DOM / Web APIs
  var:{title:"var",kind:"JavaScript",description:"Ancienne forme de déclaration de variable, à portée de fonction. let et const sont généralement préférés aujourd'hui.",example:"var total = 0;"},
  if:{title:"if",kind:"JavaScript",description:"Exécute un bloc uniquement si une condition est vraie.",example:"if (score >= 10) { … }"},
  else:{title:"else",kind:"JavaScript",description:"Définit le bloc exécuté lorsque la condition du if associé est fausse.",example:"if (ok) { … } else { … }"},
  switch:{title:"switch",kind:"JavaScript",description:"Compare une expression à plusieurs cas possibles.",example:"switch (status) { case 'ready': … }"},
  case:{title:"case",kind:"JavaScript",description:"Déclare une branche d'un switch.",example:"case 'ready': break;"},
  for:{title:"for",kind:"JavaScript",description:"Boucle contrôlée par une initialisation, une condition et une mise à jour.",example:"for (let i = 0; i < 3; i++) { … }"},
  while:{title:"while",kind:"JavaScript",description:"Répète un bloc tant qu'une condition reste vraie.",example:"while (count < 3) { count++; }"},
  break:{title:"break",kind:"JavaScript",description:"Interrompt immédiatement une boucle ou un switch.",example:"if (done) break;"},
  continue:{title:"continue",kind:"JavaScript",description:"Passe directement à l'itération suivante d'une boucle.",example:"if (!item) continue;"},
  throw:{title:"throw",kind:"JavaScript",description:"Lève explicitement une erreur ou une autre valeur.",example:'throw new Error("Message");'},
  finally:{title:"finally",kind:"JavaScript",description:"Bloc exécuté après try/catch, qu'une erreur ait eu lieu ou non.",example:"try { … } finally { cleanup(); }"},
  new:{title:"new",kind:"JavaScript",description:"Crée une instance à partir d'un constructeur ou d'une classe.",example:"const error = new Error('Oups');"},
  className:{title:"className",kind:"DOM / React",description:"Nom de classe CSS d'un élément DOM ; en JSX, remplace l'attribut HTML class.",example:'<div className="card" />'},
  length:{title:"length",kind:"JavaScript",description:"Nombre d'éléments d'un tableau ou nombre d'unités d'une chaîne.",example:"items.length"},
  push:{title:"push()",kind:"JavaScript",description:"Ajoute un ou plusieurs éléments à la fin d'un tableau et retourne sa nouvelle longueur.",example:"items.push(value);"},
  pop:{title:"pop()",kind:"JavaScript",description:"Retire et retourne le dernier élément d'un tableau.",example:"const last = items.pop();"},
  slice:{title:"slice()",kind:"JavaScript",description:"Retourne une copie d'une portion de tableau ou de chaîne sans modifier l'original.",example:"items.slice(0, 3)"},
  splice:{title:"splice()",kind:"JavaScript",description:"Ajoute, retire ou remplace des éléments dans un tableau en le modifiant.",example:"items.splice(1, 1);"},
  includes:{title:"includes()",kind:"JavaScript",description:"Indique si une chaîne ou un tableau contient une valeur donnée.",example:"items.includes('Ada')"},
  indexOf:{title:"indexOf()",kind:"JavaScript",description:"Retourne la position d'une valeur, ou -1 si elle n'est pas trouvée.",example:"items.indexOf('Ada')"},
  forEach:{title:"forEach()",kind:"JavaScript",description:"Exécute une fonction pour chaque élément d'un tableau sans créer de nouveau tableau.",example:"items.forEach(item => console.log(item));"},
  reduce:{title:"reduce()",kind:"JavaScript",description:"Réduit un tableau à une seule valeur en accumulant les résultats.",example:"items.reduce((sum, n) => sum + n, 0)"},
  some:{title:"some()",kind:"JavaScript",description:"Renvoie true si au moins un élément satisfait le test.",example:"items.some(item => item.active)"},
  every:{title:"every()",kind:"JavaScript",description:"Renvoie true si tous les éléments satisfont le test.",example:"items.every(item => item.valid)"},
  sort:{title:"sort()",kind:"JavaScript",description:"Trie les éléments d'un tableau. Sans comparateur, le tri est lexicographique.",example:"numbers.sort((a, b) => a - b);"},
  join:{title:"join()",kind:"JavaScript",description:"Assemble les éléments d'un tableau dans une chaîne avec un séparateur.",example:"items.join(', ')"},
  split:{title:"split()",kind:"JavaScript",description:"Découpe une chaîne en tableau selon un séparateur.",example:"text.split(',')"},
  trim:{title:"trim()",kind:"JavaScript",description:"Retire les espaces au début et à la fin d'une chaîne.",example:"name.trim()"},
  replace:{title:"replace()",kind:"JavaScript",description:"Remplace une occurrence ou un motif dans une chaîne.",example:"text.replace('a', 'b')"},
  toUpperCase:{title:"toUpperCase()",kind:"JavaScript",description:"Retourne la chaîne convertie en majuscules.",example:"name.toUpperCase()"},
  toLowerCase:{title:"toLowerCase()",kind:"JavaScript",description:"Retourne la chaîne convertie en minuscules.",example:"name.toLowerCase()"},
  Object:{title:"Object",kind:"JavaScript",description:"Objet global et constructeur lié aux objets JavaScript.",example:"Object.keys(user)"},
  "Object.keys":{title:"Object.keys()",kind:"JavaScript",description:"Retourne un tableau contenant les clés énumérables propres d'un objet.",example:"Object.keys(user)"},
  "Object.values":{title:"Object.values()",kind:"JavaScript",description:"Retourne un tableau contenant les valeurs énumérables propres d'un objet.",example:"Object.values(user)"},
  "Object.entries":{title:"Object.entries()",kind:"JavaScript",description:"Retourne les paires [clé, valeur] énumérables propres d'un objet.",example:"Object.entries(user)"},
  Math:{title:"Math",kind:"JavaScript",description:"Objet global regroupant des constantes et fonctions mathématiques.",example:"Math.round(4.6)"},
  "Math.round":{title:"Math.round()",kind:"JavaScript",description:"Arrondit au nombre entier le plus proche.",example:"Math.round(4.6) // 5"},
  "Math.floor":{title:"Math.floor()",kind:"JavaScript",description:"Arrondit vers l'entier inférieur.",example:"Math.floor(4.9) // 4"},
  "Math.random":{title:"Math.random()",kind:"JavaScript",description:"Retourne un nombre pseudo-aléatoire entre 0 inclus et 1 exclu.",example:"Math.random()"},
  Number:{title:"Number",kind:"JavaScript",description:"Convertit une valeur en nombre ou représente le type Number.",example:'const n = Number("42");'},
  String:{title:"String",kind:"JavaScript",description:"Convertit une valeur en chaîne de caractères ou représente le type String.",example:"String(42)"},
  Boolean:{title:"Boolean",kind:"JavaScript",description:"Convertit une valeur en booléen selon les règles truthy/falsy.",example:"Boolean(value)"},
  setTimeout:{title:"setTimeout()",kind:"Web API",description:"Planifie l'exécution d'une fonction après un délai minimal.",example:"setTimeout(() => console.log('go'), 1000);"},
  setInterval:{title:"setInterval()",kind:"Web API",description:"Répète une fonction à intervalles réguliers jusqu'à annulation.",example:"const id = setInterval(tick, 1000);"},
  clearInterval:{title:"clearInterval()",kind:"Web API",description:"Arrête un intervalle créé par setInterval.",example:"clearInterval(id);"},
  preventDefault:{title:"preventDefault()",kind:"DOM",description:"Empêche le comportement par défaut associé à un événement lorsqu'il est annulable.",example:"event.preventDefault();"},
  getElementById:{title:"getElementById()",kind:"DOM",description:"Retourne l'élément dont l'id correspond exactement à la valeur demandée.",example:'document.getElementById("app")'},
  querySelectorAll:{title:"querySelectorAll()",kind:"DOM",description:"Retourne tous les éléments correspondant à un sélecteur CSS sous forme de NodeList.",example:'document.querySelectorAll(".card")'},
  createElement:{title:"createElement()",kind:"DOM",description:"Crée un nouvel élément HTML en mémoire.",example:'document.createElement("li")'},
  append:{title:"append()",kind:"DOM",description:"Ajoute un ou plusieurs nœuds ou textes à la fin d'un élément.",example:"list.append(item);"},
  appendChild:{title:"appendChild()",kind:"DOM",description:"Ajoute un nœud enfant à la fin d'un parent.",example:"list.appendChild(item);"},
  remove:{title:"remove()",kind:"DOM",description:"Retire l'élément du document.",example:"element.remove();"},
  classList:{title:"classList",kind:"DOM",description:"Interface permettant d'ajouter, retirer, tester ou basculer des classes CSS.",example:'element.classList.toggle("open")'},
  textContent:{title:"textContent",kind:"DOM",description:"Lit ou remplace le contenu textuel d'un nœud sans interpréter de HTML.",example:'title.textContent = "Bonjour";'},
  innerHTML:{title:"innerHTML",kind:"DOM",description:"Lit ou remplace le HTML interne d'un élément. À utiliser avec prudence avec des données utilisateur.",example:'box.innerHTML = "<strong>OK</strong>";'},
  localStorage:{title:"localStorage",kind:"Web API",description:"Stockage clé/valeur persistant dans le navigateur pour une même origine.",example:'localStorage.setItem("theme", "dark");'},
  "localStorage.setItem":{title:"localStorage.setItem()",kind:"Web API",description:"Enregistre une valeur texte sous une clé dans localStorage.",example:'localStorage.setItem("theme", "dark");'},
  "localStorage.getItem":{title:"localStorage.getItem()",kind:"Web API",description:"Lit la valeur texte associée à une clé dans localStorage.",example:'const theme = localStorage.getItem("theme");'},

  // TypeScript
  string:{title:"string",kind:"TypeScript",description:"Type des chaînes de caractères.",example:"let name: string = 'Ada';"},
  number:{title:"number",kind:"TypeScript",description:"Type des nombres JavaScript, entiers comme décimaux.",example:"let age: number = 28;"},
  boolean:{title:"boolean",kind:"TypeScript",description:"Type des valeurs true et false.",example:"let active: boolean = true;"},
  any:{title:"any",kind:"TypeScript",description:"Désactive pratiquement le contrôle de type pour la valeur concernée. À limiter fortement.",example:"let value: any;"},
  void:{title:"void",kind:"TypeScript",description:"Type utilisé notamment pour une fonction qui ne renvoie aucune valeur utile.",example:"function log(): void { … }"},
  enum:{title:"enum",kind:"TypeScript",description:"Déclare un ensemble de constantes nommées. Les unions littérales sont souvent une alternative plus légère.",example:"enum Role { Admin, User }"},
  extends:{title:"extends",kind:"TypeScript / JS",description:"Étend une classe ou contraint/compose certains types génériques selon le contexte.",example:"interface Admin extends User { role: 'admin' }"},
  implements:{title:"implements",kind:"TypeScript",description:"Demande à une classe de respecter la forme définie par une interface ou un type compatible.",example:"class UserService implements Service { … }"},
  as:{title:"as",kind:"TypeScript",description:"Assertion de type : indique au compilateur comment considérer une valeur, sans validation runtime.",example:"const input = el as HTMLInputElement;"},
  Record:{title:"Record<K, V>",kind:"TypeScript",description:"Type utilitaire représentant un objet dont les clés K pointent vers des valeurs V.",example:"type Scores = Record<string, number>;"},
  Partial:{title:"Partial<T>",kind:"TypeScript",description:"Rend optionnelles toutes les propriétés d'un type T.",example:"type UserPatch = Partial<User>;"},
  Pick:{title:"Pick<T, K>",kind:"TypeScript",description:"Construit un type en ne conservant que certaines propriétés de T.",example:'type UserName = Pick<User, "name">;'},
  Omit:{title:"Omit<T, K>",kind:"TypeScript",description:"Construit un type en retirant certaines propriétés de T.",example:'type NewUser = Omit<User, "id">;'},
  Required:{title:"Required<T>",kind:"TypeScript",description:"Rend obligatoires toutes les propriétés de T.",example:"type Complete = Required<Options>;"},
  ReturnType:{title:"ReturnType<T>",kind:"TypeScript",description:"Extrait le type de retour d'un type de fonction.",example:"type Result = ReturnType<typeof build>;"},
  generic:{title:"générique <T>",kind:"TypeScript",description:"Un paramètre de type permet d'écrire du code réutilisable tout en conservant l'information de type.",example:"function first<T>(items: T[]): T | undefined { … }"},

  // React / JSX / Vite
  createRoot:{title:"createRoot()",kind:"React",description:"Crée une racine React associée à un élément DOM afin d'y rendre l'application.",example:'createRoot(document.getElementById("root")).render(<App />);'},
  StrictMode:{title:"<StrictMode>",kind:"React",description:"Outil de développement React qui aide à détecter certains effets de bord et usages problématiques.",example:"<StrictMode><App /></StrictMode>"},
  render:{title:"render()",kind:"React / DOM",description:"Selon le contexte, déclenche le rendu d'une interface ou d'une racine React.",example:"root.render(<App />);"},
  useMemo:{title:"useMemo()",kind:"React",description:"Mémorise le résultat d'un calcul entre les rendus tant que ses dépendances ne changent pas.",example:"const total = useMemo(() => compute(items), [items]);"},
  useCallback:{title:"useCallback()",kind:"React",description:"Mémorise une fonction entre les rendus selon une liste de dépendances.",example:"const onSave = useCallback(() => save(id), [id]);"},
  useRef:{title:"useRef()",kind:"React",description:"Conserve une valeur mutable entre les rendus sans provoquer de nouveau rendu et peut référencer un élément DOM.",example:"const inputRef = useRef(null);"},
  useContext:{title:"useContext()",kind:"React",description:"Lit la valeur du Context React le plus proche pour un contexte donné.",example:"const theme = useContext(ThemeContext);"},
  createContext:{title:"createContext()",kind:"React",description:"Crée un objet Context pour partager une valeur dans un sous-arbre React.",example:"const ThemeContext = createContext('light');"},
  memo:{title:"memo()",kind:"React",description:"Évite certains rerenders d'un composant lorsque ses props n'ont pas changé.",example:"export default memo(Card);"},
  lazy:{title:"lazy()",kind:"React",description:"Charge un composant React de manière différée à partir d'un import dynamique.",example:"const Page = lazy(() => import('./Page.jsx'));"},
  Suspense:{title:"<Suspense>",kind:"React",description:"Affiche un fallback pendant qu'un contenu compatible, comme un composant lazy, est en attente.",example:"<Suspense fallback={<p>Chargement…</p>}><Page /></Suspense>"},
  onClick:{title:"onClick",kind:"React / JSX",description:"Prop d'événement appelée lorsqu'un élément reçoit un clic.",example:'<button onClick={handleClick}>OK</button>'},
  onChange:{title:"onChange",kind:"React / JSX",description:"Prop d'événement appelée lorsqu'une valeur de formulaire change.",example:'<input value={name} onChange={e => setName(e.target.value)} />'},
  key:{title:"key",kind:"React",description:"Identifiant stable utilisé par React pour reconnaître les éléments d'une liste entre deux rendus.",example:"items.map(item => <Row key={item.id} />)"},
  npm:{title:"npm",kind:"Node.js / Vite",description:"Gestionnaire de paquets fourni avec Node.js. Il installe les dépendances et exécute les scripts package.json.",example:"npm run dev"},
  Vite:{title:"Vite",kind:"Vite",description:"Outil de développement et de build utilisé notamment pour démarrer rapidement des projets frontend modernes.",example:"npm create vite@latest"},

  // Node.js
  "process.exitCode":{title:"process.exitCode",kind:"Node.js",description:"Définit le code de sortie que Node.js utilisera lorsque le processus se terminera naturellement.",example:"process.exitCode = 1;"},
  "process.on":{title:"process.on()",kind:"Node.js",description:"Écoute un événement du processus, par exemple SIGTERM pour déclencher un arrêt propre.",example:"process.on('SIGTERM', shutdown);"},
  dirname:{title:"dirname()",kind:"Node.js · node:path",description:"Retourne le dossier parent d'un chemin.",example:"path.dirname('/a/b/file.txt')"},
  basename:{title:"basename()",kind:"Node.js · node:path",description:"Retourne la dernière partie d'un chemin.",example:"path.basename('/a/b/file.txt')"},
  extname:{title:"extname()",kind:"Node.js · node:path",description:"Retourne l'extension finale d'un chemin.",example:"path.extname('file.json')"},
  mkdir:{title:"mkdir()",kind:"Node.js · fs",description:"Crée un dossier. Avec recursive:true, les parents manquants peuvent aussi être créés.",example:"await mkdir('data', { recursive: true });"},
  readdir:{title:"readdir()",kind:"Node.js · fs",description:"Lit le contenu d'un dossier.",example:"const files = await readdir('data');"},
  unlink:{title:"unlink()",kind:"Node.js · fs",description:"Supprime un fichier.",example:"await unlink('temp.txt');"},
  stat:{title:"stat()",kind:"Node.js · fs",description:"Retourne des informations sur un fichier ou un dossier.",example:"const info = await stat('data.json');"},
  createWriteStream:{title:"createWriteStream()",kind:"Node.js",description:"Crée un flux d'écriture vers un fichier.",example:"const out = createWriteStream('copy.txt');"},
  pipe:{title:"pipe()",kind:"Node.js · Streams",description:"Relie un flux lisible à un flux inscriptible en gérant le flux de données.",example:"readable.pipe(writable);"},
  pipeline:{title:"pipeline()",kind:"Node.js · Streams",description:"Assemble plusieurs streams et centralise la gestion de fin et d'erreur.",example:"await pipeline(source, transform, destination);"},
  setImmediate:{title:"setImmediate()",kind:"Node.js",description:"Planifie un callback dans la phase check de l'event loop Node.js.",example:"setImmediate(() => console.log('check'));"},
  queueMicrotask:{title:"queueMicrotask()",kind:"JavaScript",description:"Ajoute une fonction à la file des microtâches, exécutée avant la prochaine tâche classique.",example:"queueMicrotask(() => console.log('microtask'));"},
  EventEmitter:{title:"EventEmitter",kind:"Node.js",description:"Classe centrale du modèle événementiel Node.js pour émettre et écouter des événements.",example:"const emitter = new EventEmitter();"},
  test:{title:"test()",kind:"Node.js · node:test",description:"Déclare un test avec le runner natif node:test.",example:"test('addition', () => { … });"},
  assert:{title:"assert",kind:"Node.js · assertions",description:"API d'assertion utilisée pour vérifier qu'un comportement respecte le résultat attendu.",example:"assert.equal(actual, expected);"},
  "assert.equal":{title:"assert.equal()",kind:"Node.js",description:"Vérifie une égalité avec l'API assert native.",example:"assert.equal(sum(2, 3), 5);"},
  URL:{title:"URL",kind:"JavaScript / Node.js",description:"Classe standard pour analyser et construire des URL de manière fiable.",example:"const url = new URL(req.url, 'http://localhost');"},
  URLSearchParams:{title:"URLSearchParams",kind:"JavaScript / Node.js",description:"API standard pour lire et construire les paramètres de requête d'une URL.",example:"new URLSearchParams({ page: '2' })"},
  SIGINT:{title:"SIGINT",kind:"Node.js",description:"Signal souvent envoyé lorsqu'un utilisateur interrompt un processus avec Ctrl+C.",example:"process.on('SIGINT', shutdown);"},
  SIGTERM:{title:"SIGTERM",kind:"Node.js",description:"Signal courant demandé par un système ou un orchestrateur pour arrêter proprement un processus.",example:"process.on('SIGTERM', shutdown);"},

  // SQL / SQLite
  INNER:{title:"INNER JOIN",kind:"SQL",description:"Ne conserve que les lignes qui trouvent une correspondance selon la condition ON.",example:"FROM users u INNER JOIN orders o ON o.user_id = u.id"},
  RIGHT:{title:"RIGHT JOIN",kind:"SQL",description:"Conserve toutes les lignes de la table de droite et les correspondances de gauche. Le support dépend du moteur SQL.",example:"A RIGHT JOIN B ON …"},
  FULL:{title:"FULL JOIN",kind:"SQL",description:"Conserve les lignes des deux côtés, correspondantes ou non. Le support dépend du dialecte.",example:"A FULL JOIN B ON …"},
  CROSS:{title:"CROSS JOIN",kind:"SQL",description:"Produit le produit cartésien des deux ensembles de lignes.",example:"FROM colors CROSS JOIN sizes"},
  UNION:{title:"UNION",kind:"SQL",description:"Combine les résultats de deux SELECT compatibles en supprimant les doublons.",example:"SELECT city FROM a UNION SELECT city FROM b;"},
  ALL:{title:"ALL",kind:"SQL",description:"Modificateur signifiant généralement qu'il faut conserver toutes les lignes, y compris les doublons dans UNION ALL.",example:"UNION ALL"},
  EXISTS:{title:"EXISTS",kind:"SQL",description:"Teste si une sous-requête retourne au moins une ligne.",example:"WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)"},
  NOT:{title:"NOT",kind:"SQL",description:"Inverse une condition SQL ou complète certaines expressions comme NOT NULL / NOT EXISTS.",example:"WHERE NOT active"},
  IS:{title:"IS",kind:"SQL",description:"Opérateur utilisé notamment avec NULL : IS NULL et IS NOT NULL.",example:"WHERE deleted_at IS NULL"},
  ASC:{title:"ASC",kind:"SQL",description:"Demande un tri croissant dans ORDER BY. C'est souvent la direction par défaut.",example:"ORDER BY name ASC"},
  DESC:{title:"DESC",kind:"SQL",description:"Demande un tri décroissant dans ORDER BY.",example:"ORDER BY total DESC"},
  ELSE:{title:"ELSE",kind:"SQL",description:"Valeur de repli d'une expression CASE lorsqu'aucun WHEN n'est vrai.",example:"CASE WHEN total > 100 THEN 'VIP' ELSE 'Standard' END"},
  END:{title:"END",kind:"SQL",description:"Termine une expression CASE.",example:"CASE WHEN active = 1 THEN 'Oui' ELSE 'Non' END"},
  INTEGER:{title:"INTEGER",kind:"SQLite",description:"Type d'affinité SQLite destiné aux valeurs entières.",example:"id INTEGER PRIMARY KEY"},
  TEXT:{title:"TEXT",kind:"SQLite",description:"Type d'affinité SQLite destiné au texte.",example:"name TEXT NOT NULL"},
  REAL:{title:"REAL",kind:"SQLite",description:"Type d'affinité SQLite pour les nombres à virgule flottante.",example:"price REAL"},
  BLOB:{title:"BLOB",kind:"SQLite",description:"Type SQLite pour des données binaires brutes.",example:"payload BLOB"},
  AUTOINCREMENT:{title:"AUTOINCREMENT",kind:"SQLite",description:"Modifie la stratégie d'allocation des identifiants INTEGER PRIMARY KEY. Il n'est pas nécessaire dans la plupart des tables SQLite.",example:"id INTEGER PRIMARY KEY AUTOINCREMENT"},
  PRAGMA:{title:"PRAGMA",kind:"SQLite",description:"Commande SQLite permettant de lire ou modifier des paramètres et métadonnées du moteur.",example:"PRAGMA foreign_keys = ON;"},

  // Compléments transversaux rencontrés dans les exemples réels des cours
  true:{title:"true",kind:"JavaScript / TypeScript",description:"Valeur booléenne représentant vrai.",example:"const active = true;"},
  false:{title:"false",kind:"JavaScript / TypeScript",description:"Valeur booléenne représentant faux.",example:"const active = false;"},
  null:{title:"null",kind:"JavaScript / TypeScript",description:"Valeur explicite représentant l'absence intentionnelle de valeur.",example:"let selected = null;"},
  undefined:{title:"undefined",kind:"JavaScript / TypeScript",description:"Valeur obtenue notamment lorsqu'une variable ou propriété n'a pas encore de valeur définie.",example:"let result; // undefined"},
  typeof:{title:"typeof",kind:"JavaScript / TypeScript",description:"Opérateur qui retourne une chaîne décrivant le type JavaScript d'une valeur.",example:"typeof 42 // 'number'"},
  of:{title:"of",kind:"JavaScript",description:"Utilisé avec for...of pour parcourir directement les valeurs d'un itérable.",example:"for (const item of items) { … }"},
  "event.target":{title:"event.target",kind:"DOM",description:"Élément sur lequel l'événement a été déclenché à l'origine.",example:"event.target.value"},
  disabled:{title:"disabled",kind:"HTML / DOM",description:"État qui désactive un contrôle interactif. En DOM, cette propriété peut être lue ou modifiée.",example:"button.disabled = true;"},
  "console.error":{title:"console.error()",kind:"JavaScript / Node.js",description:"Affiche une erreur dans la console, généralement avec un niveau visuel distinct.",example:"console.error(error.message);"},
  "error.message":{title:"error.message",kind:"JavaScript / Node.js",description:"Message lisible associé à un objet Error.",example:"catch (error) { console.error(error.message); }"},
  "req.method":{title:"req.method",kind:"Node.js · HTTP",description:"Méthode HTTP reçue par le serveur, par exemple GET, POST, PATCH ou DELETE.",example:"if (req.method === 'GET') { … }"},
  "res.statusCode":{title:"res.statusCode",kind:"Node.js · HTTP",description:"Code de statut HTTP qui sera envoyé au client.",example:"res.statusCode = 404;"},
  GET:{title:"GET",kind:"HTTP",description:"Méthode HTTP utilisée pour lire ou récupérer une ressource sans la modifier.",example:"GET /users"},
  POST:{title:"POST",kind:"HTTP",description:"Méthode HTTP généralement utilisée pour créer une ressource ou soumettre des données.",example:"POST /users"},
  PUT:{title:"PUT",kind:"HTTP",description:"Méthode HTTP généralement utilisée pour remplacer complètement une ressource.",example:"PUT /users/1"},
  PATCH:{title:"PATCH",kind:"HTTP",description:"Méthode HTTP généralement utilisée pour modifier partiellement une ressource.",example:"PATCH /users/1"},
  BrowserRouter:{title:"<BrowserRouter>",kind:"React Router",description:"Fournit le contexte de routage basé sur l'historique du navigateur.",example:"<BrowserRouter><App /></BrowserRouter>"},
  Routes:{title:"<Routes>",kind:"React Router",description:"Conteneur React Router qui choisit la Route correspondant à l'URL courante.",example:"<Routes><Route path=\"/\" element={<Home />} /></Routes>"},
  Route:{title:"<Route>",kind:"React Router",description:"Associe un chemin à l'élément React à rendre.",example:'<Route path="/users" element={<Users />} />'},
  onSubmit:{title:"onSubmit",kind:"React / JSX",description:"Gestionnaire appelé lors de la soumission d'un formulaire.",example:"<form onSubmit={handleSubmit}>…</form>"},
  onKeyDown:{title:"onKeyDown",kind:"React / JSX",description:"Gestionnaire React déclenché lorsqu'une touche est enfoncée.",example:"<input onKeyDown={handleKeyDown} />"},
  alert:{title:"alert()",kind:"Web API",description:"Affiche une boîte de dialogue bloquante simple dans le navigateur. À réserver aux démonstrations ou cas très simples.",example:'alert("Bonjour");'},
  top:{title:"top",kind:"CSS",description:"Positionne le bord supérieur d'un élément positionné par rapport à son bloc de référence.",example:"top: 0;"},
  right:{title:"right",kind:"CSS",description:"Positionne le bord droit d'un élément positionné.",example:"right: 1rem;"},
  bottom:{title:"bottom",kind:"CSS",description:"Positionne le bord inférieur d'un élément positionné.",example:"bottom: 0;"},
  left:{title:"left",kind:"CSS",description:"Positionne le bord gauche d'un élément positionné.",example:"left: 1rem;"},
  content:{title:"content",kind:"CSS",description:"Définit le contenu généré par ::before ou ::after.",example:'content: "";'},
  outline:{title:"outline",kind:"CSS",description:"Trace un contour sans modifier la taille de la boîte, souvent utilisé pour rendre le focus visible.",example:"outline: 2px solid currentColor;"},
  "aspect-ratio":{title:"aspect-ratio",kind:"CSS",description:"Définit le rapport largeur/hauteur préféré d'une boîte.",example:"aspect-ratio: 16 / 9;"},
  "object-fit":{title:"object-fit",kind:"CSS",description:"Définit comment une image ou vidéo s'adapte à sa boîte.",example:"object-fit: cover;"},
  "@layer":{title:"@layer",kind:"CSS",description:"Organise la cascade CSS en couches avec un ordre de priorité explicite.",example:"@layer base, components, utilities;"},
  root:{title:":root",kind:"CSS",description:"Pseudo-classe qui cible l'élément racine du document, souvent utilisée pour déclarer des variables CSS globales.",example:":root { --accent: blue; }"},
  before:{title:"::before",kind:"CSS",description:"Pseudo-élément généré avant le contenu réel d'un élément.",example:'button::before { content: ""; }'},
  after:{title:"::after",kind:"CSS",description:"Pseudo-élément généré après le contenu réel d'un élément.",example:'button::after { content: ""; }'},
  charset:{title:"charset",kind:"HTML",description:"Indique l'encodage du document. UTF-8 est le choix standard pour le web moderne.",example:'<meta charset="UTF-8">'},
  rel:{title:"rel",kind:"HTML",description:"Décrit la relation entre le document et une ressource liée.",example:'<link rel="stylesheet" href="style.css">'},
  INTO:{title:"INTO",kind:"SQL",description:"Indique la table cible d'une insertion avec INSERT INTO.",example:"INSERT INTO users (name) VALUES ('Ada');"},
  BY:{title:"BY",kind:"SQL",description:"Complète des clauses comme ORDER BY, GROUP BY ou PARTITION BY en indiquant la ou les expressions utilisées.",example:"ORDER BY total DESC"},
  TABLE:{title:"TABLE",kind:"SQL",description:"Désigne un objet table dans les commandes de définition comme CREATE TABLE ou ALTER TABLE.",example:"CREATE TABLE users (…);"},
  KEY:{title:"KEY",kind:"SQL",description:"Complète PRIMARY KEY ou FOREIGN KEY pour définir une clé relationnelle.",example:"PRIMARY KEY (id)"},
  ADD:{title:"ADD",kind:"SQL",description:"Ajoute un élément de schéma dans une commande ALTER TABLE, par exemple une colonne.",example:"ALTER TABLE users ADD COLUMN role TEXT;"},
  COLUMN:{title:"COLUMN",kind:"SQL",description:"Désigne explicitement une colonne dans certaines commandes de définition ou modification de schéma.",example:"ALTER TABLE users ADD COLUMN role TEXT;"},
  QUERY:{title:"QUERY",kind:"SQLite",description:"Dans EXPLAIN QUERY PLAN, précise que SQLite doit afficher le plan d'exécution de la requête.",example:"EXPLAIN QUERY PLAN SELECT …;"},
  PLAN:{title:"PLAN",kind:"SQLite",description:"Dans EXPLAIN QUERY PLAN, désigne le plan d'accès choisi par SQLite.",example:"EXPLAIN QUERY PLAN SELECT …;"},

  // Compléments CSS/HTML repérés dans les cours avancés
  "contain-intrinsic-size":{title:"contain-intrinsic-size",kind:"CSS",description:"Fournit une taille intrinsèque de remplacement utile avec certaines optimisations de rendu comme content-visibility.",example:"contain-intrinsic-size: 600px;"},
  "content-visibility":{title:"content-visibility",kind:"CSS",description:"Permet au navigateur d'éviter le rendu de contenu hors écran jusqu'à ce qu'il devienne nécessaire.",example:"content-visibility: auto;"},
  font:{title:"font",kind:"CSS",description:"Propriété raccourcie qui configure plusieurs caractéristiques typographiques en une déclaration.",example:"font: 600 1rem/1.5 system-ui;"},
  "margin-inline":{title:"margin-inline",kind:"CSS",description:"Définit les marges sur l'axe inline, en respectant le sens d'écriture.",example:"margin-inline: auto;"},
  "outline-offset":{title:"outline-offset",kind:"CSS",description:"Décale visuellement le contour outline par rapport à la bordure de l'élément.",example:"outline-offset: 3px;"},
  "padding-block":{title:"padding-block",kind:"CSS",description:"Définit le padding sur l'axe block, en respectant le mode d'écriture.",example:"padding-block: 1rem;"},
  track:{title:"<track>",kind:"HTML",description:"Ajoute une piste texte à un média, par exemple des sous-titres pour une vidéo.",example:'<track kind="subtitles" srclang="fr" src="captions.vtt">'},
  "aria-labelledby":{title:"aria-labelledby",kind:"Accessibilité",description:"Donne un nom accessible à un élément en référençant le texte d'un ou plusieurs autres éléments.",example:'aria-labelledby="dialog-title"'},
  kind:{title:"kind",kind:"HTML",description:"Précise le rôle d'une piste track : subtitles, captions, descriptions, etc.",example:'<track kind="subtitles">'},
  loading:{title:"loading",kind:"HTML",description:"Contrôle le chargement différé de certaines ressources comme les images ou iframes.",example:'<img loading="lazy" src="photo.jpg" alt="…">'},
  maxlength:{title:"maxlength",kind:"HTML",description:"Limite le nombre maximal de caractères saisis dans un champ compatible.",example:'<input maxlength="80">'},
  minlength:{title:"minlength",kind:"HTML",description:"Fixe le nombre minimal de caractères requis dans un champ compatible.",example:'<input minlength="3">'},
  property:{title:"property",kind:"HTML / métadonnées",description:"Attribut notamment utilisé avec Open Graph pour identifier le type de métadonnée.",example:'<meta property="og:title" content="Mon site">'},
  srclang:{title:"srclang",kind:"HTML",description:"Indique la langue d'une piste texte track.",example:'<track srclang="fr" kind="subtitles">'},

  // APIs DOM / tests / Node rencontrées dans les niveaux avancés
  contains:{title:"contains()",kind:"DOM",description:"Indique si un nœud contient un autre nœud dans son sous-arbre.",example:"menu.contains(event.target)"},
  closest:{title:"closest()",kind:"DOM",description:"Remonte depuis un élément jusqu'au premier ancêtre correspondant au sélecteur CSS donné.",example:'event.target.closest("button")'},
  setAttribute:{title:"setAttribute()",kind:"DOM",description:"Ajoute ou remplace la valeur d'un attribut sur un élément.",example:'link.setAttribute("aria-current", "page")'},
  prepend:{title:"prepend()",kind:"DOM",description:"Ajoute des nœuds ou du texte au début d'un élément.",example:"list.prepend(item);"},
  replaceChildren:{title:"replaceChildren()",kind:"DOM",description:"Remplace tous les enfants d'un élément par les nouveaux nœuds fournis.",example:"box.replaceChildren(message);"},
  hidden:{title:"hidden",kind:"HTML / DOM",description:"État booléen indiquant qu'un élément ne doit pas être affiché.",example:"panel.hidden = true;"},
  currentTarget:{title:"event.currentTarget",kind:"DOM",description:"Élément sur lequel le gestionnaire d'événement courant est enregistré.",example:"event.currentTarget.disabled = true;"},
  tagName:{title:"tagName",kind:"DOM",description:"Nom de balise d'un élément DOM, généralement retourné en majuscules dans un document HTML.",example:"element.tagName"},
  parentElement:{title:"parentElement",kind:"DOM",description:"Élément parent direct, ou null s'il n'y en a pas.",example:"item.parentElement"},
  nextElementSibling:{title:"nextElementSibling",kind:"DOM",description:"Élément frère situé immédiatement après l'élément courant.",example:"title.nextElementSibling"},
  add:{title:"classList.add()",kind:"DOM",description:"Ajoute une ou plusieurs classes CSS avec classList.",example:'element.classList.add("active")'},
  toggle:{title:"classList.toggle()",kind:"DOM",description:"Ajoute ou retire une classe selon son état actuel, avec possibilité de forcer un état.",example:'element.classList.toggle("open")'},
  "console.warn":{title:"console.warn()",kind:"JavaScript / Node.js",description:"Affiche un avertissement dans la console.",example:'console.warn("Attention");'},
  "console.debug":{title:"console.debug()",kind:"JavaScript",description:"Affiche une information de débogage dans la console.",example:'console.debug("state", state);'},
  "crypto.randomUUID":{title:"crypto.randomUUID()",kind:"Web API",description:"Génère un UUID aléatoire conforme au format standard lorsque l'environnement le supporte.",example:"const id = crypto.randomUUID();"},
  "window.removeEventListener":{title:"removeEventListener()",kind:"DOM",description:"Retire un gestionnaire précédemment enregistré avec addEventListener et la même référence de fonction.",example:'window.removeEventListener("resize", onResize);'},
  toLocaleTimeString:{title:"toLocaleTimeString()",kind:"JavaScript",description:"Formate l'heure d'une Date selon une locale et des options.",example:"new Date().toLocaleTimeString('fr-FR')"},
  toFixed:{title:"toFixed()",kind:"JavaScript / TypeScript",description:"Formate un nombre avec un nombre fixe de décimales et retourne une chaîne.",example:"price.toFixed(2)"},
  "assert.strictEqual":{title:"assert.strictEqual()",kind:"Node.js",description:"Vérifie que deux valeurs sont strictement égales dans un test Node.js.",example:"assert.strictEqual(actual, expected);"},
  "server.close":{title:"server.close()",kind:"Node.js · HTTP",description:"Arrête d'accepter de nouvelles connexions et ferme le serveur lorsque les connexions en cours sont terminées.",example:"server.close(() => process.exitCode = 0);"},
  pathname:{title:"URL.pathname",kind:"URL",description:"Partie chemin d'une URL, sans le domaine ni la query string.",example:"url.pathname // '/users/1'"},
  "error.code":{title:"error.code",kind:"Node.js",description:"Code machine associé à certaines erreurs Node.js, par exemple ENOENT pour un fichier absent.",example:"if (error.code === 'ENOENT') { … }"},

  // Terminal / npm : utile dans React + Vite et Node.js
  pwd:{title:"pwd",kind:"Terminal",description:"Affiche le dossier de travail courant.",example:"pwd"},
  cd:{title:"cd",kind:"Terminal",description:"Change le dossier de travail courant.",example:"cd mon-projet"},
  ls:{title:"ls",kind:"Terminal",description:"Liste les fichiers et dossiers du répertoire courant.",example:"ls"},
  touch:{title:"touch",kind:"Terminal",description:"Crée un fichier vide s'il n'existe pas déjà.",example:"touch app.js"},
  cat:{title:"cat",kind:"Terminal",description:"Affiche le contenu d'un fichier texte dans le terminal.",example:"cat package.json"},
  install:{title:"npm install",kind:"npm",description:"Installe les dépendances du projet ou ajoute un paquet lorsqu'un nom est fourni.",example:"npm install"},
  init:{title:"npm init",kind:"npm",description:"Crée ou initialise un package.json. L'option -y accepte les valeurs par défaut.",example:"npm init -y"},
  run:{title:"npm run",kind:"npm",description:"Exécute un script déclaré dans la section scripts de package.json.",example:"npm run dev"},
  audit:{title:"npm audit",kind:"npm",description:"Analyse les dépendances connues du projet pour signaler des vulnérabilités publiées.",example:"npm audit"},
  uninstall:{title:"npm uninstall",kind:"npm",description:"Retire une dépendance du projet et met à jour package.json/lockfile.",example:"npm uninstall paquet"},
  "package.json":{title:"package.json",kind:"Node.js / npm",description:"Fichier manifeste d'un projet Node.js : métadonnées, scripts, dépendances et configuration de module.",example:'{ "scripts": { "start": "node app.js" } }'},

  // Propriétés et APIs standards supplémentaires rencontrées dans les parcours avancés
  innerWidth:{title:"window.innerWidth",kind:"Web API",description:"Largeur intérieure actuelle de la zone d'affichage du navigateur en pixels CSS.",example:"window.innerWidth"},
  clientX:{title:"event.clientX",kind:"DOM",description:"Coordonnée horizontale du pointeur dans la zone d'affichage lors d'un événement de souris/pointeur.",example:"event.clientX"},
  dataset:{title:"dataset",kind:"DOM",description:"Expose les attributs data-* d'un élément sous forme de propriétés JavaScript.",example:'element.dataset.userId'},
  ok:{title:"Response.ok",kind:"Fetch API",description:"Booléen indiquant si le statut HTTP de la réponse est compris entre 200 et 299.",example:"if (!response.ok) throw new Error(...);"},
  firstElementChild:{title:"firstElementChild",kind:"DOM",description:"Premier enfant qui est un élément, en ignorant les nœuds texte et commentaires.",example:"container.firstElementChild"},
  style:{title:"style",kind:"DOM",description:"Objet permettant de lire ou modifier les styles en ligne d'un élément.",example:"element.style.color = 'red';"},
  Provider:{title:"Context.Provider",kind:"React",description:"Fournit une valeur de Context aux composants descendants.",example:"<ThemeContext.Provider value={theme}>…</ThemeContext.Provider>"},
  current:{title:"ref.current",kind:"React",description:"Propriété contenant la valeur courante d'une ref React, souvent un élément DOM ou une valeur mutable.",example:"inputRef.current?.focus();"},
  "import.meta.env":{title:"import.meta.env",kind:"Vite",description:"Objet exposé par Vite pour lire les variables d'environnement autorisées côté client, notamment celles préfixées par VITE_.",example:"import.meta.env.VITE_API_URL"},
  "screen.getByRole":{title:"screen.getByRole()",kind:"Testing Library",description:"Recherche un élément selon son rôle accessible, approche recommandée pour des tests proches de l'usage réel.",example:'screen.getByRole("button", { name: /envoyer/i })'},
  "screen.getByText":{title:"screen.getByText()",kind:"Testing Library",description:"Recherche un élément à partir de son contenu textuel visible.",example:'screen.getByText("Bienvenue")'},
  "screen.getByLabelText":{title:"screen.getByLabelText()",kind:"Testing Library",description:"Recherche un contrôle associé à un label accessible.",example:'screen.getByLabelText("Email")'},
  "userEvent.setup":{title:"userEvent.setup()",kind:"Testing Library",description:"Crée une instance user-event pour simuler des interactions utilisateur réalistes dans les tests.",example:"const user = userEvent.setup();"},
  "user.click":{title:"user.click()",kind:"Testing Library",description:"Simule un clic utilisateur avec user-event.",example:"await user.click(button);"},
  "FK":{title:"FK",kind:"SQL",description:"Abréviation courante de Foreign Key : clé étrangère reliant une table à une autre.",example:"user_id → users.id"},
  "PK":{title:"PK",kind:"SQL",description:"Abréviation courante de Primary Key : clé qui identifie de façon unique une ligne.",example:"id INTEGER PRIMARY KEY"}
});

const CODE_HELP_ALIASES = {
  ":hover":"hover", ":focus":"focus", ":focus-visible":"focus-visible",
  "clamp()":"clamp", "var()":"var", "repeat()":"repeat", "minmax()":"minmax", "calc()":"calc",
  "ROW_NUMBER()":"ROW_NUMBER", "RANK()":"RANK", "DENSE_RANK()":"DENSE_RANK",
  "COUNT()":"COUNT", "SUM()":"SUM", "AVG()":"AVG", "MIN()":"MIN", "MAX()":"MAX"
};

const SQL_HELP_WORDS = new Set([
  "SELECT","FROM","WHERE","DISTINCT","AS","LIMIT","OFFSET","AND","OR","NOT","IN","BETWEEN","LIKE","IS","NULL",
  "ORDER","ASC","DESC","COUNT","SUM","AVG","MIN","MAX","GROUP","HAVING","JOIN","INNER","LEFT","RIGHT","FULL","CROSS","ON",
  "INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","ALTER","DROP","PRIMARY","FOREIGN","KEY","REFERENCES","NOT",
  "UNIQUE","CHECK","DEFAULT","BEGIN","COMMIT","ROLLBACK","WITH","CASE","WHEN","THEN","ELSE","END","COALESCE","OVER","PARTITION",
  "ROW_NUMBER","RANK","DENSE_RANK","INDEX","EXPLAIN","PRAGMA","UNION","ALL","EXISTS","INTEGER","TEXT","REAL","BLOB","AUTOINCREMENT"
]);

const CSS_COMMON_PROPERTIES = new Set([
  "margin","margin-top","margin-right","margin-bottom","margin-left","padding","padding-top","padding-right","padding-bottom","padding-left",
  "width","height","min-width","max-width","min-height","max-height","display","position","top","right","bottom","left","inset","z-index",
  "color","background","background-color","background-image","background-size","background-position","border","border-width","border-style","border-color",
  "border-radius","box-sizing","box-shadow","opacity","overflow","overflow-x","overflow-y","font-size","font-weight","font-family","font-style","line-height",
  "letter-spacing","text-align","text-decoration","text-transform","white-space","word-break","object-fit","cursor","pointer-events","visibility",
  "flex","flex-grow","flex-shrink","flex-basis","flex-direction","flex-wrap","align-items","align-content","align-self","justify-content","justify-items",
  "justify-self","gap","row-gap","column-gap","grid","grid-template-columns","grid-template-rows","grid-column","grid-row","grid-area","place-items",
  "transform","transform-origin","transition","transition-property","transition-duration","animation","animation-name","animation-duration"
]);

const HTML_COMMON_TAGS = new Set([
  "html","head","body","main","section","article","nav","header","footer","aside","div","span","p","h1","h2","h3","h4","h5","h6",
  "a","img","ul","ol","li","strong","em","figure","figcaption","form","label","input","button","textarea","select","option","fieldset","legend",
  "table","thead","tbody","tfoot","tr","th","td","details","summary","dialog","video","audio","source","iframe","meta","link","script","title"
]);

const HTML_COMMON_ATTRS = new Set([
  "id","class","href","src","alt","title","lang","name","value","type","for","required","placeholder","disabled","checked","selected","multiple",
  "action","method","target","rel","defer","async","download","controls","autoplay","loop","muted","width","height","rows","cols","scope","colspan",
  "rowspan","role","tabindex","aria-label","aria-describedby","aria-hidden"
]);

const JS_KEYWORD_DESCRIPTIONS = {
  typeof:"Retourne une chaîne décrivant le type JavaScript d'une valeur.", instanceof:"Teste si un objet est lié au prototype d'un constructeur.",
  delete:"Supprime une propriété configurable d'un objet.", in:"Teste si une propriété existe dans un objet ou sa chaîne de prototypes.",
  this:"Référence dont la valeur dépend de la manière dont la fonction ou la méthode est appelée.", super:"Permet d'accéder au constructeur ou aux méthodes de la classe parente.",
  static:"Déclare un membre de classe attaché à la classe elle-même plutôt qu'aux instances.", get:"Déclare un accesseur de lecture.", set:"Déclare un accesseur d'écriture."
};

function inferCodeHelpLanguage(element) {
  const explicit = element && element.closest && element.closest("[data-code-language]");
  if (explicit) return explicit.getAttribute("data-code-language") || "";
  const path = document.body && document.body.dataset ? document.body.dataset.path : "";
  return path || "";
}

function genericCodeHelpEntry(key, language) {
  const raw = String(key || "");
  const lower = raw.toLowerCase();
  const upper = raw.toUpperCase();
  if (raw.startsWith("--")) return {title:raw,kind:"CSS · variable",description:"Propriété personnalisée CSS. Sa valeur peut être réutilisée avec var("+raw+").",example:raw+": …;"};
  if ((language === "sql" || SQL_HELP_WORDS.has(upper)) && SQL_HELP_WORDS.has(upper)) {
    return {title:upper,kind:"SQL",description:"Mot-clé SQL utilisé dans la construction de la requête. Observe sa position dans l'exemple pour comprendre son rôle dans la lecture, le filtrage, la jointure ou la modification des données.",example:upper};
  }
  if ((language === "css" || CSS_COMMON_PROPERTIES.has(lower)) && CSS_COMMON_PROPERTIES.has(lower)) {
    return {title:lower,kind:"CSS",description:"Propriété CSS qui contrôle un aspect de la présentation ou de la mise en page de l'élément.",example:lower+": …;"};
  }
  if ((language === "html" || HTML_COMMON_TAGS.has(lower)) && HTML_COMMON_TAGS.has(lower)) {
    return {title:"<"+lower+">",kind:"HTML",description:"Élément HTML utilisé pour structurer ou décrire le contenu de la page.",example:"<"+lower+">…</"+lower+">"};
  }
  if ((language === "html" || HTML_COMMON_ATTRS.has(lower)) && HTML_COMMON_ATTRS.has(lower)) {
    return {title:lower,kind:"HTML",description:"Attribut HTML qui configure ou décrit davantage l'élément sur lequel il est placé.",example:lower+'="…"'};
  }
  if (JS_KEYWORD_DESCRIPTIONS[raw]) return {title:raw,kind:"JavaScript",description:JS_KEYWORD_DESCRIPTIONS[raw],example:raw};
  return null;
}

function codeHelpEntry(key, language) {
  if (!key) return null;
  const raw = String(key).replace(/\(\)$/g, "");
  const lower = raw.toLowerCase();
  const upper = raw.toUpperCase();
  const alias = CODE_HELP_ALIASES[raw] || raw;

  // Priorité au langage courant pour les mots ambigus : `as` existe en TypeScript
  // et SQL, `type` peut être un attribut HTML ou un mot TypeScript, etc.
  if (language === "sql" && SQL_HELP_WORDS.has(upper)) return CODE_HELP[upper] || genericCodeHelpEntry(upper, "sql");
  if (language === "html" && (HTML_COMMON_TAGS.has(lower) || HTML_COMMON_ATTRS.has(lower))) {
    const direct = CODE_HELP[lower];
    if (direct && /HTML|Accessibilité/.test(direct.kind || "")) return direct;
    return genericCodeHelpEntry(lower, "html");
  }
  if (language === "css" && CSS_COMMON_PROPERTIES.has(lower)) return CODE_HELP[lower] || genericCodeHelpEntry(lower, "css");

  return CODE_HELP[alias] || CODE_HELP[raw] || CODE_HELP[upper] || CODE_HELP[lower] || genericCodeHelpEntry(raw, language) || null;
}

// Reconnaît les identifiants, méthodes, propriétés CSS, at-rules et pseudo-classes.
const CODE_HELP_TOKEN_RE = /--[A-Za-z_][\w-]*|@[A-Za-z-]+|[A-Za-z_$][\w$-]*(?:\.[A-Za-z_$][\w$-]*)*/g;

function resolveCodeHelpToken(token, language) {
  const direct = codeHelpEntry(token, language);
  if (direct) return {key:token,entry:direct};
  if (token.includes(".")) {
    const parts = token.split(".");

    // Préfixes : process.env.NODE_ENV doit pouvoir réutiliser l'aide de process.env.
    for (let end = parts.length - 1; end >= 1; end--) {
      const candidate = parts.slice(0, end).join(".");
      const entry = codeHelpEntry(candidate, language);
      if (entry) return {key:candidate,entry};
    }

    // Suffixes : objet.classList.toggle peut réutiliser l'aide de classList/toggle.
    for (let start = 1; start < parts.length; start++) {
      const candidate = parts.slice(start).join(".");
      const entry = codeHelpEntry(candidate, language);
      if (entry) return {key:candidate,entry};
    }

    // Segment individuel utile au milieu d'une chaîne (ex. classList).
    for (let i = parts.length - 1; i >= 0; i--) {
      const entry = codeHelpEntry(parts[i], language);
      if (entry) return {key:parts[i],entry};
    }
  }
  return null;
}

function makeCodeHelpToken(token, key, language) {
  return h("span", {
    class:"code-help-token",
    tabindex:"0",
    role:"button",
    "data-code-help":key,
    "data-code-help-language":language || "",
    "aria-label":token+" — afficher l'explication"
  }, token);
}

function renderCodeHelpText(text, language) {
  const source = String(text);
  const frag = document.createDocumentFragment();
  let last = 0;
  CODE_HELP_TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = CODE_HELP_TOKEN_RE.exec(source))) {
    const token = match[0];
    const offset = match.index;
    if (offset > last) frag.append(document.createTextNode(source.slice(last, offset)));
    const resolved = resolveCodeHelpToken(token, language);
    if (resolved) frag.append(makeCodeHelpToken(token, resolved.key, language));
    else frag.append(document.createTextNode(token));
    last = offset + token.length;
  }
  if (last < source.length) frag.append(document.createTextNode(source.slice(last)));
  return frag;
}

let codeHelpPopup = null;
let codeHelpPinned = false;
let codeHelpHideTimer = null;
let codeHelpLastAnchor = null;

function ensureCodeHelpPopup() {
  if (codeHelpPopup) return codeHelpPopup;
  codeHelpPopup = h("aside", {class:"code-help-popup", role:"dialog", "aria-live":"polite", hidden:true, "data-code-help-ignore":"1"});
  document.body.append(codeHelpPopup);
  codeHelpPopup.addEventListener("pointerenter", () => clearTimeout(codeHelpHideTimer));
  codeHelpPopup.addEventListener("pointerleave", () => { if (!codeHelpPinned) hideCodeHelp(); });
  return codeHelpPopup;
}

function anchorRect(anchor) {
  if (anchor && typeof anchor.getBoundingClientRect === "function") return anchor.getBoundingClientRect();
  if (anchor && Number.isFinite(anchor.x) && Number.isFinite(anchor.y)) return {left:anchor.x,right:anchor.x,top:anchor.y,bottom:anchor.y,width:0,height:0};
  return {left:16,right:16,top:16,bottom:16,width:0,height:0};
}

function positionCodeHelp(anchor) {
  const popup = ensureCodeHelpPopup();
  const rect = anchorRect(anchor);
  const pad = 12;
  const maxWidth = Math.min(420, Math.max(260, window.innerWidth - pad * 2));
  popup.style.left = Math.min(Math.max(pad, rect.left), Math.max(pad, window.innerWidth - maxWidth - pad)) + "px";
  popup.style.top = "0px";
  const popupRect = popup.getBoundingClientRect();
  let top = rect.bottom + 10;
  if (top + popupRect.height > window.innerHeight - pad) top = Math.max(pad, rect.top - popupRect.height - 10);
  popup.style.top = top + "px";
}

function showCodeHelp(anchor, key, pinned, language) {
  const entry = codeHelpEntry(key, language || inferCodeHelpLanguage(anchor && anchor.nodeType ? anchor : null));
  if (!entry) return;
  clearTimeout(codeHelpHideTimer);
  codeHelpPinned = !!pinned;
  codeHelpLastAnchor = anchor;
  const popup = ensureCodeHelpPopup();
  popup.hidden = false;
  popup.replaceChildren(
    h("div",{class:"code-help-head"},
      h("div",{},h("strong",{class:"code-help-title"},entry.title),h("span",{class:"code-help-kind"},entry.kind || "Code")),
      h("button",{class:"code-help-close",type:"button","aria-label":"Fermer l'aide",onclick:hideCodeHelp},"×")
    ),
    h("p",{class:"code-help-description"},entry.description),
    entry.example ? h("pre",{class:"code-help-example","data-code-help-ignore":"1"},entry.example) : null,
    window.glossaryEntryHref ? h("a",{class:"code-help-glossary",href:"#"+window.glossaryEntryHref(key),onclick:()=>hideCodeHelp()},"Voir dans le glossaire →") : null,
    h("p",{class:"code-help-hint"}, codeHelpPinned ? "Appuie ailleurs ou sur × pour fermer." : "Clique pour garder cette aide ouverte.")
  );
  positionCodeHelp(anchor);
}

function hideCodeHelp() {
  codeHelpPinned = false;
  codeHelpLastAnchor = null;
  if (codeHelpPopup) codeHelpPopup.hidden = true;
}

function scheduleHideCodeHelp() {
  clearTimeout(codeHelpHideTimer);
  codeHelpHideTimer = setTimeout(() => { if (!codeHelpPinned) hideCodeHelp(); }, 120);
}

function bindCodeHelpToken(token) {
  if (!token || token.dataset.codeHelpBound) return;
  token.dataset.codeHelpBound = "1";
  const key = token.dataset.codeHelp;
  const language = token.dataset.codeHelpLanguage || inferCodeHelpLanguage(token);
  token.addEventListener("pointerenter", event => {
    if (event.pointerType !== "touch" && !codeHelpPinned) showCodeHelp(token, key, false, language);
  });
  token.addEventListener("pointerleave", event => {
    if (event.pointerType !== "touch" && !codeHelpPinned) scheduleHideCodeHelp();
  });
  token.addEventListener("focus", () => { if (!codeHelpPinned) showCodeHelp(token, key, false, language); });
  token.addEventListener("blur", () => { if (!codeHelpPinned) scheduleHideCodeHelp(); });
  token.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    showCodeHelp(token, key, true, language);
  });
}

function activateCodeHelp(root) {
  (root || document).querySelectorAll(".code-help-token").forEach(bindCodeHelpToken);
}

function shouldIgnoreCodeHelpNode(node) {
  const parent = node && node.parentElement;
  if (!parent) return true;
  return !!parent.closest(".code-help-popup, .suggest, [data-code-help-ignore], .code-help-token, textarea, input, select, option, script, style");
}

function enhanceCodeHelpContainer(container) {
  if (!container || container.nodeType !== 1) return;
  if (container.matches(".code-help-popup, .suggest, [data-code-help-ignore], textarea, input, select, script, style")) return;
  const language = inferCodeHelpLanguage(container);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let current;
  while ((current = walker.nextNode())) {
    if (!shouldIgnoreCodeHelpNode(current) && current.nodeValue && current.nodeValue.trim()) nodes.push(current);
  }
  nodes.forEach(textNode => {
    const text = textNode.nodeValue;
    CODE_HELP_TOKEN_RE.lastIndex = 0;
    let hasHelp = false, match;
    while ((match = CODE_HELP_TOKEN_RE.exec(text))) {
      if (resolveCodeHelpToken(match[0], language)) { hasHelp = true; break; }
    }
    if (!hasHelp) return;
    textNode.replaceWith(renderCodeHelpText(text, language));
  });
  activateCodeHelp(container);
  container.dataset.codeHelpEnhanced = "1";
}

function enhanceCodeHelpTree(root) {
  if (!root) return;
  const candidates = [];
  if (root.nodeType === 1 && root.matches("pre, code")) candidates.push(root);
  if (root.querySelectorAll) root.querySelectorAll("pre, code").forEach(el => candidates.push(el));
  candidates.forEach(enhanceCodeHelpContainer);
}

function startAutomaticCodeHelp() {
  enhanceCodeHelpTree(document);
  if (!document.body || typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === 1) enhanceCodeHelpTree(node);
      else if (node.nodeType === 3 && node.parentElement && node.parentElement.closest("pre, code")) enhanceCodeHelpContainer(node.parentElement.closest("pre, code"));
    }));
  });
  observer.observe(document.body, {childList:true, subtree:true});
}

function tokenAtCaret(text, caret, language) {
  let best = null;
  CODE_HELP_TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = CODE_HELP_TOKEN_RE.exec(text))) {
    const start = match.index, end = start + match[0].length;
    if (caret >= start && caret <= end) { best = match[0]; break; }
    if (start > caret) break;
  }
  if (!best) return null;
  const resolved = resolveCodeHelpToken(best, language);
  return resolved ? resolved.key : null;
}

function editorTokenAtPoint(editor, clientX, clientY, language) {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
  const style = window.getComputedStyle(editor);
  const rect = editor.getBoundingClientRect();
  const padLeft = parseFloat(style.paddingLeft) || 0;
  const padTop = parseFloat(style.paddingTop) || 0;
  const lineHeight = parseFloat(style.lineHeight) || (parseFloat(style.fontSize) || 16) * 1.5;
  const x = clientX - rect.left - padLeft + editor.scrollLeft;
  const y = clientY - rect.top - padTop + editor.scrollTop;
  if (x < 0 || y < 0) return null;

  const lines = String(editor.value).split("\n");
  const lineIndex = Math.floor(y / lineHeight);
  if (lineIndex < 0 || lineIndex >= lines.length) return null;
  const line = lines[lineIndex];

  // Les éditeurs du site sont monospaces. On mesure quand même le glyphe avec
  // la police réellement appliquée afin que le hover reste précis avec le zoom.
  const canvas = editorTokenAtPoint._canvas || (editorTokenAtPoint._canvas = document.createElement("canvas"));
  const ctx = canvas.getContext && canvas.getContext("2d");
  let charWidth = (parseFloat(style.fontSize) || 16) * 0.61;
  if (ctx) {
    ctx.font = style.font || [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily].filter(Boolean).join(" ");
    charWidth = ctx.measureText("M").width || charWidth;
  }
  const visualColumn = Math.max(0, Math.floor(x / Math.max(1, charWidth)));
  const tabSize = parseInt(style.tabSize, 10) || 2;
  let sourceColumn = 0, visual = 0;
  while (sourceColumn < line.length && visual <= visualColumn) {
    if (line[sourceColumn] === "\t") visual += tabSize - (visual % tabSize);
    else visual += 1;
    if (visual > visualColumn) break;
    sourceColumn++;
  }

  const absolute = lines.slice(0, lineIndex).reduce((sum, item) => sum + item.length + 1, 0) + sourceColumn;
  const key = tokenAtCaret(editor.value, absolute, language);
  return key ? {key, x:clientX, y:clientY} : null;
}

function attachEditorCodeHelp(editor, language) {
  if (!editor) return editor;
  if (language) editor.dataset.codeHelpLanguage = language;
  if (editor.dataset.codeHelpEditor) return editor;
  editor.dataset.codeHelpEditor = "1";
  const showAtCaret = event => {
    const lang = editor.dataset.codeHelpLanguage || language || inferCodeHelpLanguage(editor);
    const key = tokenAtCaret(editor.value, editor.selectionStart || 0, lang);
    if (!key) return;
    const anchor = event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY) && (event.clientX || event.clientY)
      ? {x:event.clientX,y:event.clientY}
      : editor;
    showCodeHelp(anchor, key, true, lang);
  };

  // Desktop : même comportement que les blocs de code, mais calculé depuis la
  // position du pointeur car le texte interne d'un textarea n'expose pas de spans.
  editor.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" || codeHelpPinned) return;
    const lang = editor.dataset.codeHelpLanguage || language || inferCodeHelpLanguage(editor);
    const hit = editorTokenAtPoint(editor, event.clientX, event.clientY, lang);
    if (!hit) {
      editor.dataset.codeHelpHoverKey = "";
      scheduleHideCodeHelp();
      return;
    }
    if (editor.dataset.codeHelpHoverKey !== hit.key || !codeHelpPopup || codeHelpPopup.hidden) {
      editor.dataset.codeHelpHoverKey = hit.key;
      showCodeHelp({x:hit.x,y:hit.y}, hit.key, false, lang);
    }
  });
  editor.addEventListener("pointerleave", event => {
    if (event.pointerType !== "touch" && !codeHelpPinned) { editor.dataset.codeHelpHoverKey = ""; scheduleHideCodeHelp(); }
  });

  editor.addEventListener("click", showAtCaret);
  editor.addEventListener("touchend", event => setTimeout(() => showAtCaret(event.changedTouches && event.changedTouches[0] ? {clientX:event.changedTouches[0].clientX,clientY:event.changedTouches[0].clientY} : null), 0), {passive:true});
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
  if (event.target.closest && event.target.closest("textarea[data-code-help-editor]")) return;
  hideCodeHelp();
});
window.addEventListener("resize", () => { if (codeHelpPopup && !codeHelpPopup.hidden) hideCodeHelp(); });
window.addEventListener("scroll", () => { if (codeHelpPopup && !codeHelpPopup.hidden && !codeHelpPinned) hideCodeHelp(); }, true);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startAutomaticCodeHelp, {once:true});
else startAutomaticCodeHelp();

// Exposé pour le glossaire global : une seule source de vérité pour les définitions.
window.CODE_HELP = CODE_HELP;
