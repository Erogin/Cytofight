import {players, keyboardControls, scoreAndStars} from './createFunctions'
import {Antibody} from '../phaser-game'
import {worldSize} from './util'

export function preload() {
  this.load.image('click', 'assets/PNG/play.png')
  this.load.image('ship', 'assets/PNG/b-cell-transparent.png')
  this.load.image('otherPlayer', 'assets/PNG/White_blood_cell_transparent.png')
  this.load.image('star', 'assets/PNG/star_gold.png')
  this.load.image('histamines', 'assets/PNG/Effects/star1.png')
  this.load.image('mastCell', 'assets/PNG/mast_cell_transparent.png')
  this.load.image('antibody', 'assets/PNG/antibody-game-transparent.png')
  this.load.image('dormantTCell', 'assets/PNG/White_blood_cell_transparent.png')
  this.load.image('epithelialCell', 'assets/PNG/epithelial_cell.png')
  this.load.image('redBloodCell', 'assets/PNG/RedBloodCell.png')

  // Background image: make sure file is compressed using https://imagecompressor.com/
  this.load.image('redback', 'assets/PNG/redback.png')
}

export function create() {
  //  The world is 3200 x 600 in size
  this.cameras.main.setBounds(0, 0, worldSize.x, worldSize.y).setName('main')

  // Create canvas background image
  this.add.image(worldSize.x / 2, worldSize.y / 2, 'redback').setScale(2.9)

  //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
  this.minimap = this.cameras
    .add(0, window.innerHeight - 100, 150, 100)
    .setZoom(0.1)
    .setName('mini')
  // this.minimap.blueScoreText.setText('')
  this.minimap.setBackgroundColor(0x002244)
  this.minimap.scrollX = worldSize.x
  this.minimap.scrollY = worldSize.y

  // PUT IN A SETUP FUNC
  this.matter.world.setBounds(0, 0, worldSize.x, worldSize.y)
  this.cameras.main.setBounds(0, 0, worldSize.x, worldSize.y)
  players.call(this)
  this.antibodies = this.add.group({
    classType: Antibody,
    maxSize: 100,
    runChildUpdate: true
  })
  keyboardControls.call(this)

  console.log(this.cameras)
  this.blueScoreText = this.add
    .text(window.innerWidth - 440, 16, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      fill: 'blue'
    })
    .setDepth(1)
    .setScrollFactor(0)
    .setStroke('yellow', 2)

  this.redScoreText = this.add
    .text(window.innerWidth - 440, 48, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      fill: '#d60000'
    })
    .setDepth(1)
    .setScrollFactor(0)
    .setStroke('yellow', 2)

  scoreAndStars.call(this)
}
