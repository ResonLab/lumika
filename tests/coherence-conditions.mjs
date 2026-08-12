import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

/**
 * Les conditions affichées dans l'application et celles publiées sur le site
 * doivent dire la même chose.
 *
 * **Le piège que cette suite empêche** : modifier le texte dans
 * `src/partage/conditions.ts` et oublier de régénérer les pages, ou l'inverse.
 * L'utilisateur lirait alors sur le site autre chose que ce qu'il a accepté
 * dans l'application — et personne ne saurait laquelle des deux versions
 * l'engage.
 *
 * C'est la même vérification que dans Scenika et Ohmnia, pour la même raison.
 */
const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lire = (relatif) => readFileSync(join(RACINE, relatif), 'utf-8').replaceAll('\r\n', '\n')

let echecs = 0
const echec = (message) => {
  console.log(`  ÉCHEC : ${message}`)
  echecs += 1
}

const source = lire('src/partage/conditions.ts')

/* ── 1. Le texte du code se retrouve sur les deux pages ──────────────────── */

const pageFr = lire('docs/conditions.html')
const pageEn = lire('docs/en/terms.html')

// Les paragraphes sont les longues chaînes du fichier source. On ne compare
// pas les courtes : « fr », « en » et les clés techniques n'ont rien à faire
// sur une page.
const bloc = source.slice(
  source.indexOf('export const CONDITIONS_UTILISATION'),
  source.indexOf('/** Ce qu’on retient')
)

/**
 * Les paragraphes, relevés **par leur place dans la structure**.
 *
 * Un premier jet les repérait à leur longueur — « une chaîne de plus de 60
 * caractères est un paragraphe ». Le proxy a tenu jusqu'au jour où deux titres
 * français ont dépassé 60 caractères sans que leurs traductions les dépassent :
 * le contrôle annonçait 22 paragraphes d'un côté et 20 de l'autre alors que les
 * deux pages étaient parfaitement alignées. **Un faux échec use un contrôle
 * aussi sûrement qu'un faux succès** — on finit par le contourner, puis par le
 * supprimer.
 *
 * Le découpage suit donc la structure du fichier, comme le fait
 * `scripts/publier-conditions.mjs` : dans chaque section, le premier couple
 * fr/en est le titre, les suivants sont les paragraphes.
 */
