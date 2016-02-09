com.bertball.controllers.MainCtrl = function($scope,application,article,config,state,user) {
	var instance = ww.ctrl.main = this;
	this.$scope = $scope;
	$scope.app = application;

	$scope.activateImage = function(name,url) {
		application.activeImage = {name:name,url:url};
	}

	$scope.$watch('app.article.body',function(){
		if (!application.article) return;
		$scope.articleBody = application.article.body;
		console.info('Rendering article');
		$scope.articleRendered = application.article.render().html;
		$scope.articleRendered_sidebar = application.article.render().sidebarHtml;

		$scope.redirectUrl = $scope.getRedirectURL();
	});

	$scope.$watch('app.article._draft.body',function(){
		if (!application.article) return;
		$scope.articleDraftBody = application.article._draft.body;
		console.info('Rendering article draft');
		$scope.articleDraftRendered = application.article._draft.render().html;
		$scope.articleDraftRendered_sidebar = application.article._draft.render().sidebarHtml;
	});

	$scope.$watch('article.all',function(){
		if (_.isEmpty(article.all)) return;
		if (!application.article) return;
		$scope.articleRendered = application.article.render().html;
		$scope.articleRendered_sidebar = application.article.render().sidebarHtml;
		$scope.articleDraftRendered = application.article._draft.render().html;
		$scope.articleDraftRendered_sidebar = application.article._draft.render().sidebarHtml;
	});

	$scope.getArticleRendered = function() {
		return application.state.admin.state.mode=='articleEdit' ? $scope.articleDraftRendered : $scope.articleRendered;
	}
	$scope.getArticleRendered_sidebar = function() {
		return application.state.admin.state.mode=='articleEdit' ? $scope.articleDraftRendered_sidebar : $scope.articleRendered_sidebar;
	}
	$scope.getRedirectURL = function() {
		var target = $scope.articleBody.match(/#REDIRECT \[\[([^\]]+)\]\]/);
		if (!target) return null;
		return window.location.origin +'/'+ application.location.db + '/' + (target&&target[1]);
	}

	// $scope.renderArticle = function() {
	// 	if (!application.article) return;
	// 	if (application.state.admin.state.mode=='articleEdit'&&!application.location.query.revisionId)
	// 		return application.article.renderDraft()
	// 	else
	// 		return application.article.render()
	// }

}

com.bertball.controllers.MainCtrl.$inject = [ '$scope', 'application', 'article', 'config', 'state', 'user' ];

