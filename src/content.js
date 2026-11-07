// Sitedeki tüm yazılar buradan yönetilir.
// İki dilli alanlar { tr: '...', en: '...' } şeklindedir; tek dilli
// (her iki dilde aynı) alanlar düz metin olarak kalabilir.

export const profile = {
  firstName: 'Batuhan',
  lastName: 'Keser',
  role: { tr: 'Full stack geliştirici', en: 'Full stack developer' },
  location: { tr: 'Konya, Türkiye', en: 'Konya, Turkey' },
};

export const about = {
  // Scroll ile kelime kelime aydınlanan ana paragraf.
  lead: {
    tr: 'Fikirleri çalışan ürünlere dönüştürüyorum. Arayüzün nasıl hissettirdiği de, arkasındaki sistemin nasıl çalıştığı da benim işim.',
    en: 'I turn ideas into working products. How the interface feels and how the system behind it works are both my job.',
  },
  body: {
    tr: 'Selçuk Üniversitesi Bilgisayar Mühendisliği 4. sınıf öğrencisiyim. Web ve mobil uygulamalar geliştiriyorum; arayüzden sunucu tarafına kadar bir ürünün her katmanıyla uğraşmayı seviyorum. Boş zamanlarımda 3B web deneyimleri ve oyun geliştirme üzerine çalışıyorum. Şu an deneyimli bir ekiple gerçek projelerde yer alabileceğim, uzun dönem bir staj arıyorum.',
    en: "I'm a senior Computer Engineering student at Selçuk University. I build web and mobile apps and enjoy working on every layer of a product, from the interface to the server. In my free time I work on 3D web experiences and game development. I'm currently looking for a long-term internship where I can work on real projects with an experienced team.",
  },
};

// Öne çıkan proje: Projeler bölümünde kendi vitrinini alır,
// ekran görüntüleri scroll ile yatay akar.
export const featured = {
  name: 'Tripyon',
  tagline: { tr: 'Yapay zeka destekli seyahat planlayıcı', en: 'AI-powered trip planner' },
  summary: {
    tr: 'Gideceğin yeri, tarihleri, bütçeni ve ilgi alanlarını seçersin, gün gün rotanı çıkarır. Planı haritada düzenleyebilir, uçuş ve otel bilgilerini, harcamalarını aynı yerde tutabilirsin.',
    en: 'Pick a destination, dates, budget and interests, and it maps out your trip day by day. Edit the plan on the map and keep your flights, hotels and spending in one place.',
  },
  meta: {
    tr: 'Flutter, Firebase ve Gemini ile. iPhone ve web için, 2026.',
    en: 'Built with Flutter, Firebase and Gemini. For iPhone and the web, 2026.',
  },
  icon: '/projects/tripyon/icon.webp',
  links: {
    appStore: 'https://apps.apple.com/app/id6815606226',
    web: 'https://tripyon.com/',
  },
  // App Store ekran görüntüleri (public/projects/tripyon/)
  screens: [
    { src: '/projects/tripyon/01-map.webp', alt: { tr: 'Tripyon: şehri seç, günlerin haritada planlansın', en: 'Tripyon: pick a city and get your days mapped out' } },
    { src: '/projects/tripyon/02-route.webp', alt: { tr: 'Tripyon: günün tüm durakları tek rotada', en: 'Tripyon: the whole day in one route' } },
    { src: '/projects/tripyon/03-wallet.webp', alt: { tr: 'Tripyon: uçuş, otel ve rezervasyonlar tek cüzdanda', en: 'Tripyon: all your bookings in one wallet' } },
    { src: '/projects/tripyon/04-community.webp', alt: { tr: 'Tripyon: diğer gezginlerin paylaştığı rotalar', en: 'Tripyon: routes shared by other travellers' } },
    { src: '/projects/tripyon/05-budget.webp', alt: { tr: 'Tripyon: harcama ve bütçe takibi', en: 'Tripyon: spending and budget tracking' } },
    { src: '/projects/tripyon/06-checklist.webp', alt: { tr: 'Tripyon: yolculuk öncesi kontrol listesi', en: 'Tripyon: pre-trip checklist' } },
  ],
};

