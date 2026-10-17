// backup-export.js — sauvegarde portable et restauration de la progression locale.
// Le format exporte l'état complet sans modifier la progression au moment de l'export.

const BACKUP_FORMAT = "cahier-code-backup";
const BACKUP_FORMAT_VERSION = 1;
function preImportBackupKey(){ return `cahierJS.preImportBackup.${getActiveProfileId()}.v1`; }

function backupSimpleHash(text){
  let h = 2166136261;
  for(let i=0;i<text.length;i++) { h ^= text.charCodeAt(i); h = Math.imul(h,16777619); }
  return (h >>> 0).toString(16).padStart(8,"0");
}

function backupProgressSummary(source){
  const st = source || state;
  const paths = [
    ["JavaScript", st.lessonsDone, st.exercises, st.projects],
    ["React", st.react?.lessonsDone, st.react?.exercises, st.react?.projects],
    ["CSS", st.css?.lessonsDone, st.css?.exercises, st.css?.projects],
    ["HTML", st.html?.lessonsDone, st.html?.exercises, st.html?.projects],
    ["TypeScript", st.typescript?.lessonsDone, st.typescript?.exercises, st.typescript?.projects],
    ["Node.js", st.node?.lessonsDone, st.node?.exercises, st.node?.projects],
    ["SQL", st.sql?.lessonsDone, st.sql?.exercises, st.sql?.projects],
    ["Git", st.git?.lessonsDone, st.git?.exercises, st.git?.projects]
  ];
  let lessons=0, exercises=0, projects=0;
  const perPath=paths.map(([name,l,e,p])=>{
    const lc=Object.values(l||{}).filter(Boolean).length;
    const ec=Object.values(e||{}).filter(x=>x&&x.success).length;
    const pc=Object.values(p||{}).filter(x=>x&&(x.done||x.completed)).length;
    lessons+=lc; exercises+=ec; projects+=pc;
    return {name,lessons:lc,exercises:ec,projects:pc};
  });
  return { lessons, exercises, projects, perPath, snapshots:(st.progressionHistory?.snapshots||[]).length, journal:(st.learningJournal?.entries||[]).length };
}

function createBackupPayload(source){
  const clean = JSON.parse(JSON.stringify(source || state));
  const stateJson = JSON.stringify(clean);
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    appStateVersion: Number(clean.version)||1,
    exportedAt: new Date().toISOString(),
    integrity: backupSimpleHash(stateJson),
    summary: backupProgressSummary(clean),
    state: clean
  };
}

function validateBackupPayload(payload){
  if(!payload || typeof payload !== "object") return {ok:false,error:"Le fichier ne contient pas un objet de sauvegarde valide."};
  if(payload.format !== BACKUP_FORMAT) return {ok:false,error:"Ce fichier n'est pas une sauvegarde Cahier Code reconnue."};
  if(!payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) return {ok:false,error:"La progression est absente ou illisible."};
  if(Number(payload.formatVersion) > BACKUP_FORMAT_VERSION) return {ok:false,error:"Cette sauvegarde vient d'une version plus récente du format."};
  const stateJson=JSON.stringify(payload.state);
  if(payload.integrity && backupSimpleHash(stateJson)!==payload.integrity) return {ok:false,error:"Le fichier semble incomplet ou avoir été modifié depuis son export."};
  return {ok:true};
}

