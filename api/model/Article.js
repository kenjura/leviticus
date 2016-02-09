(function(){

var _ = require('underscore');
var Promise = require('promise');
var Q = require('q');
var XRegExp = require('xregexp').XRegExp;

var Auth = require('./Auth.js');
var DAL = require('./DAL.js');
var Revision = require('./Revision.js');
var Version = require('./Version.js');
var Utils = require('./Utils.js');

var Article = {};
Article.listAll = function(args,callback) {
	var query = 'SELECT id,name,revisionId FROM '+args.db+'.article';
	console.log('Article > listAll > executing query: '+query);
	DAL.query(query,function(err,rows,fields) {
		if (err) throw err;
		callback(rows,fields);
	});
};
Article.search = function(args,callback) {
	console.log('Article > search > called.')
	// for now, only supports "q", aka name LIKE
	var q = args.search.q;
	// var query = "SELECT id,name,revisionId FROM $db.article WHERE name LIKE '%"+q+"%';";
	var query = ''+
		"SELECT DISTINCT articleName, MATCH(articleName,body) AGAINST ('"+q+"') AS score " +
		"FROM $db.revision " +
		"WHERE MATCH(articleName,body) AGAINST ('"+q+"') " +
		"ORDER BY score DESC;"
	query = Utils.template(query,args);
	console.log('Article > search > executing query: '+query);
	DAL.query(query,function(err,rows,fields) {
		if (err) throw err;
		callback(rows,fields);
	});
};
Article.get = function(args,callback) {
	// required args:
	//  - name: article name
	// optional args:
	//  - draft: boolean. if true, get draft. else, get release.
	//  - revisionId: get specific revisionId
	//  - version: name of the version (default: latest)

	return new Promise(function (resolve,reject){

		if (args.version) get();
		else Version.getLatest(args).then(get).catch(reject);

		function get(version) {
			console.log('Article.get > begin.');
			if (version) args.version = version.name;
			var draft = args.draft ? 1 : 0;
			console.log(args);

			var where_latestRevision = 'AND v.rank <= (SELECT rank FROM $db.version WHERE name = \'$version\') ' +
				'AND r.draft = '+draft+' ';
			var where_specificRevision = 'AND r.revisionId = \'$revisionId\' ';
			var query = ''+
				'SELECT a.id articleId, r.revisionId, r.articleName, r.body, v.name version, a.deleted, r.datetime, r.draft ' +
				',(select max(revisionId) from $db.revision where articleName=\'$name\') maxRevId ' +
				'FROM $db.Revision r ' +
				'LEFT JOIN $db.Article a ON a.id = r.articleId ' +
				'LEFT JOIN $db.Version v ON r.version = v.name ' +
				'WHERE r.articleName = \'$name\' ' +
				(args.revisionId ? where_specificRevision : where_latestRevision) +
				'ORDER BY v.rank DESC, r .revisionId DESC ' +
				'LIMIT 1;'

			query = Utils.template(query,args);	
			console.log(query);
			DAL.query(query,function(err,rows,fields) {
				if (err) throw err;
				if (!rows||rows.length<1) return reject('NO_ARTICLE');
				var article = rows[0];

				// find images
				var images = Utils.getMatches(article.body, /\[\[Image:([^\]\n\|]+)/g, 0);
				if (_.isEmpty(images)) { console.log('no images, we\'re done here'); return resolve(article); }
				console.log('image time!');
				console.log(images);
				var _args = {
					db:args.db,
					"in":images.map(function(i){ return i.replace(/'/g,"''") }).join("','")
				};
				var query = 'SELECT * FROM $db.Image WHERE name IN (\''+_args.in+'\')';
				query = Utils.template(query,_args);
				console.log(query);
				DAL.query(query,function(err,rows){
					if (err) return reject(err);
					article.images = rows;
					console.log('images:',rows);
					resolve(article);
				});
			});
		}

	});
};
Article.post = function(args) {
	// update or insert an article
	// mandatory params:
	//  - articleName or articleId, body
	// optional params:
	//  - version: if present, use, else retrieve latest version name
	//  - revisionId: if present, we're updating an existing revision; else, we're inserting a new one
	//  - tag, draft (default false)

	return new Promise(function(resolve,reject){
		console.log('Article.post > begin');

		// sync defaults
		_.defaults(args,{ tag:'', draft:0 });
		console.log(args);

		// async defaults
		if (args.version) get();
		else Version.getLatest(args).then(get).catch( function(a){reject(a)} ).catch( function(a){reject(a)} );

		// the main event
		function get(version) {
			console.log('Article.post > version is ready. proceeding.');
			if (version) args.version = version.name;

			// console.log('calling Auth.getUser(args) where Auth=',Auth,', Auth.getUser=',Auth.getUser,' and args=',args);
			var x = Auth.getUser(args)
				.then(function(user){
					args.userId = user.id;

					// if article id is supplied, we can just go ahead and replace
					// otherwise, we need to get the right articleId for the supplied articleName

					if (args.articleId) next(args.articleId);
					else Article.getId(args).then(next).catch(reject).catch(reject);

					function next(articleId) {
						args.articleId = articleId;
						console.log('Article.post > articleId is ready ('+args.articleId+'). proceeding.');

						// insert or replace revision
						var revisionPromise = args.draft ? Revision.saveDraft : Revision.replace;
						if (!args.articleId) args.articleId = articleId;
						revisionPromise(args)
							.then(function(){ resolve(args) })
							.catch(reject);
					};
				})
				.catch(function(a){ reject(a) });
		}

	});
}
Article.getLatest = function(args,callback) {
	Version.getLatest(args,function(version) {
		Article.get( _.extend(args,{version:version.name}), callback );
	});
};
Article.listRevisions = function(args,callback) {
	var query = ""+
		"SELECT articleId,articleName,revisionId,datetime,version,u.name,draft "+
		"FROM $db.Revision r "+
		"LEFT JOIN $db.User u ON u.id = r.userId "+
		"WHERE articleName='$articleName' "+
		"ORDER BY revisionId DESC";
	query = Utils.template(query,args);
	console.log(query);
	DAL.query(query,function(err,rows,fields) {
		if (err) throw err;
		callback(rows);
	});
};


Article.getId = function(args) {
	// gets an articleId from an articleName
	// if there is no such article, creates one and returns the id anyway
	// required args: articleName, version

	return new Promise(function(resolve,reject){
		console.log('Article.getId > begin.');

		var query = ''+
			'SELECT a.id, r.articleId ' +
			'FROM $db.Revision r ' +
			'LEFT JOIN $db.Article a ON a.id = r.articleId ' +
			'LEFT JOIN $db.Version v ON r.version = v.name ' +
			'WHERE r.articleName = \'$articleName\' ' +
			'AND v.rank <= (SELECT rank FROM $db.version WHERE name = \'$version\') '
			'ORDER BY v.rank DESC, r .revisionId DESC ' +
			'LIMIT 1;'
		query = Utils.template(query,args);
		console.log(query);
		DAL.query(query,function(err,rows){
			if (err) reject(err);
			if (rows[0]) { 
				console.log('Article.getId > found existing article with id '+rows[0].articleId);
				resolve(rows[0].articleId);
			} else {
				query = Utils.template("INSERT INTO $db.Article(name,deleted) VALUES('$articleName',0);",args);
				DAL.query(query,function(err,result){
					if (err) reject(err);
					console.log('Article.getId > inserted a new article with id '+result.insertId);
					resolve(result.insertId);
				});
			}
		})
	});
}
Article.insert = function(args) {
	var deferred = Q.defer();

	var query = Utils.template('INSERT INTO $db.Article(name,deleted) VALUES(\'$articleName\',0);',args);
	DAL.query(query,function(err,rows){
		if (err) throw err;
		var query = 'SELECT LAST_INSERT_ID() id;';
		DAL.query(query,function(err,rows){
			if (err) throw err;
			deferred.resolve(rows[0].id);
		});
	});

	return deferred.promise;
};
Article.replace = function(args) {
	var deferred = Q.defer();

	console.log('=ARTICLE REPLACE=');
	var query = Utils.template('REPLACE INTO $db.Article(name,deleted) VALUES(\'$articleName\',0);',args);
	console.log(query);
	DAL.query(query,function(err,rows){
		if (err) throw err;
		var query = 'SELECT LAST_INSERT_ID() id;';
		DAL.query(query,function(err,rows){
			if (err) throw err;
			deferred.resolve(rows[0].id);
		});
	});

	return deferred.promise;
};
Article.update = function(args) {
	var deferred = Q.defer();

	var query = Utils.template("UPDATE $db.Article SET name='$articleName' WHERE id='$articleId'",args);
	DAL.query(query,function(err,rows){
		if (err) throw err;
		deferred.resolve();
	})

	return deferred.promise;
};

module.exports = Article;

})();