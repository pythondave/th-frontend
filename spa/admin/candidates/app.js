var thCandidatesAppModule = angular.module('thCandidatesAppModule', [
  'ui.bootstrap', 'ngResource', 'ui.router.compat', //external
  'ngMockE2E', 'thMockServerModule', //prototype only (comment out/remove this whole line in production)
  'thConfigModule', 'thGenericModule', 'thUiFieldsModule' //local
]);

//states (routes) - ref: https://github.com/angular-ui/ui-router
thCandidatesAppModule.config(function($stateProvider, $urlRouterProvider, configService) {
  $urlRouterProvider.otherwise(function () { return '/'; });

  var init = function(initService) {
    return initService.init();
  };

  var params = ['search', 'subjects', 'roles', 'nationalities', 'curriculumExperience', 'minimumExperience',
    'internationalSchoolExperience', 'availableFrom', 'dateRegistered', 'averageReferenceScore',
    'adviserScore', 'yearOfBirth', 'maritalStatus', 'numberOfDependentChildren', 'eduationLevelsCompleted',
    'location', 'approved', 'cv'
  ];
  var url = _.reduce(params, function(concat, param, index) { return concat + (index==0 ? '/?' : '&') + param; }, '');

  $stateProvider
    .state('candidates', {
      abstract: true,
      resolve: { init: init },
      views: {
        'container-left': { templateUrl: 'partials/menu.html', controller: 'MenuCtrl' },
        'container-main': { templateUrl: 'partials/main.html', controller: 'MainCtrl' }
      }
    })
    .state('candidates.query', {
      url: url
    });
});

//configure $httpProvider
thCandidatesAppModule.config(function($httpProvider) {
  $httpProvider.defaults.transformRequest = function(data) { //see https://github.com/pythondave/th-admin/issues/11
    var actualRequestData = (data === undefined ? undefined : $.param(data));
    return actualRequestData;
  };

  $httpProvider.responseInterceptors.push(function($timeout, $q, configService) {
    return function(promise) {
      return promise.then(function(successResponse) {
        return successResponse;
      }, function(errorResponse, b, c) {
        if (errorResponse && errorResponse.status === 401) {
          document.location.href = configService.loginUrl;
        }
        return $q.reject(errorResponse);
      });
    };
  });
});


//wip *** TODO - add to shared/ui...
thCandidatesAppModule.directive('selectFromMany', function ($timeout) {
  return {
    restrict: 'A',
    templateUrl: 'partials/select-from-many.html',
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
        options.width = attr.width || '100%';
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
