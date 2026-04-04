import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class World {
  // constructor
  constructor() {
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();

    this.controls = this.#initOrbitControl();
    this.gltfLoader = this.#initGltfLoader();
    this.mixer = null;

    this.#initLights();
    this.#initBackground();
    this.#initObjects();
    this.#initPlayableCharacter();

    this.clock = new THREE.Timer();
    this.#initAnimationLoop();
    this.#initResize();
  }

  // Render
  #initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
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
    camera.rotation.z = 5;
    return camera;
  }

  // Orbit Control
  #initOrbitControl() {
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

  // Background
  #initBackground() {
    this.scene.background = new THREE.Color(0xffffee);
  }

  #playAnimation(GltfModel, clipName) {
    this.mixer = new THREE.AnimationMixer(GltfModel.scene);
    const clips = GltfModel.animations;
    const clip = THREE.AnimationClip.findByName(clips, clipName);
    const action = this.mixer.clipAction(clip);
    action.play();
  }

  // Initiate Objects
  #initObjects() {
    // plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = -0.5 * Math.PI;
    planeMesh.receiveShadow = true;
    this.scene.add(planeMesh);
  }

  // Playable Character
  async #initPlayableCharacter() {
    // load character
    try {
      const playerGltf = await this.gltfLoader.loadAsync(
        "../models/LP_Person.glb",
      );
      this.player = playerGltf.scene;
      this.scene.add(this.player);
      this.currentTarget = this.player;

      // initial camera position setup
      this.camera.position.set(0, 6, -8);
      this.controls.update();

      // temporary animation play
      this.#playAnimation(playerGltf, "HeartEmote");
    } catch (err) {
      console.log("Error Loading Player! ");
    }
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      this.clock.update(time);

      if (this.currentTarget) {
        const lookAt = this.currentTarget.position.clone();
        lookAt.y += 3;
        this.controls.target.lerp(lookAt, 0.1);
      }

      this.mixer?.update(this.clock.getDelta());
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

const world = new World();
