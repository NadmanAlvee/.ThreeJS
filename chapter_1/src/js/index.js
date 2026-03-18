import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(boxMesh);

// axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -0.5 * Math.PI;
scene.add(planeMesh);

// grid helper
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

function animate(time) {
  // console.log(time);
  // console.log(time / 1000);

  boxMesh.rotation.x = time / 1000;
  boxMesh.rotation.y = time / 1000;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// render one scene with camera
// renderer.render(scene, camera);
