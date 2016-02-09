if (!com) var com = {};
if (!com.bertball) com.bertball = {
	dal: {},
	controllers: {},
	model: {},
	util: {}
};
if (!ww) var ww = {
	ctrl: {},
	directives: {},
	model: {},
	util: {}
};

angular.module('leviticus',[])
	.config(function($locationProvider){
	  $locationProvider.html5Mode(true).hashPrefix('!');
	});



_.mixin({
	stringRepeat:function(chr,count) {
		var ret = '';
		for (var i = 0; i < count; i++) {
			ret += chr;
		}
		return ret;
	},
	getMatches: function(string, regex, index) {
	    index || (index = 1); // default to the first capturing group
	    var matches = [];
	    var match;
	    while (match = regex.exec(string)) {
	        matches.push(match[index]);
	    }
	    return matches;
	}

});

function log(){ console.log(arguments) }