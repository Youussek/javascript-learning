// exam-mode.js — examens blancs stricts, séparés de la progression pédagogique.

const EXAM_CONFIG = {
  paths: [
    {id:'all',label:'Tous les parcours'},
    {id:'javascript',label:'JavaScript'}, {id:'react',label:'React'}, {id:'html',label:'HTML'},
    {id:'css',label:'CSS'}, {id:'typescript',label:'TypeScript'}, {id:'node',label:'Node.js'}, {id:'sql',label:'SQL'}
  ],
  sizes: [10, 20],
  timers: [0, 600, 1200, 1800],
  eligibleTypes: new Set(['qcm','vf','predict','fill'])
};

function examState(){
  if(!state.examMode || typeof state.examMode !== 'object') state.examMode={history:[],totalSessions:0,bestScore:0};
  if(!Array.isArray(state.examMode.history)) state.examMode.history=[];
  return state.examMode;
}

function examPathLabel(id){ return (EXAM_CONFIG.paths.find(x=>x.id===id)||{label:id}).label; }
function examShuffle(list){
  const arr=list.slice();
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function examAllEvaluationQuestions(obj){ return obj ? Object.values(obj).flat().filter(Boolean) : []; }
function examSourceForPath(path){
  if(path==='javascript') return typeof EXERCISES!=='undefined' ? EXERCISES : [];
  if(path==='react') return typeof REACT_EVALUATIONS!=='undefined' ? examAllEvaluationQuestions(REACT_EVALUATIONS) : [];
  if(path==='html') return typeof HTML_EVALUATIONS!=='undefined' ? examAllEvaluationQuestions(HTML_EVALUATIONS) : [];
  if(path==='css') return typeof CSS_EVALUATIONS!=='undefined' ? examAllEvaluationQuestions(CSS_EVALUATIONS) : [];
  if(path==='typescript') return typeof TYPESCRIPT_EVALUATIONS!=='undefined' ? examAllEvaluationQuestions(TYPESCRIPT_EVALUATIONS) : [];
  if(path==='node') return typeof NODE_EVALUATIONS!=='undefined' ? examAllEvaluationQuestions(NODE_EVALUATIONS) : [];
  if(path==='sql') return typeof SQL_EVALUATIONS!=='undefined' ? examAllEvaluationQuestions(SQL_EVALUATIONS) : [];
  return [];
}
function examEligibleBank(path, difficulty){
  const ids=path==='all'?EXAM_CONFIG.paths.filter(x=>x.id!=='all').map(x=>x.id):[path];
  const merged=[];
  ids.forEach(id=>examSourceForPath(id).forEach(q=>{
    if(!EXAM_CONFIG.eligibleTypes.has(q.type)) return;
    if(difficulty && difficulty!=='all' && Number(q.difficulty)!==Number(difficulty)) return;
    merged.push(Object.assign({},q,{examPath:id}));
  }));
  return merged;
}
function examBuildQuestions(path,size,difficulty){
  if(path!=='all'){
    let bank=examEligibleBank(path,difficulty);
    if(bank.length<size && difficulty!=='all') bank=examEligibleBank(path,'all');
    return examShuffle(bank).slice(0,Math.min(size,bank.length));
  }
  const pathIds=EXAM_CONFIG.paths.filter(x=>x.id!=='all').map(x=>x.id);
  const buckets=pathIds.map(id=>({id,items:examShuffle(examEligibleBank(id,difficulty))}));
  if(buckets.some(b=>!b.items.length) && difficulty!=='all') return examBuildQuestions(path,size,'all');
  const picked=[]; let cursor=0;
  while(picked.length<size && buckets.some(b=>b.items.length)){
    const bucket=buckets[cursor%buckets.length];
    if(bucket.items.length) picked.push(bucket.items.pop());
    cursor++;
  }
  return examShuffle(picked);
}
function examNormalize(value){
  return String(value==null?'':value).trim().replace(/\r\n/g,'\n').replace(/[ \t]+/g,' ').replace(/\s*\n\s*/g,'\n');
}
function examEvaluate(question,answer){
  if(question.type==='qcm') return Number(answer)===Number(question.answer);
  if(question.type==='vf') return String(answer)===String(question.answer);
  if(question.type==='predict'){
    const given=examNormalize(answer); if(!given) return false;
    return (question.answers||[]).map(examNormalize).some(x=>x===given || x===given.replace(/["']/g,''));
  }
  if(question.type==='fill'){
    const values=Array.isArray(answer)?answer:[];
    if(values.length!==(question.answers||[]).length) return false;
    return values.every((value,index)=>[].concat(question.answers[index]).map(String).includes(String(value).trim()));
  }
  return false;
}
function examCorrectAnswer(question){
  if(question.type==='qcm') return (question.options||[])[question.answer] || '';
  if(question.type==='vf') return question.answer?'Vrai':'Faux';
  if(question.type==='predict') return (question.answers||[])[0] || '';
  if(question.type==='fill'){
    let index=0;
    return String(question.template||'').replace(/___/g,()=>String([].concat(question.answers[index++]||'')[0]||''));
  }
  return '';
}
function examFormat(seconds){
  const s=Math.max(0,Math.ceil(seconds||0)); return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}
function examStats(){
  const s=examState(), rows=s.history||[];
  const avg=rows.length?Math.round(rows.reduce((n,r)=>n+(r.score||0),0)/rows.length):0;
  return {sessions:rows.length,best:s.bestScore||0,average:avg,last:rows[0]||null};
}

function renderExamMode(){
  const host=h('div',{}); let session=null; let timerId=null;
  function stopTimer(){ if(timerId){clearInterval(timerId);timerId=null;} }
  function leaveStrict(){ document.body.classList.remove('exam-session-active'); }
  function enterStrict(){ document.body.classList.add('exam-session-active'); }
  function persistResult(result){
    const s=examState(); s.history.unshift(result); s.history=s.history.slice(0,30); s.totalSessions=(s.totalSessions||0)+1; s.bestScore=Math.max(s.bestScore||0,result.score); saveState(state);
  }
  function setup(){
    stopTimer(); leaveStrict(); session=null;
    const path=h('select',{},EXAM_CONFIG.paths.map(x=>h('option',{value:x.id},x.label)));
    const size=h('select',{},EXAM_CONFIG.sizes.map(n=>h('option',{value:String(n)},n+' questions')));
    const timer=h('select',{},h('option',{value:'0'},'Sans chrono'),h('option',{value:'600'},'10 minutes'),h('option',{value:'1200',selected:true},'20 minutes'),h('option',{value:'1800'},'30 minutes'));
    const difficulty=h('select',{},h('option',{value:'all'},'Toutes difficultés'),h('option',{value:'1'},'Facile'),h('option',{value:'2'},'Normal'),h('option',{value:'3'},'Difficile'));
    const msg=h('div',{class:'feedback','aria-live':'polite'});
    const start=h('button',{class:'btn primary big',type:'button',onclick:()=>{
      const questions=examBuildQuestions(path.value,Number(size.value),difficulty.value);
      if(questions.length<Math.min(5,Number(size.value))){msg.replaceChildren(h('p',{class:'error'},"Pas assez de questions disponibles avec ces filtres."));return;}
      session={path:path.value,size:questions.length,timer:Number(timer.value),difficulty:difficulty.value,questions,index:0,answers:new Array(questions.length),startedAt:Date.now(),deadline:Number(timer.value)?Date.now()+Number(timer.value)*1000:null,expired:false,submitted:false};
      enterStrict(); if(session.timer) startTimer(); drawQuestion();
    }},'Commencer l’examen');
    const stats=examStats();
    host.replaceChildren(h('div',{class:'page exam-page'},
      h('p',{class:'crumbs'},link('/dashboard','Dashboard'),' / Examen'),
      pageTitle('Mode examen','Teste tes connaissances sans aide, puis reçois la correction complète uniquement après avoir rendu ta copie.'),
      h('section',{class:'exam-hero block'},h('span',{class:'eyebrow'},'CONDITIONS D’EXAMEN'),h('div',{class:'exam-rules-grid'},
        h('article',{},h('strong',{},'Aucune aide'),para('Indices, glossaire, aide contextuelle et explications sont absents pendant l’épreuve.','muted small')),
        h('article',{},h('strong',{},'Une seule copie'),para('Tu peux revenir sur tes réponses avant de rendre, mais aucune correction intermédiaire.','muted small')),
        h('article',{},h('strong',{},'Progression séparée'),para('La note n’ajoute ni ne retire XP, maîtrise ou progression pédagogique.','muted small')))),
      h('section',{class:'block exam-setup'},h('h2',{},'Préparer une session'),h('div',{class:'exam-config-grid'},
        h('label',{},h('span',{},'Parcours'),path),h('label',{},h('span',{},'Longueur'),size),h('label',{},h('span',{},'Chrono'),timer),h('label',{},h('span',{},'Difficulté'),difficulty)),h('div',{class:'toolbar'},start),msg),
      h('section',{class:'dashboard-grid exam-stats'},
        h('article',{class:'stats-card'},h('span',{class:'eyebrow'},'SESSIONS'),h('h2',{},stats.sessions),para('examens rendus','muted')),
        h('article',{class:'stats-card'},h('span',{class:'eyebrow'},'MEILLEURE NOTE'),h('h2',{},stats.best+' %'),para('record personnel','muted')),
        h('article',{class:'stats-card'},h('span',{class:'eyebrow'},'MOYENNE'),h('h2',{},stats.average+' %'),para('sur les examens rendus','muted'))),
      renderExamHistory()));
  }
  function startTimer(){
    stopTimer(); timerId=setInterval(()=>{
      if(!session){stopTimer();return;}
      const left=Math.max(0,(session.deadline-Date.now())/1000); const clock=document.querySelector('[data-exam-clock]'); if(clock) clock.textContent=examFormat(left);
      if(left<=0){session.expired=true;submitExam();}
    },250);
  }
  function answerControl(q,stored,onChange){
    if(q.type==='qcm') return h('div',{class:'exam-options'},(q.options||[]).map((opt,i)=>h('label',{class:'exam-option'},h('input',{type:'radio',name:'exam-answer',value:String(i),checked:String(stored)===String(i),onchange:()=>onChange(i)}),h('span',{},opt))));
    if(q.type==='vf') return h('div',{class:'exam-options'},[true,false].map(v=>h('label',{class:'exam-option'},h('input',{type:'radio',name:'exam-answer',value:String(v),checked:String(stored)===String(v),onchange:()=>onChange(v)}),h('span',{},v?'Vrai':'Faux'))));
    if(q.type==='predict') return h('textarea',{class:'answer exam-text-answer',rows:q.rows||3,spellcheck:'false',value:stored||'',oninput:e=>onChange(e.target.value),placeholder:'Ta réponse…'});
    if(q.type==='fill'){
      const saved=Array.isArray(stored)?stored:[]; const parts=String(q.template||'').split('___'); const wrap=h('pre',{class:'code fill exam-fill','data-code-help-ignore':'1','data-line-explain-ignore':'1'}); const values=saved.slice();
      parts.forEach((part,i)=>{wrap.append(part); if(i<parts.length-1){const input=h('input',{class:'blank',type:'text',value:saved[i]||'',autocomplete:'off',spellcheck:'false',oninput:e=>{values[i]=e.target.value;onChange(values.slice());}});wrap.append(input);}}); return wrap;
    }
    return h('p',{class:'muted'},'Type de question non disponible dans ce mode.');
  }
  function drawQuestion(){
    const q=session.questions[session.index];
    if(!q){ submitExam(); return; }
    const stored=session.answers[session.index];
    const control=answerControl(q,stored,value=>{ session.answers[session.index]=value; });
    const navButtons=session.questions.map((_,i)=>h('button',{
      type:'button',
      class:'exam-index-btn'+(i===session.index?' active':'')+(session.answers[i]!==undefined&&session.answers[i]!==''?' answered':''),
      onclick:()=>{ session.index=i; drawQuestion(); },
      'aria-label':'Question '+(i+1)
    },String(i+1)));
    const footer=h('footer',{class:'exam-session-footer'},
      h('button',{class:'btn',type:'button',disabled:session.index===0,onclick:()=>{session.index--;drawQuestion();}},'← Précédente'),
      h('div',{class:'exam-session-actions'},
        session.index<session.questions.length-1
          ? h('button',{class:'btn primary',type:'button',onclick:()=>{session.index++;drawQuestion();}},'Suivante →')
          : h('button',{class:'btn primary',type:'button',onclick:()=>submitExam()},'Rendre la copie')
      )
    );
    host.replaceChildren(h('div',{
      class:'page exam-page exam-session',
      'data-code-help-ignore':'1',
      'data-line-explain-ignore':'1'
    },
      h('header',{class:'exam-session-header'},
        h('div',{},h('span',{class:'eyebrow'},'MODE EXAMEN · '+examPathLabel(q.examPath)),h('h1',{},'Question '+(session.index+1)+' / '+session.questions.length)),
        session.timer
          ? h('div',{class:'exam-clock','data-exam-clock':''},examFormat((session.deadline-Date.now())/1000))
          : h('div',{class:'exam-clock exam-clock--free'},'Sans chrono')
      ),
      h('div',{class:'exam-progress'},navButtons),
      h('section',{class:'block exam-question'},
        h('div',{class:'exam-question-meta'},h('span',{class:'badge d'+(q.difficulty||1)},'Difficulté '+(q.difficulty||1)),h('span',{class:'muted small'},q.notion||'Question de cours')),
        h('h2',{},q.question||q.statement||'Question'),
        q.code ? h('pre',{class:'code exam-code','data-code-help-ignore':'1','data-line-explain-ignore':'1'},h('code',{},q.code)) : null,
        control
      ),
      footer
    ));
  }
  function submitExam(){
    if(!session||session.submitted)return; session.submitted=true; stopTimer(); leaveStrict();
    const rows=session.questions.map((q,i)=>({question:q,answer:session.answers[i],correct:examEvaluate(q,session.answers[i])}));
    const correct=rows.filter(r=>r.correct).length; const score=Math.round(correct/rows.length*100);
    const byPath={}; const byNotion={};
    rows.forEach(r=>{const p=r.question.examPath; byPath[p]||(byPath[p]={correct:0,total:0});byPath[p].total++;if(r.correct)byPath[p].correct++; const n=r.question.notion||'Autre';byNotion[n]||(byNotion[n]={correct:0,total:0});byNotion[n].total++;if(r.correct)byNotion[n].correct++;});
    const result={id:'exam-'+Date.now(),at:new Date().toISOString(),path:session.path,size:rows.length,timer:session.timer,difficulty:session.difficulty,score,correct,total:rows.length,expired:session.expired,byPath,byNotion}; persistResult(result);
    const pathCards=Object.entries(byPath).map(([id,v])=>h('article',{class:'exam-breakdown-card'},h('strong',{},examPathLabel(id)),h('span',{},Math.round(v.correct/v.total*100)+' %'),para(v.correct+' / '+v.total,'muted small')));
    const weak=Object.entries(byNotion).map(([name,v])=>({name,score:Math.round(v.correct/v.total*100),total:v.total})).sort((a,b)=>a.score-b.score||b.total-a.total).slice(0,5);
    host.replaceChildren(h('div',{class:'page exam-page exam-result-page'},
      h('p',{class:'crumbs'},link('/examen','Examen'),' / Résultat'),
      h('section',{class:'exam-result-hero'},h('div',{},h('span',{class:'eyebrow'},session.expired?'TEMPS ÉCOULÉ · COPIE RENDUE':'COPIE RENDUE'),h('h1',{},score>=80?'Examen réussi':score>=60?'Bases correctes, encore à consolider':'Des notions sont à reprendre'),para('La note est informative et reste séparée de ta progression pédagogique.','lead')),h('div',{class:'exam-score-ring'},h('strong',{},score+' %'),h('span',{},correct+' / '+rows.length+' bonnes réponses'))),
      h('section',{class:'block'},h('h2',{},'Résultat par parcours'),h('div',{class:'exam-breakdown-grid'},pathCards)),
      weak.length?h('section',{class:'block'},h('h2',{},'Notions à revoir en priorité'),h('ul',{class:'rows compact'},weak.map(x=>h('li',{class:'row'},h('div',{class:'row-main'},h('strong',{},x.name),para(x.total+' question'+(x.total>1?'s':'')+' dans cette session','muted small')),h('span',{class:'status '+(x.score>=80?'ok':x.score>=50?'review':'todo')},x.score+' %'))))):null,
      h('section',{class:'block exam-corrections'},h('div',{class:'section-heading'},h('div',{},h('span',{class:'eyebrow'},'CORRECTION'),h('h2',{},'Revoir toute la copie'))),h('div',{class:'exam-correction-list'},rows.map((r,i)=>h('details',{class:'exam-correction '+(r.correct?'is-correct':'is-wrong'),open:!r.correct},h('summary',{},h('span',{},(r.correct?'✓ ':'✕ ')+'Question '+(i+1)+' · '+(r.question.notion||examPathLabel(r.question.examPath))),h('strong',{},r.correct?'Correct':'À revoir')),h('div',{class:'exam-correction-body'},h('p',{},r.question.question||r.question.statement||''),r.question.code?h('pre',{class:'code','data-code-help-ignore':'1','data-line-explain-ignore':'1'},h('code',{},r.question.code)):null,h('p',{},h('strong',{},'Bonne réponse : '),examCorrectAnswer(r.question)),r.question.explanation?para(r.question.explanation,'muted'):null,r.question.retain?h('div',{class:'callout'},h('strong',{},'À retenir'),para(r.question.retain,'muted')):null))))),
      h('div',{class:'toolbar'},h('button',{class:'btn primary',type:'button',onclick:setup},'Nouvel examen'),link('/adaptatif','Travailler mes priorités →','btn'),link('/dashboard','Dashboard','btn'))));
  }
  setup(); return host;
}

function renderExamHistory(){
  const rows=examState().history.slice(0,6);
  return h('section',{class:'block exam-history'},h('div',{class:'section-heading'},h('div',{},h('span',{class:'eyebrow'},'HISTORIQUE'),h('h2',{},'Tes dernières copies'))),rows.length?h('ul',{class:'rows compact'},rows.map(r=>h('li',{class:'row'},h('div',{class:'row-main'},h('strong',{},examPathLabel(r.path)),para(new Date(r.at).toLocaleDateString('fr-FR')+' · '+r.total+' questions'+(r.timer?' · '+Math.round(r.timer/60)+' min':' · sans chrono'),'muted small')),h('span',{class:'status '+(r.score>=80?'ok':r.score>=60?'review':'todo')},r.score+' %')))):empty('Aucun examen rendu pour le moment.'));
}

window.addEventListener('hashchange',()=>{
  const path=location.hash.replace(/^#/,'')||'/';
  if(path!=='/examen') document.body.classList.remove('exam-session-active');
});
