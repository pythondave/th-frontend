var thUiFieldsModule = angular.module('thUiFieldsModule', ['thConfigModule']);

thUiFieldsModule.directive('timeEdit', function(configService) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/time-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
    }
  };
});

thUiFieldsModule.directive('moneyEdit', function(configService) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/money-edit.html',
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

thUiFieldsModule.directive('dateEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/date-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = true;
        if (newVal !== oldVal) scope.model.changed();
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

thUiFieldsModule.directive('emailEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/email-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input = element[0].children[0];
      scope.model.editIconTip = 'Click to add email';
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = _.isProbablyValidEmail(newVal);
        if (newVal !== oldVal) { scope.model.changed(); }
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

thUiFieldsModule.directive('urlEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/url-edit.html',
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
        if (newVal !== oldVal) scope.model.changed();
      });
      scope.$watch('model.url.isEditMode', function(isUrlEditMode) {
        if (isUrlEditMode) $timeout(function() { element[0].children[2].focus(); });
      });
    }
  };
});

thUiFieldsModule.directive('numberEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/number-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input = element[0].children[0];
      scope.model = scope.model || {};
      scope.model.editIconTip = scope.model.editIconTip || 'Click to add number';
      scope.model.restrictInputSettings = {};
      scope.model.restrictInputSettings.type = (scope.model.allowDecimals ? 'validMoneyCharsOnly' : 'digitsOnly');

      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = (scope.model.allowDecimals ? _.isValidMoneyValue(newVal) : _.isDigitsOnly(newVal)) && newVal!=='';
        if (newVal !== oldVal) scope.model.changed();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

thUiFieldsModule.directive('textEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/text-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input = element[0].children[0];
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.editIconTip = (newVal ? 'Click to edit text' : 'Click to add text');
        scope.model.isValid = true;
        if (newVal !== oldVal) scope.model.changed();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

thUiFieldsModule.directive('ratingEdit', function(configService) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/rating-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = true;
        if (newVal !== oldVal) scope.model.changed();
      });
    }
  };
});

thUiFieldsModule.directive('fromFew', function(configService, helperService) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/from-few.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.model.isValid = true;
      scope.tryToToggleItem = function(item) {
        var toggled = helperService.toggleLimitedListItem(scope.model.items, item, {limit: scope.model.limit});
        if (toggled) {
          scope.model.val = helperService.getListVal(scope.model.items);
          scope.model.changed();
        }
      };
    }
  };
});

thUiFieldsModule.directive('slider', ['configService','$document', 'helperService', '$timeout', function(configService, $document, helperService, $timeout) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/slider.html',
    scope: { model: '=' }, //currently opinionated
    link: function postLink(scope, element, attrs) {
      //initialise
      var dragging = false, startPointX = 0, x = 0; //x: proportion along slider
      var mainElement = element.children(0);

      scope.model = scope.model || {};

      if (!scope.model.items) { //initialise items if not already set
        scope.model.min = scope.model.min || 0;
        scope.model.max = scope.model.max || 100;
        scope.model.step = scope.model.step || 1;
        scope.model.items = helperService.generateList(scope.model.min, scope.model.max, scope.model.step, 'val');
      }

      //initialise index based on val
      scope.model.index = _.findIndex(scope.model.items, function(item) { return item.val === scope.model.val; });

      //watches and events
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = true;
        if (newVal !== oldVal) scope.model.changed();
      });

      scope.$watch('model.index', function(newVal, oldVal) {
        if (dragging) return;
        if (!helperService.isInPositiveIntegerRange(0, scope.model.items.length-1, newVal)) return;

        scope.model.val = scope.model.items[scope.model.index].val;
        x = newVal / (scope.model.items.length-1);
        scope.x = x;
      });

      var updateScope = function(x) {
        x = (x < 0 ? 0 : (x > 1 ? 1 : x)); //force into 0-1 range
        scope.model.index = Math.floor((scope.model.items.length-1) * x * 1.001);
        scope.model.val = scope.model.items[scope.model.index].val;
        $timeout(function() {});
        scope.x = x;
      };

      scope.sliderMouseDown = function($event) {
        if (dragging) return;
        var x = $event.offsetX / mainElement.outerWidth();
        updateScope(x);
      };

      scope.handleMouseDown = function($event) {
        dragging = true;
        startPointX = $event.pageX;

        $document.on('mousedown', function($event) {
          $event.preventDefault(); //avoids some unwanted cursors in some browsers
        });
    
        // Bind to full document, to make move easier (not to lose focus on y axis)
        $document.on('mousemove', function($event) {
          if(!dragging) return;

          var moveDelta = $event.pageX - startPointX;

          x = x + (moveDelta / mainElement.outerWidth());
          if (x < 0) { x = 0; }
          else if (x > 1) { x = 1; }
          else { startPointX = $event.pageX; }

          updateScope(x);
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

thUiFieldsModule.directive('fromMany', function (configService, $timeout) {
  return {
    restrict: 'A',
    templateUrl: configService.root + '/shared/ui-fields/partials/from-many.html',
    scope: { model: '=' },
    transclude: false,
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isValid = true;
        if (newVal !== oldVal) scope.model.changed();
      });
    }
  };
});

thUiFieldsModule.directive('restrictInput', function() {
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

thUiFieldsModule.directive('ngBlur', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngBlur']);
    element.bind('blur', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
}]);

thUiFieldsModule.factory('helperService', function () { //*** TODO: MOVE!
  var o = {};

  o.toggleLimitedListItem = function(listItems, item, options) {
    //returns true if the listItems were changed
    options = _.defaults({}, options, { limit: 10, markerAttributeName: 'isSelected' });
    var numSelected = _.filter(listItems, options.markerAttributeName).length;
    if (item.isSelected) { item.isSelected = false; return true; } //deselecting is always okay
    if (options.limit === 1) { _.setAll(listItems, options.markerAttributeName, false); numSelected = 0; } //reset for limit 1
    if (numSelected < options.limit) { item.isSelected = true; return true; } //select if under limit
  };

  o.getListVal = function(listItems, options) {
    options = _.defaults({}, options, { markerAttributeName: 'isSelected', idAttributeName: 'id' });
    return _(listItems).filter(function(item) { return item[options.markerAttributeName]; }).pluck(options.idAttributeName).join();
  };

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

