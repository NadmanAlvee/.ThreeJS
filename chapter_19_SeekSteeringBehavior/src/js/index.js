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

    this.#init();
  }

  async #init() {
    this.#initLights();
    this.#initBackground();

    this.entityManager = this.#yukaEntityManager();
    this.syncFunction = (entity, renderComponent) => {
      renderComponent.matrix.copy(entity.worldMatrix);
    };

    this.vehicleMesh = null;
    this.vehicle = null;
    this.#initObjects();
    this.target = null;
    this.#initTarget();
    this.#makeEntitySeekTarget();

    this.#initRayCasterAndPlane();

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
    camera.position.set(5, 5, 7);
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
    this.scene.background = new THREE.Color(0x979797);
  }
  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#dddddd", 2);
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

    this.vehicle = new YUKA.Vehicle();
    this.vehicle.setRenderComponent(this.vehicleMesh, this.syncFunction);

    this.entityManager.add(this.vehicle);
  }

  #initTarget() {
    const targetGeometry = new THREE.SphereGeometry(0.1);
    const targetMaterial = new THREE.MeshPhongMaterial({ color: 0xffea00 });
    const taregtMesh = new THREE.Mesh(targetGeometry, targetMaterial);
    this.target = taregtMesh;
    this.scene.add(taregtMesh);

    const target = new YUKA.GameEntity();
    target.setRenderComponent(taregtMesh, this.syncFunction);
    this.entityManager.add(target);
  }

  #initRayCasterAndPlane() {
    const mouse = new THREE.Vector2();
    const intersectionPoint = new THREE.Vector3();
    const planeNormal = new THREE.Vector3();
    const plane = new THREE.Plane();
    const rayCaster = new THREE.Raycaster();

    window.addEventListener("click", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      planeNormal.set(0, 1, 0);
      plane.setFromNormalAndCoplanarPoint(
        planeNormal,
        new THREE.Vector3(0, 0, 0),
      );

      rayCaster.setFromCamera(mouse, this.camera);
      rayCaster.ray.intersectPlane(plane, intersectionPoint);

      this.target.position.copy(intersectionPoint);
    });
  }

  #makeEntitySeekTarget() {
    const seekBehavior = new YUKA.SeekBehavior(this.target.position);
    this.vehicle.steering.add(seekBehavior);

    //temp
    this.vehicle.position.set(5, 5, -5);
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