function downloadProgressBackup(){
  const payload=createBackupPayload(state);
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const stamp=new Date().toISOString().slice(0,10);
  a.href=url; a.download=`cahier-code-progression-${stamp}.json`; document.body.append(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}

function storePreImportBackup(){
  try { localStorage.setItem(preImportBackupKey(), JSON.stringify(createBackupPayload(state))); return true; }
  catch(error){ console.warn("Impossible de créer la sauvegarde de sécurité avant import :",error); return false; }
}

function hasPreImportBackup(){ try{return !!localStorage.getItem(preImportBackupKey());}catch(_){return false;} }

function restoreBackupState(importedState){
  storePreImportBackup();
  // Fusion de haut niveau avec les champs actuels afin qu'une ancienne sauvegarde reste compatible.
  state=Object.assign(defaultState(), JSON.parse(JSON.stringify(importedState)));
  saveState(state);
  window.dispatchEvent(new Event("progress-changed"));
  window.dispatchEvent(new Event("backup-restored"));
}

function restorePreImportBackup(){
  try{
    const raw=localStorage.getItem(preImportBackupKey()); if(!raw) return false;
    const payload=JSON.parse(raw); const check=validateBackupPayload(payload); if(!check.ok) return false;
    state=Object.assign(defaultState(),payload.state); saveState(state);
    window.dispatchEvent(new Event("progress-changed")); return true;
  }catch(error){console.warn("Restauration de sécurité impossible :",error);return false;}
}

function backupDateLabel(iso){
  try{return new Intl.DateTimeFormat("fr-FR",{dateStyle:"long",timeStyle:"short"}).format(new Date(iso));}catch(_){return iso||"date inconnue";}
}

function renderBackupExport(){
  const current=backupProgressSummary(state);
  const status=h("div",{class:"backup-status","aria-live":"polite"});
  const picker=h("input",{type:"file",accept:"application/json,.json",class:"backup-file-input"});
  const preview=h("div",{class:"backup-preview"},para("Choisis une sauvegarde JSON pour afficher son contenu avant de la restaurer.","muted"));
  let pending=null;
  const importBtn=h("button",{class:"btn primary",type:"button",disabled:true},"Restaurer cette sauvegarde");

  function showMessage(text,type){ status.replaceChildren(h("p",{class:type||"muted"},text)); }
  function showPreview(payload){
    const s=payload.summary||backupProgressSummary(payload.state);
    preview.replaceChildren(
      h("div",{class:"backup-preview-head"},h("div",{},h("span",{class:"eyebrow"},"SAUVEGARDE LUE"),h("h3",{},"Progression prête à restaurer")),h("span",{class:"chip"},backupDateLabel(payload.exportedAt))),
      h("div",{class:"backup-metrics"},
        h("div",{class:"metric"},h("strong",{},String(s.lessons||0)),h("span",{},"Cours terminés")),
        h("div",{class:"metric"},h("strong",{},String(s.exercises||0)),h("span",{},"Exercices réussis")),
        h("div",{class:"metric"},h("strong",{},String(s.projects||0)),h("span",{},"Projets terminés")),
        h("div",{class:"metric"},h("strong",{},String(s.snapshots||0)),h("span",{},"Points d’historique"))
      ),
      para("La restauration remplace la progression locale actuelle. Une copie de sécurité automatique de l'état actuel sera créée juste avant.","muted small")
    );
  }

  picker.addEventListener("change",async()=>{
    pending=null; importBtn.disabled=true; status.replaceChildren();
    const file=picker.files&&picker.files[0]; if(!file) return;
    if(file.size>15*1024*1024){showMessage("Ce fichier est trop volumineux pour une sauvegarde Cahier Code.","error");return;}
    try{
      const payload=JSON.parse(await file.text());
      const check=validateBackupPayload(payload);
      if(!check.ok){showMessage(check.error,"error"); preview.replaceChildren();return;}
      pending=payload; importBtn.disabled=false; showPreview(payload);
    }catch(_){showMessage("Impossible de lire ce fichier JSON. Vérifie qu'il s'agit bien d'un export Cahier Code.","error");}
  });

  importBtn.addEventListener("click",()=>{
    if(!pending) return;
    const ok=window.confirm("Restaurer cette sauvegarde ? La progression locale actuelle sera remplacée, mais une copie de sécurité sera conservée pour permettre une annulation.");
    if(!ok) return;
    restoreBackupState(pending.state);
    showMessage("✓ Sauvegarde restaurée. La progression affichée a été rechargée.","success");
    pending=null; importBtn.disabled=true; picker.value="";
    setTimeout(()=>{ location.hash="#/dashboard"; },250);
  });

  const undoBtn=h("button",{class:"btn ghost",type:"button",disabled:!hasPreImportBackup(),onclick:()=>{
    if(!window.confirm("Annuler le dernier import et restaurer la progression qui était présente juste avant ?")) return;
    if(restorePreImportBackup()){showMessage("✓ Progression précédente restaurée.","success");setTimeout(()=>{location.hash="#/dashboard";},250);}else showMessage("La sauvegarde de sécurité n'est plus disponible.","error");
  }},"Annuler le dernier import");

  return h("div",{class:"page backup-page"},
    pageTitle("Sauvegarde & export","Emporte ta progression avec toi, restaure-la sur ce navigateur ou transfère-la vers un autre appareil."),
    h("section",{class:"backup-hero"},
      h("div",{},h("span",{class:"eyebrow"},"COPIE PORTABLE"),h("h2",{},"Ta progression t’appartient"),para("L’export contient la progression de tous les parcours, l’XP et les badges, l’historique visuel, les révisions, le journal et les autres données pédagogiques enregistrées localement.")),
      h("div",{class:"backup-metrics"},
        h("div",{class:"metric"},h("strong",{},String(current.lessons)),h("span",{},"Cours terminés")),
        h("div",{class:"metric"},h("strong",{},String(current.exercises)),h("span",{},"Exercices réussis")),
        h("div",{class:"metric"},h("strong",{},String(current.projects)),h("span",{},"Projets terminés")),
        h("div",{class:"metric"},h("strong",{},String(current.snapshots)),h("span",{},"Points d’historique"))
      )
    ),
    h("div",{class:"backup-grid"},
      h("section",{class:"block backup-card"},h("span",{class:"eyebrow"},"1 · EXPORTER"),h("h2",{},"Créer une sauvegarde"),para("Télécharge un fichier JSON autonome que tu peux conserver ou importer plus tard."),h("div",{class:"callout"},h("strong",{},"Inclus dans l’export"),para("Progression, brouillons, paramètres pédagogiques, historique, gamification, erreurs utiles et journal.","muted small")),h("button",{class:"btn primary",type:"button",onclick:()=>{downloadProgressBackup();showMessage("✓ Export généré. Le fichier a été téléchargé par ton navigateur.","success");}},"Exporter ma progression")),
      h("section",{class:"block backup-card"},h("span",{class:"eyebrow"},"2 · IMPORTER"),h("h2",{},"Restaurer une sauvegarde"),para("Le fichier est contrôlé avant que quoi que ce soit soit remplacé."),h("label",{class:"backup-picker"},h("strong",{},"Choisir un fichier .json"),h("span",{class:"muted small"},"Aucune donnée n’est importée tant que tu ne confirmes pas."),picker),preview,h("div",{class:"toolbar"},importBtn,undoBtn))
    ),
    status,
    h("section",{class:"block backup-safety"},h("span",{class:"eyebrow"},"SÉCURITÉ"),h("h2",{},"Import réversible"),h("div",{class:"backup-safety-grid"},
      h("article",{},h("strong",{},"Validation du fichier"),para("Le format et l’intégrité de la sauvegarde sont vérifiés avant restauration.","muted small")),
      h("article",{},h("strong",{},"Copie avant import"),para("L’état courant est automatiquement conservé juste avant chaque restauration.","muted small")),
      h("article",{},h("strong",{},"Compatible avec l’évolution du site"),para("Les champs manquants d’une ancienne sauvegarde récupèrent les valeurs par défaut actuelles.","muted small"))
    ))
  );
}
