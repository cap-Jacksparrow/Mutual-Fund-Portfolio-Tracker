const {logger} = require("../config/logger");

const validate = (schema, property = "body")=>{
    return(req,res,next)=>{
        const {error} =
        schema.validate(req[property],{
            abortEarly:false
        });

        if(error){
            logger.warn("Validation failed: %s",
                error.details.map(d=>d.message).join(","));
                return res.status(400).json({
                    message:"Validation error",
                    details: error.details.map(d=>d.message)
                });
        }
        next();
    };
};

module.exports = validate;