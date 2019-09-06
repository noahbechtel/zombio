module.exports = io => {
  let players = {}
  let zombies = {}
  let zMax = 10
  let thrust = 0.1
  let interval
  let playerSize = 15
  let id = 0
  let collisions = [
    { x: 20, y: 20, width: 100, height: 10 },
    { x: 20, y: 20, width: 10, height: 100 },
    { x: 120, y: 20, width: 10, height: 100 },
    { x: 120, y: 110, width: 100, height: 10 }
  ]
  let zombiesArr = Object.values(zombies)

  const makeZom = () => {
    const x =
      Math.round(Math.random() * 1000) * (Math.random() > 0.5 ? -1 : 1) + 0
    const y =
      Math.round(Math.random() * 1000) * (Math.random() > 0.5 ? -1 : 1) + 0

    zombies[id] = { health: 500, x, y }
    id++
  }

  for (let i = 0; i <= 20; i++) {
    makeZom()
  }
  const zombieCompute = () => {
    zombiesArr.map(zed => {
      if (zed.health > 0) {
        let tx = 30
        let ty = 30

        if (Object.values(players)[0]) {
          tx = Object.values(players)[0].x
          ty = Object.values(players)[0].y
        }
        let dist = Math.sqrt(tx * tx + ty * ty)

        velX = (tx / dist) * thrust
        velY = (ty / dist) * thrust

        let x = zed.x
        let y = zed.y
        console.log(tx, ty, x, y)
        let moveLeft = true
        let moveRight = true
        let moveUp = true
        let moveDown = true

        collisions.map(obj => {
          if (
            x - playerSize / 2 > obj.x &&
            x - playerSize < obj.x + obj.width &&
            y > obj.y &&
            y < obj.y + obj.height
          ) {
            moveLeft = false
          }

          if (
            x + playerSize > obj.x + 0 &&
            x + playerSize / 2 < obj.x + obj.width + 0 &&
            y > obj.y + 0 &&
            y < obj.y + obj.height + 0
          ) {
            moveRight = false
          }

          if (
            x > obj.x + 0 &&
            x < obj.x + obj.width + 0 &&
            y + playerSize / 2 > obj.y + 0 &&
            y + playerSize < obj.y + obj.height + 0
          ) {
            moveDown = false
          }

          if (
            x > obj.x + 0 &&
            x < obj.x + obj.width + 0 &&
            y - playerSize > obj.y + 0 &&
            y - playerSize / 2 < obj.y + obj.height + 0
          ) {
            moveUp = false
          }
        })

        zombiesArr.map(obj => {
          if (
            x - playerSize > obj.x &&
            x - playerSize < obj.x + playerSize &&
            y > obj.y &&
            y < obj.y + playerSize / 2
          ) {
            moveLeft = false
          }

          if (
            x + playerSize > obj.x &&
            x + playerSize < obj.x + playerSize &&
            y > obj.y &&
            y < obj.y + playerSize / 2
          ) {
            moveRight = false
          }

          if (
            x > obj.x &&
            x < obj.x + playerSize / 2 &&
            y + playerSize > obj.y &&
            y + playerSize < obj.y + playerSize
          ) {
            moveDown = false
          }

          if (
            x > obj.x &&
            x < obj.x + playerSize / 2 &&
            y - playerSize > obj.y &&
            y - playerSize < obj.y + playerSize
          ) {
            moveUp = false
          }
        })

        if (moveUp && velY <= 0) zed.y += velY
        if (moveDown && velY >= 0) zed.y += velY

        if (moveRight && velX >= 0) zed.x += velX
        if (moveLeft && velX <= 0) zed.x += velX
      }
    })
  }

  interval = setInterval(zombieCompute, 10)

  io.on('connection', socket => {
    const id = socket.id
    makeZom()

    zombiesArr = Object.values(zombies)

    interval = setInterval(() => {
      zombieCompute()
      socket.emit('update-zombies', zombies)
    }, 10)

    console.log(`A socket connection to the server has been made: ${id}`)
    socket.emit('start', { players, zombies })
    socket.emit('me', id)
    players[String(id)] = { x: 0, y: 0 }
    socket.broadcast.emit('add-player', players)
    console.log(players)
    socket.on('disconnect', () => {
      console.log('Client disconnected')
      delete players[id]
      socket.emit('remove-player', id)
    })

    socket.on('move-player', res => {
      const { x, y } = res
      if (players[String(id)]) {
        players[String(id)].x = x
        players[id].y = y

        socket.broadcast.emit('update-player', id, players[id])
      }
    })
    socket.on('kill-player', () => {
      delete players[id]
      socket.broadcast.emit('add-player', players)
    })
  })
}
