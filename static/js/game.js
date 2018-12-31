/**
 * ゲーム
 */

'use strict'

const socket = io()
const canvas = document.querySelector('#canvas-2d')
const context = canvas.getContext('2d')
const startBtn = document.querySelector('#start-button')
const playerImage = document.querySelector('#player-image')
const movement = {}

/**
 * ゲームを開始する
 */
function gameStart () {
  startBtn.remove()
  socket.emit('game-start')
}

/**
 * キー操作
 * @param {*} event 
 */
function keyHandler (event) {
  const keyToCommand = {
    ArrowUp: 'forward',
    ArrowDown: 'back',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }
  const command = keyToCommand[event.key]
  if (command) {
    if (event.type === 'keydown') {
      movement[command] = true
    } else {
      movement[command] = false
    }
    socket.emit('movement', movement)
  }
}

/**
 * キーイベント
 */
// startBtn.addEventListener('click', gameStart)
document.addEventListener('keydown', keyHandler)
document.addEventListener('keyup', keyHandler)

/**
 * サーバーとの通信
 */
socket.on('state', (players) => {
  console.log('state')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.lineWidth = 20
  context.beginPath()
  context.rect(0, 0, canvas.width, canvas.height)
  context.stroke()

  Object.values(players).forEach((player) => {
    context.drawImage(playerImage, player.x, player.y)
    context.font = '30px Bold Arial'
    context.fillText('Player', player.x, player.y)
  })
})

socket.on('connect', gameStart)