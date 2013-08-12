var thSchoolDashboardAppModule = angular.module('thSchoolDashboardAppModule',
  ['ui.bootstrap', 'ngMockE2E', 'ngResource', 'ui.compat', 'thConfigModule', 'thServerModule']);

//navbar (top menu)
thSchoolDashboardAppModule.controller('NavBarCtrl', function($scope, $state, appLoading) {
  $scope.navBarUrl = "navBar.html";
  $scope.menuItems = [
    { name: 'topMenuItem1', title: 'Top Menu Item 1' },
    { name: 'topMenuItem2', title: 'Top Menu Item 2' },
    { name: 'topMenuItem3', title: 'Top Menu Item 3' }
  ];
  $scope.$on('$stateChangeSuccess', function() {
    $scope.activeNavBarItem = $state.current.name.split('.', 1)[0];
  });
  $scope.$on('$stateChangeStart', function(){
    appLoading.loading();
  });
});

//states (routes) - ref: https://github.com/angular-ui/ui-router
thSchoolDashboardAppModule.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.when('', '/');
  $urlRouterProvider.when('/', '/topMenuItem1');
  $urlRouterProvider.when('/topMenuItem1', '/topMenuItem1/1/1');

  var topMenuItem1MainTemplateUrl = function (stateParams) {
    //stateParams.sectionId = stateParams.sectionId || 1;
    //stateParams.subSectionId = stateParams.subSectionId || 1;
    return 'school/partials/section' + stateParams.sectionId + 'pt' + stateParams.subSectionId + '.html';
  };
  $stateProvider
    .state('topMenuItem1', {
      url: '/topMenuItem1', templateUrl: 'school/menu.html', controller: 'SchoolMenuCtrl'
    })
    .state('topMenuItem1.main', {
      url: '/:sectionId/:subSectionId', templateUrl: topMenuItem1MainTemplateUrl, controller: 'SchoolCtrl'
    })
    .state('topMenuItem2', {
      url: '/topMenuItem2', templateUrl: 'school/partials/blank.html', controller: 'DummyCtrl'
    })
    .state('topMenuItem3', {
      url: '/topMenuItem3', templateUrl: 'school/partials/blank.html', controller: 'DummyCtrl'
    });
});

thSchoolDashboardAppModule.controller('DummyCtrl', function(appLoading) {
  appLoading.ready();
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