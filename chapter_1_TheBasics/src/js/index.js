import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as dat from "dat.gui";

// assets
import nebula from "../assets/nebula.jpg";
import stars from "../assets/stars.jpg";
import stars_L from "../assets/stars_L.jpg";
import stars_R from "../assets/stars_R.jpg";
import milky_L from "../assets/milky_L.jpg";
import milky_R from "../assets/milky_R.jpg";
import nebulaCube from "../assets/nebulaCube.jpg";
import starsCube from "../assets/starsCube.jpg";
import earth from "../assets/earth.jpg";

// create render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.append(renderer.domElement);

// setting static background color
// renderer.setClearColor("#ffea00");

const loader = new GLTFLoader();

const options = {
  cameraX: 40,
  cameraY: 30,
  cameraZ: -40,

  sphereColor: "#ffea00",
  wireframe: false,
  bouncingStep: 0,
  bouncingSpeed: 0.01,
  spotLightColor: "#fff",
  intensity: 50000,
  angle: 0.5,
  penumbra: 0,
  waveAmplitudeX: 0.5,
  waveAmplitudeY: 0.5,
  waveCount: 0.7,
};

// dat gui
const gui = new dat.GUI();

// create scene
const scene = new THREE.Scene();

// create camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(options.cameraX, options.cameraY, options.cameraZ);
const cameraGUI = gui.addFolder("Camera");
cameraGUI.add(options, "cameraX").onChange((value) => {
  camera.position.x = value;
});
cameraGUI.add(options, "cameraY").onChange((value) => {
  camera.position.y = value;
});
cameraGUI.add(options, "cameraZ").onChange((value) => {
  camera.position.z = value;
});

// orbit control
const controls = new OrbitControls(camera, renderer.domElement);

// controls.cursorStyle = "grab";
// controls.enableZoom = false;
controls.update();

// loading texture

// 1. Static Texture
const textureLoader = new THREE.TextureLoader();
// const starsTexture = textureLoader.load(stars);
// starsTexture.colorSpace = THREE.SRGBColorSpace;
// scene.background = starsTexture;

// 2. Cube Texture
// -- order
// +X (Positive X): Right
// -X (Negative X): Left
// +Y (Positive Y): Top
// -Y (Negative Y): Bottom
// +Z (Positive Z): Front
// -Z (Negative Z): Back
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader.load([
  milky_L,
  milky_L,
  stars_L,
  stars_L,
  milky_R,
  milky_R,
]);
cubeTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = cubeTexture;

// axes helper
const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// plane
const planeGeometry = new THREE.PlaneGeometry(80, 80);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xe5ff00,
  side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -0.5 * Math.PI;
planeMesh.receiveShadow = true;
scene.add(planeMesh);

// grid helper
const gridHelper = new THREE.GridHelper(30);
// scene.add(gridHelper);

// box
// Multi material
// const boxMultiMaterial = [
//   new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
//   new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
//   new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
//   new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
//   new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
//   new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
// ];

const boxMultiMaterial = [
  new THREE.MeshBasicMaterial({ color: "#ff0000" }),
  new THREE.MeshBasicMaterial({ color: "#00ff22" }),
  new THREE.MeshBasicMaterial({ color: "#4400ff" }),
  new THREE.MeshBasicMaterial({ color: "#ff00dd" }),
  new THREE.MeshBasicMaterial({ color: "#00ff95" }),
  new THREE.MeshBasicMaterial({ color: "#ff7b00" }),
];

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const boxMesh = new THREE.Mesh(boxGeometry, boxMultiMaterial);
boxMesh.position.set(-20, 5, 0);
boxMesh.castShadow = true;
scene.add(boxMesh);
boxMesh.name = "boxMesh";

// sphere
const earthTexture = textureLoader.load(earth);
earthTexture.colorSpace = THREE.SRGBColorSpace;

const sphereGeometry = new THREE.SphereGeometry(5, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  // color: 0xa6ff00,
  // wireframe: true,
});
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.castShadow = true;
sphereMesh.position.x = 5;
sphereMesh.position.y = 2;
sphereMesh.name = "sphereMesh";
scene.add(sphereMesh);

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
const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
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
scene.add(dLightHelper);

// Spot Light
// Radian = (degree * Math.PI / 180)
// Degree = (radian * 180 / Math.PI)
const spotLight = new THREE.SpotLight("#fff", 50000, 0, 0.9);
spotLight.position.set(60, 60, 0);
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
// scene.fog = new THREE.FogExp2("#fff", 0.005);

const WaveGUI = gui.addFolder("Wave");
WaveGUI.add(options, "waveAmplitudeX")
  .min(0.1)
  .max(5)
  .onChange((value) => {
    options.waveAmplitudeX = value;
  });
WaveGUI.add(options, "waveAmplitudeY")
  .min(0.1)
  .max(5)
  .onChange((value) => {
    options.waveAmplitudeY = value;
  });
WaveGUI.add(options, "waveCount")
  .min(0.1)
  .max(5)
  .onChange((value) => {
    options.waveCount = value;
  });

// Plane 2
const plane2Geometry = new THREE.PlaneGeometry(15, 15, 20, 20);
const plane2Material = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  wireframe: true,
});
const planeMesh2 = new THREE.Mesh(plane2Geometry, plane2Material);
scene.add(planeMesh2);
planeMesh2.position.set(0, 5, 10);
planeMesh2.rotation.x = Math.PI * -0.5;
// planeMesh2.castShadow = true;

