(function(){
	com.bertball.model.ArticleProvider = function($http,config,DAL,state,user,version,WikiUtil) {
		var instance = ww.model.article = this;

		this.blank = {
			body: '',
			render: function(){ return '' }
		}

		this.get = function(articleName,args) {
			return new Promise(function(resolve,reject){
				DAL.getArticle(articleName,args)
					.then(function(data){ 
						if (data.reason=='no such article') resolve(new Article({articleName:articleName}));
						else resolve(new Article(data))
					})
					.catch(function(err){ 
						reject(err);
					});
			});
		}
		this.getAll = function() {
			$http.get( config.getServiceRoot() + 'article' )
				.success(function(data){ 
					instance.all = data.sort(function(a,b){ return a.name > b.name ? 1 : -1 });
				});
		}

		this.diffPrevious = function(articleName,revId) {
			return this.diff(articleName,revId,revId-1);
		}
		this.diff = function(articleName,revId_1,revId_2) {
			// runs a diff of two rev IDs
			Promise.all([ this.get(articleName,{revisionId:revId_1}), this.get(articleName,{revisionId:revId_2}) ])
				.then(function(results){
					var rev1 = results[0];
					var rev2 = results[1];
					// console.log(rev1);
					// console.log(rev2);

					// get the baseText and newText values from the two textboxes, and split them into lines
				    var left = difflib.stringAsLines(rev1.body);
				    var right = difflib.stringAsLines(rev2.body);

				    // create a SequenceMatcher instance that diffs the two sets of lines
				    var sm = new difflib.SequenceMatcher(left, right);

				    // get the opcodes from the SequenceMatcher instance
				    // opcodes is a list of 3-tuples describing what changes should be made to the base text
				    // in order to yield the new text
				    var opcodes = sm.get_opcodes();

					var node = diffview.buildView({
				        baseTextLines: left,
				        newTextLines: right,
				        opcodes: opcodes,
				        // set the display titles for each resource
				        baseTextName: "Revision "+revId_1,
				        newTextName: "Revision "+revId_2,
				        contextSize: null,
				        viewType: 0
				    });
				    var target = document.getElementById('diffTarget');
				    target.innerHTML = '';
				    target.appendChild(node);

				    console.warn("I'm dumb.");

				    resolve();
				});
		}
		this.search = function(query) {
			return $http.get( config.getServiceRoot() + 'article?q=' + escape(query) );
		}

		function Article(args) {
			var _this = this;
			_.extend(this,args);

			this._draft = {};

			this.getDraft = function() {
				$http.get( config.getServiceRoot() + 'article/'+this.articleName+'?draft=1&version='+version.currentVersion.name )
					.success(function(data){ 
						if (data.reason=='no such article') _this._draft = new Article( _.omit(_this,'revisionId') );
						else _this._draft = new Article(data);
					})
					.error(function(err){ alert('error retrieving draft. avoiding editing') });
			}
			this.getRevisions = function() {
				$http.get( config.getServiceRoot() + 'article/'+this.articleName+'/revisions' )
					.success(function(data){ _this.revisions = scrub(data) })
					.error(function(err){ alert(err) });
				function scrub(data) {
					return data.map(function(a){
						a.datetime = new Date(a.datetime);
						return a
					})
				}
			}					
			this.getTOC = function() {
				if (!this.body||!this.body.match( /^=/m )) return '';
				var headers = this.body.match( /^=.*/mg ).join('\n');
				headers = headers.replace( /\[\[/g , '' );
				headers = headers.replace( /\]\]/g , '' );
				headers = headers.replace( /^===([^=|]*)(.*)$/mg , '*** $1' );
				headers = headers.replace( /^==([^=|]*)(.*)$/mg , '** $1' );
				headers = headers.replace( /^=([^=|]*)(.*)$/mg , '* $1' );
				headers = headers.replace( /=([^=|]*)/g , '$1' );
				headers = headers.replace( /\* (.*)$/mg , '* [[#$1]]' );
				//return headers;
				return WikiUtil.wikiToHtml(headers,this,true).html;
			}
			this.reload = function() {
				DAL.getArticle(this.articleName)
					.then(function(data){ 
						_.extend(_this,data) 
					})
					.catch(function(err){ alert(err) });
			}
			this.render = function() {
				return WikiUtil.wikiToHtml(_this.body,_this,false,instance.all);
			}
			this.renderDraft = function() {
				return WikiUtil.wikiToHtml(_this._draft.body,_this,false,instance.all);
			}
			this.discardDraft = function() {
				_.extend(this._draft,this);
				this._draft.save({draft:1});
			}
			this.publishDraft = function() {
				return new Promise(function(resolve,reject){
					if (!user.isLoggedIn()) {
						state.error('NOAUTH','Please log in to edit articles.');
						reject();
					}
					_this._draft.save({draft:0})
						.success(function(data){ 
							_.extend(_this,data);
							resolve();
						})
						.error(function(err){ alert(err); reject(); });
				});
			}
			this.saveDraft = function() {
				console.log('Article > save draft > begin.');
				localStorage.setItem( 'draftBackup_article'+this.articleId+'_'+config.getDB(), this._draft.body );
				if (!user.isLoggedIn()) return state.error('NOAUTH','Please log in to edit articles. Your changes are not currently being saved.');
				var obj = {
					articleName:this.articleName,
					authToken:user.getAuthToken(),
					body:this._draft.body,
					draft:1,
					version:version.currentVersion.name
				};
				$http.post( config.getServiceRoot() + 'article', obj )
					.success(function(data){
						if ( isNaN(parseInt(data.revisionId)) || isNaN(parseInt(data.articleId)) ) alert('woah, something went wrong. Copy the article text and save it somewhere else, and try reloading.');
						else _.extend(_this._draft,_.omit(data,'body'));
					})
					.error(function(data,status){ console.error('FAILURE',data,status) });
			}
			this.save = function(args) {
				if (!user.isLoggedIn()) return alert('must be logged in to do that');

				var obj = _.pick(this,'articleId','articleName','body','draft','revisionId');
				obj.authToken = user.getAuthToken();
				obj.version = version.currentVersion.name;
				_.extend(obj,args);

				// validate
				if (!_.isNumber(obj.articleId)) return alert('no article id, cannot save');
				if (!obj.articleName) return alert('no articleName, cannot save');
				if (!_.isNumber(obj.revisionId)) return alert('no revision id, cannot save');

				// go
				return $http.post( config.getServiceRoot() + 'article', obj );
			}
		}
	}

	com.bertball.model.ArticleProvider.$inject = ['$http','config','DAL','state','user','version','WikiUtil'];

	angular.module('leviticus').service('article',com.bertball.model.ArticleProvider);


})();
