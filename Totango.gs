function Totango() {
  this.token = "app-token {bcrypt}xxxxx-xxxxxx"
 
  /*****
   * Call
   * Make an API call to add a collection to Totango
   */
  this.call = function(collection){
    var url = 'https://int-hub-eu1.totango.com/api/v1/collections/shortcut'

    var body = {
      "collections": collection
    }
    
    var options = {
        'contentType': 'application/json',
        'headers': {"Authorization": this.token, "service_id": "12345"},
        'muteHttpExceptions': true,
        'method' : "POST",
        'payload': JSON.stringify(body)
    }

    var res = UrlFetchApp.fetch(url, options);
    Logger.log(res)
    if(res.getContentText().length === 0){
      return []
    } 

    return res

  }  

  /******
   * Task
   * Create a task and assign it to a user. 
   */
  this.task = function(account, user, title, desc, due){
    var url = 'https://api-eu1.totango.com/api/v3/tasks'

    var formData = {
      'assignee': user, //email
      'priority': '2',
      'activity_type_id':'adoption',
      'due_date':due,//'2022-12-25'
      'title':title,
      'status':'open',
      'account_id':account,//sf id
      'description':desc
    };

    
    var options = {
        'headers': {"app-token": this.token.split(" ")[1], "service_id": "12345"},
        'muteHttpExceptions': true,
        'method' : "POST",
        'contentType': "application/x-www-form-urlencoded",
        'payload': formData
    }

    var res = UrlFetchApp.fetch(url, options);
    Logger.log(res)
    if(res.getContentText().length === 0){
      return []
    } 

    return res
  }

  this.account = function(id){
    
  }

  /*******
   * Touchpoint
   * Create a touchpoint as the 'creator'. Keep subject short for easier readablity
   */
  this.touchpoint = function(account, subject, content, creator){
    var url = 'https://api-eu1.totango.com/api/v3/touchpoints'

    var formData = {
      'created_by': creator, //email
      'activity_type_id':'adoption',
      'account_id':account,//sf id
      'subject': subject, //or title
      'content': content 
    };

    
    var options = {
        'headers': {"app-token": this.token.split(" ")[1], "service_id": "12345"},
        'muteHttpExceptions': true,
        'method' : "POST",
        'contentType': "application/x-www-form-urlencoded",
        'payload': formData
    }

    var res = UrlFetchApp.fetch(url, options);
    Logger.log(res)
    if(res.getContentText().length === 0){
      return []
    } 

    return res
  }
}
