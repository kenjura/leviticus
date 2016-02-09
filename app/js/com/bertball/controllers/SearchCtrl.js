com.bertball.controllers.SearchCtrl = function($scope,application,article) {
	var instance = ww.ctrl.search = this;
	this.$scope = $scope;
	$scope.app = application;

	$scope.search = '';

	var doSearch = _.debounce(function() {
		$scope.message = '';

		if ($scope.search.length > 2) {
			article.search($scope.search)
				.success(function(data){ 
					$scope.loading = false;
					$scope.results = data;
					if (!data||data.length<1) $scope.message = 'No results found.';
				});
		} else {
			$scope.results = [];
			if ($scope.search.length > 0) $scope.message = 'Search query too short; 3 character minimum';
			$scope.loading = false;
			$scope.$apply();
		}
	},350);

	$scope.$watch('search',function(){
		$scope.loading = true;
		doSearch();
	});
}

com.bertball.controllers.SearchCtrl.$inject = [ '$scope', 'application', 'article' ];