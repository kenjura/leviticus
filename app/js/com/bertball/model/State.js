(function(){
	com.bertball.model.State = function() {
		var instance = ww.model.state = this;

		this.errorState = {};

		this.error = function(type,msg) {
			instance.errorMessage = msg;
			instance.errorState[type] = true;
		}
		this.clearError = function(type) {
			instance.errorMessage = '';
			if (type=='ALL') instance.errorState = {};
			else if (type) instance.errorState[type] = false;
		}
		this.isError = function() {
			return !_.isEmpty(instance.errorMessage);
		}
	}

	com.bertball.model.State.$inject = [ '$location' ];

	angular.module('leviticus').service('state',com.bertball.model.State);

})();
