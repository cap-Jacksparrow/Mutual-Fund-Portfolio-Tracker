const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logger } = require("../config/logger");


const generateToken = (userId) =>{
    return jwt.sign({ id: userId}, process.env.JWT_SECRET, {expiresIn:"7d"});
};

exports.signup = async (req,res)=>{
    try{
        const {name, email,password } =req.body;
         const existingUser = await User.findOne({email});
         if(existingUser){
            return res.status(400).json({success:false,message: "Email already exist"});
         }

         const passwordHash = await bcrypt.hash(password,10);
         const user = await User.create({name ,email, passwordHash});
       
         const token = generateToken(user._id);

         res.status(201).json({
            sucess:true,
            message: "User registered succesfully",
            token,
            user:{id:user._id,name: user.name, email:user.email},
         });
    }
    catch(err){
        logger.error("Signup error : %s",err.message);
        res.status(500).json({
            success:false,message:"Server error"
        });
        }
};

exports.login =  async (req,res)=>{
    try{
        const {email,password } = req.body;

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({success:false,message:"Invalid EmailId"});

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch)
            return res.status(400).json({success:false,message:"Invalid password"});

        const token = generateToken(user._id);

        res.json({
            success:true,
            message:"Login successful",
            token,
            user:{id: user._id, name: user.name, email: user.email},
        });
    }catch(err){
        logger.error("Login error : %s",err.message);
        res.status(500).json({
            success:false,message:"Server error"
        });
    }
}