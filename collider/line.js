class LineCollider extends Collider {
  constructor( x1, y1, x2, y2 ) {
    super( )
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }
  draw( ) {
    stroke( pallete.debug.collider )
    strokeWeight( 1 )
    line( this.x1, this.y1, this.x2, this.y2 )
    let cx = this.x1 + ( this.x2 - this.x1 ) / 2
    let cy = this.y1 + ( this.y2 - this.y1 ) / 2
    let a = atan2( this.y2 - this.y1, this.x2 - this.x1 )
    noFill( )
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
    let tpx = player.x + ( playerWidth / 2 ) * cos( ca + PI / 2 )
    let tpy = player.y + ( playerWidth / 2 ) * sin( ca + PI / 2 )
    let ttx = tx + ( playerWidth / 2 ) * cos( ca + PI / 2 )
    let tty = ty + ( playerWidth / 2 ) * sin( ca + PI / 2 )
    let ins = lineSegmentIntersection(
      tpx, tpy, ttx, tty,
      this.x1, this.y1, this.x2, this.y2
    )
    if ( !ins.b ) return { collided: false }
    let rft = reflectOverLine(
      ttx, tty, this.x1, this.y1, this.x2, this.y2
    )
    let rfv = reflectOverLine(
      player.vx, player.vy,
      this.x1 - ins.x, this.y1 - ins.y, this.x2 - ins.x, this.y2 - ins.y
    )
    return {
      collided: true,
      nx: ins.x + ( playerWidth / 2 ) * cos( ca - PI / 2 ),
      ny: ins.y + ( playerWidth / 2 ) * sin( ca - PI / 2 ),
      ntx: rft.x + ( playerWidth / 2 ) * cos( ca - PI / 2 ),
      nty: rft.y + ( playerWidth / 2 ) * sin( ca - PI / 2 ),
      nvx: rfv.x,
      nvy: rfv.y
    }
  }
}