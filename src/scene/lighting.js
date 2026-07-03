import * as THREE from 'three';

// Pastel ada dünyası için yumuşak ışıklandırma.
// Gölge kamerası uçağı takip eder; böylece küçük bir gölge haritası
// ile tüm dünyada keskin gölgeler elde ederiz.
export function createLighting(scene, isMobile) {
  const hemi = new THREE.HemisphereLight(0xeaf6ff, 0xd9c9a8, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3dd, 2.0);
  sun.position.set(120, 180, 80);
  sun.castShadow = !isMobile;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  sun.shadow.camera.near = 20;
  sun.shadow.camera.far = 500;
  const ext = 110;
  sun.shadow.camera.left = -ext;
  sun.shadow.camera.right = ext;
  sun.shadow.camera.top = ext;
  sun.shadow.camera.bottom = -ext;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  scene.add(sun.target);

  const offset = sun.position.clone();

  return {
    sun,
    // Gölge kamerasını uçağın etrafında tut
    follow(planePos) {
      sun.position.copy(planePos).add(offset);
      sun.target.position.copy(planePos);
    },
    setShadows(enabled) {
      sun.castShadow = enabled && !isMobile;
    },
  };
}
