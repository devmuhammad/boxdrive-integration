const app             = require('express')()
      ,config         = require('./CONFIG')
      ,bodyParser     = require('body-parser')
      ,morgan         = require('morgan')
      ,fs             = require('fs')
      ,path           = require('path')
      ,Routes         = require('./routes')
      ,crypto         = require('crypto')
      ,cors           = require('cors')
      ,session        = require('express-session')
      ,redis          = require('redis');
      client          = redis.createClient();
      

// parse request to JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  


// log all http requests
let httpLogStream = fs.createWriteStream(path.join(__dirname, 'httplogs.log'), {flags: 'a'})    
app.use(morgan('combined', {stream: httpLogStream}));
 
//whitelist using cors
var whitelist = [
      'http://localhost:8080',
  ];
  var corsOptions = {
      origin: function(origin, callback){
          var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
          callback(null, originIsWhitelisted);
      },
      credentials: true
  };
  app.use(cors(corsOptions))

//initialize session
var sess = {
      secret: config.dropbox.SESSION_ID_SECRET,
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

//Apply middleware
app.use(['/cabsol/dropbox'],session(sess));
// Routes
//app.use("/cabsol/google", Routes.googleRouter);
app.use("/cabsol/dropbox", Routes.dropboxRouter);


app.listen(config.app.port);
console.log("App running on port "+config.app.port);
