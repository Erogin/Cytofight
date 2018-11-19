import {
  players,
  keyboardControls,
  scoreAndStars,
  NPCCells
} from './createFunctions'

export function preload() {
  this.load.image('click', 'assets/PNG/play.png')
  this.load.image('ship', 'assets/PNG/b_cell.png')
  this.load.image('otherPlayer', 'assets/PNG/whitebloodcell.png')
  this.load.image('star', 'assets/PNG/star_gold.png')
  this.load.image('histamines', 'assets/PNG/Effects/star1.png')
  this.load.image('mastCell', 'assets/PNG/mast_cell.png')
  this.load.image('antibody', 'assets/PNG/antibody.png')
  this.load.image('dormantTCell', 'assets/PNG/whitebloodcell.png')
  this.load.image('epithelialCell', 'assets/PNG/epithelial_cell.png')
}

export function create() {
  const play = this.add.image(400, 300, 'click').setInteractive()
  play.once(
    'pointerup',
    function() {
      play.setVisible(false)
      // PUT IN A SETUP FUNC
      this.matter.world.setBounds(0, 0, 1000, 1000)
      this.cameras.main.setBounds(0, 0, 1000, 1000)
      players.call(this)
      keyboardControls.call(this)
      // scoreAndStars.call(this)
      NPCCells.call(this)
      // this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
      //   console.log('collision detected, emitting bodies:', bodyA)
      //   console.log('ship id: ', this.ship.body.id)
      //   if (bodyA.id === this.ship.body.id) console.log('THEY MATCH')
      //   // this.socket.emit('anyCollision', bodyA, bodyB)
      // })
      // this.socket.on('collided', (bodyA, bodyB) => {
      //   console.log('WHOLE DATAS: ', bodyA, bodyB)
      // })
    },
    this
  )
}
