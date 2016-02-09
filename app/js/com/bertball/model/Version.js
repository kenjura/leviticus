(function(){
	com.bertball.model.Version = function($http,$q,$rootScope,cache,config,user) {
		var instance = ww.model.version = this;

		this.getCurrentVersion = function() {
			var deferred = $q.defer();

			// var cached = cache.get('currentVersion');
			// if (cached) {
			// 	instance.currentVersion = cached;
			// 	deferred.resolve(cached);
			// } else {
				// default to latest prod
				this.getVersions()
					.then(function(versions){
						var currentVersion;
						var stored = localStorage.getItem('currentVersion_'+config.getDB());
						if (stored) currentVersion = _.findWhere(versions,{name:stored});
						if (!currentVersion) currentVersion = _.max(
							versions.filter(function(a){ return a.isRelease }),
							function(a){ return a.rank }
						);
						// cache.put('currentVersion',currentVersion);
						instance.currentVersion = currentVersion;
						deferred.resolve(currentVersion);
					})				
			//}

			return deferred.promise;
		}

		this.getVersions = function() {
			var deferred = $q.defer();
			// var cached = cache.get('versions');
			// if (cached) { instance.versions = cached; deferred.resolve(cached); }
			//else { 
				$http.get( config.getServiceRoot() + 'version' )
					.success(function(data){ 
						var latestProd = _.max( data.filter(function(a){ return a.isRelease }), function(a){ return a.rank });
						var latestDev = _.max( data.filter(function(a){ return !a.isRelease && a.rank>latestProd.rank }), function(a){ return a.rank }) || latestProd;
						latestProd.latestProd = true;
						latestDev.latestDev = true;
						instance.versions = scrub(data);
						// cache.put('versions',data);
						deferred.resolve(scrub(data)) 
					})
					.error(function(err){ deferred.reject(err) });
			//}
			return deferred.promise;

			function scrub(data){
				var ret = data.map(function(d){
					d.dateCreated = new Date(d.dateCreated);
					d.getLabel = function(){ return this.name + (this.latestProd && ' (latest stable)' || '') + (this.latestDev && ' (latest dev)' || '') };
					return d;
				})
				ret.fields = { id:'id', rank:'rank', name:'name', description:'shortDescription', dateCreated:'dateCreated', isRelease:'isRelease' };
				return ret;
			}
		}

		this.promote = function(args) {
			console.log('Version > promote > begin.',args);
			$http.post( config.getServiceRoot() + 'version/'+args.id+'/promote', { authToken:user.getAuthToken() } )
				.success(function(data){ instance.getVersions() })
				.error(function(err){ alert(err) });
		}
		this.release = function(args) {
			console.log('Version > release > begin.',args);
			var isRelease = args.isRelease ? 0 : 1;
			$http.post( config.getServiceRoot() + 'version/'+args.id+'/release', { authToken:user.getAuthToken(), isRelease:isRelease } )
				.success(function(data){ instance.getVersions() })
				.error(function(err){ alert(err) });
		}
	}

	com.bertball.model.Version.$inject = ['$http','$q','$rootScope','cache','config','user'];

	angular.module('leviticus').service('version',com.bertball.model.Version);


})();
