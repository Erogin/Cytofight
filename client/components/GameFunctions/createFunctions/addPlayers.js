import { limitNumber, worldSize } from '../util'
//Change name of file to init; this file will initialize all unites associated with the game that utilizes sockets

const numberOfEpithelialCells = 20
const defaultCellParams = {
  restitution: 1,
  friction: 0,
  frictionAir: 0
}

//Initialize the players in the game
//change name of function to init()
//must STILL call with this
export function players() {
  console.log("TOP OF PAGE THIS: ", this)
  // const self = this
  this.socket = io()
  this.otherPlayers = []
  this.socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach((id) => {
      if (players[id].playerId === this.socket.id) {
        addPlayer.call(this, this, players[id])
      } else {
        addOtherPlayers.call(this, this, players[id])
      }
    })
  })
  this.socket.on('newPlayer', (playerInfo) => {
    addOtherPlayers.call(this, this, playerInfo)
  })
  this.socket.on('disconnect', (playerId) => {
    this.otherPlayers.forEach((otherPlayer) => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy()
        this.otherPlayers.filter(() => playerId !== otherPlayer.playerId)
      }
    })
  })
  this.socket.on('playerMoved', ({
    playerId,
    angle,
    position,
    velocity,
    angularVelocity
  }) => {
    this.otherPlayers.forEach((otherPlayer) => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(position.x, position.y)
        otherPlayer.setVelocity(velocity.x, velocity.y)
        otherPlayer.setAngularVelocity(angularVelocity)
        otherPlayer.setAngle(angle)
      }
    })
  })

  this.socket.on('epithelialCell', (cells) => {
    console.log('CELLS OMG', cells)
    if (!cells || !cells.length) {
      console.log('getting in the if')
      this.epithelialCells = new Array(numberOfEpithelialCells).fill(null).map(() => {
        const randomEpithelialX = Math.floor(Math.random() * (worldSize.x - 100))
        const randomEpithelialY = Math.floor(Math.random() * (worldSize.y - 100))
        return makeEpithelialCell.call(this, randomEpithelialX, randomEpithelialY)
      })
      //emit new cells
      console.log("cells: ", this.epithelialCells)
      this.socket.emit('newEpithelialCells', this.epithelialCells)
    } else {
      console.log('epithelialCells: ', this.epithelialCells)
      this.epithelialCells = cells.map(cell => makeEpithelialCell.call(this, cell.x, cell.y, cell.tint))
    }
    this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
      // console.log('collision detected, emitting bodies:', bodyA)
      // console.log('ship id: ', this.ship.body.id)
      // console.log(this.epithelialCells)
      const matchingCell = this.epithelialCells.find(cell => (cell.body.id === bodyA.id || cell.body.id === bodyB.id))
      if (this.ship && matchingCell && (bodyA.id === this.ship.body.id || bodyB.id === this.ship.body.id) && (this.ship.tintBottomLeft === 214)) {
        matchingCell.setTint(0xd60000)
      }
      // this.socket.emit('anyCollision', bodyA, bodyB)
    })
  })

}

const shipParams = {
  restitution: 0.9,
  friction: 0.15,
  frictionAir: 0.05
}

function addPlayer(self, playerInfo) {
  // self.ship = self.physics.add
  //   .image(playerInfo.x, playerInfo.y, 'ship')
  //   .setOrigin(0.5, 0.5)
  //   .setDisplaySize(53, 40)
  const randomX = Math.floor(Math.random() * (worldSize.x - 100))
  const randomY = Math.floor(Math.random() * (worldSize.y - 100))
  this.ship = this.matter.add.image(randomX, randomY, 'ship')
  this.ship.setScale(0.5)
  this.ship.setCircle(this.ship.width / 2, {
    label: 'me',
    ...shipParams
  })
  this.cameras.main.startFollow(this.ship) //******* */
  if (playerInfo.team === 'blue') {
    this.ship.setTint(0xd60000)
  } else {
    this.ship.setTint(0x01c0ff)
  }
  this.input.on("pointermove", function(pointer) {
    // VIEWPORT: 800x, 600y
    const adjustedPointerX = limitNumber(pointer.x + this.ship.x - 400, pointer.x, pointer.x + worldSize.x - 800)
    const adjustedPointerY = limitNumber(pointer.y + this.ship.y - 300, pointer.y, pointer.y + worldSize.y - 600)
    var angle = -Math.atan2(adjustedPointerX - this.ship.x, adjustedPointerY - this.ship.y) * 180 / Math.PI;
    this.ship.angle = angle;
  }, this)
}

function addOtherPlayers(self, playerInfo) {
  // const otherPlayer = self.add
  //   .sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
  //   .setOrigin(0.5, 0.5)
  //   .setDisplaySize(53, 40)
  const randomX = Math.floor(Math.random() * (worldSize.x - 100))
  const randomY = Math.floor(Math.random() * (worldSize.y - 100))
  const otherPlayer = this.matter.add.image(randomX, randomY, 'ship')
  otherPlayer.setScale(0.5);
  otherPlayer.setCircle(otherPlayer.width / 2, shipParams)
  if (playerInfo.team === 'blue') {
    otherPlayer.setTint(0xd60000)
  } else {
    otherPlayer.setTint(0x01c0ff)
  }
  otherPlayer.playerId = playerInfo.playerId
  this.otherPlayers.push(otherPlayer)
}

function makeEpithelialCell(x, y, tint) {
  this.cell = this.matter.add.image(
    x,
    y,
    'epithelialCell'
  )
  this.cell.setRectangle(this.cell.width, this.cell.height, {
    isStatic: true,
    ...defaultCellParams
  })
  if (tint) this.cell.setTint(tint)
  return this.cell
}
