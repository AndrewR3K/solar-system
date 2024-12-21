<template>
  <main class="max-w-5xl mx-auto">
    <div ref="universe" id="universe" class="bg-slate-600 w-full aspect-video"></div>
  </main>
</template>
<script setup lang="ts">
// @ts-ignore
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// import { Player } from '@/composables/Player';


import { useGenerator } from '@/composables/Generator';
const universe = ref<HTMLDivElement | null>(null)
const { galaxyGenerating, galaxy } = useGenerator(5)

class View {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  galaxy: any;
  controls: OrbitControls | null;

  constructor() {
    this.scene = null;
    this.renderer = null;
    this.controls = null;
    this.renderer = null;
  }

  setupControls() {
    // User Controls
    this.controls = new OrbitControls(this.camera, universe?.value);
    this.controls.target.set(0, 0, 0);
    this.controls.enabled = true;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 1500;
    this.controls.update();
  }

  addLight() {
    // Create a PointLight with the color white (0xffffff), intensity of 10, and distance of 10
    let lightsource = new THREE.PointLight(0xffffff, 2, 10000, 2);
    lightsource.position.set(0, 0, 0);
    // Add the light to the scene
    this.scene.add(lightsource);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    let container = document.getElementById('universe') as HTMLDivElement;

    let { width, height } = container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);


    this.setupControls();
    this.addLight();

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);

    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Fog
    this.scene.fog = new THREE.Fog(0x23272a, 0.5, 1700, 4000);


    universe?.value?.appendChild(this.renderer.domElement);
    console.log(galaxy)
    // @ts-ignore
    galaxy.solarSystems.forEach(solarSystem => {

      // @ts-ignore
      solarSystem.children.forEach(star => {
        // TODO: Add stars


        // @ts-ignore
        star.children.forEach(celestialBody => {
          // TODO: Add celestial bodies
        });
      });
    });



    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);


    let animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      this.renderer.render(this.scene, this.camera);
    }

    this.renderer.setAnimationLoop(animate);
  }
}

onMounted(() => {
  const view: View = new View();
  view.setupScene();
});

</script>
