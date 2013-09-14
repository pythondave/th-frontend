thSchoolDashboardAppModule.directive('contentItem', function ($compile) {
  var contentItemHeader = '<div content-item-header model="model"></div>';
  var getStandardContentItem = function(contentItemType) {
    return '<div class="content-item content-item-{{model.systemName}}">' + contentItemHeader + '<div ' + contentItemType + ' model="model"><span style="color: red;">WIP (' + contentItemType + ')</span></div><hr/></div>';
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

thSchoolDashboardAppModule.directive('contentItemHeader', function() {
  return { restrict: 'A', replace: true, templateUrl: 'partials/content-items/content-item-header.html', scope: { model: '=' } };
});

thSchoolDashboardAppModule.directive('contentItemIcons', function() {
  return { restrict: 'A', replace: true, templateUrl: 'partials/content-items/content-item-icons.html', scope: { model: '=' } };
});

thSchoolDashboardAppModule.directive('timeEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/time-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
    }
  };
});

thSchoolDashboardAppModule.directive('moneyEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/money-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.model.currency = scope.model.currency || {};
      scope.model.currency.items = [{ id: 1, name: 'USD' }, { id: 2, name: 'GBP' }, { id: 3, name: 'Euro' }];
      scope.model.amount = scope.model.amount || {};
      scope.model.amount.editIconTip = 'Click to add amount';
      scope.model.amount.tip = 'Click to edit amount';
      scope.model.amount.allowDecimals = true;
      scope.model.amount.changed = scope.model.changed;
    }
  };
});

thSchoolDashboardAppModule.directive('dateEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/date-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal === oldVal) return;
        scope.model.changed();
      });
      scope.open = function() {
        $timeout(function() { scope.isOpenNoConflict = true; });
      };
      scope.$watch('isOpenNoConflict', function(newVal) {
        scope.tip = (newVal ? 'Select a date' : 'Click to edit date');
      });
    }
  };
});

thSchoolDashboardAppModule.directive('emailEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/email-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input = element[0].children[0];
      scope.model.editIconTip = 'Click to add email';
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = _.isProbablyValidEmail(newVal);
        if (newVal !== oldVal) scope.model.changed();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

thSchoolDashboardAppModule.directive('urlEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/url-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.model.urlTitle = scope.model.urlTitle || {};
      scope.model.urlTitle.changed = scope.model.changed;
      scope.model.url = scope.model.url || {};
      scope.model.url.showEditIcon = true;
      scope.model.url.isNotValidTip = 'This doesn\'t appear to be a valid URL. Please change it so it can be saved.';
      scope.$watch('model.url.val', function(newVal, oldVal) {
        scope.model.url.editIconTip = (newVal ? 'Click to edit URL' : 'Click to add URL');
        scope.model.url.isValid = _.isProbablyValidUrl(newVal);
        if (newVal === oldVal) return;
        scope.model.changed();
      });
      scope.$watch('model.url.isEditMode', function(isUrlEditMode) {
        if (isUrlEditMode) $timeout(function() { element[0].children[2].focus(); });
      });
    }
  };
});

thSchoolDashboardAppModule.directive('ngBlur', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngBlur']);
    element.bind('blur', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
}]);

thSchoolDashboardAppModule.directive('numberEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/number-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input = element[0].children[0];
      scope.model = scope.model || {};
      scope.model.editIconTip = scope.model.editIconTip || 'Click to add number';
      scope.model.restrictInputSettings = {};
      scope.model.restrictInputSettings.type = (scope.model.allowDecimals ? 'validMoneyCharsOnly' : 'digitsOnly');

      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = (scope.model.allowDecimals ? _.isValidMoneyValue(newVal) : _.isDigitsOnly(newVal)) && newVal!=='';
        if (newVal === oldVal) return;
        scope.model.changed();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

thSchoolDashboardAppModule.directive('textEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/text-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input = element[0].children[0];
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.editIconTip = (newVal ? 'Click to edit text' : 'Click to add text');
        scope.model.isValid = true;
        if (newVal === oldVal) return;
        scope.model.changed();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

thSchoolDashboardAppModule.directive('ratingEdit', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/rating-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal === oldVal) return;
        scope.model.changed();
      });
    }
  };
});

thSchoolDashboardAppModule.directive('fromFew', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/from-few.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {

/*
      //init list based on selection
      angular.forEach($scope.list, function(item) {
        if ($scope.selection.indexOf(item.id)>=0) { item.isSelected = true; }
      });
      
      //if list changes, synch selection and show/hide isSufficient class
      $scope.$watch('list', function(newValue, oldValue) {
        $scope.synchSelection();
        element.toggleClass('isSufficient', $scope.selection.length > 0);
      }, true);

      //if selection breaks the rules, change the list
      $scope.$watch('selection', function(newValue, oldValue) {
        var maxSelect = Number(attr.maxSelect);
        if (maxSelect && $scope.selection.length > maxSelect) {
          var item = getById($scope.list, $scope.selection[0]);
          if (item) item.isSelected = false;
        }
      }, true);
      
      $scope.getClass = function(item) {
        return (item.isSelected ? (attr.checkedClass || 'btn-success') : '');
      };
      
      //generic function
      var getById = function(arrayOfObjects, id) {
        for(var i=0; i<arrayOfObjects.length; i++) {
          if (arrayOfObjects[i].id == id) return arrayOfObjects[i];
        }
      };

      //synch selection to list (and keep the order of selection)
      $scope.synchSelection = function() {
        angular.forEach($scope.list, function(item) {
          var ind = $scope.selection.indexOf(item.id); //index of item in selection
          if (item.isSelected && ind === -1) $scope.selection.push(item.id); //selected but didn't exist => add
          if (!item.isSelected && ind > -1) $scope.selection.splice(ind, 1); //not selected but existed => remove
        });
      };
*/
    }
  };
});

