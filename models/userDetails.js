const mongoose = require('mongoose');
const userDetailsSchema= new mongoose.Schema({
    email:{type:String,unique:true,required:true},
    password:{type:String,required:true},
});
module.exports= new mongoose.model("UserDetails",userDetailsSchema);