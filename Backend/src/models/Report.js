import mongoose from "mongoose";
export default mongoose.model("Report",new mongoose.Schema({reportedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},property:{type:mongoose.Schema.Types.ObjectId,ref:"Property",required:true},reason:{type:String,required:true},details:String,status:{type:String,enum:["open","reviewing","resolved","dismissed"],default:"open"}},{timestamps:true}));
