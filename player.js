class Player {
  constructor( ) {
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.cd = false
  }
  move( tx, ty, lobjs ) {
    let cc = null, ccd = Infinity
    lobjs.forEach( lo => {
      if ( lo.colliders ) {
        lo.colliders.forEach( col => {
          let dat = col.collision( this, tx, ty )
          if ( dat.collided ) {
            let d = ( this.x - dat.nx ) ** 2 + ( this.y - dat.ny ) ** 2
            if ( d < ccd ) {
              cc = dat
              ccd = d
            }
          }
        } )
      }
      if ( lo instanceof Goal ) {
        lo.checkCross( this.x, this.y, tx, ty )
      }
    } )
    if ( cc ) {
      this.x = cc.nx
      this.y = cc.ny
      this.vx = cc.nvx
      this.vy = cc.nvy
      this.cd = true
      if ( cc.do ) cc.do( )
      if ( !cc.end ) this.move( cc.ntx, cc.nty, lobjs )
      return
    }
    this.x = tx
    this.y = ty
  }
  dash( x, y ) {
    if ( !this.cd ) return
    let a = atan2( y - smy, x - smx ) + PI
    this.vx += dashStrength * cos( a )
    this.vy += dashStrength * sin( a )
    this.cd = false
  }
}