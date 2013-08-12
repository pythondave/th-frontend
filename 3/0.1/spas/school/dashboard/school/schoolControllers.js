// *** TODO: refactor the various factories, services and controllers on this page (e.g. move to better files and/or modules)

thSchoolDashboardAppModule.factory('serverService', function ($injector) {
  var o = {};
  o.sentToServer = [];
  o.sendToServer = function(value) {
    o.sentToServer.push(value);
  };
  return o;
});

thSchoolDashboardAppModule.factory('fieldService', function (serverService) {
  var o = {};
  o.Field = function (initialVals) {
    var defaultVals = {
      title: 'This is a title', description: 'This is a description',
      systemName: '', val: 3, max: 5
    };
    _.assign(this, defaultVals, initialVals || {});
  };
  o.Field.prototype.hover = function(hoveringOverVal) {
    this.tip = 'This is a tip relating to ' + hoveringOverVal + ' star' + (hoveringOverVal===1?'':'s');
  };
  o.Field.prototype.change = function(val, oldVal) {
    this.description = 'This is a description relating to ' + val + ' star' + (val===1?'':'s');
    if (val !== oldVal) {
      serverService.sendToServer(this.systemName + '=' + val);
    }
  };
  return o;
});

thSchoolDashboardAppModule.controller('SchoolMenuCtrl', function($scope, $state, $timeout, $location, appLoading) {
  $scope.$on('$viewContentLoaded', function(){
    $scope.useAnimationHack1 = true;
    $timeout(function() { $scope.useAnimationHack1 = false; appLoading.ready(); }, 500 );
  });

  $scope['section' + $state.params['sectionId'] + 'IsOpen'] = true; //set initial open section
  $scope.getClass = function(sectionId, subSectionId) { //*** TODO: think about whether this can be more elegant
    return (sectionId == $state.params['sectionId'] && subSectionId == $state.params['subSectionId'] ? 'sub-section-selected' : '');
  };
});

thSchoolDashboardAppModule.controller('SchoolCtrl', function($scope, $stateParams, $timeout, serverService, fieldService,
    alertService, list1Service, list2Service, list3Service, countryService) {

  $scope.alerts = alertService.config({ success: { message: '{{status}} {{fullName}}' }, error: { message: 'Error: Unable to process {{fullName}}' } });

  $scope.serverService = serverService;

  //rating
  $scope.ratingField1 = new fieldService.Field({ systemName: 'ratingField1', val: 2, title: 'Example rating widget (5-stars). This is the title of a field whose value can have between 1 and 5 stars.' });
  $scope.$watch('ratingField1.val', function(val, oldVal) { $scope.ratingField1.change(val, oldVal); });

  $scope.ratingField2 = new fieldService.Field({ systemName: 'ratingField2', max: 7, title: 'Example rating widget (7-stars)' });
  $scope.$watch('ratingField2.val', function(val, oldVal) { $scope.ratingField2.change(val, oldVal); });

  //date
  $scope.dateField1 = new Date();

  //time
  $scope.timeField1 = new Date();

  //selectManyFromFew
  $scope.list1 = list1Service.list;
  $scope.selection1 = [23, 25];

  $scope.list2 = list2Service.list;
  $scope.selection2 = [35];
  
  $scope.list3 = list3Service.list;
  $scope.selection3 = [23, 22];

  //selectFromMany
  $scope.countries = countryService.countries;
  $scope.selection = {};
  $scope.selection.country1 = { tip: 'Tip for country 1' };
  $scope.selection.country2 = { val: 150, tip: 'Tip for country 2' };
  $scope.selection.countries1 = { tip: 'Tip for countries 1' };
  $scope.selection.countries2 = { val: [50, 150], tip: 'Tip for countries 2' };
  $scope.selection.country3 = { val: 22, tip: 'Tip for country 3' };
  $scope.selection.country3.isSufficient = function() { //example of custom 'isSufficient' function
    return $scope.selection.country3.val % 2 === 1;
  };
  $scope.selection.country4 = { val: 150, tip: 'Tip for country 4' };
  $scope.selection.countries3 = { val: [50, 150], tip: 'Tip for countries 3' };
  
  $scope.format = function(item) {
    return "<img class='flag' src='http://beta.teacherhorizons.com/static/prototypes/design/registration/static/images/flags/" + item.text.toLowerCase() + ".png'/>" + item.text;
  };
});

thSchoolDashboardAppModule.directive('selectManyFromFew', function() {
  return {
    restrict: 'A',
    templateUrl: 'school/partials/selectManyFromFew.html',
    scope: { list: '=', selection: '=' },
    transclude: true,
    link: function($scope, element, attr, ctrl) {

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
    }
  };
});

