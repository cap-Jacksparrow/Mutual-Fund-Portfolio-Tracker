const jwt = require("jsonwebtoken");
const {logger} = require("../config/logger");

const auth = (req,res,next)=>{
    const authHeader= req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message:"Unauthorised: No token provided"
        });
    }
     const token = authHeader.split(" ")[1];
     try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user =decoded
        next();
     }catch(error){
        logger.error("Auth middleware error: %s",error.message);
        return res.status(403).json({message:"Forbidden Invaid token"});
     }
};

module.exports = auth;