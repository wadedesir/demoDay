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

const morgan = require('morgan')
const configDB = require('./config/database.js');
const setupRoutes = require('./app/routes.js')

let db

// configuration ===============================================================
app.use(bodyParser.urlencoded({ extended: true }))

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.json()); // get information from html forms
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

// var distDir = __dirname + "/dist/";
// app.use(express.static(distDir));

app.set('view engine', 'ejs'); // set up ejs for templating

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
