const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");

const User = require("../models/User");

dotenv.config();

const signinController = async(req, res) => {
    if(req.body.googleAccessToken){
        // gogole-auth
        const {googleAccessToken} = req.body;

        axios
            .get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                "Authorization": `Bearer ${googleAccessToken}`
            }
        })
            .then(async response => {
                const name = response.data.given_name + " " + response.data.family_name;
                const email = response.data.email;
                const picture = response.data.picture;

                const existingUser = await User.findOne({email})

                if (!existingUser) 
                    return res.status(404).json({message: "User don't exist!"})

                const token = jwt.sign({
                    email: existingUser.email,
                    id: existingUser._id
                }, process.env.SECRET_KEY, {expiresIn: "48h"})
        
                res
                    .status(200)
                    .json({existingUser, token})
                    
            })
            .catch(err => {
                res
                    .status(400)
                    .json({message: "Invalid access token!"})
            })
    }else{
        // normal-auth
        const {email, password} = req.body;
        if (email === "" || password === "") 
            return res.status(400).json({message: "Invalid field!"});
        try {
            const existingUser = await User.findOne({email})
    
            if (!existingUser) 
                return res.status(404).json({message: "User don't exist!"})
    
            const isPasswordOk = await bcrypt.compare(password, existingUser.password);
    
            if (!isPasswordOk) 
                return res.status(400).json({message: "Invalid credintials!"})
    
            const token = jwt.sign({
                email: existingUser.email,
                id: existingUser._id
            }, process.env.SECRET_KEY, {expiresIn: "48h"})
    
            res
                .status(200)
                .json({existingUser, token})
        } catch (err) {
            res
                .status(500)
                .json({message: "Something went wrong!"})
        }
    }
  
}

const signupController = async(req, res) => {
    if (req.body.googleAccessToken) {
        const {googleAccessToken} = req.body;

        axios
            .get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                "Authorization": `Bearer ${googleAccessToken}`
            }
        })
            .then(async response => {
                console.log(response.data);
                const name = response.data.given_name + " " + response.data.family_name;
                const email = response.data.email;
                const picture = response.data.picture;

                const existingUser = await User.findOne({email})

                if (existingUser) 
                    return res.status(400).json({message: "User already exist!"})

                const result = await User.create({verified:"true",email, name, profilePicture: picture})

                const token = jwt.sign({
                    email: result.email,
                    id: result._id
                }, process.env.SECRET_KEY, {expiresIn: "48h"})

                res
                    .status(200)
                    .json({result,token})
            })
            .catch(err => {
                res
                    .status(400)
                    .json({message: "Invalid access token!"})
            })

    } else {
        // normal form signup
        const {email, password, confirmPassword, name} = req.body;

        console.log(email, password, name, confirmPassword);

        try {
            if (email === "" || password === "" || name === "" && password === confirmPassword && password.length >= 4) 
                return res.status(400).json({message: "Invalid field!"})

            const existingUser = await User.findOne({email})

            if (existingUser) 
                return res.status(400).json({message: "User already exist!"})
            

            let hashedPassword;
            if(password === confirmPassword) {
                hashedPassword = await bcrypt.hash(password, 12);
            }else{
                return res.status(400).json({message : "please make sure the confirm password matches the password"});
            }

            const result = await User.create({email, password: hashedPassword, name})


            res
                .status(200)
                .json({result})
                // .json({result, token})
        } catch (err) {
            res
                .status(500)
                .json({message: "Something went wrong!"})
        }

    }
}


const getUser = async (req, res, next) =>{
    try {
        const user = await User.findById(req.query.userId);
        if (!user) {
          const error = new Error("User not found.");
          error.statusCode = 404;
          console.log(error);
        }
        res.status(200).json({ user });
      } catch (err) {
          console.log(err);
      }
}
const getUserNo = async (req, res, next) =>{
    try {
        const totalUsers = await User.countDocuments({});
        // console.log('Total number of users:', totalUsers);
        res.status(200).json({ TotalUsers : totalUsers });
      } catch (error) {
        console.error('Error counting users:', error);
        throw error; // You can handle the error as per your application's needs
      }
}

module.exports = {
    signinController,
    signupController,
    getUserNo,
    getUser
}