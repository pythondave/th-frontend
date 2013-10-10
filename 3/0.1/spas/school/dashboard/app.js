var thSchoolDashboardAppModule = angular.module('thSchoolDashboardAppModule', [
  'ui.bootstrap', 'ngResource', 'ui.router.compat', //external
  'ngMockE2E', 'thMockServerModule', //prototype only (comment out/remove this whole line in production)
  'thConfigModule', 'thContentItemsModule', 'thGenericModule' //local
]);

/*
  thSchoolDashboardAppModule
    * The top-level module of the app
*/

//states (routes) - ref: https://github.com/angular-ui/ui-router
thSchoolDashboardAppModule.config(function($stateProvider, $urlRouterProvider, configService) {
  //routes are of the form: '#/{schoolId}/{level1}/{level2}/{level3}'
  //  where... levelX is for html which needs to be reloaded when the levelX parameter changes

  //force to 4 parameters if it has fewer
  $urlRouterProvider.when('/{schoolId}', '/{schoolId}/1/1/1');
  $urlRouterProvider.when('/{schoolId}/{level1}', '/{schoolId}/{level1}/1/1');
  $urlRouterProvider.when('/{schoolId}/{level1}/{level2}', '/{schoolId}/{level1}/{level2}/1');
  $urlRouterProvider.otherwise(function ($stateParams) { //redirect if route is invalid
    if (configService.mode < 3) return '/101/1/1/1';
    window.location.href = configService.requests.urls.invalidSchoolDashboardUrlRedirect;
  });

  var getStructure = function(initService, $stateParams) {
    return initService.init($stateParams.schoolId);
  };

  var setStructureHierarchy = function(structure, $stateParams) {
    structure.hierarchy.select($stateParams);
  };

  var school = { name: 'school', url: '/{schoolId:[0-9]{1,6}}', templateUrl: 'partials/school.html', controller: 'SchoolController',
    resolve: { modeReady: configService.setModeToDevIfDemoAndLocal, structure: getStructure } //ensures initial data is all loaded and ready to go before the app loads
  };
  var level1 = { name: 'level1', url: '/{level1:[0-9]}', parent: school, templateUrl: 'partials/level1.html', controller: 'Level1Controller' };
  var level2 = { name: 'level2', url: '/{level2:[0-9]}', parent: level1, templateUrl: 'partials/level2.html', controller: 'Level2Controller' };
  var level3 = { name: 'level3', url: '/{level3:[0-9]{1,2}}', parent: level2, templateUrl: 'partials/level3.html', controller: 'Level3Controller',
    resolve: { ready: setStructureHierarchy } //ensures structure hierarchy is ready to go
  };

  $stateProvider.state(school).state(level1).state(level2).state(level3);
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