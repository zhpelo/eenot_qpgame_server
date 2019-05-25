/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.5.40 : Database - gameaccount
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`gameaccount` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `gameaccount`;

/*Table structure for table `tempaddscore` */

DROP TABLE IF EXISTS `tempaddscore`;

CREATE TABLE `tempaddscore` (
  `userId` int(11) NOT NULL,
  `score` int(20) NOT NULL DEFAULT '0',
  `change_type` int(3) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `tempaddscore` */

insert  into `tempaddscore`(`userId`,`score`,`change_type`) values (2,10,3);

/* Procedure structure for procedure `dongshanzaiqi` */

/*!50003 DROP PROCEDURE IF EXISTS  `dongshanzaiqi` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `dongshanzaiqi`(userIdx int(11),dongshanzaiqi_flag bool)
BEGIN
	SET @scorex = -1;
	SET @dtimex = "";
	SET @k = 0;
	SET @maxcount = 2;
	
	if dongshanzaiqi_flag then
		SET @zaixian = (SELECT COUNT(*) FROM lineout WHERE userId = userIdx);
		IF @zaixian = 0 THEN
			/*满足东山再起的条件*/
			SELECT dtime,dcount INTO @dtimex,@dcountx FROM dongshanzaiqi WHERE userId = userIdx;
			IF @dtimex THEN
				/*已经有该用户数据,验证*/
				IF TO_DAYS(@dtimex)=TO_DAYS(NOW()) THEN
					IF @dcountx < @maxcount THEN
						UPDATE dongshanzaiqi SET dcount=dcount+1 WHERE userId = userIdx;
						SET @k = @dcountx + 1;
					ELSE
						/*次数已经使用完成*/
						SET @k = 0;
					END IF;
				ELSE
					/*已经不是同一天*/
					UPDATE dongshanzaiqi SET dtime=NOW(),dcount=1 WHERE userId = userIdx;
					SET @k = 1;
				END IF;
			ELSE
				/*先创建*/
				INSERT INTO dongshanzaiqi(userId,dcount) VALUES(userIdx,1);
				SET @k = 1;
			END IF;
		ELSE
			/*断线列表中*/
			SET @k = 0;
		END IF;
	else
		SET @k = 0;
	end if;
	
	SELECT @k AS 'k';
    END */$$
DELIMITER ;

/* Procedure structure for procedure `LoginaddTempScore` */

/*!50003 DROP PROCEDURE IF EXISTS  `LoginaddTempScore` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `LoginaddTempScore`(userIdx INT(11))
BEGIN
	SELECT * FROM tempAddScore WHERE userId=userIdx;
	delete from tempAddScore where userId=userIdx;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `LoginByPhone` */

/*!50003 DROP PROCEDURE IF EXISTS  `LoginByPhone` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `LoginByPhone`(phoneNox VARCHAR(50),passwordx VARCHAR(50),flag BOOL)
BEGIN
	SELECT * FROM newuseraccounts WHERE phoneNo=phoneNox AND PASSWORD=passwordx;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `passwordLogin` */

/*!50003 DROP PROCEDURE IF EXISTS  `passwordLogin` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `passwordLogin`(accountx VARCHAR(50),passwordx VARCHAR(50))
BEGIN
	SELECT * FROM newuseraccounts WHERE Account=accountx AND PASSWORD=passwordx;
    END */$$
DELIMITER ;

/* Procedure structure for procedure `tempaddscore` */

/*!50003 DROP PROCEDURE IF EXISTS  `tempaddscore` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `tempaddscore`(useridx int(11),scorex INT(20),typex int(3))
BEGIN
	INSERT tempaddscore(userId,score,change_type) VALUE(useridx,scorex,typex);
    END */$$
DELIMITER ;

/* Procedure structure for procedure `useLoginCode` */

/*!50003 DROP PROCEDURE IF EXISTS  `useLoginCode` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `useLoginCode`(logincodex VARCHAR(40))
BEGIN
	SET @loginidx = 0;
	SET @timeL = "";
	SET @flag = 1;
	SET @k = 0;
	SET @scorex = 0;
	SET @userIdx = 0;
	SET @dtimex = "";
	SET @dcountx = 0;
	
	SET @maxcount = 2;
	SET @addScore = 50;
	SELECT loginid,loginDate INTO @loginidx,@timeL FROM logintemp WHERE logincode = logincodex;
	SELECT TIMESTAMPDIFF(DAY,@timeL,NOW()) INTO @flag;
	IF @flag = 0 THEN
		SELECT score,Id INTO @scorex,@userIdx FROM newuseraccounts WHERE Id=@loginidx;
		/*登录码正确*/
		IF @scorex < 50 AND flagx THEN
			SET @zaixian = (SELECT COUNT(*) FROM lineout WHERE userId = @userIdx);
			IF @zaixian = 0 THEN
				/*满足东山再起的条件*/
				SELECT dtime,dcount INTO @dtimex,@dcountx FROM dongshanzaiqi WHERE userId = @loginidx;
				IF @dtimex THEN
					/*已经有该用户数据,验证*/
					IF TO_DAYS(@dtimex)=TO_DAYS(NOW()) THEN
						IF @dcountx < @maxcount THEN
							UPDATE dongshanzaiqi SET dcount=dcount+1 WHERE userId = @userIdx;
							SET @k = @dcountx + 1;
							UPDATE newuseraccounts SET score=score+@addScore WHERE Id = @userIdx;
						ELSE
							/*次数已经使用完成*/
							SET @k = 0;
						END IF;
					ELSE
						/*已经不是同一天*/
						UPDATE dongshanzaiqi SET dtime=NOW(),dcount=1 WHERE userId = @userIdx;
						SET @k = 1;
						UPDATE newuseraccounts SET score=score+@addScore WHERE Id = @userIdx;
					END IF;
				ELSE
					/*先创建*/
					INSERT INTO dongshanzaiqi(userId,dcount) VALUES(@userIdx,1);
					SET @k = 1;
					UPDATE newuseraccounts SET score=score+@addScore WHERE Id = @userIdx;
				END IF;
			ELSE
				/*断线列表中*/
				SET @k = 0;
			END IF;
		ELSE
			/*不满足东山再起的条件*/
			SET @k = 0;
		END IF;
		
		SELECT *,1 AS rcode,@k AS 'k' FROM newuseraccounts WHERE Id=@loginidx;
	ELSE
		SELECT 0 AS rcode;
	END IF;
    END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
