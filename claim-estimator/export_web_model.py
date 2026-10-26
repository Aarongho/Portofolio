"""
Export model Step 6 ke model.json untuk website (GitHub Pages).

Cara pakai: jalankan di AKHIR notebook Step 6 (setelah semua cell selesai):
    %run -i export_web_model.py

Butuh variabel dari notebook Step 6:
    M_tuned, RATE, T_BASE, INFLATION_MODE, X_train, X_test, X_val, t_val, y_val,
    t_train, y_train, Xr_train, Xr_test, p (fungsi path), DATA_DIR
Output: web_model/model.json  (taruh di folder website, sebelah index.html)
"""
import json, os, re
import numpy as np
import pandas as pd
import joblib

OUT_DIR = os.path.join(DATA_DIR, 'web_model')
os.makedirs(OUT_DIR, exist_ok=True)
f32 = lambda v: float(np.float32(v))

# ------------------------------------------------------------------ preprocessor Step 2
pp = joblib.load(p('preprocessor.joblib'))
pre = pp['preprocessor']
NUM, BIN, OHE, TE = pp['NUM_COLS'], pp['BIN_COLS'], pp['OHE_COLS'], pp['TE_COLS']
nt = pre.named_transformers_

num_imp, num_sc = nt['num'].named_steps['impute'], nt['num'].named_steps['scale']
ohe_enc = nt['ohe'].named_steps['ohe']
te_enc, te_sc = nt['te'].named_steps['te'], nt['te'].named_steps['scale']

# nama kolom final = nama sklearn -> replace('_te','') (Step 2) -> clean() (Step 6)
clean = lambda c: re.sub(r'[\[\]<>]', '_', str(c))
final_name = lambda c: clean(c.replace('_te', ''))

spec = {'num': [], 'bin': [], 'ohe': [], 'te': []}
for i, c in enumerate(NUM):
    spec['num'].append({'col': c, 'name': final_name(c), 'median': float(num_imp.statistics_[i]),
                        'mean': float(num_sc.mean_[i]), 'scale': float(num_sc.scale_[i])})
for c in BIN:
    spec['bin'].append({'col': c, 'name': final_name(c)})

ohe_names = list(nt['ohe'].get_feature_names_out(OHE)) if hasattr(nt['ohe'], 'get_feature_names_out') else None
infreq = getattr(ohe_enc, 'infrequent_categories_', [None] * len(OHE))
for i, c in enumerate(OHE):
    inf = [] if infreq[i] is None else [str(v) for v in infreq[i]]
    frequent = [str(v) for v in ohe_enc.categories_[i] if str(v) not in inf]
    spec['ohe'].append({'col': c, 'frequent': frequent, 'infrequent': inf,
                        'names': {v: final_name(f'{c}_{v}') for v in frequent},
                        'infrequent_name': final_name(f'{c}_infrequent_sklearn') if inf else None})
for i, c in enumerate(TE):
    cats = [str(v) for v in te_enc.categories_[i]]
    spec['te'].append({'col': c, 'name': final_name(c),
                       'map': {k: round(float(v), 7) for k, v in zip(cats, te_enc.encodings_[i])},
                       'default': float(te_enc.target_mean_),
                       'mean': float(te_sc.mean_[i]), 'scale': float(te_sc.scale_[i])})


def encode_rows(raw: pd.DataFrame) -> pd.DataFrame:
    """Reimplementasi Python dari preprocessing (logika identik dengan model.js)."""
    out = {}
    for s in spec['num']:
        v = pd.to_numeric(raw[s['col']], errors='coerce').fillna(s['median']).astype(float)
        out[s['name']] = (v - s['mean']) / s['scale']
    for s in spec['bin']:
        out[s['name']] = pd.to_numeric(raw[s['col']], errors='coerce').fillna(0).astype(float)
    for s in spec['ohe']:
        v = raw[s['col']].astype('object').where(raw[s['col']].notna(), 'Unknown').astype(str)
        for cat, nm in s['names'].items():
            out[nm] = (v == cat).astype(float)
        if s['infrequent_name']:
            out[s['infrequent_name']] = (~v.isin(s['frequent'])).astype(float)   # infrequent + unknown
    for s in spec['te']:
        v = raw[s['col']].astype('object').where(raw[s['col']].notna(), 'Unknown').astype(str)
        enc = v.map(s['map']).fillna(s['default']).astype(float)
        out[s['name']] = (enc - s['mean']) / s['scale']
    return pd.DataFrame(out, index=raw.index)


