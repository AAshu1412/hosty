const fs = require('fs').promises;
const path = require('path');

const github_callback = async (req, res) => {
  const { code } = req.body;
  
  try {
    // 1. Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get token' });
    }

    // 2. Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
    });
    const user = await userResponse.json();

    // 3. Get user repos
    const userRepoResponse = await fetch(`https://api.github.com/users/${user.login}/repos`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
    });
    const repo = await userRepoResponse.json();
    
    console.log("user:", JSON.stringify(user, null, 2));
    console.log("repos count:", repo.length);
    
    // 4. UPDATE JSON FILE - OVERWRITE with NEW data
    const jsonFilePath = path.join(__dirname, '../../ashu.json'); // Root dir
    
    let existingData = {};
    
    try {
      // Read existing file (if exists)
      const fileData = await fs.readFile(jsonFilePath, 'utf8');
      existingData = JSON.parse(fileData);
    } catch (error) {
      // File doesn't exist - create fresh
      console.log("Creating new ashu.json");
    }
    
    // 5. REPLACE old data with NEW data
    const updatedData = {
      access_token: access_token,
      tokenData: tokenData,
      user: user,
      repo: repo  // NEW! All repos
    };
    
    // 6. Write to file (atomic write)
    await fs.writeFile(jsonFilePath, JSON.stringify(updatedData, null, 2));
    console.log("✅ Saved to ashu.json | Repos:", repo.length);
    console.log("--------------------------------------------------------\n\n")
    res.status(200).json({ access_token, user, repo_count: repo.length });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const github_user_repos = async (req, res) => {
    try {
      const jsonFilePath = path.join(__dirname, '../../ashu.json');
      
      // 1. Read ashu.json
      const fileData = await fs.readFile(jsonFilePath, 'utf8');
      const existingData = JSON.parse(fileData);  // ✅ Fixed: 'const' declaration
      
      // 2. Get access_token from file
      const access_token = existingData.access_token;  // ✅ Fixed: undefined → from file
      
      // 3. Fetch repo contents (repo[2] = 3rd repo)
      const userRepoContents = await fetch(
        `https://api.github.com/repos/${existingData.user.login}/${existingData.repo[2].name}/contents`, 
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,  // ✅ Now defined
            'Accept': 'application/json',
          },
        }
      );
      
      const repoContentsData = await userRepoContents.json();
      console.log("repoContentsData:", JSON.stringify(repoContentsData, null, 2));
      
      // 4. Update data + save
      const updatedData = { ...existingData, repo_content: repoContentsData };  // ✅ Spread + add
      
      await fs.writeFile(jsonFilePath, JSON.stringify(updatedData, null, 2));
      
      console.log("✅ Added repo_content to ashu.json");
      console.log("--------------------------------------------------------\n\n");
      
      res.status(200).json({ 
        repo_content: repoContentsData, 
        repo_name: existingData.repo[2].name 
      });  // ✅ Fixed: send actual data
    
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  };
  

module.exports = { github_callback,github_user_repos };
