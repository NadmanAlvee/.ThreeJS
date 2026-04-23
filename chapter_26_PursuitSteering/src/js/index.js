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

    // this.controls = this.#initControl();
    this.gltfLoader = this.#initGltfLoader();
    this.hdrTextureLoader = this.#hdrTextureLoader();

    this.#initLights();
    this.#initBackground();

    this.entityManager = this.#yukaEntityManager();
    this.syncFunction = this.#yukaSyncFunction();

    this.#initObjects();

    this.#initRepositionOnClick();

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
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  // Orbit Control
  // #initControl() {
  //   // Orbit Control
  //   const controls = new OrbitControls(this.camera, this.renderer.domElement);
  //   controls.update();

  //   return controls;
  // }

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
    this.scene.background = new THREE.Color(0x202020);
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
    // plane
    const planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 40, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
    );
    this.planeMesh = planeMesh;
    this.scene.add(this.planeMesh);

    // evader static mesh
    const evaderGeo = new THREE.SphereGeometry(1);
    const evaderMat = new THREE.MeshNormalMaterial();
    const evaderMesh = new THREE.Mesh(evaderGeo, evaderMat);
    this.scene.add(evaderMesh);
    this.evaderMesh = evaderMesh;
    evaderMesh.matrixAutoUpdate = false;

    // evader yuka body
    const evaderVehicle = new YUKA.Vehicle();
    evaderVehicle.setRenderComponent(evaderMesh, this.syncFunction);
    this.evaderVehicle = evaderVehicle;
    this.entityManager.add(this.evaderVehicle);
    evaderVehicle.maxSpeed = 2;

    // parsuer static mesh
    const parsuerGeo = new THREE.ConeGeometry(0.5, 2.5, 8);
    parsuerGeo.rotateX(Math.PI * 0.5);
    const parsuerMat = new THREE.MeshNormalMaterial();
    const parsuerMesh = new THREE.Mesh(parsuerGeo, parsuerMat);
    this.scene.add(parsuerMesh);
    parsuerMesh.matrixAutoUpdate = false;

    // parsuer yuka body
    const parsuerVehicle = new YUKA.Vehicle();
    parsuerVehicle.setRenderComponent(parsuerMesh, this.syncFunction);
    this.entityManager.add(parsuerVehicle);
    parsuerVehicle.maxSpeed = 2;

    // behaviors
    parsuerVehicle.steering.add(
      new YUKA.PursuitBehavior(this.evaderVehicle, 5),
    );
  }

  #initRepositionOnClick() {
    const mouse = {};
    const rayCaster = new THREE.Raycaster();
    let intersectionPoint = {};

    window.addEventListener("mousemove", (e) => {
      console.log(
        "Prev Posi: ",
        this.evaderMesh.position.x,
        " ",
        this.evaderMesh.position.y,
      );

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      rayCaster.setFromCamera(mouse, this.camera);
      const intersects = rayCaster.intersectObject(this.planeMesh);
      if (intersects.length > 0) {
        this.evaderVehicle.position.x = intersects[0].point.x;
        this.evaderVehicle.position.y = intersects[0].point.y;
      }

      console.log("New Posi: ", this.evaderVehicle.position);
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      // yuka animation
      const deltaTime = this.yukaTime.update().getDelta();
      this.entityManager.update(deltaTime);

      // evader movement
      const elapsed = this.yukaTime.getElapsed();
      this.evaderVehicle.position.x =
        Math.cos(elapsed) * Math.sin(elapsed * 0.2) * 6;
      this.evaderVehicle.position.y = Math.sin(elapsed * 0.8) * 6;

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
