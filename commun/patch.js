/**
 * Le patch d'un plan de feu : gradateurs pour le trad, DMX pour le reste.
 *
 * **C'est la distinction qui structure tout le théâtre éclairage**, et elle
 * n'existe pas ailleurs dans la maison :
 *
 * · un projecteur **traditionnel** — une lampe halogène et rien d'autre — ne
 *   sait pas ce qu'est le DMX. Il se branche sur un **circuit de gradateur**,
 *   et c'est le gradateur qui reçoit le DMX. Plusieurs projecteurs peuvent
 *   partager un circuit tant que la puissance tient.
 * · un projecteur **non trad** — LED, asservi, machine à effet — a son propre
 *   récepteur DMX et occupe **plusieurs canaux consécutifs**, selon son mode.
 *
 * **Le piège que ce module existe pour éviter** : on oublie que le gradateur
 * mange lui-même des canaux DMX. Un bloc de 24 circuits adressé en 1 occupe
 * les canaux 1 à 24 ; y poser une barre LED en 12 marche parfaitement sur le
 * papier et allume des circuits au hasard sur le plateau. C'est l'erreur
 * classique du montage, et elle ne se voit qu'une fois tout accroché.
 *
 * Aucune dépendance : ni interface, ni base, ni Electron. Il tourne dans
 * l'application, dans les tests, et dans un navigateur.
 *
 * **Les refus sont des clés, pas des phrases** : ce module ne sait pas quelle
 * langue la fenêtre affiche. Quand le message cite une valeur, la clé et la
 * valeur voyagent ensemble en JSON.
 */

/** Un univers DMX contient 512 canaux. Ni 511, ni 513. */
export const TAILLE_UNIVERS = 512

/**
 * Capacité d'un circuit de gradateur, en watts.
 *
 * 2 kW est le standard des blocs de puissance de théâtre. Beaucoup de blocs
 * font 3 kW ; c'est donc un défaut, pas une vérité — chaque gradateur porte la
 * sienne.
 */
export const CAPACITE_CIRCUIT_DEFAUT = 2000

/**
 * Marge de sécurité appliquée à un circuit, en fraction.
 *
 * **Une pratique de terrain, pas une norme.** Une lampe halogène tire un fort
 * appel de courant à l'allumage, et un circuit chargé à 100 % de sa valeur
 * nominale déclenche au premier plein feu. On garde 10 %.
 *
 * Ce chiffre est affiché à l'écran : ne jamais laisser croire à une certitude
 * électrique. Le raccordement relève d'un électricien.
 */
export const MARGE_CIRCUIT = 0.1

function refus(cle, donnees) {
  return new Error(donnees === undefined ? cle : JSON.stringify({ cle, ...donnees }))
}

/**
 * Puissance réellement admise sur un circuit, marge comprise.
 */
export function capaciteUtile(capaciteWatts, marge = MARGE_CIRCUIT) {
  if (!(capaciteWatts > 0)) throw refus('patch.capacitePositive')
  if (!(marge >= 0) || marge >= 1) throw refus('patch.margeHorsLimites')
  return capaciteWatts * (1 - marge)
}

/**
 * Les canaux DMX qu'un bloc de gradateurs occupe.
 *
 * Un circuit = un canal. Le bloc adressé en `adresseDmx` avec `circuits`
 * circuits occupe donc `adresseDmx` à `adresseDmx + circuits - 1`.
 */
export function canauxDuGradateur(gradateur) {
  const { adresseDmx, circuits } = gradateur
  if (!Number.isInteger(adresseDmx) || adresseDmx < 1) throw refus('patch.adresseInvalide')
  if (!Number.isInteger(circuits) || circuits < 1) throw refus('patch.circuitsInvalides')

  const fin = adresseDmx + circuits - 1
  if (fin > TAILLE_UNIVERS) {
    throw refus('patch.gradateurDepasse', {
      nom: gradateur.nom,
      adresse: adresseDmx,
      circuits,
      derniere: TAILLE_UNIVERS - circuits + 1
    })
  }
  return { univers: gradateur.univers ?? 1, debut: adresseDmx, fin }
}

/**
 * Les canaux DMX qu'un projecteur non trad occupe.
 */
export function canauxDuProjecteur(projecteur) {
  const { adresseDmx, canaux } = projecteur
  if (!Number.isInteger(adresseDmx) || adresseDmx < 1) throw refus('patch.adresseInvalide')
  if (!Number.isInteger(canaux) || canaux < 1) throw refus('patch.canauxInvalides')

  const fin = adresseDmx + canaux - 1
  if (fin > TAILLE_UNIVERS) {
    throw refus('patch.projecteurDepasse', {
      nom: projecteur.nom,
      adresse: adresseDmx,
      canaux,
      derniere: TAILLE_UNIVERS - canaux + 1
    })
  }
  return { univers: projecteur.univers ?? 1, debut: adresseDmx, fin }
}

/** Deux plages se chevauchent-elles ? Même univers, et bornes qui se croisent. */
function seChevauchent(a, b) {
  return a.univers === b.univers && a.debut <= b.fin && b.debut <= a.fin
}

/**
 * Contrôle du patch DMX : gradateurs et projecteurs non trad ensemble.
 *
 * **Les deux sont comparés dans le même espace**, et c'est tout l'intérêt.
 * Vérifier les projecteurs entre eux et les gradateurs entre eux laisserait
 * passer exactement l'erreur la plus fréquente : une LED posée dans la plage
 * d'un bloc de puissance.
 *
 * Rend la liste des conflits plutôt que de lever : on veut tous les voir d'un
 * coup, pas les corriger un par un en relançant.
 */
