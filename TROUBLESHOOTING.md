# 🔧 TROUBLESHOOTING - VIDEO EXPORT

Panduan mengatasi masalah saat export video.

---

## ❌ ERROR: "Export failed. Try again"

### Penyebab Umum:

1. **FFmpeg gagal di-download**
2. **Browser tidak support SharedArrayBuffer**
3. **Koneksi internet terputus**
4. **Memory browser tidak cukup**

### Solusi:

#### 1. Refresh Browser

```
1. Close tab aplikasi
2. Buka browser baru
3. Clear cache (Ctrl+Shift+Delete)
4. Buka aplikasi lagi
5. Coba export lagi
```

#### 2. Gunakan Browser yang Didukung

**Recommended:**
- ✅ Google Chrome (versi 92+)
- ✅ Microsoft Edge (versi 92+)
- ⚠️ Firefox (versi 89+) - Bisa, tapi lebih lambat
- ❌ Safari - Tidak di-test

**Cara Cek Versi Chrome:**
```
1. Buka Chrome
2. Klik titik 3 di pojok kanan atas
3. Help → About Google Chrome
4. Pastikan versi 92 atau lebih baru
```

#### 3. Aktifkan HTTPS/Secure Context

FFmpeg WebAssembly butuh secure context (HTTPS).

**Development:**
- Vite dev server sudah auto HTTPS
- Tidak perlu setting apa-apa

**Production/Hosting:**
- HARUS pakai HTTPS
- Tidak bisa pakai HTTP biasa
- Free HTTPS: Netlify, Vercel, Cloudflare Pages

#### 4. Cek Console untuk Error Detail

```
1. Buka browser
2. Tekan F12 (DevTools)
3. Klik tab "Console"
4. Coba export lagi
5. Lihat error message yang muncul
```

**Error Messages Umum:**

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Failed to fetch` | FFmpeg tidak bisa di-download | Cek koneksi internet |
| `SharedArrayBuffer is not defined` | Browser tidak support | Update browser |
| `Out of memory` | RAM tidak cukup | Tutup tab lain, atau kurangi resolusi |
| `CORS error` | CORS policy issue | Refresh browser, atau gunakan HTTPS |

---

## 🐌 EXPORT TERLALU LAMBAT

### Normal Speed:

- **30 detik video:** 1-2 menit render
- **1 menit video:** 2-5 menit render
- **2 menit video:** 5-10 menit render

### Jika Lebih Lambat dari Itu:

#### 1. Tutup Tab Lain

Browser butuh banyak RAM untuk rendering.

```
1. Close semua tab browser lain
2. Close aplikasi berat (Photoshop, video editor, dll)
3. Restart browser
4. Coba lagi
```

#### 2. Kurangi Resolusi

```
Settings → Resolution
- 4K (3840x2160) → 1080p (1920x1080)
- 1080p → 720p (1280x720)

Hasil: Render 2-3x lebih cepat
```

#### 3. Kurangi FPS

```
Settings → Frame Rate
- 60 fps → 30 fps
- 30 fps → 24 fps

