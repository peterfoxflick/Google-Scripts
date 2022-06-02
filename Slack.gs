///////////////////////////////////////////////
// Slack
// Object containing the functions to send
// slack messages
///////////////////////////////////////////////
function Bot() {
    this.token = 'xxx-xxxxx';

    ///////////////////////////////////////////////
    // Send (text to send, channel to send to)
    // Send a slack message to the intended channel
    ///////////////////////////////////////////////
    this.send = function(text, channel){
      var data = {
       'channel': channel,
       'text': text
      }

      Logger.log("Sending Slack to Channel: " + channel + " \nMessage: " + text)

       var options = {
        'contentType': 'application/json',
        'headers': {'Authorization': 'Bearer '+  this.token},
        'muteHttpExceptions': true,
        'payload' : JSON.stringify(data),
      };


      var url = 'https://slack.com/api/chat.postMessage';

      var res = UrlFetchApp.fetch(url, options);

      Logger.log("Sent Slack with response: " + res)

      return res
    }

    this.urlLink = function(text, link){
      return '<' + link + '|' + text + '>'
    }


    this.getSlack = function(email){
      var data = {
       'email': email
      }

       var options = {
        'headers': {'Authorization': 'Bearer '+  this.token},
        'muteHttpExceptions': true,
        'payload' : data,
      };


      var url = 'https://slack.com/api/users.lookupByEmail';
      var res = UrlFetchApp.fetch(url, options);

      Logger.log(res)
      var data = JSON.parse(res.getContentText())
      if(data.ok){
        return data.user.id
      } else {
        return null
      }

    }

    this.getSlackObj = function(id){
      var data = {
       'user': id
      }

       var options = {
        'headers': {'Authorization': 'Bearer '+  this.token},
        'muteHttpExceptions': true,
        'payload' : data,
      };


      var url = 'https://slack.com/api/users.info';
      var res = UrlFetchApp.fetch(url, options);

      Logger.log(res)
      var data = JSON.parse(res.getContentText())
      return data.user

    }

    this.getUsersInChannel = function(channel){
      var data = {
       'channel': channel
      }

       var options = {
        'headers': {'Authorization': 'Bearer '+  this.token},
        'muteHttpExceptions': true,
        'payload' : data,
      };


      var url = 'https://slack.com/api/conversations.members';
      var res = UrlFetchApp.fetch(url, options);

      Logger.log(res)
      var data = JSON.parse(res.getContentText())
      return data.members
    }
}
