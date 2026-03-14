const express=require("express");
const router=express.Router();
const authcontrollers=require("../controller/github-auth-controller");

router.route("/").get(authcontrollers.home);

module.exports=router;