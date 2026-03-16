const { fetchMetaLead } = require("../services/meta-lead-service");
const { createLeadService } = require("../services/lead-service");
const db = require("../db");

const metaWebhookController = async (req, res) => {

  try {

    console.log("Incoming webhook:", req.body);

    // Validate webhook payload
    if (!req.body.entry || !req.body.entry[0] || !req.body.entry[0].changes) {
      console.log("Invalid webhook payload");
      return res.sendStatus(200);
    }

    const entry = req.body.entry[0];
    const change = entry.changes[0];
    const leadId = change.value.leadgen_id;
    const pageId = change.value.page_id;

    console.log("Lead ID:", leadId);
    console.log("Page ID:", pageId);

    // find tenant page
    const page = await db.facebookPage.findFirst({
      where: { pageId: pageId }
    });

    console.log("Page Record from DB:", page);

    if (!page) {
      console.log("Page not registered in CRM");
      return res.sendStatus(200);
    }

    const tenantId = page.tenantId;

    // 🔴 DEBUG LOGS
    console.log("Tenant ID:", tenantId);
    console.log("Page Access Token:", page.pageAccessToken);

    // 🔴 CALL META API WITH SAFE ERROR HANDLING
    let metaLead;

    try {
      metaLead = await fetchMetaLead(leadId, page.pageAccessToken);
      console.log("Meta Lead Response:", metaLead);
    } catch (metaError) {
      console.error("Meta API Error:", metaError.response?.data || metaError.message);
      return res.sendStatus(200);
    }

    const fields = metaLead.field_data;

    let name = "";
    let email = "";
    let phone = "";

    fields.forEach(field => {
      if (field.name === "full_name") name = field.values[0];
      if (field.name === "email") email = field.values[0];
      if (field.name === "phone_number") phone = field.values[0];
    });

    console.log("Parsed Lead:", { name, email, phone });

    // find user to assign lead
    const user = await db.user.findFirst({
      where: { tenantId: tenantId }
    });

    console.log("Assigned User:", user);

    if (!user) {
      console.log("No user found for tenant");
      return res.sendStatus(200);
    }

    // create lead
    const lead = await createLeadService({
      name,
      email,
      phone,
      facebookLeadId: leadId,
      tenantId,
      userId: user.id,
      sourceId: 1
    });

    console.log("Lead saved:", lead.id);

    return res.status(200).json({
      success: true,
      data: lead
    });

  } catch (error) {

    console.error("Webhook error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

module.exports = {
  metaWebhookController
};