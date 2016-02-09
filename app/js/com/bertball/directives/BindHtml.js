angular.module('leviticus').directive('bindHtml', function($compile) {
	return function(scope, element, attr) {
		scope.$watch( attr.bindHtml, function(value) {
			// auto-update attribute
			if (attr.autoUpdate&&scope.$eval(attr.autoUpdate)==false) return;

			// console.log('updating');;

			// do the work
			element.html(value||'');

			// compile
			if (attr.compile=='true')
				$compile(element.contents())(scope);

			// handle links
			// var links = element[0].querySelectorAll('a');
			// for (var i = 0; i < links.length; i++) {
			// 	links[i].onclick = function(e) {
			// 		var newTab = e.metaKey || e.ctrlKey || e.which != 1;
			// 		if (newTab) return;
					
			// 		e.preventDefault();
			// 		console.log(e.currentTarget.getAttribute('href'));
			// 		history.pushState( {}, 'foobly', e.currentTarget.getAttribute('href'));
			// 		scope.loadArticle();
			// 	}
			// }
		});
	}
})