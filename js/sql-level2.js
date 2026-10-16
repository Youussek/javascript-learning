// SQL — Niveau 2 : filtrer, trier et agréger. Dialecte SQLite.
SQL_LEVELS.push({
  id:"sql2", number:2, title:"Filtrer, trier et agréger",
  description:"Transformer une table en information utile avec WHERE, ORDER BY, agrégats, GROUP BY et HAVING.", available:true
});
const sqlPath2=LEARNING_PATHS.find(p=>p.id==="sql");
if(sqlPath2){
  sqlPath2.subtitle="2 niveaux complets · de SELECT aux premières analyses";
  sqlPath2.description="Interroge une vraie base SQLite : sélection, filtres, tris, agrégations et analyses par groupes.";
}

const SQL_ANALYTICS_SETUP=`
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  city TEXT NOT NULL,
  email TEXT UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  phone TEXT
);
INSERT INTO users (id,name,age,city,email,active,phone) VALUES
(1,'Alice',28,'Paris','alice@example.com',1,'0601010101'),
(2,'Bob',34,'Lyon','bob@example.com',1,NULL),
(3,'Clara',22,'Lille','clara@example.com',0,'0603030303'),
(4,'David',41,'Paris','david@example.com',1,NULL),
(5,'Emma',28,'Lyon','emma@example.com',1,'0605050505'),
(6,'Farid',19,'Paris','farid@example.com',0,NULL),
(7,'Grace',31,'Marseille','grace@example.com',1,'0607070707'),
(8,'Hugo',45,'Lille','hugo@example.com',1,NULL);

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  customer TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  quantity INTEGER NOT NULL,
  sold_at TEXT NOT NULL,
  status TEXT NOT NULL
);
INSERT INTO sales (id,customer,city,category,amount,quantity,sold_at,status) VALUES
(1,'Alice','Paris','Formation',120,1,'2026-01-05','paid'),
(2,'Bob','Lyon','Livre',35,2,'2026-01-06','paid'),
(3,'Alice','Paris','Livre',20,1,'2026-01-07','paid'),
(4,'Clara','Lille','Abonnement',60,1,'2026-02-01','pending'),
(5,'David','Paris','Formation',180,1,'2026-02-03','paid'),
(6,'Emma','Lyon','Abonnement',60,1,'2026-02-10','paid'),
(7,'Farid','Paris','Livre',15,1,'2026-02-12','cancelled'),
(8,'Grace','Marseille','Formation',150,1,'2026-03-01','paid'),
(9,'Hugo','Lille','Livre',45,3,'2026-03-04','paid'),
(10,'Emma','Lyon','Livre',25,1,'2026-03-05','pending'),
(11,'Alice','Paris','Abonnement',60,1,'2026-03-06','paid'),
(12,'Grace','Marseille','Livre',30,2,'2026-03-07','paid');`;

function sql2Hints(a,b,c){return[a,b,c];}
function sql2Q(id,lesson,notion,question,options,answer,explanation,retain,difficulty=1){SQL_EXERCISES.push({id,path:"sql",level:2,lesson,notion,type:"qcm",difficulty,question,options,answer,hints:sql2Hints("Repère la clause ou la fonction directement liée au besoin.","Observe l'ordre logique de la requête et ce qui agit sur les lignes.","Relis l'exemple de la leçon avant de choisir."),explanation,retain});}
function sql2VF(id,lesson,notion,statement,answer,explanation,retain,difficulty=1){SQL_EXERCISES.push({id,path:"sql",level:2,lesson,notion,type:"vf",difficulty,statement,answer,hints:sql2Hints("Demande-toi si la clause agit avant ou après le regroupement.","Vérifie le comportement avec les données visibles dans SQL Studio.","Relis la règle précise étudiée dans cette leçon."),explanation,retain});}
function sql2Fill(id,lesson,notion,question,template,answers,solution,explanation,retain,difficulty=1){SQL_EXERCISES.push({id,path:"sql",level:2,lesson,notion,type:"fill",difficulty,question,template,answers,solution,hints:sql2Hints("Repère l'emplacement de la clause manquante.","Cherche le mot-clé SQL qui exprime exactement le besoin.","Appuie-toi sur la syntaxe montrée dans le cours."),explanation,retain});}
function sql2Code(id,lesson,notion,question,query,validate,solution,options={}){SQL_EXERCISES.push({id,path:"sql",level:2,lesson,notion,type:"sqlcode",label:"Atelier SQL",difficulty:options.difficulty||2,question,setup:options.setup||SQL_ANALYTICS_SETUP,query,solution,validate,hints:options.hints||sql2Hints("Observe les tables et commence avec une requête simple.","Ajoute une seule clause à la fois et exécute pour vérifier son effet.","Compare précisément les colonnes, lignes et valeurs demandées."),explanation:options.explanation||"La validation observe le résultat SQLite. Une écriture différente est acceptée si elle répond correctement au besoin.",retain:options.retain||"En SQL, exprime d'abord le besoin métier puis vérifie le résultat produit."});}
function sql2Shape(cols,rows,check){return exactShape(cols,rows,check);}
function sql2Rows(expected){return r=>{const got=r.values.map(row=>row.map(v=>v===null?null:(typeof v==="number"?Number(v):String(v))));return JSON.stringify(got)===JSON.stringify(expected)?[]:["Les valeurs ou leur ordre ne correspondent pas encore au résultat attendu."];};}

