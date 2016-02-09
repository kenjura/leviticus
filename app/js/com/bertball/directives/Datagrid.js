angular.module('leviticus').directive('datagrid', [ 'application', '$parse', '$timeout', function() {
	return {
		restrict:'E',
		replace:true,
		scope: {
			actions:'=',
			data:'='
		},
		transclude: true,
		link:function(scope, element, attr) {
			if (!ww.directives.datagrid) ww.directives.datagrid = [];
			ww.directives.datagrid.push(scope);

			scope.$watch('data',function(){
				if (!scope.data||scope.data.length<1) {
					scope.headers = [];
					scope.rows = [];
					return;
				}
				scope.headers = scope.data.fields ? _.keys(scope.data.fields) : _.keys(scope.data[0]);
				scope.rows = scope.data;
			})

			scope.displayCell = function(row,key) {
				var val = scope.data.fields ? row[scope.data.fields[key]] : row[key];
				switch(true){
					case val instanceof Date: return val.toLocaleString();
					default: return val;
				}
			}

			scope.doAction = function(action,row) {
				console.log(action);
				action.action(row);
			}
		},
		template: ''+
			'<table class="datagrid">'+
				'<tr>'+
					'<th ng-repeat="hdr in headers">{{hdr}}</th>'+
					'<th colspan="{{actions.length}}"></th>'+
				'</tr>'+
				'<tr ng-repeat="row in rows">'+
					'<td ng-repeat="hdr in headers">{{displayCell(row,hdr)}}</td>'+
					'<td ng-repeat="action in actions" class="linkButton" ng-click="doAction(action,row)">{{action.name}}</td>'+
				'</tr>'+
				// '<tr>'+
				// 	'<td ng-repeat="hdr in headers"><input></td>'+
				// 	'<td colspan="{{actions.length}}"></td>'+
				// '</tr>'+
			'</table>'
	}
}]);
