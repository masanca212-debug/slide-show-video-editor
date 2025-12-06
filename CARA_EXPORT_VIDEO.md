# 🎬 CARA EXPORT VIDEO

Panduan lengkap untuk export project menjadi file video MP4.

---

## ✨ FITUR EXPORT VIDEO

Aplikasi sekarang bisa export video dalam format **MP4** dengan:

✅ Semua gambar dengan efek animasi (zoom in/out)
✅ Background music dengan volume control
✅ Voiceover narration
✅ Custom resolution (720p, 1080p, 4K)
✅ Custom FPS (24, 30, 60)
✅ Processing 100% offline di browser

**Tidak perlu internet atau server eksternal!**

---

## 📹 LANGKAH EXPORT VIDEO

### 1. Buka Project

- Buka project yang sudah ada gambar, musik, dan voiceover
- Pastikan semua asset sudah di-upload

### 2. Preview Video

- Klik tombol **"Export Video"** di pojok kanan atas
- Akan muncul jendela preview video
- Klik **Play** untuk melihat preview slideshow

### 3. Export ke MP4

- Klik tombol **"Export Video"** (hijau dengan icon Film)
- Tunggu proses rendering:
  1. **Initializing FFmpeg** - Load video processor (20-30 detik)
  2. **Rendering frames** - Render setiap frame gambar dengan efek
  3. **Processing audio** - Gabungkan musik dan voiceover
  4. **Encoding video** - Buat file MP4 final
  5. **Downloading video** - Download otomatis

### 4. Selesai!

- File MP4 akan otomatis terdownload
- Nama file: `[Nama Project].mp4`
- Bisa langsung diputar di semua media player
- Ready untuk diupload ke YouTube, Instagram, TikTok, dll

---

## ⏱️ BERAPA LAMA PROSES RENDERING?

Waktu rendering tergantung dari:

- **Durasi video:** Semakin panjang, semakin lama
- **Resolusi:** 4K lebih lama dari 1080p
- **FPS:** 60fps lebih lama dari 30fps
- **Jumlah gambar:** Semakin banyak, semakin lama
- **Spesifikasi komputer:** RAM dan CPU berpengaruh

**Estimasi waktu:**

| Durasi Video | Resolusi | Estimasi Waktu |
|--------------|----------|----------------|
| 30 detik     | 1080p    | 1-2 menit      |
| 1 menit      | 1080p    | 2-4 menit      |
| 2 menit      | 1080p    | 4-8 menit      |
| 30 detik     | 4K       | 3-5 menit      |
| 1 menit      | 4K       | 6-10 menit     |

---

## 🎨 EFEK YANG DI-RENDER

Semua efek gambar akan di-render ke video:

- **None** - Gambar statis
- **Zoom In** - Gambar zoom in pelan-pelan (Ken Burns effect)
- **Zoom Out** - Gambar zoom out pelan-pelan
- **Pan Left/Right** - (Coming soon)
- **Fade In/Out** - (Coming soon)

---

## 🎵 AUDIO MIXING

Sistem akan otomatis menggabungkan:

1. **Background Music** - Semua track musik di-mix jadi satu
2. **Voiceover** - Narasi voice di-overlay di atas musik
3. **Volume Control** - Sesuai setting volume masing-masing

**Audio akan:**
- Start dari detik 0
- Sync dengan video
- Di-mix dengan kualitas tinggi
- Format MP3 atau WAV

---

## 📊 PROGRESS BAR

Saat rendering, kamu akan lihat:

```
Rendering frames... 45%
████████████░░░░░░░░░░░░░░

Please wait, this may take a few minutes depending on video length...
```

**Jangan tutup browser** saat proses rendering!

---

## ⚙️ SETTINGS EXPORT

Sebelum export, pastikan setting project sudah sesuai:

1. **Resolution:**
   - 1280x720 (HD)
   - 1920x1080 (Full HD) ⭐ Recommended
   - 3840x2160 (4K)

