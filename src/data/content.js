// ============================================================
// İÇERİK YAPILANDIRMASI
// Tüm portfolyo içeriği bu dosyadan yönetilir.
// Yeni proje eklemek, biyografi güncellemek, link değiştirmek
// için SADECE bu dosyayı düzenlemen yeterli.
// ============================================================

export const profile = {
  name: 'Batuhan Keser',
  title: 'Bilgisayar Mühendisliği Öğrencisi & Full Stack Developer Adayı',
  tagline: 'ASP.NET Core ile backend mantığını, JavaScript ve Three.js ile frontend yaratıcılığını birleştiriyorum.',
  // CV dosyasını public/ klasörüne koy (örn. public/cv.pdf) ve yolu güncelle:
  cvUrl: '/cv.pdf',
};

// --- PROJELER ---------------------------------------------------
// Her proje, Projeler Adası'nda ayrı bir hangar olarak görünür.
// image: public/ klasörüne koyduğun görselin yolu (opsiyonel, boş bırakılabilir)
export const projects = [
  {
    title: 'Travyon — AI Destekli Seyahat Planlayıcı',
    description:
      'Kullanıcının tatil amacını, günlük temposunu ve tercihlerini öğrenip Haversine tabanlı rota optimizasyonuyla kişiselleştirilmiş günlük seyahat planları oluşturan yapay zeka destekli web uygulaması. Engineering Design dersi bitirme projesi.',
    tech: ['React', 'TypeScript', 'Firebase', 'Google Gemini API', 'Three.js'],
    image: '',
    links: { live: '', github: 'https://github.com/batuksr/Travyon' },
  },
  {
    title: 'Lojman Çekiliş Sitesi',
    description:
      'Kurumsal lojman başvurularını, puanlama hesaplamalarını, çekiliş süreçlerini ve yerleşim atamalarını uçtan uca yöneten ASP.NET Core MVC tabanlı web uygulaması.',
    tech: ['ASP.NET Core MVC', '.NET 9', 'Entity Framework Core', 'SQL Server'],
    image: '',
    links: { live: '', github: 'https://github.com/batuksr/Housing-Lottery' },
  },
  {
    title: 'Image Processing Studio',
    description:
      'Python/Flask ile geliştirilen, tarayıcı üzerinden görsel yükleyip çeşitli görüntü işleme operasyonlarını uygulamaya olanak tanıyan web uygulaması.',
    tech: ['Python', 'Flask'],
    image: '',
    links: { live: '', github: 'https://github.com/batuksr/image-processing-studio' },
  },
  {
    title: 'Bu 3D Portfolyo',
    description:
      'Three.js ile geliştirilen, uçakla gezilebilir, tamamen prosedürel üretilmiş (harici model/texture dosyası yok) interaktif portfolyo deneyimi. Şu an içindesin! ✈️',
    tech: ['Three.js', 'Vite', 'JavaScript'],
    image: '',
    links: { live: 'https://batuksr.github.io', github: 'https://github.com/batuksr/batuksr.github.io' },
  },
];

// --- HAKKIMDA ----------------------------------------------------
export const about = {
  bio: 'Selçuk Üniversitesi\'nde 3. sınıf Bilgisayar Mühendisliği öğrencisiyim. Hackathon\'lar, sprint\'ler ve gerçek dünya projeleriyle müfredatın ötesine geçmeye çalışıyorum. ASP.NET Core ile backend mantığını, JavaScript ve Three.js ile frontend yaratıcılığını birleştiriyor; full-stack geliştirme alanında staj fırsatları arıyorum.',
  timeline: [
    { year: 'Devam Ediyor', title: 'Bilgisayar Mühendisliği (3. Sınıf) — Selçuk Üniversitesi', desc: 'Müfredat dışı hackathon ve sprint\'lerle gerçek dünya projeleri geliştiriyorum.' },
    { year: 'Proje', title: 'Travyon — Bitirme Projesi', desc: 'Engineering Design dersi kapsamında geliştirilen, yapay zeka destekli seyahat planlama uygulaması.' },
    { year: 'Proje', title: 'Lojman Çekiliş Sitesi', desc: 'ASP.NET Core MVC ile geliştirilen kurumsal lojman başvuru ve çekiliş yönetim sistemi.' },
  ],
};

// --- YETENEKLER --------------------------------------------------
export const skills = [
  { group: 'Backend & Veritabanı', items: ['C#', '.NET Core', 'ASP.NET Core MVC', 'Entity Framework Core', 'SQL Server'] },
  { group: 'Frontend & Tasarım', items: ['JavaScript', 'TypeScript', 'React', 'Three.js', 'Tailwind CSS'] },
  { group: 'Araçlar & Diğer', items: ['Git', 'GitHub', 'VS Code', 'Python', 'Flask'] },
];

// --- İLETİŞİM ----------------------------------------------------
export const contact = {
  email: 'batuksr75@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/batuksr', icon: '🐙' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/batuhankeser', icon: '💼' },
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
