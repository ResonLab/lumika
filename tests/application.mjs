import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * L'application : ce qui doit rester vrai même quand l'interface bouge.
 *
 * On ne lance pas Electron ici — ce serait long et fragile. On éprouve les
 * domaines **pour de vrai**, sur une base temporaire : Node 24 dépouille les
 * types, donc ils s'importent tels quels, sans compilation ni empaqueteur.
 *
 * Comparer des chaînes du code source aurait été plus court et beaucoup moins
 * utile : un contrôle qui ne distingue pas une régression d'un retour à la
 * ligne finit par être contourné.
 */
const PROJET = join(dirname(fileURLToPath(import.meta.url)), '..')
const lire = (relatif) => readFileSync(join(PROJET, relatif), 'utf-8')

let echecs = 0
function verifier(intitule, condition, detail = '') {
  if (!condition) echecs += 1
  console.log(`  ${condition ? 'OK  ' : 'ECHEC'} ${intitule}`)
  if (!condition && detail) console.log(`        ${detail}`)
}

console.log('\n=== Le calcul ne vit qu’à un seul endroit ===')

const plan = lire('src/main/domaines/planDeFeu.ts')
verifier('le domaine appelle le module partagé', plan.includes("from '../../../commun/patch.js'"))

// Un domaine qui recalculerait lui-même donnerait un patch que les tests ne
// couvrent pas. Un patch faux ne se voit qu'une fois tout accroché.
const recopies = ['function controlerPatch', 'function repartirSurCircuits', 'function canauxDu']
  .filter((nom) => plan.includes(nom))
verifier('le domaine ne redéfinit aucune fonction de calcul', recopies.length === 0, recopies.join(', '))

console.log('\n=== La couche métier reste sans Electron ===')

// Règle de la maison : ce qui est dans domaines/ doit pouvoir tourner ailleurs
// que dans une fenêtre, et s'éprouver sans en lancer une.
for (const fichier of ['src/main/domaines/inventaire.ts', 'src/main/domaines/planDeFeu.ts']) {
  verifier(`${fichier} n'importe pas Electron`, !/from 'electron'/.test(lire(fichier)))
}

console.log('\n=== Les domaines, éprouvés sur une vraie base ===')