thSchoolDashboardAppModule.service('list1Service', function() {
  return {
    list: [
      { id: 22, name: 'A value'},
      { id: 23, name: 'Value 2'},
      { id: 24, name: 'A longer value'},
      { id: 25, name: 'Value 4'},
      { id: 26, name: 'A particularly long value'}
    ]
  };
});

thSchoolDashboardAppModule.service('list2Service', function() {
  return {
    list: [
      { id: 33, name: 'Something'},
      { id: 34, name: 'Something else'},
      { id: 35, name: 'A third thing'},
      { id: 36, name: 'This is too much'}
    ]
  };
});

thSchoolDashboardAppModule.service('list3Service', function() {
  return {
    list: [
      { id: 22, name: 'Value a'},
      { id: 23, name: 'Value b'},
      { id: 24, name: 'Value c'},
      { id: 25, name: 'Value d'},
      { id: 26, name: 'Value e'}
    ]
  };
});

thSchoolDashboardAppModule.directive('selectFromMany', function ($timeout) {
  return {
    restrict: 'A',
    templateUrl: 'school/partials/selectFromMany.html',
    scope: { list: '=', field: '=', format: '=' },
    transclude: false,
    link: function($scope, element, attr, ctrl) {
      var selectElement = $(element.children()[0]);
      var select2 = selectElement.select2();

      if (attr.multiple === '') {
        angular.element(selectElement).attr('multiple', '');
        if (!$scope.field.val) $scope.field.val = [];
      }
      
      var isSufficient = $scope.field.isSufficient || function() {
        var val = $scope.field.val;
        return !(!val || val.length===0);
      };
      
      var setClass = function() {
        var div = element.find('div').eq(0);
        div.toggleClass('isSufficient', isSufficient());
        div.removeClass('select2-container-active');
      };
      
      $timeout(function() {
        options = {};
        options.placeholder = attr.placeholder;
        options.allowClear = attr.allowClear || true;
        options.width = attr.width || '300px';
        if ($scope.format) {
          options.formatResult = $scope.format;
          options.formatSelection = $scope.format;
        }
        if (isSufficient()) { options.containerCssClass = 'isSufficient'; }
        select2.val($scope.field.val).select2(options);
      });
      
      element.bind('open', function () { $scope.$emit('setTip', $scope.field.tip); });
      element.bind('close', function () { $scope.$emit('setTip'); });
      element.bind('change', function () {
        $scope.$apply(function() {
          $scope.field.val = (select2.val() === null ? [] : select2.val());
        });
        setClass();
        $scope.$emit('setTip');
      });
    }
  };
});

