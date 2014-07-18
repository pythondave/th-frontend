/*
  Contains: initService, candidatesFilterService
*/

thCandidatesAppModule.factory('initService', function ($http, $q, $qDecoratorService, configService) {
  //initService: code which is typically run only when the application is first loaded
  var o = {};
  $qDecoratorService.decorate($q);

  o.init = function() {
    //loads lists for the filters
    var getAndSetServerData = function() {
      var getCandidatesAppLists = function() {
        return $http.post(configService.requests.urls.candidatesAppLists, undefined, configService.requests.postConfig);
      };
      var sortData = function(data) {
        data.subjects = _.sortBy(data.subjects, 'name');
        data.roles = _.sortBy(data.roles, 'name');
        data.nationalities = _.sortBy(data.nationalities, 'name');
        data.locations = _.sortBy(data.locations, 'name');
        data.systems = _.sortBy(data.systems, 'system');
      };
      var setDataFromServer = function(response) {
        if (!response[0].data && configService.mode < 3) { return $q.delay(1000).then(o.init); } //no data and mock server being used, so wait and then try again to give time for mock json files to be loaded *** TODO: move this to within the mock server somehow
        var lists = response[0], data = lists.data;
        data.systems = data.academicSystems; //simpler alias, used throughout
        sortData(data);

        //additional lists
        var currentYear = new Date().getFullYear();
        data.yearsOfBirth = _.times(52, function(i) { var year = currentYear-70+i; return { id: year, name: year }; })
        data.numberOfDependentChildren = _.times(6, function(i) { return { id: i, name: (i==5?'5+':i) }; })

        return { lists: lists };
      };
      return $q.all([getCandidatesAppLists()]).then(setDataFromServer);
    };
    return getAndSetServerData();
  };

  return o;
});

thCandidatesAppModule.factory('candidatesFilterService', function($state, $rootScope) {
  //candidatesFilterService: provides data and functions for the candidate filters
  //*** TODO: consider consolidating this with the html into a 'filter' directive
  //*** TODO: refactor so more DRY
  var o = {};

  o.config = [
    { name: 'location' }
  ];
  o.search = {};
  o.subjects = {};
  o.roles = {};
  o.nationalities = {};
  o.curriculumExperience = {};
  o.internationalSchoolExperience = {};
  o.availableFrom = {};
  o.dateRegistered = {};
  o.yearOfBirth = {};
  o.maritalStatus = {};
  o.numberOfDependentChildren = {};
  o.eduationLevelsCompleted = {};
  o.location = {};
  o.approved = {};
  o.cv = {};

  var textForN = function(n, textFor0, textFor1, textFor2orMore) {
    if (n==0) return textFor0;
    if (n==1) return textFor1;
    if (n>=2) return textFor2orMore;
  };

  o.minimumExperience = { type: 'slider',
    items: _.times(41, function(i) { return { val: i, description: textForN(i, ' ', '1 year', i + ' years') }; }),
    update: function(val) { o.minimumExperience.val = (val==0 ? undefined : val); }
  }

  o.averageReferenceScore = { type: 'slider',
    items: _.times(101, function(i) { return { val: i, description: textForN(i, ' ', '1%', i + '%') }; }),
    update: function(val) { o.averageReferenceScore.val = (val==0 ? undefined : val); }
  }

  o.adviserScore = { type: 'slider',
    items: _.times(11, function(i) { return { val: i, description: textForN(i, ' ', '1', i) }; }),
    update: function(val) { o.adviserScore.val = (val==0 ? undefined : val); }
  }

  o.synchToParam = function(filterName, listName, parameterName) {
    listName = listName || filterName + 's';
    parameterName = parameterName || filterName;
    o[filterName].val = _.find(o.lists[listName], { 'id': _.parseInt($state.params[parameterName]) });
  };

  o.synchToParams = function() {
    o.search.val = $state.params.search;
    o.subjects.val = _.isNull($state.params.subjects) ? [] : $state.params.subjects.split(',');
    o.roles.val = _.isNull($state.params.roles) ? [] : $state.params.roles.split(',');
    o.nationalities.val = _.isNull($state.params.nationalities) ? [] : $state.params.nationalities.split(',');
    o.synchToParam('location');
    o.synchToParam('yearOfBirth', 'yearsOfBirth');
    o.synchToParam('numberOfDependentChildren', 'numberOfDependentChildren');
    o.availableFrom.val = _.isNull($state.params.availableFrom) ? undefined : new Date($state.params.availableFrom);
    o.dateRegistered.val = _.isNull($state.params.dateRegistered) ? undefined : new Date($state.params.dateRegistered);
    o.internationalSchoolExperience.val = $state.params.internationalSchoolExperience;
    o.minimumExperience.val = $state.params.minimumExperience;
    o.minimumExperience.index = _.parseInt($state.params.minimumExperience);
    o.averageReferenceScore.val = $state.params.averageReferenceScore;
    o.averageReferenceScore.index = _.parseInt($state.params.averageReferenceScore);
    o.adviserScore.val = $state.params.adviserScore;
    o.adviserScore.index = _.parseInt($state.params.adviserScore);
    o.approved.val = $state.params.approved;
    o.cv.val = $state.params.cv;
  };

  o.addFilterWatch = function(filterName) {
    var toUrlValue = function(x) { //takes a value and translates it to a format appropriate for the url
      if (_.isUndefined(x) || _.isNull(x) || x == '') return;
      if (_.isDate(x)) return _.toDateString(x);
      if (x.id) return x.id;
      return x;
    };

    $rootScope.$watch('filters.' + filterName + '.val', function(newValue, oldValue) {
      var params = {}; params[filterName] = toUrlValue(newValue);
      $state.go('candidates.query', params);
    });
  };

  o.init = function(lists) {
    /*
    'search', 'subjects', 'roles', 'nationalities', 'curriculumExperience', 'minimumExperience',
    'internationalSchoolExperience', 'availableFrom', 'dateRegistered', 'averageReferenceScore',
    'adviserScore', 'yearOfBirth', 'maritalStatus', 'numberOfDependentChildren', 'eduationLevelsCompleted',
    'location', 'approved', 'cv'
    */
    o.addFilterWatch('search');
    o.addFilterWatch('subjects');
    o.addFilterWatch('roles');
    o.addFilterWatch('nationalities');
    o.addFilterWatch('curriculumExperience');
    o.addFilterWatch('minimumExperience');
    o.addFilterWatch('internationalSchoolExperience');
    o.addFilterWatch('availableFrom');
    o.addFilterWatch('dateRegistered');    
    o.addFilterWatch('averageReferenceScore');
    o.addFilterWatch('adviserScore');
    o.addFilterWatch('yearOfBirth');
    o.addFilterWatch('maritalStatus');
    o.addFilterWatch('numberOfDependentChildren');
    o.addFilterWatch('eduationLevelsCompleted');
    o.addFilterWatch('location');
    o.addFilterWatch('approved');
    o.addFilterWatch('cv');

    o.lists = lists;
    o.subjects.data = o.lists.subjects;
    o.roles.data = o.lists.roles;
    o.nationalities.data = o.lists.nationalities;
    o.yearOfBirth.data = o.lists.yearsOfBirth;
    o.numberOfDependentChildren.data = o.lists.numberOfDependentChildren;
    o.location.data = o.lists.locations;

  };

  $rootScope.filters = o;

  return o;
});
