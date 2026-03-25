const axios = require('axios');
const User = require("../models/user-model");

const jenkins_start_build = async (req, res) => {

    const { repo_url, branch, subDirectory } = req.body;
    try {

        // const getCrumb = await axios.get('http://localhost:8090/crumbIssuer/api/json', {
        //     auth: {
        //         username: process.env.JENKINS_USERNAME,
        //         password: process.env.JENKINS_API_TOKEN
        //     }
        // });

        // console.log("Crumb: " + JSON.stringify(getCrumb.data,null,2));

        const userData = req.user;
        const username = userData.username;
        const user_id = userData.id;
        const to = userData.email || null;
        
        const lastBuildDetail = await axios.get(`http://localhost:8090/job/Hosty/lastBuild/api/json`, {
            auth: {
                username: process.env.JENKINS_USERNAME,
                password: process.env.JENKINS_API_TOKEN
            }
        });

        const nextBuildNumber = parseInt(lastBuildDetail.data.number) + 1 || 1; // ✅ Fixed tonumber → parseInt
        const now = Date.now();

         const updateResult = await User.updateOne(
            {
              _id: userData._id,
              "repos.repo_url": repo_url,
              "repos.branch": branch
            },
            {
              $set: {
                "repos.$.status": "pending",
                "repos.$.updated_at": now,
                "repos.$.build_number": nextBuildNumber
              },
              $addToSet: {  
                "repos.$.number_of_builds": nextBuildNumber
              }
            }
          );
  
      if (updateResult.matchedCount === 0) {
        await User.updateOne(
          { _id: userData._id },
          {
            $push: {
              repos: {
                repo_url,
                subDirectory: subDirectory || null,
                branch,
                email: to,
                username,
                id: user_id,
                hosted_site_url: null,
                status: 'pending',
                build_number: nextBuildNumber,
                created_at: now,
                updated_at: now,
                number_of_builds: [nextBuildNumber]
              }
            }
          }
        );
      }

      

        const buildResponse = await axios.post(`http://localhost:8090/job/Hosty/buildWithParameters?token=${process.env.JENKINS_API_TOKEN}`,
            { REPO_URL: repo_url, BRANCH: branch, SUB_DIR: subDirectory || null, EMAIL: to || null, USERNAME: username, USER_ID: user_id }, 
            {
                auth: {
                    username: process.env.JENKINS_USERNAME,
                    password: process.env.JENKINS_API_TOKEN
                },
                headers: {
                    ["Jenkins-Crumb"]: process.env.JENKINS_CRUMB,  // Header (CSRF protection)
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        console.log("\n\n*******************##Jenkins Build Response##************************\n\n");
        console.log("Build Response: " + JSON.stringify(buildResponse.data,null,2));
        console.log("\n\n************************************************************\n\n");

      
        res.status(200).json({ 
            message: 'Build started successfully', 
            status_response: buildResponse.status, 
            data: {
                build_number: nextBuildNumber,
                repo_url
              }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ 
            status_response: 500,
            error: error.response ? error.response.data : error.message 
        });
    }
}

const jenkins_console_output = async (req, res) => {
    try{
        const { build_number } = req.body;
        const consoleOutput = await axios.get(`http://localhost:8090/job/Hosty/${build_number}/consoleText`, {
            auth: {
                username: process.env.JENKINS_USERNAME,
                password: process.env.JENKINS_API_TOKEN
            }
        });
        console.log("Console Output: "+consoleOutput.data);
        res.status(200).json({ msg: 'Console output fetched', status_response: 200, data: consoleOutput.data });
    }
    catch(error){
        console.error('❌ Error:', error);
        res.status(500).json({ status_response: 500, error: error.response ? error.response.data : error.message });
    }
}

const jenkins_job_status = async (req, res) => {
    try{
        const jobStatus = await axios.get(`http://localhost:8090/job/Hosty/api/json`, {
            auth: {
                username: process.env.JENKINS_USERNAME,
                password: process.env.JENKINS_API_TOKEN
            }
        });
        console.log("Job Status: "+JSON.stringify(jobStatus.data,null,2));
        res.status(200).json({ msg: 'Job status fetched', status_response: 200, data: jobStatus.data });
    }
    catch(error){
        console.error('❌ Error:', error);
        res.status(500).json({ status_response: 500, error: error.response ? error.response.data : error.message });
    }
}

const jenkins_per_build_status = async (req, res) => {
    try{
        const { build_number } = req.body;
        const buildStatus = await axios.get(`http://localhost:8090/job/Hosty/${build_number}/api/json`, {
            auth: {
                username: process.env.JENKINS_USERNAME,
                password: process.env.JENKINS_API_TOKEN
            }
        });
        console.log("Build Status: "+JSON.stringify(buildStatus.data,null,2));
        res.status(200).json({ msg: 'Build status fetched', status_response: 200, data: buildStatus.data });
    }
    catch(error){
        console.error('❌ Error:', error);
        res.status(500).json({ status_response: 500, error: error.response ? error.response.data : error.message });
    }
}

module.exports = { jenkins_start_build,jenkins_console_output,jenkins_job_status,jenkins_per_build_status };