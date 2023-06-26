function SF() {
  this.token = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN")


  ////////////////////////////////////
  // Send Folder : Send the folder URL back to sales force
  // - AccountID: salesforce account id, needed in api call
  // - URL: URL of the folder
  ////////////////////////////////////
  this.sendFolder = function(accountID, url){
    if(url == ""){
      return
    }
    
    var r = this.sendSFCall(accountID, url)

    this.addLog(["Add google link", accountID, url, r.getResponseCode()])

    //Generate new access token and try again
    if(r.getResponseCode() == 401){
      this.refreshSFToken()
      r = this.sendSFCall(accountID, url)
    }
  }

  ////////////////////////////////////
  // Add Log : Adds log entries to google sheets. 
  // - data: Array of information to be added to the log
  ////////////////////////////////////
  this.addLog = function(data){
    var sheet = SpreadsheetApp.openById("xxxx-xxxxxxx")
    var now = new Date()
    sheet.getSheets()[0].appendRow([now.toString(), "SF"].concat(data))
  }


  ////////////////////////////////////
  // Send SF Call: Send the sales force api call
  // - AccountID: salesforce account id, needed in api call
  // - URL: URL of the folder
  // - Access Token: Token needed for authentication
  ////////////////////////////////////
  this.sendSFCall = function(accountID, googleUrl){
    var data = {
      'Google_Drive__c': googleUrl
    };

    var options = {
      'method' : 'patch',
      'contentType': 'application/json',
      'payload' : JSON.stringify(data),
      'headers': {'Authorization': 'Bearer '+  this.token},
      'muteHttpExceptions': true
    };

    var url = 'https://UR-APP-ID.my.salesforce.com/services/data/v52.0/sobjects/Account/' + accountID
    var response = UrlFetchApp.fetch(url , options);
    return response
  }

  ////////////////////////////////////
  // Send Shortcut Label: Send the sales force api call
  // - AccountID: salesforce account id, needed in api call
  // - URL: URL of the folder
  // - Access Token: Token needed for authentication
  ////////////////////////////////////
  this.sendShortcutLabel = function(accountID, labelID){
    var data = {
      'labelID__c': labelID
    };

    var options = {
      'method' : 'patch',
      'contentType': 'application/json',
      'payload' : JSON.stringify(data),
      'headers': {'Authorization': 'Bearer '+  this.token},
      'muteHttpExceptions': true
    };

    var url = 'https://UR-APP-ID.my.salesforce.com/services/data/v52.0/sobjects/Account/' + accountID
    var response = UrlFetchApp.fetch(url , options);
    return response
  }

  /************************************
   * Example Query
   * Create your own queries like this
  *************************************/
  this.exampleQuery = function(id){
    var query = "Select ID, Name from Account where obj = '" + id + "'"

    var r = this.sendSFQuery_( query)
    
    return JSON.parse(r)
  }

  /************************************
   * Send SF Query: Send the sales force api call
   * Query: The SOQL query to execute
  *************************************/
  this.sendSFQuery_ = function(query, attempt=1){
    if(attempt > 3){
      throw "Error: Tried to get query too many times"
    }
    var p = {
      'q': query
    }

    var options = {
      'method' : 'get',
      'contentType': 'application/json',
      'headers': {'Authorization': 'Bearer '+  this.token},
      'muteHttpExceptions': true
    };

    Logger.log(params(p))
    var url = 'https://UR-APP-ID.my.salesforce.com/services/data/v52.0/query/' + params(p)
    var response = UrlFetchApp.fetch(url , options);

    if(response.getResponseCode() == "401"){
      //Auth token is expired re-send
      this.refreshSFToken()
      return this.sendSFQuery_(query, attempt + 1)
    }
    
    return response
  }



  ////////////////////////////////////
  // Refresh SF Token : Generate a new session access token for sales force
  ////////////////////////////////////
  this.refreshSFToken = function(){
    //Generate new token
    var scriptProp = PropertiesService.getScriptProperties()
    var refreshToken = scriptProp.getProperty("REFRESH_TOKEN") 
    var clientId = scriptProp.getProperty("CLIENT_ID") 
    var clientSecret = scriptProp.getProperty("CLIENT_SECRET") 


    var data = {
      "grant_type": "refresh_token",
      "client_id" : clientId,
      "client_secret": clientSecret,
      "refresh_token" : refreshToken
    };

    var options = {
      'method' : 'post',
      'contentType': 'application/x-www-form-urlencoded', 
      'payload' : data,
      'muteHttpExceptions': true
    };

    var url = 'https://UR-APP-ID.my.salesforce.com/services/oauth2/token' 
    var response = UrlFetchApp.fetch(url , options);

    response = JSON.parse(response)

    //Save token
    PropertiesService.getScriptProperties().setProperty("ACCESS_TOKEN", response.access_token)

    //Return token
    this.token = response.access_token
  }

}




function params(data) {
    const params = [];
    for (var d in data)
        params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return '?' + params.join('&');
  }





////////////////////////////////////
// parseXML : returns needed values from XML document. 
// - text: text/string format of the xml
// returns object with name, id and url 
////////////////////////////////////
function parseXML(text){
  let doc = XmlService.parse(text)
  let namespace = XmlService.getNamespace("http://schemas.xmlsoap.org/soap/envelope/")
  let sfNameSpace = XmlService.getNamespace("http://soap.sforce.com/2005/09/outbound")
  let root = doc.getRootElement()

  let body = root.getChild("Body", namespace)
  let notifications = body.getChild("notifications", sfNameSpace)
  let notification = notifications.getChild("Notification", sfNameSpace)
  let account = notification.getChild("sObject", sfNameSpace)
  let children = account.getChildren() 


  var id = ""
  var name = ""
  var url = ""

  for(var i = 0; i < children.length; i++){
    var c = children[i]

    if(c.getName() == "AccountId"){
      id = c.getValue()
    } else if(c.getName() == "Account_Name"){
      name = c.getValue()
    } else if(c.getName() == "Google_Drive__c"){
      url = c.getValue()
    }
  }

  return {
    id,
    name,
    url
  }
}
