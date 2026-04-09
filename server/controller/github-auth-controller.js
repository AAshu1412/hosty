const { User } = require("../models/user-model");
const prisma = require('../utils/db-psql');
const { generateToken } = require("../utils/jwt");

const github_callback = async (req, res) => {
  const { code } = req.body;
  console.log("code: ", code);

  if (!code) {
    return res.status(400).json({
      error: "GitHub authorization code is required.",
      status_response: 400,
    });
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
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
    });

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    if (!tokenResponse.ok || !access_token) {
      return res.status(400).json({
        error: tokenData.error_description || tokenData.error || "Failed to get token",
        status_response: 400,
      });
    }

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

    // 3. PRISMA UPSERT: Find & Update, or Create if missing
    // We use BigInt() because GitHub IDs are massive numbers.
    const githubIdBigInt = BigInt(user.id);
    const resolvedEmail = user.email || null;

    // Check if the user already exists to send the correct 200/201 status code later
    const existingUserCheck = await prisma.user.findUnique({
      where: { githubId: githubIdBigInt }
    });
    const isExistingUser = Boolean(existingUserCheck);

    const userRecord = await prisma.user.upsert({
      where: { githubId: githubIdBigInt },
      
      // UPDATE: If they exist, overwrite their old tokens with the fresh ones
      update: {
        accessToken: tokenData.access_token,
        accessTokenExpiresIn: tokenData.expires_in,
        refreshToken: tokenData.refresh_token || null,
        refreshTokenExpiresIn: tokenData.refresh_token_expires_in || null,
        email: resolvedEmail, 
        name: user.name || user.login,
        avatarUrl: user.avatar_url || null,
        bio: user.bio || null,
        location: user.location || null,
      },
      
      // CREATE: If they are new, map all their GitHub data to the new database columns
      create: {
        githubId: githubIdBigInt,
        githubUsername: user.login,
        email: resolvedEmail,
        
        // Tokens
        accessToken: tokenData.access_token,
        accessTokenExpiresIn: tokenData.expires_in,
        refreshToken: tokenData.refresh_token || null,
        refreshTokenExpiresIn: tokenData.refresh_token_expires_in || null,
        tokenType: tokenData.token_type || 'bearer',
        
        // App State
        hasCompletedOnboarding: Boolean(resolvedEmail),
        
        // Flattened GitHub Profile Info
        nodeId: user.node_id,
        accountType: user.type,
        name: user.name || user.login,
        userViewType: user.user_view_type || "public",
        bio: user.bio || null,
        location: user.location || null,
        notificationEmail: user.notification_email || null,
        avatarUrl: user.avatar_url || null,
        htmlUrl: user.html_url,
      }
    });

    console.log("\n\n########## *******User Saved to Postgres******* ##############\n\n");

    // 4. GENERATE JWT 
    const created_token = generateToken(userRecord);

    console.log("#######################\ncreated_token:", created_token);
    console.log("\n\n########################################################\n\n");

    // 5. SEND RESPONSE
    res.status(isExistingUser ? 200 : 201).json({
      msg: isExistingUser ? "user authenticated successfully" : "user created successfully",
      status_response: isExistingUser ? 200 : 201,
      token: created_token,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message, status_response: 500 });
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
      data: {
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
      data: {
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
