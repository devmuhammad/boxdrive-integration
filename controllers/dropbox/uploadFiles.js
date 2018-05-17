const 
     rp             = require('request-promise')
    ,dbxService     = require('../../services/dropBoxService')
    ,dfs            = require('dropbox-fs')({
                    apiKey: dbxService.DBX_APP_KEY,
                    client: dbxService.DBX_APP_SECRET
    });
    

    
module.exports = {

    fileUpload: async function(token,content){
        let options={
            url: dbxService.DBX_API_DOMAIN + dbxService.DBX_UPLOAD_FILES,
            overwrite: true, 
            headers:{"Authorization":"Bearer "+token, 'Content-Type': 'text/plain'},
            method: 'PUT',
            json: true ,
            body: {"content":content}
          }
          try{
            //Make request to Dropbox to upload files
            let result = await rp(options)
            // function optionalCallback(err, httpResponse, bodymsg)
            if (result.err){
                console.log(err)
            }else
            { 
                console.log(result.bodymsg);
            }
          }catch(error){
            return next(new Error('error uploading document. '+error.message));
          }        


    }



}