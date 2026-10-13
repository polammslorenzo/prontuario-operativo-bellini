/* Prove automatiche del motore orario e del file delle ordinanze.
   Si lanciano con: npm test   (Node 18 o successivo, nessuna dipendenza) */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

require('../dati/ordinanze.js');
require('../js/motore.js');
const { OS, REGIMI, ZONE } = globalThis;

/* data locale: anno, mese (1-12), giorno, ore, minuti */
const d = (Y, M, G, h, m) => new Date(Y, M - 1, G, h, m);
const st = (data, zona) => OS.stato(data, zona);

/* Settimana campione: 1 nov 2026 è domenica, dentro la validità di entrambe. */
const DOM = 1, LUN = 2, GIO = 5, VEN = 6, SAB = 7;

test('dati: ogni regime è completo e coerente', () => {
  for (const [id, r] of Object.entries(REGIMI)) {
    assert.ok(r.sigla, id + ': sigla');
    assert.equal(r.chiusura.length, 7, id + ': una chiusura per giorno');
    assert.equal(r.fattChiusura.length, 7, id + ': una fattispecie di chiusura per giorno');
    assert.ok(r.fattAsporto, id + ': fattispecie asporto');
    assert.ok(new Date(r.vigenzaDal) < new Date(r.vigenzaAl), id + ': date di validità');
    assert.ok(r.asportoStop > 0 && r.asportoStop <= 1440, id + ': stop asporto');
    assert.ok(r.tolleranza >= 0, id + ': tolleranza');
    r.chiusura.forEach((c, g) => assert.ok(c > 0 && c < OS.asportoFine, id + ': chiusura giorno ' + g + ' prima delle 06:00'));
  }
});

test('dati: ogni strada ha un id unico e rimanda a regimi esistenti', () => {
  const visti = new Set();
  for (const z of ZONE) {
    assert.ok(!visti.has(z.id), 'id doppio: ' + z.id);
    visti.add(z.id);
    for (const r of z.regimi) assert.ok(REGIMI[r], z.id + ': regime sconosciuto ' + r);
  }
});

test('dati: le fattispecie citate esistono nel generatore di verbali', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const chiavi = new Set();
  for (const r of Object.values(REGIMI)) { chiavi.add(r.fattAsporto); r.fattChiusura.forEach(k => chiavi.add(k)); }
  for (const k of chiavi) {
    assert.match(html, new RegExp('\\n\\s+' + k + ':\\s*\\{'), 'manca in GV_FATT: ' + k);
    assert.match(html, new RegExp('<option value="' + k + '"'), 'manca nel menu del generatore: ' + k);
  }
});

test('O.S. 872 — Piazza Bellini: casi tipici', () => {
  const casi = [
    // [data, fase attesa, chiusura, fattispecie di chiusura]
    [d(2026, 11, LUN, 21, 59), 'ordinaria'],
    [d(2026, 11, LUN, 22, 29), 'preavviso-asporto'],
    [d(2026, 11, LUN, 22, 30), 'stop-asporto'],
    [d(2026, 11, LUN, 22, 0), 'preavviso-asporto'],
    [d(2026, 11, LUN + 1, 0, 45), 'preavviso-chiusura', '01:00', 'os_apertura_feriale'],
    [d(2026, 11, LUN + 1, 1, 0), 'tolleranza', '01:00'],
    [d(2026, 11, LUN + 1, 1, 30), 'tolleranza', '01:00'],   // ultimo minuto incluso
    [d(2026, 11, LUN + 1, 1, 31), 'fuori-orario', '01:00'],
    [d(2026, 11, SAB, 1, 15), 'stop-asporto', '02:00', 'os_apertura_festivo'],  // venerdì sera
    [d(2026, 11, SAB, 1, 59), 'preavviso-chiusura', '02:00'],
    [d(2026, 11, SAB, 2, 15), 'tolleranza', '02:00'],
    [d(2026, 11, DOM + 7, 2, 31), 'fuori-orario', '02:00', 'os_apertura_festivo'],  // sabato sera
    [d(2026, 11, LUN, 6, 0), 'ordinaria'],
  ];
  for (const [data, fase, chiude, fatt] of casi) {
    const s = st(data, 'bellini');
    assert.equal(s.fase, fase, data.toString());
    if (chiude) assert.equal(s.chiusuraTxt, chiude, data.toString());
    if (fatt) assert.equal(s.fattChiusura, fatt, data.toString());
    assert.equal(s.fonteChiusura, 'O.S. 872/2026');
  }
});

test('O.S. 25 — Via Bellini: casi tipici, senza tolleranza', () => {
  const casi = [
    [d(2026, 11, LUN, 22, 45), 'ordinaria'],
    [d(2026, 11, LUN, 23, 30), 'preavviso-asporto'],
    [d(2026, 11, LUN, 23, 59), 'preavviso-asporto'],
    [d(2026, 11, LUN + 1, 0, 0), 'stop-asporto', '01:00'],
    [d(2026, 11, LUN + 1, 0, 30), 'preavviso-chiusura', '01:00'],
    [d(2026, 11, LUN + 1, 0, 59), 'preavviso-chiusura', '01:00', 'os25_chiusura_feriale'],
    [d(2026, 11, LUN + 1, 1, 0), 'fuori-orario', '01:00'],
    [d(2026, 11, SAB, 1, 59), 'preavviso-chiusura', '02:00', 'os25_chiusura_venerdi'],
    [d(2026, 11, SAB, 2, 0), 'fuori-orario', '02:00', 'os25_chiusura_venerdi'],
    [d(2026, 11, DOM + 7, 2, 59), 'preavviso-chiusura', '03:00', 'os25_chiusura_sabato'],
    [d(2026, 11, DOM + 7, 3, 0), 'fuori-orario', '03:00', 'os25_chiusura_sabato'],
  ];
  for (const [data, fase, chiude, fatt] of casi) {
    const s = st(data, 'viabellini');
    assert.equal(s.fase, fase, data.toString());
    if (chiude) assert.equal(s.chiusuraTxt, chiude, data.toString());
    if (fatt) assert.equal(s.fattChiusura, fatt, data.toString());
    assert.equal(s.tolleranza, 0);
  }
  const notte = st(d(2026, 11, LUN + 1, 0, 30), 'viabellini');
  assert.equal(notte.asportoAttivo, true);
  assert.equal(notte.asportoTxt, '24:00');
  assert.equal(notte.fattAsporto, 'os25_asporto');
  assert.equal(notte.bevande, 'alcoliche');
});

