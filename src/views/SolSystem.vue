<template>
  <main>
    <div ref="universe" id="universe" class="bg-slate-600 w-screen h-screen"></div>
  </main>
</template>
<script setup lang="ts">
// @ts-ignore
import * as THREE from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
// @ts-ignore
import { FlyControls } from "three/addons/controls/FlyControls.js";

import { useGenerator } from '@/composables/Generator';

import { useNavStore } from '@/stores/navbar';
// import { Star, Planet, Moon, SolarSystem, Galaxy } from '@/models/Orbitals';

let navStore = useNavStore()
navStore.setTheme('explorer')

const universe = ref<HTMLDivElement | null>(null)
const { generateGalaxy } = useGenerator();
let onWindowResize: { (): void; (this: Window, ev: UIEvent): any; (this: Window, ev: UIEvent): any; } | undefined = undefined;

function addUpdateables(object: any, updateables: any[]) {
  if (object.update) {
    updateables.push(object);
  }
  if (object.children) {
    object.children.forEach((child: any) => addUpdateables(child, updateables));
  }
}

class View {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  galaxy: any;
  controls: FlyControls | null;

  constructor() {
    this.scene = null;
    this.renderer = null;
    this.controls = null;
    this.renderer = null;
  }

  setupControls() {
    // User Controls
    this.controls = new FlyControls(this.camera, universe?.value);
    this.controls.movementSpeed = 1;
    this.controls.rollSpeed = Math.PI / 192;
    this.controls.autoForward = false;
    this.controls.dragToLook = true;

    // Increase movement speed when shift key is pressed
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Shift') {
        this.controls.movementSpeed = 5;
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.key === 'Shift') {
        this.controls.movementSpeed = 1;
      }
    });
  }

  setupScene() {
    let updateables: any[] = [];
    this.scene = new THREE.Scene();
    let container = document.getElementById('universe') as HTMLDivElement;

    let { width, height } = container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000000);
    this.camera.position.set(0, 0, 1000);

    this.setupControls();

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);

    // Enable shader debugging
    this.renderer.debug.checkShaderErrors = true;

    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    universe?.value?.appendChild(this.renderer.domElement);

    const galaxy = generateGalaxy(100, this.scene);
    galaxy.solarSystems.forEach((solarSystem: any) => {
      addUpdateables(solarSystem, updateables);
    });

    onWindowResize = () => {
      const { width, height } = container.getBoundingClientRect();
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', onWindowResize);

    let animate = (time: number) => {
      const scaledTime = time / 1000; // Scale down the time to slow down the orbiting speed
      updateables.forEach((object) => {
        object.update(this.camera, scaledTime); // Pass scaledTime to update method
      });

      this.controls.update(1); // Pass delta time to update method
      this.renderer.render(this.scene, this.camera);
    }

    this.renderer.setAnimationLoop(animate);
  }
}

onUnmounted(() => {
  if (onWindowResize) {
    window.removeEventListener('resize', onWindowResize);
  }
});

onMounted(() => {
  const view: View = new View();
  view.setupScene();
});

</script>
