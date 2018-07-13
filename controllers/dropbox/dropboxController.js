const 
     crypto     = require('crypto')
    ,config     = require('../../config/')
    ,rp         = require('request-promise')
    ,dbxService = require('../../services/dropBoxService')
    ,NodeCache  = require( "node-cache" )
    ,opn        = require('opn')
    ,userConfig = require("../../models").userConfig
    ,fs = require("node-fs")
    var mycache = new NodeCache();
    
    const dfs   = require('dropbox-fs')
      //apiKey: dbxService.DBX_ACCESS_TOKEN,
      // client: dbxService.DBX_APP_SECRET

    var getFiles    = require ("./getFiles")
    var uploadFiles = require ("./uploadFiles")


//Sync With dropbox 
exports.syncWithDropbox = function(req, res, next){

    let nwUser = new userConfig(req.body)
    
    userConfig.findOne({user_id : nwUser.user_id}, function (err, user){
      if (err) return res.status(500).json({status:"error", message:"DB_ERROR"});
      if (user.dropbox_credentials.access_token) return res.status(200).json({status:"success", message:"User already Synced"});
    
      // if (!user.dropbox_credentials){
      //   // userConfig.find({"dropbox_credentials.access_token":{ $exists: false }}, {
      //    userConfig.findByIdAndRemove()
      // // })
      // }
      if (!user || !user.dropbox_credentials) {
       
        nwUser.syncWith = "dropbox";       
      //  newUser = new userConfig(JSON.parse(user_id),syncWith)

        nwUser.save( function(err, user){
          if (err) return res.status(500).json({status:"error", message:"There was a problem saving the info "});
          if (user) {      
            mycache.set("aUserId", user._id, 600);   
         
            res.redirect('/cabsol/dropbox/login')}
        })
        
      }
    })
  
}


//Login to dropbox
exports.dropboxLogin = function (req, res, next){
  
    let dbxRedirect= dbxService.DBX_OAUTH_DOMAIN 
            + dbxService.DBX_OAUTH_PATH 
            + "?response_type=code&client_id="+dbxService.DBX_APP_KEY
            + "&redirect_uri="+dbxService.OAUTH_REDIRECT_URL 
            // window.open(dbxRedirect, "authWindow", 'width=800,height=600')
            // window.close();
            
    //res.redirect(dbxRedirect);  
    opn(dbxRedirect, {app: ['chrome', '--kiosk --incognito'], wait: true });
}

//Authentication Redirect
module.exports.oauthredirect = async (req,res,next )=>{
  
    let userId = mycache.get("aUserId")
    
    if(req.query.error_description){
      return next( new Error(req.query.error_description));
    } 
 

    //Exchange code for token
    if(req.query.code ){
    
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
        
        userConfig.findByIdAndUpdate(userId,{ $set: 
          {"dropbox_credentials.uid" : response.uid, "dropbox_credentials.access_token":response.access_token, "dropbox_credentials.account_id" : response.account_id}},
          function(err,info){
          if (err) return res.status(500).json({status:"error", message:"DB update ERROR "});
        // req.session.token = response.access_token;
          
        if (info)  return next(res.status(200).json({status: "success",message:"Access Token Granted" }) ) 
        
        });
        //res.redirect("/cabsol/dropbox/sync");
  
      }catch(error){
        return next(new Error('error getting token. '+error.message));
      }        
    }
  };

 
//Session regeneration if expired
//  function regenerateSessionAsync(req){
  
//   return new Promise((resolve,reject)=>{
//     req.session.regenerate((err)=>{
//       err ? reject(err) : resolve();
//     });
//   });
// }

//Retrieve documents
exports.retrieveFiles = function(req, res, next){
    
  //let token = mycache.get("aTempTokenKey");
   //userConfig.findOne({"dropbox_credentials.access_token":{ $exists: true, $ne:"" }}, function(err, token){
  //   if (err) return res.status(500).json({status:"error", message:"unKnown Token "});
  
      userConfig.findOne({user_id : req.body.user_id}, function (err, user){
        if(err){
          return res.status(500).json({status:"error", message: 'No Authorization: Failed to authenticate user.' });
        }
        if (user){
          
          const dfs   = require('dropbox-fs')({
          apiKey : user.dropbox_credentials.access_token});
              
          try{
           
            dfs.readdir('/', (err, result) => {
              if(err){
                console.log(err)
              }
     
            return res.status(200).json({status:"success", message:"Folder Synced", data:result})
           });
         }catch(error){
             return next(new Error("Error getting documents from Dropbox"));
           }
        }else return res.status(500).json({status:"error", message: 'No access token in DB' });
      })
    
  }


