var thContentItemsModule = angular.module('thContentItemsModule', ['thConfigModule', 'thUiFieldsModule']);

/*
thContentItemsModule:
  * A module encapsulating anything to do with content items

Content item:
  * A flexible, building-block directive which can be used to build entire pages from only a structure model
  * See spas/school/dashboard for a good example of edit pages built using these directives
*/

thContentItemsModule.factory('contentItemService', function ($timeout, serverService, listFunctionsService) {
  var o = {};

  var globalDefaultVals = { weight: 1, showClear: true };

  var contentItemTypes = { //possible content item types and defaults (weight, throttling wait times)
    custom: {},
    header: { weight: 0 },
    list: { weight: 0 },
    text: { weight: 0 },
    html: { weight: 0 },
    dateEdit: { wait: 1 },
    emailEdit: { wait: 2000 },
    fileUpload: { wait: 1 },
    fromFew: { wait: 1 },
    fromMany: { wait: 1 },
    locationEdit: { wait: 1 },
    moneyEdit: { wait: 2000 },
    numberEdit: { wait: 2000 },
    ratingEdit: { wait: 1, showClear: false },
    slider: { wait: 2000 },
    textEdit: { wait: 3000 }, //longer because has no validation and can be more data
    timeEdit: { wait: 2000 },
    urlEdit: { wait: 2000 }
  };

  o.ContentItem = function (initialVals) {
    var typeObject = contentItemTypes[initialVals.type];
    _.assign(this, globalDefaultVals, typeObject, initialVals || {});
    this.processChangeUsingThrottle = _.throttle(this.processChange, this.wait, {leading: false});
    if (!typeObject) console.log('Content item type not found: ', initialVals, initialVals.type);
  };

  //this function can be overridden so that the content item can post external dynamic data
  o.ContentItem.prototype.getExternalDataToPost = function() { return {}; };

  o.ContentItem.prototype.getDataToPost = function() {
    var o = _.assign({}, this.fixedData, this.getExternalDataToPost());
    if (this.type === 'urlEdit') {
      o[this.systemName.title] = this.urlTitle.val;
      o[this.systemName.url] = this.val;
    } else {
      o[this.systemName] = this.val;
    }
    return o;
  };

  o.ContentItem.prototype.processChange = function() {
    if (!this.isValid) return; //don't process if invalid
    this.isBeingProcessed = true;
    this.isDirty = false; //not dirty as soon as processing starts
    $timeout(function() {});
    var ci = this;
    var dataToPost = this.getDataToPost();
    serverService.sendToServer(this.systemType, dataToPost).then(function(response) {
      if (ci.type === 'urlEdit' && !ci.fixedData.linkId) { ci.fixedData.linkId = response.data.id; } //*** TODO make 'linkId' dynamic; TODO if the server takes longer than 2 seconds to add, we could end up adding twice
      if (ci.isDirty) return; //re-dirtied since process started, so can't finish off yet
      if (ci.onChangeCallback) ci.onChangeCallback();
      ci.isBeingProcessed = false;
      ci.isRecentlyProcessed = true;
      $timeout(function() {});
      $timeout(function() { ci.isRecentlyProcessed = false; }, 3000); //not recently processed after 3 seconds
    });
  };

  o.ContentItem.prototype.getIsValid = function(val) {
    if (val === '' || val === undefined) return true;
    if (this.type === 'dateEdit') { return true; } //*** WIP
    if (this.type === 'emailEdit') return _.isProbablyValidEmail(val);
    if (this.type === 'fileUpload') { return true; } //*** WIP
    if (this.type === 'fromFew') { return true; } //*** WIP
    if (this.type === 'fromMany') { return true; } //*** WIP
    if (this.type === 'locationEdit') { return true; } //*** WIP
    if (this.type === 'moneyEdit') { return true; } //*** WIP
    if (this.type === 'numberEdit') {
      if (this.min && this.val < this.min) return false;
      if (this.max && this.val > this.max) return false;
      return (this.allowDecimals ? _.isValidMoneyValue(val) : _.isDigitsOnly(val));
    } //*** WIP
    if (this.type === 'ratingEdit') { return true; } //*** WIP
    if (this.type === 'slider') { return true; } //*** WIP
    if (this.type === 'textEdit') { return true; } //*** WIP
    if (this.type === 'timeEdit') { return true; } //*** WIP
    if (this.type === 'urlEdit') {
      return _.isProbablyValidUrl(val) || val === ''; }
  };

  o.ContentItem.prototype.init = function(newVal, newVal2) {
    this.val = newVal;
    if (this.type === 'ratingEdit' && this.valueTips) { this.selectionDescription = this.valueTips[this.val-1]; } //*** Not DRY
    if (this.subType === 'money') {
      this.allowDecimals = true;
      this.currencySymbol = this.currencySymbol || '\u00A3';
    }
    if (this.type === 'slider') {
      if (!this.items) {
        _.defaults(this, { min: 0, max: 100, step: 1 });
        this.items = listFunctionsService.generateList(this.min, this.max, this.step, 'val');
      }
      this.index = _.findIndex(this.items, function(item) { return item.val === this.val; }, this);
    }
    if (this.type === 'fromFew') {
      _.markMatchingCollectionItems(this.items, this.val);
    }
    if (this.type === 'ratingEdit') {
    }
    if (this.type === 'urlEdit') {
      this.fixedData = this.fixedData || {};
      this.systemName = _.defaults({}, this.systemName, { title: 'title', url: 'url' });
      this.urlTitle = _.defaults({}, (_.isObject(newVal2) ? newVal2 : { val: newVal2 }));
    }
    if (this.type === 'locationEdit' && this.val) {
      this.lat = this.val.split(',')[0];
      this.lng = this.val.split(',')[1];
      this.isSelected = true;
      this.zoom = 8;
    }

    this.isValid = this.getIsValid(this.val);
  };

  o.ContentItem.prototype.update = function(newVal) { //set val (if passed) and process the change
    if (arguments.length > 0) this.val = newVal; //update val if passed
    if (this.type === 'ratingEdit' && this.valueTips) { this.selectionDescription = this.valueTips[this.val-1]; } //*** Not DRY
    this.isValid = this.getIsValid(this.val);
    this.isDirty = true;
    this.processChangeUsingThrottle();
  };

  o.ContentItem.prototype.getWeight = function() {
    if (this.absoluteWeight === undefined || this.absoluteWeight === 0) return 0;
    if (this.val === undefined || this.val === '') return 0;
    return this.absoluteWeight;
  };

  o.ContentItem.prototype.getIsEmpty = function() {
    return (this.val === undefined || this.val === '');
  };

  o.ContentItem.prototype.getIsMissing = function() {
    if (this.absoluteWeight === undefined || this.absoluteWeight === 0) return false;
    return this.getIsEmpty();
  };

  return o;
});

