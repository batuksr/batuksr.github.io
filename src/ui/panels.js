import { profile, projects, about, skills, contact } from '../data/content.js';

// HTML overlay panel sistemi. İçerik src/data/content.js'ten üretilir;
// sahne arka planda (blur'lu) çalışmaya devam eder.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderHome() {
  return `
    <h1>${esc(profile.name)}</h1>
    <p class="panel-sub">${esc(profile.title)}</p>
    <p>${esc(profile.tagline)}</p>
    <p style="margin-top:14px">Bu dünyada <strong>4 ada</strong> daha var: Projeler, Hakkımda, İletişim ve Yetenekler.
    Parlayan işaretlere doğru uç, yaklaşınca <kbd>E</kbd> ile panelleri aç. İstersen yavaşlayıp alçalarak
    adalara <strong>iniş yap</strong>, park halinde kartları rahatça oku; <kbd>Boşluk</kbd> ile tekrar havalan. İyi uçuşlar! ✈️</p>
    <div class="hint-controls" style="margin-top:16px">
      <div><kbd>W</kbd>/<kbd>S</kbd> — Burun yukarı/aşağı &nbsp; <kbd>A</kbd>/<kbd>D</kbd> — Dönüş</div>
      <div><kbd>Boşluk</kbd> — Gaz &nbsp; <kbd>Shift</kbd> — Yavaşla &nbsp; <kbd>C</kbd> — Kamera</div>
    </div>`;
}

function renderProjects(highlightIndex) {
  const cards = projects.map((p, i) => `
    <div class="project-card${i === highlightIndex ? ' highlight' : ''}" ${i === highlightIndex ? 'data-scroll="1"' : ''}>
      ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" style="width:100%;border-radius:10px;margin-bottom:10px" loading="lazy" />` : ''}
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <div class="tech-tags">${p.tech.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join('')}</div>
      <div class="project-links">
        ${p.links.live ? `<a href="${esc(p.links.live)}" target="_blank" rel="noopener">🌐 Canlı</a>` : ''}
        ${p.links.github ? `<a href="${esc(p.links.github)}" target="_blank" rel="noopener">🐙 GitHub</a>` : ''}
      </div>
    </div>`).join('');
  return `<h2>Projeler</h2><p class="panel-sub">Her hangar bir projeyi saklıyor.</p>${cards}`;
}

function renderAbout() {
  return `
    <h2>Hakkımda</h2>
    <p>${esc(about.bio)}</p>
    <div class="timeline">
      ${about.timeline.map((t) => `
        <div class="timeline-item">
          <div class="timeline-year">${esc(t.year)}</div>
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.desc)}</p>
        </div>`).join('')}
    </div>
    <a class="cv-btn" href="${esc(profile.cvUrl)}" download style="margin-top:10px">📄 CV'yi İndir</a>`;
}

function renderSkills() {
  return `
    <h2>Yetenekler & Teknolojiler</h2>
    <p class="panel-sub">Kullandığım araçlar ve alanlar.</p>
    ${skills.map((g) => `
      <div class="skill-group">
        <h3>${esc(g.group)}</h3>
        <div class="tech-tags">${g.items.map((s) => `<span class="tech-tag">${esc(s)}</span>`).join('')}</div>
      </div>`).join('')}`;
}

function renderContact() {
  return `
    <h2>İletişim</h2>
    <p class="panel-sub">Bir mesaj at, kule seni dinliyor. 📡</p>
    <div class="contact-grid">
      ${contact.links.map((l) => `<a class="contact-link" href="${esc(l.url)}" target="_blank" rel="noopener">${l.icon} ${esc(l.label)}</a>`).join('')}
    </div>`;
}

export function createPanels() {
  const root = document.getElementById('panel-root');
  const content = document.getElementById('panel-content');
  const closeBtn = document.getElementById('panel-close');
  const backdrop = document.getElementById('panel-backdrop');

  let isOpen = false;
  const listeners = [];

  function open(sectionId, projectIndex) {
    switch (sectionId) {
      case 'home': content.innerHTML = renderHome(); break;
      case 'projects': content.innerHTML = renderProjects(projectIndex); break;
      case 'about': content.innerHTML = renderAbout(); break;
      case 'skills': content.innerHTML = renderSkills(); break;
      case 'contact': content.innerHTML = renderContact(); break;
      default: return;
    }
    root.classList.remove('hidden');
    isOpen = true;
    listeners.forEach((fn) => fn(true));

    // Vurgulanan proje kartına kaydır
    const target = content.querySelector('[data-scroll]');
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    else content.scrollTop = 0;
  }

  function close() {
    if (!isOpen) return;
    root.classList.add('hidden');
    isOpen = false;
    listeners.forEach((fn) => fn(false));
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  return {
    open,
    close,
    get isOpen() { return isOpen; },
    onOpenChange(fn) { listeners.push(fn); },
  };
}
