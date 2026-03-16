const { UserService } = require("../services");
const catchAsync = require("../utils/catch-async");
const { StatusCodes } = require("http-status-codes");

const createUserController = catchAsync(async (req, res, next) => {

  console.log(req?.body, "sample data from controller");

  // In future this will come from JWT (req.user.tenantId)
  const tenantId = req.body.tenantId;

  const user = await UserService.createUserService(
    {
      name: req.body.name,
      email: req.body.email
    },
    tenantId
  );

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Successfully created a user",
    data: user,
    error: {}
  });

});

module.exports = {
  createUserController
};