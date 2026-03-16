


class ApiRes{
     constructor(status = 404 , success = false , message = "" , data = [] || {}){
           this.status = status
           this.success = success > 400 ? false : true
           this.message = message
           if(data){
              this.data = data
           }
     } 
}


module.exports = ApiRes