/**
 * Three.js World bootstrap (single-file scene).
 *
 * What this file does:
 * - Creates a renderer + scene + camera + orbit controls
 * - Adds lighting and a background color
 * - Creates a ground plane
 * - Loads GLTF models (async) and adds them to the scene
 * - Starts a render loop and handles window resizing
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class World {
  constructor() {
    // Core building blocks
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();

    // User interaction
    this.controls = this.#initOrbitControl();

    // Asset loading
    this.gltfLoader = this.#initGltfLoader();

    // Scene look & lighting
    this.#initLights();
    this.#initBackground();

    // Things we create later
    this.groundMesh = null;
    this.donkeyGltf = null;

    // Objects + models
    this.#initObjects();

    // Runtime behavior
    this.#initAnimationLoop();
    this.#initResize();
  }

  // Creates the WebGL renderer (canvas) and configures shadows.
  #initRenderer() {
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Clamp pixel ratio to avoid huge GPU cost on high-DPI screens.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    document.body.append(renderer.domElement);
    return renderer;
  }

  // Root container for all 3D objects.
  #initScene() {
    return new THREE.Scene();
  }

  // Main viewing camera.
  #initPerspectiveCamera() {
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // Pulled back and above the ground so you see the whole setup.
    camera.position.set(0, 15, 30);
    return camera;
  }

  // Mouse controls for orbiting around the scene.
  #initOrbitControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    // If you want constraints later, these are good knobs:
    // controls.minDistance = 3;
    // controls.maxDistance = 20;
    // controls.maxPolarAngle = Math.PI / 2.1;

    controls.update();
    return controls;
  }

  // Loader for .gltf/.glb models.
  #initGltfLoader() {
    return new GLTFLoader();
  }

  // Background clear color for the scene.
  #initBackground() {
    this.scene.background = new THREE.Color(0x000000);
  }

  // Lighting setup. (BasicMaterial ignores light; Standard/Phong react to it.)
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;

    // Tighten shadow camera bounds so shadows are sharper.
    directionalLight.shadow.camera.bottom = -12;

    this.scene.add(directionalLight);
  }

  // Creates ground + loads models. This is the main "content" method.
  async #initObjects() {
    // --- Ground (floor) ---
    const groundGeometry = new THREE.PlaneGeometry(40, 40);

    // MeshBasicMaterial is always fully lit (good for debugging).
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      side: THREE.DoubleSide,
      // wireframe: true,
    });

    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

    // PlaneGeometry is created vertical; rotate to become a floor.
    groundMesh.rotateX(Math.PI / 2);

    this.groundMesh = groundMesh;

    this.scene.add(this.groundMesh);

    // --- Models (GLTF) ---
    try {
      // IMPORTANT: await the Promise to get the actual GLTF object.
      const gltf = await this.gltfLoader.loadAsync("models/Donkey.gltf");

      // Store it so you can later change materials / traverse meshes / play animations.
      this.donkeyGltf = gltf;

      // The thing you add to the scene is `gltf.scene` (a THREE.Group).
      this.scene.add(gltf.scene);

      console.log("Donkey loaded:", gltf);
    } catch (err) {
      console.error("Failed to load Donkey.gltf:", err);
    }
  }

  // Runs every frame.
  #initAnimationLoop() {
    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  // Keeps aspect ratio and renderer size correct when the window changes.
  #initResize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);

      // (Optional) mirror the clamp here too if you want consistency:
      // this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setPixelRatio(window.devicePixelRatio);
    });
  }
}

const myWorld = new World();
