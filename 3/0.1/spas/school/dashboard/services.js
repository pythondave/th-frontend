//*** TODO: refactor - some of this can be generic

/*
  serverService
  hierarchyService - *** move
  notesStructureSectionService
  initService
*/

thSchoolDashboardAppModule.factory('serverService', function ($rootScope, $timeout, $http, configService) {
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

    var successCallback = function() {
      o.sentToServer.push(url + '?' + $.param(dataToPost));
      $rootScope.$emit('serverService.responseReceived');
    };
    var postToServer = $http.post(url, dataToPost, configService.requests.postConfig).then(successCallback);

    return postToServer;
  };

  return o;
});

thSchoolDashboardAppModule.factory('hierarchyService', function () { //*** TODO: refactor so more generic & move to shared
  //hierarchyService: use to create a more self-aware hierarchy
  //e.g. can use this service to add the following properties to each item in the hierarchy:
  //parent, depth, path, previous, next

  var resetMarkers = function() {
    _.setAll(this.parent[this.propertyNames.collection], this.propertyNames.marker, false, this.propertyNames.collection);
  };

  var select = function(params) {
    this.resetMarkers();

    var collectionName = this.propertyNames.collection;
    var markerName = this.propertyNames.marker;
    this.level1 = this.parent[collectionName][params.level1-1];
    this.level2 = (this.level1[collectionName] && this.level1[collectionName][params.level2-1]);
    this.level3 = (this.level2 && this.level2[collectionName] && this.level2[collectionName][params.level3-1]);
    this.level1[markerName] = true;
    if (this.level2) this.level2[markerName] = true;
    if (this.level3) this.level3[markerName] = true;

    return;
  };

  var o = {};
  o.applyHierarchy = function(object, propertyNames) {
    propertyNames = _.defaults({}, propertyNames, { collection: 'sections', marker: 'isSelected', previous: 'previous', next: 'next' });

    //add hierarchy object
    object.hierarchy = { object: object, parent: object, propertyNames: propertyNames, resetMarkers: resetMarkers, select: select };

    //add index to hierarchy; add parent, depth and path to each hierarchy item
    object.hierarchy.index = [];
    var iterate = function(parent) {
      _.each(parent[propertyNames.collection], function(item, index) {
        object.hierarchy.index.push(item);
        item.parent = parent;
        item.index = index;
        item.depth = (parent.depth || 0) + 1;
        item.path = (parent.path ? parent.path + '/' : '') + (index+1);
        iterate(item);
      });
    };
    iterate(object);

    //add previous and next to each hierarchy item
    var index = object.hierarchy.index, previous, next, i;
    for (i = 0; i < index.length; i++) { //add previous
      if (index[i].depth === 3) {
        if (previous && previous.parent.parent === index[i].parent.parent) {
          index[i][propertyNames.previous] = previous;
        }
        previous = index[i];
      }
    }
    for (i = index.length - 1; i >= 0; i--) { //add next
      if (index[i].depth === 3) {
        if (next && index[i].parent.parent === next.parent.parent) {
          index[i][propertyNames.next] = next;
        }
        next = index[i];
      }
    }
  };

  return o;
});

