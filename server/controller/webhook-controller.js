const User = require("../models/user-model");


const jenkins_webhook = async (req, res) => {
    try {
        const { build, status, user, user_id, to, hosted_site_url } = req.body;
        console.log("\n\n##########################Webhook received##########################\n\n");
        console.log("Build: "+build);
        console.log("Status: "+status);
        console.log("User: "+user);
        console.log("User ID: "+user_id);
        console.log("To: "+to);
        console.log("Hosted Site URL: "+hosted_site_url);
        console.log("\n\n########################################################\n\n");


        const userData = await User.findOne({ id: user_id, username: user });
        if (!userData) {
            return res.status(404).json({ status_response: 404, message: 'User not found' });
        }

        const updateUser = await User.updateOne({ id: user_id, username: user }, { $set: { "repos.to": to, "repos.hosted_site_url": hosted_site_url, } });

        

        res.status(200).json({ status_response: 200, message: 'Webhook received', data: { build, status, user, user_id, to, hosted_site_url } });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ status_response: 500, error: error.response ? error.response.data : error.message });
    }
}

module.exports = { jenkins_webhook };