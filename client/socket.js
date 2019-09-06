import io from 'socket.io-client'

const socket = io(window.location.origin)
export let players = {}
export let zombies = {}
export let shots = []

export const movePlayer = (x, y) => {
  socket.emit('move-player', { x, y })
}
export const emitFire = (x, y) => {
  socket.emit('fire-player', { x, y })
}
export const removeShot = id => {
  shots.splice(id, 1)
}
export const killPlayer = () => {
  socket.emit('kill-player')
}

socket.on('connect', p => {
  console.log('Connected')
})

socket.on('start', res => {
  console.log('started')
  players = res.players
  zombies = res.zombies
  console.log(zombies, players)
})
socket.on('me', id => {
  console.log(id)
})

socket.on('update-zombies', zoms => {
  zombies = zoms
})

socket.on('update-player', (id, player) => {
  players[id].x = player.x
  players[id].y = player.y
})

socket.on('add-player', p => {
  players = p
})

socket.on('remove-player', id => {
  delete players[id]
})
socket.on('player-shooting', (x, y, id) => {
  let player = players.map(p => (p.id === id ? p : null))
  shots.push({ playerX: player.x, playerY: player.y, shotX: x, shotY: y })
})

export default socket
