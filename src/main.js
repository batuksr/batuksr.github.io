import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import './styles.css';
import { profile, islandLayout } from './data/content.js';
import { createLighting } from './scene/lighting.js';
import { createSky } from './scene/sky.js';
import { createSea } from './scene/sea.js';
import { createWorld } from './scene/world.js';
import { createPlane } from './plane/plane.js';
import { createInput } from './plane/input.js';
import { createFlight } from './plane/flight.js';
import { createFollowCamera } from './plane/followCamera.js';
import { createLoadingScreen } from './ui/loading.js';
import { createHud } from './ui/hud.js';
import { createMinimap } from './ui/minimap.js';
import { createPanels } from './ui/panels.js';
import { createMenu } from './ui/menu.js';
import { createMobileControls } from './ui/mobile.js';
import { createAudio } from './ui/audio.js';

// ================= Kurulum =================
const loading = createLoadingScreen();
loading.setProgress(0.1);

const isMobile = window.matchMedia('(pointer: coarse)').matches;

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xdff0f5, 160, 750);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 2200);
camera.position.set(0, 40, 140);

loading.setProgress(0.3);

// Sahne bileşenleri
const lighting = createLighting(scene, isMobile);
const sky = createSky(scene);
const sea = createSea(scene);
loading.setProgress(0.55);
const world = createWorld(scene);
loading.setProgress(0.75);

// Uçak
const plane = createPlane(scene);
const flight = createFlight(world.collisions);
const followCam = createFollowCamera(camera);
const input = createInput();

// Post-processing: hafif bloom (beacon parlamaları için)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.32, // strength
  0.6,  // radius
  0.82  // threshold
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());
let useComposer = !isMobile; // mobilde bloom'suz başla

loading.setProgress(0.9);

// ================= UI =================
const hud = createHud();
const minimap = createMinimap(world.mapInfo, flight.constants.WORLD_R);
const panels = createPanels();
const audio = createAudio();

const interactPrompt = document.getElementById('interact-prompt');
const interactText = document.getElementById('interact-text');

let autopilot = false;
panels.onOpenChange((open) => {
  autopilot = open;
  if (open) audio.blip();
});

const mobile = createMobileControls(input, {
  onInteract: () => tryInteract(),
  onToggleCamera: () => toggleCamera(),
});

function toggleCamera() {
  const mode = followCam.toggle();
  plane.setVisible(mode === 'third');
}

input.on('toggleCamera', toggleCamera);
input.on('interact', () => tryInteract());
input.on('closePanel', () => panels.close());

// Menüden ışınlanma
createMenu({
  onNavigate(islandId) {
    const isl = islandLayout.find((i) => i.id === islandId);
    const col = world.collisions[islandLayout.indexOf(isl)];
    const poi = world.pois.find((p) => p.islandId === islandId);
    panels.close();
    flight.teleportNear(isl.position[0], isl.position[1], col ? col.topY : 12);
    if (poi) panels.open(poi.sectionId, poi.projectIndex);
  },
  onShowControls() {
    panels.close();
    hintCard.classList.remove('hidden');
  },
});

// İlk ziyaret kartı
const hintCard = document.getElementById('hint-card');
document.getElementById('hint-start').addEventListener('click', () => {
  hintCard.classList.add('hidden');
  localStorage.setItem('portfolyo-visited', '1');
  audio.unlock();
});

// ================= Yakınlık algılama =================
let currentPoi = null;

// İniş/kalkış bildirimi
const landedToast = document.getElementById('landed-toast');
if (isMobile) {
  landedToast.innerHTML = '🛬 İniş başarılı! Kalkış için gaz kolunu sonuna it';
}
let wasGrounded = false;

function updateLandedToast() {
  const g = flight.state.grounded;
  if (g !== wasGrounded) {
    wasGrounded = g;
    landedToast.classList.toggle('hidden', !g || panels.isOpen);
    if (g) audio.blip();
  }
  // Panel açıkken bildirimi gizle, kapanınca (hâlâ yerdeysen) geri getir
  if (g) landedToast.classList.toggle('hidden', panels.isOpen);
}

let promptVisible = false;

function updateProximity() {
  const pos = flight.state.pos;
  let best = null;
  let bestDist = Infinity;
  for (const poi of world.pois) {
    const d = poi.worldPos.distanceTo(pos);
    if (d < poi.radius && d < bestDist) { best = poi; bestDist = d; }
  }
  if (best !== currentPoi) {
    currentPoi = best;
    if (best) interactText.textContent = `${best.label} — panelini aç`;
  }
  const shouldShow = !!currentPoi && !panels.isOpen;
  if (shouldShow !== promptVisible) {
    promptVisible = shouldShow;
    interactPrompt.classList.toggle('hidden', !shouldShow);
    mobile.setInteractVisible(shouldShow);
  }
}

function tryInteract() {
  if (panels.isOpen) return;
  if (currentPoi) {
    panels.open(currentPoi.sectionId, currentPoi.projectIndex);
    interactPrompt.classList.add('hidden');
    mobile.setInteractVisible(false);
  }
}

// ================= Adaptif performans =================
// FPS düşerse kademeli olarak kaliteyi azalt:
// 1) bloom kapat → 2) pixelRatio düşür → 3) gölgeleri kapat
let perfLevel = 0;
let fpsSamples = 0;
let fpsTime = 0;

function checkPerformance(dt) {
  fpsSamples++;
  fpsTime += dt;
  if (fpsTime < 2.5) return;
  const fps = fpsSamples / fpsTime;
  fpsSamples = 0;
  fpsTime = 0;
  if (fps < 42 && perfLevel < 3) {
    perfLevel++;
    if (perfLevel === 1) useComposer = false;
    if (perfLevel === 2) renderer.setPixelRatio(1);
    if (perfLevel === 3) { renderer.shadowMap.enabled = false; lighting.setShadows(false); }
  }
}

// ================= Döngü =================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  flight.update(dt, input.getState(), autopilot);
  plane.sync(flight.state, dt);
  followCam.update(dt, flight.state, flight.forwardDir);

  sea.update(t);
  sky.update(t, dt);
  world.update(t, currentPoi);
  lighting.follow(flight.state.pos);

  updateProximity();
  updateLandedToast();
  hud.update(flight.state);
  minimap.update(flight.state);
  audio.update(flight.state.speed);
  checkPerformance(dt);

  if (useComposer) composer.render();
  else renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ================= Başlat =================
document.title = `${profile.name} | 3D Portfolyo — Uçarak Keşfet`;
loading.setProgress(1);
loading.done();
hud.show();
minimap.show();

// İlk ziyarette kontrol kartını göster (?nohint ile atlanabilir)
const skipHint = new URLSearchParams(location.search).has('nohint');
if (!skipHint && !localStorage.getItem('portfolyo-visited')) {
  setTimeout(() => hintCard.classList.remove('hidden'), 950);
}

animate();
