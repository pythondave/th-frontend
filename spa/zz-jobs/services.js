/*
  Contains: initService, jobsFilterService
*/

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
        if (!response[0].data && configService.mode < 3) { return $q.delay(1000).then(o.init); } //no data and mock server being used, so wait and then try again to give time for mock json files to be loaded *** TODO: move this to within the mock server somehow
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

thJobsAppModule.factory('jobsFilterService', function($state, $rootScope) {
  //jobsFilterService: provides data and functions for the job filters
  //*** TODO: consider consolidating this with the html into a 'filter' directive
  //*** TODO: refactor so more DRY
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
    o.start.val = _.isNull($state.params.start) ? undefined : new Date($state.params.start);
  };

  o.addFilterWatch = function(filterName) {
    var toUrlValue = function(x) { //takes a value and translates it to a format appropriate for the url
      if (_.isUndefined(x) || _.isNull(x)) return;
      if (_.isDate(x)) return _.toDateString(x);
      if (x.id) return x.id;
    };

    $rootScope.$watch('filters.' + filterName + '.val', function(newValue, oldValue) {
      var params = {}; params[filterName] = toUrlValue(newValue);
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
