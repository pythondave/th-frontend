var thShowcaseModule = angular.module('thShowcaseModule', ['thContentItemsModule']);

/*
thShowcaseModule: A module to be used for showing what is possible. Useful during analysis, design and development.
*/

thShowcaseModule.factory('structureContentItemsService', function (contentItemService) {
  var o = { weight: 0, title: 'Generic showcase', icon: 'trophy' };
  var CI = contentItemService.ContentItem;

  var getHeader = function(object) { return { type: 'header', title: object.title, icon: object.icon }; };

  o.sections = [
    { title: 'About', tip: 'The section tells you about the \'generic showcase\' section', icon: 'book' },
    { title: 'Edit content items', icon: 'pencil' },
    { title: 'Other content items', icon: 'asterisk' },
    { title: 'Section with no icon, tip, or sub-sections' }
  ];

  var about = o.sections[0];
  about.sections = [
    { title: 'Introduction', icon: 'lightbulb' }
  ];

  var introduction = about.sections[0];
  introduction.contentItems = [
    getHeader(introduction),
    { type: 'text', val: 'The \'generic showcase\' section shows what is possible. This is useful during analysis and development.', icon: 'trophy' },
    { type: 'text', val: 'See the \'edit content items\' section for examples of each edit content item (date-edit, email-edit, from-few, etc.).', icon: 'pencil' },
    { type: 'text', val: 'See the \'other content items\' section for examples of other content items (text, file-upload, etc.).', icon: 'asterisk' },
    { type: 'text', val: 'The \'generic showcase\' section will be removed during deployment.', icon: 'trophy' }
  ];

  var editCIs = o.sections[1];
  editCIs.sections = [
    { title: 'Date-edit', icon: 'calendar' },
    { title: 'Email-edit', icon: 'envelope' },
    { title: 'From-few', icon: 'ellipsis-horizontal' },
    { title: 'From-many', icon: 'list' },
    { title: 'Money-edit', icon: 'money' },
    { title: 'Number-edit', icon: 'sort-by-order' },
    { title: 'Rating-edit', icon: 'star' },
    { title: 'Slider', icon: 'resize-horizontal' },
    { title: 'Text-edit', icon: 'font' },
    { title: 'Time-edit', icon: 'time' },
    { title: 'URL-edit', icon: 'external-link' }
  ];

  var dateEditCI = editCIs.sections[0];
  dateEditCI.contentItems = [
    getHeader(dateEditCI),
    { type: 'text', val: 'The date-edit content item can be used for entering and editing a date.' },
    new CI({ systemName: 'dateEdit1', type: 'dateEdit', title: 'Basic date-edit content item', tip: 'Click the date to edit', val: '4 September 2013' }),
    new CI({ systemName: 'dateEdit2', type: 'dateEdit', title: 'Date-edit content item with no initial value', tip: 'Click the date icon to edit' })
  ];

  var emailEditCI = editCIs.sections[1];
  emailEditCI.contentItems = [
    getHeader(emailEditCI),
    { type: 'text', val: 'The email-edit content item can be used for entering and editing an email.' },
    new CI({ systemName: 'emailEdit1', type: 'emailEdit', title: 'Basic email-edit content item', tip: '...', val: 'dave@google.com' }),
    new CI({ systemName: 'emailEdit2', type: 'emailEdit', title: 'Email-edit content item with no initial value', tip: '...' }),
    new CI({ systemName: 'emailEdit3', type: 'emailEdit', title: 'Email-edit content item with invalid initial value', tip: '...', val: 'unfinished@somewhere' })
  ];

  var fromFewCI = editCIs.sections[2];
  fromFewCI.contentItems = [
    getHeader(fromFewCI),
    { type: 'text', val: 'The from-few content item can be used for selecting one or more values from a few values.' },
    new CI({ systemName: 'fromFew1', type: 'fromFew', limit: 1, title: 'Basic from-few content item (limit of 1)', listColumn: 'name',
      items: [{id: 1, name: 'Apple'}, {id: 2, name: 'Banana', isSelected: true}, {id: 3, name: 'Orange'}, {id: 4, name: 'Pear'}] }),
    new CI({ systemName: 'fromFew2', type: 'fromFew', limit: 3, title: 'From-few content item with limit of 3', listColumn: 'name',
      items: [{id: 1, name: 'Apple'}, {id: 2, name: 'Banana', isSelected: true}, {id: 3, name: 'Orange'}, {id: 4, name: 'Pear'}] })
  ];

  var fromManyCI = editCIs.sections[3];
  fromManyCI.contentItems = [
    getHeader(fromManyCI),
    { type: 'text', val: 'The from-many content item can be used for selecting one or more values from a large number of values.' },
    new CI({ systemName: 'fromMany1', type: 'fromMany', limit: 1, title: 'Basic from-many content item', listColumn: 'name',
      items: [{id: 1, name: 'Apple'}, {id: 2, name: 'Banana', isSelected: true}, {id: 3, name: 'Orange'}, {id: 4, name: 'Pear'}],
      val: 2 })
  ];

  var moneyEditCI = editCIs.sections[4];
  moneyEditCI.contentItems = [
    getHeader(moneyEditCI),
    { type: 'text', val: 'WIP - No longer needed for the SPEP project', style: 'color: red;' },
    { type: 'text', val: 'The money-edit content item can be used for entering and editing a currency and amount combination.' },
    { type: 'text', val: 'WIP - this will have a mechanism for selecting both a currency and an amount', style: 'color: red;' },
    new CI({ systemName: 'moneyEdit1', type: 'moneyEdit', title: 'Basic money-edit content item', tip: '...', currency: { val: 3, items: [{ id: 1, name: 'USD' }, { id: 2, name: 'GBP' }, { id: 3, name: 'Euro' }] }, amount: { val: 12.34 } }),
    new CI({ systemName: 'moneyEdit2', type: 'moneyEdit', title: 'Money-edit content item with no initial values', tip: '...', currency: { items: [{ id: 1, name: 'USD' }, { id: 2, name: 'GBP' }, { id: 3, name: 'Euro' }] } })
  ];

  var numberEditCI = editCIs.sections[5];
  numberEditCI.contentItems = [
    getHeader(numberEditCI),
    { type: 'text', val: 'The number-edit content item can be used for entering and editing number text.' },
    new CI({ systemName: 'numberEdit1', type: 'numberEdit', title: 'Basic number-edit content item', tip: 'Click number to edit. Click away from number to finish.', val: '123' }),
    new CI({ systemName: 'numberEdit2', type: 'numberEdit', title: 'Number-edit content item with no initial value', tip: 'Click edit icon to edit. Click away to finish.' }),
    new CI({ systemName: 'numberEdit3', type: 'numberEdit', title: 'Number-edit content item with large value', val: '12345678' }),
    new CI({ systemName: 'numberEdit4', type: 'numberEdit', title: 'Number-edit content item with full works', icon: 'music', tip: 'This is a tip', description: 'This is a description', val: '234' }),
    new CI({ systemName: 'numberEdit5', type: 'numberEdit', title: 'Number-edit content item with decimal allowed (up to 2 d.p.)', icon: 'bell', val: '234.56', allowDecimals: true })
  ];

  var ratingEditCI = editCIs.sections[6];
  ratingEditCI.contentItems = [
    getHeader(ratingEditCI),
    { type: 'text', val: 'The rating-edit content item can be used for entering and editing a rating.' },
    new CI({ systemName: 'ratingEdit1', type: 'ratingEdit', title: 'Basic rating-edit content item', max: 5, val: 3 }),
    new CI({ systemName: 'ratingEdit2', type: 'ratingEdit', title: 'Rating-edit content item size 7', max: 7, val: 6 }),
    new CI({ systemName: 'ratingEdit3', type: 'ratingEdit', title: 'Rating-edit content item with icon', icon: 'umbrella', max: 5, val: 4 }),
    new CI({ systemName: 'ratingEdit4', type: 'ratingEdit', title: 'Rating-edit content item with tip', tip: 'This is a tip', max: 5, val: 2 }),
    new CI({ systemName: 'ratingEdit5', type: 'ratingEdit', title: 'Rating-edit content item with description', max: 5, val: 4, description: 'This is a description' }),
    new CI({ systemName: 'ratingEdit6', type: 'ratingEdit', title: 'Rating-edit content item with value tips', max: 5, val: 3, valueTips: ['1-star tip', '2-star tip', 'This is the tip for 3 stars', 'Tip for 4 stars', '5-star tip'] }),
    new CI({ systemName: 'ratingEdit7', type: 'ratingEdit', title: 'Standard rating-edit content item', icon: 'thumbs-up', tip: 'This is a tip', max: 5, val: 4 }),
    new CI({ systemName: 'ratingEdit8', type: 'ratingEdit', title: 'Rating-edit content item with full works', icon: 'music', tip: 'This is a tip', max: 5, val: 2, description: 'This is a description', valueTips: ['1-star tip', '2-star tip', 'This is the tip for 3 stars', 'Tip for 4 stars', '5-star tip'] }),
  ];

  var sliderCI = editCIs.sections[7];
  sliderCI.contentItems = [
    getHeader(sliderCI),
    { type: 'text', val: 'The slider content item can be used for entering and editing a value along a scale.' },
    new CI({ systemName: 'slider1', type: 'slider', title: 'Basic slider content item', index: 3, items: [{ val: 0 }, { val: 1 }, { val: 2 }, { val: 3 }, { val: 4 }] }),
    new CI({ systemName: 'slider2', type: 'slider', title: 'Slider non-integers', index: 0, items: [{ val: 'Apple' }, { val: 'Banana' }, { val: 'Cherry' }, { val: 'Date' }, { val: 'Elderberry' }] }),
    new CI({ systemName: 'slider3', type: 'slider', title: 'Slider 0-100', index: 30 })
  ];

  var textEditCI = editCIs.sections[8];
  textEditCI.contentItems = [
    getHeader(textEditCI),
    { type: 'text', val: 'The text-edit content item can be used for entering and editing general text.' },
    new CI({ systemName: 'textEdit1', type: 'textEdit', title: 'Basic text-edit content item', tip: 'Click text to edit. Click away from text to finish.', val: 'Hello world' }),
    new CI({ systemName: 'textEdit2', type: 'textEdit', title: 'Text-edit content item with no initial value', tip: 'Click edit icon to edit. Click away to finish.' }),
    new CI({ systemName: 'textEdit3', type: 'textEdit', title: 'Text-edit content item with full works', icon: 'music', tip: 'This is a tip', description: 'This is a description', val: 'Hello world' })
  ];

  var timeEditCI = editCIs.sections[9];
  timeEditCI.contentItems = [
    getHeader(timeEditCI),
    { type: 'text', val: 'WIP - Not needed for the SPEP project', style: 'color: red;' },
    { type: 'text', val: 'The time-edit content item can be used for entering and editing a time.' },
    new CI({ systemName: 'timeEdit1', type: 'timeEdit', title: 'Basic time-edit content item', val: undefined })
  ];

  var urlEditCI = editCIs.sections[10];
  urlEditCI.contentItems = [
    getHeader(urlEditCI),
    { type: 'text', val: 'The url-edit content item can be used for entering and editing the name and value of a url.' },
    new CI({ systemName: 'urlEdit1', type: 'urlEdit', title: 'Basic url-edit content item', tip: 'Click to edit. Click away to finish.', urlTitle: { val: 'Hello world' }, url: { val: 'www.google.com' } }),
    new CI({ systemName: 'urlEdit2', type: 'urlEdit', title: 'Url-edit content item with no initial values' })
  ];

  var otherCIs = o.sections[2];
  otherCIs.sections = [
    { title: 'Header', icon: 'bookmark' },
    { title: 'List', icon: 'list-ul' },
    { title: 'Text', icon: 'font' },
    { title: 'File-upload', icon: 'upload' }
  ];

  var headerCI = otherCIs.sections[0];
  headerCI.contentItems = [
    getHeader(headerCI),
    { type: 'text', val: 'The header content item can be used for displaying a heading.' },
    { type: 'header', title: 'This is a header content item', icon: 'food' }
  ];

  var listCI = otherCIs.sections[1];
  listCI.contentItems = [
    getHeader(listCI),
    { type: 'text', val: 'The header content item can be used for displaying a list.' },
    { type: 'list', title: 'This is a list content item.', items: ['Item 1', 'Item 2'] }
  ];

  var textCI = otherCIs.sections[2];
  textCI.contentItems = [
    getHeader(textCI),
    { type: 'text', val: 'The header content item can be used for displaying text.' },
    { type: 'text', val: 'This is a text content item.' }
  ];

  var fileUploadCI = otherCIs.sections[3];
  fileUploadCI.contentItems = [
    getHeader(fileUploadCI),
    { type: 'text', val: 'The file-upload content item can be used for uploading a file.' },
    { type: 'text', val: 'WIP', style: 'color: red;' }
  ];

  return o;
});
