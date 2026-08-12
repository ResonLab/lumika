import { getDb } from '../db/database.ts'
import type { Materiel, NatureMateriel } from '../../partage/types.ts'

/**
 * L'inventaire : projecteurs, lampes, accessoires.
 *
 * **Sans Electron**, comme dans Ohmnia et Scenika : la logique métier doit
 * pouvoir s'éprouver sans lancer de fenêtre, et servir un jour par le réseau
 * sans être réécrite.
 *
 * **Les lampes sont la raison d'être de cet écran.** Un projecteur, on l'a ou
 * on ne l'a pas. Une lampe, elle, claque — et s'en apercevoir le soir de la
 * générale, sans rechange du bon culot, c'est un projecteur mort pour la série.
 * D'où le seuil d'alerte, qui n'a de sens que pour un consommable.
 */

/** Le SQL est écrit à la main et se relit : règle de la maison. */
const CHAMPS = `
  id, nature, designation, marque, reference, quantite,
  seuil_alerte AS seuilAlerte, genre, type_optique AS typeOptique,
  puissance, canaux_dmx AS canauxDmx, culot, emplacement, notes
`

export function listerMateriel(nature?: NatureMateriel): Materiel[] {
  const db = getDb()
  if (nature) {
    return db
      .prepare(`SELECT ${CHAMPS} FROM materiel WHERE nature = ? ORDER BY designation`)
      .all(nature) as unknown as Materiel[]
  }
  return db
    .prepare(`SELECT ${CHAMPS} FROM materiel ORDER BY nature, designation`)
    .all() as unknown as Materiel[]
}

function valider(materiel: Partial<Materiel>): void {
  if (!materiel.designation?.trim()) throw new Error('inventaire.designationVide')
  if ((materiel.quantite ?? 0) < 0) throw new Error('inventaire.quantiteNegative')
  if ((materiel.puissance ?? 0) < 0) throw new Error('inventaire.puissanceNegative')

  // Un appareil DMX sans nombre de canaux ne peut pas être patché : il
  // occuperait zéro canal, donc ne chevaucherait jamais rien, et le contrôle
  // de patch dirait oui à un plan faux.
  if (materiel.nature === 'projecteur' && materiel.genre === 'dmx') {
    if (!((materiel.canauxDmx ?? 0) > 0)) throw new Error('inventaire.canauxObligatoires')
  }
}

export function ajouterMateriel(materiel: Omit<Materiel, 'id'>): number {
  valider(materiel)
  const db = getDb()
  const resultat = db
    .prepare(
      `INSERT INTO materiel
         (nature, designation, marque, reference, quantite, seuil_alerte,
          genre, type_optique, puissance, canaux_dmx, culot, emplacement, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      materiel.nature,
      materiel.designation.trim(),
      materiel.marque,
      materiel.reference,
      materiel.quantite,
      materiel.seuilAlerte,
      materiel.genre,
      materiel.typeOptique,
      materiel.puissance,
      materiel.canauxDmx,
      materiel.culot,
      materiel.emplacement,
      materiel.notes
    )
  return Number(resultat.lastInsertRowid)
}

export function modifierMateriel(materiel: Materiel): void {
  valider(materiel)
  getDb()
    .prepare(
      `UPDATE materiel SET
         nature = ?, designation = ?, marque = ?, reference = ?, quantite = ?,
         seuil_alerte = ?, genre = ?, type_optique = ?, puissance = ?,
         canaux_dmx = ?, culot = ?, emplacement = ?, notes = ?
       WHERE id = ?`
    )
    .run(
      materiel.nature,
      materiel.designation.trim(),
      materiel.marque,
      materiel.reference,
      materiel.quantite,
      materiel.seuilAlerte,
      materiel.genre,
      materiel.typeOptique,
      materiel.puissance,
      materiel.canauxDmx,
      materiel.culot,
      materiel.emplacement,
      materiel.notes,
      materiel.id
    )
}

export function supprimerMateriel(id: number): void {
  getDb().prepare('DELETE FROM materiel WHERE id = ?').run(id)
}

/**
 * Ce qui est sous son seuil d'alerte.
 *
 * Ne concerne que ce qui a un seuil : un seuil à zéro veut dire « je ne surveille
 * pas », pas « alerte dès que c'est vide ». Sans cette distinction, tout
 * l'inventaire finirait en alerte et personne ne regarderait plus la liste.
 */
export function sousLeSeuil(): Materiel[] {
  return getDb()
    .prepare(
      `SELECT ${CHAMPS} FROM materiel
        WHERE seuil_alerte > 0 AND quantite <= seuil_alerte
        ORDER BY nature, designation`
    )
    .all() as unknown as Materiel[]
}
