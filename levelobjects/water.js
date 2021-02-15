class Water extends LevelObject {
  constructor( points ) {
    super( )
    this.points = points
  }
  drawBackground( ) {
    stroke( pallete.water )
    strokeWeight( 1 )
    fill( pallete.water )
    beginShape( )
    this.points.forEach( p => vertex( p.x, p.y ) )
    endShape( )
  }
  drawEditorUI( ) {
    if ( editorTool === 0 ) {
      stroke( pallete.ui.main )
      strokeWeight( 3 / cameraScale )
      this.points.forEach( ( p, i ) => line(
        p.x, p.y,
        this.points[ ( i + 1 ) % this.points.length ].x,
        this.points[ ( i + 1 ) % this.points.length ].y
      ) )
      fill( "#fff" )
      this.points.forEach( p =>
        circle( p.x, p.y, 8 / cameraScale )
      )
    }
  }
  toSimpleObject( ) {
    return { type: "water", points: this.points }
  }
  static fromSimpleObject( obj ) {
    return new Water( obj.points )
  }
  tryAdjust( x, y ) {
    let d = ( 11 / cameraScale ) / 2
    for ( let i = 0; i < this.points.length; i++ ) {
      let tpi = this.points[ i ]
      if ( ( tpi.x - x ) ** 2 + ( tpi.y - y ) ** 2 <= d ** 2 ) {
        let t = this, origin = { x: tpi.x, y: tpi.y }
        return {
          move: ( x, y ) => {
            x = round( x / 10 ) * 10
            y = round( y / 10 ) * 10
            tpi.x = x
            tpi.y = y
            if ( origin.x !== tpi.x || origin. y !== tpi.y ) origin = false
          },
          finish: ( x, y ) => {
            if ( origin ) {
              if ( t.points.length <= 3 ) {
                let alo = activeLevel.levelobjects
                for ( let i = alo.length - 1; i >= 0; i-- ) {
                  if ( alo[ i ] === t ) {
                    alo.splice( i, 1 )
                    return
                  }
                }
              } else {
                for ( let i = t.points.length - 1; i >= 0; i-- ) {
                  if ( t.points[ i ] === tpi ) {
                    t.points.splice( i, 1 )
                    return
                  }
                }
              }
            }
          }
        }
      }
    }
    for ( let i = 0; i < this.points.length; i++ ) {
      let a = this.points[ i ], b = this.points[ ( i + 1 ) % this.points.length ]
      let cpl = closestPointOnLineSegment( x, y, a.x, a.y, b.x, b.y )
      if ( ( cpl.x - x ) ** 2 + ( cpl.y - y ) ** 2 <= d ** 2 ) {
        this.points.splice( i + 1, 0, {
          x: round( x / 10 ) * 10,
          y: round( y / 10 ) * 10
        } )
        let tpi = this.points[ i + 1 ]
        return {
          move: ( x, y ) => {
            tpi.x = round( x / 10 ) * 10
            tpi.y = round( y / 10 ) * 10
          },
          finish: ( ) => { }
        }
      }
    }
    return false
  }
  update( ) {
    if ( activeLevel.inwater ) return
    if ( pointInPolygon( activeLevel.player.x, activeLevel.player.y, this.points ) )
      activeLevel.inwater = true
  }
  generateBoundaries( ) {
    let b = {
      x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity
    }
    this.points.forEach( p => {
      if ( p.x < b.x1 ) b.x1 = p.x
      if ( p.y < b.y1 ) b.y1 = p.y
      if ( p.x > b.x2 ) b.x2 = p.x
      if ( p.y > b.y2 ) b.y2 = p.y
    } )
    return b
  }
}