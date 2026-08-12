import {
  canauxDuGradateur,
  canauxDuProjecteur,
  capaciteUtile,
  CAPACITE_CIRCUIT_DEFAUT,
  controlerPatch,
  MARGE_CIRCUIT,
  plagesLibres,
  repartirSurCircuits,
  TAILLE_UNIVERS
} from '../commun/patch.js'

/**
 * Le patch : gradateurs pour le trad, DMX pour le reste.
 *
 * Chaque valeur attendue est calculée à part et écrite ici en clair. Le seul
 * contrôle qui compte vraiment est celui du **chevauchement entre un bloc de
 * puissance et un projecteur DMX** : c'est l'erreur de montage classique, celle
 * qui marche sur le papier et allume des circuits au hasard sur le plateau.
 */

let echecs = 0
const ok = (m) => console.log(`  OK   ${m}`)
const echec = (m) => {
  console.log(`  ÉCHEC : ${m}`)
  echecs += 1
}
const verifier = (c, m) => (c ? ok(m) : echec(m))

function leve(appel) {
  try {
    appel()
    return null
  } catch (e) {
    try {
      return JSON.parse(e.message).cle
    } catch {
      return e.message
    }
  }
}

console.log('\n=== Un univers fait 512 canaux, et un circuit vaut un canal ===')

verifier(TAILLE_UNIVERS === 512, 'un univers DMX contient 512 canaux')

// Un bloc de 24 circuits adressé en 1 occupe 1 à 24. C'est toute la formule,
// et c'est celle qu'on oublie.
const bloc = { nom: 'Bloc A', adresseDmx: 1, circuits: 24 }
const plageBloc = canauxDuGradateur(bloc)
verifier(plageBloc.debut === 1 && plageBloc.fin === 24, 'un bloc de 24 en 1 occupe 1 à 24')

// Adressé en 100, il occupe 100 à 123.
const bloc2 = canauxDuGradateur({ nom: 'Bloc B', adresseDmx: 100, circuits: 24 })
verifier(bloc2.debut === 100 && bloc2.fin === 123, 'un bloc de 24 en 100 occupe 100 à 123')

// Un bloc qui déborde la fin de l'univers est refusé, avec la dernière adresse
// possible : refuser sans dire où aller ne sert à rien sur un plateau.
const debordement = leve(() => canauxDuGradateur({ nom: 'Bloc C', adresseDmx: 500, circuits: 24 }))
verifier(debordement === 'patch.gradateurDepasse', 'un bloc qui déborde 512 est refusé')

console.log('\n=== Le chevauchement bloc / projecteur : LE contrôle ===')

// **L'erreur classique.** Une barre LED de 8 canaux posée en 12, alors que le
// bloc A occupe 1 à 24. Sur le papier tout va bien : ce sont deux appareils
// différents. Sur le plateau, la barre allume les circuits 12 à 19.
const conflit = controlerPatch(
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 24 }],
  [{ nom: 'Barre LED', adresseDmx: 12, canaux: 8 }]
)
verifier(conflit.conflits.length === 1, 'une LED posée dans la plage d’un bloc est signalée')
verifier(
  conflit.conflits[0]?.premier.genre === 'gradateur' &&
    conflit.conflits[0]?.second.genre === 'projecteur',
  'le conflit nomme le bloc et le projecteur, pas juste « deux plages »'
)

// Juste après le bloc : aucun conflit. La borne compte.
const propre = controlerPatch(
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 24 }],
  [{ nom: 'Barre LED', adresseDmx: 25, canaux: 8 }]
)
verifier(propre.conflits.length === 0, 'posée en 25, juste après le bloc, elle passe')

// Juste avant la fin du bloc : conflit d'un seul canal, et il compte autant.
const limite = controlerPatch(
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 24 }],
  [{ nom: 'Barre LED', adresseDmx: 24, canaux: 8 }]
)
verifier(limite.conflits.length === 1, 'un chevauchement d’un seul canal est un chevauchement')

// Deux projecteurs entre eux.
const entreEux = controlerPatch(
  [],
  [
    { nom: 'Lyre 1', adresseDmx: 100, canaux: 16 },
    { nom: 'Lyre 2', adresseDmx: 110, canaux: 16 }
  ]
)
verifier(entreEux.conflits.length === 1, 'deux projecteurs qui se croisent sont signalés')

