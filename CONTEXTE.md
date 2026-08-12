# CONTEXTE — Lumika

> **À lire en premier si tu reprends ce projet, IA ou humain.**
> La vue d'ensemble des applications est dans [../LISEZ-MOI.md](../LISEZ-MOI.md).
> Ce fichier-ci ne concerne que Lumika.

**État au 12 août 2026 — quatre écrans, bilingue, jamais publiée.**

Le plan de feu d'un théâtre : les perches, l'inventaire, les appareils posés, et
le patch — **circuit de gradateur pour le traditionnel, adresse DMX pour le
reste**.

```bash
cd Lumika && npm install && npm run dev
cd Lumika && npm run verifier   # typecheck + 3 suites
```

| Écran | Ce qu'il fait |
|---|---|
| **Plan de feu** | les appareils posés, leur perche, leur position latérale, leur patch, leur gélatine |
| **Perches** | les barres, et **une vue de face du gril** avec les appareils à leur place |
| **Patch** | les blocs de gradateurs, ce qui occupe l'univers DMX, les chevauchements, les plages libres, et une proposition de répartition |
| **Inventaire** | projecteurs, **lampes**, accessoires, avec seuil d'alerte |

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
  renderer/src/pages/   les quatre écrans
tests/                  3 suites — `npm run verifier`
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

- **Aucune release, aucun site.** L'application se construit et se lance ; elle
  n'a jamais été empaquetée ni installée sur une machine réelle.
- **Le dépôt GitHub n'existe pas encore** — à créer dans l'organisation
  ResonLab, comme les quatre autres.
- **Pas de conditions d'utilisation**, alors que le calcul de puissance en
  demande : c'est le même risque électrique que Scenika. Reprendre
  `Scenika/src/partage/conditions.ts` + `scripts/publier-conditions.mjs` +
  `tests/coherence-conditions.mjs`.
- **Pas de plan de scène dessiné.** La vue des perches est une vue de face du
  gril ; une vue du dessus, avec la scène et les perches à leur distance,
  reste à faire. C'est ce qu'un régisseur imprime.
- **Pas de feuille de patch imprimable.** C'est le document qu'on emporte au
  montage, et c'est probablement la fonction la plus utile qui manque.
- **Pas de multi-postes.** Un théâtre a un régisseur et des techniciens ; Nexika
  pourrait servir ici comme il sert Ohmnia et Scenika. À décider, pas à faire
  par réflexe.
- **Le module DMX est proche de celui de Scenika.** `commun/patch.js` et
  `Scenika/commun/dmx.js` traitent tous deux le chevauchement dans un univers.
  Ils divergeront. **La bonne réponse est celle qu'on a déjà appliquée à
  Nexika** : en faire un paquet partagé. À faire avant que les deux ne se
  contredisent.

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
