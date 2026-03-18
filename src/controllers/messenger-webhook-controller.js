const prisma = require("../db");
const sendMessengerMessage = require("../utils/message-sender");
const saveMessage = require("../utils/save-message");

// ----------------- VERIFY WEBHOOK -----------------//
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "my_verify_token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Messenger Webhook Verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};

// ----------------- RECEIVE MESSAGES -----------------//
exports.receiveMessages = async (req, res) => {
  const body = req.body;

  console.log("Webhook Event:", JSON.stringify(body, null, 2));

  if (body.object !== "page") {
    return res.sendStatus(404);
  }

  try {
    for (const entry of body.entry) {

      const page = await prisma.facebookPage.findUnique({
        where: { pageId: entry.id }
      });

      if (!page) {
        console.log("❌ Page not found:", entry.id);
        continue;
      }

      const user = await prisma.user.findFirst({
        where: { tenantId: page.tenantId }
      });

      if (!user) {
        console.log("❌ No user found");
        continue;
      }

      for (const event of entry.messaging) {

        const senderId = event.sender?.id;
        const userMessage = event.message?.text;

        if (!senderId || !userMessage) continue;

        console.log("User:", senderId, "| Message:", userMessage);

        let lead = await prisma.lead.findUnique({
          where: { psid: senderId }
        });

        // ---------------- NEW USER ----------------//
        if (!lead) {
          lead = await prisma.lead.create({
            data: {
              name: "Messenger Lead",
              psid: senderId,
              step: "ASK_PHONE",
              tenantId: page.tenantId,
              userId: user.id
            }
          });

          await saveMessage({
            leadId: lead.id,
            message: userMessage,
            direction: "INCOMING"
          });

          const reply = "Hi 👋 Please share your phone number.";

          await sendMessengerMessage(senderId, reply, page.pageAccessToken);

          await saveMessage({
            leadId: lead.id,
            message: reply,
            direction: "OUTGOING"
          });

          continue;
        }

        // SAVE INCOMING
        await saveMessage({
          leadId: lead.id,
          message: userMessage,
          direction: "INCOMING"
        });

        // ---------------- ASK PHONE ----------------//
        if (lead.step === "ASK_PHONE") {
          const phoneRegex = /^[0-9]{10}$/;

          if (!phoneRegex.test(userMessage)) {
            const reply = "❌ Enter valid phone number";

            await sendMessengerMessage(senderId, reply, page.pageAccessToken);
            return res.sendStatus(200);
          }

          await prisma.lead.update({
            where: { id: lead.id },
            data: { phone: userMessage, step: "ASK_EMAIL" }
          });

          const reply = "Now send your email";

          await sendMessengerMessage(senderId, reply, page.pageAccessToken);
          return res.sendStatus(200);
        }

        // ---------------- ASK EMAIL ----------------//
        if (lead.step === "ASK_EMAIL") {
          const emailRegex = /\S+@\S+\.\S+/;

          if (!emailRegex.test(userMessage)) {
            const reply = "❌ Enter valid email";

            await sendMessengerMessage(senderId, reply, page.pageAccessToken);
            return res.sendStatus(200);
          }

          await prisma.lead.update({
            where: { id: lead.id },
            data: { email: userMessage, step: "DONE" }
          });

          const reply = "🎉 Thank you!";

          await sendMessengerMessage(senderId, reply, page.pageAccessToken);
          return res.sendStatus(200);
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.sendStatus(500);
  }
};