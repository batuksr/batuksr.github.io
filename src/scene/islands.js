import * as THREE from 'three';
import { projects, about, skills, contact, profile } from '../data/content.js';

// ------------------------------------------------------------------
// Prosedürel low-poly ada üreticileri.
// Her üretici { group, pois, topY, collisionRadius } döndürür.
// poi: { localPos: Vector3, radius, sectionId, projectIndex?, label, beacon }
// ------------------------------------------------------------------

// Deterministik rastgele (her yüklemede aynı dünya)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const M = {
  grass: (c = 0x9fd08c) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 1 }),
  sand: () => new THREE.MeshStandardMaterial({ color: 0xf0e0b8, flatShading: true, roughness: 1 }),
  cliff: () => new THREE.MeshStandardMaterial({ color: 0xd8a97e, flatShading: true, roughness: 1 }),
  wood: () => new THREE.MeshStandardMaterial({ color: 0x9c7a52, flatShading: true, roughness: 1 }),
  white: () => new THREE.MeshStandardMaterial({ color: 0xf7f4ec, flatShading: true, roughness: 0.9 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x5c6470, flatShading: true, roughness: 0.9 }),
};

function jitterGeometry(geo, rnd, amount) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    // Üst/alt kapak merkezlerini bozmamak için yalnızca kenar noktalarına dokun
    const x = pos.getX(i), z = pos.getZ(i);
    if (Math.abs(x) < 0.01 && Math.abs(z) < 0.01) continue;
    pos.setX(i, x + (rnd() - 0.5) * amount);
    pos.setZ(i, z + (rnd() - 0.5) * amount);
  }
  geo.computeVertexNormals();
}

// Ada tabanı: kum halkası + kayalık gövde + çimen tepe
function makeIslandBase(rnd, radius, height, grassColor) {
  const g = new THREE.Group();

  const sand = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.18, radius * 1.35, 2.4, 9),
    M.sand()
  );
  jitterGeometry(sand.geometry, rnd, radius * 0.1);
  sand.position.y = 0.6;
  sand.receiveShadow = true;
  g.add(sand);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.98, radius * 1.14, height, 9),
    M.cliff()
  );
  jitterGeometry(body.geometry, rnd, radius * 0.09);
  body.position.y = height / 2 + 1.2;
  body.castShadow = body.receiveShadow = true;
  g.add(body);

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.0, 2.2, 9),
    M.grass(grassColor)
  );
  jitterGeometry(top.geometry, rnd, radius * 0.07);
  const topY = height + 2.2;
  top.position.y = topY - 1.1 + 1.2;
  top.receiveShadow = true;
  g.add(top);

  return { g, topY: topY + 1.2 };
}

function makeTree(rnd, scale = 1) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 2.2 * scale, 5), M.wood());
  trunk.position.y = 1.1 * scale;
  const leafColors = [0x7ebf6e, 0x8fca7c, 0x6bb05e];
  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry((1.6 + rnd() * 0.8) * scale, 0),
    new THREE.MeshStandardMaterial({ color: leafColors[Math.floor(rnd() * 3)], flatShading: true, roughness: 1 })
  );
  crown.position.y = (2.8 + rnd() * 0.6) * scale;
  trunk.castShadow = crown.castShadow = true;
  tree.add(trunk, crown);
  return tree;
}

function scatterTrees(group, rnd, count, innerR, outerR, topY, scale = 1) {
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = innerR + rnd() * (outerR - innerR);
    const tree = makeTree(rnd, scale * (0.8 + rnd() * 0.5));
    tree.position.set(Math.cos(a) * r, topY, Math.sin(a) * r);
    tree.rotation.y = rnd() * Math.PI;
    group.add(tree);
  }
}

// Yüzen, parlayan işaret (beacon) — yakınlık etkileşiminin görsel çapası
function makeBeacon(color) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.7,
    flatShading: true,
  });
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), mat);
  return beacon;
}

function makeLabelSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.font = '700 64px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  const w = ctx.measureText(text).width + 60;
  const x = 256, y = 64;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, 14, w, 100, 50);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3a3f4a';
  ctx.fillText(text, x, y + 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(26, 6.5, 1);
  return sprite;
}

