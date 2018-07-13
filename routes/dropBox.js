const router = require("express").Router();
const dbxRoute = require('../controllers/dropbox/dropboxController')



//DropBox Routes
    router.post('/sync', dbxRoute.syncWithDropbox);

    router.get('/sync', dbxRoute.syncWithDropbox);

    router.get('/login', dbxRoute.dropboxLogin);

    router.post('/getfiles', dbxRoute.retrieveFiles);

    //router.get('/regenerate', dbxRoute.regenerateSessionAsync);

    router.get('/oauthredirect', dbxRoute.oauthredirect);

    router.post('/fileupload', dbxRoute.uploadfiles);

    router.post('/createfolder', dbxRoute.createFolder);

    router.delete('/deletefolder', dbxRoute.deleteFolder);

    router.delete('/deletefile', dbxRoute.deleteFile);

module.exports = router;