const francais = []
const anglais = []
for (const section of bloc.split(/\{\s*\n\s*titre:/).slice(1)) {
  const couples = [...section.matchAll(/(fr|en): (['"])((?:[^\\]|\\.)*?)\2/g)]
  // Les deux premiers relevés sont le « fr » et le « en » du titre.
  for (const trouve of couples.slice(2)) {
    const [, langue, , texte] = trouve
    ;(langue === 'fr' ? francais : anglais).push(texte)
  }
}

if (francais.length < 12) {
  echec(`seulement ${francais.length} paragraphes français trouvés — le format a changé`)
}
if (anglais.length !== francais.length) {
  echec(`${francais.length} paragraphes en français, ${anglais.length} en anglais`)
}

/**
 * **Aucune traduction vide.**
 *
 * Trou trouvé en sabotant : vider un `en:` laissait les deux comptes égaux —
 * une chaîne vide reste une chaîne — et produisait un paragraphe vide sur la
 * page anglaise. Le contrôle affichait OK pendant qu'un engagement disparaissait
 * pour la moitié des lecteurs.
 *
 * Un seuil bas, exprès : on ne juge pas la qualité d'une traduction, on refuse
 * seulement qu'un paragraphe entier s'évapore.
 */
for (const [numero, texte] of francais.entries()) {
  if (texte.trim().length < 20) {
    echec(`le paragraphe français n° ${numero + 1} est vide ou quasi vide`)
  }
}
for (const [numero, texte] of anglais.entries()) {
  if (texte.trim().length < 20) {
    echec(
      `le paragraphe anglais n° ${numero + 1} est vide ou quasi vide — ` +
        `en français : « ${(francais[numero] ?? '').slice(0, 60)}… »`
    )
  }
}

const normaliser = (texte) => texte.replaceAll("\\'", "'")

for (const paragraphe of francais) {
  if (!pageFr.includes(normaliser(paragraphe))) {
    echec(`paragraphe absent de docs/conditions.html : « ${paragraphe.slice(0, 60)}… »`)
  }
}
for (const paragraphe of anglais) {
  if (!pageEn.includes(normaliser(paragraphe))) {
    echec(`paragraphe absent de docs/en/terms.html : « ${paragraphe.slice(0, 60)}… »`)
  }
}

/* ── 2. La version affichée suit celle du code ───────────────────────────── */

const version = source.match(/VERSION_CONDITIONS = '([^']+)'/)?.[1]
if (!version) echec('VERSION_CONDITIONS introuvable')
else {
  for (const [nom, page] of [['docs/conditions.html', pageFr], ['docs/en/terms.html', pageEn]]) {
    if (!page.includes(`VERSION ${version}`)) {
      echec(`${nom} n'affiche pas « VERSION ${version} »`)
    }
  }
}

/* ── 3. Ce qui ne doit jamais disparaître ────────────────────────────────── */

// Le point 2 est la raison d'être de ces conditions : la répartition sur les
// circuits additionne des watts, elle ne contrôle rien de l'installation. Le
// point 4 en est la suite : Lumika ne calcule aucune charge d'accroche, et une
// perche surchargée tombe sur le plateau. Si quelqu'un allège un jour l'un de
// ces points, cette suite doit le dire, et pas seulement en français.
//
// **Les tournures surveillées évitent toute apostrophe.** C'est exactement ce
// qui avait rendu le contrôle de Scenika incapable d'échouer : les phrases de
// référence portaient une apostrophe droite, les pages une apostrophe
// typographique, et la comparaison ne pouvait jamais mordre tout en affichant
// OK.
const engagements = [
  ['pas un contrôle électrique', pageFr, 'français'],
  ['not an electrical inspection', pageEn, 'anglais'],
  ['relève d’un électricien', pageFr, 'français'],
  ['the work of an electrician', pageEn, 'anglais'],
  ['ne calcule aucune charge', pageFr, 'français'],
  ['computes no load', pageEn, 'anglais'],
  ['une pratique de terrain, pas une norme', pageFr, 'français'],
  ['common practice, not a standard', pageEn, 'anglais']
]
for (const [phrase, page, langue] of engagements) {
  if (!page.includes(phrase)) {
    echec(`la mise en garde « ${phrase} » a disparu de la page en ${langue}`)
  }
}

// Ce contrôle-ci a un précédent qui n'a pas mordu au premier essai chez
// Scenika : les phrases de référence portaient une apostrophe droite, les
// pages une apostrophe typographique. Il ne pouvait donc **jamais** échouer,
// tout en affichant OK — le pire cas de figure. Les tournures retenues ici
// évitent l'apostrophe, et le contrôle ci-dessous vérifie qu'elles existent
// bien dans la source : une tournure introuvable des deux côtés serait à
// nouveau un contrôle mort.
for (const [phrase, , langue] of engagements) {
  if (!source.includes(phrase)) {
    echec(
      `la tournure « ${phrase} » (${langue}) ne figure plus dans conditions.ts : ` +
        'ce contrôle ne vérifierait plus rien'
    )
  }
}

/* ── 4. L'écran d'acceptation ne peut pas être contourné ─────────────────── */

const ecran = lire('src/renderer/src/components/ConditionsUtilisation.tsx')
if (!/disabled=\{!luJusquauBout\}/.test(ecran)) {
  echec("la case s'active sans que le texte ait été lu jusqu'au bout")
}
if (!/disabled=\{!coche\}/.test(ecran)) {
  echec("le bouton d'acceptation ne dépend plus de la case")
}

// **Le mécanisme peut exister dans le code et rester inatteignable.** Scenika
// était exactement dans cet état : `disabled={!luJusquauBout}` était bien là,
// mais `.conditions-texte` n'avait aucune règle CSS. La zone n'était donc pas
// une boîte à défilement, son `onScroll` ne se déclenchait jamais, la case
// restait grise pour toujours — et l'application ne démarrait plus du tout.
// Trouvé en la lançant, pas en la relisant.
const styles = lire('src/renderer/src/styles.css')
const blocTexte = styles.slice(
  styles.indexOf('.conditions-texte {'),
  styles.indexOf('}', styles.indexOf('.conditions-texte {'))
)
if (!styles.includes('.conditions-texte {')) {
  echec('.conditions-texte n’a aucune règle CSS : la zone ne défilera pas et la case restera grise')
} else {
  if (!/overflow-y:\s*auto|overflow-y:\s*scroll/.test(blocTexte)) {
    echec('.conditions-texte n’a pas d’overflow-y : ce n’est pas une boîte à défilement')
  }
  if (!/max-height:/.test(blocTexte)) {
    echec('.conditions-texte n’a pas de max-height : rien ne la forcera à défiler')
  }
}

// Le filet de sécurité : un texte qui tient sans défiler doit compter comme lu,
// sinon l'écran est un piège sur un grand écran.
if (!ecran.includes('scrollHeight <= zone.clientHeight')) {
  echec(
    "l'écran ne traite pas le cas où le texte tient sans défiler : " +
      'la case resterait grise pour toujours'
  )
}

const app = lire('src/renderer/src/App.tsx')
if (!app.includes('if (!conditionsAcceptees)')) {
  echec("l'application ne bloque plus sur l'écran des conditions")
}
if (!app.includes('VERSION_CONDITIONS')) {
  echec("l'acceptation n'est plus liée à la version : un texte modifié passerait sans relecture")
}

/* ── 5. Les pages existent et sont servables ─────────────────────────────── */

for (const page of ['docs/conditions.html', 'docs/en/terms.html']) {
  if (!existsSync(join(RACINE, page))) echec(`${page} est absent`)
}

console.log(
  echecs === 0
    ? `CONDITIONS COHÉRENTES (${francais.length} paragraphes, version ${version}, deux langues)`
    : `${echecs} PROBLÈME(S) SUR LES CONDITIONS`
)
process.exit(echecs === 0 ? 0 : 1)
