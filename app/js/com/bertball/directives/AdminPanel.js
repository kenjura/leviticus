angular.module('leviticus').directive('adminPanel', [ 'application', '$parse', '$timeout', function(app,$parse,$timeout) {
	return {
		restrict:'E',
		replace:true,
		scope: {
			actions:'=',
			editor:'=',
			model:'=',
			stateName:'@',
			label:'@'
		},
		transclude: true,
		link:function(scope, element, attr) {
			var modelGet = $parse(attr.model);
			var modelSet = modelGet.assign;
			var modelContext = { homeCtrl:ww.ctrl.homeCtrl };
			var promise;

			ww.directives[attr.stateName] = scope;

			scope.data = modelGet(modelContext);
			scope.state = app.state.admin.states[attr.stateName];
			scope.sync = { class:'icon-checkmark', status:'saved' };

			scope.isVisible = function() {
				return app.state.admin.state == scope.state;
			}
			scope.cancel = function() {
				scope.model.reload();
				app.state.admin.setState('closed');
			}
			scope.discard = function() {
				if (window.confirm('Really discard draft? This will undo all changes since the last published version.'))
					scope.model.discardDraft();
			}
			scope.getModel = function() {
				if (attr.modelField) return scope.model[attr.modelField];
				else return scope.model;
			}
			scope.save = function() {

			}
			scope.saveDraft = function() {
				scope.sync = { class:'icon-cycle', status:'saving' };
				$timeout.cancel(promise);
				promise = $timeout(function(){
					scope.model.saveDraft();
					scope.sync = { class:'icon-checkmark', status:'saved' };
				},500);
			}
			scope.toggle = function() {
				app.state.admin.state.width = app.state.admin.state.width=='half' ? 'full' : 'half';
			}

			scope.publish = function() {
				scope.model.publishDraft()
					.then(function(){ app.state.admin.setState('closed'); scope.$apply() });
			}

		},
		template: ''+
			'<div class="admin-panel" ng-if="isVisible()">'+
				'<div class="admin-panel-header">'+
					'<div class="left">{{label}}</div>'+
					'<span ng-if="editor==\'draft\'">'+
						'<div class="nonButton admin-panel-sync {{sync.class}}" syncing="{{sync.status}}"></div>'+
						'<div class="button" ng-click="toggle()">toggle</div>'+
						'<div class="button" ng-click="discard()">discard</div>'+
						'<div class="button" ng-click="publish()">publish</div>'+
					'</span>'+
					'<span ng-if="editor==\'direct\'">'+
						'<div class="button" ng-click="cancel()">cancel</div>'+
						'<div class="button" ng-click="save()">save</div>'+
					'</span>'+
					'<ng-transclude></ng-transclude>'+
				'</div>'+
				'<div class="admin-panel-body" scroll="{{editor==\'datagrid\'}}">'+
					'<textarea ng-if="editor==\'direct\'" ng-model="model.body"></textarea>'+
					'<textarea ng-if="editor==\'draft\'" ng-model="model._draft.body" ng-keyup="saveDraft()"></textarea>'+
					'<datagrid ng-if="editor==\'datagrid\'" data="getModel()" actions="actions"></datagrid>'+
				'</div>'+
			'</div>'
	}
}]);
