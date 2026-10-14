/* ══════════════════════════════════════════════════════════════════════
   PAGINE ORARI, DIVIETI E SANZIONI — generate da dati/ordinanze.js
   Una sezione per ogni ordinanza in vigore o in arrivo (le scadute spariscono);
   in cima quella che vale nella strada scelta in "Dove sei".
   ══════════════════════════════════════════════════════════════════════ */
(function(g){
  var GIORNI   = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  var GIORNI_L = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  function ora(min){ return min >= 1440 ? '24:00' : g.OS.hhmm(min); }
  function dataIt(iso){ var p = iso.slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }

  /* giorni consecutivi con la stessa chiusura: [{da, a, v}] */
  function gruppiGiorni(arr){
    var out = [], i = 0;
    while (i < 7){
      var j = i;
      while (j + 1 < 7 && arr[j + 1] === arr[i]) j++;
      out.push({ da:i, a:j, v:arr[i] });
      i = j + 1;
    }
    return out;
  }
  function etichettaGiorni(gr){
    if (gr.da === 0 && gr.a === 6) return 'Tutti i giorni';
    if (gr.da === gr.a) return GIORNI_L[gr.da];
    return GIORNI[gr.da] + ' – ' + GIORNI[gr.a];
  }

  /* ordinanze da mostrare: in vigore o in arrivo; prima quelle della strada scelta */
  function elenco(now){
    var zona = g.OS.zona();
    return Object.keys(g.REGIMI).map(function(id){
      var r = g.REGIMI[id];
      return { id:id, r:r, qui:zona.regimi.indexOf(id) >= 0,
               futura: now < new Date(r.vigenzaDal), zona:zona };
    }).filter(function(x){ return now <= new Date(x.r.vigenzaAl); })
      .sort(function(a, b){ return (b.qui - a.qui) || (a.futura - b.futura) || (new Date(a.r.vigenzaDal) - new Date(b.r.vigenzaDal)); });
  }

  function testata(x){
    var r = x.r, tag;
    if (x.futura) tag = '<span class="reg-tag off">in vigore dal ' + dataIt(r.vigenzaDal) + '</span>';
    else tag = '<span class="reg-tag" style="color:' + r.colore + ';border-color:' + r.colore + '">✔ in vigore</span>';
    if (x.qui) tag += '<span class="reg-tag qui">📍 vale in ' + x.zona.nome + '</span>';
    return '<div class="reg-head" style="border-left-color:' + r.colore + '">'
      + '<div class="reg-sigla" style="color:' + r.colore + '">' + r.sigla + ' · ' + r.titolo + '</div>'
      + '<div class="reg-estremi">' + r.estremi + ' · dal ' + dataIt(r.vigenzaDal) + ' al ' + dataIt(r.vigenzaAl) + '</div>'
      + '<div class="reg-tags">' + tag + '</div></div>';
  }

  function dove(r){
    return '<div class="alert orange"><div class="alert-title">📍 Dove si applica</div><p>'
      + (r.destinatari ? r.destinatari + ' ' : '') + r.aree + '</p></div>';
  }

  function sezioneOrari(x){
    var r = x.r, tol = r.tolleranza;
    var colTol = tol
      ? '<span style="color:var(--accent);font-weight:700;">+' + tol + ' min</span><br><span style="color:var(--accent);font-style:italic;font-size:11px;">solo pulizie</span>'
      : '<strong style="color:var(--red);">nessuna</strong>';
    var righe = gruppiGiorni(r.chiusura).map(function(gr){
      return '<tr><td>' + etichettaGiorni(gr) + '</td><td><span class="time-big">' + ora(gr.v) + '</span></td><td style="font-size:12px;">' + colTol + '</td></tr>';
    }).join('');
    if (r.riapertura) righe += '<tr><td>Tutti i giorni</td><td><span class="time-green">NON prima ' + r.riapertura + '</span></td><td style="font-size:12px;"><strong style="color:#2ecc71;">Riapertura</strong></td></tr>';
    return testata(x)
      + '<div class="reg-stop"><div class="warn-fade reg-stop-ic">🚫</div><div>'
      +   '<div class="reg-k">Stop vendita/somministrazione per asporto</div>'
      +   '<div class="reg-stop-ora">' + ora(r.asportoStop) + '</div>'
      +   '<div class="reg-stop-sub">Tutti i giorni fino alle 06:00 — bevande ' + r.bevande + '</div>'
      + '</div></div>'
      + '<div class="card"><table class="orario-table"><thead><tr><th>Giorni</th><th>Chiusura</th><th>Tolleranza</th></tr></thead><tbody>'
      + righe + '</tbody></table></div>'
      + (tol
        ? '<div class="alert green"><div class="alert-title">ℹ Tolleranza +' + tol + ' minuti</div><p>I ' + tol + ' minuti extra sono consentiti <strong>esclusivamente</strong> per il ricovero delle attrezzature e la pulizia degli spazi. Non è ammessa prosecuzione dell\'attività commerciale.</p></div>'
        : '<div class="alert orange"><div class="alert-title">⚠ Nessuna tolleranza</div><p>La ' + r.sigla + ' non prevede minuti per riordino e pulizia: devono concludersi <strong>entro</strong> l\'orario di chiusura.</p></div>')
      + dove(r);
  }

  function sezioneDivieti(x){
    var r = x.r;
    return testata(x)
      + '<div class="alert orange"><div class="alert-title">🚫 Vietato — tutte le sere</div>'
      + '<p>Vendita e somministrazione per asporto di <strong>bevande ' + r.bevande + '</strong> dalle <strong>' + ora(r.asportoStop)
      + '</strong> alle <strong>06:00</strong> del giorno successivo, tutti i giorni della settimana.</p></div>'
      + dove(r);
  }

  function riga(ic, titolo, valore, sotto, colore){
    return '<div class="sanzione-row"><div class="sanzione-icon">' + ic + '</div><div>'
      + '<div class="sanzione-label">' + titolo + '</div>'
      + '<div class="sanzione-value"' + (colore ? ' style="color:' + colore + ';"' : '') + '>' + valore + '</div>'
      + sotto + '</div></div>';
  }
  function sezioneSanzioni(x){
    var r = x.r, S = r.sanzione;
    return testata(x)
      + '<div class="norma-badge">⚖️ ' + S.norma + '</div>'
      + '<div class="card">'
      +   riga('💰', 'Sanzione amministrativa', S.importo, '<div class="pmr-badge">PMR ' + S.pmr + (S.pmrNota ? ' (' + S.pmrNota + ')' : '') + '</div>')
      +   riga('🔒', S.reiterazione.titolo, S.reiterazione.valore, '<div class="sanzione-desc">' + S.reiterazione.testo + '</div>', 'var(--accent2)')
      +   riga('⚖️', S.penale.titolo, S.penale.valore, '<div class="sanzione-desc">' + S.penale.testo + '</div>')
      + '</div>'
      + (r.note && r.note.length
        ? '<div class="card">' + r.note.map(function(n){ return '<details><summary>' + n.titolo + '</summary><p>' + n.testo + '</p></details>'; }).join('') + '</div>'
        : '');
  }

  var VUOTO = '<div class="card" style="color:var(--muted);font-size:13px;">Nessuna ordinanza sugli orari in vigore o in arrivo.</div>';
  function riempi(id, fn, lista){
    var el = document.getElementById(id);
    if (el) el.innerHTML = lista.length ? lista.map(function(x){ return '<section class="reg-sez">' + fn(x) + '</section>'; }).join('') : VUOTO;
  }

  g.renderPagine = function(now){
    var lista = elenco(now || new Date());
    riempi('orari-regimi',    sezioneOrari,    lista);
    riempi('divieti-regimi',  sezioneDivieti,  lista);
    riempi('sanzioni-regimi', sezioneSanzioni, lista);
    var piede = document.getElementById('piede-regimi');
    if (piede) piede.innerHTML = lista.map(function(x){
      var r = x.r;
      return '<span class="reg-piede" style="color:' + r.colore + ';border-color:' + r.colore + '">'
        + r.sigla + ' · validità ' + dataIt(r.vigenzaDal) + ' – ' + dataIt(r.vigenzaAl) + '</span>';
    }).join('');
  };

  /* norma, sanzione e p.m.r. dei verbali di ordinanza: dal file dati */
  g.applicaSanzioniVerbali = function(GV){
    Object.keys(g.REGIMI).forEach(function(id){
      var r = g.REGIMI[id], S = r.sanzione;
      [r.fattAsporto].concat(r.fattChiusura).forEach(function(k){
        if (GV[k]){ GV[k].norma = S.norma; GV[k].sanzione = S.importo; GV[k].pmr = S.pmr; }
      });
    });
  };

  if (typeof document !== 'undefined')
    document.addEventListener('DOMContentLoaded', function(){ g.renderPagine(); });
})(typeof window !== 'undefined' ? window : globalThis);
