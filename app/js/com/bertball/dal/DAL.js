(function(){
	com.bertball.dal.DAL = function($http,$q,config,state) {
		ww.model.dal = this;
		this.getArticle = function(id,args) {
			var url = config.getServiceRoot() + 'article/' + id + window.location.search;
			if (args) {
				if (!window.location.search) url += '?';
				else url += '&';
				url += _.pairs(args).map(function(a){ return a.join('=') }).join('&');
			}
			return $http.get(url).then(function(response){
				// handle success
				if (true) {
					// to-do: validate data here
					return response.data;
				} else {
					return $q.reject(new Error('unknown DAL error 2'));
				}
			},function(response){
				// handle error
				return $q.reject(new Error('unknown DAL error'));
			})
		}
		this.getUser = function(authToken) {
			if (!authToken) return $q.reject(new Error('no authToken'));
			var url = config.getServiceRoot() + 'user/' + authToken;
			return $http.get(url).then(function(response){
				return response.data;
			},function(response){
				return $q.reject(new Error('some sort of DAL error'));
			})
		}
		this.uploadImage = function(args) {
            if (!args) args = {};

        	var obj = {
        		file: args.file,
        		name: args.imageName,
        		fileName: args.fileName,
        		path: config.getImageRoot()+'/uploaded'
        	};

            return $http.post( config.getServiceRoot()+'upload', obj );
        }
	}

	com.bertball.dal.DAL.$inject = ['$http','$q','config','state'];

	angular.module('leviticus').service('DAL',com.bertball.dal.DAL);
})();
