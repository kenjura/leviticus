var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var q = require('q');

var config = require('/etc/leviticus.json');

var Article = require('./model/Article.js');
var Auth = require('./model/Auth.js');
var DAL = require('./model/DAL.js');
var Revision = require('./model/Revision.js');
var Version = require('./model/Version.js');
var Utils = require('./model/Utils.js');


/* ************ EXPRESS *********** */
var app = express();

app.configure(function() {
	// app.use(express.bodyParser());
	app.use(express.json({limit:'5mb'}));
	app.use(function(req,res,next){
	    res.header('Access-Control-Allow-Origin', config.allowedDomains);
	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	    res.header('Access-Control-Allow-Headers', 'Content-Type');
	    res.header('Content-Type', 'application/json');
	    next();
	});
	// app.use(function(err, req, res, next) {	
	// 	response = res;
	// 	next();
	// });
	app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
})

app.enable('trust proxy');



app.get('/', function(req, res){
	console.log(req);
	res.send('Leviticus is online.');
});

// *********************** ARTICLE ***************************
app.get('/:dbname/article',function(req,res) {
	// get article list
	var db = config.dbList[req.params.dbname];
	var promise = req.query.q ? Article.search : Article.listAll;
	promise({db:db,search:req.query},function(rows,fields){
		res.send(JSON.stringify(rows));
	});
});
app.get('/:dbname/article/:name',function(req,res,next) {
	// get specific article
	// optional query string parms:
	//  - draft: if "true", return draft. else return release
	//  - revisionId: if present, return specific revisionId
	//  - version: if present, return latest revision for this version (identified by the "name" field). else, return latest for latest version
	var db = config.dbList[req.params.dbname];
	Article.get({db:db, name:req.params.name, draft:req.query.draft, revisionId:req.query.revisionId, version:req.query.version})
		.then(function(article) {
			res.send(JSON.stringify(article));
		})
		.catch(function(err){
			if (err=='NO_ARTICLE') res.send(200,result('failure','no such article','no such article'));
			else next(err);
		});
});
app.post('/:dbname/article',function(req,res,next) {
	// update or insert an article
	// mandatory body params:
	//  - articleName, body
	// optional body params:
	//  - datetime (mysql default), version (default: latest), tag, draft (default false)
	// forbidden body params:
	//  - userId (determined by authToken)

	// validation
	Utils.validate(req.body,'authToken,body','userId');
	if ( !req.body.articleId && !req.body.articleName ) throw new Error('Missing required input: either articleId or articleName');

	// main login
	var db = config.dbList[req.params.dbname];
	Article.post(_.extend(req.body,{db:db}))
		.then(function(result){
			res.send(result);
		})
		.catch(function(result){
			next(result);
		});
});
app.get('/:dbname/article/:name/revisions',function(req,res) {
	// get list of all revisions for a given articleId
	var db = config.dbList[req.params.dbname];
	Article.listRevisions( {db:db, articleName:req.params.name}, function(revisions) {
		res.send(JSON.stringify(revisions));
	});
});

// *********************** VERSION ***************************
app.get('/:dbname/version',function(req,res) {
	// get version list
	var db = config.dbList[req.params.dbname];
	Version.listAll({db:db},function(rows,fields){
		res.send(JSON.stringify(rows));
	});
});
app.get('/:dbname/version/latest',function(req,res) {
	var db = config.dbList[req.params.dbname];
	// console.log(req.query);
	Version.getLatest({ db:db, which:_.isUndefined(req.query.dev)?'prod':'dev'}).then(function(version){
		res.send(JSON.stringify(version));
	});
});
app.post('/:dbname/version/:versionId/promote',function(req,res,next){
	var db = config.dbList[req.params.dbname];
	var args = {
		db:db,
		versionId:req.params.versionId,
		authToken:req.body.authToken
	};
	Utils.validate(args,'db,versionId,authToken');
	Version.promote(args)
		.then(function(){ res.send(result('success')) })
		.catch(function(err){ res.send(500,result('failure',err)) });
});
app.post('/:dbname/version/:versionId/release',function(req,res,next){
	var db = config.dbList[req.params.dbname];
	var args = {
		db:db,
		versionId:req.params.versionId,
		authToken:req.body.authToken,
		isRelease:req.body.isRelease
	};
	Utils.validate(args,'db,versionId,authToken');
	Version.release(args)
		.then(function(){ res.send(result('success')) })
		.catch(function(err){ res.send(500,result('failure',err)) });
});

