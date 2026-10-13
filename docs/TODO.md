# Casa Rusu — backlog incrementale

**Fonte:** prima analisi locale fornita da Marius. I rilievi sono la baseline; prima di ogni modifica l’agente deve ricontrollare codice e anteprima, perché stato e misure possono cambiare.

## Priorità alta

- [ ] **CR-01 — Menu consultabile con prezzi.** Aggiungere menu, prezzi e informazioni alimentari verificate. **Blocco:** servono dati aggiornati e approvazione del ristorante; non inventare prezzi, allergeni o disponibilità.
- [ ] **CR-02 — Alternativa alla prenotazione telefonica.** Valutare un canale scritto o un sistema gestito dal ristorante. **Blocco:** scelta operativa da concordare; chiedere prima di contatti esterni, account, costi o attivazioni.
- [ ] **CR-03 — Configurazione SEO di produzione.** Impostare `seo.siteUrl` in `src/config/site.ts` per canonical, hreflang, sitemap e anteprime social. **Blocco:** attendere dominio HTTPS e hosting confermati; non inserire origini ipotetiche.

## Priorità media

- [x] **CR-04 — Leggibilità dei testi funzionali su mobile.** CTA, link e orari portati a 14,4 px sotto 760 px; verificati a 320 e 390 px senza overflow e a 1440 px per la resa desktop.
- [ ] **CR-05 — Descrivere meglio l’offerta.** Precisare cucina, fascia di prezzo e specialità soltanto con informazioni confermate dal ristorante.
- [x] **CR-06 — Prenotazione accessibile durante lo scroll mobile.** Aggiunta una CTA telefonica fissa in basso sotto 760 px, con numero e testo già configurati e spazio per l’area sicura; verificata in Chromium a 390×844, dopo lo scroll e a 1440×1000 (nascosta su desktop).
- [ ] **CR-07 — CTA della sezione cucina.** Preferire menu o prenotazione al collegamento esterno a Facebook. **Dipendenze:** CR-01 e CR-02.
- [ ] **CR-08 — Elementi di fiducia.** Valutare recensioni verificabili, informazioni sulla gestione e più piatti; usare solo contenuti autentici e approvati.

## Priorità bassa

- [x] **CR-09 — Varianti responsive delle immagini.** Aggiunte varianti WebP da 640 a 1920 px (fino a 1439 px per l’esterno), `srcset` e fallback JPEG. Hero a 640 px: 49,2 KB rispetto ai 247,7 KB originali; resa verificata a 390 e 1440 px.

## Regole per il coordinamento

- Procedere con un elemento per ciclo, scegliendo il più prioritario che non sia bloccato.
- Verificare prima che il problema sia ancora presente; eseguire controlli e build pertinenti dopo ogni modifica.
- Fermarsi e chiedere a Marius quando servono dati commerciali, scelte di prodotto/design non ovvie, permessi, costi o servizi esterni.
- Nessun contatto al ristorante, acquisto o deploy automatico. Commit e push sono consentiti solo per modifiche non ambigue, approvate e verificate: staging selettivo, test passati, push su `origin main` e verifica del commit remoto; mai force-push. Fermarsi e chiedere a Marius in caso di blocchi o scelte non ovvie.
