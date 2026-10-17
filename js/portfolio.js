// portfolio.js — portfolio automatique basé exclusivement sur les projets réellement validés.
// La progression pédagogique reste la source de vérité ; cette couche ne fait que présenter les accomplissements.

const PORTFOLIO_PATH_META = Object.freeze({
  javascript:{title:"JavaScript",mark:"JS"}, react:{title:"React",mark:"⚛"}, css:{title:"CSS",mark:"CSS"},
  html:{title:"HTML",mark:"HTML"}, typescript:{title:"TypeScript",mark:"TS"}, node:{title:"Node.js",mark:"N"}, sql:{title:"SQL",mark:"SQL"}
});

function ensurePortfolioState(){
  if(!state.portfolio || typeof state.portfolio!=="object") state.portfolio={};
  const p=state.portfolio;
  if(!p.profile) p.profile={displayName:"",headline:"Développeur en apprentissage",bio:"Je construis des projets pratiques pour consolider mes compétences en développement web."};
  if(!p.visibility) p.visibility={};
  if(!p.featured) p.featured={};
  if(!p.notes) p.notes={};
  return p;
}

function portfolioProjectCollections(){
  return [
    ["javascript", typeof PROJECTS!=="undefined"?PROJECTS:[]],
    ["react", typeof REACT_PROJECTS!=="undefined"?REACT_PROJECTS:[]],
    ["css", typeof CSS_PROJECTS!=="undefined"?CSS_PROJECTS:[]],
    ["html", typeof HTML_PROJECTS!=="undefined"?HTML_PROJECTS:[]],
    ["typescript", typeof TYPESCRIPT_PROJECTS!=="undefined"?TYPESCRIPT_PROJECTS:[]],
    ["node", typeof NODE_PROJECTS!=="undefined"?NODE_PROJECTS:[]],
    ["sql", typeof SQL_PROJECTS!=="undefined"?SQL_PROJECTS:[]]
  ];
}
function portfolioProjectDone(pathId,id){
  if(pathId==="javascript") return Boolean((state.projects||{})[id]?.done);
  const store=typeof gamificationPathStore==="function"?gamificationPathStore(pathId):(state[pathId]||{});
  return Boolean((store.projects||{})[id]?.done);
}
function portfolioRewardDate(key){
  const g=typeof ensureGamificationState==="function"?ensureGamificationState():null;
  if(!g||!Array.isArray(g.xpEvents)) return null;
  const event=[...g.xpEvents].reverse().find(e=>e&&e.key===key);
  return event ? (event.at||event.timestamp||event.date||null) : null;
}
function portfolioSkills(project,pathId){
  let skills=[];
  if(Array.isArray(project.skills)) skills=project.skills;
  else if(typeof project.skills==="string") skills=project.skills.split(/[,·]/).map(x=>x.trim()).filter(Boolean);
  if(!skills.length){
    const fallback={javascript:["JavaScript","DOM","logique"],react:["React","composants","état"],css:["CSS","responsive","interface"],html:["HTML","sémantique","accessibilité"],typescript:["TypeScript","types","qualité"],node:["Node.js","backend","API"],sql:["SQL","données","requêtes"]};
    skills=fallback[pathId]||[];
  }
  return [...new Set(skills)].slice(0,7);
}
function portfolioProjectRoute(pathId,id){
  return pathId==="javascript"?`/projet/${id}`:`/${pathId}/projet/${id}`;
}
function portfolioCatalog(){
  const rows=[];
  portfolioProjectCollections().forEach(([pathId,projects])=>{
    (projects||[]).filter(p=>p.available!==false).forEach(project=>{
      if(!portfolioProjectDone(pathId,project.id)) return;
      rows.push({
        key:`project:${pathId}:${project.id}`, kind:"project", id:project.id, path:pathId,
        title:project.title||"Projet", description:project.description||project.goal||project.brief||"Projet pratique validé dans Cahier Code.",
        objective:project.goal||project.brief||project.workshop||project.description||"",
        skills:portfolioSkills(project,pathId), route:portfolioProjectRoute(pathId,project.id),
        level:Number(project.level||project.unlock?.module||0)||null,
        completedAt:portfolioRewardDate(`project:${pathId}:${project.id}`)
      });
    });
  });
  if(typeof THREAD_PROJECTS!=="undefined" && typeof threadProjectRecord==="function"){
    THREAD_PROJECTS.forEach(project=>{
      const rec=threadProjectRecord(project.id); if(!rec.completedAt) return;
      const paths=[...new Set(project.stages.map(s=>s.path).filter(Boolean))];
      const skills=paths.map(p=>PORTFOLIO_PATH_META[p]?.title||p);
      rows.push({key:`thread:${project.id}`,kind:"thread",id:project.id,path:null,paths,title:project.title,description:project.subtitle||project.description||project.outcome,objective:project.outcome||project.description||"",skills,route:`/fil-rouge/${project.id}`,level:null,completedAt:rec.completedAt});
    });
  }
  return rows.sort((a,b)=>Number(b.completedAt||0)-Number(a.completedAt||0)||a.title.localeCompare(b.title));
}
function portfolioIsVisible(item){const p=ensurePortfolioState(); return p.visibility[item.key]!==false;}
function portfolioIsFeatured(item){return Boolean(ensurePortfolioState().featured[item.key]);}
function portfolioVisibleProjects(){return portfolioCatalog().filter(portfolioIsVisible);}
function portfolioStats(){const all=portfolioCatalog(),visible=all.filter(portfolioIsVisible);return{all,visible,total:all.length,shown:visible.length,featured:visible.filter(portfolioIsFeatured).length,technologies:new Set(visible.flatMap(x=>x.paths||[x.path]).filter(Boolean)).size};}
function portfolioDisplayDescription(item){return String(ensurePortfolioState().notes[item.key]||item.description||"").trim();}
function portfolioDateLabel(value){if(!value)return "Projet validé";const d=new Date(value);return Number.isNaN(d.getTime())?"Projet validé":`Validé le ${d.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}`;}

