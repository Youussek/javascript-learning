// SQL Studio — SQLite réel dans le navigateur via sql.js (asm.js).
let SQL_ENGINE_PROMISE=null;
function sqlEngine(){
  if(!SQL_ENGINE_PROMISE){
    SQL_ENGINE_PROMISE = typeof initSqlJs === "function"
      ? initSqlJs()
      : Promise.reject(new Error("Le moteur SQLite n'a pas pu être chargé."));
  }
  return SQL_ENGINE_PROMISE;
}
function sqlNormalizeError(error){
  const msg=String(error?.message||error||"Erreur SQL inconnue");
  if(/no such column/i.test(msg)) return msg+"\nVérifie le schéma de la table et le nom de la colonne.";
  if(/no such table/i.test(msg)) return msg+"\nLa table demandée n'existe pas dans cette base.";
  if(/syntax error/i.test(msg)) return msg+"\nVérifie les mots-clés et l'ordre de la requête.";
  return msg;
}
function sqlResultObject(execResult){
  if(!execResult||!execResult.length)return {columns:[],values:[],rowCount:0};
  const last=execResult[execResult.length-1];
  return {columns:last.columns||[],values:last.values||[],rowCount:(last.values||[]).length};
}
function sqlResultTable(result){
  if(!result||!result.columns.length)return h("div",{class:"sql-empty"},"Requête exécutée. Aucun tableau de résultat à afficher.");
  return h("div",{class:"sql-result-wrap"},h("table",{class:"sql-table"},h("thead",{},h("tr",{},result.columns.map(c=>h("th",{},c)))),h("tbody",{},result.values.map(row=>h("tr",{},row.map(v=>h("td",{},v===null?"NULL":String(v))))))));
}
function renderSqlWorkbench(options={}){
  const starter=String(options.query||"SELECT * FROM users;");
  const setup=String(options.setup||SQL_USERS_SETUP||"");
  const paramsStarter=options.params===undefined||options.params===null?null:JSON.stringify(options.params,null,2);
  const editor=h("textarea",{class:"answer sql-editor",rows:8,spellcheck:"false","aria-label":"Éditeur SQL"},starter);
  const paramsEditor=paramsStarter===null?null:h("textarea",{class:"answer sql-params",rows:3,spellcheck:"false","aria-label":"Paramètres SQL JSON"},paramsStarter);
  enhanceEditor(editor,()=>run(),"sql");
  const status=h("div",{class:"sql-status muted small","aria-live":"polite"},"Initialisation de SQLite…");
  const tablesBox=h("div",{class:"sql-tables"});
  const relationsBox=h("div",{class:"sql-relations"});
  const inspector=h("div",{class:"sql-inspector"},para("Clique sur une table pour afficher son schéma et quelques lignes.","muted small"));
  const resultBox=h("div",{class:"sql-results","aria-live":"polite"},para("Exécute une requête pour afficher son résultat.","muted small"));
  const errorBox=h("pre",{class:"sql-error",hidden:true});
  let db=null,lastResult=null,lastError=null,changed=false;
  async function createDb(){
    const SQL=await sqlEngine();
    if(db)try{db.close();}catch(_){}
    db=new SQL.Database();
    db.run(setup);
    lastResult=null;lastError=null;
    status.textContent="SQLite prêt · base réinitialisée";
    errorBox.hidden=true;errorBox.textContent="";
    renderTables();
    renderRelations();
    resultBox.replaceChildren(para("Base prête. Exécute la requête.","muted small"));
  }
  function tableNames(){
    if(!db)return[];
    const rows=db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
    return rows[0]?.values?.map(r=>r[0])||[];
  }
  function renderTables(){
    const names=tableNames();
    tablesBox.replaceChildren(...names.map(name=>h("button",{class:"sql-table-button",type:"button",onclick:()=>inspectTable(name)},name)));
  }
  function relationRows(){
    if(!db)return[];
    const rows=[];
    tableNames().forEach(table=>{
      try{
        const fk=db.exec(`PRAGMA foreign_key_list("${String(table).replace(/"/g,'""')}");`);
        (fk[0]?.values||[]).forEach(r=>rows.push({fromTable:table,fromColumn:r[3],toTable:r[2],toColumn:r[4]}));
      }catch(_){}
    });
    return rows;
  }
  function renderRelations(){
    const rows=relationRows();
    if(!rows.length){ relationsBox.replaceChildren(); return; }
    relationsBox.replaceChildren(
      h("div",{class:"studio-panel-title"},"RELATIONS"),
      h("div",{class:"sql-relation-list"},rows.map(rel=>h("div",{class:"sql-relation-row"},
        h("code",{},rel.fromTable+"."+rel.fromColumn),
        h("span",{class:"sql-relation-arrow","aria-hidden":"true"},"→"),
        h("code",{},rel.toTable+"."+rel.toColumn)
      )))
    );
  }
  function inspectTable(name){
    try{
      const schema=sqlResultObject(db.exec(`PRAGMA table_info(${JSON.stringify(name)});`));
      const sample=sqlResultObject(db.exec(`SELECT * FROM "${String(name).replace(/"/g,'""')}" LIMIT 5;`));
      const schemaList=h("ul",{class:"sql-schema-list"},schema.values.map(r=>h("li",{},h("code",{},r[1]+" "+r[2]+(r[5]?" · PK":"")+(r[3]?" · NOT NULL":"")))));
      const sampleBox=h("div",{class:"sql-sample"},h("strong",{},"Aperçu"),sqlResultTable(sample));
      inspector.replaceChildren(h("h4",{},name),schemaList,sampleBox);
    }catch(error){inspector.replaceChildren(h("p",{class:"error"},sqlNormalizeError(error)));}
  }
  function readParams(){
    if(!paramsEditor)return null;
    const raw=paramsEditor.value.trim();
    if(!raw)return [];
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed) && (!parsed || typeof parsed!=="object")) throw new Error("Les paramètres doivent être un tableau JSON ou un objet JSON.");
    return parsed;
  }
  async function run(query){
    await ready;
    const sql=String(query??editor.value).trim();
    let boundParams=null;
    try{
      boundParams=readParams();
      if(paramsEditor){
        const stmt=db.prepare(sql);
        try{
          stmt.bind(boundParams||[]);
          const columns=stmt.getColumnNames();
          const values=[];
          while(stmt.step())values.push(stmt.get());
          lastResult={columns,values,rowCount:values.length};
        }finally{stmt.free();}
      }else{
        const raw=db.exec(sql);
        lastResult=sqlResultObject(raw);
      }
      lastError=null;
      status.textContent="✓ Requête exécutée";
      errorBox.hidden=true;errorBox.textContent="";
      resultBox.replaceChildren(sqlResultTable(lastResult));
      renderTables();
      return {ok:true,result:lastResult,error:null,query:sql,params:boundParams};
    }catch(error){
      lastResult=null;lastError=sqlNormalizeError(error);
      status.textContent="Erreur SQL";
      errorBox.textContent=lastError;errorBox.hidden=false;
      resultBox.replaceChildren();
      return {ok:false,result:null,error:lastError,query:sql,params:boundParams};
    }
  }
  const execute=h("button",{class:"btn primary",type:"button",onclick:()=>run()},"Exécuter");
  const reset=h("button",{class:"btn",type:"button",onclick:async()=>{editor.value=starter;if(paramsEditor)paramsEditor.value=paramsStarter;changed=false;await createDb();}},"Réinitialiser la base");
  editor.addEventListener("input",()=>{changed=true;});
  if(paramsEditor)paramsEditor.addEventListener("input",()=>{changed=true;});
  editor.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();run();}});
  const ready=createDb().catch(error=>{status.textContent="Moteur SQL indisponible";errorBox.hidden=false;errorBox.textContent=String(error.message||error);});
  const node=h("section",{class:"sql-studio"},
    h("div",{class:"studio-guide"},h("strong",{},"SQL STUDIO · SQLite"),h("span",{},options.guide||"Observe les tables, écris une requête puis exécute-la.")),
    h("div",{class:"sql-workspace"},
      h("aside",{class:"sql-sidebar"},h("div",{class:"studio-panel-title"},"TABLES"),tablesBox,relationsBox,inspector),
      h("div",{class:"sql-main"},h("div",{class:"studio-panel-title"},"REQUÊTE SQL",status),editor,paramsEditor?h("div",{class:"sql-params-panel"},h("div",{class:"studio-panel-title"},"PARAMÈTRES JSON"),paramsEditor,para("Les valeurs sont liées séparément du texte SQL.","muted small")):null,h("div",{class:"toolbar sql-toolbar"},execute,reset),errorBox,h("div",{class:"studio-panel-title"},"RÉSULTAT"),resultBox)));
  return {node,editor,paramsEditor,starter,ready,run,async reset(){editor.value=starter;if(paramsEditor)paramsEditor.value=paramsStarter;changed=false;await createDb();},lock(){editor.disabled=true;if(paramsEditor)paramsEditor.disabled=true;execute.disabled=true;reset.disabled=true;},changed:()=>changed||editor.value.trim()!==starter.trim()||(paramsEditor&&paramsEditor.value.trim()!==paramsStarter.trim()),getQuery:()=>editor.value,getParams:()=>paramsEditor?readParams():null,getLastResult:()=>lastResult,getLastError:()=>lastError};
}
function renderSqlStudio(id){const preset=SQL_STUDIO_PRESETS[id];return preset?renderSqlWorkbench(preset).node:h("div",{class:"callout"},"Atelier SQL introuvable.");}
