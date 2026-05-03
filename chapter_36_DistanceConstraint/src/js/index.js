import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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

    this.#init();
  }

  async #init() {
    this.#initBackground();
    this.#initLights();

    this.meshes = [];
    this.bodies = [];

    this.world = null;
    this.timeStep = null;
    this.#initPhysicsWorld();

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
    camera.position.set(5, 6, 10);
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
    this.scene.background = new THREE.Color(0xb2beb5);
  }

  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
    directionalLight.position.set(0, 20, 0);
    directionalLight.castShadow = true;
    this.scene?.add(directionalLight);
  }

  #initPhysicsWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    });
    this.timeStep = 1 / 60;
  }

  // Initiate Objects
  async #initObjects() {
    // static sphere
    const staticSphereSize = 2;
    const staticSphereGeo = new THREE.SphereGeometry(staticSphereSize);
    const staticSphereMat = new THREE.MeshStandardMaterial({ color: 0xa9a9a9 });
    const staticSphereMesh = new THREE.Mesh(staticSphereGeo, staticSphereMat);
    this.scene.add(staticSphereMesh);
    this.meshes.push(staticSphereMesh);

    // sphere cannon body
    const staticSphere = new CANNON.Body({
      shape: new CANNON.Sphere(2),
      type: CANNON.Body.STATIC,
    });
    this.world.addBody(staticSphere);
    this.bodies.push(staticSphere);

    // small spheres
    const dist = 0.2;
    const mass = 0.5;
    const cols = 15;
    const rows = 15;

    const particleGeo = new THREE.SphereGeometry(0.1);
    const particleMat = new THREE.MeshPhongMaterial({ color: 0xffea00 });

    const shape = new CANNON.Particle();
    this.particles = {};

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const particleBody = new CANNON.Body({
          mass,
          shape,
          position: new CANNON.Vec3(
            -(i - cols * 0.5) * dist,
            4,
            (j - rows * 0.5) * dist,
          ),
        });
        this.particles[`${i} ${j}`] = particleBody;
        this.world.addBody(particleBody);
        this.bodies.push(particleBody);

        const particleMesh = new THREE.Mesh(particleGeo, particleMat);
        this.scene.add(particleMesh);
        this.meshes.push(particleMesh);
      }
    }

    const connect = (i1, j1, i2, j2) => {
      const distanceConstraints = new CANNON.DistanceConstraint(
        this.particles[`${i1} ${j1}`],
        this.particles[`${i2} ${j2}`],
        dist,
      );
      this.world.addConstraint(distanceConstraints);
    };

    // distance constraints
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (i < cols - 1) {
          connect(i, j, i + 1, j);
        }
        if (j < rows - 1) {
          connect(i, j, i, j + 1);
        }
      }
    }
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      if (this.meshes.length > 0) {
        for (let i = 0; i < this.meshes.length; i++) {
          this.meshes[i].position.copy(this.bodies[i].position);
          this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
        }
      }

      this.world.step(this.timeStep);
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