test('giorno commerciale: dopo mezzanotte vale la sera prima', () => {
  // sabato 01:30 → sera di venerdì
  assert.equal(st(d(2026, 11, SAB, 1, 30), 'viabellini').giorno, 5);
  // domenica 02:30 → sera di sabato: in Via Bellini si chiude alle 03:00
  const s = st(d(2026, 11, DOM + 7, 2, 30), 'viabellini');
  assert.equal(s.giorno, 6);
  assert.equal(s.chiusuraTxt, '03:00');
  // lunedì 00:30 → sera di domenica: chiusura 01:00
  assert.equal(st(d(2026, 11, LUN, 0, 30), 'bellini').chiusuraTxt, '01:00');
});

test('validità: prima, dentro e dopo le date delle ordinanze', () => {
  const prima = st(d(2026, 10, 15, 23, 0), 'viabellini');
  assert.equal(prima.fase, 'nessuna');
  assert.equal(prima.prossimi[0].sigla, 'O.S. 25/2026');
  assert.match(prima.dettaglio, /16\/10/);
  assert.notEqual(st(d(2026, 10, 16, 0, 0), 'viabellini').fase, 'nessuna');
  assert.notEqual(st(d(2026, 11, 16, 23, 59), 'viabellini').fase, 'nessuna');
  assert.equal(st(d(2026, 11, 17, 0, 0), 'viabellini').fase, 'nessuna');
  assert.equal(st(d(2026, 11, 30, 0, 30), 'bellini').fase, 'nessuna');
  assert.equal(st(d(2026, 11, 4, 23, 0), 'fuori').fase, 'nessuna');
});

test('giorni alla scadenza', () => {
  assert.equal(st(d(2026, 11, 14, 12, 0), 'viabellini').giorniResidui, 3);
  assert.equal(st(d(2026, 11, 14, 12, 0), 'bellini').giorniResidui, 16);
});

test('più ordinanze nella stessa strada: vince la regola più restrittiva', () => {
  ZONE.push({ id: 'prova-entrambe', nome: 'Strada di prova', gruppo: 'Prova', regimi: ['os872', 'os25'] });
  try {
    // asporto: 22:30 della 872 batte le 24:00 della 25
    const sera = st(d(2026, 11, LUN, 22, 45), 'prova-entrambe');
    assert.equal(sera.fase, 'stop-asporto');
    assert.equal(sera.fonteAsporto, 'O.S. 872/2026');
    // sabato: chiusura 02:00 della 872 batte le 03:00 della 25, con la tolleranza della 872
    const sab = st(d(2026, 11, DOM + 7, 2, 15), 'prova-entrambe');
    assert.equal(sab.chiusuraTxt, '02:00');
    assert.equal(sab.fase, 'tolleranza');
    // venerdì: stessa ora (02:00), vince la tolleranza minore (nessuna, O.S. 25)
    const ven = st(d(2026, 11, SAB, 2, 15), 'prova-entrambe');
    assert.equal(ven.fase, 'fuori-orario');
    assert.equal(ven.fonteChiusura, 'O.S. 25/2026');
  } finally {
    ZONE.pop();
  }
});

/* Confronto minuto per minuto con una tabella attesa scritta a parte. */
function atteso(R, giornoCal, min) {
  const notte = min < 360;
  const gc = notte ? (giornoCal + 6) % 7 : giornoCal;
  const lim = R.chiusura[gc], fine = lim + R.tolleranza;
  if (notte) {
    if (min < lim) return 'aperta';
    if (R.tolleranza && min <= fine) return 'tolleranza';
    return 'chiusa';
  }
  return min < R.asportoStop ? 'ordinaria' : 'aperta';
}
const MAPPA = {
  'ordinaria': 'ordinaria', 'preavviso-asporto': 'ordinaria',
  'stop-asporto': 'aperta', 'preavviso-chiusura': 'aperta',
  'tolleranza': 'tolleranza', 'fuori-orario': 'chiusa'
};

for (const [id, zona] of [['os872', 'bellini'], ['os25', 'viabellini']]) {
  test('settimana intera, minuto per minuto — ' + REGIMI[id].sigla, () => {
    const R = REGIMI[id];
    for (let g = 0; g < 7; g++) for (let m = 0; m < 1440; m++) {
      const data = d(2026, 11, 1 + g, Math.floor(m / 60), m % 60);
      const s = st(data, zona);
      assert.equal(MAPPA[s.fase], atteso(R, data.getDay(), m), data.toString() + ' → ' + s.fase);
    }
  });
}
