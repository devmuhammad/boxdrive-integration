const 
     crypto     = require('crypto')
    ,rp         = require('request-promise')
    ,dbxService = require('../../services/dropBoxService')
    ,NodeCache  = require( "node-cache" )
    ,opn        = require('opn');
    var mycache = new NodeCache();
    
    const dfs   = require('dropbox-fs')({
      apiKey: dbxService.DBX_APP_KEY,
      client: dbxService.DBX_APP_SECRET
      });

    var getFiles    = require ("./getFiles")
    var uploadFiles = require ("./uploadFiles")


//Sync With dropbox and retrieve documents
exports.syncWithDropbox = function(req, res, next){
    
    //let token = mycache.get("aTempTokenKey");
    let token = req.session.token;

    if(token){
        res.status(200).json({status:"success", message:"user Verified"});
        try{
          let paths =  getFiles.getLinksAsync(token); 
         // res.render('documents', { docs: paths, layout:false});
         return res.status(200).json({"docs":paths})
        }catch(error){
          return next(new Error("Error getting documents from Dropbox"));
        }
      }else{
      res.redirect('/cabsol/dropbox/login');    
}
}

//Login to dropbox
exports.dropboxLogin = function (req, res, next){
    //create a random state value
    let state = crypto.randomBytes(16).toString('hex');
     
    //Save state and temporarysession for 10 mins
    //mycache.set(state, "aTempSessionValue", 600);
    mycache.set(state, req.sessionID, 600);

    let dbxRedirect= dbxService.DBX_OAUTH_DOMAIN 
            + dbxService.DBX_OAUTH_PATH 
            + "?response_type=code&client_id="+dbxService.DBX_APP_KEY
            + "&redirect_uri="+dbxService.OAUTH_REDIRECT_URL 
            + "&state="+state;
    
            // window.open(dbxRedirect, "authWindow", 'width=800,height=600')
            // window.close();
            
    //res.redirect(dbxRedirect);
    opn(dbxRedirect, {app: ['chrome', '--kiosk --incognito'], wait: true });
}

//Authentication Redirect
module.exports.oauthredirect = async (req,res,next)=>{

    if(req.query.error_description){
      return next( new Error(req.query.error_description));
    } 
  
    let state= req.query.state;
    //if(!mycache.get(state)){
      if(mycache.get(state)!=req.sessionID){
        console.log(state)
        console.log(req.sessionID)
      return next(new Error("session expired or invalid state"));
    } 
  
    //Exchange code for token
    if(req.query.code ){
    console.log(req.query.code)
      let options={
        url: dbxService.DBX_API_DOMAIN + dbxService.DBX_TOKEN_PATH,
        
            //build query string
        qs: {
        'code': req.query.code, 
        'grant_type': 'authorization_code', 
        'client_id': dbxService.DBX_APP_KEY, 
        'client_secret':dbxService.DBX_APP_SECRET,
        'redirect_uri':dbxService.OAUTH_REDIRECT_URL }, 
         method: 'POST', 
         json: true }
  
      try{
  
        let response = await rp(options);
  
        //mycache.set("aTempTokenKey", response.access_token, 3600);
        await regenerateSessionAsync(req);
        req.session.token = response.access_token;
        res.redirect("/");
  
      }catch(error){
        return next(new Error('error getting token. '+error.message));
      }        
    }
  };

 
//Session regeneration if expired
function regenerateSessionAsync(req){
  return new Promise((resolve,reject)=>{
    req.session.regenerate((err)=>{
      err ? reject(err) : resolve();
    });
  });
}

//Upload to dropbox
module.exports.uploadfiles = function(req, res, next) {

  var serverpath;//file to be save at what path in server
  var localpath;//path of the file which is to be uploaded

  let token = req.session.token;

  if (req.query.error) {
    return res.json('ERROR ' + req.query.error + ': ' + req.query.error_description);
  }
  if(token){
      res.status(200).json({status:"success", message:"user Verified"});
      try{
        //Function to read local files
    dfs.readFile (req.body.localpath,'utf8', function read(err, data){
      if (err) {
        throw err;
    }
    let content = data;
    console.log(content); 
     uploadFiles.fileUpload(token,content);

    });    
       // res.render('documents', { docs: paths, layout:false});
       return res.status(200).json({status:"success", message:"File successfully Uploaded"})
      }catch(error){
        return next(new Error("Error uploading documents to Dropbox"));
      }
    }else{
    res.redirect('/cabsol/dropbox/login');    
}

}

//Create a folder
module.exports.createFolder = function (req, res, next){

  let token = req.session.token;

  if (req.query.error) {
    return res.json('ERROR ' + req.query.error + ': ' + req.query.error_description);
  }
  if(token){
      res.status(200).json({status:"success", message:"user Verified"});
      try{
        //Function to create a directory
    dfs.mkdir (req.body.foldername, (err, stat) => {
      if (err) {
        throw err;
    }
      console.log(stat.name);
      return res.status(200).json({status:"success", message:"Folder Successfully created", data:stat})
    });    
       // res.render('documents', { docs: paths, layout:false});
      }catch(error){
        return next(new Error("Error creating folder on Dropbox"));
      }
    }else{
    res.redirect('/cabsol/dropbox/login');    
}
}

//delete a Folder
module.exports.deleteFolder = function (req, res, next){
  let token = req.session.token;

  if (req.query.error) {
    return res.json('ERROR ' + req.query.error + ': ' + req.query.error_description);
  }
  if(token){
      res.status(200).json({status:"success", message:"user Verified"});
      try{
        //Function to create a directory
    dfs.rmdir (req.body.folderpath, err => {
      if (!err) {
        return res.status(200).json({status:"success", message:"Folder Successfully deleted"})
    }
    });    
       // res.render('documents', { docs: paths, layout:false});
      }catch(error){
        return next(new Error("Error creating folder on Dropbox"));
      }
    }else{
    res.redirect('/cabsol/dropbox/login');    
}
}
//delete a file
module.exports.deleteFile = function(req,res, next){
  let token = req.session.token;

  if (req.query.error) {
    return res.json('ERROR ' + req.query.error + ': ' + req.query.error_description);
  }
  if(token){
      res.status(200).json({status:"success", message:"user Verified"});
      try{
        //Function to create a directory
    dfs.unlink(req.body.filepath, err => {
      if (!err) {
        return res.status(200).json({status:"success", message:"Folder Successfully deleted"})
    }
    });    
       // res.render('documents', { docs: paths, layout:false});
      }catch(error){
        return next(new Error("Error creating folder on Dropbox"));
      }
    }else{
    res.redirect('/cabsol/dropbox/login');    
}
}