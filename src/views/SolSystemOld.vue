<template>
  <div>
    <div id="container"></div>
    <div class="control-panel">
      <div class="sbtn" @click="freelook = !freelook"> {{ freelook ? 'Focus' : 'Freelook' }}</div>
      <div class="sbtn" @click="setSolarView"
        :style="{ 'background-color': freelook ? '' : '#7e3030', 'color': freelook ? '' : '#fff' }">Solar View</div>
      <!-- <div>Time: {{tick.toFixed(2)}}</div> -->
    </div>
    <div class="object-panel" v-if="focusedData && !freelook">
      <h2>{{ focusedData.info.name }}</h2>
      <p style="padding: 30px; padding-top: 0px;">{{ focusedData.info.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, toRaw } from 'vue';
import * as THREE from 'three';
import { Tween, Group } from '@tweenjs/tween.js'
import Stats from 'stats.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stats = new Stats();
const tick = ref(0);
const freelook = ref(true);
const player = reactive({
  offset: {
    x: 5,
    y: 10,
    z: 10
  }
});
const state = reactive({
  camera: null,
  scene: null,
  renderer: null,
  freelook: true,
  focus: null,
  controls: null
});
const system = reactive({
  sun: {
    size: 2,
    body: null,
    info: {
      name: 'Sun',
      description: `The Sun is the star at the center of the Solar System. It is a nearly perfect ball of hot plasma, heated to incandescence by nuclear fusion reactions in its core, radiating the energy mainly as visible light, ultraviolet light, and infrared radiation.`,
    }
  },
  moon: {
    size: .1,
    body: null,
    orbit: {
      r: 5,
      theta: 0,
      dTheta: 2 * Math.PI / 2000,
      dx: .01,
      dy: -.01,
      dz: -.05
    },
    info: {
      name: 'Luna',
      description: `The Moon is Earth's only natural satellite. At about one-quarter the diameter of Earth, it is the largest natural satellite in the Solar System relative to the size of its planet, the fifth largest satellite in the Solar System overall, and is larger than any known dwarf planet.`,
    }
  },
  earth: {
    size: .5,
    shader: {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
        'vNormal = normalize( normalMatrix * normal );',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
        'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
        'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    },
    body: null,
    clouds: null,
    lights: null,
    orbit: {
      r: 20,
      theta: 0,
      dTheta: 2 * Math.PI / 3500,
      dx: .01,
      dy: -.01,
      dz: -.05
    },
    info: {
      name: 'Earth',
      description: `Earth is the third planet from the Sun and the only astronomical object known to harbour and support life.  29.2% of Earth's surface is land consisting of continents and islands. The remaining 70.8% is covered with water, mostly by oceans, seas, gulfs, and other salt-water bodies, but also by lakes, rivers, and other freshwater, which together constitute the hydrosphere.`,
    }
  },
  mercury: {
    size: .25,
    body: null,
    orbit: {
      r: 5,
      theta: 0,
      dTheta: 2 * Math.PI / 1000,
      dx: .01,
      dy: -.01,
      dz: -.05
    },
    info: {
      name: 'Mercury',
      description: `Mercury is the smallest planet in the Solar System and the closest to the Sun. Its orbit around the Sun takes 87.97 Earth days, the shortest of all the Sun's planets.`,
    }
  },
  venus: {
    body: null,
    size: .25,
    orbit: {
      r: 10,
      theta: 0,
      dTheta: 2 * Math.PI / 1800,
      dx: .01,
      dy: -.01,
      dz: -.05
    },
    info: {
      name: 'Venus',
      description: `Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. As the brightest natural object in Earth's night sky after the Moon, Venus can cast shadows and can be, on rare occasions, visible to the naked eye in broad daylight.`,
    }
  },
  mars: {
    size: .5,
    body: null,
    clouds: null,
    orbit: {
      r: 30,
      theta: 0,
      dTheta: 2 * Math.PI / 4000,
      dx: .01,
      dy: -.01,
      dz: -.05
    },
    info: {
      name: 'Mars',
      description: `Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury. In English, Mars carries the name of the Roman god of war and is often referred to as the "Red Planet".`,
    }
  }
});
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const amplifyview = ref(4);
const event = reactive({
  click: null,
  resize: null,
  keydown: null
});

watch(freelook, () => {
  player.offset = {
    x: 1,
    y: 2,
    z: 2
  };
});

const focusedData = computed(() => {
  if (!state.focus) return null;
  let name = state.focus.name;
  return system[name];
});

const setSolarView = () => {
  if (!freelook.value) return;
  amplifyview.value = 60;
  focusObject(system.sun.body, 0, 1, 0);
  amplifyview.value = 4;
};

const init = () => {
  let container = document.getElementById('container');
  // Setup Camera
  let width = window.innerWidth;
  let height = window.innerHeight;

  state.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);

  // User Controls
  state.controls = new OrbitControls(state.camera, container);
  state.controls.target.set(0, 0, 0);
  state.controls.enabled = true;
  state.controls.minDistance = 8;
  state.controls.maxDistance = 1500;
  state.controls.update();

  state.scene = new THREE.Scene();

  // Create a PointLight with the color white (0xffffff), intensity of 10, and distance of 10
  let lightsource = new THREE.PointLight(0xffffff, 2, 10000, 2);
  lightsource.position.set(0, 0, 0);
  // Add the light to the scene
  state.scene.add(lightsource);

  state.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  state.renderer.setSize(container.clientWidth, container.clientHeight);

  // Shadows
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Fog
  state.scene.fog = new THREE.Fog(0x23272a, 0.5, 1700, 4000);

  createSystem();

  let dome = state.renderer.domElement;

  dome.height = 324;
  dome.width = 576;

  state.camera.aspect = (dome.width - 10) / (dome.height - 10);
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);

  console.log(dome);

  container.appendChild(dome);
};

