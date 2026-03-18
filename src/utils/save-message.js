const prisma = require("../db");

const saveMessage = async ({ leadId, message, direction, type = "text" }) => {
  try {
    await prisma.message.create({
      data: {
        leadId,
        message,
        direction,
        type
      }
    });
  } catch (error) {
    console.error("❌ Message save error:", error);
  }
};
 
module.exports = saveMessage;