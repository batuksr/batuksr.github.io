import * as THREE from 'three';

// Üçüncü şahıs takip kamerası (yumuşak damping) + kokpit modu.
export function createFollowCamera(camera) {
  let mode = 'third'; // 'third' | 'first'

  const desired = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const currentLook = new THREE.Vector3(0, 30, 0);
  const fwd = new THREE.Vector3();
  let initialized = false;

  return {
    get mode() { return mode; },

    toggle() {
      mode = mode === 'third' ? 'first' : 'third';
      return mode;
    },

    update(dt, state, forwardDir) {
      forwardDir(fwd);

      if (mode === 'third') {
        // Uçağın arkasında ve üstünde, yaw'a göre döner
        const back = new THREE.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));
        desired.copy(state.pos)
          .addScaledVector(back, 11)
          .add(new THREE.Vector3(0, 4.2 + state.pitch * -3, 0));

        lookAt.copy(state.pos).addScaledVector(fwd, 10).add(new THREE.Vector3(0, 1.2, 0));

        if (!initialized) {
          camera.position.copy(desired);
          currentLook.copy(lookAt);
          initialized = true;
        }

        const k = 1 - Math.exp(-5.5 * dt);
        camera.position.lerp(desired, k);
        currentLook.lerp(lookAt, 1 - Math.exp(-7 * dt));
        camera.lookAt(currentLook);

        // Hafif hız hissi: hız arttıkça FOV genişler
        const targetFov = 62 + (state.speed - 13) * 0.28;
        camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-3 * dt));
        camera.updateProjectionMatrix();
      } else {
        // Kokpit: neredeyse sıfır gecikme
        desired.copy(state.pos).add(new THREE.Vector3(0, 1.15, 0)).addScaledVector(fwd, -0.4);
        camera.position.lerp(desired, 1 - Math.exp(-30 * dt));
        lookAt.copy(state.pos).addScaledVector(fwd, 40);
        camera.lookAt(lookAt);
        // Kokpitte yatışı kameraya da yansıt
        camera.rotation.z = state.roll * 0.9;
        if (camera.fov !== 68) { camera.fov = 68; camera.updateProjectionMatrix(); }
      }
    },
  };
}
