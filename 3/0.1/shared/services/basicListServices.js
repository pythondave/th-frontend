//*** TODO - refactor (there's a lot of duplication here)

thGenericModule.service('basicListsService', function($q, $http, configService, listService) {
  //note: this runs once only since basicLists can be considered static

  var o = {};
  var getDataFromServer = $http.post(configService.requests.urls.basicLists, undefined, configService.requests.postConfig);
  var setData = function(response) { o.basicLists = response; };
  o.getAndSetData = function() { return getDataFromServer.then(setData); };

  return o;
});

thGenericModule.factory('countriesService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.countries);
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});

thGenericModule.factory('subjectsService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.subjects);
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});

thGenericModule.factory('rolesService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.roles);
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});

thGenericModule.factory('settingsService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.settings);
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});