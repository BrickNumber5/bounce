class Polygon extends LevelObject {
  constructor( points ) {
    super( )
    this.points = points
    this.colliders = true
  }
  drawMidground( ) {
    fill( pallete.foreground )
    stroke( pallete.foreground )
    strokeWeight( lineWidth )
    strokeJoin( ROUND )
    beginShape( )
    this.points.forEach( p => vertex( p.x, p.y ) )
    endShape( CLOSE )
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
  drawDebug( ) {
    this.colliders.forEach( c => c.draw( ) )
  }
  toSimpleObject( ) {
    return { type: "polygon", points: this.points }
  }
  static fromSimpleObject( obj ) {
    return new Polygon( obj.points )
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
  generateColliders( ) {
    let isCW = this.calculateOrientation( )
    this.colliders = [ ]
    this.points.forEach( ( p, i ) => {
      let p2 = this.points[ ( i + 1 ) % this.points.length ]
      let a = atan2( p2.y - p.y, p2.x - p.x )
      if ( isCW ) a += PI
      if ( isCW ) {
        this.colliders.push( new LineCollider(
          p2.x + ( lineWidth / 2 ) * cos( a - PI / 2 ),
          p2.y + ( lineWidth / 2 ) * sin( a - PI / 2 ),
          p.x + ( lineWidth / 2 ) * cos( a - PI / 2 ),
          p.y + ( lineWidth / 2 ) * sin( a - PI / 2 )
        ) )
      } else {
        this.colliders.push( new LineCollider(
          p.x + ( lineWidth / 2 ) * cos( a - PI / 2 ),
          p.y + ( lineWidth / 2 ) * sin( a - PI / 2 ),
          p2.x + ( lineWidth / 2 ) * cos( a - PI / 2 ),
          p2.y + ( lineWidth / 2 ) * sin( a - PI / 2 )
        ) )
      }
      let p3 = this.points[
        mod( i - 1, this.points.length )
      ]
      let b = atan2( p.y - p3.y, p.x - p3.x )
      if ( isCW ) b += PI
      if ( isCW ) {
        this.colliders.push( new ArcCollider(
          p.x, p.y,
          lineWidth,
          a - PI / 2,
          b - PI / 2
        ) )
      } else {
        this.colliders.push( new ArcCollider(
          p.x, p.y,
          lineWidth,
          b - PI / 2,
          a - PI / 2
        ) )
      }
    } )
  }
  calculateOrientation( ) {
    let a = { x: -Infinity, y: -Infinity }, ai = -1
    this.points.forEach( ( p, i ) => {
      if ( p.x > a.x || ( p.x == a.x && p.y > a.y ) ) {
        a = p
        ai = i
      }
    } )
    let bi = ai - 1, ci = ai + 1
    if ( bi < 0 ) bi = this.points.length - 1
    if ( ci == this.points.length ) ci = 0
    let b = this.points[ bi ], c = this.points[ ci ]
    let cw = ( b.x * c.y + a.x * b.y + c.x * a.y )
            - ( b.x * a.y + c.x * b.y + a.x * c.y ) > 0
    return cw
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
}