// SQL — Niveau 3 : relations et JOIN. Dialecte SQLite.
SQL_LEVELS.push({
  id:"sql3", number:3, title:"Relations et JOIN",
  description:"Relier plusieurs tables avec les clés primaires/étrangères, INNER JOIN, LEFT JOIN et des analyses multi-tables.", available:true
});
const sqlPath3=LEARNING_PATHS.find(p=>p.id==="sql");
if(sqlPath3){
  sqlPath3.subtitle="3 niveaux complets · de SELECT aux analyses multi-tables";
  sqlPath3.description="Interroge une vraie base SQLite : lecture, filtres, agrégations, relations et JOIN sur plusieurs tables.";
}

const SQL_RELATIONS_SETUP=`
PRAGMA foreign_keys = ON;
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL,
  ordered_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
INSERT INTO users (id,name,email,city) VALUES
(1,'Alice','alice@example.com','Paris'),
(2,'Bob','bob@example.com','Lyon'),
(3,'Clara','clara@example.com','Lille'),
(4,'David','david@example.com','Paris'),
(5,'Emma','emma@example.com','Lyon');
INSERT INTO orders (id,user_id,total,status,ordered_at) VALUES
(1,1,120,'paid','2026-01-05'),
(2,1,60,'paid','2026-02-07'),
(3,2,35,'pending','2026-02-10'),
(4,4,200,'paid','2026-03-01'),
(5,4,80,'paid','2026-03-04'),
(6,5,50,'cancelled','2026-03-07');
INSERT INTO products (id,name,category,price) VALUES
(1,'Formation Node.js','Formation',120),
(2,'Livre SQL','Livre',20),
(3,'Abonnement Pro','Abonnement',60),
(4,'Clavier','Matériel',80);
INSERT INTO order_items (id,order_id,product_id,quantity) VALUES
(1,1,1,1),
(2,2,3,1),
(3,3,2,2),
(4,4,1,1),
(5,4,4,1),
(6,5,4,1),
(7,6,2,2);`;

function sql3Hints(a,b,c){return[a,b,c];}
function sql3Q(id,lesson,notion,question,options,answer,explanation,retain,difficulty=1){SQL_EXERCISES.push({id,path:"sql",level:3,lesson,notion,type:"qcm",difficulty,question,options,answer,hints:sql3Hints("Repère quelles tables participent au besoin.","Observe les clés qui relient les tables dans le schéma.","Demande-toi quelles lignes doivent être conservées quand aucune correspondance n'existe."),explanation,retain});}
function sql3VF(id,lesson,notion,statement,answer,explanation,retain,difficulty=1){SQL_EXERCISES.push({id,path:"sql",level:3,lesson,notion,type:"vf",difficulty,statement,answer,hints:sql3Hints("Observe le sens de la relation dans le schéma.","Vérifie ce qu'un JOIN garde ou élimine réellement.","Relis la différence entre clé primaire et clé étrangère."),explanation,retain});}
function sql3Fill(id,lesson,notion,question,template,answers,solution,explanation,retain,difficulty=1){SQL_EXERCISES.push({id,path:"sql",level:3,lesson,notion,type:"fill",difficulty,question,template,answers,solution,hints:sql3Hints("Identifie d'abord les deux tables à relier.","Cherche la colonne FK et la PK correspondante.","Complète la clause ON avec les deux colonnes reliées."),explanation,retain});}
function sql3Code(id,lesson,notion,question,query,validate,solution,options={}){SQL_EXERCISES.push({id,path:"sql",level:3,lesson,notion,type:"sqlcode",label:"Atelier SQL",difficulty:options.difficulty||2,question,setup:options.setup||SQL_RELATIONS_SETUP,query,solution,validate,hints:options.hints||sql3Hints("Observe le schéma relationnel avant d'écrire le JOIN.","Relie la clé étrangère à la clé primaire correspondante.","Exécute d'abord un JOIN simple, puis ajoute les filtres ou agrégats."),explanation:options.explanation||"La validation compare le résultat SQLite. Une autre écriture du JOIN est acceptée si elle produit correctement les colonnes et lignes demandées.",retain:options.retain||"Un JOIN exprime une relation entre tables ; la clause ON doit décrire précisément cette relation."});}
function sql3Shape(cols,rows,check){return exactShape(cols,rows,check);}
function sql3Rows(expected){return r=>{const got=r.values.map(row=>row.map(v=>v===null?null:(typeof v==="number"?Number(v):String(v))));return JSON.stringify(got)===JSON.stringify(expected)?[]:["Les valeurs ou leur ordre ne correspondent pas encore au résultat attendu."];};}

