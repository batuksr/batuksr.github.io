import gsap from 'gsap';

// Büyüteç lensi: fare alanın üstündeyken imlecin etrafındaki yazılar balık gözü
// gibi büyür, lens kenarında hafif renk kayması olur.
//
// Nasıl: alandaki yazılar (h2 ve e-posta) DOM'daki yerleriyle birebir 2D tuvale
// çizilip WebGL dokusuna aktarılır; shader bu dokuyu imleç çevresinde büker.
// Lens açıkken gerçek yazılar saydamlaşır, kapanınca geri gelir.
// Dokunmatik cihazlarda ve "hareketi azalt" açıkken çalışmaz.

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
varying vec2 uv;
uniform sampler2D tex;
uniform vec2 res, mouse;     // CSS px, y up
uniform float radius, amount;
void main() {
  vec2 p = uv * res;
  vec2 d = p - mouse;
  float r = length(d) / max(radius, 1.0);
  vec2 q = p;
  float fringe = 0.0;
  vec2 dir = vec2(0.0);
  if (r < 1.0) {
    // Sample closer to the center than we are -> content looks magnified.
    float k = 1.0 - r;
    q = mouse + d * (1.0 - amount * k * k);
    fringe = k * 1.2;
    dir = d / max(length(d), 1e-3);
  }
  vec4 c = texture2D(tex, q / res);
  float red = texture2D(tex, (q + dir * fringe) / res).r;
  float blue = texture2D(tex, (q - dir * fringe) / res).b;
  gl_FragColor = vec4(red, c.g, blue, c.a);
}`;

export function createLens(wrap) {
  const ok =
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'lens-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.prepend(canvas);
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
  if (!gl) return canvas.remove();

  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(prog, s);
  }
  gl.bindAttribLocation(prog, 0, 'p');
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const u = (n) => gl.getUniformLocation(prog, n);
  const U = { tex: u('tex'), res: u('res'), mouse: u('mouse'), radius: u('radius'), amount: u('amount') };

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const texts = [...wrap.querySelectorAll('.section-title, .contact-mail')];
  let w = 1, h = 1, dpr = 1;

  // Yazıları DOM'daki yerlerine birebir çizer (renkleri o anki CSS'ten alır).
  // Lens açıkken gerçek yazılar saydam olduğundan, rengi doğru okumak için
  // "is-lens" sınıfı çizim süresince kaldırılır (aynı karede geri eklenir,
  // ekranda titreme olmaz).
  function rasterize() {
    const hadLens = wrap.classList.contains('is-lens');
    wrap.classList.remove('is-lens');
    const r = wrap.getBoundingClientRect();
    w = r.width; h = r.height;
    dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const c = document.createElement('canvas');
    c.width = canvas.width;
    c.height = canvas.height;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const el of texts) {
      const cs = getComputedStyle(el);
      const er = el.getBoundingClientRect();
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      ctx.fillStyle = cs.color;
      const m = ctx.measureText(el.textContent);
      const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
      const baseline = er.top - r.top + (er.height - (asc + desc)) / 2 + asc;
      ctx.fillText(el.textContent, er.left - r.left + er.width / 2, baseline);
    }
    if (hadLens) wrap.classList.add('is-lens');
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  }

  // Yazı satıra sığmayıp kırıldıysa (çok dar ekran) lensi kullanma.
  const wrapsLines = () =>
    texts.some((el) => el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).fontSize) * 1.6);

  const state = { x: 0, y: 0, tx: 0, ty: 0, radius: 0 };
  let running = false, active = false;

  function frame() {
    state.x += (state.tx - state.x) * 0.2;
    state.y += (state.ty - state.y) * 0.2;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(U.tex, 0);
    gl.uniform2f(U.res, w, h);
    gl.uniform2f(U.mouse, state.x, h - state.y);
    gl.uniform1f(U.radius, state.radius);
    gl.uniform1f(U.amount, 0.55);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (running) requestAnimationFrame(frame);
  }

  function local(e) {
    const r = wrap.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  wrap.addEventListener('pointerenter', (e) => {
    if (wrapsLines()) return;
    rasterize();
    [state.tx, state.ty] = local(e);
    if (!active) [state.x, state.y] = [state.tx, state.ty];
    active = true;
    wrap.classList.add('is-lens');
    gsap.to(state, { radius: 170, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    if (!running) { running = true; requestAnimationFrame(frame); }
  });
  wrap.addEventListener('pointermove', (e) => { [state.tx, state.ty] = local(e); });
  wrap.addEventListener('pointerleave', () => {
    if (!active) return;
    gsap.to(state, {
      radius: 0, duration: 0.45, ease: 'power2.inOut', overwrite: 'auto',
      onComplete: () => {
        active = false;
        running = false;
        wrap.classList.remove('is-lens');
      },
    });
  });
  window.addEventListener('resize', () => active && rasterize());
}
