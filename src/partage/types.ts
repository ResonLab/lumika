/** Types partagés entre les trois couches : main, preload, renderer. */

/**
 * Ce qu'on possède.
 *
 * Trois natures dans une seule table : un porte-gobo et un PC 1000 n'ont pas
 * les mêmes champs, mais trois tables obligeraient à écrire trois écrans et
 * trois requêtes pour répondre à « qu'est-ce que je possède ».
 */
export type NatureMateriel = 'projecteur' | 'lampe' | 'accessoire'

/**
 * Ce qui décide de tout le patch.
 *
 * · `trad` — une lampe halogène et rien d'autre. L'appareil ne sait pas ce
 *   qu'est le DMX : il lui faut un **circuit de gradateur**, et plusieurs
 *   appareils peuvent partager un circuit tant que la puissance tient.
 * · `dmx` — LED, asservi, machine à effet. Il a son propre récepteur et occupe
 *   **plusieurs canaux consécutifs** selon son mode.
 */
export type GenreProjecteur = 'trad' | 'dmx'

export interface Materiel {
  id: number
  nature: NatureMateriel
  designation: string
  marque: string
  reference: string
  quantite: number
  /** En dessous, l'écran alerte. Une lampe qui claque la veille se remplace. */
  seuilAlerte: number

  genre: GenreProjecteur
  typeOptique: string
  /** En watts — ce qui décide de l'occupation d'un circuit. */
  puissance: number
  /** Nombre de canaux occupés, pour un appareil `dmx`. */
  canauxDmx: number

  /** Le culot d'une lampe : GX9.5, G22, E27… C'est lui qui dit si elle va. */
  culot: string

  emplacement: string
  notes: string
}

/**
 * Une perche : la barre d'où pendent les projecteurs.
 *
 * `distance` se compte depuis le nu du cadre de scène, l'origine de toute cote
 * au théâtre. **Une perche de face est devant le cadre, donc à distance
 * négative** — ce n'est pas une erreur de saisie.
 */
export interface Perche {
  id: number
  nom: string
  distance: number
  hauteur: number
  /** Longueur utile, en mètres : elle borne la position latérale. */
  longueur: number
  ordre: number
  notes: string
}

/**
 * Un bloc de gradateurs.
 *
 * **Il occupe autant de canaux DMX qu'il a de circuits**, à partir de son
 * adresse. C'est ce qu'on oublie, et c'est ce qui fait qu'une barre LED posée
 * dans cette plage allume des circuits au hasard sur le plateau.
 */
export interface Gradateur {
  id: number
  nom: string
  univers: number
  adresseDmx: number
  circuits: number
  /** En watts. 2 kW est le standard, beaucoup de blocs font 3 kW. */
  capaciteParCircuit: number
}

/**
 * Un appareil posé sur le plan de feu.
 *
 * Le patch est **soit** un circuit de gradateur (appareil `trad`), **soit** une
 * adresse DMX (appareil `dmx`). Jamais les deux : un appareil qui aurait les
 * deux serait un appareil dont personne ne sait comment on l'allume.
 */
export interface Appareil {
  id: number
  materielId: number
  percheId: number | null

  /** Position latérale depuis l'axe, en mètres. Négatif à jardin, positif à cour. */
  lateral: number
  /** Le numéro crié pendant le montage. Ni l'adresse, ni le circuit. */
  numero: number

  gradateurId: number | null
  circuit: number | null
  univers: number | null
  adresseDmx: number | null

  /** La référence du filtre : Lee 201, Rosco 119… */
  gelatine: string
  gobo: string
  /** « face jardin », « contre bleu » — ce à quoi il sert dans la conduite. */
  fonction: string
  notes: string
}

/** Un appareil avec ce qu'il faut pour l'afficher sans seconde requête. */
export interface AppareilDetaille extends Appareil {
  designation: string
  genre: GenreProjecteur
  puissance: number
  canauxDmx: number
  typeOptique: string
  perche: string | null
}
