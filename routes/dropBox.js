const router = require("express").Router();
const dbxRoute = require('../controllers/dropbox/dropboxController')

//DropBox Routes
    router.get('/sync', dbxRoute.syncWithDropbox);

    router.get('/login', dbxRoute.dropboxLogin);

    router.get('/oauthredirect', dbxRoute.oauthredirect);

    router.get('/soauthredirect', dbxRoute.oauthredirect);

    router.get('/fileupload', dbxRoute.uploadfiles);

    router.post('/createfolder', dbxRoute.createFolder);

    router.delete('/deletefolder', dbxRoute.deleteFolder);

    router.delete('/deletefile', dbxRoute.deleteFile);

module.exports = router;