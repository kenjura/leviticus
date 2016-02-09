com.bertball.controllers.AdminCtrl = function($scope,application,article,config,user,version) {
	var instance = ww.ctrl.admin = this;
	this.$scope = $scope;
	$scope.app = application;
	$scope.article = article;

	$scope.login = {
		username: null,
		password: null,
		submit: function() {
			user.login(this.username,this.password)
				.success(function(user){ 
					application.user = user;
					localStorage.setItem('authToken_'+config.getDB(),user.authToken);
				})
				.error(function(err){ throw new Error(err) });
		}
	};

	$scope.getArticleEditMode = function() {
		if (application.location.query.revisionId) return 'direct';
		return 'draft';
	}

	$scope.actions = {
		revisions: [
			{ name:'view', action:function(data){ application.gotoArticle(data.articleName,{revisionId:data.revisionId}) }},
			{ name:'edit', action:function(data){ application.gotoArticle(data.articleName,{revisionId:data.revisionId}); application.state.admin.setState('articleEdit') }},
			{ name:'diff', action:function(data){ article.diffPrevious(data.articleName,data.revisionId); application.diffMode = true; } }
		],
		versions: [
			{ name:'promote', action:function(data){ if (user.isLoggedIn()) version.promote(data); else alert('must be logged in to do that') } },
			{ name:'release', action:function(data){ if (user.isLoggedIn()) version.release(data); else alert('must be logged in to do that') } }
		],
		updates: [
			{ name:'view', action:function(data){ application.gotoArticle(data.articleName) } }
		],
		allArticles: [
			{ name:'view', action:function(data){ application.gotoArticle(data.name) } }
		]
	}

}

com.bertball.controllers.AdminCtrl.$inject = [ '$scope', 'application', 'article', 'config', 'user', 'version' ];

