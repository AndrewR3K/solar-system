// @ts-ignore
import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'
import { ObjectPool } from './ObjectPool'

const getRandomNumber = (max: number, min: number) => {
  return Math.random() * (max - min) + min
}

const createMaterial = (color: number, emissive: number = 0, roughness: number = 0.5) => {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissive ? 1 : 0, // Adjust emissive intensity
    roughness,
    metalness: 0.5, // Add metalness property
  })
}

const starMaterial = createMaterial(0xffffff, 0xffffff)
const planetMaterial = createMaterial(0x00ff00, 0, 0.5) // Adjust color and roughness
const moonMaterial = createMaterial(0x888888, 0, 0.5) // Adjust color and roughness

const orbitalPool = new ObjectPool<Orbital>(() => new Orbital(null))
const starPool = new ObjectPool<Star>(() => new Star(10, 1, null))
const planetPool = new ObjectPool<Planet>(() => new Planet(null))
const moonPool = new ObjectPool<Moon>(() => new Moon(undefined, 2, 1, null))

export class Orbital {
  id: string
  children: [Orbital?]
  type: string
  parent: Orbital | null
  size: number
  position: THREE.Vector3
  color: number
  body: any
  scene: any

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

  public static acquire(scene: any): Orbital {
    const orbital = orbitalPool.acquire()
    orbital.scene = scene
    return orbital
  }

  public static release(orbital: Orbital): void {
    orbital.scene = null
    orbitalPool.release(orbital)
  }

  calculateDistance(camera: THREE.PerspectiveCamera, object: THREE.Object3D): number {
    return camera.position.distanceTo(object.position)
  }

  public isOverlapping(position: THREE.Vector3, size: number): boolean {
    const threshold = size * 2 // Define a threshold for overlap detection
    for (const child of this.children) {
      if (child && child.position.distanceTo(position) < threshold) {
        return true
      }
    }
    return false
  }

  public createBody(type: string, scene: any) {
    let material, geometry
    const size = this.size
    const color = this.getRandomColor(type)

    switch (type) {
      case 'star':
        material = starMaterial.clone()
        material.emissive.set(color)
        break
      case 'planet':
        material = planetMaterial.clone()
        break
      case 'moon':
        material = moonMaterial.clone()
        break
      default:
        throw new Error(`Unknown type: ${type}`)
    }

    material.color.set(color)
    geometry = new THREE.SphereGeometry(size, 32, 32)
    this.body = new THREE.Mesh(geometry, material)
    this.body.position.copy(this.position)
    scene.add(this.body)
    return this.body
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
    const colors: { [key: string]: number[] | (() => number) } = {
      star: [0xff4500, 0xffd700, 0xffffe0, 0xffffff, 0xb0e0e6],
      warm: () =>
        (Math.floor(Math.random() * 256) << 16) |
        (Math.floor(Math.random() * 128) << 8) |
        Math.floor(Math.random() * 64),
      cool: () =>
        (Math.floor(Math.random() * 64) << 16) |
        (Math.floor(Math.random() * 128) << 8) |
        Math.floor(Math.random() * 256),
      moon: () => {
        const grey = Math.floor(Math.random() * 256)
        return (grey << 16) | (grey << 8) | grey
      },
    }

    if (type in colors) {
      return Array.isArray(colors[type])
        ? colors[type][Math.floor(Math.random() * colors[type].length)]
        : colors[type]()
    }

    return Math.floor(Math.random() * 16777215)
  }

  public updateVisibility(camera: THREE.PerspectiveCamera, renderDistance: number) {
    const distance = this.calculateDistance(camera, this.body)
    this.body.visible = distance < renderDistance

    // Frustum culling
    const frustum = new THREE.Frustum()
    const cameraViewProjectionMatrix = new THREE.Matrix4()
    camera.updateMatrixWorld()
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix)

    this.body.visible = frustum.intersectsObject(this.body)
  }

  public updateOrbit(time: number) {
    if (this.parent) {
      let distance = this.position.distanceTo(this.parent.position)

      if (distance === 0) return // Ensure distance is not zero
      const orbitalPeriod = Math.sqrt(distance ** 3) // Kepler's third law approximation
      const angle = (time / (orbitalPeriod * 1000)) * 2 * Math.PI // Scale down the time to slow down the orbiting speed
      const initialPosition = this.position.clone().sub(this.parent.position)
      const rotatedPosition = new THREE.Vector3(
        initialPosition.x * Math.cos(angle) - initialPosition.z * Math.sin(angle),
        initialPosition.y,
        initialPosition.x * Math.sin(angle) + initialPosition.z * Math.cos(angle),
      )
      this.position.copy(this.parent.position).add(rotatedPosition)
      this.body.position.copy(this.position)
    }
  }
}

export class Star extends Orbital {
  constructor(max: number = 10, min: number = 1, scene: any) {
    super(scene)

    this.type = 'star'
    this.size = getRandomNumber(max, min)
    this.position = new THREE.Vector3(0, 0, 0)
  }

  public static acquire(scene: any): Star {
    const star = starPool.acquire()
    star.scene = scene
    return star
  }

  public static release(star: Star): void {
    star.scene = null
    starPool.release(star)
  }