SQL_LESSONS.push(
{id:"sql-where",level:2,title:"WHERE et opérateurs de comparaison",objective:"Filtrer les lignes selon une condition précise.",explanations:["WHERE conserve uniquement les lignes qui satisfont une condition. Il se place après FROM et avant les clauses de tri ou de limite.","Les opérateurs =, <>, >, <, >= et <= permettent de comparer une colonne à une valeur. En SQL, = sert à l'égalité.","Un filtre ne supprime aucune donnée : il réduit seulement les lignes présentes dans le résultat."],code:"SELECT name, age\nFROM users\nWHERE age >= 30;",details:["WHERE filtre des lignes.",">= signifie supérieur ou égal.","Les textes s'écrivent entre quotes simples."],mistakes:["Utiliser == comme en JavaScript.","Croire qu'un SELECT ... WHERE modifie les données."],shortcut:"Question métier avec une condition ? Commence par WHERE.",studio:"sql-where"},
{id:"sql-logic",level:2,title:"Combiner avec AND, OR et NOT",objective:"Composer plusieurs conditions sans ambiguïté.",explanations:["AND exige que les deux conditions soient vraies. OR accepte qu'au moins une condition soit vraie. NOT inverse une condition.","Les parenthèses sont importantes dès qu'une expression mélange AND et OR : elles rendent l'intention explicite et évitent de dépendre uniquement de la priorité des opérateurs.","Découpe les besoins complexes en petites conditions avant de les combiner."],code:"SELECT name, city\nFROM users\nWHERE age >= 28\n  AND active = 1;",details:["AND resserre généralement un filtre.","OR élargit généralement un filtre.","Parenthèses = intention explicite."],mistakes:["Écrire && ou || comme en JavaScript.","Mélanger AND/OR sans réfléchir aux parenthèses."],shortcut:"Traduis la phrase métier en conditions courtes, puis relie-les.",studio:"sql-logic"},
{id:"sql-in-between",level:2,title:"IN et BETWEEN",objective:"Exprimer proprement des listes de valeurs et des intervalles.",explanations:["IN évite d'enchaîner plusieurs OR pour tester une même colonne contre une liste de valeurs.","BETWEEN vérifie un intervalle inclusif : BETWEEN 20 AND 30 inclut 20 et 30.","Ces deux constructions rendent souvent une requête plus lisible sans changer son intention."],code:"SELECT name, city\nFROM users\nWHERE city IN ('Paris', 'Lyon')\n  AND age BETWEEN 20 AND 35;",details:["IN (...) = appartient à cette liste.","BETWEEN borne un intervalle inclusif.","Les deux se combinent avec AND/OR."],mistakes:["Écrire city = ('Paris','Lyon').","Oublier que BETWEEN inclut les bornes."],shortcut:"Liste courte de valeurs ? IN. Intervalle ? BETWEEN.",studio:"sql-in-between"},
{id:"sql-like",level:2,title:"LIKE : rechercher un motif",objective:"Filtrer du texte avec les jokers % et _.",explanations:["LIKE compare une chaîne à un motif. % représente zéro ou plusieurs caractères, tandis que _ représente exactement un caractère.","LIKE 'A%' signifie commence par A. LIKE '%example.com' signifie se termine par example.com.","Dans SQLite, le comportement de casse de LIKE peut dépendre de la configuration ; ici on se concentre sur les motifs simples."],code:"SELECT name, email\nFROM users\nWHERE name LIKE 'A%';",details:["% = longueur variable.","_ = exactement un caractère.","Le motif est une chaîne SQL."],mistakes:["Utiliser * comme joker de LIKE.","Oublier les quotes autour du motif."],shortcut:"Recherche textuelle simple ? Pense LIKE + %.",studio:"sql-like"},
{id:"sql-null",level:2,title:"NULL : absence de valeur",objective:"Tester correctement les valeurs manquantes avec IS NULL.",explanations:["NULL représente l'absence de valeur. Il ne se compare pas avec = comme une valeur ordinaire.","Pour rechercher les lignes sans téléphone, on utilise phone IS NULL. Pour l'inverse : IS NOT NULL.","Les expressions impliquant NULL suivent une logique à trois états ; le réflexe essentiel au début est de ne jamais écrire = NULL."],code:"SELECT name, phone\nFROM users\nWHERE phone IS NULL;",details:["NULL n'est ni 0 ni une chaîne vide.","IS NULL teste l'absence.","IS NOT NULL teste la présence."],mistakes:["Écrire phone = NULL.","Confondre NULL avec ''."],shortcut:"Valeur absente ? IS NULL / IS NOT NULL.",studio:"sql-null"},
{id:"sql-order",level:2,title:"ORDER BY : trier un résultat",objective:"Définir explicitement l'ordre des lignes.",explanations:["ORDER BY trie le résultat selon une ou plusieurs colonnes. ASC est croissant et constitue généralement le sens par défaut ; DESC inverse l'ordre.","On peut trier par plusieurs clés : ORDER BY age DESC, name ASC. La deuxième clé départage les égalités de la première.","Sans ORDER BY, ne considère jamais l'ordre d'un SELECT comme un contrat métier."],code:"SELECT name, age\nFROM users\nORDER BY age DESC, name ASC;",details:["ASC = croissant.","DESC = décroissant.","Plusieurs clés de tri sont possibles."],mistakes:["Placer ORDER BY avant WHERE.","Supposer qu'une table est naturellement triée par id."],shortcut:"Dès que l'ordre compte, écris ORDER BY explicitement.",studio:"sql-order"},
{id:"sql-pagination",level:2,title:"LIMIT et OFFSET : paginer",objective:"Extraire une tranche ordonnée d'un résultat SQLite.",explanations:["LIMIT fixe le nombre maximal de lignes. OFFSET indique combien de lignes ignorer avant de commencer à renvoyer le résultat.","Une pagination cohérente nécessite un ORDER BY stable. LIMIT 3 OFFSET 3 correspond conceptuellement à la deuxième page de trois éléments.","SQLite accepte LIMIT ... OFFSET ... ; d'autres SGBD proposent aussi d'autres syntaxes de pagination."],code:"SELECT name, age\nFROM users\nORDER BY id\nLIMIT 3 OFFSET 3;",details:["ORDER BY stabilise les pages.","LIMIT = taille de page.","OFFSET = nombre de lignes sautées."],mistakes:["Paginer sans ordre explicite.","Confondre OFFSET avec un numéro de page."],shortcut:"Page = ORDER BY + LIMIT + OFFSET.",studio:"sql-pagination"},
{id:"sql-aggregates",level:2,title:"COUNT, SUM, AVG, MIN et MAX",objective:"Résumer plusieurs lignes en valeurs synthétiques.",explanations:["Les fonctions d'agrégation calculent une information sur un ensemble de lignes. COUNT compte, SUM additionne, AVG moyenne, MIN et MAX recherchent les extrêmes.","Un WHERE placé avant l'agrégation permet de calculer uniquement sur les lignes utiles, par exemple le chiffre d'affaires des ventes payées.","COUNT(*) compte les lignes. COUNT(colonne) ignore les NULL de cette colonne."],code:"SELECT\n  COUNT(*) AS ventes,\n  SUM(amount) AS total,\n  AVG(amount) AS moyenne\nFROM sales\nWHERE status = 'paid';",details:["Agrégat = plusieurs lignes → valeur synthétique.","WHERE filtre avant le calcul.","Alias utiles pour nommer les résultats."],mistakes:["Penser que COUNT(phone) compte aussi les NULL.","Mélanger colonnes ordinaires et agrégats sans comprendre GROUP BY."],shortcut:"Besoin d'un total, d'une moyenne ou d'un comptage ? Fonction d'agrégation.",studio:"sql-aggregates"},
{id:"sql-group-having",level:2,title:"GROUP BY et HAVING",objective:"Calculer des statistiques par groupe puis filtrer les groupes.",explanations:["GROUP BY rassemble les lignes partageant une même valeur afin de calculer un agrégat pour chaque groupe. Exemple : chiffre d'affaires par ville.","WHERE filtre les lignes avant le regroupement. HAVING filtre les groupes après les agrégations.","Dans une requête groupée, chaque colonne sélectionnée qui n'est pas agrégée doit correspondre à la logique du GROUP BY."],code:"SELECT city, COUNT(*) AS ventes, SUM(amount) AS total\nFROM sales\nWHERE status = 'paid'\nGROUP BY city\nHAVING SUM(amount) >= 100\nORDER BY total DESC;",details:["WHERE → lignes avant groupe.","GROUP BY → crée les groupes.","HAVING → filtre les groupes calculés."],mistakes:["Utiliser HAVING pour un filtre simple qui devrait être dans WHERE.","Sélectionner des colonnes arbitraires hors GROUP BY."],shortcut:"Filtre sur une ligne : WHERE. Filtre sur COUNT/SUM/etc. : HAVING.",studio:"sql-group-having"}
);

