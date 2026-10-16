// node-studio.js — environnement pédagogique Node.js partagé (Niveaux 1+).
// Réutilise l'éditeur commun et le moteur d'exécution sandboxé.

const NODE_RUNTIME_VERSION = "v22.16.0";
const NODE_NPM_VERSION = "10.9.2";

function nodeNormalizePath(input) {
  const parts = String(input || "").replace(/\\/g, "/").split("/");
  const out = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") { if (out.length > 1) out.pop(); continue; }
    out.push(part);
  }
  let value = "/" + out.join("/");
  if (!value.startsWith("/project")) value = "/project" + (value === "/" ? "" : value);
  return value || "/project";
}

function nodeResolvePath(cwd, input) {
  const raw = String(input || ".");
  return nodeNormalizePath(raw.startsWith("/") ? raw : cwd + "/" + raw);
}

function nodeDirname(path) {
  const normalized = nodeNormalizePath(path);
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length <= 1) return "/project";
  parts.pop();
  return "/" + parts.join("/");
}

function nodeBasename(path) {
  return nodeNormalizePath(path).split("/").filter(Boolean).pop() || "project";
}

function nodeShellSplit(command) {
  const parts = [];
  const re = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
  let m;
  while ((m = re.exec(String(command)))) parts.push(m[1] ?? m[2] ?? m[3]);
  return parts;
}

function nodeBuildVirtualFs(files) {
  const map = new Map();
  const dirs = new Set(["/project"]);
  (files || []).forEach(file => {
    const path = nodeResolvePath("/project", file.name || file.path || "app.js");
    map.set(path, String(file.code || ""));
    let dir = nodeDirname(path);
    while (dir.startsWith("/project")) {
      dirs.add(dir);
      if (dir === "/project") break;
      dir = nodeDirname(dir);
    }
  });
  return { files: map, dirs };
}

function nodeListDir(vfs, dir) {
  const base = nodeNormalizePath(dir);
  if (!vfs.dirs.has(base)) return null;
  const prefix = base === "/" ? "/" : base + "/";
  const names = new Map();
  vfs.dirs.forEach(path => {
    if (path === base || !path.startsWith(prefix)) return;
    const rest = path.slice(prefix.length);
    if (rest && !rest.includes("/")) names.set(rest, "dir");
  });
  vfs.files.forEach((_, path) => {
    if (!path.startsWith(prefix)) return;
    const rest = path.slice(prefix.length);
    if (rest && !rest.includes("/")) names.set(rest, "file");
  });
  return [...names.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
}

function nodeEnsureDir(vfs, path) {
  const normalized = nodeNormalizePath(path);
  const parts = normalized.split("/").filter(Boolean);
  let current = "";
  parts.forEach(part => { current += "/" + part; if (current.startsWith("/project")) vfs.dirs.add(current); });
}

function nodeReadPackage(vfs) {
  const raw = vfs.files.get("/project/package.json");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return null; }
}

function nodeSimpleBundle(vfs, entry, seen) {
  const visited = seen || new Set();
  const path = nodeNormalizePath(entry);
  if (visited.has(path)) return "";
  visited.add(path);
  let code = vfs.files.get(path);
  if (code == null) throw new Error("ERR_MODULE_NOT_FOUND: " + path);
  const deps = [];

  // Modules Node.js virtuels autorisés pour le parcours pédagogique.
  code = code.replace(/import\s+([^;]+?)\s+from\s+["'](node:(?:path|fs|fs\/promises|http|buffer|assert\/strict|test))["']\s*;?/g, (_, clause, source) => {
    const target = source === "node:path" ? "__nodePath" : source === "node:fs" ? "__nodeFs" : source === "node:http" ? "__nodeHttp" : source === "node:buffer" ? "__nodeBuffer" : source === "node:assert/strict" ? "__nodeAssert" : source === "node:test" ? "__nodeTest" : "__nodeFsPromises";
    const trimmed = clause.trim();
    if (trimmed.startsWith("{")) return `const ${trimmed} = ${target};`;
    if (/^[A-Za-z_$][\w$]*$/.test(trimmed)) return `const ${trimmed} = ${target};`;
    throw new Error("Import Node.js non pris en charge dans ce studio : " + clause);
  });

  code = code.replace(/import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']\s*;?/g, (_, names, source) => {
    if (!source.startsWith(".")) throw new Error("Ce studio exécute les imports locaux simples et quelques modules Node.js intégrés.");
    let dep = nodeResolvePath(nodeDirname(path), source);
    if (!/\.[a-z]+$/i.test(dep)) dep += ".js";
    deps.push(nodeSimpleBundle(vfs, dep, visited));
    return "";
  });
  code = code.replace(/\bexport\s+(?=(const|let|var|function|class)\b)/g, "");
  return deps.join("\n") + "\n" + code;
}

