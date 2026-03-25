const express=require("express");
const router=express.Router();
const jenkinscontrollers=require("../controller/jenkins-controller");
const authMiddleware = require("../middlewares/auth-middleware");


router.route("/startBuild").post(authMiddleware,jenkinscontrollers.jenkins_start_build);
router.route("/consoleOutput").post(authMiddleware,jenkinscontrollers.jenkins_console_output);
router.route("/jobStatus").get(authMiddleware,jenkinscontrollers.jenkins_job_status);
router.route("/perBuildStatus").post(authMiddleware,jenkinscontrollers.jenkins_per_build_status);

module.exports=router;