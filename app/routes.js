const User = require('./models/user')

module.exports = setupRoutes;

function setupRoutes(app, passport, SpotifyWebApi) {

  let duanotePlayer
  let duanotePlayerId
  const spotifyApiServer = new SpotifyWebApi({
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
  const spotifyApiUser = new SpotifyWebApi({
      redirectUri: redirectUri,
      clientId: clientId
  });

  // Create the authorization URL
  const authorizeURL = spotifyApiUser.createAuthorizeURL(scopes, state);
  // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice

  app.get('/pause', isLoggedIn, async function (req, res) {   
    const result = await spotifyApiServer.pause()
    .catch(err => {
      console.log('Something went wrong!', err);
    })
    res.json("success")
  })

  app.get('/play', isLoggedIn, async function (req, res) {   
    const result = await spotifyApiServer.play({context_uri: "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr"})
    .catch(err => {
      console.log('Something went wrong!', err);
    })
    res.json("success")
  })

  
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    if (req.user) {
    // logged in
    // console.log(req.user);
    res.render('index.ejs', { loggedIn: true, user: req.user.name.first });
    } else {
    // not logged in
    res.render('index.ejs', { loggedIn: false, user: '' });
    }
    // res.render('index.ejs');
  });

  app.get('/index.html', function (req, res) {
    if (req.user) {
    // logged in
    console.log(req.user);
    res.render('index.ejs', { loggedIn: true, user: req.user.name.first });
    } else {
    // not logged in
    res.render('index.ejs', { loggedIn: false, user: '' });
    }

  });

  app.get('/connect', isLoggedIn, async function (req, res) {

    if (req.query.error){
      res.status(404).send(req.query.error)
    }else if (req.query.code){

      const data = await spotifyApiServer.authorizationCodeGrant(req.query.code)
      .catch(err => {
        console.log('Something went wrong!', err);
      })

      // console.log('The token expires in ' + data.body['expires_in']);
      // console.log('The access token is ' + data.body['access_token']);
      // console.log('The refresh token is ' + data.body['refresh_token']);
  
      // Set the access token on the API object to use it in later calls
      spotifyApiServer.setAccessToken(data.body['access_token']);
      spotifyApiServer.setRefreshToken(data.body['refresh_token']);

      const user = await User.findById(req.user._id) //grab current user
      //query token information to be saved to the server
      user.security.accessToken = spotifyApiServer.getAccessToken()
      user.security.refreshToken = spotifyApiServer.getRefreshToken()
      user.setup = 2 //so new token is not created.
      const result = await user.save() //actually save the data
    
      .then(result => {
        res.redirect('/user')
      })
      .catch(error => console.error(error))

    }else{
      res.render('connect.ejs', { loggedIn: true, user: req.user.name.first, spotifyUrl: authorizeURL });
    }
  });

  app.get('/token', isLoggedIn, function(req, res) {
    // convert whatever we want to send (preferably should be an object) to JSON
    const JSONdata = JSON.stringify(req.user.security.accessToken);
    res.send(JSONdata);
  })

  app.get('/onboarding', async function (req, res) {
    if (req.user) { // logged in
       
      if (req.user.setup == 2) { //if completed all onboarding
        spotifyApiServer.setAccessToken(req.user.security.accessToken); //old access token
        spotifyApiServer.setRefreshToken(req.user.security.refreshToken); 
        const data = await spotifyApiServer.refreshAccessToken() //refresh access token with refresh token
        spotifyApiServer.setAccessToken(data.body['access_token']); //set new access token

        const user = await User.findById(req.user._id)
        user.security.accessToken = data.body['access_token'] //update server side access token
        const result = await user.save()
        
        res.redirect('/user')
        
      } else if (req.user.setup == 1){ //done onboarding but no spotify
        res.redirect('/connect')
      }
      else {
      // not logged in
      res.render('onboarding.ejs', {loggedIn: true, user: ''});
      }
    }else {
    // not logged in
    res.render('onboarding.ejs', {loggedIn: false, user: ''});
    }


  });

  app.post('/Onboarding', isLoggedIn, async function (req, res) {
    const request = req.body
    const moodData = {listen: request.userMusic, usage: request.usage, triggers : request.userChoice}
    const name = {first: request.firstName, last: request.lastName}
    const age = request.age
    // console.log(moodData, name, age);

    const user = await User.findById(req.user._id)
    user.moodData = moodData
    user.name = name
    user.age = age
    user.setup = 1

    // console.log(req.body);
    const result = await user.save()
    // res.json({ user: result })

    .then(result => {
      res.redirect('/connect')
    })
    .catch(error => console.error(error))
  });


  app.get('/user', isLoggedIn, function (req, res) { 
    console.log("access", req.user.security.accessToken)
    res.render('user.ejs', { loggedIn: true, user: req.user.name.first });
  })

  app.get('/player', isLoggedIn, async function (req, res) {  

    // availableDevices = await spotifyApiServer.getMyDevices().jso
    // console.log(availableDevices.body.devices)

    // spotifyApi.transferMyPlayback(duanotePlayer.id)
    // .then(function() {
    //   console.log('Transfering playback to duanote Player:' + duanotePlayer.id);
    // }, function(err) {
    //   //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
    //   console.log('Something went wrong!', err);
    // });  

    res.render('player.ejs', { loggedIn: true, user: req.user.name.first });
  })

  app.get('/initializePlayer', isLoggedIn, async function (req, res) {
    const availableDevices = await spotifyApiServer.getMyDevices()
    .catch(error => console.error(error))

    console.log(availableDevices.body.devices);
    duanotePlayer = availableDevices.body.devices.filter( device => device.name == "Duanote Player")
    duanotePlayerId = [duanotePlayer[0].id]
    // spotifyApi.transferMyPlayback(duanotePlayer.id)
    // .catch(error => console.error(error))
    spotifyApiServer.transferMyPlayback(duanotePlayerId)
    .then(function() {
      console.log('Transfering playback to duanote Player: ' + duanotePlayerId);
    }, function(err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log('Something went wrong while transferring playback!', err);
    }); 
  })

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage'), loggedIn: false, user: ''});
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/onboarding', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage'), loggedIn: false, user: '' });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/onboarding', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  //for errors
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

