import { useEffect, useState } from 'react'
import type { Appareil, AppareilDetaille, Gradateur, Materiel, Perche } from '../../../partage/types'
import { t, traduireErreur } from '../../../partage/i18n'
import { GELATINES, couleurGelatine } from '../../../../commun/gelatines.js'

/**
 * Le plan de feu : les appareils posés, leur perche, leur patch.
 *
 * **Le patch est soit un circuit, soit une adresse, jamais les deux.** Le
 * formulaire suit le genre de l'appareil choisi dans l'inventaire : un
 * traditionnel ne demande qu'un circuit, un DMX qu'une adresse. Proposer les
 * deux inviterait à remplir les deux, et un appareil qui porte les deux est un
 * appareil dont personne ne sait comment on l'allume.
 */
const VIDE: Omit<Appareil, 'id'> = {
  materielId: 0,
  percheId: null,
  lateral: 0,
  numero: 0,
  gradateurId: null,
  circuit: null,
  univers: 1,
  adresseDmx: null,
  gelatine: '',
  gobo: '',
  fonction: '',
  notes: ''
}

export default function PlanDeFeu(): React.JSX.Element {
  const [appareils, setAppareils] = useState<AppareilDetaille[]>([])
  const [projecteurs, setProjecteurs] = useState<Materiel[]>([])
  const [perches, setPerches] = useState<Perche[]>([])
  const [gradateurs, setGradateurs] = useState<Gradateur[]>([])
  const [brouillon, setBrouillon] = useState<Omit<Appareil, 'id'>>(VIDE)
  const [erreur, setErreur] = useState('')

  async function recharger(): Promise<void> {
    setAppareils(await window.api.appareils.lister())
    setProjecteurs(await window.api.inventaire.lister('projecteur'))
    setPerches(await window.api.perches.lister())
    setGradateurs(await window.api.gradateurs.lister())
  }

  useEffect(() => {
    recharger()
  }, [])

  const modele = projecteurs.find((p) => p.id === brouillon.materielId)
  const estDmx = modele?.genre === 'dmx'

  async function ajouter(): Promise<void> {
    setErreur('')
    try {
      // Le patch qui ne correspond pas au genre est effacé avant l'envoi :
      // laisser traîner une adresse sur un appareil traditionnel ferait
      // échouer la validation sur un champ que l'écran n'affiche même plus.
      await window.api.appareils.ajouter({
        ...brouillon,
        gradateurId: estDmx ? null : brouillon.gradateurId,
        circuit: estDmx ? null : brouillon.circuit,
        adresseDmx: estDmx ? brouillon.adresseDmx : null
      })
      setBrouillon({ ...VIDE, materielId: brouillon.materielId })
      await recharger()
    } catch (e) {
      setErreur(traduireErreur((e as Error).message))
    }
  }

  async function supprimer(id: number): Promise<void> {
    await window.api.appareils.supprimer(id)
    await recharger()
  }

  function patchDe(a: AppareilDetaille): string {
    if (a.genre === 'dmx') {
      return a.adresseDmx ? `DMX ${a.univers ?? 1}.${a.adresseDmx}` : '—'
    }
    const bloc = gradateurs.find((g) => g.id === a.gradateurId)
    return bloc && a.circuit ? `${bloc.nom} ${a.circuit}` : '—'
  }

  return (
    <section>
      <h1>{t('plan.titre')}</h1>

      {erreur && <p className="erreur">{erreur}</p>}

      <div className="carte">
        <div className="grille-champs">
          <label>
            {t('plan.appareil')}
            <select
              value={brouillon.materielId}
              onChange={(e) => setBrouillon({ ...brouillon, materielId: Number(e.target.value) })}
            >
              <option value={0}>—</option>
              {projecteurs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.designation} {p.genre === 'dmx' ? `(DMX ${p.canauxDmx} ch)` : `(${p.puissance} W)`}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('plan.numero')}
            <input
              type="number"
              min="0"
              value={brouillon.numero}
              onChange={(e) => setBrouillon({ ...brouillon, numero: Number(e.target.value) })}
            />
          </label>
          <label>
            {t('plan.perche')}
            <select
              value={brouillon.percheId ?? 0}
              onChange={(e) =>
                setBrouillon({ ...brouillon, percheId: Number(e.target.value) || null })
              }
            >
              <option value={0}>{t('plan.nonAccroche')}</option>
              {perches.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('plan.lateral')}
            <input
              type="number"
              step="0.25"
              value={brouillon.lateral}
              onChange={(e) => setBrouillon({ ...brouillon, lateral: Number(e.target.value) })}
            />
          </label>

          {estDmx ? (
            <label>
              {t('patch.adresse')}
              <input
                type="number"
                min="1"
                max="512"
                value={brouillon.adresseDmx ?? ''}
                onChange={(e) =>
                  setBrouillon({ ...brouillon, adresseDmx: Number(e.target.value) || null })
                }
              />
            </label>
          ) : (
            <>
              <label>
                {t('patch.gradateurs')}
                <select
                  value={brouillon.gradateurId ?? 0}
                  onChange={(e) =>
                    setBrouillon({ ...brouillon, gradateurId: Number(e.target.value) || null })
                  }
                >
                  <option value={0}>—</option>
                  {gradateurs.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('patch.circuits')}
                <input
                  type="number"
                  min="1"
                  value={brouillon.circuit ?? ''}
                  onChange={(e) =>
                    setBrouillon({ ...brouillon, circuit: Number(e.target.value) || null })
                  }
                />
              </label>
            </>
          )}

          <label>
            {t('plan.fonction')}
            <input
              value={brouillon.fonction}
              onChange={(e) => setBrouillon({ ...brouillon, fonction: e.target.value })}
            />
          </label>
          <label>
            {t('plan.gelatine')}
            {/* Une `datalist` propose sans imposer : la saisie reste libre, ce
                qui est la décision de conception de ce référentiel. Un théâtre
                a toujours une gélatine hors catalogue, et un plan de feu qui
                refuse la réalité ne sert plus à rien. */}
            <span className="gelatine-saisie">
              <input
                list="gelatines-courantes"
                value={brouillon.gelatine}
                onChange={(e) => setBrouillon({ ...brouillon, gelatine: e.target.value })}
              />
              {couleurGelatine(brouillon.gelatine) && (
                <i
                  className="gelatine-pastille"
                  style={{ background: couleurGelatine(brouillon.gelatine) ?? undefined }}
                  title={t('plan.gelatineApprox')}
                />
              )}
            </span>
            <datalist id="gelatines-courantes">
              {GELATINES.map((gel) => (
                <option key={gel.reference} value={gel.reference}>
                  {gel.fabricant} {gel.nom}
                </option>
              ))}
            </datalist>
            <small className="discret">{t('plan.gelatineLibre')}</small>
          </label>
          <label>
            {t('plan.gobo')}
            <input
              value={brouillon.gobo}
              onChange={(e) => setBrouillon({ ...brouillon, gobo: e.target.value })}
            />
          </label>
        </div>
        <div className="barre-boutons">
          <button onClick={ajouter} disabled={brouillon.materielId === 0}>
            {t('action.ajouter')}
          </button>
        </div>
        <p className="discret">{t('plan.lateralExplication')}</p>
      </div>

      <div className="carte">
        {appareils.length === 0 ? (
          <p className="discret">{t('plan.vide')}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('plan.numero')}</th>
                <th>{t('plan.appareil')}</th>
                <th>{t('plan.perche')}</th>
                <th>{t('plan.lateral')}</th>
                <th>{t('patch.titre')}</th>
                <th>{t('plan.fonction')}</th>
                <th>{t('plan.gelatine')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {appareils.map((a) => (
                <tr key={a.id}>
                  <td>{a.numero || '—'}</td>
                  <td>{a.designation}</td>
                  <td>{a.perche ?? t('plan.nonAccroche')}</td>
                  <td>{a.lateral}</td>
                  <td>{patchDe(a)}</td>
                  <td>{a.fonction}</td>
                  <td>{a.gelatine}</td>
                  <td>
                    <button className="discret" onClick={() => supprimer(a.id)}>
                      {t('action.supprimer')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
