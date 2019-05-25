/*
SQLyog Ultimate v11.11 (64 bit)
MySQL - 5.6.27 : Database - qiang_cow
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`qiang_cow` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `qiang_cow`;

/*Table structure for table `downcoinlog` */

DROP TABLE IF EXISTS `downcoinlog`;

CREATE TABLE `downcoinlog` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `MatchId` int(20) DEFAULT '0' COMMENT '场次ID',
  `callBet` int(11) NOT NULL DEFAULT '0',
  `selectBet` int(11) NOT NULL DEFAULT '0',
  `severBet` int(11) DEFAULT NULL,
  `winCoin` int(11) DEFAULT NULL,
  `tax` int(9) DEFAULT NULL,
  `isBanker` tinyint(1) NOT NULL DEFAULT '0',
  `serverId` int(3) NOT NULL DEFAULT '1',
  `tableid` int(3) NOT NULL DEFAULT '0',
  `Adddate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mark` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;

/*Data for the table `downcoinlog` */

insert  into `downcoinlog`(`id`,`userId`,`MatchId`,`callBet`,`selectBet`,`severBet`,`winCoin`,`tax`,`isBanker`,`serverId`,`tableid`,`Adddate`,`mark`) values (11,2,13,1,5,100,-1000,0,0,1,0,'2017-05-14 18:20:13',0),(12,1,13,1,0,100,995,5,1,1,0,'2017-05-14 18:20:13',0),(13,1,13,1,5,100,995,5,0,1,0,'2017-05-14 18:21:00',0),(14,2,13,1,0,100,-1000,0,1,1,0,'2017-05-14 18:21:00',0),(15,2,13,1,5,100,995,5,0,1,0,'2017-05-14 18:21:47',0),(16,1,13,1,0,100,-1000,0,1,1,0,'2017-05-14 18:21:47',0),(17,1,13,1,5,100,-500,0,0,1,0,'2017-05-14 18:22:34',0),(18,2,13,1,5,100,-500,0,0,1,0,'2017-05-14 18:22:34',0),(19,577,13,1,0,100,994,6,1,1,0,'2017-05-14 18:22:34',0),(20,1,13,1,5,100,995,5,0,1,0,'2017-05-14 18:23:21',0),(21,577,13,1,5,100,1492,8,0,1,0,'2017-05-14 18:23:21',0),(22,2,13,1,0,100,-2500,0,1,1,0,'2017-05-14 18:23:21',0),(23,1,13,1,5,100,-500,0,0,1,0,'2017-05-14 18:24:08',0),(24,2,13,1,5,100,-500,0,0,1,0,'2017-05-14 18:24:08',0),(25,577,13,1,0,100,994,6,1,1,0,'2017-05-14 18:24:08',0),(26,1,13,1,5,100,-500,0,0,1,0,'2017-05-14 18:24:55',0),(27,2,13,1,5,100,-500,0,0,1,0,'2017-05-14 18:24:55',0),(28,577,13,1,0,100,994,6,1,1,0,'2017-05-14 18:24:55',0);

/*Table structure for table `matchlog` */

DROP TABLE IF EXISTS `matchlog`;