2. **Frame Rate:**
   - 24 fps (Cinematic)
   - 30 fps (Standard) ⭐ Recommended
   - 60 fps (Smooth)

3. **Duration:**
   - Otomatis dihitung dari total durasi semua gambar

---

## 💡 TIPS EXPORT CEPAT

### 1. Gunakan Resolusi Optimal

- **Instagram/TikTok:** 1080p sudah cukup
- **YouTube:** 1080p recommended, 4K optional
- **Facebook:** 720p sudah oke

### 2. Pilih FPS yang Tepat

- **Slideshow:** 24 fps atau 30 fps
- **Smooth motion:** 60 fps (tapi render lebih lama)

### 3. Optimalkan Durasi

- Jangan terlalu panjang untuk export pertama
- Test dengan video 30 detik dulu
- Durasi ideal: 30-120 detik

### 4. Tutup Tab Lain

- Browser butuh banyak RAM untuk rendering
- Tutup tab yang tidak dipakai
- Jangan buka aplikasi berat lain

### 5. Gunakan Browser Modern

- **Chrome** (Recommended) ✅
- **Edge** (Recommended) ✅
- **Firefox** (OK) ⚠️
- Safari (Tidak di-test) ❌

---

## ❗ TROUBLESHOOTING

### Export Gagal?

**Solusi:**

1. **Refresh halaman** dan coba lagi
2. **Tutup tab lain** untuk free up memory
3. **Restart browser** untuk clear cache
4. **Kurangi resolusi** (dari 4K ke 1080p)
5. **Kurangi FPS** (dari 60 ke 30)

### Video Tidak Ada Audio?

**Cek:**

- Sudah upload musik/voiceover belum?
- Format audio: MP3 atau WAV
- Volume tidak di-set ke 0

### Proses Terlalu Lama?

**Lakukan:**

- Jangan panic, ini normal untuk video panjang
- Cek progress bar, pastikan masih jalan
- Tunggu sampai selesai (bisa 5-10 menit)
- Jika stuck lebih dari 15 menit, refresh

### Browser Freeze?

**Solusi:**

1. Tunggu 30 detik dulu
2. Jika masih freeze, close tab
3. Buka lagi aplikasi
4. Coba export dengan durasi lebih pendek

---

## 🚀 HASIL EXPORT

File video yang di-download:

- **Format:** MP4 (H.264)
- **Codec Video:** libx264
- **Codec Audio:** AAC
- **Quality:** CRF 23 (high quality)
- **Preset:** Medium (balance speed & quality)

**Video siap untuk:**

✅ Upload ke YouTube
✅ Upload ke Instagram
✅ Upload ke TikTok
✅ Upload ke Facebook
✅ Kirim via WhatsApp (kalau tidak terlalu besar)
✅ Email (kalau kurang dari 25 MB)
✅ Upload ke Google Drive / Dropbox

---

## 📱 SHARE KE SOCIAL MEDIA

### YouTube

1. Export video dalam 1080p atau 4K
2. Buka YouTube Studio
3. Upload video
4. Tambahkan title, description, tags
5. Publish!

### Instagram

1. Export video 1080p (1080x1080 square atau 1080x1920 portrait)
2. Durasi max: 60 detik untuk feed, 90 detik untuk reel
3. Upload via Instagram app

### TikTok

1. Export video 1080x1920 (portrait)
2. Durasi max: 10 menit
3. Upload via TikTok app

---

## 🔒 PRIVASI & KEAMANAN

✅ **100% Offline Processing**
- Semua rendering di browser, tidak ke server
- File tidak diupload ke cloud
- Data aman di komputer kamu

✅ **No Account Required**
- Tidak perlu login
- Tidak perlu internet (kecuali download pertama kali)

✅ **Open Source**
- Menggunakan FFmpeg WebAssembly
- Transparent, no hidden code

---

## 🎓 VIDEO TUTORIAL

Coming soon: Video tutorial lengkap cara export video!

---

Selamat mencoba export video! 🎉

**Happy Creating!** 🎬
