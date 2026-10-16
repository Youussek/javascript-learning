// html-studio.js — couche HTML légère au-dessus du Lab partagé.
function htmlDomTree(code) {
  try {
    const doc = new DOMParser().parseFromString(code, "text/html");
    const lines = [];
    function walk(node, depth) {
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      let label = tag;
      if (node.id) label += "#" + node.id;
      if (node.classList && node.classList.length) label += "." + Array.from(node.classList).join(".");
      lines.push("  ".repeat(depth) + (depth ? "└─ " : "") + label);
      Array.from(node.children).forEach((child) => walk(child, depth + 1));
    }
    walk(doc.body, 0);
    return lines.join("\n") || "body";
  } catch (error) {
    return "Impossible de lire le DOM : " + error.message;
  }
}

function htmlStructureWarnings(code) {
  const warnings = [];
  const stripped = String(code).replace(/<!--[\s\S]*?-->/g, "");
  const stack = [];
  const voids = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  const re = /<\/?([a-zA-Z][\w:-]*)(?:\s[^<>]*?)?>/g;
  let match;
  while ((match = re.exec(stripped))) {
    const raw = match[0], tag = match[1].toLowerCase();
    if (voids.has(tag) || raw.endsWith("/>")) continue;
    if (raw.startsWith("</")) {
      if (!stack.length) { warnings.push("Balise fermante </"+tag+"> sans ouverture correspondante."); continue; }
      const top = stack[stack.length-1];
      if (top !== tag) warnings.push("Vérifie l'imbrication : </"+tag+"> ferme alors que <"+top+"> est encore ouvert.");
      const idx = stack.lastIndexOf(tag);
      if (idx >= 0) stack.splice(idx, 1);
    } else stack.push(tag);
  }
  if (stack.length) warnings.push("Balise"+(stack.length>1?"s":"")+" à vérifier : "+stack.map(t=>"<"+t+">").join(", ")+" semble"+(stack.length>1?"nt":"")+" non fermée"+(stack.length>1?"s":"")+".");
  return warnings.slice(0,4);
}

function renderHtmlStudio(presetId) {
  const files = HTML_STUDIO_PRESETS[presetId];
  if (!files) return null;
  const lab = renderLab({files:files.map(f=>({...f})),previewHeight:260,tips:true,live:true,previewModes:true,resetButton:true});
  const tree = h("pre",{class:"dom-tree"});
  const feedback = h("div",{class:"feedback info","aria-live":"polite"});
  function refreshInspection() {
    const current = lab.getFiles().find(f=>f.name==="index.html");
    const code = current ? current.code : "";
    tree.textContent = htmlDomTree(code);
    const warnings = htmlStructureWarnings(code);
    feedback.replaceChildren(warnings.length
      ? h("div",{},h("strong",{},"Structure à vérifier"),h("ul",{},warnings.map(w=>h("li",{},w))))
      : h("p",{},"✓ Aucun problème simple de fermeture / imbrication détecté par l'aide pédagogique."));
    feedback.className = "feedback " + (warnings.length ? "ko" : "ok");
  }
  let timer=null;
  lab.node.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(refreshInspection,120);});
  setTimeout(refreshInspection,0);
  return h("section",{class:"block html-studio"},
    h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ATELIER HTML"),h("h2",{},"Code + navigateur + DOM")),h("span",{class:"badge"},"PREVIEW LIVE")),
    para("Modifie index.html : le navigateur se met à jour. La vue DOM ci-dessous est générée à partir de ton code et l'aide signale quelques erreurs simples de fermeture ou d'imbrication.","muted"),
    lab.node,
    h("div",{class:"dashboard-grid html-inspector-grid"},
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"DOM SIMPLIFIÉ"),tree),
      h("article",{class:"stats-card"},h("span",{class:"eyebrow"},"AIDE STRUCTURE"),feedback))
  );
}
