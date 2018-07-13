const  crypto         = require('crypto')
      ,session        = require('express-session')
      ,redis          = require('redis');
      client          = redis.createClient();


//initialize session
var sess = {
    secret: config.SESSION_ID_SECRET,
    cookie: {}, //add empty cookie to the session by default
    resave: false,
    saveUninitialized: true,
    genid: (req) => {
            return crypto.randomBytes(16).toString('hex');;
          },
    store: new (require('express-sessions'))({
        storage: 'redis',
        instance: client, // optional 
        collection: 'sessions' // optional 
    })
}
exports.middleware = {
    session(sess);
}