// window.onSpotifyWebPlaybackSDKReady = () => {
//     // You can now initialize Spotify.Player and use the SDK
//   };

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQCFaMqIIfHdtf2iUvvKAiO5FglQaBx1MogBAMLdIyULRpAUJF3jbYnMabFBvHut1ENzArVGOkC_XyzhOJThmWgJwh9Q9tPB5EtEm28EsYSYR04cEu8wikedjUTs_-W3T-CvLSw-lvtt9IZ1NEsSrVempWhW3p113wp8QD7qWYah7nijHPFK57w';
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
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
    });
  
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });
  
    // Connect to the player!
    player.connect();
  };