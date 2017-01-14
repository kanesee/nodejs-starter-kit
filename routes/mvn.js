 var db = require('../shared/db.js');


/*******************
 * REST API
 *******************/
var mappingFn = {
    vendor: matchVendor
  , product: matchProduct
  , names: matchNames
  , versions: matchVersions
  , urls: matchUrls
}

exports.getMatches = function(req, res) {
  var unit = req.params.unit;
  var cpe = req.body;
  
  var mapFn = mappingFn[unit];
  if( mapFn ) {
    console.log('mapping via ' + unit);
    mapFn(res, cpe)
  } else {  
  
    res.send({});
  }
}

/************************************************
 * Decorate Entity
 ************************************************/
exports.decorateEntities = function(req, res) {
  var eids = req.body;
  if( !eids || !eids.length ) {
    res.send({});
  } else {
  
    var sql = 'SELECT *'
            + ' FROM mvn'
            + ' WHERE eid in (';
    for(var i=0; i<eids.length; i++) {
      if( i>0 ) sql += ',';
      sql += eids[i];
    }
    sql += ')';
    db.connection.query(sql, function(err, rows) {
      if( err ) {
        console.log('failed decorateEntities');
        console.error(err);
        console.log(sql);
        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      } else
      if( rows && rows.length ) {
        var entities = {};
        for(var i=0; i<rows.length; i++) {
          var entity = entities[rows[i].eid];
          if( !entity ) {
            entity = {
                eid: rows[i].eid
              , usage: rows[i].usage
              , stargazers_count: rows[i].stargazers_count
              , watchers_count: rows[i].watchers_count
              , forks_count: rows[i].forks_count
  //            , vendors: []
  //            , products: [],

              , identifiers: []
              , names: []
              , descs: []
              , urls: []
              , logos: []
              , versions: []
            };
            entities[rows[i].eid] = entity;
          }

          addIfNotExist(entity.identifiers,
                        '<span class="groupId">'+rows[i].groupId+'</span>'
                        +':'
                        +'<span class="artifactId">'+rows[i].artifactId+'</span>'
                       );
          addIfNotExist(entity.names, rows[i].name);
          entity.usage = keepMax(entity.usage, rows[i].usage);
          entity.stargazers_count = keepMax(entity.stargazers_count, rows[i].stargazers_count);
          entity.watchers_count = keepMax(entity.watchers_count, rows[i].watchers_count);
          entity.forks_count = keepMax(entity.forks_count, rows[i].forks_count);
          addIfNotExist(entity.descs, rows[i].desc);
          addIfNotExist(entity.urls, rows[i].url);
          addIfNotExist(entity.logos, rows[i].logo);
          addIfNotExist(entity.versions, rows[i].version);

        }

        res.send(entities);
      } else {
        var msg = 'eid '+eid+' not found';
        console.error(msg);
        res.writeHead(404, {'Content-Type':'text/plain'});
        res.end(msg);
      }
    });
  }
}
                      
function addIfNotExist(array, val) {
  if( val && array.indexOf(val) == -1 ) {
    array.push(val);
  }
}

function keepMax(val1, val2) {
  if(val1 == null) {
    val1 = 0;
  }
  if(val2 == null) {
    val2 = 0;
  }
  var max = 0;
  if(val1 > val2) {
    max = val1;
  } else if (val2 >= val1) {
    max = val2;
  }
  return max;
}


/*********************************************
 * Blocking/Scoring functions
 *********************************************/
function matchVendor(res, cpe) {
  var sql =
      'SELECT DISTINCT eid'
//    + ', groupId AS val'
    + ', MATCH(groupId) AGAINST ("'+cpe.vendor+'" IN NATURAL LANGUAGE MODE) AS score'
    + ' FROM mvn'
    + ' WHERE MATCH(groupId) AGAINST ("'+cpe.vendor+'" IN NATURAL LANGUAGE MODE)'
      ;
  console.log(sql);
  db.connection.query(sql, function(err, rows) {
    if( err ) {
      console.log('failed matchVendor');
      console.error(err);
      console.log(sql);
      res.writeHead(500, {'Content-Type':'text/plain'});
      res.end(err);
    } else {
    
      var mappings = [];
      
      if( rows && rows.length ) {
        for(var i=0; i<rows.length; i++) {
          var mapping = {
              eid: rows[i].eid
            , score_vendor: rows[i].score
          }
          mappings.push(mapping);
//          mappings.push(rows[i]);
        }
      }

      res.send(mappings);
    }
  });
}

