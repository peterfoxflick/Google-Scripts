
/************
 * My Learning Hub
 * These's API calls are a mix of documented and reversed engineered. 
 * The overal idea is to allow for bulk operations within myLearningHub
 */
function Hub() {
  this.token = "xxx-xxxxxx-xxxxxx"

  
  /******
   * Call
   * Makes API call to myLearningHub, handles auth
   */
  this.call = function(method, path, body = null){
    var url = 'https://share.mylearninghub.com'

    var options = {
        'contentType': 'application/json',
        'headers': {"Authorization": "Bearer " + this.token},
        'muteHttpExceptions': true,
        'method' : method
    }

    if(body){
      options.payload = JSON.stringify(body)
    }

    var res = UrlFetchApp.fetch(url + path, options);
    return res
  }  

  /****
   * Get Hubs
   * Returns all hubs in application, accounts for paginations. 
   */
  this.getHubs = function(){
    var hubs = []
    var page = 0
    var lastpage = 1
    do{
      page += 1

      var resp = this.call("GET", "/api/course_hubs/get?page=" + page)
      var data = JSON.parse(resp.getContentText())
      hubs = hubs.concat(data.data)
      lastpage = parseInt(data.meta["last_page"])

    } while (page < lastpage)

    return hubs
  }

  /******
   * Add Course
   * Add's a course to a hub. 
   */
  this.addCourse = function(hub, course){
    var resp = this.call("POST", "/api/course_hubs/add_courses_to_hub/" + hub, {"courses_to_add": [course]})
    return resp
  }

  /******
   * Creates a new bundle in a hub
   */
  this.addBundle = function(hub, bundle){
    var resp = this.call("POST", "/api/bundles", {"hub_id": hub, "title": bundle})
    return resp
  }

  /******
   * Add's an array of courses to a bundle
   */
  this.addCoursesToBundle = function(bundle, courses){
    var resp = this.call("POST", "/api/bundles/" + bundle + "/courses", {"course_ids": courses})
    return resp
  }

  /*****
   * Get courses in hub
   * Returns all courses assigned to a hub
   */
  this.getCoursesInHub = function(hub){
    var resp = this.call("GET", "/api/course_hubs/get_hub_courses/" + hub + "?page=1&per_page=50")
    return resp
  }

  /******
   * Change Course Order
   * Reorder's a course (best to work top down ;)
   */
  this.changeCourseOrder = function(id, order){
    var resp = this.call("POST", "/api/course_hubs/change_course_order/" + id, {"new_order": order})
    return resp
  }
}


function test(){
  var hub = new Hub()

  var res = hub.getHubs()
  Logger.log(res.length)
}
