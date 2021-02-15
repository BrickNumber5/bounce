class LevelObject {
  constructor( ) {
    
  }
  drawBackground( ) {
    
  }
  drawMidground( ) {
    
  }
  drawForeground( ) {
    
  }
  drawEditorUI( ) {
    
  }
  drawDebug( ) {
    
  }
  toSimpleObject( ) {
    return { }
  }
  static fromSimpleObject( obj ) {
    if ( !obj.type ) throw new Error( "Invalid LevelObject" )
    return {
      line: Line,
      polygon: Polygon,
      goal: Goal,
      water: Water,
      secretarea: SecretArea,
      spike: Spike
    }[ obj.type ].fromSimpleObject( obj )
  }
  generateBoundaries( ) {
    return {
      x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity
    }
  }
  tryAdjust( ) {
    return false
  }
}