// Deux blocs entre eux.
const deuxBlocs = controlerPatch(
  [
    { nom: 'Bloc A', adresseDmx: 1, circuits: 24 },
    { nom: 'Bloc B', adresseDmx: 20, circuits: 24 }
  ],
  []
)
verifier(deuxBlocs.conflits.length === 1, 'deux blocs qui se croisent sont signalés')

// Deux univers différents ne se gênent pas : c'est la raison d'être d'un
// second univers, et confondre les deux inventerait des conflits.
const deuxUnivers = controlerPatch(
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 24, univers: 1 }],
  [{ nom: 'Barre LED', adresseDmx: 12, canaux: 8, univers: 2 }]
)
verifier(deuxUnivers.conflits.length === 0, 'deux univers différents ne se chevauchent pas')

console.log('\n=== Les plages libres répondent à « où puis-je encore poser ? » ===')

const { plages } = controlerPatch(
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 24 }],
  [{ nom: 'Lyre', adresseDmx: 50, canaux: 16 }]
)
const libres = plagesLibres(plages)
// Occupé : 1–24 et 50–65. Libre : 25–49 et 66–512.
verifier(libres.length === 2, 'deux trous entre les appareils posés')
verifier(libres[0].debut === 25 && libres[0].fin === 49, 'le premier trou va de 25 à 49')
verifier(libres[1].debut === 66 && libres[1].fin === 512, 'le second va de 66 à 512')

// Rien de posé : tout est libre, d'un bloc.
const toutLibre = plagesLibres([])
verifier(
  toutLibre.length === 1 && toutLibre[0].debut === 1 && toutLibre[0].fin === 512,
  'un univers vide est libre de 1 à 512'
)

console.log('\n=== La marge d’un circuit est une pratique, pas une norme ===')

// 2000 W à 10 % de marge : 1800 W admis.
verifier(CAPACITE_CIRCUIT_DEFAUT === 2000, 'un circuit vaut 2 kW par défaut')
verifier(MARGE_CIRCUIT === 0.1, 'la marge est de 10 %')
verifier(capaciteUtile(2000) === 1800, '2000 W à 10 % de marge donnent 1800 W admis')
verifier(capaciteUtile(3000, 0.2) === 2400, '3000 W à 20 % donnent 2400 W')

console.log('\n=== La répartition : le plus gourmand d’abord ===')

// Un bloc de 3 circuits à 2 kW, donc 1800 W utiles chacun.
// Trois PC de 1000 W : un par circuit, pas deux sur le même (2000 > 1800).
const trois = repartirSurCircuits(
  [
    { nom: 'PC 1', puissance: 1000 },
    { nom: 'PC 2', puissance: 1000 },
    { nom: 'PC 3', puissance: 1000 }
  ],
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 3 }]
)
verifier(trois.refuses.length === 0, 'trois PC de 1000 W trouvent tous une place')
verifier(
  trois.circuits.filter((c) => c.projecteurs.length > 0).length === 3,
  'ils occupent trois circuits : 2000 W ne tiennent pas dans 1800 W utiles'
)

// Deux découpes de 500 W tiennent ensemble : 1000 W sous 1800 W.
const deux = repartirSurCircuits(
  [
    { nom: 'Découpe 1', puissance: 500 },
    { nom: 'Découpe 2', puissance: 500 }
  ],
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 3 }]
)
verifier(
  deux.circuits[0].projecteurs.length === 2,
  'deux découpes de 500 W partagent le même circuit'
)

// **Un projecteur plus gourmand qu'un circuit est refusé et nommé.** Le caser
// de force ferait déclencher le circuit au premier plein feu.
const gourmand = repartirSurCircuits(
  [{ nom: 'Cyclo 2500', puissance: 2500 }],
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 3 }]
)
verifier(gourmand.refuses.length === 1, 'un projecteur trop gourmand est refusé')
verifier(gourmand.refuses[0].nom === 'Cyclo 2500', 'le refus le nomme, il ne dit pas « un appareil »')

