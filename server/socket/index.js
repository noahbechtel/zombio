module.exports = io => {
  let players = {}
  let zombies = {}
  let zMax = 3
  let thrust = 0.75
  let interval
  let serverOn = false
  let playerSize = 15
  let id = 0
  let collisions = [
    { x: 20, y: 20, width: 100, height: 10 },
    { x: 20, y: 20, width: 10, height: 100 },
    { x: 120, y: 20, width: 10, height: 100 },
    { x: 120, y: 110, width: 100, height: 10 }
  ]
  let zombiesArr = Object.values(zombies)

  const genRanPos = () => {
    return Math.round(Math.random() * 800) * (Math.random() > 0.5 ? -1 : 1) + 0
  }
  const makeZom = () => {
    const x = genRanPos()
    const y = genRanPos()

    zombies[id] = { health: 500, x, y }
    id++
  }

  for (let i = 0; i <= 20; i++) {
    makeZom()
  }
  const zombieCompute = () => {
    zombiesArr.map(zed => {
      if (zed.health > 0) {
        let tx = 0
        let ty = 0
        let x = zed.x
        let y = zed.y

        let centerX = 0
        let centerY = 0
        let pX = 0
        let pY = 0
        let dist = 100000
        let playersArr = Object.values(players)

        // if (Object.values(players)[0]) {
        //   centerX = Object.values(players)[0].centerX
        //   centerY = Object.values(players)[0].centerY
        //   pX = Object.values(players)[0].x
        //   pY = Object.values(players)[0].y
        //   tx = centerX - pX - x
        //   ty = centerY - pY - y
        // }
        playersArr.map(p => {
          centerX = p.centerX
          centerY = p.centerY
          pX = p.x
          pY = p.y
          txtemp = centerX - pX - x
          tytemp = centerY - pY - y
          const result = Math.sqrt(txtemp * txtemp + tytemp * tytemp)

          if (result < dist) {
            dist = result
            tx = txtemp
            ty = tytemp
          }
        })

        velX = (tx / dist) * thrust
        velY = (ty / dist) * thrust

        let moveLeft = true
        let moveRight = true
        let moveUp = true
        let moveDown = true

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

        x = zed.x - centerX
        y = zed.y - centerY
        collisions.map(obj => {
          if (
            x - playerSize > obj.x &&
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

        if (moveUp && velY <= 0) zed.y += velY
        if (moveDown && velY >= 0) zed.y += velY

        if (moveRight && velX >= 0) zed.x += velX
        if (moveLeft && velX <= 0) zed.x += velX
      }
    })
  }
  interval = setInterval(() => {
    zombieCompute()
    io.emit('update-zombies', zombies)
  }, 10)

  io.on('connection', socket => {
    const id = socket.id

    zombiesArr = Object.values(zombies)

    // clearInterval(interval)

    // interval = setInterval(() => {
    //   zombieCompute()
    //   socket.emit('update-zombies', zombies)
    // }, 10)

    console.log(`A socket connection to the server has been made: ${id}`)

    socket.on('start-game', res => {
      const { x, y, centerX, centerY } = res
      players[String(id)] = { x, y, centerX, centerY }
    })
    socket.emit('start', { players, zombies, id })
    socket.emit('update-zombies', zombies)

    socket.on('disconnect', () => {
      console.log('Client disconnected')
      delete players[id]
      socket.broadcast.emit('remove-player', id)
    })

    socket.on('move-player', res => {
      const { x, y } = res
      if (players[String(id)]) {
        players[id].x = x
        players[id].y = y
        socket.broadcast.emit('update-player', players)
      }
    })

    socket.on('kill-player', () => {
      delete players[id]
      socket.broadcast.emit('remove-player', id)
    })
    socket.on('fire-player', shot => {
      socket.broadcast.emit('player-shooting', shot)
    })
    socket.on('harm-zombie', id => {
      const zom = zombies[id]
      zom.health -= 10
      if (zom.health <= 0) {
        const x = genRanPos()
        const y = genRanPos()
        zom.x = x
        zom.y = y
        zom.health = 500
      }
    })
  })
}
