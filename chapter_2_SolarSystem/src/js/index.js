import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// assets
import stars_L from "../assets/stars_L.jpg";
import stars_R from "../assets/stars_R.jpg";
import milky_L from "../assets/milky_L.jpg";
import milky_R from "../assets/milky_R.jpg";
import sunTexture from "../assets/2k_sun.jpg";
import mercuryTexture from "../assets/2k_mercury.jpg";
import venusTexture from "../assets/2k_venus_surface.jpg";

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
  1000,
);
camera.position.set(0, 0, 300);

// orbit control
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffaa00, 20000, 300);
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
  parentMesh,
) {
  const planetGeo = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments,
  );
  planetMaterial = new THREE.MeshStandardMaterial({
    map: getTexture(textureSrc),
  });
}

// Sun
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
  map: getTexture(sunTexture),
});
const sunMesh = new THREE.Mesh(sunGeo, sunMat);

sunMesh.position.set(0, 0, 0);
scene.add(sunMesh);

// Mercury

function animate(time) {
  // Solar rotations
  sunMesh.rotateY(0.004);
  mercuryMesh.rotateY(0.006);

  // render
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateWorldMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
