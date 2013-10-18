var thUiFieldsModule = angular.module('thUiFieldsModule', ['thConfigModule']);

/*
  thUiFieldsModule
    * A module encapsulating generic UI fields

  dateEdit
  emailEdit
  fromFew
  fromMany
  locationEdit
  numberEdit
  ratingEdit
  slider
  textEdit
  timeEdit
  urlEdit

  fieldFormat
  restrictInput
  ngBlur

  fileUpload
*/

thUiFieldsModule.directive('dateEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/date-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal !== oldVal) scope.model.update();
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
        if (newVal !== oldVal) { scope.model.update(); }
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

thUiFieldsModule.directive('fromFew', function(configService, listFunctionsService) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/from-few.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      scope.model.isValid = true;
      scope.tryToToggleItem = function(item) {
        if (scope.model.preChangeConfirm && !scope.model.preChangeConfirm()) return;
        var toggled = listFunctionsService.toggleLimitedListItem(scope.model.items, item, {limit: scope.model.limit});
        if (toggled) {
          scope.model.update(listFunctionsService.getListVal(scope.model.items));
        }
      };
    }
  };
});

thUiFieldsModule.directive('fromMany', function (configService, $timeout) {
  return {
    restrict: 'A',
    templateUrl: configService.root + '/shared/ui-fields/partials/from-many.html',
    scope: { model: '=' },
    transclude: false,
    link: function(scope, element, attr, ctrl) {
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal !== oldVal) scope.model.update();
      });
    }
  };
});

thUiFieldsModule.directive('locationEdit', function(configService) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/location-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      if (!window.google) return;
      var mainElement = element[0].children[0];

      //set model defaults
      scope.model = scope.model || {};
      var defaults = { lat: 26, lng: 14, isSelected: false, zoom: (scope.model.lat ? 8 : 0) };
      _.defaults(scope.model, defaults);

      //set up initial map
      var center = new google.maps.LatLng(scope.model.lat, scope.model.lng);
      var options = {
        zoom: scope.model.zoom,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false
      };
      var map = new google.maps.Map(mainElement, options);
      var marker = new google.maps.Marker({ map: map, position: center, draggable: true });
      marker.setVisible(scope.model.isSelected);

      //events
      scope.$watch(function() { return scope.model.lat + scope.model.lng; }, function(newVal, oldVal) {
        var latLng = new google.maps.LatLng(scope.model.lat, scope.model.lng);
        map.setCenter(latLng);
        marker.setPosition(latLng);
        scope.model.val = (scope.model.isSelected ? scope.model.lat + ',' + scope.model.lng : undefined);
      });
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.isSelected = !!newVal;
        if (newVal === oldVal) return;
        scope.model.update();
      });
      scope.$watch('model.isSelected', function(newVal, oldVal) {
        marker.setVisible(newVal);
        if (!newVal) scope.model.val = undefined;
      });
      scope.$watch('model.zoom', function(newVal, oldVal) {
        if (newVal === oldVal) return;
        map.setZoom(newVal);
      });

      var updateLocation = function(lat, lng, isSelected) {
        scope.model.lat = lat;
        scope.model.lng = lng;
        scope.model.isSelected = (isSelected === undefined ? true : isSelected);
        scope.$apply();
      };

      google.maps.event.addListener(map, 'zoom_changed', function() {
        var zoom = map.getZoom();
        if (scope.model.zoom === zoom) return; //not actually changed
        scope.model.zoom = zoom;
        scope.$apply();
      });

      google.maps.event.addListener(map, 'click', function(location) {
        updateLocation(location.latLng.lat(), location.latLng.lng());
      });

      google.maps.event.addListener(marker, 'dragend', function(location) {
        updateLocation(location.latLng.lat(), location.latLng.lng());
      });
      
      google.maps.event.addListener(marker, 'dblclick', function() {
        scope.model.isSelected = false;
        scope.$apply();
      });

      //geolocation
      scope.setBasedOnGeolocation = function() {
        var success = function(geoposition) {
          scope.model.zoom = 10;
          updateLocation(geoposition.coords.latitude, geoposition.coords.longitude);
        };
        navigator.geolocation.getCurrentPosition(success);
      };

      scope.setBasedOnAddress = function(address) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address}, function(results, status) {
          if (!(results && results.length > 0)) return;
          scope.model.zoom = 10;
          var latLng = results[0].geometry.location;
          updateLocation(latLng.lat(), latLng.lng(), false);
        });
      };

      //
      if (scope.model.address) { scope.setBasedOnAddress(scope.model.address); }
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
        if (newVal !== oldVal) scope.model.update();
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
      scope.localVal = scope.model.val || 0;
      scope.$watch('model.val', function(newVal, oldVal) {
        if (newVal === oldVal) return;
        localVal = newVal || 0;
        scope.model.update();
      });
      scope.$watch('localVal', function(newVal, oldVal) { //localVal is unfortunately needed since rating uses '0' for 'undefined'
        if (newVal === oldVal) return;
        scope.model.val = newVal || undefined;
      });
    }
  };
});

