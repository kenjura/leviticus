(function(){
	com.bertball.model.Config = function($location) {
		var instance = ww.model.config = this;
		window.$location = $location;
		// to do: figure out database from URL, etc...
		// this.serviceUrl = 'http://localhost:3000/';
		// this.serviceUrl = 'http://node3000.bertball.com/';
		// if (window.location.hostname.match('loc-'))
		// 	this.serviceUrl = '//' + window.location.hostname + ':3000/';
		// else
		// 	this.serviceUrl = '//node3000.bertball.com/';
		this.serviceUrl = '//' + window.location.hostname + ':3000/';
		if (window.location.hostname.match('kenjura')) this.serviceUrl = 'http://node3000.kenjura.com/';

		// if (window.location.match('loc-'))
		// 	this.serviceUrl = 'http://node3000.bertball.com/';
		// else
		// 	this.serviceUrl = 'http://localhost:3000/';

		this.getImageRoot = function() {
			if (window.location.hostname.match('kenjura')) return 'http://www.kenjura.com/'+this.getLocation().db+'/';
			if (window.location.hostname.match('loc-'))
				return 'http://loc-www.bertball.com/'+this.getLocation().db+'/';
			else
				return 'http://www.bertball.com/'+this.getLocation().db+'/';
		}

		this.getDB = function() {
			return this.getLocation().db;
		}

		this.getLocation = function() {
			// return parseLocation();
			var path = $location.path().split('/');
			return {
				db: path[1].toLowerCase(),
				articleName: path.length > 2 && path[2],
				query: $location.search()
			}
		}

		this.getServiceRoot = function() {
			// var db = [].concat(window.location.pathname.match( /\/([^\/?]+)/ )).pop();
			return this.serviceUrl + this.getDB() + '/';
		}

		// function parseLocation() {
		// 	// var re = /(?:\/([^\/?]+))?(?:\/([^\/?]+))?/;
		// 	var re = /(?:\/([^\/?]+))?(?:\/([^\/?]+))?(?:\?(.*))?/;
		// 	var arr = [].concat( window.location.pathname.match(re) );
		// 	// if (arr[3]) query
		// 	return {
		// 		db: arr[1],
		// 		articleName: arr[2],
		// 		queryString: arr[3]
		// 	};
		// }
	}

	com.bertball.model.Config.$inject = [ '$location' ];

	angular.module('leviticus').service('config',com.bertball.model.Config);

})();
