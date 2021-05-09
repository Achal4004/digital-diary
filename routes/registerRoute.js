var express = require('express');
var router = express.Router();
const UserDetails=require('../models/userDetails');
const tempUser=require('../models/tempUser');
const genOTP=require('../controller/generateOTP');
const emailOTP=  require('../controller/emailOTP');
const bcrypt = require('bcrypt');
const userDetails = require('../models/userDetails');
const saltRounds = 10;

router.get('/',(req,res)=> {
    res.render('register');
});

router.post("/part1",(req,res)=>{
    var {email,password,cpassword}=req.body;
    if(email===""||password===""||cpassword===""||password.length<6){
        return res.redirect('/register');
    } 
    else if(password!=cpassword){
        req.flash("error_msg","Password and Confirm Password not matched!");
        return res.redirect('/register');
    }
    UserDetails.exists({email:email},(err,flag)=>{
        if(err) throw err;
        if(flag) {
            req.flash("sorry_msg","Email: "+email+" is already exist.");
            res.redirect('/register');
        }
        else {
            tempUser.register.deleteOne({ email:email },function (err) {if (err) throw err;});
            let otp=genOTP();
            emailOTP(email,'<h4>Dear Sir/ Madam,</h4><h4>Please use the following OTP <'+otp+'> to complete your registration process.<p>for Inquries Contact: 9999XXXX87</p><p>Regards,</p><p>Digital Diary Team</p>').catch(console.error);
            bcrypt.hash(password, saltRounds, function(err, hash) {
                tempUser.register({email:email,password:hash,otp:otp}).save((err,data)=>{
                    if(err) throw err;
                    res.render('otp',{email:email,action:"/register/part2"});
                });
            });   
        }
    });  
});

router.post("/part2",(req,res)=>{
    let {email,otp}=req.body;
    if(email===""||otp===""){
        return res.redirect('/register');
    } 
    tempUser.register.findOne({email:email},(err,user)=>{
        if(err) throw err;
        if(user) {
            if(user.otp!=otp) {
                req.flash("error_msg","OTP doesn't Matched!");
                res.redirect('/register');
            }
            else {
                userDetails({email:user.email,password:user.password}).save((err,data)=>{
                    if(err) throw err;
                    tempUser.register.deleteOne({ email:email },function (err) {if (err) throw err;});
                    req.flash("success_msg","Registration Sucessfull! Plese Login to Continue.")
                    res.redirect("/login");
                });
            }
        }
        else {
            req.flash("error_msg","OTP Session Expired!");
            res.redirect('/register'); 
        }
    });
});

module.exports = router;