var thSchoolDashboardAppModule = angular.module('thSchoolDashboardAppModule',
  ['ui.bootstrap', 'ngMockE2E', 'ngResource', 'ui.router.compat', //external
   'thConfigModule', 'thServerModule', 'thContentItemsModule', //local
   'thShowcaseModule' //local, prototype only
  ]);

//states (routes) - ref: https://github.com/angular-ui/ui-router
thSchoolDashboardAppModule.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when('/default.html', '/');
  $urlRouterProvider.when('', '/');
  $urlRouterProvider.when('/', '/1');
  $urlRouterProvider.when('/1', '/1/1/1');
  $urlRouterProvider.when('/2', '/2/1/1');

  var structure;
  var getStructure = function(initService) {
    structure = structure || initService.init();
    return structure;
  };

  $stateProvider
    .state('level1', {
      url: '/:level1', templateUrl: 'partials/level1.html', controller: 'Level1Controller',
      resolve: { structure: getStructure } //ensures initial data is all to go ready before the page loads
    })
    .state('level1.level2', { //*** TODO: level 2 menu is reloading on change within it - see if I can rework this
      url: '/:level2', templateUrl: 'partials/level2.html', controller: 'Level2Controller'
    })
    .state('level1.level2.level3', {
      url: '/:level3', templateUrl: 'partials/level3.html', controller: 'Level3Controller'
    });
});

//configure $httpProvider
thSchoolDashboardAppModule.config(function($httpProvider) {
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

thSchoolDashboardAppModule.factory('appLoading', function($rootScope) {
  //ref: http://yearofmoo-articles.github.io/angularjs-animation-article/app/#
  var timer;
  return {
    loading : function() {
      clearTimeout(timer);
      $rootScope.status = 'loading';
      if(!$rootScope.$$phase) $rootScope.$apply();
    },
    ready : function(delay) {
      function ready() {
        $rootScope.status = 'ready';
        if(!$rootScope.$$phase) $rootScope.$apply();
      }

      clearTimeout(timer);
      delay = delay === null ? 400 : false;
      if(delay) {
        timer = setTimeout(ready, delay);
      }
      else {
        ready();
      }
    }
  };
});