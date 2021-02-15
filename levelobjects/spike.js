class Spike extends LevelObject {
  constructor( x1, y1, x2, y2 ) {
    super( )
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.colliders = true
  }
  drawMidground( ) {
    if ( this.x1 === this.x2 && this.y1 === this.y2 ) return
    let nCells = floor( sqrt( ( this.x2 - this.x1 ) ** 2 + ( this.y2 - this.y1 ) ** 2 ) / 10 )
    noStroke( )
    let mpx = this.x1 + ( this.x2 - this.x1 ) / 2
    let mpy = this.y1 + ( this.y2 - this.y1 ) / 2
    let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
    fill( pallete.spike )
    for ( let i = 0; i < nCells; i++ ) {
      let d = ( i - ( nCells / 2 ) ) * 10
      beginShape( )
      vertex(
        mpx - d * cos( a ) + ( lineWidth / 2 ) * cos( a - PI / 2 ),
        mpy - d * sin( a ) + ( lineWidth / 2 ) * sin( a - PI / 2 )
      )
      vertex(
        mpx - ( d + 5 ) * cos( a ) + 15 * cos( a - PI / 2 ),
        mpy - ( d + 5 ) * sin( a ) + 15 * sin( a - PI / 2 )
      )
      vertex(
        mpx - ( d + 10 ) * cos( a ) + ( lineWidth / 2 ) * cos( a - PI / 2 ),
        mpy - ( d + 10 ) * sin( a ) + ( lineWidth / 2 ) * sin( a - PI / 2 )
      )
      endShape( )
    }
  }
  drawEditorUI( ) {
    if ( editorTool === 0 ) {
      stroke( pallete.ui.main )
      strokeWeight( 3 / cameraScale )
      line( this.x1, this.y1, this.x2, this.y2 )
      fill( "#fff" )
      circle( this.x1, this.y1, 8 / cameraScale )
      circle( this.x2, this.y2, 8 / cameraScale )
    }
  }
  drawDebug( ) {
    this.colliders.forEach( c => c.draw( ) )
  }
  toSimpleObject( ) {
    return {
      type: "spike",
      x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2
    }
  }
  static fromSimpleObject( obj ) {
    return new Spike( obj.x1, obj.y1, obj.x2, obj.y2 )
  }
  generateBoundaries( ) {
    return {
      x1: min( this.x1, this.x2 ),
      y1: min( this.y1, this.y2 ),
      x2: max( this.x1, this.x2 ),
      y2: max( this.y1, this.y2 )
    }
  }
  generateColliders( ) {
    if ( this.x1 === this.x2 && this.y1 === this.y2 ) this.colliders = [ ]
    let len = floor( sqrt( ( this.x2 - this.x1 ) ** 2 + ( this.y2 - this.y1 ) ** 2 ) / 10 ) * 10
    let mpx = this.x1 + ( this.x2 - this.x1 ) / 2
    let mpy = this.y1 + ( this.y2 - this.y1 ) / 2
    let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
    this.colliders = [
      new DeathCollider(
        mpx - ( len / 2 ) * cos( a ) + ( lineWidth / 2 ) * cos( a - PI / 2 ),
        mpy - ( len / 2 ) * sin( a ) + ( lineWidth / 2 ) * sin( a - PI / 2 ),
        mpx - ( len / 2 - 5 ) * cos( a ) + 15 * cos( a - PI / 2 ),
        mpy - ( len / 2 - 5 ) * sin( a ) + 15 * sin( a - PI / 2 )
      ),
      new DeathCollider(
        mpx - ( len / 2 - 5 ) * cos( a ) + 15 * cos( a - PI / 2 ),
        mpy - ( len / 2 - 5 ) * sin( a ) + 15 * sin( a - PI / 2 ),
        mpx + ( len / 2 - 5 ) * cos( a ) + 15 * cos( a - PI / 2 ),
        mpy + ( len / 2 - 5 ) * sin( a ) + 15 * sin( a - PI / 2 )
      ),
      new DeathCollider(
        mpx + ( len / 2 - 5 ) * cos( a ) + 15 * cos( a - PI / 2 ),
        mpy + ( len / 2 - 5 ) * sin( a ) + 15 * sin( a - PI / 2 ),
        mpx + ( len / 2 ) * cos( a ) + ( lineWidth / 2 ) * cos( a - PI / 2 ),
        mpy + ( len / 2 ) * sin( a ) + ( lineWidth / 2 ) * sin( a - PI / 2 )
      )
    ]
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
    if ( point === 0 ) return false
    let t = this, origin
    if ( point === 1 ) origin = { x: this.x1, y: this.y1 }
    if ( point === 2 ) origin = { x: this.x2, y: this.y2 }
    return {
      move: ( x, y ) => {
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
      },
      finish: ( x, y ) => {
        if ( !origin ) return
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