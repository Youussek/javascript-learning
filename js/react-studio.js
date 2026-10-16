// react-studio.js — environnement pédagogique React/Vite pour le parcours React.
// Il réutilise l'éditeur, la console et l'apparence des ateliers JavaScript, mais exécute
// le JSX dans une iframe sandboxée via un petit runtime pédagogique (aucune commande système réelle).

function reactStarterProject(overrides) {
  const base = {
    "package.json": JSON.stringify({
      name: "mon-app-react", private: true, version: "0.0.0", type: "module",
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
      dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
      devDependencies: { "@vitejs/plugin-react": "latest", vite: "latest" }
    }, null, 2),
    "index.html": '<!doctype html>\n<html lang="fr">\n  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>\n  <body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body>\n</html>',
    "src/main.jsx": 'import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\nimport "./App.css";\n\ncreateRoot(document.getElementById("root")).render(\n  <StrictMode><App /></StrictMode>\n);',
    "src/App.jsx": 'export default function App() {\n  return <h1>Bonjour React !</h1>;\n}',
    "src/App.css": 'body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; color: #172033; }\nbutton { padding: .65rem 1rem; border-radius: .65rem; border: 1px solid #cbd5e1; background: white; cursor: pointer; }',
  };
  Object.assign(base, overrides || {});
  return base;
}