// 4 exercices par leçon.
sql2Q("sx2-where-1","sql-where","WHERE","Quelle clause filtre les lignes d'un SELECT ?",["WHERE","AS","LIMIT","FROM"],0,"WHERE applique une condition aux lignes.","WHERE = filtre de lignes.");
sql2VF("sx2-where-2","sql-where","Comparaison","En SQL, on écrit age == 30 pour tester l'égalité.",false,"SQL utilise = pour l'égalité.","= en SQL, pas ==.");
sql2Fill("sx2-where-3","sql-where","Opérateur","Complète pour garder les utilisateurs d'au moins 30 ans.","SELECT name FROM users ___ age >= 30;",["WHERE"],"SELECT name FROM users WHERE age >= 30;","WHERE précède la condition.","SELECT ... FROM ... WHERE ...");
sql2Code("sx2-where-4","sql-where","Filtrage","Retourne name et age des utilisateurs ayant au moins 30 ans, dans l'ordre naturel du résultat.","SELECT name, age FROM users;",sql2Shape(["name","age"],4,sql2Rows([["Bob",34],["David",41],["Grace",31],["Hugo",45]])),"SELECT name, age FROM users WHERE age >= 30;");

sql2Q("sx2-logic-1","sql-logic","AND","Quelle expression exige que deux conditions soient vraies ?",["AND","OR","NOT","AS"],0,"AND exige toutes les conditions reliées.","AND resserre un filtre.");
sql2VF("sx2-logic-2","sql-logic","OR","OR exige que toutes les conditions soient vraies.",false,"OR demande qu'au moins une condition soit vraie.","OR élargit généralement le filtre.");
sql2Fill("sx2-logic-3","sql-logic","Combinaison","Complète pour les utilisateurs actifs de Paris.","SELECT name FROM users WHERE city = 'Paris' ___ active = 1;",["AND"],"SELECT name FROM users WHERE city = 'Paris' AND active = 1;","Les deux conditions doivent être vraies.","AND combine des conditions obligatoires.");
sql2Code("sx2-logic-4","sql-logic","Conditions combinées","Retourne name et city des utilisateurs actifs qui vivent à Paris ou Lyon, tri non demandé.","SELECT name, city FROM users;",sql2Shape(["name","city"],4,(r)=>{const names=r.values.map(x=>x[0]).sort();return JSON.stringify(names)===JSON.stringify(["Alice","Bob","David","Emma"])?[]:["Le résultat doit contenir Alice, Bob, David et Emma uniquement."];}),"SELECT name, city FROM users WHERE active = 1 AND (city = 'Paris' OR city = 'Lyon');");

