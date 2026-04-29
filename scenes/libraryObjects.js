import * as THREE from "three";

// Retourne un mesh 3D selon le type d'objet
function createObject(film) {
  let mesh;
  const { object, color } = film;

  switch (object) {
    case "book": {
      const geo = new THREE.BoxGeometry(0.25, 0.38, 0.1);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
      mesh = new THREE.Mesh(geo, mat);
      // Tranche du livre
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.38, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x4a0000 })
      );
      spine.position.x = -0.14;
      mesh.add(spine);
      break;
    }
    case "blindfold": {
      const geo = new THREE.TorusGeometry(0.15, 0.03, 8, 24, Math.PI);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
      mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.PI / 2;
      break;
    }
    case "hand": {
      const group = new THREE.Group();
      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.18, 0.06),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      group.add(palm);
      // doigts
      for (let i = 0; i < 4; i++) {
        const finger = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.12, 0.04),
          new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
        );
        finger.position.set(-0.06 + i * 0.04, 0.15, 0);
        group.add(finger);
      }
      mesh = group;
      break;
    }
    case "lights": {
      const group = new THREE.Group();
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
      for (let i = 0; i < 5; i++) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.8 })
        );
        bulb.position.set(-0.2 + i * 0.1, Math.sin(i) * 0.05, 0);
        group.add(bulb);
      }
      mesh = group;
      break;
    }
    case "monster": {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.15),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      group.add(body);
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.18, 0.15),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      head.position.y = 0.24;
      group.add(head);
      // boulons
      for (let s of [-1, 1]) {
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8),
          new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(s * 0.12, 0.24, 0);
        group.add(bolt);
      }
      mesh = group;
      break;
    }
    case "safe": {
      const group = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.24, 0.22),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.6 })
      );
      group.add(box);
      const dial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 })
      );
      dial.rotation.x = Math.PI / 2;
      dial.position.z = 0.12;
      group.add(dial);
      mesh = group;
      break;
    }
    case "troll": {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, 0.28, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
      );
      group.add(body);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
      );
      head.position.y = 0.22;
      group.add(head);
      mesh = group;
      break;
    }
    case "fin": {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.15, 0.28);
      shape.lineTo(0.28, 0);
      shape.lineTo(0, 0);
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(geo, mat);
      break;
    }
    case "snake": {
      const group = new THREE.Group();
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.1, 0.1, 0),
        new THREE.Vector3(0, 0.18, 0),
        new THREE.Vector3(-0.08, 0.1, 0),
        new THREE.Vector3(0, 0.05, 0),
      ]);
      const geo = new THREE.TubeGeometry(path, 20, 0.025, 8, false);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      const tube = new THREE.Mesh(geo, mat);
      group.add(tube);
      mesh = group;
      break;
    }
    case "tornado": {
      const group = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const r = 0.04 + i * 0.025;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r, 0.012, 6, 16),
          new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
        );
        ring.position.y = i * 0.06;
        group.add(ring);
      }
      mesh = group;
      break;
    }
    case "silence": {
      const group = new THREE.Group();
      // Deux mains formant geste du silence
      const left = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.16, 0.04),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      left.position.x = -0.06;
      const right = left.clone();
      right.position.x = 0.06;
      group.add(left, right);
      const finger = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.12, 0.04),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      finger.position.set(0, 0.14, 0);
      group.add(finger);
      mesh = group;
      break;
    }
    case "vampire": {
      const group = new THREE.Group();
      // Cape
      const shape = new THREE.Shape();
      shape.moveTo(-0.15, 0);
      shape.lineTo(0, 0.3);
      shape.lineTo(0.15, 0);
      shape.lineTo(0, 0.05);
      shape.lineTo(-0.15, 0);
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide });
      group.add(new THREE.Mesh(geo, mat));
      mesh = group;
      break;
    }
    case "vesp": {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5, transparent: true, opacity: 0.8 })
      );
      group.add(body);
      for (let s of [-1, 1]) {
        const wing = new THREE.Mesh(
          new THREE.PlaneGeometry(0.16, 0.08),
          new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
        );
        wing.position.set(s * 0.12, 0.02, 0);
        wing.rotation.z = s * 0.4;
        group.add(wing);
      }
      mesh = group;
      break;
    }
    case "twins": {
      const group = new THREE.Group();
      for (let s of [-1, 1]) {
        const figure = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.07, 0.16, 0.06),
          new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
        );
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
        );
        head.position.y = 0.12;
        figure.add(body, head);
        figure.position.x = s * 0.08;
        group.add(figure);
      }
      mesh = group;
      break;
    }
    case "antler": {
      const group = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.025, 0.25, 6),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
      );
      group.add(stem);
      for (let i = 0; i < 3; i++) {
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.015, 0.1, 6),
          new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
        );
        branch.rotation.z = (i - 1) * 0.6;
        branch.position.set((i - 1) * 0.06, 0.08 + i * 0.02, 0);
        group.add(branch);
      }
      mesh = group;
      break;
    }
    case "stonebox": {
      const group = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.18, 0.18),
        new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.1 })
      );
      group.add(box);
      // Gravures simulées avec des petits cubes
      for (let i = 0; i < 3; i++) {
        const rune = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.04, 0.005),
          new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        rune.position.set(-0.06 + i * 0.06, 0, 0.092);
        group.add(rune);
      }
      mesh = group;
      break;
    }
    case "mask": {
      const geo = new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(geo, mat);
      break;
    }
    case "grass": {
      const group = new THREE.Group();
      for (let i = 0; i < 7; i++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, 0.15 + Math.random() * 0.1, 0.008),
          new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
        );
        blade.position.set(-0.1 + i * 0.03, 0, (Math.random() - 0.5) * 0.05);
        blade.rotation.z = (Math.random() - 0.5) * 0.3;
        group.add(blade);
      }
      mesh = group;
      break;
    }
    case "bite": {
      const group = new THREE.Group();
      // Mâchoire supérieure et inférieure
      for (let s of [1, -1]) {
        const jaw = new THREE.Mesh(
          new THREE.TorusGeometry(0.1, 0.015, 6, 12, Math.PI),
          new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
        );
        jaw.rotation.z = s === 1 ? 0 : Math.PI;
        jaw.position.y = s * 0.03;
        group.add(jaw);
        // dents
        for (let i = 0; i < 5; i++) {
          const tooth = new THREE.Mesh(
            new THREE.ConeGeometry(0.012, 0.04, 4),
            new THREE.MeshStandardMaterial({ color: 0xfffff0 })
          );
          const angle = (i / 4) * Math.PI;
          tooth.position.set(Math.cos(angle) * 0.1, s * 0.05, Math.sin(angle) * 0.02);
          tooth.rotation.z = s * -0.3;
          group.add(tooth);
        }
      }
      mesh = group;
      break;
    }
    case "vial": {
      const group = new THREE.Group();
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.7, metalness: 0.3 })
      );
      group.add(bottle);
      const liquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.033, 0.04, 0.14, 10),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 })
      );
      liquid.position.y = -0.02;
      group.add(liquid);
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.04, 0.03, 10),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
      );
      cap.position.y = 0.115;
      group.add(cap);
      mesh = group;
      break;
    }
    default: {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 10),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
    }
  }

  return mesh;
}

