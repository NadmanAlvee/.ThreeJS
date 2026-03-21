import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "dat.gui";

// create render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

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
const sphereGeometry = new THREE.SphereGeometry(10, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  wireframe: true,
});
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// scene.add(sphereMesh);

// sphere 2
const sphereGeometry2 = new THREE.SphereGeometry(5, 50, 50);
const sphereMaterial2 = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  // wireframe: true,
});
const sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
sphereMesh2.position.x = 10;
scene.add(sphereMesh2);

// dat gui
const gui = new dat.GUI();

const options = {
  sphereColor: "#ffea00",
  wireframe: false,
  bouncingStep: 0,
  bouncingSpeed: 0.05,
  // sphereRadius: 5,
};

const SphereMesh2GUI = gui.addFolder("SphereMesh2");

SphereMesh2GUI.addColor(options, "sphereColor").onChange((value) => {
  sphereMesh2.material.setValues({ color: value });
});

SphereMesh2GUI.add(options, "wireframe").onChange((value) => {
  sphereMesh2.material.setValues({ wireframe: value });
});

SphereMesh2GUI.add(options, "bouncingSpeed").onChange((value) => {
  options.bouncingSpeed = value;
});

SphereMesh2GUI.add(sphereMesh2.position, "z");

const ambientLight = new THREE.AmbientLight("#ffffff", 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
scene.add(directionalLight);

// animate
function animate(time) {
  // elapsed time since start of the animation loop

  boxMesh.rotation.x = time / 1000;
  boxMesh.rotation.y = time / 1000;

  options.bouncingStep += options.bouncingSpeed;
  sphereMesh2.position.y = 10 * Math.abs(Math.sin(options.bouncingStep));

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// render one scene with camera
// renderer.render(scene, camera);
