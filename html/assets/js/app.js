var app = angular.module('thirdwatch.assetmapping',
            ['ngRoute'
            ,'ngSanitize'
            ,'ui.bootstrap'
            // ,'angucomplete-alt'
            ,'angularUtils.directives.dirPagination'
            ,'dirTdEntityValues'
            ]);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/ng/search/template.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
]);

app.directive('repeatDone', function() {
  return function(scope, element, attrs) {
    if (scope.$last) { // all are rendered
      scope.$eval(attrs.repeatDone);
    }
  }
});

app.filter("emptyToEnd", function () {
    return function (array, key) {
        if(!angular.isArray(array)) return;
        var present = array.filter(function (item) {
            return item[key];
        });
        var empty = array.filter(function (item) {
            return !item[key]
        });
        return present.concat(empty);
    };
});