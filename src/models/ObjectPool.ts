export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T

  constructor(createFn: () => T) {
    this.createFn = createFn
  }

  acquire(): T {
    return this.pool.length > 0 ? this.pool.pop()! : this.createFn()
  }

  release(obj: T): void {
    this.pool.push(obj)
  }
}
