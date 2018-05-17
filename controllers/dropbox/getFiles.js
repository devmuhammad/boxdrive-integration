const 
     crypto         = require('crypto')
    ,rp             = require('request-promise')
    ,dbxService     = require('../../services/dropBoxService')
    ,NodeCache      = require( "node-cache" );
    var mycache     = new NodeCache();

 /*Gets temporary links for a set of files in the root folder of the app
It is a two step process:
1.  Get a list of all the paths of files in the folder
2.  Fetch a temporary link for each file in the folder */
module.exports = {

 getLinksAsync: async function (token){

    //List Docs from the root of the app folder
    let result= await this.listDocPathsAsync(token,'');
  
    //Get a temporary link for each of those paths returned
    let temporaryLinkResults= await this.getTemporaryLinksForPathsAsync(token,result.paths);
  
    //Construct a new array only with the link field
    var temporaryLinks = temporaryLinkResults.map(function (entry) {
      return entry.link;
    });
  
    return temporaryLinks;
  },
  
  
  /*
  Returns an object containing an array with the path_lower of each 
  Doc file and if more files a cursor to continue */
   listDocPathsAsync : async function (token,path){
  
    let options={
      url: dbxService.DBX_API_DOMAIN + dbxService.DBX_LIST_FOLDER_PATH, 
      headers:{"Authorization":"Bearer "+token},
      method: 'POST',
      json: true ,
      body: {"path":path}
    }
  
    try{
      //Make request to Dropbox to get list of files
      let result = await rp(options);
  
      //Filter response to documents only
      let entriesFiltered= result.entries.filter(function(entry){
        return entry.path_lower.search(/\.(gif|jpg|jpeg|pdf|docx|doc|png)$/i) > -1;
      });        
  
      //Get an array from the entries with only the path_lower fields
      var paths = entriesFiltered.map(function (entry) {
        return entry.path_lower;
      });
  
      //return a cursor only if there are more files in the current folder
      let response= {};
      response.paths= paths;
      if(result.hasmore) response.cursor= result.cursor;        
      return response;
  
    }catch(error){
      return next(new Error('error listing folder. '+error.message));
    }        
  }, 
  
  
  //Returns an array with temporary links from an array with file paths
   getTemporaryLinksForPathsAsync: function(token,paths){
  
    var promises = [];
    let options={
      url: dbxService.DBX_API_DOMAIN + dbxService.DBX_GET_TEMPORARY_LINK_PATH, 
      headers:{"Authorization":"Bearer "+token},
      method: 'POST',
      json: true
    }
  
    //Create a promise for each path and push it to an array of promises
    paths.forEach((path_lower)=>{
      options.body = {"path":path_lower};
      promises.push(rp(options));
    });
  
    //returns a promise that fullfills once all the promises in the array complete or one fails
    return Promise.all(promises);
  }
}
  