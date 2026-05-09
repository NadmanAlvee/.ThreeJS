import * as THREE from "three";
import * as YUKA from "yuka";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

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

    this.labelRenderer = this.#initLabelRenderer();

    this.entityManager = this.#yukaEntityManager();
    this.syncFunction = (entity, renderComponent) => {
      renderComponent.matrix.copy(entity.worldMatrix);
    };

    this.copVehicle = await this.#initCarModel();
    this.vehicleMesh = null;
    this.vehicle = null;
    this.#initObjects();

    this.path = this.#initPath();
    this.#displayPath();
    this.#makeVehicleFollowPath();

    this.#initCpointSpheresWithLabel();

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
    camera.position.set(15, 5, 25);
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
    this.scene.background = new THREE.Color(0x979797);
  }

  // Label renderer
  #initLabelRenderer() {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(labelRenderer.domElement);

    return labelRenderer;
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

  async #initCarModel() {
    // cop car model
    const cop = await this.gltfLoader.loadAsync("./models/Cop.gltf", (gltf) => {
      return gltf;
    });
    cop.scene.scale.set(0.5, 0.5, 0.5);
    this.scene.add(cop.scene);

    // car label
    this.carLabelP = document.createElement("p");
    this.carLabelP.classList = "carLabel";
    this.carLabelP.textContent = "0";

    this.carLabel = new CSS2DObject(this.carLabelP);
    this.scene.add(this.carLabel);

    return cop;
  }

  // Initiate Objects
  #initObjects() {
    this.copVehicle.scene.matrixAutoUpdate = false;

    this.vehicle = new YUKA.Vehicle();
    this.vehicle.setRenderComponent(this.copVehicle.scene, this.syncFunction);

    this.entityManager.add(this.vehicle);
  }

  // yuka path
  #initPath() {
    const path = new YUKA.Path();

    path.add(new YUKA.Vector3(-10, 0, 12));
    path.add(new YUKA.Vector3(0, 0, 12));
    path.add(new YUKA.Vector3(10, 0, 12));
    path.add(new YUKA.Vector3(15, 0, 8));
    path.add(new YUKA.Vector3(17, 0, 0));
    path.add(new YUKA.Vector3(-15, 0, -8));
    path.add(new YUKA.Vector3(-17, 0, 0));
    path.add(new YUKA.Vector3(-15, 0, 8));

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

    const followPath = new YUKA.FollowPathBehavior(this.path, 5);
    this.vehicle.steering.add(followPath);

    const onPathBehavior = new YUKA.OnPathBehavior(this.path);
    onPathBehavior.radius = 1;
    this.vehicle.steering.add(onPathBehavior);

    this.vehicle.maxSpeed = 5;
    console.log(this.vehicle);
  }

  #initCpointSpheresWithLabel() {
    const createCointMesh = (name, x, y, z) => {
      const geo = new THREE.SphereGeometry(0.3);
      const mat = new THREE.MeshBasicMaterial({ color: 0xfffff00 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.name = name;
      return mesh;
    };

    const group = new THREE.Group();

    const cPointSphereMesh1 = createCointMesh("sphereMesh1", -10, 0, 12);
    group.add(cPointSphereMesh1);

    const cPointSphereMesh2 = createCointMesh("sphereMesh2", 0, 0, 12);
    group.add(cPointSphereMesh2);

    const cPointSphereMesh3 = createCointMesh("sphereMesh3", 10, 0, 12);
    group.add(cPointSphereMesh3);

    const cPointSphereMesh4 = createCointMesh("sphereMesh4", 15, 0, 8);
    group.add(cPointSphereMesh4);

    const cPointSphereMesh5 = createCointMesh("sphereMesh5", 17, 0, 0);
    group.add(cPointSphereMesh5);

    const cPointSphereMesh6 = createCointMesh("sphereMesh6", -15, 0, -8);
    group.add(cPointSphereMesh6);

    const cPointSphereMesh7 = createCointMesh("sphereMesh7", -17, 0, 0);
    group.add(cPointSphereMesh7);

    const cPointSphereMesh8 = createCointMesh("sphereMesh8", -15, 0, 8);
    group.add(cPointSphereMesh8);

    this.scene.add(group);

    // Sphere Label
    const p = document.createElement("p");
    p.className = "tooltip";

    const pContainer = document.createElement("div");
    pContainer.appendChild(p);

    const cPointLabel = new CSS2DObject(pContainer);
    this.scene.add(cPointLabel);

    // hide/unhide on hover
    const mousePos = new THREE.Vector2();
    const rayCaster = new THREE.Raycaster();

    window.addEventListener("mousemove", (e) => {
      mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;

      rayCaster.setFromCamera(mousePos, this.camera);
      const intersects = rayCaster.intersectObject(group);

      if (intersects.length > 0) {
        switch (intersects[0].object.name) {
          case "sphereMesh1": {
            p.className = "tooltip show";
            cPointLabel.position.set(-10, 1, 12);
            p.textContent = "Checkpoint 1";
            break;
          }
          case "sphereMesh2": {
            p.className = "tooltip show";
            cPointLabel.position.set(0, 1, 12);
            p.textContent = "Checkpoint 2";
            break;
          }
          case "sphereMesh3": {
            p.className = "tooltip show";
            cPointLabel.position.set(10, 1, 12);
            p.textContent = "Checkpoint 3";
            break;
          }
          case "sphereMesh4": {
            p.className = "tooltip show";
            cPointLabel.position.set(15, 1, 8);
            p.textContent = "Checkpoint 4";
            break;
          }
          case "sphereMesh5": {
            p.className = "tooltip show";
            cPointLabel.position.set(17, 1, 0);
            p.textContent = "Checkpoint 5";
            break;
          }
          case "sphereMesh6": {
            p.className = "tooltip show";
            cPointLabel.position.set(-15, 1, -8);
            p.textContent = "Checkpoint 6";
            break;
          }
          case "sphereMesh7": {
            p.className = "tooltip show";
            cPointLabel.position.set(-17, 1, 0);
            p.textContent = "Checkpoint 7";
            break;
          }
          case "sphereMesh8": {
            p.className = "tooltip show";
            cPointLabel.position.set(-15, 1, 8);
            p.textContent = "Checkpoint 8";
            break;
          }
          default: {
            break;
          }
        }
      } else {
        p.className = "tooltip hide";
      }
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      // yuka animate
      const deltaTime = this.yukaTime.update().getDelta();
      this.entityManager.update(deltaTime);

      this.carLabel.position.set(
        this.vehicle.position.x,
        this.vehicle.position.y + 2.1,
        this.vehicle.position.z,
      );
      this.carLabelP.textContent = this.vehicle.velocity.x.toFixed(2);

      this.labelRenderer.render(this.scene, this.camera);
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

      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}

const myWorld = new World();
