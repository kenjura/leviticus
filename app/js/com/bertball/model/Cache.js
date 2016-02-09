com.bertball.model.Cache = function(config) {
	ww.model.cache = this;
	var db = config.getDB();

	this.get = function(key) {
		return JSON.parse(localStorage.getItem(key+'_'+db));
	}
	this.put = function(key,value) {
		localStorage.setItem(key+'_'+db,JSON.stringify(value));
	}
	this.invalidate = function(key) {
		localStorage.removeItem(key+'_'+db);
	}
};
com.bertball.model.Cache.$inject = ['config'];
angular.module('leviticus').service('cache',com.bertball.model.Cache);