sql2Q("sx2-in-1","sql-in-between","IN","Quelle forme remplace proprement city='Paris' OR city='Lyon' ?",["city IN ('Paris','Lyon')","city BETWEEN 'Paris','Lyon'","city LIKE ('Paris','Lyon')","city = ANYWHERE"],0,"IN teste l'appartenance à une liste.","IN évite des OR répétitifs.");
sql2VF("sx2-in-2","sql-in-between","BETWEEN","age BETWEEN 20 AND 30 inclut 20 et 30.",true,"BETWEEN est inclusif sur ses deux bornes.","BETWEEN inclut les bornes.");
sql2Fill("sx2-in-3","sql-in-between","Liste","Complète le filtre des villes Paris ou Lille.","SELECT name FROM users WHERE city ___ ('Paris','Lille');",["IN"],"SELECT name FROM users WHERE city IN ('Paris','Lille');","IN attend une liste entre parenthèses.","colonne IN (...)");
sql2Code("sx2-in-4","sql-in-between","Intervalle","Retourne name et age des utilisateurs âgés de 25 à 35 ans inclus.","SELECT name, age FROM users;",sql2Shape(["name","age"],4,(r)=>{const names=r.values.map(x=>x[0]).sort();return JSON.stringify(names)===JSON.stringify(["Alice","Bob","Emma","Grace"])?[]:["Attendu : Alice, Bob, Emma et Grace."];}),"SELECT name, age FROM users WHERE age BETWEEN 25 AND 35;");

