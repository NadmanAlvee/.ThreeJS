import * as THREE from "three";

// create render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

// create scene
const scene = new THREE.Scene();

// create camera
const perspectiveCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
perspectiveCamera.position.set(0, 0, 5);

const axesHelper = new THREE.AxesHelper(5);

scene.add(axesHelper);

// render scene with camera
renderer.render(scene, perspectiveCamera);
