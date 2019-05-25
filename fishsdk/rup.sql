/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.5.40 : Database - redbag
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`redbag` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `redbag`;

/*Table structure for table `bagbyidlog` */

DROP TABLE IF EXISTS `bagbyidlog`;

CREATE TABLE `bagbyidlog` (
  `bagId` bigint(30) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `nickname` char(40) DEFAULT NULL,
  `getscore` int(20) DEFAULT NULL,
  `winCoin` int(19) DEFAULT NULL,
  `addTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `bagbyidlog` */

/*Table structure for table `baglog` */

DROP TABLE IF EXISTS `baglog`;

CREATE TABLE `baglog` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `redbagId` bigint(20) DEFAULT NULL,
  `sendId` int(11) DEFAULT NULL,
  `coin` int(20) DEFAULT NULL,
  `boom` int(1) DEFAULT NULL,
  `tax` int(19) DEFAULT NULL,
  `count` int(3) DEFAULT NULL,
  `serveId` int(3) DEFAULT NULL,
  `earnings` int(19) DEFAULT '0',
  `addTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9890 DEFAULT CHARSET=utf8mb4;

/*Data for the table `baglog` */

/*Table structure for table `pool` */

DROP TABLE IF EXISTS `pool`;

CREATE TABLE `pool` (
  `serverId` int(3) NOT NULL,
  `pool` int(10) DEFAULT '0',
  PRIMARY KEY (`serverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `pool` */

/* Procedure structure for procedure `checkRedBag` */

/*!50003 DROP PROCEDURE IF EXISTS  `checkRedBag` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `checkRedBag`(redBagIdx int(30), serveIdx int(4))
BEGIN
	set @id = 0;
	set @sendId = 0;
	set @coin = 0;
	set @boom = 0;
	set @earnings = 0;
	SET @nickname = "";
	SET @url = "";
	select id,sendId,coin,boom,earnings into @id,@sendId,@coin,@boom,@earnings from baglog where serveId = serveId and redbagId = redBagIdx;
	if @id then
		-- select gameaccount.`newuseraccounts`.`nickname`,gameaccount.`newuseraccounts`.`headimgurl` into @nickname,@url from gameaccount.`newuseraccounts` where Id = @sendId;
		-- select *,1 AS rcode from bagbyidlog where bagId = @id;
		set @rcount = 0;
		select count(*) into @rcount FROM bagbyidlog WHERE bagId = @id;
		if @rcount then
			select *,1 as rcode,@sendId as sendId,@coin as sendBagCoin,@boom as boomNum,@earnings as earnings,@nickname as nickname,@url as headimgurl from bagbyidlog where bagId = @id;
		else
			SELECT 2 AS rcode,@sendId AS sendId,@coin AS sendBagCoin,@boom AS boomNum,@earnings AS earnings,@nickname AS nickname,@url AS headimgurl;
		end if;
	else
		select 0 as rcode;
	end if;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `getPool` */

/*!50003 DROP PROCEDURE IF EXISTS  `getPool` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `getPool`(serverIdx int(3))
BEGIN
	select count(*) into @rcode from pool where serverId = serverIdx;
	if @rcode then
		SELECT pool FROM pool WHERE serverId = serverIdx;
	else
		INSERT INTO pool(serverId) VALUE(serverIdx);
		SELECT 0 as pool;
	end if;
    END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
