/**
 * Created by Tina on 6/10/17.
 */


var cookieSession = require('cookie-session')
var express = require('express')
var cookieParser = require('cookie-parser');
var app = express();
var config = require('./config.json');
 
app.use(cookieSession({
  name: 'session',
  keys: [config.session_secret],
  // Cookie Options 
  maxAge: 15 * 60 * 1000 // 15 minutes
}))

app.set('port', process.env.PORT || 3000);
// routes will have access to it by req.app.get('appData')

// Set up view engines
app.set('view engine', 'ejs');
app.set('views', 'app/views');

// Add cookie parsing functionality
app.use(cookieParser());


// Set up all the routes
app.use(require('./routes/login'));
app.use(require('./routes/user'));
app.use(require('./routes/product'));

app.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port'));
});

app.get('/health', function(req, res){
    res.send({"message": "Instance is alive"});
});

/*
DEVELOPER NOTES:
- after install Nodemon, run the app using "upm start" instead of "node app"
- do npm init to create the package.json in the new app folder
 */