//Upload to dropbox
module.exports.uploadfiles = function(req, res, next) {

  userConfig.findOne({user_id : req.body.user_id}, function (err, user){
    if(err){
      return res.status(500).json({status:"error", message: 'No Authorization: Failed to authenticate user.' });
    }
    if (user){
      
      let accesstoken = user.dropbox_credentials.access_token
      try{
          //Function to upload to Dropbox
          const content = fs.readFileSync(req.body.localfile)
          let options = {
            method: "POST",
            url: 'https://content.dropboxapi.com/2/files/upload',
            headers: {
              "Content-Type": "application/octet-stream",
              "Authorization": "Bearer " + accesstoken,
              "Dropbox-API-Arg": "{\"path\": \"/"+req.body.foldername+"/"+req.body.localfile+"\",\"mode\": \"overwrite\",\"autorename\": true,\"mute\": false}",
            },
            body:content
          };
           //Make request to Dropbox to upload files
           async function requestPromise(options){
           await rp(options,(err,res,body) => {
            if (err){
              console.log(err)
          }
          else { 
            console.log(body);
            return res.status(200).json({status:"success", message:"File Successfully uploaded", data:body})
          }
           })
          }
     }catch(error){
      console.log(error)
      return next(new Error("Error uploading documents to Dropbox"));
       }
    }else return res.status(500).json({status:"error", message: 'No access token in DB' });
  })

}

//Create a folder
module.exports.createFolder = function (req, res, next){

 
  userConfig.findOne({user_id : req.body.user_id}, function (err, user){
    if(err){
      return res.status(500).json({status:"error", message: 'No Authorization: Failed to authenticate user.' });
    }
    if (user){
      
      const dfs   = require('dropbox-fs')({
      apiKey : user.dropbox_credentials.access_token});
          
      try{
          //Function to create a directory

        dfs.mkdir(req.body.foldername, (err, stat) => {
          if(err){
            console.log(err)
          }
 
        return res.status(200).json({status:"success", message:"Folder Successfully created", data:stat})
       });
     }catch(error){
         return next(new Error("Error creating folder on Dropbox"));
       }
    }else return res.status(500).json({status:"error", message: 'No access token in DB' });
  })
  
}

//delete a Folder
module.exports.deleteFolder = function (req, res, next){
 
  userConfig.findOne({user_id : req.body.user_id}, function (err, user){
    if(err){
      return res.status(500).json({status:"error", message: 'No Authorization: Failed to authenticate user.' });
    }
    if (user){
      
      const dfs   = require('dropbox-fs')({
      apiKey : user.dropbox_credentials.access_token});
          
      try{
          //Function to remove a directory

          dfs.rmdir(req.body.foldername, err => {
          if(err){
            console.log(err)
          }
 
        return res.status(200).json({status:"success", message:"Folder Successfully deleted", data:stat})
       });
     }catch(error){
         return next(new Error("Error deleting folder on Dropbox"));
       }
    }else return res.status(500).json({status:"error", message: 'No access token in DB' });
  })
  
}

//delete a file
module.exports.deleteFile = function(req,res, next){
  userConfig.findOne({user_id : req.body.user_id}, function (err, user){
    if(err){
      return res.status(500).json({status:"error", message: 'No Authorization: Failed to authenticate user.' });
    }
    if (user){
      
      const dfs   = require('dropbox-fs')({
      apiKey : user.dropbox_credentials.access_token});
          
      try{
          //Function to Unlink a file

          dfs.unlink(req.body.filepath, err => {
          if(err){
            console.log(err)
          }
 
        return res.status(200).json({status:"success", message:"File Successfully deleted", data:stat})
       });
     }catch(error){
         return next(new Error("Error deleting file on Dropbox"));
       }
    }else return res.status(500).json({status:"error", message: 'No access token in DB' });
  })
    

}