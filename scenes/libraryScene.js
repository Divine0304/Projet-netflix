import * as THREE from "three";
import films from "../data/films.js";
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
  scene.background = new THREE.Color(0x020608);
  scene.fog = new THREE.FogExp2(0x040a06, 0.045);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 60);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    let scoreState = libraryScore.load();
    libraryQuiz.init(scoreState);

    const ROOM_RADIUS  = 12;
  const ROOM_HEIGHT  = 7;
  const SHELF_RADIUS = ROOM_RADIUS - 0.2;

  const floor = new THREE.Mesh(
      new THREE.CircleGeometry(ROOM_RADIUS, 80),
      new THREE.MeshStandardMaterial({ color: 0x130b04, roughness: 0.96, metalness: 0.03 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const branch = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.005, 1.8),
          new THREE.MeshStandardMaterial({ color: 0x1e0a00, roughness: 0.98 })
        );
        branch.rotation.y = angle;
        branch.position.y = 0.003;
        scene.add(branch);
      }
      const rosaceRing = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.0, 48),
        new THREE.MeshStandardMaterial({ color: 0x1e0a00, roughness: 0.98, side: THREE.DoubleSide })
      );
      rosaceRing.rotation.x = -Math.PI / 2;
      rosaceRing.position.y = 0.004;
      scene.add(rosaceRing);

    const wall = new THREE.Mesh(
        new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, ROOM_HEIGHT, 80, 4, true),
        new THREE.MeshStandardMaterial({ color: 0x0c1a0d, roughness: 0.99, side: THREE.BackSide })
      );
      wall.position.y = ROOM_HEIGHT / 2;
      scene.add(wall);
      
    for (let i = 0; i < 7; i++) {
        const stripe = new THREE.Mesh(
          new THREE.TorusGeometry(ROOM_RADIUS - 0.03, 0.02, 4, 100),
          new THREE.MeshStandardMaterial({ color: 0x070d07, roughness: 1.0 })
        );
        stripe.rotation.x = Math.PI / 2;
        stripe.position.y  = 0.4 + i * 1.0;
        scene.add(stripe);
      }

    const ceilDisc = new THREE.Mesh(
        new THREE.CircleGeometry(ROOM_RADIUS, 80),
        new THREE.MeshStandardMaterial({ color: 0x080e09, roughness: 0.98, side: THREE.DoubleSide })
      );
      ceilDisc.rotation.x = Math.PI / 2;
      ceilDisc.position.y  = ROOM_HEIGHT;
      scene.add(ceilDisc);

    const ceilDome = new THREE.Mesh(
        new THREE.SphereGeometry(ROOM_RADIUS * 0.75, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.38),
        new THREE.MeshStandardMaterial({ color: 0x060c07, roughness: 1.0, side: THREE.BackSide })
      );
      ceilDome.position.y = ROOM_HEIGHT - 0.1;
      scene.add(ceilDome);

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.45, metalness: 0.75 });
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rib   = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, ROOM_RADIUS * 0.88),
          ironMat
        );
        rib.position.y  = ROOM_HEIGHT - 0.05;
        rib.rotation.y  = angle;
        rib.rotation.x  = Math.PI * 0.1;
        scene.add(rib);
      }
    const ceilMedaillon = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.06, 8, 48),
        ironMat
      );
      ceilMedaillon.rotation.x = Math.PI / 2;
      ceilMedaillon.position.y  = ROOM_HEIGHT - 0.05;
      scene.add(ceilMedaillon);

      const chainMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.4 });
      
      const chain = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 2.5, 6),
          chainMat
        );
        chain.position.set(0, ROOM_HEIGHT - 1.25, 0);
        scene.add(chain);
      
    const lustreRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.04, 8, 32),
        ironMat
      );
      lustreRing.rotation.x = Math.PI / 2;
      lustreRing.position.y  = ROOM_HEIGHT - 2.5;
      scene.add(lustreRing);

    const lustreRingInner = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.03, 8, 24),
        ironMat
      );
      lustreRingInner.rotation.x = Math.PI / 2;
      lustreRingInner.position.y  = ROOM_HEIGHT - 2.5;
      scene.add(lustreRingInner);

    const lustreFlames = [];
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const cx  = Math.cos(ang) * 0.85;
        const cz  = Math.sin(ang) * 0.85;
        const cy  = ROOM_HEIGHT - 2.5;
    
        const cBod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.15, 8),
          new THREE.MeshStandardMaterial({ color: 0xeedd99, roughness: 0.95 })
        );
        cBod.position.set(cx, cy - 0.07, cz);
        scene.add(cBod);
    
        const cFlame = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xff8800, emissiveIntensity: 4.0 })
        );
        cFlame.position.set(cx, cy + 0.02, cz);
        scene.add(cFlame);
        lustreFlames.push({ mesh: cFlame, baseY: cy + 0.02 });

        const lfl = new THREE.PointLight(0xff9933, 1.2, 4.5);
        lfl.position.set(cx, cy + 0.05, cz);
        scene.add(lfl);
     }  
     
    const lustreLight = new THREE.PointLight(0xffd080, 20.0, 25);
      lustreLight.position.set(0, ROOM_HEIGHT - 2.4, 0);
      lustreLight.castShadow = true;
      lustreLight.shadow.mapSize.set(1024, 1024);
      scene.add(lustreLight);

    const shelfHeights = [0.6, 1.35, 2.15, 3.0];
      const shelfMat = new THREE.MeshStandardMaterial({ color: 0x160b03, roughness: 0.91, metalness: 0.05 });
    
      shelfHeights.forEach(h => {
        const shelf = new THREE.Mesh(
          new THREE.TorusGeometry(SHELF_RADIUS - 0.25, 0.065, 6, 120),
          shelfMat
        );
        shelf.rotation.x = Math.PI / 2;
        shelf.position.y  = h;
        shelf.castShadow  = true;
        scene.add(shelf);
    });

    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        if (Math.abs(angle) < 0.3 || Math.abs(angle - Math.PI * 2) < 0.3) continue;
        const mount = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 3.6, 6),
          ironMat
        );
        mount.position.set(
          Math.sin(angle) * (SHELF_RADIUS - 0.25),
          1.8,
          Math.cos(angle) * (SHELF_RADIUS - 0.25)
        );
        scene.add(mount);
    }
}