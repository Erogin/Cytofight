import { players, keyboardControls, scoreAndStars, NPCCells } from './createFunctions'

export function preload() {
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
  // PUT IN A SETUP FUNC
  this.cameras.main.setBounds(0, 0, 2000, 2000)
  players.call(this)
  keyboardControls.call(this)
  // scoreAndStars.call(this)
  // NPCCells.call(this)
  this.matter.world.on('collisionStart', (event, bodyA, bodyB) => {
    this.socket.emit('anyCollision', bodyA, bodyB)
  })
}