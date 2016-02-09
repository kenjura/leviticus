# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.7.10)
# Database: narrwiki_faerun
# Generation Time: 2016-02-09 23:45:01 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table article
# ------------------------------------------------------------

DROP TABLE IF EXISTS `article`;

CREATE TABLE `article` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `revisionId` int(11) DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



# Dump of table datatable
# ------------------------------------------------------------

DROP TABLE IF EXISTS `datatable`;

CREATE TABLE `datatable` (
  `name` varchar(50) NOT NULL,
  `datatypes` varchar(50) NOT NULL,
  `fields` varchar(2000) DEFAULT NULL,
  `hiddenFields` varchar(2000) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



# Dump of table image
# ------------------------------------------------------------

DROP TABLE IF EXISTS `image`;

CREATE TABLE `image` (
  `name` varchar(80) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `path` varchar(100) NOT NULL,
  `filename` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



# Dump of table revision
# ------------------------------------------------------------

DROP TABLE IF EXISTS `revision`;

CREATE TABLE `revision` (
  `articleId` int(11) NOT NULL,
  `articleName` varchar(200) NOT NULL DEFAULT '',
  `revisionId` int(11) NOT NULL AUTO_INCREMENT,
  `body` mediumtext,
  `datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` varchar(100) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `draft` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`articleId`,`revisionId`),
  FULLTEXT KEY `articleName` (`articleName`,`body`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table session
# ------------------------------------------------------------

DROP TABLE IF EXISTS `session`;

CREATE TABLE `session` (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `userId` int(2) NOT NULL,
  `created` datetime NOT NULL,
  `expires` datetime NOT NULL,
  `authToken` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `fullName` varchar(500) DEFAULT NULL,
  `registrationDate` datetime NOT NULL,
  `pass` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



# Dump of table version
# ------------------------------------------------------------

DROP TABLE IF EXISTS `version`;

CREATE TABLE `version` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rank` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `shortDescription` text,
  `longDescription` text,
  `dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateLaunched` timestamp NULL DEFAULT NULL,
  `isRelease` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
