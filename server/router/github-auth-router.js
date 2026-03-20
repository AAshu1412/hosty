const express=require("express");
const router=express.Router();
const authcontrollers=require("../controller/github-auth-controller");
const authMiddleware = require("../middlewares/auth-middleware");

router.route("/callback").post(authcontrollers.github_callback);
router.route("/repoContent").post(authMiddleware,authcontrollers.user_github_repos_content);
// router.route("/repoContentPath").get(authcontrollers.github_user_repos_content_path);
// router.route("/listUsers").get(authcontrollers.list_users);
router.route("/user").get(authMiddleware,authcontrollers.user_data);
router.route("/userRepos").get(authMiddleware,authcontrollers.user_github_repos);
module.exports=router;