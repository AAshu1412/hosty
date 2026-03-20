const express=require("express");
const router=express.Router();
const authcontrollers=require("../controller/github-auth-controller");

router.route("/callback").post(authcontrollers.github_callback);
router.route("/repoContent").get(authcontrollers.github_user_repos_content);
router.route("/repoContentPath").get(authcontrollers.github_user_repos_content_path);
router.route("/listUsers").get(authcontrollers.list_users);

module.exports=router;