import * as THREE from "three";

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 0, 20);

// axis helper
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

renderer.render(scene, camera);
