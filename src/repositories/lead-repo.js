const CrudRepository = require("./crud-repo");
const db = require("../db");

class LeadRepo extends CrudRepository {

  constructor() {
    super(db.lead);
  }

  async createLead(data) {
    return this.create(data);
  }

}

module.exports = LeadRepo;