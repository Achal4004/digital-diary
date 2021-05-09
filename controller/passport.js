const userDetails=require("../models/userDetails");
const tempUser=require('../models/tempUser');

LocalStrategy = require('passport-local').Strategy;
module.exports = function (passport) {
    passport.use(new LocalStrategy({usernameField:'email',passwordField:'otp'},function(email, otp, done) {
          tempUser.login.findOne({ email: email }, function (err, user) {
            if (err) throw err;
            if (!user) {
              return done(null, false, { message: 'OTP Session Expired!' });
            }
            if(otp===user.otp) {
                userDetails.findOne({email:email},(err,doc)=> {
                    tempUser.login.deleteOne({ email:email },function (err) {if (err) throw err;});
                    return done(null, doc);
                });
            }
            else {
                return done(null, false, { message: "OTP doesn't Matched!" }); 
            }
          });
    }));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    }); 
    passport.deserializeUser(function(id, done) {
        userDetails.findById(id, function(err, user) {
            done(err, user);
        });
    });
}