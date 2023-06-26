///////////////////////////////////////////////
// Slack
// Object containing the functions to send
// slack messages
///////////////////////////////////////////////
function Bot() {
    this.token = 'xxxx-xxxxxxxxx';


   ///////////////////////////////////////////////
    // Send (text to send, channel to send to)
    // Send a slack message to the intended channel
    ///////////////////////////////////////////////
    this.send = function(text, channel, reply = null){
      var data = {
       'channel': channel,
       'text': text
      }

      if(reply){
        data.thread_ts = reply
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

    /********
     * URL Link
     * Helper function that creates a link to be sent in a message. 
     */
    this.urlLink = function(text, link){
      return '<' + link + '|' + text + '>'
    }

    /*********
     * Get Slack object from Email address
     * Searches slack for a user based on their email
     */
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

    /******
     * Get Slack User Object from ID
     * Returns a slack obejct for a user based on their slack ID. 
     */
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
      if(data.ok){
        return data.user
      } else {
        return data
      }
    }

    /*******
     * Get Users in Channel
     * Returns all users (bot and human) from a channel
     */
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

    /******
     * Get Channel Messages
     * Returns the last few (500?) messages from a channel
     */
    this.getChannelMessages = function(channel){
      var data = {
       'channel': channel
      }

       var options = {
        'headers': {'Authorization': 'Bearer '+  this.token},
        'muteHttpExceptions': true,
        'payload' : data,
      };


      var url = 'https://slack.com/api/conversations.history';
      var res = UrlFetchApp.fetch(url, options);

      Logger.log(res)
      var data = JSON.parse(res.getContentText())
      return data.messages
    }

    /******
     * Add Reaction
     * Sends a reaction emoji to a message. Send the channel ID, timestamp of message, and the reaction emoji. 
     */
    this.addReaction = function(channel, timestamp, reaction){
      var data = {
       'channel': channel,
       'name': reaction, 
       'timestamp': timestamp
      }

      Logger.log("adding " + reaction + " to channel : " + channel)

       var options = {
        'contentType': 'application/json',
        'headers': {'Authorization': 'Bearer '+  this.token},
        'muteHttpExceptions': true,
        'payload' : JSON.stringify(data),
      };


      var url = 'https://slack.com/api/reactions.add';

      var res = UrlFetchApp.fetch(url, options);

      Logger.log("Sent Slack with response: " + res)

      return res

    }

    /*****
     * Get Custom Emojis
     * Returns all customized emojis in the Slack Application. 
     */
    this.getCustomEmojis = function(){
      var options = {
        'contentType': 'application/json',
        'headers': {'Authorization': 'Bearer '+  this.token},
        'muteHttpExceptions': true
      };


      var url = 'https://slack.com/api/emoji.list';

      var res = UrlFetchApp.fetch(url, options);
      var data = JSON.parse(res.getContentText())

      return data.emoji

    }
}

function test(){
  var s = new Bot()
  var emojis = s.getCustomEmojis()

  Logger.log(Object.keys(emojis).length)
}