// *********************** LOGIN/AUTH ***************************
app.get('/:dbname/user/:authToken',function(req,res,next) {
	// Utils.validate(req.params,['authToken']);
	var db = config.dbList[req.params.dbname];
	var args = {
		db:db,
		authToken:req.params.authToken
	};
	console.log('done');
	Auth.getUser(args)
		.then(function(user){
			console.log(user);
			res.send(JSON.stringify(user));
		})
		.catch(function(err){
			if (err.message && err.message=='No user found.') {
				res.send(401,JSON.stringify({result:'failure',reason:'unauthorized',message:'no matching authToken'}));
			}
			else next(err)
		});
});
app.post('/:dbname/login',function(req,res,next) {
	var obj = {
		username: req.body.username,
		password: req.body.password,
		db: config.dbList[req.params.dbname]
	};
	Auth.login(obj,function(authToken){
		res.cookie('authToken',authToken,{domain:'.bertball.com',expires:new Date(Date.now()+86400*1000*30)});
		res.send(JSON.stringify(authToken));
	});
});
app.post('/:dbname/changePassword',function(req,res,next) {
	var obj = {
		username: req.body.username,
		oldPassword: req.body.oldPassword,
		newPassword: req.body.newPassword,
		db: config.dbList[req.params.dbname]
	};
	Auth.changePassword(obj)
		.then(function(){ res.send('SUCCESS') })
		.catch(function(err){ 
			if (err=='NO_USER') res.send(401,result('failure','no user found','no user found'));
			else next(err)
		});
});
/***** etc ****/
app.get('/:dbname/updates',function(req,res,next){
	var obj = { 
		db: config.dbList[req.params.dbname],
		offset: req.query.offset,
		rowsPerPage: req.query.rowsPerPage
	};
	Revision.getUpdates(obj)
		.then(function(data){ res.send(200,JSON.stringify(data)) })
		.catch(function(err){ next(err) });
});
app.post('/:dbname/upload',function(req,res,next){
	console.log('upload > begin. obj to follow');
	var obj = {
		db: config.dbList[req.params.dbname],
		name: req.body.name,
		fileName: req.body.fileName,
		path: 'img/uploaded/'+req.body.fileName
	}
	console.log(obj);
	if (!obj.name||!obj.fileName) return res.send(400,'Missing parameters');
	var root = config.uploadFolder+req.params.dbname+'/img/uploaded/';
	console.log('root = ',root);
	var f = root+obj.fileName;
	if (root==f) return res.send(400,'Invalid fileName');

	var base64Data = req.body.file.replace(/^data:image\/(png|jpeg);base64,/,'');
	fs.writeFile(path.resolve(f), base64Data, 'base64', function(err) {
		if (err) {
			console.log('ERROR IN UPLOAD!!!!',err);
			return res.send(500,err);
		}
		// else res.send(200,result('success'));

		var query = Utils.template("REPLACE INTO $db.Image(name,path) VALUES ('$name','$path');",obj);
		console.log(query);
		DAL.query(query,function(err,rows){
			if (err) { console.log('UNTRACKED UPLOAD ERROR'); next(err); }
			else res.send(200,JSON.stringify({result:'success'}));
		});
	});
});

app.listen(3000);


function result(result,reason,message) {
	return JSON.stringify({
		result:result||'unknown',
		reason:reason||'unknown reason',
		message:message||'there was an error'
	});
}







