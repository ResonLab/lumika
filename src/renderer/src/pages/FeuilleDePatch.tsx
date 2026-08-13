import { useEffect, useState } from 'react'
import type { AppareilDetaille, Gradateur } from '../../../partage/types'
import { couleurGelatine } from '../../../../commun/gelatines.js'
import { t } from '../../../partage/i18n'

/**
 * La feuille de patch — **le seul écran fait pour quitter l'écran**.
 *
 * C'est le document qu'on emporte au montage : sur papier, dans une poche, sous
 * une perche à cinq mètres du sol. Tout le reste de l'application se consulte
 * assis ; celui-ci se lit debout, avec les mains sales.
 *
 * Deux conséquences sur la forme :
 *
 * · **Elle est triée par patch, pas par numéro d'appareil.** On ne cherche pas
 *   « où est le 12 », on cherche « qu'est-ce qu'il y a sur le circuit 7 ». Le
 *   tri suit le geste, pas la base.
 * · **Les deux mondes sont séparés** : les circuits de gradateur d'un côté, les
 *   adresses DMX de l'autre. Les mélanger dans une seule colonne obligerait à
 *   lire le genre de chaque ligne pour savoir ce que le nombre veut dire.
 *
 * Les appareils **sans patch** sont listés à part et en tête. Un appareil
 * accroché que personne n'a patché est exactement ce qu'on découvre au noir.
 */
export default function FeuilleDePatch(): React.JSX.Element {
  const [appareils, setAppareils] = useState<AppareilDetaille[]>([])
  const [gradateurs, setGradateurs] = useState<Gradateur[]>([])

  useEffect(() => {
    async function charger(): Promise<void> {
      setAppareils(await window.api.appareils.lister())
      setGradateurs(await window.api.gradateurs.lister())
    }
    charger()
  }, [])

  const nomDuBloc = (id: number | null): string =>
    gradateurs.find((g) => g.id === id)?.nom ?? '—'

  const surGradateur = appareils
    .filter((a) => a.genre === 'trad' && a.gradateurId !== null && a.circuit !== null)
    .sort(
      (a, b) =>
        nomDuBloc(a.gradateurId).localeCompare(nomDuBloc(b.gradateurId)) ||
        (a.circuit ?? 0) - (b.circuit ?? 0)
    )

  const surDmx = appareils
    .filter((a) => a.genre === 'dmx' && a.adresseDmx !== null)
    .sort((a, b) => (a.univers ?? 1) - (b.univers ?? 1) || (a.adresseDmx ?? 0) - (b.adresseDmx ?? 0))

  const sansPatch = appareils.filter(
    (a) =>
      (a.genre === 'trad' && (a.gradateurId === null || a.circuit === null)) ||
      (a.genre === 'dmx' && a.adresseDmx === null)
  )

  /**
   * La puissance par circuit, récapitulée en pied de feuille.
   *
   * Ce n'est pas une redite de l'écran Patch : là-bas on prépare, ici on
   * contrôle en branchant. Voir « circuit 4 : 1800 W » au moment où l'on tire
   * la troisième rallonge évite de découvrir la surcharge au plein feu.
   */
  const chargeParCircuit = new Map<string, number>()
  for (const a of surGradateur) {
    const cle = `${nomDuBloc(a.gradateurId)} ${a.circuit}`
    chargeParCircuit.set(cle, (chargeParCircuit.get(cle) ?? 0) + a.puissance)
  }

  return (
    <section className="feuille">
      <div className="sans-impression">
        <h1>{t('feuille.titre')}</h1>
        <p className="discret">{t('feuille.explication')}</p>
        <div className="barre-boutons">
          <button onClick={() => window.print()}>{t('feuille.imprimer')}</button>
        </div>
      </div>

      <h2 className="titre-impression">{t('feuille.titre')}</h2>

      {sansPatch.length > 0 && (
        <div className="carte alerte">
          <h2>{t('feuille.sansPatch', { nombre: sansPatch.length })}</h2>
          <p className="discret">{t('feuille.sansPatchExplication')}</p>
          <ul>
            {sansPatch.map((a) => (
              <li key={a.id}>
                {a.numero || a.id} — {a.designation}
                {a.perche ? ` · ${a.perche}` : ` · ${t('plan.nonAccroche')}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="carte">
        <h2>{t('feuille.gradateurs')}</h2>
        {surGradateur.length === 0 ? (
          <p className="discret">{t('action.rien')}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('feuille.circuit')}</th>
                <th>{t('plan.numero')}</th>
                <th>{t('plan.appareil')}</th>
                <th>{t('plan.perche')}</th>
                <th>{t('inv.puissance')}</th>
                <th>{t('plan.gelatine')}</th>
                <th>{t('plan.fonction')}</th>
              </tr>
            </thead>
            <tbody>
              {surGradateur.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>
                      {nomDuBloc(a.gradateurId)} {a.circuit}
                    </strong>
                  </td>
                  <td>{a.numero || '—'}</td>
                  <td>{a.designation}</td>
                  <td>{a.perche ?? t('plan.nonAccroche')}</td>
                  <td>{a.puissance}</td>
                  <td>
                    {couleurGelatine(a.gelatine) && (
                      <i
                        className="gelatine-pastille"
                        style={{ background: couleurGelatine(a.gelatine) ?? undefined }}
                        title={t('plan.gelatineApprox')}
                      />
                    )}
                    {a.gelatine || '—'}
                  </td>
                  <td>{a.fonction || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="carte">
        <h2>{t('feuille.dmx')}</h2>
        {surDmx.length === 0 ? (
          <p className="discret">{t('action.rien')}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('patch.adresse')}</th>
                <th>{t('plan.numero')}</th>
                <th>{t('plan.appareil')}</th>
                <th>{t('plan.perche')}</th>
                <th>{t('inv.canaux')}</th>
                <th>{t('plan.fonction')}</th>
              </tr>
            </thead>
            <tbody>
              {surDmx.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>
                      {a.univers ?? 1}.{a.adresseDmx}
                    </strong>{' '}
                    <span className="discret">
                      – {(a.adresseDmx ?? 0) + a.canauxDmx - 1}
                    </span>
                  </td>
                  <td>{a.numero || '—'}</td>
                  <td>{a.designation}</td>
                  <td>{a.perche ?? t('plan.nonAccroche')}</td>
                  <td>{a.canauxDmx}</td>
                  <td>{a.fonction || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {chargeParCircuit.size > 0 && (
        <div className="carte">
          <h2>{t('feuille.charges')}</h2>
          <table>
            <tbody>
              {[...chargeParCircuit.entries()]
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([circuit, charge]) => (
                  <tr key={circuit}>
                    <td>
                      <strong>{circuit}</strong>
                    </td>
                    <td>{charge} W</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="avertissement">{t('patch.pasUnControle')}</p>
        </div>
      )}
    </section>
  )
}
