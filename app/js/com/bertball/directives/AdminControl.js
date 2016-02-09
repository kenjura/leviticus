angular.module('leviticus').directive('adminControl', [ 'application', function(app) {
	return {
		restrict:'E',
		replace:true,
		scope: {
			label:'@',
			stateName:'@'
		},
		link:function(scope, element, attr) {
			scope.app = app;
			scope.click = function() {
				app.state.admin.setState( scope.stateName );
			}
			scope.getState = function() {
				switch(app.state.admin.state.mode) {
					case 'menu': return 'neutral';
					case scope.stateName: return 'active';
					default: return 'inactive';
				}
			}
		},
		template: ''+
			'<div class="admin-control" ng-click="click()" state="{{getState()}}">{{label}}</div>'
	}
}]);
