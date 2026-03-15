const express=require("express");
const router=express.Router();
const authcontrollers=require("../controller/github-auth-controller");

router.route("/callback").post(authcontrollers.github_callback);
router.route("/repoContent").get(authcontrollers.github_user_repos);

module.exports=router;