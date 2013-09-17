var thContentItemsModule = angular.module('thContentItemsModule', ['thConfigModule', 'thUiFieldsModule']);

/*
thContentItemsModule:
  * A module encapsulating anything to do with content items

Content item:
  * A flexible, building-block directive which can be used to build entire pages from only a structure model
  * See spas/school/dashboard for a good example of edit pages built using these directives
*/

thContentItemsModule.factory('contentItemService', function ($timeout, serverService) {
  var o = {};

  var contentItemTypes = { //possible content item types and useful properties (throttling wait times)
    dateEdit: { wait: 1 },
    emailEdit: { wait: 2000 },
    fileUpload: { wait: 1 },
    fromFew: { wait: 1 },
    fromMany: { wait: 1 },
    latLongEdit: { wait: 2000 },
    moneyEdit: { wait: 2000 },
    numberEdit: { wait: 2000 },
    ratingEdit: { wait: 1 },
    slider: { wait: 2000 },
    textEdit: { wait: 3000 }, //longer because has no validation and can be more data
    timeEdit: { wait: 2000 },
    urlEdit: { wait: 2000 }
  };

  o.ContentItem = function (initialVals) {
    var defaultVals = { title: 'This is a title', description: undefined, systemName: '', weight: 1 };
    _.assign(this, defaultVals, initialVals || {});
    if (!contentItemTypes[this.type]) { console.log('Content item type not found: ', this.type); return; }
    var wait = contentItemTypes[this.type].wait;
    this.processChangeUsingThrottle = _.throttle(this.processChange, wait, {leading: false});
  };

  o.ContentItem.prototype.processChange = function() {
    if (!this.isValid) return; //don't process if invalid
    this.isBeingProcessed = true;
    this.isDirty = false; //not dirty as soon as processing starts
    $timeout(function() {});
    var contentItem = this;
    serverService.sendToServer(this.systemName + '=' + this.val).then(function() {
      if (contentItem.isDirty) return; //re-dirtied since process started, so can't finish off yet
      contentItem.isBeingProcessed = false;
      contentItem.isRecentlyProcessed = true;
      $timeout(function() { contentItem.isRecentlyProcessed = false; }, 3000); //not recently processed after 3 seconds
    });
  };

  o.ContentItem.prototype.changed = function() {
    this.isDirty = true;
    this.processChangeUsingThrottle();
  };

  return o;
});

thContentItemsModule.directive('contentItem', function ($compile) {
  var devTemp = ''; //<div>model.val: {{model.val}}; model.absoluteWeight: {{model.absoluteWeight}}</div>';
  var contentItemHeader = '<div content-item-header model="model"></div>';
  var getStandardContentItem = function(contentItemType) {
    return '<div class="content-item content-item-{{model.systemName}}">' + devTemp + contentItemHeader + '<div ' + contentItemType + ' model="model"><span style="color: red;">WIP (' + contentItemType + ')</span></div><hr/></div>';
  };
  var templates = {
    header: '<h3><i class="icon-{{model.icon}}"></i> {{model.title}}</h3>',
    list: '<div><p><span class="content-item-icon"><i class="icon-{{model.icon}}"></i></span>{{model.title}}</p><ul><li ng-repeat="item in model.items">{{item}}</li></ul><hr/></div>',
    text: '<div style={{model.style}}><span class="content-item-icon" ng-show="model.icon"><i class="icon-{{model.icon}}"></i></span>{{model.val}}<hr/></div>',
    fileUpload: getStandardContentItem('file-upload'),
    dateEdit: getStandardContentItem('date-edit'),
    emailEdit: getStandardContentItem('email-edit'),
    fromFew: getStandardContentItem('from-few'),
    fromMany: getStandardContentItem('from-many'),
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
    var html = templates[scope.model.type] || '<div>' + contentItemHeader + '<div style="color: red">Content item type \'{{model.type}}\' not found<hr/></div></div>';
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
