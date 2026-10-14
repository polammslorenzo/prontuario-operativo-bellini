/* Prove delle pagine Orari, Divieti e Sanzioni generate da dati/ordinanze.js */
const test = require('node:test');
const assert = require('node:assert/strict');

require('../dati/ordinanze.js');
require('../js/motore.js');

/* finto documento: tre contenitori, nient'altro */
const box = {};
globalThis.document = {
  getElementById: id => (box[id] = box[id] || { innerHTML: '' }),
  addEventListener: () => {}
};
require('../js/pagine.js');
const { OS, REGIMI, renderPagine, applicaSanzioniVerbali } = globalThis;

const d = (Y, M, G, h, m) => new Date(Y, M - 1, G, h, m);
const testo = id => box[id].innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('dati: ogni regime ha sanzione e testi per le pagine', () => {
  for (const [id, r] of Object.entries(REGIMI)) {
    for (const k of ['titolo', 'estremi', 'aree']) assert.ok(r[k], id + ': ' + k);
    const S = r.sanzione;
    for (const k of ['norma', 'importo', 'pmr']) assert.ok(S && S[k], id + ': sanzione.' + k);
    for (const k of ['reiterazione', 'penale']) assert.ok(S[k] && S[k].titolo && S[k].valore, id + ': sanzione.' + k);
  }
});

test('pagina Orari: chiusure raggruppate per giorni, tolleranza e stop asporto', () => {
  OS.setZona('bellini');
  renderPagine(d(2026, 11, 2, 21, 0));
  const t = testo('orari-regimi');
  assert.match(t, /O\.S\. 872\/2026/);
  assert.match(t, /O\.S\. 25\/2026/);
  assert.match(t, /Dom – Gio 01:00/);
  assert.match(t, /Ven – Sab 02:00/);          // 872
  assert.match(t, /Venerdì 02:00/);            // 25
  assert.match(t, /Sabato 03:00/);             // 25
  assert.match(t, /22:30/);
  assert.match(t, /24:00/);
  assert.match(t, /Tolleranza \+30 minuti/);
  assert.match(t, /Nessuna tolleranza/);
  assert.match(t, /NON prima 06:00/);
});

test('pagine: prima l\'ordinanza della strada scelta', () => {
  OS.setZona('viabellini');
  renderPagine(d(2026, 11, 2, 21, 0));
  const t = testo('sanzioni-regimi');
  assert.ok(t.indexOf('O.S. 25/2026') < t.indexOf('O.S. 872/2026'), 'la 25 deve venire prima in Via Bellini');
  assert.match(t, /vale in Via Bellini/);
  OS.setZona('bellini');
  renderPagine(d(2026, 11, 2, 21, 0));
  const u = testo('sanzioni-regimi');
  assert.ok(u.indexOf('O.S. 872/2026') < u.indexOf('O.S. 25/2026'), 'la 872 deve venire prima in Piazza Bellini');
});

test('pagina Sanzioni: importi, p.m.r. e note dal file dati', () => {
  renderPagine(d(2026, 11, 2, 21, 0));
  const t = testo('sanzioni-regimi');
  assert.match(t, /€ 2\.000 – € 20\.000/);
  assert.match(t, /PMR € 4\.000/);
  assert.match(t, /€ 25 – € 500/);
  assert.match(t, /PMR € 50/);
  assert.match(t, /Art\. 10 TULPS/);
});

test('pagine: le ordinanze scadute spariscono, quelle in arrivo restano', () => {
  renderPagine(d(2026, 10, 14, 12, 0));       // prima della 25
  assert.match(testo('divieti-regimi'), /in vigore dal 16\/10\/2026/);
  renderPagine(d(2026, 11, 20, 12, 0));       // scaduta la 25
  assert.doesNotMatch(testo('divieti-regimi'), /O\.S\. 25\/2026/);
  assert.match(testo('divieti-regimi'), /O\.S\. 872\/2026/);
  renderPagine(d(2026, 12, 1, 12, 0));        // scadute entrambe
  assert.match(testo('orari-regimi'), /Nessuna ordinanza sugli orari/);
});

test('verbali: norma, sanzione e p.m.r. prese dal file dati', () => {
  const GV = { os_asporto: {}, os25_chiusura_sabato: {}, m16_trasgr: { norma: 'Art. 689 c.p.' } };
  applicaSanzioniVerbali(GV);
  assert.equal(GV.os_asporto.sanzione, '€ 2.000 – € 20.000');
  assert.equal(GV.os_asporto.pmr, '€ 4.000');
  assert.equal(GV.os25_chiusura_sabato.norma, REGIMI.os25.sanzione.norma);
  assert.equal(GV.m16_trasgr.norma, 'Art. 689 c.p.');   // le altre fattispecie non si toccano
});
