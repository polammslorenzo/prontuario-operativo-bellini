/* Collegamento leggero tra attività e planimetrie.
   I PDF si trovano accanto a index.html e non appesantiscono db_bellini.js. */
(function () {
  'use strict';

  var P = {
    'SMCO-097': { file: 'ALKYMYA_ultimo_grafico.pdf', data: '2021-09-06', pratica: '09483461217-06092021-1811' },
    'SMCO-090': { file: 'EL_KRELLA_ultimo_grafico.pdf', data: '2026-06-09', pratica: '09435341210-15072021-1526' },
    'SMCO-092': { file: 'HYDRA_BELLINI_ultimo_grafico.pdf', data: '2024-04-26', pratica: '10321291212-08032024-1628' },
    'SMCO-088': { file: 'BAR_FIORILLO_ultimo_grafico.pdf', data: '2022-06-23', pratica: '07551041218-23062022-1546' },
    'SMCO-095': { file: 'LA_SPILLERIA_ultimo_grafico.pdf', data: '2021-05-20', pratica: 'TRRGPP68A12F839L-18052021-1306' },
    'SMCO-096': { file: 'JURDAU_ultimo_grafico.pdf', data: '2026-07-15', pratica: '09315181215-19112021-0819' },
    'SMCO-078': { file: 'PIZZERIA_BELLINI_ultimo_grafico.pdf', data: '2025-08-20', pratica: '05512401216-20082025-1257' },
    'SMCO-081': { file: 'CAFFE_DELL_EPOCA_ultimo_grafico.pdf', data: '2025-12-12', pratica: '09076611210-24102022-1102' },
    'PALB-006': { file: 'POSCA_BAR_ultimo_grafico.pdf', data: '2022-04-29', pratica: '09726351217-29042022-1046' },
    'PALB-018': { file: 'ANTICHISSIMA_PIZZERIA_ultimo_grafico.pdf', data: '2026-05-11', pratica: '09143491216-06052026-1600' },
    'SPMA-017': { file: 'MAREMMA_MAIALA_ultimo_grafico.pdf', data: '2026-07-27', pratica: '10034531219-21062022-1815' },
    'VBEL-064': { file: 'CAFFE_ARABO_ultimo_grafico.pdf', data: '2025-11-14', pratica: '07016310638-14112025-1201' },
    'VBEL-069': { file: 'CAFFE_LETTERARIO_ultimo_grafico.pdf', data: '2023-08-21', pratica: '07640451212-20082023-1133' },
    'SMCO-105': { file: 'ALTER_EGO_ultimo_grafico.pdf', data: '2026-06-16', pratica: '07708431213-20072021-1648' },
    'VBEL-071': { file: 'PRIMO_MAGGIO_ultimo_grafico.pdf', data: '2026-07-21', pratica: '09096251211-30032022-0657' }
  };

  function collega() {
    if (!window.DB_BELLINI || !window.DB_BELLINI.get) return;
    Object.keys(P).forEach(function (id) {
      var attivita = window.DB_BELLINI.get(id);
      if (attivita) attivita.planimetria = P[id];
    });
  }

  window.PLANIMETRIE_BELLINI = P;
  collega();
})();
