// window.onSpotifyWebPlaybackSDKReady = () => {
//     // You can now initialize Spotify.Player and use the SDK
//   };
document.querySelector('#play').addEventListener('click', playMedia)
document.querySelector('#pause').addEventListener('click', pauseMedia)
// document.querySelector('.searchButton').addEventListener('click', searchMedia)
let queue
let firstRun = true

async function getToken(){
    const fetchToken = await fetch('/token');
    console.log(fetchToken)
    const token = await fetchToken.json();
    return token
}
// const deviceId
const token = getToken()

window.onSpotifyWebPlaybackSDKReady = () => {
    
    const player = new Spotify.Player({
      name: 'Duatone Player',
      getOAuthToken: cb => { cb(token); }
    });
  
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });
  
    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      deviceId = device_id
      fetch('/initializePlayer');
        
    });
  
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });
  
    // Connect to the player!
    player.connect();
  };

async function loadMedia(){
  const queueData = await fetch('/queue');
  queue = await queueData.json()
  songId = queue.map(songUri => songUri.slice(songUri.lastIndexOf(':') + 1))
  console.log(songId)
  addRecents(songId)
  fetch(`/play?tracks=${queue}`)
  firstRun = false
}

async function playMedia(){
  
  if (firstRun){
    loadMedia()
  }else{
    fetch(`/play`);
  }
  // console.log(play)
  // console.log(queue)
}

async function pauseMedia(){
  fetch('/pause');
  // console.log(pause)
}

async function addRecents(queue){
  // let songIds = queue.map(songUri => songUri.slice(songUri.lastIndexOf(':') + 1))
  let data = await fetch(`/tracks?songs=${queue}`)
  let songData = await data.json()
  console.log(songData)

  let newRecents = []
  songData.body.tracks.forEach(song =>{
    newRecents.push([song.name, song.artists[0].name, song.album.images[0].url])
  })

  let uploadRecents = await fetch(`/recents`, {method: 'POST', headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }, body: JSON.stringify(newRecents)})
}


/*--------------------------------------------------------------
# Drawing
--------------------------------------------------------------*/

let canvas = document.getElementById('paint');
let ctx = canvas.getContext('2d');
 
let sketch = document.getElementById('sketch');
let sketch_style = getComputedStyle(sketch);
canvas.width = 500;
canvas.height = 250;

let mouse = {x: 0, y: 0};
 
/* Mouse Capturing Work */
canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;
}, false);

/* Drawing on Paint App */
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

ctx.strokeStyle = "red";
function getColor(colour){ctx.strokeStyle = colour;}

function getSize(size){ctx.lineWidth = size;}


//ctx.strokeStyle = 
//ctx.strokeStyle = document.settings.colour[1].value;
 
canvas.addEventListener('mousedown', function(e) {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
 
    canvas.addEventListener('mousemove', onPaint, false);
}, false);
 
canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);
 
let onPaint = function() {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

async function saveSketch(){
  let dataURL = canvas.toDataURL();

  if(confirm('Are you sure you want to save? This sketchad will be reset after drawing has been saved to your account.')){
    let save = await fetch(`/saveSketch?sketch=${dataURL}`, {method: 'POST'})
    let result = save.json()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }


}