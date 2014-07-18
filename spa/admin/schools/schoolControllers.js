//Schools

thAdminDashboardAppModule.factory('schoolsFilterService', function(countriesService, FilterService) {
  var o = new FilterService();

  o.filters = [
    { name: 'search', type: 'text' },
    { name: 'country', type: '1fromMany', searchField: 'countryId', listName: 'countries', service: 'countriesService', label: 'Country' },
    { name: 'city', type: '1fromMany', searchField: 'cityId', listName: 'cities', service: 'citiesService', label: 'City' }
  ];
  o.createSyntacticSugar();

  return o;
});

thAdminDashboardAppModule.controller('SchoolsMenuCtrl', function($scope, $q, schoolNamesService, countriesService, citiesService, schoolsService, schoolsFilterService) {
  $scope.filters = schoolsFilterService;

  var refine = function() { schoolsService.filter(schoolsFilterService.getRefineVals()); }; //call when need to refine local data based on the filters

  var search = function() { //call when need to get data from the server
    var dataToPost = schoolsFilterService.getSearchIds();
    schoolsService.getAndSetData(dataToPost).then(setFilters);
  };

  //filter change events
  $scope.$watch('filters.search.val', function(newValue, oldValue) { if (newValue!==oldValue) refine(); });
  $scope.$watch('filters.country.val', function() { filterChanged.apply(this, arguments); }, true);
  $scope.$watch('filters.city.val', function() { filterChanged.apply(this, arguments); }, true);

  var filterChanged = function(newValue, oldValue) {
    var changeType = schoolsFilterService.getChangeType(newValue, oldValue);
    if (changeType === 'Refine') { refine(); }
    if (changeType === 'Search') { search(); }
  };

  //set filters (take data from various services and pass it to the filter service)
  var setFilters = function() {
    schoolsFilterService.includeRefine = (schoolsService.list.data.length < 200); //don't include refine options if we have 200 rows or more
    schoolsFilterService.search.val = undefined;
    schoolsFilterService.setFilter('country', countriesService.list.data, schoolsService.list.summarise('country'));
    schoolsFilterService.setFilter('city', citiesService.list.data, schoolsService.list.summarise('city'));
  };

  //get and set data (first run only) //*** TODO should probably move this to the router
  if (!schoolsService.schoolsMenuCtrlRanPreviously) {
    schoolsService.list.setSortOrderPaths(['name']);
    $q.all([ //load all the data then set the filters
      schoolsService.getAndSetData(),
      countriesService.getAndSetData(),
      citiesService.getAndSetData()
    ]).then(setFilters);
  }

  schoolsService.schoolsMenuCtrlRanPreviously = true; //set for next time
});

thAdminDashboardAppModule.controller('SchoolsCtrl', function($scope, schoolsService) {
  $scope.sort = schoolsService.list.sort;

  //headers
  var getFields = function(dataPosted) {
    dataPosted = dataPosted || {};
    var fields = {}, i = 0;
    if (!dataPosted.name) { fields.name = { index: i }; i++; }
    if (!dataPosted.countryId) { fields.country = { index: i }; i++; }
    if (!dataPosted.cityId) { fields.city = { index: i }; i++; }
    fields.count = i;
    return fields;
  };

  var setScopeValues = function() {
    $scope.fields = getFields(schoolsService.dataPosted);
    $scope.schools = schoolsService.list.filteredData;
  };

  $scope.$on('schoolsChanged', function(e) { setScopeValues(); });
  if (schoolsService.schoolsCtrlRanPreviously) setScopeValues(); //don't call on first run to aviod running twice

  schoolsService.schoolsCtrlRanPreviously = true; //set for next time
});


//School
thAdminDashboardAppModule.controller('SchoolMenuCtrl', function($scope, $timeout, $window, configService, serverService) {
  $scope.back = function() { $timeout(function() { $window.history.back(); }); };

  $scope.mode = configService.mode;
  $scope.serverService = serverService;
});

thAdminDashboardAppModule.controller('SchoolCtrl', function($scope, $q, $http, $stateParams, configService, schoolService, contentItemService) {
  var o = {};

  var getServerData = function() {
    var urls = configService.requests.urls;
    var getFromServer = function(url, data) {
      if (!url) return;
      return $http.post(url, data, configService.requests.postConfig);
    };
    var serverQueries = [
      getFromServer(urls.lists),
      getFromServer(urls.school, { schoolId: $stateParams.schoolId }),
      getFromServer(urls.adminSpepStructure)
    ];

    return $q.all(serverQueries);
  };

  var setServerData = function(response) {
    if (!response || !response[0].data || !response[1].data) return $q.reject('no list or school data');

    o.lists = sortLists(response[0].data);
    o.schoolData = response[1].data;
    o.structure = response[2].data.sections[0].sections[0];
  };

  var sortLists = function(o) {
    o.currencies = _.sortBy(o.currencies, 'currency');
    return o;
  };

  var combineModelsAndPresentationStructures = function() {
    var school = o.schoolData.school;

    var derivedSchoolNickname = function() {
      if (school.nickname) return school.nickname;
      if (school.name && school.name.length <= 10) return school.name;
      if (school.initials) return school.initials;
      if (school.name) return school.name.match(/\b\w/g).join('');
      return '?';
    };

    _.each(o.structure.contentItems, function(ci, index) { //ensure each contentItems member is a contentItem
      if (ci instanceof contentItemService.ContentItem) return;
      var newCi = new contentItemService.ContentItem(ci);
      o.structure.contentItems[index] = newCi;
    });
    $scope.contentItems = o.structure.contentItems;

    //decorate structure with possible value lists and values from the source data
    _.each(o.structure.contentItems, function(ci) {
      if (ci.listName) { ci.items = _.cloneDeep(o.lists[ci.listName]); }
      if (ci.systemType && ci.systemType.slice(0, 6) === 'school') ci.fixedData = { schoolId: school.id, token: o.schoolData.token };
      var val = school[ci.systemName], val2;
      if (ci.type === 'urlEdit') { val2 = (ci.serverObject ? ci.serverObject.name : ci.urlTitle); }
      ci.init(val, val2);
    });
  };

  getServerData().then(setServerData).then(combineModelsAndPresentationStructures);
});


thAdminDashboardAppModule.controller('AddSchoolController', function($scope, configService, dialog, $http, $stateParams){
  $scope.close = function(doIt) {
    var o = { doIt: doIt, teacher: $scope.teacher };
    dialog.close(o);
  };
});


thAdminDashboardAppModule.factory('serverService', function ($rootScope, $timeout, $http, configService) {
  //serverService: use to post data to the server

  var o = {};
  o.sentToServer = [];

  o.sendToServer = function(systemType, dataToPost) {
    var urls = {
      school: configService.requests.urls.processSchool,
      schoolRating: configService.requests.urls.processSchoolRating,
      schoolBenefit: configService.requests.urls.processSchoolBenefit,
      city: configService.requests.urls.processCity,
      cityLivingCost: configService.requests.urls.processCityLivingCost,
      cityLink: configService.requests.urls.processCityLink,
      undefined: 'dummy'
    };

    var url = urls[systemType];

    if (systemType === 'cityLink' && !dataToPost.linkId) url = configService.requests.urls.processCityLink;

    var successCallback = function(response) {
      o.sentToServer.push(url + '?' + $.param(dataToPost));
      $rootScope.$emit('serverService.responseReceived');
      return response;
    };
    var postToServer = $http.post(url, dataToPost, configService.requests.postConfig).then(successCallback);

    return postToServer;
  };

  return o;
});