  public generate = () => {
    let attempts = 0
    do {
      const minCenter = getRandomNumber(100, 10)
      const sunDistance = getRandomNumber(90000, minCenter)
      const sunradius = Math.random() * (sunDistance * 2) + this.size
      const sunangle = Math.random() * Math.PI * 2
      const sunY = Math.random() * sunDistance - sunDistance / 2
      this.position.set(sunradius * Math.cos(sunangle), sunY, sunradius * Math.sin(sunangle))
      attempts++
    } while (this.isOverlapping(this.position, this.size) && attempts < 10)

    this.createBody(this.type, this.scene)

    const starLight = new THREE.PointLight(this.color, 10000, 900000)
    starLight.position.copy(this.position)
    this.scene.add(starLight)
  }

  public update = (camera: THREE.PerspectiveCamera) => {
    this.updateVisibility(camera, 10000)
  }
}

export class Moon extends Orbital {
  constructor(
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    max: number = 2,
    min: number = 1,
    scene: any,
  ) {
    super(scene)

    this.type = 'moon'
    this.size = getRandomNumber(max, min)
    this.position = position
  }

  public static acquire(scene: any): Moon {
    const moon = moonPool.acquire()
    moon.scene = scene
    return moon
  }

  public static release(moon: Moon): void {
    moon.scene = null
    moonPool.release(moon)
  }

  public generate = (parentSize: number, parentPosition: THREE.Vector3) => {
    let attempts = 0
    do {
      const distance = getRandomNumber(10, 3)
      const radius = distance + this.size + parentSize // Ensure radius is not zero
      const angle = Math.random() * Math.PI * 2
      const y = Math.random() * distance - distance / 2

      this.position.set(
        parentPosition.x + radius * Math.cos(angle),
        parentPosition.y + y,
        parentPosition.z + radius * Math.sin(angle),
      )
      attempts++
    } while (this.isOverlapping(this.position, this.size) && attempts < 10)

    this.createBody(this.type, this.scene)
  }

  public update = (camera: THREE.PerspectiveCamera, time: number) => {
    this.updateVisibility(camera, 1000)
    this.updateOrbit(time)
  }
}

export class Planet extends Orbital {
  constructor(scene: any) {
    super(scene)

    this.type = 'planet'
    this.size = getRandomNumber(1, 0.1)
    this.position = new THREE.Vector3(0, 0, 0)
  }

  public static acquire(scene: any): Planet {
    const planet = planetPool.acquire()
    planet.scene = scene
    return planet
  }

  public static release(planet: Planet): void {
    planet.scene = null
    planetPool.release(planet)
  }

  public generate = (maxMoons: number, starSize: number, starPosition: THREE.Vector3) => {
    let attempts = 0
    do {
      const distance = Math.floor(Math.random() * 71) + 50
      const radius = Math.random() * (distance * 2) + starSize
      const angle = Math.random() * Math.PI * 2
      const planetY = Math.random() * distance - distance / 2

      const newPosition = new THREE.Vector3(
        starPosition.x + radius * Math.cos(angle),
        starPosition.y + planetY,
        starPosition.z + radius * Math.sin(angle),
      )

      const distanceFromStar = starPosition.distanceTo(newPosition)

      this.size = Math.min(distanceFromStar / starSize / 4, 6)

      this.position.copy(newPosition)

      if (distanceFromStar < 40 || this.size < 2) {
        maxMoons = 0
      }
      attempts++
    } while (this.isOverlapping(this.position, this.size) && attempts < 10)

    this.createBody(this.type, this.scene)

    for (let i = 0; i < Math.floor(Math.random() * (maxMoons + 1)); i++) {
      const moon = Moon.acquire(this.scene)
      moon.generate(this.size, this.position)
      this.addChild(moon)
    }
  }

  public update = (camera: THREE.PerspectiveCamera, time: number) => {
    this.updateVisibility(camera, 4000)
    this.updateOrbit(time)
  }
}

export class SolarSystem extends Orbital {
  myStar: Star | null

  constructor(scene: any) {
    super(scene)
    this.position = new THREE.Vector3(0, 0, 0)
    this.myStar = null
  }

  public generate = (maxPlanets: number, maxMoons: number, existingStars: Star[] = []) => {
    this.type = 'solarSystem'

    // Generate a single star
    let attempts = 0
    do {
      this.myStar = Star.acquire(this.scene)
      this.myStar.generate()

      const isTooClose = existingStars.some(
        (star) => star.position.distanceTo(this.myStar!.position) < 10000,
      )

      if (!isTooClose) {
        break
      }

      Star.release(this.myStar)
      this.myStar = null
      attempts++
    } while (attempts < 10)

    if (this.myStar) {
      this.addChild(this.myStar)

      let planetCount = Math.min(
        8,
        Math.floor(Math.random() * (maxPlanets * (this.myStar.size / 10))),
      )

      // Generate random amount of planets
      for (let i = 0; i < planetCount; i++) {
        const planet = Planet.acquire(this.scene)
        planet.generate(maxMoons, this.myStar.size, this.myStar.position)
        this.myStar.addChild(planet)
      }
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
    const existingStars: Star[] = []

    for (let i = 0; i < systemCount; i++) {
      const system = new SolarSystem(this.scene)
      system.generate(11, 4, existingStars)

      if (system.myStar) {
        existingStars.push(system.myStar)
        this.solarSystems.push(system)
      }
    }

    finished()
  }
}
