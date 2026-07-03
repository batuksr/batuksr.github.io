import * as THREE from 'three';

// Gradyan gökyüzü kubbesi + sürüklenen low-poly bulutlar + sıcak balonları
export function createSky(scene) {
  // --- Gök kubbe (shader ile dikey gradyan) ---
  const skyGeo = new THREE.SphereGeometry(1400, 24, 12);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      topColor: { value: new THREE.Color('#8ecbe8') },
      midColor: { value: new THREE.Color('#cde9f2') },
      botColor: { value: new THREE.Color('#f8e8d4') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 botColor;
      varying vec3 vPos;
      void main() {
        float h = normalize(vPos).y;
        vec3 c = h > 0.12
          ? mix(midColor, topColor, smoothstep(0.12, 0.65, h))
          : mix(botColor, midColor, smoothstep(-0.08, 0.12, h));
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // --- Bulutlar ---
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    transparent: true,
    opacity: 0.92,
    roughness: 1,
  });
  const clouds = new THREE.Group();
  const cloudList = [];
  for (let i = 0; i < 18; i++) {
    const cloud = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < puffs; p++) {
      const s = 6 + Math.random() * 9;
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), cloudMat);
      puff.position.set(p * (s * 0.9) - puffs * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 6);
      puff.scale.y = 0.55;
      cloud.add(puff);
    }
    cloud.position.set(
      (Math.random() - 0.5) * 1300,
      70 + Math.random() * 60,
      (Math.random() - 0.5) * 1300
    );
    const speed = 1.5 + Math.random() * 2.5;
    clouds.add(cloud);
    cloudList.push({ cloud, speed });
  }
  scene.add(clouds);

  // --- Sıcak hava balonları (dekoratif, yavaşça süzülür) ---
  const balloons = [];
  const balloonColors = [0xf4874b, 0x9b8ce0, 0x5bbfad];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    const envelope = new THREE.Mesh(
      new THREE.SphereGeometry(6, 10, 8),
      new THREE.MeshStandardMaterial({ color: balloonColors[i], flatShading: true, roughness: 0.9 })
    );
    envelope.scale.y = 1.2;
    const basket = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.8, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x8a6844, flatShading: true })
    );
    basket.position.y = -9;
    g.add(envelope, basket);
    const angle = (i / 3) * Math.PI * 2 + 0.7;
    g.position.set(Math.cos(angle) * 150, 55 + i * 14, Math.sin(angle) * 150);
    scene.add(g);
    balloons.push({ g, baseY: g.position.y, phase: i * 2.1 });
  }

  return {
    update(t, dt) {
      for (const { cloud, speed } of cloudList) {
        cloud.position.x += speed * dt;
        if (cloud.position.x > 750) cloud.position.x = -750;
      }
      for (const b of balloons) {
        b.g.position.y = b.baseY + Math.sin(t * 0.4 + b.phase) * 3;
        b.g.rotation.y += dt * 0.08;
      }
    },
  };
}
