const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ msg: "Unauthorization HTTP, Token not provided" });
    }


    const jwtToken = token.replace("Bearer", "").trim();
    console.log("Token form auth middleware : " + jwtToken);

    try {

        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
        console.log("Verifying the jwtToken : " + JSON.stringify(isVerified));

        const userData = await User.findOne({ email: isVerified.email }).select({ password: 0 });
        console.log("Data after verifying (auth-middleware) : " + userData);

        req.user = userData;
        req.token = token;
        req.userID = userData._id;

        next();
    } catch (error) {
        return res.status(401).json({ msg: "Unauthorization Invalid Token" });

    }


};

module.exports = authMiddleware;