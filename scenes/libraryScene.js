import * as THREE from "three";
import films from "../Data/data.js";
import libraryObjects from "./libraryObjects.js";
import libraryQuiz from "./libraryQuiz.js";
import libraryScore from "./libraryScore.js";
import resize from "../helpers/resize.js";

export default function libraryScene() {

  // ═══════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════
  const canvas = document.querySelector(".webgl");
  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x06090a);
  scene.fog = new THREE.FogExp2(0x080d0a, 0.03);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 1.7, 0);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled   = true;
  renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.2;

  // ═══════════════════════════════════════════════════════
  // SCORE & QUIZ
  // ═══════════════════════════════════════════════════════
  let scoreState = libraryScore.load();
  libraryQuiz.init(scoreState);

  // ═══════════════════════════════════════════════════════
  // DIMENSIONS
  // ═══════════════════════════════════════════════════════
  const ROOM_RADIUS  = 12;
  const ROOM_HEIGHT  = 7;
  const SHELF_RADIUS = ROOM_RADIUS - 0.2;

  // ═══════════════════════════════════════════════════════
  // SOL
  // ═══════════════════════════════════════════════════════
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(ROOM_RADIUS, 80),
    new THREE.MeshStandardMaterial({ color: 0x160d05, roughness: 0.96, metalness: 0.02 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Rosace occulte au sol
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const branch = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.005, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x200b00, roughness: 0.98 })
    );
    branch.rotation.y = angle;
    branch.position.y = 0.003;
    scene.add(branch);
  }
  const rosaceRing = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.05, 48),
    new THREE.MeshStandardMaterial({ color: 0x200b00, roughness: 0.98, side: THREE.DoubleSide })
  );
  rosaceRing.rotation.x = -Math.PI / 2;
  rosaceRing.position.y = 0.004;
  scene.add(rosaceRing);

  // ═══════════════════════════════════════════════════════
  // MURS
  // ═══════════════════════════════════════════════════════
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, ROOM_HEIGHT, 80, 4, true),
    new THREE.MeshStandardMaterial({ color: 0x0e1c0f, roughness: 0.99, side: THREE.BackSide })
  );
  wall.position.y = ROOM_HEIGHT / 2;
  scene.add(wall);

  for (let i = 0; i < 7; i++) {
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(ROOM_RADIUS - 0.03, 0.022, 4, 100),
      new THREE.MeshStandardMaterial({ color: 0x080e08, roughness: 1.0 })
    );
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = 0.4 + i * 1.0;
    scene.add(stripe);
  }

  // ═══════════════════════════════════════════════════════
  // PLAFOND FERMÉ — voûte gothique + lustre
  // ═══════════════════════════════════════════════════════
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.45, metalness: 0.75 });

  // Disque fermé
  const ceilDisc = new THREE.Mesh(
    new THREE.CircleGeometry(ROOM_RADIUS, 80),
    new THREE.MeshStandardMaterial({ color: 0x080e09, roughness: 0.98, side: THREE.DoubleSide })
  );
  ceilDisc.rotation.x = Math.PI / 2;
  ceilDisc.position.y = ROOM_HEIGHT;
  scene.add(ceilDisc);

  // Dôme intérieur
  const ceilDome = new THREE.Mesh(
    new THREE.SphereGeometry(ROOM_RADIUS * 0.78, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.4),
    new THREE.MeshStandardMaterial({ color: 0x060c07, roughness: 1.0, side: THREE.BackSide })
  );
  ceilDome.position.y = ROOM_HEIGHT - 0.1;
  scene.add(ceilDome);

  // Nervures gothiques (8)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.055, ROOM_RADIUS * 0.9),
      ironMat
    );
    rib.position.y = ROOM_HEIGHT - 0.04;
    rib.rotation.y = angle;
    rib.rotation.x = Math.PI * 0.1;
    scene.add(rib);
  }

  const ceilMedaillon = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.055, 8, 48), ironMat
  );
  ceilMedaillon.rotation.x = Math.PI / 2;
  ceilMedaillon.position.y = ROOM_HEIGHT - 0.04;
  scene.add(ceilMedaillon);

  const lustreChain = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.8, 6), ironMat);
  lustreChain.position.set(0, ROOM_HEIGHT - 1.4, 0);
  scene.add(lustreChain);

  const lustreY = ROOM_HEIGHT - 2.8;
  for (let r of [1.0, 0.5]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 36), ironMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = lustreY;
    scene.add(ring);
  }

  const lustreFlames = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const cx  = Math.cos(ang) * 0.95;
    const cz  = Math.sin(ang) * 0.95;

    const cBod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.14, 8),
      new THREE.MeshStandardMaterial({ color: 0xeedd99, roughness: 0.95 })
    );
    cBod.position.set(cx, lustreY - 0.07, cz);
    scene.add(cBod);

    const cFlame = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xff8800, emissiveIntensity: 4.5 })
    );
    cFlame.position.set(cx, lustreY + 0.01, cz);
    scene.add(cFlame);
    lustreFlames.push(cFlame);

    const lfl = new THREE.PointLight(0xff9933, 1.5, 5.0);
    lfl.position.set(cx, lustreY + 0.05, cz);
    scene.add(lfl);
  }

  const lustreLight = new THREE.PointLight(0xffbb66, 18.0, 28);
  lustreLight.position.set(0, lustreY + 0.1, 0);
  lustreLight.castShadow = true;
  lustreLight.shadow.mapSize.set(1024, 1024);
  scene.add(lustreLight);

  const lustreLight2 = new THREE.PointLight(0xffaa44, 10.0, 24);
  lustreLight2.position.set(0, ROOM_HEIGHT - 0.3, 0);
  scene.add(lustreLight2);

  const shelfHeights = [1.45, 2.20, 2.95, 3.70];
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x160b03, roughness: 0.91, metalness: 0.05 });

  shelfHeights.forEach(h => {
    const shelf = new THREE.Mesh(
      new THREE.TorusGeometry(SHELF_RADIUS - 0.25, 0.065, 6, 120), shelfMat
    );
    shelf.rotation.x = Math.PI / 2;
    shelf.position.y = h;
    shelf.castShadow = true;
    scene.add(shelf);
  });

  // 20 montants verticaux
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    if (Math.abs(angle) < 0.28 || Math.abs(angle - Math.PI * 2) < 0.28) continue;
    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 3.6, 6), ironMat
    );
    mount.position.set(
      Math.sin(angle) * (SHELF_RADIUS - 0.25),
      1.8,
      Math.cos(angle) * (SHELF_RADIUS - 0.25)
    );
    scene.add(mount);
  }

  // ── Spots dédiés à chaque niveau d'étagère ──────────────
