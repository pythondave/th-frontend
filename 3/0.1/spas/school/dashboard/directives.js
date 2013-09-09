thSchoolDashboardAppModule.directive('contentItem', function ($compile) {
  var fieldHeader = '<div field-header model="model"></div>';
  var getStandardField = function(fieldValueType) {
    return '<div class="field field-{{model.systemName}}">' + fieldHeader + '<div ' + fieldValueType + ' model="model"><span style="color: red;">WIP (' + fieldValueType + ')</span></div><hr/></div>';
  };
  var templates = {
    header: '<h3><i class="icon-{{model.icon}}"></i> {{model.title}}</h3>',
    list: '<div><p><span class="field-icon"><i class="icon-{{model.icon}}"></i></span>{{model.title}}</p><ul><li ng-repeat="item in model.items">{{item}}</li></ul><hr/></div>',
    text: '<div style={{model.style}}><span class="field-icon" ng-show="model.icon"><i class="icon-{{model.icon}}"></i></span>{{model.val}}<hr/></div>',
    fileUpload: getStandardField('file-upload'),
    dateEdit: getStandardField('date-edit'),
    emailEdit: getStandardField('email-edit'),
    fromFew: getStandardField('from-few'),
    fromMany: getStandardField('from-many'),
    moneyEdit: getStandardField('money-edit'),
    numberEdit: getStandardField('number-edit'),
    ratingEdit: getStandardField('rating-edit'),
    slider: getStandardField('slider'),
    textEdit: getStandardField('text-edit'),
    urlEdit: getStandardField('url-edit')
  };

  var linker = function(scope, element, attrs) {
    var model = scope.model;
    if (!model) return;
    var html = templates[scope.model.type] || '<div>' + fieldHeader + '<div style="color: red">Content item type \'{{model.type}}\' not found<hr/></div></div>';
    element.html(html).show();
    $compile(element.contents())(scope);
  };

  return { restrict: 'A', replace: true, link: linker, scope: { model: '=' } };
});

thSchoolDashboardAppModule.directive('fieldHeader', function() {
  return { restrict: 'A', replace: true, templateUrl: 'partials/field-header.html', scope: { model: '=' } };
});

thSchoolDashboardAppModule.directive('urlEdit', function($timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/url-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal === oldVal) return;
        scope.model.changed();
      });
      scope.$watch('model.isUrlEditMode', function(isUrlEditMode) {
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
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal === oldVal) return;
        scope.model.changed();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { element[0].children[1].focus(); element[0].children[2].focus(); });
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
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal === oldVal) return;
        scope.model.changed();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { element[0].children[1].focus(); element[0].children[2].focus(); });
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


thSchoolDashboardAppModule.directive('WIPfromMany', function ($timeout) {
  return {
    restrict: 'A',
    templateUrl: 'partials/from-many.html',
    scope: { model: '=' },
    transclude: false,
    link: function($scope, element, attr, ctrl) {
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