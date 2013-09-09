// *** TODO: refactor the various factories, services and controllers on this page (e.g. move to better files and/or modules)

thSchoolDashboardAppModule.controller('Level1Controller', function($scope, $state, $timeout, $location, appLoading, structureService, serverService) {
  $scope.$on('$viewContentLoaded', function(){
    $scope.useAnimationHack1 = true;
    $timeout(function() { $scope.useAnimationHack1 = false; appLoading.ready(); }, 500 );
  });

  $scope.hierarchy = structureService.hierarchy;
  $scope.serverService = serverService;

  $scope.go = function (path) { $location.path(path); };
});

thSchoolDashboardAppModule.controller('PageCtrl', function($scope, $state, structureService) {
  structureService.hierarchy.select($state.params); //*** TODO: move this to the router (perhaps with a resolve)
  $scope.contentItems = (structureService.hierarchy.level3 ? structureService.hierarchy.level3.contentItems : undefined);
});
