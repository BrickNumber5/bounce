class MomentumField extends LevelObject {
  constructor( type, x1, y1, x2, y2, range, strength ) {
    super( )
    // type = 0 : point, type = 1 : line
    this.type = type
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.range = range
    this.strength = strength
  }
  drawBackground( ) {
    stroke( pallete.background )
    strokeWeight( lineWidth )
    line( this.x1, this.y1, this.x2, this.y2 )
    fill( pallete.momentumfield.bg )
    if ( this.type ) {
      let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
      beginShape( )
      vertex( this.x2, this.y2 )
      vertex( this.x1, this.y1 )
      vertex( this.x1 + this.range * cos( a - PI / 2 ), this.y1 + this.range * sin( a - PI / 2 ) )
      vertex( this.x2 + this.range * cos( a - PI / 2 ), this.y2 + this.range * sin( a - PI / 2 ) )
      endShape( CLOSE )
    } else {
      circle( this.x1, this.y1, this.range * 2 )
      point( this.x1, this.y1 )
    }
  }
  drawEditorUI( ) {
    if ( editorTool === 0 ) {
      let mpx = this.x1 + ( this.x2 - this.x1 ) / 2,
          mpy = this.y1 + ( this.y2 - this.y1 ) / 2
      let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
      stroke( pallete.ui.secondary )
      line( mpx, mpy, mpx + this.range * cos( a - PI / 2 ), mpy + this.range * sin( a - PI / 2 ) )
      circle( mpx + this.range * cos( a - PI / 2 ), mpy + this.range * sin( a - PI / 2 ), 8 / cameraScale )
      stroke( pallete.ui.main )
      strokeWeight( 3 / cameraScale )
      line( this.x1, this.y1, this.x2, this.y2 )
      fill( "#fff" )
      circle( this.x1, this.y1, 8 / cameraScale )
      circle( this.x2, this.y2, 8 / cameraScale )
    }
  }
  update( ) {
    if ( this.type ) {
      let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
      if ( pointInPolygon( activeLevel.player.x, activeLevel.player.y, [
        { x: this.x2, y: this.y2 },
        { x: this.x1, y: this.y1 },
        { x: this.x1 + this.range * cos( a - PI / 2 ), y: this.y1 + this.range * sin( a - PI / 2 ) },
        { x: this.x2 + this.range * cos( a - PI / 2 ), y: this.y2 + this.range * sin( a - PI / 2 ) }
      ] ) ) {
        let clp = closestPointOnLine( activeLevel.player.x, activeLevel.player.y, this.x1, this.y1, this.x2, this.y2 )
        let l = sqrt( ( clp.x - activeLevel.player.x ) ** 2 + ( clp.y - activeLevel.player.y ) ** 2 )
        activeLevel.player.vx += this.strength * ( activeLevel.player.x - clp.x ) / l
        activeLevel.player.vy += this.strength * ( activeLevel.player.y - clp.y ) / l
      }
    } else {
      let l = sqrt( ( this.x1 - activeLevel.player.x ) ** 2 + ( this.y1 - activeLevel.player.y ) ** 2 )
      if ( l <= this.range ) {
        activeLevel.player.vx += this.strength * ( activeLevel.player.x - this.x1 ) / l
        activeLevel.player.vy += this.strength * ( activeLevel.player.y - this.y1 ) / l
      }
    }
  }
  toSimpleObject( ) {
    return { type: "momentumfield", fieldtype: this.type, x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2, range: this.range, strength: this.strength }
  }
  static fromSimpleObject( obj ) {
    return new MomentumField( obj.fieldtype, obj.x1, obj.y1, obj.x2, obj.y2,obj.range, obj.strength )
  }
  tryAdjust( x, y ) {
    let d = ( 11 / cameraScale ) / 2
    let point = 0
    if ( ( this.x1 - x ) ** 2 + ( this.y1 - y ) ** 2 <= d ** 2 ) {
      point = 1
    }
    if ( ( this.x2 - x ) ** 2 + ( this.y2 - y ) ** 2 <= d ** 2 ) {
      point = 2
    }
    if ( point === 0 ) {
      let mpx = this.x1 + ( this.x2 - this.x1 ) / 2,
          mpy = this.y1 + ( this.y2 - this.y1 ) / 2
      let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
      let rpx = mpx + this.range * cos( a - PI / 2 ),
          rpy = mpy + this.range * sin( a - PI / 2 )
      if ( ( rpx - x ) ** 2 + ( rpy - y ) ** 2 <= d ** 2 ) point = 3
      if ( point === 0 ) return false
    }
    let t = this, origin
    if ( point === 1 ) origin = { x: this.x1, y: this.y1 }
    if ( point === 2 ) origin = { x: this.x2, y: this.y2 }
    return {
      move: ( x, y ) => {
        if ( point === 3 ) {
          if ( t.type ) {
            let clp = closestPointOnLine( x, y, t.x1, t.y1, t.x2, t.y2 )
            t.range = round( sqrt( ( clp.x - x ) ** 2 + ( clp.y - y ) ** 2 ) / 10 ) * 10
            
          } else {
            t.range = round( sqrt( ( t.x1 - x ) ** 2 + ( t.y1 - y ) ** 2 ) / 10 ) * 10
          }
          return
        }
        x = round( x / 10 ) * 10
        y = round( y / 10 ) * 10
        if ( point === 1 ) {
          t.x1 = x
          t.y1 = y
        }
        if ( point === 2 ) {
          t.x2 = x
          t.y2 = y
        }
        if ( x !== origin.x || y !== origin.y ) origin = false
        t.type = 1 * ( ( t.x1 !== t.x2 ) || ( t.y1 !== t.y2 ) )
      },
      finish: ( x, y ) => {
        if ( !origin || point === 3 ) return
        if ( t.type ) {
          this.type = 0
          if ( point === 1 ) {
            this.x1 = this.x2
            this.y1 = this.y2
          } else {
            this.x2 = this.x1
            this.y2 = this.y1
          }
        } else {
          let alo = activeLevel.levelobjects
          for ( let i = alo.length - 1; i >= 0; i-- ) {
            if ( alo[ i ] === t ) {
              alo.splice( i, 1 )
              break
            }
          }
        }
      }
    }
  }
}