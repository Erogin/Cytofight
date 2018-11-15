export function update() {
    if (this.ship) {
      if (this.cursors.left.isDown || this.keyLeft.isDown) {
        this.ship.setAngularVelocity(-150)
      } else if (this.cursors.right.isDown || this.keyRight.isDown) {
        this.ship.setAngularVelocity(150)
      } else {
        this.ship.setAngularVelocity(0)
      }
  
      if (this.cursors.up.isDown || this.keyUp.isDown) {
        this.physics.velocityFromRotation(
          this.ship.rotation + 1.5,
          100,
          this.ship.body.acceleration
        )
      } else if (this.cursors.down.isDown || this.keyDown.isDown) {
        this.physics.velocityFromRotation(
          this.ship.rotation + 1.5,
          100,
          this.ship.body.acceleration
        )
      } else {
        this.ship.setAcceleration(0)
      }
      this.physics.world.wrap(this.ship, 5)
      
      if(this.keyFire.isDown){
  
       console.log("Evangalos")
       setTimeout(fire, 20000)
  
      }
  
      // emit player movement
      const x = this.ship.x
      const y = this.ship.y
      const r = this.ship.rotation
      if (
        this.ship.oldPosition &&
        (x !== this.ship.oldPosition.x ||
          y !== this.ship.oldPosition.y ||
          r !== this.ship.oldPosition.rotation)
      ) {
        this.socket.emit('playerMovement', {
          x: this.ship.x,
          y: this.ship.y,
          rotation: this.ship.rotation
        })
      }
  
      // save old position data
      this.ship.oldPosition = {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation
      }
    }
  }
  
  function fire () {
    console.log("FIRE!!!")
  }