SQL_LESSONS.push(
{id:"sql-keys",level:3,title:"Clés primaires et clés étrangères",objective:"Comprendre comment une clé étrangère relie une ligne à une autre table.",explanations:["Une PRIMARY KEY identifie une ligne de façon unique. Une FOREIGN KEY stocke l'identifiant d'une ligne située dans une autre table.","Dans orders, user_id référence users.id. Cela permet de ne pas recopier le nom et l'email du client dans chaque commande.","La relation est une propriété du schéma : un JOIN l'exploite ensuite pour reconstruire une vue combinée."],code:"orders.user_id  →  users.id\n       FK             PK",details:["users.id identifie un utilisateur.","orders.user_id indique à quel utilisateur appartient une commande.","La FK réduit les duplications et rend la relation explicite."],mistakes:["Relier deux colonnes uniquement parce qu'elles ont le même type.","Confondre la clé primaire de orders avec user_id."],shortcut:"Avant tout JOIN : trouve la PK, puis la FK qui la référence.",studio:"sql-keys"},
{id:"sql-relations",level:3,title:"Relations 1:1, 1:N et N:N",objective:"Reconnaître le type de relation entre des tables.",explanations:["Une relation 1:N signifie qu'une ligne d'une table peut être liée à plusieurs lignes de l'autre : un utilisateur peut avoir plusieurs commandes.","Une relation N:N nécessite généralement une table d'association. orders et products sont reliées via order_items : une commande contient plusieurs produits et un produit peut apparaître dans plusieurs commandes.","Une relation 1:1 existe quand une ligne correspond au plus à une ligne de l'autre table, souvent avec une contrainte UNIQUE sur la FK."],code:"users 1 ─── N orders\norders 1 ─── N order_items N ─── 1 products",details:["1:N : FK du côté N.","N:N : table d'association.","1:1 : relation unique de chaque côté."],mistakes:["Créer une colonne product1, product2, product3 au lieu d'une table d'association.","Croire qu'une relation N:N se fait avec une seule FK."],shortcut:"Si les deux côtés peuvent avoir plusieurs correspondances, pense table d'association.",studio:"sql-relations"},
{id:"sql-inner-join",level:3,title:"INNER JOIN : garder les correspondances",objective:"Associer les utilisateurs à leurs commandes existantes.",explanations:["INNER JOIN ne garde que les lignes pour lesquelles la condition ON trouve une correspondance des deux côtés.","Ici, Clara n'a aucune commande : elle n'apparaît pas dans un INNER JOIN users ↔ orders.","JOIN sans précision est généralement synonyme d'INNER JOIN dans SQLite, mais écrire INNER peut aider à rendre l'intention explicite."],code:"SELECT users.name, orders.id\nFROM users\nINNER JOIN orders ON orders.user_id = users.id;",details:["ON décrit la relation.","Une ligne utilisateur peut apparaître plusieurs fois si elle possède plusieurs commandes.","Les lignes sans correspondance disparaissent."],mistakes:["Oublier ON et produire un produit cartésien involontaire.","Relier orders.id à users.id au lieu de orders.user_id à users.id."],shortcut:"Besoin uniquement des lignes reliées ? INNER JOIN.",studio:"sql-inner"},
{id:"sql-left-join",level:3,title:"LEFT JOIN : conserver la table de gauche",objective:"Inclure aussi les utilisateurs qui n'ont aucune commande.",explanations:["LEFT JOIN conserve toutes les lignes de la table située à gauche, même si aucune correspondance n'existe à droite.","Pour Clara, les colonnes provenant de orders valent NULL puisqu'aucune commande n'est associée.","Ce JOIN est particulièrement utile pour trouver les entités sans relation : clients sans commande, produits jamais vendus, etc."],code:"SELECT u.name, o.id AS order_id\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id;",details:["Toutes les lignes de users restent présentes.","Absence de correspondance = NULL côté orders.","LEFT JOIN peut révéler les données manquantes."],mistakes:["Ajouter WHERE o.id IS NOT NULL puis s'étonner d'avoir le comportement d'un INNER JOIN.","Confondre la table de gauche et celle de droite."],shortcut:"Tu dois garder tout le côté gauche ? LEFT JOIN.",studio:"sql-left"},
{id:"sql-table-aliases",level:3,title:"Alias de tables et colonnes qualifiées",objective:"Écrire des JOIN lisibles et éviter les colonnes ambiguës.",explanations:["Les alias raccourcissent les noms de tables : users u, orders o. Ils deviennent indispensables quand plusieurs tables ont des colonnes comme id ou name.","Une colonne qualifiée s'écrit u.id ou o.id. Cela indique exactement quelle table fournit la valeur.","Les alias ne changent ni le schéma ni les données ; ils ne vivent que pendant la requête."],code:"SELECT u.name, o.id AS order_id, o.total\nFROM users AS u\nJOIN orders AS o ON o.user_id = u.id;",details:["u et o sont des alias de tables.","o.id évite l'ambiguïté avec u.id.","Un alias de colonne améliore le résultat final."],mistakes:["Utiliser le nom complet de la table après avoir choisi un alias dans un contexte où cela rend la requête confuse.","Écrire SELECT id avec plusieurs tables contenant id."],shortcut:"Plusieurs tables avec des noms de colonnes communs ? Qualifie avec l'alias.",studio:"sql-alias-join"},
{id:"sql-multiple-joins",level:3,title:"Plusieurs JOIN : suivre une chaîne de relations",objective:"Relier commandes, articles et produits dans une seule requête.",explanations:["Une analyse réelle traverse souvent plusieurs relations. Pour connaître les produits d'une commande : orders → order_items → products.","Chaque JOIN doit avoir sa propre condition ON. Construis la requête progressivement et vérifie le résultat après chaque nouvelle table.","Le nombre de lignes peut augmenter : une commande contenant plusieurs articles apparaît plusieurs fois, une fois par ligne order_items."],code:"SELECT o.id, p.name, oi.quantity\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id;",details:["Deux relations = deux clauses JOIN/ON.","order_items sert de pont N:N.","Le grain du résultat devient ici la ligne de commande."],mistakes:["Sauter order_items et tenter de relier directement orders à products.","Réutiliser la mauvaise condition ON sur le second JOIN."],shortcut:"Trace le chemin entre les tables avant d'écrire les JOIN.",studio:"sql-multi-join"},
{id:"sql-join-where",level:3,title:"JOIN + WHERE : relier puis filtrer",objective:"Filtrer proprement un résultat multi-tables.",explanations:["Le JOIN construit les lignes combinées ; WHERE filtre ensuite ces lignes selon un besoin métier.","Par exemple, on peut relier utilisateurs et commandes puis ne garder que les commandes paid des clients de Paris.","Place les conditions de relation dans ON et les filtres métier dans WHERE : la requête devient plus facile à relire."],code:"SELECT u.name, o.total\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE u.city = 'Paris'\n  AND o.status = 'paid';",details:["ON = comment les tables se relient.","WHERE = quelles lignes combinées garder.","Les colonnes de toutes les tables jointes peuvent servir au filtre."],mistakes:["Mettre tous les filtres métier dans ON sans raison.","Filtrer une colonne sans préciser son alias lorsqu'elle est ambiguë."],shortcut:"ON décrit la relation ; WHERE décrit le besoin métier.",studio:"sql-join-where"},
{id:"sql-join-group",level:3,title:"JOIN + GROUP BY : agréger plusieurs tables",objective:"Calculer des indicateurs par utilisateur à partir de ses commandes.",explanations:["Après un JOIN, on peut utiliser GROUP BY pour regrouper les lignes reliées. Cela permet par exemple de compter les commandes ou sommer les montants par utilisateur.","Avec LEFT JOIN, COUNT(o.id) vaut 0 pour un utilisateur sans commande, alors que COUNT(*) compterait malgré tout la ligne utilisateur conservée.","Cette combinaison est centrale dans les tableaux de bord et rapports métier."],code:"SELECT u.name, COUNT(o.id) AS commandes,\n       COALESCE(SUM(o.total), 0) AS total\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name;",details:["GROUP BY intervient après la jointure.","COUNT(o.id) ignore les NULL issus du LEFT JOIN.","COALESCE transforme un SUM NULL en 0."],mistakes:["Utiliser COUNT(*) en pensant obtenir 0 pour les utilisateurs sans commande.","Oublier de regrouper l'utilisateur avant l'agrégation."],shortcut:"Besoin d'un indicateur par entité ? JOIN puis GROUP BY.",studio:"sql-join-group"},
{id:"sql-business-joins",level:3,title:"Construire une requête métier multi-tables",objective:"Choisir soi-même les tables, relations, JOIN, filtres et agrégats nécessaires.",explanations:["À ce stade, le plus important n'est plus de mémoriser JOIN : il faut savoir partir d'une question métier et identifier le grain du résultat attendu.","Procède dans l'ordre : résultat attendu → tables nécessaires → chemin relationnel → JOIN → filtres → agrégats → tri.","Une bonne requête multi-tables est d'abord un raisonnement sur les données et leurs relations."],code:"-- Question : quels clients ont dépensé le plus ?\nSELECT u.name, SUM(o.total) AS depense\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.status = 'paid'\nGROUP BY u.id, u.name\nORDER BY depense DESC;",details:["Commence par la question métier.","Identifie le grain du résultat.","Ajoute une étape SQL à la fois."],mistakes:["Empiler des JOIN sans comprendre pourquoi chaque table est nécessaire.","Agréger avant d'avoir défini correctement les relations."],shortcut:"Dessine mentalement le chemin entre les tables avant de coder.",studio:"sql-business-joins"}
);

