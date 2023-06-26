function Guru() {
  this.token = 'xxx-xxxx-xxxxx-xxxx'

  this.get = function(url, params = null) {
    var options = {
        'contentType': 'application/json',
        'headers': {"Authorization": "Basic " + Utilities.base64Encode("admin@ur-email.com:" + this.token)},
        'muteHttpExceptions': true
      };

      let paramURL = ''

      if(params != null){
        paramURL = this.params(params)
      }

      var res = UrlFetchApp.fetch('https://api.getguru.com/api/v1' + url + paramURL, options);

      if(res.getContentText().length === 0){
        return []
      } 

      var data = JSON.parse(res.getContentText())
      var headers = res.getAllHeaders()

      //Set up pagination

      if(headers.Link){
        var append = this.get(headers.Link.replace("<https://api.getguru.com/api/v1", "").split(">;")[0])
        data = data.concat(append)
      }

      return data
  }

  this.params = function(data) {
    const params = [];
    for (var d in data)
        params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return '?' + params.join('&');
  }

  this.getCreatedInLastWeek = function(){
    var params = {
      'q':'dateCreated < 7_days_ago AND verificationState = trusted',
      'sortField':'viewCount'
    }

    return this.get('/search/query', params)
  }

  this.getCreatedInLastDay = function(){
    const d = new Date();
    var params = {}

    //Don't return weekend data
    if(d.getDay() == 0 || d.getDay() == 6){
      return []
    } else if (d.getDay() == 1){ //Return weekend data on monday
      params = {
        'q':'dateCreated < 2_days_ago AND verificationState = trusted'
      }
    } else {
      params = {
        'q':'dateCreated < 1_days_ago AND verificationState = trusted'
      }
    }

    return this.get('/search/query', params)
  }

  this.getUnverified = function(){
    var params = {
      'q': 'verificationState = needsVerification'
    }

    return this.get('/search/query', params)
  }

  this.getVerifiedLastWeek = function(){
    var params = {
      'q': 'verificationState = trusted AND lastVerified < 7_days_ago' 
    }

    return this.get('/search/query', params)
  }
}


function test(){
  var g = new Guru()
  var cards = g.getUnverified()

  Logger.log(cards.length)

  // cards.forEach(c =>{
  //   Logger.log(c.preferredPhrase)
  // })
}