thUiFieldsModule.directive('slider', ['configService','$document', 'isFunctionsService', '$timeout', function(configService, $document, isFunctionsService, $timeout) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/slider.html',
    scope: { model: '=' }, //currently opinionated
    link: function postLink(scope, element, attrs) {
      //initialise
      var dragging = false, startPointX = 0, x = 0; //x: proportion along slider
      var mainElement = element.children(0); //use jquery wrapper to get outerWidth

      //watches and events
      scope.$watch('model.index', function(newVal, oldVal) {
        if (dragging) return;
        if (!isFunctionsService.isInPositiveIntegerRange(0, scope.model.items.length-1, newVal)) return;
        x = newVal / (scope.model.items.length-1);
        scope.x = x;
        if (newVal !== oldVal) scope.model.update(scope.model.items[scope.model.index].val);
      });

      var updateScope = function(x) {
        x = (x < 0 ? 0 : (x > 1 ? 1 : x)); //force into 0-1 range
        scope.model.index = Math.floor((scope.model.items.length-1) * x * 1.001);
        scope.model.update(scope.model.items[scope.model.index].val);
        $timeout(function() {});
        scope.x = x;
      };

      scope.sliderMouseDown = function($event) {
        if (dragging) return;
        var x = ($event.offsetX || $event.originalEvent.layerX) / mainElement.outerWidth();
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

thUiFieldsModule.directive('textEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/text-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input1 = element[0].children[0], input2 = element[0].children[1];
      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.editIconTip = (newVal ? 'Click to edit text' : 'Click to add text');
        scope.model.isValid = true;
        if (newVal !== oldVal) scope.model.update();
      });
      scope.$watch('model.isEditMode', function(isEditMode) {
        if (isEditMode) $timeout(function() { input1.focus(); input2.focus(); });
      });
    }
  };
});

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

thUiFieldsModule.directive('urlEdit', function(configService, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: configService.root + '/shared/ui-fields/partials/url-edit.html',
    scope: { model: '=' },
    link: function(scope, element, attr, ctrl) {
      var input = element[0].children[(scope.model.showUrlTitle  ? 2 : 1)];

      scope.model.showEditIcon = true;
      scope.model.isNotValidTip = 'This doesn\'t appear to be a valid URL. Please change it so it can be saved.';

      scope.model.urlTitle.update = function() {
        scope.model.update();
      };

      var getHref = function(url) {
        if (!url) return;
        return (url.slice(0, 7) === 'http://' ? url : 'http://' + url);
      };

      scope.$watch('model.val', function(newVal, oldVal) {
        scope.model.href = getHref(scope.model.val);
        scope.model.editIconTip = (newVal ? 'Click to edit URL' : 'Click to add URL');
        if (newVal === oldVal) return;
        scope.model.update();
      });

      scope.$watch('model.isEditMode', function(isUrlEditMode) {
        if (isUrlEditMode) $timeout(function() { input.focus(); });
      });
    }
  };
});

//other stuff
thUiFieldsModule.filter('fieldFormat', function(numberFilter, currencyFilter) {
  return function(val, model) {
    if (model.type === 'numberEdit') {
      if (model.subType === 'money') { return currencyFilter(val, model.currencySymbol); }
      if (model.subType === 'plain') { return val; }
      if (val === '') return '';
      return numberFilter(val);
    }
    if (model.type === 'slider') {
      var selectedItem = model.items[model.index];
      if (selectedItem) return (selectedItem.description || (selectedItem.val + (model.suffix ? model.suffix : '')));
    }
    return val;
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

thUiFieldsModule.directive('fileUpload', function($http, configService) {
  //*** TODO - consider refactoring - see note in default.html
  var seed = Math.floor(Math.random()*100);
  return {
    restrict: 'AC',
    templateUrl: configService.root + '/shared/ui-fields/partials/file-upload.html',
    scope: { model: '='},
    link: function($scope, element, attr, ctrl) {
      $scope.el = element;
      $scope.processing = false;
      if ($scope.model.val === undefined) { $scope.model.val = []; }

      $scope.update = function(e,data) {
        $.blueimp.fileupload.resetProgress(e);
        $scope.processing = false;
        $scope.model.val.push(data._response.result);
        $scope.$apply();
      };

      $scope.uploader = $(element).find(".uploaderInput")[0];

      $scope.fileAddedEvent = function(e,data) {
        $.each(data.files, function (index, file) {
          if (file.error !== undefined)
            $scope.model.error = file.name + ' - ' + file.error;
          else
            delete $scope.model["error"];
        });
        $scope.processing = false;
        $scope.$apply();
      };

      $scope.fileSendEvent = function (e, data) {
        $scope.processing = true;
        $scope.$apply();
      };

      $scope.uploadFailedEvent = function (e, data) {
        $scope.processing = false;
        if (data.result === undefined) {
          $scope.model.error = data.errorThrown;
          $scope.$apply();
          return;
        }
        $.each(data.result.files, function (index, file) {
          $scope.model.error = file.name + ' - ' + file.error;
        });
        $scope.$apply();
      };

      $($scope.uploader).fileupload({
        type: 'POST',
        url: $scope.model.uploadUrl,
        dataType: 'json',
        autoUpload: true,
        maxFileSize: 2097152, // 5 MB
        maxNumberOfFiles: $scope.model.maxFiles,
        paramName: 'file',
        acceptFileTypes: /(\.|\/)(jpg|gif|png)$/i
      })

      .on('fileuploadprogress', $.blueimp.fileupload.uploadProgressEvent)
      .on('fileuploaddone', $scope.update)
      .on('fileuploadfail', $scope.uploadFailedEvent)
      .on('fileuploadadded', $scope.fileAddedEvent)
      .on('fileuploadsend',$scope.fileSendEvent);

      $scope.deleteFile = function(file,index) {
        $http.post($scope.model.deleteUrl + file.id, {}, configService.requests.postConfig.headers);
        $scope.model.val = _.without($scope.model.val,file);
      };

      $scope.$on("$destroy", function() { delete $scope.model["error"]; });

      $scope.rand = function() { return seed; };

      //bind events
      $scope.mouseenter = function() { $scope.$emit('mouseenter', $scope.model); };
      $scope.mouseleave = function() { $scope.$emit('mouseleave', $scope.model); };
    }
  };
});
