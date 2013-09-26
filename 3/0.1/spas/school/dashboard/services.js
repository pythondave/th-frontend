//*** TODO: refactor - some of this can be generic

/*
  serverService
  hierarchyService - *** move
  notesStructureSectionService
  editSchoolProfileStructureSectionService
  initService
*/

thSchoolDashboardAppModule.factory('serverService', function ($rootScope, $timeout, $http, configService) {
  //serverService: use to post data to the server

  var o = {};
  o.sentToServer = [];

  o.sendToServer = function(systemType, dataToPost) {
    var urls = {
      school: configService.requests.urls.processSchool,
      schoolRating: configService.requests.urls.processSchoolRating,
      schoolBenefit: configService.requests.urls.processSchoolBenefit,
      city: configService.requests.urls.processCity,
      cityLivingCost: configService.requests.urls.processCityLivingCost,
      cityLink: configService.requests.urls.processCityLink,
      undefined: 'dummy'
    };

    var url = urls[systemType];

    var successCallback = function() {
      o.sentToServer.push(url + '?' + $.param(dataToPost));
      $rootScope.$emit('serverService.responseReceived');
    };
    var postToServer = $http.post(url, dataToPost, configService.requests.postConfig).then(successCallback);

    return postToServer;
  };

  return o;
});

thSchoolDashboardAppModule.factory('hierarchyService', function () { //*** TODO: refactor so more generic & move to shared
  //hierarchyService: use to create a more self-aware hierarchy
  //e.g. can use this service to add the following properties to each item in the hierarchy:
  //parent, depth, path, previous, next

  var resetMarkers = function() {
    _.setAll(this.parent[this.propertyNames.collection], this.propertyNames.marker, false, this.propertyNames.collection);
  };

  var select = function(params) {
    this.resetMarkers();

    var collectionName = this.propertyNames.collection;
    var markerName = this.propertyNames.marker;
    this.level1 = this.parent[collectionName][params.level1-1];
    this.level2 = (this.level1[collectionName] && this.level1[collectionName][params.level2-1]);
    this.level3 = (this.level2 && this.level2[collectionName] && this.level2[collectionName][params.level3-1]);
    this.level1[markerName] = true;
    if (this.level2) this.level2[markerName] = true;
    if (this.level3) this.level3[markerName] = true;

    return;
  };

  var o = {};
  o.applyHierarchy = function(object, propertyNames) {
    propertyNames = _.defaults({}, propertyNames, { collection: 'sections', marker: 'isSelected', previous: 'previous', next: 'next' });

    //add hierarchy object
    object.hierarchy = { object: object, parent: object, propertyNames: propertyNames, resetMarkers: resetMarkers, select: select };

    //add index to hierarchy; add parent, depth and path to each hierarchy item
    object.hierarchy.index = [];
    var iterate = function(parent) {
      _.each(parent[propertyNames.collection], function(item, index) {
        object.hierarchy.index.push(item);
        item.parent = parent;
        item.depth = (parent.depth || 0) + 1;
        item.path = (parent.path ? parent.path + '/' : '') + (index+1);
        iterate(item);
      });
    };
    iterate(object);

    //add previous and next to each hierarchy item
    var index = object.hierarchy.index, previous, next, i;
    for (i = 0; i < index.length; i++) { //add previous
      if (index[i].depth === 3) {
        if (previous && previous.parent.parent === index[i].parent.parent) {
          index[i][propertyNames.previous] = previous;
        }
        previous = index[i];
      }
    }
    for (i = index.length - 1; i >= 0; i--) { //add next
      if (index[i].depth === 3) {
        if (next && index[i].parent.parent === next.parent.parent) {
          index[i][propertyNames.next] = next;
        }
        next = index[i];
      }
    }
  };

  return o;
});

