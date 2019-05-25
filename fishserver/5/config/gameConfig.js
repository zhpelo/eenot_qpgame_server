gameConfig = {};

gameConfig.gameId = 1;			//第几个游戏ID
gameConfig.serverId = 13102;		//当前游戏的第几台服务器
gameConfig.logflag = 13102;		//游戏记录表示
gameConfig.port = 13102;			//游戏记录表示
gameConfig.gameName = "捕鱼";


gameConfig.gameBet = 50;
gameConfig.controlBet = 0.99;
//子弹消耗活动
gameConfig.bulletActivity = false;
//每日获得金币签到活动
gameConfig.everyWinCoinActivity = true;
//等级
gameConfig.lvActivity = true;

//维护
gameConfig.maintainTime = 60;
gameConfig.maintain = false;
gameConfig.LoginServeSign = "slel3@lsl334xx,deka";
//比赛配置
gameConfig.isMatchRoom = false;
gameConfig.roomApplyCoin = 100;
gameConfig.randkingList = true;
gameConfig.randTime = 600;	//600秒


module.exports = gameConfig;