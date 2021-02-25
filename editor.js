const editorTools = [
  { name: "ADJUST", shortcut: "A",
    mouseStart: ( x, y ) => {
      let pStart = activeLevel.pStart
      let d = ( x - pStart.x ) ** 2 + ( y - pStart.y ) ** 2
      if ( d <= ( playerWidth / 2 ) ** 2 ) {
        adjustFns = {
          move: ( x, y ) => {
            pStart.x = round( x / 10 ) * 10
            pStart.y = round( y / 10 ) * 10
          },
          finish: ( ) => { }
        }
        return
      }
      for ( let i = activeLevel.levelobjects.length - 1; i >= 0; i-- ) {
        let res = activeLevel.levelobjects[ i ].tryAdjust( x, y )
        if ( res ) {
          adjustFns = res
          return
        }
      }
      adjustFns = { move: ( ) => { }, finish: ( ) => { } }
    },
    mouseDragged: ( x, y ) => {
      adjustFns.move( x, y )
    },
    mouseReleased: ( x, y ) => {
      adjustFns.finish( x, y )
      adjustFns = { move: ( ) => { }, finish: ( ) => { } }
    },
    smooth: true
  },
  { name: "LINE", shortcut: "L",
    mouseStart: ( x, y ) => {
      activeLevel.levelobjects.push( new Line(
        x, y, x, y
      ) )
    },
    mouseDragged: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          l = allo[ allo.length - 1 ]
      l.x2 = x
      l.y2 = y
    }
  },
  { name: "POLYGON", shortcut: "P",
    mouseStart: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          p = allo[ allo.length - 1 ],
          plp
      if ( p instanceof Polygon ) {
          plp = p.points[ p.points.length - 1 ]
      }
      if ( !plp || plp.x !== x || plp.y !== y ) {
        allo.push( new Polygon( [
        { x, y }, { x, y }
        ] ) )
      } else {
        p.points.push( { x, y } )
      }
    },
    mouseDragged: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          p = allo[ allo.length - 1 ],
          plp = p.points[ p.points.length - 1 ]
      plp.x = x
      plp.y = y
    }
  },
  { name: "GOAL", shortcut: "G",
    mouseStart: ( x, y ) => {
      activeLevel.levelobjects.push( new Goal(
        x, y, x, y
      ) )
    },
    mouseDragged: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          l = allo[ allo.length - 1 ]
      l.x2 = x
      l.y2 = y
    }
  },
  { name: "WATER", shortcut: "W",
    mouseStart: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          p = allo[ allo.length - 1 ],
          plp
      if ( p instanceof Water ) {
          plp = p.points[ p.points.length - 1 ]
      }
      if ( !plp || plp.x !== x || plp.y !== y ) {
        allo.push( new Water( [
        { x, y }, { x, y }
        ] ) )
      } else {
        p.points.push( { x, y } )
      }
    },
    mouseDragged: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          p = allo[ allo.length - 1 ],
          plp = p.points[ p.points.length - 1 ]
      plp.x = x
      plp.y = y
    }
  },
  { name: "SECRET AREA", shortcut: "S",
    mouseStart: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          p = allo[ allo.length - 1 ],
          plp
      if ( p instanceof SecretArea ) {
          plp = p.points[ p.points.length - 1 ]
      }
      if ( !plp || plp.x !== x || plp.y !== y ) {
        allo.push( new SecretArea( [
        { x, y }, { x, y }
        ] ) )
      } else {
        p.points.push( { x, y } )
      }
    },
    mouseDragged: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          p = allo[ allo.length - 1 ],
          plp = p.points[ p.points.length - 1 ]
      plp.x = x
      plp.y = y
    }
  },
  { name: "PAN", shortcut: "X" },
  { name: "SPIKE", shortcut: "K",
    mouseStart: ( x, y ) => {
      activeLevel.levelobjects.push( new Spike(
        x, y, x, y
      ) )
    },
    mouseDragged: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          l = allo[ allo.length - 1 ]
      l.x2 = x
      l.y2 = y
    }
  },
  { name: "MOMENTUM FIELD", shortcut: "F",
    mouseStart: ( x, y ) => {
      activeLevel.levelobjects.push( new MomentumField(
        0, x, y, x, y, 50, 0.05
      ) )
    },
    mouseDragged: ( x, y ) => {
      let allo = activeLevel.levelobjects,
          l = allo[ allo.length - 1 ]
      l.x2 = x
      l.y2 = y
      l.type = 1 * ( ( l.x1 !== l.x2 ) || ( l.y1 !== l.y2 ) )
    }
  }
]
editorTools[ -1 ] = { name: "NO TOOL SELECTED", shortcut: "" }

function drawEditor( ) {
  drawGrid( )
  translate( width / 2, height / 2 )
  scale( cameraScale )
  translate( -cameraX, -cameraY )
  activeLevel.drawForEditor( )
  resetMatrix( )
  stroke( "#000" )
  strokeWeight( 4 )
  fill( pallete.foreground )
  textFont( "Grandstander" )
  textSize( 30 )
  textAlign( LEFT, TOP )
  text( editorTools[ editorTool ].name, 15, 15 )
}

function drawGrid( ) {
  stroke( "#666" )
  strokeWeight( 8 * cameraScale )
  line(
    width / 2 - cameraX * cameraScale, 0,
    width / 2 - cameraX * cameraScale, height
  )
  line(
    0, height / 2 - cameraY * cameraScale,
    width, height / 2 - cameraY * cameraScale
  )
  strokeWeight( 3 * cameraScale )
  if ( 3 * cameraScale > 0.4 ) {
    for (
      let i = mod(
        width / 2 - cameraX * cameraScale,
        100 * cameraScale
      ); i < width; i += 100 * cameraScale
    ) {
      line( i, 0, i, height )
    }
    for (
      let i = mod(
        height / 2 - cameraY * cameraScale,
        100 * cameraScale
      ); i < height; i += 100 * cameraScale
    ) {
      line( 0, i, width, i )
    }
  }
  strokeWeight( cameraScale )
  if ( cameraScale > 0.4 ) {
    for (
      let i = mod(
        width / 2 - cameraX * cameraScale,
        10 * cameraScale
      ); i < width; i += 10 * cameraScale
    ) {
      line( i, 0, i, height )
    }
    for (
      let i = mod(
        height / 2 - cameraY * cameraScale,
        10 * cameraScale
      ); i < height; i += 10 * cameraScale
    ) {
      line( 0, i, width, i )
    }
  }
}