thSchoolDashboardAppModule.factory('notesStructureSectionService', function (contentItemService) {
  //notesStructureSectionService: returns an object representing the notes structure section

  var o = { weight: 0, title: 'Notes', icon: 'comment' };
  var CI = contentItemService.ContentItem;
  var getHeader = function(object) { return new CI({ type: 'header', title: object.title, icon: object.icon, weight: 0 }); };

  o.sections = [
    { title: 'Read Me', tip: 'Section 2.1 tip', icon: 'book' }
  ];

  var notes = o.sections[0];
  notes.sections = [
    { title: 'Information', icon: 'comment' },
    { title: 'Priorities and progress', icon: 'signal' }
  ];

  var info = notes.sections[0];
  info.contentItems = [
    getHeader(info),
    new CI({ type: 'text', val: 'The \'notes\' section contains information about the framework in general and the SPEP project.', icon: 'comment' }),
    new CI({ type: 'text', val: 'See the \'edit school profile\' section for the SPEPs.', icon: 'edit' }),
    new CI({ type: 'text', val: 'See the \'generic showcase\' section to see what is possible.', icon: 'trophy' }),
    new CI({ type: 'text', val: 'The \'notes\' section will be removed during deployment.', icon: 'comment' })
  ];

  var prioritiesAndProgress = notes.sections[1];
  prioritiesAndProgress.contentItems = [
    getHeader(prioritiesAndProgress),
    new CI({ type: 'list', title: 'NOTE - rough priorities and progress:', icon: 'pushpin', description: 'description', items: [
      'Functionality of the framework (currently ~90%)',
      'Functionality of each content item type (currently varies - average is ~80%)',
      'Style of the framework (currently ~80%)',
      'Style of each content item type (currently varies - average is ~80%)',
      'Setting up structure according to AR\'s layout (currently 100%)',
      'Setting up each content item according to AR\'s layout (currently 100%)',
      'Setting up each content item to display data received from server (currently ~80%)',
      'Setting up each content item to send update data to server (currently ~80%)',
      'Atypical content item tweaks (currently ~50%)' ] })
  ];

  return o;
});

