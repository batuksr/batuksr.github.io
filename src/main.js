import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Color } from 'three';
import { createHead } from './head.js';
import { createInkTrail } from './inkTrail.js';
import { createLens } from './lens.js';
import { profile, about, featured, projects, skills, contact, ui } from './content.js';

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel) => document.querySelector(sel);

// ---------- Dil ----------
// Seçim tarayıcıda hatırlanır; ilk ziyarette tarayıcı dili Türkçeyse TR, değilse EN.
const LANGS = ['tr', 'en'];
let lang = (() => {
  try {
    const saved = localStorage.getItem('lang');
    if (LANGS.includes(saved)) return saved;
  } catch {}
  return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en';
})();
// İki dilli alanlar { tr, en } nesnesidir; tek dilli alanlar düz metin.
const t = (v) => (v && typeof v === 'object' ? v[lang] ?? v.tr : v);

// ---------- Sayfa iskeleti (dilden bağımsız, bir kez kurulur) ----------
const fullName = `${profile.firstName} ${profile.lastName}`;
$('[data-name]').textContent = fullName;
$('[data-fullname]').textContent = fullName;
$('[data-first]').textContent = profile.firstName;
$('[data-last]').textContent = profile.lastName;

// Beceri şeridi: liste iki kez yazılır; şerit yarısı kadar kayınca başa döner,
// böylece döngü dikişsiz görünür. İkinci kopya ekran okuyuculardan gizlenir.
const skillItems = skills.map((s) => `<li>${s}</li>`).join('');
document.querySelectorAll('[data-skills]').forEach((ul) => {
  ul.innerHTML = skillItems + skillItems.replaceAll('<li>', '<li aria-hidden="true">');
});

// Öne çıkan proje vitrini
$('[data-f-icon]').src = featured.icon;
$('[data-f-name]').textContent = featured.name;
$('[data-f-store]').href = featured.links.appStore;
const web = $('[data-f-web]');
web.href = featured.links.web;
web.textContent = new URL(featured.links.web).hostname;
$('[data-f-screens]').innerHTML = featured.screens
  .map((s) => `<li class="showcase-card"><img src="${s.src}" alt="" loading="lazy" width="600" height="1304" /></li>`)
  .join('');

// Diğer projeler: her proje kendi renginde bir kart; kartlar scroll'da üst üste biner.
// Yazılar boş bırakılır, applyLang() doldurur.
$('[data-projects]').innerHTML = projects
  .map((p, i) => {
    const l = p.links || {};
    const links = [
      l.live && `<a class="pcard-btn" href="${l.live}" target="_blank" rel="noopener" data-i18n="linkLive"></a>`,
      l.appStore && `<a class="pcard-btn" href="${l.appStore}" target="_blank" rel="noopener" data-i18n="linkAppStore"></a>`,
      l.code && `<a class="pcard-btn" href="${l.code}" target="_blank" rel="noopener" data-i18n="linkCode"></a>`,
    ].filter(Boolean).join('');
    const when = p.status
      ? '<span class="pcard-status"></span>'
      : `<span class="pcard-year">${p.year}</span>`;
    return `<li class="pcard" style="--i:${i}; --c-bg:${p.color}; --c-accent:${p.accent}">
      <article class="pcard-body">
        <header class="pcard-top">
          <span class="pcard-context"></span>
          ${when}
        </header>
        <h3 class="pcard-title"></h3>
        <p class="pcard-summary"></p>
        <footer class="pcard-foot">
          <ul class="pcard-tech">${p.tech.map((x) => `<li>${x}</li>`).join('')}</ul>
          ${links}
        </footer>
      </article>
    </li>`;
  })
  .join('');

// Kartın üstünde imleci takip eden yumuşak ışık.
document.querySelectorAll('.pcard-body').forEach((card) =>
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }),
);

