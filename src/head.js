import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Kafa sahnesi. Konum/dönüş "pose" nesnesinden okunur; main.js bu değerleri
// scroll ile tween'ler. x/y ekranın yarı genişliği/yüksekliği cinsindendir
// (x: 0.5 = ekranın sağ çeyreği), scale ise ekran yüksekliğine oranla kafa boyu.
export function createHead(canvas, { onProgress } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  // Stüdyo ışıkları: sıcak ana ışık önden-soldan, renkli kenar ışığı arkadan-sağdan.
  const key = new THREE.DirectionalLight(0xfff0e0, 2.4);
  key.position.set(-2.2, 1.6, 3);
  const rim = new THREE.DirectionalLight(0x86d6cb, 3.2);
  rim.position.set(1.6, 2.2, -5);
  const rimLeft = new THREE.DirectionalLight(0xffffff, 1.2);
  rimLeft.position.set(-3, 0.5, -2);
  const fill = new THREE.HemisphereLight(0xdfe6ff, 0x1a1c20, 0.5);
  scene.add(key, rim, rimLeft, fill);
  const baseIntensity = new Map([key, rim, rimLeft, fill].map((l) => [l, l.intensity]));

  const rig = new THREE.Group(); // scroll pozu
  const look = new THREE.Group(); // imleç takibi
  rig.add(look);
  scene.add(rig);

  const pose = { x: 0, y: 0, rotY: 0, rotX: 0, scale: 0.6, introRot: 0, light: 0 };

  const eyeUniforms = {
    uBlinkL: { value: 0 },
    uBlinkR: { value: 0 },
    uEyeL: { value: new THREE.Vector3(...EYES.left.center) },
    uEyeR: { value: new THREE.Vector3(...EYES.right.center) },
    uEyeSize: { value: new THREE.Vector2(...EYES.size) },
    uLidUvL: { value: new THREE.Vector2(...EYES.left.lidUv) },
    uLidUvR: { value: new THREE.Vector2(...EYES.right.lidUv) },
  };
  const blinker = createBlinker();

  // İmleç: kafanın ekrandaki konumuna göre bakış yönü.
  const pointer = { x: 0, y: 0, active: false };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return; // dokunmatik: aşağıdaki sürükleme
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.active = true;
  });

  // Dokunmatik: kafa parmakla yana sürüklenerek çevrilir, bırakınca yerine döner.
  // Kaydırmalı alanlarda (kartlar, ekran görüntüleri) ve bağlantılarda başlayan
  // dokunuşlar kafayı çevirmez.
  const drag = { active: false, startX: 0, base: 0, yaw: 0, onFirst: null };
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    if (e.target.closest?.('.project-list, .showcase-strip, a, button')) return;
    drag.active = true;
    drag.startX = e.clientX;
    drag.base = drag.yaw;
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag.active || e.pointerType === 'mouse') return;
    drag.yaw = drag.base + ((e.clientX - drag.startX) / window.innerWidth) * Math.PI * 1.6;
    if (drag.onFirst && Math.abs(e.clientX - drag.startX) > 12) {
      drag.onFirst();
      drag.onFirst = null;
    }
  });
  for (const type of ['pointerup', 'pointercancel']) {
    window.addEventListener(type, (e) => {
      if (e.pointerType !== 'mouse') drag.active = false;
    });
  }
  // Telefon eğimi
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || pointer.active) return;
    pointer.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
    pointer.y = THREE.MathUtils.clamp((45 - e.beta) / 30, -1, 1);
  });

  const draco = new DRACOLoader().setDecoderPath('/draco/');
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const ready = new Promise((resolve, reject) => {
    loader.load(
      '/models/head.glb',
      (gltf) => {
        const model = gltf.scene;
        // Ortala ve yüksekliği 1 birim yap.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(box.getCenter(new THREE.Vector3()));
        const wrap = new THREE.Group();
        wrap.add(model);
        wrap.scale.setScalar(1 / size.y);
        model.traverse((o) => {
          if (o.isMesh) patchMaterial(o.material, eyeUniforms);
        });
        look.add(wrap);
        resolve();
      },
      (e) => e.total && onProgress?.(e.loaded / e.total),
      reject,
    );
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  const lookCurrent = { x: 0, y: 0 };

  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * camera.aspect;

    // Dar ekranlarda kafa genişliğe sığsın.
    const viewSize = Math.min(halfH * 2, halfW * 2 * 1.25);
    const float = reduceMotion ? 0 : Math.sin(t * 0.9) * 0.012;
    rig.position.set(pose.x * halfW, (pose.y + float) * halfH, 0);
    rig.rotation.set(pose.rotX, pose.rotY + pose.introRot, 0);
    rig.scale.setScalar(viewSize * pose.scale);

    // Kafa, imlecin kendi konumuna göre nerede olduğuna bakar.
    const dx = THREE.MathUtils.clamp(pointer.x - pose.x, -1.2, 1.2);
    const dy = THREE.MathUtils.clamp(pointer.y - pose.y, -1, 1);
    const strength = reduceMotion ? 0.3 : 1;
    lookCurrent.x += (dx * 0.42 * strength - lookCurrent.x) * 0.06;
    lookCurrent.y += (-dy * 0.22 * strength - lookCurrent.y) * 0.06;
    if (!drag.active) drag.yaw *= 0.93; // bırakınca yumuşakça yerine döner
    look.rotation.set(lookCurrent.y, lookCurrent.x + drag.yaw, 0);

    const blink = blinker.update(t);
    eyeUniforms.uBlinkL.value = blink.l;
    eyeUniforms.uBlinkR.value = blink.r;

    for (const [light, base] of baseIntensity) light.intensity = base * pose.light;
    renderer.render(scene, camera);
  });

  return {
    pose, rimColor: rim.color, ready, wink: blinker.wink,
    onFirstDrag: (fn) => (drag.onFirst = fn), // ilk sürüklemede çağrılır (ipucunu gizlemek için)
  };
}

