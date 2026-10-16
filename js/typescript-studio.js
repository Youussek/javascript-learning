// TypeScript Studio — mini Playground pédagogique intégré à Cahier Code.
// Le compilateur TypeScript est chargé localement depuis vendor/typescript-5.8.3.js.

const TS_MINI_LIB = `
interface Object {}
interface Function {}
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface IArguments { length: number; [index: number]: any; }
interface String { readonly length: number; toUpperCase(): string; toLowerCase(): string; trim(): string; }
declare var String: { (value?: any): string; };
interface Number { toFixed(fractionDigits?: number): string; }
declare var Number: { (value?: any): number; };
interface Boolean {}
interface RegExp {}
interface SymbolConstructor { readonly iterator: unique symbol; }
declare var Symbol: SymbolConstructor;
interface IteratorResult<T> { done?: boolean; value: T; }
interface Iterator<T> { next(): IteratorResult<T>; }
interface IterableIterator<T> extends Iterator<T> { [Symbol.iterator](): IterableIterator<T>; }
interface Array<T> { readonly length: number; [n: number]: T; push(...items: T[]): number; pop(): T | undefined; map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[]; filter(predicate: (value: T, index: number, array: T[]) => boolean): T[]; [Symbol.iterator](): IterableIterator<T>; }
interface ReadonlyArray<T> { readonly length: number; readonly [n: number]: T; }
type Record<K extends keyof any, T> = { [P in K]: T };
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
interface Error { name: string; message: string; }
declare var Error: { new(message?: string): Error; };
interface PromiseLike<T> { then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2>; }
interface Promise<T> { then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>; catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult>; }
declare var Promise: { resolve<T>(value: T | PromiseLike<T>): Promise<T>; reject<T = never>(reason?: any): Promise<T>; };
declare const console: { log(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; };
declare function parseInt(value: string, radix?: number): number;
declare function parseFloat(value: string): number;
`;

function tsCompilerReady() { return typeof ts !== "undefined" && !!ts.createProgram; }

function tsAnalyze(code) {
  if (!tsCompilerReady()) return { diagnostics:[{ code:0, category:"error", message:"Le compilateur TypeScript local n'est pas chargé.", line:1, column:1 }], js:"", ok:false };
  const files = { "main.ts": code, "lib.d.ts": TS_MINI_LIB };
  const options = { strict:true, target:ts.ScriptTarget.ES2020, module:ts.ModuleKind.ESNext, noLib:true, skipLibCheck:true };
  const host = {
    getSourceFile(name, languageVersion) { return Object.prototype.hasOwnProperty.call(files,name) ? ts.createSourceFile(name, files[name], languageVersion, true) : undefined; },
    writeFile() {},
    getDefaultLibFileName() { return "lib.d.ts"; },
    useCaseSensitiveFileNames() { return true; },
    getCanonicalFileName(name) { return name; },
    getCurrentDirectory() { return ""; },
    getNewLine() { return "\n"; },
    fileExists(name) { return Object.prototype.hasOwnProperty.call(files,name); },
    readFile(name) { return files[name]; },
    directoryExists() { return true; },
    getDirectories() { return []; }
  };
  let diagnostics = [];
  try {
    const program = ts.createProgram(["lib.d.ts","main.ts"], options, host);
    diagnostics = ts.getPreEmitDiagnostics(program)
      .filter(d => !d.file || d.file.fileName === "main.ts")
      .map(d => {
        let line=1,column=1;
        if (d.file && typeof d.start === "number") { const pos=d.file.getLineAndCharacterOfPosition(d.start); line=pos.line+1; column=pos.character+1; }
        return { code:d.code, category:ts.DiagnosticCategory[d.category].toLowerCase(), message:ts.flattenDiagnosticMessageText(d.messageText," "), line, column };
      });
  } catch (error) {
    diagnostics = [{code:0,category:"error",message:error.message||String(error),line:1,column:1}];
  }
  let js="";
  try {
    js = ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.None,removeComments:false}}).outputText.trim();
  } catch (_) {}
  return { diagnostics, js, ok:diagnostics.length===0 };
}

