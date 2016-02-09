angular.module('leviticus').directive('dropdown', [ '$timeout', function($timeout) {
	return {
		restrict:'E',
		replace:true,
		scope: {
			data:'=',
			labelField:'@',
			model:'=',
			onSelect:'&'
		},
		link:function(scope, element, attr) {
			if (!ww.directives.dropdown) ww.directives.dropdown = [];
			ww.directives.dropdown.push(scope);

			scope.$watch('data',function(){
				if (!scope.data||scope.data.length<1) return;
			})

			scope.display = function(obj,isCurrent) {
				if (!obj) return '';
				if (isCurrent && attr.currentLabelField) return typeof(obj[attr.currentLabelField])=='function' ? obj[attr.currentLabelField]() : obj[attr.currentLabelField];
				if (attr.labelField) return typeof(obj[attr.labelField])=='function' ? obj[attr.labelField]() : obj[attr.labelField];
				else return obj;
			}

			scope.set = function(obj) {
				scope.model = obj;
				if (scope.onSelect) $timeout(function(){ scope.onSelect() });
			}

		},
		template: ''+
			'<div class="dropdown">' +
				'<div class="dropdown-currentValue">{{display(model,true)}}</div>' +
				'<div class="dropdown-options">' +
					'<div class="dropdown-option" ng-repeat="d in data" ng-click="set(d)">{{display(d)}}</div>' +
				'</div>' +
			'</div>'
	}
}]);
