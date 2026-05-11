import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

class World {
  // constructor
  constructor() {
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();
    this.controls = this.#initOrbitControl();

    this.loadingManager = this.#initLoadingManager();
    this.gltfLoader = this.#initGltfLoader();
    this.hdrTextureLoader = this.#initHdrTextureLoader();

    this.#initLights();
    this.#initBackground();
    this.#initObjects();
    this.groundMesh = null;

    this.#initAnimationLoop();
    this.#initResize();
  }

  // Render
  #initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.append(renderer.domElement);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    return renderer;
  }

  // Scene
  #initScene() {
    const scene = new THREE.Scene();
    return scene;
  }

  // Camera
  #initPerspectiveCamera() {
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 15, 30);
    return camera;
  }

  // Orbit Control
  #initOrbitControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.minDistance = 3;
    // controls.maxDistance = 20;
    // controls.maxPolarAngle = Math.PI / 2.1;
    controls.update();
    return controls;
  }

  // Gltf Loader
  #initGltfLoader() {
    const gltfLoader = new GLTFLoader(this.loadingManager);
    return gltfLoader;
  }

  // hdr loader
  #initHdrTextureLoader() {
    const hdrTextureLoader = new HDRLoader();
    return hdrTextureLoader;
  }

  // loading manager
  #initLoadingManager() {
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onStart = (url, loaded, itemsTotal) => {
      console.log(`Started loading`);
    };

    const progressBar = document.getElementById("progress-bar");

    loadingManager.onProgress = (url, loaded, itemsTotal) => {
      console.log(`Loading ${loaded} of ${itemsTotal} resources. ${url}`);
      progressBar.value = Math.abs((loaded / itemsTotal) * 100);
    };

    loadingManager.onError = (url) => {
      console.log(`An error occured while loading! ${url}`);
    };

    const progressBarContainer = document.querySelector(
      ".loading-progress-container",
    );
    loadingManager.onLoad = () => {
      console.log(`All resources have loaded.`);
      progressBarContainer.style.display = "none";
    };

    return loadingManager;
  }

  // Background
  #initBackground() {
    this.scene.background = new THREE.Color(0x111111);
  }

  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  async #initObjects() {
    // ground
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0000ff,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotateX(Math.PI / 2);
    this.groundMesh = groundMesh;
    groundMesh.receiveShadow = true;
    // this.scene.add(this.groundMesh);

    // hdr texture
    const hdrTexture1 = await this.hdrTextureLoader.loadAsync(
      "./environments/MR_INT-001_NaturalStudio_NAD.hdr",
    );

    hdrTexture1.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = hdrTexture1;

    // metal glove
    this.metalGlove = await this.gltfLoader.loadAsync(
      "./models/METAL_Glove.glb",
    );
    this.metalGlove.scene.scale.set(10, 10, 10);
    this.metalGlove.scene.position.set(0, -7, 0);
    console.log(this.metalGlove);

    this.scene.add(this.metalGlove.scene);
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  // Handle Screen Resize
  #initResize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
    });
  }
}

const myWorld = new World();
