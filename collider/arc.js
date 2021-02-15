class ArcCollider extends Collider {
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
    stroke( pallete.debug.collider )
    strokeWeight( 1 )
    arc( this.x, this.y, this.d, this.d, this.sA, this.eA )
  }
  collision( player, tx, ty ) {
    
    let ins = lineSegmentCircleIntersection(
      player.x, player.y, tx, ty,
      this.x, this.y, ( this.d + playerWidth ) / 2
    )
    if ( !ins.b ) return { collided: false }
    let a = atan2( ins.y - this.y, ins.x - this.x )
    let rft = reflectOverLine(
      tx, ty,
      ins.x, ins.y, ins.x + cos( a + PI / 2 ), ins.y + sin( a + PI / 2 )
    )
    let rfv = reflectOverLine(
      player.vx, player.vy,
      0, 0, cos( a + PI / 2 ), sin( a + PI / 2 )
    )
    return {
      collided: true,
      nx: ins.x,
      ny: ins.y,
      ntx: rft.x,
      nty: rft.y,
      nvx: rfv.x,
      nvy: rfv.y
    }
  }
}