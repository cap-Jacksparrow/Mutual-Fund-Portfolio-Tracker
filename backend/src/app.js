
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const routes =require('./routes');
const { notFoundHandler, errorHandler }  = require('./middlewares/errorHandler');
const { updateNavJob } = require("./jobs/navUpdateJob"); 
const { apiLimiter } = require("./middlewares/rateLimiter")

const app=express();



// Start cron job
updateNavJob.start();

//---Middleware---
app.use(helmet());
app.use(cors({origin:process.env.CORS_ORIGIN || '*'}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'));

//---routes---
app.use('/api',apiLimiter,routes);

//---Health check---
app.get('/health',(req,res)=>{
    res.json({status:'ok',uptime:process.uptime()});
});

//---Error Handling---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports=app;