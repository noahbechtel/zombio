module.exports = () => {
  let xMax = 2000
  let yMax = 2000
  let x = xMax * -1
  let y = yMax * -1
  let blockSize = 460
  let roadsize = 100
  let sidewalkSize = 40
  let constructs = []
  let decals = []
  const mapBuilder = () => {
    let smallCubes = [
      { x, y, width: 100, height: 10 },
      { x, y, width: 10, height: 460 },
      { x: x + 460, y, width: 10, height: 460 },
      { x: x + 10, y, width: 40, height: 10 },
      { x: x + 370, y, width: 90, height: 10 },
      { x: x + 160, y, width: 150, height: 10 },
      { x: x + 10, y: y + 450, width: 80, height: 10 },
      { x: x + 370, y: y + 450, width: 90, height: 10 },
      { x: x + 160, y: y + 450, width: 150, height: 10 },
      { x, y: y + 230, width: 460, height: 10 },
      { x: x + 230, y, width: 10, height: 460 }
    ]
    let corridors = [
      { x, y, width: 100, height: 10 },
      { x, y, width: 10, height: 460 },
      { x: x + 460, y, width: 10, height: 460 },
      { x: x + 10, y, width: 40, height: 10 },
      { x: x + 370, y, width: 90, height: 10 },
      { x: x + 160, y, width: 150, height: 10 },
      { x: x + 10, y: y + 450, width: 80, height: 10 },
      { x: x + 370, y: y + 450, width: 90, height: 10 },
      { x: x + 160, y: y + 450, width: 150, height: 10 },
      { x: x + 230, y, width: 10, height: 460 }
    ]
    let lShape = [
      { x, y: y + 150, width: 210, height: 10 },
      { x: x + 200, y, width: 10, height: 150 },
      { x: x + 200, y, width: 100, height: 10 },
      { x: x + 360, y, width: 100, height: 10 },
      { x: x + 460, y, width: 10, height: 460 },
      { x, y: y + 460, width: 470, height: 10 },
      { x, y: y + 150, width: 10, height: 75 },
      { x, y: y + 300, width: 10, height: 160 }
    ]
    let openRoom = [
      { x, y, width: 190, height: 10 },
      { x: x + 270, y, width: 200, height: 10 },
      { x, y: y + 450, width: 190, height: 10 },
      { x: x + 270, y: y + 450, width: 200, height: 10 },
      { x: x + 460, y, width: 10, height: 190 },
      { x: x + 460, y: y + 270, width: 10, height: 190 },
      { x, y, width: 10, height: 190 },
      { x, y: y + 270, width: 10, height: 190 }
    ]

    const sidewalkVert = (x, y) => {
      decals.push({
        x,
        y,
        width: sidewalkSize,
        height: blockSize + sidewalkSize,
        type: 'sidewalk-verticle'
      })
    }

    const sidewalkHoriz = (x, y) => {
      decals.push({
        x: x - sidewalkSize,
        y,
        width: blockSize + sidewalkSize * 2 + 10,
        height: sidewalkSize,
        type: 'sidewalk-horizontal'
      })
    }
    const roadVert = (x, y) => {
      decals.push({
        x,
        y,
        width: roadsize,
        height: blockSize + roadsize * 2,
        type: 'road-verticle'
      })
    }
    const roadHoriz = (x, y) => {
      decals.push({
        x,
        y,
        width: blockSize + roadsize * 2,
        height: roadsize,
        type: 'road-horizontal'
      })
    }

    let toolSet = [openRoom, corridors, smallCubes, lShape]

    toolSet[Math.floor(Math.random() * toolSet.length)].map(el => {
      constructs.push(el)
    })
    x += blockSize + 10
    sidewalkVert(x, y)
    x += sidewalkSize
    roadVert(x, y)
    x += roadsize
    sidewalkVert(x, y)
    x += sidewalkSize

    y += blockSize
    sidewalkHoriz(x, y)
    y += sidewalkSize
    roadHoriz(x, y)
    y += roadsize
    sidewalkHoriz(x, y)
    y += sidewalkSize

    y -= sidewalkSize * 2 + roadsize + blockSize

    if (x >= xMax) {
      x = xMax * -1
      y += blockSize
      sidewalkHoriz(x, y)
      y += sidewalkSize
      roadHoriz(x, y)
      y += roadsize
      sidewalkHoriz(x, y)
      y += sidewalkSize

      if (y < yMax) {
        mapBuilder()
      } else {
        return { constructs, decals }
      }
    } else {
      mapBuilder()
    }
  }
  mapBuilder()
  return { constructs, decals }
}
