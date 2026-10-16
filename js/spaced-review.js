// spaced-review.js — file de révision espacée commune à tous les parcours.
// Elle réutilise les résultats déjà stockés dans chaque exercice : aucune progression parallèle.

const SPACED_REVIEW_PATHS = [
  { id:"html", title:"HTML", mark:"HTML", exercises:()=>HTML_EXERCISES, href:(id)=>"/html/exercice/"+id },
  { id:"css", title:"CSS", mark:"CSS", exercises:()=>CSS_EXERCISES, href:(id)=>"/css/exercice/"+id },
  { id:"javascript", title:"JavaScript", mark:"JS", exercises:()=>EXERCISES, href:(id)=>"/exercice/"+id },
  { id:"react", title:"React", mark:"⚛", exercises:()=>REACT_EXERCISES, href:(id)=>"/react/exercice/"+id },
  { id:"typescript", title:"TypeScript", mark:"TS", exercises:()=>TYPESCRIPT_EXERCISES, href:(id)=>"/typescript/exercice/"+id },
  { id:"node", title:"Node.js", mark:"N", exercises:()=>NODE_EXERCISES, href:(id)=>"/node/exercice/"+id },
  { id:"sql", title:"SQL", mark:"SQL", exercises:()=>SQL_EXERCISES, href:(id)=>"/sql/exercice/"+id },
];

function spacedReviewCatalog() {
  return SPACED_REVIEW_PATHS.flatMap((path) => {
    let exercises = [];
    try { exercises = path.exercises() || []; } catch (_) { exercises = []; }
    return exercises.map((exercise) => ({ path, exercise, record:getRecord(exercise.id) }));
  });
}

function spacedReviewPriority(item, now) {
  const record=item.record;
  if(record.review) return 10000 + (record.fails||0)*100;
  if(record.reviewDueAt && record.reviewDueAt<=now) {
    const overdueDays=Math.floor((now-record.reviewDueAt)/(24*60*60*1000));
    return 5000 + Math.min(999,overdueDays*10) + (record.fails||0);
  }
  // Compatibilité avec les progressions créées avant la révision espacée :
  // quelques exercices déjà réussis peuvent amorcer le nouveau système.
  if(record.success && !record.reviewDueAt) return 1000 + (record.fails||0)*10;
  return 0;
}

function spacedReviewDueItems(now) {
  const timestamp=now||Date.now();
  const all=spacedReviewCatalog();
  const normal=all.filter(item=>item.record.review || (item.record.reviewDueAt && item.record.reviewDueAt<=timestamp));
  const legacy=all.filter(item=>item.record.success && !item.record.reviewDueAt && !item.record.review)
    .sort((a,b)=>(b.record.fails||0)-(a.record.fails||0))
    .slice(0,5);
  return [...normal,...legacy]
    .filter((item,index,list)=>list.findIndex(x=>x.exercise.id===item.exercise.id)===index)
    .sort((a,b)=>spacedReviewPriority(b,timestamp)-spacedReviewPriority(a,timestamp));
}

function spacedReviewQueue(limit, now) {
  const max=Math.max(1,limit||6), items=spacedReviewDueItems(now);
  const groups=new Map();
  items.forEach(item=>{if(!groups.has(item.path.id))groups.set(item.path.id,[]);groups.get(item.path.id).push(item);});
  const result=[];
  while(result.length<max && [...groups.values()].some(list=>list.length)) {
    for(const path of SPACED_REVIEW_PATHS) {
      const list=groups.get(path.id);
      if(list&&list.length&&result.length<max) result.push(list.shift());
    }
  }
  return result;
}

function spacedReviewUpcoming(days, now) {
  const timestamp=now||Date.now(), end=timestamp+(days||7)*24*60*60*1000;
  return spacedReviewCatalog().filter(item=>item.record.reviewDueAt>timestamp && item.record.reviewDueAt<=end)
    .sort((a,b)=>a.record.reviewDueAt-b.record.reviewDueAt);
}

function spacedReviewReason(item, now) {
  const record=item.record, timestamp=now||Date.now();
  if(record.review) return record.correctionSeen ? "Correction consultée · à consolider" : "Erreur récente · priorité élevée";
  if(record.reviewDueAt && record.reviewDueAt<=timestamp) {
    const days=Math.floor((timestamp-record.reviewDueAt)/(24*60*60*1000));
    return days>0 ? "Échéance dépassée de "+days+" jour"+(days>1?"s":"") : "Révision prévue aujourd’hui";
  }
  if(record.success && !record.reviewDueAt) return "Ancien acquis · première révision espacée";
  return "À consolider";
}

function spacedReviewIntervalLabel(record) {
  const days=Number(record.reviewIntervalDays)||0;
  if(days===0.25) return "6 h";
  if(days<1) return "Aujourd’hui";
  return days+" jour"+(days>1?"s":"");
}

function spacedReviewStats(now) {
  const timestamp=now||Date.now();
  const due=spacedReviewDueItems(timestamp);
  const upcoming=spacedReviewUpcoming(7,timestamp);
  const scheduled=spacedReviewCatalog().filter(item=>item.record.reviewDueAt).length;
  return { due, dueCount:due.length, upcoming, upcomingCount:upcoming.length, scheduled };
}
