com.bertball.controllers.HomeCtrl = function($scope,application,state) {
	var instance = ww.ctrl.home = this;
	this.$scope = $scope;
	this.state = state;
	$scope.app = application;

	this.start = function() {
		this.app = application;
		application.start();
	}
	this.renderStyle = function() {
		if (application.state.admin.state.mode=='styleEdit')
			return application.style && application.style._draft.body;
		else
			return application.style && application.style.body;
	}
	this.getTitle = function() {
		return application.getTitle();
	}

	$scope.tocNav = function(anchor) {
		smoothScroll.animateScroll( null, '#'+anchor );
	}


	window.addEventListener('keydown',function(){
		// ng-keypress isn't good enough; we want to capture all key events

		var cmdCode = event.shiftKey && (event.metaKey || event.ctrlKey);

		// without command codes
		switch(event.keyCode) {
			case 27: /* Esc */ application.state.admin.toggle(); sa(); pd(); return;
			case 65: /* a */ if (cmdCode) { application.state.admin.setState('articleEdit'); sa(); pd(); return; }
			case 77: /* m */ if (cmdCode) { application.state.admin.setState('menuEdit'); sa(); pd(); return; }
			case 83: /* s */ if (cmdCode) { application.state.admin.setState('styleEdit'); sa(); pd(); return; }
			case 85: /* u */ if (cmdCode) { application.state.user.toggle(); sa(); pd(); return; }
		}

		function sa() { $scope.$apply() };
		function pd() { event.preventDefault() };
	});

	this.start();
}

com.bertball.controllers.HomeCtrl.$inject = [ '$scope', 'application', 'state' ];
