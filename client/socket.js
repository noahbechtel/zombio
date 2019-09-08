import io from 'socket.io-client'

const socket = io(window.location.origin)
export let players = {}
export let zombies = {}
export let bullets = []
export let collisions = []
export let decals = []
export let startX = 0
export let startY = 0
export let points = 0
let myId = ''

export const movePlayer = (x, y) => {
  socket.emit('move-player', { x, y })
}
export const emitFire = (startX, startY, endX, endY) => {
  socket.emit('fire-player', { startX, startY, endX, endY })
}
export const killPlayer = () => {
  socket.emit('kill-player')
}
export const startGame = (x, y, centerX, centerY, color, name) => {
  socket.emit('start-game', { x, y, centerX, centerY, color, name })
}
export const harmZombie = id => {
  socket.emit('harm-zombie', id)
}
export const clearBullets = () => {
  bullets = []
}

socket.on('connect', p => {
  console.log('Connected')
})

socket.on('start', res => {
  console.log('started')
  myId = res.id
  players = res.players
  zombies = res.zombies
  startX = res.x
  startY = res.y
  collisions = res.collisions
  decals = res.decals
})

socket.on('update-Bullets', b => {
  bullets.push(b)
})

socket.on('update-zombies', zoms => {
  zombies = zoms
})

socket.on('update-player', p => {
  players = p
  delete players[myId]
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
socket.on('zombie-killed', kills => {
  points = kills
})

export default socket
