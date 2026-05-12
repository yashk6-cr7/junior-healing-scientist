/**
 * PhysicsEngine.js — Matter.js setup for liquid/object physics
 * Used in preparation bowl and dosage measuring cup.
 */
import Matter from 'matter-js'

let engine = null
let world = null
let runner = null

export const PhysicsEngine = {
  init() {
    engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.2 },
    })
    world = engine.world
    return { engine, world }
  },

  getEngine() { return engine },
  getWorld() { return world },

  startRunner() {
    if (runner) return
    runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine)
  },

  stopRunner() {
    if (runner) {
      Matter.Runner.stop(runner)
      runner = null
    }
  },

  addBody(body) {
    if (world) Matter.Composite.add(world, body)
  },

  removeBody(body) {
    if (world) Matter.Composite.remove(world, body)
  },

  clear() {
    if (world) Matter.Composite.clear(world)
    if (engine) Matter.Engine.clear(engine)
    if (runner) {
      Matter.Runner.stop(runner)
      runner = null
    }
    engine = null
    world = null
  },
}
