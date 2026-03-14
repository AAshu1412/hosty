const express=require("express");
const router=express.Router();
const authcontrollers=require("../controller/github-auth-controller");

router.route("/callback").post(authcontrollers.github_callback);

module.exports=router;