// window.onSpotifyWebPlaybackSDKReady = () => {
//     // You can now initialize Spotify.Player and use the SDK
//   };

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQDK8Zx4eOFOs5yx_FV54B8sAiGig5Y0JRwXo_mVVslAgww0nGAYGbhNHqq7LAMp5eiKAGANV-zYMky57DZFCiC5Pk-aXwtq5KKdKK-Tl1M2IW6Aiaek5hjU6BNzimKD9yWj4gguVyt5Q_31JK-v4GLN3CWHrE87Qpd_cyYImxf2EBnUNHZ3R_g';
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