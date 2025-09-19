function test() {
  var chat = new Chat()
  var messages = [
     {
        "role": "system",
        "content": `You are a helpful assistant`
      },
      {
        "role": "user",
        "content": `Howdy`
      }
  ]

  var resp = chat.chat(messages)
  Logger.log(resp)
}


function Chat(){
  this.token = 'init first'

  this.init = function(pToken = null, save = false){
    var props = PropertiesService.getScriptProperties()

    if(pToken){
      this.token = pToken
      if(save){
        props.setProperty("BEARER_TOKEN", pToken)
      }
    } else {
      this.token = props.getProperty("BEARER_TOKEN")
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


    var url = 'https://api.openai.com' + endpoint
    var res = UrlFetchApp.fetch(url, options);

    return res
  }


  this.chat = function(messages, model = "gpt-3.5-turbo"){
    var data = {
      "model": model,
      "messages": messages
    }

    var res = this.call("POST", '/v1/chat/completions', data)
    var data = JSON.parse(res.getContentText())

    return data
  }

}
