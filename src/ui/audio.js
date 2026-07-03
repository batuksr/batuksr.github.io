import { settings } from '../data/content.js';

// Prosedürel motor sesi (WebAudio) + opsiyonel fon müziği.
// Müzik: public/ klasörüne settings.musicUrl'deki dosyayı koy (örn. runaway.mp3);
// dosya yoksa sessizce atlanır. Tarayıcı politikası gereği ses ancak
// kullanıcı etkileşiminden sonra başlar.
export function createAudio() {
  let ctx = null;
  let engineGain = null;
  let osc1 = null, osc2 = null;
  let muted = true; // varsayılan: kapalı; kullanıcı isterse açar
  let started = false;
  let music = null;
  let musicFailed = false;

  function ensureMusic() {
    if (music || musicFailed || !settings.musicUrl) return;
    music = new Audio(settings.musicUrl);
    music.loop = true;
    music.volume = settings.musicVolume ?? 0.35;
    music.addEventListener('error', () => {
      // Dosya yoksa (henüz eklenmemişse) müzik olmadan devam et
      musicFailed = true;
      music = null;
    });
  }

  function syncMusic() {
    ensureMusic();
    if (!music) return;
    if (muted) {
      music.pause();
    } else {
      music.play().catch(() => { /* autoplay engeli: bir sonraki tıklamada tekrar denenir */ });
    }
  }

  const muteBtn = document.getElementById('mute-btn');
  muteBtn.classList.remove('hidden');

  function ensureContext() {
    if (started) return;
    started = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 320;

    engineGain = ctx.createGain();
    engineGain.gain.value = 0;

    osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 62;
    osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 93;

    osc1.connect(lowpass);
    osc2.connect(lowpass);
    lowpass.connect(engineGain);
    engineGain.connect(ctx.destination);
    osc1.start();
    osc2.start();
  }

  function updateButton() {
    muteBtn.textContent = muted ? '🔇' : '🔊';
  }
  updateButton();

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    ensureContext();
    if (ctx.state === 'suspended') ctx.resume();
    syncMusic();
    updateButton();
  });

  return {
    // İlk kullanıcı etkileşiminde çağır (autoplay kilidini açar)
    unlock() {
      // Ses kapalı başlar; kullanıcı butona basana dek context oluşturma
    },

    update(speed) {
      if (!started || muted || !ctx) {
        if (engineGain) engineGain.gain.value = 0;
        return;
      }
      // Yerde (hız 0) rölanti sesine düşsün diye 0'a kenetle
      const n = Math.max(0, Math.min(1, (speed - 13) / (46 - 13)));
      osc1.frequency.value = 55 + n * 65;
      osc2.frequency.value = 82 + n * 95;
      engineGain.gain.value = 0.028 + n * 0.03;
    },

    blip() {
      if (!started || muted || !ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.09);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    },
  };
}
