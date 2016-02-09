(function(){
	com.bertball.model.Application = function($http,$location,$rootScope,article,config,state,user,version) {
		var instance = ww.model.application = this;
		window.app = this;

		this.version = version;

		this.start = function() {
			// initialize
			this.location = config.getLocation();
			this.mode = 'view';
			this.state = {
				useStyle: new ViewState({persist:'useStyle_'+config.getDB(),value:true}),
				user: new ViewState({value:false}),
				search: new ViewState({value:false}),
				toc: new ViewState({value:false}),
				admin: new ViewState({
					states: {
						closed: { active:false, default:true, depth:0, mode:'menu', secure:false, width:'zero' },
						menu: { active:true, mode:'menu', depth:1, secure:false, width:'menu' },
						articleEdit: { active:true, mode:'articleEdit', depth:2, secure:true, width:'half', onEnter:function(){ instance.article.getDraft() } },
						menuEdit: { active:true, mode:'menuEdit', depth:2, secure:true, width:'half', onEnter:function(){ instance.menu.getDraft() } },
						styleEdit: { active:true, mode:'styleEdit', depth:2, secure:true, width:'half', onEnter:function(){ instance.style.getDraft() } },
						revisions: { active:true, mode:'revisions', depth:2, secure:false, width:'half', onEnter:function(){ instance.article.getRevisions() } },
						versions: { active:true, mode:'versions', depth:2, secure:false, width:'half', },
						updates: { active:true, mode:'updates', depth:2, secure:false, width:'half', onEnter:function(){ instance.getUpdates() } },
						allArticles: { active:true, mode:'allArticles', depth:2, secure:false, width:'quarter', onEnter:function(){ article.getAll() } },
						user: { active:true, mode:'user', depth:2, secure:false, width:'quarter' }
					}
				})
			}

			// validate
			if (!this.location.db) return this.mode = 'noDatabase';
			if (!this.location.articleName) this.location.articleName = 'Home';

			// get data
			version.getVersions()
				.then(function(){ return version.getCurrentVersion() })
				.then(function(){
					var vObj = {version:version.currentVersion.name};
					Promise.all([
						article.get(instance.location.articleName,vObj),
						article.get('Special:Menu',vObj),
						article.get('Special:Style',vObj)
					]).then(function(values){
						instance.article = values[0];
						instance.menu = values[1];
						instance.style = values[2];
						$rootScope.$apply();
					}).catch(function(err){
						instance.mode = 'error';
						instance.error = err;
					});
				});
			

			// get user
			user.get()
				.then(function(user){ instance.user = user });

			// sanity check
			$http.get( config.serviceUrl )
				.success(function(data,status) {
					 if (data!='Leviticus is online.') state.error('OFFLINE','Service is offline') 
				})
				.error(function(data,status){ 
					state.error('OFFLINE','Service is offline.') 
				});

			// get all articles, so we know which links are live
			article.getAll();
		}

		this.getTitle = function() {
			return instance.article ?
				config.getDB() + ': ' + instance.article.articleName :
				config.getDB();
		}

		this.getUpdates = function() {
			return new Promise(function(resolve,reject){
				$http.get( config.getServiceRoot() + 'updates' )
					.success(function(data){ instance.updates = scrub(data); resolve(data) })
					.error(function(err){ alert(err) });
			});
			function scrub(data){
				return data.map(function(a){
					a.datetime = new Date(a.datetime);
					return a;
				})
			}
		}

		this.gotoArticle = function(articleName,args) {
			if (!articleName) articleName = this.location.articleName;
			if (_.isEmpty(args)) args = {};
			$location.path( this.location.db+'/'+articleName ).search( args );
			this.diffMode = false;
		}

		this.reloadAll = function() {
			var vObj = {version:version.currentVersion.name};
			Promise.all([
				article.get(instance.location.articleName,vObj),
				article.get('Special:Menu',vObj),
				article.get('Special:Style',vObj)
			]).then(function(values){
				instance.article = values[0];
				instance.menu = values[1];
				instance.style = values[2];
				$rootScope.$apply();
				if (instance.state.admin.state.mode=='articleEdit') instance.article.getDraft();
			});
		}

		this.toggleAdmin = function() {
			if (!this.state.admin.value) return this.state.admin.value = true;
			if (this.state.admin.mode!='menu') return this.state.admin.mode = 'menu';
			return this.state.admin.value = false;
		}

		$rootScope.$on('$locationChangeSuccess',function() {
			if (!instance.article) return; // cheap hack to spoil the first event
			if (instance.mode=='noDatabase') return instance.start();
			instance.diffMode = false;
			instance.location = config.getLocation();
			instance.article = article.blank;
			var vObj = {version:version.currentVersion.name};
			article.get( instance.location.articleName || 'Home', vObj )
				.then(function(article){ 
					instance.article = article;
					$rootScope.$apply();
					if (instance.state.admin.state.mode=='revisions') instance.article.getRevisions();
					if (instance.state.admin.state.mode=='articleEdit') instance.article.getDraft();
				});
		});

		$rootScope.$on('invalidateVersions',this.getVersions);

		$rootScope.$on('AUTH_ERR',function(event,args){
			state.error('NOAUTH','Please log in to edit articles.');
		})

		function ViewState(args) {
			var _this = this;
			this.value = false;
			_.extend(this,args);

			if (this.persist) this.value = localStorage.getItem(this.persist);

			this.toggle = function() { 
				this.value = !this.value;
				if (this.persist) localStorage.setItem(this.persist,this.value);
			};

			if (this.states) {
				this.setState = function(which) {
					if (_this.state.onExit) _this.state.onExit();
					var newState = _this.states[which];
					if (newState.secure && !user.isLoggedIn()) return $rootScope.$emit('AUTH_ERR',{message:'must be logged in to do that'});
					_this.state = newState;
					if (_this.state.onEnter) _this.state.onEnter();
				};
				this.state = _.findWhere( this.states, {default:true} ) || this.states[ _.keys(this.states)[0] ];
				this.toggle = function() {
					// if current state depth is 0, increase to 1. else, reduce depth by 1
					if (_this.state.onExit) _this.state.onExit();
					if (_this.state.depth==0) _this.state = _.findWhere( this.states, {depth:1} );
					else _this.state = _.findWhere( this.states, {depth:(_this.state.depth-1)});
				}
			}
		}
	}

	com.bertball.model.Application.$inject = ['$http','$location','$rootScope','article','config','state','user','version'];

	angular.module('leviticus').service('application',com.bertball.model.Application);


})();
