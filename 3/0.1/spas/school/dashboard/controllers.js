/*
  SchoolController
  Level1Controller
  Level2Controller
  Level3Controller
  TransitionWarningController
*/

//SchoolController
thSchoolDashboardAppModule.controller('SchoolController', function($rootScope, $scope, $state, appLoading, serverService, structure, configService) {
  if (configService.isDevMode) {
    $scope.isDevMode = configService.isDevMode;
    $scope.$watch('isDevMode', function() { $rootScope.$broadcast('devModeChanged', $scope.isDevMode); });
  }

  $scope.serverService = serverService;
  $scope.structure = structure;

  $scope.$on('$locationChangeStart', function(event, nextUrl) {
    if (structure.getLevel3IsOkay() === false) { //cancel transition to nextUrl if the page is not okay
      if (structure.ignoreIssues) { structure.ignoreIssues = false; return; } //don't cancel transition
      var nextRoute = nextUrl.split('#')[1];
      $rootScope.$broadcast('transitionCancelled', nextRoute);
      event.preventDefault();
    }
  });

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    appLoading.loading();
  });
  $scope.$on('$stateChangeSuccess', function() {
    structure.hierarchy.select($state.params);
  });
});

//Level1Controller
thSchoolDashboardAppModule.controller('Level1Controller', function($rootScope, $scope, $state, $timeout, $location, appLoading, serverService, structure, configService) {
  $scope.hierarchy = structure.hierarchy;
  $scope.serverService = serverService;

  $scope.$on('devModeChanged', function(e, isDevMode) { $scope.isDevMode = isDevMode; });

  $scope.$on('$viewContentLoaded', function(){
    $scope.useAnimationHack1 = true;
    $timeout(function() { $scope.useAnimationHack1 = false; appLoading.ready(); }, 500 );
  });

  $scope.$on('$stateChangeSuccess', function() {
    $scope.percentageComplete = structure.getLevel1PercentageComplete();
    $scope.getProgressBarCompleteStyle = function() { return { width: $scope.percentageComplete + '%' }; };
  });

  $rootScope.$$listeners['serverService.responseReceived'] = undefined; //remove listener (in case it already exists)
  $rootScope.$on('serverService.responseReceived', function() { //add listener
    $scope.percentageComplete = structure.getLevel1PercentageComplete();
    if (!$rootScope.$$phase) $scope.$apply();
  });

  $scope.go = function(path) { $location.path(path); };
});

//Level2Controller
thSchoolDashboardAppModule.controller('Level2Controller', function() {
});

//Level3Controller
thSchoolDashboardAppModule.controller('Level3Controller', function($scope, $state, $modal, configService, $location, structure) {
  $scope.$on('devModeChanged', function(e, isDevMode) { _.setAll(structure.contentItemsIndex, 'isDevMode', isDevMode); }); //*** TEMP

  structure.hierarchy.select($state.params); //*** TODO: move this to the router (perhaps with a resolve)
  $scope.contentItems = (structure.hierarchy.level3 ? structure.hierarchy.level3.contentItems : undefined);
  $scope.$watch(structure.getLevel3IsOkay, function(newVal, oldVal) { $scope.pageIsOkay = newVal; });

  $scope.$on('transitionCancelled', function(event, nextRoute) {
    var afterClose = function(ignoreIssues) {
      structure.ignoreIssues = ignoreIssues;
      if (ignoreIssues || ignoreIssues === undefined) $location.path(nextRoute);
    };

    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: true };
    _.extend(opts, {
      templateUrl: configService.root + '/shared/partials/transition-warning.html?c',
      controller: 'TransitionWarningController',
      resolve: { nextRoute: function () { return nextRoute; } }
    });

    $modal.open(opts).result.then(afterClose);
  });
});

//TransitionWarningController
thSchoolDashboardAppModule.controller('TransitionWarningController', function($scope, $modalInstance, nextRoute) {
  $scope.nextRoute = nextRoute;
  $scope.close = $modalInstance.close;
});