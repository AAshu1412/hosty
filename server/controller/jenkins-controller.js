const axios = require('axios');

const jenkins_start_build = async (req, res) => {

    const { repo_url, branch } = req.body;
    try {

        // const getCrumb = await axios.get('http://localhost:8090/crumbIssuer/api/json', {
        //     auth: {
        //         username: process.env.JENKINS_USERNAME,
        //         password: process.env.JENKINS_API_TOKEN
        //     }
        // });

        // console.log("Crumb: " + JSON.stringify(getCrumb.data,null,2));

        const buildResponse = await axios.post(`http://localhost:8090/job/Hosty/buildWithParameters?token=${process.env.JENKINS_API_TOKEN}`,
            { REPO_URL: repo_url, BRANCH: branch }, 
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
            // data: buildResponse.data, 
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
        const consoleOutput = await axios.get(`http://localhost:8090/job/Hosty/lastBuild/consoleText`, {
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

module.exports = { jenkins_start_build,jenkins_console_output,jenkins_job_status };