const axios = require("axios");

// this are services that are used to get pages , lead , token

// to get access token for first login
const getAccessToken = async (code) => {

  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code,
      },
    }
  );

  return response.data.access_token;

};
// for to get user of that account
const getFacebookUser = async (accessToken) => {

  const response = await axios.get(
    "https://graph.facebook.com/me",
    {
      params: {
        access_token: accessToken
      }
    }
  );

  return response.data;
};

// to extend user token from short token this hook used for after first login 
const getLongLivedUserToken = async (shortToken) => {

  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        fb_exchange_token: shortToken
      }
    }
  );

  return response.data;
};


// to get pages that align with that account
const getUserPages = async (accessToken) => {

  const response = await axios.get(
    "https://graph.facebook.com/v19.0/me/accounts",
    {
      params: {
        access_token: accessToken,
      },
    }
  );

  return response.data.data;

};


// to get lead data
const getLeadData = async (leadId, pageToken) => {

  const response = await axios.get(
    `https://graph.facebook.com/v19.0/${leadId}`,
    {
      params: {
        access_token: pageToken,
      },
    }
  );

  return response.data;

};

// to identify lead comes from which platform 
const getAdPlatform = async (adId, token) => {

  const url = `https://graph.facebook.com/v20.0/${adId}`;

  const response = await axios.get(url, {
    params: {
      fields: "publisher_platform",
      access_token: token
    }
  });

  return response.data.publisher_platform?.[0] || "facebook";

};


const getTokenInfo = async (token) => {

  const response = await axios.get(
    "https://graph.facebook.com/debug_token",
    {
      params: {
        input_token: token,
        access_token: `${process.env.APP_ID}|${process.env.APP_SECRET}`
      }
    }
  );

  return response.data.data;
};

module.exports = {
  getAccessToken,
  getUserPages,
  getLeadData,
  getLongLivedUserToken,
  getFacebookUser,
  getAdPlatform,
  getTokenInfo
};