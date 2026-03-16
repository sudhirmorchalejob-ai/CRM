const { Logger } = require("../config");

// this is the main class that directly talk with modal  , here we write any custome logic or query like join and custome inside it

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  // CREATE
  async create(data) {
    console.log("data from crud repo" , data)
    try {
      return await this.model.create({
        data: data
      });
    } catch (error) {
      console.error("Prisma Error:", error)
      Logger.error("Something went wrong in Crud Repo : Create");
      throw error;
    }
  }

  // DELETE
  async deleteById(id, tenantId) {
  try {
    return await this.model.deleteMany({
      where: {
        id: id,
        tenantId: tenantId
      }
    });
  } catch (error) {
    Logger.error("Something went wrong in Crud Repo : Delete");
    throw error;
  }
}

  // GET BY ID
 async getById(id, tenantId) {
  try {
    return await this.model.findFirst({
      where: {
        id: id,
        tenantId: tenantId
      }
    });
  } catch (error) {
    Logger.error("Something went wrong in Crud Repo : GetById");
    throw error;
  }
}

  // GET ALL
  async getAll(tenantId) {
  try {
    return await this.model.findMany({
      where: {
        tenantId: tenantId
      }
    });
  } catch (error) {
    Logger.error("Something went wrong in Crud Repo : GetAll");
    throw error;
  }
}

  // UPDATE
 async updateById(id, data, tenantId) {
  try {
    return await this.model.updateMany({
      where: {
        id: id,
        tenantId: tenantId
      },
      data: data
    });
  } catch (error) {
    Logger.error("Something went wrong in Crud Repo : Update");
    throw error;
  }
}
}

module.exports = CrudRepository;
