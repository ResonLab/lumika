import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Fabrique `docs/en/index.html` depuis `docs/index.html`, par substitutions.
 *
 * **Deux pages écrites à la main divergent au premier correctif** : on corrige
 * une tournure d'un côté, on oublie l'autre, et la moitié des lecteurs voit une
 * version périmée. Ici le CSS et le JavaScript ne sont pas touchés du tout —
 * `tests/coherence-site.mjs` refuse d'ailleurs qu'ils diffèrent.
 *
 * **Le script s'arrête si une chaîne est introuvable.** Une traduction
 * silencieusement absente est pire qu'une erreur bruyante : elle laisse un
 * paragraphe français au milieu d'une page anglaise, et personne ne le voit
 * avant un lecteur anglophone.
 *
 *   npm run site:traduire
 */
const PROJET = join(dirname(fileURLToPath(import.meta.url)), '..')

const TRADUCTIONS = [
  ['<html lang="fr">', '<html lang="en">'],
  [
    "<title>Lumika — le plan de feu d'un théâtre, perches et patch</title>",
    '<title>Lumika — the lighting plan of a theatre, bars and patch</title>'
  ],
  [
    '<meta name="description" content="Lumika tient le plan de feu d\'un théâtre : perches, inventaire de projecteurs et de lampes, appareils accrochés, et le patch — circuit de gradateur ou adresse DMX. Vos données restent sur votre ordinateur." />',
    '<meta name="description" content="Lumika holds the lighting plan of a theatre: bars, inventory of fixtures and lamps, hung units, and the patch — dimmer channel or DMX address. Your data stays on your computer." />'
  ],
  [
    '<meta property="og:description" content="Le plan de feu d\'un théâtre : perches, inventaire, patch DMX et gradateurs. Vos données restent chez vous." />',
    '<meta property="og:description" content="The lighting plan of a theatre: bars, inventory, DMX and dimmer patch. Your data stays with you." />'
  ],

  // Le badge d'état : « ÉCRIT » n'est pas un mot anglais. Le contrôle de
  // cohérence compare les badges d'état entre les deux langues, et il a
  // signalé l'oubli — c'est exactement ce pour quoi il a été écrit.
  ['<span class="num">ÉCRIT</span>', '<span class="num">WRITTEN</span>'],

  // Chemins : la page anglaise vit un cran plus bas.
  ['src="resonlab.svg"', 'src="../resonlab.svg"'],
  ['href="lumika.svg"', 'href="../lumika.svg"'],
  ['src="lumika.svg"', 'src="../lumika.svg"'],
  ['<a href="en/" class="langue" hreflang="en">EN</a>', '<a href="../" class="langue" hreflang="fr">FR</a>'],
  ['href="conditions.html"', 'href="terms.html"'],

  // Navigation, pied.
  ["<a href=\"#ce-quelle-fait\">Ce qu'elle fait</a>", '<a href="#ce-quelle-fait">What it does</a>'],
  ["<a href=\"#honnetete\" class=\"hide-sm\">Ce qu'elle ne fait pas</a>", '<a href="#honnetete" class="hide-sm">What it does not do</a>'],
  ['<a href="#principes" class="hide-sm">Nos principes</a>', '<a href="#principes" class="hide-sm">Our principles</a>'],
  ['aria-label="Changer le thème"', 'aria-label="Change theme"'],
  ['— une application de <a href="https://resonlab.github.io">ResonLab</a>, Valais, Suisse.', '— an application by <a href="https://resonlab.github.io">ResonLab</a>, Valais, Switzerland.'],
  ['<p>Logiciel libre, sous licence MIT.</p>', '<p>Free software, MIT licence.</p>'],
  ["<a href=\"terms.html\">Conditions d'utilisation</a>", '<a href="terms.html">Terms of use</a>'],

  // Hero.
  ['<p class="etat-ligne">ÉCRITE — PAS ENCORE PUBLIÉE</p>', '<p class="etat-ligne">WRITTEN — NOT YET RELEASED</p>'],
  ['<h1>Le plan de feu, <span class="grad-text">et son patch</span>.</h1>', '<h1>The lighting plan, <span class="grad-text">and its patch</span>.</h1>'],
  [
    `Les perches, l'inventaire, les appareils accrochés, et ce qui les allume — un circuit de
      gradateur pour le traditionnel, une adresse DMX pour le reste. Sur votre machine, sans compte
      ni abonnement.`,
    `The bars, the inventory, the hung fixtures, and what brings them up — a dimmer channel for
      conventional gear, a DMX address for everything else. On your machine, with no account and
      no subscription.`
  ],
  ['>Le code<', '>The code<'],
  [">Ce qu'elle ne fait pas<", '>What it does not do<'],

  // Ce qu'elle fait.
  ['<h2 class="titre reveal">Quatre écrans, et un seul sujet</h2>', '<h2 class="titre reveal">Four screens, one subject</h2>'],
  [
    `Un régisseur lumière ne loue rien et ne facture rien. Il accroche, il patche, il change des
      lampes. Lumika ne fait que ça.`,
    `A lighting technician rents nothing and invoices nothing. They hang, they patch, they change
      lamps. Lumika does only that.`
  ],
  ['<h3>Le plan de feu</h3>', '<h3>The lighting plan</h3>'],
  [
    `<p>Chaque appareil avec son numéro — celui qu'on crie pendant le montage — sa perche, sa
        position latérale, sa gélatine, son gobo et sa fonction.</p>`,
    `<p>Every fixture with its number — the one shouted during the rig — its bar, its lateral
        position, its gel, its gobo and its purpose.</p>`
  ],
  [
    `<p>Le patch suit le genre de l'appareil : un traditionnel demande un circuit, un DMX une
        adresse. <strong>Jamais les deux</strong> — un appareil qui porte les deux est un appareil
        dont personne ne sait comment on l'allume.</p>`,
    `<p>The patch follows the kind of fixture: a conventional one wants a channel, a DMX one an
        address. <strong>Never both</strong> — a fixture carrying both is one nobody knows how to
        bring up.</p>`
  ],
  ['<h3>Les perches</h3>', '<h3>The bars</h3>'],
  [
    `<p>La vue de face du gril : les barres à leur hauteur, et les appareils à leur place
        dessus.</p>`,
    `<p>The front view of the grid: the bars at their height, and the fixtures in their place on
        them.</p>`
  ],
  [
    `<p>Deux projecteurs trop proches, ça se voit d'un coup d'œil et jamais dans une colonne de
        nombres. La distance se compte depuis le nu du cadre — une perche de face est donc à
        distance négative, et c'est normal.</p>`,
    `<p>Two fixtures too close together shows at a glance and never in a column of numbers.
        Distance is measured from the proscenium line — a front-of-house bar therefore has a
        negative distance, and that is correct.</p>`
  ],
  ['<h3>Le patch</h3>', '<h3>The patch</h3>'],
  [
    `<p>Les blocs de gradateurs, ce qui occupe l'univers DMX, <strong>les chevauchements</strong>,
        et les plages restées libres.</p>`,
    `<p>The dimmer racks, what occupies the DMX universe, <strong>the overlaps</strong>, and the
        ranges left free.</p>`
  ],
  [
    `<p>Plus une proposition de répartition des projecteurs traditionnels sur les circuits : le
        plus gourmand d'abord, puis le premier circuit qui l'accepte. La règle est simple exprès —
        un régisseur doit pouvoir la refaire de tête sur le plateau, parce que c'est à la main
        qu'il branche.</p>`,
    `<p>Plus a suggested allocation of conventional fixtures across the channels: hungriest first,
        then the first channel that takes it. The rule is simple on purpose — a technician must be
        able to redo it in their head on stage, because it is by hand that they plug in.</p>`
  ],
  ["<h3>L'inventaire</h3>", '<h3>The inventory</h3>'],
  [
    `<p>Projecteurs, <strong>lampes</strong> et accessoires, avec un seuil d'alerte.</p>`,
    `<p>Fixtures, <strong>lamps</strong> and accessories, with an alert threshold.</p>`
  ],
  [
    `<p>Les lampes sont la raison d'être de cet écran. Un projecteur, on l'a ou on ne l'a pas.
        Une lampe claque — et s'en apercevoir le soir de la générale, sans rechange du bon culot,
        c'est un projecteur mort pour toute la série.</p>`,
    `<p>The lamps are why this screen exists. A fixture you either have or you do not. A lamp
        blows — and finding out on dress rehearsal night, with no spare of the right base, means a
        fixture lost for the whole run.</p>`
  ],

  // Honnêteté.
  ["<h2 class=\"titre reveal\">Le défaut qu'elle existe pour éviter</h2>", '<h2 class="titre reveal">The fault it exists to prevent</h2>'],
  [
    `<strong>Un bloc de gradateurs occupe lui-même des canaux DMX</strong> — autant qu'il a de
        circuits, à partir de son adresse. Un bloc de 24 adressé en 1 occupe les canaux 1 à 24.`,
    `<strong>A dimmer rack occupies DMX channels itself</strong> — as many as it has circuits,
        starting at its address. A 24-way rack addressed at 1 occupies channels 1 to 24.`
  ],
  [
    `Y poser une barre LED en 12 marche parfaitement sur le papier : ce sont deux appareils
        différents, dans deux écrans différents. Sur le plateau, la barre allume des circuits au
        hasard — et on ne s'en aperçoit qu'une fois tout accroché, en hauteur, souvent la veille.`,
    `Placing a LED bar at 12 works perfectly on paper: they are two different devices, in two
        different screens. On stage, the bar lights random circuits — and you only find out once
        everything is hung, at height, often the night before.`
  ],
  [
    `Lumika compare les blocs et les appareils DMX <strong>dans le même espace</strong>. Les
        vérifier séparément aurait laissé passer exactement ce cas.`,
    `Lumika compares racks and DMX fixtures <strong>in the same space</strong>. Checking them
        separately would have let exactly this case through.`
  ],
  ['<span class="num">PAS UN CONTRÔLE</span>', '<span class="num">NOT AN INSPECTION</span>'],
  ["<h3>La répartition n'est pas électrique</h3>", '<h3>The allocation is not electrical</h3>'],
  [
    `<p>Elle additionne les watts que vous avez saisis. Elle ignore la section des câbles,
          l'état du bloc, la simultanéité réelle et la puissance disponible en amont.</p>`,
    `<p>It adds up the wattage you entered. It ignores cable section, the state of the rack, real
          simultaneity and the supply available upstream.</p>`
  ],
  [
    `<p>La marge de 10 % par circuit est une pratique de terrain, pas une norme. <strong>Le
          raccordement relève d'un électricien.</strong></p>`,
    `<p>The 10% margin per channel is common practice, not a standard. <strong>Wiring is the work
          of an electrician.</strong></p>`
  ],
  ['<span class="num">HORS SUJET</span>', '<span class="num">OUT OF SCOPE</span>'],
  ['<h3>Ni charges, ni accroche</h3>', '<h3>Neither loads nor rigging</h3>'],
  [
    `<p>Lumika enregistre où vous posez un appareil. Elle ne calcule aucune charge, ne connaît
          ni crochets, ni élingues, ni moteurs, ni la charge admissible du gril.</p>`,
    `<p>Lumika records where you place a fixture. It computes no load, and knows nothing of hooks,
          safety bonds, motors, or the permissible load of the grid.</p>`
  ],
  [
    `<p>Une perche surchargée tombe sur le plateau. <strong>L'accroche relève de personnes
          formées.</strong></p>`,
    `<p>An overloaded bar falls onto the stage. <strong>Rigging is the work of trained
          people.</strong></p>`
  ],
  ['<span class="num">PAS DE CONDUITE</span>', '<span class="num">NO CUE STACK</span>'],
  ['<h3>Elle ne pilote rien</h3>', '<h3>It controls nothing</h3>'],
  [
    `<p>Les mémoires, les séquences, les temps de transfert, c'est le travail d'une console.
          Personne n'a besoin d'une deuxième console qui ne pilote rien.</p>`,
    `<p>Memories, sequences, fade times — that is the work of a console. Nobody needs a second
          console that controls nothing.</p>`
  ],
  [
    `<p>Lumika prépare le montage. Ce qui se passe pendant le spectacle ne la regarde pas.</p>`,
    `<p>Lumika prepares the rig. What happens during the show is none of its business.</p>`
  ],

  // Principes.
  ['<h2 class="titre reveal">Nos principes</h2>', '<h2 class="titre reveal">Our principles</h2>'],
  ['<h3>Aucune connexion</h3>', '<h3>No connection</h3>'],
  ["<p>Pas de compte, pas d'abonnement, aucune statistique d'usage. Votre plan de feu ne quitte jamais votre machine.</p>", '<p>No account, no subscription, no usage tracking. Your lighting plan never leaves your machine.</p>'],
  ['<h3>Des messages qui expliquent</h3>', '<h3>Messages that explain</h3>'],
  ['<p>Précis, jamais une erreur technique brute. Quand le logiciel refuse un patch, il dit quel appareil chevauche quel bloc.</p>', '<p>Precise, never a raw technical error. When the software refuses a patch, it says which fixture overlaps which rack.</p>'],
  ['<h3>Une formule, un seul endroit</h3>', '<h3>One formula, one place</h3>'],
  ["<p>Le calcul du patch vit dans un fichier, éprouvé contre des valeurs calculées à la main. Un patch faux ne se voit qu'une fois tout accroché.</p>", '<p>The patch calculation lives in one file, tested against values computed by hand. A wrong patch only shows once everything is hung.</p>'],
  ["<h3>Rien qu'on ne puisse rouvrir</h3>", '<h3>Nothing you cannot reopen</h3>'],
  [
    "<p>Formats lisibles, code simple, licence MIT. Dans dix ans votre plan de feu s'ouvrira encore.</p>",
    '<p>Readable formats, simple code, MIT licence. In ten years your lighting plan will still open.</p>'
  ]
]

