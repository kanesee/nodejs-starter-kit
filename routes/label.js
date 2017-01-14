var mysql = require('mysql');
var db = require('../shared/db.js');


/*******************
 * REST API
 *******************/
exports.getLabels = function(req, res) {
  var vendor = req.params.vendor;
  var product = req.params.product;
//  console.log('getLabels');
//  console.log(vendor+' | '+product+' | '+eids);
  if( !vendor || !product ) {
    res.send({});
  } else {
    var sql = 'SELECT eid, label'
            + ' FROM depchk_mapping_labels'
            + ' WHERE vendor="'+vendor+'"'
            + ' AND product="'+product+'"'
            ;
    db.connection.query(sql, function(err, rows) {
      if( err ) {
        console.log('failed getLabels');
        console.error(err);
        console.log(sql);
        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      } else {
        var labels = [];
        for(var i=0; i<rows.length; i++) {
//          labels[rows[i].eid] = rows[i].label;
          labels.push(rows[i]);
        }

        res.send(labels);
      }
    });
  }
}


exports.setLabel = function(req, res) {
  var label = req.params.label;
  var vendor = req.params.vendor;
  var product = req.params.product;
  var eid = req.params.eid;
  var groupId = req.body.groupId;
  var artifactId = req.body.artifactId;
//  console.log('setLabels');
//  console.log(vendor+' | '+product+' | '+eids);
  if( !vendor || !product || !eid || !label ) {
//  if( !input.vendor || !input.product || !input.eid || !input.label) {
    var msg = 'setLabels: bad input';
    console.log(msg);
    res.writeHead(400, {'Content-Type':'text/plain'});
    res.end(msg);
  } else {
    var sql = 'INSERT INTO depchk_mapping_labels(eid,groupId,artifactid,vendor,product,label)'
            + ' VALUES(?,?,?,?,?,?)'
            + ' ON DUPLICATE KEY UPDATE label = ?'
            ;
    var inserts = [eid, groupId, artifactId, vendor, product, label, label];
    sql = mysql.format(sql, inserts);
    
    db.connection.query(sql, function(err, rows) {
      if( err ) {
        console.log('failed setLabels');
        console.error(err);
        console.log(sql);
        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      } else {
        res.send(label);
      }
    });
  }
}
