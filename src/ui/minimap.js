// Mini harita: sabit (kuzey yukarı) dünya görünümü, adalar renkli noktalar,
// uçak dönen bir ok olarak çizilir.
export function createMinimap(mapInfo, worldRadius) {
  const canvas = document.getElementById('minimap');
  const ctx = canvas.getContext('2d');

  const toMap = (v, size) => (v / (worldRadius * 1.15)) * (size / 2);

  return {
    show() { canvas.classList.remove('hidden'); },

    update(state) {
      const size = canvas.width;
      const c = size / 2;
      ctx.clearRect(0, 0, size, size);

      // Adalar
      for (const isl of mapInfo) {
        ctx.beginPath();
        ctx.arc(c + toMap(isl.x, size), c + toMap(isl.z, size), Math.max(4, toMap(isl.r, size)), 0, Math.PI * 2);
        ctx.fillStyle = isl.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Uçak oku
      const px = c + toMap(state.pos.x, size);
      const pz = c + toMap(state.pos.z, size);
      const angle = Math.atan2(-Math.sin(state.yaw), -(-Math.cos(state.yaw))); // dir.x, -dir.z

      ctx.save();
      ctx.translate(px, pz);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(50,60,80,0.7)';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Kuzey işareti
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '700 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('K', c, 13);
    },
  };
}
