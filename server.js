var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression')
// var auth = require('./shared/auth');
var myroute = require('./routes/sampleroute');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

// app.use(auth.passport.initialize());
// app.use(auth.passport.session());
// the following line requires auth for OPTION which is bad for CORS
// app.use(auth.passport.authenticate('basic')); // protects pages themselves

/*********************************
 * Serve all other content under /html
 *********************************/
app.use(compression());
app.use(express.static(__dirname+'/html'));



/*************************
 * Route REST calls
 ************************/
// app.get('*', auth.passport.authenticate('basic', { session: false }))
app.get('/cpe/vendors/:stuffId',
        myroute.getStuff);


/*************************
 * Start Server
 ************************/


var httpPort = 3333;

app.listen(httpPort);

console.log('Listening on port '+httpPort);

