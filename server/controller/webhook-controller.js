const {User, UserBuilds} = require("../models/user-model");
const axios = require('axios');


const jenkins_webhook = async (req, res) => {
    try {
        const { build, status, user, user_id, email, hosted_site_url, repo_url, branch,subDirectory } = req.body;
        console.log("\n\n##########################Webhook received##########################\n\n");
        console.log("Build: "+build);
        console.log("Status: "+status);
        console.log("User: "+user);
        console.log("User ID: "+user_id);
        console.log("email: "+email);
        console.log("Hosted Site URL: "+hosted_site_url);
        console.log("Repo URL: "+repo_url);
        console.log("Branch: "+branch);
        console.log("Sub Directory: "+subDirectory);
        console.log("\n\n########################################################\n\n");

    // ✅ Find user
    const userData = await User.findOne({ id: user_id, username: user });
    if (!userData) {
      return res.status(404).json({ status_response: 404, message: 'User not found' });
    }

    const now = Date.now();

    // ✅ Get build logs from Jenkins
    // const consoleOutput = await axios.get(
    //   `http://localhost:8090/job/Hosty/${build}/consoleText`, 
    //   {
    //     auth: {
    //       username: process.env.JENKINS_USERNAME,
    //       password: process.env.JENKINS_API_TOKEN
    //     }
    //   }
    // );

    // ✅ 1. Update user.repos status + hosted_site_url and sync the status into number_of_builds history
    await User.updateOne(
      {
        _id: userData._id,
        "repos.repo_url": repo_url,
        "repos.branch": branch,
        "repos.build_number": parseInt(build)
      },
      {
        $set: {
          "repos.$.status": status.toLowerCase() == "failure"? "failed" : status.toLowerCase(),
          "repos.$.hosted_site_url": hosted_site_url || null,
          "repos.$.updated_at": now,
          "repos.$.number_of_builds.$[buildElem].status": status.toLowerCase() == "failure"? "failed" : status.toLowerCase()
        }
      },
      {
        arrayFilters: [{ "buildElem.build": parseInt(build) }]
      }
    );

    // // ✅ 2. Find OR create UserBuilds document
    // let userBuildDoc = await UserBuilds.findOne({
    //   username: user,
    //   id: user_id,
    //   repo_url,
    //   branch  // ✅ Match exact repo+branch
    // });

    // if (!userBuildDoc) {
    //   // ✅ CREATE new UserBuilds doc
    //   userBuildDoc = await UserBuilds.create({
    //     username: user,
    //     id: user_id,
    //     repo_url,
    //     hosted_site_url: hosted_site_url || null,
    //     builds: [{
    //       repo_url,
    //       subDirectory: null,  // From user.repos or webhook
    //       branch,
    //       email,
    //       username: user,
    //       id: user_id,
    //       hosted_site_url: hosted_site_url || null,
    //       status,
    //       build_number: parseInt(build),
    //       created_at: now,
    //       updated_at: now,
    //       build_logs: consoleOutput.data,
    //       number_of_builds: [parseInt(build)]  // First build
    //     }]
    //   });
    // } else {
    //   // ✅ UPDATE existing - $push new build
    //   await UserBuilds.updateOne(
    //     { _id: userBuildDoc._id },
    //     {
    //       $push: {
    //         builds: {
    //           repo_url,
    //           subDirectory: null,
    //           branch,
    //           email,
    //           username: user,
    //           id: user_id,
    //           hosted_site_url: hosted_site_url || null,
    //           status,
    //           build_number: parseInt(build),
    //           created_at: now,
    //           updated_at: now,
    //           build_logs: consoleOutput.data,
    //           number_of_builds: parseInt(build)  // Add to array
    //         }
    //       },
    //       $set: {
    //         hosted_site_url: hosted_site_url || null,
    //         updated_at: now  // Schema timestamp
    //       }
    //     }
    //   );
    // }

    console.log(`✅ Webhook processed: Build ${build} → ${status}`);

    res.status(200).json({ 
      status_response: 200, 
      message: 'Webhook processed successfully',
      data: { 
        build, 
        status, 
        repo_url, 
        hosted_site_url,
      } 
    });

  } catch (error) {
    console.error('❌ Webhook Error:', error.response?.data || error.message);
    res.status(500).json({ 
      status_response: 500, 
      error: error.response?.data?.message || error.message 
    });
  }
};

module.exports = { jenkins_webhook };