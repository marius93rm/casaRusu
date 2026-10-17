# Casa Rusu — backlog incrementale

**Fonte:** prima analisi locale fornita da Marius. I rilievi sono la baseline; prima di ogni modifica l’agente deve ricontrollare codice e anteprima, perché stato e misure possono cambiare.

## Priorità alta

- [x] **CR-01 — Anteprima del menu e scheda del piatto in evidenza.** Su indicazione di Marius (13/10/2026), il menu segnala che quello completo arriverà e presenta solo lo șnițel già pubblicato sul sito, con una pagina di dettaglio nelle versioni RO/EN. Nessun dato commerciale nuovo aggiunto. Menu completo, prezzi e informazioni alimentari restano in sospeso finché il ristorante non fornisce dati aggiornati e approvati.
- [x] **CR-02 — Alternativa alla prenotazione telefonica.** Decisione di Marius (13/10/2026): mantenere per ora la prenotazione telefonica; nessun canale alternativo da introdurre.
- [ ] **CR-03 — Configurazione SEO di produzione.** Impostare `seo.siteUrl` in `src/config/site.ts` per canonical, hreflang, sitemap e anteprime social. **Blocco:** attendere dominio HTTPS e hosting confermati; non inserire origini ipotetiche.

## Priorità media

- [x] **CR-04 — Leggibilità dei testi funzionali su mobile.** CTA, link e orari portati a 14,4 px sotto 760 px; verificati a 320 e 390 px senza overflow e a 1440 px per la resa desktop.
- [ ] **CR-05 — Descrivere meglio l’offerta.** Precisare cucina, fascia di prezzo e specialità soltanto con informazioni confermate dal ristorante.
- [x] **CR-06 — Prenotazione accessibile durante lo scroll mobile.** Aggiunta una CTA telefonica fissa in basso sotto 760 px, con numero e testo già configurati e spazio per l’area sicura; verificata in Chromium a 390×844, dopo lo scroll e a 1440×1000 (nascosta su desktop).
- [x] **CR-07 — CTA della sezione cucina.** Il collegamento porta alla scheda locale del piatto invece che a Facebook; implementato con CR-01 nel commit `604d09b`. Verificato nel browser in RO a 390×844 e 1440×1000 e in EN a 1440×1000, senza overflow; le destinazioni sono localizzate. **Dipendenza:** CR-01 completato; non serve scegliere un canale di prenotazione per questa CTA.
- [x] **CR-08 — Elementi di fiducia.** Aggiunto un collegamento diretto alla scheda Google che corrisponde a nome, indirizzo e telefono del ristorante, per leggere le recensioni aggiornate. Non sono stati copiati testi o rating, che Google indica come non confermati. Non aggiunte informazioni sulla gestione o altri piatti senza contenuti approvati.
- [x] **CR-10 — Hreflang per pagina localizzata.** In `BaseLayout.astro` i link `hreflang` di ogni pagina puntavano alle homepage RO/EN; menu e scheda del piatto non indicavano la controparte tradotta. Generati i link della stessa rotta, con slash canonico e `x-default` sulla versione RO. Verificati tutti e sei gli HTML generati (home, menu e scheda piatto in RO/EN): ciascun `hreflang` corrisponde al canonical della pagina tradotta.

## Priorità bassa