// 4 exercices par leçon : compréhension, lecture, syntaxe, atelier réel.
sql3Q("sqlx3-keys-1","sql-keys","Clés","Quelle colonne relie orders à users ?",["orders.user_id","orders.id","users.name","orders.total"],0,"orders.user_id est une clé étrangère qui référence users.id.","Une FK stocke l'identifiant de la ligne liée.");
sql3VF("sqlx3-keys-2","sql-keys","Clés","Une clé étrangère doit toujours porter le même nom que la clé primaire référencée.",false,"Le nom peut être différent. Ce qui compte est la contrainte de référence.","La relation est définie par le schéma, pas par une convention de nommage.");
sql3Fill("sqlx3-keys-3","sql-keys","Clés","Complète la relation.","FOREIGN KEY (user_id) _____ users(id)",["REFERENCES"],"FOREIGN KEY (user_id) REFERENCES users(id)","REFERENCES indique la table et la colonne ciblées par la clé étrangère.","FK → REFERENCES → PK.");
sql3Code("sqlx3-keys-4","sql-keys","Clés","Affiche l'id de chaque commande avec le nom de son utilisateur.","SELECT * FROM orders;",sql3Shape(["order_id","name"],6,sql3Rows([[1,"Alice"],[2,"Alice"],[3,"Bob"],[4,"David"],[5,"David"],[6,"Emma"]])),"SELECT o.id AS order_id, u.name\nFROM orders o\nJOIN users u ON u.id = o.user_id\nORDER BY o.id;",{difficulty:2});

