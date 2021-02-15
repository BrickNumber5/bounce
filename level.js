class Level {
  constructor( ) {
    this.title = "Unnamed Level"
    this.disc = ""
    this.author = ""
    this.pStart = { x: 0, y: 0 }
    this.player = new Player( )
    this.levelobjects = [ ]
    this.victoryTimer = Infinity
    this.dead = false
    this.trail = [ ]
    this.lastEditVersion = currentVersion
  }
  draw( ) {
    translate( width / 2, height / 2 )
    translate( -this.player.x, -this.player.y )
    this.levelobjects.forEach( lo => lo.drawBackground( ) )
    this.drawTrail( )
    this.levelobjects.forEach( lo => lo.drawMidground( ) )
    noStroke( )
    fill( pallete.player.main )
    circle( this.player.x, this.player.y, playerWidth )
    if ( debug ) {
      stroke( pallete.debug.main )
      strokeWeight( 1 )
      line(
        this.player.x, this.player.y,
        this.player.x + playerWidth * this.player.vx,
        this.player.y + playerWidth * this.player.vy
      )
    }
    this.levelobjects.forEach( lo => lo.drawForeground( ) )
    if ( debug ) this.levelobjects.forEach( lo => lo.drawDebug( ) )
    resetMatrix( )
    if ( mouseIsPressed ) {
      noFill( )
      if ( this.player.cd ) {
        stroke( pallete.player.action )
      } else {
        stroke( pallete.player.actionOff )
      }
      strokeWeight( 3 )
      line( smx, smy, cmx, cmy )
      let a = atan2( cmy - smy, cmx - smx ) + PI
      beginShape( )
      vertex(
        ( playerWidth / 2 + 10 ) * cos( a + PI / 4 ) + width / 2,
        ( playerWidth / 2 + 10 ) * sin( a + PI / 4 ) + height / 2
      )
      vertex(
        ( playerWidth / 2 + 10 ) * cos( a ) + width / 2,
        ( playerWidth / 2 + 10 ) * sin( a ) + height / 2
      )
      vertex(
        ( playerWidth / 2 + 10 ) * cos( a - PI / 4 ) + width / 2,
        ( playerWidth / 2 + 10 ) * sin( a - PI / 4 ) + height / 2
      )
      endShape( )
    }
  }
  drawForEditor( ) {
    this.levelobjects.forEach( lo => lo.drawBackground( ) )
    this.levelobjects.forEach( lo => lo.drawMidground( ) )
    noStroke( )
    fill( pallete.player.main )
    circle( this.pStart.x, this.pStart.y, playerWidth )
    this.levelobjects.forEach( lo => lo.drawForeground( ) )
    this.levelobjects.forEach( lo => lo.drawEditorUI( ) )
  }
  drawTrail( ) {
    noFill( )
    stroke( pallete.player.trail )
    for ( let i = 0; i < this.trail.length; i++ ) {
      strokeWeight( ( ( i + 1 ) / this.trail.length ) * playerWidth )
      if ( i === this.trail.length - 1 ) {
        line(
          this.player.x, this.player.y,
          this.trail[ i ].x, this.trail[ i ].y
        )
        continue
      }
      if ( i === this.trail.length - 1 || this.trail[ i + 1 ].d ) {
        point( this.trail[ i ].x, this.trail[ i ].y )
      } else {
        line(
          this.trail[ i ].x, this.trail[ i ].y,
          this.trail[ i + 1 ].x, this.trail[ i + 1 ].y
        )
      }
    }
    this.trail.shift( )
    this.trail.push( { x: this.player.x, y: this.player.y } )
  }
  toSimpleObject( ) {
    return {
      title: this.title,
      disc: this.disc,
      author: this.author,
      pStart: this.pStart,
      levelobjects: this.levelobjects.map(
        lo => lo.toSimpleObject( )
      ),
      lastEditVersion: this.lastEditVersion
    }
  }
  static fromSimpleObject( obj ) {
    let l = new Level( )
    l.title = obj.title || "Unnamed Level"
    l.disc = obj.disc || ""
    l.author = obj.author || ""
    l.pStart = obj.pStart || { x: 0, y: 0 }
    if ( !obj.levelobjects ) obj.levelobjects = [ ]
    l.levelobjects = obj.levelobjects.map(
      lo => LevelObject.fromSimpleObject( lo )
    )
    l.lastEditVersion = obj.lastEditVersion || currentVersion
    return l
  }
  start( ) {
    this.levelobjects.forEach( lo => {
      if ( lo.colliders ) lo.generateColliders( )
    } )
    this.levelobjects.forEach( lo => {
      if ( lo.start ) lo.start( )
    } )
    this.generateBoundaries( )
    this.victoryTimer = Infinity
    this.trail = Array( 150 ).fill( { x: NaN, y: NaN, d: true } )
    this.spawn( )
  }
  spawn( ) {
    this.player.x = this.pStart.x
    this.player.y = this.pStart.y
    this.player.vx = 0
    this.player.vy = 0
    this.player.cd = false
    this.trail.shift( )
    this.trail.push( { x: this.player.x, y: this.player.y, d: true } )
    this.victoryTimer = Infinity
    this.dead = false
  }
  update( ) {
    this.inwater = false
    //LevelObjectHandling
    this.levelobjects.forEach( lo => { if ( lo.update ) lo.update( ) } )
    //Friction
    if ( this.inwater ) {
      this.player.vx *= 0.99
      this.player.vy *= 0.99
      this.player.cd = true
    } else {
      this.player.vx *= 0.995
      this.player.vy *= 0.995
    }
    //Gravity
    if ( this.inwater ) {
      if ( this.player.vy < 10 ) this.player.vy += 0.03
    } else {
      if ( this.player.vy < 10 ) this.player.vy += 0.1
    }
    //Harsh Velocity Cap
    let s = this.player.vx ** 2 + this.player.vy ** 2
    if ( s > 25 ** 2 ) {
      let a = atan2( this.player.vy, this.player.vx )
      this.player.vx = 25 * cos( a )
      this.player.vy = 25 * sin( a )
    }
    //Move
    this.player.move(
      this.player.x + this.player.vx,
      this.player.y + this.player.vy,
      this.levelobjects
    )
    //Out of bounds
    if (
         this.player.x < this.bounds.x1 - width / 2 - boundsPadding
      || this.player.y < this.bounds.y1 - height / 2 - boundsPadding
      || this.player.x > this.bounds.x2 + width / 2 + boundsPadding
      || this.player.y > this.bounds.y2 + height / 2 + boundsPadding
    ) {
      this.spawn( )
    }
    //Victory
    this.victoryTimer--
    if ( this.victoryTimer <= 0 ) exit( )
    if ( this.dead ) this.spawn( )
  }
  generateBoundaries( ) {
    this.bounds = {
      x1: this.pStart.x - playerWidth / 2, y1: this.pStart.y - playerWidth / 2,
      x2: this.pStart.x + playerWidth / 2, y2: this.pStart.y + playerWidth / 2
    }
    this.levelobjects.forEach( lo => {
      let lob = lo.generateBoundaries( )
      if ( lob.x1 < this.bounds.x1 ) this.bounds.x1 = lob.x1
      if ( lob.y1 < this.bounds.y1 ) this.bounds.y1 = lob.y1
      if ( lob.x2 > this.bounds.x2 ) this.bounds.x2 = lob.x2
      if ( lob.y2 > this.bounds.y2 ) this.bounds.y2 = lob.y2
    } )
  }
}