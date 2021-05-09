const mongoose = require('mongoose');
const tempRegisterSchema=new mongoose.Schema({
    email:{type:String,unique:true,required:true},
    password:{type:String,require:true},
    otp:{type:String,require:true},
    expire_at: {
        type:Date,
        default:Date.now,
        expires: 200,
    }
});
const tempLoginSchema=new mongoose.Schema({
    email:{type:String,unique:true,required:true},
    otp:{type:String,require:true},
    expire_at: {
        type:Date,
        default:Date.now,
        expires:200,
    }
});
module.exports.register=new mongoose.model("tempRegisterUsers",tempRegisterSchema);
module.exports.login=new mongoose.model("tempLoginUsers",tempLoginSchema);
module.exports.forget=new mongoose.model("tempforgetUsers",tempLoginSchema);