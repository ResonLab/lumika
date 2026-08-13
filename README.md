# Lumika

**Le plan de feu d'un théâtre** : les perches, l'inventaire, les appareils
posés, et le patch — circuit de gradateur pour le traditionnel, adresse DMX
pour le reste.

Une application de [ResonLab](https://resonlab.github.io). Vos données restent
sur votre machine : pas de compte, pas d'abonnement, aucune connexion.

```bash
npm install
npm run dev        # lance l'application
npm run verifier   # typecheck + 7 suites de tests
```

## Ce qu'elle fait

- **Plan de feu** — chaque appareil avec son numéro, sa perche, sa position
  latérale, sa gélatine et sa fonction.
- **Perches** — la vue de face du gril : deux appareils trop proches, ça se voit
  d'un coup d'œil et jamais dans une colonne de nombres.
- **Patch** — les blocs de gradateurs, ce qui occupe l'univers DMX, **les
  chevauchements**, les plages restées libres, et une proposition de
  répartition des projecteurs traditionnels sur les circuits.
- **Inventaire** — projecteurs, lampes et accessoires, avec un seuil d'alerte.
  Une lampe qui claque la veille de la générale, sans rechange du bon culot,
  c'est un projecteur mort pour toute la série.

## Le piège qu'elle existe pour éviter

**Un bloc de gradateurs occupe lui-même des canaux DMX** — autant qu'il a de
circuits, à partir de son adresse. Un bloc de 24 adressé en 1 occupe les canaux
1 à 24.

Y poser une barre LED en 12 marche parfaitement sur le papier : ce sont deux
appareils différents. Sur le plateau, la barre allume des circuits au hasard, et
on ne s'en aperçoit qu'une fois tout accroché.

## Ce qu'elle ne fait pas

**La conduite.** Les mémoires, les séquences, les temps de transfert, c'est le
travail d'une console — personne n'a besoin d'une deuxième console qui ne pilote
rien.

**Le calcul de puissance n'est pas un contrôle électrique.** Il ignore la
section des câbles, l'état du bloc et la simultanéité réelle. La marge de 10 %
appliquée à chaque circuit est une pratique de terrain, pas une norme. Le
raccordement relève d'un électricien.

## État

Jamais publiée : l'application se construit et se lance, elle n'a pas été
empaquetée ni installée sur une machine réelle. Voir [CONTEXTE.md](CONTEXTE.md)
pour ce qui reste à faire.

Licence MIT.

## Les applications de la maison

Cinq programmes, cinq publics, une seule façon de travailler : vos données
restent sur votre machine.

- [Ohmnia](https://github.com/ResonLab/ohmnia) — gestion pour indépendant : facturation, devis, suivi du temps, inventaire
- [Scenika](https://github.com/ResonLab/scenika) — parc son et lumière, locations, puissance, adressage DMX
- [Acustika](https://github.com/ResonLab/acustika) — simulation acoustique : couverture d'enceintes dans une salle
- **Lumika** — plan de feu de théâtre : perches, patch, feuille imprimable *(vous y êtes)*
- [Nexika](https://github.com/ResonLab/nexika) — le serveur multi-postes, commun à Ohmnia et Scenika

Tout est présenté sur [resonlab.github.io](https://resonlab.github.io).
