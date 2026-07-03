// HUD: hız, irtifa, pusula başlığı
const CARDINALS = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];

export function createHud() {
  const speedEl = document.getElementById('hud-speed');
  const altEl = document.getElementById('hud-alt');
  const headingEl = document.getElementById('hud-heading');
  const hudEl = document.getElementById('hud');
  const edgeEl = document.getElementById('edge-warning');

  let lastSpeed = -1, lastAlt = -1, lastHeading = -1;

  return {
    show() { hudEl.classList.remove('hidden'); },

    update(state) {
      // Oyun birimlerini "inandırıcı" değerlere ölçekle
      const kmh = Math.round(state.speed * 7.2);
      const alt = Math.round(state.pos.y * 2.6);

      // Kuzey = -Z; pusula açısı saat yönünde
      const deg = (-state.yaw * 180) / Math.PI;
      const heading = Math.round(((deg % 360) + 360) % 360) % 360;

      if (kmh !== lastSpeed) { speedEl.textContent = kmh; lastSpeed = kmh; }
      if (alt !== lastAlt) { altEl.textContent = alt; lastAlt = alt; }
      if (heading !== lastHeading) {
        const card = CARDINALS[Math.round(heading / 45) % 8];
        headingEl.textContent = `${card} ${heading}°`;
        lastHeading = heading;
      }

      edgeEl.classList.toggle('hidden', !state.atEdge);
    },
  };
}
