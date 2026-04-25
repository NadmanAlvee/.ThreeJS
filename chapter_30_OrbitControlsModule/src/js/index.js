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
    this.textureLoader = this.#initTextureLoader();
    this.hdrTextureLoader = this.#inithdrTextureLoader();

    this.#initLights();
    this.#initBackground();

    this.car = null;
    this.#initObjects();

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;
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
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  // Orbit Control
  #initOrbitControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    // config
    controls.autoRotate = true;
    controls.autoRotateSpeed = -1.5;

    // max rotation Y
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2.1;

    // max rotation X
    // controls.minAzimuthAngle = Math.PI / 4;
    // controls.maxAzimuthAngle = Math.PI / 2;

    controls.maxDistance = 5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // controls.enablePan = false;

    // controls.rotateSpeed = 2;
    // controls.panSpeed = 10;
    // controls.target = new THREE.Vector3(0, 0, 0);

    // MOUSE BUTTONS
    // controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    // controls.mouseButtons.LEFT = THREE.MOUSE.DOLLY;

    // KEY BUTTONS
    // controls.keys = {
    //   LEFT: "KeyA",
    //   UP: "KeyW",
    //   RIGHT: "KeyD",
    //   BOTTOM: "KeyS",
    // };
    // controls.listenToKeyEvents(window);
    // controls.keyPanSpeed = 50;

    window.addEventListener("keydown", (e) => {
      console.log(e.code);

      if (e.code === "KeyS") {
        controls.saveState();
      }
      if (e.code === "Digit1") {
        controls.reset();
      }
    });

    controls.update();
    return controls;
  }

  // loading manager
  #initLoadingManager() {
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onStart = (url, i, itemsTotal) => {
      console.log(`Started loading`);
    };

    loadingManager.onProgress = (url, i, itemsTotal) => {
      console.log(`Loading ${i} of ${itemsTotal} resources. ${url}`);
    };

    loadingManager.onLoad = (url, i, itemsTotal) => {
      console.log(`All resources have loaded.`);
    };

    return loadingManager;
  }

  // Gltf Loader
  #initGltfLoader() {
    const gltfLoader = new GLTFLoader(this.loadingManager);
    return gltfLoader;
  }

  // texture loader
  #initTextureLoader() {
    const textureLoader = new THREE.TextureLoader(this.loadingManager);
    return textureLoader;
  }

  // hdr loader
  #inithdrTextureLoader() {
    const hdrTextureLoader = new HDRLoader(this.loadingManager);
    return hdrTextureLoader;
  }

  // Background
  #initBackground() {
    // this.scene.background = new THREE.Color(0xededed);
    const bg = this.textureLoader.load("./environments/OC3WJK0.jpg");
    this.scene.background = bg;
  }
  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0x333333, 3);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  async #initObjects() {
    // ground
    // ground textures
    const groundBaseColorTexture = this.textureLoader.load(
      "./models/Poliigon_ConcreteFloorPoured_7656/Poliigon_ConcreteFloorPoured_7656_BaseColor.jpg",
    );
    const groundNormalMapTexture = this.textureLoader.load(
      "./models/Poliigon_ConcreteFloorPoured_7656/Poliigon_ConcreteFloorPoured_7656_Normal.png",
    );
    const groundRoughnessTexture = this.textureLoader.load(
      "./models/Poliigon_ConcreteFloorPoured_7656/Poliigon_ConcreteFloorPoured_7656_Roughness.jpg",
    );
    const groundMetallicTexture = this.textureLoader.load(
      "./models/Poliigon_ConcreteFloorPoured_7656/Poliigon_ConcreteFloorPoured_7656_Metallic.jpg",
    );
    const groundAmbientOcclusionTexture = this.textureLoader.load(
      "./models/Poliigon_ConcreteFloorPoured_7656/Poliigon_ConcreteFloorPoured_7656_AmbientOcclusion.jpg",
    );

    const groundGeometry = new THREE.CircleGeometry(5);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundBaseColorTexture,
      normalMap: groundNormalMapTexture,
      roughnessMap: groundRoughnessTexture,
      metalnessMap: groundMetallicTexture,
      aoMap: groundAmbientOcclusionTexture,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotateX(Math.PI / 2);
    this.groundMesh = groundMesh;
    groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // hdr texture
    const hdrTexture1 = await this.hdrTextureLoader.loadAsync(
      "./environments/MR_INT-001_NaturalStudio_NAD.hdr",
    );

    hdrTexture1.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = hdrTexture1;

    // car
    const cars = [
      "2021_lamborghini_countach_lpi_800-4",
      "Jiotto_Caspita_F1",
      "mclaren_f1_1993",
      "1975_porsche_911_930_turbo",
    ];
    this.car = await this.gltfLoader.loadAsync(
      `./models/${cars[3]}/scene.gltf`,
    );

    this.scene.add(this.car.scene);
    // this.car.scene.position.y = 1;
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
