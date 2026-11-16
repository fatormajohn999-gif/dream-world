import * as THREE from './three.js';

function cloudTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < 18; i++) {
    const x = 40 + Math.random() * 176, y = 50 + Math.random() * 30, r = 20 + Math.random() * 25;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,.55)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 128);
  }
  return new THREE.CanvasTexture(c);
}

export function createSky(scene) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#2f7fd6'); gr.addColorStop(0.55, '#8ec5f0'); gr.addColorStop(1, '#e8f3fb');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(450, 24, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false }));
  scene.add(dome);
  scene.fog = new THREE.Fog(0xcfe6f5, 80, 380);

  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x4a6a3a, 0.9));
  const sun = new THREE.DirectionalLight(0xfff0cf, 2.4);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const s = sun.shadow.camera; s.left = s.bottom = -60; s.right = s.top = 60; s.far = 250;
  scene.add(sun, sun.target);

  const ct = cloudTexture(), clouds = [];
  for (let i = 0; i < 28; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, transparent: true, depthWrite: false, fog: false }));
    sp.position.set((Math.random() - 0.5) * 700, 110 + Math.random() * 50, (Math.random() - 0.5) * 700);
    sp.scale.set(120 + Math.random() * 80, 50 + Math.random() * 30, 1);
    scene.add(sp); clouds.push(sp);
  }
  return {
    update(dt, focus) {
      clouds.forEach(c => { c.position.x += dt * 2; if (c.position.x > 350) c.position.x = -350; });
      dome.position.copy(focus);
      sun.position.set(focus.x + 70, 110, focus.z + 40); sun.target.position.copy(focus);
    }
  };
}
