-- Le schéma de Lumika. SOURCE DE VÉRITÉ.
--
-- Règle héritée d'Ohmnia et de Scenika : on ajoute des colonnes par migration,
-- on n'en supprime jamais, et on ne supprime jamais la base pour appliquer un
-- changement. Un régisseur a un vrai plan de feu là-dedans.
--
-- Tout est en français, y compris les noms de colonnes : le projet doit rester
-- relisable par son auteur, qui n'est pas développeur de métier.

-- ─── L'inventaire ────────────────────────────────────────────────────────────
--
-- Trois natures, une seule table. Un porte-gobo et un PC 1000 n'ont pas les
-- mêmes champs, mais séparer en trois tables obligerait à écrire trois écrans
-- et trois requêtes pour répondre à « qu'est-ce que je possède ».

CREATE TABLE IF NOT EXISTS materiel (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nature        TEXT    NOT NULL CHECK (nature IN ('projecteur', 'lampe', 'accessoire')),
  designation   TEXT    NOT NULL,
  marque        TEXT    NOT NULL DEFAULT '',
  reference     TEXT    NOT NULL DEFAULT '',
  quantite      INTEGER NOT NULL DEFAULT 0 CHECK (quantite >= 0),

  -- Seuil d'alerte : en dessous, l'écran le signale. Les lampes claquent, et
  -- s'en apercevoir le soir de la générale est le scénario à éviter.
  seuil_alerte  INTEGER NOT NULL DEFAULT 0 CHECK (seuil_alerte >= 0),

  -- ─ Propre aux projecteurs ─
  -- 'trad' : une lampe et rien d'autre, il lui faut un circuit de gradateur.
  -- 'dmx'  : LED, asservi — il a son propre récepteur et occupe des canaux.
  -- Cette distinction commande tout le patch : voir commun/patch.js.
  genre         TEXT    NOT NULL DEFAULT 'trad' CHECK (genre IN ('trad', 'dmx')),
  type_optique  TEXT    NOT NULL DEFAULT '',   -- PC, découpe, PAR, cyclo, lyre…
  puissance     INTEGER NOT NULL DEFAULT 0 CHECK (puissance >= 0),  -- en watts
  canaux_dmx    INTEGER NOT NULL DEFAULT 0 CHECK (canaux_dmx >= 0),

  -- ─ Propre aux lampes ─
  culot         TEXT    NOT NULL DEFAULT '',   -- GX9.5, G22, E27…

  emplacement   TEXT    NOT NULL DEFAULT '',
  notes         TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_materiel_nature ON materiel (nature);

-- ─── Les perches ─────────────────────────────────────────────────────────────
--
-- Une perche porte des projecteurs. Sa position se donne en deux nombres :
-- la distance depuis le nu du rideau de fer (l'origine de toute cote au
-- théâtre) et la hauteur d'accroche.

CREATE TABLE IF NOT EXISTS perche (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nom         TEXT    NOT NULL,
  -- Distance depuis la face, en mètres. Une perche de face est devant le nu
  -- du cadre : sa distance est donc négative, et c'est normal.
  distance    REAL    NOT NULL DEFAULT 0,
  hauteur     REAL    NOT NULL DEFAULT 6 CHECK (hauteur > 0),
  -- Longueur utile, en mètres : elle borne la position latérale des appareils.
  longueur    REAL    NOT NULL DEFAULT 12 CHECK (longueur > 0),
  ordre       INTEGER NOT NULL DEFAULT 0,
  notes       TEXT    NOT NULL DEFAULT ''
);

-- ─── Les blocs de gradateurs ─────────────────────────────────────────────────
--
-- Un bloc occupe autant de canaux DMX qu'il a de circuits, à partir de son
-- adresse. **C'est ce qu'on oublie**, et c'est ce qui fait qu'une barre LED
-- posée dans cette plage allume des circuits au hasard.

CREATE TABLE IF NOT EXISTS gradateur (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  nom                  TEXT    NOT NULL,
  univers              INTEGER NOT NULL DEFAULT 1 CHECK (univers >= 1),
  adresse_dmx          INTEGER NOT NULL CHECK (adresse_dmx BETWEEN 1 AND 512),
  circuits             INTEGER NOT NULL CHECK (circuits >= 1),
  -- En watts. 2 kW est le standard des blocs de théâtre, beaucoup font 3 kW :
  -- c'est donc une valeur par bloc, pas une constante.
  capacite_par_circuit INTEGER NOT NULL DEFAULT 2000 CHECK (capacite_par_circuit > 0)
);

-- ─── Le plan de feu ──────────────────────────────────────────────────────────
--
-- Un appareil posé : un modèle de l'inventaire, une perche, une position
-- latérale, et son patch — circuit de gradateur si c'est du trad, adresse DMX
-- sinon. Les deux ne sont jamais renseignés ensemble.

CREATE TABLE IF NOT EXISTS appareil (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  materiel_id    INTEGER NOT NULL REFERENCES materiel (id) ON DELETE CASCADE,
  perche_id      INTEGER          REFERENCES perche (id) ON DELETE SET NULL,

  -- Position latérale sur la perche, en mètres depuis l'axe de la salle.
  -- Négatif à jardin, positif à cour — la convention du plateau.
  lateral        REAL    NOT NULL DEFAULT 0,

  -- Le numéro que porte l'appareil sur le plan de feu, celui qu'on crie
  -- pendant le montage. Ce n'est ni l'adresse ni le circuit.
  numero         INTEGER NOT NULL DEFAULT 0,

  -- ─ Patch : l'un ou l'autre, jamais les deux ─
  gradateur_id   INTEGER          REFERENCES gradateur (id) ON DELETE SET NULL,
  circuit        INTEGER,
  univers        INTEGER,
  adresse_dmx    INTEGER,

  gelatine       TEXT    NOT NULL DEFAULT '',   -- la référence du filtre : Lee 201…
  gobo           TEXT    NOT NULL DEFAULT '',
  fonction       TEXT    NOT NULL DEFAULT '',   -- « face jardin », « contre bleu »…
  notes          TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_appareil_perche ON appareil (perche_id);
CREATE INDEX IF NOT EXISTS idx_appareil_materiel ON appareil (materiel_id);