// ---------------- ANA ÜS ----------------
function buildHome(color) {
  const rnd = mulberry32(11);
  const { g, topY } = makeIslandBase(rnd, 34, 10, 0xa8d494);

  // Pist
  const runway = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 46), M.dark());
  runway.position.set(0, topY + 0.25, 0);
  runway.receiveShadow = true;
  g.add(runway);
  for (let i = -4; i <= 4; i++) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 2.6), M.white());
    dash.position.set(0, topY + 0.28, i * 5);
    g.add(dash);
  }

  // Kontrol kulesi
  const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 9, 6), M.white());
  towerBase.position.set(-13, topY + 4.5, -8);
  const towerTop = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 3, 6), new THREE.MeshStandardMaterial({ color: 0x86c5da, flatShading: true, roughness: 0.4 }));
  towerTop.position.set(-13, topY + 10.5, -8);
  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0xef7d8e, flatShading: true }));
  towerRoof.position.set(-13, topY + 13.1, -8);
  towerBase.castShadow = towerTop.castShadow = towerRoof.castShadow = true;
  g.add(towerBase, towerTop, towerRoof);

  // Rüzgar tulumu
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 7, 5), M.white());
  pole.position.set(12, topY + 3.5, 14);
  const sock = new THREE.Mesh(new THREE.ConeGeometry(1, 3.4, 6), new THREE.MeshStandardMaterial({ color: 0xf4874b, flatShading: true }));
  sock.rotation.z = Math.PI / 2;
  sock.position.set(13.8, topY + 6.6, 14);
  g.add(pole, sock);

  scatterTrees(g, rnd, 7, 22, 30, topY);

  const beacon = makeBeacon(color);
  beacon.position.set(0, topY + 16, 0);
  g.add(beacon);
  const label = makeLabelSprite('Ana Üs', '#f2c94c');
  label.position.set(0, topY + 24, 0);
  g.add(label);

  return {
    group: g,
    topY,
    collisionRadius: 42,
    pois: [{
      localPos: new THREE.Vector3(0, topY + 8, 0),
      radius: 34,
      sectionId: 'home',
      label: `${profile.name} — Karşılama`,
      beacon,
    }],
  };
}

// ---------------- PROJELER ----------------
function buildProjects(color) {
  const rnd = mulberry32(22);
  const { g, topY } = makeIslandBase(rnd, 44, 12, 0x9fd08c);
  const pois = [];

  const hangarColors = [0xef7d8e, 0x86c5da, 0xf2c94c, 0x9b8ce0, 0x5bbfad, 0xf4874b];
  const n = projects.length;
  projects.forEach((project, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = 26;
    const px = Math.cos(a) * r;
    const pz = Math.sin(a) * r;

    // Hangar: yarım silindir + kapı
    const hangar = new THREE.Group();
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 10, 8, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: hangarColors[i % hangarColors.length], flatShading: true, roughness: 0.85 })
    );
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 0;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.4, 6.4), M.white());
    door.position.set(5.1, 0.1, 0);
    roof.castShadow = true;
    hangar.add(roof, door);
    hangar.position.set(px, topY + 0.2, pz);
    hangar.rotation.y = -a; // kapılar dışa baksın
    g.add(hangar);

    const beacon = makeBeacon(hangarColors[i % hangarColors.length]);
    beacon.scale.setScalar(0.75);
    beacon.position.set(px * 1.25, topY + 11, pz * 1.25);
    g.add(beacon);

    pois.push({
      localPos: new THREE.Vector3(px * 1.15, topY + 7, pz * 1.15),
      radius: 20,
      sectionId: 'projects',
      projectIndex: i,
      label: project.title.split('—')[0].trim(),
      beacon,
    });
  });

  scatterTrees(g, rnd, 6, 36, 41, topY, 0.9);

  const label = makeLabelSprite('Projeler', '#f4874b');
  label.position.set(0, topY + 26, 0);
  g.add(label);

  // Ada ortasına dekoratif vinç/anten
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 14, 5), M.dark());
  mast.position.set(0, topY + 7, 0);
  mast.castShadow = true;
  g.add(mast);

  return { group: g, topY, collisionRadius: 54, pois };
}

// ---------------- HAKKIMDA ----------------
function buildAbout(color) {
  const rnd = mulberry32(33);
  const { g, topY } = makeIslandBase(rnd, 36, 14, 0xa8d494);

  // Zaman çizelgesi: yükselen taş platformlar
  const steps = about.timeline.length;
  for (let i = 0; i < steps; i++) {
    const h = 2 + i * 2.2;
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 4.2, h, 6),
      new THREE.MeshStandardMaterial({ color: 0xcfd6e0, flatShading: true, roughness: 1 })
    );
    const a = -0.8 + i * 0.75;
    stone.position.set(Math.cos(a) * 16, topY + h / 2, Math.sin(a) * 16);
    stone.castShadow = stone.receiveShadow = true;
    g.add(stone);

    const flag = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 2.4, 4),
      new THREE.MeshStandardMaterial({ color, flatShading: true, emissive: color, emissiveIntensity: 0.25 })
    );
    flag.position.set(Math.cos(a) * 16, topY + h + 1.4, Math.sin(a) * 16);
    g.add(flag);
  }

  // Küçük ev
  const house = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 6), M.white());
  body.position.y = 2.5;
  const roofM = new THREE.Mesh(new THREE.ConeGeometry(5.6, 3.4, 4), new THREE.MeshStandardMaterial({ color: 0x9b8ce0, flatShading: true }));
  roofM.position.y = 6.7;
  roofM.rotation.y = Math.PI / 4;
  body.castShadow = roofM.castShadow = true;
  house.add(body, roofM);
  house.position.set(-10, topY, -10);
  g.add(house);

  scatterTrees(g, rnd, 9, 24, 33, topY);

  const beacon = makeBeacon(color);
  beacon.position.set(0, topY + 17, 0);
  g.add(beacon);
  const label = makeLabelSprite('Hakkımda', '#9b8ce0');
  label.position.set(0, topY + 25, 0);
  g.add(label);

  return {
    group: g,
    topY,
    collisionRadius: 46,
    pois: [{
      localPos: new THREE.Vector3(0, topY + 9, 0),
      radius: 32,
      sectionId: 'about',
      label: 'Hakkımda & Özgeçmiş',
      beacon,
    }],
  };
}

