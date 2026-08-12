import type { DatabaseSync } from 'node:sqlite'

/**
 * Complète une base créée par une version antérieure de Lumika.
 *
 * Règle héritée d'Ohmnia et de Scenika : **on n'efface jamais la base d'un
 * utilisateur pour appliquer un changement**. Toute colonne ajoutée à
 * `schema.sql` doit apparaître ici, sinon les bases existantes ne la recevront
 * pas — et un régisseur a un vrai plan de feu là-dedans.
 *
 * La liste est vide tant que le schéma n'a pas bougé depuis la première
 * version. Elle ne le restera pas : c'est le mécanisme qui compte, et l'avoir
 * dès le départ évite d'y penser trop tard.
 */
interface ColonneAttendue {
  table: string
  colonne: string
  definition: string
}

const COLONNES_ATTENDUES: ColonneAttendue[] = []

export function appliquerMigrations(db: DatabaseSync): void {
  for (const attendue of COLONNES_ATTENDUES) {
    const colonnes = db.prepare(`PRAGMA table_info(${attendue.table})`).all() as {
      name: string
    }[]
    if (colonnes.length === 0) continue
    if (colonnes.some((c) => c.name === attendue.colonne)) continue

    db.exec(
      `ALTER TABLE ${attendue.table} ADD COLUMN ${attendue.colonne} ${attendue.definition}`
    )
  }
}
