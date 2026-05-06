import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

// blurry
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

    this.particles = [];
    this.meshes = [];
    this.bodies = [];
    this.world = this.#initWorld();

    await this.#initObjects();

    this.clock = new THREE.Timer();
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
    camera.position.set(2, 1, 1.5);
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
    this.scene.background = new THREE.Color(0x000000);
  }
  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 0.7);
    directionalLight.position.set(0, 0, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  #initWorld() {
    const world = new CANNON.World({
      gravity: new THREE.Vector3(0, -9.81, 0),
    });

    this.timeStep = 1 / 60;

    return world;
  }

  // Initiate Objects
  async #initObjects() {
    // connect function - uses distant constraint
    const connect = (i1, j1, i2, j2) => {
      this.world.addConstraint(
        new CANNON.DistanceConstraint(
          this.particles[i1][j1],
          this.particles[i2][j2],
          dist,
        ),
      );
    };

    // cloth particles
    const Nx = 15;
    const Ny = 15;
    const mass = 1;
    const clothSize = 1;
    const dist = clothSize / Nx;

    const shape = new CANNON.Particle();
    for (let i = 0; i < Nx + 1; i++) {
      this.particles.push([]);
      for (let j = 0; j < Ny + 1; j++) {
        const particle = new CANNON.Body({
          mass: j == Ny ? 0 : mass,
          shape,
          position: new CANNON.Vec3(
            (i - Nx * 0.5) * dist,
            (j - Ny * 0.5) * dist,
            0,
          ),
          velocity: new CANNON.Vec3(0, 0, -0.1 * (Ny - j)),
        });
        this.particles[i].push(particle);
        this.world.addBody(particle);
      }
    }
    console.log(this.particles);

    // connect particles
    for (let i = 0; i < Nx + 1; i++) {
      for (let j = 0; j < Ny + 1; j++) {
        if (i < Nx) connect(i, j, i + 1, j);
        if (j < Ny) connect(i, j, i, j + 1);
      }
    }

    // cloth mesh
    const clothGeometry = new THREE.PlaneGeometry(1, 1, Nx, Ny);
    const clothMaterial = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load("./assets/cloth-pattern-1.jpg"),
      //wireframe: true,
    });
    const clothMesh = new THREE.Mesh(clothGeometry, clothMaterial);
    clothMesh.receiveShadow = true;
    this.scene.add(clothMesh);

    // connect vertices
    this.updateParticles = () => {
      for (let i = 0; i < Nx + 1; i++) {
        for (let j = 0; j < Ny + 1; j++) {
          const index = j * (Nx + 1) + i;

          const positionAttribute = clothGeometry.attributes.position;

          const position = this.particles[i][Ny - j].position;

          positionAttribute.setXYZ(index, position.x, position.y, position.z);

          positionAttribute.needsUpdate = true;
        }
      }
    };

    // sphere mesh
    const sphereSize = 0.1;
    const movementRadius = 0.2;

    const sphereGeometry = new THREE.SphereGeometry(sphereSize);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffff0,
    });

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.sphereMesh = sphereMesh;
    this.scene.add(this.sphereMesh);
    this.meshes.push(this.sphereMesh);

    const sphereShape = new CANNON.Sphere(sphereSize * 1.38);
    const sphereBody = new CANNON.Body({
      mass: 0,
      shape: sphereShape,
    });
    this.sphereBody = sphereBody;
    this.world.addBody(this.sphereBody);
    this.bodies.push(this.sphereBody);

    // temp
    // this.sphereBody.position.z = 1;
  }
  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      const delta = this.clock.update().getDelta();
      this.updateParticles();

      // sphere movement
      this.sphereBody.position.set(
        Math.sin(time / 1000) / 5,
        0,
        Math.cos(time / 1000) / 3,
      );

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
