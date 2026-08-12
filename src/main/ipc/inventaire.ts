import { ipcMain } from 'electron'
import {
  ajouterMateriel,
  listerMateriel,
  modifierMateriel,
  sousLeSeuil,
  supprimerMateriel
} from '../domaines/inventaire'
import type { Materiel, NatureMateriel } from '../../partage/types'

/**
 * Branche l'inventaire sur la fenêtre.
 *
 * Ce fichier ne contient **aucune logique métier** : elle vit dans
 * `domaines/inventaire.ts`, qui n'importe pas Electron et s'éprouve sans
 * lancer de fenêtre. Règle de la maison, et elle a déjà servi.
 */
export function enregistrerHandlersInventaire(): void {
  ipcMain.handle('inventaire:lister', (_e, nature?: NatureMateriel) => listerMateriel(nature))
  ipcMain.handle('inventaire:ajouter', (_e, m: Omit<Materiel, 'id'>) => ajouterMateriel(m))
  ipcMain.handle('inventaire:modifier', (_e, m: Materiel) => modifierMateriel(m))
  ipcMain.handle('inventaire:supprimer', (_e, id: number) => supprimerMateriel(id))
  ipcMain.handle('inventaire:sousLeSeuil', () => sousLeSeuil())
}
