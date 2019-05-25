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

/*Table structure for table `lv` */

DROP TABLE IF EXISTS `lv`;

CREATE TABLE `lv` (
  `lv` int(3) NOT NULL,
  `wincoinvalue` int(20) DEFAULT NULL,
  PRIMARY KEY (`lv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `lv` */

insert  into `lv`(`lv`,`wincoinvalue`) values (0,0),(1,36000),(2,108000),(3,252000),(4,468000),(5,756000),(6,1584000),(7,2304000),(8,3264000),(9,4704000),(10,7104000),(11,13680000),(12,19680000),(13,31680000),(14,49680000),(15,79680000),(16,167616000),(17,311616000),(18,527616000),(19,887616000),(20,1607616000);

/* Procedure structure for procedure `addFishlog` */

/*!50003 DROP PROCEDURE IF EXISTS  `addFishlog` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `addFishlog`(useridx INT(10),usecoinx INT(10),wincoinx INT(10),bulletActivity bool,everyWinCoinActivity bool,lvActivity BOOL)
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
					-- 获得最大天数
					SET @maxday = 0;
					SELECT MAX(DAY) INTO @maxday FROM getcoin WHERE userId = useridx;
					IF ISNULL(@maxday)THEN
						SET @maxday = 0;
					END IF;
					-- 获得下一天所需要的金额
					set @getValue = 50000;
					select value into @getValue from daysendprizeValue where day = @maxday + 1;
					IF @getcoin > 0 THEN
						IF @getcoin + wincoinx >= @getValue THEN
							-- 完成
							UPDATE getcoin SET getCoin = getCoin + wincoinx,isget = 1,DAY = @maxday + 1 WHERE id = @id;
						else
							-- 未完成
							UPDATE getCoin SET getCoin = getCoin + wincoinx WHERE id = @id;
						END IF;
					ELSE
						IF wincoinx >= @getValue THEN
							-- 完成
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
	
	IF lvActivity THEN
		-- 获得原来有多少
		set @s_wincoin = null;
		SELECT wincoin,lv INTO @s_wincoin,@nowLv FROM wincoin WHERE userId = useridx;
		if isnull(@s_wincoin) then
			set @wincoin = 0;
		else
			SET @wincoin = @s_wincoin;
		end if;
		SELECT lv into @lv FROM lv WHERE wincoinvalue <= wincoinx + @wincoin ORDER BY wincoinvalue DESC LIMIT 1;
		IF ISNULL(@s_wincoin) THEN
			INSERT INTO wincoin(userId,wincoin,lv) VALUES(useridx,wincoinx + @wincoin,@lv);
		ELSE
			if @nowLv < @lv then
				UPDATE wincoin SET wincoin = @wincoin + wincoinx,lv = @lv WHERE userId = useridx;
			end if;
		END IF;
	END IF;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `calculateRank` */

/*!50003 DROP PROCEDURE IF EXISTS  `calculateRank` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `calculateRank`(matchIdx VARCHAR(11),roomTypex INT(3))
BEGIN
	DECLARE i INT DEFAULT 0;  -- 名次
	set @id_x = -1;
	while i < 6 do
		SELECT id,userId,rankIdx into @id_x,@userId,@rankIdx FROM matchRandking WHERE matchId = matchIdx and roomType = roomTypex ORDER BY score DESC,lastTime ASC LIMIT i,1;
		if @rankIdx <= 0 then
			if @id_x > 0 then
				SELECT propid,propcount,score INTO @propid_x,@propcount_x,@score_x FROM sendprize WHERE idx = i + 1;
				UPDATE matchrandking SET winPropId = @propid_x,winPropCount = @propcount_x,winScore = @score_x,rankIdx = i + 1 WHERE id = @id_x;
				INSERT INTO gameaccount.msg(userId,winPropId,winPropCount,winScore,matchlogId,type) VALUES(@userId,@propid_x,@propcount_x,@score_x,@id_x,0);
			end if;
			SET @id_x = -1;
			set i = i + 1;
		else
			/*退出*/
			SET i = 100;
		end if;
	end while;
	
    END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
