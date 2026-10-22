# Menu Casa Rusu

Le 14 immagini sono state fornite da Marius nella cartella `Desktop/menu` il 21 ottobre 2026. `src/data/menu.ts` conserva la corrispondenza con i nomi originali, l'ordine di lettura, le categorie localizzate e la trascrizione originale di 200 voci. I JPEG in `public/images/menu/` sono copie integrali dei file ricevuti; i WebP sono varianti da 480, 800, 1200 e 1448 px, qualità 82. Tutte le pagine originali misurano 1448 × 2048 px. Gli asset sono già versionati: la build non richiede i file sul Desktop.

## Aggiornamenti dei contenuti

- Conservare la corrispondenza fra originale e trascrizione: nomi, ingredienti, quantità e prezzi in lei.
- Dal 22/10/2026, su richiesta multilingua di Marius, la trascrizione è tradotta in EN/IT/ES/FR/DE oltre al romeno originale. `src/i18n/menu-translations.json` conserva le traduzioni di nomi, ingredienti e titoli; aggiornare tutte le lingue insieme alla fonte. I nomi originali sono mostrati sotto le traduzioni con `lang="ro"`; le liste dichiarano la lingua corrente. Le scansioni rimangono originali romene. Dettagli e verifiche in [Multilingua](i18n/README.md).
- Il menu stampato indica “Limonadă 50ml” e quantità delle birre “0.33” senza unità. Questi valori sono riportati come ricevuti; non correggerli o convertirli senza una fonte aggiornata. Non dedurre allergeni, dati nutrizionali o disponibilità da un elenco ingredienti.
- La scheda dello șnițel descrive un piatto con contorno; il menu elenca lo șnițel da 300g e i contorni separatamente. Non applicare il prezzo della sola voce alla combinazione descritta nella scheda speciale.
- Quando cambia una pagina, aggiornare il JPEG, tutte le varianti, la relativa trascrizione e le traduzioni; mantenere identificatori stabili per indice e ancore.

## Comportamento

`MenuGallery.astro` usa scorrimento nativo con scroll-snap, indice desktop, selettore mobile, pulsanti e tastiera (frecce/Home/End). Nessun avanzamento automatico. Le slide fuori vista sono escluse dalla navigazione assistita; la pagina attiva è annunciata senza spostare il focus. Il dialog usa l'originale JPEG, zoom da 1× a 4×, scorrimento nativo, Escape e restituzione del focus. La preferenza di movimento ridotto evita lo scorrimento animato.

Senza JavaScript rimangono indice ad ancore, immagini in sequenza, accesso agli originali e testo espandibile tramite `details` nativi. `MenuPreview.astro` aggiunge il richiamo visivo nella home; i pulsanti in apertura e nell'anteprima puntano al menu della lingua corrente. Le schede speciali e la scadenza dell'offerta cocktail restano operative.

## Verifiche del 21 ottobre 2026

- Pull fast-forward della baseline `4eb3e78`, lavoro isolato su `feat/menu-gallery`.
- `npm run build`: controllo Astro, sei pagine, checker SEO esistente e nuovo `check:menu`. Quest'ultimo verifica tutte le immagini e varianti, le 200 voci statiche identiche in RO/EN, le alternative testuali e i link da home e schede speciali.
- Paseo: home/menu RO/EN a 320, 390, 768, 1024 e 1440 px, senza overflow; selettore, pulsanti, scorrimento orizzontale e zoom. Chrome tramite estensione ufficiale: navigazione da tastiera, Home/End/frecce e singola slide attiva. Escape chiude il dialog e restituisce il focus.
- Axe-core (WCAG A/AA e best practice): nessuna violazione nelle viste home e menu controllate, anche menu inglese mobile e fallback senza script. I risultati automatici non sostituiscono una verifica completa con tecnologie assistive.
- Fixture temporanea senza script: tutte le 14 immagini e 200 voci disponibili; apertura di `details` funzionante. Fixture con `prefers-reduced-motion` simulato: avanzamento con `behavior: instant`. Le fixture e la libreria di audit non fanno parte del sito.
- Origine pubblica ancora assente: `siteUrl` rimane vuoto, come nella baseline. Canonical, hreflang e sitemap di produzione si attivano con il dominio confermato.
