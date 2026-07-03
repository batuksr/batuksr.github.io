import * as THREE from 'three';
import { islandLayout } from '../data/content.js';
import { islandBuilders } from './islands.js';

// Dünya montajı: adaları yerleştirir, POI'leri (etkileşim noktaları)
// ve çarpışma dairelerini dünya koordinatlarına çevirir.
export function createWorld(scene) {
  const pois = [];        // { worldPos, radius, sectionId, projectIndex, label, beacon, islandId }
  const collisions = [];  // { x, z, r, topY } — uçağın altına inemeyeceği bölgeler
  const mapInfo = [];     // mini harita için { x, z, r, color, name, id }

  for (const island of islandLayout) {
    const builder = islandBuilders[island.id];
    if (!builder) continue;

    const built = builder(new THREE.Color(island.color));
    const [x, z] = island.position;
    built.group.position.set(x, 0, z);
    scene.add(built.group);

    for (const poi of built.pois) {
      pois.push({
        worldPos: poi.localPos.clone().add(new THREE.Vector3(x, 0, z)),
        radius: poi.radius,
        sectionId: poi.sectionId,
        projectIndex: poi.projectIndex,
        label: poi.label,
        beacon: poi.beacon,
        islandId: island.id,
      });
    }

    collisions.push({ x, z, r: built.collisionRadius, topY: built.topY });
    mapInfo.push({ x, z, r: built.collisionRadius, color: island.color, name: island.name, id: island.id });
  }

  return {
    pois,
    collisions,
    mapInfo,
    // Beacon animasyonu: dönme + süzülme + menzildeyken nabız gibi parlama
    update(t, activePoi) {
      for (const poi of pois) {
        const b = poi.beacon;
        if (!b) continue;
        b.rotation.y = t * 0.9;
        b.position.y += Math.sin(t * 1.8 + poi.worldPos.x) * 0.012;
        const active = poi === activePoi;
        const target = active ? 1.6 + Math.sin(t * 6) * 0.7 : 0.7;
        b.material.emissiveIntensity += (target - b.material.emissiveIntensity) * 0.1;
        const s = active ? 1.25 : 1;
        b.scale.lerp(new THREE.Vector3(s, s, s).multiplyScalar(b.userData.baseScale ?? (b.userData.baseScale = b.scale.x)), 0.08);
      }
    },
  };
}
