function Desk() {
  this.token = "xxxx-xxxx"
 
  this.call = function(method, path, body = null){
    var url = 'https://UR-ORG.zendesk.com'

    var options = {
        'contentType': 'application/json',
        'headers': {"Authorization": "Basic " + Utilities.base64Encode("admin@ur-email.com/token:xxx-xxxx")},
        'muteHttpExceptions': true,
        'method' : method
    }

    if(body){
      options.payload = JSON.stringify(body)
    }

    var res = UrlFetchApp.fetch(url + path, options);
    return res
  }  

  this.getTickets = function(){
      var resp = this.call("GET", "/api/v2/tickets/?sort_by=created_at&sort_order=desc")
      var data = JSON.parse(resp.getContentText())
      return data
  }

  this.getTicket = function(ticketID){
      var resp = this.call("GET", "/api/v2/tickets/" + ticketID)
      var data = JSON.parse(resp.getContentText())
      return data
  }

  this.getCommentCount = function(ticketID){
      var resp = this.call("GET", "/api/v2/tickets/" + ticketID + "/comments/count")
      var data = JSON.parse(resp.getContentText())
      return data
  }

  this.getComments = function(ticketID){
      var resp = this.call("GET", "/api/v2/tickets/" + ticketID + "/comments")
      var data = JSON.parse(resp.getContentText())
      return data
  }

  this.getOrganization = function(orgID){
      var resp = this.call("GET", "/api/v2/organizations/" + orgID)
      var data = JSON.parse(resp.getContentText())
      return data
  }

}


function test(){
  var zen = new Desk()

  var res = zen.getTicket(2193)
  var org = res.ticket.organization_id

  var orgRes = zen.getOrganization(org)

  var sfID = orgRes.organization.external_id
  Logger.log(sfID)
}




