import { throttle, fire, limitNumber, worldSize } from '../util'
const throttledFire = throttle(fire, 200)
//Change name of file to init; this file will initialize all unites associated with the game that utilizes sockets

const numberOfEpithelialCells = 20
const numberOfTCells = 15
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
        addPlayer.call(this, players[id])
      } else {
        addOtherPlayers.call(this, players[id])
      }
    })
  })
  this.socket.on('newPlayer', (playerInfo) => {
    addOtherPlayers.call(this, playerInfo)
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
    const cellData = []
    if (!cells || !cells.length) {
      console.log('getting in the if')
      this.epithelialCells = new Array(numberOfEpithelialCells).fill(null).map(() => {
        const randomEpithelialX = Math.floor(Math.random() * (worldSize.x - 100))
        const randomEpithelialY = Math.floor(Math.random() * (worldSize.y - 100))
        const newCell = makeEpithelialCell.call(this, randomEpithelialX, randomEpithelialY)
        newCell.identifier = newCell.body.id
        cellData.push({x: randomEpithelialX, y: randomEpithelialY, tint: null, identifier: newCell.identifier})
        return newCell
      })
      //emit new cells
      this.socket.emit('newEpithelialCells', cellData)
    } else {
      console.log('epithelialCells from server: ', cells)
      this.epithelialCells = cells.map(cell => makeEpithelialCell.call(this, cell.x, cell.y, cell.tint, cell.identifier))
      // TESTING
      const myRedCells = this.epithelialCells.filter(cell => cell.tintBottomLeft === 214)
      const serverRedCells = cells.filter(cell => cell.tint)
      console.log('RED CELL AMOUNT COMPARISON: ', myRedCells.length, serverRedCells.length)
    }
    this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
      const matchingCell = this.epithelialCells.find(cell => (cell.body.id === bodyA.id || cell.body.id === bodyB.id))
      if (bodyA.id === this.ship.body.id || bodyB.id === this.ship.body.id) console.log('there was a collision! matching cell: ', matchingCell)
      if (this.ship && this.ship.tintBottomLeft === 214 && 
        matchingCell &&
        (bodyA.id === this.ship.body.id || bodyB.id === this.ship.body.id)) {
          console.log('something happened!')
        matchingCell.setTint(0xd60000)
        this.socket.emit('changedEpithelialCell', matchingCell.identifier)
      }
      // this.socket.emit('anyCollision', bodyA, bodyB)
    })
  })

  this.socket.on('dormantTCell', (cells) => {
    if(!cells.length) {
      console.log("I WAS CREATED FOR THE FIRST TIME!!!")
      this.dormantTCells = new Array(numberOfTCells).fill(null).map(() => {
        const randomTCellX = Math.floor(Math.random() * (worldSize.x - 100))
        const randomTCellY = Math.floor(Math.random() * (worldSize.y - 100))
        const randomVelocityX = Math.floor(Math.random() * 8 - 4)
        const randomVelocityY = Math.floor(Math.random() * 8 - 4)
        const randomAngularVelocity = Math.random() * 0.5 - 0.25
        return makeTCell.call(this, {
          positionX: randomTCellX, positionY: randomTCellY, 
          velocityX: randomVelocityX, velocityY: randomVelocityY, 
          angle: 0, angularVelocity: randomAngularVelocity
        })
      })
      this.clientDormantTCells = this.dormantTCells // the list of cells for whose behavior the player is responsible
      this.socket.emit('newTCells', this.dormantTCells.map(cell => 
        ({positionX: cell.body.position.x, positionY: cell.body.position.y, 
          velocityX: cell.body.velocity.x, velocityY: cell.body.velocity.y, 
          angle: cell.body.angle, angularVelocity: cell.body.angularVelocity})
      ))
    } else {
      console.log("I was not. I was created by someone else who came before you")
      this.dormantTCells = cells.map(cell => makeTCell.call(
        this, {positionX: cell.positionX, positionY: cell.positionY, 
          velocityX: cell.velocityX, velocityY: cell.velocityY, 
          angle: cell.angle, angularVelocity: cell.angularVelocity, 
          randomDirection: cell.randomDirection, tint: cell.tint}
      ))
      this.clientDormantTCells = []
    }
  })

  this.socket.on('passDormantTCells', passedCells => {
    // for each cell passed on from the disconnecting player, find its corresponding cell in the game...
    const cellsToTransfer = passedCells.map(inputCell => 
      this.dormantTCells.find(cell => 
        !clientDormantTCells.includes(cell) && 
        (cell.body.position.x >= inputCell.positionX - 4 || cell.body.position.x <= inputCell.positionX + 4) && 
        (cell.body.position.y >= inputCell.positionY - 4 || cell.body.position.y <= inputCell.positionY + 4)
      )
    )
    // and add it to the list of cells that the player is responsible for monitoring
    this.clientDormantTCells.concat(cellsToTransfer)
  })

  this.socket.on('changedEpithelialCellClient', identifier => {
    console.log(identifier)
    const correspondingCell = this.epithelialCells.find(cell => cell.identifier === identifier)
    console.log('found corresponding cell: ', correspondingCell)
    correspondingCell.setTint(0xd60000)
  })

}

const shipParams = {
  restitution: 0.9,
  friction: 0.15,
  frictionAir: 0.05
}

function addPlayer(playerInfo) {
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
  this.input.on("pointerdown", (event) => {
    throttledFire.call(this)
  })
}

function addOtherPlayers(playerInfo) {
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

function makeEpithelialCell(x, y, tint, identifier) {
  const cell = this.matter.add.image(
    x,
    y,
    'epithelialCell'
  )
  cell.setRectangle(cell.width, cell.height, {
    isStatic: true,
    ...defaultCellParams
  })
  if (tint) cell.setTint(tint)
  cell.identifier = identifier
  return cell
}

function makeTCell({ positionX, positionY, velocityX, velocityY, angle, angularVelocity, randomDirection, tint } ){
  const cell = this.matter.add.image(
    positionX,
    positionY,
    'dormantTCell'
  )
  console.log("THIS TCELL WHEEEOO: ", positionX, positionY, cell)
  cell.setCircle(cell.width / 2, defaultCellParams)
  console.log('CELL AFTER SET CIRCLE: ', cell)
  cell.setVelocity(velocityX, velocityY)
  console.log('CELL AFTER SET VELOCITY: ', cell)
  cell.randomDirection = randomDirection
  cell.body.angle = angle
  cell.body.angularVelocity = angularVelocity
  console.log('CELL AFTER SET ANGLE AND ANGULAR VELOCITY: ', cell)
  cell.activate = function() {
      this.setVelocity(0, 0) //PLACEHOLDER
      console.log("I'm a good guy now!")
      cell.setTint(0x01c0ff)
      cell.activated = true
    }
  if(tint) cell.setTint(tint)
  return cell
}