sql2Q("sx2-like-1","sql-like","LIKE","Quel motif signifie 'commence par A' ?",["'A%'","'%A'","'A*'","'_A%'"],0,"% peut représenter zéro ou plusieurs caractères après A.","A% = commence par A.");
sql2VF("sx2-like-2","sql-like","Joker","Dans LIKE, % représente une longueur variable de caractères.",true,"% remplace zéro ou plusieurs caractères.","% = motif de longueur variable.");
sql2Fill("sx2-like-3","sql-like","Motif","Complète pour les emails terminant par example.com.","SELECT email FROM users WHERE email ___ '%example.com';",["LIKE"],"SELECT email FROM users WHERE email LIKE '%example.com';","LIKE compare la chaîne au motif.","LIKE + % pour les recherches textuelles simples.");
sql2Code("sx2-like-4","sql-like","Recherche","Retourne name et email des utilisateurs dont le nom commence par A ou E.","SELECT name, email FROM users;",sql2Shape(["name","email"],2,(r)=>{const names=r.values.map(x=>x[0]).sort();return JSON.stringify(names)===JSON.stringify(["Alice","Emma"])?[]:["Le résultat doit contenir Alice et Emma."];}),"SELECT name, email FROM users WHERE name LIKE 'A%' OR name LIKE 'E%';");

sql2Q("sx2-null-1","sql-null","NULL","Comment tester une valeur absente ?",["IS NULL","= NULL","== NULL","LIKE NULL"],0,"NULL se teste avec IS NULL.","Jamais = NULL.");
sql2VF("sx2-null-2","sql-null","NULL","Une chaîne vide et NULL représentent toujours la même chose.",false,"NULL signifie absence de valeur ; '' est une chaîne existante de longueur zéro.","NULL ≠ chaîne vide.");
sql2Fill("sx2-null-3","sql-null","Présence","Complète pour les utilisateurs ayant un téléphone.","SELECT name FROM users WHERE phone ___ NULL;",["IS NOT"],"SELECT name FROM users WHERE phone IS NOT NULL;","IS NOT NULL sélectionne les valeurs présentes.","IS NULL / IS NOT NULL.");
sql2Code("sx2-null-4","sql-null","Valeurs manquantes","Retourne name et phone des utilisateurs sans téléphone.","SELECT name, phone FROM users;",sql2Shape(["name","phone"],4,(r)=>{const names=r.values.map(x=>x[0]).sort();return JSON.stringify(names)===JSON.stringify(["Bob","David","Farid","Hugo"])?[]:["Attendu : Bob, David, Farid et Hugo."];}),"SELECT name, phone FROM users WHERE phone IS NULL;");

sql2Q("sx2-order-1","sql-order","ORDER BY","Quel mot-clé trie les lignes ?",["ORDER BY","GROUP BY","SORT","HAVING"],0,"ORDER BY définit l'ordre du résultat.","Ordre explicite = ORDER BY.");
sql2VF("sx2-order-2","sql-order","DESC","ORDER BY age DESC place les âges les plus élevés en premier.",true,"DESC signifie ordre décroissant.","DESC = décroissant.");
sql2Fill("sx2-order-3","sql-order","Tri","Complète pour trier par âge croissant.","SELECT name, age FROM users ___ age ASC;",["ORDER BY"],"SELECT name, age FROM users ORDER BY age ASC;","ORDER BY précède la clé de tri.","ORDER BY colonne ASC|DESC.");
sql2Code("sx2-order-4","sql-order","Classement","Retourne les 3 utilisateurs les plus âgés avec name et age, du plus âgé au plus jeune.","SELECT name, age FROM users;",sql2Shape(["name","age"],3,sql2Rows([["Hugo",45],["David",41],["Bob",34]])),"SELECT name, age FROM users ORDER BY age DESC LIMIT 3;");