// Telefonda kart kaydırıcısının noktaları: dokununca o karta gider,
// kaydırdıkça etkin nokta güncellenir.
const projectList = $('[data-projects]');
const dots = $('[data-pdots]');
dots.innerHTML = projects.map((_, i) => `<button type="button" data-i="${i}"></button>`).join('');
const dotButtons = [...dots.children];
function syncDots() {
  const cards = projectList.children;
  const center = projectList.scrollLeft + projectList.clientWidth / 2;
  let active = 0;
  [...cards].forEach((c, i) => {
    if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - center) < Math.abs(cards[active].offsetLeft + cards[active].offsetWidth / 2 - center)) active = i;
  });
  dotButtons.forEach((b, i) => b.setAttribute('aria-current', String(i === active)));
}
projectList.addEventListener('scroll', syncDots, { passive: true });
dots.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const card = projectList.children[+b.dataset.i];
  projectList.scrollTo({ left: card.offsetLeft - (projectList.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
});
syncDots();

const mail = $('[data-mail]');
mail.textContent = contact.email;
mail.href = `mailto:${contact.email}`;
$('[data-links]').innerHTML = contact.links
  .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`)
  .join('');

// ---------- Dile bağlı yazılar ----------
// Hakkımda'daki büyük cümle scroll ile kelime kelime aydınlanır; dil değişince
// kelimeler ve animasyonu yeniden kurulur.
const lead = $('[data-lead]');
let leadTween = null;
function buildLead() {
  leadTween?.scrollTrigger?.kill();
  leadTween?.kill();
  lead.innerHTML = t(about.lead)
    .split(' ')
    .map((w) => `<span class="word">${w}</span>`)
    .join(' ');
  if (reduceMotion) return;
  leadTween = gsap.to(lead.querySelectorAll('.word'), {
    opacity: 1,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: lead, start: 'top 80%', end: 'bottom 40%', scrub: true },
  });
}

function applyLang() {
  const u = ui[lang];
  document.documentElement.lang = lang;
  document.title = u.pageTitle;
  document.querySelector('meta[name="description"]').content = u.pageDescription;
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = u[el.dataset.i18n]));
  document.querySelectorAll('[data-i18n-label]').forEach((el) =>
    el.setAttribute('aria-label', u[el.dataset.i18nLabel]),
  );
  document.querySelectorAll('[data-lang]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang)),
  );
  dotButtons.forEach((b, i) => b.setAttribute('aria-label', `${u.swipeLabel} ${i + 1}`));

  $('[data-role]').textContent = t(profile.role);
  $('[data-location]').textContent = t(profile.location);
  $('[data-body]').textContent = t(about.body);
  buildLead();

  $('[data-f-tagline]').textContent = t(featured.tagline);
  $('[data-f-summary]').textContent = t(featured.summary);
  $('[data-f-meta]').textContent = t(featured.meta);
  document.querySelectorAll('.showcase-card img').forEach((img, i) => (img.alt = t(featured.screens[i].alt)));

  document.querySelectorAll('.pcard').forEach((card, i) => {
    const p = projects[i];
    card.querySelector('.pcard-title').textContent = t(p.title);
    card.querySelector('.pcard-context').textContent = t(p.context) || '';
    card.querySelector('.pcard-summary').textContent = t(p.summary);
    const status = card.querySelector('.pcard-status');
    if (status) status.textContent = t(p.status);
  });
}
applyLang();

document.querySelectorAll('[data-lang]').forEach((b) =>
  b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try {
      localStorage.setItem('lang', lang);
    } catch {}
    applyLang();
    ScrollTrigger.refresh(); // yazı uzunlukları değişti
  }),
);

createInkTrail($('.hero-name'), { observe: $('#top') });
createLens($('.contact-lens'));

// ---------- Yumuşak scroll ----------
if (!reduceMotion) {
  const lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(a.getAttribute('href'), { duration: 1.6 });
    }),
  );
}

// ---------- Kafa ----------
// Model indirmesi yükleme ekranındaki küreyi doldurur (index.html'deki betik).
const loader = window.__loader || { progress() {}, finish() {} };
const head = createHead($('.stage'), {
  onProgress: (p) => loader.progress(p),
});
// Telefonda ilk sürüklemede "sürükle" ipucu kaybolur.
head.onFirstDrag(() => $('.drag-hint')?.classList.add('is-hidden'));
const { pose } = head;

// ---------- Vitrin: sabitlenir, ekran görüntüleri yatay akar ----------
// Diğer tüm scroll tetikleyicilerinden önce kurulur ki onların konumları
// sabitlemenin eklediği boşluğa göre hesaplansın.
const showcaseMM = gsap.matchMedia();
showcaseMM.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
  const strip = $('.showcase-strip');
  const track = $('.showcase-track');
  const cards = gsap.utils.toArray('.showcase-card');
  const distance = () => Math.max(0, track.scrollWidth - strip.clientWidth);
  // Kaydırma hızına göre kartlar hafifçe eğilir; durunca düzelir.
  const tilt = cards.map((c) => gsap.quickTo(c, 'rotation', { duration: 0.6, ease: 'power3.out' }));
  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#projeler',
      start: 'top top',
      end: () => `+=${distance() * 1.1}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const r = gsap.utils.clamp(-4, 4, self.getVelocity() / -500);
        tilt.forEach((fn) => fn(r));
      },
    },
  });
  const straighten = () => tilt.forEach((fn) => fn(0));
  ScrollTrigger.addEventListener('scrollEnd', straighten);
  return () => ScrollTrigger.removeEventListener('scrollEnd', straighten);
});

