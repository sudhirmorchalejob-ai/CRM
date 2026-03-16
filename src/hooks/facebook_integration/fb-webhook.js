const catchAsync = require("../../utils/catch-async");
const facebookService = require("../../sections/facebook_integration/services/fb-service-api");
const db = require("../../db");

exports.verifyWebhook = (req, res) => {

    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
};


exports.receiveLead = catchAsync(async (req, res) => {

    console.log("Webhook received");

    const change = req.body.entry?.[0]?.changes?.[0];

    if (!change || change.field !== "leadgen") {
        console.log("Not a lead event");
        return res.sendStatus(200);
    }

    const value = change.value;

    const leadId = value.leadgen_id;
    const pageId = value.page_id;
    const adId = value.ad_id;

    const page = await db.facebookPage.findFirst({
        where: { pageId: pageId },
    });

    if (!page) {
        console.log("Page not registered");
        return res.sendStatus(200);
    }

    const leadData = await facebookService.getLeadData(
        leadId,
        page.pageAccessToken
    );

    const fields = leadData.field_data || [];

    let name = "";
    let email = "";
    let phone = "";

    fields.forEach((f) => {
        if (f.name === "full_name") name = f.values[0];
        if (f.name === "email") email = f.values[0];
        if (f.name === "phone_number") phone = f.values[0];
    });



    try {
        // lead vrification 
        const existingLead = await db.lead.findFirst({
            where: {
                OR: [
                    phone ? { phone: phone } : undefined,
                    email ? { email: email } : undefined
                ].filter(Boolean)
            }
        });

        if (!existingLead) {

            await db.lead.create({
                data: {
                    facebookLeadId: leadId,
                    name: name || "Unknown",
                    email: email || "",
                    phone: phone || "",
                    tenantId: page.tenantId ?? null,
                    userId: 1,
                    sourceId: 1
                },
            });

            console.log("Lead created");

        } else {
            console.log("Lead already exists, skipping");

        }

    } catch (error) {

        console.error("Lead save error:", error);

    }

    res.sendStatus(200);

});