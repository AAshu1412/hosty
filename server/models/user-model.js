const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    access_token: {
        type: String,
        require: true,
    },
    access_token_expires_in: {
        type: Number,
        require: true,
    },
    refresh_token: {
        type: String,
        require: false,
    },
    refresh_token_expires_in: {
        type: Number,
        require: false,
    },
    token_type: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
    },
    id: {
        type: Number,
        require: true,
    },
    email: {
        type: String,
        require: false,
    },
    user: {
        username: {
            type: String,
            require: true,
        },
        id: {
            type: Number,
            require: true,
        },
        node_id: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: false,
        },
        type: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        user_view_type: {
            type: String,
            require: true,
        },
        bio: {
            type: String,
            require: false,
        },
        location: {
            type: String,
            require: false,
        }
        ,
        notification_email: {
            type: String,
            require: false,
        },
        avatar_url: {
            type: String,
            require: false,
        },
        html_url: {
            type: String,
            require: true,
        },
    },
    repos:{
        type: Array,
        require: false,
    }
});

// userSchema.pre("save", async function (next) {
//     console.log(this);
//     const user = this;

//     if (!user.isModified("password")) {
//         next();
//     }

//     try {

//         const saltRound = await bcrypt.genSalt(10);
//         const hash_password = await bcrypt.hash(user.password, saltRound);
//         user.password = hash_password;
//     }
//     catch (error) {
//         next(error);
//     }
// });


userSchema.methods.generateToken = function () {
    try {
        return jwt.sign(
            { userID: this._id.toString(), email: this.email, isAdmin: this.isAdmin },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30d" })
    } catch (error) {
        console.error(error);
    }
};



const User = new mongoose.model("User", userSchema);


module.exports = User;