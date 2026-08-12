import { useState } from 'react'
import Inventaire from './pages/Inventaire'
import Perches from './pages/Perches'
import PlanDeFeu from './pages/PlanDeFeu'
import Patch from './pages/Patch'
import ConditionsUtilisation from './components/ConditionsUtilisation'
import { definirLangue, LANGUES, t, type Langue } from '../../partage/i18n'
import { VERSION_CONDITIONS } from '../../partage/conditions'

/**
 * La version des conditions acceptées par ce poste.
 *
 * Incrémenter `VERSION_CONDITIONS` fait donc réapparaître l'écran : on ne
 * modifie pas des conditions dans le dos de quelqu'un qui les a acceptées.
 */
const CLE_CONDITIONS = 'lumika-conditions-acceptees'

function conditionsDejaAcceptees(): boolean {
  try {
    return localStorage.getItem(CLE_CONDITIONS) === VERSION_CONDITIONS
  } catch {
    // Navigation privée ou stockage refusé : on redemande l'acceptation.
    return false
  }
}

/**
 * La langue est propre au poste : elle vit dans le navigateur, pas en base.
 * Le jour où plusieurs personnes partageront le même plan de feu, interdire à
 * un collègue de lire en anglais parce qu'un autre a choisi le français
 * n'aurait aucun sens.
 */
const CLE_LANGUE = 'lumika-langue'

function langueInitiale(): Langue {
  try {
    const memorisee = localStorage.getItem(CLE_LANGUE)
    if (memorisee === 'fr' || memorisee === 'en') return memorisee
  } catch {
    // Navigation privée ou stockage refusé : on part du français.
  }
  return 'fr'
}

type Module = 'plan' | 'perches' | 'patch' | 'inventaire'

export default function App(): React.JSX.Element {
  const [module, setModule] = useState<Module>('plan')
  const [langueActive, setLangueActive] = useState<Langue>(langueInitiale)
  const [conditionsAcceptees, setConditionsAcceptees] = useState(conditionsDejaAcceptees)

  // Avant le premier rendu des enfants : sans cela, ils s'afficheraient une
  // fois dans la langue précédente.
  definirLangue(langueActive)

  function changerLangue(nouvelle: Langue): void {
    definirLangue(nouvelle)
    setLangueActive(nouvelle)
    try {
      localStorage.setItem(CLE_LANGUE, nouvelle)
    } catch {
      // Le choix ne survivra pas à la fermeture, mais l'écran suit quand même.
    }
  }

  // L'écran des conditions passe avant tout le reste : des conditions qu'on
  // peut contourner d'un clic ne sont pas des conditions.
  if (!conditionsAcceptees) {
    return (
      <ConditionsUtilisation
        onAccepter={() => {
          try {
            localStorage.setItem(CLE_CONDITIONS, VERSION_CONDITIONS)
          } catch {
            // Le choix ne survivra pas à la fermeture, mais l'écran s'ouvre.
          }
          setConditionsAcceptees(true)
        }}
      />
    )
  }

  const modules: { id: Module; cle: Parameters<typeof t>[0] }[] = [
    { id: 'plan', cle: 'app.planDeFeu' },
    { id: 'perches', cle: 'app.perches' },
    { id: 'patch', cle: 'app.patch' },
    { id: 'inventaire', cle: 'app.inventaire' }
  ]

  return (
    <div className="app">
      <header className="entete">
        <div className="marque">
          <span className="pastille" />
          <strong>Lumika</strong>
        </div>

        <nav>
          {modules.map((m) => (
            <button
              key={m.id}
              className={module === m.id ? 'actif' : ''}
              onClick={() => setModule(m.id)}
            >
              {t(m.cle)}
            </button>
          ))}
        </nav>

        <div className="actions">
          <select
            aria-label={t('param.langue')}
            value={langueActive}
            onChange={(e) => changerLangue(e.target.value as Langue)}
          >
            {LANGUES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nom}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main>
        {module === 'plan' && <PlanDeFeu />}
        {module === 'perches' && <Perches />}
        {module === 'patch' && <Patch />}
        {module === 'inventaire' && <Inventaire />}
      </main>
    </div>
  )
}
