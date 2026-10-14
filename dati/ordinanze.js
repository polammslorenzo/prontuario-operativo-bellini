/* ══════════════════════════════════════════════════════════════════════
   ORDINANZE E STRADE — unico file da toccare alla prossima ordinanza
   U.O. San Lorenzo · Prontuario operativo

   REGIMI  ogni ordinanza sugli orari, con date di validità e regole.
           Da qui escono anche le pagine Orari, Divieti e Sanzioni e la sanzione
           dei verbali (norma, importo, p.m.r.). I testi possono contenere <strong>.
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
    titolo:'Piazza Bellini',
    estremi:'Ordinanza Sindacale n. ORDSI/2026/0000872 del 29/07/2026',
    vigenzaDal:'2026-07-29T00:00:00', vigenzaAl:'2026-11-29T23:59:59',
    aree:'Piazza Bellini e zone limitrofe. Ai fini del controllo fa fede la perimetrazione dell\'ordinanza e dei relativi allegati.',
    riapertura:'06:00',               // nessuna riapertura prima di quest'ora
    asportoStop: 22*60 + 30,           // 22:30
    bevande:'alcoliche e analcoliche',
    chiusura:[60, 60, 60, 60, 60, 120, 120],   // dom…sab, minuti dopo mezzanotte
    tolleranza: 30,                    // solo pulizia e ricovero attrezzature
    sanzione:{
      norma:'Art. 9 L. 447/95 in rel. O.S. 872/2026',
      importo:'€ 2.000 – € 20.000', pmr:'€ 4.000', pmrNota:'doppio del minimo',
      reiterazione:{ titolo:'Reiterazione — Sospensione attività', valore:'1 – 30 giorni',
                     testo:'Segnalazione ai sensi dell\'<strong>art. 10 TULPS</strong>.' },
      penale:{ titolo:'Inottemperanza al provvedimento', valore:'Art. 650 c.p.',
               testo:'Si procede penalmente se il soggetto non ottempera.' }
    },
    note:[
      { titolo:'Art. 9 L. 447/1995', testo:'Legge quadro sull\'inquinamento acustico. Conferisce al Sindaco il potere di adottare ordinanze contingibili e urgenti. Fonte della sanzione da € 2.000 a € 20.000.' },
      { titolo:'Art. 10 TULPS', testo:'Testo Unico delle Leggi di Pubblica Sicurezza. Consente la sospensione dell\'attività in caso di reiterazione delle violazioni.' },
      { titolo:'Art. 650 c.p.', testo:'Inosservanza dei provvedimenti dell\'Autorità. Reato contravvenzionale: arresto fino a 3 mesi o ammenda fino a 206 euro.' }
    ],
    fattAsporto:'os_asporto',
    /* fattispecie del generatore per chiusura oltre orario, dom…sab */
    fattChiusura:['os_apertura_feriale','os_apertura_feriale','os_apertura_feriale','os_apertura_feriale','os_apertura_feriale','os_apertura_festivo','os_apertura_festivo']
  },
  os25: {
    sigla:'O.S. 25/2026', colore:'#2aabee',
    titolo:'Orari movida',
    estremi:'Ordinanza Sindacale n. 25 del 13/10/2026 (art. 50 c. 7 TUEL)',
    vigenzaDal:'2026-10-16T00:00:00', vigenzaAl:'2026-11-16T23:59:59',
    aree:'Per la U.O. San Lorenzo: <strong>Via Bellini, Via Carlo Doria, Via Micco Spadaro</strong> e il <strong>Centro Storico Antico</strong> (planimetria 3). In Piazza Bellini resta il regime più restrittivo della O.S. 872/2026.',
    destinatari:'Esercizi di somministrazione, di vicinato, attività artigianali con preparazione di alimenti/bevande per asporto e distributori automatici.',
    asportoStop: 24*60,                // 24:00
    bevande:'alcoliche',
    chiusura:[60, 60, 60, 60, 60, 120, 180],   // ven 02:00 · sab 03:00
    tolleranza: 0,                     // riordino e pulizia entro l'orario
    sanzione:{
      norma:'Art. 7-bis D.Lgs. 267/2000 in rel. O.S. 25/2026',
      importo:'€ 25 – € 500', pmr:'€ 50', pmrNota:'doppio del minimo, L. 689/81',
      reiterazione:{ titolo:'Reiterazione — Sospensione, poi revoca', valore:'1 – 30 giorni',
                     testo:'Sospensione ai sensi dell\'<strong>art. 10 TULPS</strong>; successivamente revoca del titolo.' },
      penale:{ titolo:'Clausola di riserva', valore:'Art. 650 c.p.',
               testo:'La sanzione amministrativa si applica salvo che il fatto costituisca reato.' }
    },
    note:[
      { titolo:'Art. 50 c. 7 e art. 7-bis D.Lgs. 267/2000', testo:'Il Sindaco coordina e riorganizza gli orari degli esercizi commerciali e dei pubblici esercizi sulla base degli indirizzi del Consiglio (Delibera C.C. n. 92 del 06/07/2026). L\'art. 7-bis fissa la sanzione da € 25 a € 500 per le violazioni delle ordinanze sindacali.' },
      { titolo:'Rapporto con la O.S. 872/2026', testo:'La O.S. 25/2026 non pregiudica né assorbe le ordinanze ex art. 9 L. 447/95. Dove vale anche la 872 (Piazza Bellini) si contesta la 872, più restrittiva.' }
    ],
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