Hasil: Render 2x lebih cepat
```

#### 4. Kurangi Durasi

```
- Jangan terlalu banyak gambar
- Kurangi durasi tiap gambar
- Split jadi beberapa video pendek
```

#### 5. Upgrade Hardware

**Minimum Spec:**
- RAM: 4GB
- CPU: Intel i3 atau setara
- Browser: Chrome 92+

**Recommended Spec:**
- RAM: 8GB+ (16GB ideal)
- CPU: Intel i5/i7 atau Ryzen 5/7
- Browser: Chrome 120+ (latest)

---

## 🎵 VIDEO TIDAK ADA AUDIO

### Penyebab:

1. Belum upload musik/voiceover
2. Format audio tidak didukung
3. Volume di-set 0
4. Audio corrupted

### Solusi:

#### 1. Cek Upload Audio

```
1. Buka project
2. Tab "Music" - pastikan ada file musik
3. Tab "Voice Over" - pastikan ada file voiceover
4. Klik Play untuk test audio
```

#### 2. Gunakan Format Audio yang Didukung

**Format yang Didukung:**
- ✅ MP3
- ✅ WAV
- ✅ M4A
- ⚠️ OGG (kadang bermasalah)
- ❌ FLAC (tidak didukung)

**Cara Convert Audio:**
```
1. Buka https://cloudconvert.com/
2. Upload file audio
3. Convert ke MP3
4. Download hasil convert
5. Upload ke aplikasi
```

#### 3. Cek Volume Setting

```
1. Buka project
2. Tab "Music" → Cek slider volume (0-100)
3. Tab "Voice Over" → Cek slider volume
4. Set minimal 50-80 untuk audio terdengar jelas
```

#### 4. Re-upload Audio

```
1. Delete audio yang ada
2. Upload ulang file audio
3. Test dengan klik Play
4. Export lagi
```

---

## 🖼️ GAMBAR TIDAK MUNCUL / BLANK

### Penyebab:

1. Format gambar tidak didukung
2. File size terlalu besar
3. Gambar corrupted

### Solusi:

#### 1. Gunakan Format Gambar yang Didukung

**Format yang Didukung:**
- ✅ JPG/JPEG
- ✅ PNG
- ✅ WEBP
- ⚠️ GIF (statis only)
- ❌ SVG (tidak didukung)

#### 2. Compress Gambar Jika Terlalu Besar

**Max Size Recommended:** 5MB per gambar

**Cara Compress:**
```
1. Buka https://tinypng.com/
2. Upload gambar
3. Download hasil compress
4. Upload ke aplikasi
```

#### 3. Re-upload Gambar

```
1. Delete gambar yang bermasalah
2. Upload ulang
3. Set durasi & efek
4. Test dengan preview
```

---

## 💾 VIDEO TIDAK TER-DOWNLOAD

### Penyebab:

1. Browser block download
2. Disk space penuh
3. Download folder tidak accessible

### Solusi:

#### 1. Allow Download di Browser

**Chrome:**
```
1. Klik icon lock di address bar
2. Site settings
3. Additional permissions
4. Automatic downloads → Allow
5. Refresh page
```

#### 2. Cek Disk Space

```
Windows: Settings → System → Storage
Mac: Apple Menu → About This Mac → Storage

Pastikan minimal 500MB free space
```

#### 3. Ganti Download Folder

**Chrome:**
```
Settings → Downloads → Location → Change
Pilih folder yang accessible
```

#### 4. Manual Download

Jika auto download gagal:
```
1. Setelah render selesai
2. Right click di video player
3. Save video as...
4. Pilih lokasi download
```

---

## 🔥 BROWSER CRASH / FREEZE

### Penyebab:

1. RAM tidak cukup
2. Video terlalu panjang
3. Terlalu banyak tab terbuka

### Solusi:

#### 1. Close Tab Lain

```
1. Close SEMUA tab lain
2. Close aplikasi berat
3. Restart browser
4. Buka aplikasi
5. Coba export dengan video lebih pendek (30-60 detik)
```

#### 2. Clear Browser Cache

**Chrome:**
```
1. Ctrl+Shift+Delete
2. Time range: All time
3. Check: Cached images and files
4. Clear data
5. Restart browser
```

#### 3. Disable Extensions

```
1. Chrome → Extensions
2. Disable semua extension
3. Restart browser
4. Coba lagi
```

#### 4. Increase Browser Memory

**Chrome Flags:**
```
1. Buka chrome://flags
2. Cari "memory"
3. Enable: "Enable memory saver mode"
4. Restart browser
```

#### 5. Split Video Jadi Lebih Pendek

Daripada 1 video 5 menit:
```
→ Split jadi 5 video @ 1 menit
→ Export satu-satu
→ Gabung pakai video editor
```

---

## 🌐 NETWORK ERROR

### Error: "Failed to fetch FFmpeg"

#### Penyebab:

1. Koneksi internet terputus
2. CDN (unpkg/jsdelivr) down
3. Firewall/proxy block

#### Solusi:

#### 1. Cek Koneksi Internet

```
1. Buka google.com
2. Pastikan internet lancar
3. Test speed: fast.com (minimal 1 Mbps)
4. Coba lagi
```

#### 2. Gunakan Network Lain

```
- WiFi rumah → Mobile hotspot
- Mobile data → WiFi cafe/kantor
- VPN → No VPN
```

#### 3. Disable Firewall Sementara

**Windows Defender:**
```
1. Settings → Privacy & Security
2. Windows Security → Firewall
3. Turn off (sementara)
4. Coba export
5. Turn on lagi
```

**Antivirus:**
```
1. Disable antivirus sementara
2. Coba export
3. Enable lagi
```

#### 4. Wait & Retry

Kadang CDN down sementara:
```
1. Tunggu 5-10 menit
2. Refresh browser
3. Coba lagi
```

---

## 🎬 HASIL VIDEO JELEK / PATAH-PATAH

### Penyebab:

1. FPS terlalu rendah
2. Compression terlalu tinggi
3. Sumber gambar low quality

### Solusi:

#### 1. Tingkatkan FPS

```
Settings → Frame Rate
- 24 fps → 30 fps
- 30 fps → 60 fps

