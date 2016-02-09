(function(){

var mysql = require('mysql');
var config = require('/etc/leviticus.json');

// start the database
var connection = mysql.createConnection({
	host:config.db.host,
	user:config.db.user,
	password:config.db.password
});
connection.connect();

module.exports = connection;

})();