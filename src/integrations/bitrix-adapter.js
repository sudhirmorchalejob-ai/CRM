const axios = require("axios");

class BitrixAdapter {

  constructor(webhookUrl) {
    this.client = axios.create({
      baseURL: webhookUrl,
      timeout: 10000
    });
  }

  async pushLead(lead) {

    const response = await this.client.post(
      "/crm.lead.add.json",
      {
        fields: {
          TITLE: lead.name || "Facebook Lead",
          NAME: lead.name,
          PHONE: lead.phone
            ? [{ VALUE: lead.phone, VALUE_TYPE: "WORK" }]
            : undefined,
          EMAIL: lead.email
            ? [{ VALUE: lead.email, VALUE_TYPE: "WORK" }]
            : undefined,
          COMMENTS: lead.message,
          SOURCE_DESCRIPTION: "Facebook"
        }
      }
    );

    return response.data.result;
  }
}

module.exports = BitrixAdapter;