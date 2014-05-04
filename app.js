/* Load all the necessary node modules */
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var fs = require('fs');

/* Application logic variables */
var hapraxe;
var password;
var notification;
var reason;

/* Month names, in Portuguese */
var months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
              'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* Set up the views/ and public/ folder */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Set up logging with logfmt */
app.use(logfmt.requestLogger());

/* Read current status from status.txt */
fs.readFile('status.txt', 'utf8', function(err, data) {
  if (err) {
    console.log('An error occured while reading the status: ' + err);
  } else {
    hapraxe = data.replace('\n', '') === 'true';
  }
});

/* Read a password from password.txt */
fs.readFile('password.txt', 'utf8', function(err, data) {
  if (err) {
    console.log('An error occured while reading the password: ' + err);
  } else {
    password = data.replace('\n', '');
  }
});

/* Read the reason */
fs.readFile('reason.txt', 'utf8', function(err, data) {
  if (err) {
    console.log('An error occured while reading the reason: ' + err);
  } else {
    reason = data;
  }
});

/* Read the notification text */
fs.readFile('notification.txt', 'utf8', function(err, data) {
  if (err) {
    console.log('An error occured while reading the notification: ' + err);
  } else {
    notification = data;
  }
});

/* Verifies the password is correct, if yes change the status and go to main page */
app.post('/switch', function(req, res) {
  if (req.body.password == password) {
    hapraxe = !! req.body.hapraxe;
    reason = req.body.reason;
    notification = req.body.notification;

    fs.writeFile('status.txt', hapraxe.toString(), function(err) {
      if (err) {
        throw err;
      }
    });

    fs.writeFile('reason.txt', reason, function(err) {
      if (err) {
        throw err;
      }
    });

    fs.writeFile('notification.txt', notification, function(err) {
      if (err) {
        throw err;
      }
    });
  }

  res.redirect('/');
});

/* The /switch page that allows admins to change the status of the website */
app.get('/switch', function(req, res) {
  res.render('switch', { notification: notification,
                         reason: reason });
});

/* An API-like JSON result */
app.get('/result', function(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ hapraxe: hapraxe,
                           notification: notification,
                           reason: reason }, null, 4));
});

/* The switch page that renders the answer to users */
app.get('/', function(req, res) {
  var date = new Date();

  res.render('index', { hapraxe: hapraxe, day: date.getDate(),
                        month: months[date.getMonth()],
                        notification: notification,
                        reason: reason } );
});

/* Start up the server */
var port = Number(process.env.PORT || 3000);
var server = app.listen(port, function() {
  console.log('Listening on port ' + port);
});
