import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DOSSIER = dirname(fileURLToPath(import.meta.url))

const SUITES = [
  ['Patch : gradateurs et DMX', 'patch.mjs'],
  ['Application', 'application.mjs'],
  ['Gélatines', 'gelatines.mjs'],
  ['Traductions', 'traductions.mjs'],
  ['Effets React et leurs dépendances', 'effets-react.mjs'],
  ['Cohérence du site', 'coherence-site.mjs'],
  ['Cohérence des conditions', 'coherence-conditions.mjs'],
  ['Cohérence du guide', 'coherence-guide.mjs']
]

let echecs = 0
for (const [intitule, fichier] of SUITES) {
  process.stdout.write(`\n──────── ${intitule}\n`)
  try {
    const sortie = execFileSync(process.execPath, [join(DOSSIER, fichier)], { encoding: 'utf-8' })
    const lignes = sortie.trim().split('\n')
    console.log(`  ${lignes[lignes.length - 1]}`)
  } catch (erreur) {
    echecs += 1
    console.log(erreur.stdout ?? String(erreur))
    console.log('  ÉCHEC')
  }
}

console.log(
  `\n════════ ${echecs === 0 ? 'TOUTES LES VÉRIFICATIONS PASSENT' : `${echecs} SUITE(S) EN ÉCHEC`}`
)
process.exit(echecs === 0 ? 0 : 1)
