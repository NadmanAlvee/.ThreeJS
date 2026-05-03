import * as THREE from "three";
import GSAP from "gsap";
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

    // this.controls = this.#initControl();
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

    this.mixer = null;
    this.helicopter = await this.#initHelicopterModel();

    this.vehicle = null;
    this.#initObjects();
    this.target = null;
    this.#initTarget();
    this.#makeEntitySeekTarget();

    this.#initRayCasterAndPlane();

    this.#initInput();

    this.yukaTime = new YUKA.Time();
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
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    return camera;
  }

  // Orbit Control
  #initControl() {
    // Orbit Control
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enabled = false;
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

  #initInput() {
    this.cameraAngle = 0;

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "a") {
        GSAP.to(this, {
          cameraAngle: this.cameraAngle - Math.PI / 4,
          duration: 0.4,
          ease: "power2.out",
        });
      }
      if (e.key.toLowerCase() === "d") {
        GSAP.to(this, {
          cameraAngle: this.cameraAngle + Math.PI / 4,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });
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
  async #initBackground() {
    this.UESky = await this.gltfLoader.loadAsync(
      "./models/unreal_engine_4_sky/scene.gltf",
    );
    this.UESky.scene.scale.set(10, 10, 10);
    this.scene.add(this.UESky.scene);
  }

  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
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

  async #initHelicopterModel() {
    // Helicopter model
    const helicopter = await this.gltfLoader.loadAsync(
      "./models/low_poly_helicopter/scene.gltf",
      (gltf) => {
        return gltf;
      },
    );

    this.mixer = new THREE.AnimationMixer(helicopter.scene);
    const action = this.mixer.clipAction(helicopter.animations[0]);
    action.play();

    // wrap the scene in a pivot
    this.helicopterPivot = new THREE.Group();
    helicopter.scene.rotation.y = Math.PI / 2;

    this.helicopterPivot.add(helicopter.scene);

    this.scene.add(this.helicopterPivot);
    return helicopter;
  }

  // Initiate Objects
  #initObjects() {
    this.helicopterPivot.matrixAutoUpdate = false;

    // yuka entity
    this.vehicle = new YUKA.Vehicle();
    this.vehicle.setRenderComponent(this.helicopterPivot, this.syncFunction);
    this.vehicle.scale.set(0.3, 0.3, 0.3);
    this.vehicle.maxSpeed = 10;
    this.entityManager.add(this.vehicle);
  }

  #initTarget() {
    const targetGeometry = new THREE.SphereGeometry(1);
    const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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
    const seekBehavior = new YUKA.ArriveBehavior(this.target.position, 3, 5);
    this.vehicle.steering.add(seekBehavior);

    //temp
    this.vehicle.position.set(10, 0, -30);
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      this.clock.update(time);
      this.mixer.update(this.clock.getDelta());

      // yuka animate
      const deltaTime = this.yukaTime.update().getDelta();
      this.entityManager.update(deltaTime);

      // TPP camera follow
      const pos = this.vehicle.position;
      const forward = this.vehicle.forward;

      const baseAngle = Math.atan2(forward.x, forward.z);
      const totalAngle = baseAngle + this.cameraAngle;

      const distance = 15;
      this.camera.position.set(
        pos.x - Math.sin(totalAngle) * distance,
        pos.y + 3,
        pos.z - Math.cos(totalAngle) * distance,
      );
      this.camera.lookAt(pos.x, pos.y, pos.z);

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