function tsAst(code) { return tsCompilerReady() ? ts.createSourceFile("main.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS) : null; }
function tsTypeText(node) { return node && node.type ? node.type.getText() : ""; }
function tsFindVariable(code,name) {
  const sf=tsAst(code); let found=null; if(!sf)return null;
  function visit(node){ if(ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text===name) found=node; ts.forEachChild(node,visit); } visit(sf); return found;
}
function tsFindFunction(code,name) {
  const sf=tsAst(code); let found=null; if(!sf)return null;
  function visit(node){ if(ts.isFunctionDeclaration(node) && node.name && node.name.text===name) found=node; ts.forEachChild(node,visit); } visit(sf); return found;
}
function tsFindArrayVariable(code,name){ const n=tsFindVariable(code,name); return n && n.initializer ? n : null; }
function tsHasObjectShape(code,varName,props){ const v=tsFindVariable(code,varName); if(!v||!v.initializer||!ts.isObjectLiteralExpression(v.initializer))return false; const names=new Set(v.initializer.properties.map(p=>p.name&&p.name.getText().replace(/["']/g,"")).filter(Boolean)); return props.every(p=>names.has(p)); }

async function tsRunJavaScript(js) {
  const iframe = document.createElement("iframe"); iframe.hidden=true; iframe.setAttribute("sandbox","allow-scripts"); document.body.append(iframe);
  try {
    const result = await runPage(iframe,[{name:"index.html",code:"<!doctype html><html><body><script src='script.js'></script></body></html>"},{name:"script.js",code:js}],[],2500);
    return result;
  } finally { iframe.remove(); }
}

function renderTsDiagnostics(box, diagnostics) {
  box.replaceChildren(h("div",{class:"studio-panel-title"},h("span",{},"DIAGNOSTICS"),h("small",{},diagnostics.length?diagnostics.length+" problème(s)":"Aucune erreur")));
  if(!diagnostics.length){ box.append(h("div",{class:"ts-diagnostic-ok"},"✓ Le compilateur ne signale aucune erreur.")); return; }
  diagnostics.forEach(d=>box.append(h("div",{class:"ts-diagnostic "+d.category},h("strong",{},"TS"+d.code+" · ligne "+d.line+":"+d.column),para(d.message,"small"))));
}

function renderTypeScriptWorkbench(options) {
  const settings=options||{};
  const starter=String(settings.code||"");
  const editor=makeEditor(starter,Math.max(9,Math.min(18,starter.split("\n").length+4)),refresh,"js-browser");
  editor.classList.add("ts-editor");
  const jsBox=h("pre",{class:"ts-compiled-code"});
  const diagnosticBox=h("section",{class:"ts-diagnostics","aria-live":"polite"});
  const runtimeBox=h("section",{class:"lab-console ts-runtime","aria-live":"polite"},h("p",{class:"console-title"},"Exécution JavaScript"),para("Compile puis exécute si la leçon le demande.","muted small"));
  const terminalBody=h("div",{class:"studio-terminal-body",role:"log","aria-live":"polite"});
  const terminalInput=h("input",{class:"studio-terminal-input",autocomplete:"off",spellcheck:"false","aria-label":"Commande TypeScript"});
  let last=tsAnalyze(starter),timer=null;

  function refresh(){ clearTimeout(timer); timer=setTimeout(analyze,120); }
  function analyze(){ last=tsAnalyze(editor.value); renderTsDiagnostics(diagnosticBox,last.diagnostics); jsBox.textContent=last.js||"// Aucun JavaScript généré"; return last; }
  async function runCompiled(){ const current=analyze(); if(!current.ok){ runtimeBox.replaceChildren(h("p",{class:"console-title"},"Exécution JavaScript"),h("p",{class:"feedback ko"},"Corrige d'abord les diagnostics TypeScript.")); return {error:"Diagnostics TypeScript présents",logs:[]}; }
    const result=await tsRunJavaScript(current.js); runtimeBox.replaceChildren(h("p",{class:"console-title"},"Exécution JavaScript")); renderConsole(runtimeBox,result); return result; }
  function addTerm(text,cls){ terminalBody.append(h("div",{class:"studio-terminal-line "+(cls||"")},text)); terminalBody.scrollTop=terminalBody.scrollHeight; }
  function terminal(command){ const cmd=command.trim(); if(!cmd)return; addTerm("$ "+cmd,"command");
    if(cmd==="clear"){terminalBody.replaceChildren();return;}
    if(cmd==="npm install -D typescript"){addTerm("+ typescript@5.8.3 (simulation pédagogique locale)","success");addTerm("Dans un vrai projet, la version doit être fixée dans package.json.","hint");return;}
    if(cmd==="npx tsc --init"){addTerm("Created a new tsconfig.json with strict defaults (simulation).","success");return;}
    if(cmd==="npx tsc"||cmd==="npx tsc --noEmit"){const a=analyze(); if(a.ok)addTerm("✓ Compilation réussie : 0 diagnostic.","success"); else a.diagnostics.forEach(d=>addTerm("main.ts("+d.line+","+d.column+"): error TS"+d.code+": "+d.message,"error"));return;}
    if(cmd==="npx tsc --version"||cmd==="npx tsc -v"){addTerm("Version 5.8.3 (compilateur embarqué dans ce parcours)","success");return;}
    addTerm("Commande contrôlée non reconnue. Essaie : npx tsc, npx tsc --noEmit, npx tsc --init, npx tsc -v.","hint"); }
  terminalInput.addEventListener("keydown",e=>{if(e.key==="Enter"){const v=terminalInput.value;terminalInput.value="";terminal(v);}});
  const terminalPanel=settings.terminal===false?null:h("section",{class:"studio-terminal ts-terminal"},h("div",{class:"studio-panel-title"},h("span",{},"TERMINAL TYPESCRIPT"),h("small",{},"commandes simulées · sûres")),terminalBody,h("label",{class:"studio-terminal-row"},h("span",{class:"studio-terminal-prompt"},"$"),terminalInput));
  const node=h("div",{class:"typescript-workbench"},
    h("div",{class:"ts-workspace"},h("section",{class:"ts-editor-panel"},h("div",{class:"studio-panel-title"},h("span",{},settings.filename||"main.ts"),h("small",{},"TypeScript")),editor),h("section",{class:"ts-compiled-panel"},h("div",{class:"studio-panel-title"},h("span",{},"JAVASCRIPT COMPILÉ"),h("small",{},"types supprimés")),jsBox)),
    h("div",{class:"toolbar"},h("button",{class:"btn primary",type:"button",onclick:analyze},"Analyser"),h("button",{class:"btn",type:"button",onclick:runCompiled},"Exécuter le JS"),h("button",{class:"btn ghost",type:"button",onclick:reset},"Réinitialiser")),
    h("div",{class:"ts-output-grid"},diagnosticBox,runtimeBox),terminalPanel,
    h("div",{class:"studio-note"},h("strong",{},"Compilateur réel"),para("Les diagnostics sont produits localement par TypeScript 5.8.3 embarqué. Le terminal reste une simulation pédagogique contrôlée : aucune commande système n'est exécutée.","muted small")));
  function reset(){editor.value=starter;runtimeBox.replaceChildren(h("p",{class:"console-title"},"Exécution JavaScript"),para("Code remis à zéro.","muted small"));analyze();}
  analyze();
  return {node,editor,analyze,runCompiled,reset,getCode:()=>editor.value,setCode:v=>{editor.value=v;analyze();},lock:()=>{editor.readOnly=true;terminalInput.disabled=true;},starter};
}

function renderTypeScriptStudio(presetId){ const preset=TYPESCRIPT_STUDIO_PRESETS[presetId]; if(!preset)return h("div",{class:"callout"},para("Atelier TypeScript introuvable.")); return renderTypeScriptWorkbench({code:preset.code,terminal:preset.terminal!==false,filename:preset.filename||"main.ts"}).node; }
