/**
 * Conditions d'utilisation de Lumika.
 *
 * **À incrémenter à chaque modification du texte** : l'écran d'acceptation
 * réapparaît alors, et l'utilisateur relit ce qu'il accepte. Sans ce numéro, on
 * changerait les conditions dans le dos de quelqu'un qui les a déjà acceptées.
 *
 * Le texte est ici, dans les deux langues, et **nulle part ailleurs** :
 * `tests/coherence-conditions.mjs` compare la page publique à ce fichier, et
 * `npm run verifier` échoue si l'un des deux bouge sans l'autre.
 *
 * **Le risque couvert est électrique**, comme dans Scenika : la répartition des
 * projecteurs sur les circuits de gradateur additionne des watts, elle ne
 * contrôle rien de l'installation. S'y ajoute le risque propre au théâtre : un
 * patch faux ne se découvre qu'une fois tout accroché, en hauteur, souvent la
 * veille.
 *
 * Ce que Lumika ajoute aux conditions générales de la maison :
 * <https://resonlab.github.io/conditions.html>
 */

export const VERSION_CONDITIONS = '1.0'

/** La page publique, ouverte par le bouton « Lire sur le site ». */
export const URL_CONDITIONS = 'https://resonlab.github.io/lumika/conditions.html'
export const URL_CONDITIONS_EN = 'https://resonlab.github.io/lumika/en/terms.html'

export interface SectionConditions {
  titre: { fr: string; en: string }
  paragraphes: { fr: string; en: string }[]
}

