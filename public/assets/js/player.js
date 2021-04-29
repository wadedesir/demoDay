// window.onSpotifyWebPlaybackSDKReady = () => {
//     // You can now initialize Spotify.Player and use the SDK
//   };
document.querySelector('#play').addEventListener('click', playMedia)
document.querySelector('#pause').addEventListener('click', pauseMedia)
// document.querySelector('.searchButton').addEventListener('click', searchMedia)
let queue
let sessionTime
let firstRun = true
let btnNotSet = true

async function getToken(){
    const fetchToken = await fetch('/token');
    console.log(fetchToken)
    const token = await fetchToken.json();
    return token
}
// const deviceId
const token = getToken()

/*--------------------------------------------------------------
# Player initialization
--------------------------------------------------------------*/
let player //allow player to be viewed globally
window.onSpotifyWebPlaybackSDKReady = () => {
    
    player = new Spotify.Player({
      name: 'Duatone Player',
      getOAuthToken: cb => { cb(token); },
      volume: 0.5
    });
  
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    // Playback status updates
    player.addListener('player_state_changed', state => { updateViews(state) });
  
    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      deviceId = device_id
      playerReady()
        
    });
  
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });
  
    // Connect to the player!
    player.connect();
  };

async function playerReady(){
  let initialize = await fetch('/initializePlayer');
  let result = initialize.json()
  .catch(err => console.log(err))
  const queueData = await fetch('/queue');
  queue = await queueData.json()
  .catch(err => console.log(err))
  console.log(queue)
}



function setQueue(newTime){
  sessionTime = newTime
  btnNotSet = false
  // sessionQueue = queue
  console.log("time", sessionTime)
  // console.log(sessionQueue);
  // Math.floor(Math.random() * (max - min + 1) + min);


  // console.log(sessionQueue)
}

function loadClear(){
  if(btnNotSet){
    return alert("Please select a time frame.")
  }
  if(firstRun){
    document.querySelector('.spinny').style.display = 'block'
    document.querySelector('.spinnyText').style.display = 'none'
    setTimeout(function(){ loadMedia() }, 6500);
  }
}
async function loadMedia(){
  let sessionQueue = queue
  if (sessionTime == 15){
    while (sessionQueue.length > 5){
      let remove = Math.floor(Math.random() * ((queue.length - 1) - 1 + 1) + 1);
      sessionQueue.splice(remove, 1)
    }
  }else if((sessionTime == 25)){
    while (sessionQueue.length > 6){
      let remove = Math.floor(Math.random() * ((queue.length - 1) - 1 + 1) + 1);
      sessionQueue.splice(remove, 1)
    }
  }else if((sessionTime == 30)){
    while (sessionQueue.length > 9){
      let remove = Math.floor(Math.random() * ((queue.length - 2) - 2 + 1) + 2);
      sessionQueue.splice(remove, 1)
    }
  }else if((sessionTime == 45)){
    while (sessionQueue.length > 11){
      let remove = Math.floor(Math.random() * ((queue.length - 2) - 2 + 1) + 2);
      sessionQueue.splice(remove, 1)
    }
  }else if((sessionTime == 60)){
    while (sessionQueue.length > 15){
      let remove = Math.floor(Math.random() * ((queue.length - 2) - 3 + 1) + 3);
      sessionQueue.splice(remove, 1)
    }
  }
  console.log('length', sessionQueue.length)
  console.log(sessionQueue)
  console.log('length', queue.length)
//   songDataSingles = queue.filter(function(item, pos) {
//     return queue.indexOf(item) == pos;
// })

//  console.log("length", songDataSingles.length)
  songId = sessionQueue.map(songUri => songUri.slice(songUri.lastIndexOf(':') + 1))
  console.log(songId)
  addRecents(songId)
  fetch(`/play?tracks=${sessionQueue}`)
  document.querySelector('.setupModal').style.display = 'none'
  // firstRun = false
}

async function playMedia(){

    fetch(`/play`);
  // console.log(play)
  // console.log(queue)
}

async function pauseMedia(){
  fetch('/pause');
  // console.log(pause)
}

async function generatePlaylist(){ 
  
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

function updateViews(state){
  console.log(state)
  let songTitle = document.querySelector('.songName')
  let songArtist = document.querySelector('.songArtist')
  let songArt = document.querySelector('.nowPlayingImg')

  songTitle.innerText = state.track_window.current_track.name
  songArtist.innerText = state.track_window.current_track.artists[0].name
  songArt.style.backgroundImage = `url(${state.track_window.current_track.album.images[0].url})`
}

function toggleBtn(){
  document.querySelector('#play').classList.toggle('hideControl')
  document.querySelector('#pause').classList.toggle('hideControl')
}

/*--------------------------------------------------------------
# Drawing
--------------------------------------------------------------*/

var canvas = document.getElementById('paint');
var ctx = canvas.getContext('2d');
 
var sketch = document.getElementById('sketch');
var sketch_style = getComputedStyle(sketch);
canvas.width = 750;
canvas.height = 375;

var mouse = {x: 0, y: 0};
 
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
 
var onPaint = function() {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

async function saveSketch(){
  var dataURL = canvas.toDataURL();

  if(confirm('Are you sure you want to save? This sketchad will be reset after drawing has been saved to your account.')){
    // let save = await fetch(`/saveSketch?sketch=${dataURL}`, {method: 'POST'})
    var save = await fetch(`/saveSketch`, {method: 'POST', headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }, body: JSON.stringify({sketch: dataURL})})
    var result = save.json()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

}

async function clearSketch(){
  // let dataURL = canvas.toDataURL();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

}


