import mongoose from "mongoose";
export default mongoose.model("Notification",new mongoose.Schema({recipient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},type:{type:String,default:"general"},title:{type:String,required:true},message:{type:String,required:true},read:{type:Boolean,default:false}},{timestamps:true}));
