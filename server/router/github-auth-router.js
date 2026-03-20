const express=require("express");
const router=express.Router();
const authcontrollers=require("../controller/github-auth-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const {repoNameSchema,repoContentSchema}= require("../validators/auth-validator");
const validate=require("../middlewares/validate-middleware");

router.route("/callback").post(authcontrollers.github_callback);
router.route("/repoContent").post(authMiddleware,validate(repoNameSchema),authcontrollers.user_github_repos_content);
router.route("/repoContentPath").post(authMiddleware,validate(repoContentSchema),authcontrollers.user_github__repos_content_path);
router.route("/user").get(authMiddleware,authcontrollers.user_data);
router.route("/userRepos").get(authMiddleware,authcontrollers.user_github_repos);
// router.route("/listUsers").get(authcontrollers.list_users);
router.route("/repoBranch").post(authMiddleware,validate(repoNameSchema),authcontrollers.user_github_repos_branch);
module.exports=router;