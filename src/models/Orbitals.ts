import { v4 as uuidv4 } from 'uuid'

export class Orbital {
  id: string
  timeToOrbit: number
  orbitalDistance: number
  children: [Orbital?]
  type: string
  parent: Orbital | null

  constructor() {
    this.id = uuidv4()
    this.timeToOrbit = 1
    this.children = []
    this.type = ''
    this.orbitalDistance = 0
    this.parent = null
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

  public calcOrbitalDistance = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000000 * 1000
  }

  public calcOrbitTimeForDistance(): number {
    const G = BigInt(667430000000) // Gravitational constant
    const M = BigInt(20000000000000) // Mass of the star or central object

    // Calculate orbital time based on the distance
    const orbitalTime = Math.sqrt(
      ((4 * Math.PI ** 2) / (Number(G) * Number(M))) * Number(this.orbitalDistance) ** 3,
    )

    return orbitalTime
  }
}

export class Star extends Orbital {
  constructor() {
    super()

    this.type = 'star'
  }
}

export class Moon extends Orbital {
  constructor() {
    super()

    this.type = 'moon'
  }
}

export class Planet extends Orbital {
  constructor() {
    super()

    this.type = 'planet'
  }

  public generate = (maxMoons: number) => {
    this.orbitalDistance = this.calcOrbitalDistance(20, 2000) // 20-2000 mill M
    this.timeToOrbit = this.calcOrbitTimeForDistance()

    //Generate Moons
    const m = Math.floor(Math.random() * (maxMoons + 1))
    for (let i = 0; i < m; i++) {
      const moon = new Moon()
      moon.orbitalDistance = this.calcOrbitalDistance(20, 50) // 10-50 million kilometers
      moon.timeToOrbit = moon.calcOrbitTimeForDistance()

      this.addChild(moon)
    }
  }
}

export class SolarSystem extends Orbital {
  myStar: Star | null

  constructor() {
    super()

    this.myStar = null
  }

  public generate = (maxPlanets: number, maxMoons: number) => {
    //Generate a single star
    this.myStar = new Star()
    this.type = 'solarSystem'
    this.addChild(this.myStar)

    //Generate random amount of planets
    let planetCount = Math.random() * (maxPlanets - 1) + 1
    for (let i = 0; i < planetCount; i++) {
      const planet = new Planet()
      planet.generate(maxMoons)

      this.myStar.addChild(planet)
    }
  }
}

export class Galaxy extends Orbital {
  solarSystems: [SolarSystem?]
  constructor() {
    super()
    this.solarSystems = []
  }

  public generate = (systemCount: number, finished: () => void) => {
    this.orbitalDistance = this.calcOrbitalDistance(20, 2000) // 20-2000 mill M
    this.timeToOrbit = this.calcOrbitTimeForDistance()

    //Generate Moons
    for (let i = 0; i < systemCount; i++) {
      const system = new SolarSystem()
      system.generate(11, 6)

      this.solarSystems.push(system)
    }

    finished()
  }
}
