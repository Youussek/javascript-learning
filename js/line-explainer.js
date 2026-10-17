// line-explainer.js — explication pédagogique ligne par ligne pour tous les parcours.
// Réutilise CODE_HELP afin de garder les définitions cohérentes avec le glossaire et les info-bulles.

(function(){
  const MAX_LINES = 100;

  function langLabel(lang){
    return ({html:'HTML',css:'CSS',javascript:'JavaScript',react:'React',typescript:'TypeScript',node:'Node.js',sql:'SQL'})[lang] || 'Code';
  }

  function detectLanguage(el){
    if (typeof inferCodeHelpLanguage === 'function') {
      const inferred = inferCodeHelpLanguage(el);
      if (inferred) return inferred;
    }
    const path = location.hash.replace(/^#/, '') || '/';
    if (path.startsWith('/html')) return 'html';
    if (path.startsWith('/css')) return 'css';
    if (path.startsWith('/react')) return 'react';
    if (path.startsWith('/typescript')) return 'typescript';
    if (path.startsWith('/node')) return 'node';
    if (path.startsWith('/sql')) return 'sql';
    return 'javascript';
  }

  function normalizeCode(source){
    return String(source || '').replace(/\r\n?/g, '\n');
  }

  function tokensForLine(line, language){
    const found = [];
    if (typeof CODE_HELP_TOKEN_RE === 'undefined' || typeof resolveCodeHelpToken !== 'function') return found;
    CODE_HELP_TOKEN_RE.lastIndex = 0;
    let match;
    while ((match = CODE_HELP_TOKEN_RE.exec(line))) {
      const resolved = resolveCodeHelpToken(match[0], language);
      if (!resolved || found.some(item => item.key === resolved.key)) continue;
      found.push({key:resolved.key, token:match[0], entry:resolved.entry});
      if (found.length >= 4) break;
    }
    return found;
  }

  function trimText(text, max=210){
    const s = String(text || '').replace(/\s+/g,' ').trim();
    return s.length > max ? s.slice(0,max-1) + '…' : s;
  }

  function structuralExplanation(line, language){
    const t = line.trim();
    if (!t) return {what:'Ligne vide : elle sépare visuellement des blocs de logique.', why:'Elle améliore la lisibilité sans modifier le comportement.', change:'La supprimer ne change généralement pas le résultat.'};
    if (/^(\/\/|\/\*|\*|<!--|#\s)/.test(t)) return {what:'Commentaire destiné au développeur : il documente le code sans être exécuté comme une instruction normale.', why:'Il aide à comprendre l’intention ou le contexte.', change:'Modifier le texte du commentaire ne change normalement pas le comportement du programme.'};

    if (language === 'html') {
      if (/^<\/[^>]+>/.test(t)) return {what:'Ferme l’élément HTML ouvert précédemment.', why:'La fermeture délimite correctement la structure du document.', change:'La retirer peut imbriquer les éléments au mauvais endroit et casser la structure.'};
      if (/^<!doctype/i.test(t)) return {what:'Déclare le document comme HTML moderne.', why:'Le navigateur utilise ainsi son mode de rendu standard.', change:'L’omettre peut provoquer un mode de compatibilité inattendu.'};
      if (/^<[^!/][^>]*>/.test(t)) return {what:'Crée ou ouvre un élément HTML dans la structure de la page.', why:'Les balises donnent une structure et souvent une signification au contenu.', change:'Changer la balise peut modifier la sémantique, l’accessibilité ou le style appliqué.'};
    }

    if (language === 'css') {
      if (/^[^{}]+\{$/.test(t)) return {what:'Commence une règle CSS et indique quels éléments seront ciblés.', why:'Le sélecteur détermine où les déclarations suivantes s’appliquent.', change:'Modifier le sélecteur change les éléments affectés par les styles.'};
      if (/^[\w-]+\s*:\s*[^;]+;?$/.test(t)) {
        const prop = t.split(':')[0].trim();
        return {what:`Définit la propriété CSS « ${prop} » et sa valeur pour les éléments ciblés.`, why:'Cette déclaration contrôle une partie précise de l’apparence ou du layout.', change:'Modifier la valeur change directement le rendu visuel correspondant.'};
      }
      if (t === '}') return {what:'Ferme la règle CSS en cours.', why:'Elle marque la fin du groupe de déclarations.', change:'La retirer peut faire interpréter les règles suivantes au mauvais endroit.'};
    }

    if (language === 'sql') {
      const upper = t.toUpperCase();
      if (/^SELECT\b/.test(upper)) return {what:'Définit les colonnes ou expressions qui devront apparaître dans le résultat.', why:'SELECT décrit ce que la requête veut lire.', change:'Changer la sélection modifie les colonnes retournées, pas nécessairement les lignes.'};
      if (/^FROM\b/.test(upper)) return {what:'Indique la table ou la source principale lue par la requête.', why:'La requête doit savoir d’où proviennent les données.', change:'Changer la source peut complètement modifier le jeu de données interrogé.'};
      if (/^(WHERE|HAVING)\b/.test(upper)) return {what:'Filtre les données selon une condition.', why: upper.startsWith('HAVING') ? 'HAVING filtre les groupes après agrégation.' : 'WHERE filtre les lignes avant le regroupement.', change:'Modifier la condition change les lignes ou groupes conservés.'};
      if (/^(JOIN|INNER JOIN|LEFT JOIN)\b/.test(upper)) return {what:'Relie une autre table à la requête.', why:'Une jointure permet de combiner des données stockées séparément.', change:'Modifier la jointure ou sa condition peut ajouter, retirer ou dupliquer des lignes.'};
      if (/^ON\b/.test(upper)) return {what:'Définit la condition utilisée pour associer les lignes des tables jointes.', why:'Elle précise quelles clés représentent la même relation.', change:'Une mauvaise condition peut produire des associations incorrectes ou beaucoup trop de lignes.'};
      if (/^GROUP BY\b/.test(upper)) return {what:'Regroupe les lignes ayant une valeur commune.', why:'Cela permet de calculer des agrégats comme COUNT ou SUM par groupe.', change:'Changer les colonnes de regroupement change le niveau de détail du résultat.'};
      if (/^ORDER BY\b/.test(upper)) return {what:'Trie les lignes du résultat.', why:'L’ordre n’est pas garanti sans clause de tri explicite.', change:'Changer ASC/DESC ou la colonne change uniquement l’ordre du résultat.'};
      if (/^(INSERT|UPDATE|DELETE|CREATE|ALTER|BEGIN|COMMIT|ROLLBACK)\b/.test(upper)) return {what:'Cette ligne participe à une opération d’écriture ou de structure de la base.', why:'Elle modifie les données, le schéma ou l’état transactionnel.', change:'Une modification peut avoir un effet persistant : vérifie particulièrement les conditions et contraintes.'};
    }

    if (['javascript','react','typescript','node'].includes(language)) {
      if (/^(const|let|var)\s+/.test(t)) return {what:'Déclare une variable et lui associe une valeur ou une expression.', why:'La variable permet de réutiliser cette donnée plus loin dans le programme.', change:'Changer la valeur initiale peut modifier toutes les opérations qui dépendent ensuite de cette variable.'};
      if (/^(async\s+)?function\b/.test(t) || /=>\s*\{?$/.test(t)) return {what:'Déclare une fonction : un bloc de logique réutilisable qui pourra être appelé plus tard.', why:'Une fonction regroupe une responsabilité et peut recevoir des paramètres.', change:'Modifier ses paramètres ou son retour affecte les appels qui dépendent de son contrat.'};
      if (/^return\b/.test(t)) return {what:'Renvoie une valeur et termine l’exécution de la fonction courante.', why:'Le résultat peut ensuite être utilisé par le code qui a appelé la fonction.', change:'Changer la valeur retournée change ce que reçoit l’appelant.'};
      if (/^if\s*\(/.test(t) || /^else\b/.test(t)) return {what:'Contrôle quelle branche du programme doit s’exécuter selon une condition.', why:'Les conditions permettent au programme de prendre des décisions.', change:'Modifier la condition change les cas où cette branche est exécutée.'};
      if (/^(for|while)\b/.test(t)) return {what:'Démarre une boucle qui répète des instructions.', why:'Une boucle automatise un traitement répétitif.', change:'Changer sa condition ou son compteur peut modifier le nombre d’itérations, voire créer une boucle infinie.'};
      if (/^import\b/.test(t)) return {what:'Importe une fonctionnalité provenant d’un autre module.', why:'Cela permet de répartir le code dans plusieurs fichiers ou d’utiliser une bibliothèque.', change:'Changer le module ou le nom importé peut rendre les références suivantes indisponibles.'};
      if (/^export\b/.test(t)) return {what:'Expose une valeur afin qu’un autre module puisse l’importer.', why:'C’est le contrat public de ce module.', change:'Retirer l’export peut casser les fichiers qui utilisent cette valeur.'};
      if (/^await\b/.test(t) || /\bawait\b/.test(t)) return {what:'Attend la résolution d’une opération asynchrone avant de continuer cette portion de code.', why:'Cela permet d’utiliser le résultat d’une Promise avec une syntaxe séquentielle.', change:'Retirer await peut laisser une Promise à la place de la valeur attendue.'};
      if (language === 'react' && /^return\s*\(?\s*</.test(t)) return {what:'Commence le JSX renvoyé par le composant React.', why:'Ce JSX décrit l’interface que React doit afficher.', change:'Modifier cette structure change directement le rendu du composant.'};
      if (language === 'typescript' && /^(type|interface)\b/.test(t)) return {what:'Déclare une forme ou un contrat de type TypeScript.', why:'Le compilateur peut ensuite vérifier que les valeurs respectent cette structure.', change:'Modifier ce contrat peut révéler ou provoquer de nouvelles erreurs de typage ailleurs.'};
      if (/^console\./.test(t)) return {what:'Produit une sortie de diagnostic dans la console.', why:'C’est utile pour observer une valeur pendant l’exécution.', change:'Changer l’expression affichée change uniquement l’information observée, sauf si l’expression elle-même a des effets de bord.'};
      if (t === '}' || t === ');' || t === '};') return {what:'Ferme le bloc, l’appel ou la structure commencée plus haut.', why:'Cette ponctuation indique au parseur où se termine la structure.', change:'La retirer provoque souvent une erreur de syntaxe.'};
    }

    return null;
  }

  function explanationForLine(line, language){
    const structural = structuralExplanation(line, language);
    const tokens = tokensForLine(line, language);
    if (structural) {
      if (tokens.length && !/Ligne vide|Commentaire/.test(structural.what)) {
        const extra = tokens.slice(0,2).map(x => `${x.entry.title} : ${trimText(x.entry.description,95)}`).join(' ');
        structural.notions = extra;
      }
      return structural;
    }
    if (tokens.length) {
      const primary = tokens[0].entry;
      return {
        what:`Cette ligne utilise ${tokens.slice(0,3).map(x=>x.entry.title).join(', ')}. ${trimText(primary.description,150)}`,
        why:'Elle combine ces notions pour réaliser une étape du traitement courant.',
        change: primary.example ? `Pour comprendre son effet, compare avec l’exemple : ${primary.example}` : 'Modifie une seule partie à la fois puis observe précisément ce qui change.',
        notions:tokens.slice(1,3).map(x=>`${x.entry.title} : ${trimText(x.entry.description,90)}`).join(' ')
      };
    }
    return {
      what:'Cette ligne fait partie de la structure ou des données utilisées par ce bloc de code.',
      why:'Son rôle exact dépend du contexte créé par les lignes voisines.',
      change:'Pour l’étudier, change un seul élément de cette ligne puis compare le résultat avant/après.'
    };
  }

  function makeRow(line, index, language){
    const info = explanationForLine(line, language);
    const details = document.createElement('details');
    details.className = 'line-explain-row';
    if (index < 4) details.open = true;
    const summary = document.createElement('summary');
    summary.className = 'line-explain-summary';
    const no = document.createElement('span');
    no.className = 'line-explain-number';
    no.textContent = String(index + 1);
    const code = document.createElement('code');
    code.className = 'line-explain-code';
    code.dataset.codeHelpIgnore = '1';
    code.textContent = line || ' ';
    summary.append(no, code);
    const body = document.createElement('div');
    body.className = 'line-explain-body';
    const p1 = document.createElement('p'); p1.innerHTML = `<strong>Ce que fait la ligne :</strong> ${escapeHtml(info.what)}`;
    const p2 = document.createElement('p'); p2.innerHTML = `<strong>Pourquoi elle est là :</strong> ${escapeHtml(info.why)}`;
    const p3 = document.createElement('p'); p3.innerHTML = `<strong>Si tu la modifies :</strong> ${escapeHtml(info.change)}`;
    body.append(p1,p2,p3);
    if (info.notions) {
      const p4 = document.createElement('p');
      p4.className = 'line-explain-notions';
      p4.innerHTML = `<strong>Notions utilisées :</strong> ${escapeHtml(info.notions)}`;
      body.append(p4);
    }
    details.append(summary, body);
    return details;
  }

  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function readSource(target){
    if (!target) return '';
    if (target.matches('textarea')) return target.value;
    return target.textContent || '';
  }

  function closeExisting(except){
    document.querySelectorAll('.line-explain-panel').forEach(panel => { if (panel !== except) panel.remove(); });
  }

  function openPanel(target){
    const existingId = target.dataset.lineExplainPanel;
    if (existingId) {
      const old = document.getElementById(existingId);
      if (old) { old.remove(); delete target.dataset.lineExplainPanel; return; }
    }
    const source = normalizeCode(readSource(target));
    const language = detectLanguage(target);
    const lines = source.split('\n');
    const shown = lines.slice(0, MAX_LINES);
    const panel = document.createElement('section');
    panel.className = 'line-explain-panel';
    panel.id = 'line-explain-' + Math.random().toString(36).slice(2,9);
    panel.dataset.codeHelpIgnore = '1';
    const head = document.createElement('div');
    head.className = 'line-explain-head';
    const titleWrap = document.createElement('div');
    titleWrap.innerHTML = `<span class="line-explain-kicker">LECTURE ACTIVE · ${escapeHtml(langLabel(language))}</span><h3>Explication ligne par ligne</h3><p>${shown.length} ligne${shown.length>1?'s':''} analysée${shown.length>1?'s':''}. Ouvre ou ferme chaque ligne pour avancer à ton rythme.</p>`;
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'btn small ghost'; close.textContent = 'Fermer';
    close.addEventListener('click',()=>{panel.remove(); delete target.dataset.lineExplainPanel;});
    head.append(titleWrap,close);
    const list = document.createElement('div');
    list.className = 'line-explain-list';
    shown.forEach((line,i)=>list.append(makeRow(line,i,language)));
    panel.append(head,list);
    if (lines.length > MAX_LINES) {
      const note = document.createElement('p'); note.className='muted small'; note.textContent=`Analyse limitée aux ${MAX_LINES} premières lignes pour garder l’aide lisible.`; panel.append(note);
    }
    closeExisting(panel);
    target.dataset.lineExplainPanel = panel.id;
    const host = target.closest('.editor-shell, .editor-wrap, .lab-editor, .studio-editor') || target.parentElement;
    if (host && host.parentElement && target.matches('textarea')) host.insertAdjacentElement('afterend',panel);
    else target.insertAdjacentElement('afterend',panel);
    panel.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest'});
  }

  function addButton(target){
    if (!target || target.dataset.lineExplainBound || target.closest('.line-explain-panel, [data-line-explain-ignore]')) return;
    if (target.matches('pre') && !target.textContent.trim()) return;
    if (target.matches('textarea') && !target.classList.contains('editor') && !target.closest('.studio,.lab,.sql-studio,.react-studio,.typescript-studio,.node-lab')) return;
    target.dataset.lineExplainBound = '1';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn small ghost line-explain-trigger';
    btn.innerHTML = '<span aria-hidden="true">≡</span> Expliquer ligne par ligne';
    btn.addEventListener('click',()=>openPanel(target));
    if (target.matches('pre')) {
      const wrap = document.createElement('div');
      wrap.className = 'line-explain-actions';
      wrap.dataset.lineExplainIgnore = '1';
      wrap.append(btn);
      target.insertAdjacentElement('afterend',wrap);
    } else {
      const host = target.closest('.editor-shell, .editor-wrap, .lab-editor, .studio-editor') || target.parentElement;
      const wrap = document.createElement('div');
      wrap.className = 'line-explain-actions line-explain-editor-actions';
      wrap.dataset.lineExplainIgnore = '1';
      wrap.append(btn);
      if (host) host.insertAdjacentElement('afterend',wrap); else target.insertAdjacentElement('afterend',wrap);
    }
  }

  function enhance(root){
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('pre.code, pre.glossary-code, pre.glossary-mini-code, pre.code-help-example').forEach(pre=>{
      if (pre.closest('.line-explain-panel, .code-help-popup, [data-line-explain-ignore]')) return;
      addButton(pre);
    });
    scope.querySelectorAll('textarea.editor, .studio textarea, .lab textarea, .sql-studio textarea, .react-studio textarea, .typescript-studio textarea, .node-lab textarea').forEach(addButton);
  }

  let timer = null;
  function schedule(){ clearTimeout(timer); timer=setTimeout(()=>enhance(document),35); }
  const observer = new MutationObserver(schedule);
  document.addEventListener('DOMContentLoaded',()=>{
    enhance(document);
    observer.observe(document.body,{childList:true,subtree:true});
  });
  window.addEventListener('hashchange',schedule);
  window.lineExplainCode = openPanel;
})();
