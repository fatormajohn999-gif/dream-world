import * as THREE from './three.js';
import { createTerrain, heightAt } from './terrain.js';
import { createTrees } from './trees.js';
import { createSky } from './sky.js';
import { createTown } from './town.js';
import { createCharacter } from './character.js';
import { startSound } from './sound.js';
window.__started = true;
document.getElementById('status').style.display = 'none';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 800);
const sky = createSky(scene);
createTerrain(scene);
createTrees(scene);
const town = createTown(scene);
const hero = createCharacter(); hero.group.position.set(0, 0, 20); scene.add(hero.group);

// Input
const keys = {}; let joy = { x: 0, y: 0 }, yaw = 0, pitch = 0.35;
addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
const joyEl = document.getElementById('joy'), knob = document.getElementById('knob');
const joyMove = e => { const t = e.touches[0], r = joyEl.getBoundingClientRect(); let dx = (t.clientX - r.left - 60) / 50, dy = (t.clientY - r.top - 60) / 50; const d = Math.hypot(dx, dy); if (d > 1) { dx /= d; dy /= d; } joy = { x: dx, y: dy }; knob.style.left = 40 + dx * 40 + 'px'; knob.style.top = 40 + dy * 40 + 'px'; };
joyEl.addEventListener('touchstart', e => { e.stopPropagation(); joyMove(e); }, { passive: false });
joyEl.addEventListener('touchmove', e => { e.preventDefault(); e.stopPropagation(); joyMove(e); }, { passive: false });
joyEl.addEventListener('touchend', () => { joy = { x: 0, y: 0 }; knob.style.left = knob.style.top = '40px'; });
let drag = null, soundOn = false;
renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; if (!soundOn) { soundOn = true; startSound(); } });
addEventListener('pointerup', () => drag = null);
addEventListener('pointermove', e => { if (!drag) return; yaw -= (e.clientX - drag.x) * 0.006; pitch = THREE.MathUtils.clamp(pitch + (e.clientY - drag.y) * 0.004, 0.1, 1.1); drag = { x: e.clientX, y: e.clientY }; });

function blocked(x, z) { return town.colliders.some(c => Math.abs(x - c.x) < c.hw + 0.5 && Math.abs(z - c.z) < c.hd + 0.5); }

const clock = new THREE.Clock();
(function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const ix = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0) + joy.x;
  const iz = (keys['w'] ? 1 : 0) - (keys['s'] ? 1 : 0) - joy.y;
  const len = Math.hypot(ix, iz), p = hero.group.position;
  if (len > 0.1) {
    const k = Math.min(len, 1) / len, speed = keys['shift'] ? 11 : 6;
    const mx = (Math.cos(yaw) * ix - Math.sin(yaw) * iz) * k * speed * dt;
    const mz = (-Math.sin(yaw) * ix - Math.cos(yaw) * iz) * k * speed * dt;
    if (!blocked(p.x + mx, p.z)) p.x += mx;
    if (!blocked(p.x, p.z + mz)) p.z += mz;
    hero.group.rotation.y = Math.atan2(mx, mz);
  }
  p.y = heightAt(p.x, p.z);
  hero.animate(dt, len > 0.1);

  const d = 13;
  const target = new THREE.Vector3(p.x + Math.sin(yaw) * Math.cos(pitch) * d, p.y + 2 + Math.sin(pitch) * d, p.z + Math.cos(yaw) * Math.cos(pitch) * d);
  camera.position.lerp(target, 0.15);
  camera.position.y = Math.max(camera.position.y, heightAt(camera.position.x, camera.position.z) + 1);
  camera.lookAt(p.x, p.y + 1.8, p.z);
  sky.update(dt, p);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
})();
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
