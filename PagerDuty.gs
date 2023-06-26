function Duty() {
  this.token = 'xxxx-xxxxx'

  /****
   * GET
   * Handle API calls/auth
   */
  this.get = function(url, params) {
    var options = {
        'contentType': 'application/json',
        'headers': {"Authorization": "Token token=" + this.token,
                    "Accept": "application/vnd.pagerduty+json;version=2",
                    "Content-Type" : "application/json"
                    },
        'muteHttpExceptions': true
      };


      var res = UrlFetchApp.fetch('https://api.pagerduty.com' + url + this.params(params), options);

      if(res.getContentText().length === 0){
        return null
      } 

      var data = JSON.parse(res.getContentText())
  
      return data
  }

  /****
   * Params
   * Helper function to build URL based params
   */
  this.params = function(data) {
    const params = [];
    for (var d in data)
        params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return '?' + params.join('&');
  }

  /****
   * Get the person on call given a schedule ID
   */
  this.getOnCall = function(schedule){

    var now = new Date()
    var almostNow = new Date(now.setMinutes(now.getMinutes()+5))

    var params = {
      'time_zone': 'CET',
      'since': now.toISOString(),
      'until':almostNow.toISOString(),
      'earliest':true,
      'include[]':'users',
      'schedule_ids[]': schedule
    }

    return this.get('/oncalls', params)
  }

  /****
   * List Schedules
   * Used to find the right scheulde for the getOnCall function
   */
  this.listSchedules = function(){
    var params = {

    }
    var res = this.get('/schedules', params)

    Logger.log(res)
  }


}


function test(){
  var p = new Duty()
  var res = p.listSchedules()
}
