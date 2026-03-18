const express = require("express");
const router = express.Router();
const sendMessengerMessage = require("../utils/messenger-send");
const prisma = require("../db");
const saveMessage = require("../utils/save-message");

// ----------------- WEBHOOK VERIFICATION -----------------//
router.get("/messenger/webhook", (req, res) => {
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
});
// ----------------- WEBHOOK VERIFICATION -----------------//


// ----------------- RECEIVE MESSAGES -----------------//
router.post("/messenger/webhook", async (req, res) => {
  const body = req.body;

  if (process.env.NODE_ENV !== "production") {
    console.log("Webhook Event:", JSON.stringify(body, null, 2));
  }

  if (body.object !== "page") {
    return res.sendStatus(404);
  }

  try {
    for (const entry of body.entry) {

      // 🔥 GET PAGE
      const page = await prisma.facebookPage.findUnique({
        where: { pageId: entry.id }
      });

      if (!page) {
        console.log("❌ Page not found:", entry.id);
        continue;
      }

      // 🔥 GET USER
      const user = await prisma.user.findFirst({
        where: { tenantId: page.tenantId }
      });

      if (!user) {
        console.log("❌ No user found for tenant:", page.tenantId);
        continue;
      }

      for (const event of entry.messaging) {

        const senderId = event.sender?.id;
        const userMessage = event.message?.text;

        if (!senderId || !userMessage) continue;

        console.log("User:", senderId, "| Message:", userMessage);

        // 🔍 FIND LEAD
        let lead = await prisma.lead.findUnique({
          where: { psid: senderId }
        });

        // ----------------- NEW USER -----------------//
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

          // SAVE INCOMING
          await saveMessage({
            leadId: lead.id,
            message: userMessage,
            direction: "INCOMING"
          });

          const reply = "Hi 👋 Thanks for contacting us!\nPlease share your phone number.";

          await sendMessengerMessage(senderId, reply, page.pageAccessToken);

          // SAVE OUTGOING
          await saveMessage({
            leadId: lead.id,
            message: reply,
            direction: "OUTGOING"
          });

          continue;
        }

        // SAVE INCOMING (existing user)
        await saveMessage({
          leadId: lead.id,
          message: userMessage,
          direction: "INCOMING"
        });


        // ----------------- STEP: ASK_PHONE -----------------//
        if (lead.step === "ASK_PHONE") {

          const phoneRegex = /^[0-9]{10}$/;

          if (!phoneRegex.test(userMessage)) {
            const reply = "❌ Please enter a valid 10-digit phone number.";

            await sendMessengerMessage(senderId, reply, page.pageAccessToken);

            await saveMessage({
              leadId: lead.id,
              message: reply,
              direction: "OUTGOING"
            });

            continue;
          }

          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              phone: userMessage,
              step: "ASK_EMAIL"
            }
          });

          const reply = "Great 👍 Now please share your email address.";

          await sendMessengerMessage(senderId, reply, page.pageAccessToken);

          await saveMessage({
            leadId: lead.id,
            message: reply,
            direction: "OUTGOING"
          });

          continue;
        }


        // ----------------- STEP: ASK_EMAIL -----------------//
        if (lead.step === "ASK_EMAIL") {

          const emailRegex = /\S+@\S+\.\S+/;

          if (!emailRegex.test(userMessage)) {
            const reply = "❌ Please enter a valid email address.";

            await sendMessengerMessage(senderId, reply, page.pageAccessToken);

            await saveMessage({
              leadId: lead.id,
              message: reply,
              direction: "OUTGOING"
            });

            continue;
          }

          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              email: userMessage,
              step: "DONE"
            }
          });

          const reply = "🎉 Thank you! Our team will contact you shortly.";

          await sendMessengerMessage(senderId, reply, page.pageAccessToken);

          await saveMessage({
            leadId: lead.id,
            message: reply,
            direction: "OUTGOING"
          });

          console.log("✅ Lead completed:", {
            psid: senderId,
            phone: userMessage,
            email: userMessage
          });

          continue;
        }


        // ----------------- STEP: DONE -----------------//
        if (lead.step === "DONE") {

          const reply = "We already have your details 👍 Our team will reach out soon.";

          await sendMessengerMessage(senderId, reply, page.pageAccessToken);

          await saveMessage({
            leadId: lead.id,
            message: reply,
            direction: "OUTGOING"
          });
        }

      }
    }

    return res.status(200).send("EVENT_RECEIVED");

  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.sendStatus(500);
  }
});
// ----------------- RECEIVE MESSAGES -----------------//

module.exports = router;



// fake data add 
/*
const express = require("express");
const router = express.Router();
const sendMessengerMessage = require("../utils/messenger-send");
const prisma = require("../db");

// 🔥 TEST MODE (true = bypass Messenger, false = real API)
const isTestMode = true;

// 🔥 Fake send function
const fakeSend = async (psid, text) => {
  console.log("📩 FAKE SEND →", { psid, text });
};

// ----------------- WEBHOOK VERIFICATION -----------------//
router.get("/messenger/webhook", (req, res) => {
  const VERIFY_TOKEN = "my_verify_token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Messenger Webhook Verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});
// ----------------- WEBHOOK VERIFICATION -----------------//


// ----------------- RECEIVE MESSAGES -----------------//
router.post("/messenger/webhook", async (req, res) => {
  const body = req.body;
  console.log("FULL WEBHOOK BODY:", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {

        const senderId = event.sender.id;
        console.log("Sender PSID:", senderId);

        if (event.message && event.message.text) {

          const userMessage = event.message.text;
          console.log("User message:", userMessage);

          const phoneRegex = /^[0-9]{10}$/;
          const emailRegex = /\S+@\S+\.\S+/;

          // ----------------- PHONE CASE -----------------//
          if (phoneRegex.test(userMessage)) {

            if (isTestMode) {
              await fakeSend(senderId, "Thanks! Please share your email address.");
            } else {
              await sendMessengerMessage(
                senderId,
                "Thanks! Please share your email address."
              );
            }

          // ----------------- EMAIL CASE -----------------//
          } else if (emailRegex.test(userMessage)) {

            if (isTestMode) {
              await fakeSend(senderId, "Thank you! Our team will contact you soon.");
            } else {
              await sendMessengerMessage(
                senderId,
                "Thank you! Our team will contact you soon."
              );
            }

            // ✅ SAVE LEAD IN DB
            await prisma.lead.create({
              data: {
                name: "Messenger Lead",
                email: userMessage,
                phone: null,
                tenantId: 1,
                userId: 1
              }
            });

            console.log("Lead saved in DB ✅");

          // ----------------- DEFAULT CASE -----------------//
          } else {

            if (isTestMode) {
              await fakeSend(senderId, "Thanks for contacting us! Please share your phone number.");
            } else {
              await sendMessengerMessage(
                senderId,
                "Thanks for contacting us! Please share your phone number."
              );
            }

          }

        }

      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.sendStatus(404);
});
// ----------------- RECEIVE MESSAGES -----------------//

module.exports = router;

*/