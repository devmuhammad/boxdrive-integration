const app             = require('express')()
      ,CONFIG         = require('./CONFIG')
      ,bodyParser     = require('body-parser')
      ,morgan         = require('morgan')
      ,fs             = require('fs')
      ,path           = require('path');

// parse request to JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  


// log all http requests
let httpLogStream = fs.createWriteStream(path.join(__dirname, 'httplogs.log'), {flags: 'a'})    
app.use(morgan('combined', {stream: httpLogStream}));
 

//Apply middleware
app.use()
// Routes
app.use("/cabsol/google", googleRouter);
app.use("/cabsol/dropbox", dropboxRouter);


app.listen(config.app.port);
console.log("App running on port "+config.app.port);
