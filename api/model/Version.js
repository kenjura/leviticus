(function(){

var Auth = require('./Auth.js');
var DAL = require('./DAL.js');
var Utils = require('./Utils.js');

var Q = require('q');
var Promise = require('promise');

var Version = {};
Version.fields = 'id,rank,name,shortDescription,longDescription,dateCreated,dateLaunched,isRelease';
Version.listAll = function(args,callback) {
	DAL.query('SELECT '+Version.fields+' FROM '+args.db+'.version ORDER BY rank DESC',function(err,rows,fields) {
		if (err) throw err;
		callback(rows,fields);
	});
}
Version.getLatest = function(args,callback) {
	return new Promise(function(resolve,reject){
		console.log('Version.getLatest > begin.');

		var bit = args.which == 'dev' ? 0 : 1;
		var query = 'SELECT '+Version.fields+' FROM '+args.db+'.version WHERE isRelease='+bit+' ORDER BY rank DESC LIMIT 1';
		console.log(query);
		DAL.query(query,function(err,rows,fields) {
			console.log('Version.getLatest > query returned.');
			if (err) reject(err);
			// callback(rows[0],fields);
			resolve(rows[0]);
		});
	});
}
Version.promote = function(args){
	return new Promise(function(resolve,reject){
		Auth.isLoggedIn(args,function(result){
			if (!result) return reject('NOAUTH');
			var query = Utils.template("SELECT max(rank)+1 as 'newRank' fROM $db.Version",args);
			DAL.query(query,function(err,rows){
				if (err) return reject(err);
				var newRank = rows[0].newRank;
				var query = Utils.template("UPDATE $db.Version SET rank = "+newRank+" WHERE id='$versionId';",args);
				console.log(query);
				DAL.query(query,function(err,result){
					if (err) return reject(err);
					if (!result.affectedRows) return reject('UNKNOWN');
					resolve();
				})
			});
		})
	});
}
Version.release = function(args) {
	return new Promise(function(resolve,reject){
		Auth.isLoggedIn(args,function(result){
			if (!result) return reject('NOAUTH');
			console.log(args);
			if (!args.hasOwnProperty('isRelease')) args.isRelease = 1;
			var query = Utils.template("UPDATE $db.Version SET isRelease='$isRelease' WHERE id='$versionId';",args);
			console.log(query);
			DAL.query(query,function(err,result){
				if (err) return reject(err);
				if (!result.affectedRows) return reject('UNKNOWN');
				resolve();
			})
		})
	});
}

module.exports = Version;

})();