const createSystem = () => {
  const textureLoader = new THREE.TextureLoader();

  // Sun
  const sungeometry = new THREE.SphereGeometry(system.sun.size, 32, 32);
  const sunmaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/2k_sun.jpg"),
    emissive: 0xffffff,
    emissiveMap: textureLoader.load("/images/2k_sun.jpg"),
    emissiveIntensity: 1.2
  });

  system.sun.body = new THREE.Mesh(sungeometry, sunmaterial);
  system.sun.body.callback = objectClicked;
  system.sun.body.name = 'sun';
  state.scene.add(system.sun.body);

  // Mercury
  const mergeometry = new THREE.SphereGeometry(system.mercury.size, 32, 32);
  const mermaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/textures/mercury_texture.jpg"),
    bumpMap: textureLoader.load("/images/mercurybump.jpg"),
    bumpScale: 0.05,
  });

  system.mercury.body = new THREE.Mesh(mergeometry, mermaterial);
  system.mercury.body.callback = objectClicked;
  system.mercury.body.name = 'mercury';
  state.scene.add(system.mercury.body);

  var mercuryPivot = new THREE.Object3D();
  system.sun.body.add(mercuryPivot);

  mercuryPivot.add(system.mercury.body);

  // Venus
  const venusmaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/textures/venus_texture.jpg"),
    bumpMap: textureLoader.load("/images/venusbump.jpg"),
    bumpScale: 0.05,
  });

  system.venus.body = new THREE.Mesh(mergeometry, venusmaterial);
  system.venus.body.callback = objectClicked;
  system.venus.body.name = 'venus';
  state.scene.add(system.venus.body);

  var venusPivot = new THREE.Object3D();
  system.sun.body.add(venusPivot);

  venusPivot.add(system.venus.body);

  // Earth
  const geometry = new THREE.SphereGeometry(system.earth.size, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/2_no_clouds_4k.jpg"),
    bumpMap: textureLoader.load("/images/elev_bump_4k.jpg"),
    bumpScale: 0.05,
    specularMap: textureLoader.load("/images/water_4k.jpg"),
    specular: 0xffffff,
    shininess: 25
  });

  system.earth.body = new THREE.Mesh(geometry, material);
  system.earth.body.rotation.x = .004;
  system.earth.body.callback = objectClicked;
  system.earth.body.name = 'earth';
  state.scene.add(system.earth.body);

  var earthPivot = new THREE.Object3D();
  system.sun.body.add(earthPivot);

  earthPivot.add(system.earth.body);

  const earthLights = textureLoader.load('/images/earth_lights_lrg.jpg');
  earthLights.encoding = THREE.sRGBEncoding;

  const earthLightsMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    map: earthLights,
  });

  system.earth.lights = new THREE.Mesh(geometry, earthLightsMat);
  system.earth.lights.rotation.x = .004;
  system.earth.lights.callback = objectClicked;
  system.earth.lights.name = 'earth';
  state.scene.add(system.earth.lights);

  //Clouds
  var cloudGeometry = new THREE.SphereGeometry(system.earth.size + 0.003, 32, 32);
  var cloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/clouds_2.jpg"),
    transparent: true,
    opacity: 0.6,
    shininess: 0,
    color: 0xffffff
  });
  system.earth.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  state.scene.add(system.earth.clouds);
  system.earth.clouds.callback = objectClicked;
  system.earth.clouds.name = 'earth';

  //Moon
  var moonGeometry = new THREE.SphereGeometry(system.moon.size, 32, 32);
  var moonMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/moonmap1k.jpg"),
    bumpMap: textureLoader.load("/images/moonbump1k.jpg"),
    bumpScale: 0.05,
    transparent: false,
    shininess: .5
  });
  system.moon.body = new THREE.Mesh(moonGeometry, moonMaterial);
  system.moon.body.position.set(35, system.earth.body.position.y, system.earth.body.position.z);
  system.moon.body.callback = objectClicked;
  system.moon.body.name = 'moon';
  state.scene.add(system.moon.body);

  var moonPivot = new THREE.Object3D();
  system.earth.body.add(moonPivot);

  moonPivot.add(system.moon.body);

  // Mars
  const marsmaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/mars2k.jpg"),
    bumpMap: textureLoader.load("/images/mars2k_topo.jpg"),
    bumpScale: 0.06,
  });

  system.mars.body = new THREE.Mesh(geometry, marsmaterial);
  system.mars.body.callback = objectClicked;
  system.mars.body.name = 'mars';
  state.scene.add(system.mars.body);

  var marsPivot = new THREE.Object3D();
  system.sun.body.add(marsPivot);

  marsPivot.add(system.mars.body);

  // Mars Clouds
  var marscloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("/images/marswinds.jpg"),
    transparent: true,
    opacity: 0.6,
    shininess: 0,
    color: 0xffffff
  });
  system.mars.clouds = new THREE.Mesh(cloudGeometry, marscloudMaterial);
  state.scene.add(system.mars.clouds);
  system.mars.clouds.callback = objectClicked;
  system.mars.clouds.name = 'mars';

  //Star Skybox
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    '/skyboxes/skybox1/1.png', //left
    '/skyboxes/skybox1/3.png', //right
    '/skyboxes/skybox1/5.png', //top
    '/skyboxes/skybox1/6.png', //bottom
    '/skyboxes/skybox1/2.png', //back
    '/skyboxes/skybox1/4.png', //front
  ]);
  state.scene.background = texture;
  setSolarView();
};

