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
    this.gltfLoader = this.#initGltfLoader();
    this.hdrTextureLoader = this.#hdrTextureLoader();

    // this.#initLights();
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
    // renderer.toneMappingExposure = 0.8;
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
    const gltfLoader = new GLTFLoader();
    return gltfLoader;
  }

  // hdr loader
  #hdrTextureLoader() {
    const hdrTextureLoader = new HDRLoader();
    return hdrTextureLoader;
  }

  // Background
  async #initBackground() {
    const textureSrc = [
      "MR_INT-001_NaturalStudio_NAD.hdr",
      "MR_INT-002_BathroomHard_Pierre.hdr",
      "MR_INT-003_Kitchen_Pierre.hdr",
      "MR_INT-004_BigWindowTree_Thea.hdr",
      "MR_INT-005_WhiteNeons_NAD.hdr",
      "MR_INT-006_LoftIndustrialWindow_Griffintown.hdr",
    ];
    const hdrTexture = await this.hdrTextureLoader.loadAsync(
      `./assets/${textureSrc[5]}`,
    );

    if (hdrTexture) {
      hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = hdrTexture;
      // this.scene.environment = hdrTexture;
    }

    // this.scene.background = new THREE.Color(0xededed);
  }
  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  async #initObjects() {
    // Sphere 1
    const sphere1EnvMap = await this.hdrTextureLoader.loadAsync(
      "./assets/MR_INT-006_LoftIndustrialWindow_Griffintown.hdr",
    );
    sphere1EnvMap.mapping = THREE.EquirectangularReflectionMapping;
    const sphereGeometry = new THREE.SphereGeometry(5);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 1,
      envMap: sphere1EnvMap,
    });
    const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene.add(sphere1);

    // Sphere 2
    const sphere2EnvMap = await this.hdrTextureLoader.loadAsync(
      "./assets/MR_INT-001_NaturalStudio_NAD.hdr",
    );
    sphere2EnvMap.mapping = THREE.EquirectangularReflectionMapping;
    const sphere2Geometry = new THREE.SphereGeometry(5);
    const sphere2Material = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 1,
      envMap: sphere2EnvMap,
    });
    const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
    this.scene.add(sphere2);
    sphere2.position.x = 10;
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
