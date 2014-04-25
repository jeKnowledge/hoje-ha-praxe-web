/* Load all the necessary node modules */
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var fs = require('fs');

var hapraxe = true;
var password;

/* Month names, in Portuguese */
var months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
              "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/* Set up the views/ and public/ folder */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Set up logging with logfmt */
app.use(logfmt.requestLogger());

/* Read a password from password.txt */
fs.readFile('password.txt', 'utf8', function(error, data) {
  if (error) {
    console.log('An error occured while reading the password: ' + error);
  } else {
    password = data.replace('\n', '');
  }
});

/* Verifies the password is correct, if yes change the status and go to main page */
app.post('/switch', function(req, res) {
  if (req.body.password == password) {
    hapraxe = !hapraxe;
  }

  res.redirect('/');
});

/* The /switch page that allows admins to change the status of the website */
app.get('/switch', function(req, res) {
  res.render('switch');
});

/* Main page that renders the answer to people */
app.get('/', function(req, res) {
  var date = new Date();
  
  res.render('index', { hapraxe: hapraxe, day: date.getDate(),
                        month: months[date.getMonth()] } );
});

/* Start up the server */
var port = Number(process.env.PORT || 3000);
var server = app.listen(port, function() {
  console.log('Listening on port ' + port);
});