/**
 * Le plus gourmand d'abord — et ce cas-ci est choisi pour **discriminer**.
 *
 * Premier jet de ce test : 500, 500 et 1500 W sur deux circuits. Il passait
 * dans les deux sens de tri, donc il ne prouvait rien — le sabotage « trier en
 * croissant » ne le faisait pas broncher. Un test qui ne peut pas échouer est
 * pire qu'un test absent, parce qu'on lui fait confiance.
 *
 * Deux circuits de 2 kW, soit 1800 W utiles chacun, et quatre projecteurs :
 * 1080, 900, 900, 720 W. Total 3600 W, exactement les deux circuits.
 *
 * · décroissant : 1080 → C1. 900 → C2. 900 → C2 (1800). 720 → C1 (1800). Tout passe.
 * · croissant   : 720 → C1. 900 → C1 (1620). 900 → C2. 1080 n'entre plus nulle
 *   part — ni dans C1 (2700), ni dans C2 (1980). Un projecteur refusé alors
 *   qu'une place existe.
 */
const ordre = repartirSurCircuits(
  [
    { nom: 'Cyclo', puissance: 1080 },
    { nom: 'PC 1', puissance: 900 },
    { nom: 'PC 2', puissance: 900 },
    { nom: 'Découpe', puissance: 720 }
  ],
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 2 }]
)
verifier(
  ordre.refuses.length === 0,
  'le tri décroissant fait tenir les quatre là où le croissant en refuse un'
)
verifier(
  ordre.circuits.every((c) => c.charge <= c.utile),
  'et aucun circuit n’est chargé au-delà de sa capacité utile'
)

console.log('\n=== Un patch fait à la main n’est pas refait dans le dos ===')

// Le régisseur a posé le PC 1 sur le circuit 3 : il y reste.
const impose = repartirSurCircuits(
  [
    { nom: 'PC 1', puissance: 1000, gradateur: 'Bloc A', circuit: 3 },
    { nom: 'PC 2', puissance: 1000 }
  ],
  [{ nom: 'Bloc A', adresseDmx: 1, circuits: 3 }]
)
const circuit3 = impose.circuits.find((c) => c.numero === 3)
verifier(circuit3?.projecteurs.includes('PC 1'), 'un projecteur déjà placé garde son circuit')
verifier(
  impose.circuits.find((c) => c.numero === 1)?.projecteurs.includes('PC 2'),
  'les autres se placent autour'
)

const inconnu = leve(() =>
  repartirSurCircuits(
    [{ nom: 'PC 1', puissance: 1000, gradateur: 'Bloc Z', circuit: 1 }],
    [{ nom: 'Bloc A', adresseDmx: 1, circuits: 3 }]
  )
)
verifier(inconnu === 'patch.circuitInconnu', 'un circuit qui n’existe pas est signalé, pas ignoré')

console.log('\n=== Les saisies absurdes sont refusées, pas calculées ===')

for (const [nom, appel, attendu] of [
  ['adresse 0', () => canauxDuGradateur({ nom: 'A', adresseDmx: 0, circuits: 4 }), 'patch.adresseInvalide'],
  ['adresse fractionnaire', () => canauxDuProjecteur({ nom: 'A', adresseDmx: 1.5, canaux: 4 }), 'patch.adresseInvalide'],
  ['zéro circuit', () => canauxDuGradateur({ nom: 'A', adresseDmx: 1, circuits: 0 }), 'patch.circuitsInvalides'],
  ['zéro canal', () => canauxDuProjecteur({ nom: 'A', adresseDmx: 1, canaux: 0 }), 'patch.canauxInvalides'],
  ['capacité nulle', () => capaciteUtile(0), 'patch.capacitePositive'],
  ['marge de 100 %', () => capaciteUtile(2000, 1), 'patch.margeHorsLimites'],
  ['aucun gradateur', () => repartirSurCircuits([{ nom: 'PC', puissance: 500 }], []), 'patch.aucunGradateur'],
  [
    'puissance nulle',
    () => repartirSurCircuits([{ nom: 'PC', puissance: 0 }], [{ nom: 'A', adresseDmx: 1, circuits: 2 }]),
    'patch.puissancePositive'
  ]
]) {
  verifier(leve(appel) === attendu, `${nom} : refusé (${attendu})`)
}

console.log(echecs === 0 ? '\nPATCH : TOUS LES TESTS PASSENT' : `\nPATCH : ${echecs} ÉCHEC(S)`)
process.exit(echecs === 0 ? 0 : 1)
