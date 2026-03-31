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
  killsPerRound: 'Morti per fase',
  killModeRandom: 'Completamente casuale',
  killModeExact: 'Numero fisso',
  killModeRange: 'Intervallo casuale',
  killHintRandom:
    'Il limite qui sotto evita che muoiano tutti in un solo giorno/notte. 0 = nessun limite.',
  killHintExact: 'Esattamente questo numero di morti per fase (0 = possibile fase tranquilla).',
  killHintRange: 'Ogni fase un numero casuale di morti tra min e max.',
  maxDeathsPerPhase: 'Max morti per fase',
  unlimited: 'Illimitato',
  deathsPerRound: (n: number) => `Morti per fase: ${n}`,
  minDeaths: (n: number) => `Morti min: ${n}`,
  maxDeaths: (n: number) => `Morti max: ${n}`,
  eventsPerPhaseTitle: 'Scene per fase (numero casuale)',
  eventsPerPhaseHint:
    'Ogni giorno/notte/bagno di sangue/banchetto mostra un numero casuale di scene tra min e max (i testi degli eventi restano in inglese).',
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
  taglinePh: 'Slogan o squadra...',
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
