// Fare izi: imlecin geçtiği yerde organik kenarlı, açık renkli mürekkep
// lekeleri bırakır; lekelerin içinde yazı koyu renkte yeniden çizilir (ters
// çevrilmiş gibi görünür). Lekeler birkaç saniyede kendiliğinden erir.
//
// İki aşamalı WebGL:
//  1) "trail" dokusu: her karede biraz silinir, hafifçe akar, imlecin son
//     hareket çizgisi üzerine yeni boya eklenir (iki doku arasında ping-pong).
//  2) Ekrana çizim: dokudaki değer gürültüyle bozulup eşiklenir; böylece
//     yumuşak boya keskin ve tırtıklı kenarlı lekeye dönüşür.
//
// Dokunmatik cihazlarda ve "hareketi azalt" açıkken çalışmaz.

const NOISE = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}`;

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const UPDATE = `
precision highp float;
varying vec2 uv;
uniform sampler2D prev;
uniform vec2 res, a, b;      // canvas size and pointer segment, CSS px (y up)
uniform float radius, decay, time, active;
${NOISE}
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  return length(pa - ba * h);
}
void main() {
  vec2 px = uv * res;
  // Ink slowly drifts: sample last frame with a small noise-driven offset.
  vec2 drift = (vec2(fbm(px * 0.01 + time * 0.3), fbm(px * 0.01 + 17.0 + time * 0.3)) - 0.5) * 3.0 / res;
  float v = texture2D(prev, uv + drift).r - decay;
  float s = (1.0 - smoothstep(radius * 0.55, radius, segDist(px, a, b))) * active;
  gl_FragColor = vec4(vec3(max(v, s)), 1.0);
}`;

const DISPLAY = `
precision highp float;
varying vec2 uv;
uniform sampler2D trail, textTex;
uniform vec2 res;
uniform float time;
uniform vec3 bgCol, fgCol;
${NOISE}
void main() {
  vec2 px = uv * res;
  vec2 warp = (vec2(fbm(px * 0.012 + time * 0.2), fbm(px * 0.012 + 9.0 + time * 0.2)) - 0.5) * 30.0 / res;
  float v = texture2D(trail, uv + warp).r;
  // Thin the ink near the canvas border so it never ends in a straight cut.
  float edge = min(min(px.x, res.x - px.x), min(px.y, res.y - px.y));
  v *= smoothstep(0.0, 40.0, edge);
  float n = fbm(px * 0.035 + time * 0.15);
  float m = smoothstep(0.47, 0.53, v + (n - 0.5) * 0.55);
  // Paper-colored ink with the text redrawn in dark on top (premultiplied).
  float t = texture2D(textTex, uv).a;
  gl_FragColor = vec4(mix(bgCol, fgCol, t) * m, m);
}`;

// container: tuvalin yerleşeceği eleman. Doğrudan alt <span>'lerindeki yazılar
//   lekenin içinde koyu renkte yeniden çizilir.
// options.observe: efekt bu eleman ekrandayken çalışır (varsayılan: container).
export function createInkTrail(container, { observe = container } = {}) {
  const text = container;
  const ok =
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'ink';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return canvas.remove();

  const program = (fs) => {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, 'p');
    gl.linkProgram(p);
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(p, i).name;
      u[name] = gl.getUniformLocation(p, name);
    }
    return { p, u };
  };
  const update = program(UPDATE);
  const display = program(DISPLAY);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Boya dokuları ekran çözünürlüğünün yarısında tutulur; yeterince yumuşak ve ucuz.
  const SIM = 0.5;
  let targets = [], w = 0, h = 0, dpr = 1;
  function makeTarget(tw, th) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fb, tw, th };
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    targets.forEach((t) => (gl.deleteTexture(t.tex), gl.deleteFramebuffer(t.fb)));
    const tw = Math.round(w * SIM), th = Math.round(h * SIM);
    targets = [makeTarget(tw, th), makeTarget(tw, th)];
    drawText();
  }

  // "Dolu" modda yazıların lekenin içinde yeniden çizilecek kopyası.
  const textTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const css = getComputedStyle(document.documentElement);
  const rgb = (v) => (h => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255))(css.getPropertyValue(v).trim().slice(1));
  const bgCol = rgb('--paper'), fgCol = rgb('--backdrop-deep');

  // Her satır, DOM'daki yerine birebir denk gelecek şekilde 2D tuvale çizilir.
  // offsetTop/Left kullanılır; böylece giriş animasyonundaki kaydırmalar hesaba girmez.
  async function drawText() {
    await document.fonts.ready;
    const c = document.createElement('canvas');
    c.width = canvas.width;
    c.height = canvas.height;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const line of text.querySelectorAll(':scope > span')) {
      const cs = getComputedStyle(line);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      const label = cs.textTransform === 'uppercase' ? line.textContent.toLocaleUpperCase('tr') : line.textContent;
      const m = ctx.measureText(label);
      const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
      // CSS, yazının yazı tipi kutusunu satır kutusunun ortasına yerleştirir.
      const baseline = line.offsetTop + (line.offsetHeight - (asc + desc)) / 2 + asc;
      ctx.fillText(label, line.offsetLeft + line.offsetWidth / 2, baseline);
    }
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  new ResizeObserver(resize).observe(canvas);
  resize();

  // İmleç: son karedeki konumdan şimdikine bir çizgi boyanır, hızlı harekette boşluk kalmaz.
  const ptr = { x: 0, y: 0, px: 0, py: 0, has: false, lastMove: -10 };
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = r.height - (e.clientY - r.top);
    if (!ptr.has) { ptr.px = x; ptr.py = y; ptr.has = true; }
    ptr.x = x; ptr.y = y;
    ptr.lastMove = performance.now() / 1000;
    wake();
  });

  // Sadece bölüm görünürken ve iz tamamen erimemişken çalış.
  let visible = false, running = false, speed = 0;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  }).observe(observe);
  function wake() {
    if (running || !visible) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function frame(ms) {
    const t = ms / 1000;
    const moved = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py);
    speed += (moved - speed) * 0.2;
    const [read, write] = targets;

    gl.useProgram(update.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
    gl.viewport(0, 0, write.tw, write.th);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, read.tex);
    gl.uniform1i(update.u.prev, 0);
    gl.uniform2f(update.u.res, w, h);
    gl.uniform2f(update.u.a, ptr.px, ptr.py);
    gl.uniform2f(update.u.b, ptr.x, ptr.y);
    gl.uniform1f(update.u.radius, 38 + Math.min(speed, 60) * 0.7); // hızlı hareket = kalın iz
    gl.uniform1f(update.u.decay, 0.0045); // her karede silinme; küçüldükçe iz uzar
    gl.uniform1f(update.u.time, t);
    gl.uniform1f(update.u.active, ptr.has && moved > 0.5 ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    targets = [write, read];
    ptr.px = ptr.x;
    ptr.py = ptr.y;

    gl.useProgram(display.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, write.tex);
    gl.uniform1i(display.u.trail, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.uniform1i(display.u.textTex, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform3fv(display.u.bgCol, bgCol);
    gl.uniform3fv(display.u.fgCol, fgCol);
    gl.uniform2f(display.u.res, w, h);
    gl.uniform1f(display.u.time, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Son hareketten 5 sn sonra iz tamamen erimiş olur; döngüyü durdur.
    if (visible && t - ptr.lastMove < 5) requestAnimationFrame(frame);
    else running = false;
  }
}