sql3Q("sqlx3-rel-1","sql-relations","Relations","Quel type décrit users → orders dans ce dataset ?",["1:N","N:N","1:1","Aucune relation"],0,"Un utilisateur peut posséder plusieurs commandes et chaque commande appartient à un utilisateur.","users 1 → N orders.");
sql3VF("sqlx3-rel-2","sql-relations","Relations","La table order_items sert à représenter la relation N:N entre orders et products.",true,"Chaque ligne associe une commande à un produit, avec une quantité.","Une table d'association résout une relation N:N.");
sql3Fill("sqlx3-rel-3","sql-relations","Relations","Complète le chemin.","orders → _____ → products",["order_items"],"orders → order_items → products","order_items porte les deux clés étrangères nécessaires.","N:N = table d'association.");
sql3Code("sqlx3-rel-4","sql-relations","Relations","Affiche chaque produit présent dans une commande avec l'id de la commande.","SELECT * FROM order_items;",sql3Shape(["order_id","product"],7,sql3Rows([[1,"Formation Node.js"],[2,"Abonnement Pro"],[3,"Livre SQL"],[4,"Formation Node.js"],[4,"Clavier"],[5,"Clavier"],[6,"Livre SQL"]])),"SELECT oi.order_id, p.name AS product\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nORDER BY oi.order_id, oi.id;",{difficulty:2});

sql3Q("sqlx3-inner-1","sql-inner-join","INNER JOIN","Que devient Clara dans un INNER JOIN users/orders si elle n'a aucune commande ?",["Elle disparaît du résultat","Elle apparaît avec des NULL","Une erreur est levée","Une commande vide est créée"],0,"INNER JOIN garde seulement les correspondances des deux côtés.","Pas de correspondance = pas de ligne avec INNER JOIN.");
sql3VF("sqlx3-inner-2","sql-inner-join","INNER JOIN","JOIN orders o ON o.user_id = u.id relie les commandes à leur utilisateur.",true,"user_id référence users.id.","La clause ON décrit la relation.");
sql3Fill("sqlx3-inner-3","sql-inner-join","INNER JOIN","Complète la condition.","JOIN orders o ON o._____ = u.id",["user_id"],"JOIN orders o ON o.user_id = u.id","La FK orders.user_id pointe vers users.id.","JOIN sur FK = PK.");
sql3Code("sqlx3-inner-4","sql-inner-join","INNER JOIN","Affiche le nom du client et le total de chaque commande.","SELECT * FROM users;",sql3Shape(["name","total"],6,sql3Rows([["Alice",120],["Alice",60],["Bob",35],["David",200],["David",80],["Emma",50]])),"SELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON o.user_id = u.id\nORDER BY o.id;",{difficulty:2});