function nodeAsyncSandbox(code, files, cwd, argv, httpRequest) {
  return new Promise(resolve => {
    let worker, url;
    try {
      const source = `self.onmessage = async function(event){
        const logs=[];
        const fakeConsole={log:(...a)=>logs.push(a.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' ')),info:(...a)=>logs.push(a.join(' ')),warn:(...a)=>logs.push(a.join(' ')),error:(...a)=>logs.push(a.join(' '))};
        const data=event.data;
        const __files=new Map(Object.entries(data.files));
        const __cwd=data.cwd;
        const norm=(input)=>{const raw=String(input||'').replace(/\\\\/g,'/');const base=raw.startsWith('/')?raw:(__cwd+'/'+raw);const out=[];for(const part of base.split('/')){if(!part||part==='.')continue;if(part==='..'){if(out.length>1)out.pop();continue;}out.push(part);}let v='/'+out.join('/');if(!v.startsWith('/project'))v='/project'+(v==='/'?'':v);return v;};
        const dirname=(p)=>{const n=norm(p),parts=n.split('/').filter(Boolean);if(parts.length<=1)return '/project';parts.pop();return '/'+parts.join('/');};
        const basename=(p)=>norm(p).split('/').filter(Boolean).pop()||'project';
        const extname=(p)=>{const b=basename(p),i=b.lastIndexOf('.');return i>0?b.slice(i):'';};
        const __nodePath={join:(...parts)=>norm(parts.join('/')),resolve:(...parts)=>norm(parts.join('/')),basename,extname,dirname};
        const readText=(p,enc)=>{const key=norm(p);if(!__files.has(key)){const e=new Error('ENOENT: no such file or directory, open '+key);e.code='ENOENT';throw e;}const value=__files.get(key);return enc?String(value):String(value);};
        const writeText=(p,value)=>{__files.set(norm(p),String(value));};
        const appendText=(p,value)=>{const key=norm(p);__files.set(key,(__files.get(key)||'')+String(value));};
        const __nodeFsPromises={
          readFile: async (p,enc)=>readText(p,enc),
          writeFile: async (p,v)=>writeText(p,v),
          appendFile: async (p,v)=>appendText(p,v),
          mkdir: async ()=>undefined,
          readdir: async (p)=>{const base=norm(p),prefix=base+'/',names=new Set();for(const k of __files.keys()){if(k.startsWith(prefix)){const rest=k.slice(prefix.length);if(rest&&!rest.includes('/'))names.add(rest);}}return [...names];}
        };
        const __nodeFs={...__nodeFsPromises,createReadStream:(p,options={})=>{const text=readText(p,"utf8");const size=Math.max(1,Number(options.highWaterMark)||8);return{async *[Symbol.asyncIterator](){for(let i=0;i<text.length;i+=size)yield text.slice(i,i+size);}};}};
        const __BufferCompat={from:(value)=>{const text=String(value);return{length:new TextEncoder().encode(text).length,toString:()=>text};},byteLength:(value)=>new TextEncoder().encode(String(value)).length};
        const __nodeBuffer={Buffer:__BufferCompat,...__BufferCompat};
        const __nodeAssert={strictEqual:(actual,expected,msg)=>{if(actual!==expected)throw new Error(msg||('Expected '+JSON.stringify(actual)+' to strictly equal '+JSON.stringify(expected)));},deepEqual:(actual,expected,msg)=>{if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error(msg||'Values are not deeply equal');},ok:(value,msg)=>{if(!value)throw new Error(msg||'Expected value to be truthy');}};
        const __nodeTest={test:async(name,fn)=>{try{await fn();fakeConsole.log('✓ '+name);}catch(error){fakeConsole.error('✗ '+name+': '+error.message);throw error;}}};
        const __server={handler:null,port:null};
        const __nodeHttp={createServer:(handler)=>({listen:(port,cb)=>{__server.handler=handler;__server.port=Number(port);fakeConsole.log('Server listening on http://localhost:'+port);if(cb)cb();return this;},close:(cb)=>{__server.handler=null;if(cb)cb();}})};
        const __signals={};
        const process={argv:data.argv,env:{NODE_ENV:'development',USER:'student'},cwd:()=>__cwd,exitCode:0,on:(name,cb)=>{(__signals[name]||=[]).push(cb);return process;},emit:async(name,...args)=>{for(const cb of (__signals[name]||[]))await cb(...args);return (__signals[name]||[]).length>0;}};
        try{
          const fn=new Function('console','process','__nodePath','__nodeFs','__nodeFsPromises','__nodeHttp','__nodeBuffer','__nodeAssert','__nodeTest','Buffer','return (async()=>{' + data.code + '\\n})()');
          await fn(fakeConsole,process,__nodePath,__nodeFs,__nodeFsPromises,__nodeHttp,__nodeBuffer,__nodeAssert,__nodeTest,__nodeBuffer);
          let response=null;
          if(data.httpRequest){
            if(!__server.handler) throw new Error('Aucun serveur HTTP n\'a été créé avec http.createServer().');
            const chunks=[]; const headers={}; let ended=false;
            const reqListeners={data:[],end:[]};
            const req={method:data.httpRequest.method||'GET',url:data.httpRequest.url||'/',headers:data.httpRequest.headers||{},on:(name,cb)=>{if(reqListeners[name])reqListeners[name].push(cb);return req;}};
            const res={statusCode:200,setHeader:(name,value)=>{headers[String(name).toLowerCase()]=String(value);},getHeader:(name)=>headers[String(name).toLowerCase()],writeHead:(status,nextHeaders)=>{res.statusCode=Number(status);Object.entries(nextHeaders||{}).forEach(([k,v])=>res.setHeader(k,v));return res;},write:(value)=>{chunks.push(String(value));return true;},end:(value)=>{if(value!==undefined)chunks.push(typeof value==='string'?value:String(value));ended=true;}};
            await __server.handler(req,res);
            const bodyText=data.httpRequest.body||''; if(bodyText) for(const cb of reqListeners.data) cb(bodyText); for(const cb of reqListeners.end) cb();
            await Promise.resolve();
            response={status:res.statusCode,headers,body:chunks.join(''),ended};
          }
          self.postMessage({logs,error:null,files:Object.fromEntries(__files),httpResponse:response,serverPort:__server.port});
        }catch(error){self.postMessage({logs,error:String(error&&error.stack||error),files:Object.fromEntries(__files)});}
      }`;
      url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
      worker=new Worker(url);
    } catch(error){ resolve({logs:[],error:"Ce navigateur ne permet pas d’exécuter ce Node Lab.",files}); return; }
    const timer=setTimeout(()=>{worker.terminate();URL.revokeObjectURL(url);resolve({logs:[],error:"Le script a tourné trop longtemps (plus de 2 secondes).",files,timeout:true});},2000);
    worker.onmessage=e=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);resolve(e.data);};
    worker.onerror=e=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);resolve({logs:[],error:e.message||"Erreur inconnue.",files});};
    worker.postMessage({code,files,cwd,argv,httpRequest:httpRequest||null});
  });
}

