var express = require('express');
var router = express.Router();
const userDetails=require('../models/userDetails');
const tempUser=require('../models/tempUser');
const genOTP=require('../controller/generateOTP');
const emailOTP=require('../controller/emailOTP')
const bcrypt=require('bcrypt');
const saltRounds=10;

router.get('/',(req,res)=> {
    res.render('forgetPasswordPart1');
});

router.post('/part1',(req,res)=> {
    var {email}=req.body;
    if(email!="") {
        userDetails.findOne({email:email},(err,user)=>{
            if(err) throw err;
            if(!user) {
                req.flash("error_msg","Email Doesn't Exist.");
                res.redirect('/forget');
            }
            else {
                tempUser.forget.deleteOne({email:email},function (err) {if (err) throw err;});
                let otp=genOTP();
                emailOTP(email,'<h4>Dear Sir/ Madam,</h4><h4>Please use the following OTP <'+otp+'> for changing the password.<p>for Inquries Contact: 9999XXXX87</p><p>Regards,</p><p>Digital Diary Team</p>').catch(console.error);
                tempUser.forget({email:email,otp:otp}).save((err,data)=>{
                    if(err) throw err;
                    res.render('forgetPasswordpart2',{email:email,action:'/forget/part2'});
                }); 
            }
        }); 
    }
    else {
        res.redirect('/forget');
    }
})

router.post('/part2',(req,res)=> {
    var{email,npassword,cpassword,otp}=req.body;
    if(email==""||npassword==""||cpassword==""||otp==""||npassword<6) {
        res.redirect('/forget');
    }
    if(npassword!=cpassword) {
        req.flash("error_msg","Password and Confirm Password not matched!");
        res.redirect('/forget');
    }
    else {
        tempUser.forget.findOne({email:email},(err,user)=>{
            if(err) throw err;
            if(user) {
                if(user.otp!=otp) {
                    req.flash("error_msg","OTP doesn't Matched!");
                    res.redirect('/forget');
                }
                else {
                    bcrypt.hash(npassword, saltRounds, function(err, hash1) {
                        userDetails.updateOne(
                            { "email": req.body.email},
                            { "$set":{password:hash1}},
                            function (err, raw) {
                                if (err) throw err;
                            }
                         );
                    });
                    tempUser.forget.deleteOne({ email:email },function (err) {if (err) throw err;});
                    req.flash("success_msg","Password changed sucessfully");
                    res.redirect('/login');
                }
            }
            else {
                req.flash("error_msg","OTP Session Expired!");
                res.redirect('/forget'); 
            }
        });
    }
});

module.exports = router;