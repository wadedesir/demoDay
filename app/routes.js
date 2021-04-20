const User = require('./models/user')

module.exports = setupRoutes;

function setupRoutes(app, passport, authorizeURL) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    if (req.user) {
    // logged in
    console.log(req.user);
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

  app.get('/connect', isLoggedIn, function (req, res) {
    res.render('connect.ejs', { loggedIn: true, user: req.user.name.first, spotifyUrl: authorizeURL });
  });

  app.get('/onboarding', function (req, res) {
    if (req.user) { // logged in
       
      if (req.user.setup == 2) { //if completed onboarding
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
    console.log(moodData, name, age);

    const user = await User.findById(req.user._id)
    user.moodData = moodData
    user.name = name
    user.age = age
    user.setup = 1

    console.log(req.body);
    const result = await user.save()
    // res.json({ user: result })

    .then(result => {
      res.redirect('/connect')
    })
    .catch(error => console.error(error))
  });


  app.get('/user', isLoggedIn, function (req, res) {

    if (req.query.state){
      if (req.query.error === "access_denied"){
        res.status(404).send("access_denied")
      }
      else{
        // res.render('user.ejs', { loggedIn: true, user: req.user.name.first });
      }
    }
    
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