# cek encoding: reimplementasi == X_test asli (pakai preprocessor.transform) -> harus identik
enc_test = encode_rows(Xr_test)
missing = [c for c in X_test.columns if c not in enc_test.columns]
assert not missing, f'Nama kolom tidak ketemu di reimplementasi: {missing[:5]}'
diff = np.abs(enc_test[X_test.columns].values - X_test.values).max()
print(f'[cek 1] encoding reimplementasi vs preprocessor: max selisih = {diff:.2e}')
assert diff < 1e-6, 'Encoding tidak identik!'

# ------------------------------------------------------------------ model XGBoost
model = M_tuned['model']
feats = list(M_tuned['feats'])
booster = model.get_booster()
n_iter = int(model.best_iteration) + 1
b = booster[:n_iter]
raw_json = json.loads(bytes(b.save_raw(raw_format='json')).decode())
learner = raw_json['learner']
bs = learner['learner_model_param']['base_score']
base_score = float(json.loads(bs)[0]) if bs.strip().startswith('[') else float(bs)
fn = learner.get('feature_names') or feats
assert list(fn) == feats, 'Urutan fitur model berbeda dengan M_tuned feats'

trees = []
for t in learner['gradient_booster']['model']['trees']:
    trees.append({'l': t['left_children'], 'r': t['right_children'], 'f': t['split_indices'],
                  'c': [f32(v) for v in t['split_conditions']], 'd': t['default_left']})


def predict_margin(X: np.ndarray) -> np.ndarray:
    """Traversal pohon (float32, sama dengan XGBoost & model.js)."""
    X = X.astype(np.float32)
    out = np.full(len(X), base_score, dtype=np.float64)
    for t in trees:
        l, r, f, c, d = t['l'], t['r'], t['f'], np.array(t['c'], np.float32), t['d']
        for i in range(len(X)):
            n = 0
            while l[n] != -1:
                x = X[i, f[n]]
                n = (l[n] if d[n] else r[n]) if np.isnan(x) else (l[n] if x < c[n] else r[n])
            out[i] += c[n]
    return out


chk = X_test[feats].iloc[:300]
m_py = predict_margin(enc_test.loc[chk.index, feats].values)
m_xgb = model.predict(chk)
d2 = np.abs(m_py - m_xgb).max()
print(f'[cek 2] traversal pohon vs XGBoost.predict: max selisih (log) = {d2:.2e}')
assert d2 < 1e-3, 'Prediksi pohon tidak sama!'

# ------------------------------------------------------------------ interval (rasio aktual/prediksi di validation)
pv = to_rp(M_tuned, X_val, t_val)
av = np.expm1(y_val.values)
ratio = av / pv
edges = np.quantile(pv, np.linspace(0, 1, 11))[1:-1]           # 10 bucket berdasarkan besar prediksi
bucket = np.searchsorted(edges, pv)
iv = []
for k in range(10):
    r = ratio[bucket == k]
    iv.append({'lo': float(np.quantile(r, 0.10)), 'hi': float(np.quantile(r, 0.90))})
print('[info] interval P10–P90 per bucket prediksi:', [(round(x['lo'], 2), round(x['hi'], 2)) for x in iv])

# ------------------------------------------------------------------ dropdown & lookup dari data train
Xr = Xr_train
def options(col, min_count=1):
    vc = Xr[col].astype(str).value_counts()
    vc = vc[vc >= min_count]
    return [[k, int(v)] for k, v in vc.items()]

def mode_map(key, val):
    g = Xr.groupby(Xr[key].astype(str))[val].agg(lambda s: s.astype(str).mode().iloc[0])
    return g.to_dict()

hosp_attr = {}
for h, g in Xr.groupby(Xr['TreatmentPlaceChangeClean2'].astype(str)):
    hosp_attr[h] = {c: str(g[c].astype(str).mode().iloc[0])
                    for c in ['HospitalGroup', 'ProviderProvince', 'ProviderArea', 'ProviderClassification2']}

