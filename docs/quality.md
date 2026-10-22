# Leggibilità, movimento e Lighthouse · 22 ottobre 2026

## Risultato misurato

[Audit GitHub riuscito](https://github.com/marius93rm/casaRusu/actions/runs/39799807441), sul commit `7f6490b`, con Lighthouse 13.5.0. Sei pagine (home, menu e piatto in RO/EN), profili mobile e desktop standard, tre esecuzioni per combinazione: 36 report HTML e JSON. Nessuna categoria esclusa tra Performance, Accessibility, Best Practices e SEO; nessuna modifica ai pesi o al rallentamento standard dei profili. Ogni navigazione usa il ripristino dello storage/cache previsto da Lighthouse.

| Pagine | Profilo | Prestazioni | Accessibilità | Buone pratiche | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Home, menu e piatto · RO/EN | Mobile | 100 | 100 | 100 | 100 |
| Home, menu e piatto · RO/EN | Desktop | 100 | 100 | 100 | 100 |

I punteggi in tabella sono le mediane delle tre esecuzioni, non il risultato migliore. 35 delle 36 esecuzioni hanno Performance 100; la prima esecuzione della home RO ha Performance 82. Tutte le 36 hanno 100 nelle altre tre categorie. Il valore anomalo resta nel [riepilogo completo](lighthouse-summary.json); non è stato eliminato o ritoccato. Questi sono risultati di laboratorio sul sito compilato e servito dal runner GitHub. I risultati dell’hosting pubblico andranno misurati dopo la pubblicazione.

Il workflow manuale `Lighthouse` costruisce il sito, lo serve su loopback e avvia Chrome soltanto nel runner GitHub isolato; non pubblica il sito. Gli artifact contengono tutti i report e hanno conservazione di 14 giorni. Il riepilogo JSON in repository conserva punteggi, tentativi e rilievi. La verifica fallisce se una mediana scende sotto 100 o se una qualsiasi esecuzione perde punti in accessibilità, buone pratiche o SEO.

## Cambiamenti

- Base tipografica a 18 px, testo principale a 17 px, navigazione e link funzionali a 16–17 px; testi secondari a 14–16 px. Il marchio mantiene proporzioni proprie. Il menu del sito diventa compatto sotto 1101 px, invece di ridurre i caratteri per farlo entrare.
- Pulsanti e titoli possono andare a capo; colonne e marchio non forzano una larghezza minima. A 320 px, con il testo al 200%, tutte le sei pagine restano entro la larghezza disponibile. Il menu aperto scorre se lo spazio verticale è insufficiente.
- Sezioni introdotte da una comparsa di 560 ms con traslazione di 18 px; movimento iniziale della fotografia di 1 secondo, senza nascondere il contenuto principale. Nessuna libreria di animazione. I contenuti rimangono leggibili se JavaScript non parte. Il focus termina le animazioni attive; `prefers-reduced-motion` evita le comparse e riduce le transizioni.
- Profilo TikTok fornito da Marius: [@restaurant.casarusu](https://www.tiktok.com/@restaurant.casarusu), nel footer e nel JSON-LD `sameAs`. Collegamento diretto, senza embed o script del social.
- CSS piccoli inclusi nell’HTML per eliminare richieste bloccanti. Precaricamento responsive dell’immagine principale. Font locali ridotti ai caratteri e ai pesi usati, mantenendo le lettere romene: 170.480 → 78.060 byte complessivi dei sei file, circa −54%. Originali e licenze conservati.
- Foto in AVIF con fallback WebP e JPG. Interno a 960 px: 90.128 → 43.188 byte. Nuova misura AVIF da 768 px per evitare il salto diretto da 640 a 960 sui telefoni. Copertina del menu a 800 px: 56.296 → 18.668 byte.
- Galleria: prima pagina immediata, pagine nascoste in template e vicina preparata quando il browser è libero. Evitato il caricamento iniziale di sei immagini. Senza JavaScript, `noscript` ripristina tutte le immagini; i link agli originali e la trascrizione restano disponibili.

## Verifiche aggiuntive

[Risultati axe-core 4.14.0](accessibility-checks.json): nessuna violazione o controllo incompleto sulle sei pagine a 320×844, nei due temi, includendo la regola `label-content-name-mismatch`. Il tema chiaro è stato applicato temporaneamente alla pagina con i colori di produzione; prima dell’audit sono state lasciate terminare le transizioni cromatiche. Corretto lo spazio tra le scritte del marchio e allineato il nome accessibile al testo visibile.

Controllati viewport 320, 390, 768, 1101 e 1440 px. Verificati salto all’ultima pagina della galleria, caricamento della pagina corretta, lente, Escape e ritorno del focus. In un iframe con script disabilitati sono presenti 14 immagini, 200 voci e navigazione disponibile. Verificati nel browser gli effetti di comparsa (560 ms); simulando la preferenza di movimento ridotto, il componente non avvia animazioni e il contenuto resta opaco. Non è stata modificata la preferenza globale del sistema.

`npm run build`, controlli SEO, menu, orari e `git diff --check` superati; Astro senza errori o warning. `npm audit fix` ha aggiornato dipendenze compatibili, senza cambiare le versioni principali; l’audit npm successivo non segnala vulnerabilità. Un 100 automatico non sostituisce una valutazione completa WCAG con tecnologie assistive.

[Desktop scuro](quality-desktop-dark.png) · [Mobile scuro](quality-mobile-dark.png) · [Mobile chiaro](quality-mobile-light.png)

## Ripetere e rigenerare

Avviare il workflow `Lighthouse` da GitHub Actions per rieseguire l’audit senza pubblicazione. In un ambiente con un endpoint CDP già attivo: `LIGHTHOUSE_PORT=PORT npm run audit:lighthouse`, mentre la build è servita su `http://127.0.0.1:4325`. Lo script Node si collega al browser esistente e non ne avvia uno. Su questo host rimane in vigore il divieto di avviare Chromium da shell.

Per rigenerare le foto: `node scripts/optimize-photos.mjs` (usa sharp disponibile con Astro). Per i font: `python scripts/optimize-fonts.py`, in un ambiente con fontTools 4.67.0 e brotli 1.2.0. I file ottimizzati sono versionati: questi strumenti non sono richiesti per la build ordinaria.

Riferimenti: [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/), [W3C: testo al 200%](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [web.dev: animazioni efficienti](https://web.dev/articles/animations-guide), [web.dev: font](https://web.dev/articles/font-best-practices), [Astro: CSS inline](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets).
