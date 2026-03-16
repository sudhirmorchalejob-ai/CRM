const axios = require("axios");

const recoverLeads = async () => {

//   const pages = await Page.find();

//   for (const page of pages) {

//     const url = `https://graph.facebook.com/v19.0/${page.pageId}/leadgen_forms`;

//     const forms = await axios.get(url, {
//       params: { access_token: page.pageAccessToken }
//     });

//     for (const form of forms.data.data) {

//       const leads = await axios.get(
//         `https://graph.facebook.com/v19.0/${form.id}/leads`,
//         {
//           params: { access_token: page.pageAccessToken }
//         }
//       );

//       for (const lead of leads.data.data) {

//         const exists = await Lead.findOne({
//           facebookLeadId: lead.id
//         });

//         if (!exists) {

//           console.log("Recovered lead:", lead.id);

//         }

//       }

//     }

//   }

};

module.exports = recoverLeads;