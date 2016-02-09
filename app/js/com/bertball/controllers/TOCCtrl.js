com.bertball.controllers.TOCCtrl = function($scope,application,config,state) {
	var instance = ww.ctrl.toc = this;
	this.$scope = $scope;
	$scope.app = application;

	$scope.$watch('app.article.body',function(){
		if (!application.article) return;
		$scope.articleTOC = application.article.getTOC();
	});

	$scope.$watch('app.article._draft.body',function(){
		if (!application.article) return;
		$scope.articleDraftTOC = application.article._draft.getTOC();
	});

	$scope.getTOC = function() {
		return application.state.admin.state.mode=='articleEdit' ? $scope.articleDraftTOC : $scope.articleTOC;
	}

	$scope.tocNav = function(anchor) {
		smoothScroll.animateScroll( null, '#'+anchor );
	}

}

com.bertball.controllers.TOCCtrl.$inject = [ '$scope', 'application', 'config', 'state' ];