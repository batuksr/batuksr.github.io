// Yükleme ekranı. Tüm dünya prosedürel üretildiği için gerçek bir asset
// indirme süreci yok; kurulum adımlarını ilerleme olarak yansıtıyoruz.
export function createLoadingScreen() {
  const el = document.getElementById('loading-screen');
  const fill = document.getElementById('loading-fill');
  const tip = el.querySelector('.loading-tip');
  const startTime = performance.now();

  const tips = ['Motorlar ısınıyor…', 'Adalar yerleştiriliyor…', 'Bulutlar şişiriliyor…', 'Pist ışıkları açılıyor…'];
  let tipIdx = 0;
  const tipTimer = setInterval(() => {
    tipIdx = (tipIdx + 1) % tips.length;
    tip.textContent = tips[tipIdx];
  }, 500);

  return {
    setProgress(p) {
      fill.style.width = `${Math.round(p * 100)}%`;
    },
    // En az 900ms göster (yanıp sönme hissi olmasın), sonra yumuşak geçiş
    done() {
      fill.style.width = '100%';
      const elapsed = performance.now() - startTime;
      const wait = Math.max(0, 900 - elapsed);
      setTimeout(() => {
        clearInterval(tipTimer);
        el.classList.add('fade');
        setTimeout(() => el.remove(), 700);
      }, wait);
    },
  };
}