async function nodeRunVirtualScript(vfs, cwd, filePath, args, httpRequest) {
  const abs = nodeResolvePath(cwd, filePath);
  if (!vfs.files.has(abs)) return { ok:false, logs:[], error:"MODULE_NOT_FOUND: Cannot find module '" + filePath + "'", exitCode:1 };
  let code;
  try { code = nodeSimpleBundle(vfs, abs); }
  catch (error) { return { ok:false, logs:[], error:String(error.message || error), exitCode:1 }; }
  const argv = ["node", abs].concat(args || []);
  const files = Object.fromEntries(vfs.files);
  const result = await nodeAsyncSandbox(code, files, cwd, argv, httpRequest);
  if (result.files) {
    vfs.files = new Map(Object.entries(result.files));
    for (const path of vfs.files.keys()) nodeEnsureDir(vfs,nodeDirname(path));
  }
  return { ok:!result.error, logs:result.logs || [], error:result.error || null, exitCode:result.error ? 1 : 0, httpResponse:result.httpResponse||null, serverPort:result.serverPort||null };
}

function renderNodeWorkbench(options) {
  const settings = options || {};
  const initialFiles = (settings.files || [{name:"app.js",code:'console.log("Bonjour Node.js");'}]).map(f=>({name:f.name||f.path,code:String(f.code||"")}));
  const initialSnapshot = JSON.stringify(initialFiles);
  let vfs = nodeBuildVirtualFs(initialFiles);
  let cwd = "/project";
  let activePath = nodeResolvePath(cwd, settings.active || initialFiles[0].name);
  if (!vfs.files.has(activePath)) activePath = [...vfs.files.keys()][0];
  let locked = false;
  let lastRun = null;
  const history = [];

  const explorer = h("div",{class:"studio-explorer-tree"});
  const fileTitle = h("span",{},nodeBasename(activePath));
  const editor = makeEditor(vfs.files.get(activePath) || "", 16, onEdit, "js-browser");
  const terminalBody = h("div",{class:"studio-terminal-body",role:"log","aria-live":"polite"});
  const prompt = h("span",{class:"studio-terminal-prompt"},"~/project $");
  const terminalInput = h("input",{class:"studio-terminal-input",autocomplete:"off",spellcheck:"false","aria-label":"Commande Node.js"});
  const status = h("small",{},"VFS · /project");
  const httpMethod=h("select",{class:"node-http-method","aria-label":"Méthode HTTP"},["GET","POST","PUT","PATCH","DELETE"].map(method=>h("option",{value:method},method)));
  const httpUrl=h("input",{class:"node-http-url",value:"/",placeholder:"/users","aria-label":"URL de requête"});
  const httpBody=h("textarea",{class:"node-http-body",rows:"4",placeholder:'{ "name": "Ada" }',"aria-label":"Body HTTP JSON"});
  const httpResponse=h("pre",{class:"node-http-response"},"Aucune requête envoyée.");

  function snapshotFiles(){ return [...vfs.files.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([path,code])=>({name:path.replace(/^\/project\/?/,"")||nodeBasename(path),code})); }
  function readFile(name){ return vfs.files.get(nodeResolvePath(cwd,name)); }
  function fileExists(name){ return vfs.files.has(nodeResolvePath(cwd,name)); }
  function dirExists(name){ return vfs.dirs.has(nodeResolvePath(cwd,name)); }
  function writeFile(name,code){ const path=nodeResolvePath(cwd,name); nodeEnsureDir(vfs,nodeDirname(path)); vfs.files.set(path,String(code)); renderExplorer(); if(path===activePath){editor.value=String(code);} }

  function renderExplorer(){
    explorer.replaceChildren(h("div",{class:"studio-tree-root"},"node-app/"));
    snapshotFiles().forEach(file=>{
      const path=nodeResolvePath("/project",file.name);
      const depth=file.name.split("/").length;
      const btn=h("button",{class:"studio-file"+(depth>1?" depth-2":""),type:"button",onclick:()=>openFile(path)},(depth>1?"↳ ":"")+file.name);
      if(path===activePath) btn.setAttribute("aria-current","true");
      explorer.append(btn);
    });
  }
  function openFile(path){
    if (locked || !vfs.files.has(path)) return;
    activePath = path;
    editor.value = vfs.files.get(path) || "";
    fileTitle.textContent = path.replace(/^\/project\/?/,"");
    renderExplorer();
  }
  function onEdit(){ if(!locked && activePath) vfs.files.set(activePath,editor.value); }
  function addLine(text,cls){ terminalBody.append(h("div",{class:"studio-terminal-line "+(cls||"")},String(text))); terminalBody.scrollTop=terminalBody.scrollHeight; }
  function syncPrompt(){ prompt.textContent=(cwd==="/project"?"~/project":cwd.replace("/project","~"))+" $"; status.textContent="VFS · "+cwd; }

  async function executeCommand(command, nested) {
    const raw=String(command||"").trim();
    if(!raw) return {ok:true,output:[]};
    const parts=nodeShellSplit(raw), cmd=parts[0], args=parts.slice(1), output=[];
    if(!nested) addLine("$ "+raw,"command");
    history.push({command:raw,cwd});
    function out(text,cls){ output.push(String(text)); addLine(text,cls); }
    if(cmd==="clear"){terminalBody.replaceChildren();return{ok:true,output:[]};}
    if(cmd==="pwd"){out(cwd);return{ok:true,output};}
    if(cmd==="ls"){
      const target=nodeResolvePath(cwd,args[0]||"."); const rows=nodeListDir(vfs,target);
      if(!rows){out("ls: cannot access '"+(args[0]||".")+"': No such directory","error");return{ok:false,output};}
      out(rows.map(([name,type])=>name+(type==="dir"?"/":"")).join("  ")||""); return{ok:true,output};
    }
    if(cmd==="cd"){
      const target=nodeResolvePath(cwd,args[0]||"/project"); if(!vfs.dirs.has(target)){out("cd: "+(args[0]||"")+": No such directory","error");return{ok:false,output};}
      cwd=target; syncPrompt(); return{ok:true,output};
    }
    if(cmd==="mkdir"){
      const names=args.filter(x=>x!=="-p"); if(!names.length){out("mkdir: missing operand","error");return{ok:false,output};}
      names.forEach(name=>nodeEnsureDir(vfs,nodeResolvePath(cwd,name))); renderExplorer(); return{ok:true,output};
    }
    if(cmd==="touch"){
      if(!args.length){out("touch: missing file operand","error");return{ok:false,output};}
      args.forEach(name=>{const path=nodeResolvePath(cwd,name);nodeEnsureDir(vfs,nodeDirname(path));if(!vfs.files.has(path))vfs.files.set(path,"");});renderExplorer();return{ok:true,output};
    }
    if(cmd==="cat"){
      const path=nodeResolvePath(cwd,args[0]||""); if(!vfs.files.has(path)){out("cat: "+(args[0]||"")+": No such file","error");return{ok:false,output};}
      out(vfs.files.get(path)); return{ok:true,output};
    }
    if(cmd==="node" && (args[0]==="--version"||args[0]==="-v")){out(NODE_RUNTIME_VERSION,"success");return{ok:true,output};}
    if(cmd==="npm" && args[0]==="--version"){out(NODE_NPM_VERSION,"success");return{ok:true,output};}
    if(cmd==="npm" && args[0]==="init"){
      if(args.includes("-y")||args.includes("--yes")){
        const pkg={name:"node-app",version:"1.0.0",type:"module",scripts:{start:"node app.js"}};
        vfs.files.set("/project/package.json",JSON.stringify(pkg,null,2)+"\n");renderExplorer();out("Wrote to /project/package.json","success");return{ok:true,output};
      }
      out("Mode pédagogique : utilise `npm init -y` pour créer package.json sans questionnaire.","hint");return{ok:true,output};
    }
    if(cmd==="npm" && args[0]==="test") return await executeCommand("npm run test",true);
    if(cmd==="npm" && ["install","i"].includes(args[0])){
      const pkg=nodeReadPackage(vfs); if(!pkg){out("npm error: package.json introuvable","error");return{ok:false,output};}
      const names=args.slice(1).filter(x=>!x.startsWith("-")); if(!names.length){out("up to date, audited 1 package","success");return{ok:true,output};}
      const dev=args.includes("-D")||args.includes("--save-dev"),key=dev?"devDependencies":"dependencies"; if(!pkg[key])pkg[key]={};
      names.forEach(name=>pkg[key][name]="^1.0.0"); vfs.files.set("/project/package.json",JSON.stringify(pkg,null,2)+"\n");
      vfs.files.set("/project/package-lock.json",JSON.stringify({name:pkg.name||"node-app",lockfileVersion:3,requires:true,packages:{}},null,2)+"\n");renderExplorer();out("added "+names.length+" package(s)","success");return{ok:true,output};
    }
    if(cmd==="npm" && ["uninstall","remove","rm"].includes(args[0])){
      const pkg=nodeReadPackage(vfs); if(!pkg){out("npm error: package.json introuvable","error");return{ok:false,output};}
      args.slice(1).forEach(name=>{if(pkg.dependencies)delete pkg.dependencies[name];if(pkg.devDependencies)delete pkg.devDependencies[name];});vfs.files.set("/project/package.json",JSON.stringify(pkg,null,2)+"\n");renderExplorer();out("removed package(s)","success");return{ok:true,output};
    }
    if(cmd==="npm" && args[0]==="audit"){out("found 0 vulnerabilities","success");return{ok:true,output};}
    if(cmd==="npm" && args[0]==="run"){
      const pkg=nodeReadPackage(vfs); if(!pkg){out("npm error: package.json introuvable","error");return{ok:false,output};}
      if(!args[1]){Object.entries(pkg.scripts||{}).forEach(([name,value])=>out(name+" -> "+value));return{ok:true,output};}
      const script=pkg.scripts&&pkg.scripts[args[1]]; if(!script){out("npm error Missing script: \""+args[1]+"\"","error");return{ok:false,output};}
      out("> node-app@"+(pkg.version||"1.0.0")+" "+args[1]); out("> "+script,"command");
      return await executeCommand(script,true);
    }
    if(cmd==="node"){
      if(!args[0]){out("Bienvenue dans le terminal pédagogique Node.js. Indique un fichier, ex. `node app.js`.","hint");return{ok:true,output};}
      const result=await nodeRunVirtualScript(vfs,cwd,args[0],args.slice(1)); lastRun={command:raw,...result}; renderExplorer();
      (result.logs||[]).forEach(line=>out(line,"success")); if(result.error)out(result.error,"error"); return{ok:result.ok,output,error:result.error};
    }
    out("Commande non reconnue dans ce terminal pédagogique : "+cmd,"hint");
    return{ok:false,output};
  }

  async function sendHttpRequest(method,url,body,headers){
    const entry=settings.serverEntry||"server.js";
    const result=await nodeRunVirtualScript(vfs,"/project",entry,[],{method:method||"GET",url:url||"/",body:body||"",headers:headers||{"content-type":"application/json"}});
    lastRun={command:"HTTP "+(method||"GET")+" "+(url||"/"),...result};
    (result.logs||[]).forEach(line=>addLine(line,"success"));
    if(result.error){httpResponse.textContent=result.error;return result;}
    const r=result.httpResponse||{status:500,headers:{},body:"",ended:false};
    httpResponse.textContent="Status: "+r.status+"\nHeaders: "+JSON.stringify(r.headers,null,2)+"\n\n"+(r.body||"");
    return result;
  }

  terminalInput.addEventListener("keydown",async e=>{if(e.key==="Enter"){const value=terminalInput.value;terminalInput.value="";await executeCommand(value);}});

  function reset(){
    vfs=nodeBuildVirtualFs(JSON.parse(initialSnapshot));cwd="/project";activePath=[...vfs.files.keys()][0];lastRun=null;history.length=0;terminalBody.replaceChildren();httpResponse.textContent="Aucune requête envoyée.";editor.value=vfs.files.get(activePath)||"";fileTitle.textContent=activePath.replace(/^\/project\/?/,"");renderExplorer();syncPrompt();
  }
  function lock(){locked=true;editor.readOnly=true;terminalInput.disabled=true;}
  function changed(){return JSON.stringify(snapshotFiles())!==JSON.stringify(JSON.parse(initialSnapshot).map(f=>({name:f.name,code:f.code})).sort((a,b)=>a.name.localeCompare(b.name)))||history.length>0;}

  const node=h("div",{class:"node-workbench"},
    h("div",{class:"studio-guide"},h("strong",{},"NODE LAB"),h("span",{},settings.guide||"Modifie les fichiers puis utilise le terminal. Le système de fichiers reste cohérent entre les deux."),status),
    h("div",{class:"studio-workspace node-workspace"},
      h("aside",{class:"studio-explorer"},h("div",{class:"studio-panel-title"},h("span",{},"EXPLORATEUR"),h("small",{},"virtuel")),explorer),
      h("section",{class:"studio-code"},h("div",{class:"studio-panel-title"},fileTitle,h("small",{},"éditeur partagé")),h("div",{class:"studio-editor-area"},editor))),
    h("section",{class:"studio-terminal node-terminal"},h("div",{class:"studio-panel-title"},h("span",{},"TERMINAL"),h("small",{},"sandbox pédagogique")),terminalBody,h("label",{class:"studio-terminal-row"},prompt,terminalInput)),
    settings.httpClient?h("section",{class:"node-http-client"},h("div",{class:"studio-panel-title"},h("span",{},"CLIENT HTTP"),h("small",{},"requête simulée vers localhost")),h("div",{class:"node-http-request-row"},httpMethod,httpUrl,h("button",{class:"btn primary",type:"button",onclick:()=>sendHttpRequest(httpMethod.value,httpUrl.value,httpBody.value)},"Envoyer")),httpBody,httpResponse):null,
    h("div",{class:"toolbar studio-toolbar"},h("button",{class:"btn",type:"button",onclick:()=>executeCommand("ls")},"ls"),h("button",{class:"btn",type:"button",onclick:()=>executeCommand("node app.js")},"node app.js"),h("button",{class:"btn ghost",type:"button",onclick:reset},"Réinitialiser")),
    h("div",{class:"studio-note"},h("strong",{},"Environnement sécurisé"),para("Le terminal manipule uniquement un système de fichiers virtuel. Les scripts sont exécutés dans un Worker sandboxé ; aucune commande système réelle ni aucun fichier de ta machine n'est accessible.","muted small")));
  renderExplorer();syncPrompt();

  return {node,editor,executeCommand,sendHttpRequest,reset,lock,getFiles:snapshotFiles,readFile,fileExists,dirExists,writeFile,get cwd(){return cwd;},get history(){return history.slice();},get lastRun(){return lastRun;},changed};
}

function renderNodeStudio(presetId){
  const preset=NODE_STUDIO_PRESETS[presetId];
  if(!preset)return h("div",{class:"callout"},para("Atelier Node.js introuvable."));
  return renderNodeWorkbench({files:preset.files,active:preset.active,guide:preset.guide,httpClient:preset.httpClient===true,serverEntry:preset.serverEntry}).node;
}
