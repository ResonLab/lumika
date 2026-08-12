import { getDb, dansUneTransaction } from '../db/database.ts'
import type { Appareil, AppareilDetaille, Gradateur, Perche } from '../../partage/types.ts'
import { controlerPatch, plagesLibres, repartirSurCircuits } from '../../../commun/patch.js'

/**
 * Le plan de feu : perches, gradateurs, appareils posés, et le patch.
 *
 * **Sans Electron.** Le calcul, lui, n'est pas ici : il vit dans
 * `commun/patch.js`, éprouvé contre des valeurs calculées à la main. Ce module
 * ne fait que lire la base et lui passer les données — un patch faux est
 * invisible sur un écran, et ne se découvre qu'une fois tout accroché.
 */

/* ── Les perches ─────────────────────────────────────────────────────────── */

export function listerPerches(): Perche[] {
  return getDb()
    .prepare('SELECT id, nom, distance, hauteur, longueur, ordre, notes FROM perche ORDER BY ordre, distance')
    .all() as unknown as Perche[]
}

export function ajouterPerche(perche: Omit<Perche, 'id'>): number {
  if (!perche.nom.trim()) throw new Error('perche.nomVide')
  if (!(perche.hauteur > 0)) throw new Error('perche.hauteurPositive')
  if (!(perche.longueur > 0)) throw new Error('perche.longueurPositive')

  const resultat = getDb()
    .prepare('INSERT INTO perche (nom, distance, hauteur, longueur, ordre, notes) VALUES (?, ?, ?, ?, ?, ?)')
    .run(perche.nom.trim(), perche.distance, perche.hauteur, perche.longueur, perche.ordre, perche.notes)
  return Number(resultat.lastInsertRowid)
}

export function modifierPerche(perche: Perche): void {
  if (!perche.nom.trim()) throw new Error('perche.nomVide')
  if (!(perche.hauteur > 0)) throw new Error('perche.hauteurPositive')
  if (!(perche.longueur > 0)) throw new Error('perche.longueurPositive')

  getDb()
    .prepare('UPDATE perche SET nom = ?, distance = ?, hauteur = ?, longueur = ?, ordre = ?, notes = ? WHERE id = ?')
    .run(perche.nom.trim(), perche.distance, perche.hauteur, perche.longueur, perche.ordre, perche.notes, perche.id)
}

/**
 * Supprimer une perche ne supprime pas ce qu'elle portait.
 *
 * Les appareils passent à « non accroché » — c'est ce que fait le
 * `ON DELETE SET NULL` du schéma. Les effacer avec la perche perdrait le patch,
 * les gélatines et les fonctions de vingt appareils sur un clic destiné à
 * corriger un nom.
 */
export function supprimerPerche(id: number): void {
  getDb().prepare('DELETE FROM perche WHERE id = ?').run(id)
}

/* ── Les gradateurs ──────────────────────────────────────────────────────── */

export function listerGradateurs(): Gradateur[] {
  return getDb()
    .prepare(
      `SELECT id, nom, univers, adresse_dmx AS adresseDmx, circuits,
              capacite_par_circuit AS capaciteParCircuit
         FROM gradateur ORDER BY univers, adresse_dmx`
    )
    .all() as unknown as Gradateur[]
}

function validerGradateur(g: Omit<Gradateur, 'id'>): void {
  if (!g.nom.trim()) throw new Error('gradateur.nomVide')
  if (!Number.isInteger(g.adresseDmx) || g.adresseDmx < 1 || g.adresseDmx > 512) {
    throw new Error('gradateur.adresseHorsLimites')
  }
  if (!Number.isInteger(g.circuits) || g.circuits < 1) throw new Error('gradateur.circuitsPositifs')
  if (!(g.capaciteParCircuit > 0)) throw new Error('gradateur.capacitePositive')
  if (g.adresseDmx + g.circuits - 1 > 512) throw new Error('gradateur.depasseUnivers')
}

