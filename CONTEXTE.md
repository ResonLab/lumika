# CONTEXTE — Lumika

> **À lire en premier si tu reprends ce projet, IA ou humain.**
> La vue d'ensemble des applications est dans [../LISEZ-MOI.md](../LISEZ-MOI.md).
> Ce fichier-ci ne concerne que Lumika.

**État au 12 août 2026 — six écrans, bilingue, 0.1.0 publiée.**

Le plan de feu d'un théâtre : les perches, l'inventaire, les appareils posés, et
le patch — **circuit de gradateur pour le traditionnel, adresse DMX pour le
reste**.

```bash
cd Lumika && npm install && npm run dev
cd Lumika && npm run verifier   # typecheck + 7 suites
```

| Écran | Ce qu'il fait |
|---|---|
| **Plan de feu** | les appareils posés, leur perche, leur position latérale, leur patch, leur gélatine |
| **Perches** | les barres, et **une vue de face du gril** avec les appareils à leur place |
| **Patch** | les blocs de gradateurs, ce qui occupe l'univers DMX, les chevauchements, les plages libres, et une proposition de répartition |
| **Inventaire** | projecteurs, **lampes**, accessoires, avec seuil d'alerte |
| **Scène** | le plateau vu du dessus, les perches à leur distance |
| **Feuille de patch** | triée par patch, imprimable — le document qu'on emporte au montage |

---

## 1. Pourquoi une quatrième application, et pas un module de Scenika

Scenika gère **le parc d'une société de location** : ce qu'on possède, ce qui
est sorti, ce que ça consomme. Lumika gère **le plan de feu d'un lieu** : ce qui
est accroché où, sur quelle perche, à quel circuit.

Ce ne sont pas les mêmes objets ni le même métier. Le régisseur d'un théâtre
n'a rien à louer ; le loueur n'a pas de perches. Et l'argument de vente de
chaque application de la maison est sa simplicité : greffer les perches sur
Scenika la détruirait, exactement comme un calculateur DMX détruirait Ohmnia.

**Ce que Lumika ne fait pas et ne fera pas** : la conduite. Écrire les mémoires,
les séquences, les temps de transfert, c'est le travail d'une console — et
personne n'a besoin d'une deuxième console qui ne pilote rien.

---

## 2. La distinction qui structure tout : trad ou DMX

C'est **la** décision de conception, et elle n'existe nulle part ailleurs dans
la maison.

| | Traditionnel | DMX |
|---|---|---|
| Ce que c'est | une lampe halogène et rien d'autre | LED, asservi, machine à effet |
| Comment on l'allume | un **circuit de gradateur** | sa propre **adresse DMX** |
| Ce qui le limite | la puissance du circuit | le nombre de canaux qu'il occupe |
| Partage | plusieurs appareils par circuit | jamais : les plages ne se croisent pas |

**Un appareil ne peut pas porter les deux.** Ce n'est pas une coquetterie de
schéma : un appareil qui a un circuit *et* une adresse est un appareil dont
personne ne sait comment on l'allume. Le régisseur monte le circuit, rien ne
vient, et il cherche vingt minutes. Le refus est explicite et nommé.

### Le piège que cette application existe pour éviter

**Un bloc de gradateurs occupe lui-même des canaux DMX** — autant qu'il a de
circuits, à partir de son adresse. Un bloc de 24 circuits adressé en 1 occupe
les canaux 1 à 24.

Y poser une barre LED en 12 marche **parfaitement sur le papier** : ce sont deux
appareils différents, dans deux écrans différents. Sur le plateau, la barre
allume des circuits au hasard. Et on ne s'en aperçoit qu'une fois tout accroché.

D'où `controlerPatch()`, qui compare gradateurs et appareils DMX **dans le même
espace**. Les vérifier séparément aurait laissé passer exactement ce cas — et
la vérification aurait continué d'afficher OK.

---

## 3. Où vit le calcul

