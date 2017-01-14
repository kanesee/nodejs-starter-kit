var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression')
// var auth = require('./shared/auth');
var cpe = require('./routes/cpe');
var mvn = require('./routes/mvn');
var label = require('./routes/label');

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
app.get('/cpe/vendors/:vendor',
        cpe.getCPEVendors);
app.get('/cpe/vendor/:vendor/product/:product',
        cpe.getCPE);
app.post('/match/:unit',
        mvn.getMatches);
app.post('/entities/decorate',
        mvn.decorateEntities);
app.get('/labels/vendor/:vendor/product/:product',
        label.getLabels);
app.post('/label/:label/vendor/:vendor/product/:product/eid/:eid',
        label.setLabel);


/*************************
 * Start Server
 ************************/


var httpPort = 3333;

app.listen(httpPort);

console.log('Listening on port '+httpPort);