Smooth motion, tapi render lebih lama
```

#### 2. Tingkatkan Resolution

```
Settings → Resolution
- 720p → 1080p
- 1080p → 4K

Lebih tajam, tapi file size lebih besar
```

#### 3. Gunakan Gambar Berkualitas Tinggi

```
- Minimal 1920x1080 resolution
- Format PNG untuk gambar dengan text
- Format JPG quality 90+ untuk foto
```

---

## 📱 HASIL VIDEO TIDAK BISA DIUPLOAD KE SOCIAL MEDIA

### Instagram

**Requirements:**
- Resolution: 1080x1080 (square) atau 1080x1920 (portrait)
- Duration: Max 60 detik (feed), 90 detik (reel)
- File size: Max 100MB

**Solusi:**
```
Settings project:
- Width: 1080
- Height: 1920 (untuk reel)
- FPS: 30
- Duration: Max 60 detik
```

### TikTok

**Requirements:**
- Resolution: 1080x1920 (portrait)
- Duration: Max 10 menit
- File size: Max 287.6MB

**Solusi:**
```
Settings project:
- Width: 1080
- Height: 1920
- FPS: 30
```

### YouTube

**Requirements:**
- Resolution: Any (recommended 1080p atau 4K)
- Duration: No limit
- File size: Max 256GB

**Solusi:**
```
Settings project:
- Width: 1920
- Height: 1080
- FPS: 30 atau 60
```

---

## 🆘 MASIH GAGAL?

### Last Resort:

#### 1. Reset Browser

```
Chrome → Settings → Reset settings
→ Restore settings to their original defaults
→ Reset settings
```

#### 2. Reinstall Browser

```
1. Uninstall Chrome
2. Download dari chrome.google.com
3. Install ulang
4. Coba lagi
```

#### 3. Gunakan Komputer Lain

Kemungkinan masalah di hardware:
```
- Coba di komputer/laptop lain
- Atau gunakan komputer dengan spec lebih tinggi
```

#### 4. Export Alternatif

Jika FFmpeg WebAssembly tidak work:
```
1. Export project as JSON (backup)
2. Gunakan desktop video editor:
   - DaVinci Resolve (free)
   - OpenShot (free)
   - Shotcut (free)
3. Import gambar & audio manual
4. Export dari sana
```

---

## 📞 BUTUH BANTUAN?

Jika masih bermasalah:

1. **Check Console Error** (F12)
2. **Screenshot error message**
3. **Catat:**
   - Browser & versi
   - OS & versi
   - Durasi video
   - Resolution
   - File size gambar & audio

---

**Good luck!** 🚀
