import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Color } from 'three';
import { createHead } from './head.js';
import { createInkTrail } from './inkTrail.js';
import { createLens } from './lens.js';
import { profile, about, featured, projects, skills, contact } from './content.js';

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel) => document.querySelector(sel);

// ---------- İçeriği yerleştir ----------
const fullName = `${profile.firstName} ${profile.lastName}`;
$('[data-name]').textContent = fullName;
$('[data-fullname]').textContent = fullName;
$('[data-first]').textContent = profile.firstName;
$('[data-last]').textContent = profile.lastName;
$('[data-role]').textContent = profile.role;
$('[data-location]').textContent = profile.location;
$('[data-body]').textContent = about.body;

const lead = $('[data-lead]');
lead.innerHTML = about.lead
  .split(' ')
  .map((w) => `<span class="word">${w}</span>`)
  .join(' ');

// Beceri şeridi: liste iki kez yazılır; şerit yarısı kadar kayınca başa döner,
// böylece döngü dikişsiz görünür. İkinci kopya ekran okuyuculardan gizlenir.
const skillItems = skills.map((s) => `<li>${s}</li>`).join('');
document.querySelectorAll('[data-skills]').forEach((ul) => {
  ul.innerHTML = skillItems + skillItems.replaceAll('<li>', '<li aria-hidden="true">');
});

// Öne çıkan proje vitrini
$('[data-f-icon]').src = featured.icon;
$('[data-f-name]').textContent = featured.name;
$('[data-f-tagline]').textContent = featured.tagline;
$('[data-f-summary]').textContent = featured.summary;
$('[data-f-meta]').textContent = featured.meta;
$('[data-f-store]').href = featured.links.appStore;
const web = $('[data-f-web]');
web.href = featured.links.web;
web.textContent = new URL(featured.links.web).hostname;
$('[data-f-screens]').innerHTML = featured.screens
  .map((s) => `<li class="showcase-card"><img src="${s.src}" alt="${s.alt}" loading="lazy" width="600" height="1304" /></li>`)
  .join('');

// Diğer projeler: her proje kendi renginde bir kart; kartlar scroll'da üst üste biner.
$('[data-projects]').innerHTML = projects
  .map((p, i) => {
    const l = p.links || {};
    const links = [
      l.live && `<a class="pcard-btn" href="${l.live}" target="_blank" rel="noopener">Siteyi aç</a>`,
      l.appStore && `<a class="pcard-btn" href="${l.appStore}" target="_blank" rel="noopener">App Store'da gör</a>`,
      l.code && `<a class="pcard-btn" href="${l.code}" target="_blank" rel="noopener">GitHub'da incele</a>`,
    ].filter(Boolean).join('');
    const when = p.status
      ? `<span class="pcard-status">${p.status}</span>`
      : `<span class="pcard-year">${p.year}</span>`;
    return `<li class="pcard" style="--i:${i}; --c-bg:${p.color}; --c-accent:${p.accent}">
      <article class="pcard-body">
        <header class="pcard-top">
          ${p.context ? `<span class="pcard-context">${p.context}</span>` : '<span></span>'}
          ${when}
        </header>
        <h3 class="pcard-title">${p.title}</h3>
        <p class="pcard-summary">${p.summary}</p>
        <footer class="pcard-foot">
          <ul class="pcard-tech">${p.tech.map((t) => `<li>${t}</li>`).join('')}</ul>
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

const mail = $('[data-mail]');
mail.textContent = contact.email;
mail.href = `mailto:${contact.email}`;
$('[data-links]').innerHTML = contact.links
  .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`)
  .join('');

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
const counter = $('.loader-count');
const head = createHead($('.stage'), {
  onProgress: (p) => (counter.textContent = Math.round(p * 100)),
});
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
  document.documentElement.classList.toggle('theme-featured', id === 'projeler');
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
    hakkimda: { x: 0, y: 0.5, rotY: -0.35, scale: 0.34 },
    projeler: { x: 0, y: -1.6, rotY: 0.35, scale: 0.4 }, // ekranın altında
    diger: { x: 0, y: 0.5, rotY: 0.35, scale: 0.34 },
    iletisim: { x: 0, y: 0.35, rotY: 0, scale: 0.4 },
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

// Hakkımda paragrafı scroll ile kelime kelime aydınlanır.
if (!reduceMotion) {
  gsap.to('.about-lead .word', {
    opacity: 1,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: '.about-lead', start: 'top 80%', end: 'bottom 40%', scrub: true },
  });
}

// ---------- Açılış: stüdyo ışıkları yanar, kafa kameraya döner ----------
gsap.set('.hero-name span', { yPercent: 30, opacity: 0 });
gsap.set('.hero-role, .hero-hint, .topbar', { opacity: 0 });
pose.introRot = reduceMotion ? 0 : -1.1;

head.ready
  .then(() => {
    counter.textContent = '100';
    $('.loader').classList.add('is-done');
    const d = reduceMotion ? 0 : 1;
    gsap.timeline({ delay: 0.3 * d })
      .to(pose, { light: 1, duration: 1.6 * d, ease: 'power2.inOut' }, 0)
      .to(pose, { introRot: 0, duration: 2.2 * d, ease: 'power3.out' }, 0.2 * d)
      .to('.hero-name span', { yPercent: 0, opacity: 1, duration: 1.4 * d, stagger: 0.12, ease: 'power3.out' }, 0.4 * d)
      .to('.hero-role, .hero-hint, .topbar', { opacity: 1, duration: 0.8 * d }, 1.4 * d);
  })
  .catch((err) => {
    console.error(err);
    counter.textContent = 'Model yüklenemedi';
  });
