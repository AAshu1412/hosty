const {User} = require("../models/user-model");
const bcrypt = require("bcryptjs");
const prisma = require('../utils/db-psql');

// const register = async (req, res) => {
//     try {
//         console.log(req.body)
//         const { username, email, phone, password } = req.body;


//         const userExist = await User.findOne({ email });
//         if (userExist) {
//             return res.status(500).json({ msg: "email already exists" });

//         }

//         const userCreated = await User.create({ username, email, phone, password });

//         res.status(201).json({ msg: userCreated, token: await userCreated.generateToken(), userId: userCreated._id.toString() });
//     }
//     catch (error) {

//         res.status(500).json("register not found");


//     }
// }

// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const userExist = await User.findOne({ email });
//         console.log(`This is the LOGIN in auth-controllers == ${userExist}`);
//         if (!userExist) {
//             return res.status(500).json({ msg: "invalid credential" });

//         }

//         const user = await bcrypt.compare(password, userExist.password);

//         if (user) {
//             res.status(200).json({ msg: "Login successfull", token: await userExist.generateToken(), userId: userExist._id.toString() });
//         }
//         else {
//             return res.status(401).json({ msg: "invalid email or password" });
//         }

//     }
//     catch (error) {
//         res.status(500).send({ msg: "login error" });
//     }
// }

const add_email = async (req, res) => {
  try {
    const id = req.userID; 
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ msg: "Email is required", status_response: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { 
        id: parseInt(id, 10) // Prisma expects an Integer for the ID!
      },
      data: {
        email: normalizedEmail,
        hasCompletedOnboarding: true,
        // Notice we don't have "user.email" here anymore because we flattened the database!
      }
    });

    res.status(200).json({
      msg: "email added successfully",
      status_response: 200,
      data: {
        email: updatedUser.email,
        has_completed_onboarding: updatedUser.hasCompletedOnboarding, // Mapped to the camelCase Prisma field
      },
    });

  } catch (error) {
    // Prisma throws a specific error code (P2025) if the row to update does not exist
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: "User not found",
        status_response: 404,
      });
    }

    console.error("❌ Error adding email:", error);
    res.status(500).json({ error: error.message, status_response: 500 });
  }
};

const user = async (req, res) => {
    try {
        const userData = req.user;
        console.log(userData);

        return res.status(200).json({status_response: 200, data: userData });
    }
    catch (error) {
        res.status(500).send({ status_response: 500, error: error.message });
    }
}

module.exports = { add_email, user };
