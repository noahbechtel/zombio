module.exports = () => {
  let xMax = 2000
  let yMax = 2000
  let x = xMax * -1
  let y = yMax * -1

  let constructs = []
  const mapBuilder = () => {
    let smallCubes = [
      { x: x + 0, y: 0, width: 100, height: 10 },
      { x: x + 0, y: y + 0, width: 10, height: 460 },
      { x: x + 460, y: y + 0, width: 10, height: 460 },
      { x: x + 10, y: y, width: 40, height: 10 },
      { x: x + 370, y: y, width: 90, height: 10 },
      { x: x + 160, y: y, width: 150, height: 10 },
      { x: x + 10, y: y + 450, width: 80, height: 10 },
      { x: x + 370, y: y + 450, width: 90, height: 10 },
      { x: x + 160, y: y + 450, width: 150, height: 10 },
      { x: x + 0, y: y + 230, width: 460, height: 10 },
      { x: x + 230, y: y + 0, width: 10, height: 460 }
    ]
    let corridors = [
      { x: x + 0, y: 0, width: 100, height: 10 },
      { x: x + 0, y: y + 0, width: 10, height: 460 },
      { x: x + 460, y: y + 0, width: 10, height: 460 },
      { x: x + 10, y: y, width: 40, height: 10 },
      { x: x + 370, y: y, width: 90, height: 10 },
      { x: x + 160, y: y, width: 150, height: 10 },
      { x: x + 10, y: y + 450, width: 80, height: 10 },
      { x: x + 370, y: y + 450, width: 90, height: 10 },
      { x: x + 160, y: y + 450, width: 150, height: 10 },
      { x: x + 230, y: y + 0, width: 10, height: 460 }
    ]
    let lShape = [
      { x: x + 0, y: y + 150, width: 210, height: 10 },
      { x: x + 200, y: y + 0, width: 10, height: 150 },
      { x: x + 200, y: y + 0, width: 100, height: 10 },
      { x: x + 360, y: y + 0, width: 100, height: 10 },
      { x: x + 450, y: y + 0, width: 10, height: 460 },
      { x: x + 0, y: y + 460, width: 460, height: 10 },
      { x: x + 0, y: y + 150, width: 10, height: 75 },
      { x: x + 0, y: y + 300, width: 10, height: 160 }
    ]
    let openRoom = [
      { x: x + 0, y: y, width: 190, height: 10 },
      { x: x + 270, y: y, width: 200, height: 10 },
      { x: x + 0, y: y + 450, width: 190, height: 10 },
      { x: x + 270, y: y + 450, width: 200, height: 10 },
      { x: x + 460, y: y + 0, width: 10, height: 190 },
      { x: x + 460, y: y + 270, width: 10, height: 190 },
      { x: x, y: y + 0, width: 10, height: 190 },
      { x: x, y: y + 270, width: 10, height: 190 }
    ]
    let toolSet = [openRoom, corridors, smallCubes, lShape]
    toolSet[Math.floor(Math.random() * toolSet.length)].map(el =>
      constructs.push(el)
    )
    x += 700
    if (x >= xMax) {
      console.log('Max X reached, dropping Y', x, y)
      y += 700
      x = xMax * -1
      if (y < yMax) {
        mapBuilder()
        console.log('Restarting')
      } else {
        return constructs
      }
    } else {
      mapBuilder()
    }
  }
  mapBuilder()
  return constructs
}
