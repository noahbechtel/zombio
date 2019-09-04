module.exports = io => {
  let players = {}
  io.on('connection', socket => {
    const id = socket.id
    console.log(`A socket connection to the server has been made: ${id}`)

    socket.emit('start', players)
    socket.emit('me', id)
    players[String(id)] = { x: 0, y: 0 }
    socket.broadcast.emit('add-player', players)

    socket.on('disconnect', () => {
      console.log('Client disconnected')
      delete players[id]
      socket.emit('remove-player', id)
    })

    socket.on('move-player', res => {
      const { x, y } = res
      console.log('players', players)
      players[String(id)].x = x
      players[id].y = y
      socket.broadcast.emit('update-player', id, players[id])
    })
  })
}
