//Jobs

thJobsAppModule.factory('jobsFilterService', function($state, $rootScope) {
  //jobsFilterService: provides data and functions for the job filters
  //*** TODO: consider consolidating this with the html into a 'filter' directive
  //*** TODO: refactor so DRY
  var o = {};

  o.config = [
    { name: 'subject' },
    { name: 'position' },
    { name: 'location' },
    { name: 'system' }
  ];
  o.subject = {};
  o.position = {};
  o.location = {};
  o.system = {};
  o.start = {};

  o.synchToParam = function(filterName, listName, parameterName) {
    listName = listName || filterName + 's';
    parameterName = parameterName || filterName;
    o[filterName].val = _.find(o.lists[listName], { 'id': _.parseInt($state.params[parameterName]) });
  };

  o.synchToParams = function() {
    o.synchToParam('subject');
    o.synchToParam('position');
    o.synchToParam('location');
    o.synchToParam('system');
  };

  o.addFilterWatch = function(filterName) {
    $rootScope.$watch('filters.' + filterName + '.val', function(newValue, oldValue) {
      var params = {}; params[filterName] = (newValue || {}).id;
      if (_.isDate(newValue)) {
        params[filterName] = _.toDateString(newValue);
      }
      $state.go('jobs.query', params);
    });
  };

  o.init = function(lists) {
    o.addFilterWatch('subject');
    o.addFilterWatch('position');
    o.addFilterWatch('location');
    o.addFilterWatch('system');
    o.addFilterWatch('start');

    o.lists = lists;
    o.subject.data = o.lists.subjects;
    o.position.data = o.lists.positions;
    o.location.data = o.lists.locations;
    o.system.data = o.lists.systems;
  };

  $rootScope.filters = o;

  return o;
});

thJobsAppModule.controller('MenuCtrl', function($scope, $rootScope, jobsFilterService, init) {
  jobsFilterService.init(init.lists.data);

  $scope.$on('$stateChangeSuccess', function() {
    jobsFilterService.synchToParams();
  });

  $rootScope.$watch('numberOfJobs', function (newValue, oldValue) {
    $scope.numberOfJobs = newValue;
  });
});

thJobsAppModule.controller('Ctrl', function($scope, $rootScope, $http, $modal, configService, init) {
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
    if (job.url) { return; } //url exists no modal needed

    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: true };
    _.extend(opts, {
      templateUrl: 'partials/modal.html',
      controller: 'ModalCtrl'
    });

    $modal.open(opts);
  };
});

thJobsAppModule.controller('ModalCtrl', function($scope, $modalInstance) {
  $scope.ok = $modalInstance.close;
});