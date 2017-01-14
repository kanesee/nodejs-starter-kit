 var db = require('../shared/db.js');


/*******************
 * REST API
 *******************/
exports.getCPEVendors = function(req, res) {
  var vendor = req.params.vendor;
  vendor = vendor.replace(/\\/g,'\\\\');
                     
  var sql = 'SELECT DISTINCT vendor'
          + ' FROM cpe'
          + ' WHERE vendor LIKE "'+vendor+'%"'
          ;
  db.connection.query(sql, function(err, rows) {
    if( err ) {
      console.log('failed getCPEVendors');
      console.error(err);
      console.log(sql);
      res.writeHead(500, {'Content-Type':'text/plain'});
      res.end(err);
    } else
    if( rows && rows.length ) {
      var vendors = {
        results: []
      };
      for(var i=0; i<rows.length; i++) {
        vendors.results.push(rows[i].vendor);
      }
      res.send(vendors);
    } else {
      res.send({});
    }
  });
}

exports.getCPE = function(req, res) {
  var vendor = req.params.vendor;
  vendor = vendor.replace(/\\/g,'\\\\');
  var product = req.params.product;
  product = product.replace(/\\/g,'\\\\');
                     
  var sql = 'SELECT *'
          + ' FROM cpe'
          + ' WHERE vendor ="'+vendor+'"'
          + ' AND product ="'+product+'"';
  db.connection.query(sql, function(err, rows) {
    if( err ) {
      console.log('failed getCPE');
      console.error(err);
      console.log(sql);
      res.writeHead(500, {'Content-Type':'text/plain'});
      res.end(err);
    } else
    if( rows && rows.length ) {
      var cpe ={
          identifiers: []
        , names: []
        , versions: []
        , urls: []
      };
      cpe.vendor = rows[0].vendor;
      cpe.product = rows[0].product;
      for(var i=0; i<rows.length; i++) {
        cpe.identifiers.push(rows[i].identifier);
        if( cpe.names.indexOf(rows[i].name) == -1 )
          cpe.names.push(rows[i].name);
        if( rows[i].version != '-' && cpe.versions.indexOf(rows[i].version) == -1 )
          cpe.versions.push(rows[i].version);
      }
      
      enrichWithUrls(res, cpe);
    } else {
      console.error(vendor+':'+product+' not found');
      res.writeHead(404, {'Content-Type':'text/plain'});
      res.end(vendor+':'+product+' not found');
    }
  });
}

function enrichWithUrls(res, cpe) {
  var sql = 'SELECT url'
          + ' FROM cpe_urls'
          + ' WHERE identifier in (';
  for(var i=0; i<cpe.identifiers.length; i++) {
    if( i>0 ) sql += ',';
    var id = cpe.identifiers[i].replace(/\\/g,'\\\\')
    sql += '"' + id + '"';
  }
  sql += ')';
  db.connection.query(sql, function(err, rows) {
    if( err ) {
      console.log('failed enrichWithUrls');
      console.error(err);
      console.log(sql);
      res.writeHead(500, {'Content-Type':'text/plain'});
      res.end(err);
    } else {
    
      if( rows && rows.length ) {
        for(var i=0; i<rows.length; i++) {
          if( cpe.urls.indexOf(rows[i].url) == -1 )
            cpe.urls.push(rows[i].url);
        }
      }

      res.send(cpe);
//      enrichWithMappings(res, result);
    }
  });
}