const tweengroup = new Group()
const tweenPlanet = (mesh, x, y, z) => {
  let tween = new Tween(mesh.position)
    .to({ x: x, y: y, z: z }, 1)
    // .easing(Tween.Easing.Quadratic.Out)
    .start();

  tweengroup.add(tween)
};

const movePlanet = (name, x, y, z) => {
  tweenPlanet(system[name].body, x, y, z);
  if (system[name].clouds) {
    tweenPlanet(system[name].clouds, x, y, z);
  }
  if (system[name].lights) {
    tweenPlanet(system[name].lights, x, y, z);
  }
};

const runOrbit = (name, frustum) => {
  let solarobject = system[name];

  if (!frustum.containsPoint(solarobject.body.position)) {
    solarobject.body.visible = false;
    if (solarobject.clouds) solarobject.clouds.visible = false;
    if (solarobject.lights) solarobject.lights.visible = false;
  } else {
    solarobject.body.visible = true;
    if (solarobject.clouds) solarobject.clouds.visible = true;
    if (solarobject.lights) solarobject.lights.visible = true;
  }

  solarobject.orbit.theta += solarobject.orbit.dTheta;

  let x = solarobject.orbit.r * Math.cos(solarobject.orbit.theta);
  let y = solarobject.body.position.y;
  let z = solarobject.orbit.r * Math.sin(solarobject.orbit.theta);
  tweenPlanet(solarobject.body, x, y, z);

  if (solarobject.lights) {
    tweenPlanet(solarobject.lights, x, y, z);
  }

  if (solarobject.clouds) {
    tweenPlanet(solarobject.clouds, x, y, z);
  }
};

