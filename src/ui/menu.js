import { islandLayout } from '../data/content.js';

// Sağ üst hızlı erişim menüsü: uçmadan bölümlere ışınlanma.
export function createMenu({ onNavigate, onShowControls }) {
  const toggle = document.getElementById('menu-toggle');
  const list = document.getElementById('menu-list');

  for (const island of islandLayout) {
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="menu-dot" style="background:${island.color}"></span>${island.name}`;
    btn.addEventListener('click', () => {
      list.classList.add('hidden');
      onNavigate(island.id);
    });
    list.appendChild(btn);
  }

  const helpBtn = document.createElement('button');
  helpBtn.innerHTML = `<span class="menu-dot" style="background:#8895a7"></span>Kontroller`;
  helpBtn.addEventListener('click', () => {
    list.classList.add('hidden');
    onShowControls();
  });
  list.appendChild(helpBtn);

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    list.classList.toggle('hidden');
  });
  window.addEventListener('pointerdown', (e) => {
    if (!list.contains(e.target) && e.target !== toggle) list.classList.add('hidden');
  });
}
