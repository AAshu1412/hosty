const {User} = require("../models/user-model");

const github_callback = async (req, res) => {
  const { code } = req.body;
console.log("code: ", code);
console.log("code type: ", typeof code);

  if (!code) {
    return res.status(400).json({
      error: "GitHub authorization code is required.",
      status_response: 400,
    });
  }

  try {
    // 1. Exchange code for token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    if (!tokenResponse.ok || !access_token) {
      return res.status(400).json({
        error:
          tokenData.error_description ||
          tokenData.error ||
          "Failed to get token",
        status_response: 400,
      });
    }

    // 2. Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });
    const user = await userResponse.json();

    if (!userResponse.ok || !user?.id || !user?.login) {
      return res.status(400).json({
        error: user.message || "Failed to fetch authenticated GitHub user.",
        status_response: 400,
      });
    }

    let userRecord = await User.findOne({ id: user.id });
    const isExistingUser = Boolean(userRecord);
    const resolvedEmail =
      user.email || userRecord?.email || userRecord?.user?.email || null;

    const userPayload = {
      access_token: tokenData.access_token,
      access_token_expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token || null,
      refresh_token_expires_in: tokenData.refresh_token_expires_in || null,
      token_type: tokenData.token_type,
      username: user.login,
      id: user.id,
      email: resolvedEmail,
      has_completed_onboarding:
        userRecord?.has_completed_onboarding || Boolean(resolvedEmail),
      user: {
        username: user.login,
        id: user.id,
        node_id: user.node_id,
        email: resolvedEmail,
        type: user.type,
        name: user.name || user.login,
        user_view_type: user.user_view_type || "public",
        bio: user.bio || null,
        location: user.location || null,
        notification_email: user.notification_email || null,
        avatar_url: user.avatar_url || null,
        html_url: user.html_url,
      },
    };

    if (userRecord) {
      userRecord.set(userPayload);
      await userRecord.save();
    } else {
      userRecord = await User.create({
        ...userPayload,
        repos: [],
      });
    }

    console.log("\n\n########## *******User Created******* ##############\n\n");
    console.log("user:", JSON.stringify(user, null, 2));

    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // 4. UPDATE JSON FILE - OVERWRITE with NEW data
    // const jsonFilePath = path.join(__dirname, '../../ashu.json'); // Root dir

    // let existingData = {};

    // try {
    //     // Read existing file (if exists)
    //     const fileData = await fs.readFile(jsonFilePath, 'utf8');
    //     existingData = JSON.parse(fileData);
    // } catch (error) {
    //     // File doesn't exist - create fresh
    //     console.log("Creating new ashu.json");
    // }

    // // 5. REPLACE old data with NEW data
    // const updatedData = {
    //     access_token: access_token,
    //     tokenData: tokenData,
    //     user: user,
    //     repo: repo  // NEW! All repos
    // };

    // // 6. Write to file (atomic write)
    // await fs.writeFile(jsonFilePath, JSON.stringify(updatedData, null, 2));

    // console.log("✅ Saved to ashu.json | Repos:", repo.length);
    // console.log("--------------------------------------------------------\n\n")
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const created_token = await userRecord.generateToken();

    console.log("#######################\ncreated_token:", created_token);
    console.log(
      "\n\n########################################################\n\n"
    );

    res.status(isExistingUser ? 200 : 201).json({
      msg: isExistingUser
        ? "user authenticated successfully"
        : "user created successfully",
      status_response: isExistingUser ? 200 : 201,
      token: created_token,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message,status_response:500 });
  }
};

const user_data = async (req, res) => {
  try {
    const userData = req.user;
    return res.status(200).json({ msg: userData });
  } catch (error) {
    res.status(500).send({ msg: "user error" });
  }
};

