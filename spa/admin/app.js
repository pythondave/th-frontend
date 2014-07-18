var thAdminDashboardAppModule = angular.module('thAdminDashboardAppModule', [
  'ui.bootstrap', 'ngResource', 'ui.router.compat', //external
  'ngMockE2E', 'thMockServerModule', //prototype only (comment out/remove this whole line in production)
  'thConfigModule', 'thContentItemsModule', 'thGenericModule' //local
]);

//navbar (top menu)
thAdminDashboardAppModule.controller('NavBarCtrl', function($scope, $state) {
  $scope.navBarUrl = "navBar.html";
  $scope.menuItems = [
    { name: 'teachers', title: 'Teachers' },
    { name: 'jobs', title: 'Jobs' },
    { name: 'applications', title: 'Applications' },
    //{ name: 'schools', title: 'Schools' },
    { name: 'settings', title: 'Settings' }
  ];
  $scope.$on('$stateChangeSuccess', function() {
    $scope.activeMenuItem = $state.current.name;
  });
});

//states (routes) - ref: https://github.com/angular-ui/ui-router
thAdminDashboardAppModule.config(function($stateProvider, configService) {
  $stateProvider
    .state('teachers', {
      url: '/teachers',
      views: {
        'container-left': { templateUrl: 'teachers/menu.html', controller: 'TeachersMenuCtrl' },
        'container-main': { templateUrl: 'teachers/default.html', controller: 'TeachersCtrl' }
      }
    })
    .state('jobs', {
      url: '/jobs',
      views: {
        'container-left': { templateUrl: 'jobs/menu.html', controller: 'JobsMenuCtrl' },
        'container-main': { templateUrl: 'jobs/default.html', controller: 'JobsCtrl' }
      }
    })
    .state('job', {
      url: '/jobs/:jobId',
      views: {
        'container-left': { templateUrl: 'jobs/job/menu.html', controller: 'JobMenuCtrl' },
        'container-main': { templateUrl: 'jobs/job/default.html', controller: 'JobCtrl' }
      }
    })
    .state('applications', {
      url: '/applications',
      views: {
        'container-left': { templateUrl: 'applications/menu.html', controller: 'ApplicationsMenuCtrl' },
        'container-main': { templateUrl: 'applications/default.html', controller: 'ApplicationsCtrl' }
      }
    })
    /*
    .state('schools', {
      url: '/schools',
      views: {
        'container-left': { templateUrl: 'schools/menu.html', controller: 'SchoolsMenuCtrl' },
        'container-main': { templateUrl: 'schools/default.html', controller: 'SchoolsCtrl' }
      }
    })
    */
    .state('school', {
      url: '/schools/:schoolId',
      views: {
        'container-left': { templateUrl: 'schools/school/menu.html', controller: 'SchoolMenuCtrl',
          resolve: { modeReady: configService.setModeToDevIfDemoAndLocal } },
        'container-main': { templateUrl: 'schools/school/default.html', controller: 'SchoolCtrl' }
      }
    })
    .state('settings', {
      url: '/settings',
      views: {
        'container-left': { templateUrl: 'settings/menu.html', controller: 'SettingsMenuCtrl' },
        'container-main': { templateUrl: 'settings/default.html', controller: 'SettingsCtrl' }
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
