/**
 * サーバー
 */

'use strict'

const express = require('express')
const http = require('http')
const path = require('path')
const socketIO = require('socket.io')
const app = express()
const server = http.Server(app)
const io = socketIO(server)
const port = 3000
const players = {}

const FIELD_WIDTH = 1000
const FIELD_HEIGHT = 1000
const FPS = 1000 / 30

/**
 * プレイヤークラス
 */
class Player {
  constructor (obj = {}) {
    this.id = Math.floor(Math.random() * 1000000000)
    this.width = 80
    this.height = 80
    this.x = Math.random() * (FIELD_WIDTH - this.width)
    this.y = Math.random() * (FIELD_HEIGHT - this.height)
    this.angle = 0
    this.movement = {}
  }
  move (distance) {
    this.x += distance * Math.cos(this.angle)
    this.y += distance * Math.sin(this.angle)
  }
}

/**
 * プレイヤーごとに通信した時の処理を定義
 */
io.on('connection', function (socket) {
  console.log('connection')
  let player = null
  socket.on('game-start', (config) => {
    console.log('game-start')
    player = new Player({ socketId: socket.id })
    players[player.id] = player
  })
  socket.on('movement', function (movement) {
    console.log('movement')
    if (!player) return
    player.movement = movement
  })
  socket.on('disconnect', () => {
    if (!player) return
    delete players[player.id]
    player = null
  })
})

/**
 * ゲームの更新処理
 */
setInterval(() => {
  Object.values(players).forEach((player) => {
    const movement = player.movement
    if (movement.forward) player.move(5)
    if (movement.back) player.move(-5)
    if (movement.left) player.angle -= 0.1
    if (movement.right) player.angle += 0.1
  })
  io.sockets.emit('state', players)
}, FPS)

/**
 * static配下のディレクトリを公開する
 */
app.use('/static', express.static(`${__dirname}/static`))

/**
 * ルートにアクセスした時の処理
 */
app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/static/index.html`)))

/**
 * サーバーを起動
 */
server.listen(port, () => console.log(`Staring server on port ${port}!`))