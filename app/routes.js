const User = require('./models/user')

module.exports = setupRoutes;

function setupRoutes(app, passport) {

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

  // app.get('/onboarding', isLoggedIn, function (req, res) {
  //   res.render('index.ejs');
  // });

  app.get('/onboarding', function (req, res) {
    if (req.user) {
      if (req.user.setup == 1) {
      // logged in
      res.redirect('/')
      // res.render('index.ejs', { loggedIn: true, user: req.user.name.first});
      } else {
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
      res.redirect('/')
    })
    .catch(error => console.error(error))
  });


  app.get('/user', isLoggedIn, async function (req, res) {
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

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}
