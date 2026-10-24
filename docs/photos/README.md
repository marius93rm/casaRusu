# Fotografie del ristorante

## Qualità originale

Dopo il riscontro di Marius sulla qualità, tutte e sette le fotografie sono servite direttamente dai JPEG consegnati in `Desktop/nuoveCasaRusu`, a 2048 × 1366 pixel. Non vengono ridimensionate o ricompresse. Verificato byte per byte che anche le risposte HTTP dell’anteprima contengono esattamente i file originali.

I JPEG pesano da 108.417 a 253.632 byte ciascuno; complessivamente 1.129.665 byte. Per questi materiali la priorità è conservare il dettaglio originale. Le precedenti versioni WebP/AVIF compresse non vengono più usate per le foto del ristorante. Le immagini del menu stampato mantengono la propria pipeline separata.

`RestaurantPhoto.astro` usa il JPEG originale in home, menu e scheda del piatto. Il preload della foto principale punta allo stesso JPEG. Le dimensioni intrinseche riservano lo spazio; le altre foto mantengono lazy loading e decoding asincrono. La galleria carica i JPEG quando si avvicinano alla zona visibile, con IntersectionObserver, evitando il caricamento anticipato dell’intera striscia. Con JavaScript disattivato, le foto sono disponibili nel markup `noscript`.

Non ci sono autoplay, librerie di slider, filtri di nitidezza o ingrandimenti artificiali. Le inquadrature ampie, le didascalie e gli alt nelle sei lingue restano presenti, con scorrimento nativo e comandi accessibili.

Le copie di distribuzione hanno nomi descrittivi. Dimensioni, corrispondenza con i nomi consegnati e impronte SHA-256 sono in [inventory.json](inventory.json).

Per controllare i JPEG conservati e rigenerare l’inventario:

```sh
node scripts/prepare-restaurant-photos.mjs
```

Per copiare nuovamente i sette originali consegnati, senza trasformazioni:

```sh
node scripts/prepare-restaurant-photos.mjs /percorso/nuoveCasaRusu
```

Anche `scripts/optimize-photos.mjs` conserva gli originali del ristorante e applica l’encoding soltanto alle pagine stampate del menu.

## Verifiche

Build completa superata: 61 file controllati senza errori, warning o hint; 19 pagine statiche; controlli SEO, menu, orari, i18n e rilevamento lingua superati. Chrome collegato conferma che il file selezionato per l’immagine principale è il JPEG da 2048 px. Nessun `srcset` può più selezionare una foto del ristorante a bassa risoluzione.

La correzione dello spostamento del layout nella galleria del menu è mantenuta: inizializzazione della geometria durante il parsing, box delle immagini stabile e spazio del link di ricerca riservato.

## Lighthouse

I risultati aggiornati dopo il ripristino degli originali sono in [lighthouse-summary.json](lighthouse-summary.json). Audit locale su build di produzione simulata con `SITE_URL=https://example.invalid`, senza modifica del dominio del progetto o pubblicazione. Lighthouse 13.5.0, Chrome headless isolato, profili predefiniti mobile/desktop e cache fredda. Mediana di tre prove per la home; una prova per menu e scheda del piatto, per profilo.

Sono misure di laboratorio. Il peso dei file originali è deliberatamente superiore a quello delle versioni precedenti, per preservare integralmente le fotografie consegnate.

| Pagina IT | Performance mobile | Performance desktop | Accessibilità | Best practice | SEO |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home | 92 | 100 | 100 | 100 | 100 |
| Menu | 100 | 100 | 100 | 100 | 100 |
| Scheda del piatto | 100 | 100 | 100 | 100 | 100 |

Home: 662.857 byte trasferiti nell’audit, contro 1.263.535 prima di differire il caricamento della galleria, sempre usando gli originali. LCP mediano mobile 3,31 s e desktop 0,67 s; TBT mediano 0 ms e CLS mediano 0. Il maggiore tempo LCP mobile rispetto alla prima versione compressa è il compromesso misurato per mantenere i JPEG originali.

Report completi: `reports/photos-originals-lighthouse/` per menu e piatto e `reports/photos-originals-lighthouse-final/` per la home aggiornata, entrambi ignorati da Git.