sql3Q("sqlx3-left-1","sql-left-join","LEFT JOIN","Quel JOIN permet de garder tous les utilisateurs, même sans commande ?",["LEFT JOIN depuis users","INNER JOIN","CROSS JOIN uniquement","Aucun JOIN"],0,"LEFT JOIN conserve toutes les lignes de la table de gauche.","Table à conserver → place-la à gauche du LEFT JOIN.");
sql3VF("sqlx3-left-2","sql-left-join","LEFT JOIN","Avec LEFT JOIN, les colonnes de la table droite peuvent valoir NULL quand aucune ligne ne correspond.",true,"C'est le comportement normal d'une jointure externe gauche.","Pas de correspondance côté droit → NULL.");
sql3Fill("sqlx3-left-3","sql-left-join","LEFT JOIN","Complète pour conserver tous les users.","FROM users u _____ JOIN orders o ON o.user_id = u.id",["LEFT"],"FROM users u LEFT JOIN orders o ON o.user_id = u.id","LEFT JOIN conserve users, la table de gauche.","LEFT JOIN = conservation du côté gauche.");
sql3Code("sqlx3-left-4","sql-left-join","LEFT JOIN","Trouve les utilisateurs qui n'ont jamais passé de commande.","SELECT name FROM users;",sql3Shape(["name"],1,sql3Rows([["Clara"]])),"SELECT u.name\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE o.id IS NULL;",{difficulty:3,hints:sql3Hints("Garde tous les utilisateurs avec LEFT JOIN.","Les utilisateurs sans commande auront des colonnes orders à NULL.","Filtre ensuite WHERE o.id IS NULL.")});

sql3Q("sqlx3-alias-1","sql-table-aliases","Alias","Pourquoi écrire o.id plutôt que seulement id après un JOIN ?",["Pour éviter l'ambiguïté entre plusieurs colonnes id","Pour convertir id en texte","Pour créer une clé primaire","Pour accélérer automatiquement la requête"],0,"Plusieurs tables possèdent id ; l'alias précise la source.","Qualifier une colonne = table.colonne.");
sql3VF("sqlx3-alias-2","sql-table-aliases","Alias","FROM users u donne à users l'alias u uniquement pour la requête en cours.",true,"L'alias n'altère pas le schéma.","Alias = nom temporaire dans la requête.");
sql3Fill("sqlx3-alias-3","sql-table-aliases","Alias","Complète la colonne qualifiée.","SELECT u.name, _____.total FROM users u JOIN orders o ON o.user_id=u.id",["o"],"SELECT u.name, o.total FROM users u JOIN orders o ON o.user_id=u.id","o est l'alias de orders.","Alias.colonne indique la source exacte.");
sql3Code("sqlx3-alias-4","sql-table-aliases","Alias","Retourne order_id, customer et total avec des alias explicites.","SELECT * FROM orders;",sql3Shape(["order_id","customer","total"],6,sql3Rows([[1,"Alice",120],[2,"Alice",60],[3,"Bob",35],[4,"David",200],[5,"David",80],[6,"Emma",50]])),"SELECT o.id AS order_id, u.name AS customer, o.total\nFROM orders AS o\nJOIN users AS u ON u.id = o.user_id\nORDER BY o.id;",{difficulty:2});

sql3Q("sqlx3-multi-1","sql-multiple-joins","JOIN multiples","Quelle table relie orders et products ?",["order_items","users","orders uniquement","Aucune"],0,"order_items contient order_id et product_id.","Le pont N:N est order_items.");
sql3VF("sqlx3-multi-2","sql-multiple-joins","JOIN multiples","Chaque JOIN supplémentaire doit avoir une condition ON adaptée à la relation ajoutée.",true,"Chaque relation du chemin a sa propre condition.","Un chemin relationnel se construit étape par étape.");
sql3Fill("sqlx3-multi-3","sql-multiple-joins","JOIN multiples","Complète le second JOIN.","JOIN order_items oi ON oi.order_id=o.id\nJOIN products p ON p.id = oi._____",["product_id"],"JOIN products p ON p.id = oi.product_id","order_items.product_id référence products.id.","Deuxième relation : product_id → products.id.");
sql3Code("sqlx3-multi-4","sql-multiple-joins","JOIN multiples","Affiche order_id, produit et quantité pour toutes les lignes de commande.","SELECT * FROM order_items;",sql3Shape(["order_id","product","quantity"],7,sql3Rows([[1,"Formation Node.js",1],[2,"Abonnement Pro",1],[3,"Livre SQL",2],[4,"Formation Node.js",1],[4,"Clavier",1],[5,"Clavier",1],[6,"Livre SQL",2]])),"SELECT o.id AS order_id, p.name AS product, oi.quantity\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nORDER BY o.id, oi.id;",{difficulty:3});

