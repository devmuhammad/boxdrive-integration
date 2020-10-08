const config = require('../config')
      ,Dropbox = require('dropbox').Dropbox;
            //    require('isomorphic-fetch');


 module.exports = {
        DBX_API_DOMAIN: 'https://api.dropboxapi.com',
        DBX_OAUTH_DOMAIN: 'https://www.dropbox.com',
        DBX_OAUTH_PATH: '/oauth2/authorize',
        DBX_TOKEN_PATH: '/oauth2/token',
        DBX_APP_KEY: config.dropbox.appkey,
        DBX_ACCESS_TOKEN: config.dropbox.accesstoken,
        DBX_APP_SECRET: config.dropbox.appsecret, 
        OAUTH_REDIRECT_URL:"http://localhost:8090/cabsol/dropbox/oauthredirect",
        OAUTH_sREDIRECT_URL:"http://localhost:8090/cabsol/dropbox/soauthredirect",
        DBX_LIST_FOLDER_PATH:'/2/files/list_folder',
        DBX_LIST_FOLDER_CONTINUE_PATH:'/2/files/list_folder/continue',
        DBX_GET_TEMPORARY_LINK_PATH:'/2/files/get_temporary_link',
        DBX_UPLOAD_FILES:'/2/files/upload',
        SESSION_ID_SECRET:'com12-acuity-drive',
     }







dropbox: {
    appkey: 'aot6dtkqo5lwpqf',
    appsecret: 'whhgt9elc95qa12',
    accesstoken: 'Kg5cBu5JYKAAAAAAAAAASO2epXMNnV2RiZCmYS9rUZyGXbl5OLDN-wBOai3DrwXZ',
    SESSION_ID_SECRET:'com12-acuity-drive',
  }
