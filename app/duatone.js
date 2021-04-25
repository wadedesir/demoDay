module.exports = {
    setup : duatoneSetup,
    start: duatone
};

function duatoneSetup(SpotifyWebApi){ //generate duatonePlayer and User objects
    const duatonePlayer = new SpotifyWebApi({
        clientId: '1f3c90c77fce4b60bd9e18d35175bd86',
        clientSecret: '8758a46abe0a4ff2abb77245a9b64c2d',
        redirectUri: 'https://duatone.herokuapp.com/connect'
        });
      
        //generate spotify auth url for user
        const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played', 'user-top-read', 'user-modify-playback-state', 'user-follow-read', 'user-library-modify', 'user-library-read', 'streaming', 'user-read-playback-state', 'user-read-currently-playing', 'app-remote-control'],
        redirectUri = 'https://duatone.herokuapp.com/connect',
        clientId = '1f3c90c77fce4b60bd9e18d35175bd86',
        state = 'duatone';
      
        // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
        const duatoneUser = new SpotifyWebApi({
            redirectUri: redirectUri,
            clientId: clientId
        });

        // Create the authorization URL
        const authorizeURL = duatoneUser.createAuthorizeURL(scopes, state);
        // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice

        return [duatonePlayer, duatoneUser, authorizeURL]
}


function duatone(app, duatonePlayer){
    let duatonePlayerDevice
    let duatonePlayerDeviceId
    let firstRunTracks
    app.get('/initializePlayer', isLoggedIn, async function (req, res) {
    availableDevices = await duatonePlayer.getMyDevices()
    .catch(error => console.error(error))
  
    console.log(availableDevices.body.devices);
    duatonePlayerDevice = availableDevices.body.devices.filter( device => device.name == "Duatone Player")
    console.log("device: ", duatonePlayerDevice)
    duatonePlayerDeviceId = [duatonePlayerDevice[0].id]

    duatonePlayer.transferMyPlayback(duatonePlayerDeviceId)
    .then(function() {
        console.log('Transfering playback to duatone Player: ' + duatonePlayerDeviceId);
    }, function(err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log('Something went wrong while transferring playback!', err);
    }); 

    res.json("success")
    })

    app.get('/player', isLoggedIn, async function (req, res) {   
    res.render('player.ejs', { loggedIn: true, user: req.user.name.first });
    })
  
  
    app.get('/token', isLoggedIn, function(req, res) { //returns spotify access token
    // convert whatever we want to send (preferably should be an object) to JSON
    const JSONdata = JSON.stringify(req.user.security.accessToken);
    res.send(JSONdata);
    })
  
    app.get('/pause', isLoggedIn, async function (req, res) {   
    const result = await duatonePlayer.pause()
    .catch(err => {
        console.log('Something went wrong!', err);
    })
    res.json("success")
    })
  
    app.get('/play', isLoggedIn, async function (req, res) {   
    const result = await duatonePlayer.play()
    .catch(err => {
        console.log('Something went wrong!', err);
    })
    res.json("success")
    })  

    app.get('/search', isLoggedIn, async function (req, res) {
        res.setHeader('Content-Type', 'application/json');

        if(req.query.artist){
            console.log('Search artists by ' + req.query.artist);
            
            let result = await duatonePlayer.searchArtists(req.query.artist, {limit : 3})
            .catch(err => console.log(err))
            // console.log("query items: ", result.body.artists.items)
            res.json(result.body.artists.items)

        }
        else if (req.query.track){

            let result = await duatonePlayer.searchTracks(`track:${req.query.track}`, {limit: 3})
            .catch(err => console.log(err))
            // console.log("query items: ", result.body.tracks.items)
            res.json(result.body.tracks.items)
    
        }
        
        res.json("success")
    })

    app.get('/queue', isLoggedIn, async function (req, res) {
        recs = await duatonePlayer.getRecommendations({
            // limit: 1,
            target_energy: 0.2,
            seed_artists: ['75JFxkI2RXiU7L9VXzMkle', '53XhwfbYqKCa1cC15pYq2q', '4dpARuHxo51G3z768sgnrY', '00FQb4jTyendYWaN8pK0wa', '6qqNVTkY8uBg9cP3Jd7DAH'],
            min_popularity: 50
          })
        .catch(err => console.log(err))
        console.log(recs.body.tracks)

        trackUris = recs.body.tracks.map( track => track.uri)
        firstRunTracks = trackUris 
        // res.json(JSON.stringify(trackUris))
        res.redirect('/playStart')
    })

    app.get('/playStart', isLoggedIn, async function (req, res) {   
        const result = await duatonePlayer.play({uris: firstRunTracks})
        .catch(err => {
            console.log('Something went wrong!', err);
        })
        res.json("success")
    })  
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect('/login');
  }