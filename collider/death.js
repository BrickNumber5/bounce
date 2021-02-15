class DeathCollider extends Collider {
  constructor( x1, y1, x2, y2 ) {
    super( )
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }
  draw( ) {
    stroke( pallete.debug.danger )
    strokeWeight( 1 )
    line( this.x1, this.y1, this.x2, this.y2 )
    let cx = this.x1 + ( this.x2 - this.x1 ) / 2
    let cy = this.y1 + ( this.y2 - this.y1 ) / 2
    let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
    beginShape( )
    vertex( cx + 4 * cos( a ), cy + 4 * sin( a ) )
    vertex(
      cx + 4 * cos( a - PI / 2 ), cy + 4 * sin( a - PI / 2 )
    )
    vertex( cx - 4 * cos( a ), cy - 4 * sin( a ) )
    endShape( )
  }
  collision( player, tx, ty ) {
    let ca = atan2( this.y2 - this.y1, this.x2 - this.x1 )
    let va = atan2( player.vy, player.vx )
    if ( cos( ca - PI / 2 - va ) > 0 ) return { collided: false }
    let ttx = tx + ( playerWidth / 2 ) * cos( ca + PI / 2 )
    let tty = ty + ( playerWidth / 2 ) * sin( ca + PI / 2 )
    let ins = lineSegmentIntersection(
      player.x, player.y, ttx, tty,
      this.x1, this.y1, this.x2, this.y2
    )
    if ( !ins.b ) return { collided: false }
    return {
      collided: true,
      nx: ins.x + ( playerWidth / 2 ) * cos( ca - PI / 2 ),
      ny: ins.y + ( playerWidth / 2 ) * sin( ca - PI / 2 ),
      ntx: ins.x + ( playerWidth / 2 ) * cos( ca - PI / 2 ),
      nty: ins.y + ( playerWidth / 2 ) * sin( ca - PI / 2 ),
      nvx: 0,
      nvy: 0,
      do: ( ) => { activeLevel.dead = true },
      end: true
    }
  }
}