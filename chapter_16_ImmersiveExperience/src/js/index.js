import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

class World {
  // constructor
  constructor() {
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();

    this.loadingManager = this.#initLoadingManager();
    this.controls = this.#initControl();
    this.gltfLoader = this.#initGltfLoader();
    this.hdrTextureLoader = this.#hdrTextureLoader();

    this.#initLights();
    this.#initBackground();
    this.#initObjects();

    this.#ImmersiveViewer();

    this.clock = new THREE.Clock();
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
    camera.position.set(0, 0, 14);
    // camera.lookAt(0, 0, 0);
    return camera;
  }

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
    loadingManager.onLoad = (url, loaded, itemsTotal) => {
      console.log(`All resources have loaded.`);
      progressBarContainer.style.display = "none";
    };

    return loadingManager;
  }

  // Orbit Control
  #initControl() {
    // Orbit Control
    // const controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.minDistance = 3;
    // controls.maxDistance = 20;
    // controls.maxPolarAngle = Math.PI / 2.1;
    // controls.update();

    // First Person Control
    const controls = new FirstPersonControls(
      this.camera,
      this.renderer.domElement,
    );
    controls.activeLook = false;
    controls.movementSpeed = 8;
    controls.lookSpeed = 0.08;
    controls.lookVertical = false;

    return controls;
  }

  // Gltf Loader
  #initGltfLoader() {
    const gltfLoader = new GLTFLoader(this.loadingManager);
    return gltfLoader;
  }

  // hdr loader
  #hdrTextureLoader() {
    const hdrTextureLoader = new HDRLoader(this.loadingManager);
    return hdrTextureLoader;
  }

  // Background
  #initBackground() {
    this.scene.background = new THREE.Color(0xededed);
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
    // City
    // this.city = await this.gltfLoader.loadAsync("./models/city/scene.gltf");
    // this.scene.add(this.city.scene);

    // The Kings Hall
    this.the_king_s_hall = await this.gltfLoader.loadAsync(
      "./models/the_king_s_hall/scene.gltf",
    );
    this.scene.add(this.the_king_s_hall.scene);
  }

  #ImmersiveViewer() {
    window.addEventListener("keydown", (e) => {
      this.controls.enabled = false;
      // console.log("Key: ", e.key.toLowerCase());

      const moveCamera = ({ position, rotation, posDuration, rotDuration }) => {
        gsap.to(this.camera.position, {
          x: position?.x,
          y: position?.y,
          z: position?.z,
          duration: posDuration,
          ease: "ease",
        });
        gsap.to(this.camera.rotation, {
          x: rotation?.x,
          y: rotation?.y,
          z: rotation?.z,
          duration: rotDuration,
          ease: "ease",
        });
      };

      switch (e.key.toLowerCase()) {
        case "1": {
          moveCamera({
            position: {
              x: -0.56,
              y: 1.04,
              z: 13.27,
            },
            rotation: {
              x: -0,
              y: 1.54,
              z: -0,
            },
            posDuration: 2.6,
            rotDuration: 3.2,
          });
          break;
        }
        case "2": {
          moveCamera({
            position: {
              x: -1.95,
              y: 1.47,
              z: 5.51,
            },
            rotation: {
              x: -0,
              y: 0.03,
              z: -0,
            },
            posDuration: 2.6,
            rotDuration: 3.2,
          });
          break;
        }
        case "3": {
          moveCamera({
            position: {
              x: 2.8,
              y: 0,
              z: 3.6,
            },
            rotation: {
              x: 0,
              y: -2,
              z: 0,
            },
            posDuration: 2.6,
            rotDuration: 3.2,
          });
          break;
        }
        case "4": {
          moveCamera({
            position: {
              x: 2.5,
              y: -0.9,
              z: 12.2,
            },
            rotation: {
              x: 0.9,
              y: 0.6,
              z: -0.6,
            },
            posDuration: 2.6,
            rotDuration: 3.2,
          });
          break;
        }
        case "5": {
          moveCamera({
            position: {
              x: 2.7,
              y: 0.6,
              z: 3.7,
            },
            rotation: {
              x: 0.6,
              y: 1.9,
              z: -0.6,
            },
            posDuration: 2.6,
            rotDuration: 3.2,
          });
          break;
        }
        case "6": {
          moveCamera({
            position: {
              x: -1.7,
              y: 0,
              z: 8.7,
            },
            rotation: {
              x: 0,
              y: 4.7,
              z: 0,
            },
            posDuration: 2.6,
            rotDuration: 3.2,
          });
          break;
        }
        case "7": {
          moveCamera({
            position: {
              x: 0.5,
              y: 0.8,
              z: 10,
            },
            rotation: {
              x: 0.3,
              y: 1.65,
              z: -0.3,
            },
            posDuration: 2.6,
            rotDuration: 3.2,
          });
          break;
        }
        case "g": {
          console.log("Location: ", this.camera.position.clone());
          console.log("Rotation: ", this.camera.rotation.clone());
          break;
        }
      }
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      this.controls.update(this.clock.getDelta());
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