// ---------- Diğer projeler: kart destesi ----------
// Bir sonraki kart üste binerken alttaki hafifçe küçülür ve kararır.
showcaseMM.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
  const cards = gsap.utils.toArray('.pcard');
  cards.slice(0, -1).forEach((card, i) => {
    // Başlangıç açıkça verilir: "filter: none"dan tween'de parlaklık 0 sanılıyor.
    gsap.fromTo(card.querySelector('.pcard-body'), { scale: 1, filter: 'brightness(1)' }, {
      scale: 0.93,
      filter: 'brightness(0.55)',
      ease: 'none',
      scrollTrigger: {
        trigger: cards[i + 1],
        start: 'top bottom',
        end: `top ${96 + (i + 1) * 18}px`, // CSS'teki sticky top ile aynı
        scrub: true,
      },
    });
  });
});

// Her bölümün kenar ışığı rengi; sayfadaki vurgu rengi de buna uyar.
// Vitrinde ışık uygulamanın turuncusuna döner ve sayfa onun renklerine bürünür.
const sections = ['top', 'hakkimda', 'projeler', 'diger', 'iletisim'];
const rimColors = { top: '#86d6cb', hakkimda: '#f0a868', projeler: '#e0813f', diger: '#a3a2f7', iletisim: '#86d6cb' };
function setRim(hex) {
  const c = new Color(hex);
  gsap.to(head.rimColor, { r: c.r, g: c.g, b: c.b, duration: 1.2, ease: 'power2.out' });
  document.documentElement.style.setProperty('--rim', hex);
}
// Bir bölümün üstü ekranın ortasını geçince o bölüm etkin olur; yukarı
// dönerken geçilirse bir önceki bölüm geri gelir. (Bitiş noktası kullanılmaz:
// sabitlenen vitrinin bitişini GSAP kendi boşluğu olmadan hesaplıyor.)
let activeSection = null;
function activate(id) {
  if (id === activeSection) return;
  activeSection = id;
  setRim(rimColors[id]);
}
activate('top');
sections.slice(1).forEach((id, i) => {
  ScrollTrigger.create({
    trigger: `#${id}`,
    start: 'top 55%',
    onEnter: () => activate(id),
    onLeaveBack: () => activate(sections[i]),
  });
});

