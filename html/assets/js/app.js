var app = angular.module('MyApp',
            ['ngRoute'
            ,'ngSanitize'
            ,'ui.bootstrap'
            // ,'angucomplete-alt'
            ,'angularUtils.directives.dirPagination'
            ]);

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/ng/main/template.html'
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