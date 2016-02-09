<?php
error_reporting(E_ERROR | E_WARNING | E_PARSE);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: authToken, content-type, database");
header('Content-Type: text/html; charset=utf-8');

// get directive and id
$pattern = '/(?<database>[^\/?&]+)\/(?<directive>[^\/?&]+)(?:\/(?<id>[^\/?&]+))?(\?(?<query>.+))?/';
preg_match_all( $pattern, $_SERVER['QUERY_STRING'], $matches);
$database = $matches['database'][0];
$directive = $matches['directive'][0];
$id = $matches['id'][0];
// $query = $matches['query'][0];

// debug
// echo('<p>directive='.$directive.'</p>');
// echo('<p>id='.$id.'</p>');
// echo('<p>query='.$query.'</p>');

// connect to database
$db_host = 'localhost';
mysql_connect($db_host,'wikiuser','wikiuser') or die ("Nope, can't connect.");
@mysql_select_db($database) or die( "Unable to select database");

die('succes');


?>