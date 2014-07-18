/*
  Contains: MenuCtrl, MainCtrl, ModalCtrl
*/

thJobsAppModule.controller('MenuCtrl', function($scope, $rootScope, jobsFilterService, init) {
  jobsFilterService.init(init.lists.data);

  $scope.$on('$stateChangeSuccess', function() {
    jobsFilterService.synchToParams();
  });

  $rootScope.$watch('numberOfJobs', function (newValue, oldValue) {
    $scope.numberOfJobs = newValue;
  });
});

thJobsAppModule.controller('MainCtrl', function($scope, $rootScope, $http, $modal, $window, configService, init) {
  var subjects = init.lists.data.subjects;
  var positions = init.lists.data.positions;

  var getJobs = function(params) {
    params.app = 'jobs';
    return $http.post(configService.requests.urls.jobs, params, configService.requests.postConfig);
  };

  var setJobs = function(response) {
    var jobs = response.data.jobs;
    $rootScope.numberOfJobs = jobs.length;

    _.each(jobs, function(j) {
      j.image = (j.image ? 'http://beta.teacherhorizons.com' + j.image : '../../shared/images/placeholder.png'); //*** TODO: add these to config
      j.subject = _.find(subjects, { id: j.subject });
      j.position = _.find(positions, { id: j.position });
    });

    $scope.jobs = _.sortBy(jobs, ['startDate', 'subject', 'position']);
    $scope.userType = response.data.type;
  };

  $scope.$on('$stateChangeStart', function() {
    $scope.jobs = undefined;
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    _.each(toParams, function(item, key) { if (item === null) delete toParams[key]; }); //remove null params
    getJobs(toParams).then(setJobs);
  });

  $scope.jobClick = function(job) {
    if ($scope.userType === 1) { //admin or teacher with profile >= 80% => open in new tab
      $window.open(job.url, 'job' + job.id); //Note: job.url is assumed to exist
      return;
    }

    //not userType 1 => open a modal
    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: true };
    _.extend(opts, {
      templateUrl: 'partials/modal.html',
      controller: 'ModalCtrl',
      resolve: { userType: function() { return $scope.userType; } }
    });

    $modal.open(opts);
  };
});

thJobsAppModule.controller('ModalCtrl', function($scope, $modalInstance, userType) {
  $scope.userType = userType;
  $scope.close = $modalInstance.close;
});
