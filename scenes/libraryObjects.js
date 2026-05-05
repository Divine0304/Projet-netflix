import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

// ─── GLB — niveau Évident ─────────────────────────────────────────────────
const GLB_OBJECTS = ["book", "blindfold", "hand", "demogorgon", "monster"];

// Taille cible souhaitée pour chaque modèle (hauteur max en unités Three.js)
// On calcule l'échelle dynamiquement à partir du bounding box réel du GLB
const GLB_TARGET_HEIGHT = {
  book:       0.55,   // Plus grand pour la visibilité
  blindfold:  0.40,   // Un peu moins haut car c'est un objet plat
  hand:       0.50,   
  demogorgon: 0.70,   
  monster:    0.60,  // Frankenstein
};

// Décalage Y supplémentaire après centrage (pour poser l'objet à plat sur l'étagère)
const GLB_Y_OFFSET = {
  book:       0.5,
  blindfold:  0.04,
  hand:       0.0,
  demogorgon: 0.0,
  monster:    0.0,
};

// ─── Chargement GLB avec mise à l'échelle automatique ────────────────────
function createGLBObject(film) {
  const group = new THREE.Group();

  loader.load(
    `/assets/models/${film.object}.glb`,
    (gltf) => {
      const model = gltf.scene;

      // 1. Calculer le bounding box du modèle à l'échelle 1
      model.scale.setScalar(1);
      const box    = new THREE.Box3().setFromObject(model);
      const size   = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // 2. Calculer l'échelle pour atteindre la hauteur cible
      const targetH = GLB_TARGET_HEIGHT[film.object] ?? 0.30;
      const scale   = targetH / maxDim;
      model.scale.setScalar(scale);

      // 3. Repositionner : base du modèle à y=0 dans le groupe
      const box2   = new THREE.Box3().setFromObject(model);
      const center = box2.getCenter(new THREE.Vector3());
      model.position.x = -center.x;
      model.position.z = -center.z;
      model.position.y = -box2.min.y + (GLB_Y_OFFSET[film.object] ?? 0);

      // 4. Ombres
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow    = true;
          child.receiveShadow = true;
          child.userData      = { ...group.userData };
        }
      });

      group.add(model);
    },
    undefined,
    (err) => {
      console.warn(`[libraryObjects] GLB manquant : ${film.object}.glb`, err);
      const fb = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 10, 10),
        new THREE.MeshStandardMaterial({ color: film.color ?? 0xff2200, roughness: 0.7 })
      );
      fb.userData = { ...group.userData };
      group.add(fb);
    }
  );

  return group;
}

