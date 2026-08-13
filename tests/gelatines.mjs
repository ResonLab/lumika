import { GELATINES, couleurGelatine, trouverGelatine } from '../commun/gelatines.js'

/**
 * Le référentiel des gélatines.
 *
 * **Ce que ces tests protègent avant tout, c'est le champ libre.** La tentation,
 * en ajoutant un référentiel, est de refuser ce qui n'y figure pas. Un théâtre a
 * toujours une gélatine hors catalogue, et un plan de feu qui refuse la réalité
 * ne sert plus à rien. Plusieurs cas ci-dessous existent uniquement pour
 * vérifier qu'une saisie inconnue **passe** au lieu d'être corrigée de force.
 */
let echecs = 0
const verifier = (intitule, condition, detail = '') => {
  if (condition) {
    console.log(`  OK   ${intitule}`)
  } else {
    console.log(`  ECHEC ${intitule}${detail ? ` — ${detail}` : ''}`)
    echecs += 1
  }
}

console.log('\n=== La saisie reste libre ===')

for (const inconnue of ['Gélatine du tiroir', 'XYZ42', 'diffusion maison', '']) {
  verifier(
    `« ${inconnue} » n'est pas reconnue, et c'est normal`,
    trouverGelatine(inconnue) === null
  )
}

// **Ce cas discrimine** : une implémentation qui rendrait une couleur par
// défaut passerait tous les tests de reconnaissance et échouerait ici.
verifier(
  'une saisie inconnue ne rend aucune couleur plutôt qu une couleur par défaut',
  couleurGelatine('Gélatine du tiroir') === null
)

console.log('\n=== Les formes de saisie ===')

const attendu = GELATINES.find((g) => g.reference === 'L201')
for (const forme of ['L201', 'l201', 'L 201', 'L-201', 'lee 201', 'LEE201', '201']) {
  verifier(`« ${forme} » retrouve ${attendu.reference}`, trouverGelatine(forme) === attendu)
}

// **Ce cas discrimine le repli sur le numéro seul** : « 02 » et « 2 » doivent
// mener à la même gélatine, ce qu'une comparaison de chaînes raterait.
const bastard = GELATINES.find((g) => g.reference === 'R02')
verifier('« 02 » et « 2 » mènent tous deux à R02', trouverGelatine('02') === bastard && trouverGelatine('2') === bastard)

// Un mot qui n'est pas un numéro ne doit pas tomber dans le repli numérique.
verifier('un mot sans chiffre ne déclenche pas le repli sur le numéro', trouverGelatine('BLEU') === null)

console.log('\n=== Le référentiel lui-même ===')

verifier('aucune référence en double', new Set(GELATINES.map((g) => g.reference)).size === GELATINES.length)

verifier(
  'chaque gélatine porte une couleur hexadécimale valide',
  GELATINES.every((g) => /^#[0-9A-F]{6}$/i.test(g.couleur)),
  GELATINES.filter((g) => !/^#[0-9A-F]{6}$/i.test(g.couleur))
    .map((g) => g.reference)
    .join(', ')
)

verifier(
  'chaque gélatine porte un nom et un fabricant',
  GELATINES.every((g) => g.nom.trim() !== '' && g.fabricant.trim() !== '')
)

/**
 * **Un contrôle qui n'examine rien dirait OK.**
 *
 * Si quelqu'un vide un jour la liste, tous les tests de reconnaissance
 * échoueraient — mais ceux qui vérifient qu'une saisie inconnue reste inconnue
 * passeraient, eux, parfaitement. On refuse donc explicitement une liste vide
 * ou décimée.
 */
verifier(
  `le référentiel contient encore ${GELATINES.length} gélatines`,
  GELATINES.length >= 20,
  `il n'en reste que ${GELATINES.length}`
)

console.log('\n=== La couleur ===')

verifier('la couleur rendue est celle de la gélatine trouvée', couleurGelatine('L119') === trouverGelatine('L119').couleur)

console.log(
  echecs === 0 ? '\nGELATINES : TOUS LES TESTS PASSENT' : `\n${echecs} TEST(S) EN ECHEC`
)
process.exitCode = echecs === 0 ? 0 : 1