# Kategori operatif per tindakan (mode)
tx_cat = (Xr.groupby(Xr['PrimaryMedicalTreatment'].astype(str))['PrimaryTreatmentCategory']
            .agg(lambda s: int(round(s.mean()))).to_dict())

# Statistik klaim sejenis (Dx + Tx) -> amount dinyatakan dalam nilai tanggal acuan (sudah disesuaikan inflasi)
amt_tr = np.expm1(y_train.values)
amt_tr_base = amt_tr * np.exp(-(t_train.values - T_BASE) * np.log1p(RATE)) if RATE else amt_tr
gs = pd.DataFrame({'dx': Xr['PrimaryDiagnosis2'].astype(str).values, 'tx': Xr['PrimaryMedicalTreatment'].astype(str).values,
                   'amt': amt_tr_base, 'los': Xr['LOS'].astype(float).values})
gstat = gs.groupby(['dx', 'tx']).agg(n=('amt', 'size'), med=('amt', 'median'),
                                     p25=('amt', lambda s: s.quantile(.25)), p75=('amt', lambda s: s.quantile(.75)),
                                     los=('los', 'median'))
gstat = gstat[gstat['n'] >= 5]
group_stats = {f'{dx}||{tx}': [int(r.n), round(r.med), round(r.p25), round(r.p75), float(r.los)]
               for (dx, tx), r in gstat.iterrows()}

# tindakan yang paling sering per diagnosis (untuk saran)
dx_tx = (gs.groupby(['dx', 'tx']).size().reset_index(name='n').sort_values('n', ascending=False)
           .groupby('dx').head(5).groupby('dx')['tx'].apply(list).to_dict())

ui = {
    'PrimaryDiagnosis2': options('PrimaryDiagnosis2'),
    'PrimaryMedicalTreatment': options('PrimaryMedicalTreatment'),
    'SecondaryDx1': [o for o in options('SecondaryDx1') if o[0] != 'Tidak Ada'],
    'SecondaryTx1': [o for o in options('SecondaryTx1') if o[0] != 'Tidak Ada'],
    'TreatmentPlaceChangeClean2': options('TreatmentPlaceChangeClean2'),
    'DoctorSpecialty': options('DoctorSpecialty'),
    'MappedRoomClass2': options('MappedRoomClass2'),
    'Membership': options('Membership'),
    'ClientName': options('ClientName'),
}

feature_index = {nm: i for i, nm in enumerate(feats)}

# ------------------------------------------------------------------ test vectors (untuk cek model.js)
tv_idx = X_test.index[:50]
tv_raw = Xr_test.loc[tv_idx].copy()
tv = {'raw': json.loads(tv_raw.astype(object).where(tv_raw.notna(), None).to_json(orient='records')),
      't': [float(x) for x in t_test.loc[tv_idx]],
      'expected_rp': [float(x) for x in to_rp(M_tuned, X_test.loc[tv_idx], t_test.loc[tv_idx])]}

payload = {
    'version': 1,
    'meta': {'inflation_mode': INFLATION_MODE, 'inflation_rate': float(RATE), 't_base': float(T_BASE),
             'smear': float(M_tuned['smear']), 'base_score': base_score, 'n_trees': len(trees),
             'n_train': int(len(X_train)), 'levels': ['Murah', 'Menengah', 'Mahal'],
             'bins': [50e6, 200e6]},
    'features': feats, 'spec': spec,
    'trees': trees,
    'interval': {'edges': [float(e) for e in edges], 'buckets': iv},
    'ui': ui, 'hosp_attr': hosp_attr, 'tx_cat': tx_cat,
    'dx_specialty': mode_map('PrimaryDiagnosis2', 'DoctorSpecialty'),
    'dx_tx': dx_tx, 'group_stats': group_stats,
    'test_vectors': tv,
}
out_path = os.path.join(OUT_DIR, 'model.json')
with open(out_path, 'w', encoding='utf-8') as fh:
    json.dump(payload, fh, ensure_ascii=False, separators=(',', ':'))
print(f'[selesai] {out_path}  ({os.path.getsize(out_path)/1e6:.1f} MB, {len(trees)} pohon, {len(feats)} fitur)')