`commun/patch.js` : occupation des canaux, chevauchements, plages libres,
répartition sur les circuits. **Aucune dépendance** — ni interface, ni base, ni
Electron. Il tourne dans l'application, dans les tests, et dans un navigateur le
jour où une page publique en aura besoin.

**Écrit en JavaScript, types en JSDoc**, comme `commun/dmx.js` de Scenika et
`commun/acoustique.js` d'Acustika, et pour la même raison.

**Les refus sont des clés, pas des phrases** : le module ne sait pas quelle
langue la fenêtre affiche. Quand le message cite une valeur, la clé et la valeur
voyagent ensemble en JSON.

### La règle de répartition, et pourquoi elle est simple exprès

Le plus gourmand d'abord, puis le premier circuit qui l'accepte. Reprise de
Scenika. **Un régisseur doit pouvoir la refaire de tête sur le plateau**, parce
que c'est à la main qu'il branche. Un algorithme plus fin gagnerait parfois un
circuit et deviendrait invérifiable à l'œil.

Une **marge de 10 %** est retirée de chaque circuit : une lampe halogène tire un
fort appel de courant à l'allumage, et un circuit chargé à 100 % déclenche au
premier plein feu. C'est une pratique de terrain, pas une norme, et l'écran le
dit. **Ce calcul n'est pas un contrôle électrique** — il ignore la section des
câbles, l'état du bloc et la simultanéité réelle.

Un appareil plus gourmand qu'un circuit entier est **refusé et nommé**, jamais
casé de force.

### Deux pièges attrapés en écrivant les tests

**Un test qui ne pouvait pas échouer.** Le premier cas de la règle « le plus
gourmand d'abord » — 500, 500 et 1500 W sur deux circuits — passait dans les
deux sens de tri. Il ne prouvait donc rien. Le cas retenu discrimine : 1080,
900, 900 et 720 W sur deux circuits de 1800 W utiles. En décroissant tout
rentre ; en croissant, le 1080 n'entre plus nulle part alors qu'une place
existe.

**Une fonction inatteignable depuis l'écran.** `appliquerRepartition` était
écrite, exposée par le pont, et aucun bouton ne l'appelait. C'est le contrôle
des traductions qui l'a signalée, en trouvant la clé `patch.appliquer` déclarée
et jamais employée. Une relecture ne voit pas ce genre de chose.

Sept sabotages sur `commun/patch.js`, tous attrapés.

---


## Le guide de prise en main

**Le site disait ce que fait l'application et ce qu'elle ne fait pas. Il ne
disait nulle part par où commencer.** Quelqu'un qui télécharge se retrouve
devant une application vide sans savoir quoi cliquer, et c'est là qu'on perd
les gens — pas à la page d'accueil.

`src/partage/guide.ts` porte le texte dans les deux langues et **nulle part ailleurs** :
`scripts/publier-guide.mjs` en déduit `docs/guide.html` et `docs/en/guide.html`,
`scripts/guide-pdf.mjs` en tire les deux PDF joints aux releases. Un guide
recopié à la main divergerait au premier correctif — et c'est le document qu'on
emporte, donc celui qu'on croit.

**L'ordre des étapes n'est pas décoratif** : c'est celui dans lequel
l'application ne refuse rien. `tests/coherence-guide.mjs` le vérifie, en plus de
refuser qu'une page diverge de la source, qu'une traduction soit vide, ou qu'une
étape perde son **piège**. Les pièges sont la moitié de la valeur : ce sont les
choses qu'on ne devine pas et qui coûtent une soirée.

```bash
npm run guide:publier   # les deux pages
npm run guide:pdf       # les deux PDF, dans release/
```

**Trois défauts de ce mécanisme, trouvés en le portant d'une application à
l'autre**, et corrigés dans les quatre dépôts :

