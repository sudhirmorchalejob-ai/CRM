const { UserRepo } = require("../repositories");

const userRepo = new UserRepo();

const createUserService = async (data, tenantId) => {

  if (!tenantId) {
    throw new Error("tenantId is required to create a user");
  }

  const userData = {
    ...data,
    tenantId 
  };

  const user = await userRepo.createUser(userData);

  return user;
};

module.exports = {
  createUserService
};