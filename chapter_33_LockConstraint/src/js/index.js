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

    this.#initLights();
    this.#initBackground();

    this.world = null;
    this.timeStep = null;
    this.#initPhysicsWorld();

    this.meshesArray = [];
    this.bodiesArray = [];
    this.#initObjects();

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
    camera.position.set(0, 15, 30);
    return camera;
  }

  // Orbit Control
  #initControl() {
    // Orbit Control
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.1;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  #initPhysicsWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    });
    this.timeStep = 1 / 60;
  }

  // Initiate Objects
  #initObjects() {
    // size of box
    const size = 0.5;
    // margin between boxes
    const space = size * 0.1;
    const mass = 1;
    const N = 10;
    const shape = new CANNON.Box(new CANNON.Vec3(size, size, size));

    const geo = new THREE.BoxGeometry();
    const mat = new THREE.MeshPhongMaterial({ color: 0xffea00 });

    // boxes
    this.previous = null;
    for (let i = 0; i < N; i++) {
      const boxBody = new CANNON.Body({
        shape,
        mass,
        position: new CANNON.Vec3(
          -(N - i - N / 2) * (size * 2 + space * 2),
          3,
          0,
        ),
      });
      this.world.addBody(boxBody);
      this.bodiesArray.push(boxBody);

      const box = new THREE.Mesh(geo, mat);
      this.meshesArray.push(box);

      this.scene.add(box);

      // lock contstraint
      if (this.previous) {
        const lockConstraint = new CANNON.LockConstraint(
          boxBody,
          this.previous,
        );
        this.world.addConstraint(lockConstraint);
      }
      this.previous = boxBody;
    }

    // stands
    const leftBody = new CANNON.Body({
      mass: 0,
      shape,
      position: new CANNON.Vec3(-(-N / 2 + 1) * (size * 2 + space * 2), 0, 0),
    });
    this.world.addBody(leftBody);
    this.bodiesArray.push(leftBody);

    const leftbox = new THREE.Mesh(geo, mat);
    this.meshesArray.push(leftbox);
    this.scene.add(leftbox);

    const rightBody = new CANNON.Body({
      mass: 0,
      shape,
      position: new CANNON.Vec3(-(N / 2) * (size * 2 + space * 2), 0, 0),
    });
    this.world.addBody(rightBody);
    this.bodiesArray.push(rightBody);

    const rightbox = new THREE.Mesh(geo, mat);
    this.meshesArray.push(rightbox);
    this.scene.add(rightbox);
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      for (let i = 0; i < this.meshesArray.length; i++) {
        this.meshesArray[i].position.copy(this.bodiesArray[i].position);
        this.meshesArray[i].quaternion.copy(this.bodiesArray[i].quaternion);
      }

      this.controls.update();
      this.world.step(this.timeStep);
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
