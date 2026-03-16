const whatsappService = require("../services/whatsapp-service");

async function whatsappWebhook(req, res) {

  try {

    await whatsappService.processMessage(req.body);

    res.status(200).send("EVENT_RECEIVED");

  } catch (error) {

    console.error(error);
    res.status(500).send("ERROR");

  }

}

module.exports = { whatsappWebhook };