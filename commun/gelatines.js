/**
 * Le référentiel des gélatines courantes.
 *
 * **Le champ reste libre, et c'est la décision qui structure ce fichier.** Un
 * théâtre a toujours dans ses tiroirs une gélatine qui n'est dans aucune liste :
 * une référence d'un fabricant qu'on n'a pas prévu, un reste d'une production
 * précédente, un morceau de diffusion coupé à la main. Une liste fermée
 * obligerait le régisseur à mentir sur son plan de feu — et un plan qui ment ne
 * sert plus à rien.
 *
 * Ce module ne valide donc rien. Il **reconnaît** ce qu'il peut, pour proposer
 * une saisie plus rapide et afficher une pastille de couleur ; ce qu'il ne
 * reconnaît pas passe tel quel.
 *
 * **La couleur affichée est une approximation, et il faut le dire à l'écran.**
 * Un écran émet de la lumière, une gélatine en filtre : la même référence rend
 * autrement selon la lampe, l'intensité et le gradateur. La pastille sert à
 * repérer une erreur grossière — un rose là où on attendait un bleu — pas à
 * juger d'une teinte.
 *
 * **Écrit en JavaScript, types en JSDoc**, comme `commun/patch.js` et pour la
 * même raison : ce fichier doit tourner dans l'application, dans les tests, et
 * dans un navigateur le jour où une page publique en aura besoin.
 */

/**
 * @typedef {object} Gelatine
 * @property {string} reference La référence telle qu'elle est imprimée sur le rouleau.
 * @property {string} nom Le nom du fabricant.
 * @property {string} fabricant
 * @property {string} couleur Approximation de la couleur transmise, en hexadécimal.
 */

/**
 * Les gélatines les plus courantes d'un théâtre.
 *
 * **Liste volontairement courte.** Les catalogues comptent plusieurs centaines
 * de références ; en recopier trois cents dont personne n'utilise deux cent
 * cinquante ne rendrait pas la saisie plus rapide, ça la noierait. Celles-ci
 * sont les teintes de base d'un plan de feu — les faces, les contres, les
 * ambiances, les diffusions — et le champ reste libre pour tout le reste.
 *
 * @type {Gelatine[]}
 */
export const GELATINES = [
  // ── Ambres et paille : les faces chaudes ──────────────────────────────────
  { reference: 'L103', nom: 'Straw', fabricant: 'Lee', couleur: '#FFE9A8' },
  { reference: 'L104', nom: 'Deep Amber', fabricant: 'Lee', couleur: '#FFB33C' },
  { reference: 'L134', nom: 'Golden Amber', fabricant: 'Lee', couleur: '#FF9A2E' },
  { reference: 'L147', nom: 'Apricot', fabricant: 'Lee', couleur: '#FFC98C' },
  { reference: 'L764', nom: 'Sun Colour Straw', fabricant: 'Lee', couleur: '#FFD98A' },

  // ── Rouges et roses ───────────────────────────────────────────────────────
  { reference: 'L106', nom: 'Primary Red', fabricant: 'Lee', couleur: '#D41B1B' },
  { reference: 'L113', nom: 'Magenta', fabricant: 'Lee', couleur: '#C72E86' },
  { reference: 'L157', nom: 'Pink', fabricant: 'Lee', couleur: '#F2789F' },
  { reference: 'L182', nom: 'Light Red', fabricant: 'Lee', couleur: '#E44A3A' },

  // ── Bleus : les contres et les nuits ──────────────────────────────────────
  { reference: 'L119', nom: 'Dark Blue', fabricant: 'Lee', couleur: '#1B3A9E' },
  { reference: 'L120', nom: 'Deep Blue', fabricant: 'Lee', couleur: '#0F2E8C' },
  { reference: 'L132', nom: 'Medium Blue', fabricant: 'Lee', couleur: '#2A63C4' },
  { reference: 'L161', nom: 'Slate Blue', fabricant: 'Lee', couleur: '#7FA6D9' },
  { reference: 'L201', nom: 'Full CT Blue', fabricant: 'Lee', couleur: '#BFD8F5' },
  { reference: 'L202', nom: 'Half CT Blue', fabricant: 'Lee', couleur: '#D6E6F8' },

  // ── Verts ─────────────────────────────────────────────────────────────────
  { reference: 'L124', nom: 'Dark Green', fabricant: 'Lee', couleur: '#1E7A3C' },
  { reference: 'L139', nom: 'Primary Green', fabricant: 'Lee', couleur: '#2FA355' },

  // ── Corrections chaudes ───────────────────────────────────────────────────
  { reference: 'L204', nom: 'Full CT Orange', fabricant: 'Lee', couleur: '#FFB870' },
  { reference: 'L205', nom: 'Half CT Orange', fabricant: 'Lee', couleur: '#FFD3A6' },

  // ── Diffusions : incolores, mais elles changent tout ──────────────────────
  { reference: 'L216', nom: 'White Diffusion', fabricant: 'Lee', couleur: '#F4F4F0' },
  { reference: 'L252', nom: 'Eighth White Diffusion', fabricant: 'Lee', couleur: '#FAFAF7' },
  { reference: 'R114', nom: 'Hamburg Frost', fabricant: 'Rosco', couleur: '#F6F6F2' },
  { reference: 'R119', nom: 'Light Hamburg Frost', fabricant: 'Rosco', couleur: '#F9F9F6' },

  // ── Rosco, quelques classiques ────────────────────────────────────────────
  { reference: 'R02', nom: 'Bastard Amber', fabricant: 'Rosco', couleur: '#FFDCC0' },
  { reference: 'R33', nom: 'No Color Pink', fabricant: 'Rosco', couleur: '#FBD8DF' },
  { reference: 'R80', nom: 'Primary Blue', fabricant: 'Rosco', couleur: '#1A46A8' }
]

