app.controller('mainCtrl',
  ['$scope'
  ,'$http'
  ,'paginationService'
  ,mainCtrl
  ]);

function mainCtrl($scope
                , $http
                , paginationService
                      ) {
  $scope.error = null;
  
  $scope.sortKey = 'name';
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
    $scope.getStuff();
  }
  
  // scope functions
  
  $scope.getStuff = function() {
    // reset results
    $scope.resultMap = {};
    $scope.resultArray = [];    
    
    var url = '/stuff/'+1;
    // get Stuff
    $http.get(url)
      .then(function(resp) {
        $scope.error = null;
//          console.log(resp);
        $scope.resultArray = resp.data;
      },
      function(resp) {
        $scope.error = resp.data;
      }
      );
    
  }

  
  this.init();
}