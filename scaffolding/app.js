var thDevelopmentDashboardApp = angular.module('thDevelopmentDashboardApp', [
  'ngResource', 'ui.router.compat', //external
  'ngMockE2E', 'thMockServerModule', //prototype only (comment out/remove this whole line in production)
  'thConfigModule', 'thGenericModule' //local
]);

thDevelopmentDashboardApp.filter('exists', function() { return function(list, propertyName) {
  return _.filter(list, function(item) { return item[propertyName] != ''; }); }
});

thDevelopmentDashboardApp.controller('MainCtrl', function($scope, init) {
  $scope.data = init.data;
});

thDevelopmentDashboardApp.config(function($stateProvider, $urlRouterProvider, configService) {
  $urlRouterProvider.otherwise(function ($stateParams) { //redirect if route is invalid
    if (configService.mode < 3) return '/';
    window.location.href = configService.requests.urls.invalidDevelopmentDashboardUrlRedirect;
  });

  var init = function(initService) {
    return initService.init();
  };

  var main = { name: 'main', url: '/', templateUrl: 'partials/development-dashboard.html', controller: 'MainCtrl',
    resolve: { modeReady: configService.setModeToDevIfDemoAndLocal, init: init } //ensures initial data is all loaded and ready to go before the app loads
  };
  $stateProvider.state(main);
});

thDevelopmentDashboardApp.factory('initService', function ($http, $q, $qDecoratorService, configService) {
  $qDecoratorService.decorate($q);

  var o = {};

  //standard server data request/response
  var handleError = function(reason) {
    window.location.href = 'error.html?reason=' + reason;
  };

  var requestServerData = function() { //queries which are dependent on other server data
    return $q.all([
      $http.post('development', {}, configService.requests.postConfig)
    ]);
  };

  var processServerResponse = function(response) {
    if (!response || !response[0] || !response[0].data) return $q.reject('no data');
    o.data = response[0].data;

    //decorate the response a little
    _(o.data.sprintUpdates.list).forEach(function(u) {
      u.sprint = parseFloat(u.sprint);
      u.update = parseFloat(u.update);
      u.id = u.sprint + u.update;
    })
  };

  var getAndSetServerData = function() {
    return requestServerData().then(processServerResponse).then(function() { return o; });
  };
  //

  o.init = function() {
    //returns a (promise of a) model
    var ms = (configService.mode < 3 ? 500 : 0);
    return $q.delay(ms).then(getAndSetServerData, handleError);
  };

  return o;
});
