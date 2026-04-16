/** UI copy in Italian. In-game event narratives stay English in data files. */
export const it = {
  appTitle: 'Hunger Games',
  appSubtitle: 'Simulatore',
  documentTitle: 'Hunger Games — Simulatore',

  seasonPlaceholder: 'Titolo edizione...',
  persistHintLobby:
    'Tributi, ritratti caricati, titolo edizione ed eventi personalizzati vengono salvati automaticamente in questo browser.',
  tributesHeading: (n: number) => `Tributi (${n})`,
  addTribute: '+ Aggiungi',
  loadJson: 'Carica JSON',
  saveJson: 'Salva JSON',
  uploadImages: 'Carica immagini',
  lobbyDropImagesHint:
    'Trascina qui più immagini per aggiungere tributi: il nome sarà quello del file (senza estensione).',
  eventsHeading: 'Eventi',
  eventsCustom: (n: number) => `(Personalizzati: ${n})`,
  eventsDefault: '(Predefiniti)',
  loadEvents: 'Carica eventi',
  saveEvents: 'Salva eventi',
  resetEventsDefault: 'Ripristina predefiniti',
  beginGames: 'Inizia i Giochi',
  needTwoTributes: 'Servono almeno 2 tributi',
  addTributeCard: 'Aggiungi tributo',

  topBarLogo: 'Hunger Games',
  statAlive: 'Vivi',
  statFallen: 'Caduti',
  settingsTitle: 'Impostazioni',
  abort: 'Abbandona',

  rosterSidebar: 'Tributi',
  rosterAliveCount: (alive: number, total: number) => `${alive}/${total}`,
  sidebarToggleShow: 'Mostra tributi',
  sidebarToggleHide: 'Nascondi tributi',
  sidebarClose: 'Chiudi',

  hudPanelStatus: 'Stato',
  hudPanelRun: 'Riproduzione',
  hudPanelMatch: 'Partita',
  hudPanelRound: 'Round',
  hudPanelScene: 'Scena',
  hudPanelCaduti: 'Caduti',
  hudPanelVincitori: 'Vincitori',
  hudPanelClassifica: 'Classifica',

  controlNext: '▶ Avanti',
  controlPause: '⏸ Pausa',
  controlStopAuto: 'Ferma auto',
  controlAutoPlay: 'Riproduzione auto',
  controlSpeed: 'Velocità',
  controlAbortGame: 'Abbandona partita',

  customization: 'Personalizzazione',
  themePreset: 'Stile tema',
  accentColor: 'Colore accento',
  motionLevel: 'Livello animazioni',
  motionFull: 'Complete',
  motionReduced: 'Ridotte',
  density: 'Densità interfaccia',
  densityRoomy: 'Ariosa',
  densityCompact: 'Compatta',
  gameSettings: 'Regole di gioco',
  killsPerRound: 'Eventi mortali per fase',
  killModeRandom: 'Completamente casuale',
  killModeExact: 'Numero fisso',
  killModeRange: 'Intervallo casuale',
  killHintRandom:
    'Il limite qui sotto vale per ogni singola fase (giorno, notte, bagno di sangue, banchetto) e conta gli eventi mortali, non il numero di vittime. 0 = nessun limite.',
  killHintExact:
    'Ogni singola fase puo avere fino a questo numero di eventi mortali (un evento con 2 morti conta comunque 1).',
  killHintRange:
    'Ogni singola fase puo avere un numero casuale di eventi mortali tra min e max (ogni evento letale conta 1).',
  maxDeathsPerPhase: 'Max eventi mortali per fase',
  unlimited: 'Illimitato',
  deathsPerRound: (n: number) => `Eventi mortali per fase: ${n}`,
  minDeaths: (n: number) => `Eventi mortali min: ${n}`,
  maxDeaths: (n: number) => `Eventi mortali max: ${n}`,
  eventsPerPhaseTitle: 'Scene per fase (numero casuale)',
  eventsPerPhaseHint:
    'Ogni fase mostra un numero casuale di scene tra min e max, ma se serve continua finche tutti i tributi vivi fanno almeno un\'azione.',
  eventsPerPhaseMin: (n: number) => `Min. scene: ${n}`,
  eventsPerPhaseMax: (n: number) => `Max scene: ${n}`,
  range0off: '0 — disattivo',
  close: 'Chiudi',
  drawerPersistHint:
    'Ritratti, titolo edizione, eventi personalizzati e queste opzioni sono salvati in questo browser (IndexedDB) e ricaricati automaticamente.',
  eraseLocalConfirm:
    'Cancellare tutti i dati salvati in questo browser? Ripartirai da tributi, immagini, eventi e impostazioni predefiniti.',
  eraseLocalButton: 'Cancella dati salvati nel browser',

  prevScene: '← Indietro',
  nextPhase: 'Fase successiva →',
  nextDay: 'Giorno dopo →',
  nextDayTitle: 'Salta al mattino dopo (notte, cannoni, ecc. in automatico)',
  nextScene: 'Scena successiva →',
  noEventsPhase: 'Nessun evento in questa fase.',
  eventNavHintEnd: 'Fase successiva — un passo (es. cannoni). Giorno dopo — salta al mattino seguente.',
  eventNavHintScenes: '[ ] o Invio — scena precedente / successiva',

  editSceneAction: 'Modifica scena',
  editSceneTitle: 'Modifica testo scena',
  editSceneHint:
    'Segnaposto: %0 %1 … = nome; %N0 %A0 %G0 %R0 = pronomi; %s0 %e0 %y0 %i0 %h0 %!0 %w0 = accordi sul tributo 0 (cambia la cifra).',
  editSceneInsertNames: 'Nome',
  editSceneInsertPronouns: 'Pronomi',
  editSceneInsertGrammar: 'Accordi',
  editScenePreview: 'Anteprima',
  editScenePreviewError: 'Anteprima non disponibile: controlla i segnaposto (indici 0…n−1 per questa scena).',
  editSceneSave: 'Salva',
  editSceneCancel: 'Annulla',

  eventPoolBuiltinHint:
    'Stai usando l’elenco predefinito. Per modificare singole azioni, crea una copia modificabile (puoi sempre tornare ai predefiniti).',
  eventPoolCustomize: 'Personalizza elenco azioni',
  eventPoolListTitle: 'Elenco azioni (modello)',
  eventPoolTabAll: 'Tutte le fasi',
  eventPoolAddEvent: '+ Aggiungi azione',
  eventPoolColText: 'Testo',
  eventPoolColMeta: 'Morti / killer',
  eventPoolEmptyCategory: 'Nessuna azione in questa categoria. Aggiungine una o incolla un JSON.',
  eventPoolEdit: 'Modifica',
  eventPoolDelete: 'Elimina',
  eventPoolBadgeDeath: 'M',
  eventPoolBadgeKill: 'K',
  eventPoolEditModalTitle: 'Modifica azione',
  eventPoolFieldMessage: 'Messaggio (modello)',
  eventPoolFieldFatalities: 'Vittime (indici slot, es. 1 oppure 0,1)',
  eventPoolFieldKillers: 'Assassini (indici, opzionale)',
  eventPoolFieldEnabled: 'Attiva in simulazione',

  cannonShots: (n: number) => (n === 1 ? 'Colpo di cannone' : 'Colpi di cannone'),
  noCannonHeard: 'Non si sentono colpi di cannone in lontananza.',
  stageNext: 'Avanti →',
  gamesEnded: 'I Giochi sono finiti',
  noVictorsRemain: 'Nessun vincitore',

  resultsVictory: 'Vittoria',
  resultsNoVictors: 'Nessun sopravvissuto',
  allTributes: 'Tutti i tributi',
  victor: 'Vincitore',
  eliminatedRound: (r: number) => `Eliminato al turno ${r}`,
  diedRound: (r: number) => `Morto al turno ${r}`,
  kills: (n: number) => (n === 1 ? '1 uccisione' : `${n} uccisioni`),
  playAgain: 'Gioca ancora',
  backToLobby: 'Torna al menu',

  tributeNamePh: 'Nome tributo',
  pronounHe: 'Lui',
  pronounShe: 'Lei',
  pronounThey: 'Loro',
  pronounNone: 'Senza pronomi',
  pronounCustom: 'Personalizzati',
  pronounCustomPh: 'nom/acc/gen/rifl.',
  uploadImage: 'Carica immagine',
  removeTribute: 'Rimuovi',

  killer: 'Assassino',
  eliminated: 'Eliminato',

  ccgPower: 'AZIONE',
  killCountTitle: (n: number) => (n === 1 ? '1 uccisione' : `${n} uccisioni`),
  ccgKillBadgeLabel: 'UCC.',
  /** Shown on duel cards when there is no usable portrait image */
  comicPortraitEmpty: 'RITRATTO',
  tradingCardKind: 'Tributo',
  tradingCardStars: (n: number) => (n === 1 ? '★ 1' : `★ ${n}`),

  errorNeedTwoTributes: 'Servono almeno 2 tributi per iniziare!',
  errorLoadCharacters: 'Impossibile caricare i personaggi',
  errorLoadEvents: 'Impossibile caricare gli eventi',

  themePresetLabels: {
    toon: 'Cartone',
    dark: 'Scuro',
    ember: 'Braci',
    neon: 'Neon',
    ice: 'Ghiaccio',
  } as const,
}

export function translateGameTitle(title: string): string {
  const map: Record<string, string> = {
    'The Fallen': 'I caduti',
    'The Games Have Ended': 'I Giochi sono finiti',
    Deaths: 'Morti',
    Winners: 'Vincitori',
    Bloodbath: 'Bagno di sangue',
    Feast: 'Banchetto',
  }
  if (map[title]) return map[title]
  const day = /^Day (\d+)$/.exec(title)
  if (day) return `Giorno ${day[1]}`
  const night = /^Night (\d+)$/.exec(title)
  if (night) return `Notte ${night[1]}`
  return title
}

export function translateGameStage(stage: string): string {
  const s: Record<string, string> = {
    bloodbath: 'Bagno di sangue',
    day: 'Giorno',
    night: 'Notte',
    feast: 'Banchetto',
  }
  return s[stage] ?? stage
}

export function formatRoundDeathHeader(roundIndex: number, stage: string): string {
  return `Turno ${roundIndex + 1}: ${translateGameStage(stage)}`
}