thSchoolDashboardAppModule.factory('initService', function ($rootScope, $q, $http, $timeout, configService,
  hierarchyService, contentItemService) {
  //initService: use to get and set initial data and structure
  //Note: there are loads of ways of doing this: relative efficiency and the output of the init function is what matters

  var o = {};

  var urls = configService.requests.urls;
  var postConfig = configService.requests.postConfig;

  var getIndependentServerData = function() { //queries which are independent of each other
    return $q.all([
      $http.post(urls.lists, undefined, postConfig),
      $http.post(urls.school, { schoolId: o.schoolId }, postConfig),
      $http.post(urls.spepStructure, undefined, postConfig),
      $http.post(urls.spepNotesStructure, undefined, postConfig),
      $http.post(urls.contentItemShowcaseStructure, undefined, postConfig)
    ]);
  };

  var sortLists = function(o) {
    //sort all lists (ideally these would come sorted this way already)
    o.academicSystems = _.sortBy(o.academicSystems, 'system');
    o.acceptedTeacherQualifications = _.sortBy(o.acceptedTeacherQualifications, 'qualification');
    o.accreditations = _.sortBy(o.accreditations, 'type');
    o.allWorldCurrencies = _.sortBy(o.allWorldCurrencies, 'currency');
    o.attractions = _.sortBy(o.attractions, 'attraction');
    o.currencies = _.sortBy(o.currencies, 'currency');
    o.curriculums = _.sortBy(o.curriculums, 'title');
    o.educationLevels = _.sortBy(o.educationLevels, 'name');
    o.facilities = _.sortBy(o.facilities, 'facility');
    o.flightAllowances = _.sortBy(o.flightAllowances, 'allowance');
    o.fundingTypes = _.sortBy(o.fundingTypes, 'type');
    o.genderRations = _.sortBy(o.genderRations, 'ratio');
    o.languages = _.sortBy(o.languages, 'name');
    o.months = _.sortBy(o.months, 'val');
    o.pensionSchemes = _.sortBy(o.pensionSchemes, 'name');
    o.religiousAffiliations = _.sortBy(o.religiousAffiliations, 'affiliation');
    o.relocationAllowances = _.sortBy(o.relocationAllowances, 'allowance');
    o.teacherNationalities = _.sortBy(o.teacherNationalities, '(blank)');
    return o;
  };

  var setIndependentServerData = function(response) {
    o.lists = sortLists(response[0].data);
    o.schoolData = response[1].data;

    o.sections = [
      response[2].data,
      response[3].data,
      response[4].data
    ];

    //additional hard-coded list data (*** WIP - move to lists?)
    o.lists.months = [{ id: 1, name: 'January'}, { id: 2, name: 'February'}, { id: 3, name: 'March'}, { id: 4, name: 'April'}, { id: 5, name: 'May'}, { id: 6, name: 'June'}, { id: 7, name: 'July'}, { id: 8, name: 'August'}, { id: 9, name: 'September'}, { id: 10, name: 'October'}, { id: 11, name: 'November'}, { id: 12, name: 'December'}];
    o.lists.teacherNationalities = [{ id: 1, name: 'Nationality 1'}, { id: 2, name: 'Nationality 2'}, { id: 3, name: 'Nationality 3'}, { id: 4, name: 'Nationality 4'}, { id: 5, name: 'Nationality 5'}, { id: 6, name: 'Nationality 6'}, { id: 7, name: 'Nationality 7'}, { id: 8, name: 'Nationality 8'} ];
    return $q;
  };

  var getDependentServerData = function() { //queries which are dependent on other server data
    return $q.all([
      $http.post(configService.requests.urls.city, { cityId: o.schoolData.school.city }, configService.requests.postConfig)
    ]);
  };

  var setDependentServerData = function(response) {
    o.cityData = response[0].data;
  };

  var getAndSetServerData = function() {
    return getIndependentServerData().then(setIndependentServerData).then(getDependentServerData).then(setDependentServerData);
  };

  var combineStructureAndServerData = function(response) {
    var school = o.schoolData.school;
    var city = o.cityData.city;

    var derivedSchoolNickname = function() {
      if (school.nickname) return school.nickname;
      if (school.name && school.name.length <= 10) return school.name;
      if (school.initials) return school.initials;
      if (school.name) return school.name.match(/\b\w/g).join('');
      return '?';
    };

    //special tweaks 1 (pre-decoration of hierarchy)
    o.path = '/' + o.schoolId;
    var internationalCurrencySymbols = { EUR: '\u20AC', USD: '$', AUD: '$', GBP: '\u00A3', JPY: '\u00A5' };
    school.currencyName = _.find(o.lists.currencies, { id: school.currency || 1 }).code;
    school.currencySymbol = internationalCurrencySymbols[school.currencyName];
    school.nickname = derivedSchoolNickname();
    city.countryId = _.find(o.lists.cities, { id: city.id }).country;
    city.country = _.find(o.lists.countries, { id: city.countryId });
    city.internationalCurrencyName = _.find(o.lists.currencies, { id: city.internationalCurrency || 1 }).code;
    city.internationalCurrencySymbol = internationalCurrencySymbols[city.internationalCurrencyName];
    //console.log(city);

    //transform some data for easier access
    school.ratings = _.indexBy(school.ratings, 'id');
    school.benefits = _.indexBy(school.benefits, 'id');
    city.livingCosts = _.indexBy(city.livingCosts, 'id');
    city.links = _.indexBy(city.links, 'category'); //*** WIP - will need to be different to this

    //decorate structure with hierarchy and weight calculations
    hierarchyService.applyHierarchy(o); //decorate o with hierarchy functions and properties (e.g. parent, next, previous)

    _.each(o.hierarchy.index, function(section) { //set default weight for every section
      section.weight = (section.weight === undefined ? 1 : section.weight);
    });

    _.each(o.hierarchy.index, function(section) { //calculate totalChildWeight for every section
      var childCollectionName = (section.depth < 3 ? 'sections' : 'contentItems');
      section.totalChildWeight = _.reduce(section[childCollectionName], function(sum, item) { return sum + item.weight; }, 0);
    });

    var contentItemsIndex = []; //an index holding every content item
    _.each(o.hierarchy.index, function(section) {
      section.absoluteWeight = section.weight/section.parent.totalChildWeight * (section.parent.absoluteWeight || 1);
      _.each(section.contentItems, function(ci, index) {
        if (!(ci instanceof contentItemService.ContentItem)) {
          section.contentItems[index] = new contentItemService.ContentItem(ci);
          ci = section.contentItems[index];
        }
        ci.parent = section;
        contentItemsIndex.push(ci);
        ci.absoluteWeight = ci.weight/section.totalChildWeight * (section.absoluteWeight || 1) || 0;
      });
    });
    o.contentItemsIndex = contentItemsIndex;


    var getVal = function(ci) {
      if (ci.systemType === 'school' && ci.systemName) return school[ci.systemName];
      if (ci.systemType === 'schoolRating') {
        return (school.ratings[ci.ratingId] ? school.ratings[ci.ratingId].value : undefined);
      }
      if (ci.systemType === 'schoolBenefit') {
        return (school.benefits[ci.benefitId] ? school.benefits[ci.benefitId].value : undefined);
      }
      if (ci.systemType === 'city') return city[ci.systemName];
      if (ci.systemType === 'cityLivingCost') {
        return (city.livingCosts[ci.livingCostId] ? city.livingCosts[ci.livingCostId].value : undefined);
      }
    };

    //decorate structure with possible value lists and values from the source data
    _.each(o.contentItemsIndex, function(ci) {
      if (ci.listName) { ci.items = _.cloneDeep(o.lists[ci.listName]); }
      if (!ci.systemType && ci.parent.parent.parent.index === 0) ci.systemType = 'school';
      if (ci.systemType && ci.systemType.substring(0, 6) === 'school') ci.fixedData = { schoolId: school.id, token: o.schoolData.token };
      if (ci.systemType && ci.systemType.substring(0, 4) === 'city') ci.fixedData = { cityId: city.id, token: o.cityData.token };
      ci.init(getVal(ci));
    });

    //special tweaks 2 (post-decoration)
    var templateData = { school: school, city: city };
    _.each(o.hierarchy.index, function(section) {
      section.title = _.template(section.title, templateData);
      section.tip = _.template(section.tip, templateData);
    });
    _.each(o.contentItemsIndex, function(ci) {
      ci.title = _.template(ci.title, templateData);
      ci.tip = _.template(ci.tip, templateData);
      if (ci.type === 'text') ci.val = _.template(ci.val, templateData);
      if (ci.systemType === 'cityLivingCost') {
        ci.fixedData.livingCostId = ci.livingCostId;
        ci.systemName = 'value';
        ci.currencySymbol = city.internationalCurrencySymbol;
      }
      if (ci.systemType === 'cityLink') {
        ci.fixedData.linkId = 'WIP';
        ci.fixedData.url = 'WIP';
        ci.fixedData.name = 'WIP';
        var link = city.links[ci.linkId];
        if (link) {
          ci.urlTitle = { val: link.name };
          ci.url = { val: link.url };
        }
      }
      if (ci.systemType === 'schoolRating') {
        ci.fixedData.ratingId = ci.ratingId;
        ci.systemName = 'value';
      }
      if (ci.systemType === 'schoolBenefit') {
        ci.fixedData.benefitId = ci.benefitId;
        ci.systemName = 'value';
        if (ci.subType === 'money') ci.currencySymbol = school.currencySymbol;
      }
      if (ci.systemName === 'location' && !ci.val) {
        ci.address = city.name + ', ' + city.countryName;
      }
    });

    return o;
  };

  //additional helper values and functions
  o.getLevel3IsOkay = function() {
    if (!o.hierarchy.level3) return;
    return _.all(o.hierarchy.level3.contentItems, function(item) {
      return item.isValid !== false && !item.isDirty && !item.isBeingProcessed;
    });
  };

  o.getPercentageComplete = function() { //*** todo - consider attaching to hierarchy object / sub-objects
    var sum = _.reduce(o.contentItemsIndex, function(sum, ci) {
      var weight = (ci.parent.parent.parent.index === 0 ? ci.getWeight() : 0);
      return sum + weight;
    }, 0);
    return Math.round(sum*100, 10);
  };

  var delay = function(ms) {
    var deferred = $q.defer();
    $timeout(deferred.resolve, ms);
    return deferred.promise;
  };

  o.init = function(schoolId) {
    o.schoolId = schoolId;
    //delay(100) allows .json files to be loaded to the mock server. It's not strictly needed for the a non-mock version, but shouldn't do any harm.
    return (configService.isDev ? delay(500) : $q).then(getAndSetServerData).then(combineStructureAndServerData);
  };

  return o;
});
