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
  };

  $scope.$on('$stateChangeStart', function() {
    $scope.jobs = undefined;
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    _.each(toParams, function(item, key) { if (item === null) delete toParams[key]; }); //remove null params
    getJobs(toParams).then(setJobs);
  });

  $scope.jobClick = function(job) {
    if (job.url) { //url exists => open in new tab
      $window.open(job.url, 'job' + job.id);
      return;
    }

    //url doesn't exist => open a modal
    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: true };
    _.extend(opts, {
      templateUrl: 'partials/modal.html',
      controller: 'ModalCtrl'
    });

    $modal.open(opts);
  };
});

thJobsAppModule.controller('ModalCtrl', function($scope, $modalInstance) {
  $scope.close = $modalInstance.close;
});
