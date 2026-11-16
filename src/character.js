import * as THREE from './three.js';

// Simple walking character. Later we replace this with real faces / .glb models in /assets.
export function createCharacter() {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xd9a77c, roughness: 0.7 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x2f6fe0, roughness: 0.8 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x15110e, roughness: 1 });

  const add = (geo, mat, x, y, z, parent = group) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  add(new THREE.BoxGeometry(0.8, 0.95, 0.42), shirt, 0, 1.45, 0);
  add(new THREE.SphereGeometry(0.28, 20, 20), skin, 0, 2.2, 0);
  const cap = add(new THREE.SphereGeometry(0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 2.24, -0.02);

  const limb = (geo, mat, x, y) => { const piv = new THREE.Group(); piv.position.set(x, y, 0); add(geo, mat, 0, -0.4, 0, piv); group.add(piv); return piv; };
  const armGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.85, 10), legGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.95, 10);
  const armL = limb(armGeo, skin, -0.52, 1.85), armR = limb(armGeo, skin, 0.52, 1.85);
  const legL = limb(legGeo, pants, -0.2, 0.98), legR = limb(legGeo, pants, 0.2, 0.98);

  let t = 0;
  return {
    group,
    animate(dt, moving) {
      t += dt * (moving ? 9 : 0);
      const s = moving ? Math.sin(t) * 0.8 : 0;
      armL.rotation.x = s; armR.rotation.x = -s; legL.rotation.x = -s; legR.rotation.x = s;
    }
  };
}
