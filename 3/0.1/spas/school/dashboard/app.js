var thSchoolDashboardAppModule = angular.module('thSchoolDashboardAppModule',
  ['ui.bootstrap', 'ngMockE2E', 'ngResource', 'ui.router.compat', 'thConfigModule', 'thServerModule']);

//navbar (top menu)
thSchoolDashboardAppModule.controller('NavBarCtrl', function($scope, $state, structureService, appLoading) {
  $scope.navBarUrl = 'partials/nav-bar.html';
  $scope.sections = structureService.sections;
  $scope.$on('$stateChangeStart', function(){
    appLoading.loading();
  });
  $scope.$on('$stateChangeSuccess', function() {
    structureService.hierarchy.select($state.params);
  });
});

//states (routes) - ref: https://github.com/angular-ui/ui-router
thSchoolDashboardAppModule.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.when('/default.html', '/');
  $urlRouterProvider.when('', '/');
  $urlRouterProvider.when('/', '/1');
  $urlRouterProvider.when('/1', '/1/1/1');
  $urlRouterProvider.when('/2', '/2/1/1');

  $stateProvider
    .state('level1', {
      url: '/:level1', templateUrl: 'partials/section.html', resolve: { }, controller: 'Level1Controller'
    })
    .state('level1.main', {
      url: '/:level2/:level3', templateUrl: 'partials/content-items.html', controller: 'PageCtrl'
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