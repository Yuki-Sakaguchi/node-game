/**
 * ゲーム
 */

'use strict'

const socket = io()
const canvas = document.querySelector('#canvas-2d')
const context = canvas.getContext('2d')
const startBtn = document.querySelector('#start-button')
const playerImage = document.querySelector('#player-image')

let movement = {}
let touches = {}

/**
 * ゲームを開始する
 */
function gameStart () {
  startBtn.style.display = 'none'
  socket.emit('game-start', { nickname: 'User' })
}

/**
 * キー操作
 * @param {*} event 
 */
function keyHandler (event) {
  const keyToCommand = {
    ArrowUp   : 'forward',
    ArrowDown : 'back',
    ArrowLeft : 'left',
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
  if (event.key === ' ' && event.type === 'keydown') {
    socket.emit('shoot')
  }
}

/**
 * タッチスタート
 * @param {*} event 
 */
function touchStartHandler (event) {
  socket.emit('shoot')
  movement.forward = true
  Array.from(event.changedTouches).forEach(touch => {
    touches[touch.identifier] = {
      pageX: touch.pageX,
      pageY: touch.pageY,
    }
  })
  event.preventDefault()
}

/**
 * タッチムーブ
 * @param {*} event 
 */
function touchMoveHandler (event) {
  movement.right = false
  movement.left = false
  Array.from(event.touches).forEach(touch => {
    const startTouch = touches[touch.identifier]
    movement.right |= touch.pageX - startTouch.pageX > 30
    movement.left |= touch.pageX - startTouch.pageY < -30
  })
  socket.emit('movement', movement)
  event.preventDefault()
}

/**
 * タッチエンド
 * @param {*} event 
 */
function touchEndHandler (event) {
  Array.from(event.changedTouches).forEach(touch => {
    delete touches[touch.identifier]
  })
  if (Object.keys(touches).length === 0) {
    movement = {}
    socket.emit('movement', movement)
  }
  event.preventDefault()
}

/**
 * イベントリスナー
 */
startBtn.addEventListener('click', gameStart)
document.addEventListener('keydown', keyHandler)
document.addEventListener('keyup', keyHandler)
canvas.addEventListener('touchstart', touchStartHandler)
canvas.addEventListener('touchmove', touchMoveHandler)
canvas.addEventListener('touchend', touchEndHandler)

/**
 * サーバーとの通信
 */
socket.on('state', (players, bullets, walls) => {
  context.clearRect(0, 0, canvas.width, canvas.height)

  context.lineWidth = 10
  context.beginPath()
  context.rect(0, 0, canvas.width, canvas.height)
  context.stroke()

  Object.values(players).forEach((player) => {
    context.save()
    context.font = '20px Bold Arial'
    context.fillText(player.nickname, player.x, player.y + player.height + 25)
    context.font = '10px Bold Arial'
    context.fillStyle = 'gray'
    context.fillText('♡'.repeat(player.maxHealth), player.x, player.y + player.height + 10)
    context.fillStyle = 'red'
    context.fillText('♡'.repeat(player.health), player.x, player.y + player.height + 10)
    context.translate(player.x + player.width / 2, player.y + player.height / 2)
    context.rotate(player.angle)
    context.drawImage(playerImage, 0, 0, playerImage.width, playerImage.height, -player.width/2, -player.height/2, player.width, player.height)
    context.restore()

    if (player.socketId === socket.id) {
      context.save()
      context.font = '30px Bold Arial'
      context.fillText('You', player.x, player.y - 20)
      context.fillText(`${player.point} point`, 20, 40)
      context.restore()
    }
  })

  Object.values(bullets).forEach(bullet => {
    context.beginPath()
    context.arc(bullet.x, bullet.y, bullet.width/2, 0, 2 * Math.PI)
    context.stroke()
  })

  Object.values(walls).forEach(wall => {
    context.fillStyle = 'black'
    context.fillRect(wall.x, wall.y, wall.width, wall.height)
  })
})

socket.on('dead', () => {
  startBtn.style.display = 'flex'
})