· un seuil de longueur prenait « Receipts » et « Backups » — des titres anglais
  parfaitement traduits — pour des traductions vides. On teste désormais le
  vide, pas la longueur. **Un faux échec use un contrôle aussi sûrement qu'un
  faux succès** ;
· le caractère `&` s'écrit `&amp;` en HTML : le contrôle annonçait un texte
  disparu alors que la page était juste ;
· une liste figée d'ancres à réécrire laissait des ancres mortes sur le guide,
  les sections d'une page d'accueil ne portant pas les mêmes noms d'une
  application à l'autre. Toutes les ancres renvoient maintenant à l'accueil.

**Le PDF a révélé un bug qui traînait dans la maison depuis des semaines** :
« `fabriquer-icones.mjs` échoue au-delà de la première image ». Ce n'est ni le
chemin ni le fichier temporaire — **créer une seconde `BrowserWindow` après
avoir travaillé dans la première fait échouer son chargement** sur `ERR_FAILED`.
Une seule fenêtre réutilisée, et les deux PDF sortent. *Une hypothèse a été
suivie puis abandonnée, et elle est notée dans le code : `loadFile` produit bien
sous Windows une adresse mêlant `file:///` et des antislashs. C'est vrai, c'est
corrigé, et ça n'a rien changé.*

---

## 3 bis. Le référentiel de gélatines — fait le 13 août 2026

`commun/gelatines.js` reconnaît les références courantes — Lee et Rosco — et
rend une **couleur approchée**. Le plan de feu propose la liste à la saisie et
affiche une pastille ; la feuille de patch affiche la pastille aussi.

**La décision qui structure ce fichier : le champ reste libre.** Un théâtre a
toujours dans ses tiroirs une gélatine hors catalogue — un fabricant qu'on n'a
pas prévu, un reste d'une production précédente, un morceau de diffusion coupé à
la main. Une liste fermée obligerait le régisseur à mentir sur son plan, **et un
plan qui ment ne sert plus à rien**. Le module ne valide donc rien : il
reconnaît ce qu'il peut, le reste passe tel quel.

**Trois choix qui se défendent :**

- **la liste est volontairement courte.** Les catalogues comptent des centaines
  de références ; en recopier trois cents dont personne n'utilise deux cent
  cinquante ne rend pas la saisie plus rapide, ça la noie ;
- **une saisie inconnue ne rend aucune couleur**, jamais une couleur par défaut.
  Une pastille grise se confondrait avec une diffusion neutre, et le régisseur
  croirait sa saisie reconnue ;
- **la couleur est approchée, et l'écran le dit.** Un écran émet, une gélatine
  filtre : la même référence rend autrement selon la lampe et l'intensité. La
  pastille sert à repérer un rose là où on attendait un bleu, pas à juger d'une
  teinte.

La saisie est tolérante — « L201 », « l 201 », « LEE201 » et « 201 » mènent au
même endroit — parce qu'un régisseur qui tape vite ne doit pas être puni pour
cela. Un numéro nu est ambigu (`114` existe chez les deux fabricants) : on rend
le premier, et la suggestion de saisie propose la référence complète.

Vingt cas, **cinq sabotages, cinq échecs**. Plusieurs existent uniquement pour
vérifier qu'une saisie inconnue **passe** au lieu d'être corrigée de force.

---

## 4. Structure

```
commun/patch.js         le calcul, sans dépendance
src/
  main/
    index.ts            fenêtre, enregistrement des modules IPC
    contexte.ts         où vivent les données
    db/schema.sql       SOURCE DE VÉRITÉ du schéma
    db/database.ts      ouverture, PRAGMA, transactions, checkpoint WAL
    db/migrations.ts    ajout de colonnes, jamais de suppression
    domaines/           la logique métier, sans Electron
    ipc/                le branchement sur la fenêtre, rien d'autre
  partage/              types.ts, i18n.ts
  preload/index.ts      le pont sécurisé
  renderer/src/pages/   les six écrans
tests/                  7 suites — `npm run verifier`
```

