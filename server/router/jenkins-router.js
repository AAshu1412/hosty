const express=require("express");
const router=express.Router();
const jenkinscontrollers=require("../controller/jenkins-controller");

router.route("/getCrumb").get(jenkinscontrollers.jenkins_get_crumb);
router.route("/consoleOutput").get(jenkinscontrollers.jenkins_console_output);

module.exports=router;