// ─── Géométries Three.js pures (fallback + niveaux 2-4) ──────────────────
function createObject(film) {
  let mesh;
  const { object, color } = film;

  switch (object) {

    // ── Fallbacks Évident ──
    case "book": {
      const g    = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.32, 0.08),
        new THREE.MeshStandardMaterial({ color: color ?? 0x8b0000, roughness: 0.8 })
      );
      g.add(body);
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.32, 0.085),
        new THREE.MeshStandardMaterial({ color: 0x4a0000 })
      );
      spine.position.x = -0.12;
      g.add(spine);
      mesh = g; break;
    }
    case "blindfold": {
      mesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.03, 8, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: color ?? 0xf5f5dc, roughness: 0.9 })
      );
      mesh.rotation.x = Math.PI / 2;
      break;
    }
    case "hand": {
      const g    = new THREE.Group();
      const mat  = new THREE.MeshStandardMaterial({ color: color ?? 0x2d5a27, roughness: 0.7 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.06), mat));
      for (let i = 0; i < 4; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.04), mat);
        f.position.set(-0.06 + i * 0.04, 0.15, 0);
        g.add(f);
      }
      mesh = g; break;
    }
    case "demogorgon": {
      const g   = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0x8b2222, roughness: 0.7 });
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), mat));
      for (let i = 0; i < 6; i++) {
        const ang   = (i / 6) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), mat);
        petal.position.set(Math.cos(ang) * 0.14, 0.1, Math.sin(ang) * 0.14);
        petal.rotation.z = Math.PI / 2 - Math.atan2(0.14, 0.1);
        petal.rotation.y = -ang;
        g.add(petal);
      }
      mesh = g; break;
    }
    case "monster": {
      const g   = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0x4a7c59, roughness: 0.7 });
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 10), mat));
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), mat);
      head.position.y = 0.19;
      g.add(head);
      for (let s of [-1, 1]) {
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8),
          new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
        );
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(s * 0.1, 0.19, 0);
        g.add(bolt);
      }
      mesh = g; break;
    }

    // ── Niveau Facile ──
    case "safe": {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.24, 0.22),
        new THREE.MeshStandardMaterial({ color: color ?? 0x8b7355, roughness: 0.4, metalness: 0.6 })
      ));
      const dial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 })
      );
      dial.rotation.x = Math.PI / 2;
      dial.position.z = 0.12;
      g.add(dial);
      mesh = g; break;
    }
    case "troll": {
      const g   = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0x696969, roughness: 0.95 });
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.28, 8), mat));
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), mat);
      h.position.y = 0.22;
      g.add(h);
      mesh = g; break;
    }
    case "fin": {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.15, 0.28);
      shape.lineTo(0.28, 0);
      shape.lineTo(0, 0);
      mesh = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshStandardMaterial({ color: color ?? 0x1a5276, roughness: 0.6, side: THREE.DoubleSide })
      );
      break;
    }
    case "snake": {
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),   new THREE.Vector3(0.1, 0.1, 0),
        new THREE.Vector3(0, 0.18, 0), new THREE.Vector3(-0.08, 0.1, 0),
        new THREE.Vector3(0, 0.05, 0),
      ]);
      mesh = new THREE.Mesh(
        new THREE.TubeGeometry(path, 20, 0.025, 8, false),
        new THREE.MeshStandardMaterial({ color: color ?? 0x2d5016, roughness: 0.7 })
      );
      break;
    }
    case "shark_tooth": {
      const g     = new THREE.Group();
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(-0.08, 0.22);
      shape.lineTo(0.08, 0.22);
      shape.lineTo(0.04, 0.02);
      shape.lineTo(0, 0);
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0xd3d3d3, roughness: 0.5 });
      const t1  = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false }), mat);
      t1.position.set(-0.04, -0.1, -0.015);
      g.add(t1);
      const t2 = t1.clone();
      t2.scale.set(0.7, 0.7, 0.7);
      t2.position.set(0.06, -0.1, -0.015);
      g.add(t2);
      mesh = g; break;
    }

    // ── Niveau Moyen ──
    case "silence": {
      const g   = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0xd4af37, roughness: 0.7 });
      const l   = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.04), mat);
      l.position.x = -0.06; g.add(l);
      const r = l.clone(); r.position.x = 0.06; g.add(r);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.04), mat);
      f.position.set(0, 0.14, 0); g.add(f);
      mesh = g; break;
    }
    case "vampire": {
      const shape = new THREE.Shape();
      shape.moveTo(-0.15, 0); shape.lineTo(0, 0.3);
      shape.lineTo(0.15, 0);  shape.lineTo(0, 0.05); shape.lineTo(-0.15, 0);
      mesh = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshStandardMaterial({ color: color ?? 0x4b0082, roughness: 0.8, side: THREE.DoubleSide })
      );
      break;
    }
    case "vesp": {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color: color ?? 0x8b8682, roughness: 0.5, transparent: true, opacity: 0.8 })
      ));
      for (let s of [-1, 1]) {
        const w = new THREE.Mesh(
          new THREE.PlaneGeometry(0.16, 0.08),
          new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
        );
        w.position.set(s * 0.12, 0.02, 0);
        w.rotation.z = s * 0.4;
        g.add(w);
      }
      mesh = g; break;
    }
    case "twins": {
      const g   = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0x3d1c02, roughness: 0.8 });
      for (let s of [-1, 1]) {
        const fig  = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.06), mat);
        fig.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat);
        head.position.y = 0.12;
        fig.add(head);
        fig.position.x = s * 0.08;
        g.add(fig);
      }
      mesh = g; break;
    }
    case "antler": {
      const g   = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0x1c3a1c, roughness: 0.9 });
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.25, 6), mat));
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.1, 6), mat);
        b.rotation.z = (i - 1) * 0.6;
        b.position.set((i - 1) * 0.06, 0.08 + i * 0.02, 0);
        g.add(b);
      }
      mesh = g; break;
    }

    // ── Niveau Difficile ──
    case "stonebox": {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.18, 0.18),
        new THREE.MeshStandardMaterial({ color: color ?? 0x4a4a4a, roughness: 0.95, metalness: 0.1 })
      ));
      for (let i = 0; i < 3; i++) {
        const rune = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.04, 0.005),
          new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        rune.position.set(-0.06 + i * 0.06, 0, 0.092);
        g.add(rune);
      }
      mesh = g; break;
    }
    case "mask": {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
        new THREE.MeshStandardMaterial({ color: color ?? 0xd2b48c, roughness: 0.7, side: THREE.DoubleSide })
      );
      break;
    }
    case "grass": {
      const g = new THREE.Group();
      for (let i = 0; i < 7; i++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, 0.12 + Math.random() * 0.08, 0.008),
          new THREE.MeshStandardMaterial({ color: color ?? 0x556b2f, roughness: 0.9 })
        );
        blade.position.set(-0.09 + i * 0.03, 0, (Math.random() - 0.5) * 0.04);
        blade.rotation.z = (Math.random() - 0.5) * 0.3;
        g.add(blade);
      }
      mesh = g; break;
    }
    case "bite": {
      const g   = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: color ?? 0x8b4513, roughness: 0.6 });
      for (let s of [1, -1]) {
        const jaw = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 6, 12, Math.PI), mat);
        jaw.rotation.z = s === 1 ? 0 : Math.PI;
        jaw.position.y = s * 0.03;
        g.add(jaw);
        for (let i = 0; i < 5; i++) {
          const ang   = (i / 4) * Math.PI;
          const tooth = new THREE.Mesh(
            new THREE.ConeGeometry(0.012, 0.04, 4),
            new THREE.MeshStandardMaterial({ color: 0xfffff0 })
          );
          tooth.position.set(Math.cos(ang) * 0.1, s * 0.05, Math.sin(ang) * 0.02);
          tooth.rotation.z = s * -0.3;
          g.add(tooth);
        }
      }
      mesh = g; break;
    }
    case "vial": {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.7, metalness: 0.3 })
      ));
      const liquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.033, 0.04, 0.14, 10),
        new THREE.MeshStandardMaterial({ color: color ?? 0x00ff7f, emissive: color ?? 0x00ff7f, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 })
      );
      liquid.position.y = -0.02;
      g.add(liquid);
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.04, 0.03, 10),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
      );
      cap.position.y = 0.115;
      g.add(cap);
      mesh = g; break;
    }
    default: {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 10, 10),
        new THREE.MeshStandardMaterial({ color: color ?? 0xffffff, roughness: 0.7 })
      );
    }
  }

  return mesh;
}

