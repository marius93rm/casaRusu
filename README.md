# Restaurant Casa Rusu · Codlea

Sito Astro indipendente per Restaurant Casa Rusu. Testi, contatti, colori e collegamenti sono in `src/data/site.ts`; logo, fotografie e font sono locali in `public/brand/`, `public/images/` e `public/fonts/`. I font DM Sans e Cormorant Garamond sono ospitati localmente; le licenze sono in `public/fonts/OFL.txt` e `public/fonts/Cormorant-Garamond-OFL.txt`.

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

```bash
npm install
npm run dev
```

Per verificare o creare la versione statica:

```bash
npm run check
npm run build
```

## Menu completo

Le pagine `/meniu/` e `/en/meniu/` includono il menu originale in 14 immagini, con galleria sfogliabile, indice, ingrandimento e trascrizione delle 200 voci. Interfaccia e categorie sono RO/EN; il menu originale rimane in romeno in entrambe le lingue. La home contiene un pulsante e un'anteprima dedicati. Le schede speciali dei piatti restano disponibili.

Catalogo e trascrizione sono in `src/data/menu.ts`; gli originali e le varianti responsive sono in `public/images/menu/`. La build esegue anche `npm run check:menu`. Provenienza, comportamento e verifiche sono descritti in [docs/menu.md](docs/menu.md).

Indirizzo, CAP, telefono e orari sono stati verificati sulla [pagina Facebook ufficiale](https://www.facebook.com/people/Restaurant-Casa-Rusu/61594316175166/) il 30 settembre 2026; il monogramma è coerente anche con il [profilo Instagram](https://www.instagram.com/restaurant.casarusu/). Gli orari pubblicati sono lunedì–venerdì 11:00–22:30 e sabato–domenica 11:00–23:00. Prima della pubblicazione definitiva, verificare che il ristorante approvi i materiali e i testi.

Per abilitare canonical assoluti, hreflang, immagini Open Graph assolute e sitemap, impostare la variabile `SITE_URL` nell'ambiente di build con l'origine pubblica HTTPS (per esempio `SITE_URL=https://www.example.com npm run build`). Astro usa lo stesso valore per canonical e sitemap e il controllo SEO lo verifica. Lasciarla vuota finché il dominio di produzione non è confermato: in tal caso gli URL assoluti e la sitemap non vengono generati.

## Verifica del redesign

`npm run build` esegue il controllo Astro, genera le sei rotte (home, menu e scheda del piatto in RO/EN) e avvia `check:seo` e `check:menu`. Per la verifica manuale, controllare le tre tipologie di pagina in Paseo a 320, 390, 768, 1024 e 1440 px: nessuno scorrimento orizzontale, immagini e font locali caricati, CTA visibile e ancore valide. Verificare il menu mobile in apertura/chiusura con Escape e il ritorno del focus al pulsante. Le regole del tema scuro sono state applicate temporaneamente nel browser per controllare resa e contrasto.
