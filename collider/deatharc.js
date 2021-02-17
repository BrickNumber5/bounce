class DeathArcCollider extends Collider {
  constructor( x, y, d, startAngle, endAngle ) {
    super( )
    this.x = x
    this.y = y
    this.d = d
    this.sA = startAngle
    this.eA = endAngle
  }
  draw( ) {
    noFill( )
    stroke( pallete.debug.danger )
    strokeWeight( 1 )
    arc( this.x, this.y, this.d, this.d, this.sA, this.eA )
  }
  collision( player, tx, ty ) {
    if ( ( this.x - player.x ) ** 2 + ( this.y - player.y ) ** 2 < ( ( this.d + playerWidth ) / 2 ) ** 2 ) return { collided: false }
    let pta = atan2( player.y - this.y, player.x - this.x )
    if ( !withinAngle( pta, this.sA, this.eA ) ) return { collided: false }
    let ins = lineSegmentCircleIntersection(
      player.x, player.y, tx, ty,
      this.x, this.y, ( this.d + playerWidth ) / 2
    )
    if ( !ins.b ) return { collided: false }
    return {
      collided: true,
      nx: ins.x + ( playerWidth / 2 ) * cos( pta - PI / 2 ),
      ny: ins.y + ( playerWidth / 2 ) * sin( pta - PI / 2 ),
      ntx: ins.x + ( playerWidth / 2 ) * cos( pta - PI / 2 ),
      nty: ins.y + ( playerWidth / 2 ) * sin( pta - PI / 2 ),
      nvx: 0,
      nvy: 0,
      do: ( ) => { activeLevel.dead = true },
      end: true
    }
  }
}