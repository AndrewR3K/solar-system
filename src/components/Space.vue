<template>
    <div>
      <div id="container"></div>
      <div class="control-panel">
        <div class="sbtn" @click="freelook = !freelook"> {{freelook ? 'Focus' : 'Freelook'}}</div>
        <div class="sbtn" @click="setSolarView" :style="{'background-color': freelook ? '' : '#7e3030', 'color': freelook ? '' : '#fff'}">Solar View</div>
        <!-- <div>Time: {{tick.toFixed(2)}}</div> -->
      </div>
      <div class="object-panel" v-if="focusedData && !freelook">
        <h2>{{focusedData.info.name}}</h2>
        <p style="padding: 30px; padding-top: 0px;">{{focusedData.info.description}}</p>
      </div>
    </div>
</template>

<script>
import {PCFSoftShadowMap, Frustum, Matrix4, Vector2, Raycaster, PerspectiveCamera, Scene, PointLight, WebGLRenderer, Fog, SphereGeometry, MeshPhongMaterial, MeshBasicMaterial, TextureLoader, Mesh, Object3D, sRGBEncoding, AdditiveBlending, CubeTextureLoader, Vector3 } from 'three'
import TWEEN from '@tweenjs/tween.js'
import Stats from 'stats.js'
import { OrbitControls } from '../helpers/OrbitControls'

