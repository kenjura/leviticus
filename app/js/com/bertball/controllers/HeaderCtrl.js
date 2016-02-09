com.bertball.controllers.HeaderCtrl = function($scope,application,config,state,user) {
	var instance = ww.ctrl.header = this;
	this.$scope = $scope;
	$scope.app = application;

	$scope.altMenu = function(){ window.location = '/'+config.getDB()+'/Special:Menu' }

	$scope.getBadge = function(which) {
		switch(which) {
			case 'user':
				if (user.isLoggedIn()) return 'ok';
				if (state.errorState.NOAUTH) return 'noauth';
				return 'unknown';
		}
	}

	$scope.$watch('app.menu.body',function(){
		if (application.menu)
			$scope.menuRendered = application.menu.render().html;
	});
	$scope.$watch('app.menu._draft.body',function(){
		if (application.menu&&application.menu._draft)
			$scope.menuDraftRendered = application.menu._draft.render().html;
	});
	$scope.getMenuRendered = function() {
		return application.state.admin.state.mode=='menuEdit' ? $scope.menuDraftRendered : $scope.menuRendered;
	}

	$scope.changeCurrentVersion = function() {
		application.reloadAll();
		localStorage.setItem('currentVersion_'+config.getDB(), application.version.currentVersion.name);
	};

	// $scope.getVersions = function() {
	// 	application.version.getVersions().then(function(a){ $scope.versions = a });
	// 	application.version.getCurrentVersion().then(function(a){ $scope.currentVersion = a });
	// }

	// $scope.getVersions();
}

com.bertball.controllers.HeaderCtrl.$inject = [ '$scope', 'application', 'config', 'state', 'user' ];