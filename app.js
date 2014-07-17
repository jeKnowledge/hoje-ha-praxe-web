/* Load all the necessary node modules */
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var fs = require('fs');

/* Application logic variables */
var hapraxe;
var password = 'veteranos';
var notification;
var reason;

/* Month names, in Portuguese */
var months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
              'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

var mongo = require('mongodb');
var monk = require('monk');

var uri = process.env.MONGOLAB_URI || 'mongodb://localhost/praxedb';
var db = monk(uri);

var information = db.get('information');

information.findOne({ }, function(err, doc) {
  if (err) {
    throw err;
  } else {
    if (doc == null) {
      doc = { hapraxe: true,
              reason: '',
              notification: 'Notificação oficial, do Conselho de Veteranos da Universidade de Coimbra.' };
    } else {
      hapraxe = doc.hapraxe;
      reason = doc.reason;
      notification = doc.notification;
    }
  }
});

/* Set up the views/ and public/ folder */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Set up logging with logfmt */
app.use(logfmt.requestLogger());

/* Verifies the password is correct, if yes change the status and go to main page */
app.post('/switch', function(req, res) {
  if (req.body.password == password) {
    hapraxe = !! req.body.hapraxe;
    reason = req.body.reason;
    notification = req.body.notification;

    information.update({ }, { $set: { hapraxe: hapraxe } });
    information.update({ }, { $set: { reason: reason } });
    information.update({ }, { $set: { notification: notification } });
  }

  res.redirect('/');
});

/* The /switch page that allows admins to change the status of the website */
app.get('/switch', function(req, res) {
  res.render('switch', { hapraxe: hapraxe,
                         notification: notification,
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
