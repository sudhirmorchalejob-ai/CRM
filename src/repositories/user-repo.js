const CrudRepository = require("./crud-repo");
const db = require("../db/index");

class UserRepo extends CrudRepository {

     constructor(){
         super(db.user);
     }

     async createUser(data){
         return this.create({
             name: data.name,
             email: data.email,
             tenantId: data.tenantId
         });
     }

}

module.exports = UserRepo;