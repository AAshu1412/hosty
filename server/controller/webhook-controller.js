

const jenkins_webhook = async (req, res) => {
    try {
        const { build, status, user, user_id, to } = req.body;
        console.log("\n\n##########################Webhook received##########################\n\n");
        console.log("Build: "+build);
        console.log("Status: "+status);
        console.log("User: "+user);
        console.log("User ID: "+user_id);
        console.log("To: "+to);
        console.log("\n\n########################################################\n\n");
        res.status(200).json({ status_response: 200, message: 'Webhook received', data: { build, status, user, user_id, to } });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ status_response: 500, error: error.response ? error.response.data : error.message });
    }
}

module.exports = { jenkins_webhook };