sql3Q("sqlx3-where-1","sql-join-where","JOIN + WHERE","Quelle clause doit exprimer 'commandes payées des clients de Paris' après avoir relié users et orders ?",["WHERE","ON uniquement","GROUP BY","LIMIT"],0,"Le JOIN décrit la relation ; WHERE filtre les lignes combinées selon le besoin métier.","Relation = ON ; filtre métier = WHERE.");
sql3VF("sqlx3-where-2","sql-join-where","JOIN + WHERE","WHERE peut filtrer des colonnes provenant de plusieurs tables déjà jointes.",true,"Une fois les tables jointes, leurs colonnes sont disponibles pour le filtre.","Le filtre s'applique au résultat relationnel construit.");
sql3Fill("sqlx3-where-3","sql-join-where","JOIN + WHERE","Complète le filtre.","WHERE u.city='Paris' _____ o.status='paid'",["AND"],"WHERE u.city='Paris' AND o.status='paid'","Les deux conditions doivent être vraies.","Combine les filtres métier avec AND quand ils sont tous obligatoires.");
sql3Code("sqlx3-where-4","sql-join-where","JOIN + WHERE","Liste les commandes payées des utilisateurs de Paris : name, total.","SELECT * FROM orders;",sql3Shape(["name","total"],4,sql3Rows([["Alice",120],["Alice",60],["David",200],["David",80]])),"SELECT u.name, o.total\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE u.city='Paris' AND o.status='paid'\nORDER BY o.id;",{difficulty:2});

sql3Q("sqlx3-group-1","sql-join-group","JOIN + GROUP BY","Pour compter les commandes de chaque utilisateur tout en gardant ceux qui n'en ont aucune, quelle combinaison est adaptée ?",["LEFT JOIN + GROUP BY","INNER JOIN uniquement","CROSS JOIN","DISTINCT uniquement"],0,"LEFT JOIN garde tous les utilisateurs ; GROUP BY permet ensuite de calculer par utilisateur.","LEFT JOIN + GROUP BY est très utile pour les indicateurs complets.");
sql3VF("sqlx3-group-2","sql-join-group","JOIN + GROUP BY","COUNT(o.id) vaut 0 pour un utilisateur sans commande dans ce LEFT JOIN.",true,"COUNT(expression) ignore les valeurs NULL.","COUNT(o.id) est souvent préférable à COUNT(*) après un LEFT JOIN.");
sql3Fill("sqlx3-group-3","sql-join-group","JOIN + GROUP BY","Complète l'agrégat.","SELECT u.name, _____(o.id) AS commandes",["COUNT"],"SELECT u.name, COUNT(o.id) AS commandes","COUNT(o.id) compte uniquement les commandes non NULL.","COUNT sur la colonne jointe permet d'obtenir 0 sans correspondance.");
sql3Code("sqlx3-group-4","sql-join-group","JOIN + GROUP BY","Retourne chaque utilisateur avec son nombre de commandes, y compris Clara avec 0.","SELECT name FROM users;",sql3Shape(["name","commandes"],5,sql3Rows([["Alice",2],["Bob",1],["Clara",0],["David",2],["Emma",1]])),"SELECT u.name, COUNT(o.id) AS commandes\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name\nORDER BY u.id;",{difficulty:3});

sql3Q("sqlx3-business-1","sql-business-joins","Requête métier","Pour savoir quels clients ont dépensé le plus, de quelles tables a-t-on besoin au minimum ?",["users + orders","products seulement","users seulement","order_items seulement"],0,"users fournit l'identité du client et orders les montants dépensés.","Choisis uniquement les tables nécessaires au résultat.");
sql3VF("sqlx3-business-2","sql-business-joins","Requête métier","Une requête métier multi-tables doit commencer par identifier le résultat attendu et le chemin relationnel.",true,"Cela évite les JOIN inutiles et les erreurs de grain.","Raisonnement d'abord, SQL ensuite.");
sql3Fill("sqlx3-business-3","sql-business-joins","Requête métier","Complète pour sommer les dépenses par client.","SELECT u.name, _____(o.total) AS depense",["SUM"],"SELECT u.name, SUM(o.total) AS depense","SUM additionne les montants des commandes regroupées par client.","Agrégation métier : SUM sur le montant.");
sql3Code("sqlx3-business-4","sql-business-joins","Requête métier","Classe les clients par dépenses payées décroissantes. Retourne customer et spent. Exclue les clients sans commande payée.","SELECT * FROM users;",sql3Shape(["customer","spent"],2,sql3Rows([["David",280],["Alice",180]])),"SELECT u.name AS customer, SUM(o.total) AS spent\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.status='paid'\nGROUP BY u.id, u.name\nHAVING SUM(o.total) >= 150\nORDER BY spent DESC;",{difficulty:3,hints:sql3Hints("Relie users et orders puis garde seulement les commandes paid.","Regroupe par utilisateur et calcule SUM(o.total).","Garde les clients à au moins 150 avec HAVING puis trie la somme décroissante.")});

