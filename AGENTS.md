# Istruzioni per gli agenti

## Branch, preview e pubblicazione

Regola di Marius del 24/10/2026, valida fino a sua nuova autorizzazione esplicita:

- URL provvisorio del sito: https://casarusu.netlify.app/.
- Sono autorizzati branch di lavoro, commit piccoli e verificati e push dei soli branch per aggiornare le preview Netlify.
- Prima di modificare o fare commit, controllare il branch corrente. Se è `main`, creare o passare a un branch di lavoro.
- Non fare commit o push diretti su `main`, merge su `main` o abilitare auto-merge. Il merge su `main` lo decide esclusivamente Marius, per evitare consumo inutile di crediti Netlify.
- Si possono aprire o aggiornare PR per le preview, lasciandole senza merge. Non avviare deploy manuali di produzione.
- Questa regola vale anche per heartbeat e automazioni e revoca ogni precedente autorizzazione al push su `origin main`.
- L'URL Netlify è provvisorio: non considerarlo una conferma del dominio definitivo per `SITE_URL`, SEO di produzione o Search Console.

Per il lavoro incrementale, leggere `docs/TODO.md` e preservare le modifiche altrui.
