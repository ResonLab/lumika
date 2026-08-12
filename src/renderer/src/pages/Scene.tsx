import { useEffect, useState } from 'react'
import type { AppareilDetaille, Perche } from '../../../partage/types'
import { t } from '../../../partage/i18n'

/**
 * La vue de scène, du dessus — **c'est le document qu'un régisseur imprime**.
 *
 * L'écran des perches montre le gril de face : utile pour voir deux appareils
 * trop proches sur une même barre. Il ne dit rien de la profondeur, et c'est
 * pourtant elle qui décide de tout : une face qui vient de trop loin écrase les
 * volumes, un contre trop près ne décolle personne du fond.
 *
 * **Aucun calcul ici.** On dessine des positions saisies ailleurs. Le seul
 * arbitrage est celui de l'échelle, et il est fait pour que le plan reste
 * lisible plutôt que fidèle au millimètre.
 */

/** Le plateau dessiné, en mètres. Assez large pour une salle de spectacle. */
const LARGEUR_PLATEAU = 16
const MARGE = 2

export default function Scene(): React.JSX.Element {
  const [perches, setPerches] = useState<Perche[]>([])
  const [appareils, setAppareils] = useState<AppareilDetaille[]>([])

  useEffect(() => {
    async function charger(): Promise<void> {
      setPerches(await window.api.perches.lister())
      setAppareils(await window.api.appareils.lister())
    }
    charger()
  }, [])

  if (perches.length === 0) {
    return (
      <section>
        <h1>{t('scene.titre')}</h1>
        <p className="discret">{t('scene.vide')}</p>
      </section>
    )
  }

  /**
   * L'emprise dessinée.
   *
   * Elle suit les perches réellement saisies plutôt qu'un cadre fixe : une
   * perche de face à −4 m et un lointain à 12 m doivent tenir tous les deux, et
   * un cadre figé couperait l'un ou l'autre sans prévenir.
   */
  const distances = perches.map((p) => p.distance)
  const yMin = Math.min(-1, ...distances) - MARGE
  const yMax = Math.max(2, ...distances) + MARGE
  const largeur = Math.max(LARGEUR_PLATEAU, ...perches.map((p) => p.longueur)) + MARGE * 2

  const xMin = -largeur / 2
  const hauteur = yMax - yMin

  /** Mètres vers unités du dessin : le SVG travaille directement en mètres. */
  const versX = (metres: number): number => metres - xMin
  const versY = (metres: number): number => metres - yMin

  return (
    <section>
      <h1>{t('scene.titre')}</h1>
      <p className="discret">{t('scene.explication')}</p>

      <div className="carte">
        <svg
          className="plan-scene"
          viewBox={`0 0 ${largeur} ${hauteur}`}
          role="img"
          aria-label={t('scene.titre')}
        >
          {/* Le nu du cadre de scène : l'origine de toute cote au théâtre. */}
          <line
            x1={versX(xMin)}
            y1={versY(0)}
            x2={versX(-xMin)}
            y2={versY(0)}
            className="ligne-cadre"
          />
          <text x={versX(xMin) + 0.3} y={versY(0) - 0.35} className="etiquette-plan">
            {t('scene.cadre')}
          </text>

          {/* L'axe de la salle : c'est lui qui sépare jardin de cour. */}
          <line
            x1={versX(0)}
            y1={versY(yMin)}
            x2={versX(0)}
            y2={versY(yMax)}
            className="ligne-axe"
          />

          {perches.map((perche) => {
            const dessus = appareils.filter((a) => a.percheId === perche.id)
            const y = versY(perche.distance)
            return (
              <g key={perche.id}>
                <line
                  x1={versX(-perche.longueur / 2)}
                  y1={y}
                  x2={versX(perche.longueur / 2)}
                  y2={y}
                  className="ligne-perche"
                />
                <text
                  x={versX(perche.longueur / 2) + 0.3}
                  y={y + 0.25}
                  className="etiquette-plan"
                >
                  {perche.nom}
                </text>

                {dessus.map((appareil) => (
                  <g key={appareil.id}>
                    <circle
                      cx={versX(appareil.lateral)}
                      cy={y}
                      r={0.42}
                      className={`appareil-plan ${appareil.genre}`}
                    />
                    <text
                      x={versX(appareil.lateral)}
                      y={y + 0.18}
                      className="numero-plan"
                      textAnchor="middle"
                    >
                      {appareil.numero || appareil.id}
                    </text>
                  </g>
                ))}
              </g>
            )
          })}

          {/* Jardin et cour, écrits en toutes lettres : la convention se
              retient mal, et un plan lu à l'envers fait accrocher à l'envers. */}
          <text x={versX(xMin) + 0.3} y={versY(yMax) - 0.4} className="etiquette-plan">
            {t('scene.jardin')}
          </text>
          <text x={versX(-xMin) - 0.3} y={versY(yMax) - 0.4} className="etiquette-plan" textAnchor="end">
            {t('scene.cour')}
          </text>
        </svg>

        <p className="discret">{t('scene.legende')}</p>
      </div>
    </section>
  )
}