// Niveau Évident (0.6)
for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const r   = SHELF_RADIUS - 0.5; 
    // On remonte un peu la lumière (0.95 au lieu de 0.85) pour éclairer le haut des grands objets
    const sl  = new THREE.PointLight(0xffe8aa, 6.0, 7.0); 
    sl.position.set(Math.sin(ang) * r, 0.95, Math.cos(ang) * r);
    scene.add(sl);
}
  // Lumière d'appoint basse pour illuminer le dessous des objets du niveau évident
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.26;
    const r   = SHELF_RADIUS - 1.2;
    const sl  = new THREE.PointLight(0xffddaa, 4.0, 5.5);
    sl.position.set(Math.sin(ang) * r, 0.45, Math.cos(ang) * r);
    scene.add(sl);
  }
  // Niveau Facile (1.35) — orange moyen
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + 0.4;
    const r   = SHELF_RADIUS - 0.5;
    const sl  = new THREE.PointLight(0xff8833, 2.5, 4.5);
    sl.position.set(Math.sin(ang) * r, 1.5, Math.cos(ang) * r);
    scene.add(sl);
  }
  // Niveau Moyen (2.15) — verdâtre froid, faible
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.8;
    const r   = SHELF_RADIUS - 0.5;
    const sl  = new THREE.PointLight(0x336633, 2.0, 4.0);
    sl.position.set(Math.sin(ang) * r, 2.3, Math.cos(ang) * r);
    scene.add(sl);
  }
  // Niveau Difficile (3.0) — rouge sang très faible
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 1.2;
    const r   = SHELF_RADIUS - 0.5;
    const sl  = new THREE.PointLight(0x770000, 2.5, 3.5);
    sl.position.set(Math.sin(ang) * r, 3.15, Math.cos(ang) * r);
    scene.add(sl);
  }

  // ═══════════════════════════════════════════════════════
  // PORTE
  // ═══════════════════════════════════════════════════════
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x0f0703, roughness: 0.95 });

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 0.2), woodMat);
  doorFrame.position.set(0, 1.6, ROOM_RADIUS - 0.12);
  scene.add(doorFrame);

  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.8, 0.09), woodMat);
  doorPanel.position.set(0, 1.6, ROOM_RADIUS - 0.04);
  scene.add(doorPanel);

  for (let sx of [-1, 1]) for (let sy of [-1, 1]) {
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.07), ironMat);
    hinge.position.set(sx * 0.55, 1.6 + sy * 0.95, ROOM_RADIUS - 0.02);
    scene.add(hinge);
  }

  const doorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x3366cc, emissive: 0x2244bb, emissiveIntensity: 1.5, side: THREE.DoubleSide })
  );
  doorGlow.position.set(0, 0.03, ROOM_RADIUS - 0.06);
  scene.add(doorGlow);

  const coldDoorLight = new THREE.PointLight(0x2255dd, 3.5, 8);
  coldDoorLight.position.set(0, 1.8, ROOM_RADIUS - 1.5);
  scene.add(coldDoorLight);

  // ═══════════════════════════════════════════════════════
  // MOBILIER
  // ═══════════════════════════════════════════════════════
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x3d0808, roughness: 0.84 });

  // Table ronde
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.07, 28), woodMat);
  tableTop.position.set(-0.8, 0.78, 0.8);
  scene.add(tableTop);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.1, 0.78, 8), woodMat);
  tableLeg.position.set(-0.8, 0.39, 0.8);
  scene.add(tableLeg);

  // Bougie sur table
  const candleBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.24, 10),
    new THREE.MeshStandardMaterial({ color: 0xeedd99, roughness: 0.95 })
  );
  candleBody.position.set(-0.8, 0.94, 0.8);
  scene.add(candleBody);

  const candleFlame = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xff8800, emissiveIntensity: 4.0, transparent: true, opacity: 0.95 })
  );
  candleFlame.position.set(-0.8, 1.08, 0.8);
  scene.add(candleFlame);

  const candlePointLight = new THREE.PointLight(0xff8833, 5.0, 8.0);
  candlePointLight.position.set(-0.8, 1.1, 0.8);
  candlePointLight.castShadow = true;
  scene.add(candlePointLight);

  // Grimoire
  const grimoire = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.26), woodMat);
  grimoire.position.set(-0.8, 0.83, 0.8);
  grimoire.rotation.y = 0.35;
  scene.add(grimoire);
  for (let s of [-1, 1]) {
    const page = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xccbb77, roughness: 0.99, side: THREE.DoubleSide })
    );
    page.position.set(-0.8 + s * 0.06, 0.86, 0.8);
    page.rotation.y = 0.35 + s * 0.12;
    page.rotation.x = -Math.PI / 2 + s * 0.06;
    scene.add(page);
  }

  // Crâne
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xd8cca8, roughness: 0.84 })
  );
  skull.scale.set(1, 1.1, 0.88);
  skull.position.set(-0.3, 0.88, 1.1);
  scene.add(skull);

  // Fauteuil
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.15, 0.75), leatherMat);
  chairSeat.position.set(1.0, 0.47, -0.5);
  scene.add(chairSeat);
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.13), leatherMat);
  chairBack.position.set(1.0, 0.86, -0.84);
  scene.add(chairBack);
  for (let x of [0.56, 1.44]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.75), leatherMat);
    arm.position.set(x, 0.62, -0.5);
    scene.add(arm);
  }
  for (let px of [0.56, 1.44]) for (let pz of [-0.1, -0.85]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.027, 0.2, 6), woodMat);
    leg.position.set(px, 0.1, pz);
    scene.add(leg);
  }

  // ═══════════════════════════════════════════════════════
  // TORCHES MURALES (12)
  // ═══════════════════════════════════════════════════════
  const torchData = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const tx = Math.sin(angle) * (ROOM_RADIUS - 0.8);
    const tz = Math.cos(angle) * (ROOM_RADIUS - 0.8);
    const ty = 2.5;

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.26, 6), ironMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(tx * 0.93, ty - 0.06, tz * 0.93);
    scene.add(arm);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.035, 0.08, 8), ironMat);
    bowl.position.set(tx, ty - 0.07, tz);
    scene.add(bowl);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffdd44, emissive: 0xff6600, emissiveIntensity: 6.0 })
    );
    flame.position.set(tx, ty, tz);
    scene.add(flame);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff3300, emissiveIntensity: 1.8, transparent: true, opacity: 0.15 })
    );
    halo.position.set(tx, ty, tz);
    scene.add(halo);

    const tLight = new THREE.PointLight(0xff7722, 6.0, 9.0);
    tLight.position.set(tx, ty, tz);
    scene.add(tLight);

    const tDown = new THREE.PointLight(0xff9944, 2.5, 5.0);
    tDown.position.set(tx * 0.85, ty - 1.1, tz * 0.85);
    scene.add(tDown);

    torchData.push({ light: tLight, flame, halo, base: 6.0 });
  }

  // ═══════════════════════════════════════════════════════
  // LUMIÈRES GÉNÉRALES
  // ═══════════════════════════════════════════════════════
  // Ambiante chaude — base visible partout
  scene.add(new THREE.AmbientLight(0x3a1a08, 6.0));
  // Contre-lumière froide verdâtre
  scene.add(new THREE.AmbientLight(0x061408, 3.0));

  // Lueur verte maudite au sol
  const cursedGlow = new THREE.PointLight(0x00bb22, 2.5, 6.0);
  cursedGlow.position.set(0, 0.05, 0);
  scene.add(cursedGlow);

  // Rouge sang — niveau Difficile (haut)
  const bloodLight  = new THREE.PointLight(0xaa0500, 5.0, 5.0);
  bloodLight.position.set(0, ROOM_HEIGHT - 0.6, 0);
  scene.add(bloodLight);
  const bloodLight2 = new THREE.PointLight(0x770300, 3.5, 4.5);
  bloodLight2.position.set(-4, ROOM_HEIGHT - 1.2, -4);
  scene.add(bloodLight2);

