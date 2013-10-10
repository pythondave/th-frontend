thAdminDashboardAppModule.factory('schoolsService', function($http, $rootScope, configService, listService) {
  //initialise
  var o = {};
  o.list = new listService.List();
  o.list.setSortOrderPaths(['-subject', 'role']);

  //get data
  o.getAndSetData = function(dataToPost) {
    o.list.setData([]); //instantly clear current data
    o.dataPosted = dataToPost;

    var getDataFromServer = $http.post(configService.requests.urls.schools, dataToPost, configService.requests.postConfig);
    var setData = function(response) {
      o.list.setData(response.data.schools);
      o.setDerivedData();
      $rootScope.$broadcast('schoolsChanged'); //more than one controller needs to know
    };
    return getDataFromServer.then(setData);
  };

  o.setDerivedData = function() {
    _(o.list.data).each(function(j) {
      if (j.dateCreated) j.daysSinceCreated = (new Date() - new Date(j.dateCreated))/1000/60/60/24;
    });
  };

  //filter
  o.filter = function(values) {
    if (!o.list) return;
    var re = new RegExp(values.search, 'i');
    o.list.filteredData = _(o.list.data).filter(function(o) {
      return ((!values.search || re.test(_.arrayOfValues(o).join('|'))) &&
              (!values.schoolName || o.schoolName === values.schoolName) &&
              (!values.country || o.country === values.country) &&
              (!values.city || o.city === values.city));
    }).value();
    $rootScope.$broadcast('schoolsChanged');
  };

  return o;
});

thAdminDashboardAppModule.factory('schoolService', function($http, configService) {
  //initialise
  var o = {};

  //get data
  o.getAndSetData = function(dataToPost) {
    if (!dataToPost.schoolId) return;
    var getDataFromServer = $http.post(configService.requests.urls.school, dataToPost, configService.requests.postConfig);
    var setData = function(response) {
      o.school = response.data.school;
      return response;
    };
    return getDataFromServer.then(setData);
  };

  return o;
});
