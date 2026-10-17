// Playground libre global — espace d'expérimentation hors progression pédagogique.
// Réutilise les moteurs existants et sauvegarde uniquement des brouillons locaux.

const GLOBAL_PLAYGROUND_TABS = [
  {id:"web", label:"Web", mark:"</>", subtitle:"HTML · CSS · JavaScript"},
  {id:"javascript", label:"JavaScript", mark:"JS", subtitle:"Console JavaScript"},
  {id:"react", label:"React", mark:"⚛", subtitle:"React + Vite simulé"},
  {id:"typescript", label:"TypeScript", mark:"TS", subtitle:"Compilateur TypeScript réel"},
  {id:"node", label:"Node.js", mark:"N", subtitle:"Node Lab pédagogique"},
  {id:"sql", label:"SQL", mark:"SQL", subtitle:"SQLite réel"},
];

const GLOBAL_PLAYGROUND_DEFAULTS = {
  web: {
    files: [
      {name:"index.html", code:'<!doctype html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Mon playground</title>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <main class="card">\n      <h1>Bonjour Cahier Code 👋</h1>\n      <p>Modifie le HTML, le CSS et le JavaScript librement.</p>\n      <button id="action">Tester</button>\n    </main>\n    <script src="script.js"></script>\n  </body>\n</html>'},
      {name:"style.css", code:'body {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n  padding: 3rem;\n  background: #f5f7fb;\n}\n\n.card {\n  max-width: 620px;\n  margin: auto;\n  padding: 2rem;\n  background: white;\n  border-radius: 1rem;\n}\n\nbutton {\n  padding: .7rem 1rem;\n  cursor: pointer;\n}'},
      {name:"script.js", code:'const button = document.querySelector("#action");\n\nbutton.addEventListener("click", () => {\n  console.log("Bouton cliqué !");\n  button.textContent = "Ça fonctionne ✓";\n});'},
    ]
  },
  javascript: {code:'const cours = ["HTML", "CSS", "JavaScript"];\n\nconst message = cours.map((nom, index) => `${index + 1}. ${nom}`).join("\\n");\nconsole.log(message);'},
  react: {files:{
    "src/App.jsx": 'import { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <main className="app">\n      <h1>Playground React</h1>\n      <p>Compteur : {count}</p>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </main>\n  );\n}',
    "src/App.css": '.app {\n  font-family: system-ui, sans-serif;\n  max-width: 640px;\n  margin: 3rem auto;\n}\n\nbutton {\n  padding: .65rem 1rem;\n}'
  }},
  typescript: {code:'type User = {\n  id: number;\n  name: string;\n};\n\nconst users: User[] = [\n  { id: 1, name: "Ada" },\n  { id: 2, name: "Grace" }\n];\n\nconsole.log(users.map(user => user.name).join(", "));'},
  node: {files:[
    {name:"app.js", code:'import { formatUser } from "./utils.js";\n\nconst user = { id: 1, name: "Ada" };\nconsole.log(formatUser(user));'},
    {name:"utils.js", code:'export function formatUser(user) {\n  return `#${user.id} · ${user.name}`;\n}'},
    {name:"package.json", code:'{\n  "name": "playground-node",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "start": "node app.js"\n  }\n}\n'}
  ]},
  sql: {
    setup:'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL);\nINSERT INTO users (name, role, active) VALUES\n  ("Ada", "admin", 1),\n  ("Grace", "dev", 1),\n  ("Linus", "dev", 0),\n  ("Margaret", "admin", 1);',
    query:'SELECT role, COUNT(*) AS total\nFROM users\nWHERE active = 1\nGROUP BY role\nORDER BY total DESC;'
  }
};

function globalPlaygroundState(){
  if(!state.playground || typeof state.playground !== "object") state.playground={selected:"web",drafts:{}};
  if(!state.playground.drafts || typeof state.playground.drafts !== "object") state.playground.drafts={};
  return state.playground;
}
function playgroundDraft(id){ return globalPlaygroundState().drafts[id] || null; }
function savePlaygroundDraft(id, value){ globalPlaygroundState().drafts[id]=value; commit(); }
function clonePlayground(value){ return JSON.parse(JSON.stringify(value)); }

