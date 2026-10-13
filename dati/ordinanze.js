/* ══════════════════════════════════════════════════════════════════════
   ORDINANZE E STRADE — unico file da toccare alla prossima ordinanza
   U.O. San Lorenzo · Prontuario operativo

   REGIMI  ogni ordinanza sugli orari, con date di validità e regole.
           Orari in minuti: la sera dopo mezzanotte (22:30 = 1350, 24:00 = 1440);
           le chiusure in minuti dopo mezzanotte (01:00 = 60, 03:00 = 180),
           un valore per giorno da domenica a sabato (giorno in cui il locale apre).
   ZONE    le strade del selettore "Dove sei" e i regimi che valgono in ciascuna.
           Se in una strada valgono più regimi, per ogni regola vince il più restrittivo.

   Per aggiungere un'ordinanza: un nuovo regime in REGIMI, il suo id nelle
   strade interessate, le sue fattispecie nel generatore (index.html, GV_FATT),
   un campione in CAMPIONI (autotest in pagina) e un caso in test/orari.test.js.
   Poi: npm test.
   ══════════════════════════════════════════════════════════════════════ */
(function(g){
g.REGIMI = {
  os872: {
    sigla:'O.S. 872/2026', colore:'#f5a623',
    vigenzaDal:'2026-07-29T00:00:00', vigenzaAl:'2026-11-29T23:59:59',
    asportoStop: 22*60 + 30,           // 22:30
    bevande:'alcoliche e analcoliche',
    chiusura:[60, 60, 60, 60, 60, 120, 120],   // dom…sab, minuti dopo mezzanotte
    tolleranza: 30,                    // solo pulizia e ricovero attrezzature
    norma:'Art. 9 L. 447/95', sanzione:'€ 2.000 – € 20.000',
    fattAsporto:'os_asporto',
    /* fattispecie del generatore per chiusura oltre orario, dom…sab */
    fattChiusura:['os_apertura_feriale','os_apertura_feriale','os_apertura_feriale','os_apertura_feriale','os_apertura_feriale','os_apertura_festivo','os_apertura_festivo']
  },
  os25: {
    sigla:'O.S. 25/2026', colore:'#2aabee',
    vigenzaDal:'2026-10-16T00:00:00', vigenzaAl:'2026-11-16T23:59:59',
    asportoStop: 24*60,                // 24:00
    bevande:'alcoliche',
    chiusura:[60, 60, 60, 60, 60, 120, 180],   // ven 02:00 · sab 03:00
    tolleranza: 0,                     // riordino e pulizia entro l'orario
    norma:'Art. 7-bis TUEL', sanzione:'€ 25 – € 500',
    fattAsporto:'os25_asporto',
    fattChiusura:['os25_chiusura_feriale','os25_chiusura_feriale','os25_chiusura_feriale','os25_chiusura_feriale','os25_chiusura_feriale','os25_chiusura_venerdi','os25_chiusura_sabato']
  }
};

g.ZONE = [
  { id:'bellini',        nome:'Piazza Bellini',                  gruppo:'O.S. 872/2026 — Piazza Bellini', regimi:['os872'] },
  { id:'costantinopoli', nome:'Via S. Maria di Costantinopoli',  gruppo:'O.S. 872/2026 — Piazza Bellini', regimi:['os872'] },
  { id:'maiella',        nome:'Via San Pietro a Maiella',        gruppo:'O.S. 872/2026 — Piazza Bellini', regimi:['os872'] },
  { id:'portalba',       nome:"Via Port'Alba",                   gruppo:'O.S. 872/2026 — Piazza Bellini', regimi:['os872'] },
  { id:'sansebastiano',  nome:'Via San Sebastiano',              gruppo:'O.S. 872/2026 — Piazza Bellini', regimi:['os872'] },
  { id:'viabellini',     nome:'Via Bellini',                     gruppo:'O.S. 25/2026 — Movida',          regimi:['os25'] },
  { id:'doria',          nome:'Via Carlo Doria',                 gruppo:'O.S. 25/2026 — Movida',          regimi:['os25'] },
  { id:'spadaro',        nome:'Via Micco Spadaro',               gruppo:'O.S. 25/2026 — Movida',          regimi:['os25'] },
  { id:'centrostorico',  nome:'Altra strada del Centro Storico Antico (plan. 3)', gruppo:'O.S. 25/2026 — Movida', regimi:['os25'] },
  { id:'fuori',          nome:'Fuori dalle aree delle ordinanze', gruppo:'Altro',                         regimi:[] }
];

})(typeof window !== 'undefined' ? window : globalThis);