const { meshMap, manager } = libraryObjects.placeObjects(scene, films, SHELF_RADIUS, scoreState);

let allMeshes = [];
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    const subText = document.getElementById("intro-sub");
    if (subText) subText.textContent = `Chargement des reliques : ${progress}%`;
};

manager.onLoad = () => {
    allMeshes = Object.values(meshMap).flat(); // Remplit le raycaster
    const subText = document.getElementById("intro-sub");
    if (subText) {
        subText.textContent = "— CLIQUER POUR ENTRER —";
        subText.style.color = "#70c870";
        subText.style.textShadow = "0 0 10px #00ff00";
    }
};


  const raycaster = new THREE.Raycaster();
  const pointer   = new THREE.Vector2();
  let hoveredFilmId = null;
  let quizOpen      = false;

  const tooltip = document.createElement("div");
  tooltip.id = "lib-tooltip";
  tooltip.style.cssText = `
    position:fixed; pointer-events:none; display:none;
    background:rgba(4,10,4,0.94); border:1px solid #2a5a2a;
    color:#88ff88; font-family:'Palatino Linotype',serif;
    padding:8px 16px; border-radius:4px; font-size:13px;
    letter-spacing:0.05em; z-index:100; text-shadow:0 0 8px #00ff00;
  `;
  document.body.appendChild(tooltip);

  canvas.addEventListener("mousemove", (e) => {
    if (quizOpen) return;
    pointer.x = (e.clientX / window.innerWidth)  * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    tooltip.style.left = (e.clientX + 16) + "px";
    tooltip.style.top  = (e.clientY - 10)  + "px";
  });

  canvas.addEventListener("click", (e) => {
    if (quizOpen || introActive) return;
    pointer.x = (e.clientX / window.innerWidth)  * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length > 0) {
      const { filmId, level, film } = hits[0].object.userData;
      if (!scoreState.unlocked.includes(level.toLowerCase())) { // Ajoute .toLowerCase()
          showToast("🔒 Niveau verrouillé !");
          return;
      }
      quizOpen = true;
      libraryQuiz.openQuiz(film, level, (result, newState) => {
        scoreState = newState;
        quizOpen   = false;
        updateHUD();
        const meshes = meshMap[filmId];
        if (meshes && result === "success") {
          meshes.forEach(m => { if (m.material) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(0xffd700); m.material.emissiveIntensity = 0.5; } });
        } else if (meshes && result === "fail") {
          meshes.forEach(m => { if (m.material) { m.material = m.material.clone(); m.material.color = new THREE.Color(0x333333); } });
        }
      });
    }
  });

  // ═══════════════════════════════════════════════════════
  // HUD
  // ═══════════════════════════════════════════════════════
  const hud = document.createElement("div");
  hud.id    = "lib-hud";
  hud.style.cssText = `
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    background:rgba(2,8,2,0.9); border:1px solid #1a4a1a;
    color:#70c870; font-family:'Palatino Linotype',serif;
    padding:10px 28px; border-radius:6px; font-size:14px;
    letter-spacing:0.08em; z-index:50; display:flex; gap:28px;
    backdrop-filter:blur(4px); text-shadow:0 0 6px #004400;
    box-shadow:0 0 20px rgba(0,80,0,0.3);
  `;
  document.body.appendChild(hud);

  function updateHUD() {
    const total = 20;
    const done  = scoreState.completed.length + scoreState.failed.length;
    hud.innerHTML = `
      <span>🕯️ <strong>${scoreState.score}</strong> pts</span>
      <span>✅ <strong>${scoreState.completed.length}/${total}</strong></span>
      <span>📖 <strong>${done}/${total}</strong> tentés</span>
      <button id="hud-reset" style="background:none;border:1px solid #1a4a1a;color:#508050;
        cursor:pointer;font-family:inherit;font-size:12px;padding:2px 10px;border-radius:3px;">↺ Reset</button>
    `;
    document.getElementById("hud-reset").addEventListener("click", () => {
      if (confirm("Réinitialiser toute la progression ?")) {
        scoreState = libraryScore.reset();
        libraryQuiz.init(scoreState);
        location.reload();
      }
    });
  }
  updateHUD();

  const ctrlHint = document.createElement("div");
  ctrlHint.style.cssText = `
    position:fixed; top:20px; right:20px;
    background:rgba(2,8,2,0.82); border:1px solid #1a3a1a;
    color:#508050; font-family:'Palatino Linotype',serif;
    padding:8px 14px; border-radius:5px; font-size:12px;
    letter-spacing:0.05em; z-index:50; line-height:1.8;
    text-shadow:0 0 5px #003300;
  `;
  ctrlHint.innerHTML = `
    <div style="color:#70c870;margin-bottom:4px;">Navigation</div>
    ZQSD / Flèches · Se déplacer<br>
    Clic + Souris · Regarder<br>
    Clic objet · Défier
  `;
  document.body.appendChild(ctrlHint);

  function showToast(msg) {
    const t = document.createElement("div");
    t.style.cssText = `
      position:fixed;top:30px;left:50%;transform:translateX(-50%);
      background:rgba(5,20,5,0.94);color:#80ff80;border:1px solid #1a5a1a;
      font-family:'Palatino Linotype',serif;padding:10px 24px;
      border-radius:6px;z-index:200;font-size:14px;pointer-events:none;
      text-shadow:0 0 8px #00aa00;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  // ═══════════════════════════════════════════════════════
  // INTRO
  // ═══════════════════════════════════════════════════════
  let introActive = true;
  let introPhase  = 0;

  const introOverlay = document.createElement("div");
  introOverlay.style.cssText = `
    position:fixed; inset:0; background:#000;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    z-index:500; transition:opacity 1.8s ease; cursor:pointer;
  `;
  introOverlay.innerHTML = `
    <div id="intro-text" style="
      color:#70c870; font-size:clamp(16px,2.5vw,26px);
      text-align:center; line-height:2.2; letter-spacing:0.12em;
      max-width:620px; padding:0 24px;
      text-shadow:0 0 20px #00aa00, 0 0 50px #006600;
      opacity:0; transition:opacity 2s ease;
      font-family:'Palatino Linotype',serif;
    ">
      Bienvenue dans la<br>
      <span style="font-size:1.45em;color:#a0ffa0;letter-spacing:0.2em;display:block;margin:8px 0;">
        Bibliothèque des Damnés
      </span>
      <span style="font-size:0.75em;color:#508050;letter-spacing:0.06em;">
        Tourne. Explore. Si tu oses.
      </span>
    </div>
    <div id="intro-sub" style="
      color:#2a5a2a; font-size:13px; margin-top:48px;
      letter-spacing:0.2em; opacity:0; transition:opacity 2s ease 1.2s;
      font-family:'Palatino Linotype',serif;
    ">— CLIQUER POUR ENTRER —</div>
  `;
  document.body.appendChild(introOverlay);

  setTimeout(() => {
    document.getElementById("intro-text").style.opacity = "1";
    document.getElementById("intro-sub").style.opacity  = "1";
  }, 400);

  let autoRotateActive   = false;
  let autoRotateDuration = 0;

  introOverlay.addEventListener("click", () => {
    if (introPhase !== 0) return;
    introPhase = 1;
    introOverlay.style.opacity = "0";
    setTimeout(() => {
      introOverlay.remove();
      introActive        = false;
      autoRotateActive   = true;
      autoRotateDuration = 0;
    }, 1800);
  });

  // ═══════════════════════════════════════════════════════
  // NAVIGATION FPS
  // ═══════════════════════════════════════════════════════
  let yaw   = Math.PI;
  let pitch = 0;
  let isDragging  = false;
  let lastMouseX  = 0;
  let lastMouseY  = 0;
  const keys = {};

  window.addEventListener("keydown", e => { keys[e.code] = true; });
  window.addEventListener("keyup",   e => { keys[e.code] = false; });

  canvas.addEventListener("mousedown", (e) => {
    if (introActive || quizOpen) return;
    isDragging   = true;
    lastMouseX   = e.clientX;
    lastMouseY   = e.clientY;
    autoRotateActive = false;
    canvas.style.cursor = "none";
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
    if (!introActive) canvas.style.cursor = "crosshair";
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDragging || quizOpen || introActive) return;
    yaw   -= (e.clientX - lastMouseX) * 0.0025;
    pitch -= (e.clientY - lastMouseY) * 0.002;
    pitch  = Math.max(-0.55, Math.min(0.55, pitch));
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  canvas.style.cursor = "crosshair";
  resize(camera, renderer);

  // ═══════════════════════════════════════════════════════
  // BOUCLE D'ANIMATION
  // ═══════════════════════════════════════════════════════
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Rotation automatique d'intro
    if (autoRotateActive) {
      autoRotateDuration += 0.016;
      yaw += 0.004;
      if (autoRotateDuration > 8) autoRotateActive = false;
    }

    // Déplacement FPS
    if (!quizOpen && !introActive) {
      const speed = 0.15;
      const dir   = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

      if (keys["KeyW"] || keys["ArrowUp"]   || keys["KeyZ"]) camera.position.addScaledVector(dir,    speed);
      if (keys["KeyS"] || keys["ArrowDown"])                  camera.position.addScaledVector(dir,   -speed);
      if (keys["KeyA"] || keys["ArrowLeft"] || keys["KeyQ"]) camera.position.addScaledVector(right, -speed);
      if (keys["KeyD"] || keys["ArrowRight"])                 camera.position.addScaledVector(right,  speed);

      // Contrainte pièce
      const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      if (dist > ROOM_RADIUS - 1.5) {
        const s = (ROOM_RADIUS - 1.5) / dist;
        camera.position.x *= s;
        camera.position.z *= s;
      }
      camera.position.y = 1.7;
    }

    // Rotation caméra
    camera.rotation.order = "YXZ";
    camera.rotation.y     = yaw;
    camera.rotation.x     = pitch;

    // Vacillement torches
    torchData.forEach((t, i) => {
      const f = 0.85 + Math.sin(elapsed * 3.8 + i * 1.7) * 0.12 + Math.sin(elapsed * 8.3 + i * 0.9) * 0.05;
      t.light.intensity = t.base * f;
      t.flame.scale.setScalar(0.88 + Math.sin(elapsed * 6 + i) * 0.1);
      t.halo.scale.setScalar(0.9 + Math.sin(elapsed * 4 + i * 0.7) * 0.14);
      t.halo.material.opacity = 0.11 + Math.sin(elapsed * 5 + i) * 0.05;
    });

    // Bougie centrale
    candlePointLight.intensity = 5.0 + Math.sin(elapsed * 4.5) * 0.6;
    candleFlame.scale.setScalar(0.9 + Math.sin(elapsed * 5.5) * 0.08);

    // Lustre
    lustreLight.intensity = 18.0 + Math.sin(elapsed * 0.5) * 1.5;
    lustreFlames.forEach((f, i) => f.scale.setScalar(0.9 + Math.sin(elapsed * 5 + i * 1.3) * 0.08));

    // Lueur maudite
    cursedGlow.intensity = 2.5 + Math.sin(elapsed * 0.8) * 1.0;

    // Rouge sang
    bloodLight.intensity  = 5.0 + Math.sin(elapsed * 1.4) * 1.8;
    bloodLight2.intensity = 3.5 + Math.sin(elapsed * 1.4 + Math.PI) * 1.4;

    // Hover
    if (!quizOpen && !introActive) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(allMeshes);
      if (hits.length > 0) {
        const { filmId, level } = hits[0].object.userData;
        if (filmId !== hoveredFilmId) {
          hoveredFilmId = filmId;
          tooltip.style.display = "block";
          tooltip.textContent   = !scoreState.unlocked.includes(level) ? "🔒 Verrouillé" : "👁 Cliquer pour défier";
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