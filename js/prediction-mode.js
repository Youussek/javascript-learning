// prediction-mode.js — prédire avant d'exécuter, puis comparer avec le résultat réel.
(function(){
  const MAX_HISTORY = 80;
  function ensureState(){
    if(typeof state==='undefined') return null;
    if(typeof state.predictionMode!=='boolean') state.predictionMode=false;
    if(!state.predictionStats || typeof state.predictionStats!=='object') state.predictionStats={total:0, exact:0, close:0, different:0, history:[]};
    if(!Array.isArray(state.predictionStats.history)) state.predictionStats.history=[];
    return state.predictionStats;
  }
  function enabled(){ ensureState(); return !!(typeof state!=='undefined' && state.predictionMode); }
  function setEnabled(value){
    ensureState(); state.predictionMode=!!value; if(typeof commit==='function')commit(); else if(typeof saveState==='function')saveState(state); syncButtons();
  }
  function syncButtons(){
    const on=enabled();
    [document.getElementById('prediction-mode-toggle'),document.getElementById('prediction-mode-toggle-mobile')].filter(Boolean).forEach(btn=>{
      btn.setAttribute('aria-pressed',on?'true':'false'); btn.classList.toggle('active',on);
      const label=btn.querySelector('.prediction-mode-label'); if(label)label.textContent=btn.id.includes('mobile')?(on?'Prédire ✓':'Prédire'):(on?'Mode prédiction : activé':'Mode prédiction');
    });
  }
  function closeOverlay(overlay){ if(overlay&&overlay.parentNode)overlay.remove(); }
  function dialogShell(title,subtitle){
    const overlay=h('div',{class:'prediction-overlay',role:'presentation'});
    const dialog=h('section',{class:'prediction-dialog',role:'dialog','aria-modal':'true','aria-labelledby':'prediction-title'},
      h('div',{class:'prediction-dialog-head'},h('div',{},h('span',{class:'eyebrow'},'PRÉDIRE AVANT D’EXÉCUTER'),h('h2',{id:'prediction-title'},title),subtitle?para(subtitle,'muted'):null),h('button',{class:'btn ghost small',type:'button','aria-label':'Fermer'},'×'))
    );
    overlay.append(dialog); dialog.querySelector('button').onclick=()=>closeOverlay(overlay);
    overlay.addEventListener('mousedown',e=>{if(e.target===overlay)closeOverlay(overlay);});
    document.body.append(overlay); return {overlay,dialog};
  }
  function ask(meta={}){
    if(!enabled()) return Promise.resolve(null);
    return new Promise(resolve=>{
      const labels={javascript:'JavaScript',html:'HTML',css:'CSS',react:'React',typescript:'TypeScript',node:'Node.js',sql:'SQL'};
      const kind=meta.kind||document.body.dataset.path||'code';
      const prompt=meta.prompt || (kind==='sql'?'Quelles colonnes et lignes penses-tu obtenir ?':kind==='html'||kind==='css'||kind==='react'?'À quoi va ressembler le résultat après exécution ?':kind==='node'?'Qu’est-ce que le terminal ou le serveur va produire ?':'Qu’est-ce que ce code va afficher ou retourner ?');
      const {overlay,dialog}=dialogShell('Que va-t-il se passer ?', (labels[kind]||kind)+' · réfléchis avant de lancer');
      const input=h('textarea',{class:'answer prediction-input',rows:5,placeholder:prompt,'aria-label':'Ta prédiction'});
      const skip=h('button',{class:'btn ghost',type:'button'},'Exécuter sans prédire');
      const submit=h('button',{class:'btn primary',type:'button'},'Valider ma prédiction et exécuter');
      dialog.append(h('div',{class:'prediction-question'},h('strong',{},prompt),para(meta.hint||'Pas besoin d’être parfaitement précis : formule ce que tu t’attends à observer.','muted small')),input,h('div',{class:'toolbar'},submit,skip));
      function finish(value){closeOverlay(overlay);resolve(value);}
      submit.onclick=()=>{const text=input.value.trim(); if(!text){input.focus();input.classList.add('prediction-empty');return;} finish({text,kind,context:meta.context||'',at:new Date().toISOString()});};
      skip.onclick=()=>finish({skipped:true,kind,context:meta.context||'',at:new Date().toISOString()});
      input.addEventListener('input',()=>input.classList.remove('prediction-empty'));
      input.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();submit.click();}});
      requestAnimationFrame(()=>input.focus());
    });
  }
  function stringifyActual(value){
    if(value==null)return 'Exécution terminée.';
    if(typeof value==='string')return value;
    try{return JSON.stringify(value,null,2);}catch(_){return String(value);}
  }
  function compare(prediction,actual,meta={}){
    if(!prediction || prediction.skipped)return;
    const actualText=stringifyActual(actual);
    const {overlay,dialog}=dialogShell('Compare avec le résultat réel',meta.summary||'Le but est de vérifier ton modèle mental, pas seulement d’avoir “juste”.');
    const choices=[['exact','Exact','J’avais correctement prévu le résultat.'],['close','Presque','L’idée était bonne, mais un détail m’a échappé.'],['different','Différent','Le résultat ne correspondait pas à mon raisonnement.']];
    dialog.append(h('div',{class:'prediction-compare'},
      h('article',{class:'prediction-pane'},h('span',{class:'eyebrow'},'TA PRÉDICTION'),h('pre',{},prediction.text)),
      h('article',{class:'prediction-pane'},h('span',{class:'eyebrow'},'RÉSULTAT OBSERVÉ'),h('pre',{},actualText))
    ),h('div',{class:'prediction-self-grade'},h('strong',{},'Ton verdict'),h('div',{class:'prediction-choice-grid'},choices.map(([key,label,desc])=>h('button',{class:'prediction-choice',type:'button','data-grade':key},h('strong',{},label),h('span',{},desc))))));
    dialog.querySelectorAll('[data-grade]').forEach(btn=>btn.onclick=()=>{
      const stats=ensureState(); const grade=btn.dataset.grade; stats.total=(stats.total||0)+1; stats[grade]=(stats[grade]||0)+1;
      stats.history.unshift({kind:prediction.kind,context:prediction.context,prediction:prediction.text,actual:actualText,grade,at:new Date().toISOString()}); stats.history=stats.history.slice(0,MAX_HISTORY);
      if(typeof commit==='function')commit(); closeOverlay(overlay);
    });
  }
  async function run(meta,executor,formatter){
    const prediction=await ask(meta);
    const result=await executor();
    if(prediction && !prediction.skipped){
      let actual;
      try{actual=formatter?formatter(result):result;}catch(_){actual=result;}
      compare(prediction,actual,meta);
    }
    return result;
  }
  function init(){
    ensureState();
    ['prediction-mode-toggle','prediction-mode-toggle-mobile'].forEach(id=>{const btn=document.getElementById(id);if(btn&&!btn.dataset.predictionBound){btn.dataset.predictionBound='1';btn.onclick=()=>setEnabled(!enabled());}});
    syncButtons();
    document.addEventListener('keydown',e=>{if(e.altKey&&e.shiftKey&&e.key.toLowerCase()==='p'){e.preventDefault();setEnabled(!enabled());}});
  }
  window.PredictionMode={enabled,setEnabled,ask,compare,run,syncButtons};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
