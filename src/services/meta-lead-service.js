const axios = require("axios");

const fetchMetaLead = async (leadId, pageAccessToken) => {

  const url = `https://graph.facebook.com/v18.0/${leadId}?access_token=${pageAccessToken}`;

  const response = await axios.get(url);

  return response.data;
};

module.exports = {
  fetchMetaLead
};