const REACT_STUDIO_PRESETS = {
  "react-vite": {
    guided: ["Crée le projet avec Vite.", "Entre dans le dossier du projet.", "Installe les dépendances.", "Lance le serveur de développement."],
    fresh: true,
    focus: "terminal",
  },
  "react-structure": {
    guided: ["Explore les fichiers du projet.", "Ouvre `src/main.jsx` puis `src/App.jsx`.", "Lance `npm run dev`.", "Observe comment App.jsx arrive dans le navigateur."],
    server: false,
    focus: "files",
  },
  "react-jsx": {
    guided: ["Ouvre `src/App.jsx`.", "Modifie le titre et ajoute une expression entre accolades.", "Observe la mise à jour automatique de la preview.", "Provoque puis corrige une petite erreur JSX."],
    server: true,
    app: 'export default function App() {\n  const prenom = "Lina";\n  return (\n    <main className="app">\n      <h1>Bonjour {prenom}</h1>\n      <p>Bienvenue dans React.</p>\n    </main>\n  );\n}',
  },
  "react-components": {
    guided: ["Repère le composant `Carte`.", "Modifie son contenu.", "Ajoute une troisième `<Carte />`.", "Observe immédiatement la réutilisation dans la preview."],
    server: true,
    app: 'function Carte() {\n  return <article><h2>JavaScript</h2><p>Parcours disponible</p></article>;\n}\n\nexport default function App() {\n  return <main><Carte /><Carte /></main>;\n}',
  },
  "react-props": {
    guided: ["Observe les props reçues par `Carte`.", "Change les valeurs passées depuis App.", "Ajoute une troisième carte avec d’autres props.", "Vérifie le résultat dans le navigateur."],
    server: true,
    app: 'function Carte({ titre, progression }) {\n  return <article><h2>{titre}</h2><p>{progression}% terminé</p></article>;\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Carte titre="React" progression={25} />\n      <Carte titre="JavaScript" progression={72} />\n    </main>\n  );\n}',
  },
  "react-state": {
    guided: ["Clique sur le bouton dans la preview.", "Observe la valeur du state changer.", "Modifie l’incrément dans App.jsx.", "Ajoute un `console.log(compteur)` et observe la console navigateur."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() {\n  const [compteur, setCompteur] = useState(0);\n  console.log("Compteur :", compteur);\n  return (\n    <button onClick={() => setCompteur(compteur + 1)}>\n      Clics : {compteur}\n    </button>\n  );\n}',
  },
  "react-conditions": {
    guided: ["Clique sur le bouton pour changer l’état.", "Observe le rendu conditionnel.", "Remplace le ternaire par une condition avec &&.", "Ajoute un second message conditionnel."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() {\n  const [connecte, setConnecte] = useState(false);\n  return (\n    <main>\n      <h1>{connecte ? "Bienvenue !" : "Connexion requise"}</h1>\n      {connecte && <p>Ton espace personnel est disponible.</p>}\n      <button onClick={() => setConnecte(!connecte)}>\n        {connecte ? "Se déconnecter" : "Se connecter"}\n      </button>\n    </main>\n  );\n}',
  },
  "react-lists": {
    guided: ["Observe la liste générée avec map().", "Ajoute un nouvel objet au tableau initial.", "Change le contenu affiché dans chaque <li>.", "Teste une key différente et observe le code."],
    server: true,
    app: 'export default function App() {\n  const cours = [\n    { id: 1, nom: "JSX" },\n    { id: 2, nom: "Props" },\n    { id: 3, nom: "State" }\n  ];\n\n  return (\n    <main>\n      <h1>Mes cours</h1>\n      <ul>\n        {cours.map((coursItem) => <li key={coursItem.id}>{coursItem.nom}</li>)}\n      </ul>\n    </main>\n  );\n}',
  },
  "react-controlled-forms": {
    guided: ["Tape ton prénom dans le champ.", "Observe la preview se mettre à jour à chaque frappe.", "Ajoute un deuxième champ contrôlé.", "Empêche l’envoi si le champ est vide."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() {\n  const [prenom, setPrenom] = useState("");\n  const [message, setMessage] = useState("");\n  return (\n    <main>\n      <h1>Formulaire contrôlé</h1>\n      <form onSubmit={(event) => { event.preventDefault(); setMessage(prenom ? "Bonjour " + prenom + " !" : "Entre un prénom."); }}>\n        <input value={prenom} onChange={(event) => setPrenom(event.target.value)} placeholder="Ton prénom" />\n        <button type="submit">Valider</button>\n      </form>\n      <p>Valeur du state : {prenom || "(vide)"}</p>\n      {message && <strong>{message}</strong>}\n    </main>\n  );\n}',
  },
  "react-state-arrays": {
    guided: ["Ajoute une tâche avec le formulaire.", "Supprime une tâche depuis la preview.", "Observe l’usage de [...tasks, nouvelleTache].", "Ajoute un bouton pour vider toute la liste."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() {\n  const [texte, setTexte] = useState("");\n  const [tasks, setTasks] = useState([{ id: 1, title: "Apprendre useState" }]);\n  return (\n    <main>\n      <h1>Mes tâches</h1>\n      <form onSubmit={(event) => { event.preventDefault(); if (!texte.trim()) return; setTasks([...tasks, { id: Date.now(), title: texte }]); setTexte(""); }}>\n        <input value={texte} onChange={(event) => setTexte(event.target.value)} placeholder="Nouvelle tâche" />\n        <button type="submit">Ajouter</button>\n      </form>\n      <ul>\n        {tasks.map((task) => <li key={task.id}>{task.title} <button onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))}>Supprimer</button></li>)}\n      </ul>\n    </main>\n  );\n}',
  },
  "react-lifting-state": {
    guided: ["Clique sur les boutons enfant.", "Repère où vit réellement le state.", "Ouvre CounterButton.jsx.", "Ajoute un troisième bouton qui reçoit le même callback."],
    server: true,
    files: {
      "src/CounterButton.jsx": 'export default function CounterButton({ label, onIncrement }) {\n  return <button onClick={onIncrement}>{label}</button>;\n}',
      "src/App.jsx": 'import { useState } from "react";\nimport CounterButton from "./CounterButton.jsx";\n\nexport default function App() {\n  const [total, setTotal] = useState(0);\n  return (\n    <main>\n      <h1>Total partagé : {total}</h1>\n      <CounterButton label="+1 depuis A" onIncrement={() => setTotal(total + 1)} />\n      <CounterButton label="+1 depuis B" onIncrement={() => setTotal(total + 1)} />\n    </main>\n  );\n}'
    },
  },
  "react-component-organization": {
    guided: ["Explore les trois fichiers JSX.", "Observe le flux App → TaskForm / TaskList.", "Ajoute une tâche depuis le formulaire.", "Ajoute un composant compteur dérivé sans créer de nouveau state."],
    server: true,
    files: {
      "src/TaskForm.jsx": 'export default function TaskForm({ value, onChange, onAdd }) {\n  return (\n    <form onSubmit={onAdd}>\n      <input value={value} onChange={onChange} placeholder="Nouvelle tâche" />\n      <button type="submit">Ajouter</button>\n    </form>\n  );\n}',
      "src/TaskList.jsx": 'export default function TaskList({ tasks, onDelete }) {\n  return <ul>{tasks.map((task) => <li key={task.id}>{task.title} <button onClick={() => onDelete(task.id)}>Supprimer</button></li>)}</ul>;\n}',
      "src/App.jsx": 'import { useState } from "react";\nimport TaskForm from "./TaskForm.jsx";\nimport TaskList from "./TaskList.jsx";\n\nexport default function App() {\n  const [value, setValue] = useState("");\n  const [tasks, setTasks] = useState([{ id: 1, title: "Découper les composants" }]);\n  return (\n    <main>\n      <h1>Task Manager · {tasks.length} tâche(s)</h1>\n      <TaskForm value={value} onChange={(event) => setValue(event.target.value)} onAdd={(event) => { event.preventDefault(); if (!value.trim()) return; setTasks([...tasks, { id: Date.now(), title: value }]); setValue(""); }} />\n      <TaskList tasks={tasks} onDelete={(id) => setTasks(tasks.filter((task) => task.id !== id))} />\n    </main>\n  );\n}'
    },
  },

  "react-useeffect": {
    guided: ["Observe l’effet au montage dans la console.", "Clique sur le compteur.", "Observe l’effet se relancer quand count change.", "Modifie le texte du document simulé."],
    server: true,
    app: 'import { useEffect, useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  useEffect(() => { console.log("Effet exécuté pour count =", count); }, [count]);\n  return <main><h1>Compteur : {count}</h1><button onClick={() => setCount(count + 1)}>+1</button></main>;\n}',
  },
  "react-effect-deps": {
    guided: ["Clique plusieurs fois sur Activer.", "Observe le timer simulé dans la console.", "Change la dépendance active.", "Ajoute un cleanup et observe les messages."],
    server: true,
    app: 'import { useEffect, useState } from "react";\n\nexport default function App() {\n  const [active, setActive] = useState(false);\n  useEffect(() => { console.log(active ? "Abonnement actif" : "Abonnement inactif"); return () => console.log("Cleanup de l’abonnement"); }, [active]);\n  return <main><h1>Dépendances & cleanup</h1><button onClick={() => setActive(!active)}>{active ? "Désactiver" : "Activer"}</button></main>;\n}',
  },
  "react-fetch": {
    guided: ["Clique sur Charger les utilisateurs.", "Observe loading puis les données simulées.", "Inspecte la console réseau pédagogique.", "Modifie le rendu de la liste."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(false);\n  function load() { setLoading(true); fetch("/api/users").then(r => r.json()).then(data => { setUsers(data); setLoading(false); }); }\n  return <main><h1>Fetch API</h1><button onClick={load}>Charger</button>{loading && <p>Chargement…</p>}<ul>{users.map(user => <li key={user.id}>{user.name}</li>)}</ul></main>;\n}',
  },
  "react-loading-errors": {
    guided: ["Teste Succès.", "Teste Erreur.", "Teste Vide.", "Observe les quatre états de l’interface."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() {\n  const [status, setStatus] = useState("idle");\n  return <main><h1>États asynchrones</h1><button onClick={() => setStatus("loading")}>Loading</button><button onClick={() => setStatus("success")}>Succès</button><button onClick={() => setStatus("error")}>Erreur</button><button onClick={() => setStatus("empty")}>Vide</button>{status === "loading" && <p>Chargement…</p>}{status === "success" && <p>Données chargées ✓</p>}{status === "error" && <p>⚠ Une erreur est survenue</p>}{status === "empty" && <p>Aucun résultat</p>}</main>;\n}',
  },
  "react-custom-hooks": {
    guided: ["Ouvre useCounter.js.", "Observe la logique réutilisable.", "Teste les deux compteurs.", "Modifie le pas d’incrément."],
    server: true,
    files: {
      "src/useCounter.js": 'export function useCounter(initial = 0) {\n  // Dans un vrai projet React : const [count, setCount] = useState(initial)\n  return { count: initial, increment: () => {} };\n}',
      "src/App.jsx": 'import { useState } from "react";\n\nfunction Counter({ label }) {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{label} : {count}</button>;\n}\n\nexport default function App() { return <main><h1>Logique réutilisable</h1><Counter label="A" /><Counter label="B" /></main>; }'
    },
  },
  "react-context": {
    guided: ["Change le thème depuis le composant parent.", "Observe plusieurs composants se mettre à jour ensemble.", "Repère le problème que Context résout.", "Compare avec un passage manuel de props."],
    server: true,
    app: 'import { useState } from "react";\n\nfunction Toolbar({ theme }) { return <section><p>Toolbar : thème {theme}</p></section>; }\nfunction Profile({ theme }) { return <section><p>Profil : thème {theme}</p></section>; }\nexport default function App() { const [theme, setTheme] = useState("clair"); return <main><h1>Context API · simulation pédagogique</h1><button onClick={() => setTheme(theme === "clair" ? "sombre" : "clair")}>Changer le thème</button><Toolbar theme={theme} /><Profile theme={theme} /><p>Dans un vrai projet, Context évite de transmettre cette donnée à travers chaque niveau.</p></main>; }',
  },
  "react-routing": {
    guided: ["Clique sur les liens Accueil / Utilisateurs.", "Observe la page changer sans rechargement.", "Ajoute une troisième route simulée.", "Compare avec React Router dans le cours."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() { const [route, setRoute] = useState("/"); return <main><nav><button onClick={() => setRoute("/")}>Accueil</button><button onClick={() => setRoute("/users")}>Utilisateurs</button></nav><p>URL simulée : {route}</p>{route === "/" ? <h1>Accueil</h1> : <section><h1>Utilisateurs</h1><p>Route sans rechargement complet.</p></section>}</main>; }',
  },
  "react-debugging": {
    guided: ["Clique pour provoquer une erreur logique.", "Lis la console navigateur.", "Corrige la valeur dans App.jsx.", "Actualise la preview."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() { const [count, setCount] = useState(0); console.log("render count =", count); return <main><h1>Débogage</h1><button onClick={() => { console.log("clic détecté"); setCount(count + 1); }}>Compteur : {count}</button><p>Utilise la console pour suivre les rendus.</p></main>; }',
  },
  "react-advanced-forms": {
    guided: ["Remplis les deux champs.", "Soumets avec des valeurs invalides.", "Corrige les erreurs.", "Ajoute une règle de validation."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App() { const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [message,setMessage]=useState(""); function submit(event){ event.preventDefault(); if(!name.trim() || !email.includes("@")){ setMessage("Vérifie le nom et l’email."); return; } setMessage("Formulaire valide ✓"); } return <main><h1>Formulaire avancé</h1><form onSubmit={submit}><input value={name} onChange={e => setName(e.target.value)} placeholder="Nom" /><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><button type="submit">Envoyer</button></form>{message && <p>{message}</p>}</main>; }',
  },
  "react-project-structure": {
    guided: ["Explore pages/, components/, hooks/ et services/.", "Ouvre App.jsx.", "Observe les responsabilités de chaque fichier.", "Ajoute un composant réutilisable sans déplacer toute la logique."],
    server: true,
    files: {
      "src/pages/Home.jsx": 'export default function Home(){ return <h2>Accueil</h2>; }',
      "src/components/Status.jsx": 'export default function Status({ text }){ return <p>Statut : {text}</p>; }',
      "src/hooks/useUsers.js": 'export function useUsers(){ /* logique réseau réutilisable dans un vrai projet */ return []; }',
      "src/services/usersApi.js": 'export async function fetchUsers(){ const response = await fetch("/api/users"); return response.json(); }',
      "src/App.jsx": 'import { useState } from "react";\nfunction Status({ text }) { return <p>Statut : {text}</p>; }\nexport default function App(){ const [section,setSection]=useState("home"); return <main><h1>Architecture React</h1><button onClick={() => setSection("home")}>Home</button><button onClick={() => setSection("users")}>Users</button><Status text={section} />{section === "home" ? <p>Page Home</p> : <p>Page Users · données via hook/service</p>}</main>; }'
    },
  },
  "react-architecture": {
    guided: ["Explore les composants du projet.", "Observe que le state reste dans App et descend par props.", "Ajoute un nouveau panneau réutilisable.", "Vérifie que la structure reste lisible sans sur-découpage."],
    server: true,
    files: {
      "src/StatCard.jsx": 'export default function StatCard({ label, value }) { return <article><strong>{value}</strong><p>{label}</p></article>; }',
      "src/Dashboard.jsx": 'import StatCard from "./StatCard.jsx";\nexport default function Dashboard({ stats }) { return <section><h2>Vue d’ensemble</h2>{stats.map((item) => <StatCard key={item.id} label={item.label} value={item.value} />)}</section>; }',
      "src/App.jsx": 'import { useState } from "react";\nimport Dashboard from "./Dashboard.jsx";\n\nexport default function App() { const stats = [{id:1,label:"Cours",value:24},{id:2,label:"Exercices",value:137}]; return <main><h1>Architecture claire</h1><Dashboard stats={stats} /></main>; }'
    }
  },
  "react-useref": {
    guided: ["Clique sur Focus pour cibler l’input grâce à la ref.", "Observe que la ref DOM ne sert pas à afficher une donnée.", "Utilise la seconde ref comme compteur mutable.", "Compare ref et state dans la console."],
    server: true,
    app: 'import { useRef, useState } from "react";\n\nexport default function App() { const inputRef = useRef(null); const clicksRef = useRef(0); const [message,setMessage]=useState("Prêt"); return <main><h1>useRef</h1><input ref={inputRef} placeholder="Champ à cibler" /><button onClick={() => { inputRef.current.focus(); setMessage("Focus appliqué"); }}>Focus</button><button onClick={() => { clicksRef.current += 1; console.log("clicksRef =", clicksRef.current); setMessage("Ref mutable : " + clicksRef.current); }}>Incrémenter la ref</button><p>{message}</p></main>; }'
  },
  "react-memoization": {
    guided: ["Change le filtre et observe le calcul dans la console.", "Repère useMemo pour la liste filtrée.", "Repère useCallback pour le handler stable.", "Supprime temporairement useMemo et compare les logs."],
    server: true,
    app: 'import { useCallback, useMemo, useState } from "react";\n\nexport default function App() { const [query,setQuery]=useState(""); const [count,setCount]=useState(0); const items=["React","Vite","JavaScript","TypeScript"]; const visible=useMemo(() => items.filter(item => item.toLowerCase().includes(query.toLowerCase())), [query]); const increment=useCallback(() => setCount(count + 1), [count]); return <main><h1>Mémoïsation</h1><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filtrer" /><button onClick={increment}>Compteur : {count}</button><ul>{visible.map(item => <li key={item}>{item}</li>)}</ul></main>; }'
  },
  "react-errors": {
    guided: ["Déclenche l’erreur simulée.", "Observe que l’interface de secours reste utilisable.", "Clique sur Réessayer.", "Modifie le message de fallback pour le rendre plus utile."],
    server: true,
    app: 'import { useState } from "react";\n\nfunction RiskyWidget({ broken }) { return broken ? <p>⚠ Le widget a rencontré une erreur simulée.</p> : <p>Widget opérationnel</p>; }\n\nexport default function App() { const [broken,setBroken]=useState(false); return <main><h1>Limite de panne pédagogique</h1><RiskyWidget broken={broken} />{broken ? <button onClick={() => setBroken(false)}>Réessayer</button> : <button onClick={() => setBroken(true)}>Simuler une erreur</button>}<p>Dans une vraie application, une Error Boundary isole ce type de panne de rendu.</p></main>; }'
  },
  "react-testing": {
    guided: ["Ouvre App.test.jsx.", "Lis le test centré sur le rôle du bouton.", "Tape npm run test dans le terminal.", "Modifie le libellé du bouton puis adapte le test."],
    server: true,
    files: {
      "src/App.jsx": 'import { useState } from "react";\nexport default function App(){ const [count,setCount]=useState(0); return <main><h1>Compteur testable</h1><button onClick={() => setCount(count+1)}>Ajouter</button><p>Valeur : {count}</p></main>; }',
      "src/App.test.jsx": 'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport App from "./App.jsx";\n\ntest("incrémente le compteur", async () => {\n  render(<App />);\n  await userEvent.click(screen.getByRole("button", { name: "Ajouter" }));\n  expect(screen.getByText("Valeur : 1")).toBeInTheDocument();\n});'
    }
  },
  "react-accessibility": {
    guided: ["Navigue au clavier avec Tab dans la preview.", "Ouvre puis ferme la boîte de dialogue.", "Repère aria-label et aria-live.", "Ajoute un label explicite au champ de recherche."],
    server: true,
    app: 'import { useRef, useState } from "react";\n\nexport default function App(){ const [open,setOpen]=useState(false); const closeRef=useRef(null); return <main><h1>Accessibilité</h1><label>Recherche <input placeholder="Rechercher" /></label><button onClick={() => setOpen(true)}>Ouvrir les détails</button><p aria-live="polite">{open ? "Dialogue ouvert" : "Dialogue fermé"}</p>{open && <section role="dialog" aria-label="Détails du cours"><h2>Détails</h2><p>Un vrai bouton, des labels et un focus visible améliorent l’usage clavier.</p><button ref={closeRef} onClick={() => setOpen(false)}>Fermer</button></section>}</main>; }'
  },
  "react-vite-config": {
    guided: ["Explore vite.config.js et .env.example.", "Tape npm run build dans le terminal.", "Observe la création simulée de dist/.", "Lance npm run preview et compare avec npm run dev."],
    server: true,
    files: {
      "vite.config.js": 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()], resolve: { alias: { "@": "/src" } } });',
      ".env.example": 'VITE_API_URL=https://api.example.dev\n# Ne place jamais de secret serveur dans une variable VITE_*',
      "src/App.jsx": 'export default function App(){ return <main><h1>Configuration Vite</h1><p>API publique : import.meta.env.VITE_API_URL</p><p>Teste build puis preview dans le terminal.</p></main>; }'
    }
  },
  "react-refactor": {
    guided: ["Teste l’application avant de modifier le code.", "Repère la duplication entre les cartes.", "Extrais un composant CourseCard réutilisable.", "Relance la preview et vérifie que le comportement reste identique."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App(){ const [selected,setSelected]=useState(""); return <main><h1>Avant refactorisation</h1><article><h2>React</h2><button onClick={() => setSelected("React")}>Choisir React</button></article><article><h2>Vite</h2><button onClick={() => setSelected("Vite")}>Choisir Vite</button></article>{selected && <p>Sélection : {selected}</p>}</main>; }'
  },
  "react-ts": {
    guided: ["Ouvre UserCard.tsx et repère les types.", "Modifie les données dans App.jsx et observe la preview.", "Ajoute une prop optionnelle dans le fichier TSX.", "Compare ce que TypeScript vérifie avant l’exécution avec ce que la preview affiche."],
    server: true,
    files: {
      "src/UserCard.tsx": 'type User = { id: number; name: string; role?: string };\n\ntype UserCardProps = { user: User };\n\nexport default function UserCard({ user }: UserCardProps) {\n  return <article><h2>{user.name}</h2><p>{user.role ?? "Membre"}</p></article>;\n}',
      "src/App.jsx": 'export default function App(){ const users=[{id:1,name:"Ada",role:"Frontend"},{id:2,name:"Grace",role:"Platform"}]; return <main><h1>React + TypeScript</h1>{users.map(user => <article key={user.id}><h2>{user.name}</h2><p>{user.role}</p></article>)}</main>; }'
    }
  },
  "react-dependencies": {
    guided: ["Ouvre package.json.", "Tape npm run pour voir les scripts.", "Simule npm install zod puis npm uninstall zod.", "Observe la différence entre dependencies et devDependencies dans le fichier."],
    server: true,
    files: {
      "package.json": '{\n  "name": "production-app",\n  "private": true,\n  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview", "test": "vitest" },\n  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1" },\n  "devDependencies": { "vite": "latest", "vitest": "latest" }\n}',
      "src/App.jsx": 'export default function App(){ return <main><h1>Dépendances sous contrôle</h1><p>Utilise le terminal pour explorer les scripts et simuler une installation.</p></main>; }'
    }
  },
  "react-integration-tests": {
    guided: ["Ouvre Checkout.test.jsx.", "Lis le scénario utilisateur complet.", "Tape npm run test.", "Modifie le libellé du bouton puis adapte le test."],
    server: true,
    files: {
      "src/App.jsx": 'import { useState } from "react";\nexport default function App(){ const [step,setStep]=useState("cart"); return <main><h1>Boutique</h1>{step === "cart" ? <button onClick={() => setStep("success")}>Commander</button> : <p>Commande confirmée</p>}</main>; }',
      "src/Checkout.test.jsx": 'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport App from "./App.jsx";\n\ntest("termine le parcours de commande", async () => {\n  render(<App />);\n  await userEvent.click(screen.getByRole("button", { name: "Commander" }));\n  expect(screen.getByText("Commande confirmée")).toBeInTheDocument();\n});'
    }
  },
  "react-resilience": {
    guided: ["Charge les données avec le bouton.", "Observe loading puis success.", "Active le mode erreur puis réessaie.", "Vide les données pour observer l’état empty."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App(){ const [status,setStatus]=useState("idle"); const [items,setItems]=useState([]); function load(fail){ setStatus("loading"); setTimeout(() => { if(fail){ setStatus("error"); return; } setItems([{id:1,name:"React"},{id:2,name:"Vite"}]); setStatus("success"); }, 400); } return <main><h1>Résilience</h1><button onClick={() => load(false)}>Charger</button><button onClick={() => load(true)}>Simuler une erreur</button><button onClick={() => {setItems([]);setStatus("success");}}>Vider</button>{status === "loading" && <p>Chargement…</p>}{status === "error" && <p>⚠ Erreur réseau <button onClick={() => load(false)}>Réessayer</button></p>}{status === "success" && items.length === 0 && <p>Aucune donnée disponible.</p>}{items.map(item => <p key={item.id}>{item.name}</p>)}</main>; }'
  },
  "react-security": {
    guided: ["Teste une saisie contenant des balises HTML.", "Observe que React affiche le texte plutôt que de l’exécuter.", "Ouvre security-notes.md.", "Repère pourquoi un secret serveur ne doit jamais être exposé via VITE_* ."],
    server: true,
    files: {
      "security-notes.md": '# Sécurité frontend\n\n- Les variables VITE_* sont publiques dans le bundle.\n- Les secrets restent côté serveur.\n- Ne contourne pas l’échappement React avec dangerouslySetInnerHTML sans sanitation.\n- Autorisation réelle = serveur, pas seulement interface.',
      ".env.example": 'VITE_PUBLIC_API_URL=https://api.example.dev\n# DATABASE_PASSWORD=NE_JAMAIS_METTRE_ICI',
      "src/App.jsx": 'import { useState } from "react";\nexport default function App(){ const [value,setValue]=useState("<img src=x onerror=alert(1)>"); return <main><h1>Rendu sûr par défaut</h1><input value={value} onChange={e => setValue(e.target.value)} /><p>Contenu utilisateur :</p><pre>{value}</pre><p>React traite cette valeur comme du texte dans ce rendu pédagogique.</p></main>; }'
    }
  },
  "react-production-performance": {
    guided: ["Clique sur Charger les paramètres.", "Observe le chargement différé simulé.", "Ouvre SettingsPage.jsx.", "Lance npm run build pour relier code splitting et production."],
    server: true,
    files: {
      "src/SettingsPage.jsx": 'export default function SettingsPage(){ return <section><h2>Paramètres</h2><p>Module chargé à la demande.</p></section>; }',
      "src/App.jsx": 'import { useState } from "react";\nexport default function App(){ const [loading,setLoading]=useState(false); const [loaded,setLoaded]=useState(false); function load(){ setLoading(true); setTimeout(() => {setLoaded(true);setLoading(false);},450); } return <main><h1>Chargement différé</h1>{!loaded && <button onClick={load}>Charger les paramètres</button>}{loading && <p>Chargement du chunk…</p>}{loaded && <section><h2>Paramètres</h2><p>Module chargé à la demande.</p></section>}</main>; }'
    }
  },
  "react-build-deploy": {
    guided: ["Tape npm run build.", "Observe la génération de dist/.", "Lance npm run preview.", "Ouvre deploy-notes.md et compare build, preview et hébergement."],
    server: true,
    files: {
      "deploy-notes.md": '# Déploiement Vite\n\n1. npm run build\n2. vérifier dist/\n3. npm run preview\n4. publier dist/ sur un hébergeur statique\n\nLa preview locale ne remplace pas le déploiement réel.',
      "src/App.jsx": 'export default function App(){ return <main><h1>Production prête</h1><p>Construis puis prévisualise la version de production depuis le terminal.</p></main>; }'
    }
  },
  "react-maintenance": {
    guided: ["Explore README.md et CHANGELOG.md.", "Repère la duplication dans App.jsx.", "Extrais une carte réutilisable.", "Relance les tests puis le build pour vérifier qu’un refactor reste sûr."],
    server: true,
    files: {
      "README.md": '# Production App\n\n## Scripts\n- npm run dev\n- npm run test\n- npm run build\n\n## Convention\nLes composants réutilisables restent petits et testables.',
      "CHANGELOG.md": '# Changelog\n\n## 1.0.0\n- Première version de production.',
      "src/App.test.jsx": 'import { render, screen } from "@testing-library/react";\nimport App from "./App.jsx";\ntest("affiche les parcours", () => { render(<App />); expect(screen.getByText("React")).toBeInTheDocument(); });',
      "src/App.jsx": 'export default function App(){ return <main><h1>Maintenance</h1><article><h2>React</h2><p>36 leçons</p></article><article><h2>JavaScript</h2><p>41 leçons</p></article><p>Refactorise ces cartes sans changer le rendu.</p></main>; }'
    }
  },
  "r5-production-app": {
    guided: ["Explore les fichiers TSX, tests et documentation.", "Teste les états résilients dans la preview.", "Tape npm run test puis npm run build.", "Lance npm run preview et vérifie la checklist de production."],
    server: true,
    files: {
      "src/types.ts": 'export type User = { id: number; name: string; role: string };',
      "src/UserCard.tsx": 'import type { User } from "./types";\nexport default function UserCard({ user }: { user: User }) { return <article><h2>{user.name}</h2><p>{user.role}</p></article>; }',
      "src/App.test.jsx": 'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport App from "./App.jsx";\ntest("récupère après une erreur", async () => { render(<App />); await userEvent.click(screen.getByRole("button", {name:"Simuler une erreur"})); await userEvent.click(screen.getByRole("button", {name:"Réessayer"})); expect(screen.getByText("Application opérationnelle")).toBeInTheDocument(); });',
      "PRODUCTION-CHECKLIST.md": '# Checklist\n\n- Types vérifiés\n- Tests verts\n- États loading/error/empty\n- Aucun secret frontend\n- Build réussi\n- Preview vérifiée\n- Documentation à jour',
      "src/App.jsx": 'import { useState } from "react";\nexport default function App(){ const [error,setError]=useState(false); const [ready,setReady]=useState(true); const users=[{id:1,name:"Ada",role:"Frontend"},{id:2,name:"Grace",role:"Platform"}]; if(error) return <main><h1>Erreur récupérable</h1><button onClick={() => {setError(false);setReady(true);}}>Réessayer</button></main>; return <main><h1>Application de production</h1><button onClick={() => setError(true)}>Simuler une erreur</button>{ready && <p>Application opérationnelle</p>}{users.map(user => <article key={user.id}><h2>{user.name}</h2><p>{user.role}</p></article>)}</main>; }'
    }
  },
  "r4-multipage-dashboard": {
    guided: ["Navigue entre Dashboard et Paramètres.", "Teste la recherche et le focus via useRef.", "Observe les données dérivées avec useMemo.", "Lance npm run test puis npm run build dans le terminal."],
    server: true,
    files: {
      "src/StatCard.jsx": 'export default function StatCard({ label, value }) { return <article><strong>{value}</strong><p>{label}</p></article>; }',
      "src/App.test.jsx": 'import { render, screen } from "@testing-library/react";\nimport App from "./App.jsx";\ntest("affiche le dashboard", () => { render(<App />); expect(screen.getByRole("heading", {name:"Dashboard"})).toBeInTheDocument(); });',
      "src/App.jsx": 'import { useMemo, useRef, useState } from "react";\nimport StatCard from "./StatCard.jsx";\n\nexport default function App(){ const [page,setPage]=useState("dashboard"); const [query,setQuery]=useState(""); const searchRef=useRef(null); const stats=[{id:1,label:"Cours terminés",value:24},{id:2,label:"Exercices réussis",value:137},{id:3,label:"Projets",value:4}]; const visibles=useMemo(() => stats.filter(item => item.label.toLowerCase().includes(query.toLowerCase())), [query]); return <main><nav aria-label="Navigation principale"><button onClick={() => setPage("dashboard")}>Dashboard</button><button onClick={() => setPage("settings")}>Paramètres</button></nav>{page === "dashboard" ? <section><h1>Dashboard</h1><label>Rechercher <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} /></label><button onClick={() => searchRef.current.focus()}>Focus recherche</button>{visibles.map(item => <StatCard key={item.id} label={item.label} value={item.value} />)}</section> : <section><h1>Paramètres</h1><p>Préférences du dashboard.</p></section>}</main>; }'
    }
  },
  "r3-api-explorer": {
    guided: ["Charge les utilisateurs.", "Filtre la liste avec la recherche.", "Ouvre un détail utilisateur.", "Teste les états Loading / Error / Empty."],
    server: true,
    app: 'import { useState } from "react";\n\nexport default function App(){ const [users,setUsers]=useState([]); const [query,setQuery]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [selected,setSelected]=useState(null); function load(){ setLoading(true); setError(""); fetch("/api/users").then(r => r.json()).then(data => { setUsers(data); setLoading(false); }).catch(() => { setError("Impossible de charger les utilisateurs"); setLoading(false); }); } const visible=users.filter(user => user.name.toLowerCase().includes(query.toLowerCase())); return <main><h1>API Explorer</h1><button onClick={load}>Charger les utilisateurs</button><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher" />{loading && <p>Chargement…</p>}{error && <p>⚠ {error}</p>}{!loading && !error && users.length > 0 && visible.length === 0 && <p>Aucun résultat</p>}{selected ? <section><button onClick={() => setSelected(null)}>← Retour</button><h2>{selected.name}</h2><p>{selected.email}</p></section> : <ul>{visible.map(user => <li key={user.id}><button onClick={() => setSelected(user)}>{user.name}</button></li>)}</ul>}</main>; }',
  },
  "r2-task-manager": {
    guided: ["Teste l’ajout d’une tâche dans la preview.", "Termine puis supprime une tâche.", "Teste les trois filtres.", "Ouvre les composants et personnalise l’interface sans casser le flux de données."],
    server: true,
    files: {
      "src/TaskForm.jsx": 'export default function TaskForm({ value, onChange, onAdd }) {\n  return (\n    <form onSubmit={onAdd}>\n      <input value={value} onChange={onChange} placeholder="Nouvelle tâche" />\n      <button type="submit">Ajouter</button>\n    </form>\n  );\n}',
      "src/TaskList.jsx": 'export default function TaskList({ tasks, onToggle, onDelete }) {\n  return (\n    <ul>\n      {tasks.map((task) => <li key={task.id}>{task.title} <button onClick={() => onToggle(task.id)}>{task.done ? "Réactiver" : "Terminer"}</button> <button onClick={() => onDelete(task.id)}>Supprimer</button></li>)}\n    </ul>\n  );\n}',
      "src/App.jsx": 'import { useState } from "react";\nimport TaskForm from "./TaskForm.jsx";\nimport TaskList from "./TaskList.jsx";\n\nexport default function App() {\n  const [value, setValue] = useState("");\n  const [filter, setFilter] = useState("all");\n  const [tasks, setTasks] = useState([{ id: 1, title: "Finir le niveau 2", done: false }, { id: 2, title: "Tester les filtres", done: true }]);\n  const visibleTasks = tasks.filter((task) => filter === "all" || (filter === "active" && !task.done) || (filter === "done" && task.done));\n\n  return (\n    <main>\n      <h1>Task Manager</h1>\n      <p>{tasks.length} tâche(s) au total</p>\n      <TaskForm value={value} onChange={(event) => setValue(event.target.value)} onAdd={(event) => { event.preventDefault(); if (!value.trim()) return; setTasks([...tasks, { id: Date.now(), title: value, done: false }]); setValue(""); }} />\n      <div>\n        <button onClick={() => setFilter("all")}>Toutes</button>\n        <button onClick={() => setFilter("active")}>Actives</button>\n        <button onClick={() => setFilter("done")}>Terminées</button>\n      </div>\n      <TaskList tasks={visibleTasks} onToggle={(id) => setTasks(tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task))} onDelete={(id) => setTasks(tasks.filter((task) => task.id !== id))} />\n    </main>\n  );\n}'
    },
  },
};

function reactSandboxRuntime(files, studioId) {
  const host = window.parent;
  const send = (type, data) => host.postMessage({ cahierReact: true, id: studioId, type, data }, "*");
  ["log", "info", "warn", "error"].forEach((level) => {
    console[level] = (...args) => send("log", { level, text: args.map((x) => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" ") });
  });
  window.addEventListener("error", (event) => send("error", { text: event.message || "Erreur inconnue" }));

  const stateStore = new Map();
  const effectStore = new Map();
  const refStore = new Map();
  const memoStore = new Map();
  const demoUsers = [
    {id:1,name:"Ada Lovelace",email:"ada@example.dev"},
    {id:2,name:"Grace Hopper",email:"grace@example.dev"},
    {id:3,name:"Linus Torvalds",email:"linus@example.dev"}
  ];
  window.fetch = (url) => { console.log("[fetch simulé]", url); return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(demoUsers.map(x=>({...x})))}); };
  let renderTick = 0;
  let rootNode = null;

  function stripComments(source) {
    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  }
  function balanced(source, start, open, close) {
    let depth = 0, quote = null, escape = false;
    for (let i = start; i < source.length; i++) {
      const ch = source[i];
      if (quote) { if (escape) escape = false; else if (ch === "\\") escape = true; else if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === open) depth++;
      if (ch === close && --depth === 0) return i;
    }
    return -1;
  }
  function extractFunctions(source) {
    const out = {};
    const clean = stripComments(source).replace(/^\s*import[^;]+;?/gm, "").replace(/export\s+default\s+/g, "").replace(/export\s+/g, "");
    const re = /function\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{/g;
    let m;
    while ((m = re.exec(clean))) {
      const open = clean.indexOf("{", m.index), close = balanced(clean, open, "{", "}");
      if (close < 0) throw new Error("Accolade fermante manquante dans le composant " + m[1] + ".");
      out[m[1]] = { name: m[1], params: m[2].trim(), body: clean.slice(open + 1, close) };
      re.lastIndex = close + 1;
    }
    return out;
  }
  const defs = {};
  Object.keys(files).filter((name) => /\.jsx$/.test(name)).forEach((name) => Object.assign(defs, extractFunctions(files[name])));
  if (!defs.App) throw new Error("Aucun composant `App` détecté. Vérifie `src/App.jsx`.");

  function splitTopLevel(text, separator) {
    const parts = []; let start = 0, depth = 0, quote = null, escape = false;
    for (let i=0;i<text.length;i++) { const ch=text[i]; if(quote){ if(escape) escape=false; else if(ch==='\\') escape=true; else if(ch===quote) quote=null; continue; } if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;} if("([{<".includes(ch)) depth++; if(")]}>".includes(ch)) depth--; if(ch===separator&&depth===0){parts.push(text.slice(start,i));start=i+1;} }
    parts.push(text.slice(start)); return parts;
  }
  function evalExpr(expr, scope) {
    const names = Object.keys(scope), values = names.map((k) => scope[k]);
    try { return Function(...names, '"use strict"; return (' + expr + ');')(...values); }
    catch (err) { throw new Error("Expression JSX invalide : " + expr.trim() + " — " + err.message); }
  }
  function parseAttributes(raw, scope) {
    const attrs = {}; let i = 0;
    while (i < raw.length) {
      while (/\s/.test(raw[i] || "")) i++;
      if (i >= raw.length) break;
      const nm = /^[A-Za-z_:][\w:.-]*/.exec(raw.slice(i)); if (!nm) { i++; continue; }
      const name = nm[0]; i += name.length; while (/\s/.test(raw[i] || "")) i++;
      if (raw[i] !== "=") { attrs[name] = true; continue; }
      i++; while (/\s/.test(raw[i] || "")) i++;
      if (raw[i] === '"' || raw[i] === "'") { const q=raw[i++]; let val=""; while(i<raw.length&&raw[i]!==q) val+=raw[i++]; i++; attrs[name]=val; }
      else if (raw[i] === "{") { const end=balanced(raw,i,"{","}"); if(end<0) throw new Error("Accolade d’attribut non fermée."); attrs[name]=evalExpr(raw.slice(i+1,end),scope); i=end+1; }
      else { const val=/^[^\s]+/.exec(raw.slice(i)); attrs[name]=val?val[0]:""; i+=val?val[0].length:0; }
    }
    return attrs;
  }
  function findTagEnd(text, start) {
    let quote=null, braces=0;
    for(let i=start;i<text.length;i++){const ch=text[i]; if(quote){if(ch===quote&&text[i-1]!=="\\")quote=null;continue;} if(ch==='"'||ch==="'"){quote=ch;continue;} if(ch==="{")braces++; else if(ch==="}")braces--; else if(ch===">"&&braces===0)return i;} return -1;
  }
  function parseJSX(text, scope, path) {
    text = text.trim();
    const nodes=[]; let i=0;
    while(i<text.length){
      if(text.startsWith("</",i)) break;
      if(text[i]==="<"){
        if(text.startsWith("<>",i)){
          const end=text.lastIndexOf("</>"); if(end<0)throw new Error("Fragment JSX non fermé."); nodes.push(...parseJSX(text.slice(i+2,end),scope,path+".f")); i=end+3; continue;
        }
        const end=findTagEnd(text,i+1); if(end<0)throw new Error("Balise JSX non fermée.");
        let head=text.slice(i+1,end).trim(); const self=/\/$/.test(head); if(self)head=head.replace(/\/$/,"").trim();
        const nameMatch=/^([A-Za-z][\w.]*)/.exec(head); if(!nameMatch)throw new Error("Nom de balise JSX invalide."); const tag=nameMatch[1]; const attrs=parseAttributes(head.slice(tag.length),scope);
        if(self){nodes.push(makeNode(tag,attrs,[],scope,path+"."+nodes.length));i=end+1;continue;}
        let cursor=end+1, depth=1, closeStart=-1, closeEnd=-1;
        while(cursor<text.length){const op=text.indexOf("<"+tag,cursor), cl=text.indexOf("</"+tag,cursor); if(cl<0)break; if(op>=0&&op<cl){const oe=findTagEnd(text,op+1); if(oe>=0&&!/\/\s*>$/.test(text.slice(op,oe+1)))depth++; cursor=oe+1;} else {depth--; if(depth===0){closeStart=cl;closeEnd=findTagEnd(text,cl+2);break;} cursor=findTagEnd(text,cl+2)+1;}}
        if(closeStart<0)throw new Error("Balise <"+tag+"> non fermée.");
        const children=parseJSX(text.slice(end+1,closeStart),scope,path+"."+nodes.length); nodes.push(makeNode(tag,attrs,children,scope,path+"."+nodes.length)); i=closeEnd+1; continue;
      }
      if(text[i]==="{"){
        const end=balanced(text,i,"{","}"); if(end<0)throw new Error("Expression JSX non fermée.");
        const expr=text.slice(i+1,end).trim();
        renderExpression(expr,scope,path+".e"+nodes.length).forEach((node)=>nodes.push(node));
        i=end+1; continue;
      }
      let nextTag=text.indexOf("<",i), nextExpr=text.indexOf("{",i); let next=[nextTag,nextExpr].filter(x=>x>=0).sort((a,b)=>a-b)[0]; if(next==null)next=text.length;
      const raw=text.slice(i,next).replace(/\s+/g," "); if(raw.trim())nodes.push(document.createTextNode(raw)); i=next;
    }
    return nodes;
  }
  function textNodeFor(value) {
    if (value === false || value === true || value == null) return [];
    if (value instanceof Node) return [value];
    if (Array.isArray(value)) return value.flatMap(textNodeFor);
    return [document.createTextNode(String(value))];
  }
  function stripOuterParens(value) {
    let out=value.trim();
    while(out[0]==="(" && balanced(out,0,"(",")")===out.length-1) out=out.slice(1,-1).trim();
    return out;
  }
  function findTopLevelOperator(expr, operator) {
    let par=0, br=0, cur=0, quote=null, escape=false;
    for(let i=0;i<=expr.length-operator.length;i++){
      const ch=expr[i];
      if(quote){if(escape)escape=false;else if(ch==="\\")escape=true;else if(ch===quote)quote=null;continue;}
      if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
      if(ch==='(')par++; else if(ch===')')par--; else if(ch==='[')br++; else if(ch===']')br--; else if(ch==='{')cur++; else if(ch==='}')cur--;
      if(par===0&&br===0&&cur===0&&expr.slice(i,i+operator.length)===operator)return i;
    }
    return -1;
  }
  function findConditionalColon(expr,start){
    let par=0,br=0,cur=0,quote=null,escape=false,nested=0;
    for(let i=start;i<expr.length;i++){
      const ch=expr[i];
      if(quote){if(escape)escape=false;else if(ch==="\\")escape=true;else if(ch===quote)quote=null;continue;}
      if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
      if(ch==='(')par++; else if(ch===')')par--; else if(ch==='[')br++; else if(ch===']')br--; else if(ch==='{')cur++; else if(ch==='}')cur--;
      if(par===0&&br===0&&cur===0){if(ch==='?')nested++;else if(ch===':'&&nested===0)return i;else if(ch===':'&&nested>0)nested--;}
    }
    return -1;
  }
  function jsxOrValue(source, scope, path) {
    const value=stripOuterParens(source);
    if(value.startsWith("<")) return parseJSX(value,scope,path);
    return textNodeFor(evalExpr(value,scope));
  }
  function renderExpression(expr, scope, path) {
    expr=expr.trim();
    if(!expr)return [];
    const q=findTopLevelOperator(expr,"?");
    if(q>=0){const colon=findConditionalColon(expr,q+1);if(colon>q){const condition=evalExpr(expr.slice(0,q),scope);return jsxOrValue(condition?expr.slice(q+1,colon):expr.slice(colon+1),scope,path+".c");}}
    const and=findTopLevelOperator(expr,"&&");
    if(and>=0){const left=evalExpr(expr.slice(0,and),scope);return left?jsxOrValue(expr.slice(and+2),scope,path+".a"):[];}
    const mapMatch=/^([\s\S]+)\.map\s*\(\s*\(?\s*([A-Za-z_$][\w$]*)\s*(?:,\s*([A-Za-z_$][\w$]*))?\s*\)?\s*=>\s*([\s\S]+)\)$/.exec(expr);
    if(mapMatch){
      const collection=evalExpr(mapMatch[1],scope);
      if(!Array.isArray(collection))throw new Error("`.map()` attend un tableau dans cet exercice.");
      const body=stripOuterParens(mapMatch[4]);
      return collection.flatMap((item,index)=>{
        const childScope={...scope,[mapMatch[2]]:item}; if(mapMatch[3])childScope[mapMatch[3]]=index;
        return body.startsWith("<")?parseJSX(body,childScope,path+".m"+index):textNodeFor(evalExpr(body,childScope));
      });
    }
    return textNodeFor(evalExpr(expr,scope));
  }
  function makeNode(tag, attrs, children, scope, path) {
    if (/^[A-Z]/.test(tag)) return renderComponent(tag, attrs, path);
    const el=document.createElement(tag);
    Object.entries(attrs).forEach(([name,value])=>{
      if(name==="className") el.setAttribute("class",value);
      else if(/^on[A-Z]/.test(name)&&typeof value==="function") el.addEventListener(name.slice(2).toLowerCase(),value);
      else if(name==="style"&&value&&typeof value==="object") Object.assign(el.style,value);
      else if(name==="ref"&&value&&typeof value==="object") value.current=el;
      else if(name!=="key"&&value!==false&&value!=null) el.setAttribute(name,value===true?"":String(value));
    });
    children.forEach(ch=>el.append(ch)); return el;
  }
  function componentScope(def, props, path) {
    const scope={...props};
    if(def.params.startsWith("{")){ def.params.slice(1,-1).split(",").map(x=>x.trim()).filter(Boolean).forEach(k=>{const key=k.split("=")[0].trim(); scope[key]=props[key];}); }
    else if(def.params) scope[def.params]=props;
    const stateRe=/const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*useState\s*\(([^)]*)\)\s*;?/g; let m, idx=0;
    while((m=stateRe.exec(def.body))){const key=path+":"+idx++; if(!stateStore.has(key)){let initial; try{initial=evalExpr(m[3]||"undefined",scope);}catch(_){initial=undefined;} stateStore.set(key,initial);} scope[m[1]]=stateStore.get(key); scope[m[2]]=(next)=>{const prev=stateStore.get(key); stateStore.set(key,typeof next==="function"?next(prev):next); renderRoot();};}
    let refIndex=0, memoIndex=0;
    scope.useState=(v)=>[v,()=>{}];
    scope.useRef=(initial)=>{ const key=path+":ref:"+(refIndex++); if(!refStore.has(key)) refStore.set(key,{current:initial}); return refStore.get(key); };
    scope.useMemo=(fn,deps)=>{ const key=path+":memo:"+(memoIndex++); const prev=memoStore.get(key); const next=Array.isArray(deps)?deps.slice():null; const changed=!prev || next===null || prev.deps===null || next.length!==prev.deps.length || next.some((v,i)=>v!==prev.deps[i]); if(changed){ const value=fn(); memoStore.set(key,{deps:next,value}); return value; } return prev.value; };
    scope.useCallback=(fn,deps)=>scope.useMemo(()=>fn,deps);
    scope.memo=(component)=>component;
    const plainConst=/const\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g; let c;
    while((c=plainConst.exec(def.body))){
      if(c[2].includes("useState(")) continue;
      try{ scope[c[1]]=evalExpr(c[2],scope); }catch(_){ /* une expression dépendante peut être évaluée directement dans le JSX */ }
    }
    const localFn=/function\s+([a-z_$][\w$]*)\s*\(([^)]*)\)\s*\{/g; let fm;
    while((fm=localFn.exec(def.body))){
      const open=def.body.indexOf("{",fm.index), close=balanced(def.body,open,"{","}"); if(close<0)continue;
      const src=def.body.slice(fm.index,close+1);
      try{ scope[fm[1]]=Function(...Object.keys(scope),'"use strict"; return ('+src+');')(...Object.values(scope)); }catch(_){}
      localFn.lastIndex=close+1;
    }
    let effectIndex=0; scope.useEffect=(fn,deps)=>{
      const effectKey=path+":effect:"+(effectIndex++); const prev=effectStore.get(effectKey);
      const next=Array.isArray(deps)?deps.slice():null;
      const changed=!prev || next===null || prev.deps===null || next.length!==prev.deps.length || next.some((v,i)=>v!==prev.deps[i]);
      if(changed){ if(prev&&typeof prev.cleanup==="function"){try{prev.cleanup();}catch(_){}} queueMicrotask(()=>{try{const cleanup=fn();effectStore.set(effectKey,{deps:next,cleanup});}catch(err){console.error(err);}}); }
    };
    scope.fetch=(url)=>{
      console.log("[fetch simulé]", url);
      const demo=[{id:1,name:"Ada Lovelace",email:"ada@example.dev"},{id:2,name:"Grace Hopper",email:"grace@example.dev"},{id:3,name:"Linus Torvalds",email:"linus@example.dev"}];
      return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(demo)});
    };
    scope.console=console;
    return scope;
  }
  function findReturnJSX(body){const m=/return\s*/g; let last=null, x; while((x=m.exec(body)))last=x; if(!last)throw new Error("Le composant ne contient pas de `return`."); let i=last.index+last[0].length; while(/\s/.test(body[i]||""))i++; if(body[i]==="("){const end=balanced(body,i,"(",")"); if(end<0)throw new Error("Parenthèse de return non fermée."); return body.slice(i+1,end);} const semi=body.indexOf(";",i); return body.slice(i,semi>=0?semi:body.length).trim();}
  function runPrelude(def, scope){let pre=def.body.slice(0,def.body.indexOf("return")); pre=pre.replace(/const\s*\[\s*[A-Za-z_$][\w$]*\s*,\s*[A-Za-z_$][\w$]*\s*\]\s*=\s*useState\s*\([^)]*\)\s*;?/g,""); if(!pre.trim())return; try{Function(...Object.keys(scope),'"use strict";'+pre)(...Object.values(scope));}catch(err){throw new Error(def.name+" : "+err.message);}}
  function renderComponent(name, props, path){const def=defs[name]; if(!def)throw new Error("Composant `"+name+"` introuvable. Vérifie l’import ou son nom."); const scope=componentScope(def,props,path); runPrelude(def,scope); const frag=document.createDocumentFragment(); parseJSX(findReturnJSX(def.body),scope,path).forEach(n=>frag.append(n)); return frag;}
  function renderRoot(){renderTick++; rootNode.replaceChildren(); try{rootNode.append(renderComponent("App",{},"App")); send("render",{tick:renderTick});}catch(err){send("error",{text:err.message}); const box=document.createElement("div");box.style.cssText="font-family:system-ui;padding:20px;color:#9f1239;background:#fff1f2;border:1px solid #fecdd3;border-radius:12px";box.innerHTML="<strong>⚠ Erreur React</strong><p>"+String(err.message).replace(/[&<>]/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))+"</p>";rootNode.append(box);}}
  window.addEventListener("DOMContentLoaded",()=>{rootNode=document.getElementById("root");renderRoot();});
}

