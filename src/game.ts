// Path to follow
const point1 = new Vector3(5, 0, 5)
const point2 = new Vector3(5, 0, 15)
const point3 = new Vector3(15, 0, 15)
const point4 = new Vector3(15, 0, 5)

// Orbit points
const op1 = new Vector3(-0.7, 0, -0.7)
const op2 = new Vector3(-0.9, 0, 0)
const op3 = new Vector3(-0.7, 0, 0.5)
const op4 = new Vector3(-0.3, 0, 0.7)
const op5 = new Vector3(0.3, 0, 0.6)
const op6 = new Vector3(0.9, 0, 0)
const op7 = new Vector3(0.7, 0, -0.3)
const op8 = new Vector3(0.2, 0, -0.6)

const path1: Vector3[] = [point1, point2, point3, point4]

const orbit1: Vector3[] = [op1, op2, op3, op4, op5 ,op6, op7, op8]

export enum State {
 OrbitPath,
 GoingToNext,
 OrbitTarget
}

@Component('fly')
export class Fly {
  state: State = State.OrbitPath
  path: Vector3[] = path1
  orbit: Vector3[] = orbit1
  pathIndex: number = 0
  orbitIndex: number = 0
  fraction: number = 0
}


const fireflies = engine.getComponentGroup(Fly)

// Walk following the points in the path

export class orbit {
  update(dt: number) {
    for (let firefly of fireflies.entities) {
      let transform = firefly.get(Transform)
      let fly = firefly.get(Fly)

      if (fly.state === State.OrbitPath || fly.state === State.OrbitTarget) {
        if (fly.fraction < 1) {
          fly.fraction += dt / 6
          transform.position = Vector3.Lerp(
            fly.orbit[fly.orbitIndex],
            fly.orbit[fly.orbitIndex+1],
            fly.fraction
          )
        } else {
          fly.fraction = 0
          fly.orbitIndex += 1
          if (fly.orbitIndex >= fly.orbit.length) {
            fly.orbitIndex = 0
          }
        }
      }
    }
  }
}

engine.addSystem(new orbit())

// React and stop walking when the user gets close enough

export class FlyAway {
  update(dt: number) {
    for (let firefly of fireflies.entities) {
      let transform = firefly.get(Transform)
      let fly = firefly.get(Fly)

      if (fly.state === State.OrbitPath) {
   
        let dist = distance(transform.position, camera.position)
          if ( dist < 25) {
            fly.state = State.GoingToNext
            fly.fraction = 0
          }
   
       } else if (fly.state === State.GoingToNext) {
          if (fly.fraction < 1) {
            fly.fraction += dt / 6
            transform.position = Vector3.Lerp(
              fly.orbit[fly.orbitIndex],
              fly.path[fly.pathIndex+1],
              fly.fraction
            )
          } else {
            fly.fraction = 0
            fly.pathIndex += 1
            if (fly.pathIndex >= fly.path.length) {
              fly.state = State.OrbitTarget
            } 
            else {
              fly.state = State.OrbitPath
            }                     
          }
       }
    }
  }
}

engine.addSystem(new FlyAway())

// Object that tracks user position and rotation
const camera = Camera.instance

// Add Gnark
let fireFly = new Entity()
fireFly.set(new Transform({
  position: new Vector3(5, 0, 5),
  scale: new Vector3(0.25, 0.25, 0.25),
  rotation: Quaternion.Euler(0, 0, 0)
}))
fireFly.get(Transform)
fireFly.set(new PlaneShape())
fireFly.get(PlaneShape).billboard

// Add animations


// add a path data component
fireFly.set(new Fly())

// Add Gnark to engine
engine.addEntity(fireFly)

// Add 3D model for scenery
const castle = new Entity()
castle.add(new GLTFShape('models/Pirate_Ground.gltf'))
castle.add(new Transform({
  position: new Vector3(10, 0, 10)
}))
engine.addEntity(castle)

// Get distance
/* 
Note:
This function really returns distance squared, as it's a lot more efficient to calculate.
The square root operation is expensive and isn't really necessary if we compare the result to squared values.
We also use {x,z} not {x,y}. The y-coordinate is how high up it is.
*/
function distance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x
  const b = pos1.z - pos2.z
  return a * a + b * b
}