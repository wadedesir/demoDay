// window.onSpotifyWebPlaybackSDKReady = () => {
//     // You can now initialize Spotify.Player and use the SDK
//   };

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQCdole3T_DqH0Sk_eDAuPBYRX809nCCG4hPuUhGyAywsxrlAfay0THnHUT-2SECTdUD7bJqqrZb0zv5l9CY6aSVuSnloGe1L5jRKTaXb1dYWyk6ymhUZ1psYhQgRj4Fosnmj0yYAusUtxKeh0fy1rMnpdLqk9gbdmBpQ6YFw0667ylO0JjSktw';
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