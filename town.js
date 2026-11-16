import * as THREE from 'three';

function roadTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = '#3a3a3e'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${90 + Math.random() * 60},${90 + Math.random() * 60},${95 + Math.random() * 60},.25)`; g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
  g.fillStyle = '#e8d44d'; g.fillRect(62, 10, 4, 50);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 12); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function wallTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#f2eee6'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
  [[40, 40], [156, 40], [40, 150], [156, 150]].forEach(([x, y]) => {
    g.fillStyle = '#ffffff'; g.fillRect(x - 5, y - 5, 70, 80);
    const gr = g.createLinearGradient(x, y, x + 60, y + 70); gr.addColorStop(0, '#9fd0ee'); gr.addColorStop(1, '#2d5f86');
    g.fillStyle = gr; g.fillRect(x, y, 60, 70);
    g.fillStyle = '#fff'; g.fillRect(x + 28, y, 4, 70); g.fillRect(x, y + 33, 60, 4);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function createTown(scene) {
  const colliders = [];
  const roadMat = new THREE.MeshStandardMaterial({ map: roadTexture(), roughness: 0.95 });
  [0, Math.PI / 2].forEach(r => {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 130), roadMat);
    road.rotation.set(-Math.PI / 2, 0, r, 'YXZ'); road.rotation.y = r; road.position.y = 0.05;
    road.receiveShadow = true; scene.add(road);
  });

  const wallTex = wallTexture();
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x9c4a32, roughness: 0.8 });
  const tints = [0xffe8c8, 0xd9ecff, 0xffd6d6, 0xe3f5d0, 0xf5e6ff];
  const spots = [];
  [-50, -34, 34, 50].forEach(p => { spots.push([p, 15], [p, -15], [15, p], [-15, p]); });
  spots.forEach(([x, z], i) => {
    const h = 6 + (i % 3) * 1.5;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(10, h, 10), new THREE.MeshStandardMaterial({ map: wallTex, color: tints[i % 5], roughness: 0.9 }));
    wall.position.set(x, h / 2, z); wall.castShadow = wall.receiveShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8.2, 3.2, 4), roofMat);
    roof.rotation.y = Math.PI / 4; roof.position.set(x, h + 1.6, z); roof.castShadow = true;
    scene.add(wall, roof); colliders.push({ x, z, hw: 5, hd: 5 });
  });

  const postMat = new THREE.MeshStandardMaterial({ color: 0x2b2b30, metalness: 0.6, roughness: 0.4 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffe9a0, emissiveIntensity: 0.8 });
  for (let p = -60; p <= 60; p += 20) {
    [[p, 6.5], [p, -6.5], [6.5, p], [-6.5, p]].forEach(([x, z]) => {
      if (Math.abs(x) < 8 && Math.abs(z) < 8) return;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5, 8), postMat); post.position.set(x, 2.5, z); post.castShadow = true;
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), lampMat); lamp.position.set(x, 5.1, z);
      scene.add(post, lamp);
    });
  }
  return { colliders };
}