sql2Q("sx2-page-1","sql-pagination","OFFSET","Que signifie OFFSET 3 ?",["Ignorer les 3 premières lignes du résultat ordonné","Renvoie exactement 3 colonnes","Trie par la valeur 3","Supprime 3 lignes"],0,"OFFSET saute un nombre de lignes avant de retourner la suite.","OFFSET = lignes sautées.");
sql2VF("sx2-page-2","sql-pagination","Pagination","Une pagination stable devrait utiliser ORDER BY.",true,"Sans ordre stable, les pages n'ont pas de contrat fiable.","Paginer implique un ordre explicite.");
sql2Fill("sx2-page-3","sql-pagination","Page","Complète pour sauter les trois premières lignes.","SELECT name FROM users ORDER BY id LIMIT 3 ___ 3;",["OFFSET"],"SELECT name FROM users ORDER BY id LIMIT 3 OFFSET 3;","OFFSET vient après LIMIT dans cette syntaxe SQLite.","LIMIT taille OFFSET saut.");
sql2Code("sx2-page-4","sql-pagination","Deuxième page","Avec des pages de 3 utilisateurs triés par id, retourne la deuxième page : name uniquement.","SELECT name FROM users ORDER BY id LIMIT 3;",sql2Shape(["name"],3,sql2Rows([["David"],["Emma"],["Farid"]])),"SELECT name FROM users ORDER BY id LIMIT 3 OFFSET 3;");

sql2Q("sx2-agg-1","sql-aggregates","COUNT","Quelle fonction compte des lignes ?",["COUNT","SUM","AVG","MAX"],0,"COUNT compte des lignes ou des valeurs non NULL selon sa forme.","COUNT(*) compte les lignes.");
sql2VF("sx2-agg-2","sql-aggregates","COUNT et NULL","COUNT(phone) compte les lignes où phone vaut NULL.",false,"COUNT(colonne) ignore les valeurs NULL.","COUNT(*) et COUNT(colonne) n'ont pas toujours le même résultat.");
sql2Fill("sx2-agg-3","sql-aggregates","SUM","Complète le total des montants payés.","SELECT ___(amount) AS total FROM sales WHERE status='paid';",["SUM"],"SELECT SUM(amount) AS total FROM sales WHERE status='paid';","SUM additionne les valeurs numériques.","SUM = total numérique.");
sql2Code("sx2-agg-4","sql-aggregates","Indicateurs","Pour les ventes paid uniquement, retourne ventes, total et moyenne avec COUNT(*), SUM(amount) et AVG(amount).", "SELECT * FROM sales WHERE status='paid';",sql2Shape(["ventes","total","moyenne"],1,(r)=>{const [count,total,avg]=r.values[0];const p=[];if(count!==9)p.push("Il doit y avoir 9 ventes payées.");if(Number(total)!==700)p.push("Le total attendu est 700.");if(Math.abs(Number(avg)-(700/9))>0.001)p.push("La moyenne doit être calculée sur les 9 ventes payées.");return p;}),"SELECT COUNT(*) AS ventes, SUM(amount) AS total, AVG(amount) AS moyenne FROM sales WHERE status='paid';");

sql2Q("sx2-group-1","sql-group-having","GROUP BY","Quelle clause crée un groupe par ville ?",["GROUP BY city","ORDER BY city","HAVING city","DISTINCT GROUP city"],0,"GROUP BY rassemble les lignes partageant la même ville.","GROUP BY définit les groupes d'agrégation.");
sql2VF("sx2-group-2","sql-group-having","HAVING","HAVING sert notamment à filtrer selon SUM(...) ou COUNT(...) après GROUP BY.",true,"HAVING intervient sur les groupes calculés.","WHERE avant groupe, HAVING après groupe.");
sql2Fill("sx2-group-3","sql-group-having","HAVING","Complète le filtre des groupes totalisant au moins 100.","SELECT city, SUM(amount) AS total FROM sales GROUP BY city ___ SUM(amount) >= 100;",["HAVING"],"SELECT city, SUM(amount) AS total FROM sales GROUP BY city HAVING SUM(amount) >= 100;","HAVING filtre ici un résultat agrégé.","Filtre d'agrégat = HAVING.");
sql2Code("sx2-group-4","sql-group-having","Analyse par ville","Sur les ventes paid, retourne city, ventes et chiffre_affaires. Garde seulement les villes ayant au moins 100 de chiffre d'affaires et trie du plus grand au plus petit.","SELECT city, amount FROM sales;",sql2Shape(["city","ventes","chiffre_affaires"],2,(r)=>{const expected=[["Paris",4,380],["Marseille",2,180]];const got=r.values.map(x=>[x[0],Number(x[1]),Number(x[2])]);return JSON.stringify(got)===JSON.stringify(expected)?[]:["Résultat attendu : Paris (4, 380), puis Marseille (2, 180)."];}),"SELECT city, COUNT(*) AS ventes, SUM(amount) AS chiffre_affaires\nFROM sales\nWHERE status = 'paid'\nGROUP BY city\nHAVING SUM(amount) >= 100\nORDER BY chiffre_affaires DESC;",{difficulty:3});

