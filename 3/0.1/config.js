var thConfigModule = angular.module('thConfigModule', []);

thConfigModule.constant('configService', function() {
  var o = { user: {} };

  o.isDev = true; /* production -> set to false */

  o.loginUrl = './user/logon';
  o.root = '/th-frontend/3/0.1'; //*** TODO: refactor when functionality becomes available in angular (see https://github.com/angular/angular.js/issues/2805)

  var requestUrlRoot = '/admin/service/';
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
      spepNotesStructure: '/school-dashboard/service/spep-notes-structure',
      contentItemShowcaseStructure:  '/shared/service/content-item-showcase-structure',

    //lists
      lists: '/school/service/lists',

    //schools
      school: '/school/service/school',
      processSchool: '/school/service/process-school',
      processSchoolRating: '/school/service/process-school-rating',
      processSchoolBenefit: '/school/service/process-school-benefit',

    //cities
      city: '/school/service/city',
      processCity: '/school/service/process-city',
      processCityLivingCost: '/school/service/process-city-living-cost',
      processCityLink: '/school/service/process-city-link',

    //route error handling
      invalidSchoolDashboardUrlRedirect: 'error.html'
  };
  return o; // function() { return o; };
}());
