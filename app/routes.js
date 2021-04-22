const User = require('./models/user')
const duanote = require('./duanote')

module.exports = setupRoutes;

function setupRoutes(app, passport, SpotifyWebApi) {

  //duanote specific setup
  let duanotePlayer, duanoteUser, authorizeURL

  [duanotePlayer, duanoteUser, authorizeURL] = duanote.setup(SpotifyWebApi) //set duanote values returned frm duanote.js

  duanote.start(app, duanotePlayer)

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
    // console.log(req.user);
    res.render('index.ejs', { loggedIn: true, user: req.user.name.first });
    } else {
    // not logged in
    res.render('index.ejs', { loggedIn: false, user: '' });
    }

  });

  app.get('/connect', isLoggedIn, async function (req, res) {

    if (req.query.error){ //if spotify returns an error
      res.status(404).send(req.query.error)
    }else if (req.query.code){ //no err, code is returned

      const data = await duanotePlayer.authorizationCodeGrant(req.query.code) //run auth with given code
      .catch(err => {
        console.log('Something went wrong!', err);
      })
  
      // Set the access token on the API object to use it in later calls
      duanotePlayer.setAccessToken(data.body['access_token']);
      duanotePlayer.setRefreshToken(data.body['refresh_token']);

      const user = await User.findById(req.user._id) //grab current user

      //query token information to be saved to the server
      user.security.accessToken = duanotePlayer.getAccessToken()
      user.security.refreshToken = duanotePlayer.getRefreshToken()
      user.setup = 2 //so new token is not created.
      const result = await user.save() //actually save the data
    
      .then(result => {
        res.redirect('/user')
      })
      .catch(error => console.error(error))

    }else{ // first reun then have user connect
      res.render('connect.ejs', { loggedIn: true, user: req.user.name.first, spotifyUrl: authorizeURL });
    }
  });


  app.get('/onboarding', async function (req, res) {
    if (req.user) { // logged in
       
      if (req.user.setup == 2) { //if completed all onboarding
        duanotePlayer.setAccessToken(req.user.security.accessToken); //old access token
        duanotePlayer.setRefreshToken(req.user.security.refreshToken); 
        const data = await duanotePlayer.refreshAccessToken() //refresh access token with refresh token
        duanotePlayer.setAccessToken(data.body['access_token']); //set new access token

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
    //Grab data from DOM
    const moodData = {listen: req.body.userMusic, usage: req.body.usage, triggers : req.body.userChoice}
    const name = {first: req.body.firstName, last: req.body.lastName}
    const age = req.body.age
    //save data to server
    const user = await User.findById(req.user._id)
    user.moodData = moodData
    user.name = name
    user.age = age
    user.setup = 1

    const result = await user.save()
    .then(result => {
      res.redirect('/connect')
    })
    .catch(error => console.error(error))
  });


  app.get('/user', isLoggedIn, function (req, res) { 
    res.render('user.ejs', { loggedIn: true, user: req.user.name.first });
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

