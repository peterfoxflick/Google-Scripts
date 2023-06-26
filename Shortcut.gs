function Shortcut() {
  this.token = 'xxxx-xxxxxxx'

  /********
   * GET
   * manages get requests and pagination
   */
  this.get = function(url, param = null) {
      var res 

      if(param){
        res = this.call("GET", 'https://api.app.shortcut.com' + url + this.params(param));
      } else {
        res = this.call("GET", 'https://api.app.shortcut.com' + url);
      }
      
      if(res.getContentText().length === 0){
        return []
      } 

      var data = JSON.parse(res.getContentText())

      //Set up pagination
      if(data.next){
        var append = this.get(data.next)
        data.data = data.data.concat(append.data)
      }

      return data
  }

  /****
   * CALL
   * Make API calls, handles auth
   */
  this.call = function(method, url, body = null){
    var options 

    if(body){
      options = {
        'contentType': 'application/json',
        'headers': {"Shortcut-Token": this.token},
        'muteHttpExceptions': true,
        'method' : method,
        'payload' : JSON.stringify(body)
      };
    } else {
      options = {
        'contentType': 'application/json',
        'headers': {"Shortcut-Token": this.token},
        'muteHttpExceptions': true,
        'method' : method
      };
    }

      var res = UrlFetchApp.fetch(url, options);

      if(res.getContentText().length === 0){
        return []
      } 

      return res
  }


  /*****
   * Helper function to take care of adding URL params
   */
  this.params = function(data) {
    const params = [];
    for (var d in data)
        params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return '?' + params.join('&') //+ '&token=' + this.token;
  }

  /*****
   * Search Stories given a query (human readable text for query)
   */
  this.searchStories = function(query){
    var params = {
      'query':query
    }

    return this.get('/api/v3/search/stories', params)
  }

  /******
   * Add label to multiple stories
   */
  this.bulkAddLabel = function(labelIDs, stories){
    var url = 'https://api.app.shortcut.com/api/v3/stories/bulk'

    var body = {
      "labels_add": labelIDs,
      "story_ids": stories
    }

    var res = this.call("PUT", url, body)
    Logger.log(res)
    return JSON.parse(res.getContentText())

  }

  /****
   * Update the labels that are on a story
   */
  this.updateStoryLabel = function(id, labels){
    var url = 'https://api.app.shortcut.com/api/v3/stories/' + id

    var body = {
      "labels": labels
    }

    var res = this.call("PUT", url, body)
    Logger.log(res)
    return JSON.parse(res.getContentText())


  }

  /*******
   * Get stories that have been compeleted within the last week
   */
  this.getThisWeekStory = function(){
    var now = new Date()
    var weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    return this.searchStories("state:released moved:" + weekAgo.toISOString().split('T')[0] + "..*")
  }

  /****
   * Get stories that were updated in the last day
   */
  this.getTodayUpdatedStories = function(){
    var now = new Date()
    var dayAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return this.searchStories("updated:today")// + dayAgo.toISOString().split('T')[0] + "..*")
  }


  this.getTodayRelease = function(){
    return this.searchStories("state:500000167 moved:today")
  }


  /****
   * Get all the labels in shortcut
   */
  this.getLabels = function(){
    var data = this.get('/api/v3/labels')
    return data
  }

  /*****
   * Get a specific label
   */
  this.getLabel = function(id){
    var data = this.get('/api/v3/labels/' + id)
    return data
  }

  this.deleteLabel = function(id){
    var data = this.call("DELETE",'https://api.app.shortcut.com/api/v3/labels/' + id)
    return data
  }

  /***
   * Create a new label, ID is the external ID, name must be unqiue. 
   */
  this.createLabel = function(name, id){
    var url = 'https://api.app.shortcut.com/api/v3/labels'

    var body = {
      "name": name + " - client",
      "external_id": id,
      "color" : "#940696"
    }

    var res = this.call("POST", url, body)
    Logger.log(res)
    return JSON.parse(res.getContentText())
  }

  /****
   * Get different states, usefull in getTodayRelease function
   */
  this.getWorkflowStates = function(){
    var url = 'https://api.app.shortcut.com/api/v3/workflows'
    var res = this.call("GET", url)
    res = JSON.parse(res.getContentText())

    var states = []

    res.forEach(w =>{
      w.states.forEach(s =>{
        states.push({"id": s.id, "name": s.name})
      })
    })
    return states
  }


  /***
   * Get all epics that are still open
   */
  this.getOpenEpics = function(){
    var epics = this.get("/api/v3/epics")
    epics = epics.filter(e => e.archived == false)
    epics = epics.filter(e => e.completed == false)

    return epics
  }

  /*****
   * Get all stories associated with an epic
   */
  this.getEpicsStories = function(id){
    return this.get("/api/v3/epics/" + id + "/stories")
  }

  /****
   * Update the label array on a epic
   */
  this.updateEpicLabel = function(id, labels){
    var url = 'https://api.app.shortcut.com/api/v3/epics/' + id

    var body = {
      "labels": labels
    }

    var res = this.call("PUT", url, body)
    Logger.log(res)
    return JSON.parse(res.getContentText())
  }
}


function test(){
  var s = new Shortcut()
  var epics = s.getOpenEpics()
  Logger.log(epics.length)
}
