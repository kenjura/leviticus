(function(){

var DAL = require('./DAL.js');
var Utils = require('./Utils.js');
var Version = require('./Version.js');

var Promise = require('promise');

var Revision = {};
Revision.insert = function(args) {
	return new Promise(function(resolve,reject){
		console.log('Revision.insert > begin.');
		var query = Utils.template("INSERT INTO $db.Revision(articleId,articleName,body,version,userId,draft) VALUES('$articleId','$articleName','$body','$version','$userId','$draft')",args);
		console.log(query);
		DAL.query(query,function(err,result){
			if (err) reject(err);
			resolve(result.insertId);
		});
	});
};
Revision.replace = function(args) {
	return new Promise(function(resolve,reject){
		console.log('Revision.replace > begin.');
		var query = Utils.template("REPLACE INTO $db.Revision(articleId,articleName,revisionId,body,version,userId,draft) VALUES('$articleId','$articleName','$revisionId','$body','$version','$userId','$draft')",args);
		console.log(query);
		DAL.query(query,function(err,rows){
			if (err) reject(err);
			else resolve();
		});
	});
};
Revision.update = function(args) {
	return new Promise(function(resolve,reject){
		var query = Utils.template("UPDATE $db.Revision SET articleName='$articleName', body='$body', version='$version', userId='$userId', draft='$draft' WHERE articleId='$articleId' AND revisionId='$revisionId';",args);
		console.log(query);
		DAL.query(query,function(err,rows){
			if (err) reject(err);
			resolve();
		});
	});
}
Revision.saveDraft = function(args) {
	return new Promise(function(resolve,reject){
		console.log('Revision.saveDraft > begin.');
		var query = Utils.template("SELECT revisionId FROM $db.Revision WHERE articleId='$articleId' AND version='$version' AND draft=1",args);
		console.log(query);
		DAL.query(query,function(err,rows){
			if (err) reject(err);
			if (rows[0]) {
				console.log('Revision.saveDraft > found an existing revision with id '+rows[0].revisionId);
				args.revisionId = rows[0].revisionId;
				Revision.update(args).then(resolve).catch(reject);
			} else {
				console.log('Revision.saveDraft > no existing revision found. Will create one.');
				Revision.insert(args).then(function(revisionId){ args.revisionId = revisionId; resolve(args) }).catch(reject);
			}
		});
	});
};
Revision.getUpdates = function(args) {
	return new Promise(function(resolve,reject){
		if (!args.offset) args.offset = 0;
		if (!args.rowsPerPage) args.rowsPerPage = 50;
		var query = " " +
			"select articleId, articleName, max(revisionId) 'revisionId', max(datetime) 'datetime', u.name 'userName'" +
			"from $db.revision r " +
			"left join $db.user u on u.id = r.userId " + 
			"where draft=0 " +
			"group by articleName " +
			"order by datetime desc " +
			"limit $offset, $rowsPerPage;";
		query = Utils.template(query,args);
		DAL.query(query,function(err,rows){
			if (err) reject(err);
			resolve(rows);
		});
	});
}

module.exports = Revision;

})();