import { useEffect, useState } from 'react'
import type { AppareilDetaille, Perche } from '../../../partage/types'
import { t, traduireErreur } from '../../../partage/i18n'

/**
 * Les perches, et une vue de face du gril.
 *
 * **La vue vaut le tableau, et pour une raison précise** : un plan de feu se
 * lit dans l'espace. Deux appareils sur la même perche à deux mètres l'un de
 * l'autre, ça se voit d'un coup d'œil et jamais dans une colonne de nombres.
 */
const VIDE: Omit<Perche, 'id'> = {
  nom: '',
  distance: 0,
  hauteur: 6,
  longueur: 12,
  ordre: 0,
  notes: ''
}

export default function Perches(): React.JSX.Element {
  const [perches, setPerches] = useState<Perche[]>([])
  const [appareils, setAppareils] = useState<AppareilDetaille[]>([])
  /**
   * La perche en cours de saisie — neuve, ou reprise pour correction.
   *
   * **`perches:modifier` existait de bout en bout et aucun bouton ne
   * l'appelait** : on pouvait ajouter et supprimer une perche, jamais corriger
   * sa distance ou sa hauteur. Or ce sont précisément les deux chiffres qu'on
   * relève au mètre sur le gril et qu'on saisit de travers. Supprimer pour
   * re-saisir emportait les appareils accrochés dessus.
   *
   * Un seul formulaire pour les deux cas, la présence d'un `id` les distingue.
   * Défaut trouvé par `tests/atteignable.mjs`.
   */
  const [brouillon, setBrouillon] = useState<Perche | Omit<Perche, 'id'>>(VIDE)
  const [erreur, setErreur] = useState('')

  async function recharger(): Promise<void> {
    setPerches(await window.api.perches.lister())
    setAppareils(await window.api.appareils.lister())
  }

  useEffect(() => {
    recharger()
  }, [])

  async function enregistrer(): Promise<void> {
    setErreur('')
    try {
      if ('id' in brouillon) await window.api.perches.modifier(brouillon)
      else await window.api.perches.ajouter(brouillon)
      setBrouillon(VIDE)
      await recharger()
    } catch (e) {
      setErreur(traduireErreur((e as Error).message))
    }
  }

  async function supprimer(id: number): Promise<void> {
    await window.api.perches.supprimer(id)
    await recharger()
  }

  /** La largeur du gril : la plus longue perche décide de l'échelle. */
  const largeur = Math.max(12, ...perches.map((p) => p.longueur))

  return (
    <section>
      <h1>{t('perche.titre')}</h1>

      {erreur && <p className="erreur">{erreur}</p>}

      <div className="carte">
        <div className="grille-champs">
          <label>
            {t('perche.nom')}
            <input
              value={brouillon.nom}
              onChange={(e) => setBrouillon({ ...brouillon, nom: e.target.value })}
            />
          </label>
          <label>
            {t('perche.distance')}
            <input
              type="number"
              step="0.5"
              value={brouillon.distance}
              onChange={(e) => setBrouillon({ ...brouillon, distance: Number(e.target.value) })}
            />
          </label>
          <label>
            {t('perche.hauteur')}
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={brouillon.hauteur}
              onChange={(e) => setBrouillon({ ...brouillon, hauteur: Number(e.target.value) })}
            />
          </label>
          <label>
            {t('perche.longueur')}
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={brouillon.longueur}
              onChange={(e) => setBrouillon({ ...brouillon, longueur: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="barre-boutons">
          <button onClick={enregistrer}>
            {'id' in brouillon ? t('action.enregistrer') : t('action.ajouter')}
          </button>
          {'id' in brouillon && (
            <button className="discret" onClick={() => setBrouillon(VIDE)}>
              {t('action.annuler')}
            </button>
          )}
        </div>
        <p className="discret">{t('perche.distanceExplication')}</p>
      </div>

      {perches.length === 0 ? (
        <p className="discret">{t('action.rien')}</p>
      ) : (
        <div className="carte">
          <div className="gril">
            {perches.map((perche) => {
              const dessus = appareils.filter((a) => a.percheId === perche.id)
              return (
                <div key={perche.id} className="perche-ligne">
                  <div className="perche-entete">
                    <strong>{perche.nom}</strong>
                    <span className="discret">
                      {perche.distance} m · {perche.hauteur} m · {perche.longueur} m ·{' '}
                      {t('perche.appareils', { nombre: dessus.length })}
                    </span>
                    <button className="discret" onClick={() => setBrouillon({ ...perche })}>
                      {t('action.modifier')}
                    </button>
                    <button className="discret" onClick={() => supprimer(perche.id)}>
                      {t('action.supprimer')}
                    </button>
                  </div>
                  <div className="perche-barre" style={{ width: `${(perche.longueur / largeur) * 100}%` }}>
                    {dessus.map((appareil) => (
                      <span
                        key={appareil.id}
                        className={`appareil-pastille ${appareil.genre}`}
                        // La position latérale va de -longueur/2 à +longueur/2 :
                        // on la ramène en pourcentage de la barre.
                        style={{
                          left: `${((appareil.lateral + perche.longueur / 2) / perche.longueur) * 100}%`
                        }}
                        title={`${appareil.numero || appareil.id} — ${appareil.designation}`}
                      >
                        {appareil.numero || appareil.id}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="discret">{t('perche.suppression')}</p>
        </div>
      )}
    </section>
  )
}
