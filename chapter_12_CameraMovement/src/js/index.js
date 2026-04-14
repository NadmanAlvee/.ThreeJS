import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

class World {
  // constructor
  constructor() {
    this.renderer = this.#initRenderer();
    this.scene = this.#initScene();
    this.camera = this.#initPerspectiveCamera();

    this.controls = this.#initOrbitControl();
    this.gltfLoader = this.#initGltfLoader();
    this.hdrTextureLoader = this.#hdrTextureLoader();

    this.#initLights();
    this.#initBackground();

    this.groundMesh = null;
    this.mixers = [];
    this.#initObjects();
    this.#initKeyControl();

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
    // Camera positioning.
    camera.position.set(10, 3, 30);
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
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene?.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;
    this.scene?.add(directionalLight);
  }

  // Initiate Objects
  async #initObjects() {
    // Sky
    this.UESky = await this.gltfLoader.loadAsync(
      "./models/unreal_engine_4_sky/scene.gltf",
    );
    this.UESky.scene.scale.set(2, 2, 2);
    this.scene.add(this.UESky.scene);

    // bird 1
    this.phoenix_bird = await this.gltfLoader.loadAsync(
      "./models/phoenix_bird/scene.gltf",
    );
    const birdClips = this.phoenix_bird.animations;
    const flyingClip = THREE.AnimationClip.findByName(
      birdClips,
      birdClips[0].name,
    );
    const mixer = new THREE.AnimationMixer(this.phoenix_bird.scene);
    const action = mixer.clipAction(flyingClip);
    action.play();
    action.timeScale = 0.5;
    this.mixers.push(mixer);

    this.phoenix_bird.scene.scale.set(0.01, 0.01, 0.01);
    this.scene.add(this.phoenix_bird.scene);

    // bird 2
    this.phoenix_bird_2 = SkeletonUtils.clone(this.phoenix_bird.scene);

    const mixer2 = new THREE.AnimationMixer(this.phoenix_bird_2);
    const action2 = mixer2.clipAction(flyingClip);
    action2.play();
    action2.timeScale = 0.5;
    action2.startAt(0.2);
    this.mixers.push(mixer2);

    this.phoenix_bird_2.position.set(-5, 5, -5);
    this.scene.add(this.phoenix_bird_2);

    // bird 3
    this.phoenix_bird_3 = SkeletonUtils.clone(this.phoenix_bird.scene);

    const mixer3 = new THREE.AnimationMixer(this.phoenix_bird_3);
    const action3 = mixer3.clipAction(flyingClip);
    action3.play();
    action3.timeScale = 0.5;
    action3.startAt(0.35);
    this.mixers.push(mixer3);

    this.phoenix_bird_3.position.set(-3, -2, 10);
    this.scene.add(this.phoenix_bird_3);
  }

  // key control of camera
  #initKeyControl() {
    const tl = gsap.timeline();
    const duration = 8;
    const ease = "none";
    let animationFinished = false;
    const CameraAnimation = () => {
      if (!animationFinished) {
        animationFinished = true;

        tl.to(this.camera.position, {
          x: 0,
          duration,
          ease,
        })
          .to(
            this.camera.position,
            {
              y: 40,
              z: 30,
              duration,
              ease,
              onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
              },
            },
            8,
          )
          .to(
            this.camera.position,
            {
              x: -10,
              y: 15,
              z: 10,
              duration,
              ease,
              onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
              },
            },
            8,
          )
          .to(
            this.camera.position,
            {
              x: -30,
              y: 30,
              z: 20,
              duration,
              ease,
              onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
              },
            },
            8,
          )
          .to(
            this.camera.position,
            {
              x: -40,
              y: 30,
              z: -20,
              duration,
              ease,
              onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
              },
            },
            14,
          )
          .to(this.camera.position, {
            x: 5,
            y: 5,
            z: -10,
            duration,
            ease,
            onUpdate: () => {
              this.camera.lookAt(0, 0, 0);
            },
          })
          .to(
            this.camera.position,
            {
              x: 5,
              y: 20,
              z: 30,
              duration,
              ease,
              onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
              },
            },
            ">-0.2",
          )
          .to(this.camera.position, {
            x: -20,
            duration: 12,
            ease,
            delay: 2,
          });
      }
    };
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "f") CameraAnimation();
    });
    window.addEventListener("DOMContentLoaded", (e) => {
      CameraAnimation();
    });
  }

  // Animate Scene
  #initAnimationLoop() {
    this.clock = new THREE.Timer();
    this.renderer.setAnimationLoop((time) => {
      // animation mixer
      this.clock.update(time);
      if (this.mixers.length > 0) {
        this.mixers.forEach((mixer) => {
          mixer.update(this.clock.getDelta());
        });
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
