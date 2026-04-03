import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// assets
import stars_L from "../assets/stars_L.jpg";
import stars_R from "../assets/stars_R.jpg";
import milky_L from "../assets/milky_L.jpg";
import milky_R from "../assets/milky_R.jpg";
import sunTexture from "../assets/2k_sun.jpg";
import mercuryTexture from "../assets/2k_mercury.jpg";
import venusTexture from "../assets/2k_venus_surface.jpg";
import earthTexture from "../assets/2k_earth.jpg";

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100000,
);
// camera.position.set(0, 500, 4000);

// orbit control
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffaa00, 10, 10000);
pointLight.decay = 0;
scene.add(pointLight);

// Solar System
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

const getTexture = (source) => {
  const texture = textureLoader.load(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// Skybox
// -- order
// +X (Positive X): Right
// -X (Negative X): Left
// +Y (Positive Y): Top
// -Y (Negative Y): Bottom
// +Z (Positive Z): Front
// -Z (Negative Z): Back
scene.background = cubeTextureLoader.load([
  milky_L,
  milky_L,
  stars_L,
  stars_R,
  milky_R,
  milky_R,
]);

// -- Solar System
function createPlanet(
  radius,
  widthSegments,
  heightSegments,
  getTexture,
  textureSrc,
  isStar = false,
) {
  const planetGeo = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments,
  );
  const MaterialClass = isStar
    ? THREE.MeshBasicMaterial
    : THREE.MeshStandardMaterial;
  const planetMaterial = new MaterialClass({
    map: getTexture(textureSrc),
  });
  const planetMesh = new THREE.Mesh(planetGeo, planetMaterial);

  if (!isStar) {
    const centralBodyObj = new THREE.Object3D();
    scene.add(centralBodyObj);
    centralBodyObj.add(planetMesh);
    centralBodyObj.position.set(0, 0, 0);

    return {
      centralBodyObj,
      planetMesh,
    };
  } else {
    scene.add(planetMesh);
    return planetMesh;
  }
}

// --- Sun (Massive relative to Earth) ---
const sunMesh = createPlanet(655.8, 60, 60, getTexture, sunTexture, true);

// --- Mercury ---
const MercuryObj = createPlanet(2.3, 30, 30, getTexture, mercuryTexture);
MercuryObj.planetMesh.position.x = 920;

// --- Venus ---
const VenusObj = createPlanet(5.7, 30, 30, getTexture, venusTexture);
VenusObj.planetMesh.position.x = 1880;

// --- Earth (Your target size) ---
const EarthObj = createPlanet(6, 30, 30, getTexture, earthTexture);
EarthObj.planetMesh.position.x = 2860;

EarthObj.centralBodyObj.add(camera);
camera.position.x = 2890;
camera.position.y = 8;
camera.position.z = 10;

// Mars
// const MarsObj = createPlanet(0.08, 10, 10, getTexture, marsTexture);
// MarsObj.planetMesh.position.x = 5236;

function animate(time) {
  // Axial Rotation
  sunMesh.rotateY(0.0004);
  MercuryObj.planetMesh.rotateY(0.0004);
  VenusObj.planetMesh.rotateY(0.0002);
  EarthObj.planetMesh.rotateY(0.002);

  // Orbital Rotation
  MercuryObj.centralBodyObj.rotateY(0.002);
  VenusObj.centralBodyObj.rotateY(0.0015);
  EarthObj.centralBodyObj.rotateY(0.001);

  // Render updates
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  // 1. Update aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;

  // 2. Recalculate the projection matrix
  camera.updateProjectionMatrix();

  // 3. Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 4. Handle high-DPI screens (Retina/4K)
  renderer.setPixelRatio(window.devicePixelRatio);
});
