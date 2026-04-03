import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Assets
import stars_L from "../assets/stars_L.jpg";
import stars_R from "../assets/stars_R.jpg";
import milky_L from "../assets/milky_L.jpg";
import milky_R from "../assets/milky_R.jpg";
import sunTexture from "../assets/2k_sun.jpg";
import mercuryTexture from "../assets/2k_mercury.jpg";
import venusTexture from "../assets/2k_venus_surface.jpg";
import earthTexture from "../assets/2k_earth.jpg";
import moonTexture from "../assets/2k_moon.jpg";
import marsTexture from "../assets/2k_mars.jpg";
import jupiterTexture from "../assets/2k_jupiter.jpg";
import saturnTexture from "../assets/2k_saturn.jpg";
import saturnRingTexture from "../assets/saturn_ring.png";
import uranusTexture from "../assets/2k_uranus.jpg";
import uranusRingTexture from "../assets/uranus_ring.png";
import neptuneTexture from "../assets/2k_neptune.jpg";

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100000,
);
camera.position.set(-100, 150, 400);

const controls = new OrbitControls(camera, renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1000, 2000);
pointLight.decay = 1;
scene.add(pointLight);

const textureLoader = new THREE.TextureLoader();
const getTexture = (source) => {
  const texture = textureLoader.load(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  milky_L,
  milky_L,
  stars_L,
  stars_R,
  milky_R,
  milky_R,
]);

// Helper for Planets
function createPlanet(radius, textureSrc, xDist, isStar = false) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 60, 60),
    isStar
      ? new THREE.MeshBasicMaterial({ map: getTexture(textureSrc) })
      : new THREE.MeshStandardMaterial({ map: getTexture(textureSrc) }),
  );

  if (isStar) {
    scene.add(mesh);
    return mesh;
  }

  const pivot = new THREE.Object3D();
  scene.add(pivot);
  pivot.add(mesh);
  mesh.position.x = xDist;
  return { pivot, mesh };
}

// Construction
const sun = createPlanet(16, sunTexture, 0, true);
const mercury = createPlanet(3.2, mercuryTexture, 28);
const venus = createPlanet(5.8, venusTexture, 44);
const earth = createPlanet(6, earthTexture, 62);
const mars = createPlanet(4, marsTexture, 78);
const jupiter = createPlanet(12, jupiterTexture, 110);
const saturn = createPlanet(10, saturnTexture, 150);
const uranus = createPlanet(7, uranusTexture, 190);
const neptune = createPlanet(7, neptuneTexture, 220);

// --- Moon ---
const moonPivot = new THREE.Object3D();
earth.pivot.add(moonPivot);
moonPivot.position.x = 62;

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 30, 30),
  new THREE.MeshStandardMaterial({ map: getTexture(moonTexture) }),
);
moonPivot.add(moon);
moon.position.x = 12;

// --- Saturn Ring ---
const saturnRing = new THREE.Mesh(
  new THREE.RingGeometry(12, 22, 64),
  new THREE.MeshBasicMaterial({
    map: getTexture(saturnRingTexture),
    side: THREE.DoubleSide,
    transparent: true,
  }),
);
saturn.mesh.add(saturnRing);
saturnRing.rotation.x = -0.5 * Math.PI;

// --- Uranus Ring ---
const uranusRing = new THREE.Mesh(
  new THREE.RingGeometry(8, 14, 64),
  new THREE.MeshBasicMaterial({
    map: getTexture(uranusRingTexture),
    side: THREE.DoubleSide,
    transparent: true,
  }),
);
uranus.mesh.add(uranusRing);
uranusRing.rotation.x = -0.5 * Math.PI;

// --- Randomize Starting Positions ---
const randomizeOrbit = (planetObj) => {
  // Rotate the pivot by a random amount between 0 and 2*PI
  planetObj.pivot.rotation.y = Math.PI * 2 * Math.random();
};

// Apply to all planets
randomizeOrbit(mercury);
randomizeOrbit(venus);
randomizeOrbit(earth);
randomizeOrbit(mars);
randomizeOrbit(jupiter);
randomizeOrbit(saturn);
randomizeOrbit(uranus);
randomizeOrbit(neptune);

function animate() {
  // Axial
  sun.rotateY(0.004);
  mercury.mesh.rotateY(0.004);
  venus.mesh.rotateY(0.002);
  earth.mesh.rotateY(0.02);
  moon.rotateY(0.01);
  mars.mesh.rotateY(0.018);
  jupiter.mesh.rotateY(0.04);
  saturn.mesh.rotateY(0.038);
  uranus.mesh.rotateY(0.03);
  neptune.mesh.rotateY(0.032);

  // Orbital
  mercury.pivot.rotateY(0.04);
  venus.pivot.rotateY(0.015);
  earth.pivot.rotateY(0.01);
  moonPivot.rotateY(0.03);
  mars.pivot.rotateY(0.008);
  jupiter.pivot.rotateY(0.002);
  saturn.pivot.rotateY(0.0009);
  uranus.pivot.rotateY(0.0004);
  neptune.pivot.rotateY(0.0001);

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
