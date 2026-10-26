/* Estimator amount klaim: preprocessing + XGBoost inference di browser.
   Logika identik dengan export_web_model.py (dicek dengan test_vectors). */
(function (root) {
  'use strict';
  const f32 = Math.fround;

  function encode(M, raw) {
    const s = M.spec, v = {};
    for (const c of s.num) {
      let x = Number(raw[c.col]);
      if (raw[c.col] === null || raw[c.col] === undefined || raw[c.col] === '' || Number.isNaN(x)) x = c.median;
      v[c.name] = (x - c.mean) / c.scale;
    }
    for (const c of s.bin) {
      const x = Number(raw[c.col]);
      v[c.name] = Number.isNaN(x) ? 0 : x;
    }
    for (const c of s.ohe) {
      const val = raw[c.col] == null ? 'Unknown' : String(raw[c.col]);
      for (const cat in c.names) v[c.names[cat]] = val === cat ? 1 : 0;
      if (c.infrequent_name) v[c.infrequent_name] = c.frequent.includes(val) ? 0 : 1;
    }
    for (const c of s.te) {
      const val = raw[c.col] == null ? 'Unknown' : String(raw[c.col]);
      const e = Object.prototype.hasOwnProperty.call(c.map, val) ? c.map[val] : c.default;
      v[c.name] = (e - c.mean) / c.scale;
    }
    return M.features.map(n => (n in v ? v[n] : NaN));
  }

  function margin(M, x) {
    const xf = x.map(f32);
    let out = M.meta.base_score;
    for (const t of M.trees) {
      let n = 0;
      while (t.l[n] !== -1) {
        const val = xf[t.f[n]];
        n = Number.isNaN(val) ? (t.d[n] ? t.l[n] : t.r[n]) : (val < t.c[n] ? t.l[n] : t.r[n]);
      }
      out += t.c[n];
    }
    return out;
  }

  // log faktor inflasi relatif ke tanggal acuan
  function logIdx(M, t) {
    return (t - M.meta.t_base) * Math.log1p(M.meta.inflation_rate);
  }

  function predict(M, raw, t) {
    const m = margin(M, encode(M, raw));
    const lp = M.meta.inflation_mode === 'none' ? m : m + logIdx(M, t);
    const est = Math.expm1(lp) * M.meta.smear;
    // interval: rasio aktual/prediksi P10–P90 di validation, per bucket besar prediksi
    const e = M.interval.edges;
    let k = 0; while (k < e.length && est > e[k]) k++;
    const b = M.interval.buckets[k];
    return { estimate: est, lo: Math.min(est * b.lo, est), hi: Math.max(est * b.hi, est) };
  }

  function prepare(M) {
    for (const t of M.trees) t.c = t.c.map(f32);
    return M;
  }

  const api = { prepare, encode, margin, predict, logIdx };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ClaimModel = api;
})(this);
