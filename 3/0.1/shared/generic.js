var thGenericModule = angular.module('thGenericModule', []);

/*
  thGenericModule
    * A module encapsulating services which are independent of any business model or logic

  lodash extensions
  hierarchyFunctionsService
  isFunctionsService
  listFunctionsService
  promiseFunctionsService
*/

thGenericModule.run(function($rootScope) {
  _.templateSettings = { 'interpolate': /{{([\s\S]+?)}}/g }; //allow double-moustache syntax in message templates
  //create some new generic underscore methods
  _.mixin({ //ref: http://underscorejs.org/#mixin
    compare: function(a, b) { //compares a and b and returns 1 (a first), -1 (b first) or 0 (equal)
      if (a === undefined && b === undefined) return 0;
      if (a === undefined) return -1;
      if (b === undefined) return 1;
      return (a>b?1:(b>a?-1:0));
    },
    deep: function (o, path) { // extracts a value from a nested object using a string path
      //ref: https://gist.github.com/furf/3208381
      // usage: _.deep({ a: { b: { c: { d: ['e', 'f', 'g'] }, 'a.b.c.d[2]'); ==> 'g
      var keys = path.replace(/\[(["']?)([^\1]+?)\1?\]/g, '.$2').replace(/^\./, '').split('.');
      var i = 0, n = keys.length;
      while ((o = o[keys[i++]]) && i < n) {}
      return i < n ? void 0 : o;
    },
    deepCompare: function(o1, o2, path) { //compares 2 deep values (see 'compare' and 'deep')
      return _.compare(_.deep(o1, path), _.deep(o2, path));
    },
    arrayOfValues: function(o) { //returns an array of object values; o: any object (non-circular)
      //can be useful for generic text-search on a an object
      var a = [];
      function traverse(o) {
        for (var i in o) {
          if (typeof o[i] === 'object') { traverse(o[i]); } else { a.push(o[i]); }
        }
      }
      traverse(o);
      return a;
    },
    objectify: function(x, newPropertyName) { //converts x to an object if it isn't one already
      newPropertyName = newPropertyName || 'val';
      if (typeof x === 'object') { return x; } else { var o = {}; o[newPropertyName] = x; return o; }
    },
    objectifyAll: function(arr, newPropertyName) { //'objectifies' all items of an array
      return _.map(arr, function(item) { return _(item).objectify(newPropertyName).value(); });
    },
    addUniqueId: function(o) { //adds a uniqueId to o
      o.id = _.uniqueId();
      return o;
    },
    addUniqueIds: function(arr, newPropertyName) {
      return _.map(arr, function(item) { return _(item).addUniqueId(newPropertyName).value(); });
    },
    isDefined: function(x) { return !_.isUndefined(x); },
    firstDefined: function() { return _.find(arguments, function(x) { return _.isDefined(x); }); },
    eachRight: function(arr, callback) {
      for (var i = arr.length-1; i >= 0; i--) { callback(arr[i], i, arr); }
      return arr;
    },
    rejectInPlace: function(arr, callback) {
      return _.eachRight(arr, function(item, index) { if (callback(item)) arr.splice(index, 1); });
    },
    toTitleCase: function(s) { return s.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); }); },
    toPascalCase: function(s) { return _.toTitleCase(s).replace(/ /g, ''); },
    toCamelCase: function(s) { var x = _.toPascalCase(s); return x[0].toLowerCase() + x.slice(1); },
    addProperty: function(arr, propertyName, propertyValue) { //adds a property to every item in an array
      _.each(arr, function(item) { item[propertyName] = propertyValue; }); return arr;
    },
    invertString: function(s) { return (s.slice(0, 1) === '-' ? s.slice(1) : '-' + s ); }, // _.invertString('abc') => '-abc'; _.invertString('-abc') => 'abc';
    setAll: function(collection, attributeName, attributeValue, nestedCollectionName) {
      //sets all the attributeName properties of a collection to attributeValue
      //if optional nestedCollectionName is specified, recursively sets child collections too
      _(collection).forEach(function(item) {
        item[attributeName] = attributeValue;
        if (nestedCollectionName && item[nestedCollectionName]) {
          _.setAll(item[nestedCollectionName], attributeName, attributeValue, nestedCollectionName); //recursion
        }
      });
    },
    isProbablyValidEmailFormat: function(s) {
      //returns true if s is probably a valid email format
      //'probably' because 'definitely' is apparently not really possible
      //see also: http://www.regular-expressions.info/email.html and http://en.wikipedia.org/wiki/Email_address
      var reg = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
      return reg.test(s);
    },
    isValidUrlFormat: function(s) {
      var reg = new RegExp(/https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,}/);
      return reg.test(s);
    },
    isDigitsOnly: function(s) { return new RegExp(/^[0-9]*$/).test(s); },
    isValidMoneyValue: function(s) { return new RegExp(/^(\d*\.\d{1,2}|\d+)$/).test(s); },
    mergeDefaults: function(o, defaultValues) { o = o || {}; return _.defaults(o, defaultValues); }, //tweak of the defaults function to allow a non-initial object
    nestedForEach: function(collection1, collection2, fn) { //syntactic sugar for a forEach within a forEach
      _.forEach(collection1, function(item1) { _.forEach(collection2, function(item2) { fn(item1, item2); }); });
    },
    mapToInts: function(arr) { return _.map(arr, function(item) { return _.parseInt(item); }); },
    convertToArray: function(x, mapToInts) { //converts x to an array
      if (_.isArray(x)) return x;
      if (_.isString(x)) return (mapToInts ? _.mapToInts(x.split(',')) : x.split(','));
      if (_.isNumber(x)) return [x];
    },
    markMatchingCollectionItems: function(collection, valuesToMark, propertyToMatch, markerPropertyName) {
      //e.g. f([{id:4},{id:5},{id:6}], 5) => f([{id:4},{id:5,isSelected:true},{id:6}], 5)
      propertyToMatch = propertyToMatch || 'id';
      markerPropertyName = markerPropertyName || 'isSelected';
      _.setAll(collection, markerPropertyName, false);
      _.nestedForEach(collection, _.convertToArray(valuesToMark, true), function(item1, item2) {
        if (item1[propertyToMatch] === item2) item1[markerPropertyName] = true;
      });
    },
    getFirstOwnPropertyName: function(o, propertyNamesArray) {
      return _.find(propertyNamesArray, function(propertyName) { return o.hasOwnProperty(propertyName); });
    },
    getFirstOwnProperty: function(o, propertyNamesArray) { return o[_.getFirstOwnPropertyName(o, propertyNamesArray)]; },

    //video functions
    getYouTubeId: function(s) {
      if (!s) return;
      var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      var match = s.match(regex);
      return (match && match[2].length == 11 ? match[2] : undefined);
    },
    getVimeoId: function(s) {
      if (!s) return;
      if (s.slice(0, 25) === '//player.vimeo.com/video/') return (_.isDigitsOnly(s.slice(25)) ? s.slice(25) : undefined);
      var regex = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
      var match = s.match(regex);
      return (match ? match[3] : undefined);
    },
    getVideoEmbedUrl: function(s) {
      var embedUrl;
      var youTubeId = _.getYouTubeId(s); if (youTubeId) embedUrl = 'http://www.youtube.com/embed/' + youTubeId;
      var vimeoId = _.getVimeoId(s); if (vimeoId) embedUrl = '//player.vimeo.com/video/' + vimeoId;
      return embedUrl;
    },
    isValidVideoUrlFormat: function(s) {
      return (!!_.getVideoEmbedUrl(s));
    },

    //date functions
    toDateString: function(date, template) {
      if (!_.isDate(date)) return;
      template = template || '{{yyyy}}-{{mm}}-{{dd}}';

      var o = {};
      o.yyyy = date.getFullYear().toString();
      o.m = (date.getMonth()+1).toString(); // getMonth() is zero-based
      o.d  = date.getDate().toString();
      o.mm = o.m[1]?o.m:'0'+o.m[0];
      o.dd = o.d[1]?o.d:'0'+o.d[0];

      return _.template(template, o);
    }
  });
});

