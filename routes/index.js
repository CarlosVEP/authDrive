var express = require('express');
var router = express.Router();
var auth = require("../controllers/AuthController.js");
const passport = require('passport');
const {google} = require('googleapis')

// restrict index for logged in user only
router.get('/', auth.home);

// route to register page
router.get('/register', auth.register);

// route for register action
router.post('/register', auth.doRegister);

// route to login page
router.get('/login', auth.login);

// route for login action
router.post('/login', auth.doLogin);

// route for logout action
router.get('/logout', auth.logout);

router.post('/upload', function (req, res) {

  // not auth
  if (!req.user) res.redirect('/auth/google')
  else {
      // auth user

      // config google drive with client token
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({
          'access_token': req.user.google.token
          //'ya29.GmBPBz006hPZ9-zJPisGoLvwHFZlVyqO4eOQWUKGryeiSQF6Mq3ySaY8oy6hi5rldF7qMnuVdrC1XyCpjSTxQXBXmK420nM2oJHmbCCWZ7utWhvjhx2HDOsLf-2r-bQstxU'//
      });

      console.log(oauth2Client);
      const drive = google.drive({
          version: 'v3',
          auth: oauth2Client
      });

      //move file to google drive
      //  console.log(req.user.google);

      let { name: filename, mimetype, data } = req.files.file_upload

      const driveResponse = drive.files.create({
          requestBody: {
              name: filename,
              mimeType: mimetype
          },
          media: {
              mimeType: mimetype,
              body: Buffer.from(data).toString()
          }
      });

      driveResponse.then(data => {

          if (data.status == 200) res.redirect('/profile?file=upload') // success
          else res.redirect('/profile?file=notupload') // unsuccess

      }).catch(err => { throw new Error(err) })
  }
})

router.get('/profile', isAuthenticated,(req,res,next) => {



      let parseData = {}

      // if redirect with google drive response
      if (req.query.file !== undefined) {
          // successfully upload
          if (req.query.file == "upload") parseData.file = "uploaded"
          else if (req.query.file == "notupload") parseData.file = "notuploaded"
      }
      
    console.log(req);
    console.log("------------------------")
    console.log(req.user);
    res.render('profile', {user:req.user, parseData:parseData});
});
router.get('/auth/google', passport.authenticate('google',{scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.file']}));
router.get('/auth/google/callback', 
    passport.authenticate('google', { successRedirect: '/profile',  failureRedirect: '/' })
);
    function isAuthenticated(req , res , next){
      if(req.isAuthenticated()){
        return next();
      }
      res.redirect('/');
    } 
module.exports = router;
