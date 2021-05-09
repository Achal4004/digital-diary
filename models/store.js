const mongoose = require('mongoose');
const DiarySchema= new mongoose.Schema({
    email:{type:String,required:true},
    date:{type:Date,required:true},
    header:{type:String,required:true},
    subContent:{type:String,required:true},
    content:{type:String,required:true},  
});
module.exports.diary=new mongoose.model("Diarys",DiarySchema);