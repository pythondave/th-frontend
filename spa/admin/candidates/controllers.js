/*
  Contains: MenuCtrl, MainCtrl, ModalCtrl
*/

thCandidatesAppModule.controller('MenuCtrl', function($scope, $rootScope, candidatesFilterService, init) {
  candidatesFilterService.init(init.lists.data);

  $scope.$on('$stateChangeSuccess', function() {
    candidatesFilterService.synchToParams();
  });

  $rootScope.$watch('numberOfCandidates', function (newValue, oldValue) {
    $scope.numberOfCandidates = newValue;
  });
});

thCandidatesAppModule.controller('MainCtrl', function($scope, $rootScope, $http, $modal, $window, configService, init) {
  var nationalities = init.lists.data.nationalities;
  var subjects = init.lists.data.subjects;
  var roles = init.lists.data.roles;

  var getCandidates = function(params) {
    params.app = 'candidates';
    return $http.post(configService.requests.urls.candidates, params, configService.requests.postConfig);
  };

  var setCandidates = function(response) {
    var candidates = response.data.candidates;
    $rootScope.numberOfCandidates = candidates.length;

    _.forEach(candidates, function(c) {
      c.nationality = _.find(nationalities, { id: c.nationality });
      _.forEach(c.currentSubjects, function(s, index) {
        this[index] = _.find(subjects, { id: s });
      }, c.currentSubjects);
      c.currentRole = _.find(roles, { id: c.currentRole });
      c.photo = (c.photo != 0 ? 'http://teacherhorizons.com/static/media/members/photo/' + c.photo + '.jpg' : 'http://placehold.it/100x120'); //*** TODO: add these to config
    });

    //console.log(candidates[0]);

    $scope.candidates = _.sortBy(candidates, ['startDate', 'subject', 'position']);
    $scope.userType = response.data.type;
  };

  $scope.$on('$stateChangeStart', function() {
    $scope.candidates = undefined;
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    _.each(toParams, function(item, key) { if (item === null) delete toParams[key]; }); //remove null params
    getCandidates(toParams).then(setCandidates);
  });
});
