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
thAdminDashboardAppModule.controller('SchoolMenuCtrl', function($scope, $timeout, $window) {
  $scope.back = function() { $timeout(function() { $window.history.back(); }); };
});

thAdminDashboardAppModule.controller('SchoolCtrl', function($scope, $q, $http, configService, schoolService) {

  var f1 = function() { //queries which are independent of each other
    var urls = configService.requests.urls;
    var getFromServer = function(url, data) {
      if (!url) return;
      return $http.post(url, data, configService.requests.postConfig);
    };
    var serverQueries = [
      getFromServer('/TEMP/admin-school-structure')
    ];

    return $q.all(serverQueries);
  };
  f1().then(function(response) {
    console.log(response);
  });

/*
  $q.all([ //load all the data then set the filters
    schoolService.getAndSetData()
  ]).then(function(response) {
    console.log(response);
  });
*/
});


thAdminDashboardAppModule.controller('AddSchoolController', function($scope, configService, dialog, $http, $stateParams){
  $scope.close = function(doIt) {
    var o = { doIt: doIt, teacher: $scope.teacher };
    dialog.close(o);
  };
});