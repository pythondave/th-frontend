var thAdminDashboardAppModule = angular.module('thAdminDashboardAppModule', [
  'ui.bootstrap', 'ngResource', 'ui.router.compat', //external
  'ngMockE2E', 'thMockServerModule', //prototype only (comment out/remove this whole line in production)
  'thConfigModule', 'thContentItemsModule', 'thGenericModule' //local
]);

//states (routes) - ref: https://github.com/angular-ui/ui-router
thAdminDashboardAppModule.config(function($stateProvider, $urlRouterProvider, configService) {

  $urlRouterProvider.otherwise(function () { return '/'; });

  var wip1 = function($location) {
    console.log('params:', $location.search());
  };

  $stateProvider
    .state('jobs', {
      url: '/?subject&position',
      resolve: { wip1: wip1 },
      views: {
        'container-left': { templateUrl: 'jobs/menu.html', controller: 'JobsMenuCtrl' },
        'container-main': { templateUrl: 'jobs/default.html', controller: 'JobsCtrl' }
      }
    });
});

//configure $httpProvider
thAdminDashboardAppModule.config(function($httpProvider) {
  $httpProvider.defaults.transformRequest = function(data) { //see https://github.com/pythondave/th-admin/issues/11
    var actualRequestData = (data === undefined ? undefined : $.param(data));
    return actualRequestData;
  };

  $httpProvider.responseInterceptors.push(function($timeout, $q, configService) {
    return function(promise) {
      return promise.then(function(successResponse) {
        return successResponse;
      }, function(errorResponse, b, c) {
        if (errorResponse && errorResponse.status === 401) {
          document.location.href = configService.loginUrl;
        }
        return $q.reject(errorResponse);
      });
    };
  });
});

// keyboard events
thAdminDashboardAppModule.controller('KeyboardEventCtrl', function($scope, $state) {
  var ctrlIsDown, altIsDown;
  $scope.$on('keydown', function(e, keyCode) {
    if (keyCode === 17) ctrlIsDown = true;
    if (keyCode === 18) altIsDown = true;
    if (ctrlIsDown && altIsDown) {
      if (keyCode == 49 || keyCode == 84) { $state.transitionTo('teachers'); } //1 or t
      if (keyCode == 50 || keyCode == 74) { $state.transitionTo('jobs'); } //2 or j
      if (keyCode == 51 || keyCode == 65) { $state.transitionTo('applications'); } //3 or a
    }
  });
  $scope.$on('keyup', function(e, keyCode) {
    if (keyCode === 17) ctrlIsDown = false;
    if (keyCode === 18) altIsDown = false;
  });
});
