import * as THREE from "three";
import films from "../data/films.js";
import libraryObjects from "./libraryObjects.js";
import libraryQuiz from "./libraryQuiz.js";
import libraryScore from "./libraryScore.js";
import resize from "../helpers/resize.js";

export default function libraryScene() {
  // ─── Setup de base ───────────────────────────────────────────────
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);
  scene.fog = new THREE.Fog(0x0a0a0f, 8, 18);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0, 1.7, 0); // hauteur yeux humains au centre
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 0.8;

  // ─── Score & Quiz ────────────────────────────────────────────────
  let scoreState = libraryScore.load();
  libraryQuiz.init(scoreState);

  // ─── Dimensions pièce ────────────────────────────────────────────
  const ROOM_RADIUS = 7;
  const ROOM_HEIGHT = 5;
  const SHELF_RADIUS = ROOM_RADIUS - 0.1;

  // ─── Sol (parquet chevrons) ──────────────────────────────────────
  const floorGeo = new THREE.CircleGeometry(ROOM_RADIUS, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a0e06,
    roughness: 0.95,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Rosace centrale gravée
  const rosaGeo = new THREE.RingGeometry(0.3, 1.2, 32);
  const rosaMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9, side: THREE.DoubleSide });
  const rosace = new THREE.Mesh(rosaGeo, rosaMat);
  rosace.rotation.x = -Math.PI / 2;
  rosace.position.y = 0.001;
  scene.add(rosace);

  // ─── Murs circulaires ────────────────────────────────────────────
  const wallGeo = new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, ROOM_HEIGHT, 48, 1, true);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1a1f1a,
    roughness: 0.98,
    metalness: 0.0,
    side: THREE.BackSide,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = ROOM_HEIGHT / 2;
  scene.add(wall);

  // ─── Plafond voûté ───────────────────────────────────────────────
  const ceilGeo = new THREE.SphereGeometry(ROOM_RADIUS * 0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 1, side: THREE.BackSide });
  const ceil = new THREE.Mesh(ceilGeo, ceilMat);
  ceil.position.y = ROOM_HEIGHT - 0.2;
  scene.add(ceil);

  // ─── Étagères circulaires (4 niveaux) ────────────────────────────
  const shelfHeights = [0.35, 1.05, 1.8, 2.55];
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x1a0e06, roughness: 0.9 });

  shelfHeights.forEach(h => {
    const shelfGeo = new THREE.TorusGeometry(SHELF_RADIUS - 0.25, 0.04, 4, 80);
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.y = h;
    shelf.rotation.x = Math.PI / 2;
    shelf.castShadow = true;
    scene.add(shelf);

    // Montants verticaux en fer forgé
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const mountGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.8, 6);
      const mountMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.5 });
      const mount = new THREE.Mesh(mountGeo, mountMat);
      mount.position.set(
        Math.sin(angle) * (SHELF_RADIUS - 0.25),
        1.4,
        Math.cos(angle) * (SHELF_RADIUS - 0.25)
      );
      scene.add(mount);
    }
  });

  // ─── Porte ───────────────────────────────────────────────────────
  const doorGroup = new THREE.Group();
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x1a0c04, roughness: 0.9 });

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.15), doorMat);
  doorFrame.position.set(0, 1.2, ROOM_RADIUS - 0.1);
  scene.add(doorFrame);

  // Ouverture de la porte (lumière bleutée)
  const doorLight = new THREE.RectAreaLight(0x3344aa, 0.8, 0.9, 2.0);
  doorLight.position.set(0, 1.2, ROOM_RADIUS - 0.2);
  doorLight.lookAt(0, 1.2, 0);
  scene.add(doorLight);

  // ─── Mobilier central ────────────────────────────────────────────
  // Table ronde
  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.05, 20),
    new THREE.MeshStandardMaterial({ color: 0x1a0c04, roughness: 0.85 })
  );
  tableTop.position.set(-0.4, 0.75, 0.4);
  tableTop.castShadow = true;
  scene.add(tableTop);

  const tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.75, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a0c04, roughness: 0.85 })
  );
  tableLeg.position.set(-0.4, 0.38, 0.4);
  scene.add(tableLeg);

  // Bougie sur table
  const candleBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.18, 10),
    new THREE.MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.9 })
  );
  candleBody.position.set(-0.4, 0.87, 0.4);
  scene.add(candleBody);

  const candleFlame = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0xff6600, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 })
  );
  candleFlame.position.set(-0.4, 0.98, 0.4);
  scene.add(candleFlame);

  // Grimoire ouvert sur table
  const grimoire = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.04, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x1a0800, roughness: 0.95 })
  );
  grimoire.position.set(-0.4, 0.79, 0.4);
  grimoire.rotation.y = 0.3;
  scene.add(grimoire);

  // Fauteuil Chesterfield
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x4a0a0a, roughness: 0.8 });
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.65), chairMat);
  chairSeat.position.set(0.6, 0.44, -0.3);
  scene.add(chairSeat);

  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.1), chairMat);
  chairBack.position.set(0.6, 0.76, -0.58);
  scene.add(chairBack);

  const chairArmL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.65), chairMat);
  chairArmL.position.set(0.95, 0.57, -0.3);
  scene.add(chairArmL);

  const chairArmR = chairArmL.clone();
  chairArmR.position.x = 0.25;
  scene.add(chairArmR);

  // ─── Lumières ────────────────────────────────────────────────────

  // Lumière ambiante très faible
  const ambient = new THREE.AmbientLight(0x111122, 0.4);
  scene.add(ambient);

  // Lumière de la bougie (point light centrale)
  const candlePointLight = new THREE.PointLight(0xff8833, 1.2, 5);
  candlePointLight.position.set(-0.4, 1.1, 0.4);
  candlePointLight.castShadow = true;
  scene.add(candlePointLight);

  // 8 torches murales
  const torchPositions = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const tx = Math.sin(angle) * (ROOM_RADIUS - 0.8);
    const tz = Math.cos(angle) * (ROOM_RADIUS - 0.8);

    // Flamme de torche (mesh)
    const torchFlame = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 2 })
    );
    torchFlame.position.set(tx, 2.2, tz);
    scene.add(torchFlame);

    // Support torche
    const torchHolder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.12, 6),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 })
    );
    torchHolder.position.set(tx, 2.1, tz);
    scene.add(torchHolder);

    // PointLight pour chaque torche (intensité faible)
    const torchLight = new THREE.PointLight(0xff6622, 0.9, 4.5);
    torchLight.position.set(tx, 2.2, tz);
    torchLight.castShadow = false;
    scene.add(torchLight);

    torchPositions.push({ light: torchLight, base: 0.9, flame: torchFlame });
  }

  // ─── Objets sur les étagères ─────────────────────────────────────
  const meshMap = libraryObjects.placeObjects(scene, films, SHELF_RADIUS, scoreState);

  // ─── Raycaster ───────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoveredFilmId = null;
  let quizOpen = false;

  // Tous les meshes cliquables
  const allMeshes = Object.values(meshMap).flat();

  // Tooltip DOM
  const tooltip = document.createElement("div");
  tooltip.id = "lib-tooltip";
  tooltip.style.cssText = `
    position:fixed; pointer-events:none; display:none;
    background:rgba(10,5,0,0.85); border:1px solid #8b6914;
    color:#f0d080; font-family:'Palatino Linotype',serif;
    padding:8px 14px; border-radius:4px; font-size:13px;
    letter-spacing:0.05em; z-index:100;
  `;
  document.body.appendChild(tooltip);

  canvas.addEventListener("mousemove", (e) => {
    if (quizOpen) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    tooltip.style.left = (e.clientX + 16) + "px";
    tooltip.style.top = (e.clientY - 10) + "px";
  });

  canvas.addEventListener("click", (e) => {
    if (quizOpen) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(allMeshes);

    if (hits.length > 0) {
      const { filmId, level, film } = hits[0].object.userData;
      if (!scoreState.unlocked.includes(level)) {
        showToast("🔒 Niveau verrouillé — complète le niveau précédent !");
        return;
      }
      quizOpen = true;
      libraryQuiz.openQuiz(film, level, (result, newState) => {
        scoreState = newState;
        quizOpen = false;
        updateHUD();
        // Mettre à jour style de l'objet
        const meshes = meshMap[filmId];
        if (meshes && result === "success") {
          meshes.forEach(m => {
            m.material = m.material.clone();
            m.material.emissive = new THREE.Color(0xffd700);
            m.material.emissiveIntensity = 0.3;
          });
        } else if (meshes && result === "fail") {
          meshes.forEach(m => {
            m.material = m.material.clone();
            m.material.color = new THREE.Color(0x444444);
          });
        }
      });
    }
  });

  // ─── HUD (score + progression) ───────────────────────────────────
  const hud = document.createElement("div");
  hud.id = "lib-hud";
  hud.style.cssText = `
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    background:rgba(10,5,0,0.8); border:1px solid #5a3a0a;
    color:#d4a820; font-family:'Palatino Linotype',serif;
    padding:10px 28px; border-radius:6px; font-size:14px;
    letter-spacing:0.08em; z-index:50; display:flex; gap:28px;
    backdrop-filter:blur(4px);
  `;
  document.body.appendChild(hud);

  function updateHUD() {
    const total = 20;
    const done = scoreState.completed.length + scoreState.failed.length;
    hud.innerHTML = `
      <span>🕯️ Score&nbsp;<strong>${scoreState.score}</strong>&nbsp;pts</span>
      <span>✅&nbsp;<strong>${scoreState.completed.length}/${total}</strong>&nbsp;trouvés</span>
      <span>📖&nbsp;<strong>${done}/${total}</strong>&nbsp;tentés</span>
      <button id="hud-reset" style="background:none;border:1px solid #5a3a0a;color:#a06010;
        cursor:pointer;font-family:inherit;font-size:12px;padding:2px 10px;border-radius:3px;">
        Réinitialiser
      </button>
    `;
    document.getElementById("hud-reset").addEventListener("click", () => {
      if (confirm("Réinitialiser toute la progression ?")) {
        scoreState = libraryScore.reset();
        libraryQuiz.init(scoreState);
        updateHUD();
        location.reload();
      }
    });
  }
  updateHUD();

  // ─── Toast notification ──────────────────────────────────────────
  function showToast(msg) {
    const t = document.createElement("div");
    t.style.cssText = `
      position:fixed;top:30px;left:50%;transform:translateX(-50%);
      background:rgba(60,10,10,0.9);color:#f0a0a0;border:1px solid #800;
      font-family:'Palatino Linotype',serif;padding:10px 24px;
      border-radius:6px;z-index:200;font-size:14px;pointer-events:none;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  // ─── Navigation (rotation caméra) ───────────────────────────────
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let yaw = 0, pitch = 0;
  let velocityX = 0, velocityY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velocityX = 0;
    velocityY = 0;
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging || quizOpen) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    velocityX = dx * 0.003;
    velocityY = dy * 0.003;
    yaw -= dx * 0.003;
    pitch -= dy * 0.0025;
    pitch = Math.max(-0.5, Math.min(0.5, pitch)); // limite haut/bas
    lastX = e.clientX;
    lastY = e.clientY;
  });

  // Touch support mobile
  canvas.addEventListener("touchstart", (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  });
  canvas.addEventListener("touchmove", (e) => {
    if (!isDragging || quizOpen) return;
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    yaw -= dx * 0.003;
    pitch -= dy * 0.0025;
    pitch = Math.max(-0.5, Math.min(0.5, pitch));
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  });
  canvas.addEventListener("touchend", () => { isDragging = false; });

  canvas.style.cursor = "grab";

  // ─── Resize ──────────────────────────────────────────────────────
  resize(camera, renderer);

  // ─── Boucle d'animation ──────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Inertie de rotation
    if (!isDragging) {
      velocityX *= 0.88;
      velocityY *= 0.88;
      yaw -= velocityX;
      pitch -= velocityY;
      pitch = Math.max(-0.5, Math.min(0.5, pitch));
    }

    // Application rotation caméra
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // Vacillement des torches
    torchPositions.forEach((t, i) => {
      const flicker = 0.9 + Math.sin(elapsed * 3.5 + i * 1.3) * 0.12 + Math.sin(elapsed * 7 + i) * 0.05;
      t.light.intensity = t.base * flicker;
      t.flame.position.y = 2.2 + Math.sin(elapsed * 5 + i) * 0.008;
    });

    // Vacillement bougie centrale
    candlePointLight.intensity = 1.2 + Math.sin(elapsed * 4.2) * 0.15;
    candleFlame.position.y = 0.98 + Math.sin(elapsed * 6) * 0.005;

    // Hover raycaster
    if (!quizOpen) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(allMeshes);
      if (hits.length > 0) {
        const { filmId, level } = hits[0].object.userData;
        if (filmId !== hoveredFilmId) {
          hoveredFilmId = filmId;
          const locked = !scoreState.unlocked.includes(level);
          tooltip.style.display = "block";
          tooltip.textContent = locked ? "🔒 Niveau verrouillé" : "Clique pour défier ce monstre";
        }
        // Légère animation hover
        const parentMeshes = meshMap[filmId];
        if (parentMeshes) {
          parentMeshes.forEach(m => {
            m.parent.position.y += Math.sin(elapsed * 2) * 0.0005;
          });
        }
      } else {
        hoveredFilmId = null;
        tooltip.style.display = "none";
      }
    }

    renderer.render(scene, camera);
  }

  animate();
}