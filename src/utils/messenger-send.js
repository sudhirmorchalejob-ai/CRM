const axios = require("axios");

const sendMessengerMessage = async (psid, text, pageAccessToken) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/me/messages`,
      {
        recipient: { id: psid },
        message: { text: text }
      },
      {
        params: {
          access_token: pageAccessToken
        }
      }
    );

    console.log("✅ MESSAGE SENT:", response.data);

  } catch (error) {
    console.error("❌ Messenger send error:");
    console.error(error.response?.data || error.message);
  }
};

module.exports = sendMessengerMessage;