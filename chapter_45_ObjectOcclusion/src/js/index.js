import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

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

    this.model = null;
    await this.#initObjects();

    this.time = new THREE.Timer();
    this.#initAnimationLoop();
    this.#initResize();
  }

  // Render
  #initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    camera.position.set(30, 10, 10);
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
    this.scene.add(new THREE.GridHelper(30));

    // 3 mesh example
    // const geo3 = new THREE.TorusGeometry(1.5, 0.4, 16, 60);
    // const mat3 = new THREE.MeshStandardMaterial({ color: 0x51a2ff });
    // const torus1 = new THREE.Mesh(geo3, mat3);
    // this.scene.add(torus1);
    // torus1.position.z = -5;
    // const geo2 = new THREE.BoxGeometry(5, 5, 1);
    // const mat2 = new THREE.MeshStandardMaterial({ color: 0x2aa63e });
    // const box2 = new THREE.Mesh(geo2, mat2);
    // this.scene.add(box2);
    // box2.position.z = 0;
    // const geo1 = new THREE.BoxGeometry(9, 9, 1);
    // const mat1 = new THREE.MeshStandardMaterial({ color: 0xf54927 });
    // const box1 = new THREE.Mesh(geo1, mat1);
    // this.scene.add(box1);
    // box1.position.z = 5;
    // // Object Occlusion
    // // torus1.material.colorWrite = false;
    // box2.material.colorWrite = false;
    // torus1.renderOrder = 2;
    // box1.renderOrder = 1;
    // box2.renderOrder = 0;

    // doors
    this.gltfLoader.load("./models/bathroom_door_frame.glb", (glb) => {
      const model = glb.scene;
      const door1 = SkeletonUtils.clone(model);
      const door2 = SkeletonUtils.clone(model);

      door1.scale.set(0.008, 0.008, 0.008);
      door1.rotateY(Math.PI / 2);
      door1.position.z = 10;

      door2.scale.set(0.008, 0.008, 0.008);
      door2.rotateY(Math.PI / 2);
      door2.position.z = -7;

      this.scene.add(door1);
      this.scene.add(door2);

      // cubes
      const geo2 = new THREE.BoxGeometry(3, 6, 8);
      const mat2 = new THREE.MeshStandardMaterial({ color: 0x2aa63e });

      const box2 = new THREE.Mesh(geo2, mat2);
      this.scene.add(box2);
      box2.position.y = 3;
      box2.position.z = 14;

      const box3 = new THREE.Mesh(geo2, mat2);
      this.scene.add(box3);
      box3.position.y = 3;
      box3.position.z = -11;

      // render order configs
      mat2.colorWrite = false;
      box2.renderOrder = 0;
      box3.renderOrder = 0;

      // entities
      this.gltfLoader.load("./models/Donkey.gltf", (gltf) => {
        const model = gltf.scene;
        this.model = model;
        this.scene.add(this.model);
        model.position.z = -12;

        const animations = gltf.animations;
        const walkClip = THREE.AnimationClip.findByName(animations, "Walk");

        this.mixer = new THREE.AnimationMixer(this.model);
        const walkAction = this.mixer.clipAction(walkClip);
        walkAction.play();

        model.renderOrder = 1;
      });
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      const delta = this.time.update(time).getDelta();
      this.mixer?.update(delta);

      // console.log(this.model);
      if (this.model) {
        this.model.position.z += 0.0278;
        if (this.model.position.z > 12) {
          this.model.position.z = -12;
        }
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
