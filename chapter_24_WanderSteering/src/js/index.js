import * as THREE from "three";
import * as YUKA from "yuka";
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

    this.controls = this.#initControl();
    this.gltfLoader = this.#initGltfLoader();
    this.hdrTextureLoader = this.#hdrTextureLoader();

    this.#initLights();
    this.#initBackground();

    this.entityManager = this.#yukaEntityManager();
    this.syncFunction = this.#yukaSyncFunction();

    this.vehicle;
    this.#initObjects();
    // this.#initWanderBehavior();

    this.yukaTime = new YUKA.Time();
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
    renderer.shadowMap.type = THREE.PCFShadowMap;
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
    camera.position.set(0, 20, 0);
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
    this.scene.background = new THREE.Color(0x161616);
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

  #yukaEntityManager() {
    const entityManager = new YUKA.EntityManager();
    return entityManager;
  }

  #yukaSyncFunction() {
    return (entity, renderComponent) => {
      renderComponent.matrix.copy(entity.worldMatrix);
    };
  }

  // Initiate Objects
  #initObjects() {
    // vehicle
    const vehicleGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
    const vehicleMaterial = new THREE.MeshNormalMaterial();
    // const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
    // vehicleMesh.matrixAutoUpdate = false;
    vehicleGeometry.rotateX(Math.PI * 0.5);
    // this.scene.add(vehicleMesh);

    // yuka body
    // const vehicle = new YUKA.Vehicle();
    // this.vehicle = vehicle;
    // this.vehicle.setRenderComponent(vehicleMesh, this.syncFunction);
    // this.entityManager.add(this.vehicle);
    // this.vehicle.maxSpeed = 2;

    for (let i = 0; i < 50; i++) {
      const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
      vehicleMesh.matrixAutoUpdate = false;
      this.scene.add(vehicleMesh);

      const vehicle = new YUKA.Vehicle();
      vehicle.setRenderComponent(vehicleMesh, this.syncFunction);
      vehicle.maxSpeed = 2;
      vehicle.position.x = 2.5 - Math.random() * 5;
      vehicle.position.z = 2.5 - Math.random() * 5;
      vehicle.rotation.fromEuler(0, 2 * Math.PI * Math.random(), 0);
      this.entityManager.add(vehicle);

      const wanderBehavior = new YUKA.WanderBehavior();
      vehicle.steering.add(wanderBehavior);
    }
  }

  // #initWanderBehavior() {
  //   const wanderBehavior = new YUKA.WanderBehavior();
  //   this.vehicle.steering.add(wanderBehavior);
  // }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      // yuka animate
      const deltaTime = this.yukaTime.update().getDelta();
      this.entityManager.update(deltaTime);

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
