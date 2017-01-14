angular.module('dirTdEntityValues', [])
  .directive('tdEntityValues', function() {
    return {
      restrict: 'E',
      templateUrl: 'ng/dirTdEntityValues/template.html',
      scope: {values: '=data'},
      controller: function($scope) {
        
        $scope.showAll = false;
        
        this.init = function() {
//          console.log('initializing <td-entity-values>');
        };
        
        this.init();
      }
    };
  });