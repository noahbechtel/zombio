import io from 'socket.io-client'

const socket = io(window.location.origin)
export let players = {}
export let zombies = {}
export let bullets = []
export let startX = 0
export let startY = 0

export const movePlayer = (x, y) => {
  socket.emit('move-player', { x, y })
}
export const emitFire = (startX, startY, endX, endY) => {
  socket.emit('fire-player', { startX, startY, endX, endY })
}
export const killPlayer = () => {
  socket.emit('kill-player')
}
export const startGame = (x, y, centerX, centerY) => {
  socket.emit('start-game', { x, y, centerX, centerY })
}

socket.on('connect', p => {
  console.log('Connected')
})

socket.on('start', res => {
  console.log('started')
  players = res.players
  zombies = res.zombies
  startX = res.x
  startY = res.y
  console.log(zombies, players)
})
socket.on('me', id => {
  console.log(id)
})
socket.on('update-Bullets', b => {
  bullets.push(b)
})

socket.on('update-zombies', zoms => {
  zombies = zoms
})

socket.on('update-player', (id, player) => {
  if (players[id]) {
    players[id].x = player.x
    players[id].y = player.y
    players[id].centerX = player.centerX
    players[id].centerY = player.centerY
  }
})

socket.on('add-player', p => {
  players = p
})

socket.on('remove-player', id => {
  delete players[id]
})
socket.on('player-shooting', shot => {
  bullets.push(shot)
})

export default socket