// Place les objets sur les étagères autour du mur circulaire
function placeObjects(scene, films, shelfRadius, state) {
  const levels = ["evident", "facile", "moyen", "difficile"];
  const shelfHeights = [0.5, 1.2, 1.95, 2.7]; // bas vers haut
  const meshMap = {};

  levels.forEach((level, li) => {
    const filmsInLevel = films[level];
    const count = filmsInLevel.length;

    filmsInLevel.forEach((film, i) => {
      // Répartition angulaire en évitant la zone de la porte (autour de 0 rad)
      const gapAngle = 0.3; // zone morte devant la porte
      const available = Math.PI * 2 - gapAngle;
      const startAngle = Math.PI + gapAngle / 2; // commence derrière la porte
      const angle = startAngle + (i / count) * available;

      const x = Math.sin(angle) * (shelfRadius - 0.3);
      const z = Math.cos(angle) * (shelfRadius - 0.3);
      const y = shelfHeights[li];

      const obj = createObject(film);
      obj.position.set(x, y, z);

      // Rotation pour faire face au centre
      obj.rotation.y = -angle;

      // UserData pour le raycaster
      obj.userData = { filmId: film.id, level, film };

      // Etat visuel selon progression
      if (state.completed.includes(film.id)) {
        applyCompletedStyle(obj);
      } else if (state.failed.includes(film.id)) {
        applyFailedStyle(obj);
      }

      // Niveau verrouillé = semi-transparent
      if (!state.unlocked.includes(level)) {
        applyLockedStyle(obj);
      }

      scene.add(obj);

      // Stocke toutes les meshes (y compris enfants) pour raycaster
      obj.traverse(child => {
        if (child.isMesh) {
          child.userData = { filmId: film.id, level, film, parentObj: obj };
          meshMap[film.id] = meshMap[film.id] || [];
          meshMap[film.id].push(child);
        }
      });
    });
  });

  return meshMap;
}

function applyCompletedStyle(obj) {
  obj.traverse(child => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.emissive = new THREE.Color(0xffd700);
      child.material.emissiveIntensity = 0.3;
    }
  });
}

function applyFailedStyle(obj) {
  obj.traverse(child => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.color = new THREE.Color(0x444444);
      child.material.emissiveIntensity = 0;
    }
  });
}

function applyLockedStyle(obj) {
  obj.traverse(child => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.35;
    }
  });
}

export default { placeObjects };