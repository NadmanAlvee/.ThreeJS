import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "dat.gui";

// create render
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

// debug
console.log(window.devicePixelRatio);

// create scene
const scene = new THREE.Scene();

// create camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(-10, 20, 40);

// orbit control
const controls = new OrbitControls(camera, renderer.domElement);

// controls.cursorStyle = "grab";
// controls.enableZoom = false;
controls.update();

// box
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);

// axes helper
const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -0.5 * Math.PI;
scene.add(planeMesh);
planeMesh.receiveShadow = true;

// grid helper
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

// sphere
const sphereGeometry = new THREE.SphereGeometry(2, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  // wireframe: true,
});
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.castShadow = true;
sphereMesh.position.x = 5;
sphereMesh.position.y = 2;
scene.add(sphereMesh);

// dat gui
const gui = new dat.GUI();

const options = {
  sphereColor: "#ffea00",
  wireframe: false,
  bouncingStep: 0,
  bouncingSpeed: 0.01,
  spotLightColor: "#fff",
  intensity: 50000,
  angle: 0.1,
  penumbra: 0,
};

const sphereMeshGUI = gui.addFolder("sphereMesh");

sphereMeshGUI.addColor(options, "sphereColor").onChange((value) => {
  sphereMesh.material.setValues({ color: value });
});

sphereMeshGUI.add(options, "wireframe").onChange((value) => {
  sphereMesh.material.setValues({ wireframe: value });
});

sphereMeshGUI.add(options, "bouncingSpeed").onChange((value) => {
  options.bouncingSpeed = value;
});

// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.3);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(10, 20, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;
// scene.add(directionalLight);

// Directional light Shadow Camera
const dLightShadowCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera,
);
// scene.add(dLightShadowCameraHelper);

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 3);
// scene.add(dLightHelper);

// Spot Light
// Radian = (degree * Math.PI / 180)
// Degree = (radian * 180 / Math.PI)
const spotLight = new THREE.SpotLight("#fff", 50000, 0, 0.1);
spotLight.position.set(100, 100, 0);
spotLight.castShadow = true;
scene.add(spotLight);

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

const spotLightGUI = gui.addFolder("spotLight");

spotLightGUI.addColor(options, "spotLightColor").onChange((value) => {
  spotLight.color.set(value);
});

spotLightGUI
  .add(options, "penumbra")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    spotLight.penumbra = value;
  });

spotLightGUI
  .add(options, "angle")
  .min(0)
  .max(Math.PI / 2)
  .step(0.01)
  .onChange((value) => {
    spotLight.angle = value;
  });

spotLightGUI
  .add(options, "intensity")
  .min(0)
  .max(100000)
  .onChange((value) => {
    spotLight.intensity = value;
  });

// fog
// scene.fog = new THREE.Fog("#fff", 10, 200);
scene.fog = new THREE.FogExp2("#fff", 0.005);

// animate
function animate(time) {
  // elapsed time since start of the animation loop = @param time

  // boxMesh.rotation.x = time / 1000;
  // boxMesh.rotation.y = time / 1000;

  // options.bouncingStep += options.bouncingSpeed;
  // sphereMesh.position.y = 10 * Math.abs(Math.sin(options.bouncingStep));

  // sphereMesh.position.x = 5 * Math.sin((90 * Math.PI) / 180);
  sphereMesh.position.x = 5 * Math.cos(time / 500);
  sphereMesh.position.z = 5 * Math.sin(time / 500);

  // spotlight
  sLightHelper.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// render one scene with camera
// renderer.render(scene, camera);
