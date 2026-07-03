import * as THREE from 'three';

// Low-poly animasyonlu deniz. flatShading kullanıldığı için normaller
// fragment shader'da türetilir; her karede normal hesaplamak gerekmez.
export function createSea(scene) {
  const SIZE = 1700;
  const SEG = 72;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const base = new Float32Array(pos.array); // orijinal konumlar

  const mat = new THREE.MeshPhongMaterial({
    color: 0x6ec3d8,
    emissive: 0x1a4a5c,
    emissiveIntensity: 0.12,
    flatShading: true,
    shininess: 60,
    specular: 0x99ddee,
  });

  const sea = new THREE.Mesh(geo, mat);
  sea.receiveShadow = true;
  scene.add(sea);

  return {
    update(t) {
      const arr = pos.array;
      for (let i = 0; i < arr.length; i += 3) {
        const x = base[i];
        const z = base[i + 2];
        arr[i + 1] =
          Math.sin(x * 0.045 + t * 1.1) * 0.7 +
          Math.sin(z * 0.05 + t * 0.8) * 0.6 +
          Math.sin((x + z) * 0.02 + t * 0.5) * 0.5;
      }
      pos.needsUpdate = true;
    },
  };
}
