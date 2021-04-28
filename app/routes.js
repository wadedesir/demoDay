const User = require('./models/user')
const duatone = require('./duatone')

module.exports = setupRoutes;

function setupRoutes(app, passport, SpotifyWebApi) {

  //duatone specific setup
  let duatonePlayer, duatoneUser, authorizeURL

  [duatonePlayer, duatoneUser, authorizeURL] = duatone.setup(SpotifyWebApi, User) //set duatone values returned frm duatone.js

  duatone.start(app, duatonePlayer, User)

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    if (req.user) {
      // logged in
      // console.log(req.user);
      res.render('index.ejs', {
        loggedIn: true,
        user: req.user.name.first
      });
    } else {
      // not logged in
      res.render('index.ejs', {
        loggedIn: false,
        user: ''
      });
    }
    // res.render('index.ejs');
  });

  app.get('/index.html', function (req, res) {
    if (req.user) {
      // logged in
      // console.log(req.user);
      res.render('index.ejs', {
        loggedIn: true,
        user: req.user.name.first
      });
    } else {
      // not logged in
      res.render('index.ejs', {
        loggedIn: false,
        user: ''
      });
    }

  });

  app.get('/connect', isLoggedIn, async function (req, res) {

    if (req.query.error) { //if spotify returns an error
      res.status(404).send(req.query.error)
    } else if (req.query.code) { //no err, code is returned

      const data = await duatonePlayer.authorizationCodeGrant(req.query.code) //run auth with given code
        .catch(err => {
          console.log('Something went wrong!', err);
        })

      // Set the access token on the API object to use it in later calls
      duatonePlayer.setAccessToken(data.body['access_token']);
      duatonePlayer.setRefreshToken(data.body['refresh_token']);

      const user = await User.findById(req.user._id) //grab current user

      //query token information to be saved to the server
      user.security.accessToken = duatonePlayer.getAccessToken()
      user.security.refreshToken = duatonePlayer.getRefreshToken()
      user.setup = 2 //so new token is not created.
      const result = await user.save() //actually save the data

        .then(result => {
          res.redirect('/onboard')
        })
        .catch(error => console.error(error))

    } else { // first reun then have user connect
      res.render('connect.ejs', {
        loggedIn: true,
        user: req.user.name.first,
        spotifyUrl: authorizeURL
      });
    }
  });


  app.get('/onboard', isLoggedIn, async function (req, res) {
    if (req.user) { // logged in

      if (req.user.setup === 2 || req.user.setup === 3) { //if completed all onboarding
        duatonePlayer.setAccessToken(req.user.security.accessToken); //old access token
        duatonePlayer.setRefreshToken(req.user.security.refreshToken);
        const data = await duatonePlayer.refreshAccessToken() //refresh access token with refresh token
        duatonePlayer.setAccessToken(data.body['access_token']); //set new access token

        const user = await User.findById(req.user._id)

        user.security.accessToken = data.body['access_token'] //update server side access token
        const result = await user.save()

        req.user.setup === 3 ? res.redirect('/user') : res.redirect('/seed');

      } else if (req.user.setup == 1) { //done onboarding but no spotify
        res.redirect('/connect')
      } else {
        // not logged in
        res.render('onboard.ejs', {
          loggedIn: true,
          user: ''
        });
      }
    } else {
      // not logged in
      res.redirect('/login')
      // res.render('onboarding.ejs', {loggedIn: false, user: ''});
    }

  });

  app.post('/Onboard', isLoggedIn, async function (req, res) {
    //Grab data from DOM
    const moodData = {
      listen: req.body.userMusic,
      usage: req.body.usage,
      triggers: req.body.userChoice
    }
    const name = {
      first: req.body.firstName,
      last: req.body.lastName
    }
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
    console.log(req.user.songData.recents);
    console.log(req.user.activities.sketches);
    res.render('user.ejs', {
      loggedIn: true,
      user: req.user.name.first,
      recents: req.user.songData.recents,
      activities: req.user.activities.sketches
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
    res.render('login.ejs', {
      message: req.flash('loginMessage'),
      loggedIn: false,
      user: ''
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/onboard', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage'),
      loggedIn: false,
      user: ''
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/onboard', // redirect to the secure profile section
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