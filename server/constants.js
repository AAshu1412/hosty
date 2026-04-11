const FRONTEND_URLS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://[::1]:5173",
];


const JENKINS_URL = process.env.JENKINS_URL || "http://localhost:8090/job/Hosty"


module.exports = {
  FRONTEND_URLS,
  JENKINS_URL
};