CREATE TABLE `matchlog` (
  `matchId` int(20) NOT NULL AUTO_INCREMENT,
  `open11` char(2) DEFAULT NULL,
  `open12` char(2) DEFAULT NULL,
  `open13` char(2) DEFAULT NULL,
  `open14` char(2) DEFAULT NULL,
  `open15` char(2) DEFAULT NULL,
  `open21` char(2) DEFAULT NULL,
  `open22` char(2) DEFAULT NULL,
  `open23` char(2) DEFAULT NULL,
  `open24` char(2) DEFAULT NULL,
  `open25` char(2) DEFAULT NULL,
  `open31` char(2) DEFAULT NULL,
  `open32` char(2) DEFAULT NULL,
  `open33` char(2) DEFAULT NULL,
  `open34` char(2) DEFAULT NULL,
  `open35` char(2) DEFAULT NULL,
  `open41` char(2) DEFAULT NULL,
  `open42` char(2) DEFAULT NULL,
  `open43` char(2) DEFAULT NULL,
  `open44` char(2) DEFAULT NULL,
  `open45` char(2) DEFAULT NULL,
  `open51` char(2) DEFAULT NULL,
  `open52` char(2) DEFAULT NULL,
  `open53` char(2) DEFAULT NULL,
  `open54` char(2) DEFAULT NULL,
  `open55` char(2) DEFAULT NULL,
  `open1winbet` int(2) DEFAULT NULL,
  `open2winbet` int(2) DEFAULT NULL,
  `open3winbet` int(2) DEFAULT NULL,
  `open4winbet` int(2) DEFAULT NULL,
  `open5winbet` int(2) DEFAULT NULL,
  `tableId` int(2) DEFAULT NULL,
  `serveId` int(3) DEFAULT NULL,
  `adddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`matchId`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

/*Data for the table `matchlog` */

insert  into `matchlog`(`matchId`,`open11`,`open12`,`open13`,`open14`,`open15`,`open21`,`open22`,`open23`,`open24`,`open25`,`open31`,`open32`,`open33`,`open34`,`open35`,`open41`,`open42`,`open43`,`open44`,`open45`,`open51`,`open52`,`open53`,`open54`,`open55`,`open1winbet`,`open2winbet`,`open3winbet`,`open4winbet`,`open5winbet`,`tableId`,`serveId`,`adddate`) values (1,'36','12','44','5','33','50','3','17','45','10','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',2,0,0,0,0,0,4201,'2017-05-14 16:31:30'),(2,'24','14','3','15','4','8','21','30','19','12','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',-1,0,0,0,0,0,4201,'2017-05-14 16:32:17'),(3,'51','46','27','5','7','32','14','2','35','30','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',0,-1,0,0,0,0,4201,'2017-05-14 16:33:04'),(4,'28','29','44','11','37','39','19','30','5','43','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',0,-3,0,0,0,0,1,'2017-05-14 18:03:27'),(5,'9','35','40','14','49','26','43','51','3','28','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',3,0,0,0,0,0,1,'2017-05-14 18:04:14'),(6,'12','23','24','35','42','26','25','27','7','51','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',-2,0,0,0,0,0,1,'2017-05-14 18:05:01'),(7,'20','9','8','30','33','40','5','45','27','22','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',0,-1,0,0,0,0,1,'2017-05-14 18:06:55'),(8,'26','3','31','7','41','22','2','23','37','1','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',2,0,0,0,0,0,1,'2017-05-14 18:08:40'),(9,'46','7','10','21','30','15','23','43','31','8','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',-2,0,0,0,0,0,1,'2017-05-14 18:09:27'),(10,'30','27','11','47','48','35','8','21','25','6','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',1,0,0,0,0,0,1,'2017-05-14 18:10:14'),(11,'8','18','29','21','12','14','2','26','31','17','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',-1,0,0,0,0,0,1,'2017-05-14 18:11:01'),(12,'9','23','4','41','15','46','30','38','47','28','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',-1,0,0,0,0,0,1,'2017-05-14 18:18:05'),(13,'47','24','25','37','12','26','14','48','30','27','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',0,-2,0,0,0,0,1,'2017-05-14 18:20:13'),(14,'12','4','45','27','33','29','38','42','49','35','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',2,0,0,0,0,0,1,'2017-05-14 18:21:00'),(15,'6','42','40','28','50','14','7','41','2','33','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',0,2,0,0,0,0,1,'2017-05-14 18:21:47'),(16,'52','43','29','34','5','46','21','48','12','23','44','31','38','30','47','0','0','0','0','0','0','0','0','0','0',-1,-1,0,0,0,0,1,'2017-05-14 18:22:34'),(17,'9','15','48','14','32','22','24','23','49','4','16','3','44','31','17','0','0','0','0','0','0','0','0','0','0',2,0,3,0,0,0,1,'2017-05-14 18:23:21'),(18,'52','4','31','23','18','15','32','46','16','5','27','33','28','37','6','0','0','0','0','0','0','0','0','0','0',-1,-1,0,0,0,0,1,'2017-05-14 18:24:08'),(19,'6','4','33','21','3','14','1','19','17','26','35','37','44','23','38','0','0','0','0','0','0','0','0','0','0',-1,-1,0,0,0,0,1,'2017-05-14 18:24:55');

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
