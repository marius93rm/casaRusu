import type { SiteLocale } from './site';

// Captions describe the supplied photos, without adding menu or event promises.
export const galleryPhotos = [
  'casa-rusu-platou-branzeturi',
  'casa-rusu-servire-platouri',
  'casa-rusu-servire-bere',
  'casa-rusu-atmosfera-sala',
].map((name) => `/images/${name}.jpg`);

interface GalleryCopy {
  title: string;
  intro: string;
  previous: string;
  next: string;
  enlarge: string;
  close: string;
  keyboard: string;
  captions: [string, string, string, string];
  alts: [string, string, string, string];
}

export const galleryCopy: Record<SiteLocale, GalleryCopy> = {
  ro: {
    title: 'Momente la Casa Rusu',
    intro: 'Din sală până la masă, câteva imagini din restaurantul nostru.',
    previous: 'Fotografiile anterioare', next: 'Fotografiile următoare',
    enlarge: 'Mărește fotografia', close: 'Închide fotografia',
    keyboard: 'Glisează sau folosește săgețile pentru a vedea fotografiile.',
    captions: ['Un platou de împărțit', 'Din bucătărie, la masă', 'Un pahar, în companie bună', 'Atmosfera din sală'],
    alts: [
      'Platou cu brânzeturi, măsline, nuci și fructe, pe o masă la Casa Rusu.',
      'Două platouri cu brânzeturi și fructe, aduse la masă în restaurant.',
      'O bere este turnată într-un pahar la masa unui oaspete.',
      'Oaspeți la mesele din sala Casa Rusu, cu artiști cântând în fundal.',
    ],
  },
  en: {
    title: 'Moments at Casa Rusu',
    intro: 'From the dining room to the table, a glimpse of our restaurant.',
    previous: 'Previous photographs', next: 'Next photographs',
    enlarge: 'Enlarge photo', close: 'Close photo',
    keyboard: 'Swipe or use the arrow keys to explore the photographs.',
    captions: ['A platter to share', 'From our kitchen to your table', 'A drink in good company', 'Around the dining room'],
    alts: [
      'A cheese platter with olives, walnuts and fruit on a table at Casa Rusu.',
      'Two cheese and fruit platters being brought to a restaurant table.',
      'Beer being poured into a glass at a guest’s table.',
      'Guests at tables in Casa Rusu’s dining room, with performers singing in the background.',
    ],
  },
  it: {
    title: 'Momenti a Casa Rusu',
    intro: 'Dalla sala alla tavola, qualche scorcio del nostro ristorante.',
    previous: 'Fotografie precedenti', next: 'Fotografie successive',
    enlarge: 'Ingrandisci la foto', close: 'Chiudi la foto',
    keyboard: 'Scorri o usa i tasti freccia per esplorare le fotografie.',
    captions: ['Un tagliere da condividere', 'Dalla cucina alla tavola', 'Un bicchiere in buona compagnia', 'L’atmosfera in sala'],
    alts: [
      'Tagliere di formaggi con olive, noci e frutta su un tavolo di Casa Rusu.',
      'Due piatti di formaggi e frutta portati a un tavolo del ristorante.',
      'Birra versata in un bicchiere al tavolo di un ospite.',
      'Ospiti ai tavoli della sala di Casa Rusu, con artisti che cantano sullo sfondo.',
    ],
  },
  es: {
    title: 'Momentos en Casa Rusu',
    intro: 'Del comedor a la mesa, algunas imágenes de nuestro restaurante.',
    previous: 'Fotografías anteriores', next: 'Fotografías siguientes',
    enlarge: 'Ampliar foto', close: 'Cerrar foto',
    keyboard: 'Desliza o usa las flechas del teclado para explorar las fotografías.',
    captions: ['Una tabla para compartir', 'De la cocina a la mesa', 'Una copa en buena compañía', 'El ambiente del comedor'],
    alts: [
      'Tabla de quesos con aceitunas, nueces y fruta en una mesa de Casa Rusu.',
      'Dos platos de quesos y fruta llevados a una mesa del restaurante.',
      'Cerveza servida en un vaso en la mesa de un comensal.',
      'Comensales en el comedor de Casa Rusu, con artistas cantando al fondo.',
    ],
  },
  fr: {
    title: 'Instants à Casa Rusu',
    intro: 'De la salle à la table, quelques images de notre restaurant.',
    previous: 'Photographies précédentes', next: 'Photographies suivantes',
    enlarge: 'Agrandir la photo', close: 'Fermer la photo',
    keyboard: 'Balayez ou utilisez les touches fléchées pour parcourir les photographies.',
    captions: ['Un plateau à partager', 'De la cuisine à la table', 'Un verre en bonne compagnie', 'L’ambiance de la salle'],
    alts: [
      'Plateau de fromages avec olives, noix et fruits sur une table de Casa Rusu.',
      'Deux assiettes de fromages et de fruits apportées à une table du restaurant.',
      'Bière versée dans un verre à la table d’un convive.',
      'Convives dans la salle de Casa Rusu, avec des artistes chantant en arrière-plan.',
    ],
  },
  de: {
    title: 'Momente bei Casa Rusu',
    intro: 'Vom Gastraum bis zum gedeckten Tisch: Einblicke in unser Restaurant.',
    previous: 'Vorherige Fotografien', next: 'Nächste Fotografien',
    enlarge: 'Foto vergrößern', close: 'Foto schließen',
    keyboard: 'Wischen oder die Pfeiltasten nutzen, um die Fotografien anzusehen.',
    captions: ['Eine Platte zum Teilen', 'Aus der Küche an den Tisch', 'Ein Glas in guter Gesellschaft', 'Die Atmosphäre im Gastraum'],
    alts: [
      'Käseplatte mit Oliven, Walnüssen und Obst auf einem Tisch bei Casa Rusu.',
      'Zwei Käse- und Obstplatten werden an einen Tisch im Restaurant gebracht.',
      'Bier wird am Tisch eines Gastes in ein Glas eingeschenkt.',
      'Gäste an Tischen im Gastraum von Casa Rusu, mit singenden Künstlern im Hintergrund.',
    ],
  },
};