export function ajouterGradateur(g: Omit<Gradateur, 'id'>): number {
  validerGradateur(g)
  const resultat = getDb()
    .prepare(
      'INSERT INTO gradateur (nom, univers, adresse_dmx, circuits, capacite_par_circuit) VALUES (?, ?, ?, ?, ?)'
    )
    .run(g.nom.trim(), g.univers, g.adresseDmx, g.circuits, g.capaciteParCircuit)
  return Number(resultat.lastInsertRowid)
}

export function modifierGradateur(g: Gradateur): void {
  validerGradateur(g)
  getDb()
    .prepare(
      'UPDATE gradateur SET nom = ?, univers = ?, adresse_dmx = ?, circuits = ?, capacite_par_circuit = ? WHERE id = ?'
    )
    .run(g.nom.trim(), g.univers, g.adresseDmx, g.circuits, g.capaciteParCircuit, g.id)
}

export function supprimerGradateur(id: number): void {
  getDb().prepare('DELETE FROM gradateur WHERE id = ?').run(id)
}

/* ── Les appareils posés ─────────────────────────────────────────────────── */

const CHAMPS_APPAREIL = `
  a.id, a.materiel_id AS materielId, a.perche_id AS percheId, a.lateral, a.numero,
  a.gradateur_id AS gradateurId, a.circuit, a.univers, a.adresse_dmx AS adresseDmx,
  a.gelatine, a.gobo, a.fonction, a.notes,
  m.designation, m.genre, m.puissance, m.canaux_dmx AS canauxDmx,
  m.type_optique AS typeOptique, p.nom AS perche
`

export function listerAppareils(): AppareilDetaille[] {
  return getDb()
    .prepare(
      `SELECT ${CHAMPS_APPAREIL}
         FROM appareil a
         JOIN materiel m ON m.id = a.materiel_id
         LEFT JOIN perche p ON p.id = a.perche_id
        ORDER BY a.numero, a.id`
    )
    .all() as unknown as AppareilDetaille[]
}

/**
 * Un appareil ne peut pas avoir à la fois un circuit et une adresse DMX.
 *
 * **Ce n'est pas une coquetterie de schéma.** Un appareil qui porte les deux
 * est un appareil dont personne ne sait comment on l'allume : le régisseur
 * monte le circuit, rien ne s'allume, et il cherche pendant vingt minutes.
 * Le refus est explicite et nommé.
 */
function validerAppareil(a: Omit<Appareil, 'id'>): void {
  const surGradateur = a.gradateurId !== null && a.circuit !== null
  const surDmx = a.adresseDmx !== null

  if (surGradateur && surDmx) throw new Error('appareil.deuxPatchs')
  if (a.adresseDmx !== null && (a.adresseDmx < 1 || a.adresseDmx > 512)) {
    throw new Error('appareil.adresseHorsLimites')
  }
  if (a.circuit !== null && a.circuit < 1) throw new Error('appareil.circuitPositif')
}

