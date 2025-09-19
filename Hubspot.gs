function testSpot(){
  let hub = new Spot()

  let res = hub.getTicket("25481571980")
  Logger.log(JSON.stringify(res))
}


function Spot() {
  this.token = 'init first'

  this.init = function(pToken = null, save = false){
    var props = PropertiesService.getScriptProperties()

    if(pToken){
      this.token = pToken
      if(save){
        props.setProperty("TOKEN", pToken)
      }
    } else {
      this.token = props.getProperty("TOKEN")
    }
  }


  this.call = function(method = 'GET', endpoint, data = null){
    if(this.token == "init first"){
      this.init()
    }

    var options = {
      'contentType': 'application/json',
      'headers': {'Authorization': 'Bearer '+  this.token,
                  'Accept': 'application/json'},
      'muteHttpExceptions': true,
      'method' : method,
    };

    if(data){
      options.payload = JSON.stringify(data)
    }


    var url = 'https://api.hubapi.com' + endpoint
    var res = UrlFetchApp.fetch(url, options);

    return res
  }

  this.getSchema = function(id){
    let endpoint = '/crm/v3/schemas/' + id
    var res = this.call('GET', endpoint)
    var data = JSON.parse(res.getContentText())
    return data
  }


this.getTicket = function(id){
  let endpoint = '/crm/v3/objects/tickets/' + id + '/?properties=hubspot_owner_id,hs_pipeline_stage'
  var res = this.call('GET', endpoint);
  var data = JSON.parse(res.getContentText());
  return data
}

this.updateTicketStatus = function(ticketId, newStatus) {
  let endpoint = '/crm/v3/objects/tickets/' + ticketId;

  let payload = {
    properties: {
      hs_pipeline_stage: newStatus
    }
  };

  var res = this.call('PATCH', endpoint, payload);
  var data = JSON.parse(res.getContentText());

  Logger.log("Ticket status update response:");
  Logger.log(data);

  return data;
};

this.getTicketsInPipeline = function(pipelineId, limit = 100) {
  let endpoint = '/crm/v3/objects/tickets/search';
  let search = {
    "limit": limit,
    "properties": [
      "subject",
      "content",
      "hubspot_owner_id",
      "hs_pipeline_stage",
      "hs_pipeline",
      "createdate"
    ],
    "filterGroups": [
      {
        "filters": [
          {
            "propertyName": "hs_pipeline",
            "value": pipelineId,
            "operator": "EQ"
          }
        ]
      }
    ]
  };

  var res = this.call('POST', endpoint, search);
  var data = JSON.parse(res.getContentText());
  return data.results || [];
};

}
