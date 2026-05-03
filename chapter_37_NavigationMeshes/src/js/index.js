import * as THREE from "three";
import * as YUKA from "yuka";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

import { createGraphHelper } from "./graph_helper.js";
import { createConvexRegionHelper } from "./nav_mesh_helper.js";
import { CustomVehicle } from "./custom_vehicle.js";

class World {
  // constructor
  constructor() {
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();

    this.controls = this.#initControl();
    this.gltfLoader = this.#initGltfLoader();

    this.#init();
  }

  async #init() {
    this.#initLights();
    this.#initBackground();

    this.syncFunction = (entity, renderComponent) => {
      renderComponent.matrix.copy(entity.worldMatrix);
    };
    this.entityManager = this.#initEntityManager();
    this.time = new YUKA.Time();

    this.navMesh = null;
    this.vehicle = null;
    await this.#initObjects();

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
    camera.position.set(0, 5, 10);
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

  #initEntityManager() {
    const entityManager = new YUKA.EntityManager();
    return entityManager;
  }

  // Initiate Objects
  async #initObjects() {
    const vehicleGeometry = new THREE.ConeGeometry(0.125, 0.5, 16);
    vehicleGeometry.rotateX(Math.PI * 0.5);
    vehicleGeometry.translate(0, 0.25, 0);
    const vehicleMaterial = new THREE.MeshNormalMaterial();

    this.vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
    this.vehicleMesh.matrixAutoUpdate = false;
    this.scene.add(this.vehicleMesh);

    // follow path behavior
    const followPathBehavior = new YUKA.FollowPathBehavior();
    followPathBehavior.active = false;
    followPathBehavior.nextWaypointDistance = 0.5;

    // loading map
    this.gltfLoader.load("./models/mapMesh.glb", (glb) => {
      const model = glb.scene;
      this.scene.add(model);
    });

    // nav mesh loading
    const navMeshLoader = new YUKA.NavMeshLoader();
    navMeshLoader.load("./models/navMesh.glb").then((navigationMesh) => {
      this.navMesh = navigationMesh;

      const graph = this.navMesh.graph;
      const graphHelper = createGraphHelper(graph, 0.1); // 0.1 reresents size of the spheres ( checkpoints )
      this.scene.add(graphHelper);

      const navMeshGroup = createConvexRegionHelper(this.navMesh);
      this.scene.add(navMeshGroup);

      this.vehicle = new CustomVehicle(this.navMesh);
      this.vehicle.setRenderComponent(this.vehicleMesh, this.syncFunction);
      this.entityManager.add(this.vehicle);
      this.vehicle.steering.add(followPathBehavior);
      this.vehicle.maxSpeed = 5;

      // ray caster
      const mousePosition = new THREE.Vector2();
      const rayCaster = new THREE.Raycaster();
      const findPathTo = (target) => {
        const from = this.vehicle.position;
        const to = target;
        const path = this.navMesh.findPath(from, to);

        const followPathBehavior = this.vehicle.steering.behaviors[0];
        followPathBehavior.active = true;
        followPathBehavior.path.clear();

        for (let point of path) {
          followPathBehavior.path.add(point);
        }
      };

      window.addEventListener("click", (e) => {
        mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
        mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;

        rayCaster.setFromCamera(mousePosition, this.camera);
        const intersects = rayCaster.intersectObject(navMeshGroup);

        if (intersects.length > 0) {
          findPathTo(new YUKA.Vector3().copy(intersects[0].point));
        }
      });
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      const delta = this.time.update().getDelta();

      this.entityManager.update(delta);
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
