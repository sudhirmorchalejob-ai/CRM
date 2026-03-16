const LeadRepo = require("../repositories/lead-repo");
const TenantRepo = require("../repositories/tenant-repo");
const BitrixAdapter = require("../integrations/bitrix-adapter");

const leadRepo = new LeadRepo();
const tenantRepo = new TenantRepo();

const createLeadService = async (data) => {

  // 1️⃣ Save lead from Facebook / Instagram
  const lead = await leadRepo.createLead({
    name: data.name,
    email: data.email,
    phone: data.phone,
    facebookLeadId: data.facebookLeadId,
    tenantId: data.tenantId,
    userId: data.userId,
    sourceId: data.sourceId
  });

  console.log("Lead saved from Facebook/Instagram:", lead);

  try {

    // 2️⃣ Get tenant CRM configuration
    const tenant = await tenantRepo.getById(data.tenantId);

    if (!tenant || !tenant.bitrixWebhookUrl) {
      console.log("No Bitrix configured for this tenant");
      return lead;
    }

    // 3️⃣ Create Bitrix client dynamically
    const bitrix = new BitrixAdapter(tenant.bitrixWebhookUrl);

    // 4️⃣ Push lead to Bitrix
    const bitrixLeadId = await bitrix.pushLead({
      name: lead.name,
      email: lead.email,
      phone: lead.phone
    });

    console.log("Bitrix Lead Created:", bitrixLeadId);

    // 5️⃣ Save Bitrix lead ID in database
    await leadRepo.updateById(
  lead.id,
  { bitrixLeadId: String(bitrixLeadId) },
  lead.tenantId
);

  } catch (error) {

    console.error("Bitrix push failed:", error.message);

  }

  return lead;
};

module.exports = {
  createLeadService
};