import * as THREE from "three";
import Stats from "stats.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

class World {
  // constructor
  constructor() {
    this.stats = this.initStats();

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

    this.InstancedMeshes = [];
    await this.#initObjects();

    this.#initAnimationLoop();
    this.#initResize();
  }

  // performace monitor
  initStats() {
    var stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    return stats;
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
    camera.position.set(0, 15, 30);
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
    this.scene.background = new THREE.Color(0xededed);
  }

  // Lights
  #initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  async #initObjects() {
    // const geometry = new THREE.IcosahedronGeometry();
    // const material = new THREE.MeshPhongMaterial({ color: 0xffea00 });
    // const mesh = new THREE.InstancedMesh(geometry, material, 100000);
    // this.scene.add(mesh);
    // this.mesh = mesh;
    // const dummy = new THREE.Object3D();
    // for (let i = 0; i < 100000; i++) {
    //   dummy.position.x = Math.random() * 40 - 20;
    //   dummy.position.y = Math.random() * 40 - 20;
    //   dummy.position.z = Math.random() * 40 - 20;
    //   dummy.rotation.x = Math.random() * 2 * Math.PI;
    //   dummy.rotation.y = Math.random() * 2 * Math.PI;
    //   dummy.rotation.z = Math.random() * 2 * Math.PI;
    //   dummy.scale.x = dummy.scale.y = dummy.scale.z = Math.random();
    //   dummy.updateMatrix();
    //   this.mesh.setMatrixAt(i, dummy.matrix);
    //   this.mesh.setColorAt(i, new THREE.Color(Math.random() * 0xffffff));
    // }

    // wooden box
    this.gltfLoader.load("./models/low-poly_wooden_box_prop.glb", (glb) => {
      const model = glb.scene;

      // instancing 1000 box
      const dummy = new THREE.Object3D();

      const boxPositions = Array.from({ length: 1000 }, () => ({
        x: Math.random() * -1 * 100 + 100,
        z: Math.random() * -1 * 100 + 100,
      }));

      model.traverse((child) => {
        if (child.isMesh) {
          const instanceMesh = new THREE.InstancedMesh(
            child.geometry,
            child.material,
            1000,
          );
          this.InstancedMeshes.push(instanceMesh);
          this.scene.add(instanceMesh);

          for (let i = 0; i < 1000; i++) {
            dummy.position.x = boxPositions[i].x;
            dummy.position.z = boxPositions[i].z;
            dummy.updateMatrix();
            instanceMesh.setMatrixAt(i, dummy.matrix);
          }
        }
      });

      // imitating raw calls to check perf
      // for (let i = 0; i < 1000; i++) {
      //   const boxModel = model.clone();
      //   boxModel.position.x = boxPositions[i].x;
      //   boxModel.position.z = boxPositions[i].z;
      //   this.scene.add(boxModel);
      // }
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    // const matrix = new THREE.Matrix4();
    // const dummy = new THREE.Object3D();
    this.renderer.setAnimationLoop((time) => {
      this.stats.begin();

      //   for (let i = 0; i < 100000; i++) {
      //     this.mesh.getMatrixAt(i, matrix);
      //     matrix.decompose(dummy.position, dummy.rotation, dummy.scale);

      //     dummy.rotation.x = (i / 10000) * (time / 1000);
      //     dummy.rotation.y = (i / 10000) * (time / 500);
      //     dummy.rotation.z = (i / 10000) * (time / 1200);

      //     dummy.updateMatrix();
      //     this.mesh.setMatrixAt(i, dummy.matrix);
      //   }
      //   this.mesh.instanceMatrix.needsUpdate = true;
      //   this.mesh.rotation.y = time / 1000;

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.stats.end();
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