export default {
  name: 'Space',
  data() {
    return {
      stats: new Stats(),
      tick: 0,
      player: {
        offset: {
          x: 5,
          y: 10,
          z: 10
        }
      },
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      freelook: true,
      solarview: false,
      focus: null,
      system: {
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
      },
      mouse: new Vector2(),
      raycaster: new Raycaster(),
      amplifyview: 4,
      event: {
        click: null,
        resize: null,
        keydown: null
      }
    }
  },
  watch: {
    freelook () {
      this.player.offset = {
        x: 1,
        y: 2,
        z: 2
      }
    }
  },
  computed: {
    focusedData() {
      if (!this.focus) return null

      let name = this.focus.name
      return this.system[name]
    }
  },
  methods: {
    setSolarView() {
      if (!this.freelook) return
      this.amplifyview = 60
      this.focusObject(this.system.sun.body, 0, 1, 0)
      this.amplifyview = 4
    },
    init: function() {
      let container = document.getElementById('container');

     // Setup Camera
      let width = window.innerWidth;
      let height = window.innerHeight;


      this.camera = new PerspectiveCamera(45, width/height, 1, 10000);

      // User Controls
      this.controls = new OrbitControls(this.camera, container);
      this.controls.target.set(0, 0, 0);
      this.controls.enabled = true;
      this.controls.minDistance = 8;
      this.controls.maxDistance = 1500;
      this.controls.update();


      this.scene = new Scene();

      // Create a PointLight with the color white (0xffffff), intensity of 10, and distance of 10
      let lightsource = new PointLight( 0xffffff, 2, 10000, 2);
      lightsource.position.set( 0, 0, 0 );
      // Add the light to the scene
      this.scene.add( lightsource );

      this.renderer = new WebGLRenderer({antialias: false,  powerPreference: "high-performance"});
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      
      // Shadows
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap;

      // Fog
      this.scene.fog = new Fog( 0x23272a, 0.5, 1700, 4000 );

      this.createSystem()

      let dome = this.renderer.domElement

      dome.height = 324
      dome.width = 576

      // dome.style.transformOrigin = '0 0'; //scale from top left
      // dome.style.transform = 'scale(' + dome.width/dome.height + ')';

      this.camera.aspect = (dome.width- 10)/(dome.height- 10);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth - 10, window.innerHeight - 10)

      console.log(dome)

      container.appendChild(dome);
    },
    createSystem () {
      const textureLoader = new TextureLoader();
      
      // Sun
      const sungeometry = new SphereGeometry( this.system.sun.size, 32, 32 );
      const sunmaterial = new MeshPhongMaterial({
        map: textureLoader.load("/images/2k_sun.jpg"),
        emissive: 0xffffff,
        emissiveMap: textureLoader.load("/images/2k_sun.jpg"),
        emissiveIntensity: 1.2
      });

      this.system.sun.body = new Mesh( sungeometry, sunmaterial );
      this.system.sun.body.callback = this.objectClicked
      this.system.sun.body.name = 'sun'
      this.scene.add(this.system.sun.body);


      // Mercury
      const mergeometry = new SphereGeometry( this.system.mercury.size, 32, 32 );
      const mermaterial = new MeshPhongMaterial({
        map: textureLoader.load("/images/textures/mercury_texture.jpg"),
        bumpMap: textureLoader.load("/images/mercurybump.jpg"),
        bumpScale:   0.05,
      });

      this.system.mercury.body = new Mesh( mergeometry, mermaterial );
      this.system.mercury.body.callback = this.objectClicked
      this.system.mercury.body.name = 'mercury'
      this.scene.add(this.system.mercury.body);

      var mercuryPivot = new Object3D();
      this.system.sun.body.add( mercuryPivot );

      mercuryPivot.add(this.system.mercury.body);

      // Venus
      const venusmaterial = new MeshPhongMaterial({
        map: textureLoader.load("/images/textures/venus_texture.jpg"),
        bumpMap: textureLoader.load("/images/venusbump.jpg"),
        bumpScale:   0.05,
      });

      this.system.venus.body = new Mesh( mergeometry, venusmaterial );
      this.system.venus.body.callback = this.objectClicked
      this.system.venus.body.name = 'venus'
      this.scene.add(this.system.venus.body);

      var venusPivot = new Object3D();
      this.system.sun.body.add( venusPivot );

      venusPivot.add(this.system.venus.body);

      // Earth
      const geometry = new SphereGeometry( this.system.earth.size, 32, 32 );
      const material = new MeshPhongMaterial({
        map: textureLoader.load("/images/2_no_clouds_4k.jpg"),
        bumpMap: textureLoader.load("/images/elev_bump_4k.jpg"),
        bumpScale:   0.05,
        specularMap: textureLoader.load("/images/water_4k.jpg"),
        // color: 0xaaaaaa,
        specular: 0xffffff,
        shininess: 25
      });

      this.system.earth.body = new Mesh( geometry, material );
      this.system.earth.body.rotation.x = .004;
      this.system.earth.body.callback = this.objectClicked
      this.system.earth.body.name = 'earth'
      this.scene.add(this.system.earth.body);

      var earthPivot = new Object3D();
      this.system.sun.body.add( earthPivot );

      earthPivot.add(this.system.earth.body);

      const earthLights = textureLoader.load( '/images/earth_lights_lrg.jpg' );
      earthLights.encoding = sRGBEncoding;

      const earthLightsMat = new MeshBasicMaterial( {
          color: 0xffffff,
          blending: AdditiveBlending,
          transparent: true,
          depthTest: false,
          map: earthLights,
      });

      this.system.earth.lights = new Mesh( geometry, earthLightsMat );
      this.system.earth.lights.rotation.x = .004;
      this.system.earth.lights.callback = this.objectClicked
      this.system.earth.lights.name = 'earth'
      this.scene.add(this.system.earth.lights);
    
      //Clouds
      var cloudGeometry = new SphereGeometry(this.system.earth.size + 0.003,  32, 32);
      var cloudMaterial = new MeshPhongMaterial({
        map: textureLoader.load("/images/clouds_2.jpg"),
        transparent: true,
        // depthTest: false,
        opacity: 0.6,
        shininess: 0,
        color: 0xffffff
      });
      this.system.earth.clouds = new Mesh(cloudGeometry, cloudMaterial);
      this.scene.add(this.system.earth.clouds);
      this.system.earth.clouds.callback = this.objectClicked
      this.system.earth.clouds.name = 'earth'

      // Set Earth Default Location
      // this.movePlanet('earth', 200, 0, 0)

      //Moon 
      var moonGeometry = new SphereGeometry(this.system.moon.size, 32,32);
      var moonMaterial = new MeshPhongMaterial({
        map: textureLoader.load("/images/moonmap1k.jpg"),
        bumpMap: textureLoader.load("/images/moonbump1k.jpg"),
        bumpScale:   0.05,
        transparent: false,
        shininess: .5
      });
      this.system.moon.body = new Mesh(moonGeometry, moonMaterial);
      this.system.moon.body.position.set(35, this.system.earth.body.position.y, this.system.earth.body.position.z);
      this.system.moon.body.callback = this.objectClicked
      this.system.moon.body.name = 'moon'
      this.scene.add(this.system.moon.body);

      var moonPivot = new Object3D();
      this.system.earth.body.add( moonPivot );

      moonPivot.add(this.system.moon.body);

      // Mars
      const marsmaterial = new MeshPhongMaterial({
        map: textureLoader.load("/images/mars2k.jpg"),
        bumpMap: textureLoader.load("/images/mars2k_topo.jpg"),
        bumpScale:   0.06,
      });

      this.system.mars.body = new Mesh( geometry, marsmaterial );
      this.system.mars.body.callback = this.objectClicked
      this.system.mars.body.name = 'mars'
      this.scene.add(this.system.mars.body);

      var marsPivot = new Object3D();
      this.system.sun.body.add( marsPivot );

      marsPivot.add(this.system.mars.body);

      // Mars Clouds
      var marscloudMaterial = new MeshPhongMaterial({
        map: textureLoader.load("/images/marswinds.jpg"),
        transparent: true,
        // depthTest: false,
        opacity: 0.6,
        shininess: 0,
        color: 0xffffff
      });
      this.system.mars.clouds = new Mesh(cloudGeometry, marscloudMaterial);
      this.scene.add(this.system.mars.clouds);
      this.system.mars.clouds.callback = this.objectClicked
      this.system.mars.clouds.name = 'mars'


      //Star Skybox
      const loader = new CubeTextureLoader();
      const texture = loader.load([
        '/skyboxes/skybox1/1.png', //left
        '/skyboxes/skybox1/3.png', //right
        '/skyboxes/skybox1/5.png', //top
        '/skyboxes/skybox1/6.png', //bottom
        '/skyboxes/skybox1/2.png', //back
        '/skyboxes/skybox1/4.png', //front
      ]);
      this.scene.background = texture;
      // this.focusObject(this.system.sun.body)
      this.setSolarView()

// TODO: REplace with real LOD https://threejs.org/docs/#api/en/objects/LOD
      // Every 30 seconds check distances to draw out mesh's to conserve resources
      // setInterval(() => {
      //   if(this.camera.position.distanceToSquared(this.system.earth.clouds.position) < 900000) {
      //     this.system.earth.clouds.visible = true;
      //   } else {
      //     this.system.earth.clouds.visible = false;
      //   }

      //   if(this.camera.position.distanceToSquared(this.system.earth.lights.position) < 60000) {
      //     this.system.earth.lights.visible = true;
      //   } else {
      //     this.system.earth.lights.visible = false;
      //   }

      //   if(this.camera.position.distanceToSquared(this.system.mars.clouds.position) < 900000) {
      //     this.system.mars.clouds.visible = true;
      //   } else {
      //     this.system.mars.clouds.visible = false;
      //   }

      //   if(this.camera.position.distanceToSquared(this.system.sun.body.position) < 1200000) {
      //     this.system.moon.body.visible = true;
      //     // this.system.mercury.body.visible = true;
      //   } else {
      //     this.system.moon.body.visible = false;
      //     // this.system.mercury.body.visible = false;
      //   }
      // }, 500);
    },
    tweenPlanet (mesh, x, y, z) {
      new TWEEN.Tween(mesh.position) // Create a new tween that modifies 'coords'.
        .to({x: x, y:y, z:z}, 1) // Move to (x, y, z) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
           
        })
        .start() // Start the tween immediately.
    },
    movePlanet (name, x, y, z) {
      this.tweenPlanet(this.system[name].body, x, y, z)
      

      if (this.system[name].clouds) {
        this.tweenPlanet(this.system[name].clouds, x, y, z)
      }

      if (this.system[name].lights) {
        this.tweenPlanet(this.system[name].lights, x, y, z)
      }
    },
    runOrbit (name, frustum) {
      let solarobject =  this.system[name]

      // Check if Orbital is in view
            
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
      let y = solarobject.body.position.y
      let z = solarobject.orbit.r * Math.sin(solarobject.orbit.theta);
      this.tweenPlanet(solarobject.body, x, y, z)
      

      if (solarobject.lights) {
        this.tweenPlanet(solarobject.lights, x, y, z)
      }

      if (solarobject.clouds) {
        this.tweenPlanet(solarobject.clouds, x, y, z)
      }
    },
    animate: function(time) {
      this.stats.begin()

      this.updateCamera()      
      this.system.earth.body.rotation.y += .0009;
      this.system.earth.clouds.rotation.y += 0.0008
      this.system.earth.lights.rotation.y += 0.0009
      this.system.mercury.body.rotation.y += 0.009;
      this.system.venus.body.rotation.y += 0.0099;
      this.system.moon.body.rotation.y += 0.0009
      this.system.mars.body.rotation.y += .0007;
      this.system.mars.clouds.rotation.y += 0.0009

      const frustum = new Frustum()
      const matrix = new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
      frustum.setFromProjectionMatrix(matrix)

      if (!frustum.containsPoint(this.system.sun.body.position)) {
        this.system.sun.visible = false;
      } else {
        this.system.sun.visible = true;
      }

      this.runOrbit('earth', frustum)
      this.runOrbit('moon', frustum)
      this.runOrbit('mercury', frustum)
      this.runOrbit('venus', frustum)
      this.runOrbit('mars', frustum)

      this.renderer.render(this.scene, this.camera);
      TWEEN.update(time)

      this.stats.end()

      requestAnimationFrame(this.animate);
    },
    resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    onDocumentMouseDown( event ) {
      this.mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

      this.raycaster.setFromCamera( this.mouse, this.camera );

      var intersects = this.raycaster.intersectObjects( this.scene.children ); 
      if ( intersects.length > 0 && intersects[0].object.callback) {
        if (!(this.focus.name && (intersects[0].object.name == this.focus.name))) {
          intersects[0].object.callback(intersects[0].object);
        }
      }
    },
    objectClicked(mesh) {
      this.focusObject(mesh)
    },
    updateCamera() {
      this.controls.enabled = this.freelook
      if (this.freelook) return
      let focus = this.focus

      if (this.focus.name == 'sun') {
        this.player.offset = {
          x: 1, 
          y: 5,
          z: 5
        }
      }

      //creating an offset position for camera with respect to the car
      var offset = new Vector3(focus.position.x - this.player.offset.x, focus.position.y  + this.player.offset.y, focus.position.z + this.player.offset.z);
      
      //create delay position value for enable smooth transition for camera 
      this.camera.position = offset

      this.camera.lookAt(focus.position.x, focus.position.y, focus.position.z);

      this.controls.target.set(focus.position.x, focus.position.y, focus.position.z);

      this.camera.updateProjectionMatrix();
    },
    focusObject(focus, x = 1, y = 2, z = 2){
      this.focus = focus
      // if (focus.name == this.focus.name) return
      if (this.focus.name == 'sun') {
        let rate = this.amplifyview
        x *= rate
        y *= rate
        z *= rate
      }

      //creating an offset position for camera with respect to the car
      var offset = new Vector3(focus.position.x - x, focus.position.y  + y, focus.position.z + z);
      
      //create delay position value for enable smooth transition for camera 
      this.camera.position.lerp(offset, 1);
      
      //updating lookat alway look at the car

      this.camera.lookAt(focus.position.x, focus.position.y, focus.position.z);

      this.controls.target.set(focus.position.x, focus.position.y, focus.position.z);

      this.camera.updateProjectionMatrix();
    },
    setupControls() {
      let delta = 1
      this.event.keydown = document.addEventListener('keydown', (fn) => {
        let keycode = fn.code
        switch(keycode){
          case 'KeyA': //left arrow
            this.player.offset.x = this.player.offset.x - delta;
            break;
          case 'KeyW': // up arrow
            this.player.offset.z = this.player.offset.z - delta;
            break;
          case 'KeyD': // right arrow
            this.player.offset.x = this.player.offset.x + delta;
            break;
          case 'KeyS': //down arrow
            this.player.offset.z = this.player.offset.z + delta;
            break;
          case 'ControlLeft': //down arrow
            this.player.offset.y = this.player.offset.y - delta;
            break;
          case 'Space': //down arrow
            this.player.offset.y = this.player.offset.y + delta;
            break;
        }
      });
    }
  },
  mounted() {
    this.stats.showPanel( 0 )
    document.body.appendChild( this.stats.dom );

    this.init();
    this.setupControls()
    this.event.click = window.addEventListener('click', this.onDocumentMouseDown, false);
    // this.event.resize = window.addEventListener('resize', this.onWindowResize, false)
    this.animate();
  },
  destroyed() {
    window.removeEventListener('click', null)
    // window.removeEventListener(this.event.resize)
    window.removeEventListener('keydown', null)
  }
}
</script>

<style scoped>
  #wrap {
    position: relative;
  }

  #container {
    width:  calc(100vw - 10px);
    height: calc(100vh - 10px);
    /* position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); */

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