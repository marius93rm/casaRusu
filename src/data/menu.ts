import type { SiteLocale } from './site';

export interface MenuItem {
  name: string;
  quantity: string;
  price: number;
  ingredients: string;
}
export interface MenuSection {
  title: Record<SiteLocale, string>;
  items: MenuItem[];
}
export interface MenuPage {
  id: string;
  source: string;
  title: Record<SiteLocale, string>;
  image: string;
  width: number;
  height: number;
  sections: MenuSection[];
}

type PrintedItem = [name: string, quantity: string, price: number, ingredients?: string];
const section = (ro: string, en: string, rows: PrintedItem[]): MenuSection => ({
  title: { ro, en },
  items: rows.map(([name, quantity, price, ingredients = '']) => ({ name, quantity, price, ingredients })),
});
const page = (id: string, source: string, ro: string, en: string, sections: MenuSection[]): MenuPage => ({
  id, source, title: { ro, en }, image: `/images/menu/${id}.jpg`, width: 1448, height: 2048, sections,
});

// Source: the 14 menu images supplied by Marius on 21 October 2026.
// Quantities, prices and ingredient wording follow the print, including unusual
// values (e.g. Limonadă 50ml). Do not infer allergens or silently amend the menu.
export const menuPages: MenuPage[] = [
  page('coperta', '841736056_122116419915477205_3563951299998591493_n.jpg', 'Copertă', 'Cover', []),
  page('aperitive', '840070261_122116420005477205_8321052538100203152_n.jpg', 'Aperitive & gustări calde', 'Starters & warm bites', [
    section('Aperitive', 'Starters', [
      ['Platou Brânzeturi', '250g', 65, 'parmezan, brie, gorgonzola, maasdamer, nuci, stafide, fructe'],
      ['Platou Italienesc', '500g', 135, 'potrivit pentru 2 persoane; mozzarella, prosciutto crudo, salam picant, roșii seci, mortadella, măsline, ciuperci murate, pecorino, anghinare, maasdamer'],
      ['Platou Tradițional', '600g', 100, 'potrivit pentru 2 persoane; slănină, jumări, salam, mușchi, burduf, telemea, caș, legume'],
      ['Bruschete cu roșii și mozzarella', '250g', 28, 'pâine prăjită, unt, roșii, mozzarella, oregano, usturoi, măsline, ulei de măsline, sare'],
      ['Bruschete cu somon fume', '250g', 35, 'pâine prăjită, cremă de brânză, somon fume, rucola, lămâie'],
      ['Bruschete cu prosciutto', '300g', 35, 'pâine prăjită, unt, roșii, prosciutto, parmezan, usturoi, oregano, ulei de măsline, sare'],
    ]),
    section('Gustări calde', 'Warm bites', [
      ['Bulz ciobănesc', '600g', 60, 'mămăligă, burduf, bacon, mozzarella, ou prăjit'],
      ['Mămăligă cu brânză și smântână', '450g', 37, 'mămăligă, brânză de vaci, smântână, fulgi de telemea'],
      ['Pinsa Clasică', '460g', 58, 'pinsa, sos de roșii, mozzarella, busuioc'],
      ['Pinsa Bolognese', '580g', 57, 'pinsa, sos de roșii, mortadella, mozzarella'],
      ['Pinsa Romano', '600g', 58, 'pinsa, sos de roșii, mozzarella, prosciutto crudo, rucola, parmezan, roșii cherry'],
      ['Pinsa Siciliană', '600g', 57, 'pinsa, sos de roșii, mozzarella, anghinare, roșii, ciuperci cu ulei'],
    ]),
  ]),
  page('salate-ciorbe', '840052051_122116420047477205_179598348653770432_n.jpg', 'Salate & ciorbe', 'Salads & soups', [
    section('Salate', 'Salads', [
      ['Salată „Casa Rusu”', '420g', 69, 'piept de rață afumat, rucola, mixt salată, roșii cherry, caju, parmezan, rodie, dressing, tortilla'],
      ['Salată cu Pui', '480g', 40, 'piept de pui, salată verde, roșii, ardei gras, porumb, dressing, focaccia'],
      ['Salată Grecească', '550g', 40, 'telemea, salată verde, roșii, ardei gras, castraveți, ceapă roșie, măsline, focaccia'],
      ['Salată Beefsteak', '370g', 55, 'bavetă, rucola, mixt salată, roșii cherry, parmezan, rozmarin, lămâie, ulei măsline'],
      ['Salată cu rucola și parmezan', '250g', 35, 'salată verde, rucola, roșii cherry, parmezan'],
      ['Salată cu Ton', '530g', 45, 'ton, salată verde, roșii, ceapă roșie, măsline, porumb, mozzarella, lămâie, focaccia'],
    ]),
    section('Ciorbe', 'Soups', [
      ['Ciorbă de burtă', '400g', 30, 'burtă, oase de vită, morcovi, țelină, rădăcină pătrunjel, usturoi, smântână, gălbenuș de ou, oțet, sare'],
      ['Ciorbă de pui cu tăieței', '400g', 27, 'pui, morcovi, țelină, rădăcină pătrunjel, ardei gras, roșii, sos de roșii, borș, tăieței, sare'],
      ['Supă cremă de legume', '450g', 25, 'ceapă, morcovi, țelină, rădăcină pătrunjel, dovlecel, cartofi, ciuperci, smântână dulce, crutoane'],
      ['Ciorbă de văcuță', '400g', 28, 'carne de vită, ceapă, morcovi, țelină, pătrunjel, cartofi, mazăre, fasole verde, roșii, ardei gras, leuștean, borș, suc de roșii, ulei, sare'],
      ['Ciorbă de legume', '400g', 25, 'ceapă, morcovi, țelină, pătrunjel, cartofi, mazăre, fasole verde, roșii, ardei gras, leuștean, borș, suc de roșii, ulei, sare'],
    ]),
  ]),
  page('paste-peste', '840101984_122116420095477205_2404201587708543508_n.jpg', 'Paste & pește', 'Pasta & fish', [
    section('Paste', 'Pasta', [
      ['Carbonara', '400g', 45, 'spaghete, pancetta, ou, parmezan, smântână, guanciale, sare, piper, ulei'],
      ['Quatro Formaggi', '400g', 49, 'pene, unt, lapte, gorgonzola, brie, sare, parmezan, massdamer, smântână, piper'],
      ['Tagliatelle Beefsteak', '500g', 58, 'tagliatelle, bavetă, sos de roșii, parmezan, busuioc, usturoi, pătrunjel, ceapă, ulei, sare, piper'],
      ['Tagliatelle Porcini', '450g', 58, 'tagliatelle, ciuperci, hribi, smântână, parmezan, sare, piper'],
      ['Tagliatelle cu Ton', '450g', 39, 'tagliatelle, ton, sos de roșii, ceapă, usturoi, pătrunjel, parmezan, sare, piper'],
      ['Pene cu Somon', '470g', 48, 'pene, somon, smântână, ceapă, roșii, usturoi, parmezan, pătrunjel, sare, piper'],
      ['Gnocchi cu roșii și parmezan', '350g', 33, 'gnocchi, sos de roșii, parmezan, unt, busuioc, sare, piper'],
      ['Gnocchi cu creveți în sos de unt și roșii cherry', '400g', 68, 'creveți, usturoi, gnocchi, unt, lămâie, pătrunjel verde, roșii cherry, vin alb'],
    ]),
    section('Pește', 'Fish', [
      ['File de biban la grătar', '200g', 58, 'file de biban, usturoi, sare, piper'],
      ['File de biban în fulgi de porumb cu cartofi natur', '500g', 68, 'biban, sare, usturoi, făină, piper, fulgi, porumb, ou, cartofi, unt, pătrunjel'],
      ['Crap prăjit cu mămăligă și usturoi', '350g', 55, 'file de crap, mălai, făină, usturoi, ulei, sare, piper'],
      ['Somon la grătar', '200g', 55, 'somon, usturoi, ulei, sare, piper'],
      ['Fish and Chips', '300g', 68, 'șalău, bere, făină, usturoi, ulei, sare, piper, cartofi prăjiți, sos de smântână cu capere, lămâie'],
      ['Platou cu fructe de mare', '850g', 165, 'creveți, calamar, midii, vongole, creveți Tiger, sare, unt, usturoi, piper, lămâie, pătrunjel, vin alb'],
    ]),
  ]),
  page('pui-rata-oaie', '842754129_122116420137477205_7453683927768024426_n.jpg', 'Pui, rață & oaie', 'Chicken, duck & lamb', [
    section('Pui / Rață', 'Chicken / Duck', [
      ['Piept de pui cu sos gorgonzola', '350g', 39, 'piept de pui, smântână, gorgonzola, unt, sare, piper'],
      ['Piept de pui la grătar', '200g', 36, 'piept de pui, sare, piper'],
      ['Șnițel din piept de pui', '150g', 36, 'piept de pui, ou, panko, pesmet, făină, sare, piper'],
      ['Șnițel mexican', '450g', 40, 'piept de pui, ardei gras, sos de roșii, ceapă, roșii, ardei iute, pătrunjel, ou, pesmet, făină, panko, sare, piper'],
      ['Pui cu smântână și ciuperci', '300g', 47, 'piept de pui, smântână, ciuperci, pătrunjel, ceapă, sare, piper'],
      ['Pui țărănesc cu cartofi aurii și mujdei de usturoi', '700g', 59, 'jumătate de pui, cartofi, usturoi, sare, piper, boia, cartofi'],
      ['Piept de rață cu piure de țelină', '400g', 78, 'piept de rață, țelină, baby morcovi, unt, sare, piper, sos de vișine'],
      ['Confit din pulpă de rață cu piure de cartofi și sos de portocale', '450g', 65, 'pulpă de rață, cartofi, unt, lapte, baby morcovi, sparanghel, sos de portocale'],
      ['Cocoșel de munte cu cartofi cu usturoi și rozmarin', '600g', 82, 'cocoșel, cartofi, rozmarin, usturoi, sare, piper'],
    ]),
    section('Oaie', 'Lamb / Mutton', [
      ['Cotlet de berbecuț cu cartofi la cuptor cu mozzarella și mujdei de usturoi', '350g', 89, 'cotlet, cartofi, mozzarella, usturoi, ulei, sare, piper'],
      ['Pastramă de oaie cu mămăligă și murături', '470g', 66, 'pastramă de oaie, mămăligă, murături, usturoi, ulei, sare, piper'],
    ]),
  ]),
  page('porc', '840332896_122116420221477205_8225014938080091343_n.jpg', 'Porc', 'Pork', [
    section('Porc', 'Pork', [
      ['Ceafă de porc la grătar', '250g', 36, 'ceafă de porc, sare, piper, praf de usturoi'],
      ['Șnițel Domnesc cu cartofi cu usturoi și parmezan', '600g', 75, 'ceafă de porc, ou, pesmet, făină, panko, sos de roșii, mozzarella, oregano, sare, piper, cartofi, usturoi, parmezan, pătrunjel'],
      ['Platou Boieresc „Casa Rusu”', '2400g', 340, 'potrivit pentru 4 persoane; cotlet de porc, 4 mici, cârnați, bavetă, piept de pui, murături, cartofi cu parmezan și usturoi, muștar, hrean'],
      ['Mușchiuleț de porc cu sos de hribi', '350g', 54, 'mușchiuleț de porc, ciuperci, hribi, smântână, sos brun, praf de usturoi, sare, piper'],
      ['Cotlet de porc cu os la grătar', '250g', 45, 'cotlet de porc, sare, piper, praf de usturoi'],
      ['Șnițel din cotlet de porc cu os', '300g', 54, 'cotlet de porc, ou, pesmet, panko, făină, sare, piper'],
      ['Aripioare de porc cu cartofi chips', '450g', 58, 'aripioare de porc, ulei, sare, piper, cartofi, murături'],
      ['Ciolan de porc cu varză călită', '700g', 65, 'ciolan de porc, varză, roșii, ardei, ceapă, morcovi, boia, sare, piper'],
      ['Platou mixt', '600g', 100, '2 mici, ceafă de porc, pastramă de oaie, piept de pui, cartofi la cuptor cu mozzarella, murături, muștar'],
    ]),
  ]),
  page('vita', '839932811_122116420341477205_5423019095272696451_n.jpg', 'Vită', 'Beef', [
    section('Vită', 'Beef', [
      ['Bavetă la grătar', '250g', 69, 'bavetă, sare, piper, praf de usturoi'],
      ['Antricot de vită la grătar', '250g', 89, 'antricot de vită, sare, piper, praf de usturoi'],
      ['Mușchi de vită', '200g', 109, 'mușchi de vită, sare, piper, praf de usturoi'],
      ['Gulaș de Vită', '400g', 48, 'carne de vită, cartofi, ardei gras, morcovi, țelină, roșii, pastă gulaș, chimen, pătrunjel, suc de roșii, ceapă, sare, piper'],
      ['Burger de Vită cu cartofi cu usturoi și parmezan', '450g', 50, 'chiflă, carne de vită, salată verde, ceapă, sos remoulade, dulceață de ceapă, bacon, roșie, castraveți murați, cartofi, usturoi, parmezan, sos la alegere'],
      ['Cheeseburger de Vită cu cartofi prăjiți cu usturoi și parmezan', '450g', 55, 'chiflă, carne de vită, salată verde, sos remoulade, dulceață de ceapă, castraveți murați, ceapă, roșie, cașcaval, cheddar, cartofi, parmezan, usturoi, sos la alegere'],
      ['Hot Cheeseburger cu cartofi prăjiți cu usturoi și parmezan', '450g', 55, 'chiflă, carne de vită, salată verde, sos remoulade, dulceață de ceapă, castraveți murați, ceapă, roșie, cașcaval, sos cheddar, jalapeno, cartofi, parmezan, usturoi, sos la alegere'],
      ['Vițel la ceaun cu mămăligă și murături', '400g', 69, 'vițel, ardei gras, ceapă, praz, sare, piper, usturoi, mălai'],
      ['Șnițel Vienez', '180g', 54, 'bavetă, sare, piper, ou, pesmet, făină, panko'],
    ]),
  ]),
  page('garnituri', '843264698_122116420443477205_5458645100644552014_n.jpg', 'Garnituri & salate', 'Sides & side salads', [
    section('Garnituri', 'Sides', [
      ['Cartofi aurii cu mozzarella', '250g', 18, 'cartofi, mozzarella, sare, piper'],
      ['Cartofi prăjiți cu usturoi, parmezan și pătrunjel', '200g', 19, 'cartofi, parmezan, usturoi, pătrunjel, sare'],
      ['Cartofi prăjiți', '250g', 15, 'cartofi, sare'],
      ['Cartofi gratinați', '200g', 21, 'cartofi, smântână, cașcaval'],
      ['Cartofi natur', '200g', 16, 'cartofi, unt, pătrunjel, sare'],
      ['Piure de cartofi', '200g', 16, 'cartofi, unt, lapte, sare'],
      ['Cartofi rustici', '200g', 18, 'cartofi, ceapă, bacon, ardei gras, usturoi, pătrunjel, sare'],
      ['Orez cu legume', '200g', 20, 'orez, morcovi, mazăre, ceapă, ardei, pătrunjel, unt, parmezan, sare, piper'],
      ['Legume la grătar', '250g', 22, 'zucchini, ciuperci, ceapă, roșie, ardei gras, sare'],
      ['Legume tempura', '200g', 22, 'dovlecei, ardei gras, morcovi, făină, ulei, sare, piper'],
    ]),
    section('Salate de însoțire', 'Side salads', [
      ['Salată de varză', '150g', 13, 'varză, sare, ulei, oțet'],
      ['Salată asortată', '200g', 16, 'mixt salată, roșii, castraveți, ardei, ulei, sare, oțet'],
      ['Salată de roșii', '200g', 15, 'roșii, ulei, sare, oțet'],
      ['Salată de murături', '250g', 16, 'castraveți murați, gogoșari, gogonele, varză murată'],
      ['Salată de sfeclă roșie cu hrean', '200g', 16, 'sfeclă roșie, hrean, oțet, sare, ulei'],
      ['Salată de ardei copți', '250g', 19, 'ardei copți, ulei, oțet, sare'],
    ]),
  ]),
  page('extra-deserturi', '841064041_122116420569477205_4576185638088883934_n.jpg', 'Sosuri & deserturi', 'Sauces & desserts', [
    section('Extra', 'Sauces & extras', [
      ['Sos de smântână cu usturoi', '50g', 8, 'smântână, usturoi, sare, piper'],
      ['Sos „Casa Rusu”', '50g', 8, 'maioneză, smântână, sos chili, eros pista'],
      ['Ketchup', '50g', 5], ['Sos Barbeque', '50g', 5], ['Sos Maioneză', '50g', 5], ['Sos Remoulade', '50g', 5],
      ['Sos Chili Dulce', '50g', 5],
      ['Mujdei de usturoi', '50g', 8, 'usturoi, sare, ulei'],
      ['Sos gorgonzola', '100g', 10, 'gorgonzola, smântână dulce, sare, coniac, unt'],
      ['Muștar', '50g', 5], ['Pâine', '50g', 5], ['Smântână', '50g', 5], ['Ardei iute', '30g', 2],
    ]),
    section('Deserturi', 'Desserts', [
      ['Papanași', '200g', 30, 'brânză de vaci, ouă, făină, bicarbonat, esență vanilie, coajă lămâie, zahăr, smântână, dulceață'],
      ['Clătite cu dulceață', '200g', 22, 'ouă, făină, ulei, lapte, esențe, dulceață, zahăr, sare'],
      ['Clătite cu ciocolată', '200g', 22, 'ouă, făină, ulei, lapte, esențe, ciocolată, zahăr, sare'],
      ['Clătite brașovene', '250g', 27, 'ouă, făină, ulei, lapte, esențe, brânză de vaci, zahăr, stafide, sare'],
      ['Lava cake', '150g', 25, 'ouă, făină, cacao, zahăr, esențe, înghețată'],
      ['Crème brûlée cu sos caramel', '200g', 27, 'ouă, esențe, lapte, sare, smântână, zahăr, caramel'],
      ['Bomboline Dubai „Casa Rusu”', '350g', 38, 'ouă, brânză de vaci, făină, zahăr, esențe, bicarbonat, fistic măcinat, cremă fistic, smântână dulce, sare'],
      ['Bacio Caraibico', '120g', 35, 'biscuite cu migdale și vanilie, mousse ciocolată albă cu fructul pasiunii, glazură mango'],
      ['Corazza di Mandorle e Amarena', '120g', 35, 'cremă migdale, gelatină de vișine, mousse de ciocolată neagră, boabe de ciocolată'],
      ['Chicco', '120g', 36, 'ștrudel cu cafea și cacao, mousse ciocolată cu lapte, cafea, pandișpan'],
    ]),
  ]),
  page('cafea-racoritoare', '839932847_122116420599477205_72918414671492235_n.jpg', 'Cafea, ceai & răcoritoare', 'Coffee, tea & soft drinks', [
    section('Cafea / Ceai', 'Coffee / Tea', [
      ['Ristretto', '20ml', 12], ['Espresso', '30ml', 12], ['Espresso macchiato', '60ml', 13],
      ['Espresso dublu', '60ml', 18], ['Espresso lung', '90ml', 12], ['Cappuccino', '120ml', 16],
      ['Flat white', '150ml', 16], ['Latte macchiato', '250ml', 16], ['Ciocolată caldă', '250ml', 17],
      ['Frappé', '250ml', 25], ['Ceai diverse arome', '300ml', 12],
    ]),
    section('Răcoritoare', 'Soft drinks', [
      ['Apă minerală / plată', '750ml', 18], ['Apă minerală / plată', '330ml', 11],
      ['Coca Cola', '250ml', 12, 'normal / zero zahăr / zero cofeină'],
      ['Fanta', '250ml', 12, 'portocale / struguri'], ['Sprite', '250ml', 12],
      ['Schweppes', '250ml', 13, 'tonic / bitter lemon / mandarin / tonic de zmeură'],
      ['Fuze Tea', '250ml', 13, 'lămâie, piersici'],
      ['Cappy', '250ml', 13, 'portocale / portocale roșii / piersici / cireșe'], ['Burn', '250ml', 13],
      ['Limonadă', '50ml', 24], ['Limonadă cu aromă', '500ml', 25, 'zmeură / fructul pasiunii'],
      ['Fresh portocale', '200ml', 18], ['Fresh grapefruit', '200ml', 18], ['Fresh mixt', '200ml', 20],
    ]),
  ]),
  page('bere-distilate', '840332899_122116420659477205_8179267607178810943_n.jpg', 'Bere & distilate', 'Beer & spirits', [
    section('Bere', 'Beer', [
      ['Kozel Premium', '0.33', 16], ['Peroni', '0.33', 15], ['Peroni NA', '0.33', 16], ['Ursus Black', '0.33', 18],
      ['Ursus Cooler NA', '0.33', 15, 'lămâie, grapefruit, zmeură'], ['Ursus Premium', '0.33', 14],
      ['Ursus Premium NA', '0.33', 15], ['Ursus Remix', '0.33', 16, 'fructe roșii, soc'],
    ]),
    section('Whiskey', 'Whiskey', [
      ['J.W. Red Label', '40ml', 21], ['J.W. Black Label', '40ml', 25], ['Bulleit Bourbon', '40ml', 30],
      ['Jack Daniels', '40ml', 23], ['Glenfiddich 12 y.o.', '40ml', 35], ['Singleton of Dufftown', '40ml', 38],
      ['Bushmills Original', '40ml', 18],
    ]),
    section('Rom', 'Rum', [
      ['C.M. Original Spiced', '40ml', 15], ['C.M. White', '40ml', 15], ['Don Papa Maskara', '40ml', 24], ['Bumbu', '40ml', 28],
    ]),
    section('Cognac / Vinars', 'Cognac / Brandy', [
      ['Courvoisier VS', '40ml', 25], ['Courvoisier VSOP', '40ml', 30], ['Jidvei Vinars VSOP', '40ml', 22],
      ['Metaxa 7*', '40ml', 22], ['Bardar 7 ani', '40ml', 15],
    ]),
  ]),
  page('vinuri', '840052058_122116420899477205_5966078569228332637_n.jpg', 'Vinuri', 'Wines', [
    section('Vinuri', 'Wines', [
      ['Petro Vaselo', '750ml', 120, 'alb, rosé, roșu'],
      ['Purcari Nocturne', '750ml', 130, 'sauvignon blanc, rosé, rară neagră'],
      ['Caii de la Letea Manuscris', '750ml', 110, 'aligote, rosé, rară neagră'],
      ['Averești', '750ml', 150, 'zghihară, busuioacă, feteasca neagră'],
      ['Recaș', '750ml', 120, 'chardonnay, rosé, merlot'],
    ]),
    section('Vin la pahar', 'Wine by the glass', [
      ['Recaș Castel Huniade', '180ml', 25, 'sauvignon blanc, rosé, cabernet sauvignon'],
    ]),
    section('Vin spumant', 'Sparkling wine', [['Belussi Blanc de Blancs', '750ml', 100, 'extra dry']]),
    section('Prosecco', 'Prosecco', [['Cardinal', '750ml', 130, 'brut']]),
  ]),
  page('cocktails', '840363428_122116420725477205_5174060002792899655_n.jpg', 'Cocktails, spritz & gin', 'Cocktails, spritz & gin', [
    section('Vodka', 'Vodka', [['Smirnoff Red', '40ml', 18], ['Ketel One', '40ml', 21]]),
    section('Tequila', 'Tequila', [['J.C. Especial Gold', '40ml', 18], ['Jose Cuervo Silver', '40ml', 18]]),
    section('Spritz time', 'Spritz', [
      ['Hugo Spritz', '200ml', 32, 'sirop soc, lime, mentă, prosecco, apă minerală'],
      ['Aperol Spritz', '200ml', 32, 'aperol, prosecco, apă minerală, portocală'],
      ['Campari Spritz', '200ml', 32, 'campari, prosecco, apă minerală, portocală'],
      ['Sarti Spritz', '200ml', 32, 'sarti, prosecco, apă minerală, lime'],
    ]),
    section('Gin & tonic', 'Gin & tonic', [
      ['Gordon Tonic', '200ml', 25, 'gin, apă tonică, lămâie'],
      ['Tanqueray Tonic', '200ml', 28, 'gin, apă tonică, lămâie, rozmarin, piper roz'],
      ['Tanqueray 0.0 Tonic', '200ml', 28, 'gin, apă tonică, lămâie, rozmarin, piper roz'],
      ['Tanqueray Royal Tonic', '200ml', 28, 'gin, apă tonică, lămâie, rozmarin, piper roz'],
      ['Rasberry Bramble', '200ml', 28, 'gin, piure de zmeură, fresh de lămâie, apă tonică'],
    ]),
    section('Cocktails', 'Cocktails', [
      ['Negroni', '100ml', 30, 'campari, vermut roșu, gin, portocală'],
      ['Pornstar Martini', '140ml', 32, 'vodka, vanilie, piure fructul pasiunii, lichior fructul pasiunii, prosecco'],
      ['Espresso Martini', '120ml', 32, 'vodka, vanilie, lichior cafea, espresso'],
      ['Cuba Libre', '200ml', 30, 'rom, cola, lime'],
      ['Disaronno Sour', '80ml', 28, 'disaronno amaretto, suc lămâie, sirop zahăr, albuș ou'],
      ['Mojito', '200ml', 30, 'rom alb, lime, mentă, zahăr, sirop, apă minerală'],
      ['Aperol Vanilla Sour', '80ml', 32, 'aperol, sirop vanilie, fresh lămâie, albuș ou'],
    ]),
  ]),
  page('mocktails-lichior', '840332899_122116420791477205_3228843392438032904_n.jpg', 'Mocktails, lichior & shots', 'Mocktails, liqueurs & shots', [
    section('Mocktails', 'Mocktails', [
      ['Virgin Hugo', '200ml', 28, 'sirop soc, lime, mentă, sprite'],
      ['Red Berry', '200ml', 30, 'suc portocale, suc merișoare, grenadine, sprite, portocale'],
      ['Virgin Mojito', '200ml', 30, 'piure căpșuni, lime, mentă, zahăr brun, sprite'],
      ['Virgin Pornstar', '200ml', 32, 'suc ananas, piure fructul pasiunii, sirop vanilie, fresh lămâie, albuș ou'],
    ]),
    section('Lichior / Digestiv', 'Liqueurs / Digestifs', [
      ['Baileys', '40ml', 18], ['Disaronno', '40ml', 20], ['Isolabella Limoncello', '40ml', 18],
      ['Campari', '40ml', 18], ['Cinzano Bianco', '40ml', 12], ['Cinzano Rosso', '40ml', 12],
      ['Averna Amaro', '40ml', 18], ['Jägermeister', '40ml', 20], ['Sarti Aperitivo', '40ml', 24],
    ]),
    section('Tradiționale', 'Traditional spirits', [
      ['Pălincă prune Bran', '40ml', 20], ['Afinată Bran', '40ml', 13], ['Vișinată Bran', '40ml', 13],
    ]),
    section('Shots', 'Shots', [
      ['B52', '25ml', 25, 'baileys, lichior cafea, triplu sec'],
      ['Kamikaze', '25ml', 25, 'vodka, fresh lămâie, triplu sec'],
    ]),
  ]),
];

