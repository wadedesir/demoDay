module.exports = {
    setup : duanoteSetup,
    start: duanote
};

function duanoteSetup(SpotifyWebApi){ //generate duanotePlayer and User objects
    const duanotePlayer = new SpotifyWebApi({
        clientId: '1f3c90c77fce4b60bd9e18d35175bd86',
        clientSecret: '8758a46abe0a4ff2abb77245a9b64c2d',
        redirectUri: 'http://moodchime.herokuapp.com/connect'
        });
      
        //generate spotify auth url for user
        const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played', 'user-top-read', 'user-modify-playback-state', 'user-follow-read', 'user-library-modify', 'user-library-read', 'streaming', 'user-read-playback-state', 'user-read-currently-playing', 'app-remote-control'],
        redirectUri = 'http://moodchime.herokuapp.com/connect',
        clientId = '1f3c90c77fce4b60bd9e18d35175bd86',
        state = 'duanote';
      
        // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
        const duanoteUser = new SpotifyWebApi({
            redirectUri: redirectUri,
            clientId: clientId
        });

        // Create the authorization URL
        const authorizeURL = duanoteUser.createAuthorizeURL(scopes, state);
        // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice

        return [duanotePlayer, duanoteUser, authorizeURL]
}


function duanote(app, duanotePlayer){
    let duanotePlayerDevice
    let duanotePlayerDeviceId
    
    app.get('/initializePlayer', isLoggedIn, async function (req, res) {
    const availableDevices = await duanotePlayer.getMyDevices()
    .catch(error => console.error(error))
  
    console.log(availableDevices.body.devices);
    duanotePlayerDevice = availableDevices.body.devices.filter( device => device.name == "Duanote Player")
    duanotePlayerDeviceId = [duanotePlayerDevice[0].id]

    duanotePlayer.transferMyPlayback(duanotePlayerDeviceId)
    .then(function() {
        console.log('Transfering playback to duanote Player: ' + duanotePlayerDeviceId);
    }, function(err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log('Something went wrong while transferring playback!', err);
    }); 
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
    const result = await duanotePlayer.pause()
    .catch(err => {
        console.log('Something went wrong!', err);
    })
    res.json("success")
    })
  
    app.get('/play', isLoggedIn, async function (req, res) {   
    const result = await duanotePlayer.play({context_uri: "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr"})
    .catch(err => {
        console.log('Something went wrong!', err);
    })
    res.json("success")
    })  

    app.get('/search', isLoggedIn, async function (req, res) {
    
        // Get available genre seeds
        // duanotePlayer.getAvailableGenreSeeds()
        // .then(function(data) {
        //     let genreSeeds = data.body;
        //     console.log(genreSeeds);
        // }, function(err) {
        //     console.log('Something went wrong!', err);
        // });
        if(req.query.artist){
            console.log(req.query)
            duanotePlayer.searchArtists(req.query.artist)
                .then(function(data) {
                    console.log('Search artists by ' + req.query.artist, data.body);
                    console.log("query items: ", data.body.artists.items)
                }, function(err) {
                    console.error(err);
                });
        }
        else if (req.query.track){

            duanotePlayer.searchTracks(`track:${req.query.tracks}`, {limit: 1})
            .then(function(data) {
            console.log(`Search tracks by ${req.query.tracks}`, data.body, data.body.tracks.items);
            }, function(err) {
            console.log('Something went wrong!', err);
            });
    
        }
        
        res.json("success")
    })

    app.get('/songQueue', isLoggedIn, async function (req, res) {
        duanotePlayer.getRecommendations({
            limit: 1,
            target_energy: 0.2,
            seed_artists: ['5Pwc4xIPtQLFEnJriah9YJ', '53XhwfbYqKCa1cC15pYq2q'],
            min_popularity: 50
          })
        .then(function(data) {
          let recommendations = data.body;
          console.log(recommendations);
        }, function(err) {
          console.log("Something went wrong!", err);
        });
    })
}


// spotifyApi.getArtists(['2hazSY4Ef3aB9ATXW7F5w3', '6J6yx1t3nwIDyPXk5xa7O8'])
//   .then(function(data) {
//     console.log('Artists information', data.body);
//   }, function(err) {
//     console.error(err);
//   });

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect('/login');
  }