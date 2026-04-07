import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import { color } from "three/src/nodes/tsl/TSLCore.js";

class World {
  // constructor
  constructor() {
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();
    this.controls = this.#initOrbitControl();
    this.gltfLoader = this.#initGltfLoader();
    this.objectsToUpdate = [];

    this.#initLights();
    this.#initBackground();
    this.world = null;
    this.timeStep = null;
    this.#initPhysicsWorld();
    this.groundMesh = null;
    this.axesHelper = null;
    this.#initObjects();
    this.#makeObjectOnClick();

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
    camera.position.set(0, 15, 30);
    return camera;
  }

  // Orbit Control
  #initOrbitControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.minDistance = 3;
    // controls.maxDistance = 20;
    // controls.maxPolarAngle = Math.PI / 2.1;
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
    this.scene.background = new THREE.Color(0xd3d3d3);
  }
  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene?.add(ambientLight);

    const spotLight = new THREE.SpotLight("#fff", 1000, 0, 1);
    spotLight.position.set(0, 20, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    const sLightHelper = new THREE.SpotLightHelper(spotLight);
    this.scene.add(sLightHelper);
  }

  // Constructing Physics World
  #initPhysicsWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    });

    this.timeStep = 1 / 60;
  }

  #initObjects() {
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffee,
      side: THREE.DoubleSide,
    });
    this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    this.groundPhysBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(20, 20, 0.1)),
      type: CANNON.BODY_TYPES.STATIC,
    });
    this.groundPhysBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(this.groundPhysBody);
  }

  #makeObjectOnClick() {
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

      const sphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 20),
        new THREE.MeshStandardMaterial({
          color: Math.random() * 0xffffff,
        }),
      );
      sphereMesh.castShadow = true;
      sphereMesh.position.copy(intersectionPoint);
      this.scene.add(sphereMesh);

      const spherePhysBody = new CANNON.Body({
        shape: new CANNON.Sphere(1),
        mass: 1,
      });
      spherePhysBody.position.set(
        intersectionPoint.x,
        intersectionPoint.y + 5,
        intersectionPoint.z,
      );
      this.world.addBody(spherePhysBody);

      this.objectsToUpdate.push({
        mesh: sphereMesh,
        body: spherePhysBody,
      });
    });
  }

  #initAnimationLoop() {
    this.renderer.setAnimationLoop(() => {
      this.world.step(this.timeStep);

      this.groundMesh.position.copy(this.groundPhysBody.position);
      this.groundMesh.quaternion.copy(this.groundPhysBody.quaternion);

      for (const object of this.objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  #initResize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }
}

const myWorld = new World();
