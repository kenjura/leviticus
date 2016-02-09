(function(){

var Promise = require('promise');
var sha1 = require('sha1');
var _ = require('underscore');

var DAL = require('./DAL.js');
var Utils = require('./Utils.js');

var Auth = {};
Auth.generateAuthToken = function() {
	return Utils.guid();
}
Auth.changePassword = function(args) {
	return new Promise(function(resolve,reject){
		args.oldPassword = sha1(args.oldPassword);
		args.newPassword = sha1(args.newPassword);
		var query = Utils.template("UPDATE $db.User SET pass='$newPassword' WHERE name='$username' AND pass='$password';",args);
		DAL.query(query,function(err,rows){
			console.log('rows',rows);
			if (err) reject(err);
			if (rows.changedRows < 1) reject('NO_USER');
			resolve('Success.')
		});
	});
}
Auth.isLoggedIn = function(args,callback) {
	var query = Utils.template("SELECT * FROM $db.Session WHERE authToken = '$authToken' AND curdate() < expires",args);
	DAL.query(query,function(err,rows){
		if (err) throw err;
		if (!rows||rows.length<1) callback(false);
		else callback(true)
	});
};
Auth.login = function(args,callback) {

	// to do: add sg7s loophole

	args.password = sha1(args.password);
	var query = Utils.template("SELECT * FROM $db.User WHERE name='$username' AND pass='$password';",args);
	console.log(query);
	DAL.query(query,function(err,rows){
		if (err) throw err;
		if (!rows||rows.length<1) throw new Error('Authentication failure.');

		var obj = _.extend(rows[0],{
			authToken: Auth.generateAuthToken(),
			db: args.db
		});
		var query = Utils.template("INSERT INTO $db.Session(userId,created,expires,authToken) VALUES('$id',CURDATE(),date_add(CURDATE(), INTERVAL 30 DAY),'$authToken');",obj);
		console.log(query);
		DAL.query(query,function(err,rows){
			if (err) throw err;
			if (!rows) throw new Error('Authentication error of the second variety');
			callback(obj);
		});
	});
};
Auth.getUser = function(args) {
	// gets a user object, given an authToken
	console.log('Auth.getUser > begin.');
	console.log(args);
	
	return new Promise(function(resolve,reject){

		if (!args.authToken) { reject(new Error('Error: no authToken supplied')); };

		console.log('Auth.getUser > validation passed.');
		try { var query = Utils.template("SELECT u.id, u.name, u.fullName, s.expires FROM $db.Session s LEFT JOIN $db.User u ON u.id = s.userId WHERE s.authToken = '$authToken' AND curdate() < expires",args); }
		catch(e) { console.log(e) }
		console.log(query);

		DAL.query(query,function(err,rows){ 
			if (err) reject(err);
			if (!rows || rows.length < 1) reject(new Error('No user found.'));
			console.log('Auth.getUser > done. returning promise.');
			resolve(rows[0]);
		});
	});

};

module.exports = Auth;

})();