const animate = (time) => {
  stats.begin();

  updateCamera();
  system.earth.body.rotation.y += .0009;
  system.earth.clouds.rotation.y += 0.0008;
  system.earth.lights.rotation.y += 0.0009;
  system.mercury.body.rotation.y += 0.009;
  system.venus.body.rotation.y += 0.0099;
  system.moon.body.rotation.y += 0.0009;
  system.mars.body.rotation.y += .0007;
  system.mars.clouds.rotation.y += 0.0009;

  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4().multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(matrix);

  if (!frustum.containsPoint(system.sun.body.position)) {
    system.sun.body.visible = false;
  } else {
    system.sun.body.visible = true;
  }

  runOrbit('earth', frustum);
  runOrbit('moon', frustum);
  runOrbit('mercury', frustum);
  runOrbit('venus', frustum);
  runOrbit('mars', frustum);

  state.renderer.render(toRaw(state.scene), state.camera);
  tweengroup.update(time);

  stats.end();

  requestAnimationFrame(animate);
};

const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

const onWindowResize = () => {
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
};

const onDocumentMouseDown = (event) => {
  mouse.x = (event.clientX / state.renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / state.renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, state.camera);

  var intersects = raycaster.intersectObjects(state.scene.children);
  if (intersects.length > 0 && intersects[0].object.callback) {
    if (!(state.focus.name && (intersects[0].object.name == state.focus.name))) {
      intersects[0].object.callback(intersects[0].object);
    }
  }
};

const objectClicked = (mesh) => {
  focusObject(mesh);
};

const updateCamera = () => {
  state.controls.enabled = state.freelook;
  if (state.freelook) return;
  let focusObj = state.focus;

  if (state.focus.name == 'sun') {
    player.offset = {
      x: 1,
      y: 5,
      z: 5
    };
  }

  //creating an offset position for camera with respect to the car
  var offset = new THREE.Vector3(focusObj.position.x - player.offset.x, focusObj.position.y + player.offset.y, focusObj.position.z + player.offset.z);

  //create delay position value for enable smooth transition for camera
  state.camera.position = offset;

  state.camera.lookAt(focusObj.position.x, focusObj.position.y, focusObj.position.z);

  state.controls.target.set(focusObj.position.x, focusObj.position.y, focusObj.position.z);

  state.camera.updateProjectionMatrix();
};

const focusObject = (focusObj, x = 1, y = 2, z = 2) => {
  state.focus = focusObj;
  // if (focus.name == this.focus.name) return
  if (state.focus.name == 'sun') {
    let rate = amplifyview.value;
    x *= rate;
    y *= rate;
    z *= rate;
  }

  //creating an offset position for camera with respect to the car
  var offset = new THREE.Vector3(focusObj.position.x - x, focusObj.position.y + y, focusObj.position.z + z);

  //create delay position value for enable smooth transition for camera
  state.camera.position.lerp(offset, 1);

  //updating lookat alway look at the car

  state.camera.lookAt(focusObj.position.x, focusObj.position.y, focusObj.position.z);

  state.controls.target.set(focusObj.position.x, focusObj.position.y, focusObj.position.z);

  state.camera.updateProjectionMatrix();
};

const setupControls = () => {
  let delta = 1;
  event.keydown = document.addEventListener('keydown', (fn) => {
    let keycode = fn.code;
    switch (keycode) {
      case 'KeyA':
        player.offset.x = player.offset.x - delta;
        break;
      case 'KeyW':
        player.offset.z = player.offset.z - delta;
        break;
      case 'KeyD':
        player.offset.x = player.offset.x + delta;
        break;
      case 'KeyS':
        player.offset.z = player.offset.z + delta;
        break;
      case 'ControlLeft':
        player.offset.y = player.offset.y - delta;
        break;
      case 'Space':
        player.offset.y = player.offset.y + delta;
        break;
    }
  });
};

onMounted(() => {
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  init();
  setupControls();
  event.click = window.addEventListener('click', onDocumentMouseDown, false);
  animate();
});

onBeforeUnmount(() => {
  window.removeEventListener('click', onDocumentMouseDown);
  window.removeEventListener('keydown', event.keydown);
});

</script>

<style scoped>
#wrap {
  position: relative;
}

#container {
  width: calc(100vw - 10px);
  height: calc(100vh - 10px);
  border: red 2px solid;
}

.control-panel {
  border-radius: 6px;
  background-color: rgb(255, 255, 255);
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 140px;
}

.sbtn {
  margin: 10px;
  padding: 10px;
  background-color: #ccc;
  border-radius: 6px;
  width: 100px;
  cursor: pointer;
  transition: all .2s ease;
}

.sbtn:hover {
  background-color: rgb(122, 120, 120);
  color: #fff;
  transition: all .2s ease;
}

.object-panel {
  border-radius: 6px;
  background-color: #e3e3e3;
  position: fixed;
  top: 10px;
  left: 10px;
  width: 500px;
}
</style>