- [x] **CR-09 — Varianti responsive delle immagini.** Aggiunte varianti WebP da 640 a 1920 px (fino a 1439 px per l’esterno), `srcset` e fallback JPEG. Hero a 640 px: 49,2 KB rispetto ai 247,7 KB originali; resa verificata a 390 e 1440 px.
- [x] **CR-11 — Precaricare il subset Latin-ext del font in romeno.** `BaseLayout.astro` precaricava solo `cormorant-garamond-latin.woff2`, mentre `global.css` assegna i caratteri romeni al file Latin-ext separato e i titoli RO usano ă/ș/ț. Aggiunto il preload Latin-ext soltanto alle pagine RO. Verificati tutti e sei gli HTML generati: una preload Latin-ext per ciascuna pagina RO e nessuna per EN; `npm run check` e `npm run build` senza errori, warning o hint; anteprima Chromium a 390×844 e 1440×1000 senza variazioni di layout né overflow visibile.
- [x] **CR-12 — Rimuovere configurazione contact form inutilizzata.** `src/config/site.ts` dichiarava `contactForm.endpoint` vuoto senza consumer né un form nel repository. Rimosso il blocco e verificata l’assenza di riferimenti nel codice applicativo; `npm run check`, `npm run build` e `git diff --check` passano.
- [x] **CR-13 — Spostare il focus al contenuto con il link di salto.** `HomePage.astro`, `MenuPage.astro` e `DishDetail.astro` puntavano a `main#main-content` non focalizzabili; la prova Chromium iniziale lasciava il focus su `BODY`. Aggiunto `tabindex="-1"` ai tre `<main>`: il focus arriva al target e resta fuori dall’ordine sequenziale di Tab. Verificati tutti i sei HTML RO/EN in Chromium (`activeElement=MAIN`, `tabIndex=-1`), anteprima 390×844 e 1440×1000 senza variazioni visive, `npm run check`, `npm run build` e `git diff --check` senza errori.
- [x] **CR-14 — Rimuovere il token CSS `--radius` non utilizzato.** In `src/styles/global.css` l’unica occorrenza era la dichiarazione `--radius: 0;`; il repository non contiene consumer `var(--radius)`. Rimossa la dichiarazione; `rg -n -- '--radius|var\(--radius' src` non trova riferimenti residui. `npm run check`, `npm run build` e `git diff --check` passano; nessun cambiamento visuale.
- [x] **CR-15 — Precaricare DM Sans usato nei testi visibili.** La preview Chromium della home RO richiedeva i subset `dm-sans-latin.woff2` e `dm-sans-latin-ext.woff2` via CSS a 262 e 272 ms, mentre Cormorant era già precaricato; anche la UI EN usa Latin-ext nel selettore “Română”. Aggiunti entrambi i preload in `BaseLayout.astro` per tutte le lingue. Verificati entrambi i link preload nei sei HTML generati; Chromium conferma initiator `link` e font caricato su RO/EN; anteprima 390×844 e 1440×1000 senza overflow o variazioni visive. `npm run check`, `npm run build` e `git diff --check` passano.
- [x] **CR-16 — Centralizzare i candidati delle immagini responsive.** In `HomePage.astro`, `MenuPage.astro` e `DishDetail.astro` erano duplicate `webpSrcset` e `imageSizes`; estratte in `src/utils/responsiveImages.ts`. `npm run check` passa (23 file, 0 errori, 0 warning e 0 hint), `ASTRO_TELEMETRY_DISABLED=1 npm run build` genera sei pagine e l’assert HTML conferma `sizes` atteso e candidati WebP ordinati nelle sei rotte. Preview Paseo locale verificata con `snapshot` e `inspect` a 390×844 e 1440×1000; scroll carica le immagini lazy, nessun overflow. Acquisiti e controllati 12 screenshot full-page (mobile e desktop per home, menu e scheda piatto in RO/EN). `git diff --check` superato dopo l’aggiornamento.

## Regole per il coordinamento

- Procedere con un elemento per ciclo, scegliendo il più prioritario che non sia bloccato.
- Verificare prima che il problema sia ancora presente; eseguire controlli e build pertinenti dopo ogni modifica.
- Fermarsi e chiedere a Marius quando servono dati commerciali, scelte di prodotto/design non ovvie, permessi, costi o servizi esterni.
- Nessun contatto al ristorante, acquisto o deploy automatico. Commit e push sono consentiti solo per modifiche non ambigue, approvate e verificate: staging selettivo, test passati, push su `origin main` e verifica del commit remoto; mai force-push. Fermarsi e chiedere a Marius in caso di blocchi o scelte non ovvie.
