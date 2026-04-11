const axios = require('axios');
const {User} = require("../models/user-model");
const prisma = require('../utils/db-psql');
const {JENKINS_URL} = require('../constants');
const jenkins_start_build = async (req, res) => {
    const { repo_url, branch, subDirectory } = req.body;
    
    try {
        // Mapped from your new authMiddleware
        const user_internal_id = parseInt(req.userID, 10); // Postgres internal ID
        const username = req.user.username;
        const user_github_id = req.user.id;
        const to = req.user.email || null;
        
        // 1. Fetch last build number from Jenkins
        const lastBuildDetail = await axios.get(`${JENKINS_URL}/lastBuild/api/json`, {
            auth: {
                username: process.env.JENKINS_USERNAME,
                password: process.env.JENKINS_API_TOKEN
            }
        });

        const nextBuildNumber = parseInt(lastBuildDetail.data.number) + 1 || 1;

        // 2. Check if this repository/branch combination already exists
        const existingRepo = await prisma.deployedRepo.findFirst({
            where: {
                userId: user_internal_id,
                repoUrl: repo_url,
                branch: branch
            }
        });

        // 3. Database Update: Nested Writes
        if (existingRepo) {
            // Repo exists: Update its status and push a new pending build
            await prisma.deployedRepo.update({
                where: { id: existingRepo.id },
                data: {
                    currentStatus: 'pending',
                    currentBuildNumber: nextBuildNumber,
                    subDirectory: subDirectory || existingRepo.subDirectory, // Update if changed
                    builds: {
                        create: {
                            buildNumber: nextBuildNumber,
                            status: 'pending'
                        }
                    }
                }
            });
        } else {
            // First time building this repo: Create the Repo and the pending build
            await prisma.deployedRepo.create({
                data: {
                    userId: user_internal_id,
                    repoUrl: repo_url,
                    branch: branch,
                    subDirectory: subDirectory || null,
                    notificationEmail: to,
                    hostedSiteUrl: "", // Will be populated when the webhook succeeds!
                    currentStatus: 'pending',
                    currentBuildNumber: nextBuildNumber,
                    builds: {
                        create: {
                            buildNumber: nextBuildNumber,
                            status: 'pending'
                        }
                    }
                }
            });
        }

        // 4. Trigger Jenkins
        // Note: I moved your payload into the `params` object so Jenkins safely reads them as URL query parameters
        const buildResponse = await axios.post(
            `${JENKINS_URL}/buildWithParameters?token=${process.env.JENKINS_API_TOKEN}`,
            null, // Jenkins ignores JSON bodies!
            {
                params: {
                    REPO_URL: repo_url, 
                    BRANCH: branch, 
                    SUB_DIR: subDirectory || "", 
                    EMAIL: to || "", 
                    USERNAME: username, 
                    USER_ID: user_github_id 
                },
                auth: {
                    username: process.env.JENKINS_USERNAME,
                    password: process.env.JENKINS_API_TOKEN
                },
                headers: {
                    "Jenkins-Crumb": process.env.JENKINS_CRUMB,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        console.log("\n\n*******************##Jenkins Build Response##************************\n\n");
        console.log("Build Response Status: ", buildResponse.status);
        console.log("\n\n************************************************************\n\n");
      
        res.status(200).json({ 
            message: 'Build started successfully', 
            status_response: buildResponse.status, 
            data: {
                build_number: nextBuildNumber,
            }
        });

    } catch (error) {
        console.error('❌ Error triggering Jenkins or Database:', error.message);
        res.status(500).json({ 
            status_response: 500,
            error: error.response ? error.response.data : error.message 
        });
    }
}

const jenkins_console_output = async (req, res) => {
    try{
        const { build_number } = req.body;
        const consoleOutput = await axios.get(`${JENKINS_URL}/${build_number}/consoleText`, {
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
        const jobStatus = await axios.get(`${JENKINS_URL}/api/json`, {
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
        const buildStatus = await axios.get(`${JENKINS_URL}/${build_number}/api/json`, {
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