thSchoolDashboardAppModule.directive('slider', ['$document', 'helperService', function($document, helperService) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'partials/slider.html',
    scope: { model: '=' }, //currently opinionated
    link: function postLink(scope, element, attrs) {
      var dragging = false, startPointX = 0, x = 0;
      var mainElement = element.children(0);
      
      if (!scope.model) scope.model = {};

      if (!scope.model.items) {
        scope.model.min = scope.model.min || 0;
        scope.model.max = scope.model.max || 100;
        scope.model.step = scope.model.step || 1;
        scope.model.items = helperService.generateList(scope.model.min, scope.model.max, scope.model.step, 'val');
      }

      scope.$watch('model.index', function(newVal) {
        if (dragging) return;
        if (!helperService.isInPositiveIntegerRange(0, scope.model.items.length-1, newVal)) return;

        scope.model.val = scope.model.items[scope.model.index].val;
        x = newVal / (scope.model.items.length-1);
        scope.x = x;
      });

      scope.mouseDown = function($event) {
        dragging = true;
        startPointX = $event.pageX;

        $document.on('mousedown', function($event) {
          $event.preventDefault();
        });
    
        // Bind to full document, to make move easier (not to lose focus on y axis)
        $document.on('mousemove', function($event) {
          if(!dragging) return;

          var moveDelta = $event.pageX - startPointX;

          x = x + (moveDelta / mainElement.outerWidth());
          if (x < 0) { x = 0; }
          else if (x > 1) { x = 1; }
          else { startPointX = $event.pageX; }

          scope.model.index = Math.floor((scope.model.items.length-1) * x * 1.001);
          scope.model.val = scope.model.items[scope.model.index].val;
          scope.$apply();
          scope.x = x;
        });

        $document.mouseup(function(){
            dragging = false;
            $document.unbind('mousemove');
            $document.unbind('mousedown');
        });
      };
    }
  };
}]);


thSchoolDashboardAppModule.factory('helperService', function () { //*** TODO: MOVE!
  var o = {};

  o.generateList = function(min, max, step, valPropertyName) {
    var list = [];
    for (var i = min; i <= max; i+=step) {
      var item = {};
      if (valPropertyName) { item[valPropertyName] = i; } else item = i;
      list.push(item);
    }
    return list;
  };

  o.isPositiveInteger = function(s) { return new RegExp(/^[0-9]*$/).test(s) && s !== ''; };
  o.isPositiveDecimal = function(s) { return new RegExp(/^(\d*\.\d{1,2}|\d+)$/).test(s) && s !== ''; };
  o.isInRange = function(min, max, val) { return (val >= min && val <= max); };
  o.isInPositiveIntegerRange = function(min, max, val) {
    return o.isPositiveInteger(val) && o.isInRange(min, max, val);
  };
  o.isInPositiveDecimalRange = function(min, max, val) {
    return o.isPositiveDecimal(val) && o.isInRange(min, max, val);
  };

  return o;
});

thSchoolDashboardAppModule.directive('fromMany', function ($timeout) {
  return {
    restrict: 'A',
    templateUrl: 'partials/from-many.html',
    scope: { model: '=' },
    transclude: false,
    link: function($scope, element, attr, ctrl) {
      /*
      var selectElement = $(element.children()[0]);
      var select2 = selectElement.select2();

      if (attr.multiple === '') {
        angular.element(selectElement).attr('multiple', '');
        if (!$scope.model.val) $scope.model.val = [];
      }
      
      $timeout(function() {
        options = {};
        options.placeholder = attr.placeholder;
        options.allowClear = attr.allowClear || true;
        options.width = attr.width || '300px';
        if ($scope.model.format) {
          options.formatResult = $scope.model.format;
          options.formatSelection = $scope.model.format;
        }
        select2.val($scope.model.val).select2(options);
      });
      
      element.bind('open', function () { $scope.$emit('setTip', $scope.model.tip); });
      element.bind('close', function () { $scope.$emit('setTip'); });
      element.bind('change', function () {
        $scope.$apply(function() {
          $scope.model.val = (select2.val() === null ? [] : select2.val());
        });
        setClass();
        $scope.$emit('setTip');
      });
      */
    }
  };
});

thSchoolDashboardAppModule.directive('restrictInput', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        var options = scope.$eval(attr.restrictInput);
        if (!options.regex && options.type) {
          switch (options.type) {
            case 'digitsOnly': options.regex = '^[0-9]*$'; break;
            case 'lettersOnly': options.regex = '^[a-zA-Z]*$'; break;
            case 'lowercaseLettersOnly': options.regex = '^[a-z]*$'; break;
            case 'uppercaseLettersOnly': options.regex = '^[A-Z]*$'; break;
            case 'lettersAndDigitsOnly': options.regex = '^[a-zA-Z0-9]*$'; break;
            case 'validMoneyCharsOnly': options.regex = '^[0-9.]*$'; break;
            case 'validPhoneCharsOnly': options.regex = '^[+0-9 ()/-]*$'; break;
            case 'validEmailCharsOnly': options.regex = '^[a-zA-Z0-9.@!#$%&\'*+-/=?^_`{|}~]*$'; break;
            default: options.regex = '';
          }
        }
        var reg = new RegExp(options.regex);
        if (reg.test(viewValue)) { //if valid view value, return it
          return viewValue;
        } else { //if not valid view value, use the model value (or empty string if that's also invalid)
          var overrideValue = (reg.test(ctrl.$modelValue) ? ctrl.$modelValue : '');
          element.val(overrideValue);
          return overrideValue;
        }
      });
    }
  };
});