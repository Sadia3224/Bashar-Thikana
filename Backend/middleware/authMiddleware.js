const jwt=require("jsonwebtoken");
const User=require("../models/User");
module.exports=async(req,res,next)=>{
 try{
  const h=req.headers.authorization;
  if(!h||!h.startsWith("Bearer ")) return res.status(401).json({message:"Authentication required"});
  const decoded=jwt.verify(h.split(" ")[1],process.env.JWT_SECRET);
  const user=await User.findById(decoded.id).select("-password");
  if(!user||!user.isActive) return res.status(401).json({message:"User is unavailable"});
  req.user=user;next();
 }catch(e){return res.status(401).json({message:"Invalid or expired token"});}
};