// Modelin kendi koordinatlarında göz konumları (raycast ile ölçüldü).
// Modeli değiştirirsen bu değerleri yeniden ölçmek gerekir.
const EYES = {
  left: { center: [-0.132, 0.375, 0.395], lidUv: [0.8115, 0.4421] },
  right: { center: [0.119, 0.38, 0.4], lidUv: [0.5298, 0.8268] },
  size: [0.064, 0.031], // yarı genişlik, yarı yükseklik
};

// Materyale iki şey ekler:
// 1) Boynun kesik alt kenarını şeffaflaştırıp fona karıştırır
//    (kesim düzlemi model hazırlanırken kullanılanla aynı: y = -0.19 - 0.15 * z).
// 2) Göz kırpma: modelde ayrı göz kapağı olmadığı için, göz bölgesi üst
//    ve alt kapak ten rengiyle örtülür; üst kapağın kenarına kirpik çizgisi çizilir.
function patchMaterial(material, uniforms) {
  material.transparent = true;
  material.side = THREE.FrontSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vLocal;
        uniform float uBlinkL, uBlinkR;
        uniform vec3 uEyeL, uEyeR;
        uniform vec2 uEyeSize, uLidUvL, uLidUvR;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        #ifdef USE_MAP
        for (int i = 0; i < 2; i++) {
          float blink = i == 0 ? uBlinkL : uBlinkR;
          vec3 c = i == 0 ? uEyeL : uEyeR;
          if (blink < 0.001 || abs(vLocal.z - c.z) > 0.08) continue;
          vec2 d = (vLocal.xy - c.xy) / uEyeSize;
          float e = 1.0 - d.x * d.x;
          if (e <= 0.0) continue;
          float h = sqrt(e);
          // Upper lid comes down, lower lid rises a little; they meet below center.
          float meet = -0.35 * h;
          float upper = mix(h * 1.05, meet, blink);
          float lower = mix(-h * 1.05, meet, blink);
          float aa = 0.06;
          float cover = max(smoothstep(upper - aa, upper + aa, d.y),
                            1.0 - smoothstep(lower - aa, lower + aa, d.y))
                      * (1.0 - smoothstep(h * 1.05, h * 1.05 + 0.12, abs(d.y)))
                      * smoothstep(0.0, 0.15, e);
          vec3 lid = texture2D(map, i == 0 ? uLidUvL : uLidUvR).rgb * 0.92;
          lid *= mix(0.8, 1.0, smoothstep(0.0, 0.5, d.y - upper)); // shadow under the lid fold
          lid *= mix(0.86, 1.0, smoothstep(-h, h * 0.5, d.y)); // under-eye is a bit darker
          float lash = (1.0 - smoothstep(0.0, 0.16, abs(d.y - upper)))
                     * smoothstep(0.0, 0.35, e) * smoothstep(0.0, 0.25, blink);
          lid = mix(lid, vec3(0.03, 0.02, 0.015), lash * 0.85);
          diffuseColor.rgb = mix(diffuseColor.rgb, lid, max(cover, lash * 0.85));
        }
        #endif`,
      )
      .replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\ngl_FragColor.a *= smoothstep(0.0, 0.07, vLocal.y - (-0.19 - 0.15 * vLocal.z));',
      );
  };
}

// Göz kırpma zamanlayıcısı: 2.5–6 sn'de bir kırpar, bazen arka arkaya iki kez.
// wink() sağ gözü tek başına, daha yavaş kırpar.
function createBlinker() {
  const CLOSE = 0.07, OPEN = 0.12;
  let next = 1.5 + Math.random() * 2, start = -1, doubleAt = -1, wink = -1;
  const curve = (dt, close, open) =>
    dt < 0 ? 0 : dt < close ? dt / close : dt < close + open ? 1 - (dt - close) / open : 0;
  return {
    wink: () => (wink = -2), // bir sonraki karede başlat
    update(t) {
      if (wink === -2) wink = t;
      if (t >= next && start < t - 1) {
        start = t;
        doubleAt = Math.random() < 0.2 ? t + CLOSE + OPEN + 0.08 : -1;
        next = t + 2.5 + Math.random() * 3.5;
      }
      let both = curve(t - start, CLOSE, OPEN);
      if (doubleAt > 0) both = Math.max(both, curve(t - doubleAt, CLOSE, OPEN));
      const w = wink >= 0 ? curve(t - wink, 0.12, 0.28) : 0;
      return { l: both, r: Math.max(both, w) };
    },
  };
}
