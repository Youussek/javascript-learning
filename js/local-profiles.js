// local-profiles.js — plusieurs progressions indépendantes sur un même navigateur.

const LOCAL_PROFILE_MAX = 8;

function localProfiles(){ return readProfileRegistry().profiles.slice(); }
function localProfileActive(){ return getActiveProfileMeta(); }

function localProfileSlug(){
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID().slice(0,8);
  return Date.now().toString(36)+Math.random().toString(36).slice(2,6);
}

function localProfileProgressSummary(profileId){
  try{
    const raw=localStorage.getItem(profileStateStorageKey(profileId));
    const st=raw?Object.assign(defaultState(),JSON.parse(raw)):defaultState();
    if(typeof backupProgressSummary === "function") return backupProgressSummary(st);
    const pathStores=[st,["react","css","html","typescript","node","sql","git"].map(k=>st[k])].flat();
    return {lessons:pathStores.reduce((n,x)=>n+Object.values(x?.lessonsDone||{}).filter(Boolean).length,0)};
  }catch(_){return {lessons:0,exercises:0,projects:0};}
}

function createLocalProfile(name){
  const clean=String(name||"").trim().replace(/\s+/g," ").slice(0,40);
  if(!clean) return {ok:false,error:"Choisis un nom pour le profil."};
  const registry=readProfileRegistry();
  if(registry.profiles.length>=LOCAL_PROFILE_MAX) return {ok:false,error:`Tu peux créer jusqu’à ${LOCAL_PROFILE_MAX} profils locaux.`};
  if(registry.profiles.some(p=>p.name.toLocaleLowerCase("fr")===clean.toLocaleLowerCase("fr"))) return {ok:false,error:"Un profil porte déjà ce nom."};
  const now=new Date().toISOString();
  const id="p-"+localProfileSlug();
  registry.profiles.push({id,name:clean,createdAt:now,lastUsedAt:null});
  writeProfileRegistry(registry);
  try{localStorage.setItem(profileStateStorageKey(id),JSON.stringify(defaultState()));}catch(_){return {ok:false,error:"Le navigateur n’a pas pu créer le stockage de ce profil."};}
  return {ok:true,id};
}

function renameLocalProfile(profileId,name){
  const clean=String(name||"").trim().replace(/\s+/g," ").slice(0,40);
  if(!clean) return {ok:false,error:"Le nom ne peut pas être vide."};
  const registry=readProfileRegistry();
  if(registry.profiles.some(p=>p.id!==profileId&&p.name.toLocaleLowerCase("fr")===clean.toLocaleLowerCase("fr"))) return {ok:false,error:"Un autre profil porte déjà ce nom."};
  const p=registry.profiles.find(x=>x.id===profileId); if(!p) return {ok:false,error:"Profil introuvable."};
  p.name=clean; writeProfileRegistry(registry); return {ok:true};
}

function switchLocalProfile(profileId){
  const registry=readProfileRegistry();
  const p=registry.profiles.find(x=>x.id===profileId); if(!p) return false;
  p.lastUsedAt=new Date().toISOString(); writeProfileRegistry(registry);
  try{localStorage.setItem(ACTIVE_PROFILE_KEY,profileId);}catch(_){return false;}
  location.hash="#/dashboard";
  location.reload();
  return true;
}

function duplicateLocalProfile(profileId){
  const registry=readProfileRegistry();
  const source=registry.profiles.find(x=>x.id===profileId); if(!source) return {ok:false,error:"Profil introuvable."};
  if(registry.profiles.length>=LOCAL_PROFILE_MAX) return {ok:false,error:`Tu peux créer jusqu’à ${LOCAL_PROFILE_MAX} profils locaux.`};
  const now=new Date().toISOString(), id="p-"+localProfileSlug();
  let base=`${source.name} — copie`, name=base, i=2;
  while(registry.profiles.some(p=>p.name===name)) name=`${base} ${i++}`;
  name=name.slice(0,40);
  registry.profiles.push({id,name,createdAt:now,lastUsedAt:null});
  try{
    const raw=localStorage.getItem(profileStateStorageKey(profileId));
    localStorage.setItem(profileStateStorageKey(id),raw||JSON.stringify(defaultState()));
    writeProfileRegistry(registry); return {ok:true,id};
  }catch(_){return {ok:false,error:"Impossible de dupliquer ce profil."};}
}

function deleteLocalProfile(profileId){
  const registry=readProfileRegistry();
  if(registry.profiles.length<=1) return {ok:false,error:"Il faut conserver au moins un profil local."};
  if(profileId===getActiveProfileId()) return {ok:false,error:"Change d’abord de profil avant de supprimer celui qui est actif."};
  const index=registry.profiles.findIndex(p=>p.id===profileId); if(index<0) return {ok:false,error:"Profil introuvable."};
  registry.profiles.splice(index,1); writeProfileRegistry(registry);
  try{localStorage.removeItem(profileStateStorageKey(profileId));localStorage.removeItem(`cahierJS.preImportBackup.${profileId}.v1`);}catch(_){}
  return {ok:true};
}

