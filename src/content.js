// Sitedeki tüm yazılar buradan yönetilir.
// [doldur] ile işaretli yerler geçici; CV'ndeki bilgilerle değiştir.

export const profile = {
  firstName: 'Batuhan',
  lastName: 'Keser',
  role: 'Yazılım geliştirici', // [doldur]
  location: 'Konya, Türkiye', // [doldur]
};

export const about = {
  // Scroll ile kelime kelime aydınlanan ana paragraf.
  lead:
    'Fikirleri çalışan ürünlere dönüştürüyorum. Arayüzün nasıl hissettirdiği de, arkasındaki sistemin nasıl çalıştığı da benim işim.', // [doldur]
  body:
    "Selçuk Üniversitesi Bilgisayar Mühendisliği 4. sınıf öğrencisiyim. Web ve mobil uygulamalar geliştiriyorum; arayüzden sunucu tarafına kadar bir ürünün her katmanıyla uğraşmayı seviyorum. Boş zamanlarımda 3B web deneyimleri ve oyun geliştirme üzerine çalışıyorum. Şu an deneyimli bir ekiple gerçek projelerde yer alabileceğim, uzun dönem bir staj arıyorum.",
};

// Öne çıkan proje: Projeler bölümünde kendi vitrinini alır. Bölüme gelince
// sayfa bu projenin renklerine (theme) bürünür, ekran görüntüleri yatay akar.
export const featured = {
  name: 'Tripyon',
  tagline: 'Yapay zeka destekli seyahat planlayıcı',
  summary:
    'Gideceğin yeri, tarihleri, bütçeni ve ilgi alanlarını seçersin, gün gün rotanı çıkarır. Planı haritada düzenleyebilir, uçuş ve otel bilgilerini, harcamalarını aynı yerde tutabilirsin.',
  meta: 'Flutter, Firebase ve Gemini ile. iPhone ve web için, 2026.',
  icon: '/projects/tripyon/icon.webp',
  links: {
    appStore: 'https://apps.apple.com/app/id6815606226',
    web: 'https://tripyon.com/',
  },
  // App Store ekran görüntüleri (public/projects/tripyon/)
  screens: [
    { src: '/projects/tripyon/01-map.webp', alt: 'Tripyon: şehri seç, günlerin haritada planlansın' },
    { src: '/projects/tripyon/02-route.webp', alt: 'Tripyon: günün tüm durakları tek rotada' },
    { src: '/projects/tripyon/03-wallet.webp', alt: 'Tripyon: uçuş, otel ve rezervasyonlar tek cüzdanda' },
    { src: '/projects/tripyon/04-community.webp', alt: 'Tripyon: diğer gezginlerin paylaştığı rotalar' },
    { src: '/projects/tripyon/05-budget.webp', alt: 'Tripyon: harcama ve bütçe takibi' },
    { src: '/projects/tripyon/06-checklist.webp', alt: 'Tripyon: yolculuk öncesi kontrol listesi' },
  ],
};

// "Diğer projeler" listesi, yukarıdan aşağı bu sırayla görünür.
// context: projenin nerede / kimle yapıldığı (boş bırakılabilir).
// year yerine status yazılırsa (ör. "Geliştiriliyor") o gösterilir.
// links.live / links.appStore / links.code boş bırakılabilir.
// color: kartın zemin rengi (koyu), accent: kartın vurgu rengi (açık).
export const projects = [
  {
    title: 'Lojman Çekiliş Sistemi',
    context: 'Ardahan Üniversitesi için',
    year: '2025',
    summary:
      'Personelin lojman başvurusunu, puanlamasını, çekilişini ve yerleşimini baştan sona yöneten web uygulaması. Rol bazlı giriş, otomatik puanlama, e-posta bildirimleri ve Türkçe/İngilizce arayüz.',
    tech: ['ASP.NET Core MVC', 'Entity Framework Core', 'SQL Server', 'Identity'],
    links: {},
    color: '#3a2320', accent: '#f2a27e', // tuğla
  },
  {
    title: 'InteraktifKredi',
    context: 'Fintech Jam, 3 kişilik ekip',
    year: '2025',
    summary:
      'TC kimlik no ve SMS koduyla giriş yapılan, kredi başvurusu ve finansal rapor ekranları olan bir web şube. Kullanıcı panelini, kredi başvuru ekranlarını ve ödeme geçmişini görselleştiren rapor sayfasını ben geliştirdim.',
    tech: ['.NET 8', 'Razor Pages', 'REST API', 'Bootstrap', 'SCSS'],
    links: { code: 'https://github.com/ofgurun/Fintech-134' },
    color: '#18284a', accent: '#8db4ff', // banka laciverti
  },
  {
    title: 'Hubit: Konya 3B',
    context: 'Divizyon Hubit Sprinti, ekip projesi',
    year: '2025',
    summary:
      'Yazılım ve dijital sanat ekipleriyle birlikte, Konya’da gençlerin buluştuğu mekânları tanıtan etkileşimli 3B web sahnesi. Stadyum, Japon parkı, konser alanı ve basket sahası gibi mekânları sahneye ben ekledim.',
    tech: ['Three.js', 'JavaScript', 'GLSL'],
    links: { code: 'https://github.com/Divizyon/t1-hubit' },
    color: '#29204a', accent: '#b9a8ff', // gece moru
  },
  {
    title: 'Soldier Party',
    context: 'Bir arkadaşımla, Steam için',
    status: 'Geliştiriliyor',
    summary:
      'Unity ile geliştirdiğimiz bir oyun. Lobideki askeri üssü, içine girilebilen kışla binalarını ve üçüncü şahıs kamerayı ben yapıyorum.',
    tech: ['Unity', 'C#'],
    links: {},
    color: '#2a2f1f', accent: '#cdd68c', // haki
  },
];

// Hakkımda ile Projeler arasında soldan sağa kayan beceri şeridi.
// Projelerinde kullandıklarından derlendi; ekle, çıkar, sırala.
export const skills = [
  'Flutter', 'Dart', 'Firebase', 'TypeScript', 'Gemini API', 'Google Maps',
  'C#', 'ASP.NET Core', 'Entity Framework', 'SQL Server',
  'JavaScript', 'Three.js', 'GLSL', 'Unity', 'Python', 'Git',
];

export const contact = {
  email: 'batuksr75@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/batuksr' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/batu-keser' },
  ],
};