thSchoolDashboardAppModule.factory('editSchoolProfileStructureSectionService', function (contentItemService) {
  //editSchoolProfileStructureSectionService: returns an object representing the edit school profile structure section

  var o = { weight: 1, title: 'Edit school profile', icon: 'edit' };
  var CI = contentItemService.ContentItem;
  var getHeader = function(object) { return new CI({ type: 'header', title: object.title, icon: object.icon, weight: 0 }); };

  //section 1
  var section1 = o;
  section1.sections = [
    { weight: 5, title: 'About {{school.nickname}}', tip: 'Completing this section will ensure {{school.nickname}}\'s profile is more visible to thousands of prospective teachers who browse schools every week.', icon: 'info' },
    { weight: 3, title: 'Package and benefits', tip: 'This information will not be publicly displayed. Only teachers with complete profiles will have access to it. Sharing this information will encourage the right kind of teachers to apply.', icon: 'gift' },
    { weight: 2, title: 'City and life', tip: 'This section inspires teachers to move to {{city.name}} and the appeal of living there. It highlights the quality of life they can enjoy, and the places they can visit during their weekends.', icon: 'heart' }
  ];

  var section1pt1 = section1.sections[0];
  section1pt1.sections = [
    { weight: 5, title: 'Key details', icon: 'key' },
    { weight: 5, title: 'Students', icon: 'group' },
    { weight: 3, title: 'Teachers', icon: 'user' },
    { title: 'Facilities and multimedia', icon: 'facetime-video' },
    { title: 'Recruitment', icon: 'thumbs-up-alt' },
    { title: 'Self-assessment', icon: 'check' }
  ];

  var section1pt2 = section1.sections[1];
  section1pt2.sections = [
    { title: 'Salary and tax', icon: 'money' },
    { title: 'Ability to save', icon: 'archive' },
    { title: 'Other contractual details', icon: 'legal' },
    { title: 'Benefits', icon: 'plus' },
    { title: 'Health and pension', icon: 'medkit' }
  ];

  var section1pt3 = section1.sections[2];
  section1pt3.sections = [
    { title: '{{city.name}}', icon: 'bullseye' },
    { title: 'Cost of living', icon: 'money' },
    { title: 'City attractions', icon: 'camera' },
    { title: 'Other useful links', icon: 'ellipsis-horizontal' },
    { title: 'Services', icon: 'cogs' }
  ];

  var section1pt1pt1 = section1pt1.sections[0];
  section1pt1pt1.contentItems = [
    getHeader(section1pt1pt1),
    new CI({ weight: 0, type: 'text', style: 'color: red;', val: 'Note - AR/AT need to supply tip information for all fields + additional display information for some fields (e.g. ratings)' }),
    new CI({ systemName: 'headTeacher', type: 'textEdit', title: 'Head teacher / Principal', icon: 'user', tip: 'This tip and the icon at the start of this line are here as an illustration. These are easy to add on any content item. To see more of what\'s currently easy, see the \'Generic showcase\' main section.' }),
    new CI({ systemName: 'yearFounded', type: 'numberEdit', subType: 'plain', title: 'Year founded', icon: 'calendar', tip: '1500-' + new Date().getFullYear(), min: 1500, max: new Date().getFullYear() }),
    new CI({ systemName: 'educationLevels', type: 'fromFew', title: 'Education level', icon: 'signal', listName: 'ageLevels', listColumn: 'name' }),
    new CI({ systemName: 'academicSystems', type: 'fromFew', title: 'Academic system', icon: 'cogs', listName: 'academicSystems', listColumn: 'system' }),
    new CI({ systemName: 'fundingType', type: 'fromFew', title: 'Type of funding', icon: 'money', limit: 1, listName: 'fundingTypes', listColumn: 'type' }),
    new CI({ systemName: 'religiousAffiliation', type: 'fromFew', title: 'Religious affiliation', icon: 'compass', limit: 1, listName: 'religiousAffiliations', listColumn: 'affiliation' }),
    new CI({ systemName: 'accreditations', type: 'fromFew', title: 'Full accreditation', icon: 'thumbs-up-alt', listName: 'accreditations', listColumn: 'type' }),
    new CI({ systemName: 'curriculumTypes', type: 'fromFew', title: 'Curricula taught', icon: 'road', listName: 'curriculums', listColumn: 'title' }),
    new CI({ systemName: 'selectiveYear', type: 'fromFew', title: 'Academically selective',  icon: 'filter', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ systemName: 'newYearMonth', type: 'fromMany', title: 'Month school year begins', icon: 'calendar', limit: 1, listName: 'months', listColumn: 'val' })
  ];

  var section1pt1pt2 = section1pt1.sections[1];
  section1pt1pt2.contentItems = [
    getHeader(section1pt1pt2),
    new CI({ systemName: 'intStudentsTotal', type: 'numberEdit', title: 'Total number of students', icon: 'group' }),
    new CI({ systemName: 'pintStudents', type: 'slider', title: 'Percentage of international students', icon: 'globe', suffix: '%' }),
    new CI({ systemName: 'genderRatio', type: 'fromFew', title: 'Student gender ratio', icon: 'adjust', limit: 1, listName: 'genderRations', listColumn: 'ratio' }),
    new CI({ systemName: 'intStudentsPreSchool', type: 'numberEdit', title: 'Number in Nursery / Pre-School', icon: 'linux' }),
    new CI({ systemName: 'intStudentsPrimary', type: 'numberEdit', title: 'Number in Primary / Elementary', icon: 'bug' }),
    new CI({ systemName: 'intStudentsSecondary', type: 'numberEdit', title: 'Number in Secondary / High School', icon: 'fire' }),
    new CI({ systemName: 'intStudentsPost16', type: 'numberEdit', title: 'Number in Post 16', icon: 'leaf' }),
    new CI({ systemName: 'intAvgStudentsPreSchool', type: 'numberEdit', title: 'Average class size in Nursery / Pre-School / KG', icon: 'linux' }),
    new CI({ systemName: 'intAvgStudentsPrimary', type: 'numberEdit', title: 'Average class size in Primary / Elementary', icon: 'bug' }),
    new CI({ systemName: 'intAvgStudentsSecondary', type: 'numberEdit', title: 'Average class size in Secondary / High School', icon: 'fire' }),
    new CI({ systemName: 'intAvgStudentsPost16', type: 'numberEdit', title: 'Average class size at Post 16 level', icon: 'leaf' })
  ];

  var section1pt1pt3 = section1pt1.sections[2];
  section1pt1pt3.contentItems = [
    getHeader(section1pt1pt3),
    new CI({ systemName: 'intStaff', type: 'numberEdit', title: 'Number of staff', icon: 'user' }),
    new CI({ systemName: 'pOverseasStaff', type: 'slider', title: 'Percentage of overseas teachers', icon: 'adjust', suffix: '%' }),
    new CI({ systemName: 'mainTeacherNationalities', type: 'fromFew', title: 'Main teacher nationalities', icon: 'globe', listName: 'teacherNationalities', listColumn: 'name' }),
    new CI({ systemName: 'annualTeacherTurnover', type: 'slider', title: 'Annual teacher turnover', icon: 'adjust', suffix: '%' }),
    new CI({ systemName: 'intOverseasTeachers', type: 'numberEdit', title: 'Number of overseas teachers recruited per year (approx)', icon: 'globe' }),
    new CI({ systemName: 'languages', type: 'fromFew', title: 'Teaching languages', icon: 'comments-alt', listName: 'languages', listColumn: 'name' }),
    new CI({ systemName: 'acceptsTeflTeachers', type: 'fromFew', title: 'Employs TEFL teachers', icon: 'comment-alt', limit: 1, listName: 'yesno', listColumn: 'name' })
  ];

  var section1pt1pt4 = section1pt1.sections[3];
  section1pt1pt4.contentItems = [
    getHeader(section1pt1pt4),
    new CI({ weight: 0, type: 'text', style: 'color: red;', val: 'WIP - File upload' }),
    new CI({ systemName: 'facilities', type: 'fromFew', title: 'School facilities', icon: 'building', listName: 'facilities', listColumn: 'facility' }),
    new CI({ systemName: 'images', type: 'fileUpload', title: '{{school.nickname}}\'s profile photo', icon: 'camera' }),
    new CI({ systemName: 'images', type: 'fileUpload', title: 'Additional photos', icon: 'picture' }),
    new CI({ systemName: 'location', type: 'locationEdit', title: '{{school.nickname}}\'s location', icon: 'map-marker' }),
    new CI({ systemName: 'urlPromotionalVideo', type: 'urlEdit', title: '{{school.nickname}}\'s promotional video', icon: 'facetime-video', urlTitle: false }),
    new CI({ systemName: 'images', type: 'fileUpload', title: '{{school.nickname}}\'s logo', icon: 'apple' }),
  ];

  var section1pt1pt5 = section1pt1.sections[4];
  section1pt1pt5.contentItems = [
    getHeader(section1pt1pt5),
    new CI({ systemName: 'recruitmentStartMonth', type: 'fromMany', limit: 1, title: 'Recruitment start month', icon: 'calendar', listName: 'months' }),
    new CI({ systemName: 'acceptedTeacherQualifications', type: 'fromFew', title: 'Minimum qualifications accepted', icon: 'signal', listName: 'educationLevels', listColumn: 'name' }),
    new CI({ systemName: 'minYearsExperience', type: 'slider', title: 'Minimum experience required', icon: 'road', max: 10, suffix: ' years' }),
    new CI({ systemName: 'teacherNationalitiesAccepted', type: 'fromFew', title: 'Teacher nationalities accepted', icon: 'globe', listName: 'teacherNationalities', listColumn: 'name' }),
    new CI({ systemName: 'leadRecruitmentContactName', type: 'textEdit', title: 'Lead recruitment contact name', icon: 'user' }),
    new CI({ systemName: 'leadRecruitmentContactEmail', type: 'emailEdit', title: 'Lead recruitment contact email address', icon: 'envelope' }),
    new CI({ systemName: 'workIncentive', type: 'textEdit', title: 'Why work at {{school.nickname}}?', icon: 'microphone', maxLength: 1000 })
  ];

  var section1pt1pt6 = section1pt1.sections[5];
  section1pt1pt6.contentItems = [
    getHeader(section1pt1pt6),
    new CI({ systemType: 'schoolRating', ratingId: 1, type: 'ratingEdit', title: 'Accreditation', icon: 'thumbs-up-alt', max: 5 }),
    new CI({ systemType: 'schoolRating', ratingId: 2, type: 'ratingEdit', title: 'Memberships', icon: 'link', max: 5 }),
    new CI({ systemType: 'schoolRating', ratingId: 3, type: 'ratingEdit', title: 'Facilities', icon: 'building', max: 5 }),
    new CI({ systemType: 'schoolRating', ratingId: 4, type: 'ratingEdit', title: 'Professional development', icon: 'signal', max: 5 }),
    new CI({ systemType: 'schoolRating', ratingId: 5, type: 'ratingEdit', title: 'Ability to save', icon: 'money', max: 5 })
  ];

  var section1pt2pt1 = section1pt2.sections[0];
  section1pt2pt1.contentItems = [
    getHeader(section1pt2pt1),
    new CI({ weight: 0, type: 'text', style: 'color: red;', val: 'WIP - Changes to \'International working currency\' will have a big warning in certain circumstances. The app will also be updated in several places when it changes.' }),
    new CI({ systemName: 'currency', type: 'fromFew', title: 'International working currency', icon: 'money', limit: 1, listName: 'currencies', listColumn: 'currency' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 101, type: 'numberEdit', subType: 'money', title: 'Typical gross annual salary (before tax and deductions) of a newly qualified teacher with no management responsibilities (new arrival, in {{school.currencyName}})', icon: 'check-empty' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 102, type: 'slider', title: 'Approximate tax and deductions', icon: 'adjust', max: 60, suffix: '%' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 103, type: 'numberEdit', subType: 'money', title: 'Typical gross annual salary (before tax and deductions) of a teacher with no management responsibilities at top of the pay scale (in {{school.currencyName}})', icon: 'sign-blank' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 104, type: 'slider', title: 'Approximate tax and deductions', icon: 'adjust', max: 60, suffix: '%' })
  ];

  var section1pt2pt2 = section1pt2.sections[1];
  section1pt2pt2.contentItems = [
    getHeader(section1pt2pt2),
    new CI({ systemType: 'schoolBenefit', benefitId: 105, type: 'numberEdit', subType: 'money', title: 'National average income per person per year (in {{school.currencyName}})', icon: 'money' }),
    new CI({ systemName: 'contractLength', type: 'slider', title: 'Contract Period', icon: 'legal', items: [ { val: 0, description: 'None' }, { val: 1, description: '1 year' }, { val: 2, description: '2 years' }, { val: 3, description: '3 years' }, { val: 4, description: '4 years' }, { val: 5, description: '5 years' } ] }),
    new CI({ systemType: 'schoolBenefit', benefitId: 107, type: 'numberEdit', subType: 'money', title: 'Average yearly saving made (for single teacher, in {{school.currencyName}})', icon: 'briefcase' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 108, type: 'fromFew', title: 'Salary can support a family of four', icon: 'group', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 109, type: 'fromFew', title: 'Pay scale based on experience', icon: 'signal', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 110, type: 'fromFew', title: 'Teacher saving scheme', icon: 'road', limit: 1, listName: 'yesno', listColumn: 'name' })
  ];

  var section1pt2pt3 = section1pt2.sections[2];
  section1pt2pt3.contentItems = [
    getHeader(section1pt2pt3),
    new CI({ systemType: 'schoolBenefit', benefitId: 111, type: 'numberEdit', subType: 'money', title: 'Annual professional development budget per teacher (in {{school.currencyName}})' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 112, type: 'numberEdit', title: 'Number of school days per year' }),
    new CI({ systemName: 'hpwWeekDayLessons', type: 'numberEdit', title: 'Number of teaching hours per week' }),
    new CI({ systemName: 'hpwExtraCurricular', type: 'numberEdit', title: 'Number of extra-curricular hours per week' })
  ];

  var section1pt2pt4 = section1pt2.sections[3];
  section1pt2pt4.contentItems = [
    getHeader(section1pt2pt4),
    new CI({ systemType: 'schoolBenefit', benefitId: 1, type: 'slider', title: 'Discount on school fees for staff children', suffix: '%' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 2, type: 'fromFew', title: 'Guaranteed places for staff children', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 3, type: 'numberEdit', subType: 'money', title: 'Monthly accommodation allowance (in {{school.currencyName}})' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 8, type: 'fromFew', title: 'Accommodation provided by school', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 201, type: 'fromFew', title: 'Flight allowance', limit: 1, listName: 'flightAllowances', listColumn: 'allowance' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 202, type: 'fromFew', title: 'Relocation allowance', limit: 1, listName: 'rellocationAllowances', listColumn: 'allowance' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 6, type: 'fromFew', title: 'Laptop allowance', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 4, type: 'fromFew', title: 'Language lesson allowance', limit: 1, listName: 'yesno', listColumn: 'name', maxLength: '500' }),
    new CI({ systemType: 'schoolBenefit', benefitId: 7, type: 'textEdit', title: 'Other benefits or allowances offered', maxLength: 500 })
  ];

  var section1pt2pt5 = section1pt2.sections[4];
  section1pt2pt5.contentItems = [
    getHeader(section1pt2pt5),
    new CI({ weight: 0, type: 'text', style: 'color: red;', val: 'Q for OV: Should fhipCountry perhaps use a process-country api call?' }),
    new CI({ systemName: 'pensionScheme', type: 'fromFew', title: 'Type of pension scheme', limit: 1, listName: 'pensionSchemes', listColumn: 'name' }),
    new CI({ systemName: 'pensionTeacherContrib', type: 'slider', title: 'Teacher contribution per year (approx)', step: 10, suffix: '%' }),
    new CI({ systemName: 'pensionSchoolContrib', type: 'slider', title: 'School contribution per year (approx)',  step: 10, suffix: '%' }),
    new CI({ systemName: 'fhipCountry', type: 'fromFew', title: 'Is there free healthcare in {{city.countryName}}?', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ systemName: 'fhipSchool', type: 'fromFew', title: 'Does {{school.nickname}} have a free private healthcare scheme?', limit: 1, listName: 'yesno', listColumn: 'name' })
  ];

  var section1pt3pt1 = section1pt3.sections[0];
  section1pt3pt1.contentItems = [
    getHeader(section1pt3pt1),
    new CI({ systemType: 'city', systemName: 'population', type: 'numberEdit', title: 'Population' }),
    new CI({ systemType: 'city', systemName: 'language', type: 'fromMany', title: 'Language', limit: 1, listName: 'languages', listColumn: 'name' }),
    new CI({ systemType: 'city', systemName: 'attractions', type: 'fromFew', title: 'Attractions and activities within a two hour drive of {{school.nickname}}', listName: 'attractions', listColumn: 'attraction' })
  ];

  var section1pt3pt2 = section1pt3.sections[1];
  section1pt3pt2.contentItems = [
    getHeader(section1pt3pt2),
    new CI({ systemType: 'cityLivingCost', livingCostId: 1, type: 'numberEdit', subType: 'money', title: 'Expected monthly rent for a two bedroom flat (in {{city.internationalCurrencyName}})' }),
    new CI({ systemType: 'cityLivingCost', livingCostId: 2, type: 'numberEdit', subType: 'money', title: 'Average cost of litre of petrol / gas (in {{city.internationalCurrencyName}})' }),
    new CI({ systemType: 'cityLivingCost', livingCostId: 3, type: 'numberEdit', subType: 'money', title: 'Cost of a coffee in local cafe (in {{city.internationalCurrencyName}})' }),
    new CI({ systemType: 'cityLivingCost', livingCostId: 4, type: 'numberEdit', subType: 'money', title: 'Typical two course restaurant meal (in {{city.internationalCurrencyName}})' }),
    new CI({ systemType: 'cityLivingCost', livingCostId: 5, type: 'numberEdit', subType: 'money', title: 'Cost of flights during the Summer holiday season to New York (in {{city.internationalCurrencyName}})' }),
    new CI({ systemType: 'cityLivingCost', livingCostId: 6, type: 'numberEdit', subType: 'money', title: 'Cost of flights during the Summer holiday season to London (in {{city.internationalCurrencyName}})' }),
    new CI({ systemType: 'cityLivingCost', livingCostId: 7, type: 'numberEdit', subType: 'money', title: 'Cost of flights during the Summer holiday season to Sydney (in {{city.internationalCurrencyName}})' })
  ];

  var section1pt3pt3 = section1pt3.sections[2];
  section1pt3pt3.contentItems = [
    getHeader(section1pt3pt3),
    new CI({ weight: 0, type: 'text', style: 'color: red;', val: 'WIP - Not quite there yet.' }),
    new CI({ systemType: 'cityLink', linkId: 1, type: 'urlEdit', title: 'Lonely Planet city guide', urlTitle: false }),
    new CI({ systemType: 'cityLink', linkId: 2, type: 'urlEdit', title: 'Leisure' }),
    new CI({ systemType: 'cityLink', linkId: 3, type: 'urlEdit', title: 'Travel' }),
    new CI({ systemType: 'cityLink', linkId: 4, type: 'urlEdit', title: 'Housing' }),
    new CI({ systemType: 'cityLink', linkId: 5, type: 'urlEdit', title: 'Services' })
  ];

  var section1pt3pt4 = section1pt3.sections[3];
  section1pt3pt4.contentItems = [
    getHeader(section1pt3pt4),
    new CI({ weight: 0, type: 'text', style: 'color: red;', val: 'WIP - This will have a dynamic number of link fields (with a add/delete possibilities).' }),
    new CI({ systemType: 'cityLink', linkId: 101, type: 'urlEdit', title: 'Website 1' })
  ];

  var section1pt3pt5 = section1pt3.sections[4];
  section1pt3pt5.contentItems = [
    getHeader(section1pt3pt5),
    new CI({ weight: 0, type: 'text', val: 'This page is with AR/AT. It\'ll probably not have any actual fields on it.', style: 'color: red;' }),
    new CI({ weight: 0, type: 'text', val: 'We have a number of recruitment services designed to support schools like {{school.nickname}} and over 20,000 inspiring teachers looking to teacher overseas' }),
    new CI({ weight: 0, systemName: 'ignoreForNow', type: 'fromFew', title: 'Are you interested in finding out more?', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ weight: 0, systemName: 'ignoreForNow', type: 'fromFew', title: 'Do you have any feedback about this process?', limit: 1, listName: 'yesno', listColumn: 'name' }),
    new CI({ weight: 0, type: 'text', val: 'Thanks for completing {{school.nickname}}\'s profile. We hope we can help you find some inspiring teachers over the years ahead. Please do share with contacts at good schools not currently listed so that we can build this platform in collaboration with them too.' })
  ];

  return o;
});


