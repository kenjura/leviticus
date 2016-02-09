com.bertball.controllers.UserCtrl = function($scope,application,config,state,user) {
	var instance = ww.ctrl.user = this;
	this.$scope = $scope;
	$scope.app = application;

	$scope.username = null;
	$scope.password = null;
	$scope.mode = 'default'; // default, changePassword, register

	$scope.changePassword = function() {
		if (this.newPassword != this.newPasswordConfirm) return alert('passwords must match');
		user.changePassword(this.oldPassword,this.newPassword)
			.success(function(){ alert('success') })
			.error(function(data){ alert(data.message); console.error(data) });
	}

	$scope.login = function() {
		user.login(this.username,this.password)
			.success(function(user){ 
				application.user = user;
				localStorage.setItem('authToken_'+config.getDB(),user.authToken);
				state.clearError('NOAUTH');
				application.state.user.value = false;
			})
			.error(function(err){ throw new Error(err) });
	};

	$scope.logout = function() {
		application.user = null;
		user.clearAuthToken();
	};

	$scope.register = function() {
		alert('sorry, not yet supported');	
	}

	$scope.setMode = function(mode) {
		$scope.mode = mode;
		$scope.username = null;
		$scope.password = null;
	}
}

com.bertball.controllers.UserCtrl.$inject = [ '$scope', 'application', 'config', 'state', 'user' ];