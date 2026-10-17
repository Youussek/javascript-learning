// learning-journal.js — journal personnel d'apprentissage, séparé de la progression.

const JOURNAL_PATHS = ["javascript","html","css","react","typescript","node","sql"];
let pendingJournalContext = null;

function learningJournalState(){
  if(!state.learningJournal || typeof state.learningJournal !== "object") state.learningJournal={entries:[]};
  if(!Array.isArray(state.learningJournal.entries)) state.learningJournal.entries=[];
  return state.learningJournal;
}

function journalPathMeta(id){
  const path=(typeof LEARNING_PATHS!=="undefined"?LEARNING_PATHS:[]).find(p=>p.id===id);
  if(path) return {id:path.id,title:path.title,mark:path.mark||"•"};
  if(id==="javascript") return {id,title:"JavaScript",mark:"JS"};
  return {id:id||"general",title:id?String(id):"Général",mark:"•"};
}

function journalCurrentContext(){
  const route=location.hash.replace(/^#/,"")||"/";
  let pathId=null;
  if(route.startsWith("/react")) pathId="react";
  else if(route.startsWith("/css")) pathId="css";
  else if(route.startsWith("/html")) pathId="html";
  else if(route.startsWith("/typescript")) pathId="typescript";
  else if(route.startsWith("/node")) pathId="node";
  else if(route.startsWith("/sql")) pathId="sql";
  else if(/^\/(javascript|cours|exercice|exercices|projet|projets|revision|progression)/.test(route)) pathId="javascript";
  const title=document.querySelector("#main h1")?.textContent?.trim()||"";
  return {pathId,route,title};
}

function journalOpenFromCurrent(){
  pendingJournalContext=journalCurrentContext();
  location.hash="#/journal";
}

function journalSaveEntry(data,id){
  const store=learningJournalState();
  const now=new Date().toISOString();
  if(id){
    const entry=store.entries.find(e=>e.id===id);
    if(!entry) return null;
    Object.assign(entry,data,{updatedAt:now});
    saveState(state);
    return entry;
  }
  const entry={id:"journal-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),createdAt:now,updatedAt:now,...data};
  store.entries.unshift(entry);
  saveState(state);
  return entry;
}

function journalDeleteEntry(id){
  const store=learningJournalState();
  store.entries=store.entries.filter(e=>e.id!==id);
  saveState(state);
}

function learningJournalStats(){
  const entries=learningJournalState().entries;
  const paths=new Set(entries.map(e=>e.pathId).filter(Boolean));
  const revisit=entries.filter(e=>String(e.revisit||"").trim()).length;
  return {total:entries.length,paths:paths.size,revisit,last:entries[0]||null};
}

function journalFormatDate(iso){
  if(!iso) return "";
  try{return new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(iso));}catch{return iso;}
}

function journalTextPreview(text,max=150){
  const value=String(text||"").trim().replace(/\s+/g," ");
  return value.length>max?value.slice(0,max-1)+"…":value;
}

function renderLearningJournal(){
  const store=learningJournalState();
  const context=pendingJournalContext;
  pendingJournalContext=null;
  const stats=learningJournalStats();
  const page=h("div",{class:"page learning-journal-page"},
    h("p",{class:"crumbs"},link("/","Accueil")," / Journal d’apprentissage"),
    h("section",{class:"journal-hero"},
      h("div",{},h("span",{class:"eyebrow"},"JOURNAL D’APPRENTISSAGE"),h("h1",{},"Mets des mots sur ce que tu apprends"),para("Après une leçon, une session ou un projet, garde une trace de ce que tu as compris, de ce qui reste flou et de ce que tu veux revoir.","lead")),
      h("div",{class:"journal-stats"},metric(stats.total,"entrées"),metric(stats.paths,"parcours"),metric(stats.revisit,"à revoir"))
    )
  );

  const formCard=h("section",{class:"block journal-compose"});
  page.append(formCard);

  const listWrap=h("section",{class:"journal-history"});
  page.append(listWrap);

  function drawForm(editEntry){
    const initial=editEntry||{};
    const pathSelect=h("select",{class:"journal-select","aria-label":"Parcours"},
      h("option",{value:""},"Général"),
      ...JOURNAL_PATHS.map(id=>{const p=journalPathMeta(id);return h("option",{value:id,selected:(initial.pathId||context?.pathId)===id},p.title);})
    );
    const contextInput=h("input",{type:"text",class:"journal-input",placeholder:"Ex. Promises, JOIN, Flexbox…",value:initial.contextTitle||context?.title||""});
    const understood=h("textarea",{rows:3,placeholder:"Qu’est-ce que tu as compris aujourd’hui ?",class:"journal-textarea"},initial.understood||"");
    const unclear=h("textarea",{rows:3,placeholder:"Qu’est-ce qui reste flou ou difficile ?",class:"journal-textarea"},initial.unclear||"");
    const revisit=h("textarea",{rows:2,placeholder:"Qu’est-ce que tu veux revoir ou pratiquer ensuite ?",class:"journal-textarea"},initial.revisit||"");
    const note=h("textarea",{rows:3,placeholder:"Note personnelle, astuce, exemple à retenir…",class:"journal-textarea"},initial.note||"");
    const confidence=h("select",{class:"journal-select","aria-label":"Confiance"},
      ...[["low","Encore fragile"],["medium","Ça commence à venir"],["high","Je me sens solide"]].map(([v,l])=>h("option",{value:v,selected:(initial.confidence||"medium")===v},l))
    );
    const feedback=h("div",{class:"journal-form-feedback","aria-live":"polite"});
    const saveBtn=h("button",{class:"btn primary",type:"button",onclick:()=>{
      const payload={pathId:pathSelect.value||null,contextTitle:contextInput.value.trim(),contextRoute:initial.contextRoute||context?.route||null,understood:understood.value.trim(),unclear:unclear.value.trim(),revisit:revisit.value.trim(),note:note.value.trim(),confidence:confidence.value};
      if(!payload.understood&&!payload.unclear&&!payload.revisit&&!payload.note){feedback.replaceChildren(h("p",{class:"error"},"Écris au moins une observation avant d’enregistrer."));return;}
      journalSaveEntry(payload,initial.id);
      feedback.replaceChildren(h("p",{class:"success"},initial.id?"✓ Entrée mise à jour.":"✓ Entrée ajoutée au journal."));
      drawList();
      if(!initial.id) drawForm(null);
    }},initial.id?"Enregistrer les modifications":"Ajouter au journal");
    formCard.replaceChildren(
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},initial.id?"MODIFIER":"NOUVELLE ENTRÉE"),h("h2",{},initial.id?"Mettre à jour cette réflexion":"Faire le point en quelques minutes")),initial.id?h("button",{class:"btn small",type:"button",onclick:()=>drawForm(null)},"Annuler"):null),
      h("div",{class:"journal-form-grid"},
        h("label",{},h("span",{},"Parcours"),pathSelect),
        h("label",{},h("span",{},"Contexte / notion"),contextInput),
        h("label",{},h("span",{},"Niveau de confiance"),confidence)
      ),
      h("div",{class:"journal-prompts"},
        h("label",{},h("strong",{},"✓ J’ai compris"),understood),
        h("label",{},h("strong",{},"? Ça reste flou"),unclear),
        h("label",{},h("strong",{},"↻ Je veux revoir"),revisit),
        h("label",{},h("strong",{},"✎ Note libre"),note)
      ),
      h("div",{class:"toolbar"},saveBtn),feedback
    );
  }

  function drawList(){
    const query=(listWrap.querySelector(".journal-search")?.value||"").toLowerCase().trim();
    const pathFilter=listWrap.querySelector(".journal-filter")?.value||"all";
    const entries=store.entries.filter(e=>{
      if(pathFilter!=="all"&&(e.pathId||"general")!==pathFilter) return false;
      if(!query) return true;
      return [e.contextTitle,e.understood,e.unclear,e.revisit,e.note,journalPathMeta(e.pathId).title].join(" ").toLowerCase().includes(query);
    });
    const search=h("input",{type:"search",class:"journal-search",placeholder:"Rechercher une notion ou une note…",value:query});
    const filter=h("select",{class:"journal-filter"},h("option",{value:"all"},"Tous les parcours"),h("option",{value:"general"},"Général"),...JOURNAL_PATHS.map(id=>h("option",{value:id,selected:pathFilter===id},journalPathMeta(id).title)));
    search.addEventListener("input",()=>{drawListWith(search.value,filter.value);});
    filter.addEventListener("change",()=>{drawListWith(search.value,filter.value);});
    drawListWith(query,pathFilter,search,filter,entries);
  }

  function drawListWith(query,pathFilter,providedSearch,providedFilter,providedEntries){
    const entries=providedEntries||store.entries.filter(e=>{
      if(pathFilter!=="all"&&(e.pathId||"general")!==pathFilter) return false;
      if(!query) return true;
      return [e.contextTitle,e.understood,e.unclear,e.revisit,e.note,journalPathMeta(e.pathId).title].join(" ").toLowerCase().includes(String(query).toLowerCase());
    });
    const search=providedSearch||h("input",{type:"search",class:"journal-search",placeholder:"Rechercher une notion ou une note…",value:query||""});
    const filter=providedFilter||h("select",{class:"journal-filter"},h("option",{value:"all",selected:pathFilter==="all"},"Tous les parcours"),h("option",{value:"general",selected:pathFilter==="general"},"Général"),...JOURNAL_PATHS.map(id=>h("option",{value:id,selected:pathFilter===id},journalPathMeta(id).title)));
    if(!providedSearch){search.addEventListener("input",()=>drawListWith(search.value,filter.value));filter.addEventListener("change",()=>drawListWith(search.value,filter.value));}
    const cards=entries.map(entry=>{
      const path=journalPathMeta(entry.pathId);
      return h("article",{class:"journal-entry"},
        h("div",{class:"journal-entry-head"},h("div",{},h("span",{class:"badge"},path.title),entry.contextTitle?h("h3",{},entry.contextTitle):h("h3",{},"Réflexion libre"),para(journalFormatDate(entry.createdAt),"muted small")),h("span",{class:"journal-confidence journal-confidence--"+(entry.confidence||"medium")},entry.confidence==="high"?"Solide":entry.confidence==="low"?"Fragile":"En construction")),
        entry.understood?h("div",{class:"journal-snippet understood"},h("strong",{},"✓ Compris"),para(journalTextPreview(entry.understood))):null,
        entry.unclear?h("div",{class:"journal-snippet unclear"},h("strong",{},"? Flou"),para(journalTextPreview(entry.unclear))):null,
        entry.revisit?h("div",{class:"journal-snippet revisit"},h("strong",{},"↻ À revoir"),para(journalTextPreview(entry.revisit))):null,
        entry.note?h("details",{class:"journal-note"},h("summary",{},"Voir la note personnelle"),para(entry.note)):null,
        h("div",{class:"toolbar"},entry.contextRoute?link(entry.contextRoute,"Revenir au contenu","btn small"):null,h("button",{class:"btn small",type:"button",onclick:()=>{drawForm(entry);window.scrollTo({top:formCard.offsetTop-20,behavior:"smooth"});}},"Modifier"),h("button",{class:"btn small danger",type:"button",onclick:()=>{if(confirm("Supprimer cette entrée du journal ?")){journalDeleteEntry(entry.id);drawListWith(search.value,filter.value);}}},"Supprimer"))
      );
    });
    listWrap.replaceChildren(
      h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"HISTORIQUE"),h("h2",{},entries.length?entries.length+" entrée"+(entries.length>1?"s":"")+" affichée"+(entries.length>1?"s":""):"Aucune entrée ici")),h("div",{class:"journal-filters"},search,filter)),
      cards.length?h("div",{class:"journal-entry-list"},...cards):h("div",{class:"block empty-journal"},h("h3",{},"Ton journal est encore vide"),para("Après une leçon ou une session, note en quelques lignes ce que tu veux retenir. Tu pourras ensuite rechercher tes propres explications.","muted"))
    );
  }

  drawForm(null);
  drawList();
  return page;
}

function installJournalQuickAction(){
  const main=document.getElementById("main");
  if(!main) return;
  function refresh(){
    document.querySelectorAll("[data-journal-quick]").forEach(x=>x.remove());
    const ctx=journalCurrentContext();
    if(!ctx.pathId||!/\/(cours|exercice|projet|evaluation)\//.test(ctx.route)) return;
    const head=main.querySelector(".page-head");
    if(!head) return;
    const existingToolbar=head.querySelector(".toolbar");
    const btn=h("button",{class:"btn small journal-quick-btn",type:"button","data-journal-quick":"1",onclick:journalOpenFromCurrent},"✎ Journal");
    if(existingToolbar) existingToolbar.append(btn); else head.append(h("div",{class:"toolbar","data-journal-quick":"1"},btn));
  }
  const obs=new MutationObserver(()=>setTimeout(refresh,0));
  obs.observe(main,{childList:true,subtree:true});
  window.addEventListener("hashchange",()=>setTimeout(refresh,0));
  setTimeout(refresh,0);
}

document.addEventListener("DOMContentLoaded",installJournalQuickAction);
