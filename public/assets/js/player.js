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

async function playMedia(){
  
  if (firstRun){
    const queueData = await fetch('/queue');
    queue = await queueData.json()
  }
  let play = await fetch(`/play`);
  console.log(play)
  console.log(queue)
}

async function pauseMedia(){
  const pause = await fetch('/pause');
  console.log(pause)
}
