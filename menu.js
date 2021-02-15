function newCustomLevel( ) {
  let l = new Level( )
  addCustomLevel( l )
}

function uploadCustomLevel( ) {
  upload( ( l, file ) => {
    try {
      let obj = JSON.parse( l )
      if ( obj instanceof Array ) {
        obj.forEach( lvl => addCustomLevel( Level.fromSimpleObject( lvl ) ) )
      } else {
        addCustomLevel( Level.fromSimpleObject( obj ) )
      }
    } catch( e ) {
      alert( `'${ file.name }' was invalid or corrupted. ` )
      console.log( e )
    }
  } )
}

function addCustomLevel( l ) {
  let cLe = document.getElementById( "customLevels" )
  let le = document.createElement( "div" )
  le.className = "customLevel"
  let t = document.createElement( "div" )
  t.className = "levelTitle"
  t.innerText = l.title
  le.appendChild( t )
  if ( l.disc ) {
    let d = document.createElement( "div" )
    d.className = "levelDisc"
    d.innerText = l.disc
    le.appendChild( d )
  }
  if ( l.author ) {
    let a = document.createElement( "div" )
    a.className = "levelAuthor"
    a.innerText = l.author
    le.appendChild( a )
  }
  let tb = document.createElement( "div" )
  tb.className = "levelToolbar"
  let p = document.createElement( "button" )
  p.className = "actionPlay"
  p.innerText = "PLAY"
  p.onclick = ( ) => playLevel( l )
  tb.appendChild( p )
  let e = document.createElement( "button" )
  e.className = "actionEdit"
  e.innerText = "EDIT"
  e.onclick = ( ) => editLevel( l )
  tb.appendChild( e )
  let d = document.createElement( "button" )
  d.className = "actionDownload"
  d.innerText = "DOWNLOAD"
  d.onclick = ( ) => downloadLevel( l )
  tb.appendChild( d )
  let de = document.createElement( "button" )
  de.className = "actionDelete"
  de.innerText = "DELETE"
  de.onclick = ( ) => deleteLevel( l )
  tb.appendChild( de )
  let m = document.createElement( "button" )
  m.className = "actionMetadata"
  m.innerText = "METADATA"
  m.onclick = ( ) => openMetadataMenu( l )
  tb.appendChild( m )
  le.appendChild( tb )
  cLe.appendChild( le )
  le.scrollIntoView( )
  l.index = customLevels.length
  l.type = "custom"
  l.elem = le
  customLevels.push( l )
}

function playLevel( l, fromEdit = false ) {
  pmode = 2 * fromEdit;
  mode = 1
  activeLevel = l
  document.getElementById( "ui" ).style.display = "none"
  document.getElementById( "game" ).style.display = ""
  l.start( )
}

function editLevel( l ) {
  mode = 2
  activeLevel = l
  editorTool = -1
  l.lastEditVersion = currentVersion
  document.getElementById( "ui" ).style.display = "none"
  document.getElementById( "game" ).style.display = ""
}

function mainMenu( ) {
  mode = 0
  document.getElementById( "ui" ).style.display = ""
  document.getElementById( "game" ).style.display = "none"
}

function exit( ) {
  if ( pmode === 2 ) {
    editLevel( activeLevel )
  } else {
    mainMenu( )
  }
}

function downloadLevel( l ) {
  download(
    l.title + ".blvl",
    JSON.stringify( l.toSimpleObject( ) )
  )
}

function downloadAll( ) {
  download(
    "My Levels.blpk",
    JSON.stringify(
      customLevels.map( l => l.toSimpleObject( ) )
    )
  )
}

function deleteLevel( l ) {
  if (
    !confirm( "Are you sure you want to delete '" + l.title + "'?" ) ) return
  if ( l.type === "custom" ) {
    let cLe = document.getElementById( "customLevels" )
    cLe.removeChild( l.elem )
    for ( let i = customLevels.length - 1; i >= 0; i-- ) {
      if ( i > l.index ) {
        customLevels[ i ].index--
      } else if ( i === l.index ) {
        customLevels.splice( i, 1 )
      }
    }
  }
}

function openMetadataMenu( l ) {
  activeLevel = l
  let pc = document.getElementById( "popupContainer" )
  pc.style.display = ""
  let tf = document.getElementById( "titleField" )
  tf.value = l.title
  let df = document.getElementById( "discField" )
  df.value = l.disc
  let af = document.getElementById( "authorField" )
  af.value = l.author
}

function confirmMetadata( ) {
  let pc = document.getElementById( "popupContainer" )
  pc.style.display = "none" 
  let tf = document.getElementById( "titleField" )
  activeLevel.title = tf.value || "Unnamed Level"
  let df = document.getElementById( "discField" )
  activeLevel.disc = df.value
  let af = document.getElementById( "authorField" )
  activeLevel.author = af.value
  let e = activeLevel.elem
  e.removeChild( e.querySelector( ".levelTitle" ) )
  let d = e.querySelector( ".levelDisc" )
  if ( d ) e.removeChild( d )
  let a = e.querySelector( ".levelAuthor" )
  if ( a ) e.removeChild( a )
  let r = e.querySelector( ".levelToolbar" )
  let t = document.createElement( "div" )
  t.className = "levelTitle"
  t.innerText = activeLevel.title
  e.insertBefore( t, r )
  if ( activeLevel.disc ) {
    let d = document.createElement( "div" )
    d.className = "levelDisc"
    d.innerText = activeLevel.disc
    e.insertBefore( d, r )
  }
  if ( activeLevel.author ) {
    let a = document.createElement( "div" )
    a.className = "levelAuthor"
    a.innerText = activeLevel.author
    e.insertBefore( a, r )
  }
}

function cancelMetadata( ) {
  let pc = document.getElementById( "popupContainer" )
  pc.style.display = "none" 
}

function loadCustomLevels( ) {
  let sbcl = localStorage.getItem( "bounce-customlevels" )
  JSON.parse(
    sbcl === null ? "[]" : sbcl
  ).forEach( l => addCustomLevel(
    Level.fromSimpleObject( l )
  ) )
}

function saveCustomLevels( ) {
  localStorage.setItem(
    "bounce-customlevels",
    JSON.stringify(
      customLevels.map( l => l.toSimpleObject( ) )
    )
  )
}