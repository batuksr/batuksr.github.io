import * as THREE from 'three';

// Arcade uçuş modeli: gerçekçi aerodinamik yerine "iyi hissettiren" basit kurallar.
// - Hız hedefe doğru yumuşakça yaklaşır (ivmelenme hissi)
// - Dönüşte otomatik yatış (bank) animasyonu
// - Girdi yokken burun yavaşça düzelir (auto-level)
// - Yavaş ve alçaktayken ada yüzeyine İNİŞ yapılabilir; Boşluk ile kalkış
// - Hızlı geçişlerde ada tepeleri üzerinde minimum irtifa korunur
// - Harita sınırında nazikçe merkeze döndürme

const MIN_SPEED = 13;
const MAX_SPEED = 46;
const CRUISE = 24;
const MIN_ALT = 3.2;
const MAX_ALT = 120;
const WORLD_R = 470;

const LAND_MAX_SPEED = 21;  // bundan yavaşsan ada yüzeyine inebilirsin
const TAKEOFF_SPEED = 19;   // yerde bu hıza ulaşınca havalanırsın
const GROUND_CLEAR = 1.15;  // gövde merkezi ile zemin arası boşluk

export function createFlight(collisions) {
  const state = {
    pos: new THREE.Vector3(0, 30, 90), // Ana Üs'ün güneyinde, adaya bakarak başla
    yaw: 0,
    pitch: 0,
    roll: 0,
    speed: CRUISE,
    atEdge: false,
    grounded: false,
  };

  const dir = new THREE.Vector3();

  function forwardDir(out) {
    // yaw=0 iken -Z (kuzey); pozitif pitch yukarı
    const cp = Math.cos(state.pitch);
    out.set(-Math.sin(state.yaw) * cp, Math.sin(state.pitch), -Math.cos(state.yaw) * cp);
    return out;
  }

  // Uçağın altındaki ada (varsa)
  function islandBelow() {
    for (const c of collisions) {
      if (Math.hypot(state.pos.x - c.x, state.pos.z - c.z) < c.r) return c;
    }
    return null;
  }

  return {
    state,
    forwardDir: (out) => forwardDir(out),

    update(dt, input, autopilot) {
      let { turn, pitch: pitchIn, boost, brake, throttle } = input;

      // Panel açıkken: yerdeysen park halinde kal, havadaysan adayı turla
      if (autopilot) {
        if (state.grounded) {
          turn = 0; pitchIn = 0; boost = false; brake = false; throttle = null;
        } else {
          turn = 0.45;
          pitchIn = -state.pitch * 2; // burnu düzle
          boost = false; brake = true; throttle = null;
        }
      }

      const ground = islandBelow();

      // ================= YERDE (taksi / kalkış) =================
      if (state.grounded) {
        // Gaz: Boşluk veya mobilde gaz kolunu sonuna itmek kalkış koşusu başlatır
        const wantsTakeoff = boost || (throttle !== null && throttle !== undefined && throttle > 0.75);
        const targetSpeed = wantsTakeoff ? MAX_SPEED : 0;
        const k = wantsTakeoff ? 1.0 : 2.2; // fren sürtünmesi daha güçlü
        state.speed += (targetSpeed - state.speed) * (1 - Math.exp(-k * dt));
        if (state.speed < 0.05 && !wantsTakeoff) state.speed = 0;

        // Taksi dönüşü (hızlandıkça daha etkili)
        state.yaw += turn * 1.2 * dt * Math.min(1, state.speed / 8 + 0.15);

        // Gövdeyi düzle
        state.pitch += (0 - state.pitch) * Math.min(1, 6 * dt);
        state.roll += (0 - state.roll) * Math.min(1, 6 * dt);

        // Yerde ilerle
        state.pos.x += -Math.sin(state.yaw) * state.speed * dt;
        state.pos.z += -Math.cos(state.yaw) * state.speed * dt;

        if (ground) {
          state.pos.y = ground.topY + GROUND_CLEAR;
        } else {
          // Ada kenarından yuvarlandık: tekrar havadayız
          state.grounded = false;
        }

        if (state.speed >= TAKEOFF_SPEED) {
          state.grounded = false;
          state.pitch = 0.22; // yumuşak tırmanışla havalan
        }

        state.atEdge = false;
        return;
      }

      // ================= HAVADA =================
      // --- Hız ---
      let targetSpeed;
      if (throttle !== null && throttle !== undefined) {
        targetSpeed = MIN_SPEED + throttle * (MAX_SPEED - MIN_SPEED);
      } else {
        targetSpeed = boost ? MAX_SPEED : brake ? MIN_SPEED : CRUISE;
      }
      state.speed += (targetSpeed - state.speed) * (1 - Math.exp(-1.4 * dt));

      // --- Yönelim ---
      const speedFactor = 0.8 + 0.4 * (1 - (state.speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED));
      state.yaw += turn * 1.05 * speedFactor * dt;

      state.pitch += pitchIn * 1.15 * dt;
      if (pitchIn === 0) state.pitch -= state.pitch * Math.min(1, 1.6 * dt); // auto-level
      state.pitch = THREE.MathUtils.clamp(state.pitch, -0.55, 0.65);

      // Görsel yatış (bank)
      const rollTarget = turn * 0.5;
      state.roll += (rollTarget - state.roll) * (1 - Math.exp(-5 * dt));

      // --- Konum ---
      forwardDir(dir);
      state.pos.addScaledVector(dir, state.speed * dt);

      // --- Harita sınırı: nazikçe merkeze çevir ---
      const horizDist = Math.hypot(state.pos.x, state.pos.z);
      state.atEdge = horizDist > WORLD_R;
      if (state.atEdge) {
        const toCenter = Math.atan2(state.pos.x, state.pos.z); // merkeze bakan yaw
        let diff = toCenter - state.yaw;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        state.yaw += diff * Math.min(1, 1.2 * dt);
        if (horizDist > WORLD_R + 60) {
          const scale = (WORLD_R + 60) / horizDist;
          state.pos.x *= scale;
          state.pos.z *= scale;
        }
      }

      // --- İrtifa: iniş, ada üstü geçiş ve tavan ---
      let minY = MIN_ALT;
      if (ground) {
        const surfaceY = ground.topY + GROUND_CLEAR;
        if (state.speed < LAND_MAX_SPEED) {
          // Yavaşsın: yüzeye kadar alçalabilirsin → temas = iniş
          minY = surfaceY;
          if (state.pos.y <= surfaceY + 0.12) {
            state.grounded = true;
            state.pos.y = surfaceY;
            state.pitch = 0;
            state.roll *= 0.3;
            state.atEdge = false;
            return;
          }
        } else {
          // Hızlısın: adanın üzerinden emniyetli yükseklikte geç
          minY = ground.topY + 4.5;
        }
      }
      if (state.pos.y < minY) {
        state.pos.y += (minY - state.pos.y) * Math.min(1, 8 * dt);
        state.pitch = Math.max(state.pitch, 0);
      }
      if (state.pos.y > MAX_ALT) {
        state.pos.y = MAX_ALT;
        state.pitch = Math.min(state.pitch, 0);
      }
    },

    // Menüden ışınlanma: adanın yakınına, adaya bakacak şekilde yerleş
    teleportNear(x, z, topY) {
      const approach = Math.atan2(state.pos.x - x, state.pos.z - z); // mevcut yönden yaklaş
      const dist = 70;
      state.pos.set(x + Math.sin(approach) * dist, Math.max(topY + 20, 26), z + Math.cos(approach) * dist);
      state.yaw = approach; // adaya bak
      state.pitch = 0;
      state.roll = 0;
      state.speed = MIN_SPEED + 3;
      state.grounded = false;
    },

    constants: { MIN_SPEED, MAX_SPEED, WORLD_R, LAND_MAX_SPEED },
  };
}
