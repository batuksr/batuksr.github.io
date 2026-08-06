// ============================================================
// İÇERİK YAPILANDIRMASI
// Tüm portfolyo içeriği bu dosyadan yönetilir.
// Yeni proje eklemek, biyografi güncellemek, link değiştirmek
// için SADECE bu dosyayı düzenlemen yeterli.
// ============================================================

export const profile = {
  name: 'Batuhan Keser',
  title: 'Full Stack Developer | Bilgisayar Mühendisliği Öğrencisi',
  tagline: 'ASP.NET Core ile kurumsal web uygulamaları, React ve TypeScript ile modern arayüzler geliştiriyorum.',
  // CV dosyasını public/ klasörüne koy (örn. public/cv.pdf) ve yolu güncelle:
  cvUrl: '/cv.pdf',
};

// --- PROJELER ---------------------------------------------------
// Her proje, Projeler Adası'nda ayrı bir hangar olarak görünür.
// image: public/ klasörüne koyduğun görselin yolu (opsiyonel, boş bırakılabilir)
export const projects = [
  {
    title: 'Travyon — Yapay Zeka Destekli Seyahat Planlayıcı',
    description:
      'Kullanıcının seyahat amacı, tempo ve bütçe tercihlerini profilleyerek kişiye özel günlük seyahat planı üreten web uygulaması. Haversine ön filtreleme + greedy nearest-neighbor ve 2-opt iyileştirmesiyle rota optimizasyonu; Firebase Authentication/Firestore ve Gemini API entegrasyonu; PWA desteğiyle çevrimdışı kullanım ve PDF dışa aktarım.',
    tech: ['React 19', 'TypeScript', 'Firebase', 'Gemini API', 'Google Maps'],
    image: '',
    links: { live: 'https://travyon-5fb01.web.app', github: 'https://github.com/batuksr/Travyon' },
  },
  {
    title: 'Lojman Çekiliş Sitesi — Ardahan Üniversitesi Stajı',
    description:
      'Yazılım geliştirme stajım kapsamında uçtan uca geliştirdiğim, kurum personelinin lojman başvuru, puanlama ve çekiliş süreçlerini yöneten ASP.NET Core MVC uygulaması. Microsoft Identity ile rol tabanlı yetkilendirme, interface tabanlı puanlama servisi, SMTP bildirimleri ve TR/EN yerelleştirme içerir.',
    tech: ['ASP.NET Core MVC', 'Entity Framework Core', 'MS SQL Server', 'Identity'],
    image: '',
    links: { live: '', github: 'https://github.com/batuksr/Housing-Lottery' },
  },
  {
    title: 'Hubit Sprinti — 3B Konya Şehir Deneyimi',
    description:
      'Divizyon Açık İnovasyon Platformu\'nun Hubit Sprinti\'nde 8 kişilik disiplinler arası ekipte frontend developer olarak görev aldım. Konya\'nın simge yapılarının 3B gezilebildiği web deneyiminde sahne kurulumu, kamera ve gezinme kontrollerini geliştirdim.',
    tech: ['Three.js', 'JavaScript'],
    image: '',
    links: { live: '', github: '' },
  },
  {
    title: 'Image Processing Studio',
    description:
      'Tarayıcı üzerinden görüntü işleme operasyonlarının uygulanabildiği Flask tabanlı web uygulaması; Render üzerinde yayına alınacak şekilde yapılandırdım.',
    tech: ['Python', 'Flask', 'Render'],
    image: '',
    links: { live: '', github: 'https://github.com/batuksr/image-processing-studio' },
  },
  {
    title: 'Kişisel Portfolyo Sitesi',
    description:
      'Three.js ile gezinilebilir 3B sahne olarak tasarladığım, tamamen prosedürel üretilmiş (harici model/texture dosyası yok) kişisel portfolyo sitesi. Şu an içindesin! ✈️',
    tech: ['Three.js', 'Vite', 'JavaScript'],
    image: '',
    links: { live: 'https://batuksr.github.io', github: 'https://github.com/batuksr/batuksr.github.io' },
  },
];

// --- HAKKIMDA ----------------------------------------------------
export const about = {
  bio: 'Selçuk Üniversitesi Bilgisayar Mühendisliği 4. sınıf öğrencisiyim (beklenen mezuniyet: Haziran 2027, GNO 3.20/4.00). Hem ASP.NET Core ile kurumsal web uygulamaları hem de React ve TypeScript ile modern arayüzler geliştirdim; staj sürecimde bir kurum için başvuru, puanlama ve çekiliş süreçlerini yöneten web uygulamasını tek başıma uçtan uca geliştirdim. Full stack geliştirme alanında, deneyimli bir ekipten öğrenebileceğim uzun dönem bir staj arıyorum.',
  timeline: [
    { year: 'Haz — Tem 2025', title: 'Yazılım Geliştirme Stajyeri — Ardahan Üniversitesi', desc: 'Lojman başvuru, puanlama ve çekiliş sürecini yöneten ASP.NET Core MVC uygulamasını uçtan uca geliştirdim; Identity, EF Core ve MS SQL Server ile veri modelini kurdum.' },
    { year: '2025', title: 'Hubit Sprinti — 3B Konya Şehir Deneyimi', desc: 'Divizyon Açık İnovasyon Platformu\'nda 8 kişilik ekipte frontend developer olarak Three.js ile Konya\'nın simge yapılarının 3B gezilebilir sahnesini geliştirdim.' },
    { year: 'Bekleniyor: Haz 2027', title: 'Bilgisayar Mühendisliği (Lisans) — Selçuk Üniversitesi', desc: 'GNO 3.20/4.00 — Veri Yapıları ve Algoritmalar, Veritabanı Yönetim Sistemleri, Yazılım Mühendisliği ve Web Programlama derslerini aldım.' },
  ],
};

// --- YETENEKLER --------------------------------------------------
export const skills = [
  { group: 'Diller', items: ['C#', 'JavaScript', 'TypeScript', 'Python', 'SQL'] },
  { group: 'Backend', items: ['ASP.NET Core MVC', 'Entity Framework Core', 'LINQ', 'Flask', 'REST API'] },
  { group: 'Frontend', items: ['React', 'Three.js', 'Tailwind CSS', 'Zustand', 'HTML5/CSS3'] },
  { group: 'Veritabanı & Kimlik Doğrulama', items: ['MS SQL Server', 'Firebase Firestore', 'ASP.NET Identity', 'Firebase Authentication'] },
  { group: 'Araçlar & Yöntemler', items: ['Git & GitHub', 'Visual Studio / VS Code', 'Vite', 'Firebase Hosting', 'Agile / Scrum'] },
];

// --- İLETİŞİM ----------------------------------------------------
export const contact = {
  email: 'batuksr75@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/batuksr', icon: '🐙' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/batu-keser', icon: '💼' },
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
