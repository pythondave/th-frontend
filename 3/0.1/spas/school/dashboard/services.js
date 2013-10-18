/*
  initService
  emptyFieldsHelperService
  serverService
*/

thSchoolDashboardAppModule.factory('initService', function ($http, $q, $qDecoratorService, $location,
  configService, hierarchyFunctionsService, contentItemService, emptyFieldsHelperService) {
  //initService: use to get and set initial data and structure
  //Note: there are loads of ways of doing this: relative efficiency and the output of the init function is what matters

  $qDecoratorService.decorate($q);

  var o = {};

  //error handler
  var handleError = function(reason) {
    window.location.href = configService.requests.urls.invalidSchoolDashboardUrlRedirect + '?reason=' + reason;
  };

  //empty fields
  emptyFieldsHelperService.structure = o;
  o.setEmptyFields = emptyFieldsHelperService.setEmptyFields;
  o.setRandomEmptyField = emptyFieldsHelperService.setRandomEmptyField;

  //getIndependentServerData (models and presentation structures)
  var getIndependentServerData = function() { //queries which are independent of each other
    var urls = configService.requests.urls;
    var getFromServer = function(url, data) {
      if (!url) return;
      return $http.post(url, data, configService.requests.postConfig);
    };
    var serverQueries = [
      getFromServer(urls.lists),
      getFromServer(urls.school, { schoolId: o.schoolId }),
      getFromServer(urls.spepStructure),
      getFromServer(urls.spepNotesStructure),
      getFromServer(urls.contentItemShowcaseStructure)
    ];
    _.remove(serverQueries, function(val) { return val === undefined; });

    return $q.all(serverQueries);
  };
  //

  //setIndependentServerData
  var setIndependentServerData = function(response) {
    if (!response || !response[0].data || !response[1].data) return $q.reject('no list or school data');

    o.lists = sortLists(response[0].data);
    o.schoolData = response[1].data;

    o.sections = [];
    for (var i = 2; i < response.length; i++) {
      if (!response[i].data) return $q.reject('no section data');
      o.sections.push(response[i].data);
    }

    //additional hard-coded list data
    o.lists.months = [{ id: 1, name: 'January'}, { id: 2, name: 'February'}, { id: 3, name: 'March'}, { id: 4, name: 'April'}, { id: 5, name: 'May'}, { id: 6, name: 'June'}, { id: 7, name: 'July'}, { id: 8, name: 'August'}, { id: 9, name: 'September'}, { id: 10, name: 'October'}, { id: 11, name: 'November'}, { id: 12, name: 'December'}];
    o.lists.internationalCurrencySymbols = { EUR: '\u20AC', USD: '$', AUD: '$', GBP: '\u00A3', JPY: '\u00A5' };
    return $q;
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
    o.nationalities = _.sortBy(o.nationalities, 'name');
    o.pensionSchemes = _.sortBy(o.pensionSchemes, 'name');
    o.religiousAffiliations = _.sortBy(o.religiousAffiliations, 'affiliation');
    o.relocationAllowances = _.sortBy(o.relocationAllowances, 'allowance');
    return o;
  };
  //

  //getDependentServerData
  var getDependentServerData = function() { //queries which are dependent on other server data
    return $q.all([
      $http.post(configService.requests.urls.city, { cityId: o.schoolData.school.city }, configService.requests.postConfig)
    ]);
  };
  //

  //setDependentServerData
  var setDependentServerData = function(response) {
    if (!response || !response[0] || !response[0].data) return $q.reject('no city');
    o.cityData = response[0].data;
  };
  //

  //getAndSetServerData
  var getAndSetServerData = function() {
    return getIndependentServerData().then(setIndependentServerData).then(getDependentServerData).then(setDependentServerData);
  };
  //

  var combineModelsAndPresentationStructures = function(response) {
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
    school.nickname = derivedSchoolNickname();
    city.countryId = _.find(o.lists.cities, { id: city.id }).country;
    city.country = _.find(o.lists.countries, { id: city.countryId });
    city.internationalCurrencyName = _.find(o.lists.currencies, { id: city.internationalCurrency || 3 }).code;
    city.internationalCurrencySymbol = internationalCurrencySymbols[city.internationalCurrencyName];

    //transform some data for easier access
    school.ratings = _.indexBy(school.ratings, 'id');
    school.benefits = _.indexBy(school.benefits, 'id');
    city.livingCosts = _.indexBy(city.livingCosts, 'id');
    city.links = _.sortBy(city.links, 'id'); //*** TODO: do the multi-sorting more elegantly
    city.links = _.sortBy(city.links, 'category');

    //decorate structure with hierarchy and weight calculations
    hierarchyFunctionsService.applyHierarchy(o); //decorate o with hierarchy functions and properties (e.g. parent, next, previous)

    _.each(o.hierarchy.contentItemsIndex, function(ci, index) { //ensure each contentItems member is a contentItem
      if (ci instanceof contentItemService.ContentItem) return;
      var newCi = new contentItemService.ContentItem(ci);
      ci.parent.contentItems[ci.index] = newCi;
      hierarchyFunctionsService.updateIndexes(o.hierarchy, newCi, ci);
    });
    o.contentItemsIndex = o.hierarchy.contentItemsIndex;


    _.each(o.hierarchy.index, function(item) { //set some defaults for sections and contentItems
      item.weight = _.firstDefined(item.weight, item.collectionName === 'sections' ? 1 : 0);
      if (item.depth < 2) item.absoluteWeight = 1;
    });

    _.each(o.hierarchy.sectionsIndex, function(section) { //set totalChildWeight for every section
      var childCollectionName = (section.depth < 3 ? 'sections' : 'contentItems');
      section.totalChildWeight = _.reduce(section[childCollectionName], function(sum, item) { return sum + item.weight; }, 0);
    });

    _.each(o.hierarchy.index, function(item) { //set absoluteWeight for every section and contentItem
      if (item.depth < 2) return;
      item.absoluteWeight = (!item.weight ? 0 : item.weight/item.parent.totalChildWeight * item.parent.absoluteWeight);
    });

    var getVal = function(ci) {
      if (ci.systemType === 'school' && ci.systemName) return school[ci.systemName];
      if (ci.systemType === 'schoolRating') {
        return (school.ratings[ci.ratingId] ? school.ratings[ci.ratingId].value : undefined);
      }
      if (ci.systemType === 'schoolBenefit') {
        return (school.benefits[ci.benefitId] ? school.benefits[ci.benefitId].value : undefined);
      }
      if (ci.systemType === 'city') return city[ci.systemName];
      if (ci.systemType === 'cityLink') {
        ci.serverObject = _.find(city.links, { category: ci.category }); //*** temp hack
        return (ci.serverObject ? ci.serverObject.url : undefined);
      }
      if (ci.systemType === 'cityLivingCost') {
        return (city.livingCosts[ci.livingCostId] ? city.livingCosts[ci.livingCostId].value : undefined);
      }
      return ci.val;
    };

    //decorate structure with possible value lists and values from the source data
    _.each(o.contentItemsIndex, function(ci) {
      if (ci.listName) { ci.items = _.cloneDeep(o.lists[ci.listName]); }
      if (!ci.systemType && ci.parent.parent.parent.index === 0) ci.systemType = 'school';
      if (ci.systemType && ci.systemType.slice(0, 6) === 'school') ci.fixedData = { schoolId: school.id, token: o.schoolData.token };
      if (ci.systemType && ci.systemType.slice(0, 4) === 'city') ci.fixedData = { cityId: city.id, token: o.cityData.token };
      var val = getVal(ci), val2;
      if (ci.type === 'urlEdit') { val2 = (ci.serverObject ? ci.serverObject.name : ci.urlTitle); }
      ci.init(val, val2);
    });

    //special tweaks 2 (post-decoration)
    var templateData = { school: school, city: city, uploadToken: o.schoolData.uploadToken };
    _.each(o.hierarchy.sectionsIndex, function(section) { //all sections in hierarchy
      saveTemplates(section);
      applyTemplates(section, templateData);
    });

    _.each(o.contentItemsIndex, function(ci) {
      saveTemplates(ci);
      applyTemplates(ci, templateData);

      //different systemTypes
      if (ci.systemType && ci.systemType.slice(0, 6) === 'school') {
        ci.getExternalDataToPost = function() { return { progress: o.getLevel1PercentageComplete() }; };
      }

      if (ci.systemType === 'schoolRating') {
        ci.fixedData.ratingId = ci.ratingId;
        ci.systemName = 'value';
      } else if (ci.systemType === 'schoolBenefit') {
        ci.fixedData.benefitId = ci.benefitId;
        ci.systemName = 'value';
      } else if (ci.systemType === 'cityLivingCost') {
        ci.fixedData.livingCostId = ci.livingCostId;
        ci.systemName = 'value';
        ci.currencySymbol = city.internationalCurrencySymbol;
      } else if (ci.systemType === 'cityLink') {
        ci.fixedData.linkId = (ci.serverObject ? ci.serverObject.id : undefined);
        ci.fixedData.category = (ci.serverObject ? undefined : ci.category);
        ci.systemName = { title: 'name', url: 'url' };
      }

      if (ci.systemName === 'location' && !ci.val) {
        ci.address = city.name + ', ' + city.countryName;
      }

      applyInternationalWorkingCurrency();
      if (ci.systemType === 'school' && ci.systemName === 'currency') {
        ci.preChangeConfirm = internationalWorkingCurrencyPreChangeConfirm;
        ci.onChangeCallback = applyInternationalWorkingCurrency;
      }

    });

    return o;
  };

  var internationalCurrencySymbols = { EUR: '\u20AC', USD: '$', AUD: '$', GBP: '\u00A3', JPY: '\u00A5' };

  //templates
  var saveTemplate = function(o, propertyName) {
    if (!o[propertyName] || o[propertyName].indexOf('{{') === -1) return;
    o.templates = o.templates || {};
    o.templates[propertyName] = o[propertyName];
  };

  var saveTemplates = function(o) {
    saveTemplate(o, 'title');
    saveTemplate(o, 'tip');
    if (o.type === 'text' || o.type === 'html') saveTemplate(o, 'val');
  };

  var applyTemplates = function(o, templateData) {
    if (!o.templates) return;
    _.each(o.templates, function(templateVal, propertyName) {
      o[propertyName] = _.template(templateVal, templateData);
    });
  };

  //functions for dynamically inter-dependent fields
  var internationalWorkingCurrencyPreChangeConfirm = function() {
    var hasMoneyValue = _.some(o.contentItemsIndex, function(ci) {
      return (ci.systemType && ci.systemType.slice(0, 6) === 'school' && ci.subType === 'money' && !(ci.val === undefined || ci.val === 0 || ci.val === ''));
    });
    var message = 'WARNING \n\nSome money values are set in ' + o.schoolData.school.currencyName + '. Changing your currency will change the meaning of those values. \n\nClick OK to continue with the change, or Cancel if you\'re not sure.';
    return (hasMoneyValue ? confirm(message) : true);
  };

  var applyInternationalWorkingCurrency = function() {
    var school = o.schoolData.school;
    var city = o.cityData.city;

    school.currency = _.parseInt(this.val);
    school.currencyName = _.find(o.lists.currencies, { id: school.currency || 3 }).code;
    school.currencySymbol = internationalCurrencySymbols[school.currencyName];

    var templateData = { school: school, city: city };

    _.each(o.contentItemsIndex, function(ci) {
      if (ci.systemType && ci.systemType.slice(0, 6) === 'school' && ci.subType === 'money') {
        applyTemplates(ci, templateData);
        if (ci.currencySymbol) ci.currencySymbol = school.currencySymbol;
      }
    });
  };
  //

  //additional helper values and functions
  o.getLevel3IsOkay = function() {
    if (!o.hierarchy.level3) return;
    return !_.some(o.hierarchy.level3.contentItems, function(ci) {
      return ci.isValid === false || ci.isDirty || ci.isBeingProcessed;
    });
  };

  o.getLevel3AllFieldsEmpty = function() {
    if (!o.hierarchy.level3) return;
    return _.all(o.hierarchy.level3.contentItems, function(ci) {
      return (ci.val === undefined || ci.val === '');
    });
  };

  o.getLevel1PercentageComplete = function() {
    if (o.hierarchy.level1.index !== 0) return;
    var sum = _.reduce(o.contentItemsIndex, function(sum, ci) {
      var weight = (ci.parent.parent.parent.index === 0 ? ci.getWeight() : 0);
      return sum + weight;
    }, 0);

    return Math.round(sum*100, 10);
  };

  o.init = function(schoolId) {
    //returns a (promise of a) presentation model (essentially by combining models with presentation structures)
    o.schoolId = schoolId;
    var ms = (configService.mode < 3 ? 500 : 0);
    return $q.delay(ms).then(getAndSetServerData).then(combineModelsAndPresentationStructures, handleError);
  };

  return o;
});