thSchoolDashboardAppModule.factory('initService', function ($rootScope, $q, $http, $timeout, configService, hierarchyService,
  editSchoolProfileStructureSectionService, notesStructureSectionService, showcaseStructureSectionService) {
  //initService: use to get and set initial data and structure
  //Note: there are loads of ways of doing this: relative efficiency and the output of the init function is what matters

  var o = {};

  o.sections = [
    editSchoolProfileStructureSectionService,
    notesStructureSectionService,
    showcaseStructureSectionService
  ];

  var getServerData = function() {
    return $q.all([
      $http.post(configService.requests.urls.lists, undefined, configService.requests.postConfig),
      $http.post(configService.requests.urls.school, undefined, configService.requests.postConfig), //assumption: the school of the logged in school user is sent
      $http.post(configService.requests.urls.city, undefined, configService.requests.postConfig) //assumption: the city of the school of the logged in school user is sent
    ]);
  };

  var sortLists = function(o) {
    //sort all lists (ideally these would come sorted this way already)
    o.academicSystems = _.sortBy(o.academicSystems, 'system');
    o.acceptedTeacherQualifications = _.sortBy(o.acceptedTeacherQualifications, 'qualification');
    o.accreditations = _.sortBy(o.accreditations, 'type');
    o.allWorldCurrencies = _.sortBy(o.allWorldCurrencies, 'currency');
    o.attractions = _.sortBy(o.attractions, 'attraction');
    o.currencies = _.sortBy(o.currencies, 'currency');
    o.curriculums = _.sortBy(o.curriculums, 'title');
    o.educationLevels = _.sortBy(o.educationLevels, 'name');
    o.facilities = _.sortBy(o.facilities, 'facility');
    o.flightAllowances = _.sortBy(o.flightAllowances, 'allowance');
    o.fundingTypes = _.sortBy(o.fundingTypes, 'type');
    o.genderRations = _.sortBy(o.genderRations, 'ratio');
    o.languages = _.sortBy(o.languages, 'name');
    o.months = _.sortBy(o.months, 'val');
    o.pensionSchemes = _.sortBy(o.pensionSchemes, 'name');
    o.religiousAffiliations = _.sortBy(o.religiousAffiliations, 'affiliation');
    o.rellocationAllowances = _.sortBy(o.rellocationAllowances, 'allowance');
    o.teacherNationalities = _.sortBy(o.teacherNationalities, '(blank)');
    return o;
  };

  var setServerData = function(response) {
    o.lists = sortLists(response[0].data);
    o.schoolData = response[1].data;
    o.cityData = response[2].data;

    //additional hard-coded list data (*** WIP - move to lists?)
    o.lists.months = [{ id: 1, name: 'January'}, { id: 2, name: 'February'}, { id: 3, name: 'March'}, { id: 4, name: 'April'}, { id: 5, name: 'May'}, { id: 6, name: 'June'}, { id: 7, name: 'July'}, { id: 8, name: 'August'}, { id: 9, name: 'September'}, { id: 10, name: 'October'}, { id: 11, name: 'November'}, { id: 12, name: 'December'}];
    o.lists.teacherNationalities = [{ id: 1, name: 'Nationality 1'}, { id: 2, name: 'Nationality 2'}, { id: 3, name: 'Nationality 3'}, { id: 4, name: 'Nationality 4'}, { id: 5, name: 'Nationality 5'}, { id: 6, name: 'Nationality 6'}, { id: 7, name: 'Nationality 7'}, { id: 8, name: 'Nationality 8'} ];
  };

  var getAndSetServerData = function() { return getServerData().then(setServerData); };

  var combineStructureAndServerData = function(response) {
    var school = o.schoolData.school;
    var city = o.cityData.city;

    var derivedSchoolNickname = function() {
      if (school.nickname) return school.nickname;
      if (school.name && school.name.length <= 10) return school.name;
      if (school.initials) return school.initials;
      if (school.name) return school.name.match(/\b\w/g).join('');
      return '?';
    };

    //special tweaks 1 (pre-decoration of hierarchy)
    var internationalCurrencySymbols = { EUR: '\u20AC', USD: '$', AUD: '$', GBP: '\u00A3', JPY: '\u00A5' };
    school.currencyName = _.find(o.lists.currencies, { id: school.currency || 1 }).code;
    school.currencySymbol = internationalCurrencySymbols[school.currencyName];
    school.nickname = derivedSchoolNickname();
    city.countryName = _.find(o.lists.countries, { id: city.country }).name;
    city.internationalCurrencyName = _.find(o.lists.currencies, { id: city.internationalCurrency || 1 }).code;
    city.internationalCurrencySymbol = internationalCurrencySymbols[city.internationalCurrencyName];

    //transform some data for easier access
    school.ratings = _.indexBy(school.ratings, 'id');
    school.benefits = _.indexBy(school.benefits, 'id');
    city.livingCosts = _.indexBy(city.livingCosts, 'id');
    city.links = _.indexBy(city.links, 'category'); //*** WIP - will need to be different to this

    //decorate structure with hierarchy and weight calculations
    hierarchyService.applyHierarchy(o); //decorate o with hierarchy functions and properties (e.g. parent, next, previous)

    _.each(o.hierarchy.index, function(section) { //set default weight for every section
      section.weight = (section.weight === undefined ? 1 : section.weight);
    });

    _.each(o.hierarchy.index, function(section) { //calculate totalChildWeight for every section
      var childCollectionName = (section.depth < 3 ? 'sections' : 'contentItems');
      section.totalChildWeight = _.reduce(section[childCollectionName], function(sum, item) { return sum + item.weight; }, 0);
    });

    var contentItemsIndex = []; //an index holding every content item
    _.each(o.hierarchy.index, function(section) {
      section.absoluteWeight = section.weight/section.parent.totalChildWeight * (section.parent.absoluteWeight || 1);
      _.each(section.contentItems, function(ci) {
        ci.parent = section;
        contentItemsIndex.push(ci);
        ci.absoluteWeight = ci.weight/section.totalChildWeight * (section.absoluteWeight || 1) || 0;
      });
    });
    o.contentItemsIndex = contentItemsIndex;

    var getVal = function(ci) {
      if (ci.systemType === 'school' && ci.systemName) return school[ci.systemName];
      if (ci.systemType === 'schoolRating') {
        return (school.ratings[ci.ratingId] ? school.ratings[ci.ratingId].value : undefined);
      }
      if (ci.systemType === 'schoolBenefit') {
        return (school.benefits[ci.benefitId] ? school.benefits[ci.benefitId].value : undefined);
      }
      if (ci.systemType === 'city') return city[ci.systemName];
      if (ci.systemType === 'cityLivingCost') {
        return (city.livingCosts[ci.livingCostId] ? city.livingCosts[ci.livingCostId].value : undefined);
      }
    };

    //decorate structure with possible value lists and values from the source data
    _.each(o.contentItemsIndex, function(ci) {
      if (ci.listName) { ci.items = _.cloneDeep(o.lists[ci.listName]); }
      if (!ci.systemType && ci.parent.path[0] === '1') ci.systemType = 'school';
      if (ci.systemType && ci.systemType.substring(0, 6) === 'school') ci.fixedData = { schoolId: school.id, token: o.schoolData.token };
      if (ci.systemType && ci.systemType.substring(0, 4) === 'city') ci.fixedData = { cityId: city.id, token: o.cityData.token };
      ci.init(getVal(ci));
    });

    //special tweaks 2 (post-decoration)
    var templateData = { school: school, city: city };
    _.each(o.hierarchy.index, function(section) {
      section.title = _.template(section.title, templateData);
      section.tip = _.template(section.tip, templateData);
    });
    _.each(o.contentItemsIndex, function(ci) {
      ci.title = _.template(ci.title, templateData);
      ci.tip = _.template(ci.tip, templateData);
      if (ci.type === 'text') ci.val = _.template(ci.val, templateData);
      if (ci.systemType === 'cityLivingCost') {
        ci.fixedData.livingCostId = ci.livingCostId;
        ci.systemName = 'value';
        ci.currencySymbol = city.internationalCurrencySymbol;
      }
      if (ci.systemType === 'cityLink') {
        ci.fixedData.linkId = 'WIP';
        ci.fixedData.url = 'WIP';
        ci.fixedData.name = 'WIP';
        var link = city.links[ci.linkId];
        if (link) {
          ci.urlTitle = { val: link.name };
          ci.url = { val: link.url };
        }
      }
      if (ci.systemType === 'schoolRating') {
        ci.fixedData.ratingId = ci.ratingId;
        ci.systemName = 'value';
      }
      if (ci.systemType === 'schoolBenefit') {
        ci.fixedData.benefitId = ci.benefitId;
        ci.systemName = 'value';
        if (ci.subType === 'money') ci.currencySymbol = school.currencySymbol;
      }
      if (ci.systemName === 'location' && !ci.val) {
        ci.address = city.name + ', ' + city.countryName;
      }
    });

    return o;
  };

  //additional helper values and functions
  o.getLevel3IsOkay = function() {
    if (!o.hierarchy.level3) return;
    return _.all(o.hierarchy.level3.contentItems, function(item) {
      return item.isValid !== false && !item.isDirty && !item.isBeingProcessed;
    });
  };

  o.getPercentageComplete = function() {
    var sum = _.reduce(o.contentItemsIndex, function(sum, ci) {
      var weight = (ci.parent.path[0] === '1' ? ci.getWeight() : 0);
      return sum + weight;
    }, 0);
    return Math.round(sum*100, 10);
  };

  var delay = function(ms) {
    var deferred = $q.defer();
    $timeout(deferred.resolve, ms);
    return deferred.promise;
  };

  o.init = function() {
    //delay(100) allows .json files to be loaded to the mock server. It's not strictly needed for the a non-mock version, but shouldn't do any harm.
    return (configService.isDev ? delay(500) : $q).then(getAndSetServerData).then(combineStructureAndServerData);
  };

  return o;
});
