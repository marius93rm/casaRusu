# Restaurant Casa Rusu · Codlea

Sito Astro indipendente per Restaurant Casa Rusu. Contatti, colori e collegamenti sono in `src/data/site.ts`; i testi sono nei dizionari `src/i18n/locales/`; logo, fotografie e font sono locali in `public/brand/`, `public/images/` e `public/fonts/`. I font DM Sans e Cormorant Garamond sono ospitati localmente; le licenze sono in `public/fonts/OFL.txt` e `public/fonts/Cormorant-Garamond-OFL.txt`.

## Anteprima

Redesign editoriale con titoli Cormorant Garamond, palette avorio e bronzo derivata dal logo, fotografie reali e prenotazione telefonica nella navigazione. Layout responsive, tema scuro secondo le preferenze di sistema e rispetto di `prefers-reduced-motion`.

Homepage catturata in locale nelle versioni desktop e mobile, presentata in mockup MacBook e iPhone.

<p align="center">
  <img src="docs/mockups/casa-rusu-macbook.svg" alt="Homepage Restaurant Casa Rusu in un mockup MacBook" width="920">
</p>

<p align="center">
  <img src="docs/mockups/casa-rusu-iphone.svg" alt="Homepage Restaurant Casa Rusu in un mockup iPhone" width="300">
</p>

## Avvio

Testi ingranditi, collegamento TikTok e animazioni rispettose di `prefers-reduced-motion` sono descritti in [Qualità e accessibilità](docs/quality.md), insieme ai report Lighthouse desktop/mobile sulle sei pagine (mediana di tre prove) e ai controlli al 200%.

```bash
npm install
npm run dev
```

Per verificare o creare la versione statica:

```bash
npm run check
npm run build
```

## Lingue

Il sito è disponibile in romeno (predefinito), inglese, italiano, spagnolo, francese e tedesco. Al primo accesso il sito rileva automaticamente la lingua del browser; la scelta manuale viene ricordata nelle visite successive. Gli URL con lingua esplicita restano nella lingua indicata e le lingue non supportate usano il romeno. I prefissi sono `/en/`, `/it/`, `/es/`, `/fr/` e `/de/`; il selettore nell’header e nel footer mantiene la pagina e, con JavaScript, query e ancora correnti. Home, menu, scheda del piatto, contatti, orari e metadati sono tradotti. Le 200 voci del menu conservano prezzi e quantità originali in lei romeni.

Struttura, manutenzione e verifiche sono in [Multilingua](docs/i18n/README.md).

## Menu completo

Le pagine menu in RO/EN/IT/ES/FR/DE includono il menu originale in 14 immagini, con galleria sfogliabile, indice, ingrandimento e trascrizione delle 200 voci. Interfaccia, categorie, piatti e ingredienti sono localizzati; le scansioni conservano il menu originale romeno e prezzi e quantità provengono dalla stessa fonte. La home contiene un pulsante e un'anteprima dedicati. Le schede speciali dei piatti restano disponibili.

Catalogo e trascrizione sono in `src/data/menu.ts`; gli originali e le varianti responsive sono in `public/images/menu/`. La build esegue anche `npm run check:menu`. Provenienza, comportamento e verifiche sono descritti in [docs/menu.md](docs/menu.md).

Indirizzo, CAP, telefono e orari sono stati verificati sulla [pagina Facebook ufficiale](https://www.facebook.com/people/Restaurant-Casa-Rusu/61594316175166/) il 30 settembre 2026; il monogramma è coerente anche con il [profilo Instagram](https://www.instagram.com/restaurant.casarusu/). Gli orari pubblicati sono lunedì–venerdì 11:00–22:30 e sabato–domenica 11:00–23:00. Prima della pubblicazione definitiva, verificare che il ristorante approvi i materiali e i testi.

Per abilitare canonical assoluti, hreflang, immagini Open Graph assolute e sitemap, impostare la variabile `SITE_URL` nell'ambiente di build con l'origine pubblica HTTPS (per esempio `SITE_URL=https://www.example.com npm run build`). Astro usa lo stesso valore per canonical e sitemap e il controllo SEO lo verifica. Senza `SITE_URL` la build resta in modalità locale e aggiunge `noindex,nofollow`; così un'eventuale preview accessibile ai crawler non entra nei risultati di ricerca. Configurare la variabile solo quando l'origine di produzione è confermata.

## Verifica del redesign

`npm run build` esegue il controllo Astro, genera le 18 rotte (home, menu e scheda del piatto in RO/EN/IT/ES/FR/DE) e avvia `check:seo`, `check:menu`, `check:hours` e `check:i18n`. Per la verifica manuale, controllare le tre tipologie di pagina in Paseo a 320, 390, 768, 1024 e 1440 px: nessuno scorrimento orizzontale, immagini e font locali caricati, CTA visibile e ancore valide. Verificare il menu mobile in apertura/chiusura con Escape e il ritorno del focus al pulsante. Le regole del tema scuro sono state applicate temporaneamente nel browser per controllare resa e contrasto.