function matchProduct(res, cpe) {
  var sql =
      'SELECT DISTINCT eid'
//    + ', artifactId AS val'
    + ', MATCH(artifactId) AGAINST ("'+cpe.product+'" IN NATURAL LANGUAGE MODE) AS score'
    + ' FROM mvn'
    + ' WHERE MATCH(artifactId) AGAINST ("'+cpe.product+'" IN NATURAL LANGUAGE MODE)'
      ;
  console.log(sql);
  db.connection.query(sql, function(err, rows) {
    if( err ) {
      console.log('failed matchProduct');
      console.error(err);
      console.log(sql);
      res.writeHead(500, {'Content-Type':'text/plain'});
      res.end(err);
    } else {
    
      var mappings = [];
      
      if( rows && rows.length ) {
        for(var i=0; i<rows.length; i++) {
          var mapping = {
              eid: rows[i].eid
            , score_product: rows[i].score
          }
          mappings.push(mapping);
        }
      }

      res.send(mappings);
    }
  });
}

function matchNames(res, cpe) {
  if( !cpe.names || cpe.names.length == 0 ) {
    res.send({});
  } else {
  
    var consolidatedNames = '';
    for(var i=0; i<cpe.names.length; i++) {
      consolidatedNames += cpe.names[i] + ' ';
    }
    var sql =
        'SELECT DISTINCT eid'
  //    + ', artifactId AS val'
      + ', MATCH(name) AGAINST ("'+consolidatedNames+'" IN NATURAL LANGUAGE MODE) AS score'
      + ' FROM mvn'
      + ' WHERE MATCH(name) AGAINST ("'+consolidatedNames+'" IN NATURAL LANGUAGE MODE)'
        ;
    console.log(sql);
    db.connection.query(sql, function(err, rows) {
      if( err ) {
        console.log('failed matchTitles');
        console.error(err);
        console.log(sql);
        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      } else {

        var mappings = [];

        if( rows && rows.length ) {
          for(var i=0; i<rows.length; i++) {
            var mapping = {
                eid: rows[i].eid
              , score_names: rows[i].score
            }
            mappings.push(mapping);
          }
        }

        res.send(mappings);
      }
    });
  }
}

function matchVersions(res, cpe) {
  if( !cpe.versions || cpe.versions.length == 0 ) {
    res.send({});
  } else {
    var sql = 'SELECT eid, count(*) as overlap'
            + ' FROM mvn'
            + ' WHERE version in (';
    for(var i=0; i<cpe.versions.length; i++) {
      if( i>0 ) sql += ',';
      sql += '"' + cpe.versions[i] + '"';
    }
    sql += ')'
        + ' group by eid';
    console.log(sql);
    db.connection.query(sql, function(err, rows) {
      if( err ) {
        console.log('failed matchVersions');
        console.error(err);
        console.log(sql);
        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      } else {

        var mappings = [];

        if( rows && rows.length ) {
          for(var i=0; i<rows.length; i++) {
            var mapping = {
                eid: rows[i].eid
              , score_versions: rows[i].overlap
            }
            mappings.push(mapping);
          }
        }

        res.send(mappings);
      }
    });
  }
}

function matchUrls(res, cpe) {
  if( !cpe.urls || cpe.urls.length == 0 ) {
    res.send({});
  } else {
  
    var sql = 'SELECT eid, count(*) as overlap'
            + ' FROM mvn'
            + ' WHERE url in (';
    for(var i=0; i<cpe.urls.length; i++) {
      if( i>0 ) sql += ',';
      sql += '"' + cpe.urls[i] + '"';
    }
    sql += ')'
        + ' group by eid';
    console.log(sql);
    db.connection.query(sql, function(err, rows) {
      if( err ) {
        console.log('failed matchUrls');
        console.error(err);
        console.log(sql);
        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      } else {

        var mappings = [];

        if( rows && rows.length ) {
          for(var i=0; i<rows.length; i++) {
            var mapping = {
                eid: rows[i].eid
              , score_urls: rows[i].overlap
            }
            mappings.push(mapping);
          }
        }

        res.send(mappings);
      }
    });
  }
}