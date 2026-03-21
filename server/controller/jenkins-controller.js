const axios = require('axios');

const jenkins_get_crumb = async (req, res) => {

    try {

        const getCrumb = await axios.get('http://localhost:8090/crumbIssuer/api/json', {
            auth: {
                username: process.env.JENKINS_USERNAME,
                password: process.env.JENKINS_API_TOKEN
            }
        });

        console.log("Crumb: " + JSON.stringify(getCrumb.data, null, 2));

        const buildResponse = await axios.post(`http://localhost:8090/job/Hosty/buildWithParameters?token=${process.env.JENKINS_API_TOKEN}`,
            { name: "GOOOOGI" }, // Body (parameters)
            {
                auth: {
                    username: 'ashu',
                    password: process.env.JENKINS_API_TOKEN
                },
                headers: {
                    [getCrumb.data.crumbHeader]: getCrumb.data.crumb,  // Header (CSRF protection)
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        console.log("\n************************************************************\n");
        console.log("Build Response: " + JSON.stringify(buildResponse.data, null, 2));
        console.log("\n************************************************************\n");

        res.status(200).json({ message: 'Build started' });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error });
    }
}

const jenkins_console_output = async (req, res) => {
    try{
        const consoleOutput = await axios.get(`http://localhost:8090/job/Hosty/lastBuild/consoleText`, {
            auth: {
                username: 'ashu',
                password: process.env.JENKINS_API_TOKEN
            }
        });
        console.log("Console Output: "+consoleOutput.data);
        res.status(200).json({ message: 'Console output fetched' });
    }
    catch(error){
        console.error('❌ Error:', error);
        res.status(500).json({ error });
    }
}

module.exports = { jenkins_get_crumb,jenkins_console_output };