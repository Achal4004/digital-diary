var express = require('express');
var router = express.Router();
const userDetails=require('../models/userDetails');
const store=require('../models/store');
const bcrypt=require('bcrypt');
const saltRounds=10;

const checkAuth=function(req,res,next) {
    if(req.isAuthenticated()){
        res.set('Cache-Control','no-cache, private, no-store, must-revalidate, post-check=0, pre-checked=0');
        return next();
    }else {
        res.render('index');
    }
}
router.get('/',checkAuth,(req,res)=> {
    store.diary.find({email:req.user.email},{email:0,content:0,__v:0},(err,dlist)=>{
        if (err) throw err;
        res.render('home',{email:req.user.email,dlist:dlist});
    });
});

router.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
})

router.post("/changePassword",checkAuth,(req,res)=>{
    var {opassword,npassword,cpassword}=req.body;
    if(opassword==""||npassword==""||cpassword==""||npassword.length<6) {
        return res.redirect('/');
    }
    else if(npassword!=cpassword) {
        req.flash("error_msg","New Password is not match with Confirm password.");
        return res.redirect('/');
    }
    userDetails.findOne({ email:req.user.email }, function (err, doc) {
        bcrypt.compare(opassword, doc.password, function(err, result) {
            if(!result) {
                req.flash("error_msg","Current Password is Incorrect.");
                res.redirect('/');
            }
            else {
                bcrypt.hash(npassword, saltRounds, function(err, hash1) {
                    userDetails.updateOne(
                        { "email": req.user.email},
                        { "$set":{password:hash1}},
                        function (err, raw) {
                            if (err) throw err;
                        }
                     );
                });
                req.flash("success_msg","Password changed sucessfully");
                res.redirect('/');
            }
        });
    });
});
router.get('/addNote',checkAuth,(req,res)=> {
    res.render('addNote',{email:req.user.email});
});

router.post("/addNote", checkAuth,(req,res)=> {
    var {heading,note}=req.body;
    if(heading!=""&&note!="" && note.length>400) {
        store.diary({email:req.user.email,date:new Date().toISOString().slice(0, 10),header:heading,subContent:note.slice(0,400), content:note}).save((err,data)=>{if(err) throw err;});
    }
    res.redirect('/');
});
router.get('/delete/note/:id',checkAuth,(req,res)=>{
    store.diary.deleteOne({_id:req.params.id,email:req.user.email},(err,flag)=> {
        if(err) throw err;
        req.flash("success_msg","note sucessfully deleted.");
        res.redirect('/');
    }); 
});
router.get('/note/:id',checkAuth,(req,res)=>{
    store.diary.findOne({_id:req.params.id,email:req.user.email},(err,data)=> {
        if(err) throw err;
        if(data)
            res.render('show',{email:req.user.email,data:data});
        else
            res.redirect('/');
    });
});

module.exports = router;