thGenericModule.filter('truncate', function () {
  //truncates a string to maxLength (without splitting a word), adding an ellipsis where necessary
  return function (s, maxLength, ellipsis) {
    maxLength = maxLength || 10;
    ellipsis = ellipsis || '...';

    if (s.length - ellipsis.length <= maxLength) return s;
    s = s.slice(0, maxLength-ellipsis.length);
    return s.slice(0, Math.min(s.length, s.lastIndexOf(' '))) + ellipsis;
  };
});

thGenericModule.factory('hierarchyFunctionsService', function () {
  //hierarchyFunctionsService: use to create a more self-aware hierarchy
  //e.g. can use this service to add the following properties to each item in the hierarchy:
  //index, parent, depth, path, previous, next

  var resetMarkers = function() {
    var collectionName = this.propertyNames.childCollectionNames[0]; //could be made more general later
    _.setAll(this.parent[collectionName], this.propertyNames.marker, false, collectionName);
  };

  var select = function(params) {
    this.resetMarkers();

    var collectionName = this.propertyNames.childCollectionNames[0]; //could be made more general later
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
    var defaults = { childCollectionNames: ['sections', 'contentItems'], marker: 'isSelected', previous: 'previous', next: 'next' };
    propertyNames = _.defaults({}, propertyNames, defaults);

    //add hierarchy object
    object.hierarchy = { object: object, parent: object, propertyNames: propertyNames, resetMarkers: resetMarkers, select: select };

    //add index to hierarchy; add parent, depth and path to each hierarchy item
    _.each(propertyNames.childCollectionNames, function(collectionName) { object.hierarchy[collectionName + 'Index'] = []; });
    object.hierarchy.index = [];

    var iterate = function(parent) {
      var childCollectionName = _.getFirstOwnPropertyName(parent, propertyNames.childCollectionNames);
      _.each(parent[childCollectionName], function(item, index) {
        object.hierarchy[childCollectionName + 'Index'].push(item);
        object.hierarchy.index.push(item);
        item.collectionName = childCollectionName;
        item.index = index;
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

  o.updateIndexes = function(hierarchy, newItem, oldItem, indexNames) {
    //updates all indexes so that any index item which pointed at oldItem now points at newItem (allowing an indexed item to be changed)
    indexNames = indexNames || ['index', 'sectionsIndex', 'contentItemsIndex'];
    _.each(indexNames, function(indexName) {
      var i = _.findIndex(hierarchy[indexName], oldItem);
      if (i > -1) hierarchy[indexName][i] = newItem;
    });
  };

  return o;
});

thGenericModule.factory('isFunctionsService', function () {
  var o = {};

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

thGenericModule.factory('listFunctionsService', function () {
  var o = {};

  o.toggleLimitedListItem = function(listItems, item, options) {
    //returns true if the listItems were changed
    options = _.defaults({}, options, { limit: 99, markerAttributeName: 'isSelected' });
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

  o.generateListFromArray = function(array) {
    //e.g. of use: console.log(JSON.stringify(generateListFromArray(['z','y','x'].sort())));
    return _.map(array, function(val, index) { return { id: index+1, name: val }; });
  };

  return o;
});

thGenericModule.factory('$qDecoratorService', function ($q, $timeout) {
  var o = {};

  o.decorate = function($q) {
    $q.delay = $q.delay || function(ms) {
      var deferred = $q.defer();
      $timeout(deferred.resolve, ms);
      return deferred.promise;
    };
  };

  return o;
});