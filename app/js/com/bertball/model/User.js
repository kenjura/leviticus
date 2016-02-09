(function(){
	com.bertball.model.User = function($http,config,DAL) {
		var instance = ww.model.user = this;

		this.isLoggedIn = function() {
			return this.getAuthToken();
		}

		this.get = function() {
			return new Promise(function(resolve,reject){
				var authToken = instance.getAuthToken();
				if (!authToken) resolve();
				else $http.get( config.getServiceRoot() + 'user/' + authToken )
						.success(function(data){ 
							instance.currentUser = data;
							resolve(data) 
						})
						.error(function(data,status){ 
							if (status==401) instance.clearAuthToken();
							reject(data,status);
						});
			});
		}

		this.login = function(username,password) {
			return $http.post( config.getServiceRoot() + 'login', {username:username,password:password} );
		}

		this.clearAuthToken = function() {
			localStorage.removeItem('authToken_'+config.getDB());
		}
		this.getAuthToken = function() {
			return localStorage.getItem('authToken_'+config.getDB());
		}

		this.changePassword = function(oldPassword,newPassword) {
			var obj = { username:instance.currentUser.name, oldPassword:oldPassword, newPassword:newPassword };
			return $http.post( config.getServiceRoot() + 'changePassword', obj );
		}
	}

	com.bertball.model.User.$inject = ['$http','config','DAL'];

	angular.module('leviticus').service('user',com.bertball.model.User);


})();
