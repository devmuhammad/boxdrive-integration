const app             = require('express')()
      ,mongoose       = require('mongoose')
      ,config         = require('./CONFIG')
      ,dbConfig       = require('./CONFIG/database.config')
      ,bodyParser     = require('body-parser')
      ,morgan         = require('morgan')
      ,fs             = require('fs')
      ,path           = require('path')
      ,Routes         = require('./routes')
      ,crypto         = require('crypto')
      ,cors           = require('cors')
      ,session        = require('express-session')

// //Apply middleware

  // app.use(cookieParser('keyboard cat'));


// parse request to JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
  keepAlive: true,
  reconnectTries: 30,
})
.then(() => {
  console.log("DB connection succesfull.");
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...');
  process.exit();
});


//monitor DB connection    
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', () => { console.log(`Connected to db at ${dbConfig.url}`); }); 

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
    //   credentials: true
  };
  app.use(cors(corsOptions))


// Routes
//app.use("/cabsol/google", Routes.googleRouter);
app.use("/cabsol/dropbox", Routes.dropboxRouter);


app.listen(config.app.port);
console.log("App running on port "+config.app.port);
