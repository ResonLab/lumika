import { contextBridge, ipcRenderer } from 'electron'
import type {
  Appareil,
  AppareilDetaille,
  Gradateur,
  Materiel,
  NatureMateriel,
  Perche
} from '../partage/types'

/** Le pont sécurisé : seule porte entre l'interface et le système. */
const api = {
  inventaire: {
    lister: (nature?: NatureMateriel): Promise<Materiel[]> =>
      ipcRenderer.invoke('inventaire:lister', nature),
    ajouter: (m: Omit<Materiel, 'id'>): Promise<number> =>
      ipcRenderer.invoke('inventaire:ajouter', m),
    modifier: (m: Materiel): Promise<void> => ipcRenderer.invoke('inventaire:modifier', m),
    supprimer: (id: number): Promise<void> => ipcRenderer.invoke('inventaire:supprimer', id),
    sousLeSeuil: (): Promise<Materiel[]> => ipcRenderer.invoke('inventaire:sousLeSeuil')
  },
  perches: {
    lister: (): Promise<Perche[]> => ipcRenderer.invoke('perches:lister'),
    ajouter: (p: Omit<Perche, 'id'>): Promise<number> => ipcRenderer.invoke('perches:ajouter', p),
    modifier: (p: Perche): Promise<void> => ipcRenderer.invoke('perches:modifier', p),
    supprimer: (id: number): Promise<void> => ipcRenderer.invoke('perches:supprimer', id)
  },
  gradateurs: {
    lister: (): Promise<Gradateur[]> => ipcRenderer.invoke('gradateurs:lister'),
    ajouter: (g: Omit<Gradateur, 'id'>): Promise<number> =>
      ipcRenderer.invoke('gradateurs:ajouter', g),
    modifier: (g: Gradateur): Promise<void> => ipcRenderer.invoke('gradateurs:modifier', g),
    supprimer: (id: number): Promise<void> => ipcRenderer.invoke('gradateurs:supprimer', id)
  },
  appareils: {
    lister: (): Promise<AppareilDetaille[]> => ipcRenderer.invoke('appareils:lister'),
    ajouter: (a: Omit<Appareil, 'id'>): Promise<number> =>
      ipcRenderer.invoke('appareils:ajouter', a),
    modifier: (a: Appareil): Promise<void> => ipcRenderer.invoke('appareils:modifier', a),
    supprimer: (id: number): Promise<void> => ipcRenderer.invoke('appareils:supprimer', id)
  },
  patch: {
    etat: (): Promise<EtatPatch> => ipcRenderer.invoke('patch:etat'),
    proposer: (): Promise<Repartition> => ipcRenderer.invoke('patch:proposer'),
    appliquer: (
      affectations: { appareilId: number; gradateurId: number; circuit: number }[]
    ): Promise<void> => ipcRenderer.invoke('patch:appliquer', affectations)
  }
}

export interface PlageOccupee {
  univers: number
  debut: number
  fin: number
  nom: string
  genre: 'gradateur' | 'projecteur'
}

export interface EtatPatch {
  plages: PlageOccupee[]
  conflits: { cle: string; premier: PlageOccupee; second: PlageOccupee }[]
  libres: Record<number, { debut: number; fin: number }[]>
}

export interface CircuitCharge {
  gradateur: string
  numero: number
  capacite: number
  utile: number
  charge: number
  projecteurs: string[]
}

export interface Affectation {
  appareilId: number
  gradateurId: number
  circuit: number
}

export interface Repartition {
  circuits: CircuitCharge[]
  refuses: { cle: string; nom: string; puissance: number }[]
  /** Prêtes à appliquer : c'est ce qui rend la proposition autre chose qu'un texte. */
  affectations: Affectation[]
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
