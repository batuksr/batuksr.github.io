import * as THREE from 'three';

// Basit geometrilerden prosedürel low-poly uçak.
// Harici model dosyasına bağımlılık yok.
export function createPlane(scene) {
  const group = new THREE.Group();
  group.rotation.order = 'YXZ'; // yaw → pitch → roll

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe26d5c, flatShading: true, roughness: 0.7 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf7f4ec, flatShading: true, roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x4a5058, flatShading: true, roughness: 0.6 });

  // Gövde (öne doğru daralan)
  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 6), bodyMat);
  fuselage.geometry.translate(0, 0, 0);
  group.add(fuselage);

  // Burun
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 1.2, 8), accentMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = -3.5;
  group.add(nose);

  // Pervane göbeği + kanatları
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 8), darkMat);
  spinner.rotation.x = -Math.PI / 2;
  spinner.position.z = -4.4;
  group.add(spinner);

  const propeller = new THREE.Group();
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.4, 0.1), darkMat);
  const blade2 = blade1.clone();
  blade2.rotation.z = Math.PI / 2;
  propeller.add(blade1, blade2);
  propeller.position.z = -4.15;
  group.add(propeller);

  // Kanatlar
  const wing = new THREE.Mesh(new THREE.BoxGeometry(11, 0.22, 2.2), accentMat);
  wing.position.set(0, 0.55, -0.6);
  group.add(wing);
  const wingTipL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 2.2), bodyMat);
  wingTipL.position.set(-5.5, 0.65, -0.6);
  const wingTipR = wingTipL.clone();
  wingTipR.position.x = 5.5;
  group.add(wingTipL, wingTipR);

  // Kuyruk
  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 1.3), accentMat);
  tailWing.position.set(0, 0.3, 2.7);
  group.add(tailWing);
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 1.6), bodyMat);
  tailFin.position.set(0, 1.1, 2.8);
  group.add(tailFin);

  // Kabin camı
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x86c5da, roughness: 0.2, flatShading: true })
  );
  canopy.scale.set(1, 0.8, 1.6);
  canopy.position.set(0, 0.85, -1.1);
  group.add(canopy);

  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });

  scene.add(group);

  return {
    group,
    propeller,
    // Görsel güncelleme: konum/açı state'ten gelir, pervane hıza göre döner
    sync(state, dt) {
      group.position.copy(state.pos);
      group.rotation.y = state.yaw;
      group.rotation.x = state.pitch; // pozitif pitch = burun yukarı
      group.rotation.z = state.roll;
      propeller.rotation.z += dt * (8 + state.speed * 0.9);
    },
    setVisible(v) {
      group.visible = v;
    },
  };
}
