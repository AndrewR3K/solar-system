// @ts-ignore
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

const getRandomNumber = (max: number, min: number) => {
  return Math.random() * (max - min) + min
}

const starMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 90000
});

const planetMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 100
});

const moonMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 100
});

export class Orbital {
  id: string
  children: [Orbital?]
  type: string
  parent: Orbital | null
  size: number
  position: THREE.Vector3
  color: number
  body: any;
  scene: any;

  constructor(scene: any) {
    this.id = uuidv4()
    this.children = []
    this.type = ''
    this.parent = null
    this.size = 1
    this.position = new THREE.Vector3(0, 0, 0)
    this.color = 0xffffff
    this.body = null
    this.scene = scene
  }

  calculateDistance(camera: THREE.PerspectiveCamera, object: THREE.Object3D): number {
    return camera.position.distanceTo(object.position);
  }

  public createBody(type: string, scene: any) {
    let material, geometry;
    if (type == 'star') {
      this.color = this.getRandomColor('star');
      geometry = new THREE.SphereGeometry(this.size, 32, 32);
      material = starMaterial.clone();
      material.color.set(this.color);
      material.emissive.set(this.color);
    } else if (type == 'planet') {
      this.color = this.getRandomColor('cool');
      geometry = new THREE.SphereGeometry(this.size, 32, 32);
      material = planetMaterial.clone();
      material.color.set(this.color);
    } else if (type == 'moon') {
      this.color = this.getRandomColor('grey');
      geometry = new THREE.SphereGeometry(this.size, 32, 32);
      material = moonMaterial.clone();
      material.color.set(this.color);
    }

    this.body = new THREE.Mesh(geometry, material);
    this.body.position.copy(this.position);
    scene.add(this.body);
    return this.body;
  }

  public addChild = (child: Orbital) => {
    child.parent = this
    this.children.push(child)
  }

  public removeChild = (child: Orbital) => {
    this.parent = null
    let index = this.children.findIndex((c) => {
      return c?.id == child.id
    })

    if (index >= 0) this.children.splice(index, 1)
  }

  public getRandomColor(type: string): number {
    if (type === 'star') {
      // Realistic star colors: red, orange, yellow, white, blue-white
      const colors = [0xff4500, 0xffd700, 0xffffe0, 0xffffff, 0xb0e0e6];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      return this.color;
    }

    if (type === 'warm') {
      // Warm colors range from red to yellow
      const r = Math.floor(Math.random() * 256);
      let g = Math.floor(Math.random() * 128);
      const b = Math.floor(Math.random() * 64);
      this.color = (r << 16) | (g << 8) | b;
      return this.color;
    }

    if (type === 'cool') {
      // Cool colors range from green to blue
      const r = Math.floor(Math.random() * 64);
      const g = Math.floor(Math.random() * 128);
      const b = Math.floor(Math.random() * 256);
      this.color = (r << 16) | (g << 8) | b;
      return this.color;
    }

    if (type === 'grey') {
      // Grey tones range from black to white
      const grey = Math.floor(Math.random() * 256);
      this.color = (grey << 16) | (grey << 8) | grey;
      return this.color;
    }

    this.color = Math.floor(Math.random() * 16777215);
    return this.color;
  }
}

export class Star extends Orbital {
  constructor(max: number = 10, min: number = 1, scene: any) {
    super(scene)

    this.type = 'star'
    this.size = Math.floor(Math.random() * (max - min) + min)
    this.position = new THREE.Vector3(0, 0, 0)
  }

  public generate = () => {
    let minCenter = getRandomNumber(100, 10)
    let sunDistance = getRandomNumber(90000, minCenter) // Random distance from the center of the system

    const sunradius = Math.random() * (sunDistance * 2) + (this.size ?? 1) // Random radius for planet orbit, accounting for size
    const sunangle = Math.random() * Math.PI * 2 // Random angle for planet position
    const sunY = Math.random() * sunDistance - sunDistance / 2 // Random Y position for the star
    this.position = new THREE.Vector3(sunradius * Math.cos(sunangle), sunY, sunradius * Math.sin(sunangle))
    this.createBody(this.type, this.scene)

    // Add light to the star
    const starLight = new THREE.PointLight(this.color, 10000, 900000);
    starLight.position.copy(this.position);
    this.scene.add(starLight);
  }

