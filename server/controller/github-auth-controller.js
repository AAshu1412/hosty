
// const home=async(req,res)=>{
//     try{
//         res.status(200).send("Hello Ashu 1")
//     }
//     catch(error){
// res.status(400).send({msg:"home not found"});
//     }
// }

const github_callback=async (req, res) => {
    const { code } = req.body;
  
    // Exchange code for token
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
  
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
    });
    
    const user = await userResponse.json();
    console.log("user: "+JSON.stringify(user));
    console.log("tokenData: "+JSON.stringify(tokenData));
    res.json({ access_token, user });
  };

module.exports={github_callback};