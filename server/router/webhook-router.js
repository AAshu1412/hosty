const express=require("express");
const router=express.Router();
const webhookcontrollers=require("../controller/webhook-controller");
// const authMiddleware = require("../middlewares/auth-middleware");


router.route("/jenkinsWebhook/").post(webhookcontrollers.jenkins_webhook);

module.exports=router;