thContentItemsModule.directive('contentItem', function ($compile) {
  var devTemp = ''; //'<div>model.val: {{model.val}}; model.absoluteWeight: {{model.absoluteWeight}}</div>'; //use to show some value during development
  var contentItemHeader = '<div content-item-header model="model"></div>';
  var getStandardContentItem = function(contentItemType) {
    return '<div class="content-item content-item-{{model.systemName}}">' + devTemp + contentItemHeader + '<div ' + contentItemType + ' model="model"><span style="color: red;">WIP (' + contentItemType + ')</span></div><span ng-hide="model.hideHr"><hr/></span></div>';
  };

  var templates = {
    header: '<h3 class="header" style="{{model.style}}"><i class="icon-{{model.icon}}"></i> {{model.title}}</h3>',
    list: '<div><p><span class="content-item-icon"><i class="icon-{{model.icon}}"></i></span>{{model.title}}</p><ul><li ng-repeat="item in model.items">{{item}}</li></ul><hr/></div>',
    text: '<div style={{model.style}}><span class="content-item-icon" ng-show="model.icon"><i class="icon-{{model.icon}}"></i></span>{{model.val}}</div><hr/>',
    fileUpload: getStandardContentItem('file-upload'),
    dateEdit: getStandardContentItem('date-edit'),
    emailEdit: getStandardContentItem('email-edit'),
    fromFew: getStandardContentItem('from-few'),
    fromMany: getStandardContentItem('from-many'),
    locationEdit: getStandardContentItem('location-edit'),
    moneyEdit: getStandardContentItem('money-edit'),
    numberEdit: getStandardContentItem('number-edit'),
    ratingEdit: getStandardContentItem('rating-edit'),
    slider: getStandardContentItem('slider'),
    textEdit: getStandardContentItem('text-edit'),
    timeEdit: getStandardContentItem('time-edit'),
    urlEdit: getStandardContentItem('url-edit')
  };

  var linker = function(scope, element, attrs) {
    var model = scope.model;
    if (!model) return;
    var html = (model.type === 'html' && model.val) || model.html || templates[model.type] || '<div>' + contentItemHeader + '<div style="color: red">Content item type \'{{model.type}}\' not found<hr/></div></div>';
    element.html(html).show();
    $compile(element.contents())(scope);
  };

  return { restrict: 'A', replace: true, link: linker, scope: { model: '=' } };
});

thContentItemsModule.directive('contentItemHeader', function(configService) {
  return { restrict: 'A', replace: true, templateUrl: configService.root + '/shared/content-items/partials/header.html', scope: { model: '=' } };
});

thContentItemsModule.directive('contentItemIcons', function(configService) {
  return { restrict: 'A', replace: true, templateUrl: configService.root + '/shared/content-items/partials/icons.html', scope: { model: '=' } };
});

