// Mobil dokunmatik kontroller: sanal joystick (yön) + gaz kolu + E butonu.
// input.virtual alanlarına yazar; flight her karede oradan okur.
export function createMobileControls(input, { onInteract, onToggleCamera }) {
  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const rootEl = document.getElementById('mobile-controls');
  const interactBtn = document.getElementById('mobile-interact');

  if (!isTouch) {
    return { isTouch: false, show() {}, setInteractVisible() {} };
  }

  rootEl.classList.remove('hidden');

  // --- Joystick ---
  const zone = document.getElementById('joystick-zone');
  const base = document.getElementById('joystick-base');
  const knob = document.getElementById('joystick-knob');
  const RADIUS = 42;
  let joyPointer = null;
  let baseCenter = { x: 0, y: 0 };

  function setKnob(dx, dy) {
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  zone.addEventListener('pointerdown', (e) => {
    joyPointer = e.pointerId;
    zone.setPointerCapture(e.pointerId);
    // Joystick tabanını dokunulan yere taşı (daha ergonomik)
    const zr = zone.getBoundingClientRect();
    const bx = Math.min(Math.max(e.clientX - zr.left, 65), zr.width - 65);
    const by = Math.min(Math.max(e.clientY - zr.top, 65), zr.height - 65);
    base.style.left = `${bx - 55}px`;
    base.style.top = `${by - 55}px`;
    base.style.bottom = 'auto';
    baseCenter = { x: zr.left + bx, y: zr.top + by };
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joyPointer) return;
    let dx = e.clientX - baseCenter.x;
    let dy = e.clientY - baseCenter.y;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) { dx = (dx / len) * RADIUS; dy = (dy / len) * RADIUS; }
    setKnob(dx, dy);
    input.virtual.turn = dx / RADIUS;   // sağa itmek = sağa dönüş
    input.virtual.pitch = dy / RADIUS;  // yukarı itmek = tırmanış
  });
  const joyEnd = (e) => {
    if (e.pointerId !== joyPointer) return;
    joyPointer = null;
    setKnob(0, 0);
    input.virtual.turn = 0;
    input.virtual.pitch = 0;
  };
  zone.addEventListener('pointerup', joyEnd);
  zone.addEventListener('pointercancel', joyEnd);

  // --- Gaz kolu ---
  const track = document.getElementById('throttle-track');
  const tKnob = document.getElementById('throttle-knob');
  let throttlePointer = null;

  function setThrottleFromY(clientY) {
    const r = track.getBoundingClientRect();
    let t = 1 - (clientY - r.top) / r.height;
    t = Math.min(1, Math.max(0, t));
    input.virtual.throttle = t;
    tKnob.style.bottom = `calc(${t * 100}% - ${t * 38}px)`;
  }

  track.addEventListener('pointerdown', (e) => {
    throttlePointer = e.pointerId;
    track.setPointerCapture(e.pointerId);
    setThrottleFromY(e.clientY);
  });
  track.addEventListener('pointermove', (e) => {
    if (e.pointerId === throttlePointer) setThrottleFromY(e.clientY);
  });
  const thrEnd = (e) => { if (e.pointerId === throttlePointer) throttlePointer = null; };
  track.addEventListener('pointerup', thrEnd);
  track.addEventListener('pointercancel', thrEnd);

  // Başlangıç gazı: seyir hızına denk gelen konum
  input.virtual.throttle = 0.35;

  // --- Butonlar ---
  interactBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); onInteract(); });
  document.getElementById('mobile-camera').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    onToggleCamera();
  });

  return {
    isTouch: true,
    show() { rootEl.classList.remove('hidden'); },
    setInteractVisible(v) { interactBtn.classList.toggle('hidden', !v); },
  };
}
