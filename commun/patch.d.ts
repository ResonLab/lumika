/**
 * Déclarations de types pour `patch.js`.
 *
 * Le calcul est en JavaScript pour que Node, l'application et un navigateur
 * chargent le même fichier. Ce fichier-ci n'en décrit que les types : aucune
 * logique, donc aucune divergence possible.
 */
export const TAILLE_UNIVERS: number
export const CAPACITE_CIRCUIT_DEFAUT: number
export const MARGE_CIRCUIT: number

export interface Plage {
  univers: number
  debut: number
  fin: number
}

/** Une plage occupée, avec ce qui l'occupe. */
export interface PlageOccupee extends Plage {
  nom: string
  genre: 'gradateur' | 'projecteur'
}

export interface GradateurAPatcher {
  nom: string
  adresseDmx: number
  circuits: number
  univers?: number
  capaciteParCircuit?: number
}

export interface ProjecteurAPatcher {
  nom: string
  adresseDmx: number
  canaux: number
  univers?: number
}

export interface Conflit {
  cle: string
  premier: PlageOccupee
  second: PlageOccupee
}

export function capaciteUtile(capaciteWatts: number, marge?: number): number
export function canauxDuGradateur(gradateur: GradateurAPatcher): Plage
export function canauxDuProjecteur(projecteur: ProjecteurAPatcher): Plage

export function controlerPatch(
  gradateurs: GradateurAPatcher[],
  projecteursNonTrad: ProjecteurAPatcher[]
): { plages: PlageOccupee[]; conflits: Conflit[] }

export function plagesLibres(
  plages: PlageOccupee[],
  univers?: number
): { debut: number; fin: number }[]

/** Un projecteur traditionnel, avec son circuit s'il a déjà été placé à la main. */
export interface ProjecteurTrad {
  nom: string
  puissance: number
  gradateur?: string
  circuit?: number
  /** Rendu tel quel dans le résultat : c'est ce qui rend une proposition applicable. */
  ref?: number
}

export interface CircuitCharge {
  gradateur: string
  numero: number
  capacite: number
  /** Capacité une fois la marge retirée. */
  utile: number
  charge: number
  projecteurs: string[]
  refs: (number | undefined)[]
}

export function repartirSurCircuits(
  projecteursTrad: ProjecteurTrad[],
  gradateurs: GradateurAPatcher[],
  marge?: number
): {
  circuits: CircuitCharge[]
  refuses: { cle: string; nom: string; puissance: number; ref?: number }[]
}