thSchoolDashboardAppModule.factory('emptyFieldsHelperService', function () {
  var o = {};

  var getFilteredContentItems = function(options) {
    options = options || {};
    return _.filter(o.structure.contentItemsIndex, function(ci) {
      if (ci.parent.parent.parent.path !== o.structure.hierarchy.level1.path) return; //not same level1
      if (ci.parent.path === o.structure.hierarchy.level3.path) return; //same level3
      if (options.keepHeaders && ci.type === 'header') return true;
      return ci.getIsMissing();
    });
  };

  var getLevel1HeaderContentItem = function(ci) {
    return { type: 'header', title: ci.parent.parent.title, icon: ci.parent.parent.icon, style: 'color: #282737;' };
  };

  var getLevel2HeaderContentItem = function(ci) {
    return { type: 'header', title: ci.parent.title, icon: ci.parent.icon };
  };

  var getNoFieldsMessage = function(ci) {
    return { type: 'custom', html: '<div><span class="content-item-icon"><i class="icon-check"></i></span>Looks like you\'re done!</div><hr/>' };
  };

  var addLevel1Header = function(contentItems, ci, index) {
    if (!ci) return;
    contentItems.splice(index, 0, getLevel1HeaderContentItem(ci));
  };

  var getClearedContentItems = function() {
    var contentItems = o.structure.hierarchy.level3.contentItems;
    contentItems.length = 1;
    return contentItems;
  };

  o.setRandomEmptyField = function() {
    var click = function() { o.setRandomEmptyField(); };
    var popover = '';
    var buttonCi = { type: 'custom', html: '<button ng-disabled="!$parent.pageIsOkay" style="float: right; margin: -44px 100px 0 0;" class="btn btn-info" ng-click="model.click()">Get another!</button>', click: click };
    var messageCi = { type: 'custom', html: '<div style="float: right; margin: -38px 140px 0 0;" >Last one!</div>' };
    //var button2Ci = { type: 'custom', html: '<div style="height: 100px; width: 94%"><button ng-disabled="!$parent.pageIsOkay" style="margin: 40px 0 20px 40%;" class="btn btn-large btn-info" ng-click="model.click()">Get another</button></div>', click: click };
    //var message2Ci = { type: 'custom', html: '<div style="text-align: center; width: 86%" >Last one!</div>' };
    var emptyCis = getFilteredContentItems();

    var ci, i = 0;
    do {
      i++; //in case of unexpected infinite loops
      ci = emptyCis[_.random(emptyCis.length-1)];
    } while (i < 10  && ci && o.previousRandomContentItem === ci);
    o.previousRandomContentItem = ci;

    var contentItems = getClearedContentItems();
    if (!ci) {
      contentItems.push(getNoFieldsMessage());
    } else {
      contentItems.push(emptyCis.length === 1 ? messageCi : buttonCi);
      contentItems.push(getLevel1HeaderContentItem(ci));
      contentItems.push(getLevel2HeaderContentItem(ci));
      contentItems.push(ci);
      //contentItems.push(emptyCis.length === 1 ? message2Ci : button2Ci);
    }
  };

  o.setEmptyFields = function() {
    var click = function() { o.setEmptyFields(); };
    var buttonCi = { type: 'custom', html: '<button ng-hide="$parent.allFieldsEmpty" ng-disabled="!$parent.pageIsOkay" style="float: right; margin: -44px 100px 0 0;" class="btn btn-info" ng-click="model.click()">Show me more empty fields</button>', click: click };
    var messageCi = { type: 'custom', html: '<div style="float: right; margin: -38px 140px 0 0;" >These are your final fields!</div>' };
    var button2Ci = { type: 'custom', html: '<div style="height: 100px; width: 94%"><button ng-hide="$parent.allFieldsEmpty" ng-disabled="!$parent.pageIsOkay" style="margin: 40px 0 20px 30%;" class="btn btn-large btn-info" ng-click="model.click()">Show me more empty fields</button></div>', click: click };
    var message2Ci = { type: 'custom', html: '<div style="text-align: center; width: 86%" >These are your final fields!</div>' };

    var removeHeadersWithNoChildren = function() {
      var next = true;
      for (var i = filteredContentItems.length-1; i >= 0; i--) {
        var current = (filteredContentItems[i].type === 'header');
        if (current && next) filteredContentItems.splice(i, 1);
        next = current;
      }
    };

    var addLevel1Headers = function() {
      var current, next;
      for (var i = filteredContentItems.length-1; i >= 0; i--) {
        current = filteredContentItems[i];
        if (next && current.parent.parent.path !== next.parent.parent.path) {
          addLevel1Header(filteredContentItems, next, i+1);
        }
        next = current;
      }
      addLevel1Header(filteredContentItems, current, 0);
    };

    var resetContentItems = function() {
      var contentItems = getClearedContentItems();
      if (filteredContentItems.length === 0) { contentItems.push(getNoFieldsMessage()); return; }

      contentItems.push(filteredContentItems.length < 10 ? messageCi : buttonCi);
      _.each(filteredContentItems, function(ci, index) {
        contentItems.push(ci);
        if (index > 10 && ci.type !== 'header') return false;
      });
      contentItems.push(filteredContentItems.length < 10 ? message2Ci : button2Ci);
    };

    var filteredContentItems = getFilteredContentItems({ keepHeaders: true });
    removeHeadersWithNoChildren();
    addLevel1Headers();
    resetContentItems();
  };

  return o;
});

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

    if (systemType === 'cityLink' && !dataToPost.linkId) url = configService.requests.urls.addCityLink;

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