function playgroundInfoCard(){
  return h("div",{class:"callout playground-global-note"},
    h("strong",{},"Espace libre · hors progression"),
    para("Ici, tu peux casser, recommencer et expérimenter sans modifier tes leçons terminées, ton indice de maîtrise, tes streaks ou ton XP. Les brouillons sont sauvegardés automatiquement sur cet appareil.","muted small")
  );
}

function renderGlobalWebPlayground(){
  const draft=playgroundDraft("web");
  const files=(draft?.files || GLOBAL_PLAYGROUND_DEFAULTS.web.files).map(file=>({...file}));
  const wb=renderLab({files,resetButton:false,previewHeight:300,language:"html",tips:true});
  let timer=null;
  wb.node.addEventListener("input",()=>{
    clearTimeout(timer); timer=setTimeout(()=>savePlaygroundDraft("web",{files:wb.getFiles()}),180);
  });
  const actions=h("div",{class:"toolbar playground-global-actions"},
    h("button",{class:"btn ghost",type:"button",onclick:()=>{savePlaygroundDraft("web",clonePlayground(GLOBAL_PLAYGROUND_DEFAULTS.web)); router();}},"Réinitialiser l’espace Web")
  );
  return h("div",{},h("div",{class:"playground-global-toolbar-hint"},para("Travaille sur plusieurs fichiers et observe immédiatement le navigateur sandboxé.","muted small")),wb.node,actions);
}

function renderGlobalJavascriptPlayground(){
  const starter=playgroundDraft("javascript")?.code || GLOBAL_PLAYGROUND_DEFAULTS.javascript.code;
  const node=renderPlayground(starter,{rows:16,tips:true});
  const editor=node.querySelector("textarea");
  let timer=null;
  if(editor) editor.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>savePlaygroundDraft("javascript",{code:editor.value}),180);});
  node.append(h("div",{class:"toolbar playground-global-actions"},h("button",{class:"btn ghost",type:"button",onclick:()=>{savePlaygroundDraft("javascript",clonePlayground(GLOBAL_PLAYGROUND_DEFAULTS.javascript));router();}},"Restaurer l’exemple")));
  return node;
}

function renderGlobalTypeScriptPlayground(){
  const starter=playgroundDraft("typescript")?.code || GLOBAL_PLAYGROUND_DEFAULTS.typescript.code;
  const wb=renderTypeScriptWorkbench({code:starter,terminal:true,filename:"playground.ts"});
  let timer=null;
  wb.editor.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>savePlaygroundDraft("typescript",{code:wb.getCode()}),180);});
  wb.node.append(h("div",{class:"toolbar playground-global-actions"},h("button",{class:"btn ghost",type:"button",onclick:()=>{savePlaygroundDraft("typescript",clonePlayground(GLOBAL_PLAYGROUND_DEFAULTS.typescript));router();}},"Restaurer l’exemple")));
  return wb.node;
}

function renderGlobalNodePlayground(){
  const starter=playgroundDraft("node")?.files || GLOBAL_PLAYGROUND_DEFAULTS.node.files;
  const wb=renderNodeWorkbench({files:clonePlayground(starter),active:"app.js",serverEntry:"server.js"});
  let timer=null;
  wb.node.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>savePlaygroundDraft("node",{files:wb.getFiles()}),220);});
  wb.node.append(h("div",{class:"toolbar playground-global-actions"},h("button",{class:"btn ghost",type:"button",onclick:()=>{savePlaygroundDraft("node",clonePlayground(GLOBAL_PLAYGROUND_DEFAULTS.node));router();}},"Réinitialiser le projet virtuel")));
  return wb.node;
}

function renderGlobalSqlPlayground(){
  const draft=playgroundDraft("sql") || {};
  const setup=GLOBAL_PLAYGROUND_DEFAULTS.sql.setup;
  const query=draft.query || GLOBAL_PLAYGROUND_DEFAULTS.sql.query;
  const wb=renderSqlWorkbench({setup,query,guide:"Base SQLite libre : inspecte les tables, écris tes requêtes et teste-les sans impact sur les exercices."});
  let timer=null;
  wb.editor.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>savePlaygroundDraft("sql",{query:wb.getQuery()}),180);});
  wb.node.append(h("div",{class:"toolbar playground-global-actions"},h("button",{class:"btn ghost",type:"button",onclick:()=>{savePlaygroundDraft("sql",{query:GLOBAL_PLAYGROUND_DEFAULTS.sql.query});router();}},"Restaurer la requête")));
  return wb.node;
}

