var thJobsAppModule = angular.module('thJobsAppModule', [
  'ui.bootstrap', 'ngResource', 'ui.router.compat', //external
  'ngMockE2E', 'thMockServerModule', //prototype only (comment out/remove this whole line in production)
  'thConfigModule', 'thGenericModule' //local
]);

//states (routes) - ref: https://github.com/angular-ui/ui-router
thJobsAppModule.config(function($stateProvider, $urlRouterProvider, configService) {
  $urlRouterProvider.otherwise(function () { return '/'; });

  var init = function(initService) {
    return initService.init();
  };

  $stateProvider
    .state('jobs', {
      abstract: true,
      resolve: { init: init },
      views: {
        'container-left': { templateUrl: 'partials/menu.html', controller: 'MenuCtrl' },
        'container-main': { templateUrl: 'partials/main.html', controller: 'MainCtrl' }
      }
    })
    .state('jobs.query', {
      url: '/?subject&position&location&system&start'
    });
});

//configure $httpProvider
thJobsAppModule.config(function($httpProvider) {
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
