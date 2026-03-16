const prisma = require("../config/prisma-client");

class WhatsAppService {

  async processMessage(payload) {

    console.log("Incoming payload:", JSON.stringify(payload, null, 2));

    const value = payload?.entry?.[0]?.changes?.[0]?.value;

    if (!value) {
      console.log("No value in webhook");
      return;
    }

    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) {
      console.log("No message found in payload");
      return;
    }

    const phone = message?.from;
    const text = message?.text?.body || "";
    const messageId = message?.id;
    const timestamp = message?.timestamp;
    const name = contact?.profile?.name || "WhatsApp Lead";

    console.log("Phone:", phone);
    console.log("Message:", text);
    console.log("Message ID:", messageId);

    if (!phone) {
      console.log("Phone missing, skipping lead creation");
      return;
    }

    // Find lead source
    const source = await prisma.leadSource.findFirst({
      where: { name: "WHATSAPP" }
    });

    if (!source) {
      console.log("Lead source WHATSAPP not found");
      return;
    }

    // Check if lead already exists
    let lead = await prisma.lead.findFirst({
      where: {
        phone: phone,
        tenantId: 1
      }
    });

    if (!lead) {

      lead = await prisma.lead.create({
        data: {
          name: name,
          phone: phone,
          tenantId: 1,
          userId: 1,
          sourceId: source.id
        }
      });

      console.log("New lead created:", lead.id);

    } else {

      console.log("Lead already exists:", lead.id);

    }

    // Optional: store message history
    await prisma.message.create({
      data: {
        leadId: lead.id,
        message: text,
        messageId: messageId,
        timestamp: Number(timestamp),
        direction: "INCOMING"
      }
    });

    console.log("Message stored successfully");

  }

}

module.exports = new WhatsAppService();