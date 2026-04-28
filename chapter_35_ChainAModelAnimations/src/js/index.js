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

    this.controls = this.#initControl();
    this.gltfLoader = this.#initGltfLoader();
    this.hdrTextureLoader = this.#hdrTextureLoader();

    this.#init();
  }

  async #init() {
    this.#initLights();
    this.#initBackground();

    this.mixer = null;
    this.clock = new THREE.Timer();

    await this.#initObjects();

    this.#initAnimationLoop();
    this.#initResize();
  }

  // Render
  #initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.append(renderer.domElement);
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
    camera.position.set(5, 5, 7);
    return camera;
  }

  // Orbit Control
  #initControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
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
  #initBackground() {
    this.scene.background = new THREE.Color(0xededed);
  }
  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  async #initObjects() {
    // floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(5),
      new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide }),
    );
    floor.rotateX(Math.PI / 2);
    this.scene.add(floor);

    // deer
    this.deer = await this.gltfLoader.loadAsync(`./models/animals/Deer.gltf`);
    this.deer.scene.scale.set(0.5, 0.5, 0.5);
    this.deer.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    this.scene.add(this.deer.scene);

    this.clips = this.deer.animations;
    console.log(this.clips);

    this.mixer = new THREE.AnimationMixer(this.deer.scene);

    const idleAnimation = THREE.AnimationClip.findByName(this.clips, "Idle");
    const idleAction = this.mixer.clipAction(idleAnimation);
    idleAction.play();
    idleAction.loop = THREE.LoopOnce;

    const walkAnimation = THREE.AnimationClip.findByName(this.clips, "Idle_2");
    const walkAction = this.mixer.clipAction(walkAnimation);
    walkAction.loop = THREE.LoopOnce;

    this.mixer.addEventListener("finished", (e) => {
      if (e.action._clip.name === "Idle") {
        walkAction.reset();
        walkAction.play();
      }
      if (e.action._clip.name === "Idle_2") {
        idleAction.reset();
        idleAction.play();
      }
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      this.clock.update(time);
      const delta = this.clock.getDelta();
      this.mixer.update(delta);

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