thSchoolDashboardAppModule.service('countryService', function() {
  return {
    countries: [
      { id: 21, name: "United States" },
      { id: 22, name: "United Kingdom" },
      { id: 23, name: "Afghanistan" },
      { id: 24, name: "Albania" },
      { id: 25, name: "Algeria" },
      { id: 26, name: "American Samoa" },
      { id: 27, name: "Andorra" },
      { id: 28, name: "Angola" },
      { id: 29, name: "Anguilla" },
      { id: 30, name: "Antarctica" },
      { id: 31, name: "Antigua and Barbuda" },
      { id: 32, name: "Argentina" },
      { id: 33, name: "Armenia" },
      { id: 34, name: "Aruba" },
      { id: 35, name: "Australia" },
      { id: 36, name: "Austria" },
      { id: 37, name: "Azerbaijan" },
      { id: 38, name: "Bahamas" },
      { id: 39, name: "Bahrain" },
      { id: 40, name: "Bangladesh" },
      { id: 41, name: "Barbados" },
      { id: 42, name: "Belarus" },
      { id: 43, name: "Belgium" },
      { id: 44, name: "Belize" },
      { id: 45, name: "Benin" },
      { id: 46, name: "Bermuda" },
      { id: 47, name: "Bhutan" },
      { id: 48, name: "Bolivia" },
      { id: 49, name: "Bosnia and Herzegovina" },
      { id: 50, name: "Botswana" },
      { id: 51, name: "Bouvet Island" },
      { id: 52, name: "Brazil" },
      { id: 53, name: "British Indian Ocean Territory" },
      { id: 54, name: "Brunei Darussalam" },
      { id: 55, name: "Bulgaria" },
      { id: 56, name: "Burkina Faso" },
      { id: 57, name: "Burundi" },
      { id: 58, name: "Cambodia" },
      { id: 59, name: "Cameroon" },
      { id: 60, name: "Canada" },
      { id: 61, name: "Cape Verde" },
      { id: 62, name: "Cayman Islands" },
      { id: 63, name: "Central African Republic" },
      { id: 64, name: "Chad" },
      { id: 65, name: "Chile" },
      { id: 66, name: "China" },
      { id: 67, name: "Christmas Island" },
      { id: 68, name: "Cocos (Keeling) Islands" },
      { id: 69, name: "Colombia" },
      { id: 70, name: "Comoros" },
      { id: 71, name: "Congo" },
      { id: 72, name: "Congo, The Democratic Republic of The" },
      { id: 73, name: "Cook Islands" },
      { id: 74, name: "Costa Rica" },
      { id: 75, name: "Cote Divoire" },
      { id: 76, name: "Croatia" },
      { id: 77, name: "Cuba" },
      { id: 78, name: "Cyprus" },
      { id: 79, name: "Czech Republic" },
      { id: 80, name: "Denmark" },
      { id: 81, name: "Djibouti" },
      { id: 82, name: "Dominica" },
      { id: 83, name: "Dominican Republic" },
      { id: 84, name: "Ecuador" },
      { id: 85, name: "Egypt" },
      { id: 86, name: "El Salvador" },
      { id: 87, name: "Equatorial Guinea" },
      { id: 88, name: "Eritrea" },
      { id: 89, name: "Estonia" },
      { id: 90, name: "Ethiopia" },
      { id: 91, name: "Falkland Islands (Malvinas)" },
      { id: 92, name: "Faroe Islands" },
      { id: 93, name: "Fiji" },
      { id: 94, name: "Finland" },
      { id: 95, name: "France" },
      { id: 96, name: "French Guiana" },
      { id: 97, name: "French Polynesia" },
      { id: 98, name: "French Southern Territories" },
      { id: 99, name: "Gabon" },
      { id: 100, name: "Gambia" },
      { id: 101, name: "Georgia" },
      { id: 102, name: "Germany" },
      { id: 103, name: "Ghana" },
      { id: 104, name: "Gibraltar" },
      { id: 105, name: "Greece" },
      { id: 106, name: "Greenland" },
      { id: 107, name: "Grenada" },
      { id: 108, name: "Guadeloupe" },
      { id: 109, name: "Guam" },
      { id: 110, name: "Guatemala" },
      { id: 111, name: "Guinea" },
      { id: 112, name: "Guinea-bissau" },
      { id: 113, name: "Guyana" },
      { id: 114, name: "Haiti" },
      { id: 115, name: "Heard Island and Mcdonald Islands" },
      { id: 116, name: "Holy See (Vatican City State)" },
      { id: 117, name: "Honduras" },
      { id: 118, name: "Hong Kong" },
      { id: 119, name: "Hungary" },
      { id: 120, name: "Iceland" },
      { id: 121, name: "India" },
      { id: 122, name: "Indonesia" },
      { id: 123, name: "Iran, Islamic Republic of" },
      { id: 124, name: "Iraq" },
      { id: 125, name: "Ireland" },
      { id: 126, name: "Israel" },
      { id: 127, name: "Italy" },
      { id: 128, name: "Jamaica" },
      { id: 129, name: "Japan" },
      { id: 130, name: "Jordan" },
      { id: 131, name: "Kazakhstan" },
      { id: 132, name: "Kenya" },
      { id: 133, name: "Kiribati" },
      { id: 134, name: "Korea, Democratic People Republic of" },
      { id: 135, name: "Korea, Republic of" },
      { id: 136, name: "Kuwait" },
      { id: 137, name: "Kyrgyzstan" },
      { id: 138, name: "Lao People Democratic Republic" },
      { id: 139, name: "Latvia" },
      { id: 140, name: "Lebanon" },
      { id: 141, name: "Lesotho" },
      { id: 142, name: "Liberia" },
      { id: 143, name: "Libya" },
      { id: 144, name: "Liechtenstein" },
      { id: 145, name: "Lithuania" },
      { id: 146, name: "Luxembourg" },
      { id: 147, name: "Macao" },
      { id: 148, name: "Macedonia, The Former Yugoslav Republic of" },
      { id: 149, name: "Madagascar" },
      { id: 150, name: "Malawi" },
      { id: 151, name: "Malaysia" },
      { id: 152, name: "Maldives" },
      { id: 153, name: "Mali" },
      { id: 154, name: "Malta" },
      { id: 155, name: "Marshall Islands" },
      { id: 156, name: "Martinique" },
      { id: 157, name: "Mauritania" },
      { id: 158, name: "Mauritius" },
      { id: 159, name: "Mayotte" },
      { id: 160, name: "Mexico" },
      { id: 161, name: "Micronesia, Federated States of" },
      { id: 162, name: "Moldova, Republic of" },
      { id: 163, name: "Monaco" },
      { id: 164, name: "Mongolia" },
      { id: 165, name: "Montenegro" },
      { id: 166, name: "Montserrat" },
      { id: 167, name: "Morocco" },
      { id: 168, name: "Mozambique" },
      { id: 169, name: "Myanmar" },
      { id: 170, name: "Namibia" },
      { id: 171, name: "Nauru" },
      { id: 172, name: "Nepal" },
      { id: 173, name: "Netherlands" },
      { id: 174, name: "New Caledonia" },
      { id: 175, name: "New Zealand" },
      { id: 176, name: "Nicaragua" },
      { id: 177, name: "Niger" },
      { id: 178, name: "Nigeria" },
      { id: 179, name: "Niue" },
      { id: 180, name: "Norfolk Island" },
      { id: 181, name: "Northern Mariana Islands" },
      { id: 182, name: "Norway" },
      { id: 183, name: "Oman" },
      { id: 184, name: "Pakistan" },
      { id: 185, name: "Palau" },
      { id: 186, name: "Palestinian Territory, Occupied" },
      { id: 187, name: "Panama" },
      { id: 188, name: "Papua New Guinea" },
      { id: 189, name: "Paraguay" },
      { id: 190, name: "Peru" },
      { id: 191, name: "Philippines" },
      { id: 192, name: "Pitcairn" },
      { id: 193, name: "Poland" },
      { id: 194, name: "Portugal" },
      { id: 195, name: "Puerto Rico" },
      { id: 196, name: "Qatar" },
      { id: 197, name: "Reunion" },
      { id: 198, name: "Romania" },
      { id: 199, name: "Russian Federation" },
      { id: 200, name: "Rwanda" },
      { id: 201, name: "Saint Helena" },
      { id: 202, name: "Saint Kitts and Nevis" },
      { id: 203, name: "Saint Lucia" },
      { id: 204, name: "Saint Pierre and Miquelon" },
      { id: 205, name: "Saint Vincent and The Grenadines" },
      { id: 206, name: "Samoa" },
      { id: 207, name: "San Marino" },
      { id: 208, name: "Sao Tome and Principe" },
      { id: 209, name: "Saudi Arabia" },
      { id: 210, name: "Senegal" },
      { id: 211, name: "Serbia" },
      { id: 212, name: "Seychelles" },
      { id: 213, name: "Sierra Leone" },
      { id: 214, name: "Singapore" },
      { id: 215, name: "Slovakia" },
      { id: 216, name: "Slovenia" },
      { id: 217, name: "Solomon Islands" },
      { id: 218, name: "Somalia" },
      { id: 219, name: "South Africa" },
      { id: 220, name: "South Georgia and The South Sandwich Islands" },
      { id: 221, name: "Spain" },
      { id: 222, name: "Sri Lanka" },
      { id: 223, name: "Sudan" },
      { id: 224, name: "Suriname" },
      { id: 225, name: "Svalbard and Jan Mayen" },
      { id: 226, name: "Swaziland" },
      { id: 227, name: "Sweden" },
      { id: 228, name: "Switzerland" },
      { id: 229, name: "Syrian Arab Republic" },
      { id: 230, name: "Taiwan, Province of China" },
      { id: 231, name: "Tajikistan" },
      { id: 232, name: "Tanzania, United Republic of" },
      { id: 233, name: "Thailand" },
      { id: 234, name: "Timor-leste" },
      { id: 235, name: "Togo" },
      { id: 236, name: "Tokelau" },
      { id: 237, name: "Tonga" },
      { id: 238, name: "Trinidad and Tobago" },
      { id: 239, name: "Tunisia" },
      { id: 240, name: "Turkey" },
      { id: 241, name: "Turkmenistan" },
      { id: 242, name: "Turks and Caicos Islands" },
      { id: 243, name: "Tuvalu" },
      { id: 244, name: "Uganda" },
      { id: 245, name: "Ukraine" },
      { id: 246, name: "United Arab Emirates" },
      { id: 247, name: "United States Minor Outlying Islands" },
      { id: 248, name: "Uruguay" },
      { id: 249, name: "Uzbekistan" },
      { id: 250, name: "Vanuatu" },
      { id: 251, name: "Venezuela" },
      { id: 252, name: "Viet Nam" },
      { id: 253, name: "Virgin Islands, British" },
      { id: 254, name: "Virgin Islands, U.S." },
      { id: 255, name: "Wallis and Futuna" },
      { id: 256, name: "Western Sahara" },
      { id: 257, name: "Yemen" },
      { id: 258, name: "Zambia" },
      { id: 259, name: "Zimbabwe" }
    ]
  };
});
