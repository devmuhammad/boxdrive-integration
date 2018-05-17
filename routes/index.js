const dbxroute      = require('./dropBox')
     ,google        = require('./googleDrive');

module.exports = {
    dropboxRouter: dbxroute,
    googleRouter: google
}