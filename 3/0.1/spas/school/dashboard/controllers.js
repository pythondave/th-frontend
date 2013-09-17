// *** TODO: refactor the various factories, services and controllers on this page (e.g. move to better files and/or modules)

thSchoolDashboardAppModule.controller('Level1Controller', function($rootScope, $scope, $state, $timeout, $location, appLoading, structureService, serverService) {
  $scope.$on('$viewContentLoaded', function(){
    $scope.useAnimationHack1 = true;
    $timeout(function() { $scope.useAnimationHack1 = false; appLoading.ready(); }, 500 );
  });

  $rootScope.$$listeners['serverService.responseReceived'] = undefined; //remove listener (in case it already exists)
  $rootScope.$on('serverService.responseReceived', function() { //add listener
    $scope.percentageComplete = structureService.getPercentageComplete();
    if (!$rootScope.$$phase) $scope.$apply();
  });

  $scope.hierarchy = structureService.hierarchy;
  $scope.serverService = serverService;
  $scope.percentageComplete = structureService.getPercentageComplete();
  $scope.getProgressBarCompleteStyle = function () { return { width: $scope.percentageComplete + '%' }; };

  $scope.go = function (path) { $location.path(path); };
});

thSchoolDashboardAppModule.controller('PageCtrl', function($scope, $state, structureService) {
  structureService.hierarchy.select($state.params); //*** TODO: move this to the router (perhaps with a resolve)
  $scope.contentItems = (structureService.hierarchy.level3 ? structureService.hierarchy.level3.contentItems : undefined);

  $scope.getPageIsValid = function() {
    return !_.some($scope.contentItems, function(item) { return item.isValid === false; });
  };

  $scope.$watch($scope.getPageIsValid, function(newVal, oldVal) {
    pageIsValid = newVal;
  });
});
