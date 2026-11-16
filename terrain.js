import * as THREE from './three.js';

// Rolling hills outside town, flat inside the town (radius ~70)
export function heightAt(x, z) {
  const d = Math.hypot(x, z);
  const h = Math.sin(x * 0.02) * Math.cos(z * 0.025) * 6 + Math.sin(x * 0.05 + z * 0.03) * 2 + Math.sin(z * 0.011) * 8;
  return h * THREE.MathUtils.smoothstep(d, 70, 140);
}

function grassTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#4a8a38'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 14000; i++) {
    g.fillStyle = `hsl(${80 + Math.random() * 45},${35 + Math.random() * 30}%,${18 + Math.random() * 30}%)`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 3 + Math.random() * 6);
  }
  for (let i = 0; i < 300; i++) { // tiny flowers
    g.fillStyle = ['#fff7a8', '#ffffff', '#ffb3d1'][i % 3];
    g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(130, 130);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function createTerrain(scene) {
  const geo = new THREE.PlaneGeometry(900, 900, 180, 180);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 1 }));
  mesh.receiveShadow = true;
  scene.add(mesh);
}
