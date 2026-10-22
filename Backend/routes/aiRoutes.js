const r=require("express").Router(),c=require("../controllers/aiController"),protect=require("../middleware/authMiddleware");r.post("/search",protect,c.parseAccommodationQuery);module.exports=r;
