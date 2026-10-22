const mongoose=require("mongoose");
const roomSchema=new mongoose.Schema({roomName:{type:String,required:true},roomType:{type:String,enum:["single","shared","bed-space","studio","apartment"],default:"single"},monthlyRent:{type:Number,required:true},totalCapacity:{type:Number,default:1},availableCapacity:{type:Number,default:1},availableFrom:Date,isAvailable:{type:Boolean,default:true}},{timestamps:true});
const schema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},title:{type:String,required:true},description:{type:String,required:true},
 propertyType:{type:String,enum:["flat","house","single-room","shared-room","sublet","hostel","mess","studio","bed-space"],required:true},
 address:{type:String,required:true},area:String,city:String,
 location:{type:{type:String,enum:["Point"],default:"Point"},coordinates:{type:[Number],required:true}},
 monthlyRent:{type:Number,required:true},deposit:{type:Number,default:0},
 suitableFor:[{type:String,enum:["family","bachelor","female","male","student","professional","any"]}],facilities:[String],images:[String],rooms:[roomSchema],
 availableUnits:{type:Number,default:1},availabilityLastConfirmed:{type:Date,default:Date.now},
 verificationStatus:{type:String,enum:["pending","approved","rejected","changes-requested"],default:"pending"},isPublished:{type:Boolean,default:false},rejectionReason:{type:String,default:""}
},{timestamps:true});schema.index({location:"2dsphere"});module.exports=mongoose.model("Property",schema);
