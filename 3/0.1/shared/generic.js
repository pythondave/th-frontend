var thGenericModule = angular.module('thGenericModule', []);

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
    mergeDefaults: function(o, defaultValues) { o = o || {}; return _.defaults(o, defaultValues); } //tweak of the defaults function to allow a non-initial object
  });
});
