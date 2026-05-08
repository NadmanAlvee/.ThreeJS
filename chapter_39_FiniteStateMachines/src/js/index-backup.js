// obrit control will break if the character moves

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
    this.textureLoader = this.#initTextureLoader();
    this.hdrTextureLoader = this.#initHdrTextureLoader();

    this.#init();
  }

  async #init() {
    this.#initLights();
    this.#initBackground();

    this.mixers = [];
    await this.#initObjects();

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
    camera.position.set(3, 3, 3);
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

  // texture Loader
  #initTextureLoader() {
    const textureLoader = new THREE.TextureLoader();
    return textureLoader;
  }

  // hdr loader
  #initHdrTextureLoader() {
    const hdrTextureLoader = new HDRLoader();
    return hdrTextureLoader;
  }

  // Background
  #initBackground() {
    this.scene.background = new THREE.Color(0x141414);
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
    // human 1
    this.gltfLoader.load("./models/Spacesuit.gltf", (gltf) => {
      const model = gltf.scene;
      this.scene.add(model);
      model.add(this.camera);
      const target = new THREE.Vector3();
      target.copy(model.position);
      target.y += 1;
      this.controls.target.copy(target);
      this.controls.update();

      const animations = gltf.animations;
      console.log(animations);

      const mixer = new THREE.AnimationMixer(model);
      this.mixers.push(mixer);

      const walkClip = THREE.AnimationClip.findByName(animations, "Walk");
      this.walkAction = mixer.clipAction(walkClip);
      this.walkAction.play();

      const runClip = THREE.AnimationClip.findByName(animations, "Run");
      this.runAction = mixer.clipAction(runClip);
      // this.runAction.play();

      // animations fade in fade out
      window.addEventListener("mousedown", (e) => {
        // this.walkAction.stop();
        // this.runAction.play();

        this.runAction.reset();
        this.runAction.play();
        this.walkAction.fadeOut(1);
        this.runAction.fadeIn(1);
      });

      window.addEventListener("mouseup", (e) => {
        // this.runAction.stop();
        // this.walkAction.play();

        this.walkAction.reset();
        this.walkAction.play();
        this.runAction.fadeOut(1);
        this.walkAction.fadeIn(1);
      });
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    let counter = 0;
    this.renderer.setAnimationLoop((time) => {
      const delta = this.clock.getDelta();
      this.clock.update(time);

      if (this.mixers.length > 0) {
        this.mixers.forEach((mixer) => {
          mixer.update(delta);

          // temp
          counter += 0.02;
          if (counter >= 0) {
            // this.runAction.reset();
            this.runAction.play();
            this.walkAction.fadeOut(1);
            this.runAction.fadeIn(1);
          }

          if (counter >= 3 && counter < 6) {
            this.walkAction.reset();
            this.walkAction.play();
            this.runAction.fadeOut(1);
            this.walkAction.fadeIn(1);
          }
          if (counter >= 6) {
            counter = 0;
          }
        });
      }

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
