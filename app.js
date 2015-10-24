var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var admin = require('./routes/admin');
var router = require('./routes/router');
var users = require('./routes/users');
var prints = require('./routes/prints');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'sflkjwlflsfljsdfPLjWefsdlfjWafd$%#%#',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

var db = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        database: 'islip',
        user: 'root',
        password: ''
    }
});

var clientAuth = function (req, res, next) {
  if (!req.session.employeeId) {
    res.redirect('/users/login');
  } else {
    next();
  }
}

var printAuth = function (req, res, next) {
  if (!req.session.canPrint) {
    res.send({ok: false, msg: 'คุณไม่มีสิทธิ์พิมพ์สลิปเงินเดือน'})
  } else {
    next();
  }
}

var adminAuth = function (req, res, next) {
  if (!req.session.adminLogged) {
    res.redirect('/users/admin/login');
  } else {
    next();
  }
}

app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use('/users', users);
app.use('/prints', printAuth, prints);
app.use('/admin', adminAuth, admin);
app.use('/', clientAuth, router);

module.exports = app;
