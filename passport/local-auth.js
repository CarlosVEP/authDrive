const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User    = require('../models/UserModel');
const GoogleStrategy= require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');

passport.serializeUser((user, done) =>{
    done(null, user.id);
});
passport.deserializeUser(async (id, done) =>{
   const user = await User.findById(id);
   done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: configAuth.googleAuth.clientID,
  clientSecret: configAuth.googleAuth.clientSecret,
  callbackURL: configAuth.googleAuth.callbackURL
},
function(request, accessToken, refreshToken, profile, done){
    console.log("ss")
    process.nextTick(function(){
      User.findOne({'google.id': profile.id}, function(err, user){
        if(err)
          return done(err);
        if(user)
          return done(null, user);
        else {
          var newUser = new User();
          newUser.google.id = profile.id;
          newUser.google.token = accessToken;
          newUser.google.name = profile.displayName;
          newUser.google.email = profile.emails[0].value;

          newUser.save(function(err){
            if(err)
              throw err;
            return done(null, newUser);
          })
          console.log(profile);
        }
      });
    });
  }

));