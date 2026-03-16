const catchAsync = require("../../utils/catch-async");
const facebookService = require("../../sections/facebook_integration/services/fb-service-api");
const db = require("../../db");


exports.facebookCallback = catchAsync(async (req, res) => {

    const code = req.query.code;

    // STEP 1: short token
    const shortToken = await facebookService.getAccessToken(code);

    // STEP 2: long token
    const longTokenData = await facebookService.getLongLivedUserToken(shortToken);


    const longToken = longTokenData.access_token;

    const tokenInfo = await facebookService.getTokenInfo(longToken);

    const expiresAt =
        tokenInfo.expires_at && tokenInfo.expires_at !== 0
            ? new Date(tokenInfo.expires_at * 1000)
            : null;

    // STEP 3: get facebook user
    const fbUser = await facebookService.getFacebookUser(longToken);



    // STEP 4: save/update facebook user
    await db.facebookUser.upsert({

        where: {
            facebookUserId: fbUser.id
        },

        update: {
            userToken: longToken,
            expiresAt: expiresAt
        },

        create: {
            facebookUserId: fbUser.id,
            userToken: longToken,
            expiresAt: expiresAt,
            tenantId: 1 // its hardcoded value later we change dynamic
        }

    });

    // STEP 5: get pages
    const pages = await facebookService.getUserPages(longToken);

    for (let page of pages) {

        await db.facebookPage.upsert({

            where: { pageId: page.id },

            update: {
                pageAccessToken: page.access_token,
                pageName: page.name
            },

            create: {
                pageId: page.id,
                pageName: page.name,
                pageAccessToken: page.access_token
            }

        });

    }

    res.send("Facebook user + pages saved");

});