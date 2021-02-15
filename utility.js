const playerWidth = 30, lineWidth = 5,
      builtinLevels = [ ],
      pallete = {
        background: "#333",
        foreground: "#ccc",
        player: {
          main: "#33c",
          trail: "#44f",
          action: "#3cc",
          actionOff: "#888"
        },
        ui: {
          main: "#33c"
        },
        debug: {
          collider: "#0f0",
          main: "#0f0",
          danger: "#f80"
        },
        goal: {
          white: "#fff",
          black: "#000"
        },
        water: "#07f",
        secretarea: "#555",
        spike: "#c33"
      },
      boundsPadding = 50,
      dashStrength = 2,
      currentVersion = "1.2.0"
// Mode | 0 : Menu, 1 : Play, 2 : Edit
let mode = 0, pmode= 0,
    customLevels = [ ],
    activeLevel,
    cameraX = 0, cameraY = 0, cameraScale = 1,
    pmx, pmy,
    editorTool = -1,
    debug = false,
    smx = 0, smy = 0, cmx = 0, cmy = 0,
    adjustFns = { },
    panPmx, panPmy

function mod( n, m ) {
  return ( ( n % m ) + m ) % m
}

function screenToLevel( x, y ) {
  return {
    x: round( (
      ( x - width / 2 ) / cameraScale + cameraX
    ) / 10 ) * 10,
    y: round( (
      ( y - height / 2 ) / cameraScale + cameraY
    ) / 10 ) * 10
  }
}

function screenToLevelSmooth( x, y ) {
  return {
    x: ( x - width / 2 ) / cameraScale + cameraX,
    y: ( y - height / 2 ) / cameraScale + cameraY
  }
}

function download( name, content ) {
  let blob = new Blob( [ content ] )
  let a = document.createElement( "a" )
  a.href = URL.createObjectURL( blob )
  a.download = name
  a.click( )
}

function upload( callback ) {
  let inp = document.createElement( "input" )
  inp.type = "file"
  inp.accept = ".blvl, .blpk"
  inp.multiple = true
  let i = 0
  inp.onchange = ( ) => {
    let files = inp.files
    const reader = new FileReader( )
    reader.addEventListener( "load", ( ) => {
      callback( reader.result, files[ i ] )
      i++
      if ( i < files.length ) reader.readAsText( files[ i ] )
    } )
    reader.readAsText( files[ i ] )
  }
  inp.click( )
}

function lineSegmentIntersection( x1, y1, x2, y2, x3, y3, x4, y4 ) {
  let d = ( x1 - x2 ) * ( y3 - y4 ) - ( y1 - y2 ) * ( x3 - x4 )
  let t = ( ( x1 - x3 ) * ( y3 - y4 ) - ( y1 - y3 ) * ( x3 - x4 ) ) / d
  let u = - ( ( x1 - x2 ) * ( y1 - y3 ) - ( y1 - y2 ) * ( x1 - x3 ) ) / d
  let x = x1 + t * ( x2 - x1 ), y = y1 + t * ( y2 - y1 )
  let b = t >= 0 && t <= 1 && u >= 0 && u <= 1
  return { t, u, x, y, b }
}

function lineSegmentCircleIntersection(
  ax, ay, bx, by, cx, cy, r
) {
  ax -= cx
  ay -= cy
  bx -= cx
  by -= cy
  
  let A = ax ** 2 + ay ** 2
        - 2 * ( ax * bx + ay * by )
        + bx ** 2 + by ** 2
  let B = 2 * ( ax * bx + ay * by - bx ** 2 - by ** 2 )
  let C = bx ** 2 + by ** 2 - r ** 2
  
  let t1 = ( -B + sqrt( B ** 2 - ( 4 * A * C ) ) )
         / ( 2 * A )
  let t2 = ( -B - sqrt( B ** 2 - ( 4 * A * C ) ) )
         / ( 2 * A )
  
  let t = max( t1, t2 )
  
  let b = t >= 0 && t <= 1
  
  let ix = ax * t + bx * ( 1 - t )
  let iy = ay * t + by * ( 1 - t )
  
  ix += cx
  iy += cy
  
  return { t, b, x: ix, y: iy }
}

function reflectOverLine( p, q, x1, y1, x2, y2 ) {
  // ax + by + c = 0
  let a = y1 - y2, b = x2 - x1, c = x1 * y2 - x2 * y1
  let ab2 = a ** 2 + b ** 2
  return {
    x: ( p * ( b ** 2 - a ** 2 ) - 2 * a * ( b * q + c ) ) / ab2,
    y: ( q * ( a ** 2 - b ** 2 ) - 2 * b * ( a * p + c ) ) / ab2
  }
}

function closestPointOnLineSegment( px, py, ax, ay, bx, by ) {
  let vx = bx - ax
  let vy = by - ay
  let ux = ax - px
  let uy = ay - py
  let vu = vx * ux + vy * uy
  let vv = vx ** 2 + vy ** 2
  let t = -vu / vv
  if ( t >= 0 && t <= 1 ) return { x: ( 1 - t ) * ax + t * bx, y: ( 1- t ) * ay + t * by }
  let g0 = ( ax - px ) ** 2 + ( ay - py ) ** 2
  let g1 = ( bx - px ) ** 2 + ( by - py ) ** 2
  return g0 <= g1 ? { x: ax, y: ay } : { x: bx, y: by }
}

function pointInPolygon( px, py, points ) {
  let nCrosses = 0
  points.forEach( ( p, i ) => {
    let ins = lineSegmentIntersection( 
      px, py, px + 1, py,
      p.x, p.y, points[ ( i + 1 ) % points.length ].x, points[ ( i + 1 ) % points.length ].y
    )
    if ( ins.t >= 0 && ins.u >= 0 && ins.u < 1 ) {
      nCrosses++
    }
  } )
  return nCrosses % 2 === 1
}

function windowResized( ) {
  resizeCanvas( windowWidth, windowHeight )
}