//Level1Controller (everything on the page)
thSchoolDashboardAppModule.controller('Level1Controller', function($rootScope, $scope, $state, appLoading, serverService, structure) {
  $scope.$watch('isDevMode', function() { $rootScope.$broadcast('devModeChanged', $scope.isDevMode); }); //*** TEMP

  $scope.sections = structure.sections;
  $scope.serverService = serverService;

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

//Level2Controller (side menu and main page)
thSchoolDashboardAppModule.controller('Level2Controller', function($rootScope, $scope, $state, $timeout, $location, appLoading, serverService, structure) {
  $scope.$on('devModeChanged', function(e, isDevMode) { $scope.isDevMode = isDevMode; }); //*** TEMP

  $scope.$on('$viewContentLoaded', function(){
    $scope.useAnimationHack1 = true;
    $timeout(function() { $scope.useAnimationHack1 = false; appLoading.ready(); }, 500 );
  });

  $rootScope.$$listeners['serverService.responseReceived'] = undefined; //remove listener (in case it already exists)
  $rootScope.$on('serverService.responseReceived', function() { //add listener
    $scope.percentageComplete = structure.getPercentageComplete();
    if (!$rootScope.$$phase) $scope.$apply();
  });

  $scope.hierarchy = structure.hierarchy;
  $scope.serverService = serverService;

  $scope.percentageComplete = structure.getPercentageComplete();
  $scope.getProgressBarCompleteStyle = function () { return { width: $scope.percentageComplete + '%' }; };

  $scope.go = function (path) { $location.path(path); };
});

//Level3Controller (main page)
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

thSchoolDashboardAppModule.controller('TransitionWarningController', function($scope, $modalInstance, nextRoute) {
  $scope.nextRoute = nextRoute;
  $scope.close = $modalInstance.close;
});