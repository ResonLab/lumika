/**
 * Traductions de l'application.
 *
 * **Repris tel quel d'Ohmnia, de Scenika et d'Acustika**, délibérément : quatre
 * mécanismes de traduction différents dans la même maison, ce seraient quatre
 * façons d'oublier une chaîne.
 *
 * Fonctionnement : `t('cle')` renvoie le texte dans la langue courante, en
 * remplaçant `{nom}` par `valeurs.nom`. `npm run typecheck` rejette une clé
 * inconnue.
 *
 * **Le repli ne va que de l'anglais vers le français**, jamais l'inverse : une
 * clé sans anglais reste lisible, et une clé sans français est un oubli que la
 * suite `tests/traductions.mjs` signale au lieu de le masquer.
 */

export type Langue = 'fr' | 'en'

type Traduction = { fr: string; en: string }

const TEXTES = {
  // --- Cadre de l'application ---
  'app.planDeFeu': { fr: 'Plan de feu', en: 'Lighting plan' },
  'app.perches': { fr: 'Perches', en: 'Bars' },
  'app.inventaire': { fr: 'Inventaire', en: 'Inventory' },
  'app.patch': { fr: 'Patch', en: 'Patch' },

  // --- Actions communes ---
  'action.ajouter': { fr: 'Ajouter', en: 'Add' },
  'action.annuler': { fr: 'Annuler', en: 'Cancel' },
  'action.supprimer': { fr: 'Supprimer', en: 'Delete' },
  'action.rien': { fr: 'Rien pour l’instant.', en: 'Nothing yet.' },

  // --- Inventaire ---
  'inv.titre': { fr: 'Ce qu’on possède', en: 'What you own' },
  'inv.projecteurs': { fr: 'Projecteurs', en: 'Fixtures' },
  'inv.lampes': { fr: 'Lampes', en: 'Lamps' },
  'inv.accessoires': { fr: 'Accessoires', en: 'Accessories' },
  'inv.designation': { fr: 'Désignation', en: 'Name' },
  'inv.marque': { fr: 'Marque', en: 'Brand' },
  'inv.quantite': { fr: 'Quantité', en: 'Quantity' },
  'inv.seuil': { fr: 'Seuil d’alerte', en: 'Alert threshold' },
  'inv.genre': { fr: 'Genre', en: 'Kind' },
  'inv.trad': { fr: 'Traditionnel', en: 'Conventional' },
  'inv.dmx': { fr: 'DMX', en: 'DMX' },
  'inv.typeOptique': { fr: 'Optique', en: 'Optics' },
  'inv.puissance': { fr: 'Puissance (W)', en: 'Power (W)' },
  'inv.canaux': { fr: 'Canaux DMX', en: 'DMX channels' },
  'inv.culot': { fr: 'Culot', en: 'Base' },
  'inv.emplacement': { fr: 'Emplacement', en: 'Location' },
  'inv.alerte': {
    fr: '{nombre} référence(s) sous leur seuil.',
    en: '{nombre} item(s) below their threshold.'
  },
  'inv.alerteExplication': {
    fr: 'Une lampe qui claque la veille de la générale, sans rechange du bon culot, c’est un projecteur mort pour toute la série. C’est pour cela que le seuil existe.',
    en: 'A lamp that blows the night before the dress rehearsal, with no spare of the right base, is a fixture lost for the whole run. That is what the threshold is for.'
  },
  'inv.seuilZero': {
    fr: 'Un seuil à zéro veut dire « je ne surveille pas », pas « alerte dès que c’est vide ».',
    en: 'A threshold of zero means "not watching", not "alert as soon as it is empty".'
  },

  // --- Perches ---
  'perche.titre': { fr: 'Les perches', en: 'The bars' },
  'perche.nom': { fr: 'Nom', en: 'Name' },
  'perche.distance': { fr: 'Distance (m)', en: 'Distance (m)' },
  'perche.hauteur': { fr: 'Hauteur (m)', en: 'Height (m)' },
  'perche.longueur': { fr: 'Longueur (m)', en: 'Length (m)' },
  'perche.distanceExplication': {
    fr: 'La distance se compte depuis le nu du cadre de scène. Une perche de face est devant le cadre : sa distance est négative, et c’est normal.',
    en: 'Distance is measured from the proscenium line. A front-of-house bar sits before it: its distance is negative, and that is correct.'
  },
  'perche.suppression': {
    fr: 'Supprimer une perche ne supprime pas ce qu’elle portait : les appareils passent à « non accroché » et gardent leur patch.',
    en: 'Deleting a bar does not delete what it carried: the fixtures become "not hung" and keep their patch.'
  },
  'perche.appareils': { fr: '{nombre} appareil(s)', en: '{nombre} fixture(s)' },

  // --- Plan de feu ---
  'plan.titre': { fr: 'Le plan de feu', en: 'The lighting plan' },
  'plan.numero': { fr: 'N°', en: 'No.' },
  'plan.appareil': { fr: 'Appareil', en: 'Fixture' },
  'plan.perche': { fr: 'Perche', en: 'Bar' },
  'plan.lateral': { fr: 'Latéral (m)', en: 'Lateral (m)' },
  'plan.lateralExplication': {
    fr: 'Depuis l’axe de la salle : négatif à jardin, positif à cour.',
    en: 'From the centre line: negative stage-right, positive stage-left.'
  },
  'plan.fonction': { fr: 'Fonction', en: 'Purpose' },
  'plan.gelatine': { fr: 'Gélatine', en: 'Gel' },
  'plan.gobo': { fr: 'Gobo', en: 'Gobo' },
  'plan.nonAccroche': { fr: 'non accroché', en: 'not hung' },
  'plan.vide': {
    fr: 'Aucun appareil posé. Ajoutez du matériel à l’inventaire, puis posez-le sur une perche.',
    en: 'No fixture placed. Add equipment to the inventory, then hang it on a bar.'
  },

  // --- Patch ---
  'patch.titre': { fr: 'Le patch', en: 'The patch' },
  'patch.gradateurs': { fr: 'Blocs de gradateurs', en: 'Dimmer racks' },
  'patch.adresse': { fr: 'Adresse DMX', en: 'DMX address' },
  'patch.circuits': { fr: 'Circuits', en: 'Channels' },
  'patch.univers': { fr: 'Univers', en: 'Universe' },
  'patch.capacite': { fr: 'Capacité par circuit (W)', en: 'Capacity per channel (W)' },
  'patch.occupation': { fr: 'Ce qui occupe l’univers {univers}', en: 'What occupies universe {univers}' },
  'patch.libres': { fr: 'Libre : {plages}', en: 'Free: {plages}' },
  'patch.aucunConflit': { fr: 'Aucun chevauchement.', en: 'No overlap.' },
  'patch.conflit': {
    fr: '« {premier} » ({debutA}–{finA}) chevauche « {second} » ({debutB}–{finB}).',
    en: '"{premier}" ({debutA}–{finA}) overlaps "{second}" ({debutB}–{finB}).'
  },
  'patch.pourquoiConflit': {
    fr: 'Un bloc de gradateurs occupe autant de canaux DMX qu’il a de circuits, à partir de son adresse. C’est ce qu’on oublie : une barre LED posée dans cette plage marche parfaitement sur le papier et allume des circuits au hasard sur le plateau.',
    en: 'A dimmer rack occupies as many DMX channels as it has circuits, starting at its address. That is what gets forgotten: a LED bar placed inside that range works perfectly on paper and lights random circuits on stage.'
  },
  'patch.repartir': { fr: 'Proposer une répartition', en: 'Suggest an allocation' },
  'patch.appliquer': { fr: 'Appliquer cette répartition', en: 'Apply this allocation' },
  'patch.repartitionRegle': {
    fr: 'Le plus gourmand d’abord, puis le premier circuit qui l’accepte. La règle est simple exprès : un régisseur doit pouvoir la refaire de tête sur le plateau, parce que c’est à la main qu’il branche.',
    en: 'Hungriest first, then the first channel that takes it. The rule is simple on purpose: a stage manager must be able to redo it in their head, because it is by hand that they plug in.'
  },
  'patch.proposition': {
    fr: 'Une proposition, pas une application : le plateau impose des contraintes que la base ignore.',
    en: 'A suggestion, not an application: the stage imposes constraints the database knows nothing about.'
  },
  'patch.circuitCharge': {
    fr: '{gradateur} circuit {numero} — {charge} W sur {utile} W utiles',
    en: '{gradateur} channel {numero} — {charge} W of {utile} W usable'
  },
  'patch.refuse': {
    fr: '« {nom} » ({puissance} W) n’entre dans aucun circuit.',
    en: '"{nom}" ({puissance} W) does not fit in any channel.'
  },
  'patch.marge': {
    fr: 'Une marge de 10 % est retirée de chaque circuit. C’est une pratique de terrain, pas une norme : une lampe halogène tire un fort appel de courant à l’allumage, et un circuit chargé à 100 % déclenche au premier plein feu.',
    en: 'A 10% margin is taken off each channel. This is common practice, not a standard: a halogen lamp draws a large inrush current when struck, and a channel loaded to 100% trips on the first full-up.'
  },
  'patch.pasUnControle': {
    fr: 'Ce calcul n’est pas un contrôle électrique. Il ignore la section des câbles, l’état du bloc et la simultanéité réelle. Le raccordement relève d’un électricien.',
    en: 'This calculation is not an electrical inspection. It ignores cable section, the state of the rack and real simultaneity. Wiring is the work of an electrician.'
  },

  // --- Conditions d'utilisation ---
  'conditions.titre': { fr: "Conditions d'utilisation", en: 'Terms of use' },
  'conditions.version': { fr: 'Version {version}', en: 'Version {version}' },
  'conditions.defilerJusquauBout': {
    fr: 'Faites défiler le texte jusqu’en bas pour continuer.',
    en: 'Scroll to the bottom of the text to continue.'
  },
  'conditions.jaiLu': {
    fr: 'J’ai lu et j’accepte ces conditions.',
    en: 'I have read and accept these terms.'
  },
  'conditions.accepter': { fr: 'Accepter et continuer', en: 'Accept and continue' },
  'conditions.lireSurLeSite': { fr: 'Lire sur le site', en: 'Read on the website' },

  // --- Paramètres ---
  'param.langue': { fr: 'Langue', en: 'Language' },

  // --- Refus du processus principal ---
  // Il ne renvoie qu'une clé : il ne sait pas quelle langue la fenêtre affiche.
  'erreur.inventaire.designationVide': {
    fr: 'La désignation est obligatoire.',
    en: 'A name is required.'
  },
  'erreur.inventaire.quantiteNegative': {
    fr: 'Une quantité ne peut pas être négative.',
    en: 'A quantity cannot be negative.'
  },
  'erreur.inventaire.puissanceNegative': {
    fr: 'Une puissance ne peut pas être négative.',
    en: 'A power rating cannot be negative.'
  },
  'erreur.inventaire.canauxObligatoires': {
    fr: 'Un projecteur DMX doit déclarer son nombre de canaux : sans lui, il occuperait zéro canal et le contrôle du patch dirait oui à un plan faux.',
    en: 'A DMX fixture must declare its channel count: without it, it would occupy no channel and the patch check would approve a wrong plan.'
  },
  'erreur.perche.nomVide': { fr: 'Le nom de la perche est obligatoire.', en: 'The bar needs a name.' },
  'erreur.perche.hauteurPositive': {
    fr: 'La hauteur doit être supérieure à zéro.',
    en: 'The height must be greater than zero.'
  },
  'erreur.perche.longueurPositive': {
    fr: 'La longueur doit être supérieure à zéro.',
    en: 'The length must be greater than zero.'
  },
  'erreur.gradateur.nomVide': { fr: 'Le nom du bloc est obligatoire.', en: 'The rack needs a name.' },
  'erreur.gradateur.adresseHorsLimites': {
    fr: 'L’adresse DMX doit être comprise entre 1 et 512.',
    en: 'The DMX address must be between 1 and 512.'
  },
  'erreur.gradateur.circuitsPositifs': {
    fr: 'Un bloc a au moins un circuit.',
    en: 'A rack has at least one channel.'
  },
  'erreur.gradateur.capacitePositive': {
    fr: 'La capacité d’un circuit doit être supérieure à zéro.',
    en: 'The capacity of a channel must be greater than zero.'
  },
  'erreur.gradateur.depasseUnivers': {
    fr: 'Ce bloc dépasse la fin de l’univers : son adresse plus ses circuits sortent des 512 canaux.',
    en: 'This rack runs past the end of the universe: its address plus its channels exceed 512.'
  },
  'erreur.appareil.deuxPatchs': {
    fr: 'Un appareil ne peut pas avoir à la fois un circuit de gradateur et une adresse DMX : personne ne saurait plus comment on l’allume.',
    en: 'A fixture cannot have both a dimmer channel and a DMX address: nobody would know how to bring it up.'
  },
  'erreur.appareil.adresseHorsLimites': {
    fr: 'L’adresse DMX doit être comprise entre 1 et 512.',
    en: 'The DMX address must be between 1 and 512.'
  },
  'erreur.appareil.circuitPositif': {
    fr: 'Un numéro de circuit commence à 1.',
    en: 'A channel number starts at 1.'
  },
  'erreur.patch.chevauchement': {
    fr: 'Deux appareils se chevauchent dans l’univers DMX.',
    en: 'Two devices overlap in the DMX universe.'
  },
  'erreur.patch.projecteurTropGourmand': {
    fr: 'Ce projecteur est plus gourmand qu’un circuit entier.',
    en: 'This fixture draws more than a whole channel can carry.'
  },
  'erreur.patch.circuitInconnu': {
    fr: 'Ce circuit n’existe pas dans les blocs déclarés.',
    en: 'That channel does not exist in the declared racks.'
  },
  'erreur.patch.aucunGradateur': {
    fr: 'Déclarez au moins un bloc de gradateurs avant de répartir.',
    en: 'Declare at least one dimmer rack before allocating.'
  }
} satisfies Record<string, Traduction>