function renderPortfolioProjectCard(item,preview=false){
  const tags=(item.paths||[item.path]).filter(Boolean).map(p=>PORTFOLIO_PATH_META[p]?.title||p);
  return h("article",{class:"portfolio-project-card"+(portfolioIsFeatured(item)?" is-featured":"")},
    h("div",{class:"portfolio-project-top"},h("div",{},h("span",{class:"eyebrow"},item.kind==="thread"?"PROJET FIL ROUGE":((PORTFOLIO_PATH_META[item.path]?.title||"PROJET")+(item.level?` · NIVEAU ${item.level}`:""))),h("h2",{},item.title)),portfolioIsFeatured(item)?h("span",{class:"portfolio-featured"},"★ Mis en avant"):null),
    para(portfolioDisplayDescription(item),"portfolio-project-description"),
    h("div",{class:"portfolio-tags"},[...new Set([...tags,...item.skills])].slice(0,9).map(x=>h("span",{class:"badge"},x))),
    h("div",{class:"portfolio-project-footer"},h("span",{class:"muted small"},portfolioDateLabel(item.completedAt)),preview?null:link(item.route,"Revoir le projet →","btn small")));
}

function portfolioDownload(filename,content,type){const blob=new Blob([content],{type:type||"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800);}
function portfolioEscape(text){return String(text??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function portfolioStandaloneHtml(){
  const p=ensurePortfolioState(), items=portfolioVisibleProjects();
  const name=p.profile.displayName.trim()||"Mon portfolio";
  const cards=items.map(item=>{const tags=[...(item.paths||[item.path]).filter(Boolean).map(x=>PORTFOLIO_PATH_META[x]?.title||x),...item.skills];return `<article class="card${portfolioIsFeatured(item)?" featured":""}"><div class="kicker">${portfolioEscape(item.kind==="thread"?"Projet fil rouge":PORTFOLIO_PATH_META[item.path]?.title||"Projet")}${portfolioIsFeatured(item)?" · ★ Mis en avant":""}</div><h2>${portfolioEscape(item.title)}</h2><p>${portfolioEscape(portfolioDisplayDescription(item))}</p><div class="tags">${[...new Set(tags)].slice(0,9).map(t=>`<span>${portfolioEscape(t)}</span>`).join("")}</div><small>${portfolioEscape(portfolioDateLabel(item.completedAt))}</small></article>`}).join("");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${portfolioEscape(name)} · Portfolio</title><style>:root{color-scheme:dark;--bg:#0b1020;--card:#121a2e;--text:#f7f8fb;--muted:#aab3c5;--line:#27324a;--accent:#8b5cf6}*{box-sizing:border-box}body{margin:0;font:16px/1.6 system-ui,sans-serif;background:radial-gradient(circle at top,#17213e,var(--bg) 42%);color:var(--text)}main{width:min(1100px,92%);margin:auto;padding:72px 0}.hero{max-width:760px;margin-bottom:48px}.kicker{font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:#c4b5fd;font-weight:800}h1{font-size:clamp(2.4rem,7vw,5rem);line-height:1;margin:.2em 0}h2{line-height:1.15}.lead{font-size:1.15rem;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:18px}.card{background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.025));border:1px solid var(--line);border-radius:20px;padding:24px}.card.featured{border-color:var(--accent);box-shadow:0 0 0 1px rgba(139,92,246,.25)}.card p,.card small{color:var(--muted)}.tags{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0}.tags span{font-size:.78rem;border:1px solid var(--line);border-radius:999px;padding:5px 9px;background:rgba(255,255,255,.035)}footer{margin-top:46px;color:var(--muted);font-size:.85rem}@media(prefers-reduced-motion:no-preference){.card{transition:transform .18s ease,border-color .18s ease}.card:hover{transform:translateY(-3px)}}</style></head><body><main><section class="hero"><div class="kicker">PORTFOLIO</div><h1>${portfolioEscape(name)}</h1><p class="lead">${portfolioEscape(p.profile.headline)}</p><p>${portfolioEscape(p.profile.bio)}</p></section><section class="grid">${cards||'<p>Aucun projet publié pour le moment.</p>'}</section><footer>Portfolio généré depuis des projets validés dans Cahier Code.</footer></main></body></html>`;
}
function portfolioExportHtml(){portfolioDownload("portfolio-cahier-code.html",portfolioStandaloneHtml(),"text/html;charset=utf-8");}
function portfolioExportJson(){const p=ensurePortfolioState();portfolioDownload("portfolio-cahier-code.json",JSON.stringify({profile:p.profile,projects:portfolioVisibleProjects().map(item=>({title:item.title,technologies:(item.paths||[item.path]).filter(Boolean),skills:item.skills,description:portfolioDisplayDescription(item),completedAt:item.completedAt,featured:portfolioIsFeatured(item)}))},null,2),"application/json;charset=utf-8");}

function renderPortfolio(){
  const p=ensurePortfolioState(), stats=portfolioStats();
  const name=h("input",{class:"input",type:"text",value:p.profile.displayName,placeholder:"Ton nom ou pseudo",maxlength:"60"});
  const headline=h("input",{class:"input",type:"text",value:p.profile.headline,placeholder:"Ex. Développeur frontend junior",maxlength:"100"});
  const bio=h("textarea",{class:"portfolio-bio",rows:4,maxlength:"360"},p.profile.bio);
  const saveProfile=()=>{p.profile.displayName=name.value.trim();p.profile.headline=headline.value.trim();p.profile.bio=bio.value.trim();saveState(state);};
  [name,headline,bio].forEach(el=>el.addEventListener("input",saveProfile));
  const projectEditors=stats.all.length?stats.all.map(item=>{
    const visible=h("input",{type:"checkbox",checked:portfolioIsVisible(item)}), featured=h("input",{type:"checkbox",checked:portfolioIsFeatured(item)}), note=h("textarea",{rows:3,class:"portfolio-note",maxlength:"420",placeholder:"Description personnalisée (facultatif)"},ensurePortfolioState().notes[item.key]||"");
    visible.addEventListener("change",()=>{p.visibility[item.key]=visible.checked;saveState(state);router();});
    featured.addEventListener("change",()=>{p.featured[item.key]=featured.checked;saveState(state);router();});
    note.addEventListener("input",()=>{p.notes[item.key]=note.value;saveState(state);});
    return h("article",{class:"block portfolio-editor-card"},h("div",{class:"portfolio-editor-heading"},h("div",{},h("span",{class:"eyebrow"},item.kind==="thread"?"FIL ROUGE":PORTFOLIO_PATH_META[item.path]?.title||"PROJET"),h("h2",{},item.title)),h("span",{class:"status ok"},"✓ Validé")),para(item.description,"muted"),h("div",{class:"portfolio-editor-controls"},h("label",{class:"thread-check"},visible,h("span",{},"Afficher dans le portfolio")),h("label",{class:"thread-check"},featured,h("span",{},"Mettre en avant"))),note);
  }):[h("div",{class:"empty-state"},h("h2",{},"Ton portfolio se remplira automatiquement"),para("Termine un projet dans un parcours ou un projet fil rouge : il apparaîtra ici automatiquement après sa validation.","muted"),link("/fil-rouge","Découvrir les projets fil rouge →","btn primary"))];
  return h("div",{class:"page portfolio-page"},h("p",{class:"crumbs"},link("/dashboard","Dashboard")," / Portfolio"),
    h("section",{class:"portfolio-hero"},h("div",{},h("span",{class:"eyebrow"},"PORTFOLIO AUTOMATIQUE"),h("h1",{},"Transforme tes projets validés en preuves concrètes"),para("Le portfolio utilise uniquement les projets réellement terminés dans Cahier Code. Choisis ce que tu veux montrer, personnalise la présentation et exporte une page autonome.","lead"),h("div",{class:"toolbar"},link("/portfolio/apercu","Voir l’aperçu →","btn primary big"),h("button",{class:"btn big",type:"button",onclick:portfolioExportHtml},"Exporter en HTML"),h("button",{class:"btn big",type:"button",onclick:portfolioExportJson},"Exporter les données"))),h("div",{class:"portfolio-hero-stats"},h("strong",{},String(stats.shown)),para("projets publiés / "+stats.total+" validés","muted"),h("strong",{},String(stats.technologies)),para("technologies représentées","muted"))),
    h("section",{class:"block portfolio-profile-editor"},h("span",{class:"eyebrow"},"PRÉSENTATION"),h("h2",{},"Ton en-tête de portfolio"),h("div",{class:"portfolio-form-grid"},h("label",{},h("span",{},"Nom / pseudo"),name),h("label",{},h("span",{},"Titre professionnel"),headline)),h("label",{},h("span",{},"Bio courte"),bio),para("Ces informations restent uniquement dans ta sauvegarde locale et dans les exports que tu déclenches toi-même.","muted small")),
    h("section",{},h("div",{class:"portfolio-section-heading"},h("div",{},h("span",{class:"eyebrow"},"PROJETS DÉTECTÉS"),h("h2",{},"Choisis ce que tu veux présenter")),h("span",{class:"badge"},stats.total+" projet"+(stats.total>1?"s":"")+" validé"+(stats.total>1?"s":""))),h("div",{class:"portfolio-editor-list"},projectEditors)));
}
function renderPortfolioPreview(){
  const p=ensurePortfolioState(),items=portfolioVisibleProjects(),stats=portfolioStats();
  const featured=items.filter(portfolioIsFeatured),rest=items.filter(x=>!portfolioIsFeatured(x));
  return h("div",{class:"page portfolio-preview-page"},h("p",{class:"crumbs"},link("/portfolio","Modifier le portfolio")," / Aperçu"),
    h("section",{class:"portfolio-public-hero"},h("span",{class:"eyebrow"},"PORTFOLIO"),h("h1",{},p.profile.displayName.trim()||"Mon portfolio"),para(p.profile.headline||"Développeur en apprentissage","lead"),para(p.profile.bio||"","portfolio-public-bio"),h("div",{class:"portfolio-public-stats"},h("span",{},stats.shown+" projets"),h("span",{},stats.technologies+" technologies"))),
    items.length?h("section",{},featured.length?h("div",{class:"portfolio-preview-group"},h("h2",{},"Projets mis en avant"),h("div",{class:"portfolio-project-grid"},featured.map(x=>renderPortfolioProjectCard(x,true)))):null,h("div",{class:"portfolio-preview-group"},featured.length&&rest.length?h("h2",{},"Autres projets"):null,h("div",{class:"portfolio-project-grid"},rest.map(x=>renderPortfolioProjectCard(x,true))))):h("section",{class:"empty-state"},h("h2",{},"Aucun projet publié"),para("Retourne dans l’éditeur du portfolio pour rendre visibles tes projets validés.","muted")),
    h("div",{class:"toolbar portfolio-preview-actions"},link("/portfolio","← Modifier","btn"),h("button",{class:"btn primary",type:"button",onclick:portfolioExportHtml},"Télécharger cette version HTML")));
}