SQL_EVALUATIONS[3]=[
{id:"sqleval-3-1",path:"sql",level:3,notion:"Clés",type:"qcm",difficulty:1,question:"Que référence orders.user_id ?",options:["users.id","orders.id","products.id","users.name"],answer:0,hints:[],explanation:"orders.user_id est la FK vers users.id.",retain:"FK → PK."},
{id:"sqleval-3-2",path:"sql",level:3,notion:"Relations",type:"qcm",difficulty:1,question:"Quel mécanisme modélise naturellement une relation N:N ?",options:["Une table d'association","Une seule FK arbitraire","SELECT DISTINCT","LIMIT"],answer:0,hints:[],explanation:"La table d'association porte les FKs des deux côtés.",retain:"N:N → table d'association."},
{id:"sqleval-3-3",path:"sql",level:3,notion:"INNER JOIN",type:"qcm",difficulty:2,question:"INNER JOIN garde…",options:["Seulement les correspondances","Toutes les lignes de gauche","Toutes les lignes des deux côtés quoi qu'il arrive","Uniquement les NULL"],answer:0,hints:[],explanation:"INNER JOIN élimine les lignes sans correspondance.",retain:"INNER = intersection relationnelle."},
{id:"sqleval-3-4",path:"sql",level:3,notion:"LEFT JOIN",type:"qcm",difficulty:2,question:"Pour chercher les utilisateurs sans commande, quelle stratégie est adaptée ?",options:["LEFT JOIN puis WHERE o.id IS NULL","INNER JOIN uniquement","GROUP BY sans JOIN","DISTINCT"],answer:0,hints:[],explanation:"LEFT JOIN conserve tous les users ; les absences donnent NULL.",retain:"LEFT JOIN révèle aussi les non-correspondances."},
{id:"sqleval-3-5",path:"sql",level:3,notion:"Alias",type:"qcm",difficulty:1,question:"Dans FROM users u, que représente u ?",options:["Un alias temporaire de users","Une nouvelle table","Une colonne","Une contrainte"],answer:0,hints:[],explanation:"u est un alias de table pour cette requête.",retain:"Alias = raccourci temporaire."},
{id:"sqleval-3-6",path:"sql",level:3,notion:"JOIN multiples",type:"qcm",difficulty:2,question:"Quel chemin relie orders à products dans le dataset ?",options:["orders → order_items → products","orders → users → products","orders → products directement","Aucun"],answer:0,hints:[],explanation:"order_items est la table d'association.",retain:"Suis le chemin des clés étrangères."},
{id:"sqleval-3-7",path:"sql",level:3,notion:"ON vs WHERE",type:"qcm",difficulty:2,question:"Où placer en priorité la relation o.user_id = u.id ?",options:["Dans ON","Dans LIMIT","Dans ORDER BY","Dans HAVING uniquement"],answer:0,hints:[],explanation:"ON décrit la relation entre tables.",retain:"ON = relation, WHERE = filtre métier."},
{id:"sqleval-3-8",path:"sql",level:3,notion:"COUNT",type:"qcm",difficulty:2,question:"Après un LEFT JOIN, pourquoi COUNT(o.id) est utile ?",options:["Il ignore les NULL et peut donner 0","Il transforme NULL en 1","Il supprime le JOIN","Il trie les commandes"],answer:0,hints:[],explanation:"COUNT(expression) ignore les NULL.",retain:"COUNT(colonne jointe) compte les correspondances réelles."},
{id:"sqleval-3-9",path:"sql",level:3,notion:"JOIN + GROUP BY",type:"qcm",difficulty:2,question:"Quel outil calcule le total dépensé par client après le JOIN ?",options:["SUM(o.total) + GROUP BY client","DISTINCT uniquement","LIMIT","ALTER TABLE"],answer:0,hints:[],explanation:"SUM agrège les montants au sein de chaque groupe client.",retain:"JOIN puis GROUP BY pour les indicateurs multi-tables."},
{id:"sqleval-3-10",path:"sql",level:3,notion:"Requête métier",type:"qcm",difficulty:3,question:"Quelle est la meilleure première étape avant une requête multi-tables complexe ?",options:["Définir le résultat attendu et le chemin relationnel","Ajouter tous les JOIN disponibles","Écrire SELECT * partout","Créer un index"],answer:0,hints:[],explanation:"Le grain du résultat et les relations déterminent la requête.",retain:"Raisonnement métier avant syntaxe."}
];

