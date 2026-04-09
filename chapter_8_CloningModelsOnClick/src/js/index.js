import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// used to create clone from gltf models. Method used: SkeletonUtils.clone(model.scene)
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

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

    this.groundMesh = null;
    this.gridLayout = null;
    this.highlightMesh = null;
    this.#initObjects();

    this.mousePosition = null;
    this.rayCaster = null;
    this.intersects = [];
    this.#highlightGridOnHover();

    // animation
    this.mixers = [];
    this.clips = [];

    this.animalSceneClones = [];
    this.animalGltf = null;
    this.foxScene = null;
    this.#createObjectOnClick();

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
    camera.position.set(-5, 7, 12);
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
    this.scene.background = new THREE.Color(0xededed);
  }
  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xededed);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  #initObjects() {
    // ground
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      visible: false,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotateX(Math.PI * 0.5);
    groundMesh.name = "groundMesh";
    this.groundMesh = groundMesh;
    this.scene.add(this.groundMesh);

    // Grid layout
    this.gridLayout = new THREE.GridHelper(10, 10);
    this.scene.add(this.gridLayout);

    //  highlight mesh
    this.highlightMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
      }),
    );
    this.highlightMesh.rotateX(Math.PI / 2);
    this.highlightMesh.position.set(0.5, 0.001, 0.5);
    this.scene.add(this.highlightMesh);
  }

  #highlightGridOnHover() {
    this.mousePosition = new THREE.Vector2();
    this.rayCaster = new THREE.Raycaster();

    window.addEventListener("mousemove", (e) => {
      this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.rayCaster.setFromCamera(this.mousePosition, this.camera);
      this.intersects = this.rayCaster.intersectObjects(this.scene.children);

      this.intersects.forEach((intersect) => {
        if (intersect.object.name === "groundMesh") {
          const highlightMeshPosi = new THREE.Vector3()
            .copy(intersect.point)
            .floor()
            .addScalar(0.5);

          this.highlightMesh.position.set(
            highlightMeshPosi.x,
            0.0001,
            highlightMeshPosi.z,
          );
        }
      });
    });
  }

  async #createObjectOnClick() {
    this.animalGltf = await this.gltfLoader.loadAsync("models/Fox.gltf");
    this.foxScene = this.animalGltf.scene;

    // animate fox
    this.clips = this.animalGltf.animations;
    console.log(this.clips);

    window.addEventListener("mousedown", (e) => {
      const objectExists = this.animalSceneClones.some((animalSceneClone) => {
        return (
          animalSceneClone.position.x === this.highlightMesh.position.x &&
          animalSceneClone.position.z === this.highlightMesh.position.z
        );
      });

      if (!objectExists && this.highlightMesh.parent === this.scene) {
        const animalSceneClone = SkeletonUtils.clone(this.foxScene);
        animalSceneClone.position.copy(this.highlightMesh.position);
        this.animalSceneClones.push(animalSceneClone);
        animalSceneClone.scale.set(0.4, 0.4, 0.4);

        this.scene.add(animalSceneClone);
      }
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.renderer.setAnimationLoop((time) => {
      if (this.animalSceneClones.length > 0) {
        // console.log(this.animalSceneClones.length);
      }

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