function localProfileDate(iso){
  if(!iso) return "Jamais utilisé";
  try{return new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(iso));}catch(_){return iso;}
}

function renderLocalProfiles(){
  const page=h("div",{class:"page local-profiles-page"});
  const flash=h("div",{class:"profiles-flash","aria-live":"polite"});
  const active=localProfileActive();
  const profiles=localProfiles();
  const input=h("input",{class:"profiles-name-input",type:"text",maxlength:40,placeholder:"Ex. Youssef · apprentissage perso","aria-label":"Nom du nouveau profil"});
  const createBtn=h("button",{class:"btn primary",type:"button"},"Créer un profil");

  function message(text,type="muted"){flash.replaceChildren(h("p",{class:type},text));}
  createBtn.addEventListener("click",()=>{const result=createLocalProfile(input.value);if(!result.ok){message(result.error,"error");return;}input.value="";message("✓ Profil créé. Tu peux maintenant l’ouvrir.","success");setTimeout(()=>router(),50);});
  input.addEventListener("keydown",e=>{if(e.key==="Enter")createBtn.click();});

  const cards=profiles.map(profile=>{
    const current=profile.id===active.id;
    const s=localProfileProgressSummary(profile.id);
    const actions=[];
    if(current) actions.push(h("span",{class:"chip profile-active-chip"},"● Profil actif"));
    else actions.push(h("button",{class:"btn primary small",type:"button",onclick:()=>switchLocalProfile(profile.id)},"Ouvrir"));
    actions.push(h("button",{class:"btn ghost small",type:"button",onclick:()=>{
      const next=window.prompt("Nouveau nom du profil :",profile.name); if(next===null)return;
      const result=renameLocalProfile(profile.id,next); if(!result.ok){window.alert(result.error);return;} router();
    }},"Renommer"));
    actions.push(h("button",{class:"btn ghost small",type:"button",onclick:()=>{const result=duplicateLocalProfile(profile.id);if(!result.ok){window.alert(result.error);return;}router();}},"Dupliquer"));
    if(!current) actions.push(h("button",{class:"btn ghost small danger",type:"button",onclick:()=>{
      if(!window.confirm(`Supprimer « ${profile.name} » et toute sa progression locale ? Cette action est définitive.`))return;
      const result=deleteLocalProfile(profile.id);if(!result.ok){window.alert(result.error);return;}router();
    }},"Supprimer"));
    return h("article",{class:"local-profile-card"+(current?" active":"")},
      h("div",{class:"local-profile-card-head"},h("div",{},h("span",{class:"eyebrow"},current?"PROFIL ACTIF":"PROFIL LOCAL"),h("h2",{},profile.name)),h("span",{class:"profile-avatar","aria-hidden":"true"},profile.name.trim().charAt(0).toUpperCase()||"P")),
      h("div",{class:"profile-metrics"},h("div",{},h("strong",{},String(s.lessons||0)),h("span",{},"cours")),h("div",{},h("strong",{},String(s.exercises||0)),h("span",{},"exercices")),h("div",{},h("strong",{},String(s.projects||0)),h("span",{},"projets"))),
      para("Dernière utilisation : "+localProfileDate(profile.lastUsedAt),"muted small"),
      h("div",{class:"toolbar profile-actions"},...actions)
    );
  });

  page.append(
    pageTitle("Profils locaux","Crée plusieurs espaces indépendants sur ce navigateur. Chaque profil conserve sa propre progression, ses XP, ses badges, ses brouillons et ses réglages pédagogiques."),
    h("section",{class:"profiles-hero"},h("div",{},h("span",{class:"eyebrow"},"ESPACE ACTUEL"),h("h2",{},active.name),para("Tout ce que tu valides maintenant est enregistré uniquement dans ce profil.","muted")),h("div",{class:"profiles-isolation"},h("strong",{},"Séparation stricte"),para("Changer de profil recharge son propre état local. Aucun cours, exercice, XP ou historique n’est fusionné.","muted small"))),
    h("section",{class:"block profiles-create"},h("span",{class:"eyebrow"},"NOUVEAU PROFIL"),h("h2",{},"Créer un espace vierge"),para(`Jusqu’à ${LOCAL_PROFILE_MAX} profils sur ce navigateur. Un nouveau profil démarre sans progression.`),h("div",{class:"profiles-create-row"},input,createBtn),flash),
    h("section",{class:"profiles-grid"},...cards),
    h("section",{class:"block profiles-note"},h("h2",{},"À savoir"),para("Les profils sont locaux à ce navigateur et à cet appareil. Pour déplacer une progression vers un autre appareil, utilise Sauvegarde & export depuis le profil concerné.","muted"),link("/sauvegarde","Ouvrir Sauvegarde & export →","btn"))
  );
  return page;
}
