# Multilingua Casa Rusu

Implementato il 22 ottobre 2026 su richiesta di Marius: inglese, italiano, spagnolo, francese e tedesco, oltre al romeno esistente.

| Lingua | Home | Menu | Scheda del piatto |
| --- | --- | --- | --- |
| Română | `/` | `/meniu/` | `/preparate/snitel-cotlet-porc/` |
| English | `/en/` | `/en/meniu/` | `/en/preparate/snitel-cotlet-porc/` |
| Italiano | `/it/` | `/it/meniu/` | `/it/preparate/snitel-cotlet-porc/` |
| Español | `/es/` | `/es/meniu/` | `/es/preparate/snitel-cotlet-porc/` |
| Français | `/fr/` | `/fr/meniu/` | `/fr/preparate/snitel-cotlet-porc/` |
| Deutsch | `/de/` | `/de/meniu/` | `/de/preparate/snitel-cotlet-porc/` |

## Comportamento

Il selettore nell’header e nel footer presenta i nomi delle lingue nella loro lingua originale e indica la scelta attiva. Il controllo nativo `details` è utilizzabile con tastiera e senza JavaScript. Escape chiude il selettore e riporta il focus al comando; il click esterno lo chiude. Su mobile l’elenco rimane nel pannello di navigazione e può scorrere insieme a esso. Con JavaScript il cambio conserva anche query e fragment correnti, inclusa la scansione selezionata nella galleria; tutti i link interni mantengono la lingua attraverso il prefisso URL.

Home, navigazione, contatti, orari statici e stato di apertura, promozione con scadenza, scheda speciale, metadati, testi alternativi, breadcrumb e controlli del menu sono localizzati. Le 200 voci della trascrizione hanno nomi e ingredienti tradotti nelle cinque lingue richieste; i nomi propri e commerciali sono mantenuti. Quando il nome cambia, quello romeno è mostrato sotto la traduzione con `lang="ro"`, così si può identificare il piatto sul menu stampato. La ricerca trova sia il testo tradotto sia nomi e ingredienti originali. Quantità e prezzi provengono sempre dal catalogo originale; restano in lei romeni. Le 14 scansioni restano gli originali romeni, come indicato nell’introduzione della trascrizione.

Gli URL esistenti RO/EN continuano a funzionare. Le nuove rotte sono generate staticamente dai componenti condivisi. Non sono richiesti servizi esterni, richieste di traduzione nel browser o nuove dipendenze.

## Manutenzione

- `src/i18n/config.ts`: codici ISO, lingua predefinita e locale Open Graph.
- `src/i18n/locales/{ro,en,it,es,fr,de}.ts`: tutti i testi, metadati e messaggi. Il tipo `Translation` richiede gli stessi campi della lingua base.
- `src/data/site.ts`: dati commerciali e associazione ai testi localizzati.
- `src/data/menu.ts`: unica fonte per ordine delle pagine, voci originali, ingredienti, quantità e prezzi.
- `src/i18n/menu-translations.json`: traduzioni esatte dei titoli, nomi e singoli ingredienti. I nomi commerciali invariati sono elencati esplicitamente. Una nuova voce non tradotta provoca un errore di build; aggiungere le traduzioni insieme all’aggiornamento del catalogo.
- `src/i18n/paths.ts`: riconoscimento delle lingue e cambio del prefisso URL.

Con `SITE_URL` configurata, ogni pagina genera canonical, sei hreflang reciproci e `x-default` romeno. La sitemap associa le sei versioni di ciascuna pagina; il JSON-LD `Restaurant.menu` punta al menu nella lingua corrente. L’origine di produzione resta da configurare quando sarà disponibile il dominio, come tracciato in CR-03.

## Verifiche

- `npm run build`: controllo Astro senza diagnostiche, 18 rotte e controlli SEO/menu/orari/i18n.
- `SITE_URL=https://example.invalid ASTRO_TELEMETRY_DISABLED=1 npm run build`: prova di produzione con origine riservata, canonical/hreflang/sitemap; successivamente ripristinata la build locale senza origine.
- `check:i18n`: parità dei sei dizionari, segnaposto, 108 cambi lingua con query e ancora, link dei selettori nelle 18 pagine, lingua corrente e locale Open Graph.
- `check:menu`: 14 scansioni e 200 voci per lingua; ordine, prezzi e quantità identici, asset, controlli galleria e collegamenti alle schede.
- Paseo locale: tutte le 18 pagine a 320, 768 e 1440 px; anche le home a 1101 px. Nessun overflow orizzontale. Screenshot mobile a 390×844 e desktop a 1440×1000, con tema scuro e una verifica del tema chiaro tramite le variabili della palette.
- Ricerca EN/IT/ES/FR/DE: `chicken`/`pollo`/`poulet`/`hahnchen` trovano 15 voci; `telina` trova sette voci originali; `340` una voce; una query assente zero; la cancellazione ripristina tutte le 200 voci. Click reale IT → FR mantiene `?ref=test#menu-page-porc` e la scansione 06/14. Escape chiude il selettore e restituisce il focus.
- Axe-core su tutte le 18 pagine a 390×844 con navigazione e selettore aperti: nessuna violazione A/AA o best practice rilevata dopo la correzione dell’etichetta accessibile del selettore. La home RO è stata ricontrollata a fine animazione per escludere il contrasto transitorio durante la comparsa. Il controllo automatico non equivale a una verifica completa con lettori di schermo.
- Iframe di verifica con esecuzione degli script disabilitata: menu IT con sei link lingua, 14 scansioni, 200 voci e apertura nativa di selettore e categoria; la ricerca resta nascosta. Fixture e libreria di audit rimosse dalla build.

Misure in [checks.json](checks.json); screenshot nella stessa cartella. Il dominio e la pubblicazione restano tracciati separatamente in CR-03.
