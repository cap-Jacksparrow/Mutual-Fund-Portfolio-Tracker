const {logger} = require("../config/logger");

 //404 handler
 function notFoundHandler(req,res,next){
    res.status(404).json({
        success : false,
        message : `Route ${req.originalUrl} not found`
    });   
 }

 //Global Error Handler
 function errorHandler(err,req,res,next){
    logger.error(err.stack || err.message);

    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || `internal Server Error`,
        ...arguments(process.env.NODE_ENV === 'development' && { stack: err.stack})
    });
 }

 module.exports={notFoundHandler , errorHandler};