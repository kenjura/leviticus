com.bertball.controllers.ImageCtrl = function($scope,application,config,DAL,state,user) {
	var instance = ww.ctrl.image = this;
	this.$scope = $scope;
	$scope.app = application;

	$scope.$watch('app.activeImage',function(){ 
		$scope.activeImage = application.activeImage;
		$scope.isOpen = !_.isEmpty($scope.activeImage);
	},true);

	$scope.close = function() {
		application.activeImage = null;
		$scope.isOpen = false;
	}

	$scope.isEmpty = function() {
		return !($scope.activeImage && $scope.activeImage.url && true || false);
	}

	$scope.getUrl = function() {
		return $scope.activeImage && $scope.activeImage.url || '';
	}

	$scope.upload = function() {
		var input = document.getElementById('uploadInput');
		input.click();
		input.onchange = function() {
			var file = input.files[0];
			
			var fr = new FileReader();
			fr.onload = function(e) { 
				if ( !e || !e.target || !e.target.result ) { 
					state.error('GENERAL','Strange error using FileUploader. Cannot continue.');
					return;
				}
				DAL.uploadImage({ file:fr.result, fileName:file.name, authToken:user.getAuthToken(), imageName:$scope.activeImage.name })
    	        	.success(function(data){ console.log(data); $scope.activeImage.url = config.getImageRoot() + '/img/uploaded/' + file.name; })
	            	.error(function(data){ console.error(data); state.error('GENERAL','There was an error uploading the image.') });
			}
			fr.readAsDataURL(file);	
		}
	}
}

com.bertball.controllers.ImageCtrl.$inject = [ '$scope', 'application', 'config', 'DAL', 'state', 'user' ];
