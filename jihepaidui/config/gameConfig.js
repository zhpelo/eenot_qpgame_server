gameConfig = {};
gameConfig.gameId = 41;
gameConfig.serverId = 4101;
gameConfig.logflag = 4101;		//游戏记录表示


//筹码
gameConfig.coinConfig = [10,100,1000,10000];
gameConfig.tax = 0.99;
gameConfig.upMin = 30000;
gameConfig.upMax = 3000000;
gameConfig.downTimeMax = 30;

gameConfig.autoDown = 10000;

gameConfig.gameState = {downTime:0,downTimeEnd:1,open:2,openEnd:3,sendCoin:4,noting:5};

gameConfig.seatMax = 30;
gameConfig.tableMax = 10;

gameConfig.LoginServeSign = "slel3@lsl334xx,deka";

gameConfig.maintain = false;
gameConfig.maintainTime = 120;

//子弹消耗活动
gameConfig.bulletActivity = false;
//每日获得金币签到活动
gameConfig.everyWinCoinActivity = true;
//等级
gameConfig.lvActivity = true;

//比赛配置
gameConfig.isMatchRoom = false;
gameConfig.roomApplyCoin = 100;
gameConfig.randkingList = true;
gameConfig.randTime = 600;	//600秒


module.exports = gameConfig;