export const CONDITIONS_UTILISATION: SectionConditions[] = [
  {
    titre: { fr: "1. Ce qu'est Lumika", en: '1. What Lumika is' },
    paragraphes: [
      {
        fr: "Lumika tient le plan de feu d'un lieu : les perches, l'inventaire des projecteurs, des lampes et des accessoires, les appareils accrochés, et le patch — circuit de gradateur pour le traditionnel, adresse DMX pour le reste.",
        en: 'Lumika holds the lighting plan of a venue: the bars, the inventory of fixtures, lamps and accessories, the hung units, and the patch — dimmer channel for conventional gear, DMX address for everything else.'
      },
      {
        fr: "Vos données restent sur votre machine. Pas de compte, pas d'abonnement, aucune donnée qui sort.",
        en: 'Your data stays on your machine. No account, no subscription, nothing leaves it.'
      }
    ]
  },
  {
    titre: {
      fr: "2. La répartition sur les circuits n'est pas un contrôle électrique",
      en: '2. The channel allocation is not an electrical inspection'
    },
    paragraphes: [
      {
        fr: "C'est le point le plus important de ce document. Lumika additionne les puissances que vous avez saisies et les répartit sur des circuits de gradateur. Elle ne vérifie rien de votre installation.",
        en: 'This is the most important point in this document. Lumika adds up the wattage you entered and spreads it across dimmer channels. It verifies nothing about your installation.'
      },
      {
        fr: "Elle ignore la section et la longueur des câbles, l'état du bloc de puissance, la qualité des connexions, la présence d'un différentiel, la température de la salle et la simultanéité réelle des circuits. Elle ignore aussi la puissance disponible en amont : quatre blocs pleins peuvent tenir chacun et faire sauter l'alimentation générale.",
        en: 'It knows nothing of cable section or length, the state of the dimmer rack, the quality of the connections, whether a residual-current device is fitted, the temperature of the room, or how many channels are really up at once. It also ignores the supply upstream: four racks can each be within limits and still trip the main feed.'
      },
      {
        fr: "La marge de 10 % appliquée par défaut à chaque circuit est une pratique de terrain, pas une norme. Une lampe halogène tire un fort appel de courant à l'allumage, et un circuit chargé au maximum déclenche au premier plein feu. Cette marge ne remplace pas le dimensionnement d'une installation par une personne qualifiée.",
        en: 'The 10% margin applied to each channel by default is common practice, not a standard. A halogen lamp draws a large inrush current when struck, and a channel loaded to the limit trips on the first full-up. That margin does not replace the sizing of an installation by a qualified person.'
      },
      {
        fr: "Une erreur de branchement peut faire disjoncter pendant une représentation, endommager un gradateur, provoquer un incendie ou blesser quelqu'un. Le raccordement électrique relève d’un électricien, et la responsabilité de votre installation reste entièrement la vôtre.",
        en: 'A wiring mistake can trip a breaker during a performance, damage a dimmer, start a fire or injure someone. Electrical connection is the work of an electrician, and responsibility for your installation remains entirely yours.'
      }
    ]
  },
  {
    titre: {
      fr: "3. Le patch est une aide à la préparation, pas une garantie",
      en: '3. The patch is a preparation aid, not a guarantee'
    },
    paragraphes: [
      {
        fr: "Lumika signale les chevauchements de canaux à partir de ce que vous avez saisi : l'adresse et le nombre de circuits de chaque bloc, l'adresse et le nombre de canaux de chaque appareil. Un mode mal renseigné, un bloc oublié ou une adresse fausse donnent un patch faux sans que rien ne le signale.",
        en: 'Lumika flags channel overlaps from what you entered: the address and channel count of each rack, the address and channel count of each fixture. A wrongly recorded mode, a forgotten rack or a wrong address produces a wrong patch with nothing to flag it.'
      },
      {
        fr: "Elle ne connaît que ce que vous lui décrivez. Elle ne voit ni le boîtier de scène, ni la longueur de la ligne DMX, ni les terminaisons, ni les splitters — autant de causes de pannes qui n'ont rien à voir avec l'adressage.",
        en: 'It only knows what you describe to it. It sees no stage box, no DMX line length, no terminators, no splitters — all of which cause faults that have nothing to do with addressing.'
      },
      {
        fr: "Vérifiez le patch sur le matériel avant la représentation. Un projecteur qui répond à la mauvaise adresse se voit tout de suite en salle, et jamais dans un tableau.",
        en: 'Check the patch on the actual equipment before the performance. A fixture answering the wrong address is obvious in the room, and never in a table.'
      }
    ]
  },
  {
    titre: {
      fr: "4. L'accroche et le travail en hauteur ne sont pas de son ressort",
      en: '4. Rigging and work at height are outside its scope'
    },
    paragraphes: [
      {
        fr: "Lumika enregistre où vous posez un appareil sur une perche. Elle ne calcule aucune charge, ne vérifie aucune capacité de levage, ne connaît ni les crochets, ni les élingues, ni les moteurs, ni la charge admissible du gril.",
        en: 'Lumika records where you place a fixture on a bar. It computes no load, checks no lifting capacity, and knows nothing of hooks, safety bonds, motors, or the permissible load of the grid.'
      },
      {
        fr: "Une perche surchargée ou un appareil mal accroché tombe sur le plateau. Le calcul de charge et l'accroche relèvent de personnes formées, et rien dans cette application ne s'y substitue.",
        en: 'An overloaded bar or a badly hung fixture falls onto the stage. Load calculation and rigging are the work of trained people, and nothing in this application substitutes for them.'
      }
    ]
  },
  {
    titre: { fr: '5. Vos données et vos sauvegardes', en: '5. Your data and your backups' },
    paragraphes: [
      {
        fr: "Lumika n'effectue pas de sauvegarde automatique. Votre plan de feu vit dans un fichier de base de données sur votre machine.",
        en: 'Lumika performs no automatic backup. Your lighting plan lives in a database file on your machine.'
      },
      {
        fr: "Une panne de disque, un vol ou une erreur de manipulation peuvent le détruire. Copiez-le régulièrement ailleurs, et vérifiez de temps en temps que la copie s'ouvre.",
        en: 'A disk failure, a theft or a slip of the hand can destroy it. Copy it elsewhere regularly, and check now and then that the copy opens.'
      }
    ]
  },
  {
    titre: { fr: '6. Absence de garantie', en: '6. No warranty' },
    paragraphes: [
      {
        fr: "Lumika est fournie telle quelle, sans garantie de fonctionnement ininterrompu ni d'absence d'erreur. Un logiciel peut contenir des défauts, y compris dans des calculs.",
        en: 'Lumika is provided as is, with no warranty of uninterrupted operation or freedom from error. Software can contain defects, including in calculations.'
      },
      {
        fr: "Ne vous reposez pas aveuglément sur une répartition de circuits, sur un contrôle de chevauchement, ni sur une feuille de patch.",
        en: 'Do not rely blindly on a channel allocation, on an overlap check, or on a patch sheet.'
      }
    ]
  },
  {
    titre: { fr: '7. Limitation de responsabilité', en: '7. Limitation of liability' },
    paragraphes: [
      {
        fr: "Dans les limites permises par la loi, l'éditeur ne répond pas des dommages découlant de l'utilisation de Lumika : perte de données, interruption d'une représentation, matériel endommagé, dommage matériel ou corporel.",
        en: 'To the extent permitted by law, the publisher is not liable for damages arising from the use of Lumika: loss of data, interruption of a performance, damaged equipment, or damage to property or persons.'
      },
      {
        fr: "Cette limitation ne s'applique pas en cas de faute grave ou intentionnelle, ni dans les situations où la loi impose une responsabilité qui ne peut être écartée. Selon votre pays, certaines de ces exclusions peuvent être sans effet à votre égard.",
        en: 'This limitation does not apply in cases of gross negligence or intent, nor where the law imposes liability that cannot be excluded. Depending on your country, some of these exclusions may have no effect on you.'
      }
    ]
  },
  {
    titre: { fr: '8. Acceptation', en: '8. Acceptance' },
    paragraphes: [
      {
        fr: "En utilisant Lumika, vous reconnaissez avoir lu ces conditions et accepté que la sécurité de votre installation électrique et de votre accroche relève de votre seule responsabilité.",
        en: 'By using Lumika you acknowledge that you have read these terms and accepted that the safety of your electrical installation and of your rigging is your responsibility alone.'
      },
      {
        fr: "Si vous n'acceptez pas ces conditions, n'utilisez pas l'application.",
        en: 'If you do not accept these terms, do not use the application.'
      }
    ]
  }
]

/** Ce qu'on retient, affiché en pied de l'écran d'acceptation. */
export const RESUME_CONDITIONS = {
  fr: "En résumé : vos données restent chez vous, et la répartition sur les circuits est une aide à la préparation — jamais un contrôle électrique. Le raccordement relève d'un électricien, et l'accroche de personnes formées.",
  en: 'In short: your data stays with you, and the channel allocation is a preparation aid — never an electrical inspection. Wiring is the work of an electrician, and rigging of trained people.'
}
