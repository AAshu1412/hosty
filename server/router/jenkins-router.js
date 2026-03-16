const express=require("express");
const router=express.Router();
const jenkinscontrollers=require("../controller/jenkins-controller");

router.route("/getCrumb").get(jenkinscontrollers.jenkins_get_crumb);

module.exports=router;