export const menuSrcset = (page: MenuPage) => [480, 800, 1200, 1448]
  .map((width) => `/images/menu/${page.id}-${width}.webp ${width}w`).join(', ');

export const menuCopy = {
  ro: {
    action: 'Vezi meniul', previewTitle: 'Poftă de ceva bun?',
    previewBody: 'De la aperitive și preparate la grătar, până la desert și un pahar de vin. Răsfoiește meniul și alege ce îți face poftă.',
    index: 'Alege o pagină', gallery: 'Meniul în imagini', page: 'Pagina', of: 'din',
    previous: 'Pagina anterioară', next: 'Pagina următoare', enlarge: 'Mărește pagina',
    original: 'Deschide imaginea originală', close: 'Închide imaginea', zoomIn: 'Mărește', zoomOut: 'Micșorează', reset: 'Încadrează pagina',
    read: 'Citește meniul', readTitle: 'Meniul, pe îndelete',
    readBody: 'Preparatele, ingredientele, cantitățile și prețurile din meniul original, într-un format ușor de citit.',
    languageNote: 'Meniul este în limba română. Prețurile sunt în lei.',
    extras: 'Din bucătăria noastră', extrasTitle: 'Mai aproape de preparatele noastre',
    fallback: 'Imaginea nu s-a încărcat. Poți deschide originalul sau citi meniul de mai jos.',
  },
  en: {
    action: 'View menu', previewTitle: 'What are you in the mood for?',
    previewBody: 'From starters and grilled dishes to dessert and a glass of wine. Browse the menu and find something you’ll enjoy.',
    index: 'Choose a page', gallery: 'Menu in pictures', page: 'Page', of: 'of',
    previous: 'Previous page', next: 'Next page', enlarge: 'Enlarge page',
    original: 'Open original image', close: 'Close image', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Fit page',
    read: 'Read the menu', readTitle: 'Take your time with the menu',
    readBody: 'Dishes, ingredients, quantities and prices from the original menu, in an easy-to-read format.',
    languageNote: 'The original menu is in Romanian. Prices are in Romanian lei.',
    extras: 'From our kitchen', extrasTitle: 'A closer look at our dishes',
    fallback: 'This image could not load. Open the original or read the menu below.',
  },
} as const;