const dossier = mkdtempSync(join(tmpdir(), 'lumika-'))
try {
  const { definirContexte } = await import('../src/main/contexte.ts')
  definirContexte({ dossierDonnees: dossier, version: '0.0.0-test' })

  const { ouvrirBaseDeDonnees, fermerBaseDeDonnees } = await import('../src/main/db/database.ts')
  // Le schéma est lu ici, comme la fenêtre le fait de son côté : la couche base
  // ne connaît plus ni Electron, ni l'empaqueteur.
  ouvrirBaseDeDonnees(lire('src/main/db/schema.sql'))

  const inventaire = await import('../src/main/domaines/inventaire.ts')
  const planDeFeu = await import('../src/main/domaines/planDeFeu.ts')

  const gabarit = {
    nature: 'projecteur',
    designation: '',
    marque: '',
    reference: '',
    quantite: 1,
    seuilAlerte: 0,
    genre: 'trad',
    typeOptique: 'PC',
    puissance: 1000,
    canauxDmx: 0,
    culot: '',
    emplacement: '',
    notes: ''
  }

  const pc = inventaire.ajouterMateriel({ ...gabarit, designation: 'PC 1000' })
  verifier('un projecteur s’ajoute', typeof pc === 'number' && pc > 0)

  // **Un appareil DMX sans nombre de canaux est refusé.** Sans lui, il
  // occuperait zéro canal, ne chevaucherait donc jamais rien, et le contrôle
  // du patch dirait oui à un plan faux.
  let refuse = false
  try {
    inventaire.ajouterMateriel({ ...gabarit, designation: 'LED', genre: 'dmx', canauxDmx: 0 })
  } catch {
    refuse = true
  }
  verifier('un projecteur DMX sans canaux est refusé', refuse)

  const led = inventaire.ajouterMateriel({
    ...gabarit, designation: 'Barre LED', genre: 'dmx', canauxDmx: 8, puissance: 0
  })

  // Le seuil d'alerte ne concerne que ce qui a un seuil. Un seuil à zéro veut
  // dire « je ne surveille pas », pas « alerte dès que c'est vide ».
  inventaire.ajouterMateriel({
    ...gabarit, nature: 'lampe', designation: 'Lampe 1000 W GX9.5',
    culot: 'GX9.5', quantite: 1, seuilAlerte: 4, puissance: 0
  })
  const alertes = inventaire.sousLeSeuil()
  verifier('une lampe sous son seuil est signalée', alertes.length === 1)
  verifier(
    'un seuil à zéro ne déclenche rien',
    alertes.every((a) => a.seuilAlerte > 0),
    'sinon tout l’inventaire finirait en alerte et personne ne regarderait la liste'
  )

  const perche = planDeFeu.ajouterPerche({
    nom: 'Perche 1', distance: 2, hauteur: 6, longueur: 12, ordre: 1, notes: ''
  })
  const bloc = planDeFeu.ajouterGradateur({
    nom: 'Bloc A', univers: 1, adresseDmx: 1, circuits: 24, capaciteParCircuit: 2000
  })

  // **Un appareil ne peut pas porter les deux patchs.** Le régisseur monterait
  // le circuit, rien ne s'allumerait, et il chercherait vingt minutes.
  let deuxPatchs = false
  try {
    planDeFeu.ajouterAppareil({
      materielId: pc, percheId: perche, lateral: 0, numero: 1,
      gradateurId: bloc, circuit: 1, univers: 1, adresseDmx: 100,
      gelatine: '', gobo: '', fonction: '', notes: ''
    })
  } catch {
    deuxPatchs = true
  }
  verifier('un appareil avec circuit ET adresse est refusé', deuxPatchs)

  planDeFeu.ajouterAppareil({
    materielId: pc, percheId: perche, lateral: -2, numero: 1,
    gradateurId: bloc, circuit: 1, univers: 1, adresseDmx: null,
    gelatine: 'Lee 201', gobo: '', fonction: 'face jardin', notes: ''
  })

  // **Le contrôle qui vaut tout le reste** : la LED posée en 12 tombe dans la
  // plage du bloc (1–24). Sur le papier ce sont deux appareils différents ;
  // sur le plateau, elle allume des circuits au hasard.
  planDeFeu.ajouterAppareil({
    materielId: led, percheId: perche, lateral: 2, numero: 2,
    gradateurId: null, circuit: null, univers: 1, adresseDmx: 12,
    gelatine: '', gobo: '', fonction: 'contre', notes: ''
  })

  const etat = planDeFeu.etatDuPatch()
  verifier(
    'une LED posée dans la plage d’un bloc est signalée',
    etat.conflits.length === 1,
    'c’est l’erreur de montage classique, et elle ne se voit qu’une fois tout accroché'
  )

  // La proposition doit être **applicable**, pas seulement lisible : sans les
  // identifiants, l'écran devrait deviner à quel appareil correspond quel nom,
  // et deux projecteurs peuvent porter le même.
  const proposition = planDeFeu.proposerRepartition()
  verifier(
    'la répartition rend des affectations applicables',
    Array.isArray(proposition.affectations) && proposition.affectations.length > 0,
    'sinon la proposition ne serait qu’un texte à lire'
  )
  verifier(
    'chaque affectation nomme un appareil, un bloc et un circuit',
    proposition.affectations.every(
      (a) =>
        typeof a.appareilId === 'number' &&
        typeof a.gradateurId === 'number' &&
        typeof a.circuit === 'number'
    )
  )

  planDeFeu.appliquerRepartition(proposition.affectations)
  const apres = planDeFeu.listerAppareils().find((a) => a.genre === 'trad')
  verifier('appliquer la répartition écrit vraiment le circuit', apres?.circuit !== null)

  fermerBaseDeDonnees()
} finally {
  rmSync(dossier, { recursive: true, force: true })
}

console.log(echecs === 0 ? '\nAPPLICATION : TOUS LES TESTS PASSENT' : `\n${echecs} TEST(S) EN ECHEC`)
process.exitCode = echecs === 0 ? 0 : 1