// changing vertices position
// array element 0, 1, 2 represents the vertex 1's x y z
// planeMesh2.geometry.attributes.position.array[0] = 10 * Math.random();
// planeMesh2.geometry.attributes.position.array[1] = 10 * Math.random();
// planeMesh2.geometry.attributes.position.array[2] = 10 * Math.random();

// for (let i = 0; i < planeMesh2.geometry.attributes.position.array.length; i++) {
//   planeMesh2.geometry.attributes.position.array[i] = 5 * Math.random();
// }

// plane 3s
const plane3Geometry = new THREE.PlaneGeometry(15, 15, 20, 20);
const plane3Material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
const planeMesh3 = new THREE.Mesh(plane3Geometry, plane3Material);
scene.add(planeMesh3);
planeMesh3.position.set(20, 5, 10);
planeMesh3.rotation.x = Math.PI * 0.5;
const originalPositions = planeMesh3.geometry.attributes.position.array.slice();

// Sphere 2
const vShader = `
  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fShader = `
  void main(){
    gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
  }
`;

const sphere2Geometry = new THREE.SphereGeometry(5);
const sphere2Material = new THREE.ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
});
const sphere2Mesh = new THREE.Mesh(sphere2Geometry, sphere2Material);
sphere2Mesh.position.z = -20;
scene.add(sphere2Mesh);

// Tree 1 - GLB - NON Comporessed
loader.load("/assets/models/Tree_1.glb", (gltf) => {
  const model = gltf.scene;

  model.position.set(10, 0, -10);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      // child.receiveShadow = true;
      child.material.side = THREE.DoubleSide;
    }
  });

  // list all names
  model.traverse((child) => {
    if (child.isMesh) {
      // console.log("Found mesh named:", child.name); // Check your browser console!
    }
  });

  scene.add(model);
});

// Create your custom materials
const leaf1Material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  roughness: 1,
  metalness: 0,
  side: THREE.DoubleSide,
});
const leaf2Material = new THREE.MeshStandardMaterial({
  color: 0xff0ef0,
  roughness: 1,
  metalness: 0,
  side: THREE.DoubleSide,
});

const trunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x4d2926,
  roughness: 1,
});

// Tree 2 - GLTF - NON Comporessed
loader.load("/assets/models/Tree_1.gltf", (gltf) => {
  const model = gltf.scene;

  model.position.set(20, 0, -10);

  model.traverse((child) => {
    if (child.isMesh) {
      // shadow
      child.castShadow = true;
      child.material.side = THREE.DoubleSide;
      // list name
      console.log("Found mesh named:", child.name, "child: ", child);

      // set material
      switch (child.name) {
        case "Cube003": {
          child.material = trunkMaterial;
          break;
        }
        case "Cube003_1": {
          child.material = leaf1Material;
          break;
        }
        case "Cube003_2": {
          child.material = leaf2Material;
          break;
        }
      }
    }
  });

  scene.add(model);
});

// Tree 3 - GLTF - Compressed

// Mouse position
const mousePosition = new THREE.Vector2(-10, -10);
window.addEventListener("mousemove", (e) => {
  // Normalizing into -1, 1
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();

// animate
function animate(time) {
  // elapsed time since start of the animation loop = @param time

  // boxMesh.rotation.x = time / 1000;
  // boxMesh.rotation.y = time / 1000;

  // options.bouncingStep += options.bouncingSpeed;
  // sphereMesh.position.y = 10 * Math.abs(Math.sin(options.bouncingStep));

  const axialTilt = 23.5 * (Math.PI / 180);
  sphereMesh.rotation.z = axialTilt;

  // Constant counter-clockwise rotation
  sphereMesh.rotation.y = time * 0.001;

  // Orbital path
  sphereMesh.position.z = 40 * Math.cos(time * 0.0002);
  sphereMesh.position.x = 40 * Math.sin(time * 0.0002);

  // spotlight
  sLightHelper.update();

  // Ray caster
  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);
  // console.log(intersects);
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.name === "boxMesh") {
      boxMesh.rotation.x = time / 1000;
      boxMesh.rotation.y = time / 1000;
    }
  }

  // shader animation
  const planeMesh2PositionArray = planeMesh2.geometry.attributes.position.array;
  for (let i = 0; i < planeMesh2PositionArray.length; i += 3) {
    planeMesh2PositionArray[i + 2] =
      options.waveAmplitudeX *
        Math.sin(planeMesh2PositionArray[i] * options.waveCount + time / 500) +
      options.waveAmplitudeY *
        Math.sin(
          planeMesh2PositionArray[i + 1] * options.waveCount + time / 500,
        );
  }
  // update the geometry
  planeMesh2.geometry.attributes.position.needsUpdate = true;

  // claude animation
  const positions = planeMesh3.geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = originalPositions[i]; // original X of this vertex
    const y = originalPositions[i + 1]; // original Y of this vertex

    // SET (not +=) z based on a wave using original x/y + time
    positions[i + 2] =
      Math.sin(x * 0.8 + time * 0.002) * 0.4 +
      Math.cos(y * 0.8 + time * 0.002) * 0.4;
  }
  planeMesh3.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// render one scene with camera
// renderer.render(scene, camera);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateWorldMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