function reactStudioSrcdoc(files, id) {
  const css = files["src/App.css"] || "";
  const payload = JSON.stringify(files).replace(/</g, "\\u003c");
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{min-height:100%;margin:0}body{font-family:system-ui,sans-serif;padding:24px;box-sizing:border-box;background:#fff;color:#172033}'+css.replace(/<\/style/gi,"</style")+'</style></head><body><div id="root"></div><script>('+reactSandboxRuntime.toString()+')('+payload+','+JSON.stringify(id)+');</script></body></html>';
}

function renderReactLessonStudio(lesson) {
  const preset = REACT_STUDIO_PRESETS[lesson.id];
  if (!preset) return null;
  const id = "react-studio-" + lesson.id + "-" + Math.random().toString(36).slice(2);
  let files = preset.fresh ? {} : reactStarterProject(Object.assign({}, preset.files || {}, preset.app ? { "src/App.jsx": preset.app } : {}));
  let cwd = preset.fresh ? "/home/student/projects" : "/home/student/projects/mon-app-react";
  let projectReady = !preset.fresh, installed = !preset.fresh, server = !!preset.server, buildReady = false;
  let promptMode = null, promptProject = "mon-app-react", promptFramework = null;
  const editors = {};

  const statusDot = h("span", { class: "studio-status-dot" });
  const statusText = h("span", {}, server ? "localhost:5173" : "Serveur non démarré");
  const browserStatus = h("div", { class: "studio-browser-status" }, statusDot, statusText);
  const preview = h("iframe", { class:"lab-preview react-preview", sandbox:"allow-scripts allow-forms", title:"Navigateur React simulé" });
  const consoleBody = h("div", { class:"studio-console-body", "aria-live":"polite" }, h("p",{class:"muted small"},"La console navigateur affichera les `console.log` et les erreurs React."));
  const terminalBody = h("div", { class:"studio-terminal-body", role:"log", "aria-live":"polite" });
  const termInput = h("input", { class:"studio-terminal-input", autocomplete:"off", spellcheck:"false", "aria-label":"Commande du terminal" });
  const termPrompt = h("span", { class:"studio-terminal-prompt" });
  const explorer = h("div", { class:"studio-explorer-tree" });
  const editorTitle = h("span", {}, "Aucun fichier");
  const editorArea = h("div", { class:"studio-editor-area" }, h("p",{class:"muted small"},"Crée ou ouvre un projet pour modifier ses fichiers."));
  const guideStep = h("strong", {}, "Étape 1/"+preset.guided.length);
  const guideText = h("span", {}, preset.guided[0]);
  let guideIndex = 0, hmrTimer = 0;

  function addTerminal(text, cls) { terminalBody.append(h("div", { class:"studio-terminal-line "+(cls||"") }, text)); terminalBody.scrollTop=terminalBody.scrollHeight; }
  function addConsole(level,text){const empty=consoleBody.querySelector(".muted");if(empty)empty.remove();consoleBody.append(h("div",{class:"con-line "+level},(LEVEL_PREFIX[level]||"")+text));consoleBody.scrollTop=consoleBody.scrollHeight;}
  function setGuide(index){guideIndex=Math.max(0,Math.min(index,preset.guided.length-1));guideStep.textContent="Étape "+(guideIndex+1)+"/"+preset.guided.length;guideText.textContent=preset.guided[guideIndex];}
  function inProject(){return cwd!=="/home/student/projects";}
  function updatePrompt(){termPrompt.textContent=(inProject()?"~/projects/"+promptProject:"~/projects")+" $";}
  function setServer(next,label){server=next;statusDot.classList.toggle("online",server);statusText.textContent=server?(label||"localhost:5173"):"Serveur non démarré";if(server)runPreview();else preview.srcdoc='<p style="font-family:system-ui;padding:2rem;color:#64748b">Démarre Vite avec <code>npm run dev</code> pour ouvrir la preview.</p>';}
  function runPreview(){if(!server)return;consoleBody.replaceChildren(h("p",{class:"muted small"},"Actualisation de la preview…"));preview.srcdoc=reactStudioSrcdoc(files,id);}
  function scheduleHMR(){if(!server)return;clearTimeout(hmrTimer);hmrTimer=setTimeout(()=>{addTerminal("[vite] hmr update /src/App.jsx","hmr");runPreview();},450);}

  function makeFileEditor(name){
    if(editors[name])return editors[name];
    const lang=/\.jsx$/.test(name)?"react":/\.css$/.test(name)?"css":/\.json$/.test(name)?"js":"html";
    const ed=makeEditor(files[name]||"",Math.max(10,Math.min(22,(files[name]||"").split("\n").length+2)),()=>{files[name]=ed.value;runPreview();},lang);
    ed.addEventListener("input",()=>{files[name]=ed.value;scheduleHMR();});editors[name]=ed;return ed;
  }
  function openFile(name){if(!(name in files))return;editorTitle.textContent=name;editorArea.replaceChildren(makeFileEditor(name));setGuide(Math.max(guideIndex,1));}
  function rebuildExplorer(){
    explorer.replaceChildren(); if(!projectReady){explorer.append(h("p",{class:"muted small"},"Aucun projet. Commence dans le terminal."));return;}
    const ordered=Object.keys(files).filter((name)=>!name.startsWith("dist/")).sort((a,b)=>{const rank=(n)=>n==="package.json"?0:n==="index.html"?1:n==="src/main.jsx"?2:n==="src/App.jsx"?3:n.startsWith("src/")?4:5;return rank(a)-rank(b)||a.localeCompare(b);});
    explorer.append(h("div",{class:"studio-tree-root"},"▼ mon-app-react"));
    ordered.forEach(name=>{const parts=name.split("/"); const depth=parts.length>1?2:1; const label=parts.length>1?"src/"+parts.slice(1).join("/"):name; explorer.append(h("button",{type:"button",class:"studio-file depth-"+depth,onclick:()=>openFile(name)},label));});
  }
  function createProject(name){promptProject=(name||"mon-app-react").trim()||"mon-app-react";files=reactStarterProject();files["package.json"]=files["package.json"].replace('"mon-app-react"','"'+promptProject.replace(/[^a-z0-9-_]/gi,"-").toLowerCase()+'"');projectReady=true;installed=false;cwd="/home/student/projects";rebuildExplorer();addTerminal("Done. Now run:","success");addTerminal("  cd "+promptProject);addTerminal("  npm install");addTerminal("  npm run dev");setGuide(Math.max(guideIndex,1));}
  function command(raw){
    const input=raw.trim(); if(!input)return;
    addTerminal((promptMode?"> ":(inProject()?"~/projects/"+promptProject+" $ ":"~/projects $ "))+input,"command");
    if(promptMode==="project"){promptProject=input||"mon-app-react";promptMode="framework";addTerminal("Select a framework:");addTerminal("  Vanilla");addTerminal("  React  ← tape React");addTerminal("  Vue");return;}
    if(promptMode==="framework"){if(input.toLowerCase()!=="react"){addTerminal("Choix invalide ici. Pour cette leçon, sélectionne React.","error");return;}promptFramework="React";promptMode="variant";addTerminal("Select a variant:");addTerminal("  JavaScript  ← tape JavaScript");addTerminal("  TypeScript");return;}
    if(promptMode==="variant"){if(!/^javascript$/i.test(input)){addTerminal("Choisis JavaScript pour suivre ce niveau.","error");return;}promptMode=null;createProject(promptProject);return;}
    if(input==="clear"){terminalBody.replaceChildren();return;}
    if(input==="pwd"){addTerminal(cwd);return;}
    if(input==="ls"){if(inProject())addTerminal("index.html  package.json  src/");else addTerminal(projectReady?promptProject+"/":"(dossier vide)");return;}
    if(/^npm create vite@latest(?:\s+[^\s]+)?/.test(input)){
      const direct=input.match(/^npm create vite@latest\s+([^\s]+)(?:\s+--\s+--template\s+react)?$/);
      if(direct){createProject(direct[1]);return;}
      promptMode="project";addTerminal("> Create Vite");addTerminal("Project name:");return;
    }
    if(/^cd\s+/.test(input)){const target=input.slice(3).trim();if(projectReady&&(target===promptProject||target==="mon-app-react")){cwd="/home/student/projects/"+promptProject;addTerminal("Dossier courant : "+cwd,"success");updatePrompt();setGuide(Math.max(guideIndex,2));}else if(target===".."&&inProject()){cwd="/home/student/projects";updatePrompt();}else addTerminal("cd: "+target+": Aucun dossier de ce nom","error");return;}
    if(/^mkdir\s+/.test(input)){addTerminal("Dossier créé (simulation pédagogique).","success");return;}
    if(input==="npm install"||/^npm i$/.test(input)){if(!inProject()){addTerminal("npm error Aucun package.json dans ce dossier.","error");return;}installed=true;addTerminal("added 63 packages in 1s","success");addTerminal("found 0 vulnerabilities");setGuide(Math.max(guideIndex,3));return;}
    if(/^npm install\s+/.test(input)){if(!installed)addTerminal("Installe d’abord les dépendances du projet avec `npm install`.","error");else addTerminal("Package ajouté à package.json (simulation).","success");return;}
    if(/^npm uninstall\s+/.test(input)){addTerminal("Package retiré de package.json (simulation).","success");return;}
    if(input==="npm run"){addTerminal("Scripts disponibles :");addTerminal("  dev      vite");addTerminal("  build    vite build");addTerminal("  preview  vite preview");addTerminal("  test     vitest (simulation pédagogique)");return;}
    if(input==="npm start"){addTerminal('npm error Missing script: "start"',"error");addTerminal("💡 Regarde les scripts disponibles avec `npm run`.","hint");return;}
    if(input==="npm run test" || input==="npm test"){if(!inProject()){addTerminal("npm error Aucun package.json dans ce dossier.","error");return;} const tests=Object.keys(files).filter(name=>/\.(test|spec)\.[jt]sx?$/.test(name)); if(!tests.length){addTerminal("No test files found.","error");addTerminal("💡 Ajoute par exemple src/App.test.jsx.","hint");return;} addTerminal("Vitest pédagogique — "+tests.length+" fichier(s)"); tests.forEach(name=>addTerminal("✓ "+name+" · tests simulés réussis","success")); return;}
    if(input==="npm run dev"){if(!inProject()){addTerminal("npm error Aucun package.json dans ce dossier.","error");return;}if(!installed){addTerminal("npm error Dépendances absentes. Lance `npm install` d’abord.","error");return;}addTerminal("> "+promptProject+"@0.0.0 dev");addTerminal("> vite");addTerminal("VITE ready","success");addTerminal("➜ Local: http://localhost:5173/","success");setServer(true);setGuide(preset.guided.length-1);return;}
    if(input==="npm run build"){if(!installed){addTerminal("npm error Lance `npm install` avant le build.","error");return;}buildReady=true;files["dist/index.html"]="<!-- build Vite -->";addTerminal("vite building for production...");addTerminal("✓ modules transformed");addTerminal("✓ built successfully","success");addTerminal("dist/  index.html  assets/");return;}
    if(input==="npm run preview"){if(!buildReady){addTerminal("Le dossier dist/ n’existe pas encore. Lance `npm run build`.","error");return;}addTerminal("➜ Local: http://localhost:4173/","success");setServer(true,"localhost:4173");return;}
    addTerminal("Commande non reconnue dans ce terminal pédagogique : "+input,"error");addTerminal("Commandes utiles : pwd, ls, cd, npm create vite@latest, npm install, npm run, npm run dev, npm run build, npm run preview, npm run test.","hint");
  }

  const onMessage=(event)=>{const msg=event.data;if(!msg||!msg.cahierReact||msg.id!==id)return;if(msg.type==="log")addConsole(msg.data.level,msg.data.text);if(msg.type==="error")addConsole("error",msg.data.text);if(msg.type==="render"){const empty=consoleBody.querySelector(".muted");if(empty)empty.remove();}};
  window.addEventListener("message",onMessage);
  termInput.addEventListener("keydown",(event)=>{if(event.key!=="Enter")return;event.preventDefault();const value=termInput.value;termInput.value="";command(value);});

  const terminal=h("section",{class:"studio-terminal"},h("div",{class:"studio-panel-title"},h("span",{},"TERMINAL"),h("small",{},"Vite simulé · commandes contrôlées")),terminalBody,h("label",{class:"studio-terminal-row"},termPrompt,termInput));
  const filePanel=h("section",{class:"studio-explorer"},h("div",{class:"studio-panel-title"},h("span",{},"EXPLORATEUR"),h("small",{},"projet virtuel")),explorer);
  const editorPanel=h("section",{class:"studio-code"},h("div",{class:"studio-panel-title"},h("span",{},"ÉDITEUR"),editorTitle),editorArea);
  const browser=h("section",{class:"studio-browser"},h("div",{class:"studio-browser-chrome"},h("span",{class:"browser-dots"},"● ● ●"),h("span",{class:"browser-url"},"http://localhost:5173/"),browserStatus),preview);
  const browserConsole=h("section",{class:"studio-console"},h("div",{class:"studio-panel-title"},h("span",{},"CONSOLE NAVIGATEUR"),h("small",{},"console.log / erreurs")),consoleBody);
  const guide=h("div",{class:"studio-guide"},guideStep,guideText,h("button",{class:"btn ghost small",type:"button",onclick:()=>setGuide(guideIndex+1)},"Étape suivante →"));
  const toolbar=h("div",{class:"toolbar studio-toolbar"},h("button",{class:"btn primary",type:"button",onclick:()=>runPreview()},"▶ Exécuter / Actualiser"),h("button",{class:"btn ghost",type:"button",onclick:()=>{if("src/App.jsx" in files){const fresh=reactStarterProject(Object.assign({}, preset.files || {}, preset.app ? { "src/App.jsx": preset.app } : {}));Object.keys(fresh).forEach((name)=>{files[name]=fresh[name];if(editors[name])editors[name].value=files[name];});}consoleBody.replaceChildren(h("p",{class:"muted small"},"Code React réinitialisé."));runPreview();}},"↻ Réinitialiser"));
  const node=h("div",{class:"react-studio"},guide,h("div",{class:"studio-workspace"},filePanel,editorPanel),terminal,h("div",{class:"studio-output-grid"},browser,browserConsole),toolbar,h("div",{class:"studio-note"},h("strong",{},"Environnement sécurisé"),para("Le terminal simule uniquement une liste contrôlée de commandes Vite/npm. Le code JSX est interprété dans une iframe sandboxée : il peut produire un rendu, des clics, du state et des logs sans lancer de commande système réelle.","muted small")));

  rebuildExplorer(); updatePrompt();
  if(preset.fresh){addTerminal("Terminal prêt. Tape `npm create vite@latest` pour commencer.","hint");setServer(false);} else {addTerminal("Projet virtuel chargé. Essaie `ls` ou `npm run`.","hint");if(server)setServer(true);else setServer(false);openFile("src/App.jsx");}
  return node;
}
