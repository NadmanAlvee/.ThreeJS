import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "dat.gui";

// create render
const renderer = new THREE.WebGLRenderer();
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
camera.position.set(-20, 20, 50);

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
scene.add(boxMesh);

// axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -0.5 * Math.PI;
scene.add(planeMesh);

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
sphereMesh.position.x = 10;
scene.add(sphereMesh);

// dat gui
const gui = new dat.GUI();

const options = {
  sphereColor: "#ffea00",
  wireframe: false,
  bouncingStep: 0,
  bouncingSpeed: 0.01,
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

sphereMeshGUI.add(sphereMesh.position, "z");

const ambientLight = new THREE.AmbientLight("#ffffff", 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
scene.add(directionalLight);

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(dLightHelper);

// animate
function animate(time) {
  // elapsed time since start of the animation loop = @param time

  boxMesh.rotation.x = time / 1000;
  boxMesh.rotation.y = time / 1000;

  options.bouncingStep += options.bouncingSpeed;
  // sphereMesh.scale.x = 1 * Math.abs(Math.sin(options.bouncingStep));
  // sphereMesh.scale.y = 1 * Math.abs(Math.sin(options.bouncingStep));
  sphereMesh.scale.z = 1 * Math.abs(Math.sin(options.bouncingStep));

  sphereMesh.position.y = 10 * Math.abs(Math.sin(options.bouncingStep));

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// render one scene with camera
// renderer.render(scene, camera);
