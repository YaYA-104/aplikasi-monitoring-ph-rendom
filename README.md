# Dashboard Monitoring pH Tanah Berbasis IoT

Aplikasi web statis untuk menampilkan data monitoring pH tanah, suhu tanah, dan kelembaban tanah dari prototype IoT berbasis ESP32 NodeMCU.

Versi ini sudah ditambahkan fitur:

- Login pengguna.
- Daftar akun baru.
- Proteksi halaman dashboard.
- Tombol logout.
- Akun demo otomatis.
- Siap upload ke GitHub.
- Siap deploy ke Vercel sebagai static site.

## Akun Demo

```text
Email: admin@phsoil.local
Password: admin123
```

## Struktur File

```text
monitoring-ph-tanah-auth-vercel/
├── index.html
├── login.html
├── register.html
├── style.css
├── script.js
├── data-ph-iot-random.csv
├── data-ph-iot-random.json
├── data-ph-iot-random.js
├── iot-simulator.js
├── vercel.json
├── package.json
├── .gitignore
├── .nojekyll
└── README.md
```

## Cara Menjalankan Lokal

Cara paling sederhana:

1. Buka `login.html` di browser.
2. Login memakai akun demo atau daftar akun baru.
3. Setelah login, sistem akan membuka `index.html`.

Atau jalankan dengan server lokal:

```bash
npm install
npm run dev
```

Lalu buka alamat yang muncul dari terminal, biasanya:

```text
http://localhost:3000
```

## Cara Upload ke GitHub

```bash
git init
git add .
git commit -m "Tambah login daftar dashboard monitoring ph tanah"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

Ganti `USERNAME` dan `NAMA-REPOSITORY` sesuai akun GitHub dan nama repository.

## Cara Deploy ke Vercel

1. Login ke Vercel.
2. Pilih **Add New Project**.
3. Import repository GitHub yang berisi proyek ini.
4. Framework pilih **Other** atau biarkan otomatis.
5. Build command boleh dikosongkan.
6. Output directory biarkan kosong atau isi `.`.
7. Klik **Deploy**.

## Catatan Penting

Fitur login dan daftar pada versi ini memakai `localStorage`, sehingga cocok untuk demo, presentasi, dan prototype static website.

Untuk sistem produksi yang benar-benar aman, gunakan backend autentikasi seperti Firebase Authentication, Supabase Auth, NextAuth, atau API backend sendiri. Jangan menyimpan password asli di localStorage untuk aplikasi produksi.


## Fitur Simulasi Data IoT Random

Versi ini sudah ditambahkan data pH random seolah-olah dibaca dari alat IoT ESP32.

File tambahan:

```text
data-ph-iot-random.csv
data-ph-iot-random.json
data-ph-iot-random.js
iot-simulator.js
```

Di dashboard tersedia tombol:

- **Buat 1 Data Random** untuk membuat satu data sensor baru.
- **Mulai Simulator Otomatis** untuk membuat data baru setiap 5 detik.
- **Download CSV Random** untuk mengambil dataset simulasi.
- **Download JSON Random** untuk mengambil dataset simulasi.

Catatan: data ini adalah data dummy/simulasi, bukan hasil sensor asli. Cocok untuk demo aplikasi, presentasi, dan pengujian tampilan dashboard.
