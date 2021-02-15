function setup( ) {
  createCanvas( windowWidth, windowHeight )
  loadCustomLevels( )
  window.onbeforeunload = saveCustomLevels
  setInterval( saveCustomLevels, 60000 )
  document.getElementsByTagName( "title" )[ 0 ].innerHTML = "Bounce v" + currentVersion
  document.getElementById( "version" ).innerHTML = "v" + currentVersion
}

function draw( ) {
  background( pallete.background )
  if ( mode === 0 ) {
    
  } else if ( mode === 1 ) {
    activeLevel.draw( )
    activeLevel.update( )
  } else if ( mode === 2 ) {
    drawEditor( )
  }
}

function mousePressed( e ) {
  pmx = e.x
  pmy = e.y
  if ( mode === 2 && e.buttons & 1 ) {
    let p
    if ( editorTools[ editorTool ].smooth ) {
      p = screenToLevelSmooth( e.x, e.y )
    } else {
      p = screenToLevel( e.x, e.y )
    }
    if ( editorTools[ editorTool ].mouseStart ) {
      editorTools[ editorTool ].mouseStart( p.x, p.y )
    }
  }
  if ( mode === 1 ) {
    smx = cmx = e.x
    smy = cmy = e.y
  }
}

function touchStarted( e ) {
  if ( mode === 1 ) {
    pmx = smx = cmx = e.touches[ 0 ].clientX
    pmy = smy = cmy = e.touches[ 0 ].clientY
    e.preventDefault( )
    return false
  }
}

function mouseDragged( e ) {
  if ( mode === 2 ) {
    if ( e.buttons & 4 || editorTool === 6 ) {
      cameraX -= ( e.x - pmx ) / cameraScale
      cameraY -= ( e.y - pmy ) / cameraScale
    }
    if ( e.buttons & 1 ) {
      let p
      if ( editorTools[ editorTool ].smooth ) {
        p = screenToLevelSmooth( e.x, e.y )
      } else {
        p = screenToLevel( e.x, e.y )
      }
      if ( editorTools[ editorTool ].mouseDragged ) {
        editorTools[ editorTool ].mouseDragged( p.x, p.y )
      }
    }
  }
  if ( mode === 1 ) {
    cmx = e.x
    cmy = e.y
  }
  pmx = e.x
  pmy = e.y
}

function touchMoved( e ) {
  if ( mode === 1 ) {
    pmx = cmx = e.touches[ 0 ].clientX
    pmy = cmy = e.touches[ 0 ].clientY
    e.preventDefault( )
    return false
  }
}

function mouseReleased( e ) {
  if ( mode === 1 ) {
    activeLevel.player.dash( e.x, e.y )
  }
  if ( mode === 2 ) {
    let p
    if ( editorTools[ editorTool ].smooth ) {
      p = screenToLevelSmooth( e.x, e.y )
    } else {
      p = screenToLevel( e.x, e.y )
    }
    if ( editorTools[ editorTool ].mouseReleased ) {
      editorTools[ editorTool ].mouseReleased( p.x, p.y )
    }
  }
}

function touchEnded( e ) {
  if ( mode === 1 ) {
    activeLevel.player.dash( cmx, cmy )
    e.preventDefault( )
    return false
  }
}

function mouseWheel( e ) {
  if ( mode === 2 ) {
    if ( e.deltaY < 0 ) {
      cameraScale *= 1.1
    } else if ( e.deltaY > 0 ) {
      cameraScale /= 1.1
    }
  }
}

function keyReleased( ) {
  if ( mode === 2 ) {
    if ( key === "Escape" ) {
      mainMenu( )
      return
    }
    if ( key === "Enter" ) {
      playLevel( activeLevel, true )
      return
    }
    for ( let i = 0; i < editorTools.length; i++ ) {
      if (
        key ===
        editorTools[ i ].shortcut.toLowerCase( )
      ) {
        editorTool = i
        return
      }
    }
    if ( key === "h" ) {
      cameraX = 0
      cameraY = 0
      cameraScale = 1
      return
    }
  }
  if ( mode === 1 ) {
    if ( key === "Escape" ) {
      exit( )
    }
    if ( key === "r" ) {
      activeLevel.spawn( )
    }
    if ( key === "d" ) {
      debug = !debug
    }
  }
}