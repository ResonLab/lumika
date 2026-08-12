import { useEffect, useState } from 'react'
import type { Materiel, NatureMateriel } from '../../../partage/types'
import { t, traduireErreur } from '../../../partage/i18n'

/**
 * L'inventaire : projecteurs, lampes, accessoires.
 *
 * **Les lampes sont la raison d'être de cet écran.** Un projecteur, on l'a ou
 * on ne l'a pas. Une lampe claque — et s'en apercevoir le soir de la générale,
 * sans rechange du bon culot, c'est un projecteur mort pour toute la série.
 */
const VIDE: Omit<Materiel, 'id'> = {
  nature: 'projecteur',
  designation: '',
  marque: '',
  reference: '',
  quantite: 1,
  seuilAlerte: 0,
  genre: 'trad',
  typeOptique: '',
  puissance: 1000,
  canauxDmx: 0,
  culot: '',
  emplacement: '',
  notes: ''
}

export default function Inventaire(): React.JSX.Element {
  const [materiel, setMateriel] = useState<Materiel[]>([])
  const [alertes, setAlertes] = useState<Materiel[]>([])
  const [nature, setNature] = useState<NatureMateriel>('projecteur')
  const [brouillon, setBrouillon] = useState<Omit<Materiel, 'id'>>(VIDE)
  const [erreur, setErreur] = useState('')

  async function recharger(): Promise<void> {
    setMateriel(await window.api.inventaire.lister())
    setAlertes(await window.api.inventaire.sousLeSeuil())
  }

  useEffect(() => {
    recharger()
  }, [])

  async function ajouter(): Promise<void> {
    setErreur('')
    try {
      await window.api.inventaire.ajouter({ ...brouillon, nature })
      setBrouillon({ ...VIDE, nature })
      await recharger()
    } catch (e) {
      setErreur(traduireErreur((e as Error).message))
    }
  }

  async function supprimer(id: number): Promise<void> {
    await window.api.inventaire.supprimer(id)
    await recharger()
  }

  const filtre = materiel.filter((m) => m.nature === nature)
  const estProjecteur = nature === 'projecteur'

  return (
    <section>
      <h1>{t('inv.titre')}</h1>

      {alertes.length > 0 && (
        <div className="carte alerte">
          <strong>{t('inv.alerte', { nombre: alertes.length })}</strong>
          <ul>
            {alertes.map((a) => (
              <li key={a.id}>
                {a.designation} — {a.quantite} / {a.seuilAlerte}
              </li>
            ))}
          </ul>
          <p className="discret">{t('inv.alerteExplication')}</p>
        </div>
      )}

      <div className="barre-outils">
        {(['projecteur', 'lampe', 'accessoire'] as const).map((n) => (
          <button key={n} className={nature === n ? 'actif' : ''} onClick={() => setNature(n)}>
            {t(
              n === 'projecteur'
                ? 'inv.projecteurs'
                : n === 'lampe'
                  ? 'inv.lampes'
                  : 'inv.accessoires'
            )}
          </button>
        ))}
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      <div className="carte">
        <div className="grille-champs">
          <label>
            {t('inv.designation')}
            <input
              value={brouillon.designation}
              onChange={(e) => setBrouillon({ ...brouillon, designation: e.target.value })}
            />
          </label>
          <label>
            {t('inv.marque')}
            <input
              value={brouillon.marque}
              onChange={(e) => setBrouillon({ ...brouillon, marque: e.target.value })}
            />
          </label>
          <label>
            {t('inv.quantite')}
            <input
              type="number"
              min="0"
              value={brouillon.quantite}
              onChange={(e) => setBrouillon({ ...brouillon, quantite: Number(e.target.value) })}
            />
          </label>
          <label>
            {t('inv.seuil')}
            <input
              type="number"
              min="0"
              value={brouillon.seuilAlerte}
              onChange={(e) => setBrouillon({ ...brouillon, seuilAlerte: Number(e.target.value) })}
            />
          </label>

          {estProjecteur && (
            <>
              <label>
                {t('inv.genre')}
                <select
                  value={brouillon.genre}
                  onChange={(e) =>
                    setBrouillon({ ...brouillon, genre: e.target.value as Materiel['genre'] })
                  }
                >
                  <option value="trad">{t('inv.trad')}</option>
                  <option value="dmx">{t('inv.dmx')}</option>
                </select>
              </label>
              <label>
                {t('inv.typeOptique')}
                <input
                  value={brouillon.typeOptique}
                  onChange={(e) => setBrouillon({ ...brouillon, typeOptique: e.target.value })}
                />
              </label>
              <label>
                {t('inv.puissance')}
                <input
                  type="number"
                  min="0"
                  value={brouillon.puissance}
                  onChange={(e) => setBrouillon({ ...brouillon, puissance: Number(e.target.value) })}
                />
              </label>
              {brouillon.genre === 'dmx' && (
                <label>
                  {t('inv.canaux')}
                  <input
                    type="number"
                    min="1"
                    value={brouillon.canauxDmx}
                    onChange={(e) =>
                      setBrouillon({ ...brouillon, canauxDmx: Number(e.target.value) })
                    }
                  />
                </label>
              )}
            </>
          )}

          {nature === 'lampe' && (
            <label>
              {t('inv.culot')}
              <input
                value={brouillon.culot}
                onChange={(e) => setBrouillon({ ...brouillon, culot: e.target.value })}
              />
            </label>
          )}

          <label>
            {t('inv.emplacement')}
            <input
              value={brouillon.emplacement}
              onChange={(e) => setBrouillon({ ...brouillon, emplacement: e.target.value })}
            />
          </label>
        </div>
        <div className="barre-boutons">
          <button onClick={ajouter}>{t('action.ajouter')}</button>
        </div>
        <p className="discret">{t('inv.seuilZero')}</p>
      </div>

      <div className="carte">
        {filtre.length === 0 ? (
          <p className="discret">{t('action.rien')}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('inv.designation')}</th>
                <th>{t('inv.marque')}</th>
                {estProjecteur && <th>{t('inv.genre')}</th>}
                {estProjecteur && <th>{t('inv.puissance')}</th>}
                {nature === 'lampe' && <th>{t('inv.culot')}</th>}
                <th>{t('inv.quantite')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtre.map((m) => (
                <tr
                  key={m.id}
                  className={m.seuilAlerte > 0 && m.quantite <= m.seuilAlerte ? 'sous-seuil' : ''}
                >
                  <td>{m.designation}</td>
                  <td>{m.marque}</td>
                  {estProjecteur && (
                    <td>{m.genre === 'dmx' ? `DMX ${m.canauxDmx} ch` : t('inv.trad')}</td>
                  )}
                  {estProjecteur && <td>{m.puissance}</td>}
                  {nature === 'lampe' && <td>{m.culot}</td>}
                  <td>{m.quantite}</td>
                  <td>
                    <button className="discret" onClick={() => supprimer(m.id)}>
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
