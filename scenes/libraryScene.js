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