export function ajouterAppareil(a: Omit<Appareil, 'id'>): number {
  validerAppareil(a)
  const resultat = getDb()
    .prepare(
      `INSERT INTO appareil
         (materiel_id, perche_id, lateral, numero, gradateur_id, circuit,
          univers, adresse_dmx, gelatine, gobo, fonction, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      a.materielId, a.percheId, a.lateral, a.numero, a.gradateurId, a.circuit,
      a.univers, a.adresseDmx, a.gelatine, a.gobo, a.fonction, a.notes
    )
  return Number(resultat.lastInsertRowid)
}

export function modifierAppareil(a: Appareil): void {
  validerAppareil(a)
  getDb()
    .prepare(
      `UPDATE appareil SET
         materiel_id = ?, perche_id = ?, lateral = ?, numero = ?, gradateur_id = ?,
         circuit = ?, univers = ?, adresse_dmx = ?, gelatine = ?, gobo = ?,
         fonction = ?, notes = ?
       WHERE id = ?`
    )
    .run(
      a.materielId, a.percheId, a.lateral, a.numero, a.gradateurId, a.circuit,
      a.univers, a.adresseDmx, a.gelatine, a.gobo, a.fonction, a.notes, a.id
    )
}

export function supprimerAppareil(id: number): void {
  getDb().prepare('DELETE FROM appareil WHERE id = ?').run(id)
}

/* ── Le patch ────────────────────────────────────────────────────────────── */

/**
 * L'état du patch : ce qui occupe quoi, ce qui se chevauche, ce qui reste libre.
 *
 * **Les gradateurs et les appareils DMX sont comparés dans le même espace.**
 * Les vérifier séparément laisserait passer l'erreur la plus fréquente du
 * montage : une barre LED posée dans la plage d'un bloc de puissance. Sur le
 * papier ce sont deux appareils différents ; sur le plateau, la barre allume
 * des circuits au hasard.
 */
export function etatDuPatch(): {
  plages: unknown[]
  conflits: unknown[]
  libres: Record<number, unknown[]>
} {
  const gradateurs = listerGradateurs()
  const appareils = listerAppareils()

  const dmx = appareils
    .filter((a) => a.genre === 'dmx' && a.adresseDmx !== null)
    .map((a) => ({
      nom: `${a.numero || a.id} — ${a.designation}`,
      adresseDmx: a.adresseDmx!,
      canaux: a.canauxDmx,
      univers: a.univers ?? 1
    }))

  const resultat = controlerPatch(gradateurs, dmx)

  const univers = [...new Set(resultat.plages.map((p: { univers: number }) => p.univers))]
  const libres: Record<number, unknown[]> = {}
  for (const u of univers.length > 0 ? univers : [1]) {
    libres[u] = plagesLibres(resultat.plages, u)
  }
  return { ...resultat, libres }
}

/**
 * Propose une répartition des appareils trad sur les circuits.
 *
 * Elle ne l'applique pas : elle la **propose**. Le régisseur garde la main,
 * parce que le plateau impose des contraintes que la base ignore — deux
 * projecteurs qu'on veut sur le même circuit pour les monter ensemble, un
 * circuit réservé, une rallonge qui ne va pas jusque-là.
 */
export function proposerRepartition(): unknown {
  const gradateurs = listerGradateurs()
  const trad = listerAppareils()
    .filter((a) => a.genre === 'trad')
    .map((a) => ({
      nom: `${a.numero || a.id} — ${a.designation}`,
      puissance: a.puissance,
      gradateur: gradateurs.find((g) => g.id === a.gradateurId)?.nom,
      circuit: a.circuit ?? undefined,
      // L'identifiant voyage avec le projecteur et revient dans le résultat.
      // **Sans lui la proposition ne serait qu'un texte à lire** : impossible
      // de l'appliquer sans deviner à quel appareil correspond quel nom, et
      // deux projecteurs peuvent parfaitement porter le même.
      ref: a.id
    }))

  const resultat = repartirSurCircuits(trad, gradateurs)

  // Les affectations, prêtes pour `appliquerRepartition`. Les calculer ici
  // plutôt que dans l'interface évite que l'écran refasse la correspondance à
  // sa façon — et se trompe autrement que le calcul.
  const parNom = new Map(gradateurs.map((g) => [g.nom, g.id]))
  const affectations: { appareilId: number; gradateurId: number; circuit: number }[] = []
  for (const circuit of resultat.circuits) {
    const gradateurId = parNom.get(circuit.gradateur)
    if (gradateurId === undefined) continue
    for (const ref of circuit.refs) {
      if (typeof ref === 'number') {
        affectations.push({ appareilId: ref, gradateurId, circuit: circuit.numero })
      }
    }
  }

  return { ...resultat, affectations }
}

/**
 * Applique une répartition proposée.
 *
 * En une transaction : une répartition à moitié écrite laisserait un plan de
 * feu dont personne ne sait s'il est celui d'avant ou celui d'après.
 */
export function appliquerRepartition(
  affectations: { appareilId: number; gradateurId: number; circuit: number }[]
): void {
  dansUneTransaction(() => {
    const requete = getDb().prepare(
      'UPDATE appareil SET gradateur_id = ?, circuit = ?, adresse_dmx = NULL WHERE id = ?'
    )
    for (const a of affectations) {
      requete.run(a.gradateurId, a.circuit, a.appareilId)
    }
  })
}
