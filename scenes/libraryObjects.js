import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);

// Liste de tes fichiers réels pour calibrer leur taille sur l'étagère[cite: 9]
const GLB_TARGET_HEIGHT = {
  book: 0.55, blindfold: 0.40, hand: 0.50, demogorgon: 0.70, monster: 0.60,
  safe: 0.50, troll: 0.65, fin: 0.50, snake: 0.45, shark_tooth: 0.70,
  vesp: 0.45, vampire: 0.55, moder: 0.70, silence: 0.50, twins: 0.50,
  grass: 0.50, mask: 0.50, stonebox: 0.45, bite: 0.40, vial: 0.45
};

function createGLBObject(film, onLoaded) {
  const group = new THREE.Group();
  loader.load(`/assets/models/${film.object}.glb`, (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(1);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const targetH = GLB_TARGET_HEIGHT[film.object] ?? 0.50;
      model.scale.setScalar(targetH / Math.max(size.x, size.y, size.z));

      const box2 = new THREE.Box3().setFromObject(model);
      const center = box2.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -box2.min.y, -center.z);

      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.userData = { filmId: film.id, level: film.level, film, parentObj: group };
        }
      });
      group.add(model);
      if (onLoaded) onLoaded(group);
    }
  );
  return group;
}

export function placeObjects(scene, films, shelfRadius, state) {
  const levels = ["evident", "facile", "moyen", "difficile"];
  const shelfHeights = [1.50, 2.25, 3.00, 3.75];
  
  const meshMap = {};

  levels.forEach((level, li) => {
    films[level].forEach((film, i) => {
      const angle = (0.55 / 2) + ((i + 0.5) / films[level].length) * (Math.PI * 2 - 0.55);
      const obj = createGLBObject(film, (group) => {
        group.traverse(c => { 
          if(c.isMesh) { 
            if(!meshMap[film.id]) meshMap[film.id] = [];
            meshMap[film.id].push(c);
          }
        });
      });
      obj.position.set(Math.sin(angle)*(shelfRadius-0.55), shelfHeights[li], Math.cos(angle)*(shelfRadius-0.55));
      obj.rotation.y = angle + Math.PI;
      if (state.completed.includes(film.id)) applyCompletedStyle(obj);
      else if (state.failed.includes(film.id)) applyFailedStyle(obj);
      if (!state.unlocked.includes(level)) applyLockedStyle(obj);
      scene.add(obj);
    });
  });
  return { meshMap, manager };
}

function applyCompletedStyle(obj) {
  obj.traverse(child => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.emissive         = new THREE.Color(0xffd700);
      child.material.emissiveIntensity = 0.4;
    }
  });
}

function applyFailedStyle(obj) {
  obj.traverse(child => {
    if (child.isMesh && child.material) {
      child.material       = child.material.clone();
      child.material.color = new THREE.Color(0x3a3a3a);
      child.material.emissiveIntensity = 0;
    }
  });
}

function applyLockedStyle(obj) {
  obj.traverse(child => {
    if (child.isMesh && child.material) {
      child.material             = child.material.clone();
      child.material.transparent = true;
      child.material.opacity     = 0.35;
    }
  });
}

export default { placeObjects };