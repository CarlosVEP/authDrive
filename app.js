var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('cookie-session');
const bodyParser = require('body-parser');
var logger = require('morgan');
var passport = require('passport');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
const fileUpload = require('express-fileupload')

 
mongoose.connect('mongodb://localhost/360iop', {useCreateIndex: true, useNewUrlParser: true});
require('./passport/local-auth');
var app = express();

// use static authenticate method of model in LocalStrategy

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({keys: ['secretkey1', 'secretkey2', '...']}));

app.use(express.static(path.join(__dirname, 'public')));

// requires the model with Passport-Local Mongoose plugged in
const User = require('./models/UserModel');
// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// file upload
app.use(fileUpload());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
