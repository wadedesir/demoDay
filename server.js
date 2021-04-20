// server.js
// set up ======================================================================
// get all the tools we need
const express  = require('express');
const bodyParser = require('body-parser')
const app      = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}

const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const SpotifyWebApi = require('spotify-web-api-node');

const configDB = require('./config/database.js');
const setupRoutes = require('./app/routes.js') 
// const spotifyConfig = require('./app/spotify.js')
let db

// configuration ===============================================================

//generate spotify auth url for user
const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played', 'user-top-read', 'user-modify-playback-state', 'user-follow-read', 'user-library-modify', 'user-library-read', 'streaming'],
redirectUri = 'http://moodchime.herokuapp.com/user',
clientId = '1f3c90c77fce4b60bd9e18d35175bd86',
state = 'test';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApiUser = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
});

// Create the authorization URL
const authorizeURL = spotifyApiUser.createAuthorizeURL(scopes, state);
// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice



app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(configDB.url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, database) => {
  if (err) return console.log(err)
  db = database
  // require('./app/routes.js')(app, passport, db)
  // setupRoutes(app, passport, db);
  setupRoutes(app, passport, authorizeURL)
}); // connect to our database

const spotifyApiServer = new SpotifyWebApi({
  clientId: '1f3c90c77fce4b60bd9e18d35175bd86',
  clientSecret: '8758a46abe0a4ff2abb77245a9b64c2d',
  redirectUri: 'http://moodchime.herokuapp.com/user'
});

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.json()); // get information from html forms
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2021a', // session secret
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);









