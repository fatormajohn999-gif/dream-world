import * as THREE from 'three';
import { heightAt } from './terrain.js';

function noiseTex(base, hueRange, w, h, streak) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `hsla(${hueRange[0] + Math.random() * hueRange[1]},${40 + Math.random() * 30}%,${15 + Math.random() * 35}%,.7)`;
    streak ? g.fillRect(Math.random() * w, 0, 2, h * Math.random()) : g.fillRect(Math.random() * w, Math.random() * h, 5, 5);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function blob(r) { // lumpy leaf cluster
  const g = new THREE.IcosahedronGeometry(r, 3);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = 1 + (Math.sin(p.getX(i) * 3.1) * Math.cos(p.getZ(i) * 2.7) + Math.sin(p.getY(i) * 4)) * 0.12;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.85, p.getZ(i) * k);
  }
  g.computeVertexNormals(); return g;
}

export function createTrees(scene, count = 220) {
  const bark = new THREE.MeshStandardMaterial({ map: noiseTex('#5a3b20', [20, 15], 128, 256, true), roughness: 1 });
  const leafTex = noiseTex('#2f6b2a', [80, 50], 256, 256, false);
  const leafMats = [0xffffff, 0xd8ffb0, 0xb8e0a0].map(c => new THREE.MeshStandardMaterial({ map: leafTex, color: c, roughness: 0.9 }));
  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 5, 10);
  const blobs = [blob(2.6), blob(2.0), blob(1.7)];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 800, z = (Math.random() - 0.5) * 800;
    if (Math.hypot(x, z) < 68) continue; // keep town clear
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, bark); trunk.position.y = 2.5; trunk.castShadow = true;
    tree.add(trunk);
    const mat = leafMats[i % 3];
    [[0, 6.5, 0, 0], [1.4, 5.6, 0.6, 1], [-1.3, 5.4, -0.8, 1], [0.2, 8, 0.3, 2]].forEach(([bx, by, bz, bi]) => {
      const m = new THREE.Mesh(blobs[bi], mat); m.position.set(bx, by, bz); m.castShadow = true; tree.add(m);
    });
    const s = 0.8 + Math.random() * 0.9;
    tree.scale.setScalar(s); tree.rotation.y = Math.random() * 6.28;
    tree.position.set(x, heightAt(x, z), z);
    scene.add(tree);
  }
}
