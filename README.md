# ✈️ 3D Uçak Portfolyo

Three.js tabanlı, uçakla gezilebilir interaktif portfolyo sitesi. Low-poly pastel bir ada dünyasında uçarak projeler, özgeçmiş, iletişim ve yetenekler bölümlerini keşfedersin.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ klasörüne statik çıktı (Vercel/Netlify/GitHub Pages uyumlu)
```

## İçeriği Güncelleme

Tüm portfolyo içeriği **tek dosyada**: [`src/data/content.js`](src/data/content.js)

- `profile` — isim, unvan, slogan, CV dosya yolu
- `projects` — projeler (her biri Projeler Adası'nda bir hangar olur; başlık, açıklama, teknolojiler, görsel, linkler)
- `about` — biyografi + zaman çizelgesi (her madde adada bir taş platform olur)
- `skills` — yetenek grupları (adada rozet sütunları)
- `contact` — e-posta + sosyal linkler
- `islandLayout` — ada adları, renkleri ve konumları

Görseller ve CV için `public/` klasörünü kullan (örn. `public/cv.pdf` → `cvUrl: '/cv.pdf'`).

## Kontroller

| Girdi | İşlev |
|---|---|
| W/S veya ↑/↓ | Burun yukarı / aşağı |
| A/D veya ←/→ | Sola / sağa dönüş (otomatik yatış) |
| Boşluk / Shift | Gaz / yavaşlama |
| E | Yaklaşılan noktayla etkileşim |
| C | Kokpit ↔ dış kamera |
| Esc | Paneli kapat |
| Shift ile yavaşla + alçal | Ada yüzeyine **iniş** (park halinde kartları oku) |
| Boşluk (yerde basılı tut) | Kalkış koşusu → havalanma |

Mobilde: sol sanal joystick (yön), sağ gaz kolu, ekran butonları.

## Mimari

```
src/
  data/content.js    → TÜM içerik (tek düzenleme noktası)
  scene/             → gökyüzü, deniz, ışık, prosedürel adalar, dünya montajı
  plane/             → uçak modeli, girdi, arcade uçuş fiziği, takip kamerası
  ui/                → HUD, mini harita, paneller, menü, mobil kontroller, ses, yükleme
  main.js            → oyun döngüsü + tüm modüllerin bağlanması
```

Notlar:
- Tüm 3D modeller prosedürel (harici GLB/texture yok) → anında yükleme, sıfır asset bağımlılığı
- Bloom + fog post-processing; FPS düşerse otomatik kalite düşürme (bloom → çözünürlük → gölgeler)
- Motor sesi WebAudio ile prosedürel; varsayılan kapalı, sağ üstteki 🔇 ile açılır
- Fon müziği: `public/runaway.mp3` (veya `content.js` → `settings.musicUrl`'de belirttiğin dosya) eklenirse ses açıkken loop halinde çalar; dosya yoksa sessizce atlanır. Yayınlanacak sitede telifli parça için lisans gerekir
- `?nohint` URL parametresi karşılama kartını atlar (test için)
