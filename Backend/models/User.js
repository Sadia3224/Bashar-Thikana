const mongoose=require("mongoose");const bcrypt=require("bcryptjs");
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},phone:{type:String,default:""},
 password:{type:String,required:true,minlength:6},role:{type:String,enum:["consumer","user","admin"],default:"consumer"},
 isVerified:{type:Boolean,default:false},isActive:{type:Boolean,default:true}
},{timestamps:true});
schema.pre("save",async function(){if(!this.isModified("password"))return;this.password=await bcrypt.hash(this.password,10);});
schema.methods.comparePassword=function(p){return bcrypt.compare(p,this.password);};
module.exports=mongoose.model("User",schema);
