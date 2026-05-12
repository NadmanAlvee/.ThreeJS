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
    this.clicked = false;
    this.#processAnswer();

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

  // Initiate Objects
  async #initObjects() {
    // terrain model
    this.gltfLoader.load("./static/terrain.glb", (glb) => {
      const model = glb.scene;
      this.scene.add(model);
    });

    // create car function
    const createCarV = (model, path, yRotation) => {
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
    };

    // yellow cars
    this.gltfLoader.load("./static/SUV.glb", (glb) => {
      const model = glb.scene;
      const v1 = createCarV(model, YELLOWVEHICLESPATHS[0], Math.PI);
      const v2 = createCarV(model, YELLOWVEHICLESPATHS[1], Math.PI);
      const v3 = createCarV(model, YELLOWVEHICLESPATHS[2], Math.PI / 2);
      const v4 = createCarV(model, YELLOWVEHICLESPATHS[3], Math.PI);
      const v5 = createCarV(model, YELLOWVEHICLESPATHS[4], Math.PI / 2);
      const v6 = createCarV(model, YELLOWVEHICLESPATHS[5], Math.PI);
      const v7 = createCarV(model, YELLOWVEHICLESPATHS[6], Math.PI / 2);
    });

    // red cars
    this.gltfLoader.load("./static/red.glb", (glb) => {
      const model = glb.scene;
      const v1 = createCarV(model, REDVEHICLESPATHS[0], 0);
      const v2 = createCarV(model, REDVEHICLESPATHS[1], 0);
      const v3 = createCarV(model, REDVEHICLESPATHS[2], -Math.PI / 2);
      const v4 = createCarV(model, REDVEHICLESPATHS[3], 0);
      const v5 = createCarV(model, REDVEHICLESPATHS[4], Math.PI / 2);
      const v6 = createCarV(model, REDVEHICLESPATHS[5], 0);
      const v7 = createCarV(model, REDVEHICLESPATHS[6], Math.PI / 2);
    });

    // blue cars
    this.gltfLoader.load("./static/blue.glb", (glb) => {
      const model = glb.scene;
      const v1 = createCarV(model, BLUEVEHICLESPATHS[0], Math.PI / 2);
      const v2 = createCarV(model, BLUEVEHICLESPATHS[1], Math.PI / 2);
      const v3 = createCarV(model, BLUEVEHICLESPATHS[2], 0);
      const v4 = createCarV(model, BLUEVEHICLESPATHS[3], Math.PI / 2);
      const v7 = createCarV(model, BLUEVEHICLESPATHS[4], Math.PI);
    });

    // create arrow function
    const createArrow = (arrowModel, position, yRotation = 0) => {
      const arrow = SkeletonUtils.clone(arrowModel);
      arrow.position.copy(position);
      arrow.rotation.y = yRotation;

      this.scene.add(arrow);
    };

    // Arrows
    this.gltfLoader.load("./static/arrow.glb", (glb) => {
      const model = glb.scene;

      //Arrows for yelow cars
      createArrow(model, new THREE.Vector3(5.91, 2, 125.92), Math.PI);
      createArrow(model, new THREE.Vector3(6.21, 2, 30.19), 0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(93.03, 2, 24.5), Math.PI);
      createArrow(model, new THREE.Vector3(102.5, 2, -66), -0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(11.86, 2, -75.86), Math.PI);
      createArrow(model, new THREE.Vector3(5.97, 2, -161.04), -0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(-82.82, 2, -171.17), -Math.PI / 2);

      //Arrows for red cars
      createArrow(model, new THREE.Vector3(1.38, 2, 109.32), 0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(1.13, 2, 14.01), 0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(107.5, 2, 20.33), Math.PI);
      createArrow(model, new THREE.Vector3(97.45, 2, -81.35));
      createArrow(model, new THREE.Vector3(-3.55, 2, -71.24), Math.PI);
      createArrow(model, new THREE.Vector3(1.45, 2, -175.84), -0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(-98.74, 2, -166.74), Math.PI / 2);

      //Arrows for blue cars
      createArrow(model, new THREE.Vector3(-3.55, 2, 119.5), 0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(-4.08, 2, 24.64), 0.5 * Math.PI);
      createArrow(model, new THREE.Vector3(98.08, 2, 14.95));
      createArrow(model, new THREE.Vector3(93.599, 2, -70.83), Math.PI);
      createArrow(model, new THREE.Vector3(-88.88, 2, -160.78), Math.PI);
    });
  }

  #startQuiz() {
    this.startBtn = document.querySelector(".header button");
    this.title = document.querySelector(".header h1");

    this.questions = document.querySelector(".questions p");
    this.explanation = document.querySelector(".explanation");
    this.nextQuestionsBtn = document.querySelector(".explanation button");

    this.option1 = document.getElementById("option1");
    this.option2 = document.getElementById("option2");
    this.option3 = document.getElementById("option3");

    this.startBtn.addEventListener("click", (e) => {
      const tl = gsap.timeline();

      // 1. Hide HUD 2. Show Ques 3. Show Options
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
        )
        .to(
          this.questions,
          {
            // question fade in animation
            autoAlpha: 1,
            duration: 0.2,
          },
          "+=0.7",
        )
        .to(
          this.option1,
          {
            // options fade in animation
            rotateX: 0,
            duration: 0.2,
          },
          "+=2.5",
        )
        .to(
          this.option2,
          {
            rotateX: 0,
            duration: 0.2,
          },
          "+=0.5",
        )
        .to(
          this.option3,
          {
            rotateX: 0,
            duration: 0.2,
          },
          "+=0.5",
        );
    });
  }

  #processAnswer() {
    this.option1Symbol = document.getElementById("a1-symbol");
    this.option2Symbol = document.getElementById("a2-symbol");
    this.option3Symbol = document.getElementById("a3-symbol");

    const showAnswerSymbol = (opt1, opt2, opt3) => {
      this.option1Symbol.style.backgroundImage = `url('./static/symbols/${opt1}.png')`;
      this.option2Symbol.style.backgroundImage = `url('./static/symbols/${opt2}.png')`;
      this.option3Symbol.style.backgroundImage = `url('./static/symbols/${opt3}.png')`;
    };

    const chooseAnswer = (option) => {
      if (!this.clicked) {
        showAnswerSymbol("correct", "incorrect", "incorrect");
        option.style.backgroundColor = "white";
        option.style.color = "black";
        gsap.to(this.explanation, {
          autoAlpha: 1,
          y: "-=10",
          duration: 0.5,
        });
        this.clicked = true;
      }
    };

    this.option1.addEventListener(
      "click",
      chooseAnswer.bind(null, this.option1),
    );
    this.option2.addEventListener(
      "click",
      chooseAnswer.bind(null, this.option2),
    );
    this.option3.addEventListener(
      "click",
      chooseAnswer.bind(null, this.option3),
    );
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
