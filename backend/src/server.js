require("dotenv").config();
const http = require('http');
const mongoose =require('mongoose');
const app = require('./app');
const { logger } = require('./config/logger');
const connectDB = require('./config/db')
const { updateAllFundsAndNavs } = require("./helpers/fundAndNavFetch");
const Fund = require("./models/Fund");

//---Server---
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);



//---Server Start ---
async function startServer(){
await connectDB();

server.listen(PORT,()=>{
    logger.info(`Server running on port ${PORT}`);
});
 
 // Check if Fund collection is empty
  const fundCount = await Fund.countDocuments();
  if (fundCount === 0) {
    logger.info("Seeding initial fund + NAV data...");
    await updateAllFundsAndNavs();
    logger.info("Initial fund + NAV data loaded successfully.");
  } else {
    logger.info("Fund collection already exists, skipping initial seeding.");
  }

}

//---Error Handling---
process.on('uncaughtException',(err)=>{
    logger.error('uncaught Exception:',err);
    shutdown(1);
});
process.on('unhandledRejection',(reason,promise)=>{
    logger.error(`Unhandled Rejection at: ${promise}`);
    logger.error(`Reason: ${reason instanceof Error ? reason.stack : reason}`);
    shutdown(1);
})



function shutdown(code){
    logger.warn('shuttingdown server...');
    server.close(()=>{
        logger.info('HTTP server closed.');
        mongoose.connection.close(false,()=>{
            logger.info('Mongodb connection closed');
            process.exit(code);
        });
    });
    //Force shutdown if not closed in time 
    setTimeout(()=>{
        logger.error('Forcefully shutting down...');
        process.exit(code);
    },5000);
}

process.on('SIGINT',()=>shutdown(0));
process.on('SIGTERM',()=>shutdown(0));

//---RUN---
startServer();