// ─── Placement ────────────────────────────────────────────────────────────
function placeObjects(scene, films, shelfRadius, state) {
  const levels = ["evident", "facile", "moyen", "difficile"];

  // Hauteurs des planches dans libraryScene.js : [0.6, 1.35, 2.15, 3.0]
  // On pose les objets SUR la planche (épaisseur 0.065) → +0.065
  const shelfHeights = [0.665, 1.415, 2.215, 3.065];

  // Rayon de placement : légèrement en retrait du mur pour être visible
  // shelfRadius = SHELF_RADIUS - 0.25 (rayon du torus de l'étagère)
  // On place à shelfRadius - 0.55 pour être bien au centre de la planche
  const placeRadius = shelfRadius - 0.55;

  const meshMap = {};

  levels.forEach((level, li) => {
    const filmsInLevel = films[level];
    const count        = filmsInLevel.length; // 5 par niveau

    filmsInLevel.forEach((film, i) => {
      // ── Angle de placement ─────────────────────────────
      // Porte à angle=0 (z+). On évite cette zone avec gapAngle.
      // On répartit les 5 objets uniformément sur ~320° restants.
      // (i + 0.5) / count centre chaque objet dans sa tranche.
      const gapAngle   = 0.55;
      const available  = Math.PI * 2 - gapAngle;
      const startAngle = gapAngle / 2;
      const angle      = startAngle + ((i + 0.5) / count) * available;

      const x = Math.sin(angle) * placeRadius;
      const z = Math.cos(angle) * placeRadius;
      const y = shelfHeights[li];

      // ── Créer l'objet ──────────────────────────────────
      const obj = GLB_OBJECTS.includes(film.object)
        ? createGLBObject(film)
        : createObject(film);

      // Position finale : posé sur l'étagère, face au centre
      obj.position.set(x, y, z);

      // La rotation y oriente l'objet vers le centre de la pièce
      // angle pointe vers l'extérieur → on tourne de PI pour faire face au centre
      obj.rotation.y = angle + Math.PI;

      // userData pour le raycaster
      obj.userData = { filmId: film.id, level, film };

      // États visuels
      if (state.completed.includes(film.id))   applyCompletedStyle(obj);
      else if (state.failed.includes(film.id)) applyFailedStyle(obj);
      if (!state.unlocked.includes(level))     applyLockedStyle(obj);

      scene.add(obj);

      // ── Enregistrement raycaster ───────────────────────
      function registerMeshes() {
        obj.traverse(child => {
          if (child.isMesh) {
            child.userData = { filmId: film.id, level, film, parentObj: obj };
            if (!meshMap[film.id]) meshMap[film.id] = [];
            if (!meshMap[film.id].includes(child)) meshMap[film.id].push(child);
          }
        });
      }

      registerMeshes(); // immédiat pour géométries Three.js

      // Pour les GLB : re-traverser après chargement asynchrone
      if (GLB_OBJECTS.includes(film.object)) {
        setTimeout(registerMeshes, 500);
        setTimeout(registerMeshes, 1500);
      }
    });
  });

  return meshMap;
}

// ─── Styles visuels ───────────────────────────────────────────────────────
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