export function controlerPatch(gradateurs, projecteursNonTrad) {
  const plages = []

  for (const gradateur of gradateurs) {
    plages.push({ ...canauxDuGradateur(gradateur), nom: gradateur.nom, genre: 'gradateur' })
  }
  for (const projecteur of projecteursNonTrad) {
    plages.push({ ...canauxDuProjecteur(projecteur), nom: projecteur.nom, genre: 'projecteur' })
  }

  const conflits = []
  for (let i = 0; i < plages.length; i += 1) {
    for (let j = i + 1; j < plages.length; j += 1) {
      if (seChevauchent(plages[i], plages[j])) {
        conflits.push({
          cle: 'patch.chevauchement',
          premier: plages[i],
          second: plages[j]
        })
      }
    }
  }
  return { plages, conflits }
}

/**
 * Les plages de canaux restées libres, dans un univers.
 *
 * Sert à répondre à la seule question qu'on se pose devant un plan chargé :
 * « où est-ce que je peux encore poser quelque chose ? »
 */
export function plagesLibres(plages, univers = 1) {
  const occupees = plages
    .filter((p) => p.univers === univers)
    .sort((a, b) => a.debut - b.debut)

  const libres = []
  let curseur = 1
  for (const plage of occupees) {
    if (plage.debut > curseur) libres.push({ debut: curseur, fin: plage.debut - 1 })
    curseur = Math.max(curseur, plage.fin + 1)
  }
  if (curseur <= TAILLE_UNIVERS) libres.push({ debut: curseur, fin: TAILLE_UNIVERS })
  return libres
}

/**
 * Répartit les projecteurs traditionnels sur les circuits de gradateur.
 *
 * **Le plus gourmand d'abord, puis le premier circuit qui l'accepte.** La règle
 * est simple exprès — reprise de Scenika, et pour la même raison : un
 * régisseur doit pouvoir refaire la répartition de tête sur le plateau, parce
 * que c'est à la main qu'il branche. Un algorithme plus fin gagnerait parfois
 * un circuit et deviendrait invérifiable à l'œil.
 *
 * Un projecteur plus gourmand qu'un circuit entier est **refusé et nommé**,
 * jamais casé de force : le caser silencieusement ferait déclencher le circuit
 * au premier plein feu, en pleine représentation.
 *
 * Les projecteurs déjà affectés à un circuit à la main ne sont pas déplacés :
 * on complète un patch, on ne le refait pas dans le dos du régisseur.
 */
export function repartirSurCircuits(projecteursTrad, gradateurs, marge = MARGE_CIRCUIT) {
  if (gradateurs.length === 0) throw refus('patch.aucunGradateur')

  /** Tous les circuits disponibles, à plat, avec ce qu'ils portent déjà. */
  const circuits = []
  for (const gradateur of gradateurs) {
    const capacite = gradateur.capaciteParCircuit ?? CAPACITE_CIRCUIT_DEFAUT
    for (let numero = 1; numero <= gradateur.circuits; numero += 1) {
      circuits.push({
        gradateur: gradateur.nom,
        numero,
        capacite,
        utile: capaciteUtile(capacite, marge),
        charge: 0,
        projecteurs: [],
        // Ce que l'appelant a joint à chaque projecteur, rendu tel quel.
        // Sans lui, une répartition ne serait qu'un texte à lire : impossible
        // de l'appliquer sans deviner à quel appareil correspond quel nom, et
        // deux projecteurs peuvent porter le même nom.
        refs: []
      })
    }
  }

  /**
   * La cle d un circuit : le nom du bloc, un separateur, le numero.
   *
   * **Le separateur est un octet nul, ecrit \u0000 et non pose litteralement
   * dans la source.** Un vrai octet nul s y trouvait au premier jet, invisible
   * a la relecture. C est la troisieme fois qu un caractere de controle finit
   * dans un fichier de cette maison, d ou le garde-fou de tests/application.mjs.
   *
   * Un espace ne conviendrait pas : « Bloc A » au circuit 1 donnerait la meme
   * cle que « Bloc » au circuit « A 1 ». Un nom de bloc peut contenir n importe
   * quoi, sauf un octet nul.
   */
  const cle = (g, n) => `${g}\u0000${n}`
  const parCle = new Map(circuits.map((c) => [cle(c.gradateur, c.numero), c]))

  // D'abord ceux que le régisseur a déjà placés : ils tiennent leur place.
  const aPlacer = []
  for (const projecteur of projecteursTrad) {
    if (projecteur.gradateur && projecteur.circuit) {
      const circuit = parCle.get(cle(projecteur.gradateur, projecteur.circuit))
      if (!circuit) throw refus('patch.circuitInconnu', { nom: projecteur.nom })
      circuit.charge += projecteur.puissance
      circuit.projecteurs.push(projecteur.nom)
      circuit.refs.push(projecteur.ref)
    } else {
      aPlacer.push(projecteur)
    }
  }

  const refuses = []
  // Le plus gourmand d'abord : placer un petit avant un gros laisse des trous
  // où le gros n'entre plus, et il faut alors tout reprendre.
  for (const projecteur of [...aPlacer].sort((a, b) => b.puissance - a.puissance)) {
    if (!(projecteur.puissance > 0)) throw refus('patch.puissancePositive', { nom: projecteur.nom })

    const accueil = circuits.find((c) => c.charge + projecteur.puissance <= c.utile)
    if (!accueil) {
      refuses.push({
        cle: 'patch.projecteurTropGourmand',
        nom: projecteur.nom,
        puissance: projecteur.puissance,
        ref: projecteur.ref
      })
      continue
    }
    accueil.charge += projecteur.puissance
    accueil.projecteurs.push(projecteur.nom)
    accueil.refs.push(projecteur.ref)
  }

  return { circuits, refuses }
}
