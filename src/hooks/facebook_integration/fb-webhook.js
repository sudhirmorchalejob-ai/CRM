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

    const change = req.body.entry[0].changes[0].value;

    const leadId = change.leadgen_id;
    const pageId = change.page_id;
    const adId = change.ad_id;

    // find page in database
    const page = await db.facebookPage.findFirst({
        where: { pageId: pageId }
    });

    if (!page) {
        console.log("Page not registered in system");
        return res.sendStatus(200);
    }

    const tenantId = page.tenantId;

    // fetch lead data from meta
    const leadData = await facebookService.getLeadData(
        leadId,
        page.pageAccessToken
    );

    // determine platform (facebook or instagram)
    const platform = await facebookService.getAdPlatform(
        adId,
        page.pageAccessToken
    );

    const fields = leadData.field_data;

    let name = "";
    let email = "";
    let phone = "";

    fields.forEach((f) => {

        if (f.name === "full_name") name = f.values[0];
        if (f.name === "email") email = f.values[0];
        if (f.name === "phone_number") phone = f.values[0];

    });

    // find user to assign lead
    const user = await db.user.findFirst({
        where: { tenantId: tenantId }
    });

    // create lead
    await db.lead.create({
        data: {
            facebookLeadId: leadId,
            name: name,
            email: email,
            phone: phone,
            tenantId: tenantId,
            userId: user?.id,
            source: platform
        }
    });

    console.log("Lead saved successfully");

    res.sendStatus(200);

});