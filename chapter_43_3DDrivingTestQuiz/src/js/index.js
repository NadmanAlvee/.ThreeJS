import * as THREE from "three";
import * as YUKA from "yuka";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import gsap from "gsap";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import {
  YELLOWVEHICLESPATHS,
  REDVEHICLESPATHS,
  BLUEVEHICLESPATHS,
} from "./constants.js";

class World {
  // constructor
  constructor() {
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();
    // this.controls = this.#initControl();

    this.loadingManager = this.#initLoadingManager();
    this.gltfLoader = this.#initGltfLoader();
    this.#initDracoLoader();
    this.hdrTextureLoader = this.#hdrTextureLoader();

    this.#init();
  }

  async #init() {
    this.#initLights();
    this.#initBackground();

    // yuka
    this.entityManager = this.#initEntityManager();
    this.syncFunction = (entity, renderComponent) => {
      renderComponent.matrix.copy(entity.worldMatrix);
    };

    await this.#initObjects();

    this.startBtn = null;
    this.title = null;

    this.#startQuiz();

    this.time = new YUKA.Time();
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
    camera.position.set(3, 10, 218);
    camera.lookAt(this.scene.position);

    this.scene.add(camera);
    return camera;
  }

  // Orbit Control
  #initControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();

    return controls;
  }

  // loading manager
  #initLoadingManager() {
    const loadingManager = new THREE.LoadingManager();

    const progressBar = document.getElementById("progress-bar");
    const progressBarContainer = document.querySelector(
      ".progress-bar-container",
    );

    loadingManager.onProgress = (url, loaded, itemsTotal) => {
      console.log(`Loading ${loaded} of ${itemsTotal} resources. ${url}`);
      progressBar.value = Math.abs((loaded / itemsTotal) * 100);
    };

    loadingManager.onError = (url) => {
      console.log(`An error occured while loading! ${url}`);
    };

    loadingManager.onLoad = () => {
      console.log(`All resources have loaded.`);
      progressBarContainer.style.display = "none";
    };

    return loadingManager;
  }

  // Gltf Loader
  #initGltfLoader() {
    const gltfLoader = new GLTFLoader(this.loadingManager);
    return gltfLoader;
  }

  // Draco setup
  #initDracoLoader() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  // hdr loader
  #hdrTextureLoader() {
    const hdrTextureLoader = new HDRLoader();
    return hdrTextureLoader;
  }

  // Background
  #initBackground() {
    this.scene.background = new THREE.Color(0x94dffb);
  }

  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x94d8fb, 0x9cff2e, 0.6);
    this.scene.add(hemisphereLight);
  }

  // entity manager
  #initEntityManager() {
    const entityManager = new YUKA.EntityManager();
    return entityManager;
  }

  // create car function
  #createCarV(model, path, yRotation) {
    const group = new THREE.Group();
    this.scene.add(group);
    group.matrixAutoUpdate = false;

    const car = SkeletonUtils.clone(model);
    group.add(car);

    const v = new YUKA.Vehicle();
    v.setRenderComponent(group, this.syncFunction);
    this.entityManager.add(v);

    const followPathBehavior = new YUKA.FollowPathBehavior(path, 2);
    // path tolerance
    const onPathBehavior = new YUKA.OnPathBehavior(path);
    onPathBehavior.radius = 0.2;

    v.position.copy(path.current());
    v.maxSpeed = 5;
    v.steering.add(followPathBehavior);
    v.steering.add(onPathBehavior);

    followPathBehavior.active = false;

    // rotates the vehicle in y axis
    v.rotation.fromEuler(0, yRotation, 0);

    const vehicleAll = { vehicle: v, modelGroup: car };
    return vehicleAll;
  }

  // Initiate Objects
  async #initObjects() {
    // terrain model
    this.gltfLoader.load("./static/terrain.glb", (glb) => {
      const model = glb.scene;
      this.scene.add(model);
    });

    // yellow cars
    this.gltfLoader.load("./static/SUV.glb", (glb) => {
      const model = glb.scene;
      const v1 = this.#createCarV(model, YELLOWVEHICLESPATHS[0], Math.PI);
      const v2 = this.#createCarV(model, YELLOWVEHICLESPATHS[1], Math.PI);
      const v3 = this.#createCarV(model, YELLOWVEHICLESPATHS[2], Math.PI / 2);
      const v4 = this.#createCarV(model, YELLOWVEHICLESPATHS[3], Math.PI);
      const v5 = this.#createCarV(model, YELLOWVEHICLESPATHS[4], Math.PI / 2);
      const v6 = this.#createCarV(model, YELLOWVEHICLESPATHS[5], Math.PI);
      const v7 = this.#createCarV(model, YELLOWVEHICLESPATHS[6], Math.PI / 2);
    });

    // red cars
    this.gltfLoader.load("./static/red.glb", (glb) => {
      const model = glb.scene;
      const v1 = this.#createCarV(model, REDVEHICLESPATHS[0], 0);
      const v2 = this.#createCarV(model, REDVEHICLESPATHS[1], 0);
      const v3 = this.#createCarV(model, REDVEHICLESPATHS[2], -Math.PI / 2);
      const v4 = this.#createCarV(model, REDVEHICLESPATHS[3], 0);
      const v5 = this.#createCarV(model, REDVEHICLESPATHS[4], Math.PI / 2);
      const v6 = this.#createCarV(model, REDVEHICLESPATHS[5], 0);
      const v7 = this.#createCarV(model, REDVEHICLESPATHS[6], Math.PI / 2);
    });

    // blue cars
    this.gltfLoader.load("./static/blue.glb", (glb) => {
      const model = glb.scene;
      const v1 = this.#createCarV(model, BLUEVEHICLESPATHS[0], Math.PI / 2);
      const v2 = this.#createCarV(model, BLUEVEHICLESPATHS[1], Math.PI / 2);
      const v3 = this.#createCarV(model, BLUEVEHICLESPATHS[2], 0);
      const v4 = this.#createCarV(model, BLUEVEHICLESPATHS[3], Math.PI / 2);
      const v7 = this.#createCarV(model, BLUEVEHICLESPATHS[4], Math.PI);
    });
  }

  #startQuiz() {
    this.startBtn = document.querySelector(".header button");
    this.title = document.querySelector(".header h1");

    this.startBtn.addEventListener("click", (e) => {
      const tl = gsap.timeline();

      tl.to(this.startBtn, {
        autoAlpha: 0,
        y: "-=20",
        duration: 0.5,
      })
        .to(
          this.title,
          {
            autoAlpha: 0,
            y: "-=20",
            duration: 1,
          },
          0, // gsap delay
        )
        .to(
          this.camera.position,
          {
            z: 144,
            duration: 4,
          },
          0,
        )
        .to(
          this.camera.rotation,
          {
            x: -0.4,
            duration: 4,
          },
          0,
        );
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      const delta = this.time.update().getDelta();
      this.entityManager.update(delta);

      // this.controls.update();
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