SQL_EVALUATIONS[2]=[
{id:"sqleval-2-1",path:"sql",level:2,notion:"WHERE",type:"qcm",difficulty:1,question:"Quelle clause filtre les lignes avant le tri ?",options:["WHERE","ORDER BY","AS","LIMIT"],answer:0,hints:[],explanation:"WHERE sélectionne les lignes satisfaisant la condition.",retain:"WHERE filtre les lignes."},
{id:"sqleval-2-2",path:"sql",level:2,notion:"Logique",type:"qcm",difficulty:1,question:"Quelle expression impose les deux conditions ?",options:["A AND B","A OR B","NOT A","A AS B"],answer:0,hints:[],explanation:"AND exige les deux conditions.",retain:"AND = toutes les conditions."},
{id:"sqleval-2-3",path:"sql",level:2,notion:"IN",type:"qcm",difficulty:2,question:"Quelle syntaxe teste Paris ou Lyon proprement ?",options:["city IN ('Paris','Lyon')","city = ('Paris','Lyon')","city BETWEEN Paris Lyon","city LIKE Paris OR Lyon"],answer:0,hints:[],explanation:"IN teste l'appartenance à une liste.",retain:"IN (...)."},
{id:"sqleval-2-4",path:"sql",level:2,notion:"NULL",type:"qcm",difficulty:2,question:"Comment chercher les téléphones absents ?",options:["phone IS NULL","phone = NULL","phone == NULL","phone LIKE NULL"],answer:0,hints:[],explanation:"NULL se teste avec IS NULL.",retain:"Jamais = NULL."},
{id:"sqleval-2-5",path:"sql",level:2,notion:"ORDER BY",type:"qcm",difficulty:1,question:"ORDER BY amount DESC produit…",options:["les plus grands montants d'abord","les plus petits d'abord","un GROUP BY","une suppression"],answer:0,hints:[],explanation:"DESC trie en décroissant.",retain:"DESC = décroissant."},
{id:"sqleval-2-6",path:"sql",level:2,notion:"Pagination",type:"qcm",difficulty:2,question:"Avec LIMIT 10 OFFSET 20, OFFSET représente…",options:["20 lignes ignorées avant la page","20 colonnes","la limite maximale","un ordre"],answer:0,hints:[],explanation:"OFFSET saute 20 lignes avant de renvoyer les suivantes.",retain:"OFFSET = saut."},
{id:"sqleval-2-7",path:"sql",level:2,notion:"Agrégats",type:"qcm",difficulty:2,question:"Quelle fonction calcule une moyenne ?",options:["AVG","SUM","COUNT","MAXIMUM"],answer:0,hints:[],explanation:"AVG calcule la moyenne des valeurs non NULL.",retain:"AVG = moyenne."},
{id:"sqleval-2-8",path:"sql",level:2,notion:"GROUP BY",type:"qcm",difficulty:2,question:"Pour compter les utilisateurs par ville, quelle clause est essentielle ?",options:["GROUP BY city","LIMIT city","ORDER ONLY city","AS GROUP city"],answer:0,hints:[],explanation:"GROUP BY city crée un groupe pour chaque ville.",retain:"GROUP BY = statistiques par groupe."},
{id:"sqleval-2-9",path:"sql",level:2,notion:"HAVING",type:"qcm",difficulty:2,question:"Où filtrer COUNT(*) >= 3 après un GROUP BY ?",options:["HAVING COUNT(*) >= 3","WHERE COUNT(*) >= 3","LIMIT COUNT(*)","ORDER COUNT(*)"],answer:0,hints:[],explanation:"HAVING filtre les groupes selon un agrégat.",retain:"Agrégat filtré = HAVING."},
{id:"sqleval-2-10",path:"sql",level:2,notion:"WHERE vs HAVING",type:"qcm",difficulty:3,question:"Dans une analyse des ventes payées par ville, où filtrer status='paid' ?",options:["WHERE, avant GROUP BY","HAVING uniquement","ORDER BY","LIMIT"],answer:0,hints:[],explanation:"status concerne chaque ligne de vente, donc WHERE est le bon emplacement.",retain:"WHERE filtre les lignes, HAVING les groupes."}
];

