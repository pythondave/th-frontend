var thJobsAppModule = angular.module('thJobsAppModule', [
  'ui.bootstrap', 'ngResource', 'ui.router.compat', //external
  'ngMockE2E', 'thMockServerModule', //prototype only (comment out/remove this whole line in production)
  'thConfigModule', 'thGenericModule', 'filters' //local
]);

//states (routes) - ref: https://github.com/angular-ui/ui-router

angular.module('filters', []).
  filter('truncate', function () {
    //truncates a string to maxLength (without splitting a word), adding an ellipsis where necessary
    return function (s, maxLength, ellipsis) {
      maxLength = maxLength || 10;
      ellipsis = ellipsis || '...';

      if (s.length - ellipsis.length <= maxLength) return s;
      s = s.slice(0, maxLength-ellipsis.length);
      return s.slice(0, Math.min(s.length, s.lastIndexOf(' '))) + ellipsis;
    };
  });

thJobsAppModule.factory('initService', function ($http, $q, $qDecoratorService, configService) {
  //initService: code which is typically run only when the application is first loaded
  var o = {};
  $qDecoratorService.decorate($q);

  o.init = function() {
    //loads lists for the filters
    var getAndSetServerData = function() {
      var getJobsAppLists = function() {
        return $http.post(configService.requests.urls.jobsAppLists, undefined, configService.requests.postConfig);
      };
      var sortData = function(data) {
        data.subjects = _.sortBy(data.subjects, 'name');
        data.positions = _.sortBy(data.positions, 'name');
        data.locations = _.sortBy(data.locations, 'name');
        data.systems = _.sortBy(data.systems, 'system');
      };
      var setDataFromServer = function(response) {
        if (!response[0].data && configService.mode < 3) { return $q.delay(1000).then(o.init); }//no data and mock server being used, so wait and then try again to give time for mock json files to be loaded *** TODO: move this to within the mock server somehow
        var lists = response[0], data = lists.data;
        data.systems = data.academicSystems; //simpler alias, used throughout
        sortData(data);
        return { lists: lists };
      };
      return $q.all([getJobsAppLists()]).then(setDataFromServer);
    };
    return getAndSetServerData();
  };

  return o;
});

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
        'container-main': { templateUrl: 'partials/main.html', controller: 'Ctrl' }
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
