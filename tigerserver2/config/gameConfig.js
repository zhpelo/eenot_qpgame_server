gameConfig = {};
gameConfig.gameId = 6;			//第几个游戏ID
gameConfig.serverId = 13601;		//当前游戏的第几台服务器
gameConfig.logflag = 13601;		//游戏记录表示
gameConfig.port = 13601;		//游戏记录表示
gameConfig.gameName = "连线机";


//筹码
gameConfig.coinConfig = [1,10,100,1000,10000];
gameConfig.tax = 0.99;

gameConfig.seatMax = 30;
gameConfig.tableMax = 10;

gameConfig.LoginServeSign = "slel3@lsl334xx,deka";


//每日获得金币签到活动
gameConfig.everyWinCoinActivity = true;
//等级
gameConfig.lvActivity = true;


module.exports = gameConfig;