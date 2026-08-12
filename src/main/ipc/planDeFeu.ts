import { ipcMain } from 'electron'
import {
  ajouterAppareil,
  ajouterGradateur,
  ajouterPerche,
  appliquerRepartition,
  etatDuPatch,
  listerAppareils,
  listerGradateurs,
  listerPerches,
  modifierAppareil,
  modifierGradateur,
  modifierPerche,
  proposerRepartition,
  supprimerAppareil,
  supprimerGradateur,
  supprimerPerche
} from '../domaines/planDeFeu'
import type { Appareil, Gradateur, Perche } from '../../partage/types'

/** Branche le plan de feu sur la fenêtre. Aucune logique métier ici. */
export function enregistrerHandlersPlanDeFeu(): void {
  ipcMain.handle('perches:lister', () => listerPerches())
  ipcMain.handle('perches:ajouter', (_e, p: Omit<Perche, 'id'>) => ajouterPerche(p))
  ipcMain.handle('perches:modifier', (_e, p: Perche) => modifierPerche(p))
  ipcMain.handle('perches:supprimer', (_e, id: number) => supprimerPerche(id))

  ipcMain.handle('gradateurs:lister', () => listerGradateurs())
  ipcMain.handle('gradateurs:ajouter', (_e, g: Omit<Gradateur, 'id'>) => ajouterGradateur(g))
  ipcMain.handle('gradateurs:modifier', (_e, g: Gradateur) => modifierGradateur(g))
  ipcMain.handle('gradateurs:supprimer', (_e, id: number) => supprimerGradateur(id))

  ipcMain.handle('appareils:lister', () => listerAppareils())
  ipcMain.handle('appareils:ajouter', (_e, a: Omit<Appareil, 'id'>) => ajouterAppareil(a))
  ipcMain.handle('appareils:modifier', (_e, a: Appareil) => modifierAppareil(a))
  ipcMain.handle('appareils:supprimer', (_e, id: number) => supprimerAppareil(id))

  ipcMain.handle('patch:etat', () => etatDuPatch())
  ipcMain.handle('patch:proposer', () => proposerRepartition())
  ipcMain.handle(
    'patch:appliquer',
    (_e, affectations: { appareilId: number; gradateurId: number; circuit: number }[]) =>
      appliquerRepartition(affectations)
  )
}