// "Diğer projeler" listesi, yukarıdan aşağı bu sırayla görünür.
// context: projenin nerede / kimle yapıldığı (boş bırakılabilir).
// year yerine status yazılırsa (ör. "Geliştiriliyor") o gösterilir.
// links.live / links.appStore / links.code boş bırakılabilir.
// color: kartın zemin rengi (koyu), accent: kartın vurgu rengi (açık).
export const projects = [
  {
    title: { tr: 'Lojman Çekiliş Sistemi', en: 'Housing Lottery System' },
    context: { tr: 'Ardahan Üniversitesi için', en: 'For Ardahan University' },
    year: '2025',
    summary: {
      tr: 'Personelin lojman başvurusunu, puanlamasını, çekilişini ve yerleşimini baştan sona yöneten web uygulaması. Rol bazlı giriş, otomatik puanlama, e-posta bildirimleri ve Türkçe/İngilizce arayüz.',
      en: 'A web app that manages staff housing from start to finish: applications, scoring, the lottery and placement. Role-based access, automatic scoring, email notifications and a Turkish/English interface.',
    },
    tech: ['ASP.NET Core MVC', 'Entity Framework Core', 'SQL Server', 'Identity'],
    links: {},
    color: '#3a2320', accent: '#f2a27e', // tuğla
  },
  {
    title: 'InteraktifKredi',
    context: { tr: 'Fintech Jam, 3 kişilik ekip', en: 'Fintech Jam, team of 3' },
    year: '2025',
    summary: {
      tr: 'TC kimlik no ve SMS koduyla giriş yapılan, kredi başvurusu ve finansal rapor ekranları olan bir web şube. Kullanıcı panelini, kredi başvuru ekranlarını ve ödeme geçmişini görselleştiren rapor sayfasını ben geliştirdim.',
      en: 'An online banking portal with ID and SMS-code sign-in, loan applications and financial reports. I built the user dashboard, the loan application screens and the report page that visualises payment history.',
    },
    tech: ['.NET 8', 'Razor Pages', 'REST API', 'Bootstrap', 'SCSS'],
    links: { code: 'https://github.com/ofgurun/Fintech-134' },
    color: '#18284a', accent: '#8db4ff', // banka laciverti
  },
  {
    title: { tr: 'Hubit: Konya 3B', en: 'Hubit: Konya in 3D' },
    context: { tr: 'Divizyon Hubit Sprinti, ekip projesi', en: 'Divizyon Hubit Sprint, team project' },
    year: '2025',
    summary: {
      tr: 'Yazılım ve dijital sanat ekipleriyle birlikte, Konya’da gençlerin buluştuğu mekânları tanıtan etkileşimli 3B web sahnesi. Stadyum, Japon parkı, konser alanı ve basket sahası gibi mekânları sahneye ben ekledim.',
      en: 'An interactive 3D web scene, built with software and digital art teams, showcasing places in Konya where young people meet. I added locations such as the stadium, the Japanese park, the concert area and the basketball court.',
    },
    tech: ['Three.js', 'JavaScript', 'GLSL'],
    links: { code: 'https://github.com/Divizyon/t1-hubit' },
    color: '#29204a', accent: '#b9a8ff', // gece moru
  },
  {
    title: 'Soldier Party',
    context: { tr: 'Bir arkadaşımla, Steam için', en: 'With a friend, for Steam' },
    status: { tr: 'Geliştiriliyor', en: 'In development' },
    summary: {
      tr: 'Unity ile geliştirdiğimiz bir oyun. Lobideki askeri üssü, içine girilebilen kışla binalarını ve üçüncü şahıs kamerayı ben yapıyorum.',
      en: "A game we're building in Unity. I'm working on the lobby's military base, the enterable barracks buildings and the third-person camera.",
    },
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
  email: 'iletisim@batukeser.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/batuksr' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/batu-keser' },
  ],
};

// Sayfadaki sabit arayüz yazıları (menü, başlıklar, butonlar).
export const ui = {
  tr: {
    pageTitle: 'Batuhan Keser',
    pageDescription: 'Batuhan Keser: full stack geliştirici, Selçuk Üniversitesi Bilgisayar Mühendisliği öğrencisi.',
    navLabel: 'Bölümler',
    navAbout: 'Hakkımda',
    navProjects: 'Projeler',
    navContact: 'İletişim',
    langLabel: 'Dil seçimi',
    heroHint: 'Kaydırarak tanış',
    aboutTitle: 'Hakkımda',
    skillsTitle: 'Kullandığım teknolojiler',
    showcaseTitle: 'Uygulamalarım',
    storeButton: "App Store'dan indir",
    projectsTitle: 'Diğer projeler',
    linkLive: 'Siteyi aç',
    linkAppStore: "App Store'da gör",
    linkCode: "GitHub'da incele",
    contactTitle: 'Bir şey mi yapıyoruz?',
    modelError: 'Model yüklenemedi',
  },
  en: {
    pageTitle: 'Batuhan Keser',
    pageDescription: 'Batuhan Keser: full stack developer and Computer Engineering student at Selçuk University.',
    navLabel: 'Sections',
    navAbout: 'About',
    navProjects: 'Projects',
    navContact: 'Contact',
    langLabel: 'Language',
    heroHint: 'Scroll to meet me',
    aboutTitle: 'About',
    skillsTitle: 'Technologies I use',
    showcaseTitle: 'My apps',
    storeButton: 'Download on the App Store',
    projectsTitle: 'Other projects',
    linkLive: 'Open site',
    linkAppStore: 'View on the App Store',
    linkCode: 'View on GitHub',
    contactTitle: 'Shall we build something?',
    modelError: "Couldn't load the model",
  },
};
