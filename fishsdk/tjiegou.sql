/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.5.40 : Database - fish
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`fish` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `fish`;

/*Table structure for table `daysendprize` */

DROP TABLE IF EXISTS `daysendprize`;

CREATE TABLE `daysendprize` (
  `day` int(2) NOT NULL,
  `winpropid` int(3) DEFAULT NULL,
  `winpropcount` int(10) DEFAULT NULL,
  `wincoin` int(20) DEFAULT NULL,
  PRIMARY KEY (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `fishlog` */

DROP TABLE IF EXISTS `fishlog`;

CREATE TABLE `fishlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(20) DEFAULT NULL,
  `usecoin` int(20) DEFAULT NULL,
  `wincoin` int(20) DEFAULT NULL,
  `balanceTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mark` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2281 DEFAULT CHARSET=utf8;

/*Table structure for table `getcoin` */

DROP TABLE IF EXISTS `getcoin`;

CREATE TABLE `getcoin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(10) NOT NULL,
  `getCoin` int(20) NOT NULL,
  `adddate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mark` tinyint(1) DEFAULT '0',
  `isget` tinyint(1) DEFAULT '0' COMMENT '是否可以领取',
  `day` int(3) DEFAULT '0' COMMENT '第几天',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;

/*Table structure for table `matchrandking` */

DROP TABLE IF EXISTS `matchrandking`;

CREATE TABLE `matchrandking` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `roomType` int(2) DEFAULT '0' COMMENT '房间类型1 1倍房 2 5倍房',
  `matchId` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL,
  `score` int(11) NOT NULL DEFAULT '0',
  `lastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `winPropId` int(3) DEFAULT '0' COMMENT '获得道具ID',
  `winPropCount` int(3) DEFAULT '0' COMMENT '获得道具数量',
  `winScore` int(11) DEFAULT '0' COMMENT '获得金币',
  `rankIdx` int(5) DEFAULT '0' COMMENT '排名',
  `isGetPrize` tinyint(1) NOT NULL DEFAULT '0',
  `isMsg` tinyint(1) DEFAULT '0' COMMENT '是否是邮件',
  `title` char(20) DEFAULT NULL,
  `msg` char(80) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51867 DEFAULT CHARSET=utf8;

/*Table structure for table `sendprize` */

DROP TABLE IF EXISTS `sendprize`;

CREATE TABLE `sendprize` (
  `idx` int(4) NOT NULL AUTO_INCREMENT,
  `propid` int(3) unsigned DEFAULT '0',
  `propcount` int(4) unsigned DEFAULT '0',
  `score` int(11) unsigned DEFAULT '0',
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

/*Table structure for table `shootprize` */

DROP TABLE IF EXISTS `shootprize`;

CREATE TABLE `shootprize` (
  `lv` int(2) NOT NULL AUTO_INCREMENT,
  `value` int(10) DEFAULT '0',
  `propid` int(4) DEFAULT '0' COMMENT '道具id',
  `propcount` int(4) DEFAULT '0' COMMENT '道具count',
  `winsocre` int(10) DEFAULT '0' COMMENT '获得金钱',
  PRIMARY KEY (`lv`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

/*Table structure for table `usecoin` */

DROP TABLE IF EXISTS `usecoin`;

CREATE TABLE `usecoin` (
  `userId` int(10) NOT NULL,
  `useCoin` int(20) DEFAULT '0',
  `getprizelv` int(3) DEFAULT '0',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* Procedure structure for procedure `addFishlog` */

/*!50003 DROP PROCEDURE IF EXISTS  `addFishlog` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `addFishlog`(useridx INT(10),usecoinx INT(10),wincoinx INT(10),bulletActivity bool,everyWinCoinActivity bool)
BEGIN
	DECLARE change_x INT DEFAULT 0;  -- 名次
	INSERT INTO fishlog(userid,usecoin,wincoin) VALUES(useridx,usecoinx,wincoinx);
	if everyWinCoinActivity then
		set @recordcount = 0;
		-- 如果大于30条不再计算
		SELECT COUNT(*) INTO @recordcount FROM getcoin WHERE userId = useridx and day = 30;
		if @recordcount = 0 then
			if wincoinx > 0 then
				SET @getcoin = 0;
				set @isget = 0;
				SELECT getcoin,id,isget INTO @getcoin,@id,@isget FROM getcoin WHERE userId = useridx and adddate > curdate();
				if @isget = 0 then
					IF @getcoin > 0 THEN
						IF @getcoin + wincoinx >= 1000 THEN
							-- 完成
							-- 获得最大天数
							SET @maxday = 0;
							SELECT MAX(DAY) INTO @maxday FROM getcoin WHERE userId = useridx;
							UPDATE getcoin SET getCoin = getCoin + wincoinx,isget = 1,DAY = @maxday + 1 WHERE id = @id;
						else
							-- 未完成
							UPDATE getCoin SET getCoin = getCoin + wincoinx WHERE id = @id;
						END IF;
					ELSE
						IF wincoinx >= 1000 THEN
							-- 完成
							-- 获得最大天数
							SET @maxday = 0;
							SELECT MAX(DAY) INTO @maxday FROM getcoin WHERE userId = useridx;
							INSERT INTO getCoin(userId,getCoin,isget,DAY) VALUES(useridx,wincoinx,1,@maxday+1);
						ELSE
							-- 未完成
							INSERT INTO getCoin(userId,getCoin) VALUES(useridx,wincoinx);
						END IF;
						
						
						-- 获得奖品
						-- select winPropid,winPropCount,winCoin into @winPropidx,@winPropCountx,@winCoin from daysendprize where day = @recordcount + 1;
						
					END IF;
				end if;
			end if;
		end if;
	end if;
	
	IF bulletActivity THEN
		SELECT COUNT(*) INTO @recordcount FROM useCoin WHERE userId = useridx;
		IF @recordcount > 0 THEN
			UPDATE useCoin SET useCoin = useCoin + usecoinx WHERE userId = useridx;
		ELSE
			INSERT INTO useCoin(userId,useCoin) VALUES(useridx,usecoinx);
		END IF;
	
		SELECT getprizelv,useCoin INTO @nowLv,@useCoin FROM useCoin WHERE userId = useridx;
		set @gotoLv = 0;
		SELECT propid,propcount,winsocre,lv INTO @propid,@propcount,@winsocre,@gotoLv FROM shootprize WHERE @useCoin >= VALUE AND lv <= @nowLv + 1 ORDER BY VALUE DESC LIMIT 1;
		
		while @gotoLv > @nowLv do
			set change_x = 1;
			INSERT INTO matchrandking(userId,winPropId,winPropCount,winScore,isMsg) VALUES(useridx,@propid,@propcount,@winsocre,1);
			-- UPDATE useCoin SET getprizelv = getprizelv + 1 WHERE userId = useridx;
			set @gotoLv = 0;
			set @nowLv = @nowLv + 1;
			if @nowLv = 20 then
				SET change_x = 20;
			else
				SELECT propid,propcount,winsocre,lv INTO @propid,@propcount,@winsocre,@gotoLv FROM shootprize WHERE @useCoin >= VALUE AND lv <= @nowLv + 1 ORDER BY VALUE DESC LIMIT 1;
			end if;
		end WHILE;
		if change_x = 1 then
			UPDATE useCoin SET getprizelv = @nowLv WHERE userId = useridx;
		elseif change_x = 20 then
			UPDATE useCoin SET useCoin = useCoin - 210000,getprizelv = 0 WHERE userId = useridx;
		end if;
		
	end if;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `calculateRank` */

/*!50003 DROP PROCEDURE IF EXISTS  `calculateRank` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `calculateRank`(matchIdx VARCHAR(11),roomTypex INT(3))
BEGIN
	DECLARE i INT DEFAULT 0;  -- 名次
	set @id_x = -1;
	while i < 10 do
		SELECT id into @id_x FROM matchRandking WHERE matchId = matchIdx and roomType = roomTypex ORDER BY score DESC,lastTime ASC LIMIT i,1;
		if @id_x > 0 then
			SELECT propid,propcount,score INTO @propid_x,@propcount_x,@score_x FROM sendprize WHERE idx = i + 1;
			UPDATE matchrandking SET winPropId = @propid_x,winPropCount = @propcount_x,winScore = @score_x,rankIdx = i + 1 WHERE id = @id_x;
		end if;
		SET @id_x = -1;
		set i = i + 1;
	end while;
	
    END */$$
DELIMITER ;

/* Procedure structure for procedure `getdayprize` */

/*!50003 DROP PROCEDURE IF EXISTS  `getdayprize` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `getdayprize`(useridx INT(10))
BEGIN
	SELECT MAX(DAY) INTO @day FROM getcoin WHERE userId = useridx;
	SELECT isget INTO @isget FROM getcoin WHERE userId = useridx and ADDDATE > CURDATE();
	if @isget = 0 then
		set @day = @day + 1;
	end if;
	SELECT *,@day AS nowday FROM getcoin WHERE userId = useridx AND ((isget and mark = 0) or ADDDATE > CURDATE());
    END */$$
DELIMITER ;

/* Procedure structure for procedure `getMatchRandKing` */

/*!50003 DROP PROCEDURE IF EXISTS  `getMatchRandKing` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `getMatchRandKing`(matchIdx VARCHAR(11),userIdx VARCHAR(11),roomTypex int(3))
BEGIN
	SELECT * FROM matchRandking WHERE userId = userIdx AND matchId = matchIdx and roomType = roomTypex;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `getnowdaydate` */

/*!50003 DROP PROCEDURE IF EXISTS  `getnowdaydate` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `getnowdaydate`(useridx INT(10))
BEGIN
	SELECT max(day) into @day FROM getcoin WHERE userId = useridx;
	SELECT *,@day + 1 as day FROM getcoin WHERE userId = useridx AND ADDDATE > CURDATE();
    END */$$
DELIMITER ;

/* Procedure structure for procedure `updateMatchRandKing` */

/*!50003 DROP PROCEDURE IF EXISTS  `updateMatchRandKing` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `updateMatchRandKing`(matchIdx VARCHAR(11),userIdx VARCHAR(11),scorex int(11),lastTimex VARCHAR(30),roomTypex Int(3))
BEGIN
	SELECT COUNT(*) INTO @recordcount FROM matchRandking WHERE userId = userIdx AND matchId = matchIdx and roomType = roomTypex;
	IF @recordcount > 0 THEN
		UPDATE matchRandking SET score = scorex,lastTime = lastTimex WHERE userId = userIdx AND matchId = matchIdx AND roomType = roomTypex;
	ELSE
		INSERT INTO matchRandking(matchId,userId,score,lastTime,roomType) VALUES(matchIdx,userIdx,scorex,lastTimex,roomTypex);
	END IF;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `updateProp` */

/*!50003 DROP PROCEDURE IF EXISTS  `updateProp` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `updateProp`(useridx VARCHAR(32),propidx INT(4),propcountx INT(10))
BEGIN
	DECLARE recordcount INT DEFAULT 0;
	DECLARE prop_before_count INT DEFAULT 0;
	DECLARE prop_after_count INT DEFAULT 0;
	SELECT COUNT(*) INTO recordcount FROM gameaccount.prop_item WHERE userid = useridx AND propid = propidx;
	IF recordcount > 0 THEN
		select propcount into prop_before_count from gameaccount.prop_item WHERE userid = useridx AND propid = propidx;
		UPDATE gameaccount.prop_item SET propcount = propcount + propcountx WHERE userid = useridx AND propid = propidx;
		SELECT propcount INTO prop_after_count FROM gameaccount.prop_item WHERE userid = useridx AND propid = propidx;
	ELSE
		INSERT INTO gameaccount.prop_item(userid,propid,propcount) VALUES(useridx,propidx,propcountx);
		SELECT propcount INTO prop_after_count FROM gameaccount.prop_item WHERE userid = useridx AND propid = propidx;
	END IF;
	/* 道具变化记录 */
	INSERT INTO gameaccount.`prop_changelog`(userid,propid,change_before,change_count,change_after,gameid,codeid) VALUES(useridx,propidx,prop_before_count,propcountx,prop_after_count,1,1);
	
    END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
