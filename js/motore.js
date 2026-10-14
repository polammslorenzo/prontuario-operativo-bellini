/* ══════════════════════════════════════════════════════════════════════
   MOTORE ORARIO — unico motore del prontuario · U.O. San Lorenzo
   Legge REGIMI e ZONE da dati/ordinanze.js (da caricare prima).
   OS.stato(data, zona) dice cosa vale in quella strada a quell'ora.
   Provato in automatico da test/orari.test.js (npm test).
   ══════════════════════════════════════════════════════════════════════ */
(function(g){
var REGIMI = g.REGIMI, ZONE = g.ZONE;
g.OS = {
  /* valori della O.S. 872 tenuti qui per compatibilità */
  sigla:        'O.S. 872/2026',
  luogo:        'Piazza Bellini',
  vigenzaAl:    '2026-11-29T23:59:59',
  asportoStop:  22*60 + 30,
  asportoFine:   6*60,             // 06:00 — cessa il divieto (uguale per tutti i regimi)
  preavviso:    30,                // minuti di preavviso sugli avvisi
  chiusuraFer:  60,
  chiusuraWknd: 120,
  tolleranza:   30,
  KEY: 'prontuario_zona',

  hhmm: function(min){ min=((min%1440)+1440)%1440; return String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0'); },
  ddmm: function(iso){ var p = iso.slice(0,10).split('-'); return p[2]+'/'+p[1]; },

  zonaId: function(){
    if (this._zona) return this._zona;
    try { var v = localStorage.getItem(this.KEY); if (v) return v; } catch(e){}
    return 'bellini';
  },
  zona: function(id){
    id = id || this.zonaId();
    for (var k = 0; k < ZONE.length; k++) if (ZONE[k].id === id) return ZONE[k];
    return ZONE[0];
  },
  setZona: function(id){
    this._zona = id;
    try { localStorage.setItem(this.KEY, id); } catch(e){}
    if (g.renderStato) g.renderStato();
    if (g.renderPagine) g.renderPagine();
  },
  vigente: function(r, now){
    var t = now.getTime();
    return t >= new Date(r.vigenzaDal).getTime() && t <= new Date(r.vigenzaAl).getTime();
  },

  /* regole in vigore in una strada a un dato momento: per ogni regola il regime più restrittivo */
  regola: function(now, z, giorno){
    var self = this, R = { regimi:[], prossimi:[] };
    z.regimi.forEach(function(id){
      var r = REGIMI[id]; if (!r) return;
      if (self.vigente(r, now)) R.regimi.push(r);
      else if (now.getTime() < new Date(r.vigenzaDal).getTime()) R.prossimi.push(r);
    });
    R.regimi.forEach(function(r){
      if (!R.fonteAsporto || r.asportoStop < R.fonteAsporto.asportoStop) R.fonteAsporto = r;
      var c = r.chiusura[giorno], f = R.fonteChiusura;
      if (!f || c < f.chiusura[giorno] || (c === f.chiusura[giorno] && r.tolleranza < f.tolleranza)) R.fonteChiusura = r;
    });
    return R;
  },

  /* Unico motore orario del prontuario. zona facoltativa: se manca, quella scelta in home. */
  stato: function(now, zonaId){
    now = now || new Date();
    var h = now.getHours(), m = now.getMinutes(), mins = h*60+m;
    /* giorno commerciale: dopo mezzanotte vale la sera precedente */
    var giorno = (h < 6) ? (now.getDay()+6)%7 : now.getDay();
    var z = this.zona(zonaId), R = this.regola(now, z, giorno);
    var st = { ora: this.hhmm(mins), weekend: (giorno === 5 || giorno === 6), giorno: giorno,
               zona: z, regimi: R.regimi, prossimi: R.prossimi };

    if (!R.regimi.length){
      st.nessuna = true; st.fase = 'nessuna'; st.livello = 'grey'; st.icona = '–';
      st.titolo = 'NESSUNA ORDINANZA';
      st.dettaglio = (z.regimi.length ? 'In ' + z.nome : 'Qui') + ' adesso non vale nessuna ordinanza sugli orari. Restano i limiti generali di legge sull\'alcol (scheda Minori → Orari alcol).'
        + (R.prossimi.length ? ' La ' + R.prossimi[0].sigla + ' entra in vigore il ' + this.ddmm(R.prossimi[0].vigenzaDal) + '.' : '');
      st.asportoAttivo = false; st.asportoTxt = '—'; st.chiusuraTxt = '—'; st.tolleranzaTxt = '—';
      st.giorniResidui = 0;
      return st;
    }

    var A = R.fonteAsporto, C = R.fonteChiusura;
    var stop = A.asportoStop, lim = C.chiusura[giorno], tol = C.tolleranza;
    var norm = (h < 6) ? mins+1440 : mins;
    var L = 1440 + lim, T = L + tol;
    st.asportoTxt    = stop >= 1440 ? '24:00' : this.hhmm(stop);
    st.chiusuraTxt   = this.hhmm(lim);
    st.tolleranzaTxt = this.hhmm(lim + tol);
    st.tolleranza    = tol;
    st.asportoAttivo = (mins >= stop || h < 6);
    st.bevande       = A.bevande;
    st.fonteAsporto  = A.sigla;  st.fattAsporto  = A.fattAsporto;
    st.fonteChiusura = C.sigla;  st.fattChiusura = C.fattChiusura[giorno];
    var dopo = tol ? ', poi ' + tol + ' minuti solo per pulizia e ricovero attrezzature.' : ', senza tolleranza.';

    if (tol ? norm > T : norm >= L){
      st.fase='fuori-orario'; st.livello='red'; st.icona='✕';
      st.titolo='FUORI ORARIO';
      st.dettaglio=(tol ? 'Tolleranza superata.' : 'Orario di chiusura superato, nessuna tolleranza.') + ' Attività da verificare immediatamente: chiusura prevista alle '+st.chiusuraTxt+' (' + C.sigla + ').';
    } else if (norm >= L){
      st.fase='tolleranza'; st.livello='amber'; st.icona='⚠';
      st.titolo='SOLO PULIZIE';
      st.dettaglio='Nessuna prosecuzione dell\'attività. Consentiti solo pulizia e ricovero attrezzature fino alle '+st.tolleranzaTxt+'.';
    } else if (norm >= L - this.preavviso){
      st.fase='preavviso-chiusura'; st.livello='amber'; st.icona='⏰';
      st.titolo='CHIUSURA TRA '+(L-norm)+' MIN';
      st.dettaglio='Chiusura prevista alle '+st.chiusuraTxt+dopo.replace(/\.$/, '')+'. Divieto di asporto già in vigore.';
    } else if (st.asportoAttivo){
      st.fase='stop-asporto'; st.livello='red'; st.icona='🚫';
      st.titolo='STOP ASPORTO';
      st.dettaglio='Divieto di asporto di bevande '+A.bevande+' in vigore. Chiusura alle '+st.chiusuraTxt+dopo;
    } else if (mins >= stop - this.preavviso){
      st.fase='preavviso-asporto'; st.livello='amber'; st.icona='⚠';
      st.titolo='ASPORTO TRA '+(stop-mins)+' MIN';
      st.dettaglio='Il divieto di asporto di bevande '+A.bevande+' entra in vigore alle '+st.asportoTxt+'. Chiusura alle '+st.chiusuraTxt+'.';
    } else {
      st.fase='ordinaria'; st.livello='green'; st.icona='✓';
      st.titolo='FASCIA ORDINARIA';
      st.dettaglio='Stop asporto ('+A.bevande+') dalle '+st.asportoTxt+'. Chiusura alle '+st.chiusuraTxt+dopo.replace(/\.$/, '')+'.';
    }
    st.giorniResidui = Math.min.apply(null, R.regimi.map(function(r){
      return Math.max(0, Math.ceil((new Date(r.vigenzaAl) - now)/86400000));
    }));
    return st;
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
