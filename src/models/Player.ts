export class Player {
  offset: { x: number; y: number; z: number }
  freelooking: boolean

  constructor() {
    this.offset = {
      x: 5,
      y: 10,
      z: 10,
    }
    this.freelooking = false
  }
}