export type CleTraduction = keyof typeof TEXTES

let langueCourante: Langue = 'fr'

export function definirLangue(langue: Langue): void {
  langueCourante = langue
}

export function langue(): Langue {
  return langueCourante
}

/** Traduit une clé, en remplaçant `{nom}` par `valeurs.nom`. */
export function t(cle: CleTraduction, valeurs?: Record<string, string | number>): string {
  const entree = TEXTES[cle]
  if (!entree) return cle
  const texte = langueCourante === 'en' ? entree.en || entree.fr : entree.fr
  if (!valeurs) return texte
  return texte.replace(/\{(\w+)\}/g, (entier, nom) =>
    nom in valeurs ? String(valeurs[nom]) : entier
  )
}

/**
 * Traduit une erreur remontée par le processus principal.
 *
 * Il n'envoie qu'une clé — il ne sait pas quelle langue cette fenêtre affiche.
 * Une clé sans traduction s'affiche telle quelle, en toutes lettres : c'est
 * laid, donc remarqué, donc corrigé. Un message français figé passerait
 * inaperçu à l'inverse.
 */
export function traduireErreur(brut: string): string {
  let cle = brut
  let valeurs: Record<string, string | number> | undefined

  // Quand le message cite une valeur, la clé et la valeur voyagent ensemble en
  // JSON — un séparateur invisible dans le code est plus court et illisible.
  if (brut.startsWith('{')) {
    try {
      const decode = JSON.parse(brut) as { cle: string } & Record<string, string>
      cle = decode.cle
      valeurs = decode
    } catch {
      // Ce n'était pas du JSON : on affichera le texte brut.
    }
  }

  const complete = `erreur.${cle}` as CleTraduction
  const traduit = t(complete, valeurs)
  return traduit === complete ? brut : traduit
}

export const LANGUES: { code: Langue; nom: string }[] = [
  { code: 'fr', nom: 'Français' },
  { code: 'en', nom: 'English' }
]
