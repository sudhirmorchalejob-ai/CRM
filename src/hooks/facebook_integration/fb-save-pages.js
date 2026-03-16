const catchAsync = require("../../utils/catch-async");
const facebookService = require("../../sections/facebook_integration/services/fb-service-api");


exports.facebookCallback = catchAsync(async (req, res, next) => {
    const code = req.query.code;

    // STEP 1: Get short-lived user token
    const shortToken = await facebookService.getAccessToken(code);

    // STEP 2: Convert to long-lived token (60 days)
    const longTokenData = await facebookService.getLongLivedUserToken(shortToken);

    const longToken = longTokenData.access_token;

    // this is for safty for user token is saved for re login

    //       await User.findOneAndUpdate(
    //   { facebookUserId: fbUser.id },
    //   {
    //     facebookUserToken: longToken,
    //     tokenExpiresAt: Date.now() + (expiresIn * 1000)
    //   },
    //   { upsert: true, new: true }
    // );

    // STEP 3: Get pages using long-lived token
    const pages = await facebookService.getUserPages(longToken);

    // for (let page of pages) {

    //     await Page.findOneAndUpdate(
    //         { pageId: page.id },
    //         {
    //             pageName: page.name,
    //             pageAccessToken: page.access_token,
    //             pageId: page.id
    //         },
    //         { upsert: true, new: true }
    //     );

    // }

    res.send("Pages saved");
})