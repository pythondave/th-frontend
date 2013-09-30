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
    firstDefined: function() { return _.find(arguments, function(x) { return !_.isUndefined(x); }); },
    eachRight: function(arr, callback) {
      for (var i = arr.length-1; i >= 0; i--) { callback(arr[i], i, arr); }
      return arr;
    },
    rejectInPlace: function(arr, callback) {
      return _.eachRight(arr, function(item, index) { if (callback(item)) arr.splice(index, 1); });
    },
    toTitleCase: function(s) { return s.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); }); },
    toPascalCase: function(s) { return _.toTitleCase(s).replace(/ /g, ''); },
    toCamelCase: function(s) { var x = _.toPascalCase(s); return x[0].toLowerCase() + x.substring(1); },
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
    isProbablyValidEmail: function(s) {
      //returns true if s is probably a valid email
      //'probably' because 'definitely' is apparently not really possible
      //see also: http://www.regular-expressions.info/email.html and http://en.wikipedia.org/wiki/Email_address          
      var reg = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
      return reg.test(s);
    },
    isProbablyValidUrl: function(s) {
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
    }
  });
});

thGenericModule.factory('hierarchyFunctionsService', function () {
  //hierarchyFunctionsService: use to create a more self-aware hierarchy
  //e.g. can use this service to add the following properties to each item in the hierarchy:
  //index, parent, depth, path, previous, next

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