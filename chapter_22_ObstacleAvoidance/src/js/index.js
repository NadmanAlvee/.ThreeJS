import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

import * as YUKA from "yuka";
import { color } from "three/src/nodes/tsl/TSLCore.js";

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
    this.syncFunction = (entity, renderComponent) => {
      renderComponent.matrix.copy(entity.worldMatrix);
    };

    this.vehicleMesh = null;
    this.vehicle = null;
    this.#initObjects();

    this.path = this.#initPath();
    this.#displayPath();
    this.#makeVehicleFollowPath();

    this.#makeObstaclesAndAvoidanceBehavior();

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
    camera.position.set(0, 5, 13);
    return camera;
  }

  // Orbit Control
  #initControl() {
    // Orbit Control
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
    this.scene.background = new THREE.Color(0x0e0e0e);
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
    vehicleGeometry.computeBoundingSphere();
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
    // this.vehicle.smoother = new YUKA.Smoother(30);
    this.vehicle.boundingRadius = vehicleGeometry.boundingSphere.radius;
    this.vehicle.setRenderComponent(this.vehicleMesh, this.syncFunction);

    this.entityManager.add(this.vehicle);
  }

  // yuka path
  #initPath() {
    const path = new YUKA.Path();
    path.add(new YUKA.Vector3(-10, 0, 0));
    path.add(new YUKA.Vector3(10, 0, 0));

    path.loop = true;

    return path;
  }

  #displayPath() {
    const position = [];

    for (let i = 0; i < this.path._waypoints.length; i++) {
      const waypoint = this.path._waypoints[i];
      position.push(waypoint.x, waypoint.y, waypoint.z);
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(position, 3),
    );
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const lines = new THREE.LineLoop(lineGeometry, lineMaterial);
    this.scene.add(lines);
  }

  #makeVehicleFollowPath() {
    this.vehicle.position.copy(this.path.current());

    const followPath = new YUKA.FollowPathBehavior(this.path, 1);
    this.vehicle.steering.add(followPath);

    const onPathBehavior = new YUKA.OnPathBehavior(this.path);
    onPathBehavior.radius = 0.8;
    this.vehicle.steering.add(onPathBehavior);

    this.vehicle.maxSpeed = 5;
  }

  #makeObstaclesAndAvoidanceBehavior() {
    // obstacles Mesh
    const obstacleGeometry = new THREE.BoxGeometry();
    obstacleGeometry.computeBoundingSphere();
    const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    const obstacleMesh1 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    this.scene.add(obstacleMesh1);
    obstacleMesh1.position.set(0, 0, 0);

    const obstacleMesh2 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    this.scene.add(obstacleMesh2);
    obstacleMesh2.position.set(-5, 0, 0);

    const obstacleMesh3 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    this.scene.add(obstacleMesh3);
    obstacleMesh3.position.set(5, 0, 0);

    const obstacle1 = new YUKA.GameEntity();
    obstacle1.position.copy(obstacleMesh1.position);
    obstacle1.boundingRadius = obstacleGeometry.boundingSphere.radius;
    this.entityManager.add(obstacle1);

    const obstacle2 = new YUKA.GameEntity();
    obstacle2.position.copy(obstacleMesh2.position);
    obstacle2.boundingRadius = obstacleGeometry.boundingSphere.radius;
    this.entityManager.add(obstacle2);

    const obstacle3 = new YUKA.GameEntity();
    obstacle3.position.copy(obstacleMesh3.position);
    obstacle3.boundingRadius = obstacleGeometry.boundingSphere.radius;
    this.entityManager.add(obstacle3);

    const obstacles = [];
    obstacles.push(obstacle1, obstacle2, obstacle3);

    const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(
      obstacles,
    );

    this.vehicle.steering.add(obstacleAvoidanceBehavior);
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
