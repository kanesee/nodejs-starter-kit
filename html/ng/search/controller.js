app.controller('searchCtrl',
  ['$scope'
  ,'$http'
  ,'paginationService'
  ,searchCtrl
  ]);

function searchCtrl($scope
                  , $http
                  , paginationService
                      ) {
  $scope.error = null;
  $scope.cpeIdentifier = null;
  $scope.cpeVendor = 'apache';
  $scope.cpeProduct = '';
  $scope.cpe = null;
  $scope.resultMap = null;
  $scope.resultArray = null;
  $scope.showScores = true;
  
  $scope.sortKey = 'total_score';
  $scope.reverse = true;  
  $scope.sort = function(sortBy) {
    if( sortBy != $scope.sortKey ) {
      $scope.sortKey = sortBy;
    } else {
      $scope.reverse = !$scope.reverse;
    }
  }
  
  $scope.gotoPage = function(page) {
    paginationService.setCurrentPage('__default', page);
  }
  
  // private vars
  var self = this;
  
  // private functions
  this.init = function() {
    $scope.$watch('cpeIdentifier', function(newVal, oldVal) {
//      console.log(newVal);
      if( newVal ) {
        var cpeParts = newVal.split(':');
        if( cpeParts.length >= 5 ) {
          $scope.cpeVendor = cpeParts[3];
          $scope.cpeProduct = cpeParts[4];
        }
      }
    });
    
    $scope.$watch('pagedEntities', function(newVal, oldVal) {
      if( $scope.pagedEntities ) {
        var newEids = [];
        for(var i=0; i < $scope.pagedEntities.length; i++) {
          newEids.push($scope.pagedEntities[i].eid);
        }
        $scope.decorateRows(newEids);
      }
    });
  }
  
  // scope functions
  
  $scope.completeVendor = function() {
//    console.log($scope.cpeVendor);
    var vendor = $scope.cpeVendor; // make a copy
    if( vendor && vendor.length > 3 ) {
      $http.get('/cpe/vendor/'+encodeURIComponent(vendor))
        .then(function(resp) {
          $scope.vendorList = resp.data;
        });
    }
  }
  
  $scope.getCPE = function() {
    // reset results
    $scope.resultMap = {};
    $scope.resultArray = [];    
    
    var resourceId = '/vendor/'+encodeURIComponent($scope.cpeVendor)
                   + '/product/'+encodeURIComponent($scope.cpeProduct);
    // get CPE
    $http.get('/cpe'+resourceId)
      .then(
        function(resp) {
          $scope.error = null;
//          console.log(resp);
          $scope.cpe = resp.data;
          $scope.cpeVendor = $scope.cpe.vendor;
          $scope.cpeProduct = $scope.cpe.product;
          
          $scope.search($scope.cpe);
        },
        function(resp) {
          $scope.error = resp.data;
        }
      );
    
    // get CPE labels
    $http.get('/labels'+resourceId)
      .then(
        function(resp) {
//          console.log(resp.data);
          var labels = resp.data;
          for(var i=0; i<labels.length; i++) {
            self.addEntity(labels[i]);
          }
        }
      );    
  }
  
  this.addEntity = function(newRow) {
    var row = $scope.resultMap[newRow.eid];
    if( !row ) {
      row = newRow;
      $scope.resultMap[newRow.eid] = row;
      $scope.resultArray.push(row);
    } else {
      angular.extend(row, newRow);
    }
    return row;
  }
  
  $scope.search = function(cpe) {
    
    for(var key in cpe) {
//      console.log(key);
//      console.log(cpe[key]);
      var url = '/match/'+key;
      $http.post(url, cpe)
        .then(
          function(resp) {
            if( resp.data && resp.data.length ) {
//              console.log(resp.data);
              
              for(var i=0; i<resp.data.length; i++) {
                var row = self.addEntity(resp.data[i]);
                $scope.evaluateScores(row);
              }
              
//              console.log($scope.resultArray);
            }
          },
          function(resp) {
            $scope.error = resp.data;
          }
        );
    }
  }
  
  $scope.decorateRows = function(eids) {
    if( eids.length ) {
      $http.post('/entities/decorate', eids)
        .then(
          function(resp) {
            if( resp.data ) {
//              console.log(resp.data);

              for(var eid in resp.data) {
                var entity = resp.data[eid];
                var row = $scope.resultMap[eid];
                angular.extend(row, entity);
//                console.log(row);
              }

//              console.log($scope.result);
            }            
          },
          function(resp) {
            $scope.error = resp.data;
          }
        );
    }
  }
  
  $scope.evaluateScores = function(row) {
//    console.log(row);
    var total = 0;
    for(var key in row) {
      if( key.indexOf('score_') == 0 ) {
//        console.log(key + ': ' + row[key]);
        var weight = 1.0;
        if( key == 'score_names' ) {
          weight = 0;
        }
        total += weight*row[key];
      }
    }
    row.total_score = total;
  }
  
  $scope.label = function(label, eid, identifiers) {
//    console.log(eid + ': ' + label);
    var url = '/label/'+label
            + '/vendor/'+encodeURIComponent($scope.cpeVendor)
            + '/product/'+encodeURIComponent($scope.cpeProduct)
            + '/eid/'+eid
            ;
    var gav = {};
    if( identifiers && identifiers.length > 0 ) {
      var id = identifiers[0].split(':');
      gav.groupId = self.htmlToPlaintext(id[0]);
      gav.artifactId = self.htmlToPlaintext(id[1]);
    }
    $http.post(url, gav)
      .then(function(resp) {
        console.log(resp);
      });
  }
  
  
  this.htmlToPlaintext = function(text) {
    return text ? String(text).replace(/<[^>]+>/gm, '') : '';
  }  
  
  this.init();
}