// server.js
// set up ======================================================================
// get all the tools we need
const express  = require('express');
const bodyParser = require('body-parser')
const app      = express();

let port = process.env.PORT || 8080;
// if (port == null || port == "") {
//   port = 8080;
// }

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


// http://moodchime.herokuapp.com/user?code=AQBJdxCfzk7rAHrgZto4-TSPnSticdq6dxZLMG8kmh-m3RsvHLkOxzkSIRO4gtCN5q1dMjpjAz7YsCkM_SI4aoChBZ_A9d0vZCQpP0lzacUe_ivwhyY_kcn6i-TD8aN_hQQqaSmrMQX7OWdMk7fyRH1ROcvd3ohBj6seBp5S8auQ4PTo9x69QswlkA8xX0a-nsbb_RaDTV_oERMZvaHzEmczZMMg_esgyyh5ooAEFFSH8jW0lxOVUNSQHqLWBNVhhQBCbCbGcsWVT14rxXd3lYVvKdrUa1n6bbGrqb6Oo_EyGhAKwN03OiqbgoyEueEcNY9yW8ERHWUXlD12ZY5WUVO4ItScHnAO2Yw6UBIWfGZgUXuPhomnCc-WQo59nY_f-5X8kRLi_caMwR2f_do-ZV2m1hlkjA&state=test

app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(configDB.url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, database) => {
  if (err) return console.log(err)
  db = database
  // require('./app/routes.js')(app, passport, db)
  // setupRoutes(app, passport, db);
  setupRoutes(app, passport, SpotifyWebApi)
}); // connect to our database

// const spotifyApiServer = new SpotifyWebApi({
//   clientId: '1f3c90c77fce4b60bd9e18d35175bd86',
//   clientSecret: '8758a46abe0a4ff2abb77245a9b64c2d',
//   redirectUri: 'http://moodchime.herokuapp.com/user'
// });

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









