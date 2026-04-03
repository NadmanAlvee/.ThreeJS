import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import stars_L from "../assets/stars_L.jpg";
import stars_R from "../assets/stars_R.jpg";
import milky_L from "../assets/milky_L.jpg";
import milky_R from "../assets/milky_R.jpg";
import sunTexture from "../assets/2k_sun.jpg";
import mercuryTexture from "../assets/2k_mercury.jpg";
import venusTexture from "../assets/2k_venus_surface.jpg";
import earthTexture from "../assets/2k_earth.jpg";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000,
);
const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.decay = 0;
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

function createPlanet(radius, textureSrc, isStar = false) {
  const planetGeo = new THREE.SphereGeometry(radius, 60, 60);
  const MaterialClass = isStar
    ? THREE.MeshBasicMaterial
    : THREE.MeshStandardMaterial;
  const planetMesh = new THREE.Mesh(
    planetGeo,
    new MaterialClass({ map: getTexture(textureSrc) }),
  );

  if (!isStar) {
    const centralBodyObj = new THREE.Object3D();
    scene.add(centralBodyObj);
    centralBodyObj.add(planetMesh);
    return { centralBodyObj, planetMesh };
  }
  scene.add(planetMesh);
  return planetMesh;
}

const sun = createPlanet(655.8, sunTexture, true);
const mercury = createPlanet(2.3, mercuryTexture);
mercury.planetMesh.position.x = 920;
const venus = createPlanet(5.7, venusTexture);
venus.planetMesh.position.x = 1880;
const earth = createPlanet(6, earthTexture);
earth.planetMesh.position.x = 2860;

const planets = { Sun: sun, Mercury: mercury, Venus: venus, Earth: earth };
const cameraSettings = {
  viewMode: "Planet Focus",
  target: "Earth",
  offsetX: 30,
  offsetY: 10,
  offsetZ: 20,
  solarView: function () {
    this.viewMode = "Solar System";
    scene.add(camera);
    camera.position.set(0, 2000, 5000);
    controls.target.set(0, 0, 0);
  },
};

const gui = new dat.GUI();
gui.add(cameraSettings, "viewMode").listen();
gui.add(cameraSettings, "solarView").name("Switch to Solar View");
gui.add(cameraSettings, "target", Object.keys(planets)).onChange(() => {
  cameraSettings.viewMode = "Planet Focus";
  updateCameraParent();
});

const folder = gui.addFolder("Camera Offset (Planet Mode)");
folder.add(cameraSettings, "offsetX", -200, 200, 0.1);
folder.add(cameraSettings, "offsetY", -200, 200, 0.1);
folder.add(cameraSettings, "offsetZ", -200, 200, 0.1);
folder.open();

function updateCameraParent() {
  const selected = planets[cameraSettings.target];
  if (selected.centralBodyObj) {
    selected.centralBodyObj.add(camera);
  } else {
    scene.add(camera);
  }
}

updateCameraParent();

function animate() {
  sun.rotateY(0.0004);
  mercury.planetMesh.rotateY(0.0004);
  mercury.centralBodyObj.rotateY(0.002);
  venus.planetMesh.rotateY(0.0002);
  venus.centralBodyObj.rotateY(0.0015);
  earth.planetMesh.rotateY(0.002);
  earth.centralBodyObj.rotateY(0.001);

  if (cameraSettings.viewMode === "Planet Focus") {
    const selected = planets[cameraSettings.target];
    const targetPos = new THREE.Vector3();

    if (selected.planetMesh) {
      camera.position.set(
        selected.planetMesh.position.x + cameraSettings.offsetX,
        cameraSettings.offsetY,
        cameraSettings.offsetZ,
      );
      selected.planetMesh.getWorldPosition(targetPos);
    } else {
      targetPos.set(0, 0, 0);
    }
    controls.target.copy(targetPos);
  }

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
