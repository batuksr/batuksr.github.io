// Klavye girdisi + mobil kontrollerden gelen sanal girdilerin birleşimi.
// getState() her karede okunur; olay tabanlı aksiyonlar callback ile.
export function createInput() {
  const keys = new Set();
  const virtual = { turn: 0, pitch: 0, throttle: null }; // mobil joystick yazacak
  const handlers = { interact: [], toggleCamera: [], closePanel: [] };

  const emit = (name) => handlers[name].forEach((fn) => fn());

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    keys.add(k);
    if (k === 'e') emit('interact');
    if (k === 'c') emit('toggleCamera');
    if (k === 'escape') emit('closePanel');
    if (k === ' ') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  return {
    on(name, fn) { handlers[name].push(fn); },
    emit,
    virtual,
    getState() {
      let turn = 0, pitch = 0;
      if (keys.has('a') || keys.has('arrowleft')) turn += 1;
      if (keys.has('d') || keys.has('arrowright')) turn -= 1;
      if (keys.has('w') || keys.has('arrowup')) pitch += 1;
      if (keys.has('s') || keys.has('arrowdown')) pitch -= 1;

      // Mobil joystick klavyeyi geçersiz kılar (aynı anda ikisi kullanılmaz)
      if (virtual.turn !== 0 || virtual.pitch !== 0) {
        turn = -virtual.turn;   // joystick sağa = sağa dönüş
        pitch = -virtual.pitch; // joystick yukarı = tırmanış
      }

      return {
        turn,
        pitch,
        boost: keys.has(' '),
        brake: keys.has('shift'),
        throttle: virtual.throttle, // null ise klavye modu
      };
    },
  };
}
