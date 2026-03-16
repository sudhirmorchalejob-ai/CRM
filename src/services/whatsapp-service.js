const prisma = require("../config/prisma-client");

class WhatsAppService {

  async processMessage(payload) {

    console.log("Incoming payload:", payload);

    const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    console.log("Extracted message:", message);

    if (!message) return;

    const phone = message.from;
    const text = message.text?.body;

    console.log("Phone:", phone);
    console.log("Message:", text);

    const source = await prisma.leadSource.findFirst({
      where: { name: "WHATSAPP" }
    });

    await prisma.lead.create({
      data: {
        name: "WhatsApp Lead",
        phone: phone,
        tenantId: 1,
        userId: 1,
        sourceId: source.id
      }
    });

    console.log("Lead created successfully");

  }

}

module.exports = new WhatsAppService();