const user_github_repos = async (req, res) => {
  try {
    const userData = req.user;
    const access_token = req.access_token;
    const userRepoResponse = await fetch(
      `https://api.github.com/users/${userData.username}/repos`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    const repo = await userRepoResponse.json();
    console.log(
      "\n\n########## *******User Github Repos******* ##############\n\n"
    );
    // console.log("repo:", JSON.stringify(repo, null, 2));
    console.log(
      "\n\n########################################################\n\n"
    );
    return res.status(200).json({ msg: "Repo fetched successfully", status_response: 200, data: repo });
  } catch (error) {
    res.status(500).send({ msg: "user error" });
  }
};

const user_github_repos_content = async (req, res) => {
  try {
    const userData = req.user;
    const access_token = req.access_token;
    const { repo_name } = req.body;
    // 3. Fetch repo contents (repo[2] = 3rd repo)
    const userRepoContents = await fetch(
      `https://api.github.com/repos/${userData.username}/${repo_name}/contents`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // ✅ Now defined
          Accept: "application/json",
        },
      }
    );

    const repoContentsData = await userRepoContents.json();
    console.log(
      "\n\n########## *******User Github Repos Contents******* ##############\n\n"
    );
    console.log("repoContentsData:", JSON.stringify(repoContentsData, null, 2));
    console.log(
      "\n\n########################################################\n\n"
    );

    res.status(201).json({
      msg: "Repo contents fetched successfully",
      status_response: 200,
      data:{
        repo_content: repoContentsData,
        repo_name: repo_name
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const user_github__repos_content_path = async (req, res) => {
  try {
    // const jsonFilePath = path.join(__dirname, '../../ashu.json');
    // const fileData = await fs.readFile(jsonFilePath, 'utf8');
    // const existingData = JSON.parse(fileData);

    const userData = req.user;
    const access_token = req.access_token;
    const { repo_name, path } = req.body;

    const userRepoContentPath = await fetch(
      `https://api.github.com/repos/${userData.username}/${repo_name}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // ✅ Now defined
          Accept: "application/json",
        },
      }
    );

    const repoContentPathData = await userRepoContentPath.json();
    console.log(
      "\n\n########## *******User Github Repos Contents Path******* ##############\n\n"
    );
    console.log(
      "repoContentPathData:",
      JSON.stringify(repoContentPathData, null, 2)
    );
    console.log(
      "\n\n########################################################\n\n"
    );

    // const updatedData = { ...existingData, repo_content: repoContentPathData };
    // await fs.writeFile(jsonFilePath, JSON.stringify(updatedData, null, 2));

    res.status(200).json({
      msg: "Repo contents fetched successfully",
      status_response: 200,
      data:{
        repo_content: repoContentPathData,
        repo_name: repo_name,
        repo_content_path: path
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const user_github_repos_branch = async (req, res) => {
  try {
    const userData = req.user;
    const access_token = req.access_token;
    const { repo_name } = req.body;
    const userRepoBranch = await fetch(
      `https://api.github.com/repos/${userData.username}/${repo_name}/branches`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`, 
          Accept: "application/json",
        },
      }
    );
    const repoBranchData = await userRepoBranch.json();
    console.log(
      "\n\n########## *******User Github Repos Branch******* ##############\n\n"
    );
    console.log("repoBranchData:", JSON.stringify(repoBranchData, null, 2));
    console.log(
      "\n\n########################################################\n\n"
    );
    res.status(200).json({
      msg: "Repo branch fetched successfully",
      status_response: 200,
      data: repoBranchData
    });
  }
  catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

// const list_users = async (req, res) => {
//     try {
//         const jsonFilePath = path.join(__dirname, '../../ashu.json');
//         const fileData = await fs.readFile(jsonFilePath, 'utf8');
//         const existingData = JSON.parse(fileData);

//         const user_list = await fetch(
//             `https://api.github.com/users`,
//             {
//                 method: 'GET',
//                 headers: {
//                     'X-GitHub-Api-Version': '2026-03-10'
//                 }
//             }
//         );
//         const user_list_data = await user_list.json();
//         console.log("user_list_data:", JSON.stringify(user_list_data, null, 2));
//         res.status(200).json({ user_list: user_list_data });

//     }
//     catch (error) {
//         console.error('❌ Error:', error);
//         res.status(500).json({ error: 'Server error', details: error.message });
//     }
// }

module.exports = {
  github_callback,
  user_data,
  user_github_repos,
  user_github_repos_content,
  user_github__repos_content_path,
  user_github_repos_branch
};