// ---------------- İLETİŞİM ----------------
function buildContact(color) {
  const rnd = mulberry32(44);
  const { g, topY } = makeIslandBase(rnd, 30, 11, 0x9fd08c);

  // Dev anten kulesi
  const towerMat = M.dark();
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.5 - i * 0.12, 0.7 - i * 0.12, 8, 5), towerMat);
    seg.position.set(0, topY + 4 + i * 8, 0);
    seg.castShadow = true;
    g.add(seg);
  }
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf7f4ec, flatShading: true, side: THREE.DoubleSide })
  );
  dish.rotation.x = Math.PI / 3;
  dish.position.set(0, topY + 26, 0);
  g.add(dish);

  // Sosyal medya totemleri
  contact.links.forEach((link, i) => {
    const a = (i / contact.links.length) * Math.PI * 2 + 0.5;
    const totem = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6 + i, 3.4), M.wood());
    totem.position.set(Math.cos(a) * 16, topY + (6 + i) / 2, Math.sin(a) * 16);
    totem.castShadow = true;
    g.add(totem);
    const gem = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 0),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, flatShading: true })
    );
    gem.position.set(Math.cos(a) * 16, topY + 8 + i, Math.sin(a) * 16);
    g.add(gem);
  });

  scatterTrees(g, rnd, 5, 20, 27, topY);

  const beacon = makeBeacon(color);
  beacon.position.set(0, topY + 34, 0);
  g.add(beacon);
  const label = makeLabelSprite('İletişim', '#ef7d8e');
  label.position.set(0, topY + 41, 0);
  g.add(label);

  return {
    group: g,
    topY,
    collisionRadius: 40,
    pois: [{
      localPos: new THREE.Vector3(0, topY + 12, 0),
      radius: 30,
      sectionId: 'contact',
      label: 'İletişim & Sosyal Medya',
      beacon,
    }],
  };
}

// ---------------- YETENEKLER ----------------
function buildSkills(color) {
  const rnd = mulberry32(55);
  const { g, topY } = makeIslandBase(rnd, 32, 12, 0xa8d494);

  // Yetenek grupları için rozet sütunları
  const total = skills.reduce((acc, s) => acc + s.items.length, 0);
  let idx = 0;
  skills.forEach((sg) => {
    sg.items.forEach(() => {
      const a = (idx / total) * Math.PI * 2;
      const r = 12 + (idx % 3) * 6;
      const h = 3 + rnd() * 5;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.7, h, 6),
        new THREE.MeshStandardMaterial({ color: 0xe8ecf2, flatShading: true, roughness: 1 })
      );
      pillar.position.set(Math.cos(a) * r, topY + h / 2, Math.sin(a) * r);
      pillar.castShadow = true;
      g.add(pillar);
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.1, 0),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, flatShading: true })
      );
      orb.position.set(Math.cos(a) * r, topY + h + 1.6, Math.sin(a) * r);
      g.add(orb);
      idx++;
    });
  });

  scatterTrees(g, rnd, 6, 24, 29, topY, 0.85);

  const beacon = makeBeacon(color);
  beacon.position.set(0, topY + 16, 0);
  g.add(beacon);
  const label = makeLabelSprite('Yetenekler', '#5bbfad');
  label.position.set(0, topY + 24, 0);
  g.add(label);

  return {
    group: g,
    topY,
    collisionRadius: 42,
    pois: [{
      localPos: new THREE.Vector3(0, topY + 8, 0),
      radius: 30,
      sectionId: 'skills',
      label: 'Yetenekler & Teknolojiler',
      beacon,
    }],
  };
}

export const islandBuilders = {
  home: buildHome,
  projects: buildProjects,
  about: buildAbout,
  contact: buildContact,
  skills: buildSkills,
};
