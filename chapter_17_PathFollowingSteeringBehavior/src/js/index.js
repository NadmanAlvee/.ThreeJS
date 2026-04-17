import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

import * as YUKA from "yuka";

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

    this.vehicleMesh = null;
    this.vehicle = null;
    this.syncFunction = null;
    this.#initObjects();

    this.path = this.#initPath();
    this.#displayPath();
    this.#makeVehicleFollowPath();

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
    camera.position.set(0, 15, 0);
    return camera;
  }

  // Orbit Control
  #initControl() {
    // Orbit Control
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();

    // First Person Control
    // const controls = new FirstPersonControls(
    //   this.camera,
    //   this.renderer.domElement,
    // );
    // controls.activeLook = false;
    // controls.movementSpeed = 8;
    // controls.lookSpeed = 0.08;
    // controls.lookVertical = false;

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

  // Initiate Objects
  #initObjects() {
    // entity vehicle cone
    const vehicleGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
    vehicleGeometry.rotateX(Math.PI * 0.5);
    this.vehicleMesh = new THREE.Mesh(
      vehicleGeometry,
      new THREE.MeshNormalMaterial(),
    );
    this.vehicleMesh.matrixAutoUpdate = false;
    this.scene.add(this.vehicleMesh);

    // yuka body and sync fucntion
    this.syncFunction = (entity, renderComponent) => {
      renderComponent.matrix.copy(entity.worldMatrix);
    };

    this.vehicle = new YUKA.Vehicle();
    this.vehicle.setRenderComponent(this.vehicleMesh, this.syncFunction);

    this.entityManager.add(this.vehicle);
  }

  // yuka path
  #initPath() {
    const path = new YUKA.Path();
    path.add(new YUKA.Vector3(-4, 0, 4));
    path.add(new YUKA.Vector3(-6, 0, 0));
    path.add(new YUKA.Vector3(-4, 0, -4));
    path.add(new YUKA.Vector3(0, 0, 0));
    path.add(new YUKA.Vector3(4, 0, -4));
    path.add(new YUKA.Vector3(6, 0, 0));
    path.add(new YUKA.Vector3(4, 0, 4));
    path.add(new YUKA.Vector3(0, 0, 6));

    return path;
  }

  #displayPath() {
    const positions = [];

    for (let i = 0; i < this.path._waypoints.length; i++) {
      positions.push(this.path._waypoints[i].clone());
    }
    console.log(positions);

    const geometry = new THREE.BufferGeometry().setFromPoints(positions);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
    this.scene.add(line);
  }

  #makeVehicleFollowPath() {
    this.vehicle.position.copy(this.path.current());

    const followPath = new YUKA.FollowPathBehavior(this.path, 0.2);
    this.vehicle.steering.add(followPath);
  }

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
