/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.5.40 : Database - cow
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`cow` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `cow`;

/*Table structure for table `downcoinlog` */

DROP TABLE IF EXISTS `downcoinlog`;

CREATE TABLE `downcoinlog` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `MatchId` int(20) DEFAULT '0' COMMENT '场次ID',
  `downCoin` int(11) NOT NULL DEFAULT '0',
  `winCoin` int(11) NOT NULL DEFAULT '0',
  `open2` int(11) DEFAULT NULL,
  `open3` int(11) DEFAULT NULL,
  `open4` int(11) DEFAULT NULL,
  `tax` int(9) DEFAULT NULL,
  `isBanker` tinyint(1) NOT NULL DEFAULT '0',
  `serverId` int(3) NOT NULL DEFAULT '1',
  `tableid` int(3) NOT NULL DEFAULT '0',
  `Adddate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mark` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14350 DEFAULT CHARSET=utf8;

/*Data for the table `downcoinlog` */

/*Table structure for table `matchlog` */

DROP TABLE IF EXISTS `matchlog`;

CREATE TABLE `matchlog` (
  `matchId` int(20) NOT NULL AUTO_INCREMENT,
  `open11` char(4) DEFAULT NULL,
  `open12` char(4) DEFAULT NULL,
  `open13` char(4) DEFAULT NULL,
  `open14` char(4) DEFAULT NULL,
  `open15` char(4) DEFAULT NULL,
  `open21` char(4) DEFAULT NULL,
  `open22` char(4) DEFAULT NULL,
  `open23` char(4) DEFAULT NULL,
  `open24` char(4) DEFAULT NULL,
  `open25` char(4) DEFAULT NULL,
  `open31` char(4) DEFAULT NULL,
  `open32` char(4) DEFAULT NULL,
  `open33` char(4) DEFAULT NULL,
  `open34` char(4) DEFAULT NULL,
  `open35` char(4) DEFAULT NULL,
  `open41` char(4) DEFAULT NULL,
  `open42` char(4) DEFAULT NULL,
  `open43` char(4) DEFAULT NULL,
  `open44` char(4) DEFAULT NULL,
  `open45` char(4) DEFAULT NULL,
  `open2winbet` int(2) DEFAULT NULL,
  `open3winbet` int(2) DEFAULT NULL,
  `open4winbet` int(2) DEFAULT NULL,
  `serveId` int(3) DEFAULT NULL,
  `adddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`matchId`)
) ENGINE=InnoDB AUTO_INCREMENT=68714 DEFAULT CHARSET=utf8;

/*Data for the table `matchlog` */

insert  into `matchlog`(`matchId`,`open11`,`open12`,`open13`,`open14`,`open15`,`open21`,`open22`,`open23`,`open24`,`open25`,`open31`,`open32`,`open33`,`open34`,`open35`,`open41`,`open42`,`open43`,`open44`,`open45`,`open2winbet`,`open3winbet`,`open4winbet`,`serveId`,`adddate`) values (68713,'27','14','8','16','31','1','2','46','21','50','29','33','36','17','5','43','6','25','35','22',2,3,2,101,'2017-03-28 17:38:30');

/* Procedure structure for procedure `addMatch` */

/*!50003 DROP PROCEDURE IF EXISTS  `addMatch` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `addMatch`(open1x VARCHAR(4),open2x VARCHAR(4),open3x VARCHAR(4),open4x VARCHAR(4),open2winbetx int(2),open3winbetx INT(2),open4winbetx INT(2),serveridx INT(3))
BEGIN
	INSERT INTO matchlog(open1,open2,open3,open4,open2winbet,open3winbet,open4winbet,serveId) VALUES(open1x,open2x,open3x,open4x,open2winbetx,open3winbetx,open4winbetx,serveridx);
    END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
