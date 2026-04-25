import * as THREE from "three";
import * as YUKA from "yuka";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
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

    this.init();
  }

  async init() {
    this.#initLights();
    this.#initBackground();

    this.entityManager = this.#yukaEntityManager();
    this.syncFunction = this.#yukaSyncFunction();

    this.#initObjects();

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
    camera.position.set(0, 30, 0);
    camera.lookAt(0, 0, 0);
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
    const ambientLight = new THREE.AmbientLight(0x333333, 2);
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
    // evader static mesh
    const evaderGeo = new THREE.SphereGeometry(0.5);
    const evaderMat = new THREE.MeshNormalMaterial();
    const evaderMesh = new THREE.Mesh(evaderGeo, evaderMat);
    // this.scene.add(evaderMesh);
    this.evaderMesh = evaderMesh;
    evaderMesh.matrixAutoUpdate = false;

    // evader yuka body
    const evaderVehicle = new YUKA.Vehicle();
    evaderVehicle.setRenderComponent(evaderMesh, this.syncFunction);
    this.evaderVehicle = evaderVehicle;
    this.entityManager.add(this.evaderVehicle);
    evaderVehicle.position.x = 10;
    // evaderVehicle.maxSpeed = 2;

    // leader static mesh
    const leaderGeo = new THREE.SphereGeometry(0.4);
    leaderGeo.rotateX(Math.PI * 0.5);
    const leaderMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const leaderMesh = new THREE.Mesh(leaderGeo, leaderMat);
    // const offsets = [new YUKA.Vector3(1, 0, -1), new YUKA.Vector3(-1, 0, -1)];

    // array of army (followers)
    const follower1Clone = leaderMesh.clone();
    this.follower1Clone = follower1Clone;
    this.scene.add(this.follower1Clone);
    this.follower1Clone.matrixAutoUpdate = false;

    const follower1Vehicle = new YUKA.Vehicle();
    follower1Vehicle.setRenderComponent(this.follower1Clone, this.syncFunction);
    this.entityManager.add(follower1Vehicle);
    follower1Vehicle.maxSpeed = 10;
    follower1Vehicle.steering.add(
      new YUKA.OffsetPursuitBehavior(
        this.evaderVehicle,
        new YUKA.Vector3(1, 0, -1),
      ),
    );
    const follower2Clone = leaderMesh.clone();
    this.follower2Clone = follower2Clone;
    this.scene.add(this.follower2Clone);
    this.follower2Clone.matrixAutoUpdate = false;

    const follower2Vehicle = new YUKA.Vehicle();
    follower2Vehicle.setRenderComponent(this.follower2Clone, this.syncFunction);
    this.entityManager.add(follower2Vehicle);
    follower2Vehicle.maxSpeed = 10;
    follower2Vehicle.steering.add(
      new YUKA.OffsetPursuitBehavior(
        this.evaderVehicle,
        new YUKA.Vector3(-1, 0, -1),
      ),
    );

    this.follower1Vehicle = follower1Vehicle;
    this.follower2Vehicle = follower2Vehicle;

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial();
    const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
    this.lineMesh = lineMesh;
    this.scene.add(this.lineMesh);

    // interpose parsuer
    const parsuerGeo = new THREE.ConeGeometry(0.3, 1, 8);
    parsuerGeo.rotateX(Math.PI * 0.5);
    const parsuerMat = new THREE.MeshNormalMaterial();
    const parsuerMesh = new THREE.Mesh(parsuerGeo, parsuerMat);
    this.scene.add(parsuerMesh);
    parsuerMesh.matrixAutoUpdate = false;

    const parsuerVehicle = new YUKA.Vehicle();
    parsuerVehicle.setRenderComponent(parsuerMesh, this.syncFunction);
    this.entityManager.add(parsuerVehicle);
    parsuerVehicle.maxSpeed = 100;

    const interposeBehavior = new YUKA.InterposeBehavior(
      follower1Vehicle,
      follower2Vehicle,
    );
    parsuerVehicle.steering.add(interposeBehavior);
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      // yuka animate
      const deltaTime = this.yukaTime.update().getDelta();
      this.entityManager.update(deltaTime);

      // evader movement
      const elapsed = this.yukaTime.getElapsed();
      this.evaderVehicle.position.x =
        Math.cos(elapsed) * Math.sin(elapsed * 0.2) * 6;
      this.evaderVehicle.position.z = Math.sin(elapsed * 0.8) * 6;

      // drawing line
      const positionAttribute = this.lineMesh.geometry.attributes.position;

      const position = this.follower1Vehicle.position;
      positionAttribute.setXYZ(0, position.x, position.y, position.z);

      const position2 = this.follower2Vehicle.position;
      positionAttribute.setXYZ(1, position2.x, position2.y, position2.z);

      positionAttribute.needsUpdate = true;

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