**La couche base ne connaît ni Electron ni l'empaqueteur.** Le schéma arrive en
paramètre de `ouvrirBaseDeDonnees()`. Il était importé par
`from './schema.sql?raw'`, une syntaxe que seul l'empaqueteur comprend : la
couche devenait impossible à charger depuis Node, donc impossible à éprouver
sans lancer une fenêtre. C'est la fenêtre qui lit le fichier et le passe.

C'est ce qui permet à `tests/application.mjs` d'exercer **les vrais domaines sur
une vraie base temporaire** — Node 24 dépouille les types, et les imports
internes portent leur extension `.ts`. Même procédé que Nexika.

---

## 5. Ce qui reste à faire

> **Cette section mentait, et elle a été corrigée le 13 août 2026.** Elle
> annonçait encore « aucune release, aucun site, pas de conditions, pas de plan
> de scène, pas de feuille de patch » alors que l'en-tête du même fichier disait
> « six écrans, bilingue, 0.1.0 publiée ». Les deux se contredisaient à trois
> pages d'écart. *Une documentation non vérifiée dérive* — et sa forme la moins
> soupçonnée est celle-ci : annoncer comme à faire du travail déjà fait, ce qui
> pousse à le refaire.

**Fait depuis** : le dépôt `ResonLab/lumika`, le site bilingue, les conditions
d'utilisation avec écran d'acceptation, le plan de scène vu du dessus, la
feuille de patch imprimable, le guide de prise en main en page et en PDF, et la
**0.1.0 publiée** pour Windows et Linux.

**Reste vraiment :**

- **Aucun installateur n'a été installé ni lancé sur une machine réelle.** Ils
  se construisent et passent les suites, c'est tout ce qui est prouvé, et la
  note de release le dit. Réserve commune aux quatre applications.
- **Les installateurs ne sont pas signés** : Windows affiche un avertissement
  SmartScreen.
- **Pas de multi-postes.** Un théâtre a un régisseur et des techniciens ; Nexika
  pourrait servir ici comme il sert Ohmnia et Scenika. À décider, pas à faire
  par réflexe.
- **Le module DMX est proche de celui de Scenika — et il reste tel quel, c'est
  une décision, pas un oubli.** Un premier jet de cette page réclamait d'en
  faire un paquet partagé « avant que les deux ne se contredisent ». L'examen a
  conclu l'inverse, et le LISEZ-MOI porte la décision : le recouvrement réel est
  d'une soixantaine de lignes d'arithmétique stable — 512 canaux, une plage
  contiguë, un chevauchement, les trous — et un cinquième dépôt se paierait à
  chaque correctif, npm gardant le clone git dans `node_modules`. **Extraire le
  jour où un troisième consommateur apparaît, ou si une divergence mord.**

  Le point à surveiller, si l'un des deux bouge : **la borne du chevauchement
  est inclusive des deux côtés** — un chevauchement d'un seul canal en est un.

---

## 6. Règles héritées, à ne pas relâcher

1. **Une formule = un seul endroit** : `commun/patch.js`.
2. **Tout en français** : code, commentaires, noms de colonnes SQL.
3. **Messages d'erreur en français, précis** — jamais un message technique brut.
   Le processus principal renvoie des **clés**, jamais des phrases.
4. **Ne jamais supprimer la base pour appliquer un changement de schéma.**
   Migrations qui ajoutent, jamais qui détruisent.
5. **Opération sur plusieurs tables → une transaction.**
6. **Copier le fichier de base → vider le journal WAL d'abord.**
7. **Casser volontairement chaque nouveau contrôle** avant de le croire.
8. **Lancer réellement l'application** : un typecheck vert ne dit pas qu'elle
   démarre. Vérifié ici — base créée, quatre tables, intégrité `ok`.
9. **Vérifier avant de livrer**, et dire honnêtement ce qui n'a pas pu l'être.