SQL_PROJECTS.push({
  id:"sql-ecommerce-relations",level:3,title:"Analyse e-commerce multi-tables",
  description:"Combine utilisateurs, commandes, lignes de commande et produits pour produire une analyse métier.",
  brief:"Analyse uniquement les commandes paid. Retourne customer, orders_count, items_count et spent pour chaque client ayant au moins une commande payée. Trie du plus gros montant dépensé au plus faible. Attention : le JOIN avec order_items duplique une commande qui contient plusieurs produits ; tes agrégats doivent rester corrects.",
  setup:SQL_RELATIONS_SETUP,
  query:"SELECT * FROM users;",
  solution:"SELECT\n  u.name AS customer,\n  COUNT(DISTINCT o.id) AS orders_count,\n  SUM(oi.quantity) AS items_count,\n  SUM(oi.quantity * p.price) AS spent\nFROM users u\nJOIN orders o ON o.user_id = u.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'paid'\nGROUP BY u.id, u.name\nORDER BY spent DESC;",
  validate:sql3Shape(["customer","orders_count","items_count","spent"],2,(r)=>{const got=r.values.map(row=>[String(row[0]),Number(row[1]),Number(row[2]),Number(row[3])]);const expected=[["David",2,3,280],["Alice",2,2,180]];return JSON.stringify(got)===JSON.stringify(expected)?[]:["Le résultat attendu est David (2 commandes, 3 articles, 280) puis Alice (2 commandes, 2 articles, 180)."]; }),
  retain:"Dans une analyse multi-tables, surveille toujours le grain du résultat. Un JOIN vers une table 1:N peut multiplier les lignes : COUNT(DISTINCT ...) et des agrégats calculés au bon niveau évitent les doubles comptages."
});

Object.assign(SQL_STUDIO_PRESETS,{
  "sql-keys":{setup:SQL_RELATIONS_SETUP,query:"SELECT o.id AS order_id, u.name\nFROM orders o\nJOIN users u ON u.id=o.user_id\nORDER BY o.id;",guide:"Observe les PK/FK puis relie orders.user_id à users.id."},
  "sql-relations":{setup:SQL_RELATIONS_SETUP,query:"SELECT oi.order_id, oi.product_id, oi.quantity FROM order_items oi;",guide:"Inspecte order_items : cette table fait le pont entre orders et products."},
  "sql-inner":{setup:SQL_RELATIONS_SETUP,query:"SELECT u.name, o.id AS order_id\nFROM users u\nINNER JOIN orders o ON o.user_id=u.id\nORDER BY o.id;",guide:"Observe quels utilisateurs disparaissent quand aucune commande ne correspond."},
  "sql-left":{setup:SQL_RELATIONS_SETUP,query:"SELECT u.name, o.id AS order_id\nFROM users u\nLEFT JOIN orders o ON o.user_id=u.id\nORDER BY u.id, o.id;",guide:"Compare ce résultat avec INNER JOIN et repère Clara avec une valeur NULL."},
  "sql-alias-join":{setup:SQL_RELATIONS_SETUP,query:"SELECT u.name AS customer, o.id AS order_id, o.total\nFROM users u\nJOIN orders o ON o.user_id=u.id;",guide:"Utilise les alias pour qualifier les colonnes communes comme id."},
  "sql-multi-join":{setup:SQL_RELATIONS_SETUP,query:"SELECT o.id, p.name, oi.quantity\nFROM orders o\nJOIN order_items oi ON oi.order_id=o.id\nJOIN products p ON p.id=oi.product_id;",guide:"Suis le chemin orders → order_items → products."},
  "sql-join-where":{setup:SQL_RELATIONS_SETUP,query:"SELECT u.name, o.total\nFROM users u\nJOIN orders o ON o.user_id=u.id\nWHERE u.city='Paris' AND o.status='paid';",guide:"ON décrit la relation ; WHERE filtre ensuite selon le besoin métier."},
  "sql-join-group":{setup:SQL_RELATIONS_SETUP,query:"SELECT u.name, COUNT(o.id) AS commandes\nFROM users u\nLEFT JOIN orders o ON o.user_id=u.id\nGROUP BY u.id,u.name\nORDER BY u.id;",guide:"Observe pourquoi COUNT(o.id) donne 0 pour Clara."},
  "sql-business-joins":{setup:SQL_RELATIONS_SETUP,query:"SELECT u.name AS customer, SUM(o.total) AS spent\nFROM users u\nJOIN orders o ON o.user_id=u.id\nWHERE o.status='paid'\nGROUP BY u.id,u.name\nORDER BY spent DESC;",guide:"Pars de la question métier, puis identifie tables, relation, filtre et agrégat."}
});
