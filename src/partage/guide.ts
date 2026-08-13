/**
 * Le guide de prise en main — **comment on s'en sert**.
 *
 * Le site dit ce que fait Lumika et ce qu'elle ne fait pas. Il ne dit nulle
 * part par où l'on commence. Quelqu'un qui télécharge se retrouve devant une
 * application vide sans savoir quoi cliquer, et **c'est là qu'on perd les
 * gens**, pas à la page d'accueil.
 *
 * Le texte vit ici, dans les deux langues, et **nulle part ailleurs** :
 * `scripts/publier-guide.mjs` en déduit `docs/guide.html` et `docs/en/guide.html`,
 * et `scripts/guide-pdf.mjs` en tire le PDF joint aux releases. Recopié à la
 * main, il divergerait au premier correctif.
 *
 * **L'ordre des étapes n'est pas décoratif.** On ne peut pas poser un appareil
 * sans l'avoir dans l'inventaire, ni le patcher sans avoir déclaré un bloc. Le
 * guide suit l'ordre où l'application refuse — c'est le seul qui ne mène pas à
 * un message d'erreur.
 */

export interface EtapeGuide {
  titre: { fr: string; en: string }
  texte: { fr: string; en: string }
  /** Ce qui coince à cette étape, et qu'on ne devine pas. */
  piege?: { fr: string; en: string }
}

export interface SectionGuide {
  titre: { fr: string; en: string }
  intro: { fr: string; en: string }
  etapes: EtapeGuide[]
}

