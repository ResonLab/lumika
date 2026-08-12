import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { definirContexte } from './contexte'
import { fermerBaseDeDonnees, ouvrirBaseDeDonnees } from './db/database'
// Le schéma est inliné à la construction : le fichier .sql n'a donc pas besoin
// d'être embarqué dans l'installateur, et il reste la source de vérité unique.
import schema from './db/schema.sql?raw'
import { enregistrerHandlersInventaire } from './ipc/inventaire'
import { enregistrerHandlersPlanDeFeu } from './ipc/planDeFeu'

// Nom fixé explicitement : sans cela le dossier de données change selon le mode
// de lancement. Bug réel vécu sur Ohmnia, repayé nulle part depuis.
app.setName('Lumika')

function creerFenetrePrincipale(): void {
  const fenetre = new BrowserWindow({
    width: 1280,
    height: 860,
    // Un plan de feu est un tableau large : sous cette largeur les colonnes se
    // coupent. Piège déjà payé sur Ohmnia.
    minWidth: 940,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#160810',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  fenetre.once('ready-to-show', () => fenetre.show())

  // Les liens externes s'ouvrent dans le navigateur système, jamais dans l'app.
  fenetre.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    fenetre.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    fenetre.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Seul endroit où Electron dicte où vivent les données. Tout le reste lit ces
  // valeurs depuis `contexte`, ce qui garde la couche métier éprouvable sans
  // lancer de fenêtre.
  definirContexte({ dossierDonnees: app.getPath('userData'), version: app.getVersion() })

  ouvrirBaseDeDonnees(schema)
  enregistrerHandlersInventaire()
  enregistrerHandlersPlanDeFeu()

  creerFenetrePrincipale()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) creerFenetrePrincipale()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Le journal WAL est vidé avant de quitter : sans cela une copie de la base
// pourrait ne pas contenir les dernières écritures.
app.on('will-quit', fermerBaseDeDonnees)
