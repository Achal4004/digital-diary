var express = require('express');
var router = express.Router();
const passport = require('passport');
const tempUser=require('../models/tempUser');
const userDetails = require('../models/userDetails');
const genOTP=require('../controller/generateOTP');
const emailOTP=  require('../controller/emailOTP');
const bcrypt = require('bcrypt');

router.get("/",(req,res)=> {
    if(req.isAuthenticated()){
        res.set('Cache-Control','no-cache, private, no-store, must-revalidate, post-check=0, pre-checked=0');
        res.redirect('/');
    }else {
        req.flash('error');
        res.render('login');
    }
});

router.post("/part1",(req,res)=>{
    var {email,password}=req.body;
    if(!(email||password)){
        return res.redirect('/login');
    }
    userDetails.findOne({email:email},(err,user)=>{
        if(err) throw err;
        if(!user) {
            req.flash("error_msg","Incorrect Email.");
            res.redirect('/login');
        }
        else {
            bcrypt.compare(password, user.password, function(err, result) {
                if(result) {
                    tempUser.login.deleteOne({email:email},function (err) {if (err) throw err;});
                    let otp=genOTP();
                    emailOTP(email,'<h4>Dear Sir/ Madam,</h4><h4>Please use the following OTP <'+otp+'> for signin process.<p>for Inquries Contact: 9999XXXX87</p><p>Regards,</p><p>Digital Diary Team</p>').catch(console.error);
                    tempUser.login({email:email,otp:otp}).save((err,data)=>{
                        if(err) throw err;
                        res.render('otp',{email:email,action:"/login/part2"});
                    }); 
                }
                else {
                    req.flash("error_msg",'Incorrect Password.');
                    res.redirect('/login');
                }
            });
        }
    }); 
});

router.post("/part2",(req,res,next)=>{
    let {email,otp}=req.body;
    if(!(email||otp)){
        return res.redirect('/login');
    } 
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    })(req,res,next);
});

module.exports = router;