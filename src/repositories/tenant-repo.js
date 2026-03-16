const prisma = require("../config/prisma-client");

class TenantRepo {

  async getById(id) {
    return prisma.tenant.findUnique({
      where: { id }
    });
  }

}

module.exports = TenantRepo;