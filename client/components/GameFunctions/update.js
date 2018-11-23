import { NPCCells } from './createFunctions';
import { limitSpeed, throttle, fire, updateForce } from './util'

const throttledUpdateForce = throttle(updateForce, 2000)

  
const throttledFire = throttle(fire, 200)

export function update(time) {
  // const boundFire = throttledFire.bind(this)

  if (this.ship) {
    // const maxSpeed = 10
    // // const accel = 0.005
    // const velX = this.ship.body.velocity.x
    // const velXMultiplier = (velX < 0 ? -1 : 1 ) * maxSpeed
    // const velY = this.ship.body.velocity.y
    // const velYMultiplier = (velY < 0 ? -1 : 1 ) * maxSpeed
    
    if (this.cursors.left.isDown || this.keyLeft.isDown) {
      // console.log(this.ship.body)
      this.ship.applyForce({x: -0.005, y: 0})
    } if (this.cursors.right.isDown || this.keyRight.isDown) {
      this.ship.applyForce({x: 0.005, y: 0})
    } if (this.cursors.up.isDown || this.keyUp.isDown) {
      this.ship.applyForce({x: 0, y: -0.005})
    } if (this.cursors.down.isDown || this.keyDown.isDown) {
      this.ship.applyForce({x: 0, y: 0.005})
    } 
    if (this.keyDebug.isDown) {
      console.log('ALL T CELLS: ', this.dormantTCells)
      console.log('MY T CELLS: ', this.clientDormantTCells)
    } if (this.keyCreateCell.isDown) {
      this.socket.emit('requestNewTCells', [{positionX: this.ship.body.position.x, positionY: this.ship.body.position.y, velocityX: 0, velocityY: 0, angle: 0, angularVelocity: 1, globalId: 555}])
    }
    
    limitSpeed(this.ship, 8)
    // this.physics.world.wrap(this.ship, 5)
    
    if(this.keyFire.isDown){
      throttledFire.call(this)
    }
    
    // emit player movement
    const { angle, angularVelocity, velocity, position } = this.ship.body
    const { previous } = this.ship
    if (
      previous &&
      // (x !== this.ship.body.positionPrev.x ||
      //   y !== this.ship.body.positionPrev.y ||
      //   r !== this.ship.oldPosition.rotation)
      (previous.angle !== angle ||
      previous.angularVelocity !== angularVelocity ||
      previous.velocity.x !== velocity.x ||
      previous.velocity.y !== velocity.y ||
      previous.position.x !== position.x ||
      previous.position.y !== position.y)
    ) {
      this.socket.emit('playerMovement', {
        // x: this.ship.x,
        // y: this.ship.y,
        // rotation: this.ship.rotation
        angle, velocity, angularVelocity, position
      })
    }

    // save old position data
    this.ship.previous = {
      // x: this.ship.x,
      // y: this.ship.y,
      // rotation: this.ship.rotation
      velocity, angularVelocity
    }
  }
  if(this.clientDormantTCells && Object.keys(this.clientDormantTCells).length){
    throttledUpdateForce(this.clientDormantTCells)
    //   this.dormantTCells.forEach(cell => {
    //   // console.log('RANDOMDIRECTION: ', cell.randomDirection)
    //   cell.applyForce(cell.randomDirection)
    //   // console.log(cell)
    //   limitSpeed(cell, 5)
    // })
    for (let id in this.dormantTCells) {
      const cell = this.dormantTCells[id]
      cell.applyForce(cell.randomDirection)
      limitSpeed(cell, 4)
    }
  }
}
