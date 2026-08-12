import { useEffect, useState } from 'react'
import type { Gradateur } from '../../../partage/types'
import type { EtatPatch, Repartition } from '../../../preload/index'
import { t, traduireErreur } from '../../../partage/i18n'

/**
 * Le patch : ce qui occupe l'univers DMX, et ce qui se chevauche.
 *
 * **L'écran existe pour un seul défaut, et il vaut tout le reste** : un bloc de
 * gradateurs occupe autant de canaux qu'il a de circuits. Une barre LED posée
 * dans cette plage marche parfaitement sur le papier — ce sont deux appareils
 * différents — et allume des circuits au hasard sur le plateau. On ne s'en
 * aperçoit qu'une fois tout accroché.
 */
const VIDE: Omit<Gradateur, 'id'> = {
  nom: '',
  univers: 1,
  adresseDmx: 1,
  circuits: 24,
  capaciteParCircuit: 2000
}

export default function Patch(): React.JSX.Element {
  const [gradateurs, setGradateurs] = useState<Gradateur[]>([])
  const [etat, setEtat] = useState<EtatPatch | null>(null)
  const [repartition, setRepartition] = useState<Repartition | null>(null)
  const [brouillon, setBrouillon] = useState<Omit<Gradateur, 'id'>>(VIDE)
  const [erreur, setErreur] = useState('')

  async function recharger(): Promise<void> {
    setGradateurs(await window.api.gradateurs.lister())
    try {
      setEtat(await window.api.patch.etat())
      setErreur('')
    } catch (e) {
      // Un patch impossible à calculer ne doit pas vider l'écran : les blocs
      // restent affichés, et le message dit ce qui cloche.
      setEtat(null)
      setErreur(traduireErreur((e as Error).message))
    }
  }

  useEffect(() => {
    recharger()
  }, [])

  async function ajouter(): Promise<void> {
    setErreur('')
    try {
      await window.api.gradateurs.ajouter(brouillon)
      setBrouillon(VIDE)
      await recharger()
    } catch (e) {
      setErreur(traduireErreur((e as Error).message))
    }
  }

  async function supprimer(id: number): Promise<void> {
    await window.api.gradateurs.supprimer(id)
    await recharger()
  }

  async function proposer(): Promise<void> {
    setErreur('')
    try {
      setRepartition(await window.api.patch.proposer())
    } catch (e) {
      setErreur(traduireErreur((e as Error).message))
    }
  }

  /**
   * Applique la proposition.
   *
   * **Le bouton a failli ne jamais exister.** La fonction du domaine était
   * écrite, exposée par le pont, et inatteignable depuis l'écran : c'est le
   * contrôle des traductions qui l'a signalé, en trouvant une clé déclarée et
   * jamais employée. Un mécanisme peut exister dans le code et rester
   * inaccessible — aucune relecture ne le voit.
   */
  async function appliquer(): Promise<void> {
    if (!repartition) return
    setErreur('')
    try {
      await window.api.patch.appliquer(repartition.affectations)
      setRepartition(null)
      await recharger()
    } catch (e) {
      setErreur(traduireErreur((e as Error).message))
    }
  }

  return (
    <section>
      <h1>{t('patch.titre')}</h1>

      {erreur && <p className="erreur">{erreur}</p>}

      <div className="carte">
        <h2>{t('patch.gradateurs')}</h2>
        <div className="grille-champs">
          <label>
            {t('perche.nom')}
            <input
              value={brouillon.nom}
              onChange={(e) => setBrouillon({ ...brouillon, nom: e.target.value })}
            />
          </label>
          <label>
            {t('patch.univers')}
            <input
              type="number"
              min="1"
              value={brouillon.univers}
              onChange={(e) => setBrouillon({ ...brouillon, univers: Number(e.target.value) })}
            />
          </label>
          <label>
            {t('patch.adresse')}
            <input
              type="number"
              min="1"
              max="512"
              value={brouillon.adresseDmx}
              onChange={(e) => setBrouillon({ ...brouillon, adresseDmx: Number(e.target.value) })}
            />
          </label>
          <label>
            {t('patch.circuits')}
            <input
              type="number"
              min="1"
              value={brouillon.circuits}
              onChange={(e) => setBrouillon({ ...brouillon, circuits: Number(e.target.value) })}
            />
          </label>
          <label>
            {t('patch.capacite')}
            <input
              type="number"
              min="1"
              step="100"
              value={brouillon.capaciteParCircuit}
              onChange={(e) =>
                setBrouillon({ ...brouillon, capaciteParCircuit: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div className="barre-boutons">
          <button onClick={ajouter}>{t('action.ajouter')}</button>
        </div>

        {gradateurs.length > 0 && (
          <table>
            <tbody>
              {gradateurs.map((g) => (
                <tr key={g.id}>
                  <td>{g.nom}</td>
                  <td>
                    {g.univers}.{g.adresseDmx} – {g.adresseDmx + g.circuits - 1}
                  </td>
                  <td>{g.circuits} × {g.capaciteParCircuit} W</td>
                  <td>
                    <button className="discret" onClick={() => supprimer(g.id)}>
                      {t('action.supprimer')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {etat && (
        <div className="carte">
          <h2>{t('patch.titre')}</h2>

          {etat.conflits.length === 0 ? (
            <p className="ok">{t('patch.aucunConflit')}</p>
          ) : (
            <>
              {etat.conflits.map((c, i) => (
                <p key={i} className="erreur">
                  {t('patch.conflit', {
                    premier: c.premier.nom,
                    debutA: c.premier.debut,
                    finA: c.premier.fin,
                    second: c.second.nom,
                    debutB: c.second.debut,
                    finB: c.second.fin
                  })}
                </p>
              ))}
              <p className="discret">{t('patch.pourquoiConflit')}</p>
            </>
          )}

          {Object.entries(etat.libres).map(([univers, plages]) => (
            <div key={univers}>
              <h3>{t('patch.occupation', { univers })}</h3>
              <ul>
                {etat.plages
                  .filter((p) => String(p.univers) === univers)
                  .sort((a, b) => a.debut - b.debut)
                  .map((p, i) => (
                    <li key={i}>
                      <strong>
                        {p.debut} – {p.fin}
                      </strong>{' '}
                      {p.nom}
                    </li>
                  ))}
              </ul>
              <p className="discret">
                {t('patch.libres', {
                  plages: plages.map((l) => `${l.debut}–${l.fin}`).join(', ') || '—'
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="carte">
        <h2>{t('patch.repartir')}</h2>
        <p className="discret">{t('patch.repartitionRegle')}</p>
        <div className="barre-boutons">
          <button onClick={proposer}>{t('patch.repartir')}</button>
        </div>

        {repartition && (
          <>
            {repartition.refuses.map((r, i) => (
              <p key={i} className="erreur">
                {t('patch.refuse', { nom: r.nom, puissance: r.puissance })}
              </p>
            ))}
            <ul>
              {repartition.circuits
                .filter((c) => c.projecteurs.length > 0)
                .map((c, i) => (
                  <li key={i}>
                    {t('patch.circuitCharge', {
                      gradateur: c.gradateur,
                      numero: c.numero,
                      charge: c.charge,
                      utile: Math.round(c.utile)
                    })}{' '}
                    — {c.projecteurs.join(', ')}
                  </li>
                ))}
            </ul>
            <div className="barre-boutons">
              <button onClick={appliquer} disabled={repartition.affectations.length === 0}>
                {t('patch.appliquer')}
              </button>
              <button className="discret" onClick={() => setRepartition(null)}>
                {t('action.annuler')}
              </button>
            </div>
            <p className="discret">{t('patch.proposition')}</p>
          </>
        )}

        <p className="discret">{t('patch.marge')}</p>
        <p className="avertissement">{t('patch.pasUnControle')}</p>
      </div>
    </section>
  )
}
