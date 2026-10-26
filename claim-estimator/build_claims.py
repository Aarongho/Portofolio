import json, numpy as np, pandas as pd
Xr = pd.concat([pd.read_parquet('X_train_raw.parquet'), pd.read_parquet('X_test_raw.parquet')])
y  = pd.concat([pd.read_parquet('y_train.parquet'), pd.read_parquet('y_test.parquet')])
assert (Xr.index == y.index).all()
amt = np.round(np.expm1(y['reg'].values)).astype(np.int64)
d = {}
cols = {}
for key, col in [('dx', 'PrimaryDiagnosis2'), ('tx', 'PrimaryMedicalTreatment'), ('h', 'TreatmentPlaceChangeClean2'),
                 ('r', 'MappedRoomClass2')]:
    vals = Xr[col].astype(str)
    cats = vals.value_counts().index.tolist()
    m = {c: i for i, c in enumerate(cats)}
    d[key] = cats; cols[key] = vals.map(m).astype(int).tolist()
cols['los'] = Xr['LOS'].astype(int).tolist()
cols['ym']  = (Xr['TreatmentYear'].astype(int) * 12 + Xr['TreatmentMonth'].astype(int) - 1).tolist()
cols['icu'] = Xr['isICU'].astype(int).tolist()
cols['ods'] = Xr['ODS/ODC'].astype(int).tolist()
cols['nsd'] = Xr['NumSecondaryDx'].astype(int).tolist()
cols['amt'] = amt.tolist()
json.dump({'version': 1, 'n': len(Xr), 'dict': d, 'cols': cols}, open('web_model/claims.json', 'w'),
          ensure_ascii=False, separators=(',', ':'))
import os; print(len(Xr), os.path.getsize('web_model/claims.json') / 1e6, 'MB')
