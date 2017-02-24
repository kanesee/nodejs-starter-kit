// var db = require('../shared/db.js');
var dbp = require('../shared/db-promise.js');


/*******************
 * REST API
 *******************/
exports.getStuff = function(req, res) {
  var resultArray = ['keys','phone','wallet','watch'];
  res.send(resultArray);
}

exports.getStuffFromDb = function(req, res) {
  var stuffId = req.params.stuffid;
                     
  var sql = 'SELECT item'
          + ' FROM stuff'
          + ' WHERE id = ?'
          ;
  dbp.pool.query(sql, [stuffId])
    .then(function(rows) {
      if( rows && rows.length ) {
        var stuff = [];
        for(var i=0; i<rows.length; i++) {
          stuff.push(rows[i].name);
        }
        res.send(stuff);
      } else {
        res.send({});
      }
    })
    .catch(function(err) {
      console.log('failed getCPEVendors');
      console.error(err);
      console.log(sql);
      res.writeHead(500, {'Content-Type':'text/plain'});
      res.end(err);
    });
}