/**
 * Cherche une chaîne **sans se soucier des espaces**.
 *
 * Un premier jet comparait les chaînes à l'identique, et douze substitutions
 * sur soixante-dix échouaient : l'indentation du fichier ne correspondait pas
 * à celle écrite ici. Un script qui casse sur un retour à la ligne est le même
 * défaut qu'un test qui compare du texte source — il ne distingue pas une
 * vraie disparition d'une remise en forme, et on finit par le contourner.
 *
 * Les espaces du remplacement, eux, sont conservés tels quels : c'est le
 * fichier produit, il doit rester lisible.
 */
const CARACTERES_SPECIAUX = /[.*+?^${}()|[\]\\]/g

function motifSouple(chaine) {
  const morceaux = chaine
    .split(/\s+/)
    .filter((m) => m.length > 0)
    .map((m) => m.replace(CARACTERES_SPECIAUX, '\\$&'))
  return new RegExp(morceaux.join('\\s+'), 'g')
}

const source = readFileSync(join(PROJET, 'docs/index.html'), 'utf-8')
let page = source
const manquantes = []

for (const [avant, apres] of TRADUCTIONS) {
  const motif = motifSouple(avant)
  if (!motif.test(page)) {
    manquantes.push(avant.slice(0, 72).replace(/\s+/g, ' '))
    continue
  }
  motif.lastIndex = 0
  page = page.replace(motif, () => apres)
}

if (manquantes.length > 0) {
  console.error('Chaînes introuvables — la page anglaise ne sera pas écrite :')
  for (const m of manquantes) console.error(`  · ${m}…`)
  process.exit(1)
}

mkdirSync(join(PROJET, 'docs/en'), { recursive: true })
writeFileSync(join(PROJET, 'docs/en/index.html'), page, 'utf-8')
console.log(`docs/en/index.html écrit — ${TRADUCTIONS.length} substitutions`)
