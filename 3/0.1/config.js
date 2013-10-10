var thConfigModule = angular.module('thConfigModule', []);

thConfigModule.constant('configService', function() {
  var o = { user: {} };

  o.modes = { 1: 'dev', 2: 'demo', 3: 'production' };
  o.mode = 2; /* change to 3 in production */

  o.loginUrl = './user/logon';
  o.root = '/th-frontend/3/0.1'; //*** TODO: refactor when functionality becomes available in angular (see https://github.com/angular/angular.js/issues/2805)

  var requestUrlRoot = '/admin/service/';

  o.setModeToDevIfDemoAndLocal = function() { if (o.mode === 2 && window.location.host === 'localhost') o.mode = 1; };

  o.requests = {
    postConfig: { "headers": { "Content-Type": "application/x-www-form-urlencoded" } }
  };

  o.requests.urls = {

    //teachers
      teachers: requestUrlRoot + 'teachers',
      processTeacher: requestUrlRoot + 'process-teacher',

    //jobs
      jobs: requestUrlRoot + 'jobs',
      job: requestUrlRoot + 'job',

    //applications
      applications: requestUrlRoot + 'applications',
      addApplication: requestUrlRoot + 'add-application',
      processApplication: requestUrlRoot + 'process-application',

    //settings
      setting: requestUrlRoot + 'setting',
      processSetting: requestUrlRoot + 'process-setting',

    //shared
      basicLists: requestUrlRoot + 'basic-lists',
      schoolNames: requestUrlRoot + 'school-names',

    //app data
      spepStructure: '/school-dashboard/service/spep-structure',

    //lists
      lists: '/school/service/lists',

    //schools
      schools: '/school/service/schools',
      school: '/school/service/school',
      processSchool: '/school/service/process-school',
      processSchoolRating: '/school/service/process-school-rating',
      processSchoolBenefit: '/school/service/process-school-benefit',

    //cities
      city: '/school/service/city',
      processCity: '/school/service/process-city',
      processCityLivingCost: '/school/service/process-city-living-cost',
      processCityLink: '/school/service/process-city-link',
      addCityLink: '/school/service/add-city-link',

    //route error handling
      invalidSchoolDashboardUrlRedirect: 'error.html'
  };

  if (o.mode < 3) {
    o.requests.urls.spepNotesStructure = '/school-dashboard/service/spep-notes-structure';
    o.requests.urls.contentItemShowcaseStructure = '/shared/service/content-item-showcase-structure';
  }

  return o;
}());
