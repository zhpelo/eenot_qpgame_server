/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.5.40 : Database - 28game
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`28game` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `28game`;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `downcoinlog` */

/*Table structure for table `matchlog` */

DROP TABLE IF EXISTS `matchlog`;

CREATE TABLE `matchlog` (
  `matchId` int(20) NOT NULL AUTO_INCREMENT,
  `open1` char(4) DEFAULT NULL,
  `open2` char(4) DEFAULT NULL,
  `open3` char(4) DEFAULT NULL,
  `open4` char(4) DEFAULT NULL,
  `open2winbet` int(2) DEFAULT NULL,
  `open3winbet` int(2) DEFAULT NULL,
  `open4winbet` int(2) DEFAULT NULL,
  `serveId` int(3) DEFAULT NULL,
  `adddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`matchId`)
) ENGINE=InnoDB AUTO_INCREMENT=26301 DEFAULT CHARSET=utf8;

/*Data for the table `matchlog` */

insert  into `matchlog`(`matchId`,`open1`,`open2`,`open3`,`open4`,`open2winbet`,`open3winbet`,`open4winbet`,`serveId`,`adddate`) values (26300,'36','56','53','27',-8,-8,8,31,'2017-02-20 09:13:06');

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