export const GUIDE: SectionGuide[] = [
  {
    titre: { fr: '1. Remplir l’inventaire', en: '1. Fill the inventory' },
    intro: {
      fr: 'On commence toujours par là. Un appareil qui n’est pas dans l’inventaire ne peut pas être posé sur une perche : l’écran du plan de feu n’a rien à vous proposer.',
      en: 'Always start here. A fixture that is not in the inventory cannot be hung on a bar: the lighting plan screen has nothing to offer you.'
    },
    etapes: [
      {
        titre: { fr: 'Saisir les projecteurs', en: 'Enter the fixtures' },
        texte: {
          fr: 'Onglet Inventaire, sous-onglet Projecteurs. Pour chacun : sa désignation, sa marque, son optique — PC, découpe, PAR, cyclo — et surtout son genre.',
          en: 'Inventory tab, Fixtures sub-tab. For each one: its name, its brand, its optics — fresnel, profile, PAR, cyc — and above all its kind.'
        },
        piege: {
          fr: 'Le genre décide de tout le reste. « Traditionnel » veut dire une lampe et rien d’autre : il lui faudra un circuit de gradateur. « DMX » veut dire LED ou asservi : il aura sa propre adresse, et vous devez alors saisir son nombre de canaux. L’application refuse un appareil DMX sans nombre de canaux, parce qu’il occuperait zéro canal et que le contrôle de patch dirait oui à un plan faux.',
          en: 'The kind decides everything else. "Conventional" means a lamp and nothing more: it will need a dimmer channel. "DMX" means LED or moving light: it gets its own address, and you must then enter its channel count. The application refuses a DMX fixture with no channel count, because it would occupy no channel and the patch check would approve a wrong plan.'
        }
      },
      {
        titre: { fr: 'Saisir les lampes', en: 'Enter the lamps' },
        texte: {
          fr: 'Sous-onglet Lampes. Le culot compte autant que la puissance : c’est lui qui dit si une lampe va dans un projecteur. Renseignez un seuil d’alerte.',
          en: 'Lamps sub-tab. The base matters as much as the wattage: it is what tells you whether a lamp fits a fixture. Set an alert threshold.'
        },
        piege: {
          fr: 'Un seuil à zéro veut dire « je ne surveille pas », pas « alerte dès que c’est vide ». Sans cette distinction, tout l’inventaire finirait en alerte et personne ne regarderait plus la liste.',
          en: 'A threshold of zero means "not watching", not "alert as soon as it is empty". Without that distinction the whole inventory would end up flagged and nobody would look at the list any more.'
        }
      }
    ]
  },
  {
    titre: { fr: '2. Déclarer les perches', en: '2. Declare the bars' },
    intro: {
      fr: 'Une perche porte des appareils. Elle se décrit par trois nombres, et le premier est celui qu’on saisit de travers.',
      en: 'A bar carries fixtures. It is described by three numbers, and the first is the one people get wrong.'
    },
    etapes: [
      {
        titre: { fr: 'La distance, la hauteur, la longueur', en: 'Distance, height, length' },
        texte: {
          fr: 'Onglet Perches. La distance se compte depuis le nu du cadre de scène — l’origine de toute cote au théâtre. La hauteur est celle d’accroche. La longueur borne la position latérale des appareils.',
          en: 'Bars tab. Distance is measured from the proscenium line — the origin of every dimension in a theatre. Height is the trim height. Length bounds the lateral position of the fixtures.'
        },
        piege: {
          fr: 'Une perche de face est devant le cadre : sa distance est donc négative, et c’est normal. Saisir 4 au lieu de −4 met votre face au lointain, et le plan de scène le montre tout de suite.',
          en: 'A front-of-house bar sits before the proscenium: its distance is therefore negative, and that is correct. Entering 4 instead of −4 puts your front light upstage, and the stage view shows it immediately.'
        }
      }
    ]
  },
  {
    titre: { fr: '3. Déclarer les blocs de gradateurs', en: '3. Declare the dimmer racks' },
    intro: {
      fr: 'À faire avant de patcher quoi que ce soit. C’est aussi l’étape qui évite l’erreur la plus coûteuse du montage.',
      en: 'Do this before patching anything. It is also the step that prevents the most costly mistake of the rig.'
    },
    etapes: [
      {
        titre: { fr: 'Adresse, nombre de circuits, capacité', en: 'Address, circuit count, capacity' },
        texte: {
          fr: 'Onglet Patch. Un bloc porte un nom, une adresse DMX de départ, son nombre de circuits, et la puissance qu’un circuit accepte — 2 kW est le standard, beaucoup de blocs font 3 kW.',
          en: 'Patch tab. A rack has a name, a starting DMX address, its number of circuits, and the power one circuit accepts — 2 kW is standard, many racks are 3 kW.'
        },
        piege: {
          fr: 'Un bloc occupe lui-même autant de canaux DMX qu’il a de circuits. Un bloc de 24 adressé en 1 occupe les canaux 1 à 24. C’est ce qu’on oublie : y poser une barre LED en 12 marche parfaitement sur le papier et allume des circuits au hasard sur le plateau. Lumika compare les deux dans le même espace et vous le dit avant le montage.',
          en: 'A rack occupies as many DMX channels as it has circuits. A 24-way rack addressed at 1 occupies channels 1 to 24. That is what gets forgotten: placing a LED bar at 12 works perfectly on paper and lights random circuits on stage. Lumika compares both in the same space and tells you before the rig.'
        }
      }
    ]
  },
  {
    titre: { fr: '4. Poser le plan de feu', en: '4. Build the lighting plan' },
    intro: {
      fr: 'Maintenant seulement. Chaque appareil posé prend un modèle de l’inventaire, une perche, une place et un patch.',
      en: 'Only now. Each placed fixture takes a model from the inventory, a bar, a position and a patch.'
    },
    etapes: [
      {
        titre: { fr: 'Poser, numéroter, patcher', en: 'Place, number, patch' },
        texte: {
          fr: 'Onglet Plan de feu. Le numéro est celui qu’on crie pendant le montage — ce n’est ni l’adresse ni le circuit. La position latérale se compte depuis l’axe de la salle : négatif à jardin, positif à cour.',
          en: 'Lighting plan tab. The number is the one shouted during the rig — it is neither the address nor the channel. Lateral position is measured from the centre line: negative stage right, positive stage left.'
        },
        piege: {
          fr: 'Le formulaire suit le genre de l’appareil : un traditionnel ne demande qu’un circuit, un DMX qu’une adresse. Il n’est jamais possible de renseigner les deux — un appareil qui porte les deux est un appareil dont personne ne sait comment on l’allume.',
          en: 'The form follows the kind of fixture: a conventional one asks only for a channel, a DMX one only for an address. You can never fill both — a fixture carrying both is one nobody knows how to bring up.'
        }
      },
      {
        titre: { fr: 'Laisser Lumika répartir', en: 'Let Lumika allocate' },
        texte: {
          fr: 'Onglet Patch, bouton « Proposer une répartition ». Elle place les projecteurs traditionnels sur les circuits : le plus gourmand d’abord, puis le premier circuit qui l’accepte. Vous voyez la proposition avant de l’appliquer.',
          en: 'Patch tab, "Suggest an allocation" button. It places conventional fixtures on the channels: hungriest first, then the first channel that takes it. You see the suggestion before applying it.'
        },
        piege: {
          fr: 'Ce que vous avez patché à la main n’est jamais déplacé : on complète un patch, on ne le refait pas dans votre dos. Et un projecteur plus gourmand qu’un circuit entier est refusé et nommé, jamais casé de force.',
          en: 'Whatever you patched by hand is never moved: it completes a patch, it does not redo it behind your back. And a fixture drawing more than a whole channel is refused and named, never forced in.'
        }
      }
    ]
  },
  {
    titre: { fr: '5. Vérifier, puis imprimer', en: '5. Check, then print' },
    intro: {
      fr: 'Les deux écrans qu’on regarde en dernier, et qui font gagner la soirée.',
      en: 'The last two screens you look at, and the ones that save your evening.'
    },
    etapes: [
      {
        titre: { fr: 'La vue de scène', en: 'The stage view' },
        texte: {
          fr: 'Onglet Scène. Le plateau vu du dessus, les perches à leur distance. L’écran des perches montre le gril de face ; celui-ci montre la profondeur, et c’est elle qui décide de tout — une face qui vient de trop loin écrase les volumes.',
          en: 'Stage tab. The stage seen from above, the bars at their distance. The Bars screen shows the grid from the front; this one shows depth, and depth decides everything — front light from too far flattens the volumes.'
        }
      },
      {
        titre: { fr: 'La feuille de patch', en: 'The patch sheet' },
        texte: {
          fr: 'Onglet Feuille, bouton Imprimer. C’est le document qu’on emporte au montage : trié par patch et non par numéro d’appareil, parce qu’on ne cherche pas « où est le 12 » mais « qu’est-ce qu’il y a sur le circuit 7 ».',
          en: 'Sheet tab, Print button. This is the document you take to the rig: sorted by patch rather than by fixture number, because you do not look for "where is 12" but for "what is on channel 7".'
        },
        piege: {
          fr: 'Les appareils sans patch sont listés en tête, exprès. Un appareil accroché que personne n’a patché, c’est ce qu’on découvre au noir.',
          en: 'Fixtures with no patch are listed first, on purpose. A hung fixture nobody patched is what you discover in the blackout.'
        }
      }
    ]
  }
]

/** Ce qu'on retient, en tête du guide. */
export const RESUME_GUIDE = {
  fr: 'Inventaire, perches, blocs de gradateurs, plan de feu, vérification. Cet ordre-là, et pas un autre : c’est celui dans lequel l’application ne refuse rien.',
  en: 'Inventory, bars, dimmer racks, lighting plan, check. That order and no other: it is the one in which the application refuses nothing.'
}
