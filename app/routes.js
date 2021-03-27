const User = require('./models/user')

module.exports = setupRoutes;

function setupRoutes(app) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.html');
  });


}
