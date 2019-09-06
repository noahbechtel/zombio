import React, { Component } from 'react'
import { connect } from 'react-redux'
import { mapPointers } from '../map'
import {
  movePlayer,
  players,
  killPlayer,
  zombies as zombieList,
  startGame,
  bullets,
  harmZombie,
  emitFire,
  clearBullets
} from '../socket'

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
    const palette = {
      zombieColor: '#80ac7b',
      tracer: '#eeeeee',
      background: '#393e46',
      healthBarFG: '#f73859',
      healthBarBG: '#232931',
      staminaBarFG: '#4ecca3',
      staminaBarBG: '#232931',
      playerColor: '#f5841a',
      pointsColor: '#fdf6f6',
      wallsColor: '#d3d6db'
    }
    let rightPressed = false
    let leftPressed = false
    let upPressed = false
    let downPressed = false
    let points = 0
    let playerSize = 15
    let xLimit = 500
    let yLimit = 500
    let playerDead = false
    let interval
    let mouseX = 0
    let mouseY = 0
    let pX = Math.round(Math.random() * 500) * (Math.random() > 0.5 ? -1 : 1)
    let pY = Math.round(Math.random() * 500) * (Math.random() > 0.5 ? -1 : 1)
    let center = [canvas.width / 2, canvas.height / 2]
    startGame(pX, pY, center[0], center[1])
    let health = 296
    let stamina = 296
    let sprint = false
    let flash = true
    let firing = false
    let staminaBuffer = 0
    let healthBuffer = 0

    let collisions = [
      { x: 20, y: 20, width: 100, height: 10 },
      { x: 20, y: 20, width: 10, height: 100 },
      { x: 120, y: 20, width: 10, height: 100 },
      { x: 120, y: 110, width: 100, height: 10 }
    ]

    const keyDownHandler = evt => {
      switch (evt.key) {
        case 'd':
          rightPressed = true
          sprint = false
          break
        case 'a':
          leftPressed = true
          sprint = false
          break
        case 's':
          downPressed = true
          sprint = false
          break
        case 'w':
          upPressed = true
          sprint = false
          break
        case 'D':
          rightPressed = true
          sprint = true
          break
        case 'A':
          leftPressed = true
          sprint = true
          break
        case 'S':
          downPressed = true
          sprint = true
          break
        case 'W':
          upPressed = true
          sprint = true
          break
        case 'shift':
          sprint = true
          break
        default:
          break
      }
    }

    const keyUpHandler = evt => {
      switch (evt.key) {
        case 'd':
          rightPressed = false
          sprint = false
          break
        case 'a':
          leftPressed = false
          sprint = false
          break
        case 's':
          sprint = false
          downPressed = false
          break
        case 'w':
          upPressed = false
          sprint = false
          break
        case 'D':
          rightPressed = false
          break
        case 'A':
          leftPressed = false
          break
        case 'S':
          downPressed = false
          break
        case 'W':
          upPressed = false
          break

        case 'shift':
          sprint = false
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

      if (sprint && stamina > 0) {
        stamina--
      } else {
        if (stamina <= 0 && staminaBuffer === 'end') {
          sprint = false
          staminaBuffer = 300
        }
        if (stamina < 296 && staminaBuffer === 'end') {
          stamina += 0.5
        } else {
          if (staminaBuffer > 0) {
            staminaBuffer--
          } else if (stamina < 296) {
            staminaBuffer = 'end'
            stamina = 1
          }

          sprint = false
        }
      }

      if (upPressed && moveUp && pY <= yLimit) sprint ? (pY += 2) : pY++
      if (downPressed && moveDown && pY >= yLimit * -1) {
        sprint ? (pY -= 2) : pY--
      }
      if (rightPressed && moveRight && pX >= xLimit * -1) {
        sprint ? (pX -= 2) : pX--
      }
      if (leftPressed && moveLeft && pX <= xLimit) sprint ? (pX += 2) : pX++
    }

    const renderMap = () => {
      collisions.map(obj => {
        ctx.fillStyle = palette.wallsColor
        ctx.fillRect(
          center[0] + pX + obj.x,
          center[1] + pY + obj.y,
          obj.width,
          obj.height
        )
      })
    }
    const renderZombies = () => {
      const zeds = Object.values(zombieList)
      zeds.forEach(zed => {
        ctx.beginPath()
        ctx.arc(zed.x + pX, zed.y + pY, playerSize, 0, Math.PI * 2)
        ctx.fillStyle = palette.zombieColor
        ctx.fill()
        ctx.closePath()
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
          ctx.strokeStyle = palette.tracer
          ctx.stroke()
          emitFire(pX, pY, x, y)
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
        let shot = false
        let shotBuffer = 0
        let id = null
        const zeds = Object.values(zombieList)

        zeds.map(obj => {
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
              id = zeds.indexOf(obj)
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
              id = zeds.indexOf(obj)
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
              id = zeds.indexOf(obj)
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
              id = zeds.indexOf(obj)
            }

            if (id !== null) {
              if (!shot) {
                shotBuffer = 10
                harmZombie(id)
                shot = true
              } else {
                if (shotBuffer > 0) {
                  shotBuffer--
                } else {
                  shot = false
                }
              }
            }
          }
        })

        shoot(bX || mouseX, bY || mouseY)
      }
    }
    const renderOtherPlayers = () => {
      const coords = Object.values(players)
      coords.forEach(coord => {
        ctx.beginPath()
        ctx.arc(
          center[0] + pX - coord.x,
          center[1] + pY - coord.y,
          playerSize,
          0,
          Math.PI * 2
        )
        // ctx.rect(center[0], center[1], playerSize, playerSize - 5)
        ctx.fillStyle = palette.playerColor
        ctx.fill()
        ctx.closePath()
      })
    }
    const renderOtherBullets = () => {
      bullets.map(shot => {
        ctx.beginPath()
        ctx.moveTo(center[0] + pX - shot.startX, center[1] + pY - shot.startY)
        ctx.lineTo(center[0] + pX - shot.endX, center[1] + pY -shot.endX)
        ctx.strokeStyle = palette.tracer
        ctx.stroke()
      })
      clearBullets()
    }
    const renderPlayer = () => {
      if (!playerDead) {
        ctx.beginPath()
        ctx.arc(center[0], center[1], playerSize, 0, Math.PI * 2)
        // ctx.rect(center[0], center[1], playerSize, playerSize - 5)
        ctx.fillStyle = palette.playerColor
        ctx.fill()
        ctx.closePath()
        let x = center[0] - pX
        let y = center[1] - pY
        const zeds = Object.values(zombieList)
        zeds.map(zed => {
          if (
            x + playerSize > zed.x - playerSize &&
            x - playerSize < zed.x + playerSize &&
            y + playerSize > zed.y - playerSize &&
            y - playerSize < zed.y + playerSize
          ) {
            if (health > 0) {
              health -= 0.3
              healthBuffer = 4000
            }
          }
          if (health <= 0) {
            playerDead = true
            killPlayer()
          }
          if (healthBuffer > 0) {
            healthBuffer--
          } else if (health < 296) {
            health += 0.1
          }
        })
      }
    }
    const renderInfo = () => {
      ctx.beginPath()
      ctx.fillStyle = palette.pointsColor
      ctx.font = '30px Arial'
      ctx.fillText(`X:${pX},Y:${pY}`, 10, 50)
      ctx.closePath()
    }

    const renderFX = () => {
      if (health > 0) {
        ctx.fillStyle = `rgba(200,30,30,${(100 / health) * 0.1})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = `rgba(200,30,30,1)`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    const renderStats = () => {
      ctx.beginPath()
      ctx.fillStyle = palette.healthBarBG
      // containers
      ctx.fillRect(10, canvas.height - 50, 300, 20)
      ctx.fillRect(10, canvas.height - 80, 300, 20)
      // percentages
      ctx.fillStyle = palette.healthBarFG
      ctx.fillRect(12, canvas.height - 48, health, 16)
      ctx.fillStyle = palette.staminaBarFG
      ctx.fillRect(12, canvas.height - 78, stamina, 16)
      ctx.fillStyle = palette.pointsColor
      ctx.font = '30px Arial'
      ctx.fillText(points, 10, canvas.height - 100)
      ctx.closePath()
      if (playerDead) {
        ctx.beginPath()
        ctx.fillStyle = palette.pointsColor
        ctx.font = '30px Arial'
        ctx.fillText('You Died', center[0], center[1])
        ctx.closePath()
      }
    }

    const draw = () => {
      ctx.canvas.width = window.innerWidth
      ctx.canvas.height = window.innerHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = palette.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      playerMotionHandler()
      renderBullets()
      renderOtherBullets()
      renderInfo()
      renderPlayer()
      renderOtherPlayers()
      renderZombies()
      renderMap()
      renderFX()
      renderStats()

      movePlayer(pX, pY)
    }
    interval = setInterval(draw, 10)
  }

  render () {
    return (
      <div>
        <canvas
          ref='canvas'
          width={window.width}
          height={window.height}
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
