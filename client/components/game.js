import React, { Component } from 'react'
import { connect } from 'react-redux'

/**
 * COMPONENT
 */
class Game extends Component {
  constructor () {
    super()
  }
  componentDidMount () {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')

    let rightPressed = false
    let leftPressed = false
    let upPressed = false
    let downPressed = false
    let playerSize = 15
    let interval
    let mouseX = 0
    let mouseY = 0
    let pX = 0
    let pY = 0
    let flash = true
    let firing = false
    let zMax = 10
    let zombies = []
    let center = [canvas.width / 2, canvas.height / 2]
    let collisions = [
      { x: 10, y: 10, width: 100, height: 10 },
      { x: 10, y: 10, width: 10, height: 100 },
      { x: 110, y: 10, width: 10, height: 100 }
    ]

    const keyDownHandler = evt => {
      switch (evt.key) {
        case 'd':
          rightPressed = true
          break
        case 'a':
          leftPressed = true
          break
        case 's':
          downPressed = true
          break
        case 'w':
          upPressed = true
          break

        default:
          break
      }
    }

    const keyUpHandler = evt => {
      switch (evt.key) {
        case 'd':
          rightPressed = false
          break
        case 'a':
          leftPressed = false
          break
        case 's':
          downPressed = false
          break
        case 'w':
          upPressed = false
          break
        default:
          break
      }
    }
    const mouseMove = evt => {
      mouseX = evt.clientX
      mouseY = evt.clientY
    }

    canvas.addEventListener('keydown', keyDownHandler, false)
    canvas.addEventListener('keyup', keyUpHandler, false)
    canvas.addEventListener('mousemove', mouseMove, false)
    canvas.addEventListener(
      'mousedown',
      () => {
        firing = true
      },
      false
    )
    canvas.addEventListener(
      'mouseup',
      () => {
        firing = false
      },
      false
    )

    const playerMotionHandler = () => {
      let x = center[0]
      let y = center[1]
      let moveLeft = true
      let moveRight = true
      let moveUp = true
      let moveDown = true
      collisions.map(obj => {
        if (
          x - playerSize / 2 > obj.x + pX + x &&
          x - playerSize < obj.x + obj.width + pX + x &&
          y > obj.y + pY + y &&
          y < obj.y + obj.height + pY + y
        ) {
          moveLeft = false
        }

        if (
          x + playerSize > obj.x + pX + x &&
          x + playerSize / 2 < obj.x + obj.width + pX + x &&
          y > obj.y + pY + y &&
          y < obj.y + obj.height + pY + y
        ) {
          moveRight = false
        }

        if (
          x > obj.x + pX + x &&
          x < obj.x + obj.width + pX + x &&
          y + playerSize > obj.y + pY + y &&
          y + playerSize / 2 < obj.y + obj.height + pY + y
        ) {
          moveDown = false
        }

        if (
          x > obj.x + pX + x &&
          x < obj.x + obj.width + pX + x &&
          y - playerSize / 2 > obj.y + pY + y &&
          y - playerSize < obj.y + obj.height + pY + y
        ) {
          moveUp = false
        }
      })
      if (upPressed && moveUp) pY++
      if (downPressed && moveDown) pY--
      if (rightPressed && moveRight) pX--
      if (leftPressed && moveLeft) pX++
    }

    const renderMap = () => {
      collisions.map(obj => {
        ctx.fillStyle = '#FFF'
        ctx.fillRect(
          center[0] + pX + obj.x,
          center[1] + pY + obj.y,
          obj.width,
          obj.height
        )
      })
    }
    const renderZombies = () => {
      const makeZom = () => {
        const x = Math.round(Math.random() * 500)
        const y = Math.round(Math.random() * 500)
        zombies.push({ health: 500, x, y })
      }
      if (zombies.length <= zMax) {
        setInterval(makeZom(), 1000)
      }
      zombies.map(zed => {
        if (zed.health > 0) {
          ctx.beginPath()
          ctx.arc(zed.x + pX, zed.y + pY, playerSize, 0, Math.PI * 2)
          ctx.fillStyle = `#a0c334`
          ctx.fill()
          ctx.closePath()
        }
      })
    }
    const renderBullets = () => {
      let line1StartX = center[0]
      let line1StartY = center[1]
      let line1EndX = mouseX
      let line1EndY = mouseY
      let bX = null
      let bY = null
      const intersects = (line2StartX, line2StartY, line2EndX, line2EndY) => {
        let denominator, a, b, numerator1, numerator2
        let result = {
          x: null,
          y: null,
          onLine1: false,
          onLine2: false
        }
        denominator =
          (line2EndY - line2StartY) * (line1EndX - line1StartX) -
          (line2EndX - line2StartX) * (line1EndY - line1StartY)
        if (denominator == 0) {
          return result
        }
        a = line1StartY - line2StartY
        b = line1StartX - line2StartX
        numerator1 =
          (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b
        numerator2 =
          (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b
        a = numerator1 / denominator
        b = numerator2 / denominator

        result.x = line1StartX + a * (line1EndX - line1StartX)
        result.y = line1StartY + a * (line1EndY - line1StartY)

        if (a > 0 && a < 1) {
          result.onLine1 = true
        }
        if (b > 0 && b < 1) {
          result.onLine2 = true
        }
        return result
      }
      const pDistance = (x2, y2) => {
        let A = line1StartX - bX
        let B = line1StartY - bY
        let C = x2 - bX
        let D = y2 - bY

        let dot = A * C + B * D
        let len_sq = C * C + D * D
        let param = -1
        if (len_sq != 0) {
          // in case of 0 length line
          param = dot / len_sq
        }

        let xx, yy

        if (param < 0) {
          xx = bX
          yy = bY
        } else if (param > 1) {
          xx = x2
          yy = y2
        } else {
          xx = bX + param * C
          yy = bY + param * D
        }

        let dx = line1StartX - xx
        let dy = line1StartY - yy
        return Math.sqrt(dx * dx + dy * dy)
      }
      const shoot = (x, y) => {
        if (flash) {
          ctx.beginPath()
          ctx.moveTo(center[0], center[1])
          ctx.lineTo(x, y)
          ctx.stroke()
          flash = false
        } else {
          flash = true
        }
      }
      if (firing) {
        let result
        collisions.map(obj => {
          result = intersects(
            obj.x + pX + center[0],
            obj.y + pY + center[1],
            obj.x + pX + obj.width + center[0],
            obj.y + pY + center[1]
          )
          if (
            result.onLine1 &&
            result.onLine2 &&
            pDistance(bX, bY) > pDistance(result.x, result.y)
          ) {
            bX = result.x
            bY = result.y
          }

          result = intersects(
            obj.x + pX + center[0],
            obj.y + pY + center[1],
            obj.x + pX + center[0],
            obj.y + pY + obj.height + center[1]
          )
          if (
            result.onLine1 &&
            result.onLine2 &&
            pDistance(bX, bY) > pDistance(result.x, result.y)
          ) {
            bX = result.x
            bY = result.y
          }
          result = intersects(
            obj.x + pX + obj.width + center[0],
            obj.y + pY + center[1],
            obj.x + pX + obj.width + center[0],
            obj.y + pY + obj.height + center[1]
          )
          if (
            result.onLine1 &&
            result.onLine2 &&
            pDistance(bX, bY) > pDistance(result.x, result.y)
          ) {
            bX = result.x
            bY = result.y
          }
          result = intersects(
            obj.x + pX + center[0],
            obj.y + pY + obj.height + center[1],
            obj.x + pX + obj.width + center[0],
            obj.y + pY + obj.height + center[1]
          )
          if (
            result.onLine1 &&
            result.onLine2 &&
            pDistance(bX, bY) > pDistance(result.x, result.y)
          ) {
            bX = result.x
            bY = result.y
          }
        })

        let id = null
        zombies.map(obj => {
          if (obj.health > 0) {
            result = intersects(
              obj.x + pX - playerSize / 2,
              obj.y + pY - playerSize / 2,
              obj.x + pX + playerSize,
              obj.y + pY - playerSize / 2
            )
            if (
              result.onLine1 &&
              result.onLine2 &&
              pDistance(bX, bY) > pDistance(result.x, result.y)
            ) {
              bX = result.x
              bY = result.y
              id = zombies.indexOf(obj)
            }

            result = intersects(
              obj.x + pX - playerSize / 2,
              obj.y + pY - playerSize / 2,
              obj.x + pX - playerSize / 2,
              obj.y + pY + playerSize
            )
            if (
              result.onLine1 &&
              result.onLine2 &&
              pDistance(bX, bY) > pDistance(result.x, result.y)
            ) {
              bX = result.x
              bY = result.y
              id = zombies.indexOf(obj)
            }
            result = intersects(
              obj.x + pX + playerSize,
              obj.y + pY - playerSize / 2,
              obj.x + pX + playerSize,
              obj.y + pY + playerSize
            )
            if (
              result.onLine1 &&
              result.onLine2 &&
              pDistance(bX, bY) > pDistance(result.x, result.y)
            ) {
              bX = result.x
              bY = result.y
              id = zombies.indexOf(obj)
            }
            result = intersects(
              obj.x + pX - playerSize / 2,
              obj.y + pY + playerSize,
              obj.x + pX + playerSize,
              obj.y + pY + playerSize
            )
            if (
              result.onLine1 &&
              result.onLine2 &&
              pDistance(bX, bY) > pDistance(result.x, result.y)
            ) {
              bX = result.x
              bY = result.y
              id = zombies.indexOf(obj)
            }
            let hit = false
            const harm = () => {
              if (!hit) {
                hit = true
                zombies[id].health--
              }
            }
            if (id !== null) {
              harm()
              hit = false
              if (zombies[id].health <= 0) {
                const x = Math.round(Math.random() * 500)
                const y = Math.round(Math.random() * 500)
                zombies[id].x = x
                zombies[id].y = y
                zombies[id].health = 100
                hit = false
              }
            }
          }
        })

        shoot(bX || mouseX, bY || mouseY)
      }
    }
    const renderPlayer = () => {
      ctx.beginPath()
      ctx.arc(center[0], center[1], playerSize, 0, Math.PI * 2)
      // ctx.rect(center[0], center[1], playerSize, playerSize - 5)
      ctx.fillStyle = `#f34573`
      ctx.fill()
      ctx.closePath()
    }
    const renderInfo = () => {
      ctx.beginPath()
      ctx.font = '30px Arial'
      ctx.fillText(`X:${pX},Y:${pY}`, 10, 50)
      ctx.closePath()
    }

    const draw = () => {
      ctx.canvas.width = window.innerWidth
      ctx.canvas.height = window.innerHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#DDDDDD'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      playerMotionHandler()
      renderBullets()
      renderMap()
      renderPlayer()
      renderZombies()
      renderInfo()
    }
    interval = setInterval(draw, 10)
    draw()
  }

  render () {
    return (
      <div>
        <canvas
          ref='canvas'
          width={screen.width - 20}
          height={screen.height - 100}
          onKeyPress={this.keyPress}
          tabIndex='0'
        />
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {}
}

export default connect(mapState)(Game)
