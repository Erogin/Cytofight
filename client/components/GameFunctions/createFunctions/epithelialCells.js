import {worldSize, defaultCellParams} from '../util'

export function epithelialCells(amount) {
  this.socket.on('epithelialCell', cells => {
    const cellData = {}
    this.epithelialCells = {}
    if (!cells || !cells.length) {
      for (let i = 0; i < amount; i++) {
        // Since these are the first cells, the client can handle the ID generation, as there will be no conflicts with preexisting cells
        let checkingOverlap = true
        let randomX, randomY
        while (checkingOverlap) {
          randomX = Math.floor(Math.random() * (worldSize.x - 100)) + 50
          randomY = Math.floor(Math.random() * (worldSize.y - 100)) + 50
          if (
            Object.keys(this.epithelialCells).every(
              id =>
                !this.epithelialCells[id].getBounds().contains(randomX, randomY)
            )
          ) {
            checkingOverlap = false
          }
        }
        cellData[i] = {x: randomX, y: randomY, tint: null, globalId: i}
        this.epithelialCells[i] = makeEpithelialCell.call(this, cellData[i])
      }
      //emit new cells
      this.socket.emit('newEpithelialCells', cellData)
    } else {
      // this.epithelialCells = cells.map(cell => makeEpithelialCell.call(this, cell.x, cell.y, cell.tint, cell.globalId))
      for (let id in cells) {
        this.epithelialCells[id] = makeEpithelialCell.call(this, cells[id])
      }
    }
  })

  this.socket.on('changedEpithelialCellClient', globalId => {
    if (!this.badGuys.epithelialCells[globalId]) {
      this.epithelialCells[globalId].setTint(0xd60000)
      this.badGuys.epithelialCells[globalId] = this.epithelialCells[globalId]
    }
    console.log(
      'red cells socket:',
      Object.keys(this.badGuys.epithelialCells).length
    )
    if (
      Object.keys(this.badGuys.epithelialCells).length ===
      Object.keys(this.epithelialCells).length
    )
      if (this.badGuys.players[this.socket.id]) {
        this.scene.start('Winner')
      } else if (this.goodGuys.players[this.socket.id]) {
        this.scene.start('Loser')
      }
  })

  this.socket.on('deletedEpithelialCell', globalId => {
    this.epithelialCells[globalId].destroy()
    delete this.epithelialCells[globalId]
    delete this.badGuys.epithelialCells[globalId]
    // console.log('RECEIVED DELETION: ', this.badGuys.indexOf(this.epithelialCells[globalId]))
    // this.badGuys.splice(this.badGuys.indexOf(this.epithelialCells[globalId]), 1)
  })
}

export function makeEpithelialCell({x, y, tint, globalId}) {
  const cell = this.matter.add.image(x, y, 'epithelialCell')
  cell.setRectangle(cell.width / 2, cell.height / 2, {
    isStatic: true,
    ...defaultCellParams
  })
  if (tint === 0xd60000) {
    cell.setTint(tint)
    this.badGuys.epithelialCells[globalId] = cell
  }
  cell.globalId = globalId
  cell.health = 200
  return cell
}

export function epithelialCellCollision(bodyA, bodyB) {
  const matchingCellId = Object.keys(this.epithelialCells).find(
    key =>
      this.epithelialCells[key].body.id === bodyA.id ||
      this.epithelialCells[key].body.id === bodyB.id
  )
  if (
    this.ship &&
    this.ship.tintBottomLeft === 214 &&
    this.epithelialCells[matchingCellId] &&
    (bodyA.id === this.ship.body.id || bodyB.id === this.ship.body.id) &&
    !this.badGuys.epithelialCells[matchingCellId]
  ) {
    this.epithelialCells[matchingCellId].setTint(0xd60000)
    this.badGuys.epithelialCells[matchingCellId] = this.epithelialCells[
      matchingCellId
    ]
    this.socket.emit('changedEpithelialCell', matchingCellId)
    console.log('Bad Guys: ', this.badGuys.players)
    if (
      Object.keys(this.badGuys.epithelialCells).length ===
        Object.keys(this.epithelialCells).length &&
      this.badGuys.players[this.socket.id]
    ) {
      this.scene.start('Winner')
    }
  }
}

export function killEpithelialCell(globalId) {
  this.epithelialCells[globalId].destroy()
  delete this.epithelialCells[globalId]
  delete this.badGuys.epithelialCells[globalId]
  this.socket.emit('deleteEpithelialCell')
}
