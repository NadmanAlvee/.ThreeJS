import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

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
    // this.#initLights();
    this.#initBackground();

    this.mixer = null;
    this.dnaModel = null;
    await this.#initObjects();

    this.#createBloomEffect();

    this.clock = new THREE.Timer();

    this.#initAnimationLoop();
    this.#initResize();
  }

  // Render
  #initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.enabled = true;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 2, 8);
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
    this.scene.background = new THREE.Color(0x000000);
  }

  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#dddddd", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  async #initObjects() {
    const gltf = await this.gltfLoader.loadAsync(
      "./models/ethereal_polynucleotide/scene.gltf",
    );
    this.dnaModel = gltf.scene;
    this.dnaModel.scale.set(0.5, 0.5, 0.5);
    this.dnaModel.position.y = -3;
    const clips = gltf.animations;
    this.mixer = new THREE.AnimationMixer(this.dnaModel);
    const action = this.mixer.clipAction(clips[0]);
    action.play();

    this.scene.add(gltf.scene);
  }

  #createBloomEffect() {
    this.composer = new EffectComposer(this.renderer);

    // pass 1
    const renderScene = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderScene);

    // pass 2
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.1,
      0.5,
      0.1,
    );
    this.composer.addPass(bloomPass);
    // bloomPass.strength = 0.2;
    // bloomPass.radius = 1;
    // bloomPass.threshold = 1;

    // ddebug
    // this.renderer.toneMapping = THREE.CineonToneMapping;
    // this.renderer.toneMapping = THREE.CustomToneMapping;
    // this.renderer.toneMapping = THREE.LinearToneMapping;
    // this.renderer.toneMapping = THREE.NeutralToneMapping;
    // this.renderer.toneMapping = THREE.ReinhardToneMapping;
    // this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // this.renderer.toneMappingExposure = 4;
  }

  #initAnimationLoop() {
    const animate = (time) => {
      this.controls.update();
      this.clock.update(time);

      this.mixer?.update(this.clock.getDelta());

      this.composer.render();
      requestAnimationFrame(animate);
    };
    animate(performance.now());
  }

  // Animate Scene
  // #initAnimationLoop() {
  //   this.renderer.setAnimationLoop((time) => {
  //     // animation mixer
  //     this.clock.update(time);
  //     this.mixer?.update(this.clock.getDelta());

  //     this.controls.update();
  //     this.renderer.render(this.scene, this.camera);
  //   });
  // }

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
