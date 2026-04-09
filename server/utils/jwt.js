const jwt = require("jsonwebtoken");

const generateToken = (userRecord) => {
    return jwt.sign(
        { 
            username: userRecord.githubUsername, 
            userID: userRecord.id, // The Postgres primary key (Int)
            userGithubID: userRecord.githubId.toString(), // Convert BigInt to string!
            email: userRecord.email || null, 
            isAdmin: userRecord.isAdmin, 
            userAccessTokens: userRecord.accessToken, 
            userAccessTokensExpiresIn: userRecord.accessTokenExpiresIn.toString() 
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
    );
};

module.exports = { generateToken };