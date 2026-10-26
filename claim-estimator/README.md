# Estimasi Biaya Klaim Rawat Inap

Website statis untuk mengestimasi amount klaim rawat inap cashless dari diagnosis, tindakan, lama rawat, kelas kamar, rumah sakit, dan data pasien. Model XGBoost dijalankan langsung di browser (`model.js`), jadi tidak butuh server.

## Isi folder
- `index.html` — tampilan dan form input
- `model.js` — preprocessing + inference XGBoost di browser
- `export_web_model.py` — script untuk membuat `model.json` dari notebook Step 6
- `model.json` — model regression all-client (153.874 klaim rawat inap, data sampai 09/2026, inflasi medis 7,2%/tahun)

## Cara memperbarui model.json
1. Jalankan notebook Step 6 (regression + inflasi) sampai selesai.
2. Taruh `export_web_model.py` di folder notebook, lalu di cell terakhir jalankan:
   ```
   %run -i export_web_model.py
   ```
   Script mengecek otomatis bahwa encoding dan prediksi hasil export identik dengan model Python
   (`[cek 1]` dan `[cek 2]` harus lolos), lalu menulis `web_model/model.json`.
3. Upload `model.json` ke folder ini (`claim-estimator/`) lewat GitHub (Add file → Upload files).
4. Buka `https://aarongho.github.io/Portofolio/claim-estimator/` (tunggu ±1 menit setelah upload).

## Catatan
- Website ini publik, termasuk `model.json` (daftar diagnosis, tindakan, rumah sakit, dan rata-rata biaya yang dipakai model).
- Estimasi adalah hasil model dari klaim historis, bukan keputusan klaim. Rentang wajar = P10–P90 (sekitar 8 dari 10 klaim aktual masuk rentang).