function reactPlaygroundPreset(){
  const saved=playgroundDraft("react")?.files || GLOBAL_PLAYGROUND_DEFAULTS.react.files;
  REACT_STUDIO_PRESETS["global-playground"]={
    guided:["Ouvre src/App.jsx.","Modifie librement le composant.","Utilise la preview et la console.","Teste state, props, événements et styles."],
    server:true,
    files:clonePlayground(saved),
    focus:"files"
  };
}
function renderGlobalReactPlayground(){
  reactPlaygroundPreset();
  const node=renderReactLessonStudio({id:"global-playground"});
  let timer=null;
  node.addEventListener("input",event=>{
    if(!event.target.matches("textarea")) return;
    clearTimeout(timer);
    timer=setTimeout(()=>{
      const title=node.querySelector(".studio-code .studio-panel-title span + span")?.textContent?.trim() || "src/App.jsx";
      const current=clonePlayground(playgroundDraft("react")?.files || GLOBAL_PLAYGROUND_DEFAULTS.react.files);
      current[title]=event.target.value;
      savePlaygroundDraft("react",{files:current});
    },220);
  });
  node.append(h("div",{class:"toolbar playground-global-actions"},h("button",{class:"btn ghost",type:"button",onclick:()=>{savePlaygroundDraft("react",clonePlayground(GLOBAL_PLAYGROUND_DEFAULTS.react));router();}},"Réinitialiser le projet React")));
  return node;
}

function renderGlobalPlaygroundWorkspace(id){
  if(id==="web") return renderGlobalWebPlayground();
  if(id==="javascript") return renderGlobalJavascriptPlayground();
  if(id==="react") return renderGlobalReactPlayground();
  if(id==="typescript") return renderGlobalTypeScriptPlayground();
  if(id==="node") return renderGlobalNodePlayground();
  if(id==="sql") return renderGlobalSqlPlayground();
  return h("div",{class:"callout"},"Environnement introuvable.");
}

function renderGlobalPlayground(){
  const pg=globalPlaygroundState();
  if(!GLOBAL_PLAYGROUND_TABS.some(tab=>tab.id===pg.selected)) pg.selected="web";
  const workspace=h("section",{class:"playground-global-workspace"});
  const tabs=h("div",{class:"playground-global-tabs",role:"tablist","aria-label":"Environnements du playground"});
  function select(id){
    pg.selected=id; commit();
    tabs.querySelectorAll("button").forEach(btn=>{const active=btn.dataset.id===id;btn.classList.toggle("active",active);btn.setAttribute("aria-selected",active?"true":"false");});
    workspace.replaceChildren(renderGlobalPlaygroundWorkspace(id));
  }
  GLOBAL_PLAYGROUND_TABS.forEach(tab=>tabs.append(h("button",{class:"playground-global-tab"+(tab.id===pg.selected?" active":""),type:"button",role:"tab","aria-selected":tab.id===pg.selected?"true":"false","data-id":tab.id,onclick:()=>select(tab.id)},h("span",{class:"playground-global-mark","aria-hidden":"true"},tab.mark),h("span",{},h("strong",{},tab.label),h("small",{},tab.subtitle)))));
  setTimeout(()=>select(pg.selected),0);
  return h("div",{class:"page playground-global-page"},
    h("p",{class:"crumbs"},link("/","Accueil")," / Playground libre"),
    pageTitle("Playground libre global","Un laboratoire sans consigne : choisis un environnement, écris ce que tu veux et expérimente librement."),
    playgroundInfoCard(),
    tabs,
    workspace,
    h("section",{class:"block playground-global-rules"},h("h2",{},"Ce que le Playground ne modifie pas"),h("div",{class:"playground-global-rule-grid"},
      h("div",{},h("strong",{},"0 XP automatique"),para("Les expérimentations libres ne sont pas une source de farming.","muted small")),
      h("div",{},h("strong",{},"0 progression forcée"),para("Aucune leçon ou compétence n’est marquée comme maîtrisée.","muted small")),
      h("div",{},h("strong",{},"Brouillons séparés"),para("Ton code libre reste distinct des réponses aux exercices.","muted small"))
    ))
  );
}
