const express = require('express');
const whatsapp_webhook_route = require("./routes/whatsapp-webhook.js")
const { ServerConfig , Logger } = require('./config/index.js');
const apiRoutes = require('./routes/index.js');
const GlobalErrorhandler = require("./utils/error-handler.js");
const fb_page_route = require("./routes/fb-pages.js")
const fb_webhook_route = require("./routes/fb-webhook.js")
const messenger_webhook_route = require("./routes/messenger-webhook.js")
require("dotenv").config()
const app = express();


// ----------------- MIDDELWARES -----------------//
app.use(express.json())
app.use(express.urlencoded({extended  : true})) 
// ----------------- MIDDELWARES -----------------//



// ----------------- ALL ROUTES -----------------//

// this are facebook routes (as per there standerd routing)
app.use(fb_page_route)
app.use(fb_webhook_route)
app.use(whatsapp_webhook_route)
app.use(messenger_webhook_route)
// this is our main api routes --> our api will look /api/v1
app.use("/api" , apiRoutes)

// ----------------- ALL ROUTES -----------------// 


// app.get("/" , (req, res)=>{
//     res.send("Welcome to Node Starter Template")
// }) 

// ----------------- FACEBOOK_INTEGRATION CALLBACK
app.get("/", (req, res) => {

  const facebookLoginUrl =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${process.env.APP_ID}` +
    `&redirect_uri=${process.env.REDIRECT_URI}` +
    `&scope=pages_show_list,pages_read_engagement,leads_retrieval,pages_messaging`;

  res.send(`
    <h2>Facebook CRM Test</h2>
    <a href="${facebookLoginUrl}">
      <button>Connect Facebook</button>
    </a>
  `);

}); 
// ----------------- FACEBOOK_INTEGRATION CALLBACK


// ----------------- SERVER RUNNING -----------------//
app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    // Logger.info("Successfully started " , {}) you can enable to log the messages
});

// ----------------- SERVER RUNNING -----------------//


// ----------------- GLOBAL ERROR HANDLER -----------------//
app.use(GlobalErrorhandler)
// ----------------- GLOBAL ERROR HANDLER -----------------//