/**
 * Normalise une saisie pour la comparaison.
 *
 * On retire tout ce qui n'est ni lettre ni chiffre — espaces, tirets, points —
 * et on met en majuscules. « lee 201 », « L-201 » et « l201 » désignent la même
 * gélatine, et un régisseur qui tape vite ne doit pas être puni pour cela.
 *
 * @param {string} texte
 * @returns {string}
 */
function normaliser(texte) {
  return String(texte)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

/**
 * Retrouve une gélatine à partir d'une saisie libre.
 *
 * Reconnaît « L201 », « l 201 », « LEE201 », et « 201 » seul — ce dernier étant
 * le cas le plus fréquent : sur un plan de feu, personne n'écrit le fabricant.
 *
 * **Un numéro nu est ambigu et le choix est assumé** : `114` existe chez Lee et
 * chez Rosco. On rend la première de la liste, qui est aussi la plus courante en
 * théâtre francophone. Écrire la référence complète lève l'ambiguïté, et c'est
 * ce que fait la suggestion de saisie.
 *
 * @param {string} saisie
 * @returns {Gelatine | null}
 */
export function trouverGelatine(saisie) {
  const cherche = normaliser(saisie)
  if (cherche === '') return null

  // 1. La référence exacte, une fois normalisée.
  const exacte = GELATINES.find((g) => normaliser(g.reference) === cherche)
  if (exacte) return exacte

  // 2. Le fabricant écrit en toutes lettres : « LEE201 » → « L201 ».
  const prefixes = [
    ['LEE', 'L'],
    ['ROSCO', 'R']
  ]
  for (const [long, court] of prefixes) {
    if (cherche.startsWith(long)) {
      const reduit = court + cherche.slice(long.length)
      const trouve = GELATINES.find((g) => normaliser(g.reference) === reduit)
      if (trouve) return trouve
    }
  }

  // 3. Le numéro seul. On n'accepte que des chiffres : sans cela, « BLEU »
  //    finirait par correspondre à n'importe quoi.
  if (/^\d+$/.test(cherche)) {
    const numero = String(Number(cherche))
    const trouve = GELATINES.find(
      (g) => String(Number(normaliser(g.reference).replace(/^[A-Z]+/, ''))) === numero
    )
    if (trouve) return trouve
  }

  return null
}

/**
 * La couleur à afficher pour une saisie, ou `null` si on ne reconnaît rien.
 *
 * Rendre une couleur par défaut serait pire que de n'en rendre aucune : une
 * pastille grise sur une gélatine inconnue se confond avec une pastille grise
 * sur une diffusion neutre, et le régisseur croirait que sa saisie a été
 * reconnue.
 *
 * @param {string} saisie
 * @returns {string | null}
 */
export function couleurGelatine(saisie) {
  return trouverGelatine(saisie)?.couleur ?? null
}
