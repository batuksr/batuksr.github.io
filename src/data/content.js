// ============================================================
// İÇERİK YAPILANDIRMASI
// Tüm portfolyo içeriği bu dosyadan yönetilir.
// Yeni proje eklemek, biyografi güncellemek, link değiştirmek
// için SADECE bu dosyayı düzenlemen yeterli.
// ============================================================

export const profile = {
  name: 'Batuhan',
  title: 'GIS & Saha Teknolojileri Uzmanı',
  tagline: 'Harita, veri ve saha teknolojileriyle gerçek dünya problemlerine çözüm üretiyorum.',
  // CV dosyasını public/ klasörüne koy (örn. public/cv.pdf) ve yolu güncelle:
  cvUrl: '/cv.pdf',
};

// --- PROJELER ---------------------------------------------------
// Her proje, Projeler Adası'nda ayrı bir hangar olarak görünür.
// image: public/ klasörüne koyduğun görselin yolu (opsiyonel, boş bırakılabilir)
export const projects = [
  {
    title: 'Örnek Proje 1 — Saha Veri Toplama Uygulaması',
    description:
      'Placeholder açıklama: Saha ekiplerinin çevrimdışı çalışabildiği, konum tabanlı veri toplama ve senkronizasyon uygulaması.',
    tech: ['QGIS', 'PostGIS', 'JavaScript', 'Leaflet'],
    image: '',
    links: { live: '', github: 'https://github.com/kullanici/proje1' },
  },
  {
    title: 'Örnek Proje 2 — Web Tabanlı Harita Panosu',
    description:
      'Placeholder açıklama: Gerçek zamanlı sensör verilerini harita üzerinde görselleştiren interaktif pano.',
    tech: ['OpenLayers', 'Vue', 'GeoServer'],
    image: '',
    links: { live: 'https://example.com', github: '' },
  },
  {
    title: 'Örnek Proje 3 — Drone Ortofoto İşleme Hattı',
    description:
      'Placeholder açıklama: İHA görüntülerinden otomatik ortofoto ve sayısal yüzey modeli üreten işleme hattı.',
    tech: ['Python', 'GDAL', 'OpenDroneMap'],
    image: '',
    links: { live: '', github: 'https://github.com/kullanici/proje3' },
  },
  {
    title: 'Örnek Proje 4 — Bu 3D Portfolyo',
    description:
      'Three.js ile geliştirilen, uçakla gezilebilir interaktif portfolyo deneyimi. Şu an içindesin! ✈️',
    tech: ['Three.js', 'Vite', 'JavaScript'],
    image: '',
    links: { live: '', github: '' },
  },
];

// --- HAKKIMDA ----------------------------------------------------
export const about = {
  bio: 'Placeholder biyografi: Coğrafi bilgi sistemleri ve saha teknolojileri alanında çalışıyorum. Harita üretiminden mobil veri toplamaya, mekânsal analizden web haritacılığına uzanan projelerde yer aldım.',
  timeline: [
    { year: '2024 — Bugün', title: 'GIS Uzmanı — Örnek Kurum', desc: 'Placeholder: Mekânsal veri altyapısı ve saha operasyonları.' },
    { year: '2022 — 2024', title: 'Saha Teknolojileri Sorumlusu — Örnek Şirket', desc: 'Placeholder: Drone haritalama ve veri toplama süreçleri.' },
    { year: '2018 — 2022', title: 'Lisans — Örnek Üniversite', desc: 'Placeholder: Harita / Geomatik Mühendisliği.' },
  ],
};

// --- YETENEKLER --------------------------------------------------
export const skills = [
  { group: 'GIS & Harita', items: ['QGIS', 'ArcGIS', 'PostGIS', 'GeoServer', 'GDAL'] },
  { group: 'Web & Kod', items: ['JavaScript', 'Python', 'Leaflet', 'OpenLayers', 'Three.js'] },
  { group: 'Saha', items: ['GNSS/RTK', 'Drone (İHA)', 'Mobil Veri Toplama', 'Fotogrametri'] },
];

// --- İLETİŞİM ----------------------------------------------------
export const contact = {
  email: 'batuksr75@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/kullanici', icon: '🐙' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/kullanici', icon: '💼' },
    { label: 'E-posta', url: 'mailto:batuksr75@gmail.com', icon: '✉️' },
  ],
};

// --- MÜZİK -------------------------------------------------------
// Müzik dosyasını public/ klasörüne koy (örn. public/runaway.mp3).
// Telifli müzik kullanacaksan dosyayı kendin temin etmelisin;
// yayınlanan bir sitede telifli parça çalmak lisans gerektirir.
export const settings = {
  musicUrl: '/runaway.mp3',
  musicVolume: 0.35,
};

// --- ADA YERLEŞİMİ ----------------------------------------------
// position: [x, z] dünya koordinatı. color: adanın vurgu rengi.
// Sıralamayı/konumu değiştirebilirsin; sistem otomatik uyum sağlar.
export const islandLayout = [
  { id: 'home',     name: 'Ana Üs',      color: '#f2c94c', position: [0, 0] },
  { id: 'projects', name: 'Projeler',    color: '#f4874b', position: [230, -110] },
  { id: 'about',    name: 'Hakkımda',    color: '#9b8ce0', position: [-230, -140] },
  { id: 'contact',  name: 'İletişim',    color: '#ef7d8e', position: [-90, 235] },
  { id: 'skills',   name: 'Yetenekler',  color: '#5bbfad', position: [200, 190] },
];