SQL_PROJECTS.push({
  id:"sql-sales-analysis",level:2,title:"Analyse des ventes par ville",
  description:"Transforme un dataset de ventes en indicateurs métier avec filtres, agrégats et GROUP BY.",
  brief:"Analyse uniquement les ventes paid. Retourne city, ventes (COUNT) et chiffre_affaires (SUM amount). Garde seulement les villes dont le chiffre d'affaires atteint au moins 100, puis trie du chiffre d'affaires le plus élevé au plus faible.",
  setup:SQL_ANALYTICS_SETUP,
  query:"SELECT * FROM sales;",
  solution:"SELECT city, COUNT(*) AS ventes, SUM(amount) AS chiffre_affaires\nFROM sales\nWHERE status = 'paid'\nGROUP BY city\nHAVING SUM(amount) >= 100\nORDER BY chiffre_affaires DESC;",
  validate:sql2Shape(["city","ventes","chiffre_affaires"],2,(r)=>{const got=r.values.map(x=>[x[0],Number(x[1]),Number(x[2])]);return JSON.stringify(got)===JSON.stringify([["Paris",4,380],["Marseille",2,180]])?[]:["Le résultat final doit contenir Paris (4 ventes, 380) puis Marseille (2 ventes, 180)."];}),
  retain:"Une analyse SQL robuste combine souvent WHERE pour nettoyer le périmètre, GROUP BY pour structurer les groupes, les agrégats pour calculer, HAVING pour filtrer ces groupes et ORDER BY pour présenter le résultat."
});

Object.assign(SQL_STUDIO_PRESETS,{
  "sql-where":{setup:SQL_ANALYTICS_SETUP,query:"SELECT name, age FROM users WHERE age >= 30;",guide:"Change l'opérateur ou la valeur puis observe quelles lignes restent."},
  "sql-logic":{setup:SQL_ANALYTICS_SETUP,query:"SELECT name, city FROM users WHERE active = 1 AND (city = 'Paris' OR city = 'Lyon');",guide:"Teste AND, OR et les parenthèses sur le dataset users."},
  "sql-in-between":{setup:SQL_ANALYTICS_SETUP,query:"SELECT name, age, city FROM users WHERE city IN ('Paris','Lyon') AND age BETWEEN 20 AND 35;",guide:"Compare IN à plusieurs OR, puis modifie les bornes de BETWEEN."},
  "sql-like":{setup:SQL_ANALYTICS_SETUP,query:"SELECT name, email FROM users WHERE name LIKE 'A%';",guide:"Essaie A%, %a%, _o% et observe les correspondances."},
  "sql-null":{setup:SQL_ANALYTICS_SETUP,query:"SELECT name, phone FROM users WHERE phone IS NULL;",guide:"Compare IS NULL et IS NOT NULL. Évite volontairement = NULL."},
  "sql-order":{setup:SQL_ANALYTICS_SETUP,query:"SELECT name, age FROM users ORDER BY age DESC, name ASC;",guide:"Inverse ASC/DESC ou ajoute une seconde clé de tri."},
  "sql-pagination":{setup:SQL_ANALYTICS_SETUP,query:"SELECT id, name FROM users ORDER BY id LIMIT 3 OFFSET 3;",guide:"Change LIMIT et OFFSET pour simuler plusieurs pages."},
  "sql-aggregates":{setup:SQL_ANALYTICS_SETUP,query:"SELECT COUNT(*) AS ventes, SUM(amount) AS total, AVG(amount) AS moyenne FROM sales WHERE status = 'paid';",guide:"Compare COUNT, SUM, AVG, MIN et MAX sur les ventes."},
  "sql-group-having":{setup:SQL_ANALYTICS_SETUP,query:"SELECT city, COUNT(*) AS ventes, SUM(amount) AS total FROM sales WHERE status='paid' GROUP BY city HAVING SUM(amount)>=100 ORDER BY total DESC;",guide:"Observe l'effet de WHERE avant le groupe et HAVING après l'agrégation."}
});