// Bölüm bölüm kafanın duruşu. Masaüstünde metnin yanına geçer,
// mobilde metnin üstünde kalır.
const poses = {
  desktop: {
    top: { x: 0, y: -0.02, rotY: 0, scale: 0.52 },
    hakkimda: { x: 0.48, y: 0, rotY: -0.55, scale: 0.55 },
    // Vitrinde kafa ekranın altına iner; sahne uygulamanın.
    projeler: { x: -0.5, y: -1.6, rotY: 0.55, scale: 0.4 },
    diger: { x: -0.5, y: 0, rotY: 0.6, scale: 0.5 },
    iletisim: { x: 0, y: 0.42, rotY: 0, scale: 0.36 }, // başlığın üstünde, ona binmeden
  },
  mobile: {
    top: { x: 0, y: -0.02, rotY: 0, scale: 0.62 },
    // Telefonda kafa sadece girişte durur; aşağı kaydırınca sayfayla birlikte
    // yukarı kayıp ekrandan çıkar ve bir daha görünmez.
    hakkimda: { x: 0, y: 2, rotY: 0, scale: 0.62 },
    projeler: { x: 0, y: 2, rotY: 0, scale: 0.62 },
    diger: { x: 0, y: 2, rotY: 0, scale: 0.62 },
    iletisim: { x: 0, y: 2, rotY: 0, scale: 0.62 },
  },
};

const mm = gsap.matchMedia();
mm.add({ desktop: '(min-width: 761px)', mobile: '(max-width: 760px)' }, (ctx) => {
  const set = ctx.conditions.desktop ? poses.desktop : poses.mobile;
  Object.assign(pose, set.top);
  // Başlangıç pozu da açıkça verilir (fromTo); böylece sayfa yenilenip ortadan
  // açılsa ya da tek seferde atlansa bile kafa doğru yerde durur.
  sections.slice(1).forEach((id, i) => {
    gsap.fromTo(pose, { ...set[sections[i]] }, {
      ...set[id],
      ease: 'power2.inOut',
      immediateRender: false,
      scrollTrigger: { trigger: `#${id}`, start: 'top bottom', end: 'top 25%', scrub: 1 },
    });
  });
});

// İletişime gelince kafa göz kırpar.
ScrollTrigger.create({
  trigger: '#iletisim',
  start: 'top 30%',
  onEnter: () => gsap.delayedCall(0.6, head.wink),
});

// Dev isim, ilk bölümden çıkarken kaybolur.
gsap.to('.hero-name', {
  opacity: 0,
  yPercent: -12,
  ease: 'none',
  scrollTrigger: { trigger: '#hakkimda', start: 'top bottom', end: 'top 35%', scrub: true },
});

// ---------- Açılış ----------
// Model inince yükleme ekranı %100'e tamamlanıp kapanır; ardından stüdyo
// ışıkları yanar, kafa kameraya döner ve isim belirir.
const d = reduceMotion ? 0 : 1;
gsap.set('.hero-name span', { yPercent: 30, opacity: 0 });
gsap.set('.hero-role, .hero-hint, .topbar', { opacity: 0 });
pose.introRot = reduceMotion ? 0 : -1.1;

function intro() {
  gsap.timeline({ delay: 0.1 * d })
    .to(pose, { light: 1, duration: 1.6 * d, ease: 'power2.inOut' }, 0)
    .to(pose, { introRot: 0, duration: 2.2 * d, ease: 'power3.out' }, 0.2 * d)
    .to('.hero-name span', { yPercent: 0, opacity: 1, duration: 1.4 * d, stagger: 0.12, ease: 'power3.out' }, 0.4 * d)
    .to('.hero-role, .hero-hint, .topbar', { opacity: 1, duration: 0.8 * d }, 1.2 * d);
}
if (document.querySelector('.loader')) addEventListener('loader:done', intro, { once: true });
else intro();

head.ready
  .catch((err) => console.error(err)) // kafa olmadan da site kullanılabilir
  .finally(() => loader.finish());
