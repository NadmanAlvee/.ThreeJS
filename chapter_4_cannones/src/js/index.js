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

    this.#initLights();
    this.#initBackground();
    this.#initPhysics();
    this.#initObjects();

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
    this.scene.background = new THREE.Color(0x000000);
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

  // Constructing Physics World
  #initPhysics() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    });

    this.timeStep = 1 / 60;
  }

  // Initiate Objects
  #initObjects() {
    // ground
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0000ff,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    this.groundMesh = groundMesh;
    groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // ground physics Body
    this.groundPhysMat = new CANNON.Material();

    this.groundBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(20, 20, 0.1)),
      type: CANNON.BODY_TYPES.STATIC,
      material: this.groundPhysMat,
    });
    this.world.addBody(this.groundBody);
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

    // box mesh
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const box1Mesh = new THREE.Mesh(boxGeo, boxMaterial);
    this.box1Mesh = box1Mesh;
    this.scene.add(this.box1Mesh);

    // box physics body
    this.box1PhysMat = new CANNON.Material();

    this.box1Body = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
      mass: 1,
      position: new CANNON.Vec3(1, 50, 0),
      material: this.box1PhysMat,
    });
    this.world.addBody(this.box1Body);

    // ais resistance
    this.box1Body.linearDamping = 0.5;
    // rotation in own axis
    this.box1Body.angularVelocity.set(0, 0.5, 1);

    // Contact material for ground and body
    this.groundBoxContantMat = new CANNON.ContactMaterial(
      this.groundPhysMat,
      this.box1PhysMat,
      {
        friction: 0,
      },
    );
    this.world.addContactMaterial(this.groundBoxContantMat);

    // sphere mesh
    const sphere1Geo = new THREE.SphereGeometry(2, 20, 20);
    const sphere1Material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const sphere1Mesh = new THREE.Mesh(sphere1Geo, sphere1Material);
    this.sphere1Mesh = sphere1Mesh;
    this.scene.add(this.sphere1Mesh);

    // sphere physics body
    this.spherePhysMat = new CANNON.Material();

    this.sphere1Body = new CANNON.Body({
      shape: new CANNON.Sphere(2),
      mass: 5,
      position: new CANNON.Vec3(0, 15, 0),
      material: this.spherePhysMat,
    });
    this.world.addBody(this.sphere1Body);

    // ais resistance
    this.sphere1Body.linearDamping = 0.5;
    // rotation in own axis
    this.sphere1Body.angularVelocity.set(0, 0.5, 1);

    // temp
    const sphere2Mesh = new THREE.Mesh(
      sphere1Geo,
      new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        wireframe: true,
      }),
    );
    this.sphere2Mesh = sphere2Mesh;
    this.scene.add(this.sphere2Mesh);

    // sphere physics body
    this.spherePhysMat = new CANNON.Material();

    this.sphere2Body = new CANNON.Body({
      shape: new CANNON.Sphere(2),
      mass: 5,
      position: new CANNON.Vec3(0, 5, 0),
      material: this.spherePhysMat,
    });
    this.world.addBody(this.sphere2Body);

    // ais resistance
    this.sphere2Body.linearDamping = 0.5;
    // rotation in own axis
    this.sphere2Body.angularVelocity.set(0, 0.5, 1);
    // temp end

    // Contact material for sphere and body
    this.groundSphereContactMat = new CANNON.ContactMaterial(
      this.groundPhysMat,
      this.spherePhysMat,
      {
        restitution: 0.9,
      },
    );
    this.world.addContactMaterial(this.groundSphereContactMat);
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      // cannon
      this.world.step(this.timeStep);

      // ground posi copy
      this.groundMesh.position.copy(this.groundBody.position);
      this.groundMesh.quaternion.copy(this.groundBody.quaternion);

      // box 1 posi copy
      this.box1Mesh.position.copy(this.box1Body.position);
      this.box1Mesh.quaternion.copy(this.box1Body.quaternion);

      // sphere 1 posi copy
      this.sphere1Mesh.position.copy(this.sphere1Body.position);
      this.sphere1Mesh.quaternion.copy(this.sphere1Body.quaternion);
      // sphere 2 posi copy
      this.sphere2Mesh.position.copy(this.sphere2Body.position);
      this.sphere2Mesh.quaternion.copy(this.sphere2Body.quaternion);

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