  public update = () => {
  }
}

export class Moon extends Orbital {
  constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0), max: number = 2, min: number = 1, scene: any) {
    super(scene)

    this.type = 'moon'
    this.size = Math.floor(Math.random() * (max - min) + min)
    this.position = position
  }

  public generate = (distance: number, parentSize: number, parentPosition: { x: number; y: number; z: number; }) => {
    const radius = Math.random() * (distance * 2) + this.size + parentSize // Random radius for moon orbit, accounting for size
    const angle = Math.random() * Math.PI * 2 // Random angle for moon position
    const y = Math.random() * distance - distance / 2 // Random Y position for the planet

    this.position.set(
      parentPosition.x + radius * Math.cos(angle),
      parentPosition.y + y,
      parentPosition.z + radius * Math.sin(angle)
    )

    this.createBody(this.type, this.scene)
  }

  public update = (camera: THREE.PerspectiveCamera) => {
    const distance = this.calculateDistance(camera, this.body);
    const renderDistance = 1000; // Set your desired render distance

    if (distance < renderDistance) {
      this.body.visible = true;
    } else {
      this.body.visible = false;
    }
  }
}

export class Planet extends Orbital {
  constructor(scene: any) {
    super(scene)

    this.type = 'planet'
    this.size = 1
    this.position = new THREE.Vector3(0, 0, 0)
  }

  public generate = (maxMoons: number, starSize: number, starPosition: any) => {
    let distance = Math.floor(Math.random() * (120 - 50 + 1)) + 50 // Random distance from the star
    const radius = Math.random() * (distance * 2) + starSize
    const angle = Math.random() * Math.PI * 2 // Random angle for planet position
    const planetY = Math.random() * distance - distance / 2 // Random Y position for the planet

    const distanceFromStar = starPosition.distanceTo(new THREE.Vector3(
      starPosition.x + radius * Math.cos(angle),
      starPosition.y + planetY,
      starPosition.z + radius * Math.sin(angle)
    ));

    this.size = Math.min((distanceFromStar / starSize) / 4, 6);

    this.position = new THREE.Vector3(
      starPosition.x + radius * Math.cos(angle),
      starPosition.y + planetY,
      starPosition.z + radius * Math.sin(angle)
    )

    if (distanceFromStar < 40 || this.size < 2) {
      maxMoons = 0
    }

    this.createBody(this.type, this.scene)

    //Generate Moons
    const m = Math.floor(Math.random() * (maxMoons + 1))
    for (let i = 0; i < m; i++) {
      const moon = new Moon(this.position, 2, 1, this.scene)
      moon.generate(8, this.size, this.position)

      this.addChild(moon)
    }
  }

  public update = (camera: THREE.PerspectiveCamera) => {
    const distance = this.calculateDistance(camera, this.body);
    const renderDistance = 4000; // Set your desired render distance

    if (distance < renderDistance) {
      this.body.visible = true;
    } else {
      this.body.visible = false;
    }
  }
}

export class SolarSystem extends Orbital {
  myStar: Star | null

  constructor(scene: any) {
    super(scene)
    this.position = new THREE.Vector3(0, 0, 0)
    this.myStar = null
  }

  public generate = (maxPlanets: number, maxMoons: number) => {
    this.type = 'solarSystem'

    //Generate a single star
    this.myStar = new Star(10, 1, this.scene)
    this.myStar.generate()

    this.addChild(this.myStar)

    let planetCount = Math.min(8, Math.floor(Math.random() * (maxPlanets * (this.myStar.size / 10))));

    //Generate random amount of planets
    for (let i = 0; i < planetCount; i++) {
      const planet = new Planet(this.scene)
      planet.generate(maxMoons, this.myStar.size, this.myStar.position)
      this.myStar.addChild(planet)
    }
  }
}

export class Galaxy extends Orbital {
  solarSystems: [SolarSystem?]
  constructor(scene: any) {
    super(scene)
    this.solarSystems = []
  }

  public generate = (systemCount: number, finished: () => void) => {
    //Generate Systems
    for (let i = 0; i < systemCount; i++) {
      const system = new SolarSystem(this.scene)
      system.generate(11, 4)
      this.solarSystems.push(system)
    }

    finished()
  }
}
